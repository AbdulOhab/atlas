---
title: "Indexing and Performance"
order: 13
summary: "Making queries fast: indexes and EXPLAIN in PostgreSQL, spotting bottlenecks, and caching in front of the database."
category: "Databases"
level: Intermediate
---

# Indexing and Performance

A query that's fine on a thousand rows can take minutes on ten million. Indexes, query plans and caching are how you keep it fast.

**Course outline modules:** 20 (Database Indexing and Performance)

## Optimizing PostgreSQL queries

> **Source:** [Optimizing PostgreSQL queries](https://github.com/prisma/dataguide/blob/main/content/04-postgresql/13-reading-and-querying-data/04-optimizing-postgresql.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

The sample outputs below were captured on an older PostgreSQL release. On PostgreSQL 18, their descriptions, statistics, paths, timestamps and durations differ.

### Introduction

Managing performance is an ongoing task when working with database-backed applications. Slow running queries can cause timeouts, degrade the user experience, use more resources, and may even impact your budget depending on how you pay for your databases. These issues make it important to understand the performance characteristics of your database so that you can identify and fix problematic queries.

In this guide, we'll talk about different ways to identify poorly performing queries in PostgreSQL databases. Afterwards, we'll discuss different techniques you can use to fix slow queries to maintain your PostgreSQL performance.

The PostgreSQL connector in Prisma ORM lets you manage your PostgreSQL databases directly from JavaScript and TypeScript applications.

Learn how to add Prisma to an [existing project](https://www.prisma.io/docs/prisma-orm/add-to-existing-project/postgresql) or [start from scratch](https://www.prisma.io/docs/prisma-postgres/quickstart/prisma-orm).

You can also set up Prisma ORM with a [Prisma Postgres database](https://www.prisma.io/docs/postgres) without leaving the terminal: the [Prisma Postgres CLI guide](https://www.prisma.io/docs/prisma-postgres/from-the-cli) has the current commands for each package manager.

### Checking active queries and processes

The first place to check when trying to track down low performing queries is the list of currently active queries and processes. PostgreSQL makes this data available with the [`pg_stat_activity` view](https://www.postgresql.org/docs/current/monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW).

The `pg_stat_activity` view is one of the views available within PostgreSQL's cumulative statistics system. It contains one row per server process, which helps you review what each process is working on at the moment.

To display all of the information within the view, type:

```sql diagnostic
SELECT * FROM pg_stat_activity \gx
```

<details>
<summary>View `pg_stat_activity` output</summary>

```text
-[ RECORD 1 ]----+-------------------------------
datid            |
datname          |
pid              | 1963
leader_pid       |
usesysid         |
usename          |
application_name |
client_addr      |
client_hostname  |
client_port      |
backend_start    | 2022-11-01 11:03:44.083043+01
xact_start       |
query_start      |
state_change     |
wait_event_type  | Activity
wait_event       | AutoVacuumMain
state            |
backend_xid      |
backend_xmin     |
query_id         |
query            |
backend_type     | autovacuum launcher
-[ RECORD 2 ]----+-------------------------------
datid            |
datname          |
pid              | 1965
leader_pid       |
usesysid         | 10
usename          | postgres
application_name |
client_addr      |
client_hostname  |
client_port      |
backend_start    | 2022-11-01 11:03:44.083926+01
xact_start       |
query_start      |
state_change     |
wait_event_type  | Activity
wait_event       | LogicalLauncherMain
state            |
backend_xid      |
backend_xmin     |
query_id         |
query            |
backend_type     | logical replication launcher
-[ RECORD 3 ]----+-------------------------------
datid            | 13921
datname          | postgres
pid              | 836027
leader_pid       |
usesysid         | 10
usename          | postgres
application_name | psql
client_addr      |
client_hostname  |
client_port      | -1
backend_start    | 2022-11-06 20:20:18.273218+01
xact_start       | 2022-11-06 20:39:01.207078+01
query_start      | 2022-11-06 20:39:01.207078+01
state_change     | 2022-11-06 20:39:01.207088+01
wait_event_type  |
wait_event       |
state            | active
backend_xid      |
backend_xmin     | 762
query_id         |
query            | select * from pg_stat_activity
backend_type     | client backend
-[ RECORD 4 ]----+-------------------------------
datid            |
datname          |
pid              | 1961
leader_pid       |
usesysid         |
usename          |
application_name |
client_addr      |
client_hostname  |
client_port      |
backend_start    | 2022-11-01 11:03:44.082354+01
xact_start       |
query_start      |
state_change     |
wait_event_type  | Activity
wait_event       | BgWriterHibernate
state            |
backend_xid      |
backend_xmin     |
query_id         |
query            |
backend_type     | background writer
-[ RECORD 5 ]----+-------------------------------
datid            |
datname          |
pid              | 1960
leader_pid       |
usesysid         |
usename          |
application_name |
client_addr      |
client_hostname  |
client_port      |
backend_start    | 2022-11-01 11:03:44.082065+01
xact_start       |
query_start      |
state_change     |
wait_event_type  | Activity
wait_event       | CheckpointerMain
state            |
backend_xid      |
backend_xmin     |
query_id         |
query            |
backend_type     | checkpointer
-[ RECORD 6 ]----+-------------------------------
datid            |
datname          |
pid              | 1962
leader_pid       |
usesysid         |
usename          |
application_name |
client_addr      |
client_hostname  |
client_port      |
backend_start    | 2022-11-01 11:03:44.082653+01
xact_start       |
query_start      |
state_change     |
wait_event_type  | Activity
wait_event       | WalWriterMain
state            |
backend_xid      |
backend_xmin     |
query_id         |
query            |
backend_type     | walwriter
```

</details>

**Note:** Using the `\gx` line termination sequence instead of the traditional semicolon (`;`) tells PostgreSQL to use the expanded output mode for the current query. This displays the columns and associated values for each record vertically instead of horizontally, which can improve readability in some cases.

There are a number of fields in the output that can be helpful when looking for slower queries. Some of the most relevant ones include:

- `state`: The current state of the process. Rows listed as `active` are currently executing. Other states include `idle` for processes waiting for a new client command, `idle in transaction` for processes waiting commands within a transaction context, and `idle in transaction (aborted)` for transactions where a statement caused an error.
- `query`: The most recently executed query. For active processes, this will be the currently executing query.
- `usename`: The name of the user associated with the process.
- `application_name`: The name of the application connected to the process.
- `datname`: The name of the database the user is connected to.
- `wait_event`: The name of the event the process is waiting for, if any. If a process has an `active` state and a `wait_event` is present, it means that the query is blocked by some other part of the system currently.
- `wait_event_type`: The category of event the process is waiting for.
- `pid`: The process's process ID.
- `query_start`: For active queries, the timestamp of when the current query started.
- `xact_start`: The timestamp of when the current transaction began, if the process is executing a transaction.

We can filter the query by whatever columns are relevant for our current context. One helpful pattern is to use the `age()` function to calculate how long the query has been running. For example:

```sql diagnostic
SELECT
    age(clock_timestamp(), query_start),
    usename,
    datname,
    query
FROM pg_stat_activity
WHERE
    state != 'idle'
AND query NOT ILIKE '%pg_stat_activity%'
ORDER BY age desc;
```

This will display the execution time, username, database, and query text for queries that are not idle. We order the results from the longest to shortest running queries and exclude this specific query from the results.

Similarly, you can see all processes that are not idle but do have a wait event:

```sql diagnostic
SELECT
    usename,
    datname,
    query,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE
    state != 'idle'
AND wait_event IS NOT NULL;
```

This can help you see queries that are not currently progressing because of other parts of the system (for instance, lock contention).

### Check other system statistics

While the `pg_stat_activity` view will probably provide most of the information you need to identify slower queries, it can be useful to look at other system statistics as well to help identify additional targets for optimization.

#### Viewing database statistics

The `pg_stat_database` table contains statistics about each database:

```sql diagnostic
SELECT * FROM pg_stat_database \gx
```

```
. . .
-[ RECORD 2 ]------------+------------------------------
datid                    | 13921
datname                  | postgres
numbackends              | 1
xact_commit              | 266
xact_rollback            | 9
blks_read                | 229
blks_hit                 | 11263
tup_returned             | 118708
tup_fetched              | 3563
tup_inserted             | 0
tup_updated              | 0
tup_deleted              | 0
conflicts                | 0
temp_files               | 0
temp_bytes               | 0
deadlocks                | 0
checksum_failures        |
checksum_last_failure    |
blk_read_time            | 0
blk_write_time           | 0
session_time             | 5303626.534
active_time              | 200.906
idle_in_transaction_time | 0
sessions                 | 2
sessions_abandoned       | 0
sessions_fatal           | 0
sessions_killed          | 0
stats_reset              | 2022-11-06 20:20:18.279798+01
. . .
```

Some interesting columns for our purposes include:

- `blks_read`: Number of disk blocks read in the database.
- `blks_hit`: Number of times disk blocks were found in the buffer cache instead (avoiding a slow read from disk).
- `xact_commit`: Number of transactions committed.
- `xact_rollback`: Number of transactions rolled back.

As [the Data Egret team shows on their blog](https://dataegret.com/2017/03/deep-dive-into-postgres-stats-pg_stat_database/), you can use these raw values to calculate interesting statistics like your cache hit ratio:

```sql diagnostic
SELECT
    datname,
    100 * blks_hit / (blks_hit + blks_read) as cache_hit_ratio
FROM
    pg_stat_database
WHERE
    (blks_hit + blks_read) > 0;
```

```text
  datname  | cache_hit_ratio
-----------+-----------------
           |              99
 postgres  |              98
 template1 |              99
(3 rows)
```

This can be valuable information that can help you evaluate whether you would benefit from adding RAM to your database cluster so that your most common queries can be effectively cached.

#### Viewing table statistics

Another helpful family of views are `pg_stat_all_tables`, `pg_stat_user_tables`, and `pg_stat_sys_tables`. The `pg_stat_all_tables` view shows access statistics for all databases while the other two views filter the tables based on whether they are user tables or system tables.

```sql diagnostic
SELECT * FROM pg_stat_all_tables \gx
```

```
. . .
-[ RECORD 104 ]-----+------------------------
relid               | 1262
schemaname          | pg_catalog
relname             | pg_database
seq_scan            | 5168
seq_tup_read        | 20655
idx_scan            | 20539
idx_tup_fetch       | 20539
n_tup_ins           | 0
n_tup_upd           | 0
n_tup_del           | 0
n_tup_hot_upd       | 0
n_live_tup          | 0
n_dead_tup          | 0
n_mod_since_analyze | 0
n_ins_since_vacuum  | 0
last_vacuum         |
last_autovacuum     |
last_analyze        |
last_autoanalyze    |
vacuum_count        | 0
autovacuum_count    | 0
analyze_count       | 0
autoanalyze_count   | 0
```

Some interesting columns in these views include:

- `seq_scan`: The number of sequential scans that were run on the table.
- `seq_tup_read`: The number of rows returned from sequential scans.
- `idx_scan`: The number of index scans run against the table.
- `idx_tup_fetch`: The number of rows retrieved through indexes.

The numbers in these columns can help you evaluate how your indexes are performing and whether they're being effectively used by the queries you're running. If you find that your tables have many sequential scans, you would probably benefit from creating additional indexes that can be used by your most common queries.

#### Viewing index hits

If you need more information about indexes you currently have, you can look at the `pg_stat_all_indexes`, `pg_stat_user_indexes`, and `pg_stat_sys_indexes` views:

```sql diagnostic
SELECT * FROM pg_stat_all_indexes \gx
```

```text
. . .
-[ RECORD 6 ]-+----------------------------------------------
relid         | 1249
indexrelid    | 2659
schemaname    | pg_catalog
relname       | pg_attribute
indexrelname  | pg_attribute_relid_attnum_index
idx_scan      | 822
idx_tup_read  | 1670
idx_tup_fetch | 1670
. . .
```

These provide you with information about how often each of your indexes are used. The `idx_scan` column shows the number of times the index has been scanned. The `idx_tup_read` columns shows the number of entries returned by scans, while `idx_tup_fetch` shows total number of rows returned by index scans.

This information can be useful to help you understand when you have indexes that are not being used by your queries. Once you identify those indexes, you can either rewrite your queries to take advantage of the index or you can remove the unused index to improve write performance.

#### Viewing lock information

Some of the information you gathered about slow queries might have pointed to a locking issue. You can find out more information about all of the locks that are currently held by querying the `pg_locks` view:

```sql diagnostic
SELECT * FROM pg_locks \gx
```

```
-[ RECORD 1 ]------+----------------
locktype           | relation
database           | 13921
relation           | 12290
page               |
tuple              |
virtualxid         |
transactionid      |
classid            |
objid              |
objsubid           |
virtualtransaction | 3/3920
pid                | 967262
mode               | AccessShareLock
granted            | t
fastpath           | t
waitstart          |
-[ RECORD 2 ]------+----------------
locktype           | virtualxid
database           |
relation           |
page               |
tuple              |
virtualxid         | 3/3920
transactionid      |
classid            |
objid              |
objsubid           |
virtualtransaction | 3/3920
pid                | 967262
mode               | ExclusiveLock
granted            | t
fastpath           | t
waitstart          |
```

The output will provide information about all locks within PostgreSQL. This can help you diagnose contention issues that can occur when separate processes request control over the same objects.

Some columns that may help you investigate problematic locks include:

- `locktype`: The type of [lockable object](https://www.postgresql.org/docs/current/monitoring-stats.html#WAIT-EVENT-LOCK-TABLE)
- `database/relation/page/tuple`: The object ID of the locked item. For database and relations, these can be cross-referenced in the `pg_database` and `pg_class`.
- `mode`: The [lock mode](https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-TABLES) that is implemented or requested.
- `granted`: A boolean representing whether the lock was granted.

### Enable slow query logging

One way to find information about long running queries more easily is to enable slow query logging. Enabling slow query logging allows PostgreSQL to automatically note any queries that take longer to execute than a given amount of time. This allows you to gather information about slow queries that are not executing at the moment of your investigation.

#### Check if PostgreSQL is already logging slow queries

The first thing you should do is verify the current state of slow query logging. If slow query logging is already enabled, you don't have to do anything.

You can check if slow query logging is enabled by typing:

```sql diagnostic
SELECT * FROM pg_settings WHERE name = 'log_min_duration_statement'\gx
```

```
-[ RECORD 1 ]---+---------------------------------------------------------------------------
name            | log_min_duration_statement
setting         | -1
unit            | ms
category        | Reporting and Logging / When to Log
short_desc      | Sets the minimum execution time above which all statements will be logged.
extra_desc      | Zero prints all queries. -1 turns this feature off.
context         | superuser
vartype         | integer
source          | default
min_val         | -1
max_val         | 2147483647
enumvals        |
boot_val        | -1
reset_val       | -1
sourcefile      |
sourceline      |
pending_restart | f
```

If you check the values of the `short_desc` and `extra_desc` columns you will find the information that allows us to evaluate whether logging is currently enabled. We can see that slow query logging is currently _not_ enabled because the `setting` column is currently set to `-1`.

Now that you know the current state, you can change it as necessary.

#### Configure PostgreSQL to log slow queries

Before we move on, it is important to note that while slow query logging is incredibly useful, it can potentially have an additional performance impact. PostgreSQL must perform additional operations to time each query and to record the results to a log. This can impact performance and fill up hard drive space unexpectedly.

It may not be a good idea to log slow queries at all times. Instead, enable the functionality when you are actively investigating an issue and disable it when you are finished.

##### Logging slow queries globally

With that in mind, you can configure slow query logging globally by modifying the PostgreSQL server's configuration file. You can also modify these values interactively, but setting good defaults in the configuration will make it easier to tweak interactively later.

Open PostgreSQL's configuration file. You can find the location of the current configuration file by typing:

```sql diagnostic
SHOW config_file;
```

```text
               config_file
-----------------------------------------
 /etc/postgresql/14/main/postgresql.conf
(1 row)
```

Inside the file, search for the `log_min_duration_statement` setting. If our example output value above was read from the configuration file, it will be set to `-1` to indicate that the functionality is currently disabled. There are also a number of other related settings that you can tweak depending on your needs:

```
. . .
# Query logging configuration

#log_min_duration_statement = -1 # -1 is disabled, 0 logs all statements
                                 # and their durations, > 0 logs only
                                 # statements running at least this number
                                 # of milliseconds

#log_min_duration_sample = -1    # -1 is disabled, 0 logs a sample of statements
					             # and their durations, > 0 logs only a sample of
					             # statements running at least this number
					             # of milliseconds;
					             # sample fraction is determined by log_statement_sample_rate

#log_statement_sample_rate = 1.0 # fraction of logged statements exceeding
                                 # log_min_duration_sample to be logged;
                                 # 1.0 logs all such statements, 0.0 never logs

#log_transaction_sample_rate = 0.0 # fraction of transactions whose statements
                                   # are logged regardless of their duration; 1.0 logs all
                                   # statements from all transactions, 0.0 never logs
. . .
```

Currently, the `log_min_duration_statement` setting is commented out with its current value set to `-1` to represent the default value. The other settings are well-commented within the file and allow you to sample statements that are over the minimum instead of logging all of the statements. The last setting allows you to do sampling of statements that occur within transactions as well.

You can turn on long query logging by uncommenting the `log_min_duration_statement` and setting it to another value. For instance, we can set it to 5 seconds to log any statements that take longer than that to complete:

```conf logging
log_min_duration_statement = 5s
```

After saving the file, you can reload your PostgreSQL server from within PostgreSQL by typing:

```sql logging
SELECT pg_reload_conf();
```

You can verify that the server is using your new settings by checking the current value again:

```sql diagnostic
SELECT * FROM pg_settings WHERE name = 'log_min_duration_statement'\gx
```

```
-[ RECORD 1 ]---+---------------------------------------------------------------------------
name            | log_min_duration_statement
setting         | 5000
unit            | ms
category        | Reporting and Logging / When to Log
short_desc      | Sets the minimum execution time above which all statements will be logged.
extra_desc      | Zero prints all queries. -1 turns this feature off.
context         | superuser
vartype         | integer
source          | configuration file
min_val         | -1
max_val         | 2147483647
enumvals        |
boot_val        | -1
reset_val       | 5000
sourcefile      | /etc/postgresql/14/main/postgresql.conf
sourceline      | 506
pending_restart | f
```

Now, the `setting` field is set to 5000 and the `unit` field is set to `ms`, indicating that our setting of 5 seconds has been translated to 5000 milliseconds and applied. The `sourcefile` line also confirms that this value is being read from the configuration file we modified.

##### Logging slow queries per database

Another option when trying to detect slow queries is to limit slow query logging to a specific database. While `log_min_duration_statement` can be set globally, as we showed in the last section, it can also be configured at the database level.

To turn on slow query logging for a single database, use the `ALTER DATABASE` command as an administrator with permission to change this setting. This example assumes that the `helloprisma` database already exists:

```sql logging
ALTER DATABASE helloprisma SET log_min_duration_statement = 2000;
```

```
ALTER DATABASE
```

For [`log_min_duration_statement`](https://www.postgresql.org/docs/18/runtime-config-logging.html#GUC-LOG-MIN-DURATION-STATEMENT), a number without a unit means milliseconds. A quoted value with a unit is also valid, as shown below. [`ALTER DATABASE`](https://www.postgresql.org/docs/18/sql-alterdatabase.html) changes the default for new connections to that database; existing sessions retain their current setting.

We can verify that the setting has been applied by querying for the per-database role settings:

```sql logging
\drds
```

```
                  List of settings
 Role |  Database   |           Settings
------+-------------+-------------------------------
      | helloprisma | log_min_duration_statement=2000
(1 row)
```

The same two-second threshold can be expressed with an explicit unit:

```sql logging
ALTER DATABASE helloprisma SET log_min_duration_statement = '2s';
```

We can verify that this hasn't interfered with the global setting that we previously set to a 5 seconds threshold:

```sql diagnostic
SELECT * FROM pg_settings WHERE name = 'log_min_duration_statement'\gx
```

```
-[ RECORD 1 ]---+---------------------------------------------------------------------------
name            | log_min_duration_statement
setting         | 5000
unit            | ms
category        | Reporting and Logging / When to Log
short_desc      | Sets the minimum execution time above which all statements will be logged.
extra_desc      | Zero prints all queries. -1 turns this feature off.
context         | superuser
vartype         | integer
source          | configuration file
min_val         | -1
max_val         | 2147483647
enumvals        |
boot_val        | -1
reset_val       | 5000
sourcefile      | /etc/postgresql/14/main/postgresql.conf
sourceline      | 506
pending_restart | f
```

#### Testing slow query logging

Test the setting out by issuing a statement that exceeds the minimum logging duration:

```sql logging
SELECT pg_sleep(10);
```

```
 pg_sleep
----------

(1 row)
```

Check the logs and you should find statements indicating that a long running query occurred:

```
2022-11-11 17:58:04.719 CET [1121088] postgres@postgres STATEMENT:  select sleep(10);
2022-11-11 17:58:42.635 CET [1121088] postgres@postgres LOG:  duration: 10017.171 ms  statement: select pg_sleep(10);
```

Since we have different thresholds for the global limit and a specific database, we can test that each are being applied correctly by using a query time that should trigger one but not the other.

For example, we can connect to the database that has a lower threshold and sleep for 4 seconds, which should trigger a log line:

```sql logging
\c helloprisma
SELECT pg_sleep(4);
```

Our logs show:

```
2022-11-13 14:46:07.361 CET [1252789] postgres@helloprisma STATEMENT:  alter database helloprisma set log_min_duration_statement=2s;
2022-11-13 14:53:05.027 CET [1309069] postgres@helloprisma LOG:  duration: 4022.546 ms  statement: select pg_sleep(4);
```

Now, we can switch to a different database that should only be affected by the global setting. The same sleep statement should not trigger a log line:

```sql logging
\c postgres
SELECT pg_sleep(4);
```

No new log lines should be recorded.

### Conclusion

In this article we covered how to view and understand some of the performance information that PostgreSQL makes available. Viewing this information can give you insight into different bottlenecks in your system resources, query patterns, configuration settings. When you experience slow performance, you can check the information that PostgreSQL provides to begin investigating the problematic behavior.

We also discussed how to use slow query logging to pinpoint exactly which queries are tying up system resources and taking longer to execute than expected. Recording this data and evaluating the resulting logs can help you identify places where you might need additional indexes, a different query structure, or a more efficient query design. Knowing how to identify these expensive operations is the first step towards running more functional database-backed applications.

[Prisma ORM](https://www.prisma.io/docs/orm) can help you manage PostgreSQL databases from TypeScript applications. Learn how to add Prisma to an [existing project](https://www.prisma.io/docs/prisma-orm/add-to-existing-project/postgresql) or how to [start with Prisma from scratch](https://www.prisma.io/docs/prisma-orm/from-scratch).

## Spotting performance bottlenecks

> **Source:** [Spotting performance bottlenecks](https://github.com/prisma/dataguide/blob/main/content/10-managing-databases/02-how-to-spot-bottlenecks-in-performance.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

If your application has slowed down, there’s a very good chance the issue is related — at least in part — to your database.

Knowing that your application's performance problems might involve your database is a good first step to reducing lag. The tricky part is to find out _where_ and _why_ these [bottlenecks](https://www.prisma.io/dataguide/intro/database-glossary#bottleneck) might exist.

This article covers some of the most common issues that create performance bottlenecks in databases and some steps that can be taken to remediate them.

### Database logs and metrics

It's not possible to diagnose bottlenecks in your database without looking at the logs. Most cloud providers supply rich information for you to assess what's happening with your queries, but it can be difficult to know what that information is saying.

#### Explore the logs, metrics, and query statistics

Most cloud database providers, including DigitalOcean, AWS, Google Cloud Platform, MongoDB Atlas, and others, offer a spot to view logs. It's important to get familiar with the layout and structure of this logging information so that you can more easily find problems later.

DigitalOcean, for example, provides a tab called "Logs & Queries" accessible directly from the deployment management menu.

![DigitalOcean Logs & Queries Menu Item](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/database-troubleshooting/do-logs.png)

In this section, there's a subsection called "Recent Logs" which provides a realtime display of logging information.

![DigitalOcean Recent Logs section](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/database-troubleshooting/do-recent-logs.png)

The information contained in these logs may or may not be useful for the specific bottleneck issue you're trying to troubleshoot. However, some information, such as the session duration, might give an indication of sessions that are spending a long time connected to the database.

#### Explore the metrics dashboard

The metrics dashboard for your cloud database provider gives you the most insight into the bottlenecks you might be experiencing. Most cloud providers show performance-related information, such as:

- System and Process CPU usage
- Cache usage
- Memory
- Number of connections

Viewing the metrics for items such as system CPU usage might reveal problems related to resource constraints. You may see spikes in usage related to administrative tasks such as taking backups. Sustained high usage may indicate that your database server is underprovisioned.

#### Explore query statistics

The query statistics reports from your cloud database provider might be the best source of information for determining where slowdowns are coming from. In many cases, slowdowns can be traced to queries that take a long time to execute.

Query statistics are reported differently between providers, but in most cases, the provider has a way to surface queries that are considered slow. Most providers show the query statement, the number of times it has been called, and the timing for that particular query.

For example, DigitalOcean's query statistics surfaces this information in tabular format.

![DigitalOcean Query Statistics section](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/database-bottlenecks/do-query-statistics.png)

### Unindexed tables

[Indexes](https://www.prisma.io/dataguide/intro/database-glossary#index) for a database table are conceptually similar to indexes in a book. Without an index in a book, you're left to look through every page to find the topic you're interested in. If, instead, the book has an index, you can search for a particular topic in the index first and you will be pointed to the correct page or pages. This drastically decreases the time it takes to find the information you're looking for.

The same concept is applied to database indexes. Adding indexes to a database table allows for fast lookups.

If you start out with a small amount of data in a table, it's common to not notice problems related to indexing immediately. As the data grows, however, a lack of indexing can become more apparent.

#### Create indexes for your tables

Indexes for database tables need to be created based on common access patterns. When creating an index, you specify a column or field that the index should be built upon.

For example, if your table has an `email` field in a `users` table, you might have a query in your application that searches for users based on their email. Without an index in place, the query will search through the entire table to find the correct record. If, instead, you create an index on the `email` field, the query will first consult the index to look for the email value. Once found, it will be pointed to the specific database row for that user.

The best way to identify opportunities for adding indexes is to look for which queries are taking a long time to execute. This information can be found in the "Query Statistics" (or similar) section of your cloud provider's database dashboard.

All else being equal, it's best to first focus on the _slowest_ reported queries by adding indexes for the access pattern being used. You can then move down the list, adding indexes where required until the slow queries have been resolved.

Indexes can be created with raw [SQL](https://www.prisma.io/dataguide/intro/database-glossary#sql). While the specifics differ depending on the specific database being used, a SQL command to create an index might look like this:

```sql
CREATE INDEX email_index ON users (email);
```

With the index in place, inspect your query statistics over time to see if performance has improved.

#### Use `EXPLAIN` to inspect slow queries

In some scenarios, the query statistics dashboard for your cloud database provider might not give you sufficient information. It may show you which queries are slow but it might not be clear which indexes should be created or how your queries should otherwise be optimized.

For these cases, you might choose to inspect your queries using the `EXPLAIN` statement. This statement is used in conjunction with your regular queries and is useful for getting detailed information about the query execution plan.

The `EXPLAIN` statement used ahead of a regular query in [PostgreSQL](https://www.prisma.io/dataguide/intro/database-glossary#postgresql), for example, will produce information such as:

- The estimated start-up cost
- The estimated total cost
- The estimated number of rows output
- The average width (in bytes) of the rows

For example, the following usage of `EXPLAIN`:

```sql
EXPLAIN SELECT * FROM users;
```

Will produce this report:

```sql
                         QUERY PLAN
-------------------------------------------------------------
 Seq Scan on users  (cost=0.00..458.00 rows=10000 width=244)
```

The `EXPLAIN` statement is a valuable tool to dig into specific queries and analyze their cost. The information gleaned from using `EXPLAIN` goes beyond what is provided by cloud providers in the query statistics reports and can be used to optimize your queries.

### Large data volumes

Queries that aren't optimized or that are overly broad in their scope might return inordinately large amounts of data from the database. It's often difficult to detect this issue when starting with a new database that has minimal data, but as the database size grows, it's likely to cause problems.

When a large amount of data is returned from a query, it needs to be scanned into memory on the database server. This can lead to CPU spikes and the need for burst mode usage. This can lead to crashes at your database server. If the data is returned from the database server, it maybe also be too large for your app server to handle if your app server is underprovisioned.

Addressing data overfetching requires that queries be optimized to scope the selection to relevant records. The solution is often to reach for the `WHERE` clause but you first need to find queries that are causing problems.

Your cloud database provider logs and metrics can give some indication that large amounts of data are being returned from the database. You might see burst credit usage or CPU spikes. It can, however, be difficult to tell which queries are responsible just from these metrics.

#### Instrumentation in your app server

To get the full picture of which queries are responsible for returning large amounts of data, you can add instrumentation to your app server. Tools like New Relic, Datadog, and Dynatrace can monitor your app server and report on the size of data as it passes through. Looking for which endpoints or areas of your app server are processing large amounts of data can help you zero in on which database queries might be responsible.

### Query optimization

Query optimization is not a one-size-fits-all endeavor and is very much case-dependent. There are, however, some common types of optimizations that should be considered.

- **Scope queries to prevent overfetching** - Be sure to use the `WHERE` clause when applicable to reduce the total volume of data returned.
- **Select only the required fields** - In many cases, not all fields from your tables are required to furnish your application. Select only the specific fields your app requires to prevent overfetching.
- **Audit your schema** - Inspect your database [schema](https://www.prisma.io/dataguide/intro/database-glossary#schema) to look for opportunities to reduce complexity. Queries that rely on many joins often run slowly and can be improved by adjusting your schema to have fewer relationships.
- **Use database views** - Views are like tables but are produced ahead of time by running a query to pre-compute values that might otherwise be derived on the fly. Views have their own caveats and aren't right for all applications and use cases.

### Conclusion

Poor application performance can often be traced back to issues at the database. Very often, these issues are related to suboptimal queries.

There's no silver bullet for optimizing queries. However, diligent efforts to analyze and inspect where and why certain queries aren't performing well can be helpful to hone in on the the specific queries that should be adjusted. Once identified, adjustments to the queries such as adding indexes, scoping with a `WHERE` clause, and selecting on the required fields can yield much better performance.

If you are using Prisma with PostgreSQL, its built-in [budgets middleware](https://www.prisma.io/docs/orm/middleware/built-in-budgets) reports queries that took too long, and its [lints middleware](https://www.prisma.io/docs/orm/middleware/built-in-lints) blocks or warns about risky query shapes before they run.

## Database caching

> **Source:** [Database caching](https://github.com/prisma/dataguide/blob/main/content/10-managing-databases/07-introduction-database-caching.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

The database is a critical component to application performance. The difference between a well-performing and poor-performing database can be the most impactful factor on overall application performance. Database challenges like query processing speed, cost to scale, and ease of data access make finding an optimized balance difficult. It is difficult to accommodate for all three among many other considerations.

In this article, we discuss database caching, a technique implemented for databases to ease some of these aforementioned challenges. We introduce what database caching is, the benefits of database caching implementation on your data store, and different database caching strategies.

### What is database caching?

Database caching is a buffering technique that stores frequently-queried data in temporary memory. A [cache](https://www.prisma.io/dataguide/intro/database-glossary#cache) is a high-speed data storage layer which stores a subset of data that is often [read](https://www.prisma.io/dataguide/intro/database-glossary#read-operation) requested. This transient storage layer results in future requests for this data to be served up faster than is possible by accessing the primary database.

A database caching strategy assists your primary database by easing the burden it might carry. This is most commonly seen by the rerouting of queries for frequently read data to the cache itself, rather than the primary database. The cache itself, resides in either the database, application, or even as a standalone access layer.

For example, your application requests user information from the database for the first time, this request goes from application server to database server and returns back the requested information. With caching, this user profile is stored closer to the requester after initial read, and there is a significant reduction in query processing time and database workload for all subsequent read requests for that data.

### What are the benefits of database caching?

Data retrieval speed greatly affects the user experience of an application. Implementing a caching strategy on your database can result in improved database performance, availability, and scalability for minimal cost depending on the strategy, all factors contributing to an overall positive application experience.

#### Performance

As touched on briefly, database caching improves the performance of a database by making data more easily accessed. The cache acts as a sort of “keyboard short-cut” or “hot-key” for the application to reference data that it frequently is calling upon.

This speedier request can minimize the workload of the database, keeping it from spending inefficient amounts of time doing repetitive tasks. Instead making these tasks more efficient and simplifying data access.

#### Availability

While not a 100% failover strategy, caching also provides benefits to overall database [availability](https://www.prisma.io/dataguide/intro/database-glossary#availability). Depending on where the cache is stored, the cache can still provide a place for the application to call upon for data in the case of the primary database server becoming unavailable for any reason.

While database performance is generally the primary reason for adopting a caching strategy, you also have the added benefit of some additional resiliency in the case of any backend failures.

#### Scalability

Similarly to added high availability, database caching has a positive effect on [scalability](https://www.prisma.io/dataguide/intro/database-glossary#scaling). While it shouldn’t be your main consideration for a database scaling strategy, implementing caching to improve database performance reduces your database workload, therefore distributing backend queries across entities.

This distribution lightens the load on a primary database and can reduce costs and provide more flexibility in the processing of your data. This result alleviates the need to scale and does more with the resources you already have on hand, potentially pushing the need to scale into the future.

### What are the different database caching strategies?

Before adopting database caching into your data access flow, it is important to consider which caching strategy is best suited for the job. For any scenario, the relationship between the database and the cache can have a different impact on performance and system structure. Planning ahead and considering all options will lead to fewer headaches down the road.

The five most popular strategies to consider are cache-aside, read-through, write-through, write-back, and write-around. We’ll cover the data source to cache relationship and process of each strategy.

#### Cache-aside

In a [cache-aside](https://www.prisma.io/dataguide/intro/database-glossary#cache-aside) arrangement, the database cache sits next to the database. When the application requests data, it will check the cache first. If the cache has the data (a cache hit), then it will return it. If the cache does not have the data (a cache miss), then the application will query the database. The application then stores that data in the cache for any subsequent queries.

![Cache-Aside](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/database-caching/cache-aside.png)

A cache-aside design is a good general purpose caching strategy. This strategy is particularly useful for applications with read-heavy workloads. This keeps frequently read data close at hand for the many incoming read requests. Two additional benefits stem from the cache being separated from the database. In the instance of a cache failure, the system relying on cache data can still go directly to the database. This provides some resiliency. Secondly, with the cache being separated, it can employ a different data model than that of the database.

On the other hand, the main drawback of a cache-aside strategy is the window being open for inconsistency from the database. Generally, any data being written will go to the database directly. Therefore, the cache may have a period of inconsistency with the primary database. There are different cache strategies to combat this depending on your needs.

#### Read-through

In a [read through cache](https://www.prisma.io/dataguide/intro/database-glossary#read-through-caching) arrangement, the cache sits between the application and the database. It can be envisioned like a straight line from application to database with the cache in the middle. In this strategy, the application will always speak with the cache for a read, and when there is a cache hit, the data is immediately returned. In the case of a cache miss, the cache will populate the missing data from the database and then return it to the application. For any data [writes](https://www.prisma.io/dataguide/intro/database-glossary#write-operation), the application will still go directly to the database.

![Read-Through](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/database-caching/read-through.png)

Read-through caches are also good for read-heavy workloads. The main differences between read-through and cache-aside is that in a cache-aside strategy the application is responsible for fetching the data and populating the cache, while in a read-through setup, the logic is done by a library or some separate cache provider. A read-through setup is similar to a cache-aside in regards to potential data inconsistency between cache and database.

A read-through caching strategy also has the disadvantage of needing to go to the database to get the data anytime a new read request comes through. This data has never been cached before so therefore the data needs to be loaded. It is common for developers to mitigate this delay by ‘warming’ the cache by issuing likely to happen queries manually.

#### Write-through

A [write-through caching](https://www.prisma.io/dataguide/intro/database-glossary#write-through-caching) strategy differs from the previously two mentioned because instead of writing data to the database, it will write to the cache first and the cache immediately writes to the database. The arrangement can still be visualized like the read-through strategy, in a straight line with the application in the middle.

![Write-Through](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/database-caching/write-through.png)

The benefit to a write-through strategy is that the cache is ensured to have any written data and no new read will experience delay while the cache requests it from the main database. If solely making this arrangement, there is the big disadvantage of extra write latency because the action must go to the cache and then to the database. This should happen immediately, but there is still two writes occurring in succession.

The real benefit comes from pairing a write-through with a read-through cache. This strategy will adopt all the aforementioned benefits of the read-through caching strategy with the added benefit of removing the potential for data inconsistency.

#### Write-back

[Write-back](https://www.prisma.io/dataguide/intro/database-glossary#write-back-caching) works almost exactly the same as the write-through strategy except for one key detail. In a write-back strategy, the application again writes directly to the cache. However, the cache does not immediately write to the database, and it instead writes after a delay.

![Write-Back](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/database-caching/write-back.png)

By writing to the database with a delay instead of immediately, the strain on the cache is reduced in a write-heavy workload. This makes a write-back, read-through combination good for mixed workloads. This pairing ensures that the most recently written data and accessed data is always present and accessible via the cache.

The delay in cache to database writes can improve overall write performance and if batching is supported then also a reduction in overall writes. This opens up the potential for some cost savings and overall workload reduction. However, in the case of a cache failure, this delay opens the door for possible data loss if the batch or delayed write to the database has not yet occurred.

#### Write-around

A [write-around caching](https://www.prisma.io/dataguide/intro/database-glossary#write-around-caching) strategy will be combined with either a cache-aside or a read-through. In this arrangement, data is always written to the database and the data that is read goes to the cache. If there is a cache miss, then the application will read to the database and then update the cache for next time.

![Write-Around](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/database-caching/write-around.png)

This particular strategy is going to be most performant in instances where data is only written once and not updated. The data is read very infrequently or not at all.

### Conclusion

In this guide, we introduced the concept of database caching. We covered the main benefits that configuring a caching strategy can have on your database and application performance. We also discussed the basics of various caching strategies and how those arrangements can be visualized and optimised to work together.

Configuring a caching strategy that optimizes your cache and database workloads can have a major positive impact on the performance, availability, and scalability of your application. It is critical to know where to start and what options you have.
