---
title: "Node.js Fundamentals"
order: 3
summary: "The Node.js runtime, how it differs from the browser, npm and packages, environment variables and the gap between development and production."
category: "Node.js & APIs"
level: Beginner
---

# Node.js Fundamentals

Node.js runs JavaScript outside the browser on the V8 engine, with a standard library for files, networking and processes. This module covers the runtime itself and the tooling around it.

**Course outline modules:** 4 (JavaScript with Node.js), 9 (JS Essentials), 10 (Process)

## Fundamentals

### The problem

In 2009 most web servers handled concurrency with one thread (or process) per connection. Each thread spends nearly all its time waiting on the disk, the database or the network, and holds memory while it waits, so tens of thousands of open connections (chat, long polling, streaming) exhausted the server. Ryan Dahl saw that JavaScript had no blocking I/O in its culture or its libraries, and that Google's V8 engine had made it fast. Node.js combined V8 with an event loop and non-blocking I/O, and put JavaScript on the server.

### Goals

- **Handle many concurrent connections cheaply,** with one thread doing work and the operating system doing the waiting.
- **Never block.** Every I/O API is asynchronous by default.
- **One language across the stack,** so browser developers can write servers and code can be shared.
- **Small core, large ecosystem.** Keep the runtime minimal and let npm packages supply everything else.

### The ideas everything else rests on

- **The event loop.** Your JavaScript runs on one thread. I/O is handed to the operating system (epoll, kqueue, IOCP) or to libuv's thread pool, and callbacks run when results arrive. The loop works through timers, I/O callbacks, `setImmediate` and close handlers in phases, and promise microtasks run between each step.
- **Concurrency without parallelism.** Thousands of requests can be in flight at once, but only one piece of your JavaScript runs at a time. CPU-heavy work blocks everyone, so it goes to worker threads or another service.
- **Streams and buffers.** Data is processed in chunks as it arrives, with backpressure, instead of being loaded whole into memory.
- **Modules and npm.** CommonJS (`require`) and ES modules (`import`), with `package.json` describing the project and its dependencies.
- **Process as an EventEmitter.** Signals, exit codes, environment variables and uncaught errors are all events on `process`.

### Trade-offs

Node.js is a poor fit for CPU-bound work. An unhandled exception or rejected promise can take down the whole process, which serves every user, so run it under a supervisor and fail fast. The npm ecosystem is huge and uneven, and every dependency is code you trust.

## Introduction to Node.js

> **Source:** [Introduction to Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs) · [Node.js Learn](https://github.com/nodejs/learn), MIT

Node.js is an open-source and cross-platform JavaScript runtime environment. It is a popular tool for almost any kind of project!

Node.js runs the V8 JavaScript engine, the core of Google Chrome, outside of the browser. This allows Node.js to be very performant.

A Node.js app runs in a single process, without creating a new thread for every request. Node.js provides a set of asynchronous I/O primitives in its standard library that prevent JavaScript code from blocking. In addition, libraries in Node.js are generally written using non-blocking paradigms. Accordingly, blocking behavior is the exception rather than the norm in Node.js.

When Node.js performs an I/O operation, like reading from the network, accessing a database or the filesystem, instead of blocking the thread and wasting CPU cycles waiting, Node.js will resume the operations when the response comes back.

This allows Node.js to handle thousands of concurrent connections with a single server without introducing the burden of managing thread concurrency, which could be a significant source of bugs.

Node.js has a unique advantage because millions of frontend developers that write JavaScript for the browser are now able to write the server-side code in addition to the client-side code without the need to learn a completely different language.

In Node.js the new ECMAScript standards can be used without problems, as you don't have to wait for all your users to update their browsers - you are in charge of deciding which ECMAScript version to use by changing the Node.js version, and you can also enable specific experimental features by running Node.js with flags.

### An Example Node.js Application

The most common example Hello World of Node.js is a web server:

```cjs
const { createServer } = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

```mjs
import { createServer } from 'node:http';

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

Both examples create the same HTTP server. The first uses the [CommonJS modules](https://nodejs.org/api/modules.html) (`require()`), while the second uses [ECMAScript modules](https://nodejs.org/api/esm.html) (`import`). Which one you use depends on your project's module system and configuration.

To run this snippet, save it as a `server.js` file and run `node server.js` in your terminal.
If you use the mjs version of the code, you should save it as a `server.mjs` file and run `node server.mjs` in your terminal.

This code first includes the Node.js [`http` module](https://nodejs.org/api/http.html).

Node.js has a fantastic [standard library](https://nodejs.org/api/), including first-class support for networking.

The `createServer()` method of `http` creates a new HTTP server and returns it.

The server is set to listen on the specified port and host name. When the server is ready, the callback function is called, in this case informing us that the server is running.

Whenever a new request is received, the [`request` event](https://nodejs.org/api/http.html#event-request) is called, providing two objects: a request (an [`http.IncomingMessage`](https://nodejs.org/api/http.html#class-httpincomingmessage) object) and a response (an [`http.ServerResponse`](https://nodejs.org/api/http.html#class-httpserverresponse) object).

Those 2 objects are essential to handle the HTTP call.

The first provides the request details. In this simple example, this is not used, but you could access the request headers and request data.

The second is used to return data to the caller.

In this case with:

```js
res.statusCode = 200;
```

we set the `statusCode` property to `200`, to indicate a successful response.

We set the `Content-Type` header:

```js
res.setHeader('Content-Type', 'text/plain');
```

and we close the response, adding the content as an argument to `end()`:

```js
res.end('Hello World');
```

If you haven't already done so, [download](https://nodejs.org/en/download) Node.js.

## Node.js vs the browser

> **Source:** [Node.js vs the browser](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser) · [Node.js Learn](https://github.com/nodejs/learn), MIT

Both the browser and Node.js use JavaScript as their programming language. Building apps that run in the browser is completely different from building a Node.js application. Despite the fact that it's always JavaScript, there are some key differences that make the experience radically different.

From the perspective of a frontend developer who extensively uses JavaScript, Node.js apps bring with them a huge advantage: the comfort of programming everything - the frontend and the backend - in a single language.

You have a huge opportunity because we know how hard it is to fully, deeply learn a programming language, and by using the same language to perform all your work on the web - both on the client and on the server, you're in a unique position of advantage.

> **What changes is the ecosystem.**

In the browser, most of the time what you are doing is interacting with the DOM, or other Web Platform APIs like Cookies. Those do not exist in Node.js, of course. You don't have the `document`, `window` and all the other objects that are provided by the browser.

And in the browser, we don't have all the nice APIs that Node.js provides through its modules, like the filesystem access functionality.

Another big difference is that in Node.js you control the environment. Unless you are building an open source application that anyone can deploy anywhere, you know which version of Node.js you will run the application on. Compared to the browser environment, where you don't get the luxury to choose what browser your visitors will use, this is very convenient.

This means that you can write all the modern ES2015+ JavaScript that your Node.js version supports. Since JavaScript moves so fast, but browsers can be a bit slow to upgrade, sometimes on the web you are stuck with using older JavaScript / ECMAScript releases. You can use Babel to transform your code to be ES5-compatible before shipping it to the browser, but in Node.js, you won't need that.

Another difference is that Node.js supports both the CommonJS and ES module systems (since Node.js v12), while in the browser, we are starting to see the ES Modules standard being implemented.

In practice, this means that you can use both `require()` and `import` in Node.js, while you are limited to `import` in the browser.

## How much JavaScript you need

> **Source:** [How much JavaScript you need](https://nodejs.org/en/learn/getting-started/how-much-javascript-do-you-need-to-know-to-use-nodejs) · [Node.js Learn](https://github.com/nodejs/learn), MIT

As a beginner, it's hard to get to a point where you are confident enough in your programming abilities. While learning to code, you might also be confused at where does JavaScript end, and where Node.js begins, and vice versa.

### What is recommended to learn before diving deep with Node.js?

- [Lexical Structure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar)
- [Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators)
- [Data Types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)
- [Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [Variables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#declarations)
- [Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [`this` operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [Loops](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration)
- [Scopes](https://developer.mozilla.org/en-US/docs/Glossary/Scope)
- [Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- [Strict Mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)
- [ECMAScript 2015 (ES6) and beyond](https://nodejs.org/en/learn/getting-started/ecmascript-2015-es6-and-beyond)
- [Asynchronous JavaScript](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS)

With those concepts in mind, you are well on your road to become a proficient JavaScript developer, in both the browser and in Node.js.

#### Asynchronous Programming

The following concepts are also key to understand asynchronous programming, which is one of the fundamental parts of Node.js:

- [Asynchronous programming and callbacks](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing)
- [Timers](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [Async and Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [The Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)

## The npm package manager

> **Source:** [The npm package manager](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager) · [Node.js Learn](https://github.com/nodejs/learn), MIT

### Introduction to npm

`npm` is the standard package manager for Node.js.

In September 2022 over 2.1 million packages were reported being listed in the npm registry, making it the biggest single language code repository on Earth, and you can be sure there is a package for (almost!) everything.

It started as a way to download and manage dependencies of Node.js packages, but it has since become a tool used also in frontend JavaScript.

> [**Yarn**](https://yarnpkg.com) and [**pnpm**](https://pnpm.io) are alternatives to npm cli. You can check them out as well.

### Packages

`npm` installs, updates and manages downloads of dependencies of your project. Dependencies are pre-built pieces of code, such as libraries and packages, that your Node.js application needs to work.

#### Installing all dependencies

If a project has a `package.json` file, by running

```bash
npm install
```

it will install everything the project needs, in the `node_modules` folder, creating it if it's not existing already.

#### Installing a single package

You can also install a specific package by running

```bash
npm install <package-name>
```

Furthermore, since npm 5, this command adds `<package-name>` to the `package.json` file _dependencies_. Before version 5, you needed to add the flag `--save`.

Often you'll see more flags added to this command:

- `--save-dev` installs and adds the entry to the `package.json` file _devDependencies_
- `--no-save` installs but does not add the entry to the `package.json` file _dependencies_
- `--save-optional` installs and adds the entry to the `package.json` file _optionalDependencies_
- `--no-optional` will prevent optional dependencies from being installed

Shorthands of the flags can also be used:

- \-S: `--save`
- \-D: `--save-dev`
- \-O: `--save-optional`

The difference between _devDependencies_ and _dependencies_ is that the former contains development tools, like a testing library, while the latter is bundled with the app in production.

As for the _optionalDependencies_ the difference is that build failure of the dependency will not cause installation to fail. But it is your program's responsibility to handle the lack of the dependency. Read more about [optional dependencies](https://docs.npmjs.com/cli/configuring-npm/package-json#optionaldependencies).

#### Updating packages

Updating is also made easy, by running

```bash
npm update
```

`npm` will check all packages for a newer version that satisfies your versioning constraints.

You can specify a single package to update as well:

```bash
npm update <package-name>
```

### Versioning

In addition to plain downloads, `npm` also manages **versioning**, so you can specify any specific version of a package, or require a version higher or lower than what you need.

Many times you'll find that a library is only compatible with a major release of another library.

Or a bug in the latest release of a lib, still unfixed, is causing an issue.

Specifying an explicit version of a library also helps to keep everyone on the same exact version of a package, so that the whole team runs the same version until the `package.json` file is updated.

In all those cases, versioning helps a lot, and `npm` follows the semantic versioning (semver) standard.

You can install a specific version of a package, by running

```bash
npm install <package-name>@<version>
```

### Running Tasks

The package.json file supports a format for specifying command line tasks that can be run by using

```bash
npm run <task-name>
```

For example:

```json
{
  "scripts": {
    "start-dev": "node lib/server-development",
    "start": "node lib/server-production"
  }
}
```

It's very common to use this feature to run Webpack:

```json
{
  "scripts": {
    "watch": "webpack --watch --progress --colors --config webpack.conf.js",
    "dev": "webpack --progress --colors --config webpack.conf.js",
    "prod": "NODE_ENV=production webpack -p --config webpack.conf.js"
  }
}
```

So instead of typing those long commands, which are easy to forget or mistype, you can run

```console
$ npm run watch
$ npm run dev
$ npm run prod
```

## Environment variables

> **Source:** [Environment variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs) · [Node.js Learn](https://github.com/nodejs/learn), MIT

The `process` core module of Node.js provides the `env` property which hosts all the environment variables that were set at the moment the process was started.

The below code runs `app.js` and set `USER_ID` and `USER_KEY`.

```bash
USER_ID=239482 USER_KEY=foobar node app.js
```

That will pass the user `USER_ID` as **239482** and the `USER_KEY` as **foobar**. This is suitable for testing, however for production, you will probably be configuring some bash scripts to export variables.

> Note: `process` does not need to be imported, it is a global object in Node.js.

Here is an example that accesses the `USER_ID` and `USER_KEY` environment variables, which we set in above code.

```js
console.log(process.env.USER_ID); // "239482"
console.log(process.env.USER_KEY); // "foobar"
```

In the same way you can access any custom environment variable you set.

Node.js 20 introduced **experimental** [support for .env files](https://nodejs.org/docs/v24.5.0/api/environment_variables.html#env-files).

Now, you can use the `--env-file` flag to specify an environment file when running your Node.js application. Here's an example `.env` file and how to access its variables using `process.env`.

```bash
# .env file
PORT=3000
```

In your js file

```js
console.log(process.env.PORT); // "3000"
```

Run `app.js` file with environment variables set in `.env` file.

```bash
node --env-file=.env app.js
```

This command loads all the environment variables from the `.env` file, making them available to the application on `process.env`

Also, you can pass multiple `--env-file` arguments. Subsequent files override pre-existing variables defined in previous files.

```bash
node --env-file=.env --env-file=.development.env app.js
```

> Note: if the same variable is defined in the environment and in the file, the value from the environment takes precedence.

In case you want to optionally read from a `.env` file, it's possible to avoid
throwing an error if the file is missing using the `--env-file-if-exists` flag.

```bash
node --env-file-if-exists=.env app.js
```

### Loading `.env` files programmatically with `process.loadEnvFile(path)`

Node.js provides a built-in API to load `.env` files directly from your code: [`process.loadEnvFile(path)`](https://nodejs.org/api/process.html#processloadenvfilepath).

This method loads variables from a `.env` file into `process.env`, similar to how the `--env-file` flag works — but can be invoked programmatically.

Because this method is invoked post-initialization, the setting of startup-related environment variables (i.e. `NODE_OPTIONS`) has no effect on the process (however, these variables can still be accessed via `process.env`).

#### Example

```txt
# .env file
PORT=1234
```

```cjs
const { loadEnvFile } = require('node:process');

// Loads environment variables from the default .env file
loadEnvFile();

console.log(process.env.PORT); // Logs '1234'
```

```mjs
import { loadEnvFile } from 'node:process';

// Loads environment variables from the default .env file
loadEnvFile();

console.log(process.env.PORT); // Logs '1234'
```

You can also specify a custom path:

```cjs
const { loadEnvFile } = require('node:process');
loadEnvFile('./config/.env');
```

```mjs
import { loadEnvFile } from 'node:process';
loadEnvFile('./config/.env');
```

## Development vs production

> **Source:** [Development vs production](https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production) · [Node.js Learn](https://github.com/nodejs/learn), MIT

**There is no difference between development and production in Node.js**, i.e., there are no specific settings you need to apply to make Node.js work in a production configuration.
However, a few libraries in the npm registry recognize using the `NODE_ENV` variable and default it to a `development` setting.
Always run your Node.js with the `NODE_ENV=production` set.

A popular way of configuring your application is by using the [twelve factor methodology](https://12factor.net/).

### Why is NODE_ENV considered an antipattern?

An environment is a digital platform or a system where engineers can build, test, _deploy_, and manage software products. Conventionally, there are four stages or types of environments where our application is run:

- Development
- Testing
- Staging
- Production

The fundamental problem of `NODE_ENV` stems from developers combining optimizations and software behavior with the environment their software is running on. The result is code like the following:

```js
if (process.env.NODE_ENV === 'development') {
  // ...
}

if (process.env.NODE_ENV === 'production') {
  // ...
}

if (['production', 'staging'].includes(process.env.NODE_ENV)) {
  // ...
}
```

While this might look harmless, it makes the production and staging environments different, thus making reliable testing impossible. For example a test and thus a functionality of your product could pass when `NODE_ENV` is set to `development` but fail when setting `NODE_ENV` to `production`.
Therefore, setting `NODE_ENV` to anything but `production` is considered an _antipattern_.
