---
title: "Tailwind CSS"
order: 10
summary: "Utility-first styling with Tailwind CSS v4: setup, utilities, responsive and state variants, dark mode, theme tokens, custom styles, components and production habits."
category: "Tailwind CSS"
level: Beginner
---

# Tailwind CSS

Tailwind CSS styles an interface with small, single-purpose classes written straight in the markup, so you rarely write a stylesheet by hand. This module covers Tailwind v4, the version that moved configuration from JavaScript into CSS.

> **Note:** Tailwind's own documentation isn't released under an open license, so this module is written for Atlas CE from scratch. Each topic links to the matching page of the [official docs](https://tailwindcss.com/docs).

## Fundamentals

### The problem

On a large project, CSS goes wrong in predictable ways. Every new component gets a new class name and a new block of rules. Nobody dares delete old rules because they can't tell what uses them, so the stylesheet only grows. Design values drift, giving you twelve shades of grey and seventeen margins. Adam Wathan's answer, Tailwind CSS (2017), was to stop writing custom CSS per component and compose from a fixed set of small classes instead.

### Goals

- **Style without leaving the markup**, and without inventing names for things that don't need them.
- **Constrain choices to a design system.** Spacing, colors and type sizes come from a scale, so interfaces stay consistent by default.
- **Ship only what's used.** The build scans your files and generates CSS just for the classes you wrote, so the stylesheet stays small however big the app gets.
- **Make change safe.** Deleting markup deletes its styles, and editing one element can't break another.

### The ideas everything else rests on

- **Utility classes:** each class sets one property to one value from the scale (`p-4`, `text-sm`, `bg-slate-900`).
- **Variants as prefixes:** state and context are written into the class name, such as `hover:`, `focus:`, `md:` and `dark:`. Responsive design is mobile-first.
- **The theme is the source of truth.** In v4 it is defined in CSS with `@theme`, and every utility and CSS variable derives from it.
- **Reuse through components, not classes.** Repetition is handled by a React, Vue or Blade component, or a loop, not by `@apply`-ing utilities into new class names.

### Trade-offs

Markup gets long and looks noisy until you're used to reading it. You still need to know CSS, because Tailwind is CSS with shorter names, not a replacement. Tooling (editor autocomplete, class sorting) matters more than with plain CSS. Some one-off styles are clearer as arbitrary values (`top-[117px]`) or a few lines of real CSS.

## Utility-First Styling

> **Official docs:** [Styling with utility classes](https://tailwindcss.com/docs/styling-with-utility-classes)

Traditional CSS gives each component a class name and styles it in a separate file. Tailwind flips that: each class does one thing, and you compose them in the markup.

```html
<!-- Traditional: name it, then style it elsewhere -->
<div class="card">…</div>

<!-- Utility-first: the styles are the classes -->
<div class="rounded-lg bg-white p-6 shadow-md">
  <h2 class="text-lg font-semibold text-gray-900">Invoice #1042</h2>
  <p class="mt-2 text-sm text-gray-600">Due in 14 days</p>
</div>
```

Why teams adopt it:

- **No naming.** You don't invent `.card-header-title--large`; you write what it looks like.
- **Local changes stay local.** Editing one element's classes can't break another page, because nothing is shared by name.
- **The CSS stops growing.** Tailwind only generates the utilities you actually use, so the stylesheet stays small no matter how big the app gets.
- **A design system for free.** Spacing, colors and type sizes come from one scale, so values stay consistent (`p-4`, `p-6`, never `padding: 13px`).

The cost is longer class lists. When the same combination repeats, extract a component (see [Reusing Styles](/languages/tailwind/reusing-styles)) rather than a CSS class.

## Installation

> **Official docs:** [Installation](https://tailwindcss.com/docs/installation)

Tailwind v4 is a build step that scans your files for class names and writes the CSS for them. With Vite, install the package and its plugin:

```bash
npm install tailwindcss @tailwindcss/vite
```

Add the plugin to the Vite config:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

Import Tailwind in your main stylesheet. That one line replaces the `@tailwind base/components/utilities` directives of v3:

```css
/* src/style.css */
@import "tailwindcss";
```

Frameworks without Vite use the PostCSS plugin instead:

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

```js
// postcss.config.mjs
export default {
  plugins: { "@tailwindcss/postcss": {} },
};
```

There's no `tailwind.config.js` to create: v4 finds your source files automatically and reads its configuration from CSS (see [Customizing the Theme](/languages/tailwind/customizing-the-theme)).

## Core Utilities

> **Official docs:** [Padding](https://tailwindcss.com/docs/padding), [Flex](https://tailwindcss.com/docs/flex), [Font size](https://tailwindcss.com/docs/font-size)

Most utilities follow `property-value`, and numeric values come from a shared spacing scale where each step is `0.25rem` (4px):

| Utility | CSS |
| --- | --- |
| `p-4` | `padding: 1rem` |
| `px-6` | `padding-inline: 1.5rem` |
| `mt-2` | `margin-top: 0.5rem` |
| `w-64` | `width: 16rem` |
| `gap-3` | `gap: 0.75rem` |
| `text-sm` | small font size with a matching line height |
| `font-semibold` | `font-weight: 600` |
| `bg-blue-600` | blue background, shade 600 |
| `rounded-lg` | large border radius |

Layout utilities map to Flexbox and Grid:

```html
<nav class="flex items-center justify-between gap-4 px-6 py-3">
  <a class="font-bold" href="/">Acme</a>
  <ul class="flex gap-6 text-sm">
    <li><a href="/pricing">Pricing</a></li>
    <li><a href="/docs">Docs</a></li>
  </ul>
</nav>

<section class="grid grid-cols-3 gap-6">
  <article>…</article>
  <article>…</article>
  <article>…</article>
</section>
```

Colors come in shades from `50` (lightest) to `950` (darkest), and any color utility takes an opacity after a slash: `bg-black/50` is black at 50% opacity.

## Responsive Design

> **Official docs:** [Responsive design](https://tailwindcss.com/docs/responsive-design)

Tailwind is mobile-first. An unprefixed utility applies at every width; a breakpoint prefix applies from that width **up**:

| Prefix | Minimum width |
| --- | --- |
| `sm:` | 40rem (640px) |
| `md:` | 48rem (768px) |
| `lg:` | 64rem (1024px) |
| `xl:` | 80rem (1280px) |
| `2xl:` | 96rem (1536px) |

So you write the phone layout first, then add what changes on larger screens:

```html
<!-- One column on phones, two from md, three from lg -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">…</div>

<!-- Stacked on phones, side by side from sm -->
<div class="flex flex-col gap-4 sm:flex-row">…</div>

<!-- Hidden on phones, shown from md -->
<aside class="hidden md:block">…</aside>
```

A common mistake is using `sm:` to target phones. `sm:` means "640px and wider"; to style phones, use the unprefixed class. To target a range, stack a `max-*` variant: `md:max-lg:flex` applies only between `md` and `lg`.

## Hover, Focus and Other States

> **Official docs:** [Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states)

State variants work like breakpoints: prefix a utility and it applies only in that state.

```html
<button
  class="rounded-md bg-indigo-600 px-4 py-2 text-white
         hover:bg-indigo-500
         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
         active:bg-indigo-700
         disabled:cursor-not-allowed disabled:opacity-50"
>
  Save
</button>
```

Useful variants:

- `hover:`, `focus:`, `focus-visible:`, `active:`, `disabled:`
- `first:`, `last:`, `odd:`, `even:` for list items
- `invalid:`, `required:`, `placeholder:` for forms

To style a child based on its parent's state, mark the parent with `group` and use `group-hover:` on the child. `peer` does the same for siblings:

```html
<a href="#" class="group block rounded-lg p-4 hover:bg-gray-50">
  <h3 class="font-medium group-hover:text-indigo-600">Read the guide</h3>
</a>

<input type="email" class="peer" required />
<p class="hidden text-sm text-red-600 peer-invalid:block">Enter a valid email.</p>
```

Variants combine left to right: `md:hover:bg-gray-100` applies on hover, from `md` up.

## Dark Mode

> **Official docs:** [Dark mode](https://tailwindcss.com/docs/dark-mode)

The `dark:` variant applies a utility when the dark theme is active. By default that follows the operating system setting (`prefers-color-scheme`):

```html
<div class="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  <p class="text-gray-600 dark:text-gray-400">Follows the system theme.</p>
</div>
```

To let users switch themes with a toggle, redefine the variant to follow a class on `<html>` instead:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

```js
// Toggle the theme and remember the choice
document.documentElement.classList.toggle("dark");
localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
```

Set the class in an inline script in `<head>` before the page paints, so a dark-mode user doesn't see a white flash on load.

## Customizing the Theme

> **Official docs:** [Theme variables](https://tailwindcss.com/docs/theme)

In v4 the design tokens live in CSS, inside an `@theme` block. Each variable both defines a CSS custom property and creates the utilities that use it:

```css
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.62 0.19 259);
  --color-brand-600: oklch(0.55 0.2 259);
  --font-display: "Inter", sans-serif;
  --breakpoint-3xl: 120rem;
}
```

That adds `bg-brand-500`, `text-brand-600`, `font-display` and a `3xl:` breakpoint. The variables are also available to your own CSS as `var(--color-brand-500)`.

The namespace in the name decides which utilities it generates:

| Namespace | Generates |
| --- | --- |
| `--color-*` | `bg-*`, `text-*`, `border-*`, … |
| `--font-*` | `font-*` |
| `--text-*` | `text-*` sizes |
| `--spacing` | the base step of the spacing scale |
| `--breakpoint-*` | responsive variants |
| `--radius-*` | `rounded-*` |

To replace a whole namespace instead of extending it, reset it first: `--color-*: initial;` removes the default palette.

## Arbitrary Values and Custom Styles

> **Official docs:** [Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)

When a one-off value isn't on the scale, put it in square brackets:

```html
<div class="top-[117px] grid-cols-[200px_1fr] bg-[#1da1f2] text-[clamp(1rem,2vw,1.5rem)]">…</div>
```

Spaces inside a value are written as underscores. Arbitrary properties cover CSS that has no utility at all:

```html
<div class="[mask-type:luminance]">…</div>
```

If you reach for the same arbitrary value twice, add it to the theme instead.

For your own utilities, use `@utility` so they work with every variant:

```css
@utility content-auto {
  content-visibility: auto;
}
```

Now `content-auto` and `lg:content-auto` both work. Base styles for plain elements go in the `base` layer:

```css
@layer base {
  h1 {
    font-size: var(--text-2xl);
  }
}
```

## Reusing Styles

> **Official docs:** [Managing duplication](https://tailwindcss.com/docs/styling-with-utility-classes#managing-duplication)

Repeated class lists are a signal to extract something, and the right something is usually a **component**, not a CSS class:

```jsx
// React: the classes live in one place, and every button uses them
function Button({ children, ...props }) {
  return (
    <button
      className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
      {...props}
    >
      {children}
    </button>
  );
}
```

For repetition inside one file, a loop is often enough:

```jsx
{links.map((link) => (
  <a key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
    {link.label}
  </a>
))}
```

`@apply` copies utilities into a CSS rule. It's useful when you can't touch the markup, such as styling HTML from a CMS or a third-party widget:

```css
.prose-legacy a {
  @apply text-indigo-600 underline hover:text-indigo-500;
}
```

Avoid using `@apply` to recreate a classic stylesheet of `.btn` and `.card` classes. That brings back the naming and coupling that utility-first removes.

## Working with Variants Conditionally

> **Official docs:** [Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files)

Tailwind finds classes by scanning your source files as plain text, so class names must appear **whole** in the code. Building them by concatenation silently produces no CSS:

```jsx
// ✗ Tailwind never sees "bg-red-600" or "bg-green-600"
<span className={`bg-${color}-600`}>…</span>

// ✓ Map each value to a complete class name
const tone = { error: "bg-red-600", success: "bg-green-600" };
<span className={tone[status]}>…</span>
```

When classes depend on props, a small helper keeps conditionals readable. `clsx` joins the truthy ones, and `tailwind-merge` resolves conflicts so a later `p-2` overrides an earlier `p-4`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// cn("px-4 py-2", isActive && "bg-indigo-600 text-white", className)
```

## Production Checklist

> **Official docs:** [Upgrade guide](https://tailwindcss.com/docs/upgrade-guide), [Functions and directives](https://tailwindcss.com/docs/functions-and-directives)

- **Install the Prettier plugin.** `prettier-plugin-tailwindcss` sorts classes into a consistent order, so diffs stay readable and duplicates stand out.
- **Use the editor extension.** Tailwind CSS IntelliSense autocompletes classes, shows the generated CSS on hover and flags conflicts.
- **Keep tokens in `@theme`.** Brand colors and fonts belong in the theme, not repeated as arbitrary values.
- **Check accessibility.** Use `focus-visible:` styles on every interactive element, and check text and background colors for contrast in both themes.
- **Let the build trim the CSS.** Tailwind only emits classes it finds in your files; make sure the folders with your templates are inside the project so they're scanned.
- **Upgrading from v3.** Run `npx @tailwindcss/upgrade`, which moves `tailwind.config.js` into `@theme`, replaces the `@tailwind` directives and renames changed utilities.
