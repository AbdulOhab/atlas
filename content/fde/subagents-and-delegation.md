---
title: "Subagent Architecture & Delegation"
order: 4
summary: "Splitting work across agents: subagents with their own context, multi-agent design patterns, and teams that coordinate."
category: "Agentic Software Engineering"
level: Intermediate
---

# Subagent Architecture & Delegation

One agent with one huge context gets slow and confused. Delegating focused subtasks to subagents keeps each context small and lets work run in parallel.

**Course milestone:** Agentic Software Engineering

## Subagents

> **Source:** [Subagents](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s06_subagent) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → s02 → s03 → s04 → s05 → `s06` → [s07](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s07_skill_loading) → s08 → ... → s16 → s17

> A subagent starts with a fresh `messages[]`. Its final text returns to the parent; its intermediate conversation does not.
>
> **Harness Layer**: Delegation — Run a focused task in a separate conversation context.

---

### The Problem

The Agent is fixing a bug. It reads many files to trace the call chain, and every tool call and result stays in the parent's `messages[]`. Once the call chain is understood, most of those intermediate details are no longer needed, but they still occupy context.

---

### The Solution

![Subagent Overview](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s06_subagent/images/subagent-overview.en.svg)

Calling `task` synchronously runs a nested agent loop with a fresh `messages[]`. When that loop finishes, its final text becomes the tool result in the parent conversation.

This is message isolation, not process or filesystem isolation. Parent and subagent run in the same Python process and share `WORKDIR`, so writes and commands still affect the same workspace. The subagent has the five base tools but no `task`, and its tool calls use the same permission and lifecycle hooks as the parent.

---

### How It Works

**run_subagent** creates the fresh message list, runs the nested loop, and returns the final text:

```python
SUB_TOOLS = list(BASE_TOOLS)  # no task tool

def run_subagent(prompt: str) -> str:
    messages = [{"role": "user", "content": prompt}]

    for _ in range(30):
        response = client.messages.create(
            model=MODEL, system=SUB_SYSTEM,
            messages=messages, tools=SUB_TOOLS, max_tokens=8000,
        )
        messages.append({"role": "assistant", "content": response.content})
        tool_calls = [
            block for block in response.content if block.type == "tool_use"
        ]
        if not tool_calls:
            return extract_text(response.content) or "(no summary)"

        results = []
        for block in tool_calls:
            output = execute_tool(block, SUB_HANDLERS)
            results.append({... "content": output})
        messages.append({"role": "user", "content": results})

    return "Subagent stopped after 30 turns without a final answer."
```

The main Agent calls it just like any other tool:

```python
TASK_TOOL = {
    "name": "task",
    "description": "Run a subagent with fresh conversation context and return its final text.",
    "input_schema": {
        "type": "object",
        "properties": {"prompt": {"type": "string"}},
        "required": ["prompt"],
    },
}

TOOLS = [*BASE_TOOLS, TASK_TOOL]
TOOL_HANDLERS = {**BASE_HANDLERS, "task": run_subagent}
```

The boundary is:

| Decision | Choice | Reason |
|----------|--------|--------|
| Conversation | Fresh `messages[]` | Parent history is not copied into the subagent |
| Execution | Same process and `WORKDIR` | Filesystem changes remain visible to both loops |
| Return value | Final text only | Child tool calls and results are not copied into parent messages |
| Delegation depth | No `task` in `SUB_TOOLS` | This lesson permits one delegation level |
| Tool policy | Shared Hooks | Parent and subagent use the same permission checks |

The parent dispatches `task` through the same handler map as its other tools. The subagent uses `SUB_SYSTEM`, `SUB_TOOLS`, and its own local `messages` list.

---

### Try It

```sh
cd learn-claude-code
python s06_subagent/code.py
```

Try these prompts:

1. `Use a subtask to find what testing framework this project uses` (sub-Agent reads files, main Agent receives only the conclusion)
2. `Delegate: read all .py files in agents/ and summarize what each one does`
3. `Use a task to create s06_subagent/example/string_tools.py with a slugify(text: str) function, then verify it from the parent agent`

What to watch for: Do `[Subagent started]` / `[Subagent done]` appear? Do subagent tool calls print as `[sub] ...`? Does the parent continue with only the final text returned by `task`?

---

### What's Next

The Agent can now break tasks apart. But different tasks require different knowledge: editing frontend components needs React conventions, writing SQL needs table schemas. Stuffing all this knowledge into the system prompt would blow up the context.

→ s07 Skill Loading: Inject skills on demand instead of piling documents into the system prompt. Load only when needed, as natural as reading a file.

<!-- translation-sync: zh@v2, en@v2, ja@v2 -->

### Full code

The complete implementation is 383 lines: [`s06_subagent/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s06_subagent/code.py).

## Multi-agent design patterns

> **Source:** [Multi-agent design patterns](https://github.com/microsoft/ai-agents-for-beginners/tree/HEAD/08-multi-agent) · [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners), MIT

As soon as you start working on a project that involves multiple agents, you will need to consider the multi-agent design pattern. However, it might not be immediately clear when to switch to multi-agents and what the advantages are.

### Introduction

In this lesson, we're looking to answer the following questions:

- What are the scenarios where multi-agents are applicable to?
- What are the advantages of using multi-agents over just one singular agent doing multiple tasks?
- What are the building blocks of implementing the multi-agent design pattern?
- How do we have visibility to how the multiple agents are interacting with each other?

### Learning Goals

After this lesson, you should be able to:

- Identify scenarios where multi-agents are applicable
- Recognize the advantages of using multi-agents over a singular agent.
- Comprehend the building blocks of implementing the multi-agent design pattern.

What's the bigger picture?

*Multi agents are a design pattern that allows multiple agents to work together to achieve a common goal*.

This pattern is widely used in various fields, including robotics, autonomous systems, and distributed computing.

### Scenarios Where Multi-Agents Are Applicable

So what scenarios are a good use case for using multi-agents? The answer is that there are many scenarios where employing multiple agents is beneficial especially in the following cases:

- **Large workloads**: Large workloads can be divided into smaller tasks and assigned to different agents, allowing for parallel processing and faster completion. An example of this is in the case of a large data processing task.
- **Complex tasks**: Complex tasks, like large workloads, can be broken down into smaller subtasks and assigned to different agents, each specializing in a specific aspect of the task. A good example of this is in the case of autonomous vehicles where different agents manage navigation, obstacle detection, and communication with other vehicles.
- **Diverse expertise**: Different agents can have diverse expertise, allowing them to handle different aspects of a task more effectively than a single agent. For this case, a good example is in the case of healthcare where agents can manage diagnostics, treatment plans, and patient monitoring.

### Advantages of Using Multi-Agents Over a Singular Agent

A single agent system could work well for simple tasks, but for more complex tasks, using multiple agents can provide several advantages:

- **Specialization**: Each agent can be specialized for a specific task. Lack of specialization in a single agent means you have an agent that can do everything but might get confused on what to do when faced with a complex task. It might for example end up doing a task that it is not best suited for.
- **Scalability**: It is easier to scale systems by adding more agents rather than overloading a single agent.
- **Fault Tolerance**: If one agent fails, others can continue functioning, ensuring system reliability.

Let's take an example, let's book a trip for a user. A single agent system would have to handle all aspects of the trip booking process, from finding flights to booking hotels and rental cars. To achieve this with a single agent, the agent would need to have tools for handling all these tasks. This could lead to a complex and monolithic system that is difficult to maintain and scale. A multi-agent system, on the other hand, could have different agents specialized in finding flights, booking hotels, and rental cars. This would make the system more modular, easier to maintain, and scalable.

Compare this to a travel bureau run as a mom-and-pop store versus a travel bureau run as a franchise. The mom-and-pop store would have a single agent handling all aspects of the trip booking process, while the franchise would have different agents handling different aspects of the trip booking process.

### Building Blocks of Implementing the Multi-Agent Design Pattern

Before you can implement the multi-agent design pattern, you need to understand the building blocks that make up the pattern.

Let's make this more concrete by again looking at the example of booking a trip for a user. In this case, the building blocks would include:

- **Agent Communication**: Agents for finding flights, booking hotels, and rental cars need to communicate and share information about the user's preferences and constraints. You need to decide on the protocols and methods for this communication. What this means concretely is that the agent for finding flights needs to communicate with the agent for booking hotels to ensure that the hotel is booked for the same dates as the flight. That means that the agents need to share information about the user's travel dates, meaning that you need to decide *which agents are sharing info and how they are sharing info*.
- **Coordination Mechanisms**: Agents need to coordinate their actions to ensure that the user's preferences and constraints are met. A user preference could be that they want a hotel close to the airport whereas a constraint could be that rental cars are only available at the airport. This means that the agent for booking hotels needs to coordinate with the agent for booking rental cars to ensure that the user's preferences and constraints are met. This means that you need to decide *how the agents are coordinating their actions*.
- **Agent Architecture**: Agents need to have the internal structure to make decisions and learn from their interactions with the user. This means that the agent for finding flights needs to have the internal structure to make decisions about which flights to recommend to the user. This means that you need to decide *how the agents are making decisions and learning from their interactions with the user*. Examples of how an agent learns and improves could be that the agent for finding flights could use a machine learning model to recommend flights to the user based on their past preferences.
- **Visibility into Multi-Agent Interactions**: You need to have visibility into how the multiple agents are interacting with each other. This means that you need to have tools and techniques for tracking agent activities and interactions. This could be in the form of logging and monitoring tools, visualization tools, and performance metrics.
- **Multi-Agent Patterns**: There are different patterns for implementing multi-agent systems, such as centralized, decentralized, and hybrid architectures. You need to decide on the pattern that best fits your use case.
- **Human in the loop**: In most cases, you will have a human in the loop and you need to instruct the agents when to ask for human intervention. This could be in the form of a user asking for a specific hotel or flight that the agents have not recommended or asking for confirmation before booking a flight or hotel.

### Visibility into Multi-Agent Interactions

It's important that you have visibility into how the multiple agents are interacting with each other. This visibility is essential for debugging, optimizing, and ensuring the overall system's effectiveness. To achieve this, you need to have tools and techniques for tracking agent activities and interactions. This could be in the form of logging and monitoring tools, visualization tools, and performance metrics.

For example, in the case of booking a trip for a user, you could have a dashboard that shows the status of each agent, the user's preferences and constraints, and the interactions between agents. This dashboard could show the user's travel dates, the flights recommended by the flight agent, the hotels recommended by the hotel agent, and the rental cars recommended by the rental car agent. This would give you a clear view of how the agents are interacting with each other and whether the user's preferences and constraints are being met.

Let's look at each of these aspects more in detail.

- **Logging and Monitoring Tools**: You want to have logging done for each action taken by an agent. A log entry could store information on the agent that took the action, the action taken, the time the action was taken, and the outcome of the action. This information can then be used for debugging, optimizing and more.

- **Visualization Tools**: Visualization tools can help you see the interactions between agents in a more intuitive way. For example, you could have a graph that shows the flow of information between agents. This could help you identify bottlenecks, inefficiencies, and other issues in the system.

- **Performance Metrics**: Performance metrics can help you track the effectiveness of the multi-agent system. For example, you could track the time taken to complete a task, the number of tasks completed per unit of time, and the accuracy of the recommendations made by the agents. This information can help you identify areas for improvement and optimize the system.

### Multi-Agent Patterns

Let's dive into some concrete patterns we can use to create multi-agent apps. Here are some interesting patterns worth considering:

#### Group chat

This pattern is useful when you want to create a group chat application where multiple agents can communicate with each other. Typical use cases for this pattern include team collaboration, customer support, and social networking.

In this pattern, each agent represents a user in the group chat, and messages are exchanged between agents using a messaging protocol. The agents can send messages to the group chat, receive messages from the group chat, and respond to messages from other agents.

This pattern can be implemented using a centralized architecture where all messages are routed through a central server, or a decentralized architecture where messages are exchanged directly.

![Group chat](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/08-multi-agent/images/multi-agent-group-chat.png)

#### Hand-off

This pattern is useful when you want to create an application where multiple agents can hand off tasks to each other.

Typical use cases for this pattern include customer support, task management, and workflow automation.

In this pattern, each agent represents a task or a step in a workflow, and agents can hand off tasks to other agents based on predefined rules.

![Hand off](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/08-multi-agent/images/multi-agent-hand-off.png)

#### Collaborative filtering

This pattern is useful when you want to create an application where multiple agents can collaborate to make recommendations to users.

Why you would want multiple agents to collaborate is because each agent can have different expertise and can contribute to the recommendation process in different ways.

Let's take an example where a user wants a recommendation on the best stock to buy on the stock market.

- **Industry expert**:. One agent could be an expert in a specific industry.
- **Technical analysis**: Another agent could be an expert in technical analysis.
- **Fundamental analysis**: and another agent could be an expert in fundamental analysis. By collaborating, these agents can provide a more comprehensive recommendation to the user.

![Recommendation](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/08-multi-agent/images/multi-agent-filtering.png)

### Scenario: Refund process

Consider a scenario where a customer is trying to get a refund for a product, there can be quite a few agents involved in this process but let's divide it up between agents specific for this process and general agents that can be used in other processes.

**Agents specific for the refund process**:

Following are some agents that could be involved in the refund process:

- **Customer agent**: This agent represents the customer and is responsible for initiating the refund process.
- **Seller agent**: This agent represents the seller and is responsible for processing the refund.
- **Payment agent**: This agent represents the payment process and is responsible for refunding the customer's payment.
- **Resolution agent**: This agent represents the resolution process and is responsible for resolving any issues that arise during the refund process.
- **Compliance agent**: This agent represents the compliance process and is responsible for ensuring that the refund process complies with regulations and policies.

**General agents**:

These agents can be used by other parts of your business.

- **Shipping agent**: This agent represents the shipping process and is responsible for shipping the product back to the seller. This agent can be used both for the refund process and for general shipping of a product via a purchase for example.
- **Feedback agent**: This agent represents the feedback process and is responsible for collecting feedback from the customer. Feedback could be had at any time and not just during the refund process.
- **Escalation agent**: This agent represents the escalation process and is responsible for escalating issues to a higher level of support. You can use this type of agent for any process where you need to escalate an issue.
- **Notification agent**: This agent represents the notification process and is responsible for sending notifications to the customer at various stages of the refund process.
- **Analytics agent**: This agent represents the analytics process and is responsible for analyzing data related to the refund process.
- **Audit agent**: This agent represents the audit process and is responsible for auditing the refund process to ensure that it is being carried out correctly.
- **Reporting agent**: This agent represents the reporting process and is responsible for generating reports on the refund process.
- **Knowledge agent**: This agent represents the knowledge process and is responsible for maintaining a knowledge base of information related to the refund process. This agent could be knowledgeable both on refunds and other parts of your business.
- **Security agent**: This agent represents the security process and is responsible for ensuring the security of the refund process.
- **Quality agent**: This agent represents the quality process and is responsible for ensuring the quality of the refund process.

There's quite a few agents listed previously both for the specific refund process but also for the general agents that can be used in other parts of your business. Hopefully this gives you an idea on how you can decide on which agents to use in your multi-agent system.

### Assignment

Design a multi-agent system for a customer support process. Identify the agents involved in the process, their roles and responsibilities, and how they interact with each other. Consider both agents specific to the customer support process and general agents that can be used in other parts of your business.

> Have a think before you read the following solution, you may need more agents than you think.

> TIP: Think about the different stages of the customer support process and also consider agents needed for any system.

### Solution

[Solution](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/08-multi-agent/solution/solution.md)

### Knowledge checks

#### Question 1

Which scenario is the strongest fit for a multi-agent system?

- [ ] A1: A support bot answers common questions using one knowledge base and a small set of tools.
- [ ] A2: A refund workflow needs separate fraud, payment, and compliance roles, each with its own tools, and their results must be coordinated.
- [ ] A3: The same simple classification request arrives thousands of times per hour.

#### Question 2

When is a single agent usually the better choice?

- [ ] A1: The task can be handled with one set of instructions and tools, without specialist handoffs.
- [ ] A2: The agent has access to more than one tool.
- [ ] A3: The workflow requires separate roles with different permissions and independent audit trails.

[Solution quiz](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/08-multi-agent/solution/solution-quiz.md)

### Summary

In this lesson, we've looked at the multi-agent design pattern, including the scenarios where multi-agents are applicable, the advantages of using multi-agents over a singular agent, the building blocks of implementing the multi-agent design pattern, and how to have visibility into how the multiple agents are interacting with each other.

## Agent teams

> **Source:** [Agent teams](https://github.com/shareAI-lab/learn-claude-code/tree/HEAD/s13_agent_teams) · [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code), MIT

s01 → ... → [s10](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s10_task_system) → `s13` → [s14](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s14_mcp_plugin) → s15 → s16 → s17

> *"When one agent cannot hold the whole job, let teammates divide the work."* — Persistent teammates, shared task selection, optional worktrees, and coordination protocols.
>
> **Harness layer**: Team — how multiple agents divide work, share state, and stay under Lead's control.

---

### The Problem

Suppose we ask an agent to refactor an entire backend. The work may cover configuration loading, authentication, and tests. One agent can process those areas sequentially, but it takes longer and earlier details gradually leave its context.

This is a good candidate for parallel work, yet users normally describe the goal rather than design the team:

```text
Refactor this sample backend. Clean up configuration loading,
authentication, and tests, preserve the existing interfaces,
and make sure the tests pass.
```

The harness has to answer a connected set of questions:

1. Who decides that parallel work is useful, and who confirms the extra agents?
2. How does each teammate keep its identity and context across assignments?
3. How do results return to Lead without asking the model to poll an inbox?
4. Can an idle teammate pick up ready work without waiting for another assignment?
5. Which directory should a task use when parallel edits may conflict?
6. How do shutdown and plan approval become traceable, enforceable protocols?

---

### The Solution

![Agent Teams Overview](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s13_agent_teams/images/agent-teams-overview.en.svg)

s13 reuses s10's base tools, hooks, permission checks, and Task System, then adds a Lead-managed team runtime:

- **Lead** owns the user conversation, proposes a division of work, and waits for confirmation.
- **Teammates** run independent agent loops and alternate between WORK and IDLE.
- **MessageBus** carries ordinary messages, results, and control events through file-backed mailboxes.
- **Runtime delivery** consumes Lead's mailbox and injects team events into the next turn.
- **The shared task board** lets idle teammates find ready work and claim it under a lock.
- **Optional worktrees** bind a task to another working directory when the work needs it. Unbound tasks use the normal repository directory.
- **Typed protocols and a plan gate** make shutdown and approval state explicit and block mutating tools until a required plan is approved.

Task graph authoring keeps s10's two-phase contract. The Lead first calls `create_task` for every node, then uses the returned runtime IDs with `update_task(addBlockedBy=...)` before assigning ready work. Only the Lead receives `update_task`; teammates can list, claim, and complete tasks but cannot rewrite graph structure while the team is running.

s11 background tasks and s12 scheduled tasks are not carried into this chapter. Neither mechanism is required for teammate communication, task claiming, or plan approval.

These are all parts of the Team harness layer. Teammates do not need a separate loop for task discovery, and a worktree does not create a new kind of agent.

---

### How It Works

#### 1. Lead proposes a team and waits for user confirmation

Starting teammates changes cost, concurrency, and the set of actors that may edit the workspace. Lead's system prompt keeps that boundary visible:

```python
"When parallel work would help, first propose a small team with clear "
"responsibilities and wait for the user's confirmation. Do not call "
"spawn_teammate before the user confirms."
```

For the first request, Lead only proposes a split:

```text
I suggest three parallel areas:
- config: clean up configuration loading
- auth: refactor authentication
- tests: add regression coverage

I will start the teammates after you confirm.
```

After the user says "Go ahead," Lead can call `spawn_teammate`. Lead creates the Task first and passes its initial `task_id` to the teammate. The user states the goal, Lead designs the team, and the user confirms the execution boundary.

#### 2. Every teammate owns an independent loop

An s06 subagent is a one-shot call. A teammate is a persistent execution unit:

| | s06 Subagent | s13 Teammate |
|---|---|---|
| Lifecycle | Ends after one call | `WORK → IDLE → WORK` until shutdown |
| Context | Exists for one task | Persists across assignments |
| Communication | Returns one result | Receives messages and emits events |
| Coordination | One-way delegation | Two-way collaboration with Lead |

`TeammateRuntime` gives each teammate its own system prompt, messages, tools, and current Task, then runs its WORK / IDLE loop in a daemon thread. Lead can keep coordinating while teammates work. The names `lead` and `agent` are reserved for runtime identities, while `MessageBus` still accepts `lead` as the coordinator mailbox.

`spawn_teammate` claims the initial Task before the thread starts. A failed claim prevents the teammate from starting. Without a Task, workspace and Shell tools ask the teammate to claim one instead of falling back to the repository directory.

#### 3. MessageBus keeps communication outside model context

Lead and teammates cannot share one messages array. Otherwise one teammate's tool results would leak into another teammate's reasoning. `MessageBus` gives each agent a `.mailboxes/<name>.jsonl` inbox:

```python
class MessageBus:
    def send(self, from_agent, to_agent, content,
             msg_type="message", metadata=None):
        msg = {
            "from": from_agent,
            "to": to_agent,
            "content": content,
            "type": msg_type,
            "metadata": metadata or {},
        }
        with self._changed:
            MAILBOX_DIR.mkdir(parents=True, exist_ok=True)
            with self._path(to_agent).open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(msg, ensure_ascii=True) + "\n")
            self._changed.notify_all()

    def wait_for_messages(self, agent, timeout=None):
        deadline = None if timeout is None else time.monotonic() + timeout
        with self._changed:
            while not self.peek(agent):
                remaining = (None if deadline is None
                             else deadline - time.monotonic())
                if remaining is not None and remaining <= 0:
                    return []
                self._changed.wait(remaining)
            return self._read_unlocked(agent)
```

A lock protects mailbox files from concurrent access. A `Condition` lets the runtime wake a teammate for a message and also supports the short timeout used while IDLE.

#### 4. The runtime delivers inbox events

`read_inbox()` consumes messages by reading and deleting the mailbox file, so Lead keeps a single consumer, `consume_lead_inbox()`:

```python
def consume_lead_inbox():
    messages = BUS.read_inbox("lead")
    for message in messages:
        if message["type"].endswith("_response"):
            match_response(...)
    return messages
```

The CLI loop waits for terminal input and Lead's mailbox at the same time. When a message arrives, it consumes the mailbox before starting another Lead turn:

```text
MessageBus → consume_lead_inbox
           → update protocol state
           → inject [Team events] into history
           → start another Lead turn
```

After spawning a teammate, Lead ends the current turn instead of repeatedly calling `list_teammates` or `get_task`. The runtime starts the next turn when a team event arrives.

`check_inbox` is not a model tool. Message arrival belongs to the runtime; the model handles events after the runtime has delivered them into its context.

#### 5. Result and IDLE are separate events

When a teammate finishes one assignment, the runtime sends two events in order:

```text
result:            "Authentication refactored; related tests pass."
idle_notification: "Waiting for more work."
```

`result` answers "What did this assignment produce?" `idle_notification` answers "Can this teammate accept more work?" One vague "done" cannot represent both facts.

An idle teammate does not exit. A direct message or a ready task returns it to WORK; a `shutdown_request` starts a graceful shutdown handshake.

#### 6. IDLE checks the mailbox before looking for ready tasks

IDLE gives messages priority, then checks the shared task board:

```python
while True:
    inbox = BUS.wait_for_messages(name, IDLE_SCAN_INTERVAL)
    if inbox:
        should_stop = handle_messages(inbox)
        if should_stop or messages[-1]["role"] == "user":
            break
        continue

    task = claim_next_task(name)
    if task:
        messages.append({
            "role": "user",
            "content": f"[Auto-claimed task {task.id}] {task.subject}",
        })
        break
```

Shutdown, plan approval, and direct instructions from Lead should arrive before opportunistic work. If there is no message and no ready task, the teammate remains IDLE. A blocked task may become ready after another teammate completes its prerequisite.

#### 7. Discovery and claim are separate, and claim is atomic

Scanning only finds candidates:

```python
def scan_unclaimed_tasks() -> list[Task]:
    return [
        task for task in list_tasks()
        if task.status == "pending"
        and task.owner is None
        and can_start(task.id)
    ]
```

The list is a snapshot. Another teammate, or another harness process using the same task directory, may see the same task. Ownership changes therefore happen inside `claim_task()` under `task_store_lock()`, which combines the in-process lock with a file lock:

```python
def claim_task(task_id: str, owner: str) -> str:
    with task_store_lock():
        task = load_task(task_id)
        if task.status != "pending" or task.owner is not None:
            return "Task is no longer available"
        if _owner_in_progress(owner):
            return "Owner must complete its current task first"
        if not can_start(task_id):
            return "Task is blocked"
        cwd, error = task_worktree_cwd(task)
        if error:
            return f"Cannot claim {task_id}: {error}"
        task.owner = owner
        task.status = "in_progress"
        save_task(task)
        teammate_assignments[owner] = {"task_id": task.id, "cwd": cwd}
        return f"Claimed {task.id}"
```

Many teammates may discover the same candidate, but only one claim can move it to `in_progress`. Task files are written through a temporary file and atomically replaced while the same store lock is held. A teammate must also finish its current task before claiming another, and a broken worktree binding fails closed rather than falling back to the repository directory.

#### 8. Claimed work reuses the same WORK loop

After a successful claim, the runtime injects the task ID, subject, and description into the teammate's messages:

```text
ready task appears
  → IDLE teammate discovers it
  → claim_task writes owner and in_progress
  → task enters teammate messages
  → WORK
  → complete_task
  → result + idle_notification
  → IDLE
```

The teammate uses the same model call, file tools, Shell, plan gate, result reporting, and shutdown protocol as a direct Lead assignment. Task discovery is another entry into the existing WORK loop.

#### 9. The task selects the tools' working directory

`Task.worktree` is optional:

```python
@dataclass
class Task:
    id: str
    subject: str
    description: str
    status: str
    owner: str | None
    blockedBy: list[str]
    worktree: str | None = None
```

Lead can create and bind a worktree when separate directories will help:

```python
create_worktree(name="auth-refactor", task_id="task_1a2b3c4d")
```

`create_worktree` is a Lead-only tool. It accepts a pending, unowned, unbound task, validates the name, path, branch, and Git registry, creates the checkout, then writes the task binding. If Git reports failure after leaving a branch or registered checkout, the runtime reports a partial operation, leaves the task unbound, and preserves those artifacts for manual recovery. Teammates only see task and file tools.

Claiming the task stores its resolved directory in `teammate_assignments`; that teammate's `bash`, `read_file`, `write_file`, `edit_file`, and `glob` wrappers read the directory from the assignment. A task with no worktree resolves to `WORKDIR`; a teammate without a claimed Task cannot use those workspace tools:

```python
cwd, error = task_worktree_cwd(task)
if not error:
    teammate_assignments[owner] = {
        "task_id": task.id,
        "cwd": cwd,
    }
```

`complete_task(task_id, owner)` checks that the caller owns the in-progress task. Successful completion records the result but keeps the assignment directory selected until that model turn ends. This lets later tool calls in the same response stay in the task's worktree. The runtime releases the assignment when the teammate returns to IDLE; a failed completion keeps it so the teammate can fix the task and try again.

After a restart, `assignment_cwd()` can rebuild an in-progress assignment from the durable task owner and worktree binding. It also replaces a stale local lease when the same owner has moved to another task. A missing or invalid binding fails closed instead of silently routing work to the repository directory.

> A worktree separates Git working directories and branches. It is not a sandbox: Shell commands can still access paths and resources allowed to the parent process.

#### 10. Worktree removal belongs to the host

The model can create a task-bound worktree, but it cannot remove one. Cleanup remains a host helper so the user or host can first inspect task ownership, the assignment lease, and Git status. The helper refuses pending or in-progress task bindings and current-turn leases. Without an explicit destructive choice, tracked, untracked, and ignored files all block removal.

`remove_worktree(name, discard_changes=True)` is reserved for host code that has already obtained explicit user confirmation. Either removal path retains the `wt/<name>` branch, including clean local commits with no upstream. A successful removal clears the task binding because the checkout no longer exists.

```text
clean worktree   → host may remove directory and retain wt/<name> branch
changed worktree → user decides how to preserve or discard it
pending/running task → refuse removal
```

Task completion also stays separate from worktree cleanup. `complete_task` records the task result; after the teammate reaches IDLE, the user or host can inspect, merge, keep, or remove the worktree.

#### 11. Control messages use types and request IDs

Free-form text works for ordinary collaboration, but shutdown and approval should not depend on guessing intent. They use structured messages:

![Team Protocols](https://raw.githubusercontent.com/shareAI-lab/learn-claude-code/HEAD/s13_agent_teams/images/team-protocols-overview.en.svg)

```python
@dataclass
class ProtocolState:
    request_id: str
    type: str
    sender: str
    target: str
    status: str
    payload: str
    work_version: int | None = None
    task_id: str | None = None

pending_requests: dict[str, ProtocolState] = {}
```

The shutdown path is:

```text
Lead creates a pending shutdown request
  → shutdown_request(request_id) enters the teammate inbox
  → the teammate finishes its current step
  → shutdown_response(request_id) returns to Lead
  → request_id locates the original request
  → pending becomes approved and the teammate loop exits
```

The ID correlates one reply with one request, the type prevents a mismatched reply from changing state, and the status prevents duplicate responses from being applied twice.

#### 12. Plan approval constrains execution

The plan protocol runs in the opposite direction:

```text
Lead → plan_request
teammate → plan_approval_request(request_id, plan)
Lead → plan_approval_response(request_id, approve, feedback)
```

When Lead already knows that a teammate must plan first, `spawn_teammate(..., task_id=task.id, require_plan=True)` claims the Task and activates the gate before the teammate thread starts. `request_plan` can also require a plan from a teammate that is already running.

Tool dispatch enforces the gate:

```python
def _run_teammate_tool(name, block, handlers):
    gate = plan_gates.get(name, "not_required")
    if block.name in {"bash", "write_file", "edit_file"} and gate not in {
        "not_required", "approved"
    }:
        return f"Blocked: plan status is {gate}."
    try:
        return handlers[block.name](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s13_agent_teams/**block.input)
    except Exception as error:
        return f"Error: {type(error).__name__}: {error}"
```

While the state is `required`, `pending`, or `rejected`, the teammate can read files and submit or revise a plan, but it cannot run Shell commands, write files, or edit files. A submitted plan records the teammate's current task and work version. Claiming or releasing a Task changes that version and invalidates the old approval; an ordinary message changes neither the task identity nor the approval state.

Teammates do not read user input from their background threads. A dangerous command or path outside the workspace returns a permission error so Lead can handle the decision with the user.

---

### One Complete Run

```text
s13 >> Put the backend refactor on a shared task board. Clean up
       configuration, authentication, and tests in parallel where possible.
       Use a worktree for authentication, preserve existing interfaces,
       and make sure the tests pass.

Lead: I suggest config, auth, and tests as three areas.
      Shall I start the team?

s13 >> Go ahead.

[task] config created
[task] auth created → worktree auth-refactor
[task] tests created
[claim] alice → config (cwd: repository)
[claim] bob → auth (cwd: .worktrees/auth-refactor)
[teammate] alice spawned
[teammate] bob spawned
[complete] auth
[bus] bob → lead (result) ...
[bus] bob → lead (idle_notification) ...
[wake: 2 team events → new turn]
Lead: I received the authentication result and will coordinate the rest.
```

The terminal exposes the user request, Lead's proposal, task state, claims, selected directories, results, IDLE transitions, and control events. The user does not have to name a Lead or ask it to check an inbox.

---

### What Changed from s10

| Component | s10 | s13 |
|---|---|---|
| Agents | One agent | One Lead plus persistent teammates |
| User flow | Execute the request | Propose a team, then confirm startup |
| Communication | None | File mailboxes plus runtime delivery |
| Lifecycle | One loop | Teammate `WORK / IDLE / shutdown` |
| Shared work | One agent uses task tools | IDLE scan plus atomic teammate claims |
| Working directory | Repository `WORKDIR` | A claimed Task, with an optional worktree |
| Reporting | Current agent output | Separate `result` and `idle_notification` |
| Control | None | Typed shutdown and plan approval protocols |
| Enforcement | No team constraint | Required plans gate mutating tools |

---

### Try It

```sh
cd learn-claude-code
python s13_agent_teams/code.py
```

Start with an ordinary request:

```text
Put the backend refactor on a shared task board. Complete configuration,
authentication, and tests in parallel where dependencies allow. Use a
worktree for authentication, preserve existing interfaces, and summarize
the result.
```

After Lead proposes the team, reply:

```text
Go ahead.
```

Watch `.tasks/` move from `pending` to `in_progress` and `completed`, `.mailboxes/` deliver `result` and `idle_notification`, and `.worktrees/` appear only for the bound task. Also check that direct messages beat task-board scans and that a failed `complete_task` does not reset the teammate's working directory.

---

### What's Next

The Lead and its teammates can only call tools defined directly in `code.py`. Connecting Jira, a deployment platform, or a knowledge base still requires separate tool schemas and handlers for each external system. Changes to those external tools also require changes to the course code.

s14 MCP Tools → Connect external services at runtime through one discovery and invocation protocol, then add their tools to the tool pool.

<!-- translation-sync: zh@v12, en@v12, ja@v12 -->

### Full code

The complete implementation is 1887 lines: [`s13_agent_teams/code.py`](https://github.com/shareAI-lab/learn-claude-code/blob/HEAD/s13_agent_teams/code.py).
