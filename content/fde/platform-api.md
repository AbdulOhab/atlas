---
title: "The Platform API"
order: 23
summary: "Internal developer platforms: a software catalog and templates behind one API, with Backstage as the example."
category: "Platform Engineering"
level: Intermediate
---

# The Platform API

A platform team's product is an API other engineers build on: a catalog of what exists and templates for creating more.

**Course milestone:** Platform Engineering

## What is Backstage

> **Source:** [What is Backstage](https://backstage.io/docs/overview/what-is-backstage) · [Backstage docs](https://github.com/backstage/backstage), Apache 2.0

![software-catalog](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/header.png)

[Backstage](https://backstage.io/) is an open source framework for building developer
portals. Powered by a centralized software catalog, Backstage restores order to
your microservices and infrastructure and enables your product teams to ship
high-quality code quickly — without compromising autonomy.

Backstage unifies all your infrastructure tooling, services, and documentation
to create a streamlined development environment from end to end.

  <iframe
    src="https://www.youtube.com/embed/85TQEpNCaU0"
    title="What is Backstage?"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    style="position: absolute; inset: 0; width: 100%; height: 100%;"
  ></iframe>

Out of the box, Backstage includes:

- [Backstage Software Catalog](https://github.com/backstage/backstage/blob/HEAD/docs/features/software-catalog/index.md) for
  managing all your software (microservices, libraries, data pipelines,
  websites, ML models, etc.)

- [Backstage Software Templates](https://github.com/backstage/backstage/blob/HEAD/docs/features/software-templates/index.md) for
  quickly spinning up new projects and standardizing your tooling with your
  organization’s best practices

- [Backstage TechDocs](https://github.com/backstage/backstage/blob/HEAD/docs/features/techdocs/README.md) for making it easy to
  create, maintain, find, and use technical documentation, using a "docs like
  code" approach

- Plus, a growing ecosystem of
  [open source plugins](https://github.com/backstage/backstage/tree/master/plugins)
  that further expand Backstage’s customizability and functionality

### Backstage and the CNCF

Backstage is a CNCF Incubation project after graduating from Sandbox. Read the announcement
[here](https://backstage.io/blog/2022/03/16/backstage-turns-two#out-of-the-sandbox-and-into-incubation).

### Benefits

- For _engineering managers_, it allows you to maintain standards and best
  practices across the organization, and can help you manage your whole tech
  ecosystem, from migrations to test certification.

- For _end users_ (developers), it makes it fast and simple to build software
  components in a standardized way, and it provides a central place to manage
  all projects and documentation.

- For _platform engineers_, it enables extensibility and scalability by letting
  you easily integrate new tools and services (via plugins), as well as
  extending the functionality of existing ones.

- For _everyone_, it’s a single, consistent experience that ties all your
  infrastructure tooling, resources, standards, owners, contributors, and
  administrators together in one place.

If you have questions or want support, please join our
[Discord chatroom](https://discord.gg/backstage-687207715902193673).

## Architecture overview

> **Source:** [Architecture overview](https://backstage.io/docs/overview/architecture-overview) · [Backstage docs](https://github.com/backstage/backstage), Apache 2.0

### Terminology

Backstage is organized into three main components, each catering to different groups of contributors who interact with Backstage in distinct ways.

- Core - This includes the base functionality developed by core developers within the open-source project.
- App - The app represents a deployed instance of a Backstage application, customized and maintained by app developers, typically a productivity team within an organization. It integrates core functionalities with additional plugins.
- Plugins - These provide additional functionalities to enhance the usefulness of your Backstage app. Plugins can be company-specific or open-sourced and reusable.

### Overview

The following diagram shows a high level view of the overall architecture of Backstage. Running this architecture in a real environment typically involves
containerizing the components. Various commands are provided for accomplishing this.

There are 3 main components in this architecture:

- The [frontend](#frontend-building-blocks) includes the core Backstage [UI](#user-interface) which is an [extension](#extensions) that interacts directly with the user to present the information from the integrated core feature plugins, and other plugins added by a user.
- The [backend](#backend-building-blocks) includes the backend plugins, [core services](https://backstage.io/docs/backend-system/core-services/index), and other services. This is the server-side part of Backstage that is responsible for wiring things together. You can deploy more than one backend, and more than one backend container, depending on your need to scale and isolate individual features.
- Databases host your Backstage data.

![The architecture of a basic Backstage application](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/architecture-overview/backstage-front-back-arch.jpeg)

### Frontend building blocks

The architectural diagram provides an overview of the different building blocks and the other blocks that each of them interacts with.

#### App

This is the app instance itself that you create and use as the root of your Backstage frontend application. It does not have any direct functionality in and of itself, but is simply responsible for wiring things together.

#### Extensions

[Extensions](https://github.com/backstage/backstage/blob/HEAD/docs/frontend-system/architecture/20-extensions.md) are the building blocks that build out both the visual and non-visual structure of the application. There are both built-in extensions provided by the app itself as well as extensions provided by plugins. Each extension is attached to a parent with which it shares data and can have any number of children of its own. It is up to the app to wire together all extensions into a single tree known as the app extension tree. It is from this structure that the entire app can then be instantiated and rendered.

##### User Interface

The UI is one of the extensions in the frontend. It is a thin, client-side wrapper around a set of plugins. It provides some core UI components and libraries for shared activities such as config management. [[live demo](https://demo.backstage.io/catalog)]

![UI with different components highlighted](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/architecture-overview/core-vs-plugin-components-highlighted.png)

Each plugin typically makes itself available in the UI on a dedicated URL. For example, the Service Catalog plugin is registered with the UI on `/catalog`.

#### Frontend plugins

Plugins provide the actual features inside an app. The size of a plugin can range from a tiny component to an entire new system in which other plugins can be composed and integrated. Plugins can be completely standalone or built on top of each other to extend existing plugins and augment their features. Plugins can communicate with each other by composing their extensions or by sharing Utility APIs and routes.

Backstage includes the following set of core plugins:

- [Software Catalog](https://github.com/backstage/backstage/blob/HEAD/docs/features/software-catalog/index.md) - A centralized system that contains metadata for all your software, such as services, websites, libraries, ML models, data pipelines, and so on. It can also contain metadata for the physical or virtual infrastructure needed to operate a piece of software. The software catalog can be viewed and searched through a UI.
- [Software Templates](https://github.com/backstage/backstage/blob/HEAD/docs/features/software-templates/index.md) - A tool to help you create components inside Backstage. A template can load skeletons of code, include some variables, and then publish the template to a location, such as GitHub.
- [TechDocs](https://backstage.io/docs/features/techdocs/) - A docs-like-code solution built into Backstage. Documentation is written in Markdown files which lives together with the code.
- [Kubernetes](https://github.com/backstage/backstage/blob/HEAD/docs/features/kubernetes/index.md) - A tool that allows developers to check the health of their services whether it is on a local host or in production.
- [Search](https://backstage.io/docs/features/search/) - Search for information in the Backstage ecosystem. You can customize the look and feel of each search result and use your own search engine.

[Plugin architecture](#plugin-architecture) provides greater detail about the architecture of the plugins themselves.

#### Extension Overrides

In addition to the built-in extensions and extensions provided by plugins, it is also possible to install [extension overrides](https://github.com/backstage/backstage/blob/HEAD/docs/frontend-system/architecture/25-extension-overrides.md). This is a collection of extensions with high priority that can replace existing extensions. They can for example be used to override an individual extension provided by a plugin, or install a completely new extension, such as a new app theme.

#### Utility APIs

[Utility APIs](https://github.com/backstage/backstage/blob/HEAD/docs/api/utility-apis.md) provide functionality that makes it easier to build plugins, make it possible for plugins to share functionality with other plugins, as well as serve as a customization point for integrators to change the behaviour of the app. Each Utility API is defined by a TypeScript interface as well as a reference used to access the implementations. The implementations of Utility APIs are defined by extensions that are provided and can be overridden the same as any other extension.

#### Routes

The [Backstage routing system](https://github.com/backstage/backstage/blob/HEAD/docs/frontend-system/architecture/36-routes.md) adds a layer of indirection that makes it possible for plugins to route to each other's extensions without explicit knowledge of what URL paths the extensions are rendered at or if they even exist at all. It makes it possible for plugins to share routes with each other and dynamically generate concrete links at runtime. It is the responsibility of the app to resolve these links to actual URLs, but it is also possible for integrators to define their own route bindings that decide how the links should be resolved. The routing system also lets plugins define internal routes, aiding in the linking to different content in the same plugin.

### Backend building blocks

The architectural diagram provides an overview of the different building blocks, and the other blocks that each of them interact with.

#### Backend

This is the [backend instance](https://github.com/backstage/backstage/blob/HEAD/docs/backend-system/architecture/02-backends.md) itself, which you can think of as the unit of deployment. It does not have any functionality in and of itself, but is simply responsible for wiring things together.

It is up to you to decide how many different backends you want to deploy. You can have all features in a single one, or split things out into multiple smaller deployments, depending on your need to scale and isolate individual features.

#### Backend plugins

[Plugins](https://github.com/backstage/backstage/blob/HEAD/docs/backend-system/architecture/04-plugins.md) provide the actual features. They operate completely independently of each other. If plugins want to communicate with each other, they must do so over the wire. There can be no direct communication between plugins through code. Because of this constraint, each plugin can be considered to be its own microservice.

[Plugin architecture](#plugin-architecture) provides greater detail about the architecture of the plugins themselves.

#### Services

[Services](https://github.com/backstage/backstage/blob/HEAD/docs/backend-system/architecture/03-services.md) provide utilities to help make it simpler to implement plugins, so that each plugin doesn't need to implement everything from scratch. There are many built-in core services, such as the ones for logging, database access, and reading configuration, but you can also import third-party services, or create your own.

Services are also a customization point for individual backend installations. You can override services with your own implementations, as well as make smaller customizations to existing services.

#### Extension Points

Many plugins have ways in which you can extend them, for example entity providers for the Catalog, or custom actions for the Scaffolder. These extension patterns are now encoded into Extension Points.

[Extension Points](https://github.com/backstage/backstage/blob/HEAD/docs/backend-system/architecture/05-extension-points.md) look a little bit like services, since you depend on them just like you would a service. A key difference is that extension points are registered and provided by plugins or modules themselves, based on what customizations each of them want to expose.

Extension Points are exported separately from the plugin or module instance itself, and it is possible to expose multiple different extension points at once. This makes it easier to evolve and deprecate individual Extension Points over time, rather than dealing with a single large API surface.

#### Modules

[Modules](https://github.com/backstage/backstage/blob/HEAD/docs/backend-system/architecture/06-modules.md) use Extension Points to add new features to other plugins or modules. They might for example add an individual Catalog Entity Provider, or one or more Scaffolder Actions.

Each module may only use Extension Points that belong to a single plugin, and the module must be deployed together with that plugin in the same backend instance. Modules may only communicate with their plugin or other modules through the registered extension points.

Just like plugins, modules also have access to services and can depend on their own service implementations. They will however share services with the plugin that they extend - there are no module-specific service implementations.

### Databases

The databases host your Backstage data. The Backstage backend and its built-in plugins are based on the [Knex](http://knexjs.org/) library, and set up a separate logical database per plugin. This gives great isolation and lets them perform migrations and evolve separately from each other.

The Knex library supports a multitude of databases, but Backstage at this time of writing is tested primarily against two of them:

- SQLite, which is mainly used as an in-memory mock/test database
- PostgreSQL, which is the preferred production database.

Other databases such as the MySQL variants are reported to work but [aren't fully tested](https://github.com/backstage/backstage/issues/2460) yet.

You can find instructions on setting up a PostgreSQL for your Backstage instance in [Database](https://github.com/backstage/backstage/blob/HEAD/docs/getting-started/config/database.md). [Configuring Plugin Databases](https://github.com/backstage/backstage/blob/HEAD/docs/tutorials/configuring-plugin-databases.md) provides information on how to configure a database for a plugin.

### Plugin architecture

Architecturally, plugins can take three forms:

- [Standalone](#standalone-plugins)
- [Service backend](#service-backend-plugins)
- [Third-party backend](#third-party-backend-plugins)

#### Standalone plugins

Standalone plugins run entirely in the browser. [The Tech Radar plugin](https://demo.backstage.io/tech-radar), for example, simply renders hard-coded information. It doesn't make any API requests to other services.

The architecture of the Tech Radar installed into a Backstage app is very simple. You just need to add Tech Radar as a frontend plugin into your app, as shown in the following diagram.

> **NOTE:**
> The following diagram does not show the detailed contents of the frontend and backend containers in order to highlight the changes that pertain to the addition of the specified plugin.

![ui and tech radar plugin connected together](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/architecture-overview/simplified-standalone-plugin-architecture.jpeg)

Once the plugin has been added, then you can view the Tech Radar information in the Backstage UI.

![tech radar plugin ui](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/architecture-overview/tech-radar-plugin.png)

#### Service backend plugins

Service backend plugins make API requests to a service which is within the purview of the organization running Backstage.

The Lighthouse plugin, for example, makes requests to the [lighthouse-audit-service](https://github.com/spotify/lighthouse-audit-service). The `lighthouse-audit-service` is a microservice which runs a copy of Google's [Lighthouse library](https://github.com/GoogleChrome/lighthouse/) and stores the results in a PostgreSQL database.

The Lighthouse plugin is added to the frontend. The lighthouse-audit-service container is already publicly available in Docker Hub and can be downloaded and run with

```bash
docker run spotify/lighthouse-audit-service:latest
```

> **NOTE:**
> The following diagram does not show the detailed contents of the frontend and backend, in order to highlight the changes that pertain to the addition of the specified plugin.

![lighthouse plugin backend to microservice and database](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/architecture-overview/simplified-service-based-plugin-architecture.jpeg)

The software catalog in Backstage is another example of a service backend plugin. It retrieves a list of services, or "entities", from the Backstage Backend service and renders them in a table for the user.

#### Third-party backend plugins

Third-party backend plugins are similar to service backend plugins. The main difference is that the service which backs the plugin is hosted outside of the ecosystem of the company hosting Backstage.

The CircleCI plugin is an example of a third-party backend plugin. CircleCI is a SaaS service which can be used without any knowledge of Backstage. It has an API which a Backstage plugin consumes to display content.

Requests going to CircleCI from the user's browser are passed through a proxy service that Backstage provides. Without this, the requests would be blocked by Cross Origin Resource Sharing policies which prevent a browser page served at <https://example.com> from serving resources hosted at <https://circleci.com>.

> **NOTE:**
> The following diagram does not show the detailed contents of the frontend and backend, in order to highlight the changes that pertain to the addition of the specified plugin.

![CircleCI plugin talking to proxy talking to SaaS Circle CI](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/architecture-overview/simplified-third-party-plugin-architecture.jpeg)

### Package Architecture

Backstage relies heavily on NPM packages, both for distribution of libraries, and structuring of code within projects. While the way you structure your Backstage project is up to you, there is a set of established patterns that we encourage you to follow. These patterns can help set up a sound project structure as well as provide familiarity between different Backstage projects.

The following diagram shows an overview of the package architecture of Backstage. It takes the point of view of an individual plugin and all of the packages that it may contain, indicated by the thicker border and italic text. Surrounding the plugin are different package groups which are the different possible interface points of the plugin. Note that not all library package lists are complete as packages have been omitted for brevity.

![Package architecture](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/architecture-overview/package-architecture.drawio.svg)

#### Overview

The arrows in the diagram above indicate a runtime dependency on the code of the target package. This strict dependency graph only applies to runtime
`dependencies`, and there may be `devDependencies` that break the rules of this table for the purpose of testing. While there are some arrows that show a dependency on a collection of frontend, backend and isomorphic packages, those still have to abide by important compatibility rules shown in the bottom left.

The `app` and `backend` packages are the entry points of a Backstage project. The `app` package is the frontend application that brings together a collection of frontend plugins and customizes them to fit an organization, while the `backend` package is the backend service that powers the Backstage application. Worth noting is that there can be more than one instance of each of these packages within a project. Particularly the `backend` packages can benefit from being split up into smaller deployment units that each serve their own purpose with a smaller collection of plugins.

#### Plugin Packages

A typical plugin consists of up to five packages, two frontend ones, two backend, and one isomorphic package. All packages within the plugin must share a common prefix, typically of the form `@<scope>/plugin-<plugin-id>`, but alternatives like `backstage-plugin-<plugin-id>` or `@<scope>/backstage-plugin-<plugin-id>` are also valid. Along with this prefix, each of the packages have their own unique suffix that denotes their role. In addition to these five plugin packages it's also possible for a plugin to have
additional frontend and backend modules that can be installed to enable optional features. For a full list of suffixes and their roles, see the [Plugin Package Structure ADR](https://github.com/backstage/backstage/blob/HEAD/docs/architecture-decisions/adr011-plugin-package-structure.md).

The `-react`, `-common`, and `-node` plugin packages together form the external library of a plugin. The plugin library enables other plugins to build on top of and extend a plugin, and likewise allows the plugin to depend on and extend other plugins. Because of this, it is preferable that plugin library packages allow duplicate installations of themselves, as you may end up with a mix of versions being installed as dependencies of various plugins. It is also forbidden for plugins to directly import non-library packages from other plugins, all communication between plugins must be handled through libraries and the application itself.

#### Frontend Packages

The frontend packages are grouped into two main groups. The first one is "Frontend App Core", which is the set of packages that are only used by the `app` package itself. These packages help build up the core structure of the app as well as provide a foundation for the plugin libraries to rely upon.

The second group is the rest of the shared packages, further divided into "Frontend Plugin Core" and "Frontend Libraries". The core packages are considered particularly stable and form the core of the frontend framework. Their most important role is to form the boundary around each plugin and provide a set of tools that helps you combine a collection of plugins into a running application. The rest of the frontend packages are more traditional libraries that serve as building blocks to create plugins.

#### Backend Packages

The backend library packages do not currently share a similar plugin architecture as the frontend packages. They are instead simply a collection of building blocks and patterns that help you build backend services. This is however likely to change in the future.

#### Common Packages

The common packages are the packages effectively depended on by all other pages. This is a much smaller set of packages but they are also very pervasive. Because the common packages are isomorphic and must execute both in the frontend and backend, they are never allowed to depend on any of the frontend or backend packages.

The Backstage CLI is in a category of its own and is depended on by virtually all other packages. It's not a library in itself though, and must always be a development dependency only.

#### Deciding where you place your code

It can sometimes be difficult to decide where to place your plugin code. For example, should it go directly in the `-backend` plugin package or in the `-node` package? As a general guideline you should try to keep the exposure of your code as low as possible. If it doesn't need to be public API, it's best to avoid. If you don't need it to be used by other plugins, then keep it directly in the plugin packages.

Below is a chart to help you decide where to place your code.

```mermaid
flowchart TD
  accTitle: Package placement decision
  accDescr: Decision flow for choosing which plugin package should contain new code.
  start["In what plugin package should I put my code?"] --> public{"Is the new addition public API?<br/>i.e. exported from the package"}
  public -- No --> local["Put it in the package<br/>that uses it"]
  public -- Yes --> audience{"Is the export supposed<br/>to be used by other plugins or just app/backend packages?"}
  audience -- "Only app/backend" --> plugin["Put it in the frontend or backend plugin package"]
  audience -- "Yes, used by other plugins" --> environments{"Should the export be<br/>usable by both Node.js and browser packages?"}
  environments -- No --> split["Put frontend exports in &lt;plugin&gt;-react, and backend exports in &lt;plugin&gt;-node"]
  environments -- Yes --> common["Add it to &lt;plugin&gt;-common, but be sure to support both Node.js and web environments"]
```

### Cache

The Backstage backend and its built-in plugins are also able to leverage cache stores as a means of improving performance or reliability. Similar to how databases are supported, plugins receive logically separated cache connections, which are powered by [Keyv](https://github.com/lukechilds/keyv) under the hood.

At this time of writing, Backstage can be configured to use one of five cache stores:

- `memory`
- `memcache`
- `redis`
- `valkey`
- `infinispan`

`memory` is primarily used for local development, for production deployments, we recommend using one of the other cache stores. The right cache store for your Backstage instance will depend on your own run-time constraints and those required of the plugins you're running.

#### Use memory for cache

```yaml
backend:
  cache:
    store: memory
```

#### Use memcache for cache

```yaml
backend:
  cache:
    store: memcache
    connection: user:pass@cache.example.com:11211
```

#### Use Redis for cache

```yaml
backend:
  cache:
    store: redis
    connection: redis://user:pass@cache.example.com:6379
```

#### Use Infinispan for cache

##### Minimal configuration

- defaults, no `authentication`, expects cache named `cache` and host `127.0.0.1:11222`)

```yaml
backend:
  cache:
    store: infinispan
```

##### Extended configuration

- Unlike Redis, Infinispan will **not** create the cache for you. It's expected you've configured the cache in your infinispan server prior to configuration here.
- A full list of configuration items are available: <https://docs.jboss.org/infinispan/hotrod-clients/javascript/1.0/apidocs/module-infinispan.html> including support for backup clusters.

```yaml
backend:
  cache:
    store: infinispan
    infinispan:
      servers:
        - host: 127.0.0.1
          port: 11222
      cacheName: backstage-cache
      mediaType: application/json
      authentication:
        enabled: true
        userName: yourusername
        password: yourpassword
        saslMechanism: PLAIN
```

Contributions supporting other cache stores are welcome!

## Software catalog

> **Source:** [Software catalog](https://backstage.io/docs/features/software-catalog) · [Backstage docs](https://github.com/backstage/backstage), Apache 2.0

### What is a Software Catalog?

The Backstage Software Catalog is a centralized system that keeps track of
ownership and metadata for all the software in your ecosystem (services,
websites, libraries, data pipelines, etc). The catalog is built around the
concept of [metadata YAML files](https://github.com/backstage/backstage/blob/HEAD/docs/features/software-catalog/descriptor-format.md) stored together with the
code, which are then harvested and visualized in Backstage.

![software-catalog](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/header.png)

### How it works

Backstage and the Backstage Software Catalog make it easy for one team to manage
10 services — and makes it possible for your company to manage thousands of
them.

More specifically, the Software Catalog enables two main use-cases:

1. Helping teams manage and maintain the software they own. Teams get a uniform
   view of all their software; services, libraries, websites, ML models — you
   name it, Backstage knows all about it.
2. Makes all the software in your company, and who owns it, discoverable. No
   more orphan software hiding in the dark corners of your software ecosystem.

### Getting Started

The Software Catalog is available to browse at `/catalog`. If you've followed
[Getting Started with Backstage](https://github.com/backstage/backstage/blob/HEAD/docs/getting-started/index.md), you should be able to
browse the catalog at `http://localhost:3000`.

![screenshot of software catalog](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-catalog/software-catalog-home.png)

### Adding components to the catalog

The source of truth for the components in your software catalog are [metadata YAML files](https://github.com/backstage/backstage/blob/HEAD/docs/features/software-catalog/descriptor-format.md) stored in source control (GitHub, GitHub
Enterprise, GitLab, ...). Repositories can include one or multiple metadata
files. Usually the metadata file is located in the repository root. This is not
a formal requirement & metadata files can be placed anywhere in the repository.

There are 3 ways to add components to the catalog:

1. Manually register components
2. Creating new components through Backstage
3. Integrating with an [external source](https://github.com/backstage/backstage/blob/HEAD/docs/features/software-catalog/external-integrations/index.md)

#### Manually register components

Users can register new components by going to `/create` and clicking the
**REGISTER EXISTING COMPONENT** button:

![screenshot of manually register existing component](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-catalog/bsc-register-1.png)

Backstage expects the full URL to the YAML in your source control. Example:

```bash
https://github.com/backstage/backstage/blob/master/packages/catalog-model/examples/components/artist-lookup-component.yaml
```

_More examples can be found
[here](https://github.com/backstage/backstage/tree/master/packages/catalog-model/examples)._

![screenshot of creating new components](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-catalog/bsc-register-2.png)

It is important to note that any kind of software can be registered in
Backstage. Even if the software is not maintained by your company (SaaS
offering, for example) it is still useful to create components for tracking
ownership.

#### Creating new components through Backstage

All software created through the
[Backstage Software Templates](https://github.com/backstage/backstage/blob/HEAD/docs/features/software-templates/index.md) are automatically
registered in the catalog.

#### Static catalog configuration

In addition to manually registering components, it is also possible to register
components through [static configuration](https://github.com/backstage/backstage/blob/HEAD/docs/conf/index.md). For example, the
above example can be added using the following configuration:

```yaml
catalog:
  locations:
    - type: url
      target: https://github.com/backstage/backstage/blob/master/packages/catalog-model/examples/components/artist-lookup-component.yaml
```

More information about catalog configuration can be found
[here](https://github.com/backstage/backstage/blob/HEAD/docs/features/software-catalog/configuration.md).

#### Updating component metadata

Teams owning the components are responsible for maintaining the metadata about
them, and do so using their normal Git workflow.

![screenshot of updating component metadata](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-catalog/bsc-edit.png)

Once the change has been merged, Backstage will automatically show the updated
metadata in the software catalog after a short while.

### Finding software in the catalog

By default, the software catalog shows components owned by the team of the logged
in user. But you can also switch to _All_ to see all the components across your
company's software ecosystem. Basic inline _search_ and _column filtering_ makes
it easy to browse a big set of components.

![screenshot of finding software in the catalog](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-catalog/bsc-search.png)

### Starring components

For easy and quick access to components you visit frequently, Backstage supports
_starring_ of components:

![screenshot of starred components](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-catalog/bsc-starred.png)

### Integrated tooling through plugins

The software catalog is a great way to organize the infrastructure tools you use
to manage the software. This is how Backstage creates one developer portal for
all your tools. Rather than asking teams to jump between different
infrastructure user interfaces (and incurring additional cognitive overhead each time they
make a context switch), most of these tools can be organized around the entities
in the catalog.

![screenshot of tools](https://backstage.io/assets/images/tabs-abfdf72185d3ceb1d92c4237f7f78809.png)

Your Backstage developer portal can be customized by incorporating
[existing open source plugins](https://github.com/backstage/backstage/tree/master/plugins),
or by [building your own](https://github.com/backstage/backstage/blob/HEAD/docs/plugins/index.md).

### Unprocessed Entities

Sometimes entities fail to process correctly. The **Unprocessed Entities** feature helps Backstage admins find and diagnose these entities to understand the state of the catalog.

To use this feature, check out the documentation for the [catalog-unprocessed-entities plugin](https://github.com/backstage/backstage/tree/master/plugins/catalog-unprocessed-entities) and its [backend module](https://github.com/backstage/backstage/tree/master/plugins/catalog-backend-module-unprocessed).

### Links

- [[Blog post] Backstage Service Catalog released in alpha](https://backstage.io/blog/2020/06/22/backstage-service-catalog-alpha)

## Software templates

> **Source:** [Software templates](https://backstage.io/docs/features/software-templates) · [Backstage docs](https://github.com/backstage/backstage), Apache 2.0

The Software Templates part of Backstage is a tool that can help you create
Components inside Backstage. By default, it has the ability to load skeletons of
code, template in some variables, and then publish the template to some
locations like GitHub or GitLab.

:::warning[Important]

When creating custom scaffolder actions, **use camelCase for action IDs** instead of kebab-case. Action IDs with dashes (like `fetch-component-id`) will cause template expressions like `${{ steps.fetch-component-id.output.componentId }}` to return `NaN` because the dashes are evaluated as subtraction operators in JavaScript expressions.

See the [Writing Custom Actions guide](https://github.com/backstage/backstage/blob/HEAD/docs/features/software-templates/writing-custom-actions.md#naming-conventions) for more details.

:::

### Prerequisites

These docs assume you have already gone over the [Backstage Getting Started](https://github.com/backstage/backstage/blob/HEAD/docs/getting-started/index.md) section and you are able to run Backstage locally or it has been deployed somewhere.

### Getting Started

Software Templates you have imported into Backstage can be found under `/create`.

If you're running Backstage locally, this will be `http://localhost:3000/create`.

Once there, you should see something that looks similar to this:

![Create Image](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-templates/create.png)

### Choose a template

When you select a template that you want to create, you'll be taken to the next
page which may or may not look different for each template. Each template can
ask for different input variables, and they are then passed to the templater
internally.

![Enter some variables](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-templates/template-picked.png)

Templates generally consist of a set of steps, and each step can have its own set of required or optional inputs, as you can see in the image below we are now prompted to input some GitHub repository information.

![Enter Backstage vars](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-templates/template-picked-2.png)

### Review page

Before you run the template, you'll be taken to a summary page where you can verify the inputs you have provided before we run the template.

This is a good time to double check that you have provided the correct information and allows you to go back and change any of the inputs if you need to.

![Review](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-templates/review.png)

### Run the template

Once you are happy with the inputs you have provided, you can click on the `Create` button to run the template.

![Templating Running](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-templates/running.png)

### Success

Once the template has finished running, you'll be taken to a success page where you can see the results of the template.

![Templating Complete](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-templates/complete.png)

### Failure

If it fails, you'll be able to click on each section to get the log from the
step that failed which can be helpful in debugging.

You can also cancel the running process. Once you clicked on button "Cancel", the abort signal
will be sent to a task and all next steps won't be executed. The current step will be cancelled
only if it supports it.

![Templating failed](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-templates/failed.png)

### View the Results

Once the template has finished running, and from the screenshot above, when its successful, you are presented with two links, clicking on them will take you to the templated repository we created!

### Disable Register Existing Component button

There could be situations where you would like to disable the
`Register Existing Component` button for your users.

To do so, you can disable the route binding in your `app-config.yaml`:

```yaml title="app-config.yaml"
app:
  routes:
    bindings:
      scaffolder.registerComponent: false
```

After the change, you should no longer see the button.

### Template Task List

Each execution of a template is treated as a unique task, identifiable by its own unique ID. To view a list of previously executed template tasks, navigate to the "Create" page and access the "Task List" from the context menu (represented by the vertical ellipsis, or 'kebab menu', icon in the upper right corner).

![Template Task List](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-templates/template-task-list.png)

### Starting Over

If you wish to re-run a previously executed template, navigate to the template tasks page. Locate the desired task and select the "Start Over" option from the context menu.

![Template Start Over](https://raw.githubusercontent.com/backstage/backstage/HEAD/docs/assets/software-templates/template-start-over.png)

This action will initiate a new execution of the selected template, pre-populated with the same parameters as the previous run, but these parameters can be edited before re-execution.

In the event of a failed template execution, the "Start Over" option can be used to re-execute the template. The parameters from the original run will be pre-filled, but they can be adjusted as needed before retrying the template.

### Want to see it in action?

The [Backstage Demo Site](https://demo.backstage.io/create) has a template you are able to run, which is where the screenshots in this document were taken from!
