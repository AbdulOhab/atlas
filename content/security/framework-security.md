---
title: "Framework Security"
order: 11
summary: "Framework-specific guidance: Node.js, JavaScript and TypeScript, Next.js, Django and Django REST Framework, FastAPI, Laravel, PHP configuration, Symfony, Java, .NET and Ruby on Rails."
category: "Security"
level: Intermediate
---

# Framework Security

Framework-specific guidance: Node.js, JavaScript and TypeScript, Next.js, Django and Django REST Framework, FastAPI, Laravel, PHP configuration, Symfony, Java, .NET and Ruby on Rails.

## NodeJS Security

> **Source:** [NodeJS Security](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

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

## JavaScript and TypeScript Security

> **Source:** [JavaScript and TypeScript Security](https://cheatsheetseries.owasp.org/cheatsheets/JavaScript_and_TypeScript_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet lists secure development practices for JavaScript and TypeScript that apply everywhere the language runs: browsers, hybrid apps, server-side Node.js, and any other runtime that implements the language ([MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)). It covers language-level pitfalls (dynamic code execution, prototype pollution, regular expressions), client-side sinks, and TypeScript-specific false confidence. Rules that are equally valid on the client and the server are stated once here; backend and runtime hardening stays in the [Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html), which this sheet links to instead of duplicating.

### Related Cheat Sheets (Top-Level Links)

- [Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html) - backend and runtime guidance.
- [Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) - output encoding rules per context.
- [DOM based XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html) - client-side XSS sinks and sources.
- [Third Party JavaScript Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html) - managing external scripts.
- [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html) - TLS configuration.
- [OWASP Cheat Sheet Series index](https://cheatsheetseries.owasp.org/) - start here for the full catalog.

### Dangerous Language Surface

#### `eval`, `Function`, and `with`

Never build code from strings. See [MDN's eval guidance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval). `eval` and `new Function` execute arbitrary code with the current runtime's privileges, so any attacker-influenced input reaching them is code injection ([CWE-94](https://cwe.mitre.org/data/definitions/94.html)). In browsers, `setTimeout` and `setInterval` with a string argument compile it the same way through implied `eval`.

- Parse data with `JSON.parse`, never `eval`.
- Replace dynamic dispatch with static maps of functions instead of constructing calls from names.
- Do not use the `with` statement. It makes scope unpredictable, is forbidden in strict mode, and blocks engine optimizations.
- Enforce this statically with the `no-eval`, `no-implied-eval`, and `no-new-func` lint rules.
- In browsers, block string compilation with an enforced Content Security Policy whose `script-src` directive, or `default-src` fallback, omits both `'unsafe-eval'` and `'trusted-types-eval'`. A report-only policy does not block execution ([CSP `EnsureCSPDoesNotBlockStringCompilation`](https://w3c.github.io/webappsec-csp/#can-compile-strings)).
- CSP is a browser-side control and does not apply to server-side runtimes, so the lint rules remain the primary enforcement everywhere.

#### Evil Regex (ReDoS)

Nested quantifiers such as `(a+)+`, and repeated ambiguous alternatives such as `^(a|aa)*$`, can make matching take exponential time on crafted input, consuming CPU and potentially blocking the executing thread or event loop ([CWE-1333](https://cwe.mitre.org/data/definitions/1333.html)). Whether a pattern is actually exploitable depends on the surrounding expression and the failing input, not just the quantified group.

- Prefer well-tested validators over hand-written patterns for emails, URLs, and similar inputs.
- Keep patterns linear: avoid nested quantifiers and ambiguous alternation over the same characters.
- Cap untrusted input length before matching, and reject rather than sanitize when input does not match.
- For the attack mechanics and detection tooling, see the [OWASP ReDoS guidance](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS); use linear-time patterns as the primary control and input-length caps as defense in depth.

#### Strict Mode

Ship ES modules (strict by default) or declare `'use strict'`, as described in [MDN's strict mode documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode). Strict mode turns silent mistakes into errors: assignment to undeclared variables throws, `this` stays `undefined` in plain functions instead of becoming the global object, and `with` is rejected. It does not fix injection, XSS, or prototype pollution; treat it as hygiene, not a security boundary.

### Object and Property Safety (Including Prototype Pollution)

Prototype pollution ([CWE-1321](https://cwe.mitre.org/data/definitions/1321.html)) occurs when attacker-controlled keys such as `__proto__`, `constructor`, or `prototype` reach a recursive merge or path setter and modify an object's prototype. This can alter the behavior of objects that inherit from that prototype. These are the JavaScript-specific essentials only; the full protection guidance lives in the dedicated [Prototype Pollution Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html).

- Never pass untrusted input to a recursive merge or `set-by-path` helper, and reject the key segments `__proto__`, `constructor`, and `prototype` before writing.
- Use a `Map` with `set`, `get`, and `has` for untrusted dictionary keys, keeping entries separate from object properties ([MDN prototype pollution defenses](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Prototype_pollution#use_map_and_set_instead)). If an object is required, create it with `Object.create(null)` so it has no prototype.
- Validate parsed or copied untrusted data against a schema before use, and drop `__proto__` keys first: `Object.assign` applies them through the prototype setter and mutates the target's prototype, while spread creates a silent own property.

### DOM Sinks and Output Context

Injecting attacker-controlled strings into HTML, script, or URL contexts is cross-site scripting ([CWE-79](https://cwe.mitre.org/data/definitions/79.html)). Follow the [Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) for per-context encoding and the [DOM based XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html) for client-side sources and sinks.

- Build DOM with `textContent` and `createElement` instead of `innerHTML` or `insertAdjacentHTML`.
- When HTML must be rendered, sanitize with a maintained allowlist sanitizer and enforce [Trusted Types](https://w3c.github.io/trusted-types/dist/spec/) with no permissive default policy.
- Framework auto-escaping has explicit bypasses that must never receive untrusted input: React `dangerouslySetInnerHTML`, Vue `v-html`, and Angular `bypassSecurityTrustHtml` and its siblings.

### Async Error Handling, Messaging, and Origin Checks

Not every promise failure is a defect. An *expected* failure is part of a function's contract, such as a lookup that returns `null` for a missing key or a parse that throws on malformed input; handle it where the caller decides what to do, with a `try`/`catch` around `await` or a `.catch` on the terminal link of the chain, and return a typed result or a documented error. An *unhandled* rejection is a promise that rejects with no handler attached, so the failure propagates past the call site and is usually a bug: browsers report it in the console and fire an `unhandledrejection` event, while Node.js behavior depends on its unhandled-rejection mode and may terminate the process ([MDN promise rejection events](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#promise_rejection_events)). Keep promise chains flat with a terminal error handler so genuinely unexpected rejections stay visible, and do not silence them with an empty `catch`. Server-side specifics live in the [Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html) and are not repeated here.

For `postMessage`, the receiver must verify `event.origin` against an explicit allowlist, check `event.source` when a conversation partner is expected, and validate `event.data` against the expected schema before acting on it. The sender must pass an exact `targetOrigin`, never `"*"` for sensitive data ([MDN postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)). Prefer narrow `MessageChannel` ports over broadcast messaging where the design allows it.

### TypeScript-Specific Caveats

Types are erased at runtime, so TypeScript alone enforces nothing against a malicious or malformed caller.

- Treat `any` as a hole in every check. `unknown` is the safe default for values of unknown type, because it forces you to narrow before use, whereas `any` disables type checking for that value ([TypeScript Handbook: `unknown`](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown)).
- Type assertions (`as`) and non-null assertions (`!`) silence the compiler without changing runtime values; do not use them on untrusted data.
- Enable `strict` in `tsconfig.json` (plus `noUncheckedIndexedAccess` where affordable) to catch accidental unsafety in your own code. It is a code-quality control, not a trust boundary.
- Validate at every trust boundary (network responses, `postMessage` payloads, storage reads) with a runtime schema validator. The validated type should flow from the schema, not from a parallel hand-written interface.

### Linting and Dependency Tooling

- Lint with [`typescript-eslint`](https://typescript-eslint.io/) recommended sets plus `no-eval`, `no-implied-eval`, and `no-new-func`. Keep dependencies updated so new rules apply.
- Pin versions with a lockfile, review dependency changes, and monitor advisories. Frontend dependency-review specifics overlap with the [Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html).
- For third-party scripts loaded from a CDN, pin a Subresource Integrity hash with `crossorigin` handling per the [Third Party JavaScript Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html).

## Next.js Security

> **Source:** [Next.js Security](https://cheatsheetseries.owasp.org/cheatsheets/Nextjs_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

For the underlying runtime and secret handling, see the [Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html) and [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

Next.js applications have several server entry points and can render or cache data on both sides of the server/client boundary. The framework's [authentication guidance](https://nextjs.org/docs/app/guides/authentication) recommends placing authorization close to the data source instead of relying on routing or user interface checks.

Apply these principles to the relevant framework surfaces:

- Classify every server entry point and enforce controls appropriate to its audience and effects.
- Return only data that the browser is authorized to receive and the application needs.
- Include the intended audience in every cache decision.
- Treat routing and image configuration as security-sensitive code.
- Test controls by calling entry points directly, without using the user interface.

This sheet covers both the App Router and Pages Router. General JavaScript, authentication, Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), and Server-Side Request Forgery (SSRF) guidance is linked rather than repeated.

### Classify and Protect Server Entry Points

Next.js applications have multiple server entry points. A check in one does not protect another independently callable path. For protected operations, enforce authorization at a boundary that every applicable path traverses. The [Next.js Data Security guide](https://nextjs.org/docs/app/guides/data-security#data-access-layer) recommends a server-only Data Access Layer (DAL) that performs authorization and returns minimal Data Transfer Objects (DTOs). An equivalent service-layer policy enforcement point or database control can also provide the boundary when all protected paths necessarily traverse it.

| Entry point | Secure use |
|-------------|------------|
| Proxy (`proxy.ts` in Next.js 16+; deprecated `middleware.ts` remains available during migration) | Use for optimistic redirects and request filtering. Do not make it the only authorization layer. |
| Server Action | Treat each reachable action as a client-callable POST entry point. Validate input, then apply authentication and resource authorization when the operation is protected. |
| Route Handler (`route.ts`) or Pages API Route (`pages/api`) | Treat it as an HTTP endpoint with an explicit audience. Apply the controls appropriate to a public endpoint, authenticated API, service endpoint, or webhook. |
| Server Component, page, or data loader | Authorize before reading protected data. Return a narrow DTO rather than a database record. |
| Layout or Client Component | A layout can enforce render-time access, but it does not protect independently callable descendants. Client Component checks only control what the user interface shows. |

#### Do not rely on Proxy or middleware alone

Proxy can redirect unauthenticated users early, but its `matcher` may omit a route and routing changes can silently move an operation outside its coverage. Next.js explicitly states that [Proxy should not be the only line of defense](https://nextjs.org/docs/app/guides/authentication#optimistic-checks-with-proxy-optional). Authorize protected operations again at the handler or data source.

This is also a defense against framework defects. [CVE-2025-29927](https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw) allowed affected self-hosted Next.js versions to bypass authorization implemented only in middleware. Patch the framework, but keep authorization behind the routing layer so one bypass cannot expose data.

#### Secure Server Actions as endpoints

A Server Action referenced by the application can receive a client-originated POST independently of the page that renders its form. Rendering the form only on a protected page does not authenticate the action request. Next.js documents that [page-level authentication does not extend to Server Actions](https://nextjs.org/docs/app/guides/data-security#authentication-and-authorization).

Classify each action as public or protected, then apply the relevant controls:

- Validate all arguments as untrusted input.
- For a protected action, derive the current authentication context on the server rather than accepting identity claims in its arguments.
- Check permission on the exact protected object being read or changed; treat a user or tenant identifier submitted by the client as a selector, not authorization proof.
- Return only authorized result fields because Server Action return values are serialized to the client.
- Apply rate limits or stronger re-authentication to expensive or high-impact operations.

Next.js compares the request `Origin` with the host for Server Actions. Keep [`serverActions.allowedOrigins`](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions#allowedorigins) narrow when a trusted proxy requires additional origins. On a self-hosted deployment, ensure that only trusted infrastructure can establish the canonical `Host` or `X-Forwarded-Host` value seen by the application. A [historical Server Action SSRF advisory](https://github.com/vercel/next.js/security/advisories/GHSA-fr5h-rqp8-mj6g), fixed in Next.js 14.1.1, demonstrates why patching and trustworthy host handling both matter. This built-in Origin check does not replace authentication, authorization, or the general controls in the [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

#### Protect Route Handlers and Pages API Routes separately

Protecting a page does not protect a Route Handler or API Route that serves related data. Next.js says to treat [Route Handlers as public-facing API endpoints](https://nextjs.org/docs/app/guides/authentication#route-handlers). Classify each handler's audience: an intentionally public endpoint may require input validation and abuse controls, a webhook may authenticate a signature, and a protected API requires the applicable authentication plus object-level or tenant-level authorization from the [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

Do not infer that a handler is private because only a Server Component calls it. If no browser, service, webhook, or external client needs the HTTP API, call the DAL directly from the Server Component and remove the extra entry point.

#### Protect Draft Mode as a privileged state change

If the application uses Draft Mode, treat the handler that enables it as a protected entry point. Calling `enable()` on the value returned by `await draftMode()` sets the `__prerender_bypass` cookie; it does not authenticate the caller or validate a secret by itself. The [Draft Mode guide](https://nextjs.org/docs/app/guides/draft-mode) recommends validating a shared secret and confirming that the requested content exists before enabling the mode.

- Authenticate the CMS or other caller and use a high-entropy secret when a shared-secret integration is appropriate.
- Validate any requested content identifier against the trusted content source before enabling Draft Mode.
- Redirect to a server-established path returned by that source, not directly to an untrusted query parameter.
- Test that an unauthenticated caller cannot obtain the `__prerender_bypass` cookie or use a Draft Mode entry point to expose unpublished content.

### Control Data Crossing into the Browser

Code running only on the server can still send its return values to the browser. The App Router [serializes values passed to Client Components](https://nextjs.org/docs/app/guides/data-security#passing-data-from-server-to-client), and the Pages Router exposes page props in the initial HTML. The [Pages Router documentation](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props#behavior) warns that `getServerSideProps` values are visible to the client.

- Construct an explicit DTO containing only fields the browser is authorized to receive. Selecting only required columns at the data source provides additional defense in depth.
- Do not pass ORM records, session objects, or configuration merely because they are available. Do not send secrets to Client Components. Any token intentionally sent to the browser must be narrowly scoped and treated as exposed; configuration must be explicitly classified as public.
- Keep Server Action return values authorized and minimal; a server-side function does not make its returned value secret.
- Treat values returned in the `props` from `getStaticProps`, `getServerSideProps`, and [`getInitialProps`](https://nextjs.org/docs/pages/api-reference/functions/get-initial-props) as visible to that page's browser.
- Prefix an environment variable with `NEXT_PUBLIC_` only when its value is intentionally public. The value is included in client JavaScript according to the [Next.js environment variable guide](https://nextjs.org/docs/app/guides/environment-variables#bundling-environment-variables-for-the-browser).

Importing `server-only` in a sensitive module is a useful build-time guard because it prevents that module from being imported into a Client Component. It does not stop server code from explicitly returning sensitive data. React taint APIs can add another guard, but Next.js describes [tainting as defense in depth](https://nextjs.org/docs/app/guides/data-security#tainting), not a replacement for shaping data.

For browser rendering sinks and React-specific client concerns, use the [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) and [DOM-based XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html).

### Scope Caches to Their Audiences

Before caching a response or function result, classify its audience, such as public, tenant-scoped, user-scoped, permission-set, locale, cohort, or request-specific. A cache entry must not be reusable by a broader audience than the data permits. With `use cache`, Next.js includes serializable arguments and captured closure values in the [generated cache key](https://nextjs.org/docs/app/api-reference/directives/use-cache#cache-keys). Include a verified user, tenant, or other audience dimension when it changes the cached value or a cached authorization decision. When content is identical across authorized callers and authorization is enforced separately before return, do not duplicate the cache merely by identity.

- Establish and verify the required authorization context before returning protected cached data. Depending on the design, this may be a user identity, service identity, or validated capability.
- Include only verified dimensions that change the cached value or cached authorization decision, such as user ID, tenant ID, permission version, or locale. Do not use a raw cookie or bearer token as a cache key.
- Do not put user-specific data in a `use cache` function that has no user-specific input.
- Use caches that can serve a response before per-request application authorization, such as Incremental Static Regeneration (ISR), `getStaticProps`, or shared CDN caching, only for data the full cache audience may read. Next.js states that [`getStaticProps` data must be publicly cacheable](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props#when-should-i-use-getstaticprops).
- A server-side data or `fetch` cache may hold protected content shared by authorized callers when every return path authorizes access and the key separates every content variant.
- Do not add shared `Cache-Control` directives to personalized `getServerSideProps` responses.
- After authorization or tenancy changes, prevent reuse under stale permissions by invalidating affected keys or tags, advancing a permission version in the key, or using another bounded expiration strategy.

Treat cache invalidation as a mutation capability. [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) and [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) can be called from server entry points, while [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag) is limited to Server Actions. Authenticate and authorize callers, derive the invalidation target from an authorized object or validate it against constrained application-owned path and tag patterns, and apply abuse controls to externally reachable invalidation handlers. A deliberately global purge should require the correspondingly privileged operation.

`use cache: private` can read request-time values, but its results are cached in the browser's memory and are still delivered to that browser. The [directive documentation](https://nextjs.org/docs/app/api-reference/directives/use-cache-private) does not make over-broad data safe to return.

For user-, tenant-, or permission-scoped caches, test representative identities with different entitlements: fill the cache as identity A, then request the same route and object identifiers as identity B. Repeat after changing a role or tenant membership. This catches missing audience keys that a positive-path cache test cannot.

### Treat Next.js Configuration as Security Code

Review `next.config.*`, Proxy matchers, and route configuration with the same care as application handlers. Next.js [rewrites act as a URL proxy](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites), and matcher values can flow into destinations.

- Resolve external rewrite hosts from a fixed allowlist or a server-controlled registry. Do not let an untrusted header, host, cookie, or query capture select an upstream scheme, authority, or port.
- For a protected destination, ensure direct requests cannot bypass equivalent authentication and authorization. Enforcement may live at the destination or at a trusted gateway whose network policy blocks direct access. A rewrite masks the destination URL; it does not create an authorization boundary.
- Do not let untrusted captures select the scheme or authority of an external redirect. Validate any interpolated path or query component using the [Unvalidated Redirects and Forwards Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html).
- Define every `images.remotePatterns` restriction the application can enforce. Next.js warns that [omitted fields imply broad wildcards](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns); allow port, pathname, or query variation only when the use case requires it and the trust model accounts for the broader match.
- Keep `images.dangerouslyAllowLocalIP` disabled unless a reviewed private-network use case requires it. Next.js warns that enabling it can let users [access content on the internal network](https://nextjs.org/docs/app/api-reference/components/image#dangerouslyallowlocalip). Apply the [SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) to any server-side fetch destination.
- Keep `serverActions.allowedOrigins` restricted to trusted application and proxy origins.
- Leave [`productionBrowserSourceMaps`](https://nextjs.org/docs/app/api-reference/config/next-config-js/productionBrowserSourceMaps) disabled unless the operational need justifies publicly serving the original browser source maps. Enabling it causes Next.js to emit and automatically serve those files.
- Deploy an optimized production build with an appropriate production server or adapter. Do not expose [`next dev`](https://nextjs.org/docs/app/api-reference/cli/next#next-dev-options), which enables development-mode hot reloading and error reporting, as the production service.

Security-sensitive configuration assembled from environment variables is still code. Validate hosts and origins against an allowlist at startup and fail closed when a required value is missing or invalid. Validate other configuration using an appropriate schema, type, or range constraint.

#### Choose a CSP compatible with the rendering model

Use a Content Security Policy (CSP) appropriate to the application's script, style, and third-party resource requirements; see the [Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html) for general policy design. Next.js can [generate a fresh nonce in Proxy and apply it during rendering](https://nextjs.org/docs/app/guides/content-security-policy#nonces). A nonce must be unpredictable and unique for each response; do not cache HTML in a way that reuses it for another response.

Nonce-based CSP has an architectural cost: Next.js requires dynamic rendering, disables static optimization and ISR for those pages, and does not support Partial Prerendering (PPR) with request-specific nonces. Applications that retain static rendering can use a CSP without nonces when their resource policy permits it. Do not weaken a production policy with development-only directives such as `'unsafe-eval'` merely to make the development server work.

### Verify the Boundaries

Framework controls need direct negative-path tests. The [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist#security) recommends checking authorization inside protected Server Actions rather than relying on Proxy, layouts, or pages.

- Inventory application-defined Server Actions, Route Handlers, Pages API Routes, Draft Mode entry points, server-side data loaders, Proxy matchers, cached functions, cache-invalidation call sites, rewrites, redirects, CSP configuration, source map settings, and remote image patterns. Classify each applicable audience and effect.
- Call actions and handlers directly without first loading their page. For protected operations, verify the applicable unauthenticated, unauthorized, wrong-owner, and wrong-tenant requests fail. For public operations, verify the intended public behavior and abuse controls.
- For protected route families that use Proxy for early filtering, exercise an unmatched or bypassed-Proxy path and prove the handler or data boundary still denies unauthorized access.
- Inspect the applicable rendered HTML, React Server Component payloads, Pages Router data responses, and Server Action responses for fields that should remain server-only.
- Run cross-user and cross-tenant tests for audience-scoped caches, including after permission changes and revalidation.
- Call Draft Mode and cache-invalidation handlers directly and prove that unauthorized callers cannot enable preview state or invalidate content.
- Keep Next.js on a supported patched release. [CVE-2024-46982](https://github.com/vercel/next.js/security/advisories/GHSA-gp8f-8m3g-qvj9) is an example where an affected Pages Router response could be cached when the application intended otherwise.

Security tests should fail when a new application entry point or cache is added without an explicit classification. A fixed hand-maintained list can miss the new file for the same reason the control was omitted, so derive the inventory from the route and source tree where practical.

## Django Security

> **Source:** [Django Security](https://cheatsheetseries.owasp.org/cheatsheets/Django_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

The Django framework is a powerful Python web framework, and it comes with built-in security features that can be used out-of-the-box to prevent common web vulnerabilities. This cheat sheet lists actions and security tips developers can take to develop secure Django applications. It aims to cover common vulnerabilities to increase the security posture of your Django application. Each item has a brief explanation and relevant code samples that are specific to the Django environment.

The Django framework provides some built-in security features that aim to be secure-by-default. These features are also flexible to empower a developer to re-use components for complex use-cases. This opens up scenarios where developers unfamiliar with the inner workings of the components can configure them in an insecure way. This cheat sheet aims to enumerate some such use cases.

### General Recommendations

- Always keep Django and your application's dependencies up-to-date to keep up with security vulnerabilities.
- Ensure that the application is never in `DEBUG` mode in a production environment. Never run `DEBUG = True` in production.
- Use packages like [`django_ratelimit`](https://django-ratelimit.readthedocs.io/en/stable/) or [`django-axes`](https://django-axes.readthedocs.io/en/latest/index.html) to prevent brute-force attacks.

### Authentication

- Use `django.contrib.auth` app for views and forms for user authentication operations such as login, logout, password change, etc. Include the module and its dependencies `django.contrib.contenttypes` and `django.contrib.sessions` in the `INSTALLED_APPS` setting in the `settings.py` file.

  ```python
  INSTALLED_APPS = [
      # ...
      'django.contrib.auth',
      'django.contrib.contenttypes',
      'django.contrib.sessions',
      # ...
  ]
  ```

- Use the `@login_required` decorator to ensure that only authenticated users can access a view. The sample code below illustrates usage of `@login_required`.

  ```python
  from django.contrib.auth.decorators import login_required

  # User is redirected to default login page if not authenticated.
  @login_required
  def my_view(request):
    # Your view logic

  # User is redirected to custom '/login-page/' if not authenticated.
  @login_required(login_url='/login-page/')
  def my_view(request):
    # Your view logic
  ```

- Use password validators for enforcing password policies. Add or update the `AUTH_PASSWORD_VALIDATORS` setting in the `settings.py` file to include specific validators required by your application.

  ```python
  AUTH_PASSWORD_VALIDATORS = [
    {
      # Checks the similarity between the password and a set of attributes of the user.
      'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
      'OPTIONS': {
        'user_attributes': ('username', 'email', 'first_name', 'last_name'),
        'max_similarity': 0.7,
      }
    },
    {
      # Checks whether the password meets a minimum length.
      'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
      'OPTIONS': {
        'min_length': 8,
      }
    },
    {
      # Checks whether the password occurs in a list of common passwords
      'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
      # Checks whether the password isn’t entirely numeric
      'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    }
  ]
  ```

- Store passwords using `make-password` utility function to hash a plain-text password.

  ```python
  from django.contrib.auth.hashers import make_password
  #...
  hashed_pwd = make_password('plaintext_password')
  ```

- Check a plaintext password against a hashed password by using the  `check-password` utility function.

  ```python
  from django.contrib.auth.hashers import check_password
  #...
  plain_pwd = 'plaintext_password'
  hashed_pwd = 'hashed_password_from_database'

  if check_password(plain_pwd, hashed_pwd):
    print("The password is correct.")
  else:
    print("The password is incorrect.")
  ```

### Key Management

The `SECRET_KEY` parameter in settings.py is used for cryptographic signing and should be kept confidential. Consider the following recommendations:

- Generate a key at least 50 characters or more, containing a mix of letters, digits, and symbols.
- Ensure that the `SECRET_KEY` is generated using a strong random generator, such as `get_random_secret_key()` function in Django.
- Avoid hard coding the `SECRET_KEY` value in settings.py or any other location. Consider storing the key-value in environment variables or secrets managers.

  ```python
  import os
  SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
  ```

- Regularly rotate the key, keeping in mind that this action can invalidate sessions, password reset tokens, etc. Rotate the key immediately it if it ever gets exposed.

### Headers

Include the `django.middleware.security.SecurityMiddleware` module in the `MIDDLEWARE` setting in your project's `settings.py` to add security-related headers to your responses. This module is used to set the following parameters:

- `SECURE_CONTENT_TYPE_NOSNIFF`: Set this key to `True`. Protects against MIME type sniffing attacks by enabling the header `X-Content-Type-Options: nosniff`.
- `SECURE_HSTS_SECONDS`: A positive value adds [HTTP Strict Transport Security (HSTS)](https://docs.djangoproject.com/en/5.2/ref/middleware/#http-strict-transport-security) to HTTPS responses, instructing supporting browsers to use HTTPS for the specified period. It does not reject HTTP requests on the server or protect a browser's first connection before it knows the policy; [preloading addresses that initial-connection gap](https://www.rfc-editor.org/rfc/rfc6797.html#section-12.3).

Include the `django.middleware.clickjacking.XFrameOptionsMiddleware` module in the `MIDDLEWARE` setting in your project's `settings.py` (This module should be listed after the `django.middleware.security.SecurityMiddleware` module as ordering is important). This module is used to set the following parameters:

- `X_FRAME_OPTIONS`: Set this key to 'DENY' or 'SAMEORIGIN'. This setting adds the `X-Frame-Options` header to all HTTP responses. This protects against clickjacking attacks.

### Content Security Policy

Django 6.0 and later provide built-in Content Security Policy (CSP) support. Enable `django.middleware.csp.ContentSecurityPolicyMiddleware` and configure `SECURE_CSP` to enforce a policy, or `SECURE_CSP_REPORT_ONLY` to monitor violations without blocking content. Follow [Django's CSP configuration guide](https://docs.djangoproject.com/en/6.0/howto/csp/). Earlier versions require a third-party library such as `django-csp` or configuration of HTTP response headers.

For more details:

- [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Django Security Documentation](https://docs.djangoproject.com/en/stable/topics/security/)

### Cookies

- `SESSION_COOKIE_SECURE`: Set this key to `True` in the `settings.py` file. This will send the session cookie over secure (HTTPS) connections only.
- `CSRF_COOKIE_SECURE`: Set this key to `True` in the `settings.py` file. This will ensure that the CSRF cookie is sent over secure connections only.
- Whenever you set a custom cookie in a view using the `HttpResponse.set_cookie()` method, make sure to set its secure parameter to `True`.

  ```python
  response = HttpResponse("Some response")
  response.set_cookie('my_cookie', 'cookie_value', secure=True)
  ```

### Cross Site Request Forgery (CSRF)

- Include the `django.middleware.csrf.CsrfViewMiddleware` module in the `MIDDLEWARE` setting in your project's `settings.py` to add CSRF related headers to your responses.
- In forms use the `{% csrf_token %}` template tag to include the CSRF token. A sample is shown below.

  ```html
  <form method="post">
      {% csrf_token %}
      <!-- Your form fields here -->
  </form>
  ```

- For AJAX calls, the CSRF token for the request has to be extracted prior to being used in the AJAX call.
- Additional recommendations and controls can be found at Django's [Cross Site Request Forgery protection](https://docs.djangoproject.com/en/5.2/ref/csrf/) documentation.

### Cross Site Scripting (XSS)

The recommendations in this section are in addition to XSS recommendations already mentioned previously.

- Use the built-in template system to render templates in Django. Refer to Django's [Automatic HTML escaping](https://docs.djangoproject.com/en/5.2/ref/templates/language/#automatic-html-escaping) documentation to learn more.
- Try to avoid using the `safe` filter (or `mark_safe` function) to disable Django's automatic template escaping. If you do need to use it, make sure the input is from a trusted source. Extra caution is required when handling user-controlled inputs.
- Use the [`json_script`](https://docs.djangoproject.com/en/5.2/ref/templates/builtins/#json-script) template filter for passing data to JavaScript in Django templates.
- Refer to Django's [Cross Site Scripting (XSS) protection](https://docs.djangoproject.com/en/5.2/topics/security/#cross-site-scripting-xss-protection) documentation to learn more.

### HTTPS

- Include the `django.middleware.security.SecurityMiddleware` module in the `MIDDLEWARE` setting in your project's `settings.py` if not already added.
- Set the `SECURE_SSL_REDIRECT = True` in the `settings.py` file to ensure that all communication is over HTTPS. This will redirect any HTTP requests automatically to HTTPS. This is also a 301 (permanent) redirect, so your browser will remember the redirect for subsequent requests.
- Configure `SECURE_PROXY_SSL_HEADER` only behind a trusted proxy that strips client-supplied copies of the chosen header and sets its HTTPS-indicating value only for requests originally received over HTTPS. Prevent clients from bypassing that proxy to supply the trusted header directly. If these conditions cannot be guaranteed, leave the setting at `None`; see [Django's proxy-header security warning](https://docs.djangoproject.com/en/5.2/ref/settings/#secure-proxy-ssl-header).

### Admin panel URL

It is advisable to modify the default URL leading to the admin panel (example.com/admin/), in order to slightly increase the difficulty for automated attacks. Here’s how to do it:

In the default app folder within your project, locate the `urls.py` file managing the top-level URLs. Within the file, modify the `urlpatterns` variable, a list, so that the URL leading to `admin.site.urls` is different from "admin/". This approach adds an extra layer of security by obscuring the common endpoint used for administrative access.

### Django's built-in command `check --deploy`

Django has built-in command [`check --deploy`](https://docs.djangoproject.com/en/stable/ref/django-admin/#cmdoption-check-deploy) for security checks. Example:

```
$ ./manage.py check --deploy
System check identified some issues:

WARNINGS:
?: (security.W004) You have not set a value for the SECURE_HSTS_SECONDS setting. If your entire site is served only over SSL, you may want to consider setting a value and enabling HTTP Strict Transport Security. Be sure to read the documentation first; enabling HSTS carelessly can cause serious, irreversible problems.
?: (security.W008) Your SECURE_SSL_REDIRECT setting is not set to True. Unless your site should be available over both SSL and non-SSL connections, you may want to either set this setting True or configure a load balancer or reverse-proxy server to redirect all connections to HTTPS.
?: (security.W009) Your SECRET_KEY has less than 50 characters, less than 5 unique characters, or it's prefixed with 'django-insecure-' indicating that it was generated automatically by Django. Please generate a long and random value, otherwise many of Django's security-critical features will be vulnerable to attack.
?: (security.W012) SESSION_COOKIE_SECURE is not set to True. Using a secure-only session cookie makes it more difficult for network traffic sniffers to hijack user sessions.
?: (security.W016) You have 'django.middleware.csrf.CsrfViewMiddleware' in your MIDDLEWARE, but you have not set CSRF_COOKIE_SECURE to True. Using a secure-only CSRF cookie makes it more difficult for network traffic sniffers to steal the CSRF token.
?: (security.W018) You should not have DEBUG set to True in deployment.
?: (security.W020) ALLOWED_HOSTS must not be empty in deployment.

System check identified 7 issues (0 silenced).

```

You can harden your Django project by addressing the warnings generated by this command.

## Django REST Framework (DRF)

> **Source:** [Django REST Framework (DRF)](https://cheatsheetseries.owasp.org/cheatsheets/Django_REST_Framework_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet provides Django REST Framework security advice for developers. It is a basic set of guidelines for Django REST developers who need to secure fundamental aspects of an application.

For the original analysis of unsafe deserialization and serializer field selection, see sections 4.4.1.12 and 4.4.1.18 of [Django REST Framework (DRF) Secure Code Guidelines](https://openaccess.uoc.edu/handle/10609/147246).

### What is a view in Django?

A view in Django is a Python class or a function that returns a web response after it receives a web request. That response can be in simple HTTP, an HTML template, or an HTTP redirect request that redirects a user to another page.

### Settings

To configure the Django REST Framework (DRF), you will need to access the namespace REST_FRAMEWORK. Normally, you will find this namespace in the settings.py file. From a security perspective, the most relevant items are:

#### DEFAULT_AUTHENTICATION_CLASSES

A list of authentication classes that are used by default to identify which user is authenticated by accessing the request.user or request.auth properties. These classes are 'rest_framework.authentication.SessionAuthentication' (session authentication) and 'rest_framework.authentication.BasicAuthentication' (basic authentication).

#### DEFAULT_PERMISSION_CLASSES

A list of permission classes that defines the default set of permissions that Django checks before a view can be accessed. Since the default is 'rest_framework.permissions.AllowAny', that means **unless the default permission class is changed, everybody can access every view by default.**

#### DEFAULT_THROTTLE_CLASSES

A list of throttle classes that determines the default set of throttles checked at the start of a view. **By default, there is no throttling in place since the default class is empty.**

#### DEFAULT_PAGINATION_CLASS

The default class to use for queryset pagination. **In Django, pagination is disabled by default.** Without proper pagination, Denial of Service (DoS) problems or attacks could occur if there’s a lot of data.

### OWASP API Security Top 10 (2019)

The [OWASP API Security Top 10](https://owasp.org/www-project-api-security/) is a list of the most critical security risks for APIs that was developed by the [Open Worldwide Application Security Project (OWASP)](https://owasp.org/). It is designed to help organizations identify and prioritize the most significant risks to their APIs so that they can implement appropriate controls to mitigate those risks.

This section uses the 2019 version of the API Security Top 10. The best approach to securing your web API is to start at the top threat (A1 below) and work your way down. This will ensure that any time spent on security will be spent most effectively because you will cover the top threats first. After you look at the Top 10, it is generally advisable to assess for other threats or get a professional penetration test.

#### API1:2019 Broken Object Level Authorization

When using object-level permissions, you should make sure that the object can be accessed by the user using the method `.check_object_permissions(request, obj)`.

Example:

```python
def get_object(self):
    obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
    self.check_object_permissions(self.request, obj)
    return obj
```

DO NOT override the method `get_object()` without checking if the request should have access to that object.

#### API2:2019 Broken User Authentication

To prevent broken user authentication, use the setting value DEFAULT_AUTHENTICATION_CLASSES with the correct classes for your project and have authentication on every non-public API endpoint. Do not overwrite the authentication class on a class-based (variable `authentication_classes`) or function-based (decorator `authentication_classes`) view unless you are confident about the change and understand the impact.

#### API3:2019 Excessive Data Exposure

To prevent this problem, only display the minimum amount of required information. Make sure you review the serializer and the information you are displaying. If the serializer is inheriting from ModelSerializer, DO NOT use the exclude Meta property.

#### API4:2019 Lack of Resources & Rate Limiting

Configure `DEFAULT_THROTTLE_CLASSES` and `DEFAULT_THROTTLE_RATES` for application usage policies, and review any per-view overrides. DRF explicitly warns that its [built-in throttling is not a security defense against brute force or denial-of-service attacks](https://www.django-rest-framework.org/api-guide/throttling/). Its cache operations are non-atomic, so concurrent requests can exceed the configured limit.

Enforce abuse controls at the reverse proxy or API gateway as well as in the application. Apply request-size and resource limits; see the [Denial of Service Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html) for layered defenses.

#### API5:2019 Broken Function Level Authorization

To stop this problem, change the default value (`'rest_framework.permissions.AllowAny'`) of DEFAULT_PERMISSION_CLASSES. Use the setting value DEFAULT_PERMISSION_CLASSES with the correct classes for your project.

DO NOT use `rest_framework.permissions.AllowAny` except for public API endpoints and DO NOT overwrite the authorization class on a class-based (variable `permission_classes`) or function-based (decorator `permission_classes`) view unless you are confident about the change and understand the impact.

#### API6:2019 Mass Assignment

For DRF APIs, explicitly allowlist the fields in `ModelSerializer.Meta.fields`; avoid `Meta.exclude` and `fields = "__all__"`, which can expose newly added model fields. Follow the [serializer field selection guidance](https://www.django-rest-framework.org/api-guide/serializers/#specifying-which-fields-to-include). Fields that clients may read but must not change should be [read-only](https://www.django-rest-framework.org/api-guide/serializers/#specifying-read-only-fields): use `Meta.read_only_fields` for generated fields, or `read_only=True` on explicitly declared fields. These serializer controls do not replace authorization checks for the requested operation.

#### API7:2019 Security Misconfiguration

To stop this problem, you must have a repeatable hardening process leading to fast and easy deployment of a properly locked down environment. Have an automated process to continuously assess the effectiveness of the configuration and settings in all environments.

**DO NOT use default passwords. Set the Django settings `DEBUG` and `DEBUG_PROPAGATE_EXCEPTIONS` to False. Ensure API can only be accessed by the specified HTTP verbs. All other HTTP verbs should be disabled. Set `SECRET_KEY` to a random value and NEVER hardcode secrets.**

**DO validate, filter, and sanitize all client-provided data, or other data coming from integrated systems.**

#### API8:2019 Injection

##### SQLi

**To prevent this problem, use parametrized queries.** Be careful when using dangerous methods like `raw()`, `extra()` and custom SQL (via `cursor.execute()`). DO NOT add user input to dangerous methods (`raw()`, `extra()`, `cursor.execute()`).

##### RCE

To stop this problem, use the `Loader=yaml.SafeLoader` for YAML files. DO NOT load user-controlled YAML files using the method `load()`.

Also, DO NOT add user input to dangerous methods (`eval()`, `exec()` and `execfile()`) and DO NOT load user-controlled pickle files, which includes the pandas method `pandas.read_pickle()`.

#### API9:2019 Improper Assets Management

To prevent this problem, create an inventory of all API hosts. In this inventory, document the important aspects of each host. Focus on the API version and the API environment (e.g., production, staging, test, development) and determine who should have network access to the host (e.g., public, internal, partners). Make sure you document all aspects of your API such as authentication, errors, redirects, rate limiting, cross-origin resource sharing (CORS) policy and endpoints, including their parameters, requests, and responses.

#### API10:2019 Insufficient Logging & Monitoring

For proper logging and monitoring capabilities, do the following:

--Log all failed authentication attempts, denied access, and input validation errors with sufficient user context to identify suspicious or malicious accounts.

--Create logs in a format suited to be consumed by a log management solution and include enough detail to identify the malicious actor.

--Handle logs as sensitive data, and their integrity should be guaranteed at rest and transit.

--Configure a monitoring system to continuously monitor the infrastructure, network, and the API functioning.

--Use a Security Information and Event Management (SIEM) system to aggregate and manage logs from all components of the API stack and hosts.

--Configure custom dashboards and alerts, enabling suspicious activities to be detected and responded to earlier.

--Establish effective monitoring and alerting so suspicious activities are detected and responded to in a timely fashion.

DO NOT:

--Log generic error messages such as: Log.Error("Error was thrown"); rather log the stack trace, error message and user ID who caused the error.

--Log sensitive data such as user's passwords, API Tokens or PII.

### Other Security Risks

Below is a list of security risks for APIs not discussed in the OWASP API Security Top 10.

#### Business Logic Bugs

Be aware of possible business logic errors that result in security bugs. Since business logic bugs are difficult to impossible to detect using automated tools, the best ways to prevent business logic security bugs are use threat models, do security design reviews, do code reviews, pair programs and write unit tests.

#### Secret Management

**Secrets should never be hardcoded. The best practice is to use a Secret Manager.** For more information review OWASP [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

### Updating Django and DRF and Having a Process for Updating Dependencies

All applications have dependencies and those dependencies can have vulnerabilities. One good practice is to audit the dependencies your project is using. In general, it is important to have a process for updating dependencies. A sample process might define three mechanisms for triggering an update of response:

--Every month/quarter dependencies in general are updated.
--Every week important security vulnerabilities are considered and potentially trigger an update.
--In EXCEPTIONAL conditions, emergency updates may need to be applied.

The Django Security team has information on [How Django discloses security issues](https://docs.djangoproject.com/en/stable/internals/security/#how-django-discloses-security-issues).

When a library is under consideration, consider the "Security Health" of the library. How often it's updated? Does it have known vulnerabilities? Does it have an active community? etc. Some tools can help with this task (E.g. [Snyk Advisor](https://snyk.io/advisor/python))

### SAST Tools

There are several excellent open-source static analysis security tools for Python that are worth considering, including:

Bandit – [Bandit](https://bandit.readthedocs.io/en/latest/) is a tool designed to find common security issues in Python. Bandit processes each file, builds an Abstract Syntax Tree (AST) from it, and runs appropriate plugins against the AST nodes. Once Bandit has finished scanning all the files it generates a report. Bandit was originally developed within the OpenStack Security Project and later rehomed to PyCQA.

Semgrep – [Semgrep](https://semgrep.dev/) is a fast, open-source, static analysis engine for finding bugs, detecting vulnerabilities in third-party dependencies, and enforcing code standards. Developed by “Return To Corporation” (usually referred to as r2c) and open-source contributors. It works based on rules, which can focus on security, language best practices, or something else. Creating a rule is easy and semgrep is very powerful. For Django there are 29 rules.

PyCharm Security – [Pycharm-security](https://pycharm-security.readthedocs.io/en/latest/index.html) is a plugin for PyCharm, or JetBrains IDEs with the Python plugin. The plugin looks at Python code for common security vulnerabilities and suggests fixes. It can also be executed from a Docker container. It has about 40 checks and some are Django specific.

## FastAPI Security

> **Source:** [FastAPI Security](https://cheatsheetseries.owasp.org/cheatsheets/FastAPI_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

FastAPI is a Python web framework using the Asynchronous Server Gateway Interface (ASGI). This cheat sheet covers authentication dependencies, input and output models, and deployment controls, building on the [FastAPI security documentation](https://fastapi.tiangolo.com/tutorial/security/).

See the [REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) for general API controls.

Code snippets illustrate individual controls, not complete applications. They assume an existing FastAPI application and application-specific user and persistence functions; adapt and test them for your application.

### Dependency Injection and Access Control

Use FastAPI's dependency injection system, through `Depends()`, to enforce authentication and authorization consistently. Missing or insufficient dependencies can leave sensitive operations accessible to unauthorized users. See the [FastAPI dependencies tutorial](https://fastapi.tiangolo.com/tutorial/dependencies/).

#### OAuth2PasswordBearer Does Not Validate Tokens

The helper class `OAuth2PasswordBearer` checks the authorization scheme and extracts the bearer token from the `Authorization` header. It does **not validate the token or verify its signature**. An authentication dependency must verify the token and reject invalid credentials before returning a user. See the [OAuth2PasswordBearer reference](https://fastapi.tiangolo.com/reference/security/#fastapi.security.OAuth2PasswordBearer).

#### Scoping Authorization Dependencies

Authentication alone does not authorize an operation. Endpoints requiring elevated privileges, such as admin tasks, must also check the user's permissions. In this example, `get_current_user` is an authentication dependency that rejects invalid credentials.

```python
from fastapi import Depends, HTTPException, status

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted"
        )
    return current_user

@app.post("/admin/settings")
def update_settings(admin: User = Depends(get_admin_user)):
    return {"status": "success"}
```

#### Router-Level Deny-by-Default

Apply authentication dependencies to an entire `APIRouter` so new endpoints in that router inherit the check. This covers only that router's routes; sensitive operations still need permission checks.

```python
from fastapi import APIRouter, Depends

# Enforce authentication for all routes registered under this router by default
router = APIRouter(
    prefix="/items",
    dependencies=[Depends(get_current_user)]
)
```

### Secure Authentication and JWT Implementation

When using JSON Web Tokens (JWTs), developers are responsible for token verification and key management. The [FastAPI OAuth2 with JWT tutorial](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/) demonstrates verification with PyJWT.

#### Cryptographic Library Choice

- **Use PyJWT:** Delegate token verification to the library rather than writing custom parsing or cryptographic logic. Configure verification using the [PyJWT decoding API](https://pyjwt.readthedocs.io/en/latest/api.html#jwt.decode).

#### Key Claims Verification

- **Validate Required Claims:** Verify the signature and require `exp` (expiration), `iss` (issuer), and `aud` (audience) for authentication tokens. In PyJWT, use `options={"require": ["exp", "iss", "aud"]}` and supply the expected `issuer` and `audience`. Requiring a claim only checks its presence; keep the corresponding verification enabled. Validate `nbf` (not before) when present, and require it if your token profile calls for it.
- **Explicit Algorithms:** Configure the expected algorithm during decoding, for example `algorithms=["HS256"]` for tokens issued with that algorithm. Do not derive the accepted algorithms from the token's header.
- **Revocation and Replay:** Expiration bounds a token's lifetime. Checking a revocation blocklist rejects revoked tokens, but a stolen, still-active bearer token remains reusable. See the [JWT replay-protection guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html#replay-protection) for controls beyond expiration and revocation.

#### Cookie-Stored Refresh Tokens

- **Cookie Attributes:** If you store refresh tokens in cookies, set `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict` where compatible with your authentication flow. `HttpOnly` prevents JavaScript from reading the cookie; it does not prevent injected scripts from making authenticated requests.
- **CSRF Mitigations:** Browsers attach cookies automatically, introducing Cross-Site Request Forgery (CSRF) risk. Protect refresh and other state-changing endpoints with the defenses in the [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), such as validated CSRF tokens. Treat `SameSite` as defense in depth.

#### Signing Key Management

Never hardcode signing secrets or provide a default development key in production. Supply keys from deployment-managed secret storage; prefer a mounted secret file or retrieval from a secret manager, and use environment variables only when safer injection methods are unavailable. Pydantic Settings can read deployment-supplied configuration. Keep local `.env` files containing secrets out of source control. Follow the [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) for provisioning and rotation.

### Pydantic Validation and Input Hardening

Pydantic schemas validate data, but they do not replace authorization checks or prevent injection vulnerabilities. See the [Pydantic models documentation](https://docs.pydantic.dev/latest/concepts/models/).

#### Reject Unrecognized Fields

By default, Pydantic ignores undeclared input fields. Use `extra="forbid"` when the API should reject requests containing such fields instead of ignoring them:

```python
from pydantic import BaseModel, ConfigDict

class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    username: str
    password: str
```

#### Prevent Mass Assignment

Use separate, restricted input schemas (`UserCreate`, `UserUpdate`) that exclude server-controlled fields like `is_admin` or `id`. Persist only validated, allowed fields, not the raw request dictionary. `extra="forbid"` does not prevent clients from setting a sensitive field that you declared in the input schema. See the [Mass Assignment Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html).

#### Prevent Sensitive Data Exposure

Explicitly specify `response_model` in path decorators to filter database objects and exclude sensitive fields (e.g., `password_hash`) from responses. See [FastAPI Response Model documentation](https://fastapi.tiangolo.com/tutorial/response-model/).

```python
class UserResponse(BaseModel):
    username: str

@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate):
    # Application function must hash the password before storing it.
    return save_user_to_db(user)
```

#### Strict Typing

Pydantic can convert input values to the declared types, such as `"123"` to `123` for an `int` field. Where security decisions require an exact input type, use strict types such as `StrictInt` and `StrictBool` to reject unintended conversions.

#### Injection Countermeasure

Input validation does not prevent SQL injection. Use parameterized queries, including through Object-Relational Mapper (ORM) APIs that bind parameters. Never build raw SQL queries using string formatting with user input. See the [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).

### Cross-Origin Resource Sharing (CORS) Configuration

Incorrect CORS settings can expose private API responses to untrusted websites in a user's browser. CORS does not replace endpoint authorization or restrict non-browser clients. See the [FastAPI CORS documentation](https://fastapi.tiangolo.com/tutorial/cors/).

#### Restrictive CORS Settings

- **Explicit Origins:** When using `allow_credentials=True`, explicitly list trusted origins in `allow_origins`. Do not combine credentialed requests with `allow_origins=["*"]`.
- **Restrict Headers and Methods:** Limit `allow_methods` and `allow_headers` to only the verbs and headers your client application uses.
- For complete CORS design patterns, refer to the [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html).

### OpenAPI and Swagger UI Exposure

FastAPI exposes interactive documentation at `/docs` and `/redoc`, with the schema at `/openapi.json`. Decide whether this information should be public. The [conditional OpenAPI guidance](https://fastapi.tiangolo.com/how-to/conditional-openapi/#about-security-apis-and-docs) explains why hiding documentation does not secure the API operations themselves.

#### Hardening Documentation in Production

If the documentation is private, restrict access to both the documentation pages and schema, or disable them with `FastAPI(openapi_url=None)`. This prevents disclosure through those routes; authorization must still protect every API operation.

### Async Event Loop and Background Tasks

Blocking a worker's event loop prevents it from handling other requests, creating a Denial of Service (DoS) risk. See the [FastAPI async tutorial](https://fastapi.tiangolo.com/async/).

#### Event Loop Blocking

- Use asynchronous database and network clients inside `async def` routes. For synchronous libraries, use `def` routes or dependencies, which FastAPI runs in a thread pool. Ordinary helper functions called directly inside `async def` are not automatically moved to that pool.
- Move CPU-heavy or long-running work to a separate worker system, such as Celery. `BackgroundTasks` still runs in the application process; see the [background-task caveat](https://fastapi.tiangolo.com/tutorial/background-tasks/#caveat).

### Exception Handling and Information Leakage

Control which error details reach clients and logs. FastAPI supports [custom exception handlers](https://fastapi.tiangolo.com/tutorial/handling-errors/#override-request-validation-exceptions) for sanitizing validation responses.

#### Validation Error Leakage

Request validation errors can include submitted values and custom error details. Avoid reflecting passwords or tokens into responses or recording them in logs. In a `RequestValidationError` handler, return only safe field locations and error descriptions, or a generic message where necessary. Do not return `str(exc)` or the entire request body; these can include sensitive input or internal context.

### File Upload Security

FastAPI parses multipart uploads into `UploadFile` objects, which spool larger files to temporary disk storage. See the [UploadFile documentation](https://fastapi.tiangolo.com/tutorial/request-files/#uploadfile).

#### Upload Protections

- **Limit Payloads Before Parsing:** Set a request-body limit at the reverse proxy or gateway, for example Nginx's [`client_max_body_size`](https://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size). Ensure clients cannot bypass that layer. FastAPI [parses the form before running dependencies](https://github.com/fastapi/fastapi/blob/28a206107302ee20ce6a9a876d05a258c1c8d328/fastapi/routing.py#L438-L502); checking `UploadFile.size` in a dependency or endpoint does not protect against the resources already consumed during parsing.
- **Treat Metadata as Untrusted:** Do not use `UploadFile.filename` directly as a storage path or trust `content_type` as proof of file type. Apply the filename, content-validation, and storage controls in the [File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

### Rate Limiting

Apply request limits to reduce abuse of sensitive or expensive endpoints.

#### Mitigation Options

- Use a dedicated library like [slowapi](https://github.com/laurentS/slowapi) to implement route-specific rate limiting in code.
- With multiple workers or replicas, use a shared counter store, such as Redis, so limits apply across instances instead of independently in each process.
- Implement rate limiting at the reverse proxy (Nginx, HAProxy) or API gateway layer.

### ASGI Server Hardening

Configure the ASGI server's proxy trust explicitly so clients cannot spoof the client address or request scheme using forwarding headers. See the [Uvicorn HTTP settings](https://uvicorn.dev/settings/#http).

#### Deployment Configuration

- **Limit Proxy Forwarding:** Set `--forwarded-allow-ips` to the addresses of trusted reverse proxies and configure those proxies to overwrite untrusted forwarding headers. Avoid `--forwarded-allow-ips="*"`, which trusts every connecting client. Disable proxy-header handling with `--no-proxy-headers` if it is not needed.
- **Disable Server Header:** Use `--no-server-header` to suppress Uvicorn's default `Server` header. This removes one identifying header; it does not prevent other forms of server fingerprinting.

## Laravel

> **Source:** [Laravel](https://cheatsheetseries.owasp.org/cheatsheets/Laravel_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This *Cheatsheet* intends to provide security tips to developers building Laravel applications. It aims to cover all common vulnerabilities and how to ensure that your Laravel applications are secure.

The Laravel Framework provides in-built security features and is meant to be secure by default. However, it also provides additional flexibility for complex use cases. This means that developers unfamiliar with the inner workings of Laravel may fall into the trap of using complex features in a way that is not secure. This guide is meant to educate developers to avoid common pitfalls and develop Laravel applications in a secure manner.

### The Basics

- Make sure your app is not in debug mode while in production. To turn off debug mode, set your `APP_DEBUG` environment variable to `false`:

```ini
APP_DEBUG=false
```

- Make sure your application key has been generated. Laravel applications use the app key for symmetric encryption and SHA256 hashes such as cookie encryption, signed URLs, password reset tokens and session data encryption. To generate the app key, you may run the `key:generate` Artisan command:

```bash
php artisan key:generate
```

- Make sure your PHP configuration is secure. You may refer the [PHP Configuration Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html) for more information on secure PHP configuration settings.

- Set safe file and directory permissions on your Laravel application. In general, all Laravel directories should be setup with a max permission level of `775` and non-executable files with a max permission level of `664`. Executable files such as Artisan or deployment scripts should be provided with a max permission level of `775`.

- Make sure your application does not have vulnerable dependencies.

### Cookie Security and Session Management

By default, Laravel is configured in a secure manner. However, if you change your cookie or session configurations, make sure of the following:

- Enable the cookie encryption middleware if you use the `cookie` session store or if you store any kind of data that should not be readable or tampered with by clients. In general, this should be enabled unless your application has a very specific use case that requires disabling this. To enable this middleware, simply add the `EncryptCookies` middleware to the `web` middleware group in your `App\Http\Kernel` class:

```php
/**
 * The application's route middleware groups.
 *
 * @var array
 */
protected $middlewareGroups = [
    'web' => [
        \App\Http\Middleware\EncryptCookies::class,
        ...
    ],
    ...
];
```

- Enable the `HttpOnly` attribute on your session cookies via your `config/session.php` file, so that your session cookies are inaccessible from JavaScript:

```php
'http_only' => true,
```

- Unless cookies must be shared with subdomains, set `domain` to `null` in `config/session.php` to omit the Domain attribute. This restricts [where the browser sends that cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#domaindomain-value) to the setting host; it does not prevent sibling subdomains from setting same-name parent-domain cookies. For stronger protection against these cookie collisions, use a [`__Host-` session cookie](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#cookie-name-prefixes) with `Secure`, `Path=/`, and no Domain attribute on supporting browsers:

```php
'domain' => null,
```

- Set your `SameSite` cookie attribute to `lax` or `strict` in your `config/session.php` file to restrict your cookies to a first-party or same-site context:

```php
'same_site' => 'lax',
```

- If your application is HTTPS only, it is recommended to set the `secure` configuration option in your `config/session.php` file to `true` to protect against man-in-the-middle attacks. If your application has a combination of HTTP and HTTPS, then it is recommended to set this value to `null` so that the secure attribute is set automatically when serving HTTPS requests:

```php
'secure' => null,
```

- Ensure that you have a low session idle timeout value. [OWASP recommends](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) a 2-5 minutes idle timeout for high value applications and 15-30 minutes for low risk applications. This can be configured in your `config/session.php` file:

```php
'lifetime' => 15,
```

You may also refer the [Cookie Security Guide](https://owasp.org/www-chapter-london/assets/slides/OWASPLondon20171130_Cookie_Security_Myths_Misconceptions_David_Johansson.pdf) to learn more about cookie security and the cookie attributes mentioned above.

### Authentication

#### Guards and Providers

At its core, Laravel's authentication facilities are made up of "guards" and "providers". Guards define how users are authenticated for each request. Providers define how users are retrieved from your persistent storage.

Laravel ships with a `session` guard which maintains state using session storage and cookies, and a `token` guard for API tokens.

For providers, Laravel ships with a `eloquent` provider for retrieving users using the Eloquent ORM and the `database` provider for retrieving users using the database query builder.

Guards and providers can be configured in the `config/auth.php` file. Laravel offers the ability to build custom guards and providers as well.

#### Starter Kits

Laravel offers a wide variety of first party application starter kits that include in-built authentication features:

1. [Laravel Breeze](https://laravel.com/docs/8.x/starter-kits#laravel-breeze): A simple, minimal implementation of all Laravel's authentication features including login, registration, password reset, email verification and password confirmation.
2. [Laravel Fortify](https://laravel.com/docs/fortify): A headless authentication backend that includes the above authentication features along with two-factor authentication.
3. [Laravel Jetstream](https://jetstream.laravel.com/): An application starter kit that provides a UI on top of Laravel Fortify's authentication features.

It is recommended to use one of these starter kits to ensure robust and secure authentication for your Laravel applications.

#### API Authentication Packages

Laravel also offers the following API authentication packages:

1. [Passport](https://laravel.com/docs/passport): An OAuth2 authentication provider.
2. [Sanctum](https://laravel.com/docs/sanctum): An API token authentication provider.

Starter kits such as Fortify and Jetstream have in-built support for Sanctum.

### Mass Assignment

[Mass assignment](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html) is a common vulnerability in modern web applications that use an ORM like Laravel's Eloquent ORM.

A mass assignment is a vulnerability where an ORM pattern is abused to modify data items that the user should not be normally allowed to modify.

Consider the following code:

```php
Route::any('/profile', function (Request $request) {
    $request->user()->forceFill($request->all())->save();

    $user = $request->user()->fresh();

    return response()->json(compact('user'));
})->middleware('auth');
```

The above profile route allows the logged in user to change their profile information.

However, let's say there is an `is_admin` column in the users table. You probably do not want the user to be allowed to change the value of this column. However, the above code allows users to change any column values for their row in the users table. This is a mass assignment vulnerability.

Laravel has in-built features by default to protect against this vulnerability. Make sure of the following to stay secure:

- Qualify the allowed parameters that you wish to update using `$request->only` or `$request->validated` rather than `$request->all`.
- Do not unguard models or set the `$guarded` variable to an empty array. By doing this, you are actually disabling Laravel's in-built mass assignment protection.
- Avoid using methods such as `forceFill` or `forceCreate` that bypass the protection mechanism. You may however use these methods if you are passing in a validated array of values.

### SQL Injection

SQL Injection attacks are unfortunately quite common in modern web applications and entail attackers providing malicious request input data to interfere with SQL queries. This guide covers SQL injection and how it can be prevented specifically for Laravel applications. You may also refer the [SQL Injection Prevention Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) for more information that is not specific to Laravel.

#### Eloquent ORM SQL Injection Protection

By default, Laravel's Eloquent ORM protects against SQL injection by parameterizing queries and using SQL bindings. For instance, consider the following query:

```php
use App\Models\User;

User::where('email', $email)->get();
```

The code above fires the query below:

```sql
select * from `users` where `email` = ?
```

So, even if `$email` is untrusted user input data, you are protected from SQL injection attacks.

#### Raw Query SQL Injection

Laravel also offers raw query expressions and raw queries to construct complex queries or database specific queries that aren't supported out of the box.

While this is great for flexibility, you must be careful to always use SQL data bindings for such queries. Consider the following query:

```php
use Illuminate\Support\Facades\DB;
use App\Models\User;

User::whereRaw('email = "'.$request->input('email').'"')->get();
DB::table('users')->whereRaw('email = "'.$request->input('email').'"')->get();
```

Both lines of code actually execute the same query, which is vulnerable to SQL injection as the query does not use SQL bindings for untrusted user input data.

The code above fires the following query:

```sql
select * from `users` where `email` = "value of email query parameter"
```

Always remember to use SQL bindings for request data. We can fix the above code by making the following modification:

```php
use App\Models\User;

User::whereRaw('email = ?', [$request->input('email')])->get();
```

We can even use named SQL bindings like so:

```php
use App\Models\User;

User::whereRaw('email = :email', ['email' => $request->input('email')])->get();
```

#### Column Name SQL Injection

You must never allow user input data to dictate column names referenced by your queries.

The following queries may be vulnerable to SQL injection:

```php
use App\Models\User;

User::where($request->input('colname'), 'somedata')->get();
User::query()->orderBy($request->input('sortBy'))->get();
```

It is important to note that even though Laravel has some in-built features such as wrapping column names to protect against the above SQL injection vulnerabilities, some database engines (depending on versions and configurations) may still be vulnerable because binding column names is not supported by databases.

At the very least, this may result in a mass assignment vulnerability instead of a SQL injection because you may have expected a certain set of column values, but since they are not validated here, the user is free to use other columns as well.

Always validate user input for such situations like so:

```php
use App\Models\User;

$request->validate(['sortBy' => 'in:price,updated_at']);
User::query()->orderBy($request->validated()['sortBy'])->get();
```

#### Validation Rule SQL Injection

Certain validation rules have the option of providing database column names. Such rules are vulnerable to SQL injection in the same manner as column name SQL injection because they construct queries in a similar manner.

For example, the following code may be vulnerable:

```php
use Illuminate\Validation\Rule;

$request->validate([
    'id' => Rule::unique('users')->ignore($id, $request->input('colname'))
]);
```

Behind the scenes, the above code triggers the following query:

```php
use App\Models\User;

$colname = $request->input('colname');
User::where($colname, $request->input('id'))->where($colname, '<>', $id)->count();
```

Since the column name is dictated by user input, it is similar to column name SQL injection.

### Cross Site Scripting (XSS)

[XSS attacks](https://owasp.org/www-community/attacks/xss/) are injection attacks where malicious scripts (such as JavaScript code snippets) are injected into trusted websites.

Laravel's [Blade echo statements](https://laravel.com/framework/docs/blade#displaying-data) `{{ }}` HTML-escape ordinary string values using `htmlspecialchars`. This is appropriate for HTML text and quoted ordinary text attributes, but does not validate URL schemes or encode JavaScript or CSS contexts.

Laravel also offers displaying unescaped data using the unescaped syntax `{!! !!}`. This must not be used on any untrusted data, otherwise your application will be subject to an XSS attack.

For instance, if you have something like this in any of your Blade templates, it would result in a vulnerability:

```blade
{!! request()->input('somedata') !!}
```

For example, render untrusted text inside an ordinary HTML element:

```blade
<span>{{ request()->input('somedata') }}</span>
```

For data embedded in JavaScript, follow Laravel's [`Js::from` guidance](https://laravel.com/framework/docs/blade#rendering-json). For URLs, CSS, and other output contexts, follow the [Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

### Unrestricted File Uploads

Unrestricted file upload attacks entail attackers uploading malicious files to compromise web applications. This section describes how to protect against such attacks while building Laravel applications. You may also refer the [File Upload Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) to learn more.

#### Always Validate File Type and Size

Validate allowed file types and impose a maximum file size as one layer of protection. This illustrative rule uses [`max`](https://laravel.com/framework/docs/12.x/validation#rule-max) to cap the file size rather than requiring an exact size:

```php
$request->validate([
    'photo' => 'file|max:100|mimes:jpg,bmp,png'
]);
```

Storage DOS attacks exploit missing file size validations and upload massive files to cause a denial of service (DOS) by exhausting the disk space.

Remote code execution attacks entail first, uploading malicious executable files (such as PHP files) and then, triggering their malicious code by visiting the file URL (if public).

These validations alone do not prevent either attack. Laravel's [`mimes` rule](https://laravel.com/framework/docs/12.x/validation#rule-mimes) infers type from content; it does not validate the user-supplied extension or make the file safe to execute. Generate stored filenames, keep uploads outside the webroot or on a separate host, and ensure uploaded files cannot be executed by the server. Bound aggregate storage and upload frequency as well as individual file size. Follow the [File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html#file-upload-protection) for the remaining controls.

#### Do Not Rely On User Input To Dictate Filenames or Path

If your application allows user controlled data to construct the path of a file upload, this may result in overwriting a critical file or storing the file in a bad location.

Consider the following code:

```php
Route::post('/upload', function (Request $request) {
    $request->file('file')->storeAs(auth()->id(), $request->input('filename'));

    return back();
});
```

This route saves a file to a directory specific to a user ID. Here, we rely on the `filename` user input data and this may result in a vulnerability as the filename could be something like `../2/filename.pdf`. This will upload the file in user ID 2's directory instead of the directory pertaining to the current logged in user.

To fix this, we should use the `basename` PHP function to strip out any directory information from the `filename` input data:

```php
Route::post('/upload', function (Request $request) {
    $request->file('file')->storeAs(auth()->id(), basename($request->input('filename')));

    return back();
});
```

#### Avoid Processing ZIP or XML Files If Possible

XML files can expose your application to a wide variety of attacks such as XXE attacks, the billion laughs attack and others. If you process ZIP files, you may be exposed to zip bomb DOS attacks.

Refer the [XML Security Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/XML_Security_Cheat_Sheet.html) and the [File Upload Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) to learn more.

### Path Traversal

A path traversal attack aims to access files by manipulating request input data with `../` sequences and variations or by using absolute file paths.

If you allow users to download files by filename, you may be exposed to this vulnerability if input data is not stripped of directory information.

Consider the following code:

```php
Route::get('/download', function(Request $request) {
    return response()->download(storage_path('content/').$request->input('filename'));
});
```

Here, the filename is not stripped of directory information, so a malformed filename such as `../../.env` could expose your application credentials to potential attackers.

Similar to unrestricted file uploads, you should use the `basename` PHP function to strip out directory information like so:

```php
Route::get('/download', function(Request $request) {
    return response()->download(storage_path('content/').basename($request->input('filename')));
});
```

### Open Redirection

Open Redirection attacks in themselves are not that dangerous but they enable phishing attacks.

Consider the following code:

```php
Route::get('/redirect', function (Request $request) {
   return redirect($request->input('url'));
});
```

This code redirects the user to any external URL provided by user input. This could enable attackers to create seemingly safe URLs like `https://example.com/redirect?url=http://evil.com`. For instance, attackers may use a URL of this type to spoof password reset emails and lead victims to expose their credentials on the attacker's website.

### Cross Site Request Forgery (CSRF)

[Cross-Site Request Forgery (CSRF)](https://owasp.org/www-community/attacks/csrf) is a type of attack that occurs when a malicious web site, email, blog, instant message, or program causes a user's web browser to perform an unwanted action on a trusted site when the user is authenticated.

Laravel provides CSRF protection out-of-the-box with the `VerifyCSRFToken` middleware. Generally, if you have this middleware in the `web` middleware group of your `App\Http\Kernel` class, you should be well protected:

```php
/**
 * The application's route middleware groups.
 *
 * @var array
 */
protected $middlewareGroups = [
    'web' => [
        ...
         \App\Http\Middleware\VerifyCsrfToken::class,
         ...
    ],
];
```

Next, for all your `POST` request forms, you may use the `@csrf` blade directive to generate the hidden CSRF input token fields:

```html
<form method="POST" action="/profile">
    @csrf

    <!-- Equivalent to... -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

For AJAX requests, you can setup the [X-CSRF-Token header](https://laravel.com/docs/csrf#csrf-x-csrf-token).

Laravel also provides the ability to exclude certain routes from CSRF protection using the `$except` variable in your CSRF middleware class. Typically, you would want to exclude only stateless routes (e.g. APIs or webhooks) from CSRF protection. If any other routes are excluded, these may result in CSRF vulnerabilities.

### Command Injection

Command Injection vulnerabilities involve executing shell commands constructed with unescaped user input data.

For example, the following code performs a `whois` on a user provided domain name:

```php
public function verifyDomain(Request $request)
{
    exec('whois '.$request->input('domain'));
}
```

Avoid invoking operating-system commands when a PHP library can perform the operation. If a process is required, keep the executable fixed and pass arguments separately using [Symfony Process with an argument array](https://symfony.com/doc/current/components/process.html#using-features-from-the-os-shell). Validate the domain against the expected format before passing it to `whois`; argument separation does not stop a value from being interpreted as a command option. See [Argument Injection](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html#argument-injection) for this remaining risk.

Do not use [`escapeshellcmd()`](https://www.php.net/manual/en/function.escapeshellcmd.php) as a substitute for separating arguments: it still permits extra arguments. If shell invocation is unavoidable, [`escapeshellarg()`](https://www.php.net/manual/en/function.escapeshellarg.php) escapes a single argument, but you must still validate its meaning to the called program.

### Other Injections

Object injection, eval code injection and extract variable hijacking attacks involve unserializing, evaluating or using the `extract` function on untrusted user input data.

Some examples are:

```php
unserialize($request->input('data'));
eval($request->input('data'));
extract($request->all());
```

In general, avoid passing any untrusted input data to these dangerous functions.

### Rate Limiting

Laravel provides built-in mechanisms to protect your routes from excessive requests and potential abuse.

The two main ways to implement rate limiting are:

1. **`throttle` middleware** – A built-in middleware that you can apply directly to routes or route groups.
2. **`RateLimiter::for()`** – Allows you to define custom rate limiting rules with more flexibility.

Below are the main ways to apply rate limiting effectively:

#### 1. Per Route

Apply a limit directly to a single route using the `throttle` middleware:

```php
Route::get('/profile', function () {
    return 'User profile';
})->middleware('throttle:10,1'); // 10 requests per minute
```

#### 2. Per Route Group

Apply a limit to a group of routes:

```php
Route::middleware('throttle:20,1')->group(function () {
    Route::get('/posts', fn () => 'Posts');
    Route::get('/comments', fn () => 'Comments');
});
```

#### 3. Custom Rate Limiter

Define a custom rate limiter in `RouteServiceProvider` using `RateLimiter::for()`:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('custom-limit', function ($request) {
    return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
});
```

Apply the custom limiter to your routes:

```php
Route::middleware('throttle:custom-limit')->get('/dashboard', fn () => 'Dashboard');
```

#### 4. Global API / Web Rate Limiting

Laravel allows you to apply global rate limiting to entire route groups like `api` or `web` by including the `throttle` middleware in `Kernel.php` (note that the `api` group is rate-limited by default).

```php
protected $middlewareGroups = [
    'api' => [
        'throttle:60,1', // 60 requests per minute globally for API
        // ...
    ],

    'web' => [
        'throttle:30,1', // 30 requests per minute globally for web
        // ...
    ],
];
```

For more details, see the official Laravel documentation on [rate limiting](https://laravel.com/docs/12.x/routing#rate-limiting).

### Security Headers

You should consider adding the following security headers to your web server or Laravel application middleware:

- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (for HTTPS only applications)
- Content-Security-Policy

For more information, refer the [OWASP secure headers project](https://owasp.org/www-project-secure-headers/).

## PHP Configuration

> **Source:** [PHP Configuration](https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This page is meant to help those configuring PHP and the web server it is running on to be very secure.

Below you will find information on the proper settings for the `php.ini` file and instructions on configuring Apache, Nginx, and Caddy web servers.

For general PHP codebase security please refer to the two following great guides:

- [Paragonie's 2018 PHP Security Guide](https://paragonie.com/blog/2017/12/2018-guide-building-secure-php-software)
- [Awesome PHP Security](https://github.com/guardrailsio/awesome-php-security)

### PHP Configuration and Deployment

#### php.ini

Some of following settings need to be adapted to your system, in particular `session.save_path`, `session.cookie_path` (e.g. `/var/www/mysite`), and `session.cookie_domain` (e.g. `ExampleSite.com`).

Run a PHP branch that is listed on the official [Supported Versions](https://www.php.net/supported-versions.php) page and plan upgrades before its security-support end date. Distribution vendors may provide separate extended support, but that does not make the upstream PHP branch supported. Review the [core `php.ini` directives](https://www.php.net/manual/ini.core.php) in the PHP Manual for a complete reference on every value in the `php.ini` configuration file.

You can find a copy of the following values in a [ready-to-go `php.ini` file here](https://github.com/danehrlich1/very-secure-php-ini).

##### PHP error handling

```text
expose_php              = Off
error_reporting         = E_ALL
display_errors          = Off
display_startup_errors  = Off
log_errors              = On
error_log               = /valid_path/PHP-logs/php_error.log
ignore_repeated_errors  = Off
```

Keep in mind that you need to have `display_errors` to `Off` on a production server and it's a good idea to frequently notice the logs.

##### PHP general settings

```text
doc_root                = /path/DocumentRoot/PHP-scripts/
open_basedir            = /path/DocumentRoot/PHP-scripts/
include_path            = /path/PHP-pear/
extension_dir           = /path/PHP-extensions/
mime_magic.magicfile    = /path/PHP-magic.mime
allow_url_fopen         = Off
allow_url_include       = Off
variables_order         = "GPCS"
allow_webdav_methods    = Off
session.gc_maxlifetime  = 600
```

`allow_url_*` prevents [LFI](https://www.acunetix.com/blog/articles/local-file-inclusion-lfi/)s to be easily escalated to [RFI](https://www.acunetix.com/blog/articles/remote-file-inclusion-rfi/)s.

##### PHP file upload handling

```text
file_uploads            = On
upload_tmp_dir          = /path/PHP-uploads/
upload_max_filesize     = 2M
max_file_uploads        = 2
```

If your application is not using file uploads, and say the only data the user will enter / upload is forms that do not require any document attachments, `file_uploads` should be turned `Off`.

##### PHP executable handling

```text
enable_dl               = Off
disable_functions       = system, exec, shell_exec, passthru, phpinfo, show_source, highlight_file, popen, proc_open, fopen_with_path, dbmopen, dbase_open, putenv, move_uploaded_file, chdir, mkdir, rmdir, chmod, rename, filepro, filepro_rowcount, filepro_retrieve, posix_mkfifo
disable_classes         =
```

These are dangerous PHP functions. You should disable all that you don't use.

##### PHP session handling

Session settings are some of the MOST important values to concentrate on in configuring. It is a good practice to change `session.name` to something new.

```text
 session.save_path                = /path/PHP-session/
 session.name                     = myPHPSESSID
 session.auto_start               = Off
 session.use_trans_sid            = 0
 session.cookie_domain            = full.qualified.domain.name
 #session.cookie_path             = /application/path/
 session.use_strict_mode          = 1
 session.use_cookies              = 1
 session.use_only_cookies         = 1
 session.cookie_lifetime          = 14400 # 4 hours
 session.cookie_secure            = 1
 session.cookie_httponly          = 1
 session.cookie_samesite          = Strict
 session.cache_expire             = 30
 session.sid_length               = 256
 session.sid_bits_per_character   = 6
```

##### Some more security paranoid checks

```text
session.referer_check   = /application/path
memory_limit            = 50M
post_max_size           = 20M
max_execution_time      = 60
report_memleaks         = On
html_errors             = Off
zend.exception_ignore_args = On
```

#### Snuffleupagus

[Snuffleupagus](https://snuffleupagus.readthedocs.io) is the spiritual
descendent of Suhosin for PHP 7 and onwards, with [modern
features](https://snuffleupagus.readthedocs.io/features.html). It's considered
stable, and is usable in production.

## Symfony

> **Source:** [Symfony](https://cheatsheetseries.owasp.org/cheatsheets/Symfony_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet aims to provide developers with security tips when building applications using the Symfony framework.
It covers common vulnerabilities and best practices to ensure that your Symfony applications are secure.

While Symfony comes with built-in security mechanisms, developers must be aware of potential vulnerabilities and best practices to ensure the applications they build are secure.
This guide aims to cover common security issues, emphasizing the importance of understanding Symfony's security features and how to utilize them effectively.
Whether you're a newcomer to Symfony or an experienced developer looking to reinforce your security practices, this document serves as a valuable resource.
By following the guidelines outlined here, you can strengthen the security of your Symfony applications and create a safer digital environment for users and data.

### Main Sections

#### Cross-Site Scripting (XSS)

Cross-Site Scripting (XSS) is a type of attack where malicious JavaScript code is injected into a displayed variable.
For example, if the value of the variable name is `<script>alert('hello')</script>`, and we display it in HTML like this: `Hello {{name}}`, the injected script will be executed when the HTML is rendered.

Symfony comes by default with twig templates that automatically protect applications from XSS attacks by using **output escaping** to transform variables containing special characters by wrapping the variable with `{{ }}` statement.

```twig
<p>Hello {{name}}</p>
{# if 'name' is '<script>alert('hello!')</script>', Twig will output this:
'<p>Hello &lt;script&gt;alert(&#39;hello!&#39;)&lt;/script&gt;</p>' #}
```

If you are rendering a variable that is trusted and contains HTML contents, you can use *Twig raw filter* to disable output escaping.

```twig
<p>{{ product.title|raw }}</p>
{# if 'product.title' is 'Lorem <strong>Ipsum</strong>', Twig will output
exactly that instead of 'Lorem &lt;strong&gt;Ipsum&lt;/strong&gt;' #}
```

Explore the [Twig output escaping documentation](https://twig.symfony.com/doc/3.x/api.html#escaper-extension) to gain insights into disabling output escaping for a specific block or an entire template.

For other information on XSS prevention that is not specific to Symfony, you may refer to the [Cross Site Scripting Prevention Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

#### Cross-Site Request Forgery (CSRF)

Symfony Form component automatically includes CSRF tokens in the forms, providing built-in protection against CSRF attacks.
Symfony validates these tokens automatically, eliminating the need for manual intervention to safeguard your application.

By default the CSRF token is added as a hidden field called `_token`, but this can be customized with other settings on a form-by-form basis:

```php
use Symfony\Component\Form\AbstractType;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PostForm extends AbstractType
{

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            // ...
            'csrf_protection' => true,  // enable/disable csrf protection for this form
            'csrf_field_name' => '_csrf_token',
            'csrf_token_id'   => 'post_item', // change arbitrary string used to generate
        ]);
    }

}
```

If you do not use Symfony Forms, follow Symfony's [manual CSRF token generation and validation](https://symfony.com/doc/current/security/csrf.html#generating-and-checking-csrf-tokens-manually). First, install the `symfony/security-csrf` component:

```bash
composer require symfony/security-csrf
```

Enable CSRF protection in `config/packages/framework.yaml`:

```yaml
framework:
    csrf_protection: true
```

Next, consider this HTML Twig template when a CSRF token is generated by the `csrf_token()` Twig function

```twig
<form action="{{ url('delete_post', { id: post.id }) }}" method="post">
    <input type="hidden" name="token" value="{{ csrf_token('delete-post') }}">
    <button type="submit">Delete post</button>
</form>
```

Configure the `delete_post` route to accept `POST`, matching the form. At the start of its controller action, validate the submitted token with the same token ID (`delete-post`) used by Twig. Reject a missing or invalid token before performing any state change:

```php
$token = $request->request->get('token');
if (!is_string($token) || !$this->isCsrfTokenValid('delete-post', $token)) {
    throw $this->createAccessDeniedException('Invalid CSRF token.');
}
```

This illustrative check assumes an `AbstractController` action with a `Request` argument named `$request`. CSRF validation does not authorize deletion: check the caller's permission for the target post separately before deleting it.

You can find more information about CSRF not related to Symfony in [Cross-Site Request Forgery (CSRF) Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

#### SQL Injection

SQL Injection is a type of security vulnerability that occurs when an attacker is able to manipulate a SQL query in a way that it can execute arbitrary SQL code.
This can allow attackers to view, modify, or delete data in the database, potentially leading to unauthorized access or data loss.

Symfony, particularly when used with Doctrine ORM (Object-Relational Mapping), provides protection against SQL injection through prepared statements parameters.
Thanks to this it is harder to mistakenly write unprotected queries, however, it is still possible.
The following example shows **insecure DQL usage**:

```php
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ExampleController extends AbstractController {

    public function getPost(Request $request, EntityManagerInterface $em): Response
    {
        $id = $request->query->get('id');

        $dql = "SELECT p FROM App\Entity\Post p WHERE p.id = " . $id . ";";
        $query = $em->createQuery($dql);
        $post = $query->getSingleResult();

        // ...
    }
}

```

The examples below show the **correct ways** to provide protection against SQL Injection:

- Using entity repository built-in method

```php
$id = $request->query->get('id');
$post = $em->getRepository(Post::class)->findOneBy(['id' => $id]);
```

- Using Doctrine DQL Language

```php
$query = $em->createQuery("SELECT p FROM App\Entity\Post p WHERE p.id = :id");
$query->setParameter('id', $id);
$post = $query->getSingleResult();
```

- Using DBAL Query Builder

```php
$qb = $em->createQueryBuilder();
$post = $qb->select('p')
            ->from('posts','p')
            ->where('id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getSingleResult();
```

For more information about Doctrine, you can refer to [their documentation](https://www.doctrine-project.org/index.html).
You may also refer to the [SQL Injection Prevention Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) for more information that is not specific to either Symfony or Doctrine.

#### Command Injection

Command Injection occurs when malicious code is injected into an application system and executed.
For more information refer to [Command Injection Defense Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html).

Consider the following example, where a file is removed using the exec() function without any input escaping:

```php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Annotation\Route;

#[AsController]
class ExampleController
{

    #[Route('/remove_file', methods: ['POST'])]
    public function removeFile(Request $request): Response
    {
        $filename =  $request->request->get('filename');
        exec(sprintf('rm %s', $filename));

        // ...
    }
}
```

In the above code, there is no validation of the user's input. Imagine what could happen if the user provides a malicious value like `test.txt && rm -rf .` . To mitigate this risk, it is advisable to use native PHP functions like in this case `unlink()` or Symfony Filesystem Component `remove()` method instead of `exec()`.

For specific PHP filesystem functions relevant to your case, you can refer to the [PHP documentation](https://www.php.net/manual/en/refs.fileprocess.file.php) or [Symfony Filesystem Component documentation](https://symfony.com/doc/current/components/filesystem.html).

#### Open Redirection

Open Redirection is a security flaw that occurs when a web application redirects users to a URL specified in an invalidated parameter. Attackers exploit this vulnerability to redirect users to malicious sites.

In the provided PHP code snippet:

```php
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Annotation\Route;

class ExampleController extends AbstractController
{

    #[Route('/dynamic_redirect', methods: ['GET'])]
    public function dynamicRedirect(#[MapQueryParameter] string $url): Response
    {
        return $this->redirect($url);
    }
}
```

The controller function redirects users based on the `url` query parameter without proper validation. Attackers can craft malicious URLs, leading unsuspecting users to malicious sites. To prevent open redirection, always validate and sanitize user input before redirection, and avoid using untrusted input directly in redirect functions.

#### File Upload Vulnerabilities

File upload vulnerabilities are security issues that arise when an application does not properly validate and handle file uploads. It's important to ensure that file uploads are handled securely to prevent various types of attacks. Here are some general guidelines to help mitigate this issue in Symfony:

##### Validate file type and size

Always validate the file type on the server side to ensure that only allowed file types are accepted. See the [Symfony validation documentation](https://symfony.com/doc/current/validation.html).
Also, consider limiting the size of uploaded files to prevent denial-of-service attacks and to ensure that your server has enough resources to handle the uploads.

Example with PHP Attributes:

```php
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints\File;

class UploadDto
{
    public function __construct(
        #[File(
            maxSize: '1024k',
            mimeTypes: [
                'application/pdf',
                'application/x-pdf',
            ],
        )]
        public readonly UploadedFile $file,
    ){}
}
```

Example with Symfony Form:

```php
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\File;

class FileForm extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('file', FileType::class, [
                'constraints' => [
                    new File([
                        'maxSize' => '1024k',
                        'mimeTypes' => [
                            'application/pdf',
                            'application/x-pdf',
                        ],
                    ]),
                ],
            ]);
    }
}
```

##### Use unique filenames

Ensure that each uploaded file has a unique name to prevent overwriting existing files. You can use a combination of a unique identifier and the original filename to generate a unique name.

##### Store uploaded files securely

Store uploaded files outside the public directory to prevent direct access. If you use a public directory to store them, configure your web server to deny access to the upload directory.

Refer to the [File Upload Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) to learn more.

#### Directory Traversal

A directory or path traversal attack aims to access files and directories that are stored on a server by manipulating input data that reference files with “../” *dot-dot-slash* sequences and its variations or by using absolute file paths.
For more details refer to [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal).

You can protect your application from a directory traversal attack by validating whether the absolute path of the requested file location is correct or strip out the directory information from filename input.

- Resolve the base directory and requested path with [`realpath()`](https://www.php.net/manual/en/function.realpath.php), rejecting failures. Include the directory separator in the containment check so a sibling such as `/storage-private` cannot match `/storage`.

```php
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Annotation\Route;

class ExampleController extends AbstractController
{

    #[Route('/download', methods: ['GET'])]
    public function download(#[MapQueryParameter] string $filename): Response
    {
        $storagePath = $this->getParameter('kernel.project_dir') . '/storage';
        $filePath = $storagePath . '/' . $filename;

        $realBase = realpath($storagePath);
        $realPath = realpath($filePath);

        if ($realBase === false || $realPath === false
            || !str_starts_with($realPath, $realBase . DIRECTORY_SEPARATOR))
        {
            throw $this->createNotFoundException();
        }

        // Use $realPath for the authorized file operation.

    }
}
```

This illustrative check assumes untrusted users cannot change the directories or symbolic links between validation and file access. Check the caller's permission to access the resolved file separately.

- Strip out directory information with PHP *basename* function

```php
// ...

$storagePath = $this->getParameter('kernel.project_dir') . '/storage';
$filePath = $storagePath . '/' . basename($filename);

// ...
```

#### Dependencies vulnerabilities

Dependency vulnerabilities can expose your application to various risks, making it crucial to adopt best practices.
Keep all Symfony components and third-party libraries up-to-date.

Composer, the dependency manager for PHP makes it easy to update PHP packages:

```bash
composer update
```

When using multiple dependencies, some of them may contain security vulnerabilities.
To address this concern, Symfony comes with [Symfony Security Checker](https://symfony.com/doc/current/setup.html#checking-security-vulnerabilities). This tool specifically examines the *composer.lock* file in your project to identify any known security vulnerabilities within the dependencies that have been installed and address any potential security issues in your Symfony project.

To use Security Checker run the following command using [Symfony CLI](https://github.com/symfony-cli/symfony-cli):

```bash
symfony check:security
```

#### Cross-Origin Resource Sharing (CORS)

CORS is a security feature implemented in web browsers to control how web applications in one domain can request and interact with resources hosted on other domains.

In Symfony, you can manage CORS policies using `nelmio/cors-bundle`. This bundle lets you control CORS rules precisely without changing your server settings.

To install it with Composer, run:

```bash
composer require nelmio/cors-bundle
```

For Symfony Flex users, the installation generates a basic configuration file in the `config/packages` directory automatically. Take a look at the example configuration for routes starting with */API* prefix.

```yaml
# config/packages/nelmio_cors.yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['*']
        allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
        allow_headers: ['*']
        expose_headers: ['Link']
        max_age: 3600
    paths:
        '^/api': ~  # ~ means that configurations for this path is inherited from defaults
```

#### Security-related Headers

It's advisable to enhance the security of your Symfony application by adding to your responses essential security headers as:

- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- Content-Security-Policy
- X-Permitted-Cross-Domain-Policies
- Referrer-Policy
- Clear-Site-Data
- Cross-Origin-Embedder-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy
- Cache-Control

To find more details about individual headers refer to the [OWASP secure headers project](https://owasp.org/www-project-secure-headers/).

In Symfony, you can add those headers either manually or automatically by listening the [ResponseEvent](https://symfony.com/doc/current/reference/events.html#kernel-response) to your to every response or configuring web servers like Nginx or Apache.

```php
use Symfony\Component\HttpFoundation\Request;

$response = new Response();
$response->headers->set('X-Frame-Options', 'SAMEORIGIN');
```

#### Session & Cookies Management

Configure session cookies under `framework.session` in `config/packages/framework.yaml`. For an HTTPS application, explicitly set [`cookie_secure: true`](https://symfony.com/doc/current/reference/configuration/framework.html#cookie-secure); `auto` sets it to `false` for HTTP requests and does not guarantee secure cookies. Keep [`cookie_httponly: true`](https://symfony.com/doc/current/reference/configuration/framework.html#cookie-httponly) to prevent JavaScript from reading the cookie.

```yaml
framework:
    session:
        cookie_secure: true
        cookie_httponly: true
        cookie_samesite: lax
```

Use `cookie_samesite: lax`, or `strict` where the application's navigation flows permit it. [SameSite restricts cross-site cookie sending](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value); it does not isolate all origins. For example, sibling subdomains with the same scheme can be [same-site](https://developer.mozilla.org/en-US/docs/Glossary/Site). Retain CSRF protection for state-changing requests.

[`cookie_lifetime`](https://symfony.com/doc/current/reference/configuration/framework.html#cookie-lifetime) is measured in seconds: `5` means five seconds, not five minutes. Cookie expiration does not enforce a server-side session timeout. Implement server-side idle and absolute expiration as described in the [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#automatic-session-expiration).

---
In Symfony, sessions are managed by the framework itself and rely on Symfony's session handling mechanisms rather than PHP's default session handling via the `session.auto_start = 1` directive in the php.ini file.
The `session.auto_start = 1` directive in PHP is used to automatically start a session on each request, bypassing explicit calls to `session_start()`. However, when using Symfony for session management, it's recommended to disable `session.auto_start` to prevent conflicts and unexpected behavior.

#### Authentication

[Symfony Security](https://symfony.com/doc/current/security.html) provides a robust authentication system that includes providers, firewalls, and access controls to ensure a secure and controlled access environment. Authentication settings can be configured in `config/packages/security.yaml`.

- **Providers**

    Symfony authentication relies on providers to fetch user information from various storage types such as databases, LDAP, or custom sources. Providers get users based on the defined property and load the corresponding user object.

    In the example below [Entity User Provider](https://symfony.com/doc/current/security/user_providers.html#security-entity-user-provider) is presented which uses Doctrine to fetch user by unique identifier.

    ```yaml
    providers:
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email
    ```

- **Firewalls**

    Symfony uses firewalls to define security configurations for different parts of an application. Each firewall defines a specific set of rules and actions for incoming requests. They protect different sections of the application by specifying which routes or URLs are secured, the authentication mechanisms to use, and how to handle unauthorized access. A firewall can be associated with specific patterns, request methods, access controls, and authentication providers.

    ```yaml
    firewalls:
        dev: # disable security on routes used in development env
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false
        admin: # handle authentication in /admin pattern routes
            lazy: true
            provider: app_user_provider
            pattern: ^/admin
            custom_authenticator: App\Security\AdminAuthenticator
            logout:
                path: app_logout
                target: app_login
        main: # main firewall that include all remaining routes
            lazy: true
            provider: app_user_provider
    ```

- **Access Control**

    Access control determines which users can access specific parts of an application. These rules consist of path patterns and required roles or permissions. Access control rules are configured under `access_control` key.

    ```yaml
    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN } # only user with ROLE_ADMIN role is allowed
        - { path: ^/login, roles: PUBLIC_ACCESS } # everyone can access this route
    ```

#### Error Handling Disclosure

Symfony has a robust error-handling system. By default, Symfony applications are configured to display detailed error messages only in the development environment for security reasons. In the production environment, a generic error page is shown. Symfony's error handling system also allows customized error pages based on different HTTP status codes, providing a seamless and branded user experience. Additionally, Symfony logs detailed error information, aiding developers in identifying and resolving issues efficiently.

For more information about error handling unrelated to Symfony refer to [Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html).

#### Sensitive data

In Symfony, the best way to store configurations like API keys, etc., is through the use of environment variables, which are dependent on the application's location.
To ensure the security of sensitive values, Symfony provides a *secrets management system* in which values are additionally encoded using cryptographic keys and stored as **secrets**.

Consider an example where an API_KEY is stored as a secret:

To generate a pair of cryptographic keys you can run the following command. The private key file is highly sensitive and it shouldn't be committed in a repository.

```bash
bin/console secrets:generate-keys
```

This command will generate a file for the API_KEY secret in `config/secrets/env(dev|prod|etc.)`

```bash
bin/console secret:set API_KEY
```

You can access secret values in your code in the same manner as environment variables.
It's very important to note that if there are environment variables and secrets with identical names, **the values from environment variables will always override secrets**.

For more details refer to [Symfony Secrets Documentation](https://symfony.com/doc/current/configuration/secrets.html).

#### Summary

- Make sure your app is not in debug mode while in production. To turn off debug mode, set your `APP_ENV` environment variable to `prod`:

    ```ini
    APP_ENV=prod
    ```

- Make sure your PHP configuration is secure. You may refer to the [PHP Configuration Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html) for more information on secure PHP configuration settings.

- Ensure that the SSL certificate is properly configured in your web server and configure it to enforce HTTPS by redirecting HTTP traffic to HTTPS.

- Implement security headers to enhance the security posture of your application.

- Ensure that file and directory permissions are set correctly to minimize security risks.

- Implement regular backups of your production database and critical files. Have a recovery plan in place to quickly restore your application in case of any issues.

- Use security checkers to scan your dependencies to identify known vulnerabilities.

- Consider setting up monitoring tools and error reporting mechanisms to quickly identify and address issues in your production environment. Explore tools like [Blackfire.io](https://www.blackfire.io).

## Java Security

> **Source:** [Java Security](https://cheatsheetseries.owasp.org/cheatsheets/Java_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Injection Prevention in Java

This section aims to provide tips to handle *Injection* in Java application code.

Sample code used in tips is located [here](https://github.com/righettod/injection-cheat-sheets).

#### What is Injection

[Injection](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A1-Injection) in OWASP Top 10 is defined as following:

*Consider anyone who can send untrusted data to the system, including external users, internal users, and administrators.*

#### General advice to prevent Injection

The following point can be applied, in a general way, to prevent *Injection* issue:

1. Apply **Input Validation** (using allowlist approach) combined with **Output Sanitizing+Escaping** on user input/output.
2. If you need to interact with system, try to use API features provided by your technology stack (Java / .Net / PHP...) instead of building command.

Additional advice is provided on this [cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

### Specific Injection types

*Examples in this section will be provided in Java technology (see Maven project associated) but advice is applicable to others technologies like .Net / PHP / Ruby / Python...*

#### SQL

##### Symptom

Injection of this type occur when the application uses untrusted user input to build an SQL query using a String and execute it.

##### How to prevent

Use *Query Parameterization* in order to prevent injection.

##### Example

``` java
/*No DB framework used here in order to show the real use of
  Prepared Statement from Java API*/
/*Open connection with H2 database and use it*/
Class.forName("org.h2.Driver");
String jdbcUrl = "jdbc:h2:file:" + new File(".").getAbsolutePath() + "/target/db";
try (Connection con = DriverManager.getConnection(jdbcUrl)) {

    /* Sample A: Select data using Prepared Statement*/
    String query = "select * from color where friendly_name = ?";
    List<String> colors = new ArrayList<>();
    try (PreparedStatement pStatement = con.prepareStatement(query)) {
        pStatement.setString(1, "yellow");
        try (ResultSet rSet = pStatement.executeQuery()) {
            while (rSet.next()) {
                colors.add(rSet.getString(1));
            }
        }
    }

    /* Sample B: Insert data using Prepared Statement*/
    query = "insert into color(friendly_name, red, green, blue) values(?, ?, ?, ?)";
    int insertedRecordCount;
    try (PreparedStatement pStatement = con.prepareStatement(query)) {
        pStatement.setString(1, "orange");
        pStatement.setInt(2, 239);
        pStatement.setInt(3, 125);
        pStatement.setInt(4, 11);
        insertedRecordCount = pStatement.executeUpdate();
    }

   /* Sample C: Update data using Prepared Statement*/
    query = "update color set blue = ? where friendly_name = ?";
    int updatedRecordCount;
    try (PreparedStatement pStatement = con.prepareStatement(query)) {
        pStatement.setInt(1, 10);
        pStatement.setString(2, "orange");
        updatedRecordCount = pStatement.executeUpdate();
    }

   /* Sample D: Delete data using Prepared Statement*/
    query = "delete from color where friendly_name = ?";
    int deletedRecordCount;
    try (PreparedStatement pStatement = con.prepareStatement(query)) {
        pStatement.setString(1, "orange");
        deletedRecordCount = pStatement.executeUpdate();
    }

}
```

#### JPA

##### Symptom

Injection of this type occur when the application uses untrusted user input to build a JPA query using a String and execute it. It's quite similar to SQL injection but here the altered language is not SQL but JPA QL.

##### How to prevent

Use Java Persistence Query Language **Query Parameterization** in order to prevent injection.

##### Example

``` java
EntityManager entityManager = null;
try {
    /* Get a ref on EntityManager to access DB */
    entityManager = Persistence.createEntityManagerFactory("testJPA").createEntityManager();

    /* Define parameterized query prototype using named parameter to enhance readability */
    String queryPrototype = "select c from Color c where c.friendlyName = :colorName";

    /* Create the query, set the named parameter and execute the query */
    Query queryObject = entityManager.createQuery(queryPrototype);
    Color c = (Color) queryObject.setParameter("colorName", "yellow").getSingleResult();

} finally {
    if (entityManager != null && entityManager.isOpen()) {
        entityManager.close();
    }
}
```

#### Operating System

##### Symptom

Injection of this type occur when the application uses untrusted user input to build an Operating System command using a String and execute it.

##### How to prevent

Use technology stack **API** in order to prevent injection.

##### Example

``` java
/* The context taken is, for example, to perform a PING against a computer.
* The prevention is to use the feature provided by the Java API instead of building
* a system command as String and execute it */
InetAddress host = InetAddress.getByName("localhost");
var reachable = host.isReachable(5000);
```

#### XML: XPath Injection

##### Symptom

Injection of this type occur when the application uses untrusted user input to build a XPath query using a String and execute it.

##### How to prevent

Use **XPath Variable Resolver** in order to prevent injection.

##### Example

**Variable Resolver** implementation.

``` java
/**
 * Resolver in order to define parameter for XPATH expression.
 *
 */
public class SimpleVariableResolver implements XPathVariableResolver {

    private final Map<QName, Object> vars = new HashMap<QName, Object>();

    /**
     * External methods to add parameter
     *
     * @param name Parameter name
     * @param value Parameter value
     */
    public void addVariable(QName name, Object value) {
        vars.put(name, value);
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.xml.xpath.XPathVariableResolver#resolveVariable(javax.xml.namespace.QName)
     */
    public Object resolveVariable(QName variableName) {
        return vars.get(variableName);
    }
}
```

Code using it to perform XPath query.

``` java
/*Create a XML document builder factory*/
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();

/*Disable External Entity resolution for different cases*/
//Do not performed here in order to focus on variable resolver code
//but do it for production code !

/*Load XML file*/
DocumentBuilder builder = dbf.newDocumentBuilder();
Document doc = builder.parse(new File("src/test/resources/SampleXPath.xml"));

/* Create and configure parameter resolver */
String bid = "bk102";
SimpleVariableResolver variableResolver = new SimpleVariableResolver();
variableResolver.addVariable(new QName("bookId"), bid);

/*Create and configure XPATH expression*/
XPath xpath = XPathFactory.newInstance().newXPath();
xpath.setXPathVariableResolver(variableResolver);
XPathExpression xPathExpression = xpath.compile("//book[@id=$bookId]");

/* Apply expression on XML document */
Object nodes = xPathExpression.evaluate(doc, XPathConstants.NODESET);
NodeList nodesList = (NodeList) nodes;
Element book = (Element)nodesList.item(0);
var containsRalls = book.getTextContent().contains("Ralls, Kim");
```

#### HTML/JavaScript/CSS

##### Symptom

Injection of this type occur when the application uses untrusted user input to build an HTTP response and sent it to browser.

##### How to prevent

Use [context-specific output encoding](https://owasp.org/projects/java-encoder?tab=how-to-use) when displaying untrusted text. When the application intentionally accepts HTML markup, use an [HTML sanitization policy](https://github.com/OWASP/java-html-sanitizer#crafting-a-policy) for the permitted elements and attributes. Input validation enforces business rules; it does not replace these XSS controls. See the [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) for HTML, attribute, JavaScript, and CSS context requirements.

##### Example

``` java
// Illustrative business validation; output still needs the appropriate XSS control.
String userInput = "You user login is owasp-user01";

/* First we check that the value contains only expected character*/
if (!Pattern.matches("[a-zA-Z0-9\\s\\-]{1,50}", userInput))
{
    return false;
}

// Plain text for an ordinary HTML body position, such as the content of a div.
String encodedText = Encode.forHtml(userInput);

// Allowed markup for an HTML body position; not for attributes, script, or style.
String outputToUser = "You <p>user login</p> is <strong>owasp-user01</strong>";
outputToUser += "<script>alert(22);</script><img src='#' onload='javascript:alert(23);'>";

/* Create a sanitizing policy that only allow tag '<p>' and '<strong>'*/
PolicyFactory policy = new HtmlPolicyBuilder().allowElements("p", "strong").toFactory();

/* Sanitize the output that will be sent to user*/
String safeOutput = policy.sanitize(outputToUser);

/* Keep the permitted markup: encoding this whole fragment would display tags as text. */
String finalSafeOutputExpected = "You <p>user login</p> is <strong>owasp-user01</strong>";
if (!finalSafeOutputExpected.equals(safeOutput))
{
    return false;
}
```

#### LDAP

A dedicated [cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html) has been created.

#### NoSQL

##### Symptom

Injection of this type occur when the application uses untrusted user input to build a NoSQL API call expression.

##### How to prevent

Validate the expected input type, length, and business format, then use the driver's structured query API. Do not concatenate untrusted values into query strings or accept client-supplied query/operator objects. [MongoDB's driver guidance](https://www.mongodb.com/docs/drivers/client-libraries-best-practices/) distinguishes literal values built through typed APIs from JSON or JavaScript that is parsed as query syntax. A blacklist of punctuation is not needed for the string equality query below. See the [NoSQL Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html#prevent-nosql-injection) for broader controls.

##### Example - MongoDB

Assume `collection` is an application-configured `MongoCollection<Document>`. This example uses the Java driver's [equality filter builder](https://www.mongodb.com/docs/drivers/java/sync/current/builders/filters/) with a string value; the 50-character limit is an illustrative business rule, not the injection defense.

```java
String userInput = "Brooklyn";
if (userInput == null || userInput.length() > 50) {
    throw new IllegalArgumentException("Invalid borough");
}

// Keep the field name fixed and the input as a string value.
Bson expression = Filters.eq("borough", userInput);
FindIterable<Document> restaurants = collection.find(expression);
```

#### Log Injection

##### Symptom

[Log Injection](https://owasp.org/www-community/attacks/Log_Injection) occurs when an application includes untrusted data in an application log message (e.g., an attacker can cause an additional log entry that looks like it came from a completely different user, if they can inject CRLF characters in the untrusted data). More information about this attack is available on the OWASP [Log Injection](https://owasp.org/www-community/attacks/Log_Injection) page.

##### How to prevent

To prevent an attacker from writing malicious content into the application log, apply defenses such as:

- Use structured log formats, such as JSON, instead of unstructured text formats.
  Unstructured formats are susceptible to **C**arriage **R**eturn (CR) and **L**ine **F**eed (LF) injection (see [CWE-93](https://cwe.mitre.org/data/definitions/93.html)).
- Limit the size of the user input value used to create the log message.
- Make sure [all XSS defenses](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) are applied when viewing log files in a web browser.

##### Example using Log4j Core 2

The recommended logging policy for a production environment is sending logs to a network socket using the structured
[JSON Template Layout](https://logging.apache.org/log4j/2.x/manual/json-template-layout.html)
introduced in
[Log4j 2.14.0](https://logging.apache.org/log4j/2.x/release-notes.html#release-notes-2-14-0)
and truncate string values longer than 500 characters using the
[`maxStringLength` configuration attribute](https://logging.apache.org/log4j/2.x/manual/json-template-layout.html#plugin-attr-maxStringLength).
The truncation suffix is appended after this limit; this does not cap the encoded byte size or the total JSON document size:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration xmlns="https://logging.apache.org/xml/ns"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xsi:schemaLocation="
                   https://logging.apache.org/xml/ns
                   https://logging.apache.org/xml/ns/log4j-config-2.xsd">
  <Appenders>
    <Socket name="SOCKET"
            host="localhost"
            port="12345">
      <!-- Truncate strings longer than 500 characters, then append the truncation suffix -->
      <JsonTemplateLayout maxStringLength="500"
                          nullEventDelimiterEnabled="true"/>
    </Socket>
  </Appenders>
  <Loggers>
    <Root level="DEBUG">
      <AppenderRef ref="SOCKET"/>
    </Root>
  </Loggers>
</Configuration>
```

See
[Integration with service-oriented architectures](https://logging.apache.org/log4j/2.x/soa.html)
on
[Log4j website](https://logging.apache.org/log4j/2.x/index.html)
for more tips.

Usage of the logger at code level:

``` java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
...
// Most common way to declare a logger
private static final Logger logger = LogManager.getLogger();
// GOOD!
//
// Use parameterized logging to add user data to a message
// The pattern should be a compile-time constant
logger.warn("Login failed for user {}.", username);
// BAD!
//
// Don't mix string concatenation and parameters
// If `username` contains `{}`, the exception will leak into the message
logger.warn("Failure for user " + username + " and role {}.", role, ex);
...
```

See
[Log4j API Best Practices](https://logging.apache.org/log4j/2.x/manual/api.html#best-practice)
for more information.

##### Example using Logback

The recommended logging policy for a production environment is using the structured
[JsonEncoder](https://logback.qos.ch/manual/encoders.html#JsonEncoder)
introduced in
[Logback 1.3.8](https://logback.qos.ch/news.html#1.3.8).
In the example below, Logback is configured to roll on 10 log files of 5 MiB each:

``` xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration>
<configuration>
  <import class="ch.qos.logback.classic.encoder.JsonEncoder"/>
  <import class="ch.qos.logback.core.rolling.FixedWindowRollingPolicy"/>
  <import class="ch.qos.logback.core.rolling.RollingFileAppender"/>
  <import class="ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy"/>

  <appender name="RollingFile" class="RollingFileAppender">
    <file>app.log</file>
    <rollingPolicy class="FixedWindowRollingPolicy">
      <fileNamePattern>app-%i.log</fileNamePattern>
      <minIndex>1</minIndex>
      <maxIndex>10</maxIndex>
    </rollingPolicy>
    <triggeringPolicy class="SizeBasedTriggeringPolicy">
      <maxFileSize>5MB</maxFileSize>
    </triggeringPolicy>
    <encoder class="JsonEncoder"/>
  </appender>

  <root level="DEBUG">
    <appender-ref ref="RollingFile"/>
  </root>
</configuration>
```

Usage of the logger at code level:

``` java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
...
// Most common way to declare a logger
Logger logger = LoggerFactory.getLogger(MyClass.class);
// GOOD!
//
// Use parameterized logging to add user data to a message
// The pattern should be a compile-time constant
logger.warn("Login failed for user {}.", username);
// BAD!
//
// Don't mix string concatenation and parameters
// If `username` contains `{}`, the exception will leak into the message
logger.warn("Failure for user " + username + " and role {}.", role, ex);
...
```

### Cryptography

#### General cryptography guidance

- **Never, ever write your own cryptographic functions.**
- Wherever possible, try and avoid writing any cryptographic code at all. Instead try and either use pre-existing secret management solutions or the secret management solution provided by your cloud provider. For more information, see the [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).
- If you cannot use a pre-existing secret management solution, try and use a trusted and well known implementation library rather than using the libraries built into JCA/JCE as it is far too easy to make cryptographic errors with them.
- Make sure your application or protocol can easily support a future change of cryptographic algorithms.
- Use your package manager wherever possible to keep all of your packages up to date. Watch the updates on your development setup, and plan updates to your applications accordingly.
- We will show examples below based on Google Tink, which is a library created by cryptography experts for using cryptography safely (in the sense of minimizing common mistakes made when using standard cryptography libraries).

#### Encryption for storage

Follow the algorithm guidance in the [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#algorithms).

##### Symmetric example using Google Tink

Google Tink has documentation on performing common tasks.

For example, this page (from Google's website) shows [how to perform simple symmetric encryption](https://developers.google.com/tink/encrypt-data).

The following code snippet shows an encapsulated use of this functionality:

<details>
  <summary>Click here to view the "Tink symmetric encryption" code snippet.</summary>

``` java
import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.crypto.tink.Aead;
import com.google.crypto.tink.InsecureSecretKeyAccess;
import com.google.crypto.tink.KeysetHandle;
import com.google.crypto.tink.TinkJsonProtoKeysetFormat;
import com.google.crypto.tink.aead.AeadConfig;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

// AesGcmSimpleTest
public class App {

    // Based on example from:
    // https://github.com/tink-crypto/tink-java/tree/main/examples/aead

    public static void main(String[] args) throws Exception {

        // Key securely generated using:
        // tinkey create-keyset --key-template AES128_GCM --out-format JSON --out aead_test_keyset.json

        // Register all AEAD key types with the Tink runtime.
        AeadConfig.register();

        // Read the keyset into a KeysetHandle.
        KeysetHandle handle =
        TinkJsonProtoKeysetFormat.parseKeyset(
            new String(Files.readAllBytes( Paths.get("/home/fredbloggs/aead_test_keyset.json")), UTF_8), InsecureSecretKeyAccess.get());

        String message = "This message to be encrypted";
        System.out.println(message);

        // Add some relevant context about the encrypted data that should be verified
        // on decryption
        String metadata = "Sender: fredbloggs@example.com";

        // Encrypt the message
        byte[] cipherText = AesGcmSimple.encrypt(message, metadata, handle);
        System.out.println(Base64.getEncoder().encodeToString(cipherText));

        // Decrypt the message
        String message2 = AesGcmSimple.decrypt(cipherText, metadata, handle);
        System.out.println(message2);
    }
}

class AesGcmSimple {

    public static byte[] encrypt(String plaintext, String metadata, KeysetHandle handle) throws Exception {
        // Get the primitive.
        Aead aead = handle.getPrimitive(Aead.class);
        return aead.encrypt(plaintext.getBytes(UTF_8), metadata.getBytes(UTF_8));
    }

    public static String decrypt(byte[] ciphertext, String metadata, KeysetHandle handle) throws Exception {
        // Get the primitive.
        Aead aead = handle.getPrimitive(Aead.class);
        return new String(aead.decrypt(ciphertext, metadata.getBytes(UTF_8)),UTF_8);
    }

}

```

</details>

##### Symmetric example using built-in JCA/JCE classes

If you absolutely cannot use a separate library, it is still possible to use the built JCA/JCE classes but it is strongly recommended to have a cryptography expert review the full design and code, as even the most trivial error can severely weaken your encryption.

The following code snippet shows an example of using AES-GCM to perform encryption/decryption of data.

A few constraints/pitfalls with this code:

- It does not take into account key rotation or management which is a whole topic in itself.
- It is important to use a different nonce for every encryption operation, especially if the same key is used. For more information, see [this answer on Cryptography Stack Exchange](https://crypto.stackexchange.com/a/66500).
- The key will need to be stored securely.

<details>
  <summary>Click here to view the "JCA/JCE symmetric encryption" code snippet.</summary>

```java
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import javax.crypto.spec.*;
import javax.crypto.*;
import java.util.Base64;

// AesGcmSimpleTest
class Main {

    public static void main(String[] args) throws Exception {
        // Key of 32 bytes / 256 bits for AES
        KeyGenerator keyGen = KeyGenerator.getInstance(AesGcmSimple.ALGORITHM);
        keyGen.init(AesGcmSimple.KEY_SIZE, new SecureRandom());
        SecretKey secretKey = keyGen.generateKey();

        // Nonce of 12 bytes / 96 bits and this size should always be used.
        // It is critical for AES-GCM that a unique nonce is used for every cryptographic operation.
        byte[] nonce = new byte[AesGcmSimple.IV_LENGTH];
        SecureRandom random = new SecureRandom();
        random.nextBytes(nonce);

        var message = "This message to be encrypted";
        System.out.println(message);

        // Encrypt the message
        byte[] cipherText = AesGcmSimple.encrypt(message, nonce, secretKey);
        System.out.println(Base64.getEncoder().encodeToString(cipherText));

        // Decrypt the message
        var message2 = AesGcmSimple.decrypt(cipherText, nonce, secretKey);
        System.out.println(message2);
    }
}

class AesGcmSimple {

    public static final String ALGORITHM = "AES";
    public static final String CIPHER_ALGORITHM = "AES/GCM/NoPadding";
    public static final int KEY_SIZE = 256;
    public static final int TAG_LENGTH = 128;
    public static final int IV_LENGTH = 12;

    public static byte[] encrypt(String plaintext, byte[] nonce, SecretKey secretKey) throws Exception {
        return cryptoOperation(plaintext.getBytes(StandardCharsets.UTF_8), nonce, secretKey, Cipher.ENCRYPT_MODE);
    }

    public static String decrypt(byte[] ciphertext, byte[] nonce, SecretKey secretKey) throws Exception {
        return new String(cryptoOperation(ciphertext, nonce, secretKey, Cipher.DECRYPT_MODE), StandardCharsets.UTF_8);
    }

    private static byte[] cryptoOperation(byte[] text, byte[] nonce, SecretKey secretKey, int mode) throws Exception {
        Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
        GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(TAG_LENGTH, nonce);
        cipher.init(mode, secretKey, gcmParameterSpec);
        return cipher.doFinal(text);
    }

}
```

</details>

#### Encryption for transmission

Again, follow the algorithm guidance in the [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#algorithms).

##### Asymmetric example using Google Tink

Google Tink has documentation on performing common tasks.

For example, this page (from Google's website) shows [how to perform a hybrid encryption process](https://developers.google.com/tink/exchange-data) where two parties want to share data based on their asymmetric key pair.

The following code snippet shows how this functionality can be used to share secrets between Alice and Bob:

<details>
  <summary>Click here to view the "Tink hybrid encryption" code snippet.</summary>

``` java
import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.crypto.tink.HybridDecrypt;
import com.google.crypto.tink.HybridEncrypt;
import com.google.crypto.tink.InsecureSecretKeyAccess;
import com.google.crypto.tink.KeysetHandle;
import com.google.crypto.tink.TinkJsonProtoKeysetFormat;
import com.google.crypto.tink.hybrid.HybridConfig;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

// HybridReplaceTest
class App {
    public static void main(String[] args) throws Exception {
        /*

        Generated public/private keypairs for Bob and Alice using the
        following tinkey commands:

        ./tinkey create-keyset \
        --key-template DHKEM_X25519_HKDF_SHA256_HKDF_SHA256_AES_256_GCM \
        --out-format JSON --out alice_private_keyset.json

        ./tinkey create-keyset \
        --key-template DHKEM_X25519_HKDF_SHA256_HKDF_SHA256_AES_256_GCM \
        --out-format JSON --out bob_private_keyset.json

        ./tinkey create-public-keyset --in alice_private_keyset.json \
        --in-format JSON --out-format JSON --out alice_public_keyset.json

        ./tinkey create-public-keyset --in bob_private_keyset.json \
        --in-format JSON --out-format JSON --out bob_public_keyset.json
        */

        HybridConfig.register();

        // Generate ECC key pair for Alice
        var alice = new HybridSimple(
                getKeysetHandle("/home/alicesmith/private_keyset.json"),
                getKeysetHandle("/home/alicesmith/public_keyset.json")

        );

        KeysetHandle alicePublicKey = alice.getPublicKey();

        // Generate ECC key pair for Bob
        var bob = new HybridSimple(
                getKeysetHandle("/home/bobjones/private_keyset.json"),
                getKeysetHandle("/home/bobjones/public_keyset.json")

        );

        KeysetHandle bobPublicKey = bob.getPublicKey();

        // This keypair generation should be reperformed every so often in order to
        // obtain a new shared secret to avoid a long lived shared secret.

        // Alice encrypts a message to send to Bob
        String plaintext = "Hello, Bob!";

        // Add some relevant context about the encrypted data that should be verified
        // on decryption
        String metadata = "Sender: alicesmith@example.com";

        System.out.println("Secret being sent from Alice to Bob: " + plaintext);
        var cipherText = alice.encrypt(bobPublicKey, plaintext, metadata);
        System.out.println("Ciphertext being sent from Alice to Bob: " + Base64.getEncoder().encodeToString(cipherText));

        // Bob decrypts the message
        var decrypted = bob.decrypt(cipherText, metadata);
        System.out.println("Secret received by Bob from Alice: " + decrypted);
        System.out.println();

        // Bob encrypts a message to send to Alice
        String plaintext2 = "Hello, Alice!";

        // Add some relevant context about the encrypted data that should be verified
        // on decryption
        String metadata2 = "Sender: bobjones@example.com";

        System.out.println("Secret being sent from Bob to Alice: " + plaintext2);
        var cipherText2 = bob.encrypt(alicePublicKey, plaintext2, metadata2);
        System.out.println("Ciphertext being sent from Bob to Alice: " + Base64.getEncoder().encodeToString(cipherText2));

        // Bob decrypts the message
        var decrypted2 = alice.decrypt(cipherText2, metadata2);
        System.out.println("Secret received by Alice from Bob: " + decrypted2);
    }

    private static KeysetHandle getKeysetHandle(String filename) throws Exception
    {
        return TinkJsonProtoKeysetFormat.parseKeyset(
                new String(Files.readAllBytes( Paths.get(filename)), UTF_8), InsecureSecretKeyAccess.get());
    }
}
class HybridSimple {

    private KeysetHandle privateKey;
    private KeysetHandle publicKey;

    public HybridSimple(KeysetHandle privateKeyIn, KeysetHandle publicKeyIn) throws Exception {
        privateKey = privateKeyIn;
        publicKey = publicKeyIn;
    }

    public KeysetHandle getPublicKey() {
        return publicKey;
    }

    public byte[] encrypt(KeysetHandle partnerPublicKey, String message, String metadata) throws Exception {

        HybridEncrypt encryptor = partnerPublicKey.getPrimitive(HybridEncrypt.class);

        // return the encrypted value
        return encryptor.encrypt(message.getBytes(UTF_8), metadata.getBytes(UTF_8));
    }
    public String decrypt(byte[] ciphertext, String metadata) throws Exception {

        HybridDecrypt decryptor = privateKey.getPrimitive(HybridDecrypt.class);

        // return the encrypted value
        return new String(decryptor.decrypt(ciphertext, metadata.getBytes(UTF_8)),UTF_8);
    }

}
```

</details>

##### Asymmetric example using built-in JCA/JCE classes

If you absolutely cannot use a separate library, it is still possible to use the built JCA/JCE classes but it is strongly recommended to have a cryptography expert review the full design and code, as even the most trivial error can severely weaken your encryption.

This Java 25+ example illustrates Elliptic Curve Diffie-Hellman (ECDH) followed by HKDF-SHA-256 and AES-GCM. Do not use raw ECDH output directly as an AES key: [RFC 5869](https://www.rfc-editor.org/rfc/rfc5869.html#section-3.3) explains why Diffie-Hellman values need extraction. The [Java KDF API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/KDF.html) performs both extraction and expansion here. This is a primitive demonstration, not an authenticated communication protocol.

Note that this code sample relies on the AesGcmSimple class from the [previous section](#symmetric-example-using-built-in-jcajce-classes).

A few constraints/pitfalls with this code:

- It does not take into account key rotation or management which is a whole topic in itself.
- The code deliberately enforces a new nonce for every encryption operation but this must be managed as a separate data item alongside the ciphertext.
- The private keys will need to be stored securely.
- The code does not consider the validation of public keys before use.
- Public keys must be authenticated independently before use. HKDF does not authenticate the peer; this example omits that protocol and its identity/context binding.

<details>
  <summary>Click here to view the "JCA/JCE hybrid encryption" code snippet.</summary>

```java
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import javax.crypto.spec.*;
import javax.crypto.*;
import java.util.*;
import java.security.*;
import java.security.spec.*;
import java.util.Arrays;

// ECDHSimpleTest
class Main {
    public static void main(String[] args) throws Exception {

        // Generate ECC key pair for Alice
        var alice = new ECDHSimple();
        Key alicePublicKey = alice.getPublicKey();

        // Generate ECC key pair for Bob
        var bob = new ECDHSimple();
        Key bobPublicKey = bob.getPublicKey();

        // This keypair generation should be reperformed every so often in order to
        // obtain a new shared secret to avoid a long lived shared secret.

        // Alice encrypts a message to send to Bob
        String plaintext = "Hello"; //, Bob!";
        System.out.println("Secret being sent from Alice to Bob: " + plaintext);

        var retPair = alice.encrypt(bobPublicKey, plaintext);
        var nonce = retPair.getKey();
        var cipherText = retPair.getValue();

        System.out.println("Both cipherText and nonce being sent from Alice to Bob: " + Base64.getEncoder().encodeToString(cipherText) + " " + Base64.getEncoder().encodeToString(nonce));

        // Bob decrypts the message
        var decrypted = bob.decrypt(alicePublicKey, cipherText, nonce);
        System.out.println("Secret received by Bob from Alice: " + decrypted);
        System.out.println();

        // Bob encrypts a message to send to Alice
        String plaintext2 = "Hello"; //, Alice!";
        System.out.println("Secret being sent from Bob to Alice: " + plaintext2);

        var retPair2 = bob.encrypt(alicePublicKey, plaintext2);
        var nonce2 = retPair2.getKey();
        var cipherText2 = retPair2.getValue();
        System.out.println("Both cipherText2 and nonce2 being sent from Bob to Alice: " + Base64.getEncoder().encodeToString(cipherText2) + " " + Base64.getEncoder().encodeToString(nonce2));

        // Bob decrypts the message
        var decrypted2 = alice.decrypt(bobPublicKey, cipherText2, nonce2);
        System.out.println("Secret received by Alice from Bob: " + decrypted2);
    }
}
class ECDHSimple {
    private KeyPair keyPair;

    public class AesKeyNonce {
        public SecretKey Key;
        public byte[] Nonce;
    }

    public ECDHSimple() throws Exception {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC");
        ECGenParameterSpec ecSpec = new ECGenParameterSpec("secp256r1"); // Using secp256r1 curve
        keyPairGenerator.initialize(ecSpec);
        keyPair = keyPairGenerator.generateKeyPair();
    }

    public Key getPublicKey() {
        return keyPair.getPublic();
    }

    public AbstractMap.SimpleEntry<byte[], byte[]> encrypt(Key partnerPublicKey, String message) throws Exception {

        // Generate the AES Key and Nonce
        AesKeyNonce aesParams = generateAESParams(partnerPublicKey);

        // return the encrypted value
        return new AbstractMap.SimpleEntry<>(
            aesParams.Nonce,
            AesGcmSimple.encrypt(message, aesParams.Nonce, aesParams.Key)
            );
    }
    public String decrypt(Key partnerPublicKey, byte[] ciphertext, byte[] nonce) throws Exception {

        // Generate the AES Key and Nonce
        AesKeyNonce aesParams = generateAESParams(partnerPublicKey, nonce);

        // return the decrypted value
        return AesGcmSimple.decrypt(ciphertext, aesParams.Nonce, aesParams.Key);
    }

    private AesKeyNonce generateAESParams(Key partnerPublicKey, byte[] nonce) throws Exception {

        // Derive the secret based on this side's private key and the other side's public key
        KeyAgreement keyAgreement = KeyAgreement.getInstance("ECDH");
        keyAgreement.init(keyPair.getPrivate());
        keyAgreement.doPhase(partnerPublicKey, true);
        byte[] secret = keyAgreement.generateSecret();

        AesKeyNonce aesKeyNonce = new AesKeyNonce();

        // Illustrative domain label; a real protocol defines its full context binding.
        byte[] info = "OWASP Java ECDH example: AES-256-GCM v1".getBytes(StandardCharsets.UTF_8);
        var derivation = HKDFParameterSpec.ofExtract().addIKM(secret)
                .thenExpand(info, AesGcmSimple.KEY_SIZE / 8);
        aesKeyNonce.Key = KDF.getInstance("HKDF-SHA256").deriveKey("AES", derivation);
        Arrays.fill(secret, (byte) 0);

        // Passed in nonce will be used.
        aesKeyNonce.Nonce = nonce;
        return aesKeyNonce;

    }

    private AesKeyNonce generateAESParams(Key partnerPublicKey) throws Exception {

        // Nonce of 12 bytes / 96 bits and this size should always be used.
        // It is critical for AES-GCM that a unique nonce is used for every cryptographic operation.
        // Therefore this is not generated from the shared secret
        byte[] nonce = new byte[AesGcmSimple.IV_LENGTH];
        SecureRandom random = new SecureRandom();
        random.nextBytes(nonce);
        return generateAESParams(partnerPublicKey, nonce);

    }
}
```

</details>

## DotNet Security

> **Source:** [DotNet Security](https://cheatsheetseries.owasp.org/cheatsheets/DotNet_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This page intends to provide quick basic .NET security tips for developers.

#### The .NET Framework

The .NET Framework is Microsoft's principal platform for enterprise development. It is the supporting API for ASP.NET, Windows Desktop applications, Windows Communication Foundation services, SharePoint, Visual Studio Tools for Office and other technologies.

The .NET Framework constitutes a collection of APIs that facilitate the usage of an advanced type system, managing data, graphics, networking, file operations, and more - essentially covering the vast majority of requirements for developing enterprise applications within the Microsoft ecosystem. It is a nearly ubiquitous library that is strongly named and versioned at the assembly level.

#### Updating the Framework

The .NET Framework is kept up-to-date by Microsoft with the Windows Update service. Developers do not normally need to run separate updates to the Framework. Windows Update can be accessed at [Windows Update](http://windowsupdate.microsoft.com/) or from the Windows Update program on a Windows computer.

Individual frameworks can be kept up to date using [NuGet](https://docs.microsoft.com/en-us/nuget/). As Visual Studio prompts for updates, build it into your lifecycle.

Remember that third-party libraries have to be updated separately and not all of them use NuGet. ELMAH for instance, requires a separate update effort.

#### Security Announcements

Receive security notifications by selecting the "Watch" button at the following repositories:

- [.NET Core Security Announcements](https://github.com/dotnet/announcements/issues?q=is%3Aopen+is%3Aissue+label%3ASecurity)
- [ASP.NET Core & Entity Framework Core Security Announcements](https://github.com/aspnet/Announcements/issues?q=is%3Aopen+is%3Aissue+label%3ASecurity)

### .NET General Guidance

This section contains general guidance for .NET applications.
This applies to all .NET applications, including ASP.NET, WPF, WinForms, and others.

The OWASP Top 10 lists the most prevalent and dangerous threats to web security in the world today and is reviewed every few years
and updated with the latest threat data. This section of the cheat sheet is based on this list.
Your approach to securing your web application should be to start at the top threat A1 below and work down;
this will ensure that any time spent on security will be spent most effectively and
cover the top threats first and lesser threats afterwards. After covering the Top 10 it is generally advisable
to assess for other threats or get a professionally completed Penetration Test.

#### A01 Broken Access Control

##### Weak Account management

Ensure cookies are sent with the HttpOnly flag set to prevent client side scripts from accessing the cookie:

```csharp
CookieHttpOnly = true,
```

Reduce the time period a session can be stolen in by reducing session timeout and removing sliding expiration:

The decision to use sliding expiration depends on your application's threat model. Setting `SlidingExpiration` to `false` enforces an absolute session lifetime, which limits how long a stolen session can be reused, at the cost of reduced usability for long-lived interactive sessions. For some applications, enabling sliding expiration (`true`) may be preferred for user experience, as it keeps the session alive as long as the user is active. This convenience comes with increased risk if a session is compromised.

```csharp
ExpireTimeSpan = TimeSpan.FromMinutes(60),
SlidingExpiration = false
```

See [here](https://github.com/johnstaveley/SecurityEssentials/blob/master/SecurityEssentials/App_Start/Startup.Auth.cs) for an example of a full startup code snippet.

Ensure cookies are sent over HTTPS in production. This should be enforced in the config transforms:

```xml
<httpCookies requireSSL="true" />
<authentication>
    <forms requireSSL="true" />
</authentication>
```

Protect LogOn, Registration and password reset methods against brute force attacks by throttling requests (see code below). Consider also using ReCaptcha.

```csharp
[HttpPost]
[AllowAnonymous]
[ValidateAntiForgeryToken]
[AllowXRequestsEveryXSecondsAttribute(Name = "LogOn",
Message = "You have performed this action more than {x} times in the last {n} seconds.",
Requests = 3, Seconds = 60)]
public async Task<ActionResult> LogOn(LogOnViewModel model, string returnUrl)
```

DO NOT: Roll your own authentication or session management. Use the one provided by .NET.

DO NOT: Tell someone if the account exists on LogOn, Registration or Password reset. Say something like 'Either the username or password was incorrect', or 'If this account exists then a reset token will be sent to the registered email address'. This protects against account enumeration.

The feedback to the user should be identical whether or not the account exists, both in terms of content and behavior. E.g., if the response takes 50% longer when the account is real then membership information can be guessed and tested.

##### Missing function-level access control

DO: Authorize users on all externally facing endpoints. The .NET framework has many ways to authorize a user, use them at method level:

```csharp
[Authorize(Roles = "Admin")]
[HttpGet]
public ActionResult Index(int page = 1)
```

or better yet, at controller level:

```csharp
[Authorize]
public class UserController
```

You can also check roles in code using identity features in .net: `System.Web.Security.Roles.IsUserInRole(userName, roleName)`

You can find more information in the [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) and
[Authorization Testing Automation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html).

##### Insecure Direct object references

When you have a resource (object) which can be accessed by a reference (in the sample below this is the `id`), you need to ensure that the user is intended to have access to that resource.

```csharp
// Insecure
public ActionResult Edit(int id)
{
  var user = _context.Users.FirstOrDefault(e => e.Id == id);
  return View("Details", new UserViewModel(user);
}

// Secure
public ActionResult Edit(int id)
{
  var user = _context.Users.FirstOrDefault(e => e.Id == id);
  // Establish user has right to edit the details
  if (user.Id != _userIdentity.GetUserId())
  {
        HandleErrorInfo error = new HandleErrorInfo(
            new Exception("INFO: You do not have permission to edit these details"));
        return View("Error", error);
  }
  return View("Edit", new UserViewModel(user);
}
```

More information can be found in the [Insecure Direct Object Reference Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html).

#### A02 Cryptographic Failures

##### General cryptography guidance

- **Never, ever write your own cryptographic functions.**
- Wherever possible, try and avoid writing any cryptographic code at all. Instead try and either use pre-existing secrets management solutions or the secret management solution provided by your cloud provider. For more information, see the [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).
- If you cannot use a pre-existing secrets management solution, try and use a trusted and well known implementation library rather than using the libraries built into .NET as it is far too easy to make cryptographic errors with them.
- Make sure your application or protocol can easily support a future change of cryptographic algorithms.

##### Hashing

DO: Use a strong hashing algorithm.

- In .NET (both Framework and Core), the strongest hashing algorithm for general hashing requirements is
  [System.Security.Cryptography.SHA512](https://docs.microsoft.com/en-us/dotnet/api/system.security.cryptography.sha512).
- For new ASP.NET Core applications, use ASP.NET Core Identity and its `PasswordHasher<TUser>` for password storage. [Microsoft advises against calling `KeyDerivation.Pbkdf2` directly for this purpose](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/consumer-apis/password-hashing?view=aspnetcore-10.0); it is a low-level primitive intended for integration with existing cryptographic systems.
- Do not use general-purpose hashes such as SHA-512 directly for password storage.
- Refer to the [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) for more information.

##### Passwords

DO: Follow the [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls) for password length and breached-password screening. Allow long passphrases without mandatory character-composition rules.

##### Encryption

DO: Use a strong encryption algorithm such as [AES-256](https://csrc.nist.gov/pubs/fips/197/final) where personally identifiable data needs to be restored to its original format.

DO: Protect encryption keys more than any other asset. Find more information about storing encryption keys at rest in the
  [Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html#storage).

DO: Use TLS 1.2+ for your entire site. Get a free certificate [LetsEncrypt.org](https://letsencrypt.org/) and automate renewals.

DO NOT: [Allow SSL, this is now obsolete](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices).

DO: Have a strong TLS policy (see [SSL Best Practices](https://www.ssllabs.com/projects/best-practices/index.html)), use TLS 1.2+ wherever possible. Then check the configuration using [SSL Test](https://www.ssllabs.com/ssltest/) or [TestSSL](https://testssl.sh/).

More information on Transport Layer Protection can be found in the
[Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html).

DO: Ensure headers are not disclosing information about your application. See [HttpHeaders.cs](https://github.com/johnstaveley/SecurityEssentials/blob/master/SecurityEssentials/Core/HttpHeaders.cs), [Dionach StripHeaders](https://github.com/Dionach/StripHeaders/), disable via `web.config` or [Startup.cs](https://medium.com/bugbountywriteup/security-headers-1c770105940b).

e.g Web.config

```xml
<system.web>
    <httpRuntime enableVersionHeader="false"/>
</system.web>
<system.webServer>
    <security>
        <requestFiltering removeServerHeader="true" />
    </security>
    <httpProtocol>
        <customHeaders>
            <add name="X-Content-Type-Options" value="nosniff" />
            <add name="X-Frame-Options" value="DENY" />
            <add name="X-Permitted-Cross-Domain-Policies" value="master-only"/>
            <add name="X-XSS-Protection" value="0"/>
            <remove name="X-Powered-By"/>
        </customHeaders>
    </httpProtocol>
</system.webServer>
```

e.g Startup.cs

``` csharp
app.UseHsts(hsts => hsts.MaxAge(365).IncludeSubdomains());
app.UseXContentTypeOptions();
app.UseReferrerPolicy(opts => opts.NoReferrer());
app.UseXXssProtection(options => options.FilterDisabled());
app.UseXfo(options => options.Deny());

app.UseCsp(opts => opts
 .BlockAllMixedContent()
 .StyleSources(s => s.Self())
 .StyleSources(s => s.UnsafeInline())
 .FontSources(s => s.Self())
 .FormActions(s => s.Self())
 .FrameAncestors(s => s.Self())
 .ImageSources(s => s.Self())
 .ScriptSources(s => s.Self())
 );
```

More information about headers can be found at the [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/).

##### Encryption for storage

- Use the [Windows Data Protection API (DPAPI)](https://docs.microsoft.com/en-us/dotnet/standard/security/how-to-use-data-protection) for secure local storage of sensitive data.
- Where DPAPI cannot be used, follow the algorithm guidance in the [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#algorithms).

The following code snippet shows an example of using AES-GCM to perform encryption/decryption of data. It is strongly recommended to have a cryptography expert review your final design and code, as even the most trivial error can severely weaken your encryption.

The code is based on example from here: [https://www.scottbrady91.com/c-sharp/aes-gcm-dotnet](https://www.scottbrady91.com/c-sharp/aes-gcm-dotnet)

A few constraints/pitfalls with this code:

- It does not take into account key rotation or management which is a whole topic in itself.
- It is important to use a different nonce for every encryption operation, even if the same key is used.
- The key will need to be stored securely.

<details>
  <summary>Click here to view the "AES-GCM symmetric encryption" code snippet.</summary>

```csharp
// Code based on example from here:
// https://www.scottbrady91.com/c-sharp/aes-gcm-dotnet

public class AesGcmSimpleTest
{
    public static void Main()
    {

        // Key of 32 bytes / 256 bits for AES
        var key = new byte[32];
        RandomNumberGenerator.Fill(key);

        // MaxSize = 12 bytes / 96 bits and this size should always be used.
        var nonce = new byte[AesGcm.NonceByteSizes.MaxSize];
        RandomNumberGenerator.Fill(nonce);

        // Tag for authenticated encryption
        var tag = new byte[AesGcm.TagByteSizes.MaxSize];

        var message = "This message to be encrypted";
        Console.WriteLine(message);

        // Encrypt the message
        var cipherText = AesGcmSimple.Encrypt(message, nonce, out tag, key);
        Console.WriteLine(Convert.ToBase64String(cipherText));

        // Decrypt the message
        var message2 = AesGcmSimple.Decrypt(cipherText, nonce, tag, key);
        Console.WriteLine(message2);

    }
}

public static class AesGcmSimple
{

    public static byte[] Encrypt(string plaintext, byte[] nonce, out byte[] tag, byte[] key)
    {
        using(var aes = new AesGcm(key))
        {
            // Tag for authenticated encryption
            tag = new byte[AesGcm.TagByteSizes.MaxSize];

            // Create a byte array from the message to encrypt
            var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);

            // Ciphertext will be same length in bytes as plaintext
            var ciphertext = new byte[plaintextBytes.Length];

            // perform the actual encryption
            aes.Encrypt(nonce, plaintextBytes, ciphertext, tag);
            return ciphertext;
        }
    }

    public static string Decrypt(byte[] ciphertext, byte[] nonce, byte[] tag, byte[] key)
    {
        using(var aes = new AesGcm(key))
        {
            // Plaintext will be same length in bytes as Ciphertext
            var plaintextBytes = new byte[ciphertext.Length];

            // perform the actual decryption
            aes.Decrypt(nonce, ciphertext, tag, plaintextBytes);

            return Encoding.UTF8.GetString(plaintextBytes);
        }
    }
}

```

</details>

##### Encryption for transmission

- Again, follow the algorithm guidance in the [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#algorithms).

The following code snippet shows an example of using Elliptic Curve/Diffie-Hellman (ECDH) together with AES-GCM to perform encryption/decryption of data between two different sides without the need to transfer the symmetric key between the two sides. Instead, the sides exchange public keys and can then use ECDH to generate a shared secret which can be used for the symmetric encryption.

Again, it is strongly recommended to have a cryptography expert review your final design and code, as even the most trivial error can severely weaken your encryption.

Note that this code sample relies on the `AesGcmSimple` class from the [previous section](#encryption-for-storage).

A few constraints/pitfalls with this code:

- It does not take into account key rotation or management which is a whole topic in itself.
- The code deliberately enforces a new nonce for every encryption operation but this must be managed as a separate data item alongside the ciphertext.
- The private keys will need to be stored securely.
- The code does not consider the validation of public keys before use.
- Overall, there is no verification of authenticity between the two sides.

<details>
  <summary>Click here to view the "ECDH asymmetric encryption" code snippet.</summary>

```csharp
public class ECDHSimpleTest
{
    public static void Main()
    {
        // Generate ECC key pair for Alice
        var alice = new ECDHSimple();
        byte[] alicePublicKey = alice.PublicKey;

        // Generate ECC key pair for Bob
        var bob = new ECDHSimple();
        byte[] bobPublicKey = bob.PublicKey;

        string plaintext = "Hello, Bob! How are you?";
        Console.WriteLine("Secret being sent from Alice to Bob: " + plaintext);

        // Note that a new nonce is generated with every encryption operation in line with
        // in line with the AES GCM security
        byte[] tag;
        byte[] nonce;
        var cipherText = alice.Encrypt(bobPublicKey, plaintext, out nonce, out tag);
        Console.WriteLine("Ciphertext, nonce, and tag being sent from Alice to Bob: " + Convert.ToBase64String(cipherText) + " " + Convert.ToBase64String(nonce) + " " + Convert.ToBase64String(tag));

        var decrypted = bob.Decrypt(alicePublicKey, cipherText, nonce, tag);
        Console.WriteLine("Secret received by Bob from Alice: " + decrypted);

        Console.WriteLine();

        string plaintext2 = "Hello, Alice! I'm good, how are you?";
        Console.WriteLine("Secret being sent from Bob to Alice: " + plaintext2);

        byte[] tag2;
        byte[] nonce2;
        var cipherText2 = bob.Encrypt(alicePublicKey, plaintext2, out nonce2, out tag2);
        Console.WriteLine("Ciphertext, nonce, and tag being sent from Bob to Alice: " + Convert.ToBase64String(cipherText2) + " " + Convert.ToBase64String(nonce2) + " " + Convert.ToBase64String(tag2));

        var decrypted2 = alice.Decrypt(bobPublicKey, cipherText2, nonce2, tag2);
        Console.WriteLine("Secret received by Alice from Bob: " + decrypted2);
    }
}

public class ECDHSimple
{

    private ECDiffieHellmanCng ecdh = new ECDiffieHellmanCng();

    public byte[] PublicKey
    {
        get
        {
            return ecdh.PublicKey.ToByteArray();
        }
    }

    public byte[] Encrypt(byte[] partnerPublicKey, string message, out byte[] nonce, out byte[] tag)
    {
        // Generate the AES Key and Nonce
        var aesKey = GenerateAESKey(partnerPublicKey);

        // Tag for authenticated encryption
        tag = new byte[AesGcm.TagByteSizes.MaxSize];

        // MaxSize = 12 bytes / 96 bits and this size should always be used.
        // A new nonce is generated with every encryption operation in line with
        // the AES GCM security model
        nonce = new byte[AesGcm.NonceByteSizes.MaxSize];
        RandomNumberGenerator.Fill(nonce);

        // return the encrypted value
        return AesGcmSimple.Encrypt(message, nonce, out tag, aesKey);
    }

    public string Decrypt(byte[] partnerPublicKey, byte[] ciphertext, byte[] nonce, byte[] tag)
    {
        // Generate the AES Key and Nonce
        var aesKey = GenerateAESKey(partnerPublicKey);

        // return the decrypted value
        return AesGcmSimple.Decrypt(ciphertext, nonce, tag, aesKey);
    }

    private byte[] GenerateAESKey(byte[] partnerPublicKey)
    {
        // Derive the secret based on this side's private key and the other side's public key
        byte[] secret = ecdh.DeriveKeyMaterial(CngKey.Import(partnerPublicKey, CngKeyBlobFormat.EccPublicBlob));

        byte[] aesKey = new byte[32]; // 256-bit AES key
        Array.Copy(secret, 0, aesKey, 0, 32); // Copy first 32 bytes as the key

        return aesKey;
    }
}
```

</details>

#### A03 Injection

##### SQL Injection

DO: Using an object relational mapper (ORM) or stored procedures is the most effective way of countering the SQL Injection vulnerability.

DO: Use parameterized queries where a direct SQL query must be used. More Information can be found in the
[Query Parameterization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html).

E.g., using Entity Framework:

```csharp
var sql = @"Update [User] SET FirstName = @FirstName WHERE Id = @Id";
context.Database.ExecuteSqlCommand(
    sql,
    new SqlParameter("@FirstName", firstname),
    new SqlParameter("@Id", id));
```

DO NOT: Concatenate strings anywhere in your code and execute them against your database (Known as *dynamic SQL*).

Note: You can still accidentally do this with ORMs or Stored procedures so check everywhere. For example:

```csharp
string sql = "SELECT * FROM Users WHERE UserName='" + txtUser.Text + "' AND Password='"
                + txtPassword.Text + "'";
context.Database.ExecuteSqlCommand(sql); // SQL Injection vulnerability!
```

DO: Practice Least Privilege - connect to the database using an account with a minimum set of permissions required
to do its job, not the database administrator account.

##### OS Injection

General guidance about OS Injection can be found in the [OS Command Injection Defense Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html).

DO: Use [System.Diagnostics.Process.Start](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?view=netframework-4.7.2) to call underlying OS functions.

e.g

``` csharp
var process = new System.Diagnostics.Process();
var startInfo = new System.Diagnostics.ProcessStartInfo();
startInfo.FileName = "validatedCommand";
startInfo.Arguments = "validatedArg1 validatedArg2 validatedArg3";
process.StartInfo = startInfo;
process.Start();
```

DO NOT: Assume that this mechanism will protect against malicious input designed to break out of one argument and then tamper with another argument to the process. This will still be possible.

DO: Use allowlist validation on all user supplied input wherever possible. Input validation prevents improperly formed data from entering an information system. For more information please see the [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

e.g Validating user input using [IPAddress.TryParse Method](https://docs.microsoft.com/en-us/dotnet/api/system.net.ipaddress.tryparse?view=netframework-4.8)

``` csharp
//User input
string ipAddress = "127.0.0.1";

//check to make sure an ip address was provided
if (!string.IsNullOrEmpty(ipAddress))
{
 // Create an instance of IPAddress for the specified address string (in
 // dotted-quad, or colon-hexadecimal notation).
 if (IPAddress.TryParse(ipAddress, out var address))
 {
  // Display the address in standard notation.
  return address.ToString();
 }
 else
 {
  //ipAddress is not of type IPAddress
  ...
 }
    ...
}
```

DO: Try to only accept characters which are simple alphanumeric.

DO NOT: Assume you can sanitize special characters without actually removing them. Various combinations of ```\```, ```'``` and ```@``` may have an unexpected impact on sanitization attempts.

DO NOT: Rely on methods without a security guarantee.

e.g. .NET Core 2.2 and greater and .NET 5 and greater support [ProcessStartInfo.ArgumentList](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.processstartinfo.argumentlist) which performs some character escaping but the object includes [a disclaimer that it is not safe with untrusted input](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.processstartinfo.argumentlist#remarks).

DO: Look at alternatives to passing raw untrusted arguments via command-line parameters such as encoding using Base64 (which would safely encode any special characters as well) and then decode the parameters in the receiving application.

##### LDAP injection

Almost any characters can be used in Distinguished Names. However, some must be escaped with the backslash `\` escape character.
A table showing which characters that should be escaped for Active Directory can be found at the in the
[LDAP Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html).

Note: The space character must be escaped only if it is the leading or trailing character in a component name, such as a Common Name.
Embedded spaces should not be escaped.

More information can be found in the [LDAP Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html).

#### A04 Insecure Design

Insecure design refers to security failures in the design of the application or system. This is different than the other items
in the OWASP Top 10 list which refer to implementation failures. The topic of secure design is therefore not related to a specific
technology or language and is therefore out of scope for this cheat sheet. See the [Secure Product Design Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Product_Design_Cheat_Sheet.html) for more information.

#### A05 Security Misconfiguration

##### Debug and Stack Trace

Ensure debug and trace are off in production. This can be enforced using web.config transforms:

```xml
<compilation xdt:Transform="RemoveAttributes(debug)" />
<trace enabled="false" xdt:Transform="Replace"/>
```

DO NOT: Use default passwords

DO: Redirect a request made over HTTP to HTTPS:

E.g, Global.asax.cs:

```csharp
protected void Application_BeginRequest()
{
    #if !DEBUG
    // SECURE: Ensure any request is returned over SSL/TLS in production
    if (!Request.IsLocal && !Context.Request.IsSecureConnection) {
        var redirect = Context.Request.Url.ToString()
                        .ToLower(CultureInfo.CurrentCulture)
                        .Replace("http:", "https:");
        Response.Redirect(redirect);
    }
    #endif
}
```

E.g., Startup.cs in `Configure()`:

``` csharp
  app.UseHttpsRedirection();
```

##### Cross-site request forgery

DO NOT: Send sensitive data without validating Anti-Forgery-Tokens ([.NET](https://docs.microsoft.com/en-us/aspnet/web-api/overview/security/preventing-cross-site-request-forgery-csrf-attacks) / [.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-7.0#aspnet-core-antiforgery-configuration)).

DO: Send the anti-forgery token with every POST/PUT request:

###### Using .NET Framework

```csharp
using (Html.BeginForm("LogOff", "Account", FormMethod.Post, new { id = "logoutForm",
                        @class = "pull-right" }))
{
    @Html.AntiForgeryToken()
    <ul class="nav nav-pills">
        <li role="presentation">
        Logged on as @User.Identity.Name
        </li>
        <li role="presentation">
        <a href="javascript:document.getElementById('logoutForm').submit()">Log off</a>
        </li>
    </ul>
}
```

Then validate it at the method or preferably the controller level:

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public ActionResult LogOff()
```

Make sure the tokens are removed completely for invalidation on logout.

```csharp
/// <summary>
/// SECURE: Remove any remaining cookies including Anti-CSRF cookie
/// </summary>
public void RemoveAntiForgeryCookie(Controller controller)
{
    string[] allCookies = controller.Request.Cookies.AllKeys;
    foreach (string cookie in allCookies)
    {
        if (controller.Response.Cookies[cookie] != null &&
            cookie == "__RequestVerificationToken")
        {
            controller.Response.Cookies[cookie].Expires = DateTime.Now.AddDays(-1);
        }
    }
}
```

###### Using .NET Core 2.0 or later

Starting with .NET Core 2.0 it is possible to [automatically generate and verify the antiforgery token](https://docs.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-7.0#aspnet-core-antiforgery-configuration).

With [FormTagHelper enabled](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-7.0#aspnet-core-antiforgery-configuration), a form with `method="post"` and an absent or empty `action` automatically gets an antiforgery token unless token generation is disabled. This does not apply to every form. You can check whether tag helpers are enabled in your main `_ViewImports.cshtml` file:

```csharp
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
```

`IHtmlHelper.BeginForm` generates an antiforgery token by default for methods other than GET. Token generation must be paired with server-side validation, as described below.

For forms that need antiforgery protection without automatic token generation, add the token explicitly:

```html
<form action="RelevantAction" >
@Html.AntiForgeryToken()
</form>
```

To automatically validate all requests other than GET, HEAD, OPTIONS and TRACE you need to add a global action filter with the [AutoValidateAntiforgeryToken](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.autovalidateantiforgerytokenattribute?view=aspnetcore-7.0) attribute inside your `Startup.cs` as mentioned in the following [article](https://andrewlock.net/automatically-validating-anti-forgery-tokens-in-asp-net-core-with-the-autovalidateantiforgerytokenattribute/):

```csharp
services.AddMvc(options =>
{
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
});
```

If you need to disable the attribute validation for a specific method on a controller you can add the [IgnoreAntiforgeryToken](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.ignoreantiforgerytokenattribute?view=aspnetcore-7.0) attribute to the controller method (for MVC controllers) or parent class (for Razor pages):

```csharp
[IgnoreAntiforgeryToken]
[HttpDelete]
public IActionResult Delete()
```

```csharp
[IgnoreAntiforgeryToken]
public class UnsafeModel : PageModel
```

If you need to also validate the token on GET, HEAD, OPTIONS and TRACE requests you can add the [ValidateAntiforgeryToken](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.validateantiforgerytokenattribute?view=aspnetcore-7.0) attribute to the controller method (for MVC controllers) or parent class (for Razor pages):

```csharp
[HttpGet]
[ValidateAntiforgeryToken]
public IActionResult DoSomethingDangerous()
```

```csharp
[HttpGet]
[ValidateAntiforgeryToken]
public class SafeModel : PageModel
```

In case you can't use a global action filter, add the [AutoValidateAntiforgeryToken](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.autovalidateantiforgerytokenattribute?view=aspnetcore-7.0) attribute to your controller classes or razor page models:

```csharp
[AutoValidateAntiforgeryToken]
public class UserController
```

```csharp
[AutoValidateAntiforgeryToken]
public class SafeModel : PageModel
```

###### Using .Net Core or .NET Framework with AJAX

You will need to attach the anti-forgery token to AJAX requests.

If you are using jQuery in an ASP.NET Core MVC view this can be achieved using this snippet:

```javascript
@inject  Microsoft.AspNetCore.Antiforgery.IAntiforgery antiforgeryProvider
$.ajax(
{
    type: "POST",
    url: '@Url.Action("Action", "Controller")',
    contentType: "application/x-www-form-urlencoded; charset=utf-8",
    data: {
        id: id,
        '__RequestVerificationToken': '@antiforgeryProvider.GetAndStoreTokens(this.Context).RequestToken'
    }
})
```

If you are using the .NET Framework, you can find some code snippets [here](https://docs.microsoft.com/en-us/aspnet/web-api/overview/security/preventing-cross-site-request-forgery-csrf-attacks#anti-csrf-and-ajax).

More information can be found in the [Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

#### A06 Vulnerable and Outdated Components

DO: Keep the .NET framework updated with the latest patches

DO: Keep your [NuGet](https://docs.microsoft.com/en-us/nuget/) packages up to date

DO: Run the [OWASP Dependency Checker](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html#tools) against your application as part of your build process and act on any high or critical level vulnerabilities.

DO: Include SCA (software composition analysis) tools in your CI/CD pipeline to ensure that any new vulnerabilities
in your dependencies are detected and acted upon.

#### A07 Identification and Authentication Failures

DO: Use [ASP.NET Core Identity](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity?view=aspnetcore-2.2&).
ASP.NET Core Identity framework is well configured by default, where it uses secure password hashes and an individual salt. Identity uses the PBKDF2 hashing function for passwords, and generates a random salt per user.

DO: Configure password length and composition settings according to [NIST’s password guidance](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/#passwordver): at least 15 characters when passwords can be used without multifactor authentication (MFA), or at least eight when only used with MFA, without mandatory character-composition rules.

This ASP.NET Core Identity example assumes passwords can be used without MFA. Identity’s [default password validator](https://github.com/dotnet/aspnetcore/blob/215a587e52efa710de84138b0a3374b860b924d8/src/Identity/Extensions.Core/src/PasswordValidator.cs) measures length in UTF-16 code units, so add Unicode code-point length validation to enforce NIST’s minimum. These settings also do not implement breached-password screening; follow the [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls) for the complete policy.

``` csharp
//Startup.cs
services.Configure<IdentityOptions>(options =>
{
 // Password settings
 options.Password.RequireDigit = false;
 options.Password.RequiredLength = 15;
 options.Password.RequireNonAlphanumeric = false;
 options.Password.RequireUppercase = false;
 options.Password.RequireLowercase = false;
 options.Password.RequiredUniqueChars = 1;

 options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
 options.Lockout.MaxFailedAccessAttempts = 3;

 options.SignIn.RequireConfirmedEmail = true;

 options.User.RequireUniqueEmail = true;
});
```

DO: Set a cookie policy

e.g

``` csharp
//Startup.cs
services.ConfigureApplicationCookie(options =>
{
 options.Cookie.HttpOnly = true;
 options.ExpireTimeSpan = TimeSpan.FromMinutes(60);
 // See the discussion in A01 for trade-offs on using sliding expiration.
 options.SlidingExpiration = false;
});
```

#### A08 Software and Data Integrity Failures

DO: Digitally sign assemblies and executable files

DO: Use Nuget package signing

DO: Review code and configuration changes to avoid malicious code
or dependencies being introduced

DO NOT: Send unsigned or unencrypted serialized objects over the network

DO: Perform integrity checks or validate digital signatures on serialized
objects received from the network

DO NOT: Use the BinaryFormatter type which is dangerous and [not recommended](https://learn.microsoft.com/en-us/dotnet/standard/serialization/binaryformatter-security-guide) for data processing.
.NET offers several in-box serializers that can handle untrusted data safely:

- XmlSerializer and DataContractSerializer to serialize object graphs into and from XML. Do not confuse DataContractSerializer with NetDataContractSerializer.
- BinaryReader and BinaryWriter for reading and writing primitive data types (such as Int32, Double, Boolean, and String) in binary format.
- The System.Text.Json APIs to serialize object graphs into JSON.

#### A09 Security Logging and Monitoring Failures

DO: Ensure all login, access control, and server-side input validation failures are logged with sufficient user context to identify suspicious or malicious accounts.

DO: Establish effective monitoring and alerting so suspicious activities are detected and responded to in a timely fashion.

DO NOT: Log generic error messages such as: ```csharp Log.Error("Error was thrown");```. Instead, log the stack trace, error message and user ID who caused the error.

DO NOT: Log sensitive data such as user's passwords.

##### Logging

What logs to collect and more information about logging can be found in the [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

.NET Core comes with a LoggerFactory, which is in Microsoft.Extensions.Logging. More information about ILogger can be found [here](https://docs.microsoft.com/en-us/dotnet/api/microsoft.extensions.logging.ilogger).

Here's how to log all errors from the `Startup.cs`, so that anytime an error is thrown it will be logged:

``` csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    if (env.IsDevelopment())
    {
        _isDevelopment = true;
        app.UseDeveloperExceptionPage();
    }

    //Log all errors in the application
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            var errorFeature = context.Features.Get<IExceptionHandlerFeature>();
            var exception = errorFeature.Error;

            Log.Error(String.Format("Stacktrace of error: {0}",exception.StackTrace.ToString()));
        });
    });

    app.UseAuthentication();
    app.UseMvc();
 }
}
```

E.g. injecting into the class constructor, which makes writing unit test simpler. This is recommended if instances of the class will be created using dependency injection (e.g. MVC controllers). The below example logs unsuccessful login attempts and sets [`lockoutOnFailure: true`](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration?view=aspnetcore-10.0#lockout) so failed password attempts count toward the configured lockout threshold for accounts with lockout enabled.

``` csharp
public class AccountsController : Controller
{
        private ILogger _Logger;

        public AccountsController(ILogger logger)
        {
            _Logger = logger;
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, model.RememberMe, lockoutOnFailure: true);
                if (result.Succeeded)
                {
                    //Log all successful log in attempts
                    Log.Information(String.Format("User: {0}, Successfully Logged in", model.Email));
                    //Code for successful login
                    //...
                }
                else
                {
                    //Log all incorrect log in attempts
                    Log.Information(String.Format("User: {0}, Incorrect Password", model.Email));
                }
             }
            ...
        }
```

##### Monitoring

Monitoring allow us to validate the performance and health of a running system through key performance indicators.

In .NET a great option to add monitoring capabilities is [Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/asp-net-core).

More information about Logging and Monitoring can be found [here](https://github.com/microsoft/code-with-engineering-playbook/blob/main/docs/observability/README.md).

#### A10 Server-Side Request Forgery (SSRF)

DO: Validate and sanitize all user input before using it to make a request

DO: Use an allowlist of allowed protocols and domains

DO: Use `IPAddress.TryParse()` and `Uri.CheckHostName()` to ensure that IP addresses and domain names are valid

DO NOT: Follow HTTP redirects

DO NOT: Forward raw HTTP responses to the user

For more information please see the [Server-Side Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

#### OWASP 2013 & 2017

Below are vulnerabilities that were included in the 2013 or 2017 OWASP Top 10 list
that were not included in the 2021 list. These vulnerabilities are still relevant
but were not included in the 2021 list because they have become less prevalent.

##### A04:2017 XML External Entities (XXE)

XXE attacks occur when an XML parse does not properly process user input that contains external entity declarations in the doctype of an XML payload.

[This article](https://docs.microsoft.com/en-us/dotnet/standard/data/xml/xml-processing-options) discusses the most common XML Processing Options for .NET.

Please refer to the [XXE cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html#net) for more detailed information on preventing XXE and other XML Denial of Service attacks.

##### A07:2017 Cross-Site Scripting (XSS)

DO NOT: Trust any data the user sends you. Prefer allowlists (always safe) over denylists.

You get encoding of all HTML content with MVC3. To properly encode all content whether HTML,
JavaScript, CSS, LDAP, etc., use the Microsoft AntiXSS library:

`Install-Package AntiXSS`

Then set in config:

```xml
<system.web>
<httpRuntime targetFramework="4.5"
enableVersionHeader="false"
encoderType="Microsoft.Security.Application.AntiXssEncoder, AntiXssLibrary"
maxRequestLength="4096" />
```

DO NOT: Use the `[AllowHTML]` attribute or helper class `@Html.Raw` unless you are absolutely
sure that the content you are writing to the browser is safe and has been escaped properly.

DO: Enable a [Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html#context). This will prevent your pages from accessing assets they should not be able to access (e.g. malicious scripts):

```xml
<system.webServer>
    <httpProtocol>
        <customHeaders>
            <add name="Content-Security-Policy"
                value="default-src 'none'; style-src 'self'; img-src 'self';
                font-src 'self'; script-src 'self'" />
```

More information can be found in the [Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

##### A08:2017 Insecure Deserialization

DO NOT: Accept Serialized Objects from Untrusted Sources

DO: Validate User Input

Malicious users are able to use objects like cookies to insert malicious information to change user roles. In some cases, hackers are able to elevate their privileges to administrator rights by using a pre-existing or cached password hash from a previous session.

DO: Prevent Deserialization of Domain Objects

DO: Run the Deserialization Code with Limited Access Permissions
If a deserialized hostile object tries to initiate a system process or access a resource within the server or the host's OS, it will be denied access and a permission flag will be raised so that a system administrator is made aware of any anomalous activity on the server.

More information about Insecure Deserialization can be found in the [Deserialization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html#net-csharp).

##### A10:2013 Unvalidated redirects and forwards

A protection against this was introduced in MVC 3 template. Here is the code:

```csharp
public async Task<ActionResult> LogOn(LogOnViewModel model, string returnUrl)
{
    if (ModelState.IsValid)
    {
        var logonResult = await _userManager.TryLogOnAsync(model.UserName, model.Password);
        if (logonResult.Success)
        {
            await _userManager.LogOnAsync(logonResult.UserName, model.RememberMe);  
            return RedirectToLocal(returnUrl);
...
```

```csharp
private ActionResult RedirectToLocal(string returnUrl)
{
    if (Url.IsLocalUrl(returnUrl))
    {
        return Redirect(returnUrl);
    }
    else
    {
        return RedirectToAction("Landing", "Account");
    }
}
```

#### Other advice

- Protect against Clickjacking and Man-in-the-Middle attack from capturing an initial Non-TLS request: Set the `X-Frame-Options` and `Strict-Transport-Security` (HSTS) headers. Full details [here](https://github.com/johnstaveley/SecurityEssentials/blob/master/SecurityEssentials/Core/HttpHeaders.cs)
- Protect against a man-in-the-middle attack for a user who has never been to your site before. Register for [HSTS preload](https://hstspreload.org/)
- Maintain security testing and analysis on Web API services. They are hidden inside MVC sites, and are public parts of a site that
will be found by an attacker. All of the MVC guidance and much of the WCF guidance applies to Web API as well.
- Also see the [Unvalidated Redirects and Forwards Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html).

##### Sample project

For more information on all of the above and code samples incorporated into a sample MVC5 application with an enhanced security baseline
go to [Security Essentials Baseline project](http://github.com/johnstaveley/SecurityEssentials/).

### Guidance for specific topics

This section contains guidance for specific topics in .NET.

#### Configuration and Deployment

- Lock down config files.
    - Remove all aspects of configuration that are not in use.
    - **Do not store secrets in source-controlled config files (`web.config`, `appsettings.json`).** Keep secrets out of the configuration file entirely.
        - Modern .NET (Core / 6+ / 8+): use [User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) for development and a managed secret store (Azure Key Vault, AWS Secrets Manager, HashiCorp Vault) accessed via Managed Identity / Workload Identity for production.
        - Legacy .NET Framework (4.7.1+): use [Configuration Builders](https://learn.microsoft.com/en-us/aspnet/config-builder) (e.g. `Microsoft.Configuration.ConfigurationBuilders.Azure`, `...Environment`) to inject secrets at runtime from a secret store or environment variables, so they never appear in `web.config`.
        - Only as a last resort — for legacy applications that cannot be modified — encrypt sensitive `web.config` sections using `aspnet_regiis -pe` ([command line help](https://docs.microsoft.com/en-us/previous-versions/dotnet/netframework-2.0/k6h9cz8h(v=vs.80))). Note that this only protects the file at rest on the server; the application still loads the plaintext into memory.
- For ClickOnce applications, the .NET Framework should be upgraded to use the latest version to ensure support of TLS 1.2 or later.

#### Data Access

- Use [Parameterized SQL](https://docs.microsoft.com/en-us/dotnet/api/system.data.sqlclient.sqlcommand.prepare?view=netframework-4.7.2) commands for all data access, without exception.
- Do not use [SqlCommand](https://docs.microsoft.com/en-us/dotnet/api/system.data.sqlclient.sqlcommand) with a string parameter made up of a [concatenated SQL String](https://docs.microsoft.com/en-gb/visualstudio/code-quality/ca2100-review-sql-queries-for-security-vulnerabilities?view=vs-2017).
- List allowable values coming from the user. Use enums, [TryParse](https://docs.microsoft.com/en-us/dotnet/api/system.int32.tryparse#System_Int32_TryParse_System_String_System_Int32__) or lookup values to assure that the data coming from the user is as expected.
    - Enums are still vulnerable to unexpected values because .NET only validates a successful cast to the underlying data type, integer by default. [Enum.IsDefined](https://docs.microsoft.com/en-us/dotnet/api/system.enum.isdefined) can validate whether the input value is valid within the list of defined constants.
- Apply the principle of least privilege when setting up the Database User in your database of choice. The database user should only be able to access items that make sense for the use case.
- Use of [Entity Framework](https://docs.microsoft.com/en-us/ef/) is a very effective [SQL injection](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) prevention mechanism. **Remember that building your own ad hoc queries in Entity Framework is just as susceptible to SQLi as a plain SQL query**.
- When using SQL Server, prefer [integrated authentication](https://learn.microsoft.com/en-us/sql/connect/odbc/linux-mac/using-integrated-authentication?view=sql-server-ver16) over [SQL authentication](https://learn.microsoft.com/en-us/sql/relational-databases/security/choose-an-authentication-mode?view=sql-server-ver16#connecting-through-sql-server-authentication).
- Use [Always Encrypted](https://docs.microsoft.com/en-us/sql/relational-databases/security/encryption/always-encrypted-database-engine) where possible for sensitive data (SQL Server 2016+ and Azure SQL)

### ASP NET Web Forms Guidance

ASP.NET Web Forms is the original browser-based application development API for the .NET Framework, and is still the most common enterprise platform for web application development.

- Always use [HTTPS](http://support.microsoft.com/kb/324069).
- Enable [requireSSL](https://docs.microsoft.com/en-us/dotnet/api/system.web.configuration.httpcookiessection.requiressl) on cookies and form elements and [HttpOnly](https://docs.microsoft.com/en-us/dotnet/api/system.web.configuration.httpcookiessection.httponlycookies) on cookies in the web.config.
- Implement [customErrors](https://docs.microsoft.com/en-us/dotnet/api/system.web.configuration.customerror).
- Make sure [tracing](http://www.iis.net/configreference/system.webserver/tracing) is turned off.
- While ViewState isn't always appropriate for web development, using it can provide CSRF mitigation. To make the ViewState protect against CSRF attacks you need to set the [ViewStateUserKey](https://docs.microsoft.com/en-us/dotnet/api/system.web.ui.page.viewstateuserkey):

```csharp
protected override OnInit(EventArgs e) {
    base.OnInit(e);
    ViewStateUserKey = Session.SessionID;
}
```

If you don't use Viewstate, then look to the default main page of the ASP.NET Web Forms default template for a manual anti-CSRF token using a double-submit cookie.

```csharp
private const string AntiXsrfTokenKey = "__AntiXsrfToken";
private const string AntiXsrfUserNameKey = "__AntiXsrfUserName";
private string _antiXsrfTokenValue;
protected void Page_Init(object sender, EventArgs e)
{
    // The code below helps to protect against XSRF attacks
    var requestCookie = Request.Cookies[AntiXsrfTokenKey];
    Guid requestCookieGuidValue;
    if (requestCookie != null && Guid.TryParse(requestCookie.Value, out requestCookieGuidValue))
    {
       // Use the Anti-XSRF token from the cookie
       _antiXsrfTokenValue = requestCookie.Value;
       Page.ViewStateUserKey = _antiXsrfTokenValue;
    }
    else
    {
       // Generate a new Anti-XSRF token and save to the cookie
       _antiXsrfTokenValue = Guid.NewGuid().ToString("N");
       Page.ViewStateUserKey = _antiXsrfTokenValue;
       var responseCookie = new HttpCookie(AntiXsrfTokenKey)
       {
          HttpOnly = true,
          Value = _antiXsrfTokenValue
       };
       if (FormsAuthentication.RequireSSL && Request.IsSecureConnection)
       {
          responseCookie.Secure = true;
       }
       Response.Cookies.Set(responseCookie);
    }
    Page.PreLoad += master_Page_PreLoad;
}
protected void master_Page_PreLoad(object sender, EventArgs e)
{
    if (!IsPostBack)
    {
       // Set Anti-XSRF token
       ViewState[AntiXsrfTokenKey] = Page.ViewStateUserKey;
       ViewState[AntiXsrfUserNameKey] = Context.User.Identity.Name ?? String.Empty;
    }
    else
    {
       // Validate the Anti-XSRF token
       if ((string)ViewState[AntiXsrfTokenKey] != _antiXsrfTokenValue ||
          (string)ViewState[AntiXsrfUserNameKey] != (Context.User.Identity.Name ?? String.Empty))
       {
          throw new InvalidOperationException("Validation of Anti-XSRF token failed.");
       }
    }
}
```

- Consider [HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) in IIS. See [here](https://support.microsoft.com/en-us/help/954002/how-to-add-a-custom-http-response-header-to-a-web-site-that-is-hosted) for the procedure.
- This is a recommended `web.config` setup that handles HSTS among other things.

```xml
<?xml version="1.0" encoding="UTF-8"?>
 <configuration>
   <system.web>
     <httpRuntime enableVersionHeader="false"/>
   </system.web>
   <system.webServer>
     <security>
       <requestFiltering removeServerHeader="true" />
     </security>
     <staticContent>
       <clientCache cacheControlCustom="public"
            cacheControlMode="UseMaxAge"
            cacheControlMaxAge="1.00:00:00"
            setEtag="true" />
     </staticContent>
     <httpProtocol>
       <customHeaders>
         <add name="Content-Security-Policy"
            value="default-src 'none'; style-src 'self'; img-src 'self'; font-src 'self'" />
         <add name="X-Content-Type-Options" value="NOSNIFF" />
         <add name="X-Frame-Options" value="DENY" />
         <add name="X-Permitted-Cross-Domain-Policies" value="master-only"/>
         <add name="X-XSS-Protection" value="0"/>
         <remove name="X-Powered-By"/>
       </customHeaders>
     </httpProtocol>
     <rewrite>
       <rules>
         <rule name="Redirect to https">
           <match url="(.*)"/>
           <conditions>
             <add input="{HTTPS}" pattern="Off"/>
             <add input="{REQUEST_METHOD}" pattern="^get$|^head$" />
           </conditions>
           <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent"/>
         </rule>
       </rules>
       <outboundRules>
         <rule name="Add HSTS Header" enabled="true">
           <match serverVariable="RESPONSE_Strict_Transport_Security" pattern=".*" />
           <conditions>
             <add input="{HTTPS}" pattern="on" ignoreCase="true" />
           </conditions>
           <action type="Rewrite" value="max-age=15768000" />
         </rule>
       </outboundRules>
     </rewrite>
   </system.webServer>
 </configuration>
```

- Remove the version header by adding the following line in `Machine.config` file:

```xml
<httpRuntime enableVersionHeader="false" />
```

- Also remove the Server header using the HttpContext Class in your code.

```csharp
HttpContext.Current.Response.Headers.Remove("Server");
```

#### HTTP validation and encoding

- Do not disable [validateRequest](http://www.asp.net/whitepapers/request-validation) in the `web.config` or the page setup. This value enables limited XSS protection in ASP.NET and should be left intact as it provides partial prevention of Cross Site Scripting. Complete request validation is recommended in addition to the built-in protections.
- The 4.5 version of the .NET Frameworks includes the [AntiXssEncoder](https://docs.microsoft.com/en-us/dotnet/api/system.web.security.antixss.antixssencoder?view=netframework-4.7.2) library, which has a comprehensive input encoding library for the prevention of XSS. Use it.
- List allowable values anytime user input is accepted.
- Validate the format of URIs using [Uri.IsWellFormedUriString](https://docs.microsoft.com/en-us/dotnet/api/system.uri.iswellformeduristring).

#### Forms authentication

- Use cookies for persistence when possible. `Cookieless` auth will default to [UseDeviceProfile](https://docs.microsoft.com/en-us/dotnet/api/system.web.httpcookiemode?view=netframework-4.7.2).
- Don't trust the URI of the request for persistence of the session or authorization. It can be easily faked.
- Reduce the Forms Authentication timeout from the default of *20 minutes* to the shortest period appropriate for your application. If [slidingExpiration](https://docs.microsoft.com/en-us/dotnet/api/system.web.security.formsauthentication.slidingexpiration?view=netframework-4.7.2) is used this timeout resets after each request, so active users won't be affected.
- If HTTPS is not used, [slidingExpiration](https://docs.microsoft.com/en-us/dotnet/api/system.web.security.formsauthentication.slidingexpiration?view=netframework-4.7.2) should be disabled. Consider disabling [slidingExpiration](https://docs.microsoft.com/en-us/dotnet/api/system.web.security.formsauthentication.slidingexpiration?view=netframework-4.7.2) even with HTTPS.
- Always implement proper access controls.
    - Compare user provided username with `User.Identity.Name`.
    - Check roles against `User.Identity.IsInRole`.
- Use the [ASP.NET Membership provider and role provider](https://docs.microsoft.com/en-us/dotnet/framework/wcf/samples/membership-and-role-provider), but review the password storage. The default storage hashes the password with a single iteration of SHA-1 which is rather weak. The ASP.NET MVC4 template uses [ASP.NET Identity](http://www.asp.net/identity/overview/getting-started/introduction-to-aspnet-identity) instead of ASP.NET Membership, and ASP.NET Identity uses PBKDF2 by default which is better. Review the OWASP [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) for more information.
- Explicitly authorize resource requests.
- Leverage role based authorization using `User.Identity.IsInRole`.

### XAML Guidance

- Work within the constraints of Internet Zone security for your application.
- Use ClickOnce deployment. For enhanced permissions, use permission elevation at runtime or trusted application deployment at install time.

### Windows Forms Guidance

- Use partial trust when possible. Partially trusted Windows applications reduce the attack surface of an application. Manage a list of what permissions your app must use, and what it may use, and then make the request for those permissions declaratively at runtime.
- Use ClickOnce deployment. For enhanced permissions, use permission elevation at runtime or trusted application deployment at install time.

### WCF Guidance

- Use HTTPS for RESTful requests regardless of HTTP method, and choose methods according to their semantics. Keep sensitive values out of URLs, which can be exposed in logs and browser history even with HTTPS. [POST can carry sensitive form data in the request body rather than the URL](https://www.rfc-editor.org/rfc/rfc9110.html#section-17.9), but POST alone does not provide confidentiality or authorization.
- Avoid [BasicHttpBinding](https://docs.microsoft.com/en-us/dotnet/api/system.servicemodel.basichttpbinding?view=netframework-4.7.2). It has no default security configuration. Use [WSHttpBinding](https://docs.microsoft.com/en-us/dotnet/api/system.servicemodel.wshttpbinding?view=netframework-4.7.2) instead.
- Use at least two security modes for your binding. Message security includes security provisions in the headers. Transport security means use of SSL. [TransportWithMessageCredential](https://docs.microsoft.com/en-us/dotnet/framework/wcf/samples/ws-transport-with-message-credential) combines the two.
- Test your WCF implementation with a fuzzer like [ZAP](https://www.zaproxy.org/).

## Ruby on Rails

> **Source:** [Ruby on Rails](https://cheatsheetseries.owasp.org/cheatsheets/Ruby_on_Rails_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This *Cheatsheet* intends to provide quick basic Ruby on Rails security tips for developers. It complements, augments or emphasizes points brought up in the [Rails security guide](https://guides.rubyonrails.org/security.html) from rails core.

The Rails framework abstracts developers from quite a bit of tedious work and provides the means to accomplish complex tasks quickly and with ease. New developers, those unfamiliar with the inner-workings of Rails, likely need a basic set of guidelines to secure fundamental aspects of their application. The intended purpose of this doc is to be that guide.

### Items

#### Command Injection

Ruby offers a function called "eval" which will dynamically build new Ruby code based on Strings. It also has a number of ways to call system commands.

``` ruby
eval("ruby code here")
system("os command here")
`ls -al /` # (backticks contain os command)
exec("os command here")
spawn("os command here")
open("| os command here")
Process.exec("os command here")
Process.spawn("os command here")
IO.binread("| os command here")
IO.binwrite("| os command here", "foo")
IO.foreach("| os command here") {}
IO.popen("os command here")
IO.read("| os command here")
IO.readlines("| os command here")
IO.write("| os command here", "foo")
```

While the power of these commands is quite useful, extreme care should be taken when using them in a Rails based application. Usually, its just a bad idea. If need be, an allow-list of possible values should be used and any input should be validated as thoroughly as possible.

The guides from [Rails](https://guides.rubyonrails.org/security.html#command-line-injection) and [OWASP](https://owasp.org/www-community/attacks/Command_Injection) contain further information on command injection.

#### SQL Injection

Ruby on Rails is often used with an ORM called ActiveRecord, though it is flexible and can be used with other data sources. Typically very simple Rails applications use methods on the Rails models to query data. Many use cases protect for SQL Injection out of the box. However, it is possible to write code that allows for SQL Injection.

``` ruby
name = params[:name]
@projects = Project.where("name like '" + name + "'");
```

The statement is injectable because the name parameter is not escaped.

Here is the idiom for building this kind of statement:

``` ruby
@projects = Project.where("name like ?", "%#{ActiveRecord::Base.sanitize_sql_like(params[:name])}%")
```

Use caution not to build SQL statements based on user controlled input. A list of more realistic and detailed examples is here: [rails-sqli.org](https://rails-sqli.org). OWASP has extensive information about [SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection).

#### Cross-site Scripting (XSS)

By default, protection against XSS comes as the default behavior. When string data is shown in views, it is escaped prior to being sent back to the browser. This goes a long way, but there are common cases where developers bypass this protection - for example to enable rich text editing. In the event that you want to pass variables to the front end with tags intact, it is tempting to do the following in your .erb file (ruby markup).

``` ruby
# Wrong! Do not do this!
<%= raw @product.name %>

# Wrong! Do not do this!
<%== @product.name %>

# Wrong! Do not do this!
<%= @product.name.html_safe %>
```

Unfortunately, any field that uses `raw`, `html_safe` or similar like this will be a potential XSS target. Note that there are also widespread misunderstandings about `html_safe()`.

[This writeup](https://stackoverflow.com/questions/4251284/raw-vs-html-safe-vs-h-to-unescape-html) describes the underlying SafeBuffer mechanism in detail. Other tags that change the way strings are prepared for output can introduce similar issues.

The method `html_safe` of String is somewhat confusingly named. It means that we know for sure the content of the string is safe to include in HTML without escaping. **This method itself is un-safe!**

If you must accept HTML content from users, consider a markup language for rich text in an application (Examples include: Markdown and textile) and disallow HTML tags. This helps ensures that the input accepted doesn't include HTML content that could be malicious.

If you cannot restrict your users from entering HTML, consider implementing content security policy to disallow the execution of any JavaScript. And finally, consider using the `#sanitize` method that lets you list allowed tags. Be careful, this method has been shown to be flawed numerous times and will never be a complete solution.

User-controlled link destinations require URL validation in addition to HTML escaping:

``` ruby
<%= link_to "Personal Website", @user.website %>
```

If `@user.website` contains a `javascript:` URL, clicking the generated link can execute script:

``` html
<a href="javascript:alert('Haxored')">Personal Website</a>
```

[`link_to`](https://api.rubyonrails.org/classes/ActionView/Helpers/UrlHelper.html#method-i-link_to) does not enforce a URL-scheme allowlist. Validate personal website URLs to allow only `https` or `http` before rendering them, and retain HTML attribute escaping. See the [XSS prevention rules](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#xss-prevention-rules-summary) for URL validation and encoding requirements. Do not use `html_safe` to bypass escaping.

A restrictive Content Security Policy can additionally [block `javascript:` navigation](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/javascript#description), but it does not replace URL validation.

[Brakeman scanner](https://github.com/presidentbeef/brakeman) helps in finding XSS problems in Rails apps.

OWASP provides more general information about XSS in a top level page: [Cross-site Scripting (XSS)](https://owasp.org/www-community/attacks/xss/).

#### Sessions

By default, Ruby on Rails uses a Cookie based session store. What that means is that unless you change something, the session will not expire on the server. That means that some default applications may be vulnerable to replay attacks. It also means that sensitive information should never be put in the session.

The best practice is to use a database based session, which thankfully is very easy with Rails:

``` ruby
Project::Application.config.session_store :active_record_store
```

There is an [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

#### Authentication

As with all sensitive data, start securing your authentication with enabling TLS in your configuration:

``` ruby
# config/environments/production.rb
# Force all access to the app over SSL, use Strict-Transport-Security,
# and use secure cookies
config.force_ssl = true
```

Uncomment the line 3 as above in your configuration.

Rails 8.0 introduced a built-in [authentication generator](https://guides.rubyonrails.org/security.html#authentication) for basic authentication and password reset functionality. It is a starting point that must be adapted to the application, including implementing its sign-up flow. Libraries such as Devise remain another option.

The following examples use the Devise gem.

Install it using:

```bash
gem 'devise'
```

Then install it to the user model:

```bash
rails generate devise:install
```

Next, specify which resources (routes) require authenticated access in routes:

``` ruby
Rails.application.routes.draw do
  authenticate :user do
    resources :something do  # these resource require authentication
      ...
    end
  end

  devise_for :users # sign-up/-in/out routes

  root to: 'static#home' # no authentication required
end
```

To enforce password complexity, it is possible to use [zxcvbn gem](https://github.com/bitzesty/devise_zxcvbn). Configure your user model with it:

``` ruby
class User < ApplicationRecord
  devise :database_authenticatable,
    # other devise features, then
    :zxcvbnable
end
```

And configure the required password complexity:

``` ruby
# in config/initializers/devise.rb
Devise.setup do |config|
  # zxcvbn score for devise
  config.min_password_score = 4 # complexity score here.
  ...
```

You can try out [this PoC](https://github.com/qutorial/revise) to learn more about it.

Next, [omniauth gem](https://github.com/omniauth/omniauth) allows for multiple strategies for authentication. Using it one can configure secure authentication with Facebook, LDAP and many other providers. Read on [here](https://github.com/omniauth/omniauth#integrating-omniauth-into-your-application).

##### Token Authentication

Devise usually uses Cookies for authentication.

In the case token authentication is wished instead, it could be implemented with a gem [devise_token_auth](https://github.com/lynndylanhurley/devise_token_auth).

It supports multiple front end technologies, for example angular2-token.

This gem is configured similar to the devise gem itself. It also requires omniauth as a dependency.

```bash
# token-based authentication
gem 'devise_token_auth'
gem 'omniauth'
```

Then a route is defined:

```ruby
mount_devise_token_auth_for 'User', at: 'auth'
```

And the User model is modified accordingly.

These actions can be done with one command:

```bash
rails g devise_token_auth:install [USER_CLASS] [MOUNT_PATH]
```

You may need to edit the generated migration to avoid unnecessary fields and/or field duplication depending on your use case.

Note: when you use only token authentication, there is no more need in [CSRF](https://owasp.org/www-community/attacks/csrf) protection in controllers. If you use both ways: cookies and tokens, the paths where cookies are used for authentication still must be protected from forgery!

There is an [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).

#### Insecure Direct Object Reference or Forceful Browsing

By default, Ruby on Rails apps use a RESTful URI structure. That means that paths are often intuitive and guessable. To protect against a user trying to access or modify data that belongs to another user, it is important to specifically control actions. Out of the gate on a vanilla Rails application, there is no such built-in protection. It is possible to do this by hand at the controller level.

It is also possible, and probably recommended, to consider resource-based access control libraries such as [cancancan](https://github.com/CanCanCommunity/cancancan) (cancan replacement) or [pundit](https://github.com/varvet/pundit) to do this. This ensures that all operations on a database object are authorized by the business logic of the application.

More general information about this class of vulnerability is in [OWASP Top 10:2025 A01 Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/) and the [Insecure Direct Object Reference Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html).

#### CSRF (Cross Site Request Forgery)

Ruby on Rails has specific, built-in support for CSRF tokens. To enable it, or ensure that it is enabled, find the base `ApplicationController` and look for a directive such as the following:

``` ruby
class ApplicationController < ActionController::Base
  protect_from_forgery
```

Note that the syntax for this type of control includes a way to add exceptions. Exceptions may be useful for APIs or other reasons - but should be reviewed and consciously included. In the example below, the Rails ProjectController will not provide [CSRF](https://owasp.org/www-community/attacks/csrf) protection for the show method.

``` ruby
class ProjectController < ApplicationController
  protect_from_forgery except: :show
```

Also note that by default Rails does not provide CSRF protection for any HTTP `GET` request.

**Note:** if you use token authentication only, there is no need to protect from CSRF in controllers like this. If cookie-based authentication is used on some paths, then the protections is still required on them.

There is a top level OWASP page for [Cross-Site Request Forgery (CSRF)](https://owasp.org/www-community/attacks/csrf).

#### Redirects and Forwards

Web applications often require the ability to dynamically redirect users based on client-supplied data. To clarify, dynamic redirection usually entails the client including a URL in a parameter within a request to the application. Once received by the application, the user is redirected to the URL specified in the request.

For example:

`http://www.example.com/redirect?url=http://www.example_commerce_site.com/checkout`

The above request would redirect the user to `http://www.example.com/checkout`. The security concern associated with this functionality is leveraging an organization's trusted brand to phish users and trick them into visiting a malicious site, in our example, `badhacker.com`.

Example:

`http://www.example.com/redirect?url=http://badhacker.com`

For redirects that must stay within the application, use Rails' [`url_from`](https://api.rubyonrails.org/v8.1.3.1/classes/ActionController/Redirecting.html#method-i-url_from) to validate the destination against the request host and provide a fixed fallback:

```ruby
redirect_to url_from(params[:url]) || "/"
```

Do not treat `URI.parse(value).path` as redirect validation: the path of `https://trusted.example//evil.example/path` is `//evil.example/path`, which is a protocol-relative external destination. Keep Rails' open-redirect protection enabled; if the application requires specific destinations, use an application-defined allowlist instead.

If matching user input against a list of approved sites or TLDs against regular expression is a must, it makes sense to leverage a library such as `URI.parse()` to obtain the host and then take the host value and match it against regular expression patterns. Those regular expressions must, at a minimum, have anchors or there is a greater chance of an attacker bypassing the validation routine.

Example:

``` ruby
require 'uri'
host = URI.parse("#{params[:url]}").host
# this can be vulnerable to javascript://trusted.com/%0Aalert(0)
# so check .scheme and .port too
validation_routine(host) if host
def validation_routine(host)
  # Validation routine where we use  \A and \z as anchors *not* ^ and $
  # you could also check the host value against an allowlist
end
```

Also blind redirecting to user input parameter can lead to XSS.

Example code:

``` ruby
redirect_to params[:to]
```

Will give this URL:

`http://example.com/redirect?to[status]=200&to[protocol]=javascript:alert(0)//`

The obvious fix for this type of vulnerability is to restrict to specific Top-Level Domains (TLDs), statically define specific sites, or map a key to it's value.

Example code:

``` ruby
ACCEPTABLE_URLS = {
  'our_app_1' => "https://www.example_commerce_site.com/checkout",
  'our_app_2' => "https://www.example_user_site.com/change_settings"
}
```

Will give this URL:

`http://www.example.com/redirect?url=our_app_1`

Redirection handling code:

``` ruby
def redirect
  url = ACCEPTABLE_URLS["#{params[:url]}"]
  redirect_to url if url
end
```

There is a more general OWASP resource about [unvalidated redirects and forwards](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html).

#### Dynamic Render Paths

In Rails, controller actions and views can dynamically determine which view or partial to render by calling the `render` method. If user input is used in or for the template name, an attacker could cause the application to render an arbitrary view, such as an administrative page.

Care should be taken when using user input to determine which view to render. If possible, avoid any user input in the name or path to the view.

#### Cross Origin Resource Sharing

Occasionally, a need arises to share resources with another domain. For example, a file-upload function that sends data via an AJAX request to another domain. In these cases, the same-origin rules followed by web browsers must be sent. Modern browsers, in compliance with HTML5 standards, will allow this to occur but in order to do this; a couple precautions must be taken.

When using a nonstandard HTTP construct, such as an atypical Content-Type header, for example, the following applies:

The receiving site should list only those domains allowed to make such requests as well as set the `Access-Control-Allow-Origin` header in both the response to the `OPTIONS` request and `POST` request. This is because the OPTIONS request is sent first, in order to determine if the remote or receiving site allows the requesting domain. Next, a second request, a `POST` request, is sent. Once again, the header must be set in order for the transaction to be shown as successful.

When standard HTTP constructs are used:

*The request is sent and the browser, upon receiving a response, inspects the response headers in order to determine if the response can and should be processed.*

Allowlist in Rails:

**Gemfile:**

```bash
gem 'rack-cors', :require => 'rack/cors'
```

**config/application.rb:**

```ruby
module Sample
  class Application < Rails::Application
    config.middleware.use Rack::Cors do
      allow do
        origins 'someserver.example.com'
        resource %r{/users/\d+.json},
        :headers => ['Origin', 'Accept', 'Content-Type'],
        :methods => [:post, :get]
      end
    end
  end
end
```

#### Security-related headers

To set a header value, simply access the response.headers object as a hash inside your controller (often in a before/after_filter).

```ruby
response.headers['X-header-name'] = 'value'
```

Rails provides the `default_headers` functionality that will automatically apply the values supplied. This works for most headers in almost all cases.

```ruby
ActionDispatch::Response.default_headers = {
  'X-Frame-Options' => 'SAMEORIGIN',
  'X-Content-Type-Options' => 'nosniff',
  'X-XSS-Protection' => '0'
}
```

[Strict transport security](https://owasp.org/www-project-secure-headers/#headers-link) is a special case, it is set in an environment file (e.g. `production.rb`)

```ruby
config.force_ssl = true
```

For those not on the edge, there is a library ([secure_headers](https://github.com/twitter/secureheaders)) for the same behavior with content security policy abstraction provided. It will automatically apply logic based on the user agent to produce a concise set of headers.

#### Business Logic Bugs

Any application in any technology can contain business logic errors that result in security bugs. Business logic bugs are difficult to impossible to detect using automated tools. The best ways to prevent business logic security bugs are to do code review, pair program and write unit tests.

#### Attack Surface

Generally speaking, Rails avoids open redirect and path traversal types of vulnerabilities because of its /config/routes.rb file which dictates what URLs should be accessible and handled by which controllers. The routes file is a great place to look when thinking about the scope of the attack surface.

An example might be as follows:

```ruby
# this is an example of what NOT to do
match ':controller(/:action(/:id(.:format)))'
```

In this case, this route allows any public method on any controller to be called as an action. As a developer, you want to make sure that users can only reach the controller methods intended and in the way intended.

#### Sensitive Files

Many Ruby on Rails apps are open source and hosted on publicly available source code repositories. Whether that is the case or the code is committed to a corporate source control system, there are certain files that should be either excluded or carefully managed.

```text
/config/database.yml                 -  May contain production credentials.
/config/initializers/secret_token.rb -  Contains a secret used to hash session cookie.
/db/seeds.rb                         -  May contain seed data including bootstrap admin user.
/db/development.sqlite3              -  May contain real data.
```

#### Encryption

Rails uses OS encryption. Generally speaking, it is always a bad idea to write your own encryption.

Devise by default uses bcrypt for password hashing, which is an appropriate solution.

Typically, the following config causes the 10 stretches for production: `/config/initializers/devise.rb`

```ruby
config.stretches = Rails.env.test? ? 1 : 10
```

### Updating Rails and Having a Process for Updating Dependencies

In early 2013, a number of critical vulnerabilities were identified in the Rails Framework. Organizations that had fallen behind current versions had more trouble updating and harder decisions along the way, including patching the source code for the framework itself.

An additional concern with Ruby applications in general is that most libraries (gems) are not signed by their authors. It is literally impossible to build a Rails based project with libraries that come from trusted sources. One good practice might be to audit the gems you are using.

In general, it is important to have a process for updating dependencies. An example process might define three mechanisms for triggering an update of response:

- Every month/quarter dependencies in general are updated.
- Every week important security vulnerabilities are taken into account and potentially trigger an update.
- In EXCEPTIONAL conditions, emergency updates may need to be applied.

### Tools

Use [brakeman](https://brakemanscanner.org/), an open source code analysis tool for Rails applications, to identify many potential issues. It will not necessarily produce comprehensive security findings, but it can find easily exposed issues. A great way to see potential issues in Rails is to review the brakeman documentation of warning types.

A newer alternative is [bearer](https://github.com/Bearer/bearer), an open source code security and privacy analysis tool for both Ruby and JavaScript/TypeScript code, in order to identify a broad range of OWASP Top 10 potential issues. It provides many configuration options and can easily integrate into your CI/CD pipeline.

There are emerging tools that can be used to track security issues in dependency sets, like automated scanning from [GitHub](https://github.blog/2017-11-16-introducing-security-alerts-on-github/) and [GitLab](https://docs.gitlab.com/ee/user/application_security/dependency_scanning/).

Another area of tooling is the security testing tool [Gauntlt](http://gauntlt.org) which is built on cucumber and uses gherkin syntax to define attack files.

Launched in May 2013 and very similar to brakeman scanner, the [dawnscanner](https://github.com/thesp0nge/dawnscanner) rubygem is a static analyzer for security issues that work with Rails, Sinatra and Padrino web applications. Version 1.6.6 has more than 235 ruby specific CVE security checks.
