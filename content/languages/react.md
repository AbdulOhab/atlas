---
title: "React"
order: 2
summary: "Components, JSX, props, state, events, rendering, reducers, context, refs, effects and custom Hooks, from react.dev's Learn section."
category: "React"
level: Beginner
---

# React

React builds interfaces from components: functions that take props and return JSX. This module follows the official Learn path: describing the UI, adding interactivity, managing state, and the escape hatches.

## Fundamentals

### The problem

In 2011 Facebook's interfaces were built the usual way: render HTML, then write jQuery code that changes the DOM by hand whenever data changes. With many pieces of data updating many parts of the page, the code that kept the screen in sync with the data became the main source of bugs, like the notification count that showed one number while the chat showed another. React (2013) was built to remove that whole category of code.

### Goals

- **UI as a function of state.** You describe what the screen should look like for the current data. React works out which DOM changes get it there.
- **Composition.** Build interfaces from small, reusable components that you can reason about one at a time.
- **Predictability.** Data flows one way, down from parents to children, so you can trace where a value came from.
- **Learn once, write anywhere.** The same model drives the DOM, native apps (React Native) and the server.

### The ideas everything else rests on

- **Components are functions.** They take props and return a description of UI (JSX). They should be pure: same inputs, same output, no side effects during render.
- **State triggers re-render.** Calling a setter doesn't change the variable in place. It schedules a new render with the new value. Each render is a snapshot.
- **Reconciliation.** React compares the new description with the old one and applies only the differences to the DOM. `key` tells it which list item is which.
- **One-way data flow.** Children change parent data by calling functions the parent passed down. State lives in the closest common parent ("lifting state up").
- **Effects are the escape hatch** for synchronizing with things outside React, such as subscriptions, timers and the network. They aren't for deriving data you could compute during render.

### Trade-offs

React is a library, not a framework. Routing, data fetching and builds come from elsewhere, which is why Next.js exists. Re-rendering whole subtrees is simple but can be wasteful, so you'll meet memoization (or the React Compiler). Hooks have rules (top level only, stable order) that exist because state is matched by call order.

## Thinking in React

> **Source:** [Thinking in React](https://react.dev/learn/thinking-in-react) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

React can change how you think about the designs you look at and the apps you build. When you build a user interface with React, you will first break it apart into pieces called *components*. Then, you will describe the different visual states for each of your components. Finally, you will connect your components together so that the data flows through them. In this tutorial, we’ll guide you through the thought process of building a searchable product data table with React.

### Start with the mockup

Imagine that you already have a JSON API and a mockup from a designer.

The JSON API returns some data that looks like this:

```json
[
  { category: "Fruits", price: "$1", stocked: true, name: "Apple" },
  { category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit" },
  { category: "Fruits", price: "$2", stocked: false, name: "Passionfruit" },
  { category: "Vegetables", price: "$2", stocked: true, name: "Spinach" },
  { category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin" },
  { category: "Vegetables", price: "$1", stocked: true, name: "Peas" }
]
```

The mockup looks like this:

![](https://react.dev/images/docs/s_thinking-in-react_ui.png)

To implement a UI in React, you will usually follow the same five steps.

### Step 1: Break the UI into a component hierarchy

Start by drawing boxes around every component and subcomponent in the mockup and naming them. If you work with a designer, they may have already named these components in their design tool. Ask them!

Depending on your background, you can think about splitting up a design into components in different ways:

* **Programming**--use the same techniques for deciding if you should create a new function or object. One such technique is the [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns), that is, a component should ideally only be concerned with one thing. If it ends up growing, it should be decomposed into smaller subcomponents.
* **CSS**--consider what you would make class selectors for. (However, components are a bit less granular.)
* **Design**--consider how you would organize the design's layers.

If your JSON is well-structured, you'll often find that it naturally maps to the component structure of your UI. That's because UI and data models often have the same information architecture--that is, the same shape. Separate your UI into components, where each component matches one piece of your data model.

There are five components on this screen:

![](https://react.dev/images/docs/s_thinking-in-react_ui_outline.png)

1. `FilterableProductTable` (grey) contains the entire app.
2. `SearchBar` (blue) receives the user input.
3. `ProductTable` (lavender) displays and filters the list according to the user input.
4. `ProductCategoryRow` (green) displays a heading for each category.
5. `ProductRow`	(yellow) displays a row for each product.

If you look at `ProductTable` (lavender), you'll see that the table header (containing the "Name" and "Price" labels) isn't its own component. This is a matter of preference, and you could go either way. For this example, it is a part of `ProductTable` because it appears inside the `ProductTable`'s list. However, if this header grows to be complex (e.g., if you add sorting), you can move it into its own `ProductTableHeader` component.

Now that you've identified the components in the mockup, arrange them into a hierarchy. Components that appear within another component in the mockup should appear as a child in the hierarchy:

* `FilterableProductTable`
    * `SearchBar`
    * `ProductTable`
        * `ProductCategoryRow`
        * `ProductRow`

### Step 2: Build a static version in React

Now that you have your component hierarchy, it's time to implement your app. The most straightforward approach is to build a version that renders the UI from your data model without adding any interactivity... yet! It's often easier to build the static version first and add interactivity later. Building a static version requires a lot of typing and no thinking, but adding interactivity requires a lot of thinking and not a lot of typing.

To build a static version of your app that renders your data model, you'll want to build [components](https://react.dev/learn/your-first-component) that reuse other components and pass data using [props.](https://react.dev/learn/passing-props-to-a-component) Props are a way of passing data from parent to child. (If you're familiar with the concept of [state](https://react.dev/learn/state-a-components-memory), don't use state at all to build this static version. State is reserved only for interactivity, that is, data that changes over time. Since this is a static version of the app, you don't need it.)

You can either build "top down" by starting with building the components higher up in the hierarchy (like `FilterableProductTable`) or "bottom up" by working from components lower down (like `ProductRow`). In simpler examples, it’s usually easier to go top-down, and on larger projects, it’s easier to go bottom-up.

```jsx
function ProductCategoryRow({ category }) {
  return (
    <tr>
      <th colSpan="2">
        {category}
      </th>
    </tr>
  );
}

function ProductRow({ product }) {
  const name = product.stocked ? product.name :
    <span style={{ color: 'red' }}>
      {product.name}
    </span>;

  return (
    <tr>
      <td>{name}</td>
      <td>{product.price}</td>
    </tr>
  );
}

function ProductTable({ products }) {
  const rows = [];
  let lastCategory = null;

  products.forEach((product) => {
    if (product.category !== lastCategory) {
      rows.push(
        <ProductCategoryRow
          category={product.category}
          key={product.category} />
      );
    }
    rows.push(
      <ProductRow
        product={product}
        key={product.name} />
    );
    lastCategory = product.category;
  });

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function SearchBar() {
  return (
    <form>
      <input type="text" placeholder="Search..." />
      <label>
        <input type="checkbox" />
        {' '}
        Only show products in stock
      </label>
    </form>
  );
}

function FilterableProductTable({ products }) {
  return (
    <div>
      <SearchBar />
      <ProductTable products={products} />
    </div>
  );
}

const PRODUCTS = [
  {category: "Fruits", price: "$1", stocked: true, name: "Apple"},
  {category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit"},
  {category: "Fruits", price: "$2", stocked: false, name: "Passionfruit"},
  {category: "Vegetables", price: "$2", stocked: true, name: "Spinach"},
  {category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin"},
  {category: "Vegetables", price: "$1", stocked: true, name: "Peas"}
];

export default function App() {
  return <FilterableProductTable products={PRODUCTS} />;
}
```

```css
body {
  padding: 5px
}
label {
  display: block;
  margin-top: 5px;
  margin-bottom: 5px;
}
th {
  padding-top: 10px;
}
td {
  padding: 2px;
  padding-right: 40px;
}
```

(If this code looks intimidating, go through the [Quick Start](https://react.dev/learn/) first!)

After building your components, you'll have a library of reusable components that render your data model. Because this is a static app, the components will only return JSX. The component at the top of the hierarchy (`FilterableProductTable`) will take your data model as a prop. This is called _one-way data flow_ because the data flows down from the top-level component to the ones at the bottom of the tree.

At this point, you should not be using any state values. That’s for the next step!

### Step 3: Find the minimal but complete representation of UI state

To make the UI interactive, you need to let users change your underlying data model. You will use *state* for this.

Think of state as the minimal set of changing data that your app needs to remember. The most important principle for structuring state is to keep it [DRY (Don't Repeat Yourself).](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) Figure out the absolute minimal representation of the state your application needs and compute everything else on-demand. For example, if you're building a shopping list, you can store the items as an array in state. If you want to also display the number of items in the list, don't store the number of items as another state value--instead, read the length of your array.

Now think of all of the pieces of data in this example application:

1. The original list of products
2. The search text the user has entered
3. The value of the checkbox
4. The filtered list of products

Which of these are state? Identify the ones that are not:

* Does it **remain unchanged** over time? If so, it isn't state.
* Is it **passed in from a parent** via props? If so, it isn't state.
* **Can you compute it** based on existing state or props in your component? If so, it *definitely* isn't state!

What's left is probably state.

Let's go through them one by one again:

1. The original list of products is **passed in as props, so it's not state.**
2. The search text seems to be state since it changes over time and can't be computed from anything.
3. The value of the checkbox seems to be state since it changes over time and can't be computed from anything.
4. The filtered list of products **isn't state because it can be computed** by taking the original list of products and filtering it according to the search text and value of the checkbox.

This means only the search text and the value of the checkbox are state! Nicely done!

##### Props vs State

There are two types of "model" data in React: props and state. The two are very different:

* [**Props** are like arguments you pass](https://react.dev/learn/passing-props-to-a-component) to a function. They let a parent component pass data to a child component and customize its appearance. For example, a `Form` can pass a `color` prop to a `Button`.
* [**State** is like a component’s memory.](https://react.dev/learn/state-a-components-memory) It lets a component keep track of some information and change it in response to interactions. For example, a `Button` might keep track of `isHovered` state.

Props and state are different, but they work together. A parent component will often keep some information in state (so that it can change it), and *pass it down* to child components as their props. It's okay if the difference still feels fuzzy on the first read. It takes a bit of practice for it to really stick!

### Step 4: Identify where your state should live

After identifying your app’s minimal state data, you need to identify which component is responsible for changing this state, or *owns* the state. Remember: React uses one-way data flow, passing data down the component hierarchy from parent to child component. It may not be immediately clear which component should own what state. This can be challenging if you’re new to this concept, but you can figure it out by following these steps!

For each piece of state in your application:

1. Identify *every* component that renders something based on that state.
2. Find their closest common parent component--a component above them all in the hierarchy.
3. Decide where the state should live:
    1. Often, you can put the state directly into their common parent.
    2. You can also put the state into some component above their common parent.
    3. If you can't find a component where it makes sense to own the state, create a new component solely for holding the state and add it somewhere in the hierarchy above the common parent component.

In the previous step, you found two pieces of state in this application: the search input text, and the value of the checkbox. In this example, they always appear together, so it makes sense to put them into the same place.

Now let's run through our strategy for them:

1. **Identify components that use state:**
    * `ProductTable` needs to filter the product list based on that state (search text and checkbox value).
    * `SearchBar` needs to display that state (search text and checkbox value).
2. **Find their common parent:** The first parent component both components share is `FilterableProductTable`.
3. **Decide where the state lives**: We'll keep the filter text and checked state values in `FilterableProductTable`.

So the state values will live in `FilterableProductTable`.

Add state to the component with the [`useState()` Hook.](https://react.dev/reference/react/useState) Hooks are special functions that let you "hook into" React. Add two state variables at the top of `FilterableProductTable` and specify their initial state:

```js
function FilterableProductTable({ products }) {
  const [filterText, setFilterText] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
```

Then, pass `filterText` and `inStockOnly` to `ProductTable` and `SearchBar` as props:

```js
<div>
  <SearchBar
    filterText={filterText}
    inStockOnly={inStockOnly} />
  <ProductTable
    products={products}
    filterText={filterText}
    inStockOnly={inStockOnly} />
</div>
```

You can start seeing how your application will behave. Edit the `filterText` initial value from `useState('')` to `useState('fruit')` in the sandbox code below. You'll see both the search input text and the table update:

```jsx
import { useState } from 'react';

function FilterableProductTable({ products }) {
  const [filterText, setFilterText] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  return (
    <div>
      <SearchBar
        filterText={filterText}
        inStockOnly={inStockOnly} />
      <ProductTable
        products={products}
        filterText={filterText}
        inStockOnly={inStockOnly} />
    </div>
  );
}

function ProductCategoryRow({ category }) {
  return (
    <tr>
      <th colSpan="2">
        {category}
      </th>
    </tr>
  );
}

function ProductRow({ product }) {
  const name = product.stocked ? product.name :
    <span style={{ color: 'red' }}>
      {product.name}
    </span>;

  return (
    <tr>
      <td>{name}</td>
      <td>{product.price}</td>
    </tr>
  );
}

function ProductTable({ products, filterText, inStockOnly }) {
  const rows = [];
  let lastCategory = null;

  products.forEach((product) => {
    if (
      product.name.toLowerCase().indexOf(
        filterText.toLowerCase()
      ) === -1
    ) {
      return;
    }
    if (inStockOnly && !product.stocked) {
      return;
    }
    if (product.category !== lastCategory) {
      rows.push(
        <ProductCategoryRow
          category={product.category}
          key={product.category} />
      );
    }
    rows.push(
      <ProductRow
        product={product}
        key={product.name} />
    );
    lastCategory = product.category;
  });

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function SearchBar({ filterText, inStockOnly }) {
  return (
    <form>
      <input
        type="text"
        value={filterText}
        placeholder="Search..."/>
      <label>
        <input
          type="checkbox"
          checked={inStockOnly} />
        {' '}
        Only show products in stock
      </label>
    </form>
  );
}

const PRODUCTS = [
  {category: "Fruits", price: "$1", stocked: true, name: "Apple"},
  {category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit"},
  {category: "Fruits", price: "$2", stocked: false, name: "Passionfruit"},
  {category: "Vegetables", price: "$2", stocked: true, name: "Spinach"},
  {category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin"},
  {category: "Vegetables", price: "$1", stocked: true, name: "Peas"}
];

export default function App() {
  return <FilterableProductTable products={PRODUCTS} />;
}
```

```css
body {
  padding: 5px
}
label {
  display: block;
  margin-top: 5px;
  margin-bottom: 5px;
}
th {
  padding-top: 5px;
}
td {
  padding: 2px;
}
```

Notice that editing the form doesn't work yet. There is a console error in the sandbox above explaining why:

You provided a \`value\` prop to a form field without an \`onChange\` handler. This will render a read-only field.

In the sandbox above, `ProductTable` and `SearchBar` read the `filterText` and `inStockOnly` props to render the table, the input, and the checkbox. For example, here is how `SearchBar` populates the input value:

```js
function SearchBar({ filterText, inStockOnly }) {
  return (
    <form>
      <input
        type="text"
        value={filterText}
        placeholder="Search..."/>
```

However, you haven't added any code to respond to the user actions like typing yet. This will be your final step.

### Step 5: Add inverse data flow

Currently your app renders correctly with props and state flowing down the hierarchy. But to change the state according to user input, you will need to support data flowing the other way: the form components deep in the hierarchy need to update the state in `FilterableProductTable`.

React makes this data flow explicit, but it requires a little more typing than two-way data binding. If you try to type or check the box in the example above, you'll see that React ignores your input. This is intentional. By writing `<input value={filterText} />`, you've set the `value` prop of the `input` to always be equal to the `filterText` state passed in from `FilterableProductTable`. Since `filterText` state is never set, the input never changes.

You want to make it so whenever the user changes the form inputs, the state updates to reflect those changes. The state is owned by `FilterableProductTable`, so only it can call `setFilterText` and `setInStockOnly`. To let `SearchBar` update the `FilterableProductTable`'s state, you need to pass these functions down to `SearchBar`:

```js
function FilterableProductTable({ products }) {
  const [filterText, setFilterText] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  return (
    <div>
      <SearchBar
        filterText={filterText}
        inStockOnly={inStockOnly}
        onFilterTextChange={setFilterText}
        onInStockOnlyChange={setInStockOnly} />
```

Inside the `SearchBar`, you will add the `onChange` event handlers and set the parent state from them:

```js
function SearchBar({
  filterText,
  inStockOnly,
  onFilterTextChange,
  onInStockOnlyChange
}) {
  return (
    <form>
      <input
        type="text"
        value={filterText}
        placeholder="Search..."
        onChange={(e) => onFilterTextChange(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => onInStockOnlyChange(e.target.checked)}
```

Now the application fully works!

```jsx
import { useState } from 'react';

function FilterableProductTable({ products }) {
  const [filterText, setFilterText] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  return (
    <div>
      <SearchBar
        filterText={filterText}
        inStockOnly={inStockOnly}
        onFilterTextChange={setFilterText}
        onInStockOnlyChange={setInStockOnly} />
      <ProductTable
        products={products}
        filterText={filterText}
        inStockOnly={inStockOnly} />
    </div>
  );
}

function ProductCategoryRow({ category }) {
  return (
    <tr>
      <th colSpan="2">
        {category}
      </th>
    </tr>
  );
}

function ProductRow({ product }) {
  const name = product.stocked ? product.name :
    <span style={{ color: 'red' }}>
      {product.name}
    </span>;

  return (
    <tr>
      <td>{name}</td>
      <td>{product.price}</td>
    </tr>
  );
}

function ProductTable({ products, filterText, inStockOnly }) {
  const rows = [];
  let lastCategory = null;

  products.forEach((product) => {
    if (
      product.name.toLowerCase().indexOf(
        filterText.toLowerCase()
      ) === -1
    ) {
      return;
    }
    if (inStockOnly && !product.stocked) {
      return;
    }
    if (product.category !== lastCategory) {
      rows.push(
        <ProductCategoryRow
          category={product.category}
          key={product.category} />
      );
    }
    rows.push(
      <ProductRow
        product={product}
        key={product.name} />
    );
    lastCategory = product.category;
  });

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function SearchBar({
  filterText,
  inStockOnly,
  onFilterTextChange,
  onInStockOnlyChange
}) {
  return (
    <form>
      <input
        type="text"
        value={filterText} placeholder="Search..."
        onChange={(e) => onFilterTextChange(e.target.value)} />
      <label>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => onInStockOnlyChange(e.target.checked)} />
        {' '}
        Only show products in stock
      </label>
    </form>
  );
}

const PRODUCTS = [
  {category: "Fruits", price: "$1", stocked: true, name: "Apple"},
  {category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit"},
  {category: "Fruits", price: "$2", stocked: false, name: "Passionfruit"},
  {category: "Vegetables", price: "$2", stocked: true, name: "Spinach"},
  {category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin"},
  {category: "Vegetables", price: "$1", stocked: true, name: "Peas"}
];

export default function App() {
  return <FilterableProductTable products={PRODUCTS} />;
}
```

```css
body {
  padding: 5px
}
label {
  display: block;
  margin-top: 5px;
  margin-bottom: 5px;
}
th {
  padding: 4px;
}
td {
  padding: 2px;
}
```

You can learn all about handling events and updating state in the [Adding Interactivity](https://react.dev/learn/adding-interactivity) section.

### Where to go from here

This was a very brief introduction to how to think about building components and applications with React. You can [start a React project](https://react.dev/learn/installation) right now or [dive deeper on all the syntax](https://react.dev/learn/describing-the-ui) used in this tutorial.

## Your First Component

> **Source:** [Your First Component](https://react.dev/learn/your-first-component) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

*Components* are one of the core concepts of React. They are the foundation upon which you build user interfaces (UI), which makes them the perfect place to start your React journey!

* What a component is
* What role components play in a React application
* How to write your first React component

### Components: UI building blocks

On the Web, HTML lets us create rich structured documents with its built-in set of tags like `<h1>` and `<li>`:

```html
<article>
  <h1>My First Component</h1>
  <ol>
    <li>Components: UI Building Blocks</li>
    <li>Defining a Component</li>
    <li>Using a Component</li>
  </ol>
</article>
```

This markup represents this article `<article>`, its heading `<h1>`, and an (abbreviated) table of contents as an ordered list `<ol>`. Markup like this, combined with CSS for style, and JavaScript for interactivity, lies behind every sidebar, avatar, modal, dropdown—every piece of UI you see on the Web.

React lets you combine your markup, CSS, and JavaScript into custom "components", **reusable UI elements for your app.** The table of contents code you saw above could be turned into a `` component you could render on every page. Under the hood, it still uses the same HTML tags like `<article>`, `<h1>`, etc.

Just like with HTML tags, you can compose, order and nest components to design whole pages. For example, the documentation page you're reading is made out of React components:

```js
<PageLayout>
  <NavigationHeader>
    <SearchBar />
    <Link to="/docs">Docs</Link>
  </NavigationHeader>
  <Sidebar />
  <PageContent>
    <TableOfContents />
    <DocumentationText />
  </PageContent>
</PageLayout>
```

As your project grows, you will notice that many of your designs can be composed by reusing components you already wrote, speeding up your development. Our table of contents above could be added to any screen with ``! You can even jumpstart your project with the thousands of components shared by the React open source community like [Chakra UI](https://chakra-ui.com/) and [Material UI.](https://material-ui.com/)

### Defining a component

Traditionally when creating web pages, web developers marked up their content and then added interaction by sprinkling on some JavaScript. This worked great when interaction was a nice-to-have on the web. Now it is expected for many sites and all apps. React puts interactivity first while still using the same technology: **a React component is a JavaScript function that you can _sprinkle with markup_.** Here's what that looks like (you can edit the example below):

```js
export default function Profile() {
  return (
    <img
      src="https://react.dev/images/docs/scientists/MK3eW3Am.jpg"
      alt="Katherine Johnson"
    />
  )
}
```

```css
img { height: 200px; }
```

And here's how to build a component:

#### Step 1: Export the component

The `export default` prefix is a [standard JavaScript syntax](https://developer.mozilla.org/docs/web/javascript/reference/statements/export) (not specific to React). It lets you mark the main function in a file so that you can later import it from other files. (More on importing in [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components)!)

#### Step 2: Define the function

With `function Profile() { }` you define a JavaScript function with the name `Profile`.

React components are regular JavaScript functions, but **their names must start with a capital letter** or they won't work!

#### Step 3: Add markup

The component returns an `<img />` tag with `src` and `alt` attributes. `<img />` is written like HTML, but it is actually JavaScript under the hood! This syntax is called [JSX](https://react.dev/learn/writing-markup-with-jsx), and it lets you embed markup inside JavaScript.

Return statements can be written all on one line, as in this component:

```js
return <img src="https://react.dev/images/docs/scientists/MK3eW3As.jpg" alt="Katherine Johnson" />;
```

But if your markup isn't all on the same line as the `return` keyword, you must wrap it in a pair of parentheses:

```js
return (
  <div>
    <img src="https://react.dev/images/docs/scientists/MK3eW3As.jpg" alt="Katherine Johnson" />
  </div>
);
```

Without parentheses, any code on the lines after `return` [will be ignored](https://stackoverflow.com/questions/2846283/what-are-the-rules-for-javascripts-automatic-semicolon-insertion-asi)!

### Using a component

Now that you've defined your `Profile` component, you can nest it inside other components. For example, you can export a `Gallery` component that uses multiple `Profile` components:

```js
function Profile() {
  return (
    <img
      src="https://react.dev/images/docs/scientists/MK3eW3As.jpg"
      alt="Katherine Johnson"
    />
  );
}

export default function Gallery() {
  return (
    <section>
      <h1>Amazing scientists</h1>
      <Profile />
      <Profile />
      <Profile />
    </section>
  );
}
```

```css
img { margin: 0 10px 10px 0; height: 90px; }
```

#### What the browser sees

Notice the difference in casing:

* `<section>` is lowercase, so React knows we refer to an HTML tag.
* `` starts with a capital `P`, so React knows that we want to use our component called `Profile`.

And `Profile` contains even more HTML: `<img />`. In the end, this is what the browser sees:

```html
<section>
  <h1>Amazing scientists</h1>
  <img src="https://react.dev/images/docs/scientists/MK3eW3As.jpg" alt="Katherine Johnson" />
  <img src="https://react.dev/images/docs/scientists/MK3eW3As.jpg" alt="Katherine Johnson" />
  <img src="https://react.dev/images/docs/scientists/MK3eW3As.jpg" alt="Katherine Johnson" />
</section>
```

#### Nesting and organizing components

Components are regular JavaScript functions, so you can keep multiple components in the same file. This is convenient when components are relatively small or tightly related to each other. If this file gets crowded, you can always move `Profile` to a separate file. You will learn how to do this shortly on the [page about imports.](https://react.dev/learn/importing-and-exporting-components)

Because the `Profile` components are rendered inside `Gallery`—even several times!—we can say that `Gallery` is a **parent component,** rendering each `Profile` as a "child". This is part of the magic of React: you can define a component once, and then use it in as many places and as many times as you like.

Components can render other components, but **you must never nest their definitions:**

```js
export default function Gallery() {
  // 🔴 Never define a component inside another component!
  function Profile() {
    // ...
  }
  // ...
}
```

The snippet above is [very slow and causes bugs.](https://react.dev/learn/preserving-and-resetting-state#different-components-at-the-same-position-reset-state) Instead, define every component at the top level:

```js
export default function Gallery() {
  // ...
}

// ✅ Declare components at the top level
function Profile() {
  // ...
}
```

When a child component needs some data from a parent, [pass it by props](https://react.dev/learn/passing-props-to-a-component) instead of nesting definitions.

##### Components all the way down

Your React application begins at a "root" component. Usually, it is created automatically when you start a new project. For example, if you use [CodeSandbox](https://codesandbox.io/) or if you use the framework [Next.js](https://nextjs.org/), the root component is defined in `pages/index.js`. In these examples, you've been exporting root components.

Most React apps use components all the way down. This means that you won't only use components for reusable pieces like buttons, but also for larger pieces like sidebars, lists, and ultimately, complete pages! Components are a handy way to organize UI code and markup, even if some of them are only used once.

[React-based frameworks](https://react.dev/learn/creating-a-react-app) take this a step further. Instead of using an empty HTML file and letting React "take over" managing the page with JavaScript, they *also* generate the HTML automatically from your React components. This allows your app to show some content before the JavaScript code loads.

Still, many websites only use React to [add interactivity to existing HTML pages.](https://react.dev/learn/add-react-to-an-existing-project#using-react-for-a-part-of-your-existing-page) They have many root components instead of a single one for the entire page. You can use as much—or as little—React as you need.

You've just gotten your first taste of React! Let's recap some key points.

* React lets you create components, **reusable UI elements for your app.**
* In a React app, every piece of UI is a component.
* React components are regular JavaScript functions except:

  1. Their names always begin with a capital letter.
  2. They return JSX markup.

## Importing and Exporting Components

> **Source:** [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

The magic of components lies in their reusability: you can create components that are composed of other components. But as you nest more and more components, it often makes sense to start splitting them into different files. This lets you keep your files easy to scan and reuse components in more places.

* What a root component file is
* How to import and export a component
* When to use default and named imports and exports
* How to import and export multiple components from one file
* How to split components into multiple files

### The root component file

In [Your First Component](https://react.dev/learn/your-first-component), you made a `Profile` component and a `Gallery` component that renders it:

```js
function Profile() {
  return (
    <img
      src="https://react.dev/images/docs/scientists/MK3eW3As.jpg"
      alt="Katherine Johnson"
    />
  );
}

export default function Gallery() {
  return (
    <section>
      <h1>Amazing scientists</h1>
      <Profile />
      <Profile />
      <Profile />
    </section>
  );
}
```

```css
img { margin: 0 10px 10px 0; height: 90px; }
```

These currently live in a **root component file,** named `App.js` in this example. Depending on your setup, your root component could be in another file, though. If you use a framework with file-based routing, such as Next.js, your root component will be different for every page.

### Exporting and importing a component

What if you want to change the landing screen in the future and put a list of science books there? Or place all the profiles somewhere else? It makes sense to move `Gallery` and `Profile` out of the root component file. This will make them more modular and reusable in other files. You can move a component in three steps:

1. **Make** a new JS file to put the components in.
2. **Export** your function component from that file (using either [default](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export) or [named](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/export#using_named_exports) exports).
3. **Import** it in the file where you’ll use the component (using the corresponding technique for importing [default](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/import#importing_defaults) or [named](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/import#import_a_single_export_from_a_module) exports).

Here both `Profile` and `Gallery` have been moved out of `App.js` into a new file called `Gallery.js`. Now you can change `App.js` to import `Gallery` from `Gallery.js`:

```js
import Gallery from './Gallery.js';

export default function App() {
  return (
    <Gallery />
  );
}
```

```js
function Profile() {
  return (
    <img
      src="https://react.dev/images/docs/scientists/QIrZWGIs.jpg"
      alt="Alan L. Hart"
    />
  );
}

export default function Gallery() {
  return (
    <section>
      <h1>Amazing scientists</h1>
      <Profile />
      <Profile />
      <Profile />
    </section>
  );
}
```

```css
img { margin: 0 10px 10px 0; height: 90px; }
```

Notice how this example is broken down into two component files now:

1. `Gallery.js`:
     - Defines the `Profile` component which is only used within the same file and is not exported.
     - Exports the `Gallery` component as a **default export.**
2. `App.js`:
     - Imports `Gallery` as a **default import** from `Gallery.js`.
     - Exports the root `App` component as a **default export.**

You may encounter files that leave off the `.js` file extension like so:

```js
import Gallery from './Gallery';
```

Either `'./Gallery.js'` or `'./Gallery'` will work with React, though the former is closer to how [native ES Modules](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules) work.

##### Default vs named exports

There are two primary ways to export values with JavaScript: default exports and named exports. So far, our examples have only used default exports. But you can use one or both of them in the same file. **A file can have no more than one _default_ export, but it can have as many _named_ exports as you like.**

![Default and named exports](https://react.dev/images/docs/illustrations/i_import-export.svg)

How you export your component dictates how you must import it. You will get an error if you try to import a default export the same way you would a named export! This chart can help you keep track:

| Syntax           | Export statement                           | Import statement                          |
| -----------      | -----------                                | -----------                               |
| Default  | `export default function Button() {}` | `import Button from './Button.js';`     |
| Named    | `export function Button() {}`         | `import { Button } from './Button.js';` |

When you write a _default_ import, you can put any name you want after `import`. For example, you could write `import Banana from './Button.js'` instead and it would still provide you with the same default export. In contrast, with named imports, the name has to match on both sides. That's why they are called _named_ imports!

**People often use default exports if the file exports only one component, and use named exports if it exports multiple components and values.** Regardless of which coding style you prefer, always give meaningful names to your component functions and the files that contain them. Components without names, like `export default () => {}`, are discouraged because they make debugging harder.

### Exporting and importing multiple components from the same file

What if you want to show just one `Profile` instead of a gallery? You can export the `Profile` component, too. But `Gallery.js` already has a *default* export, and you can't have _two_ default exports. You could create a new file with a default export, or you could add a *named* export for `Profile`. **A file can only have one default export, but it can have numerous named exports!**

To reduce the potential confusion between default and named exports, some teams choose to only stick to one style (default or named), or avoid mixing them in a single file. Do what works best for you!

First, **export** `Profile` from `Gallery.js` using a named export (no `default` keyword):

```js
export function Profile() {
  // ...
}
```

Then, **import** `Profile` from `Gallery.js` to `App.js` using a named import (with the curly braces):

```js
import { Profile } from './Gallery.js';
```

Finally, **render** `` from the `App` component:

```js
export default function App() {
  return <Profile />;
}
```

Now `Gallery.js` contains two exports: a default `Gallery` export, and a named `Profile` export. `App.js` imports both of them. Try editing `` to `` and back in this example:

```js
import Gallery from './Gallery.js';
import { Profile } from './Gallery.js';

export default function App() {
  return (
    <Profile />
  );
}
```

```js
export function Profile() {
  return (
    <img
      src="https://react.dev/images/docs/scientists/QIrZWGIs.jpg"
      alt="Alan L. Hart"
    />
  );
}

export default function Gallery() {
  return (
    <section>
      <h1>Amazing scientists</h1>
      <Profile />
      <Profile />
      <Profile />
    </section>
  );
}
```

```css
img { margin: 0 10px 10px 0; height: 90px; }
```

Now you're using a mix of default and named exports:

* `Gallery.js`:
  - Exports the `Profile` component as a **named export called `Profile`.**
  - Exports the `Gallery` component as a **default export.**
* `App.js`:
  - Imports `Profile` as a **named import called `Profile`** from `Gallery.js`.
  - Imports `Gallery` as a **default import** from `Gallery.js`.
  - Exports the root `App` component as a **default export.**

On this page you learned:

* What a root component file is
* How to import and export a component
* When and how to use default and named imports and exports
* How to export multiple components from the same file

## Writing Markup with JSX

> **Source:** [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

*JSX* is a syntax extension for JavaScript that lets you write HTML-like markup inside a JavaScript file. Although there are other ways to write components, most React developers prefer the conciseness of JSX, and most codebases use it.

* Why React mixes markup with rendering logic
* How JSX is different from HTML
* How to display information with JSX

### JSX: Putting markup into JavaScript

The Web has been built on HTML, CSS, and JavaScript. For many years, web developers kept content in HTML, design in CSS, and logic in JavaScript—often in separate files! Content was marked up inside HTML while the page's logic lived separately in JavaScript:

HTML

JavaScript

But as the Web became more interactive, logic increasingly determined content. JavaScript was in charge of the HTML! This is why **in React, rendering logic and markup live together in the same place—components.**

`Sidebar.js` React component

`Form.js` React component

Keeping a button's rendering logic and markup together ensures that they stay in sync with each other on every edit. Conversely, details that are unrelated, such as the button's markup and a sidebar's markup, are isolated from each other, making it safer to change either of them on their own.

Each React component is a JavaScript function that may contain some markup that React renders into the browser. React components use a syntax extension called JSX to represent that markup. JSX looks a lot like HTML, but it is a bit stricter and can display dynamic information. The best way to understand this is to convert some HTML markup to JSX markup.

JSX and React are two separate things. They're often used together, but you *can* [use them independently](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#whats-a-jsx-transform) of each other. JSX is a syntax extension, while React is a JavaScript library.

### Converting HTML to JSX

Suppose that you have some (perfectly valid) HTML:

```html
<h1>Hedy Lamarr's Todos</h1>
<img
  src="https://react.dev/images/docs/scientists/yXOvdOSs.jpg"
  alt="Hedy Lamarr"
  class="photo"
>
<ul>
    <li>Invent new traffic lights
    <li>Rehearse a movie scene
    <li>Improve the spectrum technology
</ul>
```

And you want to put it into your component:

```js
export default function TodoList() {
  return (
    // ???
  )
}
```

If you copy and paste it as is, it will not work:

```js
export default function TodoList() {
  return (
    // This doesn't quite work!
    <h1>Hedy Lamarr's Todos</h1>
    <img
      src="https://react.dev/images/docs/scientists/yXOvdOSs.jpg"
      alt="Hedy Lamarr"
      class="photo"
    >
    <ul>
      <li>Invent new traffic lights
      <li>Rehearse a movie scene
      <li>Improve the spectrum technology
    </ul>
  );
}
```

```css
img { height: 90px }
```

This is because JSX is stricter and has a few more rules than HTML! If you read the error messages above, they'll guide you to fix the markup, or you can follow the guide below.

Most of the time, React's on-screen error messages will help you find where the problem is. Give them a read if you get stuck!

### The Rules of JSX

#### 1. Return a single root element

To return multiple elements from a component, **wrap them with a single parent tag.**

For example, you can use a `<div>`:

```js
<div>
  <h1>Hedy Lamarr's Todos</h1>
  <img
    src="https://react.dev/images/docs/scientists/yXOvdOSs.jpg"
    alt="Hedy Lamarr"
    class="photo"
  >
  <ul>
    ...
  </ul>
</div>
```

If you don't want to add an extra `<div>` to your markup, you can write `<>` and `</>` instead:

```js
<>
  <h1>Hedy Lamarr's Todos</h1>
  <img
    src="https://react.dev/images/docs/scientists/yXOvdOSs.jpg"
    alt="Hedy Lamarr"
    class="photo"
  >
  <ul>
    ...
  </ul>
</>
```

This empty tag is called a *[Fragment.](https://react.dev/reference/react/Fragment)* Fragments let you group things without leaving any trace in the browser HTML tree.

##### Why do multiple JSX tags need to be wrapped?

JSX looks like HTML, but under the hood it is transformed into plain JavaScript objects. You can't return two objects from a function without wrapping them into an array. This explains why you also can't return two JSX tags without wrapping them into another tag or a Fragment.

#### 2. Close all the tags

JSX requires tags to be explicitly closed: self-closing tags like `<img>` must become `<img />`, and wrapping tags like `<li>oranges` must be written as `<li>oranges</li>`.

This is how Hedy Lamarr's image and list items look closed:

```js
<>
  <img
    src="https://react.dev/images/docs/scientists/yXOvdOSs.jpg"
    alt="Hedy Lamarr"
    class="photo"
   />
  <ul>
    <li>Invent new traffic lights</li>
    <li>Rehearse a movie scene</li>
    <li>Improve the spectrum technology</li>
  </ul>
</>
```

#### 3. camelCase <s>all</s> most of the things!

JSX turns into JavaScript and attributes written in JSX become keys of JavaScript objects. In your own components, you will often want to read those attributes into variables. But JavaScript has limitations on variable names. For example, their names can't contain dashes or be reserved words like `class`.

This is why, in React, many HTML and SVG attributes are written in camelCase. For example, instead of `stroke-width` you use `strokeWidth`. Since `class` is a reserved word, in React you write `className` instead, named after the [corresponding DOM property](https://developer.mozilla.org/en-US/docs/Web/API/Element/className):

```js
<img
  src="https://react.dev/images/docs/scientists/yXOvdOSs.jpg"
  alt="Hedy Lamarr"
  className="photo"
/>
```

You can [find all these attributes in the list of DOM component props.](https://react.dev/reference/react-dom/components/common) If you get one wrong, don't worry—React will print a message with a possible correction to the [browser console.](https://developer.mozilla.org/docs/Tools/Browser_Console)

For historical reasons, [`aria-*`](https://developer.mozilla.org/docs/Web/Accessibility/ARIA) and [`data-*`](https://developer.mozilla.org/docs/Learn/HTML/Howto/Use_data_attributes) attributes are written as in HTML with dashes.

#### Pro-tip: Use a JSX Converter

Converting all these attributes in existing markup can be tedious! We recommend using a [converter](https://transform.tools/html-to-jsx) to translate your existing HTML and SVG to JSX. Converters are very useful in practice, but it's still worth understanding what is going on so that you can comfortably write JSX on your own.

Here is your final result:

```js
export default function TodoList() {
  return (
    <>
      <h1>Hedy Lamarr's Todos</h1>
      <img
        src="https://react.dev/images/docs/scientists/yXOvdOSs.jpg"
        alt="Hedy Lamarr"
        className="photo"
      />
      <ul>
        <li>Invent new traffic lights</li>
        <li>Rehearse a movie scene</li>
        <li>Improve the spectrum technology</li>
      </ul>
    </>
  );
}
```

```css
img { height: 90px }
```

Now you know why JSX exists and how to use it in components:

* React components group rendering logic together with markup because they are related.
* JSX is similar to HTML, with a few differences. You can use a [converter](https://transform.tools/html-to-jsx) if you need to.
* Error messages will often point you in the right direction to fixing your markup.

## JavaScript in JSX with Curly Braces

> **Source:** [JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

JSX lets you write HTML-like markup inside a JavaScript file, keeping rendering logic and content in the same place. Sometimes you will want to add a little JavaScript logic or reference a dynamic property inside that markup. In this situation, you can use curly braces in your JSX to open a window to JavaScript.

* How to pass strings with quotes
* How to reference a JavaScript variable inside JSX with curly braces
* How to call a JavaScript function inside JSX with curly braces
* How to use a JavaScript object inside JSX with curly braces

### Passing strings with quotes

When you want to pass a string attribute to JSX, you put it in single or double quotes:

```js
export default function Avatar() {
  return (
    <img
      className="avatar"
      src="https://react.dev/images/docs/scientists/7vQD0fPs.jpg"
      alt="Gregorio Y. Zara"
    />
  );
}
```

```css
.avatar { border-radius: 50%; height: 90px; }
```

Here, `"https://react.dev/images/docs/scientists/7vQD0fPs.jpg"` and `"Gregorio Y. Zara"` are being passed as strings.

But what if you want to dynamically specify the `src` or `alt` text? You could **use a value from JavaScript by replacing `"` and `"` with `{` and `}`**:

```js
export default function Avatar() {
  const avatar = 'https://react.dev/images/docs/scientists/7vQD0fPs.jpg';
  const description = 'Gregorio Y. Zara';
  return (
    <img
      className="avatar"
      src={avatar}
      alt={description}
    />
  );
}
```

```css
.avatar { border-radius: 50%; height: 90px; }
```

Notice the difference between `className="avatar"`, which specifies an `"avatar"` CSS class name that makes the image round, and `src={avatar}` that reads the value of the JavaScript variable called `avatar`. That's because curly braces let you work with JavaScript right there in your markup!

### Using curly braces: A window into the JavaScript world

JSX is a special way of writing JavaScript. That means it’s possible to use JavaScript inside it—with curly braces `{ }`. The example below first declares a name for the scientist, `name`, then embeds it with curly braces inside the `<h1>`:

```js
export default function TodoList() {
  const name = 'Gregorio Y. Zara';
  return (
    <h1>{name}'s To Do List</h1>
  );
}
```

Try changing the `name`'s value from `'Gregorio Y. Zara'` to `'Hedy Lamarr'`. See how the list title changes?

Any JavaScript expression will work between curly braces, including function calls like `formatDate()`:

```js
const today = new Date();

function formatDate(date) {
  return new Intl.DateTimeFormat(
    'en-US',
    { weekday: 'long' }
  ).format(date);
}

export default function TodoList() {
  return (
    <h1>To Do List for {formatDate(today)}</h1>
  );
}
```

#### Where to use curly braces

You can only use curly braces in two ways inside JSX:

1. **As text** directly inside a JSX tag: `<h1>{name}'s To Do List</h1>` works, but `<{tag}>Gregorio Y. Zara's To Do List</{tag}>`  will not.
2. **As attributes** immediately following the `=` sign: `src={avatar}` will read the `avatar` variable, but `src="{avatar}"` will pass the string `"{avatar}"`.

### Using "double curlies": CSS and other objects in JSX

In addition to strings, numbers, and other JavaScript expressions, you can even pass objects in JSX. Objects are also denoted with curly braces, like `{ name: "Hedy Lamarr", inventions: 5 }`. Therefore, to pass a JS object in JSX, you must wrap the object in another pair of curly braces: `person={{ name: "Hedy Lamarr", inventions: 5 }}`.

You may see this with inline CSS styles in JSX. React does not require you to use inline styles (CSS classes work great for most cases). But when you need an inline style, you pass an object to the `style` attribute:

```js
export default function TodoList() {
  return (
    <ul style={{
      backgroundColor: 'black',
      color: 'pink'
    }}>
      <li>Improve the videophone</li>
      <li>Prepare aeronautics lectures</li>
      <li>Work on the alcohol-fuelled engine</li>
    </ul>
  );
}
```

```css
body { padding: 0; margin: 0 }
ul { padding: 20px 20px 20px 40px; margin: 0; }
```

Try changing the values of `backgroundColor` and `color`.

You can really see the JavaScript object inside the curly braces when you write it like this:

```js
<ul style={
  {
    backgroundColor: 'black',
    color: 'pink'
  }
}>
```

The next time you see `{{` and `}}` in JSX, know that it's nothing more than an object inside the JSX curlies!

Inline `style` properties are written in camelCase. For example, HTML `<ul style="background-color: black">` would be written as `<ul style={{ backgroundColor: 'black' }}>`  in your component.

### More fun with JavaScript objects and curly braces

You can move several expressions into one object, and reference them in your JSX inside curly braces:

```js
const person = {
  name: 'Gregorio Y. Zara',
  theme: {
    backgroundColor: 'black',
    color: 'pink'
  }
};

export default function TodoList() {
  return (
    <div style={person.theme}>
      <h1>{person.name}'s Todos</h1>
      <img
        className="avatar"
        src="https://react.dev/images/docs/scientists/7vQD0fPs.jpg"
        alt="Gregorio Y. Zara"
      />
      <ul>
        <li>Improve the videophone</li>
        <li>Prepare aeronautics lectures</li>
        <li>Work on the alcohol-fuelled engine</li>
      </ul>
    </div>
  );
}
```

```css
body { padding: 0; margin: 0 }
body > div > div { padding: 20px; }
.avatar { border-radius: 50%; height: 90px; }
```

In this example, the `person` JavaScript object contains a `name` string and a `theme` object:

```js
const person = {
  name: 'Gregorio Y. Zara',
  theme: {
    backgroundColor: 'black',
    color: 'pink'
  }
};
```

The component can use these values from `person` like so:

```js
<div style={person.theme}>
  <h1>{person.name}'s Todos</h1>
```

JSX is very minimal as a templating language because it lets you organize data and logic using JavaScript.

Now you know almost everything about JSX:

* JSX attributes inside quotes are passed as strings.
* Curly braces let you bring JavaScript logic and variables into your markup.
* They work inside the JSX tag content or immediately after `=` in attributes.
* `{{` and `}}` is not special syntax: it's a JavaScript object tucked inside JSX curly braces.

## Passing Props to a Component

> **Source:** [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

React components use *props* to communicate with each other. Every parent component can pass some information to its child components by giving them props. Props might remind you of HTML attributes, but you can pass any JavaScript value through them, including objects, arrays, and functions.

* How to pass props to a component
* How to read props from a component
* How to specify default values for props
* How to pass some JSX to a component
* How props change over time

### Familiar props

Props are the information that you pass to a JSX tag. For example, `className`, `src`, `alt`, `width`, and `height` are some of the props you can pass to an `<img>`:

```js
function Avatar() {
  return (
    <img
      className="avatar"
      src="https://react.dev/images/docs/scientists/1bX5QH6.jpg"
      alt="Lin Lanying"
      width={100}
      height={100}
    />
  );
}

export default function Profile() {
  return (
    <Avatar />
  );
}
```

```css
body { min-height: 120px; }
.avatar { margin: 20px; border-radius: 50%; }
```

The props you can pass to an `<img>` tag are predefined (ReactDOM conforms to [the HTML standard](https://www.w3.org/TR/html52/semantics-embedded-content.html#the-img-element)). But you can pass any props to *your own* components, such as ``, to customize them. Here's how!

### Passing props to a component

In this code, the `Profile` component isn't passing any props to its child component, `Avatar`:

```js
export default function Profile() {
  return (
    <Avatar />
  );
}
```

You can give `Avatar` some props in two steps.

#### Step 1: Pass props to the child component

First, pass some props to `Avatar`. For example, let's pass two props: `person` (an object), and `size` (a number):

```js
export default function Profile() {
  return (
    <Avatar
      person={{ name: 'Lin Lanying', imageId: '1bX5QH6' }}
      size={100}
    />
  );
}
```

If double curly braces after `person=` confuse you, recall [they're merely an object](https://react.dev/learn/javascript-in-jsx-with-curly-braces#using-double-curlies-css-and-other-objects-in-jsx) inside the JSX curlies.

Now you can read these props inside the `Avatar` component.

#### Step 2: Read props inside the child component

You can read these props by listing their names `person, size` separated by the commas inside `({` and `})` directly after `function Avatar`. This lets you use them inside the `Avatar` code, like you would with a variable.

```js
function Avatar({ person, size }) {
  // person and size are available here
}
```

Add some logic to `Avatar` that uses the `person` and `size` props for rendering, and you're done.

Now you can configure `Avatar` to render in many different ways with different props. Try tweaking the values!

```js
import { getImageUrl } from './utils.js';

function Avatar({ person, size }) {
  return (
    <img
      className="avatar"
      src={getImageUrl(person)}
      alt={person.name}
      width={size}
      height={size}
    />
  );
}

export default function Profile() {
  return (
    <div>
      <Avatar
        size={100}
        person={{
          name: 'Katsuko Saruhashi',
          imageId: 'YfeOqp2'
        }}
      />
      <Avatar
        size={80}
        person={{
          name: 'Aklilu Lemma',
          imageId: 'OKS67lh'
        }}
      />
      <Avatar
        size={50}
        person={{
          name: 'Lin Lanying',
          imageId: '1bX5QH6'
        }}
      />
    </div>
  );
}
```

```js
export function getImageUrl(person, size = 's') {
  return (
    'https://react.dev/images/docs/scientists/' +
    person.imageId +
    size +
    '.jpg'
  );
}
```

```css
body { min-height: 120px; }
.avatar { margin: 10px; border-radius: 50%; }
```

Props let you think about parent and child components independently. For example, you can change the `person` or the `size` props inside `Profile` without having to think about how `Avatar` uses them. Similarly, you can change how the `Avatar` uses these props, without looking at the `Profile`.

You can think of props like "knobs" that you can adjust. They serve the same role as arguments serve for functions—in fact, props _are_ the only argument to your component! React component functions accept a single argument, a `props` object:

```js
function Avatar(props) {
  let person = props.person;
  let size = props.size;
  // ...
}
```

Usually you don't need the whole `props` object itself, so you destructure it into individual props.

**Don't miss the pair of `{` and `}` curlies** inside of `(` and `)` when declaring props:

```js
function Avatar({ person, size }) {
  // ...
}
```

This syntax is called ["destructuring"](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Unpacking_fields_from_objects_passed_as_a_function_parameter) and is equivalent to reading properties from a function parameter:

```js
function Avatar(props) {
  let person = props.person;
  let size = props.size;
  // ...
}
```

### Specifying a default value for a prop

If you want to give a prop a default value to fall back on when no value is specified, you can do it with the destructuring by putting `=` and the default value right after the parameter:

```js
function Avatar({ person, size = 100 }) {
  // ...
}
```

Now, if `` is rendered with no `size` prop, the `size` will be set to `100`.

The default value is only used if the `size` prop is missing or if you pass `size={undefined}`. But if you pass `size={null}` or `size={0}`, the default value will **not** be used.

### Forwarding props with the JSX spread syntax

Sometimes, passing props gets very repetitive:

```js
function Profile({ person, size, isSepia, thickBorder }) {
  return (
    <div className="card">
      <Avatar
        person={person}
        size={size}
        isSepia={isSepia}
        thickBorder={thickBorder}
      />
    </div>
  );
}
```

There's nothing wrong with repetitive code—it can be more legible. But at times you may value conciseness. Some components forward all of their props to their children, like how this `Profile` does with `Avatar`. Because they don't use any of their props directly, it can make sense to use a more concise "spread" syntax:

```js
function Profile(props) {
  return (
    <div className="card">
      <Avatar {...props} />
    </div>
  );
}
```

This forwards all of `Profile`'s props to the `Avatar` without listing each of their names.

**Use spread syntax with restraint.** If you're using it in every other component, something is wrong. Often, it indicates that you should split your components and pass children as JSX. More on that next!

### Passing JSX as children

It is common to nest built-in browser tags:

```js
<div>
  <img />
</div>
```

Sometimes you'll want to nest your own components the same way:

```js
<Card>
  <Avatar />
</Card>
```

When you nest content inside a JSX tag, the parent component will receive that content in a prop called `children`. For example, the `Card` component below will receive a `children` prop set to `` and render it in a wrapper div:

```js
import Avatar from './Avatar.js';

function Card({ children }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}

export default function Profile() {
  return (
    <Card>
      <Avatar
        size={100}
        person={{
          name: 'Katsuko Saruhashi',
          imageId: 'YfeOqp2'
        }}
      />
    </Card>
  );
}
```

```js
import { getImageUrl } from './utils.js';

export default function Avatar({ person, size }) {
  return (
    <img
      className="avatar"
      src={getImageUrl(person)}
      alt={person.name}
      width={size}
      height={size}
    />
  );
}
```

```js
export function getImageUrl(person, size = 's') {
  return (
    'https://react.dev/images/docs/scientists/' +
    person.imageId +
    size +
    '.jpg'
  );
}
```

```css
.card {
  width: fit-content;
  margin: 5px;
  padding: 5px;
  font-size: 20px;
  text-align: center;
  border: 1px solid #aaa;
  border-radius: 20px;
  background: #fff;
}
.avatar {
  margin: 20px;
  border-radius: 50%;
}
```

Try replacing the `` inside `` with some text to see how the `Card` component can wrap any nested content. It doesn't need to "know" what's being rendered inside of it. You will see this flexible pattern in many places.

You can think of a component with a `children` prop as having a "hole" that can be "filled in" by its parent components with arbitrary JSX. You will often use the `children` prop for visual wrappers: panels, grids, etc.

### How props change over time

The `Clock` component below receives two props from its parent component: `color` and `time`. (The parent component's code is omitted because it uses [state](https://react.dev/learn/state-a-components-memory), which we won't dive into just yet.)

Try changing the color in the select box below:

```js
export default function Clock({ color, time }) {
  return (
    <h1 style={{ color: color }}>
      {time}
    </h1>
  );
}
```

```js
import { useState, useEffect } from 'react';
import Clock from './Clock.js';

function useTime() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function App() {
  const time = useTime();
  const [color, setColor] = useState('lightcoral');
  return (
    <div>
      <p>
        Pick a color:{' '}
        <select value={color} onChange={e => setColor(e.target.value)}>
          <option value="lightcoral">lightcoral</option>
          <option value="midnightblue">midnightblue</option>
          <option value="rebeccapurple">rebeccapurple</option>
        </select>
      </p>
      <Clock color={color} time={time.toLocaleTimeString()} />
    </div>
  );
}
```

This example illustrates that **a component may receive different props over time.** Props are not always static! Here, the `time` prop changes every second, and the `color` prop changes when you select another color. Props reflect a component's data at any point in time, rather than only in the beginning.

However, props are [immutable](https://en.wikipedia.org/wiki/Immutable_object)—a term from computer science meaning "unchangeable". When a component needs to change its props (for example, in response to a user interaction or new data), it will have to "ask" its parent component to pass it _different props_—a new object! Its old props will then be cast aside, and eventually the JavaScript engine will reclaim the memory taken by them.

**Don't try to "change props".** When you need to respond to the user input (like changing the selected color), you will need to "set state", which you can learn about in [State: A Component's Memory.](https://react.dev/learn/state-a-components-memory)

* To pass props, add them to the JSX, just like you would with HTML attributes.
* To read props, use the `function Avatar({ person, size })` destructuring syntax.
* You can specify a default value like `size = 100`, which is used for missing and `undefined` props.
* You can forward all props with `` JSX spread syntax, but don't overuse it!
* Nested JSX like `` will appear as `Card` component's `children` prop.
* Props are read-only snapshots in time: every render receives a new version of props.
* You can't change props. When you need interactivity, you'll need to set state.

## Conditional Rendering

> **Source:** [Conditional Rendering](https://react.dev/learn/conditional-rendering) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

Your components will often need to display different things depending on different conditions. In React, you can conditionally render JSX using JavaScript syntax like `if` statements, `&&`, and `? :` operators.

* How to return different JSX depending on a condition
* How to conditionally include or exclude a piece of JSX
* Common conditional syntax shortcuts you’ll encounter in React codebases

### Conditionally returning JSX

Let’s say you have a `PackingList` component rendering several `Item`s, which can be marked as packed or not:

```js
function Item({ name, isPacked }) {
  return <li className="item">{name}</li>;
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item
          isPacked={true}
          name="Space suit"
        />
        <Item
          isPacked={true}
          name="Helmet with a golden leaf"
        />
        <Item
          isPacked={false}
          name="Photo of Tam"
        />
      </ul>
    </section>
  );
}
```

Notice that some of the `Item` components have their `isPacked` prop set to `true` instead of `false`. You want to add a checkmark (✅) to packed items if `isPacked={true}`.

You can write this as an [`if`/`else` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else) like so:

```js
if (isPacked) {
  return <li className="item">{name} ✅</li>;
}
return <li className="item">{name}</li>;
```

If the `isPacked` prop is `true`, this code **returns a different JSX tree.** With this change, some of the items get a checkmark at the end:

```js
function Item({ name, isPacked }) {
  if (isPacked) {
    return <li className="item">{name} ✅</li>;
  }
  return <li className="item">{name}</li>;
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item
          isPacked={true}
          name="Space suit"
        />
        <Item
          isPacked={true}
          name="Helmet with a golden leaf"
        />
        <Item
          isPacked={false}
          name="Photo of Tam"
        />
      </ul>
    </section>
  );
}
```

Try editing what gets returned in either case, and see how the result changes!

Notice how you're creating branching logic with JavaScript's `if` and `return` statements. In React, control flow (like conditions) is handled by JavaScript.

#### Conditionally returning nothing with `null`

In some situations, you won't want to render anything at all. For example, say you don't want to show packed items at all. A component must return something. In this case, you can return `null`:

```js
if (isPacked) {
  return null;
}
return <li className="item">{name}</li>;
```

If `isPacked` is true, the component will return nothing, `null`. Otherwise, it will return JSX to render.

```js
function Item({ name, isPacked }) {
  if (isPacked) {
    return null;
  }
  return <li className="item">{name}</li>;
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item
          isPacked={true}
          name="Space suit"
        />
        <Item
          isPacked={true}
          name="Helmet with a golden leaf"
        />
        <Item
          isPacked={false}
          name="Photo of Tam"
        />
      </ul>
    </section>
  );
}
```

In practice, returning `null` from a component isn't common because it might surprise a developer trying to render it. More often, you would conditionally include or exclude the component in the parent component's JSX. Here's how to do that!

### Conditionally including JSX

In the previous example, you controlled which (if any!) JSX tree would be returned by the component. You may already have noticed some duplication in the render output:

```js
<li className="item">{name} ✅</li>
```

is very similar to

```js
<li className="item">{name}</li>
```

Both of the conditional branches return `<li className="item">...</li>`:

```js
if (isPacked) {
  return <li className="item">{name} ✅</li>;
}
return <li className="item">{name}</li>;
```

While this duplication isn't harmful, it could make your code harder to maintain. What if you want to change the `className`? You'd have to do it in two places in your code! In such a situation, you could conditionally include a little JSX to make your code more [DRY.](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)

#### Conditional (ternary) operator (`? :`)

JavaScript has a compact syntax for writing a conditional expression -- the [conditional operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator) or "ternary operator".

Instead of this:

```js
if (isPacked) {
  return <li className="item">{name} ✅</li>;
}
return <li className="item">{name}</li>;
```

You can write this:

```js
return (
  <li className="item">
    {isPacked ? name + ' ✅' : name}
  </li>
);
```

You can read it as *"if `isPacked` is true, then (`?`) render `name + ' ✅'`, otherwise (`:`) render `name`"*.

##### Are these two examples fully equivalent?

If you're coming from an object-oriented programming background, you might assume that the two examples above are subtly different because one of them may create two different "instances" of `<li>`. But JSX elements aren't "instances" because they don't hold any internal state and aren't real DOM nodes. They're lightweight descriptions, like blueprints. So these two examples, in fact, *are* completely equivalent. [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) goes into detail about how this works.

Now let's say you want to wrap the completed item's text into another HTML tag, like `<del>` to strike it out. You can add even more newlines and parentheses so that it's easier to nest more JSX in each of the cases:

```js
function Item({ name, isPacked }) {
  return (
    <li className="item">
      {isPacked ? (
        <del>
          {name + ' ✅'}
        </del>
      ) : (
        name
      )}
    </li>
  );
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item
          isPacked={true}
          name="Space suit"
        />
        <Item
          isPacked={true}
          name="Helmet with a golden leaf"
        />
        <Item
          isPacked={false}
          name="Photo of Tam"
        />
      </ul>
    </section>
  );
}
```

This style works well for simple conditions, but use it in moderation. If your components get messy with too much nested conditional markup, consider extracting child components to clean things up. In React, markup is a part of your code, so you can use tools like variables and functions to tidy up complex expressions.

#### Logical AND operator (`&&`)

Another common shortcut you'll encounter is the [JavaScript logical AND (`&&`) operator.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND#:~:text=The%20logical%20AND%20(%20%26%26%20)%20operator,it%20returns%20a%20Boolean%20value.) Inside React components, it often comes up when you want to render some JSX when the condition is true, **or render nothing otherwise.** With `&&`, you could conditionally render the checkmark only if `isPacked` is `true`:

```js
return (
  <li className="item">
    {name} {isPacked && '✅'}
  </li>
);
```

You can read this as *"if `isPacked`, then (`&&`) render the checkmark, otherwise, render nothing"*.

Here it is in action:

```js
function Item({ name, isPacked }) {
  return (
    <li className="item">
      {name} {isPacked && '✅'}
    </li>
  );
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item
          isPacked={true}
          name="Space suit"
        />
        <Item
          isPacked={true}
          name="Helmet with a golden leaf"
        />
        <Item
          isPacked={false}
          name="Photo of Tam"
        />
      </ul>
    </section>
  );
}
```

A [JavaScript && expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND) returns the value of its right side (in our case, the checkmark) if the left side (our condition) is `true`. But if the condition is `false`, the whole expression becomes `false`. React considers `false` as a "hole" in the JSX tree, just like `null` or `undefined`, and doesn't render anything in its place.

**Don't put numbers on the left side of `&&`.**

To test the condition, JavaScript converts the left side to a boolean automatically. However, if the left side is `0`, then the whole expression gets that value (`0`), and React will happily render `0` rather than nothing.

For example, a common mistake is to write code like `messageCount && <p>New messages</p>`. It's easy to assume that it renders nothing when `messageCount` is `0`, but it really renders the `0` itself!

To fix it, make the left side a boolean: `messageCount > 0 && <p>New messages</p>`.

#### Conditionally assigning JSX to a variable

When the shortcuts get in the way of writing plain code, try using an `if` statement and a variable. You can reassign variables defined with [`let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let), so start by providing the default content you want to display, the name:

```js
let itemContent = name;
```

Use an `if` statement to reassign a JSX expression to `itemContent` if `isPacked` is `true`:

```js
if (isPacked) {
  itemContent = name + " ✅";
}
```

[Curly braces open the "window into JavaScript".](https://react.dev/learn/javascript-in-jsx-with-curly-braces#using-curly-braces-a-window-into-the-javascript-world) Embed the variable with curly braces in the returned JSX tree, nesting the previously calculated expression inside of JSX:

```js
<li className="item">
  {itemContent}
</li>
```

This style is the most verbose, but it's also the most flexible. Here it is in action:

```js
function Item({ name, isPacked }) {
  let itemContent = name;
  if (isPacked) {
    itemContent = name + " ✅";
  }
  return (
    <li className="item">
      {itemContent}
    </li>
  );
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item
          isPacked={true}
          name="Space suit"
        />
        <Item
          isPacked={true}
          name="Helmet with a golden leaf"
        />
        <Item
          isPacked={false}
          name="Photo of Tam"
        />
      </ul>
    </section>
  );
}
```

Like before, this works not only for text, but for arbitrary JSX too:

```js
function Item({ name, isPacked }) {
  let itemContent = name;
  if (isPacked) {
    itemContent = (
      <del>
        {name + " ✅"}
      </del>
    );
  }
  return (
    <li className="item">
      {itemContent}
    </li>
  );
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item
          isPacked={true}
          name="Space suit"
        />
        <Item
          isPacked={true}
          name="Helmet with a golden leaf"
        />
        <Item
          isPacked={false}
          name="Photo of Tam"
        />
      </ul>
    </section>
  );
}
```

If you're not familiar with JavaScript, this variety of styles might seem overwhelming at first. However, learning them will help you read and write any JavaScript code -- and not just React components! Pick the one you prefer for a start, and then consult this reference again if you forget how the other ones work.

* In React, you control branching logic with JavaScript.
* You can return a JSX expression conditionally with an `if` statement.
* You can conditionally save some JSX to a variable and then include it inside other JSX by using the curly braces.
* In JSX, `{cond ?  : }` means *"if `cond`, render ``, otherwise ``"*.
* In JSX, `{cond && }` means *"if `cond`, render ``, otherwise nothing"*.
* The shortcuts are common, but you don't have to use them if you prefer plain `if`.

## Rendering Lists

> **Source:** [Rendering Lists](https://react.dev/learn/rendering-lists) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

You will often want to display multiple similar components from a collection of data. You can use the [JavaScript array methods](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array#) to manipulate an array of data. On this page, you'll use [`filter()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) and [`map()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map) with React to filter and transform your array of data into an array of components.

* How to render components from an array using JavaScript's `map()`
* How to render only specific components using JavaScript's `filter()`
* When and why to use React keys

### Rendering data from arrays

Say that you have a list of content.

```js
<ul>
  <li>Creola Katherine Johnson: mathematician</li>
  <li>Mario José Molina-Pasquel Henríquez: chemist</li>
  <li>Mohammad Abdus Salam: physicist</li>
  <li>Percy Lavon Julian: chemist</li>
  <li>Subrahmanyan Chandrasekhar: astrophysicist</li>
</ul>
```

The only difference among those list items is their contents, their data. You will often need to show several instances of the same component using different data when building interfaces: from lists of comments to galleries of profile images. In these situations, you can store that data in JavaScript objects and arrays and use methods like [`map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) and [`filter()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) to render lists of components from them.

Here’s a short example of how to generate a list of items from an array:

1. **Move** the data into an array:

```js
const people = [
  'Creola Katherine Johnson: mathematician',
  'Mario José Molina-Pasquel Henríquez: chemist',
  'Mohammad Abdus Salam: physicist',
  'Percy Lavon Julian: chemist',
  'Subrahmanyan Chandrasekhar: astrophysicist'
];
```

2. **Map** the `people` members into a new array of JSX nodes, `listItems`:

```js
const listItems = people.map(person => <li>{person}</li>);
```

3. **Return** `listItems` from your component wrapped in a `<ul>`:

```js
return <ul>{listItems}</ul>;
```

Here is the result:

```js
const people = [
  'Creola Katherine Johnson: mathematician',
  'Mario José Molina-Pasquel Henríquez: chemist',
  'Mohammad Abdus Salam: physicist',
  'Percy Lavon Julian: chemist',
  'Subrahmanyan Chandrasekhar: astrophysicist'
];

export default function List() {
  const listItems = people.map(person =>
    <li>{person}</li>
  );
  return <ul>{listItems}</ul>;
}
```

```css
li { margin-bottom: 10px; }
```

Notice the sandbox above displays a console error:

Warning: Each child in a list should have a unique "key" prop.

You'll learn how to fix this error later on this page. Before we get to that, let's add some structure to your data.

### Filtering arrays of items

This data can be structured even more.

```js
const people = [{
  id: 0,
  name: 'Creola Katherine Johnson',
  profession: 'mathematician',
}, {
  id: 1,
  name: 'Mario José Molina-Pasquel Henríquez',
  profession: 'chemist',
}, {
  id: 2,
  name: 'Mohammad Abdus Salam',
  profession: 'physicist',
}, {
  id: 3,
  name: 'Percy Lavon Julian',
  profession: 'chemist',
}, {
  id: 4,
  name: 'Subrahmanyan Chandrasekhar',
  profession: 'astrophysicist',
}];
```

Let's say you want a way to only show people whose profession is `'chemist'`. You can use JavaScript's `filter()` method to return just those people. This method takes an array of items, passes them through a “test” (a function that returns `true` or `false`), and returns a new array of only those items that passed the test (returned `true`).

You only want the items where `profession` is `'chemist'`. The "test" function for this looks like `(person) => person.profession === 'chemist'`. Here's how to put it together:

1. **Create** a new array of just “chemist” people, `chemists`, by calling `filter()` on the `people` filtering by `person.profession === 'chemist'`:

```js
const chemists = people.filter(person =>
  person.profession === 'chemist'
);
```

2. Now **map** over `chemists`:

```js
const listItems = chemists.map(person =>
  <li>
     <img
       src={getImageUrl(person)}
       alt={person.name}
     />
     <p>
       <b>{person.name}:</b>
       {' ' + person.profession + ' '}
       known for {person.accomplishment}
     </p>
  </li>
);
```

3. Lastly, **return** the `listItems` from your component:

```js
return <ul>{listItems}</ul>;
```

```js
import { people } from './data.js';
import { getImageUrl } from './utils.js';

export default function List() {
  const chemists = people.filter(person =>
    person.profession === 'chemist'
  );
  const listItems = chemists.map(person =>
    <li>
      <img
        src={getImageUrl(person)}
        alt={person.name}
      />
      <p>
        <b>{person.name}:</b>
        {' ' + person.profession + ' '}
        known for {person.accomplishment}
      </p>
    </li>
  );
  return <ul>{listItems}</ul>;
}
```

```js
export const people = [{
  id: 0,
  name: 'Creola Katherine Johnson',
  profession: 'mathematician',
  accomplishment: 'spaceflight calculations',
  imageId: 'MK3eW3A'
}, {
  id: 1,
  name: 'Mario José Molina-Pasquel Henríquez',
  profession: 'chemist',
  accomplishment: 'discovery of Arctic ozone hole',
  imageId: 'mynHUSa'
}, {
  id: 2,
  name: 'Mohammad Abdus Salam',
  profession: 'physicist',
  accomplishment: 'electromagnetism theory',
  imageId: 'bE7W1ji'
}, {
  id: 3,
  name: 'Percy Lavon Julian',
  profession: 'chemist',
  accomplishment: 'pioneering cortisone drugs, steroids and birth control pills',
  imageId: 'IOjWm71'
}, {
  id: 4,
  name: 'Subrahmanyan Chandrasekhar',
  profession: 'astrophysicist',
  accomplishment: 'white dwarf star mass calculations',
  imageId: 'lrWQx8l'
}];
```

```js
export function getImageUrl(person) {
  return (
    'https://react.dev/images/docs/scientists/' +
    person.imageId +
    's.jpg'
  );
}
```

```css
ul { list-style-type: none; padding: 0px 10px; }
li {
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  align-items: center;
}
img { width: 100px; height: 100px; border-radius: 50%; }
```

Arrow functions implicitly return the expression right after `=>`, so you didn't need a `return` statement:

```js
const listItems = chemists.map(person =>
  <li>...</li> // Implicit return!
);
```

However, **you must write `return` explicitly if your `=>` is followed by a `{` curly brace!**

```js
const listItems = chemists.map(person => { // Curly brace
  return <li>...</li>;
});
```

Arrow functions containing `=> {` are said to have a ["block body".](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#function_body) They let you write more than a single line of code, but you *have to* write a `return` statement yourself. If you forget it, nothing gets returned!

### Keeping list items in order with `key`

Notice that all the sandboxes above show an error in the console:

Warning: Each child in a list should have a unique "key" prop.

You need to give each array item a `key` -- a string or a number that uniquely identifies it among other items in that array:

```js
<li key={person.id}>...</li>
```

JSX elements directly inside a `map()` call always need keys!

Keys tell React which array item each component corresponds to, so that it can match them up later. This becomes important if your array items can move (e.g. due to sorting), get inserted, or get deleted. A well-chosen `key` helps React infer what exactly has happened, and make the correct updates to the DOM tree.

Rather than generating keys on the fly, you should include them in your data:

```js
import { people } from './data.js';
import { getImageUrl } from './utils.js';

export default function List() {
  const listItems = people.map(person =>
    <li key={person.id}>
      <img
        src={getImageUrl(person)}
        alt={person.name}
      />
      <p>
        <b>{person.name}</b>
          {' ' + person.profession + ' '}
          known for {person.accomplishment}
      </p>
    </li>
  );
  return <ul>{listItems}</ul>;
}
```

```js
export const people = [{
  id: 0, // Used in JSX as a key
  name: 'Creola Katherine Johnson',
  profession: 'mathematician',
  accomplishment: 'spaceflight calculations',
  imageId: 'MK3eW3A'
}, {
  id: 1, // Used in JSX as a key
  name: 'Mario José Molina-Pasquel Henríquez',
  profession: 'chemist',
  accomplishment: 'discovery of Arctic ozone hole',
  imageId: 'mynHUSa'
}, {
  id: 2, // Used in JSX as a key
  name: 'Mohammad Abdus Salam',
  profession: 'physicist',
  accomplishment: 'electromagnetism theory',
  imageId: 'bE7W1ji'
}, {
  id: 3, // Used in JSX as a key
  name: 'Percy Lavon Julian',
  profession: 'chemist',
  accomplishment: 'pioneering cortisone drugs, steroids and birth control pills',
  imageId: 'IOjWm71'
}, {
  id: 4, // Used in JSX as a key
  name: 'Subrahmanyan Chandrasekhar',
  profession: 'astrophysicist',
  accomplishment: 'white dwarf star mass calculations',
  imageId: 'lrWQx8l'
}];
```

```js
export function getImageUrl(person) {
  return (
    'https://react.dev/images/docs/scientists/' +
    person.imageId +
    's.jpg'
  );
}
```

```css
ul { list-style-type: none; padding: 0px 10px; }
li {
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  align-items: center;
}
img { width: 100px; height: 100px; border-radius: 50%; }
```

##### Displaying several DOM nodes for each list item

What do you do when each item needs to render not one, but several DOM nodes?

The short [`<>...</>` Fragment](https://react.dev/reference/react/Fragment) syntax won't let you pass a key, so you need to either group them into a single `<div>`, or use the slightly longer and [more explicit `` syntax:](https://react.dev/reference/react/Fragment#rendering-a-list-of-fragments)

```js
import { Fragment } from 'react';

// ...

const listItems = people.map(person =>
  <Fragment key={person.id}>
    <h1>{person.name}</h1>
    <p>{person.bio}</p>
  </Fragment>
);
```

Fragments disappear from the DOM, so this will produce a flat list of `<h1>`, `<p>`, `<h1>`, `<p>`, and so on.

#### Where to get your `key`

Different sources of data provide different sources of keys:

* **Data from a database:** If your data is coming from a database, you can use the database keys/IDs, which are unique by nature.
* **Locally generated data:** If your data is generated and persisted locally (e.g. notes in a note-taking app), use an incrementing counter, [`crypto.randomUUID()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) or a package like [`uuid`](https://www.npmjs.com/package/uuid) when creating items.

#### Rules of keys

* **Keys must be unique among siblings.** However, it’s okay to use the same keys for JSX nodes in _different_ arrays.
* **Keys must not change** or that defeats their purpose! Don't generate them while rendering.

#### Why does React need keys?

Imagine that files on your desktop didn't have names. Instead, you'd refer to them by their order -- the first file, the second file, and so on. You could get used to it, but once you delete a file, it would get confusing. The second file would become the first file, the third file would be the second file, and so on.

File names in a folder and JSX keys in an array serve a similar purpose. They let us uniquely identify an item between its siblings. A well-chosen key provides more information than the position within the array. Even if the _position_ changes due to reordering, the `key` lets React identify the item throughout its lifetime.

You might be tempted to use an item's index in the array as its key. In fact, that's what React will use if you don't specify a `key` at all. But the order in which you render items will change over time if an item is inserted, deleted, or if the array gets reordered. Index as a key often leads to subtle and confusing bugs.

Similarly, do not generate keys on the fly, e.g. with `key={Math.random()}`. This will cause keys to never match up between renders, leading to all your components and DOM being recreated every time. Not only is this slow, but it will also lose any user input inside the list items. Instead, use a stable ID based on the data.

Note that your components won't receive `key` as a prop. It's only used as a hint by React itself. If your component needs an ID, you have to pass it as a separate prop: ``.

On this page you learned:

* How to move data out of components and into data structures like arrays and objects.
* How to generate sets of similar components with JavaScript's `map()`.
* How to create arrays of filtered items with JavaScript's `filter()`.
* Why and how to set `key` on each component in a collection so React can keep track of each of them even if their position or data changes.

## Keeping Components Pure

> **Source:** [Keeping Components Pure](https://react.dev/learn/keeping-components-pure) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

Some JavaScript functions are *pure.* Pure functions only perform a calculation and nothing more. By strictly only writing your components as pure functions, you can avoid an entire class of baffling bugs and unpredictable behavior as your codebase grows. To get these benefits, though, there are a few rules you must follow.

* What purity is and how it helps you avoid bugs
* How to keep components pure by keeping changes out of the render phase
* How to use Strict Mode to find mistakes in your components

### Purity: Components as formulas

In computer science (and especially the world of functional programming), [a pure function](https://wikipedia.org/wiki/Pure_function) is a function with the following characteristics:

* **It minds its own business.** It does not change any objects or variables that existed before it was called.
* **Same inputs, same output.** Given the same inputs, a pure function should always return the same result.

You might already be familiar with one example of pure functions: formulas in math.

Consider this math formula: y = 2x.

If x = 2 then y = 4. Always.

If x = 3 then y = 6. Always.

If x = 3, y won't sometimes be 9 or –1 or 2.5 depending on the time of day or the state of the stock market.

If y = 2x and x = 3, y will _always_ be 6.

If we made this into a JavaScript function, it would look like this:

```js
function double(number) {
  return 2 * number;
}
```

In the above example, `double` is a **pure function.** If you pass it `3`, it will return `6`. Always.

React is designed around this concept. **React assumes that every component you write is a pure function.** This means that React components you write must always return the same JSX given the same inputs:

```js
function Recipe({ drinkers }) {
  return (
    <ol>
      <li>Boil {drinkers} cups of water.</li>
      <li>Add {drinkers} spoons of tea and {0.5 * drinkers} spoons of spice.</li>
      <li>Add {0.5 * drinkers} cups of milk to boil and sugar to taste.</li>
    </ol>
  );
}

export default function App() {
  return (
    <section>
      <h1>Spiced Chai Recipe</h1>
      <h2>For two</h2>
      <Recipe drinkers={2} />
      <h2>For a gathering</h2>
      <Recipe drinkers={4} />
    </section>
  );
}
```

When you pass `drinkers={2}` to `Recipe`, it will return JSX containing `2 cups of water`. Always.

If you pass `drinkers={4}`, it will return JSX containing `4 cups of water`. Always.

Just like a math formula.

You could think of your components as recipes: if you follow them and don't introduce new ingredients during the cooking process, you will get the same dish every time. That "dish" is the JSX that the component serves to React to [render.](https://react.dev/learn/render-and-commit)

### Side Effects: (un)intended consequences

React's rendering process must always be pure. Components should only *return* their JSX, and not *change* any objects or variables that existed before rendering—that would make them impure!

Here is a component that breaks this rule:

```js
let guest = 0;

function Cup() {
  // Bad: changing a preexisting variable!
  guest = guest + 1;
  return <h2>Tea cup for guest #{guest}</h2>;
}

export default function TeaSet() {
  return (
    <>
      <Cup />
      <Cup />
      <Cup />
    </>
  );
}
```

This component is reading and writing a `guest` variable declared outside of it. This means that **calling this component multiple times will produce different JSX!** And what's more, if _other_ components read `guest`, they will produce different JSX, too, depending on when they were rendered! That's not predictable.

Going back to our formula y = 2x, now even if x = 2, we cannot trust that y = 4. Our tests could fail, our users would be baffled, planes would fall out of the sky—you can see how this would lead to confusing bugs!

You can fix this component by [passing `guest` as a prop instead](https://react.dev/learn/passing-props-to-a-component):

```js
function Cup({ guest }) {
  return <h2>Tea cup for guest #{guest}</h2>;
}

export default function TeaSet() {
  return (
    <>
      <Cup guest={1} />
      <Cup guest={2} />
      <Cup guest={3} />
    </>
  );
}
```

Now your component is pure, as the JSX it returns only depends on the `guest` prop.

In general, you should not expect your components to be rendered in any particular order. It doesn't matter if you call y = 2x before or after y = 5x: both formulas will resolve independently of each other. In the same way, each component should only "think for itself", and not attempt to coordinate with or depend upon others during rendering. Rendering is like a school exam: each component should calculate JSX on their own!

##### Detecting impure calculations with StrictMode

Although you might not have used them all yet, in React there are three kinds of inputs that you can read while rendering: [props](https://react.dev/learn/passing-props-to-a-component), [state](https://react.dev/learn/state-a-components-memory), and [context.](https://react.dev/learn/passing-data-deeply-with-context) You should always treat these inputs as read-only.

When you want to *change* something in response to user input, you should [set state](https://react.dev/learn/state-a-components-memory) instead of writing to a variable. You should never change preexisting variables or objects while your component is rendering.

React offers a "Strict Mode" in which it calls each component's function twice during development. **By calling the component functions twice, Strict Mode helps find components that break these rules.**

Notice how the original example displayed "Guest #2", "Guest #4", and "Guest #6" instead of "Guest #1", "Guest #2", and "Guest #3". The original function was impure, so calling it twice broke it. But the fixed pure version works even if the function is called twice every time. **Pure functions only calculate, so calling them twice won't change anything**--just like calling `double(2)` twice doesn't change what's returned, and solving y = 2x twice doesn't change what y is. Same inputs, same outputs. Always.

Strict Mode has no effect in production, so it won't slow down the app for your users. To opt into Strict Mode, you can wrap your root component into ``. Some frameworks do this by default.

#### Local mutation: Your component's little secret

In the above example, the problem was that the component changed a *preexisting* variable while rendering. This is often called a **"mutation"** to make it sound a bit scarier. Pure functions don't mutate variables outside of the function's scope or objects that were created before the call—that makes them impure!

However, **it's completely fine to change variables and objects that you've *just* created while rendering.** In this example, you create an `[]` array, assign it to a `cups` variable, and then `push` a dozen cups into it:

```js
function Cup({ guest }) {
  return <h2>Tea cup for guest #{guest}</h2>;
}

export default function TeaGathering() {
  const cups = [];
  for (let i = 1; i <= 12; i++) {
    cups.push(<Cup key={i} guest={i} />);
  }
  return cups;
}
```

If the `cups` variable or the `[]` array were created outside the `TeaGathering` function, this would be a huge problem! You would be changing a *preexisting* object by pushing items into that array.

However, it's fine because you've created them *during the same render*, inside `TeaGathering`. No code outside of `TeaGathering` will ever know that this happened. This is called **"local mutation"**—it's like your component's little secret.

### Where you _can_ cause side effects

While functional programming relies heavily on purity, at some point, somewhere, _something_ has to change. That's kind of the point of programming! These changes—updating the screen, starting an animation, changing the data—are called **side effects.** They're things that happen _"on the side"_, not during rendering.

In React, **side effects usually belong inside [event handlers.](https://react.dev/learn/responding-to-events)** Event handlers are functions that React runs when you perform some action—for example, when you click a button. Even though event handlers are defined *inside* your component, they don't run *during* rendering! **So event handlers don't need to be pure.**

If you've exhausted all other options and can't find the right event handler for your side effect, you can still attach it to your returned JSX with a [`useEffect`](https://react.dev/reference/react/useEffect) call in your component. This tells React to execute it later, after rendering, when side effects are allowed. **However, this approach should be your last resort.**

When possible, try to express your logic with rendering alone. You'll be surprised how far this can take you!

##### Why does React care about purity?

Writing pure functions takes some habit and discipline. But it also unlocks marvelous opportunities:

* Your components could run in a different environment—for example, on the server! Since they return the same result for the same inputs, one component can serve many user requests.
* You can improve performance by [skipping rendering](https://react.dev/reference/react/memo) components whose inputs have not changed. This is safe because pure functions always return the same results, so they are safe to cache.
* If some data changes in the middle of rendering a deep component tree, React can restart rendering without wasting time to finish the outdated render. Purity makes it safe to stop calculating at any time.

Every new React feature we're building takes advantage of purity. From data fetching to animations to performance, keeping components pure unlocks the power of the React paradigm.

* A component must be pure, meaning:
  * **It minds its own business.** It should not change any objects or variables that existed before rendering.
  * **Same inputs, same output.** Given the same inputs, a component should always return the same JSX.
* Rendering can happen at any time, so components should not depend on each others' rendering sequence.
* You should not mutate any of the inputs that your components use for rendering. That includes props, state, and context. To update the screen, ["set" state](https://react.dev/learn/state-a-components-memory) instead of mutating preexisting objects.
* Strive to express your component's logic in the JSX you return. When you need to "change things", you'll usually want to do it in an event handler. As a last resort, you can `useEffect`.
* Writing pure functions takes a bit of practice, but it unlocks the power of React's paradigm.

## Responding to Events

> **Source:** [Responding to Events](https://react.dev/learn/responding-to-events) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

React lets you add *event handlers* to your JSX. Event handlers are your own functions that will be triggered in response to interactions like clicking, hovering, focusing form inputs, and so on.

* Different ways to write an event handler
* How to pass event handling logic from a parent component
* How events propagate and how to stop them

### Adding event handlers

To add an event handler, you will first define a function and then [pass it as a prop](https://react.dev/learn/passing-props-to-a-component) to the appropriate JSX tag. For example, here is a button that doesn't do anything yet:

```js
export default function Button() {
  return (
    <button>
      I don't do anything
    </button>
  );
}
```

You can make it show a message when a user clicks by following these three steps:

1. Declare a function called `handleClick` *inside* your `Button` component.
2. Implement the logic inside that function (use `alert` to show the message).
3. Add `onClick={handleClick}` to the `<button>` JSX.

```js
export default function Button() {
  function handleClick() {
    alert('You clicked me!');
  }

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
}
```

```css
button { margin-right: 10px; }
```

You defined the `handleClick` function and then [passed it as a prop](https://react.dev/learn/passing-props-to-a-component) to `<button>`.  `handleClick` is an **event handler.** Event handler functions:

* Are usually defined *inside* your components.
* Have names that start with `handle`, followed by the name of the event.

By convention, it is common to name event handlers as `handle` followed by the event name. You'll often see `onClick={handleClick}`, `onMouseEnter={handleMouseEnter}`, and so on.

Alternatively, you can define an event handler inline in the JSX:

```jsx
<button onClick={function handleClick() {
  alert('You clicked me!');
}}>
```

Or, more concisely, using an arrow function:

```jsx
<button onClick={() => {
  alert('You clicked me!');
}}>
```

All of these styles are equivalent. Inline event handlers are convenient for short functions.

Functions passed to event handlers must be passed, not called. For example:

| passing a function (correct)     | calling a function (incorrect)     |
| -------------------------------- | ---------------------------------- |
| `<button onClick={handleClick}>` | `<button onClick={handleClick()}>` |

The difference is subtle. In the first example, the `handleClick` function is passed as an `onClick` event handler. This tells React to remember it and only call your function when the user clicks the button.

In the second example, the `()` at the end of `handleClick()` fires the function *immediately* during [rendering](https://react.dev/learn/render-and-commit), without any clicks. This is because JavaScript inside the [JSX `{` and `}`](https://react.dev/learn/javascript-in-jsx-with-curly-braces) executes right away.

When you write code inline, the same pitfall presents itself in a different way:

| passing a function (correct)            | calling a function (incorrect)    |
| --------------------------------------- | --------------------------------- |
| `<button onClick={() => alert('...')}>` | `<button onClick={alert('...')}>` |

Passing inline code like this won't fire on click—it fires every time the component renders:

```jsx
// This alert fires when the component renders, not when clicked!
<button onClick={alert('You clicked me!')}>
```

If you want to define your event handler inline, wrap it in an anonymous function like so:

```jsx
<button onClick={() => alert('You clicked me!')}>
```

Rather than executing the code inside with every render, this creates a function to be called later.

In both cases, what you want to pass is a function:

* `<button onClick={handleClick}>` passes the `handleClick` function.
* `<button onClick={() => alert('...')}>` passes the `() => alert('...')` function.

[Read more about arrow functions.](https://javascript.info/arrow-functions-basics)

#### Reading props in event handlers

Because event handlers are declared inside of a component, they have access to the component's props. Here is a button that, when clicked, shows an alert with its `message` prop:

```js
function AlertButton({ message, children }) {
  return (
    <button onClick={() => alert(message)}>
      {children}
    </button>
  );
}

export default function Toolbar() {
  return (
    <div>
      <AlertButton message="Playing!">
        Play Movie
      </AlertButton>
      <AlertButton message="Uploading!">
        Upload Image
      </AlertButton>
    </div>
  );
}
```

```css
button { margin-right: 10px; }
```

This lets these two buttons show different messages. Try changing the messages passed to them.

#### Passing event handlers as props

Often you'll want the parent component to specify a child's event handler. Consider buttons: depending on where you're using a `Button` component, you might want to execute a different function—perhaps one plays a movie and another uploads an image.

To do this, pass a prop the component receives from its parent as the event handler like so:

```js
function Button({ onClick, children }) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}

function PlayButton({ movieName }) {
  function handlePlayClick() {
    alert(`Playing ${movieName}!`);
  }

  return (
    <Button onClick={handlePlayClick}>
      Play "{movieName}"
    </Button>
  );
}

function UploadButton() {
  return (
    <Button onClick={() => alert('Uploading!')}>
      Upload Image
    </Button>
  );
}

export default function Toolbar() {
  return (
    <div>
      <PlayButton movieName="Kiki's Delivery Service" />
      <UploadButton />
    </div>
  );
}
```

```css
button { margin-right: 10px; }
```

Here, the `Toolbar` component renders a `PlayButton` and an `UploadButton`:

- `PlayButton` passes `handlePlayClick` as the `onClick` prop to the `Button` inside.
- `UploadButton` passes `() => alert('Uploading!')` as the `onClick` prop to the `Button` inside.

Finally, your `Button` component accepts a prop called `onClick`. It passes that prop directly to the built-in browser `<button>` with `onClick={onClick}`. This tells React to call the passed function on click.

If you use a [design system](https://uxdesign.cc/everything-you-need-to-know-about-design-systems-54b109851969), it's common for components like buttons to contain styling but not specify behavior. Instead, components like `PlayButton` and `UploadButton` will pass event handlers down.

#### Naming event handler props

Built-in components like `<button>` and `<div>` only support [browser event names](https://react.dev/reference/react-dom/components/common#common-props) like `onClick`. However, when you're building your own components, you can name their event handler props any way that you like.

By convention, event handler props should start with `on`, followed by a capital letter.

For example, the `Button` component's `onClick` prop could have been called `onSmash`:

```js
function Button({ onSmash, children }) {
  return (
    <button onClick={onSmash}>
      {children}
    </button>
  );
}

export default function App() {
  return (
    <div>
      <Button onSmash={() => alert('Playing!')}>
        Play Movie
      </Button>
      <Button onSmash={() => alert('Uploading!')}>
        Upload Image
      </Button>
    </div>
  );
}
```

```css
button { margin-right: 10px; }
```

In this example, `<button onClick={onSmash}>` shows that the browser `<button>` (lowercase) still needs a prop called `onClick`, but the prop name received by your custom `Button` component is up to you!

When your component supports multiple interactions, you might name event handler props for app-specific concepts. For example, this `Toolbar` component receives `onPlayMovie` and `onUploadImage` event handlers:

```js
export default function App() {
  return (
    <Toolbar
      onPlayMovie={() => alert('Playing!')}
      onUploadImage={() => alert('Uploading!')}
    />
  );
}

function Toolbar({ onPlayMovie, onUploadImage }) {
  return (
    <div>
      <Button onClick={onPlayMovie}>
        Play Movie
      </Button>
      <Button onClick={onUploadImage}>
        Upload Image
      </Button>
    </div>
  );
}

function Button({ onClick, children }) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}
```

```css
button { margin-right: 10px; }
```

Notice how the `App` component does not need to know *what* `Toolbar` will do with `onPlayMovie` or `onUploadImage`. That's an implementation detail of the `Toolbar`. Here, `Toolbar` passes them down as `onClick` handlers to its `Button`s, but it could later also trigger them on a keyboard shortcut. Naming props after app-specific interactions like `onPlayMovie` gives you the flexibility to change how they're used later.

Make sure that you use the appropriate HTML tags for your event handlers. For example, to handle clicks, use [`<button onClick={handleClick}>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button) instead of `<div onClick={handleClick}>`. Using a real browser `<button>` enables built-in browser behaviors like keyboard navigation. If you don't like the default browser styling of a button and want to make it look more like a link or a different UI element, you can achieve it with CSS. [Learn more about writing accessible markup.](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML)

### Event propagation

Event handlers will also catch events from any children your component might have. We say that an event "bubbles" or "propagates" up the tree: it starts with where the event happened, and then goes up the tree.

This `<div>` contains two buttons. Both the `<div>` *and* each button have their own `onClick` handlers. Which handlers do you think will fire when you click a button?

```js
export default function Toolbar() {
  return (
    <div className="Toolbar" onClick={() => {
      alert('You clicked on the toolbar!');
    }}>
      <button onClick={() => alert('Playing!')}>
        Play Movie
      </button>
      <button onClick={() => alert('Uploading!')}>
        Upload Image
      </button>
    </div>
  );
}
```

```css
.Toolbar {
  background: #aaa;
  padding: 5px;
}
button { margin: 5px; }
```

If you click on either button, its `onClick` will run first, followed by the parent `<div>`'s `onClick`. So two messages will appear. If you click the toolbar itself, only the parent `<div>`'s `onClick` will run.

All events propagate in React except `onScroll`, which only works on the JSX tag you attach it to.

#### Stopping propagation

Event handlers receive an **event object** as their only argument. By convention, it's usually called `e`, which stands for "event". You can use this object to read information about the event.

That event object also lets you stop the propagation. If you want to prevent an event from reaching parent components, you need to call `e.stopPropagation()` like this `Button` component does:

```js
function Button({ onClick, children }) {
  return (
    <button onClick={e => {
      e.stopPropagation();
      onClick();
    }}>
      {children}
    </button>
  );
}

export default function Toolbar() {
  return (
    <div className="Toolbar" onClick={() => {
      alert('You clicked on the toolbar!');
    }}>
      <Button onClick={() => alert('Playing!')}>
        Play Movie
      </Button>
      <Button onClick={() => alert('Uploading!')}>
        Upload Image
      </Button>
    </div>
  );
}
```

```css
.Toolbar {
  background: #aaa;
  padding: 5px;
}
button { margin: 5px; }
```

When you click on a button:

1. React calls the `onClick` handler passed to `<button>`.
2. That handler, defined in `Button`, does the following:
   * Calls `e.stopPropagation()`, preventing the event from bubbling further.
   * Calls the `onClick` function, which is a prop passed from the `Toolbar` component.
3. That function, defined in the `Toolbar` component, displays the button's own alert.
4. Since the propagation was stopped, the parent `<div>`'s `onClick` handler does *not* run.

As a result of `e.stopPropagation()`, clicking on the buttons now only shows a single alert (from the `<button>`) rather than the two of them (from the `<button>` and the parent toolbar `<div>`). Clicking a button is not the same thing as clicking the surrounding toolbar, so stopping the propagation makes sense for this UI.

##### Capture phase events

In rare cases, you might need to catch all events on child elements, *even if they stopped propagation*. For example, maybe you want to log every click to analytics, regardless of the propagation logic. You can do this by adding `Capture` at the end of the event name:

```js
<div onClickCapture={() => { /* this runs first */ }}>
  <button onClick={e => e.stopPropagation()} />
  <button onClick={e => e.stopPropagation()} />
</div>
```

Each event propagates in three phases:

1. It travels down, calling all `onClickCapture` handlers.
2. It runs the clicked element's `onClick` handler.
3. It travels upwards, calling all `onClick` handlers.

Capture events are useful for code like routers or analytics, but you probably won't use them in app code.

#### Passing handlers as alternative to propagation

Notice how this click handler runs a line of code _and then_ calls the `onClick` prop passed by the parent:

```js
function Button({ onClick, children }) {
  return (
    <button onClick={e => {
      e.stopPropagation();
      onClick();
    }}>
      {children}
    </button>
  );
}
```

You could add more code to this handler before calling the parent `onClick` event handler, too. This pattern provides an *alternative* to propagation. It lets the child component handle the event, while also letting the parent component specify some additional behavior. Unlike propagation, it's not automatic. But the benefit of this pattern is that you can clearly follow the whole chain of code that executes as a result of some event.

If you rely on propagation and it's difficult to trace which handlers execute and why, try this approach instead.

#### Preventing default behavior

Some browser events have default behavior associated with them. For example, a `<form>` submit event, which happens when a button inside of it is clicked, will reload the whole page by default:

```js
export default function Signup() {
  return (
    <form onSubmit={() => alert('Submitting!')}>
      <input />
      <button>Send</button>
    </form>
  );
}
```

```css
button { margin-left: 5px; }
```

You can call `e.preventDefault()` on the event object to stop this from happening:

```js
export default function Signup() {
  return (
    <form onSubmit={e => {
      e.preventDefault();
      alert('Submitting!');
    }}>
      <input />
      <button>Send</button>
    </form>
  );
}
```

```css
button { margin-left: 5px; }
```

Don't confuse `e.stopPropagation()` and `e.preventDefault()`. They are both useful, but are unrelated:

* [`e.stopPropagation()`](https://developer.mozilla.org/docs/Web/API/Event/stopPropagation) stops the event handlers attached to the tags above from firing.
* [`e.preventDefault()` ](https://developer.mozilla.org/docs/Web/API/Event/preventDefault) prevents the default browser behavior for the few events that have it.

### Can event handlers have side effects?

Absolutely! Event handlers are the best place for side effects.

Unlike rendering functions, event handlers don't need to be [pure](https://react.dev/learn/keeping-components-pure), so it's a great place to *change* something—for example, change an input's value in response to typing, or change a list in response to a button press. However, in order to change some information, you first need some way to store it. In React, this is done by using [state, a component's memory.](https://react.dev/learn/state-a-components-memory) You will learn all about it on the next page.

* You can handle events by passing a function as a prop to an element like `<button>`.
* Event handlers must be passed, **not called!** `onClick={handleClick}`, not `onClick={handleClick()}`.
* You can define an event handler function separately or inline.
* Event handlers are defined inside a component, so they can access props.
* You can declare an event handler in a parent and pass it as a prop to a child.
* You can define your own event handler props with application-specific names.
* Events propagate upwards. Call `e.stopPropagation()` on the first argument to prevent that.
* Events may have unwanted default browser behavior. Call `e.preventDefault()` to prevent that.
* Explicitly calling an event handler prop from a child handler is a good alternative to propagation.

## State: A Component's Memory

> **Source:** [State: A Component's Memory](https://react.dev/learn/state-a-components-memory) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

Components often need to change what's on the screen as a result of an interaction. Typing into the form should update the input field, clicking "next" on an image carousel should change which image is displayed, clicking "buy" should put a product in the shopping cart. Components need to "remember" things: the current input value, the current image, the shopping cart. In React, this kind of component-specific memory is called *state*.

* How to add a state variable with the [`useState`](https://react.dev/reference/react/useState) Hook
* What pair of values the `useState` Hook returns
* How to add more than one state variable
* Why state is called local

### When a regular variable isn’t enough

Here's a component that renders a sculpture image. Clicking the "Next" button should show the next sculpture by changing the `index` to `1`, then `2`, and so on. However, this **won't work** (you can try it!):

```js
import { sculptureList } from './data.js';

export default function Gallery() {
  let index = 0;

  function handleClick() {
    index = index + 1;
  }

  let sculpture = sculptureList[index];
  return (
    <>
      <button onClick={handleClick}>
        Next
      </button>
      <h2>
        <i>{sculpture.name} </i>
        by {sculpture.artist}
      </h2>
      <h3>
        ({index + 1} of {sculptureList.length})
      </h3>
      <img
        src={sculpture.url}
        alt={sculpture.alt}
      />
      <p>
        {sculpture.description}
      </p>
    </>
  );
}
```

```js
export const sculptureList = [{
  name: 'Homenaje a la Neurocirugía',
  artist: 'Marta Colvin Andrade',
  description: 'Although Colvin is predominantly known for abstract themes that allude to pre-Hispanic symbols, this gigantic sculpture, an homage to neurosurgery, is one of her most recognizable public art pieces.',
  url: 'https://react.dev/images/docs/scientists/Mx7dA2Y.jpg',
  alt: 'A bronze statue of two crossed hands delicately holding a human brain in their fingertips.'
}, {
  name: 'Floralis Genérica',
  artist: 'Eduardo Catalano',
  description: 'This enormous (75 ft. or 23m) silver flower is located in Buenos Aires. It is designed to move, closing its petals in the evening or when strong winds blow and opening them in the morning.',
  url: 'https://react.dev/images/docs/scientists/ZF6s192m.jpg',
  alt: 'A gigantic metallic flower sculpture with reflective mirror-like petals and strong stamens.'
}, {
  name: 'Eternal Presence',
  artist: 'John Woodrow Wilson',
  description: 'Wilson was known for his preoccupation with equality, social justice, as well as the essential and spiritual qualities of humankind. This massive (7ft. or 2,13m) bronze represents what he described as "a symbolic Black presence infused with a sense of universal humanity."',
  url: 'https://react.dev/images/docs/scientists/aTtVpES.jpg',
  alt: 'The sculpture depicting a human head seems ever-present and solemn. It radiates calm and serenity.'
}, {
  name: 'Moai',
  artist: 'Unknown Artist',
  description: 'Located on the Easter Island, there are 1,000 moai, or extant monumental statues, created by the early Rapa Nui people, which some believe represented deified ancestors.',
  url: 'https://react.dev/images/docs/scientists/RCwLEoQm.jpg',
  alt: 'Three monumental stone busts with the heads that are disproportionately large with somber faces.'
}, {
  name: 'Blue Nana',
  artist: 'Niki de Saint Phalle',
  description: 'The Nanas are triumphant creatures, symbols of femininity and maternity. Initially, Saint Phalle used fabric and found objects for the Nanas, and later on introduced polyester to achieve a more vibrant effect.',
  url: 'https://react.dev/images/docs/scientists/Sd1AgUOm.jpg',
  alt: 'A large mosaic sculpture of a whimsical dancing female figure in a colorful costume emanating joy.'
}, {
  name: 'Ultimate Form',
  artist: 'Barbara Hepworth',
  description: 'This abstract bronze sculpture is a part of The Family of Man series located at Yorkshire Sculpture Park. Hepworth chose not to create literal representations of the world but developed abstract forms inspired by people and landscapes.',
  url: 'https://react.dev/images/docs/scientists/2heNQDcm.jpg',
  alt: 'A tall sculpture made of three elements stacked on each other reminding of a human figure.'
}, {
  name: 'Cavaliere',
  artist: 'Lamidi Olonade Fakeye',
  description: "Descended from four generations of woodcarvers, Fakeye's work blended traditional and contemporary Yoruba themes.",
  url: 'https://react.dev/images/docs/scientists/wIdGuZwm.png',
  alt: 'An intricate wood sculpture of a warrior with a focused face on a horse adorned with patterns.'
}, {
  name: 'Big Bellies',
  artist: 'Alina Szapocznikow',
  description: "Szapocznikow is known for her sculptures of the fragmented body as a metaphor for the fragility and impermanence of youth and beauty. This sculpture depicts two very realistic large bellies stacked on top of each other, each around five feet (1,5m) tall.",
  url: 'https://react.dev/images/docs/scientists/AlHTAdDm.jpg',
  alt: 'The sculpture reminds a cascade of folds, quite different from bellies in classical sculptures.'
}, {
  name: 'Terracotta Army',
  artist: 'Unknown Artist',
  description: 'The Terracotta Army is a collection of terracotta sculptures depicting the armies of Qin Shi Huang, the first Emperor of China. The army consisted of more than 8,000 soldiers, 130 chariots with 520 horses, and 150 cavalry horses.',
  url: 'https://react.dev/images/docs/scientists/HMFmH6m.jpg',
  alt: '12 terracotta sculptures of solemn warriors, each with a unique facial expression and armor.'
}, {
  name: 'Lunar Landscape',
  artist: 'Louise Nevelson',
  description: 'Nevelson was known for scavenging objects from New York City debris, which she would later assemble into monumental constructions. In this one, she used disparate parts like a bedpost, juggling pin, and seat fragment, nailing and gluing them into boxes that reflect the influence of Cubism’s geometric abstraction of space and form.',
  url: 'https://react.dev/images/docs/scientists/rN7hY6om.jpg',
  alt: 'A black matte sculpture where the individual elements are initially indistinguishable.'
}, {
  name: 'Aureole',
  artist: 'Ranjani Shettar',
  description: 'Shettar merges the traditional and the modern, the natural and the industrial. Her art focuses on the relationship between man and nature. Her work was described as compelling both abstractly and figuratively, gravity defying, and a "fine synthesis of unlikely materials."',
  url: 'https://react.dev/images/docs/scientists/okTpbHhm.jpg',
  alt: 'A pale wire-like sculpture mounted on concrete wall and descending on the floor. It appears light.'
}, {
  name: 'Hippos',
  artist: 'Taipei Zoo',
  description: 'The Taipei Zoo commissioned a Hippo Square featuring submerged hippos at play.',
  url: 'https://react.dev/images/docs/scientists/6o5Vuyu.jpg',
  alt: 'A group of bronze hippo sculptures emerging from the sett sidewalk as if they were swimming.'
}];
```

```css
h2 { margin-top: 10px; margin-bottom: 0; }
h3 {
  margin-top: 5px;
  font-weight: normal;
  font-size: 100%;
}
img { width: 120px; height: 120px; }
button {
  display: block;
  margin-top: 10px;
  margin-bottom: 10px;
}
```

The `handleClick` event handler is updating a local variable, `index`. But two things prevent that change from being visible:

1. **Local variables don't persist between renders.** When React renders this component a second time, it renders it from scratch—it doesn't consider any changes to the local variables.
2. **Changes to local variables won't trigger renders.** React doesn't realize it needs to render the component again with the new data.

To update a component with new data, two things need to happen:

1. **Retain** the data between renders.
2. **Trigger** React to render the component with new data (re-rendering).

The [`useState`](https://react.dev/reference/react/useState) Hook provides those two things:

1. A **state variable** to retain the data between renders.
2. A **state setter function** to update the variable and trigger React to render the component again.

### Adding a state variable

To add a state variable, import `useState` from React at the top of the file:

```js
import { useState } from 'react';
```

Then, replace this line:

```js
let index = 0;
```

with

```js
const [index, setIndex] = useState(0);
```

`index` is a state variable and `setIndex` is the setter function.

> The `[` and `]` syntax here is called [array destructuring](https://javascript.info/destructuring-assignment) and it lets you read values from an array. The array returned by `useState` always has exactly two items.

This is how they work together in `handleClick`:

```js
function handleClick() {
  setIndex(index + 1);
}
```

Now clicking the "Next" button switches the current sculpture:

```js
import { useState } from 'react';
import { sculptureList } from './data.js';

export default function Gallery() {
  const [index, setIndex] = useState(0);

  function handleClick() {
    setIndex(index + 1);
  }

  let sculpture = sculptureList[index];
  return (
    <>
      <button onClick={handleClick}>
        Next
      </button>
      <h2>
        <i>{sculpture.name} </i>
        by {sculpture.artist}
      </h2>
      <h3>
        ({index + 1} of {sculptureList.length})
      </h3>
      <img
        src={sculpture.url}
        alt={sculpture.alt}
      />
      <p>
        {sculpture.description}
      </p>
    </>
  );
}
```

```js
export const sculptureList = [{
  name: 'Homenaje a la Neurocirugía',
  artist: 'Marta Colvin Andrade',
  description: 'Although Colvin is predominantly known for abstract themes that allude to pre-Hispanic symbols, this gigantic sculpture, an homage to neurosurgery, is one of her most recognizable public art pieces.',
  url: 'https://react.dev/images/docs/scientists/Mx7dA2Y.jpg',
  alt: 'A bronze statue of two crossed hands delicately holding a human brain in their fingertips.'
}, {
  name: 'Floralis Genérica',
  artist: 'Eduardo Catalano',
  description: 'This enormous (75 ft. or 23m) silver flower is located in Buenos Aires. It is designed to move, closing its petals in the evening or when strong winds blow and opening them in the morning.',
  url: 'https://react.dev/images/docs/scientists/ZF6s192m.jpg',
  alt: 'A gigantic metallic flower sculpture with reflective mirror-like petals and strong stamens.'
}, {
  name: 'Eternal Presence',
  artist: 'John Woodrow Wilson',
  description: 'Wilson was known for his preoccupation with equality, social justice, as well as the essential and spiritual qualities of humankind. This massive (7ft. or 2,13m) bronze represents what he described as "a symbolic Black presence infused with a sense of universal humanity."',
  url: 'https://react.dev/images/docs/scientists/aTtVpES.jpg',
  alt: 'The sculpture depicting a human head seems ever-present and solemn. It radiates calm and serenity.'
}, {
  name: 'Moai',
  artist: 'Unknown Artist',
  description: 'Located on the Easter Island, there are 1,000 moai, or extant monumental statues, created by the early Rapa Nui people, which some believe represented deified ancestors.',
  url: 'https://react.dev/images/docs/scientists/RCwLEoQm.jpg',
  alt: 'Three monumental stone busts with the heads that are disproportionately large with somber faces.'
}, {
  name: 'Blue Nana',
  artist: 'Niki de Saint Phalle',
  description: 'The Nanas are triumphant creatures, symbols of femininity and maternity. Initially, Saint Phalle used fabric and found objects for the Nanas, and later on introduced polyester to achieve a more vibrant effect.',
  url: 'https://react.dev/images/docs/scientists/Sd1AgUOm.jpg',
  alt: 'A large mosaic sculpture of a whimsical dancing female figure in a colorful costume emanating joy.'
}, {
  name: 'Ultimate Form',
  artist: 'Barbara Hepworth',
  description: 'This abstract bronze sculpture is a part of The Family of Man series located at Yorkshire Sculpture Park. Hepworth chose not to create literal representations of the world but developed abstract forms inspired by people and landscapes.',
  url: 'https://react.dev/images/docs/scientists/2heNQDcm.jpg',
  alt: 'A tall sculpture made of three elements stacked on each other reminding of a human figure.'
}, {
  name: 'Cavaliere',
  artist: 'Lamidi Olonade Fakeye',
  description: "Descended from four generations of woodcarvers, Fakeye's work blended traditional and contemporary Yoruba themes.",
  url: 'https://react.dev/images/docs/scientists/wIdGuZwm.png',
  alt: 'An intricate wood sculpture of a warrior with a focused face on a horse adorned with patterns.'
}, {
  name: 'Big Bellies',
  artist: 'Alina Szapocznikow',
  description: "Szapocznikow is known for her sculptures of the fragmented body as a metaphor for the fragility and impermanence of youth and beauty. This sculpture depicts two very realistic large bellies stacked on top of each other, each around five feet (1,5m) tall.",
  url: 'https://react.dev/images/docs/scientists/AlHTAdDm.jpg',
  alt: 'The sculpture reminds a cascade of folds, quite different from bellies in classical sculptures.'
}, {
  name: 'Terracotta Army',
  artist: 'Unknown Artist',
  description: 'The Terracotta Army is a collection of terracotta sculptures depicting the armies of Qin Shi Huang, the first Emperor of China. The army consisted of more than 8,000 soldiers, 130 chariots with 520 horses, and 150 cavalry horses.',
  url: 'https://react.dev/images/docs/scientists/HMFmH6m.jpg',
  alt: '12 terracotta sculptures of solemn warriors, each with a unique facial expression and armor.'
}, {
  name: 'Lunar Landscape',
  artist: 'Louise Nevelson',
  description: 'Nevelson was known for scavenging objects from New York City debris, which she would later assemble into monumental constructions. In this one, she used disparate parts like a bedpost, juggling pin, and seat fragment, nailing and gluing them into boxes that reflect the influence of Cubism’s geometric abstraction of space and form.',
  url: 'https://react.dev/images/docs/scientists/rN7hY6om.jpg',
  alt: 'A black matte sculpture where the individual elements are initially indistinguishable.'
}, {
  name: 'Aureole',
  artist: 'Ranjani Shettar',
  description: 'Shettar merges the traditional and the modern, the natural and the industrial. Her art focuses on the relationship between man and nature. Her work was described as compelling both abstractly and figuratively, gravity defying, and a "fine synthesis of unlikely materials."',
  url: 'https://react.dev/images/docs/scientists/okTpbHhm.jpg',
  alt: 'A pale wire-like sculpture mounted on concrete wall and descending on the floor. It appears light.'
}, {
  name: 'Hippos',
  artist: 'Taipei Zoo',
  description: 'The Taipei Zoo commissioned a Hippo Square featuring submerged hippos at play.',
  url: 'https://react.dev/images/docs/scientists/6o5Vuyu.jpg',
  alt: 'A group of bronze hippo sculptures emerging from the sett sidewalk as if they were swimming.'
}];
```

```css
h2 { margin-top: 10px; margin-bottom: 0; }
h3 {
 margin-top: 5px;
 font-weight: normal;
 font-size: 100%;
}
img { width: 120px; height: 120px; }
button {
  display: block;
  margin-top: 10px;
  margin-bottom: 10px;
}
```

#### Meet your first Hook

In React, `useState`, as well as any other function starting with "`use`", is called a Hook.

*Hooks* are special functions that are only available while React is [rendering](https://react.dev/learn/render-and-commit#step-1-trigger-a-render) (which we'll get into in more detail on the next page). They let you "hook into" different React features.

State is just one of those features, but you will meet the other Hooks later.

**Hooks—functions starting with `use`—can only be called at the top level of your components or [your own Hooks.](https://react.dev/learn/reusing-logic-with-custom-hooks)** You can't call Hooks inside conditions, loops, or other nested functions. Hooks are functions, but it's helpful to think of them as unconditional declarations about your component's needs. You "use" React features at the top of your component similar to how you "import" modules at the top of your file.

#### Anatomy of `useState`

When you call [`useState`](https://react.dev/reference/react/useState), you are telling React that you want this component to remember something:

```js
const [index, setIndex] = useState(0);
```

In this case, you want React to remember `index`.

The convention is to name this pair like `const [something, setSomething]`. You could name it anything you like, but conventions make things easier to understand across projects.

The only argument to `useState` is the **initial value** of your state variable. In this example, the `index`'s initial value is set to `0` with `useState(0)`.

Every time your component renders, `useState` gives you an array containing two values:

1. The **state variable** (`index`) with the value you stored.
2. The **state setter function** (`setIndex`) which can update the state variable and trigger React to render the component again.

Here's how that happens in action:

```js
const [index, setIndex] = useState(0);
```

1. **Your component renders the first time.** Because you passed `0` to `useState` as the initial value for `index`, it will return `[0, setIndex]`. React remembers `0` is the latest state value.
2. **You update the state.** When a user clicks the button, it calls `setIndex(index + 1)`. `index` is `0`, so it's `setIndex(1)`. This tells React to remember `index` is `1` now and triggers another render.
3. **Your component's second render.** React still sees `useState(0)`, but because React *remembers* that you set `index` to `1`, it returns `[1, setIndex]` instead.
4. And so on!

### Giving a component multiple state variables

You can have as many state variables of as many types as you like in one component. This component has two state variables, a number `index` and a boolean `showMore` that's toggled when you click "Show details":

```js
import { useState } from 'react';
import { sculptureList } from './data.js';

export default function Gallery() {
  const [index, setIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  function handleNextClick() {
    setIndex(index + 1);
  }

  function handleMoreClick() {
    setShowMore(!showMore);
  }

  let sculpture = sculptureList[index];
  return (
    <>
      <button onClick={handleNextClick}>
        Next
      </button>
      <h2>
        <i>{sculpture.name} </i>
        by {sculpture.artist}
      </h2>
      <h3>
        ({index + 1} of {sculptureList.length})
      </h3>
      <button onClick={handleMoreClick}>
        {showMore ? 'Hide' : 'Show'} details
      </button>
      {showMore && <p>{sculpture.description}</p>}
      <img
        src={sculpture.url}
        alt={sculpture.alt}
      />
    </>
  );
}
```

```js
export const sculptureList = [{
  name: 'Homenaje a la Neurocirugía',
  artist: 'Marta Colvin Andrade',
  description: 'Although Colvin is predominantly known for abstract themes that allude to pre-Hispanic symbols, this gigantic sculpture, an homage to neurosurgery, is one of her most recognizable public art pieces.',
  url: 'https://react.dev/images/docs/scientists/Mx7dA2Y.jpg',
  alt: 'A bronze statue of two crossed hands delicately holding a human brain in their fingertips.'
}, {
  name: 'Floralis Genérica',
  artist: 'Eduardo Catalano',
  description: 'This enormous (75 ft. or 23m) silver flower is located in Buenos Aires. It is designed to move, closing its petals in the evening or when strong winds blow and opening them in the morning.',
  url: 'https://react.dev/images/docs/scientists/ZF6s192m.jpg',
  alt: 'A gigantic metallic flower sculpture with reflective mirror-like petals and strong stamens.'
}, {
  name: 'Eternal Presence',
  artist: 'John Woodrow Wilson',
  description: 'Wilson was known for his preoccupation with equality, social justice, as well as the essential and spiritual qualities of humankind. This massive (7ft. or 2,13m) bronze represents what he described as "a symbolic Black presence infused with a sense of universal humanity."',
  url: 'https://react.dev/images/docs/scientists/aTtVpES.jpg',
  alt: 'The sculpture depicting a human head seems ever-present and solemn. It radiates calm and serenity.'
}, {
  name: 'Moai',
  artist: 'Unknown Artist',
  description: 'Located on the Easter Island, there are 1,000 moai, or extant monumental statues, created by the early Rapa Nui people, which some believe represented deified ancestors.',
  url: 'https://react.dev/images/docs/scientists/RCwLEoQm.jpg',
  alt: 'Three monumental stone busts with the heads that are disproportionately large with somber faces.'
}, {
  name: 'Blue Nana',
  artist: 'Niki de Saint Phalle',
  description: 'The Nanas are triumphant creatures, symbols of femininity and maternity. Initially, Saint Phalle used fabric and found objects for the Nanas, and later on introduced polyester to achieve a more vibrant effect.',
  url: 'https://react.dev/images/docs/scientists/Sd1AgUOm.jpg',
  alt: 'A large mosaic sculpture of a whimsical dancing female figure in a colorful costume emanating joy.'
}, {
  name: 'Ultimate Form',
  artist: 'Barbara Hepworth',
  description: 'This abstract bronze sculpture is a part of The Family of Man series located at Yorkshire Sculpture Park. Hepworth chose not to create literal representations of the world but developed abstract forms inspired by people and landscapes.',
  url: 'https://react.dev/images/docs/scientists/2heNQDcm.jpg',
  alt: 'A tall sculpture made of three elements stacked on each other reminding of a human figure.'
}, {
  name: 'Cavaliere',
  artist: 'Lamidi Olonade Fakeye',
  description: "Descended from four generations of woodcarvers, Fakeye's work blended traditional and contemporary Yoruba themes.",
  url: 'https://react.dev/images/docs/scientists/wIdGuZwm.png',
  alt: 'An intricate wood sculpture of a warrior with a focused face on a horse adorned with patterns.'
}, {
  name: 'Big Bellies',
  artist: 'Alina Szapocznikow',
  description: "Szapocznikow is known for her sculptures of the fragmented body as a metaphor for the fragility and impermanence of youth and beauty. This sculpture depicts two very realistic large bellies stacked on top of each other, each around five feet (1,5m) tall.",
  url: 'https://react.dev/images/docs/scientists/AlHTAdDm.jpg',
  alt: 'The sculpture reminds a cascade of folds, quite different from bellies in classical sculptures.'
}, {
  name: 'Terracotta Army',
  artist: 'Unknown Artist',
  description: 'The Terracotta Army is a collection of terracotta sculptures depicting the armies of Qin Shi Huang, the first Emperor of China. The army consisted of more than 8,000 soldiers, 130 chariots with 520 horses, and 150 cavalry horses.',
  url: 'https://react.dev/images/docs/scientists/HMFmH6m.jpg',
  alt: '12 terracotta sculptures of solemn warriors, each with a unique facial expression and armor.'
}, {
  name: 'Lunar Landscape',
  artist: 'Louise Nevelson',
  description: 'Nevelson was known for scavenging objects from New York City debris, which she would later assemble into monumental constructions. In this one, she used disparate parts like a bedpost, juggling pin, and seat fragment, nailing and gluing them into boxes that reflect the influence of Cubism’s geometric abstraction of space and form.',
  url: 'https://react.dev/images/docs/scientists/rN7hY6om.jpg',
  alt: 'A black matte sculpture where the individual elements are initially indistinguishable.'
}, {
  name: 'Aureole',
  artist: 'Ranjani Shettar',
  description: 'Shettar merges the traditional and the modern, the natural and the industrial. Her art focuses on the relationship between man and nature. Her work was described as compelling both abstractly and figuratively, gravity defying, and a "fine synthesis of unlikely materials."',
  url: 'https://react.dev/images/docs/scientists/okTpbHhm.jpg',
  alt: 'A pale wire-like sculpture mounted on concrete wall and descending on the floor. It appears light.'
}, {
  name: 'Hippos',
  artist: 'Taipei Zoo',
  description: 'The Taipei Zoo commissioned a Hippo Square featuring submerged hippos at play.',
  url: 'https://react.dev/images/docs/scientists/6o5Vuyu.jpg',
  alt: 'A group of bronze hippo sculptures emerging from the sett sidewalk as if they were swimming.'
}];
```

```css
h2 { margin-top: 10px; margin-bottom: 0; }
h3 {
 margin-top: 5px;
 font-weight: normal;
 font-size: 100%;
}
img { width: 120px; height: 120px; }
button {
  display: block;
  margin-top: 10px;
  margin-bottom: 10px;
}
```

It is a good idea to have multiple state variables if their state is unrelated, like `index` and `showMore` in this example. But if you find that you often change two state variables together, it might be easier to combine them into one. For example, if you have a form with many fields, it's more convenient to have a single state variable that holds an object than state variable per field. Read [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) for more tips.

##### How does React know which state to return?

You might have noticed that the `useState` call does not receive any information about *which* state variable it refers to. There is no "identifier" that is passed to `useState`, so how does it know which of the state variables to return? Does it rely on some magic like parsing your functions? The answer is no.

Instead, to enable their concise syntax, Hooks **rely on a stable call order on every render of the same component.** This works well in practice because if you follow the rule above ("only call Hooks at the top level"), Hooks will always be called in the same order. Additionally, a [linter plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks) catches most mistakes.

Internally, React holds an array of state pairs for every component. It also maintains the current pair index, which is set to `0` before rendering. Each time you call `useState`, React gives you the next state pair and increments the index. You can read more about this mechanism in [React Hooks: Not Magic, Just Arrays.](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e)

This example **doesn't use React** but it gives you an idea of how `useState` works internally:

```js
let componentHooks = [];
let currentHookIndex = 0;

// How useState works inside React (simplified).
function useState(initialState) {
  let pair = componentHooks[currentHookIndex];
  if (pair) {
    // This is not the first render,
    // so the state pair already exists.
    // Return it and prepare for next Hook call.
    currentHookIndex++;
    return pair;
  }

  // This is the first time we're rendering,
  // so create a state pair and store it.
  pair = [initialState, setState];

  function setState(nextState) {
    // When the user requests a state change,
    // put the new value into the pair.
    pair[0] = nextState;
    updateDOM();
  }

  // Store the pair for future renders
  // and prepare for the next Hook call.
  componentHooks[currentHookIndex] = pair;
  currentHookIndex++;
  return pair;
}

function Gallery() {
  // Each useState() call will get the next pair.
  const [index, setIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  function handleNextClick() {
    setIndex(index + 1);
  }

  function handleMoreClick() {
    setShowMore(!showMore);
  }

  let sculpture = sculptureList[index];
  // This example doesn't use React, so
  // return an output object instead of JSX.
  return {
    onNextClick: handleNextClick,
    onMoreClick: handleMoreClick,
    header: `${sculpture.name} by ${sculpture.artist}`,
    counter: `${index + 1} of ${sculptureList.length}`,
    more: `${showMore ? 'Hide' : 'Show'} details`,
    description: showMore ? sculpture.description : null,
    imageSrc: sculpture.url,
    imageAlt: sculpture.alt
  };
}

function updateDOM() {
  // Reset the current Hook index
  // before rendering the component.
  currentHookIndex = 0;
  let output = Gallery();

  // Update the DOM to match the output.
  // This is the part React does for you.
  nextButton.onclick = output.onNextClick;
  header.textContent = output.header;
  moreButton.onclick = output.onMoreClick;
  moreButton.textContent = output.more;
  image.src = output.imageSrc;
  image.alt = output.imageAlt;
  if (output.description !== null) {
    description.textContent = output.description;
    description.style.display = '';
  } else {
    description.style.display = 'none';
  }
}

let nextButton = document.getElementById('nextButton');
let header = document.getElementById('header');
let moreButton = document.getElementById('moreButton');
let description = document.getElementById('description');
let image = document.getElementById('image');
let sculptureList = [{
  name: 'Homenaje a la Neurocirugía',
  artist: 'Marta Colvin Andrade',
  description: 'Although Colvin is predominantly known for abstract themes that allude to pre-Hispanic symbols, this gigantic sculpture, an homage to neurosurgery, is one of her most recognizable public art pieces.',
  url: 'https://react.dev/images/docs/scientists/Mx7dA2Y.jpg',
  alt: 'A bronze statue of two crossed hands delicately holding a human brain in their fingertips.'
}, {
  name: 'Floralis Genérica',
  artist: 'Eduardo Catalano',
  description: 'This enormous (75 ft. or 23m) silver flower is located in Buenos Aires. It is designed to move, closing its petals in the evening or when strong winds blow and opening them in the morning.',
  url: 'https://react.dev/images/docs/scientists/ZF6s192m.jpg',
  alt: 'A gigantic metallic flower sculpture with reflective mirror-like petals and strong stamens.'
}, {
  name: 'Eternal Presence',
  artist: 'John Woodrow Wilson',
  description: 'Wilson was known for his preoccupation with equality, social justice, as well as the essential and spiritual qualities of humankind. This massive (7ft. or 2,13m) bronze represents what he described as "a symbolic Black presence infused with a sense of universal humanity."',
  url: 'https://react.dev/images/docs/scientists/aTtVpES.jpg',
  alt: 'The sculpture depicting a human head seems ever-present and solemn. It radiates calm and serenity.'
}, {
  name: 'Moai',
  artist: 'Unknown Artist',
  description: 'Located on the Easter Island, there are 1,000 moai, or extant monumental statues, created by the early Rapa Nui people, which some believe represented deified ancestors.',
  url: 'https://react.dev/images/docs/scientists/RCwLEoQm.jpg',
  alt: 'Three monumental stone busts with the heads that are disproportionately large with somber faces.'
}, {
  name: 'Blue Nana',
  artist: 'Niki de Saint Phalle',
  description: 'The Nanas are triumphant creatures, symbols of femininity and maternity. Initially, Saint Phalle used fabric and found objects for the Nanas, and later on introduced polyester to achieve a more vibrant effect.',
  url: 'https://react.dev/images/docs/scientists/Sd1AgUOm.jpg',
  alt: 'A large mosaic sculpture of a whimsical dancing female figure in a colorful costume emanating joy.'
}, {
  name: 'Ultimate Form',
  artist: 'Barbara Hepworth',
  description: 'This abstract bronze sculpture is a part of The Family of Man series located at Yorkshire Sculpture Park. Hepworth chose not to create literal representations of the world but developed abstract forms inspired by people and landscapes.',
  url: 'https://react.dev/images/docs/scientists/2heNQDcm.jpg',
  alt: 'A tall sculpture made of three elements stacked on each other reminding of a human figure.'
}, {
  name: 'Cavaliere',
  artist: 'Lamidi Olonade Fakeye',
  description: "Descended from four generations of woodcarvers, Fakeye's work blended traditional and contemporary Yoruba themes.",
  url: 'https://react.dev/images/docs/scientists/wIdGuZwm.png',
  alt: 'An intricate wood sculpture of a warrior with a focused face on a horse adorned with patterns.'
}, {
  name: 'Big Bellies',
  artist: 'Alina Szapocznikow',
  description: "Szapocznikow is known for her sculptures of the fragmented body as a metaphor for the fragility and impermanence of youth and beauty. This sculpture depicts two very realistic large bellies stacked on top of each other, each around five feet (1,5m) tall.",
  url: 'https://react.dev/images/docs/scientists/AlHTAdDm.jpg',
  alt: 'The sculpture reminds a cascade of folds, quite different from bellies in classical sculptures.'
}, {
  name: 'Terracotta Army',
  artist: 'Unknown Artist',
  description: 'The Terracotta Army is a collection of terracotta sculptures depicting the armies of Qin Shi Huang, the first Emperor of China. The army consisted of more than 8,000 soldiers, 130 chariots with 520 horses, and 150 cavalry horses.',
  url: 'https://react.dev/images/docs/scientists/HMFmH6m.jpg',
  alt: '12 terracotta sculptures of solemn warriors, each with a unique facial expression and armor.'
}, {
  name: 'Lunar Landscape',
  artist: 'Louise Nevelson',
  description: 'Nevelson was known for scavenging objects from New York City debris, which she would later assemble into monumental constructions. In this one, she used disparate parts like a bedpost, juggling pin, and seat fragment, nailing and gluing them into boxes that reflect the influence of Cubism’s geometric abstraction of space and form.',
  url: 'https://react.dev/images/docs/scientists/rN7hY6om.jpg',
  alt: 'A black matte sculpture where the individual elements are initially indistinguishable.'
}, {
  name: 'Aureole',
  artist: 'Ranjani Shettar',
  description: 'Shettar merges the traditional and the modern, the natural and the industrial. Her art focuses on the relationship between man and nature. Her work was described as compelling both abstractly and figuratively, gravity defying, and a "fine synthesis of unlikely materials."',
  url: 'https://react.dev/images/docs/scientists/okTpbHhm.jpg',
  alt: 'A pale wire-like sculpture mounted on concrete wall and descending on the floor. It appears light.'
}, {
  name: 'Hippos',
  artist: 'Taipei Zoo',
  description: 'The Taipei Zoo commissioned a Hippo Square featuring submerged hippos at play.',
  url: 'https://react.dev/images/docs/scientists/6o5Vuyu.jpg',
  alt: 'A group of bronze hippo sculptures emerging from the sett sidewalk as if they were swimming.'
}];

// Make UI match the initial state.
updateDOM();
```

```html
<button id="nextButton">
  Next
</button>
<h3 id="header"></h3>
<button id="moreButton"></button>
<p id="description"></p>
<img id="image">

<style>
* { box-sizing: border-box; }
body { font-family: sans-serif; margin: 20px; padding: 0; }
button { display: block; margin-bottom: 10px; }
</style>
```

```css
button { display: block; margin-bottom: 10px; }
```

You don't have to understand it to use React, but you might find this a helpful mental model.

### State is isolated and private

State is local to a component instance on the screen. In other words, **if you render the same component twice, each copy will have completely isolated state!** Changing one of them will not affect the other.

In this example, the `Gallery` component from earlier is rendered twice with no changes to its logic. Try clicking the buttons inside each of the galleries. Notice that their state is independent:

```js
import Gallery from './Gallery.js';

export default function Page() {
  return (
    <div className="Page">
      <Gallery />
      <Gallery />
    </div>
  );
}

```

```js
import { useState } from 'react';
import { sculptureList } from './data.js';

export default function Gallery() {
  const [index, setIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  function handleNextClick() {
    setIndex(index + 1);
  }

  function handleMoreClick() {
    setShowMore(!showMore);
  }

  let sculpture = sculptureList[index];
  return (
    <section>
      <button onClick={handleNextClick}>
        Next
      </button>
      <h2>
        <i>{sculpture.name} </i>
        by {sculpture.artist}
      </h2>
      <h3>
        ({index + 1} of {sculptureList.length})
      </h3>
      <button onClick={handleMoreClick}>
        {showMore ? 'Hide' : 'Show'} details
      </button>
      {showMore && <p>{sculpture.description}</p>}
      <img
        src={sculpture.url}
        alt={sculpture.alt}
      />
    </section>
  );
}
```

```js
export const sculptureList = [{
  name: 'Homenaje a la Neurocirugía',
  artist: 'Marta Colvin Andrade',
  description: 'Although Colvin is predominantly known for abstract themes that allude to pre-Hispanic symbols, this gigantic sculpture, an homage to neurosurgery, is one of her most recognizable public art pieces.',
  url: 'https://react.dev/images/docs/scientists/Mx7dA2Y.jpg',
  alt: 'A bronze statue of two crossed hands delicately holding a human brain in their fingertips.'
}, {
  name: 'Floralis Genérica',
  artist: 'Eduardo Catalano',
  description: 'This enormous (75 ft. or 23m) silver flower is located in Buenos Aires. It is designed to move, closing its petals in the evening or when strong winds blow and opening them in the morning.',
  url: 'https://react.dev/images/docs/scientists/ZF6s192m.jpg',
  alt: 'A gigantic metallic flower sculpture with reflective mirror-like petals and strong stamens.'
}, {
  name: 'Eternal Presence',
  artist: 'John Woodrow Wilson',
  description: 'Wilson was known for his preoccupation with equality, social justice, as well as the essential and spiritual qualities of humankind. This massive (7ft. or 2,13m) bronze represents what he described as "a symbolic Black presence infused with a sense of universal humanity."',
  url: 'https://react.dev/images/docs/scientists/aTtVpES.jpg',
  alt: 'The sculpture depicting a human head seems ever-present and solemn. It radiates calm and serenity.'
}, {
  name: 'Moai',
  artist: 'Unknown Artist',
  description: 'Located on the Easter Island, there are 1,000 moai, or extant monumental statues, created by the early Rapa Nui people, which some believe represented deified ancestors.',
  url: 'https://react.dev/images/docs/scientists/RCwLEoQm.jpg',
  alt: 'Three monumental stone busts with the heads that are disproportionately large with somber faces.'
}, {
  name: 'Blue Nana',
  artist: 'Niki de Saint Phalle',
  description: 'The Nanas are triumphant creatures, symbols of femininity and maternity. Initially, Saint Phalle used fabric and found objects for the Nanas, and later on introduced polyester to achieve a more vibrant effect.',
  url: 'https://react.dev/images/docs/scientists/Sd1AgUOm.jpg',
  alt: 'A large mosaic sculpture of a whimsical dancing female figure in a colorful costume emanating joy.'
}, {
  name: 'Ultimate Form',
  artist: 'Barbara Hepworth',
  description: 'This abstract bronze sculpture is a part of The Family of Man series located at Yorkshire Sculpture Park. Hepworth chose not to create literal representations of the world but developed abstract forms inspired by people and landscapes.',
  url: 'https://react.dev/images/docs/scientists/2heNQDcm.jpg',
  alt: 'A tall sculpture made of three elements stacked on each other reminding of a human figure.'
}, {
  name: 'Cavaliere',
  artist: 'Lamidi Olonade Fakeye',
  description: "Descended from four generations of woodcarvers, Fakeye's work blended traditional and contemporary Yoruba themes.",
  url: 'https://react.dev/images/docs/scientists/wIdGuZwm.png',
  alt: 'An intricate wood sculpture of a warrior with a focused face on a horse adorned with patterns.'
}, {
  name: 'Big Bellies',
  artist: 'Alina Szapocznikow',
  description: "Szapocznikow is known for her sculptures of the fragmented body as a metaphor for the fragility and impermanence of youth and beauty. This sculpture depicts two very realistic large bellies stacked on top of each other, each around five feet (1,5m) tall.",
  url: 'https://react.dev/images/docs/scientists/AlHTAdDm.jpg',
  alt: 'The sculpture reminds a cascade of folds, quite different from bellies in classical sculptures.'
}, {
  name: 'Terracotta Army',
  artist: 'Unknown Artist',
  description: 'The Terracotta Army is a collection of terracotta sculptures depicting the armies of Qin Shi Huang, the first Emperor of China. The army consisted of more than 8,000 soldiers, 130 chariots with 520 horses, and 150 cavalry horses.',
  url: 'https://react.dev/images/docs/scientists/HMFmH6m.jpg',
  alt: '12 terracotta sculptures of solemn warriors, each with a unique facial expression and armor.'
}, {
  name: 'Lunar Landscape',
  artist: 'Louise Nevelson',
  description: 'Nevelson was known for scavenging objects from New York City debris, which she would later assemble into monumental constructions. In this one, she used disparate parts like a bedpost, juggling pin, and seat fragment, nailing and gluing them into boxes that reflect the influence of Cubism’s geometric abstraction of space and form.',
  url: 'https://react.dev/images/docs/scientists/rN7hY6om.jpg',
  alt: 'A black matte sculpture where the individual elements are initially indistinguishable.'
}, {
  name: 'Aureole',
  artist: 'Ranjani Shettar',
  description: 'Shettar merges the traditional and the modern, the natural and the industrial. Her art focuses on the relationship between man and nature. Her work was described as compelling both abstractly and figuratively, gravity defying, and a "fine synthesis of unlikely materials."',
  url: 'https://react.dev/images/docs/scientists/okTpbHhm.jpg',
  alt: 'A pale wire-like sculpture mounted on concrete wall and descending on the floor. It appears light.'
}, {
  name: 'Hippos',
  artist: 'Taipei Zoo',
  description: 'The Taipei Zoo commissioned a Hippo Square featuring submerged hippos at play.',
  url: 'https://react.dev/images/docs/scientists/6o5Vuyu.jpg',
  alt: 'A group of bronze hippo sculptures emerging from the sett sidewalk as if they were swimming.'
}];
```

```css
button { display: block; margin-bottom: 10px; }
.Page > * {
  float: left;
  width: 50%;
  padding: 10px;
}
h2 { margin-top: 10px; margin-bottom: 0; }
h3 {
  margin-top: 5px;
  font-weight: normal;
  font-size: 100%;
}
img { width: 120px; height: 120px; }
button {
  display: block;
  margin-top: 10px;
  margin-bottom: 10px;
}
```

This is what makes state different from regular variables that you might declare at the top of your module. State is not tied to a particular function call or a place in the code, but it's "local" to the specific place on the screen. You rendered two `` components, so their state is stored separately.

Also notice how the `Page` component doesn't "know" anything about the `Gallery` state or even whether it has any. Unlike props, **state is fully private to the component declaring it.** The parent component can't change it. This lets you add state to any component or remove it without impacting the rest of the components.

What if you wanted both galleries to keep their states in sync? The right way to do it in React is to *remove* state from child components and add it to their closest shared parent. The next few pages will focus on organizing state of a single component, but we will return to this topic in [Sharing State Between Components.](https://react.dev/learn/sharing-state-between-components)

* Use a state variable when a component needs to "remember" some information between renders.
* State variables are declared by calling the `useState` Hook.
* Hooks are special functions that start with `use`. They let you "hook into" React features like state.
* Hooks might remind you of imports: they need to be called unconditionally. Calling Hooks, including `useState`, is only valid at the top level of a component or another Hook.
* The `useState` Hook returns a pair of values: the current state and the function to update it.
* You can have more than one state variable. Internally, React matches them up by their order.
* State is private to the component. If you render it in two places, each copy gets its own state.

## Render and Commit

> **Source:** [Render and Commit](https://react.dev/learn/render-and-commit) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

Before your components are displayed on screen, they must be rendered by React. Understanding the steps in this process will help you think about how your code executes and explain its behavior.

* What rendering means in React
* When and why React renders a component
* The steps involved in displaying a component on screen
* Why rendering does not always produce a DOM update

Imagine that your components are cooks in the kitchen, assembling tasty dishes from ingredients. In this scenario, React is the waiter who puts in requests from customers and brings them their orders. This process of requesting and serving UI has three steps:

1. **Triggering** a render (delivering the guest's order to the kitchen)
2. **Rendering** the component (preparing the order in the kitchen)
3. **Committing** to the DOM (placing the order on the table)

### Step 1: Trigger a render

There are two reasons for a component to render:

1. It's the component's **initial render.**
2. The component's (or one of its ancestors') **state has been updated.**

#### Initial render

When your app starts, you need to trigger the initial render. Frameworks and sandboxes sometimes hide this code, but it's done by calling [`createRoot`](https://react.dev/reference/react-dom/client/createRoot) with the target DOM node, and then calling its `render` method with your component:

```js
import Image from './Image.js';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'))
root.render(<Image />);
```

```js
export default function Image() {
  return (
    <img
      src="https://react.dev/images/docs/scientists/ZF6s192.jpg"
      alt="'Floralis Genérica' by Eduardo Catalano: a gigantic metallic flower sculpture with reflective petals"
    />
  );
}
```

Try commenting out the `root.render()` call and see the component disappear!

#### Re-renders when state updates

Once the component has been initially rendered, you can trigger further renders by updating its state with the [`set` function.](https://react.dev/reference/react/useState#setstate) Updating your component's state automatically queues a render. (You can imagine these as a restaurant guest ordering tea, dessert, and all sorts of things after putting in their first order, depending on the state of their thirst or hunger.)

### Step 2: React renders your components

After you trigger a render, React calls your components to figure out what to display on screen. **"Rendering" is React calling your components.**

* **On initial render,** React will call the root component.
* **For subsequent renders,** React will call the function component whose state update triggered the render.

This process is recursive: if the updated component returns some other component, React will render _that_ component next, and if that component also returns something, it will render _that_ component next, and so on. The process will continue until there are no more nested components and React knows exactly what should be displayed on screen.

In the following example, React will call `Gallery()` and `Image()` several times:

```js
export default function Gallery() {
  return (
    <section>
      <h1>Inspiring Sculptures</h1>
      <Image />
      <Image />
      <Image />
    </section>
  );
}

function Image() {
  return (
    <img
      src="https://react.dev/images/docs/scientists/ZF6s192.jpg"
      alt="'Floralis Genérica' by Eduardo Catalano: a gigantic metallic flower sculpture with reflective petals"
    />
  );
}
```

```js
import Gallery from './Gallery.js';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'))
root.render(<Gallery />);
```

```css
img { margin: 0 10px 10px 0; }
```

* **During the initial render,** React will [create the DOM nodes](https://developer.mozilla.org/docs/Web/API/Document/createElement) for `<section>`, `<h1>`, and three `<img>` tags.
* **During a re-render,** React will calculate which of their properties, if any, have changed since the previous render. It won't do anything with that information until the next step, the commit phase.

Rendering must always be a [pure calculation](https://react.dev/learn/keeping-components-pure):

* **Same inputs, same output.** Given the same inputs, a component should always return the same JSX. (When someone orders a salad with tomatoes, they should not receive a salad with onions!)
* **It minds its own business.** It should not change any objects or variables that existed before rendering. (One order should not change anyone else's order.)

Otherwise, you can encounter confusing bugs and unpredictable behavior as your codebase grows in complexity. When developing in "Strict Mode", React calls each component's function twice, which can help surface mistakes caused by impure functions.

##### Optimizing performance

The default behavior of rendering all components nested within the updated component is not optimal for performance if the updated component is very high in the tree. If you run into a performance issue, there are several opt-in ways to solve it described in the [Performance](https://reactjs.org/docs/optimizing-performance.html) section. **Don't optimize prematurely!**

### Step 3: React commits changes to the DOM

After rendering (calling) your components, React will modify the DOM.

* **For the initial render,** React will use the [`appendChild()`](https://developer.mozilla.org/docs/Web/API/Node/appendChild) DOM API to put all the DOM nodes it has created on screen.
* **For re-renders,** React will apply the minimal necessary operations (calculated while rendering!) to make the DOM match the latest rendering output.

**React only changes the DOM nodes if there's a difference between renders.** For example, here is a component that re-renders with different props passed from its parent every second. Notice how you can add some text into the `<input>`, updating its `value`, but the text doesn't disappear when the component re-renders:

```js
export default function Clock({ time }) {
  return (
    <>
      <h1>{time}</h1>
      <input />
    </>
  );
}
```

```js
import { useState, useEffect } from 'react';
import Clock from './Clock.js';

function useTime() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function App() {
  const time = useTime();
  return (
    <Clock time={time.toLocaleTimeString()} />
  );
}
```

This works because during this last step, React only updates the content of `<h1>` with the new `time`. It sees that the `<input>` appears in the JSX in the same place as last time, so React doesn't touch the `<input>`—or its `value`!
### Epilogue: Browser paint

After rendering is done and React updated the DOM, the browser will repaint the screen. Although this process is known as "browser rendering", we'll refer to it as "painting" to avoid confusion throughout the docs.

* Any screen update in a React app happens in three steps:
  1. Trigger
  2. Render
  3. Commit
* You can use Strict Mode to find mistakes in your components
* React does not touch the DOM if the rendering result is the same as last time

## State as a Snapshot

> **Source:** [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

State variables might look like regular JavaScript variables that you can read and write to. However, state behaves more like a snapshot. Setting it does not change the state variable you already have, but instead triggers a re-render.

* How setting state triggers re-renders
* When and how state updates
* Why state does not update immediately after you set it
* How event handlers access a "snapshot" of the state

### Setting state triggers renders

You might think of your user interface as changing directly in response to the user event like a click. In React, it works a little differently from this mental model. On the previous page, you saw that [setting state requests a re-render](https://react.dev/learn/render-and-commit#step-1-trigger-a-render) from React. This means that for an interface to react to the event, you need to *update the state*.

In this example, when you press "send", `setIsSent(true)` tells React to re-render the UI:

```js
import { useState } from 'react';

export default function Form() {
  const [isSent, setIsSent] = useState(false);
  const [message, setMessage] = useState('Hi!');
  if (isSent) {
    return <h1>Your message is on its way!</h1>
  }
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      setIsSent(true);
      sendMessage(message);
    }}>
      <textarea
        placeholder="Message"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}

function sendMessage(message) {
  // ...
}
```

```css
label, textarea { margin-bottom: 10px; display: block; }
```

Here's what happens when you click the button:

1. The `onSubmit` event handler executes.
2. `setIsSent(true)` sets `isSent` to `true` and queues a new render.
3. React re-renders the component according to the new `isSent` value.

Let's take a closer look at the relationship between state and rendering.

### Rendering takes a snapshot in time

["Rendering"](https://react.dev/learn/render-and-commit#step-2-react-renders-your-components) means that React is calling your component, which is a function. The JSX you return from that function is like a snapshot of the UI in time. Its props, event handlers, and local variables were all calculated **using its state at the time of the render.**

Unlike a photograph or a movie frame, the UI "snapshot" you return is interactive. It includes logic like event handlers that specify what happens in response to inputs. React updates the screen to match this snapshot and connects the event handlers. As a result, pressing a button will trigger the click handler from your JSX.

When React re-renders a component:

1. React calls your function again.
2. Your function returns a new JSX snapshot.
3. React then updates the screen to match the snapshot your function returned.

As a component's memory, state is not like a regular variable that disappears after your function returns. State actually "lives" in React itself--as if on a shelf!--outside of your function. When React calls your component, it gives you a snapshot of the state for that particular render. Your component returns a snapshot of the UI with a fresh set of props and event handlers in its JSX, all calculated **using the state values from that render!**

Here's a little experiment to show you how this works. In this example, you might expect that clicking the "+3" button would increment the counter three times because it calls `setNumber(number + 1)` three times.

See what happens when you click the "+3" button:

```js
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 1);
        setNumber(number + 1);
        setNumber(number + 1);
      }}>+3</button>
    </>
  )
}
```

```css
button { display: inline-block; margin: 10px; font-size: 20px; }
h1 { display: inline-block; margin: 10px; width: 30px; text-align: center; }
```

Notice that `number` only increments once per click!

**Setting state only changes it for the *next* render.** During the first render, `number` was `0`. This is why, in *that render's* `onClick` handler, the value of `number` is still `0` even after `setNumber(number + 1)` was called:

```js
<button onClick={() => {
  setNumber(number + 1);
  setNumber(number + 1);
  setNumber(number + 1);
}}>+3</button>
```

Here is what this button's click handler tells React to do:

1. `setNumber(number + 1)`: `number` is `0` so `setNumber(0 + 1)`.
    - React prepares to change `number` to `1` on the next render.
2. `setNumber(number + 1)`: `number` is `0` so `setNumber(0 + 1)`.
    - React prepares to change `number` to `1` on the next render.
3. `setNumber(number + 1)`: `number` is `0` so `setNumber(0 + 1)`.
    - React prepares to change `number` to `1` on the next render.

Even though you called `setNumber(number + 1)` three times, in *this render's* event handler `number` is always `0`, so you set the state to `1` three times. This is why, after your event handler finishes, React re-renders the component with `number` equal to `1` rather than `3`.

You can also visualize this by mentally substituting state variables with their values in your code. Since the `number` state variable is `0` for *this render*, its event handler looks like this:

```js
<button onClick={() => {
  setNumber(0 + 1);
  setNumber(0 + 1);
  setNumber(0 + 1);
}}>+3</button>
```

For the next render, `number` is `1`, so *that render's* click handler looks like this:

```js
<button onClick={() => {
  setNumber(1 + 1);
  setNumber(1 + 1);
  setNumber(1 + 1);
}}>+3</button>
```

This is why clicking the button again will set the counter to `2`, then to `3` on the next click, and so on.

### State over time

Well, that was fun. Try to guess what clicking this button will alert:

```js
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 5);
        alert(number);
      }}>+5</button>
    </>
  )
}
```

```css
button { display: inline-block; margin: 10px; font-size: 20px; }
h1 { display: inline-block; margin: 10px; width: 30px; text-align: center; }
```

If you use the substitution method from before, you can guess that the alert shows "0":

```js
setNumber(0 + 5);
alert(0);
```

But what if you put a timer on the alert, so it only fires _after_ the component re-rendered? Would it say "0" or "5"? Have a guess!

```js
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 5);
        setTimeout(() => {
          alert(number);
        }, 3000);
      }}>+5</button>
    </>
  )
}
```

```css
button { display: inline-block; margin: 10px; font-size: 20px; }
h1 { display: inline-block; margin: 10px; width: 30px; text-align: center; }
```

Surprised? If you use the substitution method, you can see the "snapshot" of the state passed to the alert.

```js
setNumber(0 + 5);
setTimeout(() => {
  alert(0);
}, 3000);
```

The state stored in React may have changed by the time the alert runs, but it was scheduled using a snapshot of the state at the time the user interacted with it!

**A state variable's value never changes within a render,** even if its event handler's code is asynchronous. Inside *that render's* `onClick`, the value of `number` continues to be `0` even after `setNumber(number + 5)` was called. Its value was "fixed" when React "took the snapshot" of the UI by calling your component.

Here is an example of how that makes your event handlers less prone to timing mistakes. Below is a form that sends a message with a five-second delay. Imagine this scenario:

1. You press the "Send" button, sending "Hello" to Alice.
2. Before the five-second delay ends, you change the value of the "To" field to "Bob".

What do you expect the `alert` to display? Would it display, "You said Hello to Alice"? Or would it display, "You said Hello to Bob"? Make a guess based on what you know, and then try it:

```js
import { useState } from 'react';

export default function Form() {
  const [to, setTo] = useState('Alice');
  const [message, setMessage] = useState('Hello');

  function handleSubmit(e) {
    e.preventDefault();
    setTimeout(() => {
      alert(`You said ${message} to ${to}`);
    }, 5000);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        To:{' '}
        <select
          value={to}
          onChange={e => setTo(e.target.value)}>
          <option value="Alice">Alice</option>
          <option value="Bob">Bob</option>
        </select>
      </label>
      <textarea
        placeholder="Message"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

```css
label, textarea { margin-bottom: 10px; display: block; }
```

**React keeps the state values "fixed" within one render's event handlers.** You don't need to worry whether the state has changed while the code is running.

But what if you wanted to read the latest state before a re-render? You'll want to use a [state updater function](https://react.dev/learn/queueing-a-series-of-state-updates), covered on the next page!

* Setting state requests a new render.
* React stores state outside of your component, as if on a shelf.
* When you call `useState`, React gives you a snapshot of the state *for that render*.
* Variables and event handlers don't "survive" re-renders. Every render has its own event handlers.
* Every render (and functions inside it) will always "see" the snapshot of the state that React gave to *that* render.
* You can mentally substitute state in event handlers, similarly to how you think about the rendered JSX.
* Event handlers created in the past have the state values from the render in which they were created.

## Updating Objects in State

> **Source:** [Updating Objects in State](https://react.dev/learn/updating-objects-in-state) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

State can hold any kind of JavaScript value, including objects. But you shouldn't change objects that you hold in the React state directly. Instead, when you want to update an object, you need to create a new one (or make a copy of an existing one), and then set the state to use that copy.

- How to correctly update an object in React state
- How to update a nested object without mutating it
- What immutability is, and how not to break it
- How to make object copying less repetitive with Immer

### What's a mutation?

You can store any kind of JavaScript value in state.

```js
const [x, setX] = useState(0);
```

So far you've been working with numbers, strings, and booleans. These kinds of JavaScript values are "immutable", meaning unchangeable or "read-only". You can trigger a re-render to _replace_ a value:

```js
setX(5);
```

The `x` state changed from `0` to `5`, but the _number `0` itself_ did not change. It's not possible to make any changes to the built-in primitive values like numbers, strings, and booleans in JavaScript.

Now consider an object in state:

```js
const [position, setPosition] = useState({ x: 0, y: 0 });
```

Technically, it is possible to change the contents of _the object itself_. **This is called a mutation:**

```js
position.x = 5;
```

However, although objects in React state are technically mutable, you should treat them **as if** they were immutable--like numbers, booleans, and strings. Instead of mutating them, you should always replace them.

### Treat state as read-only

In other words, you should **treat any JavaScript object that you put into state as read-only.**

This example holds an object in state to represent the current pointer position. The red dot is supposed to move when you touch or move the cursor over the preview area. But the dot stays in the initial position:

```js
import { useState } from 'react';

export default function MovingDot() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  return (
    <div
      onPointerMove={e => {
        position.x = e.clientX;
        position.y = e.clientY;
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}>
      <div style={{
        position: 'absolute',
        backgroundColor: 'red',
        borderRadius: '50%',
        transform: `translate(${position.x}px, ${position.y}px)`,
        left: -10,
        top: -10,
        width: 20,
        height: 20,
      }} />
    </div>
  );
}
```

```css
body { margin: 0; padding: 0; height: 250px; }
```

The problem is with this bit of code.

```js
onPointerMove={e => {
  position.x = e.clientX;
  position.y = e.clientY;
}}
```

This code modifies the object assigned to `position` from [the previous render.](https://react.dev/learn/state-as-a-snapshot#rendering-takes-a-snapshot-in-time) But without using the state setting function, React has no idea that object has changed. So React does not do anything in response. It's like trying to change the order after you've already eaten the meal. While mutating state can work in some cases, we don't recommend it. You should treat the state value you have access to in a render as read-only.

To actually [trigger a re-render](https://react.dev/learn/state-as-a-snapshot#setting-state-triggers-renders) in this case, **create a *new* object and pass it to the state setting function:**

```js
onPointerMove={e => {
  setPosition({
    x: e.clientX,
    y: e.clientY
  });
}}
```

With `setPosition`, you're telling React:

* Replace `position` with this new object
* And render this component again

Notice how the red dot now follows your pointer when you touch or hover over the preview area:

```js
import { useState } from 'react';

export default function MovingDot() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  return (
    <div
      onPointerMove={e => {
        setPosition({
          x: e.clientX,
          y: e.clientY
        });
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}>
      <div style={{
        position: 'absolute',
        backgroundColor: 'red',
        borderRadius: '50%',
        transform: `translate(${position.x}px, ${position.y}px)`,
        left: -10,
        top: -10,
        width: 20,
        height: 20,
      }} />
    </div>
  );
}
```

```css
body { margin: 0; padding: 0; height: 250px; }
```

##### Local mutation is fine

Code like this is a problem because it modifies an *existing* object in state:

```js
position.x = e.clientX;
position.y = e.clientY;
```

But code like this is **absolutely fine** because you're mutating a fresh object you have *just created*:

```js
const nextPosition = {};
nextPosition.x = e.clientX;
nextPosition.y = e.clientY;
setPosition(nextPosition);
```

In fact, it is completely equivalent to writing this:

```js
setPosition({
  x: e.clientX,
  y: e.clientY
});
```

Mutation is only a problem when you change *existing* objects that are already in state. Mutating an object you've just created is okay because *no other code references it yet.* Changing it isn't going to accidentally impact something that depends on it. This is called a "local mutation". You can even do local mutation [while rendering.](https://react.dev/learn/keeping-components-pure#local-mutation-your-components-little-secret) Very convenient and completely okay!

### Copying objects with the spread syntax

In the previous example, the `position` object is always created fresh from the current cursor position. But often, you will want to include *existing* data as a part of the new object you're creating. For example, you may want to update *only one* field in a form, but keep the previous values for all other fields.

These input fields don't work because the `onChange` handlers mutate the state:

```js
import { useState } from 'react';

export default function Form() {
  const [person, setPerson] = useState({
    firstName: 'Barbara',
    lastName: 'Hepworth',
    email: 'bhepworth@sculpture.com'
  });

  function handleFirstNameChange(e) {
    person.firstName = e.target.value;
  }

  function handleLastNameChange(e) {
    person.lastName = e.target.value;
  }

  function handleEmailChange(e) {
    person.email = e.target.value;
  }

  return (
    <>
      <label>
        First name:
        <input
          value={person.firstName}
          onChange={handleFirstNameChange}
        />
      </label>
      <label>
        Last name:
        <input
          value={person.lastName}
          onChange={handleLastNameChange}
        />
      </label>
      <label>
        Email:
        <input
          value={person.email}
          onChange={handleEmailChange}
        />
      </label>
      <p>
        {person.firstName}{' '}
        {person.lastName}{' '}
        ({person.email})
      </p>
    </>
  );
}
```

```css
label { display: block; }
input { margin-left: 5px; margin-bottom: 5px; }
```

For example, this line mutates the state from a past render:

```js
person.firstName = e.target.value;
```

The reliable way to get the behavior you're looking for is to create a new object and pass it to `setPerson`. But here, you want to also **copy the existing data into it** because only one of the fields has changed:

```js
setPerson({
  firstName: e.target.value, // New first name from the input
  lastName: person.lastName,
  email: person.email
});
```

You can use the `...` [object spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals) syntax so that you don't need to copy every property separately.

```js
setPerson({
  ...person, // Copy the old fields
  firstName: e.target.value // But override this one
});
```

Now the form works!

Notice how you didn't declare a separate state variable for each input field. For large forms, keeping all data grouped in an object is very convenient--as long as you update it correctly!

```js
import { useState } from 'react';

export default function Form() {
  const [person, setPerson] = useState({
    firstName: 'Barbara',
    lastName: 'Hepworth',
    email: 'bhepworth@sculpture.com'
  });

  function handleFirstNameChange(e) {
    setPerson({
      ...person,
      firstName: e.target.value
    });
  }

  function handleLastNameChange(e) {
    setPerson({
      ...person,
      lastName: e.target.value
    });
  }

  function handleEmailChange(e) {
    setPerson({
      ...person,
      email: e.target.value
    });
  }

  return (
    <>
      <label>
        First name:
        <input
          value={person.firstName}
          onChange={handleFirstNameChange}
        />
      </label>
      <label>
        Last name:
        <input
          value={person.lastName}
          onChange={handleLastNameChange}
        />
      </label>
      <label>
        Email:
        <input
          value={person.email}
          onChange={handleEmailChange}
        />
      </label>
      <p>
        {person.firstName}{' '}
        {person.lastName}{' '}
        ({person.email})
      </p>
    </>
  );
}
```

```css
label { display: block; }
input { margin-left: 5px; margin-bottom: 5px; }
```

Note that the `...` spread syntax is "shallow"--it only copies things one level deep. This makes it fast, but it also means that if you want to update a nested property, you'll have to use it more than once.

##### Using a single event handler for multiple fields

You can also use the `[` and `]` braces inside your object definition to specify a property with a dynamic name. Here is the same example, but with a single event handler instead of three different ones:

```js
import { useState } from 'react';

export default function Form() {
  const [person, setPerson] = useState({
    firstName: 'Barbara',
    lastName: 'Hepworth',
    email: 'bhepworth@sculpture.com'
  });

  function handleChange(e) {
    setPerson({
      ...person,
      [e.target.name]: e.target.value
    });
  }

  return (
    <>
      <label>
        First name:
        <input
          name="firstName"
          value={person.firstName}
          onChange={handleChange}
        />
      </label>
      <label>
        Last name:
        <input
          name="lastName"
          value={person.lastName}
          onChange={handleChange}
        />
      </label>
      <label>
        Email:
        <input
          name="email"
          value={person.email}
          onChange={handleChange}
        />
      </label>
      <p>
        {person.firstName}{' '}
        {person.lastName}{' '}
        ({person.email})
      </p>
    </>
  );
}
```

```css
label { display: block; }
input { margin-left: 5px; margin-bottom: 5px; }
```

Here, `e.target.name` refers to the `name` property given to the `<input>` DOM element.

### Updating a nested object

Consider a nested object structure like this:

```js
const [person, setPerson] = useState({
  name: 'Niki de Saint Phalle',
  artwork: {
    title: 'Blue Nana',
    city: 'Hamburg',
    image: 'https://react.dev/images/docs/scientists/Sd1AgUOm.jpg',
  }
});
```

If you wanted to update `person.artwork.city`, it's clear how to do it with mutation:

```js
person.artwork.city = 'New Delhi';
```

But in React, you treat state as immutable! In order to change `city`, you would first need to produce the new `artwork` object (pre-populated with data from the previous one), and then produce the new `person` object which points at the new `artwork`:

```js
const nextArtwork = { ...person.artwork, city: 'New Delhi' };
const nextPerson = { ...person, artwork: nextArtwork };
setPerson(nextPerson);
```

Or, written as a single function call:

```js
setPerson({
  ...person, // Copy other fields
  artwork: { // but replace the artwork
    ...person.artwork, // with the same one
    city: 'New Delhi' // but in New Delhi!
  }
});
```

This gets a bit wordy, but it works fine for many cases:

```js
import { useState } from 'react';

export default function Form() {
  const [person, setPerson] = useState({
    name: 'Niki de Saint Phalle',
    artwork: {
      title: 'Blue Nana',
      city: 'Hamburg',
      image: 'https://react.dev/images/docs/scientists/Sd1AgUOm.jpg',
    }
  });

  function handleNameChange(e) {
    setPerson({
      ...person,
      name: e.target.value
    });
  }

  function handleTitleChange(e) {
    setPerson({
      ...person,
      artwork: {
        ...person.artwork,
        title: e.target.value
      }
    });
  }

  function handleCityChange(e) {
    setPerson({
      ...person,
      artwork: {
        ...person.artwork,
        city: e.target.value
      }
    });
  }

  function handleImageChange(e) {
    setPerson({
      ...person,
      artwork: {
        ...person.artwork,
        image: e.target.value
      }
    });
  }

  return (
    <>
      <label>
        Name:
        <input
          value={person.name}
          onChange={handleNameChange}
        />
      </label>
      <label>
        Title:
        <input
          value={person.artwork.title}
          onChange={handleTitleChange}
        />
      </label>
      <label>
        City:
        <input
          value={person.artwork.city}
          onChange={handleCityChange}
        />
      </label>
      <label>
        Image:
        <input
          value={person.artwork.image}
          onChange={handleImageChange}
        />
      </label>
      <p>
        <i>{person.artwork.title}</i>
        {' by '}
        {person.name}
        <br />
        (located in {person.artwork.city})
      </p>
      <img
        src={person.artwork.image}
        alt={person.artwork.title}
      />
    </>
  );
}
```

```css
label { display: block; }
input { margin-left: 5px; margin-bottom: 5px; }
img { width: 200px; height: 200px; }
```

##### Objects are not really nested

An object like this appears "nested" in code:

```js
let obj = {
  name: 'Niki de Saint Phalle',
  artwork: {
    title: 'Blue Nana',
    city: 'Hamburg',
    image: 'https://react.dev/images/docs/scientists/Sd1AgUOm.jpg',
  }
};
```

However, "nesting" is an inaccurate way to think about how objects behave. When the code executes, there is no such thing as a "nested" object. You are really looking at two different objects:

```js
let obj1 = {
  title: 'Blue Nana',
  city: 'Hamburg',
  image: 'https://react.dev/images/docs/scientists/Sd1AgUOm.jpg',
};

let obj2 = {
  name: 'Niki de Saint Phalle',
  artwork: obj1
};
```

The `obj1` object is not "inside" `obj2`. For example, `obj3` could "point" at `obj1` too:

```js
let obj1 = {
  title: 'Blue Nana',
  city: 'Hamburg',
  image: 'https://react.dev/images/docs/scientists/Sd1AgUOm.jpg',
};

let obj2 = {
  name: 'Niki de Saint Phalle',
  artwork: obj1
};

let obj3 = {
  name: 'Copycat',
  artwork: obj1
};
```

If you were to mutate `obj3.artwork.city`, it would affect both `obj2.artwork.city` and `obj1.city`. This is because `obj3.artwork`, `obj2.artwork`, and `obj1` are the same object. This is difficult to see when you think of objects as "nested". Instead, they are separate objects "pointing" at each other with properties.

#### Write concise update logic with Immer

If your state is deeply nested, you might want to consider [flattening it.](https://react.dev/learn/choosing-the-state-structure#avoid-deeply-nested-state) But, if you don't want to change your state structure, you might prefer a shortcut to nested spreads. [Immer](https://github.com/immerjs/use-immer) is a popular library that lets you write using the convenient but mutating syntax and takes care of producing the copies for you. With Immer, the code you write looks like you are "breaking the rules" and mutating an object:

```js
updatePerson(draft => {
  draft.artwork.city = 'Lagos';
});
```

But unlike a regular mutation, it doesn't overwrite the past state!

##### How does Immer work?

The `draft` provided by Immer is a special type of object, called a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), that "records" what you do with it. This is why you can mutate it freely as much as you like! Under the hood, Immer figures out which parts of the `draft` have been changed, and produces a completely new object that contains your edits.

To try Immer:

1. Run `npm install use-immer` to add Immer as a dependency
2. Then replace `import { useState } from 'react'` with `import { useImmer } from 'use-immer'`

Here is the above example converted to Immer:

```js
import { useImmer } from 'use-immer';

export default function Form() {
  const [person, updatePerson] = useImmer({
    name: 'Niki de Saint Phalle',
    artwork: {
      title: 'Blue Nana',
      city: 'Hamburg',
      image: 'https://react.dev/images/docs/scientists/Sd1AgUOm.jpg',
    }
  });

  function handleNameChange(e) {
    updatePerson(draft => {
      draft.name = e.target.value;
    });
  }

  function handleTitleChange(e) {
    updatePerson(draft => {
      draft.artwork.title = e.target.value;
    });
  }

  function handleCityChange(e) {
    updatePerson(draft => {
      draft.artwork.city = e.target.value;
    });
  }

  function handleImageChange(e) {
    updatePerson(draft => {
      draft.artwork.image = e.target.value;
    });
  }

  return (
    <>
      <label>
        Name:
        <input
          value={person.name}
          onChange={handleNameChange}
        />
      </label>
      <label>
        Title:
        <input
          value={person.artwork.title}
          onChange={handleTitleChange}
        />
      </label>
      <label>
        City:
        <input
          value={person.artwork.city}
          onChange={handleCityChange}
        />
      </label>
      <label>
        Image:
        <input
          value={person.artwork.image}
          onChange={handleImageChange}
        />
      </label>
      <p>
        <i>{person.artwork.title}</i>
        {' by '}
        {person.name}
        <br />
        (located in {person.artwork.city})
      </p>
      <img
        src={person.artwork.image}
        alt={person.artwork.title}
      />
    </>
  );
}
```

```json
{
  "dependencies": {
    "immer": "1.7.3",
    "react": "latest",
    "react-dom": "latest",
    "react-scripts": "latest",
    "use-immer": "0.5.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}
```

```css
label { display: block; }
input { margin-left: 5px; margin-bottom: 5px; }
img { width: 200px; height: 200px; }
```

Notice how much more concise the event handlers have become. You can mix and match `useState` and `useImmer` in a single component as much as you like. Immer is a great way to keep the update handlers concise, especially if there's nesting in your state, and copying objects leads to repetitive code.

##### Why is mutating state not recommended in React?

There are a few reasons:

* **Debugging:** If you use `console.log` and don't mutate state, your past logs won't get clobbered by the more recent state changes. So you can clearly see how state has changed between renders.
* **Optimizations:** Common React [optimization strategies](https://react.dev/reference/react/memo) rely on skipping work if previous props or state are the same as the next ones. If you never mutate state, it is very fast to check whether there were any changes. If `prevObj === obj`, you can be sure that nothing could have changed inside of it.
* **New Features:** The new React features we're building rely on state being [treated like a snapshot.](https://react.dev/learn/state-as-a-snapshot) If you're mutating past versions of state, that may prevent you from using the new features.
* **Requirement Changes:** Some application features, like implementing Undo/Redo, showing a history of changes, or letting the user reset a form to earlier values, are easier to do when nothing is mutated. This is because you can keep past copies of state in memory, and reuse them when appropriate. If you start with a mutative approach, features like this can be difficult to add later on.
* **Simpler Implementation:** Because React does not rely on mutation, it does not need to do anything special with your objects. It does not need to hijack their properties, always wrap them into Proxies, or do other work at initialization as many "reactive" solutions do. This is also why React lets you put any object into state--no matter how large--without additional performance or correctness pitfalls.

In practice, you can often "get away" with mutating state in React, but we strongly advise you not to do that so that you can use new React features developed with this approach in mind. Future contributors and perhaps even your future self will thank you!

* Treat all state in React as immutable.
* When you store objects in state, mutating them will not trigger renders and will change the state in previous render "snapshots".
* Instead of mutating an object, create a *new* version of it, and trigger a re-render by setting state to it.
* You can use the `{...obj, something: 'newValue'}` object spread syntax to create copies of objects.
* Spread syntax is shallow: it only copies one level deep.
* To update a nested object, you need to create copies all the way up from the place you're updating.
* To reduce repetitive copying code, use Immer.

## Updating Arrays in State

> **Source:** [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

Arrays are mutable in JavaScript, but you should treat them as immutable when you store them in state. Just like with objects, when you want to update an array stored in state, you need to create a new one (or make a copy of an existing one), and then set state to use the new array.

- How to add, remove, or change items in an array in React state
- How to update an object inside of an array
- How to make array copying less repetitive with Immer

### Updating arrays without mutation

In JavaScript, arrays are just another kind of object. [Like with objects](https://react.dev/learn/updating-objects-in-state), **you should treat arrays in React state as read-only.** This means that you shouldn't reassign items inside an array like `arr[0] = 'bird'`, and you also shouldn't use methods that mutate the array, such as `push()` and `pop()`.

Instead, every time you want to update an array, you'll want to pass a *new* array to your state setting function. To do that, you can create a new array from the original array in your state by calling its non-mutating methods like `filter()` and `map()`. Then you can set your state to the resulting new array.

Here is a reference table of common array operations. When dealing with arrays inside React state, you will need to avoid the methods in the left column, and instead prefer the methods in the right column:

|           | avoid (mutates the array)           | prefer (returns a new array)                                        |
| --------- | ----------------------------------- | ------------------------------------------------------------------- |
| adding    | `push`, `unshift`                   | `concat`, `[...arr]` spread syntax ([example](#adding-to-an-array)) |
| removing  | `pop`, `shift`, `splice`            | `filter`, `slice` ([example](#removing-from-an-array))              |
| replacing | `splice`, `arr[i] = ...` assignment | `map` ([example](#replacing-items-in-an-array))                     |
| sorting   | `reverse`, `sort`                   | copy the array first ([example](#making-other-changes-to-an-array)) |

Alternatively, you can [use Immer](#write-concise-update-logic-with-immer) which lets you use methods from both columns.

Unfortunately, [`slice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) and [`splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) are named similarly but are very different:

* `slice` lets you copy an array or a part of it.
* `splice` **mutates** the array (to insert or delete items).

In React, you will be using `slice` (no `p`!) a lot more often because you don't want to mutate objects or arrays in state. [Updating Objects](https://react.dev/learn/updating-objects-in-state) explains what mutation is and why it's not recommended for state.

#### Adding to an array

`push()` will mutate an array, which you don't want:

```js
import { useState } from 'react';

let nextId = 0;

export default function List() {
  const [name, setName] = useState('');
  const [artists, setArtists] = useState([]);

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={() => {
        artists.push({
          id: nextId++,
          name: name,
        });
      }}>Add</button>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </>
  );
}
```

```css
button { margin-left: 5px; }
```

Instead, create a *new* array which contains the existing items *and* a new item at the end. There are multiple ways to do this, but the easiest one is to use the `...` [array spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_array_literals) syntax:

```js
setArtists( // Replace the state
  [ // with a new array
    ...artists, // that contains all the old items
    { id: nextId++, name: name } // and one new item at the end
  ]
);
```

Now it works correctly:

```js
import { useState } from 'react';

let nextId = 0;

export default function List() {
  const [name, setName] = useState('');
  const [artists, setArtists] = useState([]);

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={() => {
        setArtists([
          ...artists,
          { id: nextId++, name: name }
        ]);
      }}>Add</button>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </>
  );
}
```

```css
button { margin-left: 5px; }
```

The array spread syntax also lets you prepend an item by placing it *before* the original `...artists`:

```js
setArtists([
  { id: nextId++, name: name },
  ...artists // Put old items at the end
]);
```

In this way, spread can do the job of both `push()` by adding to the end of an array and `unshift()` by adding to the beginning of an array. Try it in the sandbox above!

#### Removing from an array

The easiest way to remove an item from an array is to *filter it out*. In other words, you will produce a new array that will not contain that item. To do this, use the `filter` method, for example:

```js
import { useState } from 'react';

let initialArtists = [
  { id: 0, name: 'Marta Colvin Andrade' },
  { id: 1, name: 'Lamidi Olonade Fakeye'},
  { id: 2, name: 'Louise Nevelson'},
];

export default function List() {
  const [artists, setArtists] = useState(
    initialArtists
  );

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>
            {artist.name}{' '}
            <button onClick={() => {
              setArtists(
                artists.filter(a =>
                  a.id !== artist.id
                )
              );
            }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
```

Click the "Delete" button a few times, and look at its click handler.

```js
setArtists(
  artists.filter(a => a.id !== artist.id)
);
```

Here, `artists.filter(a => a.id !== artist.id)` means "create an array that consists of those `artists` whose IDs are different from `artist.id`". In other words, each artist's "Delete" button will filter _that_ artist out of the array, and then request a re-render with the resulting array. Note that `filter` does not modify the original array.

#### Transforming an array

If you want to change some or all items of the array, you can use `map()` to create a **new** array. The function you will pass to `map` can decide what to do with each item, based on its data or its index (or both).

In this example, an array holds coordinates of two circles and a square. When you press the button, it moves only the circles down by 50 pixels. It does this by producing a new array of data using `map()`:

```js
import { useState } from 'react';

let initialShapes = [
  { id: 0, type: 'circle', x: 50, y: 100 },
  { id: 1, type: 'square', x: 150, y: 100 },
  { id: 2, type: 'circle', x: 250, y: 100 },
];

export default function ShapeEditor() {
  const [shapes, setShapes] = useState(
    initialShapes
  );

  function handleClick() {
    const nextShapes = shapes.map(shape => {
      if (shape.type === 'square') {
        // No change
        return shape;
      } else {
        // Return a new circle 50px below
        return {
          ...shape,
          y: shape.y + 50,
        };
      }
    });
    // Re-render with the new array
    setShapes(nextShapes);
  }

  return (
    <>
      <button onClick={handleClick}>
        Move circles down!
      </button>
      {shapes.map(shape => (
        <div
          key={shape.id}
          style={{
          background: 'purple',
          position: 'absolute',
          left: shape.x,
          top: shape.y,
          borderRadius:
            shape.type === 'circle'
              ? '50%' : '',
          width: 20,
          height: 20,
        }} />
      ))}
    </>
  );
}
```

```css
body { height: 300px; }
```

#### Replacing items in an array

It is particularly common to want to replace one or more items in an array. Assignments like `arr[0] = 'bird'` are mutating the original array, so instead you'll want to use `map` for this as well.

To replace an item, create a new array with `map`. Inside your `map` call, you will receive the item index as the second argument. Use it to decide whether to return the original item (the first argument) or something else:

```js
import { useState } from 'react';

let initialCounters = [
  0, 0, 0
];

export default function CounterList() {
  const [counters, setCounters] = useState(
    initialCounters
  );

  function handleIncrementClick(index) {
    const nextCounters = counters.map((c, i) => {
      if (i === index) {
        // Increment the clicked counter
        return c + 1;
      } else {
        // The rest haven't changed
        return c;
      }
    });
    setCounters(nextCounters);
  }

  return (
    <ul>
      {counters.map((counter, i) => (
        <li key={i}>
          {counter}
          <button onClick={() => {
            handleIncrementClick(i);
          }}>+1</button>
        </li>
      ))}
    </ul>
  );
}
```

```css
button { margin: 5px; }
```

#### Inserting into an array

Sometimes, you may want to insert an item at a particular position that's neither at the beginning nor at the end. To do this, you can use the `...` array spread syntax together with the `slice()` method. The `slice()` method lets you cut a "slice" of the array. To insert an item, you will create an array that spreads the slice _before_ the insertion point, then the new item, and then the rest of the original array.

In this example, the Insert button always inserts at the index `1`:

```js
import { useState } from 'react';

let nextId = 3;
const initialArtists = [
  { id: 0, name: 'Marta Colvin Andrade' },
  { id: 1, name: 'Lamidi Olonade Fakeye'},
  { id: 2, name: 'Louise Nevelson'},
];

export default function List() {
  const [name, setName] = useState('');
  const [artists, setArtists] = useState(
    initialArtists
  );

  function handleClick() {
    const insertAt = 1; // Could be any index
    const nextArtists = [
      // Items before the insertion point:
      ...artists.slice(0, insertAt),
      // New item:
      { id: nextId++, name: name },
      // Items after the insertion point:
      ...artists.slice(insertAt)
    ];
    setArtists(nextArtists);
    setName('');
  }

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={handleClick}>
        Insert
      </button>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </>
  );
}
```

```css
button { margin-left: 5px; }
```

#### Making other changes to an array

There are some things you can't do with the spread syntax and non-mutating methods like `map()` and `filter()` alone. For example, you may want to reverse or sort an array. The JavaScript `reverse()` and `sort()` methods are mutating the original array, so you can't use them directly.

**However, you can copy the array first, and then make changes to it.**

For example:

```js
import { useState } from 'react';

const initialList = [
  { id: 0, title: 'Big Bellies' },
  { id: 1, title: 'Lunar Landscape' },
  { id: 2, title: 'Terracotta Army' },
];

export default function List() {
  const [list, setList] = useState(initialList);

  function handleClick() {
    const nextList = [...list];
    nextList.reverse();
    setList(nextList);
  }

  return (
    <>
      <button onClick={handleClick}>
        Reverse
      </button>
      <ul>
        {list.map(artwork => (
          <li key={artwork.id}>{artwork.title}</li>
        ))}
      </ul>
    </>
  );
}
```

Here, you use the `[...list]` spread syntax to create a copy of the original array first. Now that you have a copy, you can use mutating methods like `nextList.reverse()` or `nextList.sort()`, or even assign individual items with `nextList[0] = "something"`.

However, **even if you copy an array, you can't mutate existing items _inside_ of it directly.** This is because copying is shallow--the new array will contain the same items as the original one. So if you modify an object inside the copied array, you are mutating the existing state. For example, code like this is a problem.

```js
const nextList = [...list];
nextList[0].seen = true; // Problem: mutates list[0]
setList(nextList);
```

Although `nextList` and `list` are two different arrays, **`nextList[0]` and `list[0]` point to the same object.** So by changing `nextList[0].seen`, you are also changing `list[0].seen`. This is a state mutation, which you should avoid! You can solve this issue in a similar way to [updating nested JavaScript objects](https://react.dev/learn/updating-objects-in-state#updating-a-nested-object)--by copying individual items you want to change instead of mutating them. Here's how.

### Updating objects inside arrays

Objects are not _really_ located "inside" arrays. They might appear to be "inside" in code, but each object in an array is a separate value, to which the array "points". This is why you need to be careful when changing nested fields like `list[0]`. Another person's artwork list may point to the same element of the array!

**When updating nested state, you need to create copies from the point where you want to update, and all the way up to the top level.** Let's see how this works.

In this example, two separate artwork lists have the same initial state. They are supposed to be isolated, but because of a mutation, their state is accidentally shared, and checking a box in one list affects the other list:

```js
import { useState } from 'react';

let nextId = 3;
const initialList = [
  { id: 0, title: 'Big Bellies', seen: false },
  { id: 1, title: 'Lunar Landscape', seen: false },
  { id: 2, title: 'Terracotta Army', seen: true },
];

export default function BucketList() {
  const [myList, setMyList] = useState(initialList);
  const [yourList, setYourList] = useState(
    initialList
  );

  function handleToggleMyList(artworkId, nextSeen) {
    const myNextList = [...myList];
    const artwork = myNextList.find(
      a => a.id === artworkId
    );
    artwork.seen = nextSeen;
    setMyList(myNextList);
  }

  function handleToggleYourList(artworkId, nextSeen) {
    const yourNextList = [...yourList];
    const artwork = yourNextList.find(
      a => a.id === artworkId
    );
    artwork.seen = nextSeen;
    setYourList(yourNextList);
  }

  return (
    <>
      <h1>Art Bucket List</h1>
      <h2>My list of art to see:</h2>
      <ItemList
        artworks={myList}
        onToggle={handleToggleMyList} />
      <h2>Your list of art to see:</h2>
      <ItemList
        artworks={yourList}
        onToggle={handleToggleYourList} />
    </>
  );
}

function ItemList({ artworks, onToggle }) {
  return (
    <ul>
      {artworks.map(artwork => (
        <li key={artwork.id}>
          <label>
            <input
              type="checkbox"
              checked={artwork.seen}
              onChange={e => {
                onToggle(
                  artwork.id,
                  e.target.checked
                );
              }}
            />
            {artwork.title}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

The problem is in code like this:

```js
const myNextList = [...myList];
const artwork = myNextList.find(a => a.id === artworkId);
artwork.seen = nextSeen; // Problem: mutates an existing item
setMyList(myNextList);
```

Although the `myNextList` array itself is new, the *items themselves* are the same as in the original `myList` array. So changing `artwork.seen` changes the *original* artwork item. That artwork item is also in `yourList`, which causes the bug. Bugs like this can be difficult to think about, but thankfully they disappear if you avoid mutating state.

**You can use `map` to substitute an old item with its updated version without mutation.**

```js
setMyList(myList.map(artwork => {
  if (artwork.id === artworkId) {
    // Create a *new* object with changes
    return { ...artwork, seen: nextSeen };
  } else {
    // No changes
    return artwork;
  }
}));
```

Here, `...` is the object spread syntax used to [create a copy of an object.](https://react.dev/learn/updating-objects-in-state#copying-objects-with-the-spread-syntax)

With this approach, none of the existing state items are being mutated, and the bug is fixed:

```js
import { useState } from 'react';

let nextId = 3;
const initialList = [
  { id: 0, title: 'Big Bellies', seen: false },
  { id: 1, title: 'Lunar Landscape', seen: false },
  { id: 2, title: 'Terracotta Army', seen: true },
];

export default function BucketList() {
  const [myList, setMyList] = useState(initialList);
  const [yourList, setYourList] = useState(
    initialList
  );

  function handleToggleMyList(artworkId, nextSeen) {
    setMyList(myList.map(artwork => {
      if (artwork.id === artworkId) {
        // Create a *new* object with changes
        return { ...artwork, seen: nextSeen };
      } else {
        // No changes
        return artwork;
      }
    }));
  }

  function handleToggleYourList(artworkId, nextSeen) {
    setYourList(yourList.map(artwork => {
      if (artwork.id === artworkId) {
        // Create a *new* object with changes
        return { ...artwork, seen: nextSeen };
      } else {
        // No changes
        return artwork;
      }
    }));
  }

  return (
    <>
      <h1>Art Bucket List</h1>
      <h2>My list of art to see:</h2>
      <ItemList
        artworks={myList}
        onToggle={handleToggleMyList} />
      <h2>Your list of art to see:</h2>
      <ItemList
        artworks={yourList}
        onToggle={handleToggleYourList} />
    </>
  );
}

function ItemList({ artworks, onToggle }) {
  return (
    <ul>
      {artworks.map(artwork => (
        <li key={artwork.id}>
          <label>
            <input
              type="checkbox"
              checked={artwork.seen}
              onChange={e => {
                onToggle(
                  artwork.id,
                  e.target.checked
                );
              }}
            />
            {artwork.title}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

In general, **you should only mutate objects that you have just created.** If you were inserting a *new* artwork, you could mutate it, but if you're dealing with something that's already in state, you need to make a copy.

#### Write concise update logic with Immer

Updating nested arrays without mutation can get a little bit repetitive. [Just as with objects](https://react.dev/learn/updating-objects-in-state#write-concise-update-logic-with-immer):

- Generally, you shouldn't need to update state more than a couple of levels deep. If your state objects are very deep, you might want to [restructure them differently](https://react.dev/learn/choosing-the-state-structure#avoid-deeply-nested-state) so that they are flat.
- If you don't want to change your state structure, you might prefer to use [Immer](https://github.com/immerjs/use-immer), which lets you write using the convenient but mutating syntax and takes care of producing the copies for you.

Here is the Art Bucket List example rewritten with Immer:

```js
import { useState } from 'react';
import { useImmer } from 'use-immer';

let nextId = 3;
const initialList = [
  { id: 0, title: 'Big Bellies', seen: false },
  { id: 1, title: 'Lunar Landscape', seen: false },
  { id: 2, title: 'Terracotta Army', seen: true },
];

export default function BucketList() {
  const [myList, updateMyList] = useImmer(
    initialList
  );
  const [yourList, updateYourList] = useImmer(
    initialList
  );

  function handleToggleMyList(id, nextSeen) {
    updateMyList(draft => {
      const artwork = draft.find(a =>
        a.id === id
      );
      artwork.seen = nextSeen;
    });
  }

  function handleToggleYourList(artworkId, nextSeen) {
    updateYourList(draft => {
      const artwork = draft.find(a =>
        a.id === artworkId
      );
      artwork.seen = nextSeen;
    });
  }

  return (
    <>
      <h1>Art Bucket List</h1>
      <h2>My list of art to see:</h2>
      <ItemList
        artworks={myList}
        onToggle={handleToggleMyList} />
      <h2>Your list of art to see:</h2>
      <ItemList
        artworks={yourList}
        onToggle={handleToggleYourList} />
    </>
  );
}

function ItemList({ artworks, onToggle }) {
  return (
    <ul>
      {artworks.map(artwork => (
        <li key={artwork.id}>
          <label>
            <input
              type="checkbox"
              checked={artwork.seen}
              onChange={e => {
                onToggle(
                  artwork.id,
                  e.target.checked
                );
              }}
            />
            {artwork.title}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

```json
{
  "dependencies": {
    "immer": "1.7.3",
    "react": "latest",
    "react-dom": "latest",
    "react-scripts": "latest",
    "use-immer": "0.5.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}
```

Note how with Immer, **mutation like `artwork.seen = nextSeen` is now okay:**

```js
updateMyTodos(draft => {
  const artwork = draft.find(a => a.id === artworkId);
  artwork.seen = nextSeen;
});
```

This is because you're not mutating the _original_ state, but you're mutating a special `draft` object provided by Immer. Similarly, you can apply mutating methods like `push()` and `pop()` to the content of the `draft`.

Behind the scenes, Immer always constructs the next state from scratch according to the changes that you've done to the `draft`. This keeps your event handlers very concise without ever mutating state.

- You can put arrays into state, but you can't change them.
- Instead of mutating an array, create a *new* version of it, and update the state to it.
- You can use the `[...arr, newItem]` array spread syntax to create arrays with new items.
- You can use `filter()` and `map()` to create new arrays with filtered or transformed items.
- You can use Immer to keep your code concise.

## Reacting to Input with State

> **Source:** [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

React provides a declarative way to manipulate the UI. Instead of manipulating individual pieces of the UI directly, you describe the different states that your component can be in, and switch between them in response to the user input. This is similar to how designers think about the UI.

* How declarative UI programming differs from imperative UI programming
* How to enumerate the different visual states your component can be in
* How to trigger the changes between the different visual states from code

### How declarative UI compares to imperative

When you design UI interactions, you probably think about how the UI *changes* in response to user actions. Consider a form that lets the user submit an answer:

* When you type something into the form, the "Submit" button **becomes enabled.**
* When you press "Submit", both the form and the button **become disabled,** and a spinner **appears.**
* If the network request succeeds, the form **gets hidden,** and the "Thank you" message **appears.**
* If the network request fails, an error message **appears,** and the form **becomes enabled** again.

In **imperative programming,** the above corresponds directly to how you implement interaction. You have to write the exact instructions to manipulate the UI depending on what just happened. Here's another way to think about this: imagine riding next to someone in a car and telling them turn by turn where to go.

They don't know where you want to go, they just follow your commands. (And if you get the directions wrong, you end up in the wrong place!) It's called *imperative* because you have to "command" each element, from the spinner to the button, telling the computer *how* to update the UI.

In this example of imperative UI programming, the form is built *without* React. It only uses the browser [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model):

```js
async function handleFormSubmit(e) {
  e.preventDefault();
  disable(textarea);
  disable(button);
  show(loadingMessage);
  hide(errorMessage);
  try {
    await submitForm(textarea.value);
    show(successMessage);
    hide(form);
  } catch (err) {
    show(errorMessage);
    errorMessage.textContent = err.message;
  } finally {
    hide(loadingMessage);
    enable(textarea);
    enable(button);
  }
}

function handleTextareaChange() {
  if (textarea.value.length === 0) {
    disable(button);
  } else {
    enable(button);
  }
}

function hide(el) {
  el.style.display = 'none';
}

function show(el) {
  el.style.display = '';
}

function enable(el) {
  el.disabled = false;
}

function disable(el) {
  el.disabled = true;
}

function submitForm(answer) {
  // Pretend it's hitting the network.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (answer.toLowerCase() === 'istanbul') {
        resolve();
      } else {
        reject(new Error('Good guess but a wrong answer. Try again!'));
      }
    }, 1500);
  });
}

let form = document.getElementById('form');
let textarea = document.getElementById('textarea');
let button = document.getElementById('button');
let loadingMessage = document.getElementById('loading');
let errorMessage = document.getElementById('error');
let successMessage = document.getElementById('success');
form.onsubmit = handleFormSubmit;
textarea.oninput = handleTextareaChange;
```

```js
{
  "hardReloadOnChange": true
}
```

```html
<form id="form">
  <h2>City quiz</h2>
  <p>
    What city is located on two continents?
  </p>
  <textarea id="textarea"></textarea>
  <br />
  <button id="button" disabled>Submit</button>
  <p id="loading" style="display: none">Loading...</p>
  <p id="error" style="display: none; color: red;"></p>
</form>
<h1 id="success" style="display: none">That's right!</h1>

<style>
* { box-sizing: border-box; }
body { font-family: sans-serif; margin: 20px; padding: 0; }
</style>
```

Manipulating the UI imperatively works well enough for isolated examples, but it gets exponentially more difficult to manage in more complex systems. Imagine updating a page full of different forms like this one. Adding a new UI element or a new interaction would require carefully checking all existing code to make sure you haven't introduced a bug (for example, forgetting to show or hide something).

React was built to solve this problem.

In React, you don't directly manipulate the UI--meaning you don't enable, disable, show, or hide components directly. Instead, you **declare what you want to show,** and React figures out how to update the UI. Think of getting into a taxi and telling the driver where you want to go instead of telling them exactly where to turn. It's the driver's job to get you there, and they might even know some shortcuts you haven't considered!

### Thinking about UI declaratively

You've seen how to implement a form imperatively above. To better understand how to think in React, you'll walk through reimplementing this UI in React below:

1. **Identify** your component's different visual states
2. **Determine** what triggers those state changes
3. **Represent** the state in memory using `useState`
4. **Remove** any non-essential state variables
5. **Connect** the event handlers to set the state

#### Step 1: Identify your component's different visual states

In computer science, you may hear about a ["state machine"](https://en.wikipedia.org/wiki/Finite-state_machine) being in one of several “states”. If you work with a designer, you may have seen mockups for different "visual states". React stands at the intersection of design and computer science, so both of these ideas are sources of inspiration.

First, you need to visualize all the different "states" of the UI the user might see:

* **Empty**: Form has a disabled "Submit" button.
* **Typing**: Form has an enabled "Submit" button.
* **Submitting**: Form is completely disabled. Spinner is shown.
* **Success**: "Thank you" message is shown instead of a form.
* **Error**: Same as Typing state, but with an extra error message.

Just like a designer, you'll want to "mock up" or create "mocks" for the different states before you add logic. For example, here is a mock for just the visual part of the form. This mock is controlled by a prop called `status` with a default value of `'empty'`:

```js
export default function Form({
  status = 'empty'
}) {
  if (status === 'success') {
    return <h1>That's right!</h1>
  }
  return (
    <>
      <h2>City quiz</h2>
      <p>
        In which city is there a billboard that turns air into drinkable water?
      </p>
      <form>
        <textarea />
        <br />
        <button>
          Submit
        </button>
      </form>
    </>
  )
}
```

You could call that prop anything you like, the naming is not important. Try editing `status = 'empty'` to `status = 'success'` to see the success message appear. Mocking lets you quickly iterate on the UI before you wire up any logic. Here is a more fleshed out prototype of the same component, still "controlled" by the `status` prop:

```js
export default function Form({
  // Try 'submitting', 'error', 'success':
  status = 'empty'
}) {
  if (status === 'success') {
    return <h1>That's right!</h1>
  }
  return (
    <>
      <h2>City quiz</h2>
      <p>
        In which city is there a billboard that turns air into drinkable water?
      </p>
      <form>
        <textarea disabled={
          status === 'submitting'
        } />
        <br />
        <button disabled={
          status === 'empty' ||
          status === 'submitting'
        }>
          Submit
        </button>
        {status === 'error' &&
          <p className="Error">
            Good guess but a wrong answer. Try again!
          </p>
        }
      </form>
      </>
  );
}
```

```css
.Error { color: red; }
```

##### Displaying many visual states at once

If a component has a lot of visual states, it can be convenient to show them all on one page:

```js
import Form from './Form.js';

let statuses = [
  'empty',
  'typing',
  'submitting',
  'success',
  'error',
];

export default function App() {
  return (
    <>
      {statuses.map(status => (
        <section key={status}>
          <h4>Form ({status}):</h4>
          <Form status={status} />
        </section>
      ))}
    </>
  );
}
```

```js
export default function Form({ status }) {
  if (status === 'success') {
    return <h1>That's right!</h1>
  }
  return (
    <form>
      <textarea disabled={
        status === 'submitting'
      } />
      <br />
      <button disabled={
        status === 'empty' ||
        status === 'submitting'
      }>
        Submit
      </button>
      {status === 'error' &&
        <p className="Error">
          Good guess but a wrong answer. Try again!
        </p>
      }
    </form>
  );
}
```

```css
section { border-bottom: 1px solid #aaa; padding: 20px; }
h4 { color: #222; }
body { margin: 0; }
.Error { color: red; }
```

Pages like this are often called "living styleguides" or "storybooks".

#### Step 2: Determine what triggers those state changes

You can trigger state updates in response to two kinds of inputs:

* **Human inputs,** like clicking a button, typing in a field, navigating a link.
* **Computer inputs,** like a network response arriving, a timeout completing, an image loading.

In both cases, **you must set [state variables](https://react.dev/learn/state-a-components-memory#anatomy-of-usestate) to update the UI.** For the form you're developing, you will need to change state in response to a few different inputs:

* **Changing the text input** (human) should switch it from the *Empty* state to the *Typing* state or back, depending on whether the text box is empty or not.
* **Clicking the Submit button** (human) should switch it to the *Submitting* state.
* **Successful network response** (computer) should switch it to the *Success* state.
* **Failed network response** (computer) should switch it to the *Error* state with the matching error message.

Notice that human inputs often require [event handlers](https://react.dev/learn/responding-to-events)!

To help visualize this flow, try drawing each state on paper as a labeled circle, and each change between two states as an arrow. You can sketch out many flows this way and sort out bugs long before implementation.

Form states

#### Step 3: Represent the state in memory with `useState`

Next you'll need to represent the visual states of your component in memory with [`useState`.](https://react.dev/reference/react/useState) Simplicity is key: each piece of state is a "moving piece", and **you want as few "moving pieces" as possible.** More complexity leads to more bugs!

Start with the state that *absolutely must* be there. For example, you'll need to store the `answer` for the input, and the `error` (if it exists) to store the last error:

```js
const [answer, setAnswer] = useState('');
const [error, setError] = useState(null);
```

Then, you'll need a state variable representing which one of the visual states that you want to display. There's usually more than a single way to represent that in memory, so you'll need to experiment with it.

If you struggle to think of the best way immediately, start by adding enough state that you're *definitely* sure that all the possible visual states are covered:

```js
const [isEmpty, setIsEmpty] = useState(true);
const [isTyping, setIsTyping] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
const [isError, setIsError] = useState(false);
```

Your first idea likely won't be the best, but that's ok--refactoring state is a part of the process!

#### Step 4: Remove any non-essential state variables

You want to avoid duplication in the state content so you're only tracking what is essential. Spending a little time on refactoring your state structure will make your components easier to understand, reduce duplication, and avoid unintended meanings. Your goal is to **prevent the cases where the state in memory doesn't represent any valid UI that you'd want a user to see.** (For example, you never want to show an error message and disable the input at the same time, or the user won't be able to correct the error!)

Here are some questions you can ask about your state variables:

* **Does this state cause a paradox?** For example, `isTyping` and `isSubmitting` can't both be `true`. A paradox usually means that the state is not constrained enough. There are four possible combinations of two booleans, but only three correspond to valid states. To remove the "impossible" state, you can combine these into a `status` that must be one of three values: `'typing'`, `'submitting'`, or `'success'`.
* **Is the same information available in another state variable already?** Another paradox: `isEmpty` and `isTyping` can't be `true` at the same time. By making them separate state variables, you risk them going out of sync and causing bugs. Fortunately, you can remove `isEmpty` and instead check `answer.length === 0`.
* **Can you get the same information from the inverse of another state variable?** `isError` is not needed because you can check `error !== null` instead.

After this clean-up, you're left with 3 (down from 7!) *essential* state variables:

```js
const [answer, setAnswer] = useState('');
const [error, setError] = useState(null);
const [status, setStatus] = useState('typing'); // 'typing', 'submitting', or 'success'
```

You know they are essential, because you can't remove any of them without breaking the functionality.

##### Eliminating “impossible” states with a reducer

These three variables are a good enough representation of this form's state. However, there are still some intermediate states that don't fully make sense. For example, a non-null `error` doesn't make sense when `status` is `'success'`. To model the state more precisely, you can [extract it into a reducer.](https://react.dev/learn/extracting-state-logic-into-a-reducer) Reducers let you unify multiple state variables into a single object and consolidate all the related logic!

#### Step 5: Connect the event handlers to set state

Lastly, create event handlers that update the state. Below is the final form, with all event handlers wired up:

```js
import { useState } from 'react';

export default function Form() {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');

  if (status === 'success') {
    return <h1>That's right!</h1>
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    try {
      await submitForm(answer);
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);
    }
  }

  function handleTextareaChange(e) {
    setAnswer(e.target.value);
  }

  return (
    <>
      <h2>City quiz</h2>
      <p>
        In which city is there a billboard that turns air into drinkable water?
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={answer}
          onChange={handleTextareaChange}
          disabled={status === 'submitting'}
        />
        <br />
        <button disabled={
          answer.length === 0 ||
          status === 'submitting'
        }>
          Submit
        </button>
        {error !== null &&
          <p className="Error">
            {error.message}
          </p>
        }
      </form>
    </>
  );
}

function submitForm(answer) {
  // Pretend it's hitting the network.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let shouldError = answer.toLowerCase() !== 'lima'
      if (shouldError) {
        reject(new Error('Good guess but a wrong answer. Try again!'));
      } else {
        resolve();
      }
    }, 1500);
  });
}
```

```css
.Error { color: red; }
```

Although this code is longer than the original imperative example, it is much less fragile. Expressing all interactions as state changes lets you later introduce new visual states without breaking existing ones. It also lets you change what should be displayed in each state without changing the logic of the interaction itself.

* Declarative programming means describing the UI for each visual state rather than micromanaging the UI (imperative).
* When developing a component:
  1. Identify all its visual states.
  2. Determine the human and computer triggers for state changes.
  3. Model the state with `useState`.
  4. Remove non-essential state to avoid bugs and paradoxes.
  5. Connect the event handlers to set state.

## Choosing the State Structure

> **Source:** [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

Structuring state well can make a difference between a component that is pleasant to modify and debug, and one that is a constant source of bugs. Here are some tips you should consider when structuring state.

* When to use a single vs multiple state variables
* What to avoid when organizing state
* How to fix common issues with the state structure

### Principles for structuring state

When you write a component that holds some state, you'll have to make choices about how many state variables to use and what the shape of their data should be. While it's possible to write correct programs even with a suboptimal state structure, there are a few principles that can guide you to make better choices:

1. **Group related state.** If you always update two or more state variables at the same time, consider merging them into a single state variable.
2. **Avoid contradictions in state.** When the state is structured in a way that several pieces of state may contradict and "disagree" with each other, you leave room for mistakes. Try to avoid this.
3. **Avoid redundant state.** If you can calculate some information from the component's props or its existing state variables during rendering, you should not put that information into that component's state.
4. **Avoid duplication in state.** When the same data is duplicated between multiple state variables, or within nested objects, it is difficult to keep them in sync. Reduce duplication when you can.
5. **Avoid deeply nested state.** Deeply hierarchical state is not very convenient to update. When possible, prefer to structure state in a flat way.

The goal behind these principles is to *make state easy to update without introducing mistakes*. Removing redundant and duplicate data from state helps ensure that all its pieces stay in sync. This is similar to how a database engineer might want to ["normalize" the database structure](https://docs.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description) to reduce the chance of bugs. To paraphrase Albert Einstein, **"Make your state as simple as it can be--but no simpler."**

Now let's see how these principles apply in action.

### Group related state

You might sometimes be unsure between using a single or multiple state variables.

Should you do this?

```js
const [x, setX] = useState(0);
const [y, setY] = useState(0);
```

Or this?

```js
const [position, setPosition] = useState({ x: 0, y: 0 });
```

Technically, you can use either of these approaches. But **if some two state variables always change together, it might be a good idea to unify them into a single state variable.** Then you won't forget to always keep them in sync, like in this example where moving the cursor updates both coordinates of the red dot:

```js
import { useState } from 'react';

export default function MovingDot() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  return (
    <div
      onPointerMove={e => {
        setPosition({
          x: e.clientX,
          y: e.clientY
        });
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}>
      <div style={{
        position: 'absolute',
        backgroundColor: 'red',
        borderRadius: '50%',
        transform: `translate(${position.x}px, ${position.y}px)`,
        left: -10,
        top: -10,
        width: 20,
        height: 20,
      }} />
    </div>
  )
}
```

```css
body { margin: 0; padding: 0; height: 250px; }
```

Another case where you'll group data into an object or an array is when you don't know how many pieces of state you'll need. For example, it's helpful when you have a form where the user can add custom fields.

If your state variable is an object, remember that [you can't update only one field in it](https://react.dev/learn/updating-objects-in-state) without explicitly copying the other fields. For example, you can't do `setPosition({ x: 100 })` in the above example because it would not have the `y` property at all! Instead, if you wanted to set `x` alone, you would either do `setPosition({ ...position, x: 100 })`, or split them into two state variables and do `setX(100)`.

### Avoid contradictions in state

Here is a hotel feedback form with `isSending` and `isSent` state variables:

```js
import { useState } from 'react';

export default function FeedbackForm() {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSending(true);
    await sendMessage(text);
    setIsSending(false);
    setIsSent(true);
  }

  if (isSent) {
    return <h1>Thanks for feedback!</h1>
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>How was your stay at The Prancing Pony?</p>
      <textarea
        disabled={isSending}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <br />
      <button
        disabled={isSending}
        type="submit"
      >
        Send
      </button>
      {isSending && <p>Sending...</p>}
    </form>
  );
}

// Pretend to send a message.
function sendMessage(text) {
  return new Promise(resolve => {
    setTimeout(resolve, 2000);
  });
}
```

While this code works, it leaves the door open for "impossible" states. For example, if you forget to call `setIsSent` and `setIsSending` together, you may end up in a situation where both `isSending` and `isSent` are `true` at the same time. The more complex your component is, the harder it is to understand what happened.

**Since `isSending` and `isSent` should never be `true` at the same time, it is better to replace them with one `status` state variable that may take one of *three* valid states:** `'typing'` (initial), `'sending'`, and `'sent'`:

```js
import { useState } from 'react';

export default function FeedbackForm() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('typing');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    await sendMessage(text);
    setStatus('sent');
  }

  const isSending = status === 'sending';
  const isSent = status === 'sent';

  if (isSent) {
    return <h1>Thanks for feedback!</h1>
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>How was your stay at The Prancing Pony?</p>
      <textarea
        disabled={isSending}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <br />
      <button
        disabled={isSending}
        type="submit"
      >
        Send
      </button>
      {isSending && <p>Sending...</p>}
    </form>
  );
}

// Pretend to send a message.
function sendMessage(text) {
  return new Promise(resolve => {
    setTimeout(resolve, 2000);
  });
}
```

You can still declare some constants for readability:

```js
const isSending = status === 'sending';
const isSent = status === 'sent';
```

But they're not state variables, so you don't need to worry about them getting out of sync with each other.

### Avoid redundant state

If you can calculate some information from the component's props or its existing state variables during rendering, you **should not** put that information into that component's state.

For example, take this form. It works, but can you find any redundant state in it?

```js
import { useState } from 'react';

export default function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');

  function handleFirstNameChange(e) {
    setFirstName(e.target.value);
    setFullName(e.target.value + ' ' + lastName);
  }

  function handleLastNameChange(e) {
    setLastName(e.target.value);
    setFullName(firstName + ' ' + e.target.value);
  }

  return (
    <>
      <h2>Let’s check you in</h2>
      <label>
        First name:{' '}
        <input
          value={firstName}
          onChange={handleFirstNameChange}
        />
      </label>
      <label>
        Last name:{' '}
        <input
          value={lastName}
          onChange={handleLastNameChange}
        />
      </label>
      <p>
        Your ticket will be issued to: <b>{fullName}</b>
      </p>
    </>
  );
}
```

```css
label { display: block; margin-bottom: 5px; }
```

This form has three state variables: `firstName`, `lastName`, and `fullName`. However, `fullName` is redundant. **You can always calculate `fullName` from `firstName` and `lastName` during render, so remove it from state.**

This is how you can do it:

```js
import { useState } from 'react';

export default function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const fullName = firstName + ' ' + lastName;

  function handleFirstNameChange(e) {
    setFirstName(e.target.value);
  }

  function handleLastNameChange(e) {
    setLastName(e.target.value);
  }

  return (
    <>
      <h2>Let’s check you in</h2>
      <label>
        First name:{' '}
        <input
          value={firstName}
          onChange={handleFirstNameChange}
        />
      </label>
      <label>
        Last name:{' '}
        <input
          value={lastName}
          onChange={handleLastNameChange}
        />
      </label>
      <p>
        Your ticket will be issued to: <b>{fullName}</b>
      </p>
    </>
  );
}
```

```css
label { display: block; margin-bottom: 5px; }
```

Here, `fullName` is *not* a state variable. Instead, it's calculated during render:

```js
const fullName = firstName + ' ' + lastName;
```

As a result, the change handlers don't need to do anything special to update it. When you call `setFirstName` or `setLastName`, you trigger a re-render, and then the next `fullName` will be calculated from the fresh data.

##### Don't mirror props in state

A common example of redundant state is code like this:

```js
function Message({ messageColor }) {
  const [color, setColor] = useState(messageColor);
```

Here, a `color` state variable is initialized to the `messageColor` prop. The problem is that **if the parent component passes a different value of `messageColor` later (for example, `'red'` instead of `'blue'`), the `color` *state variable* would not be updated!** The state is only initialized during the first render.

This is why "mirroring" some prop in a state variable can lead to confusion. Instead, use the `messageColor` prop directly in your code. If you want to give it a shorter name, use a constant:

```js
function Message({ messageColor }) {
  const color = messageColor;
```

This way it won't get out of sync with the prop passed from the parent component.

"Mirroring" props into state only makes sense when you *want* to ignore all updates for a specific prop. By convention, start the prop name with `initial` or `default` to clarify that its new values are ignored:

```js
function Message({ initialColor }) {
  // The `color` state variable holds the *first* value of `initialColor`.
  // Further changes to the `initialColor` prop are ignored.
  const [color, setColor] = useState(initialColor);
```

### Avoid duplication in state

This menu list component lets you choose a single travel snack out of several:

```js
import { useState } from 'react';

const initialItems = [
  { title: 'pretzels', id: 0 },
  { title: 'crispy seaweed', id: 1 },
  { title: 'granola bar', id: 2 },
];

export default function Menu() {
  const [items, setItems] = useState(initialItems);
  const [selectedItem, setSelectedItem] = useState(
    items[0]
  );

  return (
    <>
      <h2>What's your travel snack?</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.title}
            {' '}
            <button onClick={() => {
              setSelectedItem(item);
            }}>Choose</button>
          </li>
        ))}
      </ul>
      <p>You picked {selectedItem.title}.</p>
    </>
  );
}
```

```css
button { margin-top: 10px; }
```

Currently, it stores the selected item as an object in the `selectedItem` state variable. However, this is not great: **the contents of the `selectedItem` is the same object as one of the items inside the `items` list.** This means that the information about the item itself is duplicated in two places.

Why is this a problem? Let's make each item editable:

```js
import { useState } from 'react';

const initialItems = [
  { title: 'pretzels', id: 0 },
  { title: 'crispy seaweed', id: 1 },
  { title: 'granola bar', id: 2 },
];

export default function Menu() {
  const [items, setItems] = useState(initialItems);
  const [selectedItem, setSelectedItem] = useState(
    items[0]
  );

  function handleItemChange(id, e) {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          title: e.target.value,
        };
      } else {
        return item;
      }
    }));
  }

  return (
    <>
      <h2>What's your travel snack?</h2>
      <ul>
        {items.map((item, index) => (
          <li key={item.id}>
            <input
              value={item.title}
              onChange={e => {
                handleItemChange(item.id, e)
              }}
            />
            {' '}
            <button onClick={() => {
              setSelectedItem(item);
            }}>Choose</button>
          </li>
        ))}
      </ul>
      <p>You picked {selectedItem.title}.</p>
    </>
  );
}
```

```css
button { margin-top: 10px; }
```

Notice how if you first click "Choose" on an item and *then* edit it, **the input updates but the label at the bottom does not reflect the edits.** This is because you have duplicated state, and you forgot to update `selectedItem`.

Although you could update `selectedItem` too, an easier fix is to remove duplication. In this example, instead of a `selectedItem` object (which creates a duplication with objects inside `items`), you hold the `selectedId` in state, and *then* get the `selectedItem` by searching the `items` array for an item with that ID:

```js
import { useState } from 'react';

const initialItems = [
  { title: 'pretzels', id: 0 },
  { title: 'crispy seaweed', id: 1 },
  { title: 'granola bar', id: 2 },
];

export default function Menu() {
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState(0);

  const selectedItem = items.find(item =>
    item.id === selectedId
  );

  function handleItemChange(id, e) {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          title: e.target.value,
        };
      } else {
        return item;
      }
    }));
  }

  return (
    <>
      <h2>What's your travel snack?</h2>
      <ul>
        {items.map((item, index) => (
          <li key={item.id}>
            <input
              value={item.title}
              onChange={e => {
                handleItemChange(item.id, e)
              }}
            />
            {' '}
            <button onClick={() => {
              setSelectedId(item.id);
            }}>Choose</button>
          </li>
        ))}
      </ul>
      <p>You picked {selectedItem.title}.</p>
    </>
  );
}
```

```css
button { margin-top: 10px; }
```

The state used to be duplicated like this:

* `items = [{ id: 0, title: 'pretzels'}, ...]`
* `selectedItem = {id: 0, title: 'pretzels'}`

But after the change it's like this:

* `items = [{ id: 0, title: 'pretzels'}, ...]`
* `selectedId = 0`

The duplication is gone, and you only keep the essential state!

Now if you edit the *selected* item, the message below will update immediately. This is because `setItems` triggers a re-render, and `items.find(...)` would find the item with the updated title. You didn't need to hold *the selected item* in state, because only the *selected ID* is essential. The rest could be calculated during render.

### Avoid deeply nested state

Imagine a travel plan consisting of planets, continents, and countries. You might be tempted to structure its state using nested objects and arrays, like in this example:

```js
import { useState } from 'react';
import { initialTravelPlan } from './places.js';

function PlaceTree({ place }) {
  const childPlaces = place.childPlaces;
  return (
    <li>
      {place.title}
      {childPlaces.length > 0 && (
        <ol>
          {childPlaces.map(place => (
            <PlaceTree key={place.id} place={place} />
          ))}
        </ol>
      )}
    </li>
  );
}

export default function TravelPlan() {
  const [plan, setPlan] = useState(initialTravelPlan);
  const planets = plan.childPlaces;
  return (
    <>
      <h2>Places to visit</h2>
      <ol>
        {planets.map(place => (
          <PlaceTree key={place.id} place={place} />
        ))}
      </ol>
    </>
  );
}
```

```js
export const initialTravelPlan = {
  id: 0,
  title: '(Root)',
  childPlaces: [{
    id: 1,
    title: 'Earth',
    childPlaces: [{
      id: 2,
      title: 'Africa',
      childPlaces: [{
        id: 3,
        title: 'Botswana',
        childPlaces: []
      }, {
        id: 4,
        title: 'Egypt',
        childPlaces: []
      }, {
        id: 5,
        title: 'Kenya',
        childPlaces: []
      }, {
        id: 6,
        title: 'Madagascar',
        childPlaces: []
      }, {
        id: 7,
        title: 'Morocco',
        childPlaces: []
      }, {
        id: 8,
        title: 'Nigeria',
        childPlaces: []
      }, {
        id: 9,
        title: 'South Africa',
        childPlaces: []
      }]
    }, {
      id: 10,
      title: 'Americas',
      childPlaces: [{
        id: 11,
        title: 'Argentina',
        childPlaces: []
      }, {
        id: 12,
        title: 'Brazil',
        childPlaces: []
      }, {
        id: 13,
        title: 'Barbados',
        childPlaces: []
      }, {
        id: 14,
        title: 'Canada',
        childPlaces: []
      }, {
        id: 15,
        title: 'Jamaica',
        childPlaces: []
      }, {
        id: 16,
        title: 'Mexico',
        childPlaces: []
      }, {
        id: 17,
        title: 'Trinidad and Tobago',
        childPlaces: []
      }, {
        id: 18,
        title: 'Venezuela',
        childPlaces: []
      }]
    }, {
      id: 19,
      title: 'Asia',
      childPlaces: [{
        id: 20,
        title: 'China',
        childPlaces: []
      }, {
        id: 21,
        title: 'India',
        childPlaces: []
      }, {
        id: 22,
        title: 'Singapore',
        childPlaces: []
      }, {
        id: 23,
        title: 'South Korea',
        childPlaces: []
      }, {
        id: 24,
        title: 'Thailand',
        childPlaces: []
      }, {
        id: 25,
        title: 'Vietnam',
        childPlaces: []
      }]
    }, {
      id: 26,
      title: 'Europe',
      childPlaces: [{
        id: 27,
        title: 'Croatia',
        childPlaces: [],
      }, {
        id: 28,
        title: 'France',
        childPlaces: [],
      }, {
        id: 29,
        title: 'Germany',
        childPlaces: [],
      }, {
        id: 30,
        title: 'Italy',
        childPlaces: [],
      }, {
        id: 31,
        title: 'Portugal',
        childPlaces: [],
      }, {
        id: 32,
        title: 'Spain',
        childPlaces: [],
      }, {
        id: 33,
        title: 'Turkey',
        childPlaces: [],
      }]
    }, {
      id: 34,
      title: 'Oceania',
      childPlaces: [{
        id: 35,
        title: 'Australia',
        childPlaces: [],
      }, {
        id: 36,
        title: 'Bora Bora (French Polynesia)',
        childPlaces: [],
      }, {
        id: 37,
        title: 'Easter Island (Chile)',
        childPlaces: [],
      }, {
        id: 38,
        title: 'Fiji',
        childPlaces: [],
      }, {
        id: 39,
        title: 'Hawaii (the USA)',
        childPlaces: [],
      }, {
        id: 40,
        title: 'New Zealand',
        childPlaces: [],
      }, {
        id: 41,
        title: 'Vanuatu',
        childPlaces: [],
      }]
    }]
  }, {
    id: 42,
    title: 'Moon',
    childPlaces: [{
      id: 43,
      title: 'Rheita',
      childPlaces: []
    }, {
      id: 44,
      title: 'Piccolomini',
      childPlaces: []
    }, {
      id: 45,
      title: 'Tycho',
      childPlaces: []
    }]
  }, {
    id: 46,
    title: 'Mars',
    childPlaces: [{
      id: 47,
      title: 'Corn Town',
      childPlaces: []
    }, {
      id: 48,
      title: 'Green Hill',
      childPlaces: []
    }]
  }]
};
```

Now let's say you want to add a button to delete a place you've already visited. How would you go about it? [Updating nested state](https://react.dev/learn/updating-objects-in-state#updating-a-nested-object) involves making copies of objects all the way up from the part that changed. Deleting a deeply nested place would involve copying its entire parent place chain. Such code can be very verbose.

**If the state is too nested to update easily, consider making it "flat".** Here is one way you can restructure this data. Instead of a tree-like structure where each `place` has an array of *its child places*, you can have each place hold an array of *its child place IDs*. Then store a mapping from each place ID to the corresponding place.

This data restructuring might remind you of seeing a database table:

```js
import { useState } from 'react';
import { initialTravelPlan } from './places.js';

function PlaceTree({ id, placesById }) {
  const place = placesById[id];
  const childIds = place.childIds;
  return (
    <li>
      {place.title}
      {childIds.length > 0 && (
        <ol>
          {childIds.map(childId => (
            <PlaceTree
              key={childId}
              id={childId}
              placesById={placesById}
            />
          ))}
        </ol>
      )}
    </li>
  );
}

export default function TravelPlan() {
  const [plan, setPlan] = useState(initialTravelPlan);
  const root = plan[0];
  const planetIds = root.childIds;
  return (
    <>
      <h2>Places to visit</h2>
      <ol>
        {planetIds.map(id => (
          <PlaceTree
            key={id}
            id={id}
            placesById={plan}
          />
        ))}
      </ol>
    </>
  );
}
```

```js
export const initialTravelPlan = {
  0: {
    id: 0,
    title: '(Root)',
    childIds: [1, 42, 46],
  },
  1: {
    id: 1,
    title: 'Earth',
    childIds: [2, 10, 19, 26, 34]
  },
  2: {
    id: 2,
    title: 'Africa',
    childIds: [3, 4, 5, 6 , 7, 8, 9]
  },
  3: {
    id: 3,
    title: 'Botswana',
    childIds: []
  },
  4: {
    id: 4,
    title: 'Egypt',
    childIds: []
  },
  5: {
    id: 5,
    title: 'Kenya',
    childIds: []
  },
  6: {
    id: 6,
    title: 'Madagascar',
    childIds: []
  },
  7: {
    id: 7,
    title: 'Morocco',
    childIds: []
  },
  8: {
    id: 8,
    title: 'Nigeria',
    childIds: []
  },
  9: {
    id: 9,
    title: 'South Africa',
    childIds: []
  },
  10: {
    id: 10,
    title: 'Americas',
    childIds: [11, 12, 13, 14, 15, 16, 17, 18],
  },
  11: {
    id: 11,
    title: 'Argentina',
    childIds: []
  },
  12: {
    id: 12,
    title: 'Brazil',
    childIds: []
  },
  13: {
    id: 13,
    title: 'Barbados',
    childIds: []
  },
  14: {
    id: 14,
    title: 'Canada',
    childIds: []
  },
  15: {
    id: 15,
    title: 'Jamaica',
    childIds: []
  },
  16: {
    id: 16,
    title: 'Mexico',
    childIds: []
  },
  17: {
    id: 17,
    title: 'Trinidad and Tobago',
    childIds: []
  },
  18: {
    id: 18,
    title: 'Venezuela',
    childIds: []
  },
  19: {
    id: 19,
    title: 'Asia',
    childIds: [20, 21, 22, 23, 24, 25],
  },
  20: {
    id: 20,
    title: 'China',
    childIds: []
  },
  21: {
    id: 21,
    title: 'India',
    childIds: []
  },
  22: {
    id: 22,
    title: 'Singapore',
    childIds: []
  },
  23: {
    id: 23,
    title: 'South Korea',
    childIds: []
  },
  24: {
    id: 24,
    title: 'Thailand',
    childIds: []
  },
  25: {
    id: 25,
    title: 'Vietnam',
    childIds: []
  },
  26: {
    id: 26,
    title: 'Europe',
    childIds: [27, 28, 29, 30, 31, 32, 33],
  },
  27: {
    id: 27,
    title: 'Croatia',
    childIds: []
  },
  28: {
    id: 28,
    title: 'France',
    childIds: []
  },
  29: {
    id: 29,
    title: 'Germany',
    childIds: []
  },
  30: {
    id: 30,
    title: 'Italy',
    childIds: []
  },
  31: {
    id: 31,
    title: 'Portugal',
    childIds: []
  },
  32: {
    id: 32,
    title: 'Spain',
    childIds: []
  },
  33: {
    id: 33,
    title: 'Turkey',
    childIds: []
  },
  34: {
    id: 34,
    title: 'Oceania',
    childIds: [35, 36, 37, 38, 39, 40, 41],
  },
  35: {
    id: 35,
    title: 'Australia',
    childIds: []
  },
  36: {
    id: 36,
    title: 'Bora Bora (French Polynesia)',
    childIds: []
  },
  37: {
    id: 37,
    title: 'Easter Island (Chile)',
    childIds: []
  },
  38: {
    id: 38,
    title: 'Fiji',
    childIds: []
  },
  39: {
    id: 40,
    title: 'Hawaii (the USA)',
    childIds: []
  },
  40: {
    id: 40,
    title: 'New Zealand',
    childIds: []
  },
  41: {
    id: 41,
    title: 'Vanuatu',
    childIds: []
  },
  42: {
    id: 42,
    title: 'Moon',
    childIds: [43, 44, 45]
  },
  43: {
    id: 43,
    title: 'Rheita',
    childIds: []
  },
  44: {
    id: 44,
    title: 'Piccolomini',
    childIds: []
  },
  45: {
    id: 45,
    title: 'Tycho',
    childIds: []
  },
  46: {
    id: 46,
    title: 'Mars',
    childIds: [47, 48]
  },
  47: {
    id: 47,
    title: 'Corn Town',
    childIds: []
  },
  48: {
    id: 48,
    title: 'Green Hill',
    childIds: []
  }
};
```

**Now that the state is "flat" (also known as "normalized"), updating nested items becomes easier.**

In order to remove a place now, you only need to update two levels of state:

- The updated version of its *parent* place should exclude the removed ID from its `childIds` array.
- The updated version of the root "table" object should include the updated version of the parent place.

Here is an example of how you could go about it:

```js
import { useState } from 'react';
import { initialTravelPlan } from './places.js';

export default function TravelPlan() {
  const [plan, setPlan] = useState(initialTravelPlan);

  function handleComplete(parentId, childId) {
    const parent = plan[parentId];
    // Create a new version of the parent place
    // that doesn't include this child ID.
    const nextParent = {
      ...parent,
      childIds: parent.childIds
        .filter(id => id !== childId)
    };
    // Update the root state object...
    setPlan({
      ...plan,
      // ...so that it has the updated parent.
      [parentId]: nextParent
    });
  }

  const root = plan[0];
  const planetIds = root.childIds;
  return (
    <>
      <h2>Places to visit</h2>
      <ol>
        {planetIds.map(id => (
          <PlaceTree
            key={id}
            id={id}
            parentId={0}
            placesById={plan}
            onComplete={handleComplete}
          />
        ))}
      </ol>
    </>
  );
}

function PlaceTree({ id, parentId, placesById, onComplete }) {
  const place = placesById[id];
  const childIds = place.childIds;
  return (
    <li>
      {place.title}
      <button onClick={() => {
        onComplete(parentId, id);
      }}>
        Complete
      </button>
      {childIds.length > 0 &&
        <ol>
          {childIds.map(childId => (
            <PlaceTree
              key={childId}
              id={childId}
              parentId={id}
              placesById={placesById}
              onComplete={onComplete}
            />
          ))}
        </ol>
      }
    </li>
  );
}
```

```js
export const initialTravelPlan = {
  0: {
    id: 0,
    title: '(Root)',
    childIds: [1, 42, 46],
  },
  1: {
    id: 1,
    title: 'Earth',
    childIds: [2, 10, 19, 26, 34]
  },
  2: {
    id: 2,
    title: 'Africa',
    childIds: [3, 4, 5, 6 , 7, 8, 9]
  },
  3: {
    id: 3,
    title: 'Botswana',
    childIds: []
  },
  4: {
    id: 4,
    title: 'Egypt',
    childIds: []
  },
  5: {
    id: 5,
    title: 'Kenya',
    childIds: []
  },
  6: {
    id: 6,
    title: 'Madagascar',
    childIds: []
  },
  7: {
    id: 7,
    title: 'Morocco',
    childIds: []
  },
  8: {
    id: 8,
    title: 'Nigeria',
    childIds: []
  },
  9: {
    id: 9,
    title: 'South Africa',
    childIds: []
  },
  10: {
    id: 10,
    title: 'Americas',
    childIds: [11, 12, 13, 14, 15, 16, 17, 18],
  },
  11: {
    id: 11,
    title: 'Argentina',
    childIds: []
  },
  12: {
    id: 12,
    title: 'Brazil',
    childIds: []
  },
  13: {
    id: 13,
    title: 'Barbados',
    childIds: []
  },
  14: {
    id: 14,
    title: 'Canada',
    childIds: []
  },
  15: {
    id: 15,
    title: 'Jamaica',
    childIds: []
  },
  16: {
    id: 16,
    title: 'Mexico',
    childIds: []
  },
  17: {
    id: 17,
    title: 'Trinidad and Tobago',
    childIds: []
  },
  18: {
    id: 18,
    title: 'Venezuela',
    childIds: []
  },
  19: {
    id: 19,
    title: 'Asia',
    childIds: [20, 21, 22, 23, 24, 25],
  },
  20: {
    id: 20,
    title: 'China',
    childIds: []
  },
  21: {
    id: 21,
    title: 'India',
    childIds: []
  },
  22: {
    id: 22,
    title: 'Singapore',
    childIds: []
  },
  23: {
    id: 23,
    title: 'South Korea',
    childIds: []
  },
  24: {
    id: 24,
    title: 'Thailand',
    childIds: []
  },
  25: {
    id: 25,
    title: 'Vietnam',
    childIds: []
  },
  26: {
    id: 26,
    title: 'Europe',
    childIds: [27, 28, 29, 30, 31, 32, 33],
  },
  27: {
    id: 27,
    title: 'Croatia',
    childIds: []
  },
  28: {
    id: 28,
    title: 'France',
    childIds: []
  },
  29: {
    id: 29,
    title: 'Germany',
    childIds: []
  },
  30: {
    id: 30,
    title: 'Italy',
    childIds: []
  },
  31: {
    id: 31,
    title: 'Portugal',
    childIds: []
  },
  32: {
    id: 32,
    title: 'Spain',
    childIds: []
  },
  33: {
    id: 33,
    title: 'Turkey',
    childIds: []
  },
  34: {
    id: 34,
    title: 'Oceania',
    childIds: [35, 36, 37, 38, 39, 40, 41],
  },
  35: {
    id: 35,
    title: 'Australia',
    childIds: []
  },
  36: {
    id: 36,
    title: 'Bora Bora (French Polynesia)',
    childIds: []
  },
  37: {
    id: 37,
    title: 'Easter Island (Chile)',
    childIds: []
  },
  38: {
    id: 38,
    title: 'Fiji',
    childIds: []
  },
  39: {
    id: 39,
    title: 'Hawaii (the USA)',
    childIds: []
  },
  40: {
    id: 40,
    title: 'New Zealand',
    childIds: []
  },
  41: {
    id: 41,
    title: 'Vanuatu',
    childIds: []
  },
  42: {
    id: 42,
    title: 'Moon',
    childIds: [43, 44, 45]
  },
  43: {
    id: 43,
    title: 'Rheita',
    childIds: []
  },
  44: {
    id: 44,
    title: 'Piccolomini',
    childIds: []
  },
  45: {
    id: 45,
    title: 'Tycho',
    childIds: []
  },
  46: {
    id: 46,
    title: 'Mars',
    childIds: [47, 48]
  },
  47: {
    id: 47,
    title: 'Corn Town',
    childIds: []
  },
  48: {
    id: 48,
    title: 'Green Hill',
    childIds: []
  }
};
```

```css
button { margin: 10px; }
```

You can nest state as much as you like, but making it "flat" can solve numerous problems. It makes state easier to update, and it helps ensure you don't have duplication in different parts of a nested object.

##### Improving memory usage

Ideally, you would also remove the deleted items (and their children!) from the "table" object to improve memory usage. This version does that. It also [uses Immer](https://react.dev/learn/updating-objects-in-state#write-concise-update-logic-with-immer) to make the update logic more concise.

```js
import { useImmer } from 'use-immer';
import { initialTravelPlan } from './places.js';

export default function TravelPlan() {
  const [plan, updatePlan] = useImmer(initialTravelPlan);

  function handleComplete(parentId, childId) {
    updatePlan(draft => {
      // Remove from the parent place's child IDs.
      const parent = draft[parentId];
      parent.childIds = parent.childIds
        .filter(id => id !== childId);

      // Forget this place and all its subtree.
      deleteAllChildren(childId);
      function deleteAllChildren(id) {
        const place = draft[id];
        place.childIds.forEach(deleteAllChildren);
        delete draft[id];
      }
    });
  }

  const root = plan[0];
  const planetIds = root.childIds;
  return (
    <>
      <h2>Places to visit</h2>
      <ol>
        {planetIds.map(id => (
          <PlaceTree
            key={id}
            id={id}
            parentId={0}
            placesById={plan}
            onComplete={handleComplete}
          />
        ))}
      </ol>
    </>
  );
}

function PlaceTree({ id, parentId, placesById, onComplete }) {
  const place = placesById[id];
  const childIds = place.childIds;
  return (
    <li>
      {place.title}
      <button onClick={() => {
        onComplete(parentId, id);
      }}>
        Complete
      </button>
      {childIds.length > 0 &&
        <ol>
          {childIds.map(childId => (
            <PlaceTree
              key={childId}
              id={childId}
              parentId={id}
              placesById={placesById}
              onComplete={onComplete}
            />
          ))}
        </ol>
      }
    </li>
  );
}
```

```js
export const initialTravelPlan = {
  0: {
    id: 0,
    title: '(Root)',
    childIds: [1, 42, 46],
  },
  1: {
    id: 1,
    title: 'Earth',
    childIds: [2, 10, 19, 26, 34]
  },
  2: {
    id: 2,
    title: 'Africa',
    childIds: [3, 4, 5, 6 , 7, 8, 9]
  },
  3: {
    id: 3,
    title: 'Botswana',
    childIds: []
  },
  4: {
    id: 4,
    title: 'Egypt',
    childIds: []
  },
  5: {
    id: 5,
    title: 'Kenya',
    childIds: []
  },
  6: {
    id: 6,
    title: 'Madagascar',
    childIds: []
  },
  7: {
    id: 7,
    title: 'Morocco',
    childIds: []
  },
  8: {
    id: 8,
    title: 'Nigeria',
    childIds: []
  },
  9: {
    id: 9,
    title: 'South Africa',
    childIds: []
  },
  10: {
    id: 10,
    title: 'Americas',
    childIds: [11, 12, 13, 14, 15, 16, 17, 18],
  },
  11: {
    id: 11,
    title: 'Argentina',
    childIds: []
  },
  12: {
    id: 12,
    title: 'Brazil',
    childIds: []
  },
  13: {
    id: 13,
    title: 'Barbados',
    childIds: []
  },
  14: {
    id: 14,
    title: 'Canada',
    childIds: []
  },
  15: {
    id: 15,
    title: 'Jamaica',
    childIds: []
  },
  16: {
    id: 16,
    title: 'Mexico',
    childIds: []
  },
  17: {
    id: 17,
    title: 'Trinidad and Tobago',
    childIds: []
  },
  18: {
    id: 18,
    title: 'Venezuela',
    childIds: []
  },
  19: {
    id: 19,
    title: 'Asia',
    childIds: [20, 21, 22, 23, 24, 25,],
  },
  20: {
    id: 20,
    title: 'China',
    childIds: []
  },
  21: {
    id: 21,
    title: 'India',
    childIds: []
  },
  22: {
    id: 22,
    title: 'Singapore',
    childIds: []
  },
  23: {
    id: 23,
    title: 'South Korea',
    childIds: []
  },
  24: {
    id: 24,
    title: 'Thailand',
    childIds: []
  },
  25: {
    id: 25,
    title: 'Vietnam',
    childIds: []
  },
  26: {
    id: 26,
    title: 'Europe',
    childIds: [27, 28, 29, 30, 31, 32, 33],
  },
  27: {
    id: 27,
    title: 'Croatia',
    childIds: []
  },
  28: {
    id: 28,
    title: 'France',
    childIds: []
  },
  29: {
    id: 29,
    title: 'Germany',
    childIds: []
  },
  30: {
    id: 30,
    title: 'Italy',
    childIds: []
  },
  31: {
    id: 31,
    title: 'Portugal',
    childIds: []
  },
  32: {
    id: 32,
    title: 'Spain',
    childIds: []
  },
  33: {
    id: 33,
    title: 'Turkey',
    childIds: []
  },
  34: {
    id: 34,
    title: 'Oceania',
    childIds: [35, 36, 37, 38, 39, 40, 41],
  },
  35: {
    id: 35,
    title: 'Australia',
    childIds: []
  },
  36: {
    id: 36,
    title: 'Bora Bora (French Polynesia)',
    childIds: []
  },
  37: {
    id: 37,
    title: 'Easter Island (Chile)',
    childIds: []
  },
  38: {
    id: 38,
    title: 'Fiji',
    childIds: []
  },
  39: {
    id: 39,
    title: 'Hawaii (the USA)',
    childIds: []
  },
  40: {
    id: 40,
    title: 'New Zealand',
    childIds: []
  },
  41: {
    id: 41,
    title: 'Vanuatu',
    childIds: []
  },
  42: {
    id: 42,
    title: 'Moon',
    childIds: [43, 44, 45]
  },
  43: {
    id: 43,
    title: 'Rheita',
    childIds: []
  },
  44: {
    id: 44,
    title: 'Piccolomini',
    childIds: []
  },
  45: {
    id: 45,
    title: 'Tycho',
    childIds: []
  },
  46: {
    id: 46,
    title: 'Mars',
    childIds: [47, 48]
  },
  47: {
    id: 47,
    title: 'Corn Town',
    childIds: []
  },
  48: {
    id: 48,
    title: 'Green Hill',
    childIds: []
  }
};
```

```css
button { margin: 10px; }
```

```json
{
  "dependencies": {
    "immer": "1.7.3",
    "react": "latest",
    "react-dom": "latest",
    "react-scripts": "latest",
    "use-immer": "0.5.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}
```

Sometimes, you can also reduce state nesting by moving some of the nested state into the child components. This works well for ephemeral UI state that doesn't need to be stored, like whether an item is hovered.

* If two state variables always update together, consider merging them into one.
* Choose your state variables carefully to avoid creating "impossible" states.
* Structure your state in a way that reduces the chances that you'll make a mistake updating it.
* Avoid redundant and duplicate state so that you don't need to keep it in sync.
* Don't put props *into* state unless you specifically want to prevent updates.
* For UI patterns like selection, keep ID or index in state instead of the object itself.
* If updating deeply nested state is complicated, try flattening it.

## Sharing State Between Components

> **Source:** [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

Sometimes, you want the state of two components to always change together. To do it, remove state from both of them, move it to their closest common parent, and then pass it down to them via props. This is known as *lifting state up,* and it's one of the most common things you will do writing React code.

- How to share state between components by lifting it up
- What are controlled and uncontrolled components

### Lifting state up by example

In this example, a parent `Accordion` component renders two separate `Panel`s:

* `Accordion`
  - `Panel`
  - `Panel`

Each `Panel` component has a boolean `isActive` state that determines whether its content is visible.

Press the Show button for both panels:

```js
import { useState } from 'react';

function Panel({ title, children }) {
  const [isActive, setIsActive] = useState(false);
  return (
    <section className="panel">
      <h3>{title}</h3>
      {isActive ? (
        <p>{children}</p>
      ) : (
        <button onClick={() => setIsActive(true)}>
          Show
        </button>
      )}
    </section>
  );
}

export default function Accordion() {
  return (
    <>
      <h2>Almaty, Kazakhstan</h2>
      <Panel title="About">
        With a population of about 2 million, Almaty is Kazakhstan's largest city. From 1929 to 1997, it was its capital city.
      </Panel>
      <Panel title="Etymology">
        The name comes from <span lang="kk-KZ">алма</span>, the Kazakh word for "apple" and is often translated as "full of apples". In fact, the region surrounding Almaty is thought to be the ancestral home of the apple, and the wild <i lang="la">Malus sieversii</i> is considered a likely candidate for the ancestor of the modern domestic apple.
      </Panel>
    </>
  );
}
```

```css
h3, p { margin: 5px 0px; }
.panel {
  padding: 10px;
  border: 1px solid #aaa;
}
```

Notice how pressing one panel's button does not affect the other panel--they are independent.

Initially, each `Panel`'s `isActive` state is `false`, so they both appear collapsed

Clicking either `Panel`'s button will only update that `Panel`'s `isActive` state alone

**But now let's say you want to change it so that only one panel is expanded at any given time.** With that design, expanding the second panel should collapse the first one. How would you do that?

To coordinate these two panels, you need to "lift their state up" to a parent component in three steps:

1. **Remove** state from the child components.
2. **Pass** hardcoded data from the common parent.
3. **Add** state to the common parent and pass it down together with the event handlers.

This will allow the `Accordion` component to coordinate both `Panel`s and only expand one at a time.

#### Step 1: Remove state from the child components

You will give control of the `Panel`'s `isActive` to its parent component. This means that the parent component will pass `isActive` to `Panel` as a prop instead. Start by **removing this line** from the `Panel` component:

```js
const [isActive, setIsActive] = useState(false);
```

And instead, add `isActive` to the `Panel`'s list of props:

```js
function Panel({ title, children, isActive }) {
```

Now the `Panel`'s parent component can *control* `isActive` by [passing it down as a prop.](https://react.dev/learn/passing-props-to-a-component) Conversely, the `Panel` component now has *no control* over the value of `isActive`--it's now up to the parent component!

#### Step 2: Pass hardcoded data from the common parent

To lift state up, you must locate the closest common parent component of *both* of the child components that you want to coordinate:

* `Accordion` *(closest common parent)*
  - `Panel`
  - `Panel`

In this example, it's the `Accordion` component. Since it's above both panels and can control their props, it will become the "source of truth" for which panel is currently active. Make the `Accordion` component pass a hardcoded value of `isActive` (for example, `true`) to both panels:

```js
import { useState } from 'react';

export default function Accordion() {
  return (
    <>
      <h2>Almaty, Kazakhstan</h2>
      <Panel title="About" isActive={true}>
        With a population of about 2 million, Almaty is Kazakhstan's largest city. From 1929 to 1997, it was its capital city.
      </Panel>
      <Panel title="Etymology" isActive={true}>
        The name comes from <span lang="kk-KZ">алма</span>, the Kazakh word for "apple" and is often translated as "full of apples". In fact, the region surrounding Almaty is thought to be the ancestral home of the apple, and the wild <i lang="la">Malus sieversii</i> is considered a likely candidate for the ancestor of the modern domestic apple.
      </Panel>
    </>
  );
}

function Panel({ title, children, isActive }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {isActive ? (
        <p>{children}</p>
      ) : (
        <button onClick={() => setIsActive(true)}>
          Show
        </button>
      )}
    </section>
  );
}
```

```css
h3, p { margin: 5px 0px; }
.panel {
  padding: 10px;
  border: 1px solid #aaa;
}
```

Try editing the hardcoded `isActive` values in the `Accordion` component and see the result on the screen.

#### Step 3: Add state to the common parent

Lifting state up often changes the nature of what you're storing as state.

In this case, only one panel should be active at a time. This means that the `Accordion` common parent component needs to keep track of *which* panel is the active one. Instead of a `boolean` value, it could use a number as the index of the active `Panel` for the state variable:

```js
const [activeIndex, setActiveIndex] = useState(0);
```

When the `activeIndex` is `0`, the first panel is active, and when it's `1`, it's the second one.

Clicking the "Show" button in either `Panel` needs to change the active index in `Accordion`. A `Panel` can't set the `activeIndex` state directly because it's defined inside the `Accordion`. The `Accordion` component needs to *explicitly allow* the `Panel` component to change its state by [passing an event handler down as a prop](https://react.dev/learn/responding-to-events#passing-event-handlers-as-props):

```js
<>
  <Panel
    isActive={activeIndex === 0}
    onShow={() => setActiveIndex(0)}
  >
    ...
  </Panel>
  <Panel
    isActive={activeIndex === 1}
    onShow={() => setActiveIndex(1)}
  >
    ...
  </Panel>
</>
```

The `<button>` inside the `Panel` will now use the `onShow` prop as its click event handler:

```js
import { useState } from 'react';

export default function Accordion() {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <>
      <h2>Almaty, Kazakhstan</h2>
      <Panel
        title="About"
        isActive={activeIndex === 0}
        onShow={() => setActiveIndex(0)}
      >
        With a population of about 2 million, Almaty is Kazakhstan's largest city. From 1929 to 1997, it was its capital city.
      </Panel>
      <Panel
        title="Etymology"
        isActive={activeIndex === 1}
        onShow={() => setActiveIndex(1)}
      >
        The name comes from <span lang="kk-KZ">алма</span>, the Kazakh word for "apple" and is often translated as "full of apples". In fact, the region surrounding Almaty is thought to be the ancestral home of the apple, and the wild <i lang="la">Malus sieversii</i> is considered a likely candidate for the ancestor of the modern domestic apple.
      </Panel>
    </>
  );
}

function Panel({
  title,
  children,
  isActive,
  onShow
}) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {isActive ? (
        <p>{children}</p>
      ) : (
        <button onClick={onShow}>
          Show
        </button>
      )}
    </section>
  );
}
```

```css
h3, p { margin: 5px 0px; }
.panel {
  padding: 10px;
  border: 1px solid #aaa;
}
```

This completes lifting state up! Moving state into the common parent component allowed you to coordinate the two panels. Using the active index instead of two "is shown" flags ensured that only one panel is active at a given time. And passing down the event handler to the child allowed the child to change the parent's state.

Initially, `Accordion`'s `activeIndex` is `0`, so the first `Panel` receives `isActive = true`

When `Accordion`'s `activeIndex` state changes to `1`, the second `Panel` receives `isActive = true` instead

##### Controlled and uncontrolled components

It is common to call a component with some local state "uncontrolled". For example, the original `Panel` component with an `isActive` state variable is uncontrolled because its parent cannot influence whether the panel is active or not.

In contrast, you might say a component is "controlled" when the important information in it is driven by props rather than its own local state. This lets the parent component fully specify its behavior. The final `Panel` component with the `isActive` prop is controlled by the `Accordion` component.

Uncontrolled components are easier to use within their parents because they require less configuration. But they're less flexible when you want to coordinate them together. Controlled components are maximally flexible, but they require the parent components to fully configure them with props.

In practice, "controlled" and "uncontrolled" aren't strict technical terms--each component usually has some mix of both local state and props. However, this is a useful way to talk about how components are designed and what capabilities they offer.

When writing a component, consider which information in it should be controlled (via props), and which information should be uncontrolled (via state). But you can always change your mind and refactor later.

### A single source of truth for each state

In a React application, many components will have their own state. Some state may "live" close to the leaf components (components at the bottom of the tree) like inputs. Other state may "live" closer to the top of the app. For example, even client-side routing libraries are usually implemented by storing the current route in the React state, and passing it down by props!

**For each unique piece of state, you will choose the component that "owns" it.** This principle is also known as having a ["single source of truth".](https://en.wikipedia.org/wiki/Single_source_of_truth) It doesn't mean that all state lives in one place--but that for _each_ piece of state, there is a _specific_ component that holds that piece of information. Instead of duplicating shared state between components, *lift it up* to their common shared parent, and *pass it down* to the children that need it.

Your app will change as you work on it. It is common that you will move state down or back up while you're still figuring out where each piece of the state "lives". This is all part of the process!

To see what this feels like in practice with a few more components, read [Thinking in React.](https://react.dev/learn/thinking-in-react)

* When you want to coordinate two components, move their state to their common parent.
* Then pass the information down through props from their common parent.
* Finally, pass the event handlers down so that the children can change the parent's state.
* It's useful to consider components as "controlled" (driven by props) or "uncontrolled" (driven by state).

## Extracting State Logic into a Reducer

> **Source:** [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

Components with many state updates spread across many event handlers can get overwhelming. For these cases, you can consolidate all the state update logic outside your component in a single function, called a _reducer._

- What a reducer function is
- How to refactor `useState` to `useReducer`
- When to use a reducer
- How to write one well

### Consolidate state logic with a reducer

As your components grow in complexity, it can get harder to see at a glance all the different ways in which a component's state gets updated. For example, the `TaskApp` component below holds an array of `tasks` in state and uses three different event handlers to add, remove, and edit tasks:

```js
import { useState } from 'react';
import AddTask from './AddTask.js';
import TaskList from './TaskList.js';

export default function TaskApp() {
  const [tasks, setTasks] = useState(initialTasks);

  function handleAddTask(text) {
    setTasks([
      ...tasks,
      {
        id: nextId++,
        text: text,
        done: false,
      },
    ]);
  }

  function handleChangeTask(task) {
    setTasks(
      tasks.map((t) => {
        if (t.id === task.id) {
          return task;
        } else {
          return t;
        }
      })
    );
  }

  function handleDeleteTask(taskId) {
    setTasks(tasks.filter((t) => t.id !== taskId));
  }

  return (
    <>
      <h1>Prague itinerary</h1>
      <AddTask onAddTask={handleAddTask} />
      <TaskList
        tasks={tasks}
        onChangeTask={handleChangeTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}

let nextId = 3;
const initialTasks = [
  {id: 0, text: 'Visit Kafka Museum', done: true},
  {id: 1, text: 'Watch a puppet show', done: false},
  {id: 2, text: 'Lennon Wall pic', done: false},
];
```

```js
import { useState } from 'react';

export default function AddTask({onAddTask}) {
  const [text, setText] = useState('');
  return (
    <>
      <input
        placeholder="Add task"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => {
          setText('');
          onAddTask(text);
        }}>
        Add
      </button>
    </>
  );
}
```

```js
import { useState } from 'react';

export default function TaskList({tasks, onChangeTask, onDeleteTask}) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <Task task={task} onChange={onChangeTask} onDelete={onDeleteTask} />
        </li>
      ))}
    </ul>
  );
}

function Task({task, onChange, onDelete}) {
  const [isEditing, setIsEditing] = useState(false);
  let taskContent;
  if (isEditing) {
    taskContent = (
      <>
        <input
          value={task.text}
          onChange={(e) => {
            onChange({
              ...task,
              text: e.target.value,
            });
          }}
        />
        <button onClick={() => setIsEditing(false)}>Save</button>
      </>
    );
  } else {
    taskContent = (
      <>
        {task.text}
        <button onClick={() => setIsEditing(true)}>Edit</button>
      </>
    );
  }
  return (
    <label>
      <input
        type="checkbox"
        checked={task.done}
        onChange={(e) => {
          onChange({
            ...task,
            done: e.target.checked,
          });
        }}
      />
      {taskContent}
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </label>
  );
}
```

```css
button {
  margin: 5px;
}
li {
  list-style-type: none;
}
ul,
li {
  margin: 0;
  padding: 0;
}
```

Each of its event handlers calls `setTasks` in order to update the state. As this component grows, so does the amount of state logic sprinkled throughout it. To reduce this complexity and keep all your logic in one easy-to-access place, you can move that state logic into a single function outside your component, **called a "reducer".**

Reducers are a different way to handle state. You can migrate from `useState` to `useReducer` in three steps:

1. **Move** from setting state to dispatching actions.
2. **Write** a reducer function.
3. **Use** the reducer from your component.

#### Step 1: Move from setting state to dispatching actions

Your event handlers currently specify _what to do_ by setting state:

```js
function handleAddTask(text) {
  setTasks([
    ...tasks,
    {
      id: nextId++,
      text: text,
      done: false,
    },
  ]);
}

function handleChangeTask(task) {
  setTasks(
    tasks.map((t) => {
      if (t.id === task.id) {
        return task;
      } else {
        return t;
      }
    })
  );
}

function handleDeleteTask(taskId) {
  setTasks(tasks.filter((t) => t.id !== taskId));
}
```

Remove all the state setting logic. What you are left with are three event handlers:

- `handleAddTask(text)` is called when the user presses "Add".
- `handleChangeTask(task)` is called when the user toggles a task or presses "Save".
- `handleDeleteTask(taskId)` is called when the user presses "Delete".

Managing state with reducers is slightly different from directly setting state. Instead of telling React "what to do" by setting state, you specify "what the user just did" by dispatching "actions" from your event handlers. (The state update logic will live elsewhere!) So instead of "setting `tasks`" via an event handler, you're dispatching an "added/changed/deleted a task" action. This is more descriptive of the user's intent.

```js
function handleAddTask(text) {
  dispatch({
    type: 'added',
    id: nextId++,
    text: text,
  });
}

function handleChangeTask(task) {
  dispatch({
    type: 'changed',
    task: task,
  });
}

function handleDeleteTask(taskId) {
  dispatch({
    type: 'deleted',
    id: taskId,
  });
}
```

The object you pass to `dispatch` is called an "action":

```js
function handleDeleteTask(taskId) {
  dispatch(
    // "action" object:
    {
      type: 'deleted',
      id: taskId,
    }
  );
}
```

It is a regular JavaScript object. You decide what to put in it, but generally it should contain the minimal information about _what happened_. (You will add the `dispatch` function itself in a later step.)

An action object can have any shape.

By convention, it is common to give it a string `type` that describes what happened, and pass any additional information in other fields. The `type` is specific to a component, so in this example either `'added'` or `'added_task'` would be fine. Choose a name that says what happened!

```js
dispatch({
  // specific to component
  type: 'what_happened',
  // other fields go here
});
```

#### Step 2: Write a reducer function

A reducer function is where you will put your state logic. It takes two arguments, the current state and the action object, and it returns the next state:

```js
function yourReducer(state, action) {
  // return next state for React to set
}
```

React will set the state to what you return from the reducer.

To move your state setting logic from your event handlers to a reducer function in this example, you will:

1. Declare the current state (`tasks`) as the first argument.
2. Declare the `action` object as the second argument.
3. Return the _next_ state from the reducer (which React will set the state to).

Here is all the state setting logic migrated to a reducer function:

```js
function tasksReducer(tasks, action) {
  if (action.type === 'added') {
    return [
      ...tasks,
      {
        id: action.id,
        text: action.text,
        done: false,
      },
    ];
  } else if (action.type === 'changed') {
    return tasks.map((t) => {
      if (t.id === action.task.id) {
        return action.task;
      } else {
        return t;
      }
    });
  } else if (action.type === 'deleted') {
    return tasks.filter((t) => t.id !== action.id);
  } else {
    throw Error('Unknown action: ' + action.type);
  }
}
```

Because the reducer function takes state (`tasks`) as an argument, you can **declare it outside of your component.** This decreases the indentation level and can make your code easier to read.

The code above uses if/else statements, but it's a convention to use [switch statements](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/switch) inside reducers. The result is the same, but it can be easier to read switch statements at a glance.

We'll be using them throughout the rest of this documentation like so:

```js
function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [
        ...tasks,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    }
    case 'changed': {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case 'deleted': {
      return tasks.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
```

We recommend wrapping each `case` block into the `{` and `}` curly braces so that variables declared inside of different `case`s don't clash with each other. Also, a `case` should usually end with a `return`. If you forget to `return`, the code will "fall through" to the next `case`, which can lead to mistakes!

If you're not yet comfortable with switch statements, using if/else is completely fine.

##### Why are reducers called this way?

Although reducers can "reduce" the amount of code inside your component, they are actually named after the [`reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) operation that you can perform on arrays.

The `reduce()` operation lets you take an array and "accumulate" a single value out of many:

```
const arr = [1, 2, 3, 4, 5];
const sum = arr.reduce(
  (result, number) => result + number
); // 1 + 2 + 3 + 4 + 5
```

The function you pass to `reduce` is known as a "reducer". It takes the _result so far_ and the _current item,_ then it returns the _next result._ React reducers are an example of the same idea: they take the _state so far_ and the _action_, and return the _next state._ In this way, they accumulate actions over time into state.

You could even use the `reduce()` method with an `initialState` and an array of `actions` to calculate the final state by passing your reducer function to it:

```js
import tasksReducer from './tasksReducer.js';

let initialState = [];
let actions = [
  {type: 'added', id: 1, text: 'Visit Kafka Museum'},
  {type: 'added', id: 2, text: 'Watch a puppet show'},
  {type: 'deleted', id: 1},
  {type: 'added', id: 3, text: 'Lennon Wall pic'},
];

let finalState = actions.reduce(tasksReducer, initialState);

const output = document.getElementById('output');
output.textContent = JSON.stringify(finalState, null, 2);
```

```js
export default function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [
        ...tasks,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    }
    case 'changed': {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case 'deleted': {
      return tasks.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
```

```html
<pre id="output"></pre>
```

You probably won't need to do this yourself, but this is similar to what React does!

#### Step 3: Use the reducer from your component

Finally, you need to hook up the `tasksReducer` to your component. Import the `useReducer` Hook from React:

```js
import { useReducer } from 'react';
```

Then you can replace `useState`:

```js
const [tasks, setTasks] = useState(initialTasks);
```

with `useReducer` like so:

```js
const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
```

The `useReducer` Hook is similar to `useState`—you must pass it an initial state and it returns a stateful value and a way to set state (in this case, the dispatch function). But it's a little different.

The `useReducer` Hook takes two arguments:

1. A reducer function
2. An initial state

And it returns:

1. A stateful value
2. A dispatch function (to "dispatch" user actions to the reducer)

Now it's fully wired up! Here, the reducer is declared at the bottom of the component file:

```js
import { useReducer } from 'react';
import AddTask from './AddTask.js';
import TaskList from './TaskList.js';

export default function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text,
    });
  }

  function handleChangeTask(task) {
    dispatch({
      type: 'changed',
      task: task,
    });
  }

  function handleDeleteTask(taskId) {
    dispatch({
      type: 'deleted',
      id: taskId,
    });
  }

  return (
    <>
      <h1>Prague itinerary</h1>
      <AddTask onAddTask={handleAddTask} />
      <TaskList
        tasks={tasks}
        onChangeTask={handleChangeTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}

function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [
        ...tasks,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    }
    case 'changed': {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case 'deleted': {
      return tasks.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

let nextId = 3;
const initialTasks = [
  {id: 0, text: 'Visit Kafka Museum', done: true},
  {id: 1, text: 'Watch a puppet show', done: false},
  {id: 2, text: 'Lennon Wall pic', done: false},
];
```

```js
import { useState } from 'react';

export default function AddTask({onAddTask}) {
  const [text, setText] = useState('');
  return (
    <>
      <input
        placeholder="Add task"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => {
          setText('');
          onAddTask(text);
        }}>
        Add
      </button>
    </>
  );
}
```

```js
import { useState } from 'react';

export default function TaskList({tasks, onChangeTask, onDeleteTask}) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <Task task={task} onChange={onChangeTask} onDelete={onDeleteTask} />
        </li>
      ))}
    </ul>
  );
}

function Task({task, onChange, onDelete}) {
  const [isEditing, setIsEditing] = useState(false);
  let taskContent;
  if (isEditing) {
    taskContent = (
      <>
        <input
          value={task.text}
          onChange={(e) => {
            onChange({
              ...task,
              text: e.target.value,
            });
          }}
        />
        <button onClick={() => setIsEditing(false)}>Save</button>
      </>
    );
  } else {
    taskContent = (
      <>
        {task.text}
        <button onClick={() => setIsEditing(true)}>Edit</button>
      </>
    );
  }
  return (
    <label>
      <input
        type="checkbox"
        checked={task.done}
        onChange={(e) => {
          onChange({
            ...task,
            done: e.target.checked,
          });
        }}
      />
      {taskContent}
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </label>
  );
}
```

```css
button {
  margin: 5px;
}
li {
  list-style-type: none;
}
ul,
li {
  margin: 0;
  padding: 0;
}
```

If you want, you can even move the reducer to a different file:

```js
import { useReducer } from 'react';
import AddTask from './AddTask.js';
import TaskList from './TaskList.js';
import tasksReducer from './tasksReducer.js';

export default function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text,
    });
  }

  function handleChangeTask(task) {
    dispatch({
      type: 'changed',
      task: task,
    });
  }

  function handleDeleteTask(taskId) {
    dispatch({
      type: 'deleted',
      id: taskId,
    });
  }

  return (
    <>
      <h1>Prague itinerary</h1>
      <AddTask onAddTask={handleAddTask} />
      <TaskList
        tasks={tasks}
        onChangeTask={handleChangeTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}

let nextId = 3;
const initialTasks = [
  {id: 0, text: 'Visit Kafka Museum', done: true},
  {id: 1, text: 'Watch a puppet show', done: false},
  {id: 2, text: 'Lennon Wall pic', done: false},
];
```

```js
export default function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [
        ...tasks,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    }
    case 'changed': {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case 'deleted': {
      return tasks.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
```

```js
import { useState } from 'react';

export default function AddTask({onAddTask}) {
  const [text, setText] = useState('');
  return (
    <>
      <input
        placeholder="Add task"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => {
          setText('');
          onAddTask(text);
        }}>
        Add
      </button>
    </>
  );
}
```

```js
import { useState } from 'react';

export default function TaskList({tasks, onChangeTask, onDeleteTask}) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <Task task={task} onChange={onChangeTask} onDelete={onDeleteTask} />
        </li>
      ))}
    </ul>
  );
}

function Task({task, onChange, onDelete}) {
  const [isEditing, setIsEditing] = useState(false);
  let taskContent;
  if (isEditing) {
    taskContent = (
      <>
        <input
          value={task.text}
          onChange={(e) => {
            onChange({
              ...task,
              text: e.target.value,
            });
          }}
        />
        <button onClick={() => setIsEditing(false)}>Save</button>
      </>
    );
  } else {
    taskContent = (
      <>
        {task.text}
        <button onClick={() => setIsEditing(true)}>Edit</button>
      </>
    );
  }
  return (
    <label>
      <input
        type="checkbox"
        checked={task.done}
        onChange={(e) => {
          onChange({
            ...task,
            done: e.target.checked,
          });
        }}
      />
      {taskContent}
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </label>
  );
}
```

```css
button {
  margin: 5px;
}
li {
  list-style-type: none;
}
ul,
li {
  margin: 0;
  padding: 0;
}
```

Component logic can be easier to read when you separate concerns like this. Now the event handlers only specify _what happened_ by dispatching actions, and the reducer function determines _how the state updates_ in response to them.

### Comparing `useState` and `useReducer`

Reducers are not without downsides! Here's a few ways you can compare them:

- **Code size:** Generally, with `useState` you have to write less code upfront. With `useReducer`, you have to write both a reducer function _and_ dispatch actions. However, `useReducer` can help cut down on the code if many event handlers modify state in a similar way.
- **Readability:** `useState` is very easy to read when the state updates are simple. When they get more complex, they can bloat your component's code and make it difficult to scan. In this case, `useReducer` lets you cleanly separate the _how_ of update logic from the _what happened_ of event handlers.
- **Debugging:** When you have a bug with `useState`, it can be difficult to tell _where_ the state was set incorrectly, and _why_. With `useReducer`, you can add a console log into your reducer to see every state update, and _why_ it happened (due to which `action`). If each `action` is correct, you'll know that the mistake is in the reducer logic itself. However, you have to step through more code than with `useState`.
- **Testing:** A reducer is a pure function that doesn't depend on your component. This means that you can export and test it separately in isolation. While generally it's best to test components in a more realistic environment, for complex state update logic it can be useful to assert that your reducer returns a particular state for a particular initial state and action.
- **Personal preference:** Some people like reducers, others don't. That's okay. It's a matter of preference. You can always convert between `useState` and `useReducer` back and forth: they are equivalent!

We recommend using a reducer if you often encounter bugs due to incorrect state updates in some component, and want to introduce more structure to its code. You don't have to use reducers for everything: feel free to mix and match! You can even `useState` and `useReducer` in the same component.

### Writing reducers well

Keep these two tips in mind when writing reducers:

- **Reducers must be pure.** Similar to [state updater functions](https://react.dev/learn/queueing-a-series-of-state-updates), reducers run during rendering! (Actions are queued until the next render.) This means that reducers [must be pure](https://react.dev/learn/keeping-components-pure)—same inputs always result in the same output. They should not send requests, schedule timeouts, or perform any side effects (operations that impact things outside the component). They should update [objects](https://react.dev/learn/updating-objects-in-state) and [arrays](https://react.dev/learn/updating-arrays-in-state) without mutations.
- **Each action describes a single user interaction, even if that leads to multiple changes in the data.** For example, if a user presses "Reset" on a form with five fields managed by a reducer, it makes more sense to dispatch one `reset_form` action rather than five separate `set_field` actions. If you log every action in a reducer, that log should be clear enough for you to reconstruct what interactions or responses happened in what order. This helps with debugging!

### Writing concise reducers with Immer

Just like with [updating objects](https://react.dev/learn/updating-objects-in-state#write-concise-update-logic-with-immer) and [arrays](https://react.dev/learn/updating-arrays-in-state#write-concise-update-logic-with-immer) in regular state, you can use the Immer library to make reducers more concise. Here, [`useImmerReducer`](https://github.com/immerjs/use-immer#useimmerreducer) lets you mutate the state with `push` or `arr[i] =` assignment:

```js
import { useImmerReducer } from 'use-immer';
import AddTask from './AddTask.js';
import TaskList from './TaskList.js';

function tasksReducer(draft, action) {
  switch (action.type) {
    case 'added': {
      draft.push({
        id: action.id,
        text: action.text,
        done: false,
      });
      break;
    }
    case 'changed': {
      const index = draft.findIndex((t) => t.id === action.task.id);
      draft[index] = action.task;
      break;
    }
    case 'deleted': {
      return draft.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

export default function TaskApp() {
  const [tasks, dispatch] = useImmerReducer(tasksReducer, initialTasks);

  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text,
    });
  }

  function handleChangeTask(task) {
    dispatch({
      type: 'changed',
      task: task,
    });
  }

  function handleDeleteTask(taskId) {
    dispatch({
      type: 'deleted',
      id: taskId,
    });
  }

  return (
    <>
      <h1>Prague itinerary</h1>
      <AddTask onAddTask={handleAddTask} />
      <TaskList
        tasks={tasks}
        onChangeTask={handleChangeTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}

let nextId = 3;
const initialTasks = [
  {id: 0, text: 'Visit Kafka Museum', done: true},
  {id: 1, text: 'Watch a puppet show', done: false},
  {id: 2, text: 'Lennon Wall pic', done: false},
];
```

```js
import { useState } from 'react';

export default function AddTask({onAddTask}) {
  const [text, setText] = useState('');
  return (
    <>
      <input
        placeholder="Add task"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => {
          setText('');
          onAddTask(text);
        }}>
        Add
      </button>
    </>
  );
}
```

```js
import { useState } from 'react';

export default function TaskList({tasks, onChangeTask, onDeleteTask}) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <Task task={task} onChange={onChangeTask} onDelete={onDeleteTask} />
        </li>
      ))}
    </ul>
  );
}

function Task({task, onChange, onDelete}) {
  const [isEditing, setIsEditing] = useState(false);
  let taskContent;
  if (isEditing) {
    taskContent = (
      <>
        <input
          value={task.text}
          onChange={(e) => {
            onChange({
              ...task,
              text: e.target.value,
            });
          }}
        />
        <button onClick={() => setIsEditing(false)}>Save</button>
      </>
    );
  } else {
    taskContent = (
      <>
        {task.text}
        <button onClick={() => setIsEditing(true)}>Edit</button>
      </>
    );
  }
  return (
    <label>
      <input
        type="checkbox"
        checked={task.done}
        onChange={(e) => {
          onChange({
            ...task,
            done: e.target.checked,
          });
        }}
      />
      {taskContent}
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </label>
  );
}
```

```css
button {
  margin: 5px;
}
li {
  list-style-type: none;
}
ul,
li {
  margin: 0;
  padding: 0;
}
```

```json
{
  "dependencies": {
    "immer": "1.7.3",
    "react": "latest",
    "react-dom": "latest",
    "react-scripts": "latest",
    "use-immer": "0.5.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}
```

Reducers must be pure, so they shouldn't mutate state. But Immer provides you with a special `draft` object which is safe to mutate. Under the hood, Immer will create a copy of your state with the changes you made to the `draft`. This is why reducers managed by `useImmerReducer` can mutate their first argument and don't need to return state.

- To convert from `useState` to `useReducer`:
  1. Dispatch actions from event handlers.
  2. Write a reducer function that returns the next state for a given state and action.
  3. Replace `useState` with `useReducer`.
- Reducers require you to write a bit more code, but they help with debugging and testing.
- Reducers must be pure.
- Each action describes a single user interaction.
- Use Immer if you want to write reducers in a mutating style.

## Passing Data Deeply with Context

> **Source:** [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

Usually, you will pass information from a parent component to a child component via props. But passing props can become verbose and inconvenient if you have to pass them through many components in the middle, or if many components in your app need the same information. *Context* lets the parent component make some information available to any component in the tree below it—no matter how deep—without passing it explicitly through props.

- What "prop drilling" is
- How to replace repetitive prop passing with context
- Common use cases for context
- Common alternatives to context

### The problem with passing props

[Passing props](https://react.dev/learn/passing-props-to-a-component) is a great way to explicitly pipe data through your UI tree to the components that use it.

But passing props can become verbose and inconvenient when you need to pass some prop deeply through the tree, or if many components need the same prop. The nearest common ancestor could be far removed from the components that need data, and [lifting state up](https://react.dev/learn/sharing-state-between-components) that high can lead to a situation called "prop drilling".

Lifting state up

Prop drilling

Wouldn't it be great if there were a way to "teleport" data to the components in the tree that need it without passing props? With React's context feature, there is!

### Context: an alternative to passing props

Context lets a parent component provide data to the entire tree below it. There are many uses for context. Here is one example. Consider this `Heading` component that accepts a `level` for its size:

```js
import Heading from './Heading.js';
import Section from './Section.js';

export default function Page() {
  return (
    <Section>
      <Heading level={1}>Title</Heading>
      <Heading level={2}>Heading</Heading>
      <Heading level={3}>Sub-heading</Heading>
      <Heading level={4}>Sub-sub-heading</Heading>
      <Heading level={5}>Sub-sub-sub-heading</Heading>
      <Heading level={6}>Sub-sub-sub-sub-heading</Heading>
    </Section>
  );
}
```

```js
export default function Section({ children }) {
  return (
    <section className="section">
      {children}
    </section>
  );
}
```

```js
export default function Heading({ level, children }) {
  switch (level) {
    case 1:
      return <h1>{children}</h1>;
    case 2:
      return <h2>{children}</h2>;
    case 3:
      return <h3>{children}</h3>;
    case 4:
      return <h4>{children}</h4>;
    case 5:
      return <h5>{children}</h5>;
    case 6:
      return <h6>{children}</h6>;
    default:
      throw Error('Unknown level: ' + level);
  }
}
```

```css
.section {
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  border: 1px solid #aaa;
}
```

Let's say you want multiple headings within the same `Section` to always have the same size:

```js
import Heading from './Heading.js';
import Section from './Section.js';

export default function Page() {
  return (
    <Section>
      <Heading level={1}>Title</Heading>
      <Section>
        <Heading level={2}>Heading</Heading>
        <Heading level={2}>Heading</Heading>
        <Heading level={2}>Heading</Heading>
        <Section>
          <Heading level={3}>Sub-heading</Heading>
          <Heading level={3}>Sub-heading</Heading>
          <Heading level={3}>Sub-heading</Heading>
          <Section>
            <Heading level={4}>Sub-sub-heading</Heading>
            <Heading level={4}>Sub-sub-heading</Heading>
            <Heading level={4}>Sub-sub-heading</Heading>
          </Section>
        </Section>
      </Section>
    </Section>
  );
}
```

```js
export default function Section({ children }) {
  return (
    <section className="section">
      {children}
    </section>
  );
}
```

```js
export default function Heading({ level, children }) {
  switch (level) {
    case 1:
      return <h1>{children}</h1>;
    case 2:
      return <h2>{children}</h2>;
    case 3:
      return <h3>{children}</h3>;
    case 4:
      return <h4>{children}</h4>;
    case 5:
      return <h5>{children}</h5>;
    case 6:
      return <h6>{children}</h6>;
    default:
      throw Error('Unknown level: ' + level);
  }
}
```

```css
.section {
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  border: 1px solid #aaa;
}
```

Currently, you pass the `level` prop to each `` separately:

```js
<Section>
  <Heading level={3}>About</Heading>
  <Heading level={3}>Photos</Heading>
  <Heading level={3}>Videos</Heading>
</Section>
```

It would be nice if you could pass the `level` prop to the `` component instead and remove it from the ``. This way you could enforce that all headings in the same section have the same size:

```js
<Section level={3}>
  <Heading>About</Heading>
  <Heading>Photos</Heading>
  <Heading>Videos</Heading>
</Section>
```

But how can the `` component know the level of its closest ``? **That would require some way for a child to "ask" for data from somewhere above in the tree.**

You can't do it with props alone. This is where context comes into play. You will do it in three steps:

1. **Create** a context. (You can call it `LevelContext`, since it's for the heading level.)
2. **Use** that context from the component that needs the data. (`Heading` will use `LevelContext`.)
3. **Provide** that context from the component that specifies the data. (`Section` will provide `LevelContext`.)

Context lets a parent--even a distant one!--provide some data to the entire tree inside of it.

Using context in close children

Using context in distant children

#### Step 1: Create the context

First, you need to create the context. You'll need to **export it from a file** so that your components can use it:

```js
import Heading from './Heading.js';
import Section from './Section.js';

export default function Page() {
  return (
    <Section>
      <Heading level={1}>Title</Heading>
      <Section>
        <Heading level={2}>Heading</Heading>
        <Heading level={2}>Heading</Heading>
        <Heading level={2}>Heading</Heading>
        <Section>
          <Heading level={3}>Sub-heading</Heading>
          <Heading level={3}>Sub-heading</Heading>
          <Heading level={3}>Sub-heading</Heading>
          <Section>
            <Heading level={4}>Sub-sub-heading</Heading>
            <Heading level={4}>Sub-sub-heading</Heading>
            <Heading level={4}>Sub-sub-heading</Heading>
          </Section>
        </Section>
      </Section>
    </Section>
  );
}
```

```js
export default function Section({ children }) {
  return (
    <section className="section">
      {children}
    </section>
  );
}
```

```js
export default function Heading({ level, children }) {
  switch (level) {
    case 1:
      return <h1>{children}</h1>;
    case 2:
      return <h2>{children}</h2>;
    case 3:
      return <h3>{children}</h3>;
    case 4:
      return <h4>{children}</h4>;
    case 5:
      return <h5>{children}</h5>;
    case 6:
      return <h6>{children}</h6>;
    default:
      throw Error('Unknown level: ' + level);
  }
}
```

```js
import { createContext } from 'react';

export const LevelContext = createContext(1);
```

```css
.section {
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  border: 1px solid #aaa;
}
```

The only argument to `createContext` is the _default_ value. Here, `1` refers to the biggest heading level, but you could pass any kind of value (even an object). You will see the significance of the default value in the next step.

#### Step 2: Use the context

Import the `useContext` Hook from React and your context:

```js
import { useContext } from 'react';
import { LevelContext } from './LevelContext.js';
```

Currently, the `Heading` component reads `level` from props:

```js
export default function Heading({ level, children }) {
  // ...
}
```

Instead, remove the `level` prop and read the value from the context you just imported, `LevelContext`:

```js
export default function Heading({ children }) {
  const level = useContext(LevelContext);
  // ...
}
```

`useContext` is a Hook. Just like `useState` and `useReducer`, you can only call a Hook immediately inside a React component (not inside loops or conditions). **`useContext` tells React that the `Heading` component wants to read the `LevelContext`.**

Now that the `Heading` component doesn't have a `level` prop, you don't need to pass the level prop to `Heading` in your JSX like this anymore:

```js
<Section>
  <Heading level={4}>Sub-sub-heading</Heading>
  <Heading level={4}>Sub-sub-heading</Heading>
  <Heading level={4}>Sub-sub-heading</Heading>
</Section>
```

Update the JSX so that it's the `Section` that receives it instead:

```jsx
<Section level={4}>
  <Heading>Sub-sub-heading</Heading>
  <Heading>Sub-sub-heading</Heading>
  <Heading>Sub-sub-heading</Heading>
</Section>
```

As a reminder, this is the markup that you were trying to get working:

```js
import Heading from './Heading.js';
import Section from './Section.js';

export default function Page() {
  return (
    <Section level={1}>
      <Heading>Title</Heading>
      <Section level={2}>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Section level={3}>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Section level={4}>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
          </Section>
        </Section>
      </Section>
    </Section>
  );
}
```

```js
export default function Section({ children }) {
  return (
    <section className="section">
      {children}
    </section>
  );
}
```

```js
import { useContext } from 'react';
import { LevelContext } from './LevelContext.js';

export default function Heading({ children }) {
  const level = useContext(LevelContext);
  switch (level) {
    case 1:
      return <h1>{children}</h1>;
    case 2:
      return <h2>{children}</h2>;
    case 3:
      return <h3>{children}</h3>;
    case 4:
      return <h4>{children}</h4>;
    case 5:
      return <h5>{children}</h5>;
    case 6:
      return <h6>{children}</h6>;
    default:
      throw Error('Unknown level: ' + level);
  }
}
```

```js
import { createContext } from 'react';

export const LevelContext = createContext(1);
```

```css
.section {
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  border: 1px solid #aaa;
}
```

Notice this example doesn't quite work, yet! All the headings have the same size because **even though you're *using* the context, you have not *provided* it yet.** React doesn't know where to get it!

If you don't provide the context, React will use the default value you've specified in the previous step. In this example, you specified `1` as the argument to `createContext`, so `useContext(LevelContext)` returns `1`, setting all those headings to `<h1>`. Let's fix this problem by having each `Section` provide its own context.

#### Step 3: Provide the context

The `Section` component currently renders its children:

```js
export default function Section({ children }) {
  return (
    <section className="section">
      {children}
    </section>
  );
}
```

**Wrap them with a context provider** to provide the `LevelContext` to them:

```js
import { LevelContext } from './LevelContext.js';

export default function Section({ level, children }) {
  return (
    <section className="section">
      <LevelContext value={level}>
        {children}
      </LevelContext>
    </section>
  );
}
```

This tells React: "if any component inside this `` asks for `LevelContext`, give them this `level`." The component will use the value of the nearest `` in the UI tree above it.

```js
import Heading from './Heading.js';
import Section from './Section.js';

export default function Page() {
  return (
    <Section level={1}>
      <Heading>Title</Heading>
      <Section level={2}>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Section level={3}>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Section level={4}>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
          </Section>
        </Section>
      </Section>
    </Section>
  );
}
```

```js
import { LevelContext } from './LevelContext.js';

export default function Section({ level, children }) {
  return (
    <section className="section">
      <LevelContext value={level}>
        {children}
      </LevelContext>
    </section>
  );
}
```

```js
import { useContext } from 'react';
import { LevelContext } from './LevelContext.js';

export default function Heading({ children }) {
  const level = useContext(LevelContext);
  switch (level) {
    case 1:
      return <h1>{children}</h1>;
    case 2:
      return <h2>{children}</h2>;
    case 3:
      return <h3>{children}</h3>;
    case 4:
      return <h4>{children}</h4>;
    case 5:
      return <h5>{children}</h5>;
    case 6:
      return <h6>{children}</h6>;
    default:
      throw Error('Unknown level: ' + level);
  }
}
```

```js
import { createContext } from 'react';

export const LevelContext = createContext(1);
```

```css
.section {
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  border: 1px solid #aaa;
}
```

It's the same result as the original code, but you did not need to pass the `level` prop to each `Heading` component! Instead, it "figures out" its heading level by asking the closest `Section` above:

1. You pass a `level` prop to the ``.
2. `Section` wraps its children into ``.
3. `Heading` asks the closest value of `LevelContext` above with `useContext(LevelContext)`.

### Using and providing context from the same component

Currently, you still have to specify each section's `level` manually:

```js
export default function Page() {
  return (
    <Section level={1}>
      ...
      <Section level={2}>
        ...
        <Section level={3}>
          ...
```

Since context lets you read information from a component above, each `Section` could read the `level` from the `Section` above, and pass `level + 1` down automatically. Here is how you could do it:

```js
import { useContext } from 'react';
import { LevelContext } from './LevelContext.js';

export default function Section({ children }) {
  const level = useContext(LevelContext);
  return (
    <section className="section">
      <LevelContext value={level + 1}>
        {children}
      </LevelContext>
    </section>
  );
}
```

With this change, you don't need to pass the `level` prop *either* to the `` or to the ``:

```js
import Heading from './Heading.js';
import Section from './Section.js';

export default function Page() {
  return (
    <Section>
      <Heading>Title</Heading>
      <Section>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Section>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Section>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
          </Section>
        </Section>
      </Section>
    </Section>
  );
}
```

```js
import { useContext } from 'react';
import { LevelContext } from './LevelContext.js';

export default function Section({ children }) {
  const level = useContext(LevelContext);
  return (
    <section className="section">
      <LevelContext value={level + 1}>
        {children}
      </LevelContext>
    </section>
  );
}
```

```js
import { useContext } from 'react';
import { LevelContext } from './LevelContext.js';

export default function Heading({ children }) {
  const level = useContext(LevelContext);
  switch (level) {
    case 0:
      throw Error('Heading must be inside a Section!');
    case 1:
      return <h1>{children}</h1>;
    case 2:
      return <h2>{children}</h2>;
    case 3:
      return <h3>{children}</h3>;
    case 4:
      return <h4>{children}</h4>;
    case 5:
      return <h5>{children}</h5>;
    case 6:
      return <h6>{children}</h6>;
    default:
      throw Error('Unknown level: ' + level);
  }
}
```

```js
import { createContext } from 'react';

export const LevelContext = createContext(0);
```

```css
.section {
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  border: 1px solid #aaa;
}
```

Now both `Heading` and `Section` read the `LevelContext` to figure out how "deep" they are. And the `Section` wraps its children into the `LevelContext` to specify that anything inside of it is at a "deeper" level.

This example uses heading levels because they show visually how nested components can override context. But context is useful for many other use cases too. You can pass down any information needed by the entire subtree: the current color theme, the currently logged in user, and so on.

### Context passes through intermediate components

You can insert as many components as you like between the component that provides context and the one that uses it. This includes both built-in components like `<div>` and components you might build yourself.

In this example, the same `Post` component (with a dashed border) is rendered at two different nesting levels. Notice that the `` inside of it gets its level automatically from the closest ``:

```js
import Heading from './Heading.js';
import Section from './Section.js';

export default function ProfilePage() {
  return (
    <Section>
      <Heading>My Profile</Heading>
      <Post
        title="Hello traveller!"
        body="Read about my adventures."
      />
      <AllPosts />
    </Section>
  );
}

function AllPosts() {
  return (
    <Section>
      <Heading>Posts</Heading>
      <RecentPosts />
    </Section>
  );
}

function RecentPosts() {
  return (
    <Section>
      <Heading>Recent Posts</Heading>
      <Post
        title="Flavors of Lisbon"
        body="...those pastéis de nata!"
      />
      <Post
        title="Buenos Aires in the rhythm of tango"
        body="I loved it!"
      />
    </Section>
  );
}

function Post({ title, body }) {
  return (
    <Section isFancy={true}>
      <Heading>
        {title}
      </Heading>
      <p><i>{body}</i></p>
    </Section>
  );
}
```

```js
import { useContext } from 'react';
import { LevelContext } from './LevelContext.js';

export default function Section({ children, isFancy }) {
  const level = useContext(LevelContext);
  return (
    <section className={
      'section ' +
      (isFancy ? 'fancy' : '')
    }>
      <LevelContext value={level + 1}>
        {children}
      </LevelContext>
    </section>
  );
}
```

```js
import { useContext } from 'react';
import { LevelContext } from './LevelContext.js';

export default function Heading({ children }) {
  const level = useContext(LevelContext);
  switch (level) {
    case 0:
      throw Error('Heading must be inside a Section!');
    case 1:
      return <h1>{children}</h1>;
    case 2:
      return <h2>{children}</h2>;
    case 3:
      return <h3>{children}</h3>;
    case 4:
      return <h4>{children}</h4>;
    case 5:
      return <h5>{children}</h5>;
    case 6:
      return <h6>{children}</h6>;
    default:
      throw Error('Unknown level: ' + level);
  }
}
```

```js
import { createContext } from 'react';

export const LevelContext = createContext(0);
```

```css
.section {
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  border: 1px solid #aaa;
}

.fancy {
  border: 4px dashed pink;
}
```

You didn't do anything special for this to work. A `Section` specifies the context for the tree inside it, so you can insert a `` anywhere, and it will have the correct size. Try it in the sandbox above!

**Context lets you write components that "adapt to their surroundings" and display themselves differently depending on _where_ (or, in other words, _in which context_) they are being rendered.**

How context works might remind you of [CSS property inheritance.](https://developer.mozilla.org/en-US/docs/Web/CSS/inheritance) In CSS, you can specify `color: blue` for a `<div>`, and any DOM node inside of it, no matter how deep, will inherit that color unless some other DOM node in the middle overrides it with `color: green`. Similarly, in React, the only way to override some context coming from above is to wrap children into a context provider with a different value.

In CSS, different properties like `color` and `background-color` don't override each other. You can set all  `<div>`'s `color` to red without impacting `background-color`. Similarly, **different React contexts don't override each other.** Each context that you make with `createContext()` is completely separate from other ones, and ties together components using and providing *that particular* context. One component may use or provide many different contexts without a problem.

### Before you use context

Context is very tempting to use! However, this also means it's too easy to overuse it. **Just because you need to pass some props several levels deep doesn't mean you should put that information into context.**

Here's a few alternatives you should consider before using context:

1. **Start by [passing props.](https://react.dev/learn/passing-props-to-a-component)** If your components are not trivial, it's not unusual to pass a dozen props down through a dozen components. It may feel like a slog, but it makes it very clear which components use which data! The person maintaining your code will be glad you've made the data flow explicit with props.
2. **Extract components and [pass JSX as `children`](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) to them.** If you pass some data through many layers of intermediate components that don't use that data (and only pass it further down), this often means that you forgot to extract some components along the way. For example, maybe you pass data props like `posts` to visual components that don't use them directly, like ``. Instead, make `Layout` take `children` as a prop, and render ``. This reduces the number of layers between the component specifying the data and the one that needs it.

If neither of these approaches works well for you, consider context.

### Use cases for context

* **Theming:** If your app lets the user change its appearance (e.g. dark mode), you can put a context provider at the top of your app, and use that context in components that need to adjust their visual look.
* **Current account:** Many components might need to know the currently logged in user. Putting it in context makes it convenient to read it anywhere in the tree. Some apps also let you operate multiple accounts at the same time (e.g. to leave a comment as a different user). In those cases, it can be convenient to wrap a part of the UI into a nested provider with a different current account value.
* **Routing:** Most routing solutions use context internally to hold the current route. This is how every link "knows" whether it's active or not. If you build your own router, you might want to do it too.
* **Managing state:** As your app grows, you might end up with a lot of state closer to the top of your app. Many distant components below may want to change it. It is common to [use a reducer together with context](https://react.dev/learn/scaling-up-with-reducer-and-context) to manage complex state and pass it down to distant components without too much hassle.

Context is not limited to static values. If you pass a different value on the next render, React will update all the components reading it below! This is why context is often used in combination with state.

In general, if some information is needed by distant components in different parts of the tree, it's a good indication that context will help you.

* Context lets a component provide some information to the entire tree below it.
* To pass context:
  1. Create and export it with `export const MyContext = createContext(defaultValue)`.
  2. Pass it to the `useContext(MyContext)` Hook to read it in any child component, no matter how deep.
  3. Wrap children into `` to provide it from a parent.
* Context passes through any components in the middle.
* Context lets you write components that "adapt to their surroundings".
* Before you use context, try passing props or passing JSX as `children`.

## 'Referencing Values with Refs'

> **Source:** ['Referencing Values with Refs'](https://react.dev/learn/referencing-values-with-refs) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

When you want a component to "remember" some information, but you don't want that information to [trigger new renders](https://react.dev/learn/render-and-commit), you can use a *ref*.

- How to add a ref to your component
- How to update a ref's value
- How refs are different from state
- How to use refs safely

### Adding a ref to your component

You can add a ref to your component by importing the `useRef` Hook from React:

```js
import { useRef } from 'react';
```

Inside your component, call the `useRef` Hook and pass the initial value that you want to reference as the only argument. For example, here is a ref to the value `0`:

```js
const ref = useRef(0);
```

`useRef` returns an object like this:

```js
{
  current: 0 // The value you passed to useRef
}
```

You can access the current value of that ref through the `ref.current` property. This value is intentionally mutable, meaning you can both read and write to it. It's like a secret pocket of your component that React doesn't track. (This is what makes it an "escape hatch" from React's one-way data flow--more on that below!)

Here, a button will increment `ref.current` on every click:

```js
import { useRef } from 'react';

export default function Counter() {
  let ref = useRef(0);

  function handleClick() {
    ref.current = ref.current + 1;
    alert('You clicked ' + ref.current + ' times!');
  }

  return (
    <button onClick={handleClick}>
      Click me!
    </button>
  );
}
```

The ref points to a number, but, like [state](https://react.dev/learn/state-a-components-memory), you could point to anything: a string, an object, or even a function. Unlike state, ref is a plain JavaScript object with the `current` property that you can read and modify.

Note that **the component doesn't re-render with every increment.** Like state, refs are retained by React between re-renders. However, setting state re-renders a component. Changing a ref does not!

### Example: building a stopwatch

You can combine refs and state in a single component. For example, let's make a stopwatch that the user can start or stop by pressing a button. In order to display how much time has passed since the user pressed "Start", you will need to keep track of when the Start button was pressed and what the current time is. **This information is used for rendering, so you'll keep it in state:**

```js
const [startTime, setStartTime] = useState(null);
const [now, setNow] = useState(null);
```

When the user presses "Start", you'll use [`setInterval`](https://developer.mozilla.org/docs/Web/API/setInterval) in order to update the time every 10 milliseconds:

```js
import { useState } from 'react';

export default function Stopwatch() {
  const [startTime, setStartTime] = useState(null);
  const [now, setNow] = useState(null);

  function handleStart() {
    // Start counting.
    setStartTime(Date.now());
    setNow(Date.now());

    setInterval(() => {
      // Update the current time every 10ms.
      setNow(Date.now());
    }, 10);
  }

  let secondsPassed = 0;
  if (startTime != null && now != null) {
    secondsPassed = (now - startTime) / 1000;
  }

  return (
    <>
      <h1>Time passed: {secondsPassed.toFixed(3)}</h1>
      <button onClick={handleStart}>
        Start
      </button>
    </>
  );
}
```

When the "Stop" button is pressed, you need to cancel the existing interval so that it stops updating the `now` state variable. You can do this by calling [`clearInterval`](https://developer.mozilla.org/en-US/docs/Web/API/clearInterval), but you need to give it the interval ID that was previously returned by the `setInterval` call when the user pressed Start. You need to keep the interval ID somewhere. **Since the interval ID is not used for rendering, you can keep it in a ref:**

```js
import { useState, useRef } from 'react';

export default function Stopwatch() {
  const [startTime, setStartTime] = useState(null);
  const [now, setNow] = useState(null);
  const intervalRef = useRef(null);

  function handleStart() {
    setStartTime(Date.now());
    setNow(Date.now());

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 10);
  }

  function handleStop() {
    clearInterval(intervalRef.current);
  }

  let secondsPassed = 0;
  if (startTime != null && now != null) {
    secondsPassed = (now - startTime) / 1000;
  }

  return (
    <>
      <h1>Time passed: {secondsPassed.toFixed(3)}</h1>
      <button onClick={handleStart}>
        Start
      </button>
      <button onClick={handleStop}>
        Stop
      </button>
    </>
  );
}
```

When a piece of information is used for rendering, keep it in state. When a piece of information is only needed by event handlers and changing it doesn't require a re-render, using a ref may be more efficient.

### Differences between refs and state

Perhaps you're thinking refs seem less "strict" than state—you can mutate them instead of always having to use a state setting function, for instance. But in most cases, you'll want to use state. Refs are an "escape hatch" you won't need often. Here's how state and refs compare:

| refs                                                                                  | state                                                                                                                     |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `useRef(initialValue)` returns `{ current: initialValue }`                            | `useState(initialValue)` returns the current value of a state variable and a state setter function ( `[value, setValue]`) |
| Doesn't trigger re-render when you change it.                                         | Triggers re-render when you change it.                                                                                    |
| Mutable—you can modify and update `current`'s value outside of the rendering process. | "Immutable"—you must use the state setting function to modify state variables to queue a re-render.                       |
| You shouldn't read (or write) the `current` value during rendering. | You can read state at any time. However, each render has its own [snapshot](https://react.dev/learn/state-as-a-snapshot) of state which does not change.

Here is a counter button that's implemented with state:

```js
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <button onClick={handleClick}>
      You clicked {count} times
    </button>
  );
}
```

Because the `count` value is displayed, it makes sense to use a state value for it. When the counter's value is set with `setCount()`, React re-renders the component and the screen updates to reflect the new count.

If you tried to implement this with a ref, React would never re-render the component, so you'd never see the count change! See how clicking this button **does not update its text**:

```js
import { useRef } from 'react';

export default function Counter() {
  let countRef = useRef(0);

  function handleClick() {
    // This doesn't re-render the component!
    countRef.current = countRef.current + 1;
  }

  return (
    <button onClick={handleClick}>
      You clicked {countRef.current} times
    </button>
  );
}
```

This is why reading `ref.current` during render leads to unreliable code. If you need that, use state instead.

##### How does useRef work inside?

Although both `useState` and `useRef` are provided by React, in principle `useRef` could be implemented _on top of_ `useState`. You can imagine that inside of React, `useRef` is implemented like this:

```js
// Inside of React
function useRef(initialValue) {
  const [ref, unused] = useState({ current: initialValue });
  return ref;
}
```

During the first render, `useRef` returns `{ current: initialValue }`. This object is stored by React, so during the next render the same object will be returned. Note how the state setter is unused in this example. It is unnecessary because `useRef` always needs to return the same object!

React provides a built-in version of `useRef` because it is common enough in practice. But you can think of it as a regular state variable without a setter. If you're familiar with object-oriented programming, refs might remind you of instance fields--but instead of `this.something` you write `somethingRef.current`.

### When to use refs

Typically, you will use a ref when your component needs to "step outside" React and communicate with external APIs—often a browser API that won't impact the appearance of the component. Here are a few of these rare situations:

- Storing [timeout IDs](https://developer.mozilla.org/docs/Web/API/setTimeout)
- Storing and manipulating [DOM elements](https://developer.mozilla.org/docs/Web/API/Element), which we cover on [the next page](https://react.dev/learn/manipulating-the-dom-with-refs)
- Storing other objects that aren't necessary to calculate the JSX.

If your component needs to store some value, but it doesn't impact the rendering logic, choose refs.

### Best practices for refs

Following these principles will make your components more predictable:

- **Treat refs as an escape hatch.** Refs are useful when you work with external systems or browser APIs. If much of your application logic and data flow relies on refs, you might want to rethink your approach.
- **Don't read or write `ref.current` during rendering.** If some information is needed during rendering, use [state](https://react.dev/learn/state-a-components-memory) instead. Since React doesn't know when `ref.current` changes, even reading it while rendering makes your component's behavior difficult to predict. (The only exception to this is code like `if (!ref.current) ref.current = new Thing()` which only sets the ref once during the first render.)

Limitations of React state don't apply to refs. For example, state acts like a [snapshot for every render](https://react.dev/learn/state-as-a-snapshot) and [doesn't update synchronously.](https://react.dev/learn/queueing-a-series-of-state-updates) But when you mutate the current value of a ref, it changes immediately:

```js
ref.current = 5;
console.log(ref.current); // 5
```

This is because **the ref itself is a regular JavaScript object,** and so it behaves like one.

You also don't need to worry about [avoiding mutation](https://react.dev/learn/updating-objects-in-state) when you work with a ref. As long as the object you're mutating isn't used for rendering, React doesn't care what you do with the ref or its contents.

### Refs and the DOM

You can point a ref to any value. However, the most common use case for a ref is to access a DOM element. For example, this is handy if you want to focus an input programmatically. When you pass a ref to a `ref` attribute in JSX, like `<div ref={myRef}>`, React will put the corresponding DOM element into `myRef.current`. Once the element is removed from the DOM, React will update `myRef.current` to be `null`. You can read more about this in [Manipulating the DOM with Refs.](https://react.dev/learn/manipulating-the-dom-with-refs)

- Refs are an escape hatch to hold onto values that aren't used for rendering. You won't need them often.
- A ref is a plain JavaScript object with a single property called `current`, which you can read or set.
- You can ask React to give you a ref by calling the `useRef` Hook.
- Like state, refs let you retain information between re-renders of a component.
- Unlike state, setting the ref's `current` value does not trigger a re-render.
- Don't read or write `ref.current` during rendering. This makes your component hard to predict.

## 'Synchronizing with Effects'

> **Source:** ['Synchronizing with Effects'](https://react.dev/learn/synchronizing-with-effects) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

Some components need to synchronize with external systems. For example, you might want to control a non-React component based on the React state, set up a server connection, or send an analytics log when a component appears on the screen. *Effects* let you run some code after rendering so that you can synchronize your component with some system outside of React.

- What Effects are
- How Effects are different from events
- How to declare an Effect in your component
- How to skip re-running an Effect unnecessarily
- Why Effects run twice in development and how to fix them

### What are Effects and how are they different from events?

Before getting to Effects, you need to be familiar with two types of logic inside React components:

- **Rendering code** (introduced in [Describing the UI](https://react.dev/learn/describing-the-ui)) lives at the top level of your component. This is where you take the props and state, transform them, and return the JSX you want to see on the screen. [Rendering code must be pure.](https://react.dev/learn/keeping-components-pure) Like a math formula, it should only _calculate_ the result, but not do anything else.

- **Event handlers** (introduced in [Adding Interactivity](https://react.dev/learn/adding-interactivity)) are nested functions inside your components that *do* things rather than just calculate them. An event handler might update an input field, submit an HTTP POST request to buy a product, or navigate the user to another screen. Event handlers contain ["side effects"](https://en.wikipedia.org/wiki/Side_effect_(computer_science)) (they change the program's state) caused by a specific user action (for example, a button click or typing).

Sometimes this isn't enough. Consider a `ChatRoom` component that must connect to the chat server whenever it's visible on the screen. Connecting to a server is not a pure calculation (it's a side effect) so it can't happen during rendering. However, there is no single particular event like a click that causes `ChatRoom` to be displayed.

***Effects* let you specify side effects that are caused by rendering itself, rather than by a particular event.** Sending a message in the chat is an *event* because it is directly caused by the user clicking a specific button. However, setting up a server connection is an *Effect* because it should happen no matter which interaction caused the component to appear. Effects run at the end of a [commit](https://react.dev/learn/render-and-commit) after the screen updates. This is a good time to synchronize the React components with some external system (like network or a third-party library).

Here and later in this text, capitalized "Effect" refers to the React-specific definition above, i.e. a side effect caused by rendering. To refer to the broader programming concept, we'll say "side effect".

### You might not need an Effect

**Don't rush to add Effects to your components.** Keep in mind that Effects are typically used to "step out" of your React code and synchronize with some *external* system. This includes browser APIs, third-party widgets, network, and so on. If your Effect only adjusts some state based on other state, [you might not need an Effect.](https://react.dev/learn/you-might-not-need-an-effect)

### How to write an Effect

To write an Effect, follow these three steps:

1. **Declare an Effect.** By default, your Effect will run after every [commit](https://react.dev/learn/render-and-commit).
2. **Specify the Effect dependencies.** Most Effects should only re-run *when needed* rather than after every render. For example, a fade-in animation should only trigger when a component appears. Connecting and disconnecting to a chat room should only happen when the component appears and disappears, or when the chat room changes. You will learn how to control this by specifying *dependencies.*
3. **Add cleanup if needed.** Some Effects need to specify how to stop, undo, or clean up whatever they were doing. For example, "connect" needs "disconnect", "subscribe" needs "unsubscribe", and "fetch" needs either "cancel" or "ignore". You will learn how to do this by returning a *cleanup function*.

Let's look at each of these steps in detail.

#### Step 1: Declare an Effect

To declare an Effect in your component, import the [`useEffect` Hook](https://react.dev/reference/react/useEffect) from React:

```js
import { useEffect } from 'react';
```

Then, call it at the top level of your component and put some code inside your Effect:

```js
function MyComponent() {
  useEffect(() => {
    // Code here will run after *every* render
  });
  return <div />;
}
```

Every time your component renders, React will update the screen *and then* run the code inside `useEffect`. In other words, **`useEffect` "delays" a piece of code from running until that render is reflected on the screen.**

Let's see how you can use an Effect to synchronize with an external system. Consider a `` React component. It would be nice to control whether it's playing or paused by passing an `isPlaying` prop to it:

```js
<VideoPlayer isPlaying={isPlaying} />;
```

Your custom `VideoPlayer` component renders the built-in browser [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video) tag:

```js
function VideoPlayer({ src, isPlaying }) {
  // TODO: do something with isPlaying
  return <video src={src} />;
}
```

However, the browser `<video>` tag does not have an `isPlaying` prop. The only way to control it is to manually call the [`play()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play) and [`pause()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/pause) methods on the DOM element. **You need to synchronize the value of `isPlaying` prop, which tells whether the video _should_ currently be playing, with calls like `play()` and `pause()`.**

We'll need to first [get a ref](https://react.dev/learn/manipulating-the-dom-with-refs) to the `<video>` DOM node.

You might be tempted to try to call `play()` or `pause()` during rendering, but that isn't correct:

```js
import { useState, useRef, useEffect } from 'react';

function VideoPlayer({ src, isPlaying }) {
  const ref = useRef(null);

  if (isPlaying) {
    ref.current.play();  // Calling these while rendering isn't allowed.
  } else {
    ref.current.pause(); // Also, this crashes.
  }

  return <video ref={ref} src={src} loop playsInline />;
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <>
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <VideoPlayer
        isPlaying={isPlaying}
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      />
    </>
  );
}
```

```css
button { display: block; margin-bottom: 20px; }
video { width: 250px; }
```

The reason this code isn't correct is that it tries to do something with the DOM node during rendering. In React, [rendering should be a pure calculation](https://react.dev/learn/keeping-components-pure) of JSX and should not contain side effects like modifying the DOM.

Moreover, when `VideoPlayer` is called for the first time, its DOM does not exist yet! There isn't a DOM node yet to call `play()` or `pause()` on, because React doesn't know what DOM to create until you return the JSX.

The solution here is to **wrap the side effect with `useEffect` to move it out of the rendering calculation:**

```js
import { useEffect, useRef } from 'react';

function VideoPlayer({ src, isPlaying }) {
  const ref = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  });

  return <video ref={ref} src={src} loop playsInline />;
}
```

By wrapping the DOM update in an Effect, you let React update the screen first. Then your Effect runs.

When your `VideoPlayer` component renders (either the first time or if it re-renders), a few things will happen. First, React will update the screen, ensuring the `<video>` tag is in the DOM with the right props. Then React will run your Effect. Finally, your Effect will call `play()` or `pause()` depending on the value of `isPlaying`.

Press Play/Pause multiple times and see how the video player stays synchronized to the `isPlaying` value:

```js
import { useState, useRef, useEffect } from 'react';

function VideoPlayer({ src, isPlaying }) {
  const ref = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  });

  return <video ref={ref} src={src} loop playsInline />;
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <>
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <VideoPlayer
        isPlaying={isPlaying}
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      />
    </>
  );
}
```

```css
button { display: block; margin-bottom: 20px; }
video { width: 250px; }
```

In this example, the "external system" you synchronized to React state was the browser media API. You can use a similar approach to wrap legacy non-React code (like jQuery plugins) into declarative React components.

Note that controlling a video player is much more complex in practice. Calling `play()` may fail, the user might play or pause using the built-in browser controls, and so on. This example is very simplified and incomplete.

By default, Effects run after *every* render. This is why code like this will **produce an infinite loop:**

```js
const [count, setCount] = useState(0);
useEffect(() => {
  setCount(count + 1);
});
```

Effects run as a *result* of rendering. Setting state *triggers* rendering. Setting state immediately in an Effect is like plugging a power outlet into itself. The Effect runs, it sets the state, which causes a re-render, which causes the Effect to run, it sets the state again, this causes another re-render, and so on.

Effects should usually synchronize your components with an *external* system. If there's no external system and you only want to adjust some state based on other state, [you might not need an Effect.](https://react.dev/learn/you-might-not-need-an-effect)

#### Step 2: Specify the Effect dependencies

By default, Effects run after *every* render. Often, this is **not what you want:**

- Sometimes, it's slow. Synchronizing with an external system is not always instant, so you might want to skip doing it unless it's necessary. For example, you don't want to reconnect to the chat server on every keystroke.
- Sometimes, it's wrong. For example, you don't want to trigger a component fade-in animation on every keystroke. The animation should only play once when the component appears for the first time.

To demonstrate the issue, here is the previous example with a few `console.log` calls and a text input that updates the parent component's state. Notice how typing causes the Effect to re-run:

```js
import { useState, useRef, useEffect } from 'react';

function VideoPlayer({ src, isPlaying }) {
  const ref = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      console.log('Calling video.play()');
      ref.current.play();
    } else {
      console.log('Calling video.pause()');
      ref.current.pause();
    }
  });

  return <video ref={ref} src={src} loop playsInline />;
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [text, setText] = useState('');
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <VideoPlayer
        isPlaying={isPlaying}
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      />
    </>
  );
}
```

```css
input, button { display: block; margin-bottom: 20px; }
video { width: 250px; }
```

You can tell React to **skip unnecessarily re-running the Effect** by specifying an array of *dependencies* as the second argument to the `useEffect` call. Start by adding an empty `[]` array to the above example on line 14:

```js
  useEffect(() => {
    // ...
  }, []);
```

You should see an error saying `React Hook useEffect has a missing dependency: 'isPlaying'`:

```js
import { useState, useRef, useEffect } from 'react';

function VideoPlayer({ src, isPlaying }) {
  const ref = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      console.log('Calling video.play()');
      ref.current.play();
    } else {
      console.log('Calling video.pause()');
      ref.current.pause();
    }
  }, []); // This causes an error

  return <video ref={ref} src={src} loop playsInline />;
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [text, setText] = useState('');
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <VideoPlayer
        isPlaying={isPlaying}
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      />
    </>
  );
}
```

```css
input, button { display: block; margin-bottom: 20px; }
video { width: 250px; }
```

The problem is that the code inside of your Effect *depends on* the `isPlaying` prop to decide what to do, but this dependency was not explicitly declared. To fix this issue, add `isPlaying` to the dependency array:

```js
  useEffect(() => {
    if (isPlaying) { // It's used here...
      // ...
    } else {
      // ...
    }
  }, [isPlaying]); // ...so it must be declared here!
```

Now all dependencies are declared, so there is no error. Specifying `[isPlaying]` as the dependency array tells React that it should skip re-running your Effect if `isPlaying` is the same as it was during the previous render. With this change, typing into the input doesn't cause the Effect to re-run, but pressing Play/Pause does:

```js
import { useState, useRef, useEffect } from 'react';

function VideoPlayer({ src, isPlaying }) {
  const ref = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      console.log('Calling video.play()');
      ref.current.play();
    } else {
      console.log('Calling video.pause()');
      ref.current.pause();
    }
  }, [isPlaying]);

  return <video ref={ref} src={src} loop playsInline />;
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [text, setText] = useState('');
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <VideoPlayer
        isPlaying={isPlaying}
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      />
    </>
  );
}
```

```css
input, button { display: block; margin-bottom: 20px; }
video { width: 250px; }
```

The dependency array can contain multiple dependencies. React will only skip re-running the Effect if *all* of the dependencies you specify have exactly the same values as they had during the previous render. React compares the dependency values using the [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) comparison. See the [`useEffect` reference](https://react.dev/reference/react/useEffect#reference) for details.

**Notice that you can't "choose" your dependencies.** You will get a lint error if the dependencies you specified don't match what React expects based on the code inside your Effect. This helps catch many bugs in your code. If you don't want some code to re-run, [*edit the Effect code itself* to not "need" that dependency.](https://react.dev/learn/lifecycle-of-reactive-effects#what-to-do-when-you-dont-want-to-re-synchronize)

The behaviors without the dependency array and with an *empty* `[]` dependency array are different:

```js
useEffect(() => {
  // This runs after every render
});

useEffect(() => {
  // This runs only on mount (when the component appears)
}, []);

useEffect(() => {
  // This runs on mount *and also* if either a or b have changed since the last render
}, [a, b]);
```

We'll take a close look at what "mount" means in the next step.

##### Why was the ref omitted from the dependency array?

This Effect uses _both_ `ref` and `isPlaying`, but only `isPlaying` is declared as a dependency:

```js
function VideoPlayer({ src, isPlaying }) {
  const ref = useRef(null);
  useEffect(() => {
    if (isPlaying) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  }, [isPlaying]);
```

This is because the `ref` object has a *stable identity:* React guarantees [you'll always get the same object](https://react.dev/reference/react/useRef#returns) from the same `useRef` call on every render. It never changes, so it will never by itself cause the Effect to re-run. Therefore, it does not matter whether you include it or not. Including it is fine too:

```js
function VideoPlayer({ src, isPlaying }) {
  const ref = useRef(null);
  useEffect(() => {
    if (isPlaying) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  }, [isPlaying, ref]);
```

The [`set` functions](https://react.dev/reference/react/useState#setstate) returned by `useState` also have stable identity, so you will often see them omitted from the dependencies too. If the linter lets you omit a dependency without errors, it is safe to do.

Omitting always-stable dependencies only works when the linter can "see" that the object is stable. For example, if `ref` was passed from a parent component, you would have to specify it in the dependency array. However, this is good because you can't know whether the parent component always passes the same ref, or passes one of several refs conditionally. So your Effect _would_ depend on which ref is passed.

#### Step 3: Add cleanup if needed

Consider a different example. You're writing a `ChatRoom` component that needs to connect to the chat server when it appears. You are given a `createConnection()` API that returns an object with `connect()` and `disconnect()` methods. How do you keep the component connected while it is displayed to the user?

Start by writing the Effect logic:

```js
useEffect(() => {
  const connection = createConnection();
  connection.connect();
});
```

It would be slow to connect to the chat after every re-render, so you add the dependency array:

```js
useEffect(() => {
  const connection = createConnection();
  connection.connect();
}, []);
```

**The code inside the Effect does not use any props or state, so your dependency array is `[]` (empty). This tells React to only run this code when the component "mounts", i.e. appears on the screen for the first time.**

Let's try running this code:

```js
import { useEffect } from 'react';
import { createConnection } from './chat.js';

export default function ChatRoom() {
  useEffect(() => {
    const connection = createConnection();
    connection.connect();
  }, []);
  return <h1>Welcome to the chat!</h1>;
}
```

```js
export function createConnection() {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting...');
    },
    disconnect() {
      console.log('❌ Disconnected.');
    }
  };
}
```

```css
input { display: block; margin-bottom: 20px; }
```

This Effect only runs on mount, so you might expect `"✅ Connecting..."` to be printed once in the console. **However, if you check the console, `"✅ Connecting..."` gets printed twice. Why does it happen?**

Imagine the `ChatRoom` component is a part of a larger app with many different screens. The user starts their journey on the `ChatRoom` page. The component mounts and calls `connection.connect()`. Then imagine the user navigates to another screen--for example, to the Settings page. The `ChatRoom` component unmounts. Finally, the user clicks Back and `ChatRoom` mounts again. This would set up a second connection--but the first connection was never destroyed! As the user navigates across the app, the connections would keep piling up.

Bugs like this are easy to miss without extensive manual testing. To help you spot them quickly, in development React remounts every component once immediately after its initial mount.

Seeing the `"✅ Connecting..."` log twice helps you notice the real issue: your code doesn't close the connection when the component unmounts.

To fix the issue, return a *cleanup function* from your Effect:

```js
  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, []);
```

React will call your cleanup function each time before the Effect runs again, and one final time when the component unmounts (gets removed). Let's see what happens when the cleanup function is implemented:

```js
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

export default function ChatRoom() {
  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    return () => connection.disconnect();
  }, []);
  return <h1>Welcome to the chat!</h1>;
}
```

```js
export function createConnection() {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting...');
    },
    disconnect() {
      console.log('❌ Disconnected.');
    }
  };
}
```

```css
input { display: block; margin-bottom: 20px; }
```

Now you get three console logs in development:

1. `"✅ Connecting..."`
2. `"❌ Disconnected."`
3. `"✅ Connecting..."`

**This is the correct behavior in development.** By remounting your component, React verifies that navigating away and back would not break your code. Disconnecting and then connecting again is exactly what should happen! When you implement the cleanup well, there should be no user-visible difference between running the Effect once vs running it, cleaning it up, and running it again. There's an extra connect/disconnect call pair because React is probing your code for bugs in development. This is normal--don't try to make it go away!

**In production, you would only see `"✅ Connecting..."` printed once.** Remounting components only happens in development to help you find Effects that need cleanup. You can turn off [Strict Mode](https://react.dev/reference/react/StrictMode) to opt out of the development behavior, but we recommend keeping it on. This lets you find many bugs like the one above.

### How to handle the Effect firing twice in development?

React intentionally remounts your components in development to find bugs like in the last example. **The right question isn't "how to run an Effect once", but "how to fix my Effect so that it works after remounting".**

Usually, the answer is to implement the cleanup function.  The cleanup function should stop or undo whatever the Effect was doing. The rule of thumb is that the user shouldn't be able to distinguish between the Effect running once (as in production) and a _setup → cleanup → setup_ sequence (as you'd see in development).

Most of the Effects you'll write will fit into one of the common patterns below.

##### Don't use refs to prevent Effects from firing

A common pitfall for preventing Effects firing twice in development is to use a `ref` to prevent the Effect from running more than once. For example, you could "fix" the above bug with a `useRef`:

```js
  const connectionRef = useRef(null);
  useEffect(() => {
    // 🚩 This wont fix the bug!!!
    if (!connectionRef.current) {
      connectionRef.current = createConnection();
      connectionRef.current.connect();
    }
  }, []);
```

This makes it so you only see `"✅ Connecting..."` once in development, but it doesn't fix the bug.

When the user navigates away, the connection still isn't closed and when they navigate back, a new connection is created. As the user navigates across the app, the connections would keep piling up, the same as it would before the "fix".

To fix the bug, it is not enough to just make the Effect run once. The effect needs to work after re-mounting, which means the connection needs to be cleaned up like in the solution above.

See the examples below for how to handle common patterns.

#### Controlling non-React widgets

Sometimes you need to add UI widgets that aren't written in React. For example, let's say you're adding a map component to your page. It has a `setZoomLevel()` method, and you'd like to keep the zoom level in sync with a `zoomLevel` state variable in your React code. Your Effect would look similar to this:

```js
useEffect(() => {
  const map = mapRef.current;
  map.setZoomLevel(zoomLevel);
}, [zoomLevel]);
```

Note that there is no cleanup needed in this case. In development, React will call the Effect twice, but this is not a problem because calling `setZoomLevel` twice with the same value does not do anything. It may be slightly slower, but this doesn't matter because it won't remount needlessly in production.

Some APIs may not allow you to call them twice in a row. For example, the [`showModal`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal) method of the built-in [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement) element throws if you call it twice. Implement the cleanup function and make it close the dialog:

```js
useEffect(() => {
  const dialog = dialogRef.current;
  dialog.showModal();
  return () => dialog.close();
}, []);
```

In development, your Effect will call `showModal()`, then immediately `close()`, and then `showModal()` again. This has the same user-visible behavior as calling `showModal()` once, as you would see in production.

#### Subscribing to events

If your Effect subscribes to something, the cleanup function should unsubscribe:

```js
useEffect(() => {
  function handleScroll(e) {
    console.log(window.scrollX, window.scrollY);
  }
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

In development, your Effect will call `addEventListener()`, then immediately `removeEventListener()`, and then `addEventListener()` again with the same handler. So there would be only one active subscription at a time. This has the same user-visible behavior as calling `addEventListener()` once, as in production.

#### Triggering animations

If your Effect animates something in, the cleanup function should reset the animation to the initial values:

```js
useEffect(() => {
  const node = ref.current;
  node.style.opacity = 1; // Trigger the animation
  return () => {
    node.style.opacity = 0; // Reset to the initial value
  };
}, []);
```

In development, opacity will be set to `1`, then to `0`, and then to `1` again. This should have the same user-visible behavior as setting it to `1` directly, which is what would happen in production. If you use a third-party animation library with support for tweening, your cleanup function should reset the timeline to its initial state.

#### Fetching data

If your Effect fetches something, the cleanup function should either [abort the fetch](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) or ignore its result:

```js
useEffect(() => {
  let ignore = false;

  async function startFetching() {
    const json = await fetchTodos(userId);
    if (!ignore) {
      setTodos(json);
    }
  }

  startFetching();

  return () => {
    ignore = true;
  };
}, [userId]);
```

You can't "undo" a network request that already happened, but your cleanup function should ensure that the fetch that's _not relevant anymore_ does not keep affecting your application. If the `userId` changes from `'Alice'` to `'Bob'`, cleanup ensures that the `'Alice'` response is ignored even if it arrives after `'Bob'`.

**In development, you will see two fetches in the Network tab.** There is nothing wrong with that. With the approach above, the first Effect will immediately get cleaned up so its copy of the `ignore` variable will be set to `true`. So even though there is an extra request, it won't affect the state thanks to the `if (!ignore)` check.

**In production, there will only be one request.** If the second request in development is bothering you, the best approach is to use a solution that deduplicates requests and caches their responses between components:

```js
function TodoList() {
  const todos = useSomeDataLibrary(`/api/user/${userId}/todos`);
  // ...
```

This will not only improve the development experience, but also make your application feel faster. For example, the user pressing the Back button won't have to wait for some data to load again because it will be cached. You can either build such a cache yourself or use one of the many alternatives to manual fetching in Effects.

##### What are good alternatives to data fetching in Effects?

Writing `fetch` calls inside Effects is a [popular way to fetch data](https://www.robinwieruch.de/react-hooks-fetch-data/), especially in fully client-side apps. This is, however, a very manual approach and it has significant downsides:

- **Effects don't run on the server.** This means that the initial server-rendered HTML will only include a loading state with no data. The client computer will have to download all JavaScript and render your app only to discover that now it needs to load the data. This is not very efficient.
- **Fetching directly in Effects makes it easy to create "network waterfalls".** You render the parent component, it fetches some data, renders the child components, and then they start fetching their data. If the network is not very fast, this is significantly slower than fetching all data in parallel.
- **Fetching directly in Effects usually means you don't preload or cache data.** For example, if the component unmounts and then mounts again, it would have to fetch the data again.
- **It's not very ergonomic.** There's quite a bit of boilerplate code involved when writing `fetch` calls in a way that doesn't suffer from bugs like [race conditions.](https://maxrozen.com/race-conditions-fetching-data-react-with-useeffect)

This list of downsides is not specific to React. It applies to fetching data on mount with any library. Like with routing, data fetching is not trivial to do well, so we recommend the following approaches:

- **If you use a [framework](https://react.dev/learn/creating-a-react-app#full-stack-frameworks), use its built-in data fetching mechanism.** Modern React frameworks have integrated data fetching mechanisms that are efficient and don't suffer from the above pitfalls.
- **Otherwise, consider using or building a client-side cache.** Popular open source solutions include [TanStack Query](https://tanstack.com/query/latest), [useSWR](https://swr.vercel.app/), and [React Router 6.4+.](https://beta.reactrouter.com/en/main/start/overview) You can build your own solution too, in which case you would use Effects under the hood, but add logic for deduplicating requests, caching responses, and avoiding network waterfalls (by preloading data or hoisting data requirements to routes).

You can continue fetching data directly in Effects if neither of these approaches suit you.

#### Sending analytics

Consider this code that sends an analytics event on the page visit:

```js
useEffect(() => {
  logVisit(url); // Sends a POST request
}, [url]);
```

In development, `logVisit` will be called twice for every URL, so you might be tempted to try to fix that. **We recommend keeping this code as is.** Like with earlier examples, there is no *user-visible* behavior difference between running it once and running it twice. From a practical point of view, `logVisit` should not do anything in development because you don't want the logs from the development machines to skew the production metrics. Your component remounts every time you save its file, so it logs extra visits in development anyway.

**In production, there will be no duplicate visit logs.**

To debug the analytics events you're sending, you can deploy your app to a staging environment (which runs in production mode) or temporarily opt out of [Strict Mode](https://react.dev/reference/react/StrictMode) and its development-only remounting checks. You may also send analytics from the route change event handlers instead of Effects. For more precise analytics, [intersection observers](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) can help track which components are in the viewport and how long they remain visible.

#### Not an Effect: Initializing the application

Some logic should only run once when the application starts. You can put it outside your components:

```js
if (typeof window !== 'undefined') { // Check if we're running in the browser.
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

This guarantees that such logic only runs once after the browser loads the page.

#### Not an Effect: Buying a product

Sometimes, even if you write a cleanup function, there's no way to prevent user-visible consequences of running the Effect twice. For example, maybe your Effect sends a POST request like buying a product:

```js
useEffect(() => {
  // 🔴 Wrong: This Effect fires twice in development, exposing a problem in the code.
  fetch('/api/buy', { method: 'POST' });
}, []);
```

You wouldn't want to buy the product twice. However, this is also why you shouldn't put this logic in an Effect. What if the user goes to another page and then presses Back? Your Effect would run again. You don't want to buy the product when the user *visits* a page; you want to buy it when the user *clicks* the Buy button.

Buying is not caused by rendering; it's caused by a specific interaction. It should run only when the user presses the button. **Delete the Effect and move your `/api/buy` request into the Buy button event handler:**

```js
  function handleClick() {
    // ✅ Buying is an event because it is caused by a particular interaction.
    fetch('/api/buy', { method: 'POST' });
  }
```

**This illustrates that if remounting breaks the logic of your application, this usually uncovers existing bugs.** From a user's perspective, visiting a page shouldn't be different from visiting it, clicking a link, then pressing Back to view the page again. React verifies that your components abide by this principle by remounting them once in development.

### Putting it all together

This playground can help you "get a feel" for how Effects work in practice.

This example uses [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout) to schedule a console log with the input text to appear three seconds after the Effect runs. The cleanup function cancels the pending timeout. Start by pressing "Mount the component":

```js
import { useState, useEffect } from 'react';

function Playground() {
  const [text, setText] = useState('a');

  useEffect(() => {
    function onTimeout() {
      console.log('⏰ ' + text);
    }

    console.log('🔵 Schedule "' + text + '" log');
    const timeoutId = setTimeout(onTimeout, 3000);

    return () => {
      console.log('🟡 Cancel "' + text + '" log');
      clearTimeout(timeoutId);
    };
  }, [text]);

  return (
    <>
      <label>
        What to log:{' '}
        <input
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </label>
      <h1>{text}</h1>
    </>
  );
}

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(!show)}>
        {show ? 'Unmount' : 'Mount'} the component
      </button>
      {show && <hr />}
      {show && <Playground />}
    </>
  );
}
```

You will see three logs at first: `Schedule "a" log`, `Cancel "a" log`, and `Schedule "a" log` again. Three second later there will also be a log saying `a`. As you learned earlier, the extra schedule/cancel pair is because React remounts the component once in development to verify that you've implemented cleanup well.

Now edit the input to say `abc`. If you do it fast enough, you'll see `Schedule "ab" log` immediately followed by `Cancel "ab" log` and `Schedule "abc" log`. **React always cleans up the previous render's Effect before the next render's Effect.** This is why even if you type into the input fast, there is at most one timeout scheduled at a time. Edit the input a few times and watch the console to get a feel for how Effects get cleaned up.

Type something into the input and then immediately press "Unmount the component". Notice how unmounting cleans up the last render's Effect. Here, it clears the last timeout before it has a chance to fire.

Finally, edit the component above and comment out the cleanup function so that the timeouts don't get cancelled. Try typing `abcde` fast. What do you expect to happen in three seconds? Will `console.log(text)` inside the timeout print the *latest* `text` and produce five `abcde` logs? Give it a try to check your intuition!

Three seconds later, you should see a sequence of logs (`a`, `ab`, `abc`, `abcd`, and `abcde`) rather than five `abcde` logs. **Each Effect "captures" the `text` value from its corresponding render.**  It doesn't matter that the `text` state changed: an Effect from the render with `text = 'ab'` will always see `'ab'`. In other words, Effects from each render are isolated from each other. If you're curious how this works, you can read about [closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures).

##### Each render has its own Effects

You can think of `useEffect` as "attaching" a piece of behavior to the render output. Consider this Effect:

```js
export default function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);

  return <h1>Welcome to {roomId}!</h1>;
}
```

Let's see what exactly happens as the user navigates around the app.

##### Initial render

The user visits ``. Let's [mentally substitute](https://react.dev/learn/state-as-a-snapshot#rendering-takes-a-snapshot-in-time) `roomId` with `'general'`:

```js
  // JSX for the first render (roomId = "general")
  return <h1>Welcome to general!</h1>;
```

**The Effect is *also* a part of the rendering output.** The first render's Effect becomes:

```js
  // Effect for the first render (roomId = "general")
  () => {
    const connection = createConnection('general');
    connection.connect();
    return () => connection.disconnect();
  },
  // Dependencies for the first render (roomId = "general")
  ['general']
```

React runs this Effect, which connects to the `'general'` chat room.

##### Re-render with same dependencies

Let's say `` re-renders. The JSX output is the same:

```js
  // JSX for the second render (roomId = "general")
  return <h1>Welcome to general!</h1>;
```

React sees that the rendering output has not changed, so it doesn't update the DOM.

The Effect from the second render looks like this:

```js
  // Effect for the second render (roomId = "general")
  () => {
    const connection = createConnection('general');
    connection.connect();
    return () => connection.disconnect();
  },
  // Dependencies for the second render (roomId = "general")
  ['general']
```

React compares `['general']` from the second render with `['general']` from the first render. **Because all dependencies are the same, React *ignores* the Effect from the second render.** It never gets called.

##### Re-render with different dependencies

Then, the user visits ``. This time, the component returns different JSX:

```js
  // JSX for the third render (roomId = "travel")
  return <h1>Welcome to travel!</h1>;
```

React updates the DOM to change `"Welcome to general"` into `"Welcome to travel"`.

The Effect from the third render looks like this:

```js
  // Effect for the third render (roomId = "travel")
  () => {
    const connection = createConnection('travel');
    connection.connect();
    return () => connection.disconnect();
  },
  // Dependencies for the third render (roomId = "travel")
  ['travel']
```

React compares `['travel']` from the third render with `['general']` from the second render. One dependency is different: `Object.is('travel', 'general')` is `false`. The Effect can't be skipped.

**Before React can apply the Effect from the third render, it needs to clean up the last Effect that _did_ run.** The second render's Effect was skipped, so React needs to clean up the first render's Effect. If you scroll up to the first render, you'll see that its cleanup calls `disconnect()` on the connection that was created with `createConnection('general')`. This disconnects the app from the `'general'` chat room.

After that, React runs the third render's Effect. It connects to the `'travel'` chat room.

##### Unmount

Finally, let's say the user navigates away, and the `ChatRoom` component unmounts. React runs the last Effect's cleanup function. The last Effect was from the third render. The third render's cleanup destroys the `createConnection('travel')` connection. So the app disconnects from the `'travel'` room.

##### Development-only behaviors

When [Strict Mode](https://react.dev/reference/react/StrictMode) is on, React remounts every component once after mount (state and DOM are preserved). This [helps you find Effects that need cleanup](#step-3-add-cleanup-if-needed) and exposes bugs like race conditions early. Additionally, React will remount the Effects whenever you save a file in development. Both of these behaviors are development-only.

- Unlike events, Effects are caused by rendering itself rather than a particular interaction.
- Effects let you synchronize a component with some external system (third-party API, network, etc).
- By default, Effects run after every render (including the initial one).
- React will skip the Effect if all of its dependencies have the same values as during the last render.
- You can't "choose" your dependencies. They are determined by the code inside the Effect.
- Empty dependency array (`[]`) corresponds to the component "mounting", i.e. being added to the screen.
- In Strict Mode, React mounts components twice (in development only!) to stress-test your Effects.
- If your Effect breaks because of remounting, you need to implement a cleanup function.
- React will call your cleanup function before the Effect runs next time, and during the unmount.

## 'You Might Not Need an Effect'

> **Source:** ['You Might Not Need an Effect'](https://react.dev/learn/you-might-not-need-an-effect) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

Effects are an escape hatch from the React paradigm. They let you "step outside" of React and synchronize your components with some external system like a non-React widget, network, or the browser DOM. If there is no external system involved (for example, if you want to update a component's state when some props or state change), you shouldn't need an Effect. Removing unnecessary Effects will make your code easier to follow, faster to run, and less error-prone.

* Why and how to remove unnecessary Effects from your components
* How to cache expensive computations without Effects
* How to reset and adjust component state without Effects
* How to share logic between event handlers
* Which logic should be moved to event handlers
* How to notify parent components about changes

### How to remove unnecessary Effects

There are two common cases in which you don't need Effects:

* **You don't need Effects to transform data for rendering.** For example, let's say you want to filter a list before displaying it. You might feel tempted to write an Effect that updates a state variable when the list changes. However, this is inefficient. When you update the state, React will first call your component functions to calculate what should be on the screen. Then React will ["commit"](https://react.dev/learn/render-and-commit) these changes to the DOM, updating the screen. Then React will run your Effects. If your Effect *also* immediately updates the state, this restarts the whole process from scratch! To avoid the unnecessary render passes, transform all the data at the top level of your components. That code will automatically re-run whenever your props or state change.
* **You don't need Effects to handle user events.** For example, let's say you want to send an `/api/buy` POST request and show a notification when the user buys a product. In the Buy button click event handler, you know exactly what happened. By the time an Effect runs, you don't know *what* the user did (for example, which button was clicked). This is why you'll usually handle user events in the corresponding event handlers.

You *do* need Effects to [synchronize](https://react.dev/learn/synchronizing-with-effects#what-are-effects-and-how-are-they-different-from-events) with external systems. For example, you can write an Effect that keeps a jQuery widget synchronized with the React state. You can also fetch data with Effects: for example, you can synchronize the search results with the current search query. Keep in mind that modern [frameworks](https://react.dev/learn/creating-a-react-app#full-stack-frameworks) provide more efficient built-in data fetching mechanisms than writing Effects directly in your components.

To help you gain the right intuition, let's look at some common concrete examples!

#### Updating state based on props or state

Suppose you have a component with two state variables: `firstName` and `lastName`. You want to calculate a `fullName` from them by concatenating them. Moreover, you'd like `fullName` to update whenever `firstName` or `lastName` change. Your first instinct might be to add a `fullName` state variable and update it in an Effect:

```js
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');

  // 🔴 Avoid: redundant state and unnecessary Effect
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
  // ...
}
```

This is more complicated than necessary. It is inefficient too: it does an entire render pass with a stale value for `fullName`, then immediately re-renders with the updated value. Remove the state variable and the Effect:

```js
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');
  // ✅ Good: calculated during rendering
  const fullName = firstName + ' ' + lastName;
  // ...
}
```

**When something can be calculated from the existing props or state, [don't put it in state.](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state) Instead, calculate it during rendering.** This makes your code faster (you avoid the extra "cascading" updates), simpler (you remove some code), and less error-prone (you avoid bugs caused by different state variables getting out of sync with each other). If this approach feels new to you, [Thinking in React](https://react.dev/learn/thinking-in-react#step-3-find-the-minimal-but-complete-representation-of-ui-state) explains what should go into state.

#### Caching expensive calculations

This component computes `visibleTodos` by taking the `todos` it receives by props and filtering them according to the `filter` prop. You might feel tempted to store the result in state and update it from an Effect:

```js
function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');

  // 🔴 Avoid: redundant state and unnecessary Effect
  const [visibleTodos, setVisibleTodos] = useState([]);
  useEffect(() => {
    setVisibleTodos(getFilteredTodos(todos, filter));
  }, [todos, filter]);

  // ...
}
```

Like in the earlier example, this is both unnecessary and inefficient. First, remove the state and the Effect:

```js
function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');
  // ✅ This is fine if getFilteredTodos() is not slow.
  const visibleTodos = getFilteredTodos(todos, filter);
  // ...
}
```

Usually, this code is fine! But maybe `getFilteredTodos()` is slow or you have a lot of `todos`. In that case you don't want to recalculate `getFilteredTodos()` if some unrelated state variable like `newTodo` has changed.

You can cache (or ["memoize"](https://en.wikipedia.org/wiki/Memoization)) an expensive calculation by wrapping it in a [`useMemo`](https://react.dev/reference/react/useMemo) Hook:

[React Compiler](https://react.dev/learn/react-compiler) can automatically memoize expensive calculations for you, eliminating the need for manual `useMemo` in many cases.

```js
import { useMemo, useState } from 'react';

function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');
  const visibleTodos = useMemo(() => {
    // ✅ Does not re-run unless todos or filter change
    return getFilteredTodos(todos, filter);
  }, [todos, filter]);
  // ...
}
```

Or, written as a single line:

```js
import { useMemo, useState } from 'react';

function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');
  // ✅ Does not re-run getFilteredTodos() unless todos or filter change
  const visibleTodos = useMemo(() => getFilteredTodos(todos, filter), [todos, filter]);
  // ...
}
```

**This tells React that you don't want the inner function to re-run unless either `todos` or `filter` have changed.** React will remember the return value of `getFilteredTodos()` during the initial render. During the next renders, it will check if `todos` or `filter` are different. If they're the same as last time, `useMemo` will return the last result it has stored. But if they are different, React will call the inner function again (and store its result).

The function you wrap in [`useMemo`](https://react.dev/reference/react/useMemo) runs during rendering, so this only works for [pure calculations.](https://react.dev/learn/keeping-components-pure)

##### How to tell if a calculation is expensive?

In general, unless you're creating or looping over thousands of objects, it's probably not expensive. If you want to get more confidence, you can add a console log to measure the time spent in a piece of code:

```js
console.time('filter array');
const visibleTodos = getFilteredTodos(todos, filter);
console.timeEnd('filter array');
```

Perform the interaction you're measuring (for example, typing into the input). You will then see logs like `filter array: 0.15ms` in your console. If the overall logged time adds up to a significant amount (say, `1ms` or more), it might make sense to memoize that calculation. As an experiment, you can then wrap the calculation in `useMemo` to verify whether the total logged time has decreased for that interaction or not:

```js
console.time('filter array');
const visibleTodos = useMemo(() => {
  return getFilteredTodos(todos, filter); // Skipped if todos and filter haven't changed
}, [todos, filter]);
console.timeEnd('filter array');
```

`useMemo` won't make the *first* render faster. It only helps you skip unnecessary work on updates.

Keep in mind that your machine is probably faster than your users' so it's a good idea to test the performance with an artificial slowdown. For example, Chrome offers a [CPU Throttling](https://developer.chrome.com/blog/new-in-devtools-61/#throttling) option for this.

Also note that measuring performance in development will not give you the most accurate results. (For example, when [Strict Mode](https://react.dev/reference/react/StrictMode) is on, you will see each component render twice rather than once.) To get the most accurate timings, build your app for production and test it on a device like your users have.

#### Resetting all state when a prop changes

This `ProfilePage` component receives a `userId` prop. The page contains a comment input, and you use a `comment` state variable to hold its value. One day, you notice a problem: when you navigate from one profile to another, the `comment` state does not get reset. As a result, it's easy to accidentally post a comment on a wrong user's profile. To fix the issue, you want to clear out the `comment` state variable whenever the `userId` changes:

```js
export default function ProfilePage({ userId }) {
  const [comment, setComment] = useState('');

  // 🔴 Avoid: Resetting state on prop change in an Effect
  useEffect(() => {
    setComment('');
  }, [userId]);
  // ...
}
```

This is inefficient because `ProfilePage` and its children will first render with the stale value, and then render again. It is also complicated because you'd need to do this in *every* component that has some state inside `ProfilePage`. For example, if the comment UI is nested, you'd want to clear out nested comment state too.

Instead, you can tell React that each user's profile is conceptually a _different_ profile by giving it an explicit key. Split your component in two and pass a `key` attribute from the outer component to the inner one:

```js
export default function ProfilePage({ userId }) {
  return (
    <Profile
      userId={userId}
      key={userId}
    />
  );
}

function Profile({ userId }) {
  // ✅ This and any other state below will reset on key change automatically
  const [comment, setComment] = useState('');
  // ...
}
```

Normally, React preserves the state when the same component is rendered in the same spot. **By passing `userId` as a `key` to the `Profile` component, you're asking React to treat two `Profile` components with different `userId` as two different components that should not share any state.** Whenever the key (which you've set to `userId`) changes, React will recreate the DOM and [reset the state](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key) of the `Profile` component and all of its children. Now the `comment` field will clear out automatically when navigating between profiles.

Note that in this example, only the outer `ProfilePage` component is exported and visible to other files in the project. Components rendering `ProfilePage` don't need to pass the key to it: they pass `userId` as a regular prop. The fact `ProfilePage` passes it as a `key` to the inner `Profile` component is an implementation detail.

#### Adjusting some state when a prop changes

Sometimes, you might want to reset or adjust a part of the state on a prop change, but not all of it.

This `List` component receives a list of `items` as a prop, and maintains the selected item in the `selection` state variable. You want to reset the `selection` to `null` whenever the `items` prop receives a different array:

```js
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // 🔴 Avoid: Adjusting state on prop change in an Effect
  useEffect(() => {
    setSelection(null);
  }, [items]);
  // ...
}
```

This, too, is not ideal. Every time the `items` change, the `List` and its child components will render with a stale `selection` value at first. Then React will update the DOM and run the Effects. Finally, the `setSelection(null)` call will cause another re-render of the `List` and its child components, restarting this whole process again.

Start by deleting the Effect. Instead, adjust the state directly during rendering:

```js
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // Better: Adjust the state while rendering
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setSelection(null);
  }
  // ...
}
```

[Storing information from previous renders](https://react.dev/reference/react/useState#storing-information-from-previous-renders) like this can be hard to understand, but it’s better than updating the same state in an Effect. In the above example, `setSelection` is called directly during a render. React will re-render the `List` *immediately* after it exits with a `return` statement. React has not rendered the `List` children or updated the DOM yet, so this lets the `List` children skip rendering the stale `selection` value.

When you update a component during rendering, React throws away the returned JSX and immediately retries rendering. To avoid very slow cascading retries, React only lets you update the *same* component's state during a render. If you update another component's state during a render, you'll see an error. A condition like `items !== prevItems` is necessary to avoid loops. You may adjust state like this, but any other side effects (like changing the DOM or setting timeouts) should stay in event handlers or Effects to [keep components pure.](https://react.dev/learn/keeping-components-pure)

**Although this pattern is more efficient than an Effect, most components shouldn't need it either.** No matter how you do it, adjusting state based on props or other state makes your data flow more difficult to understand and debug. Always check whether you can [reset all state with a key](#resetting-all-state-when-a-prop-changes) or [calculate everything during rendering](#updating-state-based-on-props-or-state) instead. For example, instead of storing (and resetting) the selected *item*, you can store the selected *item ID:*

```js
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  // ✅ Best: Calculate everything during rendering
  const selection = items.find(item => item.id === selectedId) ?? null;
  // ...
}
```

Now there is no need to "adjust" the state at all. If the item with the selected ID is in the list, it remains selected. If it's not, the `selection` calculated during rendering will be `null` because no matching item was found. This behavior is different, but arguably better because most changes to `items` preserve the selection.

#### Sharing logic between event handlers

Let's say you have a product page with two buttons (Buy and Checkout) that both let you buy that product. You want to show a notification whenever the user puts the product in the cart. Calling `showNotification()` in both buttons' click handlers feels repetitive so you might be tempted to place this logic in an Effect:

```js
function ProductPage({ product, addToCart }) {
  // 🔴 Avoid: Event-specific logic inside an Effect
  useEffect(() => {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to the shopping cart!`);
    }
  }, [product]);

  function handleBuyClick() {
    addToCart(product);
  }

  function handleCheckoutClick() {
    addToCart(product);
    navigateTo('/checkout');
  }
  // ...
}
```

This Effect is unnecessary. It will also most likely cause bugs. For example, let's say that your app "remembers" the shopping cart between the page reloads. If you add a product to the cart once and refresh the page, the notification will appear again. It will keep appearing every time you refresh that product's page. This is because `product.isInCart` will already be `true` on the page load, so the Effect above will call `showNotification()`.

**When you're not sure whether some code should be in an Effect or in an event handler, ask yourself *why* this code needs to run. Use Effects only for code that should run *because* the component was displayed to the user.** In this example, the notification should appear because the user *pressed the button*, not because the page was displayed! Delete the Effect and put the shared logic into a function called from both event handlers:

```js
function ProductPage({ product, addToCart }) {
  // ✅ Good: Event-specific logic is called from event handlers
  function buyProduct() {
    addToCart(product);
    showNotification(`Added ${product.name} to the shopping cart!`);
  }

  function handleBuyClick() {
    buyProduct();
  }

  function handleCheckoutClick() {
    buyProduct();
    navigateTo('/checkout');
  }
  // ...
}
```

This both removes the unnecessary Effect and fixes the bug.

#### Sending a POST request

This `Form` component sends two kinds of POST requests. It sends an analytics event when it mounts. When you fill in the form and click the Submit button, it will send a POST request to the `/api/register` endpoint:

```js
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // ✅ Good: This logic should run because the component was displayed
  useEffect(() => {
    post('/analytics/event', { eventName: 'visit_form' });
  }, []);

  // 🔴 Avoid: Event-specific logic inside an Effect
  const [jsonToSubmit, setJsonToSubmit] = useState(null);
  useEffect(() => {
    if (jsonToSubmit !== null) {
      post('/api/register', jsonToSubmit);
    }
  }, [jsonToSubmit]);

  function handleSubmit(e) {
    e.preventDefault();
    setJsonToSubmit({ firstName, lastName });
  }
  // ...
}
```

Let's apply the same criteria as in the example before.

The analytics POST request should remain in an Effect. This is because the _reason_ to send the analytics event is that the form was displayed. (It would fire twice in development, but [see here](https://react.dev/learn/synchronizing-with-effects#sending-analytics) for how to deal with that.)

However, the `/api/register` POST request is not caused by the form being _displayed_. You only want to send the request at one specific moment in time: when the user presses the button. It should only ever happen _on that particular interaction_. Delete the second Effect and move that POST request into the event handler:

```js
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // ✅ Good: This logic runs because the component was displayed
  useEffect(() => {
    post('/analytics/event', { eventName: 'visit_form' });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // ✅ Good: Event-specific logic is in the event handler
    post('/api/register', { firstName, lastName });
  }
  // ...
}
```

When you choose whether to put some logic into an event handler or an Effect, the main question you need to answer is _what kind of logic_ it is from the user's perspective. If this logic is caused by a particular interaction, keep it in the event handler. If it's caused by the user _seeing_ the component on the screen, keep it in the Effect.

#### Chains of computations

Sometimes you might feel tempted to chain Effects that each adjust a piece of state based on other state:

```js
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  // 🔴 Avoid: Chains of Effects that adjust the state solely to trigger each other
  useEffect(() => {
    if (card !== null && card.gold) {
      setGoldCardCount(c => c + 1);
    }
  }, [card]);

  useEffect(() => {
    if (goldCardCount > 3) {
      setRound(r => r + 1)
      setGoldCardCount(0);
    }
  }, [goldCardCount]);

  useEffect(() => {
    if (round > 5) {
      setIsGameOver(true);
    }
  }, [round]);

  useEffect(() => {
    alert('Good game!');
  }, [isGameOver]);

  function handlePlaceCard(nextCard) {
    if (isGameOver) {
      throw Error('Game already ended.');
    } else {
      setCard(nextCard);
    }
  }

  // ...
```

There are two problems with this code.

The first problem is that it is very inefficient: the component (and its children) have to re-render between each `set` call in the chain. In the example above, in the worst case (`setCard` → render → `setGoldCardCount` → render → `setRound` → render → `setIsGameOver` → render) there are three unnecessary re-renders of the tree below.

The second problem is that even if it weren't slow, as your code evolves, you will run into cases where the "chain" you wrote doesn't fit the new requirements. Imagine you are adding a way to step through the history of the game moves. You'd do it by updating each state variable to a value from the past. However, setting the `card` state to a value from the past would trigger the Effect chain again and change the data you're showing. Such code is often rigid and fragile.

In this case, it's better to calculate what you can during rendering, and adjust the state in the event handler:

```js
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);

  // ✅ Calculate what you can during rendering
  const isGameOver = round > 5;

  function handlePlaceCard(nextCard) {
    if (isGameOver) {
      throw Error('Game already ended.');
    }

    // ✅ Calculate all the next state in the event handler
    setCard(nextCard);
    if (nextCard.gold) {
      if (goldCardCount < 3) {
        setGoldCardCount(goldCardCount + 1);
      } else {
        setGoldCardCount(0);
        setRound(round + 1);
        if (round === 5) {
          alert('Good game!');
        }
      }
    }
  }

  // ...
```

This is a lot more efficient. Also, if you implement a way to view game history, now you will be able to set each state variable to a move from the past without triggering the Effect chain that adjusts every other value. If you need to reuse logic between several event handlers, you can [extract a function](#sharing-logic-between-event-handlers) and call it from those handlers.

Remember that inside event handlers, [state behaves like a snapshot.](https://react.dev/learn/state-as-a-snapshot) For example, even after you call `setRound(round + 1)`, the `round` variable will reflect the value at the time the user clicked the button. If you need to use the next value for calculations, define it manually like `const nextRound = round + 1`.

In some cases, you *can't* calculate the next state directly in the event handler. For example, imagine a form with multiple dropdowns where the options of the next dropdown depend on the selected value of the previous dropdown. Then, a chain of Effects is appropriate because you are synchronizing with network.

#### Initializing the application

Some logic should only run once when the app loads.

You might be tempted to place it in an Effect in the top-level component:

```js
function App() {
  // 🔴 Avoid: Effects with logic that should only ever run once
  useEffect(() => {
    loadDataFromLocalStorage();
    checkAuthToken();
  }, []);
  // ...
}
```

However, you'll quickly discover that it [runs twice in development.](https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development) This can cause issues--for example, maybe it invalidates the authentication token because the function wasn't designed to be called twice. In general, your components should be resilient to being remounted. This includes your top-level `App` component.

Although it may not ever get remounted in practice in production, following the same constraints in all components makes it easier to move and reuse code. If some logic must run *once per app load* rather than *once per component mount*, add a top-level variable to track whether it has already executed:

```js
let didInit = false;

function App() {
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      // ✅ Only runs once per app load
      loadDataFromLocalStorage();
      checkAuthToken();
    }
  }, []);
  // ...
}
```

You can also run it during module initialization and before the app renders:

```js
if (typeof window !== 'undefined') { // Check if we're running in the browser.
   // ✅ Only runs once per app load
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

Code at the top level runs once when your component is imported--even if it doesn't end up being rendered. To avoid slowdown or surprising behavior when importing arbitrary components, don't overuse this pattern. Keep app-wide initialization logic to root component modules like `App.js` or in your application's entry point.

#### Notifying parent components about state changes

Let's say you're writing a `Toggle` component with an internal `isOn` state which can be either `true` or `false`. There are a few different ways to toggle it (by clicking or dragging). You want to notify the parent component whenever the `Toggle` internal state changes, so you expose an `onChange` event and call it from an Effect:

```js
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  // 🔴 Avoid: The onChange handler runs too late
  useEffect(() => {
    onChange(isOn);
  }, [isOn, onChange])

  function handleClick() {
    setIsOn(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      setIsOn(true);
    } else {
      setIsOn(false);
    }
  }

  // ...
}
```

Like earlier, this is not ideal. The `Toggle` updates its state first, and React updates the screen. Then React runs the Effect, which calls the `onChange` function passed from a parent component. Now the parent component will update its own state, starting another render pass. It would be better to do everything in a single pass.

Delete the Effect and instead update the state of *both* components within the same event handler:

```js
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  function updateToggle(nextIsOn) {
    // ✅ Good: Perform all updates during the event that caused them
    setIsOn(nextIsOn);
    onChange(nextIsOn);
  }

  function handleClick() {
    updateToggle(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      updateToggle(true);
    } else {
      updateToggle(false);
    }
  }

  // ...
}
```

With this approach, both the `Toggle` component and its parent component update their state during the event. React [batches updates](https://react.dev/learn/queueing-a-series-of-state-updates) from different components together, so there will only be one render pass.

You might also be able to remove the state altogether, and instead receive `isOn` from the parent component:

```js
// ✅ Also good: the component is fully controlled by its parent
function Toggle({ isOn, onChange }) {
  function handleClick() {
    onChange(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      onChange(true);
    } else {
      onChange(false);
    }
  }

  // ...
}
```

["Lifting state up"](https://react.dev/learn/sharing-state-between-components) lets the parent component fully control the `Toggle` by toggling the parent's own state. This means the parent component will have to contain more logic, but there will be less state overall to worry about. Whenever you try to keep two different state variables synchronized, try lifting state up instead!

#### Passing data to the parent

This `Child` component fetches some data and then passes it to the `Parent` component in an Effect:

```js
function Parent() {
  const [data, setData] = useState(null);
  // ...
  return <Child onFetched={setData} />;
}

function Child({ onFetched }) {
  const data = useSomeAPI();
  // 🔴 Avoid: Passing data to the parent in an Effect
  useEffect(() => {
    if (data) {
      onFetched(data);
    }
  }, [onFetched, data]);
  // ...
}
```

In React, data flows from the parent components to their children. When you see something wrong on the screen, you can trace where the information comes from by going up the component chain until you find which component passes the wrong prop or has the wrong state. When child components update the state of their parent components in Effects, the data flow becomes very difficult to trace. Since both the child and the parent need the same data, let the parent component fetch that data, and *pass it down* to the child instead:

```js
function Parent() {
  const data = useSomeAPI();
  // ...
  // ✅ Good: Passing data down to the child
  return <Child data={data} />;
}

function Child({ data }) {
  // ...
}
```

This is simpler and keeps the data flow predictable: the data flows down from the parent to the child.

#### Subscribing to an external store

Sometimes, your components may need to subscribe to some data outside of the React state. This data could be from a third-party library or a built-in browser API. Since this data can change without React's knowledge, you need to manually subscribe your components to it. This is often done with an Effect, for example:

```js
function useOnlineStatus() {
  // Not ideal: Manual store subscription in an Effect
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function updateState() {
      setIsOnline(navigator.onLine);
    }

    updateState();

    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);
    return () => {
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);
    };
  }, []);
  return isOnline;
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```

Here, the component subscribes to an external data store (in this case, the browser `navigator.onLine` API). Since this API does not exist on the server (so it can't be used for the initial HTML), initially the state is set to `true`. Whenever the value of that data store changes in the browser, the component updates its state.

Although it's common to use Effects for this, React has a purpose-built Hook for subscribing to an external store that is preferred instead. Delete the Effect and replace it with a call to [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore):

```js
function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnlineStatus() {
  // ✅ Good: Subscribing to an external store with a built-in Hook
  return useSyncExternalStore(
    subscribe, // React won't resubscribe for as long as you pass the same function
    () => navigator.onLine, // How to get the value on the client
    () => true // How to get the value on the server
  );
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```

This approach is less error-prone than manually syncing mutable data to React state with an Effect. Typically, you'll write a custom Hook like `useOnlineStatus()` above so that you don't need to repeat this code in the individual components. [Read more about subscribing to external stores from React components.](https://react.dev/reference/react/useSyncExternalStore)

#### Fetching data

Many apps use Effects to kick off data fetching. It is quite common to write a data fetching Effect like this:

```js
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // 🔴 Avoid: Fetching without cleanup logic
    fetchResults(query, page).then(json => {
      setResults(json);
    });
  }, [query, page]);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}
```

You *don't* need to move this fetch to an event handler.

This might seem like a contradiction with the earlier examples where you needed to put the logic into the event handlers! However, consider that it's not *the typing event* that's the main reason to fetch. Search inputs are often prepopulated from the URL, and the user might navigate Back and Forward without touching the input.

It doesn't matter where `page` and `query` come from. While this component is visible, you want to keep `results` [synchronized](https://react.dev/learn/synchronizing-with-effects) with data from the network for the current `page` and `query`. This is why it's an Effect.

However, the code above has a bug. Imagine you type `"hello"` fast. Then the `query` will change from `"h"`, to `"he"`, `"hel"`, `"hell"`, and `"hello"`. This will kick off separate fetches, but there is no guarantee about which order the responses will arrive in. For example, the `"hell"` response may arrive *after* the `"hello"` response. Since it will call `setResults()` last, you will be displaying the wrong search results. This is called a ["race condition"](https://en.wikipedia.org/wiki/Race_condition): two different requests "raced" against each other and came in a different order than you expected.

**To fix the race condition, you need to [add a cleanup function](https://react.dev/learn/synchronizing-with-effects#fetching-data) to ignore stale responses:**

```js
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    let ignore = false;
    fetchResults(query, page).then(json => {
      if (!ignore) {
        setResults(json);
      }
    });
    return () => {
      ignore = true;
    };
  }, [query, page]);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}
```

This ensures that when your Effect fetches data, all responses except the last requested one will be ignored.

Handling race conditions is not the only difficulty with implementing data fetching. You might also want to think about caching responses (so that the user can click Back and see the previous screen instantly), how to fetch data on the server (so that the initial server-rendered HTML contains the fetched content instead of a spinner), and how to avoid network waterfalls (so that a child can fetch data without waiting for every parent).

**These issues apply to any UI library, not just React. Solving them is not trivial, which is why modern [frameworks](https://react.dev/learn/creating-a-react-app#full-stack-frameworks) provide more efficient built-in data fetching mechanisms than fetching data in Effects.**

If you don't use a framework (and don't want to build your own) but would like to make data fetching from Effects more ergonomic, consider extracting your fetching logic into a custom Hook like in this example:

```js
function SearchResults({ query }) {
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ query, page });
  const results = useData(`/api/search?${params}`);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}

function useData(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let ignore = false;
    fetch(url)
      .then(response => response.json())
      .then(json => {
        if (!ignore) {
          setData(json);
        }
      });
    return () => {
      ignore = true;
    };
  }, [url]);
  return data;
}
```

You'll likely also want to add some logic for error handling and to track whether the content is loading. You can build a Hook like this yourself or use one of the many solutions already available in the React ecosystem. **Although this alone won't be as efficient as using a framework's built-in data fetching mechanism, moving the data fetching logic into a custom Hook will make it easier to adopt an efficient data fetching strategy later.**

In general, whenever you have to resort to writing Effects, keep an eye out for when you can extract a piece of functionality into a custom Hook with a more declarative and purpose-built API like `useData` above. The fewer raw `useEffect` calls you have in your components, the easier you will find to maintain your application.

- If you can calculate something during render, you don't need an Effect.
- To cache expensive calculations, add `useMemo` instead of `useEffect`.
- To reset the state of an entire component tree, pass a different `key` to it.
- To reset a particular bit of state in response to a prop change, set it during rendering.
- Code that runs because a component was *displayed* should be in Effects, the rest should be in events.
- If you need to update the state of several components, it's better to do it during a single event.
- Whenever you try to synchronize state variables in different components, consider lifting state up.
- You can fetch data with Effects, but you need to implement cleanup to avoid race conditions.

## 'Reusing Logic with Custom Hooks'

> **Source:** ['Reusing Logic with Custom Hooks'](https://react.dev/learn/reusing-logic-with-custom-hooks) · [react.dev](https://github.com/reactjs/react.dev), CC BY 4.0

React comes with several built-in Hooks like `useState`, `useContext`, and `useEffect`. Sometimes, you'll wish that there was a Hook for some more specific purpose: for example, to fetch data, to keep track of whether the user is online, or to connect to a chat room. You might not find these Hooks in React, but you can create your own Hooks for your application's needs.

- What custom Hooks are, and how to write your own
- How to reuse logic between components
- How to name and structure your custom Hooks
- When and why to extract custom Hooks

### Custom Hooks: Sharing logic between components

Imagine you're developing an app that heavily relies on the network (as most apps do). You want to warn the user if their network connection has accidentally gone off while they were using your app. How would you go about it? It seems like you'll need two things in your component:

1. A piece of state that tracks whether the network is online.
2. An Effect that subscribes to the global [`online`](https://developer.mozilla.org/en-US/docs/Web/API/Window/online_event) and [`offline`](https://developer.mozilla.org/en-US/docs/Web/API/Window/offline_event) events, and updates that state.

This will keep your component [synchronized](https://react.dev/learn/synchronizing-with-effects) with the network status. You might start with something like this:

```js
import { useState, useEffect } from 'react';

export default function StatusBar() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;
}
```

Try turning your network on and off, and notice how this `StatusBar` updates in response to your actions.

Now imagine you *also* want to use the same logic in a different component. You want to implement a Save button that will become disabled and show "Reconnecting..." instead of "Save" while the network is off.

To start, you can copy and paste the `isOnline` state and the Effect into `SaveButton`:

```js
import { useState, useEffect } from 'react';

export default function SaveButton() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  function handleSaveClick() {
    console.log('✅ Progress saved');
  }

  return (
    <button disabled={!isOnline} onClick={handleSaveClick}>
      {isOnline ? 'Save progress' : 'Reconnecting...'}
    </button>
  );
}
```

Verify that, if you turn off the network, the button will change its appearance.

These two components work fine, but the duplication in logic between them is unfortunate. It seems like even though they have different *visual appearance,* you want to reuse the logic between them.

#### Extracting your own custom Hook from a component

Imagine for a moment that, similar to [`useState`](https://react.dev/reference/react/useState) and [`useEffect`](https://react.dev/reference/react/useEffect), there was a built-in `useOnlineStatus` Hook. Then both of these components could be simplified and you could remove the duplication between them:

```js
function StatusBar() {
  const isOnline = useOnlineStatus();
  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;
}

function SaveButton() {
  const isOnline = useOnlineStatus();

  function handleSaveClick() {
    console.log('✅ Progress saved');
  }

  return (
    <button disabled={!isOnline} onClick={handleSaveClick}>
      {isOnline ? 'Save progress' : 'Reconnecting...'}
    </button>
  );
}
```

Although there is no such built-in Hook, you can write it yourself. Declare a function called `useOnlineStatus` and move all the duplicated code into it from the components you wrote earlier:

```js
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
}
```

At the end of the function, return `isOnline`. This lets your components read that value:

```js
import { useOnlineStatus } from './useOnlineStatus.js';

function StatusBar() {
  const isOnline = useOnlineStatus();
  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;
}

function SaveButton() {
  const isOnline = useOnlineStatus();

  function handleSaveClick() {
    console.log('✅ Progress saved');
  }

  return (
    <button disabled={!isOnline} onClick={handleSaveClick}>
      {isOnline ? 'Save progress' : 'Reconnecting...'}
    </button>
  );
}

export default function App() {
  return (
    <>
      <SaveButton />
      <StatusBar />
    </>
  );
}
```

```js
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
}
```

Verify that switching the network on and off updates both components.

Now your components don't have as much repetitive logic. **More importantly, the code inside them describes *what they want to do* (use the online status!) rather than *how to do it* (by subscribing to the browser events).**

When you extract logic into custom Hooks, you can hide the gnarly details of how you deal with some external system or a browser API. The code of your components expresses your intent, not the implementation.

#### Hook names always start with `use`

React applications are built from components. Components are built from Hooks, whether built-in or custom. You'll likely often use custom Hooks created by others, but occasionally you might write one yourself!

You must follow these naming conventions:

1. **React component names must start with a capital letter,** like `StatusBar` and `SaveButton`. React components also need to return something that React knows how to display, like a piece of JSX.
2. **Hook names must start with `use` followed by a capital letter,** like [`useState`](https://react.dev/reference/react/useState) (built-in) or `useOnlineStatus` (custom, like earlier on the page). Hooks may return arbitrary values.

This convention guarantees that you can always look at a component and know where its state, Effects, and other React features might "hide". For example, if you see a `getColor()` function call inside your component, you can be sure that it can't possibly contain React state inside because its name doesn't start with `use`. However, a function call like `useOnlineStatus()` will most likely contain calls to other Hooks inside!

If your linter is [configured for React,](https://react.dev/learn/editor-setup#linting) it will enforce this naming convention. Scroll up to the sandbox above and rename `useOnlineStatus` to `getOnlineStatus`. Notice that the linter won't allow you to call `useState` or `useEffect` inside of it anymore. Only Hooks and components can call other Hooks!

##### Should all functions called during rendering start with the use prefix?

No. Functions that don't *call* Hooks don't need to *be* Hooks.

If your function doesn't call any Hooks, avoid the `use` prefix. Instead, write it as a regular function *without* the `use` prefix. For example, `useSorted` below doesn't call Hooks, so call it `getSorted` instead:

```js
// 🔴 Avoid: A Hook that doesn't use Hooks
function useSorted(items) {
  return items.slice().sort();
}

// ✅ Good: A regular function that doesn't use Hooks
function getSorted(items) {
  return items.slice().sort();
}
```

This ensures that your code can call this regular function anywhere, including conditions:

```js
function List({ items, shouldSort }) {
  let displayedItems = items;
  if (shouldSort) {
    // ✅ It's ok to call getSorted() conditionally because it's not a Hook
    displayedItems = getSorted(items);
  }
  // ...
}
```

You should give `use` prefix to a function (and thus make it a Hook) if it uses at least one Hook inside of it:

```js
// ✅ Good: A Hook that uses other Hooks
function useAuth() {
  return useContext(Auth);
}
```

Technically, this isn't enforced by React. In principle, you could make a Hook that doesn't call other Hooks. This is often confusing and limiting so it's best to avoid that pattern. However, there may be rare cases where it is helpful. For example, maybe your function doesn't use any Hooks right now, but you plan to add some Hook calls to it in the future. Then it makes sense to name it with the `use` prefix:

```js
// ✅ Good: A Hook that will likely use some other Hooks later
function useAuth() {
  // TODO: Replace with this line when authentication is implemented:
  // return useContext(Auth);
  return TEST_USER;
}
```

Then components won't be able to call it conditionally. This will become important when you actually add Hook calls inside. If you don't plan to use Hooks inside it (now or later), don't make it a Hook.

#### Custom Hooks let you share stateful logic, not state itself

In the earlier example, when you turned the network on and off, both components updated together. However, it's wrong to think that a single `isOnline` state variable is shared between them. Look at this code:

```js
function StatusBar() {
  const isOnline = useOnlineStatus();
  // ...
}

function SaveButton() {
  const isOnline = useOnlineStatus();
  // ...
}
```

It works the same way as before you extracted the duplication:

```js
function StatusBar() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    // ...
  }, []);
  // ...
}

function SaveButton() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    // ...
  }, []);
  // ...
}
```

These are two completely independent state variables and Effects! They happened to have the same value at the same time because you synchronized them with the same external value (whether the network is on).

To better illustrate this, we'll need a different example. Consider this `Form` component:

```js
import { useState } from 'react';

export default function Form() {
  const [firstName, setFirstName] = useState('Mary');
  const [lastName, setLastName] = useState('Poppins');

  function handleFirstNameChange(e) {
    setFirstName(e.target.value);
  }

  function handleLastNameChange(e) {
    setLastName(e.target.value);
  }

  return (
    <>
      <label>
        First name:
        <input value={firstName} onChange={handleFirstNameChange} />
      </label>
      <label>
        Last name:
        <input value={lastName} onChange={handleLastNameChange} />
      </label>
      <p><b>Good morning, {firstName} {lastName}.</b></p>
    </>
  );
}
```

```css
label { display: block; }
input { margin-left: 10px; }
```

There's some repetitive logic for each form field:

1. There's a piece of state (`firstName` and `lastName`).
1. There's a change handler (`handleFirstNameChange` and `handleLastNameChange`).
1. There's a piece of JSX that specifies the `value` and `onChange` attributes for that input.

You can extract the repetitive logic into this `useFormInput` custom Hook:

```js
import { useFormInput } from './useFormInput.js';

export default function Form() {
  const firstNameProps = useFormInput('Mary');
  const lastNameProps = useFormInput('Poppins');

  return (
    <>
      <label>
        First name:
        <input {...firstNameProps} />
      </label>
      <label>
        Last name:
        <input {...lastNameProps} />
      </label>
      <p><b>Good morning, {firstNameProps.value} {lastNameProps.value}.</b></p>
    </>
  );
}
```

```js
import { useState } from 'react';

export function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);

  function handleChange(e) {
    setValue(e.target.value);
  }

  const inputProps = {
    value: value,
    onChange: handleChange
  };

  return inputProps;
}
```

```css
label { display: block; }
input { margin-left: 10px; }
```

Notice that it only declares *one* state variable called `value`.

However, the `Form` component calls `useFormInput` *two times:*

```js
function Form() {
  const firstNameProps = useFormInput('Mary');
  const lastNameProps = useFormInput('Poppins');
  // ...
```

This is why it works like declaring two separate state variables!

**Custom Hooks let you share *stateful logic* but not *state itself.* Each call to a Hook is completely independent from every other call to the same Hook.** This is why the two sandboxes above are completely equivalent. If you'd like, scroll back up and compare them. The behavior before and after extracting a custom Hook is identical.

When you need to share the state itself between multiple components, [lift it up and pass it down](https://react.dev/learn/sharing-state-between-components) instead.

### Passing reactive values between Hooks

The code inside your custom Hooks will re-run during every re-render of your component. This is why, like components, custom Hooks [need to be pure.](https://react.dev/learn/keeping-components-pure) Think of custom Hooks' code as part of your component's body!

Because custom Hooks re-render together with your component, they always receive the latest props and state. To see what this means, consider this chat room example. Change the server URL or the chat room:

```js
import { useState } from 'react';
import ChatRoom from './ChatRoom.js';

export default function App() {
  const [roomId, setRoomId] = useState('general');
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <hr />
      <ChatRoom
        roomId={roomId}
      />
    </>
  );
}
```

```js
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';
import { showNotification } from './notifications.js';

export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId
    };
    const connection = createConnection(options);
    connection.on('message', (msg) => {
      showNotification('New message: ' + msg);
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, serverUrl]);

  return (
    <>
      <label>
        Server URL:
        <input value={serverUrl} onChange={e => setServerUrl(e.target.value)} />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}
```

```js
export function createConnection({ serverUrl, roomId }) {
  // A real implementation would actually connect to the server
  if (typeof serverUrl !== 'string') {
    throw Error('Expected serverUrl to be a string. Received: ' + serverUrl);
  }
  if (typeof roomId !== 'string') {
    throw Error('Expected roomId to be a string. Received: ' + roomId);
  }
  let intervalId;
  let messageCallback;
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (messageCallback) {
          if (Math.random() > 0.5) {
            messageCallback('hey')
          } else {
            messageCallback('lol');
          }
        }
      }, 3000);
    },
    disconnect() {
      clearInterval(intervalId);
      messageCallback = null;
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl + '');
    },
    on(event, callback) {
      if (messageCallback) {
        throw Error('Cannot add the handler twice.');
      }
      if (event !== 'message') {
        throw Error('Only "message" event is supported.');
      }
      messageCallback = callback;
    },
  };
}
```

```js
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export function showNotification(message, theme = 'dark') {
  Toastify({
    text: message,
    duration: 2000,
    gravity: 'top',
    position: 'right',
    style: {
      background: theme === 'dark' ? 'black' : 'white',
      color: theme === 'dark' ? 'white' : 'black',
    },
  }).showToast();
}
```

```json
{
  "dependencies": {
    "react": "latest",
    "react-dom": "latest",
    "react-scripts": "latest",
    "toastify-js": "1.12.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}
```

```css
input { display: block; margin-bottom: 20px; }
button { margin-left: 10px; }
```

When you change `serverUrl` or `roomId`, the Effect ["reacts" to your changes](https://react.dev/learn/lifecycle-of-reactive-effects#effects-react-to-reactive-values) and re-synchronizes. You can tell by the console messages that the chat re-connects every time that you change your Effect's dependencies.

Now move the Effect's code into a custom Hook:

```js
export function useChatRoom({ serverUrl, roomId }) {
  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId
    };
    const connection = createConnection(options);
    connection.connect();
    connection.on('message', (msg) => {
      showNotification('New message: ' + msg);
    });
    return () => connection.disconnect();
  }, [roomId, serverUrl]);
}
```

This lets your `ChatRoom` component call your custom Hook without worrying about how it works inside:

```js
export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl
  });

  return (
    <>
      <label>
        Server URL:
        <input value={serverUrl} onChange={e => setServerUrl(e.target.value)} />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}
```

This looks much simpler! (But it does the same thing.)

Notice that the logic *still responds* to prop and state changes. Try editing the server URL or the selected room:

```js
import { useState } from 'react';
import ChatRoom from './ChatRoom.js';

export default function App() {
  const [roomId, setRoomId] = useState('general');
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <hr />
      <ChatRoom
        roomId={roomId}
      />
    </>
  );
}
```

```js
import { useState } from 'react';
import { useChatRoom } from './useChatRoom.js';

export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl
  });

  return (
    <>
      <label>
        Server URL:
        <input value={serverUrl} onChange={e => setServerUrl(e.target.value)} />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}
```

```js
import { useEffect } from 'react';
import { createConnection } from './chat.js';
import { showNotification } from './notifications.js';

export function useChatRoom({ serverUrl, roomId }) {
  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId
    };
    const connection = createConnection(options);
    connection.connect();
    connection.on('message', (msg) => {
      showNotification('New message: ' + msg);
    });
    return () => connection.disconnect();
  }, [roomId, serverUrl]);
}
```

```js
export function createConnection({ serverUrl, roomId }) {
  // A real implementation would actually connect to the server
  if (typeof serverUrl !== 'string') {
    throw Error('Expected serverUrl to be a string. Received: ' + serverUrl);
  }
  if (typeof roomId !== 'string') {
    throw Error('Expected roomId to be a string. Received: ' + roomId);
  }
  let intervalId;
  let messageCallback;
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (messageCallback) {
          if (Math.random() > 0.5) {
            messageCallback('hey')
          } else {
            messageCallback('lol');
          }
        }
      }, 3000);
    },
    disconnect() {
      clearInterval(intervalId);
      messageCallback = null;
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl + '');
    },
    on(event, callback) {
      if (messageCallback) {
        throw Error('Cannot add the handler twice.');
      }
      if (event !== 'message') {
        throw Error('Only "message" event is supported.');
      }
      messageCallback = callback;
    },
  };
}
```

```js
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export function showNotification(message, theme = 'dark') {
  Toastify({
    text: message,
    duration: 2000,
    gravity: 'top',
    position: 'right',
    style: {
      background: theme === 'dark' ? 'black' : 'white',
      color: theme === 'dark' ? 'white' : 'black',
    },
  }).showToast();
}
```

```json
{
  "dependencies": {
    "react": "latest",
    "react-dom": "latest",
    "react-scripts": "latest",
    "toastify-js": "1.12.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}
```

```css
input { display: block; margin-bottom: 20px; }
button { margin-left: 10px; }
```

Notice how you're taking the return value of one Hook:

```js
export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl
  });
  // ...
```

and passing it as an input to another Hook:

```js
export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl
  });
  // ...
```

Every time your `ChatRoom` component re-renders, it passes the latest `roomId` and `serverUrl` to your Hook. This is why your Effect re-connects to the chat whenever their values are different after a re-render. (If you ever worked with audio or video processing software, chaining Hooks like this might remind you of chaining visual or audio effects. It's as if the output of `useState` "feeds into" the input of the `useChatRoom`.)

#### Passing event handlers to custom Hooks

As you start using `useChatRoom` in more components, you might want to let components customize its behavior. For example, currently, the logic for what to do when a message arrives is hardcoded inside the Hook:

```js
export function useChatRoom({ serverUrl, roomId }) {
  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId
    };
    const connection = createConnection(options);
    connection.connect();
    connection.on('message', (msg) => {
      showNotification('New message: ' + msg);
    });
    return () => connection.disconnect();
  }, [roomId, serverUrl]);
}
```

Let's say you want to move this logic back to your component:

```js
export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl,
    onReceiveMessage(msg) {
      showNotification('New message: ' + msg);
    }
  });
  // ...
```

To make this work, change your custom Hook to take `onReceiveMessage` as one of its named options:

```js
export function useChatRoom({ serverUrl, roomId, onReceiveMessage }) {
  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId
    };
    const connection = createConnection(options);
    connection.connect();
    connection.on('message', (msg) => {
      onReceiveMessage(msg);
    });
    return () => connection.disconnect();
  }, [roomId, serverUrl, onReceiveMessage]); // ✅ All dependencies declared
}
```

This will work, but there's one more improvement you can do when your custom Hook accepts event handlers.

Adding a dependency on `onReceiveMessage` is not ideal because it will cause the chat to re-connect every time the component re-renders. [Wrap this event handler into an Effect Event to remove it from the dependencies:](https://react.dev/learn/removing-effect-dependencies#wrapping-an-event-handler-from-the-props)

```js
import { useEffect, useEffectEvent } from 'react';
// ...

export function useChatRoom({ serverUrl, roomId, onReceiveMessage }) {
  const onMessage = useEffectEvent(onReceiveMessage);

  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId
    };
    const connection = createConnection(options);
    connection.connect();
    connection.on('message', (msg) => {
      onMessage(msg);
    });
    return () => connection.disconnect();
  }, [roomId, serverUrl]); // ✅ All dependencies declared
}
```

Now the chat won't re-connect every time that the `ChatRoom` component re-renders. Here is a fully working demo of passing an event handler to a custom Hook that you can play with:

```js
import { useState } from 'react';
import ChatRoom from './ChatRoom.js';

export default function App() {
  const [roomId, setRoomId] = useState('general');
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <hr />
      <ChatRoom
        roomId={roomId}
      />
    </>
  );
}
```

```js
import { useState } from 'react';
import { useChatRoom } from './useChatRoom.js';
import { showNotification } from './notifications.js';

export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl,
    onReceiveMessage(msg) {
      showNotification('New message: ' + msg);
    }
  });

  return (
    <>
      <label>
        Server URL:
        <input value={serverUrl} onChange={e => setServerUrl(e.target.value)} />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}
```

```js
import { useEffect } from 'react';
import { useEffectEvent } from 'react';
import { createConnection } from './chat.js';

export function useChatRoom({ serverUrl, roomId, onReceiveMessage }) {
  const onMessage = useEffectEvent(onReceiveMessage);

  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId
    };
    const connection = createConnection(options);
    connection.connect();
    connection.on('message', (msg) => {
      onMessage(msg);
    });
    return () => connection.disconnect();
  }, [roomId, serverUrl]);
}
```

```js
export function createConnection({ serverUrl, roomId }) {
  // A real implementation would actually connect to the server
  if (typeof serverUrl !== 'string') {
    throw Error('Expected serverUrl to be a string. Received: ' + serverUrl);
  }
  if (typeof roomId !== 'string') {
    throw Error('Expected roomId to be a string. Received: ' + roomId);
  }
  let intervalId;
  let messageCallback;
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (messageCallback) {
          if (Math.random() > 0.5) {
            messageCallback('hey')
          } else {
            messageCallback('lol');
          }
        }
      }, 3000);
    },
    disconnect() {
      clearInterval(intervalId);
      messageCallback = null;
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl + '');
    },
    on(event, callback) {
      if (messageCallback) {
        throw Error('Cannot add the handler twice.');
      }
      if (event !== 'message') {
        throw Error('Only "message" event is supported.');
      }
      messageCallback = callback;
    },
  };
}
```

```js
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export function showNotification(message, theme = 'dark') {
  Toastify({
    text: message,
    duration: 2000,
    gravity: 'top',
    position: 'right',
    style: {
      background: theme === 'dark' ? 'black' : 'white',
      color: theme === 'dark' ? 'white' : 'black',
    },
  }).showToast();
}
```

```json
{
  "dependencies": {
    "react": "latest",
    "react-dom": "latest",
    "react-scripts": "latest",
    "toastify-js": "1.12.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}
```

```css
input { display: block; margin-bottom: 20px; }
button { margin-left: 10px; }
```

Notice how you no longer need to know *how* `useChatRoom` works in order to use it. You could add it to any other component, pass any other options, and it would work the same way. That's the power of custom Hooks.

### When to use custom Hooks

You don't need to extract a custom Hook for every little duplicated bit of code. Some duplication is fine. For example, extracting a `useFormInput` Hook to wrap a single `useState` call like earlier is probably unnecessary.

However, whenever you write an Effect, consider whether it would be clearer to also wrap it in a custom Hook. [You shouldn't need Effects very often,](https://react.dev/learn/you-might-not-need-an-effect) so if you're writing one, it means that you need to "step outside React" to synchronize with some external system or to do something that React doesn't have a built-in API for. Wrapping it into a custom Hook lets you precisely communicate your intent and how the data flows through it.

For example, consider a `ShippingForm` component that displays two dropdowns: one shows the list of cities, and another shows the list of areas in the selected city. You might start with some code that looks like this:

```js
function ShippingForm({ country }) {
  const [cities, setCities] = useState(null);
  // This Effect fetches cities for a country
  useEffect(() => {
    let ignore = false;
    fetch(`/api/cities?country=${country}`)
      .then(response => response.json())
      .then(json => {
        if (!ignore) {
          setCities(json);
        }
      });
    return () => {
      ignore = true;
    };
  }, [country]);

  const [city, setCity] = useState(null);
  const [areas, setAreas] = useState(null);
  // This Effect fetches areas for the selected city
  useEffect(() => {
    if (city) {
      let ignore = false;
      fetch(`/api/areas?city=${city}`)
        .then(response => response.json())
        .then(json => {
          if (!ignore) {
            setAreas(json);
          }
        });
      return () => {
        ignore = true;
      };
    }
  }, [city]);

  // ...
```

Although this code is quite repetitive, [it's correct to keep these Effects separate from each other.](https://react.dev/learn/removing-effect-dependencies#is-your-effect-doing-several-unrelated-things) They synchronize two different things, so you shouldn't merge them into one Effect. Instead, you can simplify the `ShippingForm` component above by extracting the common logic between them into your own `useData` Hook:

```js
function useData(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (url) {
      let ignore = false;
      fetch(url)
        .then(response => response.json())
        .then(json => {
          if (!ignore) {
            setData(json);
          }
        });
      return () => {
        ignore = true;
      };
    }
  }, [url]);
  return data;
}
```

Now you can replace both Effects in the `ShippingForm` components with calls to `useData`:

```js
function ShippingForm({ country }) {
  const cities = useData(`/api/cities?country=${country}`);
  const [city, setCity] = useState(null);
  const areas = useData(city ? `/api/areas?city=${city}` : null);
  // ...
```

Extracting a custom Hook makes the data flow explicit. You feed the `url` in and you get the `data` out. By "hiding" your Effect inside `useData`, you also prevent someone working on the `ShippingForm` component from adding [unnecessary dependencies](https://react.dev/learn/removing-effect-dependencies) to it. With time, most of your app's Effects will be in custom Hooks.

##### Keep your custom Hooks focused on concrete high-level use cases

Start by choosing your custom Hook's name. If you struggle to pick a clear name, it might mean that your Effect is too coupled to the rest of your component's logic, and is not yet ready to be extracted.

Ideally, your custom Hook's name should be clear enough that even a person who doesn't write code often could have a good guess about what your custom Hook does, what it takes, and what it returns:

* ✅ `useData(url)`
* ✅ `useImpressionLog(eventName, extraData)`
* ✅ `useChatRoom(options)`

When you synchronize with an external system, your custom Hook name may be more technical and use jargon specific to that system. It's good as long as it would be clear to a person familiar with that system:

* ✅ `useMediaQuery(query)`
* ✅ `useSocket(url)`
* ✅ `useIntersectionObserver(ref, options)`

**Keep custom Hooks focused on concrete high-level use cases.** Avoid creating and using custom "lifecycle" Hooks that act as alternatives and convenience wrappers for the `useEffect` API itself:

* 🔴 `useMount(fn)`
* 🔴 `useEffectOnce(fn)`
* 🔴 `useUpdateEffect(fn)`

For example, this `useMount` Hook tries to ensure some code only runs "on mount":

```js
function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  // 🔴 Avoid: using custom "lifecycle" Hooks
  useMount(() => {
    const connection = createConnection({ roomId, serverUrl });
    connection.connect();

    post('/analytics/event', { eventName: 'visit_chat' });
  });
  // ...
}

// 🔴 Avoid: creating custom "lifecycle" Hooks
function useMount(fn) {
  useEffect(() => {
    fn();
  }, []); // 🔴 React Hook useEffect has a missing dependency: 'fn'
}
```

**Custom "lifecycle" Hooks like `useMount` don't fit well into the React paradigm.** For example, this code example has a mistake (it doesn't "react" to `roomId` or `serverUrl` changes), but the linter won't warn you about it because the linter only checks direct `useEffect` calls. It won't know about your Hook.

If you're writing an Effect, start by using the React API directly:

```js
function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  // ✅ Good: two raw Effects separated by purpose

  useEffect(() => {
    const connection = createConnection({ serverUrl, roomId });
    connection.connect();
    return () => connection.disconnect();
  }, [serverUrl, roomId]);

  useEffect(() => {
    post('/analytics/event', { eventName: 'visit_chat', roomId });
  }, [roomId]);

  // ...
}
```

Then, you can (but don't have to) extract custom Hooks for different high-level use cases:

```js
function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  // ✅ Great: custom Hooks named after their purpose
  useChatRoom({ serverUrl, roomId });
  useImpressionLog('visit_chat', { roomId });
  // ...
}
```

**A good custom Hook makes the calling code more declarative by constraining what it does.** For example, `useChatRoom(options)` can only connect to the chat room, while `useImpressionLog(eventName, extraData)` can only send an impression log to the analytics. If your custom Hook API doesn't constrain the use cases and is very abstract, in the long run it's likely to introduce more problems than it solves.

#### Custom Hooks help you migrate to better patterns

Effects are an ["escape hatch"](https://react.dev/learn/escape-hatches): you use them when you need to "step outside React" and when there is no better built-in solution for your use case. With time, the React team's goal is to reduce the number of the Effects in your app to the minimum by providing more specific solutions to more specific problems. Wrapping your Effects in custom Hooks makes it easier to upgrade your code when these solutions become available.

Let's return to this example:

```js
import { useOnlineStatus } from './useOnlineStatus.js';

function StatusBar() {
  const isOnline = useOnlineStatus();
  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;
}

function SaveButton() {
  const isOnline = useOnlineStatus();

  function handleSaveClick() {
    console.log('✅ Progress saved');
  }

  return (
    <button disabled={!isOnline} onClick={handleSaveClick}>
      {isOnline ? 'Save progress' : 'Reconnecting...'}
    </button>
  );
}

export default function App() {
  return (
    <>
      <SaveButton />
      <StatusBar />
    </>
  );
}
```

```js
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
}
```

In the above example, `useOnlineStatus` is implemented with a pair of [`useState`](https://react.dev/reference/react/useState) and [`useEffect`.](https://react.dev/reference/react/useEffect) However, this isn't the best possible solution. There is a number of edge cases it doesn't consider. For example, it assumes that when the component mounts, `isOnline` is already `true`, but this may be wrong if the network already went offline. You can use the browser [`navigator.onLine`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine) API to check for that, but using it directly would not work on the server for generating the initial HTML. In short, this code could be improved.

React includes a dedicated API called [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) which takes care of all of these problems for you. Here is your `useOnlineStatus` Hook, rewritten to take advantage of this new API:

```js
import { useOnlineStatus } from './useOnlineStatus.js';

function StatusBar() {
  const isOnline = useOnlineStatus();
  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;
}

function SaveButton() {
  const isOnline = useOnlineStatus();

  function handleSaveClick() {
    console.log('✅ Progress saved');
  }

  return (
    <button disabled={!isOnline} onClick={handleSaveClick}>
      {isOnline ? 'Save progress' : 'Reconnecting...'}
    </button>
  );
}

export default function App() {
  return (
    <>
      <SaveButton />
      <StatusBar />
    </>
  );
}
```

```js
import { useSyncExternalStore } from 'react';

function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine, // How to get the value on the client
    () => true // How to get the value on the server
  );
}

```

Notice how **you didn't need to change any of the components** to make this migration:

```js
function StatusBar() {
  const isOnline = useOnlineStatus();
  // ...
}

function SaveButton() {
  const isOnline = useOnlineStatus();
  // ...
}
```

This is another reason for why wrapping Effects in custom Hooks is often beneficial:

1. You make the data flow to and from your Effects very explicit.
2. You let your components focus on the intent rather than on the exact implementation of your Effects.
3. When React adds new features, you can remove those Effects without changing any of your components.

Similar to a [design system,](https://uxdesign.cc/everything-you-need-to-know-about-design-systems-54b109851969) you might find it helpful to start extracting common idioms from your app's components into custom Hooks. This will keep your components' code focused on the intent, and let you avoid writing raw Effects very often. Many excellent custom Hooks are maintained by the React community.

##### Will React provide any built-in solution for data fetching?

Today, with the [`use`](https://react.dev/reference/react/use#streaming-data-from-server-to-client) API, data can be read in render by passing a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to `use`:

```js
import { use, Suspense } from "react";

function Message({ messagePromise }) {
  const messageContent = use(messagePromise);
  return <p>Here is the message: {messageContent}</p>;
}

export function MessageContainer({ messagePromise }) {
  return (
    <Suspense fallback={<p>⌛Downloading message...</p>}>
      <Message messagePromise={messagePromise} />
    </Suspense>
  );
}
```

We're still working out the details, but we expect that in the future, you'll write data fetching like this:

```js
import { use } from 'react';

function ShippingForm({ country }) {
  const cities = use(fetch(`/api/cities?country=${country}`));
  const [city, setCity] = useState(null);
  const areas = city ? use(fetch(`/api/areas?city=${city}`)) : null;
  // ...
```

If you use custom Hooks like `useData` above in your app, it will require fewer changes to migrate to the eventually recommended approach than if you write raw Effects in every component manually. However, the old approach will still work fine, so if you feel happy writing raw Effects, you can continue to do that.

#### There is more than one way to do it

Let's say you want to implement a fade-in animation *from scratch* using the browser [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) API. You might start with an Effect that sets up an animation loop. During each frame of the animation, you could change the opacity of the DOM node you [hold in a ref](https://react.dev/learn/manipulating-the-dom-with-refs) until it reaches `1`. Your code might start like this:

```js
import { useState, useEffect, useRef } from 'react';

function Welcome() {
  const ref = useRef(null);

  useEffect(() => {
    const duration = 1000;
    const node = ref.current;

    let startTime = performance.now();
    let frameId = null;

    function onFrame(now) {
      const timePassed = now - startTime;
      const progress = Math.min(timePassed / duration, 1);
      onProgress(progress);
      if (progress < 1) {
        // We still have more frames to paint
        frameId = requestAnimationFrame(onFrame);
      }
    }

    function onProgress(progress) {
      node.style.opacity = progress;
    }

    function start() {
      onProgress(0);
      startTime = performance.now();
      frameId = requestAnimationFrame(onFrame);
    }

    function stop() {
      cancelAnimationFrame(frameId);
      startTime = null;
      frameId = null;
    }

    start();
    return () => stop();
  }, []);

  return (
    <h1 className="welcome" ref={ref}>
      Welcome
    </h1>
  );
}

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(!show)}>
        {show ? 'Remove' : 'Show'}
      </button>
      <hr />
      {show && <Welcome />}
    </>
  );
}
```

```css
label, button { display: block; margin-bottom: 20px; }
html, body { min-height: 300px; }
.welcome {
  opacity: 0;
  color: white;
  padding: 50px;
  text-align: center;
  font-size: 50px;
  background-image: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%);
}
```

To make the component more readable, you might extract the logic into a `useFadeIn` custom Hook:

```js
import { useState, useEffect, useRef } from 'react';
import { useFadeIn } from './useFadeIn.js';

function Welcome() {
  const ref = useRef(null);

  useFadeIn(ref, 1000);

  return (
    <h1 className="welcome" ref={ref}>
      Welcome
    </h1>
  );
}

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(!show)}>
        {show ? 'Remove' : 'Show'}
      </button>
      <hr />
      {show && <Welcome />}
    </>
  );
}
```

```js
import { useEffect } from 'react';

export function useFadeIn(ref, duration) {
  useEffect(() => {
    const node = ref.current;

    let startTime = performance.now();
    let frameId = null;

    function onFrame(now) {
      const timePassed = now - startTime;
      const progress = Math.min(timePassed / duration, 1);
      onProgress(progress);
      if (progress < 1) {
        // We still have more frames to paint
        frameId = requestAnimationFrame(onFrame);
      }
    }

    function onProgress(progress) {
      node.style.opacity = progress;
    }

    function start() {
      onProgress(0);
      startTime = performance.now();
      frameId = requestAnimationFrame(onFrame);
    }

    function stop() {
      cancelAnimationFrame(frameId);
      startTime = null;
      frameId = null;
    }

    start();
    return () => stop();
  }, [ref, duration]);
}
```

```css
label, button { display: block; margin-bottom: 20px; }
html, body { min-height: 300px; }
.welcome {
  opacity: 0;
  color: white;
  padding: 50px;
  text-align: center;
  font-size: 50px;
  background-image: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%);
}
```

You could keep the `useFadeIn` code as is, but you could also refactor it more. For example, you could extract the logic for setting up the animation loop out of `useFadeIn` into a custom `useAnimationLoop` Hook:

```js
import { useState, useEffect, useRef } from 'react';
import { useFadeIn } from './useFadeIn.js';

function Welcome() {
  const ref = useRef(null);

  useFadeIn(ref, 1000);

  return (
    <h1 className="welcome" ref={ref}>
      Welcome
    </h1>
  );
}

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(!show)}>
        {show ? 'Remove' : 'Show'}
      </button>
      <hr />
      {show && <Welcome />}
    </>
  );
}
```

```js
import { useState, useEffect } from 'react';
import { useEffectEvent } from 'react';

export function useFadeIn(ref, duration) {
  const [isRunning, setIsRunning] = useState(true);

  useAnimationLoop(isRunning, (timePassed) => {
    const progress = Math.min(timePassed / duration, 1);
    ref.current.style.opacity = progress;
    if (progress === 1) {
      setIsRunning(false);
    }
  });
}

function useAnimationLoop(isRunning, drawFrame) {
  const onFrame = useEffectEvent(drawFrame);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const startTime = performance.now();
    let frameId = null;

    function tick(now) {
      const timePassed = now - startTime;
      onFrame(timePassed);
      frameId = requestAnimationFrame(tick);
    }

    tick();
    return () => cancelAnimationFrame(frameId);
  }, [isRunning]);
}
```

```css
label, button { display: block; margin-bottom: 20px; }
html, body { min-height: 300px; }
.welcome {
  opacity: 0;
  color: white;
  padding: 50px;
  text-align: center;
  font-size: 50px;
  background-image: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%);
}
```

However, you didn't *have to* do that. As with regular functions, ultimately you decide where to draw the boundaries between different parts of your code. You could also take a very different approach. Instead of keeping the logic in the Effect, you could move most of the imperative logic inside a JavaScript [class:](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)

```js
import { useState, useEffect, useRef } from 'react';
import { useFadeIn } from './useFadeIn.js';

function Welcome() {
  const ref = useRef(null);

  useFadeIn(ref, 1000);

  return (
    <h1 className="welcome" ref={ref}>
      Welcome
    </h1>
  );
}

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(!show)}>
        {show ? 'Remove' : 'Show'}
      </button>
      <hr />
      {show && <Welcome />}
    </>
  );
}
```

```js
import { useState, useEffect } from 'react';
import { FadeInAnimation } from './animation.js';

export function useFadeIn(ref, duration) {
  useEffect(() => {
    const animation = new FadeInAnimation(ref.current);
    animation.start(duration);
    return () => {
      animation.stop();
    };
  }, [ref, duration]);
}
```

```js
export class FadeInAnimation {
  constructor(node) {
    this.node = node;
  }
  start(duration) {
    this.duration = duration;
    this.onProgress(0);
    this.startTime = performance.now();
    this.frameId = requestAnimationFrame(() => this.onFrame());
  }
  onFrame() {
    const timePassed = performance.now() - this.startTime;
    const progress = Math.min(timePassed / this.duration, 1);
    this.onProgress(progress);
    if (progress === 1) {
      this.stop();
    } else {
      // We still have more frames to paint
      this.frameId = requestAnimationFrame(() => this.onFrame());
    }
  }
  onProgress(progress) {
    this.node.style.opacity = progress;
  }
  stop() {
    cancelAnimationFrame(this.frameId);
    this.startTime = null;
    this.frameId = null;
    this.duration = 0;
  }
}
```

```css
label, button { display: block; margin-bottom: 20px; }
html, body { min-height: 300px; }
.welcome {
  opacity: 0;
  color: white;
  padding: 50px;
  text-align: center;
  font-size: 50px;
  background-image: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%);
}
```

Effects let you connect React to external systems. The more coordination between Effects is needed (for example, to chain multiple animations), the more it makes sense to extract that logic out of Effects and Hooks *completely* like in the sandbox above. Then, the code you extracted *becomes* the "external system". This lets your Effects stay simple because they only need to send messages to the system you've moved outside React.

The examples above assume that the fade-in logic needs to be written in JavaScript. However, this particular fade-in animation is both simpler and much more efficient to implement with a plain [CSS Animation:](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations)

```js
import { useState, useEffect, useRef } from 'react';
import './welcome.css';

function Welcome() {
  return (
    <h1 className="welcome">
      Welcome
    </h1>
  );
}

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(!show)}>
        {show ? 'Remove' : 'Show'}
      </button>
      <hr />
      {show && <Welcome />}
    </>
  );
}
```

```css
label, button { display: block; margin-bottom: 20px; }
html, body { min-height: 300px; }
```

```css
.welcome {
  color: white;
  padding: 50px;
  text-align: center;
  font-size: 50px;
  background-image: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%);

  animation: fadeIn 1000ms;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

```

Sometimes, you don't even need a Hook!

- Custom Hooks let you share logic between components.
- Custom Hooks must be named starting with `use` followed by a capital letter.
- Custom Hooks only share stateful logic, not state itself.
- You can pass reactive values from one Hook to another, and they stay up-to-date.
- All Hooks re-run every time your component re-renders.
- The code of your custom Hooks should be pure, like your component's code.
- Wrap event handlers received by custom Hooks into Effect Events.
- Don't create custom Hooks like `useMount`. Keep their purpose specific.
- It's up to you how and where to choose the boundaries of your code.
