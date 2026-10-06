---
title: "HTTP for APIs"
order: 6
summary: "What an API needs from HTTP: request methods, status codes, the anatomy of a request in Node.js, and how to secure a REST API."
category: "Node.js & APIs"
level: Intermediate
---

# HTTP for APIs

A REST API is HTTP used deliberately: the right method for each action, the right status code for each outcome, and security built in from the first endpoint.

**Course outline modules:** 6-7 (API Development), 27 (Advanced Topics in API Development)

## HTTP request methods

> **Source:** [HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/http/reference/methods) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5

HTTP defines a set of **request methods** to indicate the purpose of the request and what is expected if the request is successful.
Although they can also be nouns, these request methods are sometimes referred to as _HTTP verbs_.
Each request method has its own semantics, but some characteristics are shared across multiple methods, specifically request methods can be safe, idempotent, or cacheable.

- `GET`
  - : The `GET` method requests a representation of the specified resource.
    Requests using `GET` should only retrieve data and should not contain a request content.
- `QUERY`
  - : The `QUERY` method initiates a server-side query. It requests that the target resource process the request content in a safe and idempotent manner, returning the result in the response.
    It is similar to `GET`, but allows request content with defined semantics.
- `HEAD`
  - : The `HEAD` method asks for a response identical to a `GET` request, but without a response body.
- `POST`
  - : The `POST` method submits an entity to the specified resource, often causing a change in state or side effects on the server.
- `PUT`
  - : The `PUT` method replaces all current representations of the target resource with the request content.
- `DELETE`
  - : The `DELETE` method deletes the specified resource.
- `CONNECT`
  - : The `CONNECT` method establishes a tunnel to the server identified by the target resource.
- `OPTIONS`
  - : The `OPTIONS` method describes the communication options for the target resource.
- `TRACE`
  - : The `TRACE` method performs a message loop-back test along the path to the target resource.
- `PATCH`
  - : The `PATCH` method applies partial modifications to a resource.

### Safe, idempotent, and cacheable request methods

The following table lists HTTP request methods and their categorization in terms of safety, cacheability, and idempotency.

| Method                    | Safe | Idempotent | Cacheable     |
| ------------------------- | ---- | ---------- | ------------- |
| `GET`     | Yes  | Yes        | Yes           |
| `QUERY`   | Yes  | Yes        | Yes           |
| `HEAD`    | Yes  | Yes        | Yes           |
| `OPTIONS` | Yes  | Yes        | No            |
| `TRACE`   | Yes  | Yes        | No            |
| `PUT`     | No   | Yes        | No            |
| `DELETE`  | No   | Yes        | No            |
| `POST`    | No   | No         | Conditional\* |
| `PATCH`   | No   | No         | Conditional\* |
| `CONNECT` | No   | No         | No            |

\* `POST` and `PATCH` are cacheable when responses explicitly include [freshness](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) information and a matching `Content-Location` header.

### Specifications

### Browser compatibility

### See also

- [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers)

## HTTP response status codes

> **Source:** [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/http/reference/status) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5

HTTP response status codes indicate whether a specific [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) request has been successfully completed.
Responses are grouped in five classes:

1. [Informational responses](#informational_responses) (`100` – `199`)
2. [Successful responses](#successful_responses) (`200` – `299`)
3. [Redirection messages](#redirection_messages) (`300` – `399`)
4. [Client error responses](#client_error_responses) (`400` – `499`)
5. [Server error responses](#server_error_responses) (`500` – `599`)

The status codes listed below are defined by [RFC 9110](https://httpwg.org/specs/rfc9110.html#overview.of.status.codes).

> **Note:**
> If you receive a response that is not listed here, it is a non-standard response, possibly custom to the server's software.

### Informational responses

- `100 Continue`
  - : This interim response indicates that the client should continue the request or ignore the response if the request is already finished.
- `101 Switching Protocols`
  - : This code is sent in response to an `Upgrade` request header from the client and indicates the protocol the server is switching to.
- `102 Processing`
  - : This code was used in Web Distributed Authoring (WebDAV contexts to indicate that a request had been received by the server, but no status was available at the time of the response.
    The status code was first introduced in RFC 2518, but it was removed from WebDAV in RFC 4918.
    The response code has been deprecated and it is no longer used.
- `103 Early Hints`
  - : This status code is primarily intended to be used with the `Link` header, letting the user agent start [preloading](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload) resources while the server prepares a response or [preconnect](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preconnect) to an origin from which the page will need resources.

### Successful responses

- `200 OK`
  - : The request succeeded. The result and meaning of "success" depends on the HTTP method:
    - `GET`: The resource has been fetched and transmitted in the message body.
    - `HEAD`: Representation headers are included in the response without any message body.
    - `PUT` or `POST`: The resource describing the result of the action is transmitted in the message body.
    - `TRACE`: The message body contains the request as received by the server.
- `201 Created`
  - : The request succeeded, and a new resource was created as a result. This is typically the response sent after `POST` requests, or some `PUT` requests.
- `202 Accepted`
  - : The request has been received but not yet acted upon.
    It is noncommittal, since there is no way in HTTP to later send an asynchronous response indicating the outcome of the request.
    It is intended for cases where another process or server handles the request, or for batch processing.
- `203 Non-Authoritative Information`
  - : This response code means the returned metadata is not exactly the same as is available from the origin server, but is collected from a local or a third-party copy.
    This is mostly used for mirrors or backups of another resource.
    Except for that specific case, the `200 OK` response is preferred to this status.
- `204 No Content`
  - : There is no content to send for this request, but the headers are useful.
    The user agent may update its cached headers for this resource with the new ones.
- `205 Reset Content`
  - : Tells the user agent to reset the document which sent this request.
- `206 Partial Content`
  - : This response code is used in response to a [range request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests) when the client has requested a part or parts of a resource.
- `207 Multi-Status` (WebDAV)
  - : Conveys information about multiple resources, for situations where multiple status codes might be appropriate.
- `208 Already Reported` (WebDAV)
  - : Used inside a `<dav:propstat>` response element to avoid repeatedly enumerating the internal members of multiple bindings to the same collection.
- `226 IM Used` ([HTTP Delta encoding](https://datatracker.ietf.org/doc/html/rfc3229))
  - : The server has fulfilled a `GET` request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.

### Redirection messages

- `300 Multiple Choices`
  - : In [agent-driven content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation#agent-driven_negotiation), the request has more than one possible response and the user agent or user should choose one of them.
    There is no standardized way for clients to automatically choose one of the responses, so this is rarely used.
- `301 Moved Permanently`
  - : The URL of the requested resource has been changed permanently. The new URL is given in the response.
- `302 Found`
  - : This response code means that the URI of requested resource has been changed _temporarily_.
    Further changes in the URI might be made in the future, so the same URI should be used by the client in future requests.
- `303 See Other`
  - : The server sent this response to direct the client to get the requested resource at another URI with a `GET` request.
- `304 Not Modified`
  - : This is used for caching purposes.
    It tells the client that the response has not been modified, so the client can continue to use the same [cached](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) version of the response.
- `305 Use Proxy`
  - : Defined in a previous version of the HTTP specification to indicate that a requested response must be accessed by a proxy.
    It has been deprecated due to security concerns regarding in-band configuration of a proxy.
- `306 unused`
  - : This response code is no longer used; but is reserved. It was used in a previous version of the HTTP/1.1 specification.
- `307 Temporary Redirect`
  - : The server sends this response to direct the client to get the requested resource at another URI with the same method that was used in the prior request.
    This has the same semantics as the `302 Found` response code, with the exception that the user agent _must not_ change the HTTP method used: if a `POST` was used in the first request, a `POST` must be used in the redirected request.
- `308 Permanent Redirect`
  - : This means that the resource is now permanently located at another URI, specified by the `Location` response header.
    This has the same semantics as the `301 Moved Permanently` HTTP response code, with the exception that the user agent _must not_ change the HTTP method used: if a `POST` was used in the first request, a `POST` must be used in the second request.

### Client error responses

- `400 Bad Request`
  - : The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).
- `401 Unauthorized`
  - : Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated".
    That is, the client must authenticate itself to get the requested response.
- `402 Payment Required`
  - : The initial purpose of this code was for digital payment systems, however this status code is rarely used and no standard convention exists.
- `403 Forbidden`
  - : The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource.
    Unlike `401 Unauthorized`, the client's identity is known to the server.
- `404 Not Found`
  - : The server cannot find the requested resource.
    In the browser, this means the URL is not recognized.
    In an API, this can also mean that the endpoint is valid but the resource itself does not exist.
    Servers may also send this response instead of `403 Forbidden` to hide the existence of a resource from an unauthorized client.
    This response code is probably the most well known due to its frequent occurrence on the web.
- `405 Method Not Allowed`
  - : The [request method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods) is known by the server but is not supported by the target resource.
    For example, an API may not allow `DELETE` on a resource, or the `TRACE` method entirely.
- `406 Not Acceptable`
  - : This response is sent when the web server, after performing [server-driven content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation#server-driven_content_negotiation), doesn't find any content that conforms to the criteria given by the user agent.
- `407 Proxy Authentication Required`
  - : This is similar to `401 Unauthorized` but authentication is needed to be done by a proxy.
- `408 Request Timeout`
  - : This response is sent on an idle connection by some servers, even without any previous request by the client.
    It means that the server would like to shut down this unused connection.
    This response is used much more since some browsers use HTTP pre-connection mechanisms to speed up browsing.
    Some servers may shut down a connection without sending this message.
- `409 Conflict`
  - : This response is sent when a request conflicts with the current state of the server.
    In WebDAV remote web authoring, `409` responses are errors sent to the client so that a user might be able to resolve a conflict and resubmit the request.
- `410 Gone`
  - : This response is sent when the requested content has been permanently deleted from server, with no forwarding address.
    Clients are expected to remove their caches and links to the resource.
    The HTTP specification intends this status code to be used for "limited-time, promotional services".
    APIs should not feel compelled to indicate resources that have been deleted with this status code.
- `411 Length Required`
  - : Server rejected the request because the `Content-Length` header field is not defined and the server requires it.
- `412 Precondition Failed`
  - : In [conditional requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests), the client has indicated preconditions in its headers which the server does not meet.
- `413 Content Too Large`
  - : The request body is larger than limits defined by server.
    The server might close the connection or return a `Retry-After` header field.
- `414 URI Too Long`
  - : The URI requested by the client is longer than the server is willing to interpret.
- `415 Unsupported Media Type`
  - : The media format of the requested data is not supported by the server, so the server is rejecting the request.
- `416 Range Not Satisfiable`
  - : The [ranges](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests) specified by the `Range` header field in the request cannot be fulfilled.
    It's possible that the range is outside the size of the target resource's data.
- `417 Expectation Failed`
  - : This response code means the expectation indicated by the `Expect` request header field cannot be met by the server.
- `418 I'm a teapot`
  - : The server refuses the attempt to brew coffee with a teapot.
- `421 Misdirected Request`
  - : The request was directed at a server that is not able to produce a response.
    This can be sent by a server that is not configured to produce responses for the combination of scheme and authority that are included in the request URI.
- `422 Unprocessable Content` (WebDAV)
  - : The request was well-formed but was unable to be followed due to semantic errors.
- `423 Locked` (WebDAV)
  - : The resource that is being accessed is locked.
- `424 Failed Dependency` (WebDAV)
  - : The request failed due to failure of a previous request.
- `425 Too Early`
  - : Indicates that the server is unwilling to risk processing a request that might be replayed.
- `426 Upgrade Required`
  - : The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol.
    The server sends an `Upgrade` header in a 426 response to indicate the required protocol(s).
- `428 Precondition Required`
  - : The origin server requires the request to be [conditional](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests).
    This response is intended to prevent the 'lost update' problem, where a client `GET`s a resource's state, modifies it and `PUT`s it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict.
- `429 Too Many Requests`
  - : The user has sent too many requests in a given amount of time (rate limiting).
- `431 Request Header Fields Too Large`
  - : The server is unwilling to process the request because its header fields are too large.
    The request may be resubmitted after reducing the size of the request header fields.
- `451 Unavailable For Legal Reasons`
  - : The user agent requested a resource that cannot legally be provided, such as a web page censored by a government.

### Server error responses

- `500 Internal Server Error`
  - : The server has encountered a situation it does not know how to handle.
    This error is generic, indicating that the server cannot find a more appropriate `5XX` status code to respond with.
- `501 Not Implemented`
  - : The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore must not return this code) are `GET` and `HEAD`.
- `502 Bad Gateway`
  - : This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response.
- `503 Service Unavailable`
  - : The server is not ready to handle the request.
    Common causes are a server that is down for maintenance or that is overloaded.
    Note that together with this response, a user-friendly page explaining the problem should be sent.
    This response should be used for temporary conditions and the `Retry-After` HTTP header should, if possible, contain the estimated time before the recovery of the service.
    The webmaster must also take care about the caching-related headers that are sent along with this response, as these temporary condition responses should usually not be cached.
- `504 Gateway Timeout`
  - : This error response is given when the server is acting as a gateway and cannot get a response in time.
- `505 HTTP Version Not Supported`
  - : The HTTP version used in the request is not supported by the server.
- `506 Variant Also Negotiates`
  - : The server has an internal configuration error: during content negotiation, the chosen variant is configured to engage in content negotiation itself, which results in circular references when creating responses.
- `507 Insufficient Storage` (WebDAV)
  - : The method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request.
- `508 Loop Detected` (WebDAV)
  - : The server detected an infinite loop while processing the request.
- `510 Not Extended`
  - : The client request declares an HTTP Extension (RFC 2774) that should be used to process the request, but the extension is not supported.
- `511 Network Authentication Required`
  - : Indicates that the client needs to authenticate to gain network access.

### Browser compatibility

### See also

- [List of HTTP status codes on Wikipedia](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
- [IANA official registry of HTTP status codes](https://www.iana.org/assignments/http-status-codes)
- [rfc4918 '102 Processing' removal notes](https://www.rfc-editor.org/info/rfc4918/#section-21.4)

## Anatomy of an HTTP transaction

> **Source:** [Anatomy of an HTTP transaction](https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction) · [Node.js Learn](https://github.com/nodejs/learn), MIT

The purpose of this guide is to impart a solid understanding of the process of
Node.js HTTP handling. We'll assume that you know, in a general sense, how HTTP
requests work, regardless of language or programming environment. We'll also
assume a bit of familiarity with Node.js [`EventEmitters`][] and [`Streams`][].
If you're not quite familiar with them, it's worth taking a quick read through
the API docs for each of those.

### Create the Server

Any node web server application will at some point have to create a web server
object. This is done by using [`createServer`][].

```cjs
const http = require('node:http');

const server = http.createServer((request, response) => {
  // magic happens here!
});
```

```mjs
import http from 'node:http';

const server = http.createServer((request, response) => {
  // magic happens here!
});
```

The function that's passed in to [`createServer`][] is called once for every
HTTP request that's made against that server, so it's called the request
handler. In fact, the [`Server`][] object returned by [`createServer`][] is an
[`EventEmitter`][], and what we have here is just shorthand for creating a
`server` object and then adding the listener later.

```js
const server = http.createServer();
server.on('request', (request, response) => {
  // the same kind of magic happens here!
});
```

When an HTTP request hits the server, Node calls the request handler function
with a few handy objects for dealing with the transaction, `request` and
`response`. We'll get to those shortly.

In order to actually serve requests, the [`listen`][] method needs to be called
on the `server` object. In most cases, all you'll need to pass to `listen` is
the port number you want the server to listen on. There are some other options
too, so consult the [API reference][].

### Method, URL and Headers

When handling a request, the first thing you'll probably want to do is look at
the method and URL, so that appropriate actions can be taken. Node.js makes this
relatively painless by putting handy properties onto the `request` object.

```js
const { method, url } = request;
```

> The `request` object is an instance of [`IncomingMessage`][].

The `method` here will always be a normal HTTP method/verb. The `url` is the
full URL without the server, protocol or port. For a typical URL, this means
everything after and including the third forward slash.

Headers are also not far away. They're in their own object on `request` called
`headers`.

```js
const { headers } = request;
const userAgent = headers['user-agent'];
```

It's important to note here that all headers are represented in lower-case only,
regardless of how the client actually sent them. This simplifies the task of
parsing headers for whatever purpose.

If some headers are repeated, then their values are overwritten or joined
together as comma-separated strings, depending on the header. In some cases,
this can be problematic, so [`rawHeaders`][] is also available.

### Request Body

When receiving a `POST` or `PUT` request, the request body might be important to
your application. Getting at the body data is a little more involved than
accessing request headers. The `request` object that's passed in to a handler
implements the [`ReadableStream`][] interface. This stream can be listened to or
piped elsewhere just like any other stream. We can grab the data right out of
the stream by listening to the stream's `'data'` and `'end'` events.

The chunk emitted in each `'data'` event is a [`Buffer`][]. If you know it's
going to be string data, the best thing to do is collect the data in an array,
then at the `'end'`, concatenate and stringify it.

```js
let body = [];
request
  .on('data', chunk => {
    body.push(chunk);
  })
  .on('end', () => {
    body = Buffer.concat(body).toString();
    // at this point, `body` has the entire request body stored in it as a string
  });
```

> This may seem a tad tedious, and in many cases, it is. Luckily,
> there are modules like [`concat-stream`][] and [`body`][] on [`npm`][] which can
> help hide away some of this logic. It's important to have a good understanding
> of what's going on before going down that road, and that's why you're here!

### A Quick Thing About Errors

Since the `request` object is a [`ReadableStream`][], it's also an
[`EventEmitter`][] and behaves like one when an error happens.

An error in the `request` stream presents itself by emitting an `'error'` event
on the stream. **If you don't have a listener for that event, the error will be
_thrown_, which could crash your Node.js program.** You should therefore add an
`'error'` listener on your request streams, even if you just log it and
continue on your way. (Though it's probably best to send some kind of HTTP error
response. More on that later.)

```js
request.on('error', err => {
  // This prints the error message and stack trace to `stderr`.
  console.error(err.stack);
});
```

There are other ways of [handling these errors][] such as
other abstractions and tools, but always be aware that errors can and do happen,
and you're going to have to deal with them.

### What We've Got so Far

At this point, we've covered creating a server, and grabbing the method, URL,
headers and body out of requests. When we put that all together, it might look
something like this:

```cjs
const http = require('node:http');

http
  .createServer((request, response) => {
    const { headers, method, url } = request;
    let body = [];
    request
      .on('error', err => {
        console.error(err);
      })
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        // At this point, we have the headers, method, url and body, and can now
        // do whatever we need to in order to respond to this request.
      });
  })
  .listen(8080); // Activates this server, listening on port 8080.
```

```mjs
import http from 'node:http';

http
  .createServer((request, response) => {
    const { headers, method, url } = request;
    let body = [];
    request
      .on('error', err => {
        console.error(err);
      })
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        // At this point, we have the headers, method, url and body, and can now
        // do whatever we need to in order to respond to this request.
      });
  })
  .listen(8080); // Activates this server, listening on port 8080.
```

If we run this example, we'll be able to _receive_ requests, but not _respond_
to them. In fact, if you hit this example in a web browser, your request would
time out, as nothing is being sent back to the client.

So far we haven't touched on the `response` object at all, which is an instance
of [`ServerResponse`][], which is a [`WritableStream`][]. It contains many
useful methods for sending data back to the client. We'll cover that next.

### HTTP Status Code

If you don't bother setting it, the HTTP status code on a response will always
be 200. Of course, not every HTTP response warrants this, and at some point
you'll definitely want to send a different status code. To do that, you can set
the `statusCode` property.

```js
response.statusCode = 404; // Tell the client that the resource wasn't found.
```

There are some other shortcuts to this, as we'll see soon.

### Setting Response Headers

Headers are set through a convenient method called [`setHeader`][].

```js
response.setHeader('Content-Type', 'application/json');
response.setHeader('X-Powered-By', 'bacon');
```

When setting the headers on a response, the case is insensitive on their names.
If you set a header repeatedly, the last value you set is the value that gets
sent.

### Explicitly Sending Header Data

The methods of setting the headers and status code that we've already discussed
assume that you're using "implicit headers". This means you're counting on node
to send the headers for you at the correct time before you start sending body
data.

If you want, you can _explicitly_ write the headers to the response stream.
To do this, there's a method called [`writeHead`][], which writes the status
code and the headers to the stream.

```js
response.writeHead(200, {
  'Content-Type': 'application/json',
  'X-Powered-By': 'bacon',
});
```

Once you've set the headers (either implicitly or explicitly), you're ready to
start sending response data.

### Sending Response Body

Since the `response` object is a [`WritableStream`][], writing a response body
out to the client is just a matter of using the usual stream methods.

```js
response.write('<html>');
response.write('<body>');
response.write('<h1>Hello, World!</h1>');
response.write('</body>');
response.write('</html>');
response.end();
```

The `end` function on streams can also take in some optional data to send as the
last bit of data on the stream, so we can simplify the example above as follows.

```js
response.end('<html><body><h1>Hello, World!</h1></body></html>');
```

> It's important to set the status and headers _before_ you start
> writing chunks of data to the body. This makes sense, since headers come before
> the body in HTTP responses.

### Another Quick Thing About Errors

The `response` stream can also emit `'error'` events, and at some point you're
going to have to deal with that as well. All of the advice for `request` stream
errors still applies here.

### Put It All Together

Now that we've learned about making HTTP responses, let's put it all together.
Building on the earlier example, we're going to make a server that sends back
all of the data that was sent to us by the user. We'll format that data as JSON
using `JSON.stringify`.

```cjs
const http = require('node:http');

http
  .createServer((request, response) => {
    const { headers, method, url } = request;
    let body = [];
    request
      .on('error', err => {
        console.error(err);
      })
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        // BEGINNING OF NEW STUFF

        response.on('error', err => {
          console.error(err);
        });

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        // Note: the 2 lines above could be replaced with this next one:
        // response.writeHead(200, {'Content-Type': 'application/json'})

        const responseBody = { headers, method, url, body };

        response.write(JSON.stringify(responseBody));
        response.end();
        // Note: the 2 lines above could be replaced with this next one:
        // response.end(JSON.stringify(responseBody))

        // END OF NEW STUFF
      });
  })
  .listen(8080);
```

```mjs
import http from 'node:http';

http
  .createServer((request, response) => {
    const { headers, method, url } = request;
    let body = [];
    request
      .on('error', err => {
        console.error(err);
      })
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        // BEGINNING OF NEW STUFF

        response.on('error', err => {
          console.error(err);
        });

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        // Note: the 2 lines above could be replaced with this next one:
        // response.writeHead(200, {'Content-Type': 'application/json'})

        const responseBody = { headers, method, url, body };

        response.write(JSON.stringify(responseBody));
        response.end();
        // Note: the 2 lines above could be replaced with this next one:
        // response.end(JSON.stringify(responseBody))

        // END OF NEW STUFF
      });
  })
  .listen(8080);
```

### Echo Server Example

Let's simplify the previous example to make a simple echo server, which just
sends whatever data is received in the request right back in the response. All
we need to do is grab the data from the request stream and write that data to
the response stream, similar to what we did previously.

```cjs
const http = require('node:http');

http
  .createServer((request, response) => {
    let body = [];
    request
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        response.end(body);
      });
  })
  .listen(8080);
```

```mjs
import http from 'node:http';

http
  .createServer((request, response) => {
    let body = [];
    request
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        response.end(body);
      });
  })
  .listen(8080);
```

Now let's tweak this. We want to only send an echo under the following
conditions:

- The request method is POST.
- The URL is `/echo`.

In any other case, we want to simply respond with a 404.

```cjs
const http = require('node:http');

http
  .createServer((request, response) => {
    if (request.method === 'POST' && request.url === '/echo') {
      let body = [];
      request
        .on('data', chunk => {
          body.push(chunk);
        })
        .on('end', () => {
          body = Buffer.concat(body).toString();
          response.end(body);
        });
    } else {
      response.statusCode = 404;
      response.end();
    }
  })
  .listen(8080);
```

```mjs
import http from 'node:http';

http
  .createServer((request, response) => {
    if (request.method === 'POST' && request.url === '/echo') {
      let body = [];
      request
        .on('data', chunk => {
          body.push(chunk);
        })
        .on('end', () => {
          body = Buffer.concat(body).toString();
          response.end(body);
        });
    } else {
      response.statusCode = 404;
      response.end();
    }
  })
  .listen(8080);
```

> By checking the URL in this way, we're doing a form of "routing".
> Other forms of routing can be as simple as `switch` statements or as complex as
> whole frameworks like [`express`][]. If you're looking for something that does
> routing and nothing else, try [`router`][].

Great! Now let's take a stab at simplifying this. Remember, the `request` object
is a [`ReadableStream`][] and the `response` object is a [`WritableStream`][].
That means we can use [`pipe`][] to direct data from one to the other. That's
exactly what we want for an echo server!

```cjs
const http = require('node:http');

http
  .createServer((request, response) => {
    if (request.method === 'POST' && request.url === '/echo') {
      request.pipe(response);
    } else {
      response.statusCode = 404;
      response.end();
    }
  })
  .listen(8080);
```

```mjs
import http from 'node:http';

http
  .createServer((request, response) => {
    if (request.method === 'POST' && request.url === '/echo') {
      request.pipe(response);
    } else {
      response.statusCode = 404;
      response.end();
    }
  })
  .listen(8080);
```

Yay streams!

We're not quite done yet though. As mentioned multiple times in this guide,
errors can and do happen, and we need to deal with them.

To handle errors on the request stream, we'll log the error to `stderr` and send
a 400 status code to indicate a `Bad Request`. In a real-world application,
though, we'd want to inspect the error to figure out what the correct status code
and message would be. As usual with errors, you should consult the
[`Error` documentation][].

On the response, we'll just log the error to `stderr`.

```cjs
const http = require('node:http');

http
  .createServer((request, response) => {
    request.on('error', err => {
      console.error(err);
      response.statusCode = 400;
      response.end();
    });
    response.on('error', err => {
      console.error(err);
    });
    if (request.method === 'POST' && request.url === '/echo') {
      request.pipe(response);
    } else {
      response.statusCode = 404;
      response.end();
    }
  })
  .listen(8080);
```

```mjs
import http from 'node:http';

http
  .createServer((request, response) => {
    request.on('error', err => {
      console.error(err);
      response.statusCode = 400;
      response.end();
    });
    response.on('error', err => {
      console.error(err);
    });
    if (request.method === 'POST' && request.url === '/echo') {
      request.pipe(response);
    } else {
      response.statusCode = 404;
      response.end();
    }
  })
  .listen(8080);
```

We've now covered most of the basics of handling HTTP requests. At this point,
you should be able to:

- Instantiate an HTTP server with a request handler function, and have it listen
  on a port.
- Get headers, URL, method and body data from `request` objects.
- Make routing decisions based on URL and/or other data in `request` objects.
- Send headers, HTTP status codes and body data via `response` objects.
- Pipe data from `request` objects and to `response` objects.
- Handle stream errors in both the `request` and `response` streams.

From these basics, Node.js HTTP servers for many typical use cases can be
constructed. There are plenty of other things these APIs provide, so be sure to
read through the API docs for [`EventEmitters`][], [`Streams`][], and [`HTTP`][].

[`EventEmitters`]: https://nodejs.org/api/events.html
[`Streams`]: https://nodejs.org/api/stream.html
[`createServer`]: https://nodejs.org/api/http.html#http_http_createserver_requestlistener
[`Server`]: https://nodejs.org/api/http.html#http_class_http_server
[`listen`]: https://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback
[API reference]: https://nodejs.org/api/http.html
[`IncomingMessage`]: https://nodejs.org/api/http.html#http_class_http_incomingmessage
[`ReadableStream`]: https://nodejs.org/api/stream.html#stream_class_stream_readable
[`rawHeaders`]: https://nodejs.org/api/http.html#http_message_rawheaders
[`Buffer`]: https://nodejs.org/api/buffer.html
[`concat-stream`]: https://www.npmjs.com/package/concat-stream
[`body`]: https://www.npmjs.com/package/body
[`npm`]: https://www.npmjs.com
[`EventEmitter`]: https://nodejs.org/api/events.html#events_class_eventemitter
[handling these errors]: https://nodejs.org/api/errors.html
[`ServerResponse`]: https://nodejs.org/api/http.html#http_class_http_serverresponse
[`setHeader`]: https://nodejs.org/api/http.html#http_response_setheader_name_value
[`WritableStream`]: https://nodejs.org/api/stream.html#stream_class_stream_writable
[`writeHead`]: https://nodejs.org/api/http.html#http_response_writehead_statuscode_statusmessage_headers
[`express`]: https://www.npmjs.com/package/express
[`router`]: https://www.npmjs.com/package/router
[`pipe`]: https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options
[`Error` documentation]: https://nodejs.org/api/errors.html
[`HTTP`]: https://nodejs.org/api/http.html

## REST security

> **Source:** [REST security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

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

In Java EE in particular, this can be difficult to implement properly. See [Bypassing Web Authentication and Authorization with HTTP Verb Tampering](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet_Bypassing_VBAAC_with_HTTP_Verb_Tampering.pdf) for an explanation of this common misconfiguration.

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

### References

- [RFC 8725: JSON Web Token Best Current Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.4)
