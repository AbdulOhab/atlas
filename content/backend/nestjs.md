---
title: "NestJS"
order: 15
summary: "A structured TypeScript framework for Node.js: modules, controllers, providers with dependency injection, and middleware."
category: "Frameworks"
level: Intermediate
---

# NestJS

NestJS puts an opinionated, Angular-style structure on top of Express: every feature is a module, requests land in controllers, and logic lives in injectable providers.

**Course outline modules:** 26 (NestJS)

## Fundamentals

### The problem

Express and similar frameworks leave architecture to you, so large Node.js codebases tend to grow into folders of route files, scattered validation, hand-wired dependencies and no two projects alike. Kamil Myśliwiec created NestJS (2017) to bring the structure Angular gave front-end teams, and Spring gave Java teams, to Node.js backends: modules, dependency injection and clear layers.

### Goals

- **A consistent architecture** for large teams and long-lived services.
- **Testability through dependency injection,** so any dependency can be swapped for a fake.
- **TypeScript first,** using decorators and type metadata to wire the app.
- **Platform-agnostic.** Runs on Express or Fastify, and the same building blocks serve HTTP, WebSockets, GraphQL and microservice transports.

### The ideas everything else rests on

- **Modules** group related controllers and providers and declare what they import and export. The app is a graph of modules.
- **Controllers** handle routing and the HTTP shape only. **Providers** (services, repositories) hold the logic and are injected through constructors.
- **The DI container** creates providers once (singleton by default) and resolves each class's dependencies from its constructor types.
- **The request pipeline** has distinct, ordered hooks: middleware → guards (may this request proceed? usually auth) → interceptors (before and after, for logging, caching or response mapping) → pipes (validate and transform input) → handler → exception filters (turn errors into responses).
- **Decorators** (`@Controller`, `@Get`, `@Injectable`, `@Body`) are metadata the framework reads at startup.

### Trade-offs

There's more ceremony and more concepts than a plain Express app, which is overkill for a small service. Decorators and DI make the flow less explicit, so you need to know the pipeline order to debug it. Circular module dependencies are a common pain point.

## First steps

> **Source:** [First steps](https://docs.nestjs.com/first-steps) · [NestJS docs](https://github.com/nestjs/docs.nestjs.com), MIT

This set of articles covers the **core fundamentals** of Nest. To introduce the essential building blocks of a Nest application, we'll build a basic CRUD application whose features cover a lot of ground at an introductory level.

### Language

Nest is written in [TypeScript](https://www.typescriptlang.org/) and runs on [Node.js](https://nodejs.org/en/), and it supports both TypeScript and plain JavaScript. Because Nest relies on the latest language features, using it with plain JavaScript requires [Babel](https://babeljs.io/).

Most examples in this documentation use TypeScript, but you can **switch any code snippet** to plain JavaScript syntax with the language toggle in the upper-right corner of the snippet.

### Prerequisites

Make sure that [Node.js](https://nodejs.org) is installed on your operating system. Running a Nest application requires **v20.19 or later** (or **v22.12+** on the 22.x line). The Nest CLI's generators (such as `nest new` and `nest generate`) require **v22.22.3+, v24.15+, or v26+**. We recommend the latest active LTS release, which satisfies both requirements.

### Setup

The quickest way to set up a new project is with the [Nest CLI](https://docs.nestjs.com/cli/overview). With [npm](https://www.npmjs.com/) installed, run the following commands in your terminal:

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

The CLI asks which module system to use: ESM (the default), which uses Vitest as the test runner, or CommonJS, which uses Jest.

It also asks whether to set up [NestJS Observe](https://www.observe.nestjs.com/ 'NestJS Observe'), the official observability platform for Nest. If you answer yes, the generated project includes the `@nestjs/observe` SDK, already wired into `AppModule` and `NestFactory.create()`. Requests, background jobs, errors, and distributed traces start reporting as soon as you supply your app key and secret, and the free plan needs no payment details. In an interactive terminal, the prompt defaults to yes; in non-interactive environments, such as CI, it is skipped and Observe is not added. Pass `--observe` or `--no-observe` to skip the prompt either way. See the [Observability](https://docs.nestjs.com/observability/overview) chapter for what Observe covers.

> **Hint** New projects are generated with TypeScript's [strict](https://www.typescriptlang.org/tsconfig#strict) mode enabled. To opt out, set `"strict": false` in the generated `tsconfig.json`.

The CLI creates a `project-name` directory, installs the dependencies, generates a few boilerplate files, and populates a `src/` directory with several core files.

<div class="file-tree">
  <div class="item">src</div>
  <div class="children">
    <div class="item">app.controller.spec.ts</div>
    <div class="item">app.controller.ts</div>
    <div class="item">app.module.ts</div>
    <div class="item">app.service.ts</div>
    <div class="item">main.ts</div>
  </div>
</div>

The following table describes these core files:

|                          |                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `app.controller.ts`      | A basic controller with a single route.                                                         |
| `app.controller.spec.ts` | The unit tests for the controller.                                                              |
| `app.module.ts`          | The root module of the application.                                                             |
| `app.service.ts`         | A basic service with a single method.                                                           |
| `main.ts`                | The entry file of the application. It uses `NestFactory` to create a Nest application instance. |

The `main.ts` file contains an async function that **bootstraps** the application:

```typescript
// main

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
```

To create a Nest application instance, use `NestFactory` from `@nestjs/core`, which exposes a few methods for this purpose. The `create()` method returns an application object that implements the `INestApplication` interface. The methods of this object are described in the following chapters. In the `main.ts` example above, the application starts an HTTP listener and waits for inbound HTTP requests.

The project structure generated by the Nest CLI encourages the convention of keeping each module in its own dedicated directory.

> **Hint** By default, if an error occurs while the application is being created, the process exits with code `1`. To have the error thrown instead, disable the `abortOnError` option (e.g., `NestFactory.create(AppModule, { abortOnError: false })`).

### Platform

Nest is designed to be platform-agnostic. Platform independence lets you create reusable logical parts that can be used across several different types of applications. Nest can work with any Node.js HTTP framework once an adapter is created for it. Two HTTP platforms are supported out of the box: [Express](https://expressjs.com/) and [Fastify](https://www.fastify.io). Choose the one that best suits your needs.

|                    |                                                                                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `platform-express` | [Express](https://expressjs.com/) is a well-known, minimalist web framework for Node.js. It is a battle-tested, production-ready library with extensive community resources. Nest uses the `@nestjs/platform-express` package by default, so no setup is required. |
| `platform-fastify` | [Fastify](https://www.fastify.io/) is a high-performance, low-overhead framework focused on efficiency and speed. To learn how to use it, see [Performance (Fastify)](https://docs.nestjs.com/http/performance).                                                                    |

Each platform exposes its own application interface: `NestExpressApplication` and `NestFastifyApplication`, respectively.

When you pass a type to the `NestFactory.create()` method, as in the example below, the `app` object exposes methods that are available only on that platform. You don't **need** to specify a type **unless** you want to access the underlying platform API.

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

### Running the application

Once the installation is complete, run the following command to start the application and listen for inbound HTTP requests:

```bash
$ npm run start
```

> **Hint** To speed up development builds, use the [SWC builder](https://docs.nestjs.com/recipes/swc) by passing the `-b swc` flag to the `start` script: `npm run start -- -b swc`.

This command starts the HTTP server on the port defined in the `src/main.ts` file (`3000`, unless the `PORT` environment variable is set). Once the application is running, open your browser and navigate to `http://localhost:3000/`. You should see the `Hello World!` message.

To watch your files for changes, start the application with the following command instead:

```bash
$ npm run start:dev
```

This command watches your files and, whenever they change, recompiles and restarts the server.

### Linting and formatting

The [Nest CLI](https://docs.nestjs.com/cli/overview) aims to scaffold a reliable development workflow that scales. For a fast default workflow, generated TypeScript projects come with a code **linter** and a **formatter** preinstalled: [oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [Prettier](https://prettier.io/), respectively.

> **Hint** Not sure how formatters and linters differ? See Prettier's [comparison](https://prettier.io/docs/en/comparison.html).

For headless environments where an IDE is not involved (continuous integration, Git hooks, etc.), the project includes ready-to-use `npm` scripts that run [`oxlint`](https://www.npmjs.com/package/oxlint) and [`prettier`](https://www.npmjs.com/package/prettier):

```bash
# Lint with oxlint
$ npm run lint

# Format with prettier
$ npm run format
```

## Controllers

> **Source:** [Controllers](https://docs.nestjs.com/controllers) · [NestJS docs](https://github.com/nestjs/docs.nestjs.com), MIT

Controllers are responsible for handling incoming **requests** and sending **responses** back to the client.

<figure><img class="illustrative-image" src="https://docs.nestjs.com/assets/Controllers_1.png" /></figure>

A controller's purpose is to handle specific requests for the application. The **routing** mechanism determines which controller handles each request. A controller often has multiple routes, and each route can perform a different action.

To create a basic controller, you use classes and **decorators**. Decorators associate classes with the required metadata, which Nest uses to build a routing map that connects requests to their corresponding controllers.

> **Hint** To create a CRUD controller with built-in [validation](https://docs.nestjs.com/application/validation), use the CLI's [CRUD generator](https://docs.nestjs.com/recipes/crud-generator#crud-generator): `nest g resource [name]`.

### Routing

The following example uses the `@Controller()` decorator, which is **required** to define a basic controller, with an optional route path prefix of `cats`. A path prefix in the `@Controller()` decorator groups related routes and reduces repetitive code. For example, to group the routes that manage cat entities under the `/cats` path, specify the `cats` prefix in the `@Controller()` decorator. You then don't need to repeat that portion of the path for each route in the file.

```typescript
// cats.controller
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

> **Hint** To create a controller using the CLI, run the `$ nest g controller [name]` command.

The `@Get()` HTTP request method decorator placed before the `findAll()` method tells Nest to create a handler for a specific endpoint. An endpoint is defined by the HTTP request method (GET in this case) and the route path. The route path of a handler combines the (optional) prefix declared for the controller **and** any path specified in the method's decorator. Since the example sets a prefix (`cats`) and no path in the method decorator, Nest maps `GET /cats` requests to this handler.

If the method decorator also specified a path, such as `@Get('breed')`, the resulting route would be `GET /cats/breed`.

When a `GET /cats` request arrives, Nest routes it to the user-defined `findAll()` method. The method name is arbitrary: you must declare a method to bind the route to, but Nest attaches no significance to its name.

This method returns a 200 status code along with the associated response, which in this case is a string. To explain why, we need to introduce the two **different** options Nest provides for manipulating responses:

<table>
  <tr>
    <td>Standard (recommended)</td>
    <td>
      With this built-in method, when a route handler returns a JavaScript object or array, it is <strong>automatically</strong>
      serialized to JSON. When it returns a JavaScript primitive type (e.g., <code>string</code>, <code>number</code>, <code>boolean</code>), Nest sends the value without attempting to serialize it. Response handling is therefore straightforward: return the value, and Nest takes care of the rest.
      <br />
      <br /> The response's <strong>status code</strong> is 200 by default, except for POST
      requests, which use 201. You can change this behavior by adding the <code>@HttpCode(...)</code>
      decorator at the handler level (see <a href='controllers#status-code'>Status code</a>).
    </td>
  </tr>
  <tr>
    <td>Library-specific</td>
    <td>
      You can use the library-specific (e.g., Express) <a href="https://expressjs.com/en/api.html#res" rel="nofollow" target="_blank">response object</a>, injected with the <code>@Res()</code> decorator in the route handler signature (e.g., <code>findAll(@Res() response)</code>). This approach lets you use the native response handling methods exposed by that object. For example, with Express, you can construct responses with code like <code>response.status(200).send()</code>.
    </td>
  </tr>
</table>

> **Warning** Nest detects when a handler uses either `@Res()` or `@Next()`, which indicates that you have chosen the library-specific option. If both approaches are used at the same time, the standard approach is **automatically disabled** for that route and no longer works as expected. To combine them (for example, to inject the response object only to set cookies or headers while leaving the rest to the framework), set the `passthrough` option to `true` in the `@Res({ passthrough: true })` decorator.

### Request object

Handlers often need access to the client's **request** details. Nest provides access to the [request object](https://expressjs.com/en/api.html#req) of the underlying platform (Express by default). To access it, add the `@Req()` decorator to the handler's signature, which instructs Nest to inject it.

```typescript
// cats.controller
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
```

> **Hint** To take advantage of `express` typings (as in the `request: Request` parameter above), install the `@types/express` package.

The request object represents the HTTP request and has properties for the query string, route parameters, HTTP headers, and body (see the [Express documentation](https://expressjs.com/en/api.html#req)). In most cases, you don't need to access these properties manually. Instead, use dedicated decorators such as `@Body()` or `@Query()`, which are available out of the box. The following table lists the provided decorators and the platform-specific objects they represent.

<table>
  <tbody>
    <tr>
      <td><code>@Request(), @Req()</code></td>
      <td><code>req</code></td></tr>
    <tr>
      <td><code>@Response(), @Res()</code><span class="table-code-asterisk">*</span></td>
      <td><code>res</code></td>
    </tr>
    <tr>
      <td><code>@Next()</code></td>
      <td><code>next</code></td>
    </tr>
    <tr>
      <td><code>@Session()</code></td>
      <td><code>req.session</code></td>
    </tr>
    <tr>
      <td><code>@Param(key?: string)</code></td>
      <td><code>req.params</code> / <code>req.params[key]</code></td>
    </tr>
    <tr>
      <td><code>@Body(key?: string)</code></td>
      <td><code>req.body</code> / <code>req.body[key]</code></td>
    </tr>
    <tr>
      <td><code>@Query(key?: string)</code></td>
      <td><code>req.query</code> / <code>req.query[key]</code></td>
    </tr>
    <tr>
      <td><code>@Headers(name?: string)</code></td>
      <td><code>req.headers</code> / <code>req.headers[name]</code></td>
    </tr>
    <tr>
      <td><code>@Cookies(name?: string)</code></td>
      <td>request cookies / the cookie named <code>name</code> (see <a routerLink="/techniques/cookies">Cookies</a>)</td>
    </tr>
    <tr>
      <td><code>@SignedCookies(name?: string)</code></td>
      <td>verified signed cookies / the signed cookie named <code>name</code></td>
    </tr>
    <tr>
      <td><code>@Ip()</code></td>
      <td><code>req.ip</code></td>
    </tr>
    <tr>
      <td><code>@HostParam()</code></td>
      <td><code>req.hosts</code></td>
    </tr>
  </tbody>
</table>

<sup>\* </sup>For compatibility with typings across underlying HTTP platforms (e.g., Express and Fastify), Nest provides the `@Res()` and `@Response()` decorators. `@Res()` is an alias for `@Response()`. Both directly expose the native `response` object of the underlying platform. When using them, also install the typings for the underlying library (e.g., `@types/express`) to take full advantage of them. When you inject either `@Res()` or `@Response()` in a route handler, you put Nest into **library-specific mode** for that handler, and you become responsible for managing the response. You must then send a response by calling a method on the `response` object (e.g., `res.json(...)` or `res.send(...)`); otherwise, the request will hang.

`@Body()`, `@Query()`, `@Param()`, and `@RawBody()` also accept an options object with `schema` and `pipes` properties. This lets you attach [Standard Schema](https://standardschema.dev/) compatible schemas, such as those created with Zod, Valibot, or ArkType, directly to route parameters.

```typescript
@Post()
create(@Body({ schema: createCatSchema }) createCatDto: CreateCatDto) {
  return this.catsService.create(createCatDto);
}

@Get(':id')
findOne(@Param('id', { schema: z.coerce.number().int().positive() }) id: number) {
  return this.catsService.findOne(id);
}
```

On their own, these decorators only attach the schema as metadata. To validate against it, register the built-in `StandardSchemaValidationPipe` or a custom pipe that reads `metadata.schema`.

> **Hint** To learn how to create your own decorators, see the [Custom route decorators](https://docs.nestjs.com/custom-decorators) chapter.

### Resources

Earlier, we defined an endpoint to fetch the cats resource (**GET** route). Typically, we also want an endpoint that creates new records. Let's add a **POST** handler:

```typescript
// cats.controller
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create(): string {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

Nest provides decorators for all standard HTTP methods: `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`, `@Options()`, `@Head()`, and `@QueryMethod()`. The last one maps to the `QUERY` method; it is named `QueryMethod` to avoid a clash with the `@Query()` parameter decorator. In addition, `@All()` defines an endpoint that handles all of them.

### Route wildcards

Nest also supports pattern-based routes. For example, an asterisk (`*`) at the end of a path acts as a wildcard that matches any combination of characters. In the following example, the `findAll()` method is executed for any route that starts with `abcd/`, regardless of the number of characters that follow.

```typescript
@Get('abcd/*')
findAll() {
  return 'This route uses a wildcard';
}
```

The `'abcd/*'` route path matches `abcd/`, `abcd/123`, `abcd/abc`, and so on. In string-based paths, the hyphen (`-`) and the dot (`.`) are interpreted literally.

This approach works with both Express and Fastify. Express v5, however, made its routing stricter: in plain Express, a wildcard must be named for the route to work (e.g., `abcd/{*splat}`, where `splat` is an arbitrary name for the wildcard parameter with no special meaning). Because Nest provides a compatibility layer for Express, you can still use an unnamed asterisk (`*`) as a wildcard.

For asterisks in the **middle of a route**, Express requires named wildcards (e.g., `ab{*splat}cd`), while Fastify does not support them at all.

### Route conflicts and resolution order

Nest registers routes in declaration order. On order-sensitive adapters, such as the default Express adapter, a parametric route can therefore silently shadow a more specific one:

```typescript
@Controller('users')
export class UsersController {
  @Get(':id')
  findOne() {}

  @Get('me') // never reached: `:id` matches "me" first
  findMe() {}
}
```

This is easy to miss: the application boots without a warning, and the problem only surfaces at runtime, when a request is dispatched to the wrong handler. Pipes such as `ParseIntPipe` do not help here, because routing selects the handler *before* any pipe runs.

NestJS v12 adds two opt-in `NestApplicationOptions` properties that guard against this. Both default to the previous behavior, so existing applications are unaffected unless you set them.

**`routeConflictPolicy`** enables bootstrap-time diagnostics. For each kind of conflict, it takes a severity of `'off'` (the default), `'warn'`, or `'error'`:

```typescript
const app = await NestFactory.create(AppModule, {
  routeConflictPolicy: { duplicate: 'error', shadow: 'warn' },
});
```

<table>
  <tr>
    <td><code>duplicate</code></td>
    <td>Two routes share an identical method, path, host, and version.</td>
  </tr>
  <tr>
    <td><code>shadow</code></td>
    <td>Two route patterns can match the same request (e.g., <code>/users/me</code> and <code>/users/:id</code>).</td>
  </tr>
</table>

With `'error'`, all offending pairs are aggregated into a single `RouteConflictException`, thrown when the application initializes (in `app.init()`, or in `app.listen()` if you don't call `init()` explicitly). This way, you see every conflict at once rather than one per restart.

**`routeResolutionStrategy`** controls registration order. Setting it to `'specificity'` registers the most specific routes first (literal segments take precedence over parametric segments, which take precedence over wildcards), so the example above works regardless of declaration order:

```typescript
const app = await NestFactory.create(AppModule, {
  routeResolutionStrategy: 'specificity',
});
```

The default is `'declaration'`, which preserves the previous behavior.

> **Hint** Apart from the `duplicate` policy, these options only matter on adapters where registration order affects matching. `ExpressAdapter` is order-sensitive; `FastifyAdapter` is not, because its router (`find-my-way`) already ranks routes by specificity. On Fastify, the `shadow` policy is a no-op and `'specificity'` sorting has no effect, while the `duplicate` policy is honored on both adapters. The `RouteConflictPolicy`, `RouteConflictPolicyLevel`, and `RouteResolutionStrategy` types are exported from `@nestjs/common`.

### Status code

As mentioned, the default response **status code** is **200**, except for POST requests, which default to **201**. You can change this behavior with the `@HttpCode(...)` decorator at the handler level.

```typescript
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

> **Hint** Import `HttpCode` from the `@nestjs/common` package.

Often, the status code isn't static but depends on various factors. In that case, use a library-specific **response** object (injected with `@Res()`) or, in case of an error, throw an exception.

### Response headers

To set a custom response header, use either the `@Header()` decorator or a library-specific response object (and call `res.header()` directly).

```typescript
@Post()
@Header('Cache-Control', 'no-store')
create() {
  return 'This action adds a new cat';
}
```

> **Hint** Import `Header` from the `@nestjs/common` package.

### Redirection

To redirect a response to a specific URL, use either the `@Redirect()` decorator or a library-specific response object (and call `res.redirect()` directly).

`@Redirect()` takes two optional arguments, `url` and `statusCode`. If omitted, `statusCode` defaults to `302` (`Found`).

```typescript
@Get()
@Redirect('https://nestjs.com', 301)
```

> **Hint** To determine the HTTP status code or the redirect URL dynamically, return an object that follows the `HttpRedirectResponse` interface (exported from `@nestjs/common`).

Returned values override any arguments passed to the `@Redirect()` decorator. For example:

```typescript
//
@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: 'https://docs.nestjs.com/v5/' };
  }
}
```

### Route parameters

Routes with static paths don't work when you need to accept **dynamic data** as part of the request (e.g., `GET /cats/1` to get the cat with id `1`). To define a route with parameters, add route parameter **tokens** to the route path to capture the dynamic values from the URL, as the `@Get()` decorator in the example below shows. You can then access these route parameters with the `@Param()` decorator, added to the method signature.

> **Hint** Declare routes with parameters after any static paths, so that the parameterized path doesn't intercept traffic destined for the static one. See [Route conflicts and resolution order](https://docs.nestjs.com/controllers#route-conflicts-and-resolution-order) for the options that detect this at bootstrap or resolve it for you.

```typescript
//
@Get(':id')
findOne(@Param() params: any): string {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
```

The `@Param()` decorator decorates a method parameter (`params` in the example above), making the **route** parameters available as properties of that parameter inside the method. As the code shows, you access the `id` parameter as `params.id`. Alternatively, pass a specific parameter token to the decorator and reference the route parameter directly by name in the method body.

> **Hint** Import `Param` from the `@nestjs/common` package.

```typescript
//
@Get(':id')
findOne(@Param('id') id: string): string {
  return `This action returns a #${id} cat`;
}
```

### Sub-domain routing

The `@Controller()` decorator can take a `host` option to require that the HTTP host of incoming requests matches a specific value.

```typescript
// admin.controller
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return 'Admin page';
  }
}
```

> **Warning** Since **Fastify** does not support nested routers, use the default Express adapter if you rely on sub-domain routing.

Like a route `path`, the `host` option can use tokens to capture the dynamic value at that position in the host name, as the host parameter token in the `@Controller()` decorator below shows. You can access host parameters declared this way with the `@HostParam()` decorator, added to the method signature.

```typescript
// account.controller
@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  getInfo(@HostParam('account') account: string) {
    return account;
  }
}
```

### State sharing

Developers coming from other programming languages may be surprised to learn that in Nest, nearly everything is shared across incoming requests. This includes resources such as the database connection pool, singleton services with global state, and more. Node.js doesn't follow the request/response multi-threaded stateless model, in which each request is handled by a separate thread. As a result, using singleton instances in Nest is fully **safe**.

That said, some edge cases may require request-based lifetimes for controllers, such as per-request caching in GraphQL applications, request tracking, or multi-tenancy. To learn how to control this, see [Injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes).

### Asynchronicity

Modern JavaScript relies heavily on **asynchronous** data handling, and Nest fully supports `async` functions. An `async` function always returns a `Promise`, so a route handler can return a deferred value that Nest resolves automatically:

```typescript
// cats.controller
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```

Route handlers can also return RxJS [observable streams](https://rxjs.dev/guide/observable). Nest subscribes to the stream internally and resolves the last emitted value once the stream completes.

```typescript
// cats.controller
@Get()
findAll(): Observable<any[]> {
  return of([]);
}
```

Both approaches are valid; choose the one that best suits your needs.

### Request payloads

The POST route handler in the previous example didn't accept any client parameters. Let's fix that by adding the `@Body()` decorator.

Before we proceed (if you're using TypeScript), we need to define the **DTO** (Data Transfer Object) schema. A DTO is an object that defines the shape of data sent over the network. You could define the DTO schema using **TypeScript** interfaces or plain classes, but **classes** are the recommended choice. Classes are part of the JavaScript ES6 standard, so they are preserved as real entities in the compiled JavaScript. TypeScript interfaces, by contrast, are removed during transpilation, so Nest can't reference them at runtime. This matters because features such as **pipes** rely on access to the metatype of variables at runtime, which is only possible with classes.

Create the `CreateCatDto` class:

```typescript
// create-cat.dto
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

It has three basic properties. We can now use the new DTO inside the `CatsController`:

```typescript
// cats.controller
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```

> **Hint** The `ValidationPipe` can filter out properties that the route handler should not receive. You whitelist the acceptable properties, and any property not in the whitelist is automatically stripped from the resulting object. In the `CreateCatDto` example, the whitelist consists of the `name`, `age`, and `breed` properties. Learn more in [Stripping properties](https://docs.nestjs.com/application/validation#stripping-properties).

### Query parameters

To extract query parameters from incoming requests, use the `@Query()` decorator.

Consider a route that filters a list of cats by query parameters such as `age` and `breed`. First, define the query parameters in the `CatsController`:

```typescript
// cats.controller
@Get()
async findAll(@Query('age') age: number, @Query('breed') breed: string) {
  return `This action returns all cats filtered by age: ${age} and breed: ${breed}`;
}
```

In this example, the `@Query()` decorator extracts the values of `age` and `breed` from the query string. For example, a request to:

```plaintext
GET /cats?age=2&breed=Persian
```

results in `age` being `'2'` and `breed` being `'Persian'`. Query parameter values arrive as strings, and the `number` type annotation alone doesn't convert them. To receive a number, apply a pipe such as `ParseIntPipe` (see [Pipes](https://docs.nestjs.com/pipes)).

If your application needs to handle more complex query parameters, such as nested objects or arrays:

```plaintext
?filter[where][name]=John&filter[where][age]=30
?item[]=1&item[]=2
```

configure your HTTP adapter (Express or Fastify) to use an appropriate query parser. In Express, use the `extended` parser, which supports rich query objects:

```typescript
// main
const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.set('query parser', 'extended');
```

In Fastify, use the `querystringParser` option:

```typescript
// main
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({
    querystringParser: (str) => qs.parse(str),
  }),
);
```

> **Hint** `qs` is a query string parser that supports nesting and arrays. Install it with `npm install qs`.

### Handling errors

Handling errors (i.e., working with exceptions) is covered in the [Exception filters](https://docs.nestjs.com/exception-filters) chapter.

### Observing routes in production

A controller that behaves perfectly on your machine can behave very differently under real traffic. In production, the question is never "does this route work?" but "why did `GET /cats/:id` go from 40 ms to 900 ms after Tuesday's deploy, and is it every request or one unlucky tenant?"

Route handlers are the natural unit for answering that question, and [NestJS Observe](https://www.observe.nestjs.com/ 'NestJS Observe') reports on exactly that unit. Because the `@nestjs/observe` SDK hooks into Nest's own request lifecycle rather than wrapping the HTTP server, every measurement is labeled with the route pattern you declared (`GET /cats/:id`, not 10,000 distinct URLs). Each route is therefore a single line you can sort, chart, and alert on:

```typescript
const app = await NestFactory.create(AppModule, {
  instrument: ObserveInstrument,
});
```

Together with importing `ObserveModule.forRoot()` into your root module, that is the whole integration. From there, a slow route is three clicks away: sort the route list by p95; open the operation to see whether the regression is constant or spiky and whether it started with a release; then open one slow execution and read its waterfall to see which controller, service method, or query held the time. Time is attributed per **class and method**, with awaited time subtracted, so `CatsService.findOne()` spending 800 ms in its own code is immediately distinguishable from `CatsService.findOne()` waiting 800 ms on the database.

See the [Observability](https://docs.nestjs.com/observability/overview) chapter to get set up, and [Dashboard](https://docs.nestjs.com/observability/dashboard) for the full walk from an alert down to a single request.

### Full resource sample

The following example uses several of the available decorators to create a basic controller. The controller exposes a few methods to access and manipulate internal data.

```typescript
// cats.controller
import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateCatDto, UpdateCatDto, ListAllEntities } from './dto.js';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query() query: ListAllEntities) {
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }
}
```

> **Hint** The Nest CLI provides a generator (schematic) that automatically creates **all the boilerplate code**, so you don't have to write it manually. Learn more in the [CRUD generator](https://docs.nestjs.com/recipes/crud-generator) recipe.

### Getting up and running

Even with `CatsController` fully defined, Nest doesn't know about it yet and won't create an instance of the class.

Controllers must always belong to a module, which is why we include the `controllers` array in the `@Module()` decorator. Since we haven't defined any modules other than the root `AppModule`, we'll use it to register `CatsController`:

```typescript
// app.module
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller.js';

@Module({
  controllers: [CatsController],
})
export class AppModule {}
```

With this metadata attached to the module class through the `@Module()` decorator, Nest can determine which controllers to mount.

### Library-specific approach

So far, we've covered the standard Nest way of manipulating responses. The alternative is to use a library-specific [response object](https://expressjs.com/en/api.html#res), injected with the `@Res()` decorator. To highlight the differences, let's rewrite `CatsController` as follows:

```typescript
//
import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Res() res: Response) {
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  findAll(@Res() res: Response) {
    res.status(HttpStatus.OK).json([]);
  }
}
```

This approach offers more flexibility by giving full control over the response object (e.g., header manipulation and access to library-specific features), but it should be used with caution. It is generally less clear and has some downsides. The main disadvantage is that your code becomes platform-dependent, since different underlying libraries may expose different APIs on the response object. It also makes testing harder, as you need to mock the response object, among other things.

In addition, this approach loses compatibility with Nest features that rely on standard response handling, such as interceptors and the `@HttpCode()` / `@Header()` decorators. To address this, enable the `passthrough` option:

```typescript
//
@Get()
findAll(@Res({ passthrough: true }) res: Response) {
  res.status(HttpStatus.OK);
  return [];
}
```

This way, you can interact with the native response object (for example, to set cookies or headers based on specific conditions) while leaving the rest to the framework.

## Providers

> **Source:** [Providers](https://docs.nestjs.com/providers) · [NestJS docs](https://github.com/nestjs/docs.nestjs.com), MIT

Providers are a core concept in Nest. Many of the basic Nest classes, such as services, repositories, factories, and helpers, can be treated as providers. The main idea behind a provider is that it can be **injected** as a dependency, which lets objects form relationships with each other. The Nest runtime takes care of "wiring up" these objects.

<figure><img class="illustrative-image" src="https://docs.nestjs.com/assets/Components_1.png" /></figure>

In the previous chapter, we built a basic `CatsController`. Controllers should handle HTTP requests and delegate more complex tasks to **providers**. In their simplest form, providers are plain JavaScript classes listed in the `providers` array of a module. For more details, see the [Modules](https://docs.nestjs.com/modules) chapter.

> **Hint** Nest lets you design and organize dependencies in an object-oriented way, so it's good practice to follow the [SOLID principles](https://en.wikipedia.org/wiki/SOLID).

### Services

Let's start by creating a `CatsService`. This service handles data storage and retrieval for the `CatsController`. Because it encapsulates application logic, it's a natural candidate for a provider.

```typescript
// cats.service
import { Injectable } from '@nestjs/common';
import type { Cat } from './interfaces/cat.interface.js';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
```

> **Hint** To create a service with the CLI, run `$ nest g service cats`.

`CatsService` is a basic class with one property and two methods. The key addition is the `@Injectable()` decorator. It attaches metadata to the class, declaring that `CatsService` can be managed by the Nest [IoC](https://en.wikipedia.org/wiki/Inversion_of_control) container.

The example also uses a `Cat` interface:

```typescript
// interfaces/cat.interface
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```

Now that we have a service to store and retrieve cats, let's use it in the `CatsController`:

```typescript
// cats.controller
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto.js';
import { CatsService } from './cats.service.js';
import type { Cat } from './interfaces/cat.interface.js';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```

`CatsService` is **injected** through the class constructor. The next section explains how Nest resolves it.

### Dependency injection

Nest is built around the **dependency injection** design pattern. For an introduction to the concept, see the [Angular documentation](https://angular.dev/guide/di).

Nest resolves dependencies by their type. In the example below, Nest resolves `catsService` by supplying an instance of `CatsService`. With the default (singleton) scope, Nest creates the instance once and shares it with every class that depends on it. Nest then passes the instance to the controller's constructor:

```typescript
constructor(private catsService: CatsService) {}
```

This single line does two things:

- The `private` keyword makes `catsService` a TypeScript **parameter property**: it declares a `catsService` member on the class and assigns the constructor argument to it, so you don't have to write `this.catsService = catsService` yourself.
- The `CatsService` type annotation is what Nest resolves against. At compile time, TypeScript emits the constructor's parameter types as metadata, and the container reads that metadata to determine which provider to supply.

> **Warning** Because resolution relies on the emitted type, the annotation must refer to something that exists at runtime, that is, a **class**. Interfaces and type aliases are erased during compilation. If `AppConfig` is an interface, `constructor(private config: AppConfig)` leaves Nest with no token to look up, and the application fails at startup with a "Nest can't resolve dependencies" error. The same happens when you import a class with `import type`, because the import is erased as well. To inject something that isn't a class, register it under a token and inject it explicitly with `@Inject()`, as described in [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers#interfaces-and-abstract-classes).

### Scopes

By default, a provider's lifetime ("scope") matches the application lifecycle. When the application bootstraps, Nest resolves every dependency, which means every provider is instantiated. Likewise, when the application shuts down, every provider is destroyed. You can also give a provider a different scope, for example, make it **request-scoped** so that its lifetime is tied to an individual request. See the [Injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes) chapter for details.

### Custom providers

Nest has a built-in inversion of control (IoC) container that manages the relationships between providers. The container underpins dependency injection and supports more than the class-based providers shown so far: you can also define providers with plain values, classes, and synchronous or asynchronous factories. For examples, see the [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) chapter.

### Optional providers

Some dependencies are not always required. For example, a class might depend on a **configuration object** but fall back to default values when none is provided. Such a dependency is optional, and its absence should not cause an error.

To mark a dependency as optional, apply the `@Optional()` decorator to the constructor parameter:

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}
```

This example injects a custom provider, so it passes the `HTTP_OPTIONS` custom **token** to `@Inject()`. The previous examples used constructor-based injection, where each dependency is identified by its class in the constructor signature. For more on custom providers and their tokens, see the [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) chapter.

`@Optional()` only affects what happens when the provider is _missing_: if nothing is registered under `HTTP_OPTIONS`, Nest injects `undefined` instead of failing at startup. The class is therefore responsible for the fallback, typically by merging the injected value, if any, over a set of defaults.

### Property-based injection

The examples so far use constructor-based injection, where providers are injected through the constructor. In some cases, **property-based injection** is more convenient. For example, if a base class depends on one or more providers, passing them up through `super()` from every subclass becomes cumbersome. Instead, you can apply the `@Inject()` decorator directly to a property:

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}
```

> **Warning** If your class doesn't extend another class, prefer **constructor-based** injection. The constructor states explicitly which dependencies the class requires, which makes the code easier to follow than properties annotated with `@Inject()`.

### Provider registration

With a provider (`CatsService`) and a consumer (`CatsController`) in place, you need to register the service with Nest so that it can perform the injection. To do so, add the service to the `providers` array of the `@Module()` decorator in the module file (`app.module.ts`):

```typescript
// app.module
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller.js';
import { CatsService } from './cats/cats.service.js';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```

Nest can now resolve the dependencies of the `CatsController` class.

The directory structure now looks like this:

<div class="file-tree">
<div class="item">src</div>
<div class="children">
<div class="item">cats</div>
<div class="children">
<div class="item">dto</div>
<div class="children">
<div class="item">create-cat.dto.ts</div>
</div>
<div class="item">interfaces</div>
<div class="children">
<div class="item">cat.interface.ts</div>
</div>
<div class="item">cats.controller.ts</div>
<div class="item">cats.service.ts</div>
</div>
<div class="item">app.module.ts</div>
<div class="item">main.ts</div>
</div>
</div>

### Manual instantiation

So far, Nest has resolved dependencies automatically. In some cases, you may need to step outside the dependency injection system and retrieve or instantiate providers manually. Two techniques cover these cases:

- To retrieve existing instances or instantiate providers dynamically, use `ModuleRef`, described in the [Module reference](https://docs.nestjs.com/fundamentals/module-ref) chapter.
- To get providers within the `bootstrap()` function (e.g., for standalone applications or to use a configuration service during bootstrapping), see [Standalone applications](https://docs.nestjs.com/standalone-applications).

## Modules

> **Source:** [Modules](https://docs.nestjs.com/modules) · [NestJS docs](https://github.com/nestjs/docs.nestjs.com), MIT

A module is a class annotated with the `@Module()` decorator. The decorator provides metadata that **Nest** uses to organize and manage the application structure.

<figure><img class="illustrative-image" src="https://docs.nestjs.com/assets/Modules_1.png" /></figure>

Every Nest application has at least one module, the **root module**. It is the starting point from which Nest builds the **application graph**, the internal structure Nest uses to resolve relationships and dependencies between modules and providers. A very small application may have only a root module, but most applications have multiple modules, each encapsulating a closely related set of **capabilities**. Modules are the **recommended** way to organize your components.

The `@Module()` decorator takes a single object with properties that describe the module:

|               |                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `providers`   | the providers that will be instantiated by the Nest injector and that may be shared at least across this module                                                                                          |
| `controllers` | the set of controllers defined in this module that must be instantiated                                                                                                                                  |
| `imports`     | the list of imported modules that export the providers required in this module                                                                                                                           |
| `exports`     | the subset of `providers` that this module provides and that should be available to other modules importing it. You can use either the provider itself or its token (the `provide` value)                |

A module **encapsulates** its providers by default: you can inject only providers that are part of the current module or that are explicitly exported by an imported module. A module's exported providers form its public interface, or API.

### Feature modules

In our example, `CatsController` and `CatsService` are closely related and serve the same application domain, so it makes sense to group them into a feature module. A feature module organizes the code for a specific feature, which keeps boundaries clear. This becomes more important as the application or team grows, and it aligns with the [SOLID](https://en.wikipedia.org/wiki/SOLID) principles.

Next, we'll create a `CatsModule` that groups the controller and the service:

```typescript
// cats/cats.module
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

> **Hint** To create a module with the CLI, run `$ nest g module cats`.

Above, we defined `CatsModule` in the `cats.module.ts` file and moved everything related to it into the `cats` directory. The last step is to import this module into the root module (`AppModule`, defined in the `app.module.ts` file):

```typescript
// app.module
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module.js';

@Module({
  imports: [CatsModule],
})
export class AppModule {}
```

The directory structure now looks like this:

<div class="file-tree">
  <div class="item">src</div>
  <div class="children">
    <div class="item">cats</div>
    <div class="children">
      <div class="item">dto</div>
      <div class="children">
        <div class="item">create-cat.dto.ts</div>
      </div>
      <div class="item">interfaces</div>
      <div class="children">
        <div class="item">cat.interface.ts</div>
      </div>
      <div class="item">cats.controller.ts</div>
      <div class="item">cats.module.ts</div>
      <div class="item">cats.service.ts</div>
    </div>
    <div class="item">app.module.ts</div>
    <div class="item">main.ts</div>
  </div>
</div>

### Shared modules

In Nest, modules are **singletons** by default, so you can share the same instance of any provider between multiple modules.

<figure><img class="illustrative-image" src="https://docs.nestjs.com/assets/Shared_Module_1.png" /></figure>

Every module is automatically a **shared module**: once created, it can be reused by any other module. Suppose you want to share an instance of `CatsService` between several other modules. To do so, first **export** the `CatsService` provider by adding it to the module's `exports` array:

```typescript
// cats.module
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

Any module that imports `CatsModule` now has access to `CatsService` and shares the same instance with every other module that imports it.

Registering `CatsService` directly in every module that needs it would also work, but each module would then get its own separate instance of the service. Multiple instances increase memory usage and can cause unexpected behavior, such as inconsistent state if the service holds internal state.

Encapsulating `CatsService` in a module such as `CatsModule` and exporting it ensures that every module importing `CatsModule` reuses the same instance. This reduces memory consumption and makes behavior more predictable, because shared state and resources are managed in one place. Sharing services efficiently across the application is one of the key benefits of modularity and dependency injection.

### Module re-exporting

As shown above, modules can export their internal providers. They can also re-export modules that they import. In the example below, `CommonModule` is both imported into **and** exported from `CoreModule`, which makes it available to any module that imports `CoreModule`.

```typescript
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}
```

### Dependency injection

A module class can also **inject** providers (e.g., for configuration purposes):

```typescript
// cats.module
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {
  constructor(private catsService: CatsService) {}
}
```

However, module classes themselves cannot be injected as providers due to [circular dependencies](https://docs.nestjs.com/fundamentals/circular-dependency).

### Global modules

Importing the same set of modules everywhere can become tedious. In [Angular](https://angular.dev), `providers` are registered in the global scope and, once defined, are available everywhere. Nest, by contrast, encapsulates providers inside the module scope: you can't use a module's providers elsewhere without first importing the module that encapsulates them.

To make a set of providers available everywhere out of the box (e.g., helpers or database connections), make the module **global** with the `@Global()` decorator:

```typescript
import { Module, Global } from '@nestjs/common';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Global()
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

The `@Global()` decorator makes the module global-scoped. Register global modules **only once**, typically in the root or core module. In the example above, the `CatsService` provider is available everywhere, and modules that inject it don't need to add `CatsModule` to their `imports` array.

> **Hint** Making everything global is not a recommended design practice. Global modules reduce boilerplate, but the `imports` array makes a module's API available to other modules in a controlled, explicit way. This keeps the application structure maintainable, shares only the parts of a module that others need, and avoids unnecessary coupling between unrelated parts of the application.

### Dynamic modules

Dynamic modules let you create modules that are configured at runtime. They are useful when a module's providers depend on options supplied by the module that imports it. For example, the following `FeatureFlagsModule` receives the application's feature flags through its static `forRoot()` method:

```typescript
// feature-flags.module
import { DynamicModule, Module } from '@nestjs/common';
import { FEATURE_FLAGS } from './feature-flags.constants.js';
import { FeatureFlagsService } from './feature-flags.service.js';

@Module({
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {
  static forRoot(flags: Record<string, boolean>): DynamicModule {
    return {
      module: FeatureFlagsModule,
      providers: [{ provide: FEATURE_FLAGS, useValue: flags }],
    };
  }
}
```

The `FEATURE_FLAGS` injection token is a plain constant (`export const FEATURE_FLAGS = 'FEATURE_FLAGS';`), as described in [Non-class-based provider tokens](https://docs.nestjs.com/fundamentals/custom-providers#non-class-based-provider-tokens).

> **Hint** The `forRoot()` method may return a dynamic module either synchronously or asynchronously (i.e., via a `Promise`).

The properties returned by `forRoot()` **extend** (rather than override) the metadata defined in the `@Module()` decorator. The resulting module therefore has both the statically declared `FeatureFlagsService` and the dynamically registered `FEATURE_FLAGS` provider. Because they belong to the same module, the service can inject the flags:

```typescript
// feature-flags.service
import { Inject, Injectable } from '@nestjs/common';
import { FEATURE_FLAGS } from './feature-flags.constants.js';

@Injectable()
export class FeatureFlagsService {
  constructor(
    @Inject(FEATURE_FLAGS) private readonly flags: Record<string, boolean>,
  ) {}

  isEnabled(flag: string): boolean {
    return this.flags[flag] ?? false;
  }
}
```

The module exports only `FeatureFlagsService`, so the flags themselves stay an implementation detail of the module.

Import and configure the `FeatureFlagsModule` as follows:

```typescript
// app.module
import { Module } from '@nestjs/common';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module.js';

@Module({
  imports: [
    FeatureFlagsModule.forRoot({
      newCheckout: true,
      betaDashboard: false,
    }),
  ],
})
export class AppModule {}
```

Only the module that imports `FeatureFlagsModule.forRoot()` can inject `FeatureFlagsService`. Calling `forRoot()` again in another module would create a second, separately configured instance. To share a single instance, configure the module once and re-export it. To re-export a dynamic module, list the module class in the `exports` array, without calling `forRoot()` again:

```typescript
// core.module
import { Module } from '@nestjs/common';
import { FeatureFlagsModule } from '../feature-flags/feature-flags.module.js';

@Module({
  imports: [
    FeatureFlagsModule.forRoot({
      newCheckout: true,
      betaDashboard: false,
    }),
  ],
  exports: [FeatureFlagsModule],
})
export class CoreModule {}
```

Every module that imports `CoreModule` can now inject `FeatureFlagsService`, and all of them share the same flags.

Alternatively, to register a dynamic module in the global scope, set the `global` property to `true` in the object returned by `forRoot()`. `FeatureFlagsService` then becomes injectable everywhere, without importing any module:

```typescript
return {
  global: true,
  module: FeatureFlagsModule,
  providers: [{ provide: FEATURE_FLAGS, useValue: flags }],
};
```

> **Warning** As mentioned above, making everything global **is not a good design decision**.

Options known only at runtime, such as values read by `ConfigService`, call for an asynchronous variant of `forRoot()`. The [Dynamic modules](https://docs.nestjs.com/fundamentals/dynamic-modules) chapter covers this and more.

> **Hint** To learn how to build highly customizable dynamic modules with `ConfigurableModuleBuilder`, see the [Configurable module builder](https://docs.nestjs.com/fundamentals/dynamic-modules#configurable-module-builder) section.

## Middleware

> **Source:** [Middleware](https://docs.nestjs.com/middlewares) · [NestJS docs](https://github.com/nestjs/docs.nestjs.com), MIT

Middleware is a function that is called **before** the route handler. Middleware functions have access to the [request](https://expressjs.com/en/4x/api.html#req) and [response](https://expressjs.com/en/4x/api.html#res) objects, and to the `next()` middleware function in the application's request-response cycle. The **next** middleware function is commonly denoted by a variable named `next`.

<figure><img class="illustrative-image" src="https://docs.nestjs.com/assets/Middlewares_1.png" /></figure>

By default, Nest middleware is equivalent to [Express](https://expressjs.com/en/guide/using-middleware.html) middleware. The official Express documentation describes the capabilities of middleware as follows:

<blockquote class="external">
  Middleware functions can perform the following tasks:
  <ul>
    <li>execute any code.</li>
    <li>make changes to the request and the response objects.</li>
    <li>end the request-response cycle.</li>
    <li>call the next middleware function in the stack.</li>
    <li>if the current middleware function does not end the request-response cycle, it must call <code>next()</code> to
      pass control to the next middleware function. Otherwise, the request will be left hanging.</li>
  </ul>
</blockquote>

You implement custom Nest middleware either as a function or as a class with the `@Injectable()` decorator. A class should implement the `NestMiddleware` interface, while a function has no special requirements. Let's start by implementing a simple middleware class.

> **Warning** Express and Fastify handle middleware differently and provide different method signatures. See the [Performance (Fastify)](https://docs.nestjs.com/http/performance#middleware) chapter for details.

```typescript
// logger.middleware
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
```

### Dependency injection

Nest middleware fully supports dependency injection. Like providers and controllers, middleware classes can **inject dependencies** that are available within the same module. As usual, dependencies are injected through the `constructor`.

### Applying middleware

Middleware is not registered in the `@Module()` decorator. Instead, you set it up in the `configure()` method of the module class. Modules that include middleware must implement the `NestModule` interface. Let's set up the `LoggerMiddleware` at the `AppModule` level.

```typescript
// app.module
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { CatsModule } from './cats/cats.module.js';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```

In the example above, the `LoggerMiddleware` is applied to the `/cats` route handlers defined in the `CatsController`. To restrict middleware to a particular request method, pass an object containing the route `path` and the request `method` to the `forRoutes()` method. The example below imports the `RequestMethod` enum to reference the desired request method.

```typescript
// app.module
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { CatsModule } from './cats/cats.module.js';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
```

> **Hint** The `configure()` method can be asynchronous. Declare it with `async` to `await` the completion of an asynchronous operation inside the method body.

> **Warning** With the Express adapter, Nest registers the `json` and `urlencoded` body parsers (`express.json()` and `express.urlencoded()`) by default. To customize these parsers through the `MiddlewareConsumer`, disable the defaults by setting the `bodyParser` option to `false` when creating the application with `NestFactory.create()`.

### Route wildcards

Middleware also supports pattern-based routes. For example, the named wildcard (`*splat`) matches any combination of characters in a route. In the following example, the middleware runs for any route that starts with `abcd/`, regardless of how many characters follow.

```typescript
forRoutes({
  path: 'abcd/*splat',
  method: RequestMethod.ALL,
});
```

> **Hint** `splat` is only the name of the wildcard parameter and has no special meaning. You can use any name, e.g., `*wildcard`.

The `'abcd/*splat'` route path matches `abcd/1`, `abcd/123`, `abcd/abc`, and so on. String-based paths interpret the hyphen (`-`) and the dot (`.`) literally. However, `abcd/` with no additional characters does not match. To match it as well, wrap the wildcard in braces to make it optional:

```typescript
forRoutes({
  path: 'abcd/{*splat}',
  method: RequestMethod.ALL,
});
```

### Middleware consumer

The `MiddlewareConsumer` is a helper class that provides several built-in methods to manage middleware. All of them can be **chained** in the [fluent style](https://en.wikipedia.org/wiki/Fluent_interface). The `forRoutes()` method accepts a single string, multiple strings, a `RouteInfo` object, a controller class, or multiple controller classes. In most cases, you'll pass a comma-separated list of **controllers**. Below is an example with a single controller:

```typescript
// app.module
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { CatsModule } from './cats/cats.module.js';
import { CatsController } from './cats/cats.controller.js';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
```

> **Hint** The `apply()` method accepts either a single middleware or multiple arguments to specify <a href="https://docs.nestjs.com/middleware#multiple-middleware">multiple middleware</a>.

### Excluding routes

To **exclude** certain routes from having middleware applied, use the `exclude()` method. It accepts a single string, multiple strings, or a `RouteInfo` object that identifies the routes to exclude:

```typescript
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
    'cats/{*splat}',
  )
  .forRoutes(CatsController);
```

With the example above, `LoggerMiddleware` is bound to all routes defined inside `CatsController` **except** those matching the three entries passed to the `exclude()` method.

> **Hint** The `exclude()` method supports wildcard parameters using the [path-to-regexp](https://github.com/pillarjs/path-to-regexp#parameters) package.

### Functional middleware

The `LoggerMiddleware` class we've been using is minimal: it has no members, no additional methods, and no dependencies. Middleware like this can be defined as a plain function instead of a class. This type of middleware is called **functional middleware**. Let's convert the logger middleware from a class into a function to illustrate the difference:

```typescript
// logger.middleware
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log('Request...');
  next();
}
```

Then use it within the `AppModule`:

```typescript
// app.module
consumer
  .apply(logger)
  .forRoutes(CatsController);
```

> **Hint** Consider using **functional middleware** whenever your middleware doesn't need any dependencies.

### Multiple middleware

To bind multiple middleware that execute sequentially, pass a comma-separated list to the `apply()` method:

```typescript
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);
```

### Global middleware

To bind middleware to every registered route at once, use the `use()` method of the `INestApplication` instance:

```typescript
// main
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(process.env.PORT ?? 3000);
```

> **Hint** Global middleware registered with `app.use()` cannot access the DI container, so use [functional middleware](https://docs.nestjs.com/middleware#functional-middleware) there. Alternatively, use a class middleware and bind it with `.forRoutes('*')` within the `AppModule` (or any other module).

### Error handling

When middleware throws an exception, Nest's [exceptions layer](https://docs.nestjs.com/exception-filters) catches it and sends an appropriate response, just as it does for exceptions thrown from a route handler. The recommended approach is to throw an `HttpException` (or a built-in subclass such as `UnauthorizedException`):

```typescript
// auth.middleware
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      throw new UnauthorizedException();
    }
    next();
  }
}
```

If the middleware is asynchronous, declare `use()` as `async` (or return a `Promise`) so that a rejected promise is forwarded to the exceptions layer:

```typescript
// auth.middleware
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = await this.authService.verify(req.headers.authorization);
    if (!user) {
      throw new UnauthorizedException();
    }
    req['user'] = user;
    next();
  }
}
```

You can also pass the error to `next()`. This is useful when wrapping existing Express-style middleware that reports failures through the callback:

```typescript
use(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return next(new UnauthorizedException());
  }
  next();
}
```

> **Warning** Because middleware runs before a route handler is selected, only **global** exception filters (registered with `app.useGlobalFilters()` or the `APP_FILTER` token) catch exceptions thrown from middleware. Method-scoped and controller-scoped filters are not invoked, and binding filters to a middleware class with `@UseFilters()` is not supported.

> **Hint** Middleware registered with `app.use()` is handled by the underlying HTTP platform (Express or Fastify), not by Nest's `MiddlewareModule`. Prefer throwing errors (or calling `next(err)`) from middleware bound with the `MiddlewareConsumer`, so that the exceptions layer can process them.
