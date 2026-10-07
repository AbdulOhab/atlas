---
title: "Web Development with Gin"
order: 18
summary: "Building HTTP APIs in Go with Gin: quickstart, routing and parameters, route groups, binding and validation, and middleware."
category: "Frameworks"
level: Intermediate
---

# Web Development with Gin

Gin is Go's most popular web framework: a fast router, request binding with validation, and middleware, in an API that will feel familiar after Express.

**Course outline modules:** 38 (Web Development with Gin Framework)

## Fundamentals

### The problem

Go's standard library `net/http` is a production-grade server, but for years its router matched only path prefixes. It had no method routing or path parameters (Go 1.22 added both), and it offered no binding, validation or middleware chaining. Gin (2014) wraps `net/http` with a fast radix-tree router and a small API modeled on Martini, so building a JSON API in Go takes less boilerplate.

### Goals

- **Speed.** A radix-tree router that matches routes without allocating memory.
- **A small, familiar API:** routes, groups and middleware, like Express.
- **Stay on `net/http`.** A Gin engine is an `http.Handler`, so it works with the standard server and its ecosystem.

### The ideas everything else rests on

- **`*gin.Context`** carries everything for one request: params, query, body binding, response writers, values set by middleware, and the abort and next controls.
- **Handlers chain.** Middleware and the final handler form a slice. `c.Next()` runs the rest of the chain (code after it runs on the way back out), and `c.Abort()` stops it.
- **Route groups** share a prefix and middleware, for example `/api/v1` behind auth.
- **Binding and validation.** `c.ShouldBindJSON(&req)` decodes into a struct and checks its `binding:"required"` tags with the validator library.
- **Recovery and logging** are default middleware, so a panic becomes a 500 response instead of a crashed server.

### Trade-offs

It adds a dependency and its own context type where the standard library alone is now enough for many services (Go 1.22's `ServeMux` routes by method and path). The `Context` isn't safe to use outside its request's goroutine without `c.Copy()`. Like Express, project structure is left to you.

## Quickstart

> **Source:** [Quickstart](https://gin-gonic.com/en/docs/quickstart/) · [Gin docs](https://github.com/gin-gonic/website), MIT

Welcome to the Gin quickstart! This guide walks you through installing Gin, setting up a project, and running your first API—so you can start building web services with confidence.

### Prerequisites

- **Go version**: Gin requires [Go](https://go.dev/) version [1.25](https://go.dev/doc/devel/release#go1.25) or above
- Confirm Go is in your `PATH` and usable from your terminal. For Go installation help, [see official docs](https://go.dev/doc/install).

---

### Step 1: Install Gin and Initialize Your Project

Start by creating a new project folder and initializing a Go module:

```sh
mkdir gin-quickstart && cd gin-quickstart
go mod init gin-quickstart
```

Add Gin as a dependency:

```sh
go get -u github.com/gin-gonic/gin
```

---

### Step 2: Create Your First Gin App

Create a file called `main.go`:

```sh
touch main.go
```

Open `main.go` and add the following code:

```go
package main

import "github.com/gin-gonic/gin"

func main() {
  router := gin.Default()
  router.GET("/ping", func(c *gin.Context) {
    c.JSON(200, gin.H{
      "message": "pong",
    })
  })
  router.Run() // listens on 0.0.0.0:8080 by default
}
```

---

### Step 3: Run Your API Server

Start your server with:

```sh
go run main.go
```

Navigate to [http://localhost:8080/ping](http://localhost:8080/ping) in your browser, and you should see:

```json
{"message":"pong"}
```

---

### Additional Example: Using net/http with Gin

If you want to use `net/http` constants for response codes, import it as well:

```go
package main

import (
  "github.com/gin-gonic/gin"
  "net/http"
)

func main() {
  router := gin.Default()
  router.GET("/ping", func(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
      "message": "pong",
    })
  })
  router.Run()
}
```

---

### Tips & Resources

- New to Go? Learn how to write and run Go code in the [official Go documentation](https://go.dev/doc/code).
- Want to practice Gin concepts hands-on? Check out our [Learning Resources](https://gin-gonic.com/en/docs/../learning-resources) for interactive challenges and tutorials.
- Need a full-featured example? Try scaffolding with:

  ```sh
  curl https://raw.githubusercontent.com/gin-gonic/examples/master/basic/main.go > main.go
  ```

- For more detailed documentation, visit the [Gin source code docs](https://github.com/gin-gonic/gin/blob/master/docs/doc.md).

## HTTP methods

> **Source:** [HTTP methods](https://gin-gonic.com/en/docs/routing/http-method/) · [Gin docs](https://github.com/gin-gonic/website), MIT

Gin provides methods that map directly to HTTP verbs, making it straightforward to build RESTful APIs. Each method registers a route that responds only to the corresponding HTTP request type:

| Method      | Typical REST Usage                  |
| ----------- | ----------------------------------- |
| **GET**     | Retrieve a resource                 |
| **POST**    | Create a new resource               |
| **PUT**     | Replace an existing resource        |
| **PATCH**   | Partially update an existing resource |
| **DELETE**  | Remove a resource                   |
| **HEAD**    | Same as GET but without a body      |
| **OPTIONS** | Describe communication options      |

```go
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func getting(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"method": "GET"})
}

func posting(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"method": "POST"})
}

func putting(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"method": "PUT"})
}

func deleting(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"method": "DELETE"})
}

func patching(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"method": "PATCH"})
}

func head(c *gin.Context) {
	c.Status(http.StatusOK)
}

func options(c *gin.Context) {
	c.Status(http.StatusOK)
}

func main() {
	// Creates a gin router with default middleware:
	// logger and recovery (crash-free) middleware
	router := gin.Default()

	router.GET("/someGet", getting)
	router.POST("/somePost", posting)
	router.PUT("/somePut", putting)
	router.DELETE("/someDelete", deleting)
	router.PATCH("/somePatch", patching)
	router.HEAD("/someHead", head)
	router.OPTIONS("/someOptions", options)

	// By default it serves on :8080 unless a
	// PORT environment variable was defined.
	router.Run()
	// router.Run(":3000") for a hard coded port
}
```

#### Testing with curl

Once the server is running, you can test each endpoint:

```sh
# GET request
curl -X GET http://localhost:8080/someGet

# POST request
curl -X POST http://localhost:8080/somePost

# PUT request
curl -X PUT http://localhost:8080/somePut

# DELETE request
curl -X DELETE http://localhost:8080/someDelete

# PATCH request
curl -X PATCH http://localhost:8080/somePatch

# HEAD request (returns headers only, no body)
curl -I http://localhost:8080/someHead

# OPTIONS request
curl -X OPTIONS http://localhost:8080/someOptions
```

### See also

- [Parameters in path](https://gin-gonic.com/en/docs/routing/param-in-path/)
- [Grouping routes](https://gin-gonic.com/en/docs/routing/grouping-routes/)
- [Query string parameters](https://gin-gonic.com/en/docs/routing/querystring-param/)

## Path parameters

> **Source:** [Path parameters](https://gin-gonic.com/en/docs/routing/param-in-path/) · [Gin docs](https://github.com/gin-gonic/website), MIT

Gin supports two types of path parameters that let you capture values directly from the URL:

- **`:name`** — matches a single path segment. For example, `/user/:name` matches `/user/john` but does **not** match `/user/` or `/user`.
- **`*action`** — matches everything after the prefix, including slashes. For example, `/user/:name/*action` matches `/user/john/send` and `/user/john/`. The captured value includes the leading `/`.

Use `c.Param("name")` to retrieve the value of a path parameter inside your handler.

```go
package main

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

func main() {
  router := gin.Default()

  // This handler will match /user/john but will not match /user/ or /user
  router.GET("/user/:name", func(c *gin.Context) {
    name := c.Param("name")
    c.String(http.StatusOK, "Hello %s", name)
  })

  // However, this one will match /user/john/ and also /user/john/send
  // If no other routers match /user/john, it will redirect to /user/john/
  router.GET("/user/:name/*action", func(c *gin.Context) {
    name := c.Param("name")
    action := c.Param("action")
    message := name + " is " + action
    c.String(http.StatusOK, message)
  })

  router.Run(":8080")
}
```

### Test it

```sh
# Single parameter -- matches :name
curl http://localhost:8080/user/john
# Output: Hello john

# Wildcard parameter -- matches :name and *action
curl http://localhost:8080/user/john/send
# Output: john is /send

# Trailing slash is captured by the wildcard
curl http://localhost:8080/user/john/
# Output: john is /
```

:::note
The wildcard `*action` value always includes the leading `/`. In the example above, `c.Param("action")` returns `/send`, not `send`.
:::

:::caution
You cannot define both `/user/:name` and `/user/:name/*action` if they conflict at the same path depth. Gin will panic at startup if it detects ambiguous routes.
:::

### See also

- [Query string parameters](https://gin-gonic.com/en/docs/routing/querystring-param/)
- [Query and post form](https://gin-gonic.com/en/docs/routing/query-and-post-form/)

## Query string parameters

> **Source:** [Query string parameters](https://gin-gonic.com/en/docs/routing/querystring-param/) · [Gin docs](https://github.com/gin-gonic/website), MIT

Query string parameters are the key-value pairs that appear after the `?` in a URL (for example, `/search?q=gin&page=2`). Gin provides two methods to read them:

- `c.Query("key")` returns the value of the query parameter, or an **empty string** if the key is not present.
- `c.DefaultQuery("key", "default")` returns the value, or the specified **default value** if the key is not present.

Both methods are shortcuts for accessing `c.Request.URL.Query()` with less boilerplate.

```go
package main

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

func main() {
  router := gin.Default()

  // Query string parameters are parsed using the existing underlying request object.
  // The request responds to a url matching:  /welcome?firstname=Jane&lastname=Doe
  router.GET("/welcome", func(c *gin.Context) {
    firstname := c.DefaultQuery("firstname", "Guest")
    lastname := c.Query("lastname") // shortcut for c.Request.URL.Query().Get("lastname")

    c.String(http.StatusOK, "Hello %s %s", firstname, lastname)
  })
  router.Run(":8080")
}
```

### Test it

```sh
# Both parameters provided
curl "http://localhost:8080/welcome?firstname=Jane&lastname=Doe"
# Output: Hello Jane Doe

# Missing firstname -- uses default value "Guest"
curl "http://localhost:8080/welcome?lastname=Doe"
# Output: Hello Guest Doe

# No parameters at all
curl "http://localhost:8080/welcome"
# Output: Hello Guest
```

### See also

- [Parameters in path](https://gin-gonic.com/en/docs/routing/param-in-path/)

## Grouping routes

> **Source:** [Grouping routes](https://gin-gonic.com/en/docs/routing/grouping-routes/) · [Gin docs](https://github.com/gin-gonic/website), MIT

Route groups let you organize related routes under a shared URL prefix. This is useful for:

- **API versioning** -- group all v1 endpoints under `/v1` and v2 endpoints under `/v2`.
- **Shared middleware** -- apply authentication, logging, or rate-limiting to an entire set of routes at once instead of attaching middleware to every route individually.
- **Code organization** -- keep related handlers visually grouped in your source code.

### Basic grouping

```go
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func loginEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"action": "login"})
}

func submitEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"action": "submit"})
}

func readEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"action": "read"})
}

func main() {
	router := gin.Default()

	// Simple group: v1
	{
		v1 := router.Group("/v1")
		v1.POST("/login", loginEndpoint)
		v1.POST("/submit", submitEndpoint)
		v1.POST("/read", readEndpoint)
	}

	// Simple group: v2
	{
		v2 := router.Group("/v2")
		v2.POST("/login", loginEndpoint)
		v2.POST("/submit", submitEndpoint)
		v2.POST("/read", readEndpoint)
	}

	router.Run(":8080")
}
```

### Applying middleware to a group

You can pass middleware to `router.Group()` or call `Use()` on a group. Every route in that group will run the middleware before its handler.

```go
// AuthRequired is a placeholder for your auth middleware.
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ... check token, session, etc.
		c.Next()
	}
}

func main() {
	router := gin.Default()

	// Public routes -- no auth required
	public := router.Group("/api")
	{
		public.GET("/health", healthCheck)
	}

	// Private routes -- auth middleware applied to the whole group
	private := router.Group("/api")
	private.Use(AuthRequired())
	{
		private.GET("/profile", getProfile)
		private.POST("/settings", updateSettings)
	}

	router.Run(":8080")
}
```

### Nested groups

Groups can be nested to build deeper URL hierarchies while keeping middleware scoped appropriately.

```go
func main() {
	router := gin.Default()

	// /api
	api := router.Group("/api")
	{
		// /api/v1
		v1 := api.Group("/v1")
		{
			// /api/v1/users
			users := v1.Group("/users")
			users.GET("/", listUsers)
			users.GET("/:id", getUser)

			// /api/v1/posts
			posts := v1.Group("/posts")
			posts.GET("/", listPosts)
			posts.GET("/:id", getPost)
		}
	}

	router.Run(":8080")
}
```

Each level inherits the prefix of its parent, so the final routes become `/api/v1/users/`, `/api/v1/users/:id`, and so on.

## Binding and validation

> **Source:** [Binding and validation](https://gin-gonic.com/en/docs/binding/binding-and-validation/) · [Gin docs](https://github.com/gin-gonic/website), MIT

To bind a request body into a type, use model binding. We currently support binding of JSON, XML, YAML and standard form values (foo=bar&boo=baz).

Gin uses [**go-playground/validator/v10**](https://github.com/go-playground/validator) for validation. Check the full docs on tags usage [here](https://pkg.go.dev/github.com/go-playground/validator/v10#hdr-Baked_In_Validators_and_Tags).

Note that you need to set the corresponding binding tag on all fields you want to bind. For example, when binding from JSON, set `json:"fieldname"`.

Also, Gin provides two sets of methods for binding:
- **Type** - Must bind
  - **Methods** - `Bind`, `BindJSON`, `BindXML`, `BindQuery`, `BindYAML`
  - **Behavior** - These methods use `MustBindWith` under the hood. If there is a binding error, the request is aborted with `c.AbortWithError(400, err).SetType(ErrorTypeBind)`. This sets the response status code to 400 and the `Content-Type` header is set to `text/plain; charset=utf-8`. Note that if you try to set the response code after this, it will result in a warning `[GIN-debug] [WARNING] Headers were already written. Wanted to override status code 400 with 422`. If you wish to have greater control over the behavior, consider using the `ShouldBind` equivalent method.
- **Type** - Should bind
  - **Methods** - `ShouldBind`, `ShouldBindJSON`, `ShouldBindXML`, `ShouldBindQuery`, `ShouldBindYAML`
  - **Behavior** - These methods use `ShouldBindWith` under the hood. If there is a binding error, the error is returned and it is the developer's responsibility to handle the request and error appropriately.

When using the Bind-method, Gin tries to infer the binder depending on the Content-Type header. If you are sure what you are binding, you can use `MustBindWith` or `ShouldBindWith`.

You can also specify that specific fields are required. If a field is decorated with `binding:"required"` and has a empty value when binding, an error will be returned.

If one of the struct fields is itself a struct (nested struct) the fields of that struct will also need to be decorated with `binding:"required"` in order to validate correctly.

```go
// Binding from JSON
type Login struct {
  User     string `form:"user" json:"user" xml:"user"  binding:"required"`
  Password string `form:"password" json:"password" xml:"password" binding:"required"`
}

func main() {
  router := gin.Default()

  // Example for binding JSON ({"user": "manu", "password": "123"})
  router.POST("/loginJSON", func(c *gin.Context) {
    var json Login
    if err := c.ShouldBindJSON(&json); err != nil {
      c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
      return
    }

    if json.User != "manu" || json.Password != "123" {
      c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
      return
    }

    c.JSON(http.StatusOK, gin.H{"status": "you are logged in"})
  })

  // Example for binding XML (
  //  <?xml version="1.0" encoding="UTF-8"?>
  //  <root>
  //    <user>manu</user>
  //    <password>123</password>
  //  </root>)
  router.POST("/loginXML", func(c *gin.Context) {
    var xml Login
    if err := c.ShouldBindXML(&xml); err != nil {
      c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
      return
    }

    if xml.User != "manu" || xml.Password != "123" {
      c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
      return
    }

    c.JSON(http.StatusOK, gin.H{"status": "you are logged in"})
  })

  // Example for binding a HTML form (user=manu&password=123)
  router.POST("/loginForm", func(c *gin.Context) {
    var form Login
    // This will infer what binder to use depending on the content-type header.
    if err := c.ShouldBind(&form); err != nil {
      c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
      return
    }

    if form.User != "manu" || form.Password != "123" {
      c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
      return
    }

    c.JSON(http.StatusOK, gin.H{"status": "you are logged in"})
  })

  // Listen and serve on 0.0.0.0:8080
  router.Run(":8080")
}
```

#### Sample request

```sh
$ curl -v -X POST \
  http://localhost:8080/loginJSON \
  -H 'content-type: application/json' \
  -d '{ "user": "manu" }'
> POST /loginJSON HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.51.0
> Accept: */*
> content-type: application/json
> Content-Length: 18
>
* upload completely sent off: 18 out of 18 bytes
< HTTP/1.1 400 Bad Request
< Content-Type: application/json; charset=utf-8
< Date: Fri, 04 Aug 2017 03:51:31 GMT
< Content-Length: 100
<
{"error":"Key: 'Login.Password' Error:Field validation for 'Password' failed on the 'required' tag"}
```

#### Skip validate

When running the above example using the above the `curl` command, it returns error. Because the example use `binding:"required"` for `Password`. If use `binding:"-"` for `Password`, then it will not return error when running the above example again.

### See also

- [Custom validators](https://gin-gonic.com/en/docs/binding/custom-validators/)
- [Bind query or post data](https://gin-gonic.com/en/docs/binding/bind-query-or-post/)

## Using middleware

> **Source:** [Using middleware](https://gin-gonic.com/en/docs/middleware/using-middleware/) · [Gin docs](https://github.com/gin-gonic/website), MIT

Middleware in Gin are functions that run before (and optionally after) your route handler. They are used for cross-cutting concerns such as logging, authentication, error recovery, and request modification.

Gin supports three levels of middleware attachment:

- **Global middleware** — Applied to every route in the router. Registered with `router.Use()`. Good for concerns like logging and panic recovery that apply universally.
- **Group middleware** — Applied to all routes within a route group. Registered with `group.Use()`. Useful for applying authentication or authorization to a subset of routes (e.g., all `/admin/*` routes).
- **Per-route middleware** — Applied to a single route only. Passed as additional arguments to `router.GET()`, `router.POST()`, etc. Useful for route-specific logic such as custom rate limiting or input validation.

**Execution order:** Middleware functions execute in the order they are registered. When a middleware calls `c.Next()`, it passes control to the next middleware (or the final handler), and then resumes execution after `c.Next()` returns. This creates a stack-like (LIFO) pattern — the first middleware registered is the first to start but the last to finish. If a middleware does not call `c.Next()`, subsequent middleware and the handler are skipped (useful for short-circuiting with `c.Abort()`).

```go
package main

import (
  "github.com/gin-gonic/gin"
)

func main() {
  // Creates a router without any middleware by default
  router := gin.New()

  // Global middleware
  // Logger middleware will write the logs to gin.DefaultWriter even if you set with GIN_MODE=release.
  // By default gin.DefaultWriter = os.Stdout
  router.Use(gin.Logger())

  // Recovery middleware recovers from any panics and writes a 500 if there was one.
  router.Use(gin.Recovery())

  // Per route middleware, you can add as many as you desire.
  router.GET("/benchmark", MyBenchLogger(), benchEndpoint)

  // Authorization group
  // authorized := router.Group("/", AuthRequired())
  // exactly the same as:
  authorized := router.Group("/")
  // per group middleware! in this case we use the custom created
  // AuthRequired() middleware just in the "authorized" group.
  authorized.Use(AuthRequired())
  {
    authorized.POST("/login", loginEndpoint)
    authorized.POST("/submit", submitEndpoint)
    authorized.POST("/read", readEndpoint)

    // nested group
    testing := authorized.Group("testing")
    testing.GET("/analytics", analyticsEndpoint)
  }

  // Listen and serve on 0.0.0.0:8080
  router.Run(":8080")
}
```

:::note
`gin.Default()` is a convenience function that creates a router with `Logger` and `Recovery` middleware already attached. If you want a bare router with no middleware, use `gin.New()` as shown above and add only the middleware you need.
:::

## Custom middleware

> **Source:** [Custom middleware](https://gin-gonic.com/en/docs/middleware/custom-middleware/) · [Gin docs](https://github.com/gin-gonic/website), MIT

Gin middleware is a function that returns a `gin.HandlerFunc`. Middleware runs before and/or after the main handler, which makes it useful for logging, authentication, error handling, and other cross-cutting concerns.

#### Middleware execution flow

A middleware function has two phases, divided by the call to `c.Next()`:

- **Before `c.Next()`** -- Code here runs before the request reaches the main handler. Use this phase for setup tasks such as recording the start time, validating tokens, or setting context values with `c.Set()`.
- **`c.Next()`** -- This calls the next handler in the chain (which may be another middleware or the final route handler). Execution pauses here until all downstream handlers have completed.
- **After `c.Next()`** -- Code here runs after the main handler has finished. Use this phase for cleanup, logging response status, or measuring latency.

If you want to stop the chain entirely (for example, when authentication fails), call `c.Abort()` instead of `c.Next()`. This prevents any remaining handlers from executing. You can combine it with a response, for example `c.AbortWithStatusJSON(401, gin.H{"error": "unauthorized"})`.

```go
package main

import (
  "log"
  "time"

  "github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
  return func(c *gin.Context) {
    t := time.Now()

    // Set example variable
    c.Set("example", "12345")

    // before request

    c.Next()

    // after request
    latency := time.Since(t)
    log.Print(latency)

    // access the status we are sending
    status := c.Writer.Status()
    log.Println(status)
  }
}

func main() {
  r := gin.New()
  r.Use(Logger())

  r.GET("/test", func(c *gin.Context) {
    example := c.MustGet("example").(string)

    // it would print: "12345"
    log.Println(example)
  })

  // Listen and serve on 0.0.0.0:8080
  r.Run(":8080")
}
```

#### Try it

```bash
curl http://localhost:8080/test
```

The server logs will show the request latency and HTTP status code for every request that passes through the `Logger` middleware.

### See also

- [Error handling middleware](https://gin-gonic.com/en/docs/middleware/error-handling-middleware/)
- [Using middleware](https://gin-gonic.com/en/docs/middleware/using-middleware/)
