---
title: "Memory Management"
order: 13
summary: "What an agent remembers between sessions, and how it stores and recalls it."
category: "Building Claude Code From Scratch"
level: Intermediate
---

# Memory Management

Context is short-term; memory is what survives the session. This module adds persistent memory to the agent.

**Course milestone:** Building Claude Code From Scratch

## Memory

> **Source:** [Memory](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s09_memory) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → ... → s07 → s08 → `s09` → [s10](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s10_task_system) → s11 → ... → s16 → s17
> *"Keep information that later tasks will need."* File storage + an index + relevance selection + on-demand recall.
>
> **Harness layer**: Memory stores reusable knowledge outside the conversation and recalls it for related tasks.

---

### The Problem

An Agent starts a new session without the previous conversation in `messages`. A coding preference, project fact, or debugging clue from an earlier session may still matter. Without persistent storage, the user has to provide it again.

A complete transcript works as an archive, but sending it with every request does not scale. The conversation keeps growing, useful information becomes hard to locate, and old facts may no longer be true. Memory must decide what is worth keeping across sessions and which records belong in the current task.

![Memory Overview](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s09_memory/images/memory-overview.en.svg)

---

### Why Not Put Everything in the System Prompt?

The direct approach is to write preferences and project facts into one file, then put the entire file in the system prompt. It remembers the information, but every LLM call must resend all of it. As the store grows, more unrelated material consumes input tokens and context space.

s07 showed a better reading pattern: keep a short index available and load full content only when needed. Skills are human-authored and read-only. Memory lets the Agent extract information from conversation and reuse it in later work.

This chapter therefore needs four parts: storage, recall, extraction, and consolidation.

![Memory Subsystems](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s09_memory/images/memory-subsystems.en.svg)

---

### Storage: One File per Record

Each memory is a Markdown file under `.memory/`. YAML frontmatter stores its `name`, `description`, and `type`:

```markdown
---
name: user-preference-tabs
description: User prefers tabs for indentation
type: user
---

User prefers using tabs, not spaces, for indentation.
```

There are four memory types:

| Type | What it stores | Example |
|------|----------------|---------|
| user | A durable user preference | "Use tabs for indentation" |
| feedback | Guidance that remains useful | "Do not mock the database" |
| project | A stable project fact | "The authentication rewrite is compliance-driven" |
| reference | An external pointer or lookup clue | "The pipeline issue is tracked in Linear INGEST" |

`MEMORY.md` is the index, with one line per memory file. After a write, `rebuild_memory_index()` regenerates it from the files:

```python
def write_memory_file(name, mem_type, description, body):
    path = MEMORY_DIR / f"{memory_slug(name)}.md"
    path.write_text(
        memory_document(name, mem_type, description, body), encoding="utf-8"
    )
    rebuild_memory_index()
    return path
```

The index supports selection while full content stays in the individual files.

---

### Recall: Select First, Then Load Full Records

At the start of a user request, `select_relevant_memories()` sends the recent user text and memory catalog to a lightweight model call. It selects at most five relevant records:

```python
prompt = (
    "Select memory records that are relevant to the current user request. "
    "Return only a JSON array of catalog indices, such as [0, 2]. "
    "Return [] when none are relevant."
)
```

If the model call or JSON parsing fails, the code falls back to keyword matching. Only after selection does `load_memories()` read the corresponding files, with a limit on the total recalled text.

```python
relevant_memories = load_memories(messages)
system = build_system(relevant_memories)
```

`build_system()` states that recalled content is background knowledge, not a new user command. The current request wins when it conflicts with memory. This lets the Agent use old information without letting old records issue instructions on the user's behalf.

---

### Extraction: Save Reusable Information After the Turn

Users do not always say "remember this." After the Agent finishes the current response, `extract_memories()` inspects the conversation and keeps only information likely to help later:

```python
tool_calls = [
    block for block in response.content if block.type == "tool_use"
]
if not tool_calls:
    force = trigger_hooks("Stop", messages)
    if force:
        messages.append({"role": "user", "content": force})
        continue
    if extract_memories(messages):
        consolidate_memories()
    return
```

The model returns candidates, not records that are automatically allowed onto disk. Each candidate carries a `scope`: only `persistent` means that the information should survive into later sessions. `current_task` covers one-off commands, temporary paths, and temporary restrictions.

`should_store_memory()` performs the final admission check. It rejects incomplete candidates, phrases that refer to the current session or task, and duplicates of existing records. For example, "do not create files in this session" constrains the current work; it must not remain active in the next session.

---

### Consolidation: Merge Duplicate and Stale Records

As memory files accumulate, some become duplicate, contradictory, or stale. The teaching implementation calls `consolidate_memories()` after the store reaches ten records and asks the model for a cleaned list.

The code parses and validates the new list before replacing old files. It snapshots the current records first; if deletion or writing fails, it restores the originals and rebuilds the index:

```python
snapshot = {
    path.name: path.read_text(encoding="utf-8")
    for path in MEMORY_DIR.glob("*.md")
    if path.name != MEMORY_INDEX.name
}

try:
    for path in MEMORY_DIR.glob("*.md"):
        if path.name != MEMORY_INDEX.name:
            path.unlink()
    for record in consolidated:
        path = MEMORY_DIR / f"{memory_slug(record['name'])}.md"
        path.write_text(memory_document(
            record["name"], record["type"],
            record["description"], record["body"],
        ), encoding="utf-8")
    rebuild_memory_index()
except Exception:
    for path in MEMORY_DIR.glob("*.md"):
        if path.name != MEMORY_INDEX.name:
            path.unlink()
    for filename, content in snapshot.items():
        (MEMORY_DIR / filename).write_text(content, encoding="utf-8")
    rebuild_memory_index()
    raise
```

The course uses a simple count threshold. A real application must also choose a schedule that fits its data volume and prevent concurrent processes from rewriting the same store.

---

### This Lesson's Code

| Part | Implementation |
|------|----------------|
| Agent Loop | Keeps messages, tool calls, tool results, and hook trigger points |
| Base tools | `bash`, `read_file`, `write_file`, `edit_file`, `glob` |
| Storage | `.memory/MEMORY.md` index + `.memory/*.md` records |
| Recall | Catalog selection + keyword fallback + a body-size limit |
| Writing | End-of-turn extraction + persistence checks + duplicate filtering |
| Consolidation | Merge at the threshold; restore old files after replacement failure |

> **Boundary with s08:** s08 manages the active session's context budget. s09 manages reusable knowledge outside the conversation. Memory is selective storage, not a lossless transcript backup, and it does not replace context compaction.

---

### Try It

```sh
cd learn-claude-code
python s09_memory/code.py
```

1. Enter `I prefer using tabs for indentation. Remember that.` After the turn, check that `.memory/` contains a new record and `MEMORY.md` contains its index entry.
2. Enter `q`, restart the program, and ask `What indentation style do I prefer?` Confirm that a new session can recall the preference.
3. Store another preference unrelated to code formatting, then ask about indentation. Observe that the current request loads only relevant records.
4. Enter `Do not create files in this session.` Confirm that this temporary requirement does not become a persistent rule for the next session.

Exact wording and extraction counts can vary by model. Check what was written to `.memory/` and whether a later session recalls only relevant information.

---

### What's Next

Memory preserves information across sessions, but a complex task also needs durable status and dependency tracking. A TODO kept only in the conversation cannot carry progress across process restarts.

s10 Task System → Persist tasks, statuses, and dependencies to disk.

<!-- translation-sync: zh@v3, en@v3, ja@v3 -->

### Full code

The complete implementation is 784 lines: [`s09_memory/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s09_memory/code.py).

## Agent memory

> **Source:** [Agent memory](https://github.com/microsoft/ai-agents-for-beginners/tree/HEAD/13-agent-memory) · [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners), MIT

When discussing the unique benefits of creating AI Agents, two things are mainly discussed: the ability to call tools to complete tasks and the ability to improve over time. Memory is at the foundation of creating self-improving agent that can create better experiences for our users.

In this lesson, we will look at what memory is for AI Agents and how we can manage it and use it for the benefit of our applications.

### Introduction

This lesson will cover:

• **Understanding AI Agent Memory**: What memory is and why it's essential for agents.

• **Implementing and Storing Memory**: Practical methods for adding memory capabilities to your AI agents, focusing on short-term and long-term memory.

• **Making AI Agents Self-Improving**: How memory enables agents to learn from past interactions and improve over time.

### Available Implementations

This lesson includes two comprehensive notebook tutorials:

• **[13-agent-memory.ipynb](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/13-agent-memory/13-agent-memory.ipynb)**: Implements memory using Mem0 and Azure AI Search with Microsoft Agent Framework

• **[13-agent-memory-cognee.ipynb](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/13-agent-memory/13-agent-memory-cognee.ipynb)**: Implements structured memory using Cognee, automatically building knowledge graph backed by embeddings, visualizing graph, and intelligent retrieval

### Learning Goals

After completing this lesson, you will know how to:

• **Differentiate between various types of AI agent memory**, including working, short-term, and long-term memory, as well as specialized forms like persona and episodic memory.

• **Implement and manage short-term and long-term memory for AI agents** using Microsoft Agent Framework, leveraging tools like Mem0, Cognee, Whiteboard memory, and integrating with Azure AI Search.

• **Understand the principles behind self-improving AI agents** and how robust memory management systems contribute to continuous learning and adaptation.

### Understanding AI Agent Memory

At its core, **memory for AI agents refers to the mechanisms that allow them to retain and recall information**. This information can be specific details about a conversation, user preferences, past actions, or even learned patterns.

Without memory, AI applications are often stateless, meaning each interaction starts from scratch. This leads to a repetitive and frustrating user experience where the agent "forgets" previous context or preferences.

#### Why is Memory Important?

an agent's intelligence is deeply tied to its ability to recall and utilize past information. Memory allows agents to be:

• **Reflective**: Learning from past actions and outcomes.

• **Interactive**: Maintaining context over an ongoing conversation.

• **Proactive and Reactive**: Anticipating needs or responding appropriately based on historical data.

• **Autonomous**: Operating more independently by drawing on stored knowledge.

The goal of implementing memory is to make agents more **reliable and capable**.

#### Types of Memory

##### Working Memory

Think of this as a piece of scratch paper an agent uses during a single, ongoing task or thought process. It holds immediate information needed to compute the next step.

For AI agents, working memory often captures the most relevant information from a conversation, even if the full chat history is long or truncated. It focuses on extracting key elements like requirements, proposals, decisions, and actions.

**Working Memory Example**

In a travel booking agent, working memory might capture the user's current request, such as "I want to book a trip to Paris". This specific requirement is held in the agent's immediate context to guide the current interaction.

##### Short Term Memory

This type of memory retains information for the duration of a single conversation or session. It's the context of the current chat, allowing the agent to refer back to previous turns in the dialogue.

In the [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) Python SDK samples, this maps to `AgentSession`, created with `agent.create_session()`. The session is the framework's built-in short-term memory: it keeps conversation context available while that same session is reused, but that context is not persisted when the session ends or the application restarts. Use long-term memory for facts and preferences that need to survive across sessions, typically through a database, vector index, or another persistent store.

**Short Term Memory Example**

If a user asks, "How much would a flight to Paris cost?" and then follows up with "What about accommodation there?", short-term memory ensures the agent knows "there" refers to "Paris" within the same conversation.

##### Long Term Memory

This is information that persists across multiple conversations or sessions. It allows agents to remember user preferences, historical interactions, or general knowledge over extended periods. This is important for personalization.

**Long Term Memory Example**

A long-term memory might store that "Ben enjoys skiing and outdoor activities, likes coffee with a mountain view, and wants to avoid advanced ski slopes due to a past injury". This information, learned from previous interactions, influences recommendations in future travel planning sessions, making them highly personalized.

##### Persona Memory

This specialized memory type helps an agent develop a consistent "personality" or "persona". It allows the agent to remember details about itself or its intended role, making interactions more fluid and focused.

**Persona Memory Example**
If the travel agent is designed to be an "expert ski planner," persona memory might reinforce this role, influencing its responses to align with an expert's tone and knowledge.

##### Workflow/Episodic Memory

This memory stores the sequence of steps an agent takes during a complex task, including successes and failures. It's like remembering specific "episodes" or past experiences to learn from them.

**Episodic Memory Example**

If the agent attempted to book a specific flight but it failed due to unavailability, episodic memory could record this failure, allowing the agent to try alternative flights or inform the user about the issue in a more informed way during a subsequent attempt.

##### Entity Memory

This involves extracting and remembering specific entities (like people, places, or things) and events from conversations. It allows the agent to build a structured understanding of key elements discussed.

**Entity Memory Example**

From a conversation about a past trip, the agent might extract "Paris," "Eiffel Tower," and "dinner at Le Chat Noir restaurant" as entities. In a future interaction, the agent could recall "Le Chat Noir" and offer to make a new reservation there.

##### Structured RAG (Retrieval Augmented Generation)

While RAG is a broader technique, "Structured RAG" is highlighted as a powerful memory technology. It extracts dense, structured information from various sources (conversations, emails, images) and uses it to enhance precision, recall, and speed in responses. Unlike classic RAG that relies solely on semantic similarity, Structured RAG works with the inherent structure of information.

**Structured RAG Example**

Instead of just matching keywords, Structured RAG could parse flight details (destination, date, time, airline) from an email and store them in a structured way. This allows precise queries like "What flight did I book to Paris on Tuesday?"

### Implementing and Storing Memory

Implementing memory for AI agents involves a systematic process of **memory management**, which includes generating, storing, retrieving, integrating, updating, and even "forgetting" (or deleting) information. Retrieval is a particularly crucial aspect.

#### Specialized Memory Tools

##### Mem0

One way to store and manage agent memory is using specialized tools like Mem0. Mem0 works as a persistent memory layer, allowing agents to recall relevant interactions, store user preferences and factual context, and learn from successes and failures over time. The idea here is that stateless agents turn into stateful ones.

It works through a **two-phase memory pipeline: extraction and update**. First, messages added to an agent's thread are sent to the Mem0 service, which uses a Large Language Model (LLM) to summarize conversation history and extract new memories. Subsequently, an LLM-driven update phase determines whether to add, modify, or delete these memories, storing them in a hybrid data store that can include vector, graph, and key-value databases. This system also supports various memory types and can incorporate graph memory for managing relationships between entities.

##### Cognee

Another powerful approach is using **Cognee**, an open-source semantic memory for AI agents that transforms structured and unstructured data into queryable knowledge graphs backed by embeddings. Cognee provides a **dual-store architecture** combining vector similarity search with graph relationships, enabling agents to understand not just what information is similar, but how concepts relate to each other.

It excels at **hybrid retrieval** that blends vector similarity, graph structure, and LLM reasoning - from raw chunk lookup to graph-aware question answering. The system maintains **living memory** that evolves and grows while remaining queryable as one connected graph, supporting both short-term session context and long-term persistent memory.

The Cognee notebook tutorial ([13-agent-memory-cognee.ipynb](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/13-agent-memory/13-agent-memory-cognee.ipynb)) demonstrates building this unified memory layer, with practical examples of ingesting diverse data sources, visualizing the knowledge graph, and querying with different search strategies tailored to specific agent needs.

#### Storing Memory with RAG

Beyond specialized memory tools like Mem0, you can leverage robust search services like **Azure AI Search as a backend for storing and retrieving memories**, especially for structured RAG.

This allows you to ground your agent's responses with your own data, ensuring more relevant and accurate answers. Azure AI Search can be used to store user-specific travel memories, product catalogs, or any other domain-specific knowledge.

Azure AI Search supports capabilities like **Structured RAG**, which excels at extracting and retrieving dense, structured information from large datasets like conversation histories, emails, or even images. This provides "superhuman precision and recall" compared to traditional text chunking and embedding approaches.

### Making AI Agents Self-Improve

A common pattern for self-improving agents involves introducing a **"knowledge agent"**. This separate agent observes the main conversation between the user and the primary agent. Its role is to:

1. **Identify valuable information**: Determine if any part of the conversation is worth saving as general knowledge or a specific user preference.

2. **Extract and summarize**: Distill the essential learning or preference from the conversation.

3. **Store in a knowledge base**: Persist this extracted information, often in a vector database, so it can be retrieved later.

4. **Augment future queries**: When the user initiates a new query, the knowledge agent retrieves relevant stored information and appends it to the user's prompt, providing crucial context to the primary agent (similar to RAG).

#### Optimizations for Memory

• **Latency Management**: To avoid slowing down user interactions, a cheaper, faster model can be used initially to quickly check if information is valuable to store or retrieve, only invoking the more complex extraction/retrieval process when necessary.

• **Knowledge Base Maintenance**: For a growing knowledge base, less frequently used information can be moved to "cold storage" to manage costs.
