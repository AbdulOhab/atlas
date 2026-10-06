---
title: "Node.js Best Practices"
order: 19
summary: "Production-grade Node.js: structuring a project by components, handling errors properly, and what it takes to run in production."
category: "Architecture"
level: Intermediate
---

# Node.js Best Practices

Code that works on your laptop and code that survives production are different things. These practices cover project structure, error handling and running the service for real.

**Course outline modules:** 25 (Software Patterns), 27-28 (Advanced Topics)

## Project architecture

> **Source:** [Project architecture](https://github.com/goldbergyoni/nodebestpractices#readme) · [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices), CC BY-SA 4.0

### 1.1 Structure your solution by business components

#### `📝 #updated`

**TL;DR:** The root of a system should contain folders or repositories that represent reasonably sized business modules. Each component represents a product domain (i.e., bounded context), like 'user-component', 'order-component', etc. Each component has its own API, logic, and logical database. What is the significant merit? With an autonomous component, every change is performed over a granular and smaller scope - the mental overload, development friction, and deployment fear are much smaller and better. As a result, developers can move much faster. This does not necessarily demand physical separation and can be achieved using a Monorepo or with a multi-repo

```bash
my-system
├─ apps (components)
│  ├─ orders
│  ├─ users
│  ├─ payments
├─ libraries (generic cross-component functionality)
│  ├─ logger
│  ├─ authenticator
```

**Otherwise:** when artifacts from various modules/topics are mixed together, there are great chances of a tightly-coupled 'spaghetti' system. For example, in an architecture where 'module-a controller' might call 'module-b service', there are no clear modularity borders - every code change might affect anything else. With this approach, developers who code new features struggle to realize the scope and impact of their change. Consequently, they fear breaking other modules, and each deployment becomes slower and riskier

🔗 [**Read More: structure by components**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/breakintcomponents.md)

### 1.2 Layer your components with 3-tiers, keep the web layer within its boundaries

#### `📝 #updated`

**TL;DR:** Each component should contain 'layers' - a dedicated folder for common concerns: 'entry-point' where controller lives, 'domain' where the logic lives, and 'data-access'. The primary principle of the most popular architectures is to separate the technical concerns (e.g., HTTP, DB, etc) from the pure logic of the app so a developer can code more features without worrying about infrastructural concerns. Putting each concern in a dedicated folder, also known as the [3-Tier pattern](https://en.wikipedia.org/wiki/Multitier_architecture), is the _simplest_ way to meet this goal

```bash
my-system
├─ apps (components)
│  ├─ component-a
   │  ├─ entry-points
   │  │  ├─ api # controller comes here
   │  │  ├─ message-queue # message consumer comes here
   │  ├─ domain # features and flows: DTO, services, logic
   │  ├─ data-access # DB calls w/o ORM
```

**Otherwise:** It's often seen that developer pass web objects like request/response to functions in the domain/logic layer - this violates the separation principle and makes it harder to access later the logic code by other clients like testing code, scheduled jobs, message queues, etc

🔗 [**Read More: layer your app**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/createlayers.md)

### 1.3 Wrap common utilities as packages, consider publishing

**TL;DR:** Place all reusable modules in a dedicated folder, e.g., "libraries", and underneath each module in its own folder, e.g., "/libraries/logger". Make the module an independent package with its own package.json file to increase the module encapsulation, and allows future publishing to a repository. In a Monorepo setup, modules can be consumed by 'npm linking' to their physical paths, using ts-paths or by publishing and installing from a package manager repository like the npm registry

```bash
my-system
├─ apps (components)
  │  ├─ component-a
├─ libraries (generic cross-component functionality)
│  ├─ logger
│  │  ├─ package.json
│  │  ├─ src
│  │  │ ├─ index.js

```

**Otherwise:** Clients of a module might import and get coupled to internal functionality of a module. With a package.json at the root, one can set a package.json.main or package.json.exports to explicitly tell which files and functions are part of the public interface

🔗 [**Read More: Structure by feature**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/wraputilities.md)

### 1.4 Use environment aware, secure and hierarchical config

#### `📝 #updated`

**TL;DR:** A flawless configuration setup should ensure (a) keys can be read from file AND from environment variable (b) secrets are kept outside committed code (c) config is hierarchical for easier findability (d) typing support (e) validation for failing fast (f) Specify default for each key. There are a few packages that can help tick most of those boxes like [convict](https://www.npmjs.com/package/convict), [env-var](https://github.com/evanshortiss/env-var), [zod](https://github.com/colinhacks/zod), and others

**Otherwise:** Consider a mandatory environment variable that wasn't provided. The app starts successfully and serve requests, some information is already persisted to DB. Then, it's realized that without this mandatory key the request can't complete, leaving the app in a dirty state

🔗 [**Read More: configuration best practices**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/configguide.md)

### 1.5 Consider all the consequences when choosing the main framework

#### `🌟 #new`

**TL;DR:** When building apps and APIs, using a framework is mandatory. It's easy to overlook alternative frameworks or important considerations and then finally land on a sub optimal option. As of 2023/2024, we believe that these four frameworks are worth considering: [Nest.js](https://nestjs.com/), [Fastify](https://www.fastify.io/), [express](https://expressjs.com/), and [Koa](https://koajs.com/). Click read more below for a detailed pros/cons of each framework. Simplistically, we believe that Nest.js is the best match for teams who wish to go OOP and/or build large-scale apps that can't get partitioned into smaller _autonomous_ components. Fastify is our recommendation for apps with reasonably-sized components (e.g., Microservices) that are built around simple Node.js mechanics. Read our [full considerations guide here](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/choose-framework.md)

**Otherwise:** Due to the overwhelming amount of considerations, it's easy to make decisions based on partial information and compare apples with oranges. For example, it's believed that Fastify is a minimal web-server that should get compared with express only. In reality, it's a rich framework with many official plugins that cover many concerns

🔗 [**Read More: Choosing the right framework**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/choose-framework.md)

### 1.6 Use TypeScript sparingly and thoughtfully

#### `🌟 #new`

**TL;DR:** Coding without type safety is no longer an option, TypeScript is the most popular option for this mission. Use it to define variables and functions return types. With that, it is also a double edge sword that can greatly _encourage_ complexity with its additional ~ 50 keywords and sophisticated features. Consider using it sparingly, mostly with simple types, and utilize advanced features only when a real need arises

**Otherwise:** [Researches](https://earlbarr.com/publications/typestudy.pdf) show that using TypeScript can help in detecting ~20% bugs earlier. Without it, also the developer experience in the IDE is intolerable. On the flip side, 80% of other bugs were not discovered using types. Consequently, typed syntax is valuable but limited. Only efficient tests can discover the whole spectrum of bugs, including type-related bugs. It might also defeat its purpose: sophisticated code features are likely to increase the code complexity, which by itself increases both the amount of bugs and the average bug fix time

🔗 [**Read More: TypeScript considerations**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/typescript-considerations.md)

## Error handling

> **Source:** [Error handling](https://github.com/goldbergyoni/nodebestpractices#readme) · [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices), CC BY-SA 4.0

### 2.1 Use Async-Await or promises for async error handling

**TL;DR:** Handling async errors in callback style is probably the fastest way to hell (a.k.a the pyramid of doom). The best gift you can give to your code is using Promises with async-await which enables a much more compact and familiar code syntax like try-catch

**Otherwise:** Node.js callback style, function(err, response), is a promising way to un-maintainable code due to the mix of error handling with casual code, excessive nesting, and awkward coding patterns

🔗 [**Read More: avoiding callbacks**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/asyncerrorhandling.md)

### 2.2 Extend the built-in Error object

#### `📝 #updated`

**TL;DR:** Some libraries throw errors as a string or as some custom type – this complicates the error handling logic and the interoperability between modules. Instead, create app error object/class that extends the built-in Error object and use it whenever rejecting, throwing or emitting an error. The app error should add useful imperative properties like the error name/code and isCatastrophic. By doing so, all errors have a unified structure and support better error handling. There is `no-throw-literal` ESLint rule that strictly checks that (although it has some [limitations](https://eslint.org/docs/rules/no-throw-literal) which can be solved when using TypeScript and setting the `@typescript-eslint/no-throw-literal` rule)

**Otherwise:** When invoking some component, being uncertain which type of errors come in return – it makes proper error handling much harder. Even worse, using custom types to describe errors might lead to loss of critical error information like the stack trace!

🔗 [**Read More: using the built-in error object**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/useonlythebuiltinerror.md)

### 2.3 Distinguish catastrophic errors from operational errors

#### `📝 #updated`

**TL;DR:** Operational errors (e.g. API received an invalid input) refer to known cases where the error impact is fully understood and can be handled thoughtfully. On the other hand, catastrophic error (also known as programmer errors) refers to unusual code failures that dictate to gracefully restart the application

**Otherwise:** You may always restart the application when an error appears, but why let ~5000 online users down because of a minor, predicted, operational error? The opposite is also not ideal – keeping the application up when an unknown catastrophic issue (programmer error) occurred might lead to an unpredicted behavior. Differentiating the two allows acting tactfully and applying a balanced approach based on the given context

🔗 [**Read More: operational vs programmer error**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/operationalvsprogrammererror.md)

### 2.4 Handle errors centrally, not within a middleware

**TL;DR:** Error handling logic such as logging, deciding whether to crash and monitoring metrics should be encapsulated in a dedicated and centralized object that all entry-points (e.g. APIs, cron jobs, scheduled jobs) call when an error comes in

**Otherwise:** Not handling errors within a single place will lead to code duplication and probably to improperly handled errors

🔗 [**Read More: handling errors in a centralized place**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/centralizedhandling.md)

### 2.5 Document API errors using OpenAPI or GraphQL

**TL;DR:** Let your API callers know which errors might come in return so they can handle these thoughtfully without crashing. For RESTful APIs, this is usually done with documentation frameworks like OpenAPI. If you're using GraphQL, you can utilize your schema and comments as well

**Otherwise:** An API client might decide to crash and restart only because it received back an error it couldn’t understand. Note: the caller of your API might be you (very typical in a microservice environment)

🔗 [**Read More: documenting API errors in Swagger or GraphQL**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/documentingusingswagger.md)

### 2.6 Exit the process gracefully when a stranger comes to town

**TL;DR:** When an unknown error occurs (catastrophic error, see best practice 2.3) - there is uncertainty about the application healthiness. In this case, there is no escape from making the error observable, shutting off connections and exiting the process. Any reputable runtime framework like Dockerized services or cloud serverless solutions will take care to restart

**Otherwise:** When an unfamiliar exception occurs, some object might be in a faulty state (e.g. an event emitter which is used globally and not firing events anymore due to some internal failure) and all future requests might fail or behave crazily

🔗 [**Read More: shutting the process**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/shuttingtheprocess.md)

### 2.7 Use a mature logger to increase errors visibility

#### `📝 #updated`

**TL;DR:** A robust logging tools like [Pino](https://github.com/pinojs/pino) or [Winston](https://github.com/winstonjs/winston) increases the errors visibility using features like log-levels, pretty print coloring and more. Console.log lacks these imperative features and should be avoided. The best in class logger allows attaching custom useful properties to log entries with minimized serialization performance penalty. Developers should write logs to `stdout` and let the infrastructure pipe the stream to the appropriate log aggregator

**Otherwise:** Skimming through console.logs or manually through messy text file without querying tools or a decent log viewer might keep you busy at work until late

🔗 [**Read More: using a mature logger**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/usematurelogger.md)

### 2.8 Test error flows using your favorite test framework

#### `📝 #updated`

**TL;DR:** Whether professional automated QA or plain manual developer testing – Ensure that your code not only satisfies positive scenarios but also handles and returns the right errors. On top of this, simulate deeper error flows like uncaught exceptions and ensure that the error handler treat these properly (see code examples within the "read more" section)

**Otherwise:** Without testing, whether automatically or manually, you can’t rely on your code to return the right errors. Without meaningful errors – there’s no error handling

🔗 [**Read More: testing error flows**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/testingerrorflows.md)

### 2.9 Discover errors and downtime using APM products

**TL;DR:** Monitoring and performance products (a.k.a APM) proactively gauge your codebase or API so they can automagically highlight errors, crashes, and slow parts that you were missing

**Otherwise:** You might spend great effort on measuring API performance and downtimes, probably you’ll never be aware which are your slowest code parts under real-world scenario and how these affect the UX

🔗 [**Read More: using APM products**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/apmproducts.md)

### 2.10 Catch unhandled promise rejections

#### `📝 #updated`

**TL;DR:** Any exception thrown within a promise will get swallowed and discarded unless a developer didn’t forget to explicitly handle it. Even if your code is subscribed to `process.uncaughtException`! Overcome this by registering to the event `process.unhandledRejection`

**Otherwise:** Your errors will get swallowed and leave no trace. Nothing to worry about

🔗 [**Read More: catching unhandled promise rejection**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/catchunhandledpromiserejection.md)

### 2.11 Fail fast, validate arguments using a dedicated library

**TL;DR:** Assert API input to avoid nasty bugs that are much harder to track later. The validation code is usually tedious unless you are using a modern validation library like [ajv](https://www.npmjs.com/package/ajv), [zod](https://github.com/colinhacks/zod), or [typebox](https://github.com/sinclairzx81/typebox)

**Otherwise:** Consider this – your function expects a numeric argument “Discount” which the caller forgets to pass, later on, your code checks if Discount!=0 (amount of allowed discount is greater than zero), then it will allow the user to enjoy a discount. OMG, what a nasty bug. Can you see it?

🔗 [**Read More: failing fast**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/failfast.md)

### 2.12 Always await promises before returning to avoid a partial stacktrace

#### `🌟 #new`

**TL;DR:** Always do `return await` when returning a promise to benefit full error stacktrace. If a
function returns a promise, that function must be declared as `async` function and explicitly
`await` the promise before returning it

**Otherwise:** The function that returns a promise without awaiting won't appear in the stacktrace.
Such missing frames would probably complicate the understanding of the flow that leads to the error,
especially if the cause of the abnormal behavior is inside of the missing function

🔗 [**Read More: returning promises**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/returningpromises.md)

### 2.13 Subscribe to event emitters and streams 'error' event

#### `🌟 #new`

**TL;DR:** Unlike typical functions, a try-catch clause won't get errors that originate from Event Emitters and anything inherited from it (e.g., streams). Instead of try-catch, subscribe to an event emitter's 'error' event so your code can handle the error in context. When dealing with [EventTargets](https://nodejs.org/api/events.html#eventtarget-and-event-api) (the web standard version of Event Emitters) there are no 'error' event and all errors end in the process.on('error) global event - in this case, at least ensure that the process crash or not based on the desired context. Also, mind that error originating from _asynchronous_ event handlers are not get caught unless the event emitter is initialized with {captureRejections: true}

**Otherwise:** Event emitters are commonly used for global and key application functionality such as DB or message queue connection. When this kind of crucial objects throw an error, at best the process will crash due to unhandled exception. Even worst, it will stay alive as a zombie while a key functionality is turned off

## Going to production

> **Source:** [Going to production](https://github.com/goldbergyoni/nodebestpractices#readme) · [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices), CC BY-SA 4.0

### 5.1. Monitoring

**TL;DR:** Monitoring is a game of finding out issues before customers do – obviously this should be assigned unprecedented importance. The market is overwhelmed with offers thus consider starting with defining the basic metrics you must follow (my suggestions inside), then go over additional fancy features and choose the solution that ticks all boxes. In any case, the 4 layers of observability must be covered: uptime, metrics with focus on user-facing symptoms and Node.js technical metrics like event loop lag, distributed flows measurement with Open Telemetry and logging. Click ‘Read More’ below for an overview of the solutions

**Otherwise:** Failure === disappointed customers. Simple

🔗 [**Read More: Monitoring!**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/monitoring.md)

### 5.2. Increase the observability using smart logging

**TL;DR:** Logs can be a dumb warehouse of debug statements or the enabler of a beautiful dashboard that tells the story of your app. Plan your logging platform from day 1: how logs are collected, stored and analyzed to ensure that the desired information (e.g. error rate, following an entire transaction through services and servers, etc) can really be extracted

**Otherwise:** You end up with a black box that is hard to reason about, then you start re-writing all logging statements to add additional information

🔗 [**Read More: Increase transparency using smart logging**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/smartlogging.md)

### 5.3. Delegate anything possible (e.g. gzip, SSL) to a reverse proxy

**TL;DR:** Node is quite bad at doing CPU intensive tasks like gzipping, SSL termination, etc. You should use specialized infrastructure like nginx, HAproxy or cloud vendor services instead

**Otherwise:** Your poor single thread will stay busy doing infrastructural tasks instead of dealing with your application core and performance will degrade accordingly

🔗 [**Read More: Delegate anything possible (e.g. gzip, SSL) to a reverse proxy**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/delegatetoproxy.md)

### 5.4. Lock dependencies

**TL;DR:** Your code must be identical across all environments, but without a special lockfile npm lets dependencies drift across environments. Ensure to commit your package-lock.json so all the environments will be identical

**Otherwise:** QA will thoroughly test the code and approve a version that will behave differently in production. Even worse, different servers in the same production cluster might run different code

🔗 [**Read More: Lock dependencies**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/lockdependencies.md)

### 5.5. Guard process uptime using the right tool

**TL;DR:** The process must go on and get restarted upon failures. Modern runtime platforms like Docker-ized platforms (e.g. Kubernetes), and Serverless take care for this automatically. When the app is hosted on a bare metal server, one must take care for a process management tools like [systemd](https://systemd.io/). Avoid including a custom process management tool in a modern platform that monitors an app instance (e.g., Kubernetes) - doing so will hide failures from the infrastructure. When the underlying infrastructure is not aware of errors, it can't perform useful mitigation steps like re-placing the instance in a different location

**Otherwise:** Running dozens of instances without a clear strategy and too many tools together (cluster management, docker, PM2) might lead to DevOps chaos

🔗 [**Read More: Guard process uptime using the right tool**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/guardprocess.md)

### 5.6. Utilize all CPU cores

**TL;DR:** At its basic form, a Node app runs on a single CPU core while all others are left idling. It’s your duty to replicate the Node process and utilize all CPUs. Most of the modern run-times platform (e.g., Kubernetes) allow replicating instances of the app but they won't verify that all cores are utilized - this is your duty. If the app is hosted on a bare server, it's also your duty to use some process replication solution (e.g. systemd)

**Otherwise:** Your app will likely utilize only 25% of its available resources(!) or even less. Note that a typical server has 4 CPU cores or more, naive deployment of Node.js utilizes only 1 (even using PaaS services like AWS beanstalk!)

🔗 [**Read More: Utilize all CPU cores**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/utilizecpu.md)

### 5.7. Create a ‘maintenance endpoint’

**TL;DR:** Expose a set of system-related information, like memory usage and REPL, etc in a secured API. Although it’s highly recommended to rely on standard and battle-tested tools, some valuable information and operations are easier done using code

**Otherwise:** You’ll find that you’re performing many “diagnostic deploys” – shipping code to production only to extract some information for diagnostic purposes

🔗 [**Read More: Create a ‘maintenance endpoint’**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/createmaintenanceendpoint.md)

### 5.8. Discover the unknowns using APM products

#### `📝 #updated`

**TL;DR:** Consider adding another safety layer to the production stack - APM. While the majority of symptoms and causes can be detected using traditional monitoring techniques, in a distributed system there is more than meets the eye. Application monitoring and performance products (a.k.a. APM) can auto-magically go beyond traditional monitoring and provide additional layer of discovery and developer-experience. For example, some APM products can highlight a transaction that loads too slow on the **end-user's side** while suggesting the root cause. APMs also provide more context for developers who try to troubleshoot a log error by showing what was the server busy with when the error occurred. To name a few example

**Otherwise:** You might spend great effort on measuring API performance and downtimes, probably you’ll never be aware which is your slowest code parts under real-world scenario and how these affect the UX

🔗 [**Read More: Discover errors and downtime using APM products**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/apmproducts.md)

### 5.9. Make your code production-ready

**TL;DR:** Code with the end in mind, plan for production from day 1. This sounds a bit vague so I’ve compiled a few development tips that are closely related to production maintenance (click 'Read More')

**Otherwise:** A world champion IT/DevOps guy won’t save a system that is badly written

🔗 [**Read More: Make your code production-ready**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/productioncode.md)

### 5.10. Measure and guard the memory usage

**TL;DR:** Node.js has controversial relationships with memory: the v8 engine has soft limits on memory usage (1.4GB) and there are known paths to leak memory in Node’s code – thus watching Node’s process memory is a must. In small apps, you may gauge memory periodically using shell commands but in medium-large apps consider baking your memory watch into a robust monitoring system

**Otherwise:** Your process memory might leak a hundred megabytes a day like how it happened at [Walmart](https://www.joyent.com/blog/walmart-node-js-memory-leak)

🔗 [**Read More: Measure and guard the memory usage**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/measurememory.md)

### 5.11. Get your frontend assets out of Node

**TL;DR:** Serve frontend content using a specialized infrastructure (nginx, S3, CDN) because Node performance gets hurt when dealing with many static files due to its single-threaded model. One exception to this guideline is when doing server-side rendering

**Otherwise:** Your single Node thread will be busy streaming hundreds of html/images/angular/react files instead of allocating all its resources for the task it was born for – serving dynamic content

🔗 [**Read More: Get your frontend assets out of Node**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/frontendout.md)

### 5.12. Strive to be stateless

**TL;DR:** Store any type of _data_ (e.g. user sessions, cache, uploaded files) within external data stores. When the app holds data in-process this adds additional layer of maintenance complexity like routing users to the same instance and higher cost of restarting a process. To enforce and encourage a stateless approach, most modern runtime platforms allows 'reapp-ing' instances periodically

**Otherwise:** Failure at a given server will result in application downtime instead of just killing a faulty machine. Moreover, scaling-out elasticity will get more challenging due to the reliance on a specific server

🔗 [**Read More: Be stateless, kill your Servers almost every day**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/bestateless.md)

### 5.13. Use tools that automatically detect vulnerabilities

**TL;DR:** Even the most reputable dependencies such as Express have known vulnerabilities (from time to time) that can put a system at risk. This can be easily tamed using community and commercial tools that constantly check for vulnerabilities and warn (locally or at GitHub), some can even patch them immediately

**Otherwise:** Keeping your code clean from vulnerabilities without dedicated tools will require you to constantly follow online publications about new threats. Quite tedious

🔗 [**Read More: Use tools that automatically detect vulnerabilities**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/detectvulnerabilities.md)

### 5.14. Assign a transaction id to each log statement

**TL;DR:** Assign the same identifier, transaction-id: uuid(), to each log entry within a single request (also known as correlation-id/tracing-id/request-context). Then when inspecting errors in logs, easily conclude what happened before and after. Node has a built-in mechanism, [AsyncLocalStorage](https://nodejs.org/api/async_context.html), for keeping the same context across asynchronous calls. see code examples inside

**Otherwise:** Looking at a production error log without the context – what happened before – makes it much harder and slower to reason about the issue

🔗 [**Read More: Assign ‘TransactionId’ to each log statement**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/assigntransactionid.md)

### 5.15. Set `NODE_ENV=production`

**TL;DR:** Set the environment variable `NODE_ENV` to ‘production’ or ‘development’ to flag whether production optimizations should get activated – some npm packages determine the current environment and optimize their code for production

**Otherwise:** Omitting this simple property might greatly degrade performance when dealing with some specific libraries like Express server-side rendering

🔗 [**Read More: Set NODE_ENV=production**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/setnodeenv.md)

### 5.16. Design automated, atomic and zero-downtime deployments

**TL;DR:** Research shows that teams who perform many deployments lower the probability of severe production issues. Fast and automated deployments that don’t require risky manual steps and service downtime significantly improve the deployment process. You should probably achieve this using Docker combined with CI tools as they became the industry standard for streamlined deployment

**Otherwise:** Long deployments -> production downtime & human-related error -> team unconfident in making deployment -> fewer deployments and features

### 5.17. Use an LTS release of Node.js

**TL;DR:** Ensure you are using an LTS version of Node.js to receive critical bug fixes, security updates and performance improvements

**Otherwise:** Newly discovered bugs or vulnerabilities could be used to exploit an application running in production, and your application may become unsupported by various modules and harder to maintain

🔗 [**Read More: Use an LTS release of Node.js**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/LTSrelease.md)

### 5.18. Log to stdout, avoid specifying log destination within the app

#### `📝 #updated`

**TL;DR:** Log destinations should not be hard-coded by developers within the application code, but instead should be defined by the execution environment the application runs in. Developers should write logs to `stdout` using a logger utility and then let the execution environment (container, server, etc.) pipe the `stdout` stream to the appropriate destination (i.e. Splunk, Graylog, ElasticSearch, etc.).

**Otherwise:** If developers set the log routing, less flexibility is left for the ops professional who wishes to customize it. Beyond this, if the app tries to log directly to a remote location (e.g., Elastic Search), in case of panic or crash - further logs that might explain the problem won't arrive

🔗 [**Read More: Log Routing**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/logrouting.md)

### 5.19. Install your packages with `npm ci`

**TL;DR:** Run `npm ci` to strictly do a clean install of your dependencies matching package.json and package-lock.json. Obviously production code must use the exact version of the packages that were used for testing. While package-lock.json file sets strict version for dependencies, in case of mismatch with the file package.json, the command 'npm install' will treat package.json as the source of truth. On the other hand, the command 'npm ci' will exit with error in case of mismatch between these files

**Otherwise:** QA will thoroughly test the code and approve a version that will behave differently in production. Even worse, different servers in the same production cluster might run different code.

🔗 [**Read More: Use npm ci**](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/installpackageswithnpmci.md)
