---
title: "Async JavaScript and the Event Loop"
order: 4
summary: "JavaScript is single-threaded, so Node.js does I/O asynchronously: callbacks, promises, async/await, and the event loop that runs them."
category: "Node.js & APIs"
level: Intermediate
---

# Async JavaScript and the Event Loop

One thread, thousands of concurrent requests: Node.js gets there by never waiting on I/O. Understanding callbacks, promises, async/await and the event loop is what separates code that scales from code that stalls.

**Course outline modules:** 5 (Async JS inside Node.js)

## Asynchronous programming and callbacks

> **Source:** [Asynchronous programming and callbacks](https://nodejs.org/en/learn/asynchronous-work/javascript-asynchronous-programming-and-callbacks) · [Node.js Learn](https://github.com/nodejs/learn), MIT

### Asynchronicity in Programming Languages

Computers are asynchronous by design.

Asynchronous means that things can happen independently of the main program flow.

In the current consumer computers, every program runs for a specific time slot and then it stops its execution to let another program continue their execution. This thing runs in a cycle so fast that it's impossible to notice. We think our computers run many programs simultaneously, but this is an illusion (except on multiprocessor machines).

Programs internally use _interrupts_, a signal that's emitted to the processor to gain the attention of the system.

Let's not go into the internals of this now, but just keep in mind that it's normal for programs to be asynchronous and halt their execution until they need attention, allowing the computer to execute other things in the meantime. When a program is waiting for a response from the network, it cannot halt the processor until the request finishes.

Normally, programming languages are synchronous and some provide a way to manage asynchronicity in the language or through libraries. C, Java, C#, PHP, Go, Ruby, Swift, and Python are all synchronous by default. Some of them handle async operations by using threads, spawning a new process.

### JavaScript

JavaScript is **synchronous** by default and is single threaded. This means that code cannot create new threads and run in parallel.

Lines of code are executed in series, one after another, for example:

```js
const a = 1;
const b = 2;
const c = a * b;
console.log(c);
doSomething();
```

But JavaScript was born inside the browser, its main job, in the beginning, was to respond to user actions, like `onClick`, `onMouseOver`, `onChange`, `onSubmit` and so on. How could it do this with a synchronous programming model?

The answer was in its environment. The **browser** provides a way to do it by providing a set of APIs that can handle this kind of functionality.

More recently, Node.js introduced a non-blocking I/O environment to extend this concept to file access, network calls and so on.

### Callbacks

You can't know when a user is going to click a button. So, you **define an event handler for the click event**. This event handler accepts a function, which will be called when the event is triggered:

```js
document.getElementById('button').addEventListener('click', () => {
  // item clicked
});
```

This is the so-called **callback**.

A callback is a simple function that's passed as a value to another function, and will only be executed when the event happens. We can do this because JavaScript has first-class functions, which can be assigned to variables and passed around to other functions (called **higher-order functions**)

It's common to wrap all your client code in a `load` event listener on the `window` object, which runs the callback function only when the page is ready:

```js
window.addEventListener('load', () => {
  // window loaded
  // do what you want
});
```

Callbacks are used everywhere, not just in DOM events.

One common example is by using timers:

```js
setTimeout(() => {
  // runs after 2 seconds
}, 2000);
```

XHR requests also accept a callback, in this example by assigning a function to a property that will be called when a particular event occurs (in this case, the state of the request changes):

```js
const xhr = new XMLHttpRequest();
xhr.onreadystatechange = () => {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
    } else {
      console.error('error');
    }
  }
};
xhr.open('GET', 'https://yoursite.com');
xhr.send();
```

#### Handling errors in callbacks

How do you handle errors with callbacks? One very common strategy is to use what Node.js adopted: the first parameter in any callback function is the error object: **error-first callbacks**

If there is no error, the object is `null`. If there is an error, it contains some description of the error and other information.

```cjs
const fs = require('node:fs');

fs.readFile('/file.json', (err, data) => {
  if (err) {
    // handle error
    console.log(err);
    return;
  }

  // no errors, process data
  console.log(data);
});
```

```mjs
import fs from 'node:fs';

fs.readFile('/file.json', (err, data) => {
  if (err) {
    // handle error
    console.log(err);
    return;
  }

  // no errors, process data
  console.log(data);
});
```

#### The problem with callbacks

Callbacks are great for simple cases!

However every callback adds a level of nesting, and when you have lots of callbacks, the code starts to be complicated very quickly:

```js
window.addEventListener('load', () => {
  document.getElementById('button').addEventListener('click', () => {
    setTimeout(() => {
      items.forEach(item => {
        // your code here
      });
    }, 2000);
  });
});
```

This is just a simple 4-levels code, but I've seen much more levels of nesting and it's not fun.

How do we solve this?

#### Alternatives to callbacks

Starting with ES6, JavaScript introduced several features that help us with asynchronous code that do not involve using callbacks: Promises (ES6) and Async/Await (ES2017).

## Promises and async/await

> **Source:** [Promises and async/await](https://nodejs.org/en/learn/asynchronous-work/discover-promises-in-nodejs) · [Node.js Learn](https://github.com/nodejs/learn), MIT

A **Promise** is a special object in JavaScript that represents the eventual completion (or failure) of an asynchronous operation and its resulting value. Essentially, a Promise is a placeholder for a value that is not yet available but will be in the future.

Think of a Promise like ordering a pizza: you don't get it right away, but the delivery person promises to bring it to you later. You don't know _exactly_ when, but you know the outcome will either be "pizza delivered" or "something went wrong."

### Promise States

A Promise can be in one of three states:

- **Pending**: The initial state, where the asynchronous operation is still running.
- **Fulfilled**: The operation completed successfully, and the Promise is now resolved with a value.
- **Rejected**: The operation failed, and the Promise is settled with a reason (usually an error).

When you order the pizza, you're in the pending state, hungry and hopeful. If the pizza arrives hot and cheesy, you've entered the fulfilled state. But if the restaurant calls to say they've dropped your pizza on floor, you're in the rejected state.

Regardless of whether your dinner ends in joy or disappointment, once there's a final outcome, the Promise is considered **settled**.

### Basic Syntax of a Promise

One of the most common ways to create a Promise is using the `new Promise()` constructor. The constructor takes a function with two parameters: `resolve` and `reject`. These functions are used to transition the Promise from the **pending** state to either **fulfilled** or **rejected**.

If an error is thrown inside the executor function, the Promise will be rejected with that error.
The return value of the executor function is ignored: only `resolve` or `reject` should be used to settle the Promise.

```js
const myPromise = new Promise((resolve, reject) => {
  const success = true;

  if (success) {
    resolve('Operation was successful!');
  } else {
    reject('Something went wrong.');
  }
});
```

In the above example:

- If the `success` condition is `true`, the Promise is fulfilled and the value `'Operation was successful!'` is passed to the `resolve` function.
- If the `success` condition is `false`, the Promise is rejected and the error `'Something went wrong.'` is passed to the `reject` function.

### Handling Promises with `.then()`, `.catch()`, and `.finally()`

Once a Promise is created, you can handle the outcome by using the `.then()`, `.catch()`, and `.finally()` methods.

- `.then()` is used to handle a fulfilled Promise and access its result.
- `.catch()` is used to handle a rejected Promise and catch any errors that may occur.
- `.finally()` is used to handle a settled Promise, regardless of whether the Promise resolved or rejected.

```js
const myPromise = new Promise((resolve, reject) => {
  const success = true;

  if (success) {
    resolve('Operation was successful!');
  } else {
    reject('Something went wrong.');
  }
});

myPromise
  .then(result => {
    console.log(result); // This will run if the Promise is fulfilled
  })
  .catch(error => {
    console.error(error); // This will run if the Promise is rejected
  })
  .finally(() => {
    console.log('The promise has completed'); // This will run when the Promise is settled
  });
```

### Chaining Promises

One of the great features of Promises is that they allow you to chain multiple asynchronous operations together. When you chain Promises, each `.then()` block waits for the previous one to complete before it runs.

```cjs
const { setTimeout: delay } = require('node:timers/promises');

const promise = delay(1000).then(() => 'First task completed');

promise
  .then(result => {
    console.log(result); // 'First task completed'
    return delay(1000).then(() => 'Second task completed'); // Return a second Promise
  })
  .then(result => {
    console.log(result); // 'Second task completed'
  })
  .catch(error => {
    console.error(error); // If any Promise is rejected, catch the error
  });
```

### Using Async/Await with Promises

One of the best ways to work with Promises in modern JavaScript is using **async/await**. This allows you to write asynchronous code that looks synchronous, making it much easier to read and maintain.

- `async` is used to define a function that returns a Promise.
- `await` is used inside an `async` function to pause execution until a Promise settles.

```js
async function performTasks() {
  try {
    const result1 = await promise1;
    console.log(result1); // 'First task completed'

    const result2 = await promise2;
    console.log(result2); // 'Second task completed'
  } catch (error) {
    console.error(error); // Catches any rejection or error
  }
}

performTasks();
```

In the `performTasks` function, the `await` keyword ensures that each Promise is settled before moving on to the next statement. This leads to a more linear and readable flow of asynchronous code.

Essentially, the code above will execute the same as if the user wrote:

```js
promise1
  .then(function (result1) {
    console.log(result1);
    return promise2;
  })
  .then(function (result2) {
    console.log(result2);
  })
  .catch(function (error) {
    console.log(error);
  });
```

#### Top-Level Await

When using [ECMAScript Modules](https://nodejs.org/api/esm.html), the module itself is treated as a top-level scope that supports asynchronous operations natively. This means that you can use [`await` at the top level](https://nodejs.org/api/esm.html#top-level-await) without needing an `async` function.

```mjs
import { setTimeout as delay } from 'node:timers/promises';

await delay(1000);
```

Async/await can be much more intricate than the simple examples provided. James Snell, a member of the Node.js Technical Steering Committee, has an [in-depth presentation](https://www.youtube.com/watch?v=XV-u_Ow47s0) that explores the complexities of Promises and async/await.

### Promise-based Node.js APIs

Node.js provides **Promise-based versions** of many of its core APIs, especially in cases where asynchronous operations were traditionally handled with callbacks. This makes it easier to work with Node.js APIs and Promises, and reduces the risk of "callback hell."

For example, the `fs` (file system) module has a Promise-based API under `fs.promises`:

```cjs
const fs = require('node:fs').promises;
// Or, you can import the promisified version directly:
// const fs = require('node:fs/promises');

async function readFile() {
  try {
    const data = await fs.readFile('example.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

readFile();
```

In this example, `fs.readFile()` returns a Promise, which we handle using `async/await` syntax to read the contents of a file asynchronously.

### Advanced Promise Methods

JavaScript's `Promise` global provides several powerful methods that help manage multiple asynchronous tasks more effectively:

#### `Promise.all()`

This method accepts an array of Promises and returns a new Promise that resolves once all the Promises are fulfilled. If any Promise is rejected, `Promise.all()` will immediately reject. However, even if rejection occurs, the Promises continue to execute. When handling a large number of Promises, especially in batch processing, using this function can strain the system's memory.

```cjs
const { setTimeout: delay } = require('node:timers/promises');

const fetchData1 = delay(1000).then(() => 'Data from API 1');
const fetchData2 = delay(2000).then(() => 'Data from API 2');

Promise.all([fetchData1, fetchData2])
  .then(results => {
    console.log(results); // ['Data from API 1', 'Data from API 2']
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

#### `Promise.allSettled()`

This method waits for all promises to either resolve or reject and returns an array of objects that describe the outcome of each Promise.

```js
const promise1 = Promise.resolve('Success');
const promise2 = Promise.reject('Failed');

Promise.allSettled([promise1, promise2]).then(results => {
  console.log(results);
  // [ { status: 'fulfilled', value: 'Success' }, { status: 'rejected', reason: 'Failed' } ]
});
```

Unlike `Promise.all()`, `Promise.allSettled()` does not short-circuit on failure. It waits for all promises to settle, even if some reject. This provides better error handling for batch operations, where you may want to know the status of all tasks, regardless of failure.

#### `Promise.race()`

This method resolves or rejects as soon as the first Promise settles, whether it resolves or rejects. Regardless of which promise settles first, all promises are fully executed.

```cjs
const { setTimeout: delay } = require('node:timers/promises');

const task1 = delay(2000).then(() => 'Task 1 done');
const task2 = delay(1000).then(() => 'Task 2 done');

Promise.race([task1, task2]).then(result => {
  console.log(result); // 'Task 2 done' (since task2 finishes first)
});
```

#### `Promise.any()`

This method resolves as soon as one of the Promises resolves. If all promises are rejected, it will reject with an `AggregateError`.

```cjs
const { setTimeout: delay } = require('node:timers/promises');

const api1 = delay(2000).then(() => 'API 1 success');
const api2 = delay(1000).then(() => 'API 2 success');
const api3 = delay(1500).then(() => 'API 3 success');

Promise.any([api1, api2, api3])
  .then(result => {
    console.log(result); // 'API 2 success' (since it resolves first)
  })
  .catch(error => {
    console.error('All promises rejected:', error);
  });
```

#### `Promise.reject()` and `Promise.resolve()`

These methods create a rejected or resolved Promise directly.

```js
Promise.resolve('Resolved immediately').then(result => {
  console.log(result); // 'Resolved immediately'
});
```

#### `Promise.try()`

`Promise.try()` is a method that executes a given function, whether it's synchronous or asynchronous, and wraps the result in a promise. If the function throws an error or returns a rejected promise, `Promise.try()` will return a rejected promise. If the function completes successfully, the returned promise will be fulfilled with its value.

This can be particularly useful for starting promise chains in a consistent way, especially when working with code that might throw errors synchronously.

```js
function mightThrow() {
  if (Math.random() > 0.5) {
    throw new Error('Oops, something went wrong!');
  }
  return 'Success!';
}

Promise.try(mightThrow)
  .then(result => {
    console.log('Result:', result);
  })
  .catch(err => {
    console.error('Caught error:', err.message);
  });
```

In this example, `Promise.try()` ensures that if `mightThrow()` throws an error, it will be caught in the `.catch()` block, making it easier to handle both sync and async errors in one place.

#### `Promise.withResolvers()`

This method creates a new promise along with its associated resolve and reject functions, and returns them in a convenient object. This is used, for example, when you need to create a promise but resolve or reject it later from outside the executor function.

```js
const { promise, resolve, reject } = Promise.withResolvers();

setTimeout(() => {
  resolve('Resolved successfully!');
}, 1000);

promise.then(value => {
  console.log('Success:', value);
});
```

In this example, `Promise.withResolvers()` gives you full control over when and how the promise is resolved or rejected, without needing to define the executor function inline. This pattern is commonly used in event-driven programming, timeouts, or when integrating with non-promise-based APIs.

### Error Handling with Promises

Handling errors in Promises ensures your application behaves correctly in case of unexpected situations.

- You can use `.catch()` to handle any errors or rejections that occur during the execution of Promises.

```js
myPromise
  .then(result => console.log(result))
  .catch(error => console.error(error)) // Handles the rejection
  .finally(() => console.log('Promise completed')); // Runs regardless of promise resolution
```

- Alternatively, when using `async/await`, you can use a `try/catch` block to catch and handle errors.

```js
async function performTask() {
  try {
    const result = await myPromise;
    console.log(result);
  } catch (error) {
    console.error(error); // Handles any errors
  } finally {
    // This code is executed regardless of failure
    console.log('performTask() completed');
  }
}

performTask();
```

### Scheduling Tasks in the Event Loop

In addition to Promises, Node.js provides several other mechanisms for scheduling tasks in the event loop.

#### `queueMicrotask()`

`queueMicrotask()` is used to schedule a microtask, which is a lightweight task that runs after the currently executing script but before any other I/O events or timers. Microtasks include tasks like Promise resolutions and other asynchronous operations that are prioritized over regular tasks.

```js
queueMicrotask(() => {
  console.log('Microtask is executed');
});

console.log('Synchronous task is executed');
```

In the above example, "Microtask is executed" will be logged after "Synchronous task is executed," but before any I/O operations like timers.

#### `process.nextTick()`

`process.nextTick()` is used to schedule a callback to be executed immediately after the current operation completes. This is useful for situations where you want to ensure that a callback is executed as soon as possible, but still after the current execution context.

```js
process.nextTick(() => {
  console.log('Next tick callback');
});

console.log('Synchronous task executed');
```

#### `setImmediate()`

`setImmediate()` schedules a callback to be executed in the check phase of the Node.js [event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick), which runs after the poll phase, where most I/O callbacks are processed.

```js
setImmediate(() => {
  console.log('Immediate callback');
});

console.log('Synchronous task executed');
```

#### When to Use Each

- Use `queueMicrotask()` for tasks that need to run immediately after the current script and before any I/O or timer callbacks, typically for Promise resolutions.
- Use `process.nextTick()` for tasks that should execute before any I/O events, often useful for deferring operations or handling errors synchronously.
- Use `setImmediate()` for tasks that should run after the poll phase, once most I/O callbacks have been processed.

Because these tasks execute outside of the current synchronous flow, uncaught exceptions inside these callbacks won't be caught by surrounding `try/catch` blocks and may crash the application if not properly managed (e.g., by attaching `.catch()` to Promises or using global error handlers like `process.on('uncaughtException')`).

For more information on the Event Loop, and the execution order of various phases, please see the related article, [The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick).

## Blocking vs non-blocking

> **Source:** [Blocking vs non-blocking](https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking) · [Node.js Learn](https://github.com/nodejs/learn), MIT

This overview covers the difference between **blocking** and **non-blocking**
calls in Node.js. This overview will refer to the event loop and libuv but no
prior knowledge of those topics is required. Readers are assumed to have a
basic understanding of the JavaScript language and Node.js [callback pattern](https://nodejs.org/en/learn/asynchronous-work/javascript-asynchronous-programming-and-callbacks).

> "I/O" refers primarily to interaction with the system's disk and
> network supported by [libuv](https://libuv.org/).

### Blocking

**Blocking** is when the execution of additional JavaScript in the Node.js
process must wait until a non-JavaScript operation completes. This happens
because the event loop is unable to continue running JavaScript while a
**blocking** operation is occurring.

In Node.js, JavaScript that exhibits poor performance due to being CPU intensive
rather than waiting on a non-JavaScript operation, such as I/O, isn't typically
referred to as **blocking**. Synchronous methods in the Node.js standard library
that use libuv are the most commonly used **blocking** operations. Native
modules may also have **blocking** methods.

All of the I/O methods in the Node.js standard library provide asynchronous
versions, which are **non-blocking**, and accept callback functions. Some
methods also have **blocking** counterparts, which have names that end with
`Sync`.

### Comparing Code

**Blocking** methods execute **synchronously** and **non-blocking** methods
execute **asynchronously**.

Using the File System module as an example, this is a **synchronous** file read:

```cjs
const fs = require('node:fs');

const data = fs.readFileSync('/file.md'); // blocks here until file is read
```

```mjs
import fs from 'node:fs';

const data = fs.readFileSync('/file.md'); // blocks here until file is read
```

And here is an equivalent **asynchronous** example:

```cjs
const fs = require('node:fs');

fs.readFile('/file.md', (err, data) => {
  if (err) {
    throw err;
  }
});
```

```mjs
import fs from 'node:fs';

fs.readFile('/file.md', (err, data) => {
  if (err) {
    throw err;
  }
});
```

The first example appears simpler than the second but has the disadvantage of
the second line **blocking** the execution of any additional JavaScript until
the entire file is read. Note that in the synchronous version if an error is
thrown it will need to be caught or the process will crash. In the asynchronous
version, it is up to the author to decide whether an error should throw as
shown.

Let's expand our example a little bit:

```cjs
const fs = require('node:fs');

const data = fs.readFileSync('/file.md'); // blocks here until file is read
console.log(data);
moreWork(); // will run after console.log
```

```mjs
import fs from 'node:fs';

const data = fs.readFileSync('/file.md'); // blocks here until file is read
console.log(data);
moreWork(); // will run after console.log
```

And here is a similar, but not equivalent asynchronous example:

```cjs
const fs = require('node:fs');

fs.readFile('/file.md', (err, data) => {
  if (err) {
    throw err;
  }

  console.log(data);
});
moreWork(); // will run before console.log
```

```mjs
import fs from 'node:fs';

fs.readFile('/file.md', (err, data) => {
  if (err) {
    throw err;
  }

  console.log(data);
});
moreWork(); // will run before console.log
```

In the first example above, `console.log` will be called before `moreWork()`. In
the second example `fs.readFile()` is **non-blocking** so JavaScript execution
can continue and `moreWork()` will be called first. The ability to run
`moreWork()` without waiting for the file read to complete is a key design
choice that allows for higher throughput.

### Concurrency and Throughput

JavaScript execution in Node.js is single threaded, so concurrency refers to the
event loop's capacity to execute JavaScript callback functions after completing
other work. Any code that is expected to run in a concurrent manner must allow
the event loop to continue running as non-JavaScript operations, like I/O, are
occurring.

As an example, let's consider a case where each request to a web server takes
50ms to complete and 45ms of that 50ms is database I/O that can be done
asynchronously. Choosing **non-blocking** asynchronous operations frees up that
45ms per request to handle other requests. This is a significant difference in
capacity just by choosing to use **non-blocking** methods instead of
**blocking** methods.

The event loop is different than models in many other languages where additional
threads may be created to handle concurrent work.

### Dangers of Mixing Blocking and Non-Blocking Code

There are some patterns that should be avoided when dealing with I/O. Let's look
at an example:

```cjs
const fs = require('node:fs');

fs.readFile('/file.md', (err, data) => {
  if (err) {
    throw err;
  }

  console.log(data);
});
fs.unlinkSync('/file.md');
```

```mjs
import fs from 'node:fs';

fs.readFile('/file.md', (err, data) => {
  if (err) {
    throw err;
  }

  console.log(data);
});
fs.unlinkSync('/file.md');
```

In the above example, `fs.unlinkSync()` is likely to be run before
`fs.readFile()`, which would delete `file.md` before it is actually read. A
better way to write this, which is completely **non-blocking** and guaranteed to
execute in the correct order is:

```cjs
const fs = require('node:fs');

fs.readFile('/file.md', (readFileErr, data) => {
  if (readFileErr) {
    throw readFileErr;
  }

  console.log(data);

  fs.unlink('/file.md', unlinkErr => {
    if (unlinkErr) {
      throw unlinkErr;
    }
  });
});
```

```mjs
import fs from 'node:fs';

fs.readFile('/file.md', (readFileErr, data) => {
  if (readFileErr) {
    throw readFileErr;
  }

  console.log(data);

  fs.unlink('/file.md', unlinkErr => {
    if (unlinkErr) {
      throw unlinkErr;
    }
  });
});
```

The above places a **non-blocking** call to `fs.unlink()` within the callback of
`fs.readFile()` which guarantees the correct order of operations.

### Additional Resources

- [libuv](https://libuv.org/)

## The event loop

> **Source:** [The event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) · [Node.js Learn](https://github.com/nodejs/learn), MIT

### What is the Event Loop?

The event loop is what allows Node.js to perform non-blocking I/O
operations — despite the fact that a single JavaScript thread is used by default — by
offloading operations to the system kernel whenever possible.

Since most modern kernels are multi-threaded, they can handle multiple
operations executing in the background. When one of these operations
completes, the kernel tells Node.js so that the appropriate callback
may be added to the **poll** queue to eventually be executed. We'll explain
this in further detail later in this topic.

### Event Loop Explained

When Node.js starts, it initializes the event loop, processes the
provided input script (or drops into the [REPL][], which is not covered in
this document) which may make async API calls, schedule timers, or call
`process.nextTick()`, then begins processing the event loop.

The following diagram shows a simplified overview of the event loop's
order of operations.

```
   ┌───────────────────────────┐
   │           timers          │
   └─────────────┬─────────────┘
                 │
                 v
   ┌───────────────────────────┐
┌─>│     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │      close callbacks      │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤           timers          │
   └───────────────────────────┘
```

> Each box will be referred to as a "phase" of the event loop.

Each phase has a FIFO queue of callbacks to execute. While each phase is
special in its own way, generally, when the event loop enters a given
phase, it will perform any operations specific to that phase, then
execute callbacks in that phase's queue until the queue has been
exhausted or the maximum number of callbacks has executed. When the
queue has been exhausted or the callback limit is reached, the event
loop will move to the next phase, and so on.

Since any of these operations may schedule _more_ operations and new
events processed in the **poll** phase are queued by the kernel, poll
events can be queued while polling events are being processed. As a
result, long running callbacks can allow the poll phase to run much
longer than a timer's threshold. See the [**timers**](#timers) and
[**poll**](#poll) sections for more details.

> There is a slight discrepancy between the Windows and the
> Unix/Linux implementation, but that's not important for this
> demonstration. The most important parts are here. There are actually
> seven or eight steps, but the ones we care about — ones that Node.js
> actually uses - are those above.

### Phases Overview

- **pending callbacks**: executes I/O callbacks deferred to the next loop
  iteration.
- **idle, prepare**: only used internally.
- **poll**: retrieve new I/O events; execute I/O related callbacks (almost
  all with the exception of close callbacks, the ones scheduled by timers,
  and `setImmediate()`); node will block here when appropriate.
- **check**: `setImmediate()` callbacks are invoked here.
- **close callbacks**: some close callbacks, e.g. `socket.on('close', ...)`
- **timers**: this phase executes callbacks scheduled by `setTimeout()`
  and `setInterval()`. Additionally, these callbacks can execute before entering the event loop.
  This sometimes happens for setTimeout(() => { ... }, 0) outside the I/O loop.

Between each run of the event loop, Node.js checks if it is waiting for
any asynchronous I/O or timers and shuts down cleanly if there are not
any.

Starting with libuv 1.45.0 (Node.js 20), timers are run after the
**poll** phase in each event loop iteration. In earlier versions, timers
were run before polling. To preserve backwards compatibility, libuv
1.45.0 still runs timers once before entering the event loop . This change can affect the timing of
`setImmediate()` callbacks and how they interact with timers in certain
scenarios.

### Phases in Detail

#### pending callbacks

This phase executes callbacks for some system operations such as types
of TCP errors. For example if a TCP socket receives `ECONNREFUSED` when
attempting to connect, some \*nix systems want to wait to report the
error. This will be queued to execute in the **pending callbacks** phase.

#### poll

The **poll** phase has two main functions:

1. Calculating how long it should block and poll for I/O, then
2. Processing events in the **poll** queue.

When the event loop enters the **poll** phase _and there are no timers
scheduled_, one of two things will happen:

- _If the **poll** queue **is not empty**_, the event loop will iterate
  through its queue of callbacks executing them synchronously until
  either the queue has been exhausted, or the system-dependent hard limit
  is reached.

- _If the **poll** queue **is empty**_, one of two more things will
  happen:
  - If scripts have been scheduled by `setImmediate()`, the event loop
    will end the **poll** phase and continue to the **check** phase to
    execute those scheduled scripts.

  - If scripts **have not** been scheduled by `setImmediate()`, the
    event loop will wait for callbacks to be added to the queue, then
    execute them immediately.

Once the **poll** queue is empty the event loop will check for timers
_whose time thresholds have been reached_. If one or more timers are
ready, the event loop will wrap back to the **timers** phase to execute
those timers' callbacks.

#### check

This phase allows the event loop to execute callbacks immediately after the
**poll** phase has completed. If the **poll** phase becomes idle and
scripts have been queued with `setImmediate()`, the event loop may
continue to the **check** phase rather than waiting.

`setImmediate()` is actually a special timer that runs in a separate
phase of the event loop. It uses a libuv API that schedules callbacks to
execute after the **poll** phase has completed.

Generally, as the code is executed, the event loop will eventually hit
the **poll** phase where it will wait for an incoming connection, request,
etc. However, if a callback has been scheduled with `setImmediate()`
and the **poll** phase becomes idle, it will end and continue to the
**check** phase rather than waiting for **poll** events.

#### close callbacks

If a socket or handle is closed abruptly (e.g. `socket.destroy()`), the
`'close'` event will be emitted in this phase. Otherwise it will be
emitted via `process.nextTick()`.

#### timers

A timer specifies the **threshold** _after which_ a provided callback
_may be executed_ rather than the **exact** time a person _wants it to
be executed_. Timers callbacks will run as early as they can be
scheduled after the specified amount of time has passed; however,
Operating System scheduling or the running of other callbacks may delay
them.

> Technically, the [**poll** phase](#poll) controls when timers are executed.

For example, say you schedule a timeout to execute after a 100 ms
threshold, then your script starts asynchronously reading a file which
takes 95 ms:

```cjs
const fs = require('node:fs');

function someAsyncOperation(callback) {
  // Assume this takes 95ms to complete
  fs.readFile('/path/to/file', callback);
}

const timeoutScheduled = Date.now();

setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;

  console.log(`${delay}ms have passed since I was scheduled`);
}, 100);

// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(() => {
  const startCallback = Date.now();

  // do something that will take 10ms...
  while (Date.now() - startCallback < 10) {
    // do nothing
  }
});
```

```mjs
import fs from 'node:fs';

function someAsyncOperation(callback) {
  // Assume this takes 95ms to complete
  fs.readFile('/path/to/file', callback);
}

const timeoutScheduled = Date.now();

setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;

  console.log(`${delay}ms have passed since I was scheduled`);
}, 100);

// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(() => {
  const startCallback = Date.now();

  // do something that will take 10ms...
  while (Date.now() - startCallback < 10) {
    // do nothing
  }
});
```

When the event loop enters the **poll** phase, it has an empty queue
(`fs.readFile()` has not completed), so it will wait for the number of ms
remaining until the soonest timer's threshold is reached. While it is
waiting 95 ms pass, `fs.readFile()` finishes reading the file and its
callback which takes 10 ms to complete is added to the **poll** queue and
executed. When the callback finishes, there are no more callbacks in the
queue, so the event loop will see that the threshold of the soonest
timer has been reached then wrap back to the **timers** phase to execute
the timer's callback. In this example, you will see that the total delay
between the timer being scheduled and its callback being executed will
be 105ms.

> To prevent the **poll** phase from starving the event loop, [libuv][]
> (the C library that implements the Node.js
> event loop and all of the asynchronous behaviors of the platform)
> also has a hard maximum (system dependent) before it stops polling for
> more events.

### `setImmediate()` vs `setTimeout()`

`setImmediate()` and `setTimeout()` are similar, but behave in different
ways depending on when they are called.

- `setImmediate()` is designed to execute a script once the
  current **poll** phase completes.
- `setTimeout()` schedules a script to be run after a minimum threshold
  in ms has elapsed.

The order in which the timers are executed will vary depending on the
context in which they are called. If both are called from within the
main module, then timing will be bound by the performance of the process
(which can be impacted by other applications running on the machine).

For example, if we run the following script which is not within an I/O
cycle (i.e. the main module), the order in which the two timers are
executed is non-deterministic, as it is bound by the performance of the
process:

```js
// timeout_vs_immediate.js
setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});
```

```bash
$ node timeout_vs_immediate.js
timeout
immediate

$ node timeout_vs_immediate.js
immediate
timeout
```

However, if you move the two calls within an I/O cycle, the immediate
callback is always executed first:

```cjs
// timeout_vs_immediate.js
const fs = require('node:fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  setImmediate(() => {
    console.log('immediate');
  });
});
```

```mjs
// timeout_vs_immediate.js
import fs from 'node:fs';

fs.readFile(import.meta.filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  setImmediate(() => {
    console.log('immediate');
  });
});
```

```bash
$ node timeout_vs_immediate.js
immediate
timeout

$ node timeout_vs_immediate.js
immediate
timeout
```

The main advantage to using `setImmediate()` over `setTimeout()` is
`setImmediate()` will always be executed before any timers if scheduled
within an I/O cycle, independently of how many timers are present.

### `process.nextTick()`

#### Understanding `process.nextTick()`

You may have noticed that `process.nextTick()` was not displayed in the
diagram, even though it's a part of the asynchronous API. This is because
`process.nextTick()` is not technically part of the event loop. Instead,
the `nextTickQueue` will be processed after the current operation is
completed, regardless of the current phase of the event loop. Here,
an _operation_ is defined as a transition from the
underlying C/C++ handler, and handling the JavaScript that needs to be
executed.

Looking back at our diagram, any time you call `process.nextTick()` in a
given phase, all callbacks passed to `process.nextTick()` will be
resolved before the event loop continues. This can create some bad
situations because **it allows you to "starve" your I/O by making
recursive `process.nextTick()` calls**, which prevents the event loop
from reaching the **poll** phase.

#### Why would that be allowed?

Why would something like this be included in Node.js? Part of it is a
design philosophy where an API should always be asynchronous even where
it doesn't have to be. Take this code snippet for example:

```js
function apiCall(arg, callback) {
  if (typeof arg !== 'string') {
    return process.nextTick(
      callback,
      new TypeError('argument should be string')
    );
  }
}
```

The snippet does an argument check and if it's not correct, it will pass
the error to the callback. The API updated fairly recently to allow
passing arguments to `process.nextTick()` allowing it to take any
arguments passed after the callback to be propagated as the arguments to
the callback so you don't have to nest functions.

What we're doing is passing an error back to the user but only _after_
we have allowed the rest of the user's code to execute. By using
`process.nextTick()` we guarantee that `apiCall()` always runs its
callback _after_ the rest of the user's code and _before_ the event loop
is allowed to proceed. To achieve this, the JS call stack is allowed to
unwind then immediately execute the provided callback which allows a
person to make recursive calls to `process.nextTick()` without reaching a
`RangeError: Maximum call stack size exceeded` from v8.

This philosophy can lead to some potentially problematic situations.
Take this snippet for example:

```js
let bar = null;

// this has an asynchronous signature, but calls callback synchronously
function someAsyncApiCall(callback) {
  callback();
}

// the callback is called before `someAsyncApiCall` completes.
someAsyncApiCall(() => {
  // since someAsyncApiCall hasn't completed, bar hasn't been assigned any value
  console.log('bar', bar); // null
});

bar = 1;
```

The user defines `someAsyncApiCall()` to have an asynchronous signature,
but it actually operates synchronously. When it is called, the callback
provided to `someAsyncApiCall()` is called in the same phase of the
event loop because `someAsyncApiCall()` doesn't actually do anything
asynchronously. As a result, the callback tries to reference `bar` even
though it may not have that variable in scope yet, because the script has not
been able to run to completion.

By placing the callback in a `process.nextTick()`, the script still has the
ability to run to completion, allowing all the variables, functions,
etc., to be initialized prior to the callback being called. It also has
the advantage of not allowing the event loop to continue. It may be
useful for the user to be alerted to an error before the event loop is
allowed to continue. Here is the previous example using `process.nextTick()`:

```js
let bar = null;

function someAsyncApiCall(callback) {
  process.nextTick(callback);
}

someAsyncApiCall(() => {
  console.log('bar', bar); // 1
});

bar = 1;
```

Here's another real world example:

```js
const server = net.createServer(() => {}).listen(8080);

server.on('listening', () => {});
```

When only a port is passed, the port is bound immediately. So, the
`'listening'` callback could be called immediately. The problem is that the
`.on('listening')` callback will not have been set by that time.

To get around this, the `'listening'` event is queued in a `nextTick()`
to allow the script to run to completion. This allows the user to set
any event handlers they want.

### `process.nextTick()` vs `setImmediate()`

We have two calls that are similar as far as users are concerned, but
their names are confusing.

- `process.nextTick()` fires immediately on the same phase
- `setImmediate()` fires on the following iteration or 'tick' of the
  event loop

In essence, the names should be swapped. `process.nextTick()` fires more
immediately than `setImmediate()`, but this is an artifact of the past
which is unlikely to change. Making this switch would break a large
percentage of the packages on npm. Every day more new modules are being
added, which means every day we wait, more potential breakages occur.
While they are confusing, the names themselves won't change.

> We recommend developers use `setImmediate()` in all cases because it's
> easier to reason about.

### Why use `process.nextTick()`?

There are two main reasons:

1. Allow users to handle errors, cleanup any then unneeded resources, or
   perhaps try the request again before the event loop continues.

2. At times it's necessary to allow a callback to run after the call
   stack has unwound but before the event loop continues.

One example is to match the user's expectations. Simple example:

```js
const server = net.createServer();
server.on('connection', conn => {});

server.listen(8080);
server.on('listening', () => {});
```

Say that `listen()` is run at the beginning of the event loop, but the
listening callback is placed in a `setImmediate()`. Unless a
hostname is passed, binding to the port will happen immediately. For
the event loop to proceed, it must hit the **poll** phase, which means
there is a non-zero chance that a connection could have been received
allowing the connection event to be fired before the listening event.

Another example is extending an `EventEmitter` and emitting an
event from within the constructor:

```cjs
const EventEmitter = require('node:events');

class MyEmitter extends EventEmitter {
  constructor() {
    super();
    this.emit('event');
  }
}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
```

```mjs
import EventEmitter from 'node:events';

class MyEmitter extends EventEmitter {
  constructor() {
    super();
    this.emit('event');
  }
}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
```

You can't emit an event from the constructor immediately

because the script will not have processed to the point where the user
assigns a callback to that event. So, within the constructor itself,
you can use `process.nextTick()` to set a callback to emit the event
after the constructor has finished, which provides the expected results:

```cjs
const EventEmitter = require('node:events');

class MyEmitter extends EventEmitter {
  constructor() {
    super();

    // use nextTick to emit the event once a handler is assigned
    process.nextTick(() => {
      this.emit('event');
    });
  }
}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
```

```mjs
import EventEmitter from 'node:events';

class MyEmitter extends EventEmitter {
  constructor() {
    super();

    // use nextTick to emit the event once a handler is assigned
    process.nextTick(() => {
      this.emit('event');
    });
  }
}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
```

[libuv]: https://libuv.org/
[REPL]: https://nodejs.org/api/repl.html#repl_repl
