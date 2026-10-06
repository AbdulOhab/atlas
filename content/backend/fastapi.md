---
title: "Python FastAPI"
order: 16
summary: "Building APIs in Python with FastAPI: first steps, path and query parameters, and request bodies validated with Pydantic."
category: "Frameworks"
level: Beginner
---

# Python FastAPI

FastAPI builds APIs from type-hinted Python functions: the types drive validation, serialization and the interactive docs it generates for you.

**Course outline modules:** 29 (Python FastAPI)

## First steps

> **Source:** [First steps](https://fastapi.tiangolo.com/tutorial/first-steps/) · [FastAPI docs](https://github.com/fastapi/fastapi), MIT

The simplest FastAPI file could look like this:

Copy that to a file `main.py`.

> **Tip:**
>
> FastAPI has an [official extension for VS Code](https://marketplace.visualstudio.com/items?itemName=FastAPILabs.fastapi-vscode) (and Cursor), which provides a lot of features, including a path operation explorer, path operation search, CodeLens navigation in tests (jump to definition from tests), and FastAPI Cloud deployment and logs, all from your editor.
>

Run the live server:

<div class="termy">

```console
$ <font color="#4E9A06">uv run fastapi</font> dev

  <span style="background-color:#009485"><font color="#D3D7CF"> FastAPI </font></span>  Starting development server 🚀

             Searching for package file structure from directories
             with <font color="#3465A4">__init__.py</font> files
             Importing from <font color="#75507B">/home/user/code/</font><font color="#AD7FA8">awesomeapp</font>

   <span style="background-color:#007166"><font color="#D3D7CF"> module </font></span>  🐍 main.py

     <span style="background-color:#007166"><font color="#D3D7CF"> code </font></span>  Importing the FastAPI app object from the module with
             the following code:

             <u style="text-decoration-style:solid">from </u><u style="text-decoration-style:solid"><b>main</b></u><u style="text-decoration-style:solid"> import </u><u style="text-decoration-style:solid"><b>app</b></u>

      <span style="background-color:#007166"><font color="#D3D7CF"> app </font></span>  Using import string: <font color="#3465A4">main:app</font>

   <span style="background-color:#007166"><font color="#D3D7CF"> server </font></span>  Server started at <font color="#729FCF"><u style="text-decoration-style:solid">http://127.0.0.1:8000</u></font>
   <span style="background-color:#007166"><font color="#D3D7CF"> server </font></span>  Documentation at <font color="#729FCF"><u style="text-decoration-style:solid">http://127.0.0.1:8000/docs</u></font>

      <span style="background-color:#007166"><font color="#D3D7CF"> tip </font></span>  Running in development mode, for production use:
             <b>fastapi run</b>

             Logs:

     <span style="background-color:#007166"><font color="#D3D7CF"> INFO </font></span>  Will watch for changes in these directories:
             <b>[</b><font color="#4E9A06">&apos;/home/user/code/awesomeapp&apos;</font><b>]</b>
     <span style="background-color:#007166"><font color="#D3D7CF"> INFO </font></span>  Uvicorn running on <font color="#729FCF"><u style="text-decoration-style:solid">http://127.0.0.1:8000</u></font> <b>(</b>Press CTRL+C
             to quit<b>)</b>
     <span style="background-color:#007166"><font color="#D3D7CF"> INFO </font></span>  Started reloader process <b>[</b><font color="#34E2E2"><b>383138</b></font><b>]</b> using WatchFiles
     <span style="background-color:#007166"><font color="#D3D7CF"> INFO </font></span>  Started server process <b>[</b><font color="#34E2E2"><b>383153</b></font><b>]</b>
     <span style="background-color:#007166"><font color="#D3D7CF"> INFO </font></span>  Waiting for application startup.
     <span style="background-color:#007166"><font color="#D3D7CF"> INFO </font></span>  Application startup complete.
```

</div>

In the output, there's a line with something like:

```hl_lines="4"
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

That line shows the URL where your app is being served on your local machine.

#### Check it { #check-it }

Open your browser at [http://127.0.0.1:8000](http://127.0.0.1:8000).

You will see the JSON response as:

```JSON
{"message": "Hello World"}
```

#### Interactive API docs { #interactive-api-docs }

Now go to [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

You will see the automatic interactive API documentation (provided by [Swagger UI](https://github.com/swagger-api/swagger-ui)):

![Swagger UI](https://fastapi.tiangolo.com/img/index/index-01-swagger-ui-simple.png)

#### Alternative API docs { #alternative-api-docs }

And now, go to [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc).

You will see the alternative automatic documentation (provided by [ReDoc](https://github.com/Redocly/redoc)):

![ReDoc](https://fastapi.tiangolo.com/img/index/index-02-redoc-simple.png)

#### OpenAPI { #openapi }

**FastAPI** generates a "schema" with all your API using the **OpenAPI** standard for defining APIs.

##### "Schema" { #schema }

A "schema" is a definition or description of something. Not the code that implements it, but just an abstract description.

##### API "schema" { #api-schema }

In this case, [OpenAPI](https://github.com/OAI/OpenAPI-Specification) is a specification that dictates how to define a schema of your API.

This schema definition includes your API paths, the possible parameters they take, etc.

##### Data "schema" { #data-schema }

The term "schema" might also refer to the shape of some data, like a JSON content.

In that case, it would mean the JSON attributes, and data types they have, etc.

##### OpenAPI and JSON Schema { #openapi-and-json-schema }

OpenAPI defines an API schema for your API. And that schema includes definitions (or "schemas") of the data sent and received by your API using **JSON Schema**, the standard for JSON data schemas.

##### Check the `openapi.json` { #check-the-openapi-json }

If you are curious about what the raw OpenAPI schema looks like, FastAPI automatically generates a JSON (schema) with the descriptions of all your API.

You can see it directly at: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json).

It will show a JSON starting with something like:

```JSON
{
    "openapi": "3.1.0",
    "info": {
        "title": "FastAPI",
        "version": "0.1.0"
    },
    "paths": {
        "/items/": {
            "get": {
                "responses": {
                    "200": {
                        "description": "Successful Response",
                        "content": {
                            "application/json": {

...
```

##### What is OpenAPI for { #what-is-openapi-for }

The OpenAPI schema is what powers the two interactive documentation systems included.

And there are dozens of alternatives, all based on OpenAPI. You could easily add any of those alternatives to your application built with **FastAPI**.

You could also use it to generate code automatically, for clients that communicate with your API. For example, frontend, mobile or IoT applications.

#### Configure the app `entrypoint` in `pyproject.toml` { #configure-the-app-entrypoint-in-pyproject-toml }

You can configure where your app is located in a `pyproject.toml` file like:

```toml
[tool.fastapi]
entrypoint = "main:app"
```

That `entrypoint` will tell the `fastapi` command that it should import the app like:

```python
from main import app
```

If your code was structured like:

```
.
├── backend
│   ├── main.py
│   ├── __init__.py
```

Then you would set the `entrypoint` as:

```toml
[tool.fastapi]
entrypoint = "backend.main:app"
```

which would be equivalent to:

```python
from backend.main import app
```

#### `fastapi dev` with path or with `--entrypoint` CLI option { #fastapi-dev-with-path-or-with-entrypoint-cli-option }

You can also pass the file path to the `fastapi dev` command, and it will guess the FastAPI app object to use:

```console
$ uv run fastapi dev main.py
```

Or, you can also pass the `--entrypoint` option to the `fastapi dev` command:

```console
$ uv run fastapi dev --entrypoint main:app
```

But you would have to remember to pass the correct path\entrypoint every time you call the `fastapi` command.

Additionally, other tools might not be able to find it, for example the [VS Code Extension](https://fastapi.tiangolo.com/editor-support/) or [FastAPI Cloud](https://fastapicloud.com), so it is recommended to use the `entrypoint` in `pyproject.toml`.

#### Deploy your app (optional) { #deploy-your-app-optional }

You can optionally deploy your FastAPI app to [FastAPI Cloud](https://fastapicloud.com) with a single command. 🚀

<div class="termy">

```console
$ uv run fastapi deploy

Deploying to FastAPI Cloud...

✅ Deployment successful!

🐔 Ready the chicken! Your app is ready at https://myapp.fastapicloud.dev
```

</div>

The CLI will automatically detect your FastAPI application and deploy it to the cloud. If you are not logged in, your browser will open to complete the authentication process.

That's it! Now you can access your app at that URL. ✨

### Recap, step by step { #recap-step-by-step }

#### Step 1: import `FastAPI` { #step-1-import-fastapi }

`FastAPI` is a Python class that provides all the functionality for your API.

> **Technical Details:**
>
> `FastAPI` is a class that inherits directly from `Starlette`.
>
> You can use all the [Starlette](https://starlette.dev/) functionality with `FastAPI` too.
>

#### Step 2: create a `FastAPI` "instance" { #step-2-create-a-fastapi-instance }

Here the `app` variable will be an "instance" of the class `FastAPI`.

This will be the main point of interaction to create all your API.

#### Step 3: create a *path operation* { #step-3-create-a-path-operation }

##### Path { #path }

"Path" here refers to the last part of the URL starting from the first `/`.

So, in a URL like:

```
https://example.com/items/foo
```

...the path would be:

```
/items/foo
```

> **Note:**
>
> A "path" is also commonly called an "endpoint" or a "route".
>

While building an API, the "path" is the main way to separate "concerns" and "resources".

##### Operation { #operation }

"Operation" here refers to one of the HTTP "methods".

One of:

* `POST`
* `GET`
* `PUT`
* `DELETE`

...and the more exotic ones:

* `OPTIONS`
* `HEAD`
* `PATCH`
* `TRACE`

In the HTTP protocol, you can communicate to each path using one (or more) of these "methods".

---

When building APIs, you normally use these specific HTTP methods to perform a specific action.

Normally you use:

* `POST`: to create data.
* `GET`: to read data.
* `PUT`: to update data.
* `DELETE`: to delete data.

So, in OpenAPI, each of the HTTP methods is called an "operation".

We are going to call them "**operations**" too.

##### Define a *path operation decorator* { #define-a-path-operation-decorator }

The `@app.get("/")` tells **FastAPI** that the function right below is in charge of handling requests that go to:

* the path `/`
* using a <dfn title="an HTTP GET method"><code>get</code> operation</dfn>

> **`@Decorator` Info:**
>
> That `@something` syntax in Python is called a "decorator".
>
> You put it on top of a function. Like a pretty decorative hat (I guess that's where the term came from).
>
> A "decorator" takes the function below and does something with it.
>
> In our case, this decorator tells **FastAPI** that the function below corresponds to the **path** `/` with an **operation** `get`.
>
> It is the "**path operation decorator**".
>

You can also use the other operations:

* `@app.post()`
* `@app.put()`
* `@app.delete()`

And the more exotic ones:

* `@app.options()`
* `@app.head()`
* `@app.patch()`
* `@app.trace()`

> **Tip:**
>
> You are free to use each operation (HTTP method) as you wish.
>
> **FastAPI** doesn't enforce any specific meaning.
>
> The information here is presented as a guideline, not a requirement.
>
> For example, when using GraphQL you normally perform all the actions using only `POST` operations.
>

#### Step 4: define the **path operation function** { #step-4-define-the-path-operation-function }

This is our "**path operation function**":

* **path**: is `/`.
* **operation**: is `get`.
* **function**: is the function below the "decorator" (below `@app.get("/")`).

This is a Python function.

It will be called by **FastAPI** whenever it receives a request to the URL "`/`" using a `GET` operation.

In this case, it is an `async` function.

---

You could also define it as a normal function instead of `async def`:

> **Note:**
>
> If you don't know the difference, check the [Async: *"In a hurry?"*](https://fastapi.tiangolo.com/async/#in-a-hurry).
>

#### Step 5: return the content { #step-5-return-the-content }

You can return a `dict`, `list`, singular values as `str`, `int`, etc.

You can also return Pydantic models (you'll see more about that later).

There are many other objects and models that will be automatically converted to JSON (including ORMs, etc). Try using your favorite ones, it's highly probable that they are already supported.

#### Step 6: Deploy it { #step-6-deploy-it }

Deploy your app to **[FastAPI Cloud](https://fastapicloud.com)** with one command: `fastapi deploy`. 🎉

##### About FastAPI Cloud { #about-fastapi-cloud }

**[FastAPI Cloud](https://fastapicloud.com)** is built by the same author and team behind **FastAPI**.

It streamlines the process of **building**, **deploying**, and **accessing** an API with minimal effort.

It brings the same **developer experience** of building apps with FastAPI to **deploying** them to the cloud. 🎉

FastAPI Cloud is the primary sponsor and funding provider for the *FastAPI and friends* open source projects. ✨

##### Deploy to other cloud providers { #deploy-to-other-cloud-providers }

FastAPI is open source and based on standards. You can deploy FastAPI apps to any cloud provider you choose.

Follow your cloud provider's guides to deploy FastAPI apps with them. 🤓

### Recap { #recap }

* Import `FastAPI`.
* Create an `app` instance.
* Write a **path operation decorator** using decorators like `@app.get("/")`.
* Define a **path operation function**; for example, `def root(): ...`.
* Run the development server using the command `fastapi dev`.
* Optionally deploy your app with `fastapi deploy`.

## Path parameters

> **Source:** [Path parameters](https://fastapi.tiangolo.com/tutorial/path-params/) · [FastAPI docs](https://github.com/fastapi/fastapi), MIT

You can declare path "parameters" or "variables" with the same syntax used by Python format strings:

The value of the path parameter `item_id` will be passed to your function as the argument `item_id`.

So, if you run this example and go to [http://127.0.0.1:8000/items/foo](http://127.0.0.1:8000/items/foo), you will see a response of:

```JSON
{"item_id":"foo"}
```

### Path parameters with types { #path-parameters-with-types }

You can declare the type of a path parameter in the function, using standard Python type annotations:

In this case, `item_id` is declared to be an `int`.

> **Tip:**
>
> This will give you editor support inside of your function, with error checks, completion, etc.
>

### Data <dfn title="also known as: serialization, parsing, marshalling">conversion</dfn> { #data-conversion }

If you run this example and open your browser at [http://127.0.0.1:8000/items/3](http://127.0.0.1:8000/items/3), you will see a response of:

```JSON
{"item_id":3}
```

> **Tip:**
>
> Notice that the value your function received (and returned) is `3`, as a Python `int`, not a string `"3"`.
>
> So, with that type declaration, **FastAPI** gives you automatic request <dfn title="converting the string that comes from an HTTP request into Python data">"parsing"</dfn>.
>

### Data validation { #data-validation }

But if you go to the browser at [http://127.0.0.1:8000/items/foo](http://127.0.0.1:8000/items/foo), you will see a nice HTTP error of:

```JSON
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": [
        "path",
        "item_id"
      ],
      "msg": "Input should be a valid integer, unable to parse string as an integer",
      "input": "foo"
    }
  ]
}
```

because the path parameter `item_id` had a value of `"foo"`, which is not an `int`.

The same error would appear if you provided a `float` instead of an `int`, as in: [http://127.0.0.1:8000/items/4.2](http://127.0.0.1:8000/items/4.2)

> **Tip:**
>
> So, with the same Python type declaration, **FastAPI** gives you data validation.
>
> Notice that the error also clearly states exactly the point where the validation didn't pass.
>
> This is incredibly helpful while developing and debugging code that interacts with your API.
>

### Documentation { #documentation }

And when you open your browser at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs), you will see an automatic, interactive, API documentation like:

<img src="https://fastapi.tiangolo.com/img/tutorial/path-params/image01.png">

> **Tip:**
>
> Again, just with that same Python type declaration, **FastAPI** gives you automatic, interactive documentation (integrating Swagger UI).
>
> Notice that the path parameter is declared to be an integer.
>

### Standards-based benefits, alternative documentation { #standards-based-benefits-alternative-documentation }

And because the generated schema is from the [OpenAPI](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md) standard, there are many compatible tools.

Because of this, **FastAPI** itself provides an alternative API documentation (using ReDoc), which you can access at [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc):

<img src="https://fastapi.tiangolo.com/img/tutorial/path-params/image02.png">

The same way, there are many compatible tools. Including code generation tools for many languages.

### Pydantic { #pydantic }

All the data validation is performed under the hood by [Pydantic](https://pydantic.dev/docs/), so you get all the benefits from it. And you know you are in good hands.

You can use the same type declarations with `str`, `float`, `bool` and many other complex data types.

Several of these are explored in the next chapters of the tutorial.

### Order matters { #order-matters }

When creating *path operations*, you can find situations where you have a fixed path.

Like `/users/me`, let's say that it's to get data about the current user.

And then you can also have a path `/users/{user_id}` to get data about a specific user by some user ID.

Because *path operations* are evaluated in order, you need to make sure that the path for `/users/me` is declared before the one for `/users/{user_id}`:

Otherwise, the path for `/users/{user_id}` would match also for `/users/me`, "thinking" that it's receiving a parameter `user_id` with a value of `"me"`.

Similarly, you cannot redefine a path operation:

The first one will always be used since the path matches first.

### Predefined values { #predefined-values }

If you have a *path operation* that receives a *path parameter*, but you want the possible valid *path parameter* values to be predefined, you can use a standard Python <abbr title="Enumeration">`Enum`</abbr>.

#### Create an `Enum` class { #create-an-enum-class }

Import `Enum` and create a sub-class that inherits from `str` and from `Enum`.

By inheriting from `str` the API docs will be able to know that the values must be of type `string` and will be able to render correctly.

Then create class attributes with fixed values, which will be the available valid values:

> **Tip:**
>
> If you are wondering, "AlexNet", "ResNet", and "LeNet" are just names of Machine Learning <dfn title="Technically, Deep Learning model architectures">models</dfn>.
>

#### Declare a *path parameter* { #declare-a-path-parameter }

Then create a *path parameter* with a type annotation using the enum class you created (`ModelName`):

#### Check the docs { #check-the-docs }

Because the available values for the *path parameter* are predefined, the interactive docs can show them nicely:

<img src="https://fastapi.tiangolo.com/img/tutorial/path-params/image03.png">

#### Working with Python *enumerations* { #working-with-python-enumerations }

The value of the *path parameter* will be an *enumeration member*.

##### Compare *enumeration members* { #compare-enumeration-members }

You can compare it with the *enumeration member* in your created enum `ModelName`:

##### Get the *enumeration value* { #get-the-enumeration-value }

You can get the actual value (a `str` in this case) using `model_name.value`, or in general, `your_enum_member.value`:

> **Tip:**
>
> You could also access the value `"lenet"` with `ModelName.lenet.value`.
>

##### Return *enumeration members* { #return-enumeration-members }

You can return *enum members* from your *path operation*, even nested in a JSON body (e.g. a `dict`).

They will be converted to their corresponding values (strings in this case) before returning them to the client:

In your client you will get a JSON response like:

```JSON
{
  "model_name": "alexnet",
  "message": "Deep Learning FTW!"
}
```

### Path parameters containing paths { #path-parameters-containing-paths }

Let's say you have a *path operation* with a path `/files/{file_path}`.

But you need `file_path` itself to contain a *path*, like `home/johndoe/myfile.txt`.

So, the URL for that file would be something like: `/files/home/johndoe/myfile.txt`.

#### OpenAPI support { #openapi-support }

OpenAPI doesn't support a way to declare a *path parameter* to contain a *path* inside, as that could lead to scenarios that are difficult to test and define.

Nevertheless, you can still do it in **FastAPI**, using one of the internal tools from Starlette.

And the docs would still work, although not adding any documentation telling that the parameter should contain a path.

#### Path convertor { #path-convertor }

Using an option directly from Starlette you can declare a *path parameter* containing a *path* using a URL like:

```
/files/{file_path:path}
```

In this case, the name of the parameter is `file_path`, and the last part, `:path`, tells it that the parameter should match any *path*.

So, you can use it with:

> **Tip:**
>
> You might need the parameter to contain `/home/johndoe/myfile.txt`, with a leading slash (`/`).
>
> In that case, the URL would be: `/files//home/johndoe/myfile.txt`, with a double slash (`//`) between `files` and `home`.
>

### Recap { #recap }

With **FastAPI**, by using short, intuitive and standard Python type declarations, you get:

* Editor support: error checks, autocompletion, etc.
* Data "<dfn title="converting the string that comes from an HTTP request into Python data">parsing</dfn>"
* Data validation
* API annotation and automatic documentation

And you only have to declare them once.

That's probably the main visible advantage of **FastAPI** compared to alternative frameworks (apart from the raw performance).

## Query parameters

> **Source:** [Query parameters](https://fastapi.tiangolo.com/tutorial/query-params/) · [FastAPI docs](https://github.com/fastapi/fastapi), MIT

When you declare other function parameters that are not part of the path parameters, they are automatically interpreted as "query" parameters.

The query is the set of key-value pairs that go after the `?` in a URL, separated by `&` characters.

For example, in the URL:

```
http://127.0.0.1:8000/items/?skip=0&limit=10
```

...the query parameters are:

* `skip`: with a value of `0`
* `limit`: with a value of `10`

As they are part of the URL, they are "naturally" strings.

But when you declare them with Python types (in the example above, as `int`), they are converted to that type and validated against it.

All the same processes that apply to path parameters also apply to query parameters:

* Editor support (obviously)
* Data <dfn title="converting the string that comes from an HTTP request into Python data">"parsing"</dfn>
* Data validation
* Automatic documentation

### Defaults { #defaults }

As query parameters are not a fixed part of a path, they can be optional and can have default values.

In the example above they have default values of `skip=0` and `limit=10`.

So, going to the URL:

```
http://127.0.0.1:8000/items/
```

would be the same as going to:

```
http://127.0.0.1:8000/items/?skip=0&limit=10
```

But if you go to, for example:

```
http://127.0.0.1:8000/items/?skip=20
```

The parameter values in your function will be:

* `skip=20`: because you set it in the URL
* `limit=10`: because that was the default value

### Optional parameters { #optional-parameters }

The same way, you can declare optional query parameters, by setting their default to `None`:

In this case, the function parameter `q` will be optional, and will be `None` by default.

> **Tip:**
>
> Also notice that **FastAPI** is smart enough to notice that the path parameter `item_id` is a path parameter and `q` is not, so, it's a query parameter.
>

### Query parameter type conversion { #query-parameter-type-conversion }

You can also declare `bool` types, and they will be converted:

In this case, if you go to:

```
http://127.0.0.1:8000/items/foo?short=1
```

or

```
http://127.0.0.1:8000/items/foo?short=True
```

or

```
http://127.0.0.1:8000/items/foo?short=true
```

or

```
http://127.0.0.1:8000/items/foo?short=on
```

or

```
http://127.0.0.1:8000/items/foo?short=yes
```

or any other case variation (uppercase, first letter in uppercase, etc), your function will see the parameter `short` with a `bool` value of `True`. Otherwise as `False`.

### Multiple path and query parameters { #multiple-path-and-query-parameters }

You can declare multiple path parameters and query parameters at the same time, **FastAPI** knows which is which.

And you don't have to declare them in any specific order.

They will be detected by name:

### Required query parameters { #required-query-parameters }

When you declare a default value for non-path parameters (for now, we have only seen query parameters), then it is not required.

If you don't want to add a specific value but just make it optional, set the default as `None`.

But when you want to make a query parameter required, you can just not declare any default value:

Here the query parameter `needy` is a required query parameter of type `str`.

If you open in your browser a URL like:

```
http://127.0.0.1:8000/items/foo-item
```

...without adding the required parameter `needy`, you will see an error like:

```JSON
{
  "detail": [
    {
      "type": "missing",
      "loc": [
        "query",
        "needy"
      ],
      "msg": "Field required",
      "input": null
    }
  ]
}
```

As `needy` is a required parameter, you would need to set it in the URL:

```
http://127.0.0.1:8000/items/foo-item?needy=sooooneedy
```

...this would work:

```JSON
{
    "item_id": "foo-item",
    "needy": "sooooneedy"
}
```

And of course, you can define some parameters as required, some as having a default value, and some entirely optional:

In this case, there are 3 query parameters:

* `needy`, a required `str`.
* `skip`, an `int` with a default value of `0`.
* `limit`, an optional `int`.

> **Tip:**
>
> You could also use `Enum`s the same way as with [Path Parameters](https://fastapi.tiangolo.com/tutorial/path-params/#predefined-values).
>

## Request body

> **Source:** [Request body](https://fastapi.tiangolo.com/tutorial/body/) · [FastAPI docs](https://github.com/fastapi/fastapi), MIT

When you need to send data from a client (let's say, a browser) to your API, you send it as a **request body**.

A **request** body is data sent by the client to your API. A **response** body is the data your API sends to the client.

Your API almost always has to send a **response** body. But clients don't necessarily need to send **request bodies** all the time, sometimes they only request a path, maybe with some query parameters, but don't send a body.

To declare a **request** body, you use [Pydantic](https://pydantic.dev/docs/) models with all their power and benefits.

> **Note:**
>
> To send data, you should use one of: `POST` (the most common), `PUT`, `DELETE` or `PATCH`.
>
> Sending a body with a `GET` request has an undefined behavior in the specifications, nevertheless, it is supported by FastAPI, only for very complex/extreme use cases.
>
> As it is discouraged, the interactive docs with Swagger UI won't show the documentation for the body when using `GET`, and proxies in the middle might not support it.
>

### Import Pydantic's `BaseModel` { #import-pydantics-basemodel }

First, you need to import `BaseModel` from `pydantic`:

### Create your data model { #create-your-data-model }

Then you declare your data model as a class that inherits from `BaseModel`.

Use standard Python types for all the attributes:

The same as when declaring query parameters, when a model attribute has a default value, it is not required. Otherwise, it is required. Use `None` to make it just optional.

For example, this model above declares a JSON "`object`" (or Python `dict`) like:

```JSON
{
    "name": "Foo",
    "description": "An optional description",
    "price": 45.2,
    "tax": 3.5
}
```

...as `description` and `tax` are optional (with a default value of `None`), this JSON "`object`" would also be valid:

```JSON
{
    "name": "Foo",
    "price": 45.2
}
```

### Declare it as a parameter { #declare-it-as-a-parameter }

To add it to your *path operation*, declare it the same way you declared path and query parameters:

...and declare its type as the model you created, `Item`.

### Results { #results }

With just that Python type declaration, **FastAPI** will:

* Read the body of the request as JSON.
* Convert the corresponding types (if needed).
* Validate the data.
    * If the data is invalid, it will return a nice and clear error, indicating exactly where and what was the incorrect data.
* Give you the received data in the parameter `item`.
    * As you declared it in the function to be of type `Item`, you will also have all the editor support (completion, etc) for all of the attributes and their types.
* Generate [JSON Schema](https://json-schema.org) definitions for your model, you can also use them anywhere else you like if it makes sense for your project.
* Those schemas will be part of the generated OpenAPI schema, and used by the automatic documentation <abbr title="User Interfaces">UIs</abbr>.

### Automatic docs { #automatic-docs }

The JSON Schemas of your models will be part of your OpenAPI generated schema, and will be shown in the interactive API docs:

<img src="https://fastapi.tiangolo.com/img/tutorial/body/image01.png">

And will also be used in the API docs inside each *path operation* that needs them:

<img src="https://fastapi.tiangolo.com/img/tutorial/body/image02.png">

### Editor support { #editor-support }

In your editor, inside your function you will get type hints and completion everywhere (this wouldn't happen if you received a `dict` instead of a Pydantic model):

<img src="https://fastapi.tiangolo.com/img/tutorial/body/image03.png">

You also get error checks for incorrect type operations:

<img src="https://fastapi.tiangolo.com/img/tutorial/body/image04.png">

This is not by chance, the whole framework was built around that design.

And it was thoroughly tested at the design phase, before any implementation, to ensure it would work with all the editors.

There were even some changes to Pydantic itself to support this.

The previous screenshots were taken with [Visual Studio Code](https://code.visualstudio.com).

But you would get the same editor support with [PyCharm](https://www.jetbrains.com/pycharm/) and most of the other Python editors:

<img src="https://fastapi.tiangolo.com/img/tutorial/body/image05.png">

> **Tip:**
>
> If you use [PyCharm](https://www.jetbrains.com/pycharm/) as your editor, you can use the [Pydantic PyCharm Plugin](https://github.com/koxudaxi/pydantic-pycharm-plugin/).
>
> It improves editor support for Pydantic models, with:
>
> * auto-completion
> * type checks
> * refactoring
> * searching
> * inspections
>

### Use the model { #use-the-model }

Inside of the function, you can access all the attributes of the model object directly:

### Request body + path parameters { #request-body-path-parameters }

You can declare path parameters and request body at the same time.

**FastAPI** will recognize that the function parameters that match path parameters should be **taken from the path**, and that function parameters that are declared to be Pydantic models should be **taken from the request body**.

### Request body + path + query parameters { #request-body-path-query-parameters }

You can also declare **body**, **path** and **query** parameters, all at the same time.

**FastAPI** will recognize each of them and take the data from the correct place.

The function parameters will be recognized as follows:

* If the parameter is also declared in the **path**, it will be used as a path parameter.
* If the parameter is of a **singular type** (like `int`, `float`, `str`, `bool`, etc) it will be interpreted as a **query** parameter.
* If the parameter is declared to be of the type of a **Pydantic model**, it will be interpreted as a request **body**.

> **Note:**
>
> FastAPI will know that the value of `q` is not required because of the default value `= None`.
>
> The `str | None` is not used by FastAPI to determine that the value is not required, it will know it's not required because it has a default value of `= None`.
>
> But adding the type annotations will allow your editor to give you better support and detect errors.
>

### Without Pydantic { #without-pydantic }

If you don't want to use Pydantic models, you can also use **Body** parameters. See the docs for [Body - Multiple Parameters: Singular values in body](https://fastapi.tiangolo.com/tutorial/body-multiple-params/#singular-values-in-body).
