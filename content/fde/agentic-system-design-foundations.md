---
title: "Agentic System Design Foundations"
order: 16
summary: "Design patterns for agentic systems and the principles that make LLM applications reliable enough for production."
category: "Agentic System Design"
level: Intermediate
---

# Agentic System Design Foundations

Agentic systems are still systems: the same questions of control flow, state and failure apply. These patterns and principles are the foundation.

**Course milestone:** Agentic System Design

## Agentic design patterns

> **Source:** [Agentic design patterns](https://github.com/microsoft/ai-agents-for-beginners/tree/HEAD/03-agentic-design-patterns) · [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners), MIT

There are many ways to think about building AI Agentic Systems. Given that ambiguity is a feature and not a bug in Generative AI design, it’s sometimes difficult for engineers to figure out where to even start. We have created a set of human-centric UX Design Principles to enable developers to build customer-centric agentic systems to solve their business needs. These design principles are not a prescriptive architecture but rather a starting point for teams who are defining and building out agent experiences.

In general, agents should:

- Broaden and scale human capacities (brainstorming, problem-solving, automation, etc.)
- Fill in knowledge gaps (get me up-to-speed on knowledge domains, translation, etc.)
- Facilitate and support collaboration in the ways we as individuals prefer to work with others
- Make us better versions of ourselves (e.g., life coach/task master, helping us learn emotional regulation and mindfulness skills, building resilience, etc.)

### This Lesson Will Cover

- What are the Agentic Design Principles
- What are some guidelines to follow while implementing these design principles
- What are some examples of using the design principles

### Learning Goals

After completing this lesson, you will be able to:

1. Explain what the Agentic Design Principles are
2. Explain the guidelines for using the Agentic Design Principles
3. Understand how to build an agent using the Agentic Design Principles

### The Agentic Design Principles

![Agentic Design Principles](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/03-agentic-design-patterns/images/agentic-design-principles.png)

#### Agent (Space)

This is the environment in which the agent operates. These principles inform how we design agents for engaging in physical and digital worlds.

- **Connecting, not collapsing** – help connect people to other people, events, and actionable knowledge to enable collaboration and connection.
- Agents help connect events, knowledge, and people.
- Agents bring people closer together. They are not designed to replace or belittle people.
- **Easily accessible yet occasionally invisible** – agent largely operates in the background and only nudges us when it is relevant and appropriate.
  - Agent is easily discoverable and accessible for authorized users on any device or platform.
  - Agent supports multimodal inputs and outputs (sound, voice, text, etc.).
  - Agent can seamlessly transition between foreground and background; between proactive and reactive, depending on its sensing of user needs.
  - Agent may operate in invisible form, yet its background process path and collaboration with other Agents are transparent to and controllable by the user.

#### Agent (Time)

This is how the agent operates over time. These principles inform how we design agents interacting across the past, present, and future.

- **Past**: Reflecting on history that includes both state and context.
  - Agent provides more relevant results based on analysis of richer historical data beyond only the event, people, or states.
  - Agent creates connections from past events and actively reflects on memory to engage with current situations.
- **Now**: Nudging more than notifying.
  - Agent embodies a comprehensive approach to interacting with people. When an event happens, the Agent goes beyond static notification or other static formality. Agent can simplify flows or dynamically generate cues to direct the user’s attention at the right moment.
  - Agent delivers information based on contextual environment, social and cultural changes and tailored to user intent.
  - Agent interaction can be gradual, evolving/growing in complexity to empower users over the long term.
- **Future**: Adapting and evolving.
  - Agent adapts to various devices, platforms, and modalities.
  - Agent adapts to user behavior, accessibility needs, and is freely customizable.
  - Agent is shaped by and evolves through continuous user interaction.

#### Agent (Core)

These are the key elements in the core of an agent’s design.

- **Embrace uncertainty but establish trust**.
  - A certain level of Agent uncertainty is expected. Uncertainty is a key element of agent design.
  - Trust and transparency are foundational layers of Agent design.
  - Humans are in control of when the Agent is on/off and Agent status is clearly visible at all times.

### The Guidelines to Implement These Principles

When you’re using the previous design principles, use the following guidelines:

1. **Transparency**: Inform the user that AI is involved, how it functions (including past actions), and how to give feedback and modify the system.
2. **Control**: Enable the user to customize, specify preferences and personalize, and have control over the system and its attributes (including the ability to forget).
3. **Consistency**: Aim for consistent, multi-modal experiences across devices and endpoints. Use familiar UI/UX elements where possible (e.g., microphone icon for voice interaction) and reduce the customer’s cognitive load as much as possible (e.g., aim for concise responses, visual aids, and ‘Learn More’ content).

### How To Design a Travel Agent using These Principles and Guidelines

Imagine you are designing a Travel Agent, here is how you could think about using the Design Principles and Guidelines:

1. **Transparency** – Let the user know that the Travel Agent is an AI-enabled Agent. Provide some basic instructions on how to get started (e.g., a “Hello” message, sample prompts). Clearly document this on the product page. Show the list of prompts a user has asked in the past. Make it clear how to give feedback (thumbs up and down, Send Feedback button, etc.). Clearly articulate if the Agent has usage or topic restrictions.
2. **Control** – Make sure it’s clear how the user can modify the Agent after it’s been created with things like the System Prompt. Enable the user to choose how verbose the Agent is, its writing style, and any caveats on what the Agent should not talk about. Allow the user to view and delete any associated files or data, prompts, and past conversations.
3. **Consistency** – Make sure the icons for Share Prompt, add a file or photo and tag someone or something are standard and recognizable. Use the paperclip icon to indicate file upload/sharing with the Agent, and an image icon to indicate graphics upload.

### Sample Codes

- Python: [Agent Framework](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/03-agentic-design-patterns/code_samples/03-python-agent-framework.ipynb)
- .NET: [Agent Framework](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/03-agentic-design-patterns/code_samples/03-dotnet-agent-framework.md)

## Own your control flow

> **Source:** [Own your control flow](https://github.com/humanlayer/12-factor-agents/blob/HEAD/content/factor-08-own-your-control-flow.md) · [12-Factor Agents](https://github.com/humanlayer/12-factor-agents), CC BY-SA 4.0

If you own your control flow, you can do lots of fun things.

![180-control-flow](https://github.com/humanlayer/12-factor-agents/blob/main/img/180-control-flow.png)

Build your own control structures that make sense for your specific use case. Specifically, certain types of tool calls may be reason to break out of the loop and wait for a response from a human or another long-running task like a training pipeline. You may also want to incorporate custom implementation of:

- summarization or caching of tool call results
- LLM-as-judge on structured output
- context window compaction or other [memory management](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-03-own-your-context-window.md)
- logging, tracing, and metrics
- client-side rate limiting
- durable sleep / pause / "wait for event"

The below example shows three possible control flow patterns:

- request_clarification: model asked for more info, break the loop and wait for a response from a human
- fetch_git_tags: model asked for a list of git tags, fetch the tags, append to context window, and pass straight back to the model
- deploy_backend: model asked to deploy a backend, this is a high-stakes thing, so break the loop and wait for human approval

```python
def handle_next_step(thread: Thread):

  while True:
    next_step = await determine_next_step(thread_to_prompt(thread))

    # inlined for clarity - in reality you could put
    # this in a method, use exceptions for control flow, or whatever you want
    if next_step.intent == 'request_clarification':
      thread.events.append({
        type: 'request_clarification',
          data: nextStep,
        })

      await send_message_to_human(next_step)
      await db.save_thread(thread)
      # async step - break the loop, we'll get a webhook later
      break
    elif next_step.intent == 'fetch_open_issues':
      thread.events.append({
        type: 'fetch_open_issues',
        data: next_step,
      })

      issues = await linear_client.issues()

      thread.events.append({
        type: 'fetch_open_issues_result',
        data: issues,
      })
      # sync step - pass the new context to the LLM to determine the NEXT next step
      continue
    elif next_step.intent == 'create_issue':
      thread.events.append({
        type: 'create_issue',
        data: next_step,
      })

      await request_human_approval(next_step)
      await db.save_thread(thread)
      # async step - break the loop, we'll get a webhook later
      break
```

This pattern allows you to interrupt and resume your agent's flow as needed, creating more natural conversations and workflows.

**Example** - the number one feature request I have for every AI framework out there is we need to be able to interrupt
a working agent and resume later, ESPECIALLY between the moment of tool **selection** and the moment of tool **invocation**.

Without this level of resumability/granularity, there's no way to review/approve the tool call before it runs, which means
you're forced to either:

1. Pause the task in memory while waiting for the long-running thing to complete (think `while...sleep`) and restart it from the beginning if the process is interrupted
2. Restrict the agent to only low-stakes, low-risk calls like research and summarization
3. Give the agent access to do bigger, more useful things, and just yolo hope it doesn't screw up

You may notice this is closely related to [factor 5 - unify execution state and business state](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-05-unify-execution-state.md) and [factor 6 - launch/pause/resume with simple APIs](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-06-launch-pause-resume.md), but can be implemented independently.

## Unify execution state and business state

> **Source:** [Unify execution state and business state](https://github.com/humanlayer/12-factor-agents/blob/HEAD/content/factor-05-unify-execution-state.md) · [12-Factor Agents](https://github.com/humanlayer/12-factor-agents), CC BY-SA 4.0

Even outside the AI world, many infrastructure systems try to separate "execution state" from "business state". For AI apps, this might involve complex abstractions to track things like current step, next step, waiting status, retry counts, etc. This separation creates complexity that may be worthwhile, but may be overkill for your use case.

As always, it's up to you to decide what's right for your application. But don't think you *have* to manage them separately.

More clearly:

- **Execution state**: current step, next step, waiting status, retry counts, etc.
- **Business state**: What's happened in the agent workflow so far (e.g. list of OpenAI messages, list of tool calls and results, etc.)

If possible, SIMPLIFY - unify these as much as possible.

[![155-unify-state](https://github.com/humanlayer/12-factor-agents/blob/main/img/155-unify-state-animation.gif)](https://github.com/user-attachments/assets/e5a851db-f58f-43d8-8b0c-1926c99fc68d)

<details>
<summary><a href="https://github.com/humanlayer/12-factor-agents/blob/main/img/155-unify-state-animation.gif">GIF Version</a></summary>

![155-unify-state](https://github.com/humanlayer/12-factor-agents/blob/main/img/155-unify-state-animation.gif)

</details>

In reality, you can engineer your application so that you can infer all execution state from the context window. In many cases, execution state (current step, waiting status, etc.) is just metadata about what has happened so far.

You may have things that can't go in the context window, like session ids, password contexts, etc, but your goal should be to minimize those things. By embracing [factor 3](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-03-own-your-context-window.md) you can control what actually goes into the LLM

This approach has several benefits:

1. **Simplicity**: One source of truth for all state
2. **Serialization**: The thread is trivially serializable/deserializable
3. **Debugging**: The entire history is visible in one place
4. **Flexibility**: Easy to add new state by just adding new event types
5. **Recovery**: Can resume from any point by just loading the thread
6. **Forking**: Can fork the thread at any point by copying some subset of the thread into a new context / state ID
7. **Human Interfaces and Observability**: Trivial to convert a thread into a human-readable markdown or a rich Web app UI

## Small, focused agents

> **Source:** [Small, focused agents](https://github.com/humanlayer/12-factor-agents/blob/HEAD/content/factor-10-small-focused-agents.md) · [12-Factor Agents](https://github.com/humanlayer/12-factor-agents), CC BY-SA 4.0

Rather than building monolithic agents that try to do everything, build small, focused agents that do one thing well. Agents are just one building block in a larger, mostly deterministic system.

![1a0-small-focused-agents](https://github.com/humanlayer/12-factor-agents/blob/main/img/1a0-small-focused-agents.png)

The key insight here is about LLM limitations: the bigger and more complex a task is, the more steps it will take, which means a longer context window. As context grows, LLMs are more likely to get lost or lose focus. By keeping agents focused on specific domains with 3-10, maybe 20 steps max, we keep context windows manageable and LLM performance high.

> #### As context grows, LLMs are more likely to get lost or lose focus

Benefits of small, focused agents:

1. **Manageable Context**: Smaller context windows mean better LLM performance
2. **Clear Responsibilities**: Each agent has a well-defined scope and purpose
3. **Better Reliability**: Less chance of getting lost in complex workflows
4. **Easier Testing**: Simpler to test and validate specific functionality
5. **Improved Debugging**: Easier to identify and fix issues when they occur

### What if LLMs get smarter?

Do we still need this if LLMs get smart enough to handle 100-step+ workflows?

tl;dr yes. As agents and LLMs improve, they **might** naturally expand to be able to handle longer context windows. This means handling MORE of a larger DAG. This small, focused approach ensures you can get results TODAY, while preparing you to slowly expand agent scope as LLM context windows become more reliable. (If you've refactored large deterministic code bases before, you may be nodding your head right now).

[![gif](https://github.com/humanlayer/12-factor-agents/blob/main/img/1a5-agent-scope-grow.gif)](https://github.com/user-attachments/assets/0cd3f52c-046e-4d5e-bab4-57657157c82f
)

<details>
<summary><a href="https://github.com/humanlayer/12-factor-agents/blob/main/img/1a5-agent-scope-grow.gif">GIF Version</a></summary>
![gif](https://github.com/humanlayer/12-factor-agents/blob/main/img/1a5-agent-scope-grow.gif)
</details>

Being intentional about size/scope of agents, and only growing in ways that allow you to maintain quality, is key here. As the [team that built NotebookLM put it](https://open.substack.com/pub/swyx/p/notebooklm?selection=08e1187c-cfee-4c63-93c9-71216640a5f8&utm_campaign=post-share-selection&utm_medium=web):

> I feel like consistently, the most magical moments out of AI building come about for me when I'm really, really, really just close to the edge of the model capability

Regardless of where that boundary is, if you can find that boundary and get it right consistently, you'll be building magical experiences. There are many moats to be built here, but as usual, they take some engineering rigor.
