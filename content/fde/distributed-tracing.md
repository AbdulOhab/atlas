---
title: "Observability with Distributed Tracing"
order: 22
summary: "Following one request across services: traces, spans and context propagation with OpenTelemetry."
category: "Platform Engineering"
level: Intermediate
---

# Observability with Distributed Tracing

In a distributed platform, one user action touches many services. Traces stitch those hops into one story.

**Course milestone:** Platform Engineering

## Traces

> **Source:** [Traces](https://opentelemetry.io/docs/concepts/signals/traces/) · [OpenTelemetry docs](https://github.com/open-telemetry/opentelemetry.io), CC BY 4.0

**Traces** give us the big picture of what happens when a request is made to an
application. Whether your application is a monolith with a single database or a
sophisticated mesh of services, traces are essential to understanding the full
"path" a request takes in your application.

Let's explore this with three units of work, represented as [Spans](#spans):

> **Note:**
>
> The following JSON examples do not represent a specific format, and especially
> not [OTLP/JSON](https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding), which is more
> verbose.

`hello` span:

```json
{
  "name": "hello",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "051581bf3cb55c13"
  },
  "parent_id": null,
  "start_time": "2022-04-29T18:52:58.114201Z",
  "end_time": "2022-04-29T18:52:58.114687Z",
  "attributes": {
    "http.route": "some_route1"
  },
  "events": [
    {
      "name": "Guten Tag!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

This is the root span, denoting the beginning and end of the entire operation.
Note that it has a `trace_id` field indicating the trace, but has no
`parent_id`. That's how you know it's the root span.

`hello-greetings` span:

```json
{
  "name": "hello-greetings",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "5fb397be34d26b51"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114304Z",
  "end_time": "2022-04-29T22:52:58.114561Z",
  "attributes": {
    "http.route": "some_route2"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    },
    {
      "name": "bye now!",
      "timestamp": "2022-04-29T18:52:58.114585Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

This span encapsulates specific tasks, like saying greetings, and its parent is
the `hello` span. Note that it shares the same `trace_id` as the root span,
indicating it's a part of the same trace. Additionally, it has a `parent_id`
that matches the `span_id` of the `hello` span.

`hello-salutations` span:

```json
{
  "name": "hello-salutations",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "93564f51e1abe1c2"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114492Z",
  "end_time": "2022-04-29T18:52:58.114631Z",
  "attributes": {
    "http.route": "some_route3"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

This span represents the third operation in this trace and, like the previous
one, it's a child of the `hello` span. That also makes it a sibling of the
`hello-greetings` span.

These three blocks of JSON all share the same `trace_id`, and the `parent_id`
field represents a hierarchy. That makes it a Trace!

Another thing you'll note is that each Span looks like a structured log. That's
because it kind of is! One way to think of Traces is that they're a collection
of structured logs with context, correlation, hierarchy, and more baked in.
However, these "structured logs" can come from different processes, services,
VMs, data centers, and so on. This is what allows tracing to represent an
end-to-end view of any system.

To understand how tracing in OpenTelemetry works, let's look at a list of
components that will play a part in instrumenting our code.

### Tracer Provider

A Tracer Provider (sometimes called `TracerProvider`) is a factory for
`Tracer`s. In most applications, a Tracer Provider is initialized once and its
lifecycle matches the application's lifecycle. Tracer Provider initialization
also includes Resource and Exporter initialization. It is typically the first
step in tracing with OpenTelemetry. In some language SDKs, a global Tracer
Provider is already initialized for you.

### Tracer

A Tracer creates spans containing more information about what is happening for a
given operation, such as a request in a service. Tracers are created from Tracer
Providers.

### Trace Exporters

Trace Exporters send traces to a consumer. This consumer can be standard output
for debugging and development-time, the OpenTelemetry Collector, or any open
source or vendor backend of your choice.

### Context Propagation

Context Propagation is the core concept that enables Distributed Tracing. With
Context Propagation, Spans can be correlated with each other and assembled into
a trace, regardless of where Spans are generated. To learn more about this
topic, see the concept page on [Context Propagation](https://github.com/open-telemetry/opentelemetry.io/blob/HEAD/content/en/docs/context-propagation).

### Spans

A **span** represents a unit of work or operation. Spans are the building blocks
of Traces. In OpenTelemetry, they include the following information:

- Name
- Parent span ID (empty for root spans)
- Start and End Timestamps
- [Span Context](#span-context)
- [Attributes](#attributes)
- [Span Events](#span-events)
- [Span Links](#span-links)
- [Span Status](#span-status)

Sample span:

```json
{
  "name": "/v1/sys/health",
  "context": {
    "trace_id": "7bba9f33312b3dbb8b2c2c62bb7abe2d",
    "span_id": "086e83747d0e381e"
  },
  "parent_id": "",
  "start_time": "2021-10-22 16:04:01.209458162 +0000 UTC",
  "end_time": "2021-10-22 16:04:01.209514132 +0000 UTC",
  "status_code": "STATUS_CODE_OK",
  "status_message": "",
  "attributes": {
    "net.transport": "IP.TCP",
    "net.peer.ip": "172.17.0.1",
    "net.peer.port": "51820",
    "net.host.ip": "10.177.2.152",
    "net.host.port": "26040",
    "http.method": "GET",
    "http.target": "/v1/sys/health",
    "http.server_name": "mortar-gateway",
    "http.route": "/v1/sys/health",
    "http.user_agent": "Consul Health Check",
    "http.scheme": "http",
    "http.host": "10.177.2.152:26040",
    "http.flavor": "1.1"
  },
  "events": [
    {
      "name": "",
      "message": "OK",
      "timestamp": "2021-10-22 16:04:01.209512872 +0000 UTC"
    }
  ]
}
```

Spans can be nested, as is implied by the presence of a parent span ID: child
spans represent sub-operations. This allows spans to more accurately capture the
work done in an application.

#### Span Context

Span context is an immutable object on every span that contains the following:

- The Trace ID representing the trace that the span is a part of
- The span's Span ID
- Trace Flags, a binary encoding containing information about the trace
- Trace State, a list of key-value pairs that can carry vendor-specific trace
  information

Span context is the part of a span that is serialized and propagated alongside
[Distributed Context](#context-propagation) and [Baggage](https://github.com/open-telemetry/opentelemetry.io/blob/HEAD/content/en/docs/concepts/baggage).

Because Span Context contains the Trace ID, it is used when creating
[Span Links](#span-links).

#### Attributes

Attributes are key-value pairs that contain metadata that you can use to
annotate a Span to carry information about the operation it is tracking.

For example, if a span tracks an operation that adds an item to a user's
shopping cart in an eCommerce system, you can capture the user's ID, the ID of
the item to add to the cart, and the cart ID.

You can add attributes to spans during or after span creation. Prefer adding
attributes at span creation to make the attributes available to SDK sampling. If
you have to add a value after span creation, update the span with the value.

Attributes have the following rules that each language SDK implements:

- Keys must be non-null string values
- Values must be a non-null string, boolean, floating point value, integer, or
  an array of these values

Additionally, there are
[Semantic Attributes](https://opentelemetry.io/docs/specs/semconv/general/trace/), which are known
naming conventions for metadata that is typically present in common operations.
It's helpful to use semantic attribute naming wherever possible so that common
kinds of metadata are standardized across systems.

#### Span Events

A Span Event can be thought of as a structured log message (or annotation) on a
Span, typically used to denote a meaningful, singular point in time during the
Span's duration.

For example, consider two scenarios in a web browser:

1. Tracking a page load
2. Denoting when a page becomes interactive

A Span is best used to track the first scenario because it's an operation with a
start and an end.

A Span Event is best used to track the second scenario because it represents a
meaningful, singular point in time.

##### When to use span events versus span attributes

Since span events also contain attributes, the question of when to use events
instead of attributes might not always have an obvious answer. To inform your
decision, consider whether a specific timestamp is meaningful.

For example, when you're tracking an operation with a span and the operation
completes, you might want to add data from the operation to your telemetry.

- If the timestamp in which the operation completes is meaningful or relevant,
  attach the data to a span event.
- If the timestamp isn't meaningful, attach the data as span attributes.

#### Span Links

Links exist so that you can associate one span with one or more spans, implying
a causal relationship. For example, let’s say we have a distributed system where
some operations are tracked by a trace.

In response to some of these operations, an additional operation is queued to be
executed, but its execution is asynchronous. We can track this subsequent
operation with a trace as well.

We would like to associate the trace for the subsequent operations with the
first trace, but we cannot predict when the subsequent operations will start. We
need to associate these two traces, so we will use a span link.

You can link the last span from the first trace to the first span in the second
trace. Now, they are causally associated with one another.

Links are optional but serve as a good way to associate trace spans with one
another.

For more information see [Span Links](https://opentelemetry.io/docs/specs/otel/trace/api/#link).

#### Span Status

Each span has a status. The three possible values are:

- `Unset`
- `Error`
- `Ok`

The default value is `Unset`. A span status that is `Unset` means that the
operation it tracked successfully completed without an error.

When a span status is `Error`, then that means some error occurred in the
operation it tracks. For example, this could be due to an HTTP 500 error on a
server handling a request.

When a span status is `Ok`, then that means the span was explicitly marked as
error-free by the developer of an application. Although this is unintuitive,
it's not required to set a span status as `Ok` when a span is known to have
completed without error, as this is covered by `Unset`. What `Ok` does is
represent an unambiguous "final call" on the status of a span that has been
explicitly set by a user. This is helpful in any situation where a developer
wishes for there to be no other interpretation of a span other than
"successful".

To reiterate: `Unset` represents a span that completed without an error. `Ok`
represents when a developer explicitly marks a span as successful. In most
cases, it is not necessary to explicitly mark a span as `Ok`.

#### Span Kind

When a span is created, it is one of `Client`, `Server`, `Internal`, `Producer`,
or `Consumer`. This span kind provides a hint to the tracing backend as to how
the trace should be assembled. According to the OpenTelemetry specification, the
parent of a server span is often a remote client span, and the child of a client
span is usually a server span. Similarly, the parent of a consumer span is
always a producer and the child of a producer span is always a consumer. If not
provided, the span kind is assumed to be internal.

For more information regarding SpanKind, see
[SpanKind](https://opentelemetry.io/docs/specs/otel/trace/api/#spankind).

##### Client

A client span represents a synchronous outgoing remote call such as an outgoing
HTTP request or database call. Note that in this context, "synchronous" does not
refer to `async/await`, but to the fact that it is not queued for later
processing.

##### Server

A server span represents a synchronous incoming remote call such as an incoming
HTTP request or remote procedure call.

##### Internal

Internal spans represent operations which do not cross a process boundary.
Things like instrumenting a function call or an Express middleware may use
internal spans.

##### Producer

Producer spans represent the creation of a job which may be asynchronously
processed later. It may be a remote job such as one inserted into a job queue or
a local job handled by an event listener.

##### Consumer

Consumer spans represent the processing of a job created by a producer and may
start long after the producer span has already ended.

### Specification

For more information, see the
[traces specification](https://opentelemetry.io/docs/specs/otel/overview/#tracing-signal).

## Context propagation

> **Source:** [Context propagation](https://opentelemetry.io/docs/concepts/context-propagation/) · [OpenTelemetry docs](https://github.com/open-telemetry/opentelemetry.io), CC BY 4.0

With context propagation, [signals](https://github.com/open-telemetry/opentelemetry.io/blob/HEAD/content/en/docs/concepts/signals) ([traces](https://github.com/open-telemetry/opentelemetry.io/blob/HEAD/content/en/docs/concepts/signals/traces),
[metrics](https://github.com/open-telemetry/opentelemetry.io/blob/HEAD/content/en/docs/concepts/signals/metrics), and [logs](https://github.com/open-telemetry/opentelemetry.io/blob/HEAD/content/en/docs/concepts/signals/logs)) can be correlated
with each other, regardless of where they are generated. Although not limited to
tracing, context propagation allows [traces](https://github.com/open-telemetry/opentelemetry.io/blob/HEAD/content/en/docs/concepts/signals/traces) to build causal
information about a system across services that are arbitrarily distributed
across process and network boundaries.

To understand context propagation, you need to understand two separate concepts:
context and propagation.

### Context

Context is an object that contains the information for the sending and receiving
service, or [execution unit](https://opentelemetry.io/docs/specs/otel/glossary/#execution-unit), to
correlate one signal with another.

When Service A calls Service B, Service A includes a trace ID and a span ID as
part of the context. Service B uses these values to create a new span that
belongs to the same trace, setting the span from Service A as its parent. This
makes it possible to track the full flow of a request across service boundaries.

### Propagation

Propagation is the mechanism that moves context between services and processes.
It serializes or deserializes the context object and provides the relevant
information to be propagated from one service to another.

Propagation is usually handled by instrumentation libraries and is transparent
to the user. In the event that you need to manually propagate context, you can
use the [Propagators API](https://opentelemetry.io/docs/specs/otel/context/api-propagators/).

OpenTelemetry maintains several official propagators. The default propagator
uses the headers specified by the
[W3C TraceContext](https://www.w3.org/TR/trace-context/) specification.

### Example

A service called `Frontend` that provides different HTTP endpoints such as
`POST /cart/add` and `GET /checkout/` reaches out to a downstream service
`Product Catalog` via an HTTP endpoint `GET /product` to receive details on
products that a user wants to add to the cart or that are part of the checkout.
To understand activities in the `Product Catalog` service within the context of
requests coming from `Frontend`, the context (here: Trace ID and Span ID as
"Parent ID") is propagated using the `traceparent` header as it is defined in
the W3C TraceContext specification. This means the IDs are embedded in the
fields of the header:

```text
<version>-<trace-id>-<parent-id>-<trace-flags>
```

For example:

```text
00-a0892f3577b34da6a3ce929d0e0e4736-f03067aa0ba902b7-01
```

#### Traces

As mentioned, context propagation allows traces to build causal information
across services. In this example, the two calls to the HTTP endpoint
`GET /product` of service `Product Catalog` can be correlated with their
upstream calls in service `Frontend` by extracting the remote context from the
`traceparent` header and injecting it into the local context to set the Trace ID
and Parent ID. With that, it is possible in a [backend](https://opentelemetry.io/ecosystem/vendors) like
[Jaeger](https://jaegertracing.io) to see two requests as spans of one trace.

![Context propagation example showing trace correlation across services](https://raw.githubusercontent.com/open-telemetry/opentelemetry.io/HEAD/content/en/docs/concepts/context-propagation/context-propagation-example.svg)

#### Logs

OpenTelemetry SDKs are able to automatically correlate logs with traces. This
means they can inject context (Trace ID, Span ID) into a log record. This not
only enables you to see logs in the context of the trace and span they belong
to, but it also enables you to see logs that belong together across service or
execution unit boundaries.

#### Metrics

In the case of metrics, context propagation enables you to aggregate
measurements in that context. For example, instead of only looking at the
response time of all the `GET /product` requests, you can also get metrics for
combinations of `POST /cart/add > GET /product` and
`GET /checkout > GET /product`.

| Name                            | Calls Per Second | Average Response Time |
| ------------------------------- | ---------------- | --------------------- |
| `* > GET /product`              | 370              | 300ms                 |
| `POST /cart/add > GET /product` | 330              | 130ms                 |
| `GET /checkout > GET /product`  | 40               | 1703ms                |

### Custom Context Propagation

For most use cases, you will find
[instrumentation libraries or native library instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/libraries/)
that handle the context propagation for you. In some cases no such support is
available and you want to create that support for yourself. To do so you need to
leverage the previously mentioned Propagators API:

- On the side of the sender, the context is
  [injected](https://opentelemetry.io/docs/specs/otel/context/api-propagators/#inject) into the carrier,
  for example, into the headers of an HTTP request. In other cases, you need to
  find a place that can store metadata for your request.
- On the receiving side, the context is
  [extracted](https://opentelemetry.io/docs/specs/otel/context/api-propagators/#extract) from the
  carrier. Again, in the case of HTTP, this is retrieved from the headers. In
  other cases, you pick the place you chose on the sending side to store the
  context.

Note that it is possible to propagate context in protocols that do not have a
dedicated field for metadata, but you have to make sure that on the receiving
side they are extracted and removed before the data is processed, otherwise you
may create undefined behavior.

For the following languages a step-by-step tutorial exists for custom context
propagation:

- [Erlang](https://opentelemetry.io/docs/languages/erlang/propagation/#manual-context-propagation)
- [JavaScript](https://opentelemetry.io/docs/languages/js/propagation/#manual-context-propagation)
- [PHP](https://opentelemetry.io/docs/languages/php/propagation/#manual-context-propagation)
- [Python](https://opentelemetry.io/docs/languages/python/propagation/#manual-context-propagation)

### Security best practices

Propagation involves sending and receiving data across service boundaries, which
can have security implications.

#### External services

When your service interacts with external services (services you do not own or
trust), consider the following:

- **Incoming context**: Be cautious when accepting context from external
  sources. Malicious actors could send forged trace headers to manipulate your
  tracing data or potentially exploit vulnerabilities in context parsing. You
  might want to ignore or sanitize incoming context from untrusted sources.
- **Outgoing context**: Be mindful of what you propagate to external services.
  Internal trace IDs, span IDs, or baggage items might reveal sensitive
  information about your internal architecture or business logic. You may want
  to configure your propagators to not send context to external or public-facing
  endpoints.

#### Baggage

[Baggage](https://github.com/open-telemetry/opentelemetry.io/blob/HEAD/content/en/docs/concepts/signals/baggage) allows you to propagate arbitrary key-value
pairs. Since this data is propagated across service boundaries, avoid putting
sensitive information (like user credentials, API keys, or PII) in baggage, as
it might be logged or sent to untrusted downstream services.

### Support in Language SDKs

For the individual language-specific implementations of the OpenTelemetry API &
SDK, you will find details on the support of context propagation in the
respective documentation pages:

- [C++](https://opentelemetry.io/docs/languages/cpp/instrumentation/#context-propagation)
- .NET
- [Erlang](https://opentelemetry.io/docs/languages/erlang/propagation/)
- [Go](https://opentelemetry.io/docs/languages/go/instrumentation/#propagators-and-context)
- [Java](https://opentelemetry.io/docs/languages/java/api/#context-api)
- [JavaScript](https://opentelemetry.io/docs/languages/js/propagation/)
- [PHP](https://opentelemetry.io/docs/languages/php/propagation/)
- [Python](https://opentelemetry.io/docs/languages/python/propagation/)
- [Ruby](https://opentelemetry.io/docs/languages/ruby/instrumentation/#context-propagation)
- Rust
- Swift

> [!IMPORTANT] Help wanted
>
> For languages .NET, Rust, and Swift, the language-specific documentation for
> context propagation is missing. If you know any of those languages and are
> interested to help, [learn how you can contribute](https://opentelemetry.io/docs/contributing/)!

### Specification

To learn more about context propagation, see the
[Context specification](https://opentelemetry.io/docs/specs/otel/context/).
