---
title: "Next.js"
order: 3
summary: "The App Router from the ground up: project structure, layouts and pages, server and client components, data fetching, caching, routing and deployment."
category: "Next.js"
level: Beginner
---

# Next.js

Next.js adds routing, server rendering and data fetching on top of React. This module follows the official App Router Getting Started guide, page by page.

## Installation

> **Source:** [Installation](https://nextjs.org/docs/app/getting-started/installation) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

Create a new Next.js app and run it locally.

### Quick start

1. Create a new Next.js app named `my-app`
2. `cd my-app` and start the dev server.
3. Visit `http://localhost:3000`.

```bash
pnpm create next-app@latest my-app --yes
cd my-app
pnpm dev
```

```bash
npx create-next-app@latest my-app --yes
cd my-app
npm run dev
```

```bash
yarn create next-app@latest my-app --yes
cd my-app
yarn dev
```

```bash
bun create next-app@latest my-app --yes
cd my-app
bun dev
```

- `--yes` skips prompts using saved preferences or defaults. The default setup enables TypeScript, Tailwind CSS, ESLint, App Router, and Turbopack, with import alias `@/*`, and includes `AGENTS.md` to guide coding agents to write up-to-date Next.js code.

### System requirements

Before you begin, make sure your development environment meets the following requirements:

- Minimum Node.js version: [20.9](https://nodejs.org/)
- Operating systems: macOS, Windows (including WSL), and Linux.

### Supported browsers

Next.js supports modern browsers with zero configuration.

- Chrome 111+
- Edge 111+
- Firefox 111+
- Safari 16.4+

Learn more about [browser support](https://nextjs.org/docs/architecture/supported-browsers), including how to configure polyfills and target specific browsers.

### Create with the CLI

The quickest way to create a new Next.js app is using [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), which sets up everything automatically for you. To create a project, run:

```bash
pnpm create next-app
```

```bash
npx create-next-app@latest
```

```bash
yarn create next-app
```

```bash
bun create next-app
```

On installation, you'll see the following prompts:

```txt
What is your project named? my-app
Would you like to use the recommended Next.js defaults?
    Yes, use recommended defaults - TypeScript, ESLint, No React Compiler, Tailwind CSS, No src/ directory, App Router, Cache Components, AGENTS.md
    No, reuse previous settings
    No, customize settings - Choose your own preferences
```

If you choose to `customize settings`, you'll see the following prompts:

```txt
Would you like to use TypeScript? No / Yes
Which linter would you like to use? ESLint / Biome / None
Would you like to use React Compiler? No / Yes
Would you like to use Tailwind CSS? No / Yes
Would you like your code inside a `src/` directory? No / Yes
Would you like to use App Router? (recommended) No / Yes
Would you like to use Cache Components? No / Yes
Would you like to customize the import alias (`@/*` by default)? No / Yes
What import alias would you like configured? @/*
Would you like to include AGENTS.md to guide coding agents to write up-to-date Next.js code? No / Yes
```

After the prompts, [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) will create a folder with your project name and install the required dependencies.

### Manual installation

To manually create a new Next.js app, install the required packages:

```bash
pnpm i next@latest react@latest react-dom@latest
```

```bash
npm i next@latest react@latest react-dom@latest
```

```bash
yarn add next@latest react@latest react-dom@latest
```

```bash
bun add next@latest react@latest react-dom@latest
```

> **Good to know**:
>
> - The `App Router` uses [React canary releases](https://react.dev/blog/2023/05/03/react-canaries) built-in, which include all the stable React 19 changes, as well as newer features being validated in frameworks, but you should still declare react and react-dom in package.json for tooling and ecosystem compatibility.
> - The `Pages Router` uses the React version from your `package.json`.

Then, add the following scripts to your `package.json` file:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

These scripts refer to the different stages of developing an application:

- `next dev`: Starts the development server using Turbopack (default bundler).
- `next build`: Builds the application for production.
- `next start`: Starts the production server.
- `eslint`: Runs ESLint.

Turbopack is now the default bundler. To use Webpack run `next dev --webpack` or `next build --webpack`. See the [Turbopack docs](https://nextjs.org/docs/app/api-reference/turbopack) for configuration details.

#### Create the `app` directory

Next.js uses file-system routing, which means the routes in your application are determined by how you structure your files.

Create an `app` folder. Then, inside `app`, create a `layout.tsx` file. This file is the [root layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout). It's required and must contain the `<html>` and `<body>` tags.

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

Create a home page `app/page.tsx` with some initial content:

```tsx
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}
```

Both `layout.tsx` and `page.tsx` will be rendered when the user visits the root of your application (`/`).

![App Folder Structure](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/app-getting-started.png)

> **Good to know**:
>
> - If you forget to create the root layout, Next.js will automatically create this file when running the development server with `next dev`.
> - You can optionally use a [`src` folder](https://nextjs.org/docs/app/api-reference/file-conventions/src-folder) in the root of your project to separate your application's code from configuration files.

#### Create the `public` folder (optional)

Create a [`public` folder](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder) at the root of your project to store static assets such as images, fonts, etc. Files inside `public` can then be referenced by your code starting from the base URL (`/`).

You can then reference these assets using the root path (`/`). For example, `public/profile.png` can be referenced as `/profile.png`:

```tsx
import Image from 'next/image'

export default function Page() {
  return ![Profile](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/profile.png)
}
```

### Run the development server

1. Run `npm run dev` to start the development server.
2. Visit `http://localhost:3000` to view your application.
3. Edit the `app/page.tsx` file and save it to see the updated result in your browser.

### Set up TypeScript

> Minimum TypeScript version: `v5.1.0`

Next.js comes with built-in TypeScript support. To add TypeScript to your project, rename a file to `.ts` / `.tsx` and run `next dev`. Next.js will automatically install the necessary dependencies and add a `tsconfig.json` file with the recommended config options.

#### IDE Plugin

Next.js includes a custom TypeScript plugin and type checker, which VSCode and other code editors can use for advanced type-checking and auto-completion.

You can enable the plugin in VS Code by:

1. Opening the command palette (`Ctrl/⌘` + `Shift` + `P`)
2. Searching for "TypeScript: Select TypeScript Version"
3. Selecting "Use Workspace Version"

![TypeScript Command Palette](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/typescript-command-palette.png)

See the [TypeScript reference](https://nextjs.org/docs/app/api-reference/config/typescript) page for more information.

### Set up your editor

The App Router names files by convention, like `page.tsx`, `layout.tsx`, and `route.ts`, so your editor quickly fills with same-named tabs. Label each tab with its enclosing folders, like `blog/[id]`, so you can tell them apart.

In VS Code 1.88+ or Cursor, add [custom editor labels](https://code.visualstudio.com/updates/v1_88#_customize-editor-labels) to `.vscode/settings.json`. Labeling two folders deep keeps dynamic routes like `blog/[id]/page.tsx` from all collapsing to the same `[id]` label:

```json
{
  "workbench.editor.customLabels.patterns": {
    "**/app/**/page.tsx": "${dirname(1)}/${dirname} - page.tsx",
    "**/app/**/layout.tsx": "${dirname(1)}/${dirname} - layout.tsx",
    "**/app/**/loading.tsx": "${dirname(1)}/${dirname} - loading.tsx",
    "**/app/**/error.tsx": "${dirname(1)}/${dirname} - error.tsx",
    "**/app/**/not-found.tsx": "${dirname(1)}/${dirname} - not-found.tsx",
    "**/app/**/template.tsx": "${dirname(1)}/${dirname} - template.tsx",
    "**/app/**/default.tsx": "${dirname(1)}/${dirname} - default.tsx",
    "**/app/**/route.ts": "${dirname(1)}/${dirname} - route.ts"
  }
}
```

Or copy this prompt to have your coding agent set it up:

```prompt
Set up custom editor labels so my Next.js App Router files are easy to tell apart. Read https://nextjs.org/docs/app/getting-started/installation#set-up-your-editor and add the workbench.editor.customLabels.patterns config shown there to my .vscode/settings.json, creating the file if it doesn't exist. Adjust the labels to taste. If I use a different editor, apply the equivalent setting or tell me it's automatic, and leave my other settings untouched.
```

> **Good to know:** JetBrains IDEs (WebStorm, IntelliJ) show the folder for same-named files automatically, so no setup is needed.

### Set up linting

Next.js supports linting with either ESLint or Biome. Choose a linter and run it directly via `package.json` scripts.

- Use **ESLint** (comprehensive rules):

```json
{
  "scripts": {
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

- Or use **Biome** (fast linter + formatter):

```json
{
  "scripts": {
    "lint": "biome check",
    "format": "biome format --write"
  }
}
```

If your project previously used `next lint`, migrate your scripts to the ESLint CLI with the codemod:

```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

If you use ESLint, create an explicit config (recommended `eslint.config.mjs`). ESLint supports both [the legacy `.eslintrc.*` and the newer `eslint.config.mjs` formats](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-eslint). See the [ESLint API reference](https://nextjs.org/docs/app/api-reference/config/eslint#with-core-web-vitals) for a recommended setup.

> **Good to know**: Starting with Next.js 16, `next build` no longer runs the linter automatically. Instead, you can run your linter through NPM scripts.

See the [ESLint Plugin](https://nextjs.org/docs/app/api-reference/config/eslint) page for more information.

### Set up Absolute Imports and Module Path Aliases

Next.js has in-built support for the `"paths"` and `"baseUrl"` options of `tsconfig.json` and `jsconfig.json` files.

These options allow you to alias project directories to absolute paths, making it easier and cleaner to import modules. For example:

```jsx
// Before
import { Button } from '../../../components/button'

// After
import { Button } from '@/components/button'
```

To configure absolute imports, add the `baseUrl` configuration option to your `tsconfig.json` or `jsconfig.json` file. For example:

```json
{
  "compilerOptions": {
    "baseUrl": "src/"
  }
}
```

In addition to configuring the `baseUrl` path, you can use the `"paths"` option to `"alias"` module paths.

For example, the following configuration maps `@/components/*` to `components/*`:

```json
{
  "compilerOptions": {
    "baseUrl": "src/",
    "paths": {
      "@/styles/*": ["styles/*"],
      "@/components/*": ["components/*"]
    }
  }
}
```

Each of the `"paths"` are relative to the `baseUrl` location.

### Upgrade your Next.js app

Keep your Next.js version up to date. Each release ships security patches, bug fixes, and performance optimizations alongside new features, and staying current keeps every individual upgrade small. Run the `upgrade` command:

```bash
pnpm next upgrade
```

```bash
npx next upgrade
```

```bash
yarn next upgrade
```

```bash
bunx next upgrade
```

Upgrading also updates the documentation bundled inside the `next` package at `node_modules/next/dist/docs/`. New features arrive with their docs, and existing pages pick up new guidance and pitfalls discovered along the way. [AI coding agents](https://nextjs.org/docs/app/guides/ai-agents) in your project then work from the version you have installed rather than their training data.

To have a coding agent perform and verify the upgrade, run `npx next@canary upgrade --agent=latest`. See [Upgrade with a coding agent](https://nextjs.org/docs/app/guides/upgrading/agent-upgrade) for other policies.

See [Upgrading](https://nextjs.org/docs/app/getting-started/upgrading) for version guides and manual upgrade steps, or the [preview docs](https://preview.nextjs.org) to explore features before they ship in a stable version.

## Project structure and organization

> **Source:** [Project structure and organization](https://nextjs.org/docs/app/getting-started/project-structure) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

This page provides an overview of **all** the folder and file conventions in Next.js, and recommendations for organizing your project.

### Folder and file conventions

#### Top-level folders

Top-level folders are used to organize your application's code and static assets.

![Route segments to path segments](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/top-level-folders.png)

|                                                                    |                                    |
| ------------------------------------------------------------------ | ---------------------------------- |
| [`app`](https://nextjs.org/docs/app)                                                 | App Router                         |
| [`pages`](https://nextjs.org/docs/pages/building-your-application/routing)           | Pages Router                       |
| [`public`](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder) | Static assets to be served         |
| [`src`](https://nextjs.org/docs/app/api-reference/file-conventions/src-folder)       | Optional application source folder |

#### Top-level files

Top-level files are used to configure your application, manage dependencies, run proxy, integrate monitoring tools, and define environment variables.

|                                                                              |                                                                                    |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Next.js**                                                                  |                                                                                    |
| [`next.config.js`](https://nextjs.org/docs/app/api-reference/config/next-config-js)            | Configuration file for Next.js                                                     |
| [`package.json`](https://nextjs.org/docs/app/getting-started/installation#manual-installation) | Project dependencies and scripts                                                   |
| [`instrumentation.ts`](https://nextjs.org/docs/app/guides/instrumentation)                     | OpenTelemetry and Instrumentation file                                             |
| [`proxy.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)                 | Next.js request proxy                                                              |
| [`.env`](https://nextjs.org/docs/app/guides/environment-variables)                             | Environment variables (should not be tracked by version control)                   |
| [`.env.local`](https://nextjs.org/docs/app/guides/environment-variables)                       | Local environment variables (should not be tracked by version control)             |
| [`.env.production`](https://nextjs.org/docs/app/guides/environment-variables)                  | Production environment variables (should not be tracked by version control)        |
| [`.env.development`](https://nextjs.org/docs/app/guides/environment-variables)                 | Development environment variables (should not be tracked by version control)       |
| [`eslint.config.mjs`](https://nextjs.org/docs/app/api-reference/config/eslint)                 | Configuration file for ESLint                                                      |
| `.gitignore`                                                                 | Git files and folders to ignore                                                    |
| [`next-env.d.ts`](https://nextjs.org/docs/app/api-reference/config/typescript#next-envdts)     | TypeScript declaration file for Next.js (should not be tracked by version control) |
| `tsconfig.json`                                                              | Configuration file for TypeScript                                                  |
| `jsconfig.json`                                                              | Configuration file for JavaScript                                                  |

#### Routing Files

Add `page` to expose a route, `layout` for shared UI such as header, nav, or footer, `loading` for skeletons, `error` for error boundaries, and `route` for APIs.

|                                                                               |                     |                              |
| ----------------------------------------------------------------------------- | ------------------- | ---------------------------- |
| [`layout`](https://nextjs.org/docs/app/api-reference/file-conventions/layout)                   | `.js` `.jsx` `.tsx` | Layout                       |
| [`page`](https://nextjs.org/docs/app/api-reference/file-conventions/page)                       | `.js` `.jsx` `.tsx` | Page                         |
| [`loading`](https://nextjs.org/docs/app/api-reference/file-conventions/loading)                 | `.js` `.jsx` `.tsx` | Loading UI                   |
| [`not-found`](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)             | `.js` `.jsx` `.tsx` | Not found UI                 |
| [`error`](https://nextjs.org/docs/app/api-reference/file-conventions/error)                     | `.js` `.jsx` `.tsx` | Error UI                     |
| [`global-error`](https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error) | `.js` `.jsx` `.tsx` | Global error UI              |
| [`route`](https://nextjs.org/docs/app/api-reference/file-conventions/route)                     | `.js` `.ts`         | API endpoint                 |
| [`template`](https://nextjs.org/docs/app/api-reference/file-conventions/template)               | `.js` `.jsx` `.tsx` | Re-rendered layout           |
| [`default`](https://nextjs.org/docs/app/api-reference/file-conventions/default)                 | `.js` `.jsx` `.tsx` | Parallel route fallback page |

#### Nested routes

Folders define URL segments. Nesting folders nests segments. Layouts at any level wrap their child segments. A route becomes public when a `page` or `route` file exists.

| Path                        | URL pattern     | Notes                         |
| --------------------------- | --------------- | ----------------------------- |
| `app/layout.tsx`            | —               | Root layout wraps all routes  |
| `app/blog/layout.tsx`       | —               | Wraps `/blog` and descendants |
| `app/page.tsx`              | `/`             | Public route                  |
| `app/blog/page.tsx`         | `/blog`         | Public route                  |
| `app/blog/authors/page.tsx` | `/blog/authors` | Public route                  |

#### Dynamic routes

Parameterize segments with square brackets. Use `[segment]` for a single param, `[...segment]` for catch‑all, and `[[...segment]]` for optional catch‑all. Access values via the [`params`](https://nextjs.org/docs/app/api-reference/file-conventions/page#params-optional) prop.

| Path                            | URL pattern                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| `app/blog/[slug]/page.tsx`      | `/blog/my-first-post`                                                |
| `app/shop/[...slug]/page.tsx`   | `/shop/clothing`, `/shop/clothing/shirts`                            |
| `app/docs/[[...slug]]/page.tsx` | `/docs`, `/docs/layouts-and-pages`, `/docs/api-reference/use-router` |

#### Route groups and private folders

Organize code without changing URLs with route groups [`(group)`](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups#convention), and colocate non-routable files with private folders [`_folder`](#private-folders).

| Path                            | URL pattern | Notes                                     |
| ------------------------------- | ----------- | ----------------------------------------- |
| `app/(marketing)/page.tsx`      | `/`         | Group omitted from URL                    |
| `app/(shop)/cart/page.tsx`      | `/cart`     | Share layouts within `(shop)`             |
| `app/blog/_components/Post.tsx` | —           | Not routable; safe place for UI utilities |
| `app/blog/_lib/data.ts`         | —           | Not routable; safe place for utils        |

#### Parallel and Intercepted Routes

These features fit specific UI patterns, such as slot-based layouts or modal routing.

Use `@slot` for named slots rendered by a parent layout. Use intercept patterns to render another route inside the current layout without changing the URL, for example, to show a details view as a modal over a list.

| Pattern (docs)                                                                              | Meaning              | Typical use case                         |
| ------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------- |
| [`@folder`](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes#slots)                 | Named slot           | Sidebar + main content                   |
| [`(.)folder`](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes#convention)      | Intercept same level | Preview sibling route in a modal         |
| [`(..)folder`](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes#convention)     | Intercept parent     | Open a child of the parent as an overlay |
| [`(..)(..)folder`](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes#convention) | Intercept two levels | Deeply nested overlay                    |
| [`(...)folder`](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes#convention)    | Intercept from root  | Show arbitrary route in current view     |

#### Metadata file conventions

##### App icons

|                                                                                                                 |                                     |                          |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------ |
| [`favicon`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#favicon)                                | `.ico`                              | Favicon file             |
| [`icon`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#icon)                                      | `.ico` `.jpg` `.jpeg` `.png` `.svg` | App Icon file            |
| [`icon`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#generate-icons-using-code-js-ts-tsx)       | `.js` `.ts` `.tsx`                  | Generated App Icon       |
| [`apple-icon`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#apple-icon)                          | `.jpg` `.jpeg` `.png`               | Apple App Icon file      |
| [`apple-icon`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#generate-icons-using-code-js-ts-tsx) | `.js` `.ts` `.tsx`                  | Generated Apple App Icon |

##### Open Graph and Twitter images

|                                                                                                                             |                              |                            |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------- |
| [`opengraph-image`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#opengraph-image)                      | `.jpg` `.jpeg` `.png` `.gif` | Open Graph image file      |
| [`opengraph-image`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#generate-images-using-code-js-ts-tsx) | `.js` `.ts` `.tsx`           | Generated Open Graph image |
| [`twitter-image`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#twitter-image)                          | `.jpg` `.jpeg` `.png` `.gif` | Twitter image file         |
| [`twitter-image`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#generate-images-using-code-js-ts-tsx)   | `.js` `.ts` `.tsx`           | Generated Twitter image    |

##### SEO

|                                                                                                              |             |                       |
| ------------------------------------------------------------------------------------------------------------ | ----------- | --------------------- |
| [`sitemap`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap#sitemap-files-xml)                     | `.xml`      | Sitemap file          |
| [`sitemap`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap#generating-a-sitemap-using-code-js-ts) | `.js` `.ts` | Generated Sitemap     |
| [`robots`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots#static-robotstxt)                        | `.txt`      | Robots file           |
| [`robots`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots#generate-a-robots-file)                  | `.js` `.ts` | Generated Robots file |

### Organizing your project

Next.js is **unopinionated** about how you organize and colocate your project files. But it does provide several features to help you organize your project.

#### Component hierarchy

The components defined in special files are rendered in a specific hierarchy:

- `layout.js`
- `template.js`
- `error.js` (React error boundary)
- `loading.js` (React suspense boundary)
- `not-found.js` (React error boundary for "not found" UI)
- `page.js` or nested `layout.js`

![Component Hierarchy for File Conventions](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/file-conventions-component-hierarchy.png)

The components are rendered recursively in nested routes, meaning the components of a route segment will be nested **inside** the components of its parent segment.

![Nested File Conventions Component Hierarchy](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/nested-file-conventions-component-hierarchy.png)

#### Colocation

In the `app` directory, nested folders define route structure. Each folder represents a route segment that is mapped to a corresponding segment in a URL path.

However, even though route structure is defined through folders, a route is **not publicly accessible** until a `page.js` or `route.js` file is added to a route segment.

![A diagram showing how a route is not publicly accessible until a page.js or route.js file is added to a route segment.](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/project-organization-not-routable.png)

And, even when a route is made publicly accessible, only the **content returned** by `page.js` or `route.js` is sent to the client.

![A diagram showing how page.js and route.js files make routes publicly accessible.](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/project-organization-routable.png)

This means that **project files** can be **safely colocated** inside route segments in the `app` directory without accidentally being routable.

![A diagram showing colocated project files are not routable even when a segment contains a page.js or route.js file.](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/project-organization-colocation.png)

> **Good to know**: While you **can** colocate your project files in `app` you don't **have** to. If you prefer, you can [keep them outside the `app` directory](#store-project-files-outside-of-app).

#### Private folders

Private folders can be created by prefixing a folder with an underscore: `_folderName`

This indicates the folder is a private implementation detail and should not be considered by the routing system, thereby **opting the folder and all its subfolders** out of routing.

![An example folder structure using private folders](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/project-organization-private-folders.png)

Since files in the `app` directory can be [safely colocated by default](#colocation), private folders are not required for colocation. However, they can be useful for:

- Separating UI logic from routing logic.
- Consistently organizing internal files across a project and the Next.js ecosystem.
- Sorting and grouping files in code editors.
- Avoiding potential naming conflicts with future Next.js file conventions.

> **Good to know**:
>
> - While not a framework convention, you might also consider marking files outside private folders as "private" using the same underscore pattern.
> - You can create URL segments that start with an underscore by prefixing the folder name with `%5F` (the URL-encoded form of an underscore): `%5FfolderName`.
> - If you don't use private folders, it would be helpful to know Next.js [special file conventions](https://nextjs.org/docs/app/getting-started/project-structure#routing-files) to prevent unexpected naming conflicts.

#### Route groups

Route groups can be created by wrapping a folder in parenthesis: `(folderName)`

This indicates the folder is for organizational purposes and should **not be included** in the route's URL path.

![An example folder structure using route groups](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/project-organization-route-groups.png)

Route groups are useful for:

- Organizing routes by site section, intent, or team. e.g. marketing pages, admin pages, etc.
- Enabling nested layouts in the same route segment level:
  - [Creating multiple nested layouts in the same segment, including multiple root layouts](#creating-multiple-root-layouts)
  - [Adding a layout to a subset of routes in a common segment](#opting-specific-segments-into-a-layout)

#### `src` folder

Next.js supports storing application code (including `app`) inside an optional [`src` folder](https://nextjs.org/docs/app/api-reference/file-conventions/src-folder). This separates application code from project configuration files which mostly live in the root of a project.

![An example folder structure with the `src` folder](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/project-organization-src-directory.png)

### Examples

The following section lists a very high-level overview of common strategies. The simplest takeaway is to choose a strategy that works for you and your team and be consistent across the project.

> **Good to know**: In our examples below, we're using `components` and `lib` folders as generalized placeholders, their naming has no special framework significance and your projects might use other folders like `ui`, `utils`, `hooks`, `styles`, etc.

#### Store project files outside of `app`

This strategy stores all application code in shared folders in the **root of your project** and keeps the `app` directory purely for routing purposes.

![An example folder structure with project files outside of app](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/project-organization-project-root.png)

#### Store project files in top-level folders inside of `app`

This strategy stores all application code in shared folders in the **root of the `app` directory**.

![An example folder structure with project files inside app](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/project-organization-app-root.png)

#### Split project files by feature or route

This strategy stores globally shared application code in the root `app` directory and **splits** more specific application code into the route segments that use them.

![An example folder structure with project files split by feature or route](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/project-organization-app-root-split.png)

#### Organize routes without affecting the URL path

To organize routes without affecting the URL, create a group to keep related routes together. The folders in parenthesis will be omitted from the URL (e.g. `(marketing)` or `(shop)`).

![Organizing Routes with Route Groups](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/route-group-organisation.png)

Even though routes inside `(marketing)` and `(shop)` share the same URL hierarchy, you can create a different layout for each group by adding a `layout.js` file inside their folders. These layouts nest within the existing app layout.

![Route Groups with Multiple Layouts](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/route-group-multiple-layouts.png)

#### Opting specific segments into a layout

To opt specific routes into a layout, create a new route group (e.g. `(shop)`) and move the routes that share the same layout into the group (e.g. `account` and `cart`). The routes outside of the group will not share the layout (e.g. `checkout`).

![Route Groups with Opt-in Layouts](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/route-group-opt-in-layouts.png)

#### Opting for loading skeletons on a specific route

To apply a [loading skeleton](https://nextjs.org/docs/app/api-reference/file-conventions/loading) via a `loading.js` file to a specific route, create a new route group (e.g., `/(overview)`) and then move your `loading.tsx` inside that route group.

![Folder structure showing a loading.tsx and a page.tsx inside the route group](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/route-group-loading.png)

Now, the `loading.tsx` file will only apply to your dashboard → overview page instead of all your dashboard pages without affecting the URL path structure.

#### Creating multiple root layouts

To create multiple [root layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout), remove the top-level `layout.js` file, and add a `layout.js` file inside each route group. This is useful for partitioning an application into sections that have a completely different UI or experience. The `<html>` and `<body>` tags need to be added to each root layout.

![Route Groups with Multiple Root Layouts](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/route-group-multiple-root-layouts.png)

In the example above, both `(marketing)` and `(shop)` have their own root layout.

## Layouts and Pages

> **Source:** [Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

Next.js uses **file-system based routing**, meaning you can use folders and files to define routes. This page will guide you through how to create layouts and pages, and link between them.

### Creating a page

A **page** is UI that is rendered on a specific route. To create a page, add a [`page` file](https://nextjs.org/docs/app/api-reference/file-conventions/page) inside the `app` directory and default export a React component. For example, to create an index page (`/`):

![page.js special file](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/page-special-file.png)

```tsx
export default function Page() {
  return <h1>Hello Next.js!</h1>
}
```

### Creating a layout

A layout is UI that is **shared** between multiple pages. On navigation, layouts preserve state, remain interactive, and do not rerender.

You can define a layout by default exporting a React component from a [`layout` file](https://nextjs.org/docs/app/api-reference/file-conventions/layout). The component should accept a `children` prop which can be a page or another [layout](#nesting-layouts).

For example, to create a layout that accepts your index page as child, add a `layout` file inside the `app` directory:

![layout.js special file](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/layout-special-file.png)

```tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Layout UI */}
        {/* Place children where you want to render a page or nested layout */}
        <main>{children}</main>
      </body>
    </html>
  )
}
```

The layout above is called a [root layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout) because it's defined at the root of the `app` directory. The root layout is **required** and must contain `html` and `body` tags.

### Creating a nested route

A nested route is a route composed of multiple URL segments. For example, the `/blog/[slug]` route is composed of three segments:

- `/` (Root Segment)
- `blog` (Segment)
- `[slug]` (Leaf Segment)

In Next.js:

- **Folders** are used to define the route segments that map to URL segments.
- **Files** (like `page` and `layout`) are used to create UI that is shown for a segment.

To create nested routes, you can nest folders inside each other. For example, to add a route for `/blog`, create a folder called `blog` in the `app` directory. Then, to make `/blog` publicly accessible, add a `page.tsx` file:

![File hierarchy showing blog folder and a page.js file](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/blog-nested-route.png)

```tsx
// Dummy imports
import { getPosts } from '@/lib/posts'
import { Post } from '@/ui/post'

export default async function Page() {
  const posts = await getPosts()

  return (
    <ul>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </ul>
  )
}
```

You can continue nesting folders to create nested routes. For example, to create a route for a specific blog post, create a new `[slug]` folder inside `blog` and add a `page` file:

![File hierarchy showing blog folder with a nested slug folder and a page.js file](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/blog-post-nested-route.png)

```tsx
export function generateStaticParams() {}

export default function Page() {
  return <h1>Hello, Blog Post Page!</h1>
}
```

Wrapping a folder name in square brackets (e.g. `[slug]`) creates a [dynamic route segment](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) which is used to generate multiple pages from data. e.g. blog posts, product pages, etc.

### Nesting layouts

By default, layouts in the folder hierarchy are also nested, which means they wrap child layouts via their `children` prop. You can nest layouts by adding `layout` inside specific route segments (folders).

For example, to create a layout for the `/blog` route, add a new `layout` file inside the `blog` folder.

![File hierarchy showing root layout wrapping the blog layout](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/nested-layouts.png)

```tsx
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section>{children}</section>
}
```

If you were to combine the two layouts above, the root layout (`app/layout.js`) would wrap the blog layout (`app/blog/layout.js`), which would wrap the blog (`app/blog/page.js`) and blog post page (`app/blog/[slug]/page.js`).

### Creating a dynamic segment

[Dynamic segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) allow you to create routes that are generated from data. For example, instead of manually creating a route for each individual blog post, you can create a dynamic segment to generate the routes based on blog post data.

To create a dynamic segment, wrap the segment (folder) name in square brackets: `[segmentName]`. For example, in the `app/blog/[slug]/page.tsx` route, the `[slug]` is the dynamic segment.

```tsx
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  )
}
```

Learn more about [Dynamic Segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) and the [`params`](https://nextjs.org/docs/app/api-reference/file-conventions/page#params-optional) props.

Nested [layouts within Dynamic Segments](https://nextjs.org/docs/app/api-reference/file-conventions/layout#params-optional) can also access the `params` props.

### Rendering with search params

In a Server Component **page**, you can access search parameters using the [`searchParams`](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional) prop:

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const filters = (await searchParams).filters
}
```

Using `searchParams` opts your page into [**dynamic rendering**](https://nextjs.org/docs/app/glossary#dynamic-rendering) because it requires an incoming request to read the search parameters from.

Client Components can read search params using the [`useSearchParams`](https://nextjs.org/docs/app/api-reference/functions/use-search-params) hook.

Learn more about `useSearchParams` in [prerendered](https://nextjs.org/docs/app/api-reference/functions/use-search-params#prerendering) and [dynamically rendered](https://nextjs.org/docs/app/api-reference/functions/use-search-params#dynamic-rendering) routes.

#### What to use and when

- Use the `searchParams` prop when you need search parameters to **load data for the page** (e.g. pagination, filtering from a database).
- Use `useSearchParams` when search parameters are used **only on the client** (e.g. filtering a list already loaded via props).
- As a small optimization, you can use `new URLSearchParams(window.location.search)` in **callbacks or event handlers** to read search params without triggering re-renders.

### Linking between pages

You can use the [`` component](https://nextjs.org/docs/app/api-reference/components/link) to navigate between routes. `` is a built-in Next.js component that extends the HTML `<a>` tag to provide [prefetching](https://nextjs.org/docs/app/getting-started/linking-and-navigating#prefetching) and [client-side navigation](https://nextjs.org/docs/app/getting-started/linking-and-navigating#client-side-transitions).

For example, to generate a list of blog posts, import `` from `next/link` and pass a `href` prop to the component:

```tsx
import Link from 'next/link'
import { getPosts } from '@/lib/posts'

export default async function Posts() {
  const posts = await getPosts()

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  )
}
```

> **Good to know**: `` is the primary way to navigate between routes in Next.js. You can also use the [`useRouter` hook](https://nextjs.org/docs/app/api-reference/functions/use-router) for more advanced navigation.

### Route Props Helpers

Next.js exposes utility types that infer `params` and named slots from your route structure:

- [**PageProps**](https://nextjs.org/docs/app/api-reference/file-conventions/page#page-props-helper): Props for `page` components, including `params` and `searchParams`.
- [**LayoutProps**](https://nextjs.org/docs/app/api-reference/file-conventions/layout#layout-props-helper): Props for `layout` components, including `children` and any named slots (e.g. folders like `@analytics`).

These are globally available helpers, generated when running either `next dev`, `next build` or [`next typegen`](https://nextjs.org/docs/app/api-reference/cli/next#next-typegen-options).

```tsx
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  return <h1>Blog post: {slug}</h1>
}
```

```tsx
export default function Layout(props: LayoutProps<'/dashboard'>) {
  return (
    <section>
      {props.children}
      {/* If you have app/dashboard/@analytics, it appears as a typed slot: */}
      {/* {props.analytics} */}
    </section>
  )
}
```

> **Good to know**
>
> - Static routes resolve `params` to `{}`.
> - `PageProps`, `LayoutProps` are global helpers — no imports required.
> - Types are generated during `next dev`, `next build` or `next typegen`.

## Linking and Navigating

> **Source:** [Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

In Next.js, routes are rendered on the server by default. This often means the client has to wait for a server response before a new route can be shown. Next.js comes with built-in [prefetching](#prefetching), [streaming](#streaming), and [client-side transitions](#client-side-transitions) ensuring navigation stays fast and responsive.

This guide explains how navigation works in Next.js and how you can optimize it for [dynamic routes](#dynamic-routes-without-loadingtsx) and [slow networks](#slow-networks).

### How navigation works

To understand how navigation works in Next.js, it helps to be familiar with the following concepts:

- [Server Rendering](#server-rendering)
- [Prefetching](#prefetching)
- [Streaming](#streaming)
- [Client-side transitions](#client-side-transitions)

#### Server Rendering

In Next.js, [Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) are [React Server Components](https://react.dev/reference/rsc/server-components) by default. On initial and subsequent navigations, the [Server Component Payload](https://nextjs.org/docs/app/getting-started/server-and-client-components#how-do-server-and-client-components-work-in-nextjs) is generated on the server before being sent to the client.

There are two types of server rendering, based on _when_ it happens:

- **Prerendering** happens at build time or during [revalidation](https://nextjs.org/docs/app/getting-started/revalidating) and the result is cached.
- **Dynamic Rendering** happens at request time in response to a client request.

The trade-off of server rendering is that the client must wait for the server to respond before the new route can be shown. Next.js addresses this delay by [prefetching](#prefetching) routes the user is likely to visit and performing [client-side transitions](#client-side-transitions).

> **Good to know**: HTML is also generated for the initial visit.

#### Prefetching

Prefetching is the process of loading a route in the background before the user navigates to it. This makes navigation between routes in your application feel instant, because by the time a user clicks on a link, the data to render the next route is already available client side.

Next.js automatically prefetches routes linked with the [`` component](https://nextjs.org/docs/app/api-reference/components/link) when they enter the user's viewport.

```tsx
import Link from 'next/link'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <nav>
          {/* Prefetched when the link is hovered or enters the viewport */}
          <Link href="/blog">Blog</Link>
          {/* No prefetching */}
          <a href="/contact">Contact</a>
        </nav>
        {children}
      </body>
    </html>
  )
}
```

How much of the route is prefetched depends on whether it's static or dynamic:

- **Static Route**: the full route is prefetched.
- **Dynamic Route**: prefetching is skipped, or the route is partially prefetched if [`loading.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/loading) is present.

By skipping or partially prefetching dynamic routes, Next.js avoids unnecessary work on the server for routes the users may never visit. However, waiting for a server response before navigation can give the users the impression that the app is not responding.

![Server Rendering without Streaming](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/server-rendering-without-streaming.png)

> **Good to know:** See the [Prefetching guide](https://nextjs.org/docs/app/guides/prefetching) for the full behavior, including how to control prefetching per link and how it changes when you adopt [Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching). To include URL-dependent content in a link's prefetch, see [Optimizing prefetching](https://nextjs.org/docs/app/guides/optimizing-prefetching).

To improve the navigation experience to dynamic routes, you can use [streaming](#streaming).

#### Streaming

Streaming allows the server to send parts of a dynamic route to the client as soon as they're ready, rather than waiting for the entire route to be rendered. This means users see something sooner, even if parts of the page are still loading. See the [Streaming guide](https://nextjs.org/docs/app/guides/streaming) for a deep dive into how streaming works in Next.js.

For dynamic routes, it means they can be **partially prefetched**. That is, shared layouts and loading skeletons can be requested ahead of time.

![How Server Rendering with Streaming Works](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/server-rendering-with-streaming.png)

To use streaming, create a `loading.tsx` in your route folder:

![loading.js special file](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/loading-special-file.png)

```tsx
export default function Loading() {
  // Add fallback UI that will be shown while the route is loading.
  return <LoadingSkeleton />
}
```

Behind the scenes, Next.js will automatically wrap the `page.tsx` contents in a `` boundary. The prefetched fallback UI will be shown while the route is loading, and swapped for the actual content once ready.

> **Good to know**: You can also use [``](https://react.dev/reference/react/Suspense) to create loading UI for nested components.

Benefits of `loading.tsx`:

- Immediate navigation and visual feedback for the user.
- Shared layouts remain interactive and navigation is interruptible.
- Improved Core Web Vitals: [TTFB](https://web.dev/articles/ttfb), [FCP](https://web.dev/articles/fcp), and [TTI](https://web.dev/articles/tti).

To further improve the navigation experience, Next.js performs a [client-side transition](#client-side-transitions) with the `` component.

#### Client-side transitions

Traditionally, navigation to a server-rendered page triggers a full page load. This clears state, resets scroll position, and blocks interactivity.

Next.js avoids this with client-side transitions using the `` component. Instead of reloading the page, it updates the content dynamically by:

- Keeping any shared layouts and UI.
- Replacing the current page with the prefetched loading state or a new page if available.

Client-side transitions make server-rendered apps _feel_ like client-rendered apps. And when paired with [prefetching](#prefetching) and [streaming](#streaming), they enable fast transitions, even for dynamic routes.

Next.js also handles [scrolling to the top of the page](https://nextjs.org/docs/app/api-reference/components/link#scroll) during client-side transitions. If content scrolls behind a sticky or fixed header after navigation, you can fix this with CSS [`scroll-padding-top`](https://nextjs.org/docs/app/api-reference/components/link#scroll-offset-with-sticky-headers).

### What can make transitions slow?

These Next.js optimizations make navigation fast and responsive. However, under certain conditions, transitions can still _feel_ slow. Here are some common causes and how to improve the user experience:

#### Dynamic routes without `loading.tsx`

When navigating to a dynamic route, the client must wait for the server response before showing the result. This can give the users the impression that the app is not responding.

We recommend adding `loading.tsx` to dynamic routes to enable partial prefetching, trigger immediate navigation, and display a loading UI while the route renders.

```tsx
export default function Loading() {
  return <LoadingSkeleton />
}
```

> **Good to know**: In development mode, you can use the Next.js Devtools to identify if the route is static or dynamic. See [`devIndicators`](https://nextjs.org/docs/app/api-reference/config/next-config-js/devIndicators) for more information.

#### Dynamic segments without `generateStaticParams`

If a [dynamic segment](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) could be prerendered but isn't because it's missing [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params), the route will fallback to dynamic rendering at request time.

Ensure the route is statically generated at build time by adding `generateStaticParams`:

```tsx
export async function generateStaticParams() {
  const posts = await fetch('https://.../posts').then((res) => res.json())

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // ...
}
```

#### Slow networks

On slow or unstable networks, prefetching may not finish before the user clicks a link. This can affect both static and dynamic routes. In these cases, the `loading.js` fallback may not appear immediately because it hasn't been prefetched yet.

To improve perceived performance, you can use the [`useLinkStatus` hook](https://nextjs.org/docs/app/api-reference/functions/use-link-status) to show immediate feedback while the transition is in progress.

```tsx
'use client'

import { useLinkStatus } from 'next/link'

export default function LoadingIndicator() {
  const { pending } = useLinkStatus()
  return (
    <span aria-hidden className={`link-hint ${pending ? 'is-pending' : ''}`} />
  )
}
```

You can "debounce" the hint by adding an initial animation delay (e.g. 100ms) and starting as invisible (e.g. `opacity: 0`). This means the loading indicator will only be shown if the navigation takes longer than the specified delay. See the [`useLinkStatus` reference](https://nextjs.org/docs/app/api-reference/functions/use-link-status#gracefully-handling-fast-navigation) for a CSS example.

> **Good to know**: An **experimental** [`useOffline`](https://nextjs.org/docs/app/api-reference/config/next-config-js/useOffline) hook can keep prefetched routes navigable during connectivity drops. See the [offline support guide](https://nextjs.org/docs/app/guides/offline-support).

> **Good to know**: You can use other visual feedback patterns like a progress bar. View an example [here](https://github.com/vercel/react-transition-progress).

#### Disabling prefetching

You can opt out of prefetching by setting the `prefetch` prop to `false` on the `` component. This is useful to avoid unnecessary usage of resources when rendering large lists of links (e.g. an infinite scroll table).

```tsx
<Link prefetch={false} href="/blog">
  Blog
</Link>
```

However, disabling prefetching comes with trade-offs:

- **Static routes** will only be fetched when the user clicks the link.
- **Dynamic routes** will need to be rendered on the server first before the client can navigate to it.

To reduce resource usage without fully disabling prefetch, you can prefetch only on hover. This limits prefetching to routes the user is more _likely_ to visit, rather than all links in the viewport.

```tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

function HoverPrefetchLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const [active, setActive] = useState(false)

  return (
    <Link
      href={href}
      prefetch={active ? null : false}
      onMouseEnter={() => setActive(true)}
    >
      {children}
    </Link>
  )
}
```

#### Hydration not completed

`` is a Client Component and must be hydrated before it can prefetch routes. On the initial visit, large JavaScript bundles can delay hydration, preventing prefetching from starting right away.

React mitigates this with Selective Hydration and you can further improve this by:

- Using the [`@next/bundle-analyzer`](https://nextjs.org/docs/app/guides/package-bundling#nextbundle-analyzer-for-webpack) plugin to identify and reduce bundle size by removing large dependencies.
- Moving logic from the client to the server where possible. See the [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) docs for guidance.

### Examples

#### Native History API

Next.js allows you to use the native [`window.history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) and [`window.history.replaceState`](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) methods to update the browser's history stack without reloading the page.

`pushState` and `replaceState` calls integrate into the Next.js Router, allowing you to sync with [`usePathname`](https://nextjs.org/docs/app/api-reference/functions/use-pathname) and [`useSearchParams`](https://nextjs.org/docs/app/api-reference/functions/use-search-params).

##### `window.history.pushState`

Use it to add a new entry to the browser's history stack. The user can navigate back to the previous state. For example, to sort a list of products:

```tsx
'use client'

import { useSearchParams } from 'next/navigation'

export default function SortProducts() {
  const searchParams = useSearchParams()

  function updateSorting(sortOrder: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sortOrder)
    window.history.pushState(null, '', `?${params.toString()}`)
  }

  return (
    <>
      <button onClick={() => updateSorting('asc')}>Sort Ascending</button>
      <button onClick={() => updateSorting('desc')}>Sort Descending</button>
    </>
  )
}
```

##### `window.history.replaceState`

Use it to replace the current entry on the browser's history stack. The user is not able to navigate back to the previous state. For example, to switch the application's locale:

```tsx
'use client'

import { usePathname } from 'next/navigation'

export function LocaleSwitcher() {
  const pathname = usePathname()

  function switchLocale(locale: string) {
    // e.g. '/en/about' or '/fr/contact'
    const newPath = `/${locale}${pathname}`
    window.history.replaceState(null, '', newPath)
  }

  return (
    <>
      <button onClick={() => switchLocale('en')}>English</button>
      <button onClick={() => switchLocale('fr')}>French</button>
    </>
  )
}
```

## Server and Client Components

> **Source:** [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

By default, layouts and pages are [Server Components](https://react.dev/reference/rsc/server-components), which lets you fetch data and render parts of your UI on the server, optionally cache the result, and stream it to the client. When you need interactivity or browser APIs, you can use [Client Components](https://react.dev/reference/rsc/use-client) to layer in functionality.

This page explains how Server and Client Components work in Next.js and when to use them, with examples of how to compose them together in your application.

> **Good to know:** For an explanation of where each component type runs and how the boundary works, see [The Server and Client Boundary](https://nextjs.org/docs/app/guides/server-and-client-boundary).

### When to use Server and Client Components?

The client and server environments have different capabilities. Server and Client Components allow you to run logic in each environment depending on your use case.

Use **Client Components** when you need:

- [State](https://react.dev/learn/managing-state) and [event handlers](https://react.dev/learn/responding-to-events). E.g. `onClick`, `onChange`.
- [Lifecycle logic](https://react.dev/learn/lifecycle-of-reactive-effects). E.g. `useEffect`.
- Browser-only APIs. E.g. `localStorage`, `window`, `navigator.geolocation`, etc.
- [Custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks).

Use **Server Components** when you need:

- Fetch data from databases or APIs close to the source.
- Use API keys, tokens, and other secrets without exposing them to the client.
- Reduce the amount of JavaScript sent to the browser.
- Improve the [First Contentful Paint (FCP)](https://web.dev/fcp/), and stream content progressively to the client.

For example, the `` component is a Server Component that fetches data about a post, and passes it as props to the `` which handles client-side interactivity.

```tsx
import LikeButton from '@/app/ui/like-button'
import { getPost } from '@/lib/data'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)

  return (
    <div>
      <main>
        <h1>{post.title}</h1>
        {/* ... */}
        <LikeButton likes={post.likes} />
      </main>
    </div>
  )
}
```

```tsx
'use client'

import { useState } from 'react'

export default function LikeButton({ likes }: { likes: number }) {
  // ...
}
```

### How do Server and Client Components work in Next.js?

#### On the server

On the server, Next.js uses React's APIs to orchestrate rendering. The rendering work is split into chunks, by individual route segments ([layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)), including [parallel route slots](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes) whether or not they are displayed:

- **Server Components** are rendered into a special data format called the React Server Component Payload (RSC Payload).
- **Client Components** and the RSC Payload are used to [prerender](https://nextjs.org/docs/app/glossary#prerendering) HTML.

> **What is the React Server Component Payload (RSC)?**
>
> The RSC Payload is a compact, serialized representation of the rendered React Server Components tree. It's used by React on the client to update the browser's DOM. The RSC Payload contains:
>
> - The rendered result of Server Components
> - Placeholders for where Client Components should be rendered and references to their JavaScript files
> - Any props passed from a Server Component to a Client Component

#### On the client (first load)

Then, on the client:

1. **HTML** is used to immediately show a fast non-interactive preview of the route to the user.
2. **RSC Payload** is used to reconcile the Client and Server Component trees.
3. **JavaScript** is used to hydrate Client Components and make the application interactive.

> **What is hydration?**
>
> Hydration is React's process for attaching [event handlers](https://react.dev/learn/responding-to-events) to the DOM, to make the static HTML interactive.

#### Subsequent Navigations

On subsequent navigations:

- The **RSC Payload** is prefetched and cached for instant navigation.
- **Client Components** are rendered entirely on the client, without the server-rendered HTML.

### Examples

#### Using Client Components

You can create a Client Component by adding the [`"use client"`](https://react.dev/reference/rsc/use-client) directive at the top of the file, above your imports.

```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>{count} likes</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

`"use client"` is used to declare a **boundary** between the Server and Client module graphs (trees).

Once a file is marked with `"use client"`, **all of its imports and the components it directly renders are included in the client bundle**. This means you don’t need to add the directive to every component that is intended for the client.

This behavior applies to components that are part of the Client Component’s [module graph](https://nextjs.org/docs/app/glossary#module-graph), which includes the modules it imports and the components it renders directly. It does not apply to Server Components passed as children or other props. Those components are not imported into the Client Component’s module graph. They are rendered on the server and passed to the Client Component as rendered output.

See [Interleaving Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components#interleaving-server-and-client-components) for how Server and Client Components can be combined.

#### Reducing JS bundle size

To reduce the size of your client JavaScript bundles, add `'use client'` at the top of the files that define your interactive components instead of marking large parts of your UI as Client Components.

For example, the `` component contains mostly static elements like a logo and navigation links, but includes an interactive search bar. `` needs to be a Client Component, while the rest of the layout can stay a Server Component.

```tsx
// Client Component
import Search from './search'
// Server Component
import Logo from './logo'

// Layout is a Server Component by default
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <Logo />
        <Search />
      </nav>
      <main>{children}</main>
    </>
  )
}
```

```tsx
'use client'

export default function Search() {
  // ...
}
```

#### Passing data from Server to Client Components

You can pass data from Server Components to Client Components using props.

```tsx
import LikeButton from '@/app/ui/like-button'
import { getPost } from '@/lib/data'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)

  return <LikeButton likes={post.likes} />
}
```

```tsx
'use client'

export default function LikeButton({ likes }: { likes: number }) {
  // ...
}
```

Alternatively, you can stream data from a Server Component to a Client Component with the [`use` API](https://react.dev/reference/react/use). See an [example](https://nextjs.org/docs/app/getting-started/fetching-data#streaming-data-with-the-use-api).

> **Good to know**: Props passed to Client Components need to be [serializable](https://react.dev/reference/react/use-server#serializable-parameters-and-return-values) by React.

#### Interleaving Server and Client Components

You can pass Server Components as a prop to a Client Component. This allows you to visually nest server-rendered UI within Client components.

A common pattern is to use `children` to create a _slot_ in a ``. For example, a `` component that fetches data on the server, inside a `` component that uses client state to toggle visibility.

```tsx
'use client'

export default function Modal({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```

Then, in a parent Server Component (e.g.``), you can pass a `` as the child of the ``:

```tsx
import Modal from './ui/modal'
import Cart from './ui/cart'

export default function Page() {
  return (
    <Modal>
      <Cart />
    </Modal>
  )
}
```

In this pattern, Server Components are rendered on the server ahead of time, even when passed as props to Client Components. The React Server Component Payload contains the rendered result of those Server Components, plus placeholders for where Client Components should be rendered and references to their JavaScript files.

#### Context providers

[React context](https://react.dev/learn/passing-data-deeply-with-context) is commonly used to share global state like the current theme. However, React context is not supported in Server Components.

To use context, create a Client Component that accepts `children`:

```tsx
'use client'

import { createContext } from 'react'

export const ThemeContext = createContext({})

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
}
```

Then, import it into a Server Component (e.g. `layout`):

```tsx
import ThemeProvider from './theme-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

Your Server Component will now be able to directly render your provider, and all other Client Components throughout your app will be able to consume this context.

> **Good to know**: You should render providers as deep as possible in the tree – notice how `ThemeProvider` only wraps `{children}` instead of the entire `<html>` document. This makes it easier for Next.js to optimize the static parts of your Server Components.

To pass server-fetched data through context and read it in Client Components with `use()`, see [Using React's `use` within a Context Provider](https://nextjs.org/docs/app/guides/single-page-applications#using-reacts-use-within-a-context-provider).

#### Third-party components

When using a third-party component that relies on client-only features, you can wrap it in a Client Component to ensure it works as expected.

For example, the `` can be imported from the `acme-carousel` package. This component uses `useState`, but the module that defines it doesn't yet have the `"use client"` directive.

If you use `` within a Client Component, it will work as expected:

```tsx
'use client'

import { useState } from 'react'
import { Carousel } from 'acme-carousel'

export default function Gallery() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>View pictures</button>
      {/* Works, since Carousel is used within a Client Component */}
      {isOpen && <Carousel />}
    </div>
  )
}
```

However, if you try to use it directly within a Server Component, you'll see an error. This is because Next.js doesn't know `` is using client-only features.

To fix this, you can wrap third-party components that rely on client-only features in your own Client Components:

```tsx
'use client'

import { Carousel } from 'acme-carousel'

export default Carousel
```

Now, you can use `` directly within a Server Component:

```tsx
import Carousel from './carousel'

export default function Page() {
  return (
    <div>
      <p>View pictures</p>
      {/*  Works, since Carousel is a Client Component */}
      <Carousel />
    </div>
  )
}
```

> **Advice for Library Authors**
>
> If you’re building a component library, add the `"use client"` directive to entry points that rely on client-only features. This lets your users import components into Server Components without needing to create wrappers.
>
> It's worth noting some bundlers might strip out `"use client"` directives. You can find an example of how to configure esbuild to include the `"use client"` directive in the [React Wrap Balancer](https://github.com/shuding/react-wrap-balancer/blob/main/tsup.config.ts#L10-L13) and [Vercel Analytics](https://github.com/vercel/analytics/blob/main/packages/web/tsup.config.js#L26-L30) repositories.

#### Preventing environment poisoning

JavaScript modules can be shared between both Server and Client Components modules. This means it's possible to accidentally import server-only code into the client. For example, consider the following function:

```ts
export async function getData() {
  const res = await fetch('https://external-service.com/data', {
    headers: {
      authorization: process.env.API_KEY,
    },
  })

  return res.json()
}
```

This function contains an `API_KEY` that should never be exposed to the client.

In Next.js, only environment variables prefixed with `NEXT_PUBLIC_` are included in the client bundle. If variables are not prefixed, Next.js replaces them with an empty string.

As a result, even though `getData()` can be imported and executed on the client, it won't work as expected.

To prevent accidental usage in Client Components, you can use the [`server-only` package](https://www.npmjs.com/package/server-only).

Then, import the package into a file that contains server-only code:

```js
import 'server-only'

export async function getData() {
  const res = await fetch('https://external-service.com/data', {
    headers: {
      authorization: process.env.API_KEY,
    },
  })

  return res.json()
}
```

Now, if you try to import the module into a Client Component, there will be a build-time error.

The corresponding [`client-only` package](https://www.npmjs.com/package/client-only) can be used to mark modules that contain client-only logic like code that accesses the `window` object.

In Next.js, installing `server-only` or `client-only` is **optional**. However, if your linting rules flag extraneous dependencies, you may install them to avoid issues.

```bash
npm install server-only
```

```bash
yarn add server-only
```

```bash
pnpm add server-only
```

```bash
bun add server-only
```

Next.js handles `server-only` and `client-only` imports internally to provide clearer error messages when a module is used in the wrong environment. The contents of these packages from NPM are not used by Next.js.

Next.js also provides its own type declarations for `server-only` and `client-only`, for TypeScript configurations where [`noUncheckedSideEffectImports`](https://www.typescriptlang.org/tsconfig/#noUncheckedSideEffectImports) is active.

## Fetching Data

> **Source:** [Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

This page will walk you through how you can fetch data in [Server](#server-components) and [Client](#client-components) Components, and how to [stream](#streaming) components that depend on uncached data.

### Fetching data

#### Server Components

You can fetch data in Server Components using any asynchronous I/O, such as:

1. The [`fetch` API](#with-the-fetch-api)
2. An [ORM or database](#with-an-orm-or-database)

##### With the `fetch` API

To fetch data with the `fetch` API, turn your component into an asynchronous function, and await the `fetch` call. For example:

```tsx
export default async function Page() {
  const data = await fetch('https://api.vercel.app/blog')
  const posts = await data.json()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

> **Good to know:**
>
> - Identical `fetch` requests in a React component tree are [memoized](https://nextjs.org/docs/app/glossary#memoization) by default, so you can fetch data in the component that needs it instead of drilling props.
> - `fetch` requests are not cached by default and will block the page from rendering until the request is complete. Use the [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) directive to cache results, or wrap the fetching component in [``](https://nextjs.org/docs/app/getting-started/caching#streaming-uncached-data) to stream fresh data at request time. See [caching](https://nextjs.org/docs/app/getting-started/caching) for details.
> - During development, you can log `fetch` calls for better visibility and debugging. See the [`logging` API reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/logging).

##### With an ORM or database

Since Server Components are rendered on the server, credentials and query logic will not be included in the client bundle so you can safely make database queries using an ORM or database client.

```tsx
import { db, posts } from '@/lib/db'

export default async function Page() {
  const allPosts = await db.select().from(posts)
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

You should still ensure requests are properly authenticated and authorized. For best practices on securing server-side data access, see the [data security guide](https://nextjs.org/docs/app/guides/data-security).

#### Streaming

When you fetch data in Server Components, the data is fetched and rendered on the server for each request. If you have any slow data requests, the whole route will be blocked from rendering until all the data is fetched.

To improve the initial load time and user experience, you can break the page into smaller _chunks_ and progressively send those chunks from the server to the client. This is called streaming. See the [Streaming guide](https://nextjs.org/docs/app/guides/streaming) for a deeper look at how streaming works, including the HTTP contract, infrastructure considerations, and performance trade-offs.

![How Server Rendering with Streaming Works](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/server-rendering-with-streaming.png)

There are two ways you can use streaming in your application:

1. Wrapping a page with a [`loading.js` file](#with-loadingjs)
2. Wrapping a component with [``](#with-suspense)

> **Good to know:** Bots and crawlers are served differently from browsers. Next.js waits for data fetching to finish and sends the fully rendered page instead of streaming it progressively. See [Bots and crawlers](https://nextjs.org/docs/app/guides/streaming#bots-and-crawlers).

##### With `loading.js`

You can create a `loading.js` file in the same folder as your page to stream the **entire page** while the data is being fetched. For example, to stream `app/blog/page.js`, add the file inside the `app/blog` folder.

![Blog folder structure with loading.js file](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/loading-file.png)

```tsx
export default function Loading() {
  // Define the Loading UI here
  return <div>Loading...</div>
}
```

On navigation, the user will immediately see the layout and a [loading state](#creating-meaningful-loading-states) while the page is being rendered. The new content will then be automatically swapped in once rendering is complete.

![Loading UI](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/loading-ui.png)

Behind the scenes, `loading.js` will be [nested inside `layout.js`](https://nextjs.org/docs/app/getting-started/project-structure#component-hierarchy), and will automatically wrap the `page.js` file and any children below in a `` boundary.

![loading.js overview](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/loading-overview.png)

Because of this, a layout that accesses uncached or runtime data (e.g. `cookies()`, `headers()`, or uncached fetches) does not fall back to a same route segment `loading.js`. Instead, it blocks navigation until the layout finishes rendering. [Cache Components](https://nextjs.org/docs/app/getting-started/caching) prevents this by guiding you with a build-time error.

To fix this, wrap the uncached access in its own [``](#with-suspense) boundary with a fallback, or move the data fetching into `page.js` where `loading.js` can cover it. See [`loading.js`](https://nextjs.org/docs/app/api-reference/file-conventions/loading) for more details.

This is why, while `loading.js` works well for streaming route segments, using `` closer to the runtime or uncached data access is recommended.

##### With ``

`` allows you to be more granular about what parts of the page to stream. For example, you can immediately show any page content that falls outside of the `` boundary, and stream in the list of blog posts inside the boundary.

```tsx
import { Suspense } from 'react'
import BlogList from '@/components/BlogList'
import BlogListSkeleton from '@/components/BlogListSkeleton'

export default function BlogPage() {
  return (
    <div>
      {/* This content will be sent to the client immediately */}
      <header>
        <h1>Welcome to the Blog</h1>
        <p>Read the latest posts below.</p>
      </header>
      <main>
        {/* If there's any dynamic content inside this boundary, it will be streamed in */}
        <Suspense fallback={<BlogListSkeleton />}>
          <BlogList />
        </Suspense>
      </main>
    </div>
  )
}
```

##### Creating meaningful loading states

An instant loading state is fallback UI that is shown immediately to the user after navigation. For the best user experience, we recommend designing loading states that are meaningful and help users understand the app is responding. For example, you can use skeletons and spinners, or a small but meaningful part of future screens such as a cover photo, title, etc.

In development, you can preview and inspect the loading state of your components using the [React Devtools](https://react.dev/learn/react-developer-tools).

#### Client Components

There are two ways to fetch data in Client Components, using:

1. React's [`use` API](https://react.dev/reference/react/use)
2. A community library like [SWR](https://swr.vercel.app/) or [React Query](https://tanstack.com/query/latest)

##### Streaming data with the `use` API

You can use React's [`use` API](https://react.dev/reference/react/use) to [stream](#streaming) data from the server to client. Start by fetching data in your Server component, and pass the promise to your Client Component as prop:

```tsx
import Posts from '@/app/ui/posts'
import { Suspense } from 'react'

export default function Page() {
  // Don't await the data fetching function
  const posts = getPosts()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Posts posts={posts} />
    </Suspense>
  )
}
```

Then, in your Client Component, use the `use` API to read the promise:

```tsx
'use client'
import { use } from 'react'

export default function Posts({
  posts,
}: {
  posts: Promise<{ id: string; title: string }[]>
}) {
  const allPosts = use(posts)

  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

In the example above, the `` component is wrapped in a [`` boundary](https://react.dev/reference/react/Suspense). This means the fallback will be shown while the promise is being resolved. Learn more about [streaming](#streaming).

You can resolve a promise on the server with `await` or in a Client Component with `use()`. React covers [when to resolve a Promise in a Server or Client Component](https://react.dev/reference/react/use#resolve-promise-in-server-or-client-component). To share one promise with many Client Components instead of passing it as a prop, provide it through context. See [Using React's `use` within a Context Provider](https://nextjs.org/docs/app/guides/single-page-applications#using-reacts-use-within-a-context-provider).

##### Community libraries

You can use a community library like [SWR](https://swr.vercel.app/) or [React Query](https://tanstack.com/query/latest) to fetch data in Client Components. These libraries have their own semantics for caching, streaming, and other features. For example, with SWR:

```tsx
'use client'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((r) => r.json())

export default function BlogPage() {
  const { data, error, isLoading } = useSWR(
    'https://api.vercel.app/blog',
    fetcher
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data.map((post: { id: string; title: string }) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

See [Client-side data fetching](https://nextjs.org/docs/app/guides/client-side-data-fetching) for direct browser fetching, providing initial data from a Server Component, and coordinating a library cache with the Next.js server and client caches.

### Examples

#### Sequential data fetching

Sequential data fetching happens when one request depends on data from another.

For example, `` can only fetch data after `getArtist()` resolves because it needs the `artistID`:

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  // Get artist information
  const artist = await getArtist(username)

  return (
    <>
      <h1>{artist.name}</h1>
      {/* Show fallback UI while the Playlists component is loading */}
      <Suspense fallback={<div>Loading...</div>}>
        {/* Pass the artist ID to the Playlists component */}
        <Playlists artistID={artist.id} />
      </Suspense>
    </>
  )
}

async function Playlists({ artistID }: { artistID: string }) {
  // Use the artist ID to fetch playlists
  const playlists = await getArtistPlaylists(artistID)

  return (
    <ul>
      {playlists.map((playlist) => (
        <li key={playlist.id}>{playlist.name}</li>
      ))}
    </ul>
  )
}
```

In this example, `` allows the playlists to stream in after the artist data loads. However, the page still waits for the artist data before displaying anything. To prevent this, you can wrap the entire page component in a `` boundary (for example, using a [`loading.js` file](#with-loadingjs)) to show a loading state immediately.

Ensure your data source can resolve the first request quickly, as it blocks everything else. If you can't optimize the request further, consider [caching](https://nextjs.org/docs/app/getting-started/caching) the result if the data changes infrequently.

#### Parallel data fetching

Parallel data fetching happens when data requests in a route are eagerly initiated and start at the same time.

By default, [layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) are rendered in parallel. So each segment starts fetching data as soon as possible.

However, within _any_ component, multiple `async`/`await` requests can still be sequential if placed after the other. For example, `getAlbums` will be blocked until `getArtist` is resolved:

```tsx
import { getArtist, getAlbums } from '@/app/lib/data'

export default async function Page({ params }) {
  // These requests will be sequential
  const { username } = await params
  const artist = await getArtist(username)
  const albums = await getAlbums(username)
  return <div>{artist.name}</div>
}
```

Start multiple requests by calling `fetch`, then await them with [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all). Requests begin as soon as `fetch` is called.

```tsx
import Albums from './albums'

async function getArtist(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}`)
  return res.json()
}

async function getAlbums(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}/albums`)
  return res.json()
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  // Initiate requests
  const artistData = getArtist(username)
  const albumsData = getAlbums(username)

  const [artist, albums] = await Promise.all([artistData, albumsData])

  return (
    <>
      <h1>{artist.name}</h1>
      <Albums list={albums} />
    </>
  )
}
```

> **Good to know:** If one request fails when using `Promise.all`, the entire operation will fail. To handle this, you can use the [`Promise.allSettled`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) method instead.

#### Reusing data with `React.cache`

For data access that does not use `fetch`, such as an ORM or database query, wrap the function in [`React.cache`](https://react.dev/reference/react/cache). Multiple components can then call the function within the same request while sharing one result:

```ts
import { cache } from 'react'
import { db, eq, users } from '@/lib/db'

export const getUser = cache(async (id: string) => {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  })
})
```

Server Components can call `getUser()` directly:

```tsx
import { getUser } from '../lib/user'

export default async function DashboardPage() {
  const user = await getUser('1')

  if (!user) {
    return null
  }

  return <h1>Dashboard for {user.name}</h1>
}
```

Since `getUser` is wrapped with `React.cache`, calls with the same `id` within one request return the same memoized result.

> **Good to know:** [`React.cache`](https://react.dev/reference/react/cache#caveats) is scoped to the current request only. Each request gets its own memoization scope with no sharing between requests.

#### Preloading data

When a component renders after other blocking work, its data request starts late even if the request inputs are already available. Preloading starts the request earlier so it can run in parallel with that work and avoid a request waterfall.

To preload data, call the data-fetching function without `await` before blocking work, then call the same function in the component that consumes the result.

The data-fetching function must deduplicate matching calls so the component can reuse the request started during preloading. Use one of the following approaches:

- For `fetch`, [identical requests are memoized automatically](https://nextjs.org/docs/app/api-reference/functions/fetch#memoization).
- For an ORM or database, wrap the data-fetching function in [`React.cache`](#reusing-data-with-reactcache).
- With Cache Components, add [`'use cache'`](https://nextjs.org/docs/app/api-reference/directives/use-cache) to the data-fetching function. If the function reads request APIs such as `cookies()` or `headers()`, use [`'use cache: private'`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private).

In production, matching calls to a private Cache Function can reuse the same result within one request. This lets a component reuse a request started during preloading without storing the result in a server cache across requests.

Keep the preload function next to the component that consumes the data. This makes the dependency easier to find if you move or remove the component:

```tsx
async function getItem(id: string) {
  const res = await fetch(`https://api.example.com/items/${id}`)
  return res.json()
}

export const preload = (id: string) => {
  void getItem(id)
}

export default async function Item({ id }: { id: string }) {
  const item = await getItem(id)
  return <div>{item.name}</div>
}
```

Call `preload()` before another blocking request to start loading the item earlier:

```tsx
import Item, { preload } from './item'
import { checkIsAvailable } from '@/app/lib/data'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  preload(id)
  const isAvailable = await checkIsAvailable(id)

  return isAvailable ? <Item id={id} /> : null
}
```

The item request continues while `checkIsAvailable()` runs. If the page renders ``, the identical `fetch` call reuses the request that `preload()` started.

## Mutating Data

> **Source:** [Mutating Data](https://nextjs.org/docs/app/getting-started/mutating-data) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

You can mutate data in Next.js using [React Server Functions](https://react.dev/reference/rsc/server-functions). This page will go through how you can [create](#creating-server-functions) and [invoke](#invoking-server-functions) Server Functions. For Next.js-specific behaviors (single-roundtrip response, sequential dispatch, security, deployment), see [Server Actions and Mutations](https://nextjs.org/docs/app/guides/server-actions).

### What are Server Functions?

A **Server Function** is an asynchronous function that runs on the server. You can call them from the client through a network request, which is why they must be asynchronous.

In an `action` or mutation context, they are also called **Server Actions**.

By convention, a Server Action is an async function used with [`startTransition`](https://react.dev/reference/react/startTransition). This happens automatically when the function is:

- Passed to a `<form>` using the `action` prop.
- Passed to a `<button>` using the `formAction` prop.

When an action is invoked, Next.js can return both the updated UI and new data in a single server roundtrip.

Behind the scenes, actions use the `POST` method, and only this HTTP method can invoke them.

> **Warning:**
> Server Functions are reachable via direct POST requests, not just through your application's UI. Always verify authentication and authorization inside every Server Function. See the [Data Security guide](https://nextjs.org/docs/app/guides/data-security#authentication-and-authorization) for recommended patterns.

> **Good to know:** A Server Action is a Server Function used in a specific way (for handling form submissions and mutations). Server Function is the broader term.

### Creating Server Functions

A Server Function can be defined by using the [`use server`](https://react.dev/reference/rsc/use-server) directive. You can place the directive at the top of an **asynchronous** function to mark the function as a Server Function, or at the top of a separate file to mark all exports of that file.

```ts
import { auth } from '@/lib/auth'

export async function createPost(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title')
  const content = formData.get('content')

  // Mutate data
  // Revalidate cache
}

export async function deletePost(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const id = formData.get('id')

  // Verify the user owns this resource before deleting
  // Mutate data
  // Revalidate cache
}
```

#### Server Components

Server Functions can be inlined in Server Components by adding the `"use server"` directive to the top of the function body:

```tsx
export default function Page() {
  // Server Action
  async function createPost(formData: FormData) {
    'use server'
    // ...
  }

  return <></>
}
```

> **Good to know:** Server Components support progressive enhancement by default, meaning forms that call Server Actions will be submitted even if JavaScript hasn't loaded yet or is disabled.

#### Client Components

It's not possible to define Server Functions in Client Components. However, you can invoke them in Client Components by importing them from a file that has the `"use server"` directive at the top of it:

```ts
'use server'

export async function createPost() {}
```

```tsx
'use client'

import { createPost } from '@/app/actions'

export function Button() {
  return <button formAction={createPost}>Create</button>
}
```

> **Good to know:** In Client Components, forms invoking Server Actions will queue submissions if JavaScript isn't loaded yet, and will be prioritized for hydration. After hydration, the browser does not refresh on form submission.

#### Passing actions as props

You can also pass an action to a Client Component as a prop:

```jsx
<ClientComponent updateItemAction={updateItem} />
```

```tsx
'use client'

export default function ClientComponent({
  updateItemAction,
}: {
  updateItemAction: (formData: FormData) => void
}) {
  return <form action={updateItemAction}>{/* ... */}</form>
}
```

### Invoking Server Functions

There are two main ways you can invoke a Server Function:

1. [Forms](#forms) in Server and Client Components
2. [Event Handlers](#event-handlers) and [useEffect](#useeffect) in Client Components

> **Good to know:** Server Functions are designed for server-side mutations. The client currently dispatches and awaits them one at a time. This is an implementation detail and may change. If you need parallel data fetching, use [data fetching](https://nextjs.org/docs/app/getting-started/fetching-data#server-components) in Server Components, or perform parallel work inside a single Server Function or [Route Handler](https://nextjs.org/docs/app/guides/backend-for-frontend#manipulating-data).

#### Forms

React extends the HTML [`<form>`](https://react.dev/reference/react-dom/components/form) element to allow a Server Function to be invoked with the HTML `action` prop.

When invoked in a form, the function automatically receives the [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData/FormData) object. You can extract the data using the native [`FormData` methods](https://developer.mozilla.org/en-US/docs/Web/API/FormData#instance_methods):

```tsx
import { createPost } from '@/app/actions'

export function Form() {
  return (
    <form action={createPost}>
      <input type="text" name="title" />
      <input type="text" name="content" />
      <button type="submit">Create</button>
    </form>
  )
}
```

```ts
'use server'

import { auth } from '@/lib/auth'

export async function createPost(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title')
  const content = formData.get('content')

  // Mutate data
  // Revalidate cache
}
```

#### Event Handlers

You can invoke a Server Function in a Client Component by using event handlers such as `onClick`.

```tsx
'use client'

import { incrementLike } from './actions'
import { useState } from 'react'

export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes)

  return (
    <>
      <p>Total Likes: {likes}</p>
      <button
        onClick={async () => {
          const updatedLikes = await incrementLike()
          setLikes(updatedLikes)
        }}
      >
        Like
      </button>
    </>
  )
}
```

### Examples

#### Showing a pending state

While executing a Server Function, you can show a loading indicator with React's [`useActionState`](https://react.dev/reference/react/useActionState) hook. This hook returns a `pending` boolean:

```tsx
'use client'

import { useActionState, startTransition } from 'react'
import { createPost } from '@/app/actions'
import { LoadingSpinner } from '@/app/ui/loading-spinner'

export function Button() {
  const [state, action, pending] = useActionState(createPost, false)

  return (
    <button onClick={() => startTransition(action)}>
      {pending ? <LoadingSpinner /> : 'Create Post'}
    </button>
  )
}
```

See the [Building interactive apps](https://nextjs.org/docs/app/guides/interactive-apps) guide for a deeper walkthrough of responsive interactions, including pending feedback, optimistic UI, transitions, and error handling.

> **Good to know**: With the **experimental** [`useOffline`](https://nextjs.org/docs/app/guides/offline-support) config enabled, a Server Action interrupted by a connectivity drop stays pending and completes when the network returns.

#### Refresh data

After a mutation, you may want to refresh the current page to show the latest data. You can do this by calling [`refresh`](https://nextjs.org/docs/app/api-reference/functions/refresh) from `next/cache` in a Server Action:

```ts
'use server'

import { auth } from '@/lib/auth'
import { refresh } from 'next/cache'

export async function updatePost(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  // Mutate data
  // ...

  refresh()
}
```

This refreshes the client router, ensuring the UI reflects the latest state. The `refresh()` function does not revalidate tagged data. To revalidate tagged data, use [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag) or [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) instead.

#### Revalidate data

After performing a mutation, you can revalidate the Next.js cache and show the updated data by calling [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) or [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) within the Server Function:

```ts
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  // Mutate data
  // ...

  revalidatePath('/posts')
}
```

#### Redirect after a mutation

You may want to redirect the user to a different page after a mutation. You can do this by calling [`redirect`](https://nextjs.org/docs/app/api-reference/functions/redirect) within the Server Function.

```ts
'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  // Mutate data
  // ...

  revalidatePath('/posts')
  redirect('/posts')
}
```

Calling `redirect` [throws](https://nextjs.org/docs/app/api-reference/functions/redirect#behavior) a framework handled control-flow exception. Any code after it won't execute. If you need fresh data, call [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) or [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) beforehand.

#### Cookies

You can `get`, `set`, and `delete` cookies inside a Server Action using the [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies) API.

When you [set or delete](https://nextjs.org/docs/app/api-reference/functions/cookies#understanding-cookie-behavior-in-server-functions) a cookie in a Server Action, Next.js re-renders the current page and its layouts on the server so the **UI reflects the new cookie value**.

> **Good to know**: The server update applies to the current React tree, re-rendering, mounting, or unmounting components, as needed. Client state is preserved for re-rendered components, and effects re-run if their dependencies changed.

```ts
'use server'

import { cookies } from 'next/headers'

export async function exampleAction() {
  const cookieStore = await cookies()

  // Get cookie
  cookieStore.get('name')?.value

  // Set cookie
  cookieStore.set('name', 'Delba')

  // Delete cookie
  cookieStore.delete('name')
}
```

#### useEffect

You can use the React [`useEffect`](https://react.dev/reference/react/useEffect) hook to invoke a Server Action when the component mounts or a dependency changes. This is useful for mutations that depend on global events or need to be triggered automatically. For example, `onKeyDown` for app shortcuts, an intersection observer hook for infinite scrolling, or when the component mounts to update a view count:

```tsx
'use client'

import { incrementViews } from './actions'
import { useState, useEffect, useTransition } from 'react'

export default function ViewCount({ initialViews }: { initialViews: number }) {
  const [views, setViews] = useState(initialViews)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const updatedViews = await incrementViews()
      setViews(updatedViews)
    })
  }, [])

  // You can use `isPending` to give users feedback
  return <p>Total Views: {views}</p>
}
```

## Caching

> **Source:** [Caching](https://nextjs.org/docs/app/getting-started/caching) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

> This page covers caching with [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents), enabled by setting [`cacheComponents: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) in your `next.config.ts` file. If you're not using Cache Components, see the [Caching and Revalidating (Previous Model)](https://nextjs.org/docs/app/guides/caching-without-cache-components) guide.

Caching is a technique for storing the result of data fetching and other computations so that future requests for the same data can be served faster, without doing the work again.

### Enabling Cache Components

New App Router apps created with the recommended [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) defaults already have Cache Components and Partial Prefetching enabled.

To enable it in an existing or manually created app, add the [`cacheComponents`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) and [`partialPrefetching`](https://nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching) options to your Next config file:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
}

export default nextConfig
```

Set `partialPrefetching` explicitly. Leaving it unset logs a warning, because the first release of Cache Components did not include Partial Prefetching. Set it to `false` only while [migrating an app that adopted Cache Components before Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching). Both features will be enabled everywhere in the next major release, and the options will be removed.

> **Good to know:** When Cache Components is enabled, `GET` Route Handlers follow the same prerendering model as pages. See [Route Handlers with Cache Components](https://nextjs.org/docs/app/getting-started/route-handlers#with-cache-components) for details.

### Usage

The [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) directive caches the return value of async functions and components. You can apply it at two levels:

- **Data-level**: Cache a function that fetches or computes data (e.g., `getProducts()`, `getUser(id)`)
- **UI-level**: Cache an entire component or page (e.g., `async function BlogPosts()`)

A cache directive gives a result a lifetime, which Next.js uses for time-based revalidation and rendering optimizations. For on-demand revalidation after a mutation, see [Revalidating](https://nextjs.org/docs/app/getting-started/revalidating). See [Prerendering](#prerendering) for how cached results become part of the static shell and may be included in a [prefetch](#prefetching).

> **Good to know:** We recommend pairing every cache directive with a [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife). Without one, the implicit `default` profile applies.

Arguments and any values captured from parent scopes automatically become part of the [cache key](https://nextjs.org/docs/app/api-reference/directives/use-cache#cache-keys), which means different inputs will produce separate cache entries. See [cache output](https://nextjs.org/docs/app/api-reference/directives/use-cache#cache-output) for what an entry holds, and [serialization requirements and constraints](https://nextjs.org/docs/app/api-reference/directives/use-cache#constraints) for details on what can be cached and how arguments work.

#### Data-level caching

To cache an asynchronous function that fetches data, add the `use cache` directive at the top of the function body:

```tsx
import { cacheLife } from 'next/cache'

export async function getUsers() {
  'use cache'
  cacheLife('hours')
  return db.query('SELECT * FROM users')
}
```

Data-level caching is useful when the same data is used across multiple components, or when you want to cache the data independently from the UI.

#### UI-level caching

To cache an entire component, page, or layout, add the `use cache` directive at the top of the component or page body:

```tsx
import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife('hours')

  const users = await db.query('SELECT * FROM users')

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

> If you add "`use cache`" at the top of a file, all exported functions in the file will be cached.

#### Streaming uncached data

For components that fetch data from an asynchronous source such as an API, a database, or any other async operation, and require fresh data on every request, do not use `"use cache"`.

Instead, wrap the component in [``](https://react.dev/reference/react/Suspense) and provide a fallback UI. The fallback ships with the prerendered shell while the async work runs at request time.

```tsx
import { Suspense } from 'react'

async function LatestPosts() {
  const data = await fetch('https://api.example.com/posts')
  const posts = await data.json()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}

export default function Page() {
  return (
    <>
      <h1>My Blog</h1>
      <Suspense fallback={<p>Loading posts...</p>}>
        <LatestPosts />
      </Suspense>
    </>
  )
}
```

For example, `<p>Loading posts...</p>` is included in the static shell, and the posts stream in at request time.

Without a `` boundary around the uncached read, the dev overlay surfaces the **blocking-route** insight with this fix:

  <FixCard
    group="stream"
    title="Wrap in or move into Suspense"
    href="/docs/messages/blocking-prerender-dynamic#wrap-in-or-move-into-suspense"
    snippets={[
      { text: '', highlight: true },
      { text: '  ' },
      { text: '', highlight: true },
    ]}
  />

> **Good to know:** Each fix card links to a detailed walkthrough with patterns, code samples, and trade-offs. Click a card to dive in.

`` provides a fallback UI while async work completes, but it does not itself opt a component into dynamic rendering. If a component only performs synchronous work, it will complete during prerendering regardless of whether it is wrapped in ``.

### Working with runtime APIs

Runtime APIs require information that is only available when a user makes a request. These include:

- [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies) - User's cookie data
- [`headers`](https://nextjs.org/docs/app/api-reference/functions/headers) - Request headers
- [`searchParams`](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional) - URL query parameters
- [`params`](https://nextjs.org/docs/app/api-reference/file-conventions/page#params-optional) - Dynamic route parameters. Use [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) to prerender specific values at build time, or [ISR with Cache Components](https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components) to serve an [App Shell](https://nextjs.org/docs/app/glossary#app-shell) while unknown params resolve in the background.

Components that access runtime APIs should be wrapped in ``:

```tsx
import { cookies } from 'next/headers'
import { Suspense } from 'react'

async function UserGreeting() {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'light'
  return <p>Your theme: {theme}</p>
}

export default function Page() {
  return (
    <>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <UserGreeting />
      </Suspense>
    </>
  )
}
```

A runtime API access without `` surfaces the same **blocking-route** insight in the dev overlay, with the same fix:

  <FixCard
    group="stream"
    title="Wrap in or move into Suspense"
    href="/docs/messages/blocking-prerender-dynamic#wrap-in-or-move-into-suspense"
    snippets={[
      { text: '', highlight: true },
      { text: '  ' },
      { text: '', highlight: true },
    ]}
  />

Runtime-dependent data can still be given a cache lifetime with [`"use cache: private"`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private), another variant that ships with Cache Components. It gives a lifetime to a function that reads cookies, headers, or `searchParams` directly, so it can be included in a [prefetch](#prefetching).

The following section shows an alternative to `use cache: private`: extracting a runtime value and passing it to a shared cached function.

#### Passing runtime values to cached functions

You can extract values from runtime APIs and pass them as arguments to cached functions:

```tsx
import { cookies } from 'next/headers'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  )
}

// Component (not cached) reads runtime data
async function ProfileContent() {
  const session = (await cookies()).get('session')?.value
  return <CachedContent sessionId={session} />
}

// Cached component receives extracted value as a prop
async function CachedContent({ sessionId }: { sessionId: string }) {
  'use cache'
  // sessionId becomes part of the cache key
  const data = await fetchUserData(sessionId)
  return <div>{data}</div>
}
```

At request time, `` executes if no matching cache entry is found, and stores the result for future requests with the same `sessionId`.

> **Good to know:** Because `` is gated behind request data, it isn't added to the prerendered static shell. At runtime it's cached [in-memory](https://nextjs.org/docs/app/api-reference/directives/use-cache#runtime-caching-considerations) by default, which doesn't persist across serverless requests, so it may re-evaluate on each request. Reach for [`'use cache: remote'`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote) for durable, shared caching.

With this pattern, [prefetching](#prefetching) can prerender `` with the user's actual session during a client transition and have the result ready before the click. This works even when server-side entries rarely survive between requests, because the lifetime you assign is what lets the result join the prefetch, where the client treats it as fresh for its [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) `stale` window.

### Static, cached, and streaming

Here's a complete example showing static content, cached dynamic content, and streaming dynamic content working together on a single page:

```tsx
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'

export default function BlogPage() {
  return (
    <>
      {/* Static content - prerendered automatically */}
      <header>
        <h1>Our Blog</h1>
        <nav>
          <Link href="/">Home</Link> | <Link href="/about">About</Link>
        </nav>
      </header>

      {/* Cached dynamic content - included in the static shell */}
      <BlogPosts />

      {/* Runtime dynamic content - streams at request time */}
      <Suspense fallback={<p>Loading your preferences...</p>}>
        <UserPreferences />
      </Suspense>
    </>
  )
}

type Post = { id: string; title: string; author: string; date: string }

// Everyone sees the same blog posts (revalidated every hour)
async function BlogPosts() {
  'use cache'
  cacheLife('hours')
  cacheTag('posts')

  const res = await fetch('https://api.vercel.app/blog')
  const posts: Post[] = await res.json()

  return (
    <section>
      <h2>Latest Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>
              By {post.author} on {post.date}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// UI that depends on a value stored in cookies
async function UserPreferences() {
  const theme = (await cookies()).get('theme')?.value || 'light'
  const favoriteCategory = (await cookies()).get('category')?.value

  return (
    <aside>
      <p>Your theme: {theme}</p>
      {favoriteCategory && <p>Favorite category: {favoriteCategory}</p>}
    </aside>
  )
}
```

During prerendering, the header (static) and blog posts (cached with `use cache`) become part of the static shell, along with the fallback UI for user preferences. The UI preferences stored in cookies stream in at request time.

Reading `cookies()` here doesn't opt-in the whole route into dynamic rendering, the way the previous rendering model did. The Suspense boundary provides fallback UI where the runtime access streams, while static and cached content still ship in the initial HTML.

Just as `` contains async access, an **error boundary** contains failures: wrap them around a subtree that might error during rendering. Use [`catchError`](https://nextjs.org/docs/app/api-reference/functions/catchError) for component-level boundaries, or the [`error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error) file convention for route-level boundaries.

As you build, consider that inside [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#with-cache-components) and [`generateViewport`](https://nextjs.org/docs/app/api-reference/functions/generate-viewport#with-cache-components), uncached fetches or runtime data access surface the same insights and errors as in your page, guiding you to the rendering you intend. For incremental static regeneration with both known and unknown param values, see [ISR with Cache Components](https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components).

### Random values and timestamps

Operations like `Math.random()`, `Date.now()`, or `crypto.randomUUID()` produce different values each time they execute. Cache Components requires you to explicitly handle these.

> **Good to know:** `performance.now()` is meant for telemetry, so Next.js doesn't treat it as a value to guard. Use it for timing and pass the result to your logger or metrics rather than rendering it.

**To generate unique values per request**, defer to request time by calling [`connection()`](https://nextjs.org/docs/app/api-reference/functions/connection) before these operations, and wrap the component in ``:

```tsx
import { connection } from 'next/server'
import { Suspense } from 'react'

async function UniqueContent() {
  await connection()
  const uuid = crypto.randomUUID()
  return <p>Request ID: {uuid}</p>
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <UniqueContent />
    </Suspense>
  )
}
```

Alternatively, you can **cache the result** so all users see the same value until revalidation:

```tsx
export default async function Page() {
  'use cache'
  const buildId = crypto.randomUUID()
  return <p>Build ID: {buildId}</p>
}
```

You don't need to memorize which operations behave this way. The dev overlay surfaces a **blocking-prerender-random**, **blocking-prerender-current-time**, or **blocking-prerender-crypto** insight (depending on the call) with these fixes:

### Predictable values

Unlike random values and timestamps, which can vary between renders, module imports, synchronous I/O, and pure computations produce the same result every time they run. Components using only these operations are prerendered automatically, and their output becomes part of the static HTML at build time.

```tsx
import fs from 'node:fs'

export default async function Page() {
  const constants = await import('./constants.json')
  const content = fs.readFileSync('./config.json', 'utf-8')
  const items = JSON.parse(content).items ?? []

  return (
    <div>
      <h1>{constants.appName}</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.value}</li>
        ))}
      </ul>
    </div>
  )
}
```

> **Good to know:** This includes queries to embedded databases with synchronous APIs, such as `better-sqlite3` or Node.js's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html). If you need per-request data from a synchronous source, call [`connection()`](https://nextjs.org/docs/app/api-reference/functions/connection) before the query.

Some asynchronous APIs read local resources that don't depend on the incoming request, such as fonts or configuration files. When those resources are expected to be the same for every request, read them once at module scope instead of during rendering

If the data should instead be computed during rendering and reused across requests, wrap the read in [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache). If the data depends on the incoming request or is expected to change over time, read it during request-time rendering.

```tsx
import { readFile } from 'node:fs/promises'

const content = await readFile('./config.json', 'utf-8')
const items = JSON.parse(content).items ?? []

export default function Page() {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.value}</li>
      ))}
    </ul>
  )
}
```

In this example, the configuration file is expected to be the same for every request, so it is read once at module scope. Calling `await readFile()` inside the component would be treated as uncached data that must be either accessed within `use cache` or behind a `` boundary. Since this file does not depend on the request and is not expected to change, module scope is the simplest option.

### Prerendering

At build time, Next.js renders your route's component tree. How each component is handled depends on the APIs it uses:

- [`use cache`](#usage): the result is cached and included in the static shell, as long as its lifetime [isn't too short](https://nextjs.org/docs/app/api-reference/functions/cacheLife#prerendering-behavior)
- [``](#streaming-uncached-data): fallback UI is included in the static shell while the content streams at request time
- [Predictable values](#predictable-values): module imports, `fs.readFileSync`, and pure computations complete during prerender and are included in the static shell automatically
- [Random values and timestamps](#random-values-and-timestamps): use `connection()` + `` to get a unique value per request, or `use cache` to share one across users

This generates a static shell consisting of HTML for initial page loads and a serialized [RSC Payload](https://nextjs.org/docs/app/getting-started/server-and-client-components#on-the-server) for client-side navigation, ensuring the browser receives fully rendered content instantly whether users navigate directly to the URL or transition from another page. This rendering approach is called **Partial Prerendering (PPR)**, the default behavior with Cache Components.

![Partially re-rendered Product Page showing static nav and product information, and dynamic cart and recommended products](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/learn/dark/thinking-in-ppr.png)

Every produced static shell can be served directly from a CDN, without going through to the upstream server. This makes direct navigations [instant](#instant-navigation).

What ends up in a route's static shell depends on what's known at build time. When a route's [dynamic params](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) are known, the shell contains that concrete content, and any remaining uncached or runtime data still streams behind its `` fallback. When the params aren't known, the reusable, URL-independent version is the [**App Shell**](https://nextjs.org/docs/app/glossary#app-shell): the same static shell with the param-specific parts left behind their fallbacks. [Incremental Static Regeneration](#incremental-static-regeneration) fills in the concrete versions after the first visit.

Next.js requires you to explicitly handle components that can't complete during prerendering. It surfaces a validation insight in the dev overlay and dev server console that names the route and points at fixes (cache the access, move it into a `` boundary, or opt the route out). This validation keeps every route producing a static shell, so direct navigations stay instant.

![Diagram showing partially rendered page on the client, with loading UI for chunks that are being streamed.](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/server-rendering-with-streaming.png)

> **🎥 Watch:** Why Partial Prerendering and how it works → [YouTube (10 minutes)](https://www.youtube.com/watch?v=MTcPrTIBkpA).

#### Maximizing the static shell

The deeper your async work sits in the tree, the more of the page can be prerendered. This is the structural pattern Cache Components rewards: a general practice worth applying everywhere, and the foundation for the instant navigation and prefetching that follow. It applies to all [runtime APIs](#working-with-runtime-apis) and async operations like data fetches.

Consider a layout that destructures `params` at the top level:

```tsx
export default async function Layout({
  children,
  params,
}: LayoutProps<'/shop/[slug]'>) {
  const { slug } = await params

  return (
    <div>
      <Sidebar />
      <h1>{slug}</h1>
      {children}
    </div>
  )
}
```

If this param is dynamic (not provided by [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)), it is runtime data and the layout cannot be prerendered.

However, it is often possible to read the parameter value further down the tree. Instead of awaiting at the layout level, pass the params promise down and await there:

```tsx
import { Suspense } from 'react'

// Not async: this layout never awaits params
export default function Layout({
  children,
  params,
}: LayoutProps<'/shop/[slug]'>) {
  return (
    <div>
      <Sidebar />
      <Suspense fallback={<h1>Loading...</h1>}>
        {/* await happens inside the boundary, so the shell still renders */}
        {params.then(({ slug }) => (
          <SlugHeading slug={slug} />
        ))}
      </Suspense>
      {children}
    </div>
  )
}

function SlugHeading({ slug }: { slug: string }) {
  return <h1>{slug}</h1>
}
```

Now ``, `{children}`, and the Suspense fallback are all part of the static shell. Only `SlugHeading` streams in at request time. You can also pass the entire `params` promise and await it in the child component.

The same principle applies to `cookies()`, `headers()`, `searchParams`, and data fetches. See [Reusing data with `React.cache`](https://nextjs.org/docs/app/getting-started/fetching-data#reusing-data-with-reactcache) for a related pattern.

For a complete workflow, see [Optimizing the static shell](https://nextjs.org/docs/app/guides/optimizing-the-static-shell).

#### Instant navigation

Cache Components shipped in 16.0.0 with verification that direct visits to a route produce a static shell. Client navigations are different: a `` boundary that covers a direct visit may not be part of the render during a transition. Getting that structure right is easier when the framework steps in. Cache Components now validates these navigations too, giving you insights and errors that guide you to make navigations to your route instant. For example, wrap data in ``, cache it with `use cache`, or move where the access happens.

Read the [Instant navigation guide](https://nextjs.org/docs/app/guides/instant-navigation) for examples and inspection tools.

#### Prefetching

With [Partial Prefetching](https://nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching) enabled, the router prefetches each route's [App Shell](https://nextjs.org/docs/app/glossary#app-shell) by default. The App Shell includes static content and session data derived from `cookies()` and `headers()`. To also prefetch cached content that depends on a link's **URL data**, such as `searchParams` or dynamic `params`, set `prefetch={true}` on that link.

With [``](https://nextjs.org/docs/app/api-reference/components/link#prefetch) pointing at a [Partial Prefetching](https://nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching) route, Next.js renders that route's component tree again at prefetch time, this time with the destination URL resolved. The same rules apply, but more of the tree resolves now that its `searchParams` and `params` are in scope:

- [`use cache`](#usage) called with values extracted from runtime APIs (passed as arguments) joins the per-link prefetch
- [`use cache: private`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private) executes on the server, reads runtime data directly, and caches the result in the browser as part of the per-link prefetch
- [``](#streaming-uncached-data) fallbacks stay in the prefetched UI while uncached content streams at request time

This per-link prefetch includes cached content that resolves after the destination URL is known. It costs a server invocation per prefetchable link.

For example, take a search page that reads `searchParams` from the URL:

```tsx
import { Suspense } from 'react'

export default function SearchPage(props: PageProps<'/search'>) {
  return (
    <Suspense fallback={<p>Loading results...</p>}>
      <Results searchParams={props.searchParams} />
    </Suspense>
  )
}

async function Results({
  searchParams,
}: Pick<PageProps<'/search'>, 'searchParams'>) {
  const { q } = await searchParams
  const results = await search(q)
  return (
    <ul>
      {results.map((result) => (
        <li key={result.id}>{result.title}</li>
      ))}
    </ul>
  )
}

async function search(query: string | string[] | undefined) {
  'use cache'
  return db.search(query)
}
```

On a direct visit, `` streams in behind the fallback.

When a [``](https://nextjs.org/docs/app/api-reference/components/link) to `/search?q=shoes` is prefetched, the framework resolves `searchParams` from the link's URL, so the cached `search` result is included in the runtime prerender before the click. The browser then reuses it until its [`stale`](https://nextjs.org/docs/app/api-reference/functions/cacheLife#stale) time passes or the `searchParams` change.

See [Adopting Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching) to understand how `` prefetching behaves and how to adopt it.

See the [Optimizing prefetching guide](https://nextjs.org/docs/app/guides/optimizing-prefetching) for full patterns and the [`prefetch` reference](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/prefetch) for all modes.

### Where cached content is stored

A cached function's output is serialized into an **RSC payload**, at build time or at runtime. This payload is what everything else works from. Next.js renders it into HTML, keeps it in a server or remote store, or sends it to the browser, and [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) sets how long each copy stays fresh:

- **Prerendered HTML.** The payload is rendered to HTML and stored on disk when self-hosting, or in your platform's durable storage behind a CDN. That HTML is the [static shell](#prerendering) at build time and the concrete page after an [ISR](#incremental-static-regeneration) upgrade, with [`revalidate`](https://nextjs.org/docs/app/api-reference/functions/cacheLife#revalidate) and [`expire`](https://nextjs.org/docs/app/api-reference/functions/cacheLife#expire) controlling when it's rebuilt.
- **Shared store.** By default the result stays in a per-instance, in-memory store that is ephemeral on serverless. [`use cache: remote`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote) moves it to a durable [cache handler](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers) shared across instances, a network roundtrip that pays off only at a **high hit rate**.
- **Browser.** The payload is included in the RSC sent for a client navigation or [prefetch](#prefetching), where the browser keeps it fresh for its [`stale`](https://nextjs.org/docs/app/api-reference/functions/cacheLife#stale) window. [`use cache: private`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private) results live only here.

> **Good to know:** An [App Shell](https://nextjs.org/docs/app/glossary#app-shell) that reads `cookies()` or `headers()` is session-specific, cached per session on the client rather than in the shared server cache.

All of these stores are scoped to a single deployment. A new deploy starts fresh, new prerenders are built, and `use cache` entries don't carry over, even durable [`remote`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote) ones, because the [cache key](https://nextjs.org/docs/app/api-reference/directives/use-cache#cache-keys) includes the build id. See [Runtime caching considerations](https://nextjs.org/docs/app/api-reference/directives/use-cache#runtime-caching-considerations) for per-environment behavior and [Self-hosting](https://nextjs.org/docs/app/guides/self-hosting#caching-and-isr) for configuring the server cache.

### Incremental Static Regeneration

In a route with dynamic param segments, [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) prerenders the URLs you list at build time. Any other URL is served the [App Shell](https://nextjs.org/docs/app/glossary#app-shell) instantly, then upgraded in the background with its now-known params and cached for the next visitor.

See [ISR with Cache Components](https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components) for the full walkthrough.

### Bots and crawlers

With [Partial Prerendering](#prerendering), metadata can be dynamic while the rest of the page is prerendered into a static shell. The shell is served immediately and the metadata streams in after. Some bots and crawlers cannot handle this, and need to see the metadata included in the `<head>` tag of the document. Next.js detects them by their user agent, skips the static shell, and renders the page dynamically at request time.

Data sources available during the build-time prerender have to be available at request time too. Otherwise the render may throw, and these bots receive a 500 error. See [Bots and crawlers](https://nextjs.org/docs/app/guides/streaming#bots-and-crawlers) in the Streaming guide for which user agents this covers and how to change the list.

## Revalidating

> **Source:** [Revalidating](https://nextjs.org/docs/app/getting-started/revalidating) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

> This page covers revalidation with [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents), enabled by setting [`cacheComponents: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) in your `next.config.ts` file. If you're not using Cache Components, see the [Caching and Revalidating (Previous Model)](https://nextjs.org/docs/app/guides/caching-without-cache-components) guide.

Revalidation is the process of updating cached data. It lets you keep serving fast, cached responses while ensuring content stays fresh. There are two strategies:

- **Time-based revalidation**: Automatically refresh cached data after a set duration using [`cacheLife`](#cachelife).
- **On-demand revalidation**: Manually invalidate cached data after a mutation using [`revalidateTag`](#revalidatetag), [`updateTag`](#updatetag), or [`revalidatePath`](#revalidatepath).

### `cacheLife`

[`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) controls how long cached data remains valid. Use it inside a [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) scope to set the cache lifetime.

```tsx
import { cacheLife } from 'next/cache'

export async function getProducts() {
  'use cache'
  cacheLife('hours')
  return db.query('SELECT * FROM products')
}
```

`cacheLife` accepts a profile name or a custom configuration object:

| Profile   | `stale` | `revalidate` | `expire` |
| --------- | ------- | ------------ | -------- |
| `default` | 5m      | 15m          | never    |
| `seconds` | 30s     | 1s           | 60s      |
| `minutes` | 5m      | 1m           | 1h       |
| `hours`   | 5m      | 1h           | 1d       |
| `days`    | 5m      | 1d           | 1w       |
| `weeks`   | 5m      | 1w           | 30d      |
| `max`     | 5m      | 30d          | 1y       |

For fine-grained control, pass an object:

```tsx
'use cache'
cacheLife({
  stale: 3600, // 1 hour until considered stale
  revalidate: 7200, // 2 hours until revalidated
  expire: 86400, // 1 day until expired
})
```

> **Good to know:** A cache is considered "short-lived" when it uses the `seconds` profile, `revalidate: 0`, or `expire` under 5 minutes. Short-lived caches are automatically excluded from prerenders and become dynamic holes instead. See [Prerendering behavior](https://nextjs.org/docs/app/api-reference/functions/cacheLife#prerendering-behavior) for details.

See the [`cacheLife` API reference](https://nextjs.org/docs/app/api-reference/functions/cacheLife) for all profiles and custom configuration options.

### `cacheTag`

[`cacheTag`](https://nextjs.org/docs/app/api-reference/functions/cacheTag) lets you tag cached data so it can be invalidated on-demand. Use it inside a [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) scope:

```tsx
import { cacheTag } from 'next/cache'

export async function getProducts() {
  'use cache'
  cacheTag('products')
  return db.query('SELECT * FROM products')
}
```

Once tagged, invalidate the cache using [`revalidateTag`](#revalidatetag) or [`updateTag`](#updatetag).

See the [`cacheTag` API reference](https://nextjs.org/docs/app/api-reference/functions/cacheTag) to learn more.

### `revalidateTag`

`revalidateTag` invalidates cache entries by tag using stale-while-revalidate semantics — stale content is served immediately while fresh content loads in the background. This is ideal for content where a slight delay in updates is acceptable, like blog posts or product catalogs.

```tsx
import { revalidateTag } from 'next/cache'

export async function updateUser(id: string) {
  // Mutate data
  revalidateTag('user', 'max') // Recommended: stale-while-revalidate
}
```

You can reuse the same tag in multiple functions to revalidate them all at once. Call `revalidateTag` in a [Server Action](https://nextjs.org/docs/app/getting-started/mutating-data) or [Route Handler](https://nextjs.org/docs/app/api-reference/file-conventions/route).

> **Good to know:** The second argument sets how long stale content can be served while fresh content generates in the background. Once it expires, subsequent requests block until fresh content is ready. Using `'max'` gives the longest stale window.

See the [`revalidateTag` API reference](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) to learn more.

### `updateTag`

`updateTag` immediately expires cached data for read-your-own-writes scenarios — the user sees their change right away instead of stale content. Unlike `revalidateTag`, it can only be used in [Server Actions](https://nextjs.org/docs/app/guides/server-actions).

```tsx
import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const post = await db.post.create({
    data: {
      title: formData.get('title'),
      content: formData.get('content'),
    },
  })

  updateTag('posts')
  redirect(`/posts/${post.id}`)
}
```

|              | `updateTag`                                   | `revalidateTag`                      |
| ------------ | --------------------------------------------- | ------------------------------------ |
| **Where**    | Server Actions only                           | Server Actions and Route Handlers    |
| **Behavior** | Immediately expires cache                     | Stale-while-revalidate               |
| **Use case** | Read-your-own-writes (user sees their change) | Background refresh (slight delay OK) |

See the [`updateTag` API reference](https://nextjs.org/docs/app/api-reference/functions/updateTag) to learn more.

### `revalidatePath`

`revalidatePath` invalidates all cached data for a specific route path. Use it when you want to revalidate a route without knowing which tags are associated with it.

```tsx
import { revalidatePath } from 'next/cache'

export async function updateUser(id: string) {
  // Mutate data
  revalidatePath('/profile')
}
```

> **Good to know**: Prefer tag-based revalidation (`revalidateTag`/`updateTag`) over path-based when possible — it's more precise and avoids over-invalidating.

See the [`revalidatePath` API reference](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) to learn more.

### What should I cache?

Cache data that doesn't depend on [runtime data](https://nextjs.org/docs/app/getting-started/caching#working-with-runtime-apis) and that you're OK serving from cache for a period of time. Use `use cache` with `cacheLife` to describe that behavior.

When content doesn't need time-based revalidation, for example data from a CMS, use [`cacheTag`](#cachetag) and a long [`cacheLife`](#cachelife) like `max` to keep it in the static shell. Configure the content source to trigger a webhook, or other notification, that calls [`revalidateTag`](#revalidatetag) when the content changes. This reduces unnecessary time-based revalidation for content that hasn't changed.

> **Good to know:** In serverless environments, in-memory cache entries may not persist across revalidations. See [runtime caching considerations](https://nextjs.org/docs/app/api-reference/directives/use-cache#runtime-caching-considerations) for details.

## Error Handling

> **Source:** [Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

Errors can be divided into two categories: [expected errors](#handling-expected-errors) and [uncaught exceptions](#handling-uncaught-exceptions). This page will walk you through how you can handle these errors in your Next.js application.

### Handling expected errors

Expected errors are those that can occur during the normal operation of the application, such as those from [server-side form validation](https://nextjs.org/docs/app/guides/forms) or failed requests. These errors should be handled explicitly and returned to the client.

#### Server Functions

You can use the [`useActionState`](https://react.dev/reference/react/useActionState) hook to handle expected errors in [Server Functions](https://react.dev/reference/rsc/server-functions).

For these errors, avoid using `try`/`catch` blocks and throw errors. Instead, model expected errors as return values.

```ts
'use server'

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get('title')
  const content = formData.get('content')

  const res = await fetch('https://api.vercel.app/posts', {
    method: 'POST',
    body: { title, content },
  })
  const json = await res.json()

  if (!res.ok) {
    return { message: 'Failed to create post' }
  }
}
```

You can pass your action to the `useActionState` hook and use the returned `state` to display an error message.

```tsx
'use client'

import { useActionState } from 'react'
import { createPost } from '@/app/actions'

const initialState = {
  message: '',
}

export function Form() {
  const [state, formAction, pending] = useActionState(createPost, initialState)

  return (
    <form action={formAction}>
      <label htmlFor="title">Title</label>
      <input type="text" id="title" name="title" required />
      <label htmlFor="content">Content</label>
      <textarea id="content" name="content" required />
      {state?.message && <p aria-live="polite">{state.message}</p>}
      <button disabled={pending}>Create Post</button>
    </form>
  )
}
```

#### Server Components

When fetching data inside of a Server Component, you can use the response to conditionally render an error message or [`redirect`](https://nextjs.org/docs/app/api-reference/functions/redirect).

```tsx
export default async function Page() {
  const res = await fetch(`https://...`)
  const data = await res.json()

  if (!res.ok) {
    return 'There was an error.'
  }

  return '...'
}
```

#### Not found

You can call the [`notFound`](https://nextjs.org/docs/app/api-reference/functions/not-found) function within a route segment and use the [`not-found.js`](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) file to show a 404 UI.

```tsx
import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/posts'

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return <div>{post.title}</div>
}
```

```tsx
export default function NotFound() {
  return <div>404 - Page Not Found</div>
}
```

### Handling uncaught exceptions

Uncaught exceptions are unexpected errors that indicate bugs or issues that should not occur during the normal flow of your application. These should be handled by throwing errors, which will then be caught by error boundaries.

#### Nested error boundaries

Next.js uses error boundaries to handle uncaught exceptions. Error boundaries catch errors in their child components and display a fallback UI instead of the component tree that crashed.

Create an error boundary by adding an [`error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error) file inside a route segment and exporting a React component:

```tsx
'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by re-fetching and re-rendering the segment
          () => retry()
        }
      >
        Try again
      </button>
    </div>
  )
}
```

Errors will bubble up to the nearest parent error boundary. This allows for granular error handling by placing `error.tsx` files at different levels in the [route hierarchy](https://nextjs.org/docs/app/getting-started/project-structure#component-hierarchy).

![Nested Error Component Hierarchy](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/nested-error-component-hierarchy.png)

For component-level error recovery, the [`catchError`](https://nextjs.org/docs/app/api-reference/functions/catchError) function lets you create error boundaries that can wrap any part of your component tree:

```tsx
'use client'

import { catchError, type ErrorInfo } from 'next/error'

function ErrorFallback(props: { title: string }, { error, retry }: ErrorInfo) {
  return (
    <div>
      <h2>{props.title}</h2>
      <p>{error.message}</p>
      <button onClick={() => retry()}>Try again</button>
    </div>
  )
}

export default catchError(ErrorFallback)
```

Then use the returned component as a wrapper in any layout or page:

```tsx
import ErrorBoundary from './custom-error-boundary'

export default function Component({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary title="Dashboard Error">{children}</ErrorBoundary>
}
```

Error boundaries don't catch errors inside event handlers. They're designed to catch errors [during rendering](https://react.dev/reference/react/Component#static-getderivedstatefromerror) to show a **fallback UI** instead of crashing the whole app.

In general, errors in event handlers or async code aren’t handled by error boundaries because they run after rendering.

To handle these cases, catch the error manually and store it using `useState` or `useReducer`, then update the UI to inform the user.

```tsx
'use client'

import { useState } from 'react'

export function Button() {
  const [error, setError] = useState(null)

  const handleClick = () => {
    try {
      // do some work that might fail
      throw new Error('Exception')
    } catch (reason) {
      setError(reason)
    }
  }

  if (error) {
    /* render fallback UI */
  }

  return (
    <button type="button" onClick={handleClick}>
      Click me
    </button>
  )
}
```

Note that unhandled errors inside `startTransition` from `useTransition`, will bubble up to the nearest error boundary.

```tsx
'use client'

import { useTransition } from 'react'

export function Button() {
  const [pending, startTransition] = useTransition()

  const handleClick = () =>
    startTransition(() => {
      throw new Error('Exception')
    })

  return (
    <button type="button" onClick={handleClick}>
      Click me
    </button>
  )
}
```

#### Global errors

While less common, you can handle errors in the root layout using the [`global-error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error) file, located in the root app directory, even when leveraging [internationalization](https://nextjs.org/docs/app/guides/internationalization). Global error UI must define its own `<html>` and `<body>` tags, since it is replacing the root layout or template when active.

```tsx
'use client' // Error boundaries must be Client Components

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => retry()}>Try again</button>
      </body>
    </html>
  )
}
```

## CSS

> **Source:** [CSS](https://nextjs.org/docs/app/getting-started/css) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

Next.js provides several ways to style your application using CSS, including:

- [Tailwind CSS](#tailwind-css)
- [CSS Modules](#css-modules)
- [Global CSS](#global-css)
- [External Stylesheets](#external-stylesheets)
- [Sass](https://nextjs.org/docs/app/guides/sass)
- [CSS-in-JS](https://nextjs.org/docs/app/guides/css-in-js)

### Tailwind CSS

[Tailwind CSS](https://tailwindcss.com/) is a utility-first CSS framework that provides low-level utility classes to build custom designs.

Install Tailwind CSS:

```bash
pnpm add -D tailwindcss @tailwindcss/postcss
```

```bash
npm install -D tailwindcss @tailwindcss/postcss
```

```bash
yarn add -D tailwindcss @tailwindcss/postcss
```

```bash
bun add -D tailwindcss @tailwindcss/postcss
```

Add the PostCSS plugin to your `postcss.config.mjs` file:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

Import Tailwind in your global CSS file:

```css
@import 'tailwindcss';
```

Import the CSS file in your root layout:

```tsx
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

Now you can start using Tailwind's utility classes in your application:

```tsx
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to Next.js!</h1>
    </main>
  )
}
```

> **Good to know:** If you need broader browser support for very old browsers, see the [Tailwind CSS v3 setup instructions](https://nextjs.org/docs/app/guides/tailwind-v3-css).

### CSS Modules

CSS Modules locally scope CSS by generating unique class names. This allows you to use the same class in different files without worrying about naming collisions.

To start using CSS Modules, create a new file with the extension `.module.css` and import it into any component inside the `app` directory:

```css
.blog {
  padding: 24px;
}
```

```tsx
import styles from './blog.module.css'

export default function Page() {
  return <main className={styles.blog}></main>
}
```

### Global CSS

You can use global CSS to apply styles across your application.

Create a `app/global.css` file and import it in the root layout to apply the styles to **every route** in your application:

```css
body {
  padding: 20px 20px 60px;
  max-width: 680px;
  margin: 0 auto;
}
```

```tsx
// These styles apply to every route in the application
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

> **Good to know:** Global styles can be imported into any layout, page, or component inside the `app` directory. However, since Next.js uses React's built-in support for stylesheets to integrate with Suspense, this currently does not remove stylesheets as you navigate between routes which can lead to conflicts. We recommend using global styles for _truly_ global CSS (like Tailwind's base styles), [Tailwind CSS](#tailwind-css) for component styling, and [CSS Modules](#css-modules) for custom scoped CSS when needed.

### External stylesheets

Stylesheets published by external packages can be imported anywhere in the `app` directory, including colocated components:

```tsx
import 'bootstrap/dist/css/bootstrap.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="container">{children}</body>
    </html>
  )
}
```

> **Good to know:** In React 19, `<link rel="stylesheet" href="..." />` can also be used. See the [React `link` documentation](https://react.dev/reference/react-dom/components/link) for more information.

### Ordering and Merging

Next.js optimizes CSS during production builds by automatically chunking (merging) stylesheets. The **order of your CSS** depends on the **order you import styles in your code**.

For example, `base-button.module.css` will be ordered before `page.module.css` since `` is imported before `page.module.css`:

```tsx
import { BaseButton } from './base-button'
import styles from './page.module.css'

export default function Page() {
  return <BaseButton className={styles.primary} />
}
```

```tsx
import styles from './base-button.module.css'

export function BaseButton() {
  return <button className={styles.primary} />
}
```

#### Recommendations

To keep CSS ordering predictable:

- Try to contain CSS imports to a single JavaScript or TypeScript entry file
- Import global styles and Tailwind stylesheets in the root of your application.
- **Use Tailwind CSS** for most styling needs as it covers common design patterns with utility classes.
- Use CSS Modules for component-specific styles when Tailwind utilities aren't sufficient.
- Use a consistent naming convention for your CSS modules. For example, using `<name>.module.css` over `<name>.tsx`.
- Extract shared styles into shared components to avoid duplicate imports.
- Turn off linters or formatters that auto-sort imports like ESLint’s [`sort-imports`](https://eslint.org/docs/latest/rules/sort-imports).
- You can use the [`cssChunking`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cssChunking) option in `next.config.js` to control how CSS is chunked.

### Development vs Production

- In development (`next dev`), CSS updates apply instantly with [Fast Refresh](https://nextjs.org/docs/architecture/fast-refresh).
- In production (`next build`), all CSS files are automatically concatenated into **many minified and code-split** `.css` files, ensuring the minimal amount of CSS is loaded for a route.
- CSS still loads with JavaScript disabled in production, but JavaScript is required in development for Fast Refresh.
- CSS ordering can behave differently in development, always ensure to check the build (`next build`) to verify the final CSS order.

## Image Optimization

> **Source:** [Image Optimization](https://nextjs.org/docs/app/getting-started/images) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

The Next.js [``](https://nextjs.org/docs/app/api-reference/components/image) component extends the HTML `<img>` element to provide:

- **Size optimization:** Automatically serving correctly sized images for each device, using modern image formats like WebP.
- **Visual stability:** Preventing [layout shift](https://web.dev/articles/cls) automatically when images are loading.
- **Faster page loads:** Only loading images when they enter the viewport using native browser lazy loading, with optional blur-up placeholders.
- **Asset flexibility:** Resizing images on-demand, even images stored on remote servers.

To start using ``, import it from `next/image` and render it within your component.

```tsx
import Image from 'next/image'

export default function Page() {
  return
}
```

The `src` property can be a [local](#local-images) or [remote](#remote-images) image.

> **🎥 Watch:** Learn more about how to use `next/image` → [YouTube (9 minutes)](https://youtu.be/IU_qq_c_lKA).

### Local images

You can store static files, like images and fonts, under a folder called [`public`](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder) in the root directory. Files inside `public` can then be referenced by your code starting from the base URL (`/`).

![Folder structure showing app and public folders](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/public-folder.png)

```tsx
import Image from 'next/image'

export default function Page() {
  return (
    ![Picture of the author](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/profile.png)
  )
}
```

If the image is statically imported, Next.js will automatically determine the intrinsic [`width`](https://nextjs.org/docs/app/api-reference/components/image#width-and-height) and [`height`](https://nextjs.org/docs/app/api-reference/components/image#width-and-height). These values are used to determine the image ratio and prevent [Cumulative Layout Shift](https://web.dev/articles/cls) while your image is loading.

```tsx
import Image from 'next/image'
import ProfileImage from './profile.png'

export default function Page() {
  return (

  )
}
```

#### Images without static imports

If you can't use a static `import` for your images, you can use a dynamic `import()` in a Server Component to still get automatic `width`, `height`, and `blurDataURL`:

```tsx
import Image from 'next/image'

async function PostImage({
  imageFilename,
  alt,
}: {
  imageFilename: string
  alt: string
}) {
  const { default: image } = await import(
    `../content/blog/images/${imageFilename}`
  )
  // image contains width, height, and blurDataURL
  return
}
```

If you have a [path alias](https://www.typescriptlang.org/tsconfig/#paths) configured (e.g. `@/`), you can use it instead of a relative path:

```tsx
const { default: image } = await import(
  `@/content/blog/images/${imageFilename}`
)
```

The path must include a static prefix (like `../content/blog/images/`). Be as specific as possible, since **all** files matching that prefix are bundled. Only files in your specified directory are included, so external input cannot reach outside of it.

### Remote images

To use a remote image, you can provide a URL string for the `src` property.

```tsx
import Image from 'next/image'

export default function Page() {
  return (
    ![Picture of the author](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.comhttps://s3.amazonaws.com/my-bucket/profile.png)
  )
}
```

Since Next.js does not have access to remote files during the build process, you'll need to provide the [`width`](https://nextjs.org/docs/app/api-reference/components/image#width-and-height), [`height`](https://nextjs.org/docs/app/api-reference/components/image#width-and-height) and optional [`blurDataURL`](https://nextjs.org/docs/app/api-reference/components/image#blurdataurl) props manually. The `width` and `height` are used to infer the correct aspect ratio of image and avoid layout shift from the image loading in. Alternatively, you can use the [`fill` property](https://nextjs.org/docs/app/api-reference/components/image#fill) to make the image fill the size of the parent element.

To safely allow images from remote servers, you need to define a list of supported URL patterns in [`next.config.js`](https://nextjs.org/docs/app/api-reference/config/next-config-js). Be as specific as possible to prevent malicious usage. For example, the following configuration will only allow images from a specific AWS S3 bucket:

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/my-bucket/**',
        search: '',
      },
    ],
  },
}

export default config
```

## Font Optimization

> **Source:** [Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

The [`next/font`](https://nextjs.org/docs/app/api-reference/components/font) module automatically optimizes your fonts and removes external network requests for improved privacy and performance.

It includes **built-in self-hosting** for any font file. This means you can optimally load web fonts with no layout shift.

To start using `next/font`, import it from [`next/font/local`](#local-fonts) or [`next/font/google`](#google-fonts), call it as a function with the appropriate options, and set the `className` of the element you want to apply the font to. For example:

```tsx
import { Geist } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className}>
      <body>{children}</body>
    </html>
  )
}
```

Fonts are scoped to the component they're used in. To apply a font to your entire application, add it to the [Root Layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout).

### Google fonts

You can automatically self-host any Google Font. Fonts are included as static assets and served from the same domain as your deployment, meaning no requests are sent to Google by the browser when the user visits your site.

To start using a Google Font, import your chosen font from `next/font/google`:

```tsx
import { Geist } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.className}>
      <body>{children}</body>
    </html>
  )
}
```

We recommend using [variable fonts](https://fonts.google.com/variablefonts) for the best performance and flexibility. But if you can't use a variable font, you will need to specify a weight:

```tsx
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={roboto.className}>
      <body>{children}</body>
    </html>
  )
}
```

### Local fonts

To use a local font, import the `localFont` function from `next/font/local` and specify the [`src`](https://nextjs.org/docs/app/api-reference/components/font#src) of your local font file. The path is resolved relative to the file where `localFont` is called. Fonts can be stored anywhere in the project, including the [`public`](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder) folder or co-located inside the `app` folder. For example, to use a font stored in `app/fonts/`:

```tsx
import localFont from 'next/font/local'

const myFont = localFont({
  src: './my-font.woff2',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={myFont.className}>
      <body>{children}</body>
    </html>
  )
}
```

If you want to use multiple files for a single font family, `src` can be an array:

```js
const roboto = localFont({
  src: [
    {
      path: './Roboto-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './Roboto-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './Roboto-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './Roboto-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
})
```

## Metadata and OG images

> **Source:** [Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

The Metadata APIs can be used to define your application metadata for improved SEO and web shareability and include:

1. [The static `metadata` object](#static-metadata)
2. [The dynamic `generateMetadata` function](#generated-metadata)
3. Special [file conventions](https://nextjs.org/docs/app/api-reference/file-conventions/metadata) that can be used to add static or dynamically generated [favicons](#favicons) and [OG images](#static-open-graph-images).

With all the options above, Next.js will automatically generate the relevant `<head>` tags for your page, which can be inspected in the browser's developer tools.

The `metadata` object and `generateMetadata` function exports are only supported in Server Components.

### Default fields

There are two default `meta` tags that are always added even if a route doesn't define metadata:

- The [meta charset tag](https://developer.mozilla.org/docs/Web/HTML/Element/meta#attr-charset) sets the character encoding for the website.
- The [meta viewport tag](https://developer.mozilla.org/docs/Web/HTML/Viewport_meta_tag) sets the viewport width and scale for the website to adjust for different devices.

```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

The other metadata fields can be defined with the `Metadata` object (for [static metadata](#static-metadata)) or the `generateMetadata` function (for [generated metadata](#generated-metadata)).

### Static metadata

To define static metadata, export a [`Metadata` object](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-object) from a static [`layout.js`](https://nextjs.org/docs/app/api-reference/file-conventions/layout) or [`page.js`](https://nextjs.org/docs/app/api-reference/file-conventions/page) file. For example, to add a title and description to the blog route:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Blog',
  description: '...',
}

export default function Layout() {}
```

You can view a full list of available options, in the [`generateMetadata` documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields).

### Generated metadata

You can use [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) function to `fetch` metadata that depends on data. For example, to fetch the title and description for a specific blog post:

```tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug

  // fetch post information
  const post = await fetch(`https://api.vercel.app/blog/${slug}`).then((res) =>
    res.json()
  )

  return {
    title: post.title,
    description: post.description,
  }
}

export default function Page({ params, searchParams }: Props) {}
```

#### Streaming metadata

For dynamically rendered pages, Next.js streams metadata separately, injecting it into the HTML once `generateMetadata` resolves, without blocking UI rendering.

Streaming metadata improves perceived performance by allowing visual content to stream first.

Streaming metadata is **disabled for bots and crawlers** that expect metadata to be in the `<head>` tag (e.g. `Twitterbot`, `Slackbot`, `Bingbot`). These are detected by using the User Agent header from the incoming request.

You can customize or **disable** streaming metadata completely, with the [`htmlLimitedBots`](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots#disabling) option in your Next.js config file.

Prerendered pages don’t use streaming since metadata is resolved at build time.

Learn more about [streaming metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#streaming-metadata).

#### Memoizing data requests

There may be cases where you need to fetch the **same** data for metadata and the page itself. To avoid duplicate requests, you can use React's [`cache` function](https://react.dev/reference/react/cache) to memoize the return value and only fetch the data once. For example, to fetch the blog post information for both the metadata and the page:

```ts
import { cache } from 'react'
import { db } from '@/app/lib/db'

// getPost will be used twice, but execute only once
export const getPost = cache(async (slug: string) => {
  const res = await db.query.posts.findFirst({ where: eq(posts.slug, slug) })
  return res
})
```

```tsx
import { getPost } from '@/app/lib/data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  return {
    title: post.title,
    description: post.description,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  return <div>{post.title}</div>
}
```

### File-based metadata

The following special files are available for metadata:

- [favicon.ico, apple-icon.jpg, and icon.jpg](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons)
- [opengraph-image.jpg and twitter-image.jpg](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [sitemap.xml](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)

You can use these for static metadata, or you can programmatically generate these files with code.

### Favicons

Favicons are small icons that represent your site in bookmarks and search results. To add a favicon to your application, create a `favicon.ico` and add to the root of the app folder.

![Favicon Special File inside the App Folder with sibling layout and page files](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/favicon-ico.png)

> You can also programmatically generate favicons using code. See the [favicon docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons) for more information.

### Static Open Graph images

Open Graph (OG) images are images that represent your site in social media. To add a static OG image to your application, create a `opengraph-image.jpg` file in the root of the app folder.

![OG image special file inside the App folder with sibling layout and page files](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/opengraph-image.png)

You can also add OG images for specific routes by creating a `opengraph-image.jpg` deeper down the folder structure. For example, to create an OG image specific to the `/blog` route, add a `opengraph-image.jpg` file inside the `blog` folder.

![OG image special file inside the blog folder](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/opengraph-image-blog.png)

The more specific image will take precedence over any OG images above it in the folder structure.

> Other image formats such as `jpeg`, `png`, and `gif` are also supported. See the [Open Graph Image docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) for more information.

### Generated Open Graph images

The [`ImageResponse` constructor](https://nextjs.org/docs/app/api-reference/functions/image-response) allows you to generate dynamic images using JSX and CSS. This is useful for OG images that depend on data.

For example, to generate a unique OG image for each blog post, add an `opengraph-image.tsx` file inside the `blog/[slug]` folder, and import the `ImageResponse` constructor from `next/og`:

```tsx
import { ImageResponse } from 'next/og'
import { getPost } from '@/app/lib/data'

// Image metadata
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {post.title}
      </div>
    )
  )
}
```

`ImageResponse` supports common CSS properties including flexbox and absolute positioning, custom fonts, text wrapping, centering, and nested images. [See the full list of supported CSS properties](https://nextjs.org/docs/app/api-reference/functions/image-response).

> **Good to know**:
>
> - Examples are available in the [Vercel OG Playground](https://og-playground.vercel.app/).
> - `ImageResponse` uses [`@vercel/og`](https://vercel.com/docs/og-image-generation), [`satori`](https://github.com/vercel/satori), and `resvg` to convert HTML and CSS into PNG.
> - Only flexbox and a subset of CSS properties are supported. Advanced layouts (e.g. `display: grid`) will not work.

## Route Handlers

> **Source:** [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

### Route Handlers

Route Handlers allow you to create custom request handlers for a given route using the Web [Request](https://developer.mozilla.org/docs/Web/API/Request) and [Response](https://developer.mozilla.org/docs/Web/API/Response) APIs.

![Route.js Special File](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/dark/route-special-file.png)

> **Good to know**: Route Handlers are only available inside the `app` directory. They are the equivalent of [API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) inside the `pages` directory meaning you **do not** need to use API Routes and Route Handlers together.

#### Convention

Route Handlers are defined in a [`route.js|ts` file](https://nextjs.org/docs/app/api-reference/file-conventions/route) inside the `app` directory:

```ts
export async function GET(request: Request) {}
```

Route Handlers can be nested anywhere inside the `app` directory, similar to `page.js` and `layout.js`. But there **cannot** be a `route.js` file at the same route segment level as `page.js`.

#### Supported HTTP Methods

The following [HTTP methods](https://developer.mozilla.org/docs/Web/HTTP/Methods) are supported: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS`. If an unsupported method is called, Next.js will return a `405 Method Not Allowed` response.

#### Extended `NextRequest` and `NextResponse` APIs

In addition to supporting the native [Request](https://developer.mozilla.org/docs/Web/API/Request) and [Response](https://developer.mozilla.org/docs/Web/API/Response) APIs, Next.js extends them with [`NextRequest`](https://nextjs.org/docs/app/api-reference/functions/next-request) and [`NextResponse`](https://nextjs.org/docs/app/api-reference/functions/next-response) to provide convenient helpers for advanced use cases.

#### Caching

Route Handlers are not cached by default. You can, however, opt into caching for `GET` methods. Other supported HTTP methods are **not** cached. To cache a `GET` method, use a [route config option](https://nextjs.org/docs/app/guides/caching-without-cache-components#dynamic) such as `export const dynamic = 'force-static'` in your Route Handler file.

```ts
export const dynamic = 'force-static'

export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  })
  const data = await res.json()

  return Response.json({ data })
}
```

> **Good to know**: Other supported HTTP methods are **not** cached, even if they are placed alongside a `GET` method that is cached, in the same file.

##### With Cache Components

When [Cache Components](https://nextjs.org/docs/app/getting-started/caching) is enabled, `GET` Route Handlers follow the same model as normal UI routes in your application. They run at request time by default, can be prerendered when they don't access uncached or runtime data, and you can use `use cache` to include uncached data in the static response.

**Static example** - doesn't access uncached or runtime data, so it will be prerendered at build time:

```tsx
export async function GET() {
  return Response.json({
    projectName: 'Next.js',
  })
}
```

**Dynamic example** - accesses non-deterministic operations. During the build, prerendering stops when `Math.random()` is called, deferring to request-time rendering:

```tsx
export async function GET() {
  return Response.json({
    randomNumber: Math.random(),
  })
}
```

**Runtime data example** - accesses request-specific data. Prerendering terminates when runtime APIs like `headers()` are called:

```tsx
import { headers } from 'next/headers'

export async function GET() {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')

  return Response.json({ userAgent })
}
```

> **Good to know**: Prerendering stops if the `GET` handler accesses network requests, database queries, async file system operations, request object properties (like `req.url`, `request.headers`, `request.cookies`, `request.body`), runtime APIs like [`cookies()`](https://nextjs.org/docs/app/api-reference/functions/cookies), [`headers()`](https://nextjs.org/docs/app/api-reference/functions/headers), [`connection()`](https://nextjs.org/docs/app/api-reference/functions/connection), or non-deterministic operations.

**Cached example** - accesses uncached data (database query) but caches it with `use cache`, allowing it to be included in the prerendered response:

```tsx
import { cacheLife } from 'next/cache'

export async function GET() {
  const products = await getProducts()
  return Response.json(products)
}

async function getProducts() {
  'use cache'
  cacheLife('hours')

  return await db.query('SELECT * FROM products')
}
```

> **Good to know**: `use cache` cannot be used directly inside a Route Handler body; extract it to a helper function. Cached responses revalidate according to `cacheLife` when a new request arrives.

#### Special Route Handlers

Special Route Handlers like [`sitemap.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap), [`opengraph-image.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image), and [`icon.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons), and other [metadata files](https://nextjs.org/docs/app/api-reference/file-conventions/metadata) remain static by default unless they use Request-time APIs or dynamic config options.

#### Route Resolution

You can consider a `route` the lowest level routing primitive.

- They **do not** participate in layouts or client-side navigations like `page`.
- There **cannot** be a `route.js` file at the same route as `page.js`.

| Page                 | Route              | Result                       |
| -------------------- | ------------------ | ---------------------------- |
| `app/page.js`        | `app/route.js`     |  Conflict |
| `app/page.js`        | `app/api/route.js` |  Valid    |
| `app/[user]/page.js` | `app/api/route.js` |  Valid    |

Each `route.js` or `page.js` file takes over all HTTP verbs for that route.

```ts
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}

// Conflict
// `app/route.ts`
export async function POST(request: Request) {}
```

Read more about how Route Handlers [complement your frontend application](https://nextjs.org/docs/app/guides/backend-for-frontend), or explore the Route Handlers [API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/route).

#### Route Context Helper

In TypeScript, you can type the `context` parameter for Route Handlers with the globally available [`RouteContext`](https://nextjs.org/docs/app/api-reference/file-conventions/route#route-context-helper) helper:

```ts
import type { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, ctx: RouteContext<'/users/[id]'>) {
  const { id } = await ctx.params
  return Response.json({ id })
}
```

> **Good to know**
>
> - Types are generated during `next dev`, `next build` or `next typegen`.

## Proxy

> **Source:** [Proxy](https://nextjs.org/docs/app/getting-started/proxy) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

### Proxy

> **Good to know**: Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose. The functionality remains the same.

Proxy allows you to run code before a request is completed. Then, based on the incoming request, you can modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.

#### Use cases

Some common scenarios where Proxy is effective include:

- Modifying headers for all pages or a subset of pages
- Rewriting to different pages based on A/B tests or experiments
- Programmatic redirects based on incoming request properties

For simple redirects, consider using the [`redirects`](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects) configuration in `next.config.ts` first. Proxy should be used when you need access to request data or more complex logic.

Proxy is _not_ intended for slow data fetching. While Proxy can be helpful for [optimistic checks](https://nextjs.org/docs/app/guides/authentication#optimistic-checks-with-proxy-optional) such as permission-based redirects, it should not be used as a full session management or authorization solution.

Using fetch with `options.cache`, `options.next.revalidate`, or `options.next.tags`, has no effect in Proxy.

#### Convention

Create a `proxy.ts` (or `.js`) file in the project root, or inside `src` if applicable, so that it is located at the same level as `pages` or `app`.

> **Note**: While only one `proxy.ts` file is supported per project, you can still organize your proxy logic into modules. Break out proxy functionalities into separate `.ts` or `.js` files and import them into your main `proxy.ts` file. This allows for cleaner management of route-specific proxy, aggregated in the `proxy.ts` for centralized control. By enforcing a single proxy file, it simplifies configuration, prevents potential conflicts, and optimizes performance by avoiding multiple proxy layers.

#### Example

You can export your proxy function as either a default export or a named `proxy` export:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: '/about/:path*',
}
```

The `matcher` config allows you to filter Proxy to run on specific paths. See the [Matcher](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher) documentation for more details on path matching.

Read more about [using `proxy`](https://nextjs.org/docs/app/guides/backend-for-frontend#proxy), or refer to the `proxy` [API reference](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

## Deploying

> **Source:** [Deploying](https://nextjs.org/docs/app/getting-started/deploying) · [Next.js docs](https://github.com/vercel/next.js/tree/canary/docs), MIT

Next.js can be deployed as a Node.js server, Docker container, static export, or adapted to run on different platforms.

| Deployment Option                | Feature Support                                                     |
| -------------------------------- | ------------------------------------------------------------------- |
| [Node.js server](#nodejs-server) | All                                                                 |
| [Docker container](#docker)      | All                                                                 |
| [Static export](#static-export)  | Limited                                                             |
| [Adapters](#adapters)            | Varies ([verified](#verified-adapters) adapters run the test suite) |

### Node.js server

Next.js can be deployed to any provider that supports Node.js. Ensure your `package.json` has the `"build"` and `"start"` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

Then, run `npm run build` to [build your application](https://nextjs.org/docs/app/guides/building) and `npm run start` to start the Node.js server. This server supports all Next.js features. If needed, you can also eject to a [custom server](https://nextjs.org/docs/app/guides/custom-server).

Node.js deployments support all Next.js features. Learn how to [configure them](https://nextjs.org/docs/app/guides/self-hosting) for your infrastructure.

#### Templates

- [Flightcontrol](https://github.com/nextjs/deploy-flightcontrol)
- [Railway](https://github.com/nextjs/deploy-railway)
- [Replit](https://github.com/nextjs/deploy-replit)
- [Hostinger](https://github.com/hostinger/deploy-nextjs)

### Docker

Next.js can be deployed to any provider that supports [Docker](https://www.docker.com/) containers. This includes container orchestrators like Kubernetes or a cloud provider that runs Docker. For best practices on containerizing your app, refer to Docker's official [Next.js](https://docs.docker.com/guides/nextjs) and [React.js](https://docs.docker.com/guides/reactjs) guides.

Docker deployments support all Next.js features. Learn how to [configure them](https://nextjs.org/docs/app/guides/self-hosting) for your infrastructure.

> **Note for development:** While Docker is excellent for production deployments, consider using local development (`npm run dev`) instead of Docker during development on Mac and Windows for better performance. [Learn more about optimizing local development](https://nextjs.org/docs/app/guides/local-development).

#### Templates

The following examples demonstrate best practices for containerizing Next.js applications:

- [Docker Standalone Output](https://github.com/vercel/next.js/tree/canary/examples/with-docker) - Deploy a Next.js application using `output: "standalone"` to generate a minimal, production-ready Docker image with only the required runtime files and dependencies.
- [Docker Export Output](https://github.com/vercel/next.js/tree/canary/examples/with-docker-export-output) - Deploy a fully static Next.js application using `output: "export"` to generate optimized HTML files that can be served from a lightweight container or any static hosting environment.
- [Docker Multi-Environment](https://github.com/vercel/next.js/tree/canary/examples/with-docker-multi-env) - Manage separate Docker configurations for development, staging, and production environments with different environment variables.

Additionally, hosting providers offer guidance on deploying Next.js:

- [DigitalOcean](https://github.com/nextjs/deploy-digitalocean)
- [Fly.io](https://github.com/nextjs/deploy-fly)
- [Google Cloud Run](https://github.com/nextjs/deploy-google-cloud-run)
- [Render](https://github.com/nextjs/deploy-render)
- [SST](https://github.com/nextjs/deploy-sst)

### Static export

Next.js enables starting as a static site or [Single-Page Application (SPA)](https://nextjs.org/docs/app/guides/single-page-applications), then later optionally upgrading to use features that require a server.

Since Next.js supports [static exports](https://nextjs.org/docs/app/guides/static-exports), it can be deployed and hosted on any web server that can serve HTML/CSS/JS static assets. This includes tools like AWS S3, Nginx, or Apache.

Running as a [static export](https://nextjs.org/docs/app/guides/static-exports) **does not** support Next.js features that require a server. [Learn more](https://nextjs.org/docs/app/guides/static-exports#unsupported-features).

#### Templates

- [GitHub Pages](https://github.com/nextjs/deploy-github-pages)

### Adapters

Next.js can be adapted to run on different platforms to support their infrastructure capabilities. The [Deployment Adapter API](https://nextjs.org/docs/app/api-reference/config/next-config-js/adapterPath) lets platforms customize how Next.js applications are built and deployed.

#### Verified Adapters

Verified adapters are open source, run the full [Next.js compatibility test suite](https://nextjs.org/docs/app/api-reference/adapters/testing-adapters), and are hosted under the [Next.js GitHub organization](https://github.com/nextjs). The Next.js team coordinates testing with these platforms before major releases. Publicly visible test results for each adapter are coming soon. [Learn more about verified adapters](https://nextjs.org/docs/app/guides/deploying-to-platforms#verified-adapters).

- [Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Bun](https://bun.com/docs/guides/ecosystem/nextjs)

Cloudflare and Netlify are working on verified adapters built on the Adapter API. In the meantime, they offer their own Next.js integrations (see below).

#### Other Platforms

The following platforms offer their own Next.js integrations. These are not built on the public [Adapter API](https://nextjs.org/docs/app/api-reference/config/next-config-js/adapterPath) and are not verified by the Next.js team, so feature support and compatibility may vary. Refer to each provider's documentation for details:

- [Appwrite Sites](https://appwrite.io/docs/products/sites/quick-start/nextjs)
- [AWS Amplify Hosting](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components)
- [Cloudflare](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs)
- [Deno Deploy](https://docs.deno.com/examples/next_tutorial)
- [Firebase App Hosting](https://firebase.google.com/docs/app-hosting/get-started)
- [Netlify](https://docs.netlify.com/frameworks/next-js/overview/#next-js-support-on-netlify)

For details on which Next.js features require specific platform capabilities, see [Deploying to Platforms](https://nextjs.org/docs/app/guides/deploying-to-platforms).
