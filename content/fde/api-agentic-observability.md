---
title: "API-Driven Agentic Systems & Observability Integration"
order: 19
summary: "Observability for agent-driven systems: the observability primer, semantic conventions, and connecting agents to APIs and telemetry."
category: "Agentic System Design"
level: Intermediate
---

# API-Driven Agentic Systems & Observability Integration

Agents that call APIs need the same telemetry as any service, plus visibility into their own reasoning steps. See also the DevOps track's [Observability](/devops/observability) module.

**Course milestone:** Agentic System Design

## Observability primer

> **Source:** [Observability primer](https://opentelemetry.io/docs/concepts/observability-primer/) · [OpenTelemetry docs](https://github.com/open-telemetry/opentelemetry.io), CC BY 4.0

### What is Observability?

Observability lets you understand a system from the outside by letting you ask
questions about that system without knowing its inner workings. Furthermore, it
allows you to easily troubleshoot and handle novel problems, that is, "unknown
unknowns". It also helps you answer the question "Why is this happening?"

To ask those questions about your system, your application must be properly
instrumented. That is, the application code must emit
[signals](https://opentelemetry.io/docs/concepts/signals/) such as
[traces](https://opentelemetry.io/docs/concepts/signals/traces/),
[metrics](https://opentelemetry.io/docs/concepts/signals/metrics/), and
[logs](https://opentelemetry.io/docs/concepts/signals/logs/). An application is properly instrumented
when developers don't need to add more instrumentation to troubleshoot an issue,
because they have all of the information they need.

[OpenTelemetry](https://opentelemetry.io/docs/what-is-opentelemetry/) is the mechanism by which
application code is instrumented to help make a system observable.

### Reliability and metrics

**Telemetry** refers to data emitted from a system and its behavior. The data
can come in the form of [traces](https://opentelemetry.io/docs/concepts/signals/traces/),
[metrics](https://opentelemetry.io/docs/concepts/signals/metrics/), and
[logs](https://opentelemetry.io/docs/concepts/signals/logs/).

**Reliability** answers the question: "Is the service doing what users expect it
to be doing?" A system could be up 100% of the time, but if, when a user clicks
"Add to Cart" to add a black pair of shoes to their shopping cart, the system
doesn't always add black shoes, then the system could be **un**reliable.

**Metrics** are aggregations over a period of time of numeric data about your
infrastructure or application. Examples include: system error rate, CPU
utilization, and request rate for a given service. For more on metrics and how
they relate to OpenTelemetry, see [Metrics](https://opentelemetry.io/docs/concepts/signals/metrics/).

**SLI**, or Service Level Indicator, represents a measurement of a service's
behavior. A good SLI measures your service from the perspective of your users.
An example SLI can be the speed at which a web page loads.

**SLO**, or Service Level Objective, represents the means by which reliability
is communicated to an organization/other teams. This is accomplished by
attaching one or more SLIs to business value.

### Understanding distributed tracing

Distributed tracing lets you observe requests as they propagate through complex,
distributed systems. Distributed tracing improves the visibility of your
application or system's health and lets you debug behavior that is difficult to
reproduce locally. It is essential for distributed systems, which commonly have
nondeterministic problems or are too complicated to reproduce locally.

To understand distributed tracing, you need to understand the role of each of
its components: logs, spans, and traces.

#### Logs

A **log** is a timestamped message emitted by services or other components.
Unlike [traces](#distributed-traces), they aren't necessarily associated with
any particular user request or transaction. You can find logs almost everywhere
in software. Logs have been heavily relied on in the past by both developers and
operators to help them understand system behavior.

Sample log:

```text
I, [2021-02-23T13:26:23.505892 #22473]  INFO -- : [6459ffe1-ea53-4044-aaa3-bf902868f730] Started GET "/" for ::1 at 2021-02-23 13:26:23 -0800
```

Logs aren't enough for tracking code execution, as they usually lack contextual
information, such as where they were called from.

They become far more useful when they are included as part of a [span](#spans),
or when they are correlated with a trace and a span.

For more on logs and how they pertain to OpenTelemetry, see
[Logs](https://opentelemetry.io/docs/concepts/signals/logs/).

#### Spans

A **span** represents a single unit of work or operation. Spans track specific
operations that a request makes, painting a picture of what happened during the
time in which that operation was executed.

A span contains name, time-related data,
[structured log messages](https://opentelemetry.io/docs/concepts/signals/traces/#span-events), and
[other metadata (that is, Attributes)](https://opentelemetry.io/docs/concepts/signals/traces/#attributes)
to provide information about the operation it tracks.

##### Span attributes

Span attributes are metadata attached to a span.

The following table contains examples of span attributes:

| Key                         | Value                                                                              |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `http.request.method`       | `"GET"`                                                                            |
| `network.protocol.version`  | `"1.1"`                                                                            |
| `url.path`                  | `"/webshop/articles/4"`                                                            |
| `url.query`                 | `"?s=1"`                                                                           |
| `server.address`            | `"example.com"`                                                                    |
| `server.port`               | `8080`                                                                             |
| `url.scheme`                | `"https"`                                                                          |
| `http.route`                | `"/webshop/articles/:article_id"`                                                  |
| `http.response.status_code` | `200`                                                                              |
| `client.address`            | `"192.0.2.4"`                                                                      |
| `client.socket.address`     | `"192.0.2.5"` (the client goes through a proxy)                                    |
| `user_agent.original`       | `"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"` |

For more on spans and how they relate to OpenTelemetry, see
[Spans](https://opentelemetry.io/docs/concepts/signals/traces/#spans).

#### Distributed traces

A **distributed trace**, more commonly known as a **trace**, records the path
taken by a single request (made by an application or end user) as it propagates
through multiple services in an architecture, such as microservice or serverless
applications.

A trace is made of one or more spans. The first span represents the root span.
Each root span represents a request from start to finish. The spans underneath
the parent provide a more in-depth context of what occurs during a request (or
what steps make up a request).

For example, when a user loads a web page, the initial HTTP request may pass
through an API gateway, a backend service, and a database. Each of these steps
is represented by a span, and together they form a single trace that shows the
end-to-end journey of the request.

Without tracing, finding the root cause of performance problems in a distributed
system can be challenging. Tracing makes debugging and understanding distributed
systems less daunting by breaking down what happens within a request as it flows
through a distributed system.

Many Observability backends visualize traces as waterfall diagrams that look
like this:

![Sample Trace](/img/waterfall-trace.svg 'Trace waterfall diagram')

Waterfall diagrams show the parent-child relationship between a root span and
its child spans. When a span encapsulates another span, this also represents a
nested relationship.

For more on traces and how they pertain to OpenTelemetry, see
[Traces](https://opentelemetry.io/docs/concepts/signals/traces/).

## Semantic conventions

> **Source:** [Semantic conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/) · [OpenTelemetry docs](https://github.com/open-telemetry/opentelemetry.io), CC BY 4.0

OpenTelemetry defines [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/), sometimes
called Semantic attributes, that specify common names for different kinds of
operations and data. The benefit of using Semantic conventions is in following a
common naming scheme that can be standardized across a codebase, libraries, and
platforms.

Semantic conventions are available for traces, metrics, logs, profiles and
resources:

- [Trace semantic conventions](https://opentelemetry.io/docs/specs/semconv/general/trace/)
- [Metric semantic conventions](https://opentelemetry.io/docs/specs/semconv/general/metrics/)
- [Log attributes](https://opentelemetry.io/docs/specs/semconv/registry/attributes/log/)
- [Profiles semantic conventions](https://opentelemetry.io/docs/specs/semconv/general/profiles/)
- [Resource semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/)

## Exploring agentic frameworks

> **Source:** [Exploring agentic frameworks](https://github.com/microsoft/ai-agents-for-beginners/tree/HEAD/02-explore-agentic-frameworks) · [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners), MIT

AI agent frameworks are software platforms designed to simplify the creation, deployment, and management of AI agents. These frameworks provide developers with pre-built components, abstractions, and tools that streamline the development of complex AI systems.

These frameworks help developers focus on the unique aspects of their applications by providing standardized approaches to common challenges in AI agent development. They enhance scalability, accessibility, and efficiency in building AI systems.

### Introduction

This lesson will cover:

- What are AI Agent Frameworks and what do they enable developers to achieve?
- How can teams use these to quickly prototype, iterate, and improve their agent’s capabilities?
- What are the differences between the frameworks and tools created by Microsoft (<a href="https://aka.ms/ai-agents-beginners/ai-agent-service" target="_blank">Microsoft Foundry Agent Service</a> and the <a href="https://learn.microsoft.com/azure/ai-services/openai/how-to/responses" target="_blank">Microsoft Agent Framework</a>)?
- Can I integrate my existing Azure ecosystem tools directly, or do I need standalone solutions?
- What is Microsoft Foundry Agent Service and how is this helping me?

### Learning goals

The goals of this lesson are to help you understand:

- The role of AI Agent Frameworks in AI development.
- How to leverage AI Agent Frameworks to build intelligent agents.
- Key capabilities enabled by AI Agent Frameworks.
- The differences between the Microsoft Agent Framework and Microsoft Foundry Agent Service.

### What are AI Agent Frameworks and what do they enable developers to do?

Traditional AI Frameworks can help you integrate AI into your apps and make these apps better in the following ways:

- **Personalization**: AI can analyze user behavior and preferences to provide personalized recommendations, content, and experiences.
Example: Streaming services like Netflix use AI to suggest movies and shows based on viewing history, enhancing user engagement and satisfaction.
- **Automation and Efficiency**: AI can automate repetitive tasks, streamline workflows, and improve operational efficiency.
Example: Customer service apps use AI-powered chatbots to handle common inquiries, reducing response times and freeing up human agents for more complex issues.
- **Enhanced User Experience**: AI can improve the overall user experience by providing intelligent features such as voice recognition, natural language processing, and predictive text.
Example: Virtual assistants like Siri and Google Assistant use AI to understand and respond to voice commands, making it easier for users to interact with their devices.

#### That all sounds great right, so why do we need the AI Agent Framework?

AI Agent frameworks represent something more than just AI frameworks. They are designed to enable the creation of intelligent agents that can interact with users, other agents, and the environment to achieve specific goals. These agents can exhibit autonomous behavior, make decisions, and adapt to changing conditions. Let's look at some key capabilities enabled by AI Agent Frameworks:

- **Agent Collaboration and Coordination**: Enable the creation of multiple AI agents that can work together, communicate, and coordinate to solve complex tasks.
- **Task Automation and Management**: Provide mechanisms for automating multi-step workflows, task delegation, and dynamic task management among agents.
- **Contextual Understanding and Adaptation**: Equip agents with the ability to understand context, adapt to changing environments, and make decisions based on real-time information.

So in summary, agents allow you to do more, to take automation to the next level, to create more intelligent systems that can adapt and learn from their environment.

### How to quickly prototype, iterate, and improve the agent’s capabilities?

This is a fast-moving landscape, but there are some things that are common across most AI Agent Frameworks that can help you quickly prototype and iterate namely module components, collaborative tools, and real-time learning. Let's dive into these:

- **Use Modular Components**: AI SDKs offer pre-built components such as AI and Memory connectors, function calling using natural language or code plugins, prompt templates, and more.
- **Leverage Collaborative Tools**: Design agents with specific roles and tasks, enabling them to test and refine collaborative workflows.
- **Learn in Real-Time**: Implement feedback loops where agents learn from interactions and adjust their behavior dynamically.

#### Use Modular Components

SDKs like the Microsoft Agent Framework offer pre-built components such as AI connectors, tool definitions, and agent management.

**How teams can use these**: Teams can quickly assemble these components to create a functional prototype without starting from scratch, allowing for rapid experimentation and iteration.

**How it works in practice**: You can use a pre-built parser to extract information from user input, a memory module to store and retrieve data, and a prompt generator to interact with users, all without having to build these components from scratch.

**Example code**. Let's look at an example of how you can use the Microsoft Agent Framework with `FoundryChatClient` to have the model respond to user input with tool calling:

``` python
# Microsoft Agent Framework Python Example

import asyncio
import os

from agent_framework import tool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

# Define a sample tool function to book travel
@tool(approval_mode="never_require")
def book_flight(date: str, location: str) -> str:
    """Book travel given location and date."""
    return f"Travel was booked to {location} on {date}"

async def main():
    provider = FoundryChatClient(
        project_endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
        model=os.environ["AZURE_AI_MODEL_DEPLOYMENT_NAME"],
        credential=AzureCliCredential(),
    )
    agent = provider.as_agent(
        name="travel_agent",
        instructions="Help the user book travel. Use the book_flight tool when ready.",
        tools=[book_flight],
    )

    response = await agent.run("I'd like to go to New York on January 1, 2025")
    print(response)
    # Example output: Your flight to New York on January 1, 2025, has been successfully booked. Safe travels! ✈️🗽

if __name__ == "__main__":
    asyncio.run(main())
```

What you can see from this example is how you can leverage a pre-built parser to extract key information from user input, such as the origin, destination, and date of a flight booking request. This modular approach allows you to focus on the high-level logic.

#### Leverage Collaborative Tools

Frameworks like the Microsoft Agent Framework facilitate the creation of multiple agents that can work together.

**How teams can use these**: Teams can design agents with specific roles and tasks, enabling them to test and refine collaborative workflows and improve overall system efficiency.

**How it works in practice**: You can create a team of agents where each agent has a specialized function, such as data retrieval, analysis, or decision-making. These agents can communicate and share information to achieve a common goal, such as answering a user query or completing a task.

**Example code (Microsoft Agent Framework)**:

```python
# Creating multiple agents that work together using the Microsoft Agent Framework

import os
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

provider = FoundryChatClient(
    project_endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
    model=os.environ["AZURE_AI_MODEL_DEPLOYMENT_NAME"],
    credential=AzureCliCredential(),
)

# Data Retrieval Agent
agent_retrieve = provider.as_agent(
    name="dataretrieval",
    instructions="Retrieve relevant data using available tools.",
    tools=[retrieve_tool],
)

# Data Analysis Agent
agent_analyze = provider.as_agent(
    name="dataanalysis",
    instructions="Analyze the retrieved data and provide insights.",
    tools=[analyze_tool],
)

# Run agents in sequence on a task
retrieval_result = await agent_retrieve.run("Retrieve sales data for Q4")
analysis_result = await agent_analyze.run(f"Analyze this data: {retrieval_result}")
print(analysis_result)
```

What you see in the previous code is how you can create a task that involves multiple agents working together to analyze data. Each agent performs a specific function, and the task is executed by coordinating the agents to achieve the desired outcome. By creating dedicated agents with specialized roles, you can improve task efficiency and performance.

#### Learn in Real-Time

Advanced frameworks provide capabilities for real-time context understanding and adaptation.

**How teams can use these**: Teams can implement feedback loops where agents learn from interactions and adjust their behavior dynamically, leading to continuous improvement and refinement of capabilities.

**How it works in practice**: Agents can analyze user feedback, environmental data, and task outcomes to update their knowledge base, adjust decision-making algorithms, and improve performance over time. This iterative learning process enables agents to adapt to changing conditions and user preferences, enhancing overall system effectiveness.

### What are the differences between the Microsoft Agent Framework and Microsoft Foundry Agent Service?

There are many ways to compare these approaches, but let's look at some key differences in terms of their design, capabilities, and target use cases:

### Microsoft Agent Framework (MAF)

The Microsoft Agent Framework provides a streamlined SDK for building AI agents using `FoundryChatClient`. It enables developers to create agents that leverage Azure OpenAI models with built-in tool calling, conversation management, and enterprise-grade security through Azure identity.

**Use Cases**: Building production-ready AI agents with tool use, multi-step workflows, and enterprise integration scenarios.

Here are some important core concepts of the Microsoft Agent Framework:

- **Agents**. An agent is created via `FoundryChatClient` and configured with a name, instructions, and tools. The agent can:
  - **Process user messages** and generate responses using Azure OpenAI models.
  - **Call tools** automatically based on the conversation context.
  - **Maintain conversation state** across multiple interactions.

  Here is a code snippet showing how to create an agent:

    ```python
    import os
    from agent_framework.foundry import FoundryChatClient
    from azure.identity import AzureCliCredential

    provider = FoundryChatClient(
        project_endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
        model=os.environ["AZURE_AI_MODEL_DEPLOYMENT_NAME"],
        credential=AzureCliCredential(),
    )
    agent = provider.as_agent(
        name="my_agent",
        instructions="You are a helpful assistant.",
    )

    response = await agent.run("Hello, World!")
    print(response)
    ```

- **Tools**. The framework supports defining tools as Python functions that the agent can invoke automatically. Tools are registered when creating the agent:

    ```python
    def get_weather(location: str) -> str:
        """Get the current weather for a location."""
        return f"The weather in {location} is sunny, 72\u00b0F."

    agent = provider.as_agent(
        name="weather_agent",
        instructions="Help users check the weather.",
        tools=[get_weather],
    )
    ```

- **Multi-Agent Coordination**. You can create multiple agents with different specializations and coordinate their work:

    ```python
    planner = provider.as_agent(
        name="planner",
        instructions="Break down complex tasks into steps.",
    )

    executor = provider.as_agent(
        name="executor",
        instructions="Execute the planned steps using available tools.",
        tools=[execute_tool],
    )

    plan = await planner.run("Plan a trip to Paris")
    result = await executor.run(f"Execute this plan: {plan}")
    ```

- **Azure Identity Integration**. The framework uses `AzureCliCredential` (or `DefaultAzureCredential`) for secure, keyless authentication, eliminating the need to manage API keys directly.

### Microsoft Foundry Agent Service

Microsoft Foundry Agent Service is a more recent addition, introduced at Microsoft Ignite 2024. It allows for the development and deployment of AI agents with more flexible models, such as directly calling open-source LLMs like Llama 3, Mistral, and Cohere.

Microsoft Foundry Agent Service provides stronger enterprise security mechanisms and data storage methods, making it suitable for enterprise applications.

It works out-of-the-box with the Microsoft Agent Framework for building and deploying agents.

This service is currently in Public Preview and supports Python and C# for building agents.

Using the Microsoft Foundry Agent Service Python SDK, we can create an agent with a user-defined tool:

```python
import asyncio
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

# Define tool functions
def get_specials() -> str:
    """Provides a list of specials from the menu."""
    return """
    Special Soup: Clam Chowder
    Special Salad: Cobb Salad
    Special Drink: Chai Tea
    """

def get_item_price(menu_item: str) -> str:
    """Provides the price of the requested menu item."""
    return "$9.99"

async def main() -> None:
    credential = DefaultAzureCredential()
    project_client = AIProjectClient.from_connection_string(
        credential=credential,
        conn_str="your-connection-string",
    )

    agent = project_client.agents.create_agent(
        model="gpt-5-mini",
        name="Host",
        instructions="Answer questions about the menu.",
        tools=[get_specials, get_item_price],
    )

    thread = project_client.agents.create_thread()

    user_inputs = [
        "Hello",
        "What is the special soup?",
        "How much does that cost?",
        "Thank you",
    ]

    for user_input in user_inputs:
        print(f"# User: '{user_input}'")
        message = project_client.agents.create_message(
            thread_id=thread.id,
            role="user",
            content=user_input,
        )
        run = project_client.agents.create_and_process_run(
            thread_id=thread.id, agent_id=agent.id
        )
        messages = project_client.agents.list_messages(thread_id=thread.id)
        print(f"# Agent: {messages.data[0].content[0].text.value}")

if __name__ == "__main__":
    asyncio.run(main())
```

#### Core concepts

Microsoft Foundry Agent Service has the following core concepts:

- **Agent**. Microsoft Foundry Agent Service integrates with Microsoft Foundry. Within Microsoft Foundry, an AI Agent acts as a "smart" microservice that can be used to answer questions (RAG), perform actions, or completely automate workflows. It achieves this by combining the power of generative AI models with tools that allow it to access and interact with real-world data sources. Here's an example of an agent:

    ```python
    agent = project_client.agents.create_agent(
        model="gpt-5-mini",
        name="my-agent",
        instructions="You are helpful agent",
        tools=code_interpreter.definitions,
        tool_resources=code_interpreter.resources,
    )
    ```

    In this example, an agent is created with the model `gpt-5-mini`, a name `my-agent`, and instructions `You are helpful agent`. The agent is equipped with tools and resources to perform code interpretation tasks.

- **Thread and messages**. The thread is another important concept. It represents a conversation or interaction between an agent and a user. Threads can be used to track the progress of a conversation, store context information, and manage the state of the interaction. Here's an example of a thread:

    ```python
    thread = project_client.agents.create_thread()
    message = project_client.agents.create_message(
        thread_id=thread.id,
        role="user",
        content="Could you please create a bar chart for the operating profit using the following data and provide the file to me? Company A: $1.2 million, Company B: $2.5 million, Company C: $3.0 million, Company D: $1.8 million",
    )

    # Ask the agent to perform work on the thread
    run = project_client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)

    # Fetch and log all messages to see the agent's response
    messages = project_client.agents.list_messages(thread_id=thread.id)
    print(f"Messages: {messages}")
    ```

    In the previous code, a thread is created. Thereafter, a message is sent to the thread. By calling `create_and_process_run`, the agent is asked to perform work on the thread. Finally, the messages are fetched and logged to see the agent's response. The messages indicate the progress of the conversation between the user and the agent. It's also important to understand that the messages can be of different types such as text, image, or file, that is the agents work has resulted in for example an image or a text response for example. As a developer, you can then use this information to further process the response or present it to the user.

- **Integrates with the Microsoft Agent Framework**. Microsoft Foundry Agent Service works seamlessly with the Microsoft Agent Framework, which means you can build agents using `FoundryChatClient` and deploy them through the Agent Service for production scenarios.

**Use Cases**: Microsoft Foundry Agent Service is designed for enterprise applications that require secure, scalable, and flexible AI agent deployment.

### What's the difference between these approaches?

It does sound like there is overlap, but there are some key differences in terms of their design, capabilities, and target use cases:

- **Microsoft Agent Framework (MAF)**: Is a production-ready SDK for building AI agents. It provides a streamlined API for creating agents with tool calling, conversation management, and Azure identity integration.
- **Microsoft Foundry Agent Service**: Is a platform and deployment service in Microsoft Foundry for agents. It offers built-in connectivity to services like Azure OpenAI, Azure AI Search, Bing Search and code execution.

Still not sure which one to choose?

#### Use Cases

Let's see if we can help you by going through some common use cases:

> Q: I'm building production AI agent applications and want to get started quickly
>

>A: The Microsoft Agent Framework is a great choice. It provides a simple, Pythonic API via `FoundryChatClient` that lets you define agents with tools and instructions in just a few lines of code.

>Q: I need enterprise-grade deployment with Azure integrations like Search and code execution
>
> A: Microsoft Foundry Agent Service is the best fit. It's a platform service that provides built-in capabilities for multiple models, Azure AI Search, Bing Search and Azure Functions. It makes it easy to build your agents in the Foundry Portal and deploy them at scale.

> Q: I'm still confused, just give me one option
>
> A: Start with the Microsoft Agent Framework to build your agents, and then use Microsoft Foundry Agent Service when you need to deploy and scale them in production. This approach lets you iterate quickly on your agent logic while having a clear path to enterprise deployment.

Let's summarize the key differences in a table:

| Framework | Focus | Core Concepts | Use Cases |
| --- | --- | --- | --- |
| Microsoft Agent Framework | Streamlined agent SDK with tool calling | Agents, Tools, Azure Identity | Building AI agents, tool use, multi-step workflows |
| Microsoft Foundry Agent Service | Flexible models, enterprise security, Code generation, Tool calling | Modularity, Collaboration, Process Orchestration | Secure, scalable, and flexible AI agent deployment |

### Can I integrate my existing Azure ecosystem tools directly, or do I need standalone solutions?

The answer is yes, you can integrate your existing Azure ecosystem tools directly with Microsoft Foundry Agent Service especially, as it has been built to work seamlessly with other Azure services. You could for example integrate Bing, Azure AI Search, and Azure Functions. There's also deep integration with Microsoft Foundry.

The Microsoft Agent Framework also integrates with Azure services through `FoundryChatClient` and Azure identity, letting you call Azure services directly from your agent tools.

### Sample Codes

- Python: [Agent Framework (Microsoft Foundry)](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/02-explore-agentic-frameworks/code_samples/02-python-agent-framework.ipynb)
- Python: [Agent Framework (Azure OpenAI Responses API)](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/02-explore-agentic-frameworks/code_samples/02-python-agent-framework-azure-openai.ipynb)
- .NET: [Agent Framework](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/02-explore-agentic-frameworks/code_samples/02-dotnet-agent-framework.md)

### References

- <a href="https://techcommunity.microsoft.com/blog/azure-ai-services-blog/introducing-azure-ai-agent-service/4298357" target="_blank">Azure Agent Service</a>
- <a href="https://learn.microsoft.com/azure/ai-services/openai/how-to/responses" target="_blank">Microsoft Agent Framework - Azure OpenAI Responses</a>
- <a href="https://learn.microsoft.com/azure/ai-services/agents/overview" target="_blank">Microsoft Foundry Agent Service</a>
