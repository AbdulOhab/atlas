---
title: "Designing Log Intelligence Systems with LLMs"
order: 18
summary: "Logs as a data source for LLMs: how logs are structured and correlated, and how agents retrieve from them."
category: "Agentic System Design"
level: Intermediate
---

# Designing Log Intelligence Systems with LLMs

Before an LLM can reason about logs, the logs need structure and correlation with traces. Agentic retrieval then pulls the right slice into context. For log pipelines themselves, see the DevOps track's [Logging](/devops/logging) module.

**Course milestone:** Agentic System Design

## Logs

> **Source:** [Logs](https://opentelemetry.io/docs/concepts/signals/logs/) · [OpenTelemetry docs](https://github.com/open-telemetry/opentelemetry.io), CC BY 4.0

A **log** is a timestamped text record, either structured (recommended) or
unstructured, with optional metadata. Of all telemetry signals, logs have the
biggest legacy. Most programming languages have built-in logging capabilities or
well-known, widely used logging libraries.

### OpenTelemetry logs

OpenTelemetry provides a Logs API and SDK for producing log records, and
language SDKs and logging bridges to integrate with existing logging frameworks.
Logs are anything you send through a Logging Provider, and events are a special
type of logs. Not all logs are events, but all events are logs. The Logs API is
public and can be used directly by application code or indirectly via existing
logging libraries and bridges.

OpenTelemetry is designed to work with the logs you already produce, offering
tools to correlate logs with other signals, add contextual attributes, and
normalize different sources into a common representation for processing and
export.

#### OpenTelemetry logs in the OpenTelemetry Collector

The [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) provides several tools to work
with logs:

- Several receivers which parse logs from specific, known sources of log data.
- The `filelogreceiver`, which reads logs from any file and provides features to
  parse them from different formats or use a regular expression.
- Processors like the `transformprocessor` which lets you parse nested data,
  flatten nested structures, add/remove/update values, and more.
- Exporters that let you emit log data in a non-OpenTelemetry format.

The first step in adopting OpenTelemetry frequently involves deploying a
Collector as a general-purposes logging agent.

#### OpenTelemetry logs for applications

In applications, OpenTelemetry logs are created with any logging library or
built-in logging capabilities. When you add autoinstrumentation or activate an
SDK, OpenTelemetry will automatically correlate your existing logs with any
active trace and span, wrapping the log body with their IDs. In other words,
OpenTelemetry automatically correlates your logs and traces.

#### Language support

Logs are a [stable](https://opentelemetry.io/docs/specs/otel/versioning-and-stability/#stable) signal in
the OpenTelemetry specification. For the individual language specific
implementations of the Logs API & SDK, the status is as follows:

### Structured, unstructured, and semistructured logs

OpenTelemetry accepts any log format, but not all formats are equally useful for
analysis. The following section explains the differences between structured,
semistructured, and unstructured logs. Important: a log encoded as JSON is not
automatically "structured" in the sense of having a stable schema —it may be
semistructured. Structured logs imply a consistent schema or well-defined typed
fields that downstream processing can reliably depend on.

#### Structured logs

A structured log is a log with a defined, consistent schema or typed fields that
downstream systems can reliably parse and interpret. The textual encoding can be
JSON, protobuf, or another format, but what makes a log structured is the
presence of a stable schema (field names, types, and semantics), not merely that
it is valid JSON. For example, a structured JSON log might look like:

```json
{
  "timestamp": "2024-08-04T12:34:56.789Z",
  "level": "INFO",
  "service": "user-authentication",
  "environment": "production",
  "message": "User login successful",
  "context": {
    "userId": "12345",
    "username": "johndoe",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
  },
  "transactionId": "abcd-efgh-ijkl-mnop",
  "duration": 200,
  "request": {
    "method": "POST",
    "url": "/api/v1/login",
    "headers": {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    "body": {
      "username": "johndoe",
      "password": "******"
    }
  },
  "response": {
    "statusCode": 200,
    "body": {
      "success": true,
      "token": "jwt-token-here"
    }
  }
}
```

and for infrastructure components, Common Log Format (CLF) is commonly used:

```text
127.0.0.1 - johndoe [04/Aug/2024:12:34:56 -0400] "POST /api/v1/login HTTP/1.1" 200 1234
```

It is also common to encounter hybrid or extended formats (for example, CLF
fields combined with a trailing JSON blob).

```text
192.168.1.1 - johndoe [04/Aug/2024:12:34:56 -0400] "POST /api/v1/login HTTP/1.1" 200 1234 "http://example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36" {"transactionId": "abcd-efgh-ijkl-mnop", "responseTime": 150, "requestBody": {"username": "johndoe"}, "responseHeaders": {"Content-Type": "application/json"}}
```

In those cases, parse or extract the parts you need into a normalized record so
downstream tooling can analyze them consistently. The `filelogreceiver` in the
[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) provides helpers to parse mixed
formats.

Structured logs are preferred in production because their stable schema makes
them straightforward to validate, parse, correlate with traces and metrics, and
analyze at scale.

#### Unstructured logs

Unstructured logs are logs that don't follow a consistent structure. They may be
more human-readable, and are often used in development. However, it is not
preferred to use unstructured logs for production observability purposes, since
they are much more difficult to parse and analyze at scale.

Examples of unstructured logs:

```text
[ERROR] 2024-08-04 12:45:23 - Failed to connect to database. Exception: java.sql.SQLException: Timeout expired. Attempted reconnect 3 times. Server: db.example.com, Port: 5432

System reboot initiated at 2024-08-04 03:00:00 by user: admin. Reason: Scheduled maintenance. Services stopped: web-server, database, cache. Estimated downtime: 15 minutes.

DEBUG - 2024-08-04 09:30:15 - User johndoe performed action: file_upload. Filename: report_Q3_2024.pdf, Size: 2.3 MB, Duration: 5.2 seconds. Result: Success
```

It is possible to store and analyze Unstructured logs in production, although
you may need to do substantial work to parse or otherwise pre-process them to be
machine-readable. For example, the above three logs will require a regular
expression to parse their timestamps and custom parsers to consistently extract
the bodies of the log message. This will typically be necessary for a logging
backend to know how to sort and organize the logs by timestamp. Although it's
possible to parse unstructured logs for analysis purposes, doing this may be
more work than switching to structured logging, such as via a standard logging
framework in your applications.

#### Semistructured logs

Semistructured logs include machine-readable key/value pairs or delimited fields
but do not guarantee a stable schema across emitters. Examples include key=value
logging (shown below) or JSON blobs where field names and types vary between
messages. Semistructured logs are often easier to parse than unstructured logs
but may still require processing and normalization before analysis.

Example of a semistructured log:

```text
2024-08-04T12:45:23Z level=ERROR service=user-authentication userId=12345 action=login message="Failed login attempt" error="Invalid password" ipAddress=192.168.1.1 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
```

Semistructured logs may require mapping and type coercion during ingestion to be
fully useful for downstream analysis.

### Checking whether logging is enabled

A common question is whether application code should check if logging is enabled
before making a logging call, for example:

```text
if (logger.Enabled(...)) {
  logger.Info("Hello {name}", name);
}
```

In most cases this check is unnecessary and not recommended. OpenTelemetry SDKs
are designed to be efficient -- the invocation of the logging API has minimum
overhead when the logger is not enabled. Making an extra call to
`logger.Enabled` decreases performance and makes your code harder.

The `Enabled` API is useful only when _evaluating the arguments_ passed to the
logging call is itself expensive, and you want to avoid that cost when the
logger is not enabled. For example, if the body or an attribute must be fetched
from a database or computed through an expensive operation:

```text
if (logger.Enabled(...)) {
  logger.Info("Order total {total}", ComputeExpensiveTotal());
}
```

Only guard expressions that are free of side effects, since the guarded code
runs only when logging is enabled. Guarding code that has side effects, or that
other logic depends on, makes your application's behavior depend on the logging
configuration, which is usually a source of subtle bugs.

Even then, keep in mind that the result of `Enabled` is not static: it can
change over time as configuration changes, so it should be evaluated per log
record and not cached.

For normative API guidance, see
[Logs API specification](https://opentelemetry.io/docs/specs/otel/logs/api/#enabled).

### OpenTelemetry logging components

The following lists of concepts and components power OpenTelemetry's logging
support.

#### Log Appender / Bridge

As an application developer, the **Logs Bridge API** should not be called by you
directly, as it is provided for logging library authors to build log appenders /
bridges. Instead, you just use your preferred logging library and configure it
to use a log appender (or log bridge) that is able to emit logs into an
OpenTelemetry LogRecordExporter.

OpenTelemetry language SDKs offer this functionality.

#### Logger Provider

> Part of the **Logs Bridge API** and should only be used if you are the author
> of a logging library.

A Logger Provider (sometimes called `LoggerProvider`) is a factory for
`Logger`s. In most cases, the Logger Provider is initialized once and its
lifecycle matches the application's lifecycle. Logger Provider initialization
also includes Resource and Exporter initialization.

#### Logger

> Part of the **Logs Bridge API** and should only be used if you are the author
> of a logging library.

A Logger creates log records. Loggers are created from Log Providers.

#### Log Record Exporter

Log Record Exporters send log records to a consumer. This consumer can be
standard output for debugging and development-time, the OpenTelemetry Collector,
or any open source or vendor backend of your choice.

#### Log Record

A log record represents the recording of an event. In OpenTelemetry a log record
contains two kinds of fields:

- Named top-level fields of specific type and meaning
- Resource and attributes fields of arbitrary value and type

The top-level fields are:

| Field Name           | Description                                          |
| -------------------- | ---------------------------------------------------- |
| Timestamp            | Time when the event occurred.                        |
| ObservedTimestamp    | Time when the event was observed.                    |
| TraceId              | Request trace ID.                                    |
| SpanId               | Request span ID.                                     |
| TraceFlags           | W3C trace flag.                                      |
| SeverityText         | The severity text (also known as log level).         |
| SeverityNumber       | Numerical value of the severity.                     |
| Body                 | The body of the log record.                          |
| Resource             | Describes the source of the log.                     |
| InstrumentationScope | Describes the scope that emitted the log.            |
| Attributes           | Additional information about the event.              |
| EventName            | Name that identifies the class or type of the event. |

For more details on log records and log fields, see
[Logs Data Model](https://opentelemetry.io/docs/specs/otel/logs/data-model/).

#### Specification

To learn more about logs in OpenTelemetry, see the [logs specification][].

[logs specification]: /docs/specs/otel/overview/#log-signal

## Agentic RAG

> **Source:** [Agentic RAG](https://github.com/microsoft/ai-agents-for-beginners/tree/HEAD/05-agentic-rag) · [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners), MIT

This lesson provides a comprehensive overview of Agentic Retrieval-Augmented Generation (Agentic RAG), an emerging AI paradigm where large language models (LLMs) autonomously plan their next steps while pulling information from external sources. Unlike static retrieval-then-read patterns, Agentic RAG involves iterative calls to the LLM, interspersed with tool or function calls and structured outputs. The system evaluates results, refines queries, invokes additional tools if needed, and continues this cycle until a satisfactory solution is achieved.

### Introduction

This lesson will cover

- **Understand Agentic RAG:**  Learn about the emerging paradigm in AI where large language models (LLMs) autonomously plan their next steps while pulling information from external data sources.
- **Grasp Iterative Maker-Checker Style:** Comprehend the loop of iterative calls to the LLM, interspersed with tool or function calls and structured outputs, designed to improve correctness and handle malformed queries.
- **Explore Practical Applications:** Identify scenarios where Agentic RAG shines, such as correctness-first environments, complex database interactions, and extended workflows.

### Learning Goals

After completing this lesson, you will know how to/understand:

- **Understanding Agentic RAG:** Learn about the emerging paradigm in AI where large language models (LLMs) autonomously plan their next steps while pulling information from external data sources.
- **Iterative Maker-Checker Style:** Grasp the concept of a loop of iterative calls to the LLM, interspersed with tool or function calls and structured outputs, designed to improve correctness and handle malformed queries.
- **Owning the Reasoning Process:** Comprehend the system's ability to own its reasoning process, making decisions on how to approach problems without relying on pre-defined paths.
- **Workflow:** Understand how an agentic model independently decides to retrieve market trend reports, identify competitor data, correlate internal sales metrics, synthesize findings, and evaluate the strategy.
- **Iterative Loops, Tool Integration, and Memory:** Learn about the system's reliance on a looped interaction pattern, maintaining state and memory across steps to avoid repetitive loops and make informed decisions.
- **Handling Failure Modes and Self-Correction:** Explore the system's robust self-correction mechanisms, including iterating and re-querying, using diagnostic tools, and falling back on human oversight.
- **Boundaries of Agency:** Understand the limitations of Agentic RAG, focusing on domain-specific autonomy, infrastructure dependence, and respect for guardrails.
- **Practical Use Cases and Value:** Identify scenarios where Agentic RAG shines, such as correctness-first environments, complex database interactions, and extended workflows.
- **Governance, Transparency, and Trust:** Learn about the importance of governance and transparency, including explainable reasoning, bias control, and human oversight.

### What is Agentic RAG?

Agentic Retrieval-Augmented Generation (Agentic RAG) is an emerging AI paradigm where large language models (LLMs) autonomously plan their next steps while pulling information from external sources. Unlike static retrieval-then-read patterns, Agentic RAG involves iterative calls to the LLM, interspersed with tool or function calls and structured outputs. The system evaluates results, refines queries, invokes additional tools if needed, and continues this cycle until a satisfactory solution is achieved. This iterative “maker-checker” style improves correctness, handles malformed queries, and ensures high-quality results.

The system actively owns its reasoning process, rewriting failed queries, choosing different retrieval methods, and integrating multiple tools—such as vector search in Azure AI Search, SQL databases, or custom APIs—before finalizing its answer. The distinguishing quality of an agentic system is its ability to own its reasoning process. Traditional RAG implementations rely on pre-defined paths, but an agentic system autonomously determines the sequence of steps based on the quality of the information it finds.

### Defining Agentic Retrieval-Augmented Generation (Agentic RAG)

Agentic Retrieval-Augmented Generation (Agentic RAG) is an emerging paradigm in AI development where LLMs not only pull information from external data sources but also autonomously plan their next steps. Unlike static retrieval-then-read patterns or carefully scripted prompt sequences, Agentic RAG involves a loop of iterative calls to the LLM, interspersed with tool or function calls and structured outputs. At every turn, the system evaluates the results it has obtained, decides whether to refine its queries, invokes additional tools if needed, and continues this cycle until it achieves a satisfactory solution.

This iterative “maker-checker” style of operation is designed to improve correctness, handle malformed queries to structured databases (e.g. NL2SQL), and ensure balanced, high-quality results. Rather than relying solely on carefully engineered prompt chains, the system actively owns its reasoning process. It can rewrite queries that fail, choose different retrieval methods, and integrate multiple tools—such as vector search in Azure AI Search, SQL databases, or custom APIs—before finalizing its answer. This removes the need for overly complex orchestration frameworks. Instead, a relatively simple loop of “LLM call → tool use → LLM call → …” can yield sophisticated and well-grounded outputs.

![Agentic RAG Core Loop](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/05-agentic-rag/images/agentic-rag-core-loop.png)

### Owning the Reasoning Process

The distinguishing quality that makes a system “agentic” is its ability to own its reasoning process. Traditional RAG implementations often depend on humans pre-defining a path for the model: a chain-of-thought that outlines what to retrieve and when.
But when a system is truly agentic, it internally decides how to approach the problem. It’s not just executing a script; it’s autonomously determining the sequence of steps based on the quality of the information it finds.
For example, if it’s asked to create a product launch strategy, it doesn’t rely solely on a prompt that spells out the entire research and decision-making workflow. Instead, the agentic model independently decides to:

1. Retrieve current market trend reports using Bing Web Grounding
2. Identify relevant competitor data using Azure AI Search.
3.	Correlate historical internal sales metrics using Azure SQL Database.
4. Synthesize the findings into a cohesive strategy orchestrated via Azure OpenAI Service.
5.	Evaluate the strategy for gaps or inconsistencies, prompting another round of retrieval if necessary.
All of these steps—refining queries, choosing sources, iterating until “happy” with the answer—are decided by the model, not pre-scripted by a human.

### Iterative Loops, Tool Integration, and Memory

![Tool Integration Architecture](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/05-agentic-rag/images/tool-integration.png)

An agentic system relies on a looped interaction pattern:

- **Initial Call:** The user’s goal (aka. user prompt) is presented to the LLM.
- **Tool Invocation:** If the model identifies missing information or ambiguous instructions, it selects a tool or retrieval method—like a vector database query (e.g. Azure AI Search Hybrid search over private data) or a structured SQL call—to gather more context.
- **Assessment & Refinement:** After reviewing the returned data, the model decides whether the information suffices. If not, it refines the query, tries a different tool, or adjusts its approach.
- **Repeat Until Satisfied:** This cycle continues until the model determines that it has enough clarity and evidence to deliver a final, well-reasoned response.
- **Memory & State:** Because the system maintains state and memory across steps, it can recall previous attempts and their outcomes, avoiding repetitive loops and making more informed decisions as it proceeds.

Over time, this creates a sense of evolving understanding, enabling the model to navigate complex, multi-step tasks without requiring a human to constantly intervene or reshape the prompt.

### Handling Failure Modes and Self-Correction

Agentic RAG’s autonomy also involves robust self-correction mechanisms. When the system hits dead ends—such as retrieving irrelevant documents or encountering malformed queries—it can:

- **Iterate and Re-Query:** Instead of returning low-value responses, the model attempts new search strategies, rewrites database queries, or looks at alternative data sets.
- **Use Diagnostic Tools:** The system may invoke additional functions designed to help it debug its reasoning steps or confirm the correctness of retrieved data. Tools like Azure AI Tracing will be important to enable robust observability and monitoring.
- **Fallback on Human Oversight:** For high-stakes or repeatedly failing scenarios, the model might flag uncertainty and request human guidance. Once the human provides corrective feedback, the model can incorporate that lesson going forward.

This iterative and dynamic approach allows the model to improve continuously, ensuring that it’s not just a one-shot system but one that learns from its missteps during a given session.

![Self Correction Mechanism](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/05-agentic-rag/images/self-correction.png)

### Boundaries of Agency

Despite its autonomy within a task, Agentic RAG is not analogous to Artificial General Intelligence. Its “agentic” capabilities are confined to the tools, data sources, and policies provided by human developers. It can’t invent its own tools or step outside the domain boundaries that have been set. Rather, it excels at dynamically orchestrating the resources at hand.
Key differences from more advanced AI forms include:

1. **Domain-Specific Autonomy:** Agentic RAG systems are focused on achieving user-defined goals within a known domain, employing strategies like query rewriting or tool selection to improve outcomes.
2. **Infrastructure-Dependent:** The system’s capabilities hinge on the tools and data integrated by developers. It can’t surpass these boundaries without human intervention.
3. **Respect for Guardrails:** Ethical guidelines, compliance rules, and business policies remain very important. The agent’s freedom is always constrained by safety measures and oversight mechanisms (hopefully?)

### Practical Use Cases and Value

Agentic RAG shines in scenarios requiring iterative refinement and precision:

1. **Correctness-First Environments:** In compliance checks, regulatory analysis, or legal research, the agentic model can repeatedly verify facts, consult multiple sources, and rewrite queries until it produces a thoroughly vetted answer.
2. **Complex Database Interactions:** When dealing with structured data where queries might often fail or need adjustment, the system can autonomously refine its queries using Azure SQL or Microsoft Fabric OneLake, ensuring the final retrieval aligns with the user’s intent.
3. **Extended Workflows:** Longer-running sessions might evolve as new information surfaces. Agentic RAG can continuously incorporate new data, shifting strategies as it learns more about the problem space.

### Governance, Transparency, and Trust

As these systems become more autonomous in their reasoning, governance and transparency are crucial:

- **Explainable Reasoning:** The model can provide an audit trail of the queries it made, the sources it consulted, and the reasoning steps it took to reach its conclusion. Tools like Azure AI Content Safety and Azure AI Tracing / GenAIOps can help maintain transparency and mitigate risks.
- **Bias Control and Balanced Retrieval:** Developers can tune retrieval strategies to ensure balanced, representative data sources are considered, and regularly audit outputs to detect bias or skewed patterns using custom models for advanced data science organizations using Azure Machine Learning.
- **Human Oversight and Compliance:** For sensitive tasks, human review remains essential. Agentic RAG doesn’t replace human judgment in high-stakes decisions—it augments it by delivering more thoroughly vetted options.

Having tools that provide a clear record of actions is essential. Without them, debugging a multi-step process can be very difficult. See the following example from Literal AI (company behind Chainlit) for an Agent run:

![AgentRunExample](https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/HEAD/05-agentic-rag/images/AgentRunExample.png)

### Conclusion

Agentic RAG represents a natural evolution in how AI systems handle complex, data-intensive tasks. By adopting a looped interaction pattern, autonomously selecting tools, and refining queries until achieving a high-quality result, the system moves beyond static prompt-following into a more adaptive, context-aware decision-maker. While still bounded by human-defined infrastructures and ethical guidelines, these agentic capabilities enable richer, more dynamic, and ultimately more useful AI interactions for both enterprises and end-users.

### Smoke-Testing This Agent (Optional)

After you learn to deploy agents in [Lesson 16](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/16-deploying-scalable-agents/README.md), you can smoke-test this lesson's `TravelRAGAgent` — checking that its answers stay grounded in the knowledge base — with [`tests/lesson-05-smoke-tests.json`](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/tests/lesson-05-smoke-tests.json). See [`tests/README.md`](https://github.com/microsoft/ai-agents-for-beginners/blob/HEAD/tests/README.md) for how to run it.
