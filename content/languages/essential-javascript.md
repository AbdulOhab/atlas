---
title: "Essential JavaScript"
order: 1
summary: "The JavaScript features React, Next.js and other frameworks assume: modules, destructuring, spread, this, arrow functions, array methods, immutability, JSON, promises, async/await and fetch."
category: "JavaScript"
level: Beginner
---

# Essential JavaScript

React, Next.js and every other modern framework assume a handful of JavaScript features: modules, destructuring, spread, arrow functions, array methods, promises and async/await. These 24 topics are that list, plus JSON and `this`, one page each, in the order you'll meet them.

## Fundamentals

### The problem

In 1995 web pages were static documents. Netscape wanted a small language that page authors, not just programmers, could drop into HTML to react to clicks and check forms without a round trip to the server. It had to run inside the browser, on any machine, from source text sent over the network. JavaScript was that language. Everything since, from Node.js to React, is that browser language stretched far beyond its first job.

### Goals

- **Run anywhere a browser runs**, from source, with no compile step and no install.
- **Never break the web.** A page written in 1999 must still work, so features are only ever added, never removed. This is why the old quirks are still there.
- **Stay responsive.** Scripts share one thread with the page, so they must never block waiting for the network.

### The ideas everything else rests on

- **One thread, one event loop.** Your code runs to completion, then the loop picks the next task: a click, a timer, a finished request. Nothing runs in parallel with your function, so there are no data races. In exchange, a slow loop freezes the page.
- **Asynchrony instead of blocking.** Callbacks, then promises, then `async`/`await` are three spellings of one idea: "start this, and run that when it's done". `await` pauses one function, not the thread.
- **Functions are values.** They're passed, returned and stored, and they close over the variables around them (closures). Event handlers, array methods and React components all depend on this.
- **Objects are dynamic bags of properties** linked to a prototype. `class` is syntax over prototypes, not a different model.
- **Modules** (`import`/`export`) give each file its own scope. Bundlers and the browser both follow that graph.

### Trade-offs

Dynamic typing and implicit coercion make small scripts quick to write and large programs easy to break. That is the gap TypeScript fills. Backwards compatibility means you have to learn which parts to avoid (`var`, `==`, `with`). A single thread gives you no parallelism for CPU-heavy work without workers.

## Import and Export

> **Source:** [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export), [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/modules-intro)

### export

The **`export`** declaration is used to export values from a JavaScript module. Exported values can then be imported into other programs with the `import` declaration or [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import). The value of an imported binding is subject to change in the module that exports it — when a module updates the value of a binding that it exports, the update will be visible in its imported value.

In order to use the `export` declaration in a source file, the file must be interpreted by the runtime as a [module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). In HTML, this is done by adding `type="module"` to the `script` tag, or by being imported by another module. Modules are automatically interpreted in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode).

#### Syntax

```js
// Exporting declarations
export let name1, name2/*, … */; // also var
export const name1 = 1, name2 = 2/*, … */; // also var, let
export function functionName() { /* … */ }
export class ClassName { /* … */ }
export function* generatorFunctionName() { /* … */ }
export const { name1, name2: bar } = o;
export const [ name1, name2 ] = array;

// Export list
export { name1, /* …, */ nameN };
export { variable1 as name1, variable2 as name2, /* …, */ nameN };
export { variable1 as "string name" };
export { name1 as default /*, … */ };

// Default exports
export default expression;
export default function functionName() { /* … */ }
export default class ClassName { /* … */ }
export default function* generatorFunctionName() { /* … */ }
export default function () { /* … */ }
export default class { /* … */ }
export default function* () { /* … */ }

// Aggregating modules
export * from "module-name";
export * as name1 from "module-name";
export { name1, /* …, */ nameN } from "module-name";
export { import1 as name1, import2 as name2, /* …, */ nameN } from "module-name";
export { default, /* …, */ } from "module-name";
export { default as name1 } from "module-name";
```

- `nameN`
  - : Identifier to be exported (so that it can be imported via `import` in another script). If you use an alias with `as`, the actual exported name can be specified as a string literal, which may not be a valid identifier.

#### Description

Every module can have two different types of export, _named export_ and _default export_. You can have multiple named exports per module but only one default export. Each type corresponds to one of the above syntax.

Named exports:

```js
// export features declared elsewhere
export { myFunction2, myVariable2 };

// export individual features (can export var, let,
// const, function, class)
export let myVariable = Math.sqrt(2);
export function myFunction() {
  // …
}
```

After the `export` keyword, you can use `let`, `const`, and `var` declarations, as well as function or class declarations. You can also use the `export { name1, name2 }` syntax to export a list of names declared elsewhere. Note that `export {}` does not export an empty object — it's a no-op declaration that exports nothing (an empty name list).

You cannot use `export` on a `using` or `await using` declaration. You can, however, export a variable that was declared elsewhere using `using` or `await using`. Doing so is still strongly discouraged, because the variable is disposed as soon as the module finishes executing, causing all importers to receive a value that's already disposed.

```js example-bad
export using resource1 = getResource(); // SyntaxError

// Allowed by syntax but discouraged
using resource2 = getResource();
export { resource2 };
```

Export declarations are not subject to [temporal dead zone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz) rules. You can declare that the module exports `X` before the name `X` itself is declared.

```js
export { x };
const x = 1;
// This works, because `export` is only a declaration, but doesn't
// utilize the value of `x`.
```

Default exports:

```js
// export feature declared elsewhere as default
export { myFunction as default };
// This is equivalent to:
export default myFunction;

// export individual features as default
export default function () { /* … */ }
export default class { /* … */ }
```

> **Note:**
> Names for export declarations must be distinct from each other. Having exports with duplicate names or using more than one `default` export will result in a `SyntaxError` and prevent the module from being evaluated.

The `export default` syntax allows any expression.

```js
export default 1 + 1;
```

As a special case, functions and classes are exported as _declarations_, not expressions, and these declarations can be anonymous. This means functions will be hoisted.

```js
// Works because `foo` is a function declaration,
// not a function expression
foo();

export default function foo() {
  console.log("Hi");
}

// It's still technically a declaration, but it's allowed
// to be anonymous
export default function () {
  console.log("Hi");
}
```

Named exports are useful when you need to export several values. When importing this module, named exports must be referred to by the exact same name (optionally renaming it with `as`), but the default export can be imported with any name. For example:

```js
// file test.js
const k = 12;
export default k;
```

```js
// some other file
import m from "./test"; // note that we have the freedom to use import m instead of import k, because k was default export

console.log(m); // 12
```

You can also rename named exports to avoid naming conflicts:

```js
export { myFunction as function1, myVariable as variable };
```

You can rename a name to something that's not a valid identifier by using a string literal. For example:

```js
export { myFunction as "my-function" };
```

##### Re-exporting / Aggregating

A module can also "relay" values exported from other modules without the hassle of writing two separate import/export statements. This is often useful when creating a single module concentrating various exports from various modules (usually called a "barrel module").

This can be achieved with the "export from" syntax:

```js
export { default as function1, function2 } from "bar.js";
```

Which is comparable to a combination of import and export, except that `function1` and `function2` do not become available inside the current module:

```js
import { default as function1, function2 } from "bar.js";

export { function1, function2 };
```

Most of the "import from" syntaxes have "export from" counterparts.

```js
export { x } from "mod";
export { x as v } from "mod";
export * as ns from "mod";
```

There is also `export * from "mod"`, although there's no `import * from "mod"`. This re-exports all **named** exports from `mod` as the named exports of the current module, but the default export of `mod` is not re-exported. If there are two wildcard exports statements that implicitly re-export the same name, neither one is re-exported.

```js
// -- mod1.js --
export const a = 1;

// -- mod2.js --
export const a = 3;

// -- barrel.js --
export * from "./mod1.js";
export * from "./mod2.js";

// -- main.js --
import * as ns from "./barrel.js";

console.log(ns.a); // undefined
```

Attempting to import the duplicate name directly will throw an error.

```js
import { a } from "./barrel.js";
// SyntaxError: The requested module './barrel.js' contains conflicting star exports for name 'a'
```

The following is syntactically invalid despite its import equivalent:

```js example-bad
export DefaultExport from "bar.js"; // Invalid
```

> **Note:**
> Due to the lack of this syntax, [`import source`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/source) also has no re-exporting counterpart.

The correct way of doing this is to rename the export:

```js
export { default as DefaultExport } from "bar.js";
```

The "export from" syntax allows the `as` token to be omitted, which makes the default export still re-exported as default export.

```js
export { default, function2 } from "bar.js";
```

`export from` supports all features that `import` supports — for example, [import attributes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with):

```js
export { default } from "./data.json" with { type: "json" };
```

> **Note:**
> The [`import defer * as ns`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/defer) declaration has no re-exporting counterpart, despite `import * as ns` having one. Deferred re-exports are being developed in a [separate proposal](https://github.com/tc39/proposal-deferred-reexports), because they can also avoid loading unused modules, which requires additional tree-shaking semantics. You can instead [import and export in two separate statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/defer#exporting_a_deferred_namespace), although this immediately loads the module.

#### Examples

##### Using named exports

In a module `my-module.js`, we could include the following code:

```js
// module "my-module.js"
function cube(x) {
  return x * x * x;
}

const foo = Math.PI + Math.SQRT2;

const graph = {
  options: {
    color: "white",
    thickness: "2px",
  },
  draw() {
    console.log("From graph draw function");
  },
};

export { cube, foo, graph };
```

Then in the top-level module included in your HTML page, we could have:

```js
import { cube, foo, graph } from "./my-module.js";

graph.options = {
  color: "blue",
  thickness: "3px",
};

graph.draw(); // Logs "From graph draw function"
console.log(cube(3)); // 27
console.log(foo); // 4.555806215962888
```

It is important to note the following:

- You need to include this script in your HTML with a `script` element of `type="module"`, so that it gets recognized as a module and dealt with appropriately.
- You can't run JS modules via a `file://` URL — you'll get [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) errors. You need to run it via an HTTP server.

##### Using the default export

If we want to export a single value representing an entire module, we could use a default export:

```js
// module "cube.js"

export default function cube(x) {
  return x * x * x;
}
```

Then, in another script, it is straightforward to import the default export:

```js
import cube from "./cube.js";

console.log(cube(3)); // 27
```

##### Using export from

Let's take an example where we have the following hierarchy:

- `childModule1.js`: exporting `myFunction` and `myVariable`
- `childModule2.js`: exporting `MyClass`
- `parentModule.js`: acting as an aggregator (and doing nothing else)
- top level module: consuming the exports of `parentModule.js`

This is what it would look like using code snippets:

```js
// In childModule1.js
function myFunction() {
  console.log("Hello!");
}
const myVariable = 1;
export { myFunction, myVariable };
```

```js
// In childModule2.js
class MyClass {
  constructor(x) {
    this.x = x;
  }
}

export { MyClass };
```

```js
// In parentModule.js
// Only aggregating the exports from childModule1 and childModule2
// to re-export them
export { myFunction, myVariable } from "childModule1.js";
export { MyClass } from "childModule2.js";
```

```js
// In top-level module
// We can consume the exports from a single module since parentModule
// "collected"/"bundled" them in a single source
import { myFunction, myVariable, MyClass } from "parentModule.js";
```

### import

The static **`import`** declaration is used to import read-only live bindings which are [exported](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) by another module. The imported bindings are called _live bindings_ because they are updated by the module that exported the binding, but cannot be re-assigned by the importing module.

In order to use the `import` declaration in a source file, the file must be interpreted by the runtime as a [module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). In HTML, this is done by adding `type="module"` to the `script` tag. Modules are automatically interpreted in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode).

There is also a function-like dynamic [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import), which does not require scripts of `type="module"`.

#### Syntax

```js
import defaultExport from "module-name";
import * as name from "module-name";
import { export1 } from "module-name";
import { export1 as alias1 } from "module-name";
import { default as alias } from "module-name";
import { export1, export2 } from "module-name";
import { export1, export2 as alias2, /* … */ } from "module-name";
import { "string name" as alias } from "module-name";
import defaultExport, { export1, /* … */ } from "module-name";
import defaultExport, * as name from "module-name";
import "module-name";
```

- `defaultExport`
  - : Name that will refer to the default export from the module. Must be a valid JavaScript identifier.
- `module-name`
  - : The module to import from. Only single- and double-quoted string literals are allowed. The evaluation of the specifier is host-specified. Most hosts align with browsers and resolve the specifiers as URLs relative to the current module URL (see [`import.meta.url`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta)). Node, bundlers, and other non-browser environments often define their own features on top of this, so you should find documentation for them to understand the exact rules. The [module specifier resolution](#module_specifier_resolution) section also has more information.
- `name`
  - : Name of the module object that will be used as a kind of namespace when referring to the imports. Must be a valid JavaScript identifier.
- `exportN`
  - : Name of the exports to be imported. The name can be either an identifier or a string literal, depending on what `module-name` declares to export. If it is a string literal, it must be aliased to a valid identifier.
- `aliasN`
  - : Names that will refer to the named imports. Must be a valid JavaScript identifier.

The `"module-name"` may be followed by a set of [import attributes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with), starting with the `with` keyword.

#### Description

`import` declarations can only be present in modules, and only at the top-level (i.e., not inside blocks, functions, etc.). If an `import` declaration is encountered in non-module contexts (for example, `<script>` tags without `type="module"`, `eval`, `new Function`, which all have "script" or "function body" as parsing goals), a `SyntaxError` is thrown. To load modules in non-module contexts, use the [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) syntax instead.

All imported bindings cannot be in the same scope as any other declaration, including `let`, `const`, `class`, `function`, `var`, and `import` declaration.

`import` declarations are designed to be syntactically rigid (for example, only string literal specifiers, only permitted at the top-level, all bindings must be identifiers), which allows modules to be statically analyzed and linked before getting evaluated. This is the key to making modules asynchronous by nature, powering features like [top-level await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#top_level_await).

The `import` keyword may be followed by a "phase modifier" that stops the module import process at a particular phase:

- [`import defer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/defer)
- [`import source`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/source)

Each of these syntaxes is considered a distinct type of declaration.

##### Forms of import declarations

There are four forms of `import` declarations:

- [Named import](#named_import): `import { export1, export2 } from "module-name";`
- [Default import](#default_import): `import defaultExport from "module-name";`
- [Namespace import](#namespace_import): `import * as name from "module-name";`
- [Side effect import](#import_a_module_for_its_side_effects_only): `import "module-name";`

Below are examples to clarify the syntax.

###### Named import

Given a value named `myExport` which has been exported from the module `my-module` either implicitly as `export * from "another.js"` or explicitly using the `export` statement, this inserts `myExport` into the current scope.

```js
import { myExport } from "/modules/my-module.js";
```

You can import multiple names from the same module.

```js
import { foo, bar } from "/modules/my-module.js";
```

You can rename an export when importing it. For example, this inserts `shortName` into the current scope.

```js
import { reallyReallyLongModuleExportName as shortName } from "/modules/my-module.js";
```

A module may also export a member as a string literal which is not a valid identifier, in which case you must alias it in order to use it in the current module.

```js
// /modules/my-module.js
const a = 1;
export { a as "a-b" };
```

```js
import { "a-b" as a } from "/modules/my-module.js";
```

> **Note:**
> `import { x, y } from "mod"` is not equivalent to `import defaultExport from "mod"` and then destructuring `x` and `y` from `defaultExport`. Named and default imports are distinct syntaxes in JavaScript modules.

###### Default import

Default exports need to be imported with the corresponding default import syntax. This version directly imports the default:

```js
import myDefault from "/modules/my-module.js";
```

Since the default export doesn't explicitly specify a name, you can give the identifier any name you like.

It is also possible to specify a default import with namespace imports or named imports. In such cases, the default import will have to be declared first. For instance:

```js
import myDefault, * as myModule from "/modules/my-module.js";
// myModule.default and myDefault point to the same binding
```

or

```js
import myDefault, { foo, bar } from "/modules/my-module.js";
```

Importing a name called `default` has the same effect as a default import. It is necessary to alias the name because `default` is a reserved word.

```js
import { default as myDefault } from "/modules/my-module.js";
```

###### Namespace import

The following code inserts `myModule` into the current scope, containing all the exports from the module located at `/modules/my-module.js`.

```js
import * as myModule from "/modules/my-module.js";
```

Here, `myModule` represents a _namespace_ object which contains all exports as properties. For example, if the module imported above includes an export `doAllTheAmazingThings()`, you would call it like this:

```js
myModule.doAllTheAmazingThings();
```

`myModule` is a [sealed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isSealed) object with [`null` prototype](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object#null-prototype_objects). The default export is available as a key called `default`. For more information, see [module namespace object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object).

> **Note:**
> JavaScript does not have wildcard imports like `import * from "module-name"`, because of the high possibility of name conflicts.

###### Import a module for its side effects only

Import an entire module for side effects only, without importing anything. This runs
the module's global code, but doesn't actually import any values.

```js
import "/modules/my-module.js";
```

This is often used for [polyfills](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill), which mutate the global variables.

##### Hoisting

Import declarations are [hoisted](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting). In this case, that means that the identifiers the imports introduce are available in the entire module scope, and their side effects are produced before the rest of the module's code runs.

```js
myModule.doAllTheAmazingThings(); // myModule.doAllTheAmazingThings is imported by the next line

import * as myModule from "/modules/my-module.js";
```

##### Module specifier resolution

The ECMAScript specification does not define how module specifiers are resolved and leaves it to the host environment (e.g., browsers, Node.js, Deno). Browser behavior is specified by [the HTML spec](https://html.spec.whatwg.org/multipage/webappapis.html#resolve-a-module-specifier), and this has become the _de facto_ baseline for all environments.

There are three types of specifiers widely recognized, as implemented by the HTML spec, Node, and many others:

- _Relative specifiers_ that start with `/`, `./`, or `../`, which are resolved relative to the current module URL.
- _Absolute specifiers_ that are parsable URLs, which are resolved as-is.
- _Bare specifiers_ that are not one of the above.

The most notable caveat for relative specifiers, especially for people familiar with the [CommonJS](https://wiki.commonjs.org/wiki/CommonJS) conventions, is that browsers forbid one specifier to implicitly resolve to many potential candidates. In CommonJS, if you have `main.js` and `utils/index.js`, then all of the following will import the "default export" from `utils/index.js`:

```js
// main.js
const utils = require("./utils"); // Omit the "index.js" file name
const utils = require("./utils/index"); // Omit only the ".js" extension
const utils = require("./utils/index.js"); // The most explicit form
```

On the web, this is costly because if you write `import x from "./utils"`, the browser needs to send requests to `utils`, `utils/index.js`, `utils.js`, and potentially many other URLs until it finds an importable module. Therefore, in the HTML spec, the specifier by default can only be a URL resolved relative to the current module URL. You cannot omit the file extension or the `index.js` file name. This behavior has been inherited by Node's ESM implementation, but it is not a part of the ECMAScript specification.

Note that this does not mean that `import x from "./utils"` never works on the web. The browser still sends a request to that URL, and if the server can respond with the correct content, the import will succeed. This requires the server to implement some custom resolution logic, because usually extension-less requests are understood as requests for HTML files.

Absolute specifiers can be any kind of [URL](https://developer.mozilla.org/en-US/docs/Web/URI) that resolve to importable source code. Most notably:

- [HTTP URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP) are always supported on the web since most scripts already have HTTP URLs. It's supported natively by Deno (which initially predicated its entire module system on HTTP URLs), but it only has experimental support in Node via [custom HTTPS loaders](https://nodejs.org/api/module.html#import-from-https).
- `file:` URLs are supported by many non-browser runtimes such as Node, since scripts there already have `file:` URLs, but they are not supported by browsers due to security reasons.
- [Data URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data) are supported by many runtimes including browsers, Node, Deno, etc. They are useful for embedding small modules directly into the source code. Supported [MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types) are those that designate importable source code, such as `text/javascript` for JavaScript, `application/json` for JSON modules, `application/wasm` for WebAssembly modules, etc. (They may still require [import attributes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with).)

  ```js
  // HTTP URLs
  import x from "https://example.com/x.js";
  // Data URLs
  import x from "data:text/javascript,export default 42;";
  // Data URLs for JSON modules
  import x from 'data:application/json,{"foo":42}' with { type: "json" };
  ```

  `text/javascript` data URLs are still interpreted as modules, but they cannot use relative imports — because the `data:` URL scheme is not hierarchical. That is, `import x from "data:text/javascript,import y from './y.js';"` will throw an error because the relative specifier `'./y.js'` cannot be resolved.

- [`node:` URLs](https://nodejs.org/api/esm.html#node-imports) resolve to built-in Node.js modules. They are supported by Node and other runtimes that claim compatibility with Node, such as Bun.

Bare specifiers, popularized by CommonJS, are resolved within the `node_modules` directory. For example, if you have `import x from "foo"`, then the runtime will look for the `foo` package within any `node_modules` directory in the parent directories of the current module. This behavior can be reproduced in browsers using [import maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#importing_modules_using_import_maps), which also enable you to customize resolution in other ways.

The module resolution algorithm can also be executed programmatically using the [`import.meta.resolve`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta/resolve) function defined by the HTML spec.

#### Examples

##### Standard Import

In this example, we create a re-usable module that exports a function to get all primes within a given range.

```js
// getPrimes.js
/**
 * Returns a list of prime numbers that are smaller than `max`.
 */
export function getPrimes(max) {
  const isPrime = Array.from({ length: max }, () => true);
  isPrime[0] = isPrime[1] = false;
  isPrime[2] = true;
  for (let i = 2; i * i < max; i++) {
    if (isPrime[i]) {
      for (let j = i ** 2; j < max; j += i) {
        isPrime[j] = false;
      }
    }
  }
  return [...isPrime.entries()]
    .filter(([, isPrime]) => isPrime)
    .map(([number]) => number);
}
```

```js
import { getPrimes } from "/modules/getPrimes.js";

console.log(getPrimes(10)); // [2, 3, 5, 7]
```

##### Imported values can only be modified by the exporter

The identifier being imported is a _live binding_, because the module exporting it may re-assign it and the imported value would change. However, the module importing it cannot re-assign it. Still, any module holding an exported object can mutate the object, and the mutated value can be observed by all other modules importing the same value.

You can also observe the new value through the [module namespace object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object).

```js
// my-module.js
export let myValue = 1;
setTimeout(() => {
  myValue = 2;
}, 500);
```

```js
// main.js
import { myValue } from "/modules/my-module.js";
import * as myModule from "/modules/my-module.js";

console.log(myValue); // 1
console.log(myModule.myValue); // 1
setTimeout(() => {
  console.log(myValue); // 2; my-module has updated its value
  console.log(myModule.myValue); // 2
  myValue = 3; // TypeError: Assignment to constant variable.
  // The importing module can only read the value but can't re-assign it.
}, 1000);
```

##### Importing non-JavaScript modules

Non-JavaScript modules can also be imported using the `import` statement, but their types need to be explicitly declared using [import attributes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with). For example, to import a JSON module, you need to specify the `type: "json"` attribute.

```js
import data from "./data.json" with { type: "json" };
```

## Destructuring Objects and Arrays

> **Source:** [Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/destructuring-assignment)

The **destructuring** syntax is a JavaScript syntax that makes it possible to unpack values from arrays, or properties from objects, into distinct variables. It can be used in locations that receive data (such as the left-hand side of an assignment or anywhere that creates new identifier bindings).

```js
let a, b, rest;
[a, b] = [10, 20];

console.log(a);
// Expected output: 10

console.log(b);
// Expected output: 20

[a, b, ...rest] = [10, 20, 30, 40, 50];

console.log(rest);
// Expected output: Array [30, 40, 50]
```

### Syntax

```js
const [a, b] = array;
const [a, , b] = array;
const [a = aDefault, b] = array;
const [a, b, ...rest] = array;
const [a, , b, ...rest] = array;
const [a, b, ...{ pop, push }] = array;
const [a, b, ...[c, d]] = array;

const { a, b } = obj;
const { a: a1, b: b1 } = obj;
const { a: a1 = aDefault, b = bDefault } = obj;
const { a, b, ...rest } = obj;
const { a: a1, b: b1, ...rest } = obj;
const { [key]: a } = obj;

let a, b, a1, b1, c, d, rest, pop, push;
[a, b] = array;
[a, , b] = array;
[a = aDefault, b] = array;
[a, b, ...rest] = array;
[a, , b, ...rest] = array;
[a, b, ...{ pop, push }] = array;
[a, b, ...[c, d]] = array;

({ a, b } = obj); // parentheses are required
({ a: a1, b: b1 } = obj);
({ a: a1 = aDefault, b = bDefault } = obj);
({ a, b, ...rest } = obj);
({ a: a1, b: b1, ...rest } = obj);
```

### Description

The object and array literal expressions provide an easy way to create _ad hoc_ packages of data.

```js
const arr = [a, b, c];
```

The destructuring uses similar syntax but uses it on the left-hand side of the assignment instead. It performs the reverse operation of an array declaration, by declaring each element in the collection as a separate variable.

```js
const arr = [1, 2, 3];
const [a, b, c] = arr;
// a = 1, b = 2, c = 3
```

As for objects, compare the two pairs of lines below, and see how there's a direct correspondence within each pair.

```js
const obj = { a, b, c };
const { a, b, c } = obj;
// Equivalent to:
// const a = obj.a, b = obj.b, c = obj.c;

const obj = { prop1: x, prop2: y, prop3: z };
const { prop1: x, prop2: y, prop3: z } = obj;
// Equivalent to:
// const x = obj.prop1, y = obj.prop2, z = obj.prop3;
```

This capability is similar to features present in languages such as Perl and Python.

For features specific to array or object destructuring, refer to the individual [examples](#examples) below.

#### Binding and assignment

For both object and array destructuring, there are two kinds of destructuring patterns: _binding pattern_ and _assignment pattern_, with slightly different syntaxes.

In binding patterns, the pattern starts with a declaration keyword (`var`, `let`, or `const`). Then, each individual property must either be bound to a variable or further destructured.

```js
const obj = { a: 1, b: { c: 2 } };
const {
  a,
  b: { c: d },
} = obj;
// Two variables are bound: `a` and `d`
```

All variables share the same declaration, so if you want some variables to be re-assignable but others to be read-only, you may have to destructure twice — once with `let`, once with `const`.

```js
const obj = { a: 1, b: { c: 2 } };
const { a } = obj; // a is constant
let {
  b: { c: d },
} = obj; // d is re-assignable
```

In many other syntaxes where the language binds a variable for you, you can use a binding destructuring pattern. These include:

- The looping variable of [`for...in`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in) [`for...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of), and [`for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loops;
- [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions) parameters;
- The [`catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) binding variable.

In assignment patterns, the pattern does not start with a keyword. Each destructured property is assigned to a target of assignment — which may either be declared beforehand with `var` or `let`, or is a property of another object — in general, anything that can appear on the left-hand side of an assignment expression.

```js
const numbers = [];
const obj = { a: 1, b: 2 };
({ a: numbers[0], b: numbers[1] } = obj);
// The properties `a` and `b` are assigned to properties of `numbers`
```

> **Note:**
> The parentheses `( ... )` around the assignment statement are required when using object literal destructuring without a declaration.
>
> `{ a, b } = { a: 1, b: 2 }` is not valid stand-alone syntax, as the `{ a, b }` on the left-hand side is considered a block and not an object literal according to the rules of [expression statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/Expression_statement). However, `({ a, b } = { a: 1, b: 2 })` is valid, as is `const { a, b } = { a: 1, b: 2 }`.
>
> If your coding style does not include trailing semicolons, the `( ... )` expression needs to be preceded by a semicolon, or it may be used to execute a function on the previous line.

Note that the equivalent _binding pattern_ of the code above is not valid syntax:

```js example-bad
const numbers = [];
const obj = { a: 1, b: 2 };
const { a: numbers[0], b: numbers[1] } = obj;

// This is equivalent to:
//   const numbers[0] = obj.a;
//   const numbers[1] = obj.b;
// Which definitely is not valid.
```

You can only use assignment patterns as the left-hand side of the [assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Assignment) operator. You cannot use them with compound assignment operators such as `+=` or `*=`.

#### Default value

Each destructured property can have a _default value_. The default value is used when the property is not present, or has value `undefined`. It is not used if the property has value `null`.

```js
const [a = 1] = []; // a is 1
const { b = 2 } = { b: undefined }; // b is 2
const { c = 2 } = { c: null }; // c is null
```

The default value can be any expression. It will only be evaluated when necessary.

```js
const { b = console.log("hey") } = { b: 2 };
// Does not log anything, because `b` is defined and there's no need
// to evaluate the default value.
```

#### Rest properties and rest elements

You can end a destructuring pattern with a rest property `...rest`. For array destructuring, it collects remaining elements of the iterable into a new array called `rest` (or any name you give it). For object destructuring, it copies all enumerable own properties of the object that are not already picked off by the destructuring pattern into a new object called `rest`.

More formally, the `...rest` syntax is called "rest elements" in array destructuring and "rest properties" in object destructuring, but we often just collectively call them "rest property".

```js
const { a, ...others } = { a: 1, b: 2, c: 3 };
console.log(others); // { b: 2, c: 3 }

const [first, ...others2] = [1, 2, 3];
console.log(others2); // [2, 3]
```

The rest property must be the last in the pattern, and must not have a trailing comma.

```js example-bad
const [a, ...b,] = [1, 2, 3];

// SyntaxError: rest element may not have a trailing comma
// Always consider using rest operator as the last element
```

Like any other JavaScript language feature, there is no implicit deep-copying. The rest property creates a new object (or array), but all its member values, if they are object references, remain the same.

### Examples

#### Array destructuring

##### Basic variable assignment

```js
const foo = ["one", "two", "three"];

const [red, yellow, green] = foo;
console.log(red); // "one"
console.log(yellow); // "two"
console.log(green); // "three"
```

##### Destructuring with more elements than the source

In an array destructuring from an array of length _N_ specified on the right-hand side of the assignment, if the number of variables specified on the left-hand side of the assignment is greater than _N_, only the first _N_ variables are assigned values. The values of the remaining variables will be undefined.

```js
const foo = ["one", "two"];

const [red, yellow, green, blue] = foo;
console.log(red); // "one"
console.log(yellow); // "two"
console.log(green); // undefined
console.log(blue); // undefined
```

##### Swapping variables

Two variables values can be swapped in one destructuring expression.

Without destructuring, swapping two values requires a temporary variable (or, in some low-level languages, the [XOR-swap trick](https://en.wikipedia.org/wiki/XOR_swap_algorithm)).

```js
let a = 1;
let b = 3;

[a, b] = [b, a];
console.log(a); // 3
console.log(b); // 1

const arr = [1, 2, 3];
[arr[2], arr[1]] = [arr[1], arr[2]];
console.log(arr); // [1, 3, 2]
```

##### Parsing an array returned from a function

It's always been possible to return an array from a function. Destructuring can make working with an array return value more concise.

In this example, `f()` returns the values `[1, 2]` as its output, which can be parsed in a single line with destructuring.

```js
function f() {
  return [1, 2];
}

const [a, b] = f();
console.log(a); // 1
console.log(b); // 2
```

##### Ignoring some returned values

You can ignore return values that you're not interested in:

```js
function f() {
  return [1, 2, 3];
}

const [a, , b] = f();
console.log(a); // 1
console.log(b); // 3

const [c] = f();
console.log(c); // 1
```

You can also ignore all returned values:

```js
[, ,] = f();
```

Though in this case, it's probably clearer to just call the function and not use destructuring at all. You don't have to use the return value.

##### Using a binding pattern as the rest property

The rest property of array destructuring can be another array or object binding pattern. The inner destructuring destructures from the array created after collecting the rest elements, so you cannot access any properties present on the original iterable in this way.

```js
const [a, b, ...{ length }] = [1, 2, 3];
console.log(a, b, length); // 1 2 1
```

```js
const [a, b, ...[c, d]] = [1, 2, 3, 4];
console.log(a, b, c, d); // 1 2 3 4
```

These binding patterns can even be nested, as long as each rest property is the last in the list.

```js
const [a, b, ...[c, d, ...[e, f]]] = [1, 2, 3, 4, 5, 6];
console.log(a, b, c, d, e, f); // 1 2 3 4 5 6
```

On the other hand, object destructuring can only have an identifier as the rest property.

```js example-bad
const { a, ...{ b } } = { a: 1, b: 2 };
// SyntaxError: `...` must be followed by an identifier in declaration contexts

let a, b;
({ a, ...{ b } } = { a: 1, b: 2 });
// SyntaxError: `...` must be followed by an assignable reference in assignment contexts
```

##### Unpacking values from a regular expression match

When the regular expression [`exec()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec) method finds a match, it returns an array containing first the entire matched portion of the string and then the portions of the string that matched each parenthesized group in the regular expression. Destructuring allows you to unpack the parts out of this array easily, ignoring the full match if it is not needed.

```js
function parseProtocol(url) {
  const parsedURL = /^(\w+):\/\/([^/]+)\/(.*)$/.exec(url);
  if (!parsedURL) {
    return false;
  }
  console.log(parsedURL);
  // ["https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  // "https", "developer.mozilla.org", "en-US/docs/Web/JavaScript"]

  const [, protocol, fullHost, fullPath] = parsedURL;
  return protocol;
}

console.log(
  parseProtocol("https://developer.mozilla.org/en-US/docs/Web/JavaScript"),
);
// "https"
```

##### Using array destructuring on any iterable

Array destructuring calls the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) of the right-hand side. Therefore, any iterable, not necessarily arrays, can be destructured.

```js
const [a, b] = new Map([
  [1, 2],
  [3, 4],
]);
console.log(a, b); // [1, 2] [3, 4]
```

Non-iterables cannot be destructured as arrays.

```js
const obj = { 0: "a", 1: "b", length: 2 };
const [a, b] = obj;
// TypeError: obj is not iterable
```

Iterables are only iterated until all bindings are assigned.

```js
const obj = {
  *[Symbol.iterator]() {
    for (const v of [0, 1, 2, 3]) {
      console.log(v);
      yield v;
    }
  },
};
const [a, b] = obj; // Only logs 0 and 1
```

The rest binding is eagerly evaluated and creates a new array, instead of using the old iterable.

```js
const obj = {
  *[Symbol.iterator]() {
    for (const v of [0, 1, 2, 3]) {
      console.log(v);
      yield v;
    }
  },
};
const [a, b, ...rest] = obj; // Logs 0 1 2 3
console.log(rest); // [2, 3] (an array)
```

#### Object destructuring

##### Basic assignment

```js
const user = {
  id: 42,
  isVerified: true,
};

const { id, isVerified } = user;

console.log(id); // 42
console.log(isVerified); // true
```

##### Assigning to new variable names

A property can be unpacked from an object and assigned to a variable with a different name than the object property.

```js
const o = { p: 42, q: true };
const { p: foo, q: bar } = o;

console.log(foo); // 42
console.log(bar); // true
```

Here, for example, `const { p: foo } = o` takes from the object `o` the property named `p` and assigns it to a local variable named `foo`.

##### Assigning to new variable names and providing default values

A property can be both

- Unpacked from an object and assigned to a variable with a different name.
- Assigned a default value in case the unpacked value is `undefined`.

```js
const { a: aa = 10, b: bb = 5 } = { a: 3 };

console.log(aa); // 3
console.log(bb); // 5
```

##### Unpacking properties from objects passed as a function parameter

Objects passed into function parameters can also be unpacked into variables, which may then be accessed within the function body.
As for object assignment, the destructuring syntax allows for the new variable to have the same name or a different name than the original property, and to assign default values for the case when the original object does not define the property.

Consider this object, which contains information about a user.

```js
const user = {
  id: 42,
  displayName: "jdoe",
  fullName: {
    firstName: "Jane",
    lastName: "Doe",
  },
};
```

Here we show how to unpack a property of the passed object into a variable with the same name.
The parameter value `{ id }` indicates that the `id` property of the object passed to the function should be unpacked into a variable with the same name, which can then be used within the function.

```js
function userId({ id }) {
  return id;
}

console.log(userId(user)); // 42
```

You can define the name of the unpacked variable.
Here we unpack the property named `displayName`, and rename it to `dname` for use within the function body.

```js
function userDisplayName({ displayName: dname }) {
  return dname;
}

console.log(userDisplayName(user)); // "jdoe"
```

Nested objects can also be unpacked.
The example below shows the property `fullname.firstName` being unpacked into a variable called `name`.

```js
function whois({ displayName, fullName: { firstName: name } }) {
  return `${displayName} is ${name}`;
}

console.log(whois(user)); // "jdoe is Jane"
```

##### Setting a function parameter's default value

Default values can be specified using `=`, and will be used as variable values if a specified property does not exist in the passed object.

Below we show a function where the default size is `'big'`, default co-ordinates are `x: 0, y: 0` and default radius is 25.

```js
function drawChart({
  size = "big",
  coords = { x: 0, y: 0 },
  radius = 25,
} = {}) {
  console.log(size, coords, radius);
  // do some chart drawing
}

drawChart({
  coords: { x: 18, y: 30 },
  radius: 30,
});
```

In the function signature for `drawChart` above, the destructured left-hand side has a default value of an empty object `= {}`.

You could have also written the function without that default. However, if you leave out that default value, the function will look for at least one argument to be supplied when invoked, whereas in its current form, you can call `drawChart()` without supplying any parameters. Otherwise, you need to at least supply an empty object literal.

For more information, see [Default parameters > Destructured parameter with default value assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters#destructured_parameter_with_default_value_assignment).

##### Nested object and array destructuring

```js
const metadata = {
  title: "Scratchpad",
  translations: [
    {
      locale: "de",
      localizationTags: [],
      lastEdit: "2014-04-14T08:43:37",
      url: "/de/docs/Tools/Scratchpad",
      title: "JavaScript-Umgebung",
    },
  ],
  url: "/en-US/docs/Tools/Scratchpad",
};

const {
  title: englishTitle, // rename
  translations: [
    {
      title: localeTitle, // rename
    },
  ],
} = metadata;

console.log(englishTitle); // "Scratchpad"
console.log(localeTitle); // "JavaScript-Umgebung"
```

##### For of iteration and destructuring

```js
const people = [
  {
    name: "Mike Smith",
    family: {
      mother: "Jane Smith",
      father: "Harry Smith",
      sister: "Samantha Smith",
    },
    age: 35,
  },
  {
    name: "Tom Jones",
    family: {
      mother: "Norah Jones",
      father: "Richard Jones",
      brother: "Howard Jones",
    },
    age: 25,
  },
];

for (const {
  name: n,
  family: { father: f },
} of people) {
  console.log(`Name: ${n}, Father: ${f}`);
}

// "Name: Mike Smith, Father: Harry Smith"
// "Name: Tom Jones, Father: Richard Jones"
```

##### Computed object property names and destructuring

Computed property names, like on [object literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#computed_property_names), can be used with destructuring.

```js
const key = "z";
const { [key]: foo } = { z: "bar" };

console.log(foo); // "bar"
```

##### Invalid JavaScript identifier as a property name

Destructuring can be used with property names that are not valid JavaScript identifiers by providing an alternative identifier that is valid.

```js
const foo = { "fizz-buzz": true };
const { "fizz-buzz": fizzBuzz } = foo;

console.log(fizzBuzz); // true
```

#### Destructuring primitive values

Object destructuring is almost equivalent to [property accessing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors). This means if you try to destruct a primitive value, the value will get wrapped into the corresponding wrapper object and the property is accessed on the wrapper object.

```js
const { a, toFixed } = 1;
console.log(a, toFixed); // undefined ƒ toFixed() { [native code] }
```

Same as accessing properties, destructuring `null` or `undefined` throws a `TypeError`.

```js
const { a } = undefined; // TypeError: Cannot destructure property 'a' of 'undefined' as it is undefined.
const { b } = null; // TypeError: Cannot destructure property 'b' of 'null' as it is null.
```

This happens even when the pattern is empty.

```js
const {} = null; // TypeError: Cannot destructure 'null' as it is null.
```

##### Combined array and object destructuring

Array and object destructuring can be combined. Say you want the third element in the array `props` below, and then you want the `name` property in the object, you can do the following:

```js
const props = [
  { id: 1, name: "Fizz" },
  { id: 2, name: "Buzz" },
  { id: 3, name: "FizzBuzz" },
];

const [, , { name }] = props;

console.log(name); // "FizzBuzz"
```

##### The prototype chain is looked up when the object is deconstructed

When deconstructing an object, if a property is not accessed in itself, it will continue to look up along the prototype chain.

```js
const obj = {
  self: "123",
  __proto__: {
    prot: "456",
  },
};
const { self, prot } = obj;

console.log(self); // "123"
console.log(prot); // "456"
```

## Rest and Spread Operators

> **Source:** [Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters), [Spread syntax (...)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/rest-parameters-spread)

### Rest parameters

The **rest parameter** syntax allows a function to accept an indefinite number of arguments as an array, providing a way to represent [variadic functions](https://en.wikipedia.org/wiki/Variadic_function) in JavaScript.

```js
function sum(...theArgs) {
  let total = 0;
  for (const arg of theArgs) {
    total += arg;
  }
  return total;
}

console.log(sum(1, 2, 3));
// Expected output: 6

console.log(sum(1, 2, 3, 4));
// Expected output: 10
```

#### Syntax

```js
function f(a, b, ...theArgs) {
  // …
}
```

There are some additional syntax restrictions:

- A function definition can only have one rest parameter.
- The rest parameter must be the last parameter in the function definition.
- [Trailing commas](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Trailing_commas) are not allowed after the rest parameter.
- The rest parameter cannot have a [default value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters).

#### Description

A function definition's last parameter can be prefixed with `...` (three U+002E FULL STOP characters), which will cause all remaining (user supplied) parameters to be placed within an [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) object.

```js
function myFun(a, b, ...manyMoreArgs) {
  console.log("a", a);
  console.log("b", b);
  console.log("manyMoreArgs", manyMoreArgs);
}

myFun("one", "two", "three", "four", "five", "six");

// Console Output:
// a, one
// b, two
// manyMoreArgs, ["three", "four", "five", "six"]
```

The rest parameter may be [destructured](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring), which allows you to ignore certain parameter positions.

```js
function ignoreFirst(...[, b, c]) {
  return b + c;
}
```

However, the following are all syntax errors:

```js example-bad
function wrong1(...one, ...wrong) {}
function wrong2(...wrong, arg2, arg3) {}
function wrong3(...wrong,) {}
function wrong4(...wrong = []) {}
```

The rest parameter is not counted towards the function's [`length`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length) property.

##### The difference between rest parameters and the arguments object

There are four main differences between rest parameters and the `arguments` object:

- The `arguments` object is **not a real array**, while rest parameters are `Array` instances, meaning methods like `sort()`, `map()`, `forEach()` or `pop()` can be applied on it directly.
- The `arguments` object has the additional (deprecated) [`callee`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments/callee) property.
- In a non-strict function with simple parameters, the `arguments` object [syncs its indices with the values of parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#assigning_to_indices). The rest parameter array never updates its value when the named parameters are re-assigned.
- The rest parameter bundles all the _extra_ parameters into a single array, but does not contain any named argument defined _before_ the `...restParam`. The `arguments` object contains all of the parameters — including the parameters in the `...restParam` array — bundled into one array-like object.

#### Examples

##### Using rest parameters

In this example, the first argument is mapped to `a` and the second to `b`, so these named arguments are used as normal.

However, the third argument, `manyMoreArgs`, will be an array that contains the third, fourth, fifth, sixth, …, nth — as many arguments as the user specifies.

```js
function myFun(a, b, ...manyMoreArgs) {
  console.log("a", a);
  console.log("b", b);
  console.log("manyMoreArgs", manyMoreArgs);
}

myFun("one", "two", "three", "four", "five", "six");

// a, "one"
// b, "two"
// manyMoreArgs, ["three", "four", "five", "six"] <-- an array
```

Below, even though there is just one value, the last argument still gets put into an array.

```js
// Using the same function definition from example above

myFun("one", "two", "three");

// a, "one"
// b, "two"
// manyMoreArgs, ["three"] <-- an array with just one value
```

Below, the third argument isn't provided, but `manyMoreArgs` is still an array (albeit an empty one).

```js
// Using the same function definition from example above

myFun("one", "two");

// a, "one"
// b, "two"
// manyMoreArgs, [] <-- still an array
```

Below, only one argument is provided, so `b` gets the default value `undefined`, but `manyMoreArgs` is still an empty array.

```js
// Using the same function definition from example above

myFun("one");

// a, "one"
// b, undefined
// manyMoreArgs, [] <-- still an array
```

##### Argument length

Since `theArgs` is an array, a count of its elements is given by the `length` property. If the function's only parameter is a rest parameter, `restParams.length` will be equal to [`arguments.length`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments/length).

```js
function fun1(...theArgs) {
  console.log(theArgs.length);
}

fun1(); // 0
fun1(5); // 1
fun1(5, 6, 7); // 3
```

##### Using rest parameters in combination with ordinary parameters

In the next example, a rest parameter is used to collect all parameters after the first parameter into an array. Each one of the parameter values collected into the array is then multiplied by the first parameter, and the array is returned:

```js
function multiply(multiplier, ...theArgs) {
  return theArgs.map((element) => multiplier * element);
}

const arr = multiply(2, 15, 25, 42);
console.log(arr); // [30, 50, 84]
```

##### From arguments to an array

`Array` methods can be used on rest parameters, but not on the `arguments` object:

```js
function sortRestArgs(...theArgs) {
  const sortedArgs = theArgs.sort();
  return sortedArgs;
}

console.log(sortRestArgs(5, 3, 7, 1)); // 1, 3, 5, 7

function sortArguments() {
  const sortedArgs = arguments.sort();
  return sortedArgs; // this will never happen
}

console.log(sortArguments(5, 3, 7, 1));
// throws a TypeError (arguments.sort is not a function)
```

Rest parameters were introduced to reduce the boilerplate code that was commonly used for converting a set of arguments to an array.

Before rest parameters, `arguments` need to be converted to a normal array before calling array methods on them:

```js
function fn(a, b) {
  const normalArray = Array.prototype.slice.call(arguments);
  // — or —
  const normalArray2 = [].slice.call(arguments);
  // — or —
  const normalArrayFrom = Array.from(arguments);

  const first = normalArray.shift(); // OK, gives the first argument
  const firstBad = arguments.shift(); // ERROR (arguments is not a normal array)
}
```

Now, you can easily gain access to a normal array using a rest parameter:

```js
function fn(...args) {
  const normalArray = args;
  const first = normalArray.shift(); // OK, gives the first argument
}
```

### Spread syntax (...)

The **spread (`...`)** syntax allows an iterable, such as an array or string, to be expanded in places where zero or more arguments (for function calls) or elements (for array literals) are expected. In an object literal, the spread syntax enumerates the properties of an object and adds the key-value pairs to the object being created.

Spread syntax looks exactly like rest syntax. In a way, spread syntax is the opposite of rest syntax. Spread syntax "expands" an array into its elements, while rest syntax collects multiple elements and "condenses" them into a single element. See [rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) and [rest property](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring#rest_properties_and_rest_elements).

```js
function sum(x, y, z) {
  return x + y + z;
}

const numbers = [1, 2, 3];

console.log(sum(...numbers));
// Expected output: 6

console.log(sum.apply(null, numbers));
// Expected output: 6
```

#### Syntax

```js
myFunction(a, ...iterableObj, b)
[1, ...iterableObj, '4', 'five', 6]
{ ...obj, key: 'value' }
```

#### Description

Spread syntax can be used when all elements from an object or array need to be included in a new array or object, or should be applied one-by-one in a function call's arguments list. There are three distinct places that accept the spread syntax:

- [Function arguments](#spread_in_function_calls) list (`myFunction(a, ...iterableObj, b)`)
- [Array literals](#spread_in_array_literals) (`[1, ...iterableObj, '4', 'five', 6]`)
- [Object literals](#spread_in_object_literals) (`{ ...obj, key: 'value' }`)

Although the syntax looks the same, they come with slightly different semantics.

Only [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) values, like `Array` and `String`, can be spread in [array literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#array_literals) and argument lists. Many objects are not iterable, including all [plain objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) that lack a [`Symbol.iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator) method:

```js
const obj = { key1: "value1" };
const array = [...obj]; // TypeError: obj is not iterable
```

On the other hand, spreading in [object literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer) [enumerates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties#traversing_object_properties) the own properties of the value. For typical arrays, all indices are enumerable own properties, so arrays can be spread into objects.

```js
const array = [1, 2, 3];
const obj = { ...array }; // { 0: 1, 1: 2, 2: 3 }
```

All [primitives](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#primitive_values) can be spread in objects. Only strings have enumerable own properties, and spreading anything else doesn't create properties on the new object.

```js
const obj = { ...true, ..."test", ...10 };
// { '0': 't', '1': 'e', '2': 's', '3': 't' }
```

When using spread syntax for function calls, be aware of the possibility of exceeding the JavaScript engine's argument length limit. See `Function.prototype.apply()` for more details.

#### Examples

##### Spread in function calls

###### Replace apply()

It is common to use `Function.prototype.apply()` in cases where you want to
use the elements of an array as arguments to a function.

```js
function myFunction(x, y, z) {}
const args = [0, 1, 2];
myFunction.apply(null, args);
```

With spread syntax the above can be written as:

```js
function myFunction(x, y, z) {}
const args = [0, 1, 2];
myFunction(...args);
```

Any argument in the argument list can use spread syntax, and the spread syntax can be
used multiple times.

```js
function myFunction(v, w, x, y, z) {}
const args = [0, 1];
myFunction(-1, ...args, 2, ...[3]);
```

###### Apply for new operator

When calling a constructor with `new`, it's not possible to **directly** use an array and `apply()`, because `apply()` _calls_ the target function instead of _constructing_ it, which means, among other things, that [`new.target`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target) will be `undefined`. However, an array can be easily used with `new` thanks to spread syntax:

```js
const dateFields = [1970, 0, 1]; // 1 Jan 1970
const d = new Date(...dateFields);
```

##### Spread in array literals

###### A more powerful array literal

Without spread syntax, the array literal syntax is no longer sufficient to create a new array using an existing array as one part of it. Instead, imperative code must be used using a combination of methods, including `push()`, `splice()`, `concat()`, etc. With spread syntax, this becomes much more succinct:

```js
const parts = ["shoulders", "knees"];
const lyrics = ["head", ...parts, "and", "toes"];
//  ["head", "shoulders", "knees", "and", "toes"]
```

Just like spread for argument lists, `...` can be used anywhere in the array literal, and may be used more than once.

###### Copying an array

You can use spread syntax to make a shallow copy of an array. Each array element retains its identity without getting copied.

```js
const arr = [1, 2, 3];
const arr2 = [...arr]; // like arr.slice()

arr2.push(4);
// arr2 becomes [1, 2, 3, 4]
// arr remains unaffected
```

Spread syntax effectively goes one level deep while copying an array. Therefore, it may be unsuitable for copying multidimensional arrays. The same is true with `Object.assign()` — no native operation in JavaScript does a deep clone. The web API method `structuredClone()` allows deep copying values of certain [supported types](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types). See [shallow copy](https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy) for more details.

```js
const a = [[1], [2], [3]];
const b = [...a];

b.shift().shift();
// 1

// Oh no! Now array 'a' is affected as well:
console.log(a);
// [[], [2], [3]]
```

###### A better way to concatenate arrays

`Array.prototype.concat()` is often used to concatenate an array to the end of an existing array. Without spread syntax, this is done as:

```js
let arr1 = [0, 1, 2];
const arr2 = [3, 4, 5];

// Append all items from arr2 onto arr1
arr1 = arr1.concat(arr2);
```

With spread syntax this becomes:

```js
let arr1 = [0, 1, 2];
const arr2 = [3, 4, 5];

arr1 = [...arr1, ...arr2];
// arr1 is now [0, 1, 2, 3, 4, 5]
```

`Array.prototype.unshift()` is often used to insert an array of values at the start of an existing array. Without spread syntax, this is done as:

```js
const arr1 = [0, 1, 2];
const arr2 = [3, 4, 5];

//  Prepend all items from arr2 onto arr1
Array.prototype.unshift.apply(arr1, arr2);
console.log(arr1); // [3, 4, 5, 0, 1, 2]
```

With spread syntax, this becomes:

```js
let arr1 = [0, 1, 2];
const arr2 = [3, 4, 5];

arr1 = [...arr2, ...arr1];
console.log(arr1); // [3, 4, 5, 0, 1, 2]
```

> **Note:**
> Unlike `unshift()`, this creates a new `arr1`, instead of modifying the original `arr1` array in-place.

###### Conditionally adding values to an array

You can make an element present or absent in an array literal, depending on a condition, using a [conditional operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator).

```js
const isSummer = false;
const fruits = ["apple", "banana", ...(isSummer ? ["watermelon"] : [])];
// ['apple', 'banana']
```

When the condition is `false`, we spread an empty array, so that nothing gets added to the final array. Note that this is different from the following:

```js
const fruits = ["apple", "banana", isSummer ? "watermelon" : undefined];
// ['apple', 'banana', undefined]
```

In this case, an extra `undefined` element is added when `isSummer` is `false`, and this element will be visited by methods such as `Array.prototype.map()`.

##### Spread in object literals

###### Copying and merging objects

You can use spread syntax to merge multiple objects into one new object.

```js
const obj1 = { foo: "bar", x: 42 };
const obj2 = { bar: "baz", y: 13 };

const mergedObj = { ...obj1, ...obj2 };
// { foo: "bar", x: 42, bar: "baz", y: 13 }
```

A single spread creates a shallow copy of the original object (but without non-enumerable properties and without copying the prototype), similar to [copying an array](#copying_an_array).

```js
const clonedObj = { ...obj1 };
// { foo: "bar", x: 42 }
```

###### Overriding properties

When one object is spread into another object, or when multiple objects are spread into one object, and properties with identical names are encountered, the property takes the last value assigned while remaining in the position it was originally set.

```js
const obj1 = { foo: "bar", x: 42 };
const obj2 = { foo: "baz", y: 13 };

const mergedObj = { x: 41, ...obj1, ...obj2, y: 9 }; // { x: 42, foo: "baz", y: 9 }
```

###### Conditionally adding properties to an object

You can make an element present or absent in an object literal, depending on a condition, using a [conditional operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator).

```js
const isSummer = false;
const fruits = {
  apple: 10,
  banana: 5,
  ...(isSummer ? { watermelon: 30 } : {}),
};
// { apple: 10, banana: 5 }
```

The case where the condition is `false` is an empty object, so that nothing gets spread into the final object. Note that this is different from the following:

```js
const fruits = {
  apple: 10,
  banana: 5,
  watermelon: isSummer ? 30 : undefined,
};
// { apple: 10, banana: 5, watermelon: undefined }
```

In this case, the `watermelon` property is always present and will be visited by methods such as `Object.keys()`.

Because primitives can be spread into objects as well, and from the observation that all falsy values do not have enumerable properties, you can simply use a [logical AND](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND) operator:

```js
const isSummer = false;
const fruits = {
  apple: 10,
  banana: 5,
  ...(isSummer && { watermelon: 30 }),
};
```

In this case, if `isSummer` is any falsy value, no property will be created on the `fruits` object.

###### Comparing with Object.assign()

Note that `Object.assign()` can be used to mutate an object, whereas spread syntax can't.

```js
const obj1 = { foo: "bar", x: 42 };
Object.assign(obj1, { x: 1337 });
console.log(obj1); // { foo: "bar", x: 1337 }
```

In addition, `Object.assign()` triggers setters on the target object, whereas spread syntax does not.

```js
const objectAssign = Object.assign(
  {
    set foo(val) {
      console.log(val);
    },
  },
  { foo: 1 },
);
// Logs "1"; objectAssign.foo is still the original setter

const spread = {
  set foo(val) {
    console.log(val);
  },
  ...{ foo: 1 },
};
// Nothing is logged; spread.foo is 1
```

You cannot naively re-implement the `Object.assign()` function through a single spreading:

```js
const obj1 = { foo: "bar", x: 42 };
const obj2 = { foo: "baz", y: 13 };
const merge = (...objects) => ({ ...objects });

const mergedObj1 = merge(obj1, obj2);
// { 0: { foo: 'bar', x: 42 }, 1: { foo: 'baz', y: 13 } }

const mergedObj2 = merge({}, obj1, obj2);
// { 0: {}, 1: { foo: 'bar', x: 42 }, 2: { foo: 'baz', y: 13 } }
```

In the above example, the spread syntax does not work as one might expect: it spreads an _array_ of arguments into the object literal, due to the rest parameter. Here is an implementation of `merge` using the spread syntax, whose behavior is similar to `Object.assign()`, except that it doesn't trigger setters, nor mutates any object:

```js
const obj1 = { foo: "bar", x: 42 };
const obj2 = { foo: "baz", y: 13 };
const merge = (...objects) =>
  objects.reduce((acc, cur) => ({ ...acc, ...cur }));

const mergedObj = merge(obj1, obj2);
// { foo: 'baz', x: 42, y: 13 }
```

## Template Literals

> **Source:** [Template literals (Template strings)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/string)

**Template literals** are literals delimited with backtick (`` ` ``) characters, allowing for [multi-line strings](#multi-line_strings), [string interpolation](#string_interpolation) with embedded expressions, and special constructs called [tagged templates](#tagged_templates).

Template literals are sometimes informally called _template strings_, because they are used most commonly for [string interpolation](#string_interpolation) (to create strings by doing substitution of placeholders). However, a tagged template literal may not result in a string; it can be used with a custom [tag function](#tagged_templates) to perform whatever operations you want on the different parts of the template literal.

### Syntax

```js
`string text`

`string text line 1
 string text line 2`

`string text ${expression} string text`

tagFunction`string text ${expression} string text`
```

#### Parameters

- `string text`
  - : The string text that will become part of the template literal. Almost all characters are allowed literally, including [line breaks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#line_terminators) and other [whitespace characters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#white_space). However, invalid escape sequences will cause a syntax error, unless a [tag function](#tagged_templates_and_escape_sequences) is used.
- `expression`
  - : An expression to be inserted in the current position, whose value is converted to a string or passed to `tagFunction`.
- `tagFunction`
  - : If specified, it will be called with the template strings array and substitution expressions, and the return value becomes the value of the template literal. See [tagged templates](#tagged_templates).

### Description

Template literals are enclosed by backtick (`` ` ``) characters instead of double or single quotes.

Along with having normal strings, template literals can also contain other parts called _placeholders_, which are embedded expressions delimited by a dollar sign and curly braces: `${expression}`. The strings and placeholders get passed to a function — either a default function, or a function you supply. The default function (when you don't supply your own) just performs [string interpolation](#string_interpolation) to do substitution of the placeholders and then concatenate the parts into a single string.

To supply a function of your own, precede the template literal with a function name; the result is called a [**tagged template**](#tagged_templates). In that case, the template literal is passed to your tag function, where you can then perform whatever operations you want on the different parts of the template literal.

To escape a backtick in a template literal, put a backslash (`\`) before the backtick.

```js
`\`` === "`"; // true
```

Dollar signs can be escaped as well to prevent interpolation.

```js
`\${1}` === "${1}"; // true
```

#### Multi-line strings

Any newline characters inserted in the source are part of the template literal.

Using normal strings, you would have to use the following syntax in order to get multi-line strings:

```js
console.log("string text line 1\nstring text line 2");
// "string text line 1
// string text line 2"
```

Using template literals, you can do the same with this:

```js
console.log(`string text line 1
string text line 2`);
// "string text line 1
// string text line 2"
```

Like [normal string literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#escape_sequences), you can write a single-line string across multiple lines for source code readability, by escaping the newline with a backslash (`\`):

```js
console.log(`string text line 1 \
string text line 2`);
// "string text line 1 string text line 2"
```

#### String interpolation

Without template literals, when you want to combine output from expressions with strings, you'd [concatenate them](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Strings#concatenation_using) using the [addition operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Addition) `+`:

```js
const a = 5;
const b = 10;
console.log("Fifteen is " + (a + b) + " and\nnot " + (2 * a + b) + ".");
// "Fifteen is 15 and
// not 20."
```

That can be hard to read – especially when you have multiple expressions.

With template literals, you can avoid the concatenation operator — and improve the readability of your code — by using placeholders of the form `${expression}` to perform substitutions for embedded expressions:

```js
const a = 5;
const b = 10;
console.log(`Fifteen is ${a + b} and
not ${2 * a + b}.`);
// "Fifteen is 15 and
// not 20."
```

Note that there's a mild difference between the two syntaxes. Template literals [coerce their expressions directly to strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_coercion), while addition coerces its operands to primitives first. For more information, see the reference page for the [`+` operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Addition).

#### Nesting templates

In certain cases, nesting a template is the easiest (and perhaps more readable) way to have configurable strings. Within a backtick-delimited template, it is simple to allow inner backticks by using them inside an `${expression}` placeholder within the template.

For example, without template literals, if you wanted to return a certain value based on a particular condition, you could do something like the following:

```js
let classes = "header";
classes += isLargeScreen()
  ? ""
  : item.isCollapsed
    ? " icon-expander"
    : " icon-collapser";
```

With a template literal but without nesting, you could do this:

```js
const classes = `header ${
  isLargeScreen() ? "" : item.isCollapsed ? "icon-expander" : "icon-collapser"
}`;
```

With nesting of template literals, you can do this:

```js
const classes = `header ${
  isLargeScreen() ? "" : `icon-${item.isCollapsed ? "expander" : "collapser"}`
}`;
```

#### Tagged templates

A more advanced form of template literals are _tagged_ templates.

Tags allow you to parse template literals with a function. The first argument of a tag function contains an array of string values. The remaining arguments are related to the expressions.

The tag function can then perform whatever operations on these arguments you wish, and return the manipulated string. (Alternatively, it can return something completely different, as described in one of the following examples.)

The name of the function used for the tag can be whatever you want.

```js
const person = "Mike";
const age = 28;

function myTag(strings, personExp, ageExp) {
  const str0 = strings[0]; // "That "
  const str1 = strings[1]; // " is a "
  const str2 = strings[2]; // "."

  const ageStr = ageExp < 100 ? "youngster" : "centenarian";

  // We can even return a string built using a template literal
  return `${str0}${personExp}${str1}${ageStr}${str2}`;
}

const output = myTag`That ${person} is a ${age}.`;

console.log(output);
// That Mike is a youngster.
```

The tag does not have to be a plain identifier. You can use any expression with [precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence#table) greater than 16, which includes [property access](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors), function call, [new expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new), or even another tagged template literal.

```js
console.log`Hello`; // [ 'Hello' ]
console.log.bind(1, 2)`Hello`; // 2 [ 'Hello' ]
new Function("console.log(arguments)")`Hello`; // [Arguments] { '0': [ 'Hello' ] }

function recursive(strings, ...values) {
  console.log(strings, values);
  return recursive;
}
recursive`Hello``World`;
// [ 'Hello' ] []
// [ 'World' ] []
```

While technically permitted by the syntax, _untagged_ template literals are strings and will throw a `TypeError` when chained.

```js
console.log(`Hello``World`); // TypeError: "Hello" is not a function
```

The only exception is optional chaining, which will throw a syntax error.

```js example-bad
console.log?.`Hello`; // SyntaxError: Invalid tagged template on optional chain
console?.log`Hello`; // SyntaxError: Invalid tagged template on optional chain
```

Note that these two expressions are still parsable. This means they would not be subject to [automatic semicolon insertion](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#automatic_semicolon_insertion), which will only insert semicolons to fix code that's otherwise unparsable.

```js example-bad
// Still a syntax error
const a = console?.log
`Hello`
```

Tag functions don't even need to return a string!

```js
function template(strings, ...keys) {
  return (...values) => {
    const dict = values[values.length - 1] || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join("");
  };
}

const t1Closure = template`${0}${1}${0}!`;
// const t1Closure = template(["","","","!"],0,1,0);
t1Closure("Y", "A"); // "YAY!"

const t2Closure = template`${0} ${"foo"}!`;
// const t2Closure = template([""," ","!"],0,"foo");
t2Closure("Hello", { foo: "World" }); // "Hello World!"

const t3Closure = template`I'm ${"name"}. I'm almost ${"age"} years old.`;
// const t3Closure = template(["I'm ", ". I'm almost ", " years old."], "name", "age");
t3Closure("foo", { name: "MDN", age: 30 }); // "I'm MDN. I'm almost 30 years old."
t3Closure({ name: "MDN", age: 30 }); // "I'm MDN. I'm almost 30 years old."
```

The first argument received by the tag function is an array of strings. For any template literal, its length is equal to the number of substitutions (occurrences of `${…}`) plus one, and is therefore always non-empty.

For any particular tagged template literal expression, the tag function will always be called with the exact same literal array, no matter how many times the literal is evaluated.

```js
const callHistory = [];

function tag(strings, ...values) {
  callHistory.push(strings);
  // Return a freshly made object
  return {};
}

function evaluateLiteral() {
  return tag`Hello, ${"world"}!`;
}

console.log(evaluateLiteral() === evaluateLiteral()); // false; each time `tag` is called, it returns a new object
console.log(callHistory[0] === callHistory[1]); // true; all evaluations of the same tagged literal would pass in the same strings array
```

This allows the tag to cache the result based on the identity of its first argument. To further ensure the array value's stability, the first argument and its [`raw` property](#raw_strings) are both [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isFrozen), so you can't mutate them in any way.

#### Raw strings

The special `raw` property, available on the first argument to the tag function, allows you to access the raw strings as they were entered, without processing [escape sequences](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#using_special_characters_in_strings).

```js
function tag(strings) {
  console.log(strings.raw[0]);
}

tag`string text line 1 \n string text line 2`;
// Logs "string text line 1 \n string text line 2",
// including the two characters '\' and 'n'
```

> **Note:**
> The template literal syntax is still processed in the same way, which means unescaped backticks and `${` have special syntactic meaning, but escaping these characters create extra backslashes in the raw string. See [raw strings containing template literal syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw#raw_strings_containing_template_literal_syntax) for more information.

In addition, the `String.raw()` method exists to create raw strings just like the default template function and string concatenation would create.

```js
const str = String.raw`Hi\n${2 + 3}!`;
// "Hi\\n5!"

str.length;
// 6

Array.from(str).join(",");
// "H,i,\\,n,5,!"
```

`String.raw` functions like an "identity" tag if the literal doesn't contain any escape sequences. In case you want an actual identity tag that always works as if the literal is untagged, you can make a custom function that passes the "cooked" (i.e., escape sequences are processed) literal array to `String.raw`, pretending they are raw strings.

```js
const identity = (strings, ...values) =>
  String.raw({ raw: strings }, ...values);
console.log(identity`Hi\n${2 + 3}!`);
// Hi
// 5!
```

This is useful for many tools which give special treatment to literals tagged by a particular name.

```js
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);
// Some formatters will format this literal's content as HTML
const doc = html`<!doctype html>
  <html lang="en-US">
    <head>
      <title>Hello</title>
    </head>
    <body>
      <h1>Hello world!</h1>
    </body>
  </html>`;
```

#### Tagged templates and escape sequences

In normal template literals, [the escape sequences in string literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#escape_sequences) are all allowed. Any other non-well-formed escape sequence is a syntax error. This includes:

- `\` followed by any decimal digit other than `0`, or `\0` followed by a decimal digit; for example `\9` and `\07` (which is a [deprecated syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Deprecated_and_obsolete_features#escape_sequences))
- `\x` followed by fewer than two hex digits (including none); for example `\xz`
- `\u` not followed by `{` and followed by fewer than four hex digits (including none); for example `\uz`
- `\u{}` enclosing an invalid Unicode code point — it contains a non-hex digit, or its value is greater than `10FFFF`; for example `\u{110000}` and `\u{z}`

> **Note:**
> `\` followed by other characters, while they may be useless since nothing is escaped, are not syntax errors.

However, this is problematic for tagged templates, which, in addition to the "cooked" literal, also have access to the raw literals (escape sequences are preserved as-is).

Tagged templates enable the embedding of arbitrary string content, where escape sequences may follow a different syntax. Consider for an example where we embed [LaTeX](https://en.wikipedia.org/wiki/LaTeX) source text in JavaScript via `String.raw`. We want to still be able to use LaTeX macros that start with `u` or `x` without following JavaScript syntax restrictions. Therefore, the syntax restriction of well-formed escape sequences is removed from tagged templates. The example below uses [MathJax](https://www.mathjax.org/) to render LaTeX in one element:

```js
const node = document.getElementById("formula");
MathJax.typesetClear([node]);
// Throws in older ECMAScript versions (ES2016 and earlier)
// SyntaxError: malformed Unicode character escape sequence
node.textContent = String.raw`$\underline{u}$`;
MathJax.typesetPromise([node]);
```

However, illegal escape sequences must still be represented in the "cooked" representation. They will show up as `undefined` element in the "cooked" array:

```js
function log(str) {
  console.log("Cooked:", str[0]);
  console.log("Raw:", str.raw[0]);
}

log`\unicode`;
// Cooked: undefined
// Raw: \unicode
```

Note that the escape-sequence restriction is only dropped from _tagged_ templates, but not from _untagged_ template literals:

```js example-bad
const bad = `bad escape sequence: \unicode`;
```

## Ternaries Instead of if...else

> **Source:** [Conditional (ternary) operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/ifelse)

The **conditional (ternary) operator** is the only JavaScript operator that takes three operands:
a condition followed by a question mark (`?`), then an expression to execute if the condition is truthy followed by a colon (`:`), and finally the expression to execute if the condition is falsy.
This operator is frequently used as an alternative to an [`if...else`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else) statement.

```js
function getFee(isMember) {
  return isMember ? "$2.00" : "$10.00";
}

console.log(getFee(true));
// Expected output: "$2.00"

console.log(getFee(false));
// Expected output: "$10.00"

console.log(getFee(null));
// Expected output: "$10.00"
```

### Syntax

```js
condition ? exprIfTrue : exprIfFalse
```

#### Parameters

- `condition`
  - : An expression whose value is used as a condition.
- `exprIfTrue`
  - : An expression which is executed if the `condition` evaluates to a truthy value (one which equals or can be converted to `true`).
- `exprIfFalse`
  - : An expression which is executed if the `condition` is falsy (that is, has a value which can be converted to `false`).

### Description

Besides `false`, possible falsy expressions are: `null`, `NaN`, `0`, the empty string (`""`), and `undefined`.
If `condition` is any of these, the result of the conditional expression will be the result of executing the expression `exprIfFalse`.

### Examples

#### A basic example

```js
const age = 26;
const beverage = age >= 21 ? "Beer" : "Juice";
console.log(beverage); // "Beer"
```

#### Handling null values

One common usage is to handle a value that may be `null`:

```js
const greeting = (person) => {
  const name = person ? person.name : "stranger";
  return `Howdy, ${name}`;
};

console.log(greeting({ name: "Alice" })); // "Howdy, Alice"
console.log(greeting(null)); // "Howdy, stranger"
```

#### Conditional chains

The ternary operator is right-associative, which means it can be "chained" in the following way, similar to an `if … else if … else if … else` chain:

```js
function example() {
  return condition1 ? value1
    : condition2 ? value2
    : condition3 ? value3
    : value4;
}
```

This is equivalent to the following [`if...else`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else) chain.

```js
function example() {
  if (condition1) {
    return value1;
  } else if (condition2) {
    return value2;
  } else if (condition3) {
    return value3;
  } else {
    return value4;
  }
}
```

## Arrow Functions

> **Source:** [Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/arrow-functions-basics)

An **arrow function expression** is a compact alternative to a traditional [function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function), with some semantic differences and deliberate limitations in usage:

- Arrow functions don't have their own bindings to [`this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this), [`arguments`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments), or [`super`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super), and should not be used as [methods](https://developer.mozilla.org/en-US/docs/Glossary/Method).
- Arrow functions cannot be used as [constructors](https://developer.mozilla.org/en-US/docs/Glossary/Constructor). Calling them with [`new`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) throws a `TypeError`. They also don't have access to the [`new.target`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target) keyword.
- Arrow functions cannot use [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield) within their body and cannot be created as generator functions.

```js
const materials = ["Hydrogen", "Helium", "Lithium", "Beryllium"];

console.log(materials.map((material) => material.length));
// Expected output: Array [8, 6, 7, 9]
```

### Syntax

```js
() => expression

param => expression

(param) => expression

(param1, paramN) => expression

() => {
  statements
}

param => {
  statements
}

(param1, paramN) => {
  statements
}
```

[Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters), [default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters), and [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) within params are supported, and always require parentheses:

```js
(a, b, ...r) => expression
(a = 400, b = 20, c) => expression
([a, b] = [10, 20]) => expression
({ a, b } = { a: 10, b: 20 }) => expression
```

Arrow functions can be [`async`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) by prefixing the expression with the `async` keyword.

```js
async param => expression
async (param1, param2, ...paramN) => {
  statements
}
```

### Description

Let's decompose a traditional anonymous function down to the simplest arrow function step-by-step. Each step along the way is a valid arrow function.

> **Note:**
> Traditional function expressions and arrow functions have more differences than their syntax. We will introduce their behavior differences in more detail in the next few subsections.

```js
// Traditional anonymous function
(function (a) {
  return a + 100;
});

// 1. Remove the word "function" and place arrow between the argument and opening body brace
(a) => {
  return a + 100;
};

// 2. Remove the body braces and word "return" — the return is implied.
(a) => a + 100;

// 3. Remove the parameter parentheses
a => a + 100;
```

In the example above, both the parentheses around the parameter and the braces around the function body may be omitted. However, they can only be omitted in certain cases.

The parentheses can only be omitted if the function has a single simple parameter. If it has multiple parameters, no parameters, or default, destructured, or rest parameters, the parentheses around the parameter list are required.

```js
// Traditional anonymous function
(function (a, b) {
  return a + b + 100;
});

// Arrow function
(a, b) => a + b + 100;

const a = 4;
const b = 2;

// Traditional anonymous function (no parameters)
(function () {
  return a + b + 100;
});

// Arrow function (no parameters)
() => a + b + 100;
```

The braces can only be omitted if the function directly returns an expression. If the body has statements, the braces are required. In this case, return values must be explicitly specified with the `return` keyword. Arrow functions cannot guess what or when you want to return.

```js
// Traditional anonymous function
(function (a, b) {
  const chuck = 42;
  return a + b + chuck;
});

// Arrow function
(a, b) => {
  const chuck = 42;
  return a + b + chuck;
};
```

Arrow functions are not inherently associated with a name. If the arrow function needs to call itself, use a named function expression instead. You can also assign the arrow function to a variable, allowing you to refer to it through that variable.

```js
// Traditional Function
function bob(a) {
  return a + 100;
}

// Arrow Function
const bob2 = (a) => a + 100;
```

#### Function body

Arrow functions can have either an _expression body_ or the usual _block body_.

In an expression body, only a single expression is specified, which becomes the implicit return value. The block body is analogous to traditional function bodies, where return values must be explicitly specified with the `return` keyword. Arrow functions are not required to return a value. If execution of the block body reaches the end without encountering a `return` statement, the function returns `undefined` like other functions.

```js
// Expression body
const add = (a, b) => a + b; // Implicitly returns a + b

// Block body
const add2 = (a, b) => {
  console.log(a, b);
  return a + b; // Must explicitly return a value
};

// No return value
const add3 = (b) => {
  a += b;
  // No return statement, so returns undefined
};
```

Returning object literals using the expression body syntax `(params) => { object: literal }` does not work as expected.

```js example-bad
const func = () => { foo: 1 };
// Calling func() returns undefined!

const func2 = () => { foo: function () {} };
// SyntaxError: function statement requires a name

const func3 = () => { foo() {} };
// SyntaxError: Unexpected token '{'
```

This is because JavaScript only sees the arrow function as having an expression body if the token following the arrow is not a left brace, so the code inside braces ({}) is parsed as a sequence of statements, where `foo` is a [label](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label), not a key in an object literal.

To fix this, wrap the object literal in parentheses:

```js
const func = () => ({ foo: 1 });
```

#### Cannot be used as methods

Arrow function expressions should only be used for non-method functions because they do not have their own `this`. Let's see what happens when we try to use them as methods:

```js
"use strict";

const obj = {
  i: 10,
  b: () => console.log(this.i, this),
  c() {
    console.log(this.i, this);
  },
};

obj.b(); // logs undefined, Window { /* … */ } (or the global object)
obj.c(); // logs 10, Object { /* … */ }
```

Another example involving `Object.defineProperty()`:

```js
"use strict";

const obj = {
  a: 10,
};

Object.defineProperty(obj, "b", {
  get: () => {
    console.log(this.a, typeof this.a, this); // undefined 'undefined' Window { /* … */ } (or the global object)
    return this.a + 10; // represents global object 'Window', therefore 'this.a' returns 'undefined'
  },
});
```

Because a [class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)'s body has a `this` context, arrow functions as [class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields) close over the class's `this` context, and the `this` inside the arrow function's body will correctly point to the instance (or the class itself, for [static fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static)). However, because it is a [closure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures), not the function's own binding, the value of `this` will not change based on the execution context.

```js
class C {
  a = 1;
  autoBoundMethod = () => {
    console.log(this.a);
  };
}

const c = new C();
c.autoBoundMethod(); // 1
const { autoBoundMethod } = c;
autoBoundMethod(); // 1
// If it were a normal method, it should be undefined in this case
```

Arrow function properties are often said to be "auto-bound methods", because the equivalent with normal methods is:

```js
class C {
  a = 1;
  constructor() {
    this.method = this.method.bind(this);
  }
  method() {
    console.log(this.a);
  }
}
```

> **Note:**
> Class fields are defined on the _instance_, not on the _prototype_, so every instance creation would create a new function reference and allocate a new closure, potentially leading to more memory usage than a normal unbound method.

For similar reasons, the [`call()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call), [`apply()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply), and [`bind()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) methods are not useful when called on arrow functions, because arrow functions establish `this` based on the scope the arrow function is defined within, and the `this` value does not change based on how the function is invoked.

#### No binding of arguments

Arrow functions do not have their own [`arguments`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments) object. Thus, in this example, `arguments` is a reference to the arguments of the enclosing scope:

```js
function foo(n) {
  const f = () => arguments[0] + n; // foo's implicit arguments binding. arguments[0] is n
  return f();
}

foo(3); // 3 + 3 = 6
```

In most cases, using [rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
is a good alternative to using an `arguments` object.

```js
function foo(n) {
  const f = (...args) => args[0] + n;
  return f(10);
}

foo(1); // 11
```

#### Cannot be used as constructors

Arrow functions cannot be used as constructors and will throw an error when called with [`new`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new). They also do not have a [`prototype`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype) property.

```js
const Foo = () => {};
const foo = new Foo(); // TypeError: Foo is not a constructor
console.log("prototype" in Foo); // false
```

#### Cannot be used as generators

The [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield) keyword cannot be used in an arrow function's body (except when used within generator functions further nested within the arrow function). As a consequence, arrow functions cannot be used as generators.

#### Line break before arrow

An arrow function cannot contain a line break between its parameters and its arrow.

```js example-bad
const func = (a, b, c)
  => 1;
// SyntaxError: Unexpected token '=>'
```

For the purpose of formatting, you may put the line break after the arrow or use parentheses/braces around the function body, as shown below. You can also put line breaks between parameters.

```js
const func = (a, b, c) =>
  1;

const func2 = (a, b, c) => (
  1
);

const func3 = (a, b, c) => {
  return 1;
};

const func4 = (
  a,
  b,
  c,
) => 1;
```

#### Precedence of arrow

Although the arrow in an arrow function is [not an operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators#what_are_operators), arrow functions have special parsing rules that interact differently with [operator precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence) compared to regular functions.

```js example-bad
let callback;

callback = callback || () => {};
// SyntaxError: invalid arrow-function arguments
```

Because `=>` has a lower precedence than most operators, parentheses are necessary to avoid `callback || ()` being parsed as the arguments list of the arrow function.

```js
callback = callback || (() => {});
```

### Examples

#### Using arrow functions

```js
// An empty arrow function returns undefined
const empty = () => {};

(() => "foobar")();
// Returns "foobar"
// (this is an Immediately Invoked Function Expression)

const simple = (a) => (a > 15 ? 15 : a);
simple(16); // 15
simple(10); // 10

const max = (a, b) => (a > b ? a : b);

// Easy array filtering, mapping, etc.
const arr = [5, 6, 13, 0, 1, 18, 23];

const sum = arr.reduce((a, b) => a + b);
// 66

const even = arr.filter((v) => v % 2 === 0);
// [6, 0, 18]

const double = arr.map((v) => v * 2);
// [10, 12, 26, 0, 2, 36, 46]

// More concise promise chains
promise
  .then((a) => {
    // …
  })
  .then((b) => {
    // …
  });

// Arrow functions without parameters
setTimeout(() => {
  console.log("I happen sooner");
  setTimeout(() => {
    // deeper code
    console.log("I happen later");
  }, 1);
}, 1);
```

#### Using call, bind, and apply

The [`call()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call), [`apply()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply), and [`bind()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) methods work as expected with traditional functions, because we establish the scope for each of the methods:

```js
const obj = {
  num: 100,
};

// Setting "num" on globalThis to show how it is NOT used.
globalThis.num = 42;

// A traditional function to operate on "this"
function add(a, b, c) {
  return this.num + a + b + c;
}

console.log(add.call(obj, 1, 2, 3)); // 106
console.log(add.apply(obj, [1, 2, 3])); // 106
const boundAdd = add.bind(obj);
console.log(boundAdd(1, 2, 3)); // 106
```

With arrow functions, since our `add` function is essentially created on the `globalThis` (global) scope, it will assume `this` is the `globalThis`.

```js
const obj = {
  num: 100,
};

// Setting "num" on globalThis to show how it gets picked up.
globalThis.num = 42;

// Arrow function
const add = (a, b, c) => this.num + a + b + c;

console.log(add.call(obj, 1, 2, 3)); // 48
console.log(add.apply(obj, [1, 2, 3])); // 48
const boundAdd = add.bind(obj);
console.log(boundAdd(1, 2, 3)); // 48
```

Perhaps the greatest benefit of using arrow functions is with methods like `setTimeout()` and `EventTarget.prototype.addEventListener()` that usually require some kind of closure, `call()`, `apply()`, or `bind()` to ensure that the function is executed in the proper scope.

With traditional function expressions, code like this does not work as expected:

```js
const obj = {
  count: 10,
  doSomethingLater() {
    setTimeout(function () {
      // the function executes on the window scope
      this.count++;
      console.log(this.count);
    }, 300);
  },
};

obj.doSomethingLater(); // logs "NaN", because the property "count" is not in the window scope.
```

With arrow functions, the `this` scope is more easily preserved:

```js
const obj = {
  count: 10,
  doSomethingLater() {
    // The method syntax binds "this" to the "obj" context.
    setTimeout(() => {
      // Since the arrow function doesn't have its own binding and
      // setTimeout (as a function call) doesn't create a binding
      // itself, the "obj" context of the outer method is used.
      this.count++;
      console.log(this.count);
    }, 300);
  },
};

obj.doSomethingLater(); // logs 11
```

## The this Keyword

> **Source:** [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/object-methods)

The **`this`** keyword refers to the context where a piece of code, such as a function's body, is supposed to run. Most typically, it is used in object methods, where `this` refers to the object that the method is attached to, thus allowing the same method to be reused on different objects.

The value of `this` in JavaScript depends on how a function is invoked (runtime binding), not how it is defined. When a regular function is invoked as a method of an object (`obj.method()`), `this` points to that object. When invoked as a standalone function (not attached to an object: `func()`), `this` typically refers to the [global object](https://developer.mozilla.org/en-US/docs/Glossary/Global_object) (in non-strict mode) or `undefined` (in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)). The `Function.prototype.bind()` method can create a function whose `this` binding doesn't change, and methods `Function.prototype.apply()` and `Function.prototype.call()` can also set the `this` value for a particular call.

[Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) differ in their handling of `this`: they inherit `this` from the parent scope at the time they are defined. This behavior makes arrow functions particularly useful for callbacks and preserving context. However, arrow functions do not have their own `this` binding. Therefore, their `this` value cannot be set by `bind()`, `apply()` or `call()` methods, nor does it point to the current object in object methods.

```js
const test = {
  prop: 42,
  func() {
    return this.prop;
  },
};

console.log(test.func());
// Expected output: 42
```

### Syntax

```js
this
```

#### Value

In non–strict mode, `this` is always a reference to an object. In strict mode, it can be any value. For more information on how the value is determined, see the description below.

### Description

The value of `this` depends on in which context it appears: function, class, or global.

#### Function context

Inside a function, the value of `this` depends on how the function is called. Think about `this` as a hidden parameter of a function — just like the parameters declared in the function definition, `this` is a binding that the language creates for you when the function body is evaluated.

For a regular function (not an arrow function, bound function, etc.), the value of `this` is the object that the function is accessed on. In other words, if the function call is in the form `obj.f()`, then `this` refers to `obj`. For example:

```js
function getThis() {
  return this;
}

const obj1 = { name: "obj1" };
const obj2 = { name: "obj2" };

obj1.getThis = getThis;
obj2.getThis = getThis;

console.log(obj1.getThis()); // { name: 'obj1', getThis: [Function: getThis] }
console.log(obj2.getThis()); // { name: 'obj2', getThis: [Function: getThis] }
```

Note how the function is the same, but based on how it's invoked, the value of `this` is different. This is analogous to how function parameters work.

The value of `this` is not the object that has the function as an own property, but the object that is used to call the function. You can prove this by calling a method of an object up in the [prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain).

```js
const obj3 = {
  __proto__: obj1,
  name: "obj3",
};

console.log(obj3.getThis()); // { name: 'obj3' }
```

The value of `this` always changes based on how a function is called, even when the function was defined on an object at creation:

```js
const obj4 = {
  name: "obj4",
  getThis() {
    return this;
  },
};

const obj5 = { name: "obj5" };

obj5.getThis = obj4.getThis;
console.log(obj5.getThis()); // { name: 'obj5', getThis: [Function: getThis] }
```

If the value that the method is accessed on is a primitive, `this` will be a primitive value as well — but only if the function is in strict mode.

```js
function getThisStrict() {
  "use strict"; // Enter strict mode
  return this;
}

// Only for demonstration — you should not mutate built-in prototypes
Number.prototype.getThisStrict = getThisStrict;
console.log(typeof (1).getThisStrict()); // "number"
```

If the function is called without being accessed on anything, `this` will be `undefined` — but only if the function is in strict mode.

```js
console.log(typeof getThisStrict()); // "undefined"
```

In non-strict mode, a special process called [`this` substitution](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#no_this_substitution) ensures that the value of `this` is always an object. This means:

- If a function is called with `this` set to `undefined` or `null`, `this` gets substituted with `globalThis`.
- If the function is called with `this` set to a primitive value, `this` gets substituted with the primitive value's wrapper object.

```js
function getThis() {
  return this;
}

// Only for demonstration — you should not mutate built-in prototypes
Number.prototype.getThis = getThis;
console.log(typeof (1).getThis()); // "object"
console.log(getThis() === globalThis); // true
```

In typical function calls, `this` is implicitly passed like a parameter through the function's prefix (the part before the dot). You can also explicitly set the value of `this` using the `Function.prototype.call()`, `Function.prototype.apply()`, or `Reflect.apply()` methods. Using `Function.prototype.bind()`, you can create a new function with a specific value of `this` that doesn't change regardless of how the function is called. When using these methods, the `this` substitution rules above still apply if the function is non-strict.

##### Callbacks

When a function is passed as a callback, the value of `this` depends on how the callback is called, which is determined by the implementor of the API. Callbacks are _typically_ called with a `this` value of `undefined` (calling it directly without attaching it to any object), which means if the function is non–strict, the value of `this` is the global object (`globalThis`). This is the case for [iterative array methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#iterative_methods), the [`Promise()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise) constructor, etc.

```js
function logThis() {
  "use strict";
  console.log(this);
}

[1, 2, 3].forEach(logThis); // undefined, undefined, undefined
```

Some APIs allow you to set a `this` value for invocations of the callback. For example, all iterative array methods and related ones like `Set.prototype.forEach()` accept an optional `thisArg` parameter.

```js
[1, 2, 3].forEach(logThis, { name: "obj" });
// { name: 'obj' }, { name: 'obj' }, { name: 'obj' }
```

Occasionally, a callback is called with a `this` value other than `undefined`. For example, the `reviver` parameter of `JSON.parse()` and the `replacer` parameter of `JSON.stringify()` are both called with `this` set to the object that the property being parsed/serialized belongs to.

##### Arrow functions

In [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), `this` retains the value of the enclosing lexical context's `this`. In other words, when evaluating an arrow function's body, the language does not create a new `this` binding.

For example, in global code, `this` is always `globalThis` regardless of strictness, because of the [global context](#global_context) binding:

```js
const globalObject = this;
const foo = () => this;
console.log(foo() === globalObject); // true
```

Arrow functions create a [closure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) over the `this` value of its surrounding scope, which means arrow functions behave as if they are "auto-bound" — no matter how it's invoked, `this` is bound to what it was when the function was created (in the example above, the global object). The same applies to arrow functions created inside other functions: their `this` remains that of the enclosing lexical context. [See example below](#this_in_arrow_functions).

Furthermore, when invoking arrow functions using `call()`, `bind()`, or `apply()`, the `thisArg` parameter is ignored. You can still pass other arguments using these methods, though.

```js
const obj = { name: "obj" };

// Attempt to set this using call
console.log(foo.call(obj) === globalObject); // true

// Attempt to set this using bind
const boundFoo = foo.bind(obj);
console.log(boundFoo() === globalObject); // true
```

##### Constructors

When a function is used as a constructor (with the `new` keyword), its `this` is bound to the new object being constructed, no matter which object the constructor function is accessed on. The value of `this` becomes the value of the `new` expression unless the constructor returns another non–primitive value.

```js
function C() {
  this.a = 37;
}

let o = new C();
console.log(o.a); // 37

function C2() {
  this.a = 37;
  return { a: 38 };
}

o = new C2();
console.log(o.a); // 38
```

In the second example (`C2`), because an object was returned during construction, the new object that `this` was bound to gets discarded. (This essentially makes the statement `this.a = 37;` dead code. It's not exactly dead because it gets executed, but it can be eliminated with no outside effects.)

##### super

When a function is invoked in the `super.method()` form, the `this` inside the `method` function is the same value as the `this` value around the `super.method()` call, and is generally not equal to the object that `super` refers to. This is because `super.method` is not an object member access like the ones above — it's a special syntax with different binding rules. For examples, see the [`super` reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super#calling_methods_from_super).

#### Class context

A [class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) can be split into two contexts: static and instance. [Constructors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor), methods, and instance field initializers ([public](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields) or [private](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)) belong to the instance context. [Static](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static) methods, static field initializers, and [static initialization blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks) belong to the static context. The `this` value is different in each context.

Class constructors are always called with `new`, so their behavior is the same as [function constructors](#constructors): the `this` value is the new instance being created. Class methods behave like methods in object literals — the `this` value is the object that the method was accessed on. If the method is not transferred to another object, `this` is generally an instance of the class.

Static methods are not properties of `this`. They are properties of the class itself. Therefore, they are generally accessed on the class, and `this` is the value of the class (or a subclass). Static initialization blocks are also evaluated with `this` set to the current class.

Field initializers are also evaluated in the context of the class. Instance fields are evaluated with `this` set to the instance being constructed. Static fields are evaluated with `this` set to the current class. This is why arrow functions in field initializers are [bound to the instance for instance fields and to the class for static fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#cannot_be_used_as_methods).

```js
class C {
  instanceField = this;
  static staticField = this;
}

const c = new C();
console.log(c.instanceField === c); // true
console.log(C.staticField === C); // true
```

##### Derived class constructors

Unlike base class constructors, derived constructors have no initial `this` binding. Calling `super()` creates a `this` binding within the constructor and essentially has the effect of evaluating the following line of code, where `Base` is the base class:

```js
this = new Base();
```

> **Warning:**
> Referring to `this` before calling `super()` will throw an error.

Derived classes must not return before calling `super()`, unless the constructor returns an object (so the `this` value is overridden) or the class has no constructor at all.

```js
class Base {}
class Good extends Base {}
class AlsoGood extends Base {
  constructor() {
    return { a: 5 };
  }
}
class Bad extends Base {
  constructor() {}
}

new Good();
new AlsoGood();
new Bad(); // ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
```

#### Global context

In the global execution context (outside of any functions or classes; may be inside [blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/block) or [arrow functions](#arrow_functions) defined in the global scope), the `this` value depends on what execution context the script runs in. Like [callbacks](#callbacks), the `this` value is determined by the runtime environment (the caller).

At the top level of a script, `this` refers to `globalThis` whether in strict mode or not. This is generally the same as the global object — for example, if the source is put inside an HTML [`<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script) element and executed as a script, `this === window`.

> **Note:**
> `globalThis` is generally the same concept as the global object (i.e., adding properties to `globalThis` makes them global variables) — this is the case for browsers and Node — but hosts are allowed to provide a different value for `globalThis` that's unrelated to the global object.

```js
// In web browsers, the window object is also the global object:
console.log(this === window); // true

this.b = "MDN";
console.log(window.b); // "MDN"
console.log(b); // "MDN"
```

If the source is loaded as a [module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) (for HTML, this means adding `type="module"` to the `<script>` tag), `this` is always `undefined` at the top level.

If the source is executed with [`eval()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval), `this` is the same as the enclosing context for [direct eval](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#direct_and_indirect_eval), or `globalThis` (as if it's run in a separate global script) for indirect eval.

```js
function test() {
  // Direct eval
  console.log(eval("this") === this);
  // Indirect eval, non-strict
  console.log(eval?.("this") === globalThis);
  // Indirect eval, strict
  console.log(eval?.("'use strict'; this") === globalThis);
}

test.call({ name: "obj" }); // Logs 3 "true"
```

Note that some source code, while looking like the global scope, is actually wrapped in a function when executed. For example, Node.js CommonJS modules are wrapped in a function and executed with the `this` value set to `module.exports`. [Event handler attributes](#this_in_inline_event_handlers) are executed with `this` set to the element they are attached to.

Object literals don't create a `this` scope — only functions (methods) defined within the object do. Using `this` in an object literal inherits the value from the surrounding scope.

```js
const obj = {
  a: this,
};

console.log(obj.a === window); // true
```

### Examples

#### this in function contexts

The value of the `this` parameter depends on how the function is called, not on how it's defined.

```js
// An object can be passed as the first argument to 'call'
// or 'apply' and 'this' will be bound to it.
const obj = { a: "Custom" };

// Variables declared with var become properties of 'globalThis'.
var a = "Global";

function whatsThis() {
  return this.a; // 'this' depends on how the function is called
}

whatsThis(); // 'Global'; the 'this' parameter defaults to 'globalThis' in non–strict mode
obj.whatsThis = whatsThis;
obj.whatsThis(); // 'Custom'; the 'this' parameter is bound to obj
```

Using `call()` and `apply()`, you can pass the value of `this` as if it's an explicit parameter.

```js
function add(c, d) {
  return this.a + this.b + c + d;
}

const o = { a: 1, b: 3 };

// The first argument is bound to the implicit 'this' parameter; the remaining
// arguments are bound to the named parameters.
add.call(o, 5, 7); // 16

// The first argument is bound to the implicit 'this' parameter; the second
// argument is an array whose members are bound to the named parameters.
add.apply(o, [10, 20]); // 34
```

#### this and object conversion

In non–strict mode, if a function is called with a `this` value that's not an object, the `this` value is substituted with an object. `null` and `undefined` become `globalThis`. Primitives like `7` or `'foo'` are converted to an object using the related constructor, so the primitive number `7` is converted to a `Number` wrapper class and the string `'foo'` to a `String` wrapper class.

```js
function bar() {
  console.log(Object.prototype.toString.call(this));
}

bar.call(7); // [object Number]
bar.call("foo"); // [object String]
bar.call(undefined); // [object Window]
```

#### The bind() method

Calling [`f.bind(someObject)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) creates a new function with the same body and scope as `f`, but the value of `this` is permanently bound to the first argument of `bind`, regardless of how the function is being called.

```js
function f() {
  return this.a;
}

const g = f.bind({ a: "azerty" });
console.log(g()); // azerty

const h = g.bind({ a: "yoo" }); // bind only works once!
console.log(h()); // azerty

const o = { a: 37, f, g, h };
console.log(o.a, o.f(), o.g(), o.h()); // 37 37 azerty azerty
```

#### this in arrow functions

Arrow functions create closures over the `this` value of the enclosing execution context. In the following example, we create `obj` with a method `getThisGetter` that returns a function that returns the value of `this`. The returned function is created as an arrow function, so its `this` is permanently bound to the `this` of its enclosing function. The value of `this` inside `getThisGetter` can be set in the call, which in turn sets the return value of the returned function. We will assume that `getThisGetter` is a non-strict function, which means it's contained in a non-strict script and not further nested in a class or strict function.

```js
const obj = {
  getThisGetter() {
    const getter = () => this;
    return getter;
  },
};
```

We can call `getThisGetter` as a method of `obj`, which binds `this` to `obj` inside its body. The returned function is assigned to a variable `fn`. Now, when calling `fn`, the value of `this` returned is still the one set by the call to `getThisGetter`, which is `obj`. If the returned function was not an arrow function, such calls would cause the `this` value to be `globalThis`, because `getThisGetter` is non-strict.

```js
const fn = obj.getThisGetter();
console.log(fn() === obj); // true
```

But be careful if you unbind the method of `obj` without calling it, because `getThisGetter` is still a method that has a varying `this` value. Calling `fn2()()` in the following example returns `globalThis`, because it follows the `this` from `fn2()`, which is `globalThis` since it's called without being attached to any object.

```js
const fn2 = obj.getThisGetter;
console.log(fn2()() === globalThis); // true in non-strict mode
```

This behavior is very useful when defining callbacks. Usually, each function expression creates its own `this` binding, which shadows the `this` value of the upper scope. Now, you can define functions as arrow functions if you don't care about the `this` value, and only create `this` bindings where you do (e.g., in class methods). See [example with `setTimeout()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#using_call_bind_and_apply).

#### this with a getter or setter

`this` in getters and setters is based on which object the property is accessed on, not which object the property is defined on. A function used as getter or setter has its `this` bound to the object from which the property is being set or gotten.

```js
function sum() {
  return this.a + this.b + this.c;
}

const o = {
  a: 1,
  b: 2,
  c: 3,
  get average() {
    return (this.a + this.b + this.c) / 3;
  },
};

Object.defineProperty(o, "sum", {
  get: sum,
  enumerable: true,
  configurable: true,
});

console.log(o.average, o.sum); // 2 6
```

#### this in DOM event handlers

When a function is used as an event handler, its `this` parameter is bound to the DOM element on which the listener is placed (some browsers do not follow this convention for listeners added dynamically with methods other than `addEventListener()`).

```js
// When called as a listener, turns the related element blue
function bluify(e) {
  // Always true
  console.log(this === e.currentTarget);
  // true when currentTarget and target are the same object
  console.log(this === e.target);
  this.style.backgroundColor = "#A5D9F3";
}

// Get a list of every element in the document
const elements = document.getElementsByTagName("*");

// Add bluify as a click listener so when the
// element is clicked on, it turns blue
for (const element of elements) {
  element.addEventListener("click", bluify);
}
```

#### this in inline event handlers

When the code is called from an inline [event handler attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes#event_handler_attributes), its `this` is bound to the DOM element on which the listener is placed:

```html
<button onclick="alert(this.tagName.toLowerCase());">Show this</button>
```

The above alert shows `button`. Note, however, that only the outer scope has its `this` bound this way:

```html
<button onclick="alert((function () { return this; })());">
  Show inner this
</button>
```

In this case, the `this` parameter of the inner function is bound to `globalThis` (i.e., the default object in non–strict mode where `this` isn't passed in the call).

#### Bound methods in classes

Just like with regular functions, the value of `this` within methods depends on how they are called. Sometimes it is useful to override this behavior so that `this` within classes always refers to the class instance. To achieve this, bind the class methods in the constructor:

```js
class Car {
  constructor() {
    // Bind sayBye but not sayHi to show the difference
    this.sayBye = this.sayBye.bind(this);
  }

  sayHi() {
    console.log(`Hello from ${this.name}`);
  }

  sayBye() {
    console.log(`Bye from ${this.name}`);
  }

  get name() {
    return "Ferrari";
  }
}

class Bird {
  get name() {
    return "Tweety";
  }
}

const car = new Car();
const bird = new Bird();

// The value of 'this' in methods depends on their caller
car.sayHi(); // Hello from Ferrari
bird.sayHi = car.sayHi;
bird.sayHi(); // Hello from Tweety

// For bound methods, 'this' doesn't depend on the caller
bird.sayBye = car.sayBye;
bird.sayBye(); // Bye from Ferrari
```

> **Note:**
> Classes are always in strict mode. Calling methods with an undefined `this` will throw an error if the method tries to access properties on `this`.
>
> ```js example-bad
> const carSayHi = car.sayHi;
> carSayHi(); // TypeError because the 'sayHi' method tries to access 'this.name', but 'this' is undefined in strict mode.
> ```

Note, however, that auto-bound methods suffer from the same problem as [using arrow functions for class properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#cannot_be_used_as_methods): each instance of the class will have its own copy of the method, which increases memory usage. Only use it where absolutely necessary. You can also mimic the implementation of [`Intl.NumberFormat.prototype.format()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format#using_format_with_map): define the property as a getter that returns a bound function when accessed and saves it, so that the function is only created once and only created when necessary.

#### this in with statements

Although [`with`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with) statements are deprecated and not available in strict mode, they still serve as an exception to the normal `this` binding rules. If a function is called within a `with` statement and that function is a property of the scope object, the `this` value is bound to the scope object, as if the `obj.` prefix exists.

```js
const obj = {
  foo() {
    return this;
  },
};

with (obj) {
  console.log(foo() === obj); // true
}
```

## Short-Circuiting and Logical Operators (&&, ||, ??)

> **Source:** [Logical AND (&&)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND), [Logical OR (||)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR), [Nullish coalescing operator (??)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/logical-operators)

### Logical AND (&&)

The **logical AND (`&&`)** (logical conjunction) operator for a set of boolean operands will be `true` if and only if all the operands are `true`. Otherwise it will be `false`.

More generally, the operator returns the value of the first falsy operand encountered when evaluating from left to right, or the value of the last operand if they are all truthy.

```js
const a = 3;
const b = -2;

console.log(a > 0 && b > 0);
// Expected output: false
```

#### Syntax

```js
x && y
```

#### Description

Logical AND (`&&`) evaluates operands from left to right, returning immediately with the value of the first falsy operand it encounters; if all values are truthy, the value of the last operand is returned.

If a value can be converted to `true`, the value is so-called truthy. If a value can be converted to `false`, the value is so-called falsy.

Examples of expressions that can be converted to false are:

- `false`;
- `null`;
- `NaN`;
- `0`;
- empty string (`""` or `''` or ` `` `);
- `undefined`.

The AND operator preserves non-Boolean values and returns them as they are:

```js
result = "" && "foo"; // result is assigned "" (empty string)
result = 2 && 0; // result is assigned 0
result = "foo" && 4; // result is assigned 4
```

Even though the `&&` operator can be used with non-Boolean operands, it is still considered a boolean operator since its return value can always be
converted to a [boolean primitive](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#boolean_type).
To explicitly convert its return value (or any expression in general) to the corresponding boolean value, use a double [NOT operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_NOT) or the `Boolean` constructor.

##### Short-circuit evaluation

The logical AND expression is a short-circuit operator.
As each operand is converted to a boolean, if the result of one conversion is found to be `false`, the AND operator stops and returns the original value of that falsy operand; it does **not** evaluate any of the remaining operands.

Consider the pseudocode below.

```plain
(some falsy expression) && expr
```

The `expr` part is **never evaluated** because the first operand `(some falsy expression)` is evaluated as falsy.
If `expr` is a function, the function is never called.
See the example below:

```js
function A() {
  console.log("called A");
  return false;
}
function B() {
  console.log("called B");
  return true;
}

console.log(A() && B());
// Logs "called A" to the console due to the call for function A,
// && evaluates to false (function A returns false), then false is logged to the console;
// the AND operator short-circuits here and ignores function B
```

##### Operator precedence

The AND operator has a higher precedence than the OR operator, meaning the `&&` operator is executed before the `||` operator (see [operator precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence)).

```js
true || false && false; // true
true && (false || false); // false
(2 === 3) || (4 < 0) && (1 === 1); // false
```

#### Examples

##### Using AND

The following code shows examples of the `&&` (logical AND)
operator.

```js
a1 = true && true; // t && t returns true
a2 = true && false; // t && f returns false
a3 = false && true; // f && t returns false
a4 = false && 3 === 4; // f && f returns false
a5 = "Cat" && "Dog"; // t && t returns "Dog"
a6 = false && "Cat"; // f && t returns false
a7 = "Cat" && false; // t && f returns false
a8 = "" && false; // f && f returns ""
a9 = false && ""; // f && f returns false
```

##### Conversion rules for booleans

###### Converting AND to OR

The following operation involving **booleans**:

```js
bCondition1 && bCondition2
```

is always equal to:

```js
!(!bCondition1 || !bCondition2)
```

###### Converting OR to AND

The following operation involving **booleans**:

```js
bCondition1 || bCondition2
```

is always equal to:

```js
!(!bCondition1 && !bCondition2)
```

##### Removing nested parentheses

As logical expressions are evaluated left to right, it is always possible to remove parentheses from a complex expression provided that certain rules are followed.

The following composite operation involving **booleans**:

```js
bCondition1 || (bCondition2 && bCondition3)
```

is always equal to:

```js
bCondition1 || bCondition2 && bCondition3
```

### Logical OR (||)

The **logical OR (`||`)** (logical disjunction) operator for a set of operands
is true if and only if one or more of its operands is true. It is typically used with
boolean (logical) values. When it is, it returns a Boolean value. However,
the `||` operator actually returns the value of one of the specified
operands, so if this operator is used with non-Boolean values, it will return a
non-Boolean value.

```js
const a = 3;
const b = -2;

console.log(a > 0 || b > 0);
// Expected output: true
```

#### Syntax

```js
x || y
```

#### Description

If `x` can be converted to `true`, returns
`x`; else, returns `y`.

If a value can be converted to `true`, the value is so-called
truthy. If a value can be converted to `false`, the value is
so-called falsy.

Examples of expressions that can be converted to false are:

- `null`;
- `NaN`;
- `0`;
- empty string (`""` or `''` or ` `` `);
- `undefined`.

Even though the `||` operator can be used with operands that are not Boolean
values, it can still be considered a boolean operator since its return value can always
be converted to a [boolean primitive](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#boolean_type).
To explicitly convert its return value (or any expression in general) to the
corresponding boolean value, use a double `NOT operator` or the `Boolean()`
constructor.

##### Short-circuit evaluation

The logical OR expression is evaluated left to right, it is tested for possible
"short-circuit" evaluation using the following rule:

`(some truthy expression) || expr` is short-circuit evaluated to
the truthy expression.

Short circuit means that the `expr` part above is **not
evaluated**, hence any side effects of doing so do not take effect (e.g., if
`expr` is a function call, the calling never takes place). This
happens because the value of the operator is already determined after the evaluation of
the first operand. See example:

```js
function A() {
  console.log("called A");
  return false;
}
function B() {
  console.log("called B");
  return true;
}

console.log(B() || A());
// Logs "called B" due to the function call,
// then logs true (which is the resulting value of the operator)
```

##### Operator precedence

The following expressions might seem equivalent, but they are not, because the
`&&` operator is executed before the `||` operator
(see [operator precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence)).

```js
true || false && false; // returns true, because && is executed first
(true || false) && false; // returns false, because grouping has the highest precedence
```

#### Examples

##### Using OR

The following code shows examples of the `||` (logical OR) operator.

```js
true || true; // t || t returns true
false || true; // f || t returns true
true || false; // t || f returns true
false || 3 === 4; // f || f returns false
"Cat" || "Dog"; // t || t returns "Cat"
false || "Cat"; // f || t returns "Cat"
"Cat" || false; // t || f returns "Cat"
"" || false; // f || f returns false
false || ""; // f || f returns ""
false || varObject; // f || object returns varObject
```

> **Note:**
> If you use this operator to provide a default value to some
> variable, be aware that any _falsy_ value will not be used. If you only need to
> filter out [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) or `undefined`, consider using
> [the nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing).

##### Conversion rules for booleans

###### Converting AND to OR

The following operation involving **booleans**:

```js
bCondition1 && bCondition2
```

is always equal to:

```js
!(!bCondition1 || !bCondition2)
```

###### Converting OR to AND

The following operation involving **booleans**:

```js
bCondition1 || bCondition2
```

is always equal to:

```js
!(!bCondition1 && !bCondition2)
```

##### Removing nested parentheses

As logical expressions are evaluated left to right, it is always possible to remove
parentheses from a complex expression following some rules.

The following composite operation involving **booleans**:

```js
bCondition1 && (bCondition2 || bCondition3)
```

is always equal to:

```js
!(!bCondition1 || !bCondition2 && !bCondition3)
```

### Nullish coalescing operator (??)

The **nullish coalescing (`??`)** operator is a logical
operator that returns its right-hand side operand when its left-hand side operand is
[`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) or `undefined`, and otherwise returns its left-hand side
operand.

```js
const foo = null ?? "default string";
console.log(foo);
// Expected output: "default string"

const baz = 0 ?? 42;
console.log(baz);
// Expected output: 0
```

#### Syntax

```js
leftExpr ?? rightExpr
```

#### Description

The nullish coalescing operator can be seen as a special case of the [logical OR (`||`) operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR). The latter returns the right-hand side operand if the left operand is _any_ falsy value, not only `null` or `undefined`. In other words, if you use `||` to provide some default value to another variable `foo`, you may encounter unexpected behaviors if you consider some falsy values as usable (e.g., `''` or `0`). See [below](#assigning_a_default_value_to_a_variable) for more examples.

The nullish coalescing operator has the fifth-lowest [operator precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence), directly lower than `||` and directly higher than the [conditional (ternary) operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator).

It is not possible to combine either the AND (`&&`) or OR operators (`||`) directly with `??`. A [syntax error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_use_nullish_coalescing_unparenthesized) will be thrown in such cases.

```js example-bad
null || undefined ?? "foo"; // raises a SyntaxError
true && undefined ?? "foo"; // raises a SyntaxError
```

Instead, provide parenthesis to explicitly indicate precedence:

```js
(null || undefined) ?? "foo"; // returns "foo"
```

#### Examples

##### Using the nullish coalescing operator

In this example, we will provide default values but keep values other than `null` or `undefined`.

```js
const nullValue = null;
const emptyText = ""; // falsy
const someNumber = 42;

const valA = nullValue ?? "default for A";
const valB = emptyText ?? "default for B";
const valC = someNumber ?? 0;

console.log(valA); // "default for A"
console.log(valB); // "" (as the empty string is not null or undefined)
console.log(valC); // 42
```

##### Assigning a default value to a variable

Earlier, when one wanted to assign a default value to a variable, a common pattern was to use the logical OR operator ([`||`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR)):

```js
let foo;

// foo is never assigned any value so it is still undefined
const someDummyText = foo || "Hello!";
```

However, due to `||` being a boolean logical operator, the left-hand-side operand was coerced to a boolean for the evaluation and any _falsy_ value (including `0`, `''`, `NaN`, `false`, etc.) was not returned. This behavior may cause unexpected consequences if you consider `0`, `''`, or `NaN` as valid values.

```js
const count = 0;
const text = "";

const qty = count || 42;
const message = text || "hi!";
console.log(qty); // 42 and not 0
console.log(message); // "hi!" and not ""
```

The nullish coalescing operator avoids this pitfall by only returning the second operand when the first one evaluates to either `null` or `undefined` (but no other falsy values):

```js
const myText = ""; // An empty string (which is also a falsy value)

const notFalsyText = myText || "Hello world";
console.log(notFalsyText); // Hello world

const preservingFalsy = myText ?? "Hi neighborhood";
console.log(preservingFalsy); // '' (as myText is neither undefined nor null)
```

##### Short-circuiting

Like the 'OR' and 'AND' logical operators, the right-hand side expression is not evaluated if the left-hand side proves to be neither `null` nor `undefined`.

```js
function a() {
  console.log("a was called");
  return undefined;
}
function b() {
  console.log("b was called");
  return false;
}
function c() {
  console.log("c was called");
  return "foo";
}

console.log(a() ?? c());
// Logs "a was called" then "c was called" and then "foo"
// as a() returned undefined so both expressions are evaluated

console.log(b() ?? c());
// Logs "b was called" then "false"
// as b() returned false (and not null or undefined), the right
// hand side expression was not evaluated
```

##### Relationship with the optional chaining operator (?.)

The nullish coalescing operator treats `undefined` and `null` as specific values. So does the [optional chaining operator (`?.`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining), which is useful to access a property of an object which may be `null` or `undefined`. Combining them, you can safely access a property of an object which may be nullish and provide a default value if it is.

```js
const foo = { someFooProp: "hi" };

console.log(foo.someFooProp?.toUpperCase() ?? "not available"); // "HI"
console.log(foo.someBarProp?.toUpperCase() ?? "not available"); // "not available"
```

## Optional Chaining (?.)

> **Source:** [Optional chaining (?.)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/optional-chaining)

The **optional chaining (`?.`)** operator accesses an object's property or calls a function. If the object accessed or function called using this operator is `undefined` or [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null), the expression short circuits and evaluates to `undefined` instead of throwing an error.

```js
const adventurer = {
  name: "Alice",
  cat: {
    name: "Dinah",
  },
};

const dogName = adventurer.dog?.name;
console.log(dogName);
// Expected output: undefined

console.log(adventurer.someNonExistentMethod?.());
// Expected output: undefined
```

### Syntax

```js
obj?.prop
obj?.[expr]
func?.(args)
```

### Description

The `?.` operator is like the `.` chaining operator, except that instead of causing an error if a reference is [nullish](https://developer.mozilla.org/en-US/docs/Glossary/Nullish) ([`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) or `undefined`), the expression short-circuits with a return value of `undefined`. When used with function calls, it returns `undefined` if the given function does not exist.

This results in shorter and simpler expressions when accessing chained properties when the possibility exists that a reference may be missing. It can also be helpful while exploring the content of an object when there's no known guarantee as to which properties are required.

For example, consider an object `obj` which has a nested structure. Without
optional chaining, looking up a deeply-nested subproperty requires validating the
references in between, such as:

```js
const nestedProp = obj.first && obj.first.second;
```

The value of `obj.first` is confirmed to be non-`null` (and
non-`undefined`) before accessing the value of
`obj.first.second`. This prevents the error that would occur if you accessed
`obj.first.second` directly without testing `obj.first`.

This is an idiomatic pattern in JavaScript, but it gets verbose when the chain is long, and it's not safe. For example, if `obj.first` is a Falsy value that's not `null` or `undefined`, such as `0`, it would still short-circuit and make `nestedProp` become `0`, which may not be desirable.

With the optional chaining operator (`?.`), however, you don't have to
explicitly test and short-circuit based on the state of `obj.first` before
trying to access `obj.first.second`:

```js
const nestedProp = obj.first?.second;
```

By using the `?.` operator instead of just `.`, JavaScript knows
to implicitly check to be sure `obj.first` is not `null` or
`undefined` before attempting to access `obj.first.second`. If
`obj.first` is `null` or `undefined`, the expression
automatically short-circuits, returning `undefined`.

This is equivalent to the following, except that the temporary variable is in fact not
created:

```js
const temp = obj.first;
const nestedProp =
  temp === null || temp === undefined ? undefined : temp.second;
```

Optional chaining cannot be used on a non-declared root object, but can be used with a root object with value `undefined`.

```js
undeclaredVar?.prop; // ReferenceError: undeclaredVar is not defined
```

#### Optional chaining with function calls

You can use optional chaining when attempting to call a method which may not exist.
This can be helpful, for example, when using an API in which a method might be
unavailable, either due to the age of the implementation or because of a feature which
isn't available on the user's device.

Using optional chaining with function calls causes the expression to automatically
return `undefined` instead of throwing an exception if the method isn't
found:

```js
const result = someInterface.customMethod?.();
```

However, if there is a property with such a name which is not a function, using `?.` will still raise a `TypeError` exception "someInterface.customMethod is not a function".

> **Note:**
> If `someInterface` itself is `null` or
> `undefined`, a `TypeError` exception will still be
> raised ("someInterface is null"). If you expect that
> `someInterface` itself may be `null` or `undefined`,
> you have to use `?.` at this position as
> well: `someInterface?.customMethod?.()`.

`eval?.()` is the shortest way to enter [_indirect eval_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#direct_and_indirect_eval) mode.

#### Optional chaining with expressions

You can also use the optional chaining operator with [bracket notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#bracket_notation), which allows passing an expression as the property name:

```js
const propName = "x";
const nestedProp = obj?.[propName];
```

This is particularly useful for arrays, since array indices must be accessed with square brackets.

```js
function printMagicIndex(arr) {
  console.log(arr?.[42]);
}

printMagicIndex([0, 1, 2, 3, 4, 5]); // undefined
printMagicIndex(); // undefined; if not using ?., this would throw an error: "Cannot read properties of undefined (reading '42')"
```

#### Invalid optional chaining

It is invalid to try to assign to the result of an optional chaining expression:

```js example-bad
const object = {};
object?.property = 1; // SyntaxError: Invalid left-hand side in assignment
```

[Template literal tags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) cannot be an optional chain (see [SyntaxError: tagged template cannot be used with optional chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_optional_template)):

```js example-bad
String?.raw`Hello, world!`;
String.raw?.`Hello, world!`; // SyntaxError: Invalid tagged template on optional chain
```

The constructor of `new` expressions cannot be an optional chain (see [SyntaxError: new keyword cannot be used with an optional chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_new_optional)):

```js example-bad
new Intl?.DateTimeFormat(); // SyntaxError: Invalid optional chain from new expression
new Map?.();
```

#### Short-circuiting

When using optional chaining with expressions, if the left operand is `null` or `undefined`, the expression will not be evaluated. For instance:

```js
const potentiallyNullObj = null;
let x = 0;
const prop = potentiallyNullObj?.[x++];

console.log(x); // 0 as x was not incremented
```

Subsequent property accesses will not be evaluated either.

```js
const potentiallyNullObj = null;
const prop = potentiallyNullObj?.a.b;
// This does not throw, because evaluation has already stopped at
// the first optional chain
```

This is equivalent to:

```js
const potentiallyNullObj = null;
const prop =
  potentiallyNullObj === null || potentiallyNullObj === undefined
    ? undefined
    : potentiallyNullObj.a.b;
```

However, this short-circuiting behavior only happens along one continuous "chain" of property accesses. If you [group](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Grouping) one part of the chain, then subsequent property accesses will still be evaluated.

```js
const potentiallyNullObj = null;
const prop = (potentiallyNullObj?.a).b;
// TypeError: Cannot read properties of undefined (reading 'b')
```

This is equivalent to:

```js
const potentiallyNullObj = null;
const temp = potentiallyNullObj?.a;
const prop = temp.b;
```

Except the `temp` variable isn't created.

### Examples

#### Basic example

This example looks for the value of the `name` property for the member
`CSS` in a map when there is no such member. The result is therefore
`undefined`.

```js
const myMap = new Map();
myMap.set("JS", { name: "Josh", desc: "I maintain things" });

const nameBar = myMap.get("CSS")?.name;
```

#### Dealing with optional callbacks or event handlers

If you use callbacks or fetch methods from an object with a
[destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring#object_destructuring) pattern, you may have non-existent values that you cannot call as
functions unless you have tested their existence. Using `?.`, you can avoid this extra test:

```js
// Code written without optional chaining
function doSomething(onContent, onError) {
  try {
    // Do something with the data
  } catch (err) {
    // Testing if onError really exists
    if (onError) {
      onError(err.message);
    }
  }
}
```

```js
// Using optional chaining with function calls
function doSomething(onContent, onError) {
  try {
    // Do something with the data
  } catch (err) {
    onError?.(err.message); // No exception if onError is undefined
  }
}
```

#### Stacking the optional chaining operator

With nested structures, it is possible to use optional chaining multiple times:

```js
const customer = {
  name: "Carl",
  details: {
    age: 82,
    location: "Paradise Falls", // Detailed address is unknown
  },
};
const customerCity = customer.details?.address?.city;

// This also works with optional chaining function call
const customerName = customer.name?.getName?.(); // Method does not exist, customerName is undefined
```

#### Combining with the nullish coalescing operator

The [nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) may be used after optional chaining in order to build a default value when none was found:

```js
function printCustomerCity(customer) {
  const customerCity = customer?.city ?? "Unknown city";
  console.log(customerCity);
}

printCustomerCity({
  name: "Nathan",
  city: "Paris",
}); // "Paris"
printCustomerCity({
  name: "Carl",
  details: { age: 82 },
}); // "Unknown city"
```

## The Array map() Method

> **Source:** [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/array-methods)

The **`map()`** method of `Array` instances creates
a new array populated with the results of calling a provided function on
every element in the calling array.

```js
const array = [1, 4, 9, 16];

// Pass a function to map
const mapped = array.map((x) => x * 2);

console.log(mapped);
// Expected output: Array [2, 8, 18, 32]
```

### Syntax

```js
map(callbackFn)
map(callbackFn, thisArg)
```

#### Parameters

- `callbackFn`
  - : A function to execute for each element in the array. Its return value is added as a single element in the new array. The function is called with the following arguments:
    - `element`
      - : The current element being processed in the array.
    - `index`
      - : The index of the current element being processed in the array.
    - `array`
      - : The array `map()` was called upon.
- `thisArg`
  - : A value to use as `this` when executing `callbackFn`. See [iterative methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#iterative_methods).

#### Return value

A new array with each element being the result of the callback function.

### Description

The `map()` method is an [iterative method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#iterative_methods). It calls a provided `callbackFn` function once for each element in an array and constructs a new array from the results. Read the [iterative methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#iterative_methods) section for more information about how these methods work in general.

`callbackFn` is invoked only for array indexes which have assigned values. It is not invoked for empty slots in [sparse arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#sparse_arrays).

The `map()` method is [generic](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#generic_array_methods). It only expects the `this` value to have a `length` property and integer-keyed properties.

Since `map` builds a new array, calling it without using the returned array is an anti-pattern; use `forEach` or `for...of` instead.

### Examples

#### Mapping an array of numbers to an array of square roots

The following code takes an array of numbers and creates a new array containing the square roots of the numbers in the first array.

```js
const numbers = [1, 4, 9];
const roots = numbers.map((num) => Math.sqrt(num));

// roots is now     [1, 2, 3]
// numbers is still [1, 4, 9]
```

#### Using map to reformat objects in an array

The following code takes an array of objects and creates a new array containing the newly reformatted objects.

```js
const kvArray = [
  { key: 1, value: 10 },
  { key: 2, value: 20 },
  { key: 3, value: 30 },
];

const reformattedArray = kvArray.map(({ key, value }) => ({ [key]: value }));

console.log(reformattedArray); // [{ 1: 10 }, { 2: 20 }, { 3: 30 }]
console.log(kvArray);
// [
//   { key: 1, value: 10 },
//   { key: 2, value: 20 },
//   { key: 3, value: 30 }
// ]
```

#### Using parseInt() with map()

It is common to use the callback with one argument (the element being traversed). Certain functions are also commonly used with one argument, even though they take additional optional arguments. These habits may lead to confusing behaviors. Consider:

```js
["1", "2", "3"].map(parseInt);
```

While one might expect `[1, 2, 3]`, the actual result is `[1, NaN, NaN]`.

`parseInt` is often used with one argument, but takes two. The first is an expression and the second is the radix to the callback function, `Array.prototype.map` passes 3 arguments: the element, the index, and the array. The third argument is ignored by `parseInt` — but _not_ the second one! This is the source of possible confusion.

Here is a concise example of the iteration steps:

```js
/* first iteration  (index is 0): */ parseInt("1", 0); // 1
/* second iteration (index is 1): */ parseInt("2", 1); // NaN
/* third iteration  (index is 2): */ parseInt("3", 2); // NaN
```

To solve this, define another function that only takes one argument:

```js
["1", "2", "3"].map((str) => parseInt(str, 10)); // [1, 2, 3]
```

You can also use the `Number` function, which only takes one argument:

```js
["1", "2", "3"].map(Number); // [1, 2, 3]

// But unlike parseInt(), Number() will also return a float or (resolved) exponential notation:
["1.1", "2.2e2", "3e300"].map(Number); // [1.1, 220, 3e+300]

// For comparison, if we use parseInt() on the array above:
["1.1", "2.2e2", "3e300"].map((str) => parseInt(str, 10)); // [1, 2, 3]
```

See [A JavaScript optional argument hazard](https://wirfs-brock.com/allen/posts/166) by Allen Wirfs-Brock for more discussions.

#### Mapped array contains undefined

When `undefined` or nothing is returned, the resulting array contains `undefined`. If you want to delete the element instead, chain a `filter()` method, or use the `flatMap()` method and return an empty array to signify deletion.

```js
const numbers = [1, 2, 3, 4];
const filteredNumbers = numbers.map((num, index) => {
  if (index < 3) {
    return num;
  }
});

// index goes from 0, so the filteredNumbers are 1,2,3 and undefined.
// filteredNumbers is [1, 2, 3, undefined]
// numbers is still [1, 2, 3, 4]
```

#### Side-effectful mapping

The callback can have side effects.

```js
const cart = [5, 15, 25];
let total = 0;
const withTax = cart.map((cost) => {
  total += cost;
  return cost * 1.2;
});
console.log(withTax); // [6, 18, 30]
console.log(total); // 45
```

This is not recommended, because copying methods are best used with pure functions. In this case, we can choose to iterate the array twice.

```js
const cart = [5, 15, 25];
const total = cart.reduce((acc, cost) => acc + cost, 0);
const withTax = cart.map((cost) => cost * 1.2);
```

Sometimes this pattern goes to its extreme and the _only_ useful thing that `map()` does is causing side effects.

```js
const products = [
  { name: "sports car" },
  { name: "laptop" },
  { name: "phone" },
];

products.map((product) => {
  product.price = 100;
});
```

As mentioned previously, this is an anti-pattern. If you don't use the return value of `map()`, use `forEach()` or a `for...of` loop instead.

```js
products.forEach((product) => {
  product.price = 100;
});
```

Or, if you want to create a new array instead:

```js
const productsWithPrice = products.map((product) => ({
  ...product,
  price: 100,
}));
```

#### Using the third argument of callbackFn

The `array` argument is useful if you want to access another element in the array, especially when you don't have an existing variable that refers to the array. The following example first uses `filter()` to extract the positive values and then uses `map()` to create a new array where each element is the average of its neighbors and itself.

```js
const numbers = [3, -1, 1, 4, 1, 5, 9, 2, 6];
const averaged = numbers
  .filter((num) => num > 0)
  .map((num, idx, arr) => {
    // Without the arr argument, there's no way to easily access the
    // intermediate array without saving it to a variable.
    const prev = arr[idx - 1];
    const next = arr[idx + 1];
    let count = 1;
    let total = num;
    if (prev !== undefined) {
      count++;
      total += prev;
    }
    if (next !== undefined) {
      count++;
      total += next;
    }
    const average = total / count;
    // Keep two decimal places
    return Math.round(average * 100) / 100;
  });
console.log(averaged); // [2, 2.67, 2, 3.33, 5, 5.33, 5.67, 4]
```

The `array` argument is _not_ the array that is being built — there is no way to access the array being built from the callback function.

#### Using map() on sparse arrays

A sparse array remains sparse after `map()`. The indices of empty slots are still empty in the returned array, and the callback function won't be called on them.

```js
console.log(
  [1, , 3].map((x, index) => {
    console.log(`Visit ${index}`);
    return x * 2;
  }),
);
// Visit 0
// Visit 2
// [2, empty, 6]
```

#### Calling map() on non-array objects

The `map()` method reads the `length` property of `this` and then accesses each property whose key is a nonnegative integer less than `length`.

```js
const arrayLike = {
  length: 3,
  0: 2,
  1: 3,
  2: 4,
  3: 5, // ignored by map() since length is 3
};
console.log(Array.prototype.map.call(arrayLike, (x) => x ** 2));
// [ 4, 9, 16 ]
```

This example shows how to iterate through a collection of objects collected by `querySelectorAll()`, returning an array containing the values of all the selected `option` elements. Because `querySelectorAll()` returns a `NodeList`, which is an array-like object without the `map()` method, we use `Array.prototype.map.call()`, passing `elems` as the `this` value and the callback as the second argument.

```js
const elems = document.querySelectorAll("select option:checked");
const values = Array.prototype.map.call(elems, ({ value }) => value);
```

You can also use `Array.from()` to transform `elems` to an array, and then access the `map()` method.

## The Array filter() Method

> **Source:** [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/array-methods)

The **`filter()`** method of `Array` instances creates a [shallow copy](https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy) of a portion of a given array, filtered down to just the elements from the given array that pass the test implemented by the provided function.

```js
const words = ["spray", "elite", "exuberant", "destruction", "present"];

const result = words.filter((word) => word.length > 6);

console.log(result);
// Expected output: Array ["exuberant", "destruction", "present"]
```

### Syntax

```js
filter(callbackFn)
filter(callbackFn, thisArg)
```

#### Parameters

- `callbackFn`
  - : A function to execute for each element in the array. It should return a [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value to keep the element in the resulting array, and a [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value otherwise. The function is called with the following arguments:
    - `element`
      - : The current element being processed in the array.
    - `index`
      - : The index of the current element being processed in the array.
    - `array`
      - : The array `filter()` was called upon.
- `thisArg`
  - : A value to use as `this` when executing `callbackFn`. See [iterative methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#iterative_methods).

#### Return value

A [shallow copy](https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy) of the given array containing just the elements that pass the test. If no elements pass the test, an empty array is returned.

### Description

The `filter()` method is an [iterative method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#iterative_methods). It calls a provided `callbackFn` function once for each element in an array, and constructs a new array of all the values for which `callbackFn` returns a [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value. Array elements which do not pass the `callbackFn` test are not included in the new array. Read the [iterative methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#iterative_methods) section for more information about how these methods work in general.

`callbackFn` is invoked only for array indexes which have assigned values. It is not invoked for empty slots in [sparse arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#sparse_arrays).

The `filter()` method is [generic](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#generic_array_methods). It only expects the `this` value to have a `length` property and integer-keyed properties.

### Examples

#### Filtering out all small values

The following example uses `filter()` to create a filtered array that has all elements with values less than 10 removed.

```js
function isBigEnough(value) {
  return value >= 10;
}

const filtered = [12, 5, 8, 130, 44].filter(isBigEnough);
// filtered is [12, 130, 44]
```

#### Find all prime numbers in an array

The following example returns all prime numbers in the array:

```js
const array = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function isPrime(n) {
  if (n < 2) {
    return false;
  }
  if (n % 2 === 0) {
    return n === 2;
  }
  for (let factor = 3; factor * factor <= n; factor += 2) {
    if (n % factor === 0) {
      return false;
    }
  }
  return true;
}

console.log(array.filter(isPrime)); // [2, 3, 5, 7, 11, 13]
```

> **Note:**
> The `isPrime()` implementation is for demonstration only. For a real-world application, you would want to use a heavily memoized algorithm such as the [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes) to avoid repeated calculations.

#### Filtering invalid objects from an array of objects

The following example uses `filter()` to create a filtered array of all objects with non-zero, numeric `id`.

```js
const arr = [
  { id: 15 },
  { id: -1 },
  { id: 0 },
  { id: 3 },
  { id: 12.2 },
  {},
  { id: null },
  { id: NaN },
  { id: "undefined" },
];

let invalidEntries = 0;

function filterByID(item) {
  if (Number.isFinite(item.id) && item.id !== 0) {
    return true;
  }
  invalidEntries++;
  return false;
}

const arrByID = arr.filter(filterByID);

console.log("Filtered Array\n", arrByID);
// Filtered Array
// [{ id: 15 }, { id: -1 }, { id: 3 }, { id: 12.2 }]

console.log("Number of Invalid Entries =", invalidEntries);
// Number of Invalid Entries = 5
```

#### Searching in array

The following example uses `filter()` to filter array content based on search criteria.

```js
const fruits = ["apple", "banana", "grapes", "mango", "orange"];

/**
 * Filter array items based on search criteria (query)
 */
function filterItems(arr, query) {
  return arr.filter((el) => el.toLowerCase().includes(query.toLowerCase()));
}

console.log(filterItems(fruits, "ap")); // ['apple', 'grapes']
console.log(filterItems(fruits, "an")); // ['banana', 'mango', 'orange']
```

#### Using the third argument of callbackFn

The `array` argument is useful if you want to access another element in the array, especially when you don't have an existing variable that refers to the array. The following example first uses `map()` to extract the numerical ID from each name and then uses `filter()` to select the ones that are greater than its neighbors.

```js
const names = ["JC63", "Bob132", "Ursula89", "Ben96"];
const greatIDs = names
  .map((name) => parseInt(name.match(/\d+/)[0], 10))
  .filter((id, idx, arr) => {
    // Without the arr argument, there's no way to easily access the
    // intermediate array without saving it to a variable.
    if (idx > 0 && id <= arr[idx - 1]) return false;
    if (idx < arr.length - 1 && id <= arr[idx + 1]) return false;
    return true;
  });
console.log(greatIDs); // [132, 96]
```

The `array` argument is _not_ the array that is being built — there is no way to access the array being built from the callback function.

#### Using filter() on sparse arrays

`filter()` will skip empty slots.

```js
console.log([1, , undefined].filter((x) => x === undefined)); // [undefined]
console.log([1, , undefined].filter((x) => x !== 2)); // [1, undefined]
```

#### Calling filter() on non-array objects

The `filter()` method reads the `length` property of `this` and then accesses each property whose key is a nonnegative integer less than `length`.

```js
const arrayLike = {
  length: 3,
  0: "a",
  1: "b",
  2: "c",
  3: "a", // ignored by filter() since length is 3
};
console.log(Array.prototype.filter.call(arrayLike, (x) => x <= "b"));
// [ 'a', 'b' ]
```

## The Array reduce() Method

> **Source:** [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/array-methods)

The **`reduce()`** method of `Array` instances executes a user-supplied "reducer" callback function on each element of the array, in order, passing in the return value from the calculation on the preceding element. The final result of running the reducer across all elements of the array is a single value.

The first time that the callback is run there is no "return value of the previous calculation". If supplied, an initial value may be used in its place. Otherwise the array element at index 0 is used as the initial value and iteration starts from the next element (index 1 instead of index 0).

```js
const array = [1, 2, 3, 4];

// 0 + 1 + 2 + 3 + 4
const initialValue = 0;
const sumWithInitial = array.reduce(
  (accumulator, currentValue) => accumulator + currentValue,
  initialValue,
);

console.log(sumWithInitial);
// Expected output: 10
```

### Syntax

```js
reduce(callbackFn)
reduce(callbackFn, initialValue)
```

#### Parameters

- `callbackFn`
  - : A function to execute for each element in the array. Its return value becomes the value of the `accumulator` parameter on the next invocation of `callbackFn`. For the last invocation, the return value becomes the return value of `reduce()`. The function is called with the following arguments:
    - `accumulator`
      - : The value resulting from the previous call to `callbackFn`. On the first call, its value is `initialValue` if the latter is specified; otherwise its value is `array[0]`.
    - `currentValue`
      - : The value of the current element. On the first call, its value is `array[0]` if `initialValue` is specified; otherwise its value is `array[1]`.
    - `currentIndex`
      - : The index position of `currentValue` in the array. On the first call, its value is `0` if `initialValue` is specified, otherwise `1`.
    - `array`
      - : The array `reduce()` was called upon.
- `initialValue`
  - : A value to which `accumulator` is initialized the first time the callback is called.
    If `initialValue` is specified, `callbackFn` starts executing with the first value in the array as `currentValue`.
    If `initialValue` is _not_ specified, `accumulator` is initialized to the first value in the array, and `callbackFn` starts executing with the second value in the array as `currentValue`. In this case, if the array is empty (so that there's no first value to return as `accumulator`), an error is thrown.

#### Return value

The value that results from running the "reducer" callback function to completion over the entire array.

#### Exceptions

- `TypeError`
  - : Thrown if the array contains no elements and `initialValue` is not provided.

### Description

The `reduce()` method is an [iterative method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#iterative_methods). It runs a "reducer" callback function over all elements in the array, in ascending-index order, and accumulates them into a single value. Every time, the return value of `callbackFn` is passed into `callbackFn` again on next invocation as `accumulator`. The final value of `accumulator` (which is the value returned from `callbackFn` on the final iteration of the array) becomes the return value of `reduce()`. Read the [iterative methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#iterative_methods) section for more information about how these methods work in general.

`callbackFn` is invoked only for array indexes which have assigned values. It is not invoked for empty slots in [sparse arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#sparse_arrays).

Unlike other [iterative methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#iterative_methods), `reduce()` does not accept a `thisArg` argument. `callbackFn` is always called with `undefined` as `this`, which gets substituted with `globalThis` if `callbackFn` is non-strict.

`reduce()` is a central concept in [functional programming](https://en.wikipedia.org/wiki/Functional_programming), where it's not possible to mutate any value, so in order to accumulate all values in an array, one must return a new accumulator value on every iteration. This convention propagates to JavaScript's `reduce()`: you should use [spreading](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) or other copying methods where possible to create new arrays and objects as the accumulator, rather than mutating the existing one. If you decided to mutate the accumulator instead of copying it, remember to still return the modified object in the callback, or the next iteration will receive undefined. However, note that copying the accumulator may in turn lead to increased memory usage and degraded performance — see [When to not use reduce()](#when_to_not_use_reduce) for more details. In such cases, to avoid bad performance and unreadable code, it's better to use a `for` loop instead.

The `reduce()` method is [generic](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#generic_array_methods). It only expects the `this` value to have a `length` property and integer-keyed properties.

#### Edge cases

If the array only has one element (regardless of position) and no `initialValue` is provided, or if `initialValue` is provided but the array is empty, the solo value will be returned _without_ calling `callbackFn`.

If `initialValue` is provided and the array is not empty, then the reduce method will always invoke the callback function starting at index 0.

If `initialValue` is not provided then the reduce method will act differently for arrays with length larger than 1, equal to 1 and 0, as shown in the following example:

```js
const getMax = (a, b) => Math.max(a, b);

// callback is invoked for each element in the array starting at index 0
[1, 100].reduce(getMax, 50); // 100
[50].reduce(getMax, 10); // 50

// callback is invoked once for element at index 1
[1, 100].reduce(getMax); // 100

// callback is not invoked
[50].reduce(getMax); // 50
[].reduce(getMax, 1); // 1

[].reduce(getMax); // TypeError
```

### Examples

#### How reduce() works without an initial value

The code below shows what happens if we call `reduce()` with an array and no initial value.

```js
const array = [15, 16, 17, 18, 19];

function reducer(accumulator, currentValue, index) {
  const returns = accumulator + currentValue;
  console.log(
    `accumulator: ${accumulator}, currentValue: ${currentValue}, index: ${index}, returns: ${returns}`,
  );
  return returns;
}

array.reduce(reducer);
```

The callback would be invoked four times, with the arguments and return values in each call being as follows:

|             | `accumulator` | `currentValue` | `index` | Return value |
| ----------- | ------------- | -------------- | ------- | ------------ |
| First call  | `15`          | `16`           | `1`     | `31`         |
| Second call | `31`          | `17`           | `2`     | `48`         |
| Third call  | `48`          | `18`           | `3`     | `66`         |
| Fourth call | `66`          | `19`           | `4`     | `85`         |

The `array` parameter never changes through the process — it's always `[15, 16, 17, 18, 19]`. The value returned by `reduce()` would be that of the last callback invocation (`85`).

#### How reduce() works with an initial value

Here we reduce the same array using the same algorithm, but with an `initialValue` of `10` passed as the second argument to `reduce()`:

```js
[15, 16, 17, 18, 19].reduce(
  (accumulator, currentValue) => accumulator + currentValue,
  10,
);
```

The callback would be invoked five times, with the arguments and return values in each call being as follows:

|             | `accumulator` | `currentValue` | `index` | Return value |
| ----------- | ------------- | -------------- | ------- | ------------ |
| First call  | `10`          | `15`           | `0`     | `25`         |
| Second call | `25`          | `16`           | `1`     | `41`         |
| Third call  | `41`          | `17`           | `2`     | `58`         |
| Fourth call | `58`          | `18`           | `3`     | `76`         |
| Fifth call  | `76`          | `19`           | `4`     | `95`         |

The value returned by `reduce()` in this case would be `95`.

#### Sum of values in an object array

To sum up the values contained in an array of objects, you **must** supply
an `initialValue`, so that each item passes through your function.

```js
const objects = [{ x: 1 }, { x: 2 }, { x: 3 }];
const sum = objects.reduce(
  (accumulator, currentValue) => accumulator + currentValue.x,
  0,
);

console.log(sum); // 6
```

#### Function sequential piping

The `pipe` function takes a sequence of functions and returns a new function. When the new function is called with an argument, the sequence of functions are called in order, which each one receiving the return value of the previous function.

```js
const pipe =
  (...functions) =>
  (initialValue) =>
    functions.reduce((acc, fn) => fn(acc), initialValue);

// Building blocks to use for composition
const double = (x) => 2 * x;
const triple = (x) => 3 * x;
const quadruple = (x) => 4 * x;

// Composed functions for multiplication of specific values
const multiply6 = pipe(double, triple);
const multiply9 = pipe(triple, triple);
const multiply16 = pipe(quadruple, quadruple);
const multiply24 = pipe(double, triple, quadruple);

// Usage
multiply6(6); // 36
multiply9(9); // 81
multiply16(16); // 256
multiply24(10); // 240
```

#### Running promises in sequence

[Promise sequencing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#composition) is essentially function piping demonstrated in the previous section, except done asynchronously.

```js
// Compare this with pipe: fn(acc) is changed to acc.then(fn),
// and initialValue is ensured to be a promise
const asyncPipe =
  (...functions) =>
  (initialValue) =>
    functions.reduce((acc, fn) => acc.then(fn), Promise.resolve(initialValue));

// Building blocks to use for composition
const p1 = async (a) => a * 5;
const p2 = async (a) => a * 2;
// The composed functions can also return non-promises, because the values are
// all eventually wrapped in promises
const f3 = (a) => a * 3;
const p4 = async (a) => a * 4;

asyncPipe(p1, p2, f3, p4)(10).then(console.log); // 1200
```

`asyncPipe` can also be implemented using `async`/`await`, which better demonstrates its similarity with `pipe`:

```js
const asyncPipe =
  (...functions) =>
  (initialValue) =>
    functions.reduce(async (acc, fn) => fn(await acc), initialValue);
```

#### Using reduce() with sparse arrays

`reduce()` skips missing elements in sparse arrays, but it does not skip `undefined` values.

```js
console.log([1, 2, , 4].reduce((a, b) => a + b)); // 7
console.log([1, 2, undefined, 4].reduce((a, b) => a + b)); // NaN
```

#### Calling reduce() on non-array objects

The `reduce()` method reads the `length` property of `this` and then accesses each property whose key is a nonnegative integer less than `length`.

```js
const arrayLike = {
  length: 3,
  0: 2,
  1: 3,
  2: 4,
  3: 99, // ignored by reduce() since length is 3
};
console.log(Array.prototype.reduce.call(arrayLike, (x, y) => x + y));
// 9
```

#### When to not use reduce()

Multipurpose higher-order functions like `reduce()` can be powerful but sometimes difficult to understand, especially for less-experienced JavaScript developers. If code becomes clearer when using other array methods, developers must weigh the readability tradeoff against the other benefits of using `reduce()`.

Note that `reduce()` is always equivalent to a `for...of` loop, except that instead of mutating a variable in the upper scope, we now return the new value for each iteration:

```js
const val = array.reduce((acc, cur) => update(acc, cur), initialValue);

// Is equivalent to:
let val = initialValue;
for (const cur of array) {
  val = update(val, cur);
}
```

As previously stated, the reason why people may want to use `reduce()` is to mimic functional programming practices of immutable data. Therefore, developers who uphold the immutability of the accumulator often copy the entire accumulator for each iteration, like this:

```js
const names = ["Alice", "Bob", "Tiff", "Bruce", "Alice"];
const countedNames = names.reduce((allNames, name) => {
  const currCount = Object.hasOwn(allNames, name) ? allNames[name] : 0;
  return {
    ...allNames,
    [name]: currCount + 1,
  };
}, {});
```

This code is ill-performing, because each iteration has to copy the entire `allNames` object, which could be big, depending how many unique names there are. This code has worst-case `O(N^2)` performance, where `N` is the length of `names`.

A better alternative is to _mutate_ the `allNames` object on each iteration. However, if `allNames` gets mutated anyway, you may want to convert the `reduce()` to a `for` loop instead, which is much clearer:

```js
const names = ["Alice", "Bob", "Tiff", "Bruce", "Alice"];
const countedNames = names.reduce((allNames, name) => {
  const currCount = allNames[name] ?? 0;
  allNames[name] = currCount + 1;
  // return allNames, otherwise the next iteration receives undefined
  return allNames;
}, Object.create(null));
```

```js
const names = ["Alice", "Bob", "Tiff", "Bruce", "Alice"];
const countedNames = Object.create(null);
for (const name of names) {
  const currCount = countedNames[name] ?? 0;
  countedNames[name] = currCount + 1;
}
```

Therefore, if your accumulator is an array or an object and you are copying the array or object on each iteration, you may accidentally introduce quadratic complexity into your code, causing performance to quickly degrade on large data. This has happened in real-world code — see for example [Making Tanstack Table 1000x faster with a 1 line change](https://jpcamara.com/2023/03/07/making-tanstack-table.html).

Some of the acceptable use cases of `reduce()` are given above (most notably, summing an array, promise sequencing, and function piping). There are other cases where better alternatives than `reduce()` exist.

- Flattening an array of arrays. Use `flat()` instead.

  ```js
  const flattened = array.reduce((acc, cur) => acc.concat(cur), []);
  ```

  ```js
  const flattened = array.flat();
  ```

- Grouping objects by a property. Use `Object.groupBy()` instead.

  ```js
  const groups = array.reduce((acc, obj) => {
    const key = obj.name;
    const curGroup = acc[key] ?? [];
    return { ...acc, [key]: [...curGroup, obj] };
  }, {});
  ```

  ```js
  const groups = Object.groupBy(array, (obj) => obj.name);
  ```

- Concatenating arrays contained in an array of objects. Use `flatMap()` instead.

  ```js
  const friends = [
    { name: "Anna", books: ["Bible", "Harry Potter"] },
    { name: "Bob", books: ["War and peace", "Romeo and Juliet"] },
    { name: "Alice", books: ["The Lord of the Rings", "The Shining"] },
  ];
  const allBooks = friends.reduce((acc, cur) => [...acc, ...cur.books], []);
  ```

  ```js
  const allBooks = friends.flatMap((person) => person.books);
  ```

- Removing duplicate items in an array. Use `Set` and `Array.from()` instead.

  ```js
  const uniqArray = array.reduce(
    (acc, cur) => (acc.includes(cur) ? acc : [...acc, cur]),
    [],
  );
  ```

  ```js
  const uniqArray = Array.from(new Set(array));
  ```

- Eliminating or adding elements in an array. Use `flatMap()` instead.

  ```js
  // Takes an array of numbers and splits perfect squares into its square roots
  const roots = array.reduce((acc, cur) => {
    if (cur < 0) return acc;
    const root = Math.sqrt(cur);
    if (Number.isInteger(root)) return [...acc, root, root];
    return [...acc, cur];
  }, []);
  ```

  ```js
  const roots = array.flatMap((val) => {
    if (val < 0) return [];
    const root = Math.sqrt(val);
    if (Number.isInteger(root)) return [root, root];
    return [val];
  });
  ```

  If you are only eliminating elements from an array, you also can use `filter()`.

- Searching for elements or testing if elements satisfy a condition. Use `find()` and `findIndex()`, or `some()` and `every()` instead. These methods have the additional benefit that they return as soon as the result is certain, without iterating the entire array.

  ```js
  const allEven = array.reduce((acc, cur) => acc && cur % 2 === 0, true);
  ```

  ```js
  const allEven = array.every((val) => val % 2 === 0);
  ```

In cases where `reduce()` is the best choice, documentation and semantic variable naming can help mitigate readability drawbacks.

## The Array sort() Method

> **Source:** [Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/array-methods)

The **`sort()`** method of `Array` instances sorts the elements of an array _[in place](https://en.wikipedia.org/wiki/In-place_algorithm)_ and returns the reference to the same array, now sorted. The default sort order is ascending, built upon converting the elements into strings, then comparing their sequences of UTF-16 code unit values.

The time and space complexity of the sort cannot be guaranteed as it depends on the
implementation.

To sort the elements in an array without mutating the original array, use `toSorted()`.

```js
const months = ["March", "Jan", "Feb", "Dec"];
months.sort();
console.log(months);
// Expected output: Array ["Dec", "Feb", "Jan", "March"]

const array = [1, 30, 4, 21, 100000];
array.sort();
console.log(array);
// Expected output: Array [1, 100000, 21, 30, 4]
```

### Syntax

```js
sort()
sort(compareFn)
```

#### Parameters

- `compareFn`
  - : A function that determines the order of the elements. The function is called with the following arguments:
    - `a`
      - : The first element for comparison. Will never be `undefined`.
    - `b`
      - : The second element for comparison. Will never be `undefined`.

    It should return a number where:
    - A negative value indicates that `a` should come before `b`.
    - A positive value indicates that `a` should come after `b`.
    - Zero or `NaN` indicates that `a` and `b` are considered equal.

    To memorize this, remember that `(a, b) => a - b` sorts numbers in ascending order.

    If omitted, the array elements are converted to strings, then sorted according to each character's Unicode code point value.

#### Return value

The reference to the original array, now sorted. Note that the array is sorted _[in place](https://en.wikipedia.org/wiki/In-place_algorithm)_, and no copy is made.

### Description

If `compareFn` is not supplied, all non-`undefined` array
elements are sorted by converting them to strings and comparing strings in UTF-16 code
units order. For example, "banana" comes before "cherry". In a numeric sort, 9 comes
before 80, but because numbers are converted to strings, "80" comes before "9" in the
Unicode order. All `undefined` elements are sorted to the end of the array.

The `sort()` method preserves empty slots. If the source array is [sparse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#sparse_arrays), the empty slots are moved to the end of the array, and always come after all the `undefined`.

> **Note:**
> In UTF-16, Unicode characters above `\uFFFF` are
> encoded as two surrogate code units, of the range
> `\uD800` - `\uDFFF`. The value of each code unit is taken
> separately into account for the comparison. Thus the character formed by the surrogate
> pair `\uD855\uDE51` will be sorted before the character
> `\uFF3A`.

If `compareFn` is supplied, all non-`undefined` array
elements are sorted according to the return value of the compare function (all
`undefined` elements are sorted to the end of the array, with no call to
`compareFn`).

| `compareFn(a, b)` return value | sort order                          |
| ------------------------------ | ----------------------------------- |
| > 0                            | sort `a` after `b`, e.g., `[b, a]`  |
| < 0                            | sort `a` before `b`, e.g., `[a, b]` |
| === 0                          | keep original order of `a` and `b`  |

So, the compare function has the following form:

```js
function compareFn(a, b) {
  if (a is less than b by some ordering criterion) {
    return -1;
  } else if (a is greater than b by the ordering criterion) {
    return 1;
  }
  // a must be equal to b
  return 0;
}
```

More formally, the comparator is expected to have the following properties, in order to ensure proper sort behavior:

- _Pure_: The comparator does not mutate the objects being compared or any external state. (This is important because there's no guarantee _when_ and _how_ the comparator will be called, so any particular call should not produce visible effects to the outside.)
- _Stable_: The comparator returns the same result with the same pair of input.
- _Reflexive_: `compareFn(a, a) === 0`.
- _Anti-symmetric_: `compareFn(a, b)` and `compareFn(b, a)` must both be `0` or have opposite signs.
- _Transitive_: If `compareFn(a, b)` and `compareFn(b, c)` are both positive, zero, or negative, then `compareFn(a, c)` has the same positivity as the previous two.

A comparator conforming to the constraints above will always be able to return all of `1`, `0`, and `-1`, or consistently return `0`. For example, if a comparator only returns `1` and `0`, or only returns `0` and `-1`, it will not be able to sort reliably because _anti-symmetry_ is broken. A comparator that always returns `0` will cause the array to not be changed at all, but is reliable nonetheless.

The default lexicographic comparator satisfies all constraints above.

To compare numbers instead of strings, the compare function can subtract `b`
from `a`. The following function will sort the array in ascending order (if
it doesn't contain `NaN`):

```js
function compareNumbers(a, b) {
  return a - b;
}
```

The `sort()` method is [generic](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#generic_array_methods). It only expects the `this` value to have a `length` property and integer-keyed properties. Although strings are also array-like, this method is not suitable to be applied on them, as strings are immutable.

### Examples

#### Creating, displaying, and sorting an array

The following example creates four arrays and displays the original array, then the
sorted arrays. The numeric arrays are sorted without a compare function, then sorted
using one.

```js
const stringArray = ["Blue", "Humpback", "Beluga"];
const numberArray = [40, 1, 5, 200];
const numericStringArray = ["80", "9", "700"];
const mixedNumericArray = ["80", "9", "700", 40, 1, 5, 200];

function compareNumbers(a, b) {
  return a - b;
}

stringArray.join(); // 'Blue,Humpback,Beluga'
stringArray.sort(); // ['Beluga', 'Blue', 'Humpback']

numberArray.join(); // '40,1,5,200'
numberArray.sort(); // [1, 200, 40, 5]
numberArray.sort(compareNumbers); // [1, 5, 40, 200]

numericStringArray.join(); // '80,9,700'
numericStringArray.sort(); // ['700', '80', '9']
numericStringArray.sort(compareNumbers); // ['9', '80', '700']

mixedNumericArray.join(); // '80,9,700,40,1,5,200'
mixedNumericArray.sort(); // [1, 200, 40, 5, '700', '80', '9']
mixedNumericArray.sort(compareNumbers); // [1, 5, '9', 40, '80', 200, '700']
```

#### Sorting array of objects

Arrays of objects can be sorted by comparing the value of one of their properties.

```js
const items = [
  { name: "Edward", value: 21 },
  { name: "Sharpe", value: 37 },
  { name: "And", value: 45 },
  { name: "The", value: -12 },
  { name: "Magnetic", value: 13 },
  { name: "Zeros", value: 37 },
];

// sort by value
items.sort((a, b) => a.value - b.value);

// sort by name
items.sort((a, b) => {
  const nameA = a.name.toUpperCase(); // ignore upper and lowercase
  const nameB = b.name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  // names must be equal
  return 0;
});
```

#### Sorting non-ASCII characters

For sorting strings with non-ASCII characters, i.e., strings with accented characters
(e, é, è, a, ä, etc.), strings from languages other than English, use
`String.prototype.localeCompare()`. This function can compare those characters so they
appear in the right order.

```js
const items = ["réservé", "premier", "communiqué", "café", "adieu", "éclair"];
items.sort((a, b) => a.localeCompare(b));

// items is ['adieu', 'café', 'communiqué', 'éclair', 'premier', 'réservé']
```

#### Sorting with map

The `compareFn` can be invoked multiple times per element within the
array. Depending on the `compareFn`'s nature, this may yield a high
overhead. The more work a `compareFn` does and the more elements there
are to sort, it may be more efficient to use [`map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) for
sorting. The idea is to traverse the array once to extract the actual values used for
sorting into a temporary array, sort the temporary array, and then traverse the
temporary array to achieve the right order.

```js
// the array to be sorted
const data = ["delta", "alpha", "charlie", "bravo"];

// temporary array holds objects with position and sort-value
const mapped = data.map((v, i) => ({ i, value: someSlowOperation(v) }));

// sorting the mapped array containing the reduced values
mapped.sort((a, b) => {
  if (a.value > b.value) {
    return 1;
  }
  if (a.value < b.value) {
    return -1;
  }
  return 0;
});

const result = mapped.map((v) => data[v.i]);
```

There is an open source library available called [mapsort](https://github.com/Pimm/mapsort) which applies this approach.

#### sort() returns the reference to the same array

The `sort()` method returns a reference to the original array, so mutating the returned array will mutate the original array as well.

```js
const numbers = [3, 1, 4, 1, 5];
const sorted = numbers.sort((a, b) => a - b);
// numbers and sorted are both [1, 1, 3, 4, 5]
sorted[0] = 10;
console.log(numbers[0]); // 10
```

In case you want `sort()` to not mutate the original array, but return a [shallow-copied](https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy) array like other array methods (e.g., [`map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)) do, use the `toSorted()` method. Alternatively, you can do a shallow copy before calling `sort()`, using the [spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) or [`Array.from()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from).

```js
const numbers = [3, 1, 4, 1, 5];
// [...numbers] creates a shallow copy, so sort() does not mutate the original
const sorted = [...numbers].sort((a, b) => a - b);
sorted[0] = 10;
console.log(numbers[0]); // 3
```

#### Sort stability

Since version 10 (or ECMAScript 2019), the specification dictates that `Array.prototype.sort` is stable.

For example, say you had a list of students alongside their grades. Note that the list of students is already pre-sorted by name in alphabetical order:

```js
const students = [
  { name: "Alex", grade: 15 },
  { name: "Devlin", grade: 15 },
  { name: "Eagle", grade: 13 },
  { name: "Sam", grade: 14 },
];
```

After sorting this array by `grade` in ascending order:

```js
students.sort((firstItem, secondItem) => firstItem.grade - secondItem.grade);
```

The `students` variable will then have the following value:

```js
[
  { name: "Eagle", grade: 13 },
  { name: "Sam", grade: 14 },
  { name: "Alex", grade: 15 }, // original maintained for similar grade (stable sorting)
  { name: "Devlin", grade: 15 }, // original maintained for similar grade (stable sorting)
];
```

It's important to note that students that have the same grade (for example, Alex and Devlin), will remain in the same order as before calling the sort. This is what a stable sorting algorithm guarantees.

Before version 10 (or ECMAScript 2019), sort stability was not guaranteed, meaning that you could end up with the following:

```js
[
  { name: "Eagle", grade: 13 },
  { name: "Sam", grade: 14 },
  { name: "Devlin", grade: 15 }, // original order not maintained
  { name: "Alex", grade: 15 }, // original order not maintained
];
```

#### Sorting with non-well-formed comparator

If a comparing function does not satisfy all of purity, stability, reflexivity, anti-symmetry, and transitivity rules, as explained in the [description](#description), the program's behavior is not well-defined.

For example, consider this code:

```js
const arr = [3, 1, 4, 1, 5, 9];
const compareFn = (a, b) => (a > b ? 1 : 0);
arr.sort(compareFn);
```

The `compareFn` function here is not well-formed, because it does not satisfy anti-symmetry: if `a > b`, it returns `1`; but by swapping `a` and `b`, it returns `0` instead of a negative value. Therefore, the resulting array will be different across engines. For example, V8 (used by Chrome, Node.js, etc.) and JavaScriptCore (used by Safari) would not sort the array at all and return `[3, 1, 4, 1, 5, 9]`, while SpiderMonkey (used by Firefox) will return the array sorted ascendingly, as `[1, 1, 3, 4, 5, 9]`.

However, if the `compareFn` function is changed slightly so that it returns `-1` or `0`:

```js
const arr = [3, 1, 4, 1, 5, 9];
const compareFn = (a, b) => (a > b ? -1 : 0);
arr.sort(compareFn);
```

Then V8 and JavaScriptCore sorts it descendingly, as `[9, 5, 4, 3, 1, 1]`, while SpiderMonkey returns it as-is: `[3, 1, 4, 1, 5, 9]`.

Due to this implementation inconsistency, you are always advised to make your comparator well-formed by following the five constraints.

#### Using sort() on sparse arrays

Empty slots are moved to the end of the array.

```js
console.log(["a", "c", , "b"].sort()); // ['a', 'b', 'c', empty]
console.log([, undefined, "a", "b"].sort()); // ["a", "b", undefined, empty]
```

#### Calling sort() on non-array objects

The `sort()` method reads the `length` property of `this`. It then collects all existing integer-keyed properties in the range of `0` to `length - 1`, sorts them, and writes them back. If there are missing properties in the range, the corresponding trailing properties are [deleted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete), as if the non-existent properties are sorted towards the end.

```js
const arrayLike = {
  length: 3,
  unrelated: "foo",
  0: 5,
  2: 4,
};
console.log(Array.prototype.sort.call(arrayLike));
// { '0': 4, '1': 5, length: 3, unrelated: 'foo' }
```

## Working with Immutable Arrays

> **Source:** [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), [Array.prototype.toSorted()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/object-copy)

### Array

Some methods do not mutate the existing array that the method was called on, but instead return a new array. They do so by first constructing a new array and then populating it with elements. The copy always happens [_shallowly_](https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy) — the method never copies anything beyond the initially created array. Elements of the original array(s) are copied into the new array as follows:

- Objects: the object reference is copied into the new array. Both the original and new array refer to the same object. That is, if a referenced object is modified, the changes are visible to both the new and original arrays.
- Primitive types such as strings, numbers and booleans (not `String`, `Number`, and `Boolean` objects): their values are copied into the new array.

Other methods mutate the array that the method was called on, in which case their return value differs depending on the method: sometimes a reference to the same array, sometimes the length of the new array.

The following methods create new arrays by accessing [`this.constructor[Symbol.species]`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Symbol.species) to determine the constructor to use: `concat()`, `filter()`, `flat()`, `flatMap()`, `map()`, `slice()`, and `splice()` (to construct the array of removed elements that's returned).

The following methods always create new arrays with the `Array` base constructor: `toReversed()`, `toSorted()`, `toSpliced()`, and `with()`.

The following table lists the methods that mutate the original array, and the corresponding non-mutating alternative:

| Mutating method                                | Non-mutating alternative                                 |
| ---------------------------------------------- | -------------------------------------------------------- |
| `copyWithin()` | No one-method alternative                                |
| `fill()`             | No one-method alternative                                |
| `pop()`               | `slice(0, -1)`                |
| `push(v1, v2)`       | `concat([v1, v2])`           |
| `reverse()`       | `toReversed()`           |
| `shift()`           | `slice(1)`                    |
| `sort()`             | `toSorted()`               |
| `splice()`         | `toSpliced()`             |
| `unshift(v1, v2)` | `toSpliced(0, 0, v1, v2)` |

An easy way to change a mutating method into a non-mutating alternative is to use the [spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) or `slice()` to create a copy first:

```js
arr.copyWithin(0, 1, 2); // mutates arr
const arr2 = arr.slice().copyWithin(0, 1, 2); // does not mutate arr
const arr3 = [...arr].copyWithin(0, 1, 2); // does not mutate arr
```

### Array.prototype.toSorted()

The **`toSorted()`** method of `Array` instances is the [copying](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods) version of the `sort()` method. It returns a new array with the elements sorted in ascending order.

#### Syntax

```js
toSorted()
toSorted(compareFn)
```

##### Parameters

- `compareFn`
  - : A function that determines the order of the elements. If omitted, the array elements are converted to strings, then sorted according to each character's Unicode code point value. See `sort()` for more information.

##### Return value

A new array with the elements sorted in ascending order.

#### Description

See `sort()` for more information on the `compareFn` parameter.

When used on [sparse arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#sparse_arrays), the `toSorted()` method iterates empty slots as if they have the value `undefined`.

The `toSorted()` method is [generic](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#generic_array_methods). It only expects the `this` value to have a `length` property and integer-keyed properties.

#### Examples

##### Sorting an array

```js
const months = ["Mar", "Jan", "Feb", "Dec"];
const sortedMonths = months.toSorted();
console.log(sortedMonths); // ['Dec', 'Feb', 'Jan', 'Mar']
console.log(months); // ['Mar', 'Jan', 'Feb', 'Dec']

const values = [1, 10, 21, 2];
const sortedValues = values.toSorted((a, b) => a - b);
console.log(sortedValues); // [1, 2, 10, 21]
console.log(values); // [1, 10, 21, 2]
```

For more usage examples, see `sort()`.

##### Using toSorted() on sparse arrays

Empty slots are sorted as if they have the value `undefined`. They are always sorted to the end of the array and `compareFn` is not called for them.

```js
console.log(["a", "c", , "b"].toSorted()); // ['a', 'b', 'c', undefined]
console.log([, undefined, "a", "b"].toSorted()); // ["a", "b", undefined, undefined]
```

##### Calling toSorted() on non-array objects

The `toSorted()` method reads the `length` property of `this`. It then collects all existing integer-keyed properties in the range of `0` to `length - 1`, sorts them, and writes them into a new array.

```js
const arrayLike = {
  length: 3,
  unrelated: "foo",
  0: 5,
  2: 4,
  3: 3, // ignored by toSorted() since length is 3
};
console.log(Array.prototype.toSorted.call(arrayLike));
// [4, 5, undefined]
```

## Asynchronous JavaScript: Promises

> **Source:** [Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/promise-basics)

A `Promise` is an object representing the eventual completion or failure of an asynchronous operation. Since most people are consumers of already-created promises, this guide will explain consumption of returned promises before explaining how to create them.

Essentially, a promise is a returned object to which you attach callbacks, instead of passing callbacks into a function. Imagine a function, `createAudioFileAsync()`, which asynchronously generates a sound file given a configuration record and two callback functions: one called if the audio file is successfully created, and the other called if an error occurs.

Here's some code that uses `createAudioFileAsync()`:

```js
function successCallback(result) {
  console.log(`Audio file ready at URL: ${result}`);
}

function failureCallback(error) {
  console.error(`Error generating audio file: ${error}`);
}

createAudioFileAsync(audioSettings, successCallback, failureCallback);
```

If `createAudioFileAsync()` were rewritten to return a promise, you would attach your callbacks to it instead:

```js
createAudioFileAsync(audioSettings).then(successCallback, failureCallback);
```

This convention has several advantages. We will explore each one.

### Chaining

A common need is to execute two or more asynchronous operations back to back, where each subsequent operation starts when the previous operation succeeds, with the result from the previous step. In the old days, doing several asynchronous operations in a row would lead to the classic [callback hell](https://medium.com/@raihan_tazdid/callback-hell-in-javascript-all-you-need-to-know-296f7f5d3c1):

```js
doSomething(function (result) {
  doSomethingElse(result, function (newResult) {
    doThirdThing(newResult, function (finalResult) {
      console.log(`Got the final result: ${finalResult}`);
    }, failureCallback);
  }, failureCallback);
}, failureCallback);
```

With promises, we accomplish this by creating a promise chain. The API design of promises makes this great, because callbacks are attached to the returned promise object, instead of being passed into a function.

Here's the magic: the `then()` function returns a **new promise**, different from the original:

```js
const promise = doSomething();
const promise2 = promise.then(successCallback, failureCallback);
```

This second promise (`promise2`) represents the completion not just of `doSomething()`, but also of the `successCallback` or `failureCallback` you passed in — which can be other asynchronous functions returning a promise. When that's the case, any callbacks added to `promise2` get queued behind the promise returned by either `successCallback` or `failureCallback`.

> **Note:**
> If you want a working example to play with, you can use the following template to create any function returning a promise:
>
> ```js
> function doSomething() {
>   return new Promise((resolve) => {
>     setTimeout(() => {
>       // Other things to do before completion of the promise
>       console.log("Did something");
>       // The fulfillment value of the promise
>       resolve("https://example.com/");
>     }, 200);
>   });
> }
> ```
>
> The implementation is discussed in the [Creating a Promise around an old callback API](#creating_a_promise_around_an_old_callback_api) section below.

With this pattern, you can create longer chains of processing, where each promise represents the completion of one asynchronous step in the chain. In addition, the arguments to `then` are optional, and `catch(failureCallback)` is short for `then(null, failureCallback)` — so if your error handling code is the same for all steps, you can attach it to the end of the chain:

```js
doSomething()
  .then(function (result) {
    return doSomethingElse(result);
  })
  .then(function (newResult) {
    return doThirdThing(newResult);
  })
  .then(function (finalResult) {
    console.log(`Got the final result: ${finalResult}`);
  })
  .catch(failureCallback);
```

You might see this expressed with [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) instead:

```js
doSomething()
  .then((result) => doSomethingElse(result))
  .then((newResult) => doThirdThing(newResult))
  .then((finalResult) => {
    console.log(`Got the final result: ${finalResult}`);
  })
  .catch(failureCallback);
```

> **Note:**
> Arrow function expressions can have an [implicit return](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#function_body); so, `() => x` is short for `() => { return x; }`.

`doSomethingElse` and `doThirdThing` can return any value — if they return promises, that promise is first waited until it settles, and the next callback receives the fulfillment value, not the promise itself. It is important to always return promises from `then` callbacks, even if the promise always resolves to `undefined`. If the previous handler started a promise but did not return it, there's no way to track its settlement anymore, and the promise is said to be "floating".

```js
doSomething()
  .then((url) => {
    // Missing `return` keyword in front of fetch(url).
    fetch(url);
  })
  .then((result) => {
    // result is undefined, because nothing is returned from the previous
    // handler. There's no way to know the return value of the fetch()
    // call anymore, or whether it succeeded at all.
  });
```

By returning the result of the `fetch` call (which is a promise), we can both track its completion and receive its value when it completes.

```js
doSomething()
  .then((url) => {
    // `return` keyword added
    return fetch(url);
  })
  .then((result) => {
    // result is a Response object
  });
```

Floating promises could be worse if you have race conditions — if the promise from the last handler is not returned, the next `then` handler will be called early, and any value it reads may be incomplete.

```js
const listOfIngredients = [];

doSomething()
  .then((url) => {
    // Missing `return` keyword in front of fetch(url).
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        listOfIngredients.push(data);
      });
  })
  .then(() => {
    console.log(listOfIngredients);
    // listOfIngredients will always be [], because the fetch request hasn't completed yet.
  });
```

Therefore, as a rule of thumb, whenever your operation encounters a promise, return it and defer its handling to the next `then` handler.

```js
const listOfIngredients = [];

doSomething()
  .then((url) => {
    // `return` keyword now included in front of fetch call.
    return fetch(url)
      .then((res) => res.json())
      .then((data) => {
        listOfIngredients.push(data);
      });
  })
  .then(() => {
    console.log(listOfIngredients);
    // listOfIngredients will now contain data from fetch call.
  });
```

Even better, you can flatten the nested chain into a single chain, which is simpler and makes error handling easier. The details are discussed in the [Nesting](#nesting) section below.

```js
doSomething()
  .then((url) => fetch(url))
  .then((res) => res.json())
  .then((data) => {
    listOfIngredients.push(data);
  })
  .then(() => {
    console.log(listOfIngredients);
  });
```

Using [`async`/`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) can help you write code that's more intuitive and resembles synchronous code. Below is the same example using `async`/`await`:

```js
async function logIngredients() {
  const url = await doSomething();
  const res = await fetch(url);
  const data = await res.json();
  listOfIngredients.push(data);
  console.log(listOfIngredients);
}
```

Note how the code looks exactly like synchronous code, except for the `await` keywords in front of promises. One of the only tradeoffs is that it may be easy to forget the [`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) keyword, which can only be fixed when there's a type mismatch (e.g., trying to use a promise as a value).

`async`/`await` builds on promises — for example, `doSomething()` is the same function as before, so there's minimal refactoring needed to change from promises to `async`/`await`. You can read more about the `async`/`await` syntax in the [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) and [`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) references.

> **Note:**
> `async`/`await` has the same concurrency semantics as normal promise chains. `await` within one async function does not stop the entire program, only the parts that depend on its value, so other async jobs can still run while the `await` is pending.

### Error handling

You might recall seeing `failureCallback` three times in the pyramid of doom earlier, compared to only once at the end of the promise chain:

```js
doSomething()
  .then((result) => doSomethingElse(result))
  .then((newResult) => doThirdThing(newResult))
  .then((finalResult) => console.log(`Got the final result: ${finalResult}`))
  .catch(failureCallback);
```

If there's an exception, the browser will look down the chain for `.catch()` handlers or `onRejected`. This is very much modeled after how synchronous code works:

```js
try {
  const result = syncDoSomething();
  const newResult = syncDoSomethingElse(result);
  const finalResult = syncDoThirdThing(newResult);
  console.log(`Got the final result: ${finalResult}`);
} catch (error) {
  failureCallback(error);
}
```

This symmetry with asynchronous code culminates in the `async`/`await` syntax:

```js
async function foo() {
  try {
    const result = await doSomething();
    const newResult = await doSomethingElse(result);
    const finalResult = await doThirdThing(newResult);
    console.log(`Got the final result: ${finalResult}`);
  } catch (error) {
    failureCallback(error);
  }
}
```

Promises solve a fundamental flaw with the callback pyramid of doom, by catching all errors, even thrown exceptions and programming errors. This is essential for functional composition of asynchronous operations. All errors are now handled by the [`catch()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) method at the end of the chain, and you should almost never need to use `try`/`catch` without using `async`/`await`.

#### Nesting

In the examples above involving `listOfIngredients`, the first one has one promise chain nested in the return value of another `then()` handler, while the second one uses an entirely flat chain. Simple promise chains are best kept flat without nesting, as nesting can be a result of careless composition.

Nesting is a control structure to limit the scope of `catch` statements. Specifically, a nested `catch` only catches failures in its scope and below, not errors higher up in the chain outside the nested scope. When used correctly, this gives greater precision in error recovery:

```js
doSomethingCritical()
  .then((result) =>
    doSomethingOptional(result)
      .then((optionalResult) => doSomethingExtraNice(optionalResult))
      .catch((e) => {}),
  ) // Ignore if optional stuff fails; proceed.
  .then(() => moreCriticalStuff())
  .catch((e) => console.error(`Critical failure: ${e.message}`));
```

Note that the optional steps here are nested — with the nesting caused not by the indentation, but by the placement of the outer `(` and `)` parentheses around the steps.

The inner error-silencing `catch` handler only catches failures from `doSomethingOptional()` and `doSomethingExtraNice()`, after which the code resumes with `moreCriticalStuff()`. Importantly, if `doSomethingCritical()` fails, its error is caught by the final (outer) `catch` only, and does not get swallowed by the inner `catch` handler.

In `async`/`await`, this code looks like:

```js
async function main() {
  try {
    const result = await doSomethingCritical();
    try {
      const optionalResult = await doSomethingOptional(result);
      await doSomethingExtraNice(optionalResult);
    } catch (e) {
      // Ignore failures in optional steps and proceed.
    }
    await moreCriticalStuff();
  } catch (e) {
    console.error(`Critical failure: ${e.message}`);
  }
}
```

> **Note:**
> If you don't have sophisticated error handling, you very likely don't need nested `then` handlers. Instead, use a flat chain and put the error handling logic at the end.

#### Chaining after a catch

It's possible to chain _after_ a failure, i.e., a `catch`, which is useful to accomplish new actions even after an action failed in the chain. Read the following example:

```js
doSomething()
  .then(() => {
    throw new Error("Something failed");

    console.log("Do this");
  })
  .catch(() => {
    console.error("Do that");
  })
  .then(() => {
    console.log("Do this, no matter what happened before");
  });
```

This will output the following text:

```plain
Do that
Do this, no matter what happened before
```

> **Note:**
> The text "Do this" is not displayed because the "Something failed" error caused a rejection.

In `async`/`await`, this code looks like:

```js
async function main() {
  try {
    await doSomething();
    throw new Error("Something failed");
    console.log("Do this");
  } catch (e) {
    console.error("Do that");
  }
  console.log("Do this, no matter what happened before");
}
```

#### Promise rejection events

If a promise rejection event is not handled by any handler, it bubbles to the top of the call stack, and the host needs to surface it. On the web, whenever a promise is rejected, one of two events is sent to the global scope (generally, this is either the [`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) or, if being used in a web worker, it's the [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker) or other worker-based interface). The two events are:

- [`unhandledrejection`](https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event)
  - : Sent when a promise is rejected but there is no rejection handler available.
- [`rejectionhandled`](https://developer.mozilla.org/en-US/docs/Web/API/Window/rejectionhandled_event)
  - : Sent when a handler is attached to a rejected promise that has already caused an `unhandledrejection` event.

In both cases, the event (of type [`PromiseRejectionEvent`](https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent)) has as members a [`promise`](https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent/promise) property indicating the promise that was rejected, and a [`reason`](https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent/reason) property that provides the reason given for the promise to be rejected.

These make it possible to offer fallback error handling for promises, as well as to help debug issues with your promise management. These handlers are global per context, so all errors will go to the same event handlers, regardless of source.

In [Node.js](https://developer.mozilla.org/en-US/docs/Glossary/Node.js), handling promise rejection is slightly different. You capture unhandled rejections by adding a handler for the Node.js `unhandledRejection` event (notice the difference in capitalization of the name), like this:

```js
process.on("unhandledRejection", (reason, promise) => {
  // Add code here to examine the "promise" and "reason" values
});
```

For Node.js, to prevent the error from being logged to the console (the default action that would otherwise occur), adding that `process.on()` listener is all that's necessary; there's no need for an equivalent of the browser runtime's [`preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) method.

However, if you add that `process.on` listener but don't also have code within it to handle rejected promises, they will just be dropped on the floor and silently ignored. So ideally, you should add code within that listener to examine each rejected promise and make sure it was not caused by an actual code bug.

### Composition

There are four [composition tools](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#promise_concurrency) for running asynchronous operations concurrently: `Promise.all()`, `Promise.allSettled()`, `Promise.any()`, and `Promise.race()`.

We can start operations at the same time and wait for them all to finish like this:

```js
Promise.all([func1(), func2(), func3()]).then(([result1, result2, result3]) => {
  // use result1, result2 and result3
});
```

If one of the promises in the array rejects, `Promise.all()` immediately rejects the returned promise. The other operations continue to run, but their outcomes are not available via the return value of `Promise.all()`. This may cause unexpected state or behavior. `Promise.allSettled()` is another composition tool that ensures all operations are complete before resolving.

These methods all run promises concurrently — a sequence of promises are started simultaneously and do not wait for each other. Sequential composition is possible using some clever JavaScript:

```js
[func1, func2, func3]
  .reduce((p, f) => p.then(f), Promise.resolve())
  .then((result3) => {
    /* use result3 */
  });
```

In this example, we [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) an array of asynchronous functions down to a promise chain. The code above is equivalent to:

```js
Promise.resolve()
  .then(func1)
  .then(func2)
  .then(func3)
  .then((result3) => {
    /* use result3 */
  });
```

This can be made into a reusable compose function, which is common in functional programming:

```js
const applyAsync = (acc, val) => acc.then(val);
const composeAsync =
  (...funcs) =>
  (x) =>
    funcs.reduce(applyAsync, Promise.resolve(x));
```

The `composeAsync()` function accepts any number of functions as arguments and returns a new function that accepts an initial value to be passed through the composition pipeline:

```js
const transformData = composeAsync(func1, func2, func3);
const result3 = transformData(data);
```

Sequential composition can also be done more succinctly with async/await:

```js
let result;
for (const f of [func1, func2, func3]) {
  result = await f(result);
}
/* use last result (i.e. result3) */
```

However, before you compose promises sequentially, consider if it's really necessary — it's always better to run promises concurrently so that they don't unnecessarily block each other unless one promise's execution depends on another's result.

### Cancellation

`Promise` itself has no first-class protocol for cancellation, but you may be able to directly cancel the underlying asynchronous operation, typically using [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

### Creating a Promise around an old callback API

A `Promise` can be created from scratch using its [constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise). This should be needed only to wrap old APIs.

In an ideal world, all asynchronous functions would already return promises. Unfortunately, some APIs still expect success and/or failure callbacks to be passed in the old way. The most obvious example is the `setTimeout()` function:

```js
setTimeout(() => saySomething("10 seconds passed"), 10 * 1000);
```

Mixing old-style callbacks and promises is problematic. If `saySomething()` fails or contains a programming error, nothing catches it. This is intrinsic to the design of `setTimeout()`.

Luckily we can wrap `setTimeout()` in a promise. The best practice is to wrap the callback-accepting functions at the lowest possible level, and then never call them directly again:

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

wait(10 * 1000)
  .then(() => saySomething("10 seconds"))
  .catch(failureCallback);
```

The promise constructor takes an executor function that lets us resolve or reject a promise manually. Since `setTimeout()` doesn't really fail, we left out reject in this case. For more information on how the executor function works, see the [`Promise()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise) reference.

### Timing

Lastly, we will look into the more technical details, about when the registered callbacks get called.

#### Guarantees

In the callback-based API, when and how the callback gets called depends on the API implementor. For example, the callback may be called synchronously or asynchronously:

```js
function doSomething(callback) {
  if (Math.random() > 0.5) {
    callback();
  } else {
    setTimeout(() => callback(), 1000);
  }
}
```

The above design is strongly discouraged because it leads to the so-called "state of Zalgo". In the context of designing asynchronous APIs, this means a callback is called synchronously in some cases but asynchronously in other cases, creating ambiguity for the caller. For further background, see the article [Designing APIs for Asynchrony](https://blog.izs.me/2013/08/designing-apis-for-asynchrony/), where the term was first formally presented. This API design makes side effects hard to analyze:

```js
let value = 1;
doSomething(() => {
  value = 2;
});
console.log(value); // 1 or 2?
```

On the other hand, promises are a form of [inversion of control](https://en.wikipedia.org/wiki/Inversion_of_control) — the API implementor does not control when the callback gets called. Instead, the job of maintaining the callback queue and deciding when to call the callbacks is delegated to the promise implementation, and both the API user and API developer automatically get strong semantic guarantees, including:

- Callbacks added with [`then()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) will never be invoked before the [completion of the current run](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model#run-to-completion) of the JavaScript event loop.
- These callbacks will be invoked even if they were added _after_ the success or failure of the asynchronous operation that the promise represents.
- Multiple callbacks may be added by calling [`then()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) several times. They will be invoked one after another, in the order in which they were inserted.

To avoid surprises, functions passed to [`then()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) will never be called synchronously, even with an already-resolved promise:

```js
Promise.resolve().then(() => console.log(2));
console.log(1);
// Logs: 1, 2
```

Instead of running immediately, the passed-in function is put on a microtask queue, which means it runs later (only after the function which created it exits, and when the JavaScript execution stack is empty), just before control is returned to the event loop; i.e., pretty soon:

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

wait(0).then(() => console.log(4));
Promise.resolve()
  .then(() => console.log(2))
  .then(() => console.log(3));
console.log(1); // 1, 2, 3, 4
```

#### Task queues vs. microtasks

Promise callbacks are handled as a [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) whereas `setTimeout()` callbacks are handled as task queues.

```js
const promise = new Promise((resolve, reject) => {
  console.log("Promise callback");
  resolve();
}).then((result) => {
  console.log("Promise callback (.then)");
});

setTimeout(() => {
  console.log("event-loop cycle: Promise (fulfilled)", promise);
}, 0);

console.log("Promise (pending)", promise);
```

The code above will output:

```plain
Promise callback
Promise (pending) Promise {<pending>}
Promise callback (.then)
event-loop cycle: Promise (fulfilled) Promise {<fulfilled>}
```

For more details, refer to [Tasks vs. microtasks](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth#tasks_vs._microtasks).

#### When promises and tasks collide

If you run into situations in which you have promises and tasks (such as events or callbacks) which are firing in unpredictable orders, it's possible you may benefit from using a microtask to check status or balance out your promises when promises are created conditionally.

If you think microtasks may help solve this problem, see the [microtask guide](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) to learn more about how to use `queueMicrotask()` to enqueue a function as a microtask.

## Asynchronous JavaScript: async/await

> **Source:** [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/async-await)

The **`async function`** declaration creates a binding of a new async function to a given name. The `await` keyword is permitted within the function body, enabling asynchronous, promise-based behavior to be written in a cleaner style and avoiding the need to explicitly configure promise chains.

You can also define async functions using the [`async function` expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/async_function).

```js
function resolveAfter2Seconds() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, 2000);
  });
}

async function asyncCall() {
  console.log("calling");
  const result = await resolveAfter2Seconds();
  console.log(result);
  // Expected output: "resolved"
}

asyncCall();
```

### Syntax

```js
async function name(param0) {
  statements
}
async function name(param0, param1) {
  statements
}
async function name(param0, param1, /* …, */ paramN) {
  statements
}
```

> **Note:**
> There cannot be a line terminator between `async` and `function`, otherwise a semicolon is [automatically inserted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#automatic_semicolon_insertion), causing `async` to become an identifier and the rest to become a `function` declaration.

#### Parameters

- `name`
  - : The function's name.
- `param`
  - : The name of a formal parameter for the function. For the parameters' syntax, see the [Functions reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#function_parameters).
- `statements`
  - : The statements comprising the body of the function. The `await`
    mechanism may be used.

### Description

An `async function` declaration creates an `AsyncFunction` object. Each time when an async function is called, it returns a new `Promise` which will be resolved with the value returned by the async function, or rejected with an exception uncaught within the async function.

Async functions can contain zero or more `await` expressions. Await expressions make promise-returning functions behave as though they're synchronous by suspending execution until the returned promise is fulfilled or rejected. The resolved value of the promise is treated as the return value of the await expression. Use of `async` and `await` enables the use of ordinary `try` / `catch` blocks around asynchronous code.

> **Note:**
> The `await` keyword is only valid inside async functions within regular JavaScript code. If you use it outside of an async function's body, you will get a `SyntaxError`.
>
> `await` can be used on its own with [JavaScript modules.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

> **Note:**
> The purpose of `async`/`await` is to simplify the syntax
> necessary to consume promise-based APIs. The behavior
> of `async`/`await` is similar to combining [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators) and
> promises.

Async functions always return a promise. If the return value of an async function is
not explicitly a promise, it will be implicitly wrapped in a promise.

For example, consider the following code:

```js
async function foo() {
  return 1;
}
```

It is similar to:

```js
function foo() {
  return Promise.resolve(1);
}
```

Note that even though the return value of an async function behaves as if it's wrapped in a `Promise.resolve`, they are not equivalent. An async function will return a different _reference_, whereas `Promise.resolve` returns the same reference if the given value is a promise. It can be a problem when you want to check the equality of a promise and a return value of an async function.

```js
const p = new Promise((res, rej) => {
  res(1);
});

async function asyncReturn() {
  return p;
}

function basicReturn() {
  return Promise.resolve(p);
}

console.log(p === basicReturn()); // true
console.log(p === asyncReturn()); // false
```

The body of an async function can be thought of as being split by zero or more await
expressions. Top-level code, up to and including the first await expression (if there is
one), is run synchronously. In this way, an async function without an await expression
will run synchronously. If there is an await expression inside the function body,
however, the async function will always complete asynchronously.

For example:

```js
async function foo() {
  await 1;
}
```

It is also equivalent to:

```js
function foo() {
  return Promise.resolve(1).then(() => undefined);
}
```

Code after each await expression can be thought of as existing in a `.then`
callback. In this way a promise chain is progressively constructed with each reentrant
step through the function. The return value forms the final link in the chain.

In the following example, we successively await two promises. Progress moves through
function `foo` in three stages.

1. The first line of the body of function `foo` is executed synchronously,
   with the await expression configured with the pending promise. Progress through
   `foo` is then suspended and control is yielded back to the function that
   called `foo`.
2. Some time later, when the first promise has either been fulfilled or rejected,
   control moves back into `foo`. The result of the first promise fulfillment
   (if it was not rejected) is returned from the await expression. Here `1` is
   assigned to `result1`. Progress continues, and the second await expression
   is evaluated. Again, progress through `foo` is suspended and control is
   yielded.
3. Some time later, when the second promise has either been fulfilled or rejected,
   control re-enters `foo`. The result of the second promise resolution is
   returned from the second await expression. Here `2` is assigned to
   `result2`. Control moves to the return expression (if any). The default
   return value of `undefined` is returned as the resolution value of the
   current promise.

```js
async function foo() {
  const result1 = await new Promise((resolve) =>
    setTimeout(() => resolve("1")),
  );
  const result2 = await new Promise((resolve) =>
    setTimeout(() => resolve("2")),
  );
}
foo();
```

Note how the promise chain is not built-up in one go. Instead, the promise chain is
constructed in stages as control is successively yielded from and returned to the async
function. As a result, we must be mindful of error handling behavior when dealing with
concurrent asynchronous operations.

For example, in the following code an unhandled promise rejection error will be thrown,
even if a `.catch` handler has been configured further along the promise
chain. This is because `p2` will not be "wired into" the promise chain until
control returns from `p1`.

```js
async function foo() {
  const p1 = new Promise((resolve) => setTimeout(() => resolve("1"), 1000));
  const p2 = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("failed")), 500),
  );
  const results = [await p1, await p2]; // Do not do this! Use Promise.all or Promise.allSettled instead.
}
foo().catch(() => {}); // Attempt to swallow all errors...
```

`async function` declarations behave similar to `function` declarations — they are [hoisted](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting) to the top of their scope and can be called anywhere in their scope, and they can be redeclared only in certain contexts.

### Examples

#### Async functions and execution order

```js
function resolveAfter2Seconds() {
  console.log("starting slow promise");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("slow");
      console.log("slow promise is done");
    }, 2000);
  });
}

function resolveAfter1Second() {
  console.log("starting fast promise");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("fast");
      console.log("fast promise is done");
    }, 1000);
  });
}

async function sequentialStart() {
  console.log("== sequentialStart starts ==");

  // 1. Start a timer, log after it's done
  const slow = resolveAfter2Seconds();
  console.log(await slow);

  // 2. Start the next timer after waiting for the previous one
  const fast = resolveAfter1Second();
  console.log(await fast);

  console.log("== sequentialStart done ==");
}

async function sequentialWait() {
  console.log("== sequentialWait starts ==");

  // 1. Start two timers without waiting for each other
  const slow = resolveAfter2Seconds();
  const fast = resolveAfter1Second();

  // 2. Wait for the slow timer to complete, and then log the result
  console.log(await slow);
  // 3. Wait for the fast timer to complete, and then log the result
  console.log(await fast);

  console.log("== sequentialWait done ==");
}

async function concurrent1() {
  console.log("== concurrent1 starts ==");

  // 1. Start two timers concurrently and wait for both to complete
  const results = await Promise.all([
    resolveAfter2Seconds(),
    resolveAfter1Second(),
  ]);
  // 2. Log the results together
  console.log(results[0]);
  console.log(results[1]);

  console.log("== concurrent1 done ==");
}

async function concurrent2() {
  console.log("== concurrent2 starts ==");

  // 1. Start two timers concurrently, log immediately after each one is done
  await Promise.all([
    (async () => console.log(await resolveAfter2Seconds()))(),
    (async () => console.log(await resolveAfter1Second()))(),
  ]);
  console.log("== concurrent2 done ==");
}

sequentialStart(); // after 2 seconds, logs "slow", then after 1 more second, "fast"

// wait above to finish
setTimeout(sequentialWait, 4000); // after 2 seconds, logs "slow" and then "fast"

// wait again
setTimeout(concurrent1, 7000); // same as sequentialWait

// wait again
setTimeout(concurrent2, 10000); // after 1 second, logs "fast", then after 1 more second, "slow"
```

##### await and concurrency

In `sequentialStart`, execution suspends 2 seconds for the first
`await`, and then another second for the second `await`. The
second timer is not created until the first has already fired, so the code finishes
after 3 seconds.

In `sequentialWait`, both timers are created and then `await`ed.
The timers run concurrently, which means the code finishes in 2 rather than 3 seconds,
i.e., the slowest timer.
However, the `await` calls still run in series, which means the second
`await` will wait for the first one to finish. In this case, the result of
the fastest timer is processed after the slowest.

If you wish to safely perform other jobs after two or more jobs run concurrently and are complete, you must await a call
to `Promise.all()` or `Promise.allSettled()` before that job.

> **Warning:**
> The functions `sequentialWait` and `concurrent1`
> are not functionally equivalent.
>
> In `sequentialWait`, if promise `fast` rejects before promise
> `slow` is fulfilled, then an unhandled promise rejection error will be
> raised, regardless of whether the caller has configured a catch clause.
>
> In `concurrent1`, `Promise.all` wires up the promise
> chain in one go, meaning that the operation will fail-fast regardless of the order of
> rejection of the promises, and the error will always occur within the configured
> promise chain, enabling it to be caught in the normal way.

#### Rewriting a Promise chain with an async function

An API that returns a `Promise` will result in a promise chain, and it
splits the function into many parts. Consider the following code:

```js
function getProcessedData(url) {
  return downloadData(url) // returns a promise
    .catch((e) => downloadFallbackData(url)) // returns a promise
    .then((v) => processDataInWorker(v)); // returns a promise
}
```

it can be rewritten with a single async function as follows:

```js
async function getProcessedData(url) {
  let v;
  try {
    v = await downloadData(url);
  } catch (e) {
    v = await downloadFallbackData(url);
  }
  return processDataInWorker(v);
}
```

Alternatively, you can chain the promise with `catch()`:

```js
async function getProcessedData(url) {
  const v = await downloadData(url).catch((e) => downloadFallbackData(url));
  return processDataInWorker(v);
}
```

In the two rewritten versions, notice there is no `await` statement after the
`return` keyword, although that would be valid too: The return value of an
async function is implicitly wrapped in `Promise.resolve` - if
it's not already a promise itself (as in the examples).

## async/await (Deep Dive)

> **Source:** [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/async-await)

The **`await`** operator is used to wait for a `Promise` and get its fulfillment value. It can only be used inside an [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) or at the top level of a [module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

### Syntax

```js
await expression
```

#### Parameters

- `expression`
  - : A `Promise`, a [thenable object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables), or any value to wait for.

#### Return value

The fulfillment value of the promise or thenable object, or, if the expression is not thenable, the expression's own value.

#### Exceptions

Throws the rejection reason if the promise or thenable object is rejected.

### Description

`await` is usually used to unwrap promises by passing a `Promise` as the `expression`. Using `await` pauses the execution of its surrounding `async` function until the promise is settled (that is, fulfilled or rejected). When execution resumes, the value of the `await` expression becomes that of the fulfilled promise.

If the promise is rejected, the `await` expression throws the rejected value. The function containing the `await` expression will [appear in the stack trace](#improving_stack_trace) of the error. Otherwise, if the rejected promise is not awaited or is immediately returned, the caller function will not appear in the stack trace.

The `expression` is resolved in the same way as `Promise.resolve()`: it's always converted to a native `Promise` and then awaited. If the `expression` is a:

- Native `Promise` (which means `expression` belongs to `Promise` or a subclass, and `expression.constructor === Promise`): The promise is directly used and awaited natively, without calling `then()`.
- [Thenable object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables) (including non-native promises, polyfill, proxy, child class, etc.): A new promise is constructed with the native [`Promise()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise) constructor by calling the object's `then()` method and passing in a handler that calls the `resolve` callback.
- Non-thenable value: An already-fulfilled `Promise` is constructed and used.

Even when the used promise is already fulfilled, the async function's execution still pauses until the next tick. In the meantime, the caller of the async function resumes execution. [See example below.](#control_flow_effects_of_await)

Because `await` is only valid inside async functions and modules, which themselves are asynchronous and return promises, the `await` expression never blocks the main thread and only defers execution of code that actually depends on the result, i.e., anything after the `await` expression.

### Examples

#### Awaiting a promise to be fulfilled

If a `Promise` is passed to an `await` expression, it waits for the `Promise` to be fulfilled and returns the fulfilled value.

```js
function resolveAfter2Seconds(x) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(x);
    }, 2000);
  });
}

async function f1() {
  const x = await resolveAfter2Seconds(10);
  console.log(x); // 10
}

f1();
```

#### Thenable objects

[Thenable objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables) are resolved just the same as actual `Promise` objects.

```js
async function f2() {
  const thenable = {
    then(resolve) {
      resolve("resolved!");
    },
  };
  console.log(await thenable); // "resolved!"
}

f2();
```

They can also be rejected:

```js
async function f2() {
  const thenable = {
    then(_, reject) {
      reject(new Error("rejected!"));
    },
  };
  await thenable; // Throws Error: rejected!
}

f2();
```

#### Conversion to promise

If the value is not a `Promise`, `await` converts the value to a resolved `Promise`, and waits for it. The awaited value's identity doesn't change as long as it doesn't have a `then` property that's callable.

```js
async function f3() {
  const y = await 20;
  console.log(y); // 20

  const obj = {};
  console.log((await obj) === obj); // true
}

f3();
```

#### Handling rejected promises

If the `Promise` is rejected, the rejected value is thrown.

```js
async function f4() {
  try {
    const z = await Promise.reject(new Error("rejected!"));
  } catch (e) {
    console.error(e); // Error: rejected!
  }
}

f4();
```

You can handle rejected promises without a `try` block by chaining a [`catch()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) handler before awaiting the promise.

```js
const response = await promisedFunction().catch((err) => {
  console.error(err);
  return "default response";
});
// response will be "default response" if the promise is rejected
```

This is built on the assumption that `promisedFunction()` never synchronously throws an error, but always returns a rejected promise. This is the case for most properly-designed promise-based functions, which usually look like:

```js
function promisedFunction() {
  // Immediately return a promise to minimize chance of an error being thrown
  return new Promise((resolve, reject) => {
    // do something async
  });
}
```

However, if `promisedFunction()` does throw an error synchronously, the error won't be caught by the `catch()` handler. In this case, the `try...catch` statement is necessary.

#### Top level await

You can use the `await` keyword on its own (outside of an async function) at the top level of a [module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). This means that modules with child modules that use `await` will wait for the child modules to execute before they themselves run, all while not blocking other child modules from loading.

Here is an example of a module using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and specifying await within the [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) statement. Any modules that include this will wait for the fetch to resolve before running any code.

```js
// fetch request
const colors = fetch("../data/colors.json").then((response) => response.json());

export default await colors;
```

#### Control flow effects of await

When an `await` is encountered in code (either in an async function or in a module), the awaited expression is executed, while all code that depends on the expression's value is paused. Control exits the function and returns to the caller. When the awaited expression's value is resolved, another [microtask](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model) that continues the paused code gets scheduled. This happens even if the awaited value is an already-resolved promise or not a promise: execution doesn't return to the current function until all other already-scheduled microtasks are processed. For example, consider the following code:

```js
async function foo(name) {
  console.log(name, "start");
  console.log(name, "middle");
  console.log(name, "end");
}

foo("First");
foo("Second");

// First start
// First middle
// First end
// Second start
// Second middle
// Second end
```

In this case, the function `foo` is synchronous in effect, because it doesn't contain any `await` expression. The three statements happen in the same tick. Therefore, the two function calls execute all statements in sequence. In promise terms, the function corresponds to:

```js
function foo(name) {
  return new Promise((resolve) => {
    console.log(name, "start");
    console.log(name, "middle");
    console.log(name, "end");
    resolve();
  });
}
```

However, as soon as there's one `await`, the function becomes asynchronous, and execution of following statements is deferred to the next tick.

```js
async function foo(name) {
  console.log(name, "start");
  await console.log(name, "middle");
  console.log(name, "end");
}

foo("First");
foo("Second");

// First start
// First middle
// Second start
// Second middle
// First end
// Second end
```

This corresponds to:

```js
function foo(name) {
  return new Promise((resolve) => {
    console.log(name, "start");
    resolve(console.log(name, "middle"));
  }).then(() => {
    console.log(name, "end");
  });
}
```

The extra `then()` handler can be merged with the executor passed to the constructor because it's not waiting on any asynchronous operation. However, its existence splits the code into one additional microtask for each call to `foo`. These microtasks are scheduled and executed in an intertwined manner, which can both make your code slower and introduce unnecessary race conditions. Therefore, make sure to use `await` only when necessary (to unwrap promises into their values).

Microtasks are scheduled not only by promise resolution but by other web APIs as well, and they execute with the same priority. This example uses `queueMicrotask()` to demonstrate how the microtask queue is processed when each `await` expression is encountered.

```js
let i = 0;

queueMicrotask(function test() {
  i++;
  console.log("microtask", i);
  if (i < 3) {
    queueMicrotask(test);
  }
});

(async () => {
  console.log("async function start");
  for (let i = 1; i < 3; i++) {
    await null;
    console.log("async function resume", i);
  }
  await null;
  console.log("async function end");
})();

queueMicrotask(() => {
  console.log("queueMicrotask() after calling async function");
});

console.log("script sync part end");

// Logs:
// async function start
// script sync part end
// microtask 1
// async function resume 1
// queueMicrotask() after calling async function
// microtask 2
// async function resume 2
// microtask 3
// async function end
```

In this example, the `test()` function is always called before the async function resumes, so the microtasks they each schedule are always executed in an intertwined fashion. On the other hand, because both `await` and `queueMicrotask()` schedule microtasks, the order of execution is always based on the order of scheduling. This is why the "queueMicrotask() after calling async function" log happens after the async function resumes for the first time.

#### Improving stack trace

Sometimes, the `await` is omitted when a promise is directly returned from an async function.

```js
async function noAwait() {
  // Some actions...

  return /* await */ lastAsyncTask();
}
```

However, consider the case where `lastAsyncTask` asynchronously throws an error.

```js
async function lastAsyncTask() {
  await null;
  throw new Error("failed");
}

async function noAwait() {
  return lastAsyncTask();
}

noAwait();

// Error: failed
//    at lastAsyncTask
```

Only `lastAsyncTask` appears in the stack trace, because the promise is rejected after it has already been returned from `noAwait` — in some sense, the promise is unrelated to `noAwait`. To improve the stack trace, you can use `await` to unwrap the promise, so that the exception gets thrown into the current function. The exception will then be immediately wrapped into a new rejected promise, but during error creation, the caller will appear in the stack trace.

```js
async function lastAsyncTask() {
  await null;
  throw new Error("failed");
}

async function withAwait() {
  return await lastAsyncTask();
}

withAwait();

// Error: failed
//    at lastAsyncTask
//    at async withAwait
```

Contrary to some popular belief, `return await promise` is at least as fast as `return promise`, due to how the spec and engines optimize the resolution of native promises. There's a proposal to [make `return promise` faster](https://github.com/tc39/proposal-faster-promise-adoption) and you can also read about [V8's optimization on async functions](https://v8.dev/blog/fast-async). Therefore, except for stylistic reasons, `return await` is almost always preferable.

## JSON: stringify() and parse()

> **Source:** [Working with JSON](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON), [JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify), [JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/json)

### Working with JSON

JavaScript Object Notation (JSON) is a standard text-based format for representing structured data based on JavaScript object syntax. It is commonly used for transmitting data in web applications (e.g., sending some data from the server to the client, so it can be displayed on a web page, or vice versa). You'll come across it quite often, so in this article, we give you all you need to work with JSON using JavaScript, including parsing JSON so you can access data within it, and creating JSON.

<table>
  <tbody>
    <tr>
      <th scope="row">Prerequisites:</th>
      <td>An understanding of <a href="/en-US/docs/Learn_web_development/Core/Structuring_content">HTML</a> and the <a href="/en-US/docs/Learn_web_development/Core/Styling_basics">fundamentals of CSS</a>, familiarity with JavaScript basics as covered in previous lessons.</td>
    </tr>
    <tr>
      <th scope="row">Learning outcomes:</th>
      <td>
        <ul>
          <li>What JSON is — a very commonly used data format based on JavaScript object syntax.</li>
          <li>That JSON can also contain arrays.</li>
          <li>Retrieve JSON as a JavaScript object using mechanisms available in Web APIs (for example, <code>Response.json()</code> in the Fetch API).</li>
          <li>Access values inside JSON data using bracket and dot syntax.</li>
          <li>Converting between objects and text using <code>JSON.parse()</code> and <code>JSON.stringify()</code>.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

#### No, really, what is JSON?

JSON is a text-based data format following JavaScript object syntax.
It represents structured data as a string, which is useful when you want to transmit data across a network.
Even though it closely resembles JavaScript object literal syntax, it can be used independently from JavaScript. Many programming environments feature the ability to read (parse) and generate JSON.
In JavaScript, the methods for parsing and generating JSON are provided by the [`JSON`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) object.

> **Note:**
> Converting a string to a native object is called _deserialization_, while converting a native object to a string so it can be transmitted across the network is called _serialization_.

A JSON string can be stored in its own file, which is basically just a text file with an extension of `.json`, and a MIME type of `application/json`.

##### JSON structure

As described above, JSON is a string whose format very much resembles JavaScript object literal format.
The following is a valid JSON string representing an object.
Note that it is also a valid JavaScript object literal — just with some more [syntax restrictions](#json_syntax_restrictions).

<!-- cSpell:ignore tonne -->

```json
{
  "squadName": "Super hero squad",
  "homeTown": "Metro City",
  "formed": 2016,
  "secretBase": "Super tower",
  "active": true,
  "members": [
    {
      "name": "Molecule Man",
      "age": 29,
      "secretIdentity": "Dan Jukes",
      "powers": ["Radiation resistance", "Turning tiny", "Radiation blast"]
    },
    {
      "name": "Madame Uppercut",
      "age": 39,
      "secretIdentity": "Jane Wilson",
      "powers": [
        "Million tonne punch",
        "Damage resistance",
        "Superhuman reflexes"
      ]
    },
    {
      "name": "Eternal Flame",
      "age": 1000000,
      "secretIdentity": "Unknown",
      "powers": [
        "Immortality",
        "Heat Immunity",
        "Inferno",
        "Teleportation",
        "Interdimensional travel"
      ]
    }
  ]
}
```

If you load this JSON in your JavaScript program as a string, you can parse it into a normal object and then access the data inside it using the same dot/bracket notation we looked at in the [JavaScript object basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Object_basics) article.
For example:

```js
superHeroes.homeTown;
superHeroes.members[1].powers[2];
```

1. First, we have the variable name — `superHeroes`.
2. Inside that, we want to access the `members` property, so we use `.members`.
3. `members` contains an array populated by objects. We want to access the second object inside the array, so we use `[1]`.
4. Inside this object, we want to access the `powers` property, so we use `.powers`.
5. Inside the `powers` property is an array containing the selected hero's superpowers. We want the third one, so we use `[2]`.

The key takeaway is that there's really nothing special about working with JSON; after you've parsed it into a JavaScript object, you work with it just like you would with an object declared using the same object literal syntax.

> **Note:**
> We've made the JSON seen above available inside a variable in our [JSONTest.html](https://mdn.github.io/learning-area/javascript/oojs/json/JSONTest.html) example (see the [source code](https://github.com/mdn/learning-area/blob/main/javascript/oojs/json/JSONTest.html)).
> Try loading this up and then accessing data inside the variable via your browser's JavaScript console.

##### Arrays as JSON

Above we mentioned that JSON text basically looks like a JavaScript object inside a string.
We can also convert arrays to/from JSON. The below example is perfectly valid JSON:

```json
[
  {
    "name": "Molecule Man",
    "age": 29,
    "secretIdentity": "Dan Jukes",
    "powers": ["Radiation resistance", "Turning tiny", "Radiation blast"]
  },
  {
    "name": "Madame Uppercut",
    "age": 39,
    "secretIdentity": "Jane Wilson",
    "powers": [
      "Million tonne punch",
      "Damage resistance",
      "Superhuman reflexes"
    ]
  }
]
```

You have to access array items (in its parsed version) by starting with an array index, for example `superHeroes[0].powers[0]`.

The JSON can also contain a single primitive. For example, `29`, `"Dan Jukes"`, or `true` are all valid JSON.

##### JSON syntax restrictions

As mentioned earlier, any JSON is a valid JavaScript literal (object, array, number, etc.). The converse is not true, though—not all JavaScript object literals are valid JSON.

- JSON can only contain _serializable_ data types. This means:
  - For primitives, JSON can contain string literals, number literals, `true`, `false`, and `null`. Notably, it cannot contain `undefined`, `NaN`, or `Infinity`.
  - For non-primitives, JSON can contain object literals and arrays, but not functions or any other object types, such as `Date`, `Set`, and `Map`. The objects and arrays inside JSON need to further contain valid JSON data types.
- Strings must be enclosed in double quotes, not single quotes.
- Numbers must be written in decimal notation.
- Each property of an object must be in the form of `"key": value`. Property names must be string literals enclosed in double quotes. Special JavaScript syntax, such as methods, is not allowed because methods are functions, and functions are not valid JSON data types.
- Objects and arrays cannot contain [trailing commas](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Trailing_commas).
- Comments are not allowed in JSON.

Even a single misplaced comma or colon can make a JSON file invalid and cause it to fail.
You should be careful to validate any data you are attempting to use (although computer-generated JSON is less likely to include errors, as long as the generator program is working correctly).
You can validate JSON using an application like [JSONLint](https://jsonlint.com/) or [JSON-validate](https://www.json-validate.com/)

> **Note:**
> Now you've read through this section, you might also want to supplement your learning with Scrimba's [JSON review](https://scrimba.com/frontend-path-c0j/~0lt?via=mdn) <sup>[_MDN learning partner_](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Learning_content#partner_links_and_embeds)</sup> interactive tutorial, which provides some useful guidance around basic JSON syntax and how to view JSON request data inside your browser's devtools.

#### Working through a JSON example

So, let's work through an example to show how we could make use of some JSON formatted data on a website.

##### Getting started

To begin with, make local copies of our [heroes.html](https://github.com/mdn/learning-area/blob/main/javascript/oojs/json/heroes.html) and [style.css](https://github.com/mdn/learning-area/blob/main/javascript/oojs/json/style.css) files.
The latter contains some simple CSS to style our page, while the former contains some very simple body HTML, plus a `script` element to contain the JavaScript code we will be writing in this exercise:

```html
<header>
...
</header>

<section>
...
</section>

<script>
// JavaScript goes here
</script>
```

We have made our JSON data available on our GitHub, at <https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json>.

We are going to load the JSON into our script, and use some nifty DOM manipulation to display it, like this:

![Image of a document titled "Super hero squad" (in a fancy font) and subtitled "Hometown: Metro City // Formed: 2016". Three columns below the heading are titled "Molecule Man", "Madame Uppercut", and "Eternal Flame", respectively. Each column lists the hero's secret identity name, age, and superpowers.](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/core/scripting/json/json-superheroes.png)

##### Top-level function

The top-level function looks like this:

```js
async function populate() {
  const requestURL =
    "https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json";
  const request = new Request(requestURL);

  const response = await fetch(request);
  const superHeroes = await response.json();

  populateHeader(superHeroes);
  populateHeroes(superHeroes);
}
```

To obtain the JSON, we use an API called [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
This API allows us to make network requests to retrieve resources from a server via JavaScript (e.g., images, text, JSON, even HTML snippets), meaning that we can update small sections of content without having to reload the entire page.

In our function, the first four lines use the Fetch API to fetch the JSON from the server:

- we declare the `requestURL` variable to store the GitHub URL
- we use the URL to initialize a new `Request` object.
- we make the network request using the `fetch()` function, and this returns a `Response` object
- we retrieve the response as JSON using the `json()` function of the `Response` object.

> **Note:**
> The `fetch()` API is **asynchronous**. You can learn about asynchronous functions in detail in our [Asynchronous JavaScript module](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS), but for now, we'll just say that we need to add the keyword `async` before the name of the function that uses the fetch API, and add the keyword `await` before the calls to any asynchronous functions.

After all that, the `superHeroes` variable will contain the JavaScript object based on the JSON. We are then passing that object to two function calls — the first one fills the `<header>` with the correct data, while the second one creates an information card for each hero on the team, and inserts it into the `<section>`.

##### Populating the header

Now that we've retrieved the JSON data and converted it into a JavaScript object, let's make use of it by writing the two functions we referenced above. First of all, add the following function definition below the previous code:

```js
function populateHeader(obj) {
  const header = document.querySelector("header");
  const myH1 = document.createElement("h1");
  myH1.textContent = obj.squadName;
  header.appendChild(myH1);

  const myPara = document.createElement("p");
  myPara.textContent = `Hometown: ${obj.homeTown} // Formed: ${obj.formed}`;
  header.appendChild(myPara);
}
```

Here we first create an `h1` element with [`createElement()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement), set its [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) to equal the `squadName` property of the object, then append it to the header using [`appendChild()`](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild). We then do a very similar operation with a paragraph: create it, set its text content and append it to the header. The only difference is that its text is set to a [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) containing both the `homeTown` and `formed` properties of the object.

##### Creating the hero information cards

Next, add the following function at the bottom of the code, which creates and displays the superhero cards:

```js
function populateHeroes(obj) {
  const section = document.querySelector("section");
  const heroes = obj.members;

  for (const hero of heroes) {
    const myArticle = document.createElement("article");
    const myH2 = document.createElement("h2");
    const myPara1 = document.createElement("p");
    const myPara2 = document.createElement("p");
    const myPara3 = document.createElement("p");
    const myList = document.createElement("ul");

    myH2.textContent = hero.name;
    myPara1.textContent = `Secret identity: ${hero.secretIdentity}`;
    myPara2.textContent = `Age: ${hero.age}`;
    myPara3.textContent = "Superpowers:";

    const superPowers = hero.powers;
    for (const power of superPowers) {
      const listItem = document.createElement("li");
      listItem.textContent = power;
      myList.appendChild(listItem);
    }

    myArticle.appendChild(myH2);
    myArticle.appendChild(myPara1);
    myArticle.appendChild(myPara2);
    myArticle.appendChild(myPara3);
    myArticle.appendChild(myList);

    section.appendChild(myArticle);
  }
}
```

To start with, we store the `members` property of the JavaScript object in a new variable. This array contains multiple objects that contain the information for each hero.

Next, we use a [`for...of` loop](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Loops#the_for...of_loop) to iterate through each object in the array. For each one, we:

1. Create several new elements: an `<article>`, an `<h2>`, three `<p>`s, and a `<ul>`.
2. Set the `<h2>` to contain the current hero's `name`.
3. Fill the three paragraphs with their `secretIdentity`, `age`, and a line saying "Superpowers:" to introduce the information in the list.
4. Store the `powers` property in another new constant called `superPowers` — this contains an array that lists the current hero's superpowers.
5. Use another `for...of` loop to loop through the current hero's superpowers — for each one we create an `<li>` element, put the superpower inside it, then put the `listItem` inside the `<ul>` element (`myList`) using `appendChild()`.
6. The very last thing we do is to append the `<h2>`, `<p>`s, and `<ul>` inside the `<article>` (`myArticle`), then append the `<article>` inside the `<section>`. The order in which things are appended is important, as this is the order they will be displayed inside the HTML.

> **Note:**
> If you are having trouble getting the example to work, try referring to our [heroes-finished.html](https://github.com/mdn/learning-area/blob/main/javascript/oojs/json/heroes-finished.html) source code (see it [running live](https://mdn.github.io/learning-area/javascript/oojs/json/heroes-finished.html) also.)

> **Note:**
> If you are having trouble following the dot/bracket notation we are using to access the JavaScript object, it can help to have the [superheroes.json](https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json) file open in another tab or your text editor, and refer to it as you look at our JavaScript.
> You should also refer back to our [JavaScript object basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Object_basics) article for more information on dot and bracket notation.

##### Calling the top-level function

Finally, we need to call our top-level `populate()` function:

```js
populate();
```

#### Converting between objects and text

The above example was simple in terms of accessing the JavaScript object, because we converted the network response directly into a JavaScript object using `response.json()`.

But sometimes we aren't so lucky — sometimes we receive a raw JSON string, and we need to convert it to an object ourselves. And when we want to send a JavaScript object across the network, we need to convert it to JSON (a string) before sending it. Luckily, these two problems are so common in web development that a built-in [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) object is available in browsers, which contains the following two methods:

- [`parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse): Accepts a JSON string as a parameter, and returns the corresponding JavaScript object.
- [`stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify): Accepts an object as a parameter, and returns the equivalent JSON string.

You can see the first one in action in our [heroes-finished-json-parse.html](https://mdn.github.io/learning-area/javascript/oojs/json/heroes-finished-json-parse.html) example (see the [source code](https://github.com/mdn/learning-area/blob/main/javascript/oojs/json/heroes-finished-json-parse.html)) — this does exactly the same thing as the example we built up earlier, except that:

- we retrieve the response as text rather than JSON, by calling the `text()` method of the response
- we then use `parse()` to convert the text to a JavaScript object.

The key snippet of code is here:

```js
async function populate() {
  const requestURL =
    "https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json";
  const request = new Request(requestURL);

  const response = await fetch(request);
  const superHeroesText = await response.text();

  const superHeroes = JSON.parse(superHeroesText);
  populateHeader(superHeroes);
  populateHeroes(superHeroes);
}
```

As you might guess, `stringify()` works the opposite way. Try entering the following lines into your browser's JavaScript console one by one to see it in action:

```js
let myObj = { name: "Chris", age: 38 };
myObj;
let myString = JSON.stringify(myObj);
myString;
```

Here we're creating a JavaScript object, checking what it contains, converting it to a JSON string using `stringify()` — saving the return value in a new variable — then checking it again.

#### Summary

In this lesson, we've introduced you to using JSON in your programs, including how to create and parse JSON, and how to access data locked inside it. In the next article, we'll give you some tests that you can use to check how well you've understood and retained all this information.

### JSON.stringify()

The **`JSON.stringify()`** static method converts a JavaScript value to a JSON string, optionally replacing values if a replacer function is specified or optionally including only the specified properties if a replacer array is specified.

```js
console.log(JSON.stringify({ x: 5, y: 6 }));
// Expected output: '{"x":5,"y":6}'

console.log(
  JSON.stringify([new Number(3), new String("false"), new Boolean(false)]),
);
// Expected output: '[3,"false",false]'

console.log(JSON.stringify({ x: [10, undefined, function () {}, Symbol("")] }));
// Expected output: '{"x":[10,null,null,null]}'

console.log(JSON.stringify(new Date(2006, 0, 2, 15, 4, 5)));
// Expected output: '"2006-01-02T15:04:05.000Z"'
```

#### Syntax

```js
JSON.stringify(value)
JSON.stringify(value, replacer)
JSON.stringify(value, replacer, space)
```

##### Parameters

- `value`
  - : The value to convert to a JSON string.
- `replacer`
  - : A function that alters the behavior of the stringification process, or an array of strings and numbers that specifies properties of `value` to be included in the output. If `replacer` is an array, all elements in this array that are not strings or numbers (either primitives or wrapper objects), including `Symbol` values, are completely ignored. If `replacer` is anything other than a function or an array (e.g., [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) or not provided), all string-keyed properties of the object are included in the resulting JSON string.
- `space`
  - : A string or number that's used to insert white space (including indentation, line break characters, etc.) into the output JSON string for readability purposes.

    If this is a number, it indicates the number of space characters to be used as indentation, clamped to 10 (that is, any number greater than `10` is treated as if it were `10`). Values less than 1 indicate that no space should be used.

    If this is a string, the string (or the first 10 characters of the string, if it's longer than that) is inserted before every nested object or array.

    If `space` is anything other than a string or number (can be either a primitive or a wrapper object) — for example, is [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) or not provided — no white space is used.

##### Return value

A JSON string representing the given value, or undefined.

##### Exceptions

- `TypeError`
  - : Thrown in one of the following cases:
    - `value` contains a circular reference.
    - A `BigInt` value is encountered.

#### Description

`JSON.stringify()` converts a value to the JSON notation that the value represents. Values are stringified in the following manner:

- `Boolean`, `Number`, `String`, and `BigInt` (obtainable via [`Object()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/Object)) objects are converted to the corresponding primitive values during stringification, in accordance with the traditional conversion semantics. `Symbol` objects (obtainable via [`Object()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/Object)) are treated as plain objects.
- Attempting to serialize `BigInt` values will throw. However, if the BigInt has a `toJSON()` method (through monkey patching: `BigInt.prototype.toJSON = ...`), that method can provide the serialization result. This constraint ensures that a proper serialization (and, very likely, its accompanying deserialization) behavior is always explicitly provided by the user.
- `undefined`, `Function`, and `Symbol` values are not valid JSON values. If any such values are encountered during conversion, they are either omitted (when found in an object) or changed to [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) (when found in an array). `JSON.stringify()` can return `undefined` when passing in "pure" values like `JSON.stringify(() => {})` or `JSON.stringify(undefined)`.
- The numbers `Infinity` and `NaN`, as well as the value [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null), are all considered `null`. (But unlike the values in the previous point, they would never be omitted.)
- Arrays are serialized as arrays (enclosed by square brackets). Only array indices between 0 and `length - 1` (inclusive) are serialized; other properties are ignored.
- The special raw JSON object created with `JSON.rawJSON()` is serialized as the raw JSON text it contains (by accessing its `rawJSON` property).
- For other objects:
  - All `Symbol`-keyed properties will be completely ignored, even when using the [`replacer`](#the_replacer_parameter) parameter.

  - If the value has a `toJSON()` method, it's responsible for defining what data will be serialized. Instead of the object being serialized, the value returned by the `toJSON()` method when called will be serialized. `JSON.stringify()` calls `toJSON` with one parameter, the `key`, which has the same semantic as the `key` parameter of the [`replacer`](#the_replacer_parameter) function:
    - if this object is a property value, the property name
    - if it is in an array, the index in the array, as a string
    - if `JSON.stringify()` was directly called on this object, an empty string

    All `Temporal` objects implement the `toJSON()` method, which returns a string (the same as calling `toString()`). Thus, they will be serialized as strings. Similarly, `Date` objects implement `toJSON()`, which returns the same as [`toISOString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString).

  - Only [enumerable own properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties) are visited. This means `Map`, `Set`, etc. will become `"{}"`. You can use the [`replacer`](#the_replacer_parameter) parameter to serialize them to something more useful.

    Properties are visited using the same algorithm as [`Object.keys()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys), which has a well-defined order and is stable across implementations. For example, `JSON.stringify` on the same object will always produce the same string, and `JSON.parse(JSON.stringify(obj))` would produce an object with the same key ordering as the original (assuming the object is completely JSON-serializable).

##### The replacer parameter

The `replacer` parameter can be either a function or an array.

As an array, its elements indicate the names of the properties in the object that should be included in the resulting JSON string. Only string and number values are taken into account; symbol keys are ignored.

As a function, it takes two parameters: the `key` and the `value` being stringified. The object in which the key was found is provided as the `replacer`'s `this` context.

The `replacer` function is called for the initial object being stringified as well, in which case the `key` is an empty string (`""`). It is then called for each property on the object or array being stringified. Array indices will be provided in its string form as `key`. The current property value will be replaced with the `replacer`'s return value for stringification. This means:

- If you return a number, string, boolean, or `null`, that value is directly serialized and used as the property's value. (Returning a BigInt will throw as well.)
- If you return a `Function`, `Symbol`, or `undefined`, the property is not included in the output.
- If you return any other object, the object is recursively stringified, calling the `replacer` function on each property.

> **Note:**
> When parsing JSON generated with `replacer` functions, you would likely want to use the [`reviver`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#using_the_reviver_parameter) parameter to perform the reverse operation.

Typically, array elements' index would never shift (even when the element is an invalid value like a function, it will become `null` instead of omitted). Using the `replacer` function allows you to control the order of the array elements by returning a different array.

##### The space parameter

The `space` parameter may be used to control spacing in the final string.

- If it is a number, successive levels in the stringification will each be indented by this many space characters.
- If it is a string, successive levels will be indented by this string.

Each level of indentation will never be longer than 10. Number values of `space` are clamped to 10, and string values are truncated to 10 characters.

#### Examples

##### Using JSON.stringify

```js
JSON.stringify({}); // '{}'
JSON.stringify(true); // 'true'
JSON.stringify("foo"); // '"foo"'
JSON.stringify([1, "false", false]); // '[1,"false",false]'
JSON.stringify([NaN, null, Infinity]); // '[null,null,null]'
JSON.stringify({ x: 5 }); // '{"x":5}'

JSON.stringify(new Date(1906, 0, 2, 15, 4, 5));
// '"1906-01-02T15:04:05.000Z"'

JSON.stringify({ x: 5, y: 6 });
// '{"x":5,"y":6}'
JSON.stringify([new Number(3), new String("false"), new Boolean(false)]);
// '[3,"false",false]'

// String-keyed array elements are not enumerable and make no sense in JSON
const a = ["foo", "bar"];
a["baz"] = "quux"; // a: [ 0: 'foo', 1: 'bar', baz: 'quux' ]
JSON.stringify(a);
// '["foo","bar"]'

JSON.stringify({ x: [10, undefined, function () {}, Symbol("")] });
// '{"x":[10,null,null,null]}'

// Standard data structures
JSON.stringify([
  new Set([1]),
  new Map([[1, 2]]),
  new WeakSet([{ a: 1 }]),
  new WeakMap([[{ a: 1 }, 2]]),
]);
// '[{},{},{},{}]'

// TypedArray
JSON.stringify([new Int8Array([1]), new Int16Array([1]), new Int32Array([1])]);
// '[{"0":1},{"0":1},{"0":1}]'
JSON.stringify([
  new Uint8Array([1]),
  new Uint8ClampedArray([1]),
  new Uint16Array([1]),
  new Uint32Array([1]),
]);
// '[{"0":1},{"0":1},{"0":1},{"0":1}]'
JSON.stringify([new Float32Array([1]), new Float64Array([1])]);
// '[{"0":1},{"0":1}]'

// toJSON()
JSON.stringify({
  x: 5,
  y: 6,
  toJSON() {
    return this.x + this.y;
  },
});
// '11'

// Symbols:
JSON.stringify({ x: undefined, y: Object, z: Symbol("") });
// '{}'
JSON.stringify({ [Symbol("foo")]: "foo" });
// '{}'
JSON.stringify({ [Symbol.for("foo")]: "foo" }, [Symbol.for("foo")]);
// '{}'
JSON.stringify({ [Symbol.for("foo")]: "foo" }, (k, v) => {
  if (typeof k === "symbol") {
    return "a symbol";
  }
});
// undefined

// Non-enumerable properties:
JSON.stringify(
  Object.create(null, {
    x: { value: "x", enumerable: false },
    y: { value: "y", enumerable: true },
  }),
);
// '{"y":"y"}'

// BigInt values throw
JSON.stringify({ x: 2n });
// TypeError: BigInt value can't be serialized in JSON
```

##### Using a function as replacer

```js
function replacer(key, value) {
  // Filtering out properties
  if (typeof value === "string") {
    return undefined;
  }
  return value;
}

const foo = {
  foundation: "Mozilla",
  model: "box",
  week: 45,
  transport: "car",
  month: 7,
};
JSON.stringify(foo, replacer);
// '{"week":45,"month":7}'
```

If you wish the `replacer` to distinguish an initial object from a key with an empty string property (since both would give the empty string as key and potentially an object as value), you will have to keep track of the iteration count (if it is beyond the first iteration, it is a genuine empty string key).

```js
function makeReplacer() {
  let isInitial = true;

  return (key, value) => {
    if (isInitial) {
      isInitial = false;
      return value;
    }
    if (key === "") {
      // Omit all properties with name "" (except the initial object)
      return undefined;
    }
    return value;
  };
}

const replacer = makeReplacer();
console.log(JSON.stringify({ "": 1, b: 2 }, replacer)); // "{"b":2}"
```

##### Using an array as replacer

```js
const foo = {
  foundation: "Mozilla",
  model: "box",
  week: 45,
  transport: "car",
  month: 7,
};

JSON.stringify(foo, ["week", "month"]);
// '{"week":45,"month":7}', only keep "week" and "month" properties
```

##### Using the space parameter

Indent the output with one space:

```js
console.log(JSON.stringify({ a: 2 }, null, " "));
/*
{
 "a": 2
}
*/
```

Using a tab character mimics standard pretty-print appearance:

<!-- markdownlint-disable MD010 -->

```js
console.log(JSON.stringify({ uno: 1, dos: 2 }, null, "\t"));
/*
{
	"uno": 1,
	"dos": 2
}
*/
```

<!-- markdownlint-enable MD010 -->

##### toJSON() behavior

Defining `toJSON()` for an object allows overriding its serialization behavior.

```js
const obj = {
  data: "data",

  toJSON(key) {
    return key ? `Now I am a nested object under key '${key}'` : this;
  },
};

JSON.stringify(obj);
// '{"data":"data"}'

JSON.stringify({ obj });
// '{"obj":"Now I am a nested object under key 'obj'"}'

JSON.stringify([obj]);
// '["Now I am a nested object under key '0'"]'
```

##### Issue with serializing circular references

Since the [JSON format](https://www.json.org/) doesn't support object references (although an [IETF draft exists](https://datatracker.ietf.org/doc/html/draft-pbryan-zyp-json-ref-03)), a `TypeError` will be thrown if one attempts to encode an object with circular references.

```js
const circularReference = {};
circularReference.myself = circularReference;

// Serializing circular references throws "TypeError: cyclic object value"
JSON.stringify(circularReference);
```

To serialize circular references, you can use a library that supports them (e.g., [cycle.js](https://github.com/douglascrockford/JSON-js/blob/master/cycle.js) by Douglas Crockford) or implement a solution yourself, which will require finding and replacing (or removing) the cyclic references by serializable values.

If you are using `JSON.stringify()` to deep-copy an object, you may instead want to use `structuredClone()`, which supports circular references. JavaScript engine APIs for binary serialization, such as [`v8.serialize()`](https://nodejs.org/api/v8.html#v8serializevalue), also support circular references.

##### Using JSON.stringify() with localStorage

In a case where you want to store an object created by your user and allow it to be restored even after the browser has been closed, the following example is a model for the applicability of `JSON.stringify()`:

```js
// Creating an example of JSON
const session = {
  screens: [],
  state: true,
};
session.screens.push({ name: "screenA", width: 450, height: 250 });
session.screens.push({ name: "screenB", width: 650, height: 350 });
session.screens.push({ name: "screenC", width: 750, height: 120 });
session.screens.push({ name: "screenD", width: 250, height: 60 });
session.screens.push({ name: "screenE", width: 390, height: 120 });
session.screens.push({ name: "screenF", width: 1240, height: 650 });

// Converting the JSON string with JSON.stringify()
// then saving with localStorage in the name of session
localStorage.setItem("session", JSON.stringify(session));

// Example of how to transform the String generated through
// JSON.stringify() and saved in localStorage in JSON object again
const restoredSession = JSON.parse(localStorage.getItem("session"));

// Now restoredSession variable contains the object that was saved
// in localStorage
console.log(restoredSession);
```

##### Well-formed JSON.stringify()

Engines implementing the [well-formed JSON.stringify specification](https://github.com/tc39/proposal-well-formed-stringify) will stringify lone surrogates (any code point from U+D800 to U+DFFF) using Unicode escape sequences rather than literally (outputting lone surrogates). Before this change, such strings could not be encoded in valid UTF-8 or UTF-16:

```js
JSON.stringify("\uD800"); // '"�"'
```

But with this change `JSON.stringify()` represents lone surrogates using JSON escape sequences that _can_ be encoded in valid UTF-8 or UTF-16:

```js
JSON.stringify("\uD800"); // '"\\ud800"'
```

This change should be backwards-compatible as long as you pass the result of `JSON.stringify()` to APIs such as `JSON.parse()` that will accept any valid JSON text, because they will treat Unicode escapes of lone surrogates as identical to the lone surrogates themselves. _Only_ if you are directly interpreting the result of `JSON.stringify()` do you need to carefully handle `JSON.stringify()`'s two possible encodings of these code points.

### JSON.parse()

The **`JSON.parse()`** static method parses a JSON string, constructing the JavaScript value or object described by the string. An optional _reviver_ function can be provided to perform a transformation on the resulting object before it is returned.

```js
const json = '{"result":true, "count":42}';
const obj = JSON.parse(json);

console.log(obj.count);
// Expected output: 42

console.log(obj.result);
// Expected output: true
```

#### Syntax

```js
JSON.parse(text)
JSON.parse(text, reviver)
```

##### Parameters

- `text`
  - : The string to parse as JSON. See the `JSON` object for a description of JSON syntax.
- `reviver`
  - : If a function, this prescribes how each value originally produced by parsing is transformed before being returned. Non-callable values are ignored. The function is called with the following arguments:
    - `key`
      - : The key associated with the value.
    - `value`
      - : The value produced by parsing.
    - `context`
      - : A context object that holds state relevant to the current expression being revived. It is a new object for each invocation of the reviver function. It is only passed when reviving primitive values, but not when `value` is an object or array. It contains the following property:
        - `source`
          - : The original JSON string representing this value.

##### Return value

The `Object`, `Array`, string, number, boolean, or `null` value corresponding to the given JSON `text`.

##### Exceptions

- `SyntaxError`
  - : Thrown if the string to parse is not valid JSON.

#### Description

`JSON.parse()` parses a JSON string according to the [JSON grammar](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#full_json_grammar), then evaluates the string as if it's a JavaScript expression. The only instance where a piece of JSON text represents a different value from the same JavaScript expression is when dealing with the `"__proto__"` key — see [Object literal syntax vs. JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#object_literal_syntax_vs._json).

##### The reviver parameter

If a `reviver` is specified, the value computed by parsing is _transformed_ before being returned. Specifically, the computed value and all its properties (in a [depth-first](https://en.wikipedia.org/wiki/Depth-first_search) fashion, beginning with the most nested properties and proceeding to the original value itself) are individually run through the `reviver`.

The `reviver` is called with the object containing the property being processed as `this` (unless you define the `reviver` as an arrow function, in which case there's no separate `this` binding) and two arguments: `key` and `value`, representing the property name as a string (even for arrays) and the property value. For primitive values, an additional `context` parameter is passed, which contains the source text of this value. If the `reviver` function returns `undefined` (or returns no value — for example, if execution falls off the end of the function), the property is deleted from the object. Otherwise, the property is redefined to be the return value. If the `reviver` only transforms some values and not others, be certain to return all untransformed values as-is — otherwise, they will be deleted from the resulting object.

Similar to the `replacer` parameter of `JSON.stringify()`, for arrays and objects, `reviver` will be last called on the root value with an empty string as the `key` and the root object as the `value`. For other valid JSON values, `reviver` works similarly and is called once with an empty string as the `key` and the value itself as the `value`.

If you return another value from `reviver`, that value will completely replace the originally parsed value. This even applies to the root value. For example:

```js
const transformedObj = JSON.parse('[1,5,{"s":1}]', (key, value) =>
  typeof value === "object" ? undefined : value,
);

console.log(transformedObj); // undefined
```

There is no way to work around this generically. You cannot specially handle the case where `key` is an empty string, because JSON objects can also contain keys that are empty strings. You need to know very precisely what kind of transformation is needed for each key when implementing the reviver.

Note that `reviver` is run after the value is parsed. So, for example, numbers in JSON text will have already been converted to JavaScript numbers, and may lose precision in the process. One way to transfer large numbers without loss of precision is to serialize them as strings, and revive them to [BigInts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), or other appropriate arbitrary precision formats.

You can also use the `context.source` property to access the original JSON source text representing the value, as shown below:

```js
const bigJSON = '{"gross_gdp": 12345678901234567890}';
const bigObj = JSON.parse(bigJSON, (key, value, context) => {
  if (key === "gross_gdp") {
    // Ignore the value because it has already lost precision
    return BigInt(context.source);
  }
  return value;
});
```

#### Examples

##### Using JSON.parse()

```js
JSON.parse("{}"); // {}
JSON.parse("true"); // true
JSON.parse('"foo"'); // "foo"
JSON.parse('[1, 5, "false"]'); // [1, 5, "false"]
JSON.parse("null"); // null
```

##### Using the reviver parameter

```js
JSON.parse(
  '{"p": 5}',
  (key, value) =>
    typeof value === "number"
      ? value * 2 // return value * 2 for numbers
      : value, // return everything else unchanged
);
// { p: 10 }

JSON.parse('{"1": 1, "2": 2, "3": {"4": 4, "5": {"6": 6}}}', (key, value) => {
  console.log(key);
  return value;
});
// 1
// 2
// 4
// 6
// 5
// 3
// ""
```

##### Using reviver when paired with the replacer of JSON.stringify()

In order for a value to properly round-trip (that is, it gets deserialized to the same original object), the serialization process must preserve the type information. For example, you can use the `replacer` parameter of `JSON.stringify()` for this purpose:

```js
// Maps are normally serialized as objects with no properties.
// We can use the replacer to specify the entries to be serialized.
const map = new Map([
  [1, "one"],
  [2, "two"],
  [3, "three"],
]);

const jsonText = JSON.stringify(map, (key, value) =>
  value instanceof Map ? Array.from(value.entries()) : value,
);

console.log(jsonText);
// [[1,"one"],[2,"two"],[3,"three"]]

const map2 = JSON.parse(jsonText, (key, value) =>
  Array.isArray(value) && value.every(Array.isArray) ? new Map(value) : value,
);

console.log(map2);
// Map { 1 => "one", 2 => "two", 3 => "three" }
```

Because JSON has no syntax space for annotating type metadata, in order to revive values that are not plain objects, you have to consider one of the following:

- Serialize the entire object to a string and prefix it with a type tag.
- "Guess" based on the structure of the data (for example, an array of two-member arrays)
- If the shape of the payload is fixed, based on the property name (for example, all properties called `registry` hold `Map` objects).

##### Illegal JSON

When `JSON.parse` receives a string that does not conform to the JSON grammar, it throws a `SyntaxError`.

Arrays and objects cannot have [trailing commas](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Trailing_commas) in JSON:

```js
JSON.parse("[1, 2, 3, 4, ]");
// SyntaxError: Unexpected token ] in JSON at position 13

JSON.parse('{"foo": 1, }');
// SyntaxError: Unexpected token } in JSON at position 12
```

JSON strings must be delimited by double (not single) quotes:

```js
JSON.parse("{'foo': 1}");
// SyntaxError: Unexpected token ' in JSON at position 1

JSON.parse("'string'");
// SyntaxError: Unexpected token ' in JSON at position 0
```

If you are writing JSON inside a JavaScript string literal, you should either use single quotes to delimit the JavaScript string literal, or escape the double quotes that delimit the JSON string:

```js example-good
JSON.parse('{"foo": 1}'); // OK
JSON.parse("{\"foo\": 1}"); // OK
```

## fetch()

> **Source:** [Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/fetch)

The [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) provides a JavaScript interface for making HTTP requests and processing the responses.

Fetch is the modern replacement for `XMLHttpRequest`: unlike `XMLHttpRequest`, which uses callbacks, Fetch is promise-based and is integrated with features of the modern web such as [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) and [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS).

With the Fetch API, you make a request by calling `fetch()`, which is available as a global function in both `window` and `worker` contexts. You pass it a `Request` object or a string containing the URL to fetch, along with an optional argument to configure the request.

The `fetch()` function returns a `Promise` which is fulfilled with a `Response` object representing the server's response. You can then check the request status and extract the body of the response in various formats, including text and JSON, by calling the appropriate method on the response.

Here's a minimal function that uses `fetch()` to retrieve some JSON data from a server:

```js
async function getData() {
  const url = "https://example.org/products.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error.message);
  }
}
```

We declare a string containing the URL and then call `fetch()`, passing the URL with no extra options.

The `fetch()` function will reject the promise on some errors, but not if the server responds with an error status like `404`: so we also check the response status and throw if it is not OK.

Otherwise, we fetch the response body content as JSON by calling the `json()` method of `Response`, and log one of its values. Note that like `fetch()` itself, `json()` is asynchronous, as are all the other methods to access the response body content.

In the rest of this page we'll look in more detail at the different stages of this process.

### Making a request

To make a request, call `fetch()`, passing in:

1. a definition of the resource to fetch. This can be any one of:
   - a string containing the URL
   - an object, such as an instance of `URL`, which has a stringifier that produces a string containing the URL
   - a `Request` instance
2. optionally, an object containing options to configure the request.

In this section we'll look at some of the most commonly-used options. To read about all the options that can be given, see the [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) reference page.

#### Setting the method

By default, `fetch()` makes a `GET` request, but you can use the `method` option to use a different [request method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods):

```js
const response = await fetch("https://example.org/post", {
  method: "POST",
  // …
});
```

If the `mode` option is set to `no-cors`, then `method` must be one of `GET`, `POST` or `HEAD`.

#### Setting a body

The request body is the payload of the request: it's the thing the client is sending to the server. You cannot include a body with `GET` requests, but it's useful for requests that send content to the server, such as `POST` or `PUT` requests. For example, if you want to upload a file to the server, you might make a `POST` request and include the file as the request body.

To set a request body, pass it as the `body` option:

```js
const response = await fetch("https://example.org/post", {
  method: "POST",
  body: JSON.stringify({ username: "example" }),
  // …
});
```

You can supply the body as an instance of any of the following types:

- a string
- `ArrayBuffer`
- `TypedArray`
- `DataView`
- `Blob`
- `File`
- `URLSearchParams`
- `FormData`
- `ReadableStream`

Other objects are converted to strings using their `toString()` method. For example, you can use a `URLSearchParams` object to encode form data (see [setting headers](#setting_headers) for more information):

```js
const response = await fetch("https://example.org/post", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  // Automatically converted to "username=example&password=password"
  body: new URLSearchParams({ username: "example", password: "password" }),
  // …
});
```

Note that just like response bodies, request bodies are streams, and making the request reads the stream, so if a request contains a body, you can't make it twice:

```js
const request = new Request("https://example.org/post", {
  method: "POST",
  body: JSON.stringify({ username: "example" }),
});

const response1 = await fetch(request);
console.log(response1.status);

// Will throw: "Body has already been consumed."
const response2 = await fetch(request);
console.log(response2.status);
```

Instead, you would need to `create a clone` of the request before sending it:

```js
const request1 = new Request("https://example.org/post", {
  method: "POST",
  body: JSON.stringify({ username: "example" }),
});

const request2 = request1.clone();

const response1 = await fetch(request1);
console.log(response1.status);

const response2 = await fetch(request2);
console.log(response2.status);
```

See [Locked and disturbed streams](#locked_and_disturbed_streams) for more information.

#### Setting headers

Request headers give the server information about the request: for example, in a `POST` request, the `Content-Type` header tells the server the format of the request's body.

To set request headers, assign them to the `headers` option.

You can pass an object literal here containing `header-name: header-value` properties:

```js
const response = await fetch("https://example.org/post", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ username: "example" }),
  // …
});
```

Alternatively, you can construct a `Headers` object, add headers to that object using `Headers.append()`, then assign the `Headers` object to the `headers` option:

```js
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const response = await fetch("https://example.org/post", {
  method: "POST",
  headers: myHeaders,
  body: JSON.stringify({ username: "example" }),
  // …
});
```

Compared to using plain objects, the `Headers` object provides some additional input sanitization. For example, it normalizes header names to lowercase, strips leading and trailing whitespace from header values, and prevents certain headers from being set. Many headers are set automatically by the browser and can't be set by a script: these are called Forbidden request headers. If the `mode` option is set to `no-cors`, then the set of permitted headers is further restricted.

#### Sending data in a GET request

`GET` requests don't have a body, but you can still send data to the server by appending it to the URL as a query string. This is a common way to send form data to the server. You can do this by using `URLSearchParams` to encode the data, and then appending it to the URL:

```js
const params = new URLSearchParams();
params.append("username", "example");

// GET request sent to https://example.org/login?username=example
const response = await fetch(`https://example.org/login?${params}`);
```

#### Making cross-origin requests

Whether a request can be made cross-origin or not is determined by the value of the `RequestInit` option. This may take one of three values: `cors`, `same-origin`, or `no-cors`.

- For fetch requests the default value of `mode` is `cors`, meaning that if the request is cross-origin then it will use the [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) mechanism. This means that:
  - if the request is a [simple request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS#simple_requests), then the request will always be sent, but the server must respond with the correct `Access-Control-Allow-Origin` header or the browser will not share the response with the caller.
  - if the request is not a simple request, then the browser will send a [preflighted request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS#preflighted_requests) to check that the server understands CORS and allows the request, and the real request will not be sent unless the server responds to the preflighted request with the appropriate CORS headers.

- Setting `mode` to `same-origin` disallows cross-origin requests completely.

- Setting `mode` to `no-cors` disables CORS for cross-origin requests. This restricts the headers that may be set, and restricts methods to GET, HEAD, and POST. The response is _opaque_, meaning that its headers and body are not available to JavaScript. Most of the time a website should not use `no-cors`: the main application of it is for certain service worker use cases.

See the reference documentation for `RequestInit` for more details.

#### Including credentials

In the context of the Fetch API, a credential is an extra piece of data sent along with the request that the server may use to authenticate the user. All the following items are considered to be credentials:

- HTTP cookies
- TLS client certificates
- The `Authorization` and `Proxy-Authorization` headers.

By default, credentials are only included in same-origin requests. To customize this behavior, as well as to control whether the browser respects any **`Set-Cookie`** response headers, set the [`credentials`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#credentials) option, which can take one of the following three values:

- `omit`: never send credentials in the request or include credentials in the response.
- `same-origin` (the default): only send and include credentials for same-origin requests.
- `include`: always include credentials, even cross-origin.

Note that if a cookie's [`SameSite`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value) attribute is set to `Strict` or `Lax`, then the cookie will not be sent cross-site, even if `credentials` is set to `include`.

Including credentials in cross-origin requests can make a site vulnerable to CSRF attacks, so even if `credentials` is set to `include`, the server must also agree to their inclusion by including the `Access-Control-Allow-Credentials` header in its response. Additionally, in this situation the server must explicitly specify the client's origin in the `Access-Control-Allow-Origin` response header (that is, `*` is not allowed).

This means that if `credentials` is set to `include` and the request is cross-origin, then:

- If the request is a [simple request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS#simple_requests), then the request will be sent with credentials, but the server must set the `Access-Control-Allow-Credentials` and `Access-Control-Allow-Origin` response headers, or the browser will return a network error to the caller. If the server does set the correct headers, then the response, including credentials, will be delivered to the caller.

- If the request is not a simple request, then the browser will send a [preflighted request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS#preflighted_requests) without credentials, and the server must set the `Access-Control-Allow-Credentials` and `Access-Control-Allow-Origin` response headers, or the browser will return a network error to the caller. If the server does set the correct headers, then the browser will follow up with the real request, including credentials, and will deliver the real response, including credentials, to the caller.

#### Creating a `Request` object

The `Request()` constructor takes the same arguments as `fetch()` itself. This means that instead of passing options into `fetch()`, you can pass the same options to the `Request()` constructor, and then pass that object to `fetch()`.

For example, we can make a POST request by passing options into `fetch()` using code like this:

```js
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const response = await fetch("https://example.org/post", {
  method: "POST",
  body: JSON.stringify({ username: "example" }),
  headers: myHeaders,
});
```

However, we could rewrite this to pass the same arguments to the `Request()` constructor:

```js
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const myRequest = new Request("https://example.org/post", {
  method: "POST",
  body: JSON.stringify({ username: "example" }),
  headers: myHeaders,
});

const response = await fetch(myRequest);
```

This also means that you can create a request from another request, while changing some of its properties using the second argument:

```js
async function post(request) {
  try {
    const response = await fetch(request);
    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

const request1 = new Request("https://example.org/post", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ username: "example1" }),
});

const request2 = new Request(request1, {
  body: JSON.stringify({ username: "example2" }),
});

post(request1);
post(request2);
```

### Canceling a request

To make a request cancelable, create an `AbortController`, and assign its `AbortSignal` to the request's `signal` property.

To cancel the request, call the controller's `abort()` method. The `fetch()` call will reject the promise with an `AbortError` exception.

```js
const controller = new AbortController();

const fetchButton = document.querySelector("#fetch");
fetchButton.addEventListener("click", async () => {
  try {
    console.log("Starting fetch");
    const response = await fetch("https://example.org/get", {
      signal: controller.signal,
    });
    console.log(`Response: ${response.status}`);
  } catch (e) {
    console.error(`Error: ${e}`);
  }
});

const cancelButton = document.querySelector("#cancel");
cancelButton.addEventListener("click", () => {
  controller.abort();
  console.log("Canceled fetch");
});
```

If the request is aborted after the `fetch()` call has been fulfilled but before the response body has been read, then attempting to read the response body will reject with an `AbortError` exception.

```js
async function get() {
  const controller = new AbortController();
  const request = new Request("https://example.org/get", {
    signal: controller.signal,
  });

  const response = await fetch(request);
  controller.abort();
  // The next line will throw `AbortError`
  const text = await response.text();
  console.log(text);
}
```

### Handling the response

As soon as the browser has received the response status and headers from the server (and potentially before the response body itself has been received), the promise returned by `fetch()` is fulfilled with a `Response` object.

#### Checking response status

The promise returned by `fetch()` will reject on some errors, such as a network error or a bad scheme. However, if the server responds with an error like `404`, then `fetch()` fulfills with a `Response`, so we have to check the status before we can read the response body.

The `Response.status` property tells us the numerical status code, and the `Response.ok` property returns `true` if the status is in the [200 range](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#successful_responses).

A common pattern is to check the value of `ok` and throw if it is `false`:

```js
async function getData() {
  const url = "https://example.org/products.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    // …
  } catch (error) {
    console.error(error.message);
  }
}
```

#### Checking the response type

Responses have a `type` property that can be one of the following:

- `basic`: the request was a same-origin request.
- `cors`: the request was a cross-origin CORS request.
- `opaque`: the request was a cross-origin simple request made with the `no-cors` mode.
- `opaqueredirect`: the request set the `redirect` option to `manual`, and the server returned a [redirect status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#redirection_messages).

The type determines the possible contents of the response, as follows:

- Basic responses exclude response headers from the Forbidden response header name list.

- CORS responses include only response headers from the CORS-safelisted response header list.

- Opaque responses and opaque redirect responses have a `status` of `0`, an empty header list, and a `null` body.

#### Checking headers

Just like the request, the response has a `headers` property which is a `Headers` object, and this contains any response headers that are exposed to scripts, subject to the exclusions made based on the response type.

A common use case for this is to check the content type before trying to read the body:

```js
async function fetchJSON(request) {
  try {
    const response = await fetch(request);
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Oops, we haven't got JSON!");
    }
    // Otherwise, we can read the body as JSON
  } catch (error) {
    console.error("Error:", error);
  }
}
```

#### Reading the response body

The `Response` interface provides a number of methods to retrieve the entire body contents in a variety of different formats:

- `Response.arrayBuffer()`
- `Response.blob()`
- `Response.formData()`
- `Response.json()`
- `Response.text()`

These are all asynchronous methods, returning a `Promise` which will be fulfilled with the body content.

In this example, we fetch an image and read it as a `Blob`, which we can then use to create an object URL:

```js
const image = document.querySelector("img");

const url = "flowers.jpg";

async function setImage() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    image.src = objectURL;
  } catch (e) {
    console.error(e);
  }
}
```

The method will throw an exception if the response body is not in the appropriate format: for example, if you call `json()` on a response that can't be parsed as JSON.

#### Streaming the response body

Request and response bodies are actually `ReadableStream` objects, and whenever you read them, you're streaming the content. This is good for memory efficiency, because the browser doesn't have to buffer the entire response in memory before the caller retrieves it using a method like `json()`.

This also means that the caller can process the content incrementally as it is received.

For example, consider a `GET` request that fetches a large text file and processes it in some way, or displays it to the user:

```js
const url = "https://www.example.org/a-large-file.txt";

async function fetchText(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const text = await response.text();
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}
```

If we use `Response.text()`, as above, we must wait until the whole file has been received before we can process any of it.

If we stream the response instead, we can process chunks of the body as they are received from the network:

```js
const url = "https://www.example.org/a-large-file.txt";

async function fetchTextAsStream(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const stream = response.body.pipeThrough(new TextDecoderStream());
    for await (const value of stream) {
      console.log(value);
    }
  } catch (e) {
    console.error(e);
  }
}
```

In this example, we `iterate asynchronously` over the stream, processing each chunk as it arrives.

Note that when you access the body directly like this, you get the raw bytes of the response and must transform it yourself. In this case we call `ReadableStream.pipeThrough()` to pipe the response through a `TextDecoderStream`, which decodes the UTF-8-encoded body data as text.

#### Processing a text file line by line

In the example below, we fetch a text resource and process it line by line, using a regular expression to look for line endings. For simplicity, we assume the text is UTF-8, and don't handle fetch errors:

```js
async function* makeTextFileLineIterator(fileURL) {
  const response = await fetch(fileURL);
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

  let { value: chunk = "", done: readerDone } = await reader.read();

  const newline = /\r?\n/g;
  let startIndex = 0;

  while (true) {
    const result = newline.exec(chunk);
    if (!result) {
      if (readerDone) break;
      const remainder = chunk.slice(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read());
      chunk = remainder + (chunk || "");
      startIndex = newline.lastIndex = 0;
      continue;
    }
    yield chunk.substring(startIndex, result.index);
    startIndex = newline.lastIndex;
  }

  if (startIndex < chunk.length) {
    // Last line didn't end in a newline char
    yield chunk.substring(startIndex);
  }
}

async function run(urlOfFile) {
  for await (const line of makeTextFileLineIterator(urlOfFile)) {
    processLine(line);
  }
}

function processLine(line) {
  console.log(line);
}

run("https://www.example.org/a-large-file.txt");
```

#### Locked and disturbed streams

The consequences of request and response bodies being streams are that:

- if a reader has been attached to a stream using `ReadableStream.getReader()`, then the stream is _locked_, and nothing else can read the stream.
- if any content has been read from the stream, then the stream is _disturbed_, and nothing else can read from the stream.

This means it's not possible to read the same response (or request) body more than once:

```js
async function getData() {
  const url = "https://example.org/products.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result1 = await response.json();
    const result2 = await response.json(); // will throw
  } catch (error) {
    console.error(error.message);
  }
}
```

If you do need to read the body more than once, you must call `Response.clone()` before reading the body:

```js
async function getData() {
  const url = "https://example.org/products.json";
  try {
    const response1 = await fetch(url);
    if (!response1.ok) {
      throw new Error(`Response status: ${response1.status}`);
    }

    const response2 = response1.clone();

    const result1 = await response1.json();
    const result2 = await response2.json();
  } catch (error) {
    console.error(error.message);
  }
}
```

This is a common pattern when [implementing an offline cache with service workers](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching). The service worker wants to return the response to the app, but also to cache the response. So it clones the response, returns the original, and caches the clone:

```js
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open("MyCache_1");
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  if (precachedResources.includes(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
  }
});
```

## Closures

> **Source:** [Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/closure)

A **closure** is the combination of a function bundled together (enclosed) with references to its surrounding state (the **lexical environment**). In other words, a closure gives a function access to its outer scope. In JavaScript, closures are created every time a function is created, at function creation time.

### Lexical scoping

Consider the following example code:

```js
function init() {
  var name = "Mozilla"; // name is a local variable created by init
  function displayName() {
    // displayName() is the inner function, that forms a closure
    console.log(name); // use variable declared in the parent function
  }
  displayName();
}
init();
```

`init()` creates a local variable called `name` and a function called `displayName()`. The `displayName()` function is an inner function that is defined inside `init()` and is available only within the body of the `init()` function. Note that the `displayName()` function has no local variables of its own. However, since inner functions have access to the variables of outer scopes, `displayName()` can access the variable `name` declared in the parent function, `init()`.

If you run this code in your console, you can see that the `console.log()` statement within the `displayName()` function successfully displays the value of the `name` variable, which is declared in its parent function. This is an example of _lexical scoping_, which describes how a parser resolves variable names when functions are nested. The word _lexical_ refers to the fact that lexical scoping uses the location where a variable is declared within the source code to determine where that variable is available. Nested functions have access to variables declared in their outer scope.

#### Scoping with let and const

Traditionally (before ES6), JavaScript variables only had two kinds of scopes: _function scope_ and _global scope_. Variables declared with `var` are either function-scoped or global-scoped, depending on whether they are declared within a function or outside a function. This can be tricky, because blocks with curly braces do not create scopes:

```js
if (Math.random() > 0.5) {
  var x = 1;
} else {
  var x = 2;
}
console.log(x);
```

For people from other languages (e.g., C, Java) where blocks create scopes, the above code should throw an error on the `console.log` line, because we are outside the scope of `x` in either block. However, because blocks don't create scopes for `var`, the `var` statements here actually create a global variable. There is also [a practical example](#creating_closures_in_loops_a_common_mistake) introduced below that illustrates how this can cause actual bugs when combined with closures.

In ES6, JavaScript introduced the `let` and `const` declarations, which, among other things like [temporal dead zones](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz), allow you to create block-scoped variables.

```js
if (Math.random() > 0.5) {
  const x = 1;
} else {
  const x = 2;
}
console.log(x); // ReferenceError: x is not defined
```

In essence, blocks are finally treated as scopes in ES6, but only if you declare variables with `let` or `const`. In addition, ES6 introduced [modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), which introduced another kind of scope. Closures are able to capture variables in all these scopes, which we will introduce later.

### Closure

Consider the following code example:

```js
function makeFunc() {
  const name = "Mozilla";
  function displayName() {
    console.log(name);
  }
  return displayName;
}

const myFunc = makeFunc();
myFunc();
```

Running this code has exactly the same effect as the previous example of the `init()` function above. What's different (and interesting) is that the `displayName()` inner function is returned from the outer function _before being executed_.

At first glance, it might seem unintuitive that this code still works. In some programming languages, the local variables within a function exist for just the duration of that function's execution. Once `makeFunc()` finishes executing, you might expect that the `name` variable would no longer be accessible. However, because the code still works, this is obviously not the case in JavaScript.

The reason is that functions in JavaScript form closures. A _closure_ is the combination of a function and the lexical environment within which that function was declared. This environment consists of any variables that were in-scope at the time the closure was created. In this case, `myFunc` is a reference to the instance of the function `displayName` that is created when `makeFunc` is run. The instance of `displayName` maintains a reference to its lexical environment, within which the variable `name` exists. For this reason, when `myFunc` is invoked, the variable `name` remains available for use, and "Mozilla" is passed to `console.log`.

Here's a slightly more interesting example—a `makeAdder` function:

```js
function makeAdder(x) {
  return function (y) {
    return x + y;
  };
}

const add5 = makeAdder(5);
const add10 = makeAdder(10);

console.log(add5(2)); // 7
console.log(add10(2)); // 12
```

In this example, we have defined a function `makeAdder(x)`, that takes a single argument `x`, and returns a new function. The function it returns takes a single argument `y`, and returns the sum of `x` and `y`.

In essence, `makeAdder` is a function factory. It creates functions that can add a specific value to their argument. In the above example, the function factory creates two new functions—one that adds five to its argument, and one that adds 10.

`add5` and `add10` both form closures. They share the same function body definition, but store different lexical environments. In `add5`'s lexical environment, `x` is 5, while in the lexical environment for `add10`, `x` is 10.

### Practical closures

Closures are useful because they let you associate data (the lexical environment) with a function that operates on that data. This has obvious parallels to object-oriented programming, where objects allow you to associate data (the object's properties) with one or more methods.

Consequently, you can use a closure anywhere that you might normally use an object with only a single method.

Situations where you might want to do this are particularly common on the web. Much of the code written in front-end JavaScript is event-based. You define some behavior, and then attach it to an event that is triggered by the user (such as a click or a keypress). The code is attached as a callback (a single function that is executed in response to the event).

For instance, suppose we want to add buttons to a page to adjust the text size. One way of doing this is to specify the font-size of the `body` element (in pixels), and then set the size of the other elements on the page (such as headers) using the relative `em` unit:

```css
body {
  font-family: "Helvetica", "Arial", sans-serif;
  font-size: 12px;
}

h1 {
  font-size: 1.5em;
}

h2 {
  font-size: 1.2em;
}
```

Such interactive text size buttons can change the `font-size` property of the `body` element, and the adjustments are picked up by other elements on the page thanks to the relative units.

Here's the JavaScript:

```js
function makeSizer(size) {
  return () => {
    document.body.style.fontSize = `${size}px`;
  };
}

const size12 = makeSizer(12);
const size14 = makeSizer(14);
const size16 = makeSizer(16);
```

`size12`, `size14`, and `size16` are now functions that resize the body text to 12, 14, and 16 pixels, respectively. You can attach them to buttons as demonstrated in the following code example.

```js
document.getElementById("size-12").onclick = size12;
document.getElementById("size-14").onclick = size14;
document.getElementById("size-16").onclick = size16;
```

```html
<button id="size-12">12</button>
<button id="size-14">14</button>
<button id="size-16">16</button>
<p>This is some text that will change size when you click the buttons above.</p>
```

### Emulating private methods with closures

Languages such as Java allow you to declare methods as private, meaning that they can be called only by other methods in the same class.

JavaScript, prior to [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), didn't have a native way of declaring [private methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements#private_methods), but it was possible to emulate private methods using closures. Private methods aren't just useful for restricting access to code. They also provide a powerful way of managing your global namespace.

The following code illustrates how to use closures to define public functions that can access private functions and variables. Note that these closures follow the [Module Design Pattern](https://www.google.com/search?q=javascript+module+pattern).

```js
const counter = (function () {
  let privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }

  return {
    increment() {
      changeBy(1);
    },

    decrement() {
      changeBy(-1);
    },

    value() {
      return privateCounter;
    },
  };
})();

console.log(counter.value()); // 0.

counter.increment();
counter.increment();
console.log(counter.value()); // 2.

counter.decrement();
console.log(counter.value()); // 1.
```

In previous examples, each closure had its own lexical environment. Here though, there is a single lexical environment that is shared by the three functions: `counter.increment`, `counter.decrement`, and `counter.value`.

The shared lexical environment is created in the body of an anonymous function, _which is executed as soon as it has been defined_ (also known as an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)). The lexical environment contains two private items: a variable called `privateCounter`, and a function called `changeBy`. You can't access either of these private members from outside the anonymous function. Instead, you indirectly access them using the three public functions that are returned from the anonymous wrapper.

Those three public functions form closures that share the same lexical environment. Thanks to JavaScript's lexical scoping, they each have access to the `privateCounter` variable and the `changeBy` function.

```js
function makeCounter() {
  let privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }
  return {
    increment() {
      changeBy(1);
    },

    decrement() {
      changeBy(-1);
    },

    value() {
      return privateCounter;
    },
  };
}

const counter1 = makeCounter();
const counter2 = makeCounter();

console.log(counter1.value()); // 0.

counter1.increment();
counter1.increment();
console.log(counter1.value()); // 2.

counter1.decrement();
console.log(counter1.value()); // 1.
console.log(counter2.value()); // 0.
```

Notice how the two counters maintain their independence from one another. Each closure references a different version of the `privateCounter` variable through its own closure. Each time one of the counters is called, its lexical environment changes by changing the value of this variable. Changes to the variable value in one closure don't affect the value in the other closure.

> **Note:**
> Using closures in this way provides benefits that are normally associated with object-oriented programming. In particular, _data hiding_ and _encapsulation_.

### Closure scope chain

A nested function's access to the outer function's scope includes the enclosing scope of the outer function—effectively creating a chain of function scopes. To demonstrate, consider the following example code.

```js
// global scope
const e = 10;
function sum(a) {
  return function (b) {
    return function (c) {
      // outer functions scope
      return function (d) {
        // local scope
        return a + b + c + d + e;
      };
    };
  };
}

console.log(sum(1)(2)(3)(4)); // 20
```

You can also write without anonymous functions:

```js
// global scope
const e = 10;
function sum(a) {
  return function sum2(b) {
    return function sum3(c) {
      // outer functions scope
      return function sum4(d) {
        // local scope
        return a + b + c + d + e;
      };
    };
  };
}

const sum2 = sum(1);
const sum3 = sum2(2);
const sum4 = sum3(3);
const result = sum4(4);
console.log(result); // 20
```

In the example above, there's a series of nested functions, all of which have access to the outer functions' scope. In this context, we can say that closures have access to _all_ outer scopes.

Closures can capture variables in block scopes and module scopes as well. For example, the following creates a closure over the block-scoped variable `y`:

```js
function outer() {
  let getY;
  {
    const y = 6;
    getY = () => y;
  }
  console.log(typeof y); // undefined
  console.log(getY()); // 6
}

outer();
```

Closures over modules can be more interesting.

```js
// myModule.js
let x = 5;
export const getX = () => x;
export const setX = (val) => {
  x = val;
};
```

Here, the module exports a pair of getter-setter functions, which close over the module-scoped variable `x`. Even when `x` is not directly accessible from other modules, it can be read and written with the functions.

```js
import { getX, setX } from "./myModule.js";

console.log(getX()); // 5
setX(6);
console.log(getX()); // 6
```

Closures can close over imported values as well, which are regarded as _live bindings_, because when the original value changes, the imported one changes accordingly.

```js
// myModule.js
export let x = 1;
export const setX = (val) => {
  x = val;
};
```

```js
// closureCreator.js
import { x } from "./myModule.js";

export const getX = () => x; // Close over an imported live binding
```

```js
import { getX } from "./closureCreator.js";
import { setX } from "./myModule.js";

console.log(getX()); // 1
setX(2);
console.log(getX()); // 2
```

### Creating closures in loops: A common mistake

Prior to the introduction of the [`let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) keyword, a common problem with closures occurred when you created them inside a loop. To demonstrate, consider the following example code.

```html
<p id="help">Helpful notes will appear here</p>
<p>Email: <input type="text" id="email" name="email" /></p>
<p>Name: <input type="text" id="name" name="name" /></p>
<p>Age: <input type="text" id="age" name="age" /></p>
```

```js
function showHelp(help) {
  document.getElementById("help").textContent = help;
}

function setupHelp() {
  var helpText = [
    { id: "email", help: "Your email address" },
    { id: "name", help: "Your full name" },
    { id: "age", help: "Your age (you must be over 16)" },
  ];

  for (var i = 0; i < helpText.length; i++) {
    // Culprit is the use of `var` on this line
    var item = helpText[i];
    document.getElementById(item.id).onfocus = function () {
      showHelp(item.help);
    };
  }
}

setupHelp();
```

The `helpText` array defines three helpful hints, each associated with the ID of an input field in the document. The loop cycles through these definitions, hooking up an `onfocus` event to each one that shows the associated help method.

If you try this code out, you'll see that it doesn't work as expected. No matter what field you focus on, the message about your age will be displayed.

The reason for this is that the functions assigned to `onfocus` form closures; they consist of the function definition and the captured environment from the `setupHelp` function's scope. Three closures have been created by the loop, but each one shares the same single lexical environment, which has a variable with changing values (`item`). This is because the variable `item` is declared with `var` and thus has function scope due to hoisting. The value of `item.help` is determined when the `onfocus` callbacks are executed. Because the loop has already run its course by that time, the `item` variable object (shared by all three closures) has been left pointing to the last entry in the `helpText` list.

One solution in this case is to use more closures: in particular, to use a function factory as described earlier:

```html
<p id="help">Helpful notes will appear here</p>
<p>Email: <input type="text" id="email" name="email" /></p>
<p>Name: <input type="text" id="name" name="name" /></p>
<p>Age: <input type="text" id="age" name="age" /></p>
```

```js
function showHelp(help) {
  document.getElementById("help").textContent = help;
}

function makeHelpCallback(help) {
  return function () {
    showHelp(help);
  };
}

function setupHelp() {
  var helpText = [
    { id: "email", help: "Your email address" },
    { id: "name", help: "Your full name" },
    { id: "age", help: "Your age (you must be over 16)" },
  ];

  for (var i = 0; i < helpText.length; i++) {
    var item = helpText[i];
    document.getElementById(item.id).onfocus = makeHelpCallback(item.help);
  }
}

setupHelp();
```

This works as expected. Rather than the callbacks all sharing a single lexical environment, the `makeHelpCallback` function creates _a new lexical environment_ for each callback, in which `help` refers to the corresponding string from the `helpText` array.

One other way to write the above using anonymous closures is:

```js
function showHelp(help) {
  document.getElementById("help").textContent = help;
}

function setupHelp() {
  var helpText = [
    { id: "email", help: "Your email address" },
    { id: "name", help: "Your full name" },
    { id: "age", help: "Your age (you must be over 16)" },
  ];

  for (var i = 0; i < helpText.length; i++) {
    (function () {
      var item = helpText[i];
      document.getElementById(item.id).onfocus = function () {
        showHelp(item.help);
      };
    })(); // Immediate event listener attachment with the current value of item (preserved until iteration).
  }
}

setupHelp();
```

If you don't want to use more closures, you can use the [`let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) or [`const`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) keyword:

```js
function showHelp(help) {
  document.getElementById("help").textContent = help;
}

function setupHelp() {
  const helpText = [
    { id: "email", help: "Your email address" },
    { id: "name", help: "Your full name" },
    { id: "age", help: "Your age (you must be over 16)" },
  ];

  for (let i = 0; i < helpText.length; i++) {
    const item = helpText[i];
    document.getElementById(item.id).onfocus = () => {
      showHelp(item.help);
    };
  }
}

setupHelp();
```

This example uses `const` instead of `var`, so every closure binds the block-scoped variable, meaning that no additional closures are required.

If you are writing modern JavaScript anyway, you can consider more alternatives to the plain `for` loop, such as using `for...of` loop and declaring `item` as `let` or `const`, or using the `forEach()` method, which both avoid the closure problem.

```js
for (const item of helpText) {
  document.getElementById(item.id).onfocus = () => {
    document.getElementById("help").textContent = item.help;
  };
}

helpText.forEach((item) => {
  document.getElementById(item.id).onfocus = () => {
    showHelp(item.help);
  };
});
```

### Performance considerations

As mentioned previously, each function instance manages its own scope and closure. Therefore, it is unwise to unnecessarily create functions within other functions if closures are not needed for a particular task, as it will negatively affect script performance both in terms of processing speed and memory consumption.

For instance, when creating a new object/class, methods should normally be associated to the object's prototype rather than defined into the object constructor. The reason is that whenever the constructor is called, the methods would get reassigned (that is, for every object creation).

Consider the following case:

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
  this.getName = function () {
    return this.name;
  };

  this.getMessage = function () {
    return this.message;
  };
}
```

Because the previous code does not take advantage of the benefits of using closures in this particular instance, we could instead rewrite it to avoid using closures as follows:

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype = {
  getName() {
    return this.name;
  },
  getMessage() {
    return this.message;
  },
};
```

However, redefining the prototype is not recommended. The following example instead appends to the existing prototype:

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype.getName = function () {
  return this.name;
};
MyObject.prototype.getMessage = function () {
  return this.message;
};
```

In the two previous examples, the inherited prototype can be shared by all objects and the method definitions need not occur at every object creation. See [Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain) for more.

## Higher-Order Functions

> **Source:** [First-class function](https://developer.mozilla.org/en-US/docs/Glossary/First-class_Function), [Callback function](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/function-basics)

### First-class function

A programming language is said to have **First-class functions** when functions in that language are treated like any other variable. For example, in such a language, a function can be passed as an argument to other functions, can be returned by another function and can be assigned as a value to a variable.

#### Examples

##### Assigning a function to a variable

```js
const foo = () => {
  console.log("foobar");
};
foo(); // Invoke it using the variable
// foobar
```

We assigned an _Anonymous Function_ to a Variable, then we used that variable to invoke the function by adding parentheses `()` at the end.

> **Note:**
> Even if your function was named, you can use the variable name to invoke it. Naming it will be helpful when debugging your code. _But it won't affect the way we invoke it._

##### Passing a function as an argument

```js
function sayHello() {
  return "Hello, ";
}
function greeting(helloMessage, name) {
  console.log(helloMessage() + name);
}
// Pass `sayHello` as an argument to `greeting` function
greeting(sayHello, "JavaScript!");
// Hello, JavaScript!
```

We are passing our `sayHello()` function as an argument to the `greeting()` function, this explains how we are treating the function as a value.

> **Note:**
> The function that we pass as an argument to another function is called a _callback function_. _`sayHello()` is a callback function._

##### Returning a function

```js
function sayHello() {
  return () => {
    console.log("Hello!");
  };
}
```

In this example, we are returning a function from another function - _We can return a function because functions in JavaScript are treated as values._

> **Note:**
> A function that returns a function or takes other functions as arguments is called a _higher-order function_.

### Callback function

A **callback function** is a function passed into another function as an argument, which is then invoked inside the outer function to complete some kind of routine or action.

The consumer of a callback-based API writes a function that is passed into the API. The provider of the API (called the _caller_) takes the function and calls back (or executes) the function at some point inside the caller's body. The caller is responsible for passing the right parameters into the callback function. The caller may also expect a particular return value from the callback function, which is used to instruct further behavior of the caller.

There are two ways in which the callback may be called: _synchronous_ and _asynchronous_. Synchronous callbacks are called immediately after the invocation of the outer function, with no intervening asynchronous tasks, while asynchronous callbacks are called at some point later, after an asynchronous operation has completed.

Understanding whether the callback is synchronously or asynchronously called is particularly important when analyzing side effects. Consider the following example:

```js
let value = 1;

doSomething(() => {
  value = 2;
});

console.log(value); // 1 or 2?
```

If `doSomething` calls the callback synchronously, then the last statement would log `2` because `value = 2` is synchronously executed; otherwise, if the callback is asynchronous, the last statement would log `1` because `value = 2` is only executed after the `console.log` statement.

Examples of synchronous callbacks include the callbacks passed to `Array.prototype.map()`, `Array.prototype.forEach()`, etc. Examples of asynchronous callbacks include the callbacks passed to `setTimeout()` and `Promise.prototype.then()`. Here are example implementations of `doSomething` that call the callback synchronously and asynchronously:

```js
// Synchronous
function doSomething(callback) {
  callback();
}

// Asynchronous
function doSomething(callback) {
  setTimeout(callback, 0);
}
```

The [Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#timing) guide has more information on the timing of asynchronous callbacks.

## Immutability

> **Source:** [const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const), [Immutable](https://developer.mozilla.org/en-US/docs/Glossary/Immutable), [Object.freeze()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze), [Window: structuredClone() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/object-copy)

### const

The **`const`** declaration declares block-scoped local variables. The value of a constant can't be changed through reassignment using the [assignment operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Assignment), but if a constant is an [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#objects), its properties can be added, updated, or removed.

```js
const number = 42;

try {
  number = 99;
} catch (err) {
  console.log(err);
  // Expected output: TypeError: invalid assignment to const 'number'
  // (Note: the exact output may be browser-dependent)
}

console.log(number);
// Expected output: 42
```

#### Syntax

```js
const name1 = value1;
const name1 = value1, name2 = value2;
const name1 = value1, name2 = value2, /* …, */ nameN = valueN;
```

- `nameN`
  - : The name of the variable to declare. Each must be a legal JavaScript [identifier](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers) or a [destructuring binding pattern](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring).
- `valueN`
  - : Initial value of the variable. It can be any legal expression.

#### Description

The `const` declaration is very similar to `let`:

- `const` declarations are scoped to blocks as well as functions.
- `const` declarations can only be accessed after the place of declaration is reached (see [temporal dead zone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz)). For this reason, `const` declarations are commonly regarded as [non-hoisted](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting).
- `const` declarations do not create properties on `globalThis` when declared at the top level of a script.
- `const` declarations cannot be [redeclared](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#redeclarations) by any other declaration in the same scope.
- `const` begins [_declarations_, not _statements_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements#what_are_statements_declarations_and_expressions). That means you cannot use a lone `const` declaration as the body of a block (which makes sense, since there's no way to access the variable).

  ```js example-bad
  if (true) const a = 1; // SyntaxError: Lexical declaration cannot appear in a single-statement context
  ```

An initializer for a constant is required. You must specify its value in the same declaration. (This makes sense, given that it can't be changed later.)

```js example-bad
const FOO; // SyntaxError: Missing initializer in const declaration
```

The `const` declaration creates an immutable reference to a value. It does _not_ mean the value it holds is immutable — just that the variable identifier cannot be reassigned. For instance, in the case where the content is an object, this means the object's contents (e.g., its properties) can be altered. You should understand `const` declarations as "create a variable whose _identity_ remains constant", not "whose _value_ remains constant" — or, "create immutable bindings", not "immutable values".

Many style guides (including [MDN's](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Code_style_guide/JavaScript#variable_declarations)) recommend using `const` over `let` whenever a variable is not reassigned in its scope. This makes the intent clear that a variable's type (or value, in the case of a primitive) can never change. Others may prefer `let` for non-primitives that are mutated.

The list that follows the `const` keyword is called a _binding list_ and is separated by commas, where the commas are _not_ [comma operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_operator) and the `=` signs are _not_ [assignment operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Assignment). Initializers of later variables can refer to earlier variables in the list.

#### Examples

##### Basic const usage

Constants can be declared with uppercase or lowercase, but a common convention is to use all-uppercase letters, especially for primitives because they are truly immutable.

```js
// define MY_FAV as a constant and give it the value 7
const MY_FAV = 7;

console.log(`my favorite number is: ${MY_FAV}`);
```

```js example-bad
// Re-assigning to a constant variable throws an error
MY_FAV = 20; // TypeError: Assignment to constant variable

// Redeclaring a constant throws an error
const MY_FAV = 20; // SyntaxError: Identifier 'MY_FAV' has already been declared
var MY_FAV = 20; // SyntaxError: Identifier 'MY_FAV' has already been declared
let MY_FAV = 20; // SyntaxError: Identifier 'MY_FAV' has already been declared
```

##### Block scoping

It's important to note the nature of block scoping.

```js
const MY_FAV = 7;

if (MY_FAV === 7) {
  // This is fine because it's in a new block scope
  const MY_FAV = 20;
  console.log(MY_FAV); // 20

  // var declarations are not scoped to blocks so this throws an error
  var MY_FAV = 20; // SyntaxError: Identifier 'MY_FAV' has already been declared
}

console.log(MY_FAV); // 7
```

##### const in objects and arrays

`const` also works on objects and arrays. Attempting to overwrite the object throws an error "Assignment to constant variable".

```js
const MY_OBJECT = { key: "value" };
MY_OBJECT = { OTHER_KEY: "value" };
```

However, object keys are not protected, so the following statement is executed without problem.

```js
MY_OBJECT.key = "otherValue";
```

You would need to use `Object.freeze()` to make an object immutable.

The same applies to arrays. Assigning a new array to the variable throws an error "Assignment to constant variable".

```js
const MY_ARRAY = [];
MY_ARRAY = ["B"];
```

Still, it's possible to push items into the array and thus mutate it.

```js
MY_ARRAY.push("A"); // ["A"]
```

##### Declaration with destructuring

The left-hand side of each `=` can also be a binding pattern. This allows creating multiple variables at once.

```js
const result = /(a+)(b+)(c+)/.exec("aaabcc");
const [, a, b, c] = result;
console.log(a, b, c); // "aaa" "b" "cc"
```

For more information, see [Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring).

### Immutable

An **immutable** value is one whose content cannot be changed without creating an entirely new value, in comparison with mutable values.

In JavaScript, primitive values are immutable — once a primitive value is created, it cannot be changed, although the variable that holds it may be reassigned another value.
By contrast, objects and arrays are mutable by default — their properties and elements can be changed without reassigning a new value.

It can be beneficial to use immutable objects for several reasons:

- To improve performance (no planning for the object's future changes)
- To reduce memory use (make object references instead of cloning the whole object)
- Thread-safety (multiple threads can reference the same object without interfering with one other)
- Lower developer mental burden (the object's state won't change and its behavior is always consistent)

Note that you can easily prove mutability: an object is mutable as long as it offers one way to change its properties. On the other hand, _immutability_ is hard to prove if there are no language semantics to secure it — it is a matter of developer contract. For example, `Object.freeze()` is a language-level method to make an object immutable in JavaScript.

### Object.freeze()

The **`Object.freeze()`** static method _freezes_ an object. Freezing an object [prevents extensions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions) and makes existing properties non-writable and non-configurable. A frozen object can no longer be changed: new properties cannot be added, existing properties cannot be removed, their enumerability, configurability, writability, or value cannot be changed, and the object's prototype cannot be re-assigned. `freeze()` returns the same object that was passed in.

Freezing an object is the highest integrity level that JavaScript provides.

```js
const obj = {
  prop: 42,
};

Object.freeze(obj);

obj.prop = 33;
// Throws an error in strict mode

console.log(obj.prop);
// Expected output: 42
```

#### Syntax

```js
Object.freeze(obj)
```

##### Parameters

- `obj`
  - : The object to freeze.

##### Return value

The object that was passed to the function.

#### Description

Freezing an object is equivalent to [preventing extensions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions) and then changing all existing [properties' descriptors'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#description) `configurable` to `false` — and for data properties, `writable` to `false` as well. Nothing can be added to or removed from the properties set of a frozen object. Any attempt to do so will fail, either silently or by throwing a `TypeError` exception (most commonly, but not exclusively, when in `strict mode`).

For data properties of a frozen object, their values cannot be changed since the `writable` and
`configurable` attributes are set to `false`. Accessor properties (getters and setters) work the same — the property value returned by the getter may still change, and the setter can still be called without throwing errors when setting the property. Note that values
that are objects can still be modified, unless they are also frozen. As an object, an
array can be frozen; after doing so, its elements cannot be altered and no elements can
be added to or removed from the array.

[Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements) are not properties and do not have the concept of property descriptors. Freezing an object with private elements does not prevent the values of these private elements from being changed. (Freezing objects is usually meant as a security measure against external code, but external code cannot access private elements anyway.) Private elements cannot be added or removed from the object, whether the object is frozen or not.

`freeze()` returns the same object that was passed into the function. It
_does not_ create a frozen copy.

A `TypedArray` or a `DataView` with elements will cause a `TypeError`,
as they are views over memory and will definitely cause other possible issues:

```js
Object.freeze(new Uint8Array(0)); // No elements
// Uint8Array []

Object.freeze(new Uint8Array(1)); // Has elements
// TypeError: Cannot freeze array buffer views with elements

Object.freeze(new DataView(new ArrayBuffer(32))); // No elements
// DataView {}

Object.freeze(new Float64Array(new ArrayBuffer(64), 32, 0)); // No elements
// Float64Array []

Object.freeze(new Float64Array(new ArrayBuffer(64), 32, 2)); // Has elements
// TypeError: Cannot freeze array buffer views with elements
```

Note that as the standard three properties (`buf.byteLength`,
`buf.byteOffset` and `buf.buffer`) are read-only (as are those of
an `ArrayBuffer` or `SharedArrayBuffer`), there is no reason for
attempting to freeze these properties.

Unlike `Object.seal()`, existing properties in objects frozen with `Object.freeze()` are made immutable and data properties cannot be re-assigned.

#### Examples

##### Freezing objects

```js
const obj = {
  prop() {},
  foo: "bar",
};

// Before freezing: new properties may be added,
// and existing properties may be changed or removed
obj.foo = "baz";
obj.lumpy = "woof";
delete obj.prop;

// Freeze.
const o = Object.freeze(obj);

// The return value is just the same object we passed in.
o === obj; // true

// The object has become frozen.
Object.isFrozen(obj); // === true

// Now any changes will fail
obj.foo = "quux"; // silently does nothing
// silently doesn't add the property
obj.quaxxor = "the friendly duck";

// In strict mode such attempts will throw TypeErrors
function fail() {
  "use strict";
  obj.foo = "sparky"; // throws a TypeError
  delete obj.foo; // throws a TypeError
  delete obj.quaxxor; // returns true since attribute 'quaxxor' was never added
  obj.sparky = "arf"; // throws a TypeError
}

fail();

// Attempted changes through Object.defineProperty;
// both statements below throw a TypeError.
Object.defineProperty(obj, "ohai", { value: 17 });
Object.defineProperty(obj, "foo", { value: "eit" });

// It's also impossible to change the prototype
// both statements below will throw a TypeError.
Object.setPrototypeOf(obj, { x: 20 });
obj.__proto__ = { x: 20 };
```

##### Freezing arrays

```js
const a = [0];
Object.freeze(a); // The array cannot be modified now.

a[0] = 1; // fails silently

// In strict mode such attempt will throw a TypeError
function fail() {
  "use strict";
  a[0] = 1;
}

fail();

// Attempted to push
a.push(2); // throws a TypeError
```

The object being frozen is _immutable_. However, it is not necessarily
_constant_. The following example shows that a frozen object is not constant
(freeze is shallow).

```js
const obj1 = {
  internal: {},
};

Object.freeze(obj1);
obj1.internal.a = "value";

obj1.internal.a; // 'value'
```

To be a constant object, the entire reference graph (direct and indirect references to
other objects) must reference only immutable frozen objects. The object being frozen is
said to be immutable because the entire object _state_ (values and references to
other objects) within the whole object is fixed. Note that strings, numbers, and
booleans are always immutable and that Functions and Arrays are objects.

##### Deep freezing

The result of calling `Object.freeze(object)` only applies to the
immediate properties of `object` itself and will prevent future property
addition, removal or value re-assignment operations _only_ on
`object`. If the value of those properties are objects themselves, those
objects are not frozen and may be the target of property addition, removal or value
re-assignment operations.

```js
const employee = {
  name: "Mayank",
  designation: "Developer",
  address: {
    street: "Rohini",
    city: "Delhi",
  },
};

Object.freeze(employee);

employee.name = "Dummy"; // fails silently in non-strict mode
employee.address.city = "Noida"; // attributes of child object can be modified

console.log(employee.address.city); // "Noida"
```

To make an object immutable, recursively freeze each non-primitive property (deep freeze). Use the pattern on a case-by-case basis based on your design when you know the object contains no [cycles](https://developer.mozilla.org/en-US/docs/<https://en.wikipedia.org/wiki/Cycle_(graph_theory)>) in the reference graph, otherwise an endless loop will be triggered. For example, functions created with the [`function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function) syntax have a [`prototype`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype) property with a `constructor` property that points to the function itself, so they have cycles by default. Other functions, such as [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), can still be frozen.

An enhancement to `deepFreeze()` would be to store the objects it has already visited, so you can suppress calling `deepFreeze()` recursively when an object is in the process of being made immutable. For one example, see [using `WeakSet` to detect circular references](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet#detecting_circular_references). You still run a risk of freezing an object that shouldn't be frozen, such as [`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window).

```js
function deepFreeze(object) {
  // Retrieve the property names defined on object
  const propNames = Reflect.ownKeys(object);

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = object[name];

    if ((value && typeof value === "object") || typeof value === "function") {
      deepFreeze(value);
    }
  }

  return Object.freeze(object);
}

const obj2 = {
  internal: {
    a: null,
  },
};

deepFreeze(obj2);

obj2.internal.a = "anotherValue"; // fails silently in non-strict mode
obj2.internal.a; // null
```

### Window: structuredClone() method

The **`structuredClone()`** method of the `Window` interface creates a [deep clone](https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy) of a value using the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

The method also allows [transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) in the original value to be _transferred_ rather than cloned to the new object.
Transferred objects are detached from the original object and attached to the new object; they are no longer accessible in the original object.

> **Note:**
> Up to Firefox 148, `structuredClone.call(iframe.contentWindow)` incorrectly created objects in the caller's [realm](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model#realms) instead of the iframe's realm. In Firefox 149, the implementation changed to instantiate objects in the `this` realm, so the method's behavior more closely matches the specification.
>
> Across all browsers, a direct call `structuredClone(value)` clones values in the caller's realm. From Firefox 149, [web extension content scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts) can call `window.structuredClone(value)` to clone values in the page's realm and `globalThis.structuredClone(value)` to clone into the realm of the content script. For more information, see [`structuredClone` in content scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts#structuredclone).

#### Syntax

```js
structuredClone(value)
structuredClone(value, options)
```

##### Parameters

- `value`
  - : The object to be cloned.
    This can be any [structured-cloneable type](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types).
- `options`
  - : An object with the following properties:
    - `transfer`
      - : An array of [transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) that will be moved rather than cloned to the returned object.

##### Return value

A [deep copy](https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy) of the original `value`.

##### Exceptions

- `DataCloneError` `DOMException`
  - : Thrown if any part of the input value is not serializable.

#### Description

This function can be used to [deep copy](https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy) JavaScript values.
It also supports circular references, as shown below:

```js
// Create an object with a value and a circular reference to itself.
const original = { name: "MDN" };
original.itself = original;

// Clone it
const clone = structuredClone(original);

console.assert(clone !== original); // the objects are not the same (not same identity)
console.assert(clone.name === "MDN"); // they do have the same values
console.assert(clone.itself === clone); // and the circular reference is preserved
```

##### Transferring values

[Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) (only) can be transferred rather than duplicated in the cloned object, using the `transfer` property of the `options` parameter. Transferring makes the original object unusable.

> **Note:**
> A scenario where this might be useful is when asynchronously validating some data in a buffer before saving it.
> To avoid the buffer being modified before the data is saved, you can clone the buffer and validate that data.
> If you also _transfer_ the data, any attempts to modify the original buffer will fail, preventing its accidental misuse.

This code shows how to clone an array and transfer its underlying resources to the new object.
On return, the original `uInt8Array.buffer` is cleared.

```js
// 16MB = 1024 * 1024 * 16
const uInt8Array = Uint8Array.from({ length: 1024 * 1024 * 16 }, (v, i) => i);

const transferred = structuredClone(uInt8Array, {
  transfer: [uInt8Array.buffer],
});
console.log(uInt8Array.byteLength); // 0
```

You can clone any number of objects and transfer any subset of those objects.
For example, this code transfers `arrayBuffer1` from the passed in value, but not `arrayBuffer2`.

```js
const transferred = structuredClone(
  { x: { y: { z: arrayBuffer1, w: arrayBuffer2 } } },
  { transfer: [arrayBuffer1] },
);
```

#### Examples

##### Cloning an object

In this example, we clone an object with one member, which is an array. After cloning, changes to each object do not affect the other object.

```js
const mushrooms1 = {
  amanita: ["muscaria", "virosa"],
};

const mushrooms2 = structuredClone(mushrooms1);

mushrooms2.amanita.push("pantherina");
mushrooms1.amanita.pop();

console.log(mushrooms2.amanita); // ["muscaria", "virosa", "pantherina"]
console.log(mushrooms1.amanita); // ["muscaria"]
```

##### Transferring an object

In this example we create an `ArrayBuffer` and then clone the object it is a member of, transferring the buffer. We can use the buffer in the cloned object, but if we try to use the original buffer we get an exception.

```js
// Create an ArrayBuffer with a size in bytes
const buffer = new ArrayBuffer(16);

const object1 = {
  buffer,
};

// Clone the object containing the buffer, and transfer it
const object2 = structuredClone(object1, { transfer: [buffer] });

// Create an array from the cloned buffer
const int32View2 = new Int32Array(object2.buffer);
int32View2[0] = 42;
console.log(int32View2[0]);

// Creating an array from the original buffer throws a TypeError
const int32View1 = new Int32Array(object1.buffer);
```

## Default Parameters

> **Source:** [Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/function-basics#default-values)

**Default function parameters** allow named parameters to be initialized with default values if no value or `undefined` is passed.

```js
function multiply(a, b = 1) {
  return a * b;
}

console.log(multiply(5, 2));
// Expected output: 10

console.log(multiply(5));
// Expected output: 5
```

### Syntax

```js
function fnName(param1 = defaultValue1, /* …, */ paramN = defaultValueN) {
  // …
}
```

### Description

In JavaScript, function parameters default to `undefined`. However, it's often useful to set a different default value. This is where default parameters can help.

In the following example, if no value is provided for `b` when `multiply` is called, `b`'s value would be `undefined` when evaluating `a * b` and `multiply` would return `NaN`.

```js
function multiply(a, b) {
  return a * b;
}

multiply(5, 2); // 10
multiply(5); // NaN !
```

In the past, the general strategy for setting defaults was to test parameter values in the function body and assign a value if they are `undefined`. In the following example, `b` is set to `1` if `multiply` is called with only one argument:

```js
function multiply(a, b) {
  b = typeof b !== "undefined" ? b : 1;
  return a * b;
}

multiply(5, 2); // 10
multiply(5); // 5
```

With default parameters, checks in the function body are no longer necessary. Now, you can assign `1` as the default value for `b` in the function head:

```js
function multiply(a, b = 1) {
  return a * b;
}

multiply(5, 2); // 10
multiply(5); // 5
multiply(5, undefined); // 5
```

Parameters are still set left-to-right, overwriting default parameters even if there are later parameters without defaults.

```js
function f(x = 1, y) {
  return [x, y];
}

f(); // [1, undefined]
f(2); // [2, undefined]
```

> **Note:**
> The first default parameter and all parameters after it will not contribute to the function's [`length`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length).

The default parameter initializers live in their own scope, which is a parent of the scope created for the function body.

This means that earlier parameters can be referred to in the initializers of later parameters. However, functions and variables declared in the function body cannot be referred to from default value parameter initializers; attempting to do so throws a run-time `ReferenceError`. This also includes [`var`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)-declared variables in the function body.

For example, the following function will throw a `ReferenceError` when invoked, because the default parameter value does not have access to the child scope of the function body:

```js
function f(a = go()) {
  function go() {
    return ":P";
  }
}

f(); // ReferenceError: go is not defined
```

This function will print the value of the _parameter_ `a`, because the variable `var a` is hoisted only to the top of the scope created for the function body, not the parent scope created for the parameter list, so its value is not visible to `b`.

```js
function f(a, b = () => console.log(a)) {
  var a = 1;
  b();
}

f(); // undefined
f(5); // 5
```

The default parameter allows any expression, but you cannot use `await` or `yield` that would pause the evaluation of the default expression. The parameter must be initialized _synchronously_.

```js
async function f(a = await Promise.resolve(1)) {
  return a;
}
```

> **Note:**
> Because the default parameter is evaluated when the function is called, not when the function is defined, the validity of the `await` and `yield` operators depends on the function itself, not its surrounding function. For example, if the current function is not `async`, `await` will be parsed as an identifier and follow normal [identifier syntax rules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers), even when this function is nested in an `async` function.

### Examples

#### Passing undefined vs. other falsy values

In the second call in this example, even if the first argument is set explicitly to `undefined` (though not `null` or other falsy values), the value of the `num` argument is still the default.

```js
function test(num = 1) {
  console.log(typeof num);
}

test(); // 'number' (num is set to 1)
test(undefined); // 'number' (num is set to 1 too)

// test with other falsy values:
test(""); // 'string' (num is set to '')
test(null); // 'object' (num is set to null)
```

#### Evaluated at call time

The default argument is evaluated at _call time_. Unlike with Python (for example), a new object is created each time the function is called.

```js
function append(value, array = []) {
  array.push(value);
  return array;
}

append(1); // [1]
append(2); // [2], not [1, 2]
```

This even applies to functions and variables:

```js
function callSomething(thing = something()) {
  return thing;
}

let numberOfTimesCalled = 0;
function something() {
  numberOfTimesCalled += 1;
  return numberOfTimesCalled;
}

callSomething(); // 1
callSomething(); // 2
```

#### Earlier parameters are available to later default parameters

Parameters defined earlier (to the left) are available to later default parameters:

```js
function greet(name, greeting, message = `${greeting} ${name}`) {
  return [name, greeting, message];
}

greet("David", "Hi"); // ["David", "Hi", "Hi David"]
greet("David", "Hi", "Happy Birthday!"); // ["David", "Hi", "Happy Birthday!"]
```

This functionality can be approximated like this, which demonstrates how many edge cases are handled:

```js
function go() {
  return ":P";
}

function withDefaults(
  a,
  b = 5,
  c = b,
  d = go(),
  e = this,
  f = arguments,
  g = this.value,
) {
  return [a, b, c, d, e, f, g];
}

function withoutDefaults(a, b, c, d, e, f, g) {
  switch (arguments.length) {
    case 0:
    case 1:
      b = 5;
    case 2:
      c = b;
    case 3:
      d = go();
    case 4:
      e = this;
    case 5:
      f = arguments;
    case 6:
      g = this.value;
  }
  return [a, b, c, d, e, f, g];
}

withDefaults.call({ value: "=^_^=" });
// [undefined, 5, 5, ":P", {value:"=^_^="}, arguments, "=^_^="]

withoutDefaults.call({ value: "=^_^=" });
// [undefined, 5, 5, ":P", {value:"=^_^="}, arguments, "=^_^="]
```

#### Destructured parameter with default value assignment

You can use default value assignment with the [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) syntax.

A common way of doing that is to set an empty object/array as the default value for the destructured parameter; for example: `[x = 1, y = 2] = []`. This makes it possible to pass nothing to the function and still have those values prefilled:

```js
function preFilledArray([x = 1, y = 2] = []) {
  return x + y;
}

preFilledArray(); // 3
preFilledArray([]); // 3
preFilledArray([2]); // 4
preFilledArray([2, 3]); // 5

// Works the same for objects:
function preFilledObject({ z = 3 } = {}) {
  return z;
}

preFilledObject(); // 3
preFilledObject({}); // 3
preFilledObject({ z: 2 }); // 2
```

## try/catch Error Handling

> **Source:** [try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/try-catch)

The **`try...catch`** statement is comprised of a `try` block and either a `catch` block, a `finally` block, or both. The code in the `try` block is executed first, and if it throws an exception, the code in the `catch` block will be executed. The code in the `finally` block will always be executed before control flow exits the entire construct.

```js
try {
  nonExistentFunction();
} catch (error) {
  console.error(error);
  // Expected output: ReferenceError: nonExistentFunction is not defined
  // (Note: the exact output may be browser-dependent)
}
```

### Syntax

```js
try {
  tryStatements
} catch (exceptionVar) {
  catchStatements
} finally {
  finallyStatements
}
```

- `tryStatements`
  - : The statements to be executed.
- `catchStatements`
  - : Statement that is executed if an exception is thrown in the `try` block.
- `exceptionVar`
  - : An optional [identifier or pattern](#catch_binding) to hold the caught exception for the associated `catch` block. If the `catch` block does not use the exception's value, you can omit the `exceptionVar` and its surrounding parentheses.
- `finallyStatements`
  - : Statements that are executed before control flow exits the `try...catch...finally` construct. These statements execute regardless of whether an exception was thrown or caught.

### Description

The `try` statement always starts with a `try` block. Then, a `catch` block or a `finally` block must be present. It's also possible to have both `catch` and `finally` blocks. This gives us three forms for the `try` statement:

- `try...catch`
- `try...finally`
- `try...catch...finally`

Unlike other constructs such as [`if`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else) or [`for`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for), the `try`, `catch`, and `finally` blocks must be _blocks_, instead of single statements.

```js example-bad
try doSomething(); // SyntaxError
catch (e) console.log(e);
```

A `catch` block contains statements that specify what to do if an exception is thrown in the `try` block. If any statement within the `try` block (or in a function called from within the `try` block) throws an exception, control is immediately shifted to the `catch` block. If no exception is thrown in the `try` block, the `catch` block is skipped.

The `finally` block will always execute before control flow exits the `try...catch...finally` construct. It always executes, regardless of whether an exception was thrown or caught.

You can nest one or more `try` statements. If an inner `try` statement does not have a `catch` block, the enclosing `try` statement's `catch` block is used instead.

You can also use the `try` statement to handle JavaScript exceptions. See the [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling#exception_handling_statements) for more information on JavaScript exceptions.

#### Catch binding

When an exception is thrown in the `try` block, `exceptionVar` (i.e., the `e` in `catch (e)`) holds the exception value. You can use this binding to get information about the exception that was thrown. This binding is only available in the `catch` block's scope.

It doesn't need to be a single identifier. You can use a [destructuring pattern](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) to assign multiple identifiers at once.

```js
try {
  throw new TypeError("oops");
} catch ({ name, message }) {
  console.log(name); // "TypeError"
  console.log(message); // "oops"
}
```

The bindings created by the `catch` clause live in the same scope as the `catch` block, so any variables declared in the `catch` block cannot have the same name as the bindings created by the `catch` clause. (There's [one exception to this rule](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Deprecated_and_obsolete_features#statements), but it's a deprecated syntax.)

```js example-bad
try {
  throw new TypeError("oops");
} catch ({ name, message }) {
  var name; // SyntaxError: Identifier 'name' has already been declared
  let message; // SyntaxError: Identifier 'message' has already been declared
}
```

The exception binding is writable. For example, you may want to normalize the exception value to make sure it's an `Error` object.

```js
try {
  throw "Oops; this is not an Error object";
} catch (e) {
  if (!(e instanceof Error)) {
    e = new Error(e);
  }
  console.error(e.message);
}
```

If you don't need the exception value, you can omit it along with the enclosing parentheses.

```js
function isValidJSON(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}
```

#### The finally block

The `finally` block contains statements to execute after the `try` block and `catch` block(s) execute, but before the statements following the `try...catch...finally` block. Control flow will always enter the `finally` block, which can proceed in one of the following ways:

- Immediately after the control flow exits the `try` block in a `try...finally` construct (either after the last statement or a `throw`, `return`, `break`, or `continue` statement);
- Immediately after the control flow exits the `catch` block in a `try...catch...finally` construct;
- Immediately after the control flow exits the `try` block in a `try...catch...finally` construct, unless it exits via a `throw` statement (in which case control flow enters the `catch` block first).

If the `finally` block is entered after a control flow statement (`return`, `throw`, `break`, `continue`) in the `try` or `catch` block, the effect of this statement is deferred until after the last statement executed in the `finally` block. For example, if an exception is thrown from the `try` block, even when there's no `catch` block to handle the exception, the `finally` block still executes, and the exception is thrown immediately after the `finally` block finishes executing.

However, there is one exception to this rule: if the last statement executed in the `finally` block is itself a control flow statement, that statement will override the effect of the previous one (no deferral); see [returning from a `finally` block](#returning_from_a_finally_block) for examples. It is generally a bad idea to use control flow statements (`return`, `throw`, `break`, `continue`) in the `finally` block because they can override the effect of previously executed control flow statements, which is rarely intended. Most of the time, the `finally` block should be reserved for cleanup code that does not modify the main logic.

### Examples

#### Unconditional catch block

When a `catch` block is used, the `catch` block is executed when any exception is thrown from within the `try` block. For example, when the exception occurs in the following code, control transfers to the `catch` block.

```js
try {
  throw new Error("My exception"); // generates an exception
} catch (e) {
  // statements to handle any exceptions
  logMyErrors(e); // pass exception object to error handler
}
```

The `catch` block specifies an identifier (`e` in the example above) that holds the value of the exception; this value is only available in the scope of the `catch` block.

#### Conditional catch blocks

You can create "Conditional `catch` blocks" by combining `try...catch` blocks with `if...else if...else` structures, like this:

```js
try {
  myRoutine(); // may throw three types of exceptions
} catch (e) {
  if (e instanceof TypeError) {
    // statements to handle TypeError exceptions
  } else if (e instanceof RangeError) {
    // statements to handle RangeError exceptions
  } else if (e instanceof EvalError) {
    // statements to handle EvalError exceptions
  } else {
    // statements to handle any unspecified exceptions
    logMyErrors(e); // pass exception object to error handler
  }
}
```

A common use case for this is to only catch (and silence) a small subset of expected errors, and then re-throw the error in other cases:

```js
try {
  myRoutine();
} catch (e) {
  if (e instanceof RangeError) {
    // statements to handle this very common expected error
  } else {
    throw e; // re-throw the error unchanged
  }
}
```

This may mimic the syntax from other languages, like Java:

```java
try {
  myRoutine();
} catch (RangeError e) {
  // statements to handle this very common expected error
}
// Other errors are implicitly re-thrown
```

#### Nested try blocks

First, let's see what happens with this:

```js
try {
  try {
    throw new Error("oops");
  } finally {
    console.log("finally");
  }
} catch (ex) {
  console.error("outer", ex.message);
}

// Logs:
// "finally"
// "outer" "oops"
```

Now, if we already caught the exception in the inner `try` block by adding a `catch` block:

```js
try {
  try {
    throw new Error("oops");
  } catch (ex) {
    console.error("inner", ex.message);
  } finally {
    console.log("finally");
  }
} catch (ex) {
  console.error("outer", ex.message);
}

// Logs:
// "inner" "oops"
// "finally"
```

And now, let's rethrow the error.

```js
try {
  try {
    throw new Error("oops");
  } catch (ex) {
    console.error("inner", ex.message);
    throw ex;
  } finally {
    console.log("finally");
  }
} catch (ex) {
  console.error("outer", ex.message);
}

// Logs:
// "inner" "oops"
// "finally"
// "outer" "oops"
```

Any given exception will be caught only once by the nearest enclosing `catch` block unless it is rethrown. Of course, any new exceptions raised in the "inner" block (because the code in `catch` block may do something that throws), will be caught by the "outer" block.

#### Resource cleanup using finally

The following example shows one use case for the `finally` block. The code opens a file and then executes statements that use the file; the `finally` block makes sure the file always closes after it is used even if an exception was thrown.

```js
openMyFile();
try {
  // tie up a resource
  writeMyFile(theData);
} finally {
  closeMyFile(); // always close the resource
  // any uncaught exception is deferred here
}
```

In the same way, the effect of any `return` statement in the `try` block is deferred at the end of the `finally` block, although the return value expression is evaluated before entering the `finally` block.

```js
function safeWriteMyFile() {
  openMyFile();
  try {
    return writeMyFile(theData); // function call is evaluated
  } finally {
    closeMyFile(); // always close the resource
    // return is deferred here
  }
}
```

#### Returning from a finally block

The following example illustrates how control flow statements in the `finally` block behave. When control flow exits the `try` block via the first `return` statement, the return value expression (`order.sort()`) is evaluated before entering the `finally` block, and the function is planned to return that value after the `finally` block finishes executing. However, the `return` statement in the `finally` block overrides the effect of the previous `return` statement, including its return value.

```js
function doIt() {
  const order = ["z"];
  try {
    order.push("try");
    return order.sort(); // "z" is now after "try"
  } finally {
    order.push("finally");
    return order;
  }
}
doIt();
// returns ["try", "z", "finally"], not ["finally", "try", "z"] or ["try", "z"]
```

The same logic applies to other control flow statements. Here, the function is first planned to throw the value `"catch"`, but instead returns the value `"finally"`.

```js
function doIt() {
  try {
    throw "try"; // makes control flow enter the `catch` block
  } catch {
    throw "catch"; // makes control flow enter the `finally` block
  } finally {
    return "finally"; // returns "finally" instead of throwing "catch"
  }
}
doIt(); // returns "finally"
```

Again, control flow statements are discouraged in the `finally` block because this effect is likely not intended.

## Object.keys(), Object.values(), Object.entries()

> **Source:** [Object.keys()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys), [Object.values()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values), [Object.entries()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/keys-values-entries)

### Object.keys()

The **`Object.keys()`** static method returns an array of a given object's own enumerable string-keyed property names.

```js
const object = {
  a: "some string",
  b: 42,
  c: false,
};

console.log(Object.keys(object));
// Expected output: Array ["a", "b", "c"]
```

#### Syntax

```js
Object.keys(obj)
```

##### Parameters

- `obj`
  - : An object.

##### Return value

An array of strings representing the given object's own enumerable string-keyed property keys.

#### Description

`Object.keys()` returns an array whose elements are strings corresponding to the enumerable string-keyed property names found directly upon `object`. This is the same as iterating with a `for...in` loop, except that a `for...in` loop enumerates properties in the prototype chain as well. The order of the array returned by `Object.keys()` is the same as that provided by a `for...in` loop.

If you need the property values, use `Object.values()` instead. If you need both the property keys and values, use `Object.entries()` instead.

#### Examples

##### Using Object.keys()

```js
// Basic array
const arr = ["a", "b", "c"];
console.log(Object.keys(arr)); // ['0', '1', '2']

// Array-like object
const obj = { 0: "a", 1: "b", 2: "c" };
console.log(Object.keys(obj)); // ['0', '1', '2']

// Array-like object with random key ordering
const anObj = { 100: "a", 2: "b", 7: "c" };
console.log(Object.keys(anObj)); // ['2', '7', '100']

// getFoo is a non-enumerable property
const myObj = Object.create(
  {},
  {
    getFoo: {
      value() {
        return this.foo;
      },
    },
  },
);
myObj.foo = 1;
console.log(Object.keys(myObj)); // ['foo']
```

If you want _all_ string-keyed own properties, including non-enumerable ones, see `Object.getOwnPropertyNames()`.

##### Using Object.keys() on primitives

Non-object arguments are [coerced to objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object#object_coercion). [`undefined`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined) and [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) cannot be coerced to objects and throw a `TypeError` upfront. Only strings may have own enumerable properties, while all other primitives return an empty array.

```js
// Strings have indices as enumerable own properties
console.log(Object.keys("foo")); // ['0', '1', '2']

// Other primitives except undefined and null have no own properties
console.log(Object.keys(100)); // []
```

> **Note:**
> In ES5, passing a non-object to `Object.keys()` threw a `TypeError`.

### Object.values()

The **`Object.values()`** static method returns an array of a given object's own enumerable string-keyed property values.

```js
const object = {
  a: "some string",
  b: 42,
  c: false,
};

console.log(Object.values(object));
// Expected output: Array ["some string", 42, false]
```

#### Syntax

```js
Object.values(obj)
```

##### Parameters

- `obj`
  - : An object.

##### Return value

An array containing the given object's own enumerable string-keyed property values.

#### Description

`Object.values()` returns an array whose elements are values of enumerable string-keyed properties found directly upon `object`. This is similar to accessing the values inside a `for...in` loop, except that a `for...in` loop enumerates properties in the prototype chain as well. The order of the array returned by `Object.values()` is the same as that provided by a `for...in` loop.

If you need the property keys, use `Object.keys()` instead. If you need both the property keys and values, use `Object.entries()` instead.

#### Examples

##### Using Object.values()

```js
const obj = { foo: "bar", baz: 42 };
console.log(Object.values(obj)); // ['bar', 42]

// Array-like object
const arrayLikeObj1 = { 0: "a", 1: "b", 2: "c" };
console.log(Object.values(arrayLikeObj1)); // ['a', 'b', 'c']

// Array-like object with random key ordering
// When using numeric keys, the values are returned in the keys' numerical order
const arrayLikeObj2 = { 100: "a", 2: "b", 7: "c" };
console.log(Object.values(arrayLikeObj2)); // ['b', 'c', 'a']

// getFoo is a non-enumerable property
const myObj = Object.create(
  {},
  {
    getFoo: {
      value() {
        return this.foo;
      },
    },
  },
);
myObj.foo = "bar";
console.log(Object.values(myObj)); // ['bar']
```

##### Using Object.values() on primitives

Non-object arguments are [coerced to objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object#object_coercion). [`undefined`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined) and [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) cannot be coerced to objects and throw a `TypeError` upfront. Only strings may have own enumerable properties, while all other primitives return an empty array.

```js
// Strings have indices as enumerable own properties
console.log(Object.values("foo")); // ['f', 'o', 'o']

// Other primitives except undefined and null have no own properties
console.log(Object.values(100)); // []
```

### Object.entries()

The **`Object.entries()`** static method returns an array of a given object's own enumerable string-keyed property key-value pairs.

```js
const object = {
  a: "some string",
  b: 42,
};

for (const [key, value] of Object.entries(object)) {
  console.log(`${key}: ${value}`);
}

// Expected output:
// "a: some string"
// "b: 42"
```

#### Syntax

```js
Object.entries(obj)
```

##### Parameters

- `obj`
  - : An object.

##### Return value

An array of the given object's own enumerable string-keyed property key-value pairs. Each key-value pair is an array with two elements: the first element is the property key (which is always a string), and the second element is the property value.

#### Description

`Object.entries()` returns an array whose elements are arrays corresponding to the enumerable string-keyed property key-value pairs found directly upon `object`. This is the same as iterating with a `for...in` loop, except that a `for...in` loop enumerates properties in the prototype chain as well. The order of the array returned by `Object.entries()` is the same as that provided by a `for...in` loop.

If you only need the property keys, use `Object.keys()` instead. If you only need the property values, use `Object.values()` instead.

#### Examples

##### Using Object.entries()

```js
const obj = { foo: "bar", baz: 42 };
console.log(Object.entries(obj)); // [ ['foo', 'bar'], ['baz', 42] ]

const arrayLike = { 0: "a", 1: "b", 2: "c" };
console.log(Object.entries(arrayLike)); // [ ['0', 'a'], ['1', 'b'], ['2', 'c'] ]

const randomKeyOrder = { 100: "a", 2: "b", 7: "c" };
console.log(Object.entries(randomKeyOrder)); // [ ['2', 'b'], ['7', 'c'], ['100', 'a'] ]

// getFoo is a non-enumerable property
const myObj = Object.create(
  {},
  {
    getFoo: {
      value() {
        return this.foo;
      },
    },
  },
);
myObj.foo = "bar";
console.log(Object.entries(myObj)); // [ ['foo', 'bar'] ]
```

##### Using Object.entries() on primitives

Non-object arguments are [coerced to objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object#object_coercion). [`undefined`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined) and [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) cannot be coerced to objects and throw a `TypeError` upfront. Only strings may have own enumerable properties, while all other primitives return an empty array.

```js
// Strings have indices as enumerable own properties
console.log(Object.entries("foo")); // [ ['0', 'f'], ['1', 'o'], ['2', 'o'] ]

// Other primitives except undefined and null have no own properties
console.log(Object.entries(100)); // []
```

##### Converting an Object to a Map

The `Map()` constructor accepts an iterable of `entries`. With `Object.entries`, you can easily convert from `Object` to `Map`:

```js
const obj = { foo: "bar", baz: 42 };
const map = new Map(Object.entries(obj));
console.log(map); // Map(2) {"foo" => "bar", "baz" => 42}
```

##### Iterating through an Object

Using [array destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring#array_destructuring), you can iterate through objects easily.

```js
// Using for...of loop
const obj = { a: 5, b: 7, c: 9 };
for (const [key, value] of Object.entries(obj)) {
  console.log(`${key} ${value}`); // "a 5", "b 7", "c 9"
}

// Using array methods
Object.entries(obj).forEach(([key, value]) => {
  console.log(`${key} ${value}`); // "a 5", "b 7", "c 9"
});
```

## Promise.all(), Promise.allSettled(), Promise.race()

> **Source:** [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all), [Promise.allSettled()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled), [Promise.race()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5
>
> **Further reading:** [javascript.info](https://javascript.info/promise-api)

### Promise.all()

The **`Promise.all()`** static method takes an iterable of promises as input and returns a single `Promise`. This returned promise fulfills when all of the input's promises fulfill (including when an empty iterable is passed), with an array of the fulfillment values. It rejects when any of the input's promises rejects, with this first rejection reason.

```js
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, "foo");
});

Promise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values);
});
// Expected output: Array [3, 42, "foo"]
```

#### Syntax

```js
Promise.all(iterable)
```

##### Parameters

- `iterable`
  - : An [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) (such as an `Array`) of promises. These values are [awaited](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await), so other [thenables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables) are also resolved, while non-thenables are returned as-is.

##### Return value

A `Promise` that is:

- **Already fulfilled**, if the `iterable` passed is empty.
- **Asynchronously fulfilled**, when all the promises in the given `iterable` fulfill. The fulfillment value is an array of fulfillment values, in the order of the promises passed, regardless of completion order. If the `iterable` passed is non-empty but contains no pending promises, the returned promise is still asynchronously (instead of synchronously) fulfilled.
- **Asynchronously rejected**, when any of the promises in the given `iterable` rejects. The rejection reason is the rejection reason of the first promise that was rejected.

#### Description

The `Promise.all()` method is one of the [promise concurrency](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#promise_concurrency) methods. It can be useful for aggregating the results of multiple promises. It is typically used when there are multiple related asynchronous tasks that the overall code relies on to work successfully — all of whom we want to fulfill before the code execution continues.

`Promise.all()` will reject immediately upon **any** of the input promises rejecting. In comparison, the promise returned by `Promise.allSettled()` will wait for all input promises to complete, regardless of whether or not one rejects. Use `allSettled()` if you need the final result of every promise in the input iterable.

Like other promise combinators, `Promise.all()` immediately marks all promises as "handled" when it is called (by calling their `.then()` methods). Subsequent rejections after the first rejection will be ignored, and will not trigger any `unhandledrejection` events.

Rejecting the returned promise does not cancel the remaining operations or unsubscribe the handlers attached to their promises. Repeatedly passing a long-lived pending promise to `Promise.all()` can accumulate handlers on that promise even when another input rejects each time.

#### Examples

##### Using Promise.all()

`Promise.all` waits for all fulfillments (or the first rejection).

```js
const p1 = Promise.resolve(3);
const p2 = 1337;
const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("foo");
  }, 100);
});

Promise.all([p1, p2, p3]).then((values) => {
  console.log(values); // [3, 1337, "foo"]
});
```

If the `iterable` contains non-promise values, they will be ignored, but still counted in the returned promise array value (if the promise is fulfilled):

```js
// All values are non-promises, so the returned promise gets fulfilled
const p = Promise.all([1, 2, 3]);
// The only input promise is already fulfilled,
// so the returned promise gets fulfilled
const p2 = Promise.all([1, 2, 3, Promise.resolve(444)]);
// One (and the only) input promise is rejected,
// so the returned promise gets rejected
const p3 = Promise.all([1, 2, 3, Promise.reject(new Error("bad"))]);

// Using setTimeout, we can execute code after the queue is empty
setTimeout(() => {
  console.log(p);
  console.log(p2);
  console.log(p3);
});

// Logs:
// Promise { <state>: "fulfilled", <value>: Array[3] }
// Promise { <state>: "fulfilled", <value>: Array[4] }
// Promise { <state>: "rejected", <reason>: Error: bad }
```

##### Destructuring the result

You will find [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) very useful if you are batching together a known number of tasks.

```js
// With then()
Promise.all([p1, p2, p3]).then(([a, b, c]) => {
  console.log(a, b, c); // 3 1337 "foo"
});

// With await
const [a, b, c] = await Promise.all([p1, p2, p3]);
```

Be careful: if the original promises and the result variables' order don't match, you may run into subtle bugs. The `Promise.allKeyed()` method solves exactly this problem.

##### Asynchronicity or synchronicity of Promise.all

This following example demonstrates the asynchronicity of `Promise.all` when a non-empty `iterable` is passed:

```js
// Passing an array of promises that are already resolved,
// to trigger Promise.all as soon as possible
const resolvedPromisesArray = [Promise.resolve(33), Promise.resolve(44)];

const p = Promise.all(resolvedPromisesArray);
// Immediately logging the value of p
console.log(p);

// Using setTimeout, we can execute code after the queue is empty
setTimeout(() => {
  console.log("the queue is now empty");
  console.log(p);
});

// Logs, in order:
// Promise { <state>: "pending" }
// the queue is now empty
// Promise { <state>: "fulfilled", <value>: Array[2] }
```

The same thing happens if `Promise.all` rejects:

```js
const mixedPromisesArray = [
  Promise.resolve(33),
  Promise.reject(new Error("bad")),
];
const p = Promise.all(mixedPromisesArray);
console.log(p);
setTimeout(() => {
  console.log("the queue is now empty");
  console.log(p);
});

// Logs:
// Promise { <state>: "pending" }
// the queue is now empty
// Promise { <state>: "rejected", <reason>: Error: bad }
```

`Promise.all` resolves synchronously if and only if the `iterable` passed is empty:

```js
const p = Promise.all([]); // Will be immediately resolved
const p2 = Promise.all([1337, "hi"]); // Non-promise values are ignored, but the evaluation is done asynchronously
console.log(p);
console.log(p2);
setTimeout(() => {
  console.log("the queue is now empty");
  console.log(p2);
});

// Logs:
// Promise { <state>: "fulfilled", <value>: Array[0] }
// Promise { <state>: "pending" }
// the queue is now empty
// Promise { <state>: "fulfilled", <value>: Array[2] }
```

##### Using Promise.all() with async functions

Within [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), it's very common to "over-await" your code. For example, given the following functions:

```js
function promptForDishChoice() {
  return new Promise((resolve, reject) => {
    const dialog = document.createElement("dialog");
    dialog.innerHTML = `
<form method="dialog">
  <p>What would you like to eat?</p>
  <select>
    <option value="pizza">Pizza</option>
    <option value="pasta">Pasta</option>
    <option value="salad">Salad</option>
  </select>
  <menu>
    <li><button value="cancel">Cancel</button></li>
    <li><button type="submit" value="ok">OK</button></li>
  </menu>
</form>
    `;
    dialog.addEventListener("close", () => {
      if (dialog.returnValue === "ok") {
        resolve(dialog.querySelector("select").value);
      } else {
        reject(new Error("User canceled dialog"));
      }
    });
    document.body.appendChild(dialog);
    dialog.showModal();
  });
}

async function fetchPrices() {
  const response = await fetch("/prices");
  return await response.json();
}
```

You may write a function like this:

```js
async function getPrice() {
  const choice = await promptForDishChoice();
  const prices = await fetchPrices();
  return prices[choice];
}
```

However, note that the execution of `promptForDishChoice` and `fetchPrices` don't depend on the result of each other. While the user is choosing their dish, it's fine for the prices to be fetched in the background, but in the code above, the [`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) operator causes the async function to pause until the choice is made, and then again until the prices are fetched. We can use `Promise.all` to run them concurrently, so that the user doesn't have to wait for the prices to be fetched before the result is given:

```js
async function getPrice() {
  const [choice, prices] = await Promise.all([
    promptForDishChoice(),
    fetchPrices(),
  ]);
  return prices[choice];
}
```

`Promise.all` is the best choice of [concurrency method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#promise_concurrency) here, because error handling is intuitive — if any of the promises reject, the result is no longer available, so the whole `await` expression throws.

`Promise.all` accepts an iterable of promises, so if you are using it to run several async functions concurrently, you need to call the async functions and use the returned promises. Directly passing the functions to `Promise.all` does not work, since they are not promises.

```js
async function getPrice() {
  const [choice, prices] = await Promise.all([
    promptForDishChoice,
    fetchPrices,
  ]);
  // `choice` and `prices` are still the original async functions;
  // Promise.all() does nothing to non-promises
}
```

Note that the following, despite other undesirable aspects (like creating more variables and bug-prone error handling), also achieves concurrency:

```js
async function getPrice() {
  // Fire all async operations upfront
  const choicePromise = promptForDishChoice();
  const pricesPromise = fetchPrices();

  // Wait for each promise (all in-progress async operations keep running)
  const choice = await choicePromise;
  const prices = await pricesPromise;
}
```

##### Promise.all fail-fast behavior

`Promise.all` is rejected if any of the elements are rejected. For example, if you pass in four promises that resolve after a timeout and one promise that rejects immediately, then `Promise.all` will reject immediately.

```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("one"), 1000);
});
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("two"), 2000);
});
const p3 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("three"), 3000);
});
const p4 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("four"), 4000);
});
const p5 = new Promise((resolve, reject) => {
  reject(new Error("reject"));
});

// Using .catch:
Promise.all([p1, p2, p3, p4, p5])
  .then((values) => {
    console.log(values);
  })
  .catch((error) => {
    console.error(error.message);
  });

// Logs:
// "reject"
```

It is possible to change this behavior by handling possible rejections:

```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("p1_delayed_resolution"), 1000);
});

const p2 = new Promise((resolve, reject) => {
  reject(new Error("p2_immediate_rejection"));
});

Promise.all([p1.catch((error) => error), p2.catch((error) => error)]).then(
  (values) => {
    console.log(values[0]); // "p1_delayed_resolution"
    console.error(values[1]); // "Error: p2_immediate_rejection"
  },
);
```

### Promise.allSettled()

The **`Promise.allSettled()`** static method takes an iterable of promises as input and returns a single `Promise`. This returned promise fulfills when all of the input's promises settle (including when an empty iterable is passed), with an array of objects that describe the outcome of each promise.

```js
const promise1 = Promise.resolve(3);
const promise2 = new Promise((resolve, reject) =>
  setTimeout(reject, 100, "foo"),
);
const promises = [promise1, promise2];

Promise.allSettled(promises).then((results) =>
  results.forEach((result) => console.log(result.status)),
);

// Expected output:
// "fulfilled"
// "rejected"
```

#### Syntax

```js
Promise.allSettled(iterable)
```

##### Parameters

- `iterable`
  - : An [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) (such as an `Array`) of promises. These values are [awaited](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await), so other [thenables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables) are also resolved, while non-thenables are returned as-is.

##### Return value

A `Promise` that is:

- **Already fulfilled**, if the `iterable` passed is empty.
- **Asynchronously fulfilled**, when all promises in the given `iterable` have settled (either fulfilled or rejected). The fulfillment value is an array of objects, each describing the outcome of one promise in the `iterable`, in the order of the promises passed, regardless of completion order. Each outcome object has the following properties:
  - `status`
    - : A string, either `"fulfilled"` or `"rejected"`, indicating the eventual state of the promise.
  - `value`
    - : Only present if `status` is `"fulfilled"`. The value that the promise was fulfilled with.
  - `reason`
    - : Only present if `status` is `"rejected"`. The reason that the promise was rejected with.

  If the `iterable` passed is non-empty but contains no pending promises, the returned promise is still asynchronously (instead of synchronously) fulfilled.

#### Description

The `Promise.allSettled()` method is one of the [promise concurrency](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#promise_concurrency) methods. `Promise.allSettled()` is typically used when you have multiple asynchronous tasks that are not dependent on one another to complete successfully, or you'd always like to know the result of each promise.

In comparison, the Promise returned by `Promise.all()` may be more appropriate if the tasks are dependent on each other, or if you'd like to immediately reject upon any of them rejecting.

#### Examples

##### Using Promise.allSettled()

```js
Promise.allSettled([
  Promise.resolve(33),
  new Promise((resolve) => setTimeout(() => resolve(66), 0)),
  99,
  Promise.reject(new Error("an error")),
]).then((values) => console.log(values));

// [
//   { status: 'fulfilled', value: 33 },
//   { status: 'fulfilled', value: 66 },
//   { status: 'fulfilled', value: 99 },
//   { status: 'rejected', reason: Error: an error }
// ]
```

You may also destructure the results to have one variable per settling outcome.

```js
const [status1, status2] = Promise.allSettled([
  Promise.resolve(33),
  new Promise((resolve) => setTimeout(() => resolve(66), 0)),
]);

// status1 = { status: 'fulfilled', value: 33 }
// status2 = { status: 'fulfilled', value: 66 }
```

If you destructure the result, you must keep the result variables in the same order as the input promises; a mismatch may cause subtle bugs. The `Promise.allSettledKeyed()` method avoids this problem by associating each input and output with a key.

### Promise.race()

The **`Promise.race()`** static method takes an iterable of promises as input and returns a single `Promise`. This returned promise settles with the eventual state of the first promise that settles.

```js
const promise1 = new Promise((resolve, reject) => {
  setTimeout(resolve, 500, "one");
});

const promise2 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, "two");
});

Promise.race([promise1, promise2]).then((value) => {
  console.log(value);
  // Both resolve, but promise2 is faster
});
// Expected output: "two"
```

#### Syntax

```js
Promise.race(iterable)
```

##### Parameters

- `iterable`
  - : An [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) (such as an `Array`) of promises. These values are [awaited](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await), so other [thenables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables) are also resolved, while non-thenables are returned as-is.

##### Return value

A `Promise` that **asynchronously settles** with the eventual state of the first promise in the `iterable` to settle. In other words, it fulfills if the first promise to settle is fulfilled, and rejects if the first promise to settle is rejected. The returned promise remains pending forever if the `iterable` passed is empty. If the `iterable` passed is non-empty but contains no pending promises, the returned promise is still asynchronously (instead of synchronously) settled.

#### Description

The `Promise.race()` method is one of the [promise concurrency](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#promise_concurrency) methods. It's useful when you want the first async task to complete, but do not care about its eventual state (i.e., it can either succeed or fail).

If the iterable contains one or more non-promise values and/or an already settled promise, then `Promise.race()` will settle to the first of these values found in the iterable.

Like other promise combinators, `Promise.race()` immediately marks all promises as "handled" when it is called (by calling their `.then()` methods). Subsequent rejections after the first settlement will be ignored, and will not trigger any `unhandledrejection` events.

Settling the returned promise does not cancel the losing operations or unsubscribe the handlers attached to their promises. If you repeatedly race a long-lived pending promise against short-lived promises, handlers can accumulate on the pending promise even after each race settles.

#### Examples

##### Using Promise.race()

This example shows how `Promise.race()` can be used to race several timers implemented with `setTimeout()`. The timer with the shortest time always wins the race and becomes the resulting promise's state.

```js
function sleep(time, value, state) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (state === "fulfill") {
        resolve(value);
      } else {
        reject(new Error(value));
      }
    }, time);
  });
}

const p1 = sleep(500, "one", "fulfill");
const p2 = sleep(100, "two", "fulfill");

Promise.race([p1, p2]).then((value) => {
  console.log(value); // "two"
  // Both fulfill, but p2 is faster
});

const p3 = sleep(100, "three", "fulfill");
const p4 = sleep(500, "four", "reject");

Promise.race([p3, p4]).then(
  (value) => {
    console.log(value); // "three"
    // p3 is faster, so it fulfills
  },
  (error) => {
    // Not called
  },
);

const p5 = sleep(500, "five", "fulfill");
const p6 = sleep(100, "six", "reject");

Promise.race([p5, p6]).then(
  (value) => {
    // Not called
  },
  (error) => {
    console.error(error.message); // "six"
    // p6 is faster, so it rejects
  },
);
```

##### Asynchronicity of Promise.race

This following example demonstrates the asynchronicity of `Promise.race`. Unlike other promise concurrency methods, `Promise.race` is always asynchronous: it never settles synchronously, even when the `iterable` is empty.

```js
// Passing an array of promises that are already resolved,
// to trigger Promise.race as soon as possible
const resolvedPromisesArray = [Promise.resolve(33), Promise.resolve(44)];

const p = Promise.race(resolvedPromisesArray);
// Immediately logging the value of p
console.log(p);

// Using setTimeout, we can execute code after the stack is empty
setTimeout(() => {
  console.log("the stack is now empty");
  console.log(p);
});

// Logs, in order:
// Promise { <state>: "pending" }
// the stack is now empty
// Promise { <state>: "fulfilled", <value>: 33 }
```

An empty iterable causes the returned promise to be forever pending:

```js
const foreverPendingPromise = Promise.race([]);
console.log(foreverPendingPromise);
setTimeout(() => {
  console.log("the stack is now empty");
  console.log(foreverPendingPromise);
});

// Logs, in order:
// Promise { <state>: "pending" }
// the stack is now empty
// Promise { <state>: "pending" }
```

If the iterable contains one or more non-promise value and/or an already settled promise, then `Promise.race` will settle to the first of these values found in the array:

```js
const foreverPendingPromise = Promise.race([]);
const alreadyFulfilledProm = Promise.resolve(100);

const arr = [foreverPendingPromise, alreadyFulfilledProm, "non-Promise value"];
const arr2 = [foreverPendingPromise, "non-Promise value", Promise.resolve(100)];
const p = Promise.race(arr);
const p2 = Promise.race(arr2);

console.log(p);
console.log(p2);
setTimeout(() => {
  console.log("the stack is now empty");
  console.log(p);
  console.log(p2);
});

// Logs, in order:
// Promise { <state>: "pending" }
// Promise { <state>: "pending" }
// the stack is now empty
// Promise { <state>: "fulfilled", <value>: 100 }
// Promise { <state>: "fulfilled", <value>: "non-Promise value" }
```

##### Using Promise.race() to implement request timeout

You can race a potentially long-lasting request with a timer that rejects, so that when the time limit has elapsed, the resulting promise automatically rejects.

```js
const data = Promise.race([
  fetch("/api"),
  new Promise((resolve, reject) => {
    // Reject after 5 seconds
    setTimeout(() => reject(new Error("Request timed out")), 5000);
  }),
])
  .then((res) => res.json())
  .catch((err) => displayError(err));
```

If the `data` promise fulfills, it will contain the data fetched from `/api`. `Promise.race` will capture and discard the settlement results of the losing promises, so the `"Request timed out"` rejection will not bubble up as unhandled. Otherwise, if `fetch` remains pending for 5 seconds and loses the race with the `setTimeout` timer, the final promise will reject.

One promise finishing does not automatically cancel the other; the other's result is simply ignored. This does not pose problems in this small example, but it keeps resources such as network connections and timers alive for longer than necessary. To release resources early, abort the fetch if the timeout wins, or clear the timeout if the fetch wins. Whenever possible—including fetch—prefer using the `AbortController` API instead.

##### Using Promise.race() to detect the status of a promise

Because `Promise.race()` resolves to the first non-pending promise in the iterable, we can check a promise's state, including if it's pending. This example is adapted from [`promise-status-async`](https://github.com/kudla/promise-status-async/blob/master/lib/promiseState.js).

```js
function promiseState(promise) {
  const pendingState = { status: "pending" };

  return Promise.race([promise, pendingState]).then(
    (value) =>
      value === pendingState ? value : { status: "fulfilled", value },
    (reason) => ({ status: "rejected", reason }),
  );
}
```

In this function, if `promise` is pending, the second value, `pendingState`, which is a non-promise, becomes the result of the race; otherwise, if `promise` is already settled, we may know its state through the `onFulfilled` and `onRejected` handlers. For example:

```js
const p1 = new Promise((res) => setTimeout(() => res(100), 100));
const p2 = new Promise((res) => setTimeout(() => res(200), 200));
const p3 = new Promise((res, rej) =>
  setTimeout(() => rej(new Error("failed")), 100),
);

async function getStates() {
  console.log(await promiseState(p1));
  console.log(await promiseState(p2));
  console.log(await promiseState(p3));
}

console.log("Immediately after initiation:");
getStates();
setTimeout(() => {
  console.log("After waiting for 100ms:");
  getStates();
}, 100);

// Logs:
// Immediately after initiation:
// { status: 'pending' }
// { status: 'pending' }
// { status: 'pending' }
// After waiting for 100ms:
// { status: 'fulfilled', value: 100 }
// { status: 'pending' }
// { status: 'rejected', reason: Error: failed }
```

> **Note:**
> The `promiseState` function still runs asynchronously, because there is no way to synchronously get a promise's value (i.e., without `then()` or `await`), even when it is already settled. However, `promiseState()` always fulfills within one tick and never actually waits for any promise's settlement.

##### Comparison with Promise.any()

`Promise.race` takes the first settled `Promise`.

```js
const promise1 = new Promise((resolve, reject) => {
  setTimeout(resolve, 500, "one");
});

const promise2 = new Promise((resolve, reject) => {
  setTimeout(reject, 100, "two");
});

Promise.race([promise1, promise2])
  .then((value) => {
    console.log("succeeded with value:", value);
  })
  .catch((reason) => {
    // Only promise1 is fulfilled, but promise2 is faster
    console.error("failed with reason:", reason);
  });
// failed with reason: two
```

`Promise.any` takes the first fulfilled `Promise`.

```js
const promise1 = new Promise((resolve, reject) => {
  setTimeout(resolve, 500, "one");
});

const promise2 = new Promise((resolve, reject) => {
  setTimeout(reject, 100, "two");
});

Promise.any([promise1, promise2])
  .then((value) => {
    // Only promise1 is fulfilled, even though promise2 settled sooner
    console.log("succeeded with value:", value);
  })
  .catch((reason) => {
    console.error("failed with reason:", reason);
  });
// succeeded with value: one
```
