---
title: "Your First Agentic Workflow"
order: 1
summary: "What an AI agent is, how it differs from a chatbot or a script, and how agents plan a task before acting on it."
category: "Agentic Software Engineering"
level: Intermediate
---

# Your First Agentic Workflow

An agent is a model in a loop: it reads the situation, decides on an action, uses a tool, looks at the result and goes again. This module covers what makes a workflow agentic and how agents break a task into steps.

**Course milestone:** Agentic Software Engineering

## Introduction to AI agents

> **Source:** [Introduction to AI agents](https://github.com/microsoft/ai-agents-for-beginners/tree/HEAD/01-intro-to-ai-agents) · [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners), MIT

Welcome to the **AI Agents for Beginners** course! This course gives you the foundational knowledge — and real working code — to start building AI Agents from scratch.

Come say hi in the <a href="https://discord.gg/kzRShWzttr" target="_blank">Azure AI Discord Community</a> — it's full of learners and AI builders who are happy to answer questions.

Before we jump into building, let's make sure we actually understand what an AI Agent *is* and when it makes sense to use one.

---

### Introduction

This lesson covers:

- What AI Agents are, and the different types that exist
- Which kinds of tasks AI Agents are best suited for
- The core building blocks you'll use when designing an Agentic solution

### Learning Goals

By the end of this lesson, you should be able to:

- Explain what an AI Agent is and how it's different from a regular AI solution
- Know when to reach for an AI Agent (and when not to)
- Sketch out a basic Agentic solution design for a real-world problem

---

### Defining AI Agents and Types of AI Agents

#### What are AI Agents?

Here's a simple way to think about it:

> **AI Agents are systems that let Large Language Models (LLMs) actually *do things* — by giving them tools and knowledge to act on the world, not just respond to prompts.**

Let's unpack that a bit:

- **System** — An AI Agent isn't just one thing. It's a collection of parts working together. At its core, every agent has three pieces:
  - **Environment** — The space the agent works in. For a travel booking agent, this would be the booking platform itself.
  - **Sensors** — How the agent reads the current state of its environment. Our travel agent might check hotel availability or flight prices.
  - **Actuators** — How the agent takes action. The travel agent might book a room, send a confirmation, or cancel a reservation.

![What Are AI Agents?](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/01-intro-to-ai-agents/images/what-are-ai-agents.png)

- **Large Language Models** — Agents existed before LLMs, but LLMs are what make modern agents so powerful. They can understand natural language, reason about context, and turn a vague user request into a concrete plan of action.

- **Perform Actions** — Without an agent system, an LLM just generates text. Inside an agent system, the LLM can actually *execute* steps — searching a database, calling an API, sending a message.

- **Access to Tools** — What tools the agent can use depends on (1) the environment it's running in and (2) what the developer chose to give it. A travel agent might be able to search flights but not edit customer records — it's all about what you wire up.

- **Memory + Knowledge** — Agents can have short-term memory (the current conversation) and long-term memory (a customer database, past interactions). The travel agent might "remember" that you prefer window seats.

---

#### The Different Types of AI Agents

Not all agents are built the same. Here's a breakdown of the main types, using a travel booking agent as the running example:

| **Agent Type** | **What It Does** | **Travel Agent Example** |
|---|---|---|
| **Simple Reflex Agents** | Follows hard-coded rules — no memory, no planning. | Sees a complaint email → forwards it to customer service. That's it. |
| **Model-Based Reflex Agents** | Keeps an internal model of the world and updates it as things change. | Tracks historical flight prices and flags routes that are suddenly expensive. |
| **Goal-Based Agents** | Has a goal in mind and figures out how to reach it step by step. | Books a full trip (flights, car, hotel) starting from your current location to get you to your destination. |
| **Utility-Based Agents** | Doesn't just find *a* solution — finds the *best* one by weighing tradeoffs. | Balances cost vs. convenience to find the trip that scores highest for your preferences. |
| **Learning Agents** | Gets better over time by learning from feedback. | Adjusts future booking recommendations based on post-trip survey results. |
| **Hierarchical Agents** | A high-level agent breaks work into subtasks and delegates to lower-level agents. | A "cancel trip" request gets split into: cancel flight, cancel hotel, cancel car rental — each handled by a sub-agent. |
| **Multi-Agent Systems (MAS)** | Multiple independent agents working together (or competing). | Cooperative: separate agents handle hotels, flights, and entertainment. Competitive: multiple agents compete to fill hotel rooms at the best price. |

---

### When to Use AI Agents

Just because you *can* use an AI Agent doesn't mean you always *should*. Here are the situations where agents really shine:

![When to use AI Agents?](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/01-intro-to-ai-agents/images/when-to-use-ai-agents.png)

- **Open-Ended Problems** — When the steps to solve a problem can't be pre-programmed. You need the LLM to figure out the path dynamically.
- **Multi-Step Processes** — Tasks that require using tools across several turns, not just a single lookup or generation.
- **Improvement Over Time** — When you want the system to get smarter based on user feedback or environmental signals.

We'll dig deeper into when (and when *not*) to use AI Agents in the **Building Trustworthy AI Agents** lesson later in the course.

---

### Basics of Agentic Solutions

#### Agent Development

The first thing you do when building an agent is define *what it can do* — its tools, actions, and behaviors.

In this course, we use the **Microsoft Foundry Agent Service** as our main platform. It supports:

- Models from providers like OpenAI, Mistral, and Meta (Llama)
- Licensed data from providers like Tripadvisor
- Standardized OpenAPI 3.0 tool definitions

#### Agentic Patterns

You communicate with LLMs through prompts. With agents, you can't always hand-craft every prompt manually — the agent needs to take action across many steps. That's where **Agentic Patterns** come in. They're reusable strategies for prompting and orchestrating LLMs in a more scalable, reliable way.

This course is structured around the most common and useful agentic patterns.

#### Agentic Frameworks

Agentic Frameworks give developers ready-made templates, tools, and infrastructure for building agents. They make it easier to:

- Wire up tools and capabilities
- Observe what the agent is doing (and debug when it goes wrong)
- Collaborate across multiple agents

In this course, we focus on the **Microsoft Agent Framework (MAF)** for building production-ready agents.

---

### Got Questions?

Join the [Microsoft Foundry Discord](https://discord.com/invite/ATgtXmAS5D) to connect with other learners, attend office hours, and get your AI Agent questions answered by the community.

---

### Smoke-Testing This Agent (Optional)

Once you learn to deploy agents in [Lesson 16](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/16-deploying-scalable-agents/README.md), you can add a fast post-deploy health check for this lesson's `TravelAgent` with the ready-made catalog [`tests/lesson-01-smoke-tests.json`](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/tests/lesson-01-smoke-tests.json). See [`tests/README.md`](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/tests/README.md) for how to run it.

---

## Planning design

> **Source:** [Planning design](https://github.com/microsoft/ai-agents-for-beginners/tree/HEAD/07-planning-design) · [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners), MIT

This lesson will cover

* Defining a clear overall goal and breaking a complex task into manageable tasks.
* Leveraging structured output for more reliable and machine-readable responses.
* Applying an event-driven approach to handle dynamic tasks and unexpected inputs.

### Learning Goals

After completing this lesson, you will have an understanding about:

* Identify and set an overall goal for an AI agent, ensuring it clearly knows what needs to be achieved.
* Decompose a complex task into manageable subtasks and organize them into a logical sequence.
* Equip agents with the right tools (e.g., search tools or data analytics tools), decide when and how they are used, and handle unexpected situations that arise.
* Evaluate subtask outcomes, measure performance, and iterate on actions to improve the final output.

### Defining the Overall Goal and Breaking Down a Task

![Defining Goals and Tasks](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/07-planning-design/images/defining-goals-tasks.png)

Most real-world tasks are too complex to tackle in a single step. An AI agent needs a concise objective to guide its planning and actions. For example, consider the goal:

    "Generate a 3-day travel itinerary."

While it is simple to state, it still needs refinement. The clearer the goal, the better the agent (and any human collaborators) can focus on achieving the right outcome, such as creating a comprehensive itinerary with flight options, hotel recommendations, and activity suggestions.

#### Task Decomposition

Large or intricate tasks become more manageable when split into smaller, goal-oriented subtasks.
For the travel itinerary example, you could decompose the goal into:

* Flight Booking
* Hotel Booking
* Car Rental
* Personalization

Each subtask can then be tackled by dedicated agents or processes. One agent might specialize in searching for the best flight deals, another focuses on hotel bookings, and so on. A coordinating or “downstream” agent can then compile these results into one cohesive itinerary to the end user.

This modular approach also allows for incremental enhancements. For instance, you could add specialized agents for Food Recommendations or Local Activity Suggestions and refine the itinerary over time.

#### Structured output

Large Language Models (LLMs) can generate structured output (e.g. JSON) that is easier for downstream agents or services to parse and process. This is especially useful in a multi-agent context, where we can action these tasks after the planning output is received.

The following Python snippet demonstrates a simple planning agent decomposing a goal into subtasks and generating a structured plan:

```python
from pydantic import BaseModel
from enum import Enum
from typing import List, Optional, Union
import json
import os
from typing import Optional
from pprint import pprint
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

class AgentEnum(str, Enum):
    FlightBooking = "flight_booking"
    HotelBooking = "hotel_booking"
    CarRental = "car_rental"
    ActivitiesBooking = "activities_booking"
    DestinationInfo = "destination_info"
    DefaultAgent = "default_agent"
    GroupChatManager = "group_chat_manager"

# Travel SubTask Model
class TravelSubTask(BaseModel):
    task_details: str
    assigned_agent: AgentEnum  # we want to assign the task to the agent

class TravelPlan(BaseModel):
    main_task: str
    subtasks: List[TravelSubTask]
    is_greeting: bool

provider = FoundryChatClient(
    project_endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
    model=os.environ["AZURE_AI_MODEL_DEPLOYMENT_NAME"],
    credential=AzureCliCredential(),
)

# Define the user message
system_prompt = """You are a planner agent.
    Your job is to decide which agents to run based on the user's request.
    Provide your response in JSON format with the following structure:
{'main_task': 'Plan a family trip from Singapore to Melbourne.',
 'subtasks': [{'assigned_agent': 'flight_booking',
               'task_details': 'Book round-trip flights from Singapore to '
                               'Melbourne.'}
    Below are the available agents specialised in different tasks:
    - FlightBooking: For booking flights and providing flight information
    - HotelBooking: For booking hotels and providing hotel information
    - CarRental: For booking cars and providing car rental information
    - ActivitiesBooking: For booking activities and providing activity information
    - DestinationInfo: For providing information about destinations
    - DefaultAgent: For handling general requests"""

user_message = "Create a travel plan for a family of 2 kids from Singapore to Melbourne"

response = client.create_response(input=user_message, instructions=system_prompt)

response_content = response.output_text
pprint(json.loads(response_content))
```

#### Planning Agent with Multi-Agent Orchestration

In this example, a Semantic Router Agent receives a user request (e.g., "I need a hotel plan for my trip.").

The planner then:

* Receives the Hotel Plan: The planner takes the user’s message and, based on a system prompt (including available agent details), generates a structured travel plan.
* Lists Agents and Their Tools: The agent registry holds a list of agents (e.g., for flight, hotel, car rental, and activities) along with the functions or tools they offer.
* Routes the Plan to the Respective Agents: Depending on the number of subtasks, the planner either sends the message directly to a dedicated agent (for single-task scenarios) or coordinates via a group chat manager for multi-agent collaboration.
* Summarizes the Outcome: Finally, the planner summarizes the generated plan for clarity.
The following Python code sample illustrates these steps:

```python

from pydantic import BaseModel

from enum import Enum
from typing import List, Optional, Union

class AgentEnum(str, Enum):
    FlightBooking = "flight_booking"
    HotelBooking = "hotel_booking"
    CarRental = "car_rental"
    ActivitiesBooking = "activities_booking"
    DestinationInfo = "destination_info"
    DefaultAgent = "default_agent"
    GroupChatManager = "group_chat_manager"

# Travel SubTask Model

class TravelSubTask(BaseModel):
    task_details: str
    assigned_agent: AgentEnum # we want to assign the task to the agent

class TravelPlan(BaseModel):
    main_task: str
    subtasks: List[TravelSubTask]
    is_greeting: bool
import json
import os
from typing import Optional

from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

# Create the client

provider = FoundryChatClient(
    project_endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
    model=os.environ["AZURE_AI_MODEL_DEPLOYMENT_NAME"],
    credential=AzureCliCredential(),
)

from pprint import pprint

# Define the user message

system_prompt = """You are a planner agent.
    Your job is to decide which agents to run based on the user's request.
    Below are the available agents specialized in different tasks:
    - FlightBooking: For booking flights and providing flight information
    - HotelBooking: For booking hotels and providing hotel information
    - CarRental: For booking cars and providing car rental information
    - ActivitiesBooking: For booking activities and providing activity information
    - DestinationInfo: For providing information about destinations
    - DefaultAgent: For handling general requests"""

user_message = "Create a travel plan for a family of 2 kids from Singapore to Melbourne"

response = client.create_response(input=user_message, instructions=system_prompt)

response_content = response.output_text

# Print the response content after loading it as JSON

pprint(json.loads(response_content))
```

What follows is the output from the previous code and you can then use this structured output to route to `assigned_agent` and summarize the travel plan to the end user.

```json
{
    "is_greeting": "False",
    "main_task": "Plan a family trip from Singapore to Melbourne.",
    "subtasks": [
        {
            "assigned_agent": "flight_booking",
            "task_details": "Book round-trip flights from Singapore to Melbourne."
        },
        {
            "assigned_agent": "hotel_booking",
            "task_details": "Find family-friendly hotels in Melbourne."
        },
        {
            "assigned_agent": "car_rental",
            "task_details": "Arrange a car rental suitable for a family of four in Melbourne."
        },
        {
            "assigned_agent": "activities_booking",
            "task_details": "List family-friendly activities in Melbourne."
        },
        {
            "assigned_agent": "destination_info",
            "task_details": "Provide information about Melbourne as a travel destination."
        }
    ]
}
```

An example notebook with the previous code sample is available [here](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/07-planning-design/code_samples/07-python-agent-framework.ipynb).

#### Iterative Planning

Some tasks require a back-and-forth or re-planning, where the outcome of one subtask influences the next. For example, if the agent discovers an unexpected data format while booking flights, it might need to adapt its strategy before moving on to hotel bookings.

Additionally, user feedback (e.g. a human deciding they prefer an earlier flight) can trigger a partial re-plan. This dynamic, iterative approach ensures that the final solution aligns with real-world constraints and evolving user preferences.

e.g sample code

```python
import os
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential
#.. same as previous code and pass on the user history, current plan

system_prompt = """You are a planner agent to optimize the
    Your job is to decide which agents to run based on the user's request.
    Below are the available agents specialized in different tasks:
    - FlightBooking: For booking flights and providing flight information
    - HotelBooking: For booking hotels and providing hotel information
    - CarRental: For booking cars and providing car rental information
    - ActivitiesBooking: For booking activities and providing activity information
    - DestinationInfo: For providing information about destinations
    - DefaultAgent: For handling general requests"""

user_message = "Create a travel plan for a family of 2 kids from Singapore to Melbourne"

response = client.create_response(
    input=user_message,
    instructions=system_prompt,
    context=f"Previous travel plan - {TravelPlan}",
)
# .. re-plan and send the tasks to respective agents
```

For more comprehensive planning do checkout Magnetic One <a href="https://www.microsoft.com/research/articles/magentic-one-a-generalist-multi-agent-system-for-solving-complex-tasks" target="_blank">Blogpost</a> for solving complex tasks.

### Summary

In this article we have looked at an example of how we can create a planner that can dynamically select the available agents defined. The output of the Planner decomposes the tasks and assigns the agents so they can be executed. It is assumed the agents have access to the functions/tools that are required to perform the task. In addition to the agents you can include other patterns like reflection, summarizer, and round robin chat to further customize.
