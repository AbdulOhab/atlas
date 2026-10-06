---
title: "Node.js Security"
order: 10
summary: "Security practices for Node.js backends: injection, rate limiting, secrets, dependencies, headers and safe error output."
category: "Auth & Security"
level: Intermediate
---

# Node.js Security

Most backend breaches come from a short list of mistakes. These are the practices that close them in a Node.js service.

**Course outline modules:** 27 (Advanced Topics in API Development), 28 (Advanced Topics)

## Node.js security cheat sheet

> **Source:** [Node.js security cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

This cheat sheet lists actions developers can take to develop secure Node.js applications. Each item has a brief explanation and solution that is specific to the Node.js environment.

### Context

Node.js applications are increasing in number and they are no different from other frameworks and programming languages. Node.js applications are prone to all kinds of web application vulnerabilities.

### Objective

This cheat sheet aims to provide a list of best practices to follow during development of Node.js applications.

### Recommendations

There are several recommendations to enhance security of your Node.js applications. These are categorized as:

- **Application Security**
- **Error & Exception Handling**
- **Server Security**
- **Platform Security**

#### Application Security

##### Use flat Promise chains

Asynchronous callback functions are one of the strongest features of Node.js. However, increasing layers of nesting within callback functions can become a problem. Any multistage process can become nested 10 or more levels deep. This problem is referred to as a "Pyramid of Doom" or "Callback Hell". In such code, the errors and results get lost within the callback. Promises are a good way to write asynchronous code without getting into nested pyramids. Promises provide top-down execution while being asynchronous by delivering errors and results to next `.then` function.

Another advantage of Promises is the way Promises handle errors. If an error occurs in a Promise class, it skips over the `.then` functions and invokes the first `.catch` function it finds. This way Promises provide a higher assurance of capturing and handling errors. As a principle, you can make all your asynchronous code (apart from emitters) return promises. It should be noted that Promise calls can also become a pyramid. In order to completely stay away from "Callback Hell", flat Promise chains should be used. If the module you are using does not support Promises, you can convert base object to a Promise by using `Promise.promisifyAll()` function.

The following code snippet is an example of "Callback Hell":

```JavaScript
function func1(name, callback) {
  // operations that takes a bit of time and then calls the callback
}
function func2(name, callback) {
  // operations that takes a bit of time and then calls the callback
}
function func3(name, callback) {
  // operations that takes a bit of time and then calls the callback
}
function func4(name, callback) {
  // operations that takes a bit of time and then calls the callback
}

func1("input1", function(err, result1){
   if(err){
      // error operations
   }
   else {
      //some operations
      func2("input2", function(err, result2){
         if(err){
            //error operations
         }
         else{
            //some operations
            func3("input3", function(err, result3){
               if(err){
                  //error operations
               }
               else{
                  // some operations
                  func4("input 4", function(err, result4){
                     if(err){
                        // error operations
                     }
                     else {
                        // some operations
                     }
                  });
               }
            });
         }
      });
   }
});
```

The above code can be securely written as follows using a flat Promise chain:

```JavaScript
function func1(name) {
  // operations that takes a bit of time and then resolves the promise
}
function func2(name) {
  // operations that takes a bit of time and then resolves the promise
}
function func3(name) {
  // operations that takes a bit of time and then resolves the promise
}
function func4(name) {
  // operations that takes a bit of time and then resolves the promise
}

func1("input1")
   .then(function (result){
      return func2("input2");
   })
   .then(function (result){
      return func3("input3");
   })
   .then(function (result){
      return func4("input4");
   })
   .catch(function (error) {
      // error operations
   });
```

And using async/await:

```JavaScript
async function func1(name) {
  // operations that takes a bit of time and then resolves the promise
}
async function func2(name) {
  // operations that takes a bit of time and then resolves the promise
}
async function func3(name) {
  // operations that takes a bit of time and then resolves the promise
}
async function func4(name) {
  // operations that takes a bit of time and then resolves the promise
}

(async() => {
  try {
    let res1 = await func1("input1");
    let res2 = await func2("input2");
    let res3 = await func3("input2");
    let res4 = await func4("input2");
  } catch(err) {
    // error operations
  }
})();
```

##### Set request size limits

Buffering and parsing of request bodies can be a resource intensive task. If there is no limit on the size of requests, attackers can send requests with large request bodies that can exhaust server memory and/or fill disk space. You can limit the request body size for all requests using [raw-body](https://www.npmjs.com/package/raw-body).

```JavaScript
const contentType = require('content-type')
const express = require('express')
const getRawBody = require('raw-body')

const app = express()

app.use(function (req, res, next) {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    next()
    return
  }

  getRawBody(req, {
    length: req.headers['content-length'],
    limit: '1kb',
    encoding: contentType.parse(req).parameters.charset
  }, function (err, string) {
    if (err) return next(err)
    req.text = string
    next()
  })
})
```

However, fixing a request size limit for all requests may not be the correct behavior, since some requests may have a large payload in the request body, such as when uploading a file. Also, input with a JSON type is more dangerous than a multipart input, since parsing JSON is a blocking operation. Therefore, you should set request size limits for different content types. You can accomplish this very easily with express middleware as follows:

```JavaScript
app.use(express.urlencoded({ extended: true, limit: "1kb" }));
app.use(express.json({ limit: "1kb" }));
```

It should be noted that attackers can change the `Content-Type` header of the request and bypass request size limits. Therefore, before processing the request, data contained in the request should be validated against the content type stated in the request headers. If content type validation for each request affects the performance severely, you can only validate specific content types or request larger than a predetermined size.

##### Do not block the event loop

Node.js is very different from common application platforms that use threads. Node.js has a single-thread event-driven architecture. By means of this architecture, throughput becomes high and the programming model becomes simpler. Node.js is implemented around a non-blocking I/O event loop. With this event loop, there is no waiting on I/O or context switching. The event loop looks for events and dispatches them to handler functions. Because of this, when CPU intensive JavaScript operations are executed, the event loop waits for them to finish. This is why such operations are called "blocking". To overcome this problem, Node.js allows assigning callbacks to IO-blocked events. This way, the main application is not blocked and callbacks run asynchronously. Therefore, as a general principle, all blocking operations should be done asynchronously so that the event loop is not blocked.

Even if you perform blocking operations asynchronously, your application may still not serve as expected. This happens if there is a code outside the callback that relies on the code within the callback to run first. For example, consider the following code:

```JavaScript
const fs = require('fs');
fs.readFile('/file.txt', (err, data) => {
  // perform actions on file content
});
fs.unlinkSync('/file.txt');
```

In the above example, `unlinkSync` function may run before the callback, which will delete the file before the desired actions on the file content is done. Such race conditions can also affect the security of your application. An example would be a scenario where authentication is performed in a callback and authenticated actions are run synchronously. In order to eliminate such race conditions, you can write all operations that rely on each other in a single non-blocking function. By doing so, you can guarantee that all operations are executed in the correct order. For example, above code example can be written in a non-blocking way as follows:

```JavaScript
const fs = require('fs');
fs.readFile('/file.txt', (err, data) => {
  // perform actions on file content
  fs.unlink('/file.txt', (err) => {
    if (err) throw err;
  });
});
```

In the above code, call to unlink the file and other file operations are within the same callback. This provides the correct order of operations.

##### Perform input validation

Input validation is a crucial part of application security. Input validation failures can result in many types of application attacks. These include SQL Injection, Cross-Site Scripting, Command Injection, Local/Remote File Inclusion, Denial of Service, Directory Traversal, LDAP Injection and many other injection attacks. In order to avoid these attacks, input to your application should be sanitized first. The best input validation technique is to use a list of accepted inputs. However, if this is not possible, input should be first checked against expected input scheme and dangerous inputs should be escaped. In order to ease input validation in Node.js applications, there are some modules like [validator](https://www.npmjs.com/package/validator) and [express-mongo-sanitize](https://www.npmjs.com/package/express-mongo-sanitize).
For detailed information on input validation, please refer to [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

JavaScript is a dynamic language and depending on how the framework parses a URL, the data seen by the application code can take many forms. Here are some examples after parsing a query string in express.js:

| URL | Content of request.query.foo in code |
| --- | --- |
| `?foo=bar` | `'bar'` (string) |
| `?foo=bar&foo=baz` | `['bar', 'baz']` (array of string) |
| `?foo[]=bar` | `['bar']` (array of string) |
| `?foo[]=bar&foo[]=baz` | `['bar', 'baz']` (array of string) |
| `?foo[bar]=baz` | `{ bar : 'baz' }` (object with a key) |
| `?foo[]baz=bar` | `['bar']` (array of string - postfix is lost) |
| `?foo[][baz]=bar` | `[ { baz: 'bar' } ]` (array of object) |
| `?foo[bar][baz]=bar` | `{ foo: { bar: { baz: 'bar' } } }` (object tree) |
| `?foo[10]=bar&foo[9]=baz` | `[ 'baz', 'bar' ]` (array of string - notice order) |
| `?foo[toString]=bar` | `{}` (object where calling `toString()` will fail) |

##### Perform output escaping

Use output encoding that matches the destination context to prevent cross-site scripting (XSS). [escape-html](https://github.com/component/escape-html#escapehtmlstring) supports ordinary HTML text and quoted ordinary-text attribute values; it does not safely encode JavaScript, CSS, or URL contexts. Follow the [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#output-encoding) for context-specific controls. When you need to render user-supplied HTML (rather than escape it), use a maintained sanitizer such as [DOMPurify](https://github.com/cure53/DOMPurify) (with `jsdom` for server-side use) or [`sanitize-html`](https://www.npmjs.com/package/sanitize-html). Avoid `node-esapi`, which is no longer actively maintained.

##### Perform application activity logging

Logging application activity is an encouraged good practice. It makes it easier to debug any errors encountered during application runtime. It is also useful for security concerns, since it can be used during incident response. In addition, these logs can be used to feed Intrusion Detection/Prevention Systems (IDS/IPS). In Node.js, there are modules such as [Winston](https://www.npmjs.com/package/winston), [Bunyan](https://www.npmjs.com/package/bunyan), or [Pino](https://www.npmjs.com/package/pino) to perform application activity logging. These modules enable streaming and querying logs, and they provide a way to handle uncaught exceptions.

With the following code, you can log application activities in both console and a desired log file:

```JavaScript
const logger = new (Winston.Logger) ({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'application.log' })
    ],
    level: 'verbose'
});
```

You can provide different transports so that you can save errors to a separate log file and general application logs to a different log file. Additional information on security logging can be found in [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

##### Monitor the event loop

When your application server is under heavy network traffic, it may not be able to serve its users. This is essentially a type of [Denial of Service (DoS)](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html) attack. The [toobusy-js](https://www.npmjs.com/package/toobusy-js) module allows you to monitor the event loop. It keeps track of the response time, and when it goes beyond a certain threshold, this module can indicate your server is too busy. In that case, you can stop processing incoming requests and send them `503 Server Too Busy` message so that your application stay responsive. Example use of the [toobusy-js](https://www.npmjs.com/package/toobusy-js) module is shown here:

```JavaScript
const toobusy = require('toobusy-js');
const express = require('express');
const app = express();
app.use(function(req, res, next) {
    if (toobusy()) {
        // log if you see necessary
        res.status(503).send("Server Too Busy");
    } else {
    next();
    }
});
```

##### Take precautions against brute-forcing

[Brute-forcing](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#protect-against-automated-attacks
) is a common threat to all web applications. Attackers can use brute-forcing as a password guessing attack to obtain account passwords. Therefore, application developers should take precautions against brute-force attacks especially in login pages.  Node.js has several modules available for this purpose. [Express-bouncer](https://libraries.io/npm/express-bouncer), [express-brute](https://libraries.io/npm/express-brute) and [rate-limiter](https://libraries.io/npm/rate-limiter) are just some examples. Based on your needs and requirements, you should choose one or more of these modules and use accordingly. [Express-bouncer](https://libraries.io/npm/express-bouncer) and [express-brute](https://libraries.io/npm/express-brute) modules work similarly. They increase the delay for each failed request and can be arranged for a specific route. These modules can be used as follows:

```JavaScript
const bouncer = require('express-bouncer');
bouncer.whitelist.push('127.0.0.1'); // allow an IP address
// give a custom error message
bouncer.blocked = function (req, res, next, remaining) {
    res.status(429).send("Too many requests have been made. Please wait " + remaining/1000 + " seconds.");
};
// route to protect
app.post("/login", bouncer.block, function(req, res) {
    if (LoginFailed){  }
    else {
        bouncer.reset( req );
    }
});
```

```JavaScript
const ExpressBrute = require('express-brute');

const store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
const bruteforce = new ExpressBrute(store);

app.post('/auth',
    bruteforce.prevent, // error 429 if we hit this route too often
    function (req, res, next) {
        res.send('Success!');
    }
);
```

Apart from [express-bouncer](https://libraries.io/npm/express-bouncer) and [express-brute](https://libraries.io/npm/express-brute), the [rate-limiter](https://libraries.io/npm/rate-limiter) module can also help to prevent brute-forcing attacks. It enables specifying how many requests a specific IP address can make during a specified time period.

```JavaScript
const limiter = new RateLimiter();
limiter.addLimit('/login', 'GET', 5, 500); // login page can be requested 5 times at max within 500 seconds
```

[CAPTCHA usage](https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html#captcha) is also another common mechanism used against brute-forcing. There are modules developed for Node.js CAPTCHAs. A common module used in Node.js applications is [svg-captcha](https://www.npmjs.com/package/svg-captcha). It can be used as follows:

```JavaScript
const svgCaptcha = require('svg-captcha');
app.get('/captcha', function (req, res) {
    const captcha = svgCaptcha.create();
    req.session.captcha = captcha.text;
    res.type('svg');
    res.status(200).send(captcha.data);
});
```

[Account lockout](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#account-lockout) is a recommended solution to keep attackers away from your valid users. Account lockout is possible with many modules like [mongoose](https://www.npmjs.com/package/mongoose). You can refer to [this blog post](http://devsmash.com/blog/implementing-max-login-attempts-with-mongoose) to see how account lockout is implemented in mongoose.

##### Use Anti-CSRF tokens

[Cross-Site Request Forgery (CSRF)](https://owasp.org/www-community/attacks/csrf) aims to perform authorized actions on behalf of an authenticated user, while the user is unaware of this action. CSRF attacks are generally performed for state-changing requests like changing a password, adding users or placing orders. [Csurf](https://www.npmjs.com/package/csurf) is an express middleware that has been used to mitigate CSRF attacks. But a security hole in this package has been recently discovered. The team behind the package has not fixed the discovered vulnerability and they have marked the package as deprecated, recommending using any other CSRF protection package.

For detailed information on cross-site request forgery (CSRF) attacks and prevention methods, you can refer to [Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

##### Remove unnecessary routes

A web application should not contain any page that is not used by users, as it may increase the attack surface of the application. Therefore, all unused API routes should be disabled in Node.js applications. This occurs especially in frameworks like [Sails](https://sailsjs.com) and [Feathers](https://feathersjs.com), as they automatically generate REST API endpoints. For example, in [Sails](https://sailsjs.com), if a URL does not match a custom route, it may match one of the automatic routes and still generate a response. This situation may lead to results ranging from information leakage to arbitrary command execution. Therefore, before using such frameworks and modules, it is important to know the routes they automatically generate and remove or disable these routes.

##### Prevent HTTP Parameter Pollution

[HTTP Parameter Pollution(HPP)](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/07-Input_Validation_Testing/04-Testing_for_HTTP_Parameter_Pollution.html) is an attack in which attackers send multiple HTTP parameters with the same name and this causes your application to interpret them unpredictably. When multiple parameter values are sent, Express populates them in an array. In order to solve this issue, you can use [hpp](https://www.npmjs.com/package/hpp) module. When used, this module will ignore all values submitted for a parameter in `req.query` and/or `req.body` and just select the last parameter value submitted. You can use it as follows:

```JavaScript
const hpp = require('hpp');
app.use(hpp());
```

##### Only return what is necessary

Information about the users of an application is among the most critical information about the application. User tables generally include fields like ID, username, full name, email address, birth date, password and in some cases social security numbers. Therefore, when querying and using user objects, you need to return only needed fields as it may be vulnerable to personal information disclosure. This is also correct for other objects stored on the database. If you just need a certain field of an object, you should only return the specific fields required. As an example, you can use a function like the following whenever you need to get information on a user. By doing so, you can only return the fields that are needed for your specific operation. In other words, if you only need to list names of the users available, you are not returning their email addresses or credit card numbers in addition to their full names.

```JavaScript
exports.sanitizeUser = function(user) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName
  };
};
```

##### Use object property descriptors

Object properties include three hidden attributes: `writable` (if false, property value cannot be changed), `enumerable` (if false, property cannot be used in for loops) and `configurable` (if false, property cannot be deleted). When defining an object property through assignment, these three hidden attributes are set to true by default. These properties can be set as follows:

```JavaScript
const o = {};
Object.defineProperty(o, "a", {
    writable: true,
    enumerable: true,
    configurable: true,
    value: "A"
});
```

Apart from these, there are some special functions for object attributes. `Object.preventExtensions()` prevents new properties from being added to the object.

##### Use access control lists

Authorization prevents users from acting outside of their intended permissions. In order to do so, users and their roles should be determined with consideration of the principle of least privilege. Each user role should only have access to the resources they must use. For your Node.js applications, you can use the [acl](https://www.npmjs.com/package/acl) module to provide ACL (access control list) implementation. With this module, you can create roles and assign users to these roles.

#### Permissions

Starting with Node.js v20, a Permission Model is available to restrict application privileges. As of Node.js v23.5.0, the model is considered stable and can be enabled using the `--permission` flag (earlier versions require `--experimental-permission`).

##### Usage

```bash
node --permission [--allow-<type>=...] app.js
```

##### Examples

Use only `--permission` to restrict all permissions by default:

```bash
node --permission index.js
```

Use `--allow‑fs‑read` to specify which files or directories Node.js is allowed to read. This is especially useful to prevent Local File Inclusion (LFI) vulnerabilities:

```bash
node --permission --allow-fs-read=/uploads/ index.js
```

Use `--allow-fs-write` to specify where Node.js is allowed to write files:

```bash
node --permission --allow-fs-write=/uploads/ index.js
```

Unauthorized access triggers a runtime error:

```text
Error: Access to this API has been restricted
code: 'ERR_ACCESS_DENIED'
permission: 'FileSystemRead'
resource: '/path/to/file'
```

Other flags:

- `--allow-child-process` — allows using `child_process` APIs
- `--allow-worker` — allows usage of `worker_threads` APIs
- `--allow-addons` — enables loading native addons
- `--allow-wasi` — enables usage of WASI modules

**Important note:** Symbolic links are followed even if they point outside the allowed paths. This means that relative symlinks can bypass restrictions and grant unintended access. To stay secure make sure no allowed paths include relative symbolic links when using the permission model.

For more details refer to the [official documentation](https://nodejs.org/api/permissions.html).

#### Error & Exception Handling

##### Handle uncaughtException

Node.js behavior for uncaught exceptions is to print current stack trace and then terminate the thread. However, Node.js allows customization of this behavior. It provides a global object named process that is available to all Node.js applications. It is an EventEmitter object and in case of an uncaught exception, uncaughtException event is emitted and it is brought up to the main event loop. In order to provide a custom behavior for uncaught exceptions, you can bind to this event. However, resuming the application after such an uncaught exception can lead to further problems. Therefore, if you do not want to miss any uncaught exception, you should bind to uncaughtException event and cleanup any allocated resources like file descriptors, handles and similar before shutting down the process. Resuming the application is strongly discouraged as the application will be in an unknown state. It is important to note that when displaying error messages to the user in case of an uncaught exception, detailed information like stack traces should not be revealed to the user. Instead, custom error messages should be shown to the users in order not to cause any information leakage.

```JavaScript
process.on("uncaughtException", function(err) {
    // clean up allocated resources
    // log necessary error details to log files
    process.exit(); // exit the process to avoid unknown state
});
```

##### Listen to errors when using EventEmitter

When using EventEmitter, errors can occur anywhere in the event chain. Normally, if an error occurs in an EventEmitter object, an error event that has an Error object as an argument is called. However, if there are no attached listeners to that error event, the Error object that is sent as an argument is thrown and becomes an uncaught exception. In short, if you do not handle errors within an EventEmitter object properly, these unhandled errors may crash your application. Therefore, you should always listen to error events when using EventEmitter objects.

```JavaScript
const events = require('events');
const myEventEmitter = function(){
    events.EventEmitter.call(this);
}
require('util').inherits(myEventEmitter, events.EventEmitter);
myEventEmitter.prototype.someFunction = function(param1, param2) {
    //in case of an error
    this.emit('error', err);
}
const emitter = new myEventEmitter();
emitter.on('error', function(err){
    //Perform necessary error handling here
});
```

##### Handle errors in asynchronous calls

Errors that occur within asynchronous callbacks are easy to miss. Therefore, as a general principle first argument to the asynchronous calls should be an Error object. Also, express routes handle errors itself, but it should be always remembered that errors occurred in asynchronous calls made within express routes are not handled, unless an Error object is sent as a first argument.

Errors in these callbacks can be propagated as many times as possible. Each callback that the error has been propagated to can ignore, handle or propagate the error.

#### Server Security

##### Set cookie flags appropriately

Generally, session information is sent using cookies in web applications. However, improper use of HTTP cookies can render an application to several session management vulnerabilities. Some flags can be set for each cookie to prevent these kinds of attacks. `httpOnly`, `Secure` and `SameSite` flags are very important for session cookies. `httpOnly` flag prevents the cookie from being accessed by client-side JavaScript. This is an effective counter-measure for XSS attacks. `Secure` flag lets the cookie to be sent only if the communication is over HTTPS. `SameSite` flag can prevent cookies from being sent in cross-site requests that helps protect against Cross-Site Request Forgery (CSRF) attacks. Apart from these, there are other flags like domain, path and expires. Setting these flags appropriately is encouraged, but they are mostly related to cookie scope not the cookie security. Sample usage of these flags is given in the following example:

```JavaScript
const session = require('express-session');
app.use(session({
    secret: 'your-secret-key',
    name: 'cookieName',
    cookie: { secure: true, httpOnly: true, path: '/user', sameSite: true}
}));
```

##### Use appropriate security headers

There are several [HTTP security headers](https://owasp.org/www-project-secure-headers/) that can help you prevent some common attack vectors.
The [helmet](https://www.npmjs.com/package/helmet) package can help to set those headers:

```Javascript
const express = require("express");
const helmet = require("helmet");

const app = express();

app.use(helmet()); // Add various HTTP headers
```

The top-level `helmet` function is a wrapper around 14 smaller middlewares.
Below is a list of HTTP security headers covered by `helmet` middlewares:

- **[Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)**: [HTTP Strict Transport Security (HSTS)](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html) dictates browsers that the application can only be accessed via HTTPS connections. In order to use it in your application, add the following codes:

```JavaScript
app.use(helmet.hsts()); // default configuration
app.use(
  helmet.hsts({
    maxAge: 123456,
    includeSubDomains: false,
  })
); // custom configuration
```

- **[X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options):** determines if a page can be loaded via a `<frame>` or an `<iframe>` element. Allowing the page to be framed may result in [Clickjacking](https://owasp.org/www-community/attacks/Clickjacking) attacks.

```JavaScript
app.use(helmet.frameguard()); // default behavior (SAMEORIGIN)
```

- **[X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection):** stops pages from loading when they detect reflected cross-site scripting (XSS) attacks. This header has been deprecated by modern browsers and its use can introduce additional security issues on the client side. As such, it is recommended to set the header as **X-XSS-Protection: 0** in order to disable the XSS Auditor, and not allow it to take the default behavior of the browser handling the response.

```JavaScript
app.use(helmet.xssFilter()); // sets "X-XSS-Protection: 0"
```

For moderns browsers, it is recommended to implement a strong **Content-Security-Policy** policy, as detailed in the next section.

- **[Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy):** Content Security Policy is developed to reduce the risk of attacks like [Cross-Site Scripting (XSS)](https://owasp.org/www-community/attacks/xss/) and [Clickjacking](https://owasp.org/www-community/attacks/Clickjacking). It allows content from a list that you decide. It has several directives each of which prohibits loading specific type of a content. You can refer to [Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html) for detailed explanation of each directive and how to use it. You can implement these settings in your application as follows:

```JavaScript
app.use(
  helmet.contentSecurityPolicy({
    // the following directives will be merged into the default helmet CSP policy
    directives: {
      defaultSrc: ["'self'"],  // default value for all directives that are absent
      scriptSrc: ["'self'"],   // helps prevent XSS attacks
      frameAncestors: ["'none'"],  // helps prevent Clickjacking attacks
      imgSrc: ["'self'", "'http://imgexample.com'"],
      styleSrc: ["'none'"]
    }
  })
);
```

As this middleware performs very little validation, it is recommended to rely on CSP checkers like [CSP Evaluator](https://csp-evaluator.withgoogle.com/) instead.

- **[X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options):** Even if the server sets a valid `Content-Type` header in the response, browsers may try to sniff the MIME type of the requested resource. This header is a way to stop this behavior and tell the browser not to change MIME types specified in `Content-Type` header. It can be configured in the following way:

```JavaScript
app.use(helmet.noSniff());
```

- **[Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) and [Pragma](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Pragma):** Cache-Control header can be used to prevent browsers from caching the given responses. This should be done for pages that contain sensitive information about either the user or the application. However, disabling caching for pages that do not contain sensitive information may seriously affect the performance of the application. Therefore, caching should only be disabled for pages that return sensitive information. Appropriate caching controls and headers can be set easily using the [nocache](https://www.npmjs.com/package/nocache) package:

```JavaScript
const nocache = require("nocache");

app.use(nocache());
```

The above code sets Cache-Control, Surrogate-Control, Pragma and Expires headers accordingly.

- **X-Download-Options:** This header prevents Internet Explorer from executing downloaded files in the site's context. This is achieved with noopen directive. You can do so with the following piece of code:

```JavaScript
app.use(helmet.ieNoOpen());
```

- **X-Powered-By:** X-Powered-By header is used to inform what technology is used in the server side. This is an unnecessary header causing information leakage, so it should be removed from your application. To do so, you can use the `hidePoweredBy` as follows:

```JavaScript
app.use(helmet.hidePoweredBy());
```

Also, you can lie about the technologies used with this header. For example, even if your application does not use PHP, you can set X-Powered-By header to seem so.

```JavaScript
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
```

#### Platform Security

##### Keep your packages up-to-date

Security of your application depends directly on how secure the third-party packages you use in your application are. Therefore, it is important to keep your packages up-to-date. It should be noted that [Using Components with Known Vulnerabilities](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A9-Using_Components_with_Known_Vulnerabilities) is still in the OWASP Top 10. You can use [OWASP Dependency-Check](https://jeremylong.github.io/DependencyCheck/analyzers/nodejs.html) to see if any of the packages used in the project has a known vulnerability. Also, you can use [Retire.js](https://github.com/retirejs/retire.js/) to check JavaScript libraries with known vulnerabilities.

Starting with version 6, `npm` introduced `audit`, which will warn about vulnerable packages:

```bash
npm audit
```

`npm` also introduced a simple way to upgrade the affected packages:

```bash
npm audit fix
```

There are several other tools you can use to check your dependencies. A more comprehensive list can be found in [Vulnerable Dependency Management CS](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html#tools).

##### Do not use dangerous functions

There are some JavaScript functions that are dangerous and should only be used where necessary or unavoidable. The first example is the `eval()` function. This function takes a string argument and executes it as any other JavaScript source code. Combined with user input, this behavior inherently leads to remote code execution vulnerability. Similarly, calls to `child_process.exec` are also very dangerous. This function acts as a bash interpreter and sends its arguments to /bin/sh. By injecting input to this function, attackers can execute arbitrary commands on the server.

In addition to these functions, some modules require special care when being used. As an example, `fs` module handles filesystem operations. However, if improperly sanitized user input is fed into this module, your application may become vulnerable to file inclusion and directory traversal vulnerabilities. The [`node:vm` module](https://nodejs.org/api/vm.html) compiles and runs code in V8 contexts, but it is not a security mechanism. Do not use it to execute untrusted code.

It would not be fair to say that these functions and modules should not be used whatsoever, however, they should be used carefully especially when they use with user input. Also, there are [some other functions](https://github.com/wisec/domxsswiki/wiki/Direct-Execution-Sinks) that may render your application vulnerable.

##### Stay away from evil regexes

The Regular expression Denial of Service (ReDoS) is a Denial of Service attack, that exploits the fact that most Regular Expression implementations may reach extreme situations that cause them to work very slowly (exponentially related to input size). An attacker can then cause a program using a Regular Expression to enter these extreme situations and then hang for a very long time.

[The Regular Expression Denial of Service (ReDoS)](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS) is a type of Denial of Service attack that uses regular expressions. Some Regular Expression (Regex) implementations cause extreme situations that makes the application very slow. Attackers can use such regex implementations to cause application to get into these extreme situations and hang for a long time.  Such regexes are called evil if application can be stuck on crafted input.  Generally, these regexes are exploited by grouping with repetition and alternation with overlapping. For example, the following regular expression `^(([a-z])+.)+[A-Z](https://cheatsheetseries.owasp.org/cheatsheets/[a-z])+$` can be used to specify Java class names. However, a very long string (aaaa...aaaaAaaaaa...aaaa) can also match with this regular expression. There are some tools to check if a regex has a potential for causing denial of service. One example is [vuln-regex-detector](https://github.com/davisjam/vuln-regex-detector).

##### Run security linters

When developing code, keeping all security tips in mind can be really difficult. Also, keeping all team members obey these rules is nearly impossible. As JavaScript is a dynamic and loosely-typed language, linting tools are really essential in the software development life cycle. [ESLint](https://eslint.org/) and [JSHint](https://jshint.com/) are commonly used linters for JavaScript: they do not include security checks by default. They might catch some general problems which could actually be security issues. For this reason, enforcing strict linting rules is usually a good idea for security.

More importantly, some third-party rulesets can be used to flag dangerous patterns such as `eval()`, `child_process`:

- [eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security);
- [eslint-plugin-node-security](https://github.com/ofri-peretz/eslint/tree/main/packages/eslint-plugin-node-security)

The linting rules should be reviewed periodically and the findings should be audited. Another advantage of these tools is the feature that you can add custom rules for patterns that you may see dangerous.

Even with dedicated rulesets, linters are not a replacement for dedicated Static Analysis Security Testing (SAST) tools which typically include code flow tracking and can detect complex vulnerabilities.

##### Use strict mode

JavaScript has a number of unsafe and dangerous legacy features that should not be used. In order to remove these features, ES5 included a strict mode for developers. With this mode, errors that were silent previously are thrown. It also helps JavaScript engines perform optimizations. With strict mode, previously accepted bad syntax causes real errors. Because of these improvements, you should always use strict mode in your application. In order to enable strict mode, you just need to write `"use strict";` on top of your code.

The following code will generate a `ReferenceError: Can't find variable: y` on the console, which will not be displayed unless strict mode is used:

```JavaScript
"use strict";

func();
function func() {
  y = 3.14;   // This will cause an error (y is not defined)
}
```

##### Adhere to general application security principles

This list mainly focuses on issues that are common in Node.js applications, with recommendations and examples. In addition to these, there are general [security by design principles](https://wiki.owasp.org/index.php/Security_by_Design_Principles) that apply to web applications regardless of technologies used in application server. You should also keep those principles in mind while developing your applications. You can always refer to [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) to learn more about web application vulnerabilities and mitigation techniques used against them.

### References

- [Node.js Security Best Practices](https://nodejs.org/learn/getting-started/security-best-practices)
- [Node.js Permissions](https://nodejs.org/api/permissions.html)
- [Express: Production Security Best Practices](https://expressjs.com/en/advanced/best-practice-security/)

## Security best practices

> **Source:** [Security best practices](https://github.com/goldbergyoni/nodebestpractices#readme) · [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices), CC BY-SA 4.0

<div align="center">
<img src="https://img.shields.io/badge/OWASP%20Threats-Top%2010-green.svg" alt="54 items"/>
</div>

### 6.1. Embrace linter security rules

<a href="https://www.owasp.org/index.php/Top_10-2017_A1-Injection" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A1:Injection%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A7-Cross-Site_Scripting_(XSS)" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20XSS%20-green.svg" alt=""/></a>

**TL;DR:** Make use of security-related linter plugins such as [eslint-plugin-security](https://github.com/nodesecurity/eslint-plugin-security) to catch security vulnerabilities and issues as early as possible, preferably while they're being coded. This can help catching security weaknesses like using eval, invoking a child process or importing a module with a string literal (e.g. user input). Click 'Read more' below to see code examples that will get caught by a security linter

**Otherwise:** What could have been a straightforward security weakness during development becomes a major issue in production. Also, the project may not follow consistent code security practices, leading to vulnerabilities being introduced, or sensitive secrets committed into remote repositories

🔗 [**Read More: Lint rules**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/lintrules.md)

### 6.2. Limit concurrent requests using a middleware

<a href="https://www.owasp.org/index.php/Denial_of_Service" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20DDOS%20-green.svg" alt=""/></a>

**TL;DR:** DOS attacks are very popular and relatively easy to conduct. Implement rate limiting using an external service such as cloud load balancers, cloud firewalls, nginx, [rate-limiter-flexible](https://www.npmjs.com/package/rate-limiter-flexible) package, or (for smaller and less critical apps) a rate-limiting middleware (e.g. [express-rate-limit](https://www.npmjs.com/package/express-rate-limit))

**Otherwise:** An application could be subject to an attack resulting in a denial of service where real users receive a degraded or unavailable service.

🔗 [**Read More: Implement rate limiting**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/limitrequests.md)

### 6.3 Extract secrets from config files or use packages to encrypt them

<a href="https://www.owasp.org/index.php/Top_10-2017_A6-Security_Misconfiguration" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A6:Security%20Misconfiguration%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A3-Sensitive_Data_Exposure" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A3:Sensitive%20Data%20Exposure%20-green.svg" alt=""/></a>

**TL;DR:** Never store plain-text secrets in configuration files or source code. Instead, make use of secret-management systems like Vault products, Kubernetes/Docker Secrets, or using environment variables. As a last resort, secrets stored in source control must be encrypted and managed (rolling keys, expiring, auditing, etc). Make use of pre-commit/push hooks to prevent committing secrets accidentally

**Otherwise:** Source control, even for private repositories, can mistakenly be made public, at which point all secrets are exposed. Access to source control for an external party will inadvertently provide access to related systems (databases, apis, services, etc).

🔗 [**Read More: Secret management**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/secretmanagement.md)

### 6.4. Prevent query injection vulnerabilities with ORM/ODM libraries

<a href="https://www.owasp.org/index.php/Top_10-2017_A1-Injection" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A1:Injection%20-green.svg" alt=""/></a>

**TL;DR:** To prevent SQL/NoSQL injection and other malicious attacks, always make use of an ORM/ODM or a database library that escapes data or supports named or indexed parameterized queries, and takes care of validating user input for expected types. Never just use JavaScript template strings or string concatenation to inject values into queries as this opens your application to a wide spectrum of vulnerabilities. All the reputable Node.js data access libraries (e.g. [Sequelize](https://github.com/sequelize/sequelize), [Knex](https://github.com/tgriesser/knex), [mongoose](https://github.com/Automattic/mongoose)) have built-in protection against injection attacks.

**Otherwise:** Unvalidated or unsanitized user input could lead to operator injection when working with MongoDB for NoSQL, and not using a proper sanitization system or ORM will easily allow SQL injection attacks, creating a giant vulnerability.

🔗 [**Read More: Query injection prevention using ORM/ODM libraries**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/ormodmusage.md)

### 6.5. Collection of generic security best practices

**TL;DR:** This is a collection of security advice that is not related directly to Node.js - the Node implementation is not much different than any other language. Click read more to skim through.

🔗 [**Read More: Common security best practices**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/commonsecuritybestpractices.md)

### 6.6. Adjust the HTTP response headers for enhanced security

<a href="https://www.owasp.org/index.php/Top_10-2017_A6-Security_Misconfiguration" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A6:Security%20Misconfiguration%20-green.svg" alt=""/></a>

**TL;DR:** Your application should be using secure headers to prevent attackers from using common attacks like cross-site scripting (XSS), clickjacking and other malicious attacks. These can be configured easily using modules like [helmet](https://www.npmjs.com/package/helmet).

**Otherwise:** Attackers could perform direct attacks on your application's users, leading to huge security vulnerabilities

🔗 [**Read More: Using secure headers in your application**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/secureheaders.md)

### 6.7. Constantly and automatically inspect for vulnerable dependencies

<a href="https://www.owasp.org/index.php/Top_10-2017_A9-Using_Components_with_Known_Vulnerabilities" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A9:Known%20Vulnerabilities%20-green.svg" alt=""/></a>

**TL;DR:** With the npm ecosystem it is common to have many dependencies for a project. Dependencies should always be kept in check as new vulnerabilities are found. Use tools like [npm audit](https://docs.npmjs.com/cli/audit) or [snyk](https://snyk.io/) to track, monitor and patch vulnerable dependencies. Integrate these tools with your CI setup so you catch a vulnerable dependency before it makes it to production.

**Otherwise:** An attacker could detect your web framework and attack all its known vulnerabilities.

🔗 [**Read More: Dependency security**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/dependencysecurity.md)

### 6.8. Protect Users' Passwords/Secrets using bcrypt or scrypt

<a href="https://www.owasp.org/index.php/Top_10-2017_A2-Broken_Authentication" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A9:Broken%20Authentication%20-green.svg" alt=""/></a>

**TL;DR:** Passwords or secrets (e.g. API keys) should be stored using a secure hash + salt function like `bcrypt`,`scrypt`, or worst case `pbkdf2`.

**Otherwise:** Passwords and secrets that are stored without using a secure function are vulnerable to brute forcing and dictionary attacks that will lead to their disclosure eventually.

🔗 [**Read More: User Passwords**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/userpasswords.md)

### 6.9. Escape HTML, JS and CSS output

<a href="https://www.owasp.org/index.php/Top_10-2017_A7-Cross-Site_Scripting_(XSS)" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A7:XSS%20-green.svg" alt=""/></a>

**TL;DR:** Untrusted data that is sent down to the browser might get executed instead of just being displayed, this is commonly referred as a cross-site-scripting (XSS) attack. Mitigate this by using dedicated libraries that explicitly mark the data as pure content that should never get executed (i.e. encoding, escaping)

**Otherwise:** An attacker might store malicious JavaScript code in your DB which will then be sent as-is to the poor clients

🔗 [**Read More: Escape output**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/escape-output.md)

### 6.10. Validate incoming JSON schemas

<a href="https://www.owasp.org/index.php/Top_10-2017_A7-Cross-Site_Scripting_(XSS)" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A7: XSS%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A8-Insecure_Deserialization" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A8:Insecured%20Deserialization%20-green.svg" alt=""/></a>

**TL;DR:** Validate the incoming requests' body payload and ensure it meets expectations, fail fast if it doesn't. To avoid tedious validation coding within each route you may use lightweight JSON-based validation schemas such as [jsonschema](https://www.npmjs.com/package/jsonschema) or [joi](https://www.npmjs.com/package/joi)

**Otherwise:** Your generosity and permissive approach greatly increases the attack surface and encourages the attacker to try out many inputs until they find some combination to crash the application

🔗 [**Read More: Validate incoming JSON schemas**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/validation.md)

### 6.11. Support blocklisting JWTs

<a href="https://www.owasp.org/index.php/Top_10-2017_A2-Broken_Authentication" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A9:Broken%20Authentication%20-green.svg" alt=""/></a>

**TL;DR:** When using JSON Web Tokens (for example, with [Passport.js](https://github.com/jaredhanson/passport)), by default there's no mechanism to revoke access from issued tokens. Once you discover some malicious user activity, there's no way to stop them from accessing the system as long as they hold a valid token. Mitigate this by implementing a blocklist of untrusted tokens that are validated on each request.

**Otherwise:** Expired, or misplaced tokens could be used maliciously by a third party to access an application and impersonate the owner of the token.

🔗 [**Read More: Blocklist JSON Web Tokens**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/expirejwt.md)

### 6.12. Prevent brute-force attacks against authorization

<a href="https://www.owasp.org/index.php/Top_10-2017_A2-Broken_Authentication" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A9:Broken%20Authentication%20-green.svg" alt=""/></a>

**TL;DR:** A simple and powerful technique is to limit authorization attempts using two metrics:

1. The first is number of consecutive failed attempts by the same user unique ID/name and IP address.
2. The second is number of failed attempts from an IP address over some long period of time. For example, block an IP address if it makes 100 failed attempts in one day.

**Otherwise:** An attacker can issue unlimited automated password attempts to gain access to privileged accounts on an application

🔗 [**Read More: Login rate limiting**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/login-rate-limit.md)

### 6.13. Run Node.js as non-root user

<a href="https://www.owasp.org/index.php/Top_10-2017_A5-Broken_Access_Control" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A5:Broken%20Access%20Access%20Control-green.svg" alt=""/></a>

**TL;DR:** There is a common scenario where Node.js runs as a root user with unlimited permissions. For example, this is the default behaviour in Docker containers. It's recommended to create a non-root user and either bake it into the Docker image (examples given below) or run the process on this user's behalf by invoking the container with the flag "-u username"

**Otherwise:** An attacker who manages to run a script on the server gets unlimited power over the local machine (e.g. change iptable and re-route traffic to their server)

🔗 [**Read More: Run Node.js as non-root user**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/non-root-user.md)

### 6.14. Limit payload size using a reverse-proxy or a middleware

<a href="https://www.owasp.org/index.php/Top_10-2017_A8-Insecure_Deserialization" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A8:Insecured%20Deserialization%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A1-Injection" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20DDOS%20-green.svg" alt=""/></a>

**TL;DR:** The bigger the body payload is, the harder your single thread works in processing it. This is an opportunity for attackers to bring servers to their knees without tremendous amount of requests (DOS/DDOS attacks). Mitigate this limiting the body size of incoming requests on the edge (e.g. firewall, ELB) or by configuring [express body parser](https://github.com/expressjs/body-parser) to accept only small-size payloads

**Otherwise:** Your application will have to deal with large requests, unable to process the other important work it has to accomplish, leading to performance implications and vulnerability towards DOS attacks

🔗 [**Read More: Limit payload size**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/requestpayloadsizelimit.md)

### 6.15. Avoid JavaScript eval statements

<a href="https://www.owasp.org/index.php/Top_10-2017_A7-Cross-Site_Scripting_(XSS)" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A7:XSS%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A1-Injection" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A1:Injection%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A4-XML_External_Entities_(XXE)" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A4:External%20Entities%20-green.svg" alt=""/></a>

**TL;DR:** `eval` is evil as it allows executing custom JavaScript code during run time. This is not just a performance concern but also an important security concern due to malicious JavaScript code that may be sourced from user input. Another language feature that should be avoided is `new Function` constructor. `setTimeout` and `setInterval` should never be passed dynamic JavaScript code either.

**Otherwise:** Malicious JavaScript code finds a way into text passed into `eval` or other real-time evaluating JavaScript language functions, and will gain complete access to JavaScript permissions on the page. This vulnerability is often manifested as an XSS attack.

🔗 [**Read More: Avoid JavaScript eval statements**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/avoideval.md)

### 6.16. Prevent evil RegEx from overloading your single thread execution

<a href="https://www.owasp.org/index.php/Denial_of_Service" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20DDOS%20-green.svg" alt=""/></a>

**TL;DR:** Regular Expressions, while being handy, pose a real threat to JavaScript applications at large, and the Node.js platform in particular. A user input for text to match might require an outstanding amount of CPU cycles to process. RegEx processing might be inefficient to an extent that a single request that validates 10 words can block the entire event loop for 6 seconds and set the CPU on 🔥. For that reason, prefer third-party validation packages like [validator.js](https://github.com/chriso/validator.js) instead of writing your own Regex patterns, or make use of [safe-regex](https://github.com/substack/safe-regex) to detect vulnerable regex patterns

**Otherwise:** Poorly written regexes could be susceptible to Regular Expression DoS attacks that will block the event loop completely. For example, the popular `moment` package was found vulnerable with malicious RegEx usage in November of 2017

🔗 [**Read More: Prevent malicious RegEx**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/regex.md)

### 6.17. Avoid module loading using a variable

<a href="https://www.owasp.org/index.php/Top_10-2017_A7-Cross-Site_Scripting_(XSS)" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A7:XSS%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A1-Injection" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A1:Injection%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A4-XML_External_Entities_(XXE)" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A4:External%20Entities%20-green.svg" alt=""/></a>

**TL;DR:** Avoid requiring/importing another file with a path that was given as parameter due to the concern that it could have originated from user input. This rule can be extended for accessing files in general (i.e. `fs.readFile()`) or other sensitive resource access with dynamic variables originating from user input. [Eslint-plugin-security](https://www.npmjs.com/package/eslint-plugin-security) linter can catch such patterns and warn early enough

**Otherwise:** Malicious user input could find its way to a parameter that is used to require tampered files, for example, a previously uploaded file on the file system, or access already existing system files.

🔗 [**Read More: Safe module loading**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/safemoduleloading.md)

### 6.18. Run unsafe code in a sandbox

<a href="https://www.owasp.org/index.php/Top_10-2017_A7-Cross-Site_Scripting_(XSS)" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A7:XSS%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A1-Injection" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A1:Injection%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A4-XML_External_Entities_(XXE)" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A4:External%20Entities%20-green.svg" alt=""/></a>

**TL;DR:** When tasked to run external code that is given at run-time (e.g. plugin), use any sort of 'sandbox' execution environment that isolates and guards the main code against the plugin. This can be achieved using a dedicated process (e.g. `cluster.fork()`), serverless environment or dedicated npm packages that act as a sandbox

**Otherwise:** A plugin can attack through an endless variety of options like infinite loops, memory overloading, and access to sensitive process environment variables

🔗 [**Read More: Run unsafe code in a sandbox**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/sandbox.md)

### 6.19. Take extra care when working with child processes

<a href="https://www.owasp.org/index.php/Top_10-2017_A7-Cross-Site_Scripting_(XSS)" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A7:XSS%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A1-Injection" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A1:Injection%20-green.svg" alt=""/></a> <a href="https://www.owasp.org/index.php/Top_10-2017_A4-XML_External_Entities_(XXE)" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A4:External%20Entities%20-green.svg" alt=""/></a>

**TL;DR:** Avoid using child processes when possible and validate and sanitize input to mitigate shell injection attacks if you still have to. Prefer using `child_process.execFile` which by definition will only execute a single command with a set of attributes and will not allow shell parameter expansion.

**Otherwise:** Naive use of child processes could result in remote command execution or shell injection attacks due to malicious user input passed to an unsanitized system command.

🔗 [**Read More: Be cautious when working with child processes**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/childprocesses.md)

### 6.20. Hide error details from clients

<a href="https://www.owasp.org/index.php/Top_10-2017_A6-Security_Misconfiguration" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A6:Security%20Misconfiguration%20-green.svg" alt=""/></a>

**TL;DR:** An integrated express error handler hides the error details by default. However, great are the chances that you implement your own error handling logic with custom Error objects (considered by many as a best practice). If you do so, ensure not to return the entire Error object to the client, which might contain some sensitive application details

**Otherwise:** Sensitive application details such as server file paths, third party modules in use, and other internal workflows of the application which could be exploited by an attacker, could be leaked from information found in a stack trace

🔗 [**Read More: Hide error details from client**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/hideerrors.md)

### 6.21. Configure 2FA for npm or Yarn

<a href="https://www.owasp.org/index.php/Top_10-2017_A6-Security_Misconfiguration" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A6:Security%20Misconfiguration%20-green.svg" alt=""/></a>

**TL;DR:** Any step in the development chain should be protected with MFA (multi-factor authentication), npm/Yarn are a sweet opportunity for attackers who can get their hands on some developer's password. Using developer credentials, attackers can inject malicious code into libraries that are widely installed across projects and services. Maybe even across the web if published in public. Enabling 2-factor-authentication in npm leaves almost zero chances for attackers to alter your package code.

**Otherwise:** [Have you heard about the eslint developer whose password was hijacked?](https://medium.com/@oprearocks/eslint-backdoor-what-it-is-and-how-to-fix-the-issue-221f58f1a8c8)

### 6.22. Modify session middleware settings

<a href="https://www.owasp.org/index.php/Top_10-2017_A6-Security_Misconfiguration" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A6:Security%20Misconfiguration%20-green.svg" alt=""/></a>

**TL;DR:** Each web framework and technology has its known weaknesses - telling an attacker which web framework we use is a great help for them. Using the default settings for session middlewares can expose your app to module- and framework-specific hijacking attacks in a similar way to the `X-Powered-By` header. Try hiding anything that identifies and reveals your tech stack (E.g. Node.js, express)

**Otherwise:** Cookies could be sent over insecure connections, and an attacker might use session identification to identify the underlying framework of the web application, as well as module-specific vulnerabilities

🔗 [**Read More: Cookie and session security**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/sessions.md)

### 6.23. Avoid DOS attacks by explicitly setting when a process should crash

<a href="https://www.owasp.org/index.php/Denial_of_Service" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20DDOS%20-green.svg" alt=""/></a>

**TL;DR:** The Node process will crash when errors are not handled. Many best practices even recommend to exit even though an error was caught and got handled. Express, for example, will crash on any asynchronous error - unless you wrap routes with a catch clause. This opens a very sweet attack spot for attackers who recognize what input makes the process crash and repeatedly send the same request. There's no instant remedy for this but a few techniques can mitigate the pain: Alert with critical severity anytime a process crashes due to an unhandled error, validate the input and avoid crashing the process due to invalid user input, wrap all routes with a catch and consider not to crash when an error originated within a request (as opposed to what happens globally)

**Otherwise:** This is just an educated guess: given many Node.js applications, if we try passing an empty JSON body to all POST requests - a handful of applications will crash. At that point, we can just repeat sending the same request to take down the applications with ease

### 6.24. Prevent unsafe redirects

<a href="https://www.owasp.org/index.php/Top_10-2017_A1-Injection" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A1:Injection%20-green.svg" alt=""/></a>

**TL;DR:** Redirects that do not validate user input can enable attackers to launch phishing scams, steal user credentials, and perform other malicious actions.

**Otherwise:** If an attacker discovers that you are not validating external, user-supplied input, they may exploit this vulnerability by posting specially-crafted links on forums, social media, and other public places to get users to click it.

🔗 [**Read More: Prevent unsafe redirects**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/saferedirects.md)

### 6.25. Avoid publishing secrets to the npm registry

<a href="https://www.owasp.org/index.php/Top_10-2017_A6-Security_Misconfiguration" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20OWASP%20Threats%20-%20A6:Security%20Misconfiguration%20-green.svg" alt=""/></a>

**TL;DR:** Precautions should be taken to avoid the risk of accidentally publishing secrets to public npm registries. An `.npmignore` file can be used to ignore specific files or folders, or the `files` array in `package.json` can act as an allow list.

**Otherwise:** Your project's API keys, passwords or other secrets are open to be abused by anyone who comes across them, which may result in financial loss, impersonation, and other risks.

🔗 [**Read More: Avoid publishing secrets**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/avoid_publishing_secrets.md)

### 6.26 Inspect for outdated packages

**TL;DR:** Use your preferred tool (e.g. `npm outdated` or [npm-check-updates](https://www.npmjs.com/package/npm-check-updates)) to detect installed outdated packages, inject this check into your CI pipeline and even make a build fail in a severe scenario. For example, a severe scenario might be when an installed package is 5 patch commits behind (e.g. local version is 1.3.1 and repository version is 1.3.8) or it is tagged as deprecated by its author - kill the build and prevent deploying this version

**Otherwise:** Your production will run packages that have been explicitly tagged by their author as risky

### 6.27. Import built-in modules using the 'node:' protocol

#### `🌟 #new`

<a href="https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/" target="_blank"><img src="https://img.shields.io/badge/%E2%9C%94%20A06:2021 – Vulnerable and Outdated Components-green.svg" alt=""/></a>

**TL;DR:** Import or require built-in Node.js modules using the 'node protocol' syntax:

```javascript
import { functionName } from "node:module"; // note that 'node:' prefix
```

For example:

```javascript
import { createServer } from "node:http";
```

This style ensures that there is no ambiguity with global npm packages and makes it clear for the reader that the code refers to a well-trusted official module. This style can be enforced with the eslint rule ['prefer-node-protocol'](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-node-protocol.md)

**Otherwise:** Using the import syntax without 'node:' prefix opens the door for [typosquatting attacks](https://en.wikipedia.org/wiki/Typosquatting) where one could mistakenly mistype a module name (e.g., 'event' instead of 'events) and get a malicious package that was built only to trick users into installing them
