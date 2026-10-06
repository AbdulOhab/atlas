---
title: "TypeScript and OOP"
order: 7
summary: "Typing backend code: object types and interfaces, classes with access modifiers and inheritance, and generics."
category: "Node.js & APIs"
level: Intermediate
---

# TypeScript and OOP

TypeScript adds static types to JavaScript, and most serious Node.js backends (NestJS included) are written in it. Interfaces, classes and generics are the parts you use every day.

**Course outline modules:** 13 (TypeScript with OOP), 14 (Interface and Polymorphism)

## Object types and interfaces

> **Source:** [Object types and interfaces](https://www.typescriptlang.org/docs/handbook/2/object-types.html) · [TypeScript Handbook](https://github.com/microsoft/TypeScript-Website), CC BY 4.0

In JavaScript, the fundamental way that we group and pass around data is through objects.
In TypeScript, we represent those through _object types_.

As we've seen, they can be anonymous:

```ts
function greet(person: { name: string; age: number }) {
  return "Hello " + person.name;
}
```

or they can be named by using either an interface:

```ts
interface Person {
  name: string;
  age: number;
}

function greet(person: Person) {
  return "Hello " + person.name;
}
```

or a type alias:

```ts
type Person = {
  name: string;
  age: number;
};

function greet(person: Person) {
  return "Hello " + person.name;
}
```

In all three examples above, we've written functions that take objects that contain the property `name` (which must be a `string`) and `age` (which must be a `number`).

### Quick Reference

We have cheat-sheets available for both [`type` and `interface`](https://www.typescriptlang.org/cheatsheets), if you want a quick look at the important every-day syntax at a glance.

### Property Modifiers

Each property in an object type can specify a couple of things: the type, whether the property is optional, and whether the property can be written to.

#### Optional Properties

Much of the time, we'll find ourselves dealing with objects that _might_ have a property set.
In those cases, we can mark those properties as _optional_ by adding a question mark (`?`) to the end of their names.

```ts
interface PaintOptions {
  shape: Shape;
  xPos?: number;
  //  ^
  yPos?: number;
  //  ^
}

function paintShape(opts: PaintOptions) {
  // ...
}

const shape = getShape();
paintShape({ shape });
paintShape({ shape, xPos: 100 });
paintShape({ shape, yPos: 100 });
paintShape({ shape, xPos: 100, yPos: 100 });
```

In this example, both `xPos` and `yPos` are considered optional.
We can choose to provide either of them, so every call above to `paintShape` is valid.
All optionality really says is that if the property _is_ set, it better have a specific type.

We can also read from those properties - but when we do under [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks), TypeScript will tell us they're potentially `undefined`.

```ts
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos;
  let yPos = opts.yPos;
  // ...
}
```

In JavaScript, even if the property has never been set, we can still access it - it's just going to give us the value `undefined`.
We can just handle `undefined` specially by checking for it.

```ts
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos === undefined ? 0 : opts.xPos;
  let yPos = opts.yPos === undefined ? 0 : opts.yPos;
  // ...
}
```

Note that this pattern of setting defaults for unspecified values is so common that JavaScript has syntax to support it.

```ts
function paintShape({ shape, xPos = 0, yPos = 0 }: PaintOptions) {
  console.log("x coordinate at", xPos);
  console.log("y coordinate at", yPos);
  // ...
}
```

Here we used [a destructuring pattern](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) for `paintShape`'s parameter, and provided [default values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Default_values) for `xPos` and `yPos`.
Now `xPos` and `yPos` are both definitely present within the body of `paintShape`, but optional for any callers to `paintShape`.

> Note that there is currently no way to place type annotations within destructuring patterns.
> This is because the following syntax already means something different in JavaScript.
>
> ```ts
> interface Shape {}
> declare function render(x: unknown);
> function draw({ shape: Shape, xPos: number = 100 /*...*/ }) {
>   render(shape);
>   render(xPos);
> }
> ```
>
> In an object destructuring pattern, `shape: Shape` means "grab the property `shape` and redefine it locally as a variable named `Shape`."
> Likewise `xPos: number` creates a variable named `number` whose value is based on the parameter's `xPos`.

#### `readonly` Properties

Properties can also be marked as `readonly` for TypeScript.
While it won't change any behavior at runtime, a property marked as `readonly` can't be written to during type-checking.

```ts
interface SomeType {
  readonly prop: string;
}

function doSomething(obj: SomeType) {
  // We can read from 'obj.prop'.
  console.log(`prop has the value '${obj.prop}'.`);

  // But we can't re-assign it.
  obj.prop = "hello";
}
```

Using the `readonly` modifier doesn't necessarily imply that a value is totally immutable - or in other words, that its internal contents can't be changed.
It just means the property itself can't be re-written to.

```ts
interface Home {
  readonly resident: { name: string; age: number };
}

function visitForBirthday(home: Home) {
  // We can read and update properties from 'home.resident'.
  console.log(`Happy birthday ${home.resident.name}!`);
  home.resident.age++;
}

function evict(home: Home) {
  // But we can't write to the 'resident' property itself on a 'Home'.
  home.resident = {
    name: "Victor the Evictor",
    age: 42,
  };
}
```

It's important to manage expectations of what `readonly` implies.
It's useful to signal intent during development time for TypeScript on how an object should be used.
TypeScript doesn't factor in whether properties on two types are `readonly` when checking whether those types are compatible, so `readonly` properties can also change via aliasing.

```ts
interface Person {
  name: string;
  age: number;
}

interface ReadonlyPerson {
  readonly name: string;
  readonly age: number;
}

let writablePerson: Person = {
  name: "Person McPersonface",
  age: 42,
};

// works
let readonlyPerson: ReadonlyPerson = writablePerson;

console.log(readonlyPerson.age); // prints '42'
writablePerson.age++;
console.log(readonlyPerson.age); // prints '43'
```

Using [mapping modifiers](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#mapping-modifiers), you can remove `readonly` attributes.

#### Index Signatures

Sometimes you don't know all the names of a type's properties ahead of time, but you do know the shape of the values.

In those cases you can use an index signature to describe the types of possible values, for example:

```ts
interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = getStringArray();
const secondItem = myArray[1];
```

Above, we have a `StringArray` interface which has an index signature.
This index signature states that when a `StringArray` is indexed with a `number`, it will return a `string`.

Only some types are allowed for index signature properties: `string`, `number`, `symbol`, template string patterns, and union types consisting only of these.

<details>
    <summary>It is possible to support multiple types of indexers...</summary>
    <p>It is possible to support multiple types of indexers. Note that when using both `number` and `string` indexers, the type returned from a numeric indexer must be a subtype of the type returned from the string indexer. This is because when indexing with a <code>number</code>, JavaScript will actually convert that to a <code>string</code> before indexing into an object. That means that indexing with <code>100</code> (a <code>number</code>) is the same thing as indexing with <code>"100"</code> (a <code>string</code>), so the two need to be consistent.</p>

```ts
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// Error: indexing with a numeric string might get you a completely separate type of Animal!
interface NotOkay {
  [x: number]: Animal;
  [x: string]: Dog;
}
```

</details>

While string index signatures are a powerful way to describe the "dictionary" pattern, they also enforce that all properties match their return type.
This is because a string index declares that `obj.property` is also available as `obj["property"]`.
In the following example, `name`'s type does not match the string index's type, and the type checker gives an error:

```ts
interface NumberDictionary {
  [index: string]: number;

  length: number; // ok
  name: string;
}
```

However, properties of different types are acceptable if the index signature is a union of the property types:

```ts
interface NumberOrStringDictionary {
  [index: string]: number | string;
  length: number; // ok, length is a number
  name: string; // ok, name is a string
}
```

Finally, you can make index signatures `readonly` in order to prevent assignment to their indices:

```ts
interface ReadonlyStringArray {
  readonly [index: number]: string;
}

let myArray: ReadonlyStringArray = getReadOnlyStringArray();
myArray[2] = "Mallory";
```

You can't set `myArray[2]` because the index signature is `readonly`.

### Excess Property Checks

Where and how an object is assigned a type can make a difference in the type system.
One of the key examples of this is in excess property checking, which validates the object more thoroughly when it is created and assigned to an object type during creation.

```ts
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}

let mySquare = createSquare({ colour: "red", width: 100 });
```

Notice the given argument to `createSquare` is spelled _`colour`_ instead of `color`.
In plain JavaScript, this sort of thing fails silently.

You could argue that this program is correctly typed, since the `width` properties are compatible, there's no `color` property present, and the extra `colour` property is insignificant.

However, TypeScript takes the stance that there's probably a bug in this code.
Object literals get special treatment and undergo _excess property checking_ when assigning them to other variables, or passing them as arguments.
If an object literal has any properties that the "target type" doesn't have, you'll get an error:

```ts
let mySquare = createSquare({ colour: "red", width: 100 });
```

Getting around these checks is actually really simple.
The easiest method is to just use a type assertion:

```ts
let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
```

However, a better approach might be to add a string index signature if you're sure that the object can have some extra properties that are used in some special way.
If `SquareConfig` can have `color` and `width` properties with the above types, but could _also_ have any number of other properties, then we could define it like so:

```ts
interface SquareConfig {
  color?: string;
  width?: number;
  [propName: string]: unknown;
}
```

Here we're saying that `SquareConfig` can have any number of properties, and as long as they aren't `color` or `width`, their types don't matter.

One final way to get around these checks, which might be a bit surprising, is to assign the object to another variable:
Since assigning `squareOptions` won't undergo excess property checks, the compiler won't give you an error:

```ts
let squareOptions = { colour: "red", width: 100 };
let mySquare = createSquare(squareOptions);
```

The above workaround will work as long as you have a common property between `squareOptions` and `SquareConfig`.
In this example, it was the property `width`. It will however, fail if the variable does not have any common object property. For example:

```ts
let squareOptions = { colour: "red" };
let mySquare = createSquare(squareOptions);
```

Keep in mind that for simple code like above, you probably shouldn't be trying to "get around" these checks.
For more complex object literals that have methods and hold state, you might need to keep these techniques in mind, but a majority of excess property errors are actually bugs.

That means if you're running into excess property checking problems for something like option bags, you might need to revise some of your type declarations.
In this instance, if it's okay to pass an object with both a `color` or `colour` property to `createSquare`, you should fix up the definition of `SquareConfig` to reflect that.

### Extending Types

It's pretty common to have types that might be more specific versions of other types.
For example, we might have a `BasicAddress` type that describes the fields necessary for sending letters and packages in the U.S.

```ts
interface BasicAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
```

In some situations that's enough, but addresses often have a unit number associated with them if the building at an address has multiple units.
We can then describe an `AddressWithUnit`.

<!-- prettier-ignore -->
```ts
interface AddressWithUnit {
  name?: string;
  unit: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
```

This does the job, but the downside here is that we had to repeat all the other fields from `BasicAddress` when our changes were purely additive.
Instead, we can extend the original `BasicAddress` type and just add the new fields that are unique to `AddressWithUnit`.

```ts
interface BasicAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

interface AddressWithUnit extends BasicAddress {
  unit: string;
}
```

The `extends` keyword on an `interface` allows us to effectively copy members from other named types, and add whatever new members we want.
This can be useful for cutting down the amount of type declaration boilerplate we have to write, and for signaling intent that several different declarations of the same property might be related.
For example, `AddressWithUnit` didn't need to repeat the `street` property, and because `street` originates from `BasicAddress`, a reader will know that those two types are related in some way.

`interface`s can also extend from multiple types.

```ts
interface Colorful {
  color: string;
}

interface Circle {
  radius: number;
}

interface ColorfulCircle extends Colorful, Circle {}

const cc: ColorfulCircle = {
  color: "red",
  radius: 42,
};
```

### Intersection Types

`interface`s allowed us to build up new types from other types by extending them.
TypeScript provides another construct called _intersection types_ that is mainly used to combine existing object types.

An intersection type is defined using the `&` operator.

```ts
interface Colorful {
  color: string;
}
interface Circle {
  radius: number;
}

type ColorfulCircle = Colorful & Circle;
```

Here, we've intersected `Colorful` and `Circle` to produce a new type that has all the members of `Colorful` _and_ `Circle`.

```ts
function draw(circle: Colorful & Circle) {
  console.log(`Color was ${circle.color}`);
  console.log(`Radius was ${circle.radius}`);
}

// okay
draw({ color: "blue", radius: 42 });

// oops
draw({ color: "red", raidus: 42 });
```

### Interface Extension vs. Intersection

We just looked at two ways to combine types which are similar, but are actually subtly different.
With interfaces, we could use an `extends` clause to extend from other types, and we were able to do something similar with intersections and name the result with a type alias.
The principal difference between the two is how conflicts are handled, and that difference is typically one of the main reasons why you'd pick one over the other between an interface and a type alias of an intersection type.

If interfaces are defined with the same name, TypeScript will attempt to merge them if the properties are compatible. If the properties are not compatible (i.e., they have the same property name but different types), TypeScript will raise an error.

In the case of intersection types, properties with different types will be merged automatically. When the type is used later, TypeScript will expect the property to satisfy both types simultaneously, which may produce unexpected results.

For example, the following code will throw an error because the properties are incompatible:

```ts
interface Person {
  name: string;
}

interface Person {
  name: number;
}
```

In contrast, the following code will compile, but it results in a `never` type:

```ts
interface Person1 {
  name: string;
}

interface Person2 {
  name: number;
}

type Staff = Person1 & Person2

declare const staffer: Staff;
staffer.name;
```
In this case, Staff would require the name property to be both a string and a number, which results in property being of type `never`.

### Generic Object Types

Let's imagine a `Box` type that can contain any value - `string`s, `number`s, `Giraffe`s, whatever.

```ts
interface Box {
  contents: any;
}
```

Right now, the `contents` property is typed as `any`, which works, but can lead to accidents down the line.

We could instead use `unknown`, but that would mean that in cases where we already know the type of `contents`, we'd need to do precautionary checks, or use error-prone type assertions.

```ts
interface Box {
  contents: unknown;
}

let x: Box = {
  contents: "hello world",
};

// we could check 'x.contents'
if (typeof x.contents === "string") {
  console.log(x.contents.toLowerCase());
}

// or we could use a type assertion
console.log((x.contents as string).toLowerCase());
```

One type safe approach would be to instead scaffold out different `Box` types for every type of `contents`.

```ts
interface NumberBox {
  contents: number;
}

interface StringBox {
  contents: string;
}

interface BooleanBox {
  contents: boolean;
}
```

But that means we'll have to create different functions, or overloads of functions, to operate on these types.

```ts
function setContents(box: StringBox, newContents: string): void;
function setContents(box: NumberBox, newContents: number): void;
function setContents(box: BooleanBox, newContents: boolean): void;
function setContents(box: { contents: any }, newContents: any) {
  box.contents = newContents;
}
```

That's a lot of boilerplate. Moreover, we might later need to introduce new types and overloads.
This is frustrating, since our box types and overloads are all effectively the same.

Instead, we can make a _generic_ `Box` type which declares a _type parameter_.

```ts
interface Box<Type> {
  contents: Type;
}
```

You might read this as “A `Box` of `Type` is something whose `contents` have type `Type`”.
Later on, when we refer to `Box`, we have to give a _type argument_ in place of `Type`.

```ts
let box: Box<string>;
```

Think of `Box` as a template for a real type, where `Type` is a placeholder that will get replaced with some other type.
When TypeScript sees `Box<string>`, it will replace every instance of `Type` in `Box<Type>` with `string`, and end up working with something like `{ contents: string }`.
In other words, `Box<string>` and our earlier `StringBox` work identically.

```ts
interface Box<Type> {
  contents: Type;
}
interface StringBox {
  contents: string;
}

let boxA: Box<string> = { contents: "hello" };
boxA.contents;

let boxB: StringBox = { contents: "world" };
boxB.contents;
```

`Box` is reusable in that `Type` can be substituted with anything. That means that when we need a box for a new type, we don't need to declare a new `Box` type at all (though we certainly could if we wanted to).

```ts
interface Box<Type> {
  contents: Type;
}

interface Apple {
  // ....
}

// Same as '{ contents: Apple }'.
type AppleBox = Box<Apple>;
```

This also means that we can avoid overloads entirely by instead using [generic functions](https://www.typescriptlang.org/docs/handbook/2/functions.html#generic-functions).

```ts
function setContents<Type>(box: Box<Type>, newContents: Type) {
  box.contents = newContents;
}
```

It is worth noting that type aliases can also be generic. We could have defined our new `Box<Type>` interface, which was:

```ts
interface Box<Type> {
  contents: Type;
}
```

by using a type alias instead:

```ts
type Box<Type> = {
  contents: Type;
};
```

Since type aliases, unlike interfaces, can describe more than just object types, we can also use them to write other kinds of generic helper types.

```ts
type OrNull<Type> = Type | null;

type OneOrMany<Type> = Type | Type[];

type OneOrManyOrNull<Type> = OrNull<OneOrMany<Type>>;

type OneOrManyOrNullStrings = OneOrManyOrNull<string>;
```

We'll circle back to type aliases in just a little bit.

#### The `Array` Type

Generic object types are often some sort of container type that work independently of the type of elements they contain.
It's ideal for data structures to work this way so that they're re-usable across different data types.

It turns out we've been working with a type just like that throughout this handbook: the `Array` type.
Whenever we write out types like `number[]` or `string[]`, that's really just a shorthand for `Array<number>` and `Array<string>`.

```ts
function doSomething(value: Array<string>) {
  // ...
}

let myArray: string[] = ["hello", "world"];

// either of these work!
doSomething(myArray);
doSomething(new Array("hello", "world"));
```

Much like the `Box` type above, `Array` itself is a generic type.

```ts
interface Array<Type> {
  /**
   * Gets or sets the length of the array.
   */
  length: number;

  /**
   * Removes the last element from an array and returns it.
   */
  pop(): Type | undefined;

  /**
   * Appends new elements to an array, and returns the new length of the array.
   */
  push(...items: Type[]): number;

  // ...
}
```

Modern JavaScript also provides other data structures which are generic, like `Map<K, V>`, `Set<T>`, and `Promise<T>`.
All this really means is that because of how `Map`, `Set`, and `Promise` behave, they can work with any sets of types.

#### The `ReadonlyArray` Type

The `ReadonlyArray` is a special type that describes arrays that shouldn't be changed.

```ts
function doStuff(values: ReadonlyArray<string>) {
  // We can read from 'values'...
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);

  // ...but we can't mutate 'values'.
  values.push("hello!");
}
```

Much like the `readonly` modifier for properties, it's mainly a tool we can use for intent.
When we see a function that returns `ReadonlyArray`s, it tells us we're not meant to change the contents at all, and when we see a function that consumes `ReadonlyArray`s, it tells us that we can pass any array into that function without worrying that it will change its contents.

Unlike `Array`, there isn't a `ReadonlyArray` constructor that we can use.

```ts
new ReadonlyArray("red", "green", "blue");
```

Instead, we can assign regular `Array`s to `ReadonlyArray`s.

```ts
const roArray: ReadonlyArray<string> = ["red", "green", "blue"];
```

Just as TypeScript provides a shorthand syntax for `Array<Type>` with `Type[]`, it also provides a shorthand syntax for `ReadonlyArray<Type>` with `readonly Type[]`.

```ts
function doStuff(values: readonly string[]) {
  // We can read from 'values'...
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);

  // ...but we can't mutate 'values'.
  values.push("hello!");
}
```

One last thing to note is that unlike the `readonly` property modifier, assignability isn't bidirectional between regular `Array`s and `ReadonlyArray`s.

```ts
let x: readonly string[] = [];
let y: string[] = [];

x = y;
y = x;
```

#### Tuple Types

A _tuple type_ is another sort of `Array` type that knows exactly how many elements it contains, and exactly which types it contains at specific positions.

```ts
type StringNumberPair = [string, number];
```

Here, `StringNumberPair` is a tuple type of `string` and `number`.
Like `ReadonlyArray`, it has no representation at runtime, but is significant to TypeScript.
To the type system, `StringNumberPair` describes arrays whose `0` index contains a `string` and whose `1` index contains a `number`.

```ts
function doSomething(pair: [string, number]) {
  const a = pair[0];
  const b = pair[1];
  // ...
}

doSomething(["hello", 42]);
```

If we try to index past the number of elements, we'll get an error.

```ts
function doSomething(pair: [string, number]) {
  // ...

  const c = pair[2];
}
```

We can also [destructure tuples](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring) using JavaScript's array destructuring.

```ts
function doSomething(stringHash: [string, number]) {
  const [inputString, hash] = stringHash;

  console.log(inputString);

  console.log(hash);
}
```

> Tuple types are useful in heavily convention-based APIs, where each element's meaning is "obvious".
> This gives us flexibility in whatever we want to name our variables when we destructure them.
> In the above example, we were able to name elements `0` and `1` to whatever we wanted.
>
> However, since not every user holds the same view of what's obvious, it may be worth reconsidering whether using objects with descriptive property names may be better for your API.

Other than those length checks, simple tuple types like these are equivalent to types which are versions of `Array`s that declare properties for specific indexes, and that declare `length` with a numeric literal type.

```ts
interface StringNumberPair {
  // specialized properties
  length: 2;
  0: string;
  1: number;

  // Other 'Array<string | number>' members...
  slice(start?: number, end?: number): Array<string | number>;
}
```

Another thing you may be interested in is that tuples can have optional properties by writing out a question mark (`?` after an element's type).
Optional tuple elements can only come at the end, and also affect the type of `length`.

```ts
type Either2dOr3d = [number, number, number?];

function setCoordinate(coord: Either2dOr3d) {
  const [x, y, z] = coord;

  console.log(`Provided coordinates had ${coord.length} dimensions`);
}
```

Tuples can also have rest elements, which have to be an array/tuple type.

```ts
type StringNumberBooleans = [string, number, ...boolean[]];
type StringBooleansNumber = [string, ...boolean[], number];
type BooleansStringNumber = [...boolean[], string, number];
```

- `StringNumberBooleans` describes a tuple whose first two elements are `string` and `number` respectively, but which may have any number of `boolean`s following.
- `StringBooleansNumber` describes a tuple whose first element is `string` and then any number of `boolean`s and ending with a `number`.
- `BooleansStringNumber` describes a tuple whose starting elements are any number of `boolean`s and ending with a `string` then a `number`.

A tuple with a rest element has no set "length" - it only has a set of well-known elements in different positions.

```ts
const a: StringNumberBooleans = ["hello", 1];
const b: StringNumberBooleans = ["beautiful", 2, true];
const c: StringNumberBooleans = ["world", 3, true, false, true, false, true];
```

Why might optional and rest elements be useful?
Well, it allows TypeScript to correspond tuples with parameter lists.
Tuples types can be used in [rest parameters and arguments](https://www.typescriptlang.org/docs/handbook/2/functions.html#rest-parameters-and-arguments), so that the following:

```ts
function readButtonInput(...args: [string, number, ...boolean[]]) {
  const [name, version, ...input] = args;
  // ...
}
```

is basically equivalent to:

```ts
function readButtonInput(name: string, version: number, ...input: boolean[]) {
  // ...
}
```

This is handy when you want to take a variable number of arguments with a rest parameter, and you need a minimum number of elements, but you don't want to introduce intermediate variables.

<!--
TODO do we need this example?

For example, imagine we need to write a function that adds up `number`s based on arguments that get passed in.

```ts
function sum(...args: number[]) {
    // ...
}
```

We might feel like it makes little sense to take any fewer than 2 elements, so we want to require callers to provide at least 2 arguments.
A first attempt might be

```ts
function foo(a: number, b: number, ...args: number[]) {
    args.unshift(a, b);

    let result = 0;
    for (const value of args) {
        result += value;
    }
    return result;
}
```

-->

#### `readonly` Tuple Types

One final note about tuple types - tuple types have `readonly` variants, and can be specified by sticking a `readonly` modifier in front of them - just like with array shorthand syntax.

```ts
function doSomething(pair: readonly [string, number]) {
  // ...
}
```

As you might expect, writing to any property of a `readonly` tuple isn't allowed in TypeScript.

```ts
function doSomething(pair: readonly [string, number]) {
  pair[0] = "hello!";
}
```

Tuples tend to be created and left un-modified in most code, so annotating types as `readonly` tuples when possible is a good default.
This is also important given that array literals with `const` assertions will be inferred with `readonly` tuple types.

```ts
let point = [3, 4] as const;

function distanceFromOrigin([x, y]: [number, number]) {
  return Math.sqrt(x ** 2 + y ** 2);
}

distanceFromOrigin(point);
```

Here, `distanceFromOrigin` never modifies its elements, but expects a mutable tuple.
Since `point`'s type was inferred as `readonly [3, 4]`, it won't be compatible with `[number, number]` since that type can't guarantee `point`'s elements won't be mutated.

<!-- ## Other Kinds of Object Members

Most of the declarations in object types:

#### Method Syntax

#### Call Signatures

#### Construct Signatures

#### Index Signatures -->

## Classes

> **Source:** [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) · [TypeScript Handbook](https://github.com/microsoft/TypeScript-Website), CC BY 4.0

<blockquote class='bg-reading'>
  <p>Background Reading:<br /><a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes'>Classes (MDN)</a></p>
</blockquote>

TypeScript offers full support for the `class` keyword introduced in ES2015.

As with other JavaScript language features, TypeScript adds type annotations and other syntax to allow you to express relationships between classes and other types.

### Class Members

Here's the most basic class - an empty one:

```ts
class Point {}
```

This class isn't very useful yet, so let's start adding some members.

#### Fields

A field declaration creates a public writeable property on a class:

```ts
class Point {
  x: number;
  y: number;
}

const pt = new Point();
pt.x = 0;
pt.y = 0;
```

As with other locations, the type annotation is optional, but will be an implicit `any` if not specified.

Fields can also have _initializers_; these will run automatically when the class is instantiated:

```ts
class Point {
  x = 0;
  y = 0;
}

const pt = new Point();
// Prints 0, 0
console.log(`${pt.x}, ${pt.y}`);
```

Just like with `const`, `let`, and `var`, the initializer of a class property will be used to infer its type:

```ts
const pt = new Point();
pt.x = "0";
```

##### `--strictPropertyInitialization`

The [`strictPropertyInitialization`](https://www.typescriptlang.org/tsconfig#strictPropertyInitialization) setting controls whether class fields need to be initialized in the constructor.

```ts
class BadGreeter {
  name: string;
}
```

```ts
class GoodGreeter {
  name: string;

  constructor() {
    this.name = "hello";
  }
}
```

Note that the field needs to be initialized _in the constructor itself_.
TypeScript does not analyze methods you invoke from the constructor to detect initializations, because a derived class might override those methods and fail to initialize the members.

If you intend to definitely initialize a field through means other than the constructor (for example, maybe an external library is filling in part of your class for you), you can use the _definite assignment assertion operator_, `!`:

```ts
class OKGreeter {
  // Not initialized, but no error
  name!: string;
}
```

#### `readonly`

Fields may be prefixed with the `readonly` modifier.
This prevents assignments to the field outside of the constructor.

```ts
class Greeter {
  readonly name: string = "world";

  constructor(otherName?: string) {
    if (otherName !== undefined) {
      this.name = otherName;
    }
  }

  err() {
    this.name = "not ok";
  }
}
const g = new Greeter();
g.name = "also not ok";
```

#### Constructors

<blockquote class='bg-reading'>
   <p>Background Reading:<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor'>Constructor (MDN)</a><br/>
   </p>
</blockquote>

Class constructors are very similar to functions.
You can add parameters with type annotations, default values, and overloads:

```ts
class Point {
  x: number;
  y: number;

  // Normal signature with defaults
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
```

```ts
class Point {
  x: number = 0;
  y: number = 0;

  // Constructor overloads
  constructor(x: number, y: number);
  constructor(xy: string);
  constructor(x: string | number, y: number = 0) {
    // Code logic here
  }
}
```

There are just a few differences between class constructor signatures and function signatures:

- Constructors can't have type parameters - these belong on the outer class declaration, which we'll learn about later
- Constructors can't have return type annotations - the class instance type is always what's returned

##### Super Calls

Just as in JavaScript, if you have a base class, you'll need to call `super();` in your constructor body before using any `this.` members:

```ts
class Base {
  k = 4;
}

class Derived extends Base {
  constructor() {
    // Prints a wrong value in ES5; throws exception in ES6
    console.log(this.k);
    super();
  }
}
```

Forgetting to call `super` is an easy mistake to make in JavaScript, but TypeScript will tell you when it's necessary.

#### Methods

<blockquote class='bg-reading'>
   <p>Background Reading:<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions'>Method definitions</a><br/>
   </p>
</blockquote>

A function property on a class is called a _method_.
Methods can use all the same type annotations as functions and constructors:

```ts
class Point {
  x = 10;
  y = 10;

  scale(n: number): void {
    this.x *= n;
    this.y *= n;
  }
}
```

Other than the standard type annotations, TypeScript doesn't add anything else new to methods.

Note that inside a method body, it is still mandatory to access fields and other methods via `this.`.
An unqualified name in a method body will always refer to something in the enclosing scope:

```ts
let x: number = 0;

class C {
  x: string = "hello";

  m() {
    // This is trying to modify 'x' from line 1, not the class property
    x = "world";
  }
}
```

#### Getters / Setters

Classes can also have _accessors_:

```ts
class C {
  _length = 0;
  get length() {
    return this._length;
  }
  set length(value) {
    this._length = value;
  }
}
```

> Note that a field-backed get/set pair with no extra logic is very rarely useful in JavaScript.
> It's fine to expose public fields if you don't need to add additional logic during the get/set operations.

TypeScript has some special inference rules for accessors:

- If `get` exists but no `set`, the property is automatically `readonly`
- If the type of the setter parameter is not specified, it is inferred from the return type of the getter

Since [TypeScript 4.3](https://devblogs.microsoft.com/typescript/announcing-typescript-4-3/), it is possible to have accessors with different types for getting and setting.

```ts
class Thing {
  _size = 0;

  get size(): number {
    return this._size;
  }

  set size(value: string | number | boolean) {
    let num = Number(value);

    // Don't allow NaN, Infinity, etc

    if (!Number.isFinite(num)) {
      this._size = 0;
      return;
    }

    this._size = num;
  }
}
```

#### Index Signatures

Classes can declare index signatures; these work the same as [Index Signatures for other object types](https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures):

```ts
class MyClass {
  [s: string]: boolean | ((s: string) => boolean);

  check(s: string) {
    return this[s] as boolean;
  }
}
```

Because the index signature type needs to also capture the types of methods, it's not easy to usefully use these types.
Generally it's better to store indexed data in another place instead of on the class instance itself.

### Class Heritage

Like other languages with object-oriented features, classes in JavaScript can inherit from base classes.

#### `implements` Clauses

You can use an `implements` clause to check that a class satisfies a particular `interface`.
An error will be issued if a class fails to correctly implement it:

```ts
interface Pingable {
  ping(): void;
}

class Sonar implements Pingable {
  ping() {
    console.log("ping!");
  }
}

class Ball implements Pingable {
  pong() {
    console.log("pong!");
  }
}
```

Classes may also implement multiple interfaces, e.g. `class C implements A, B {`.

##### Cautions

It's important to understand that an `implements` clause is only a check that the class can be treated as the interface type.
It doesn't change the type of the class or its methods _at all_.
A common source of error is to assume that an `implements` clause will change the class type - it doesn't!

```ts
interface Checkable {
  check(name: string): boolean;
}

class NameChecker implements Checkable {
  check(s) {
    // Notice no error here
    return s.toLowerCase() === "ok";
  }
}
```

In this example, we perhaps expected that `s`'s type would be influenced by the `name: string` parameter of `check`.
It is not - `implements` clauses don't change how the class body is checked or its type inferred.

Similarly, implementing an interface with an optional property doesn't create that property:

```ts
interface A {
  x: number;
  y?: number;
}
class C implements A {
  x = 0;
}
const c = new C();
c.y = 10;
```

#### `extends` Clauses

<blockquote class='bg-reading'>
   <p>Background Reading:<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends'>extends keyword (MDN)</a><br/>
   </p>
</blockquote>

Classes may `extend` from a base class.
A derived class has all the properties and methods of its base class, and can also define additional members.

```ts
class Animal {
  move() {
    console.log("Moving along!");
  }
}

class Dog extends Animal {
  woof(times: number) {
    for (let i = 0; i < times; i++) {
      console.log("woof!");
    }
  }
}

const d = new Dog();
// Base class method
d.move();
// Derived class method
d.woof(3);
```

##### Overriding Methods

<blockquote class='bg-reading'>
   <p>Background Reading:<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super'>super keyword (MDN)</a><br/>
   </p>
</blockquote>

A derived class can also override a base class field or property.
You can use the `super.` syntax to access base class methods.
Note that because JavaScript classes are a simple lookup object, there is no notion of a "super field".

TypeScript enforces that a derived class is always a subtype of its base class.

For example, here's a legal way to override a method:

```ts
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  greet(name?: string) {
    if (name === undefined) {
      super.greet();
    } else {
      console.log(`Hello, ${name.toUpperCase()}`);
    }
  }
}

const d = new Derived();
d.greet();
d.greet("reader");
```

It's important that a derived class follow its base class contract.
Remember that it's very common (and always legal!) to refer to a derived class instance through a base class reference:

```ts
// Alias the derived instance through a base class reference
const b: Base = d;
// No problem
b.greet();
```

What if `Derived` didn't follow `Base`'s contract?

```ts
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  // Make this parameter required
  greet(name: string) {
    console.log(`Hello, ${name.toUpperCase()}`);
  }
}
```

If we compiled this code despite the error, this sample would then crash:

```ts
const b: Base = new Derived();
// Crashes because "name" will be undefined
b.greet();
```

##### Type-only Field Declarations

When `target >= ES2022` or [`useDefineForClassFields`](https://www.typescriptlang.org/tsconfig#useDefineForClassFields) is `true`, class fields are initialized after the parent class constructor completes, overwriting any value set by the parent class. This can be a problem when you only want to re-declare a more accurate type for an inherited field. To handle these cases, you can write `declare` to indicate to TypeScript that there should be no runtime effect for this field declaration.

```ts
interface Animal {
  dateOfBirth: any;
}

interface Dog extends Animal {
  breed: any;
}

class AnimalHouse {
  resident: Animal;
  constructor(animal: Animal) {
    this.resident = animal;
  }
}

class DogHouse extends AnimalHouse {
  // Does not emit JavaScript code,
  // only ensures the types are correct
  declare resident: Dog;
  constructor(dog: Dog) {
    super(dog);
  }
}
```

##### Initialization Order

The order that JavaScript classes initialize can be surprising in some cases.
Let's consider this code:

```ts
class Base {
  name = "base";
  constructor() {
    console.log("My name is " + this.name);
  }
}

class Derived extends Base {
  name = "derived";
}

// Prints "base", not "derived"
const d = new Derived();
```

What happened here?

The order of class initialization, as defined by JavaScript, is:

- The base class fields are initialized
- The base class constructor runs
- The derived class fields are initialized
- The derived class constructor runs

This means that the base class constructor saw its own value for `name` during its own constructor, because the derived class field initializations hadn't run yet.

##### Inheriting Built-in Types

> Note: If you don't plan to inherit from built-in types like `Array`, `Error`, `Map`, etc. or your compilation target is explicitly set to `ES6`/`ES2015` or above, you may skip this section

In ES2015, constructors which return an object implicitly substitute the value of `this` for any callers of `super(...)`.
It is necessary for generated constructor code to capture any potential return value of `super(...)` and replace it with `this`.

As a result, subclassing `Error`, `Array`, and others may no longer work as expected.
This is due to the fact that constructor functions for `Error`, `Array`, and the like use ECMAScript 6's `new.target` to adjust the prototype chain;
however, there is no way to ensure a value for `new.target` when invoking a constructor in ECMAScript 5.
Other downlevel compilers generally have the same limitation by default.

For a subclass like the following:

```ts
class MsgError extends Error {
  constructor(m: string) {
    super(m);
  }
  sayHello() {
    return "hello " + this.message;
  }
}
```

you may find that:

- methods may be `undefined` on objects returned by constructing these subclasses, so calling `sayHello` will result in an error.
- `instanceof` will be broken between instances of the subclass and their instances, so `(new MsgError()) instanceof MsgError` will return `false`.

As a recommendation, you can manually adjust the prototype immediately after any `super(...)` calls.

```ts
class MsgError extends Error {
  constructor(m: string) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MsgError.prototype);
  }

  sayHello() {
    return "hello " + this.message;
  }
}
```

However, any subclass of `MsgError` will have to manually set the prototype as well.
For runtimes that don't support [`Object.setPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf), you may instead be able to use [`__proto__`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto).

Unfortunately, [these workarounds will not work on Internet Explorer 10 and prior](<https://msdn.microsoft.com/en-us/library/s4esdbwz(v=vs.94).aspx>).
One can manually copy methods from the prototype onto the instance itself (i.e. `MsgError.prototype` onto `this`), but the prototype chain itself cannot be fixed.

### Member Visibility

You can use TypeScript to control whether certain methods or properties are visible to code outside the class.

#### `public`

The default visibility of class members is `public`.
A `public` member can be accessed anywhere:

```ts
class Greeter {
  public greet() {
    console.log("hi!");
  }
}
const g = new Greeter();
g.greet();
```

Because `public` is already the default visibility modifier, you don't ever _need_ to write it on a class member, but might choose to do so for style/readability reasons.

#### `protected`

`protected` members are only visible to subclasses of the class they're declared in.

```ts
class Greeter {
  public greet() {
    console.log("Hello, " + this.getName());
  }
  protected getName() {
    return "hi";
  }
}

class SpecialGreeter extends Greeter {
  public howdy() {
    // OK to access protected member here
    console.log("Howdy, " + this.getName());
  }
}
const g = new SpecialGreeter();
g.greet(); // OK
g.getName();
```

##### Exposure of `protected` members

Derived classes need to follow their base class contracts, but may choose to expose a subtype of base class with more capabilities.
This includes making `protected` members `public`:

```ts
class Base {
  protected m = 10;
}
class Derived extends Base {
  // No modifier, so default is 'public'
  m = 15;
}
const d = new Derived();
console.log(d.m); // OK
```

Note that `Derived` was already able to freely read and write `m`, so this doesn't meaningfully alter the "security" of this situation.
The main thing to note here is that in the derived class, we need to be careful to repeat the `protected` modifier if this exposure isn't intentional.

##### Cross-hierarchy `protected` access

TypeScript doesn't allow accessing `protected` members of a sibling class in a class hierarchy:

```ts
class Base {
  protected x: number = 1;
}
class Derived1 extends Base {
  protected x: number = 5;
}
class Derived2 extends Base {
  f1(other: Derived2) {
    other.x = 10;
  }
  f2(other: Derived1) {
    other.x = 10;
  }
}
```

This is because accessing `x` in `Derived2` should only be legal from `Derived2`'s subclasses, and `Derived1` isn't one of them.
Moreover, if accessing `x` through a `Derived1` reference is illegal (which it certainly should be!), then accessing it through a base class reference should never improve the situation.

See also [Why Can’t I Access A Protected Member From A Derived Class?](https://blogs.msdn.microsoft.com/ericlippert/2005/11/09/why-cant-i-access-a-protected-member-from-a-derived-class/) which explains more of C#'s reasoning on the same topic.

#### `private`

`private` is like `protected`, but doesn't allow access to the member even from subclasses:

```ts
class Base {
  private x = 0;
}
const b = new Base();
// Can't access from outside the class
console.log(b.x);
```

```ts
class Derived extends Base {
  showX() {
    // Can't access in subclasses
    console.log(this.x);
  }
}
```

Because `private` members aren't visible to derived classes, a derived class can't increase their visibility:

```ts
class Base {
  private x = 0;
}
class Derived extends Base {
  x = 1;
}
```

##### Cross-instance `private` access

Different OOP languages disagree about whether different instances of the same class may access each others' `private` members.
While languages like Java, C#, C++, Swift, and PHP allow this, Ruby does not.

TypeScript does allow cross-instance `private` access:

```ts
class A {
  private x = 10;

  public sameAs(other: A) {
    // No error
    return other.x === this.x;
  }
}
```

##### Caveats

Like other aspects of TypeScript's type system, `private` and `protected` [are only enforced during type checking](https://www.typescriptlang.org/play?removeComments=true&target=99&ts=4.3.4#code/PTAEGMBsEMGddAEQPYHNQBMCmVoCcsEAHPASwDdoAXLUAM1K0gwQFdZSA7dAKWkoDK4MkSoByBAGJQJLAwAeAWABQIUH0HDSoiTLKUaoUggAW+DHorUsAOlABJcQlhUy4KpACeoLJzrI8cCwMGxU1ABVPIiwhESpMZEJQTmR4lxFQaQxWMm4IZABbIlIYKlJkTlDlXHgkNFAAbxVQTIAjfABrAEEC5FZOeIBeUAAGAG5mmSw8WAroSFIqb2GAIjMiIk8VieVJ8Ar01ncAgAoASkaAXxVr3dUwGoQAYWpMHBgCYn1rekZmNg4eUi0Vi2icoBWJCsNBWoA6WE8AHcAiEwmBgTEtDovtDaMZQLM6PEoQZbA5wSk0q5SO4vD4-AEghZoJwLGYEIRwNBoqAzFRwCZCFUIlFMXECdSiAhId8YZgclx0PsiiVqOVOAAaUAFLAsxWgKiC35MFigfC0FKgSAVVDTSyk+W5dB4fplHVVR6gF7xJrKFotEk-HXIRE9PoDUDDcaTAPTWaceaLZYQlmoPBbHYx-KcQ7HPDnK43FQqfY5+IMDDISPJLCIuqoc47UsuUCofAME3Vzi1r3URvF5QV5A2STtPDdXqunZDgDaYlHnTDrrEAF0dm28B3mDZg6HJwN1+2-hg57ulwNV2NQGoZbjYfNrYiENBwEFaojFiZQK08C-4fFKTVCozWfTgfFgLkeT5AUqiAA).

This means that JavaScript runtime constructs like `in` or simple property lookup can still access a `private` or `protected` member:

```ts
class MySafe {
  private secretKey = 12345;
}
```

```js
// In a JavaScript file...
const s = new MySafe();
// Will print 12345
console.log(s.secretKey);
```

`private` also allows access using bracket notation during type checking. This makes `private`-declared fields potentially easier to access for things like unit tests, with the drawback that these fields are _soft private_ and don't strictly enforce privacy.

```ts
class MySafe {
  private secretKey = 12345;
}

const s = new MySafe();

// Not allowed during type checking
console.log(s.secretKey);

// OK
console.log(s["secretKey"]);
```

Unlike TypeScripts's `private`, JavaScript's [private fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields) (`#`) remain private after compilation and do not provide the previously mentioned escape hatches like bracket notation access, making them _hard private_.

```ts
class Dog {
  #barkAmount = 0;
  personality = "happy";

  constructor() {}
}
```

```ts
class Dog {
  #barkAmount = 0;
  personality = "happy";

  constructor() {}
}
```

When compiling to ES2021 or less, TypeScript will use WeakMaps in place of `#`.

```ts
class Dog {
  #barkAmount = 0;
  personality = "happy";

  constructor() {}
}
```

If you need to protect values in your class from malicious actors, you should use mechanisms that offer hard runtime privacy, such as closures, WeakMaps, or private fields. Note that these added privacy checks during runtime could affect performance.

### Static Members

<blockquote class='bg-reading'>
   <p>Background Reading:<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static'>Static Members (MDN)</a><br/>
   </p>
</blockquote>

Classes may have `static` members.
These members aren't associated with a particular instance of the class.
They can be accessed through the class constructor object itself:

```ts
class MyClass {
  static x = 0;
  static printX() {
    console.log(MyClass.x);
  }
}
console.log(MyClass.x);
MyClass.printX();
```

Static members can also use the same `public`, `protected`, and `private` visibility modifiers:

```ts
class MyClass {
  private static x = 0;
}
console.log(MyClass.x);
```

Static members are also inherited:

```ts
class Base {
  static getGreeting() {
    return "Hello world";
  }
}
class Derived extends Base {
  myGreeting = Derived.getGreeting();
}
```

#### Special Static Names

It's generally not safe/possible to overwrite properties from the `Function` prototype.
Because classes are themselves functions that can be invoked with `new`, certain `static` names can't be used.
Function properties like `name`, `length`, and `call` aren't valid to define as `static` members:

```ts
class S {
  static name = "S!";
}
```

#### Why No Static Classes?

TypeScript (and JavaScript) don't have a construct called `static class` the same way as, for example, C# does.

Those constructs _only_ exist because those languages force all data and functions to be inside a class; because that restriction doesn't exist in TypeScript, there's no need for them.
A class with only a single instance is typically just represented as a normal _object_ in JavaScript/TypeScript.

For example, we don't need a "static class" syntax in TypeScript because a regular object (or even top-level function) will do the job just as well:

```ts
// Unnecessary "static" class
class MyStaticClass {
  static doSomething() {}
}

// Preferred (alternative 1)
function doSomething() {}

// Preferred (alternative 2)
const MyHelperObject = {
  dosomething() {},
};
```

### `static` Blocks in Classes

Static blocks allow you to write a sequence of statements with their own scope that can access private fields within the containing class. This means that we can write initialization code with all the capabilities of writing statements, no leakage of variables, and full access to our class's internals.

```ts
class Foo {
    static #count = 0;

    get count() {
        return Foo.#count;
    }

    static {
        try {
            const lastInstances = loadLastInstances();
            Foo.#count += lastInstances.length;
        }
        catch {}
    }
}
```

### Generic Classes

Classes, much like interfaces, can be generic.
When a generic class is instantiated with `new`, its type parameters are inferred the same way as in a function call:

```ts
class Box<Type> {
  contents: Type;
  constructor(value: Type) {
    this.contents = value;
  }
}

const b = new Box("hello!");
```

Classes can use generic constraints and defaults the same way as interfaces.

#### Type Parameters in Static Members

This code isn't legal, and it may not be obvious why:

```ts
class Box<Type> {
  static defaultValue: Type;
}
```

Remember that types are always fully erased!
At runtime, there's only _one_ `Box.defaultValue` property slot.
This means that setting `Box<string>.defaultValue` (if that were possible) would _also_ change `Box<number>.defaultValue` - not good.
The `static` members of a generic class can never refer to the class's type parameters.

### `this` at Runtime in Classes

<blockquote class='bg-reading'>
   <p>Background Reading:<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this'>this keyword (MDN)</a><br/>
   </p>
</blockquote>

It's important to remember that TypeScript doesn't change the runtime behavior of JavaScript, and that JavaScript is somewhat famous for having some peculiar runtime behaviors.

JavaScript's handling of `this` is indeed unusual:

```ts
class MyClass {
  name = "MyClass";
  getName() {
    return this.name;
  }
}
const c = new MyClass();
const obj = {
  name: "obj",
  getName: c.getName,
};

// Prints "obj", not "MyClass"
console.log(obj.getName());
```

Long story short, by default, the value of `this` inside a function depends on _how the function was called_.
In this example, because the function was called through the `obj` reference, its value of `this` was `obj` rather than the class instance.

This is rarely what you want to happen!
TypeScript provides some ways to mitigate or prevent this kind of error.

#### Arrow Functions

<blockquote class='bg-reading'>
   <p>Background Reading:<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions'>Arrow functions (MDN)</a><br/>
   </p>
</blockquote>

If you have a function that will often be called in a way that loses its `this` context, it can make sense to use an arrow function property instead of a method definition:

```ts
class MyClass {
  name = "MyClass";
  getName = () => {
    return this.name;
  };
}
const c = new MyClass();
const g = c.getName;
// Prints "MyClass" instead of crashing
console.log(g());
```

This has some trade-offs:

- The `this` value is guaranteed to be correct at runtime, even for code not checked with TypeScript
- This will use more memory, because each class instance will have its own copy of each function defined this way
- You can't use `super.getName` in a derived class, because there's no entry in the prototype chain to fetch the base class method from

#### `this` parameters

In a method or function definition, an initial parameter named `this` has special meaning in TypeScript.
These parameters are erased during compilation:

```ts
// TypeScript input with 'this' parameter
function fn(this: SomeType, x: number) {
  /* ... */
}
```

```js
// JavaScript output
function fn(x) {
  /* ... */
}
```

TypeScript checks that calling a function with a `this` parameter is done so with a correct context.
Instead of using an arrow function, we can add a `this` parameter to method definitions to statically enforce that the method is called correctly:

```ts
class MyClass {
  name = "MyClass";
  getName(this: MyClass) {
    return this.name;
  }
}
const c = new MyClass();
// OK
c.getName();

// Error, would crash
const g = c.getName;
console.log(g());
```

This method makes the opposite trade-offs of the arrow function approach:

- JavaScript callers might still use the class method incorrectly without realizing it
- Only one function per class definition gets allocated, rather than one per class instance
- Base method definitions can still be called via `super`.

### `this` Types

In classes, a special type called `this` refers _dynamically_ to the type of the current class.
Let's see how this is useful:

<!-- prettier-ignore -->
```ts
class Box {
  contents: string = "";
  set(value: string) {
    this.contents = value;
    return this;
  }
}
```

Here, TypeScript inferred the return type of `set` to be `this`, rather than `Box`.
Now let's make a subclass of `Box`:

```ts
class ClearableBox extends Box {
  clear() {
    this.contents = "";
  }
}

const a = new ClearableBox();
const b = a.set("hello");
```

You can also use `this` in a parameter type annotation:

```ts
class Box {
  content: string = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}
```

This is different from writing `other: Box` -- if you have a derived class, its `sameAs` method will now only accept other instances of that same derived class:

```ts
class Box {
  content: string = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}

class DerivedBox extends Box {
  otherContent: string = "?";
}

const base = new Box();
const derived = new DerivedBox();
derived.sameAs(base);
```

#### `this`-based type guards

You can use `this is Type` in the return position for methods in classes and interfaces.
When mixed with a type narrowing (e.g. `if` statements) the type of the target object would be narrowed to the specified `Type`.

<!-- prettier-ignore -->
```ts
class FileSystemObject {
  isFile(): this is FileRep {
    return this instanceof FileRep;
  }
  isDirectory(): this is Directory {
    return this instanceof Directory;
  }
  isNetworked(): this is Networked & this {
    return this.networked;
  }
  constructor(public path: string, private networked: boolean) {}
}

class FileRep extends FileSystemObject {
  constructor(path: string, public content: string) {
    super(path, false);
  }
}

class Directory extends FileSystemObject {
  children: FileSystemObject[];
}

interface Networked {
  host: string;
}

const fso: FileSystemObject = new FileRep("foo/bar.txt", "foo");

if (fso.isFile()) {
  fso.content;
} else if (fso.isDirectory()) {
  fso.children;
} else if (fso.isNetworked()) {
  fso.host;
}
```

A common use-case for a this-based type guard is to allow for lazy validation of a particular field. For example, this case removes an `undefined` from the value held inside box when `hasValue` has been verified to be true:

```ts
class Box<T> {
  value?: T;

  hasValue(): this is { value: T } {
    return this.value !== undefined;
  }
}

const box = new Box<string>();
box.value = "Gameboy";

box.value;

if (box.hasValue()) {
  box.value;
}
```

### Parameter Properties

TypeScript offers special syntax for turning a constructor parameter into a class property with the same name and value.
These are called _parameter properties_ and are created by prefixing a constructor argument with one of the visibility modifiers `public`, `private`, `protected`, or `readonly`.
The resulting field gets those modifier(s):

```ts
class Params {
  constructor(
    public readonly x: number,
    protected y: number,
    private z: number
  ) {
    // No body necessary
  }
}
const a = new Params(1, 2, 3);
console.log(a.x);
console.log(a.z);
```

### Class Expressions

<blockquote class='bg-reading'>
   <p>Background Reading:<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/class'>Class expressions (MDN)</a><br/>
   </p>
</blockquote>

Class expressions are very similar to class declarations.
The only real difference is that class expressions don't need a name, though we can refer to them via whatever identifier they ended up bound to:

```ts
const someClass = class<Type> {
  content: Type;
  constructor(value: Type) {
    this.content = value;
  }
};

const m = new someClass("Hello, world");
```

### Constructor Signatures

JavaScript classes are instantiated with the `new` operator. Given the type of a class itself, the [InstanceType](https://www.typescriptlang.org/docs/handbook/utility-types.html#instancetypetype) utility type models this operation.

```ts
class Point {
  createdAt: number;
  x: number;
  y: number
  constructor(x: number, y: number) {
    this.createdAt = Date.now()
    this.x = x;
    this.y = y;
  }
}
type PointInstance = InstanceType<typeof Point>

function moveRight(point: PointInstance) {
  point.x += 5;
}

const point = new Point(3, 4);
moveRight(point);
point.x; // => 8
```

### `abstract` Classes and Members

Classes, methods, and fields in TypeScript may be _abstract_.

An _abstract method_ or _abstract field_ is one that hasn't had an implementation provided.
These members must exist inside an _abstract class_, which cannot be directly instantiated.

The role of abstract classes is to serve as a base class for subclasses which do implement all the abstract members.
When a class doesn't have any abstract members, it is said to be _concrete_.

Let's look at an example:

```ts
abstract class Base {
  abstract getName(): string;

  printName() {
    console.log("Hello, " + this.getName());
  }
}

const b = new Base();
```

We can't instantiate `Base` with `new` because it's abstract.
Instead, we need to make a derived class and implement the abstract members:

```ts
class Derived extends Base {
  getName() {
    return "world";
  }
}

const d = new Derived();
d.printName();
```

Notice that if we forget to implement the base class's abstract members, we'll get an error:

```ts
class Derived extends Base {
  // forgot to do anything
}
```

#### Abstract Construct Signatures

Sometimes you want to accept some class constructor function that produces an instance of a class which derives from some abstract class.

For example, you might want to write this code:

```ts
function greet(ctor: typeof Base) {
  const instance = new ctor();
  instance.printName();
}
```

TypeScript is correctly telling you that you're trying to instantiate an abstract class.
After all, given the definition of `greet`, it's perfectly legal to write this code, which would end up constructing an abstract class:

```ts
// Bad!
greet(Base);
```

Instead, you want to write a function that accepts something with a construct signature:

```ts
function greet(ctor: new () => Base) {
  const instance = new ctor();
  instance.printName();
}
greet(Derived);
greet(Base);
```

Now TypeScript correctly tells you about which class constructor functions can be invoked - `Derived` can because it's concrete, but `Base` cannot.

### Relationships Between Classes

In most cases, classes in TypeScript are compared structurally, the same as other types.

For example, these two classes can be used in place of each other because they're identical:

```ts
class Point1 {
  x = 0;
  y = 0;
}

class Point2 {
  x = 0;
  y = 0;
}

// OK
const p: Point1 = new Point2();
```

Similarly, subtype relationships between classes exist even if there's no explicit inheritance:

```ts
class Person {
  name: string;
  age: number;
}

class Employee {
  name: string;
  age: number;
  salary: number;
}

// OK
const p: Person = new Employee();
```

This sounds straightforward, but there are a few cases that seem stranger than others.

Empty classes have no members.
In a structural type system, a type with no members is generally a supertype of anything else.
So if you write an empty class (don't!), anything can be used in place of it:

```ts
class Empty {}

function fn(x: Empty) {
  // can't do anything with 'x', so I won't
}

// All OK!
fn(window);
fn({});
fn(fn);
```

## Generics

> **Source:** [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) · [TypeScript Handbook](https://github.com/microsoft/TypeScript-Website), CC BY 4.0

A major part of software engineering is building components that not only have well-defined and consistent APIs, but are also reusable.
Components that are capable of working on the data of today as well as the data of tomorrow will give you the most flexible capabilities for building up large software systems.

In languages like C# and Java, one of the main tools in the toolbox for creating reusable components is _generics_, that is, being able to create a component that can work over a variety of types rather than a single one.
This allows users to consume these components and use their own types.

### Hello World of Generics

To start off, let's do the "hello world" of generics: the identity function.
The identity function is a function that will return back whatever is passed in.
You can think of this in a similar way to the `echo` command.

Without generics, we would either have to give the identity function a specific type:

```ts
function identity(arg: number): number {
  return arg;
}
```

Or, we could describe the identity function using the `any` type:

```ts
function identity(arg: any): any {
  return arg;
}
```

While using `any` is certainly generic in that it will cause the function to accept any and all types for the type of `arg`, we actually are losing the information about what that type was when the function returns.
If we passed in a number, the only information we have is that any type could be returned.

Instead, we need a way of capturing the type of the argument in such a way that we can also use it to denote what is being returned.
Here, we will use a _type variable_, a special kind of variable that works on types rather than values.

```ts
function identity<Type>(arg: Type): Type {
  return arg;
}
```

We've now added a type variable `Type` to the identity function.
This `Type` allows us to capture the type the user provides (e.g. `number`), so that we can use that information later.
Here, we use `Type` again as the return type. On inspection, we can now see the same type is used for the argument and the return type.
This allows us to traffic that type information in one side of the function and out the other.

We say that this version of the `identity` function is generic, as it works over a range of types.
Unlike using `any`, it's also just as precise (i.e., it doesn't lose any information) as the first `identity` function that used numbers for the argument and return type.

Once we've written the generic identity function, we can call it in one of two ways.
The first way is to pass all of the arguments, including the type argument, to the function:

```ts
let output = identity<string>("myString");
```

Here we explicitly set `Type` to be `string` as one of the arguments to the function call, denoted using the `<>` around the arguments rather than `()`.

The second way is also perhaps the most common. Here we use _type argument inference_ -- that is, we want the compiler to set the value of `Type` for us automatically based on the type of the argument we pass in:

```ts
let output = identity("myString");
```

Notice that we didn't have to explicitly pass the type in the angle brackets (`<>`); the compiler just looked at the value `"myString"`, and set `Type` to its type.
While type argument inference can be a helpful tool to keep code shorter and more readable, you may need to explicitly pass in the type arguments as we did in the previous example when the compiler fails to infer the type, as may happen in more complex examples.

### Working with Generic Type Variables

When you begin to use generics, you'll notice that when you create generic functions like `identity`, the compiler will enforce that you use any generically typed parameters in the body of the function correctly.
That is, that you actually treat these parameters as if they could be any and all types.

Let's take our `identity` function from earlier:

```ts
function identity<Type>(arg: Type): Type {
  return arg;
}
```

What if we want to also log the length of the argument `arg` to the console with each call?
We might be tempted to write this:

```ts
function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
  return arg;
}
```

When we do, the compiler will give us an error that we're using the `.length` member of `arg`, but nowhere have we said that `arg` has this member.
Remember, we said earlier that these type variables stand in for any and all types, so someone using this function could have passed in a `number` instead, which does not have a `.length` member.

Let's say that we've actually intended this function to work on arrays of `Type` rather than `Type` directly. Since we're working with arrays, the `.length` member should be available.
We can describe this just like we would create arrays of other types:

```ts
function loggingIdentity<Type>(arg: Type[]): Type[] {
  console.log(arg.length);
  return arg;
}
```

You can read the type of `loggingIdentity` as "the generic function `loggingIdentity` takes a type parameter `Type`, and an argument `arg` which is an array of `Type`s, and returns an array of `Type`s."
If we passed in an array of numbers, we'd get an array of numbers back out, as `Type` would bind to `number`.
This allows us to use our generic type variable `Type` as part of the types we're working with, rather than the whole type, giving us greater flexibility.

We can alternatively write the sample example this way:

```ts
function loggingIdentity<Type>(arg: Array<Type>): Array<Type> {
  console.log(arg.length); // Array has a .length, so no more error
  return arg;
}
```

You may already be familiar with this style of type from other languages.
In the next section, we'll cover how you can create your own generic types like `Array<Type>`.

### Generic Types

In previous sections, we created generic identity functions that worked over a range of types.
In this section, we'll explore the type of the functions themselves and how to create generic interfaces.

The type of generic functions is just like those of non-generic functions, with the type parameters listed first, similarly to function declarations:

```ts
function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: <Type>(arg: Type) => Type = identity;
```

We could also have used a different name for the generic type parameter in the type, so long as the number of type variables and how the type variables are used line up.

```ts
function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: <Input>(arg: Input) => Input = identity;
```

We can also write the generic type as a call signature of an object literal type:

```ts
function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: { <Type>(arg: Type): Type } = identity;
```

Which leads us to writing our first generic interface.
Let's take the object literal from the previous example and move it to an interface:

```ts
interface GenericIdentityFn {
  <Type>(arg: Type): Type;
}

function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: GenericIdentityFn = identity;
```

In a similar example, we may want to move the generic parameter to be a parameter of the whole interface.
This lets us see what type(s) we're generic over (e.g. `Dictionary<string>` rather than just `Dictionary`).
This makes the type parameter visible to all the other members of the interface.

```ts
interface GenericIdentityFn<Type> {
  (arg: Type): Type;
}

function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

Notice that our example has changed to be something slightly different.
Instead of describing a generic function, we now have a non-generic function signature that is a part of a generic type.
When we use `GenericIdentityFn`, we now will also need to specify the corresponding type argument (here: `number`), effectively locking in what the underlying call signature will use.
Understanding when to put the type parameter directly on the call signature and when to put it on the interface itself will be helpful in describing what aspects of a type are generic.

In addition to generic interfaces, we can also create generic classes.
Note that it is not possible to create generic enums and namespaces.

### Generic Classes

A generic class has a similar shape to a generic interface.
Generic classes have a generic type parameter list in angle brackets (`<>`) following the name of the class.

```ts
class GenericNumber<NumType> {
  zeroValue: NumType;
  add: (x: NumType, y: NumType) => NumType;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) {
  return x + y;
};
```

This is a pretty literal use of the `GenericNumber` class, but you may have noticed that nothing is restricting it to only use the `number` type.
We could have instead used `string` or even more complex objects.

```ts
let stringNumeric = new GenericNumber<string>();
stringNumeric.zeroValue = "";
stringNumeric.add = function (x, y) {
  return x + y;
};

console.log(stringNumeric.add(stringNumeric.zeroValue, "test"));
```

Just as with interface, putting the type parameter on the class itself lets us make sure all of the properties of the class are working with the same type.

As we cover in [our section on classes](https://www.typescriptlang.org/docs/handbook/2/classes.html), a class has two sides to its type: the static side and the instance side.
Generic classes are only generic over their instance side rather than their static side, so when working with classes, static members can not use the class's type parameter.

### Generic Constraints

If you remember from an earlier example, you may sometimes want to write a generic function that works on a set of types where you have _some_ knowledge about what capabilities that set of types will have.
In our `loggingIdentity` example, we wanted to be able to access the `.length` property of `arg`, but the compiler could not prove that every type had a `.length` property, so it warns us that we can't make this assumption.

```ts
function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
  return arg;
}
```

Instead of working with any and all types, we'd like to constrain this function to work with any and all types that *also*  have the `.length` property.
As long as the type has this member, we'll allow it, but it's required to have at least this member.
To do so, we must list our requirement as a constraint on what `Type` can be.

To do so, we'll create an interface that describes our constraint.
Here, we'll create an interface that has a single `.length` property and then we'll use this interface and the `extends` keyword to denote our constraint:

```ts
interface Lengthwise {
  length: number;
}

function loggingIdentity<Type extends Lengthwise>(arg: Type): Type {
  console.log(arg.length); // Now we know it has a .length property, so no more error
  return arg;
}
```

Because the generic function is now constrained, it will no longer work over any and all types:

```ts
loggingIdentity(3);
```

Instead, we need to pass in values whose type has all the required properties:

```ts
loggingIdentity({ length: 10, value: 3 });
```

### Using Type Parameters in Generic Constraints

You can declare a type parameter that is constrained by another type parameter.
For example, here we'd like to get a property from an object given its name.
We'd like to ensure that we're not accidentally grabbing a property that does not exist on the `obj`, so we'll place a constraint between the two types:

```ts
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a");
getProperty(x, "m");
```

### Using Class Types in Generics

When creating factories in TypeScript using generics, it is necessary to refer to class types by their constructor functions. For example,

```ts
function create<Type>(c: { new (): Type }): Type {
  return new c();
}
```

A more advanced example uses the prototype property to infer and constrain relationships between the constructor function and the instance side of class types.

```ts
class BeeKeeper {
  hasMask: boolean = true;
}

class ZooKeeper {
  nametag: string = "Mikle";
}

class Animal {
  numLegs: number = 4;
}

class Bee extends Animal {
  numLegs = 6;
  keeper: BeeKeeper = new BeeKeeper();
}

class Lion extends Animal {
  keeper: ZooKeeper = new ZooKeeper();
}

function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}

createInstance(Lion).keeper.nametag;
createInstance(Bee).keeper.hasMask;
```

This pattern is used to power the [mixins](https://www.typescriptlang.org/docs/handbook/mixins.html) design pattern.

### Generic Parameter Defaults

By declaring a default for a generic type parameter, you make it optional to specify the corresponding type argument. For example, a function which creates a new `HTMLElement`. Calling the function with no arguments generates a `HTMLDivElement`; calling the function with an element as the first argument generates an element of the argument's type. You can optionally pass a list of children as well. Previously you would have to define the function as:

```ts
declare function create(): Container<HTMLDivElement, HTMLDivElement[]>;
declare function create<T extends HTMLElement>(element: T): Container<T, T[]>;
declare function create<T extends HTMLElement, U extends HTMLElement>(
  element: T,
  children: U[]
): Container<T, U[]>;
```

With generic parameter defaults we can reduce it to:

```ts
declare function create<T extends HTMLElement = HTMLDivElement, U extends HTMLElement[] = T[]>(
  element?: T,
  children?: U
): Container<T, U>;

const div = create();

const p = create(new HTMLParagraphElement());
```

A generic parameter default follows the following rules:

- A type parameter is deemed optional if it has a default.
- Required type parameters must not follow optional type parameters.
- Default types for a type parameter must satisfy the constraint for the type parameter, if it exists.
- When specifying type arguments, you are only required to specify type arguments for the required type parameters. Unspecified type parameters will resolve to their default types.
- If a default type is specified and inference cannot choose a candidate, the default type is inferred.
- A class or interface declaration that merges with an existing class or interface declaration may introduce a default for an existing type parameter.
- A class or interface declaration that merges with an existing class or interface declaration may introduce a new type parameter as long as it specifies a default.

### Variance Annotations

> This is an advanced feature for solving a very specific problem, and should only be used in situations where you've identified a reason to use it

[Covariance and contravariance](https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)) are type theory terms that describe what the relationship between two generic types is.
Here's a brief primer on the concept.

For example, if you have an interface representing an object that can `make` a certain type:
```ts
interface Producer<T> {
  make(): T;
}
```
We can use a `Producer<Cat>` where a `Producer<Animal>` is expected, because a `Cat` is an `Animal`.
This relationship is called *covariance*: the relationship from `Producer<T>` to `Producer<U>` is the same as the relationship from `T` to `U`.

Conversely, if you have an interface that can `consume` a certain type:
```ts
interface Consumer<T> {
  consume: (arg: T) => void;
}
```
Then we can use a `Consumer<Animal>` where a `Consumer<Cat>` is expected, because any function that is capable of accepting an `Animal` must also be capable of accepting a `Cat`.
This relationship is called *contravariance*: the relationship from `Consumer<T>` to `Consumer<U>` is the same as the relationship from `U` to `T`.
Note the reversal of direction as compared to covariance! This is why contravariance "cancels itself out" but covariance doesn't.

In a structural type system like TypeScript's, covariance and contravariance are naturally emergent behaviors that follow from the definition of types.
Even in the absence of generics, we would see covariant (and contravariant) relationships:
```ts
interface AnimalProducer {
  make(): Animal;
}

// A CatProducer can be used anywhere an
// Animal producer is expected
interface CatProducer {
  make(): Cat;
}
```

TypeScript has a structural type system, so when comparing two types, e.g. to see if a `Producer<Cat>` can be used where a `Producer<Animal>` is expected, the usual algorithm would be structurally expand both of those definitions, and compare their structures.
However, variance allows for an extremely useful optimization: if `Producer<T>` is covariant on `T`, then we can simply check `Cat` and `Animal` instead, as we know they'll have the same relationship as `Producer<Cat>` and `Producer<Animal>`.

Note that this logic can only be used when we're examining two instantiations of the same type.
If we have a `Producer<T>` and a `FastProducer<U>`, there's no guarantee that `T` and `U` necessarily refer to the same positions in these types, so this check will always be performed structurally.

Because variance is a naturally emergent property of structural types, TypeScript automatically *infers* the variance of every generic type.
**In extremely rare cases** involving certain kinds of circular types, this measurement can be inaccurate.
If this happens, you can add a variance annotation to a type parameter to force a particular variance:
```ts
// Contravariant annotation
interface Consumer<in T> {
  consume: (arg: T) => void;
}

// Covariant annotation
interface Producer<out T> {
  make(): T;
}

// Invariant annotation
interface ProducerConsumer<in out T> {
  consume: (arg: T) => void;
  make(): T;
}
```
Only do this if you are writing the same variance that *should* occur structurally.

> Never write a variance annotation that doesn't match the structural variance!

It's critical to reinforce that variance annotations are only in effect during an instantiation-based comparison.
They have no effect during a structural comparison.
For example, you can't use variance annotations to "force" a type to be actually invariant:
```ts
// DON'T DO THIS - variance annotation
// does not match structural behavior
interface Producer<in out T> {
  make(): T;
}

// Not a type error -- this is a structural
// comparison, so variance annotations are
// not in effect
const p: Producer<string | number> = {
    make(): number {
        return 42;
    }
}
```
Here, the object literal's `make` function returns `number`, which we might expect to cause an error because `number` isn't `string | number`.
However, this isn't an instantiation-based comparison, because the object literal is an anonymous type, not a `Producer<string | number>`.

> Variance annotations don't change structural behavior and are only consulted in specific situations

It's very important to only write variance annotations if you absolutely know why you're doing it, what their limitations are, and when they aren't in effect.
Whether TypeScript uses an instantiation-based comparison or structural comparison is not a specified behavior and may change from version to version for correctness or performance reasons, so you should only ever write variance annotations when they match the structural behavior of a type.
Don't use variance annotations to try to "force" a particular variance; this will cause unpredictable behavior in your code.

> Do NOT write variance annotations unless they match the structural behavior of a type

Remember, TypeScript can automatically infer variance from your generic types.
It's almost never necessary to write a variance annotation, and you should only do so when you've identified a specific need.
Variance annotations *do not* change the structural behavior of a type, and depending on the situation, you might see a structural comparison made when you expected an instantiation-based comparison.
Variance annotations can't be used to modify how types behave in these structural contexts, and shouldn't be written unless the annotation is the same as the structural definition.
Because this is difficult to get right, and TypeScript can correctly infer variance in the vast majority of cases, you should not find yourself writing variance annotations in normal code.

> Don't try to use variance annotations to change typechecking behavior; this is not what they are for

You *may* find temporary variance annotations useful in a "type debugging" situation, because variance annotations are checked.
TypeScript will issue an error if the annotated variance is identifiably wrong:
```ts
// Error, this interface is definitely contravariant on T
interface Foo<out T> {
  consume: (arg: T) => void;
}
```
However, variance annotations are allowed to be stricter (e.g. `in out` is valid if the actual variance is covariant).
Be sure to remove your variance annotations once you're done debugging.

Lastly, if you're trying to maximize your typechecking performance, *and* have run a profiler, *and* have identified a specific type that's slow, *and* have identified variance inference specifically is slow, *and* have carefully validated the variance annotation you want to write, you *may* see a small performance benefit in extraordinarily complex types by adding variance annotations.

> Don't try to use variance annotations to change typechecking behavior; this is not what they are for
