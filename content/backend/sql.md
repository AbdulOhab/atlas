---
title: "SQL Queries"
order: 12
summary: "Writing SQL against PostgreSQL: creating tables, inserting, updating and deleting rows, SELECT with filtering, joins and transactions."
category: "Databases"
level: Beginner
---

# SQL Queries

SQL is how a backend talks to a relational database. These are the statements you write daily, shown on PostgreSQL.

**Course outline modules:** 17 (Database Read Query Fundamentals), 19 (Structured Query Language)

## Creating databases and tables

> **Source:** [Creating databases and tables](https://github.com/prisma/dataguide/blob/main/content/04-postgresql/08-create-and-delete-databases-and-tables.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

PostgreSQL and other relational database management systems use _databases_ and _tables_ to structure and organize their data. We can review the definition of those two terms quickly:

- **[databases](https://www.prisma.io/dataguide/intro/database-glossary#database):** separate different sets of structures and data from one another
- **[tables](https://www.prisma.io/dataguide/intro/database-glossary#table):** define the data structure and store the actual data values within databases

In PostgreSQL, there is also an intermediary object between databases and tables called _schema_:

- **[schema](https://www.postgresql.org/docs/current/ddl-schemas.html):** a namespace within a database that contains tables, [indexes](https://www.prisma.io/dataguide/intro/database-glossary#index), [views](https://www.prisma.io/dataguide/intro/database-glossary#view), and other items.

![Relationship between PostgreSQL databases, schemas, and tables](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/postgresql/creating-and-deleting-databases-and-tables/object-hierarchy.png)

[comment]: # ' ``` '
[comment]: # ' @startuml '
[comment]: # ' database "Database" { '
[comment]: # '   node "Schema" { '
[comment]: # ' 	node "Table" { '
[comment]: # '     } '
[comment]: # '   } '
[comment]: # ' } '
[comment]: # ' @enduml '
[comment]: # ' ``` '

This guide won't deal directly with PostgreSQL's concept of a schema, but it's good to know it's there.

Instead, we'll be focusing on how to create and destroy PostgreSQL databases and tables. The examples will primarily use SQL, but [towards the end](#using-administrative-command-line-tools-to-create-and-delete-databases), we'll show you how to do a few of these tasks using the [command line](https://www.prisma.io/dataguide/postgresql/connecting-to-postgresql-databases). These alternatives use tools included in the standard PostgreSQL installation that are available if you have administrative access to the PostgreSQL host.

Some of the statements covered in this guide, particularly the PostgreSQL `CREATE TABLE` statement, have many additional options that were outside of the scope of this article. If you'd like additional information, find out more by checking out the [official PostgreSQL documentation](https://www.postgresql.org/docs/current/sql-createtable.html).

### Prerequisites

To follow along with this guide, you will need to log in to a PostgreSQL instance with a user with administrative privileges using the [`psql` command line client](https://www.postgresql.org/docs/current/app-psql.html). Your PostgreSQL instance can be [installed locally, remotely, or provisioned by a provider](https://www.prisma.io/dataguide/postgresql/5-ways-to-host-postgresql).

Specifically, your PostgreSQL user will need the `CREATE DB` privilege or be a `Superuser`, which you can check with the `\du` meta-command in `psql`:

```
\du
```

```
                                   List of roles
 Role name |                         Attributes                         | Member of
-----------+------------------------------------------------------------+-----------
 postgres  | Superuser, Create role, Create DB, Replication, Bypass RLS | {}
```

The `postgres` superuser, which is created automatically upon installation, has the required privileges, but you can use any user with the `Create DB` privilege.

### Create a new database

Once you are connected to your PostgreSQL instance using `psql` or any other SQL client, you can create a database using SQL.

The basic syntax for creating a database is:

```sql
CREATE DATABASE db_name;
```

This will create a database called `db_name` on the current server with the current user set as the new database's owner using the [default database settings](https://www.postgresql.org/docs/current/manage-ag-templatedbs.html). You can view the properties of the default `template1` template using the following `psql` meta-command:

```sql
\l template1
```

```sql
                                  List of databases
   Name    |  Owner   | Encoding |   Collate   |    Ctype    |   Access privileges
-----------+----------+----------+-------------+-------------+-----------------------
 template1 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
(1 row)
```

You can add additional parameters to alter the way your database is created. These are some common options:

- **ENCODING:** sets the character encoding for the database.
- **LC_COLLATE:** sets the [_collation_](https://www.prisma.io/dataguide/intro/database-glossary#collation), or sort, order for the database. This is a localization option that determines how items are organized when they are ordered.
- **LC_CTYPE:** sets the character classification for the new database. This is a localization option that affects what characters are considered uppercase, lowercase, and digits.

These can help ensure that the database can store data in the formats you plan to support and with your project's localization preferences.

For example, to ensure that your database is created with Unicode support and to override the server's own locale to use American English localization (these all happen to match the values in the `template1` shown above, so no change will actually occur), you could type:

```sql
CREATE DATABASE db_name
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8';
```

To follow along with the examples in this guide, create a database called `school` using your instance's default locale settings and the UTF8 character encoding:

```sql
CREATE DATABASE school ENCODING 'UTF8';
```

This will create your new database using the specifications you provided.

### List existing databases

To determine what databases are currently available on your server or cluster, you can use the following SQL statement:

```sql
SELECT datname FROM pg_database;
```

This will list each of the databases currently defined within the environment:

```
  datname
-----------
 _dodb
 template1
 template0
 defaultdb
 school
(5 rows)
```

As mentioned before, if you are connected using the `psql` client, you can also get this information `\l` meta-command:

```sql
\l
```

This will show the available database names along with their owners, encoding, locale settings, and privileges:

```
                                  List of databases
   Name    |  Owner   | Encoding |   Collate   |    Ctype    |   Access privileges
-----------+----------+----------+-------------+-------------+-----------------------
 _dodb     | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
 defaultdb | doadmin  | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
 school    | doadmin  | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
 template0 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
 template1 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
(5 rows)
```

The `school` database that we created is displayed among the other databases on the system. This is a good way to get an overview of the databases within your server or cluster.

### Create tables within databases

After creating one or more databases, you can begin to define tables to store your data. Tables consist of a name and a defined schema which determines the fields and [data types](https://www.prisma.io/dataguide/postgresql/introduction-to-data-types) that each record must contain.

#### PostgreSQL `CREATE TABLE` syntax

You can create tables using the `CREATE TABLE` statement. A simplified basic syntax for the command looks like the following:

```sql
CREATE TABLE table_name (
    column_name TYPE [column_constraint],
    [table_constraint,]
);
```

The components of the above syntax include the following:

- **`CREATE TABLE table_name`**: The basic creation statement that signals that you wish to define a table. The `table_name` placeholder should be replaced with the name of the table you wish to use.
- **`column_name TYPE`**: Defines a basic column within the table. The `column_name` placeholder should be replaced with the name you wish to use for your column. The `TYPE` specifies the [PostgreSQL data type](https://www.prisma.io/dataguide/postgresql/introduction-to-data-types) for the column. Data stored within the table must conform to the column structure and column data types to be accepted.
- **`column_constraint`**: [Column constraints](https://www.prisma.io/dataguide/postgresql/column-and-table-constraints#column-constraints) are optional restraints to add further restrictions on the data that can be stored in the column. For example, you can require that entries be not null, unique, or positive integers.
- **`table_constraints`**: [Table constraints](https://www.prisma.io/dataguide/postgresql/column-and-table-constraints#table-constraints) are similar to column constraints but involve the interaction of multiple columns. For instance, you could have a table constraint that checks that a `DATE_OF_BIRTH` is before `DATE_OF_DEATH` in a table.

#### Create tables conditionally with the `IF NOT EXISTS` clause

By default, if you attempt to create a table in PostgreSQL that already exists within the database, an error will occur. To work around this problem in cases where you want to create a table if it isn't present, but just continue on if it already exists, you can use the `IF NOT EXISTS` clause. The `IF NOT EXISTS` optional qualifier that tells PostgreSQL to ignore the statement if the database already exists.

To use the `IF NOT EXISTS` clause, insert it into the command after the `CREATE TABLE` syntax and before the table name:

```sql
CREATE TABLE IF NOT EXISTS table_name (
    column_name TYPE [column_constraint],
    [table_constraint,]
);
```

This variant will attempt to create the table. If a table with that name already exists within the specified database, PostgreSQL will throw a warning indicating that the table name was already taken instead of failing with an error.

#### How to create tables in PostgreSQL

The above syntax is enough to create basic tables. As an example, we'll create two tables within our `school` database. One table will be called `supplies` and the other will be called `teachers`:

![Entity relationship diagrams for supplies and teachers tables](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/postgresql/creating-and-deleting-databases-and-tables/entity-relationship-diagram.png)

[comment]: # ' ``` '
[comment]: # ' @startuml '
[comment]: # ' entity "supplies" as sup { '
[comment]: # ' * id : int <<not null, unique>> '
[comment]: # ' -- '
[comment]: # ' * name : varchar '
[comment]: # ' * description : varchar '
[comment]: # ' * manufacturer : varchar '
[comment]: # ' * color : varchar '
[comment]: # ' * inventory : int <<greater than 0>> '
[comment]: # ' } '
[comment]: # ' entity "teachers" as teach { '
[comment]: # ' * id : int <<not null, unique>> '
[comment]: # ' -- '
[comment]: # ' * first_name : varchar '
[comment]: # ' * last_name : varchar '
[comment]: # ' * subject : varchar '
[comment]: # ' * grade_level : int '
[comment]: # ' } '
[comment]: # ' @enduml '
[comment]: # ' ``` '

In the `supplies` table, we want to have the following fields:

- **ID:** A unique ID for each type of school supply.
- **Name:** The name of a specific school item.
- **Description:** A short description of the item.
- **Manufacturer:** The name of the item manufacturer.
- **Color:** The color of the item.
- **Inventory:** The number of items we have for a certain type of school supply. This should never be less than 0.

We can create the `supplies` table with the above qualities using the following SQL.

First, change to the `school` database you created with `psql` by typing:

```sql
\c school
```

This will change the database that our future commands will target. Your prompt should change to reflect the database.

Next, create the `supplies` table with the following statement:

```sql
CREATE TABLE supplies (
  id INT PRIMARY KEY,
  name VARCHAR,
  description VARCHAR,
  manufacturer VARCHAR,
  color VARCHAR,
  inventory int CHECK (inventory > 0)
);
```

This will create the `supplies` table within the `school` database. The [`PRIMARY KEY`](https://www.prisma.io/dataguide/intro/database-glossary#primary-key) column constraint is a special constraint used to indicate columns that can uniquely identify records within the table. As such, the constraint specifies that the column cannot be null and must be unique. PostgreSQL creates [indexes](https://www.prisma.io/dataguide/intro/database-glossary#index) for primary key columns to increase querying speed.

Verify that the new table is present by typing:

```sql
\dt
```

```
          List of relations
 Schema |   Name   | Type  |  Owner
--------+----------+-------+---------
 public | supplies | table | doadmin
(1 row)
```

Verify that the schema reflects the intended design by typing:

```sql
\d supplies
```

```
                      Table "public.supplies"
    Column    |       Type        | Collation | Nullable | Default
--------------+-------------------+-----------+----------+---------
 id           | integer           |           | not null |
 name         | character varying |           |          |
 description  | character varying |           |          |
 manufacturer | character varying |           |          |
 color        | character varying |           |          |
 inventory    | integer           |           |          |
Indexes:
    "supplies_pkey" PRIMARY KEY, btree (id)
Check constraints:
    "supplies_inventory_check" CHECK (inventory > 0)
```

We can see each of the columns and data types that we specified. The column constraint that we defined for the `inventory` column is listed towards the end.

Next, we will create a `teachers` table. In this table, the following columns should be present:

- **Employee ID**: A unique employee identification number.
- **First name**: The teacher's first name.
- **Last name**: The teacher's last name.
- **Subject**: The subject that the teacher is hired to teach.
- **Grade level**: The grade level of students that the teach is hired to teach.

Create the `teachers` table with the above schema with the following SQL:

```sql
CREATE TABLE teachers (
  id INT PRIMARY KEY,
  first_name VARCHAR,
  last_name VARCHAR,
  subject VARCHAR,
  grade_level int
);
```

#### How to create tables with primary keys and foreign keys

You can find information about creating tables with primary and foreign keys in some of our other PostgreSQL guides. Primary keys and foreign keys are both types of [database constraint](https://www.prisma.io/dataguide/intro/database-glossary#constraint) within PostgreSQL.

A [primary key](https://www.prisma.io/dataguide/intro/database-glossary#primary-key) is a special column or column that is guaranteed to be unique across rows within the same table. All primary keys can be used to uniquely identify a specific row. Primary keys not only ensure that each row has a unique value for the primary key columns, they also ensure that no rows contain `NULL` values for that column. Often, the primary key in PostgreSQL uses the following format to specify an automatically assigned incrementing primary key: `id SERIAL PRIMARY KEY`.

[Foreign keys](https://www.prisma.io/dataguide/intro/database-glossary#foreign-key) are a way to ensure that a column or columns in one table match the values contained within another table. This helps ensure referential integrity between tables.

### How to view tables in PostgreSQL

In PostgreSQL you can list tables in a few different ways depending on what information you are looking for.

If you'd like to see what tables are available within your database, you can use the `\dt` meta-command included with the `psql` client to list all tables, as we demonstrated above:

```sql
\dt
```

```
          List of relations
 Schema |   Name   | Type  |  Owner
--------+----------+-------+---------
 public | supplies | table | doadmin
 public | teachers | table | doadmin
(2 rows)
```

You can also check that the schema for the table matches your specifications:

```sql
\d teachers
```

```
                     Table "public.teachers"
   Column    |       Type        | Collation | Nullable | Default
-------------+-------------------+-----------+----------+---------
 id          | integer           |           | not null |
 first_name  | character varying |           |          |
 last_name   | character varying |           |          |
 subject     | character varying |           |          |
 grade_level | integer           |           |          |
Indexes:
    "teachers_pkey" PRIMARY KEY, btree (id)
```

The `teachers` table seems to match our definition.

### Alter tables

If you need to change the schema of an existing table in PostgreSQL, you can use the `ALTER TABLE` command. The `ALTER TABLE` command is very similar to the `CREATE TABLE` command, but operates on an existing table.

#### Alter table syntax

The basic syntax for modifying tables in PostgreSQL looks like this:

```sql
ALTER TABLE <table_name> <change_command> <change_parameters>
```

The `<change_command>` indicates the exact type of change you would like to make, whether it involves setting different options on the table, adding or removing columns, or changing types or constraints. The `<change_parameters>` part of the command contains any additional information that PostgreSQL needs to complete the change.

#### Adding columns to tables

You can add a column to a PostgreSQL table with the `ADD COLUMN` change command. The change parameters will include the column name, type, and options, just as you would specify them in the `CREATE TABLE` command.

For example, to add a column called `missing_column` of the `text` type to a table called `some_table`, you would type:

```sql
ALTER TABLE some_table ADD COLUMN missing_column text;
```

#### Removing columns from tables

If, instead, you'd like to remove an existing column, you can use the `DROP COLUMN` command instead. You need to specify the name of the column you wish to drop as a change parameter:

```sql
ALTER TABLE some_table DROP COLUMN useless_column;
```

#### Changing the data type of a column

To change the [data type](https://www.prisma.io/dataguide/intro/database-glossary#data-type) that PostgreSQL uses for a specific column, you can use `ALTER COLUMN` change command with the `SET DATA TYPE` column command. The parameters include the column name, its new type, and an optional `USING` clause to specify how the old type should be converted to the new type.

For example, to set the value of a `id` column in the `resident` table to a `int` using an explicit cast, we can type the following:

```sql
ALTER TABLE resident ALTER COLUMN id SET DATA TYPE int USING id::int;
```

#### Other table changes

Many other types of changes can be achieved with the `ALTER TABLE` command. For more information about the options available, check out the official [PostgreSQL documentation for `ALTER TABLE`](https://www.postgresql.org/docs/current/sql-altertable.html).

### Drop tables

If you wish to delete a table, you can use the `DROP TABLE` SQL statement. This will delete the table as well as any data stored within it.

The basic syntax looks like this:

```sql
DROP TABLE table_name;
```

This will delete the table if it exists and throw an error if the table name does not exist.

If you wish to delete the table if it exists and do nothing if it does not exist, you can include the `IF EXISTS` qualifier within the statement:

```sql
DROP TABLE IF EXISTS table_name;
```

Tables that have dependencies on other tables or objects cannot be deleted by default while those dependencies exist. To avoid the error, you can optionally include the `CASCADE` parameter, which automatically drops any dependencies along with the table:

```sql
DROP TABLE table_name CASCADE;
```

If any tables have a _foreign key_ constraint, which references the table that you are deleting, that constraint will automatically be deleted.

Delete the `supplies` table we created earlier by typing:

```sql
DROP TABLE supplies;
```

We will keep the `teachers` database to demonstrate that the statement to delete databases also removes all child objects like tables.

### Drop databases

The `DROP DATABASE` statement tells PostgreSQL to delete the specified database. The basic syntax looks like this:

```sql
DROP DATABASE database_name;
```

Replace the `database_name` placeholder with the name of the database you wish to remove. This will delete the database if it is found. If the database cannot be found, an error will occur:

```sql
DROP DATABASE some_database;
```

```sql
ERROR:  database "some_database" does not exist
```

If you wish to delete the database if it exists and otherwise do nothing, include the optional `IF EXISTS` option:

```sql
DROP DATABASE IF EXISTS some_database;
```

```sql
NOTICE:  database "some_database" does not exist, skipping
DROP DATABASE
```

This will remove the database or do nothing if it cannot be found.

To remove the `school` database that we used in this guide, list the existing databases on your system:

```sql
\l
```

```
                                  List of databases
   Name    |  Owner   | Encoding |   Collate   |    Ctype    |   Access privileges
-----------+----------+----------+-------------+-------------+-----------------------
 _dodb     | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
 defaultdb | doadmin  | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
 school    | doadmin  | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
 template0 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
 template1 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
(5 rows)
```

Open a new connection to one of the databases you do not wish to delete:

```sql
\c defaultdb
```

Once the new connection is open, delete the `school` database with the following command:

```sql
DROP DATABASE school;
```

This will remove the `school` database along with the `teachers` table defined within.

> If you have been following along using SQL, you can end here or skip to [the conclusion](#conclusion). If you'd like to learn about how to create and delete databases from the command line, continue on to the next section.

### Using administrative command line tools to create and delete databases

If you have shell access to the server or cluster where PostgreSQL is installed, you may have access to some additional command line tools that can help create and delete databases. The [`createdb`](https://www.postgresql.org/docs/current/app-createdb.html) and [`dropdb`](https://www.postgresql.org/docs/current/app-dropdb.html) commands are bundled with PostgreSQL when it is installed.

#### Create a new database from the command line

The basic syntax for the `createdb` command (which should be run by a system user with admin access to PostgreSQL) is:

```bash
createdb db_name
```

This will create a database called `db_name` within PostgreSQL using the [default settings](https://www.postgresql.org/docs/current/manage-ag-templatedbs.html).

The command also accepts options to alter its behavior, much like the SQL variant you saw earlier. You can find out more about these options with `man createdb`. Some of the most important options are:

- **`--encoding=`** : sets the [character encoding](https://www.postgresql.org/docs/current/multibyte.html#MULTIBYTE-CHARSET-SUPPORTED) for the database.
- **`--locale=`** : sets the [locale](https://www.postgresql.org/docs/current/locale.html) for the database.

These can help ensure that the database can store data in the formats you plan to support and with your project's localization preferences.

For example, to ensure that your database is created with Unicode support and to override the server's own locale to use American English localization, you could type:

```bash
createdb --encoding=UTF8 --locale=en_US db_name
```

Assuming you have the correct permissions, the database will be created according to your specifications.

To follow along with the examples in this guide, you could create a database called `school` using the default locale and the UTF8 character encoding by typing:

```bash
createdb --encoding=UTF8 school
```

You could then connect to the database using `psql` to set up your tables as usual.

#### Drop databases from the command line

The `dropdb` command mirrors the `DROP DATABASE` SQL statement. It has the following basic syntax:

```bash
dropdb database_name
```

Change the `database_name` placeholder to reference the database you wish to delete.

By default, this command will result in an error if the database specified cannot be found. To avoid this, you can include the optional `--if-exists` flag:

```bash
dropdb --if-exists database_name
```

This will delete the specified database if it exists. Otherwise, it will do nothing.

To delete the `school` database we created earlier, type:

```bash
dropdb school
```

This will remove the database and any child elements, like tables, within.

### Conclusion

This article covered the basics of how to create and delete databases and tables within PostgreSQL. These are some of the most basic commands required to set up a database system and being defining the structure of your data.

As mentioned earlier, the SQL statements covered in this PostgreSQL tutorial, particularly the `CREATE TABLE` statement, have many additional parameters can be used to change PostgreSQL's behavior. You can find out more about these by checking out the [official PostgreSQL documentation](https://www.postgresql.org/docs/current/sql-createtable.html).

When using Prisma to develop with PostgreSQL, you will usually create tables with [Prisma ORM's migrations](https://www.prisma.io/docs/orm/migrations/how-migrations-work). You can learn how to use them in the guide on [generating a migration](https://www.prisma.io/docs/orm/migrations/generating-a-migration).

### FAQ

<details>
<summary>Does PostgreSQL support the `IF NOT EXISTS` clause when using the `CREATE DATABASE` command?</summary>

Yes, PostgreSQL supports the use of [`IF NOT EXISTS`](https://www.prisma.io/dataguide/postgresql/create-and-delete-databases-and-tables#create-tables-conditionally-with-the-if-not-exists-clause) when creating both databases and tables. The below demonstrates using the clause for table creation.

```sql
CREATE TABLE IF NOT EXISTS table_name (
    column_name TYPE [column_constraint],
    [table_constraint,]
);
```

</details>

<details>
<summary>How do you create a database from a dump in PostgreSQL?</summary>

To create a database from a dump ([pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)), PostgreSQL provides the [utility program `pg_restore`](https://www.postgresql.org/docs/current/app-pgrestore.html).

This program recreates the database in the same state as it was at the time of the dump. Example syntax would look like the following:

```sql
pg_restore [connection-option...][option...][filename]
```

</details>

<details>
<summary>Which command line creates a database in PostgreSQL?</summary>

To create a database in PostgreSQL, use the [`createdb` command](https://www.postgresql.org/docs/current/app-createdb.html). The syntax is as follows:

```
createdb db_name
```

</details>

<details>
<summary>How do you drop a database in PostgreSQL?</summary>

The [`DROP DATABASE`](https://www.prisma.io/dataguide/postgresql/create-and-delete-databases-and-tables#drop-databases) statement tells PostgreSQL to delete the specified database. The basic syntax looks like this:

```sql
DROP DATABASE database_name;
```

</details>

<details>
<summary>How do you change a column's data type in PostgreSQL?</summary>

To change the [data type](https://www.prisma.io/dataguide/intro/database-glossary#data-type) for a specific column, use the `ALTER COLUMN` change command with the `SET DATA TYPE` column command.

The basic syntax includes column name, the new type, and an optional `USING` clause to specify the old type's conversion.

```sql
ALTER TABLE resident ALTER COLUMN id SET DATA TYPE int USING id::int;
```

</details>

## Inserting and deleting data

> **Source:** [Inserting and deleting data](https://github.com/prisma/dataguide/blob/main/content/04-postgresql/12-inserting-and-modifying-data/01-inserting-and-deleting-data.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

Adding and removing records from tables are some of the most common operations that databases perform. Adding data involves specifying the [table](https://www.prisma.io/dataguide/intro/database-glossary#table) and [column](https://www.prisma.io/dataguide/intro/database-glossary#column) names you wish to add values to as well as the values you wish to enter into each fields. Deleting records involves identifying the correct row or rows and removing them from the table.

In this guide, we will cover how to use the SQL `INSERT` and `DELETE` commands with PostgreSQL. This includes the basic syntax, how to return data information about the data that was processed, and how to add or remove multiple rows in a single statement.

### Reviewing the table's structure

Before using the `INSERT` command, you must know the table's structure so that you can accommodate the requirements imposed by the table's columns, [data types](https://www.prisma.io/dataguide/intro/database-glossary#data-type), and [constraints](https://www.prisma.io/dataguide/intro/database-glossary#constraint). There are a few different ways of doing this depending on your database client.

If you are using the `psql` command line client, the most straightforward way to find this information is to use the `\d+` meta command built into the tool.

For instance, to find the structure of a table called `employee`, you would type this:

```sql no-lines
\d+ employee
```

```
                                                                Table "public.employee"
   Column    | Type                        | Collation | Nullable | Default                                       | Storage  | Stats target | Description
-------------+-----------------------------+-----------+----------+-----------------------------------------------+----------+--------------+-------------
 employee_id | integer                     |           | not null | nextval('employee_employee_id_seq'::regclass) | plain    |              |
 first_name  | character varying(45)       |           | not null |                                               | extended |              |
 last_name   | character varying(45)       |           | not null |                                               | extended |              |
 last_update | timestamp without time zone |           | not null | now()                                         | plain    |              |
Indexes:
    "employee_pkey" PRIMARY KEY, btree (employee_id)
    "idx_employee_last_name" btree (last_name)
Triggers:
    last_updated BEFORE UPDATE ON employee FOR EACH ROW EXECUTE FUNCTION last_updated()
Access method: heap
```

The output displays the table's column names, data types, and default values, among others.

The `\d+` meta command is only available with the `psql` client, so if you are using a different client, you might have to query the table information directly. You can get most of the relevant information with a query like this:

```sql
SELECT column_name, data_type, column_default, is_nullable, character_maximum_length
FROM information_schema.columns WHERE table_name ='employee';
```

```
 column_name | data_type                   | column_default                                | is_nullable | character_maximum_length
-------------+-----------------------------+-----------------------------------------------+-------------+--------------------------
 employee_id | integer                     | nextval('employee_employee_id_seq'::regclass) | NO          |
 first_name  | character varying           |                                               | NO          | 45
 last_name   | character varying           |                                               | NO          | 45
 last_update | timestamp without time zone | now()                                         | NO          |
(4 rows)
```

These should give you a good idea of the table's structure so that you can insert values correctly.

### Using `INSERT` to add new records to tables

The SQL `INSERT` command is used to add rows of data to an existing table. Once you know the table's structure, you can construct a command that matches the table's columns with the corresponding values you wish to insert for the new record.

The basic syntax of the command looks like this:

```sql
INSERT INTO my_table(column1, column2)
VALUES ('value1', 'value2');
```

The columns in the column list correspond directly to the values provided within the value list.

By default, the `INSERT` command returns the object ID (usually 0) and a count of rows that were successfully inserted:

```
INSERT 0 1
```

As an example, to insert a new employee into the `employee` table listed above, we could type:

```sql
INSERT INTO employee(first_name, last_name)
VALUES ('Bob', 'Smith');
```

```
INSERT 0 1
```

Here, we provide values for the `first_name` and `last_name` columns while leaving the other columns to be populated by their default values. If you query the table, you can see that the new record has been added:

```sql
SELECT * FROM employee;
```

```
 employee_id | first_name | last_name |        last_update
-------------+------------+-----------+----------------------------
           1 | Bob        | Smith     | 2020-08-19 21:07:00.952454
(1 row)
```

You can also use Prisma ORM to add data to your tables by issuing a [create query](https://www.prisma.io/docs/orm/fundamentals/writing-data?db=postgresql#create-one-record).

### Returning data from `INSERT` statements

If you want additional information about the data that was added to the table, you can include the `RETURNING` clause at the end of your statement. The `RETURNING` clause specifies the columns to display of the records that were just inserted.

For instance, to display all of the columns for the records that were just inserted, you could type something like this:

```sql
INSERT INTO my_table(column_name, column_name_2)
VALUES ('value', 'value2')
RETURNING *;
```

```
 column_name | column_name_2
-------------+---------------
 value       | value2
(1 row)

INSERT 0 1
```

Using the `employee` table, this would look something like this:

```sql
INSERT INTO employee(first_name, last_name)
VALUES ('Sue', 'Berns')
RETURNING *;
```

```
 employee_id | first_name | last_name |       last_update
-------------+------------+-----------+--------------------------
           2 | Sue        | Berns     | 2020-08-19 21:15:01.7622
(1 row)

INSERT 0 1
```

You can also choose to return only specific columns from insertions. For instance, here, we only are interested in the new employee's ID:

```sql
INSERT INTO employee(first_name, last_name)
VALUES ('Delores', 'Muniz')
RETURNING employee_id;
```

```
 employee_id
-------------
           3
(1 row)

INSERT 0 1
```

As usual, you can also use column aliases to change the column names in the output:

```sql
INSERT INTO employee(first_name, last_name)
VALUES ('Simone', 'Kohler')
RETURNING employee_id AS "Employee ID";
```

```
 Employee ID
-------------
           4
(1 row)

INSERT 0 1
```

### Using `INSERT` to add multiple rows at once

Inserting records one statement at a time is more time consuming and less efficient than inserting multiple rows at once. PostgreSQL allows you to specify multiple rows to add to the same table. Each new row is encapsulated in parentheses, with each set of parentheses separated by commas.

The basic syntax for multi-record insertion looks like this:

```sql
INSERT INTO my_table(column_name, column_name_2)
VALUES
    ('value', 'value2'),
    ('value3', 'value4'),
    ('value5', 'value6');
```

For the `employee` table we've been referencing, you could add four new employees in a single statement by typing:

```sql
INSERT INTO employee(first_name, last_name)
VALUES
    ('Abigail', 'Spencer'),
    ('Tamal', 'Wayne'),
    ('Katie', 'Singh'),
    ('Felipe', 'Espinosa');
```

```
INSERT 0 4
```

### Using `DELETE` to remove rows from tables

The SQL `DELETE` command is used to remove rows from tables, functioning as the complementary action to `INSERT`. In order to remove rows from a table, you must identify the rows you wish to target by providing match criteria within a `WHERE` clause.

The basic syntax looks like this:

```sql
DELETE FROM my_table
WHERE <condition>;
```

For instance, to every row in our `employee` table that has its `first_name` set to `Abigail`, we could type this:

```sql
DELETE FROM employee
WHERE first_name = 'Abigail';
```

```
DELETE 1
```

The return value here indicates that the `DELETE` command was processed with a single row being removed.

To remove data from your tables using Prisma ORM, use a [delete query](https://www.prisma.io/docs/orm/fundamentals/writing-data?db=postgresql#delete-one-record).

### Returning data from `DELETE` statements

As with the `INSERT` command, you can return the affected rows or specific columns from the deleted rows by adding a `RETURNING` clause:

```sql
DELETE FROM my_table
WHERE <condition>
RETURNING *;
```

For instance, we can verify that the correct record is removed by returning all of the columns from the deleted `employee` here:

```sql
DELETE FROM employee
WHERE last_name = 'Smith'
RETURNING *;
```

```
 employee_id | first_name | last_name |        last_update
-------------+------------+-----------+----------------------------
           1 | Bob        | Smith     | 2020-08-19 21:07:00.952454
(1 row)

DELETE 1
```

### Using `DELETE` to remove multiple rows at once

You can remove multiple items at once with `DELETE` by manipulating the selection criteria specified in the `WHERE` clause.

For instance, to remove multiple rows by ID, you could type something like this:

```sql
DELETE FROM employee
WHERE employee_id in (3,4)
RETURNING *;
```

```
 employee_id | first_name | last_name |        last_update
-------------+------------+-----------+----------------------------
           3 | Delores    | Muniz     | 2020-08-19 21:17:06.943608
           4 | Simone     | Kohler    | 2020-08-19 21:19:19.298833
(2 rows)

DELETE 2
```

You can even leave out the `WHERE` clause to remove all of the rows from a given table:

```sql
DELETE FROM employee
RETURNING *;
```

```
 employee_id | first_name | last_name |        last_update
-------------+------------+-----------+----------------------------
           2 | Sue        | Berns     | 2020-08-19 21:15:01.7622
           6 | Tamal      | Wayne     | 2020-08-19 22:11:53.408531
           7 | Katie      | Singh     | 2020-08-19 22:11:53.408531
           8 | Filipe     | Espinosa  | 2020-08-19 22:11:53.408531
(4 rows)

DELETE 4
```

Be aware, however, that using `DELETE` to empty a table of data is [not as efficient as the `TRUNCATE` command](https://www.postgresql.org/docs/current/sql-truncate.html), which can remove data without scanning the table.

Prisma ORM uses a separate method called [`deleteAll()`](https://www.prisma.io/docs/orm/fundamentals/writing-data?db=postgresql#write-many-records) to delete multiple rows of data at one time.

### Conclusion

In this article, we introduced some of the most important commands to control what data is in your PostgreSQL tables. The `INSERT` command can be used to add new data to tables, while the `DELETE` command specifies which rows should be removed. Both commands are able to return the rows they affect and can operate on multiple rows at once.

These two commands are the primary mechanisms used to manage increase or decrease the number of records your table contains. Getting a handle on their basic syntax as well as the ways that they can be combined with other clauses will allow you to populate and clean your tables as necessary.

### FAQ

<details>
<summary>How do you perform a batch insert in PostgreSQL?</summary>

The basic syntax for multi-record insertion looks like this:

```sql
INSERT INTO my_table(column_name, column_name_2)
VALUES
	('value', 'value2'),
	('value3', 'value4'),
	('value5', 'value6');

```

An example using employee data would look something like this:

```sql
INSERT INTO employee(first_name, last_name)
VALUES
    ('Abigail', 'Spencer'),
    ('Tamal', 'Wayne'),
    ('Katie', 'Singh'),
    ('Felipe', 'Espinosa');
```

</details>

<details>
<summary>How do you check if a record exists before inserting in PostgreSQL?</summary>

One way to check if a record exists in PostgreSQL before inserting is by using the [`EXISTS` subquery expression](https://www.postgresql.org/docs/8.1/functions-subquery.html).

The `EXISTS` condition is used in combination with a subquery for the data you are checking for. It is considered to be met if the subquery returns at least one row. If no row is returned, then the record does not yet exist.

The basic syntax looks as follows:

```sql
WHERE EXISTS ( subquery );
```

</details>

<details>
<summary>How do I delete duplicate rows in PostgreSQL?</summary>

There are [several methods for deleting duplicate rows](https://www.postgresqltutorial.com/postgresql-tutorial/how-to-delete-duplicate-rows-in-postgresql/) in PostgreSQL. You can use a `DELETE USING` statement to check if two different rows have the same value and then delete the duplicate.

In addition, you can use a subquery to delete duplicates or by using an immediate table with the listed steps:

1. Create a new table with the same structure as the one whose duplicate rows should be removed.
2. Insert distinct rows from the source table to the immediate table.
3. Drop the source table.
4. Rename the immediate table to the name of the source table.

</details>

<details>
<summary>How do I delete a record if it exists in PostgreSQL?</summary>

You can delete a record in PostgreSQL if it exists by using a `DELETE` statement with a `WHERE` clause including `EXISTS` . The `EXISTS` clause requires a subquery.

The basic syntax looks something like this:

```sql
DELETE FROM table_name
	WHERE EXISTS ( subquery );
```

</details>

<details>
<summary>How do I delete records with a limit in PostgreSQL?</summary>

PostgreSQL only allows for a `LIMIT` clause in its `SELECT` statements. Therefore, in order to use it in a `DELETE` statement you will have to include a `SELECT`.

The syntax could look something like this:

```sql
DELETE FROM table_name
WHERE field_name IN (
	SELECT field_name FROM table_name LIMIT 1);
```

</details>

## Updating data

> **Source:** [Updating data](https://github.com/prisma/dataguide/blob/main/content/04-postgresql/12-inserting-and-modifying-data/02-updating-existing-data.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

Records stored within databases are not often static. They must be updated to reflect changes in the systems they represent to remain relevant. PostgreSQL allows you to change the values in records using the `UPDATE` SQL command.

In many ways, `UPDATE` functions similar to `INSERT` (in that you specify columns and their desired values) and `DELETE` (in that you provide the criteria needed to target specific records). You can modify the data in any of the columns of a table either one at a time or in bulk. In this guide, we will explore how to use this command effectively to manage your data once it's already in tables.

### Using `UPDATE` to modify data

The basic syntax of the `UPDATE` command looks something like this:

```sql
UPDATE my_table
SET
    column1 = value1,
    column2 = value2
WHERE
    id = 1;
```

As shown above, the basic structure involves three separate clauses:

- specifying a [table](https://www.prisma.io/dataguide/intro/database-glossary#table) to act on,
- providing the [columns](https://www.prisma.io/dataguide/intro/database-glossary#column) you wish to update as well as their new values, and
- defining any criteria PostgreSQL needs to evaluate to determine which records to match

In the basic template above, we demonstrated a style assigning values to columns directly. You can also use the column list syntax too, as is often seen in `INSERT` commands.

For instance, the example above could also be specified like this:

```sql
UPDATE my_table
SET (column1, column2) =
    (value1, value2)
WHERE
    id = 1;
```

When successfully committed, PostgreSQL confirms the action by outputting the name of the operation and the number of rows impacted:

```
UPDATE <count>
```

To update data with Prisma ORM, issue an [update query](https://www.prisma.io/docs/orm/fundamentals/writing-data?db=postgresql#update-one-record).

### Returning records modified by the `UPDATE` command

Like many other commands, PostgreSQL allows you to append a `RETURNING` clause onto the `UPDATE` command. This causes the commands to return all or part of the records that were modified.

You can use the star `*` symbol to return all of the columns of the modified rows:

```sql
UPDATE my_table
SET
    column1 = value1,
    column2 = value2
WHERE
    id = 1
RETURNING *;
```

Alternatively, you can specify the exact columns you care about to display only specific attributes:

```sql
UPDATE my_table
SET
    column1 = value1,
    column2 = value2
WHERE
    id = 1
RETURNING column1 AS 'first column';
```

Here, we also used a column alias to set the label of the column header in the output.

### Updating records based on values in another table

Updates based on providing new external data are relatively straightforward. You just need to provide the table, the columns, the new values, and the targeting criteria.

However, you can also use `UPDATE` to conditionally update table values based on information stored in a joined table. The basic syntax looks like this:

```sql
UPDATE table1
SET table1.column1 = <some_value>
FROM table2
WHERE table1.column2 = table2.column2;
```

Here, we are updating the value of `column1` in the `table1` table to `<some_value>`, but only in rows where `column2` of `table1` match `column2` of `table2`. The `FROM` clause indicates a join between the two tables and `WHERE` construction specifies the join conditions.

As an example, suppose that we have two tables called `film` and `director`.

<details>
<summary>Expand to see the commands to create and populate these tables</summary>

```sql
CREATE TABLE director (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    latest_film TEXT
);

CREATE TABLE film (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    director_id INT REFERENCES director(id),
    release_date DATE NOT NULL
);

INSERT INTO director (name)
VALUES
    ('frank'),
    ('bob'),
    ('sue');

INSERT INTO film (title, director_id, release_date)
VALUES
    ('first movie', 1, '2010-08-24'),
    ('second movie', 1, '2010-12-15'),
    ('third movie', 2, '2011-01-01'),
    ('fourth movie', 2, '2012-08-02');
```

</details>

These two tables have a relation with `film.director_id` referencing `director.id`. Currently, the `latest_film` for the `director` table is `NULL`. However, we can populate it by with the director's latest film title using `FROM` and `WHERE` clauses to bring to bring the two tables together.

Here, we use a `WITH` clause to create a Common Table Expression (CTE) called `latest_films` that we can reference in our `UPDATE` statement:

```sql
WITH latest_films AS (
    SELECT DISTINCT ON (director_id)
        *
    FROM
        film
    ORDER BY
        director_id,
        release_date DESC)
UPDATE director set latest_film = title FROM latest_films
WHERE director.id = latest_films.director_id;
```

If you query the `director` table, it should show you each director's latest film now:

```sql
SELECT * FROM director;
```

```
 id | name  | latest_film
----+-------+--------------
  3 | sue   |
  1 | frank | second movie
  2 | bob   | fourth movie
(3 rows)
```

### Conclusion

In this guide, we've taken a look at the basic ways that you can modify existing data within a table using the `UPDATE` command. Using these basic concepts, you can specify the exact criteria necessary to identify the existing rows within a table, update column names with new values, and optionally return the rows that were impacted. The `UPDATE` command is essential for managing your data after its initial ingestion into your databases.

## SELECT basics

> **Source:** [SELECT basics](https://github.com/prisma/dataguide/blob/main/content/04-postgresql/13-reading-and-querying-data/01-basic-select.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

The `SELECT` command is the primary way to query and read information about records stored within database tables within PostgreSQL. Its usefulness, however, is not restricted to [read-only operations](https://www.prisma.io/dataguide/intro/database-glossary#read-operation). The `SELECT` syntax is combined with many other commands to target specific records or fields within databases for updates, deletions, and more complex operations.

In this guide, we'll show how the basic syntax of `SELECT` supports gathering data from tables. While we'll leave the vast number of optional clauses to the command for other articles, it will hopefully become evident how even the most basic components provide a strong foundation for querying data. These fundamentals only require you to learn a few clauses and constructions.

### The general syntax of the `SELECT` command

The basic format of a `SELECT` command looks something like this:

```sql
SELECT <column_names> FROM <table_name> <additional_conditions_and_formatting>;
```

This statement is composed of a few different pieces:

- `SELECT`: The `SELECT` command itself. This SQL statement indicates that we want to query tables or views for data they contains. The arguments and clauses surrounding it determine both the contents and the format of the output by defining criteria.
- `<column_names>`: The `SELECT` statement can return entire rows (indicated by the `*` wildcard character) or a subset of the available [columns](https://www.prisma.io/dataguide/intro/database-glossary#column). If you want to output only specific columns, provide the column names you'd like to display, separated by commas.
- `FROM <table_name>`: The `FROM` keyword is used to indicate the [table](https://www.prisma.io/dataguide/intro/database-glossary#table) or [view](https://www.prisma.io/dataguide/intro/database-glossary#view) that should be queried. In most simple queries, this consists of a single table that contains the data you're interested in.
- `<additional_conditions_and_formatting>`: A large number of filters, output modifiers, and conditions can be specified as additions to the `SELECT` command. You can use these to help pinpoint data with specific properties, modify the output formatting, or further process the results.

You can learn about how to query with Prisma ORM in the guides on [reading data](https://www.prisma.io/docs/orm/fundamentals/reading-data?db=postgresql) and [writing data](https://www.prisma.io/docs/orm/fundamentals/writing-data?db=postgresql).

### Specifying columns to display with `SELECT`

The column specification portion of the `SELECT` command requires you to name the columns you want to display for the data you are querying.

For ad hoc querying and during data exploration, one of the most helpful options is to use an asterisk to indicate that you want to display values from every column available:

```sql
SELECT * FROM my_table;
```

This will display all of the records from `my_table` since we do not provide any filtering to narrow the results. All of the columns for each record will be shown in the order that they are defined within the table.

You can also choose to view a subset of available column by specifying them by name. Column names are separated by commas and are displayed in the order in which they are given:

```sql
SELECT column2, column1 FROM my_table;
```

This will display all of the records from `my_table`, but only show the columns named `column2` and `column1`, in that order.

If using Prisma ORM, you can achieve the same results by [selecting fields](https://www.prisma.io/docs/orm/fundamentals/reading-data?db=postgresql#select-fields).

### Using column aliases with `AS` to modify the resulting table

You can optionally set _column aliases_ to modify the name used for columns in the output.

```sql
SELECT column1 AS "first column" FROM my_table;
```

This will show the each of the values for `column1` in `my_table`. However, the column in the output will be labeled as `first column` instead of `column1`.

This is especially useful if the output combines column names from multiple tables that might share names or if it includes computed columns that don't already have a name.

### Defining sort order with `ORDER BY`

The `ORDER BY` clause can be used to sort the resulting rows according to the criteria given. The general syntax looks like this:

```sql
SELECT * FROM my_table ORDER BY <sort_expression>;
```

This will display the values for all columns in all records within `my_table`. The results will be ordered according to the expression represented by the placeholder `<sort_expression>`.

For example, suppose we have a `customer` table that contains columns for `first_name`, `last_name`, `address`, and `phone_number`. If we want to display the results in alphabetical order by `last_name`, we could use the following command:

```sql
SELECT * FROM customer ORDER BY last_name;
```

```
first_name | last_name | address      | phone_number
-----------+-----------+--------------+-------------
sue        | abed      | 456 side st  | 5557654321
rachael    | coern     | 789 other st | 5559876543
thomas     | renault   | 777 first st | 5555647382
john       | smith     | 123 main st  | 5551234567
jane       | smith     | 123 main st  | 5551234567
```

The results are sorted in ascending alphabetical order by the `last_name` column.

To reverse the ordering, we can add the `DESC` modifier to the end of the `ORDER BY` clause:

```sql
SELECT * FROM customer ORDER BY last_name DESC;
```

```
first_name | last_name | address      | phone_number
-----------+-----------+--------------+-------------
john       | smith     | 123 main st  | 5551234567
jane       | smith     | 123 main st  | 5551234567
thomas     | renault   | 777 first st | 5555647382
rachael    | coern     | 789 other st | 5559876543
sue        | abed      | 456 side st  | 5557654321
```

You can also sort by multiple columns. Here, we sort first by `last_name`, and then by `first_name` for any columns with the same `last_name` value. Both sorts are in ascending order:

```sql
SELECT * FROM customer ORDER BY last_name, first_name;
```

```
first_name | last_name | address      | phone_number
-----------+-----------+--------------+-------------
sue        | abed      | 456 side st  | 5557654321
rachael    | coern     | 789 other st | 5559876543
thomas     | renault   | 777 first st | 5555647382
jane       | smith     | 123 main st  | 5551234567
john       | smith     | 123 main st  | 5551234567
```

One additional option that is often important is clarifying where `NULL` values should be presented in the sort order. You can do this by adding `NULLS FIRST` (the default) or `NULLS LAST` for any sort column:

```sql
SELECT * FROM customer ORDER BY last_name NULLS LAST;
```

You can [sort your results](https://www.prisma.io/docs/orm/fundamentals/reading-data?db=postgresql#sort-and-paginate) with Prisma ORM in much the same way as you would in an SQL query.

### Getting distinct results

If you want to find the range of values for a column in PostgreSQL, you can use the `SELECT DISTINCT` variant. This will display a single row for each distinct value of a column.

The basic syntax looks like this:

```sql
SELECT DISTINCT column1 FROM my_table;
```

This will show one row per unique value in `column1`.

For example, to display all of the different values for `color` that your `shirt` table contains, you can type:

```sql
SELECT DISTINCT color FROM shirt;
```

```
color
------
blue
green
orange
red
yellow
```

To show uniqueness across multiple columns, you can add additional columns separated by commas.

For instance, this will display all of the different combinations of `color` and `shirt_size` for the `shirt` table:

```sql
SELECT DISTINCT color,shirt_size FROM shirt;
```

```
color  | shirt_size
-------+-----------
blue   | M
blue   | S
green  | M
green  | L
green  | S
orange | L
orange | M
red    | M
yellow | S
```

This displays every unique combination of `color` and `shirt_size` within the table.

An often more flexible variant is PostgreSQL's `SELECT DISTINCT ON` command. This format allows you to specify a list of columns that should be unique in combination and separately list the columns you wish to display.

The general syntax looks like this, with the column or columns that should be unique listed in the parentheses after `SELECT DISTINCT ON`, followed by the columns you wish to display:

```sql
SELECT DISTINCT ON (column1) column1, column2 FROM my_table ORDER BY column1;
```

For example, if you want to display a single color for each shirt size, you could type:

```sql
SELECT DISTINCT ON (shirt_size) color,shirt_size FROM shirt;
```

```
color | shirt_size
------+-----------
red   | M
green | L
green | S
```

This will show a single row for each unique value in `shirt_size`. For each row, it will display the `color` column, followed by the `shirt_size` column.

If using an `ORDER BY` clause, the column selected for ordering must match the column selected within the `DISTINCT ON` parentheses for the output to have predictable results:

```sql
SELECT DISTINCT ON (shirt_size) color,shirt_size FROM shirt ORDER BY shirt_size DESC;
```

```
color | shirt_size
------+-----------
green | S
red   | M
green | L
```

You can filter duplicate rows from your query with Prisma ORM by using the [distinct](https://www.prisma.io/docs/orm/reference/orm-client?db=postgresql#distinct) functionality.

### Conclusion

In this guide, we covered some of the basic ways you can use the `SELECT` command to identify and display records from your tables and views. The `SELECT` command is one of the most flexible and powerful operations within SQL-oriented databases, with many different ways to add clauses, conditions, and filtering.

While we only covered basic usage in this guide, the general format you learned here will serve as the foundation for all other read and many write queries. Learning ways to filter and target the results more accurately extend the capabilities that we covered today.

You can learn more about sorting and filtering queries with Prisma ORM in the [reading data documentation](https://www.prisma.io/docs/orm/fundamentals/reading-data?db=postgresql#filter-records).

## Filtering data

> **Source:** [Filtering data](https://github.com/prisma/dataguide/blob/main/content/04-postgresql/13-reading-and-querying-data/02-filtering-data.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

To work with data in a database, you need to be able to retrieve and target specific [records](https://www.prisma.io/dataguide/intro/database-glossary#record) effectively. By using filtering clauses within your queries, you can add specific criteria in order to return only the most relevant records.

In this guide, we will take a look at some of the most common filtering operations available within PostgreSQL and demonstrate how to use them to narrow the focus of your statements. We will show how to test against characteristics within individual records with `WHERE` clauses, how to group records together to summarize information with `GROUP BY`, how to filter groups of records with the `HAVING` subclause, and how to set the maximum number of returned rows with the `LIMIT` clause.

### Using the `WHERE` clause to define match criteria

One of the most common and broadly useful ways to indicate your query requirements is the `WHERE` clause. The `WHERE` clause lets you define actual search criteria for query statements by specifying conditions that must be true for all matching records.

`WHERE` clauses work by defining boolean expressions that are checked against each candidate row of data. If the result of the expression is false, the row will be removed from the results and will not be returned or continue to the next stage of processing. If the result of the expression is true, it satisfies the criteria of the search and will continue on for any further processing as a candidate row.

The basic syntax of the `WHERE` clause looks like this:

```sql
SELECT * FROM my_table WHERE <condition>;
```

The `<condition>` can be anything that results in a boolean value. In PostgreSQL, a boolean value is any of `TRUE`, `FALSE`, or `NULL`.

Conditions are often formed using one or more of the following operators:

- `=`: equal to
- `>`: greater than
- `<`: less than
- `>=`: greater than or equal to
- `<=`: less than or equal to
- `<>` or `!=`: not equal
- `AND`: the logical "and" operator — joins two conditions and returns `TRUE` if both of the conditions are `TRUE`
- `OR`: logical "or" operator — joins two conditions and returns `TRUE` if at least one of the conditions are `TRUE`
- `IN`: value is contained in the list, series, or range that follows
- `BETWEEN`: value is contained within the range the minimum and maximum values that follow, inclusive
- `IS NULL`: matches if value is `NULL`
- `NOT`: negates the boolean value that follows
- `EXISTS`: the query that follows contains results
- `LIKE`: matches against a pattern (using the wildcards `%` to match 0 or more characters and `_` to match a single character)
- `ILIKE`: matches against a pattern (using the wildcards `%` to match 0 or more characters and `_` to match a single character), case insensitive
- `SIMILAR TO`: matches against a pattern using [SQL's regular expression dialect](https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-SIMILARTO-REGEXP)
- `~`: matches against a pattern using [POSIX regular expressions](https://en.wikipedia.org/wiki/Regular_expression#POSIX_basic_and_extended), case sensitive
- `~*`: matches against a pattern using [POSIX regular expressions](https://en.wikipedia.org/wiki/Regular_expression#POSIX_basic_and_extended), case insensitive
- `!~`: does not match against a pattern using [POSIX regular expressions](https://en.wikipedia.org/wiki/Regular_expression#POSIX_basic_and_extended), case sensitive
- `!~*`: does not match against a pattern using [POSIX regular expressions](https://en.wikipedia.org/wiki/Regular_expression#POSIX_basic_and_extended), case insensitive

While the above list represents some of the most common test constructs, there are many other [operators that yield boolean results](https://www.postgresql.org/docs/current/functions.html) that can be used in conjunction with a `WHERE` clause.

Prisma ORM supports filtering by multiple criteria. Check out our [documentation on filtering](https://www.prisma.io/docs/orm/fundamentals/reading-data?db=postgresql#filter-records) to learn more.

#### Examples using `WHERE`

One of the most common and straightforward checks is for equality, using the `=` operator. Here, we check whether each row in the `customer` table has a `last_name` value equal to `Smith`:

```sql
SELECT * FROM customer WHERE last_name = 'Smith';
```

We can add additional conditions to this to create compound expressions using logical operators. This example uses the `AND` clause to add an additional test against the `first_name` column. Valid rows must satisfy both of the given conditions:

```sql
SELECT * FROM customer WHERE first_name = 'John' AND last_name = 'Smith';
```

Similarly, we can check whether any of a series of conditions are met. Here, we check rows from the `address` table to see whether the `zip_code` value is equal to 60626 or the `neighborhood` column is equal to the string "Roger's Park". We use two single quotation marks to indicate that a literal single quote should be searched for:

```sql
SELECT * FROM address WHERE zip_code = '60626' OR neighborhood = 'Roger''s Park';
```

The `IN` operator can work like an comparison between a number of values, wrapped in parentheses. If there is a match with any of the given values, the expression is `TRUE`:

```sql
SELECT * FROM customer WHERE last_name IN ('Smith', 'Johnson', 'Fredrich');
```

Here, we check against a string pattern using `LIKE`. The `%` works as a wildcard matching zero or more characters, so "Pete", "Peter", and any other string that begins with "Pete" would match:

```sql
SELECT * FROM customer WHERE last_name LIKE 'Pete%';
```

We could do a similar search using the `~*` operator to check for matches using POSIX regular expressions without regard to case. In this case, we check whether the value of `last_name` begins with a "d" and contains the substring "on", which would match names like "Dickson", "Donald", and "Devon":

```sql
SELECT * FROM customer WHERE last_name ~* '^D.*on.*';
```

We can check whether a street number is within the 4000 block of addresses using the `BETWEEN` and `AND` operators to define an inclusive range:

```sql
SELECT * FROM address WHERE street_number BETWEEN 4000 AND 4999;
```

Here, we can display any `customer` entries that have social security numbers that are not 9 digits long. We use the `LENGTH()` operator to get the number of digits in the field and the `<>` to check for inequality:

```sql
SELECT * FROM customer WHERE LENGTH(SSN) <> 9;
```

### Using the `GROUP BY` clause to summarize multiple records

The `GROUP BY` clause is another very common way to filter results by representing multiple results with a single row. The basic syntax of the `GROUP BY` clause looks like this:

```sql
SELECT <columns> FROM some_table GROUP BY <columns_to_group>
```

When a `GROUP BY` clause is added to a statement, it tells PostgreSQL to display a single row for each unique value for the given column or columns. This has some important implications.

Since the `GROUP BY` clause is a way of representing multiple rows as a single row, PostgreSQL can only execute the query if it can calculate a value for each of the columns it is tasked with displaying. This means that each column identified by the `SELECT` portion of the statement has to either be:

- included in the `GROUP BY` clause to guarantee that each row has a unique value
- abstracted to summarize all of the rows within each group

Practically speaking, this means that any columns in the `SELECT` list not included in the `GROUP BY` clause must use an aggregate function to produce a single result for the column for each group.

If you are connecting to your database with [Prisma ORM](https://www.prisma.io/docs/orm), you can use [aggregations](https://www.prisma.io/docs/orm/reference/orm-client?db=postgresql#aggregate) to compute over and summarize values.

#### Examples using `GROUP BY`

For the examples in this section, suppose that we have a table called `pet` that we've defined and populated like so:

```sql
CREATE TABLE pet (
    id SERIAL PRIMARY KEY,
    type TEXT,
    name TEXT,
    color TEXT,
    age INT
);

INSERT INTO pet (type, name, color, age) VALUES
('dog', 'Spot', 'brown', 3),
('dog', 'Rover', 'black', 7),
('dog', 'Sally', 'brown', 1),
('cat', 'Sabrina', 'black', 8),
('cat', 'Felix', 'white', 4),
('cat', 'Simon', 'orange', 8),
('rabbit', 'Buttons', 'grey', 4),
('rabbit', 'Bunny', 'brown', 8),
('rabbit', 'Briony', 'brown', 6);
```

The simplest use of `GROUP BY` is to display the range of unique values for a single column. To do so, use the same column in `SELECT` and `GROUP BY`. Here, we see all of the colors used in the table:

```sql
SELECT color FROM pet GROUP BY color;
```

```
 color
--------
 black
 grey
 brown
 white
 orange
(5 rows)
```

As you move beyond a single column in the `SELECT` column list, you must either add the columns to the `GROUP BY` clause or use an aggregate function to produce a single value for the group of rows being represented.

Here, we add `type` to the `GROUP BY` clause, meaning that each row will represent a unique combination of `type` and `color` values. We also add the `age` column, summarized by the `avg()` function to find the average age of each of the groups:

```sql
SELECT type, color, avg(age) AS average_age FROM pet GROUP BY type, color;
```

```
  type  | color  |     average_age
--------+--------+--------------------
 rabbit | brown  | 7.0000000000000000
 cat    | black  | 8.0000000000000000
 rabbit | grey   | 4.0000000000000000
 dog    | black  | 7.0000000000000000
 dog    | brown  | 2.0000000000000000
 cat    | orange | 8.0000000000000000
 cat    | white  | 4.0000000000000000
(7 rows)
```

Aggregate functions work just as well with a single column in the `GROUP BY` clause. Here, we find the average age of each type of animal:

```sql
SELECT type, avg(age) AS average_age FROM PET GROUP BY type;
```

```
  type  |     average_age
--------+--------------------
 rabbit | 6.0000000000000000
 dog    | 3.6666666666666667
 cat    | 6.6666666666666667
(3 rows)
```

If we want to display the oldest of each type of animal, we could instead use the `max()` function on the `age` column. The `GROUP BY` clause collapses the results into the same rows as before, but the new function alters the result in the other column:

```sql
SELECT type, max(age) AS oldest FROM pet GROUP BY type;
```

```
  type  | oldest
--------+-------
 rabbit |     8
 dog    |     7
 cat    |     8
(3 rows)
```

### Using the `HAVING` clause to filter groups of records

The `GROUP BY` clause is a way to summarize data by collapsing multiple records into a single representative row. But what if you want to narrow these groups based on additional factors?

The `HAVING` clause is a modifier for the `GROUP BY` clause that lets you specify conditions that each group must satisfy to be included in the results.

The general syntax looks like this:

```sql
SELECT <columns> FROM some_table GROUP BY <columns_to_group> HAVING <condition>
```

The operation is very similar to the `WHERE` clause, with the difference being that `WHERE` filters single records and `HAVING` filters groups of records.

#### Examples using `HAVING`

Using the same table we introduced in the last section, we can demonstrate how the `HAVING` clause works.

Here, we group the rows of the `pet` table by unique values in the `type` column, finding the minimum value of `age` as well. The `HAVING` clause then filters the results to remove any groups where the age is not greater than 1:

```sql
SELECT type, min(age) AS youngest FROM pet GROUP BY type HAVING min(age) > 1;
```

```
  type  | youngest
--------+----------
 rabbit |        4
 cat    |        4
(2 rows)
```

In this example, we group the rows in `pet` by their color. We then filter the groups that only represent a single row. The result shows us every color that appears more than once:

```sql
SELECT color FROM pet GROUP BY color HAVING count(color) > 1;
```

```
 color
-------
 black
 brown
(2 rows)
```

We can perform a similar query to get the combinations of `type` and `color` that only a single animal has:

```sql
SELECT type, color FROM pet GROUP BY type, color HAVING count(color) = 1;
```

```
  type  | color
--------+--------
 cat    | black
 rabbit | grey
 dog    | black
 cat    | orange
 cat    | white
(5 rows)
```

### Using the `LIMIT` clause to set the maximum number of records

The `LIMIT` clause offers a different approach to paring down the records your query returns. Rather than eliminating rows of data based on criteria within the row itself, the `LIMIT` clause sets the maximum number of records returned by a query.

The basic syntax of `LIMIT` looks like this:

```sql
SELECT * FROM my_table LIMIT <num_rows> [OFFSET <num_rows_to_skip>];
```

Here, the `<num_rows>` indicates the maximum number of rows to display from the executed query. This is often used in conjunction with `ORDER BY` clauses to get the rows with the most extreme values in a certain column. For example, to get the five best scores on an exam, a user could `ORDER BY` a `score` column and then `LIMIT` the results to 5.

While `LIMIT` counts from the top of the results by default, the optional `OFFSET` keyword can be used to offset the starting position it uses. In effect, this allows you to paginate through results by displaying the number of results defined by `LIMIT` and then adding the `LIMIT` number to the `OFFSET` to retrieve the following page.

If you are connecting to your database with [Prisma ORM](https://www.prisma.io/docs/orm), you can use [pagination](https://www.prisma.io/docs/orm/fundamentals/reading-data?db=postgresql#sort-and-paginate) to iterate through results.

#### Examples using `LIMIT`

We will use the `pet` table from earlier for the examples in this section.

As mentioned above, `LIMIT` is often combined with an `ORDER BY` clause to explicitly define the ordering of the rows before slicing the appropriate number. Here, we sort the `pet` entries according to their `age`, from oldest to youngest. We then use `LIMIT` to display the top 5 oldest animals:

```sql
SELECT * FROM pet ORDER BY age DESC LIMIT 5;
```

```
  type  |  name   | color  | age | id
--------+---------+--------+-----+----
 cat    | Simon   | orange |   8 |  6
 cat    | Sabrina | black  |   8 |  4
 rabbit | Bunny   | brown  |   8 |  8
 dog    | Rover   | black  |   7 |  2
 rabbit | Briany  | brown  |   6 |  9
(5 rows)
```

Without an `ORDER BY` clause, `LIMIT` will make selections in an entirely predictable way. The results returned may be effected by the order of the entries within the table or by indexes. This is not always a bad thing.

If we need a record for any single `dog` within the table, we could construct a query like this. Keep in mind that while the result might be difficult to predict, this is not a random selection and should not be used as such:

```sql
SELECT * FROM pet WHERE type = 'dog' LIMIT 1;
```

```
 type | name | color | age | id
------+------+-------+-----+----
 dog  | Spot | brown |   3 |  1
(1 row)
```

We can use the `OFFSET` clause to paginate through results. We include an `ORDER BY` clause to define a specific order for the results.

For the first query, we limit the results without specifying an `OFFSET` to get the first 3 youngest entries:

```sql
SELECT * FROM pet ORDER BY age LIMIT 3;
```

```
 type | name  | color | age | id
------+-------+-------+-----+----
 dog  | Sally | brown |   1 |  3
 dog  | Spot  | brown |   3 |  1
 cat  | Felix | white |   4 |  5
(3 rows)
```

To get the next 3 youngest, we can add the number defined in `LIMIT` to the `OFFSET` to skip the results we've already retrieved:

```sql
SELECT * FROM pet ORDER BY age LIMIT 3 OFFSET 3;
```

```
  type  |  name   | color | age | id
--------+---------+-------+-----+----
 rabbit | Buttons | grey  |   4 |  7
 rabbit | Briany  | brown |   6 |  9
 dog    | Rover   | black |   7 |  2
(3 rows)
```

If we add the `LIMIT` to the `OFFSET` again, we'll get the next 3 results:

```sql
SELECT * FROM pet ORDER BY age LIMIT 3 OFFSET 6;
```

```
  type  |  name   | color  | age | id
--------+---------+--------+-----+----
 cat    | Simon   | orange |   8 |  6
 rabbit | Bunny   | brown  |   8 |  8
 cat    | Sabrina | black  |   8 |  4
(3 rows)
```

This lets us retrieve rows of data from a query in manageable chunks.

### Conclusion

There are many ways to filter and otherwise constrain the results you get from queries. Clauses like `WHERE` and `HAVING` evaluate potential rows or groups of rows to see if they satisfy certain criteria. The `GROUP BY` clause helps you summarize data by grouping together records that have one or more column values in common. The `LIMIT` clause offers users the ability to set a hard maximum on the number of records to retrieve.

Learning how these clauses can be applied, individually or in combination, will allow you to extract specific data from large datasets. Query modifiers and filters are essential for turning the data that lives within PostgreSQL into useful answers.

### FAQ

<details>
<summary>How do you filter multiple columns in PostgreSQL?</summary>

You can filter multiple columns in PostgreSQL by adding additional conditions to create compound expressions using [operators](https://www.postgresql.org/docs/current/functions.html).

An example of an additional condition is the logical operator `AND`. An example of the syntax would look like the following:

```sql
SELECT * FROM customer WHERE first_name = 'John' AND last_name = 'Smith';
```

</details>

<details>
<summary>How do I limit row results in PostgreSQL?</summary>

You can limit the number of records a query returns by using the `LIMIT` clause. Rather than eliminating rows of data based on criteria within the row itself, the `LIMIT` clause sets the maximum number of records returned.

The basic syntax looks like this:

```sql
SELECT * FROM my_table LIMIT <num_rows> [OFFSET <num_rows_to_skip>];
```

</details>

<details>
<summary>What is an aggregate function in PostgreSQL?</summary>

[Aggregate functions](https://www.postgresql.org/docs/current/functions-aggregate.html) in PostgreSQL are functions that compute a single result from a set of input values.

</details>

<details>
<summary>What is `array_agg()` in PostgreSQL?</summary>

PostgreSQL's `array_agg()` is a [user-defined aggregate function](https://www.postgresql.org/docs/current/xaggr.html) that accepts a set of values and returns an array where each value in the input set is assigned to an element of the array.

</details>

<details>
<summary>Can you `GROUP BY` timestamp values in PostgreSQL?</summary>

Yes, you can `GROUP BY` a timestamp value in PostgreSQL. However, this value includes a time element that would need timestamps to be identical to the millisecond to get grouped together.

Grouping timestamps together by day, month, or year is best accomplished by casting the timestamp value into [PostgreSQL's `DATE` data type](https://www.prisma.io/dataguide/postgresql/date-types#postgresql-date-data-type) which has no associated time value.

</details>

## Joining tables

> **Source:** [Joining tables](https://github.com/prisma/dataguide/blob/main/content/04-postgresql/13-reading-and-querying-data/03-joining-tables.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

Splitting related data into separate tables can be beneficial from the standpoint of consistency, flexibility, and certain types of performance. However, you still need a reasonable way of reintegrating records when the relevant information spans multiple tables.

In relational databases, [_joins_](https://www.prisma.io/dataguide/types/relational/what-are-joins-in-sql) offer a way to combine the records in two or more tables based on common field values. Different types of joins can achieve different results depending on how unmatched rows should be handled. In this guide, we'll discuss the various types of joins that PostgreSQL offers and how you can use them to combine table data from multiple sources.

### What are joins?

In short, [_joins_](https://www.prisma.io/dataguide/intro/database-glossary#join) are a way of displaying data from multiple tables. They do this by stitching together records from different sources based on matching values in certain columns. Each resulting row consists of a record from the first table combined with a row from the second table, based on one or more columns in each table having the same value.

The basic syntax of a join looks like this:

```sql
SELECT
    *
FROM
    <first_table>
<join_type> <second_table>
    <join_condition>;
```

In a join, each resulting row is constructed by including all of the columns of the first table followed by all of the columns from the second table. The `SELECT` portion of the query can be used to specify the exact columns you wish to display.

Multiple rows may be constructed from the original tables if the values in the columns used for comparison are not unique. For example, imagine you have a column being compared from the first table that has two records with a value of "red". Matched with this is a column from the second table that has three rows with that value. The join will produce six different rows for that value representing the various combinations that can be achieved.

The type of join and the join conditions determine how each row that is displayed is constructed. This impacts what happens to the rows from each table that do and do _not_ have a match on the join condition.

For the sake of convenience, many joins match the primary key on one table with an associated foreign key on the second table. Although primary and foreign keys are only used by the database system to maintain consistency guarantees, their relationship often makes them a good candidate for join conditions.

### Different types of joins

Various types of joins are available, each of which will potentially produce different results. Understanding how each type is constructed will help you determine which is appropriate for different scenarios.

#### Inner join

The default join is called an [_inner join_](https://www.prisma.io/dataguide/intro/database-glossary#inner-join). In PostgreSQL, this can be specified using either `INNER JOIN` or just simply `JOIN`.

Here is a typical example demonstrating the syntax of an inner join:

```sql
SELECT
    *
FROM
    table_1
[INNER] JOIN table_2
    ON table_1.id = table_2.table_1_id;
```

An inner join is the most restrictive type of join because it only displays rows created by combining rows from each table. Any rows in the constituent tables that did not have a matching counterpart in the other table are removed from the results. For example, if the first table has a value of "blue" in the comparison column, and the second table has no record with that value, that row will be suppressed from the output.

If you represent the results as a Venn diagram of the component tables, an inner join allows you to represent the overlapping area of the two circles. None of values that only existed in one of the tables are displayed.

#### Left join

A [left join](https://www.prisma.io/dataguide/intro/database-glossary#left-join) is a join that shows all of the records found in an inner join, plus all of the _unmatched_ rows from the first table. In PostgreSQL, this can be specified as a `LEFT OUTER JOIN` or as just a `LEFT JOIN`.

The basic syntax of a left join follows this pattern:

```sql
SELECT
    *
FROM
    table_1
LEFT JOIN table_2
    ON table_1.id = table_2.table_1_id;
```

A left join is constructed by first performing an inner join to construct rows from all of the matching records in both tables. Afterwards, the unmatched records from the first table are also included. Since each row in a join includes the columns of both tables, the unmatched columns use `NULL` as the value for all of the columns in the second table.

If you represent the results as a Venn diagram of the component tables, a left join allows you to represent the entire left circle. The parts of the left circle represented by the intersection between the two circles will have additional data supplemented by the right table.

#### Right join

A [right join](https://www.prisma.io/dataguide/intro/database-glossary#right-join) is a join that shows all of the records found in an inner join, plus all of the _unmatched_ rows from the second table. In PostgreSQL, this can be specified as a `RIGHT OUTER JOIN` or as just a `RIGHT JOIN`.

The basic syntax of a right join follows this pattern:

```sql
SELECT
    *
FROM
    table_1
RIGHT JOIN table_2
    ON table_1.id = table_2.table_1_id;
```

A right join is constructed by first performing an inner join to construct rows from all of the matching records in both tables. Afterwards, the unmatched records from the second table are also included. Since each row in a join includes the columns of both tables, the unmatched columns use `NULL` as the value for all of the columns in the first table.

If you represent the results as a Venn diagram of the component tables, a right join allows you to represent the entire right circle. The parts of the right circle represented by the intersection between the two circles will have additional data supplemented by the left table.

#### Full join

A [full join](https://www.prisma.io/dataguide/intro/database-glossary#outer-join) is a join that shows all of the records found in an inner join, plus all of the _unmatched_ rows from both component tables. In PostgreSQL, this can be specified as a `FULL OUTER JOIN` or as just a `FULL JOIN`.

The basic syntax of a full join follows this pattern:

```sql
SELECT
    *
FROM
    table_1
FULL JOIN table_2
    ON table_1.id = table_2.table_1_id;
```

A full join is constructed by first performing an inner join to construct rows from all of the matching records in both tables. Afterwards, the unmatched records from both tables are also included. Since each row in a join includes the columns of both tables, the unmatched columns use `NULL` as the value for all of the columns in the unmatched other table.

If you represent the results as a Venn diagram of the component tables, a full join allows you to represent both of the component circles entirely. The intersection of the two circles will have values supplied by each of the component tables. The parts of the circles outside of the overlapping area will have the values from the table they belong to, using `NULL` to fill in the columns found in the other table.

#### Cross join

A special join called a `CROSS JOIN` is also available. A cross join does not use any comparisons to determine whether the rows in each table match one another. Instead, results are constructed by simply adding each of the rows from the first table to each of the rows of the second table.

This produces a Cartesian product of the rows in two or more tables. In effect, this style of join combines rows from each table unconditionally. So, if each table has three rows, the resulting table would have nine rows containing all of the columns from both tables.

For example, if you have a table called `t1` combined with a table called `t2`, each with rows `r1`, `r2`, and `r3`, the result would be nine rows combined like so:

```
t1.r1 + t2.r1
t1.r1 + t2.r2
t1.r1 + t2.r3
t1.r2 + t2.r1
t1.r2 + t2.r2
t1.r2 + t2.r3
t1.r3 + t2.r1
t1.r3 + t2.r2
t1.r3 + t2.r3
```

#### Self join

A self join is any join that combines the rows of a table with itself. It may not be immediately apparent how this could be useful, but it actually has many common applications.

Often, tables describe entities that can fulfill multiple roles in relationship to one another. For instance, if you have a table of `people`, each row could potentially contain a `mother` column that reference other `people` in the table. A self join would allow you to stitch these different rows together by joining a second instance of the table to the first where these values match.

Since self joins reference the same table twice, table aliases are required to disambiguate the references. In the example above, for instance, you could join the two instances of the `people` table using the aliases `people AS children` and `people AS mothers`. That way, you can specify which instance of the table you are referring to when defining join conditions.

Here is another example, this time representing relationships between employees and managers:

```sql
SELECT
    *
FROM
    people AS employee
JOIN people AS manager
    ON employee.manager_id = manager.id;
```

### Join conditions

When combining tables, the join condition determines how rows will be matched together to form the composite results. The basic premise is to define the columns in each table that must match for the join to occur on that row.

#### The `ON` clause

The most standard way of defining the conditions for table joins is with the `ON` clause. The `ON` clause uses an equals sign to specify the exact columns from each table that will be compared to determine when a join may occur. PostgreSQL uses the provided columns to stitch together the rows from each table.

The `ON` clause is the most verbose, but also the most flexible of the available join conditions. It allows for specificity regardless of how standardized the column names are of each table being combined.

The basic syntax of the `ON` clause looks like this:

```sql
SELECT
    *
FROM
    table1
JOIN
    table2
ON
    table1.id = table2.ident;
```

Here, the rows from `table1` and `table2` will be joined whenever the `id` column from `table1` matches the `ident` column from `table2`. Because an inner join is used, the results will only show the rows that were joined. Since the query uses the wildcard `*` character, all of the columns from both tables will be displayed.

This means that both the `id` column from `table1` and the `ident` column from `table2` will be displayed, even though they have the same exact value by virtue of satisfying the join condition. You can avoid this duplication by calling out the exact columns you wish to display in the `SELECT` column list.

#### The `USING` clause

The `USING` clause is a shorthand for specifying the conditions of an `ON` clause that can be used when the columns being compared have the same name in both tables. The `USING` clause takes a list, enclosed in parentheses, of the shared column names that should be compared.

The general syntax of the `USING` clause uses this format:

```sql
SELECT
    *
FROM
    table1
JOIN
    table2
USING
    (id, state);
```

This join combines `table1` with `table2` when two columns that both tables share (`id` and `state`) each have matching values.

This same join could be expressed more verbosely using `ON` like this:

```sql
SELECT
    *
FROM
    table1
JOIN
    table2
ON
    table1.id = table2.id AND table1.state = table2.state;
```

While both of the above joins would result in the same rows being constructed with the same data present, they would be displayed slightly different. While the `ON` clause includes all of the columns from both tables, the `USING` clause suppresses the duplicate columns. So instead of there being two separate `id` columns and two separate `state` columns (one for each table), the results would just have one of each of the shared columns, followed by all of the other columns provided by `table1` and `table2`.

#### The `NATURAL` clause

The `NATURAL` clause is yet another shorthand that can further reduce the verbosity of the `USING` clause. A `NATURAL` join does not specify _any_ columns to be matched. Instead, PostgreSQL will automatically join the tables based on all columns that have matching columns in each database.

The general syntax of the `NATURAL` join clause looks like this:

```sql
SELECT
    *
FROM
    table1
NATURAL JOIN
    table2;
```

Assuming that `table1` and `table2` both have columns named `id`, `state`, and `company`, the above query would be equivalent to this query using the `ON` clause:

```sql
SELECT
    *
FROM
    table1
JOIN
    table2
ON
    table1.id = table2.id AND table1.state = table2.state AND table1.company = table2.company;
```

And this query using the `USING` clause:

```sql
SELECT
    *
FROM
    table1
JOIN
    table2
USING
    (id, state, company);
```

Like the `USING` clause, the `NATURAL` clause suppresses duplicate columns, so there would be only a single instance of each of the joined columns in the results.

While the `NATURAL` clause can reduce the verbosity of your queries, care must be exercised when using it. Because the columns used for joining the tables are automatically calculated, if the columns in the component tables change, the results can be vastly different due to new join conditions.

### Join conditions and the `WHERE` clause

Join conditions share many characteristics with the comparisons used to filter rows of data using `WHERE` clauses. Both constructs define expressions that must evaluate to true for the row to be considered. Because of this, it's not always intuitive what the difference is between including additional comparisons in a `WHERE` construct versus defining them within the join clause itself.

In order to understand the differences that will result, we have to take a look at the order in which PostgreSQL processes different portions of a query. In this case, the predicates in the join condition are processed first to construct the virtual joined table in memory. After this stage, the expressions within the `WHERE` clause are evaluated to filter the resulting rows.

As an example, suppose that we have two tables called `customer` and `order` that we need to join together. We want to join the two tables by matching the `customer.id` column with the `order.customer_id` column. Additionally, we're interested in the rows in the `order` table that have a `product_id` of 12345.

Given the above requirements, we have two conditions that we care about. The way we express these conditions, however, will determine the results we receive.

First, let's use both as the join conditions for a `LEFT JOIN`:

```sql
SELECT
    customer.id AS customer_id,
    customer.name,
    order.id AS order_id,
    order.product_id
FROM
    customer
LEFT JOIN
    order
ON
    customer.id = order.customer_id AND order.product_id = 12345;
```

The results could potentially look something like this:

```
 customer_id |   name   | order_id | product_id
 ------------+----------+----------+------------
        4380 | Acme Co  |      480 |      12345
        4380 | Acme Co  |      182 |      12345
         320 | Other Co |      680 |      12345
        4380 | Acme Co  |          |
         320 | Other Co |          |
          20 | Early Co |          |
        8033 | Big Co   |          |
(7 rows)
```

PostgreSQL arrived at this result by performing the following operations:

1. Combine any rows in the `customer` table with the `order` table where:
   - `customer.id` matches `order.customer_id`.
   - `order.product_id` matches 12345
2. Because we are using a left join, include any _unmatched_ rows from the left table (`customer`), padding out the columns from the right table (`order`) with `NULL` values.
3. Display only the columns listed in the `SELECT` column specification.

The outcome is that all of our joined rows match both of the conditions that we are looking for. However, the left join causes PostgreSQL to also include any rows from the first table that did not satisfy the join condition. This results in "left over" rows that don't seem to follow the apparent intent of the query.

If we move the second query (`order.product_id` = 12345) to a `WHERE` clause, instead of including it as a join condition, we get different results:

```sql
SELECT
    customer.id AS customer_id,
    customer.name,
    order.id AS order_id,
    order.product_id
FROM
    customer
LEFT JOIN
    order
ON
    customer.id = order.customer_id
WHERE
    order.product_id = 12345;
```

This time, only three rows are displayed:

```
 customer_id |   name   | order_id | product_id
 ------------+----------+----------+------------
        4380 | Acme Co  |      480 |      12345
        4380 | Acme Co  |      182 |      12345
         320 | Other Co |      680 |      12345
(3 rows)
```

The order in which the comparisons are executed is the reason for these differences. This time, PostgreSQL processes the query like this:

1. Combine any rows in the `customer` table with the `order` table where `customer.id` matches `order.customer_id`.
2. Because we are using a left join, include any _unmatched_ rows from the left table (`customer`), padding out the columns from the right table (`order`) with `NULL` values.
3. Evaluate the `WHERE` clause to remove any rows that do not have 12345 as the value for the `order.product_id` column.
4. Display only the columns listed in the `SELECT` column specification.

This time, even though we are using a left join, the `WHERE` clause truncates the results by filtering out all of the rows without the correct `product_id`. Because any unmatched rows would have `product_id` set to `NULL`, this removes all of the unmatched rows that were populated by the left join. It also removes any of the rows that were matched by the join condition that did not pass this second round of checks.

Understanding the basic process that PostgreSQL uses to execute your queries can help you avoid some easy-to-make but difficult-to-debug mistakes as you work with your data.

### Conclusion

In this guide, we covered how joins enable relational databases to combine data from different tables to provide more valuable answers. We talked about the various joins that PostgreSQL supports, the way each type assembles its results, and what to expect when using specific kinds of joins. Afterwards, we went over different ways to define join conditions and looked at how the interplay between joins and the `WHERE` clause can lead to surprises.

Joins are an essential part of what makes relational databases powerful and flexible enough to handle so many different types of queries. Organizing data using logical boundaries while still being able to recombine the data in novel ways on a case-by-case basis gives relational databases like PostgreSQL incredible versatility. Learning how to perform this stitching between tables will allow you to create more complex queries and rely on the database to create complete pictures of your data.

Prisma allows you to [define relations](https://www.prisma.io/docs/orm/data-modeling/relational-databases) between models in the Prisma contract. You can then use [relation queries](https://www.prisma.io/docs/orm/fundamentals/relations-and-joins?db=postgresql) to work with data that spans multiple models.

### FAQ

<details>
<summary>Does PostgreSQL support outer joins?</summary>

Yes, PostgreSQL supports outer joins. For example, you can use `LEFT OUTER JOIN` or just `LEFT JOIN` like in the following:

```sql
SELECT
    *
FROM
    table_1
LEFT JOIN table_2
    ON table_1.id = table_2.table_1_id;
```

</details>

<details>
<summary>What is a lateral join in PostgreSQL?</summary>

The `LATERAL` key word in [PostgreSQL](https://www.postgresql.org/docs/current/app-createdb.html#SQL-FROM) can precede a sub-SELECT FROM item and allows the sub-SELECT to refer to columns of FROM items that appear before it in the FROM list. (Without LATERAL, each sub-SELECT is evaluated independently and so cannot cross-reference any other FROM item.)

</details>

<details>
<summary>Does PostgreSQL support cross joins?</summary>

Yes, a `CROSS JOIN` can be done in PostgreSQL. The syntax will look something like:

```sql
SELECT select_list
FROM t1
CROSS JOIN t2;
```

The above example would display something like this [example output](https://www.prisma.io/dataguide/postgresql/reading-and-querying-data/joining-tables#cross-join)

</details>

<details>
<summary>Does PostgreSQL support full joins?</summary>

Yes, PostgreSQL support [full joins](https://www.prisma.io/dataguide/postgresql/reading-and-querying-data/joining-tables#full-join). They can be specified as `FULL OUTER JOIN` or as `FULL JOIN`.

The syntax would look like:

```sql
SELECT
    *
FROM
    table_1
FULL JOIN table_2
    ON table_1.id = table_2.table_1_id;
```

</details>

<details>
<summary>How do you specify an inner join in PostgreSQL?</summary>

The default join in PostgreSQL is an [**inner join**](https://www.prisma.io/dataguide/postgresql/reading-and-querying-data/joining-tables#inner-join), and it can be specified by using `INNER JOIN` or just `JOIN`.

The syntax is:

```sql
SELECT
    *
FROM
    table_1
[INNER] JOIN table_2
    ON table_1.id = table_2.table_1_id;
```

</details>

## Transactions

> **Source:** [Transactions](https://github.com/prisma/dataguide/blob/main/content/04-postgresql/12-inserting-and-modifying-data/05-using-transactions.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

Transactions are a mechanism that encapsulates multiple statements into a single operation for the database to process. Instead of feeding in individual statements, the database is able to interpret and act on the group of commands as a cohesive unit. This helps ensure the consistency of the dataset over the course of many closely related statements.

In this guide, we'll start by discussing what transactions are and why they are beneficial. Afterwards, we'll take a look at how PostgreSQL implements transactions and the various options you have when using them.

### What are transactions?

[Transactions](https://www.prisma.io/dataguide/intro/database-glossary#transaction) are a way to group together and isolate multiple statements for processing as a single operation. Each statement in a transaction still runs as soon as it is sent to the server, but its changes stay inside the transaction: they only become permanent, and visible to other sessions, when the whole transaction is committed.

Isolation is an important part of transactions. Within a transaction, the executed statements can only affect the environment within the transaction itself. From inside the transaction, statements can modify data and the results are immediately visible. From the outside, no changes are made until the transaction is committed, at which time all of the actions within the transaction become visible at once.

These features help databases achieve [ACID compliance](https://www.prisma.io/dataguide/intro/database-glossary#acid) by providing [atomicity](https://www.prisma.io/dataguide/intro/database-glossary#atomicity) (actions in a transaction are either all committed or all rolled back) and [isolation](https://www.prisma.io/dataguide/intro/database-glossary#isolation) (outside of the transaction, nothing changes until the commit while inside, the statements have consequences). These together help the database maintain [consistency](https://www.prisma.io/dataguide/intro/database-glossary#consistency) (by guaranteeing that partial data transformations cannot occur). Furthermore, changes in transactions are not returned as successful until they are committed to non-volatile storage, which provides [durability](https://www.prisma.io/dataguide/intro/database-glossary#durability).

To achieve these goals, transactions employ a number of different strategies and different database systems use different methods. PostgreSQL uses a system called [Multiversion Concurrency Control (MVCC)](https://www.prisma.io/dataguide/intro/database-glossary#multiversion-concurrency-control), which allows the database to perform these actions without unnecessary locking using data snapshots. All together, these systems comprise one of the fundamental building blocks of modern relational databases, allowing them to safely process complex data in a crash-resistant manner.

### Types of consistency failures

One reason people use transactions is to gain certain guarantees about the consistency of their data and the environment in which it is processed. Consistency can be broken in many different ways, which affects how databases attempt to prevent them.

There are four primary ways that inconsistency can arise depending on the transaction implementation. Your tolerance for scenarios where these scenarios may arise will affect how you use transactions in your applications.

#### Dirty reads

[Dirty reads](https://www.prisma.io/dataguide/intro/database-glossary#dirty-read) occur when the statements within a transaction are able to read data written by other in-progress transactions. This means that even though the statements of a transaction have _not_ been committed yet, they can be read and thus influence other transactions.

This is often considered a severe breach of consistency, as transactions are not properly isolated form one another. Statements that may never be committed to the database can affect the execution of other transactions, modifying their behavior.

Transactions that allow dirty reads cannot make any reasonable claims about the consistency of the resulting data.

#### Non-repeatable reads

[Nonrepeatable reads](https://www.prisma.io/dataguide/intro/database-glossary#nonrepeatable-read) occur when a commit outside of the transaction alters the data seen within the transaction. You can recognize this type of problem if, within a transaction, the same data is read twice but different values are retrieved in each instance.

As with dirty reads, transactions that allow non-repeatable reads don't offer full isolation between transactions. The difference is that with non-repeatable reads, the statements affecting the transaction have actually been committed outside of the transaction.

#### Phantom read

A [phantom read](https://www.prisma.io/dataguide/intro/database-glossary#phantom-read) is a specific type of non-repeatable read that occurs when the rows returned by a query are different the second time it is executed within a transaction.

For instance, if a query within the transaction returns four rows the first time it is executed, but five rows the second time, this is a phantom read. Phantom reads are caused by commits outside of the transaction altering the number of rows that satisfy the query.

#### Serialization anomalies

[Serialization anomalies](https://www.prisma.io/dataguide/intro/database-glossary#serialization-anomaly) occur when the results of multiple transactions committed concurrently will result in different outcomes than if they were committed one after another. This can occur any time that a transaction allows two commits to occur that each modify the same table or data without resolving conflicts.

Serialization anomalies are a special type of problem that early types of transactions had no understanding of. This is because early transactions were implemented with locking, where one could not continue if another transaction was reading from or altering the same piece of data.

### Transaction isolation levels

Transactions are not a "one size fits all" solution. Different scenarios require different trade-offs between performance and protection. Fortunately, PostgreSQL allows you to specify the type of transaction isolation you need.

The isolation levels offered by most database systems include the following:

#### Read uncommitted

[**Read uncommitted**](https://www.prisma.io/dataguide/intro/database-glossary#read-uncommitted-isolation-level) is the isolation level that offers the fewest guarantees about maintaining data consistency and isolation. While transactions using `read uncommitted` have certain features frequently associated with transactions, like the ability to commit multiple statements at once or to roll back statements if a mistake occurs, they _do_ allow numerous situations where consistency can be broken.

Transactions configured with the `read uncommitted` isolation level allow:

- dirty reads
- non-repeatable reads
- phantom reads
- serialization anomalies

This level of isolation is actually not implemented in PostgreSQL. Although PostgreSQL recognizes the isolation level name, internally, it is not actually supported and "read committed" (described below) will be used instead.

#### Read committed

[**Read committed**](https://www.prisma.io/dataguide/intro/database-glossary#read-committed-isolation-level) is an isolation level that specifically protects against dirty reads. When transactions use the `read committed` level of consistency, uncommitted data can never affect the internal context of a transaction. This provides a basic level of consistency by ensuring that uncommitted data never influences a transaction.

Although `read committed` offers greater protection than `read uncommitted`, it does not protect against all types of inconsistency. These problems can still arise:

- non-repeatable reads
- phantom reads
- serialization anomalies

PostgreSQL will use the `read committed` level by default if no other isolation level is specified.

#### Repeatable read

The [**repeatable read**](https://www.prisma.io/dataguide/intro/database-glossary#repeatable-read-isolation-level) isolation level builds off of the guarantee provided by `read committed`. It avoids dirty reads as before, but prevents non-repeatable reads as well.

This means that no changes committed outside of the transaction will ever impact the data read within the transaction. A query executed at the start of a transaction will never have a different result at the end of the transaction unless directly caused by statements within the transaction.

While the standard definition of the `repeatable read` isolation level requires only that dirty and non-repeatable reads are prevented, PostgreSQL also prevents phantom reads at this level. This means that commits outside of the transaction cannot alter the number of rows that satisfy a query.

Since the state of the data seen within the transaction can deviate from the up-to-date data in the database, a transaction fails with a serialization error if it tries to modify or lock a row that another transaction changed and committed after it started (`ERROR: could not serialize access due to concurrent update`). Because of this, one drawback of this isolation level is that you may have to retry transactions that fail this way.

PostgreSQL's `repeatable read` isolation level blocks most types of consistency issues but serialization anomalies can still occur.

#### Serializable

The [**serializable**](https://www.prisma.io/dataguide/intro/database-glossary#serializable-isolation-level) isolation level offers the highest level of isolation and consistency. It prevents all of the scenarios that the `repeatable read` level does while also removing the possibility of serialization anomalies.

Serializable isolation guarantees that concurrent transactions are committed as if they were executed one after another. If a scenario occurs where a serialization anomaly could be introduced, one of the transactions will have a serialization failure instead of introducing inconsistency to the data set.

### Defining a transaction

Now that we've covered the different isolation levels that PostgreSQL can use in transactions, let's demonstrate how to define transactions.

In PostgreSQL, every statement _outside_ of an explicitly marked transaction is actually executed in its own, single-statement transaction. To explicitly start a transaction block, you can use either the `BEGIN` or `START TRANSACTION` commands (they are synonymous). To commit a transaction, issue the `COMMIT` command.

The basic syntax of a transaction therefore looks like this:

```sql
BEGIN;

statements

COMMIT;
```

As a more concrete example, imagine that we are attempting to transfer $1000 from one account to another. We want to ensure that the money will always be in one of the two accounts but never in both of them.

The examples in this guide use a simple `accounts` table. If you want to follow along, you can create it like this (the `CHECK` constraint prevents balances from going below zero):

```sql
CREATE TABLE accounts (
    id integer PRIMARY KEY,
    balance numeric(12, 2) NOT NULL CHECK (balance >= 0)
);

INSERT INTO accounts (id, balance) VALUES (1, 5000), (2, 5000), (3, 5000), (4, 5000);
```

We can wrap the two statements that together encapsulate this transfer in a transaction that looks like this:

```sql
 BEGIN;

UPDATE accounts
   SET balance = balance - 1000
 WHERE id = 1;

UPDATE accounts
   SET balance = balance + 1000
 WHERE id = 2;

COMMIT;
```

Here, the $1000 will not be taken out of the account with `id = 1` without also putting $1000 into the account with `id = 2`.

This is what atomicity means: the two changes succeed or fail as a unit. It doesn't mean that the statements run at the same time. Each `UPDATE` runs as soon as you send it, and the session running the transaction sees its own changes right away. For instance, after the first `UPDATE`, running `SELECT * FROM accounts WHERE id IN (1, 2) ORDER BY id;` inside the transaction returns:

```text
 id | balance
----+---------
  1 | 4000.00
  2 | 5000.00
(2 rows)
```

If a second session runs the same query at that moment, it still sees the last committed state of both accounts:

```text
 id | balance
----+---------
  1 | 5000.00
  2 | 5000.00
(2 rows)
```

Once the first session runs the second `UPDATE` and `COMMIT`, the second session sees both changes at once:

```text
 id | balance
----+---------
  1 | 4000.00
  2 | 6000.00
(2 rows)
```

### Rolling back transactions

Within a transaction, either all or none of the statements will be committed to the database. Abandoning the statements and modifications made within a transaction instead of applying them to the database is known as "rolling back" the transaction.

Transactions can be rolled back either automatically or manually. If a session disconnects before committing its transaction, PostgreSQL rolls the transaction back automatically.

Errors work differently. If a statement inside a transaction block fails, including with a serialization failure under the stricter isolation levels, PostgreSQL doesn't quietly undo the transaction and carry on. Instead, it marks the transaction as _aborted_ and rejects every further command until you end the transaction block. For example, this transfer tries to take more money out of account `1` than it holds, which violates the table's `CHECK` constraint:

```sql
BEGIN;

UPDATE accounts
   SET balance = balance - 6000
 WHERE id = 1;

UPDATE accounts
   SET balance = balance + 6000
 WHERE id = 2;

COMMIT;
```

In `psql`, this prints:

```text
BEGIN
ERROR:  new row for relation "accounts" violates check constraint "accounts_balance_check"
DETAIL:  Failing row contains (1, -1000.00).
ERROR:  current transaction is aborted, commands ignored until end of transaction block
ROLLBACK
```

The second `UPDATE` is rejected even though it would have succeeded on its own, and `psql`'s default prompt shows a `!` while the transaction is in this state (instead of the `*` it shows during a normal transaction). An aborted transaction can't be committed: `COMMIT` rolls it back instead, which is why the response to `COMMIT` above is `ROLLBACK`. None of the changes are saved. To end an aborted transaction, issue `ROLLBACK` (or, to keep the work done before the error, roll back to a save point, as described [below](#recovering-from-errors-with-save-points)).

To manually roll back statements that have been given during the current transaction, you can use the `ROLLBACK` command. This will cancel all of the statements within the transaction and end it, in essence turning back the clock to before the transaction started.

For instance, supposing we're using the same bank accounts example we were using before, if we find out after issuing the `UPDATE` statements that we accidentally transferred the wrong amount or used the wrong accounts, we could rollback the changes instead of committing them:

```sql
   BEGIN;

  UPDATE accounts
     SET balance = balance - 1500
   WHERE id = 1;

  UPDATE accounts
     SET balance = balance + 1500
   WHERE id = 3;  -- Wrong account number here!  Must rollback

/* Gets us back to where we were before the transaction started */
ROLLBACK;
```

Once we `ROLLBACK`, the $1500 will still be in the account with `id = 1`.

### Using save points when rolling back

The `ROLLBACK` command discards everything done since the `BEGIN` or `START TRANSACTION` command and ends the transaction. But what if we only want to revert some of the statements within the transaction?

While you cannot specify arbitrary places to roll back to when issuing `ROLLBACK` command, you _can_ roll back to any "save points" that you've set throughout the transaction. You can mark places in your transaction ahead of time with the `SAVEPOINT` command and then reference those specific locations when you need to roll back.

These save points allow you to create an intermediate roll back point. You can then optionally revert any statements made between where you are currently and the save point and then continue working on your transaction.

To specify a save point, issue the `SAVEPOINT` command followed by a name for the save point:

```sql
SAVEPOINT save_1;
```

To roll back to that save point, use the `ROLLBACK TO SAVEPOINT` command (the `SAVEPOINT` keyword is optional, so `ROLLBACK TO save_1` works too):

```sql
ROLLBACK TO SAVEPOINT save_1;
```

Rolling back to a save point undoes the changes made after it but keeps the save point, so you can roll back to it again if you need to. When you no longer need a save point, you can remove it with `RELEASE SAVEPOINT`:

```sql
RELEASE SAVEPOINT save_1;
```

Releasing a save point keeps the changes made after it. Like everything else in the transaction, they're only made permanent when the transaction commits.

Let's continue the account-focused example we've been using:

```sql
    BEGIN;

   UPDATE accounts
      SET balance = balance - 1500
    WHERE id = 1;

/* Set a save point that we can return to */
SAVEPOINT save_1;

   UPDATE accounts
      SET balance = balance + 1500
    WHERE id = 3;  -- Wrong account number here!  We can rollback to the save point though!

/* Gets us back to the state of the transaction at `save_1` */
 ROLLBACK TO SAVEPOINT save_1;

/* Continue the transaction with the correct account number */
   UPDATE accounts
      SET balance = balance + 1500
    WHERE id = 4;

/* We no longer need the save point */
  RELEASE SAVEPOINT save_1;

   COMMIT;
```

Here, we're able to recover from a mistake we made without losing all of the work we've done in the transaction so far. After rolling back, we continue with the transaction as planned using the correct statements.

#### Recovering from errors with save points

Save points are also how you recover from an error without losing the whole transaction. As described [above](#rolling-back-transactions), a failed statement puts the transaction into an aborted state. Rolling back to a save point that was set before the failure discards the failed statement and makes the transaction usable again:

```sql
BEGIN;

UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
UPDATE accounts SET balance = balance + 1000 WHERE id = 2;

SAVEPOINT second_transfer;

UPDATE accounts SET balance = balance - 6000 WHERE id = 3;

ROLLBACK TO SAVEPOINT second_transfer;

COMMIT;
```

In `psql`, this prints:

```text
BEGIN
UPDATE 1
UPDATE 1
SAVEPOINT
ERROR:  new row for relation "accounts" violates check constraint "accounts_balance_check"
DETAIL:  Failing row contains (3, -1000.00).
ROLLBACK
COMMIT
```

The `ROLLBACK` line is the response to `ROLLBACK TO SAVEPOINT`, and this time `COMMIT` really commits: the transfer from account `1` to account `2` is saved, while account `3` is unchanged. If an application wraps a statement that might fail in a save point like this, it can decide what to do about the error without starting the whole transaction over.

### Setting the isolation level of transactions

To set the level of isolation you'd like for a transaction, you can add an `ISOLATION LEVEL` clause to your `START TRANSACTION` or `BEGIN` command. The basic syntax looks like this:

```sql
BEGIN ISOLATION LEVEL <isolation_level>;

statements

COMMIT;
```

The `<isolation_level>` can be any of these (described in detail earlier):

- `READ UNCOMMITTED` (will result in `READ COMMITTED` since this level isn't implemented in PostgreSQL)
- `READ COMMITTED`
- `REPEATABLE READ`
- `SERIALIZABLE`

The `SET TRANSACTION` command can also be used to set the isolation level after a transaction is started. However, you can only use `SET TRANSACTION` before any queries or data modifying commands are executed, so it doesn't allow for increased flexibility.

### Chaining transactions

If you have multiple transactions that should be executed sequentially, you can optionally chain them together using the `COMMIT AND CHAIN` command.

The `COMMIT AND CHAIN` command completes the current transaction by committing the statements within. After the commit has been processed, it immediately opens a new transaction. This allows you to group another set of statements together in a transaction.

The statement works like `COMMIT` followed by `BEGIN`, except that the new transaction keeps the characteristics of the one that just ended, such as its isolation level:

```sql
    BEGIN;

   UPDATE accounts
      SET balance = balance - 1500
    WHERE id = 1;

   UPDATE accounts
      SET balance = balance + 1500
    WHERE id = 2;

/* Commit the data and start a new transaction that will take into account the committed from the last transaction */
   COMMIT AND CHAIN;

   UPDATE accounts
      SET balance = balance - 1000
    WHERE id = 2;

   UPDATE accounts
      SET balance = balance + 1000
    WHERE id = 3;

   COMMIT;
```

Chaining transactions doesn't offer much in terms of new functionality, but it can be helpful for committing data at natural boundaries while continuing to focus on the same type of operations.

### Conclusion

Transactions are not a silver bullet. There are a lot of trade offs that come with various isolation levels and understanding what types of consistency you need to protect can take thought and planning. This is especially true with long running transactions where the underlying data may change significantly and the possibility of conflict with other concurrent transactions increases.

That being said, the transaction mechanic offers a lot of flexibility and power. It goes a long way towards ensuring ACID guarantees are maintained even while performing interrelated, concurrent operations. Knowing when and how to properly use transactions to perform complex, safe operations is invaluable.

If you are using JavaScript or TypeScript, you can use [Prisma to manage your PostgreSQL database](https://www.prisma.io/docs/orm). Prisma ORM can run a group of queries in a single database transaction. Unless told otherwise, it uses the isolation level configured in your database (`READ COMMITTED` by default in PostgreSQL). The transaction API, and whether you can request a different isolation level, differ between Prisma ORM versions, so check [Prisma's transactions documentation](https://www.prisma.io/docs/orm/fundamentals/transactions) for the version you use.
