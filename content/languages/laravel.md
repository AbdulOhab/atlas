---
title: "Laravel"
order: 4
summary: "The PHP framework end to end: request lifecycle, routing, middleware, controllers, Blade, validation, the query builder, migrations, Eloquent and authentication."
category: "Laravel"
level: Beginner
---

# Laravel

Laravel is a batteries-included PHP framework. This module follows a request through it: routing and middleware, controllers and responses, Blade views, validation, then the database layer and authentication.

## Fundamentals

### The problem

PHP made the web easy to start but hard to keep tidy: SQL in templates, a different structure in every project, and security left to each developer. In 2011 the leading framework, CodeIgniter, lacked features like built-in authentication. Taylor Otwell built Laravel to give PHP a complete, consistent framework with good defaults for everything a web app needs, and an API pleasant enough that people would enjoy using it.

### Goals

- **Batteries included:** routing, ORM, migrations, validation, auth, queues, mail, caching and testing all ship together.
- **Developer happiness.** Expressive, readable APIs and conventions over configuration.
- **Secure by default:** CSRF tokens, hashed passwords, escaped output and parameterized queries without extra work.
- **One way to structure an app,** so any Laravel developer can find their way around any Laravel project.

### The ideas everything else rests on

- **The request lifecycle.** Every request enters `public/index.php`, boots the application, passes through middleware to a route, runs a controller, and returns a response back out through the middleware.
- **The service container.** Laravel builds your classes for you and injects their dependencies, and service providers register what goes in it. Most of the "magic" is this container.
- **Eloquent ORM (Active Record).** Each table is a model class and each row an object that knows how to save itself. Relationships are methods.
- **Migrations** describe the schema as versioned code.
- **Facades and helpers** are short static-looking names (`Cache::get`) that resolve real objects from the container.

### Trade-offs

The convenience hides a lot. Facades and container resolution make it harder to trace where code comes from. Active Record makes it easy to write N+1 queries. Laravel is opinionated: working against its conventions costs more than working with them. And each request boots the framework again, unless you run Octane.

## Request Lifecycle

> **Source:** [Request Lifecycle](https://laravel.com/docs/lifecycle) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

When using any tool in the "real world", you feel more confident if you understand how that tool works. Application development is no different. When you understand how your development tools function, you feel more comfortable and confident using them.

The goal of this document is to give you a good, high-level overview of how the Laravel framework works. By getting to know the overall framework better, everything feels less "magical" and you will be more confident building your applications. If you don't understand all of the terms right away, don't lose heart! Just try to get a basic grasp of what is going on, and your knowledge will grow as you explore other sections of the documentation.

### Lifecycle Overview

#### First Steps

The entry point for all requests to a Laravel application is the `public/index.php` file. All requests are directed to this file by your web server (Apache / Nginx) configuration. The `index.php` file doesn't contain much code. Rather, it is a starting point for loading the rest of the framework.

The `index.php` file loads the Composer generated autoloader definition, and then retrieves an instance of the Laravel application from `bootstrap/app.php`. The first action taken by Laravel itself is to create an instance of the application / [service container](https://laravel.com/docs/container).

#### HTTP / Console Kernels

Next, the incoming request is sent to either the HTTP kernel or the console kernel, using the `handleRequest` or `handleCommand` methods of the application instance, depending on the type of request entering the application. These two kernels serve as the central location through which all requests flow. For now, let's just focus on the HTTP kernel, which is an instance of `Illuminate\Foundation\Http\Kernel`.

The HTTP kernel defines an array of `bootstrappers` that will be run before the request is executed. These bootstrappers configure error handling, configure logging, [detect the application environment](https://laravel.com/docs/configuration#environment-configuration), and perform other tasks that need to be done before the request is actually handled. Typically, these classes handle internal Laravel configuration that you do not need to worry about.

The HTTP kernel is also responsible for passing the request through the application's middleware stack. These middleware handle reading and writing the [HTTP session](https://laravel.com/docs/session), determining if the application is in maintenance mode, [verifying the CSRF token](https://laravel.com/docs/csrf), and more. We'll talk more about these soon.

The method signature for the HTTP kernel's `handle` method is quite simple: it receives a `Request` and returns a `Response`. Think of the kernel as being a big black box that represents your entire application. Feed it HTTP requests and it will return HTTP responses.

#### Service Providers

One of the most important kernel bootstrapping actions is loading the [service providers](https://laravel.com/docs/providers) for your application. Service providers are responsible for bootstrapping all of the framework's various components, such as the database, queue, validation, and routing components.

Laravel will iterate through this list of providers and instantiate each of them. After instantiating the providers, the `register` method will be called on all of the providers. Then, once all of the providers have been registered, the `boot` method will be called on each provider. This is so service providers may depend on every container binding being registered and available by the time their `boot` method is executed.

Essentially every major feature offered by Laravel is bootstrapped and configured by a service provider. Since they bootstrap and configure so many features offered by the framework, service providers are the most important aspect of the entire Laravel bootstrap process.

While the framework internally uses dozens of service providers, you also have the option to create your own. You can find a list of the user-defined or third-party service providers that your application is using in the `bootstrap/providers.php` file.

#### Routing

Once the application has been bootstrapped and all service providers have been registered, the `Request` will be handed off to the router for dispatching. The router will dispatch the request to a route or controller, as well as run any route specific middleware.

Middleware provide a convenient mechanism for filtering or examining HTTP requests entering your application. For example, Laravel includes a middleware that verifies if the user of your application is authenticated. If the user is not authenticated, the middleware will redirect the user to the login screen. However, if the user is authenticated, the middleware will allow the request to proceed further into the application. Some middleware are assigned to all routes within the application, like `PreventRequestsDuringMaintenance`, while some are only assigned to specific routes or route groups. You can learn more about middleware by reading the complete [middleware documentation](https://laravel.com/docs/middleware).

If the request passes through all of the matched route's assigned middleware, the route or controller method will be executed and the response returned by the route or controller method will be sent back through the route's chain of middleware.

#### Finishing Up

Once the route or controller method returns a response, the response will travel back outward through the route's middleware, giving the application a chance to modify or examine the outgoing response.

Finally, once the response travels back through the middleware, the HTTP kernel's `handle` method returns the response object to the `handleRequest` of the application instance, and this method calls the `send` method on the returned response. The `send` method sends the response content to the user's web browser. We've now completed our journey through the entire Laravel request lifecycle!

### Focus on Service Providers

Service providers are truly the key to bootstrapping a Laravel application. The application instance is created, the service providers are registered, and the request is handed to the bootstrapped application. It's really that simple!

Having a firm grasp of how a Laravel application is built and bootstrapped via service providers is very valuable. Your application's user-defined service providers are stored in the `app/Providers` directory.

By default, the `AppServiceProvider` is fairly empty. This provider is a great place to add your application's own bootstrapping and service container bindings. For large applications, you may wish to create several service providers, each with more granular bootstrapping for specific services used by your application.

## Directory Structure

> **Source:** [Directory Structure](https://laravel.com/docs/structure) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

The default Laravel application structure is intended to provide a great starting point for both large and small applications. But you are free to organize your application however you like. Laravel imposes almost no restrictions on where any given class is located - as long as Composer can autoload the class.

### The Root Directory

#### The App Directory

The `app` directory contains the core code of your application. We'll explore this directory in more detail soon; however, almost all of the classes in your application will be in this directory.

#### The Bootstrap Directory

The `bootstrap` directory contains the `app.php` file which bootstraps the framework. This directory also houses a `cache` directory which contains framework generated files for performance optimization such as the route and services cache files.

#### The Config Directory

The `config` directory, as the name implies, contains all of your application's configuration files. It's a great idea to read through all of these files and familiarize yourself with all of the options available to you.

#### The Database Directory

The `database` directory contains your database migrations, model factories, and seeds. If you wish, you may also use this directory to hold an SQLite database.

#### The Public Directory

The `public` directory contains the `index.php` file, which is the entry point for all requests entering your application and configures autoloading. This directory also houses your assets such as images, JavaScript, and CSS.

#### The Resources Directory

The `resources` directory contains your [views](https://laravel.com/docs/views) as well as your raw, un-compiled assets such as CSS or JavaScript.

#### The Routes Directory

The `routes` directory contains all of the route definitions for your application. By default, two route files are included with Laravel: `web.php` and `console.php`.

The `web.php` file contains routes that Laravel places in the `web` middleware group, which provides session state, CSRF protection, and cookie encryption. If your application does not offer a stateless, RESTful API then all your routes will most likely be defined in the `web.php` file.

The `console.php` file is where you may define all of your closure-based console commands. Each closure is bound to a command instance allowing a simple approach to interacting with each command's IO methods. Even though this file does not define HTTP routes, it defines console based entry points (routes) into your application. You may also [schedule](https://laravel.com/docs/scheduling) tasks in the `console.php` file.

Optionally, you may install additional route files for API routes (`api.php`) and broadcasting channels (`channels.php`), via the `install:api` and `install:broadcasting` Artisan commands.

The `api.php` file contains routes that are intended to be stateless, so requests entering the application through these routes are intended to be authenticated [via tokens](https://laravel.com/docs/sanctum) and will not have access to session state.

The `channels.php` file is where you may register all of the [event broadcasting](https://laravel.com/docs/broadcasting) channels that your application supports.

#### The Storage Directory

The `storage` directory contains your logs, compiled Blade templates, file based sessions, file caches, and other files generated by the framework. This directory is segregated into `app`, `framework`, and `logs` directories. The `app` directory may be used to store any files generated by your application. The `framework` directory is used to store framework generated files and caches. Finally, the `logs` directory contains your application's log files.

The `storage/app/public` directory may be used to store user-generated files, such as profile avatars, that should be publicly accessible. You should create a symbolic link at `public/storage` which points to this directory. You may create the link using the `php artisan storage:link` Artisan command.

#### The Tests Directory

The `tests` directory contains your automated tests. Example [Pest](https://pestphp.com) or [PHPUnit](https://phpunit.de/) unit tests and feature tests are provided out of the box. Each test class should be suffixed with the word `Test`. You may run your tests using the `/vendor/bin/pest` or `/vendor/bin/phpunit` commands. Or, if you would like a more detailed and beautiful representation of your test results, you may run your tests using the `php artisan test` Artisan command.

#### The Vendor Directory

The `vendor` directory contains your [Composer](https://getcomposer.org) dependencies.

### The App Directory

The majority of your application is housed in the `app` directory. By default, this directory is namespaced under `App` and is autoloaded by Composer using the [PSR-4 autoloading standard](https://www.php-fig.org/psr/psr-4/).

By default, the `app` directory contains the `Http`, `Models`, and `Providers` directories. However, over time, a variety of other directories will be generated inside the app directory as you use the make Artisan commands to generate classes. For example, the `app/Console` directory will not exist until you execute the `make:command` Artisan command to generate a command class.

Both the `Console` and `Http` directories are further explained in their respective sections below, but think of the `Console` and `Http` directories as providing an API into the core of your application. The HTTP protocol and CLI are both mechanisms to interact with your application, but do not actually contain application logic. In other words, they are two ways of issuing commands to your application. The `Console` directory contains all of your Artisan commands, while the `Http` directory contains your controllers, middleware, and requests.

> **Note:**
> Many of the classes in the `app` directory can be generated by Artisan via commands. To review the available commands, run the `php artisan list make` command in your terminal.

#### The Broadcasting Directory

The `Broadcasting` directory contains all of the broadcast channel classes for your application. These classes are generated using the `make:channel` command. This directory does not exist by default, but will be created for you when you create your first channel. To learn more about channels, check out the documentation on [event broadcasting](https://laravel.com/docs/broadcasting).

#### The Console Directory

The `Console` directory contains all of the custom Artisan commands for your application. These commands may be generated using the `make:command` command.

#### The Events Directory

This directory does not exist by default, but will be created for you by the `event:generate` and `make:event` Artisan commands. The `Events` directory houses [event classes](https://laravel.com/docs/events). Events may be used to alert other parts of your application that a given action has occurred, providing a great deal of flexibility and decoupling.

#### The Exceptions Directory

The `Exceptions` directory contains all of the custom exceptions for your application. These exceptions may be generated using the `make:exception` command.

#### The Http Directory

The `Http` directory contains your controllers, middleware, and form requests. Almost all of the logic to handle requests entering your application will be placed in this directory.

#### The Jobs Directory

This directory does not exist by default, but will be created for you if you execute the `make:job` Artisan command. The `Jobs` directory houses the [queueable jobs](https://laravel.com/docs/queues) for your application. Jobs may be queued by your application or run synchronously within the current request lifecycle. Jobs that run synchronously during the current request are sometimes referred to as "commands" since they are an implementation of the [command pattern](https://en.wikipedia.org/wiki/Command_pattern).

#### The Listeners Directory

This directory does not exist by default, but will be created for you if you execute the `event:generate` or `make:listener` Artisan commands. The `Listeners` directory contains the classes that handle your [events](https://laravel.com/docs/events). Event listeners receive an event instance and perform logic in response to the event being fired. For example, a `UserRegistered` event might be handled by a `SendWelcomeEmail` listener.

#### The Mail Directory

This directory does not exist by default, but will be created for you if you execute the `make:mail` Artisan command. The `Mail` directory contains all of your [classes that represent emails](https://laravel.com/docs/mail) sent by your application. Mail objects allow you to encapsulate all of the logic of building an email in a single, simple class that may be sent using the `Mail::send` method.

#### The Models Directory

The `Models` directory contains all of your [Eloquent model classes](https://laravel.com/docs/eloquent). The Eloquent ORM included with Laravel provides a beautiful, simple ActiveRecord implementation for working with your database. Each database table has a corresponding "Model" which is used to interact with that table. Models allow you to query for data in your tables, as well as insert new records into the table.

#### The Notifications Directory

This directory does not exist by default, but will be created for you if you execute the `make:notification` Artisan command. The `Notifications` directory contains all of the "transactional" [notifications](https://laravel.com/docs/notifications) that are sent by your application, such as simple notifications about events that happen within your application. Laravel's notification feature abstracts sending notifications over a variety of drivers such as email, Slack, SMS, or stored in a database.

#### The Policies Directory

This directory does not exist by default, but will be created for you if you execute the `make:policy` Artisan command. The `Policies` directory contains the [authorization policy classes](https://laravel.com/docs/authorization) for your application. Policies are used to determine if a user can perform a given action against a resource.

#### The Providers Directory

The `Providers` directory contains all of the [service providers](https://laravel.com/docs/providers) for your application. Service providers bootstrap your application by binding services in the service container, registering events, or performing any other tasks to prepare your application for incoming requests.

In a fresh Laravel application, this directory will already contain the `AppServiceProvider`. You are free to add your own providers to this directory as needed.

#### The Rules Directory

This directory does not exist by default, but will be created for you if you execute the `make:rule` Artisan command. The `Rules` directory contains the custom validation rule objects for your application. Rules are used to encapsulate complicated validation logic in a simple object. For more information, check out the [validation documentation](https://laravel.com/docs/validation).

## Routing

> **Source:** [Routing](https://laravel.com/docs/routing) · [Laravel docs](https://github.com/laravel/docs), MIT

### Basic Routing

The most basic Laravel routes accept a URI and a closure, providing a very simple and expressive method of defining routes and behavior without complicated routing configuration files:

```php
use Illuminate\Support\Facades\Route;

Route::get('/greeting', function () {
    return 'Hello World';
});
```

#### The Default Route Files

All Laravel routes are defined in your route files, which are located in the `routes` directory. These files are automatically loaded by Laravel using the configuration specified in your application's `bootstrap/app.php` file. The `routes/web.php` file defines routes that are for your web interface. These routes are assigned the `web` [middleware group](https://laravel.com/docs/middleware#laravels-default-middleware-groups), which provides features like session state and CSRF protection.

For most applications, you will begin by defining routes in your `routes/web.php` file. The routes defined in `routes/web.php` may be accessed by entering the defined route's URL in your browser. For example, you may access the following route by navigating to `http://example.com/user` in your browser:

```php
use App\Http\Controllers\UserController;

Route::get('/user', [UserController::class, 'index']);
```

##### API Routes

If your application will also offer a stateless API, you may enable API routing using the `install:api` Artisan command:

```shell
php artisan install:api
```

The `install:api` command installs [Laravel Sanctum](https://laravel.com/docs/sanctum), which provides a robust, yet simple API token authentication guard which can be used to authenticate third-party API consumers, SPAs, or mobile applications. In addition, the `install:api` command creates the `routes/api.php` file:

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

Of course, you are free to omit the `auth:sanctum` middleware on routes that should be publicly accessible.

The routes in `routes/api.php` are stateless and are assigned to the `api` [middleware group](https://laravel.com/docs/middleware#laravels-default-middleware-groups). Additionally, the `/api` URI prefix is automatically applied to these routes, so you do not need to manually apply it to every route in the file. You may change the prefix by modifying your application's `bootstrap/app.php` file:

```php
->withRouting(
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api/admin',
    // ...
)
```

##### Available Router Methods

The router allows you to register routes that respond to any HTTP verb:

```php
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

Sometimes you may need to register a route that responds to multiple HTTP verbs. You may do so using the `match` method. Or, you may even register a route that responds to all HTTP verbs using the `any` method:

```php
Route::match(['get', 'post'], '/', function () {
    // ...
});

Route::any('/', function () {
    // ...
});
```

> **Note:**
> When defining multiple routes that share the same URI, routes using the `get`, `post`, `put`, `patch`, `delete`, and `options` methods should be defined before routes using the `any`, `match`, and `redirect` methods. This ensures the incoming request is matched with the correct route.

##### Dependency Injection

You may type-hint any dependencies required by your route in your route's callback signature. The declared dependencies will automatically be resolved and injected into the callback by the Laravel [service container](https://laravel.com/docs/container). For example, you may type-hint the `Illuminate\Http\Request` class to have the current HTTP request automatically injected into your route callback:

```php
use Illuminate\Http\Request;

Route::get('/users', function (Request $request) {
    // ...
});
```

##### CSRF Protection

Remember, any HTML forms pointing to `POST`, `PUT`, `PATCH`, or `DELETE` routes that are defined in the `web` routes file should include a CSRF token field. Otherwise, the request will be rejected. You can read more about CSRF protection in the [CSRF documentation](https://laravel.com/docs/csrf):

```blade
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

#### Redirect Routes

If you are defining a route that redirects to another URI, you may use the `Route::redirect` method. This method provides a convenient shortcut so that you do not have to define a full route or controller for performing a simple redirect:

```php
Route::redirect('/here', '/there');
```

By default, `Route::redirect` returns a `302` status code. You may customize the status code using the optional third parameter:

```php
Route::redirect('/here', '/there', 301);
```

Or, you may use the `Route::permanentRedirect` method to return a `301` status code:

```php
Route::permanentRedirect('/here', '/there');
```

> **Warning:**
> When using route parameters in redirect routes, the following parameters are reserved by Laravel and cannot be used: `destination` and `status`.

#### View Routes

If your route only needs to return a [view](https://laravel.com/docs/views), you may use the `Route::view` method. Like the `redirect` method, this method provides a simple shortcut so that you do not have to define a full route or controller. The `view` method accepts a URI as its first argument and a view name as its second argument. In addition, you may provide an array of data to pass to the view as an optional third argument:

```php
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

> **Warning:**
> When using route parameters in view routes, the following parameters are reserved by Laravel and cannot be used: `view`, `data`, `status`, and `headers`.

#### Listing Your Routes

The `route:list` Artisan command can easily provide an overview of all of the routes that are defined by your application:

```shell
php artisan route:list
```

By default, the route middleware that are assigned to each route will not be displayed in the `route:list` output; however, you can instruct Laravel to display the route middleware and middleware group names by adding the `-v` option to the command:

```shell
php artisan route:list -v

# Expand middleware groups...
php artisan route:list -vv
```

You may also instruct Laravel to only show routes whose URI contains a given string:

```shell
php artisan route:list --path=api
```

In addition, you may instruct Laravel to hide any routes that are defined by third-party packages by providing the `--except-vendor` option when executing the `route:list` command:

```shell
php artisan route:list --except-vendor
```

Likewise, you may also instruct Laravel to only show routes that are defined by third-party packages by providing the `--only-vendor` option when executing the `route:list` command:

```shell
php artisan route:list --only-vendor
```

#### Routing Customization

By default, your application's routes are configured and loaded by the `bootstrap/app.php` file:

```php
<?php

use Illuminate\Foundation\Application;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )->create();
```

However, sometimes you may want to define an entirely new file to contain a subset of your application's routes. To accomplish this, you may provide a `then` closure to the `withRouting` method. Within this closure, you may register any additional routes that are necessary for your application:

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
    then: function () {
        Route::middleware('api')
            ->prefix('webhooks')
            ->name('webhooks.')
            ->group(base_path('routes/webhooks.php'));
    },
)
```

Or, you may even take complete control over route registration by providing a `using` closure to the `withRouting` method. When this argument is passed, no HTTP routes will be registered by the framework and you are responsible for manually registering all routes:

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    commands: __DIR__.'/../routes/console.php',
    using: function () {
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        Route::middleware('web')
            ->group(base_path('routes/web.php'));
    },
)
```

### Route Parameters

#### Required Parameters

Sometimes you will need to capture segments of the URI within your route. For example, you may need to capture a user's ID from the URL. You may do so by defining route parameters:

```php
Route::get('/user/{id}', function (string $id) {
    return 'User '.$id;
});
```

You may define as many route parameters as required by your route:

```php
Route::get('/posts/{post}/comments/{comment}', function (string $postId, string $commentId) {
    // ...
});
```

Route parameters are always encased within `{}` braces and should consist of alphabetic characters. Underscores (`_`) are also acceptable within route parameter names. Route parameters are injected into route callbacks / controllers based on their order - the names of the route callback / controller arguments do not matter.

##### Parameters and Dependency Injection

If your route has dependencies that you would like the Laravel service container to automatically inject into your route's callback, you should list your route parameters after your dependencies:

```php
use Illuminate\Http\Request;

Route::get('/user/{id}', function (Request $request, string $id) {
    return 'User '.$id;
});
```

#### Optional Parameters

Occasionally you may need to specify a route parameter that may not always be present in the URI. You may do so by placing a `?` mark after the parameter name. Make sure to give the route's corresponding variable a default value:

```php
Route::get('/user/{name?}', function (?string $name = null) {
    return $name;
});

Route::get('/user/{name?}', function (?string $name = 'John') {
    return $name;
});
```

#### Regular Expression Constraints

You may constrain the format of your route parameters using the `where` method on a route instance. The `where` method accepts the name of the parameter and a regular expression defining how the parameter should be constrained:

```php
Route::get('/user/{name}', function (string $name) {
    // ...
})->where('name', '[A-Za-z]+');

Route::get('/user/{id}', function (string $id) {
    // ...
})->where('id', '[0-9]+');

Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->where(['id' => '[0-9]+', 'name' => '[a-z]+']);
```

For convenience, some commonly used regular expression patterns have helper methods that allow you to quickly add pattern constraints to your routes:

```php
Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->whereNumber('id')->whereAlpha('name');

Route::get('/user/{name}', function (string $name) {
    // ...
})->whereAlphaNumeric('name');

Route::get('/user/{id}', function (string $id) {
    // ...
})->whereUuid('id');

Route::get('/user/{id}', function (string $id) {
    // ...
})->whereUlid('id');

Route::get('/category/{category}', function (string $category) {
    // ...
})->whereIn('category', ['movie', 'song', 'painting']);

Route::get('/category/{category}', function (string $category) {
    // ...
})->whereIn('category', CategoryEnum::cases());
```

If the incoming request does not match the route pattern constraints, a 404 HTTP response will be returned.

##### Global Constraints

If you would like a route parameter to always be constrained by a given regular expression, you may use the `pattern` method. You should define these patterns in the `boot` method of your application's `App\Providers\AppServiceProvider` class:

```php
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::pattern('id', '[0-9]+');
}
```

Once the pattern has been defined, it is automatically applied to all routes using that parameter name:

```php
Route::get('/user/{id}', function (string $id) {
    // Only executed if {id} is numeric...
});
```

##### Encoded Forward Slashes

The Laravel routing component allows all characters except `/` to be present within route parameter values. You must explicitly allow `/` to be part of your placeholder using a `where` condition regular expression:

```php
Route::get('/search/{search}', function (string $search) {
    return $search;
})->where('search', '.*');
```

> **Warning:**
> Encoded forward slashes are only supported within the last route segment.

### Named Routes

Named routes allow the convenient generation of URLs or redirects for specific routes. You may specify a name for a route by chaining the `name` method onto the route definition:

```php
Route::get('/user/profile', function () {
    // ...
})->name('profile');
```

You may also specify route names for controller actions:

```php
Route::get(
    '/user/profile',
    [UserProfileController::class, 'show']
)->name('profile');
```

> **Warning:**
> Route names should always be unique.

##### Generating URLs to Named Routes

Once you have assigned a name to a given route, you may use the route's name when generating URLs or redirects via Laravel's `route` and `redirect` helper functions:

```php
// Generating URLs...
$url = route('profile');

// Generating Redirects...
return redirect()->route('profile');

return to_route('profile');
```

If the named route defines parameters, you may pass the parameters as the second argument to the `route` function. The given parameters will automatically be inserted into the generated URL in their correct positions:

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1]);
```

If you pass additional parameters in the array, those key / value pairs will automatically be added to the generated URL's query string:

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']);

// http://example.com/user/1/profile?photos=yes
```

> **Note:**
> Sometimes, you may wish to specify request-wide default values for URL parameters, such as the current locale. To accomplish this, you may use the [URL::defaults method](https://laravel.com/docs/urls#default-values).

##### Inspecting the Current Route

If you would like to determine if the current request was routed to a given named route, you may use the `named` method on a Route instance. For example, you may check the current route name from a route middleware:

```php
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Handle an incoming request.
 *
 * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
 */
public function handle(Request $request, Closure $next): Response
{
    if ($request->route()->named('profile')) {
        // ...
    }

    return $next($request);
}
```

### Route Groups

Route groups allow you to share route attributes, such as middleware, across a large number of routes without needing to define those attributes on each individual route.

Nested groups attempt to intelligently "merge" attributes with their parent group. Middleware and `where` conditions are merged while names and prefixes are appended. Namespace delimiters and slashes in URI prefixes are automatically added where appropriate.

#### Middleware

To assign [middleware](https://laravel.com/docs/middleware) to all routes within a group, you may use the `middleware` method before defining the group. Middleware are executed in the order they are listed in the array:

```php
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // Uses first & second middleware...
    });

    Route::get('/user/profile', function () {
        // Uses first & second middleware...
    });
});
```

#### Controllers

If a group of routes all utilize the same [controller](https://laravel.com/docs/controllers), you may use the `controller` method to define the common controller for all of the routes within the group. Then, when defining the routes, you only need to provide the controller method that they invoke:

```php
use App\Http\Controllers\OrderController;

Route::controller(OrderController::class)->group(function () {
    Route::get('/orders/{id}', 'show');
    Route::post('/orders', 'store');
});
```

#### Subdomain Routing

Route groups may also be used to handle subdomain routing. Subdomains may be assigned route parameters just like route URIs, allowing you to capture a portion of the subdomain for usage in your route or controller. The subdomain may be specified by calling the `domain` method before defining the group:

```php
Route::domain('{account}.example.com')->group(function () {
    Route::get('/user/{id}', function (string $account, string $id) {
        // ...
    });
});
```

#### Route Prefixes

The `prefix` method may be used to prefix each route in the group with a given URI. For example, you may want to prefix all route URIs within the group with `admin`:

```php
Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        // Matches The "/admin/users" URL
    });
});
```

#### Route Name Prefixes

The `name` method may be used to prefix each route name in the group with a given string. For example, you may want to prefix the names of all of the routes in the group with `admin`. The given string is prefixed to the route name exactly as it is specified, so we will be sure to provide the trailing `.` character in the prefix:

```php
Route::name('admin.')->group(function () {
    Route::get('/users', function () {
        // Route assigned name "admin.users"...
    })->name('users');
});
```

### Route Model Binding

When injecting a model ID to a route or controller action, you will often query the database to retrieve the model that corresponds to that ID. Laravel route model binding provides a convenient way to automatically inject the model instances directly into your routes. For example, instead of injecting a user's ID, you can inject the entire `User` model instance that matches the given ID.

#### Implicit Binding

Laravel automatically resolves Eloquent models defined in routes or controller actions whose type-hinted variable names match a route segment name. For example:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
});
```

Since the `$user` variable is type-hinted as the `App\Models\User` Eloquent model and the variable name matches the `{user}` URI segment, Laravel will automatically inject the model instance that has an ID matching the corresponding value from the request URI. If a matching model instance is not found in the database, a 404 HTTP response will automatically be generated.

Of course, implicit binding is also possible when using controller methods. Again, note the `{user}` URI segment matches the `$user` variable in the controller which contains an `App\Models\User` type-hint:

```php
use App\Http\Controllers\UserController;
use App\Models\User;

// Route definition...
Route::get('/users/{user}', [UserController::class, 'show']);

// Controller method definition...
public function show(User $user)
{
    return view('user.profile', ['user' => $user]);
}
```

##### Soft Deleted Models

Typically, implicit model binding will not retrieve models that have been [soft deleted](https://laravel.com/docs/eloquent#soft-deleting). However, you may instruct the implicit binding to retrieve these models by chaining the `withTrashed` method onto your route's definition:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
})->withTrashed();
```

##### Customizing the Key

Sometimes you may wish to resolve Eloquent models using a column other than `id`. To do so, you may specify the column in the route parameter definition:

```php
use App\Models\Post;

Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});
```

If you would like model binding to always use a database column other than `id` when retrieving a given model class, you may apply the `RouteKey` attribute to the Eloquent model:

```php
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Model;

#[RouteKey('slug')]
class Post extends Model
{
    // ...
}
```

##### Custom Keys and Scoping

When implicitly binding multiple Eloquent models in a single route definition, you may wish to scope the second Eloquent model such that it must be a child of the previous Eloquent model. For example, consider this route definition that retrieves a blog post by slug for a specific user:

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

When using a custom keyed implicit binding as a nested route parameter, Laravel will automatically scope the query to retrieve the nested model by its parent using conventions to guess the relationship name on the parent. In this case, it will be assumed that the `User` model has a relationship named `posts` (the plural form of the route parameter name) which can be used to retrieve the `Post` model.

If you wish, you may instruct Laravel to scope "child" bindings even when a custom key is not provided. To do so, you may invoke the `scopeBindings` method when defining your route:

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    return $post;
})->scopeBindings();
```

Or, you may instruct an entire group of route definitions to use scoped bindings:

```php
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    });
});
```

Similarly, you may explicitly instruct Laravel to not scope bindings by invoking the `withoutScopedBindings` method:

```php
Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
})->withoutScopedBindings();
```

##### Customizing Missing Model Behavior

Typically, a 404 HTTP response will be generated if an implicitly bound model is not found. However, you may customize this behavior by calling the `missing` method when defining your route. The `missing` method accepts a closure that will be invoked if an implicitly bound model cannot be found:

```php
use App\Http\Controllers\LocationsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::get('/locations/{location:slug}', [LocationsController::class, 'show'])
    ->name('locations.view')
    ->missing(function (Request $request) {
        return Redirect::route('locations.index');
    });
```

#### Implicit Enum Binding

PHP 8.1 introduced support for [Enums](https://www.php.net/manual/en/language.enumerations.backed.php). To complement this feature, Laravel allows you to type-hint a [string-backed Enum](https://www.php.net/manual/en/language.enumerations.backed.php) on your route definition and Laravel will only invoke the route if that route segment corresponds to a valid Enum value. Otherwise, a 404 HTTP response will be returned automatically. For example, given the following Enum:

```php
<?php

namespace App\Enums;

enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

You may define a route that will only be invoked if the `{category}` route segment is `fruits` or `people`. Otherwise, Laravel will return a 404 HTTP response:

```php
use App\Enums\Category;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

#### Explicit Binding

You are not required to use Laravel's implicit, convention based model resolution in order to use model binding. You can also explicitly define how route parameters correspond to models. To register an explicit binding, use the router's `model` method to specify the class for a given parameter. You should define your explicit model bindings at the beginning of the `boot` method of your `AppServiceProvider` class:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::model('user', User::class);
}
```

Next, define a route that contains a `{user}` parameter:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    // ...
});
```

Since we have bound all `{user}` parameters to the `App\Models\User` model, an instance of that class will be injected into the route. So, for example, a request to `users/1` will inject the `User` instance from the database which has an ID of `1`.

If a matching model instance is not found in the database, a 404 HTTP response will be automatically generated.

##### Customizing the Resolution Logic

If you wish to define your own model binding resolution logic, you may use the `Route::bind` method. The closure you pass to the `bind` method will receive the value of the URI segment and should return the instance of the class that should be injected into the route. Again, this customization should take place in the `boot` method of your application's `AppServiceProvider`:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::bind('user', function (string $value) {
        return User::where('name', $value)->firstOrFail();
    });
}
```

Alternatively, you may override the `resolveRouteBinding` method on your Eloquent model. This method will receive the value of the URI segment and should return the instance of the class that should be injected into the route:

```php
/**
 * Retrieve the model for a bound value.
 *
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveRouteBinding($value, $field = null)
{
    return $this->where('name', $value)->firstOrFail();
}
```

If a route is utilizing [implicit binding scoping](#implicit-model-binding-scoping), the `resolveChildRouteBinding` method will be used to resolve the child binding of the parent model:

```php
/**
 * Retrieve the child model for a bound value.
 *
 * @param  string  $childType
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveChildRouteBinding($childType, $value, $field)
{
    return parent::resolveChildRouteBinding($childType, $value, $field);
}
```

### Fallback Routes

Using the `Route::fallback` method, you may define a route that will be executed when no other route matches the incoming request. Typically, unhandled requests will automatically render a "404" page via your application's exception handler. However, since you would typically define the `fallback` route within your `routes/web.php` file, all middleware in the `web` middleware group will apply to the route. You are free to add additional middleware to this route as needed:

```php
Route::fallback(function () {
    // ...
});
```

### Rate Limiting

#### Defining Rate Limiters

Laravel includes powerful and customizable rate limiting services that you may utilize to restrict the amount of traffic for a given route or group of routes. To get started, you should define rate limiter configurations that meet your application's needs.

Rate limiters may be defined within the `boot` method of your application's `App\Providers\AppServiceProvider` class:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });
}
```

Rate limiters are defined using the `RateLimiter` facade's `for` method. The `for` method accepts a rate limiter name and a closure that returns the limit configuration that should apply to routes that are assigned to the rate limiter. Limit configuration are instances of the `Illuminate\Cache\RateLimiting\Limit` class. This class contains helpful "builder" methods so that you can quickly define your limit. The rate limiter name may be any string you wish:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(1000);
    });
}
```

If the incoming request exceeds the specified rate limit, a response with a 429 HTTP status code will automatically be returned by Laravel. If you would like to define your own response that should be returned by a rate limit, you may use the `response` method:

```php
RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000)->response(function (Request $request, array $headers) {
        return response('Custom response...', 429, $headers);
    });
});
```

Since rate limiter callbacks receive the incoming HTTP request instance, you may build the appropriate rate limit dynamically based on the incoming request or authenticated user:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()?->vipCustomer()
        ? Limit::none()
        : Limit::perHour(10);
});
```

##### Segmenting Rate Limits

Sometimes you may wish to segment rate limits by some arbitrary value. For example, you may wish to allow users to access a given route 100 times per minute per IP address. To accomplish this, you may use the `by` method when building your rate limit:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
        ? Limit::none()
        : Limit::perMinute(100)->by($request->ip());
});
```

To illustrate this feature using another example, we can limit access to the route to 100 times per minute per authenticated user ID or 10 times per minute per IP address for guests:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(100)->by($request->user()->id)
        : Limit::perMinute(10)->by($request->ip());
});
```

##### Multiple Rate Limits

If needed, you may return an array of rate limits for a given rate limiter configuration. Each rate limit will be evaluated for the route based on the order they are placed within the array:

```php
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(500),
        Limit::perMinute(3)->by($request->input('email')),
    ];
});
```

If you're assigning multiple rate limits segmented by identical `by` values, you should ensure that each `by` value is unique. The easiest way to achieve this is to prefix the values given to the `by` method:

```php
RateLimiter::for('uploads', function (Request $request) {
    return [
        Limit::perMinute(10)->by('minute:'.$request->user()->id),
        Limit::perDay(1000)->by('day:'.$request->user()->id),
    ];
});
```

##### Response-Based Rate Limiting

In addition to rate limiting incoming requests, Laravel allows you to rate limit based on the response using the `after` method. This is useful when you only want to count certain responses toward the rate limit, such as validation errors, 404 responses, or other specific HTTP status codes.

The `after` method accepts a closure that receives the response and should return `true` if the response should be counted toward the rate limit, or `false` if it should be ignored. This is particularly useful for preventing enumeration attacks by limiting consecutive 404 responses, or allowing users to retry requests that fail validation without exhausting their rate limit on an endpoint that should only throttle successful operations:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

RateLimiter::for('resource-not-found', function (Request $request) {
    return Limit::perMinute(10)
        ->by($request->user()?->id ?: $request->ip())
        ->after(function (Response $response) {
            // Only count 404 responses toward the rate limit to prevent enumeration...
            return $response->status() === 404;
        });
});
```

#### Attaching Rate Limiters to Routes

Rate limiters may be attached to routes or route groups using the `throttle` [middleware](https://laravel.com/docs/middleware). The throttle middleware accepts the name of the rate limiter you wish to assign to the route:

```php
Route::middleware(['throttle:uploads'])->group(function () {
    Route::post('/audio', function () {
        // ...
    });

    Route::post('/video', function () {
        // ...
    });
});
```

##### Throttling With Redis

By default, the `throttle` middleware is mapped to the `Illuminate\Routing\Middleware\ThrottleRequests` class. However, if you are using Redis as your application's cache driver, you may wish to instruct Laravel to use Redis to manage rate limiting. To do so, you should use the `throttleWithRedis` method in your application's `bootstrap/app.php` file. This method maps the `throttle` middleware to the `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` middleware class:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->throttleWithRedis();
    // ...
})
```

### Form Method Spoofing

HTML forms do not support `PUT`, `PATCH`, or `DELETE` actions. So, when defining `PUT`, `PATCH`, or `DELETE` routes that are called from an HTML form, you will need to add a hidden `_method` field to the form. The value sent with the `_method` field will be used as the HTTP request method:

```blade
<form action="/example" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

For convenience, you may use the `@method` [Blade directive](https://laravel.com/docs/blade) to generate the `_method` input field:

```blade
<form action="/example" method="POST">
    @method('PUT')
    @csrf
</form>
```

### Accessing the Current Route

You may use the `current`, `currentRouteName`, and `currentRouteAction` methods on the `Route` facade to access information about the route handling the incoming request:

```php
use Illuminate\Support\Facades\Route;

$route = Route::current(); // Illuminate\Routing\Route
$name = Route::currentRouteName(); // string
$action = Route::currentRouteAction(); // string
```

You may refer to the API documentation for both the [underlying class of the Route facade](https://api.laravel.com/docs/{{version}}/Illuminate/Routing/Router.html) and [Route instance](https://api.laravel.com/docs/{{version}}/Illuminate/Routing/Route.html) to review all of the methods that are available on the router and route classes.

### Cross-Origin Resource Sharing (CORS)

Laravel can automatically respond to CORS `OPTIONS` HTTP requests with values that you configure. The `OPTIONS` requests will automatically be handled by the `HandleCors` [middleware](https://laravel.com/docs/middleware) that is automatically included in your application's global middleware stack.

Sometimes, you may need to customize the CORS configuration values for your application. You may do so by publishing the `cors` configuration file using the `config:publish` Artisan command:

```shell
php artisan config:publish cors
```

This command will place a `cors.php` configuration file within your application's `config` directory.

> **Note:**
> For more information on CORS and CORS headers, please consult the [MDN web documentation on CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers).

### Route Caching

When deploying your application to production, you should take advantage of Laravel's route cache. Using the route cache will drastically decrease the amount of time it takes to register all of your application's routes. To generate a route cache, execute the `route:cache` Artisan command:

```shell
php artisan route:cache
```

After running this command, your cached routes file will be loaded on every request. Remember, if you add any new routes you will need to generate a fresh route cache. Because of this, you should only run the `route:cache` command during your project's deployment.

You may use the `route:clear` command to clear the route cache:

```shell
php artisan route:clear
```

## Middleware

> **Source:** [Middleware](https://laravel.com/docs/middleware) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

Middleware provide a convenient mechanism for inspecting and filtering HTTP requests entering your application. For example, Laravel includes a middleware that verifies the user of your application is authenticated. If the user is not authenticated, the middleware will redirect the user to your application's login screen. However, if the user is authenticated, the middleware will allow the request to proceed further into the application.

Additional middleware can be written to perform a variety of tasks besides authentication. For example, a logging middleware might log all incoming requests to your application. A variety of middleware are included in Laravel, including middleware for authentication and CSRF protection; however, all user-defined middleware are typically located in your application's `app/Http/Middleware` directory.

### Defining Middleware

To create a new middleware, use the `make:middleware` Artisan command:

```shell
php artisan make:middleware EnsureTokenIsValid
```

This command will place a new `EnsureTokenIsValid` class within your `app/Http/Middleware` directory. In this middleware, we will only allow access to the route if the supplied `token` input matches a specified value. Otherwise, we will redirect the users back to the `/home` URI:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->input('token') !== 'my-secret-token') {
            return redirect('/home');
        }

        return $next($request);
    }
}
```

As you can see, if the given `token` does not match our secret token, the middleware will return an HTTP redirect to the client; otherwise, the request will be passed further into the application. To pass the request deeper into the application (allowing the middleware to "pass"), you should call the `$next` callback with the `$request`.

It's best to envision middleware as a series of "layers" HTTP requests must pass through before they hit your application. Each layer can examine the request and even reject it entirely.

> **Note:**
> All middleware are resolved via the [service container](https://laravel.com/docs/container), so you may type-hint any dependencies you need within a middleware's constructor.

##### Middleware and Responses

Of course, a middleware can perform tasks before or after passing the request deeper into the application. For example, the following middleware would perform some task **before** the request is handled by the application:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BeforeMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Perform action

        return $next($request);
    }
}
```

However, this middleware would perform its task **after** the request is handled by the application:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AfterMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Perform action

        return $response;
    }
}
```

### Registering Middleware

#### Global Middleware

If you want a middleware to run during every HTTP request to your application, you may append it to the global middleware stack in your application's `bootstrap/app.php` file:

```php
use App\Http\Middleware\EnsureTokenIsValid;

->withMiddleware(function (Middleware $middleware): void {
     $middleware->append(EnsureTokenIsValid::class);
})
```

The `$middleware` object provided to the `withMiddleware` closure is an instance of `Illuminate\Foundation\Configuration\Middleware` and is responsible for managing the middleware assigned to your application's routes. The `append` method adds the middleware to the end of the list of global middleware. If you would like to add a middleware to the beginning of the list, you should use the `prepend` method.

##### Manually Managing Laravel's Default Global Middleware

If you would like to manage Laravel's global middleware stack manually, you may provide Laravel's default stack of global middleware to the `use` method. Then, you may adjust the default middleware stack as necessary:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->use([
        \Illuminate\Http\Middleware\ValidatePathEncoding::class,
        \Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks::class,
        // \Illuminate\Http\Middleware\TrustHosts::class,
        \Illuminate\Http\Middleware\TrustProxies::class,
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Http\Middleware\ValidatePostSize::class,
        \Illuminate\Foundation\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ]);
})
```

#### Assigning Middleware to Routes

If you would like to assign middleware to specific routes, you may invoke the `middleware` method when defining the route:

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::get('/profile', function () {
    // ...
})->middleware(EnsureTokenIsValid::class);
```

You may assign multiple middleware to the route by passing an array of middleware names to the `middleware` method:

```php
Route::get('/', function () {
    // ...
})->middleware([First::class, Second::class]);
```

##### Excluding Middleware

When assigning middleware to a group of routes, you may occasionally need to prevent the middleware from being applied to an individual route within the group. You may accomplish this using the `withoutMiddleware` method:

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::middleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/', function () {
        // ...
    });

    Route::get('/profile', function () {
        // ...
    })->withoutMiddleware([EnsureTokenIsValid::class]);
});
```

You may also exclude a given set of middleware from an entire [group](https://laravel.com/docs/routing#route-groups) of route definitions:

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/profile', function () {
        // ...
    });
});
```

The `withoutMiddleware` method can only remove route middleware and does not apply to [global middleware](#global-middleware).

#### Middleware Groups

Sometimes you may want to group several middleware under a single key to make them easier to assign to routes. You may accomplish this using the `appendToGroup` method within your application's `bootstrap/app.php` file:

```php
use App\Http\Middleware\First;
use App\Http\Middleware\Second;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->appendToGroup('group-name', [
        First::class,
        Second::class,
    ]);

    $middleware->prependToGroup('group-name', [
        First::class,
        Second::class,
    ]);
})
```

Middleware groups may be assigned to routes and controller actions using the same syntax as individual middleware:

```php
Route::get('/', function () {
    // ...
})->middleware('group-name');

Route::middleware(['group-name'])->group(function () {
    // ...
});
```

##### Laravel's Default Middleware Groups

Laravel includes predefined `web` and `api` middleware groups that contain common middleware you may want to apply to your web and API routes. Remember, Laravel automatically applies these middleware groups to the corresponding `routes/web.php` and `routes/api.php` files:

<div class="overflow-auto">

| The `web` Middleware Group                                |
| --------------------------------------------------------- |
| `Illuminate\Cookie\Middleware\EncryptCookies`             |
| `Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse` |
| `Illuminate\Session\Middleware\StartSession`              |
| `Illuminate\View\Middleware\ShareErrorsFromSession`       |
| `Illuminate\Foundation\Http\Middleware\PreventRequestForgery` |
| `Illuminate\Routing\Middleware\SubstituteBindings`        |

</div>

<div class="overflow-auto">

| The `api` Middleware Group                         |
| -------------------------------------------------- |
| `Illuminate\Routing\Middleware\SubstituteBindings` |

</div>

If you would like to append or prepend middleware to these groups, you may use the `web` and `api` methods within your application's `bootstrap/app.php` file. The `web` and `api` methods are convenient alternatives to the `appendToGroup` method:

```php
use App\Http\Middleware\EnsureTokenIsValid;
use App\Http\Middleware\EnsureUserIsSubscribed;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        EnsureUserIsSubscribed::class,
    ]);

    $middleware->api(prepend: [
        EnsureTokenIsValid::class,
    ]);
})
```

You may even replace one of Laravel's default middleware group entries with a custom middleware of your own:

```php
use App\Http\Middleware\StartCustomSession;
use Illuminate\Session\Middleware\StartSession;

$middleware->web(replace: [
    StartSession::class => StartCustomSession::class,
]);
```

Or, you may remove a middleware entirely:

```php
$middleware->web(remove: [
    StartSession::class,
]);
```

##### Manually Managing Laravel's Default Middleware Groups

If you would like to manually manage all of the middleware within Laravel's default `web` and `api` middleware groups, you may redefine the groups entirely. The example below will define the `web` and `api` middleware groups with their default middleware, allowing you to customize them as necessary:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->group('web', [
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        // \Illuminate\Session\Middleware\AuthenticateSession::class,
    ]);

    $middleware->group('api', [
        // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // 'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ]);
})
```

> **Note:**
> By default, the `web` and `api` middleware groups are automatically applied to your application's corresponding `routes/web.php` and `routes/api.php` files by the `bootstrap/app.php` file.

#### Middleware Aliases

You may assign aliases to middleware in your application's `bootstrap/app.php` file. Middleware aliases allow you to define a short alias for a given middleware class, which can be especially useful for middleware with long class names:

```php
use App\Http\Middleware\EnsureUserIsSubscribed;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'subscribed' => EnsureUserIsSubscribed::class
    ]);
})
```

Once the middleware alias has been defined in your application's `bootstrap/app.php` file, you may use the alias when assigning the middleware to routes:

```php
Route::get('/profile', function () {
    // ...
})->middleware('subscribed');
```

For convenience, some of Laravel's built-in middleware are aliased by default. For example, the `auth` middleware is an alias for the `Illuminate\Auth\Middleware\Authenticate` middleware. Below is a list of the default middleware aliases:

<div class="overflow-auto">

| Alias              | Middleware                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `auth`             | `Illuminate\Auth\Middleware\Authenticate`                                                                     |
| `auth.basic`       | `Illuminate\Auth\Middleware\AuthenticateWithBasicAuth`                                                        |
| `auth.session`     | `Illuminate\Session\Middleware\AuthenticateSession`                                                           |
| `cache.headers`    | `Illuminate\Http\Middleware\SetCacheHeaders`                                                                  |
| `can`              | `Illuminate\Auth\Middleware\Authorize`                                                                        |
| `guest`            | `Illuminate\Auth\Middleware\RedirectIfAuthenticated`                                                          |
| `password.confirm` | `Illuminate\Auth\Middleware\RequirePassword`                                                                  |
| `precognitive`     | `Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests`                                            |
| `signed`           | `Illuminate\Routing\Middleware\ValidateSignature`                                                             |
| `subscribed`       | `\Spark\Http\Middleware\VerifyBillableIsSubscribed`                                                           |
| `throttle`         | `Illuminate\Routing\Middleware\ThrottleRequests` or `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` |
| `verified`         | `Illuminate\Auth\Middleware\EnsureEmailIsVerified`                                                            |

</div>

#### Sorting Middleware

Rarely, you may need your middleware to execute in a specific order but not have control over their order when they are assigned to the route. In these situations, you may specify your middleware priority using the `priority` method in your application's `bootstrap/app.php` file:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->priority([
        \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class,
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        \Illuminate\Routing\Middleware\ThrottleRequests::class,
        \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
        \Illuminate\Auth\Middleware\Authorize::class,
    ]);
})
```

If you would like to add middleware to the existing priority list without replacing it, you may use the `prependToPriorityList` or `appendToPriorityList` methods. The `prependToPriorityList` method inserts the given middleware before another middleware, while the `appendToPriorityList` method inserts it after another middleware:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->prependToPriorityList(
        before: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        prepend: \App\Http\Middleware\EnsureTokenIsValid::class,
    );

    $middleware->appendToPriorityList(
        after: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        append: \App\Http\Middleware\EnsureUserIsSubscribed::class,
    );
})
```

The `before` and `after` arguments may also be an array of middleware classes.

### Middleware Parameters

Middleware can also receive additional parameters. For example, if your application needs to verify that the authenticated user has a given "role" before performing a given action, you could create an `EnsureUserHasRole` middleware that receives a role name as an additional argument.

Additional middleware parameters will be passed to the middleware after the `$next` argument:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user()->hasRole($role)) {
            // Redirect...
        }

        return $next($request);
    }
}
```

Middleware parameters may be specified when defining the route by separating the middleware name and parameters with a `:`:

```php
use App\Http\Middleware\EnsureUserHasRole;

Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor');
```

Multiple parameters may be delimited by commas:

```php
Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor,publisher');
```

### Terminable Middleware

Sometimes a middleware may need to do some work after the HTTP response has been sent to the browser. If you define a `terminate` method on your middleware and your web server is using [FastCGI](https://www.php.net/manual/en/install.fpm.php), the `terminate` method will automatically be called after the response is sent to the browser:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TerminatingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    /**
     * Handle tasks after the response has been sent to the browser.
     */
    public function terminate(Request $request, Response $response): void
    {
        // ...
    }
}
```

The `terminate` method should receive both the request and the response. Once you have defined a terminable middleware, you should add it to the list of routes or global middleware in your application's `bootstrap/app.php` file.

When calling the `terminate` method on your middleware, Laravel will resolve a fresh instance of the middleware from the [service container](https://laravel.com/docs/container). If you would like to use the same middleware instance when the `handle` and `terminate` methods are called, register the middleware with the container using the container's `singleton` method. Typically this should be done in the `register` method of your `AppServiceProvider`:

```php
use App\Http\Middleware\TerminatingMiddleware;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(TerminatingMiddleware::class);
}
```

## Controllers

> **Source:** [Controllers](https://laravel.com/docs/controllers) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

Instead of defining all of your request handling logic as closures in your route files, you may wish to organize this behavior using "controller" classes. Controllers can group related request handling logic into a single class. For example, a `UserController` class might handle all incoming requests related to users, including showing, creating, updating, and deleting users. By default, controllers are stored in the `app/Http/Controllers` directory.

### Writing Controllers

#### Basic Controllers

To quickly generate a new controller, you may run the `make:controller` Artisan command. By default, all of the controllers for your application are stored in the `app/Http/Controllers` directory:

```shell
php artisan make:controller UserController
```

Let's take a look at an example of a basic controller. A controller may have any number of public methods which will respond to incoming HTTP requests:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for a given user.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

Once you have written a controller class and method, you may define a route to the controller method like so:

```php
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

When an incoming request matches the specified route URI, the `show` method on the `App\Http\Controllers\UserController` class will be invoked and the route parameters will be passed to the method.

> **Note:**
> Controllers are not **required** to extend a base class. However, it is sometimes convenient to extend a base controller class that contains methods that should be shared across all of your controllers.

#### Single Action Controllers

If a controller action is particularly complex, you might find it convenient to dedicate an entire controller class to that single action. To accomplish this, you may define a single `__invoke` method within the controller:

```php
<?php

namespace App\Http\Controllers;

class ProvisionServer extends Controller
{
    /**
     * Provision a new web server.
     */
    public function __invoke()
    {
        // ...
    }
}
```

When registering routes for single action controllers, you do not need to specify a controller method. Instead, you may simply pass the name of the controller to the router:

```php
use App\Http\Controllers\ProvisionServer;

Route::post('/server', ProvisionServer::class);
```

You may generate an invokable controller by using the `--invokable` option of the `make:controller` Artisan command:

```shell
php artisan make:controller ProvisionServer --invokable
```

> **Note:**
> Controller stubs may be customized using [stub publishing](https://laravel.com/docs/artisan#stub-customization).

### Controller Middleware

[Middleware](https://laravel.com/docs/middleware) may be assigned to the controller's routes in your route files:

```php
Route::get('/profile', [UserController::class, 'show'])->middleware('auth');
```

Or, you may find it convenient to specify middleware within your controller class. To do so, your controller should implement the `HasMiddleware` interface, which dictates that the controller should have a static `middleware` method. From this method, you may return an array of middleware that should be applied to the controller's actions:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UserController implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('log', only: ['index']),
            new Middleware('subscribed', except: ['store']),
        ];
    }

    // ...
}
```

You may also define controller middleware as closures, which provides a convenient way to define an inline middleware without writing an entire middleware class:

```php
use Closure;
use Illuminate\Http\Request;

/**
 * Get the middleware that should be assigned to the controller.
 */
public static function middleware(): array
{
    return [
        function (Request $request, Closure $next) {
            return $next($request);
        },
    ];
}
```

#### Middleware Attributes

You may also assign middleware to controllers using PHP attributes:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
#[Middleware('log', only: ['index'])]
#[Middleware('subscribed', except: ['store'])]
class UserController
{
    // ...
}
```

You may place middleware attributes on individual controller methods as well. Middleware assigned to methods will be merged with middleware assigned at the class level:

```php
<?php

namespace App\Http\Controllers;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
class UserController
{
    #[Middleware('log')]
    #[Middleware('subscribed')]
    public function index()
    {
        // ...
    }

    #[Middleware(static function (Request $request, Closure $next) {
        // ...

        return $next($request);
    })]
    public function store()
    {
        // ...
    }
}
```

To exclude middleware from a controller or individual controller methods, use the `WithoutMiddleware` attribute. You may use the `only` and `except` arguments to limit a class-level attribute to particular controller methods:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureTokenIsValid;
use Illuminate\Routing\Attributes\Controllers\WithoutMiddleware;

#[WithoutMiddleware('subscribed', except: ['index'])]
class UserController
{
    #[WithoutMiddleware(EnsureTokenIsValid::class)]
    public function index()
    {
        // ...
    }

    public function show()
    {
        // ...
    }
}
```

Class-level `WithoutMiddleware` attributes are inherited by child controllers. The attribute can only remove route middleware and does not apply to [global middleware](https://laravel.com/docs/middleware#global-middleware).

#### Authorization Attributes

If you are authorizing controller actions via policies, you may use the `Authorize` attribute as a convenient shortcut for the `can` middleware:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Routing\Attributes\Controllers\Authorize;

class CommentController
{
    #[Authorize('create', [Comment::class, 'post'])]
    public function store(Post $post)
    {
        // ...
    }

    #[Authorize('delete', 'comment')]
    public function destroy(Comment $comment)
    {
        // ...
    }
}
```

The first argument is the ability you wish to authorize. The second argument is the model class, route parameter, or parameters that should be passed to the policy.

### Resource Controllers

If you think of each Eloquent model in your application as a "resource", it is typical to perform the same sets of actions against each resource in your application. For example, imagine your application contains a `Photo` model and a `Movie` model. It is likely that users can create, read, update, or delete these resources.

Because of this common use case, Laravel resource routing assigns the typical create, read, update, and delete ("CRUD") routes to a controller with a single line of code. To get started, we can use the `make:controller` Artisan command's `--resource` option to quickly create a controller to handle these actions:

```shell
php artisan make:controller PhotoController --resource
```

This command will generate a controller at `app/Http/Controllers/PhotoController.php`. The controller will contain a method for each of the available resource operations. Next, you may register a resource route that points to the controller:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class);
```

This single route declaration creates multiple routes to handle a variety of actions on the resource. The generated controller will already have methods stubbed for each of these actions. Remember, you can always get a quick overview of your application's routes by running the `route:list` Artisan command.

You may even register many resource controllers at once by passing an array to the `resources` method:

```php
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

The `softDeletableResources` method registers many resources controllers that all use the `withTrashed` method:

```php
Route::softDeletableResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

##### Actions Handled by Resource Controllers

<div class="overflow-auto">

| Verb      | URI                    | Action  | Route Name     |
| --------- | ---------------------- | ------- | -------------- |
| GET       | `/photos`              | index   | photos.index   |
| GET       | `/photos/create`       | create  | photos.create  |
| POST      | `/photos`              | store   | photos.store   |
| GET       | `/photos/{photo}`      | show    | photos.show    |
| GET       | `/photos/{photo}/edit` | edit    | photos.edit    |
| PUT/PATCH | `/photos/{photo}`      | update  | photos.update  |
| DELETE    | `/photos/{photo}`      | destroy | photos.destroy |

</div>

##### Customizing Missing Model Behavior

Typically, a 404 HTTP response will be generated if an implicitly bound resource model is not found. However, you may customize this behavior by calling the `missing` method when defining your resource route. The `missing` method accepts a closure that will be invoked if an implicitly bound model cannot be found for any of the resource's routes:

```php
use App\Http\Controllers\PhotoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::resource('photos', PhotoController::class)
    ->missing(function (Request $request) {
        return Redirect::route('photos.index');
    });
```

##### Soft Deleted Models

Typically, implicit model binding will not retrieve models that have been [soft deleted](https://laravel.com/docs/eloquent#soft-deleting), and will instead return a 404 HTTP response. However, you can instruct the framework to allow soft deleted models by invoking the `withTrashed` method when defining your resource route:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->withTrashed();
```

Calling `withTrashed` with no arguments will allow soft deleted models for the `show`, `edit`, and `update` resource routes. You may specify a subset of these routes by passing an array to the `withTrashed` method:

```php
Route::resource('photos', PhotoController::class)->withTrashed(['show']);
```

##### Specifying the Resource Model

If you are using [route model binding](https://laravel.com/docs/routing#route-model-binding) and would like the resource controller's methods to type-hint a model instance, you may use the `--model` option when generating the controller:

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

##### Generating Form Requests

You may provide the `--requests` option when generating a resource controller to instruct Artisan to generate [form request classes](https://laravel.com/docs/validation#form-request-validation) for the controller's storage and update methods:

```shell
php artisan make:controller PhotoController --model=Photo --resource --requests
```

#### Partial Resource Routes

When declaring a resource route, you may specify a subset of actions the controller should handle instead of the full set of default actions:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->only([
    'index', 'show'
]);

Route::resource('photos', PhotoController::class)->except([
    'create', 'store', 'update', 'destroy'
]);
```

##### API Resource Routes

When declaring resource routes that will be consumed by APIs, you will commonly want to exclude routes that present HTML templates such as `create` and `edit`. For convenience, you may use the `apiResource` method to automatically exclude these two routes:

```php
use App\Http\Controllers\PhotoController;

Route::apiResource('photos', PhotoController::class);
```

You may register many API resource controllers at once by passing an array to the `apiResources` method:

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PostController;

Route::apiResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

To quickly generate an API resource controller that does not include the `create` or `edit` methods, use the `--api` switch when executing the `make:controller` command:

```shell
php artisan make:controller PhotoController --api
```

#### Nested Resources

Sometimes you may need to define routes to a nested resource. For example, a photo resource may have multiple comments that may be attached to the photo. To nest the resource controllers, you may use "dot" notation in your route declaration:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class);
```

This route will register a nested resource that may be accessed with URIs like the following:

```text
/photos/{photo}/comments/{comment}
```

##### Scoping Nested Resources

Laravel's [implicit model binding](https://laravel.com/docs/routing#implicit-model-binding-scoping) feature can automatically scope nested bindings such that the resolved child model is confirmed to belong to the parent model. By using the `scoped` method when defining your nested resource, you may enable automatic scoping as well as instruct Laravel which field the child resource should be retrieved by. For more information on how to accomplish this, please see the documentation on [scoping resource routes](#restful-scoping-resource-routes).

##### Shallow Nesting

Often, it is not entirely necessary to have both the parent and the child IDs within a URI since the child ID is already a unique identifier. When using unique identifiers such as auto-incrementing primary keys to identify your models in URI segments, you may choose to use "shallow nesting":

```php
use App\Http\Controllers\CommentController;

Route::resource('photos.comments', CommentController::class)->shallow();
```

This route definition will define the following routes:

<div class="overflow-auto">

| Verb      | URI                               | Action  | Route Name             |
| --------- | --------------------------------- | ------- | ---------------------- |
| GET       | `/photos/{photo}/comments`        | index   | photos.comments.index  |
| GET       | `/photos/{photo}/comments/create` | create  | photos.comments.create |
| POST      | `/photos/{photo}/comments`        | store   | photos.comments.store  |
| GET       | `/comments/{comment}`             | show    | comments.show          |
| GET       | `/comments/{comment}/edit`        | edit    | comments.edit          |
| PUT/PATCH | `/comments/{comment}`             | update  | comments.update        |
| DELETE    | `/comments/{comment}`             | destroy | comments.destroy       |

</div>

#### Naming Resource Routes

By default, all resource controller actions have a route name; however, you can override these names by passing a `names` array with your desired route names:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->names([
    'create' => 'photos.build'
]);
```

#### Naming Resource Route Parameters

By default, `Route::resource` will create the route parameters for your resource routes based on the "singularized" version of the resource name. You can easily override this on a per resource basis using the `parameters` method. The array passed into the `parameters` method should be an associative array of resource names and parameter names:

```php
use App\Http\Controllers\AdminUserController;

Route::resource('users', AdminUserController::class)->parameters([
    'users' => 'admin_user'
]);
```

The example above generates the following URI for the resource's `show` route:

```text
/users/{admin_user}
```

#### Scoping Resource Routes

Laravel's [scoped implicit model binding](https://laravel.com/docs/routing#implicit-model-binding-scoping) feature can automatically scope nested bindings such that the resolved child model is confirmed to belong to the parent model. By using the `scoped` method when defining your nested resource, you may enable automatic scoping as well as instruct Laravel which field the child resource should be retrieved by:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class)->scoped([
    'comment' => 'slug',
]);
```

This route will register a scoped nested resource that may be accessed with URIs like the following:

```text
/photos/{photo}/comments/{comment:slug}
```

When using a custom keyed implicit binding as a nested route parameter, Laravel will automatically scope the query to retrieve the nested model by its parent using conventions to guess the relationship name on the parent. In this case, it will be assumed that the `Photo` model has a relationship named `comments` (the plural of the route parameter name) which can be used to retrieve the `Comment` model.

#### Localizing Resource URIs

By default, `Route::resource` will create resource URIs using English verbs and plural rules. If you need to localize the `create` and `edit` action verbs, you may use the `Route::resourceVerbs` method. This may be done at the beginning of the `boot` method within your application's `App\Providers\AppServiceProvider`:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);
}
```

Laravel's pluralizer supports [several different languages which you may configure based on your needs](https://laravel.com/docs/localization#pluralization-language). Once the verbs and pluralization language have been customized, a resource route registration such as `Route::resource('publicacion', PublicacionController::class)` will produce the following URIs:

```text
/publicacion/crear

/publicacion/{publicacion}/editar
```

#### Supplementing Resource Controllers

If you need to add additional routes to a resource controller beyond the default set of resource routes, you should define those routes before your call to the `Route::resource` method; otherwise, the routes defined by the `resource` method may unintentionally take precedence over your supplemental routes:

```php
use App\Http\Controllers\PhotoController;

Route::get('/photos/popular', [PhotoController::class, 'popular']);
Route::resource('photos', PhotoController::class);
```

> **Note:**
> Remember to keep your controllers focused. If you find yourself routinely needing methods outside of the typical set of resource actions, consider splitting your controller into two, smaller controllers.

#### Singleton Resource Controllers

Sometimes, your application will have resources that may only have a single instance. For example, a user's "profile" can be edited or updated, but a user may not have more than one "profile". Likewise, an image may have a single "thumbnail". These resources are called "singleton resources", meaning one and only one instance of the resource may exist. In these scenarios, you may register a "singleton" resource controller:

```php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::singleton('profile', ProfileController::class);
```

The singleton resource definition above will register the following routes. As you can see, "creation" routes are not registered for singleton resources, and the registered routes do not accept an identifier since only one instance of the resource may exist:

<div class="overflow-auto">

| Verb      | URI             | Action | Route Name     |
| --------- | --------------- | ------ | -------------- |
| GET       | `/profile`      | show   | profile.show   |
| GET       | `/profile/edit` | edit   | profile.edit   |
| PUT/PATCH | `/profile`      | update | profile.update |

</div>

Singleton resources may also be nested within a standard resource:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class);
```

In this example, the `photos` resource would receive all of the [standard resource routes](#actions-handled-by-resource-controllers); however, the `thumbnail` resource would be a singleton resource with the following routes:

<div class="overflow-auto">

| Verb      | URI                              | Action | Route Name              |
| --------- | -------------------------------- | ------ | ----------------------- |
| GET       | `/photos/{photo}/thumbnail`      | show   | photos.thumbnail.show   |
| GET       | `/photos/{photo}/thumbnail/edit` | edit   | photos.thumbnail.edit   |
| PUT/PATCH | `/photos/{photo}/thumbnail`      | update | photos.thumbnail.update |

</div>

##### Creatable Singleton Resources

Occasionally, you may want to define creation and storage routes for a singleton resource. To accomplish this, you may invoke the `creatable` method when registering the singleton resource route:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class)->creatable();
```

In this example, the following routes will be registered. As you can see, a `DELETE` route will also be registered for creatable singleton resources:

<div class="overflow-auto">

| Verb      | URI                                | Action  | Route Name               |
| --------- | ---------------------------------- | ------- | ------------------------ |
| GET       | `/photos/{photo}/thumbnail/create` | create  | photos.thumbnail.create  |
| POST      | `/photos/{photo}/thumbnail`        | store   | photos.thumbnail.store   |
| GET       | `/photos/{photo}/thumbnail`        | show    | photos.thumbnail.show    |
| GET       | `/photos/{photo}/thumbnail/edit`   | edit    | photos.thumbnail.edit    |
| PUT/PATCH | `/photos/{photo}/thumbnail`        | update  | photos.thumbnail.update  |
| DELETE    | `/photos/{photo}/thumbnail`        | destroy | photos.thumbnail.destroy |

</div>

If you would like Laravel to register the `DELETE` route for a singleton resource but not register the creation or storage routes, you may utilize the `destroyable` method:

```php
Route::singleton(...)->destroyable();
```

##### API Singleton Resources

The `apiSingleton` method may be used to register a singleton resource that will be manipulated via an API, thus rendering the `create` and `edit` routes unnecessary:

```php
Route::apiSingleton('profile', ProfileController::class);
```

Of course, API singleton resources may also be `creatable`, which will register `store` and `destroy` routes for the resource:

```php
Route::apiSingleton('photos.thumbnail', ProfileController::class)->creatable();
```
#### Middleware and Resource Controllers

Laravel allows you to assign middleware to all, or only specific, methods of resource routes using the `middleware`, `middlewareFor`, and `withoutMiddlewareFor` methods. These methods provide fine-grained control over which middleware is applied to each resource action.

##### Applying Middleware to all Methods

You may use the `middleware` method to assign middleware to all routes generated by a resource or singleton resource route:

```php
Route::resource('users', UserController::class)
    ->middleware(['auth', 'verified']);

Route::singleton('profile', ProfileController::class)
    ->middleware('auth');
```

##### Applying Middleware to Specific Methods

You may use the `middlewareFor` method to assign middleware to one or more specific methods of a given resource controller:

```php
Route::resource('users', UserController::class)
    ->middlewareFor('show', 'auth');

Route::apiResource('users', UserController::class)
    ->middlewareFor(['show', 'update'], 'auth');

Route::resource('users', UserController::class)
    ->middlewareFor('show', 'auth')
    ->middlewareFor('update', 'auth');

Route::apiResource('users', UserController::class)
    ->middlewareFor(['show', 'update'], ['auth', 'verified']);
```

The `middlewareFor` method may also be used in conjunction with singleton and API singleton resource controllers:

```php
Route::singleton('profile', ProfileController::class)
    ->middlewareFor('show', 'auth');

Route::apiSingleton('profile', ProfileController::class)
    ->middlewareFor(['show', 'update'], 'auth');
```

##### Excluding Middleware from Specific Methods

You may use the `withoutMiddlewareFor` method to exclude middleware from specific methods of a resource controller:

```php
Route::middleware(['auth', 'verified', 'subscribed'])->group(function () {
    Route::resource('users', UserController::class)
        ->withoutMiddlewareFor('index', ['auth', 'verified'])
        ->withoutMiddlewareFor(['create', 'store'], 'verified')
        ->withoutMiddlewareFor('destroy', 'subscribed');
});
```

### Dependency Injection and Controllers

##### Constructor Injection

The Laravel [service container](https://laravel.com/docs/container) is used to resolve all Laravel controllers. As a result, you are able to type-hint any dependencies your controller may need in its constructor. The declared dependencies will automatically be resolved and injected into the controller instance:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}
}
```

##### Method Injection

In addition to constructor injection, you may also type-hint dependencies on your controller's methods. A common use-case for method injection is injecting the `Illuminate\Http\Request` instance into your controller methods:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Store a new user.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->name;

        // Store the user...

        return redirect('/users');
    }
}
```

If your controller method is also expecting input from a route parameter, list your route arguments after your other dependencies. For example, if your route is defined like so:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

You may still type-hint the `Illuminate\Http\Request` and access your `id` parameter by defining your controller method as follows:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the given user.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // Update the user...

        return redirect('/users');
    }
}
```

## HTTP Requests

> **Source:** [HTTP Requests](https://laravel.com/docs/requests) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

Laravel's `Illuminate\Http\Request` class provides an object-oriented way to interact with the current HTTP request being handled by your application as well as retrieve the input, cookies, and files that were submitted with the request.

### Interacting With The Request

#### Accessing the Request

To obtain an instance of the current HTTP request via dependency injection, you should type-hint the `Illuminate\Http\Request` class on your route closure or controller method. The incoming request instance will automatically be injected by the Laravel [service container](https://laravel.com/docs/container):

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Store a new user.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->input('name');

        // Store the user...

        return redirect('/users');
    }
}
```

As mentioned, you may also type-hint the `Illuminate\Http\Request` class on a route closure. The service container will automatically inject the incoming request into the closure when it is executed:

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

##### Dependency Injection and Route Parameters

If your controller method is also expecting input from a route parameter you should list your route parameters after your other dependencies. For example, if your route is defined like so:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

You may still type-hint the `Illuminate\Http\Request` and access your `id` route parameter by defining your controller method as follows:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the specified user.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // Update the user...

        return redirect('/users');
    }
}
```

#### Request Path, Host, and Method

The `Illuminate\Http\Request` instance provides a variety of methods for examining the incoming HTTP request and extends the `Symfony\Component\HttpFoundation\Request` class. We will discuss a few of the most important methods below.

##### Retrieving the Request Path

The `path` method returns the request's path information. So, if the incoming request is targeted at `http://example.com/foo/bar`, the `path` method will return `foo/bar`:

```php
$uri = $request->path();
```

##### Inspecting the Request Path / Route

The `is` method allows you to verify that the incoming request path matches a given pattern. You may use the `*` character as a wildcard when utilizing this method:

```php
if ($request->is('admin/*')) {
    // ...
}
```

Using the `routeIs` method, you may determine if the incoming request has matched a [named route](https://laravel.com/docs/routing#named-routes):

```php
if ($request->routeIs('admin.*')) {
    // ...
}
```

##### Retrieving the Request URL

To retrieve the full URL for the incoming request you may use the `url` or `fullUrl` methods. The `url` method will return the URL without the query string, while the `fullUrl` method includes the query string:

```php
$url = $request->url();

$urlWithQueryString = $request->fullUrl();
```

If you would like to append query string data to the current URL, you may call the `fullUrlWithQuery` method. This method merges the given array of query string variables with the current query string:

```php
$request->fullUrlWithQuery(['type' => 'phone']);
```

If you would like to get the current URL without a given query string parameter, you may utilize the `fullUrlWithoutQuery` method:

```php
$request->fullUrlWithoutQuery(['type']);
```

##### Retrieving the Request Host

You may retrieve the "host" of the incoming request via the `host`, `httpHost`, and `schemeAndHttpHost` methods:

```php
// http://localhost:8000
$request->host(); // localhost
$request->httpHost(); // localhost:8000
$request->schemeAndHttpHost(); // http://localhost:8000
```

##### Retrieving the Request Method

The `method` method will return the HTTP verb for the request. You may use the `isMethod` method to verify that the HTTP verb matches a given string:

```php
$method = $request->method();

if ($request->isMethod('post')) {
    // ...
}
```

#### Request Headers

You may retrieve a request header from the `Illuminate\Http\Request` instance using the `header` method. If the header is not present on the request, `null` will be returned. However, the `header` method accepts an optional second argument that will be returned if the header is not present on the request:

```php
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');
```

The `hasHeader` method may be used to determine if the request contains a given header:

```php
if ($request->hasHeader('X-Header-Name')) {
    // ...
}
```

For convenience, the `bearerToken` method may be used to retrieve a bearer token from the `Authorization` header. If no such header is present, an empty string will be returned:

```php
$token = $request->bearerToken();
```

#### Request IP Address

The `ip` method may be used to retrieve the IP address of the client that made the request to your application:

```php
$ipAddress = $request->ip();
```

If you would like to retrieve an array of IP addresses, including all of the client IP addresses that were forwarded by proxies, you may use the `ips` method. The "original" client IP address will be at the end of the array:

```php
$ipAddresses = $request->ips();
```

In general, IP addresses should be considered untrusted, user-controlled input and be used for informational purposes only.

#### Content Negotiation

Laravel provides several methods for inspecting the incoming request's requested content types via the `Accept` header. First, the `getAcceptableContentTypes` method will return an array containing all of the content types accepted by the request:

```php
$contentTypes = $request->getAcceptableContentTypes();
```

The `accepts` method accepts an array of content types and returns `true` if any of the content types are accepted by the request. Otherwise, `false` will be returned:

```php
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}
```

You may use the `prefers` method to determine which content type out of a given array of content types is most preferred by the request. If none of the provided content types are accepted by the request, `null` will be returned:

```php
$preferred = $request->prefers(['text/html', 'application/json']);
```

Since many applications only serve HTML or JSON, you may use the `expectsJson` method to quickly determine if the incoming request expects a JSON response:

```php
if ($request->expectsJson()) {
    // ...
}
```

If you need to determine whether the request specifically prefers Markdown or will accept Markdown among other content types, such as when serving AI agents or other clients that consume Markdown responses, you may use the `wantsMarkdown` and `acceptsMarkdown` methods:

```php
if ($request->wantsMarkdown()) {
    // The client's most preferred content type is text/markdown...
}

if ($request->acceptsMarkdown()) {
    // The client accepts Markdown responses...
}
```

#### PSR-7 Requests

The [PSR-7 standard](https://www.php-fig.org/psr/psr-7/) specifies interfaces for HTTP messages, including requests and responses. If you would like to obtain an instance of a PSR-7 request instead of a Laravel request, you will first need to install a few libraries. Laravel uses the *Symfony HTTP Message Bridge* component to convert typical Laravel requests and responses into PSR-7 compatible implementations:

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

Once you have installed these libraries, you may obtain a PSR-7 request by type-hinting the request interface on your route closure or controller method:

```php
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    // ...
});
```

> **Note:**
> If you return a PSR-7 response instance from a route or controller, it will automatically be converted back to a Laravel response instance and be displayed by the framework.

### Input

#### Retrieving Input

##### Retrieving All Input Data

You may retrieve all of the incoming request's input data as an `array` using the `all` method. This method may be used regardless of whether the incoming request is from an HTML form or is an XHR request:

```php
$input = $request->all();
```

Using the `collect` method, you may retrieve all of the incoming request's input data as a [collection](https://laravel.com/docs/collections):

```php
$input = $request->collect();
```

The `collect` method also allows you to retrieve a subset of the incoming request's input as a collection:

```php
$request->collect('users')->each(function (string $user) {
    // ...
});
```

##### Retrieving an Input Value

Using a few simple methods, you may access all of the user input from your `Illuminate\Http\Request` instance without worrying about which HTTP verb was used for the request. Regardless of the HTTP verb, the `input` method may be used to retrieve user input:

```php
$name = $request->input('name');
```

You may pass a default value as the second argument to the `input` method. This value will be returned if the requested input value is not present on the request:

```php
$name = $request->input('name', 'Sally');
```

When working with forms that contain array inputs, use "dot" notation to access the arrays:

```php
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

You may call the `input` method without any arguments in order to retrieve all of the input values as an associative array:

```php
$input = $request->input();
```

##### Retrieving Input From the Query String

While the `input` method retrieves values from the entire request payload (including the query string), the `query` method will only retrieve values from the query string:

```php
$name = $request->query('name');
```

If the requested query string value data is not present, the second argument to this method will be returned:

```php
$name = $request->query('name', 'Helen');
```

You may call the `query` method without any arguments in order to retrieve all of the query string values as an associative array:

```php
$query = $request->query();
```

##### Retrieving JSON Input Values

When sending JSON requests to your application, you may access the JSON data via the `input` method as long as the `Content-Type` header of the request is properly set to `application/json`. You may even use "dot" syntax to retrieve values that are nested within JSON arrays / objects:

```php
$name = $request->input('user.name');
```

##### Retrieving Stringable Input Values

Instead of retrieving the request's input data as a primitive `string`, you may use the `string` method to retrieve the request data as an instance of [Illuminate\Support\Stringable](https://laravel.com/docs/strings):

```php
$name = $request->string('name')->trim();
```

##### Retrieving Integer Input Values

To retrieve input values as integers, you may use the `integer` method. This method will attempt to cast the input value to an integer. If the input is not present, it will return the default value you specify. This is particularly useful for pagination or other numeric inputs:

```php
$perPage = $request->integer('per_page');
```

##### Retrieving Boolean Input Values

When dealing with HTML elements like checkboxes, your application may receive "truthy" values that are actually strings. For example, "true" or "on". For convenience, you may use the `boolean` method to retrieve these values as booleans. The `boolean` method returns `true` for 1, "1", true, "true", "on", and "yes". All other values will return `false`:

```php
$archived = $request->boolean('archived');
```

##### Retrieving Array Input Values

Input values containing arrays may be retrieved using the `array` method. This method will always cast the input value to an array. If the request does not contain an input value with the given name, an empty array will be returned:

```php
$versions = $request->array('versions');
```

##### Retrieving Date Input Values

For convenience, input values containing dates / times may be retrieved as Carbon instances using the `date` method. If the request does not contain an input value with the given name, `null` will be returned:

```php
$birthday = $request->date('birthday');
```

The second and third arguments accepted by the `date` method may be used to specify the date's format and timezone, respectively:

```php
$elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');
```

If the input value is present but has an invalid format, an `InvalidArgumentException` will be thrown; therefore, it is recommended that you validate the input before invoking the `date` method.

##### Retrieving Interval Input Values

Input values containing durations may be retrieved as `CarbonInterval` instances using the `interval` method. If the request does not contain an input value with the given name, `null` will be returned:

```php
$duration = $request->interval('duration');
```

If the input value is numeric, you may provide a unit as the second argument. The unit may be a string such as `second`, `minute`, or `day`, or a `Carbon\Unit` enum instance:

```php
use Carbon\Unit;

$timeout = $request->interval('timeout', 'second');

$delay = $request->interval('delay', Unit::Minute);
```

If the input value is present but has an invalid format, an `InvalidArgumentException` will be thrown; therefore, it is recommended that you validate the input before invoking the `interval` method.

##### Retrieving Enum Input Values

Input values that correspond to [PHP enums](https://www.php.net/manual/en/language.types.enumerations.php) may also be retrieved from the request. If the request does not contain an input value with the given name or the enum does not have a backing value that matches the input value, `null` will be returned. The `enum` method accepts the name of the input value and the enum class as its first and second arguments:

```php
use App\Enums\Status;

$status = $request->enum('status', Status::class);
```

You may also provide a default value that will be returned if the value is missing or invalid:

```php
$status = $request->enum('status', Status::class, Status::Pending);
```

If the input value is an array of values that correspond to a PHP enum, you may use the `enums` method to retrieve the array of values as enum instances:

```php
use App\Enums\Product;

$products = $request->enums('products', Product::class);
```

##### Retrieving Input via Dynamic Properties

You may also access user input using dynamic properties on the `Illuminate\Http\Request` instance. For example, if one of your application's forms contains a `name` field, you may access the value of the field like so:

```php
$name = $request->name;
```

When using dynamic properties, Laravel will first look for the parameter's value in the request payload. If it is not present, Laravel will search for the field in the matched route's parameters.

##### Retrieving a Portion of the Input Data

If you need to retrieve a subset of the input data, you may use the `only` and `except` methods. Both of these methods accept a single `array` or a dynamic list of arguments:

```php
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

> **Warning:**
> The `only` method returns all of the key / value pairs that you request; however, it will not return key / value pairs that are not present on the request.

#### Input Presence

You may use the `has` method to determine if a value is present on the request. The `has` method returns `true` if the value is present on the request:

```php
if ($request->has('name')) {
    // ...
}
```

When given an array, the `has` method will determine if all of the specified values are present:

```php
if ($request->has(['name', 'email'])) {
    // ...
}
```

The `hasAny` method returns `true` if any of the specified values are present:

```php
if ($request->hasAny(['name', 'email'])) {
    // ...
}
```

The `whenHas` method will execute the given closure if a value is present on the request:

```php
$request->whenHas('name', function (string $input) {
    // ...
});
```

A second closure may be passed to the `whenHas` method that will be executed if the specified value is not present on the request:

```php
$request->whenHas('name', function (string $input) {
    // The "name" value is present...
}, function () {
    // The "name" value is not present...
});
```

If you would like to determine if a value is present on the request and is not an empty string, you may use the `filled` method:

```php
if ($request->filled('name')) {
    // ...
}
```

If you would like to determine if a value is missing from the request or is an empty string, you may use the `isNotFilled` method:

```php
if ($request->isNotFilled('name')) {
    // ...
}
```

When given an array, the `isNotFilled` method will determine if all of the specified values are missing or empty:

```php
if ($request->isNotFilled(['name', 'email'])) {
    // ...
}
```

The `anyFilled` method returns `true` if any of the specified values is not an empty string:

```php
if ($request->anyFilled(['name', 'email'])) {
    // ...
}
```

The `whenFilled` method will execute the given closure if a value is present on the request and is not an empty string:

```php
$request->whenFilled('name', function (string $input) {
    // ...
});
```

A second closure may be passed to the `whenFilled` method that will be executed if the specified value is not "filled":

```php
$request->whenFilled('name', function (string $input) {
    // The "name" value is filled...
}, function () {
    // The "name" value is not filled...
});
```

To determine if a given key is absent from the request, you may use the `missing` and `whenMissing` methods:

```php
if ($request->missing('name')) {
    // ...
}

$request->whenMissing('name', function () {
    // The "name" value is missing...
}, function () {
    // The "name" value is present...
});
```

#### Merging Additional Input

Sometimes you may need to manually merge additional input into the request's existing input data. To accomplish this, you may use the `merge` method. If a given input key already exists on the request, it will be overwritten by the data provided to the `merge` method:

```php
$request->merge(['votes' => 0]);
```

The `mergeIfMissing` method may be used to merge input into the request if the corresponding keys do not already exist within the request's input data:

```php
$request->mergeIfMissing(['votes' => 0]);
```

#### Old Input

Laravel allows you to keep input from one request during the next request. This feature is particularly useful for re-populating forms after detecting validation errors. However, if you are using Laravel's included [validation features](https://laravel.com/docs/validation), it is possible that you will not need to manually use these session input flashing methods directly, as some of Laravel's built-in validation facilities will call them automatically.

##### Flashing Input to the Session

The `flash` method on the `Illuminate\Http\Request` class will flash the current input to the [session](https://laravel.com/docs/session) so that it is available during the user's next request to the application:

```php
$request->flash();
```

You may also use the `flashOnly` and `flashExcept` methods to flash a subset of the request data to the session. These methods are useful for keeping sensitive information such as passwords out of the session:

```php
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

##### Flashing Input Then Redirecting

Since you often will want to flash input to the session and then redirect to the previous page, you may easily chain input flashing onto a redirect using the `withInput` method:

```php
return redirect('/form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('/form')->withInput(
    $request->except('password')
);
```

##### Retrieving Old Input

To retrieve flashed input from the previous request, invoke the `old` method on an instance of `Illuminate\Http\Request`. The `old` method will pull the previously flashed input data from the [session](https://laravel.com/docs/session):

```php
$username = $request->old('username');
```

Laravel also provides a global `old` helper. If you are displaying old input within a [Blade template](https://laravel.com/docs/blade), it is more convenient to use the `old` helper to repopulate the form. If no old input exists for the given field, `null` will be returned:

```blade
<input type="text" name="username" value="{{ old('username') }}">
```

#### Cookies

##### Retrieving Cookies From Requests

All cookies created by the Laravel framework are encrypted and signed with an authentication code, meaning they will be considered invalid if they have been changed by the client. To retrieve a cookie value from the request, use the `cookie` method on an `Illuminate\Http\Request` instance:

```php
$value = $request->cookie('name');
```

### Input Trimming and Normalization

By default, Laravel includes the `Illuminate\Foundation\Http\Middleware\TrimStrings` and `Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull` middleware in your application's global middleware stack. These middleware will automatically trim all incoming string fields on the request, as well as convert any empty string fields to `null`. This allows you to not have to worry about these normalization concerns in your routes and controllers.

##### Disabling Input Normalization

If you would like to disable this behavior for all requests, you may remove the two middleware from your application's middleware stack by invoking the `$middleware->remove` method in your application's `bootstrap/app.php` file:

```php
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\TrimStrings;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->remove([
        ConvertEmptyStringsToNull::class,
        TrimStrings::class,
    ]);
})
```

If you would like to disable string trimming and empty string conversion for a subset of requests to your application, you may use the `trimStrings` and `convertEmptyStringsToNull` middleware methods within your application's `bootstrap/app.php` file. Both methods accept an array of closures, which should return `true` or `false` to indicate whether input normalization should be skipped:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->convertEmptyStringsToNull(except: [
        fn (Request $request) => $request->is('admin/*'),
    ]);

    $middleware->trimStrings(except: [
        fn (Request $request) => $request->is('admin/*'),
    ]);
})
```

### Files

#### Retrieving Uploaded Files

You may retrieve uploaded files from an `Illuminate\Http\Request` instance using the `file` method or using dynamic properties. The `file` method returns an instance of the `Illuminate\Http\UploadedFile` class, which extends the PHP `SplFileInfo` class and provides a variety of methods for interacting with the file:

```php
$file = $request->file('photo');

$file = $request->photo;
```

You may determine if a file is present on the request using the `hasFile` method:

```php
if ($request->hasFile('photo')) {
    // ...
}
```

If the uploaded file is an image that you need to manipulate before storing, you may use the `image` method to retrieve an `Illuminate\Image\Image` instance, or `null` if the file is not present:

```php
$image = $request->image('photo');
```

For more information on manipulating images, please consult the complete [image manipulation documentation](https://laravel.com/docs/images).

##### Validating Successful Uploads

In addition to checking if the file is present, you may verify that there were no problems uploading the file via the `isValid` method:

```php
if ($request->file('photo')->isValid()) {
    // ...
}
```

##### File Paths and Extensions

The `UploadedFile` class also contains methods for accessing the file's fully-qualified path and its extension. The `extension` method will attempt to guess the file's extension based on its contents. This extension may be different from the extension that was supplied by the client:

```php
$path = $request->photo->path();

$extension = $request->photo->extension();
```

##### Other File Methods

There are a variety of other methods available on `UploadedFile` instances. Check out the [API documentation for the class](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php) for more information regarding these methods.

#### Storing Uploaded Files

To store an uploaded file, you will typically use one of your configured [filesystems](https://laravel.com/docs/filesystem). The `UploadedFile` class has a `store` method that will move an uploaded file to one of your disks, which may be a location on your local filesystem or a cloud storage location like Amazon S3.

The `store` method accepts the path where the file should be stored relative to the filesystem's configured root directory. This path should not contain a filename, since a unique ID will automatically be generated to serve as the filename.

The `store` method also accepts an optional second argument for the name of the disk that should be used to store the file. The method will return the path of the file relative to the disk's root:

```php
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

If you do not want a filename to be automatically generated, you may use the `storeAs` method, which accepts the path, filename, and disk name as its arguments:

```php
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

> **Note:**
> For more information about file storage in Laravel, check out the complete [file storage documentation](https://laravel.com/docs/filesystem).

### Configuring Trusted Proxies

When running your applications behind a load balancer that terminates TLS / SSL certificates, you may notice your application sometimes does not generate HTTPS links when using the `url` helper. Typically this is because your application is being forwarded traffic from your load balancer on port 80 and does not know it should generate secure links.

To solve this, you may enable the `Illuminate\Http\Middleware\TrustProxies` middleware that is included in your Laravel application, which allows you to quickly customize the load balancers or proxies that should be trusted by your application. Your trusted proxies should be specified using the `trustProxies` middleware method in your application's `bootstrap/app.php` file:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(at: [
        '192.168.1.1',
        '10.0.0.0/8',
    ]);
})
```

In addition to configuring the trusted proxies, you may also configure the proxy headers that should be trusted:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(headers: Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB
    );
})
```

> **Note:**
> If you are using AWS Elastic Load Balancing, the `headers` value should be `Request::HEADER_X_FORWARDED_AWS_ELB`. If your load balancer uses the standard `Forwarded` header from [RFC 7239](https://www.rfc-editor.org/rfc/rfc7239#section-4), the `headers` value should be `Request::HEADER_FORWARDED`. For more information on the constants that may be used in the `headers` value, check out Symfony's documentation on [trusting proxies](https://symfony.com/doc/current/deployment/proxies.html).

##### Trusting All Proxies

If you are using Amazon AWS or another "cloud" load balancer provider, you may not know the IP addresses of your actual balancers. In this case, you may use `*` to trust all proxies:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(at: '*');
})
```

### Configuring Trusted Hosts

By default, Laravel will respond to all requests it receives regardless of the content of the HTTP request's `Host` header. In addition, the `Host` header's value will be used when generating absolute URLs to your application during a web request.

Typically, you should configure your web server, such as Nginx or Apache, to only send requests to your application that match a given hostname. However, if you do not have the ability to customize your web server directly and need to instruct Laravel to only respond to certain hostnames, you may do so by enabling the `Illuminate\Http\Middleware\TrustHosts` middleware for your application.

To enable the `TrustHosts` middleware, you should invoke the `trustHosts` middleware method in your application's `bootstrap/app.php` file. Using the `at` argument of this method, you may specify the hostnames that your application should respond to. The hostname string is treated as a regular expression. Incoming requests with other `Host` headers will be rejected:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustHosts(at: ['^laravel\.test$']);
})
```

By default, requests coming from subdomains of the application's URL are also automatically trusted. If you would like to disable this behavior, you may use the `subdomains` argument:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustHosts(at: ['^laravel\.test$'], subdomains: false);
})
```

If you need to access your application's configuration files or database to determine your trusted hosts, you may provide a closure to the `at` argument:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustHosts(at: fn () => config('app.trusted_hosts'));
})
```

## HTTP Responses

> **Source:** [HTTP Responses](https://laravel.com/docs/responses) · [Laravel docs](https://github.com/laravel/docs), MIT

### Creating Responses

##### Strings and Arrays

All routes and controllers should return a response to be sent back to the user's browser. Laravel provides several different ways to return responses. The most basic response is returning a string from a route or controller. The framework will automatically convert the string into a full HTTP response:

```php
Route::get('/', function () {
    return 'Hello World';
});
```

In addition to returning strings from your routes and controllers, you may also return arrays. The framework will automatically convert the array into a JSON response:

```php
Route::get('/', function () {
    return [1, 2, 3];
});
```

> **Note:**
> Did you know you can also return [Eloquent collections](https://laravel.com/docs/eloquent-collections) from your routes or controllers? They will automatically be converted to JSON. Give it a shot!

##### Response Objects

Typically, you won't just be returning simple strings or arrays from your route actions. Instead, you will be returning full `Illuminate\Http\Response` instances or [views](https://laravel.com/docs/views).

Returning a full `Response` instance allows you to customize the response's HTTP status code and headers. A `Response` instance inherits from the `Symfony\Component\HttpFoundation\Response` class, which provides a variety of methods for building HTTP responses:

```php
Route::get('/home', function () {
    return response('Hello World', 200)
        ->header('Content-Type', 'text/plain');
});
```

##### Eloquent Models and Collections

You may also return [Eloquent ORM](https://laravel.com/docs/eloquent) models and collections directly from your routes and controllers. When you do, Laravel will automatically convert the models and collections to JSON responses while respecting the model's [hidden attributes](https://laravel.com/docs/eloquent-serialization#hiding-attributes-from-json):

```php
use App\Models\User;

Route::get('/user/{user}', function (User $user) {
    return $user;
});
```

#### Attaching Headers to Responses

Keep in mind that most response methods are chainable, allowing for the fluent construction of response instances. For example, you may use the `header` method to add a series of headers to the response before sending it back to the user:

```php
return response($content)
    ->header('Content-Type', $type)
    ->header('X-Header-One', 'Header Value')
    ->header('X-Header-Two', 'Header Value');
```

Or, you may use the `withHeaders` method to specify an array of headers to be added to the response:

```php
return response($content)
    ->withHeaders([
        'Content-Type' => $type,
        'X-Header-One' => 'Header Value',
        'X-Header-Two' => 'Header Value',
    ]);
```

You can remove specific headers from an outgoing response using the `withoutHeader` method:

```php
return response($content)->withoutHeader('X-Debug');

return response($content)->withoutHeader(['X-Debug', 'X-Powered-By']);
```

##### Cache Control Middleware

Laravel includes a `cache.headers` middleware, which may be used to quickly set the `Cache-Control` header for a group of routes. Directives should be provided using the "snake case" equivalent of the corresponding cache-control directive and should be separated by a semicolon. If `etag` is specified in the list of directives, an xxh128 hash of the response content will automatically be set as the ETag identifier:

```php
Route::middleware('cache.headers:public;max_age=30;s_maxage=300;stale_while_revalidate=600;etag')->group(function () {
    Route::get('/privacy', function () {
        // ...
    });

    Route::get('/terms', function () {
        // ...
    });
});
```

#### Attaching Cookies to Responses

You may attach a cookie to an outgoing `Illuminate\Http\Response` instance using the `cookie` method. You should pass the name, value, and the number of minutes the cookie should be considered valid to this method:

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes
);
```

The `cookie` method also accepts a few more arguments which are used less frequently. Generally, these arguments have the same purpose and meaning as the arguments that would be given to PHP's native [setcookie](https://secure.php.net/manual/en/function.setcookie.php) method:

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
);
```

If you would like to ensure that a cookie is sent with the outgoing response but you do not yet have an instance of that response, you can use the `Cookie` facade to "queue" cookies for attachment to the response when it is sent. The `queue` method accepts the arguments needed to create a cookie instance. These cookies will be attached to the outgoing response before it is sent to the browser:

```php
use Illuminate\Support\Facades\Cookie;

Cookie::queue('name', 'value', $minutes);
```

##### Generating Cookie Instances

If you would like to generate a `Symfony\Component\HttpFoundation\Cookie` instance that can be attached to a response instance at a later time, you may use the global `cookie` helper. This cookie will not be sent back to the client unless it is attached to a response instance:

```php
$cookie = cookie('name', 'value', $minutes);

return response('Hello World')->cookie($cookie);
```

##### Expiring Cookies Early

You may remove a cookie by expiring it via the `withoutCookie` or `withoutCookies` method of an outgoing response:

```php
return response('Hello World')->withoutCookie('name');

return response('Hello World')->withoutCookies([
    'name',
    'email',
    'preferences',
]);
```

If you do not yet have an instance of the outgoing response, you may use the `Cookie` facade's `expire` method to expire a cookie:

```php
Cookie::expire('name');
```

#### Cookies and Encryption

By default, thanks to the `Illuminate\Cookie\Middleware\EncryptCookies` middleware, all cookies generated by Laravel are encrypted and signed so that they can't be modified or read by the client. If you would like to disable encryption for a subset of cookies generated by your application, you may use the `encryptCookies` method in your application's `bootstrap/app.php` file:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->encryptCookies(except: [
        'cookie_name',
    ]);
})
```

> **Note:**
> In general, cookie encryption should never be disabled, as this exposes your cookies to potential client-side data exposure and tampering.

### Redirects

Redirect responses are instances of the `Illuminate\Http\RedirectResponse` class, and contain the proper headers needed to redirect the user to another URL. There are several ways to generate a `RedirectResponse` instance. The simplest method is to use the global `redirect` helper:

```php
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

Sometimes you may wish to redirect the user to their previous location, such as when a submitted form is invalid. You may do so by using the global `back` helper function. Since this feature utilizes the [session](https://laravel.com/docs/session), make sure the route calling the `back` function is using the `web` middleware group:

```php
Route::post('/user/profile', function () {
    // Validate the request...

    return back()->withInput();
});
```

#### Redirecting to Named Routes

When you call the `redirect` helper with no parameters, an instance of `Illuminate\Routing\Redirector` is returned, allowing you to call any method on the `Redirector` instance. For example, to generate a `RedirectResponse` to a named route, you may use the `route` method:

```php
return redirect()->route('login');
```

If your route has parameters, you may pass them as the second argument to the `route` method:

```php
// For a route with the following URI: /profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

##### Populating Parameters via Eloquent Models

If you are redirecting to a route with an "ID" parameter that is being populated from an Eloquent model, you may pass the model itself. The ID will be extracted automatically:

```php
// For a route with the following URI: /profile/{id}

return redirect()->route('profile', [$user]);
```

If you would like to customize the value that is placed in the route parameter, you can specify the column in the route parameter definition (`/profile/{id:slug}`) or you can override the `getRouteKey` method on your Eloquent model:

```php
/**
 * Get the value of the model's route key.
 */
public function getRouteKey(): mixed
{
    return $this->slug;
}
```

#### Redirecting to Controller Actions

You may also generate redirects to [controller actions](https://laravel.com/docs/controllers). To do so, pass the controller and action name to the `action` method:

```php
use App\Http\Controllers\UserController;

return redirect()->action([UserController::class, 'index']);
```

If your controller route requires parameters, you may pass them as the second argument to the `action` method:

```php
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

#### Redirecting to External Domains

Sometimes you may need to redirect to a domain outside of your application. You may do so by calling the `away` method, which creates a `RedirectResponse` without any additional URL encoding, validation, or verification:

```php
return redirect()->away('https://www.google.com');
```

#### Redirecting With Flashed Session Data

Redirecting to a new URL and [flashing data to the session](https://laravel.com/docs/session#flash-data) are usually done at the same time. Typically, this is done after successfully performing an action when you flash a success message to the session. For convenience, you may create a `RedirectResponse` instance and flash data to the session in a single, fluent method chain:

```php
Route::post('/user/profile', function () {
    // ...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

After the user is redirected, you may display the flashed message from the [session](https://laravel.com/docs/session). For example, using [Blade syntax](https://laravel.com/docs/blade):

```blade
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

##### Redirecting With Input

You may use the `withInput` method provided by the `RedirectResponse` instance to flash the current request's input data to the session before redirecting the user to a new location. This is typically done if the user has encountered a validation error. Once the input has been flashed to the session, you may easily [retrieve it](https://laravel.com/docs/requests#retrieving-old-input) during the next request to repopulate the form:

```php
return back()->withInput();
```

### Other Response Types

The `response` helper may be used to generate other types of response instances. When the `response` helper is called without arguments, an implementation of the `Illuminate\Contracts\Routing\ResponseFactory` [contract](https://laravel.com/docs/contracts) is returned. This contract provides several helpful methods for generating responses.

#### View Responses

If you need control over the response's status and headers but also need to return a [view](https://laravel.com/docs/views) as the response's content, you should use the `view` method:

```php
return response()
    ->view('hello', $data, 200)
    ->header('Content-Type', $type);
```

Of course, if you do not need to pass a custom HTTP status code or custom headers, you may use the global `view` helper function.

#### JSON Responses

The `json` method will automatically set the `Content-Type` header to `application/json`, as well as convert the given array to JSON using the `json_encode` PHP function:

```php
return response()->json([
    'name' => 'Abigail',
    'state' => 'CA',
]);
```

If you would like to create a JSONP response, you may use the `json` method in combination with the `withCallback` method:

```php
return response()
    ->json(['name' => 'Abigail', 'state' => 'CA'])
    ->withCallback($request->input('callback'));
```

#### File Downloads

The `download` method may be used to generate a response that forces the user's browser to download the file at the given path. The `download` method accepts a filename as the second argument to the method, which will determine the filename that is seen by the user downloading the file. Finally, you may pass an array of HTTP headers as the third argument to the method:

```php
return response()->download($pathToFile);

return response()->download($pathToFile, $name, $headers);
```

> **Warning:**
> Symfony HttpFoundation, which manages file downloads, requires the file being downloaded to have an ASCII filename.

#### File Responses

The `file` method may be used to display a file, such as an image or PDF, directly in the user's browser instead of initiating a download. This method accepts the absolute path to the file as its first argument and an array of headers as its second argument:

```php
return response()->file($pathToFile);

return response()->file($pathToFile, $headers);
```

### Streamed Responses

By streaming data to the client as it is generated, you can significantly reduce memory usage and improve performance, especially for very large responses. Streamed responses allow the client to begin processing data before the server has finished sending it:

```php
Route::get('/stream', function () {
    return response()->stream(function (): void {
        foreach (['developer', 'admin'] as $string) {
            echo $string;
            ob_flush();
            flush();
            sleep(2); // Simulate delay between chunks...
        }
    }, 200, ['X-Accel-Buffering' => 'no']);
});
```

For convenience, if the closure you provide to the `stream` method returns a [Generator](https://www.php.net/manual/en/language.generators.overview.php), Laravel will automatically flush the output buffer between strings returned by the generator, as well as disable Nginx output buffering:

```php
Route::post('/chat', function () {
    return response()->stream(function (): Generator {
        $stream = OpenAI::client()->chat()->createStreamed(...);

        foreach ($stream as $response) {
            yield $response->choices[0];
        }
    });
});
```

#### Consuming Streamed Responses

Streamed responses may be consumed using Laravel's `stream` npm package, which provides a convenient API for interacting with Laravel response and event streams. To get started, install the `@laravel/stream-react`, `@laravel/stream-vue`, or `@laravel/stream-svelte` package:

```shell
npm install @laravel/stream-react
```

```shell
npm install @laravel/stream-vue
```

```shell
npm install @laravel/stream-svelte
```

Then, `useStream` may be used to consume the event stream. After providing your stream URL, the hook will automatically update the `data` with the concatenated response as content is returned from your Laravel application:

```tsx
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, isFetching, isStreaming, send } = useStream("chat");

    const sendMessage = () => {
        send({
            message: `Current timestamp: ${Date.now()}`,
        });
    };

    return (
        <div>
            <div>{data}</div>
            {isFetching && <div>Connecting...</div>}
            {isStreaming && <div>Generating...</div>}
            <button onClick={sendMessage}>Send Message</button>
        </div>
    );
}
```

```vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data, isFetching, isStreaming, send } = useStream("chat");

const sendMessage = () => {
    send({
        message: `Current timestamp: ${Date.now()}`,
    });
};
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <div v-if="isFetching">Connecting...</div>
        <div v-if="isStreaming">Generating...</div>
        <button @click="sendMessage">Send Message</button>
    </div>
</template>
```

```svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat");

const sendMessage = () => {
    stream.send({
        message: `Current timestamp: ${Date.now()}`,
    });
};
</script>

<div>
    <div>{$stream.data}</div>
    {#if $stream.isFetching}
        <div>Connecting...</div>
    {/if}
    {#if $stream.isStreaming}
        <div>Generating...</div>
    {/if}
    <button onclick={sendMessage}>Send Message</button>
</div>
```

When sending data back to the stream via `send`, the active connection to the stream is canceled before sending the new data. All requests are sent as JSON `POST` requests.

> **Warning:**
> Since the `useStream` hook makes a `POST` request to your application, a valid CSRF token is required. The easiest way to provide the CSRF token is to [include it via a meta tag in your application layout's head](https://laravel.com/docs/csrf#csrf-x-csrf-token).

The second argument given to `useStream` is an options object that you may use to customize the stream consumption behavior. The default values for this object are shown below:

```tsx
import { useStream } from "@laravel/stream-react";

function App() {
    const { data } = useStream("chat", {
        id: undefined,
        initialInput: undefined,
        headers: undefined,
        csrfToken: undefined,
        onResponse: (response: Response) => void,
        onData: (data: string) => void,
        onCancel: () => void,
        onFinish: () => void,
        onError: (error: Error) => void,
    });

    return <div>{data}</div>;
}
```

```vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data } = useStream("chat", {
    id: undefined,
    initialInput: undefined,
    headers: undefined,
    csrfToken: undefined,
    onResponse: (response: Response) => void,
    onData: (data: string) => void,
    onCancel: () => void,
    onFinish: () => void,
    onError: (error: Error) => void,
});
</script>

<template>
    <div>{{ data }}</div>
</template>
```

```svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat", {
    id: undefined,
    initialInput: undefined,
    headers: undefined,
    csrfToken: undefined,
    onResponse: (response) => {},
    onData: (data) => {},
    onCancel: () => {},
    onFinish: () => {},
    onError: (error) => {},
});
</script>

<div>{$stream.data}</div>
```

`onResponse` is triggered after a successful initial response from the stream and the raw [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) is passed to the callback. `onData` is called as each chunk is received - the current chunk is passed to the callback. `onFinish` is called when a stream has finished and when an error is thrown during the fetch / read cycle.

By default, a request is not made to the stream on initialization. You may pass an initial payload to the stream by using the `initialInput` option:

```tsx
import { useStream } from "@laravel/stream-react";

function App() {
    const { data } = useStream("chat", {
        initialInput: {
            message: "Introduce yourself.",
        },
    });

    return <div>{data}</div>;
}
```

```vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data } = useStream("chat", {
    initialInput: {
        message: "Introduce yourself.",
    },
});
</script>

<template>
    <div>{{ data }}</div>
</template>
```

```svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat", {
    initialInput: {
        message: "Introduce yourself.",
    },
});
</script>

<div>{$stream.data}</div>
```

To cancel a stream manually, you may use the `cancel` method returned from the hook:

```tsx
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, cancel } = useStream("chat");

    return (
        <div>
            <div>{data}</div>
            <button onClick={cancel}>Cancel</button>
        </div>
    );
}
```

```vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data, cancel } = useStream("chat");
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <button @click="cancel">Cancel</button>
    </div>
</template>
```

```svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat");
</script>

<div>
    <div>{$stream.data}</div>
    <button onclick={() => stream.cancel()}>Cancel</button>
</div>
```

Each time the `useStream` hook is used, a random `id` is generated to identify the stream. This is sent back to the server with each request in the `X-STREAM-ID` header. When consuming the same stream from multiple components, you can read and write to the stream by providing your own `id`:

```tsx
// App.tsx
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, id } = useStream("chat");

    return (
        <div>
            <div>{data}</div>
            <StreamStatus id={id} />
        </div>
    );
}

// StreamStatus.tsx
import { useStream } from "@laravel/stream-react";

function StreamStatus({ id }) {
    const { isFetching, isStreaming } = useStream("chat", { id });

    return (
        <div>
            {isFetching && <div>Connecting...</div>}
            {isStreaming && <div>Generating...</div>}
        </div>
    );
}
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";
import StreamStatus from "./StreamStatus.vue";

const { data, id } = useStream("chat");
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <StreamStatus :id="id" />
    </div>
</template>

<!-- StreamStatus.vue -->
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const props = defineProps<{
    id: string;
}>();

const { isFetching, isStreaming } = useStream("chat", { id: props.id });
</script>

<template>
    <div>
        <div v-if="isFetching">Connecting...</div>
        <div v-if="isStreaming">Generating...</div>
    </div>
</template>
```

```svelte
<!-- App.svelte -->
<script>
import { useStream } from "@laravel/stream-svelte";
import StreamStatus from "./StreamStatus.svelte";

const stream = useStream("chat");
</script>

<div>
    <div>{$stream.data}</div>
    <StreamStatus id={stream.id} />
</div>

<!-- StreamStatus.svelte -->
<script>
import { useStream } from "@laravel/stream-svelte";

let { id } = $props();

const stream = useStream("chat", { id });
</script>

<div>
    {#if $stream.isFetching}
        <div>Connecting...</div>
    {/if}
    {#if $stream.isStreaming}
        <div>Generating...</div>
    {/if}
</div>
```

#### Streamed JSON Responses

If you need to stream JSON data incrementally, you may utilize the `streamJson` method. This method is especially useful for large datasets that need to be sent progressively to the browser in a format that can be easily parsed by JavaScript:

```php
use App\Models\User;

Route::get('/users.json', function () {
    return response()->streamJson([
        'users' => User::cursor(),
    ]);
});
```

The `useJsonStream` hook is identical to the [useStream hook](#consuming-streamed-responses) except that it will attempt to parse the data as JSON once it has finished streaming:

```tsx
import { useJsonStream } from "@laravel/stream-react";

type User = {
    id: number;
    name: string;
    email: string;
};

function App() {
    const { data, send } = useJsonStream<{ users: User[] }>("users");

    const loadUsers = () => {
        send({
            query: "taylor",
        });
    };

    return (
        <div>
            <ul>
                {data?.users.map((user) => (
                    <li>
                        {user.id}: {user.name}
                    </li>
                ))}
            </ul>
            <button onClick={loadUsers}>Load Users</button>
        </div>
    );
}
```

```vue
<script setup lang="ts">
import { useJsonStream } from "@laravel/stream-vue";

type User = {
    id: number;
    name: string;
    email: string;
};

const { data, send } = useJsonStream<{ users: User[] }>("users");

const loadUsers = () => {
    send({
        query: "taylor",
    });
};
</script>

<template>
    <div>
        <ul>
            <li v-for="user in data?.users" :key="user.id">
                {{ user.id }}: {{ user.name }}
            </li>
        </ul>
        <button @click="loadUsers">Load Users</button>
    </div>
</template>
```

```svelte
<script>
import { useJsonStream } from "@laravel/stream-svelte";

const stream = useJsonStream("users");

const loadUsers = () => {
    stream.send({
        query: "taylor",
    });
};
</script>

<div>
    <ul>
        {#if $stream.data?.users}
            {#each $stream.data.users as user (user.id)}
                <li>{user.id}: {user.name}</li>
            {/each}
        {/if}
    </ul>
    <button onclick={loadUsers}>Load Users</button>
</div>
```

#### Event Streams (SSE)

The `eventStream` method may be used to return a server-sent events (SSE) streamed response using the `text/event-stream` content type. The `eventStream` method accepts a closure which should [yield](https://www.php.net/manual/en/language.generators.overview.php) responses to the stream as the responses become available:

```php
Route::get('/chat', function () {
    return response()->eventStream(function () {
        $stream = OpenAI::client()->chat()->createStreamed(...);

        foreach ($stream as $response) {
            yield $response->choices[0];
        }
    });
});
```

If you would like to customize the name of the event, you may yield an instance of the `StreamedEvent` class:

```php
use Illuminate\Http\StreamedEvent;

yield new StreamedEvent(
    event: 'update',
    data: $response->choices[0],
);
```

##### Consuming Event Streams

Event streams may be consumed using Laravel's `stream` npm package, which provides a convenient API for interacting with Laravel event streams. To get started, install the `@laravel/stream-react`, `@laravel/stream-vue`, or `@laravel/stream-svelte` package:

```shell
npm install @laravel/stream-react
```

```shell
npm install @laravel/stream-vue
```

```shell
npm install @laravel/stream-svelte
```

Then, `useEventStream` may be used to consume the event stream. After providing your stream URL, the hook will automatically update the `message` with the concatenated response as messages are returned from your Laravel application:

```jsx
import { useEventStream } from "@laravel/stream-react";

function App() {
  const { message } = useEventStream("/chat");

  return <div>{message}</div>;
}
```

```vue
<script setup lang="ts">
import { useEventStream } from "@laravel/stream-vue";

const { message } = useEventStream("/chat");
</script>

<template>
  <div>{{ message }}</div>
</template>
```

```svelte
<script>
import { useEventStream } from "@laravel/stream-svelte";

const eventStream = useEventStream("/chat");
</script>

<div>{$eventStream.message}</div>
```

The second argument given to `useEventStream` is an options object that you may use to customize the stream consumption behavior. The default values for this object are shown below:

```jsx
import { useEventStream } from "@laravel/stream-react";

function App() {
  const { message } = useEventStream("/stream", {
    eventName: "update",
    onMessage: (message) => {
      //
    },
    onError: (error) => {
      //
    },
    onComplete: () => {
      //
    },
    endSignal: "</stream>",
    glue: " ",
  });

  return <div>{message}</div>;
}
```

```vue
<script setup lang="ts">
import { useEventStream } from "@laravel/stream-vue";

const { message } = useEventStream("/chat", {
  eventName: "update",
  onMessage: (message) => {
    // ...
  },
  onError: (error) => {
    // ...
  },
  onComplete: () => {
    // ...
  },
  endSignal: "</stream>",
  glue: " ",
});
</script>
```

```svelte
<script>
import { useEventStream } from "@laravel/stream-svelte";

const eventStream = useEventStream("/chat", {
    eventName: "update",
    onMessage: (event) => {
        //
    },
    onError: (error) => {
        //
    },
    onComplete: () => {
        //
    },
    endSignal: "</stream>",
    glue: " ",
    replace: false,
});
</script>
```

Event streams may also be manually consumed via an [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) object by your application's frontend. The `eventStream` method will automatically send a `</stream>` update to the event stream when the stream is complete:

```js
const source = new EventSource('/chat');

source.addEventListener('update', (event) => {
    if (event.data === '</stream>') {
        source.close();

        return;
    }

    console.log(event.data);
});
```

To customize the final event that is sent to the event stream, you may provide a `StreamedEvent` instance to the `eventStream` method's `endStreamWith` argument:

```php
return response()->eventStream(function () {
    // ...
}, endStreamWith: new StreamedEvent(event: 'update', data: '</stream>'));
```

#### Streamed Downloads

Sometimes you may wish to turn the string response of a given operation into a downloadable response without having to write the contents of the operation to disk. You may use the `streamDownload` method in this scenario. This method accepts a callback, filename, and an optional array of headers as its arguments:

```php
use App\Services\GitHub;

return response()->streamDownload(function () {
    echo GitHub::api('repo')
        ->contents()
        ->readme('laravel', 'laravel')['contents'];
}, 'laravel-readme.md');
```

### Response Macros

If you would like to define a custom response that you can re-use in a variety of your routes and controllers, you may use the `macro` method on the `Response` facade. Typically, you should call this method from the `boot` method of one of your application's [service providers](https://laravel.com/docs/providers), such as the `App\Providers\AppServiceProvider` service provider:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Response::macro('caps', function (string $value) {
            return Response::make(strtoupper($value));
        });
    }
}
```

The `macro` function accepts a name as its first argument and a closure as its second argument. The macro's closure will be executed when calling the macro name from a `ResponseFactory` implementation or the `response` helper:

```php
return response()->caps('foo');
```

## Views

> **Source:** [Views](https://laravel.com/docs/views) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

Of course, it's not practical to return entire HTML documents strings directly from your routes and controllers. Thankfully, views provide a convenient way to place all of our HTML in separate files.

Views separate your controller / application logic from your presentation logic and are stored in the `resources/views` directory. When using Laravel, view templates are usually written using the [Blade templating language](https://laravel.com/docs/blade). A simple view might look something like this:

```blade
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

Since this view is stored at `resources/views/greeting.blade.php`, we may return it using the global `view` helper like so:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

> **Note:**
> Looking for more information on how to write Blade templates? Check out the full [Blade documentation](https://laravel.com/docs/blade) to get started.

#### Writing Views in React / Svelte / Vue

Instead of writing their frontend templates in PHP via Blade, many developers have begun to prefer to write their templates using React, Svelte, or Vue. Laravel makes this painless thanks to [Inertia](https://inertiajs.com/), a library that makes it a cinch to tie your React / Svelte / Vue frontend to your Laravel backend without the typical complexities of building an SPA.

Our [React, Svelte, and Vue application starter kits](https://laravel.com/docs/starter-kits) give you a great starting point for your next Laravel application powered by Inertia.

### Creating and Rendering Views

You may create a view by placing a file with the `.blade.php` extension in your application's `resources/views` directory or by using the `make:view` Artisan command:

```shell
php artisan make:view greeting
```

The `.blade.php` extension informs the framework that the file contains a [Blade template](https://laravel.com/docs/blade). Blade templates contain HTML as well as Blade directives that allow you to easily echo values, create "if" statements, iterate over data, and more.

Once you have created a view, you may return it from one of your application's routes or controllers using the global `view` helper:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

Views may also be returned using the `View` facade:

```php
use Illuminate\Support\Facades\View;

return View::make('greeting', ['name' => 'James']);
```

As you can see, the first argument passed to the `view` helper corresponds to the name of the view file in the `resources/views` directory. The second argument is an array of data that should be made available to the view. In this case, we are passing the `name` variable, which is displayed in the view using [Blade syntax](https://laravel.com/docs/blade).

#### Nested View Directories

Views may also be nested within subdirectories of the `resources/views` directory. "Dot" notation may be used to reference nested views. For example, if your view is stored at `resources/views/admin/profile.blade.php`, you may return it from one of your application's routes / controllers like so:

```php
return view('admin.profile', $data);
```

> **Warning:**
> View directory names should not contain the `.` character.

#### Creating the First Available View

Using the `View` facade's `first` method, you may create the first view that exists in a given array of views. This may be useful if your application or package allows views to be customized or overwritten:

```php
use Illuminate\Support\Facades\View;

return View::first(['custom.admin', 'admin'], $data);
```

#### Determining if a View Exists

If you need to determine if a view exists, you may use the `View` facade. The `exists` method will return `true` if the view exists:

```php
use Illuminate\Support\Facades\View;

if (View::exists('admin.profile')) {
    // ...
}
```

### Passing Data to Views

As you saw in the previous examples, you may pass an array of data to views to make that data available to the view:

```php
return view('greetings', ['name' => 'Victoria']);
```

When passing information in this manner, the data should be an array with key / value pairs. After providing data to a view, you can then access each value within your view using the data's keys, such as `<?php echo $name; ?>`.

As an alternative to passing a complete array of data to the `view` helper function, you may use the `with` method to add individual pieces of data to the view. The `with` method returns an instance of the view object so that you can continue chaining methods before returning the view:

```php
return view('greeting')
    ->with('name', 'Victoria')
    ->with('occupation', 'Astronaut');
```

#### Sharing Data With All Views

Occasionally, you may need to share data with all views that are rendered by your application. You may do so using the `View` facade's `share` method. Typically, you should place calls to the `share` method within a service provider's `boot` method. You are free to add them to the `App\Providers\AppServiceProvider` class or generate a separate service provider to house them:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        View::share('key', 'value');
    }
}
```

### View Composers

View composers are callbacks or class methods that are called when a view is rendered. If you have data that you want to be bound to a view each time that view is rendered, a view composer can help you organize that logic into a single location. View composers may prove particularly useful if the same view is returned by multiple routes or controllers within your application and always needs a particular piece of data.

Typically, view composers will be registered within one of your application's [service providers](https://laravel.com/docs/providers). In this example, we'll assume that the `App\Providers\AppServiceProvider` will house this logic.

We'll use the `View` facade's `composer` method to register the view composer. Laravel does not include a default directory for class-based view composers, so you are free to organize them however you wish. For example, you could create an `app/View/Composers` directory to house all of your application's view composers:

```php
<?php

namespace App\Providers;

use App\View\Composers\ProfileComposer;
use Illuminate\Support\Facades;
use Illuminate\Support\ServiceProvider;
use Illuminate\View\View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Using class-based composers...
        Facades\View::composer('profile', ProfileComposer::class);

        // Using closure-based composers...
        Facades\View::composer('welcome', function (View $view) {
            // ...
        });

        Facades\View::composer('dashboard', function (View $view) {
            // ...
        });
    }
}
```

Now that we have registered the composer, the `compose` method of the `App\View\Composers\ProfileComposer` class will be executed each time the `profile` view is being rendered. Let's take a look at an example of the composer class:

```php
<?php

namespace App\View\Composers;

use App\Repositories\UserRepository;
use Illuminate\View\View;

class ProfileComposer
{
    /**
     * Create a new profile composer.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}

    /**
     * Bind data to the view.
     */
    public function compose(View $view): void
    {
        $view->with('count', $this->users->count());
    }
}
```

As you can see, all view composers are resolved via the [service container](https://laravel.com/docs/container), so you may type-hint any dependencies you need within a composer's constructor.

##### Attaching a Composer to Multiple Views

You may attach a view composer to multiple views at once by passing an array of views as the first argument to the `composer` method:

```php
use App\Views\Composers\MultiComposer;
use Illuminate\Support\Facades\View;

View::composer(
    ['profile', 'dashboard'],
    MultiComposer::class
);
```

The `composer` method also accepts the `*` character as a wildcard, allowing you to attach a composer to all views:

```php
use Illuminate\Support\Facades;
use Illuminate\View\View;

Facades\View::composer('*', function (View $view) {
    // ...
});
```

#### View Creators

View "creators" are very similar to view composers; however, they are executed immediately after the view is instantiated instead of waiting until the view is about to render. To register a view creator, use the `creator` method:

```php
use App\View\Creators\ProfileCreator;
use Illuminate\Support\Facades\View;

View::creator('profile', ProfileCreator::class);
```

### Optimizing Views

By default, Blade template views are compiled on demand. When a request is executed that renders a view, Laravel will determine if a compiled version of the view exists. If the file exists, Laravel will then determine if the uncompiled view has been modified more recently than the compiled view. If the compiled view either does not exist, or the uncompiled view has been modified, Laravel will recompile the view.

Compiling views during the request may have a small negative impact on performance, so Laravel provides the `view:cache` Artisan command to precompile all of the views utilized by your application. For increased performance, you may wish to run this command as part of your deployment process:

```shell
php artisan view:cache
```

You may use the `view:clear` command to clear the view cache:

```shell
php artisan view:clear
```

## Blade Templates

> **Source:** [Blade Templates](https://laravel.com/docs/blade) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

Blade is the simple, yet powerful templating engine that is included with Laravel. Unlike some PHP templating engines, Blade does not restrict you from using plain PHP code in your templates. In fact, all Blade templates are compiled into plain PHP code and cached until they are modified, meaning Blade adds essentially zero overhead to your application. Blade template files use the `.blade.php` file extension and are typically stored in the `resources/views` directory.

Blade views may be returned from routes or controllers using the global `view` helper. Of course, as mentioned in the documentation on [views](https://laravel.com/docs/views), data may be passed to the Blade view using the `view` helper's second argument:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'Finn']);
});
```

#### Supercharging Blade With Livewire

Want to take your Blade templates to the next level and build dynamic interfaces with ease? Check out [Laravel Livewire](https://livewire.laravel.com). Livewire allows you to write Blade components that are augmented with dynamic functionality that would typically only be possible via frontend frameworks like React, Svelte, or Vue, providing a great approach to building modern, reactive frontends without the complexities, client-side rendering, or build steps of many JavaScript frameworks.

### Displaying Data

You may display data that is passed to your Blade views by wrapping the variable in curly braces. For example, given the following route:

```php
Route::get('/', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

You may display the contents of the `name` variable like so:

```blade
Hello, {{ $name }}.
```

> **Note:**
> Blade's `{{ }}` echo statements are automatically sent through PHP's `htmlspecialchars` function to prevent XSS attacks.

You are not limited to displaying the contents of the variables passed to the view. You may also echo the results of any PHP function. In fact, you can put any PHP code you wish inside of a Blade echo statement:

```blade
The current UNIX timestamp is {{ time() }}.
```

#### HTML Entity Encoding

By default, Blade (and the Laravel `e` function) will double encode HTML entities. If you would like to disable double encoding, call the `Blade::withoutDoubleEncoding` method from the `boot` method of your `AppServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::withoutDoubleEncoding();
    }
}
```

##### Displaying Unescaped Data

By default, Blade `{{ }}` statements are automatically sent through PHP's `htmlspecialchars` function to prevent XSS attacks. If you do not want your data to be escaped, you may use the following syntax:

```blade
Hello, {!! $name !!}.
```

> **Warning:**
> Be very careful when echoing content that is supplied by users of your application. You should typically use the escaped, double curly brace syntax to prevent XSS attacks when displaying user supplied data.

#### Blade and JavaScript Frameworks

Since many JavaScript frameworks also use "curly" braces to indicate a given expression should be displayed in the browser, you may use the `@` symbol to inform the Blade rendering engine an expression should remain untouched. For example:

```blade
<h1>Laravel</h1>

Hello, @{{ name }}.
```

In this example, the `@` symbol will be removed by Blade; however, the `{{ name }}` expression will remain untouched by the Blade engine, allowing it to be rendered by your JavaScript framework.

The `@` symbol may also be used to escape Blade directives:

```blade
{{-- Blade template --}}
@@if()

<!-- HTML output -->
@if()
```

##### Rendering JSON

Sometimes you may pass an array to your view with the intention of rendering it as JSON in order to initialize a JavaScript variable. For example:

```blade
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

However, instead of manually calling `json_encode`, you may use the `Illuminate\Support\Js::from` method. The `from` method accepts the same arguments as PHP's `json_encode` function; however, it will ensure that the resulting JSON has been properly escaped for inclusion within HTML quotes. The `from` method will return a string `JSON.parse` JavaScript statement that will convert the given object or array into a valid JavaScript object:

```blade
<script>
    var app = {{ Illuminate\Support\Js::from($array) }};
</script>
```

The latest versions of the Laravel application skeleton include a `Js` facade, which provides convenient access to this functionality within your Blade templates:

```blade
<script>
    var app = {{ Js::from($array) }};
</script>
```

> **Warning:**
> You should only use the `Js::from` method to render existing variables as JSON. The Blade templating is based on regular expressions and attempts to pass a complex expression to the directive may cause unexpected failures.

##### The `@verbatim` Directive

If you are displaying JavaScript variables in a large portion of your template, you may wrap the HTML in the `@verbatim` directive so that you do not have to prefix each Blade echo statement with an `@` symbol:

```blade
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

### Blade Directives

In addition to template inheritance and displaying data, Blade also provides convenient shortcuts for common PHP control structures, such as conditional statements and loops. These shortcuts provide a very clean, terse way of working with PHP control structures while also remaining familiar to their PHP counterparts.

#### If Statements

You may construct `if` statements using the `@if`, `@elseif`, `@else`, and `@endif` directives. These directives function identically to their PHP counterparts:

```blade
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

For convenience, Blade also provides an `@unless` directive:

```blade
@unless (Auth::check())
    You are not signed in.
@endunless
```

In addition to the conditional directives already discussed, the `@isset` and `@empty` directives may be used as convenient shortcuts for their respective PHP functions:

```blade
@isset($records)
    // $records is defined and is not null...
@endisset

@empty($records)
    // $records is "empty"...
@endempty
```

##### Authentication Directives

The `@auth` and `@guest` directives may be used to quickly determine if the current user is [authenticated](https://laravel.com/docs/authentication) or is a guest:

```blade
@auth
    // The user is authenticated...
@endauth

@guest
    // The user is not authenticated...
@endguest
```

If needed, you may specify the authentication guard that should be checked when using the `@auth` and `@guest` directives:

```blade
@auth('admin')
    // The user is authenticated...
@endauth

@guest('admin')
    // The user is not authenticated...
@endguest
```

##### Environment Directives

You may check if the application is running in the production environment using the `@production` directive:

```blade
@production
    // Production specific content...
@endproduction
```

Or, you may determine if the application is running in a specific environment using the `@env` directive:

```blade
@env('staging')
    // The application is running in "staging"...
@endenv

@env(['staging', 'production'])
    // The application is running in "staging" or "production"...
@endenv
```

##### Section Directives

You may determine if a template inheritance section has content using the `@hasSection` directive:

```blade
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

You may use the `sectionMissing` directive to determine if a section does not have content:

```blade
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

##### Session Directives

The `@session` directive may be used to determine if a [session](https://laravel.com/docs/session) value exists. If the session value exists, the template contents within the `@session` and `@endsession` directives will be evaluated. Within the `@session` directive's contents, you may echo the `$value` variable to display the session value:

```blade
@session('status')
    <div class="p-4 bg-green-100">
        {{ $value }}
    </div>
@endsession
```

##### Context Directives

The `@context` directive may be used to determine if a [context](https://laravel.com/docs/context) value exists. If the context value exists, the template contents within the `@context` and `@endcontext` directives will be evaluated. Within the `@context` directive's contents, you may echo the `$value` variable to display the context value:

```blade
@context('canonical')
    <link href="{{ $value }}" rel="canonical">
@endcontext
```

#### Switch Statements

Switch statements can be constructed using the `@switch`, `@case`, `@break`, `@default` and `@endswitch` directives:

```blade
@switch($i)
    @case(1)
        First case...
        @break

    @case(2)
        Second case...
        @break

    @default
        Default case...
@endswitch
```

#### Loops

In addition to conditional statements, Blade provides simple directives for working with PHP's loop structures. Again, each of these directives functions identically to their PHP counterparts:

```blade
@for ($i = 0; $i < 10; $i++)
    The current value is {{ $i }}
@endfor

@foreach ($users as $user)
    <p>This is user {{ $user->id }}</p>
@endforeach

@forelse ($users as $user)
    <li>{{ $user->name }}</li>
@empty
    <p>No users</p>
@endforelse

@while (true)
    <p>I'm looping forever.</p>
@endwhile
```

> **Note:**
> While iterating through a `foreach` loop, you may use the [loop variable](#the-loop-variable) to gain valuable information about the loop, such as whether you are in the first or last iteration through the loop.

When using loops you may also skip the current iteration or end the loop using the `@continue` and `@break` directives:

```blade
@foreach ($users as $user)
    @if ($user->type == 1)
        @continue
    @endif

    <li>{{ $user->name }}</li>

    @if ($user->number == 5)
        @break
    @endif
@endforeach
```

You may also include the continuation or break condition within the directive declaration:

```blade
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

#### The Loop Variable

While iterating through a `foreach` loop, a `$loop` variable will be available inside of your loop. This variable provides access to some useful bits of information such as the current loop index and whether this is the first or last iteration through the loop:

```blade
@foreach ($users as $user)
    @if ($loop->first)
        This is the first iteration.
    @endif

    @if ($loop->last)
        This is the last iteration.
    @endif

    <p>This is user {{ $user->id }}</p>
@endforeach
```

If you are in a nested loop, you may access the parent loop's `$loop` variable via the `parent` property:

```blade
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

The `$loop` variable also contains a variety of other useful properties:

<div class="overflow-auto">

| Property           | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `$loop->index`     | The index of the current loop iteration (starts at 0). |
| `$loop->iteration` | The current loop iteration (starts at 1).              |
| `$loop->remaining` | The iterations remaining in the loop.                  |
| `$loop->count`     | The total number of items in the array being iterated. |
| `$loop->first`     | Whether this is the first iteration through the loop.  |
| `$loop->last`      | Whether this is the last iteration through the loop.   |
| `$loop->even`      | Whether this is an even iteration through the loop.    |
| `$loop->odd`       | Whether this is an odd iteration through the loop.     |
| `$loop->depth`     | The nesting level of the current loop.                 |
| `$loop->parent`    | When in a nested loop, the parent's loop variable.     |

</div>

#### Conditional Classes & Styles

The `@class` directive conditionally compiles a CSS class string. The directive accepts an array of classes where the array key contains the class or classes you wish to add, while the value is a boolean expression. If the array element has a numeric key, it will always be included in the rendered class list:

```blade
@php
    $isActive = false;
    $hasError = true;
@endphp

<span @class([
    'p-4',
    'font-bold' => $isActive,
    'text-gray-500' => ! $isActive,
    'bg-red' => $hasError,
])></span>

<span class="p-4 text-gray-500 bg-red"></span>
```

Likewise, the `@style` directive may be used to conditionally add inline CSS styles to an HTML element:

```blade
@php
    $isActive = true;
@endphp

<span @style([
    'background-color: red',
    'font-weight: bold' => $isActive,
])></span>

<span style="background-color: red; font-weight: bold;"></span>
```

#### Additional Attributes

For convenience, you may use the `@checked` directive to easily indicate if a given HTML checkbox input is "checked". This directive will echo `checked` if the provided condition evaluates to `true`:

```blade
<input
    type="checkbox"
    name="active"
    value="active"
    @checked(old('active', $user->active))
/>
```

Likewise, the `@selected` directive may be used to indicate if a given select option should be "selected":

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

Additionally, the `@disabled` directive may be used to indicate if a given element should be "disabled":

```blade
<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>
```

Moreover, the `@readonly` directive may be used to indicate if a given element should be "readonly":

```blade
<input
    type="email"
    name="email"
    value="email@laravel.com"
    @readonly($user->isNotAdmin())
/>
```

In addition, the `@required` directive may be used to indicate if a given element should be "required":

```blade
<input
    type="text"
    name="title"
    value="title"
    @required($user->isAdmin())
/>
```

#### Including Subviews

> **Note:**
> While you're free to use the `@include` directive, Blade [components](#components) provide similar functionality and offer several benefits over the `@include` directive such as data and attribute binding.

Blade's `@include` directive allows you to include a Blade view from within another view. All variables that are available to the parent view will be made available to the included view:

```blade
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```

Even though the included view will inherit all data available in the parent view, you may also pass an array of additional data that should be made available to the included view:

```blade
@include('view.name', ['status' => 'complete'])
```

If you attempt to `@include` a view which does not exist, Laravel will throw an error. If you would like to include a view that may or may not be present, you should use the `@includeIf` directive:

```blade
@includeIf('view.name', ['status' => 'complete'])
```

If you would like to `@include` a view if a given boolean expression evaluates to `true` or `false`, you may use the `@includeWhen` and `@includeUnless` directives:

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

To include the first view that exists from a given array of views, you may use the `includeFirst` directive:

```blade
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

If you would like to include a view without inheriting any variables from the parent view, you may use the `@includeIsolated` directive. The included view will only have access to variables you explicitly pass:

```blade
@includeIsolated('view.name', ['user' => $user])
```

> **Warning:**
> You should avoid using the `__DIR__` and `__FILE__` constants in your Blade views, since they will refer to the location of the cached, compiled view.

##### Rendering Views for Collections

You may combine loops and includes into one line with Blade's `@each` directive:

```blade
@each('view.name', $jobs, 'job')
```

The `@each` directive's first argument is the view to render for each element in the array or collection. The second argument is the array or collection you wish to iterate over, while the third argument is the variable name that will be assigned to the current iteration within the view. So, for example, if you are iterating over an array of `jobs`, typically you will want to access each job as a `job` variable within the view. The array key for the current iteration will be available as the `key` variable within the view.

You may also pass a fourth argument to the `@each` directive. This argument determines the view that will be rendered if the given array is empty.

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

> **Warning:**
> Views rendered via `@each` do not inherit the variables from the parent view. If the child view requires these variables, you should use the `@foreach` and `@include` directives instead.

#### The `@once` Directive

The `@once` directive allows you to define a portion of the template that will only be evaluated once per rendering cycle. This may be useful for pushing a given piece of JavaScript into the page's header using [stacks](#stacks). For example, if you are rendering a given [component](#components) within a loop, you may wish to only push the JavaScript to the header the first time the component is rendered:

```blade
@once
    @push('scripts')
        <script>
            // Your custom JavaScript...
        </script>
    @endpush
@endonce
```

Since the `@once` directive is often used in conjunction with the `@push` or `@prepend` directives, the `@pushOnce` and `@prependOnce` directives are available for your convenience:

```blade
@pushOnce('scripts')
    <script>
        // Your custom JavaScript...
    </script>
@endPushOnce
```

If you are pushing duplicate content from two separate Blade templates, you should provide a unique identifier as the second argument to the `@pushOnce` directive to ensure the content is only rendered once:

```blade
<!-- pie-chart.blade.php -->
@pushOnce('scripts', 'chart.js')
    <script src="/chart.js"></script>
@endPushOnce

<!-- line-chart.blade.php -->
@pushOnce('scripts', 'chart.js')
    <script src="/chart.js"></script>
@endPushOnce
```

#### Raw PHP

In some situations, it's useful to embed PHP code into your views. You can use the Blade `@php` directive to execute a block of plain PHP within your template:

```blade
@php
    $counter = 1;
@endphp
```

Or, if you only need to use PHP to import a class, you may use the `@use` directive:

```blade
@use('App\Models\Flight')
```

A second argument may be provided to the `@use` directive to alias the imported class:

```blade
@use('App\Models\Flight', 'FlightModel')
```

If you have multiple classes within the same namespace, you may group the imports of those classes:

```blade
@use('App\Models\{Flight, Airport}')
```

The `@use` directive also supports importing PHP functions and constants by prefixing the import path with the `function` or `const` modifiers:

```blade
@use(function App\Helpers\format_currency)
@use(const App\Constants\MAX_ATTEMPTS)
```

Just like class imports, aliases are supported for functions and constants as well:

```blade
@use(function App\Helpers\format_currency, 'formatMoney')
@use(const App\Constants\MAX_ATTEMPTS, 'MAX_TRIES')
```

Grouped imports are also supported with both function and const modifiers, allowing you to import multiple symbols from the same namespace in a single directive:

```blade
@use(function App\Helpers\{format_currency, format_date})
@use(const App\Constants\{MAX_ATTEMPTS, DEFAULT_TIMEOUT})
```

#### Fonts

When using [Laravel's Vite font optimization](https://laravel.com/docs/vite#working-with-fonts), you may use the `@fonts` directive to render your configured font preload links and inline font CSS in your application's layout:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    @fonts
    @vite('resources/js/app.js')
</head>
```

The `@fonts` directive renders all font families configured in your `vite.config.js` file. The directive should typically be placed in the `<head>` of your application's root layout before any content that uses those fonts.

If a page only needs some of your configured fonts, you may pass one or more font aliases to the directive:

```blade
{{-- Load a single font alias... --}}
@fonts('sans')

{{-- Load multiple font aliases... --}}
@fonts(['sans', 'mono'])
```

Font aliases are configured using the `alias` option when defining fonts in your Vite configuration. The `@fonts` directive calls the `fonts` method provided by the `Vite` facade, which may also be invoked directly:

```blade
{{ Vite::fonts(['sans', 'mono']) }}
```

#### Comments

Blade also allows you to define comments in your views. However, unlike HTML comments, Blade comments are not included in the HTML returned by your application:

```blade
{{-- This comment will not be present in the rendered HTML --}}
```

### Components

Components and slots provide similar benefits to sections, layouts, and includes; however, some may find the mental model of components and slots easier to understand. There are two approaches to writing components: class-based components and anonymous components.

To create a class-based component, you may use the `make:component` Artisan command. To illustrate how to use components, we will create a simple `Alert` component. The `make:component` command will place the component in the `app/View/Components` directory:

```shell
php artisan make:component Alert
```

The `make:component` command will also create a view template for the component. The view will be placed in the `resources/views/components` directory. When writing components for your own application, components are automatically discovered within the `app/View/Components` directory and `resources/views/components` directory, so no further component registration is typically required.

You may also create components within subdirectories:

```shell
php artisan make:component Forms/Input
```

The command above will create an `Input` component in the `app/View/Components/Forms` directory and the view will be placed in the `resources/views/components/forms` directory.

##### Manually Registering Package Components

When writing components for your own application, components are automatically discovered within the `app/View/Components` directory and `resources/views/components` directory.

However, if you are building a package that utilizes Blade components, you will need to manually register your component class and its HTML tag alias. You should typically register your components in the `boot` method of your package's service provider:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::component('package-alert', Alert::class);
}
```

Once your component has been registered, it may be rendered using its tag alias:

```blade
<x-package-alert/>
```

Alternatively, you may use the `componentNamespace` method to autoload component classes by convention. For example, a `Nightshade` package might have `Calendar` and `ColorPicker` components that reside within the `Nightshade\Views\Components` namespace:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

This will allow the usage of package components by their vendor namespace using the `package-name::` syntax:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade will automatically detect the class that's linked to this component by pascal-casing the component name. Subdirectories are also supported using "dot" notation.

#### Rendering Components

To display a component, you may use a Blade component tag within one of your Blade templates. Blade component tags start with the string `x-` followed by the kebab case name of the component class:

```blade
<x-alert/>

<x-user-profile/>
```

If the component class is nested deeper within the `app/View/Components` directory, you may use the `.` character to indicate directory nesting. For example, if we assume a component is located at `app/View/Components/Inputs/Button.php`, we may render it like so:

```blade
<x-inputs.button/>
```

If you would like to conditionally render your component, you may define a `shouldRender` method on your component class. If the `shouldRender` method returns `false` the component will not be rendered:

```php
use Illuminate\Support\Str;

/**
 * Whether the component should be rendered
 */
public function shouldRender(): bool
{
    return Str::length($this->message) > 0;
}
```

#### Index Components

Sometimes components are part of a component group and you may wish to group the related components within a single directory. For example, imagine a "card" component with the following class structure:

```text
App\View\Components\Card\Card
App\View\Components\Card\Header
App\View\Components\Card\Body
```

Since the root `Card` component is nested within a `Card` directory, you might expect that you would need to render the component via `<x-card.card>`. However, when a component's file name matches the name of the component's directory, Laravel automatically assumes that component is the "root" component and allows you to render the component without repeating the directory name:

```blade
<x-card>
    <x-card.header>...</x-card.header>
    <x-card.body>...</x-card.body>
</x-card>
```

#### Passing Data to Components

You may pass data to Blade components using HTML attributes. Hard-coded, primitive values may be passed to the component using simple HTML attribute strings. PHP expressions and variables should be passed to the component via attributes that use the `:` character as a prefix:

```blade
<x-alert type="error" :message="$message"/>
```

You should define all of the component's data attributes in its class constructor. All public properties on a component will automatically be made available to the component's view. It is not necessary to pass the data to the view from the component's `render` method:

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;
use Illuminate\View\View;

class Alert extends Component
{
    /**
     * Create the component instance.
     */
    public function __construct(
        public string $type,
        public string $message,
    ) {}

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View
    {
        return view('components.alert');
    }
}
```

When your component is rendered, you may display the contents of your component's public variables by echoing the variables by name:

```blade
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

##### Casing

Component constructor arguments should be specified using `camelCase`, while `kebab-case` should be used when referencing the argument names in your HTML attributes. For example, given the following component constructor:

```php
/**
 * Create the component instance.
 */
public function __construct(
    public string $alertType,
) {}
```

The `$alertType` argument may be provided to the component like so:

```blade
<x-alert alert-type="danger" />
```

##### Short Attribute Syntax

When passing attributes to components, you may also use a "short attribute" syntax. This is often convenient since attribute names frequently match the variable names they correspond to:

```blade
{{-- Short attribute syntax... --}}
<x-profile :$userId :$name />

{{-- Is equivalent to... --}}
<x-profile :user-id="$userId" :name="$name" />
```

##### Escaping Attribute Rendering

Since some JavaScript frameworks such as Alpine.js also use colon-prefixed attributes, you may use a double colon (`::`) prefix to inform Blade that the attribute is not a PHP expression. For example, given the following component:

```blade
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

The following HTML will be rendered by Blade:

```blade
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

##### Component Methods

In addition to public variables being available to your component template, any public methods on the component may be invoked. For example, imagine a component that has an `isSelected` method:

```php
/**
 * Determine if the given option is the currently selected option.
 */
public function isSelected(string $option): bool
{
    return $option === $this->selected;
}
```

You may execute this method from your component template by invoking the variable matching the name of the method:

```blade
<option {{ $isSelected($value) ? 'selected' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

##### Accessing Attributes and Slots Within Component Classes

Blade components also allow you to access the component name, attributes, and slot inside the class's render method. However, in order to access this data, you should return a closure from your component's `render` method:

```php
use Closure;

/**
 * Get the view / contents that represent the component.
 */
public function render(): Closure
{
    return function () {
        return '<div {{ $attributes }}>Components content</div>';
    };
}
```

The closure returned by your component's `render` method may also receive a `$data` array as its only argument. This array will contain several elements that provide information about the component:

```php
return function (array $data) {
    // $data['componentName'];
    // $data['attributes'];
    // $data['slot'];

    return '<div {{ $attributes }}>Components content</div>';
};
```

> **Warning:**
> The elements in the `$data` array should never be directly embedded into the Blade string returned by your `render` method, as doing so could allow remote code execution via malicious attribute content.

The `componentName` is equal to the name used in the HTML tag after the `x-` prefix. So `<x-alert />`'s `componentName` will be `alert`. The `attributes` element will contain all of the attributes that were present on the HTML tag. The `slot` element is an `Illuminate\View\ComponentSlot` instance with the contents of the component's slot.

The closure should return a string. If the returned string corresponds to an existing view, that view will be rendered; otherwise, the returned string will be evaluated as an inline Blade view.

##### Additional Dependencies

If your component requires dependencies from Laravel's [service container](https://laravel.com/docs/container), you may list them before any of the component's data attributes and they will automatically be injected by the container:

```php
use App\Services\AlertCreator;

/**
 * Create the component instance.
 */
public function __construct(
    public AlertCreator $creator,
    public string $type,
    public string $message,
) {}
```

##### Hiding Attributes / Methods

If you would like to prevent some public methods or properties from being exposed as variables to your component template, you may add them to an `$except` array property on your component:

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * The properties / methods that should not be exposed to the component template.
     *
     * @var array
     */
    protected $except = ['type'];

    /**
     * Create the component instance.
     */
    public function __construct(
        public string $type,
    ) {}
}
```

#### Component Attributes

We've already examined how to pass data attributes to a component; however, sometimes you may need to specify additional HTML attributes, such as `class`, that are not part of the data required for a component to function. Typically, you want to pass these additional attributes down to the root element of the component template. For example, imagine we want to render an `alert` component like so:

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```

All of the attributes that are not part of the component's constructor will automatically be added to the component's "attribute bag". This attribute bag is automatically made available to the component via the `$attributes` variable. All of the attributes may be rendered within the component by echoing this variable:

```blade
<div {{ $attributes }}>
    <!-- Component content -->
</div>
```

> **Warning:**
> Using directives such as `@env` within component tags is not supported at this time. For example, `<x-alert :live="@env('production')"/>` will not be compiled.

##### Default / Merged Attributes

Sometimes you may need to specify default values for attributes or merge additional values into some of the component's attributes. To accomplish this, you may use the attribute bag's `merge` method. This method is particularly useful for defining a set of default CSS classes that should always be applied to a component:

```blade
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

If we assume this component is utilized like so:

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

The final, rendered HTML of the component will appear like the following:

```blade
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

##### Conditionally Merge Classes

Sometimes you may wish to merge classes if a given condition is `true`. You can accomplish this via the `class` method, which accepts an array of classes where the array key contains the class or classes you wish to add, while the value is a boolean expression. If the array element has a numeric key, it will always be included in the rendered class list:

```blade
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

If you need to merge other attributes onto your component, you can chain the `merge` method onto the `class` method:

```blade
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

> **Note:**
> If you need to conditionally compile classes on other HTML elements that shouldn't receive merged attributes, you can use the [@class directive](#conditional-classes).

##### Non-Class Attribute Merging

When merging attributes that are not `class` attributes, the values provided to the `merge` method will be considered the "default" values of the attribute. However, unlike the `class` attribute, these attributes will not be merged with injected attribute values. Instead, they will be overwritten. For example, a `button` component's implementation may look like the following:

```blade
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

To render the button component with a custom `type`, it may be specified when consuming the component. If no type is specified, the `button` type will be used:

```blade
<x-button type="submit">
    Submit
</x-button>
```

The rendered HTML of the `button` component in this example would be:

```blade
<button type="submit">
    Submit
</button>
```

If you would like an attribute other than `class` to have its default value and injected values joined together, you may use the `prepends` method. In this example, the `data-controller` attribute will always begin with `profile-controller` and any additional injected `data-controller` values will be placed after this default value:

```blade
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

##### Retrieving and Filtering Attributes

You may filter attributes using the `filter` method. This method accepts a closure which should return `true` if you wish to retain the attribute in the attribute bag:

```blade
{{ $attributes->filter(fn (string $value, string $key) => $key == 'foo') }}
```

For convenience, you may use the `whereStartsWith` method to retrieve all attributes whose keys begin with a given string:

```blade
{{ $attributes->whereStartsWith('wire:model') }}
```

Conversely, the `whereDoesntStartWith` method may be used to exclude all attributes whose keys begin with a given string:

```blade
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

Using the `first` method, you may render the first attribute in a given attribute bag:

```blade
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

If you would like to check if an attribute is present on the component, you may use the `has` method. This method accepts the attribute name as its only argument and returns a boolean indicating whether or not the attribute is present:

```blade
@if ($attributes->has('class'))
    <div>Class attribute is present</div>
@endif
```

If an array is passed to the `has` method, the method will determine if all of the given attributes are present on the component:

```blade
@if ($attributes->has(['name', 'class']))
    <div>All of the attributes are present</div>
@endif
```

The `hasAny` method may be used to determine if any of the given attributes are present on the component:

```blade
@if ($attributes->hasAny(['href', ':href', 'v-bind:href']))
    <div>One of the attributes is present</div>
@endif
```

You may retrieve a specific attribute's value using the `get` method:

```blade
{{ $attributes->get('class') }}
```

The `only` method may be used to retrieve only the attributes with the given keys:

```blade
{{ $attributes->only(['class']) }}
```

The `except` method may be used to retrieve all attributes except those with the given keys:

```blade
{{ $attributes->except(['class']) }}
```

#### Reserved Keywords

By default, some keywords are reserved for Blade's internal use in order to render components. The following keywords cannot be defined as public properties or method names within your components:

<div class="content-list" markdown="1">

- `data`
- `render`
- `resolve`
- `resolveView`
- `shouldRender`
- `view`
- `withAttributes`
- `withName`

</div>

#### Slots

You will often need to pass additional content to your component via "slots". Component slots are rendered by echoing the `$slot` variable. To explore this concept, let's imagine that an `alert` component has the following markup:

```blade
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

We may pass content to the `slot` by injecting content into the component:

```blade
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

Sometimes a component may need to render multiple different slots in different locations within the component. Let's modify our alert component to allow for the injection of a "title" slot:

```blade
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

You may define the content of the named slot using the `x-slot` tag. Any content not within an explicit `x-slot` tag will be passed to the component in the `$slot` variable:

```xml
<x-alert>
    <x-slot:title>
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

You may invoke a slot's `isEmpty` method to determine if the slot contains content:

```blade
<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    @if ($slot->isEmpty())
        This is default content if the slot is empty.
    @else
        {{ $slot }}
    @endif
</div>
```

Additionally, the `hasActualContent` method may be used to determine if the slot contains any "actual" content that is not an HTML comment:

```blade
@if ($slot->hasActualContent())
    The scope has non-comment content.
@endif
```

##### Scoped Slots

If you have used a JavaScript framework such as Vue, you may be familiar with "scoped slots", which allow you to access data or methods from the component within your slot. You may achieve similar behavior in Laravel by defining public methods or properties on your component and accessing the component within your slot via the `$component` variable. In this example, we will assume that the `x-alert` component has a public `formatAlert` method defined on its component class:

```blade
<x-alert>
    <x-slot:title>
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

##### Slot Attributes

Like Blade components, you may assign additional [attributes](#component-attributes) to slots such as CSS class names:

```xml
<x-card class="shadow-sm">
    <x-slot:heading class="font-bold">
        Heading
    </x-slot>

    Content

    <x-slot:footer class="text-sm">
        Footer
    </x-slot>
</x-card>
```

To interact with slot attributes, you may access the `attributes` property of the slot's variable. For more information on how to interact with attributes, please consult the documentation on [component attributes](#component-attributes):

```blade
@props([
    'heading',
    'footer',
])

<div {{ $attributes->class(['border']) }}>
    <h1 {{ $heading->attributes->class(['text-lg']) }}>
        {{ $heading }}
    </h1>

    {{ $slot }}

    <footer {{ $footer->attributes->class(['text-gray-700']) }}>
        {{ $footer }}
    </footer>
</div>
```

#### Inline Component Views

For very small components, it may feel cumbersome to manage both the component class and the component's view template. For this reason, you may return the component's markup directly from the `render` method:

```php
/**
 * Get the view / contents that represent the component.
 */
public function render(): string
{
    return <<<'blade'
        <div class="alert alert-danger">
            {{ $slot }}
        </div>
    blade;
}
```

##### Generating Inline View Components

To create a component that renders an inline view, you may use the `inline` option when executing the `make:component` command:

```shell
php artisan make:component Alert --inline
```

#### Dynamic Components

Sometimes you may need to render a component but not know which component should be rendered until runtime. In this situation, you may use Laravel's built-in `dynamic-component` component to render the component based on a runtime value or variable:

```blade
// $componentName = "secondary-button";

<x-dynamic-component :component="$componentName" class="mt-4" />
```

#### Manually Registering Components

> **Warning:**
> The following documentation on manually registering components is primarily applicable to those who are writing Laravel packages that include view components. If you are not writing a package, this portion of the component documentation may not be relevant to you.

When writing components for your own application, components are automatically discovered within the `app/View/Components` directory and `resources/views/components` directory.

However, if you are building a package that utilizes Blade components or placing components in non-conventional directories, you will need to manually register your component class and its HTML tag alias so that Laravel knows where to find the component. You should typically register your components in the `boot` method of your package's service provider:

```php
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::component('package-alert', AlertComponent::class);
}
```

Once your component has been registered, it may be rendered using its tag alias:

```blade
<x-package-alert/>
```

##### Autoloading Package Components

Alternatively, you may use the `componentNamespace` method to autoload component classes by convention. For example, a `Nightshade` package might have `Calendar` and `ColorPicker` components that reside within the `Nightshade\Views\Components` namespace:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

This will allow the usage of package components by their vendor namespace using the `package-name::` syntax:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade will automatically detect the class that's linked to this component by pascal-casing the component name. Subdirectories are also supported using "dot" notation.

### Anonymous Components

Similar to inline components, anonymous components provide a mechanism for managing a component via a single file. However, anonymous components utilize a single view file and have no associated class. To define an anonymous component, you only need to place a Blade template within your `resources/views/components` directory. For example, assuming you have defined a component at `resources/views/components/alert.blade.php`, you may simply render it like so:

```blade
<x-alert/>
```

You may use the `.` character to indicate if a component is nested deeper inside the `components` directory. For example, assuming the component is defined at `resources/views/components/inputs/button.blade.php`, you may render it like so:

```blade
<x-inputs.button/>
```

To create an anonymous component via Artisan, you may use the `--view` flag when invoking the `make:component` command:

```shell
php artisan make:component forms.input --view
```

The command above will create a Blade file at `resources/views/components/forms/input.blade.php` which can be rendered as a component via `<x-forms.input />`.

#### Anonymous Index Components

Sometimes, when a component is made up of many Blade templates, you may wish to group the given component's templates within a single directory. For example, imagine an "accordion" component with the following directory structure:

```text
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

This directory structure allows you to render the accordion component and its item like so:

```blade
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

However, in order to render the accordion component via `x-accordion`, we were forced to place the "index" accordion component template in the `resources/views/components` directory instead of nesting it within the `accordion` directory with the other accordion related templates.

Thankfully, Blade allows you to place a file matching the component's directory name within the component's directory itself. When this template exists, it can be rendered as the "root" element of the component even though it is nested within a directory. So, we can continue to use the same Blade syntax given in the example above; however, we will adjust our directory structure like so:

```text
/resources/views/components/accordion/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

#### Data Properties / Attributes

Since anonymous components do not have any associated class, you may wonder how you may differentiate which data should be passed to the component as variables and which attributes should be placed in the component's [attribute bag](#component-attributes).

You may specify which attributes should be considered data variables using the `@props` directive at the top of your component's Blade template. All other attributes on the component will be available via the component's attribute bag. If you wish to give a data variable a default value, you may specify the variable's name as the array key and the default value as the array value:

```blade
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

Given the component definition above, we may render the component like so:

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

#### Accessing Parent Data

Sometimes you may want to access data from a parent component inside a child component. In these cases, you may use the `@aware` directive. For example, imagine we are building a complex menu component consisting of a parent `<x-menu>` and child `<x-menu.item>`:

```blade
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

The `<x-menu>` component may have an implementation like the following:

```blade
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

Because the `color` prop was only passed into the parent (`<x-menu>`), it won't be available inside `<x-menu.item>`. However, if we use the `@aware` directive, we can make it available inside `<x-menu.item>` as well:

```blade
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

> **Warning:**
> The `@aware` directive cannot access parent data that is not explicitly passed to the parent component via HTML attributes. Default `@props` values that are not explicitly passed to the parent component cannot be accessed by the `@aware` directive.

#### Anonymous Component Paths

As previously discussed, anonymous components are typically defined by placing a Blade template within your `resources/views/components` directory. However, you may occasionally want to register other anonymous component paths with Laravel in addition to the default path.

The `anonymousComponentPath` method accepts the "path" to the anonymous component location as its first argument and an optional "namespace" that components should be placed under as its second argument. Typically, this method should be called from the `boot` method of one of your application's [service providers](https://laravel.com/docs/providers):

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Blade::anonymousComponentPath(__DIR__.'/../components');
}
```

When component paths are registered without a specified prefix as in the example above, they may be rendered in your Blade components without a corresponding prefix as well. For example, if a `panel.blade.php` component exists in the path registered above, it may be rendered like so:

```blade
<x-panel />
```

Prefix "namespaces" may be provided as the second argument to the `anonymousComponentPath` method:

```php
Blade::anonymousComponentPath(__DIR__.'/../components', 'dashboard');
```

When a prefix is provided, components within that "namespace" may be rendered by prefixing the component's namespace to the component name when the component is rendered:

```blade
<x-dashboard::panel />
```

### Building Layouts

#### Layouts Using Components

Most web applications maintain the same general layout across various pages. It would be incredibly cumbersome and hard to maintain our application if we had to repeat the entire layout HTML in every view we create. Thankfully, it's convenient to define this layout as a single [Blade component](#components) and then use it throughout our application.

##### Defining the Layout Component

For example, imagine we are building a "todo" list application. We might define a `layout` component that looks like the following:

```blade
<!-- resources/views/components/layout.blade.php -->

<html>
    <head>
        <title>{{ $title ?? 'Todo Manager' }}</title>
    </head>
    <body>
        <h1>Todos</h1>
        <hr/>
        {{ $slot }}
    </body>
</html>
```

##### Applying the Layout Component

Once the `layout` component has been defined, we may create a Blade view that utilizes the component. In this example, we will define a simple view that displays our task list:

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        <div>{{ $task }}</div>
    @endforeach
</x-layout>
```

Remember, content that is injected into a component will be supplied to the default `$slot` variable within our `layout` component. As you may have noticed, our `layout` also respects a `$title` slot if one is provided; otherwise, a default title is shown. We may inject a custom title from our task list view using the standard slot syntax discussed in the [component documentation](#components):

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    <x-slot:title>
        Custom Title
    </x-slot>

    @foreach ($tasks as $task)
        <div>{{ $task }}</div>
    @endforeach
</x-layout>
```

Now that we have defined our layout and task list views, we just need to return the `task` view from a route:

```php
use App\Models\Task;

Route::get('/tasks', function () {
    return view('tasks', ['tasks' => Task::all()]);
});
```

#### Layouts Using Template Inheritance

##### Defining a Layout

Layouts may also be created via "template inheritance". This was the primary way of building applications prior to the introduction of [components](#components).

To get started, let's take a look at a simple example. First, we will examine a page layout. Since most web applications maintain the same general layout across various pages, it's convenient to define this layout as a single Blade view:

```blade
<!-- resources/views/layouts/app.blade.php -->

<html>
    <head>
        <title>App Name - @yield('title')</title>
    </head>
    <body>
        @section('sidebar')
            This is the master sidebar.
        @show

        <div class="container">
            @yield('content')
        </div>
    </body>
</html>
```

As you can see, this file contains typical HTML mark-up. However, take note of the `@section` and `@yield` directives. The `@section` directive, as the name implies, defines a section of content, while the `@yield` directive is used to display the contents of a given section.

Now that we have defined a layout for our application, let's define a child page that inherits the layout.

##### Extending a Layout

When defining a child view, use the `@extends` Blade directive to specify which layout the child view should "inherit". Views which extend a Blade layout may inject content into the layout's sections using `@section` directives. Remember, as seen in the example above, the contents of these sections will be displayed in the layout using `@yield`:

```blade
<!-- resources/views/child.blade.php -->

@extends('layouts.app')

@section('title', 'Page Title')

@section('sidebar')
    @@parent

    <p>This is appended to the master sidebar.</p>
@endsection

@section('content')
    <p>This is my body content.</p>
@endsection
```

In this example, the `sidebar` section is utilizing the `@@parent` directive to append (rather than overwriting) content to the layout's sidebar. The `@@parent` directive will be replaced by the content of the layout when the view is rendered.

> **Note:**
> Contrary to the previous example, this `sidebar` section ends with `@endsection` instead of `@show`. The `@endsection` directive will only define a section while `@show` will define and **immediately yield** the section.

The `@yield` directive also accepts a default value as its second parameter. This value will be rendered if the section being yielded is undefined:

```blade
@yield('content', 'Default content')
```

### Forms

#### CSRF Field

Anytime you define an HTML form in your application, you should include a hidden CSRF token field in the form so that [the CSRF protection](https://laravel.com/docs/csrf) middleware can validate the request. You may use the `@csrf` Blade directive to generate the token field:

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

#### Method Field

Since HTML forms can't make `PUT`, `PATCH`, or `DELETE` requests, you will need to add a hidden `_method` field to spoof these HTTP verbs. The `@method` Blade directive can create this field for you:

```blade
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

#### Validation Errors

The `@error` directive may be used to quickly check if [validation error messages](https://laravel.com/docs/validation#quick-displaying-the-validation-errors) exist for a given attribute. Within an `@error` directive, you may echo the `$message` variable to display the error message:

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input
    id="title"
    type="text"
    class="@error('title') is-invalid @enderror"
/>

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

Since the `@error` directive compiles to an "if" statement, you may use the `@else` directive to render content when there is not an error for an attribute:

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email') is-invalid @else is-valid @enderror"
/>
```

You may pass [the name of a specific error bag](https://laravel.com/docs/validation#named-error-bags) as the second parameter to the `@error` directive to retrieve validation error messages on pages containing multiple forms:

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email', 'login') is-invalid @enderror"
/>

@error('email', 'login')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

### Stacks

Blade allows you to push to named stacks which can be rendered somewhere else in another view or layout. This can be particularly useful for specifying any JavaScript libraries required by your child views:

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

If you would like to `@push` content if a given boolean expression evaluates to `true`, you may use the `@pushIf` directive:

```blade
@pushIf($shouldPush, 'scripts')
    <script src="/example.js"></script>
@endPushIf
```

You may push to a stack as many times as needed. To render the complete stack contents, pass the name of the stack to the `@stack` directive:

```blade
<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
```

If you would like to prepend content onto the beginning of a stack, you should use the `@prepend` directive:

```blade
@push('scripts')
    This will be second...
@endpush

// Later...

@prepend('scripts')
    This will be first...
@endprepend
```

The `@hasstack` directive may be used to determine if a stack is empty:

```blade
@hasstack('list')
    <ul>
        @stack('list')
    </ul>
@endif
```

### Service Injection

The `@inject` directive may be used to retrieve a service from the Laravel [service container](https://laravel.com/docs/container). The first argument passed to `@inject` is the name of the variable the service will be placed into, while the second argument is the class or interface name of the service you wish to resolve:

```blade
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

### Rendering Inline Blade Templates

Sometimes you may need to transform a raw Blade template string into valid HTML. You may accomplish this using the `render` method provided by the `Blade` facade. The `render` method accepts the Blade template string and an optional array of data to provide to the template:

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

Laravel renders inline Blade templates by writing them to the `storage/framework/views` directory. If you would like Laravel to remove these temporary files after rendering the Blade template, you may provide the `deleteCachedView` argument to the method:

```php
return Blade::render(
    'Hello, {{ $name }}',
    ['name' => 'Julian Bashir'],
    deleteCachedView: true
);
```

### Rendering Blade Fragments

When using frontend frameworks such as [Turbo](https://turbo.hotwired.dev/) and [htmx](https://htmx.org/), you may occasionally need to only return a portion of a Blade template within your HTTP response. Blade "fragments" allow you to do just that. To get started, place a portion of your Blade template within `@fragment` and `@endfragment` directives:

```blade
@fragment('user-list')
    <ul>
        @foreach ($users as $user)
            <li>{{ $user->name }}</li>
        @endforeach
    </ul>
@endfragment
```

Then, when rendering the view that utilizes this template, you may invoke the `fragment` method to specify that only the specified fragment should be included in the outgoing HTTP response:

```php
return view('dashboard', ['users' => $users])->fragment('user-list');
```

The `fragmentIf` method allows you to conditionally return a fragment of a view based on a given condition. Otherwise, the entire view will be returned:

```php
return view('dashboard', ['users' => $users])
    ->fragmentIf($request->hasHeader('HX-Request'), 'user-list');
```

The `fragments` and `fragmentsIf` methods allow you to return multiple view fragments in the response. The fragments will be concatenated together:

```php
view('dashboard', ['users' => $users])
    ->fragments(['user-list', 'comment-list']);

view('dashboard', ['users' => $users])
    ->fragmentsIf(
        $request->hasHeader('HX-Request'),
        ['user-list', 'comment-list']
    );
```

### Extending Blade

Blade allows you to define your own custom directives using the `directive` method. When the Blade compiler encounters the custom directive, it will call the provided callback with the expression that the directive contains.

The following example creates a `@datetime($var)` directive which formats a given `$var`, which should be an instance of `DateTime`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::directive('datetime', function (string $expression) {
            return "<?php echo ($expression)->format('m/d/Y H:i'); ?>";
        });
    }
}
```

As you can see, we will chain the `format` method onto whatever expression is passed into the directive. So, in this example, the final PHP generated by this directive will be:

```php
<?php echo ($var)->format('m/d/Y H:i'); ?>
```

> **Warning:**
> After updating the logic of a Blade directive, you will need to delete all of the cached Blade views. The cached Blade views may be removed using the `view:clear` Artisan command.

#### Custom Echo Handlers

If you attempt to "echo" an object using Blade, the object's `__toString` method will be invoked. The [__toString](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) method is one of PHP's built-in "magic methods". However, sometimes you may not have control over the `__toString` method of a given class, such as when the class that you are interacting with belongs to a third-party library.

In these cases, Blade allows you to register a custom echo handler for that particular type of object. To accomplish this, you should invoke Blade's `stringable` method. The `stringable` method accepts a closure. This closure should type-hint the type of object that it is responsible for rendering. Typically, the `stringable` method should be invoked within the `boot` method of your application's `AppServiceProvider` class:

```php
use Illuminate\Support\Facades\Blade;
use Money\Money;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Blade::stringable(function (Money $money) {
        return $money->formatTo('en_GB');
    });
}
```

Once your custom echo handler has been defined, you may simply echo the object in your Blade template:

```blade
Cost: {{ $money }}
```

#### Custom If Statements

Programming a custom directive is sometimes more complex than necessary when defining simple, custom conditional statements. For that reason, Blade provides a `Blade::if` method which allows you to quickly define custom conditional directives using closures. For example, let's define a custom conditional that checks the configured default "disk" for the application. We may do this in the `boot` method of our `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Blade::if('disk', function (string $value) {
        return config('filesystems.default') === $value;
    });
}
```

Once the custom conditional has been defined, you can use it within your templates:

```blade
@disk('local')
    <!-- The application is using the local disk... -->
@elsedisk('s3')
    <!-- The application is using the s3 disk... -->
@else
    <!-- The application is using some other disk... -->
@enddisk

@unlessdisk('local')
    <!-- The application is not using the local disk... -->
@enddisk
```

## Validation

> **Source:** [Validation](https://laravel.com/docs/validation) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

Laravel provides several different approaches to validate your application's incoming data. It is most common to use the `validate` method available on all incoming HTTP requests. However, we will discuss other approaches to validation as well.

Laravel includes a wide variety of convenient validation rules that you may apply to data, even providing the ability to validate if values are unique in a given database table. We'll cover each of these validation rules in detail so that you are familiar with all of Laravel's validation features.

### Validation Quickstart

To learn about Laravel's powerful validation features, let's look at a complete example of validating a form and displaying the error messages back to the user. By reading this high-level overview, you'll be able to gain a good general understanding of how to validate incoming request data using Laravel:

#### Defining the Routes

First, let's assume we have the following routes defined in our `routes/web.php` file:

```php
use App\Http\Controllers\PostController;

Route::get('/post/create', [PostController::class, 'create']);
Route::post('/post', [PostController::class, 'store']);
```

The `GET` route will display a form for the user to create a new blog post, while the `POST` route will store the new blog post in the database.

#### Creating the Controller

Next, let's take a look at a simple controller that handles incoming requests to these routes. We'll leave the `store` method empty for now:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PostController extends Controller
{
    /**
     * Show the form to create a new blog post.
     */
    public function create(): View
    {
        return view('post.create');
    }

    /**
     * Store a new blog post.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate and store the blog post...

        $post = /** ... */

        return to_route('post.show', ['post' => $post->id]);
    }
}
```

#### Writing the Validation Logic

Now we are ready to fill in our `store` method with the logic to validate the new blog post. To do this, we will use the `validate` method provided by the `Illuminate\Http\Request` object. If the validation rules pass, your code will keep executing normally; however, if validation fails, an `Illuminate\Validation\ValidationException` exception will be thrown and the proper error response will automatically be sent back to the user.

If validation fails during a traditional HTTP request, a redirect response to the previous URL will be generated. If the incoming request is an XHR request, a [JSON response containing the validation error messages](#validation-error-response-format) will be returned.

To get a better understanding of the `validate` method, let's jump back into the `store` method:

```php
/**
 * Store a new blog post.
 */
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'title' => ['required', 'unique:posts', 'max:255'],
        'body' => ['required'],
    ]);

    // The blog post is valid...

    return redirect('/posts');
}
```

As you can see, the validation rules are passed into the `validate` method. Don't worry - all available validation rules are [documented](#available-validation-rules). Again, if the validation fails, the proper response will automatically be generated. If the validation passes, our controller will continue executing normally.

In addition, you may use the `validateWithBag` method to validate a request and store any error messages within a [named error bag](#named-error-bags):

```php
$validated = $request->validateWithBag('post', [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

##### Stopping on First Validation Failure

Sometimes you may wish to stop running validation rules on an attribute after the first validation failure. To do so, assign the `bail` rule to the attribute:

```php
$request->validate([
    'title' => ['bail', 'required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

In this example, if the `unique` rule on the `title` attribute fails, the `max` rule will not be checked. Rules will be validated in the order they are assigned.

##### A Note on Nested Attributes

If the incoming HTTP request contains "nested" field data, you may specify these fields in your validation rules using "dot" syntax:

```php
$request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'author.name' => ['required'],
    'author.description' => ['required'],
]);
```

On the other hand, if your field name contains a literal period, you can explicitly prevent this from being interpreted as "dot" syntax by escaping the period with a backslash:

```php
$request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'v1\.0' => ['required'],
]);
```

#### Displaying the Validation Errors

So, what if the incoming request fields do not pass the given validation rules? As mentioned previously, Laravel will automatically redirect the user back to their previous location. In addition, all of the validation errors and [request input](https://laravel.com/docs/requests#retrieving-old-input) will automatically be [flashed to the session](https://laravel.com/docs/session#flash-data).

An `$errors` variable is shared with all of your application's views by the `Illuminate\View\Middleware\ShareErrorsFromSession` middleware, which is provided by the `web` middleware group. When this middleware is applied an `$errors` variable will always be available in your views, allowing you to conveniently assume the `$errors` variable is always defined and can be safely used. The `$errors` variable will be an instance of `Illuminate\Support\MessageBag`. For more information on working with this object, [check out its documentation](#working-with-error-messages).

So, in our example, the user will be redirected to our controller's `create` method when validation fails, allowing us to display the error messages in the view:

```blade
<!-- /resources/views/post/create.blade.php -->

<h1>Create Post</h1>

@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<!-- Create Post Form -->
```

##### Customizing the Error Messages

Laravel's built-in validation rules each have an error message that is located in your application's `lang/en/validation.php` file. If your application does not have a `lang` directory, you may instruct Laravel to create it using the `lang:publish` Artisan command.

Within the `lang/en/validation.php` file, you will find a translation entry for each validation rule. You are free to change or modify these messages based on the needs of your application.

In addition, you may copy this file to another language directory to translate the messages for your application's language. To learn more about Laravel localization, check out the complete [localization documentation](https://laravel.com/docs/localization).

> **Warning:**
> By default, the Laravel application skeleton does not include the `lang` directory. If you would like to customize Laravel's language files, you may publish them via the `lang:publish` Artisan command.

##### XHR Requests and Validation

In this example, we used a traditional form to send data to the application. However, many applications receive XHR requests from a JavaScript powered frontend. When using the `validate` method during an XHR request, Laravel will not generate a redirect response. Instead, Laravel generates a [JSON response containing all of the validation errors](#validation-error-response-format). This JSON response will be sent with a 422 HTTP status code.

##### The `@error` Directive

You may use the `@error` [Blade](https://laravel.com/docs/blade) directive to quickly determine if validation error messages exist for a given attribute. Within an `@error` directive, you may echo the `$message` variable to display the error message:

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input
    id="title"
    type="text"
    name="title"
    class="@error('title') is-invalid @enderror"
/>

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

If you are using [named error bags](#named-error-bags), you may pass the name of the error bag as the second argument to the `@error` directive:

```blade
<input ... class="@error('title', 'post') is-invalid @enderror">
```

#### Repopulating Forms

When Laravel generates a redirect response due to a validation error, the framework will automatically [flash all of the request's input to the session](https://laravel.com/docs/session#flash-data). This is done so that you may conveniently access the input during the next request and repopulate the form that the user attempted to submit.

To retrieve flashed input from the previous request, invoke the `old` method on an instance of `Illuminate\Http\Request`. The `old` method will pull the previously flashed input data from the [session](https://laravel.com/docs/session):

```php
$title = $request->old('title');
```

Laravel also provides a global `old` helper. If you are displaying old input within a [Blade template](https://laravel.com/docs/blade), it is more convenient to use the `old` helper to repopulate the form. If no old input exists for the given field, `null` will be returned:

```blade
<input type="text" name="title" value="{{ old('title') }}">
```

#### A Note on Optional Fields

By default, Laravel includes the `TrimStrings` and `ConvertEmptyStringsToNull` middleware in your application's global middleware stack. Because of this, you will often need to mark your "optional" request fields as `nullable` if you do not want the validator to consider `null` values as invalid. For example:

```php
$request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
    'publish_at' => ['nullable', 'date'],
]);
```

In this example, we are specifying that the `publish_at` field may be either `null` or a valid date representation. If the `nullable` modifier is not added to the rule definition, the validator would consider `null` an invalid date.

#### Validation Error Response Format

When your application throws a `Illuminate\Validation\ValidationException` exception and the incoming HTTP request is expecting a JSON response, Laravel will automatically format the error messages for you and return a `422 Unprocessable Entity` HTTP response.

Below, you can review an example of the JSON response format for validation errors. Note that nested error keys are flattened into "dot" notation format:

```json
{
    "message": "The team name field must be a string. (and 4 more errors)",
    "errors": {
        "team_name": [
            "The team name field must be a string.",
            "The team name field must be at least 1 characters."
        ],
        "authorization.role": [
            "The selected authorization.role is invalid."
        ],
        "users.0.email": [
            "The users.0.email field is required."
        ],
        "users.2.email": [
            "The users.2.email field must be a valid email address."
        ]
    }
}
```

### Form Request Validation

#### Creating Form Requests

For more complex validation scenarios, you may wish to create a "form request". Form requests are custom request classes that encapsulate their own validation and authorization logic. To create a form request class, you may use the `make:request` Artisan CLI command:

```shell
php artisan make:request StorePostRequest
```

The generated form request class will be placed in the `app/Http/Requests` directory. If this directory does not exist, it will be created when you run the `make:request` command. Each form request generated by Laravel has two methods: `authorize` and `rules`.

As you might have guessed, the `authorize` method is responsible for determining if the currently authenticated user can perform the action represented by the request, while the `rules` method returns the validation rules that should apply to the request's data:

```php
/**
 * Get the validation rules that apply to the request.
 *
 * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
 */
public function rules(): array
{
    return [
        'title' => ['required', 'unique:posts', 'max:255'],
        'body' => ['required'],
    ];
}
```

> **Note:**
> You may type-hint any dependencies you require within the `rules` method's signature. They will automatically be resolved via the Laravel [service container](https://laravel.com/docs/container).

So, how are the validation rules evaluated? All you need to do is type-hint the request on your controller method. The incoming form request is validated before the controller method is called, meaning you do not need to clutter your controller with any validation logic:

```php
/**
 * Store a new blog post.
 */
public function store(StorePostRequest $request): RedirectResponse
{
    // The incoming request is valid...

    // Retrieve the validated input data...
    $validated = $request->validated();

    // Retrieve a portion of the validated input data...
    $validated = $request->safe()->only(['name', 'email']);
    $validated = $request->safe()->except(['name', 'email']);

    // Store the blog post...

    return redirect('/posts');
}
```

If validation fails, a redirect response will be generated to send the user back to their previous location. The errors will also be flashed to the session so they are available for display. If the request was an XHR request, an HTTP response with a 422 status code will be returned to the user including a [JSON representation of the validation errors](#validation-error-response-format).

> **Note:**
> Need to add real-time form request validation to your Inertia powered Laravel frontend? Check out [Laravel Precognition](https://laravel.com/docs/precognition).

##### Performing Additional Validation

Sometimes you need to perform additional validation after your initial validation is complete. You can accomplish this using the form request's `after` method.

The `after` method should return an array of callables or closures which will be invoked after validation is complete. The given callables will receive an `Illuminate\Validation\Validator` instance, allowing you to raise additional error messages if necessary:

```php
use Illuminate\Validation\Validator;

/**
 * Get the "after" validation callables for the request.
 */
public function after(): array
{
    return [
        function (Validator $validator) {
            if ($this->somethingElseIsInvalid()) {
                $validator->errors()->add(
                    'field',
                    'Something is wrong with this field!'
                );
            }
        }
    ];
}
```

As noted, the array returned by the `after` method may also contain invokable classes. The `__invoke` method of these classes will receive an `Illuminate\Validation\Validator` instance:

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;
use Illuminate\Validation\Validator;

/**
 * Get the "after" validation callables for the request.
 */
public function after(): array
{
    return [
        new ValidateUserStatus,
        new ValidateShippingTime,
        function (Validator $validator) {
            //
        }
    ];
}
```

##### Stopping on the First Validation Failure

By adding the `StopOnFirstFailure` attribute to your request class, you may inform the validator that it should stop validating all attributes once a single validation failure has occurred:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\StopOnFirstFailure;
use Illuminate\Foundation\Http\FormRequest;

#[StopOnFirstFailure]
class StorePostRequest extends FormRequest
{
    // ...
}
```

##### Failing on Unknown Fields

By adding the `FailOnUnknownFields` attribute to your request class, you may instruct Laravel to reject any incoming fields that are not defined by your request's validation rules:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\FailOnUnknownFields;
use Illuminate\Foundation\Http\FormRequest;

#[FailOnUnknownFields]
class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string'],
            'body' => ['required', 'string'],
        ];
    }
}
```

You may also enable this behavior globally for all form requests from your `AppServiceProvider`:

```php
use Illuminate\Foundation\Http\FormRequest;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    FormRequest::failOnUnknownFields();
}
```

If needed, you may disable this behavior for a specific request by passing `false` to the attribute:

```php
#[FailOnUnknownFields(false)]
class PublicWebhookRequest extends FormRequest
{
    // ...
}
```

Rejecting unknown fields can provide additional protection against mass-assignment style issues by preventing unexpected input keys from flowing deeper into your application. However, you should still configure your model's `$fillable` / `$guarded` properties and only persist trusted, validated input.

##### Customizing the Redirect Location

When form request validation fails, a redirect response will be generated to send the user back to their previous location. However, you are free to customize this behavior. To do so, you may use the `RedirectTo` attribute on your form request:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\RedirectTo;
use Illuminate\Foundation\Http\FormRequest;

#[RedirectTo('/dashboard')]
class StorePostRequest extends FormRequest
{
    // ...
}
```

Or, if you would like to redirect users to a named route, you may use the `RedirectToRoute` attribute instead:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\RedirectToRoute;
use Illuminate\Foundation\Http\FormRequest;

#[RedirectToRoute('dashboard')]
class StorePostRequest extends FormRequest
{
    // ...
}
```

##### Customizing the Error Bag

When form request validation fails, the errors are flashed to the `default` error bag. If you need to store the errors in a different [named error bag](#named-error-bags), you may use the `ErrorBag` attribute on your form request:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\ErrorBag;
use Illuminate\Foundation\Http\FormRequest;

#[ErrorBag('login')]
class LoginRequest extends FormRequest
{
    // ...
}
```

#### Authorizing Form Requests

The form request class also contains an `authorize` method. Within this method, you may determine if the authenticated user actually has the authority to update a given resource. For example, you may determine if a user actually owns a blog comment they are attempting to update. Most likely, you will interact with your [authorization gates and policies](https://laravel.com/docs/authorization) within this method:

```php
use App\Models\Comment;

/**
 * Determine if the user is authorized to make this request.
 */
public function authorize(): bool
{
    $comment = Comment::find($this->route('comment'));

    return $comment && $this->user()->can('update', $comment);
}
```

Since all form requests extend the base Laravel request class, we may use the `user` method to access the currently authenticated user. Also, note the call to the `route` method in the example above. This method grants you access to the URI parameters defined on the route being called, such as the `{comment}` parameter in the example below:

```php
Route::post('/comment/{comment}');
```

Therefore, if your application is taking advantage of [route model binding](https://laravel.com/docs/routing#route-model-binding), your code may be made even more succinct by accessing the resolved model as a property of the request:

```php
return $this->user()->can('update', $this->comment);
```

If the `authorize` method returns `false`, an HTTP response with a 403 status code will automatically be returned and your controller method will not execute.

If you plan to handle authorization logic for the request in another part of your application, you may remove the `authorize` method completely, or simply return `true`:

```php
/**
 * Determine if the user is authorized to make this request.
 */
public function authorize(): bool
{
    return true;
}
```

> **Note:**
> You may type-hint any dependencies you need within the `authorize` method's signature. They will automatically be resolved via the Laravel [service container](https://laravel.com/docs/container).

#### Customizing the Error Messages

You may customize the error messages used by the form request by overriding the `messages` method. This method should return an array of attribute / rule pairs and their corresponding error messages:

```php
/**
 * Get the error messages for the defined validation rules.
 *
 * @return array<string, string>
 */
public function messages(): array
{
    return [
        'title.required' => 'A title is required',
        'body.required' => 'A message is required',
    ];
}
```

##### Customizing the Validation Attributes

Many of Laravel's built-in validation rule error messages contain an `:attribute` placeholder. If you would like the `:attribute` placeholder of your validation message to be replaced with a custom attribute name, you may specify the custom names by overriding the `attributes` method. This method should return an array of attribute / name pairs:

```php
/**
 * Get custom attributes for validator errors.
 *
 * @return array<string, string>
 */
public function attributes(): array
{
    return [
        'email' => 'email address',
    ];
}
```

#### Preparing Input for Validation

If you need to prepare or sanitize any data from the request before you apply your validation rules, you may use the `prepareForValidation` method:

```php
use Illuminate\Support\Str;

/**
 * Prepare the data for validation.
 */
protected function prepareForValidation(): void
{
    $this->merge([
        'slug' => Str::slug($this->slug),
    ]);
}
```

Likewise, if you need to normalize any request data after validation is complete, you may use the `passedValidation` method:

```php
/**
 * Handle a passed validation attempt.
 */
protected function passedValidation(): void
{
    $this->replace(['name' => 'Taylor']);
}
```

### Manually Creating Validators

If you do not want to use the `validate` method on the request, you may create a validator instance manually using the `Validator` [facade](https://laravel.com/docs/facades). The `make` method on the facade generates a new validator instance:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Store a new blog post.
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'unique:posts', 'max:255'],
            'body' => ['required'],
        ]);

        if ($validator->fails()) {
            return redirect('/post/create')
                ->withErrors($validator)
                ->withInput();
        }

        // Retrieve the validated input...
        $validated = $validator->validated();

        // Retrieve a portion of the validated input...
        $validated = $validator->safe()->only(['name', 'email']);
        $validated = $validator->safe()->except(['name', 'email']);

        // Store the blog post...

        return redirect('/posts');
    }
}
```

The first argument passed to the `make` method is the data under validation. The second argument is an array of the validation rules that should be applied to the data.

After determining whether the request validation failed, you may use the `withErrors` method to flash the error messages to the session. When using this method, the `$errors` variable will automatically be shared with your views after redirection, allowing you to easily display them back to the user. The `withErrors` method accepts a validator, a `MessageBag`, or a PHP `array`.

##### Stopping on First Validation Failure

The `stopOnFirstFailure` method will inform the validator that it should stop validating all attributes once a single validation failure has occurred:

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

#### Automatic Redirection

If you would like to create a validator instance manually but still take advantage of the automatic redirection offered by the HTTP request's `validate` method, you may call the `validate` method on an existing validator instance. If validation fails, the user will automatically be redirected or, in the case of an XHR request, a [JSON response will be returned](#validation-error-response-format):

```php
Validator::make($request->all(), [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
])->validate();
```

You may use the `validateWithBag` method to store the error messages in a [named error bag](#named-error-bags) if validation fails:

```php
Validator::make($request->all(), [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
])->validateWithBag('post');
```

#### Named Error Bags

If you have multiple forms on a single page, you may wish to name the `MessageBag` containing the validation errors, allowing you to retrieve the error messages for a specific form. To achieve this, pass a name as the second argument to `withErrors`:

```php
return redirect('/register')->withErrors($validator, 'login');
```

You may then access the named `MessageBag` instance from the `$errors` variable:

```blade
{{ $errors->login->first('email') }}
```

#### Customizing the Error Messages

If needed, you may provide custom error messages that a validator instance should use instead of the default error messages provided by Laravel. There are several ways to specify custom messages. First, you may pass the custom messages as the third argument to the `Validator::make` method:

```php
$validator = Validator::make($input, $rules, $messages = [
    'required' => 'The :attribute field is required.',
]);
```

In this example, the `:attribute` placeholder will be replaced by the actual name of the field under validation. You may also utilize other placeholders in validation messages. For example:

```php
$messages = [
    'same' => 'The :attribute and :other must match.',
    'size' => 'The :attribute must be exactly :size.',
    'between' => 'The :attribute value :input is not between :min - :max.',
    'in' => 'The :attribute must be one of the following types: :values',
];
```

##### Specifying a Custom Message for a Given Attribute

Sometimes you may wish to specify a custom error message only for a specific attribute. You may do so using "dot" notation. Specify the attribute's name first, followed by the rule:

```php
$messages = [
    'email.required' => 'We need to know your email address!',
];
```

##### Specifying Custom Attribute Values

Many of Laravel's built-in error messages include an `:attribute` placeholder that is replaced with the name of the field or attribute under validation. To customize the values used to replace these placeholders for specific fields, you may pass an array of custom attributes as the fourth argument to the `Validator::make` method:

```php
$validator = Validator::make($input, $rules, $messages, [
    'email' => 'email address',
]);
```

#### Performing Additional Validation

Sometimes you need to perform additional validation after your initial validation is complete. You can accomplish this using the validator's `after` method. The `after` method accepts a closure or an array of callables which will be invoked after validation is complete. The given callables will receive an `Illuminate\Validation\Validator` instance, allowing you to raise additional error messages if necessary:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make(/* ... */);

$validator->after(function ($validator) {
    if ($this->somethingElseIsInvalid()) {
        $validator->errors()->add(
            'field', 'Something is wrong with this field!'
        );
    }
});

if ($validator->fails()) {
    // ...
}
```

As noted, the `after` method also accepts an array of callables, which is particularly convenient if your "after validation" logic is encapsulated in invokable classes, which will receive an `Illuminate\Validation\Validator` instance via their `__invoke` method:

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;

$validator->after([
    new ValidateUserStatus,
    new ValidateShippingTime,
    function ($validator) {
        // ...
    },
]);
```

### Working With Validated Input

After validating incoming request data using a form request or a manually created validator instance, you may wish to retrieve the incoming request data that actually underwent validation. This can be accomplished in several ways. First, you may call the `validated` method on a form request or validator instance. This method returns an array of the data that was validated:

```php
$validated = $request->validated();

$validated = $validator->validated();
```

Alternatively, you may call the `safe` method on a form request or validator instance. This method returns an instance of `Illuminate\Support\ValidatedInput`. This object exposes `only`, `except`, and `all` methods to retrieve a subset of the validated data or the entire array of validated data:

```php
$validated = $request->safe()->only(['name', 'email']);

$validated = $request->safe()->except(['name', 'email']);

$validated = $request->safe()->all();
```

In addition, the `Illuminate\Support\ValidatedInput` instance may be iterated over and accessed like an array:

```php
// Validated data may be iterated...
foreach ($request->safe() as $key => $value) {
    // ...
}

// Validated data may be accessed as an array...
$validated = $request->safe();

$email = $validated['email'];
```

If you would like to add additional fields to the validated data, you may call the `merge` method:

```php
$validated = $request->safe()->merge(['name' => 'Taylor Otwell']);
```

If you would like to retrieve the validated data as a [collection](https://laravel.com/docs/collections) instance, you may call the `collect` method:

```php
$collection = $request->safe()->collect();
```

### Working With Error Messages

After calling the `errors` method on a `Validator` instance, you will receive an `Illuminate\Support\MessageBag` instance, which has a variety of convenient methods for working with error messages. The `$errors` variable that is automatically made available to all views is also an instance of the `MessageBag` class.

##### Retrieving the First Error Message for a Field

To retrieve the first error message for a given field, use the `first` method:

```php
$errors = $validator->errors();

echo $errors->first('email');
```

##### Retrieving All Error Messages for a Field

If you need to retrieve an array of all the messages for a given field, use the `get` method:

```php
foreach ($errors->get('email') as $message) {
    // ...
}
```

If you are validating an array form field, you may retrieve all of the messages for each of the array elements using the `*` character:

```php
foreach ($errors->get('attachments.*') as $message) {
    // ...
}
```

##### Retrieving All Error Messages for All Fields

To retrieve an array of all messages for all fields, use the `all` method:

```php
foreach ($errors->all() as $message) {
    // ...
}
```

##### Determining if Messages Exist for a Field

The `has` method may be used to determine if any error messages exist for a given field:

```php
if ($errors->has('email')) {
    // ...
}
```

#### Specifying Custom Messages in Language Files

Laravel's built-in validation rules each have an error message that is located in your application's `lang/en/validation.php` file. If your application does not have a `lang` directory, you may instruct Laravel to create it using the `lang:publish` Artisan command.

Within the `lang/en/validation.php` file, you will find a translation entry for each validation rule. You are free to change or modify these messages based on the needs of your application.

In addition, you may copy this file to another language directory to translate the messages for your application's language. To learn more about Laravel localization, check out the complete [localization documentation](https://laravel.com/docs/localization).

> **Warning:**
> By default, the Laravel application skeleton does not include the `lang` directory. If you would like to customize Laravel's language files, you may publish them via the `lang:publish` Artisan command.

##### Custom Messages for Specific Attributes

You may customize the error messages used for specified attribute and rule combinations within your application's validation language files. To do so, add your message customizations to the `custom` array of your application's `lang/xx/validation.php` language file:

```php
'custom' => [
    'email' => [
        'required' => 'We need to know your email address!',
        'max' => 'Your email address is too long!'
    ],
],
```

#### Specifying Attributes in Language Files

Many of Laravel's built-in error messages include an `:attribute` placeholder that is replaced with the name of the field or attribute under validation. If you would like the `:attribute` portion of your validation message to be replaced with a custom value, you may specify the custom attribute name in the `attributes` array of your `lang/xx/validation.php` language file:

```php
'attributes' => [
    'email' => 'email address',
],
```

> **Warning:**
> By default, the Laravel application skeleton does not include the `lang` directory. If you would like to customize Laravel's language files, you may publish them via the `lang:publish` Artisan command.

#### Specifying Values in Language Files

Some of Laravel's built-in validation rule error messages contain a `:value` placeholder that is replaced with the current value of the request attribute. However, you may occasionally need the `:value` portion of your validation message to be replaced with a custom representation of the value. For example, consider the following rule that specifies that a credit card number is required if the `payment_type` has a value of `cc`:

```php
Validator::make($request->all(), [
    'credit_card_number' => ['required_if:payment_type,cc']
]);
```

If this validation rule fails, it will produce the following error message:

```text
The credit card number field is required when payment type is cc.
```

Instead of displaying `cc` as the payment type value, you may specify a more user-friendly value representation in your `lang/xx/validation.php` language file by defining a `values` array:

```php
'values' => [
    'payment_type' => [
        'cc' => 'credit card'
    ],
],
```

> **Warning:**
> By default, the Laravel application skeleton does not include the `lang` directory. If you would like to customize Laravel's language files, you may publish them via the `lang:publish` Artisan command.

After defining this value, the validation rule will produce the following error message:

```text
The credit card number field is required when payment type is credit card.
```

### Available Validation Rules

Below is a list of all available validation rules and their function:

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

##### Booleans

<div class="collection-method-list" markdown="1">

[Accepted](#rule-accepted)
[Accepted If](#rule-accepted-if)
[Boolean](#rule-boolean)
[Declined](#rule-declined)
[Declined If](#rule-declined-if)

</div>

##### Strings

<div class="collection-method-list" markdown="1">

[Active URL](#rule-active-url)
[Alpha](#rule-alpha)
[Alpha Dash](#rule-alpha-dash)
[Alpha Numeric](#rule-alpha-num)
[Ascii](#rule-ascii)
[Confirmed](#rule-confirmed)
[Current Password](#rule-current-password)
[Different](#rule-different)
[Doesnt Start With](#rule-doesnt-start-with)
[Doesnt End With](#rule-doesnt-end-with)
[Email](#rule-email)
[Ends With](#rule-ends-with)
[Enum](#rule-enum)
[Hex Color](#rule-hex-color)
[In](#rule-in)
[IP Address](#rule-ip)
[JSON](#rule-json)
[Lowercase](#rule-lowercase)
[MAC Address](#rule-mac)
[Max](#rule-max)
[Min](#rule-min)
[Not In](#rule-not-in)
[Regular Expression](#rule-regex)
[Not Regular Expression](#rule-not-regex)
[Same](#rule-same)
[Size](#rule-size)
[Starts With](#rule-starts-with)
[String](#rule-string)
[Uppercase](#rule-uppercase)
[URL](#rule-url)
[ULID](#rule-ulid)
[UUID](#rule-uuid)

</div>

##### Numbers

<div class="collection-method-list" markdown="1">

[Between](#rule-between)
[Decimal](#rule-decimal)
[Different](#rule-different)
[Digits](#rule-digits)
[Digits Between](#rule-digits-between)
[Greater Than](#rule-gt)
[Greater Than Or Equal](#rule-gte)
[Integer](#rule-integer)
[Less Than](#rule-lt)
[Less Than Or Equal](#rule-lte)
[Max](#rule-max)
[Max Digits](#rule-max-digits)
[Min](#rule-min)
[Min Digits](#rule-min-digits)
[Multiple Of](#rule-multiple-of)
[Numeric](#rule-numeric)
[Same](#rule-same)
[Size](#rule-size)

</div>

##### Arrays

<div class="collection-method-list" markdown="1">

[Array](#rule-array)
[Array Keys](#rule-array-keys)
[Between](#rule-between)
[Contains](#rule-contains)
[Doesnt Contain](#rule-doesnt-contain)
[Distinct](#rule-distinct)
[In Array](#rule-in-array)
[In Array Keys](#rule-in-array-keys)
[List](#rule-list)
[Max](#rule-max)
[Min](#rule-min)
[Size](#rule-size)

</div>

##### Dates

<div class="collection-method-list" markdown="1">

[After](#rule-after)
[After Or Equal](#rule-after-or-equal)
[Before](#rule-before)
[Before Or Equal](#rule-before-or-equal)
[Date](#rule-date)
[Date Equals](#rule-date-equals)
[Date Format](#rule-date-format)
[Different](#rule-different)
[Timezone](#rule-timezone)

</div>

##### Files

<div class="collection-method-list" markdown="1">

[Between](#rule-between)
[Dimensions](#rule-dimensions)
[Encoding](#rule-encoding)
[Extensions](#rule-extensions)
[File](#rule-file)
[Image](#rule-image)
[Max](#rule-max)
[Min](#rule-min)
[MIME Types](#rule-mimetypes)
[MIME Type By File Extension](#rule-mimes)
[Size](#rule-size)

</div>

##### Database

<div class="collection-method-list" markdown="1">

[Exists](#rule-exists)
[Unique](#rule-unique)

</div>

##### Utilities

<div class="collection-method-list" markdown="1">

[Any Of](#rule-anyof)
[Bail](#rule-bail)
[Exclude](#rule-exclude)
[Exclude If](#rule-exclude-if)
[Exclude Unless](#rule-exclude-unless)
[Exclude With](#rule-exclude-with)
[Exclude Without](#rule-exclude-without)
[Filled](#rule-filled)
[Missing](#rule-missing)
[Missing If](#rule-missing-if)
[Missing Unless](#rule-missing-unless)
[Missing With](#rule-missing-with)
[Missing With All](#rule-missing-with-all)
[Nullable](#rule-nullable)
[Present](#rule-present)
[Present If](#rule-present-if)
[Present Unless](#rule-present-unless)
[Present With](#rule-present-with)
[Present With All](#rule-present-with-all)
[Prohibited](#rule-prohibited)
[Prohibited If](#rule-prohibited-if)
[Prohibited If Accepted](#rule-prohibited-if-accepted)
[Prohibited If Declined](#rule-prohibited-if-declined)
[Prohibited Unless](#rule-prohibited-unless)
[Prohibits](#rule-prohibits)
[Required](#rule-required)
[Required If](#rule-required-if)
[Required If Accepted](#rule-required-if-accepted)
[Required If Declined](#rule-required-if-declined)
[Required Unless](#rule-required-unless)
[Required With](#rule-required-with)
[Required With All](#rule-required-with-all)
[Required Without](#rule-required-without)
[Required Without All](#rule-required-without-all)
[Required Array Keys](#rule-required-array-keys)
[Sometimes](#validating-when-present)

</div>

##### accepted

The field under validation must be `"yes"`, `"on"`, `1`, `"1"`, `true`, or `"true"`. This is useful for validating "Terms of Service" acceptance or similar fields.

##### accepted_if:anotherfield,value,...

The field under validation must be `"yes"`, `"on"`, `1`, `"1"`, `true`, or `"true"` if another field under validation is equal to a specified value. This is useful for validating "Terms of Service" acceptance or similar fields.

##### active_url

The field under validation must have a valid A or AAAA record according to the `dns_get_record` PHP function. The hostname of the provided URL is extracted using the `parse_url` PHP function before being passed to `dns_get_record`.

When testing validation rules that perform DNS lookups, such as `active_url` and `email:dns`, you may use the `Validator::fakeDnsLookups` method. This fakes DNS lookups while preserving the rules' other validation behavior:

```php
use Illuminate\Support\Facades\Validator;

Validator::fakeDnsLookups();
```

##### after:_date_

The field under validation must be a value after a given date. The dates will be passed into the `strtotime` PHP function in order to be converted to a valid `DateTime` instance:

```php
'start_date' => ['required', 'date', 'after:tomorrow']
```

Instead of passing a date string to be evaluated by `strtotime`, you may specify another field to compare against the date:

```php
'finish_date' => ['required', 'date', 'after:start_date']
```

For convenience, date-based rules may be constructed using the fluent `date` rule builder:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->after(today()->addDays(7)),
],
```

The `afterToday` and `todayOrAfter` methods may be used to fluently express the date and must be after today, or today or after, respectively:

```php
'start_date' => [
    'required',
    Rule::date()->afterToday(),
],
```

##### after\_or\_equal:_date_

The field under validation must be a value after or equal to the given date. For more information, see the [after](#rule-after) rule.

For convenience, date-based rules may be constructed using the fluent `date` rule builder:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->afterOrEqual(today()->addDays(7)),
],
```

##### anyOf

The `Rule::anyOf` validation rule allows you to specify that the field under validation must satisfy any of the given validation rulesets. For example, the following rule will validate that the `username` field is either an email address or an alpha-numeric string (including dashes) that is at least 6 characters long:

```php
use Illuminate\Validation\Rule;

'username' => [
    'required',
    Rule::anyOf([
        ['string', 'email'],
        ['string', 'alpha_dash', 'min:6'],
    ]),
],
```

##### alpha

The field under validation must be entirely Unicode alphabetic characters contained in [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=) and [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=).

To restrict this validation rule to characters in the ASCII range (`a-z` and `A-Z`), you may provide the `ascii` option to the validation rule:

```php
'username' => ['alpha:ascii'],
```

##### alpha_dash

The field under validation must be entirely Unicode alpha-numeric characters contained in [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [\p{N}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=), as well as ASCII dashes (`-`) and ASCII underscores (`_`).

To restrict this validation rule to characters in the ASCII range (`a-z`, `A-Z`, and `0-9`), you may provide the `ascii` option to the validation rule:

```php
'username' => ['alpha_dash:ascii'],
```

##### alpha_num

The field under validation must be entirely Unicode alpha-numeric characters contained in [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), and [\p{N}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=).

To restrict this validation rule to characters in the ASCII range (`a-z`, `A-Z`, and `0-9`), you may provide the `ascii` option to the validation rule:

```php
'username' => ['alpha_num:ascii'],
```

##### array

The field under validation must be a PHP `array`.

When additional values are provided to the `array` rule, each key in the input array must be present within the list of values provided to the rule. In the following example, the `admin` key in the input array is invalid since it is not contained in the list of values provided to the `array` rule:

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'user' => [
        'name' => 'Taylor Otwell',
        'username' => 'taylorotwell',
        'admin' => true,
    ],
];

Validator::make($input, [
    'user' => ['array:name,username'],
]);
```

In general, you should always specify the array keys that are allowed to be present within your array.

##### array_keys:_foo_,_bar_,...

The field under validation must be a PHP `array` whose keys are all included in the given list. At least one key must be provided:

```php
'user' => ['array_keys:name,username'],
```

For convenience, you may use the `Rule::arrayKeys` method:

```php
'user' => [Rule::arrayKeys('name', 'username')],
```

##### ascii

The field under validation must be entirely 7-bit ASCII characters.

##### bail

Stop running validation rules for the field after the first validation failure.

While the `bail` rule will only stop validating a specific field when it encounters a validation failure, the `stopOnFirstFailure` method will inform the validator that it should stop validating all attributes once a single validation failure has occurred:

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

##### before:_date_

The field under validation must be a value preceding the given date. The dates will be passed into the PHP `strtotime` function in order to be converted into a valid `DateTime` instance. In addition, like the [after](#rule-after) rule, the name of another field under validation may be supplied as the value of `date`.

For convenience, date-based rules may also be constructed using the fluent `date` rule builder:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->before(today()->subDays(7)),
],
```

The `beforeToday` and `todayOrBefore` methods may be used to fluently express the date and must be before today, or today or before, respectively:

```php
'start_date' => [
    'required',
    Rule::date()->beforeToday(),
],
```

##### before\_or\_equal:_date_

The field under validation must be a value preceding or equal to the given date. The dates will be passed into the PHP `strtotime` function in order to be converted into a valid `DateTime` instance. In addition, like the [after](#rule-after) rule, the name of another field under validation may be supplied as the value of `date`.

For convenience, date-based rules may also be constructed using the fluent `date` rule builder:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->beforeOrEqual(today()->subDays(7)),
],
```

##### between:_min_,_max_

The field under validation must have a size between the given _min_ and _max_ (inclusive). Strings, numerics, arrays, and files are evaluated in the same fashion as the [size](#rule-size) rule.

##### boolean

The field under validation must be able to be cast as a boolean. Accepted input are `true`, `false`, `1`, `0`, `"1"`, and `"0"`.

You may use the `strict` parameter to only consider the field valid if its value is `true` or `false`:

```php
'foo' => ['boolean:strict']
```

##### confirmed

The field under validation must have a matching field of `{field}_confirmation`. For example, if the field under validation is `password`, a matching `password_confirmation` field must be present in the input.

You may also pass a custom confirmation field name. For example, `confirmed:repeat_username` will expect the field `repeat_username` to match the field under validation.

##### contains:_foo_,_bar_,...

The field under validation must be an array that contains all of the given parameter values. Since this rule often requires you to `implode` an array, the `Rule::contains` method may be used to fluently construct the rule:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'roles' => [
        'required',
        'array',
        Rule::contains(['admin', 'editor']),
    ],
]);
```

##### doesnt_contain:_foo_,_bar_,...

The field under validation must be an array that does not contain any of the given parameter values. Since this rule often requires you to `implode` an array, the `Rule::doesntContain` method may be used to fluently construct the rule:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'roles' => [
        'required',
        'array',
        Rule::doesntContain(['admin', 'editor']),
    ],
]);
```

##### current_password

The field under validation must match the authenticated user's password. You may specify an [authentication guard](https://laravel.com/docs/authentication) using the rule's first parameter:

```php
'password' => ['current_password:api']
```

##### date

The field under validation must be a valid, non-relative date according to the `strtotime` PHP function.

##### date_equals:_date_

The field under validation must be equal to the given date. The dates will be passed into the PHP `strtotime` function in order to be converted into a valid `DateTime` instance.

##### date_format:_format_,...

The field under validation must match one of the given _formats_. You should use **either** `date` or `date_format` when validating a field, not both. This validation rule supports all formats supported by PHP's [DateTime](https://www.php.net/manual/en/class.datetime.php) class.

For convenience, date-based rules may be constructed using the fluent `date` rule builder:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->format('Y-m-d'),
],
```

##### decimal:_min_,_max_

The field under validation must be numeric and must contain the specified number of decimal places:

```php
// Must have exactly two decimal places (9.99)...
'price' => ['decimal:2']

// Must have between 2 and 4 decimal places...
'price' => ['decimal:2,4']
```

##### declined

The field under validation must be `"no"`, `"off"`, `0`, `"0"`, `false`, or `"false"`.

##### declined_if:anotherfield,value,...

The field under validation must be `"no"`, `"off"`, `0`, `"0"`, `false`, or `"false"` if another field under validation is equal to a specified value.

##### different:_field_

The field under validation must have a different value than _field_.

##### digits:_value_

The integer under validation must have an exact length of _value_.

##### digits_between:_min_,_max_

The integer under validation must have a length between the given _min_ and _max_.

##### dimensions

The file under validation must be an image meeting the dimension constraints as specified by the rule's parameters:

```php
'avatar' => ['dimensions:min_width=100,min_height=200']
```

Available constraints are: _min\_width_, _max\_width_, _min\_height_, _max\_height_, _width_, _height_, _ratio_, _min\_ratio_, _max\_ratio_.

A _ratio_ constraint should be represented as width divided by height. This can be specified either by a fraction like `3/2` or a float like `1.5`:

```php
'avatar' => ['dimensions:ratio=3/2']
```

The _min\_ratio_ and _max\_ratio_ constraints may be used to define a range of acceptable aspect ratios:

```php
'avatar' => ['dimensions:min_ratio=1/2,max_ratio=3/2']
```

Since this rule requires several arguments, it is often more convenient to use the `Rule::dimensions` method to fluently construct the rule:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'avatar' => [
        'required',
        Rule::dimensions()
            ->maxWidth(1000)
            ->maxHeight(500)
            ->ratio(3 / 2),
    ],
]);
```

You may also use the `minRatio`, `maxRatio`, and `ratioBetween` methods to fluently define ratio constraints:

```php
Rule::dimensions()->ratioBetween(min: 1 / 2, max: 3 / 2);
```

##### distinct

When validating arrays, the field under validation must not have any duplicate values:

```php
'foo.*.id' => ['distinct']
```

Distinct uses loose variable comparisons by default. To use strict comparisons, you may add the `strict` parameter to your validation rule definition:

```php
'foo.*.id' => ['distinct:strict']
```

You may add `ignore_case` to the validation rule's arguments to make the rule ignore capitalization differences:

```php
'foo.*.id' => ['distinct:ignore_case']
```

##### doesnt_start_with:_foo_,_bar_,...

The field under validation must not start with one of the given values.

##### doesnt_end_with:_foo_,_bar_,...

The field under validation must not end with one of the given values.

##### email

The field under validation must be formatted as an email address. This validation rule utilizes the [egulias/email-validator](https://github.com/egulias/EmailValidator) package for validating the email address. By default, the `RFCValidation` validator is applied, but you can apply other validation styles as well:

```php
'email' => ['email:rfc,dns']
```

The example above will apply the `RFCValidation` and `DNSCheckValidation` validations. Here's a full list of validation styles you can apply:

<div class="content-list" markdown="1">

- `rfc`: `RFCValidation` - Validate the email address according to [supported RFCs](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs).
- `strict`: `NoRFCWarningsValidation` - Validate the email according to [supported RFCs](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs), failing when warnings are found (e.g. trailing periods and multiple consecutive periods).
- `dns`: `DNSCheckValidation` - Ensure the email address's domain has a valid MX record.
- `spoof`: `SpoofCheckValidation` - Ensure the email address does not contain homograph or deceptive Unicode characters.
- `filter`: `FilterEmailValidation` - Ensure the email address is valid according to PHP's `filter_var` function.
- `filter_unicode`: `FilterEmailValidation::unicode()` - Ensure the email address is valid according to PHP's `filter_var` function, allowing some Unicode characters.

</div>

For convenience, email validation rules may be built using the fluent rule builder:

```php
use Illuminate\Validation\Rule;

$request->validate([
    'email' => [
        'required',
        Rule::email()
            ->rfcCompliant(strict: false)
            ->validateMxRecord()
            ->preventSpoofing()
    ],
]);
```

The `dns` validator performs a real DNS lookup to confirm the address's domain has a valid MX record. It does not determine whether an individual mailbox exists.

Since your tests should not rely on live DNS lookups, you may use the `Validator::fakeDnsLookups` method to [fake DNS lookups](#rule-active-url) while any other requested validations, such as `rfc`, continue to run:

```php
use Illuminate\Support\Facades\Validator;

Validator::fakeDnsLookups();
```

This allows your application to keep using its existing validation rules while testing:

```php
'email' => ['required', 'email:rfc,dns'],
```

> **Warning:**
> The `dns` and `spoof` validators require the PHP `intl` extension.

##### encoding:*encoding_type*

The field under validation must match the specified character encoding. This rule uses PHP's `mb_check_encoding` function to verify the encoding of the given file or string value. For convenience, the `encoding` rule may be constructed using Laravel's fluent file rule builder:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'attachment' => [
        'required',
        File::types(['csv'])
            ->encoding('utf-8'),
    ],
]);
```

##### ends_with:_foo_,_bar_,...

The field under validation must end with one of the given values.

##### enum

The `Enum` rule is a class-based rule that validates whether the field under validation contains a valid enum value. The `Enum` rule accepts the name of the enum as its only constructor argument. When validating primitive values, a backed Enum should be provided to the `Enum` rule:

```php
use App\Enums\ServerStatus;
use Illuminate\Validation\Rule;

$request->validate([
    'status' => [Rule::enum(ServerStatus::class)],
]);
```

The `Enum` rule's `only` and `except` methods may be used to limit which enum cases should be considered valid:

```php
Rule::enum(ServerStatus::class)
    ->only([ServerStatus::Pending, ServerStatus::Active]);

Rule::enum(ServerStatus::class)
    ->except([ServerStatus::Pending, ServerStatus::Active]);
```

The `when` method may be used to conditionally modify the `Enum` rule:

```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

Rule::enum(ServerStatus::class)
    ->when(
        Auth::user()->isAdmin(),
        fn ($rule) => $rule->only(...),
        fn ($rule) => $rule->only(...),
    );
```

##### exclude

The field under validation will be excluded from the request data returned by the `validate` and `validated` methods.

##### exclude_if:_anotherfield_,_value_

The field under validation will be excluded from the request data returned by the `validate` and `validated` methods if the _anotherfield_ field is equal to _value_.

If complex conditional exclusion logic is required, you may utilize the `Rule::excludeIf` method. This method accepts a boolean or a closure. When given a closure, the closure should return `true` or `false` to indicate if the field under validation should be excluded:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::excludeIf($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::excludeIf(fn () => $request->user()->is_admin)],
]);
```

##### exclude_unless:_anotherfield_,_value_

The field under validation will be excluded from the request data returned by the `validate` and `validated` methods unless _anotherfield_'s field is equal to _value_. If _value_ is `null` (`exclude_unless:name,null`), the field under validation will be excluded unless the comparison field is `null` or the comparison field is missing from the request data.

If complex conditional exclusion logic is required, you may utilize the `Rule::excludeUnless` method. This method accepts a boolean or a closure. When given a closure, the closure should return `true` or `false` to indicate if the field under validation should not be excluded:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::excludeUnless($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::excludeUnless(fn () => $request->user()->is_admin)],
]);
```

##### exclude_with:_anotherfield_

The field under validation will be excluded from the request data returned by the `validate` and `validated` methods if the _anotherfield_ field is present.

##### exclude_without:_anotherfield_

The field under validation will be excluded from the request data returned by the `validate` and `validated` methods if the _anotherfield_ field is not present.

##### exists:_table_,_column_

The field under validation must exist in a given database table.

##### Basic Usage of Exists Rule

```php
'state' => ['exists:states']
```

If the `column` option is not specified, the field name will be used. So, in this case, the rule will validate that the `states` database table contains a record with a `state` column value matching the request's `state` attribute value.

##### Specifying a Custom Column Name

You may explicitly specify the database column name that should be used by the validation rule by placing it after the database table name:

```php
'state' => ['exists:states,abbreviation']
```

Occasionally, you may need to specify a specific database connection to be used for the `exists` query. You can accomplish this by prepending the connection name to the table name:

```php
'email' => ['exists:connection.staff,email']
```

Instead of specifying the table name directly, you may specify the Eloquent model which should be used to determine the table name:

```php
'user_id' => ['exists:App\Models\User,id']
```

If you would like to customize the query executed by the validation rule, you may use the `Rule` class to fluently define the rule.

```php
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::exists('staff')->where(function (Builder $query) {
            $query->where('account_id', 1);
        }),
    ],
]);
```

You may explicitly specify the database column name that should be used by the `exists` rule generated by the `Rule::exists` method by providing the column name as the second argument to the `exists` method:

```php
'state' => [Rule::exists('states', 'abbreviation')],
```

Sometimes, you may wish to validate whether an array of values exists in the database. You can do so by adding both the `exists` and [array](#rule-array) rules to the field being validated:

```php
'states' => ['array', Rule::exists('states', 'abbreviation')],
```

When both of these rules are assigned to a field, Laravel will automatically build a single query to determine if all of the given values exist in the specified table.

##### extensions:_foo_,_bar_,...

The file under validation must have a user-assigned extension corresponding to one of the listed extensions:

```php
'photo' => ['required', 'extensions:jpg,png'],
```

> **Warning:**
> You should never rely on validating a file by its user-assigned extension alone. This rule should typically always be used in combination with the [mimes](#rule-mimes) or [mimetypes](#rule-mimetypes) rules.

##### file

The field under validation must be a successfully uploaded file.

##### filled

The field under validation must not be empty when it is present.

##### gt:_field_

The field under validation must be greater than the given _field_ or _value_. The two fields must be of the same type. Strings, numerics, arrays, and files are evaluated using the same conventions as the [size](#rule-size) rule.

##### gte:_field_

The field under validation must be greater than or equal to the given _field_ or _value_. The two fields must be of the same type. Strings, numerics, arrays, and files are evaluated using the same conventions as the [size](#rule-size) rule.

##### hex_color

The field under validation must contain a valid color value in [hexadecimal](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color) format.

##### image

The file under validation must be an image (jpg, jpeg, png, bmp, gif, webp, avif, heic, or heif).

> **Warning:**
> By default, the image rule does not allow SVG files due to the possibility of XSS vulnerabilities. If you need to allow SVG files, you may provide the `allow_svg` directive to the `image` rule (`image:allow_svg`).

##### in:_foo_,_bar_,...

The field under validation must be included in the given list of values. Since this rule often requires you to `implode` an array, the `Rule::in` method may be used to fluently construct the rule:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'zones' => [
        'required',
        Rule::in(['first-zone', 'second-zone']),
    ],
]);
```

When the `in` rule is combined with the `array` rule, each value in the input array must be present within the list of values provided to the `in` rule. In the following example, the `LAS` airport code in the input array is invalid since it is not contained in the list of airports provided to the `in` rule:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$input = [
    'airports' => ['NYC', 'LAS'],
];

Validator::make($input, [
    'airports' => [
        'required',
        'array',
    ],
    'airports.*' => Rule::in(['NYC', 'LIT']),
]);
```

##### in_array:_anotherfield_.*

The field under validation must exist in _anotherfield_'s values.

##### in_array_keys:_value_.*

The field under validation must be an array having at least one of the given _values_ as a key within the array:

```php
'config' => ['array', 'in_array_keys:timezone']
```

##### integer

The field under validation must be an integer.

You may use the `strict` parameter to only consider the field valid if its type is `integer`. Strings with integer values will be considered invalid:

```php
'age' => ['integer:strict']
```

> **Warning:**
> This validation rule does not verify that the input is of the "integer" variable type, only that the input is of a type accepted by PHP's `FILTER_VALIDATE_INT` rule. If you need to validate the input as being a number please use this rule in combination with [the `numeric` validation rule](#rule-numeric).

##### ip

The field under validation must be an IP address.

##### ipv4

The field under validation must be an IPv4 address.

##### ipv6

The field under validation must be an IPv6 address.

##### json

The field under validation must be a valid JSON string.

##### lt:_field_

The field under validation must be less than the given _field_. The two fields must be of the same type. Strings, numerics, arrays, and files are evaluated using the same conventions as the [size](#rule-size) rule.

##### lte:_field_

The field under validation must be less than or equal to the given _field_. The two fields must be of the same type. Strings, numerics, arrays, and files are evaluated using the same conventions as the [size](#rule-size) rule.

##### lowercase

The field under validation must be lowercase.

##### list

The field under validation must be an array that is a list. An array is considered a list if its keys consist of consecutive numbers from 0 to `count($array) - 1`.

##### mac_address

The field under validation must be a MAC address.

##### max:_value_

The field under validation must be less than or equal to a maximum _value_. Strings, numerics, arrays, and files are evaluated in the same fashion as the [size](#rule-size) rule.

##### max_digits:_value_

The integer under validation must have a maximum length of _value_.

##### mimetypes:_text/plain_,...

The file under validation must match one of the given MIME types:

```php
'video' => ['mimetypes:video/avi,video/mpeg,video/quicktime'],

'media' => ['mimetypes:image/*,video/*'],
```

To determine the MIME type of the uploaded file, the file's contents will be read and the framework will attempt to guess the MIME type, which may be different from the client's provided MIME type.

##### mimes:_foo_,_bar_,...

The file under validation must have a MIME type corresponding to one of the listed extensions:

```php
'photo' => ['mimes:jpg,bmp,png']
```

Even though you only need to specify the extensions, this rule actually validates the MIME type of the file by reading the file's contents and guessing its MIME type. A full listing of MIME types and their corresponding extensions may be found at the following location:

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

##### MIME Types and Extensions

This validation rule does not verify agreement between the MIME type and the extension the user assigned to the file. For example, the `mimes:png` validation rule would consider a file containing valid PNG content to be a valid PNG image, even if the file is named `photo.txt`. If you would like to validate the user-assigned extension of the file, you may use the [extensions](#rule-extensions) rule.

##### min:_value_

The field under validation must have a minimum _value_. Strings, numerics, arrays, and files are evaluated in the same fashion as the [size](#rule-size) rule.

##### min_digits:_value_

The integer under validation must have a minimum length of _value_.

##### multiple_of:_value_

The field under validation must be a multiple of _value_.

##### missing

The field under validation must not be present in the input data.

##### missing_if:_anotherfield_,_value_,...

The field under validation must not be present if the _anotherfield_ field is equal to any _value_.

##### missing_unless:_anotherfield_,_value_

The field under validation must not be present unless the _anotherfield_ field is equal to any _value_.

##### missing_with:_foo_,_bar_,...

The field under validation must not be present _only if_ any of the other specified fields are present.

##### missing_with_all:_foo_,_bar_,...

The field under validation must not be present _only if_ all of the other specified fields are present.

##### not_in:_foo_,_bar_,...

The field under validation must not be included in the given list of values. The `Rule::notIn` method may be used to fluently construct the rule:

```php
use Illuminate\Validation\Rule;

Validator::make($data, [
    'toppings' => [
        'required',
        Rule::notIn(['sprinkles', 'cherries']),
    ],
]);
```

##### not_regex:_pattern_

The field under validation must not match the given regular expression.

Internally, this rule uses the PHP `preg_match` function. The pattern specified should obey the same formatting required by `preg_match` and thus also include valid delimiters. For example: `'email' => ['not_regex:/^.+$/i']`.

##### nullable

The field under validation may be `null`.

##### numeric

The field under validation must be [numeric](https://www.php.net/manual/en/function.is-numeric.php).

You may use the `strict` parameter to only consider the field valid if its value is an integer or float type. Numeric strings will be considered invalid:

```php
'amount' => ['numeric:strict']
```

##### present

The field under validation must exist in the input data.

##### present_if:_anotherfield_,_value_,...

The field under validation must be present if the _anotherfield_ field is equal to any _value_.

##### present_unless:_anotherfield_,_value_

The field under validation must be present unless the _anotherfield_ field is equal to any _value_.

##### present_with:_foo_,_bar_,...

The field under validation must be present _only if_ any of the other specified fields are present.

##### present_with_all:_foo_,_bar_,...

The field under validation must be present _only if_ all of the other specified fields are present.

##### prohibited

The field under validation must be missing or empty. A field is "empty" if it meets one of the following criteria:

<div class="content-list" markdown="1">

- The value is `null`.
- The value is an empty string.
- The value is an empty array or empty `Countable` object.
- The value is an uploaded file with an empty path.

</div>

##### prohibited_if:_anotherfield_,_value_,...

The field under validation must be missing or empty if the _anotherfield_ field is equal to any _value_. A field is "empty" if it meets one of the following criteria:

<div class="content-list" markdown="1">

- The value is `null`.
- The value is an empty string.
- The value is an empty array or empty `Countable` object.
- The value is an uploaded file with an empty path.

</div>

If complex conditional prohibition logic is required, you may utilize the `Rule::prohibitedIf` method. This method accepts a boolean or a closure. When given a closure, the closure should return `true` or `false` to indicate if the field under validation should be prohibited:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedIf($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedIf(fn () => $request->user()->is_admin)],
]);
```
##### prohibited_if_accepted:_anotherfield_,...

The field under validation must be missing or empty if the _anotherfield_ field is equal to `"yes"`, `"on"`, `1`, `"1"`, `true`, or `"true"`.

##### prohibited_if_declined:_anotherfield_,...

The field under validation must be missing or empty if the _anotherfield_ field is equal to `"no"`, `"off"`, `0`, `"0"`, `false`, or `"false"`.

##### prohibited_unless:_anotherfield_,_value_,...

The field under validation must be missing or empty unless the _anotherfield_ field is equal to any _value_. A field is "empty" if it meets one of the following criteria:

<div class="content-list" markdown="1">

- The value is `null`.
- The value is an empty string.
- The value is an empty array or empty `Countable` object.
- The value is an uploaded file with an empty path.

</div>

If complex conditional prohibition logic is required, you may utilize the `Rule::prohibitedUnless` method. This method accepts a boolean or a closure. When given a closure, the closure should return `true` or `false` to indicate if the field under validation should not be prohibited:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedUnless($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedUnless(fn () => $request->user()->is_admin)],
]);
```

##### prohibits:_anotherfield_,...

If the field under validation is not missing or empty, all fields in _anotherfield_ must be missing or empty. A field is "empty" if it meets one of the following criteria:

<div class="content-list" markdown="1">

- The value is `null`.
- The value is an empty string.
- The value is an empty array or empty `Countable` object.
- The value is an uploaded file with an empty path.

</div>

##### regex:_pattern_

The field under validation must match the given regular expression.

Internally, this rule uses the PHP `preg_match` function. The pattern specified should obey the same formatting required by `preg_match` and thus also include valid delimiters. For example: `'email' => ['regex:/^.+@.+$/i']`.

##### required

The field under validation must be present in the input data and not empty. A field is "empty" if it meets one of the following criteria:

<div class="content-list" markdown="1">

- The value is `null`.
- The value is an empty string.
- The value is an empty array or empty `Countable` object.
- The value is an uploaded file with no path.

</div>

##### required_if:_anotherfield_,_value_,...

The field under validation must be present and not empty if the _anotherfield_ field is equal to any _value_.

If you would like to construct a more complex condition for the `required_if` rule, you may use the `Rule::requiredIf` method. This method accepts a boolean or a closure. When passed a closure, the closure should return `true` or `false` to indicate if the field under validation is required:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::requiredIf($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::requiredIf(fn () => $request->user()->is_admin)],
]);
```

##### required_if_accepted:_anotherfield_,...

The field under validation must be present and not empty if the _anotherfield_ field is equal to `"yes"`, `"on"`, `1`, `"1"`, `true`, or `"true"`.

##### required_if_declined:_anotherfield_,...

The field under validation must be present and not empty if the _anotherfield_ field is equal to `"no"`, `"off"`, `0`, `"0"`, `false`, or `"false"`.

##### required_unless:_anotherfield_,_value_,...

The field under validation must be present and not empty unless the _anotherfield_ field is equal to any _value_. This also means _anotherfield_ must be present in the request data unless _value_ is `null`. If _value_ is `null` (`required_unless:name,null`), the field under validation will be required unless the comparison field is `null` or the comparison field is missing from the request data.

If you would like to construct a more complex condition for the `required_unless` rule, you may use the `Rule::requiredUnless` method. This method accepts a boolean or a closure. When passed a closure, the closure should return `true` or `false` to indicate if the field under validation is not required:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::requiredUnless($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::requiredUnless(fn () => $request->user()->is_admin)],
]);
```

##### required_with:_foo_,_bar_,...

The field under validation must be present and not empty _only if_ any of the other specified fields are present and not empty.

##### required_with_all:_foo_,_bar_,...

The field under validation must be present and not empty _only if_ all of the other specified fields are present and not empty.

##### required_without:_foo_,_bar_,...

The field under validation must be present and not empty _only when_ any of the other specified fields are empty or not present.

##### required_without_all:_foo_,_bar_,...

The field under validation must be present and not empty _only when_ all of the other specified fields are empty or not present.

##### required_array_keys:_foo_,_bar_,...

The field under validation must be an array and must contain at least the specified keys.

##### same:_field_

The given _field_ must match the field under validation.

##### size:_value_

The field under validation must have a size matching the given _value_. For string data, _value_ corresponds to the number of characters. For numeric data, _value_ corresponds to a given integer value (the attribute must also have the `numeric` or `integer` rule). For an array, _size_ corresponds to the `count` of the array. For files, _size_ corresponds to the file size in kilobytes. Let's look at some examples:

```php
// Validate that a string is exactly 12 characters long...
'title' => ['size:12'];

// Validate that a provided integer equals 10...
'seats' => ['integer', 'size:10'];

// Validate that an array has exactly 5 elements...
'tags' => ['array', 'size:5'];

// Validate that an uploaded file is exactly 512 kilobytes...
'image' => ['file', 'size:512'];
```

##### starts_with:_foo_,_bar_,...

The field under validation must start with one of the given values.

##### string

The field under validation must be a string. If you would like to allow the field to also be `null`, you should assign the `nullable` rule to the field.

For convenience, string validation rules may also be constructed using the fluent `Rule::string()` rule builder:

```php
use Illuminate\Validation\Rule;

'title' => [
    'required',
    Rule::string()
        ->min(3)
        ->max(255)
        ->alphaDash(ascii: true),
],
```

The string rule builder provides methods for common string constraints, including `alpha`, `alphaDash`, `alphaNumeric`, `ascii`, `between`, `doesntEndWith`, `doesntStartWith`, `endsWith`, `exactly`, `lowercase`, `max`, `min`, `startsWith`, and `uppercase`. Since the rule builder is conditionable, you may also use the `when` and `unless` methods to conditionally apply constraints.

##### timezone

The field under validation must be a valid timezone identifier according to the `DateTimeZone::listIdentifiers` method.

The arguments [accepted by the `DateTimeZone::listIdentifiers` method](https://www.php.net/manual/en/datetimezone.listidentifiers.php) may also be provided to this validation rule:

```php
'timezone' => ['required', 'timezone:all'];

'timezone' => ['required', 'timezone:Africa'];

'timezone' => ['required', 'timezone:per_country,US'];
```

##### unique:_table_,_column_

The field under validation must not exist within the given database table.

**Specifying a Custom Table / Column Name:**

Instead of specifying the table name directly, you may specify the Eloquent model which should be used to determine the table name:

```php
'email' => ['unique:App\Models\User,email_address']
```

The `column` option may be used to specify the field's corresponding database column. If the `column` option is not specified, the name of the field under validation will be used.

```php
'email' => ['unique:users,email_address']
```

**Specifying a Custom Database Connection**

Occasionally, you may need to set a custom connection for database queries made by the Validator. To accomplish this, you may prepend the connection name to the table name:

```php
'email' => ['unique:connection.users,email_address']
```

**Forcing a Unique Rule to Ignore a Given ID:**

Sometimes, you may wish to ignore a given ID during unique validation. For example, consider an "update profile" screen that includes the user's name, email address, and location. You will probably want to verify that the email address is unique. However, if the user only changes the name field and not the email field, you do not want a validation error to be thrown because the user is already the owner of the email address in question.

To instruct the validator to ignore the user's ID, we'll use the `Rule` class to fluently define the rule.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::unique('users')->ignore($user->id),
    ],
]);
```

> **Warning:**
> You should never pass any user controlled request input into the `ignore` method. Instead, you should only pass a system generated unique ID such as an auto-incrementing ID or UUID from an Eloquent model instance. Otherwise, your application will be vulnerable to an SQL injection attack.

Instead of passing the model key's value to the `ignore` method, you may also pass the entire model instance. Laravel will automatically extract the key from the model:

```php
Rule::unique('users')->ignore($user);
```

If your table uses a primary key column name other than `id`, you may specify the name of the column when calling the `ignore` method:

```php
Rule::unique('users')->ignore($user->id, 'user_id');
```

By default, the `unique` rule will check the uniqueness of the column matching the name of the attribute being validated. However, you may pass a different column name as the second argument to the `unique` method:

```php
Rule::unique('users', 'email_address')->ignore($user->id);
```

**Adding Additional Where Clauses:**

You may specify additional query conditions by customizing the query using the `where` method. For example, let's add a query condition that scopes the query to only search records that have an `account_id` column value of `1`:

```php
'email' => Rule::unique('users')->where(fn (Builder $query) => $query->where('account_id', 1))
```

**Ignoring Soft Deleted Records in Unique Checks:**

By default, the unique rule includes soft deleted records when determining uniqueness. To exclude soft deleted records from the uniqueness check, you may invoke the `withoutTrashed` method:

```php
Rule::unique('users')->withoutTrashed();
```

If your model uses a column name other than `deleted_at` for soft deleted records, you may provide the column name when invoking the `withoutTrashed` method:

```php
Rule::unique('users')->withoutTrashed('was_deleted_at');
```

##### uppercase

The field under validation must be uppercase.

##### url

The field under validation must be a valid URL.

If you would like to specify the URL protocols that should be considered valid, you may pass the protocols as validation rule parameters:

```php
'url' => ['url:http,https'],

'game' => ['url:minecraft,steam'],
```

##### ulid

The field under validation must be a valid [Universally Unique Lexicographically Sortable Identifier](https://github.com/ulid/spec) (ULID).

##### uuid

The field under validation must be a valid RFC 9562 (version 1, 3, 4, 5, 6, 7, or 8) universally unique identifier (UUID).

You may also validate that the given UUID matches a UUID specification by version:

```php
'uuid' => ['uuid:4']
```

### Conditionally Adding Rules

##### Skipping Validation When Fields Have Certain Values

You may occasionally wish to not validate a given field if another field has a given value. You may accomplish this using the `exclude_if` validation rule. In this example, the `appointment_date` and `doctor_name` fields will not be validated if the `has_appointment` field has a value of `false`:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($data, [
    'has_appointment' => ['required', 'boolean'],
    'appointment_date' => ['exclude_if:has_appointment,false', 'required', 'date'],
    'doctor_name' => ['exclude_if:has_appointment,false', 'required', 'string'],
]);
```

Alternatively, you may use the `exclude_unless` rule to not validate a given field unless another field has a given value:

```php
$validator = Validator::make($data, [
    'has_appointment' => ['required', 'boolean'],
    'appointment_date' => ['exclude_unless:has_appointment,true', 'required', 'date'],
    'doctor_name' => ['exclude_unless:has_appointment,true', 'required', 'string'],
]);
```

##### Validating When Present

In some situations, you may wish to run validation checks against a field **only** if that field is present in the data being validated. To quickly accomplish this, add the `sometimes` rule to your rule list:

```php
$validator = Validator::make($data, [
    'email' => ['sometimes', 'required', 'email'],
]);
```

In the example above, the `email` field will only be validated if it is present in the `$data` array.

> **Note:**
> If you are attempting to validate a field that should always be present but may be empty, check out [this note on optional fields](#a-note-on-optional-fields).

##### Complex Conditional Validation

Sometimes you may wish to add validation rules based on more complex conditional logic. For example, you may wish to require a given field only if another field has a greater value than 100. Or, you may need two fields to have a given value only when another field is present. Adding these validation rules doesn't have to be a pain. First, create a `Validator` instance with your _static rules_ that never change:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'email' => ['required', 'email'],
    'games' => ['required', 'integer', 'min:0'],
]);
```

Let's assume our web application is for game collectors. If a game collector registers with our application and they own more than 100 games, we want them to explain why they own so many games. For example, perhaps they run a game resale shop, or maybe they just enjoy collecting games. To conditionally add this requirement, we can use the `sometimes` method on the `Validator` instance.

```php
use Illuminate\Support\Fluent;

$validator->sometimes('reason', ['required', 'max:500'], function (Fluent $input) {
    return $input->games >= 100;
});
```

The first argument passed to the `sometimes` method is the name of the field we are conditionally validating. The second argument is a list of the rules we want to add. If the closure passed as the third argument returns `true`, the rules will be added. This method makes it a breeze to build complex conditional validations. You may even add conditional validations for several fields at once:

```php
$validator->sometimes(['reason', 'cost'], 'required', function (Fluent $input) {
    return $input->games >= 100;
});
```

> **Note:**
> The `$input` parameter passed to your closure will be an instance of `Illuminate\Support\Fluent` and may be used to access your input and files under validation.

##### Complex Conditional Array Validation

Sometimes you may want to validate a field based on another field in the same nested array whose index you do not know. In these situations, you may allow your closure to receive a second argument which will be the current individual item in the array being validated:

```php
$input = [
    'channels' => [
        [
            'type' => 'email',
            'address' => 'abigail@example.com',
        ],
        [
            'type' => 'url',
            'address' => 'https://example.com',
        ],
    ],
];

$validator->sometimes('channels.*.address', 'email', function (Fluent $input, Fluent $item) {
    return $item->type === 'email';
});

$validator->sometimes('channels.*.address', 'url', function (Fluent $input, Fluent $item) {
    return $item->type !== 'email';
});
```

Like the `$input` parameter passed to the closure, the `$item` parameter is an instance of `Illuminate\Support\Fluent` when the attribute data is an array; otherwise, it is a string.

### Validating Arrays

As discussed in the [array validation rule documentation](#rule-array), the `array` rule accepts a list of allowed array keys. If any additional keys are present within the array, validation will fail:

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'user' => [
        'name' => 'Taylor Otwell',
        'username' => 'taylorotwell',
        'admin' => true,
    ],
];

Validator::make($input, [
    'user' => ['array:name,username'],
]);
```

In general, you should always specify the array keys that are allowed to be present within your array. Otherwise, the validator's `validate` and `validated` methods will return all of the validated data, including the array and all of its keys, even if those keys were not validated by other nested array validation rules.

#### Validating Nested Array Input

Validating nested array-based form input fields doesn't have to be a pain. You may use "dot notation" to validate attributes within an array. For example, if the incoming HTTP request contains a `photos[profile]` field, you may validate it like so:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'photos.profile' => ['required', 'image'],
]);
```

You may also validate each element of an array. For example, to validate that each email in a given array input field is unique, you may do the following:

```php
$validator = Validator::make($request->all(), [
    'users.*.email' => ['email', 'unique:users'],
    'users.*.first_name' => ['required_with:users.*.last_name'],
]);
```

Likewise, you may use the `*` character when specifying [custom validation messages in your language files](#custom-messages-for-specific-attributes), making it a breeze to use a single validation message for array-based fields:

```php
'custom' => [
    'users.*.email' => [
        'unique' => 'Each user must have a unique email address',
    ]
],
```

##### Accessing Nested Array Data

Sometimes you may need to access the value for a given nested array element when assigning validation rules to the attribute. You may accomplish this using the `Rule::forEach` method. The `forEach` method accepts a closure that will be invoked for each iteration of the array attribute under validation and will receive the attribute's value and explicit, fully-expanded attribute name. The closure should return an array of rules to assign to the array element:

```php
use App\Rules\HasPermission;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$validator = Validator::make($request->all(), [
    'companies.*.id' => Rule::forEach(function (string|null $value, string $attribute) {
        return [
            Rule::exists(Company::class, 'id'),
            new HasPermission('manage-company', $value),
        ];
    }),
]);
```

#### Error Message Indexes and Positions

When validating arrays, you may want to reference the index or position of a particular item that failed validation within the error message displayed by your application. To accomplish this, you may include the `:index` (starts from `0`), `:position` (starts from `1`), or `:ordinal-position` (starts from `1st`) placeholders within your [custom validation message](#manual-customizing-the-error-messages):

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'photos' => [
        [
            'name' => 'BeachVacation.jpg',
            'description' => 'A photo of my beach vacation!',
        ],
        [
            'name' => 'GrandCanyon.jpg',
            'description' => '',
        ],
    ],
];

Validator::validate($input, [
    'photos.*.description' => ['required'],
], [
    'photos.*.description.required' => 'Please describe photo #:position.',
]);
```

Given the example above, validation will fail and the user will be presented with the following error of _"Please describe photo #2."_

If necessary, you may reference more deeply nested indexes and positions via `second-index`, `second-position`, `third-index`, `third-position`, etc.

```php
'photos.*.attributes.*.string' => 'Invalid attribute for photo #:second-position.',
```

### Validating Files

Laravel provides a variety of validation rules that may be used to validate uploaded files, such as `mimes`, `image`, `min`, and `max`. While you are free to specify these rules individually when validating files, Laravel also offers a fluent file validation rule builder that you may find convenient:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'attachment' => [
        'required',
        File::types(['mp3', 'wav'])
            ->min(1024)
            ->max(12 * 1024),
    ],
]);
```

##### Validating File Types

Even though you only need to specify the extensions when invoking the `types` method, this method actually validates the MIME type of the file by reading the file's contents and guessing its MIME type. A full listing of MIME types and their corresponding extensions may be found at the following location:

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

##### Validating File Sizes

For convenience, minimum and maximum file sizes may be specified as a string with a suffix indicating the file size units. The `kb`, `mb`, `gb`, and `tb` suffixes are supported:

```php
File::types(['mp3', 'wav'])
    ->min('1kb')
    ->max('10mb');
```

##### Validating Image Files

If your application accepts images uploaded by your users, you may use the `File` rule's `image` constructor method to ensure that the file under validation is an image (jpg, jpeg, png, bmp, gif, webp, avif, heic, or heif).

In addition, the `dimensions` rule may be used to limit the dimensions of the image:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'photo' => [
        'required',
        File::image()
            ->min(1024)
            ->max(12 * 1024)
            ->dimensions(Rule::dimensions()->maxWidth(1000)->maxHeight(500)),
    ],
]);
```

> **Note:**
> More information regarding validating image dimensions may be found in the [dimension rule documentation](#rule-dimensions).

> **Warning:**
> By default, the `image` rule does not allow SVG files due to the possibility of XSS vulnerabilities. If you need to allow SVG files, you may pass `allowSvg: true` to the `image` rule: `File::image(allowSvg: true)`.

##### Validating Image Dimensions

You may also validate the dimensions of an image. For example, to validate that an uploaded image is at least 1000 pixels wide and 500 pixels tall, you may use the `dimensions` rule:

```php
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

File::image()->dimensions(
    Rule::dimensions()
        ->maxWidth(1000)
        ->maxHeight(500)
);
```

> **Note:**
> More information regarding validating image dimensions may be found in the [dimension rule documentation](#rule-dimensions).

### Validating Passwords

To ensure that passwords have an adequate level of complexity, you may use Laravel's `Password` rule object:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

$validator = Validator::make($request->all(), [
    'password' => ['required', 'confirmed', Password::min(8)],
]);
```

The `Password` rule object allows you to easily customize the password complexity requirements for your application, such as specifying that passwords require at least one letter, number, symbol, or characters with mixed casing:

```php
// Require at least 8 characters...
Password::min(8);

// Require at most 256 characters...
Password::min(16)->max(256);

// Require at least one letter...
Password::min(8)->letters();

// Require at least one uppercase and one lowercase letter...
Password::min(8)->mixedCase();

// Require at least one number...
Password::min(8)->numbers();

// Require at least one symbol...
Password::min(8)->symbols();
```

In addition, you may ensure that a password has not been compromised in a public password data breach leak using the `uncompromised` method:

```php
Password::min(8)->uncompromised();
```

Internally, the `Password` rule object uses the [k-Anonymity](https://en.wikipedia.org/wiki/K-anonymity) model to determine if a password has been leaked via the [haveibeenpwned.com](https://haveibeenpwned.com) service without sacrificing the user's privacy or security.

By default, if a password appears at least once in a data leak, it will be considered compromised. You can customize this threshold using the first argument of the `uncompromised` method:

```php
// Ensure the password appears no more than 3 times in the same data leak...
Password::min(8)->uncompromised(3);
```

Of course, you may chain all the methods in the examples above:

```php
Password::min(8)
    ->max(256)
    ->letters()
    ->mixedCase()
    ->numbers()
    ->symbols()
    ->uncompromised();
```

You may convert a `Password` rule object to a string suitable for the HTML `passwordrules` attribute using the `toPasswordRulesString` method:

```blade
<input
    type="password"
    name="password"
    autocomplete="new-password"
    passwordrules="{{ Password::defaults()->toPasswordRulesString() }}"
/>
```

##### Defining Default Password Rules

You may find it convenient to specify the default validation rules for passwords in a single location of your application. You can easily accomplish this using the `Password::defaults` method, which accepts a closure. The closure given to the `defaults` method should return the default configuration of the Password rule. Typically, the `defaults` rule should be called within the `boot` method of one of your application's service providers:

```php
use Illuminate\Validation\Rules\Password;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Password::defaults(function () {
        $rule = Password::min(8);

        return $this->app->isProduction()
            ? $rule->mixedCase()->uncompromised()
            : $rule;
    });
}
```

Then, when you would like to apply the default rules to a particular password undergoing validation, you may invoke the `defaults` method with no arguments:

```php
'password' => ['required', Password::defaults()],
```

Occasionally, you may want to attach additional validation rules to your default password validation rules. You may use the `rules` method to accomplish this:

```php
use App\Rules\ZxcvbnRule;

Password::defaults(function () {
    $rule = Password::min(8)->rules([new ZxcvbnRule]);

    // ...
});
```

### Custom Validation Rules

#### Using Rule Objects

Laravel provides a variety of helpful validation rules; however, you may wish to specify some of your own. One method of registering custom validation rules is using rule objects. To generate a new rule object, you may use the `make:rule` Artisan command. Let's use this command to generate a rule that verifies a string is uppercase. Laravel will place the new rule in the `app/Rules` directory. If this directory does not exist, Laravel will create it when you execute the Artisan command to create your rule:

```shell
php artisan make:rule Uppercase
```

Once the rule has been created, we are ready to define its behavior. A rule object contains a single method: `validate`. This method receives the attribute name, its value, and a callback that should be invoked on failure with the validation error message:

```php
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (strtoupper($value) !== $value) {
            $fail('The :attribute must be uppercase.');
        }
    }
}
```

Once the rule has been defined, you may attach it to a validator by passing an instance of the rule object with your other validation rules:

```php
use App\Rules\Uppercase;

$request->validate([
    'name' => ['required', 'string', new Uppercase],
]);
```

##### Translating Validation Messages

Instead of providing a literal error message to the `$fail` closure, you may also provide a [translation string key](https://laravel.com/docs/localization) and instruct Laravel to translate the error message:

```php
if (strtoupper($value) !== $value) {
    $fail('validation.uppercase')->translate();
}
```

If necessary, you may provide placeholder replacements and the preferred language as the first and second arguments to the `translate` method:

```php
$fail('validation.location')->translate([
    'value' => $this->value,
], 'fr');
```

##### Accessing Additional Data

If your custom validation rule class needs to access all of the other data undergoing validation, your rule class may implement the `Illuminate\Contracts\Validation\DataAwareRule` interface. This interface requires your class to define a `setData` method. This method will automatically be invoked by Laravel (before validation proceeds) with all of the data under validation:

```php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements DataAwareRule, ValidationRule
{
    /**
     * All of the data under validation.
     *
     * @var array<string, mixed>
     */
    protected $data = [];

    // ...

    /**
     * Set the data under validation.
     *
     * @param  array<string, mixed>  $data
     */
    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }
}
```

Or, if your validation rule requires access to the validator instance performing the validation, you may implement the `ValidatorAwareRule` interface:

```php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;
use Illuminate\Validation\Validator;

class Uppercase implements ValidationRule, ValidatorAwareRule
{
    /**
     * The validator instance.
     *
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    // ...

    /**
     * Set the current validator.
     */
    public function setValidator(Validator $validator): static
    {
        $this->validator = $validator;

        return $this;
    }
}
```

#### Using Closures

If you only need the functionality of a custom rule once throughout your application, you may use a closure instead of a rule object. The closure receives the attribute's name, the attribute's value, and a `$fail` callback that should be called if validation fails:

```php
use Illuminate\Support\Facades\Validator;
use Closure;

$validator = Validator::make($request->all(), [
    'title' => [
        'required',
        'max:255',
        function (string $attribute, mixed $value, Closure $fail) {
            if ($value === 'foo') {
                $fail("The {$attribute} is invalid.");
            }
        },
    ],
]);
```

#### Implicit Rules

By default, when an attribute being validated is not present or contains an empty string, normal validation rules, including custom rules, are not run. For example, the [unique](#rule-unique) rule will not be run against an empty string:

```php
use Illuminate\Support\Facades\Validator;

$rules = ['name' => ['unique:users,name']];

$input = ['name' => ''];

Validator::make($input, $rules)->passes(); // true
```

For a custom rule to run even when an attribute is empty, the rule must imply that the attribute is required. To quickly generate a new implicit rule object, you may use the `make:rule` Artisan command with the `--implicit` option:

```shell
php artisan make:rule Uppercase --implicit
```

> **Warning:**
> An "implicit" rule only _implies_ that the attribute is required. Whether it actually invalidates a missing or empty attribute is up to you.

## Database: Getting Started

> **Source:** [Database: Getting Started](https://laravel.com/docs/database) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

Almost every modern web application interacts with a database. Laravel makes interacting with databases extremely simple across a variety of supported databases using raw SQL, a [fluent query builder](https://laravel.com/docs/queries), and the [Eloquent ORM](https://laravel.com/docs/eloquent). Currently, Laravel provides first-party support for five databases:

<div class="content-list" markdown="1">

- MariaDB 10.3+ ([Version Policy](https://mariadb.org/about/#maintenance-policy))
- MySQL 5.7+ ([Version Policy](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 10.0+ ([Version Policy](https://www.postgresql.org/support/versioning/))
- SQLite 3.26.0+
- SQL Server 2017+ ([Version Policy](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

</div>

Additionally, MongoDB is supported via the `mongodb/laravel-mongodb` package, which is officially maintained by MongoDB. Check out the [Laravel MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/) documentation for more information.

#### Configuration

The configuration for Laravel's database services is located in your application's `config/database.php` configuration file. In this file, you may define all of your database connections, as well as specify which connection should be used by default. Most of the configuration options within this file are driven by the values of your application's environment variables. Examples for most of Laravel's supported database systems are provided in this file.

By default, Laravel's sample [environment configuration](https://laravel.com/docs/configuration#environment-configuration) is ready to use with [Laravel Sail](https://laravel.com/docs/sail), which is a Docker configuration for developing Laravel applications on your local machine. However, you are free to modify your database configuration as needed for your local database.

##### SQLite Configuration

SQLite databases are contained within a single file on your filesystem. You can create a new SQLite database using the `touch` command in your terminal: `touch database/database.sqlite`. After the database has been created, you may easily configure your environment variables to point to this database by placing the absolute path to the database in the `DB_DATABASE` environment variable:

```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

By default, foreign key constraints are enabled for SQLite connections. If you would like to disable them, you should set the `DB_FOREIGN_KEYS` environment variable to `false`:

```ini
DB_FOREIGN_KEYS=false
```

> **Note:**
> If you use the [Laravel installer](https://laravel.com/docs/installation#creating-a-laravel-project) to create your Laravel application and select SQLite as your database, Laravel will automatically create a `database/database.sqlite` file and run the default [database migrations](https://laravel.com/docs/migrations) for you.

##### Microsoft SQL Server Configuration

To use a Microsoft SQL Server database, you should ensure that you have the `sqlsrv` and `pdo_sqlsrv` PHP extensions installed as well as any dependencies they may require such as the Microsoft SQL ODBC driver.

##### Configuration Using URLs

Typically, database connections are configured using multiple configuration values such as `host`, `database`, `username`, `password`, etc. Each of these configuration values has its own corresponding environment variable. This means that when configuring your database connection information on a production server, you need to manage several environment variables.

Some managed database providers such as AWS and Heroku provide a single database "URL" that contains all of the connection information for the database in a single string. An example database URL may look something like the following:

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

These URLs typically follow a standard schema convention:

```html
driver://username:password@host:port/database?options
```

For convenience, Laravel supports these URLs as an alternative to configuring your database with multiple configuration options. If the `url` (or corresponding `DB_URL` environment variable) configuration option is present, it will be used to extract the database connection and credential information.

#### Read and Write Connections

Sometimes you may wish to use one database connection for SELECT statements, and another for INSERT, UPDATE, and DELETE statements. Laravel makes this a breeze, and the proper connections will always be used whether you are using raw queries, the query builder, or the Eloquent ORM.

To see how read / write connections should be configured, let's look at this example:

```php
'mysql' => [
    'driver' => 'mysql',

    'read' => [
        'host' => [
            '192.168.1.1',
            '196.168.1.2',
        ],
    ],
    'write' => [
        'host' => [
            '192.168.1.3',
        ],
    ],
    'sticky' => true,

    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'unix_socket' => env('DB_SOCKET', ''),
    'charset' => env('DB_CHARSET', 'utf8mb4'),
    'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
    'prefix' => '',
    'prefix_indexes' => true,
    'strict' => true,
    'engine' => null,
    'options' => extension_loaded('pdo_mysql') ? array_filter([
        (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
    ]) : [],
],
```

Note that three keys have been added to the configuration array: `read`, `write` and `sticky`. The `read` and `write` keys have array values containing a single key: `host`. The rest of the database options for the `read` and `write` connections will be merged from the main `mysql` configuration array.

You only need to place items in the `read` and `write` arrays if you wish to override the values from the main `mysql` array. So, in this case, `192.168.1.1` will be used as the host for the "read" connection, while `192.168.1.3` will be used for the "write" connection. The database credentials, prefix, character set, and all other options in the main `mysql` array will be shared across both connections. When multiple values exist in the `host` configuration array, a database host will be randomly chosen for each request.

##### The `sticky` Option

The `sticky` option is an *optional* value that can be used to allow the immediate reading of records that have been written to the database during the current request cycle. If the `sticky` option is enabled and a "write" operation has been performed against the database during the current request cycle, any further "read" operations will use the "write" connection. This ensures that any data written during the request cycle can be immediately read back from the database during that same request. It is up to you to decide if this is the desired behavior for your application.

#### Pooled PostgreSQL Connections

Many managed PostgreSQL providers offer transaction-mode connection pooling through services such as PgBouncer or connection proxying. These poolers are ideal for application queries, but some schema operations, migrations, and maintenance commands require a direct database connection.

To use a transaction pooler with PostgreSQL, configure the pooled connection as usual and provide direct connection details via the `direct` configuration option:

```php
'pgsql' => [
    'driver' => 'pgsql',
    // ...
    'pooled' => env('DB_POOLED', false),
    'direct' => array_filter([
        'host' => env('DB_DIRECT_HOST'),
        'port' => env('DB_DIRECT_PORT'),
        'username' => env('DB_DIRECT_USERNAME'),
        'password' => env('DB_DIRECT_PASSWORD'),
        'sslmode' => env('DB_DIRECT_SSLMODE'),
    ]),
],
```

When a PostgreSQL connection is configured as pooled, Laravel automatically enables emulated prepares for the pooled connection. The direct connection inherits any options not explicitly defined in the `direct` configuration and uses native prepares by default.

Laravel automatically uses the direct connection for migrations, schema dumps and restores, `db:wipe`, `db:show`, and `db:table`. The `db` command also uses the direct connection by default when pooled mode is enabled and a direct connection is configured; you may pass the `--pooled` option to connect to the pooled connection instead:

```shell
php artisan db --pooled
```

If you need to explicitly use the direct connection in your application, append the `::direct` suffix to the connection name:

```php
DB::connection('pgsql::direct')->statement('create extension if not exists "uuid-ossp"');
```

### Running SQL Queries

Once you have configured your database connection, you may run queries using the `DB` facade. The `DB` facade provides methods for each type of query: `select`, `update`, `insert`, `delete`, and `statement`.

##### Running a Select Query

To run a basic SELECT query, you may use the `select` method on the `DB` facade:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show a list of all of the application's users.
     */
    public function index(): View
    {
        $users = DB::select('select * from users where active = ?', [1]);

        return view('user.index', ['users' => $users]);
    }
}
```

The first argument passed to the `select` method is the SQL query, while the second argument is any parameter bindings that need to be bound to the query. Typically, these are the values of the `where` clause constraints. Parameter binding provides protection against SQL injection.

The `select` method will always return an `array` of results. Each result within the array will be a PHP `stdClass` object representing a record from the database:

```php
use Illuminate\Support\Facades\DB;

$users = DB::select('select * from users');

foreach ($users as $user) {
    echo $user->name;
}
```

##### Selecting Scalar Values

Sometimes your database query may result in a single, scalar value. Instead of being required to retrieve the query's scalar result from a record object, Laravel allows you to retrieve this value directly using the `scalar` method:

```php
$burgers = DB::scalar(
    "select count(case when food = 'burger' then 1 end) as burgers from menu"
);
```

##### Selecting Multiple Result Sets

If your application calls stored procedures that return multiple result sets, you may use the `selectResultSets` method to retrieve all of the result sets returned by the stored procedure:

```php
[$options, $notifications] = DB::selectResultSets(
    "CALL get_user_options_and_notifications(?)", [$request->user()->id]
);
```

##### Using Named Bindings

Instead of using `?` to represent your parameter bindings, you may execute a query using named bindings:

```php
$results = DB::select('select * from users where id = :id', ['id' => 1]);
```

##### Running an Insert Statement

To execute an `insert` statement, you may use the `insert` method on the `DB` facade. Like `select`, this method accepts the SQL query as its first argument and bindings as its second argument:

```php
use Illuminate\Support\Facades\DB;

DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);
```

##### Running an Update Statement

The `update` method should be used to update existing records in the database. The number of rows affected by the statement is returned by the method:

```php
use Illuminate\Support\Facades\DB;

$affected = DB::update(
    'update users set votes = 100 where name = ?',
    ['Anita']
);
```

##### Running a Delete Statement

The `delete` method should be used to delete records from the database. Like `update`, the number of rows affected will be returned by the method:

```php
use Illuminate\Support\Facades\DB;

$deleted = DB::delete('delete from users');
```

##### Running a General Statement

Some database statements do not return any value. For these types of operations, you may use the `statement` method on the `DB` facade:

```php
DB::statement('drop table users');
```

##### Running an Unprepared Statement

Sometimes you may want to execute an SQL statement without binding any values. You may use the `DB` facade's `unprepared` method to accomplish this:

```php
DB::unprepared('update users set votes = 100 where name = "Dries"');
```

> **Warning:**
> Since unprepared statements do not bind parameters, they may be vulnerable to SQL injection. You should never allow user controlled values within an unprepared statement.

##### Implicit Commits

When using the `DB` facade's `statement` and `unprepared` methods within transactions you must be careful to avoid statements that cause [implicit commits](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html). These statements will cause the database engine to indirectly commit the entire transaction, leaving Laravel unaware of the database's transaction level. An example of such a statement is creating a database table:

```php
DB::unprepared('create table a (col varchar(1) null)');
```

Please refer to the MySQL manual for [a list of all statements](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html) that trigger implicit commits.

#### Using Multiple Database Connections

If your application defines multiple connections in your `config/database.php` configuration file, you may access each connection via the `connection` method provided by the `DB` facade. The connection name passed to the `connection` method should correspond to one of the connections listed in your `config/database.php` configuration file or configured at runtime using the `config` helper:

```php
use Illuminate\Support\Facades\DB;

$users = DB::connection('sqlite')->select(/* ... */);
```

You may access the raw, underlying PDO instance of a connection using the `getPdo` method on a connection instance:

```php
$pdo = DB::connection()->getPdo();
```

#### Listening for Query Events

If you would like to specify a closure that is invoked for each SQL query executed by your application, you may use the `DB` facade's `listen` method. This method can be useful for logging queries or debugging. You may register your query listener closure in the `boot` method of a [service provider](https://laravel.com/docs/providers):

```php
<?php

namespace App\Providers;

use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        DB::listen(function (QueryExecuted $query) {
            // $query->sql;
            // $query->bindings;
            // $query->time;
            // $query->toRawSql();
        });
    }
}
```

#### Monitoring Cumulative Query Time

A common performance bottleneck of modern web applications is the amount of time they spend querying databases. Thankfully, Laravel can invoke a closure or callback of your choice when it spends too much time querying the database during a single request. To get started, provide a query time threshold (in milliseconds) and closure to the `whenQueryingForLongerThan` method. You may invoke this method in the `boot` method of a [service provider](https://laravel.com/docs/providers):

```php
<?php

namespace App\Providers;

use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Events\QueryExecuted;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        DB::whenQueryingForLongerThan(500, function (Connection $connection, QueryExecuted $event) {
            // Notify development team...
        });
    }
}
```

### Database Transactions

You may use the `transaction` method provided by the `DB` facade to run a set of operations within a database transaction. If an exception is thrown within the transaction closure, the transaction will automatically be rolled back and the exception is re-thrown. If the closure executes successfully, the transaction will automatically be committed. You don't need to worry about manually rolling back or committing while using the `transaction` method:

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
});
```

##### Handling Deadlocks

The `transaction` method accepts an optional second argument which defines the number of times a transaction should be retried when a deadlock occurs. Once these attempts have been exhausted, an exception will be thrown:

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
}, attempts: 5);
```

##### Manually Using Transactions

If you would like to begin a transaction manually and have complete control over rollbacks and commits, you may use the `beginTransaction` method provided by the `DB` facade:

```php
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
```

You can rollback the transaction via the `rollBack` method:

```php
DB::rollBack();
```

Lastly, you can commit a transaction via the `commit` method:

```php
DB::commit();
```

> **Note:**
> The `DB` facade's transaction methods control the transactions for both the [query builder](https://laravel.com/docs/queries) and [Eloquent ORM](https://laravel.com/docs/eloquent).

### Connecting to the Database CLI

If you would like to connect to your database's CLI, you may use the `db` Artisan command:

```shell
php artisan db
```

If needed, you may specify a database connection name to connect to a database connection that is not the default connection:

```shell
php artisan db mysql
```

### Inspecting Your Databases

Using the `db:show` and `db:table` Artisan commands, you can get valuable insight into your database and its associated tables. To see an overview of your database, including its size, type, number of open connections, and a summary of its tables, you may use the `db:show` command:

```shell
php artisan db:show
```

You may specify which database connection should be inspected by providing the database connection name to the command via the `--database` option:

```shell
php artisan db:show --database=pgsql
```

If you would like to include table row counts and database view details within the output of the command, you may provide the `--counts` and `--views` options, respectively. On large databases, retrieving row counts and view details can be slow:

```shell
php artisan db:show --counts --views
```

In addition, you may use the following `Schema` methods to inspect your database:

```php
use Illuminate\Support\Facades\Schema;

$tables = Schema::getTables();
$views = Schema::getViews();
$columns = Schema::getColumns('users');
$indexes = Schema::getIndexes('users');
$foreignKeys = Schema::getForeignKeys('users');
```

If you would like to inspect a database connection that is not your application's default connection, you may use the `connection` method:

```php
$columns = Schema::connection('sqlite')->getColumns('users');
```

##### Table Overview

If you would like to get an overview of an individual table within your database, you may execute the `db:table` Artisan command. This command provides a general overview of a database table, including its columns, types, attributes, keys, and indexes:

```shell
php artisan db:table users
```

### Monitoring Your Databases

Using the `db:monitor` Artisan command, you can instruct Laravel to dispatch an `Illuminate\Database\Events\DatabaseBusy` event if your database is managing more than a specified number of open connections.

To get started, you should schedule the `db:monitor` command to [run every minute](https://laravel.com/docs/scheduling). The command accepts the names of the database connection configurations that you wish to monitor as well as the maximum number of open connections that should be tolerated before dispatching an event:

```shell
php artisan db:monitor --databases=mysql,pgsql --max=100
```

Scheduling this command alone is not enough to trigger a notification alerting you of the number of open connections. When the command encounters a database that has an open connection count that exceeds your threshold, a `DatabaseBusy` event will be dispatched. You should listen for this event within your application's `AppServiceProvider` in order to send a notification to you or your development team:

```php
use App\Notifications\DatabaseApproachingMaxConnections;
use Illuminate\Database\Events\DatabaseBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(function (DatabaseBusy $event) {
        Notification::route('mail', 'dev@example.com')
            ->notify(new DatabaseApproachingMaxConnections(
                $event->connectionName,
                $event->connections
            ));
    });
}
```

## Database: Query Builder

> **Source:** [Database: Query Builder](https://laravel.com/docs/queries) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

Laravel's database query builder provides a convenient, fluent interface to creating and running database queries. It can be used to perform most database operations in your application and works perfectly with all of Laravel's supported database systems.

The Laravel query builder uses PDO parameter binding to protect your application against SQL injection attacks. There is no need to clean or sanitize strings passed to the query builder as query bindings.

> **Warning:**
> PDO does not support binding column names. Therefore, you should never allow user input to dictate the column names referenced by your queries, including "order by" columns.

### Running Database Queries

##### Retrieving All Rows From a Table

You may use the `table` method provided by the `DB` facade to begin a query. The `table` method returns a fluent query builder instance for the given table, allowing you to chain more constraints onto the query and then finally retrieve the results of the query using the `get` method:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show a list of all of the application's users.
     */
    public function index(): View
    {
        $users = DB::table('users')->get();

        return view('user.index', ['users' => $users]);
    }
}
```

The `get` method returns an `Illuminate\Support\Collection` instance containing the results of the query where each result is an instance of the PHP `stdClass` object. You may access each column's value by accessing the column as a property of the object:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->get();

foreach ($users as $user) {
    echo $user->name;
}
```

> **Note:**
> Laravel collections provide a variety of extremely powerful methods for mapping and reducing data. For more information on Laravel collections, check out the [collection documentation](https://laravel.com/docs/collections).

##### Retrieving a Single Row / Column From a Table

If you just need to retrieve a single row from a database table, you may use the `DB` facade's `first` method. This method will return a single `stdClass` object:

```php
$user = DB::table('users')->where('name', 'John')->first();

return $user->email;
```

If you would like to retrieve a single row from a database table, but throw an `Illuminate\Database\RecordNotFoundException` if no matching row is found, you may use the `firstOrFail` method. If the `RecordNotFoundException` is not caught, a 404 HTTP response is automatically sent back to the client:

```php
$user = DB::table('users')->where('name', 'John')->firstOrFail();
```

If you don't need an entire row, you may extract a single value from a record using the `value` method. This method will return the value of the column directly:

```php
$email = DB::table('users')->where('name', 'John')->value('email');
```

To retrieve a single row by its `id` column value, use the `find` method:

```php
$user = DB::table('users')->find(3);
```

##### Retrieving a List of Column Values

If you would like to retrieve an `Illuminate\Support\Collection` instance containing the values of a single column, you may use the `pluck` method. In this example, we'll retrieve a collection of user titles:

```php
use Illuminate\Support\Facades\DB;

$titles = DB::table('users')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

You may specify the column that the resulting collection should use as its keys by providing a second argument to the `pluck` method:

```php
$titles = DB::table('users')->pluck('title', 'name');

foreach ($titles as $name => $title) {
    echo $title;
}
```

#### Chunking Results

If you need to work with thousands of database records, consider using the `chunk` method provided by the `DB` facade. This method retrieves a small chunk of results at a time and feeds each chunk into a closure for processing. For example, let's retrieve the entire `users` table in chunks of 100 records at a time:

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    foreach ($users as $user) {
        // ...
    }
});
```

You may stop further chunks from being processed by returning `false` from the closure:

```php
DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    // Process the records...

    return false;
});
```

If you are updating database records while chunking results, your chunk results could change in unexpected ways. If you plan to update the retrieved records while chunking, it is always best to use the `chunkById` method instead. This method will automatically paginate the results based on the record's primary key:

```php
DB::table('users')->where('active', false)
    ->chunkById(100, function (Collection $users) {
        foreach ($users as $user) {
            DB::table('users')
                ->where('id', $user->id)
                ->update(['active' => true]);
        }
    });
```

Since the `chunkById` and `lazyById` methods add their own "where" conditions to the query being executed, you should typically [logically group](#logical-grouping) your own conditions within a closure:

```php
DB::table('users')->where(function ($query) {
    $query->where('credits', 1)->orWhere('credits', 2);
})->chunkById(100, function (Collection $users) {
    foreach ($users as $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['credits' => 3]);
    }
});
```

> **Warning:**
> When updating or deleting records inside the chunk callback, any changes to the primary key or foreign keys could affect the chunk query. This could potentially result in records not being included in the chunked results.

#### Streaming Results Lazily

The `lazy` method works similarly to [the chunk method](#chunking-results) in the sense that it executes the query in chunks. However, instead of passing each chunk into a callback, the `lazy()` method returns a [LazyCollection](https://laravel.com/docs/collections#lazy-collections), which lets you interact with the results as a single stream:

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```

Once again, if you plan to update the retrieved records while iterating over them, it is best to use the `lazyById` or `lazyByIdDesc` methods instead. These methods will automatically paginate the results based on the record's primary key:

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> **Warning:**
> When updating or deleting records while iterating over them, any changes to the primary key or foreign keys could affect the chunk query. This could potentially result in records not being included in the results.

#### Aggregates

The query builder also provides a variety of methods for retrieving aggregate values like `count`, `max`, `min`, `avg`, and `sum`. You may call any of these methods after constructing your query:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->count();

$price = DB::table('orders')->max('price');
```

Of course, you may combine these methods with other clauses to fine-tune how your aggregate value is calculated:

```php
$price = DB::table('orders')
    ->where('finalized', 1)
    ->avg('price');
```

##### Determining if Records Exist

Instead of using the `count` method to determine if any records exist that match your query's constraints, you may use the `exists` and `doesntExist` methods:

```php
if (DB::table('orders')->where('finalized', 1)->exists()) {
    // ...
}

if (DB::table('orders')->where('finalized', 1)->doesntExist()) {
    // ...
}
```

### Select Statements

##### Specifying a Select Clause

You may not always want to select all columns from a database table. Using the `select` method, you can specify a custom "select" clause for the query:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->select('name', 'email as user_email')
    ->get();
```

The `distinct` method allows you to force the query to return distinct results:

```php
$users = DB::table('users')->distinct()->get();
```

If you already have a query builder instance and you wish to add a column to its existing select clause, you may use the `addSelect` method:

```php
$query = DB::table('users')->select('name');

$users = $query->addSelect('age')->get();
```

### Raw Expressions

Sometimes you may need to insert an arbitrary string into a query. To create a raw string expression, you may use the `raw` method provided by the `DB` facade:

```php
$users = DB::table('users')
    ->select(DB::raw('count(*) as user_count, status'))
    ->where('status', '<>', 1)
    ->groupBy('status')
    ->get();
```

> **Warning:**
> Raw statements will be injected into the query as strings, so you should be extremely careful to avoid creating SQL injection vulnerabilities.

#### Raw Methods

Instead of using the `DB::raw` method, you may also use the following methods to insert a raw expression into various parts of your query. **Remember, Laravel cannot guarantee that any query using raw expressions is protected against SQL injection vulnerabilities.**

##### `selectRaw`

The `selectRaw` method can be used in place of `addSelect(DB::raw(/* ... */))`. This method accepts an optional array of bindings as its second argument:

```php
$orders = DB::table('orders')
    ->selectRaw('price * ? as price_with_tax', [1.0825])
    ->get();
```

##### `whereRaw / orWhereRaw`

The `whereRaw` and `orWhereRaw` methods can be used to inject a raw "where" clause into your query. These methods accept an optional array of bindings as their second argument:

```php
$orders = DB::table('orders')
    ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
    ->get();
```

##### `havingRaw / orHavingRaw`

The `havingRaw` and `orHavingRaw` methods may be used to provide a raw string as the value of the "having" clause. These methods accept an optional array of bindings as their second argument:

```php
$orders = DB::table('orders')
    ->select('department', DB::raw('SUM(price) as total_sales'))
    ->groupBy('department')
    ->havingRaw('SUM(price) > ?', [2500])
    ->get();
```

##### `orderByRaw`

The `orderByRaw` method may be used to provide a raw string as the value of the "order by" clause:

```php
$orders = DB::table('orders')
    ->orderByRaw('updated_at - created_at DESC')
    ->get();
```

##### `groupByRaw`

The `groupByRaw` method may be used to provide a raw string as the value of the `group by` clause:

```php
$orders = DB::table('orders')
    ->select('city', 'state')
    ->groupByRaw('city, state')
    ->get();
```

### Joins

##### Inner Join Clause

The query builder may also be used to add join clauses to your queries. To perform a basic "inner join", you may use the `join` method on a query builder instance. The first argument passed to the `join` method is the name of the table you need to join to, while the remaining arguments specify the column constraints for the join. You may even join multiple tables in a single query:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->join('contacts', 'users.id', '=', 'contacts.user_id')
    ->join('orders', 'users.id', '=', 'orders.user_id')
    ->select('users.*', 'contacts.phone', 'orders.price')
    ->get();
```

##### Left Join / Right Join Clause

If you would like to perform a "left join" or "right join" instead of an "inner join", use the `leftJoin` or `rightJoin` methods. These methods have the same signature as the `join` method:

```php
$users = DB::table('users')
    ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();

$users = DB::table('users')
    ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();
```

##### Cross Join Clause

You may use the `crossJoin` method to perform a "cross join". Cross joins generate a cartesian product between the first table and the joined table:

```php
$sizes = DB::table('sizes')
    ->crossJoin('colors')
    ->get();
```

##### Advanced Join Clauses

You may also specify more advanced join clauses. To get started, pass a closure as the second argument to the `join` method. The closure will receive a `Illuminate\Database\Query\JoinClause` instance which allows you to specify constraints on the "join" clause:

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
    })
    ->get();
```

If you would like to use a "where" clause on your joins, you may use the `where` and `orWhere` methods provided by the `JoinClause` instance. Instead of comparing two columns, these methods will compare the column against a value:

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')
            ->where('contacts.user_id', '>', 5);
    })
    ->get();
```

##### Subquery Joins

You may use the `joinSub`, `leftJoinSub`, and `rightJoinSub` methods to join a query to a subquery. Each of these methods receives three arguments: the subquery, its table alias, and a closure that defines the related columns. In this example, we will retrieve a collection of users where each user record also contains the `created_at` timestamp of the user's most recently published blog post:

```php
$latestPosts = DB::table('posts')
    ->select('user_id', DB::raw('MAX(created_at) as last_post_created_at'))
    ->where('is_published', true)
    ->groupBy('user_id');

$users = DB::table('users')
    ->joinSub($latestPosts, 'latest_posts', function (JoinClause $join) {
        $join->on('users.id', '=', 'latest_posts.user_id');
    })->get();
```

##### Lateral Joins

> **Warning:**
> Lateral joins are currently supported by PostgreSQL, MySQL >= 8.0.14, and SQL Server.

You may use the `joinLateral` and `leftJoinLateral` methods to perform a "lateral join" with a subquery. Each of these methods receives two arguments: the subquery and its table alias. The join condition(s) should be specified within the `where` clause of the given subquery. Lateral joins are evaluated for each row and can reference columns outside the subquery.

In this example, we will retrieve a collection of users as well as the user's three most recent blog posts. Each user can produce up to three rows in the result set: one for each of their most recent blog posts. The join condition is specified with a `whereColumn` clause within the subquery, referencing the current user row:

```php
$latestPosts = DB::table('posts')
    ->select('id as post_id', 'title as post_title', 'created_at as post_created_at')
    ->whereColumn('user_id', 'users.id')
    ->orderBy('created_at', 'desc')
    ->limit(3);

$users = DB::table('users')
    ->joinLateral($latestPosts, 'latest_posts')
    ->get();
```

### Unions

The query builder also provides a convenient method to "union" two or more queries together. For example, you may create an initial query and use the `union` method to union it with more queries:

```php
use Illuminate\Support\Facades\DB;

$usersWithoutFirstName = DB::table('users')
    ->whereNull('first_name');

$users = DB::table('users')
    ->whereNull('last_name')
    ->union($usersWithoutFirstName)
    ->get();
```

In addition to the `union` method, the query builder provides a `unionAll` method. Queries that are combined using the `unionAll` method will not have their duplicate results removed. The `unionAll` method has the same method signature as the `union` method.

### Basic Where Clauses

#### Where Clauses

You may use the query builder's `where` method to add "where" clauses to the query. The most basic call to the `where` method requires three arguments. The first argument is the name of the column. The second argument is an operator, which can be any of the database's supported operators. The third argument is the value to compare against the column's value.

For example, the following query retrieves users where the value of the `votes` column is equal to `100` and the value of the `age` column is greater than `35`:

```php
$users = DB::table('users')
    ->where('votes', '=', 100)
    ->where('age', '>', 35)
    ->get();
```

For convenience, if you want to verify that a column is `=` to a given value, you may pass the value as the second argument to the `where` method. Laravel will assume you would like to use the `=` operator:

```php
$users = DB::table('users')->where('votes', 100)->get();
```

You may also provide an associative array to the `where` method to quickly query against multiple columns:

```php
$users = DB::table('users')->where([
    'first_name' => 'Jane',
    'last_name' => 'Doe',
])->get();
```

As previously mentioned, you may use any operator that is supported by your database system:

```php
$users = DB::table('users')
    ->where('votes', '>=', 100)
    ->get();

$users = DB::table('users')
    ->where('votes', '<>', 100)
    ->get();

$users = DB::table('users')
    ->where('name', 'like', 'T%')
    ->get();
```

You may also pass an array of conditions to the `where` function. Each element of the array should be an array containing the three arguments typically passed to the `where` method:

```php
$users = DB::table('users')->where([
    ['status', '=', '1'],
    ['subscribed', '<>', '1'],
])->get();
```

> **Warning:**
> PDO does not support binding column names. Therefore, you should never allow user input to dictate the column names referenced by your queries, including "order by" columns.

> **Warning:**
> MySQL and MariaDB automatically typecast strings to integers in string-number comparisons. In this process, non-numeric strings are converted to `0`, which can lead to unexpected results. For example, if your table has a `secret` column with a value of `aaa` and you run `User::where('secret', 0)`, that row will be returned. To avoid this, ensure all values are typecast to their appropriate types before using them in queries.

#### Or Where Clauses

When chaining together calls to the query builder's `where` method, the "where" clauses will be joined together using the `and` operator. However, you may use the `orWhere` method to join a clause to the query using the `or` operator. The `orWhere` method accepts the same arguments as the `where` method:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere('name', 'John')
    ->get();
```

If you need to group an "or" condition within parentheses, you may pass a closure as the first argument to the `orWhere` method:

```php
use Illuminate\Database\Query\Builder;

$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere(function (Builder $query) {
        $query->where('name', 'Abigail')
            ->where('votes', '>', 50);
        })
    ->get();
```

The example above will produce the following SQL:

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> **Warning:**
> You should always group `orWhere` calls in order to avoid unexpected behavior when global scopes are applied.

#### Where Not Clauses

The `whereNot` and `orWhereNot` methods may be used to negate a given group of query constraints. For example, the following query excludes products that are on clearance or which have a price that is less than ten:

```php
$products = DB::table('products')
    ->whereNot(function (Builder $query) {
        $query->where('clearance', true)
            ->orWhere('price', '<', 10);
        })
    ->get();
```

#### Where Any / All / None Clauses

Sometimes you may need to apply the same query constraints to multiple columns. For example, you may want to retrieve all records where any columns in a given list are `LIKE` a given value. You may accomplish this using the `whereAny` method:

```php
$users = DB::table('users')
    ->where('active', true)
    ->whereAny([
        'name',
        'email',
        'phone',
    ], 'like', 'Example%')
    ->get();
```

The query above will result in the following SQL:

```sql
SELECT *
FROM users
WHERE active = true AND (
    name LIKE 'Example%' OR
    email LIKE 'Example%' OR
    phone LIKE 'Example%'
)
```

Similarly, the `whereAll` method may be used to retrieve records where all of the given columns match a given constraint:

```php
$posts = DB::table('posts')
    ->where('published', true)
    ->whereAll([
        'title',
        'content',
    ], 'like', '%Laravel%')
    ->get();
```

The query above will result in the following SQL:

```sql
SELECT *
FROM posts
WHERE published = true AND (
    title LIKE '%Laravel%' AND
    content LIKE '%Laravel%'
)
```

The `whereNone` method may be used to retrieve records where none of the given columns match a given constraint:

```php
$albums = DB::table('albums')
    ->where('published', true)
    ->whereNone([
        'title',
        'lyrics',
        'tags',
    ], 'like', '%explicit%')
    ->get();
```

The query above will result in the following SQL:

```sql
SELECT *
FROM albums
WHERE published = true AND NOT (
    title LIKE '%explicit%' OR
    lyrics LIKE '%explicit%' OR
    tags LIKE '%explicit%'
)
```

#### JSON Where Clauses

Laravel also supports querying JSON column types on databases that provide support for JSON column types. Currently, this includes MariaDB 10.3+, MySQL 8.0+, PostgreSQL 12.0+, SQL Server 2017+, and SQLite 3.39.0+. To query a JSON column, use the `->` operator:

```php
$users = DB::table('users')
    ->where('preferences->dining->meal', 'salad')
    ->get();

$users = DB::table('users')
    ->whereIn('preferences->dining->meal', ['pasta', 'salad', 'sandwiches'])
    ->get();
```

You may use the `whereJsonContains` and `whereJsonDoesntContain` methods to query JSON arrays:

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', 'en')
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContain('options->languages', 'en')
    ->get();
```

If your application uses the MariaDB, MySQL, or PostgreSQL databases, you may pass an array of values to the `whereJsonContains` and `whereJsonDoesntContain` methods:

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', ['en', 'de'])
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContain('options->languages', ['en', 'de'])
    ->get();
```

In addition, you may use the `whereJsonContainsKey` or `whereJsonDoesntContainKey` methods to retrieve the results that include or do not include a JSON key:

```php
$users = DB::table('users')
    ->whereJsonContainsKey('preferences->dietary_requirements')
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContainKey('preferences->dietary_requirements')
    ->get();
```

Finally, you may use `whereJsonLength` method to query JSON arrays by their length:

```php
$users = DB::table('users')
    ->whereJsonLength('options->languages', 0)
    ->get();

$users = DB::table('users')
    ->whereJsonLength('options->languages', '>', 1)
    ->get();
```

#### Additional Where Clauses

**whereLike / orWhereLike / whereNotLike / orWhereNotLike**

The `whereLike` method allows you to add "LIKE" clauses to your query for pattern matching. These methods provide a database-agnostic way of performing string matching queries, with the ability to toggle case-sensitivity. By default, string matching is case-insensitive:

```php
$users = DB::table('users')
    ->whereLike('name', '%John%')
    ->get();
```

You can enable a case-sensitive search via the `caseSensitive` argument:

```php
$users = DB::table('users')
    ->whereLike('name', '%John%', caseSensitive: true)
    ->get();
```

The `orWhereLike` method allows you to add an "or" clause with a LIKE condition:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereLike('name', '%John%')
    ->get();
```

The `whereNotLike` method allows you to add "NOT LIKE" clauses to your query:

```php
$users = DB::table('users')
    ->whereNotLike('name', '%John%')
    ->get();
```

Similarly, you can use `orWhereNotLike` to add an "or" clause with a NOT LIKE condition:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereNotLike('name', '%John%')
    ->get();
```

> **Warning:**
> The `whereLike` case-sensitive search option is currently not supported on SQL Server.

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

The `whereIn` method verifies that a given column's value is contained within the given array:

```php
$users = DB::table('users')
    ->whereIn('id', [1, 2, 3])
    ->get();
```

The `whereNotIn` method verifies that the given column's value is not contained in the given array:

```php
$users = DB::table('users')
    ->whereNotIn('id', [1, 2, 3])
    ->get();
```

You may also provide a query object as the `whereIn` method's second argument:

```php
$activeUsers = DB::table('users')->select('id')->where('is_active', 1);

$comments = DB::table('comments')
    ->whereIn('user_id', $activeUsers)
    ->get();
```

The example above will produce the following SQL:

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

> **Warning:**
> If you are adding a large array of integer bindings to your query, the `whereIntegerInRaw` or `whereIntegerNotInRaw` methods may be used to greatly reduce your memory usage.

**whereBetween / orWhereBetween**

The `whereBetween` method verifies that a column's value is between two values:

```php
$users = DB::table('users')
    ->whereBetween('votes', [1, 100])
    ->get();
```

**whereNotBetween / orWhereNotBetween**

The `whereNotBetween` method verifies that a column's value lies outside of two values:

```php
$users = DB::table('users')
    ->whereNotBetween('votes', [1, 100])
    ->get();
```

**whereBetweenColumns / whereNotBetweenColumns / orWhereBetweenColumns / orWhereNotBetweenColumns**

The `whereBetweenColumns` method verifies that a column's value is between the two values of two columns in the same table row:

```php
$patients = DB::table('patients')
    ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

The `whereNotBetweenColumns` method verifies that a column's value lies outside the two values of two columns in the same table row:

```php
$patients = DB::table('patients')
    ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

**whereValueBetween / whereValueNotBetween / orWhereValueBetween / orWhereValueNotBetween**

The `whereValueBetween` method verifies that a given value is between the values of two columns of the same type in the same table row:

```php
$products = DB::table('products')
    ->whereValueBetween(100, ['min_price', 'max_price'])
    ->get();
```

The `whereValueNotBetween` method verifies that a value lies outside the values of two columns in the same table row:

```php
$products = DB::table('products')
    ->whereValueNotBetween(100, ['min_price', 'max_price'])
    ->get();
```

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

The `whereNull` method verifies that the value of the given column is `NULL`:

```php
$users = DB::table('users')
    ->whereNull('updated_at')
    ->get();
```

The `whereNotNull` method verifies that the column's value is not `NULL`:

```php
$users = DB::table('users')
    ->whereNotNull('updated_at')
    ->get();
```

**whereNullSafeEquals / orWhereNullSafeEquals**

The `whereNullSafeEquals` and `orWhereNullSafeEquals` methods may be used to compare a column's value against a given value while treating two `NULL` values as equal:

```php
$lastLoginIp = $request->input('last_login_ip');

$users = DB::table('users')
    ->whereNullSafeEquals('last_login_ip', $lastLoginIp)
    ->get();
```

**whereDate / whereMonth / whereDay / whereYear / whereTime**

The `whereDate` method may be used to compare a column's value against a date:

```php
$users = DB::table('users')
    ->whereDate('created_at', '2016-12-31')
    ->get();
```

The `whereMonth` method may be used to compare a column's value against a specific month:

```php
$users = DB::table('users')
    ->whereMonth('created_at', '12')
    ->get();
```

The `whereDay` method may be used to compare a column's value against a specific day of the month:

```php
$users = DB::table('users')
    ->whereDay('created_at', '31')
    ->get();
```

The `whereYear` method may be used to compare a column's value against a specific year:

```php
$users = DB::table('users')
    ->whereYear('created_at', '2016')
    ->get();
```

The `whereTime` method may be used to compare a column's value against a specific time:

```php
$users = DB::table('users')
    ->whereTime('created_at', '=', '11:20:45')
    ->get();
```

**wherePast / whereFuture / whereToday / whereBeforeToday / whereAfterToday**

The `wherePast` and `whereFuture` methods may be used to determine if a column's value is in the past or future:

```php
$invoices = DB::table('invoices')
    ->wherePast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereFuture('due_at')
    ->get();
```

The `whereNowOrPast` and `whereNowOrFuture` methods may be used to determine if a column's value is in the past or future, inclusive of the current date and time:

```php
$invoices = DB::table('invoices')
    ->whereNowOrPast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereNowOrFuture('due_at')
    ->get();
```

The `whereToday`, `whereBeforeToday`, and `whereAfterToday` methods may be used to determine if a column's value is today, before today, or after today, respectively:

```php
$invoices = DB::table('invoices')
    ->whereToday('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereBeforeToday('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereAfterToday('due_at')
    ->get();
```

Similarly, the `whereTodayOrBefore` and `whereTodayOrAfter` methods may be used to determine if a column's value is before today or after today, inclusive of today's date:

```php
$invoices = DB::table('invoices')
    ->whereTodayOrBefore('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereTodayOrAfter('due_at')
    ->get();
```

**whereColumn / orWhereColumn**

The `whereColumn` method may be used to verify that two columns are equal:

```php
$users = DB::table('users')
    ->whereColumn('first_name', 'last_name')
    ->get();
```

You may also pass a comparison operator to the `whereColumn` method:

```php
$users = DB::table('users')
    ->whereColumn('updated_at', '>', 'created_at')
    ->get();
```

You may also pass an array of column comparisons to the `whereColumn` method. These conditions will be joined using the `and` operator:

```php
$users = DB::table('users')
    ->whereColumn([
        ['first_name', '=', 'last_name'],
        ['updated_at', '>', 'created_at'],
    ])->get();
```

#### Logical Grouping

Sometimes you may need to group several "where" clauses within parentheses in order to achieve your query's desired logical grouping. In fact, you should generally always group calls to the `orWhere` method in parentheses in order to avoid unexpected query behavior. To accomplish this, you may pass a closure to the `where` method:

```php
$users = DB::table('users')
    ->where('name', '=', 'John')
    ->where(function (Builder $query) {
        $query->where('votes', '>', 100)
            ->orWhere('title', '=', 'Admin');
    })
    ->get();
```

As you can see, passing a closure into the `where` method instructs the query builder to begin a constraint group. The closure will receive a query builder instance which you can use to set the constraints that should be contained within the parenthesis group. The example above will produce the following SQL:

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> **Warning:**
> You should always group `orWhere` calls in order to avoid unexpected behavior when global scopes are applied.

### Advanced Where Clauses

#### Where Exists Clauses

The `whereExists` method allows you to write "where exists" SQL clauses. The `whereExists` method accepts a closure which will receive a query builder instance, allowing you to define the query that should be placed inside of the "exists" clause:

```php
$users = DB::table('users')
    ->whereExists(function (Builder $query) {
        $query->select(DB::raw(1))
            ->from('orders')
            ->whereColumn('orders.user_id', 'users.id');
    })
    ->get();
```

Alternatively, you may provide a query object to the `whereExists` method instead of a closure:

```php
$orders = DB::table('orders')
    ->select(DB::raw(1))
    ->whereColumn('orders.user_id', 'users.id');

$users = DB::table('users')
    ->whereExists($orders)
    ->get();
```

Both of the examples above will produce the following SQL:

```sql
select * from users
where exists (
    select 1
    from orders
    where orders.user_id = users.id
)
```

#### Subquery Where Clauses

Sometimes you may need to construct a "where" clause that compares the results of a subquery to a given value. You may accomplish this by passing a closure and a value to the `where` method. For example, the following query will retrieve all users who have a recent "membership" of a given type;

```php
use App\Models\User;
use Illuminate\Database\Query\Builder;

$users = User::where(function (Builder $query) {
    $query->select('type')
        ->from('membership')
        ->whereColumn('membership.user_id', 'users.id')
        ->orderByDesc('membership.start_date')
        ->limit(1);
}, 'Pro')->get();
```

Or, you may need to construct a "where" clause that compares a column to the results of a subquery. You may accomplish this by passing a column, operator, and closure to the `where` method. For example, the following query will retrieve all income records where the amount is less than average;

```php
use App\Models\Income;
use Illuminate\Database\Query\Builder;

$incomes = Income::where('amount', '<', function (Builder $query) {
    $query->selectRaw('avg(i.amount)')->from('incomes as i');
})->get();
```

#### Full Text Where Clauses

> **Warning:**
> Full text where clauses are currently supported by MariaDB, MySQL, and PostgreSQL.

The `whereFullText` and `orWhereFullText` methods may be used to add full text "where" clauses to a query for columns that have [full text indexes](https://laravel.com/docs/migrations#available-index-types). These methods will be transformed into the appropriate SQL for the underlying database system by Laravel. For example, a `MATCH AGAINST` clause will be generated for applications utilizing MariaDB or MySQL:

```php
$users = DB::table('users')
    ->whereFullText('bio', 'web developer')
    ->get();
```

#### Vector Similarity Clauses

> **Note:**
> Vector similarity clauses are currently supported on PostgreSQL connections using the `pgvector` extension and MariaDB 11.7 or later. For information on defining vector columns and indexes, consult the [migration documentation](https://laravel.com/docs/migrations#available-column-types).

The `whereVectorSimilarTo` method filters results by cosine similarity to a given vector and orders the results by relevance. The `minSimilarity` threshold should be a value between `0.0` and `1.0`, where `1.0` is identical:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

When a plain string is given as the vector argument, Laravel will automatically generate embeddings for it using the [Laravel AI SDK](https://laravel.com/docs/ai-sdk#embeddings):

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'Best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

By default, `whereVectorSimilarTo` also orders results by distance (most similar first). You may disable this ordering by passing `false` as the `order` argument:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4, order: false)
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();
```

If you need more control, you may use the `selectVectorDistance`, `whereVectorDistanceLessThan`, and `orderByVectorDistance` methods independently:

```php
$documents = DB::table('documents')
    ->select('*')
    ->selectVectorDistance('embedding', $queryEmbedding, as: 'distance')
    ->whereVectorDistanceLessThan('embedding', $queryEmbedding, maxDistance: 0.3)
    ->orderByVectorDistance('embedding', $queryEmbedding)
    ->limit(10)
    ->get();
```

When utilizing PostgreSQL, the `pgvector` extension must be loaded before `vector` columns can be created:

```php
Schema::ensureVectorExtensionExists();
```

### Ordering, Grouping, Limit and Offset

#### Ordering

##### The `orderBy` Method

The `orderBy` method allows you to sort the results of the query by a given column. The first argument accepted by the `orderBy` method should be the column you wish to sort by, while the second argument determines the direction of the sort and may be either `asc` or `desc`:

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->get();
```

To sort by multiple columns, you may simply invoke `orderBy` as many times as necessary:

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->orderBy('email', 'asc')
    ->get();
```

The sort direction is optional, and is ascending by default. If you want to sort in descending order, you can specify the second parameter for the `orderBy` method, or just use `orderByDesc`:

```php
$users = DB::table('users')
    ->orderByDesc('verified_at')
    ->get();
```

Finally, using the `->` operator, the results can be sorted by a value within a JSON column:

```php
$corporations = DB::table('corporations')
    ->where('country', 'US')
    ->orderBy('location->state')
    ->get();
```

##### The `latest` and `oldest` Methods

The `latest` and `oldest` methods allow you to easily order results by date. By default, the result will be ordered by the table's `created_at` column. Or, you may pass the column name that you wish to sort by:

```php
$user = DB::table('users')
    ->latest()
    ->first();
```

##### Random Ordering

The `inRandomOrder` method may be used to sort the query results randomly. For example, you may use this method to fetch a random user:

```php
$randomUser = DB::table('users')
    ->inRandomOrder()
    ->first();
```

##### Removing Existing Orderings

The `reorder` method removes all of the "order by" clauses that have previously been applied to the query:

```php
$query = DB::table('users')->orderBy('name');

$unorderedUsers = $query->reorder()->get();
```

You may pass a column and direction when calling the `reorder` method in order to remove all existing "order by" clauses and apply an entirely new order to the query:

```php
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

For convenience, you may use the `reorderDesc` method to reorder the query results in descending order:

```php
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorderDesc('email')->get();
```

#### Grouping

##### The `groupBy` and `having` Methods

As you might expect, the `groupBy` and `having` methods may be used to group the query results. The `having` method's signature is similar to that of the `where` method:

```php
$users = DB::table('users')
    ->groupBy('account_id')
    ->having('account_id', '>', 100)
    ->get();
```

You can use the `havingBetween` method to filter the results within a given range:

```php
$report = DB::table('orders')
    ->selectRaw('count(id) as number_of_orders, customer_id')
    ->groupBy('customer_id')
    ->havingBetween('number_of_orders', [5, 15])
    ->get();
```

You may pass multiple arguments to the `groupBy` method to group by multiple columns:

```php
$users = DB::table('users')
    ->groupBy('first_name', 'status')
    ->having('account_id', '>', 100)
    ->get();
```

To build more advanced `having` statements, see the [havingRaw](#raw-methods) method.

#### Limit and Offset

You may use the `limit` and `offset` methods to limit the number of results returned from the query or to skip a given number of results in the query:

```php
$users = DB::table('users')
    ->offset(10)
    ->limit(5)
    ->get();
```

### Conditional Clauses

Sometimes you may want certain query clauses to apply to a query based on another condition. For instance, you may only want to apply a `where` statement if a given input value is present on the incoming HTTP request. You may accomplish this using the `when` method:

```php
$role = $request->input('role');

$users = DB::table('users')
    ->when($role, function (Builder $query, string $role) {
        $query->where('role_id', $role);
    })
    ->get();
```

The `when` method only executes the given closure when the first argument is `true`. If the first argument is `false`, the closure will not be executed. So, in the example above, the closure given to the `when` method will only be invoked if the `role` field is present on the incoming request and evaluates to `true`.

You may pass another closure as the third argument to the `when` method. This closure will only execute if the first argument evaluates as `false`. To illustrate how this feature may be used, we will use it to configure the default ordering of a query:

```php
$sortByVotes = $request->boolean('sort_by_votes');

$users = DB::table('users')
    ->when($sortByVotes, function (Builder $query, bool $sortByVotes) {
        $query->orderBy('votes');
    }, function (Builder $query) {
        $query->orderBy('name');
    })
    ->get();
```

### Insert Statements

The query builder also provides an `insert` method that may be used to insert records into the database table. The `insert` method accepts an array of column names and values:

```php
DB::table('users')->insert([
    'email' => 'kayla@example.com',
    'votes' => 0
]);
```

You may insert several records at once by passing an array of arrays. Each array represents a record that should be inserted into the table:

```php
DB::table('users')->insert([
    ['email' => 'picard@example.com', 'votes' => 0],
    ['email' => 'janeway@example.com', 'votes' => 0],
]);
```

The `insertOrIgnore` method will ignore errors while inserting records into the database. When using this method, you should be aware that duplicate record errors will be ignored and other types of errors may also be ignored depending on the database engine. For example, `insertOrIgnore` will [bypass MySQL's strict mode](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution):

```php
DB::table('users')->insertOrIgnore([
    ['id' => 1, 'email' => 'sisko@example.com'],
    ['id' => 2, 'email' => 'archer@example.com'],
]);
```

The `insertUsing` method will insert new records into the table while using a subquery to determine the data that should be inserted:

```php
DB::table('pruned_users')->insertUsing([
    'id', 'name', 'email', 'email_verified_at'
], DB::table('users')->select(
    'id', 'name', 'email', 'email_verified_at'
)->where('updated_at', '<=', now()->minus(months: 1)));
```

##### Auto-Incrementing IDs

If the table has an auto-incrementing id, use the `insertGetId` method to insert a record and then retrieve the ID:

```php
$id = DB::table('users')->insertGetId(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

> **Warning:**
> When using PostgreSQL the `insertGetId` method expects the auto-incrementing column to be named `id`. If you would like to retrieve the ID from a different "sequence", you may pass the column name as the second parameter to the `insertGetId` method.

#### Upserts

The `upsert` method will insert records that do not exist and update the records that already exist with new values that you may specify. The method's first argument consists of the values to insert or update, while the second argument lists the column(s) that uniquely identify records within the associated table. The method's third and final argument is an array of columns that should be updated if a matching record already exists in the database:

```php
DB::table('flights')->upsert(
    [
        ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
        ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
    ],
    ['departure', 'destination'],
    ['price']
);
```

In the example above, Laravel will attempt to insert two records. If a record already exists with the same `departure` and `destination` column values, Laravel will update that record's `price` column.

> **Warning:**
> All databases except SQL Server require the columns in the second argument of the `upsert` method to have a "primary" or "unique" index. In addition, the MariaDB and MySQL database drivers ignore the second argument of the `upsert` method and always use the "primary" and "unique" indexes of the table to detect existing records.

### Update Statements

In addition to inserting records into the database, the query builder can also update existing records using the `update` method. The `update` method, like the `insert` method, accepts an array of column and value pairs indicating the columns to be updated. The `update` method returns the number of affected rows. You may constrain the `update` query using `where` clauses:

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['votes' => 1]);
```

##### Update or Insert

Sometimes you may want to update an existing record in the database or create it if no matching record exists. In this scenario, the `updateOrInsert` method may be used. The `updateOrInsert` method accepts two arguments: an array of conditions by which to find the record, and an array of column and value pairs indicating the columns to be updated.

The `updateOrInsert` method will attempt to locate a matching database record using the first argument's column and value pairs. If the record exists, it will be updated with the values in the second argument. If the record cannot be found, a new record will be inserted with the merged attributes of both arguments:

```php
DB::table('users')
    ->updateOrInsert(
        ['email' => 'john@example.com', 'name' => 'John'],
        ['votes' => '2']
    );
```

You may provide a closure to the `updateOrInsert` method to customize the attributes that are updated or inserted into the database based on the existence of a matching record:

```php
DB::table('users')->updateOrInsert(
    ['user_id' => $user_id],
    fn ($exists) => $exists ? [
        'name' => $data['name'],
        'email' => $data['email'],
    ] : [
        'name' => $data['name'],
        'email' => $data['email'],
        'marketable' => true,
    ],
);
```

#### Updating JSON Columns

When updating a JSON column, you should use `->` syntax to update the appropriate key in the JSON object. This operation is supported on MariaDB 10.3+, MySQL 5.7+, and PostgreSQL 9.5+:

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['options->enabled' => true]);
```

#### Increment and Decrement

The query builder also provides convenient methods for incrementing or decrementing the value of a given column. Both of these methods accept at least one argument: the column to modify. A second argument may be provided to specify the amount by which the column should be incremented or decremented:

```php
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5);
```

If needed, you may also specify additional columns to update during the increment or decrement operation:

```php
DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

In addition, you may increment or decrement multiple columns at once using the `incrementEach` and `decrementEach` methods:

```php
DB::table('users')->incrementEach([
    'votes' => 5,
    'balance' => 100,
]);
```

### Delete Statements

The query builder's `delete` method may be used to delete records from the table. The `delete` method returns the number of affected rows. You may constrain `delete` statements by adding "where" clauses before calling the `delete` method:

```php
$deleted = DB::table('users')->delete();

$deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

### Pessimistic Locking

The query builder also includes a few functions to help you achieve "pessimistic locking" when executing your `select` statements. To execute a statement with a "shared lock", you may call the `sharedLock` method. A shared lock prevents the selected rows from being modified until your transaction is committed:

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->sharedLock()
    ->get();
```

Alternatively, you may use the `lockForUpdate` method. A "for update" lock prevents the selected records from being modified or from being selected with another shared lock:

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->lockForUpdate()
    ->get();
```

While not obligatory, it is recommended to wrap pessimistic locks within a [transaction](https://laravel.com/docs/database#database-transactions). This ensures that the data retrieved remains unaltered in the database until the entire operation completes. In case of a failure, the transaction will roll back any changes and release the locks automatically:

```php
DB::transaction(function () {
    $sender = DB::table('users')
        ->lockForUpdate()
        ->find(1);

    $receiver = DB::table('users')
        ->lockForUpdate()
        ->find(2);

    if ($sender->balance < 100) {
        throw new RuntimeException('Balance too low.');
    }

    DB::table('users')
        ->where('id', $sender->id)
        ->update([
            'balance' => $sender->balance - 100
        ]);

    DB::table('users')
        ->where('id', $receiver->id)
        ->update([
            'balance' => $receiver->balance + 100
        ]);
});
```

### Reusable Query Components

If you have repeated query logic throughout your application, you may extract the logic into reusable objects using the query builder's `tap` and `pipe` methods. Imagine you have these two different queries in your application:

```php
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

$destination = $request->query('destination');

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) {
        $query->where('destination', $destination);
    })
    ->orderByDesc('price')
    ->get();

// ...

$destination = $request->query('destination');

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) {
        $query->where('destination', $destination);
    })
    ->where('user', $request->user()->id)
    ->orderBy('destination')
    ->get();
```

You may like to extract the destination filtering that is common between the queries into a reusable object:

```php
<?php

namespace App\Scopes;

use Illuminate\Database\Query\Builder;

class DestinationFilter
{
    public function __construct(
        private ?string $destination,
    ) {
        //
    }

    public function __invoke(Builder $query): void
    {
        $query->when($this->destination, function (Builder $query) {
            $query->where('destination', $this->destination);
        });
    }
}
```

Then, you can use the query builder's `tap` method to apply the object's logic to the query:

```php
use App\Scopes\DestinationFilter;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) { // [tl! remove]
        $query->where('destination', $destination); // [tl! remove]
    }) // [tl! remove]
    ->tap(new DestinationFilter($destination)) // [tl! add]
    ->orderByDesc('price')
    ->get();

// ...

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) { // [tl! remove]
        $query->where('destination', $destination); // [tl! remove]
    }) // [tl! remove]
    ->tap(new DestinationFilter($destination)) // [tl! add]
    ->where('user', $request->user()->id)
    ->orderBy('destination')
    ->get();
```

##### Query Pipes

The `tap` method will always return the query builder. If you would like to extract an object that executes the query and returns another value, you may use the `pipe` method instead.

Consider the following query object that contains shared [pagination](https://laravel.com/docs/pagination) logic used throughout an application. Unlike the `DestinationFilter`, which applies query conditions to the query, the `Paginate` object executes the query and returns a paginator instance:

```php
<?php

namespace App\Scopes;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Query\Builder;

class Paginate
{
    public function __construct(
        private string $sortBy = 'timestamp',
        private string $sortDirection = 'desc',
        private int $perPage = 25,
    ) {
        //
    }

    public function __invoke(Builder $query): LengthAwarePaginator
    {
        return $query->orderBy($this->sortBy, $this->sortDirection)
            ->paginate($this->perPage, pageName: 'p');
    }
}
```

Using the query builder's `pipe` method, we can leverage this object to apply our shared pagination logic:

```php
$flights = DB::table('flights')
    ->tap(new DestinationFilter($destination))
    ->pipe(new Paginate);
```

### Debugging

You may use the `dd` and `dump` methods while building a query to dump the current query bindings and SQL. The `dd` method will display the debug information and then stop executing the request. The `dump` method will display the debug information but allow the request to continue executing:

```php
DB::table('users')->where('votes', '>', 100)->dd();

DB::table('users')->where('votes', '>', 100)->dump();
```

The `dumpRawSql` and `ddRawSql` methods may be invoked on a query to dump the query's SQL with all parameter bindings properly substituted:

```php
DB::table('users')->where('votes', '>', 100)->dumpRawSql();

DB::table('users')->where('votes', '>', 100)->ddRawSql();
```

## Database: Migrations

> **Source:** [Database: Migrations](https://laravel.com/docs/migrations) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

Migrations are like version control for your database, allowing your team to define and share the application's database schema definition. If you have ever had to tell a teammate to manually add a column to their local database schema after pulling in your changes from source control, you've faced the problem that database migrations solve.

The Laravel `Schema` [facade](https://laravel.com/docs/facades) provides database agnostic support for creating and manipulating tables across all of Laravel's supported database systems. Typically, migrations will use this facade to create and modify database tables and columns.

### Generating Migrations

You may use the `make:migration` [Artisan command](https://laravel.com/docs/artisan) to generate a database migration. The new migration will be placed in your `database/migrations` directory. Each migration filename contains a timestamp that allows Laravel to determine the order of the migrations:

```shell
php artisan make:migration create_flights_table
```

Laravel will use the name of the migration to attempt to guess the name of the table and whether or not the migration will be creating a new table. If Laravel is able to determine the table name from the migration name, Laravel will pre-fill the generated migration file with the specified table. Otherwise, you may simply specify the table in the migration file manually.

If you would like to specify a custom path for the generated migration, you may use the `--path` option when executing the `make:migration` command. The given path should be relative to your application's base path.

> **Note:**
> Migration stubs may be customized using [stub publishing](https://laravel.com/docs/artisan#stub-customization).

#### Squashing Migrations

As you build your application, you may accumulate more and more migrations over time. This can lead to your `database/migrations` directory becoming bloated with potentially hundreds of migrations. If you would like, you may "squash" your migrations into a single SQL file. To get started, execute the `schema:dump` command:

```shell
php artisan schema:dump

# Dump the current database schema and prune all existing migrations...
php artisan schema:dump --prune
```

When you execute this command, Laravel will write a "schema" file to your application's `database/schema` directory. The schema file's name will correspond to the database connection. Now, when you attempt to migrate your database and no other migrations have been executed, Laravel will first execute the SQL statements in the schema file of the database connection you are using. After executing the schema file's SQL statements, Laravel will execute any remaining migrations that were not part of the schema dump.

If your application's tests use a different database connection than the one you typically use during local development, you should ensure you have dumped a schema file using that database connection so that your tests are able to build your database. You may wish to do this after dumping the database connection you typically use during local development:

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```

You should commit your database schema file to source control so that other new developers on your team may quickly create your application's initial database structure.

> **Warning:**
> Migration squashing is only available for the MariaDB, MySQL, PostgreSQL, and SQLite databases and utilizes the database's command-line client.

### Migration Structure

A migration class contains two methods: `up` and `down`. The `up` method is used to add new tables, columns, or indexes to your database, while the `down` method should reverse the operations performed by the `up` method.

Within both of these methods, you may use the Laravel schema builder to expressively create and modify tables. To learn about all of the methods available on the `Schema` builder, [check out its documentation](#creating-tables). For example, the following migration creates a `flights` table:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('airline');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('flights');
    }
};
```

##### Setting the Migration Connection

If your migration will be interacting with a database connection other than your application's default database connection, you should set the `$connection` property of your migration:

```php
/**
 * The database connection that should be used by the migration.
 *
 * @var string
 */
protected $connection = 'pgsql';

/**
 * Run the migrations.
 */
public function up(): void
{
    // ...
}
```

##### Skipping Migrations

Sometimes a migration might be meant to support a feature that is not yet active and you do not want it to run yet. In this case you may define a `shouldRun` method on the migration. If the `shouldRun` method returns `false`, the migration will be skipped:

```php
use App\Models\Flight;
use Laravel\Pennant\Feature;

/**
 * Determine if this migration should run.
 */
public function shouldRun(): bool
{
    return Feature::active(Flight::class);
}
```

### Running Migrations

To run all of your outstanding migrations, execute the `migrate` Artisan command:

```shell
php artisan migrate
```

If you would like to see which migrations have already run and which are still pending, you may use the `migrate:status` Artisan command:

```shell
php artisan migrate:status
```

If you provide the `--step` option to the `migrate` command, the command will run each migration as its own batch, allowing you to roll back individual migrations later using the `migrate:rollback` command:

```shell
php artisan migrate --step
```

If you would like to see the SQL statements that will be executed by the migrations without actually running them, you may provide the `--pretend` flag to the `migrate` command:

```shell
php artisan migrate --pretend
```

##### Isolating Migration Execution

If you are deploying your application across multiple servers and running migrations as part of your deployment process, you likely do not want two servers attempting to migrate the database at the same time. To avoid this, you may use the `isolated` option when invoking the `migrate` command.

When the `isolated` option is provided, Laravel will acquire an atomic lock using your application's cache driver before attempting to run your migrations. All other attempts to run the `migrate` command while that lock is held will not execute; however, the command will still exit with a successful exit status code:

```shell
php artisan migrate --isolated
```

> **Warning:**
> To utilize this feature, your application must be using the `memcached`, `redis`, `dynamodb`, `database`, `file`, or `array` cache driver as your application's default cache driver. In addition, all servers must be communicating with the same central cache server.

##### Forcing Migrations to Run in Production

Some migration operations are destructive, which means they may cause you to lose data. In order to protect you from running these commands against your production database, you will be prompted for confirmation before the commands are executed. To force the commands to run without a prompt, use the `--force` flag:

```shell
php artisan migrate --force
```

#### Rolling Back Migrations

To roll back the latest migration operation, you may use the `rollback` Artisan command. This command rolls back the last "batch" of migrations, which may include multiple migration files:

```shell
php artisan migrate:rollback
```

You may roll back a limited number of migrations by providing the `step` option to the `rollback` command. For example, the following command will roll back the last five migrations:

```shell
php artisan migrate:rollback --step=5
```

You may roll back a specific "batch" of migrations by providing the `batch` option to the `rollback` command, where the `batch` option corresponds to a batch value within your application's `migrations` database table. For example, the following command will roll back all migrations in batch three:

```shell
php artisan migrate:rollback --batch=3
```

If you would like to see the SQL statements that will be executed by the migrations without actually running them, you may provide the `--pretend` flag to the `migrate:rollback` command:

```shell
php artisan migrate:rollback --pretend
```

The `migrate:reset` command will roll back all of your application's migrations:

```shell
php artisan migrate:reset
```

##### Roll Back and Migrate Using a Single Command

The `migrate:refresh` command will roll back all of your migrations and then execute the `migrate` command. This command effectively re-creates your entire database:

```shell
php artisan migrate:refresh

# Refresh the database and run all database seeds...
php artisan migrate:refresh --seed
```

You may roll back and re-migrate a limited number of migrations by providing the `step` option to the `refresh` command. For example, the following command will roll back and re-migrate the last five migrations:

```shell
php artisan migrate:refresh --step=5
```

##### Drop All Tables and Migrate

The `migrate:fresh` command will drop all tables from the database and then execute the `migrate` command:

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

By default, the `migrate:fresh` command only drops tables from the default database connection. However, you may use the `--database` option to specify the database connection that should be migrated. The database connection name should correspond to a connection defined in your application's `database` [configuration file](https://laravel.com/docs/configuration):

```shell
php artisan migrate:fresh --database=admin
```

> **Warning:**
> The `migrate:fresh` command will drop all database tables regardless of their prefix. This command should be used with caution when developing on a database that is shared with other applications.

### Tables

#### Creating Tables

To create a new database table, use the `create` method on the `Schema` facade. The `create` method accepts two arguments: the first is the name of the table, while the second is a closure which receives a `Blueprint` object that may be used to define the new table:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email');
    $table->timestamps();
});
```

When creating the table, you may use any of the schema builder's [column methods](#creating-columns) to define the table's columns.

##### Determining Table / Column Existence

You may determine the existence of a table, column, or index using the `hasTable`, `hasColumn`, and `hasIndex` methods:

```php
if (Schema::hasTable('users')) {
    // The "users" table exists...
}

if (Schema::hasColumn('users', 'email')) {
    // The "users" table exists and has an "email" column...
}

if (Schema::hasIndex('users', ['email'], 'unique')) {
    // The "users" table exists and has a unique index on the "email" column...
}
```

##### Database Connection and Table Options

If you want to perform a schema operation on a database connection that is not your application's default connection, use the `connection` method:

```php
Schema::connection('sqlite')->create('users', function (Blueprint $table) {
    $table->id();
});
```

In addition, a few other properties and methods may be used to define other aspects of the table's creation. The `engine` property may be used to specify the table's storage engine when using MariaDB or MySQL:

```php
Schema::create('users', function (Blueprint $table) {
    $table->engine('InnoDB');

    // ...
});
```

The `charset` and `collation` properties may be used to specify the character set and collation for the created table when using MariaDB or MySQL:

```php
Schema::create('users', function (Blueprint $table) {
    $table->charset('utf8mb4');
    $table->collation('utf8mb4_unicode_ci');

    // ...
});
```

The `temporary` method may be used to indicate that the table should be "temporary". Temporary tables are only visible to the current connection's database session and are dropped automatically when the connection is closed:

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->temporary();

    // ...
});
```

If you would like to add a "comment" to a database table, you may invoke the `comment` method on the table instance. Table comments are currently only supported by MariaDB, MySQL, and PostgreSQL:

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->comment('Business calculations');

    // ...
});
```

#### Updating Tables

The `table` method on the `Schema` facade may be used to update existing tables. Like the `create` method, the `table` method accepts two arguments: the name of the table and a closure that receives a `Blueprint` instance you may use to add columns or indexes to the table:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

#### Renaming / Dropping Tables

To rename an existing database table, use the `rename` method:

```php
use Illuminate\Support\Facades\Schema;

Schema::rename($from, $to);
```

To drop an existing table, you may use the `drop` or `dropIfExists` methods:

```php
Schema::drop('users');

Schema::dropIfExists('users');
```

##### Renaming Tables With Foreign Keys

Before renaming a table, you should verify that any foreign key constraints on the table have an explicit name in your migration files instead of letting Laravel assign a convention based name. Otherwise, the foreign key constraint name will refer to the old table name.

### Columns

#### Creating Columns

The `table` method on the `Schema` facade may be used to update existing tables. Like the `create` method, the `table` method accepts two arguments: the name of the table and a closure that receives an `Illuminate\Database\Schema\Blueprint` instance you may use to add columns to the table:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

#### Available Column Types

The schema builder blueprint offers a variety of methods that correspond to the different types of columns you can add to your database tables. Each of the available methods are listed in the table below:

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

##### Boolean Types

<div class="collection-method-list" markdown="1">

[boolean](#column-method-boolean)

</div>

##### String & Text Types

<div class="collection-method-list" markdown="1">

[char](#column-method-char)
[longText](#column-method-longText)
[mediumText](#column-method-mediumText)
[string](#column-method-string)
[text](#column-method-text)
[tinyText](#column-method-tinyText)

</div>

##### Numeric Types

<div class="collection-method-list" markdown="1">

[bigIncrements](#column-method-bigIncrements)
[bigInteger](#column-method-bigInteger)
[decimal](#column-method-decimal)
[double](#column-method-double)
[float](#column-method-float)
[id](#column-method-id)
[increments](#column-method-increments)
[integer](#column-method-integer)
[mediumIncrements](#column-method-mediumIncrements)
[mediumInteger](#column-method-mediumInteger)
[smallIncrements](#column-method-smallIncrements)
[smallInteger](#column-method-smallInteger)
[tinyIncrements](#column-method-tinyIncrements)
[tinyInteger](#column-method-tinyInteger)
[unsignedBigInteger](#column-method-unsignedBigInteger)
[unsignedInteger](#column-method-unsignedInteger)
[unsignedMediumInteger](#column-method-unsignedMediumInteger)
[unsignedSmallInteger](#column-method-unsignedSmallInteger)
[unsignedTinyInteger](#column-method-unsignedTinyInteger)

</div>

##### Date & Time Types

<div class="collection-method-list" markdown="1">

[dateTime](#column-method-dateTime)
[dateTimeTz](#column-method-dateTimeTz)
[date](#column-method-date)
[time](#column-method-time)
[timeTz](#column-method-timeTz)
[timestamp](#column-method-timestamp)
[timestamps](#column-method-timestamps)
[timestampsTz](#column-method-timestampsTz)
[softDeletes](#column-method-softDeletes)
[softDeletesTz](#column-method-softDeletesTz)
[year](#column-method-year)

</div>

##### Binary Types

<div class="collection-method-list" markdown="1">

[binary](#column-method-binary)

</div>

##### Object & Json Types

<div class="collection-method-list" markdown="1">

[json](#column-method-json)
[jsonb](#column-method-jsonb)

</div>

##### UUID & ULID Types

<div class="collection-method-list" markdown="1">

[ulid](#column-method-ulid)
[ulidMorphs](#column-method-ulidMorphs)
[uuid](#column-method-uuid)
[uuidMorphs](#column-method-uuidMorphs)
[nullableUlidMorphs](#column-method-nullableUlidMorphs)
[nullableUuidMorphs](#column-method-nullableUuidMorphs)

</div>

##### Spatial Types

<div class="collection-method-list" markdown="1">

[geography](#column-method-geography)
[geometry](#column-method-geometry)

</div>

##### Relationship Types

<div class="collection-method-list" markdown="1">

[foreignId](#column-method-foreignId)
[foreignIdFor](#column-method-foreignIdFor)
[foreignUlid](#column-method-foreignUlid)
[foreignUuid](#column-method-foreignUuid)
[foreignUuidFor](#column-method-foreignUuidFor)
[morphs](#column-method-morphs)
[nullableMorphs](#column-method-nullableMorphs)

</div>

##### Specialty Types

<div class="collection-method-list" markdown="1">

[enum](#column-method-enum)
[set](#column-method-set)
[macAddress](#column-method-macAddress)
[ipAddress](#column-method-ipAddress)
[rememberToken](#column-method-rememberToken)
[vector](#column-method-vector)

</div>

##### `bigIncrements()` {.collection-method .first-collection-method}

The `bigIncrements` method creates an auto-incrementing `UNSIGNED BIGINT` (primary key) equivalent column:

```php
$table->bigIncrements('id');
```

##### `bigInteger()` {.collection-method}

The `bigInteger` method creates a `BIGINT` equivalent column:

```php
$table->bigInteger('votes');
```

##### `binary()` {.collection-method}

The `binary` method creates a `BLOB` equivalent column:

```php
$table->binary('photo');
```

When utilizing MySQL, MariaDB, or SQL Server, you may pass `length` and `fixed` arguments to create `VARBINARY` or `BINARY` equivalent column:

```php
$table->binary('data', length: 16); // VARBINARY(16)

$table->binary('data', length: 16, fixed: true); // BINARY(16)
```

##### `boolean()` {.collection-method}

The `boolean` method creates a `BOOLEAN` equivalent column:

```php
$table->boolean('confirmed');
```

##### `char()` {.collection-method}

The `char` method creates a `CHAR` equivalent column with of a given length:

```php
$table->char('name', length: 100);
```

##### `dateTimeTz()` {.collection-method}

The `dateTimeTz` method creates a `DATETIME` (with timezone) equivalent column with an optional fractional seconds precision:

```php
$table->dateTimeTz('created_at', precision: 0);
```

##### `dateTime()` {.collection-method}

The `dateTime` method creates a `DATETIME` equivalent column with an optional fractional seconds precision:

```php
$table->dateTime('created_at', precision: 0);
```

##### `date()` {.collection-method}

The `date` method creates a `DATE` equivalent column:

```php
$table->date('created_at');
```

##### `decimal()` {.collection-method}

The `decimal` method creates a `DECIMAL` equivalent column with the given precision (total digits) and scale (decimal digits):

```php
$table->decimal('amount', total: 8, places: 2);
```

##### `double()` {.collection-method}

The `double` method creates a `DOUBLE` equivalent column:

```php
$table->double('amount');
```

##### `enum()` {.collection-method}

The `enum` method creates a `ENUM` equivalent column with the given valid values:

```php
$table->enum('difficulty', ['easy', 'hard']);
```

Of course, you may use the `Enum::cases()` method instead of manually defining an array of allowed values:

```php
use App\Enums\Difficulty;

$table->enum('difficulty', Difficulty::cases());
```

##### `float()` {.collection-method}

The `float` method creates a `FLOAT` equivalent column with the given precision:

```php
$table->float('amount', precision: 53);
```

##### `foreignId()` {.collection-method}

The `foreignId` method creates an `UNSIGNED BIGINT` equivalent column:

```php
$table->foreignId('user_id');
```

##### `foreignIdFor()` {.collection-method}

The `foreignIdFor` method adds a `{column}_id` equivalent column for a given model class. The column type will be `UNSIGNED BIGINT`, `CHAR(36)`, or `CHAR(26)` depending on the model key type:

```php
$table->foreignIdFor(User::class);
```

##### `foreignUlid()` {.collection-method}

The `foreignUlid` method creates a `ULID` equivalent column:

```php
$table->foreignUlid('user_id');
```

##### `foreignUuid()` {.collection-method}

The `foreignUuid` method creates a `UUID` equivalent column:

```php
$table->foreignUuid('user_id');
```

##### `foreignUuidFor()` {.collection-method}

The `foreignUuidFor` method adds a `{column}_id` UUID equivalent column for a given model class:

```php
$table->foreignUuidFor(User::class);
```

##### `geography()` {.collection-method}

The `geography` method creates a `GEOGRAPHY` equivalent column with the given spatial type and SRID (Spatial Reference System Identifier):

```php
$table->geography('coordinates', subtype: 'point', srid: 4326);
```

> **Note:**
> Support for spatial types depends on your database driver. Please refer to your database's documentation. If your application is utilizing a PostgreSQL database, you must install the [PostGIS](https://postgis.net) extension before the `geography` method may be used.

##### `geometry()` {.collection-method}

The `geometry` method creates a `GEOMETRY` equivalent column with the given spatial type and SRID (Spatial Reference System Identifier):

```php
$table->geometry('positions', subtype: 'point', srid: 0);
```

> **Note:**
> Support for spatial types depends on your database driver. Please refer to your database's documentation. If your application is utilizing a PostgreSQL database, you must install the [PostGIS](https://postgis.net) extension before the `geometry` method may be used.

##### `id()` {.collection-method}

The `id` method is an alias of the `bigIncrements` method. By default, the method will create an `id` column; however, you may pass a column name if you would like to assign a different name to the column:

```php
$table->id();
```

##### `increments()` {.collection-method}

The `increments` method creates an auto-incrementing `UNSIGNED INTEGER` equivalent column as a primary key:

```php
$table->increments('id');
```

##### `integer()` {.collection-method}

The `integer` method creates an `INTEGER` equivalent column:

```php
$table->integer('votes');
```

##### `ipAddress()` {.collection-method}

The `ipAddress` method creates a `VARCHAR` equivalent column:

```php
$table->ipAddress('visitor');
```

When using PostgreSQL, an `INET` column will be created.

##### `json()` {.collection-method}

The `json` method creates a `JSON` equivalent column:

```php
$table->json('options');
```

When using SQLite, a `TEXT` column will be created.

##### `jsonb()` {.collection-method}

The `jsonb` method creates a `JSONB` equivalent column:

```php
$table->jsonb('options');
```

When using SQLite, a `TEXT` column will be created.

##### `longText()` {.collection-method}

The `longText` method creates a `LONGTEXT` equivalent column:

```php
$table->longText('description');
```

When utilizing MySQL or MariaDB, you may apply a `binary` character set to the column in order to create a `LONGBLOB` equivalent column:

```php
$table->longText('data')->charset('binary'); // LONGBLOB
```

##### `macAddress()` {.collection-method}

The `macAddress` method creates a column that is intended to hold a MAC address. Some database systems, such as PostgreSQL, have a dedicated column type for this type of data. Other database systems will use a string equivalent column:

```php
$table->macAddress('device');
```

##### `mediumIncrements()` {.collection-method}

The `mediumIncrements` method creates an auto-incrementing `UNSIGNED MEDIUMINT` equivalent column as a primary key:

```php
$table->mediumIncrements('id');
```

##### `mediumInteger()` {.collection-method}

The `mediumInteger` method creates a `MEDIUMINT` equivalent column:

```php
$table->mediumInteger('votes');
```

##### `mediumText()` {.collection-method}

The `mediumText` method creates a `MEDIUMTEXT` equivalent column:

```php
$table->mediumText('description');
```

When utilizing MySQL or MariaDB, you may apply a `binary` character set to the column in order to create a `MEDIUMBLOB` equivalent column:

```php
$table->mediumText('data')->charset('binary'); // MEDIUMBLOB
```

##### `morphs()` {.collection-method}

The `morphs` method is a convenience method that adds a `{column}_type` `VARCHAR` equivalent column and a `{column}_id` equivalent column. The column type for the `{column}_id` will be `UNSIGNED BIGINT`, `CHAR(36)`, or `CHAR(26)` depending on the model key type.

This method is intended to be used when defining the columns necessary for a polymorphic [Eloquent relationship](https://laravel.com/docs/eloquent-relationships). In the following example, `taggable_type` and `taggable_id` columns would be created:

```php
$table->morphs('taggable');
```

##### `nullableMorphs()` {.collection-method}

The method is similar to the [morphs](#column-method-morphs) method; however, the columns that are created will be "nullable":

```php
$table->nullableMorphs('taggable');
```

##### `nullableUlidMorphs()` {.collection-method}

The method is similar to the [ulidMorphs](#column-method-ulidMorphs) method; however, the columns that are created will be "nullable":

```php
$table->nullableUlidMorphs('taggable');
```

##### `nullableUuidMorphs()` {.collection-method}

The method is similar to the [uuidMorphs](#column-method-uuidMorphs) method; however, the columns that are created will be "nullable":

```php
$table->nullableUuidMorphs('taggable');
```

##### `rememberToken()` {.collection-method}

The `rememberToken` method creates a nullable, `VARCHAR(100)` equivalent column that is intended to store the current "remember me" [authentication token](https://laravel.com/docs/authentication#remembering-users):

```php
$table->rememberToken();
```

##### `set()` {.collection-method}

The `set` method creates a `SET` equivalent column with the given list of valid values:

```php
$table->set('flavors', ['strawberry', 'vanilla']);
```

##### `smallIncrements()` {.collection-method}

The `smallIncrements` method creates an auto-incrementing `UNSIGNED SMALLINT` equivalent column as a primary key:

```php
$table->smallIncrements('id');
```

##### `smallInteger()` {.collection-method}

The `smallInteger` method creates a `SMALLINT` equivalent column:

```php
$table->smallInteger('votes');
```

##### `softDeletesTz()` {.collection-method}

The `softDeletesTz` method adds a nullable `deleted_at` `TIMESTAMP` (with timezone) equivalent column with an optional fractional seconds precision. This column is intended to store the `deleted_at` timestamp needed for Eloquent's "soft delete" functionality:

```php
$table->softDeletesTz('deleted_at', precision: 0);
```

##### `softDeletes()` {.collection-method}

The `softDeletes` method adds a nullable `deleted_at` `TIMESTAMP` equivalent column with an optional fractional seconds precision. This column is intended to store the `deleted_at` timestamp needed for Eloquent's "soft delete" functionality:

```php
$table->softDeletes('deleted_at', precision: 0);
```

##### `string()` {.collection-method}

The `string` method creates a `VARCHAR` equivalent column of the given length:

```php
$table->string('name', length: 100);
```

##### `text()` {.collection-method}

The `text` method creates a `TEXT` equivalent column:

```php
$table->text('description');
```

When utilizing MySQL or MariaDB, you may apply a `binary` character set to the column in order to create a `BLOB` equivalent column:

```php
$table->text('data')->charset('binary'); // BLOB
```

##### `timeTz()` {.collection-method}

The `timeTz` method creates a `TIME` (with timezone) equivalent column with an optional fractional seconds precision:

```php
$table->timeTz('sunrise', precision: 0);
```

##### `time()` {.collection-method}

The `time` method creates a `TIME` equivalent column with an optional fractional seconds precision:

```php
$table->time('sunrise', precision: 0);
```

##### `timestampTz()` {.collection-method}

The `timestampTz` method creates a `TIMESTAMP` (with timezone) equivalent column with an optional fractional seconds precision:

```php
$table->timestampTz('added_at', precision: 0);
```

##### `timestamp()` {.collection-method}

The `timestamp` method creates a `TIMESTAMP` equivalent column with an optional fractional seconds precision:

```php
$table->timestamp('added_at', precision: 0);
```

##### `timestampsTz()` {.collection-method}

The `timestampsTz` method creates `created_at` and `updated_at` `TIMESTAMP` (with timezone) equivalent columns with an optional fractional seconds precision:

```php
$table->timestampsTz(precision: 0);
```

##### `timestamps()` {.collection-method}

The `timestamps` method creates `created_at` and `updated_at` `TIMESTAMP` equivalent columns with an optional fractional seconds precision:

```php
$table->timestamps(precision: 0);
```

##### `tinyIncrements()` {.collection-method}

The `tinyIncrements` method creates an auto-incrementing `UNSIGNED TINYINT` equivalent column as a primary key:

```php
$table->tinyIncrements('id');
```

##### `tinyInteger()` {.collection-method}

The `tinyInteger` method creates a `TINYINT` equivalent column:

```php
$table->tinyInteger('votes');
```

##### `tinyText()` {.collection-method}

The `tinyText` method creates a `TINYTEXT` equivalent column:

```php
$table->tinyText('notes');
```

When utilizing MySQL or MariaDB, you may apply a `binary` character set to the column in order to create a `TINYBLOB` equivalent column:

```php
$table->tinyText('data')->charset('binary'); // TINYBLOB
```

##### `unsignedBigInteger()` {.collection-method}

The `unsignedBigInteger` method creates an `UNSIGNED BIGINT` equivalent column:

```php
$table->unsignedBigInteger('votes');
```

##### `unsignedInteger()` {.collection-method}

The `unsignedInteger` method creates an `UNSIGNED INTEGER` equivalent column:

```php
$table->unsignedInteger('votes');
```

##### `unsignedMediumInteger()` {.collection-method}

The `unsignedMediumInteger` method creates an `UNSIGNED MEDIUMINT` equivalent column:

```php
$table->unsignedMediumInteger('votes');
```

##### `unsignedSmallInteger()` {.collection-method}

The `unsignedSmallInteger` method creates an `UNSIGNED SMALLINT` equivalent column:

```php
$table->unsignedSmallInteger('votes');
```

##### `unsignedTinyInteger()` {.collection-method}

The `unsignedTinyInteger` method creates an `UNSIGNED TINYINT` equivalent column:

```php
$table->unsignedTinyInteger('votes');
```

##### `ulidMorphs()` {.collection-method}

The `ulidMorphs` method is a convenience method that adds a `{column}_type` `VARCHAR` equivalent column and a `{column}_id` `CHAR(26)` equivalent column.

This method is intended to be used when defining the columns necessary for a polymorphic [Eloquent relationship](https://laravel.com/docs/eloquent-relationships) that use ULID identifiers. In the following example, `taggable_type` and `taggable_id` columns would be created:

```php
$table->ulidMorphs('taggable');
```

##### `uuidMorphs()` {.collection-method}

The `uuidMorphs` method is a convenience method that adds a `{column}_type` `VARCHAR` equivalent column and a `{column}_id` `CHAR(36)` equivalent column.

This method is intended to be used when defining the columns necessary for a [polymorphic Eloquent relationship](https://laravel.com/docs/eloquent-relationships#polymorphic-relationships) that use UUID identifiers. In the following example, `taggable_type` and `taggable_id` columns would be created:

```php
$table->uuidMorphs('taggable');
```

##### `ulid()` {.collection-method}

The `ulid` method creates a `ULID` equivalent column:

```php
$table->ulid('id');
```

##### `uuid()` {.collection-method}

The `uuid` method creates a `UUID` equivalent column:

```php
$table->uuid('id');
```

##### `vector()` {.collection-method}

The `vector` method creates a `vector` equivalent column:

```php
$table->vector('embedding', dimensions: 1536);
```

Vector columns are supported on PostgreSQL connections using the `pgvector` extension and MariaDB 11.7 or later. When utilizing PostgreSQL, `pgvector` must be loaded before `vector` columns can be created:

```php
Schema::ensureVectorExtensionExists();
```

To speed up [vector similarity queries](https://laravel.com/docs/queries#vector-similarity-clauses), you may add a vector index to the column. Calling the `index` method on a `vector` column creates a vector index using cosine distance:

```php
$table->vector('embedding', dimensions: 1536)->index();
```

##### `year()` {.collection-method}

The `year` method creates a `YEAR` equivalent column:

```php
$table->year('birth_year');
```

#### Column Modifiers

In addition to the column types listed above, there are several column "modifiers" you may use when adding a column to a database table. For example, to make the column "nullable", you may use the `nullable` method:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable();
});
```

The following table contains all of the available column modifiers. This list does not include [index modifiers](#creating-indexes):

<div class="overflow-auto">

| Modifier                            | Description                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| `->after('column')`                 | Place the column "after" another column (MariaDB / MySQL).                                     |
| `->autoIncrement()`                 | Set `INTEGER` columns as auto-incrementing (primary key).                                      |
| `->charset('utf8mb4')`              | Specify a character set for the column (MariaDB / MySQL).                                      |
| `->collation('utf8mb4_unicode_ci')` | Specify a collation for the column.                                                            |
| `->comment('my comment')`           | Add a comment to a column (MariaDB / MySQL / PostgreSQL).                                      |
| `->default($value)`                 | Specify a "default" value for the column.                                                      |
| `->first()`                         | Place the column "first" in the table (MariaDB / MySQL).                                       |
| `->from($integer)`                  | Set the starting value of an auto-incrementing field (MariaDB / MySQL / PostgreSQL).           |
| `->instant()`                       | Add or modify the column using an instant operation (MySQL).                                   |
| `->invisible()`                     | Make the column "invisible" to `SELECT *` queries (MariaDB / MySQL).                           |
| `->lock($mode)`                     | Specify a lock mode for the column operation (MySQL).                                          |
| `->nullable($value = true)`         | Allow `NULL` values to be inserted into the column.                                            |
| `->storedAs($expression)`           | Create a stored generated column (MariaDB / MySQL / PostgreSQL / SQLite).                      |
| `->unsigned()`                      | Set `INTEGER` columns as `UNSIGNED` (MariaDB / MySQL).                                         |
| `->using($expression)`              | Specify a casting expression when changing the column type (PostgreSQL).                       |
| `->useCurrent()`                    | Set `TIMESTAMP` columns to use `CURRENT_TIMESTAMP` as default value.                           |
| `->useCurrentOnUpdate()`            | Set `TIMESTAMP` columns to use `CURRENT_TIMESTAMP` when a record is updated (MariaDB / MySQL). |
| `->virtualAs($expression)`          | Create a virtual generated column (MariaDB / MySQL / SQLite).                                  |
| `->generatedAs($expression)`        | Create an identity column with specified sequence options (PostgreSQL).                        |
| `->always()`                        | Defines the precedence of sequence values over input for an identity column (PostgreSQL).      |

</div>

##### Default Expressions

The `default` modifier accepts a value or an `Illuminate\Database\Query\Expression` instance. Using an `Expression` instance will prevent Laravel from wrapping the value in quotes and allow you to use database specific functions. One situation where this is particularly useful is when you need to assign default values to JSON columns:

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->json('movies')->default(new Expression('(JSON_ARRAY())'));
            $table->timestamps();
        });
    }
};
```

> **Warning:**
> Support for default expressions depends on your database driver, database version, and the field type. Please refer to your database's documentation.

##### Column Order

When using the MariaDB or MySQL database, the `after` method may be used to add columns after an existing column in the schema:

```php
$table->after('password', function (Blueprint $table) {
    $table->string('address_line1');
    $table->string('address_line2');
    $table->string('city');
});
```

##### Instant Column Operations

When using MySQL, you may chain the `instant` modifier onto a column definition to indicate that the column should be added or modified using MySQL's "instant" algorithm. This algorithm allows certain schema changes to be performed without a full table rebuild, making them nearly instantaneous regardless of table size:

```php
$table->string('name')->nullable()->instant();
```

Instant column additions can only append columns to the end of the table, so the `instant` modifier cannot be combined with the `after` or `first` modifiers. In addition, the algorithm does not support all column types or operations. If the requested operation is incompatible, MySQL will raise an error.

Please refer to [MySQL's documentation](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl-operations.html) to determine which operations are compatible with instant column modifications.

##### DDL Locking

When using MySQL, you may chain the `lock` modifier onto column, index, or foreign key definitions to control table locking during schema operations. MySQL supports several lock modes: `none` allows concurrent reads and writes, `shared` allows concurrent reads but blocks writes, `exclusive` blocks all concurrent access, and `default` lets MySQL choose the most appropriate mode:

```php
$table->string('name')->lock('none');

$table->index('email')->lock('shared');
```

If the requested lock mode is incompatible with the operation, MySQL will raise an error. The `lock` modifier may be combined with the `instant` modifier to further optimize schema changes:

```php
$table->string('name')->instant()->lock('none');
```

#### Modifying Columns

The `change` method allows you to modify the type and attributes of existing columns. For example, you may wish to increase the size of a `string` column. To see the `change` method in action, let's increase the size of the `name` column from 25 to 50. To accomplish this, we simply define the new state of the column and then call the `change` method:

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->change();
});
```

When modifying a column, you must explicitly include all the modifiers you want to keep on the column definition - any missing attribute will be dropped. For example, to retain the `unsigned`, `default`, and `comment` attributes, you must call each modifier explicitly when changing the column:

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')->unsigned()->default(1)->comment('my comment')->change();
});
```

The `change` method does not change the indexes of the column. Therefore, you may use index modifiers to explicitly add or drop an index when modifying the column:

```php
// Add an index...
$table->bigIncrements('id')->primary()->change();

// Drop an index...
$table->char('postal_code', 10)->unique(false)->change();
```

##### PostgreSQL Column Modifications

When changing a column's type on PostgreSQL, you may use the `using` modifier to specify the expression used to cast the existing values:

```php
Schema::table('users', function (Blueprint $table) {
    $table->date('birthday')->using('birthday::date')->change();
});
```

#### Renaming Columns

To rename a column, you may use the `renameColumn` method provided by the schema builder:

```php
Schema::table('users', function (Blueprint $table) {
    $table->renameColumn('from', 'to');
});
```

#### Dropping Columns

To drop a column, you may use the `dropColumn` method on the schema builder:

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('votes');
});
```

You may drop multiple columns from a table by passing an array of column names to the `dropColumn` method:

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['votes', 'avatar', 'location']);
});
```

##### Available Command Aliases

Laravel provides several convenient methods related to dropping common types of columns. Each of these methods is described in the table below:

<div class="overflow-auto">

| Command                             | Description                                           |
| ----------------------------------- | ----------------------------------------------------- |
| `$table->dropMorphs('morphable');`  | Drop the `morphable_type` and `morphable_id` columns. |
| `$table->dropRememberToken();`      | Drop the `remember_token` column.                     |
| `$table->dropSoftDeletes();`        | Drop the `deleted_at` column.                         |
| `$table->dropSoftDeletesTz();`      | Alias of `dropSoftDeletes()` method.                  |
| `$table->dropTimestamps();`         | Drop the `created_at` and `updated_at` columns.       |
| `$table->dropTimestampsTz();`       | Alias of `dropTimestamps()` method.                   |

</div>

### Indexes

#### Creating Indexes

The Laravel schema builder supports several types of indexes. The following example creates a new `email` column and specifies that its values should be unique. To create the index, we can chain the `unique` method onto the column definition:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->unique();
});
```

Alternatively, you may create the index after defining the column. To do so, you should call the `unique` method on the schema builder blueprint. This method accepts the name of the column that should receive a unique index:

```php
$table->unique('email');
```

You may even pass an array of columns to an index method to create a compound (or composite) index:

```php
$table->index(['account_id', 'created_at']);
```

When creating an index, Laravel will automatically generate an index name based on the table, column names, and the index type, but you may pass a second argument to the method to specify the index name yourself:

```php
$table->unique('email', 'unique_email');
```

##### Available Index Types

Laravel's schema builder blueprint class provides methods for creating each type of index supported by Laravel. Each index method accepts an optional second argument to specify the name of the index. If omitted, the name will be derived from the names of the table and column(s) used for the index, as well as the index type. Each of the available index methods is described in the table below:

<div class="overflow-auto">

| Command                                          | Description                                                    |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `$table->primary('id');`                         | Adds a primary key.                                            |
| `$table->primary(['id', 'parent_id']);`          | Adds composite keys.                                           |
| `$table->unique('email');`                       | Adds a unique index.                                           |
| `$table->index('state');`                        | Adds an index.                                                 |
| `$table->fullText('body');`                      | Adds a full text index (MariaDB / MySQL / PostgreSQL).         |
| `$table->fullText('body')->language('english');` | Adds a full text index of the specified language (PostgreSQL). |
| `$table->spatialIndex('location');`              | Adds a spatial index (except SQLite).                          |
| `$table->vectorIndex('embedding');`              | Adds a vector index (MariaDB / PostgreSQL).                    |

</div>

##### Online Index Creation

By default, creating an index on a large table can lock the table and block reads or writes while the index is being built. When using PostgreSQL or SQL Server, you may chain the `online` method onto an index definition to create the index without locking the table, allowing your application to continue reading and writing data during index creation:

```php
$table->unique('email')->online();
```

When using PostgreSQL, this adds the `CONCURRENTLY` option to the index creation statement. When using SQL Server, this adds the `WITH (online = on)` option.

When using MySQL, you may chain the `inplace` modifier onto an index or foreign key definition to specify that the operation should use the `INPLACE` algorithm:

```php
$table->index('email')->inplace();

$table->foreign('user_id')->references('id')->on('users')->inplace();
```

The `inplace` modifier may be combined with the `lock` modifier to control table locking during the operation:

```php
$table->index('email')->inplace()->lock('none');
```

When using the `inplace` modifier for a foreign key operation, foreign key checks must be disabled.

Refer to [MySQL's documentation](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl-operations.html) to determine which operations support the `INPLACE` algorithm and lock modes.

#### Renaming Indexes

To rename an index, you may use the `renameIndex` method provided by the schema builder blueprint. This method accepts the current index name as its first argument and the desired name as its second argument:

```php
$table->renameIndex('from', 'to');
```

#### Dropping Indexes

To drop an index, you must specify the index's name. By default, Laravel automatically assigns an index name based on the table name, the name of the indexed column, and the index type. Here are some examples:

<div class="overflow-auto">

| Command                                                       | Description                                                 |
| ------------------------------------------------------------- | ----------------------------------------------------------- |
| `$table->dropPrimary('users_id_primary');`                    | Drop a primary key from the "users" table.                  |
| `$table->dropUnique('users_email_unique');`                   | Drop a unique index from the "users" table.                 |
| `$table->dropIndex('geo_state_index');`                       | Drop a basic index from the "geo" table.                    |
| `$table->dropFullText('posts_body_fulltext');`                | Drop a full text index from the "posts" table.              |
| `$table->dropSpatialIndex('geo_location_spatialindex');`      | Drop a spatial index from the "geo" table  (except SQLite). |
| `$table->dropVectorIndex('documents_embedding_vectorindex');` | Drop a vector index from the "documents" table.             |

</div>

If you pass an array of columns into a method that drops indexes, the conventional index name will be generated based on the table name, columns, and index type:

```php
Schema::table('geo', function (Blueprint $table) {
    $table->dropIndex(['state']); // Drops index 'geo_state_index'
});
```

#### Foreign Key Constraints

Laravel also provides support for creating foreign key constraints, which are used to force referential integrity at the database level. For example, let's define a `user_id` column on the `posts` table that references the `id` column on a `users` table:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('posts', function (Blueprint $table) {
    $table->unsignedBigInteger('user_id');

    $table->foreign('user_id')->references('id')->on('users');
});
```

Since this syntax is rather verbose, Laravel provides additional, terser methods that use conventions to provide a better developer experience. When using the `foreignId` method to create your column, the example above can be rewritten like so:

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained();
});
```

The `foreignId` method creates an `UNSIGNED BIGINT` equivalent column, while the `constrained` method will use conventions to determine the table and column being referenced. If your table name does not match Laravel's conventions, you may manually provide it to the `constrained` method. In addition, the name that should be assigned to the generated index may be specified as well:

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained(
        table: 'users', indexName: 'posts_user_id'
    );
});
```

You may also specify the desired action for the "on delete" and "on update" properties of the constraint:

```php
$table->foreignId('user_id')
    ->constrained()
    ->onUpdate('cascade')
    ->onDelete('cascade');
```

An alternative, expressive syntax is also provided for these actions:

<div class="overflow-auto">

| Method                        | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `$table->cascadeOnUpdate();`  | Updates should cascade.                           |
| `$table->restrictOnUpdate();` | Updates should be restricted.                     |
| `$table->nullOnUpdate();`     | Updates should set the foreign key value to null. |
| `$table->noActionOnUpdate();` | No action on updates.                             |
| `$table->cascadeOnDelete();`  | Deletes should cascade.                           |
| `$table->restrictOnDelete();` | Deletes should be restricted.                     |
| `$table->nullOnDelete();`     | Deletes should set the foreign key value to null. |
| `$table->noActionOnDelete();` | Prevents deletes if child records exist.          |

</div>

Any additional [column modifiers](#column-modifiers) must be called before the `constrained` method:

```php
$table->foreignId('user_id')
    ->nullable()
    ->constrained();
```

##### Dropping Foreign Keys

To drop a foreign key, you may use the `dropForeign` method, passing the name of the foreign key constraint to be deleted as an argument. Foreign key constraints use the same naming convention as indexes. In other words, the foreign key constraint name is based on the name of the table and the columns in the constraint, followed by a "\_foreign" suffix:

```php
$table->dropForeign('posts_user_id_foreign');
```

Alternatively, you may pass an array containing the column name that holds the foreign key to the `dropForeign` method. The array will be converted to a foreign key constraint name using Laravel's constraint naming conventions:

```php
$table->dropForeign(['user_id']);
```

##### Toggling Foreign Key Constraints

You may enable or disable foreign key constraints within your migrations by using the following methods:

```php
Schema::enableForeignKeyConstraints();

Schema::disableForeignKeyConstraints();

Schema::withoutForeignKeyConstraints(function () {
    // Constraints disabled within this closure...
});
```

> **Warning:**
> SQLite disables foreign key constraints by default. When using SQLite, make sure to [enable foreign key support](https://laravel.com/docs/database#configuration) in your database configuration before attempting to create them in your migrations.

### Events

For convenience, each migration operation will dispatch an [event](https://laravel.com/docs/events). With the exception of `SchemaDumped` and `SchemaLoaded`, all of the following events implement the `Illuminate\Contracts\Database\Events\MigrationEvent` interface:

<div class="overflow-auto">

| Class                                            | Description                                      |
| ------------------------------------------------ | ------------------------------------------------ |
| `Illuminate\Database\Events\DatabaseRefreshed`   | The `migrate:fresh` or `migrate:refresh` command has finished. |
| `Illuminate\Database\Events\MigrationsStarted`   | A batch of migrations is about to be executed.   |
| `Illuminate\Database\Events\MigrationsEnded`     | A batch of migrations has finished.              |
| `Illuminate\Database\Events\MigrationStarted`    | A single migration is about to be executed.      |
| `Illuminate\Database\Events\MigrationEnded`      | A single migration has finished.                 |
| `Illuminate\Database\Events\NoPendingMigrations` | A migration command found no pending migrations. |
| `Illuminate\Database\Events\SchemaDumped`        | A database schema dump has finished.             |
| `Illuminate\Database\Events\SchemaLoaded`        | An existing database schema dump has loaded.     |

</div>

## Eloquent: Getting Started

> **Source:** [Eloquent: Getting Started](https://laravel.com/docs/eloquent) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

Laravel includes Eloquent, an object-relational mapper (ORM) that makes it enjoyable to interact with your database. When using Eloquent, each database table has a corresponding "Model" that is used to interact with that table. In addition to retrieving records from the database table, Eloquent models allow you to insert, update, and delete records from the table as well.

> **Note:**
> Before getting started, be sure to configure a database connection in your application's `config/database.php` configuration file. For more information on configuring your database, check out [the database configuration documentation](https://laravel.com/docs/database#configuration).

### Generating Model Classes

To get started, let's create an Eloquent model. Models typically live in the `app\Models` directory and extend the `Illuminate\Database\Eloquent\Model` class. You may use the `make:model` [Artisan command](https://laravel.com/docs/artisan) to generate a new model:

```shell
php artisan make:model Flight
```

If you would like to generate a [database migration](https://laravel.com/docs/migrations) when you generate the model, you may use the `--migration` or `-m` option:

```shell
php artisan make:model Flight --migration
```

You may generate various other types of classes when generating a model, such as factories, seeders, policies, controllers, and form requests. In addition, these options may be combined to create multiple classes at once:

```shell
# Generate a model and a FlightFactory class...
php artisan make:model Flight --factory
php artisan make:model Flight -f

# Generate a model and a FlightSeeder class...
php artisan make:model Flight --seed
php artisan make:model Flight -s

# Generate a model and a FlightController class...
php artisan make:model Flight --controller
php artisan make:model Flight -c

# Generate a model, FlightController resource class, and form request classes...
php artisan make:model Flight --controller --resource --requests
php artisan make:model Flight -crR

# Generate a model and a FlightPolicy class...
php artisan make:model Flight --policy

# Generate a model and a migration, factory, seeder, and controller...
php artisan make:model Flight -mfsc

# Shortcut to generate a model, migration, factory, seeder, policy, controller, and form requests...
php artisan make:model Flight --all
php artisan make:model Flight -a

# Generate a pivot model...
php artisan make:model Member --pivot
php artisan make:model Member -p
```

##### Inspecting Models

Sometimes it can be difficult to determine all of a model's available attributes and relationships just by skimming its code. Instead, try the `model:show` Artisan command, which provides a convenient overview of all the model's attributes and relations:

```shell
php artisan model:show Flight
```

### Eloquent Model Conventions

Models generated by the `make:model` command will be placed in the `app/Models` directory. Let's examine a basic model class and discuss some of Eloquent's key conventions:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    // ...
}
```

#### Table Names

After glancing at the example above, you may have noticed that we did not tell Eloquent which database table corresponds to our `Flight` model. By convention, the "snake case", plural name of the class will be used as the table name unless another name is explicitly specified. So, in this case, Eloquent will assume the `Flight` model stores records in the `flights` table, while an `AirTrafficController` model would store records in an `air_traffic_controllers` table.

If your model's corresponding database table does not fit this convention, you may manually specify the model's table name using the `Table` attribute:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('my_flights')]
class Flight extends Model
{
    // ...
}
```

#### Primary Keys

Eloquent will also assume that each model's corresponding database table has a primary key column named `id`. If necessary, you may specify a different column that serves as your model's primary key using the `key` argument on the `Table` attribute:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(key: 'flight_id')]
class Flight extends Model
{
    // ...
}
```

In addition, Eloquent assumes that the primary key is an incrementing integer value, which means that Eloquent will automatically cast the primary key to an integer. If you wish to use a non-incrementing or a non-numeric primary key, you should specify the `keyType` and `incrementing` arguments on the `Table` attribute:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(key: 'uuid', keyType: 'string', incrementing: false)]
class Flight extends Model
{
    // ...
}
```

If you only need to disable auto-incrementing IDs, you may use the `WithoutIncrementing` attribute:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\WithoutIncrementing;
use Illuminate\Database\Eloquent\Model;

#[WithoutIncrementing]
class Flight extends Model
{
    // ...
}
```

##### "Composite" Primary Keys

Eloquent requires each model to have at least one uniquely identifying "ID" that can serve as its primary key. "Composite" primary keys are not supported by Eloquent models. However, you are free to add additional multi-column, unique indexes to your database tables in addition to the table's uniquely identifying primary key.

#### UUID and ULID Keys

Instead of using auto-incrementing integers as your Eloquent model's primary keys, you may choose to use UUIDs instead. UUIDs are universally unique alpha-numeric identifiers that are 36 characters long.

If you would like a model to use a UUID key instead of an auto-incrementing integer key, you may use the `Illuminate\Database\Eloquent\Concerns\HasUuids` trait on the model. Of course, you should ensure that the model has a [UUID equivalent primary key column](https://laravel.com/docs/migrations#column-method-uuid):

```php
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUuids;

    // ...
}

$article = Article::create(['title' => 'Traveling to Europe']);

$article->id; // "018f2b5c-6a7f-7b12-9d6f-2f8a4e0c9c11"
```

By default, the `HasUuids` trait will generate [UUIDv7](https://laravel.com/docs/strings#method-str-uuid7) identifiers for your models. These UUIDs are more efficient for indexed database storage because they can be sorted lexicographically.

You can override the UUID generation process for a given model by defining a `newUniqueId` method on the model. In addition, you may specify which columns should receive UUIDs by defining a `uniqueIds` method on the model:

```php
use Ramsey\Uuid\Uuid;

/**
 * Generate a new UUID for the model.
 */
public function newUniqueId(): string
{
    return (string) Uuid::uuid4();
}

/**
 * Get the columns that should receive a unique identifier.
 *
 * @return array<int, string>
 */
public function uniqueIds(): array
{
    return ['id', 'discount_code'];
}
```

If you wish, you may choose to utilize "ULIDs" instead of UUIDs. ULIDs are similar to UUIDs; however, they are only 26 characters in length. Like ordered UUIDs, ULIDs are lexicographically sortable for efficient database indexing. To utilize ULIDs, you should use the `Illuminate\Database\Eloquent\Concerns\HasUlids` trait on your model. You should also ensure that the model has a [ULID equivalent primary key column](https://laravel.com/docs/migrations#column-method-ulid):

```php
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUlids;

    // ...
}

$article = Article::create(['title' => 'Traveling to Asia']);

$article->id; // "01gd4d3tgrrfqeda94gdbtdk5c"
```

#### Timestamps

By default, Eloquent expects `created_at` and `updated_at` columns to exist on your model's corresponding database table. Eloquent will automatically set these column's values when models are created or updated. If you do not want these columns to be automatically managed by Eloquent, you may set `timestamps` to `false` on your model's `Table` attribute:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(timestamps: false)]
class Flight extends Model
{
    // ...
}
```

If you only need to disable timestamps, you may use the `WithoutTimestamps` attribute:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Model;

#[WithoutTimestamps]
class Flight extends Model
{
    // ...
}
```

If you need to customize the format of your model's timestamps, you may use the `dateFormat` argument on the `Table` attribute. This determines how date attributes are stored in the database:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(dateFormat: 'U')]
class Flight extends Model
{
    // ...
}
```

If you only need to define a date format, you may use the `DateFormat` attribute:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\DateFormat;
use Illuminate\Database\Eloquent\Model;

#[DateFormat('U')]
class Flight extends Model
{
    // ...
}
```

If you need to customize the names of the columns used to store the timestamps, you may define `CREATED_AT` and `UPDATED_AT` constants on your model:

```php
<?php

class Flight extends Model
{
    /**
     * The name of the "created at" column.
     *
     * @var string|null
     */
    public const CREATED_AT = 'creation_date';

    /**
     * The name of the "updated at" column.
     *
     * @var string|null
     */
    public const UPDATED_AT = 'updated_date';
}
```

If you would like to perform model operations without the model having its `updated_at` timestamp modified, you may operate on the model within a closure given to the `withoutTimestamps` method:

```php
Model::withoutTimestamps(fn () => $post->increment('reads'));
```

#### Database Connections

By default, all Eloquent models will use the default database connection that is configured for your application. If you would like to specify a different connection that should be used when interacting with a particular model, you may use the `Connection` attribute:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Connection;
use Illuminate\Database\Eloquent\Model;

#[Connection('mysql')]
class Flight extends Model
{
    // ...
}
```

#### Default Attribute Values

By default, a newly instantiated model instance will not contain any attribute values. If you would like to define the default values for some of your model's attributes, you may define an `$attributes` property on your model. Attribute values placed in the `$attributes` array should be in their raw, "storable" format as if they were just read from the database:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'options' => '[]',
        'delayed' => false,
    ];
}
```

#### Refreshing Attributes After Writes

If your database contains generated columns, you may configure Eloquent to refresh specific attributes after a model is inserted or updated. To do so, define the `Refreshes` attribute on your model:

```php
use Illuminate\Database\Eloquent\Attributes\Refreshes;

#[Refreshes('name')]
class User extends Model
{
    // ...
}
```

You may specify multiple attributes as an array:

```php
#[Refreshes(['name', 'slug'])]
```

After the model is written, the configured attributes will be refreshed from the database.

#### Configuring Eloquent Strictness

Laravel offers several methods that allow you to configure Eloquent's behavior and "strictness" in a variety of situations.

First, the `preventLazyLoading` method accepts an optional boolean argument that indicates if lazy loading should be prevented. For example, you may wish to only disable lazy loading in non-production environments so that your production environment will continue to function normally even if a lazy loaded relationship is accidentally present in production code. Typically, this method should be invoked in the `boot` method of your application's `AppServiceProvider`:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

Also, you may instruct Laravel to throw an exception when attempting to fill an unfillable attribute by invoking the `preventSilentlyDiscardingAttributes` method. This can help prevent unexpected errors during local development when attempting to set an attribute that has not been added to the model's `fillable` array:

```php
Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
```

### Retrieving Models

Once you have created a model and [its associated database table](https://laravel.com/docs/migrations#generating-migrations), you are ready to start retrieving data from your database. You can think of each Eloquent model as a powerful [query builder](https://laravel.com/docs/queries) allowing you to fluently query the database table associated with the model. The model's `all` method will retrieve all of the records from the model's associated database table:

```php
use App\Models\Flight;

foreach (Flight::all() as $flight) {
    echo $flight->name;
}
```

##### Building Queries

The Eloquent `all` method will return all of the results in the model's table. However, since each Eloquent model serves as a [query builder](https://laravel.com/docs/queries), you may add additional constraints to queries and then invoke the `get` method to retrieve the results:

```php
$flights = Flight::where('active', 1)
    ->orderBy('name')
    ->limit(10)
    ->get();
```

> **Note:**
> Since Eloquent models are query builders, you should review all of the methods provided by Laravel's [query builder](https://laravel.com/docs/queries). You may use any of these methods when writing your Eloquent queries.

##### Refreshing Models

If you already have an instance of an Eloquent model that was retrieved from the database, you can "refresh" the model using the `fresh` and `refresh` methods. The `fresh` method will re-retrieve the model from the database. The existing model instance will not be affected:

```php
$flight = Flight::where('number', 'FR 900')->first();

$freshFlight = $flight->fresh();
```

The `refresh` method will re-hydrate the existing model using fresh data from the database. In addition, all of its loaded relationships will be refreshed as well:

```php
$flight = Flight::where('number', 'FR 900')->first();

$flight->number = 'FR 456';

$flight->refresh();

$flight->number; // "FR 900"
```

If you need to refresh a model and acquire a pessimistic lock within a transaction, you may use the `refreshForUpdate` method. This method reloads the model using a `FOR UPDATE` lock:

```php
DB::transaction(function () use ($flight) {
    $flight->refreshForUpdate();

    // Update the locked model...
});
```

#### Collections

As we have seen, Eloquent methods like `all` and `get` retrieve multiple records from the database. However, these methods don't return a plain PHP array. Instead, an instance of `Illuminate\Database\Eloquent\Collection` is returned.

The Eloquent `Collection` class extends Laravel's base `Illuminate\Support\Collection` class, which provides a [variety of helpful methods](https://laravel.com/docs/collections#available-methods) for interacting with data collections. For example, the `reject` method may be used to remove models from a collection based on the results of an invoked closure:

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function (Flight $flight) {
    return $flight->cancelled;
});
```

In addition to the methods provided by Laravel's base collection class, the Eloquent collection class provides [a few extra methods](https://laravel.com/docs/eloquent-collections#available-methods) that are specifically intended for interacting with collections of Eloquent models.

Since all of Laravel's collections implement PHP's iterable interfaces, you may loop over collections as if they were an array:

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

#### Chunking Results

Your application may run out of memory if you attempt to load tens of thousands of Eloquent records via the `all` or `get` methods. Instead of using these methods, the `chunk` method may be used to process large numbers of models more efficiently.

The `chunk` method will retrieve a subset of Eloquent models, passing them to a closure for processing. Since only the current chunk of Eloquent models is retrieved at a time, the `chunk` method will provide significantly reduced memory usage when working with a large number of models:

```php
use App\Models\Flight;
use Illuminate\Database\Eloquent\Collection;

Flight::chunk(200, function (Collection $flights) {
    foreach ($flights as $flight) {
        // ...
    }
});
```

The first argument passed to the `chunk` method is the number of records you wish to receive per "chunk". The closure passed as the second argument will be invoked for each chunk that is retrieved from the database. A database query will be executed to retrieve each chunk of records passed to the closure.

If you are filtering the results of the `chunk` method based on a column that you will also be updating while iterating over the results, you should use the `chunkById` method. Using the `chunk` method in these scenarios could lead to unexpected and inconsistent results. Internally, the `chunkById` method will always retrieve models with an `id` column greater than the last model in the previous chunk:

```php
Flight::where('departed', true)
    ->chunkById(200, function (Collection $flights) {
        $flights->each->update(['departed' => false]);
    }, column: 'id');
```

Since the `chunkById` and `lazyById` methods add their own "where" conditions to the query being executed, you should typically [logically group](https://laravel.com/docs/queries#logical-grouping) your own conditions within a closure:

```php
Flight::where(function ($query) {
    $query->where('delayed', true)->orWhere('cancelled', true);
})->chunkById(200, function (Collection $flights) {
    $flights->each->update([
        'departed' => false,
        'cancelled' => true
    ]);
}, column: 'id');
```

#### Chunking Using Lazy Collections

The `lazy` method works similarly to [the `chunk` method](#chunking-results) in the sense that, behind the scenes, it executes the query in chunks. However, instead of passing each chunk directly into a callback as is, the `lazy` method returns a flattened [LazyCollection](https://laravel.com/docs/collections#lazy-collections) of Eloquent models, which lets you interact with the results as a single stream:

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    // ...
}
```

If you are filtering the results of the `lazy` method based on a column that you will also be updating while iterating over the results, you should use the `lazyById` method. Internally, the `lazyById` method will always retrieve models with an `id` column greater than the last model in the previous chunk:

```php
Flight::where('departed', true)
    ->lazyById(200, column: 'id')
    ->each->update(['departed' => false]);
```

You may filter the results based on the descending order of the `id` using the `lazyByIdDesc` method.

#### Cursors

Similar to the `lazy` method, the `cursor` method may be used to significantly reduce your application's memory consumption when iterating through tens of thousands of Eloquent model records.

The `cursor` method will only execute a single database query; however, the individual Eloquent models will not be hydrated until they are actually iterated over. Therefore, only one Eloquent model is kept in memory at any given time while iterating over the cursor.

> **Warning:**
> Since the `cursor` method only ever holds a single Eloquent model in memory at a time, it cannot eager load relationships. If you need to eager load relationships, consider using [the `lazy` method](#chunking-using-lazy-collections) instead.

Internally, the `cursor` method uses PHP [generators](https://www.php.net/manual/en/language.generators.overview.php) to implement this functionality:

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    // ...
}
```

The `cursor` returns an `Illuminate\Support\LazyCollection` instance. [Lazy collections](https://laravel.com/docs/collections#lazy-collections) allow you to use many of the collection methods available on typical Laravel collections while only loading a single model into memory at a time:

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

Although the `cursor` method uses far less memory than a regular query (by only holding a single Eloquent model in memory at a time), it will still eventually run out of memory. This is [due to PHP's PDO driver internally caching all raw query results in its buffer](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php). If you're dealing with a very large number of Eloquent records, consider using [the `lazy` method](#chunking-using-lazy-collections) instead.

#### Advanced Subqueries

##### Subquery Selects

Eloquent also offers advanced subquery support, which allows you to pull information from related tables in a single query. For example, let's imagine that we have a table of flight `destinations` and a table of `flights` to destinations. The `flights` table contains an `arrived_at` column which indicates when the flight arrived at the destination.

Using the subquery functionality available to the query builder's `select` and `addSelect` methods, we can select all of the `destinations` and the name of the flight that most recently arrived at that destination using a single query:

```php
use App\Models\Destination;
use App\Models\Flight;

return Destination::addSelect(['last_flight' => Flight::select('name')
    ->whereColumn('destination_id', 'destinations.id')
    ->orderByDesc('arrived_at')
    ->limit(1)
])->get();
```

##### Subquery Ordering

In addition, the query builder's `orderBy` function supports subqueries. Continuing to use our flight example, we may use this functionality to sort all destinations based on when the last flight arrived at that destination. Again, this may be done while executing a single database query:

```php
return Destination::orderByDesc(
    Flight::select('arrived_at')
        ->whereColumn('destination_id', 'destinations.id')
        ->orderByDesc('arrived_at')
        ->limit(1)
)->get();
```

### Retrieving Single Models / Aggregates

In addition to retrieving all of the records matching a given query, you may also retrieve single records using the `find`, `first`, or `firstWhere` methods. Instead of returning a collection of models, these methods return a single model instance:

```php
use App\Models\Flight;

// Retrieve a model by its primary key...
$flight = Flight::find(1);

// Retrieve the first model matching the query constraints...
$flight = Flight::where('active', 1)->first();

// Alternative to retrieving the first model matching the query constraints...
$flight = Flight::firstWhere('active', 1);
```

Sometimes you may wish to perform some other action if no results are found. The `findOr` and `firstOr` methods will return a single model instance or, if no results are found, execute the given closure. The value returned by the closure will be considered the result of the method:

```php
$flight = Flight::findOr(1, function () {
    // ...
});

$flight = Flight::where('legs', '>', 3)->firstOr(function () {
    // ...
});
```

##### Not Found Exceptions

Sometimes you may wish to throw an exception if a model is not found. This is particularly useful in routes or controllers. The `findOrFail` and `firstOrFail` methods will retrieve the first result of the query; however, if no result is found, an `Illuminate\Database\Eloquent\ModelNotFoundException` will be thrown:

```php
$flight = Flight::findOrFail(1);

$flight = Flight::where('legs', '>', 3)->firstOrFail();
```

If the `ModelNotFoundException` is not caught, a 404 HTTP response is automatically sent back to the client:

```php
use App\Models\Flight;

Route::get('/api/flights/{id}', function (string $id) {
    return Flight::findOrFail($id);
});
```

#### Retrieving or Creating Models

The `firstOrCreate` method will attempt to locate a database record using the given column / value pairs. If the model cannot be found in the database, a record will be inserted with the attributes resulting from merging the first array argument with the optional second array argument.

The `firstOrNew` method, like `firstOrCreate`, will attempt to locate a record in the database matching the given attributes. However, if a model is not found, a new model instance will be returned. Note that the model returned by `firstOrNew` has not yet been persisted to the database. You will need to manually call the `save` method to persist it:

```php
use App\Models\Flight;

// Retrieve flight by name or create it if it doesn't exist...
$flight = Flight::firstOrCreate([
    'name' => 'London to Paris'
]);

// Retrieve flight by name or create it with the name, delayed, and arrival_time attributes...
$flight = Flight::firstOrCreate(
    ['name' => 'London to Paris'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);

// Retrieve flight by name or instantiate a new Flight instance...
$flight = Flight::firstOrNew([
    'name' => 'London to Paris'
]);

// Retrieve flight by name or instantiate with the name, delayed, and arrival_time attributes...
$flight = Flight::firstOrNew(
    ['name' => 'Tokyo to Sydney'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);
```

#### Retrieving Aggregates

When interacting with Eloquent models, you may also use the `count`, `sum`, `max`, and other [aggregate methods](https://laravel.com/docs/queries#aggregates) provided by the Laravel [query builder](https://laravel.com/docs/queries). As you might expect, these methods return a scalar value instead of an Eloquent model instance:

```php
$count = Flight::where('active', 1)->count();

$max = Flight::where('active', 1)->max('price');
```

### Inserting and Updating Models

#### Inserts

Of course, when using Eloquent, we don't only need to retrieve models from the database. We also need to insert new records. Thankfully, Eloquent makes it simple. To insert a new record into the database, you should instantiate a new model instance and set attributes on the model. Then, call the `save` method on the model instance:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * Store a new flight in the database.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the request...

        $flight = new Flight;

        $flight->name = $request->name;

        $flight->save();

        return redirect('/flights');
    }
}
```

In this example, we assign the `name` field from the incoming HTTP request to the `name` attribute of the `App\Models\Flight` model instance. When we call the `save` method, a record will be inserted into the database. The model's `created_at` and `updated_at` timestamps will automatically be set when the `save` method is called, so there is no need to set them manually.

If you would like to save the model within a database transaction, you may use the `saveOrFail` method. If an exception is thrown during the save, the transaction will automatically be rolled back:

```php
$flight->saveOrFail();
```

Alternatively, you may use the `create` method to "save" a new model using a single PHP statement. The inserted model instance will be returned to you by the `create` method:

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

However, before using the `create` method, you will need to specify either a `Fillable` or `Guarded` attribute on your model class. These attributes are required because all Eloquent models are protected against mass assignment vulnerabilities by default. To learn more about mass assignment, please consult the [mass assignment documentation](#mass-assignment).

#### Updates

The `save` method may also be used to update models that already exist in the database. To update a model, you should retrieve it and set any attributes you wish to update. Then, you should call the model's `save` method. Again, the `updated_at` timestamp will automatically be updated, so there is no need to manually set its value:

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->name = 'Paris to London';

$flight->save();
```

If you would like to update the model within a database transaction, you may use the `updateOrFail` method. If an exception is thrown during the update, the transaction will automatically be rolled back:

```php
$flight->updateOrFail(['name' => 'Paris to London']);
```

Occasionally, you may need to update an existing model or create a new model if no matching model exists. Like the `firstOrCreate` method, the `updateOrCreate` method persists the model, so there's no need to manually call the `save` method.

In the example below, if a flight exists with a `departure` location of `Oakland` and a `destination` location of `San Diego`, its `price` and `discounted` columns will be updated. If no such flight exists, a new flight will be created which has the attributes resulting from merging the first argument array with the second argument array:

```php
$flight = Flight::updateOrCreate(
    ['departure' => 'Oakland', 'destination' => 'San Diego'],
    ['price' => 99, 'discounted' => 1]
);
```

When using methods such as `firstOrCreate` or `updateOrCreate`, you may not know whether a new model has been created or an existing one has been updated. The `wasRecentlyCreated` property indicates if the model was created during its current lifecycle:

```php
$flight = Flight::updateOrCreate(
    // ...
);

if ($flight->wasRecentlyCreated) {
    // New flight record was inserted...
}
```

##### Mass Updates

Updates can also be performed against models that match a given query. In this example, all flights that are `active` and have a `destination` of `San Diego` will be marked as delayed:

```php
Flight::where('active', 1)
    ->where('destination', 'San Diego')
    ->update(['delayed' => 1]);
```

The `update` method expects an array of column and value pairs representing the columns that should be updated. The `update` method returns the number of affected rows.

> **Warning:**
> When issuing a mass update via Eloquent, the `saving`, `saved`, `updating`, and `updated` model events will not be fired for the updated models. This is because the models are never actually retrieved when issuing a mass update.

##### Examining Attribute Changes

Eloquent provides the `isDirty`, `isClean`, and `wasChanged` methods to examine the internal state of your model and determine how its attributes have changed from when the model was originally retrieved.

The `isDirty` method determines if any of the model's attributes have been changed since the model was retrieved. You may pass a specific attribute name or an array of attributes to the `isDirty` method to determine if any of the attributes are "dirty". The `isClean` method will determine if an attribute has remained unchanged since the model was retrieved. This method also accepts an optional attribute argument:

```php
use App\Models\User;

$user = User::create([
    'first_name' => 'Taylor',
    'last_name' => 'Otwell',
    'title' => 'Developer',
]);

$user->title = 'Painter';

$user->isDirty(); // true
$user->isDirty('title'); // true
$user->isDirty('first_name'); // false
$user->isDirty(['first_name', 'title']); // true

$user->isClean(); // false
$user->isClean('title'); // false
$user->isClean('first_name'); // true
$user->isClean(['first_name', 'title']); // false

$user->save();

$user->isDirty(); // false
$user->isClean(); // true
```

The `wasChanged` method determines if any attributes were changed when the model was last saved within the current request cycle. If needed, you may pass an attribute name to see if a particular attribute was changed:

```php
$user = User::create([
    'first_name' => 'Taylor',
    'last_name' => 'Otwell',
    'title' => 'Developer',
]);

$user->title = 'Painter';

$user->save();

$user->wasChanged(); // true
$user->wasChanged('title'); // true
$user->wasChanged(['title', 'slug']); // true
$user->wasChanged('first_name'); // false
$user->wasChanged(['first_name', 'title']); // true
```

The `getOriginal` method returns an array containing the original attributes of the model regardless of any changes to the model since it was retrieved. If needed, you may pass a specific attribute name to get the original value of a particular attribute:

```php
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->name = 'Jack';
$user->name; // Jack

$user->getOriginal('name'); // John
$user->getOriginal(); // Array of original attributes...
```

The `getChanges` method returns an array containing the attributes that changed when the model was last saved, while the `getPrevious` method returns an array containing the original attribute values before the model was last saved:

```php
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->update([
    'name' => 'Jack',
    'email' => 'jack@example.com',
]);

$user->getChanges();

/*
    [
        'name' => 'Jack',
        'email' => 'jack@example.com',
    ]
*/

$user->getPrevious();

/*
    [
        'name' => 'John',
        'email' => 'john@example.com',
    ]
*/
```

#### Mass Assignment

You may use the `create` method to "save" a new model using a single PHP statement. The inserted model instance will be returned to you by the method:

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

However, before using the `create` method, you will need to specify either a `Fillable` or `Guarded` attribute on your model class. These attributes are required because all Eloquent models are protected against mass assignment vulnerabilities by default.

A mass assignment vulnerability occurs when a user passes an unexpected HTTP request field and that field changes a column in your database that you did not expect. For example, a malicious user might send an `is_admin` parameter through an HTTP request, which is then passed to your model's `create` method, allowing the user to escalate themselves to an administrator.

So, to get started, you should define which model attributes you want to make mass assignable. You may do this using the `Fillable` attribute on the model. For example, let's make the `name` attribute of our `Flight` model mass assignable:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name'])]
class Flight extends Model
{
    // ...
}
```

Once you have specified which attributes are mass assignable, you may use the `create` method to insert a new record in the database. The `create` method returns the newly created model instance:

```php
$flight = Flight::create(['name' => 'London to Paris']);
```

If you already have a model instance, you may use the `fill` method to populate it with an array of attributes:

```php
$flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

##### Mass Assignment and JSON Columns

When assigning JSON columns, each column's mass assignable key must be specified in your model's `Fillable` attribute. For security, Laravel does not support updating nested JSON attributes when using the `Guarded` attribute:

```php
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['options->enabled'])]
class Flight extends Model
{
    // ...
}
```

##### Allowing Mass Assignment

If you would like to make all of your attributes mass assignable, you may use the `Unguarded` attribute on your model. If you choose to unguard your model, you should take special care to always hand-craft the arrays passed to Eloquent's `fill`, `create`, and `update` methods:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Flight extends Model
{
    // ...
}
```

##### Mass Assignment Exceptions

By default, attributes that are not included in the `Fillable` attribute are silently discarded when performing mass-assignment operations. In production, this is expected behavior; however, during local development it can lead to confusion as to why model changes are not taking effect.

If you wish, you may instruct Laravel to throw an exception when attempting to fill an unfillable attribute by invoking the `preventSilentlyDiscardingAttributes` method. Typically, this method should be invoked in the `boot` method of your application's `AppServiceProvider` class:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
}
```

#### Upserts

Eloquent's `upsert` method may be used to update or create records in a single, atomic operation. The method's first argument consists of the values to insert or update, while the second argument lists the column(s) that uniquely identify records within the associated table. The method's third and final argument is an array of the columns that should be updated if a matching record already exists in the database. The `upsert` method will automatically set the `created_at` and `updated_at` timestamps if timestamps are enabled on the model:

```php
Flight::upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
], uniqueBy: ['departure', 'destination'], update: ['price']);
```

> **Warning:**
> All databases except SQL Server require the columns in the second argument of the `upsert` method to have a "primary" or "unique" index. In addition, the MariaDB and MySQL database drivers ignore the second argument of the `upsert` method and always use the "primary" and "unique" indexes of the table to detect existing records.

### Deleting Models

To delete a model, you may call the `delete` method on the model instance:

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->delete();
```

If you would like to delete the model within a database transaction, you may use the `deleteOrFail` method. If an exception is thrown during the delete, the transaction will automatically be rolled back:

```php
$flight->deleteOrFail();
```

##### Deleting an Existing Model by its Primary Key

In the example above, we are retrieving the model from the database before calling the `delete` method. However, if you know the primary key of the model, you may delete the model without explicitly retrieving it by calling the `destroy` method. In addition to accepting the single primary key, the `destroy` method will accept multiple primary keys, an array of primary keys, or a [collection](https://laravel.com/docs/collections) of primary keys:

```php
Flight::destroy(1);

Flight::destroy(1, 2, 3);

Flight::destroy([1, 2, 3]);

Flight::destroy(collect([1, 2, 3]));
```

If you are utilizing [soft deleting models](#soft-deleting), you may permanently delete models via the `forceDestroy` method:

```php
Flight::forceDestroy(1);
```

> **Warning:**
> The `destroy` method loads each model individually and calls the `delete` method so that the `deleting` and `deleted` events are properly dispatched for each model.

##### Deleting Models Using Queries

Of course, you may build an Eloquent query to delete all models matching your query's criteria. In this example, we will delete all flights that are marked as inactive. Like mass updates, mass deletes will not dispatch model events for the models that are deleted:

```php
$deleted = Flight::where('active', 0)->delete();
```

To delete all models in a table, you should execute a query without adding any conditions:

```php
$deleted = Flight::query()->delete();
```

> **Warning:**
> When executing a mass delete statement via Eloquent, the `deleting` and `deleted` model events will not be dispatched for the deleted models. This is because the models are never actually retrieved when executing the delete statement.

#### Soft Deleting

In addition to actually removing records from your database, Eloquent can also "soft delete" models. When models are soft deleted, they are not actually removed from your database. Instead, a `deleted_at` attribute is set on the model indicating the date and time at which the model was "deleted". To enable soft deletes for a model, add the `Illuminate\Database\Eloquent\SoftDeletes` trait to the model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Flight extends Model
{
    use SoftDeletes;
}
```

> **Note:**
> The `SoftDeletes` trait will automatically cast the `deleted_at` attribute to a `DateTime` / `Carbon` instance for you.

You should also add the `deleted_at` column to your database table. The Laravel [schema builder](https://laravel.com/docs/migrations) contains a helper method to create this column:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('flights', function (Blueprint $table) {
    $table->softDeletes();
});

Schema::table('flights', function (Blueprint $table) {
    $table->dropSoftDeletes();
});
```

Now, when you call the `delete` method on the model, the `deleted_at` column will be set to the current date and time. However, the model's database record will be left in the table. When querying a model that uses soft deletes, the soft deleted models will automatically be excluded from all query results.

To determine if a given model instance has been soft deleted, you may use the `trashed` method:

```php
if ($flight->trashed()) {
    // ...
}
```

##### Restoring Soft Deleted Models

Sometimes you may wish to "un-delete" a soft deleted model. To restore a soft deleted model, you may call the `restore` method on a model instance. The `restore` method will set the model's `deleted_at` column to `null`:

```php
$flight->restore();
```

You may also use the `restore` method in a query to restore multiple models. Again, like other "mass" operations, this will not dispatch any model events for the models that are restored:

```php
Flight::withTrashed()
    ->where('airline_id', 1)
    ->restore();
```

The `restore` method may also be used when building [relationship](https://laravel.com/docs/eloquent-relationships) queries:

```php
$flight->history()->restore();
```

##### Permanently Deleting Models

Sometimes you may need to truly remove a model from your database. You may use the `forceDelete` method to permanently remove a soft deleted model from the database table:

```php
$flight->forceDelete();
```

You may also use the `forceDelete` method when building Eloquent relationship queries:

```php
$flight->history()->forceDelete();
```

#### Querying Soft Deleted Models

##### Including Soft Deleted Models

As noted above, soft deleted models will automatically be excluded from query results. However, you may force soft deleted models to be included in a query's results by calling the `withTrashed` method on the query:

```php
use App\Models\Flight;

$flights = Flight::withTrashed()
    ->where('account_id', 1)
    ->get();
```

The `withTrashed` method may also be called when building a [relationship](https://laravel.com/docs/eloquent-relationships) query:

```php
$flight->history()->withTrashed()->get();
```

##### Retrieving Only Soft Deleted Models

The `onlyTrashed` method will retrieve **only** soft deleted models:

```php
$flights = Flight::onlyTrashed()
    ->where('airline_id', 1)
    ->get();
```

### Pruning Models

Sometimes you may want to periodically delete models that are no longer needed. To accomplish this, you may add the `Illuminate\Database\Eloquent\Prunable` or `Illuminate\Database\Eloquent\MassPrunable` trait to the models you would like to periodically prune. After adding one of the traits to the model, implement a `prunable` method which returns an Eloquent query builder that resolves the models that are no longer needed:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class Flight extends Model
{
    use Prunable;

    /**
     * Get the prunable model query.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->minus(months: 1));
    }
}
```

When marking models as `Prunable`, you may also define a `pruning` method on the model. This method will be called before the model is deleted. This method can be useful for deleting any additional resources associated with the model, such as stored files, before the model is permanently removed from the database:

```php
/**
 * Prepare the model for pruning.
 */
protected function pruning(): void
{
    // ...
}
```

After configuring your prunable model, you should schedule the `model:prune` Artisan command in your application's `routes/console.php` file. You are free to choose the appropriate interval at which this command should be run:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune')->daily();
```

Behind the scenes, the `model:prune` command will automatically detect "Prunable" models within your application's `app/Models` directory. If your models are in a different location, you may use the `--model` option to specify the model class names:

```php
Schedule::command('model:prune', [
    '--model' => [Address::class, Flight::class],
])->daily();
```

If you wish to exclude certain models from being pruned while pruning all other detected models, you may use the `--except` option:

```php
Schedule::command('model:prune', [
    '--except' => [Address::class, Flight::class],
])->daily();
```

You may test your `prunable` query by executing the `model:prune` command with the `--pretend` option. When pretending, the `model:prune` command will simply report how many records would be pruned if the command were to actually run:

```shell
php artisan model:prune --pretend
```

> **Warning:**
> Soft deleting models will be permanently deleted (`forceDelete`) if they match the prunable query.

##### Mass Pruning

When models are marked with the `Illuminate\Database\Eloquent\MassPrunable` trait, models are deleted from the database using mass-deletion queries. Therefore, the `pruning` method will not be invoked, nor will the `deleting` and `deleted` model events be dispatched. This is because the models are never actually retrieved before deletion, thus making the pruning process much more efficient:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\MassPrunable;

class Flight extends Model
{
    use MassPrunable;

    /**
     * Get the prunable model query.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->minus(months: 1));
    }
}
```

### Replicating Models

You may create an unsaved copy of an existing model instance using the `replicate` method. This method is particularly useful when you have model instances that share many of the same attributes:

```php
use App\Models\Address;

$shipping = Address::create([
    'type' => 'shipping',
    'line_1' => '123 Example Street',
    'city' => 'Victorville',
    'state' => 'CA',
    'postcode' => '90001',
]);

$billing = $shipping->replicate()->fill([
    'type' => 'billing'
]);

$billing->save();
```

To exclude one or more attributes from being replicated to the new model, you may pass an array to the `replicate` method:

```php
$flight = Flight::create([
    'destination' => 'LAX',
    'origin' => 'LHR',
    'last_flown' => '2020-03-04 11:00:00',
    'last_pilot_id' => 747,
]);

$flight = $flight->replicate([
    'last_flown',
    'last_pilot_id'
]);
```

### Query Scopes

#### Global Scopes

Global scopes allow you to add constraints to all queries for a given model. Laravel's own [soft delete](#soft-deleting) functionality utilizes global scopes to only retrieve "non-deleted" models from the database. Writing your own global scopes can provide a convenient, easy way to make sure every query for a given model receives certain constraints.

##### Generating Scopes

To generate a new global scope, you may invoke the `make:scope` Artisan command, which will place the generated scope in your application's `app/Models/Scopes` directory:

```shell
php artisan make:scope AncientScope
```

##### Writing Global Scopes

Writing a global scope is simple. First, use the `make:scope` command to generate a class that implements the `Illuminate\Database\Eloquent\Scope` interface. The `Scope` interface requires you to implement one method: `apply`. The `apply` method may add `where` constraints or other types of clauses to the query as needed:

```php
<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class AncientScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('created_at', '<', now()->minus(years: 2000));
    }
}
```

> **Note:**
> If your global scope is adding columns to the select clause of the query, you should use the `addSelect` method instead of `select`. This will prevent the unintentional replacement of the query's existing select clause.

##### Applying Global Scopes

To assign a global scope to a model, you may simply place the `ScopedBy` attribute on the model:

```php
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;

#[ScopedBy([AncientScope::class])]
class User extends Model
{
    //
}
```

Or, you may manually register the global scope by overriding the model's `booted` method and invoke the model's `addGlobalScope` method. The `addGlobalScope` method accepts an instance of your scope as its only argument:

```php
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new AncientScope);
    }
}
```

After adding the scope in the example above to the `App\Models\User` model, a call to the `User::all()` method will execute the following SQL query:

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

##### Anonymous Global Scopes

Eloquent also allows you to define global scopes using closures, which is particularly useful for simple scopes that do not warrant a separate class of their own. When defining a global scope using a closure, you should provide a scope name of your own choosing as the first argument to the `addGlobalScope` method:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('ancient', function (Builder $builder) {
            $builder->where('created_at', '<', now()->minus(years: 2000));
        });
    }
}
```

##### Removing Global Scopes

If you would like to remove a global scope for a given query, you may use the `withoutGlobalScope` method. This method accepts the class name of the global scope as its only argument:

```php
User::withoutGlobalScope(AncientScope::class)->get();
```

Or, if you defined the global scope using a closure, you should pass the string name that you assigned to the global scope:

```php
User::withoutGlobalScope('ancient')->get();
```

If you would like to remove several or even all of the query's global scopes, you may use the `withoutGlobalScopes` and `withoutGlobalScopesExcept` methods:

```php
// Remove all of the global scopes...
User::withoutGlobalScopes()->get();

// Remove some of the global scopes...
User::withoutGlobalScopes([
    FirstScope::class, SecondScope::class
])->get();

// Remove all global scopes except the given ones...
User::withoutGlobalScopesExcept([
    SecondScope::class,
])->get();
```

#### Local Scopes

Local scopes allow you to define common sets of query constraints that you may easily re-use throughout your application. For example, you may need to frequently retrieve all users that are considered "popular". To define a scope, add the `Scope` attribute to an Eloquent method.

Scopes should always return the same query builder instance or `void`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Scope a query to only include popular users.
     */
    #[Scope]
    protected function popular(Builder $query): void
    {
        $query->where('votes', '>', 100);
    }

    /**
     * Scope a query to only include active users.
     */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('active', 1);
    }
}
```

##### Utilizing a Local Scope

Once the scope has been defined, you may call the scope methods when querying the model. You can even chain calls to various scopes:

```php
use App\Models\User;

$users = User::popular()->active()->orderBy('created_at')->get();
```

Combining multiple Eloquent model scopes via an `or` query operator may require the use of closures to achieve the correct [logical grouping](https://laravel.com/docs/queries#logical-grouping):

```php
$users = User::popular()->orWhere(function (Builder $query) {
    $query->active();
})->get();
```

However, since this can be cumbersome, Laravel provides a "higher order" `orWhere` method that allows you to fluently chain scopes together without the use of closures:

```php
$users = User::popular()->orWhere->active()->get();
```

##### Dynamic Scopes

Sometimes you may wish to define a scope that accepts parameters. To get started, just add your additional parameters to your scope method's signature. Scope parameters should be defined after the `$query` parameter:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Scope a query to only include users of a given type.
     */
    #[Scope]
    protected function ofType(Builder $query, string $type): void
    {
        $query->where('type', $type);
    }
}
```

Once the expected arguments have been added to your scope method's signature, you may pass the arguments when calling the scope:

```php
$users = User::ofType('admin')->get();
```

Attributed scope methods should be `protected`. When calling an attributed scope from within the model class, call the scope through a query builder instance, such as `static::query()->ofType('admin')`, to ensure the call is routed through Eloquent's scope handling.

#### Pending Attributes

If you would like to use scopes to create models that have the same attributes as those used to constrain the scope, you may use the `withAttributes` method when building the scope query:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
     * Scope the query to only include drafts.
     */
    #[Scope]
    protected function draft(Builder $query): void
    {
        $query->withAttributes([
            'hidden' => true,
        ]);
    }
}
```

The `withAttributes` method will add `where` conditions to the query using the given attributes, and it will also add the given attributes to any models created via the scope:

```php
$draft = Post::draft()->create(['title' => 'In Progress']);

$draft->hidden; // true
```

To instruct the `withAttributes` method to not add `where` conditions to the query, you may set the `asConditions` argument to `false`:

```php
$query->withAttributes([
    'hidden' => true,
], asConditions: false);
```

### Comparing Models

Sometimes you may need to determine if two models are the "same" or not. The `is` and `isNot` methods may be used to quickly verify two models have the same primary key, table, and database connection or not:

```php
if ($post->is($anotherPost)) {
    // ...
}

if ($post->isNot($anotherPost)) {
    // ...
}
```

The `is` and `isNot` methods are also available when using the `belongsTo`, `hasOne`, `morphTo`, and `morphOne` [relationships](https://laravel.com/docs/eloquent-relationships). This method is particularly helpful when you would like to compare a related model without issuing a query to retrieve that model:

```php
if ($post->author()->is($user)) {
    // ...
}
```

### Events

> **Note:**
> Want to broadcast your Eloquent events directly to your client-side application? Check out Laravel's [model event broadcasting](https://laravel.com/docs/broadcasting#model-broadcasting).

Eloquent models dispatch several events, allowing you to hook into the following moments in a model's lifecycle: `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `trashed`, `forceDeleting`, `forceDeleted`, `restoring`, `restored`, and `replicating`.

The `retrieved` event will dispatch when an existing model is retrieved from the database. When a new model is saved for the first time, the `creating` and `created` events will dispatch. The `updating` / `updated` events will dispatch when an existing model is modified and the `save` method is called. The `saving` / `saved` events will dispatch when a model is created or updated - even if the model's attributes have not been changed. Event names ending with `-ing` are dispatched before any changes to the model are persisted, while events ending with `-ed` are dispatched after the changes to the model are persisted.

To start listening to model events, define a `$dispatchesEvents` property on your Eloquent model. This property maps various points of the Eloquent model's lifecycle to your own [event classes](https://laravel.com/docs/events). Each model event class should expect to receive an instance of the affected model via its constructor:

```php
<?php

namespace App\Models;

use App\Events\UserDeleted;
use App\Events\UserSaved;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The event map for the model.
     *
     * @var array<string, string>
     */
    protected $dispatchesEvents = [
        'saved' => UserSaved::class,
        'deleted' => UserDeleted::class,
    ];
}
```

After defining and mapping your Eloquent events, you may use [event listeners](https://laravel.com/docs/events#defining-listeners) to handle the events.

> **Warning:**
> When issuing a mass update or delete query via Eloquent, the `saved`, `updated`, `deleting`, and `deleted` model events will not be dispatched for the affected models. This is because the models are never actually retrieved when performing mass updates or deletes.

#### Using Closures

Instead of using custom event classes, you may register closures that execute when various model events are dispatched. Typically, you should register these closures in the `booted` method of your model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::created(function (User $user) {
            // ...
        });
    }
}
```

If needed, you may utilize [queueable anonymous event listeners](https://laravel.com/docs/events#queueable-anonymous-event-listeners) when registering model events. This will instruct Laravel to execute the model event listener in the background using your application's [queue](https://laravel.com/docs/queues):

```php
use function Illuminate\Events\queueable;

static::created(queueable(function (User $user) {
    // ...
}));
```

#### Observers

##### Defining Observers

If you are listening for many events on a given model, you may use observers to group all of your listeners into a single class. Observer classes have method names which reflect the Eloquent events you wish to listen for. Each of these methods receives the affected model as their only argument. The `make:observer` Artisan command is the easiest way to create a new observer class:

```shell
php artisan make:observer UserObserver --model=User
```

This command will place the new observer in your `app/Observers` directory. If this directory does not exist, Artisan will create it for you. Your fresh observer will look like the following:

```php
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "forceDeleted" event.
     */
    public function forceDeleted(User $user): void
    {
        // ...
    }
}
```

To register an observer, you may place the `ObservedBy` attribute on the corresponding model:

```php
use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[ObservedBy([UserObserver::class])]
class User extends Authenticatable
{
    //
}
```

Or, you may manually register an observer by invoking the `observe` method on the model you wish to observe. You may register observers in the `boot` method of your application's `AppServiceProvider` class:

```php
use App\Models\User;
use App\Observers\UserObserver;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    User::observe(UserObserver::class);
}
```

> **Note:**
> There are additional events an observer can listen to, such as `saving` and `retrieved`. These events are described within the [events](#events) documentation.

##### Observers and Database Transactions

When models are being created within a database transaction, you may want to instruct an observer to only execute its event handlers after the database transaction is committed. You may accomplish this by implementing the `ShouldHandleEventsAfterCommit` interface on your observer. If a database transaction is not in progress, the event handlers will execute immediately:

```php
<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class UserObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // ...
    }
}
```

#### Muting Events

You may occasionally need to temporarily "mute" all events fired by a model. You may achieve this using the `withoutEvents` method. The `withoutEvents` method accepts a closure as its only argument. Any code executed within this closure will not dispatch model events, and any value returned by the closure will be returned by the `withoutEvents` method:

```php
use App\Models\User;

$user = User::withoutEvents(function () {
    User::findOrFail(1)->delete();

    return User::find(2);
});
```

##### Saving a Single Model Without Events

Sometimes you may wish to "save" a given model without dispatching any events. You may accomplish this using the `saveQuietly` method:

```php
$user = User::findOrFail(1);

$user->name = 'Victoria Faith';

$user->saveQuietly();
```

You may also "update", "delete", "soft delete", "restore", and "replicate" a given model without dispatching any events:

```php
$user->deleteQuietly();
$user->forceDeleteQuietly();
$user->restoreQuietly();
```

## Eloquent: Relationships

> **Source:** [Eloquent: Relationships](https://laravel.com/docs/eloquent-relationships) · [Laravel docs](https://github.com/laravel/docs), MIT

### Introduction

Database tables are often related to one another. For example, a blog post may have many comments or an order could be related to the user who placed it. Eloquent makes managing and working with these relationships easy, and supports a variety of common relationships:

<div class="content-list" markdown="1">

- [One To One](#one-to-one)
- [One To Many](#one-to-many)
- [Many To Many](#many-to-many)
- [Has One Through](#has-one-through)
- [Has Many Through](#has-many-through)
- [One To One (Polymorphic)](#one-to-one-polymorphic-relations)
- [One To Many (Polymorphic)](#one-to-many-polymorphic-relations)
- [Many To Many (Polymorphic)](#many-to-many-polymorphic-relations)

</div>

### Defining Relationships

Eloquent relationships are defined as methods on your Eloquent model classes. Since relationships also serve as powerful [query builders](https://laravel.com/docs/queries), defining relationships as methods provides powerful method chaining and querying capabilities. For example, we may chain additional query constraints on this `posts` relationship:

```php
$user->posts()->where('active', 1)->get();
```

But, before diving too deep into using relationships, let's learn how to define each type of relationship supported by Eloquent.

#### One to One / Has One

A one-to-one relationship is a very basic type of database relationship. For example, a `User` model might be associated with one `Phone` model. To define this relationship, we will place a `phone` method on the `User` model. The `phone` method should call the `hasOne` method and return its result. The `hasOne` method is available to your model via the model's `Illuminate\Database\Eloquent\Model` base class:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    /**
     * Get the phone associated with the user.
     */
    public function phone(): HasOne
    {
        return $this->hasOne(Phone::class);
    }
}
```

The first argument passed to the `hasOne` method is the name of the related model class. Once the relationship is defined, we may retrieve the related record using Eloquent's dynamic properties. Dynamic properties allow you to access relationship methods as if they were properties defined on the model:

```php
$phone = User::find(1)->phone;
```

Eloquent determines the foreign key of the relationship based on the parent model name. In this case, the `Phone` model is automatically assumed to have a `user_id` foreign key. If you wish to override this convention, you may pass a second argument to the `hasOne` method:

```php
return $this->hasOne(Phone::class, 'foreign_key');
```

Additionally, Eloquent assumes that the foreign key should have a value matching the primary key column of the parent. In other words, Eloquent will look for the value of the user's `id` column in the `user_id` column of the `Phone` record. If you would like the relationship to use a primary key value other than `id` or your model's primary key, you may pass a third argument to the `hasOne` method:

```php
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

##### Defining the Inverse of the Relationship

So, we can access the `Phone` model from our `User` model. Next, let's define a relationship on the `Phone` model that will let us access the user that owns the phone. We can define the inverse of a `hasOne` relationship using the `belongsTo` method:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Phone extends Model
{
    /**
     * Get the user that owns the phone.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

When invoking the `user` method, Eloquent will attempt to find a `User` model that has an `id` which matches the `user_id` column on the `Phone` model.

Eloquent determines the foreign key name by examining the name of the relationship method and suffixing the method name with `_id`. So, in this case, Eloquent assumes that the `Phone` model has a `user_id` column. However, if the foreign key on the `Phone` model is not `user_id`, you may pass a custom key name as the second argument to the `belongsTo` method:

```php
/**
 * Get the user that owns the phone.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key');
}
```

If the parent model does not use `id` as its primary key, or you wish to find the associated model using a different column, you may pass a third argument to the `belongsTo` method specifying the parent table's custom key:

```php
/**
 * Get the user that owns the phone.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
}
```

#### One to Many / Has Many

A one-to-many relationship is used to define relationships where a single model is the parent to one or more child models. For example, a blog post may have an infinite number of comments. Like all other Eloquent relationships, one-to-many relationships are defined by defining a method on your Eloquent model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * Get the comments for the blog post.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

Remember, Eloquent will automatically determine the proper foreign key column for the `Comment` model. By convention, Eloquent will take the "snake case" name of the parent model and suffix it with `_id`. So, in this example, Eloquent will assume the foreign key column on the `Comment` model is `post_id`.

Once the relationship method has been defined, we can access the [collection](https://laravel.com/docs/eloquent-collections) of related comments by accessing the `comments` property. Remember, since Eloquent provides "dynamic relationship properties", we can access relationship methods as if they were defined as properties on the model:

```php
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    // ...
}
```

Since all relationships also serve as query builders, you may add further constraints to the relationship query by calling the `comments` method and continuing to chain conditions onto the query:

```php
$comment = Post::find(1)->comments()
    ->where('title', 'foo')
    ->first();
```

Like the `hasOne` method, you may also override the foreign and local keys by passing additional arguments to the `hasMany` method:

```php
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

##### Automatically Hydrating Parent Models on Children

Even when utilizing Eloquent eager loading, "N + 1" query problems can arise if you try to access the parent model from a child model while looping through the child models:

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->post->title;
    }
}
```

In the example above, an "N + 1" query problem has been introduced because, even though comments were eager loaded for every `Post` model, Eloquent does not automatically hydrate the parent `Post` on each child `Comment` model.

If you would like Eloquent to automatically hydrate parent models onto their children, you may invoke the `chaperone` method when defining a `hasMany` relationship:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * Get the comments for the blog post.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->chaperone();
    }
}
```

Or, if you would like to opt-in to automatic parent hydration at run time, you may invoke the `chaperone` model when eager loading the relationship:

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

#### One to Many (Inverse) / Belongs To

Now that we can access all of a post's comments, let's define a relationship to allow a comment to access its parent post. To define the inverse of a `hasMany` relationship, define a relationship method on the child model which calls the `belongsTo` method:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * Get the post that owns the comment.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

Once the relationship has been defined, we can retrieve a comment's parent post by accessing the `post` "dynamic relationship property":

```php
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

In the example above, Eloquent will attempt to find a `Post` model that has an `id` which matches the `post_id` column on the `Comment` model.

Eloquent determines the default foreign key name by examining the name of the relationship method and suffixing the method name with a `_` followed by the name of the parent model's primary key column. So, in this example, Eloquent will assume the `Post` model's foreign key on the `comments` table is `post_id`.

However, if the foreign key for your relationship does not follow these conventions, you may pass a custom foreign key name as the second argument to the `belongsTo` method:

```php
/**
 * Get the post that owns the comment.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key');
}
```

If your parent model does not use `id` as its primary key, or you wish to find the associated model using a different column, you may pass a third argument to the `belongsTo` method specifying your parent table's custom key:

```php
/**
 * Get the post that owns the comment.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
}
```

##### Default Models

The `belongsTo`, `hasOne`, `hasOneThrough`, and `morphOne` relationships allow you to define a default model that will be returned if the given relationship is `null`. This pattern is often referred to as the [Null Object pattern](https://en.wikipedia.org/wiki/Null_Object_pattern) and can help remove conditional checks in your code. In the following example, the `user` relation will return an empty `App\Models\User` model if no user is attached to the `Post` model:

```php
/**
 * Get the author of the post.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault();
}
```

To populate the default model with attributes, you may pass an array or closure to the `withDefault` method:

```php
/**
 * Get the author of the post.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault([
        'name' => 'Guest Author',
    ]);
}

/**
 * Get the author of the post.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault(function (User $user, Post $post) {
        $user->name = 'Guest Author';
    });
}
```

##### Querying Belongs To Relationships

When querying for the children of a "belongs to" relationship, you may manually build the `where` clause to retrieve the corresponding Eloquent models:

```php
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

However, you may find it more convenient to use the `whereBelongsTo` method, which will automatically determine the proper relationship and foreign key for the given model:

```php
$posts = Post::whereBelongsTo($user)->get();
```

You may also provide a [collection](https://laravel.com/docs/eloquent-collections) instance to the `whereBelongsTo` method. When doing so, Laravel will retrieve models that belong to any of the parent models within the collection:

```php
$users = User::where('vip', true)->get();

$posts = Post::whereBelongsTo($users)->get();
```

By default, Laravel will determine the relationship associated with the given model based on the class name of the model; however, you may specify the relationship name manually by providing it as the second argument to the `whereBelongsTo` method:

```php
$posts = Post::whereBelongsTo($user, 'author')->get();
```

#### Has One of Many

Sometimes a model may have many related models, yet you want to easily retrieve the "latest" or "oldest" related model of the relationship. For example, a `User` model may be related to many `Order` models, but you want to define a convenient way to interact with the most recent order the user has placed. You may accomplish this using the `hasOne` relationship type combined with the `ofMany` methods:

```php
/**
 * Get the user's most recent order.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

Likewise, you may define a method to retrieve the "oldest", or first, related model of a relationship:

```php
/**
 * Get the user's oldest order.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

By default, the `latestOfMany` and `oldestOfMany` methods will retrieve the latest or oldest related model based on the model's primary key, which must be sortable. However, sometimes you may wish to retrieve a single model from a larger relationship using a different sorting criteria.

For example, using the `ofMany` method, you may retrieve the user's most expensive order. The `ofMany` method accepts the sortable column as its first argument and which aggregate function (`min` or `max`) to apply when querying for the related model:

```php
/**
 * Get the user's largest order.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> **Warning:**
> Because PostgreSQL does not support executing the `MAX` function against UUID columns, it is not currently possible to use one-of-many relationships in combination with PostgreSQL UUID columns.

##### Converting "Many" Relationships to Has One Relationships

Often, when retrieving a single model using the `latestOfMany`, `oldestOfMany`, or `ofMany` methods, you already have a "has many" relationship defined for the same model. For convenience, Laravel allows you to easily convert this relationship into a "has one" relationship by invoking the `one` method on the relationship:

```php
/**
 * Get the user's orders.
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

/**
 * Get the user's largest order.
 */
public function largestOrder(): HasOne
{
    return $this->orders()->one()->ofMany('price', 'max');
}
```

You may also use the `one` method to convert `HasManyThrough` relationships to `HasOneThrough` relationships:

```php
public function latestDeployment(): HasOneThrough
{
    return $this->deployments()->one()->latestOfMany();
}
```

##### Advanced Has One of Many Relationships

It is possible to construct more advanced "has one of many" relationships. For example, a `Product` model may have many associated `Price` models that are retained in the system even after new pricing is published. In addition, new pricing data for the product may be able to be published in advance to take effect at a future date via a `published_at` column.

So, in summary, we need to retrieve the latest published pricing where the published date is not in the future. In addition, if two prices have the same published date, we will prefer the price with the greatest ID. To accomplish this, we must pass an array to the `ofMany` method that contains the sortable columns which determine the latest price. In addition, a closure will be provided as the second argument to the `ofMany` method. This closure will be responsible for adding additional publish date constraints to the relationship query:

```php
/**
 * Get the current pricing for the product.
 */
public function currentPricing(): HasOne
{
    return $this->hasOne(Price::class)->ofMany([
        'published_at' => 'max',
        'id' => 'max',
    ], function (Builder $query) {
        $query->where('published_at', '<', now());
    });
}
```

#### Has One Through

The "has-one-through" relationship defines a one-to-one relationship with another model. However, this relationship indicates that the declaring model can be matched with one instance of another model by proceeding _through_ a third model.

For example, in a vehicle repair shop application, each `Mechanic` model may be associated with one `Car` model, and each `Car` model may be associated with one `Owner` model. While the mechanic and the owner have no direct relationship within the database, the mechanic can access the owner _through_ the `Car` model. Let's look at the tables necessary to define this relationship:

```text
mechanics
    id - integer
    name - string

cars
    id - integer
    model - string
    mechanic_id - integer

owners
    id - integer
    name - string
    car_id - integer
```

Now that we have examined the table structure for the relationship, let's define the relationship on the `Mechanic` model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Mechanic extends Model
{
    /**
     * Get the car's owner.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(Owner::class, Car::class);
    }
}
```

The first argument passed to the `hasOneThrough` method is the name of the final model we wish to access, while the second argument is the name of the intermediate model.

Or, if the relevant relationships have already been defined on all of the models involved in the relationship, you may fluently define a "has-one-through" relationship by invoking the `through` method and supplying the names of those relationships. For example, if the `Mechanic` model has a `cars` relationship and the `Car` model has an `owner` relationship, you may define a "has-one-through" relationship connecting the mechanic and the owner like so:

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

##### Key Conventions

Typical Eloquent foreign key conventions will be used when performing the relationship's queries. If you would like to customize the keys of the relationship, you may pass them as the third and fourth arguments to the `hasOneThrough` method. The third argument is the name of the foreign key on the intermediate model. The fourth argument is the name of the foreign key on the final model. The fifth argument is the local key, while the sixth argument is the local key of the intermediate model:

```php
class Mechanic extends Model
{
    /**
     * Get the car's owner.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(
            Owner::class,
            Car::class,
            'mechanic_id', // Foreign key on the cars table...
            'car_id', // Foreign key on the owners table...
            'id', // Local key on the mechanics table...
            'id' // Local key on the cars table...
        );
    }
}
```

Or, as discussed earlier, if the relevant relationships have already been defined on all of the models involved in the relationship, you may fluently define a "has-one-through" relationship by invoking the `through` method and supplying the names of those relationships. This approach offers the advantage of reusing the key conventions already defined on the existing relationships:

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

#### Has Many Through

The "has-many-through" relationship provides a convenient way to access distant relations via an intermediate relation. For example, let's assume we are building a deployment platform like [Laravel Cloud](https://cloud.laravel.com). An `Application` model might access many `Deployment` models through an intermediate `Environment` model. Using this example, you could easily gather all deployments for a given application. Let's look at the tables required to define this relationship:

```text
applications
    id - integer
    name - string

environments
    id - integer
    application_id - integer
    name - string

deployments
    id - integer
    environment_id - integer
    commit_hash - string
```

Now that we have examined the table structure for the relationship, let's define the relationship on the `Application` model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Application extends Model
{
    /**
     * Get all of the deployments for the application.
     */
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(Deployment::class, Environment::class);
    }
}
```

The first argument passed to the `hasManyThrough` method is the name of the final model we wish to access, while the second argument is the name of the intermediate model.

Or, if the relevant relationships have already been defined on all of the models involved in the relationship, you may fluently define a "has-many-through" relationship by invoking the `through` method and supplying the names of those relationships. For example, if the `Application` model has a `environments` relationship and the `Environment` model has a `deployments` relationship, you may define a "has-many-through" relationship connecting the application and the deployments like so:

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

Though the `Deployment` model's table does not contain a `application_id` column, the `hasManyThrough` relation provides access to an application's deployments via `$application->deployments`. To retrieve these models, Eloquent inspects the `application_id` column on the intermediate `Environment` model's table. After finding the relevant environment IDs, they are used to query the `Deployment` model's table.

##### Key Conventions

Typical Eloquent foreign key conventions will be used when performing the relationship's queries. If you would like to customize the keys of the relationship, you may pass them as the third and fourth arguments to the `hasManyThrough` method. The third argument is the name of the foreign key on the intermediate model. The fourth argument is the name of the foreign key on the final model. The fifth argument is the local key, while the sixth argument is the local key of the intermediate model:

```php
class Application extends Model
{
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Deployment::class,
            Environment::class,
            'application_id', // Foreign key on the environments table...
            'environment_id', // Foreign key on the deployments table...
            'id', // Local key on the applications table...
            'id' // Local key on the environments table...
        );
    }
}
```

Or, as discussed earlier, if the relevant relationships have already been defined on all of the models involved in the relationship, you may fluently define a "has-many-through" relationship by invoking the `through` method and supplying the names of those relationships. This approach offers the advantage of reusing the key conventions already defined on the existing relationships:

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

#### Scoped Relationships

It's common to add additional methods to models that constrain relationships. For example, you might add a `featuredPosts` method to a `User` model which constrains the broader `posts` relationship with an additional `where` constraint:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * Get the user's posts.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class)->latest();
    }

    /**
     * Get the user's featured posts.
     */
    public function featuredPosts(): HasMany
    {
        return $this->posts()->where('featured', true);
    }
}
```

However, if you attempt to create a model via the `featuredPosts` method, its `featured` attribute would not be set to `true`. If you would like to create models via relationship methods and also specify attributes that should be added to all models created via that relationship, you may use the `withAttributes` method when building the relationship query:

```php
/**
 * Get the user's featured posts.
 */
public function featuredPosts(): HasMany
{
    return $this->posts()->withAttributes(['featured' => true]);
}
```

The `withAttributes` method will add `where` conditions to the query using the given attributes, and it will also add the given attributes to any models created via the relationship method:

```php
$post = $user->featuredPosts()->create(['title' => 'Featured Post']);

$post->featured; // true
```

To instruct the `withAttributes` method to not add `where` conditions to the query, you may set the `asConditions` argument to `false`:

```php
return $this->posts()->withAttributes(['featured' => true], asConditions: false);
```

### Many to Many Relationships

Many-to-many relations are slightly more complicated than `hasOne` and `hasMany` relationships. An example of a many-to-many relationship is a user that has many roles and those roles are also shared by other users in the application. For example, a user may be assigned the role of "Author" and "Editor"; however, those roles may also be assigned to other users as well. So, a user has many roles and a role has many users.

##### Table Structure

To define this relationship, three database tables are needed: `users`, `roles`, and `role_user`. The `role_user` table is derived from the alphabetical order of the related model names and contains `user_id` and `role_id` columns. This table is used as an intermediate table linking the users and roles.

Remember, since a role can belong to many users, we cannot simply place a `user_id` column on the `roles` table. This would mean that a role could only belong to a single user. In order to provide support for roles being assigned to multiple users, the `role_user` table is needed. We can summarize the relationship's table structure like so:

```text
users
    id - integer
    name - string

roles
    id - integer
    name - string

role_user
    user_id - integer
    role_id - integer
```

##### Model Structure

Many-to-many relationships are defined by writing a method that returns the result of the `belongsToMany` method. The `belongsToMany` method is provided by the `Illuminate\Database\Eloquent\Model` base class that is used by all of your application's Eloquent models. For example, let's define a `roles` method on our `User` model. The first argument passed to this method is the name of the related model class:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    /**
     * The roles that belong to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
```

Once the relationship is defined, you may access the user's roles using the `roles` dynamic relationship property:

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    // ...
}
```

Since all relationships also serve as query builders, you may add further constraints to the relationship query by calling the `roles` method and continuing to chain conditions onto the query:

```php
$roles = User::find(1)->roles()->orderBy('name')->get();
```

To determine the table name of the relationship's intermediate table, Eloquent will join the two related model names in alphabetical order. However, you are free to override this convention. You may do so by passing a second argument to the `belongsToMany` method:

```php
return $this->belongsToMany(Role::class, 'role_user');
```

In addition to customizing the name of the intermediate table, you may also customize the column names of the keys on the table by passing additional arguments to the `belongsToMany` method. The third argument is the foreign key name of the model on which you are defining the relationship, while the fourth argument is the foreign key name of the model that you are joining to:

```php
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

##### Defining the Inverse of the Relationship

To define the "inverse" of a many-to-many relationship, you should define a method on the related model which also returns the result of the `belongsToMany` method. To complete our user / role example, let's define the `users` method on the `Role` model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * The users that belong to the role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
```

As you can see, the relationship is defined exactly the same as its `User` model counterpart with the exception of referencing the `App\Models\User` model. Since we're reusing the `belongsToMany` method, all of the usual table and key customization options are available when defining the "inverse" of many-to-many relationships.

#### Retrieving Intermediate Table Columns

As you have already learned, working with many-to-many relations requires the presence of an intermediate table. Eloquent provides some very helpful ways of interacting with this table. For example, let's assume our `User` model has many `Role` models that it is related to. After accessing this relationship, we may access the intermediate table using the `pivot` attribute on the models:

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

Notice that each `Role` model we retrieve is automatically assigned a `pivot` attribute. This attribute contains a model representing the intermediate table.

By default, only the model keys will be present on the `pivot` model. If your intermediate table contains extra attributes, you must specify them when defining the relationship:

```php
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

If you would like your intermediate table to have `created_at` and `updated_at` timestamps that are automatically maintained by Eloquent, call the `withTimestamps` method when defining the relationship:

```php
return $this->belongsToMany(Role::class)->withTimestamps();
```

> **Warning:**
> Intermediate tables that utilize Eloquent's automatically maintained timestamps are required to have both `created_at` and `updated_at` timestamp columns.

##### Customizing the `pivot` Attribute Name

As noted previously, attributes from the intermediate table may be accessed on models via the `pivot` attribute. However, you are free to customize the name of this attribute to better reflect its purpose within your application.

For example, if your application contains users that may subscribe to podcasts, you likely have a many-to-many relationship between users and podcasts. If this is the case, you may wish to rename your intermediate table attribute to `subscription` instead of `pivot`. This can be done using the `as` method when defining the relationship:

```php
return $this->belongsToMany(Podcast::class)
    ->as('subscription')
    ->withTimestamps();
```

Once the custom intermediate table attribute has been specified, you may access the intermediate table data using the customized name:

```php
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

#### Filtering Queries via Intermediate Table Columns

You can also filter the results returned by `belongsToMany` relationship queries using the `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull`, and `wherePivotNotNull` methods when defining the relationship:

```php
return $this->belongsToMany(Role::class)
    ->wherePivot('approved', 1);

return $this->belongsToMany(Role::class)
    ->wherePivotIn('priority', [1, 2]);

return $this->belongsToMany(Role::class)
    ->wherePivotNotIn('priority', [1, 2]);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNull('expired_at');

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNotNull('expired_at');
```

The `wherePivot` adds a where clause constraint to the query, but does not add the specified value when creating new models via the defined relationship. If you need to both query and create relationships with a particular pivot value, you may use the `withPivotValue` method:

```php
return $this->belongsToMany(Role::class)
    ->withPivotValue('approved', 1);
```

#### Ordering Queries via Intermediate Table Columns

You can order the results returned by `belongsToMany` relationship queries using the `orderByPivot` and `orderByPivotDesc` methods. In the following example, we will retrieve all of the latest badges for the user:

```php
return $this->belongsToMany(Badge::class)
    ->where('rank', 'gold')
    ->orderByPivotDesc('created_at');
```

#### Defining Custom Intermediate Table Models

If you would like to define a custom model to represent the intermediate table of your many-to-many relationship, you may call the `using` method when defining the relationship. Custom pivot models give you the opportunity to define additional behavior on the pivot model, such as methods and casts.

Custom many-to-many pivot models should extend the `Illuminate\Database\Eloquent\Relations\Pivot` class while custom polymorphic many-to-many pivot models should extend the `Illuminate\Database\Eloquent\Relations\MorphPivot` class. For example, we may define a `Role` model which uses a custom `RoleUser` pivot model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * The users that belong to the role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->using(RoleUser::class);
    }
}
```

When defining the `RoleUser` model, you should extend the `Illuminate\Database\Eloquent\Relations\Pivot` class:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    // ...
}
```

> **Warning:**
> Pivot models may not use the `SoftDeletes` trait. If you need to soft delete pivot records consider converting your pivot model to an actual Eloquent model.

##### Custom Pivot Models and Incrementing IDs

If you have defined a many-to-many relationship that uses a custom pivot model, and that pivot model has an auto-incrementing primary key, you should ensure your custom pivot model class uses the `Table` attribute with `incrementing` set to `true`:

```php
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Table(incrementing: true)]
class RoleUser extends Pivot
{
    // ...
}
```

##### Automatically Hydrating Pivot Relationships

When a custom pivot model defines `belongsTo` relationships for the declaring and related models, you may invoke `chaperone` to automatically hydrate those relationships on each pivot model. This avoids additional queries when accessing the models through the pivot:

```php
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

class Role extends Model
{
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->using(RoleUser::class)
            ->chaperone();
    }
}
```

Eloquent will attempt to infer the pivot relationship names. If your pivot model uses non-standard names, pass the declaring and related relationship names to `chaperone`:

```php
return $this->belongsToMany(User::class)
    ->using(RoleUser::class)
    ->chaperone(declaring: 'role', related: 'user');
```

### Polymorphic Relationships

A polymorphic relationship allows the child model to belong to more than one type of model using a single association. For example, imagine you are building an application that allows users to share blog posts and videos. In such an application, a `Comment` model might belong to both the `Post` and `Video` models.

#### One to One (Polymorphic)

##### Table Structure

A one-to-one polymorphic relation is similar to a typical one-to-one relation; however, the child model can belong to more than one type of model using a single association. For example, a blog `Post` and a `User` may share a polymorphic relation to an `Image` model. Using a one-to-one polymorphic relation allows you to have a single table of unique images that may be associated with posts and users. First, let's examine the table structure:

```text
posts
    id - integer
    name - string

users
    id - integer
    name - string

images
    id - integer
    url - string
    imageable_type - string
    imageable_id - integer
```

Note the `imageable_id` and `imageable_type` columns on the `images` table. The `imageable_id` column will contain the ID value of the post or user, while the `imageable_type` column will contain the class name of the parent model. The `imageable_type` column is used by Eloquent to determine which "type" of parent model to return when accessing the `imageable` relation. In this case, the column would contain either `App\Models\Post` or `App\Models\User`.

##### Model Structure

Next, let's examine the model definitions needed to build this relationship:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Image extends Model
{
    /**
     * Get the parent imageable model (user or post).
     */
    public function imageable(): MorphTo
    {
        return $this->morphTo();
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Post extends Model
{
    /**
     * Get the post's image.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class User extends Model
{
    /**
     * Get the user's image.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
```

##### Retrieving the Relationship

Once your database table and models are defined, you may access the relationships via your models. For example, to retrieve the image for a post, we can access the `image` dynamic relationship property:

```php
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

You may retrieve the parent of the polymorphic model by accessing the name of the method that performs the call to `morphTo`. In this case, that is the `imageable` method on the `Image` model. So, we will access that method as a dynamic relationship property:

```php
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

The `imageable` relation on the `Image` model will return either a `Post` or `User` instance, depending on which type of model owns the image.

##### Key Conventions

If necessary, you may specify the name of the "id" and "type" columns utilized by your polymorphic child model. If you do so, ensure that you always pass the name of the relationship as the first argument to the `morphTo` method. Typically, this value should match the method name, so you may use PHP's `__FUNCTION__` constant:

```php
/**
 * Get the model that the image belongs to.
 */
public function imageable(): MorphTo
{
    return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
}
```

#### One to Many (Polymorphic)

##### Table Structure

A one-to-many polymorphic relation is similar to a typical one-to-many relation; however, the child model can belong to more than one type of model using a single association. For example, imagine users of your application can "comment" on posts and videos. Using polymorphic relationships, you may use a single `comments` table to contain comments for both posts and videos. First, let's examine the table structure required to build this relationship:

```text
posts
    id - integer
    title - string
    body - text

videos
    id - integer
    title - string
    url - string

comments
    id - integer
    body - text
    commentable_type - string
    commentable_id - integer
```

##### Model Structure

Next, let's examine the model definitions needed to build this relationship:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Comment extends Model
{
    /**
     * Get the parent commentable model (post or video).
     */
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Post extends Model
{
    /**
     * Get all of the post's comments.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Video extends Model
{
    /**
     * Get all of the video's comments.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

##### Retrieving the Relationship

Once your database table and models are defined, you may access the relationships via your model's dynamic relationship properties. For example, to access all of the comments for a post, we can use the `comments` dynamic property:

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    // ...
}
```

You may also retrieve the parent of a polymorphic child model by accessing the name of the method that performs the call to `morphTo`. In this case, that is the `commentable` method on the `Comment` model. So, we will access that method as a dynamic relationship property in order to access the comment's parent model:

```php
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

The `commentable` relation on the `Comment` model will return either a `Post` or `Video` instance, depending on which type of model is the comment's parent.

##### Automatically Hydrating Parent Models on Children

Even when utilizing Eloquent eager loading, "N + 1" query problems can arise if you try to access the parent model from a child model while looping through the child models:

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->commentable->title;
    }
}
```

In the example above, an "N + 1" query problem has been introduced because, even though comments were eager loaded for every `Post` model, Eloquent does not automatically hydrate the parent `Post` on each child `Comment` model.

If you would like Eloquent to automatically hydrate parent models onto their children, you may invoke the `chaperone` method when defining a `morphMany` relationship:

```php
class Post extends Model
{
    /**
     * Get all of the post's comments.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')->chaperone();
    }
}
```

Or, if you would like to opt-in to automatic parent hydration at run time, you may invoke the `chaperone` model when eager loading the relationship:

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

#### One of Many (Polymorphic)

Sometimes a model may have many related models, yet you want to easily retrieve the "latest" or "oldest" related model of the relationship. For example, a `User` model may be related to many `Image` models, but you want to define a convenient way to interact with the most recent image the user has uploaded. You may accomplish this using the `morphOne` relationship type combined with the `ofMany` methods:

```php
/**
 * Get the user's most recent image.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

Likewise, you may define a method to retrieve the "oldest", or first, related model of a relationship:

```php
/**
 * Get the user's oldest image.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

By default, the `latestOfMany` and `oldestOfMany` methods will retrieve the latest or oldest related model based on the model's primary key, which must be sortable. However, sometimes you may wish to retrieve a single model from a larger relationship using a different sorting criteria.

For example, using the `ofMany` method, you may retrieve the user's most "liked" image. The `ofMany` method accepts the sortable column as its first argument and which aggregate function (`min` or `max`) to apply when querying for the related model:

```php
/**
 * Get the user's most popular image.
 */
public function bestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> **Note:**
> It is possible to construct more advanced "one of many" relationships. For more information, please consult the [has one of many documentation](#advanced-has-one-of-many-relationships).

#### Many to Many (Polymorphic)

##### Table Structure

Many-to-many polymorphic relations are slightly more complicated than "morph one" and "morph many" relationships. For example, a `Post` model and `Video` model could share a polymorphic relation to a `Tag` model. Using a many-to-many polymorphic relation in this situation would allow your application to have a single table of unique tags that may be associated with posts or videos. First, let's examine the table structure required to build this relationship:

```text
posts
    id - integer
    name - string

videos
    id - integer
    name - string

tags
    id - integer
    name - string

taggables
    tag_id - integer
    taggable_type - string
    taggable_id - integer
```

> **Note:**
> Before diving into polymorphic many-to-many relationships, you may benefit from reading the documentation on typical [many-to-many relationships](#many-to-many).

##### Model Structure

Next, we're ready to define the relationships on the models. The `Post` and `Video` models will both contain a `tags` method that calls the `morphToMany` method provided by the base Eloquent model class.

The `morphToMany` method accepts the name of the related model as well as the "relationship name". Based on the name we assigned to our intermediate table name and the keys it contains, we will refer to the relationship as "taggable":

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Post extends Model
{
    /**
     * Get all of the tags for the post.
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

##### Defining the Inverse of the Relationship

Next, on the `Tag` model, you should define a method for each of its possible parent models. So, in this example, we will define a `posts` method and a `videos` method. Both of these methods should return the result of the `morphedByMany` method.

The `morphedByMany` method accepts the name of the related model as well as the "relationship name". Based on the name we assigned to our intermediate table name and the keys it contains, we will refer to the relationship as "taggable":

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Tag extends Model
{
    /**
     * Get all of the posts that are assigned this tag.
     */
    public function posts(): MorphToMany
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    /**
     * Get all of the videos that are assigned this tag.
     */
    public function videos(): MorphToMany
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}
```

##### Retrieving the Relationship

Once your database table and models are defined, you may access the relationships via your models. For example, to access all of the tags for a post, you may use the `tags` dynamic relationship property:

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    // ...
}
```

You may retrieve the parent of a polymorphic relation from the polymorphic child model by accessing the name of the method that performs the call to `morphedByMany`. In this case, that is the `posts` or `videos` methods on the `Tag` model:

```php
use App\Models\Tag;

$tag = Tag::find(1);

foreach ($tag->posts as $post) {
    // ...
}

foreach ($tag->videos as $video) {
    // ...
}
```

#### Custom Polymorphic Types

By default, Laravel will use the fully qualified class name to store the "type" of the related model. For instance, given the one-to-many relationship example above where a `Comment` model may belong to a `Post` or a `Video` model, the default `commentable_type` would be either `App\Models\Post` or `App\Models\Video`, respectively. However, you may wish to decouple these values from your application's internal structure.

For example, instead of using the model names as the "type", we may use simple strings such as `post` and `video`. By doing so, the polymorphic "type" column values in our database will remain valid even if the models are renamed:

```php
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

You may call the `enforceMorphMap` method in the `boot` method of your `App\Providers\AppServiceProvider` class or create a separate service provider if you wish.

You may determine the morph alias of a given model at runtime using the model's `getMorphClass` method. Conversely, you may determine the fully-qualified class name associated with a morph alias using the `Relation::getMorphedModel` method:

```php
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> **Warning:**
> When adding a "morph map" to your existing application, every morphable `*_type` column value in your database that still contains a fully-qualified class will need to be converted to its "map" name.

#### Dynamic Relationships

You may use the `resolveRelationUsing` method to define relations between Eloquent models at runtime. While not typically recommended for normal application development, this may occasionally be useful when developing Laravel packages.

The `resolveRelationUsing` method accepts the desired relationship name as its first argument. The second argument passed to the method should be a closure that accepts the model instance and returns a valid Eloquent relationship definition. Typically, you should configure dynamic relationships within the boot method of a [service provider](https://laravel.com/docs/providers):

```php
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function (Order $orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```

> **Warning:**
> When defining dynamic relationships, always provide explicit key name arguments to the Eloquent relationship methods.

### Querying Relations

Since all Eloquent relationships are defined via methods, you may call those methods to obtain an instance of the relationship without actually executing a query to load the related models. In addition, all types of Eloquent relationships also serve as [query builders](https://laravel.com/docs/queries), allowing you to continue to chain constraints onto the relationship query before finally executing the SQL query against your database.

For example, imagine a blog application in which a `User` model has many associated `Post` models:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * Get all of the posts for the user.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

You may query the `posts` relationship and add additional constraints to the relationship like so:

```php
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

You are able to use any of the Laravel [query builder's](https://laravel.com/docs/queries) methods on the relationship, so be sure to explore the query builder documentation to learn about all of the methods that are available to you.

##### Chaining `orWhere` Clauses After Relationships

As demonstrated in the example above, you are free to add additional constraints to relationships when querying them. However, use caution when chaining `orWhere` clauses onto a relationship, as the `orWhere` clauses will be logically grouped at the same level as the relationship constraint:

```php
$user->posts()
    ->where('active', 1)
    ->orWhere('votes', '>=', 100)
    ->get();
```

The example above will generate the following SQL. As you can see, the `or` clause instructs the query to return _any_ post with greater than 100 votes. The query is no longer constrained to a specific user:

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

In most situations, you should use [logical groups](https://laravel.com/docs/queries#logical-grouping) to group the conditional checks between parentheses:

```php
use Illuminate\Database\Eloquent\Builder;

$user->posts()
    ->where(function (Builder $query) {
        return $query->where('active', 1)
            ->orWhere('votes', '>=', 100);
    })
    ->get();
```

The example above will produce the following SQL. Note that the logical grouping has properly grouped the constraints and the query remains constrained to a specific user:

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

#### Relationship Methods vs. Dynamic Properties

If you do not need to add additional constraints to an Eloquent relationship query, you may access the relationship as if it were a property. For example, continuing to use our `User` and `Post` example models, we may access all of a user's posts like so:

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    // ...
}
```

Dynamic relationship properties perform "lazy loading", meaning they will only load their relationship data when you actually access them. Because of this, developers often use [eager loading](#eager-loading) to pre-load relationships they know will be accessed after loading the model. Eager loading provides a significant reduction in SQL queries that must be executed to load a model's relations.

#### Querying Relationship Existence

When retrieving model records, you may wish to limit your results based on the existence of a relationship. For example, imagine you want to retrieve all blog posts that have at least one comment. To do so, you may pass the name of the relationship to the `has` and `orHas` methods:

```php
use App\Models\Post;

// Retrieve all posts that have at least one comment...
$posts = Post::has('comments')->get();
```

You may also specify an operator and count value to further customize the query:

```php
// Retrieve all posts that have three or more comments...
$posts = Post::has('comments', '>=', 3)->get();
```

Nested `has` statements may be constructed using "dot" notation. For example, you may retrieve all posts that have at least one comment that has at least one image:

```php
// Retrieve posts that have at least one comment with images...
$posts = Post::has('comments.images')->get();
```

If you need even more power, you may use the `whereHas` and `orWhereHas` methods to define additional query constraints on your `has` queries, such as inspecting the content of a comment:

```php
use Illuminate\Database\Eloquent\Builder;

// Retrieve posts with at least one comment containing words like code%...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();

// Retrieve posts with at least ten comments containing words like code%...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
}, '>=', 10)->get();
```

> **Warning:**
> Eloquent does not currently support querying for relationship existence across databases. The relationships must exist within the same database.

##### Many to Many Relationship Existence Queries

The `whereAttachedTo` method may be used to query for models that have a many to many attachment to a model or collection of models:

```php
$users = User::whereAttachedTo($role)->get();
```

You may also provide a [collection](https://laravel.com/docs/eloquent-collections) instance to the `whereAttachedTo` method. When doing so, Laravel will retrieve models that are attached to any of the models within the collection:

```php
$tags = Tag::whereLike('name', '%laravel%')->get();

$posts = Post::whereAttachedTo($tags)->get();
```

##### Inline Relationship Existence Queries

If you would like to query for a relationship's existence with a single, simple where condition attached to the relationship query, you may find it more convenient to use the `whereRelation`, `orWhereRelation`, `whereMorphRelation`, and `orWhereMorphRelation` methods. For example, we may query for all posts that have unapproved comments:

```php
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

Of course, like calls to the query builder's `where` method, you may also specify an operator:

```php
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->minus(hours: 1)
)->get();
```

#### Querying Relationship Absence

When retrieving model records, you may wish to limit your results based on the absence of a relationship. For example, imagine you want to retrieve all blog posts that **don't** have any comments. To do so, you may pass the name of the relationship to the `doesntHave` and `orDoesntHave` methods:

```php
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

If you need even more power, you may use the `whereDoesntHave` and `orWhereDoesntHave` methods to add additional query constraints to your `doesntHave` queries, such as inspecting the content of a comment:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

You may use "dot" notation to execute a query against a nested relationship. For example, the following query will retrieve all posts that do not have comments as well as posts that have comments where none of the comments are from banned users:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 1);
})->get();
```

#### Querying Morph To Relationships

To query the existence of "morph to" relationships, you may use the `whereHasMorph` and `whereDoesntHaveMorph` methods. These methods accept the name of the relationship as their first argument. Next, the methods accept the names of the related models that you wish to include in the query. Finally, you may provide a closure which customizes the relationship query:

```php
use App\Models\Comment;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;

// Retrieve comments associated to posts or videos with a title like code%...
$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();

// Retrieve comments associated to posts with a title not like code%...
$comments = Comment::whereDoesntHaveMorph(
    'commentable',
    Post::class,
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();
```

You may occasionally need to add query constraints based on the "type" of the related polymorphic model. The closure passed to the `whereHasMorph` method may receive a `$type` value as its second argument. This argument allows you to inspect the "type" of the query that is being built:

```php
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query, string $type) {
        $column = $type === Post::class ? 'content' : 'title';

        $query->where($column, 'like', 'code%');
    }
)->get();
```

Sometimes you may want to query for the children of a "morph to" relationship's parent. You may accomplish this using the `whereMorphedTo` and `whereNotMorphedTo` methods, which will automatically determine the proper morph type mapping for the given model. These methods accept the name of the `morphTo` relationship as their first argument and the related parent model as their second argument:

```php
$comments = Comment::whereMorphedTo('commentable', $post)
    ->orWhereMorphedTo('commentable', $video)
    ->get();
```

##### Querying All Related Models

Instead of passing an array of possible polymorphic models, you may provide `*` as a wildcard value. This will instruct Laravel to retrieve all of the possible polymorphic types from the database. Laravel will execute an additional query in order to perform this operation:

```php
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
    $query->where('title', 'like', 'foo%');
})->get();
```

### Aggregating Related Models

#### Counting Related Models

Sometimes you may want to count the number of related models for a given relationship without actually loading the models. To accomplish this, you may use the `withCount` method. The `withCount` method will place a `{relation}_count` attribute on the resulting models:

```php
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

By passing an array to the `withCount` method, you may add the "counts" for multiple relations as well as add additional constraints to the queries:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

You may also alias the relationship count result, allowing multiple counts on the same relationship:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount([
    'comments',
    'comments as pending_comments_count' => function (Builder $query) {
        $query->where('approved', false);
    },
])->get();

echo $posts[0]->comments_count;
echo $posts[0]->pending_comments_count;
```

##### Deferred Count Loading

Using the `loadCount` method, you may load a relationship count after the parent model has already been retrieved:

```php
$book = Book::first();

$book->loadCount('genres');
```

If you need to set additional query constraints on the count query, you may pass an array keyed by the relationships you wish to count. The array values should be closures which receive the query builder instance:

```php
$book->loadCount(['reviews' => function (Builder $query) {
    $query->where('rating', 5);
}]);
```

##### Relationship Counting and Custom Select Statements

If you're combining `withCount` with a `select` statement, ensure that you call `withCount` after the `select` method:

```php
$posts = Post::select(['title', 'body'])
    ->withCount('comments')
    ->get();
```

#### Other Aggregate Functions

In addition to the `withCount` method, Eloquent provides `withMin`, `withMax`, `withAvg`, `withSum`, and `withExists` methods. These methods will place a `{relation}_{function}_{column}` attribute on your resulting models:

```php
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

If you wish to access the result of the aggregate function using another name, you may specify your own alias:

```php
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

Like the `loadCount` method, deferred versions of these methods are also available. These additional aggregate operations may be performed on Eloquent models that have already been retrieved:

```php
$post = Post::first();

$post->loadSum('comments', 'votes');
```

If you're combining these aggregate methods with a `select` statement, ensure that you call the aggregate methods after the `select` method:

```php
$posts = Post::select(['title', 'body'])
    ->withExists('comments')
    ->get();
```

#### Counting Related Models on Morph To Relationships

If you would like to eager load a "morph to" relationship, as well as related model counts for the various entities that may be returned by that relationship, you may utilize the `with` method in combination with the `morphTo` relationship's `morphWithCount` method.

In this example, let's assume that `Photo` and `Post` models may create `ActivityFeed` models. We will assume the `ActivityFeed` model defines a "morph to" relationship named `parentable` that allows us to retrieve the parent `Photo` or `Post` model for a given `ActivityFeed` instance. Additionally, let's assume that `Photo` models "have many" `Tag` models and `Post` models "have many" `Comment` models.

Now, let's imagine we want to retrieve `ActivityFeed` instances and eager load the `parentable` parent models for each `ActivityFeed` instance. In addition, we want to retrieve the number of tags that are associated with each parent photo and the number of comments that are associated with each parent post:

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$activities = ActivityFeed::with([
    'parentable' => function (MorphTo $morphTo) {
        $morphTo->morphWithCount([
            Photo::class => ['tags'],
            Post::class => ['comments'],
        ]);
    }])->get();
```

##### Deferred Count Loading

Let's assume we have already retrieved a set of `ActivityFeed` models and now we would like to load the nested relationship counts for the various `parentable` models associated with the activity feeds. You may use the `loadMorphCount` method to accomplish this:

```php
$activities = ActivityFeed::with('parentable')->get();

$activities->loadMorphCount('parentable', [
    Photo::class => ['tags'],
    Post::class => ['comments'],
]);
```

### Eager Loading

When accessing Eloquent relationships as properties, the related models are "lazy loaded". This means the relationship data is not actually loaded until you first access the property. However, Eloquent can "eager load" relationships at the time you query the parent model. Eager loading alleviates the "N + 1" query problem. To illustrate the N + 1 query problem, consider a `Book` model that "belongs to" to an `Author` model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * Get the author that wrote the book.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }
}
```

Now, let's retrieve all books and their authors:

```php
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

This loop will execute one query to retrieve all of the books within the database table, then another query for each book in order to retrieve the book's author. So, if we have 25 books, the code above would run 26 queries: one for the original book, and 25 additional queries to retrieve the author of each book.

Thankfully, we can use eager loading to reduce this operation to just two queries. When building a query, you may specify which relationships should be eager loaded using the `with` method:

```php
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

For this operation, only two queries will be executed - one query to retrieve all of the books and one query to retrieve all of the authors for all of the books:

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

##### Eager Loading Multiple Relationships

Sometimes you may need to eager load several different relationships. To do so, just pass an array of relationships to the `with` method:

```php
$books = Book::with(['author', 'publisher'])->get();
```

##### Nested Eager Loading

To eager load a relationship's relationships, you may use "dot" syntax. For example, let's eager load all of the book's authors and all of the author's personal contacts:

```php
$books = Book::with('author.contacts')->get();
```

Alternatively, you may specify nested eager loaded relationships by providing a nested array to the `with` method, which can be convenient when eager loading multiple nested relationships:

```php
$books = Book::with([
    'author' => [
        'contacts',
        'publisher',
    ],
])->get();
```

##### Nested Eager Loading `morphTo` Relationships

If you would like to eager load a `morphTo` relationship, as well as nested relationships on the various entities that may be returned by that relationship, you may use the `with` method in combination with the `morphTo` relationship's `morphWith` method. To help illustrate this method, let's consider the following model:

```php
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * Get the parent of the activity feed record.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

In this example, let's assume `Event`, `Photo`, and `Post` models may create `ActivityFeed` models. Additionally, let's assume that `Event` models belong to a `Calendar` model, `Photo` models are associated with `Tag` models, and `Post` models belong to an `Author` model.

Using these model definitions and relationships, we may retrieve `ActivityFeed` model instances and eager load all `parentable` models and their respective nested relationships:

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$activities = ActivityFeed::query()
    ->with(['parentable' => function (MorphTo $morphTo) {
        $morphTo->morphWith([
            Event::class => ['calendar'],
            Photo::class => ['tags'],
            Post::class => ['author'],
        ]);
    }])->get();
```

##### Eager Loading Specific Columns

You may not always need every column from the relationships you are retrieving. For this reason, Eloquent allows you to specify which columns of the relationship you would like to retrieve:

```php
$books = Book::with('author:id,name,book_id')->get();
```

> **Warning:**
> When using this feature, you should always include the `id` column and any relevant foreign key columns in the list of columns you wish to retrieve.

##### Eager Loading by Default

Sometimes you might want to always load some relationships when retrieving a model. To accomplish this, you may define a `$with` property on the model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = ['author'];

    /**
     * Get the author that wrote the book.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * Get the genre of the book.
     */
    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }
}
```

If you would like to remove an item from the `$with` property for a single query, you may use the `without` method:

```php
$books = Book::without('author')->get();
```

If you would like to override all items within the `$with` property for a single query, you may use the `withOnly` method:

```php
$books = Book::withOnly('genre')->get();
```

#### Constraining Eager Loads

Sometimes you may wish to eager load a relationship but also specify additional query conditions for the eager loading query. You can accomplish this by passing an array of relationships to the `with` method where the array key is a relationship name and the array value is a closure that adds additional constraints to the eager loading query:

```php
use App\Models\User;

$users = User::with(['posts' => function ($query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

In this example, Eloquent will only eager load posts where the post's `title` column contains the word `code`. You may call other [query builder](https://laravel.com/docs/queries) methods to further customize the eager loading operation:

```php
$users = User::with(['posts' => function ($query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

##### Constraining Eager Loading of `morphTo` Relationships

If you are eager loading a `morphTo` relationship, Eloquent will run multiple queries to fetch each type of related model. You may add additional constraints to each of these queries using the `MorphTo` relation's `constrain` method:

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$comments = Comment::with(['commentable' => function (MorphTo $morphTo) {
    $morphTo->constrain([
        Post::class => function ($query) {
            $query->whereNull('hidden_at');
        },
        Video::class => function ($query) {
            $query->where('type', 'educational');
        },
    ]);
}])->get();
```

In this example, Eloquent will only eager load posts that have not been hidden and videos that have a `type` value of "educational".

##### Constraining Eager Loads With Relationship Existence

You may sometimes find yourself needing to check for the existence of a relationship while simultaneously loading the relationship based on the same conditions. For example, you may wish to only retrieve `User` models that have child `Post` models matching a given query condition while also eager loading the matching posts. You may accomplish this using the `withWhereHas` method:

```php
use App\Models\User;

$users = User::withWhereHas('posts', function ($query) {
    $query->where('featured', true);
})->get();
```

#### Lazy Eager Loading

Sometimes you may need to eager load a relationship after the parent model has already been retrieved. For example, this may be useful if you need to dynamically decide whether to load related models:

```php
use App\Models\Book;

$books = Book::all();

if ($condition) {
    $books->load('author', 'publisher');
}
```

If you need to set additional query constraints on the eager loading query, you may pass an array keyed by the relationships you wish to load. The array values should be closure instances which receive the query instance:

```php
$author->load(['books' => function ($query) {
    $query->orderBy('published_date', 'asc');
}]);
```

To load a relationship only when it has not already been loaded, use the `loadMissing` method:

```php
$book->loadMissing('author');
```

##### Nested Lazy Eager Loading and `morphTo`

If you would like to eager load a `morphTo` relationship, as well as nested relationships on the various entities that may be returned by that relationship, you may use the `loadMorph` method.

This method accepts the name of the `morphTo` relationship as its first argument, and an array of model / relationship pairs as its second argument. To help illustrate this method, let's consider the following model:

```php
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * Get the parent of the activity feed record.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

In this example, let's assume `Event`, `Photo`, and `Post` models may create `ActivityFeed` models. Additionally, let's assume that `Event` models belong to a `Calendar` model, `Photo` models are associated with `Tag` models, and `Post` models belong to an `Author` model.

Using these model definitions and relationships, we may retrieve `ActivityFeed` model instances and eager load all `parentable` models and their respective nested relationships:

```php
$activities = ActivityFeed::with('parentable')
    ->get()
    ->loadMorph('parentable', [
        Event::class => ['calendar'],
        Photo::class => ['tags'],
        Post::class => ['author'],
    ]);
```

#### Automatic Eager Loading

In many cases, Laravel can automatically eager load the relationships you access. To enable automatic eager loading, you should invoke the `Model::automaticallyEagerLoadRelationships` method within the `boot` method of your application's `AppServiceProvider`:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::automaticallyEagerLoadRelationships();
}
```

When this feature is enabled, Laravel will attempt to automatically load any relationships you access that have not been previously loaded. For example, consider the following scenario:

```php
use App\Models\User;

$users = User::all();

foreach ($users as $user) {
    foreach ($user->posts as $post) {
        foreach ($post->comments as $comment) {
            echo $comment->content;
        }
    }
}
```

Typically, the code above would execute a query for each user in order to retrieve their posts, as well as a query for each post to retrieve its comments. However, when the `automaticallyEagerLoadRelationships` feature has been enabled, Laravel will automatically [lazy eager load](#lazy-eager-loading) the posts for all users in the user collection when you attempt to access the posts on any of the retrieved users. Likewise, when you attempt to access the comments for any retrieved post, all comments will be lazy eager loaded for all posts that were originally retrieved.

If you do not want to globally enable automatic eager loading, you can still enable this feature for a single Eloquent collection instance by invoking the `withRelationshipAutoloading` method on the collection:

```php
$users = User::where('vip', true)->get();

return $users->withRelationshipAutoloading();
```

#### Preventing Lazy Loading

As previously discussed, eager loading relationships can often provide significant performance benefits to your application. Therefore, if you would like, you may instruct Laravel to always prevent the lazy loading of relationships. To accomplish this, you may invoke the `preventLazyLoading` method offered by the base Eloquent model class. Typically, you should call this method within the `boot` method of your application's `AppServiceProvider` class.

The `preventLazyLoading` method accepts an optional boolean argument that indicates if lazy loading should be prevented. For example, you may wish to only disable lazy loading in non-production environments so that your production environment will continue to function normally even if a lazy loaded relationship is accidentally present in production code:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

After preventing lazy loading, Eloquent will throw a `Illuminate\Database\LazyLoadingViolationException` exception when your application attempts to lazy load any Eloquent relationship.

You may customize the behavior of lazy loading violations using the `handleLazyLoadingViolationUsing` method. For example, using this method, you may instruct lazy loading violations to only be logged instead of interrupting the application's execution with exceptions:

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

### Inserting and Updating Related Models

#### The `save` Method

Eloquent provides convenient methods for adding new models to relationships. For example, perhaps you need to add a new comment to a post. Instead of manually setting the `post_id` attribute on the `Comment` model you may insert the comment using the relationship's `save` method:

```php
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

Note that we did not access the `comments` relationship as a dynamic property. Instead, we called the `comments` method to obtain an instance of the relationship. The `save` method will automatically add the appropriate `post_id` value to the new `Comment` model.

If you need to save multiple related models, you may use the `saveMany` method:

```php
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

The `save` and `saveMany` methods will persist the given model instances, but will not add the newly persisted models to any in-memory relationships that are already loaded onto the parent model. If you plan on accessing the relationship after using the `save` or `saveMany` methods, you may wish to use the `refresh` method to reload the model and its relationships:

```php
$post->comments()->save($comment);

$post->refresh();

// All comments, including the newly saved comment...
$post->comments;
```

##### Recursively Saving Models and Relationships

If you would like to `save` your model and all of its associated relationships, you may use the `push` method. In this example, the `Post` model will be saved as well as its comments and the comment's authors:

```php
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

The `pushQuietly` method may be used to save a model and its associated relationships without raising any events:

```php
$post->pushQuietly();
```

#### The `create` Method

In addition to the `save` and `saveMany` methods, you may also use the `create` method, which accepts an array of attributes, creates a model, and inserts it into the database. The difference between `save` and `create` is that `save` accepts a full Eloquent model instance while `create` accepts a plain PHP `array`. The newly created model will be returned by the `create` method:

```php
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

You may use the `createMany` method to create multiple related models:

```php
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

The `createQuietly` and `createManyQuietly` methods may be used to create a model(s) without dispatching any events:

```php
$user = User::find(1);

$user->posts()->createQuietly([
    'title' => 'Post title.',
]);

$user->posts()->createManyQuietly([
    ['title' => 'First post.'],
    ['title' => 'Second post.'],
]);
```

You may also use the `findOrNew`, `firstOrNew`, `firstOrCreate`, and `updateOrCreate` methods to [create and update models on relationships](https://laravel.com/docs/eloquent#upserts).

> **Note:**
> Before using the `create` method, be sure to review the [mass assignment](https://laravel.com/docs/eloquent#mass-assignment) documentation.

#### Belongs To Relationships

If you would like to assign a child model to a new parent model, you may use the `associate` method. In this example, the `User` model defines a `belongsTo` relationship to the `Account` model. This `associate` method will set the foreign key on the child model:

```php
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

To remove a parent model from a child model, you may use the `dissociate` method. This method will set the relationship's foreign key to `null`:

```php
$user->account()->dissociate();

$user->save();
```

#### Many to Many Relationships

##### Attaching / Detaching

Eloquent also provides methods to make working with many-to-many relationships more convenient. For example, let's imagine a user can have many roles and a role can have many users. You may use the `attach` method to attach a role to a user by inserting a record in the relationship's intermediate table:

```php
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

When attaching a relationship to a model, you may also pass an array of additional data to be inserted into the intermediate table:

```php
$user->roles()->attach($roleId, ['expires' => $expires]);
```

Sometimes it may be necessary to remove a role from a user. To remove a many-to-many relationship record, use the `detach` method. The `detach` method will delete the appropriate record out of the intermediate table; however, both models will remain in the database:

```php
// Detach a single role from the user...
$user->roles()->detach($roleId);

// Detach all roles from the user...
$user->roles()->detach();
```

For convenience, `attach` and `detach` also accept arrays of IDs as input:

```php
$user = User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires],
]);
```

##### Syncing Associations

You may also use the `sync` method to construct many-to-many associations. The `sync` method accepts an array of IDs to place on the intermediate table. Any IDs that are not in the given array will be removed from the intermediate table. So, after this operation is complete, only the IDs in the given array will exist in the intermediate table:

```php
$user->roles()->sync([1, 2, 3]);
```

You may also pass additional intermediate table values with the IDs:

```php
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

If you would like to insert the same intermediate table values with each of the synced model IDs, you may use the `syncWithPivotValues` method:

```php
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

If you do not want to detach existing IDs that are missing from the given array, you may use the `syncWithoutDetaching` method:

```php
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

##### Toggling Associations

The many-to-many relationship also provides a `toggle` method which "toggles" the attachment status of the given related model IDs. If the given ID is currently attached, it will be detached. Likewise, if it is currently detached, it will be attached:

```php
$user->roles()->toggle([1, 2, 3]);
```

You may also pass additional intermediate table values with the IDs:

```php
$user->roles()->toggle([
    1 => ['expires' => true],
    2 => ['expires' => true],
]);
```

##### Transactional Pivot Operations

Each of the pivot operations discussed above also has an `OrFail` variant (`attachOrFail`, `detachOrFail`, `syncOrFail`, `syncWithoutDetachingOrFail`, and `toggleOrFail`) that wraps the operation within a database transaction, so that all changes are automatically rolled back if an exception is thrown:

```php
$user->roles()->attachOrFail([1, 2, 3]);

$user->roles()->syncOrFail([1, 2, 3]);
```

##### Updating a Record on the Intermediate Table

If you need to update an existing row in your relationship's intermediate table, you may use the `updateExistingPivot` method. This method accepts the intermediate record foreign key and an array of attributes to update:

```php
$user = User::find(1);

$user->roles()->updateExistingPivot($roleId, [
    'active' => false,
]);
```

### Touching Parent Timestamps

When a model defines a `belongsTo` or `belongsToMany` relationship to another model, such as a `Comment` which belongs to a `Post`, it is sometimes helpful to update the parent's timestamp when the child model is updated.

For example, when a `Comment` model is updated, you may want to automatically "touch" the `updated_at` timestamp of the owning `Post` so that it is set to the current date and time. To accomplish this, you may use the `Touches` attribute on your child model containing the names of the relationships that should have their `updated_at` timestamps updated when the child model is updated:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Touches;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Touches(['post'])]
class Comment extends Model
{
    /**
     * Get the post that the comment belongs to.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

> **Warning:**
> Parent model timestamps will only be updated if the child model is updated using Eloquent's `save` method.

## Authentication

> **Source:** [Authentication](https://laravel.com/docs/authentication) · [Laravel docs](https://github.com/laravel/docs), MIT

- [Social Authentication](https://laravel.com/docs/socialite)
- [Events](#events)

### Introduction

Many web applications provide a way for their users to authenticate with the application and "login". Implementing this feature in web applications can be a complex and potentially risky endeavor. For this reason, Laravel strives to give you the tools you need to implement authentication quickly, securely, and easily.

At its core, Laravel's authentication facilities are made up of "guards" and "providers". Guards define how users are authenticated for each request. For example, Laravel ships with a `session` guard which maintains state using session storage and cookies.

Providers define how users are retrieved from your persistent storage. Laravel ships with support for retrieving users using [Eloquent](https://laravel.com/docs/eloquent) and the database query builder. However, you are free to define additional providers as needed for your application.

Your application's authentication configuration file is located at `config/auth.php`. This file contains several well-documented options for tweaking the behavior of Laravel's authentication services.

> **Note:**
> Guards and providers should not be confused with "roles" and "permissions". To learn more about authorizing user actions via permissions, please refer to the [authorization](https://laravel.com/docs/authorization) documentation.

#### Starter Kits

Want to get started fast? Install a [Laravel application starter kit](https://laravel.com/docs/starter-kits) in a fresh Laravel application. After migrating your database, navigate your browser to `/register` or any other URL that is assigned to your application. The starter kits will take care of scaffolding your entire authentication system!

**Even if you choose not to use a starter kit in your final Laravel application, installing a [starter kit](https://laravel.com/docs/starter-kits) can be a wonderful opportunity to learn how to implement all of Laravel's authentication functionality in an actual Laravel project.** Since the Laravel starter kits contain authentication controllers, routes, and views for you, you can examine the code within these files to learn how Laravel's authentication features may be implemented.

#### Database Considerations

By default, Laravel includes an `App\Models\User` [Eloquent model](https://laravel.com/docs/eloquent) in your `app/Models` directory. This model may be used with the default Eloquent authentication driver.

If your application is not using Eloquent, you may use the `database` authentication provider which uses the Laravel query builder. If your application is using MongoDB, check out MongoDB's official [Laravel user authentication documentation](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/user-authentication/).

When building the database schema for the `App\Models\User` model, make sure the password column is at least 60 characters in length. Of course, the `users` table migration that is included in new Laravel applications already creates a column that exceeds this length.

Also, you should verify that your `users` (or equivalent) table contains a nullable, string `remember_token` column of 100 characters. This column will be used to store a token for users that select the "remember me" option when logging into your application. Again, the default `users` table migration that is included in new Laravel applications already contains this column.

#### Ecosystem Overview

Laravel offers several packages related to authentication. Before continuing, we'll review the general authentication ecosystem in Laravel and discuss each package's intended purpose.

First, consider how authentication works. When using a web browser, a user will provide their username and password via a login form. If these credentials are correct, the application will store information about the authenticated user in the user's [session](https://laravel.com/docs/session). A cookie issued to the browser contains the session ID so that subsequent requests to the application can associate the user with the correct session. After the session cookie is received, the application will retrieve the session data based on the session ID, note that the authentication information has been stored in the session, and will consider the user as "authenticated".

When a remote service needs to authenticate to access an API, cookies are not typically used for authentication because there is no web browser. Instead, the remote service sends an API token to the API on each request. The application may validate the incoming token against a table of valid API tokens and "authenticate" the request as being performed by the user associated with that API token.

##### Laravel's Built-in Browser Authentication Services

Laravel includes built-in authentication and session services which are typically accessed via the `Auth` and `Session` facades. These features provide cookie-based authentication for requests that are initiated from web browsers. They provide methods that allow you to verify a user's credentials and authenticate the user. In addition, these services will automatically store the proper authentication data in the user's session and issue the user's session cookie. A discussion of how to use these services is contained within this documentation.

**Application Starter Kits**

As discussed in this documentation, you can interact with these authentication services manually to build your application's own authentication layer. However, to help you get started more quickly, we have released [free starter kits](https://laravel.com/docs/starter-kits) that provide robust, modern scaffolding of the entire authentication layer.

##### Laravel's API Authentication Services

Laravel provides two optional packages to assist you in managing API tokens and authenticating requests made with API tokens: [Passport](https://laravel.com/docs/passport) and [Sanctum](https://laravel.com/docs/sanctum). Please note that these libraries and Laravel's built-in cookie based authentication libraries are not mutually exclusive. These libraries primarily focus on API token authentication while the built-in authentication services focus on cookie based browser authentication. Many applications will use both Laravel's built-in cookie based authentication services and one of Laravel's API authentication packages.

**Passport**

Passport is an OAuth2 authentication provider, offering a variety of OAuth2 "grant types" which allow you to issue various types of tokens. In general, this is a robust and complex package for API authentication. However, most applications do not require the complex features offered by the OAuth2 spec, which can be confusing for both users and developers. In addition, developers have been historically confused about how to authenticate SPA applications or mobile applications using OAuth2 authentication providers like Passport.

**Sanctum**

In response to the complexity of OAuth2 and developer confusion, we set out to build a simpler, more streamlined authentication package that could handle both first-party web requests from a web browser and API requests via tokens. This goal was realized with the release of [Laravel Sanctum](https://laravel.com/docs/sanctum), which should be considered the preferred and recommended authentication package for applications that will be offering a first-party web UI in addition to an API, or will be powered by a single-page application (SPA) that exists separately from the backend Laravel application, or applications that offer a mobile client.

Laravel Sanctum is a hybrid web / API authentication package that can manage your application's entire authentication process. This is possible because when Sanctum based applications receive a request, Sanctum will first determine if the request includes a session cookie that references an authenticated session. Sanctum accomplishes this by calling Laravel's built-in authentication services which we discussed earlier. If the request is not being authenticated via a session cookie, Sanctum will inspect the request for an API token. If an API token is present, Sanctum will authenticate the request using that token. To learn more about this process, please consult Sanctum's ["how it works"](https://laravel.com/docs/sanctum#how-it-works) documentation.

##### Summary and Choosing Your Stack

In summary, if your application will be accessed using a browser and you are building a monolithic Laravel application, your application will use Laravel's built-in authentication services.

Next, if your application offers an API that will be consumed by third parties, you will choose between [Passport](https://laravel.com/docs/passport) or [Sanctum](https://laravel.com/docs/sanctum) to provide API token authentication for your application. In general, Sanctum should be preferred when possible since it is a simple, complete solution for API authentication, SPA authentication, and mobile authentication, including support for "scopes" or "abilities".

If you are building a single-page application (SPA) that will be powered by a Laravel backend, you should use [Laravel Sanctum](https://laravel.com/docs/sanctum). When using Sanctum, you will either need to [manually implement your own backend authentication routes](#authenticating-users) or utilize [Laravel Fortify](https://laravel.com/docs/fortify) as a headless authentication backend service that provides routes and controllers for features such as registration, password reset, email verification, and more.

Passport may be chosen when your application absolutely needs all of the features provided by the OAuth2 specification. Additionally, if you are building an [MCP server](https://laravel.com/docs/mcp) that will be accessed by AI clients, you should use Passport, as MCP clients typically expect to [authenticate using OAuth](https://laravel.com/docs/mcp#oauth).

And, if you would like to get started quickly, we are pleased to recommend [our application starter kits](https://laravel.com/docs/starter-kits) as a quick way to start a new Laravel application that already uses our preferred authentication stack of Laravel's built-in authentication services.

### Authentication Quickstart

> **Warning:**
> This portion of the documentation discusses authenticating users via the [Laravel application starter kits](https://laravel.com/docs/starter-kits), which includes UI scaffolding to help you get started quickly. If you would like to integrate with Laravel's authentication systems directly, check out the documentation on [manually authenticating users](#authenticating-users).

#### Install a Starter Kit

First, you should [install a Laravel application starter kit](https://laravel.com/docs/starter-kits). Our starter kits offer beautifully designed starting points for incorporating authentication into your fresh Laravel application.

#### Retrieving the Authenticated User

After creating an application from a starter kit and allowing users to register and authenticate with your application, you will often need to interact with the currently authenticated user. While handling an incoming request, you may access the authenticated user via the `Auth` facade's `user` method:

```php
use Illuminate\Support\Facades\Auth;

// Retrieve the currently authenticated user...
$user = Auth::user();

// Retrieve the currently authenticated user's ID...
$id = Auth::id();
```

Alternatively, once a user is authenticated, you may access the authenticated user via an `Illuminate\Http\Request` instance. Remember, type-hinted classes will automatically be injected into your controller methods. By type-hinting the `Illuminate\Http\Request` object, you may gain convenient access to the authenticated user from any controller method in your application via the request's `user` method:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * Update the flight information for an existing flight.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        // ...

        return redirect('/flights');
    }
}
```

##### Determining if the Current User is Authenticated

To determine if the user making the incoming HTTP request is authenticated, you may use the `check` method on the `Auth` facade. This method will return `true` if the user is authenticated:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // The user is logged in...
}
```

> **Note:**
> Even though it is possible to determine if a user is authenticated using the `check` method, you will typically use a middleware to verify that the user is authenticated before allowing the user access to certain routes / controllers. To learn more about this, check out the documentation on [protecting routes](https://laravel.com/docs/authentication#protecting-routes).

#### Protecting Routes

[Route middleware](https://laravel.com/docs/middleware) can be used to only allow authenticated users to access a given route. Laravel ships with an `auth` middleware, which is a [middleware alias](https://laravel.com/docs/middleware#middleware-aliases) for the `Illuminate\Auth\Middleware\Authenticate` class. Since this middleware is already aliased internally by Laravel, all you need to do is attach the middleware to a route definition:

```php
Route::get('/flights', function () {
    // Only authenticated users may access this route...
})->middleware('auth');
```

##### Redirecting Unauthenticated Users

When the `auth` middleware detects an unauthenticated user, it will redirect the user to the `login` [named route](https://laravel.com/docs/routing#named-routes). You may modify this behavior using the `redirectGuestsTo` method within your application's `bootstrap/app.php` file:

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->redirectGuestsTo('/login');

    // Using a closure...
    $middleware->redirectGuestsTo(fn (Request $request) => route('login'));
})
```

##### Redirecting Authenticated Users

When the `guest` middleware detects an authenticated user, it will redirect the user to the `dashboard` or `home` named route. You may modify this behavior using the `redirectUsersTo` method within your application's `bootstrap/app.php` file:

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->redirectUsersTo('/panel');

    // Using a closure...
    $middleware->redirectUsersTo(fn (Request $request) => route('panel'));
})
```

##### Specifying a Guard

When attaching the `auth` middleware to a route, you may also specify which "guard" should be used to authenticate the user. The guard specified should correspond to one of the keys in the `guards` array of your `auth.php` configuration file:

```php
Route::get('/flights', function () {
    // Only authenticated users may access this route...
})->middleware('auth:admin');
```

#### Login Throttling

If you are using one of our [application starter kits](https://laravel.com/docs/starter-kits), rate limiting will automatically be applied to login attempts. By default, the user will not be able to login for one minute if they fail to provide the correct credentials after several attempts. The throttling is unique to the user's username / email address and their IP address.

> **Note:**
> If you would like to rate limit other routes in your application, check out the [rate limiting documentation](https://laravel.com/docs/routing#rate-limiting).

### Manually Authenticating Users

You are not required to use the authentication scaffolding included with Laravel's [application starter kits](https://laravel.com/docs/starter-kits). If you choose not to use this scaffolding, you will need to manage user authentication using the Laravel authentication classes directly. Don't worry, it's a cinch!

We will access Laravel's authentication services via the `Auth` [facade](https://laravel.com/docs/facades), so we'll need to make sure to import the `Auth` facade at the top of the class. Next, let's check out the `attempt` method. The `attempt` method is normally used to handle authentication attempts from your application's "login" form. If authentication is successful, you should regenerate the user's [session](https://laravel.com/docs/session) to prevent [session fixation](https://en.wikipedia.org/wiki/Session_fixation):

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Handle an authentication attempt.
     */
    public function authenticate(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            return redirect()->intended('dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }
}
```

The `attempt` method accepts an array of key / value pairs as its first argument. The values in the array will be used to find the user in your database table. So, in the example above, the user will be retrieved by the value of the `email` column. If the user is found, the hashed password stored in the database will be compared with the `password` value passed to the method via the array. You should not hash the incoming request's `password` value, since the framework will automatically hash the value before comparing it to the hashed password in the database. An authenticated session will be started for the user if the two hashed passwords match.

Remember, Laravel's authentication services will retrieve users from your database based on your authentication guard's "provider" configuration. In the default `config/auth.php` configuration file, the Eloquent user provider is specified and it is instructed to use the `App\Models\User` model when retrieving users. You may change these values within your configuration file based on the needs of your application.

The `attempt` method will return `true` if authentication was successful. Otherwise, `false` will be returned.

The `intended` method provided by Laravel's redirector will redirect the user to the URL they were attempting to access before being intercepted by the authentication middleware. A fallback URI may be given to this method in case the intended destination is not available.

##### Specifying Additional Conditions

If you wish, you may also add extra query conditions to the authentication query in addition to the user's email and password. To accomplish this, we may simply add the query conditions to the array passed to the `attempt` method. For example, we may verify that the user is marked as "active":

```php
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // Authentication was successful...
}
```

For complex query conditions, you may provide a closure in your array of credentials. This closure will be invoked with the query instance, allowing you to customize the query based on your application's needs:

```php
use Illuminate\Database\Eloquent\Builder;

if (Auth::attempt([
    'email' => $email,
    'password' => $password,
    fn (Builder $query) => $query->has('activeSubscription'),
])) {
    // Authentication was successful...
}
```

> **Warning:**
> In these examples, `email` is not a required option, it is merely used as an example. You should use whatever column name corresponds to a "username" in your database table.

The `attemptWhen` method, which receives a closure as its second argument, may be used to perform more extensive inspection of the potential user before actually authenticating the user. The closure receives the potential user and should return `true` or `false` to indicate if the user may be authenticated:

```php
if (Auth::attemptWhen([
    'email' => $email,
    'password' => $password,
], function (User $user) {
    return $user->isNotBanned();
})) {
    // Authentication was successful...
}
```

##### Accessing Specific Guard Instances

Via the `Auth` facade's `guard` method, you may specify which guard instance you would like to utilize when authenticating the user. This allows you to manage authentication for separate parts of your application using entirely separate authenticatable models or user tables.

The guard name passed to the `guard` method should correspond to one of the guards configured in your `auth.php` configuration file:

```php
if (Auth::guard('admin')->attempt($credentials)) {
    // ...
}
```

#### Remembering Users

Many web applications provide a "remember me" checkbox on their login form. If you would like to provide "remember me" functionality in your application, you may pass a boolean value as the second argument to the `attempt` method.

When this value is `true`, Laravel will keep the user authenticated indefinitely or until they manually logout. Your `users` table must include the string `remember_token` column, which will be used to store the "remember me" token. The `users` table migration included with new Laravel applications already includes this column:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // The user is being remembered...
}
```

If your application offers "remember me" functionality, you may use the `viaRemember` method to determine if the currently authenticated user was authenticated using the "remember me" cookie:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::viaRemember()) {
    // ...
}
```

#### Other Authentication Methods

##### Authenticate a User Instance

If you need to set an existing user instance as the currently authenticated user, you may pass the user instance to the `Auth` facade's `login` method. The given user instance must be an implementation of the `Illuminate\Contracts\Auth\Authenticatable` [contract](https://laravel.com/docs/contracts). The `App\Models\User` model included with Laravel already implements this interface. This method of authentication is useful when you already have a valid user instance, such as directly after a user registers with your application:

```php
use Illuminate\Support\Facades\Auth;

Auth::login($user);
```

You may pass a boolean value as the second argument to the `login` method. This value indicates if "remember me" functionality is desired for the authenticated session. Remember, this means that the session will be authenticated indefinitely or until the user manually logs out of the application:

```php
Auth::login($user, $remember = true);
```

If needed, you may specify an authentication guard before calling the `login` method:

```php
Auth::guard('admin')->login($user);
```

##### Authenticate a User by ID

To authenticate a user using their database record's primary key, you may use the `loginUsingId` method. This method accepts the primary key of the user you wish to authenticate:

```php
Auth::loginUsingId(1);
```

You may pass a boolean value to the `remember` argument of the `loginUsingId` method. This value indicates if "remember me" functionality is desired for the authenticated session. Remember, this means that the session will be authenticated indefinitely or until the user manually logs out of the application:

```php
Auth::loginUsingId(1, remember: true);
```

##### Authenticate a User Once

You may use the `once` method to authenticate a user with the application for a single request. No sessions or cookies will be utilized when calling this method, and the `Login` event will not be dispatched:

```php
if (Auth::once($credentials)) {
    // ...
}
```

### HTTP Basic Authentication

[HTTP Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) provides a quick way to authenticate users of your application without setting up a dedicated "login" page. To get started, attach the `auth.basic` [middleware](https://laravel.com/docs/middleware) to a route. The `auth.basic` middleware is included with the Laravel framework, so you do not need to define it:

```php
Route::get('/profile', function () {
    // Only authenticated users may access this route...
})->middleware('auth.basic');
```

Once the middleware has been attached to the route, you will automatically be prompted for credentials when accessing the route in your browser. By default, the `auth.basic` middleware will assume the `email` column on your `users` database table is the user's "username".

##### A Note on FastCGI

If you are using [PHP FastCGI](https://www.php.net/manual/en/install.fpm.php) and Apache to serve your Laravel application, HTTP Basic authentication may not work correctly. To correct these problems, the following lines may be added to your application's `.htaccess` file:

```apache
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

#### Stateless HTTP Basic Authentication

You may also use HTTP Basic Authentication without setting a user identifier cookie in the session. This is primarily helpful if you choose to use HTTP Authentication to authenticate requests to your application's API. To accomplish this, [define a middleware](https://laravel.com/docs/middleware) that calls the `onceBasic` method. If no response is returned by the `onceBasic` method, the request may be passed further into the application:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateOnceWithBasicAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return Auth::onceBasic() ?: $next($request);
    }

}
```

Next, attach the middleware to a route:

```php
Route::get('/api/user', function () {
    // Only authenticated users may access this route...
})->middleware(AuthenticateOnceWithBasicAuth::class);
```

### Logging Out

To manually log users out of your application, you may use the `logout` method provided by the `Auth` facade. This will remove the authentication information from the user's session so that subsequent requests are not authenticated.

In addition to calling the `logout` method, it is recommended that you invalidate the user's session and regenerate their [CSRF token](https://laravel.com/docs/csrf). After logging the user out, you would typically redirect the user to the root of your application:

```php
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Log the user out of the application.
 */
public function logout(Request $request): RedirectResponse
{
    Auth::logout();

    $request->session()->invalidate();

    $request->session()->regenerateToken();

    return redirect('/');
}
```

#### Invalidating Sessions on Other Devices

Laravel also provides a mechanism for invalidating and "logging out" a user's sessions that are active on other devices without invalidating the session on their current device. This feature is typically utilized when a user is changing or updating their password and you would like to invalidate sessions on other devices while keeping the current device authenticated.

Before getting started, you should make sure that the `Illuminate\Session\Middleware\AuthenticateSession` middleware is included on the routes that should receive session authentication. Typically, you should place this middleware on a route group definition so that it can be applied to the majority of your application's routes. By default, the `AuthenticateSession` middleware may be attached to a route using the `auth.session` [middleware alias](https://laravel.com/docs/middleware#middleware-aliases):

```php
Route::middleware(['auth', 'auth.session'])->group(function () {
    Route::get('/', function () {
        // ...
    });
});
```

Then, you may use the `logoutOtherDevices` method provided by the `Auth` facade. This method requires the user to confirm their current password, which your application should accept through an input form:

```php
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($currentPassword);
```

When the `logoutOtherDevices` method is invoked, the user's other sessions will be invalidated entirely, meaning they will be "logged out" of all guards they were previously authenticated by.

### Password Confirmation

While building your application, you may occasionally have actions that should require the user to confirm their password before the action is performed or before the user is redirected to a sensitive area of the application. Laravel includes built-in middleware to make this process a breeze. Implementing this feature will require you to define two routes: one route to display a view asking the user to confirm their password and another route to confirm that the password is valid and redirect the user to their intended destination.

> **Note:**
> The following documentation discusses how to integrate with Laravel's password confirmation features directly; however, if you would like to get started more quickly, the [Laravel application starter kits](https://laravel.com/docs/starter-kits) include support for this feature!

#### Configuration

After confirming their password, a user will not be asked to confirm their password again for three hours. However, you may configure the length of time before the user is re-prompted for their password by changing the value of the `password_timeout` configuration value within your application's `config/auth.php` configuration file.

#### Routing

##### The Password Confirmation Form

First, we will define a route to display a view that requests the user to confirm their password:

```php
Route::get('/confirm-password', function () {
    return view('auth.confirm-password');
})->middleware('auth')->name('password.confirm');
```

As you might expect, the view that is returned by this route should have a form containing a `password` field. In addition, feel free to include text within the view that explains that the user is entering a protected area of the application and must confirm their password.

##### Confirming the Password

Next, we will define a route that will handle the form request from the "confirm password" view. This route will be responsible for validating the password and redirecting the user to their intended destination:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

Route::post('/confirm-password', function (Request $request) {
    if (! Hash::check($request->password, $request->user()->password)) {
        return back()->withErrors([
            'password' => ['The provided password does not match our records.']
        ]);
    }

    $request->session()->passwordConfirmed();

    return redirect()->intended();
})->middleware(['auth', 'throttle:6,1']);
```

Before moving on, let's examine this route in more detail. First, the request's `password` field is determined to actually match the authenticated user's password. If the password is valid, we need to inform Laravel's session that the user has confirmed their password. The `passwordConfirmed` method will set a timestamp in the user's session that Laravel can use to determine when the user last confirmed their password. Finally, we can redirect the user to their intended destination.

#### Protecting Routes

You should ensure that any route that performs an action which requires recent password confirmation is assigned the `password.confirm` middleware. This middleware is included with the default installation of Laravel and will automatically store the user's intended destination in the session so that the user may be redirected to that location after confirming their password. After storing the user's intended destination in the session, the middleware will redirect the user to the `password.confirm` [named route](https://laravel.com/docs/routing#named-routes):

```php
Route::get('/settings', function () {
    // ...
})->middleware(['password.confirm']);

Route::post('/settings', function () {
    // ...
})->middleware(['password.confirm']);
```

### Adding Custom Guards

You may define your own authentication guards using the `extend` method on the `Auth` facade. You should place your call to the `extend` method within a [service provider](https://laravel.com/docs/providers). Since Laravel already ships with an `AppServiceProvider`, we can place the code in that provider:

```php
<?php

namespace App\Providers;

use App\Services\Auth\JwtGuard;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // ...

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::extend('jwt', function (Application $app, string $name, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\Guard...

            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

As you can see in the example above, the callback passed to the `extend` method should return an implementation of `Illuminate\Contracts\Auth\Guard`. This interface contains a few methods you will need to implement to define a custom guard. Once your custom guard has been defined, you may reference the guard in the `guards` configuration of your `auth.php` configuration file:

```php
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

#### Closure Request Guards

The simplest way to implement a custom, HTTP request based authentication system is by using the `Auth::viaRequest` method. This method allows you to quickly define your authentication process using a single closure.

To get started, call the `Auth::viaRequest` method within the `boot` method of your application's `AppServiceProvider`. The `viaRequest` method accepts an authentication driver name as its first argument. This name can be any string that describes your custom guard. The second argument passed to the method should be a closure that receives the incoming HTTP request and returns a user instance or, if authentication fails, `null`:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Auth::viaRequest('custom-token', function (Request $request) {
        return User::where('token', (string) $request->token)->first();
    });
}
```

Once your custom authentication driver has been defined, you may configure it as a driver within the `guards` configuration of your `auth.php` configuration file:

```php
'guards' => [
    'api' => [
        'driver' => 'custom-token',
    ],
],
```

Finally, you may reference the guard when assigning the authentication middleware to a route:

```php
Route::middleware('auth:api')->group(function () {
    // ...
});
```

### Adding Custom User Providers

If you are not using a traditional relational database to store your users, you will need to extend Laravel with your own authentication user provider. We will use the `provider` method on the `Auth` facade to define a custom user provider. The user provider resolver should return an implementation of `Illuminate\Contracts\Auth\UserProvider`:

```php
<?php

namespace App\Providers;

use App\Extensions\MongoUserProvider;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // ...

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::provider('mongo', function (Application $app, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\UserProvider...

            return new MongoUserProvider($app->make('mongo.connection'));
        });
    }
}
```

After you have registered the provider using the `provider` method, you may switch to the new user provider in your `auth.php` configuration file. First, define a `provider` that uses your new driver:

```php
'providers' => [
    'users' => [
        'driver' => 'mongo',
    ],
],
```

Finally, you may reference this provider in your `guards` configuration:

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],
```

#### The User Provider Contract

`Illuminate\Contracts\Auth\UserProvider` implementations are responsible for fetching an `Illuminate\Contracts\Auth\Authenticatable` implementation out of a persistent storage system, such as MySQL, MongoDB, etc. These two interfaces allow the Laravel authentication mechanisms to continue functioning regardless of how the user data is stored or what type of class is used to represent the authenticated user:

Let's take a look at the `Illuminate\Contracts\Auth\UserProvider` contract:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface UserProvider
{
    public function retrieveById($identifier);
    public function retrieveByToken($identifier, $token);
    public function updateRememberToken(Authenticatable $user, $token);
    public function retrieveByCredentials(array $credentials);
    public function validateCredentials(Authenticatable $user, array $credentials);
    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false);
}
```

The `retrieveById` function typically receives a key representing the user, such as an auto-incrementing ID from a MySQL database. The `Authenticatable` implementation matching the ID should be retrieved and returned by the method.

The `retrieveByToken` function retrieves a user by their unique `$identifier` and "remember me" `$token`, typically stored in a database column like `remember_token`. As with the previous method, the `Authenticatable` implementation with a matching token value should be returned by this method.

The `updateRememberToken` method updates the `$user` instance's `remember_token` with the new `$token`. A fresh token is assigned to users on a successful "remember me" authentication attempt or when the user is logging out.

The `retrieveByCredentials` method receives the array of credentials passed to the `Auth::attempt` method when attempting to authenticate with an application. The method should then "query" the underlying persistent storage for the user matching those credentials. Typically, this method will run a query with a "where" condition that searches for a user record with a "username" matching the value of `$credentials['username']`. The method should return an implementation of `Authenticatable`. **This method should not attempt to do any password validation or authentication.**

The `validateCredentials` method should compare the given `$user` with the `$credentials` to authenticate the user. For example, this method will typically use the `Hash::check` method to compare the value of `$user->getAuthPassword()` to the value of `$credentials['password']`. This method should return `true` or `false` indicating whether the password is valid.

The `rehashPasswordIfRequired` method should rehash the given `$user`'s password if required and supported. For example, this method will typically use the `Hash::needsRehash` method to determine if the `$credentials['password']` value needs to be rehashed. If the password needs to be rehashed, the method should use the `Hash::make` method to rehash the password and update the user's record in the underlying persistent storage.

#### The Authenticatable Contract

Now that we have explored each of the methods on the `UserProvider`, let's take a look at the `Authenticatable` contract. Remember, user providers should return implementations of this interface from the `retrieveById`, `retrieveByToken`, and `retrieveByCredentials` methods:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface Authenticatable
{
    public function getAuthIdentifierName();
    public function getAuthIdentifier();
    public function getAuthPasswordName();
    public function getAuthPassword();
    public function getRememberToken();
    public function setRememberToken($value);
    public function getRememberTokenName();
}
```

This interface is simple. The `getAuthIdentifierName` method should return the name of the "primary key" column for the user and the `getAuthIdentifier` method should return the "primary key" of the user. When using a MySQL back-end, this would likely be the auto-incrementing primary key assigned to the user record. The `getAuthPasswordName` method should return the name of the user's password column. The `getAuthPassword` method should return the user's hashed password.

This interface allows the authentication system to work with any "user" class, regardless of what ORM or storage abstraction layer you are using. By default, Laravel includes an `App\Models\User` class in the `app/Models` directory which implements this interface.

### Automatic Password Rehashing

Laravel's default password hashing algorithm is bcrypt. The "work factor" for bcrypt hashes can be adjusted via your application's `config/hashing.php` configuration file or the `BCRYPT_ROUNDS` environment variable.

Typically, the bcrypt work factor should be increased over time as CPU / GPU processing power increases. If you increase the bcrypt work factor for your application, Laravel will gracefully and automatically rehash user passwords as users authenticate with your application via Laravel's starter kits or when you [manually authenticate users](#authenticating-users) via the `attempt` method.

Typically, automatic password rehashing should not disrupt your application; however, you may disable this behavior by publishing the `hashing` configuration file:

```shell
php artisan config:publish hashing
```

Once the configuration file has been published, you may set the `rehash_on_login` configuration value to `false`:

```php
'rehash_on_login' => false,
```

### Events

Laravel dispatches a variety of [events](https://laravel.com/docs/events) during the authentication process. You may [define listeners](https://laravel.com/docs/events) for any of the following events:

<div class="overflow-auto">

| Event Name                                     |
| ---------------------------------------------- |
| `Illuminate\Auth\Events\Registered`            |
| `Illuminate\Auth\Events\Attempting`            |
| `Illuminate\Auth\Events\Authenticated`         |
| `Illuminate\Auth\Events\Login`                 |
| `Illuminate\Auth\Events\Failed`                |
| `Illuminate\Auth\Events\Validated`             |
| `Illuminate\Auth\Events\Verified`              |
| `Illuminate\Auth\Events\Logout`                |
| `Illuminate\Auth\Events\CurrentDeviceLogout`   |
| `Illuminate\Auth\Events\OtherDeviceLogout`     |
| `Illuminate\Auth\Events\Lockout`               |
| `Illuminate\Auth\Events\PasswordReset`         |
| `Illuminate\Auth\Events\PasswordResetLinkSent` |

</div>
