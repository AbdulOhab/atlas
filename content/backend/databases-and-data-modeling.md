---
title: "Databases and Data Modeling"
order: 11
summary: "What databases are, relational vs other types, schemas, tables and types, constraints and relationships between tables."
category: "Databases"
level: Beginner
---

# Databases and Data Modeling

Before any SQL, you need a shape for your data: which tables exist, what each column holds, which rules keep it correct, and how tables point at each other.

**Course outline modules:** 8 (Data Modeling), 15 (Introduction to Database), 16 (Database Schema), 18 (Database Fundamentals)

## What are databases

> **Source:** [What are databases](https://github.com/prisma/dataguide/blob/main/content/01-intro/01-what-are-databases.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

Databases are essential components for many modern applications and tools. As a user, you might interact with dozens or hundreds of databases each day as you visit websites, use applications on your phone, or purchase items at the grocery store. As a developer, databases are the core component used to persist data beyond the lifetime of your application. But what exactly are databases and why are they so common?

In this article, we'll go over:

- what databases are
- how they are used by people and applications to keep track of various kinds of data
- what features databases offer
- what types of guarantees they make
- how they compare to other methods of data storage

Finally, we'll discuss how applications rely on databases for storing and retrieving data to enable complex functionality.

### What are databases?

[_Databases_](https://www.prisma.io/dataguide/intro/database-glossary#database) are logical structures used to organize and store data for future processing, retrieval, or evaluation. In the context of computers, these structures are nearly always managed by an application called a [_database management system_](https://www.prisma.io/dataguide/intro/database-glossary#database-management-system) or _DBMS_. The DBMS manages dedicated files on the computer's disk and presents a logical interface for users and applications.

Database management systems are typically designed to organize data according to a specific pattern. These patterns, called [_database types_ or database models](https://www.prisma.io/dataguide/intro/comparing-database-types), are the logical and structural foundations that determine how individual pieces of data are stored and managed. There are many different database types, each with their own advantages and limitations. The [_relational model_](https://www.prisma.io/dataguide/intro/comparing-database-types#relational-databases-working-with-tables-as-a-standard-solution-to-organize-well-structured-data), which organizes data into cross-referenced tables, rows, and columns, is often considered to be the default paradigm.

DBMSs can make databases they govern accessible via a variety of means including command line clients, APIs, programming libraries, and administrative interfaces. Through these channels, data can be ingested into the system, organized as required, and returned as requested.

### Data persistence vs ephemeral storage

Databases store data either on disk or in-memory.

On disk storage is generally said to be [_persistent_](https://www.prisma.io/dataguide/intro/database-glossary#persistent-storage), meaning that the data is reliably saved for later, even if the database application or the computer itself restarts.

In contrast, [in-memory storage](https://www.prisma.io/dataguide/intro/database-glossary#in-memory-database) is said to be [_ephemeral_](https://www.prisma.io/dataguide/intro/database-glossary#ephemeral-storage) or [_volatile_](https://www.prisma.io/dataguide/intro/database-glossary#ephemeral-storage). Ephemeral storage does not survive application or system shutdown. The advantage of in-memory databases is that they are typically very fast.

In practice, many environments will use a mixture of both of these types of systems to gain the advantages of each type. For systems that accept new writes to the ephemeral layer, this can be accomplished by periodically saving ephemeral data to disk. Other systems use read-only in-memory copies of persistent data to speed up read access. These systems can reload the data from the backing storage at any time to refresh their data.

| Backing storage type | Data survive restarts? | Advantages        | Examples  |
| -------------------- | ---------------------- | ----------------- | --------- |
| On disk              | Yes                    | Data longevity    | MySQL     |
| In-memory            | No                     | Operational speed | memcached |

### Interacting with databases to manage your data

While the database system takes care of how to store the data on disk or in-memory, it also provides an interface for users or applications. The interfaces for the database must be able to represent the operations that external parties can perform and must be able to represent all of the data types that the system supports.

According to [Wikipedia](https://en.wikipedia.org/wiki/Database#Major_database_usage_requirements), databases typically allow the following four types of interactions:

- [**Data definition**](#data-definitions-control-the-shape-and-structure-of-data-within-the-system): Create, modify, and remove definitions of the data's structure. These operations change the properties that affect how the database will accept and store data. This is more important in some types of databases than others.
- [**Update**](#data-updates-to-ingest-modify-and-remove-data-from-the-system): Insert, modify, and delete data within the database. These operations change the actual data that is being managed.
- [**Retrieval**](#retrieving-data-to-extract-information-or-answer-specific-questions): Provide access to the stored data. Data can be retrieved as-is or can often be filtered or transformed to massage it into a more useful format. Many database systems understand rich querying languages to achieve this.
- [**Administration**](#administering-the-database-system-to-keep-everything-running-smoothly): Other tasks like user management, security, performance monitoring, etc. that are necessary but not directly related to the data itself.

Let's go over these in a bit more detail below.

#### Data definitions control the shape and structure of data within the system

Creating and controlling the structure that your data will take within the database is an important part of database management. This can help you control the shape, or structure, of your data before you ingest it into the system. It also allows you to set up constraints to make sure your data adheres to certain parameters.

In databases that operate on highly regular data, like relational databases, these definitions are often known as the database's [_schema_](https://www.prisma.io/dataguide/intro/database-glossary#schema). A database schema is a strict outline of how data must be formatted to be accepted by a particular database. This covers the specific fields that must be present in individual records as well as requirements for values such as data type, field length, minimum or maximum values, etc. A database schema is one of the most important tools a database owner has to influence and control the data that will be stored in the system.

Database management systems that value flexibility over regularity are often referred to as _schema-less databases_. While this seems to imply that the data stored within these databases has no structure, this is usually not the case. Instead, the database's structure is determined by the data itself and the application's knowledge of and relation to the data. The database usually still adheres to a structure, but the database management system is less involved in enforcing constraints. This is a design choice that has benefits and disadvantages depending on the situation.

#### Data updates to ingest, modify, and remove data from the system

Data updates include any operation that:

- Enters new data into the system
- Modifies existing entries
- Deletes entries from the database

These capabilities are essential for any database, and in many cases, constitute the majority of actions that the database system processes. These types of activities — operations that cause changes to the data in the system — are collectively known as [_write_ operations](https://www.prisma.io/dataguide/intro/database-glossary#write-operation).

Write actions are important for any data source that will change over time. Even removing data, a destructive action, is considered a write operation since it modifies the data within the system.

Since write operations can change data, these actions are potentially dangerous. Most database administrators configure their systems to restrict write operations to certain application processes to minimize the chance of accidental or malicious data mangling. For example, data analytics, which use existing data to answer questions about a website's performance or visitors' behavior, require only read permission. On the other hand, the part of the application that records a user's orders needs to be able to write new data to the database.

#### Retrieving data to extract information or answer specific questions

Storing data is not very useful unless you have a way of retrieving it when you need it. Since returning data does not affect any of the information currently stored in the database, these actions are called [_read_ operations](https://www.prisma.io/dataguide/intro/database-glossary#read-operation). Read operations are the primary way of gathering data already stored within a database.

Database management systems almost always have a straightforward way of accessing data by a unique identifier, often called a [_primary key_](https://www.prisma.io/dataguide/intro/database-glossary#primary-key). This allows access to any one entry by providing the key.

Many systems also have sophisticated methods of querying the database to return data sets that match specific criteria or return partial information about entries. This type of querying flexibility helps the database management system operate as a data processor in addition to its basic data storage capabilities. By developing specific queries, users can prompt the database system to return only the information they require. This feature is often used in conjunction with write operations to locate and modify a specific record by its properties.

#### Administering the database system to keep everything running smoothly

The final category of actions that databases often support is administrative functions. This is a broad, general class of actions that helps support the database environment without directly influencing the data itself. Some items that might fit into this group include:

- Managing users, permissions, authentication, and authorization
- Setting up and maintaining backups
- Configuring the backing medium for storage
- Managing replication and other scaling considerations
- Providing online and offline recovery options

This set of actions aligns with the basic administrative concerns common to any modern application.

Administrative operations might not be central to core data management functionality, but these capabilities often set similar database management systems apart. Being able to easily back up and restore data, implement user management that hooks into existing systems, or scale your database to meet demand are all essential features for operating in production. Databases that fail to pay attention to these areas often struggle to gain adoption in real world environments.

### What responsibilities do databases have?

Given the above description, how can we generalize the primary responsibilities that databases have? The answer depends a lot on the type of database being used and your applications' requirements. Even so, there are a common set of responsibilities that all databases seek to provide.

#### Safeguarding data integrity through faithful recording and reconstituting

Data integrity is a fundamental requirement of a database system, regardless of its purpose or design. Data loaded into the database should be able to be retrieved dependably without unexpected modification, manipulation, or erasure. This requires reliable methods of loading and retrieving data, as well as serializing and deserializing the data as necessary to store it on physical media.

Databases often rely on features to verify data as it is written or retrieved, like [checksumming](https://en.wikipedia.org/wiki/Checksum), or to protect against issues caused by unexpected shutdowns, using techniques like [write-ahead logs](https://en.wikipedia.org/wiki/Write-ahead_logging), for example. Data integrity becomes more challenging the more distributed the data store is, as each part of the system must reflect the current desired state of each data item. This is often achieved with more robust requirements and responses from multiple members whenever data is changed in the system.

#### Offering performance that meets the requirements of the deployment environment

Databases must perform adequately to be useful. The performance characteristics you need depend heavily on the particular demands of your applications. Every environment has unique balance of read and write requests and you will have to decide on what acceptable performance means for both of those categories.

Databases are generally better at performing certain types of operations than others. Operational performance characteristics are often a reflection of the type of database used, the data schema or structure, and the operation itself. In some cases, features like [_indexing_](https://www.prisma.io/dataguide/intro/database-glossary#index), which creates an alternative performance-optimized store of commonly accessed data, can provide faster retrieval for these items. Other times, the database may just not be a good fit for the access patterns being requested. This is something to consider when deciding on what type of database you need.

#### Setting up processes to allow for safe concurrent access

While this isn't a strict requirement, practically speaking, databases must allow for concurrent access. This means that multiple parties must be able to work with the database at the same time. Records should be readable by any number of users at the same time and writable when not currently locked by another user.

Concurrent access usually means that the database must implement some other fundamental features like user accounts, a permissions system, and authentication and authorization mechanisms. It must also develop strategies for preventing multiple users from attempting to manipulate the same data concurrently. Record locking and transactions are often implemented to address these concerns.

#### Retrieving data individually or in aggregate

One of the fundamental responsibilities of a database is the ability to retrieve data upon request. The requests might be for individual pieces of data associated with a single record, or they may involve retrieving the data found in many different records. Both of these cases must be possible in most systems.

In most databases, some level of data processing is provided by the database itself during retrieval. These can include the following types of operations:

- Searching by criteria
- Filtering and adhering to constraints
- Extracting specific fields
- Averaging, sorting, etc.

These options help you articulate the data you'd like and the format that would be most useful.

### Alternatives to databases

Before we move on, we should briefly take a look at what your options are if you don't use a database.

Most methods that store data can be classified as a database of some kind. A few exception include the following.

#### Local memory or temporary filesystems

Sometimes applications produce data that is not useful or that is only relevant for the lifetime of the application. In these cases, you may wish to keep that data in memory or offload it to a temporary filesystem since you won't need it once the application exits. For cases where the data is never useful, you may wish to disable output entirely or log it to `/dev/null`.

#### Serializing application data directly to the local filesystem

Another instance where a database might not be required is where a small amount of data can be serialized and deserialized directly instead. This is only practical for small amounts of data with a predictable usage pattern that does not involve much, if any, concurrency. This does not scale well but can be useful for certain cases, like outputting local log information.

#### Storing file-like objects directly to disk or object-storage

Sometimes, data from applications can be written directly to disk or an alternative store instead of storing into a database. For instance, if the data is already organized into a file-oriented format, like an image or audio file, and doesn't require additional metadata, it might be easiest to store it directly to disk or to a dedicated object store.

### What are databases used for?

Almost all applications and websites that are not entirely static rely on a database somewhere in their environment. The primary purpose of the database often dictates the type of database used, the data stored, and the access patterns employed. Often multiple database systems are deployed to handle different types of data with different requirements. Some databases are flexible enough to fulfill multiple roles depending on the nature of different data sets.

Let's take a look at an example to discuss the touchpoints a typical web application may have with databases. We'll pretend that the application contains a basic storefront and sells items it tracks in an inventory.

#### Storing and processing site data

One of the primary uses for databases is storing and processing data related to the site. These items affect how information on the site is organized and, for many cases, constitute most of the "content" of the site.

In the example application mentioned above, the database would populate most of the content for the site including product information, inventory details, and user profile information. This means that the database or some intermediary cache would be consulted each time a product list, a product detail page, or a user profile needs to be displayed.

A database would also be involved when displaying current and past orders, calculating shipping cost, and applying discounts by checking discount codes or calculating frequent customer rewards. Our example site would use the database system to correctly build orders by combining product information, inventory, and user information. The composite information that is recorded in an order would be stored in a database again to track order processing, allow returns, cancel or modify orders, or enable better customer support.

#### Analyzing information to help make better decisions

The actions in the last category were related to the basic functionality of the website. While these are very important for handling the data requirements of the application layer, they don't represent the entire picture.

Once your web application begins registering users and processing orders, you probably want to be able to answer detailed questions about how different products are selling, who your most profitable users are, and what factors influence your sales. These are analytical questions that can be run at any time to gather up-to-date intelligence about your organization's trends and performance.

These types of operations are often called _business intelligence_ or _analytics_. Together, they help organizations understand what happened in the past and to make informed changes. Database systems store most of the data used during these processes and must provide the appropriate tooling or querying capabilities to answer questions about it.

In our example application, the databases could be queried to answer questions about product trends, user registration numbers, which states we ship to the most, or who our most loyal users are. These relatively basic queries can be used to compose more complex questions to better understand and control factors that influence product performance.

#### Managing software configuration

Some types of databases are used as repositories for configuration values for other software on the network. These serve as a central source of truth for configuration values on the network. As new services are started up, they are configured to check the values for specific keys at the configuration database's network address. This enables you to store all of the information needed to bootstrap services in one location.

After bootstrapping, applications can be configured to watch the keys related to their configuration for changes. If a change is detected, the application can reconfigure itself to use the new configuration. This process is sometimes orchestrated by a management process that rolls out the new values over time by spinning old services down as the new services come up, changing over the active configuration over time to maintain availability.

Our application could use this type of database to store persistent configuration data for our entire application environment. Our application servers, web servers, load balancers, messaging queues, and more could be configured to reference a configuration database to get their production settings. The application's developers could then modify the behavior of the environment by tweaking configuration values in a central location.

#### Collecting logs, events, and other output

Running applications that are actively serving requests can generate a lot of output. This includes log files, events, and other output. These can be written to disk or some other unmanaged location, but this limits their usefulness. Collecting this type of data in a database makes it easier to work with, spot patterns, and analyze events when something unexpected happens or when you need to find out more about historical performance.

Our example application might collect logs from each of our systems in one database for easier analysis. This can help us find correlations between events if we're try to analyze the source of problems or understand the health of our environment as a whole.

Separately, we might collect metrics produced by our infrastructure and code in a _time series database_, a database specifically designed to track values over time. This database could be used to power real time monitoring and visualization tools to provide the application's development and operations teams with information about performance, error rates, etc.

### How do different roles work with databases?

Databases are fundamental to the work of many different roles within organizations. In smaller teams, one or a few individuals may be responsible for carrying out the duties of various roles. In larger companies, these responsibilities are often segmented into discrete roles performed by dedicated individuals or teams.

#### Data architects

Data architects are responsible for the overall macro structure of the database systems, the interfaces they expose to applications and development teams, and the underlying technologies and infrastructure required to meet the organization's data needs.

People in this role generally decide on appropriate database model and implementation that will be used for different applications. They are responsible for implementing database decisions by investigating options, deciding on technology, integrating it with existing systems, and developing a comprehensive data strategy for the organization. They deal with the data systems holistically and have a hand in deciding on and implementing data models for various projects.

#### DBAs (database administrators)

[Database administrators](https://www.prisma.io/dataguide/intro/database-glossary#database-administrator), or DBAs, are individuals who are responsible for keeping data systems running smoothly. They are responsible for planning new data systems, installing and configuring software, setting up database systems for other parties, and managing performance. They are also often responsible for securing the database, monitoring it for problems, and making adjustments to the system to optimize for usage patterns.

Database administrators are experts on both individual database systems as well as how to integrate them well with the underlying operating system and hardware to maximize performance. They work extensively with teams that use the databases to help manage capacity and performance and to help teams troubleshoot issues with the database system.

#### Application developers

Application developers interact with databases in many different ways. They develop many of the applications that interact with the database. This is very important because these are almost always the only applications that control how individual users or customers interact with the data managed by the database system. Performance, correctness, and reliability are incredibly important to application developers.

Developers manage the data structures associated with their applications to persist their data to disk. They must create or use mechanisms that can map their programming data to the database system so that the components can work together in harmony. As applications change, they must keep the data and data structures within the database system in sync. We'll talk more about [how developers work with databases](#how-do-i-work-with-databases-as-a-developer) later in the article.

#### SREs (site reliability engineers) and operations professionals

SREs (site reliability engineers) and operations professionals interact with database systems from an infrastructure and application configuration perspective. They may be responsible for provisioning additional capacity, standing up database systems, ensuring database configuration matches organizational guidelines, monitoring uptime, and managing back ups.

In many ways, these individuals have overlapping responsibilities with DBAs, but are not focused solely on databases. Operations staff ensure that the systems that applications that the rest of the organization rely on, including database systems, are functioning reliably and have minimal downtime.

#### Business intelligence and data analysts

Business intelligence departments and data analysts are primarily interested in the data that is already collected and available within the database system. They work to develop insights based on trends and patterns within the data so that they can predict future performance, advise the organization on potential changes, and answer questions about the data for other departments like marketing and sales.

Data analysts can generally work exclusively with read-only access to data systems. The queries they run often have dramatically different performance characteristics than those used by the primary applications. Because of this, they often work with database replicas, or copies, so that they can perform long-running and performance intensive aggregate queries that might otherwise impact the resource usage of the primary database system.

### How do I work with databases as a developer?

So how do you actually go about working with databases as an application developer? On a basic level, if your application has to manage and persist state, working with a database will be an important part of your code.

#### Translating data between your application and the database

You will need to create or use an existing interface for communicating with the database. You can connect directly to the database using regular networking functions, leverage simple libraries, or higher-level programming libraries (e.g. query builders or ORMs).

[_ORMs_](https://www.prisma.io/dataguide/intro/database-glossary#orm), or object-relational mappers, are mapping layers that translate the tables found in relational database to the classes used within object-oriented program languages and vice versa. While this translation is often useful, it is never perfect. [_Object-relational impedance mismatch_](https://www.prisma.io/dataguide/intro/database-glossary#object-relational-impedance-mismatch) is a term used to describe the friction caused by the difference in how relational databases and object-oriented programs structure data.

Although relational databases and object-oriented programming describe two specific design choices, the problem of translating between the application and database layer is a generalized one that exists regardless of database type or programming paradigm. **Database abstraction layer** is a more general term for software with the responsibility of translating between these two contexts.

#### Keeping structural changes in sync with the database

One important fact you'll discover as you develop your applications is that since the database exists outside of your codebase, it needs special attention to cope with changes to your data structure. This issue is more prevalent in some database designs than others.

The most common approach to synchronizing your application's data structures with your database is a process called [_database migration_](https://www.prisma.io/dataguide/intro/database-glossary#migration) or _schema migration_ (both known colloquially simply as migration). Migration involves updating your database's structure to reflect changes as your application's data model evolves. These usually take the form of a series of files, one for each evolution, that contain the statements needed to transform the database into the new format.

#### Protecting access to your data and sanitizing input

One important responsibility when working with databases as a developer is ensuring that your applications don't allow unauthorized access to data. Data security is a broad, multi-layered problem with many stakeholders. Ultimately, some of the security considerations will be your duty to look after.

Your application will require privileged access to your database to perform routine tasks. For safety, the database's authorization framework can help restrict the type of operations your application can perform. However, you need to ensure that your application restricts those operations appropriately. For example, if your application manages user profile data, you have to prevent a user from manipulating that access to view or edit other users' information.

One specific challenge is sanitizing user input. [_Sanitizing input_](https://www.prisma.io/dataguide/intro/database-glossary#sanitizing-input) means taking special precautions when operating on any data provided by a user. There is a long history of malicious actors using normal user input mechanisms to trick applications into revealing sensitive data. Crafting your applications to protect against these scenarios is an important skill.

### Conclusion

Databases are an indispensable component in modern application development. Storing and controlling the stateful information related to your application and its environment is an important responsibility that requires reliability, performance, and flexibility.

Fortunately, there are many different database options designed to fulfil the requirements of different types of applications. In [our next article](https://www.prisma.io/dataguide/intro/comparing-database-types), we'll take an in-depth look at the different types of databases available and how they can be used to match different types of application requirements.

[Prisma ORM](https://www.prisma.io/docs/orm) is one way to make it easy to work with databases from your application. You can learn more about how it works on the [core concepts page](https://www.prisma.io/docs/orm/core-concepts).

Prisma ORM works with [several databases](https://www.prisma.io/docs/orm/supported-databases), with one library for each. Check out our docs to learn more.

### FAQ

<details>
<summary>What are persistent data structures?</summary>

Databases store data either on disk or in-memory. On disk storage is generally said to be _persistent_, meaning that the data is reliably saved for later, even if the database application or the computer itself restarts.

</details>

<details>
<summary>What does a database administrator do?</summary>

[Database administrators](#dbas-database-administrators), or DBAs, are individuals who are responsible for keeping data systems running smoothly. They are responsible for planning new systems, installing and configuring software, setting up database systems for other parties, and managing performance.

</details>

<details>
<summary>What is a database abstraction layer?</summary>

A [database abstraction layer](https://www.prisma.io/dataguide/intro/database-glossary#database-abstraction-layer) is an application programming interface which unifies the communication between a computer application and a database.

</details>

<details>
<summary>What is database management?</summary>

Database management refers to the actions taken to work with and control data to meet necessary conditions throughout the data lifecycle.

Some database management tasks include performance monitoring and tuning, storage and capacity planning, backup and recovery data, data archiving, data partitioning, replication, and more.

</details>

<details>
<summary>What is a database management system?</summary>

[Database management systems (DBMS)](https://www.prisma.io/dataguide/intro/database-glossary#database-management-system) are software systems used to store, retrieve, and run queries on data. They serve as an interface between end-users and a database to perform [CRUD](#interacting-with-databases-to-manage-your-data) operations.

</details>

## Comparing database types

> **Source:** [Comparing database types](https://github.com/prisma/dataguide/blob/main/content/01-intro/02-comparing-database-types.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

**Database types**, sometimes referred to as [database models](https://www.prisma.io/dataguide/intro/database-glossary#database-model) or database families, are the patterns and structures used to organize data within a database management system. Many different database types have been developed over the years. Some are mainly historic predecessors to current databases, while others have stood the test of time. In the last few decades, new types have been developed to address changing requirements and different use patterns.

Your choice of database type can have a profound impact on what kind of operations your application can easily perform, how you conceptualize your data, and the features that your database management system offers you during development and runtime. In this guide, we'll take a look at how database types have evolved over time and what advantages and trade-offs are present in each design.

### Legacy databases: paving the way for modern systems

Legacy database types represent milestones on the path to modern databases. These may still find a foothold in certain specialized environments, but have mostly been replaced by more robust alternatives for production environments.

This section is dedicated to historic database types that aren't used much in modern development. You can [skip ahead to the section on relational databases](#relational-databases-working-with-tables-as-a-standard-solution-to-organize-well-structured-data) if you aren't interested in that background.

#### Flat-file databases: simple data structures for organizing small amounts of local data

The simplest way to manage data on a computer outside of an application is to store it in a basic file format. The first solutions for data management used this approach and it is still a popular option for storing small amounts of information without heavy requirements.

The first [flat file databases](https://www.prisma.io/dataguide/intro/database-glossary#flat-file-database) represented information in regular, machine parse-able structures within files. Data is stored in plain text, which limits the type of content that can be represented within the database itself. Sometimes, a special character or other indicator is chosen to use as a _delimiter_, or marker for when one field ends and the next begins. For example, a comma is used in CSV (comma-separated values) files, while colons or white-space are used in many data files in [Unix-like](https://en.wikipedia.org/wiki/Unix-like) systems. Other times, no delimiter is used and instead, fields are defined with a fixed length which can be padded for shorter values.

**`/etc/passwd` on \*nix systems:**

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
syslog:x:102:106::/home/syslog:/usr/sbin/nologin
bob:x:1000:1000:Bob Smith,,,:/home/bob:/bin/bash
```

_The `/etc/passwd` file defines users, one per line. Each user has attributes like name, user and group IDs, home directory and default shell, each separated by a colon._

While flat file databases are simple, they are very limited in the level of complexity they can handle. The system that reads or manipulates the data cannot make easy connections between the data represented. File-based systems usually don't have any type of user or data concurrency features either. Flat file databases are usually only practical for systems with small read or write requirements. For example, many operating systems use flat-files to store configuration data.

In spite of these limitations, flat-file databases are still widely used for scenarios where local processes need to store and organized small amounts of data. A good example of this is for configuration data for many applications on Linux and other Unix-like systems. In these cases, the flat-file format serves as an interface that both humans and applications can easily read and manage. Some advantages of this format are that it has robust, flexible tooling, is easily managed without specialized software, and is easy to understand and work with.

Examples:

- [`/etc/passwd`](https://en.wikipedia.org/wiki/Passwd#Password_file) and [`/etc/fstab`](https://en.wikipedia.org/wiki/Fstab) on Linux and Unix-like systems
- [CSV](https://en.wikipedia.org/wiki/Comma-separated_values) files

#### Hierarchical databases: using parent-child relationships to map data into trees

**Initial introduction: 1960s**

[Hierarchical databases](https://www.prisma.io/dataguide/intro/database-glossary#hierarchical-database) were the next evolution in database management development. They encode a relationship between items where every record has a single parent. This builds a tree-like structure that can be used to categorize records according to their parent record.

![Diagram of a hierarchical database](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/intro/database-type-comparison/hierarchical.png)

[comment]: # ' ``` '
[comment]: # ' @startwbs '
[comment]: # ' * / '
[comment]: # ' ** /bin '
[comment]: # ' ** /boot '
[comment]: # ' ** /etc '
[comment]: # ' ** /home '
[comment]: # ' *** /home/bob '
[comment]: # ' ** /root '
[comment]: # ' ** /... '
[comment]: # ' ** /usr '
[comment]: # ' ** /var '
[comment]: # ' ***> /var/www '
[comment]: # ' ***< /var/log '
[comment]: # ' @endwbs '
[comment]: # ' ``` '

This simple relationship mapping provides users with the ability to establish relationships between items in a tree structure. This is very useful for certain types of data, but does not allow for complex relationship management. Furthermore, the meaning of the parent-child relationship is implicit. One parent-child connection could be between a customer and their orders, while another might represent an employee and the equipment they have been allocated. The structure of the data itself does not distinguish between these relationships.

Hierarchical databases are the beginning of a movement towards thinking about data management in more complex terms. The trajectory of database management systems that were developed afterwards continues this trend.

Hierarchical databases are not used much today due to their limited ability to organize most data and because of the overhead of accessing data by traversing the hierarchy. However, a few incredibly important systems could be considered hierarchical databases. A filesystem, for instance, can be thought of as a specialized hierarchical database, as the system of files and directories fit neatly into the single-parent / multiple-child paradigm. Likewise, DNS and LDAP systems both act as databases for hierarchical datasets.

Examples:

- [Filesystems](https://en.wikipedia.org/wiki/File_system)
- [DNS](https://en.wikipedia.org/wiki/Domain_Name_System)
- [LDAP directories](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol)

#### Network databases: mapping more flexible connections with non-hierarchical links

**Initial introduction: late 1960s**

[Network databases](https://www.prisma.io/dataguide/intro/database-glossary#network-database) built on the foundation provided by hierarchical databases by adding additional flexibility. Instead of always having a single parent, as in hierarchical databases, network database entries can have more than one parent, which effectively allows them to model more complex relationships. When talking about network databases, it is important to realize that _network_ is being used to refer to connections between different data entries, not connections between different computers or software.

![Diagram of a network database](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/intro/database-type-comparison/network.png)

[comment]: # ' ``` '
[comment]: # ' @startuml '
[comment]: # ' agent Restaurant '
[comment]: # ' agent Cashier '
[comment]: # ' agent Cook '
[comment]: # ' agent Server '
[comment]: # ' agent Food '
[comment]: # ' agent Money '
[comment]: # ' Restaurant -- Cashier '
[comment]: # ' Restaurant -- Cook '
[comment]: # ' Restaurant -- Server '
[comment]: # ' Cashier --> Money '
[comment]: # ' Server --> Money '
[comment]: # ' Server --> Food '
[comment]: # ' Cook --> Food '
[comment]: # ' @enduml '
[comment]: # ' ``` '

Network databases can be represented by a generic _graph_ instead of a _tree_. The meaning of the graph was defined by a [**schema**](https://www.prisma.io/dataguide/intro/database-glossary#schema), which lays out what each data node and each relationship represents. This gave structure to the data in a way that could previously only be reached through inference.

> **Definition: Schema**
>
> A database schema is a description of the logical structure of a database or the elements it contains. Schemas often include declarations for the structure of individual entries, groups of entries, and the individual attributes that database entries are comprised of. These may also define data types and additional constraints to control the type of data that may be added to the structure.

Network databases were a huge leap forward in terms of flexibility and the ability to map connections between information. However, they were still limited by the same access patterns and design mindset of hierarchical databases. For instance, to access data, you still needed to follow the network paths to the record in question. The parent-child relationship carried over from hierarchical databases also affected the way that items could connect to one another.

It is difficult to find modern examples of network database systems. Setting up and working with network databases required a good deal of skill and specialized domain knowledge. Most systems that could be approximated using network databases found a better fit once relational databases appeared.

Examples:

- [IDMS](https://en.wikipedia.org/wiki/IDMS)

### Relational databases: working with tables as a standard solution to organize well-structured data

**Initial introduction: 1969**

[Relational databases](https://www.prisma.io/dataguide/intro/database-glossary#relational-database) are the oldest general purpose database type still widely used today. In fact, [relational databases comprise the majority of databases currently used in production](https://db-engines.com/en/ranking_categories).

Relational databases organize data using _tables_. Tables are structures that impose a schema on the records that they hold. Each column within a table has a _name_ and a [_data type_](https://www.prisma.io/dataguide/intro/database-glossary#data-type). Each row represents an individual record or data item within the table, which contains values for each of the columns. Relational databases get their name from mathematical relationships that use tuples (like the rows in a table) to represent ordered sets of data.

![Diagram of relational schema used to map entities for a school](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/intro/database-type-comparison/relational.png)

[comment]: # ' ``` '
[comment]: # ' @startuml '
[comment]: # " ' hide the spot "
[comment]: # ' hide circle '
[comment]: # " ' avoid problems with angled crows feet "
[comment]: # ' skinparam linetype ortho '
[comment]: # ' entity "Student" as stud { '
[comment]: # '   **id : int** '
[comment]: # '   -- '
[comment]: # '   first_name : text '
[comment]: # '   last_name : text '
[comment]: # '   date_of_birth: date '
[comment]: # '   phone_number: int '
[comment]: # ' } '
[comment]: # ' entity "Department" as dep { '
[comment]: # '   **id : int** '
[comment]: # '   -- '
[comment]: # '   name: text '
[comment]: # ' } '
[comment]: # ' entity "Course" as crs { '
[comment]: # '   **id : int** '
[comment]: # '   -- '
[comment]: # '   title: text '
[comment]: # '   department: int **<<foreign key>>** '
[comment]: # '   other_details : text '
[comment]: # ' } '
[comment]: # ' entity "Section" as sect { '
[comment]: # '   **id : int** '
[comment]: # '   -- '
[comment]: # '   course: course_id **<<foreign key>>** '
[comment]: # '   teacher_id: int **<<foreign key>>** '
[comment]: # '   capacity: int '
[comment]: # ' } '
[comment]: # ' entity "Student section" as studsect { '
[comment]: # '   **id: int** '
[comment]: # '   -- '
[comment]: # '   student_id: int **<<foreign key>>** '
[comment]: # '   section_id: int **<<foreign key>>** '
[comment]: # ' } '
[comment]: # ' entity "Teacher" as tch { '
[comment]: # '   **id : int** '
[comment]: # '   -- '
[comment]: # '   first_name: text '
[comment]: # '   last_name: text '
[comment]: # '   phone_number: int '
[comment]: # ' } '
[comment]: # ' dep ||--|{ crs '
[comment]: # ' dep ||--|{ tch '
[comment]: # ' crs ||--|{ sect '
[comment]: # ' stud ||--|{ studsect '
[comment]: # ' sect ||--|{ studsect '
[comment]: # ' tch ||--|{ sect '
[comment]: # ' @enduml '
[comment]: # ' ``` '

Special fields in tables, called [_foreign keys_](https://www.prisma.io/dataguide/intro/database-glossary#foreign-key), can contain references to columns in other tables. This allows the database to bridge the two tables on demand to bring different types of data together.

The highly organized structure imparted by the rigid table structure, combined with the flexibility offered by the relations between tables makes relational databases very powerful and adaptable to many types of data. Conformity can be enforced at the table level, but database operations can combine and manipulate that data in novel ways.

While not inherent to the design of relational databases, a querying language called [SQL](https://www.prisma.io/dataguide/intro/database-glossary#sql), or structured query language, was created to access and manipulate data stored with that format. It can query and join data from multiple tables within a single statement. SQL can also filter, aggregate, summarize, and limit the data that it returns. So while SQL is not a part of the relational system, it is often a fundamental part of working with these databases.

> **Definition: SQL**
>
> SQL, or structured querying language, is a language family used to query and manipulate data within relational databases. It excels at combining data from multiple tables and filtering based on constraints which allow it to be used to express complex queries. Variants of the language has been adopted by almost all relational databases due to its flexibility, power, and ubiquity.

In general, relational databases are often a good fit for any data that is regular, predictable, and benefits from the ability to flexibly compose information in various formats. Because relational databases work off of a schema, it can be more challenging to alter the structure of data after it is in the system. However, the schema also helps enforce the integrity of the data, making sure values match the expected formats, and that required information is included. Overall, relational databases are a solid choice for many applications because applications often generate well-ordered, structured data.

Examples:

- [MySQL](https://www.mysql.com)
- [MariaDB](https://mariadb.org)
- [PostgreSQL](https://www.postgresql.org)
- [SQLite](https://www.sqlite.org/index.html)

### NoSQL databases: modern alternatives for data that doesn't fit the relational paradigm

[NoSQL](https://www.prisma.io/dataguide/intro/database-glossary#nosql) is a term for a varied collection of modern database types that offer approaches that differ from the standard relational pattern. The term NoSQL is somewhat of a misnomer since the databases within this category are more of a reaction against the relational archetype rather than the SQL querying language. NoSQL is said to stand for either "non-SQL" or "not only SQL" to sometimes clarify that they sometimes allow for SQL-like querying.

#### Key-value databases: simple, dictionary-style lookups for basic storage and retrieval

**Initial introduction: 1970s | Rise in popularity: 2000-2010**

[Key-value databases](https://www.prisma.io/dataguide/intro/database-glossary#key-value-database), or key-value stores, are one of the simplest database types. Key-value stores work by storing arbitrary data accessible through a specific _key_. To store data, you provide a key and the blob of data you wish to save, for example a JSON object, an image, or plain text. To retrieve data, you provide the key and will then be given the blob of data back. In most basic implementations, the database does not evaluate the data it is storing and allows limited ways of interacting with it.

![Diagram of key-value data store](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/intro/database-type-comparison/key-value.png)

[comment]: # ' ``` '
[comment]: # ' @startuml '
[comment]: # " ' hide the spot "
[comment]: # ' hide circle '
[comment]: # ' hide empty members '
[comment]: # ' entity "**key:           value**                                                " { '
[comment]: # '   user_id:       f5badc33-5bd7-4b65-a737-b5304675f476 '
[comment]: # '   color:          blue '
[comment]: # '   repetitions:  3 '
[comment]: # '   text:            hello world '
[comment]: # '   data:           { ... } '
[comment]: # ' } '
[comment]: # ' @enduml '
[comment]: # ' ``` '

If key-value stores appear simple, it's because they are. But that simplicity is often an asset in the kinds of scenarios where they are most often deployed. Key-value stores are often used to store configuration data, state information, and any data that might be represented by a _dictionary_ or _hash_ in a programming language. Key-value stores provide fast, low-complexity access to this type of data.

Some implementations provide more complex actions on top of this foundation according the basic data type stored under each key. For instance, they might be able to increment numeric values or perform slices or other operations on lists. Since many key-value stores load their entire datasets into memory, these operations can be completed very efficiently.

Key-value databases don't prescribe any schema for the data they store, and as such, are often used to store many different types of data at the same time. The user is responsible for defining any naming scheme for the keys that will help identify the values and are responsible for ensuring the value is of the appropriate type and format. Key-value storage is most useful as a lightweight solution for storing simple values that can be operated on externally after retrieval.

One of the most popular uses for key-value databases are to store configuration values and application variables and flags for websites and web applications. Programs can check the key-value store, which is usually very fast, for their configuration when they start. This allows you to alter the runtime behavior of your services by changing the data in the key-value store. Applications can also be configured to recheck periodically or to restart when they see changes. These configuration stores are often persisted to disk periodically to prevent loss of data in the event of a system crash.

Examples:

- [Redis](https://redis.io)
- [memcached](https://memcached.org)
- [etcd](https://etcd.io)

#### Document databases: Storing all of an item's data in flexible, self-describing structures

**Rise in popularity: 2009**

[Document databases](https://www.prisma.io/dataguide/intro/database-glossary#document-database), also known as document-oriented databases or document stores, share the basic access and retrieval semantics of key-value stores. Document databases also use a key to uniquely identify data within the database. In fact, the line between advanced key-value stores and document databases can be fairly unclear. However, instead of storing arbitrary blobs of data, document databases store data in structured formats called documents, often using formats like JSON, BSON, or XML.

![Diagram of document database](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/intro/database-type-comparison/document.png)

[comment]: # ' ``` '
[comment]: # ' @startuml '
[comment]: # " ' hide the spot "
[comment]: # ' hide circle '
[comment]: # ' hide empty members '
[comment]: # ' class "ID: breakfast" as breakfast { '
[comment]: # '    '
[comment]: # '     "type": "toast", '
[comment]: # '     "bread": "whole wheat", '
[comment]: # '     "spread": [ '
[comment]: # '         "butter", '
[comment]: # '         "jam" '
[comment]: # '     ] '
[comment]: # '    '
[comment]: # ' } '
[comment]: # ' class "ID: lunch" as lunch { '
[comment]: # '    '
[comment]: # '     "type": "salad", '
[comment]: # '     "vegetarian": false, '
[comment]: # '     "ingredients": [ '
[comment]: # '         "spinach", '
[comment]: # '         "tomato", '
[comment]: # '         "cucumber", '
[comment]: # '         "carrot", '
[comment]: # '         "dressing": [ '
[comment]: # '             "olive oil", '
[comment]: # '             "vinegar", '
[comment]: # '             "honey", '
[comment]: # '             "lemon", '
[comment]: # '             "salt", '
[comment]: # '             "pepper", '
[comment]: # '         ], '
[comment]: # '         "tuna", '
[comment]: # '         "walnuts" '
[comment]: # '     ], '
[comment]: # '     "rating": "5 stars", '
[comment]: # '     "restaurant": "Skylight Diner" '
[comment]: # '    '
[comment]: # ' } '
[comment]: # ' class "ID: dinner" as dinner { '
[comment]: # '    '
[comment]: # '     "type": "pizza", '
[comment]: # '     "size": "large", '
[comment]: # '     "toppings": [ '
[comment]: # '         "pepperoni", '
[comment]: # '         "tomato", '
[comment]: # '         "sausage" '
[comment]: # '     ], '
[comment]: # '     "price": 9.00, '
[comment]: # '     "presliced": true '
[comment]: # '    '
[comment]: # ' } '
[comment]: # ' breakfast -[hidden]> lunch '
[comment]: # ' lunch -[hidden]> dinner '
[comment]: # ' @enduml '
[comment]: # ' ``` '

Though the data within documents is organized within a structure, document databases do not prescribe any specific format or schema. Each document can have a different internal structure that the database interprets. So, unlike with key-value stores, the content stored in document databases can be queried and analyzed.

In some ways, document databases sit in between relational databases and key-value stores. They use the simple key-value semantics and loose requirements on data that key-value stores are known for, but they also provide the ability to impose a structure that you can use to query and operate on the data in the future.

The comparison with relational databases shouldn't be overstated, however. While document databases provide methods of structuring data within documents and operating on datasets based on those structures, the guarantees, relationships, and operations available are very different from relational databases.

Document databases are a good choice for rapid development because you can change the properties of the data you want to save at any point without altering existing structures or data. You only need to backfill records if you want to. Each document within the database stands on its own with its own system of organization. If you're still figuring out your data structure and your data is mainly composed discrete entries that don't include a lot of cross references, a document database might be a good place to start. Be careful, however, as the extra flexibility means that you are responsible for maintaining the consistency and structure of your data, which can be extremely challenging.

Examples:

- [MongoDB](https://www.mongodb.com)
- [RethinkDB](https://rethinkdb.com)

#### Graph databases: mapping relationships by focusing on how connections between data are meaningful

**Rise in popularity: 2000s**

[Graph databases](https://www.prisma.io/dataguide/intro/database-glossary#graph-database) are a type of NoSQL database that takes a different approach to establishing relationships between data. Rather than mapping relationships with tables and foreign keys, graph databases establish connections using the concepts of _nodes_, _edges_, and _properties_.

![Diagram of a graph database structure](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/intro/database-type-comparison/graph.png)

Graph databases represents data as individual nodes which can have any number of properties associated with them. Between these nodes, edges (also called relationships) are established to represent different types of connections. In this way, the database encodes information about the data items within the nodes and information about their relationship in the edges that connect the nodes.

At a glance, graph databases appear similar to earlier network databases. Both types focus on the connections between items and allow for explicit mapping of relationships between different types of data. However, network databases require step-by-step traversal to travel between items and are limited in the types of relationships they can represent.

Graph databases are most useful when working with data where the relationships or connections are highly important. It is essential to understand that when talking about relational databases, the word "relational" refers to the ability to tie information in different tables together. On the other hand, with graph databases, the primary purpose is defining and managing relationships themselves.

For example, querying for the connection between two users of a social media site in a relational database is likely to require multiple table joins and therefore be rather resource intensive. This same query would be straightforward in a graph database that directly maps connections. The focus of graph databases is to make working this type of data intuitive and powerful.

- [Neo4j](https://neo4j.com)
- [JanusGraph](https://janusgraph.org)
- [Dgraph](https://dgraph.io)

#### Column-family databases: databases with flexible columns to bridge the gap between relational and document databases

**Rise in popularity: 2000s**

[Column-family databases](https://www.prisma.io/dataguide/intro/database-glossary#wide-column-store), also called non-relational column stores, wide-column databases, or simply column databases, are perhaps the NoSQL type that, on the surface, looks most similar to relational databases. Like relational databases, wide-column databases store data using concepts like rows and columns. However, in wide-column databases, the association between these elements is very different from how relational databases use them.

In relational databases, a schema defines the column layout in a table by specifying what columns the table will have, their respective data types, and other criteria. All of the rows in a table must conform to this fixed schema.

Instead of tables, column-family databases have structures called [_column families_](https://www.prisma.io/dataguide/intro/database-glossary#column-family). Column families contain rows of data, each of which define their own format. A row is composed of a unique row identifier — used to locate the row — followed by sets of column names and values.

With this design, each row in a column family defines its own schema. That schema can be easily modified because it only affects that single row of data. Each row can have different numbers of columns with different types of data. Sometimes it helps to think of column family databases as key-value databases where each key (row identifier) returns a dictionary of arbitrary attributes and their values (the column names and their values).

![Diagram of column-family database structure](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/intro/database-type-comparison/column.png)

[comment]: # ' ``` '
[comment]: # ' @startuml '
[comment]: # ' package "Column family: Fruit" { '
[comment]: # '   package "Keys" { '
[comment]: # '     together { '
[comment]: # '       apple -[hidden]- grape '
[comment]: # '       grape -[hidden]- banana '
[comment]: # '     } '
[comment]: # '   } '
[comment]: # ( '  package "Columns" { )
[comment]: # '   together { '
[comment]: # '     together { '
[comment]: # '       apple - [color\\n---\\nred] '
[comment]: # '       [color\\n---\\nred] - [price\\n---\\n1] '
[comment]: # '       [price\\n---\\n1] - [On sale\\n---\\nfalse] '
[comment]: # '     } '
[comment]: # '     together { '
[comment]: # '       banana - [color\\n---\\nyellow] '
[comment]: # '       [color\\n---\\nyellow] - [ripe\\n---\\ntrue] '
[comment]: # '       [ripe\\n---\\ntrue] - [number per bunch\\n---\\n6] '
[comment]: # '     } '
[comment]: # '     together { '
[comment]: # '       grape - [color\\n---\\ngreen] '
[comment]: # '       [color\\n---\\ngreen] - [price\\n---\\n3] '
[comment]: # '       [price\\n---\\n3] - [number per bunch\\n---\\n40] '
[comment]: # '       [number per bunch\\n---\\n40] - [imported\\n---\\ntrue] '
[comment]: # '     } '
[comment]: # " '  } "
[comment]: # '   [color\\n---\\nred] -[hidden]- [color\\n---\\ngreen] '
[comment]: # '   [color\\n---\\ngreen] -[hidden]- [color\\n---\\nyellow] '
[comment]: # '   Keys -[hidden]- [color\\n---\\nred] '
[comment]: # " '  Keys -[hidden]- Columns "
[comment]: # ' } '
[comment]: # ' @enduml '
[comment]: # ' ``` '

Column-family databases are good when working with applications that require great performance for row-based operations and high scalability. Since all of the data and metadata for an entry is accessible with a single row identifier, no computationally expensive joins are required to find and pull the information. The database system also typically makes sure all of the data in a row is collocated on the same machine in a cluster, simplifying data sharding and scaling.

However, column-family databases do not work well in all scenarios. If you have highly relational data that requires joins, this is not the right type of database for your application. Column-family databases are firmly oriented around row-based operations. This means that aggregate queries like summing, averaging, and other analytics-oriented processes can be difficult or impossible. This can have a great impact on how you design your applications and what types of usage patterns you can use.

Examples:

- [Cassandra](https://cassandra.apache.org/)
- [HBase](https://hbase.apache.org)

#### Time series databases: tracking value changes over time

**Rise in popularity: 2010s**

_Time series databases_ are data stores that focus on collecting and managing values that change over time. Although sometimes considered a subset of other database types, like key-value stores, time series databases are prevalent and unique enough to warrant their own consideration.

Many time series databases are organized into structures that record the values for a single item over time. For example, a table or similar structure could be created to track CPU temperature. Inside, each value would consist of a timestamp and a temperature value to map what the temperature was at specific points in time.

![Single metric time series databases](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/intro/database-type-comparison/time-series-single-metric.png)

[comment]: # ' ``` '
[comment]: # ' @startuml '
[comment]: # " ' hide the spot "
[comment]: # ' hide circle '
[comment]: # ' hide empty members '
[comment]: # ' entity "**Time:                                    CPU Temp**" { '
[comment]: # '   2019-10-31T03:48:05+00:00                   37 '
[comment]: # '   2019-10-31T03:48:10+00:00                   42 '
[comment]: # '   2019-10-31T03:48:15+00:00                   33 '
[comment]: # '   2019-10-31T03:48:20+00:00                   34 '
[comment]: # '   2019-10-31T03:48:25+00:00                   40 '
[comment]: # '   2019-10-31T03:48:30+00:00                   42 '
[comment]: # '   2019-10-31T03:48:35+00:00                   41 '
[comment]: # ' } '
[comment]: # ' @enduml '
[comment]: # ' ``` '

Other implementations use timestamps as keys to store values for multiple metrics or columns at once. For instance, these structures would allow you to store and retrieve the values for CPU temperature, system load, and memory usage using a single timestamp.

![Multi-metric time series databases](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/intro/database-type-comparison/time-series-multi-metric.png)

[comment]: # ' ``` '
[comment]: # ' @startuml '
[comment]: # " ' hide the spot "
[comment]: # ' hide circle '
[comment]: # ' hide empty members '
[comment]: # ' entity "**Time                                     CPU Temp    System Load    Memory Usage %**" { '
[comment]: # '   2019-10-31T03:48:05+00:00                   37                    0.85                               92 '
[comment]: # '   2019-10-31T03:48:10+00:00                   42                    0.87                               90 '
[comment]: # '   2019-10-31T03:48:15+00:00                   33                    0.74                               87 '
[comment]: # '   2019-10-31T03:48:20+00:00                   34                    0.72                               77 '
[comment]: # '   2019-10-31T03:48:25+00:00                   40                    0.88                               81 '
[comment]: # '   2019-10-31T03:48:30+00:00                   42                    0.89                               82 '
[comment]: # '   2019-10-31T03:48:35+00:00                   41                    0.88                               82 '
[comment]: # ' } '
[comment]: # ' @enduml '
[comment]: # ' ``` '

In terms of read and write characteristics, time series databases are heavily write oriented. They are designed to handle a constant influx of incoming data. In general, time series databases work with regular, consistent streams of data without many spikes, which makes it simpler to plan around than some other types of data. Performance often depends on the number of items being tracked, the polling interval between recording new values, and the actual data payload that needs to be saved.

Time series databases are typically append-only by nature. Each incoming piece of data is stored as a new value associated with the current point in time. Values already present in the database are usually not modified after ingestion. Since the most valuable data is often the most recent, sometimes older values are aggregated, down sampled, and otherwise summarized at a lower resolution to keep the size of the dataset manageable.

Time series databases are often used to store monitoring or system performance information. This makes them an ideal option for managing infrastructure, especially IoT (internet of things) environments which generate a lot of data. Any monitoring or alerting system that you might use to keep an eye on your deployment environments will likely use some type of time series database.

Examples:

- [OpenTSDB](http://opentsdb.net/)
- [Prometheus](https://prometheus.io/)
- [InfluxDB](https://www.influxdata.com/products/influxdb-overview/)
- [TimescaleDB](https://github.com/timescale/timescaledb)

### NewSQL databases: bringing modern scalability and performance to the traditional relational pattern

**Rise in popularity: 2010s**

NoSQL databases are great options for situations where your data does not fit neatly into the relational pattern. Since they were developed more recently, NoSQL systems tend to be designed with scalability and modern performance requirements in mind.

However, until recently, no solution existed to easily _scale_ relational data. To address this need, a new type of relational databases called [NewSQL databases](https://www.prisma.io/dataguide/intro/database-glossary#newsql) were developed.

NewSQL databases follow the relational structure and semantics, but are built using more modern, scalable designs. The goal is to offer greater scalability than relational databases and greater _consistency guarantees_ than NoSQL alternatives. They achieve this by sacrificing certain amounts of availability in the event of a networking partition. The trade offs between consistency and availability is a fundamental problem of distributed databases described by the [_CAP theorem_](https://www.prisma.io/dataguide/intro/database-glossary#cap-theorem).

> **Definition: CAP Theorem**
>
> The CAP theorem is a statement about the trade offs that distributed databases must make between availability and consistency. It asserts that in the event of a network partition, a distributed database can choose either to remain available or remain consistent, but it cannot do both. Cluster members in a partitioned network can continue operating, leading to at least temporary inconsistency. Alternatively, at least some of the disconnected members must refuse to alter their data during the partition to ensure data consistency.

To address the availability concern, new architectures were developed to minimize the impact of partitions. For instance, splitting data sets into smaller ranges called [_shards_](https://www.prisma.io/dataguide/intro/database-glossary#shard) can minimize the amount of data that is unavailable during partitions. Furthermore, mechanisms to automatically alter the roles of various cluster members based on network conditions allow them to regain availability quickly.

Because of these qualities, NewSQL databases are best suited for use cases with high volumes of relational data in distributed, cloud-like environments.

While NewSQL databases offer most of the familiar features of conventional relational databases, there are some important differences that prevent it from being a one-to-one replacement. NewSQL systems are typically less flexible and generalized than their more conventional relational counterparts. They also usually only offer a subset of full SQL and relational features, which means that they might not be able to handle certain kinds of usage. Many NewSQL implementations also store a large part of or their entire dataset in the computer's main memory. This improves performance at the cost of greater risk to unpersisted changes.

NewSQL databases are a good fit for relational datasets that require scaling beyond what conventional relational databases can offer. Because they implement the relational abstraction and provide SQL interfaces, transitioning to a NewSQL database is often more straightforward than moving to a NoSQL alternative. However, it's important to keep in mind that although they mostly seek to replicate the conventional relational environments, there are differences that may affect your deployments. Be sure to research these differences and identify situations where the resemblance breaks down.

Examples:

- [MemSQL](https://www.memsql.com)
- [VoltDB](https://www.voltdb.com)
- [Spanner](<https://en.wikipedia.org/wiki/Spanner_(database)>)
- [Calvin](https://blog.acolyer.org/2019/03/29/calvin-fast-distributed-transactions-for-partitioned-database-systems/)
- [CockroachDB](https://www.cockroachlabs.com)
- [FaunaDB](https://fauna.com)
- [yugabyteDB](https://www.yugabyte.com)
- [PlanetScale](https://planetscale.com)

### Multi-model databases: combining the characteristics of more than one type of database

**Rise in popularity: 2010s**

Multi-model databases are databases that combine the functionality of more than one type of database. The benefits of this approach are clear — the same system can use different representations for different types of data.

Collocating the data from multiple database types in the same system allows for novel operations that would be difficult or impossible otherwise. For instance, multi-model databases may allow users to access and manipulate data stored in different database types within a single query. Multi-model databases also help maintain data consistency, which can be a problem when performing operations that modify data in many systems at once.

In terms of management, multi-model databases help lighten the operational footprint of your database systems. Having a multi-functional system allows you to change or expand to new models as your needs change without changes to the underlying infrastructure or the overhead of learning a new system.

It's difficult to talk about the characteristics of multi-model databases as a set category, as they mostly inherit the advantages of the database types they choose to support. It's important to keep in mind that you should evaluate how well individual implementations support the specific database types you require. Some systems may support multiple models, but with unequal feature sets or with important caveats.

- [ArangoDB](https://www.arangodb.com/)
- [OrientDB](https://orientdb.org/)
- [Couchbase](https://www.couchbase.com)

### Other database types

Although this guide doesn't cover these in depth, it is worth at least being familiar with some of the other database types available. The following database types deserve a mention, but they are often used less frequently or in niche environments:

- **Column-oriented databases:** Not to be confused with column-family databases, [column-oriented databases](https://www.prisma.io/dataguide/intro/database-glossary#column-database) are very similar to relational databases, but store data on disk by column instead of by row. This means that all of the data for a single column is together, allowing for faster aggregation on larger data sets. Since the columns are separate from each other, inserting or updating values is a performance intensive task, so column-oriented databases are primarily used for analytical work where entire data sets can be preloaded at one time.
- **Semantic RDF graph databases:** Semantic RDF graph databases are databases that map objects using the Resource Description Framework. This framework a way to describe, in detail, objects and their relationships by categorizing pieces of data and connections. The idea is to map subjects, actions, and objects like you would in a sentence (for example, "Bill calls Sue"). For most use cases, labeled property graphs, usually just called [graph databases](#graph-databases-mapping-relationships-by-focusing-on-how-connections-between-data-are-meaningful), can express relationships more flexibly and concisely.
- **Object-oriented databases:** Object-oriented databases store data items as objects, seeking to bridge the gap between the representations used by objected-oriented programming languages and databases. Although this solves many problems with translating between different data paradigms, historically, adoption has suffered due to increased complexity, lack of standardization, and difficulty decoupling the data from the original application.

### Conclusion

Database types have changed a lot since their initial introduction and new database ideas are actively being developed today. Each of the types used in modern systems have distinct advantages that are worth exploring given the right access patterns, data properties, and requirements. One of the first and most important decisions when starting a new project is evaluating your needs and finding the type that matches your project's demands.

Many times, using a mixture of different database types is the best approach for handling the data of your projects. Your applications and services will influence the type of data being generated as well as the features and access patterns you require. For example, user information for your system might fit best in a relational database, while the configuration values for your services might benefit from an in-memory key-value store. Learning what each type of database offers can help you recognize which systems are best for all of your different types of data.

You can use Prisma to work more easily with databases from within your application code. Check out the [supported databases page](https://www.prisma.io/docs/orm/supported-databases) to see all of the databases Prisma ORM supports.

## Database schemas

> **Source:** [Database schemas](https://github.com/prisma/dataguide/blob/main/content/01-intro/03-intro-to-schemas.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

One of the primary advantages of databases over other, more simple data storage options is their ability to store information in an orderly, easily queryable structure. These features are derived from the fact that databases implement _schemas_ to describe the data they store.

A [database schema](https://www.prisma.io/dataguide/intro/database-glossary#schema) serves as a blueprint for the shape and format of data within a database. For relational databases, this includes describing categories of data and their connections through tables, primary keys, data types, indexes, and other objects. With NoSQL schemas, this often involves organizing data according to the most important anticipated query patterns.

In either case, understanding the value of your database's schema and how best to design and optimize it for your needs is crucial. This guide will focus on what database schemas are, the different types of schema you might encounter, why they're important, and what to keep in mind when designing your own schemas.

### Why are database schemas important?

Database schemas are important for many reasons.

Your data will almost always include some regularity to it, regardless of its source or application. Some data is highly _regular_, meaning that it all can be described by the same patterns. Some data is much more _irregular_, but even so, its _metadata_, contextual data about the data itself, will often still be regular.

Database schemas tell the database what your data is and how to work with it. Database schemas help the database engine understand these patterns which allows it to enforce constraints on the data, respond with the right information when queried, and manipulate it in ways that users request.

Good schemas tend to reduce implicit information in favor of making it visible to the system and its users. Schemas in relational databases can reduce information redundancy, ensure data consistency, and provide the scaffolding and structures needed to access and join related data. Within non-relational contexts, good schemas enable high performance and scalability by aligning the storage format with the access patterns that are essential to your application.

### Defining physical vs logical schemas

Before we further, we should introduce a few definitions. Two terms that are potentially confusing are _physical schema_ and _logical schema_. These two terms can convey different meanings depending on the _context_ in which they are used.

For the purpose of this article, we are mainly talking about logical and physical schemas when _designing database schemas_.

#### When designing database schemas

When talking about designing database schemas, a **logical schema** is a general design for organizing data into different categories, defining properties of the data, and determining the best structure for database items. This general document has no implementation details and is therefore platform-agnostic. It can be taken as a blueprint and implemented in a variety of database systems.

In this same context, a **physical schema** is recognized as being the next step in the design process where implementation-specific details are worked out. The names of different entities, constraints, keys, indexes, and other items are identified and mapped onto the logical schema. This provides a specific plan for implementation using a given database platform.

In this context, logical and physical schemas are different stages of a design process. The goal of the process is to iteratively develop an implementation plan from a set of requirements by first laying out the abstract qualities of the data and then later mapping that organization to the tool set and language of a database system you want to use.

#### When discussing database architecture

The other context where physical and logical schema are sometimes seen in regards to databases is in the physical and virtual architecture of the actual database software.

In this context, the **logical schema** refers to the visible database entities that users interact with. This means objects like tables, keys, views, and indexes are abstractions that users create and manipulate using the database software. The layout of these items within the system are part of the logical schema that the database presents.

In this same context, the **physical schema** refers to the way that the database software handles the data, files, and storage when interacting with the filesystem. For example, the physical schema of the database architecture can determine whether the system stores a separate file for each database or each table and determines how those can be partitioned across multiple servers.

### Static vs dynamic schemas

Another important categorization that can help clarify the differences between schema in relational and non-relational databases is the difference between static and dynamic schemas.

**Static schemas** are the type of schemas generally associated with relational databases. They are defined ahead of time as a definition of the shape that data must follow to be accepted by the system. The database system has the ability to enforce these patterns when using static schema because static schema is an assertion of the desired state that the database system can validate input against.

In contrast, **dynamic schemas** are much more prevalent in non-relational contexts. Dynamic schemas are less rigid and might lack _any_ preconceived organizational structure. Instead, dynamic schemas _emerge_ based on the qualities of the data that is entered into the system. While many non-relational databases can store information with an arbitrary internal structure, regular patterns tend to emerge with most real world use cases.

Because dynamic schemas are emergent structures, the database system cannot use them as a conformance tool. However, they are still incredibly important to understand and develop around as a user. Understanding what your data will look like in a general sense and how your applications will need to interact with it will help you choose structures that fulfill your requirements, perform well, and avoid unnecessary inconsistency.

### Designing database schemas

Now that you understand some of the different types of database schemas, how do you go about designing one for your project? Designing effective schemas takes thought and practice, as well as a thorough understanding of the problem domain and the systems that will use the data.

The design process looks quite different depending on the type of database you are designing the schema for. Specifically, the design process for static schemas differs from that of dynamic schemas. Practically speaking, these end up aligning to differences between designing for relational databases (static) and non-relational databases (dynamic).

#### General tips

Although there are differences between schema design for relational and non-relational databases, there are some _general_ tips that are applicable with any schema development. Since many of these are important to the beginning of the design process, it makes sense to discuss these first.

##### Learn about your data

One of the first steps in designing schemas should always be to learn about your data and domain. It is impossible to develop a good database design without understanding the information it will manage and context in which it will be used.

While you will likely not know all of the features of your data in the beginning, learning as much as you can about the data that your system is expected to manage is essential for design.

Some questions you should try to answer include:

- Broadly speaking, what will the data be?
- Which attributes are important to record?
- How large will your total dataset be?
- How rapidly will the system accumulate new data?
- Will your data be highly regular?

##### Understand usage patterns

Similarly, designing a database schema without understanding user requirements is as problematic as it is with other software design. If you are not an expert in the domain in which the data will be used, you need to consult someone who is to guide you on the requirements.

You should ask yourself questions like:

- Are the most common queries predictable?
- How many concurrent users or clients will there be?
- How much data will be touched by typical operations and queries?
- Will the majority of requests be read queries or write queries?
- What data will be queried together regularly?
- Do most operations target individual records or aggregate many records?

##### Develop a naming convention

While it might not seem important, designing a naming convention and following it rigorously will help during both development and regular usage.

Naming and styling conventions help minimize the amount of mental work you need to perform when naming new entities. Similarly, conventions allow users to safely assume a pattern when accessing different items within your schemas. Some database systems or types of databases already have popular naming conventions, which you can follow to avoid surprises and avoid the need to develop your own standards.

Some style and naming conventions you might want to consider:

- How should you use upper and lowercase lettering for systems that are case-sensitive?
- When should items use the plural of a word versus the singular?
- Should multi-word names separate words with underscores, dashes, or other delimiters?
- Should full names always be used or are abbreviations permissible in some cases?

#### Designing schemas for relational databases

Relational databases are often considered flexible, general purpose solutions. Their ability to process ad-hoc queries allows the same database to serve different applications and use cases. Because of this, when designing schemas for relational databases, your end goal is usually to represent your data in a way that promotes flexibility while minimizing the opportunity for data inconsistencies to enter the system.

##### Developing a logical schema

Relational schema designs often start with a logical schema, as discussed in a [previous section](#when-designing-database-schemas).

You map out the data items you want to manage, their relationships, and any attributes important to consider without regard to implementation details or performance criteria. This step is important because it collects all of your data items in one place and allows you to sort through the way they relate to one another on an abstract level.

You can begin sketching out tables that represent specific data items and their attributes. This mapping process is often best represented by [entity-relationship (or ER) models](https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model). _ER models_ are diagrams that visually represent data objects by defining item types and their attributes and then connecting these to map out relationships and dependencies.

ER models are frequently used in early stage schema designs because they are very good at helping you figure out what distinct entities you have, what attributes must be managed, which entities are related to one another, and the specific nature of their relationship. Using ER model diagrams to represent your logical schema gives you a solid plan for _what_ you want your database design to be without commenting on implementation-specific details.

##### Developing a physical schema

Once you have a logical schema, your next step is to figure out specific implementation details by creating a physical schema (as discussed in a [previous section](#when-designing-database-schemas)). The physical schema will determine exactly how you want to commit your plan using the database structures and features available to you.

The first step is often to go through each of your database entities and determine your primary key field. The [primary key](https://www.prisma.io/dataguide/intro/database-glossary#primary-key) is used to uniquely identify each record within a table as well to bind records together from different tables. When a relationship exists between two entities in the logical schema, you will have to connect the two tables in the physical schema by referencing the primary key in one table as a foreign key in the other. The direction of this relationship will impact the performance and ease in which you can join different entities together when using your database.

Another consideration you will want to think through during this stage are the predicted query patterns. Certain tables and fields within these tables will be accessed much more frequently than others. These "hot spots" are good candidates for database indexes. [Database indexes](https://www.prisma.io/dataguide/intro/database-glossary#index) significantly speed up retrieval of commonly accessed items at the cost of worse performance during data updates. Determining which columns to index initially will help you balance these concerns and define the most critical places for indexes in your system.

##### Normalizing your data structures

During this process, you might find that it's easier to extract certain elements from logical entities into their own independent tables. For instance, you may wish to extract shipping address from a customer so that multiple shipping addresses can be associated with a single customer and so that product orders can reference a specific address. These changes can be thought of as part of a process is called [normalization](https://en.wikipedia.org/wiki/Database_normalization).

[**Database normalization**](https://www.prisma.io/dataguide/intro/database-glossary#normalization) is a process that ensures that your database represents each piece of data once and doesn't allow updates that would result in inconsistencies. Normalization is a huge topic that, for the most part, is outside of the scope of this guide, but you part of the physical schema design process involves figuring out the level of normalization to seek and transforming data entities as necessary to achieve that goal.

#### Designing schemas for non-relational and NoSQL databases

The design process for non-relational databases often looks quite different. A large part of this difference stems from the fact that often, non-relational databases are chosen to allow for high performance on a limited number of predefined queries.

##### Determining your primary queries

Non-relational database schemas are often designed in tandem with the application that will use them. The schema reflects the specific needs of the application and, in a sense, is a custom structure designed to fit the mold developed by the application.

Because of this close relationship, it is important to determine what queries your database must be optimized to respond to. The first step is figuring out what queries your database will need to run. Since you don't have a data structure yet, these will be pseudo queries, but understanding what data your application will need to perform certain operations is your first objective.

Once you have a good idea of what queries your application will need to perform, you need to select the most important ones to focus on. These are the queries that your application performs often and cannot afford to wait for.

Defining which of your queries are the most important tells you the exact access pattern your data structure needs to optimize around. The way that the database system stores and represents data will have a huge impact on its ability to quickly retrieve and manipulate data items.

##### Design your initial schema around your primary queries

Now that you know your most essential access patterns, you can start to develop a schema to match these queries.

Your first step in this process will be to determine the exact information required to be returned by each query. Then, map out what it would look like to store all of the information to respond to a query in a single entity.

For instance, if your application will be querying your database to retrieve user profile information, your starting point should likely be to assume that all of the users profile information can be stored in a single place.

##### Combine and deduplicate data entities where possible

After you've determined the attributes that are needed and mapped out what it would look like to store all items related to each query in a single entity, check for overlaps. The idea is to consolidate data entities where possible to reduce the number of separate items your system will maintain. The greater number of distinct entity types you maintain, the greater chance for inconsistency and update performance problems to arise.

Some of these overlaps will be fairly obvious. Cases where one query returns a subset of the attributes that another query does can be safely collapsed into a single entity.

Other times, it may be more difficult to determine how to map the information for your queries. Non-relational databases are often not great at coalescing data from multiple entities in a single query, something relational databases excel at through joins. So when certain attributes or entities are present in multiple queries, you may have to make a choice in how best to represent that data.

##### Determine where your application can fill in the gaps

For some queries, your application may need to do part of the work of assembling data instead of relying on the database to respond with all of the relevant information in a single query. For example, if you need to handle customer information and their associated orders, it might make sense to store orders in a different category and reference them by ID in your customer objects.

Some database systems cannot easily join this information by following the references between your objects. Instead, your application may need to query the customer first and then make additional queries for each of the related orders using the order IDs you discovered.

Performing these operations in your application code can help work around the limitations of some non-relational databases. This is often a better option than attempting to maintain a great deal of information within a single entry or attempting to duplicate data many times for many different types of database objects. Those options could result in very poor performance and data consistency.

That being said, it will be important to test and tune your application code and database schemas once they are both online to ensure that you are not trading good application performance for fast database operations. A good rule of thumb is to use the database's capabilities whenever possible since they are highly optimized for information retrieval and manipulation and to supplement within your application as required.

##### Determine appropriate partition keys

For highly scalable, non-relational databases, users often have to determine a partition or sharding key. These keys will be used to split datasets among various servers to improve performance and responsiveness.

Finding the right partition keys is highly dependent on your data and your workloads. Some general rules, however, can help guide you.

It is best to try to choose a partition key that has a fairly regular distribution of keys. For instance, if you need to distribute customer data, their birth month would typically lead to a decent distribution. In contrast, if you are selling winter clothing, sign up month would not be a good partition key since your products' seasonality would likely affect the distribution of keys. Applying a hashing algorithm to your candidate data can also sometimes help to distribute your key space more evenly.

Another consideration is whether your workloads are read or write heavy. If you have a read-heavy application, you likely want to choose a partition key that will allow you to write as much related data to a single server as possible. This will help you avoid having to read from many servers each time you need to retrieve related data.

On the other hand, if you have write-heavy workloads, it is often preferable to spread the writes over as many servers as possible. If each request ends up writing data to the same server, you will not gain much performance for write-intensive operations.

### Wrapping up

Designing effective database schemas takes patience, practice, and often a lot of trial and error.

To start, you have to try to develop a good idea of what your data will look like, how your applications will use it, and what usability and data integrity requirements are required. Afterwards, your goal is to develop a schema that reflects your data's specific features and facilitates the type of use cases you anticipate.

Schema design, like any other type of design, is an iterative process. Expect to change your design as your understanding of the problem space deepens and as real world performance data becomes available. While you may have to evolve your schema over time, starting off with a solid foundation will both aid you in this process and reduce the likelihood of dramatic, disruptive schema changes in the future.

Prisma defines the characteristics of its data as [models](https://www.prisma.io/docs/orm/data-modeling?db=postgresql#models) in its [data contract](https://www.prisma.io/docs/orm/contract-authoring/the-data-contract), the file that Prisma ORM 7 called the Prisma schema. Check out the linked documentation to learn more about how these concepts apply to Prisma.

You might also want to take a look at the [Prisma schema language page](https://www.prisma.io/docs/orm/contract-authoring/psl-syntax?db=postgresql) to get an overview of how to use the various features.

## Tables, tuples and types

> **Source:** [Tables, tuples and types](https://github.com/prisma/dataguide/blob/main/content/02-datamodeling/04-tables-tuples-types.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

Calling tables the "basic building block" of relational databases is a little reductive. While it's hard to miss the mark by much in drawing up a list of each datum you're interested in and declaring this an integer, that a date, and so forth, effective relational database design depends first and foremost on well-thought-out and well-formulated table designs. Tables must be legible to users and developers, with their schemas making sense out of the information they represent. And while databases go to considerable lengths to handle physical storage unsupervised, understanding how this process works and designing for it is especially important for "wide" tables with records containing many large values.

One table generally, but not always, groups aspects of a single concept: a person's name and password, a hotel reservation's check-in and check-out dates, or a shipment's source, destination, status, and tracking number. The art and science of determining where one table should leave off and another pick up is called _normalization_, which we'll cover in a future installment.

_Ineffective_ table designs come in myriad forms. They may fail to capture important characteristics of the subject the table represents, restrict too far or not enough what values are considered valid in a <note>Also "attribute", most often in database internals.</note><text>column</text> or record, "split the datum" across multiple columns, or combine or concatenate aspects which are treated separately outside the database. Even tables with no major omissions or structural faults can have problems with confusing, misleading, or outdated column names.

### Naming things

<details>
<summary>Is one of the two hardest problems of computer science, along with cache invalidation and off-by-one errors. It's about the first computer science joke anyone learns, but it's no less true for that: coming up with meaningful and preferably short names is tough. And it's important to get them as right as possible up front, since changing a table or column name later will require changes in any other system that uses that table or column. A thesaurus is a useful but unreliable ally.</summary>

Opinions about how to approach [the nuts and bolts](https://www.sqlstyle.guide/#naming-conventions) of naming [in a database](https://launchbylunch.com/posts/2014/Feb/16/sql-naming-conventions/) are a [dime a dozen](https://www.red-gate.com/simple-talk/blogs/sql-naming-conventions/). No two people agree on all points, and one's allegiance to singular or plural table names (or, for that matter, uppercasing or lowercasing keywords) is largely a function of habit. RDBMS flavor also plays a role, with PostgreSQL heavily favoring `snake_case` names while `UpperCamelCase` is a telltale sign of SQL Server.

For my part, I use `snake_case`, prefix booleans with `is_` and suffix dates with `_at`, use plural for tables and singular for columns, and name junction tables `leader_followers`. But as any guide worth listening to will tell you: the single most important thing isn't that you do what I do, it's that you be consistent, either with your own preferences or with the conventions of an existing database you're working in.

</details>

### Storage: making records out of ones and zeroes

Modern RDBMSs abstract most of the intricate details of how data are arranged and stored, most of the time. The basic unit of storage is the _page_, a uniformly-sized logical block of records and metadata corresponding to a segment of physical storage space: 2kb in Oracle, 4 in DB2, 8 in SQL Server and PostgreSQL, 16 with MySQL's InnoDB. When the database reads or writes data, it does so page by page rather than record by record.

![Layout of metadata and multiple rows on a database page.](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/modeling/pages.png)

It's possible for a <note>The "tupple", "toople", and "tyoople" camps are eternally at, if not war, at least polite sparring in comment sections around the internet. CJ Date, an early authority on relational databases, gives the first ("rhymes with couple").</note><text>_tuple_</text>, i.e. the attribute-value pairs representing a given record or row, to exceed the available space in a page less the metadata. Only Oracle and SQL Server can distribute a single tuple across multiple pages, while MySQL and DB2 make page size configurable. PostgreSQL allows configuration of page size only at compile time, but uses ["The Oversized Attribute Storage Technique" or TOAST](https://wiki.postgresql.org/wiki/TOAST) to move long values off-page and record pointers in their place.

All these techniques incur a performance cost, since SQL statements are faster the fewer pages have to be read or written, or pointers followed. But there's another way ineffective allocation of pages can hurt performance: when most or all of a table's tuples take up just over half a page, the remaining space goes unused. Because it's still allocated, it bloats the table's disk usage, and a query that retrieves or affects _n_ rows must load all _n_ pages.

Most enterprise relational databases, Postgres excepted, also manage pages in groups called _extents_ and group extents in turn under _segments_. This more complicated strategy helps keep rows in order, which can speed up searches. Postgres has its own tricks here, such as using [visibility maps](https://www.postgresql.org/docs/current/storage-vm.html) to support "[index-only queries](https://www.postgresql.org/docs/current/indexes-index-only-scans.html)" which skip looking at the table's pages entirely. Indexes themselves are also stored in pages, although these have their own organization.

The chief innovation of column-oriented databases like Cassandra and HBase is in abandoning the tuple-by-tuple physical page layout to speed up retrieval of huge amounts of data column by column. This is by no means a free lunch, however, as many basic RDBMS capabilities depend on tuples in themselves.

### Data types

Types serve multiple purposes for relational databases. Like types anywhere else, they establish a contract: `books.title` is text and always text, `recipients.postcode` is a number and always a number -- which latter assumption fails the moment a recipient lives in the UK, Canada, or any of several other countries (postcodes are properly text).

But equally important to an RDBMS is that types define sizes, and therefore determine page layout. The SQL standard defines an integer as four bytes, whether a specific four bytes represents an undetermined value (`NULL`), zero, or two billion. Text declared as a `CHAR` of a fixed length _n_ always takes up _n_ bytes, and shorter values are padded with spaces until they're long enough. Sometimes the spaces are even returned in `SELECT`s, as in SQL Server.

Not all types define a fixed length, however. The standard `VARCHAR` type establishes a maximum length instead, and values are not padded in the manner of `CHAR`. Variable-length types mean variable-length tuples, which in turn allow the database more flexibility in fitting those tuples into pages.

In all, the SQL standard defines a multitude of types, classed into numeric, boolean, date and time, time intervals, text, binary, all the way up to XML and JSON. Faithful adherence to the standard varies, as usual, across implementations. Some add non-standard data types on top, with currency, geometry and geography, ranges, and more making appearances.

#### Choosing a data type

Defining the appropriate type for a datum is usually straightforward. If you're using PostgreSQL, care about exactitude, and have values running to eight decimal places, that rules out floating-point types and indicates the scale of the `NUMERIC` you'll need. Most other questions in this vein resolve similarly.

The major complication is text. The ISO-standard variable-length character type `VARCHAR` or the Unicode-enabled `NVARCHAR` in SQL Server suit most purposes, with the fixed-size `CHAR` relegated to specific cases of fixed-length strings; the harder decision is the appropriate length. Sometimes you get lucky, and the well-known, externally-imposed limits of SMS let you get away with restricting people to 140-byte posts for long enough they get used to it. But even Twitter's determination to keep the "micro" in "micro-blog" eventually relaxed somewhat, and meanwhile a twenty-byte `city_name` field is practically begging for someone from [Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch](https://www.youtube.com/watch?v=fHxO0UdpoxM) to turn up.

Space is cheap, unused space doesn't count with `VARCHAR`s, and most tables are unlikely even to get close to a single tuple per page. It's rarely worth haggling over length byte for byte instead of choosing a nice round number like the next order of magnitude (here, 100) or approximate power of 2 (255 is notably also a built-in limit in older database software) above the longest plausible value.

PostgreSQL is a special case: both `CHAR(n)` and `VARCHAR(n)` are recommended _against_, unless a length limit is specifically desired. Instead, the nonstandard `TEXT` type, powered by the [_varlena_ (**var**iable-**len**gth **a**rray)](http://varlena.com) data structure, offers unbounded text storage.

"Large object" types in most RDBMSs are a class of binary and text data types useful for such values as images and documents, which are frequently long enough to make on-page storage impractical. Reading from or writing to large object storage is an extra step on top of reading or writing the page, so inline storage remains preferable at the scale of names, serial numbers, and summaries. The binary sort are collectively referred to as `BLOB`s (**b**inary **l**arge **ob**ject) in most RDBMSs, although Postgres' sole varlena-enabled binary type is `BYTEA`. Large text types may go by `TEXT` or `CLOB`, or in SQL Server [`VARCHAR(MAX)`](https://docs.microsoft.com/en-us/sql/t-sql/data-types/char-and-varchar-transact-sql?view=sql-server-ver15).

It bears mentioning here that relational databases are not especially good at being file servers. Images, audio or video files, text documents, and the like are usually better off in systems designed to store and serve them. But where these data, unstructured as far as the database is concerned, are directly germane to specific records -- think binary test output files recorded for a mechanical part being tracked through manufacturing or the source code of web pages being scraped and analyzed -- large object types suffice.

#### Semi-structured data types

For most of the history of relational databases, substrings and the like have been the limit of delving into large objects, which are otherwise structurally opaque. What data types like `JSON` and `XML` ask is "what if they weren't?". Both JSON and XML documents are hierarchical, something earlier database designers had to break out the foreign keys and `JOIN`s to accommodate. Moreover, semi-structured types describe their own schemas. The only requirement the database can impose is that values be correctly formed, whatever their contents.

Hierarchies are not uncommon, even in information systems mostly operating by relational rules. An addressable, processable hierarchy-as-data-type makes storage and retrieval about as simple as possible, and allows blending relational and document strategies to good effect. A table that does little more than wrap a document field can even make a helpful prototyping tool in the especially early stages of defining the schema. And while SQL is unlikely ever to match e.g. JavaScript's facility with a format named after it, the functionality that exists around these types (hierarchic or otherwise) opens up a lot of possibilities for [database programming](https://www.prisma.io/dataguide/functional-units).

#### Collections and more

Some values are only meaningful in combination: a low and a high bound, a start and an end date, an ordered list of numbers or strings. [Ranges](https://tapoueh.org/blog/2018/04/postgresql-data-types-ranges/) can be simulated by decomposition into e.g. `started_at` and `ended_at` fields, and in strictly relational terms an [array](https://tapoueh.org/blog/2018/04/postgresql-data-types-arrays/) is properly normalized into a separate table with a foreign key, but the convenience of treating a range or an array as a single value to test containment, overlap, and other specialized operations can't be underestimated. Range types are thus far exclusive to PostgreSQL, and both Postgres and Oracle support arrays.

Another common case is for a column to represent one of a well-defined and relatively static set of values: status codes, continents, and the like. `CHAR` and `VARCHAR` take up a lot of redundant space used this way and must be carefully checked and constrained to prevent meaningless values from making it in; `INT` codes are safer, but always have to be looked up. Many programming languages offer readable names for numeric codes in the form of enumerations or `enum`s. PostgreSQL and MySQL both support these as column data types, albeit in slightly different ways, with MySQL's operating like constraints on individual columns while Postgres' enums are reusable.

#### Build your own

User-defined types in SQL Server or Oracle, composite types in PostgreSQL: they exist. A `POINT` type, for instance, can ensure that its x and y values are inseparable, and the possibilities of nesting tuples inside tuples rapidly get more complex. Dealing with custom data types isn't always easy, especially from outside the database, so defining data models in terms of built-in or extension-provided types is usually to be preferred.

### More than complete

A list of each datum you're interested in, this an integer, that a date, and so forth. Types and tuples, columns and rows, make a table functionally complete. But there's more than completeness to think about: how can a table ensure that the information it records is _correct_?

Coming up in [_Correctness and Constraints_](https://www.prisma.io/dataguide/correctness-constraints), we'll cover the tools relational databases use to define and enforce correctness at all levels of data storage.

If you want to learn more about what data modeling means in the context of Prisma, visit the [data modeling overview](https://www.prisma.io/docs/orm/data-modeling?db=postgresql) in the Prisma documentation.

You can also learn how to describe models in a Prisma contract (the file that Prisma ORM 7 called the schema) in the [models and fields](https://www.prisma.io/docs/orm/contract-authoring/psl-syntax?db=postgresql#models-and-fields) section of the Prisma documentation.

## Correctness and constraints

> **Source:** [Correctness and constraints](https://github.com/prisma/dataguide/blob/main/content/02-datamodeling/05-correctness-constraints.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

Storing data is one thing; storing meaningful, useful, _correct_ data is quite another. While meaning and utility are themselves [subjective](https://www.prisma.io/dataguide/know-your-problem-space) qualities, correctness at least can be logically defined and enforced. [Types](https://www.prisma.io/dataguide/tables-tuples-types) already ensure that numbers are numbers and dates are dates, but can't guarantee that weight or distance are positive numbers or prevent date ranges from overlapping. Tuple, table, and database constraints apply rules to data being stored and reject values or combinations of values which don't pass muster.

Constraints don't render other input validation techniques useless by any means, even when they test the same assertions. Time spent trying and failing to store invalid data is time wasted. Violation messaging, like `assert` in systems and application programming languages, only reveals the first problem with the first candidate record in much more detail than anyone not immediately involved with the database needs. But as far as the correctness of data is concerned, constraints are law, for good or ill; anything else is advice.

### On tuples: not null, default, and check

Non-null constraints are the simplest category. A tuple must have a value for the constrained attribute, or put another way, `NULL` is no longer one of the allowed values for the column. No value means no tuple: the insert or update is rejected.

Protecting against null values is as easy as declaring `column_name COLUMN_TYPE NOT NULL` in `CREATE TABLE` or `ADD COLUMN`. [Null values cause entire categories of problems](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/) between the database and end users, so reflexively defining non-null constraints on any column without a good reason to allow nulls is a good habit to get into.

The provision of a default value when an insert doesn't specify one is not always considered a constraint, since candidate records are modified and stored instead of rejected. In many DBMSs, [default values may be generated by a function](https://www.prisma.io/dataguide/functional-units#defaults-and-generation), although MySQL does not allow user-defined functions for this purpose.

A default is only used when it's asked for: the `INSERT` omits the column, or writes the `DEFAULT` keyword in its place. (An `UPDATE` leaves the columns it doesn't mention unchanged; `SET column_name = DEFAULT` resets one to its default.) An explicit `NULL` is not a request for the default. A nullable column stores the `NULL`, and a non-null column rejects it:

```sql
CREATE TABLE tickets (
  ticket_id INT PRIMARY KEY,
  priority VARCHAR(10) NOT NULL DEFAULT 'normal',
  assignee VARCHAR(20) DEFAULT 'triage'
);

-- 1. column omitted: the default is used
INSERT INTO tickets (ticket_id) VALUES (1);

-- 2. DEFAULT keyword: the default is used
INSERT INTO tickets (ticket_id, priority, assignee) VALUES (2, DEFAULT, DEFAULT);

-- 3. explicit NULL in a nullable column: NULL is stored
INSERT INTO tickets (ticket_id, assignee) VALUES (3, NULL);

-- 4. explicit NULL in a NOT NULL column: rejected
INSERT INTO tickets (ticket_id, priority) VALUES (4, NULL);
```

In PostgreSQL, the fourth insert fails. The failing row shows that the omitted `assignee` would have received its default, while `priority` kept the `NULL` it was given:

```text
ERROR:  null value in column "priority" of relation "tickets" violates not-null constraint
DETAIL:  Failing row contains (4, null, triage).
```

The other three rows are stored, and ticket 3's `assignee` is `NULL` rather than `'triage'` (psql displays `NULL` as an empty cell):

```sql
SELECT * FROM tickets ORDER BY ticket_id;
```

```text
 ticket_id | priority | assignee
-----------+----------+----------
         1 | normal   | triage
         2 | normal   | triage
         3 | normal   |
(3 rows)
```

MySQL 8.4 behaves the same way in its default strict mode, rejecting the fourth insert with error 1048, `Column 'priority' cannot be null`. With [strict mode](https://dev.mysql.com/doc/refman/8.4/en/sql-mode.html#sql-mode-strict) turned off, MySQL still rejects a single-row insert like this one, but a multi-row `INSERT` or an `UPDATE` that writes `NULL` to a non-null column only raises a warning and stores the data type's implicit default -- an empty string for `VARCHAR` -- instead of the column's declared default.

Validation rules that depend on the values within a single tuple can be implemented as `CHECK` constraints. In PostgreSQL, a check rejects **false**, but accepts **true or NULL**. For example, `CHECK (latitude BETWEEN -90 AND 90)` permits a missing latitude; add `NOT NULL` if a value is required. `CHECK (column_name IS NOT NULL)` also rejects nulls because `IS NOT NULL` returns false for NULL. See [PostgreSQL's constraint rules](https://www.postgresql.org/docs/18/ddl-constraints.html).

```sql
CREATE TABLE locations (
  latitude numeric CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric NOT NULL CHECK (longitude BETWEEN -180 AND 180)
);
INSERT INTO locations VALUES (NULL, 0);
```

```sql expected-failure sqlstate=23502
INSERT INTO locations VALUES (0, NULL);
```

### On tables: unique and exclusion

Table-level constraints test tuples against each other. In a unique constraint, only one record may have any given set of non-null values for the constrained columns. By default, PostgreSQL treats nulls as distinct for uniqueness, so a unique constraint on `(batman, robin)` permits repeated values when `robin` is NULL. PostgreSQL 15 and later also support `NULLS NOT DISTINCT` to treat nulls as equal for this purpose. Other engines have their own rules; check the engine's documentation.

```sql
CREATE TABLE default_pairs (batman text, robin text, UNIQUE (batman, robin));
INSERT INTO default_pairs VALUES ('Bruce', NULL), ('Bruce', NULL);
CREATE TABLE strict_pairs (batman text, robin text, UNIQUE NULLS NOT DISTINCT (batman, robin));
INSERT INTO strict_pairs VALUES ('Bruce', NULL);
```

```sql expected-failure sqlstate=23505
INSERT INTO strict_pairs VALUES ('Bruce', NULL);
```

Exclusion constraints, which PostgreSQL supports with `EXCLUDE`, fill a very useful niche: they can prevent overlaps. Specify the constrained fields and the operations by which each will be evaluated, and a new record will only be accepted if no existing record compares successfully with each field and operation. For instance, a `schedules` table can be configured to reject conflicts:

```sql

-- text, int, etc. comparisons in exclusion constraints require this
-- Postgres extension
CREATE EXTENSION btree_gist;

CREATE TABLE schedules (
  schedule_id SERIAL NOT NULL PRIMARY KEY,
  room_number TEXT NOT NULL,
  -- a range of TIMESTAMP WITH TIME ZONE provides both start and end
  duration TSTZRANGE,
  -- table-level constraints imply an index, since otherwise they'd
  -- have to search the entire table to validate a candidate record;
  -- GiST (generalized search tree) indexes are usually used in
  -- Postgres
  EXCLUDE USING GIST (
    room_number WITH =,
    duration WITH &&
  )
);

INSERT INTO schedules (room_number, duration)
VALUES ('32A', '[2020-08-20T10:00:00Z,2020-08-20T11:00:00Z)');

-- the same time in a different room: accepted
INSERT INTO schedules (room_number, duration)
VALUES ('32B', '[2020-08-20T10:00:00Z,2020-08-20T11:00:00Z)');

-- a half-hour overlap for an already-scheduled room: rejected
INSERT INTO schedules (room_number, duration)
VALUES ('32A', '[2020-08-20T10:30:00Z,2020-08-20T11:30:00Z)');

```

[Upsert](https://www.prisma.io/dataguide/postgresql/inserting-and-modifying-data/insert-on-conflict) operations such as PostgreSQL's `ON CONFLICT` clause or MySQL's `ON DUPLICATE KEY UPDATE` use a table-level constraint to detect conflicts. And like non-null constraints can be expressed as `CHECK` constraints, a unique constraint can be expressed as an exclusion constraint on equality.

### The primary key

Unique constraints have a particularly useful special case. With an additional non-null constraint on the unique column or columns, each record in the table can be singularly identified by its values for the constrained columns, which are collectively termed a _key_. Multiple candidate keys can coexist in a table, such as `users` still sometimes having distinct unique and non-null `email`s and `username`s; but declaring a primary key establishes a single criterion by which records are publicly and exclusively known. Some RDBMSs even organize rows on pages by the primary key, called for this purpose a _clustered index_, to make searching by primary key values as fast as possible.

There are two types of primary key. A natural key is defined on a column or columns "naturally" included in the table's data, while a surrogate or synthetic key is invented solely for the purpose of becoming the key. Natural keys require care -- more things can change than database designers often credit, from names to numbering schemes. A lookup table containing country and region names can use their respective [ISO 3166](https://en.wikipedia.org/wiki/ISO_3166) codes as a safe natural primary key, but a `users` table with a natural key based on mutable values like names or email addresses invites trouble. When in doubt, create a surrogate key.

If a natural key spans multiple columns, a surrogate key should always at least be considered since multi-column keys take more effort to manage. If the natural key suits, however, columns should be ordered in increasing specificity just as they are in indexes: country code _then_ region code, rather than the reverse.

The surrogate key has historically been a single integer column, or `BIGINT` where billions will eventually be assigned. Relational databases can automatically fill surrogate keys with the next integer in a series, a feature usually called `SERIAL` or `IDENTITY`.

An autoincrementing numeric counter is not without drawbacks: adding in records with pregenerated keys can cause conflicts, and if sequential values are exposed to users, it's easy for them to guess what other valid keys might be. Universally Unique Identifiers, or UUIDs, avoid these weaknesses and have become a common choice for surrogate keys, although they're also much bigger in-page than a simple number. The v1 (MAC address-based) and v4 (pseudorandom) UUID types are most frequently used.

### On the database: foreign keys

Relational databases implement only one class of multi-table constraint, the <note>We'll be talking more about some set theory concepts later on, but <a href='https://www.apress.com/gp/book/9781430242840'><i>Applied Mathematics for Database Professionals</i> by Lex de Haan and Toon Koppelaars</a> is the gold standard in-depth guide.</note><text>"subset requirement"</text> or foreign key. This sole constraint type is the guarantor of _referential integrity_, the principle that protects against inconsistencies between tables and distinguishes a relational database from a spreadsheet.

![The first steps toward a database schema design for tracking books and patrons in a library system.](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/modeling/libraries-initial.png)

This informal "entity-relationship diagram" or ERD shows the beginnings of a schema for a database of libraries and their collections and patrons. Each edge represents a relationship between the tables it connects. The | glyph indicates a single record on its side, while the "crow's foot" glyph represents multiple: a library holds many books and has many patrons.

A foreign key constrains columns to reference an eligible key in another table (or the same table). The referenced key is often the primary key, but in PostgreSQL it can also be a non-deferrable unique constraint or a non-partial unique index. The corresponding columns must have compatible types. In the schema above, the `books` table maintains a `library_id` foreign key to `libraries`, which hold books, and an `author_id` to `authors`, who write them. But what happens if a book is inserted with an `author_id` that doesn't exist in `authors`?

For example, a foreign key can reference a unique library code while the library's primary key is a separate identifier:

```sql
CREATE TABLE branch_libraries (id integer PRIMARY KEY, code text UNIQUE NOT NULL);
CREATE TABLE branch_books (id integer PRIMARY KEY, library_code text REFERENCES branch_libraries(code));
INSERT INTO branch_libraries VALUES (1, 'CENTRAL');
INSERT INTO branch_books VALUES (1, 'CENTRAL');
```

```sql expected-failure sqlstate=23503
INSERT INTO branch_books VALUES (2, 'MISSING');
```

If the foreign key is not constrained -- i.e., it's just another column or columns -- a book can have an author who doesn't exist. This is a problem: if someone tries to follow the link between `books` and `authors`, they wind up nowhere. If `authors.author_id` is a serial integer, there's also the possibility that no-one notices until the spurious `author_id` is eventually assigned, and you wind up with a particular copy of _Don Quixote_ attributed first to nobody known and then to Pierre Menard, with Miguel Cervantes nowhere to be found.

Constraining the foreign key can't prevent a book from being misattributed should the erroneous `author_id` point to an existing record in `authors`, so other checks and tests remain important. However, the set of extant foreign key values is almost always a tiny subset of the _possible_ foreign key values, so foreign key constraints will catch and prevent most wrong values. With a foreign key constraint, the _Quixote_ with a nonexistent author will be rejected instead of recorded.

#### Is this where the "relational" in "relational database" comes from?

<details>
<summary>As it happens, no!</summary>

Foreign keys create relationships between tables, but tables as we know them are mathematically _relations_ among the sets of possible values for each attribute. A single tuple relates a value for column A to a value for column B and onward. E.F. Codd's <a href="https://www.seas.upenn.edu/~zives/03f/cis550/codd.pdf">original paper</a> uses "relational" in this sense.

This has caused no end of confusion and will likely continue to do so in perpetuity.

</details>

### For certain values of correct

There are many more ways in which data may be incorrect than addressed here. Constraints help, but even they are only so flexible; many common intra-table specifications, like a limit of two or higher on the number of times a value is allowed to appear in a column, can only be enforced with [triggers](https://www.prisma.io/dataguide/functional-units#triggers-and-consequences).

But there are also ways in which the very structure of a table can lead to inconsistencies. To prevent these, we'll need to marshal both primary and foreign keys not just to define and validate but to _normalize_ the relationships between tables. First, though, we've barely scratched the surface of how [the relationships between tables define the structure of the database itself](https://www.prisma.io/dataguide/making-connections).

If you want to learn more about what data modeling means in the context of Prisma, visit the [data modeling overview](https://www.prisma.io/docs/orm/data-modeling?db=postgresql) in the Prisma documentation.

You can also learn how to describe models in a Prisma contract (the file that Prisma ORM 7 called the schema) in the [models and fields](https://www.prisma.io/docs/orm/contract-authoring/psl-syntax?db=postgresql#models-and-fields) section of the Prisma documentation.

### FAQ

<details>
<summary>What is the definition of a tuple?</summary>

A tuple is a finite, ordered list of elements. In the relational model, a tuple is one row of a relation: it holds one value for each of the relation's attributes.

Programming languages such as Python also use the name for a data structure: a fixed-length sequence of values that can't be modified after it's created.

</details>

<details>
<summary>What is a named tuple?</summary>

A typical tuple uses numerical indexes to access its members.

A named tuple differs in that its members are assigned names in addition to the numerical index. This can be beneficial in instances where a tuple has a lot of fields and is constructed far from where it is being used.

</details>

<details>
<summary>What is a tuple in a database?</summary>

In the context of a relational database, a tuple can be thought of as a single record or row of that database.

For example, in a customer database a row might include a customer’s first name, last name, phone number, email, and shipping address. All of this information together can be thought of as a tuple.

</details>

<details>
<summary>What is a foreign key in a database?</summary>

A `FOREIGN KEY` is a field or collection of fields in one table that often refers to the `PRIMARY KEY` of another table.

In PostgreSQL, it can also reference columns covered by a non-deferrable unique constraint or a non-partial unique index; those columns need not be `NOT NULL`.

</details>

<details>
<summary>Why do relational databases use primary keys and foreign keys?</summary>

Relational databases use primary and foreign keys to establish connections between tables in a database. These keys facilitate access to one table from another within a database.

Primary keys can also be generally useful for uniquely addressing individual records even without any foreign keys.

</details>

## Making connections between tables

> **Source:** [Making connections between tables](https://github.com/prisma/dataguide/blob/main/content/02-datamodeling/06-making-connections.mdx) · [Prisma's Data Guide](https://github.com/prisma/dataguide), Apache 2.0

Foreign keys describe relationships, and the entity-relationship diagrams (ERDs) introduced in _[Correctness and Constraints](https://www.prisma.io/dataguide/correctness-constraints#on-the-database-foreign-keys)_ map networks or graphs of those foreign keys. In these examples, there are only a few tables and relationships among them, but a visual layout is still a useful reference when it comes time to make sure every required relationship is accounted for. With larger databases, ERDs are invaluable, full stop. Many database clients have built-in tools to generate diagrams, although manual adjustment is usually required to make them readable.

![The first steps toward a database schema design for tracking books and patrons in a library system.](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/modeling/libraries-initial.png)

Several ERD notations exist. The full ["crow's foot"](http://www2.cs.uregina.ca/~bernatja/crowsfoot.html) notation, one of the oldest and most influential, defines symbols for 0 (a ring), 1 (a dash), or many (the eponymous crow's foot, as above) records. Each line represents a relationship between two tables and has not just one but two of these symbols on each end, with each pair establishing the minimum and maximum for that side.

This attention to detail is at least in part an historical artifact from the days when running a database server on a workstation would be unheard of, and in the modern era few ERDs are that formally specified. As with the diagrams here, a symbol for "one at most" and a symbol for "zero to many" are enough to get the gist across, and there's rarely a need for a level between that and sharing the SQL scripts themselves anymore.

### Cascading behaviors

Inserting an invalid `author_id` into `books` isn't the only way to violate a foreign key constraint: changes to `authors` can also invalidate existing data in `books`. [Back in _Correctness and Constraints_](https://www.prisma.io/dataguide/correctness-constraints#on-the-database-foreign-keys), unenforced foreign keys led to a copy of _Don Quixote_ with a spurious `author_id`. How to resolve the contradiction between Pierre Menard and Miguel Cervantes?

If the Menard record could be deleted from `authors`, the copy of the _Quixote_ in question would no longer have a valid `author_id`. The database rejects this, as violations cannot be allowed either from the child or the parent table. To get rid of Pierre Menard, one must first dispose of _Don Quixote_, either by deleting it or by changing its `author_id`.

As the web of constrained relationships grows larger, cleaning up such dependent records becomes more and more complicated. Deleting an author entails deleting all their `books`; deleting a library requires the same, plus removing its `patrons` -- and any table with a foreign key to `books` or `patrons` must be deleted first of all, lest _those_ foreign key constraints be violated in turn.

A `DELETE` against a parent table is often intended to prune an entire tree of relationships: a library and its books and its patrons, in one fell swoop (sometimes it _isn't_ meant to do this, which makes knowing where your `CASCADE`s are very important!). Since foreign key constraints reify these relationships, making of them objects to be acted upon, they can also help automate responses to changes in the parent table. A constraint declaring `ON DELETE SET NULL` will void the first foreign key values only, without traversing the relationship graph any further. `ON DELETE CASCADE` ensures that a `DELETE` to `authors` will automatically delete those authors' `books` as well, and onward through any foreign key that declares `books` a parent table.

On occasion, natural primary key values may also change as standards and formats update or as the assumption that the natural key was immutable turns out to have been incorrect. Most RDBMSs support an `ON UPDATE CASCADE` behavior for this eventuality.

#### The future is here and everything needs to be destroyed

<details>
<summary>`CASCADE` is sometimes unduly ignored.</summary>

Even if real `libraries` or `authors` are never supposed to be deleted (only deactivated, or "soft-deleted"), both automated and manual tests often require a fresh, empty database up front or even for each individual test. Dropping and recreating the database breaks connections, requires elevated permissions, and is the slowest possible solution to boot.

The usual recourse is a "teardown" function or script which deletes anything previous tests might have inserted into the database, table by table. Without `CASCADE` directives, these deletions must be arranged carefully in a [topological sort order](https://en.wikipedia.org/wiki/Topological_sorting) around the relationship graph to avoid ever violating a foreign key constraint. With `CASCADE`s, teardown mostly takes care of itself once you delete records at the center of each of the database's various relationship graphs.

</details>

### Key positioning

Both libraries and authors preexist any useful record of the books they lend and write respectively. These cases correspond to the ["has-a"](https://en.wikipedia.org/wiki/Has-a) relationship type in object-oriented programming, which in database design requires the foreign key to be stored in the dependent table, `books`.

Other cases aren't so clear. Imagine that some books are themselves on loan to libraries from outside collections, and that their original <note><a href="https://en.wikipedia.org/wiki/Provenance">Provenance</a> is the term used in archiving to describe who had an item before you did. Tracking provenance matters for rare books, museum artifacts, works of art, fine wines, data sets, and other less-than-building-sized things of value which change owners or holders.</note><text>provenances</text> are tracked separately. Should all `books` have a `provenance_id`, or should the `provenances` table have a `book_id` column?

![Expanding the libraries schema to begin tracking provenance for individual books.](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/modeling/libraries-provenances.png)

Both solutions will serve the purpose of tracking provenance. However, in the case of `books.provenance_id`, there's no way to follow the link back to a book from its provenance -- one would have to search `books` for a matching `provenance_id`. And since most books have no special provenance, most values for `provenance_id` will be `NULL`.

In this situation, the `provenances.book_id` approach is clearly superior. The `book_id` link is traceable, columns are used efficiently, and `provenances.book_id` is even a primary key, since a single book shouldn't have come to a library from more than one place. De Haan and Koppelaars would call `provenances` a _specialization_ of `books`, a table which adds supplementary information to records in its parent identified by the same primary key. The connection between `books` and `provenances` is a "one-to-one" relationship, since only one of any `book_id` value can exist in either table.

```sql
CREATE TABLE provenances (
  book_id INT NOT NULL PRIMARY KEY,
  collection TEXT NOT NULL
);
```

Properly speaking, provenance includes the entire chain of custody of an artifact, not just who had it last. If necessary for our purposes, this complicates the picture somewhat: with multiple records per book in `provenances`, `book_id` is <note>[Semi-structured data types](https://www.prisma.io/dataguide/tables-tuples-types#semi-structured-data-types) would allow a `book_id` primary key, but cannot be constrained or a consistent schema guaranteed, so these are not always suitable.</note><text>no longer a primary key</text>. A `provenances` table in which records are not (or not only) identified by the foreign key is no longer a specialization, but the "many" side of a "one-to-many" relationship -- or, viewed from the other direction, of a "many-to-one".

```sql
CREATE TABLE provenances (
  book_id INT NOT NULL REFERENCES books (book_id),
  -- a numeric index (most recent, second most recent, third,
  -- and so on) is not strictly required, since the duration
  -- could form part of the primary key. However, a range in
  -- the primary key makes certain queries, like "who last
  -- held most of our books?", more difficult to formulate.
  custody_index INT NOT NULL DEFAULT 1,
  collection TEXT NOT NULL,
  duration DATERANGE NOT NULL,
  PRIMARY KEY (book_id, custody_index),
  -- custody of the same book shouldn't overlap; remember
  -- that the btree_gist Postgres extension is required!
  EXCLUDE USING GIST (
    book_id WITH =,
    duration WITH &&
  )
);
```

### Many-to-many relationships

Elsewhere in the example schema, `patrons` have a `library_id` value. This expresses a very important -- and likely a very wrong -- assumption: any person will patronize one library and one library only. If someone goes to another library, they'll have to enter all their information all over again. This violates _another_ important assumption, namely, that a single record in `patrons` corresponds to a single person. Both can't be true.

There's a second problem with a similar solution: we aren't yet tracking who's checked a book out. A single patron can borrow many books, while a single book can be checked out many times. Structurally, this is nearly identical to the case of a single library having many patrons, who themselves may borrow from multiple libraries.

![Adding junction tables to the model allows the relationships between patrons and books, and patrons and libraries, to be fully represented.](https://raw.githubusercontent.com/prisma/dataguide/main/content/dataguide-images/modeling/libraries-full.png)

A "many-to-many" relationship has to be represented in a dedicated table, often called a _junction_ or _bridge_ table, among [other names](https://en.wikipedia.org/wiki/Associative_entity). The junction table maintains foreign keys to each table it mediates, making it the "many" side of its relationships to those tables. A primary key across each foreign key prevents duplicates of the same relationship.

`library_patrons`, a textbook example of a junction table, looks like this:

```sql
CREATE TABLE library_patrons (
  library_id INT NOT NULL REFERENCES libraries (library_id),
  patron_id INT NOT NULL REFERENCES patrons (patron_id),
  PRIMARY KEY (library_id, patron_id)
);
```

`checkouts`, you might have noticed, doesn't follow the same naming convention as `library_patrons` -- it's not `patron_books` or vice versa. That's because it's [more than a junction table](https://www.prisma.io/dataguide/know-your-problem-space#what-is-important-enough-to-qualify-as-an-entity). Like `library_patrons`, `checkouts` maintains foreign keys to the tables it connects in a many-to-many relationship, but it must also include information about each patron-book connection: the date checked out, the date due or returned, whether an extension has been granted. It's also perfectly possible for someone to check out the same book multiple times, so `(patron_id, book_id)` is not a viable primary key.

### Building blocks

Many-to-many relationships are only one possible composition of the two primary relationship types. They're common enough that diagrams often omit `library_patrons`-style junction tables entirely in favor of representing both ends with a "many" symbol. But every network of connections among tables, no matter how complicated, is reducible into its constituent one-to-one and one-to-many relationships.

### Boundaries

A single database may (and often does) contain multiple networks of foreign key relationships. The reverse, however, is usually not true. MySQL and MariaDB alone among the popular relational databases conflate schemas and databases, and therefore allow cross-database foreign keys as long as both databases are hosted on the same server. Others do not.

We'll come back to organizing tables in databases and in schemas within databases later, but it's useful to consider a multi-table relationship graph the indivisible unit of database layout in the same way that the combined attributes of a given concept form the basis for a table layout.

If you want to learn more about what data modeling means in the context of Prisma, visit the [data modeling overview](https://www.prisma.io/docs/orm/data-modeling?db=postgresql) in the Prisma documentation.

You can also learn how to describe models in a Prisma contract (the file that Prisma ORM 7 called the schema) in the [models and fields](https://www.prisma.io/docs/orm/contract-authoring/psl-syntax?db=postgresql#models-and-fields) section of the Prisma documentation.
