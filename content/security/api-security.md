---
title: "API Security"
order: 6
summary: "Securing the service surface: REST and assessing it, web services, GraphQL, gRPC, WebSockets, webhooks, microservices, denial of service and bots."
category: "Security"
level: Intermediate
---

# API Security

Securing the service surface: REST and assessing it, web services, GraphQL, gRPC, WebSockets, webhooks, microservices, denial of service and bots.

## REST Security

> **Source:** [REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

[REST](https://en.wikipedia.org/wiki/REST) (or **RE**presentational **S**tate **T**ransfer) is an architectural style first described in [Roy Fielding](https://en.wikipedia.org/wiki/Roy_Fielding)'s Ph.D. dissertation on [Architectural Styles and the Design of Network-based Software Architectures](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm).

It evolved as Fielding wrote the HTTP/1.1 and URI specs and has been proven to be well-suited for developing distributed hypermedia applications. While REST is more widely applicable, it is most commonly used within the context of communicating with services via HTTP.

The key abstraction of information in REST is a resource. A REST API resource is identified by a URI, usually a HTTP URL. REST components use connectors to perform actions on a resource by using a representation to capture the current or intended state of the resource and transferring that representation.

The primary connector types are client and server, secondary connectors include cache, resolver and tunnel.

REST APIs are stateless. Stateful APIs do not adhere to the REST architectural style. State in the REST acronym refers to the state of the resource which the API accesses, not the state of a session within which the API is called. While there may be good reasons for building a stateful API, it is important to realize that managing sessions is complex and difficult to do securely.

Stateful services are out of scope of this Cheat Sheet: *Passing state from client to backend, while making the service technically stateless, is an anti-pattern that should also be avoided as it is prone to replay and impersonation attacks.*

In order to implement flows with REST APIs, resources are typically created, read, updated and deleted. For example, an ecommerce site may offer methods to create an empty shopping cart, to add items to the cart and to check out the cart. Each of these REST calls is stateless and the endpoint should check whether the caller is authorized to perform the requested operation.

Another key feature of REST applications is the use of standard HTTP verbs and error codes in the pursuit or removing unnecessary variation among different services.

Another key feature of REST applications is the use of [HATEOAS or Hypermedia As The Engine of Application State](https://en.wikipedia.org/wiki/HATEOAS). This provides REST applications a self-documenting nature making it easier for developers to interact with a REST service without prior knowledge.

For FastAPI applications, also see the [FastAPI Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/FastAPI_Security_Cheat_Sheet.html) for dependency-based access control, request and response models, and deployment settings.

### HTTPS

Secure REST services must only provide HTTPS endpoints. This protects authentication credentials in transit, for example passwords, API keys or JSON Web Tokens. It also allows clients to authenticate the service and guarantees integrity of the transmitted data.

See the [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html) for additional information.

Consider the use of mutually authenticated client-side certificates to provide additional protection for highly privileged web services.

### Access Control

Non-public REST services must perform access control at each API endpoint. Web services in monolithic applications implement this by means of user authentication, authorization logic and session management. This has several drawbacks for modern architectures which compose multiple microservices following the RESTful style.

- in order to minimize latency and reduce coupling between services, the access control decision should be taken locally by REST endpoints
- user authentication should be centralised in a Identity Provider (IdP), which issues access tokens

### JWT

There seems to be a convergence towards using [JSON Web Tokens](https://tools.ietf.org/html/rfc7519) (JWT) as the format for security tokens. JWTs are JSON data structures containing a set of claims that can be used for access control decisions. A cryptographic signature or message authentication code (MAC) can be used to protect the integrity of the JWT.

- Ensure JWTs are integrity protected by either a signature or a MAC. Do not allow the unsecured JWTs: `{"alg":"none"}`.
    - See [here](https://tools.ietf.org/html/rfc7519#section-6.1)
- In general, signatures should be preferred over MACs for integrity protection of JWTs.

If MACs are used for integrity protection, every service that is able to validate JWTs can also create new JWTs using the same key. This means that all services using the same key have to mutually trust each other. Another consequence of this is that a compromise of any service also compromises all other services sharing the same key. See [here](https://tools.ietf.org/html/rfc7515#section-10.5) for additional information.

The relying party or token consumer validates a JWT by verifying its integrity and claims contained.

- A relying party must verify the integrity of the JWT based on its own configuration or hard-coded logic. It must not rely on the information of the JWT header to select the verification algorithm. See [here](https://www.chosenplaintext.ca/2015/03/31/jwt-algorithm-confusion.html) and [here](https://www.youtube.com/watch?v=bW5pS4e_MX8>)

For JWTs used for API access control, require and validate `iss`, `aud`, and `exp` by default; these claims are mandatory for tokens conforming to [RFC 9068, Section 2.2](https://www.rfc-editor.org/rfc/rfc9068.html#section-2.2). Require and validate any additional claims that the token profile makes mandatory. Check:

- `iss` or issuer - is this a trusted issuer? Is it the expected owner of the signing key?
- `aud` or audience - is the relying party in the target audience for this JWT?
- `exp` or expiration time - is the current time before the end of the validity period of this token?
- `nbf` or not before time - if present, is the current time at or after the start of the token's validity period? This claim is optional in [RFC 7519, Section 4.1.5](https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.5); require it if the token profile requires it.

As JWTs contain details of the authenticated entity (user etc.) a disconnect can occur between the JWT and the current state of the users session, for example, if the session is terminated earlier than the expiration time due to an explicit logout or an idle timeout. When an explicit session termination event occurs, a unique, server-issued identifier (the `jti` claim, optionally combined with `aud`) should be submitted to a denylist on the API which will invalidate that JWT for any requests until the expiration of the token. See the [JSON_Web_Token_Cheat_Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html#jwt-denylist) for further details.

### API Keys

Public REST services without access control run the risk of being farmed leading to excessive bills for bandwidth or compute cycles. API keys can be used to mitigate this risk. They are also often used by organization to monetize APIs; instead of blocking high-frequency calls, clients are given access in accordance to a purchased access plan.

API keys can reduce the impact of denial-of-service attacks. However, when they are issued to third-party clients, they are relatively easy to compromise.

- Require API keys for every request to the protected endpoint.
- Return `429 Too Many Requests` HTTP response code if requests are coming in too quickly.
- Revoke the API key if the client violates the usage agreement.
- Do not rely exclusively on API keys to protect sensitive, critical or high-value resources.

### Restrict HTTP methods

- Apply an allowlist of permitted HTTP Methods e.g. `GET`, `POST`, `PUT`.
- Reject all requests not matching the allowlist with HTTP response code `405 Method not allowed`.
- Make sure the caller is authorized to use the incoming HTTP method on the resource collection, action, and record

In Java EE in particular, this can be difficult to implement properly. See [Bypassing Web Authentication and Authorization with HTTP Verb Tampering](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/REST_Security_Cheat_Sheet_Bypassing_VBAAC_with_HTTP_Verb_Tampering.pdf) for an explanation of this common misconfiguration.

### Preventing Out-of-Order API Execution

Modern REST APIs often implement business workflows through a sequence of endpoints (for example, create → validate → approve → finalize). If the backend does not explicitly validate workflow state transitions, attackers may invoke endpoints out of sequence to bypass intended controls.

#### Problem

Out-of-order API execution occurs when an attacker:

- Skips required workflow steps by directly calling later-stage endpoints
- Replays or reuses tokens across workflow boundaries
- Exploits assumptions that the frontend enforces correct sequencing

Because each endpoint may be individually authenticated and authorized, traditional access control checks often fail to detect these issues.

#### Example

A checkout workflow expects the following sequence:

```http
POST /checkout/create
POST /checkout/pay
POST /checkout/confirm
```

If the backend does not validate workflow state transitions, an attacker could directly invoke:

```http
POST /checkout/confirm
```

without completing payment.

#### Prevention Guidance

- Enforce workflow state validation on the server side for every request
- Model workflows explicitly using finite states or state machines
- Bind tokens or identifiers to specific workflow stages
- Avoid relying on frontend logic to enforce sequencing
- Reject invalid or out-of-order transitions with clear error responses

#### Testing Checklist

- Can endpoints be invoked out of sequence?
- Does each endpoint validate the current workflow state?
- Are tokens reusable across workflow steps?
- Are invalid state transitions consistently rejected?

### Input validation

- Do not trust input parameters/objects.
- Validate input: length / range / format and type.
- Achieve an implicit input validation by using strong types like numbers, booleans, dates, times or fixed data ranges in API parameters.
- Constrain string inputs with regexps.
- Reject unexpected/illegal content.
- Make use of validation/sanitation libraries or frameworks in your specific language.
- Define an appropriate request size limit and reject requests exceeding the limit with HTTP response status 413 Request Entity Too Large.
- Consider logging input validation failures. Assume that someone who is performing hundreds of failed input validations per second is up to no good.
- Have a look at input validation cheat sheet for comprehensive explanation.
- Use a secure parser for parsing the incoming messages. If you are using XML, make sure to use a parser that is not vulnerable to [XXE](https://owasp.org/www-community/vulnerabilities/XML_External_Entity_%28XXE%29_Processing) and similar attacks.

### Validate content types

A REST request or response body should match the intended content type in the header. Otherwise this could cause misinterpretation at the consumer/producer side and lead to code injection/execution.

- Document all supported content types in your API.

#### Validate request content types

- For requests with a body, require a supported `Content-Type` according to the endpoint contract and reject unsupported media types with [`415 Unsupported Media Type`](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.16). Do not require `Content-Type` solely for requests without a body. Reserve `406 Not Acceptable` for response content negotiation.
- For XML content types ensure appropriate XML parser hardening, see the [XXE cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html).
- Avoid accidentally exposing unintended content types by explicitly defining content types e.g. [Jersey](https://jersey.github.io/) (Java) `@consumes("application/json"); @produces("application/json")`. This avoids [XXE-attack](https://owasp.org/www-community/vulnerabilities/XML_External_Entity_%28XXE%29_Processing) vectors for example.

#### Send safe response content types

It is common for REST services to allow multiple response types (e.g. `application/xml` or `application/json`, and the client specifies the preferred order of response types by the Accept header in the request.

- **Do NOT** simply copy the `Accept` header to the `Content-type` header of the response.
- Select a supported response type that matches the client's `Accept` preferences, including media ranges and quality values. If none is acceptable and no default response will be supplied, return [`406 Not Acceptable`](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.7).

Services including script code (e.g. JavaScript) in their responses must be especially careful to defend against header injection attack.

- Ensure sending intended content type headers in your response matching your body content e.g. `application/json` and not `application/javascript`.

### Management endpoints

- Avoid exposing management endpoints via Internet.
- If management endpoints must be accessible via the Internet, make sure that users must use a strong authentication mechanism, e.g. multi-factor.
- Expose management endpoints via different HTTP ports or hosts preferably on a different NIC and restricted subnet.
- Restrict access to these endpoints by firewall rules  or use of access control lists.

### Error handling

- Respond with generic error messages - avoid revealing details of the failure unnecessarily.
- Do not pass technical details (e.g. call stacks or other internal hints) to the client.

### Audit logs

- Write audit logs before and after security related events.
- Consider logging token validation errors in order to detect attacks.
- Take care of log injection attacks by sanitizing log data beforehand.

### Security Headers

There are a number of [security related headers](https://owasp.org/www-project-secure-headers/) that can be returned in the HTTP responses to instruct browsers to act in specific ways. However, some of these headers are intended to be used with HTML responses, and as such may provide little or no security benefits on an API that does not return HTML. Note that if the API is only consumed by non-browser clients (e.g. mobile apps, server-to-server calls, command-line tools), most of these headers will have no effect since they are directives for browsers.

The following headers should be included in all API responses that may be consumed by browser clients:

| Header | Rationale |
|--------|-----------|
| `Cache-Control: no-store` | Instructs compliant private and shared HTTP caches not to store the response or reuse it for another request ([RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.5)). This does not prevent storage by application code: the [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) does not honor HTTP caching headers. Keep sensitive responses out of application-managed caches; see the [offline application guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#offline-applications). |
| `Content-Security-Policy: frame-ancestors 'none'` | Header used to specify whether a response can be framed in a `<frame>`, `<iframe>`, `<embed>` or `<object>` element. For an API response, there is no requirement to be framed in any of those elements. Providing `frame-ancestors 'none'` prevents any domain from framing the response returned by the API call. This header protects against [drag-and-drop](https://www.w3.org/Security/wiki/Clickjacking_Threats#Drag_and_drop_attacks) style clickjacking attacks. |
| `Content-Type` | Header to specify the content type of a response. This must be specified as per the type of content returned by an API call. If not specified or if specified incorrectly, a browser might attempt to guess the content type of the response. This can return in MIME sniffing attacks. One common content type value is `application/json` if the API response is JSON. |
| `Strict-Transport-Security` | For hosts covered by an active HSTS policy, instructs browsers to use HTTPS and [terminate connections with TLS errors](https://www.rfc-editor.org/rfc/rfc6797.html#section-8.4). Initial HTTP access remains exposed unless policy is already known, such as through preloading. HSTS does not protect against an attacker certificate that the client trusts; see the [HSTS threat limitations](https://www.rfc-editor.org/rfc/rfc6797.html#section-14.8). |
| `X-Content-Type-Options: nosniff` | Header to instruct a browser to always use the MIME type that is declared in the `Content-Type` header rather than trying to determine the MIME type based on the file's content. This header with a `nosniff` value prevents browsers from performing MIME sniffing, and inappropriately interpreting responses as HTML. |
| `X-Frame-Options: DENY` | Legacy header superseded by `Content-Security-Policy: frame-ancestors 'none'` (see above). Still recommended for compatibility with older browsers that do not support CSP Level 2. Providing `DENY` prevents any domain from framing the response. |

The headers below are only intended to provide additional security when responses are rendered as HTML. As such, if the API will **never** return HTML in responses, then these headers may not be necessary. However, if there is any uncertainty about the function of the headers, or the types of information that the API returns (or may return in future), then it is recommended to include them as part of a defense-in-depth approach.

| Header | Example | Rationale |
|--------|-----------|-----------|
| Content-Security-Policy | `Content-Security-Policy: default-src 'none'` | The majority of CSP functionality only affects pages rendered as HTML. |
| Permissions-Policy | `Permissions-Policy: accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()` | This header used to be named Feature-Policy. When browsers heed this header, it is used to control browser features via directives. The example disables features with an empty allowlist for a number of permitted [directive names](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy#directives). When you apply this header, verify that the directives are up-to-date and fit your needs. Please have a look at this [article](https://developer.chrome.com/en/docs/privacy-sandbox/permissions-policy) for a detailed explanation on how to control browser features. |
| Referrer-Policy | `Referrer-Policy: no-referrer` | Non-HTML responses should not trigger additional requests. |

### CORS

Cross-Origin Resource Sharing (CORS) is a W3C standard to flexibly specify what cross-domain requests are permitted. By delivering appropriate CORS Headers your REST API signals to the browser which domains, AKA origins, are allowed to make JavaScript calls to the REST service.

- Disable CORS headers if cross-domain calls are not supported/expected.
- Be as specific as possible and as general as necessary when setting the origins of cross-domain calls.

### Sensitive information in HTTP requests

RESTful web services should be careful to prevent leaking credentials. Passwords, security tokens, and API keys should not appear in the URL, as this can be captured in web server logs, which makes them intrinsically valuable.

- In `POST`/`PUT` requests sensitive data should be transferred in the request body or request headers.
- In `GET` requests sensitive data should be transferred in an HTTP Header.

**OK:**

`https://example.com/resourceCollection/[ID]/action`

`https://twitter.com/vanderaj/lists`

**NOT OK:**

`https://example.com/controller/123/action?apiKey=a53f435643de32` because the apiKey is in the URL.

### HTTP Return Code

HTTP defines [status code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes). When designing REST API, don't just use `200` for success or `404` for error. Always use the semantically appropriate status code for the response.

Here is a non-exhaustive selection of security related REST API **status codes**. Use it to ensure you return the correct code.

| Code | Message                | Description                                                                                                                                                                                                          |
|-------------|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 200         | OK                     |  Response to a successful REST API action. The HTTP method can be GET, POST, PUT, PATCH or DELETE.                                                                                                                  |
| 201         | Created                |  The request has been fulfilled and resource created. A URI for the created resource is returned in the Location header.                                                                                            |
| 202         | Accepted               | The request has been accepted for processing, but processing is not yet complete.                                                                                                                                     |
| 301         | Moved Permanently       | Permanent redirection.                                                                                                                                                                                                |
| 304         | Not Modified           | Caching related response that returned when the client has the same copy of the resource as the server.                                                                                                                  |
| 307         | Temporary Redirect     | Temporary redirection of resource.                                                                                                                                                                                   |
| 400         | Bad Request            | The request is malformed, such as message body format error.                                                                                                                                                          |
| 401         | Unauthorized           | Wrong or no authentication ID/password provided.                                                                                                                                                                      |
| 403         | Forbidden              |  It's used when the authentication succeeded but authenticated user doesn't have permission to the request resource.                                                                                                |
| 404         | Not Found              | When a non-existent resource is requested.                                                                                                                                                                            |
| 405         | Method Not Allowed     |  The error for an unexpected HTTP method. For example, the REST API is expecting HTTP GET, but HTTP PUT is used.                                                                                                    |
| 406         | Not Acceptable         | No supported response representation satisfies the client's content negotiation preferences and the server will not send a default representation.                                                                                                                    |
| 413         | Payload too large      | Use it to signal that the request size exceeded the given limit e.g. regarding file uploads.                                                                                                                          |
| 415         | Unsupported Media Type | The request content has a format that the target method does not support.                                                                                                                                                      |
| 429         | Too Many Requests      |  The error is used when there may be DOS attack detected or the request is rejected due to rate limiting.                                                                                                           |
| 500         | Internal Server Error  | An unexpected condition prevented the server from fulfilling the request. Be aware that the response should not reveal internal  information that helps an attacker, e.g. detailed error messages or  stack traces. |
| 501         | Not Implemented        | The REST service does not implement the requested operation yet.                                                                                                                                                      |
| 503         | Service Unavailable    |  The REST service is temporarily unable to process the request. Used to inform the client it should retry at a later time.                                                                                         |

Additional information about HTTP return code usage in REST API can be found [here](https://www.restapitutorial.com/httpstatuscodes.html) and [here](https://restfulapi.net/http-status-codes).

## REST Assessment

> **Source:** [REST Assessment](https://cheatsheetseries.owasp.org/cheatsheets/REST_Assessment_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### About RESTful Web Services

Web Services are an implementation of web technology used for machine to machine communication. As such they are used for Inter application communication, Web 2.0 and Mashups and by desktop and mobile applications to call a server.

RESTful web services (often called simply REST) are a light weight variant of Web Services based on the RESTful design pattern. In practice RESTful web services utilizes HTTP requests that are similar to regular HTTP calls in contrast with other Web Services technologies such as SOAP which utilizes a complex protocol.

### Key relevant properties of RESTful web services

- Use of HTTP methods (`GET`, `POST`, `PUT` and `DELETE`) as the primary verb for the requested operation.
- Non-standard parameters specifications:
    - As part of the URL.
    - In headers.
- Structured parameters and responses using JSON or XML in a parameter values, request body or response body. Those are required to communicate machine useful information.
- Custom authentication and session management, often utilizing custom security tokens: this is needed as machine to machine communication does not allow for login sequences.
- Lack of formal documentation. A [proposed standard for describing RESTful web services called WADL](http://www.w3.org/Submission/wadl/) was submitted by Sun Microsystems but was never officially adapted.

### The challenge of security testing RESTful web services

- Inspecting the application does not reveal the attack surface, I.e. the URLs and parameter structure used by the RESTful web service. The reasons are:
    - No application utilizes all the available functions and parameters exposed by the service
    - Those used are often activated dynamically by client side code and not as links in pages.
    - The client application is often not a web application and does not allow inspection of the activating link or even relevant code.
- The parameters are non-standard making it hard to determine what is just part of the URL or a constant header and what is a parameter worth [fuzzing](https://owasp.org/www-community/Fuzzing).
- As a machine interface the number of parameters used can be very large, for example a JSON structure may include dozens of parameters. [fuzzing](https://owasp.org/www-community/Fuzzing) each one significantly lengthen the time required for testing.
- Custom authentication mechanisms require reverse engineering and make popular tools not useful as they cannot track a login session.

### How to pentest a RESTful web service

Determine the attack surface through documentation - RESTful pen testing might be better off if some level of clear-box testing is allowed and you can get information about the service.

This information will ensure fuller coverage of the attack surface. Such information to look for:

- Formal service description - While for other types of web services such as SOAP a formal description, usually in WSDL is often available, this is seldom the case for REST. That said, either WSDL 2.0 or WADL can describe REST and are sometimes used.
- A developer guide for using the service may be less detailed but will commonly be found, and might even be considered *opaque-box* testing.
- Application source or configuration - in many frameworks, including dotNet ,the REST service definition might be easily obtained from configuration files rather than from code.

Collect full requests using a [proxy](https://www.zaproxy.org/) - while always an important pen testing step, this is more important for REST based applications as the application UI may not give clues on the actual attack surface.

Note that the proxy must be able to collect full requests and not just URLs as REST services utilize more than just GET parameters.

Analyze collected requests to determine the attack surface:

- Look for non-standard parameters:
    - Look for abnormal HTTP headers - those would many times be header based parameters.
    - Determine if a URL segment has a repeating pattern across URLs. Such patterns can include a date, a number or an ID like string and indicate that the URL segment is a URL embedded parameter.
        - For example: `http://server/srv/2013-10-21/use.php`
    - Look for structured parameter values - those may be JSON, XML or a non-standard structure.
    - If the last element of a URL does not have an extension, it may be a parameter. This is especially true if the application technology normally uses extensions or if a previous segment does have an extension.
        - For example: `http://server/svc/Grid.asmx/GetRelatedListItems`
    - Look for highly varying URL segments - a single URL segment that has many values may be parameter and not a physical directory.
        - For example if the URL `http://server/src/XXXX/page` repeats with hundreds of value for `XXXX`, chances `XXXX` is a parameter.

Verify non-standard parameters: in some cases (but not all), setting the value of a URL segment suspected of being a parameter to a value expected to be invalid can help determine if it is a path elements of a parameter. If a path element, the web server will return a *404* message, while for an invalid value to a parameter the answer would be an application level message as the value is legal at the web server level.

Analyzing collected requests to optimize [fuzzing](https://owasp.org/www-community/Fuzzing) - after identifying potential parameters to fuzz, analyze the collected values for each to determine:

- Valid vs. invalid values, so that [fuzzing](https://owasp.org/www-community/Fuzzing) can focus on marginal invalid values.
    - For example sending *0* for a value found to be always a positive integer.
- Sequences allowing to fuzz beyond the range presumably allocated to the current user.

Lastly, when [fuzzing](https://owasp.org/www-community/Fuzzing), don't forget to emulate the authentication mechanism used.

### Assessing OpenAPI and Swagger-Based REST APIs

Modern REST APIs commonly publish a machine-readable description in [OpenAPI](https://spec.openapis.org/oas/v3.1.0) (formerly Swagger). Unlike the WADL option noted above, this format is widely adopted, and for an assessment it is the fastest route to the attack surface.

- Probe the common description locations first - `/openapi.json`, `/swagger.json` and `/docs` - before relying only on traffic captured through a [proxy](https://www.zaproxy.org/). The description lists paths, methods, parameters, schemas and security requirements in one place.
- Reconcile the description with observed behavior. Call endpoints the description does not mention and send fields the schema does not define; an undocumented field the API accepts is a discrepancy to investigate, not proof of a contract violation, because additional properties may be valid depending on the intended schema and its documentation. Compare what you observed with the intended schema and the authorization policy before treating the field as a violation (see mass assignment below).
- Fuzz from the schema: start with a valid request that satisfies the declared types, required fields and `enum` values, then mutate one constraint at a time, following the same [fuzzing](https://owasp.org/www-community/Fuzzing) approach used above.
- Build the per-operation security test matrix from the effective OpenAPI [`security`](https://spec.openapis.org/oas/v3.1.0#security-requirement-object) requirements, which are the root-level requirements unless the operation declares its own `security`, in which case that declaration replaces them instead of combining with them: no credentials, a valid token, and a token that lacks the declared requirement (see the next section). [`securitySchemes`](https://spec.openapis.org/oas/v3.1.0#security-scheme-object) only define the reusable security mechanisms those requirements refer to.

### JWT and OAuth2 Assessment

A REST API is only as strong as the token checks in front of it, so test the token handling itself before testing the endpoints behind it.

- Tamper with the token: change a claim in the payload, re-sign it with a key you control, or remove the signature, and confirm the API rejects it. Also try `alg: none` and algorithm confusion. The corresponding server-side rules are in the [JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html) and the [REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#jwt), with the threat background in [RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725).
- Send a token that is expired (`exp`), not yet valid (`nbf`), or issued for another issuer (`iss`) or audience (`aud`). These [standard claims](https://datatracker.ietf.org/doc/html/rfc7519#section-4) must be checked against the configuration of the API rather than trusted as presented.
- Send malformed tokens - truncated or extra parts, invalid Base64 or JSON - and confirm the API returns an authentication failure instead of a server error or a partially parsed token.
- Check scope and role enforcement: call each operation with a valid token whose [OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749) scope does not grant it, and with a valid token belonging to a lower-privileged role that lacks permission for it. Both should be denied the result, on read and write operations alike, with the status code that the documented response policy of the API prescribes for such a denial: for example [`401 Unauthorized`](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.2) or [`403 Forbidden`](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.4) as described for bearer requests in [RFC 6750 Section 3.1](https://www.rfc-editor.org/rfc/rfc6750#section-3.1), or `404 Not Found` when the API [conceals the existence of the resource](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.4).

### Broken Object Level Authorization (BOLA)

[Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) is the API form of [IDOR](https://owasp.org/www-community/attacks/insecure_direct_object_reference): an endpoint uses an identifier from the request without checking that the caller may access the object it points at.

- Run the swap test: create the same kind of object with two accounts or tenants, then replay each request under the other session's identifiers. Cover reads and writes (`GET`, `PUT`, `PATCH`, `DELETE`); an ownership check on `GET` next to an unchecked `PUT` on the same resource is a common result.
- Prefer identifiers the other session can already observe - list responses, error messages, notification links - over guessing, and include nested routes such as `/users/{id}/orders/{id}`, where authorization is often only enforced for the outer resource.
- Test vertical escalation too: use a low-privilege token against owner-only or administrator-only operations of the same API; whether a role may call such an operation at all is [Broken Function Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/), a separate check from BOLA's per-object access.
- Repeat for every object type the API exposes; the object is wherever an identifier in the request ends up, not only in the obvious profile or order endpoints.

Prevention guidance is in the [Insecure Direct Object Reference Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) and the [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); test methodology is in the [WSTG IDOR test](https://wstg.owasp.org/latest/4-Web_Application_Security_Testing/05-Authorization/04-Insecure_Direct_Object_References/).

### Mass Assignment in JSON APIs

Frameworks that bind a JSON request body directly to an internal object make [mass assignment](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html) testable with a single request: anything the client sends may be written, including fields the API never advertised.

- Take a normal create or update request and add fields outside the contract - a role, a verification flag, an internal identifier - then read the object back to see whether they were stored. Repeat for nested objects and arrays and for each update verb, including partial-update endpoints.
- Confirm effect, not just reflection: a field echoed in the response means little until a following request shows that it persisted and changed behavior.
- Treat every field the server accepts but the schema does not define as a candidate for this test (see the OpenAPI section above).

See [CWE-915](https://cwe.mitre.org/data/definitions/915.html) for the weakness classification.

### Rate Limiting and Throttling Assessment

Missing or weak limits let an attacker guess credentials, harvest data or consume capacity at will; this is [API4:2023 Unrestricted Resource Consumption](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/).

- Drive the authentication, token and account recovery endpoints and check that throttling engages; without it, password guessing and [credential stuffing](https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html) remain cheap. Compare with the [login throttling](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#login-throttling) expectations for web applications.
- Exercise the expensive operations - search, export, bulk writes - and note whether a limit applies to them at all. Throttling by request frequency does not by itself bound the amount of work performed within a single request, so check what one request can cost as well.
- Identify what the limit is keyed on: a per-IP limit is worked around by changing address, so per-account or per-API-key limits must still hold, and an authenticated session must not disable them.
- Record the observed limit, the point at which it triggers and the response returned, so each finding states the missing control precisely.

### Related Resources

See the [REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) for implementation guidance corresponding to these assessment topics.

## Web Service Security

> **Source:** [Web Service Security](https://cheatsheetseries.owasp.org/cheatsheets/Web_Service_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This article is focused on providing guidance for securing web services and preventing web services related attacks.

Please notice that due to the difference in implementation between different frameworks, this cheat sheet is kept at a high level.

### Transport Confidentiality

Transport confidentiality protects against eavesdropping and man-in-the-middle attacks against web service communications to/from the server.

**Rule**: All communication with and between web services containing sensitive features, an authenticated session, or transfer of sensitive data must be encrypted using well-configured [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security). This is recommended even if the messages themselves are encrypted because [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) provides numerous benefits beyond traffic confidentiality including integrity protection, replay defenses, and server authentication. For more information on how to do this properly see the [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html).

### Server Authentication

**Rule**: TLS must be used to authenticate the service provider to the service consumer. The service consumer should verify the server certificate is issued by a trusted provider, is not expired, is not revoked, matches the domain name of the service, and that the server has proven that it has the private key associated with the public key certificate (by properly signing something or successfully decrypting something encrypted with the associated public key).

### User Authentication

User authentication verifies the identity of the user or the system trying to connect to the service. Such authentication is usually a function of the container of the web service.

**Rule**: If used, Basic Authentication must be conducted over [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security), but Basic Authentication is not recommended because it discloses secrets in plain text (base64 encoded) in HTTP Headers.

**Rule**: Client Certificate Authentication using [Mutual-TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) is a common form of authentication that is recommended where appropriate. See: [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).

### Transport Encoding

[SOAP](https://en.wikipedia.org/wiki/SOAP) encoding styles are meant to move data between software objects into XML format and back again.

**Rule**: Enforce the same encoding style between the client and the server.

### Message Integrity

This is for data at rest. The integrity of data in transit can easily be provided by [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security).

When using [public key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography), encryption does guarantee confidentiality but it does not guarantee integrity since the receiver's public key is public. For the same reason, encryption does not ensure the identity of the sender.

**Rule**: For XML data, use XML digital signatures to provide message integrity using the sender's private key. This signature can be validated by the recipient using the sender's digital certificate (public key).

### Message Confidentiality

Data elements meant to be kept confidential must be encrypted using a strong encryption cipher with an adequate key length to deter brute-forcing.

**Rule**: Messages containing sensitive data must be encrypted using a strong encryption cipher. This could be transport encryption or message encryption.

**Rule**: Messages containing sensitive data that must remain encrypted at rest after receipt must be encrypted with strong data encryption, not just transport encryption.

### Authorization

Web services need to authorize web service clients the same way web applications authorize users. A web service needs to make sure a web service client is authorized to perform a certain action (coarse-grained) on the requested data (fine-grained).

**Rule**: A web service should authorize its clients whether they have access to the method in question. Following an authentication challenge, the web service should check the privileges of the requesting entity whether they have access to the requested resource. This should be done on every request, and a challenge-response Authorization mechanism added to sensitive resources like password changes, primary contact details such as email, physical address, payment or delivery instructions.

**Rule**: Ensure access to administration and management functions within the Web Service Application is limited to web service administrators. Ideally, any administrative capabilities would be in an application that is completely separate from the web services being managed by these capabilities, thus completely separating normal users from these sensitive functions.

### Schema Validation

Schema validation enforces constraints and syntax defined by the schema.

**Rule**: Web services must validate [SOAP](https://en.wikipedia.org/wiki/SOAP) payloads against their associated XML schema definition ([XSD](https://www.w3schools.com/xml/schema_intro.asp)).

**Rule**: The [XSD](https://www.w3schools.com/xml/schema_intro.asp) defined for a [SOAP](https://en.wikipedia.org/wiki/SOAP) web service should, at a minimum, define the maximum length and character set of every parameter allowed to pass into and out of the web service.

**Rule**: The [XSD](https://www.w3schools.com/xml/schema_intro.asp) defined for a [SOAP](https://en.wikipedia.org/wiki/SOAP) web service should define strong (ideally allow-list) validation patterns for all fixed format parameters (e.g., zip codes, phone numbers, list values, etc.).

### Content Validation

**Rule**: Like any web application, web services need to validate input before consuming it. Content validation for XML input should include:

- Validation against malformed XML entities.
- Validation against [XML Bomb attacks](https://en.wikipedia.org/wiki/Billion_laughs_attack).
- Validating inputs using a strong allowlist.
- Validating against [external entity attacks](https://owasp.org/www-community/vulnerabilities/XML_External_Entity_%28XXE%29_Processing).

### Output Encoding

Web services need to ensure that the output sent to clients is encoded to be consumed as data and not as scripts. This gets pretty important when web service clients use the output to render HTML pages either directly or indirectly using AJAX objects.

**Rule**: All the rules of output encoding applies as per [Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

### Virus Protection

[SOAP](https://en.wikipedia.org/wiki/SOAP) provides the ability to attach files and documents to [SOAP](https://en.wikipedia.org/wiki/SOAP) messages. This gives the opportunity for hackers to attach viruses and malware to these [SOAP](https://en.wikipedia.org/wiki/SOAP) messages.

**Rule**: Ensure Virus Scanning technology is installed and preferably inline so files and attachments could be checked before being saved on disk.

**Rule**: Ensure Virus Scanning technology is regularly updated with the latest virus definitions/rules.

### Message Size

Web services like web applications could be a target for DOS attacks by automatically sending the web services thousands of large size [SOAP](https://en.wikipedia.org/wiki/SOAP) messages. This either cripples the application making it unable to respond to legitimate messages or it could take it down entirely.

**Rule**: [SOAP](https://en.wikipedia.org/wiki/SOAP) Messages size should be limited to an appropriate size limit. Larger size limit (or no limit at all) increases the chances of a successful DoS attack.

### Availability

#### Resources Limiting

During regular operation, web services require computational power such as CPU cycles and memory. Due to malfunctioning or while under attack, a web service may required too much resources, leaving the host system unstable.

**Rule**: Limit the amount of CPU cycles the web service can use based on expected service rate, in order to have a stable system.

**Rule**: Limit the amount of memory the web service can use to avoid system running out of memory. In some cases the host system may start killing processes to free up memory.

**Rule**: Limit the number of simultaneous open files, network connections and started processes.

#### Message Throughput

Throughput represents the number of web service requests served during a specific amount of time.

**Rule**: Enforce request-rate and execution-time limits based on tested service capacity and the cost of each operation. Tune stricter limits for expensive operations, following [OWASP's resource-consumption guidance](https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/#how-to-prevent). Maximizing throughput alone does not prevent resource exhaustion.

#### XML Denial of Service Protection

XML Denial of Service is probably the most serious attack against web services. So the web service must provide the following validation:

**Rule**: Validation against recursive payloads.

**Rule**: Validation against oversized payloads.

**Rule**: Protection against [XML entity expansion](https://www.ws-attacks.org/XML_Entity_Expansion).

**Rule**: Reject XML element names that exceed configured length limits. SOAP action identifiers are separate from XML element names; for example, the [SOAP 1.2 Action feature](https://www.w3.org/TR/soap12-part2/#ActionFeature) uses a URI value that can guide message dispatch or routing.

This protection should be provided by your XML parser/schema validator. To verify, build test cases to make sure your parser to resistant to these types of attacks.

### Endpoint Security Profile

**Rule**: Treat Web Services Interoperability (WS-I) Basic Profile conformance as an interoperability requirement, not a security baseline. Its [security section](https://docs.oasis-open.org/ws-brsp/BasicProfile/v1.2/BasicProfile-v1.2.html#_Toc392058316) permits conformant services without security countermeasures. Independently enforce the transport security, authentication, authorization, and resource limits described above.

## GraphQL

> **Source:** [GraphQL](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

[GraphQL](https://graphql.org) is an open source query language originally developed by Facebook that can be used to build APIs as an alternative to REST and SOAP. It has gained popularity since its inception in 2012 because of the native flexibility it offers to those building and calling the API. There are GraphQL servers and clients implemented in various languages. [Many companies](https://foundation.graphql.org/) use GraphQL including GitHub, Credit Karma, Intuit, and PayPal.

This Cheat Sheet provides guidance on the various areas that need to be considered when working with GraphQL:

- Apply proper [input validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) checks on all incoming data.
- Expensive queries will lead to [Denial of Service (DoS)](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html), so add checks to limit or prevent queries that are too expensive.
- Ensure that the API has proper [access control](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html) checks.
- Disable insecure default configurations (_e.g._ excessive errors, introspection, GraphiQL, etc.).

### Common Attacks

- [Injection](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa8-injection.md) - this usually includes but is not limited to:
    - [SQL](https://owasp.org/www-community/attacks/SQL_Injection) and [NoSQL](https://www.netsparker.com/blog/web-security/what-is-nosql-injection/) injection
    - [OS Command injection](https://owasp.org/www-community/attacks/Command_Injection)
    - [SSRF](https://portswigger.net/web-security/ssrf) and [CRLF](https://owasp.org/www-community/vulnerabilities/CRLF_Injection) [injection](https://www.acunetix.com/websitesecurity/crlf-injection/)/[Request](https://portswigger.net/web-security/request-smuggling) [Smuggling](https://www.pentestpartners.com/security-blog/http-request-smuggling-a-how-to/)
- [DoS](https://owasp.org/www-community/attacks/Denial_of_Service) ([Denial of Service](https://www.cloudflare.com/learning/ddos/glossary/denial-of-service/))
- Abuse of broken authorization: either [improper](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa1-broken-object-level-authorization.md) or [excessive](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa3-excessive-data-exposure.md) access, including [IDOR](https://portswigger.net/web-security/access-control/idor)
- Batching Attacks, a GraphQL-specific method of brute force attack
- Abuse of insecure default configurations

### Best Practices and Recommendations

For the original security analysis, see [Doyensec's GraphQL security overview](https://blog.doyensec.com/2018/05/17/graphql-security-overview.html).

#### Input Validation

Adding strict input validation can help prevent against injection and DoS. The main design for GraphQL is that the user supplies one or more identifiers and the backend has a number of data fetchers making HTTP, DB, or other calls using the given identifiers. This means that user input will be included in HTTP requests, DB queries, or other requests/calls which provides opportunity for injection that could lead to various injection attacks or DoS.

See the OWASP Cheat Sheets on [Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) and general [injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html) for full details to best perform input validation and prevent injection.

##### General Practices

Validate all incoming data to only allow valid values (i.e. allowlist).

- Use specific GraphQL [data types](https://graphql.org/learn/schema/#type-language) such as [scalars](https://graphql.org/learn/schema/#scalar-types) or [enums](https://graphql.org/learn/schema/#enumeration-types). Write custom GraphQL [validators](https://graphql.org/learn/validation/) for more complex validations. [Custom scalars](https://itnext.io/custom-scalars-in-graphql-9c26f43133f3) may also come in handy.
- Define [schemas for mutations input](https://graphql.org/learn/schema/#input-types).
- [List allowed characters](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#allowlist-vs-denylist) - don't use a denylist
    - The stricter the list of allowed characters the better. A lot of times a good starting point is only allowing alphanumeric, non-unicode characters because it will disallow many attacks.
- To properly handle unicode input, use a [single internal character encoding](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#validating-free-form-unicode-text)
- Gracefully [reject invalid input](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html), being careful not to reveal excessive information about how the API and its validation works.

##### Injection Prevention

When handling input meant to be passed to another interpreter (_e.g._ SQL/NoSQL/ORM, OS, LDAP, XML):

- Always choose libraries/modules/packages offering safe APIs, such as parameterized statements.
    - Ensure that you follow the documentation so you are properly using the tool
    - Using ORMs and ODMs are a good option but they must be used properly to avoid flaws such as [ORM injection](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.7-Testing_for_ORM_Injection).
- If such tools are not available, always escape/encode input data according to best practices of the target interpreter
    - Choose a well-documented and actively maintained escaping/encoding library. Many languages and frameworks have this functionality built-in.

For more information see the below pages:

- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [NoSQL Injection Prevention](https://www.netsparker.com/blog/web-security/what-is-nosql-injection/)
- [LDAP Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html)
- [OS Command Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html)
- [XML Security](https://cheatsheetseries.owasp.org/cheatsheets/XML_Security_Cheat_Sheet.html) and [XXE Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html)

##### Process Validation

When using user input, even if sanitized and/or validated, it should not be used for certain purposes that would give a user control over data flow. For example, do not make an HTTP/resource request to a host that the user supplies (unless there is an absolute business need).

#### DoS Prevention

DoS is an attack against the availability and stability of the API that can make it slow, unresponsive, or completely unavailable. This CS details several methods to limit the possibility of a DoS attack at the application level and other layers of the tech stack. There is also a CS dedicated to the topic of [DoS](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html).

Here are recommendations specific to GraphQL to limit the potential for DoS:

- Add depth limiting to incoming queries
- Add amount limiting to incoming queries
- Add [pagination](https://graphql.org/learn/pagination/) to limit the amount of data that can be returned in a single response
- Add reasonable timeouts at the application layer, infrastructure layer, or both
- Consider performing query cost analysis and enforcing a maximum allowed cost per query
- Enforce rate limiting on incoming requests per IP or user (or both) to prevent basic DoS attacks
- Implement the [batching and caching technique](https://graphql.org/learn/best-practices/#server-side-batching-caching) on the server-side (Facebook's [DataLoader](https://github.com/facebook/dataloader) can be used for this)

##### Query Limiting (Depth & Amount)

In GraphQL each query has a depth (_e.g._ nested objects) and each object requested in a query can have an amount specified (_e.g._ 99999999 of an object). By default these can both be unlimited which may lead to a DoS. You should set limits on depth and amount to prevent DoS, but this usually requires a small custom implementation as it is not natively supported by GraphQL. See [this](https://www.apollographql.com/blog/securing-your-graphql-api-from-malicious-queries-16130a324a6b) and [this](https://www.howtographql.com/advanced/4-security/) page for more information about these attacks and how to add depth and amount limiting. Adding [pagination](https://graphql.org/learn/pagination/) can also help performance.

APIs using graphql-java can utilize the built-in [MaxQueryDepthInstrumentation](https://github.com/graphql-java/graphql-java/blob/master/src/main/java/graphql/analysis/MaxQueryDepthInstrumentation.java) for depth limiting. APIs using JavaScript can use [graphql-depth-limit](https://www.npmjs.com/package/graphql-depth-limit) to implement depth limiting and [graphql-input-number](https://github.com/joonhocho/graphql-input-number) to implement amount limiting.

Here is an example of a GraphQL query with depth N:

```javascript
query evil {            # Depth: 0
  album(id: 42) {       # Depth: 1
    songs {             # Depth: 2
      album {           # Depth: 3
        ...             # Depth: ...
        album {id: N}   # Depth: N
      }
    }
  }
}
```

Here is an example of a GraphQL query requesting 99999999 of an object:

```javascript
query {
  author(id: "abc") {
    posts(first: 99999999) {
      title
    }
  }
}
```

##### Timeouts

Adding timeouts can be a simple way to limit how many resources any single request can consume. But timeouts are not always effective since they may not activate until a malicious query has already consumed excessive resources. Timeout requirements will differ by API and data fetching mechanism; there isn't one timeout value that will work across the board.

At the application level, timeouts can be added for queries and resolver functions. This option is usually more effective since the query/resolution can be stopped once the timeout is reached. GraphQL does not natively support query timeouts so custom code is required. See [this blog post](https://medium.com/workflowgen/graphql-query-timeout-and-complexity-management-fab4d7315d8d) for more about using timeouts with GraphQL or the two examples below.

_**JavaScript Timeout Example**_

Code snippet from [this SO answer](https://stackoverflow.com/a/53277955/1200388):

```javascript
request.incrementResolverCount =  function () {
    var runTime = Date.now() - startTime;
    if (runTime > 10000) {  // a timeout of 10 seconds
      if (request.logTimeoutError) {
        logger('ERROR', `Request ${request.uuid} query execution timeout`);
      }
      request.logTimeoutError = false;
      throw 'Query execution has timeout. Field resolution aborted';
    }
    this.resolverCount++;
  };
```

_**Java Timeout Example using [Instrumentation](https://www.graphql-java.com/documentation/instrumentation)**_

```java
public class TimeoutInstrumentation extends SimpleInstrumentation {
    @Override
    public DataFetcher<?> instrumentDataFetcher(
            DataFetcher<?> dataFetcher, InstrumentationFieldFetchParameters parameters
    ) {
        return environment ->
            Observable.fromCallable(() -> dataFetcher.get(environment))
                .subscribeOn(Schedulers.computation())
                .timeout(10, TimeUnit.SECONDS)  // timeout of 10 seconds
                .blockingFirst();
    }
}
```

_**Infrastructure Timeout**_

Another option to add a timeout that is usually easier is adding a timeout on an HTTP server ([Apache/httpd](https://httpd.apache.org/docs/2.4/mod/core.html#timeout), [nginx](http://nginx.org/en/docs/http/ngx_http_core_module.html#send_timeout)), reverse proxy, or load balancer. However, infrastructure timeouts are often inaccurate and can be bypassed more easily than application-level ones.

##### Query Cost Analysis

Query cost analysis involves assigning costs to the resolution of fields or types in incoming queries so that the server can reject queries that cost too much to run or will consume too many resources. This is not easy to implement and may not always be necessary but it is the most thorough approach to preventing DoS. See "Query Cost Analysis" in [this blog post](https://www.apollographql.com/blog/securing-your-graphql-api-from-malicious-queries-16130a324a6b) for more details on implementing this control.

Apollo recommends:

> **Before you go ahead and spend a ton of time implementing query cost analysis be certain you need it.** Try to crash or slow down your staging API with a nasty query and see how far you get — maybe your API doesn’t have these kinds of nested relationships, or maybe it can handle fetching thousands of records at a time perfectly fine and doesn’t need query cost analysis!

APIs using graphql-java can utilize the built-in [MaxQueryComplexityInstrumentationto](https://github.com/graphql-java/graphql-java/blob/master/src/main/java/graphql/analysis/MaxQueryComplexityInstrumentation.java) to enforce max query complexity. APIs using JavaScript can utilize [graphql-cost-analysis](https://github.com/pa-bru/graphql-cost-analysis) or [graphql-validation-complexity](https://github.com/4Catalyzer/graphql-validation-complexity) to enforce max query cost.

##### Rate Limiting

Limit incoming HTTP requests per client using a request-rate control, such as [Nginx's `limit_req` module](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html). Apache's [`mod_ratelimit`](https://httpd.apache.org/docs/2.4/mod/mod_ratelimit.html) limits the transfer bandwidth of each response; it does not limit incoming request counts or aggregate traffic per client.

HTTP request counts alone do not account for expensive queries or multiple operations in one request. Apply [GraphQL rate limits in the business logic layer](https://graphql.org/learn/security/#rate-limiting), together with [query cost limits](#query-cost-analysis) and [batching limits](#mitigating-batching-attacks).

##### Server-side Batching and Caching

To increase efficiency of a GraphQL API and reduce its resource consumption, [the batching and caching technique](https://graphql.org/learn/best-practices/#server-side-batching-caching) can be used to prevent making duplicate requests for pieces of data within a small time frame. Facebook's [DataLoader](https://github.com/facebook/dataloader) tool is one way to implement this.

##### System Resource Management

Not properly limiting the amount of resources your API can use (_e.g._ CPU or memory), may compromise your API responsiveness and availability, leaving it vulnerable to DoS attacks. Some limiting can be done at the operating system level.

On Linux, a combination of [Control Groups(cgroups)](https://en.wikipedia.org/wiki/Cgroups), [User Limits (ulimits)](https://linuxhint.com/linux_ulimit_command/), and [Linux Containers (LXC)](https://linuxcontainers.org/lxc/security/) can be used.

However, containerization platforms tend to make this task much easier. See the resource limiting section in the [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html#rule-7---limit-resources-memory-cpu-file-descriptors-processes-restarts) for how to prevent DoS when using containers.

#### Access Control

To ensure that a GraphQL API has proper access control, do the following:

- Always validate that the requester is authorized to view or mutate/modify the data they are requesting. This can be done with [RBAC](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#prefer-attribute-and-relationship-based-access-control-over-rbac) or other access control mechanisms.
    - This will prevent [IDOR](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) issues, including both [BOLA](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa1-broken-object-level-authorization.md) and [BFLA](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa5-broken-function-level-authorization.md).
- Enforce authorization checks on both edges and nodes (see example [bug report](https://hackerone.com/reports/489146) where nodes did not have authorization checks but edges did).
- Use [Interfaces](https://graphql.org/learn/schema/#interfaces) and [Unions](https://graphql.org/learn/schema/#union-types) to create structured, hierarchical data types which can be used to return more or fewer object properties, according to requester permissions.
- Query and Mutation [Resolvers](https://graphql.org/learn/execution/#root-fields-resolvers) can be used to perform access control validation, possibly using some RBAC middleware.
- [Disable introspection queries](https://lab.wallarm.com/why-and-how-to-disable-introspection-query-for-graphql-apis/) system-wide in any production or publicly accessible environments.
- Disable [GraphiQL](https://github.com/graphql/graphiql) and other similar schema exploration tools in production or publicly accessible environments.

##### General Data Access

It's commonplace for GraphQL requests to include one or more direct IDs of objects in order to fetch or modify them. For example, a request for a certain picture may include the ID that is actually the primary key in the database for that picture. As with any request, the server must verify that the caller has access to the object they are requesting. But sometimes developers make the mistake of assuming that possession of the object's ID means the caller should have access. Failure to verify the requester's access in this case is called [Broken Object Level Authentication](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa1-broken-object-level-authorization.md), also known as [IDOR](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html).

It's possible for a GraphQL API to support access to objects using their ID even if that is not intended. Sometimes there are `node` or `nodes` or both fields in a query object, and these can be used to access objects directly by `ID`. You can check whether your schema has these fields by running this on the command-line (assuming that `schema.json` contains your GraphQL schema): `cat schema.json | jq ".data.__schema.types[] | select(.name==\"Query\") | .fields[] | .name" | grep node`. Removing these fields from the schema should disable the functionality, but you should always apply proper authorization checks to verify the caller has access to the object they are requesting.

##### Query Access (Data Fetching)

[Detectify's New Relic disclosure](https://labs.detectify.com/crowdsource-community/graphql-abuse-bypass-account-level-permissions-through-parameter-smuggling/) illustrates why field access must respect account permissions.

As part of a GraphQL API there will be various data fields that can be returned. One thing to consider is if you want different levels of access around these fields. For example, you may only want certain consumers to be able to fetch certain data fields rather than allowing all consumers to be able to retrieve all available fields. This can be done by adding a check in the code to ensure that the requester should be able to read a field they are trying to fetch.

##### Mutation Access (Data Manipulation)

For an original case study, see [Pen Test Partners' WordPress GraphQL disclosure](https://www.pentestpartners.com/security-blog/pwning-wordpress-graphql/).

GraphQL supports mutation, or manipulation of data, in addition to its most common use case of data fetching. If an API implements/allows mutation then there may need to be access controls put in place to restrict which consumers, if any, can modify data through the API. Setups that require mutation access control would include APIs where only read access is intended for requesters or where only certain parties should be able to modify certain fields.

#### Batching Attacks

GraphQL supports batching requests, also known as [query batching](https://www.apollographql.com/blog/query-batching-in-apollo-63acfd859862/). This lets callers to either batch multiple queries or batch requests for multiple object instances in a single network call, which allows for what is called a [batching attack](https://lab.wallarm.com/graphql-batching-attack/). This is a form of brute force attack, specific to GraphQL, that usually allows for faster and less detectable exploits. Here is the most common way to do query batching:

```javascript
[
  {
    query: < query 0 >,
    variables: < variables for query 0 >,
  },
  {
    query: < query 1 >,
    variables: < variables for query 1 >,
  },
  {
    query: < query n >
    variables: < variables for query n >,
  }
]
```

And here is an example query of a single batched GraphQL call requesting multiple different instances of the `droid` object:

```javascript
query {
  droid(id: "2000") {
    name
  }
  second:droid(id: "2001") {
    name
  }
  third:droid(id: "2002") {
    name
  }
}
```

In this case it could be used to enumerate every possible `droid` object that is stored on the server in very few network requests as opposed to a standard REST API where the requester would need to submit a different network request for every different `droid` ID they want to request. This type of attack can lead to the following issues:

- Application-level DoS attacks - A high number of queries or object requests in a single network call could cause a database to hang or exhaust other available resources (_e.g._ memory, CPU, downstream services).
- Enumeration of objects on the server, such as users, emails, and user IDs.
- Brute forcing passwords, 2 factor authentication codes (OTPs), session tokens, or other sensitive values.
- WAFs, RASPs, IDS/IPS, SIEMs, or other security tooling will likely not detect these attacks since they only appear to be one single request rather than an a massive amount of network traffic.
- This attack will likely bypass existing rate limits in tools like Nginx or other proxies/gateways since they rely on looking at the raw number of requests.

##### Mitigating Batching Attacks

In order to mitigate this type of attack you should put limits on incoming requests at the code level so that they can be applied per request. There are 3 main options:

- Add object request rate limiting in code
- Prevent batching for sensitive objects
- Limit the number of queries that can run at one time

One option is to create a code-level rate limit on how many objects that callers can request. This means the backend would track how many different object instances the caller has requested, so that they will be blocked after requesting too many objects even if they batch the object requests in a single network call. This replicates a network-level rate limit that a WAF or other tool would do.

Another option is to prevent batching for sensitive objects that you don't want to be brute forced, such as usernames, emails, passwords, OTPs, session tokens, etc. This way an attacker is forced to attack the API like a REST API and make a different network call per object instance. This is not supported natively so it will require a custom solution. However once this control is put in place other standard controls will function normally to help prevent any brute forcing.

Limiting the number of operations that can be batched and run at once is another option to mitigate GraphQL batching attacks leading to DoS. This is not a silver bullet though and should be used in conjunction with other methods.

#### Secure Configurations

By default, most GraphQL implementations have some insecure default configurations which should be changed:

- Don't return excessive error messages (_e.g._ disable stack traces and debug mode).
- Disable or restrict Introspection and GraphiQL based on your needs.
- Suggestion of mis-typed fields if the introspection is disabled

##### Introspection + GraphiQL

GraphQL Often comes by default with introspection and/or GraphiQL enabled and not requiring authentication. This allows the consumer of your API to learn everything about your API, schemas, mutations, deprecated fields and sometimes unwanted "private fields".

This might be an intended configuration if your API is designed to be consumed by external clients, but can also be an issue if the API was designed to be used internally only. Although security by obscurity is not recommended, it might be a good idea to consider removing the Introspection to avoid any leak.
If your API is publicly consumed, you might want to consider disabling it for not authenticated or unauthorized users.

For internal API, the easiest approach is to just disable introspection system-wide. See [this page](https://lab.wallarm.com/why-and-how-to-disable-introspection-query-for-graphql-apis/) or consult your GraphQL implementation's documentation to learn how to disable introspection altogether. If your implementation does not natively support disabling introspection or if you would like to allow some consumers/roles to have this access, you can build a filter in your service to only allow approved consumers to access the introspection system.

Keep in mind that even if introspection is disabled, attackers can still guess fields by brute forcing them. Furthermore, GraphQL has a built-in feature to return a hint when a field name that the requester provides is similar (but incorrect) to an existing field (_e.g._ request has `usr` and the response will ask `Did you mean "user?"`). You should consider disabling this feature if you have disabled the introspection, to decrease the exposure, but not all implementations of GraphQL support doing so. [Shapeshifter](https://github.com/szski/shapeshifter) is one tool that [should be able to do this](https://www.youtube.com/watch?v=NPDp7GHmMa0&t=2580).

_**Disable Introspection - Java**_

```Java
GraphQLSchema schema = GraphQLSchema.newSchema()
    .query(StarWarsSchema.queryType)
    .fieldVisibility( NoIntrospectionGraphqlFieldVisibility.NO_INTROSPECTION_FIELD_VISIBILITY )
    .build();
```

_**Disable Introspection & GraphiQL - JavaScript**_

For existing applications using the [deprecated `express-graphql` middleware](https://github.com/graphql/express-graphql#this-library-is-deprecated), this illustration assumes `NoIntrospection` is an imported introspection-denying validation rule. Use a maintained server implementation for new applications.

```javascript
app.use('/graphql', graphqlHTTP({
  schema: MySessionAwareGraphQLSchema,
  validationRules: [NoIntrospection],
  graphiql: process.env.NODE_ENV === 'development',
}));
```

##### Don't Return Excessive Errors

GraphQL APIs in production shouldn't return stack traces or be in debug mode. Doing this is implementation specific, but using middleware is one popular way to have better control over errors the server returns. To [omit stack traces](https://www.apollographql.com/docs/apollo-server/data/errors/) with Apollo Server, pass `includeStacktraceInErrorResponses: false` to its constructor. When this option is unspecified, `NODE_ENV=production` or `NODE_ENV=test` suppresses stack traces by default; error messages still require separate masking. However, if you would like to log the stack trace internally without returning it to the user see [here](https://www.apollographql.com/docs/apollo-server/data/errors/#masking-and-logging-errors) for how to mask and log errors so they are available to the developers but not callers of the API.

## gRPC Security

> **Source:** [gRPC Security](https://cheatsheetseries.owasp.org/cheatsheets/gRPC_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

gRPC (gRPC Remote Procedure Call) is a high-performance, language-neutral RPC framework that uses HTTP/2 for transport and Protocol Buffers for serialization. While gRPC offers significant performance advantages for microservices and distributed systems, it introduces unique security challenges that differ from traditional REST APIs.

The following sections cover essential security controls for protecting gRPC services from common attack vectors.

### Transport Security

#### Always Use TLS in Production

Production deployments need TLS encryption to protect against eavesdropping and man-in-the-middle attacks.

```go
// Go - Secure server with TLS
creds, err := credentials.NewServerTLSFromFile(certFile, keyFile)
if err != nil {
    log.Fatalf("Failed to load TLS credentials: %v", err)
}
s := grpc.NewServer(grpc.Creds(creds))
```

Configure TLS 1.2 or higher with strong cipher suites, and disable weak protocols and ciphers.

#### Implement Mutual TLS (mTLS) for Service-to-Service Communication

mTLS provides mutual authentication where both client and server verify each other's certificates, enabling zero-trust communication.

```go
// Go - mTLS client configuration
cert, err := tls.LoadX509KeyPair(clientCertFile, clientKeyFile)
caCert, err := ioutil.ReadFile(caCertFile)
caCertPool := x509.NewCertPool()
caCertPool.AppendCertsFromPEM(caCert)

creds := credentials.NewTLS(&tls.Config{
    Certificates: []tls.Certificate{cert},
    RootCAs:      caCertPool,
})
conn, err := grpc.Dial(address, grpc.WithTransportCredentials(creds))
```

Use short-lived certificates (90 days or less) with automated rotation to limit the impact of compromised keys.

### Authentication and Authorization

#### Implement Strong Authentication

Implement authentication checks for each protected service method.

##### Token-Based Authentication

The following [unary server interceptor](https://pkg.go.dev/google.golang.org/grpc#UnaryServerInterceptor) illustrates authentication for unary RPCs only. Register it with the server; protected streaming RPCs need equivalent checks in a [stream server interceptor](https://pkg.go.dev/google.golang.org/grpc#StreamServerInterceptor) before invoking the stream handler. Registering a unary interceptor does not protect streaming methods.

```go
// Go - JWT token validation interceptor
func authInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    md, ok := metadata.FromIncomingContext(ctx)
    if !ok {
        return nil, status.Errorf(codes.Unauthenticated, "missing metadata")
    }

    tokens := md["authorization"]
    if len(tokens) == 0 {
        return nil, status.Errorf(codes.Unauthenticated, "missing authorization token")
    }

    token := strings.TrimPrefix(tokens[0], "Bearer ")
    if !validateJWT(token) {
        return nil, status.Errorf(codes.Unauthenticated, "invalid token")
    }

    return handler(ctx, req)
}
```

##### API Key Authentication

```go
// Go - API key validation
func validateAPIKey(ctx context.Context) error {
    md, ok := metadata.FromIncomingContext(ctx)
    if !ok {
        return status.Error(codes.Unauthenticated, "missing metadata")
    }

    keys := md["x-api-key"]
    if len(keys) == 0 || !isValidAPIKey(keys[0]) {
        return status.Error(codes.Unauthenticated, "invalid API key")
    }
    return nil
}
```

Implement token expiration and refresh mechanisms with short-lived tokens (15-60 minutes). Avoid embedding credentials in gRPC method parameters - use metadata headers.

#### Enforce Granular Authorization

Implement method-level authorization checks based on the principle of least privilege.

```go
// Go - Role-based authorization
func authorizeMethod(ctx context.Context, methodName string, userRoles []string) error {
    requiredRole, exists := methodPermissions[methodName]
    if !exists {
        return status.Errorf(codes.PermissionDenied, "method not found")
    }

    for _, role := range userRoles {
        if role == requiredRole {
            return nil
        }
    }

    return status.Errorf(codes.PermissionDenied, "insufficient permissions")
}
```

Log all authorization failures to detect potential attacks and compliance violations.

### Input Validation and Data Security

#### Validate All Protocol Buffer Messages

Protocol Buffers provide type safety but not business logic validation. Always perform thorough server-side validation.

```protobuf
// Use protoc-gen-validate for automatic validation
syntax = "proto3";
import "validate/validate.proto";

message CreateUserRequest {
  string email = 1 [(validate.rules).string.email = true];
  string name = 2 [(validate.rules).string = {min_len: 1, max_len: 100}];
  int32 age = 3 [(validate.rules).int32 = {gte: 0, lte: 150}];
}
```

Use allowlist validation for string inputs to prevent unexpected characters and injection attempts.

#### Prevent Injection Attacks

Validate user input carefully when used in database queries or system operations.

```go
// Go - Safe database query with parameterization
func getUserByEmail(email string) (*User, error) {
    if !isValidEmail(email) {
        return nil, errors.New("invalid email format")
    }

    query := "SELECT id, name, email FROM users WHERE email = ?"
    row := db.QueryRow(query, email)

    var user User
    err := row.Scan(&user.ID, &user.Name, &user.Email)
    return &user, err
}
```

Always use prepared statements for database operations to prevent [SQL injection](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).

#### Implement Message Size Limits

Set application-appropriate limits on individual messages in both directions. In grpc-go, the server's [`MaxRecvMsgSize`](https://pkg.go.dev/google.golang.org/grpc#MaxRecvMsgSize) already defaults to 4 MiB. A stream can still carry many individually valid messages, so a per-message limit does not bound the total data or processing work for the stream.

```go
// Go - Set message size limits
s := grpc.NewServer(
    grpc.MaxRecvMsgSize(4*1024*1024), // 4 MiB max receive
    grpc.MaxSendMsgSize(4*1024*1024), // 4 MiB max send
)
```

Limit streaming sessions and message counts to prevent resource exhaustion. Monitor and enforce maximum messages per stream and maximum session duration.

### Rate Limiting and Resource Protection

#### Implement Request Rate Limiting

Protect services from request flooding and resource exhaustion. The example below limits unary RPCs only. Apply stream admission limits through a stream interceptor and enforce per-message limits within the stream; limiting stream creation alone does not limit the messages sent over an existing stream.

```go
// Go - Illustrative unary rate limiting with bounded entry count
import (
    "golang.org/x/time/rate"
    "sync"
    "time"
)

type RateLimiterStore struct {
    limiters map[string]*rateLimiterEntry
    mu       sync.RWMutex
}

type rateLimiterEntry struct {
    limiter  *rate.Limiter
    lastSeen time.Time
}

var store = &RateLimiterStore{
    limiters: make(map[string]*rateLimiterEntry),
}

func rateLimitInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    clientIP := getClientIP(ctx)

    store.mu.Lock()
    entry, exists := store.limiters[clientIP]
    if !exists {
        if len(store.limiters) >= maxLimiterEntries {
            store.mu.Unlock()
            return nil, status.Error(codes.ResourceExhausted, "limiter capacity reached")
        }
        entry = &rateLimiterEntry{
            limiter:  rate.NewLimiter(rate.Limit(10), 20), // 10 req/sec, burst 20
            lastSeen: time.Now(),
        }
        store.limiters[clientIP] = entry
    }
    entry.lastSeen = time.Now()
    store.mu.Unlock()

    if !entry.limiter.Allow() {
        return nil, status.Errorf(codes.ResourceExhausted, "rate limit exceeded")
    }

    return handler(ctx, req)
}

// Cleanup old limiters periodically
func cleanupOldLimiters() {
    store.mu.Lock()
    defer store.mu.Unlock()

    cutoff := time.Now().Add(-time.Hour)
    for ip, entry := range store.limiters {
        if entry.lastSeen.Before(cutoff) {
            delete(store.limiters, ip)
        }
    }
}
```

Configure `maxLimiterEntries` as a positive cap based on the process memory budget. Schedule `cleanupOldLimiters` as part of the service lifecycle; defining it does not run it. At capacity, this illustration rejects new client keys while retaining existing limits, so monitor saturation and its effect on legitimate clients. Derive client keys from a trusted connection or authenticated identity, not arbitrary forwarded headers.

Each [`rate.Limiter`](https://pkg.go.dev/golang.org/x/time/rate#Limiter) limits events for one key; it does not bound the number of keys in the map. This store is local to one process. Use a maintained shared rate-limiting service when limits must apply across replicas.

#### Set Appropriate Timeouts

Configure timeouts to prevent resource exhaustion from long-running requests.

```go
// Go - Server-side timeout for resource protection
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    // Check if client already set a deadline
    if deadline, ok := ctx.Deadline(); ok && time.Until(deadline) < 5*time.Second {
        return processGetUser(ctx, req)
    }

    // Set defensive timeout to prevent resource exhaustion
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    return processGetUser(ctx, req)
}
```

Configure both client-side and server-side timeouts appropriately for your use case.

### Error Handling and Information Disclosure

#### Secure Error Responses

Detailed error messages can reveal system internals to attackers. Return generic error messages while logging detailed information server-side.

```go
// Go - Secure error handling
func (s *server) ProcessPayment(ctx context.Context, req *pb.PaymentRequest) (*pb.PaymentResponse, error) {
    if err := validatePayment(req); err != nil {
        // Log detailed error server-side
        log.Printf("Payment validation failed for user %s: %v", getUserID(ctx), err)
        // Return generic error to client
        return nil, status.Error(codes.InvalidArgument, "invalid payment request")
    }

    // Continue processing...
}
```

Use appropriate gRPC status codes: `UNAUTHENTICATED` for auth failures, `PERMISSION_DENIED` for authorization failures, `INVALID_ARGUMENT` for validation errors.

#### Implement Structured Logging

Log security events to help detect attacks and investigate incidents. Include authentication attempts, authorization failures, and suspicious activities.

```go
// Go - Security event logging
func logSecurityEvent(event string, userID string, clientIP string, success bool) {
    log.Printf("SECURITY_EVENT: %s | User: %s | IP: %s | Success: %t | Time: %s",
        event, userID, clientIP, success, time.Now().UTC().Format(time.RFC3339))
}
```

Include correlation IDs to track requests across distributed services and ensure logs don't contain sensitive data like passwords or tokens.

### Service Discovery and Reflection

#### Disable gRPC Reflection in Production

gRPC reflection allows clients to discover service methods and message schemas at runtime, which is invaluable for development and debugging. However, this same capability gives attackers detailed information about your service's API surface, making it easier to craft targeted attacks.

```go
// Go - Conditional reflection (development only)
if os.Getenv("ENVIRONMENT") != "production" {
    reflection.Register(s)
}
```

#### Secure Service Discovery

Service discovery mechanisms require protection to prevent attackers from injecting malicious service endpoints or intercepting service information.

**Consul with mTLS:**

```go
consulConfig := &api.Config{
    Address:    "consul.example.com:8500",
    Scheme:     "https",
    TLSConfig: &api.TLSConfig{
        CertFile: "/path/to/client.crt",
        KeyFile:  "/path/to/client.key",
        CAFile:   "/path/to/ca.crt",
    },
}
```

**Kubernetes RBAC:**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: grpc-service-discovery
rules:
- apiGroups: [""]
  resources: ["services", "endpoints"]
  verbs: ["get", "list", "watch"]
```

Use service mesh solutions like Istio or Linkerd for automatic mTLS and centralized security policies.

### Monitoring and Incident Response

#### Implement Security Monitoring

Monitor gRPC services for security events and potential attacks.

Key metrics to monitor:

- Request rates per method and client
- Authentication and authorization failure rates
- Error rates and types
- Unusual traffic patterns

Set up alerts for:

- High authentication failure rates
- Attempts to access non-existent methods
- Resource exhaustion patterns

#### Enable Distributed Tracing

Track requests across microservices for security analysis.

```go
// Go - OpenTelemetry tracing with security context
tracer := otel.Tracer("grpc-service")
ctx, span := tracer.Start(ctx, "grpc.method.call")
defer span.End()

span.SetAttributes(
    attribute.String("grpc.method", info.FullMethod),
    attribute.String("client.ip", getClientIP(ctx)),
)
```

### Testing and Validation

#### Perform gRPC Security Testing

Include gRPC-specific security tests in your development pipeline.

Test categories:

- Authentication bypass attempts
- Authorization boundary testing
- Input validation and injection testing
- Rate limiting effectiveness
- Message size limit enforcement

Use tools like `grpcurl` and custom test clients to verify security controls.

```bash
# Test authentication requirement
grpcurl -plaintext localhost:50051 list
grpcurl -plaintext localhost:50051 myservice.MyService/GetUser

# Test with invalid tokens
grpcurl -plaintext -H "authorization: Bearer invalid_token" \
  localhost:50051 myservice.MyService/GetUser
```

#### Security Assessment Guidelines

- Test all gRPC methods for proper authentication and authorization
- Verify input validation on all message fields
- Test rate limiting and resource exhaustion protections
- Validate TLS configuration and certificate handling
- Check for information disclosure in error messages

### Language-Specific Considerations

#### Go

- Use interceptors for cross-cutting security concerns
- Leverage the `context` package for request-scoped security information
- Explicitly configure TLS - Go's gRPC requires manual TLS setup

#### Java

- Use Java's rich security ecosystem (Spring Security, etc.)
- Configure Netty properly for TLS settings
- Ensure ALPN support for HTTP/2

#### Python

- Validate all inputs as Python's dynamic typing can hide type issues
- Use secure credential management for certificate storage
- Be aware of GIL limitations for high-concurrency scenarios

#### C# (.NET)

- Leverage ASP.NET Core's built-in security features
- Use the `[Authorize]` attribute on service methods
- Configure HTTPS properly in production environments

## WebSocket Security

> **Source:** [WebSocket Security](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

WebSockets enable real-time, bidirectional communication between clients and servers, powering applications like chat systems, live trading platforms, and collaborative tools. Unlike traditional HTTP requests, WebSocket connections remain open and allow continuous data exchange.

However, WebSockets introduce security challenges that differ from standard web application security:

- **Cross-Site WebSocket Hijacking (CSWSH)**: Attackers hijack authenticated connections from malicious websites
- **Authentication bypass**: No built-in authentication makes access control easy to forget
- **Injection attacks**: WebSocket messages can carry XSS, SQL injection, and other malicious payloads
- **Denial-of-service**: Persistent connections enable new DoS attack vectors like connection exhaustion
- **Monitoring gaps**: Traditional HTTP logs only capture the initial upgrade request, missing all message traffic

**Real-world vulnerabilities:**

- **Gitpod CSWSH (2023)**: [Insufficient origin validation](https://github.com/advisories/GHSA-f53g-frr2-jhpf) allowed full account takeover via hijacked WebSocket connections
- **Spring RCE vulnerability**: [CVE-2018-1270](https://spring.io/security/cve-2018-1270) let attackers execute code through crafted STOMP messages

### Primary Defenses

#### Transport Security

##### Always Use WSS (WebSocket Secure)

Never use unencrypted `ws://` connections in production. Unencrypted `ws://` connections allow eavesdropping and tampering.

```javascript
// Secure - always use this
const socket = new WebSocket('wss://app.example.com/socket');

// Insecure - never use in production
// const socket = new WebSocket('ws://app.example.com/socket');
```

See the [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html) for more details.

##### WebSocket Protocol Configuration

**Use modern protocol versions:**

Only support [RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455) (the current WebSocket standard). Drop backward compatibility for outdated versions like [Hixie-76](https://datatracker.ietf.org/doc/html/draft-hixie-thewebsocketprotocol-76) and [hybi-00](https://datatracker.ietf.org/doc/html/draft-ietf-hybi-thewebsocketprotocol-00) which have known security vulnerabilities.

**Compression security:**

Disable `permessage-deflate` compression unless specifically needed. Compression can introduce security vulnerabilities similar to CRIME/BREACH attacks where compression combined with secret data can leak information.

```javascript
// Node.js - disable compression for security
const wss = new WebSocket.Server({
  perMessageDeflate: false
});
```

##### Infrastructure Configuration

**Proxy and load balancer support:**

Ensure reverse proxies, load balancers, and CDNs are configured to handle WebSocket upgrades:

- Configure proxy to support HTTP/1.1 upgrade mechanism
- Pass `Upgrade` and `Connection: upgrade` headers correctly
- Set proper read timeouts for long-lived connections
- Ensure WebSocket traffic isn't blocked by security policies

**WAF support:**

Check that your WAF supports WebSocket traffic inspection beyond the initial handshake. If not, rely on server-side validation and application logging.

#### Authentication and Authorization

For general identity and session controls, see the [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) and [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

WebSockets don't have built-in authentication. Browsers include cookies in WebSocket handshake requests, making WebSocket applications vulnerable to Cross-Site WebSocket Hijacking (CSWSH).

CSWSH allows attackers to hijack authenticated WebSocket connections from malicious websites:

1. User logs into your application (session cookie established)
2. User later visits a malicious website
3. Malicious site opens WebSocket to your application, browser sends cookies automatically
4. Server accepts the connection → attacker gets live, authenticated WebSocket access

##### Origin Header Validation

Validate the `Origin` header on every handshake. Always use an explicit allowlist of trusted origins. Browsers include this header and malicious JavaScript cannot override it.

For Node.js `ws`, validate the `Origin` header in the HTTP server's `upgrade` event before calling `handleUpgrade`; the library discourages `verifyClient` ([`ws` documentation](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback)).

**Important:** Use an allowlist, not a denylist. Avoid wildcards or substring matching which are error-prone.

##### Additional CSWSH Protections

For applications already using CSRF protection, include **CSRF tokens** in WebSocket handshakes.

##### Session Management

WebSocket connections often outlive normal sessions, requiring special handling.

**Use SameSite cookies** (`SameSite=Lax` or `Strict`) to prevent cross-site cookie transmission and strengthen CSWSH defenses.

**Handle session expiration** by implementing server-side validation for long-running connections. Close WebSocket connections when sessions expire. Re-validate user sessions periodically (every 30 minutes is common) to ensure they remain valid.

```javascript
// Example: Close WebSocket on session expiry
function validateSession(ws, sessionId) {
  if (!isSessionValid(sessionId)) {
    ws.close(1008, 'Session expired');
    return false;
  }
  return true;
}
```

**When users log out**, close all their WebSocket connections immediately. Maintain a mapping of sessions to active connections so you can invalidate WebSocket access the moment logout occurs.

**Token-based authentication:**

For browser clients using tokens, prefer sending the token in the first message over WSS. Avoid tokens in URL query strings because they can leak into access logs; see the [`websockets` authentication guidance](https://websockets.readthedocs.io/en/stable/topics/authentication.html#sending-credentials).

Until token validation succeeds, accept only the authentication message and do not send protected data. Close the connection on authentication failure or timeout, and [limit unauthenticated connections](#denial-of-service-protection). Message-based authentication keeps tokens out of the handshake URL, but tokens must also be excluded from message logs.

**Token refresh:**

Rotate tokens in long-lived connections to prevent hijacked sessions from persisting.

##### Message-Level Authorization

Don't assume WebSocket connection equals unlimited access. Check authorization for each action:

```javascript
ws.on('message', (data) => {
  const message = JSON.parse(data);

  // Check authorization for each action
  if (message.action === 'delete_user' && !user.hasRole('admin')) {
    ws.send(JSON.stringify({type: 'error', message: 'Access denied'}));
    return;
  }

  handleAuthorizedMessage(ws, user, message);
});
```

#### Input Validation

Treat all WebSocket messages as untrusted input. WebSocket messages can carry injection payloads such as SQLi, XSS, and command injection.

**Validate message structure and content** using JSON schemas and allow-lists. Set reasonable size limits (typically 64KB or less) and implement rate limiting to prevent message flooding.

**For binary data**, verify file types using magic numbers rather than trusting content-type headers. Scan uploads for malware when appropriate, and use safe deserialization for protocols like protobuf or MessagePack.

```javascript
ws.on('message', (data, isBinary) => {
  if (isBinary) {
    // Validate binary data
    if (data.length > MAX_BINARY_SIZE) {
      ws.close(1009, 'Message too large');
      return;
    }

    // Check file type by magic numbers
    if (!isValidFileType(data)) {
      ws.close(1008, 'Invalid file type');
      return;
    }
  }

  processBinaryData(data);
});
```

**To prevent message replay attacks** include timestamps or nonces in messages and reject duplicates to ensure old messages cannot be maliciously resent.

```javascript
ws.on('message', (data) => {
  const message = JSON.parse(data);

  // Check timestamp or nonce to prevent replay
  if (!isValidNonce(message.nonce)) {
    ws.close(1008, 'Replay detected');
    return;
  }

  processMessage(message);
});
```

**Always use `JSON.parse()` instead of `eval()`** for JSON processing - `eval()` enables code execution from untrusted input.

```javascript
// Safe
const message = JSON.parse(data);

// Dangerous - enables code execution
// const message = eval('(' + data + ')');
```

See the [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), and [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) for more details.

#### Service Tunneling Risks

While WebSockets can tunnel TCP services (VNC, FTP, SSH), this creates security risks. If your application has XSS vulnerabilities, attackers could access these services directly from victims' browsers. If tunneling is necessary, implement additional authentication and access controls beyond the WebSocket layer.

#### Denial-of-Service Protection

Persistent WebSocket connections increase DoS risk.

**Limit connections and resources** by restricting total connections and implementing per-user limits (preferred) or per-IP limits where user identification isn't available. Set **message size limits** (typically 64KB or less) and implement **rate limiting** to prevent message flooding - 100 messages per minute is a common starting point.

**Handle idle and dead connections** by implementing idle timeouts to close inactive connections. Use **heartbeat monitoring** with ping/pong frames to detect and clean up dead connections.

**Implement backpressure controls** to prevent memory exhaustion from fast message producers. Many WebSocket implementations lack proper flow control, allowing attackers to overwhelm server memory by sending messages faster than they can be processed.

```javascript
const wss = new WebSocket.Server({
  maxPayload: 64 * 1024
});
```

#### Security Monitoring and Logging

Traditional HTTP access logs only capture the initial WebSocket upgrade request, not subsequent message traffic. You'll miss auth failures, injection attempts, rate-limit violations, and abuse.

**Log WebSocket events** including connection establishment and termination (with user identity, IP, and origin), authentication and authorization events during handshake and message processing, security violations like rate limiting triggers and message validation failures, and abnormal disconnections and protocol errors.

**Avoid logging sensitive data** - never log complete message contents, authentication tokens, session IDs, or personal information that could violate privacy regulations.

See the [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) for more details.

#### Testing WebSocket Security

**Key security tests:**

- **Origin validation**: Connect from unauthorized domains
- **Authentication bypass**: Attempt connections without proper credentials
- **Message injection**: Send XSS, SQL injection, and command injection payloads
- **DoS resistance**: Test connection limits, message flooding, and oversized messages
- **Session management**: Test session expiration and logout handling

**Testing tools:**

- Browser developer tools for manual testing
- [wscat](https://github.com/websockets/wscat) for command-line WebSocket connections
- Custom scripts for automated vulnerability testing
- OWASP ZAP (includes WebSocket security testing features)

#### Framework-Specific Best Practices

**Node.js:** With `ws`, perform origin and authentication checks in the HTTP server's `upgrade` event; set `maxPayload` limits and disable `perMessageDeflate` compression unless needed.

**Python:** With Django Channels, implement authentication middleware and origin validation. Use async exception handling to prevent application crashes from malformed WebSocket messages.

**Java Spring:** Configure allowed origins explicitly and integrate Spring Security for authorization. Set message size limits in your WebSocket container configuration to prevent resource exhaustion.

**Go:** When using Gorilla WebSocket, implement validation in your `CheckOrigin` function - don't just return `true`. Set read limits, implement timeouts, and use context cancellation for graceful connection cleanup.

##### Keep Dependencies Updated

Regularly update WebSocket libraries and monitor security advisories. Past versions of popular libraries (`ws`, Spring STOMP, Python `websockets`) have had critical security vulnerabilities including DoS and RCE issues.

## Webhook Security

> **Source:** [Webhook Security](https://cheatsheetseries.owasp.org/cheatsheets/Webhook_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Webhooks are HTTP callbacks: a **publisher** pushes event notifications to a URL that a **subscriber** registered, so both parties run HTTP servers ([Standard Webhooks specification](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#what-are-webhooks)). A webhook endpoint is therefore a public, unauthenticated `POST` handler unless you add the authentication yourself, and a publisher that delivers to user-supplied URLs is an outbound request engine that attackers will try to aim at your internal network.

This cheat sheet covers both sides. It shows how to prove that a delivery is genuine, stop replays and duplicate processing, keep signing secrets safe, and prevent the publisher from being used as a proxy.

### Threat Model Summary

Use the [Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) to assess the integration’s trust boundaries.

Forged deliveries are the headline threat: without verification, an attacker can post fake events that trigger order fulfillment, account access, or record changes, as [Stripe's webhook documentation](https://docs.stripe.com/webhooks#verify-events) warns. Signature verification is the first control to implement; the others close the gaps it leaves.

| Threat | Primary control |
|---|---|
| Forged events | Hash-based message authentication code using SHA-256 (HMAC-SHA256), verified on every delivery |
| Replay of a captured delivery | Authenticated timestamp with a tolerance window plus authenticated event-ID deduplication, where the publisher's protocol supports them |
| Signing secret leakage | Secrets manager, one secret per webhook, log redaction, immediate revocation and replacement |
| Server-side request forgery (SSRF) through a subscriber-supplied callback URL | `https://`-only scheme allowlist plus a deny-list of every non-public address range, enforced on the resolved IP at connect time |
| Denial of service | Rate limiting, payload size limit, asynchronous processing |
| Duplicate processing | Idempotent handlers keyed on the event ID |
| Eavesdropping or tampering in transit | Transport Layer Security (TLS) 1.2 or higher with a certificate from a trusted certificate authority (CA) |
| Malicious payload content | Schema validation, then parameterized queries and output encoding downstream |

### Authenticating Deliveries

#### Transport Security

- Require HTTPS on every webhook endpoint and reject plain HTTP. A signature proves authenticity but does not encrypt the payload, so anyone on the network path can read an unencrypted delivery ([Standard Webhooks: Enforcing HTTPS](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#enforcing-https)).
- Enforce TLS 1.2 or higher with a certificate from a trusted CA. Large publishers already refuse anything weaker: [Stripe](https://docs.stripe.com/webhooks#receive-events-with-an-https-server) validates the subscriber's certificate and only negotiates TLS 1.2 and 1.3.
- As a publisher, verify the subscriber's certificate on every delivery. GitHub, which lets users turn this check off, [recommends leaving SSL verification enabled](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks#use-https-and-ssl-verification).
- Protocol version and cipher suite configuration is covered in the [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html).

#### Signature Verification

Signing lets the subscriber confirm that a delivery came from the legitimate publisher and that the body was not modified in transit.

Publisher:

- Generate a cryptographically random signing secret for each registered webhook. 32 bytes is a sound default; the [Standard Webhooks signature scheme](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#signature-scheme) specifies 24 to 64 bytes.
- For a new protocol, use a documented signature scheme that authenticates the event ID, delivery timestamp, and raw request body together, such as [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#signature-scheme). Existing providers use different formats: [GitHub](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries#validating-webhook-deliveries) signs the raw body only; [Stripe](https://docs.stripe.com/webhooks#verify-signature) signs the timestamp and body, including the event ID in that body.
- During planned secret rotation, sign with every active secret and send one signature per secret (see Secret Rotation below).

Subscriber:

- Use the publisher's maintained verification library when available and follow its exact signing format. Supply the raw request body before your framework parses it. Re-serializing JSON, reordering fields, changing whitespace or line endings, or converting the character encoding all invalidate the signature ([Stripe](https://docs.stripe.com/webhooks#verify-signature)).
- Recompute the HMAC and compare it with a constant-time function such as `hmac.compare_digest`, `crypto.timingSafeEqual`, or `MessageDigest.isEqual`. Never use `==`: it leaks timing information and can turn the endpoint into a signing oracle ([GitHub](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries#validating-webhook-deliveries), [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#verifying-signatures)).
- When the header carries several signatures, accept the delivery if any one of them matches. Publishers send one signature per active secret during rotation, and this rule is what makes rotation safe in either order ([Standard Webhooks: Webhook headers](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#webhook-headers-sending-metadata-to-consumers)).
- Accept only the signature scheme you expect (Stripe's `v1`, for example) and ignore any other scheme in the header, to prevent downgrade attacks ([Stripe](https://docs.stripe.com/webhooks#verify-signature)).
- Return `401` when the signature is missing or does not match, and do not say why.

#### Secret Management

A leaked signing secret lets an attacker forge deliveries until it is revoked. Treat webhook secrets like database credentials.

- Store signing secrets in a secrets manager and never hard-code them in source, configuration files, or container images ([GitHub: Securely storing the secret token](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries#securely-storing-the-secret-token)). See the [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).
- Use a distinct secret per registered webhook so one leak exposes one integration; Stripe, for example, [generates a unique secret for each endpoint](https://docs.stripe.com/webhooks#endpoint-secrets).
- Redact secrets and signature header values from logs and error responses.

##### Secret Rotation

On suspected compromise, revoke the old secret immediately and replace it, following the Secrets Management Cheat Sheet's [incident response guidance](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html#92-remediation). Accepting a compromised secret during an overlap still permits forged deliveries.

For planned rotation, an overlap window in which both secrets are valid avoids failed deliveries. Stripe supports immediate expiration or an overlap of [up to 24 hours](https://docs.stripe.com/webhooks#roll-endpoint-secrets), signing with every active secret during that time. To rotate:

- Generate the new secret.
- Configure the publisher to sign with both secrets and send both signatures.
- Load the new secret on the subscriber. Because the subscriber already accepts any matching signature, the two sides can switch in either order inside the window.
- Once deliveries verify with the new secret, revoke the old one.
- Return `401` for deliveries signed only with a revoked secret.

#### Additional Authentication (Defense in Depth)

HMAC signing authenticates the payload, not the connection. Layer one of these on top when a leaked signing secret must not be enough to reach the endpoint:

| Method | When to use |
|---|---|
| Mutual TLS (mTLS) | High-assurance machine-to-machine pipelines; see [Client Certificates and Mutual TLS](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html#client-certificates-and-mutual-tls) |
| Static bearer token or API key | Simple integrations; store it in the secrets manager and rotate it like a signing secret |
| OAuth 2.0 client credentials | When both parties support OAuth, use the [client credentials grant](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4) to obtain an access token. Validate it using the authorization server's supported mechanism and require permission to deliver to this webhook. For JSON Web Token (JWT) access tokens using the [RFC 9068 profile](https://www.rfc-editor.org/rfc/rfc9068.html#section-4), apply its complete validation rules, including token type; see the [OAuth2 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html) |
| IP allowlisting | Extra layer only. Publishers such as [Stripe](https://docs.stripe.com/webhooks#verify-events) and [GitHub](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks#allow-githubs-ip-addresses) publish their delivery addresses, but ranges change and a shared egress IP is not proof of identity |

### Replay, Duplicates, and Abuse

#### Replay Attack Protection

A captured delivery carries a valid signature, so signature verification alone does not stop repeated processing. For protocols with authenticated delivery timestamps and event IDs, such as [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#signature-scheme):

- Publisher: include a Unix timestamp in the signed material, send it next to the signature, and generate a fresh timestamp and signature for every retry ([Stripe: Preventing replay attacks](https://docs.stripe.com/webhooks#replay-attacks)).
- Subscriber: reject deliveries whose authenticated timestamp differs from your clock by more than a small tolerance. Five minutes is the default in Stripe's libraries; keep your clock synchronized with Network Time Protocol (NTP) so the window is meaningful.
- Subscriber: after signature and freshness validation, cache authenticated event IDs to prevent repeated processing inside the window ([Standard Webhooks: Verifying signatures](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#verifying-signatures)). Keep each ID for at least twice the tolerance, 10 minutes for a 5-minute window: a delivery whose timestamp is 5 minutes ahead of your clock is accepted now and stays acceptable for another 10 minutes. This short replay cache does not replace the persisted processing record described below.

[GitHub's body-only signature](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries#validating-webhook-deliveries) does not authenticate a delivery timestamp or the `X-GitHub-Delivery` header. That header helps identify ordinary redeliveries but does not provide the authenticated replay guarantee above. Follow the provider's documented protocol and make downstream effects idempotent.

#### Idempotency and Duplicate Events

Publishers retry on failure, Stripe for [up to three days with exponential backoff](https://docs.stripe.com/webhooks#automatic-retries), so every endpoint receives some events more than once. Processing a payment or sending a notification twice causes real harm.

- After verifying the delivery, persist processed event IDs and skip repeats ([Stripe: Handle duplicate events](https://docs.stripe.com/webhooks#handle-duplicate-events)). Retain this record across the publisher's retry period. GitHub's [`X-GitHub-Delivery`](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks#use-the-x-github-delivery-header) identifies ordinary redeliveries but is not a signed event ID.
- Return `200` for an authenticated duplicate that has already been durably queued or processed; do not repeat its side effects.
- Make downstream side effects (database writes, emails, payments) idempotent by default.
- Do not assume in-order delivery. Fetch the object's current state from the publisher's API when an event may be stale. Use a sequence or version field only when the publisher documents its ordering guarantees; timestamps alone may not establish order ([Stripe: Event ordering](https://docs.stripe.com/webhooks#event-ordering)).

#### Rate Limiting

For broader resource controls, see the [Denial of Service Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html).

Without limits, a misconfigured publisher or an attacker can flood the endpoint. Both sides need protection.

- Publisher: apply per-subscriber delivery limits, exponential backoff with jitter, and a maximum retry count, and disable endpoints that keep failing for days ([Standard Webhooks: Deliverability and reliability](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#deliverability-and-reliability)).
- Subscriber: rate limit at the API gateway or application layer and answer excess traffic with `429 Too Many Requests` and a `Retry-After` header ([RFC 6585 section 4](https://www.rfc-editor.org/rfc/rfc6585.html#section-4)).
- Subscriber: acknowledge fast and process through an asynchronous queue. GitHub expects a `2xx` [within 10 seconds](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks#respond-within-10-seconds), and Stripe recommends [an asynchronous queue](https://docs.stripe.com/webhooks#handle-events-asynchronously) to absorb delivery spikes.
- Subscribe only to the event types you handle; listening for everything multiplies load and hands you data you never needed to hold ([GitHub: Subscribe to the minimum number of events](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks#subscribe-to-the-minimum-number-of-events)).

#### SSRF Prevention (Publisher Side)

When subscribers register their own callback URLs, an attacker registers an internal address or the cloud metadata endpoint and uses your delivery workers as a proxy into your network. Webhook senders are [especially exposed](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#server-side-request-forgery-ssrf) because accepting arbitrary URLs is the feature.

- Allowlist the scheme: accept `https://` only.
- Block every non-public destination: resolve the hostname and reject any address that is not globally reachable, at minimum the deny-list in the [Server-Side Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#deny-list-last-resort) including the IPv6 equivalents, plus internal hostnames such as `metadata.google.internal`. The IANA [IPv4](https://www.iana.org/assignments/iana-ipv4-special-registry) and [IPv6](https://www.iana.org/assignments/iana-ipv6-special-registry) special-purpose address registries include both globally reachable and non-globally-reachable ranges; consult each entry's Globally Reachable field.
- Validate the address you actually connect to. Re-resolving the name just before the request does not close the DNS rebinding gap, because the HTTP client resolves it again when it connects and can receive a different answer. Either resolve once, validate the IP, and connect to that exact IP while sending the original hostname in the `Host` header and Server Name Indication (SNI), or validate inside the client's connect hook using the same lookup for validation and connection. The [DNS pinning guidance in the SSRF cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#case-2---application-can-send-requests-to-any-external-ip-address-or-domain-name) covers this case.
- Disable redirects, or apply the same checks to every redirect target. Stripe simply [treats redirect responses as failed deliveries](https://docs.stripe.com/webhooks#fix-http-status-codes).
- Isolate delivery workers or their egress proxy in a network segment that cannot reach internal services, as recommended by [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#server-side-request-forgery-ssrf). An egress proxy such as [Smokescreen](https://github.com/stripe/smokescreen) can enforce destination checks.

### Endpoint Hardening

#### Input Validation

See the [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) and [Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html) for validation and downstream interpretation controls.

- A valid signature proves who sent the payload, not that its contents are safe. Enforce a maximum body size, reject unexpected `Content-Type` values, and validate against a strict schema before processing, following the REST Security Cheat Sheet's [Input validation](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#input-validation) and [Validate content types](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#validate-content-types) sections. Publishers should keep payloads small; the Standard Webhooks specification recommends [under 20 KB](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#payload-size).
- Downstream, use parameterized queries for SQL ([Query Parameterization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html)) and context-appropriate output encoding wherever payload fields are rendered as HTML ([Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)).

#### HTTP Method Restriction

- Accept `POST` only and answer every other method with `405 Method Not Allowed`, as described in [Restrict HTTP methods](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#restrict-http-methods) in the REST Security Cheat Sheet.

#### Cross-Site Request Forgery (CSRF) Considerations

- Exempt the webhook route, and only that route, from framework CSRF token checks: the publisher is a server that cannot obtain a token, so the check only blocks legitimate deliveries ([Stripe: Exempt webhook route from CSRF protection](https://docs.stripe.com/webhooks#csrf-protection)).
- Put signature verification in place before granting the exemption; it is the replacement control. See the [Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

#### Fail Securely

- Return `200` only after the event is durably queued or processed, `400` for malformed payloads, and `401` for signature failures, with a generic body and no stack traces or internal detail, as in the REST Security Cheat Sheet's [Error handling](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#error-handling) section.
- Route events that repeatedly fail processing to a dead-letter queue and alert on it instead of dropping them.

#### Logging and Monitoring

Logs are how you detect probing and diagnose integration failures, but full payloads and secrets must stay out of them.

- Log the timestamp, source IP, HTTP method, response status, event ID, event type, and processing latency.
- Do not log full request bodies (they often contain personal data), signing secrets, or `Authorization` and signature header values; see [Data to exclude](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude) in the Logging Cheat Sheet.
- Alert on spikes in signature failures (someone is probing the endpoint), sustained `4xx` or `5xx` responses (processing failure or misconfiguration), and deliveries from unexpected source addresses.

### Quick Reference Checklist

Stripe's and GitHub's best-practice pages ([Stripe](https://docs.stripe.com/webhooks#best-practices), [GitHub](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks)) cover the subscriber side of their own platforms; use this table to check both sides of any integration.

| Control | Publisher | Subscriber |
|---|---|---|
| TLS 1.2 or higher with a trusted CA certificate | Yes | Yes |
| HMAC-SHA256 signature on every delivery | Sign | Verify with a constant-time comparison |
| One secret per webhook, stored in a secrets manager | Yes | Yes |
| Planned rotation with an overlap window | Sign with every active secret | Accept any matching signature |
| Compromised secret | Revoke and replace immediately | Stop accepting the revoked secret |
| Authenticated timestamp and event ID | Include when designing the protocol | Enforce freshness and deduplication where supported by the provider |
| Replay cache retention | n/a | At least twice the timestamp tolerance; keep a separate processing record across retries |
| Idempotent, order-independent processing | n/a | Yes |
| SSRF checks on callback URLs at connect time | Yes | n/a |
| Rate limiting | Throttle, back off, cap retries | `429` plus an asynchronous queue |
| Payload size limit and schema validation | Keep payloads small | Yes |
| `POST` only, `405` for other methods | n/a | Yes |
| Generic errors: `400` malformed, `401` bad signature | n/a | Yes |
| Structured logs without secrets or full bodies | Yes | Yes |

### Security Testing

Run these tests before going to production and after any change to webhook handling code:

- Missing or invalid signature: the endpoint returns `401`, not `200`.
- Replay protection: for protocols with authenticated timestamps and event IDs, verify that stale deliveries fail freshness checks and an already accepted event cannot trigger side effects twice. A valid duplicate already durably queued or processed receives `200`.
- Duplicate event ID: deliver the same event twice and confirm it is processed once. GitHub's redelivery feature reuses the original [`X-GitHub-Delivery`](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks#use-the-x-github-delivery-header) value, which makes it a convenient duplicate test.
- Oversized payload: exceed your size limit and expect `400` or `413`.
- SSRF (publisher side): register an `http://` URL, `https://169.254.169.254/`, `https://127.0.0.1/`, an internal hostname, and a public hostname that resolves to a private address; every one must be rejected at registration or blocked at delivery time. [WSTG-INPV-19](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/07-Input_Validation_Testing/19-Testing_for_Server-Side_Request_Forgery/) describes the test cases and the filter bypasses to try, such as alternative IP encodings.
- Secret rotation: both secrets are accepted during planned overlap; a revoked or compromised secret is no longer accepted.
- Use the publisher's own test tooling where it exists, such as [`stripe trigger`](https://docs.stripe.com/webhooks#trigger-test-events), to exercise the handler with genuine signed deliveries.

## Microservices Security

> **Source:** [Microservices Security](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

The microservice architecture is being increasingly used for designing and implementing application systems in both cloud-based and on-premise infrastructures, high-scale applications and services. There are many security challenges that need to be addressed in the application design and implementation phases. The fundamental security requirements that have to be addressed during design phase are authentication and authorization. Therefore, it is vital for applications security architects to understand and properly use existing architecture patterns to implement authentication and authorization in microservices-based systems. The goal of this cheat sheet is to identify such patterns and to do recommendations for applications security architects on possible ways to use them.

### Edge-level authorization

Use gateway checks to reject unauthorized ingress requests, and prevent direct access that bypasses those checks. Keep fine-grained authorization at the service when it needs resource or business context. See [Authorization Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Patterns_Cheat_Sheet.html#gateway-and-proxy-enforcement) for gateway and proxy enforcement, its limitations, and propagated authorization context.

### Service-level authorization

Each service must enforce access to its protected operations, including internal calls. Prefer shared, reviewed policies as the system grows, with service-level enforcement of object, tenant, and business-specific rules. See [Authorization Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Patterns_Cheat_Sheet.html#service-level-authorization) for policy placement and [Policy and Data Distribution](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Policy_And_Data_Distribution_Cheat_Sheet.html) for update and outage handling. Gateway checks complement these controls; they do not establish that a downstream operation is authorized.

### External Entity Identity Propagation

Propagate authenticated user context in a form each receiving service can validate, and authenticate the calling service separately. A signature protects an assertion's integrity; it does not itself grant access to a requested resource. See [Identity Propagation Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Identity_Propagation_Patterns_Cheat_Sheet.html) for forwarding, token exchange, trusted internal assertions, and their limitations.

### Service-to-service authentication

#### Existing patterns

##### Mutual transport layer security

With an mTLS approach, each microservice can legitimately identify who it talks to, in addition to achieving confidentiality and integrity of the transmitted data. Each microservice in the deployment has to carry a public/private key pair and use that key pair to authenticate to the recipient microservices via mTLS. mTLS is usually implemented with a self-hosted Public Key Infrastructure. The main challenges of using mTLS are key provisioning and trust bootstrap, certificate revocation, and key rotation.

##### Token-based

The token-based approach works at the application layer. A token is a container that may contain the caller ID (microservice ID) and its permissions (scopes). The caller microservice can obtain a signed token by invoking a special security token service using its own service ID and password and then attaches it to every outgoing request, e.g., via HTTP headers. The called microservice can extract the token and validate it online or offline.
![Signed ID propagation](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Token_validation.png)

Choose token validation based on the required revocation response time, token lifetime, and availability requirements:

1. Online validation:
    - The microservice queries the token service. For OAuth, [token introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2.2) reports whether a token is active and can reflect revocation known to the authorization server.
    - Network calls add latency and a dependency on the token service's availability. [Caching introspection responses delays detection of revocation](https://www.rfc-editor.org/rfc/rfc7662.html#section-4); bound cache duration to the required freshness and never beyond token expiry.
2. Local validation:
    - The microservice validates a signed token using trusted issuer keys and the applicable token profile. For example, [RFC 9068 defines validation for JSON Web Token (JWT) access tokens](https://www.rfc-editor.org/rfc/rfc9068.html#section-4); signature verification alone is insufficient. See [validation at each boundary](https://cheatsheetseries.owasp.org/cheatsheets/Identity_Propagation_Patterns_Cheat_Sheet.html#validation-at-each-boundary).
    - This avoids a per-request introspection call, but local validation alone does not detect server-side revocation before token expiry. Use [token lifetimes or an additional revocation mechanism](https://www.rfc-editor.org/info/rfc7009/#section-3) that meets the required response time.

Neither approach replaces service-level authorization. Reject requests when the required token validation cannot be completed.

In most cases, token-based authentication works over TLS, which provides confidentiality and integrity of data in transit.

### Logging

Logging services in microservice-based systems aim to meet the principles of accountability and traceability and help detect security anomalies in operations via log analysis. Therefore, it is vital for application security architects to understand and adequately use existing architecture patterns to implement audit logging in microservices-based systems for security operations. A high-level architecture design is shown in the picture below and is based on the following principles:

- Each microservice writes a log message to a local file using standard output (via stdout, stderr).
- The logging agent periodically pulls log messages and sends (publishes) them to the message broker (e.g., NATS, Apache Kafka).
- The central logging service subscribes to messages in the message broker, receives them, and processes them.
![Logging pattern](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/ms_logging_pattern.png)

High-level recommendations to logging subsystem architecture with its rationales are listed below.

1. In this pattern, buffer logs locally so a temporary downstream outage does not immediately interrupt log collection. Local files do not guarantee lossless delivery: storage limits, rotation, and node loss can remove records before they are shipped. For example, [Kubernetes documents container log rotation and eviction behavior](https://kubernetes.io/docs/concepts/cluster-administration/logging/#how-nodes-handle-container-logs).
2. Run a dedicated logging agent on the same host to collect and forward local logs. After an agent failure, it can resume shipping only records that are still retained locally.
3. Use the message broker to decouple log collection from central processing. Define buffer limits and behavior when storage fills, monitor delivery failures, and test recovery from outages; see [logging verification](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#verification). A broker alone does not prevent log loss or denial of service.
4. Logging agent and message broker shall use mutual authentication (e.g., based on TLS) to encrypt all transmitted data (log messages) and authenticate themselves:
    - this allows mitigating threats such as: microservice spoofing, logging/transport system spoofing, network traffic injection, sniffing network traffic
5. Message broker shall enforce access control policy to mitigate unauthorized access and implement the principle of least privileges:
    - this allows mitigating the threat of microservice elevation of privileges
6. Exclude secrets and unnecessary sensitive data before the microservice emits a log entry, including to local files or standard output. Agent-side filtering is an additional safeguard; it cannot remove sensitive data already written to local logs. Follow the [OWASP Logging Cheat Sheet guidance on data to exclude](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude).
7. Microservices shall generate a correlation ID that uniquely identifies every call chain and helps group log messages to investigate them. The logging agent shall include a correlation ID in every log message.
8. The logging agent shall periodically provide health and status data to indicate its availability or non-availability.
9. The logging agent shall publish log messages in a structured logs format (e.g., JSON, CSV).
10. The logging agent shall append log messages with context data, e.g., platform context (hostname, container name), runtime context (class name, filename).

For a comprehensive overview of events that should be logged and possible data format, please see the [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#which-events-to-log) and [Application Logging Vocabulary Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Vocabulary_Cheat_Sheet.html)

## Denial of Service

> **Source:** [Denial of Service](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet describes a methodology for handling denial of service (DoS) attacks on different layers. It also serves as a platform for further discussion and analysis, since there are many different ways to perform DoS attacks.

#### Fundamentals

Because anti-DoS methods cannot be one-step solutions, your developers and application/infrastructure architects must develop DoS solutions carefully.  They must keep in mind that "availability" is a basic part of the [CIA triad](https://whatis.techtarget.com/definition/Confidentiality-integrity-and-availability-CIA).

  Remember that if every part of the computing system within the interoperability flow does not function correctly, your infrastructure suffers. A successful DoS attack hinders the availability of instances or objects to a system and can eventually render the entire system inaccessible.

**To ensure systems can be resilient and resist a DoS attack, we strongly suggest a thorough analysis on components within your inventory based on functionality, architecture and performance (i.e. application-wise, infrastructure and network related).**

![DDOSFlow](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Denial_of_Service_Cheat_Sheet_FlowDDOS.png)

This DoS system inventory should look for potential places where DoS attacks can cause problems and highlight any single points of system failures, which can range from programming related errors to resource exhaustion. It should give you a clear picture of what issues are at stake (e.g. bottlenecks, etc.). **To resolve problems, a solid understanding of your environment is essential to develop suitable defense mechanisms**. These could be aligned with:

1. Scaling options (**up** = inner hardware components, **out** = the number of complete components).
2. Existing conceptual / logical techniques (such as applying redundancy measurements, bulk-heading, etc. - which expands your in-house capabilities).
3. A cost analysis applied to your situation.

This document adopts a specific guidance structure from CERT-EU to analyze this subject, which you may need to change depending on your situation. It is not a complete approach but it will help you create fundamental blocks which should be utilized to assist you in constructing anti-DoS concepts fitting your needs.

#### Analyzing DoS attack surfaces

In this cheat sheet, we will use the DDOS classification as documented by CERT-EU to examine DoS system vulnerabilities. It uses the seven OSI model and focuses three main attack surfaces, namely Application, Session and Network.

##### 1) Overview of potential DoS weaknesses

It is important to understand that each of these three attack categories needs to be considered when designing a DoS-resilient solution:

 **Application attacks** focus on rendering applications unavailable by exhausting resources or by making it unusable in a functional way.

 **Session (or protocol) attacks** focus on consuming server resources, or resources of intermediary equipment like firewalls and load-balancers.

 **Network (or volumetric) attacks** focus on saturating the bandwidth of the network resource.

Note that OSI model layers 1 and 2 are not included in this categorization, so we will now discuss these layers and how DoS applies to them.

The **physical layer** consists of the networking hardware transmission technologies of a network. It is a fundamental layer underlying the logical data structures of the higher-level functions in a network. Typical DoS scenarios that involve the physical layer involve system destruction, obstruction, and malfunction. For example, a Georgian elderly woman sliced through an underground cable, resulting in the loss of internet for the whole of Armenia.

The **data layer** is the protocol layer that transfers data between adjacent network nodes in a wide area network (WAN) or between nodes on the same local area network (LAN) segment. Typical DoS scenarios are MAC flooding (targeting switch MAC tables) and ARP poisoning.

In **MAC flooding attacks**, a switch is flooded with packets that all have different source MAC addresses. The goal of this attack is to consume the limited memory used by a switch to store the MAC and physical port translation table (MAC table), which causes valid MAC addresses to be purged and forces the switch to enter a fail-over mode where it becomes a network hub. If this occurs, all data is forwarded to all ports, resulting in a data leakage.

[Future additions to sheet: The impact in relation to DoS and document compact remediation]

In **ARP poisoning attacks**, a malicious actor sends spoofed ARP (Address Resolution Protocol) messages over the wire. If the attacker's MAC address becomes linked to the IP address of a legitimate device on the network, the attacker can intercept, modify or stop data that was intended for the victim IP address. The ARP protocol is specific to the local area network and could cause a DoS on the wire communication.

Packet filtering technology can be used to inspect packets in transit to identify and block offending ARP packets. Another approach is to use static ARP tables but they prove difficult to be maintained.

### Application attacks

**Application layer attacks usually make applications unavailable by exhausting system resources or by making it unusable in a functional way.** These attacks do not have to consume the network bandwidth to be effective. Rather they place an operational strain on the application server in such a way that the server becomes unavailable, unusable or non-functional. All attacks exploiting weaknesses on OSI layer 7 protocol stack are generally categorised as application attacks. They are the most challenging to identify/mitigate.

[Future additions to sheet: List all attacks per category. Because we cannot map remediations one on one with an attack vector, we will first need to list them before discussing the action points.]

**Slow HTTP attacks deliver HTTP requests very slow and fragmented, one at a time. Until the HTTP request was fully delivered, the server will keep resources stalled while waiting for the missing incoming data.** At one moment, the server will reach the maximum concurrent connection pool, resulting in a DoS. From an attacker's perspective, slow HTTP attacks are cheap to perform because they require minimal resources.

#### Software Design Concepts

- **Using validation that is cheap in resources first**: We want to reduce impact on these resources as soon as possible. More (CPU, memory and bandwidth) expensive validation should be performed afterward.
- **Employing graceful degradation**: This is a core concept to follow during application design phase, in order to limit impact of DoS. You need to continue some level of functionality when portions of a system or application break. One of the main problems with DoS is that it causes sudden and abrupt application terminations throughout the system. A fault tolerant design enables a system or application to continue its intended operation, possibly at a reduced level, rather than failing completely if parts of the system fails.
- **Prevent single point of failure**: Detecting and preventing single points of failure (SPOF) is key to resisting DoS attacks. Most DoS attacks assume that a system has SPOFs that will fail due to overwhelmed systems. We suggest that you employ stateless components, use redundant systems, create bulkheads to stop failures from spreading across the infrastructure, and make sure that systems can survive when external services fail. [Prevention](https://www.baeldung.com/cs/distributed-systems-prevent-single-point-failure)
- **Avoid highly CPU consuming operations**: When a DoS attack occurs, operations that tend to use a lot of CPU resources can become serious drags on system performance and can become a point of failure. We strongly suggest that you review performance issues with your code, including problems that are inherent in the languages that you are using. See [Java](https://www.theserverside.com/answer/How-to-fix-high-Java-CPU-usage-problems) [JVM-IBM](https://www.ibm.com/docs/en/baw/23.x?topic=issues-best-practices-high-jvm-cpu-utilization) and [Microsoft-IIS](https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/iis/health-diagnostic-performance/troubleshoot-high-cpu-in-iis-app-pool)
- **Handle exceptions**: When a DoS attack occurs, it is likely that applications will throw exceptions and it is vital that your systems can handle them gracefully. Again, a DoS attack assumes that an overwhelmed system will not be able to throw exceptions in a way that the system can continue operating. We suggest that you go through your code and make sure that exceptions are handled properly. See [Large-Scale-Systems](https://raygun.com/blog/errors-and-exceptions/) [Java](https://www.theserverside.com/blog/Coffee-Talk-Java-News-Stories-and-Opinions/Java-Exception-handling-best-practices) and [Java](https://www.digitalocean.com/community/tutorials/exception-handling-in-java)
- **Protect overflow and underflow** Since buffer overflow and underflow often lead to vulnerabilities, learning how to prevent them is key. [OWASP](https://owasp.org/www-community/vulnerabilities/Buffer_Overflow) [Overflow-Underflow-C](https://developer.apple.com/library/archive/documentation/Security/Conceptual/SecureCodingGuide/Articles/BufferOverflows.html) [Overflow](https://www.freecodecamp.org/news/buffer-overflow-attacks/)
- **Threading**: Avoid operations which must wait for completion of large tasks to proceed. Asynchronous operations are useful in these situations.
- Identify resource intensive pages and plan ahead.

#### Session

- **Limit server side session time based on inactivity and a final timeout**: (resource exhaustion) While sessions timeout is most of the time discussed in relation to session security and preventing session hijacking, it is also an important measure to prevent resource exhaustion.
- **Limit session bound information storage**: The less data is linked to a session, the less burden a user session has on the webserver's performance.

#### Input validation

- **Limit file upload size and extensions**:  This tactic prevents DoS on file space storage or other web application functions which will use the upload as input (e.g. image resizing, PDF creation, etc. (resource exhaustion) - [Checklist](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload).
- **Limit total request size**:  To make it harder for resource-consuming DoS attacks to succeed. (resource exhaustion)
- **Prevent input based resource allocation**: Again, to make it harder for resource-consuming DoS attacks to succeed. (resource exhaustion)
- **Prevent input based function and threading interaction**:  User input can influence how many times a function needs to be executed, or how intensive the CPU consumption becomes. Depending on (unfiltered) user input for resource allocation could allow a DoS scenario through resource exhaustion. (resource exhaustion)
- **Input based puzzles** like captchas or simple math problems are often used to 'protect' a web form. The classic example is a webform that will send out an email after posting the request. A captcha could then prevent the mailbox from getting flooded by a malicious attacker or spambot.  **Puzzles serve a purpose against functionality abuse but this kind of technology will not help defend against DoS attacks.**

#### Access control

- **Authentication as a means to expose functionality**: The principle of least privilege can play a key role in preventing DoS attacks by denying attackers the ability to access potentially damaging functions with DoS techniques.
- **User lockout** is a scenario where an attacker can take advantage of the application security mechanisms to cause DoS by abusing the login failure.

### Network attacks

For more information on network attacks, see:

[Juniper](https://www.juniper.net/documentation/us/en/software/junos/denial-of-service/topics/topic-map/security-network-dos-attack.html)
[eSecurityPlanet](https://www.esecurityplanet.com/networks/types-of-ddos-attacks/)

[Future additions to cheat sheet: Discuss attacks where network bandwidth gets saturation. Volumetric in nature. Amplification techniques make these attacks effective. List attacks: NTP amplification, DNS amplification, UDP flooding, TCP flooding]

#### Network Design Concepts

- **Preventing single point of failure**: See above.
- **Caching**: The concept that data is stored so future requests for that data can be served faster. The more data is served via caching, to more resilient the application becomes to bandwidth exhaustion.
- **Static resources hosting on a different domain** will reduce the number of http requests on the web application. Images and JavaScript are typical files that are loaded from a different domain.  

#### Rate limiting

Rate limiting is the process of controlling traffic rate from and to a server or component. It can be implemented on infrastructure as well as on an application level. Rate limiting can be based on (offending) IPs, on IP block lists, on geolocation, etc.

- **Define a minimum ingress data rate** with request-read timeouts to mitigate slow HTTP attacks; see [Apache's minimum-rate and timeout controls](https://httpd.apache.org/docs/current/mod/mod_reqtimeout.html#requestreadtimeout) for an example. A minimum rate set too high can reject legitimate slow clients; setting it too low weakens protection against slow senders. Inspect the logs to establish a baseline of genuine traffic rates.
- **Define an absolute connection timeout**
- **Define a maximum ingress data rate limit** then drop all connections above that rate.
- **Define a total bandwidth size limit** to prevent bandwidth exhaustion
- **Define a load limit**, which specifies the number of users allowed to access any given resource at any given time.

#### ISP-Level remediations

- **Filter invalid sender addresses using edge routers**, in accordance with RFC 2267, to filter out IP-spoofing attacks done with the goal of bypassing block lists.
- **Check your ISP services in terms of DDOS beforehand** (support for multiple internet access points, enough bandwidth (xx-xxx Gbit/s) and special hardware for traffic analysis and defense on application level

#### Global-Level remediations: Commercial cloud filter services

- Consider a DDoS filtering service for larger attacks. [Assess the provider's mitigation capacity and coverage](https://www.cisa.gov/sites/default/files/2023-09/TLP%20CLEAR%20-DDOS%20Mitigations%20Guidance_508c.pdf) against your availability requirements; do not assume a fixed attack-size ceiling.
- **Filter services** support different mechanics to filter out malicious or non compliant traffic
- **Comply with relevant data protection/privacy laws** - a lot of providers route traffic through USA/UK

## Bot Management and Anti-Automation

> **Source:** [Bot Management and Anti-Automation](https://cheatsheetseries.owasp.org/cheatsheets/Bot_Management_and_Anti-Automation_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Modern web applications face a continuous stream of automated traffic that is not a Distributed Denial of Service event but is still abusive: credential stuffing, content scraping, inventory hoarding (scalping), fake account creation, gift-card enumeration, card testing, fake reviews, click fraud, and skewed analytics. The OWASP **Automated Threats to Web Applications** project (OAT-001 through OAT-021) catalogs these patterns.

This cheat sheet provides defensive guidance that goes beyond the [Credential Stuffing Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html) and addresses the full spectrum of automated abuse. It focuses on architecture, signals, response strategy, and CAPTCHA alternatives.

The objective is **not to block all bots** (search engine crawlers, monitoring agents, and accessibility tools are legitimate) but to raise the cost of abusive automation while keeping legitimate users and bots unaffected.

### Common Threats and Risks

- **OAT-008 Credential Stuffing** — replaying breached username/password pairs.
- **OAT-011 Scraping** — large-scale content, price, or PII extraction.
- **OAT-005 Scalping / Inventory Hoarding** — buying limited stock for resale.
- **OAT-019 Account Creation** — fake accounts at signup endpoints.
- **OAT-012 Cashing Out** — using stolen accounts to extract value.
- **OAT-001 Carding** — testing stolen card numbers via low-value purchases.
- **OAT-003 Ad Fraud** — fake clicks and impressions.
- **OAT-002 Token Cracking** — brute-forcing gift cards, vouchers, coupons.
- **OAT-015 Denial of Inventory** — adding items to cart to deplete stock.
- **OAT-014 Vulnerability Scanning** — automated probing for weaknesses.
- **Skewed business metrics** — bots polluting A/B tests, recommendations, fraud models.
- **Privacy violations** — over-collecting fingerprinting data to defend against bots.

### Threat Modeling Before Controls

Before adding tooling, identify which OAT categories apply to your application and which endpoints are at risk. A login form, a search page, a checkout, and a public API have very different threat profiles and defenses.

| Endpoint type | Primary OAT risk | Suggested first control |
|---|---|---|
| Login | OAT-008 Credential Stuffing | Rate limit + breached-password check + MFA |
| Signup | OAT-019 Account Creation | Email/phone verification + velocity limits |
| Search / catalog | OAT-011 Scraping | Rate limit per identity + behavioral signal |
| Checkout / cart | OAT-005 Scalping, OAT-001 Carding | Queue + purchase limits + 3D Secure |
| Public API | OAT-011, OAT-014 | API keys + per-key quotas + signed requests |
| Comments / reviews | OAT-020 Account Aggregation, spam | Reputation + delayed publishing |

### Layered Defense Architecture

A single control is brittle. Combine controls at three layers:

1. **Edge layer** — CDN, WAF, or anti-bot service: IP reputation, ASN filtering, TLS fingerprint (JA3/JA4), HTTP/2 fingerprint, basic rate limits.
2. **Application layer** — session-aware rate limits, identity-bound quotas, behavioral signals, honeypots, CAPTCHA challenges.
3. **Backend / business layer** — anomaly detection on transactions, account-velocity rules, fraud scoring, async review queues.

A request that looks human at one layer (good IP, valid CAPTCHA) may still fail at another (10 checkouts in 30 seconds with different cards).

### Rate Limiting and Quotas

Rate limiting is the foundational control. Apply it at multiple keys, not just IP.

- **Per IP** — coarse, defeated by residential proxy networks but still useful as a floor.
- **Per session / cookie** — defeated by cookie clearing, useful against unsophisticated bots.
- **Per authenticated identity** — most reliable; applies after login.
- **Per endpoint** — the login endpoint deserves a tighter limit than the home page.
- **Per ASN or geo** — useful when traffic from datacenter ASNs is unexpected.

Use a token-bucket or sliding-window algorithm. Avoid fixed-window counters: they allow bursts at boundary times.

A correct login-endpoint rate limit applies **two independent buckets**, both of which must be under their threshold for the request to pass:

- **Per-username bucket** — limits attempts against any single account regardless of source IP. Defends a targeted account from a distributed attack.
- **Per-IP (or per-IP+ASN) bucket** — limits the volume of attempts originating from one source against any account. Defends against credential-stuffing sweeps that try one password per account.

A common mistake is to use a single bucket keyed on the *combination* of IP and username (e.g., `login:<ip>:<user>`). This creates one bucket per pair, which means a single IP can attempt the threshold against an unlimited number of usernames before any limit fires — exactly the credential-stuffing pattern you were trying to stop. Always check the two buckets separately.

When a limit is hit, return a generic `429 Too Many Requests`. Avoid `Retry-After` values precise enough to schedule retries against. Do not include diagnostic detail (which bucket fired, remaining attempts) — that information is useful only to attackers tuning their tooling.

### Device and Network Fingerprinting (Privacy-Aware)

Fingerprinting helps detect bots that rotate IPs but reuse client environments. Use **passive, network-level** signals first; resort to client-side fingerprinting only when necessary.

Network signals (no client cooperation needed):

- **JA3 / JA4** — TLS ClientHello fingerprint. Headless tooling often produces uncommon JA3 values.
- **HTTP/2 fingerprint (Akamai)** — frame ordering, settings, priorities.
- **Client Hints (`Sec-CH-UA-*`)** — declared but verifiable against TLS fingerprint.

Browser-side signals (last resort, with consent where required):

- WebGL renderer string, canvas hash, font list, audio context — strong but invasive.
- Page-level behavioral telemetry (mouse paths, scroll, focus) — collect only on sensitive flows.

**Privacy guidance:**

- Document fingerprinting in your privacy notice; some jurisdictions (EU/UK ePrivacy, CCPA) require disclosure or opt-out.
- Hash or truncate any fingerprint before storage; do not retain raw values that enable re-identification.
- Set short retention windows (hours to days) for anti-bot signals — long enough to detect, short enough to limit surveillance risk.
- Avoid fingerprinting authenticated, low-risk traffic (a logged-in user reading their own profile does not need to be fingerprinted again).

### CAPTCHA and Its Modern Alternatives

Visible CAPTCHAs (image grids, distorted text) are accessibility-hostile, machine-solvable by ML, and outsourced to human solver farms for fractions of a cent per solve. Treat them as a **last-resort step-up**, not a primary defense.

Prefer the following alternatives or layer them:

- **Cryptographic attestation tokens** — [Privacy Pass](https://www.rfc-editor.org/rfc/rfc9576.html#section-3.5.1) lets an origin verify that a client satisfied an issuer's attestation policy, such as a CAPTCHA, a device check, or account validation. Select trusted issuers whose policies match your use case; a valid token is not a general proof that the requester is human. [Privacy guarantees](https://www.rfc-editor.org/rfc/rfc9576.html#section-3.3) depend on the deployment and its trust assumptions.
- **Managed challenges** — Cloudflare Turnstile returns a validation result, not a risk score. [Validate each token server-side with Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), require `success: true`, and check the expected hostname and configured action. Tokens expire after five minutes and are single-use.
- **Invisible risk scoring** — reCAPTCHA v3 and hCaptcha Enterprise return scores for application-defined thresholds.
- **Proof of work (PoW)** — require computation before serving selected expensive requests. This can increase automation cost but does not establish that the client is human. Benchmark supported clients: [overly hard puzzles](https://www.rfc-editor.org/rfc/rfc8019.html#section-10) can themselves deny service to legitimate users.
- **WebAuthn / Passkeys** — for high-value flows, possession of a registered authenticator is a far stronger bot signal than any CAPTCHA.

Use a maintained challenge implementation rather than a standalone hash check. Keep the challenge, difficulty and expiry under server control; reject unknown, expired or spent challenges, and prevent concurrent reuse. Bind the accepted work to the intended policy. The [Anubis challenge lifecycle](https://github.com/TecharoHQ/anubis/blob/d60d8a833e4d7f8dd5b4468a7ed5940d202ca176/lib/anubis.go#L637-L719) illustrates validation and reuse checks beyond the hash itself. Retain rate limits after a challenge is passed.

### Honeypots and Tarpits

Cheap, effective, and zero impact on legitimate users.

- **Hidden form fields** — a `<input type="text" name="website" />` styled `display:none` and labeled "leave blank." Bots fill it; humans do not. Reject the submission.
- **Robots.txt traps** — disallow a bait path in `robots.txt`; treat any traffic to it as malicious (well-behaved crawlers respect the directive; abusive ones do not).
- **Tarpitting** — for detected bots, do not return `403`. Slow responses progressively (e.g., `setTimeout(send, 5000 + jitter)`). The bot's throughput collapses without telegraphing detection.
- **Canary content** — embed unique, watermarked records on listing pages. If they appear elsewhere, you have proof of scraping and a fingerprint of the scraper.

```html
<!-- Honeypot field. Real users never see or fill this. -->
<div aria-hidden="true" style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;">
  <label for="company_url">Leave this field empty</label>
  <input type="text" id="company_url" name="company_url" tabindex="-1" autocomplete="off" />
</div>
```

Server side: if `company_url` is non-empty, silently drop the request or route to a tarpit.

### Defending Specific Flows

#### Account creation (OAT-019)

- Verify email **before** the account is usable; do not just send a confirmation, gate features behind it.
- Check email against disposable-domain lists (refresh weekly).
- For phone verification, check the carrier type — VoIP numbers are abundant and cheap.
- Apply a per-IP, per-ASN, per-device-fingerprint signup velocity limit (e.g., 3 per hour).
- Reject signup if the email's local-part has high entropy and recent-creation domain.

#### Login (OAT-008)

- Apply per-username **and** per-IP limits with separate windows.
- Check the submitted password against breach corpora (e.g., HaveIBeenPwned k-Anonymity API) — do not block, but require a step-up.
- On suspicious patterns, require MFA even for low-risk users. See the [Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) and [Multifactor Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) cheat sheets for implementation guidance.
- See the [Credential Stuffing Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html) for full guidance.

#### Inventory / scalping (OAT-005, OAT-015)

- **Waiting room / virtual queue** for limited drops — randomized admission, tokens bound to session and identity.
- **Per-account purchase limits** enforced server side, including identity proxies (same payment method, same shipping address, same device).
- **Hold time** — inventory in cart must be paid for within N seconds or released; prevents cart-camping.
- **Address and payment dedup** at order time using normalized hashes (street + zip, BIN + last4 + holder hash).

#### Public APIs

- API keys with rotating secrets, **not** static bearer tokens checked in to client code.
- Per-key quotas advertised in `X-RateLimit-*` headers so well-behaved clients self-throttle.
- Request signing (e.g., HMAC of method + path + timestamp + body) to prevent replay and require a stable secret.
- Tier APIs explicitly: a public catalog endpoint may serve cached, slightly-delayed data; partner APIs serve realtime data with an authenticated key.

### Response Strategy: Don't Always Block

Hard blocks teach attackers what worked. A graduated response is more durable.

| Confidence | Response |
|---|---|
| Low (suspicious) | Log; serve normally; flag the session |
| Medium | Step-up: CAPTCHA, MFA, or PoW challenge |
| High | Tarpit (slow responses), serve stale or randomized data |
| Very high | Soft-block specific actions (e.g., disable checkout, allow browsing) |
| Confirmed abuse | Account hold + manual review; do not delete to allow forensics |

For scrapers specifically, returning **plausible but slightly wrong data** (price ±1%, fake stock counts) poisons the dataset and is often more damaging to the business case for scraping than a 403.

### Logging and Monitoring

Bot incidents are detected post-hoc almost as often as in real time. Log enough to investigate.

For each request to a sensitive endpoint, capture:

- Timestamp, request ID, route, status code.
- Client IP, ASN, country.
- TLS fingerprint (JA3/JA4) and HTTP/2 fingerprint.
- User-Agent (raw, plus parsed family/version).
- Authenticated identity (or session ID hash).
- Decision and signals (e.g., `bot_score=0.87`, `rule=login_velocity`).

Mask credentials and PII in logs (see the [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)).

Build dashboards for: requests-per-second by endpoint, 4xx/5xx rate, fail rate by route, signup-to-purchase funnel, login success rate. Sudden shifts (more than 3-sigma) on these are bot signals.

```python
# Minimal structured log record for an anti-bot decision.
import json, hashlib, time

def log_decision(req, score, decision, rule):
    record = {
        "ts": int(time.time() * 1000),
        "route": req.path,
        "ip": req.remote_addr,
        "asn": req.headers.get("X-ASN"),  # set by your edge
        "ja4": req.headers.get("X-TLS-JA4"),
        "ua": req.headers.get("User-Agent"),
        "session": hashlib.sha256(
            (req.cookies.get("sid") or "").encode()
        ).hexdigest()[:16],
        "score": score,
        "decision": decision,   # allow | challenge | tarpit | block
        "rule": rule,
    }
    print(json.dumps(record))
```

### Privacy and Compliance

Anti-bot defenses collect data. Treat them like any other data-processing activity.

- Document the applicable lawful basis and the categories of data collected. Assess any consent requirements or exemptions for device storage and access, including fingerprinting; [UK ICO guidance](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/09/fact-vs-fiction-ico-debunks-myths-on-storage-and-access-technologies/) explains that legitimate interests cannot replace consent when consent is required.
- Apply **data minimization**: collect what you need to score the request and discard the rest.
- Set a short retention period for raw signals; aggregate for longer-term analytics.
- If you use a third-party anti-bot vendor, list them as a sub-processor and review their DPIA.
- Do not block users solely because their browser is hardened (privacy-respecting users often look "bot-like"). Prefer challenge to block.
- Provide an accessible alternative when challenging users with CAPTCHAs (audio CAPTCHA, support contact).

### Anti-Patterns to Avoid

- Blocking all traffic with non-standard User-Agents — breaks legitimate research, accessibility, and integration tools.
- Relying solely on a single edge vendor "magic box" — when it tunes wrong, your entire site goes down or opens up.
- Storing raw fingerprints indefinitely.
- CAPTCHAs at every login attempt — destroys conversion and trains users to solve mechanically.
- "Hidden" anti-bot rules with no logging — you cannot tune what you cannot see.
- Hard-blocking on first signal, with no graduated response — gives attackers a clean signal to iterate against.

### Checklist

- [ ] Map application endpoints to the OWASP Automated Threats (OAT) catalog.
- [ ] Apply rate limits at IP, identity, and endpoint levels, using a sliding window.
- [ ] Layer defenses across edge, application, and business logic.
- [ ] Use TLS/HTTP-level fingerprints before resorting to browser fingerprinting.
- [ ] Replace visible CAPTCHAs with attestation tokens, invisible scoring, or PoW where possible.
- [ ] Add honeypot fields and tarpit responses for high-confidence detections.
- [ ] Verify email and phone numbers at signup; track signup velocity.
- [ ] Enforce per-account purchase, address, and payment-method limits on scarce inventory.
- [ ] Sign API requests; advertise quotas via `X-RateLimit-*` headers.
- [ ] Log decisions with signals; build anomaly dashboards.
- [ ] Mask PII and rotate raw signal storage on a short schedule.
- [ ] Document anti-bot processing in your privacy notice.
- [ ] Provide accessibility alternatives to any user-facing challenge.
