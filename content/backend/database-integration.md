---
title: "Backend and Database Integration"
order: 14
summary: "Connecting Node.js to PostgreSQL with node-postgres: connections, parameterized queries, pooling, transactions and project structure."
category: "Databases"
level: Intermediate
---

# Backend and Database Integration

The last step is wiring the database into the server: connect once, pool connections, never build SQL by string concatenation, and keep data access in one place.

**Course outline modules:** 21 (Backend + Database Integration)

## Connecting

> **Source:** [Connecting](https://node-postgres.com/features/connecting) · [node-postgres docs](https://github.com/brianc/node-postgres), MIT

### Environment variables

node-postgres uses the same [environment variables](https://www.postgresql.org/docs/9.1/static/libpq-envars.html) as libpq and psql to connect to a PostgreSQL server. Both individual clients & pools will use these environment variables. Here's a tiny program connecting node.js to the PostgreSQL server:

```js
import pg from 'pg'
const { Pool, Client } = pg

// pools will use environment variables
// for connection information
const pool = new Pool()

// you can also use async/await
const res = await pool.query('SELECT NOW()')
await pool.end()

// clients will also use environment variables
// for connection information
const client = new Client()
await client.connect()

const res = await client.query('SELECT NOW()')
await client.end()
```

To run the above program and specify which database to connect to we can invoke it like so:

```sh
$ PGUSER=dbuser \
  PGPASSWORD=secretpassword \
  PGHOST=database.server.com \
  PGPORT=3211 \
  PGDATABASE=mydb \
  node script.js
```

This allows us to write our programs without having to specify connection information in the program and lets us reuse them to connect to different databases without having to modify the code.

The default values for the environment variables used are:

```
PGUSER=process.env.USER
PGPASSWORD=null
PGHOST=localhost
PGPORT=5432
PGDATABASE=process.env.USER
```

### Programmatic

node-postgres also supports configuring a pool or client programmatically with connection information. Here's our same script from above modified to use programmatic (hard-coded in this case) values. This can be useful if your application already has a way to manage config values or you don't want to use environment variables.

```js
import pg from 'pg'
const { Pool, Client } = pg

const pool = new Pool({
  user: 'dbuser',
  password: 'secretpassword',
  host: 'database.server.com',
  port: 3211,
  database: 'mydb',
})

console.log(await pool.query('SELECT NOW()'))

const client = new Client({
  user: 'dbuser',
  password: 'secretpassword',
  host: 'database.server.com',
  port: 3211,
  database: 'mydb',
})

await client.connect()

console.log(await client.query('SELECT NOW()'))

await client.end()
```

Many cloud providers include alternative methods for connecting to database instances using short-lived authentication tokens. node-postgres supports dynamic passwords via a callback function, either synchronous or asynchronous. The callback function must resolve to a string.

```js
import pg from 'pg'
const { Pool } = pg
import { RDS } from 'aws-sdk'

const signerOptions = {
  credentials: {
    accessKeyId: 'YOUR-ACCESS-KEY',
    secretAccessKey: 'YOUR-SECRET-ACCESS-KEY',
  },
  region: 'us-east-1',
  hostname: 'example.aslfdewrlk.us-east-1.rds.amazonaws.com',
  port: 5432,
  username: 'api-user',
}

const signer = new RDS.Signer(signerOptions)

const getPassword = () => signer.getAuthToken()

const pool = new Pool({
  user: signerOptions.username,
  password: getPassword,
  host: signerOptions.hostname,
  port: signerOptions.port,
  database: 'my-db',
})
```

#### Unix Domain Sockets

Connections to unix sockets can also be made. This can be useful on distros like Ubuntu, where authentication is managed via the socket connection instead of a password.

```js
import pg from 'pg'
const { Client } = pg
client = new Client({
  user: 'username',
  password: 'password',
  host: '/cloudsql/myproject:zone:mydb',
  database: 'database_name',
})
```

### Connection URI

You can initialize both a pool and a client with a connection string URI as well. This is common in environments like Heroku where the database connection string is supplied to your application dyno through an environment variable. Connection string parsing brought to you by [pg-connection-string](https://github.com/brianc/node-postgres/tree/master/packages/pg-connection-string).

```js
import pg from 'pg'
const { Pool, Client } = pg
const connectionString = 'postgresql://dbuser:secretpassword@database.server.com:3211/mydb'

const pool = new Pool({
  connectionString,
})

await pool.query('SELECT NOW()')
await pool.end()

const client = new Client({
  connectionString,
})

await client.connect()

await client.query('SELECT NOW()')

await client.end()
```

## Queries

> **Source:** [Queries](https://node-postgres.com/features/queries) · [node-postgres docs](https://github.com/brianc/node-postgres), MIT

For the sake of brevity I am using the `client.query` method instead of the `pool.query` method - both methods support the same API. In fact, `pool.query` delegates directly to `client.query` internally.

### Text only

If your query has no parameters you do not need to include them to the query method:

```js
await client.query('SELECT NOW() as now')
```

### Parameterized query

If you are passing parameters to your queries you will want to avoid string concatenating parameters into the query text directly. This can (and often does) lead to sql injection vulnerabilities. node-postgres supports parameterized queries, passing your query text _unaltered_ as well as your parameters to the PostgreSQL server where the parameters are safely substituted into the query with battle-tested parameter substitution code within the server itself.

```js
const text = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *'
const values = ['brianc', 'brian.m.carlson@gmail.com']

const res = await client.query(text, values)
console.log(res.rows[0])
// { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
```

<div className="alert alert-warning">
  PostgreSQL does not support parameters for identifiers. If you need to have dynamic database, schema, table, or column names (e.g. in DDL statements) use [pg-format](https://www.npmjs.com/package/pg-format) package for handling escaping these values to ensure you do not have SQL injection!
</div>

Parameters passed as the second argument to `query()` will be converted to raw data types using the following rules:

**null and undefined**

If parameterizing `null` and `undefined` then both will be converted to `null`.

**Date**

Custom conversion to a UTC date string.

**Buffer**

Buffer instances are unchanged.

**Array**

Converted to a string that describes a Postgres array. Each array item is recursively converted using the rules described here.

**Object**

If a parameterized value has the method `toPostgres` then it will be called and its return value will be used in the query.
The signature of `toPostgres` is the following:

```
toPostgres (prepareValue: (value) => any): any
```

The `prepareValue` function provided can be used to convert nested types to raw data types suitable for the database.

Otherwise if no `toPostgres` method is defined then `JSON.stringify` is called on the parameterized value.

**Everything else**

All other parameterized values will be converted by calling `value.toString` on the value.

### Query config object

`pool.query` and `client.query` both support taking a config object as an argument instead of taking a string and optional array of parameters. The same example above could also be performed like so:

```js
const query = {
  text: 'INSERT INTO users(name, email) VALUES($1, $2)',
  values: ['brianc', 'brian.m.carlson@gmail.com'],
}

const res = await client.query(query)
console.log(res.rows[0])
```

The query config object allows for a few more advanced scenarios:

#### Prepared statements

PostgreSQL has the concept of a [prepared statement](https://www.postgresql.org/docs/9.3/static/sql-prepare.html). node-postgres supports this by supplying a `name` parameter to the query config object. If you supply a `name` parameter the query execution plan will be cached on the PostgreSQL server on a **per connection basis**. This means if you use two different connections each will have to parse & plan the query once. node-postgres handles this transparently for you: a client only requests a query to be parsed the first time that particular client has seen that query name:

```js
const query = {
  // give the query a unique name
  name: 'fetch-user',
  text: 'SELECT * FROM user WHERE id = $1',
  values: [1],
}

const res = await client.query(query)
console.log(res.rows[0])
```

In the above example the first time the client sees a query with the name `'fetch-user'` it will send a 'parse' request to the PostgreSQL server & execute the query as normal. The second time, it will skip the 'parse' request and send the _name_ of the query to the PostgreSQL server.

<div className='message is-warning'>
  <div className='message-body'>
Be careful not to fall into the trap of premature optimization.  Most of your queries will likely not benefit much, if at all, from using prepared statements.  This is a somewhat "power user" feature of PostgreSQL that is best used when you know how to use it - namely with very complex queries with lots of joins and advanced operations like union and switch statements.  I rarely use this feature in my own apps unless writing complex aggregate queries for reports and I know the reports are going to be executed very frequently.
  </div>
</div>

#### Row mode

By default node-postgres reads rows and collects them into JavaScript objects with the keys matching the column names and the values matching the corresponding row value for each column. If you do not need or do not want this behavior you can pass `rowMode: 'array'` to a query object. This will inform the result parser to bypass collecting rows into a JavaScript object, and instead will return each row as an array of values.

```js
const query = {
  text: 'SELECT $1::text as first_name, $2::text as last_name',
  values: ['Brian', 'Carlson'],
  rowMode: 'array',
}

const res = await client.query(query)
console.log(res.fields.map(field => field.name)) // ['first_name', 'last_name']
console.log(res.rows[0]) // ['Brian', 'Carlson']
```

#### Types

You can pass in a custom set of type parsers to use when parsing the results of a particular query. The `types` property must conform to the [Types](https://node-postgres.com/apis/types) API. Here is an example in which every value is returned as a string:

```js
const query = {
  text: 'SELECT * from some_table',
  types: {
    getTypeParser: () => val => val,
  },
}
```

## Connection pooling

> **Source:** [Connection pooling](https://node-postgres.com/features/pooling) · [node-postgres docs](https://github.com/brianc/node-postgres), MIT

If you're working on a web application or other software which makes frequent queries you'll want to use a connection pool.

The easiest and by far most common way to use node-postgres is through a connection pool.

### Why?

- Connecting a new client to the PostgreSQL server requires a handshake which can take 20-30 milliseconds. During this time passwords are negotiated, SSL may be established, and configuration information is shared with the client & server. Incurring this cost _every time_ we want to execute a query would substantially slow down our application.

- The PostgreSQL server can only handle a [limited number of clients at a time](https://wiki.postgresql.org/wiki/Number_Of_Database_Connections). Depending on the available memory of your PostgreSQL server you may even crash the server if you connect an unbounded number of clients. _note: I have crashed a large production PostgreSQL server instance in RDS by opening new clients and never disconnecting them in a python application long ago. It was not fun._

- PostgreSQL can only process one query at a time on a single connected client in a first-in first-out manner. If your multi-tenant web application is using only a single connected client all queries among all simultaneous requests will be pipelined and executed serially, one after the other. No good!

#### Good news

node-postgres ships with built-in connection pooling via the [pg-pool](https://node-postgres.com/apis/pool) module.

### Examples

The client pool allows you to have a reusable pool of clients you can check out, use, and return. You generally want a limited number of these in your application and usually just 1. Creating an unbounded number of pools defeats the purpose of pooling at all.

#### Checkout, use, and return

```js
import pg from 'pg'
const { Pool } = pg

const pool = new Pool()

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

const client = await pool.connect()
const res = await client.query('SELECT * FROM users WHERE id = $1', [1])
console.log(res.rows[0])

client.release()
```

  <div>
    You must <b>always</b> return the client to the pool if you successfully check it out, regardless of whether or not
    there was an error with the queries you ran on the client.
  </div>
  If you don't release the client your application will leak them and eventually your pool will be empty forever and all
  future requests to check out a client from the pool will wait forever.

#### Single query

If you don't need a transaction or you just need to run a single query, the pool has a convenience method to run a query on any available client in the pool. This is the preferred way to query with node-postgres if you can as it removes the risk of leaking a client.

```js
import pg from 'pg'
const { Pool } = pg

const pool = new Pool()

const res = await pool.query('SELECT * FROM users WHERE id = $1', [1])
console.log('user:', res.rows[0])
```

#### Shutdown

To shut down a pool call `pool.end()` on the pool. This will wait for all checked-out clients to be returned and then shut down all the clients and the pool timers.

```js
import pg from 'pg'
const { Pool } = pg
const pool = new Pool()

console.log('starting async query')
const result = await pool.query('SELECT NOW()')
console.log('async query finished')

console.log('starting callback query')
pool.query('SELECT NOW()', (err, res) => {
  console.log('callback query finished')
})

console.log('calling end')
await pool.end()
console.log('pool has drained')
```

The output of the above will be:

```
starting async query
async query finished
starting callback query
calling end
callback query finished
pool has drained
```

  The pool will return errors when attempting to check out a client after you've called pool.end() on the pool.

## Transactions

> **Source:** [Transactions](https://node-postgres.com/features/transactions) · [node-postgres docs](https://github.com/brianc/node-postgres), MIT

To execute a transaction with node-postgres you simply execute `BEGIN / COMMIT / ROLLBACK` queries yourself through a client. Because node-postgres strives to be low level and un-opinionated, it doesn't provide any higher level abstractions specifically around transactions.

  You <strong>must</strong> use the <em>same</em> client instance for all statements within a transaction. PostgreSQL
  isolates a transaction to individual clients. This means if you initialize or use transactions with the{' '}
  <span className="code">pool.query</span> method you <strong>will</strong> have problems. Do not use transactions with
  the <span className="code">pool.query</span> method.

### Examples

```js
import { Pool } from 'pg'
const pool = new Pool()

const client = await pool.connect()

try {
  await client.query('BEGIN')
  const queryText = 'INSERT INTO users(name) VALUES($1) RETURNING id'
  const res = await client.query(queryText, ['brianc'])

  const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
  const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
  await client.query(insertPhotoText, insertPhotoValues)
  await client.query('COMMIT')
} catch (e) {
  await client.query('ROLLBACK')
  throw e
} finally {
  client.release()
}
```

## Project structure

> **Source:** [Project structure](https://node-postgres.com/guides/project-structure) · [node-postgres docs](https://github.com/brianc/node-postgres), MIT

Whenever I am writing a project & using node-postgres I like to create a file within it and make all interactions with the database go through this file. This serves a few purposes:

- Allows my project to adjust to any changes to the node-postgres API without having to trace down all the places I directly use node-postgres in my application.
- Allows me to have a single place to put logging and diagnostics around my database.
- Allows me to make custom extensions to my database access code & share it throughout the project.
- Allows a single place to bootstrap & configure the database.

### example

The location doesn't really matter - I've found it usually ends up being somewhat app specific and in line with whatever folder structure conventions you're using. For this example I'll use an express app structured like so:

```
- app.js
- index.js
- routes/
  - index.js
  - photos.js
  - user.js
- db/
  - index.js <--- this is where I put data access code
```

Typically I'll start out my `db/index.js` file like so:

```js
import { Pool } from 'pg'

const pool = new Pool()

export const query = (text, params) => {
  return pool.query(text, params)
}
```

That's it. But now everywhere else in my application instead of requiring `pg` directly, I'll require this file. Here's an example of a route within `routes/user.js`:

```js
// notice here I'm requiring my database adapter file
// and not requiring node-postgres directly
import * as db from '../db/index.js'

app.get('/:id', async (req, res, next) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id])
  res.send(result.rows[0])
})

// ... many other routes in this file
```

Imagine we have lots of routes scattered throughout many files under our `routes/` directory. We now want to go back and log every single query that's executed, how long it took, and the number of rows it returned. If we had required node-postgres directly in every route file we'd have to go edit every single route - that would take forever & be really error prone! But thankfully we put our data access into `db/index.js`. Let's go add some logging:

```js
import { Pool } from 'pg'

const pool = new Pool()

export const query = async (text, params) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('executed query', { text, duration, rows: res.rowCount })
  return res
}
```

That was pretty quick! And now all of our queries everywhere in our application are being logged.

_note: I didn't log the query parameters. Depending on your application you might be storing encrypted passwords or other sensitive information in your database. If you log your query parameters you might accidentally log sensitive information. Every app is different though so do what suits you best!_

Now what if we need to check out a client from the pool to run several queries in a row in a transaction? We can add another method to our `db/index.js` file when we need to do this:

```js
import { Pool } from 'pg'

const pool = new Pool()

export const query = async (text, params) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('executed query', { text, duration, rows: res.rowCount })
  return res
}

export const getClient = () => {
  return pool.connect()
}
```

Okay. Great - the simplest thing that could possibly work. It seems like one of our routes that checks out a client to run a transaction is forgetting to call `release` in some situation! Oh no! We are leaking a client & have hundreds of these routes to go audit. Good thing we have all our client access going through this single file. Lets add some deeper diagnostic information here to help us track down where the client leak is happening.

```js
export const query = async (text, params) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('executed query', { text, duration, rows: res.rowCount })
  return res
}

export const getClient = async () => {
  const client = await pool.connect()
  const query = client.query
  const release = client.release
  // set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!')
    console.error(`The last executed query on this client was: ${client.lastQuery}`)
  }, 5000)
  // monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args
    return query.apply(client, args)
  }
  client.release = () => {
    // clear our timeout
    clearTimeout(timeout)
    // set the methods back to their old un-monkey-patched version
    client.query = query
    client.release = release
    return release.apply(client)
  }
  return client
}
```

That should hopefully give us enough diagnostic information to track down any leaks.

## Using async/await with Express

> **Source:** [Using async/await with Express](https://node-postgres.com/guides/async-express) · [node-postgres docs](https://github.com/brianc/node-postgres), MIT

My preferred way to use node-postgres (and all async code in node.js) is with `async/await`. I find it makes reasoning about control-flow easier and allows me to write more concise and maintainable code.

This is how I typically structure express web-applications with node-postgres to use `async/await`:

```
- app.js
- index.js
- routes/
  - index.js
  - photos.js
  - user.js
- db/
  - index.js <--- this is where I put data access code
```

That's the same structure I used in the [project structure](https://node-postgres.com/guides/project-structure) example.

My `db/index.js` file usually starts out like this:

```js
import { Pool } from 'pg'

const pool = new Pool()

export const query = (text, params) => pool.query(text, params)
```

Then I will install [express-promise-router](https://www.npmjs.com/package/express-promise-router) and use it to define my routes. Here is my `routes/user.js` file:

```js
import Router from 'express-promise-router'
import db from '../db.js'

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()

// export our router to be mounted by the parent application
export default router

router.get('/:id', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id])
  res.send(rows[0])
})
```

Then in my `routes/index.js` file I'll have something like this which mounts each individual router into the main application:

```js
// ./routes/index.js
import users from './user.js'
import photos from './photos.js'

const mountRoutes = (app) => {
  app.use('/users', users)
  app.use('/photos', photos)
  // etc..
}

export default mountRoutes
```

And finally in my `app.js` file where I bootstrap express I will have my `routes/index.js` file mount all my routes. The routes know they're using async functions but because of express-promise-router the main express app doesn't know and doesn't care!

```js
// ./app.js
import express from 'express'
import mountRoutes from './routes.js'

const app = express()
mountRoutes(app)

// ... more express setup stuff can follow
```

Now you've got `async/await`, node-postgres, and express all working together!
