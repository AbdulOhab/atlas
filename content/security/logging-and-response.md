---
title: "Logging, Errors and Response"
order: 9
summary: "Seeing and answering attacks: security logging, a logging vocabulary, safe error handling, virtual patching and vulnerability disclosure."
category: "Security"
level: Intermediate
---

# Logging, Errors and Response

Seeing and answering attacks: security logging, a logging vocabulary, safe error handling, virtual patching and vulnerability disclosure.

## Logging

> **Source:** [Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet is focused on providing developers with concentrated guidance on building application logging mechanisms, especially related to security logging.

Many systems enable network device, operating system, web server, mail server and database server logging, but often custom application event logging is missing, disabled or poorly configured. It provides much greater insight than infrastructure logging alone. Web application (e.g. web site or web service) logging is much more than having web server logs enabled (e.g. using Extended Log File Format).

Application logging should be consistent within the application, consistent across an organization's application portfolio and use industry standards where relevant, so the logged event data can be consumed, correlated, analyzed and managed by a wide variety of systems.

### Purpose

Application logging should always be included for security events. Application logs are invaluable data for both security and operational use cases.

#### Operational use cases

- General debugging
- Establishing baselines
- Business process monitoring e.g. sales process abandonment, transactions, connections
- Providing information about problems and unusual conditions
- Performance monitoring e.g. data load time, page timeouts
- Other business-specific requirements

#### Security use cases

Application logging might also be used to record other types of events too such as:

- Anti-automation monitoring
- Identifying security incidents
- Monitoring policy violations
- Assisting non-repudiation controls (note that the trait non-repudiation is hard to achieve for logs because their trustworthiness is often just based on the logging party being audited properly while mechanisms like digital signatures are hard to utilize here)
- Audit trails e.g. data addition, modification and deletion, data exports
- Compliance monitoring
- Data for subsequent requests for information e.g. data subject access, freedom of information, litigation, police and other regulatory investigations
- Legally sanctioned interception of data e.g. application-layer wire-tapping
- Contributing additional application-specific data for incident investigation which is lacking in other log sources
- Helping defend against vulnerability identification and exploitation through attack detection

Process monitoring, audit, and transaction logs/trails etc. are usually collected for different purposes than security event logging, and this often means they should be kept separate.

The types of events and details collected will tend to be different.

For example a [PCIDSS](https://www.pcisecuritystandards.org/pci_security/) audit log will contain a chronological record of activities to provide an independently verifiable trail that permits reconstruction, review and examination to determine the original sequence of attributable transactions. It is important not to log too much, or too little.

Use knowledge of the intended purposes to guide what, when and how much. The remainder of this cheat sheet primarily discusses security event logging.

### Design, implementation, and testing

#### Event data sources

The application itself has access to a wide range of information events that should be used to generate log entries. Thus, the primary event data source is the application code itself.

The application has the most information about the user (e.g. identity, roles, permissions) and the context of the event (target, action, outcomes), and often this data is not available to either infrastructure devices, or even closely-related applications.

Other sources of information about application usage that could also be considered are:

- Client software e.g. actions on desktop software and mobile devices in local logs or using messaging technologies, JavaScript exception handler via AJAX, web browser such as using Content Security Policy (CSP) reporting mechanism
- Embedded instrumentation code
- Network firewalls
- Network and host intrusion detection systems (NIDS and HIDS)
- Closely-related applications e.g. filters built into web server software, web server URL redirects/rewrites to scripted custom error pages and handlers
- Application firewalls e.g. filters, guards, XML gateways, database firewalls, web application firewalls (WAFs)
- Database applications e.g. automatic audit trails, trigger-based actions
- Reputation monitoring services e.g. uptime or malware monitoring
- Other applications e.g. fraud monitoring, CRM
- Operating system e.g. mobile platform

The degree of confidence in the event information has to be considered when including event data from systems in a different trust zone. Data may be missing, modified, forged, replayed and could be malicious – it must always be treated as untrusted data.

Consider how the source can be verified, and how integrity and non-repudiation can be enforced.

#### Where to record event data

Applications commonly write event log data to the file system or a database (SQL or NoSQL). Applications installed on desktops and on mobile devices may use local storage and local databases, as well as sending data to remote storage.

Your selected framework may limit the available choices. All types of applications may send event data to remote systems (instead of or as well as more local storage).

This could be a centralized log collection and management system (e.g. SIEM or SEM) or another application elsewhere. Consider whether the application can simply send its event stream, unbuffered, to stdout, for management by the execution environment.

- When using the file system, it is preferable to use a separate partition than those used by the operating system, other application files and user generated content
    - For file-based logs, apply strict permissions concerning which users can access the directories, and the permissions of files within the directories
    - In web applications, the logs should not be exposed in web-accessible locations, and if done so, should have restricted access and be configured with a plain text MIME type (not HTML)
- When using a database, it is preferable to utilize a separate database account that is only used for writing log data and which has very restrictive database, table, function and command permissions
- Use a standard event format supported by the receiving system and a secure transport, such as the [syslog message format](https://www.rfc-editor.org/rfc/rfc5424.html#section-6) over [TLS](https://www.rfc-editor.org/rfc/rfc5425.html#section-3), to facilitate integration with centralized logging services

Consider separate files/tables for extended event information such as error stack traces or a record of HTTP request and response headers and bodies.

#### Which events to log

The level and content of security monitoring, alerting, and reporting needs to be set during the requirements and design stage of projects, and should be proportionate to the information security risks. This can then be used to define what should be logged.

There is no one size fits all solution, and a blind checklist approach can lead to unnecessary "alarm fog" that means real problems go undetected.

Where possible, always log:

- Input validation failures e.g. protocol violations, unacceptable encodings, invalid parameter names and values
    - Log failures to validate a value against a discrete and finite list of valid values (e.g. a country from a dropdown), such as `input_validation_fail[:field,userid]`. Treat these as suspicious events, not proof of an attack: [unexpected input can also result from misuse or client defects](https://github.com/OWASP/OCSD/blob/main/Curriculum/07%20-%20Secure%20Logging/07.03%20-%20Supplementary%20Reading%20Materials.md#user-content-input-validation-failures). Evaluate severity and alerting using repetition, correlation, and request context.
- Output validation failures e.g. database record set mismatch, invalid data encoding
- Authentication successes and failures
   Failed authentication attempts provide critical early indicators of credential‑based attacks such as brute‑force, credential‑stuffing, and password‑spraying. Monitoring repeated failures for the same account, failures from multiple IP addresses, or rapid bursts of login attempts helps detect account takeover attempts before they succeed. This aligns with the cheat sheet’s guidance that “Authentication successes and failures” must always be logged, as these events are essential for identifying security incidents and supporting incident investigation. Refer to OWASP ASVS 7.1.1 for authentication failure logging requirements.
- Authorization (access control) failures
- Session management failures e.g. cookie session identification value modification or suspicious JWT validation failures
- Application errors and system events e.g. syntax and runtime errors, connectivity problems, performance issues, third party service error messages, file system errors, file upload virus detection, configuration changes
- Application and related systems start-ups and shut-downs, and logging initialization (starting, stopping or pausing)
- Use of higher-risk functionality including:
    - User administration actions such as addition or deletion of users, changes to privileges, assigning users to tokens, adding or deleting tokens
    - Use of systems administrative privileges or access by application administrators including all actions by those users
    - Use of default or shared accounts or a "break-glass" account.
    - Access to sensitive data such as payment cardholder data,
    - Encryption activities such as use or rotation of cryptographic keys
    - Creation and deletion of system-level objects
    - Data import and export including screen-based reports
    - Submission and processing of user-generated content - especially file uploads
    - Deserialization failures
    - Network connections and associated failures such as backend TLS failures (including certificate validation failures), or requests with an unexpected HTTP verb
- Legal and other opt-ins e.g. permissions for mobile phone capabilities, terms of use, terms & conditions, personal data usage consent, permission to receive marketing communications
- Suspicious business logic activities such as:
    - Attempts to perform a set actions out of order/bypass flow control
    - Actions which don't make sense in the business context
    - Attempts to exceed limitations for particular actions

Optionally consider if the following events can be logged and whether it is desirable information:

- Sequencing failure
- Excessive use
- Data changes
- Fraud and other criminal activities
- Suspicious, unacceptable, or unexpected behavior
- Modifications to configuration
- Application code file and/or memory changes

#### Event attributes

Each log entry needs to include sufficient information for the intended subsequent monitoring and analysis. It could be full content data, but is more likely to be an extract or just summary properties.

The application logs must record "when, where, who and what" for each event.

The properties for these will be different depending on the architecture, class of application and host system/device, but often include the following:

- When
    - Log date and time (international format)
    - Event date and time - the event timestamp may be different to the time of logging e.g. server logging where the client application is hosted on remote device that is only periodically or intermittently online
    - Interaction identifier `Note A`
- Where
    - Application identifier e.g. name and version
    - Application address e.g. cluster/hostname or server IPv4 or IPv6 address and port number, workstation identity, local device identifier
    - Service e.g. name and protocol
    - Geolocation
    - Window/form/page e.g. entry point URL and HTTP method for a web application, dialogue box name
    - Code location e.g. script name, module name
- Who (human or machine user)
    - Source address e.g. user's device/machine identifier, user's IP address, cell/RF tower ID, mobile telephone number
    - User identity (if authenticated or otherwise known) e.g. user database table primary key-value, username, license number
- What
    - Type of event `Note B`
    - Severity of event `Note B` e.g. `{0=emergency, 1=alert, ..., 7=debug}, {fatal, error, warning, info, debug, trace}`
    - Security relevant event flag (if the logs contain non-security event data too)
    - Description

Additionally consider recording:

- Secondary time source (e.g. GPS) event date and time
- Action - original intended purpose of the request e.g. Log in, Refresh session ID, Log out, Update profile
- Object e.g. the affected component or other object (user account, data resource, file) e.g. URL, Session ID, User account, File
- Result status - whether the ACTION aimed at the OBJECT was successful e.g. Success, Fail, Defer
- Reason - why the status above occurred e.g. User not authenticated in database check ..., Incorrect credentials
- HTTP Status Code (web applications only) - the status code returned to the user (often 200 or 301)
- Request HTTP headers or HTTP User Agent (web applications only)
- User type classification e.g. public, authenticated user, CMS user, search engine, authorized penetration tester, uptime monitor (see "Data to exclude" below)
- Analytical confidence in the event detection `Note B` e.g. low, medium, high or a numeric value
- Responses seen by the user and/or taken by the application e.g. status code, custom text messages, session termination, administrator alerts
- Extended details e.g. stack trace, system error messages, debug information, HTTP request body, HTTP response headers and body
- Internal classifications e.g. responsibility, compliance references
- External classifications e.g. NIST Security Content Automation Protocol (SCAP), Mitre Common Attack Pattern Enumeration and Classification (CAPEC)

For more information on these, see the "other" related articles listed at the end, especially the comprehensive article by Anton Chuvakin and Gunnar Peterson.

**Note A:** The "Interaction identifier" is a method of linking all (relevant) events for a single user interaction (e.g. desktop application form submission, web page request, mobile app button click, web service call). The application knows all these events relate to the same interaction, and this should be recorded instead of losing the information and forcing subsequent correlation techniques to re-construct the separate events. For example, a single SOAP request may have multiple input validation failures and they may span a small range of times. As another example, an output validation failure may occur much later than the input submission for a long-running "saga request" submitted by the application to a database server.

**Note B:** Each organization should ensure it has a consistent, and documented, approach to classification of events (type, confidence, severity), the syntax of descriptions, and field lengths and data types including the format used for dates/times.

#### Data to exclude

Never log data unless it is legally sanctioned. For example, intercepting some communications, monitoring employees, and collecting some data without consent may all be illegal.

Never exclude any events from "known" users such as other internal systems, "trusted" third parties, search engine robots, uptime/process and other remote monitoring systems, pen testers, auditors. However, you may want to include a classification flag for each of these in the recorded data.

The following should usually not be recorded directly in the logs, but instead should be removed, masked, sanitized, hashed, or encrypted:

- Application source code
- Session identification values (consider replacing with a hashed value if needed to track session specific events)
- Access tokens
- Sensitive personal data and some forms of personally identifiable information (PII) e.g. health, government identifiers, vulnerable people
- Authentication passwords
- Database connection strings
- Encryption keys and other primary secrets
- Bank account or payment card holder data
- Data of a higher security classification than the logging system is allowed to store
- Commercially-sensitive information
- Information it is illegal to collect in the relevant jurisdictions
- Information a user has opted out of collection, or not consented to e.g. use of do not track, or where consent to collect has expired

Sometimes the following data can also exist, and while useful for subsequent investigation, it may also need to be treated in some special manner before the event is recorded:

- File paths
- Database connection strings
- Internal network names and addresses
- Non sensitive personal data (e.g. personal names, telephone numbers, email addresses)

Consider using personal data de-identification techniques such as deletion, scrambling or pseudonymization of direct and indirect identifiers where the individual's identity is not required, or the risk is considered too great.

In some systems, sanitization can be undertaken post log collection, and prior to log display.

#### Customizable logging

It may be desirable to be able to alter the level of logging (type of events based on severity or threat level, amount of detail recorded). If this is implemented, ensure that:

- The default level must provide sufficient detail for business needs
- It should not be possible to completely deactivate application logging or logging of events that are necessary for compliance requirements
- Alterations to the level/extent of logging must be intrinsic to the application (e.g. undertaken automatically by the application based on an approved algorithm) or follow change management processes (e.g. changes to configuration data, modification of source code)
- The logging level must be verified periodically

#### Event collection

If your development framework supports suitable logging mechanisms, use or build upon that. Otherwise, implement an application-wide log handler which can be called from other modules/components.

Document the interface referencing the organization-specific event classification and description syntax requirements.

If possible create this log handler as a standard module that can be thoroughly tested, deployed in multiple applications, and added to a list of approved and recommended modules.

- Validate event data from other trust zones before logging it. If a field is malformed, omit or safely replace that field and record the validation failure with bounded, safe context; do not discard the entire security event. This preserves evidence while following [OWASP guidance to log validation failures and encode log data safely](https://github.com/OWASP/Top10/blob/master/2025/docs/en/A09_2025-Security_Logging_and_Alerting_Failures.md#user-content-how-to-prevent)
- Perform sanitization on all event data to prevent log injection attacks e.g. carriage return (CR), line feed (LF) and delimiter characters (and optionally to remove sensitive data)
- Encode data correctly for the output (logged) format
- If writing to databases, read, understand, and apply the SQL injection cheat sheet
- Ensure failures in the logging processes/systems do not prevent the application from otherwise running or allow information leakage
- Synchronize time across all servers and devices `Note C`

**Note C:** This is not always possible where the application is running on a device under some other party's control (e.g. on an individual's mobile phone, on a remote customer's workstation which is on another corporate network). In these cases, attempt to measure the time offset, or record a confidence level in the event timestamp.

Where possible, record data in a standard format, or at least ensure it can be exported/broadcast using an industry-standard format.

In some cases, events may be relayed or collected together in intermediate points. In the latter some data may be aggregated or summarized before forwarding on to a central repository and analysis system.

#### Verification

Logging functionality and systems must be included in code review, application testing and security verification processes:

- Ensure the logging is working correctly and as specified
- Check that events are being classified consistently and the field names, types and lengths are correctly defined to an agreed standard
- Ensure logging is implemented and enabled during application security, fuzz, penetration, and performance testing
- Test the mechanisms are not susceptible to injection attacks
- Ensure there are no unwanted side-effects when logging occurs
- Check the effect on the logging mechanisms when external network connectivity is lost (if this is usually required)
- Ensure logging cannot be used to deplete system resources, for example by filling up disk space or exceeding database transaction log space, leading to denial of service
- Test the effect on the application of logging failures such as simulated database connectivity loss, lack of file system space, missing write permissions to the file system, and runtime errors in the logging module itself
- Verify access controls on the event log data
- If log data is utilized in any action against users (e.g. blocking access, account lock-out), ensure this cannot be used to cause denial of service (DoS) of other users

#### Network architecture

As an example, the diagram below shows a service that provides business functionality to customers. We recommend creating a centralized system for collecting logs. There may be many such services, but all of them must securely collect logs in a centralized system.

Applications of this business service are located in network segments:

- FRONTEND 1 aka DMZ (UI)
- MIDDLEWARE 1 (business application - service core)
- BACKEND 1 (service database)

The service responsible for collecting IT events, including security events, is located in the following segments:

- BACKEND 2 (log storage)
- MIDDLEWARE 3 - 2 applications:
    - log loader application that download log from storage, pre-processes, and transfer to UI
    - log collector that accepts logs from business applications, other infrastructure, cloud applications and saves in log storage
- FRONTEND 2 (UI for viewing business service event logs)
- FRONTEND 3 (applications that receive logs from cloud applications and transfer logs to log collector)
    - It is allowed to combine the functionality of two applications in one

For example, all external requests from users go through the API management service, see application in MIDDLEWARE 2 segment.

![MIDDLEWARE](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Logging_Cheat_Sheet.drawio.png)

As you can see in the image above, at the network level, the processes of saving and downloading logs require opening different network accesses (ports), arrows are highlighted in different colors. Also, saving and downloading are performed by different applications.

Full network segmentation cheat sheet by [sergiomarotco](https://github.com/sergiomarotco): [link](https://github.com/sergiomarotco/Network-segmentation-cheat-sheet)

### Deployment and operation

#### Release

- Provide security configuration information by adding details about the logging mechanisms to release documentation
- Brief the application/process owner about the application logging mechanisms
- Ensure the outputs of the monitoring (see below) are integrated with incident response processes

#### Operation

Enable processes to detect whether logging has stopped, and to identify tampering or unauthorized access and deletion (see protection below).

#### Protection

The logging mechanisms and collected event data must be protected from mis-use such as tampering in transit, and unauthorized access, modification and deletion once stored. Logs may contain personal and other sensitive information, or the data may contain information regarding the application's code and logic.

In addition, the collected information in the logs may itself have business value (to competitors, gossip-mongers, journalists and activists) such as allowing the estimate of revenues, or providing performance information about employees.

This data may be held on end devices, at intermediate points, in centralized repositories and in archives and backups.

Consider whether parts of the data may need to be excluded, masked, sanitized, hashed, or encrypted during examination or extraction.

At rest:

- Build in tamper detection so you know if a record has been modified or deleted
- Store or copy log data to read-only media as soon as possible
- All access to the logs must be recorded and monitored (and may need prior approval)
- The privileges to read log data should be restricted and reviewed periodically

In transit:

- If log data is sent over untrusted networks (e.g. for collection, for dispatch elsewhere, for analysis, for reporting), use a secure transmission protocol
- Consider whether the origin of the event data needs to be verified
- Perform due diligence checks (regulatory and security) before sending event data to third parties

See `NIST SP 800-92` Guide to Computer Security Log Management for more guidance.

#### Monitoring of events

The logged event data needs to be available to review and there are processes in place for appropriate monitoring, alerting, and reporting:

- Incorporate the application logging into any existing log management systems/infrastructure e.g. centralized logging and analysis systems
- Ensure event information is available to appropriate teams
- Enable alerting and signal the responsible teams about more serious events immediately
- Share relevant event information with other detection systems, to related organizations and centralized intelligence gathering/sharing systems

#### Disposal of logs

Log data, temporary debug logs, and backups/copies/extractions, must not be destroyed before the duration of the required data retention period, and must not be kept beyond this time.

Legal, regulatory and contractual obligations may impact on these periods.

### Attacks on Logs

Because of their usefulness as a defense, logs may be a target of attacks. See also OWASP [Log Injection](https://owasp.org/www-community/attacks/Log_Injection) and [CWE-117](https://cwe.mitre.org/data/definitions/117.html).

#### Confidentiality

Who should be able to read what? A confidentiality attack enables an unauthorized party to access sensitive information stored in logs.

- Logs contain PII of users. Attackers gather PII, then either release it or use it as a stepping stone for further attacks on those users.
- Logs contain technical secrets such as passwords. Attackers use it as a stepping stone for deeper attacks.

#### Integrity

Which information should be modifiable by whom?

- An attacker with read access to a log uses it to exfiltrate secrets.
- An attack leverages logs to connect with exploitable facets of logging platforms, such as sending in a payload over syslog in order to cause an out-of-bounds write.

#### Availability

What downtime is acceptable?

- An attacker floods log files in order to exhaust disk space available for non-logging facets of system functioning. For example, the same disk used for log files might be used for SQL storage of application data.
- An attacker floods log files in order to exhaust disk space available for further logging.
- An attacker uses one log entry to destroy other log entries.
- An attacker leverages poor performance of logging code to reduce application performance

#### Accountability

Who is responsible for harm?

- An attacker prevent writes in order to cover their tracks.
- An attacker prevent damages the log in order to cover their tracks.
- An attacker causes the wrong identity to be logged in order to conceal the responsible party.

## Application Logging Vocabulary

> **Source:** [Application Logging Vocabulary](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Vocabulary_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

This document proposes a standard vocabulary for logging security events. The intent is to simplify monitoring and alerting such that, assuming developers trap errors and log them using this vocabulary, monitoring and alerting would be improved by simply keying on these terms.

### Overview

Each year IBM Security commissions the Ponemon Institute to survey companies around the world for information related to security breaches, mitigation, and the associated costs; the result is called the Cost of a Data Breach Report.

In addition to the millions of dollars lost due to breaches the report finds that the **mean time to identify** a breach continues to hover around **200 days**. Clearly our ability to monitor applications and alert on anomalous behavior would improve our time to identify and mitigate an attack against our applications.

![IBM Cost of Data Breach Report 2025](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/cost-of-breach-2025.png)

> [IBM Cost of a Data Breach Report 2025](https://www.ibm.com/forms/mkt-asset-31c90), Fig.4, pg.12

This logging standard would seek to define specific keywords which, when applied consistently across software, would allow groups to simply monitor for these events terms across all applications and respond quickly in the event of attack.

### Assumptions

- Observability/SRE groups must support the use of this standard and encourage developers to use it
- Incident Response must either ingest this data OR provide a means by which other monitoring teams can send a notification of alert, preferably programmatically.
- Architects must support, adopt, and contribute to this standard
- Developers must embrace this standard and begin to implement (requires knowledge and intent to understand potential attacks and trap those errors in code).

### Getting Started

As a reminder, the goal of logging is to be able to alert on specific security events. Of course, the first step to logging these events is good error handling, if you're not trapping the events, you don't have an event to log.

#### Identifying Events

In order to better understand security event logging a good high-level understanding of threat modeling would be helpful, even if it's a simple approach of:

1. **What could go wrong?**

- Orders: could someone order on behalf of another?
- Authentication: could I log in as someone else?
- Authorization: could I see someone else' account?

2. **What would happen if it did?**

- Orders: I've placed an order on behalf of another... to an abandoned warehouse in New Jersey. Oops.
- Then I bragged about it on 4Chan.
- Then I told the New York Times about it.

3. **Who might intend to do this?**

- Intentional attacks by hackers.
- An employee "testing" how things work.
- An API coded incorrectly doing things the author did not intend.

#### Implementation

Some languages have libraries which ease the job of adopting this logging vocabulary in applications:

- Python: [lucabello/owasp-logger](https://github.com/lucabello/owasp-logger)
- C#/.NET: [byteguard-hq/byteguard-security-logger](https://github.com/ByteGuard-HQ/byteguard-security-logger)
- Python / Java / Go / Node.js: [thatsjet/security_event_logger](https://github.com/thatsjet/security_event_logger)

### Format

_NOTE: All dates should be logged in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format **WITH** UTC offset to ensure maximum portability_

```
{
    "datetime": "2021-01-01T01:01:01-0700",
    "appid": "foobar.netportal_auth",
    "event": "AUTHN_login_success:joebob1",
    "level": "INFO",
    "description": "User joebob1 login successfully",
    "useragent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
    "source_ip": "165.225.50.94",
    "host_ip": "10.12.7.9",
    "hostname": "portalauth.foobar.com",
    "protocol": "https",
    "port": "440",
    "request_uri": "/api/v2/auth/",
    "request_method": "POST",
    "region": "AWS-US-WEST-2",
    "geo": "USA"
}
```

### The Vocabulary

What follows are the various event types that should be captured. For each event type there is a prefix like "authn" and additional data that may be included for that event.

Portions of the full logging format are included for example, but a complete event log should follow the format above.

**Note on Data Privacy:**

All fields logged after event type should be considered optional. Businesses implementing this logging method should consider value of the fields being logged vs. responsibility as a data steward for the data logged. For example: logging user IP address may be useful for detection and response, but may be considered personally identifiable information when combined with other data and subject to regulation or deletion requests.

---

### Authentication [AUTHN]

#### authn_login_success[:userid]

**Description**
All login events should be recorded including success.

**Level:**
INFO

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authn_login_success:joebob1",
    "level": "INFO",
    "description": "User joebob1 login successfully",
    ...
}
```

---

#### authn_login_successafterfail[:userid,retries]

**Description**
The user successfully logged in after previously failing.

**Level:**
INFO

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authn_login_successafterfail:joebob1,2",
    "level": "INFO",
    "description": "User joebob1 login successfully",
    ...
}
```

---

#### authn_login_fail[:userid]

**Description**
All login events should be recorded including failure.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authn_login_fail:joebob1",
    "level": "WARN",
    "description": "User joebob1 login failed",
    ...
}
```

---

#### authn_login_fail_max[:userid,maxlimit(int)]

**Description**
All login events should be recorded including failure.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authn_login_fail_max:joebob1,3",
    "level": "WARN",
    "description": "User joebob1 reached the login fail limit of 3",
    ...
}
```

---

#### authn_login_lock[:userid,reason]

**Description**
When the feature exists to lock an account after x retries or other condition, the lock should be logged with relevant data.

**Level:**
WARN

**Reasons:**

- maxretries: The maximum number of retries was reached
- suspicious: Suspicious activity was observed on the account
- customer: The customer requested their account be locked
- other: Other

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authn_login_lock:joebob1,maxretries",
    "level": "WARN",
    "description": "User joebob1 login locked because maxretries exceeded",
    ...
}
```

---

#### authn_password_change[:userid]

**Description**
Every password change should be logged, including the userid that it was for.

**Level:**
INFO

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authn_password_change:joebob1",
    "level": "INFO",
    "description": "User joebob1 has successfully changed their password",
    ...
}
```

---

#### authn_password_change_fail[:userid]

**Description**
An attempt to change a password that failed. May also trigger other events such as `authn_login_lock`.

**Level:**
CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authn_password_change_fail:joebob1",
    "level": "CRITICAL",
    "description": "User joebob1 failed to change their password",
    ...
}
```

---

#### authn_impossible_travel[:userid,region1,region2]

**Description**
When a user is logged in from one city and suddenly appears in another, too far away to have traveled in a reasonable timeframe, this often indicates a potential account takeover.

**Level:**: CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authn_impossible_travel:joebob1,US-OR,CN-SH",
    "level": "CRITICAL",
    "description": "User joebob1 has accessed the application in two distant cities at the same time",
    ...
}
```

---

#### authn_token_created[:userid, entitlement(s)]

**Description**
When a token is created for service access it should be recorded

**Level:**: INFO

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "aws.foobar.com",
    "event": "authn_token_created:app.foobarapi.prod,create,read,update",
    "level": "INFO",
    "description": "A token has been created for app.foobarapi.prod with create,read,update",
    ...
}
```

---

#### authn_token_revoked[:userid,tokenid]

**Description**
A token has been revoked for the given account.

**Level:**: INFO

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "aws.foobar.com",
    "event": "authn_token_revoked:app.foobarapi.prod,xyz-abc-123-gfk",
    "level": "INFO",
    "description": "Token ID: xyz-abc-123-gfk was revoked for user app.foobarapi.prod",
    ...
}
```

---

#### authn_token_reuse[:userid,tokenid]

**Description**
A previously revoked token was attempted to be reused.

**Level:**: CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "aws.foobar.com",
    "event": "authn_token_reuse:app.foobarapi.prod,xyz-abc-123-gfk",
    "level": "CRITICAL",
    "description": "User app.foobarapi.prod attempted to use token ID: xyz-abc-123-gfk which was previously revoked",
    ...
}
```

---

#### authn_token_delete[:appid]

**Description**
When a token is deleted it should be recorded

**Level:**: WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authn_token_delete:foobarapi",
    "level": "WARN",
    "description": "The token for foobarapi has been deleted",
    ...
}
```

---

### Authorization [AUTHZ]

---

#### authz_fail[:userid,resource]

**Description**
An attempt was made to access a resource which was unauthorized

**Level:**: CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authz_fail:joebob1,resource",
    "level": "CRITICAL",
    "description": "User joebob1 attempted to access a resource without entitlement",
    ...
}
```

---

#### authz_change[:userid,from,to]

**Description**
The user or entity entitlements was changed

**Level:**: WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authz_change:joebob1,user,admin",
    "level": "WARN",
    "description": "User joebob1 access was changed from user to admin",
    ...
}
```

---

#### authz_admin[:userid,event]

**Description**
All activity by privileged users such as admin should be recorded.

**Level:**: WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "authz_admin:joebob1,user_privilege_change",
    "level": "WARN",
    "description": "Administrator joebob1 has updated privileges of user foobarapi from user to admin",
    ...
}
```

---

### Encryption/Decryption [CRYPT]

#### crypt_decrypt_fail[userid]

**Description**
Failure to perform encryption and decryption could be simply due to a system error, or it may be related to authorization failures where a user lacks permissions on the related data.

**Level:**: WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "crypt_decrypt_fail:joebob1",
    "level": "WARN",
    "description": "User joebob1 was unable to perform decryption" + err,
    ...
}
```

---

#### crypt_encrypt_fail[userid]

**Description**
Failure to perform encryption and decryption could be simply due to a system error, or it may be related to authorization failures where a user lacks permissions on the related data.

**Level:**: WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "crypt_encrypt_fail:joebob1",
    "level": "WARN",
    "description": "User joebob1 was unable to perform encryption" + err,
    ...
}
```

---

### Excessive Use [EXCESS]

#### excess_rate_limit_exceeded[userid,max]

**Description**
Expected service limit ceilings should be established and alerted when exceeded, even if simply for managing costs and scaling.

**Level:**: WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "excess_rate_limit_exceeded:app.foobarapi.prod,100000",
    "level": "WARN",
    "description": "User app.foobarapi.prod has exceeded max:100000 requests",
    ...
}
```

---

#### excess_sessions_exceeded[userid,max]

**Description**
When a user exceeds the maximum number of concurrent sessions allowed it should be logged. An unusually high concurrent-session count can indicate credential sharing or account takeover.

**Level:**: WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "excess_sessions_exceeded:app.foobarapi.prod,5",
    "level": "WARN",
    "description": "User app.foobarapi.prod exceeded the max of 5 concurrent sessions",
    ...
}
```

---

### File Upload [UPLOAD]

#### upload_complete[userid,filename,type]

**Description**
On successful file upload the first step in the validation process is that the upload has completed.

**Level:**: INFO

**Example:**

```
    {
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "upload_complete:joebob1,user_generated_content.png,PNG",
    "level": "INFO",
    "description": "User joebob1 has uploaded user_generated_content.png",
    ...
}
```

---

#### upload_stored[filename,from,to]

**Description**
One step in good file upload validation is to move/rename the file and when providing the content back to end users, never reference the original filename in the download. This is true both when storing in a filesystem as well as in block storage.

**Level:**: INFO

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "upload_stored:user_generated_content.png,kjsdhkrjhwijhsiuhdf000010202002",
    "level": "INFO",
    "description": "File user_generated_content.png was stored in the database with key abcdefghijk101010101",
    ...
}
```

---

#### upload_validation[filename,(virusscan|imagemagick|...):(FAILED|incomplete|passed)]

**Description**
All file uploads should have some validation performed, both for correctness (is in fact of file type x), and for safety (does not contain a virus).

**Level:**: INFO|CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "upload_validation:filename,virusscan:FAILED",
    "level": "CRITICAL",
    "description": "File user_generated_content.png FAILED virus scan and was purged",
    ...
}
```

---

#### upload_delete[userid,fileid]

**Description**
When a file is deleted for normal reasons it should be recorded.

**Level:**: INFO

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "upload_delete:joebob1,",
    "level": "INFO",
    "description": "User joebob1 has marked file abcdefghijk101010101 for deletion.",
    ...
}
```

---

### Input Validation [INPUT]

#### input_validation_fail:[(fieldone,fieldtwo...),userid]

**Description**
When input validation fails on the server-side it must either be because a) sufficient validation was not provided on the client, or b) client-side validation was bypassed. In either case it's an opportunity for attack and should be mitigated quickly.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "input_validation_fail:(zip,date_of_birth),joebob1",
    "level": "WARN",
    "description": "User joebob1 submitted data that failed validation.",
    ...
}
```

---

#### input_validation_discrete_fail[:field,userid]

**Description**
When server-side validation of a value against a discrete list of options (e.g. drop down list, radio buttons) fails, it is a strong indication of malicious activity as this indicates the client-side code has been tampered with.

**Level:**
WARN

**Example:**

```json
{
    "datetime": "2021-02-01T08:30:00-0500",
    "appid": "foobar.netportal_auth",
    "event": "input_validation_discrete_fail:country,joebob1",
    "level": "WARN",
    "description": "User joebob1 submitted an invalid value for the 'country' field.",
    ...
}
```

---

### Malicious Behavior [MALICIOUS]

#### malicious_excess_404:[userid|IP,useragent]

**Description**
When a user makes numerous requests for files that don't exist it often is an indicator of attempts to "force-browse" for files that could exist and is often behavior indicating malicious intent.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "malicious_excess404:123.456.789.101,M@l1c10us-Hax0rB0t0-v1",
    "level": "WARN",
    "description": "A user at 123.456.789.101 has generated a large number of 404 requests.",
    ...
}
```

---

#### malicious_extraneous:[userid|IP,inputname,useragent]

**Description**
When a user submits data to a backend handler that was not expected it can indicate probing for input validation errors. If your backend service receives data it does not handle or have an input for this is an indication of likely malicious abuse.

**Level:**
CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "malicious_extraneous:dr@evil.com,creditcardnum,Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0",
    "level": "CRITICAL",
    "description": "User dr@evil.com included field creditcardnum in the request which is not handled by this service.",
    ...
}
```

---

#### malicious_attack_tool:[userid|IP,toolname,useragent]

**Description**
When obvious attack tools are identified either by signature or by user agent they should be logged.

For example, the tool "Nikto" leaves behind its user agent by default with a string like **_"Mozilla/5.00 (Nikto/2.1.6) (Evasions:None) (Test:Port Check)"_**

**Level:**
CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "malicious_attack_tool:127.0.0.1,nikto,Mozilla/5.00 (Nikto/2.1.6) (Evasions:None) (Test:Port Check)",
    "level": "CRITICAL",
    "description": "Attack traffic indicating use of Nikto coming from 127.0.0.1",
    ...
}
```

---

#### malicious_sqli:[userid|IP,parameter,ruleid,useragent]

**Description**
When request input matches a SQL injection (SQLi) signature or heuristic, log the suspected attempt. Configure blocking under a tested policy and [tune false positives for the application](https://github.com/coreruleset/coreruleset/blob/main/crs-setup.conf.example); a detection match is not proof of exploitation. Use [parameterized queries and the other primary SQL injection defenses](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html#primary-defenses) regardless of detection rules.

_NOTE: Logging the payload is dangerous and may result in log injection. Prefer recording a detection rule ID / category and the parameter name over logging the full payload._

**Level:**
CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "malicious_sqli:127.0.0.1,search,SQLI-UNION,Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0",
    "level": "CRITICAL",
    "description": "Request from 127.0.0.1 contained a SQL injection pattern (rule SQLI-UNION) in parameter 'search'.",
    ...
}
```

---

#### malicious_cors:[userid|IP,useragent,referer]

**Description**
When attempts are made from unauthorized origins they should of course be blocked, but also logged whenever possible. Even if we block an illegal cross-origin request the fact that the request is being made could be an indication of attack.

_NOTE: Did you know that the word "referer" is misspelled in the original HTTP specification? The correct spelling should be "referrer" but the original typo persists to this day and is used here intentionally._

**Level:**
CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "malicious_cors:127.0.0.1,Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0,attack.evil.com",
    "level": "CRITICAL",
    "description": "An illegal cross-origin request from 127.0.0.1 was referred from attack.evil.com"
    ...
}
```

---

#### malicious_direct_reference:[userid|IP, useragent]

**Description**
A common attack against authentication and authorization is to directly access an object without credentials or appropriate access authority. Failing to prevent this flaw used to be one of the OWASP Top Ten called **Insecure Direct Object Reference**. Assuming you've correctly prevented this attack, logging the attempt is valuable to identify malicious users.

**Level:**
CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "malicious_direct_reference:joebob1, Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0",
    "level": "CRITICAL",
    "description": "User joebob1 attempted to access an object to which they are not authorized",
    ...
}
```

---

#### malicious_csrf:[userid|IP]

**Description**
When a state-changing request arrives without a valid anti-CSRF token (or with a mismatched token, Origin, or Referer) it may indicate a cross-site request forgery attempt. Block the request and log the attempt. See the [OWASP Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) for token and Origin/Referer validation guidance.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "malicious_csrf:joebob1",
    "level": "WARN",
    "description": "A state-changing request from joebob1 was missing a valid anti-CSRF token",
    ...
}
```

---

#### malicious_csp_violation:[userid|IP,effective_directive,blocked_uri,useragent]

**Description**
When a browser reports a Content-Security-Policy violation to your report endpoint, log the violation. In Report-Only mode this is high-noise — browser extensions and injected third-party scripts trigger benign violations — so WARN is appropriate; promote to CRITICAL only if you treat enforced-mode blocks as attack signal.

_NOTE: CSP report fields such as `document-uri`, `referrer`, and `blocked-uri` are URL-valued (see the [W3C Content Security Policy Level 3](https://www.w3.org/TR/CSP3/#violation-events) violation report definition) and routinely contain full URLs whose query strings carry session or reset tokens. Strip the query string/fragment before logging, and prefer the effective-directive + blocked-uri (origin+path) over the full report body to avoid a secondary sensitive-data or log-injection risk._

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "malicious_csp_violation:203.0.113.7,script-src,https://foobar.com/dashboard,Mozilla/5.0",
    "level": "WARN",
    "description": "A CSP violation for directive script-src was reported by a browser at 203.0.113.7",
    ...
}
```

---

### MCP Servers [MCP]

This section focuses on concerns related to the use of MCP servers either within productivity applications, or at the enterprise level.

---

#### mcp_prompt_injection[:userid]

**Description**
When an MCP client or server detects indicators of prompt injection (for example, instructions to ignore system/developer messages, attempts to override tool policies, requests to reveal secrets, or attempts to coerce tool calls outside of the intended task), block or constrain the action and log the event for investigation.

_NOTE: Avoid logging the full prompt/tool I/O. Prefer logging a detection category or rule ID, the target tool/server, and request identifiers to support triage without creating a secondary sensitive-data or log-injection risk._

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.cooldevapp_mcp_toolname",
    "event": "mcp_prompt_injection:joebob1",
    "level": "WARN",
    "description": "A possible prompt injection has occurred",
    ...
}
```

---

#### mcp_resource_exhaustion[:userid]

**Description**
When an MCP client or server detects a request pattern intended to exhaust resources (for example, unusually large prompts, repeated retries, tool-call loops, or other behavior that drives excessive token usage and cost), terminate or throttle the activity and log the attempt.

_NOTE: Avoid logging full prompts or tool inputs/outputs. Prefer logging measured usage (tokens in/out), policy thresholds, request identifiers, and the tool/model involved._

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.cooldevapp_mcp_toolname",
    "event": "mcp_resource_exhaustion:joebob1",
    "level": "WARN",
    "description": "Request blocked due to token budget overrun (tokens_in=18240, tokens_out=0, budget=8000)",
    ...
}
```

---

#### mcp_tool_poisoning[:userid]

**Description**
When an MCP client or server detects that a tool may be malicious or tampered with (for example, unexpected tool changes, signature/hash verification failures, suspicious tool metadata, or a tool sourced from an agent/tool marketplace with minimal validation), block or quarantine the tool and log the attempt.

_NOTE: Tool ecosystems and agent marketplaces can enable rapid proliferation of third-party tools with relatively low validation. An internal marketplace or hashed allowlist for approved tools is highly recommended._

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.cooldevapp_mcp_toolname",
    "event": "mcp_tool_poisoning:joebob1",
    "level": "WARN",
    "description": "Tool execution blocked (tool=\"calendar_sync\", source=\"https://marketplace.example/tools/calendar_sync\", version=\"2.4.1\", signature=\"missing\", policy=\"allowlist_required\")",
    ...
}
```

---

### Privilege Changes [PRIVILEGE]

This section focuses on object privilege changes such as read/write/execute permissions or objects in a database having authorization meta-information changed.

Changes to user/account are covered in the User Management section.

---

#### privilege_permissions_changed:[userid,file|object,fromlevel,tolevel]

**Description**
Tracking changes to objects to which there are access control restrictions can uncover attempt to escalate privilege on those files by unauthorized users.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "permissions_changed:joebob1, /users/admin/some/important/path,0511,0777",
    "level": "WARN",
    "description": "User joebob1 changed permissions on /users/admin/some/important/path",
    ...
}
```

---

### Sensitive Data Changes [DATA]

It's not necessary to log or alert on changes to all files, but in the case of highly sensitive files or data it is important that we monitor and alert on changes.

---

#### sensitive_create:[userid,file|object]

**Description**
When a new piece of data is created and marked as sensitive or placed into a directory/table/repository where sensitive data is stored, that creation should be logged and reviewed periodically.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "sensitive_create:joebob1, /users/admin/some/important/path",
    "level": "WARN",
    "description": "User joebob1 created a new file in /users/admin/some/important/path",
    ...
}
```

---

#### sensitive_read:[userid,file|object]

**Description**
All data marked as sensitive or placed into a directory/table/repository where sensitive data is stored should be have access logged and reviewed periodically.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "sensitive_read:joebob1, /users/admin/some/important/path",
    "level": "WARN",
    "description": "User joebob1 read file /users/admin/some/important/path",
    ...
}
```

---

#### sensitive_update:[userid,file|object]

**Description**
All data marked as sensitive or placed into a directory/table/repository where sensitive data is stored should be have updates to the data logged and reviewed periodically.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "sensitive_update:joebob1, /users/admin/some/important/path",
    "level": "WARN",
    "description": "User joebob1 modified file /users/admin/some/important/path",
    ...
}
```

---

#### sensitive_delete:[userid,file|object]

**Description**
Log and periodically review deletion events for sensitive files and data. Record the action and object identifier without copying the sensitive contents into the log. Retain the underlying data according to the applicable [information-retention requirements (NIST SI-12)](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf#page=378), then [securely dispose of it and retained copies when no longer needed (SI-12(3))](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf#page=379). Keep the deletion audit record according to the [log retention and disposal requirements](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#disposal-of-logs); recording a deletion event does not itself require archiving the deleted file.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "sensitive_delete:joebob1, /users/admin/some/important/path",
    "level": "WARN",
    "description": "User joebob1 deleted file /users/admin/some/important/path",
    ...
}
```

---

### Sequence Errors [SEQUENCE]

Also called a **_business logic attack_**, if a specific path is expected through a system and an attempt is made to skip or change the order of that path it could indicate malicious intent.

---

#### sequence_fail:[userid]

**Description**
When a user reaches a part of the application out of sequence it may indicate intentional abuse of the business logic and should be tracked.

**Level:**
CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "sequence_fail:joebob1",
    "level": "CRITICAL",
    "description": "User joebob1 has reached a part of the application out of the normal application flow.",
    ...
}
```

---

### Session Management [SESSION]

#### session_created:[userid]

**Description**
When a new authenticated session is created that session may be logged and activity monitored.

**Level:**
INFO

**Example:**

```
    {
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "session_created:joebob1",
    "level": "INFO",
    "description": "User joebob1 has started a new session",
    ...
}
```

---

#### session_renewed:[userid]

**Description**
When a user is warned of session to be expired/revoked and chooses to extend their session that activity should be logged. Also, if the system in question contains highly confidential data then extending a session may require additional verification.

**Level:**
INFO

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "session_renewed:joebob1",
    "level": "INFO",
    "description": "User joebob1 was warned of expiring session and extended.",
    ...
}
```

---

#### session_expired:[userid,reason]

**Description**
When a session expires, especially in the case of an authenticated session or with sensitive data, then that session expiry may be logged and clarifying data included. The reason code may be any such as: logout, timeout, revoked, etc. Sessions should never be deleted but rather expired in the case of revocation requirement.

**Level:**
INFO

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "session_expired:joebob1,revoked",
    "level": "INFO",
    "description": "User joebob1 session expired due to administrator revocation.",
    ...
}
```

---

#### session_logout:[userid]

**Description**
When a user explicitly logs out (as opposed to a timeout or administrative revocation) the event may be logged. This is a more explicit alternative to `session_expired:[userid,logout]` for systems that distinguish a user-initiated logout. Do not include the raw session ID or bearer token. If session correlation is needed, follow the [Session Management logging guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#logging-sessions-life-cycle-monitoring-creation-usage-and-destruction-of-session-ids).

**Level:**
INFO

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "session_logout:joebob1",
    "level": "INFO",
    "description": "User joebob1 logged out",
    ...
}
```

---

#### session_use_after_expire:[userid]

**Description**
In the case a user attempts to access systems with an expire session it may be helpful to log, especially if combined with subsequent login failure. This could identify a case where a malicious user is attempting a session hijack or directly accessing another person's machine/browser.

**Level:**
CRITICAL

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "session_use_after_expire:joebob1",
    "level": "CRITICAL",
    "description": "User joebob1 attempted access after session expired.",
    ...
}
```

---

### System Events [SYS]

#### sys_startup:[userid]

**Description**
When a system is first started it can be valuable to log the startup, even if the system is serverless or a container, especially if possible to log the user that initiated the system.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "sys_startup:joebob1",
    "level": "WARN",
    "description": "User joebob1 spawned a new instance",
    ...
}
```

---

#### sys_shutdown:[userid]

**Description**
When a system is shut down it can be valuable to log the event, even if the system is serverless or a container, especially if possible to log the user that initiated the system.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "sys_shutdown:joebob1",
    "level": "WARN",
    "description": "User joebob1 stopped this instance",
    ...
}
```

---

#### sys_restart:[userid]

**Description**
When a system is restarted it can be valuable to log the event, even if the system is serverless or a container, especially if possible to log the user that initiated the system.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "sys_restart:joebob1",
    "level": "WARN",
    "description": "User joebob1 initiated a restart",
    ...
}
```

---

#### sys_crash[:reason]

**Description**
If possible to catch an unstable condition resulting in the crash of a system, logging that event could be helpful, especially if the event is triggered by an attack.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "sys_crash:outofmemory,
    "level": "WARN",
    "description": "The system crashed due to Out of Memory error.",
    ...
}
```

---

#### sys_monitor_disabled:[userid,monitor]

**Description**
If your systems contain agents responsible for file integrity, resources, logging, virus, etc. it is especially valuable to know if they are halted and by whom.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "sys_monitor_disabled:joebob1,crowdstrike",
    "level": "WARN",
    "description": "User joebob1 has disabled CrowdStrike",
    ...
}
```

---

#### sys_monitor_enabled:[userid,monitor]

**Description**
If your systems contain agents responsible for file integrity, resources, logging, virus, etc. it is especially valuable to know if they are started again after being stopped, and by whom.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "sys_monitor_enabled:joebob1,crowdstrike",
    "level": "WARN",
    "description": "User joebob1 has enabled CrowdStrike",
    ...
}
```

---

### User Management [USER]

#### user_created:[userid,newuserid,attributes[one,two,three]]

**Description**
When creating new users, logging the specifics of the user creation event is helpful, especially if new users can be created with administration privileges.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "user_created:joebob1,user1,admin:create,update,delete",
    "level": "WARN",
    "description": "User joebob1 created user1 with admin:create,update,delete privilege attributes",
    ...
}
```

---

#### user_updated:[userid,onuserid,attributes[one,two,three]]

**Description**
When updating users, logging the specifics of the user update event is helpful, especially if users can be updated with administration privileges.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "user_updated:joebob1,user1,admin:create,update,delete",
    "level": "WARN",
    "description": "User joebob1 updated user1 with attributes admin:create,update,delete privilege attributes",
    ...
}
```

---

#### user_archived:[userid,onuserid]

**Description**
It is always best to archive users rather than deleting, except where required. When archiving users, logging the specifics of the user archive event is helpful. A malicious user could use this feature to deny service to legitimate users.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "user_archived:joebob1,user1",
    "level": "WARN",
    "description": "User joebob1 archived user1",
    ...
}
```

---

#### user_deleted:[userid,onuserid]

**Description**
It is always best to archive users rather than deleting, except where required. When deleting users, logging the specifics of the user delete event is helpful. A malicious user could use this feature to deny service to legitimate users.

**Level:**
WARN

**Example:**

```
{
    "datetime": "2019-01-01 00:00:00,000",
    "appid": "foobar.netportal_auth",
    "event": "user_deleted:joebob1,user1",
    "level": "WARN",
    "description": "User joebob1 has deleted user1",
    ...
}
```

---

### Exclusions

As important as what you DO log is what you DON'T log. Private or secret information, source code, keys, certs, etc. should never be logged.

For comprehensive overview of items that should be excluded from logging, please see the [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude).

## Error Handling

> **Source:** [Error Handling](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Error handling is a part of the overall security of an application. Except in movies, an attack always begins with a **Reconnaissance** phase in which the attacker will try to gather as much technical information (often *name* and *version* properties) as possible about the target, such as the application server, frameworks, libraries, etc.

Unhandled errors can assist an attacker in this initial phase, which is very important for the rest of the attack.

The OWASP Web Security Testing Guide explains [how error messages can expose application details](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/08-Testing_for_Error_Handling/01-Testing_For_Improper_Error_Handling/).

### Context

Issues at the error handling level can reveal a lot of information about the target and can also be used to identify injection points in the target's features.

Below is an example of the disclosure of a technology stack, here the Struts2 and Tomcat versions, via an exception rendered to the user:

```text
HTTP Status 500 - For input string: "null"

type Exception report

message For input string: "null"

description The server encountered an internal error that prevented it from fulfilling this request.

exception

java.lang.NumberFormatException: For input string: "null"
    java.lang.NumberFormatException.forInputString(NumberFormatException.java:65)
    java.lang.Integer.parseInt(Integer.java:492)
    java.lang.Integer.parseInt(Integer.java:527)
    sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:57)
    sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
    java.lang.reflect.Method.invoke(Method.java:606)
    com.opensymphony.xwork2.DefaultActionInvocation.invokeAction(DefaultActionInvocation.java:450)
    com.opensymphony.xwork2.DefaultActionInvocation.invokeActionOnly(DefaultActionInvocation.java:289)
    com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:252)
    org.apache.struts2.interceptor.debugging.DebuggingInterceptor.intercept(DebuggingInterceptor.java:256)
    com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:246)
    ...

note: The full stack trace of the root cause is available in the Apache Tomcat/7.0.56 logs.
```

Below is an example of disclosure of a SQL query error, along with the site installation path, that can be used to identify an injection point:

```text
Warning: odbc_fetch_array() expects parameter /1 to be resource, boolean given
in D:\app\index_new.php on line 188
```

The [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/01-Information_Gathering/) provides different techniques to obtain technical information from an application.

### Objective

The article shows how to configure a global error handler as part of your application's runtime configuration. In some cases, it may be more efficient to define this error handler as part of your code. The outcome being that when an unexpected error occurs then a generic response is returned by the application but the error details are logged server side for investigation, and not returned to the user.

The following schema shows the target approach:

![Overview](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Error_Handling_Cheat_Sheet_Overview.png)

As most recent application topologies are *API based*, we assume in this article that the backend exposes only a REST API and does not contain any user interface content. The application should try and exhaustively cover all possible failure modes and use 5xx errors only to indicate responses to requests that it cannot fulfill, but not provide any content as part of the response that would reveal implementation details. For that, [RFC 7807 - Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc7807) defines a document format.
For the error logging operation itself, the [logging cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) should be used. This article focuses on the error handling part.

### Proposition

For each technology stack, the following configuration options are proposed:

#### Standard Java Web Application

For this kind of application, a global error handler can be configured at the **web.xml** deployment descriptor level.

We propose here a configuration that can be used from Servlet specification *version 2.5* and above.

With this configuration, any unexpected error will cause a redirection to the page **error.jsp** in which the error will be traced and a generic response will be returned.

Configuration of the redirection into the **web.xml** file:

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ns="http://java.sun.com/xml/ns/javaee"
xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
version="3.0">
...
    <error-page>
        <exception-type>java.lang.Exception</exception-type>
        <location>/error.jsp</location>
    </error-page>
...
</web-app>
```

Content of the **error.jsp** file:

``` java
<%@ page language="java" isErrorPage="true" contentType="application/json; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%
String errorMessage = exception.getMessage();
//Log the exception via the content of the implicit variable named "exception"
//...
//We build a generic response with a JSON format because we are in a REST API app context
//We also add an HTTP response header to indicate to the client app that the response is an error
response.setHeader("X-ERROR", "true");
//Note that we're using an internal server error response
//In some cases it may be prudent to return 4xx error codes, when we have misbehaving clients
response.setStatus(500);
%>
{"message":"An error occur, please retry"}
```

#### Java SpringMVC/SpringBoot web application

With [SpringMVC](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html) or [SpringBoot](https://spring.io/projects/spring-boot), you can define a global error handler by implementing the following class in your project. Spring Framework 6 introduced [the problem details based on RFC 7807](https://github.com/spring-projects/spring-framework/issues/27052).

We indicate to the handler, via the annotation [@ExceptionHandler](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/ExceptionHandler.html), to act when any exception extending the class *java.lang.Exception* is thrown by the application. We also use the [ProblemDetail class](https://docs.spring.io/spring-framework/docs/6.0.0/javadoc-api/org/springframework/http/ProblemDetail.html) to create the response object.

``` java
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Global error handler in charge of returning a generic response in case of unexpected error situation.
 */
@RestControllerAdvice
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = {Exception.class})
    public ProblemDetail handleGlobalError(Exception exception, WebRequest request) {
        //Log the exception via the content of the parameter named "exception"
        //...
        //Note that we're using an internal server error response
        //In some cases it may be prudent to return 4xx error codes, if we have misbehaving clients
        //By specification, the content-type can be "application/problem+json" or "application/problem+xml"
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "An error occur, please retry");
    }
}
```

References:

- [Exception handling with Spring](https://www.baeldung.com/exception-handling-for-rest-with-spring)
- [Exception handling with SpringBoot](https://www.toptal.com/java/spring-boot-rest-api-error-handling)

#### ASP NET Core web application

With [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/?view=aspnetcore-2.2), you can define a global error handler by indicating that the exception handler is a dedicated API Controller.

Content of the API Controller dedicated to the error handling:

``` csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;

namespace MyProject.Controllers
{
    /// <summary>
    /// API Controller used to intercept and handle all unexpected exception
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class ErrorController : ControllerBase
    {
        /// <summary>
        /// Action that will be invoked for any call to this Controller in order to handle the current error
        /// </summary>
        /// <returns>A generic error formatted as JSON because we are in a REST API app context</returns>
        [HttpGet]
        [HttpPost]
        [HttpHead]
        [HttpDelete]
        [HttpPut]
        [HttpOptions]
        [HttpPatch]
        public JsonResult Handle()
        {
            //Get the exception that has implied the call to this controller
            Exception exception = HttpContext.Features.Get<IExceptionHandlerFeature>()?.Error;
            //Log the exception via the content of the variable named "exception" if it is not NULL
            //...
            //We build a generic response with a JSON format because we are in a REST API app context
            //We also add an HTTP response header to indicate to the client app that the response
            //is an error
            var responseBody = new Dictionary<String, String>{ {
                "message", "An error occur, please retry"
            } };
            JsonResult response = new JsonResult(responseBody);
            //Note that we're using an internal server error response
            //In some cases it may be prudent to return 4xx error codes, if we have misbehaving clients
            response.StatusCode = (int)HttpStatusCode.InternalServerError;
            Request.HttpContext.Response.Headers.Remove("X-ERROR");
            Request.HttpContext.Response.Headers.Add("X-ERROR", "true");
            return response;
        }
    }
}
```

Definition in the application **Startup.cs** file of the mapping of the exception handler to the dedicated error handling API controller:

``` csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MyProject
{
    public class Startup
    {
...
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            //First we configure the error handler middleware!
            //We enable the global error handler in others environments than DEV
            //because debug page are useful during implementation
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                //Our global handler is defined on "/api/error" URL so we indicate to the
                //exception handler to call this API controller
                //on any unexpected exception raised by the application
                app.UseExceptionHandler("/api/error");

                //To customize the response content type and text, use the overload of
                //UseStatusCodePages that takes a content type and format string.
                app.UseStatusCodePages("text/plain", "Status code page, status code: {0}");
            }

            //We configure others middlewares, remember that the declaration order is important...
            app.UseMvc();
            //...
        }
    }
}
```

References:

- [Exception handling with ASP.Net Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/error-handling?view=aspnetcore-2.1)

#### ASP NET Web API web application

With [ASP.NET Web API](https://www.asp.net/web-api) (from the standard .NET framework and not from the .NET Core framework), you can define and register handlers in order to trace and handle any error that occurs in the application.

Definition of the handler for the tracing of the error details:

``` csharp
using System;
using System.Web.Http.ExceptionHandling;

namespace MyProject.Security
{
    /// <summary>
    /// Global logger used to trace any error that occurs at application wide level
    /// </summary>
    public class GlobalErrorLogger : ExceptionLogger
    {
        /// <summary>
        /// Method in charge of the management of the error from a tracing point of view
        /// </summary>
        /// <param name="context">Context containing the error details</param>
        public override void Log(ExceptionLoggerContext context)
        {
            //Get the exception
            Exception exception = context.Exception;
            //Log the exception via the content of the variable named "exception" if it is not NULL
            //...
        }
    }
}
```

Definition of the handler for the management of the error in order to return a generic response:

``` csharp
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.ExceptionHandling;

namespace MyProject.Security
{
    /// <summary>
    /// Global handler used to handle any error that occurs at application wide level
    /// </summary>
    public class GlobalErrorHandler : ExceptionHandler
    {
        /// <summary>
        /// Method in charge of handle the generic response send in case of error
        /// </summary>
        /// <param name="context">Error context</param>
        public override void Handle(ExceptionHandlerContext context)
        {
            context.Result = new GenericResult();
        }

        /// <summary>
        /// Class used to represent the generic response send
        /// </summary>
        private class GenericResult : IHttpActionResult
        {
            /// <summary>
            /// Method in charge of creating the generic response
            /// </summary>
            /// <param name="cancellationToken">Object to cancel the task</param>
            /// <returns>A task in charge of sending the generic response</returns>
            public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
            {
                //We build a generic response with a JSON format because we are in a REST API app context
                //We also add an HTTP response header to indicate to the client app that the response
                //is an error
                var responseBody = new Dictionary<String, String>{ {
                    "message", "An error occur, please retry"
                } };
                // Note that we're using an internal server error response
                // In some cases it may be prudent to return 4xx error codes, if we have misbehaving clients
                HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Headers.Add("X-ERROR", "true");
                response.Content = new StringContent(JsonConvert.SerializeObject(responseBody),
                                                     Encoding.UTF8, "application/json");
                return Task.FromResult(response);
            }
        }
    }
}
```

Registration of the both handlers in the application **WebApiConfig.cs** file:

``` csharp
using MyProject.Security;
using System.Web.Http;
using System.Web.Http.ExceptionHandling;

namespace MyProject
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            //Register global error logging and handling handlers in first
            config.Services.Replace(typeof(IExceptionLogger), new GlobalErrorLogger());
            config.Services.Replace(typeof(IExceptionHandler), new GlobalErrorHandler());
            //Rest of the configuration
            //...
        }
    }
}
```

Setting customErrors section to the **Web.config** file within the ```csharp <system.web>``` node as follows.

```csharp
<configuration>
    ...
    <system.web>
        <customErrors mode="RemoteOnly"
                      defaultRedirect="~/ErrorPages/Oops.aspx" />
        ...
    </system.web>
</configuration>
```

References:

- [Exception handling with ASP.Net Web API](https://exceptionnotfound.net/the-asp-net-web-api-exception-handling-pipeline-a-guided-tour/)

- [ASP.NET Error Handling](https://docs.microsoft.com/en-us/aspnet/web-forms/overview/getting-started/getting-started-with-aspnet-45-web-forms/aspnet-error-handling)

### Sources of the prototype

The source code of all the sandbox projects created to find the right setup to use is stored in this [GitHub repository](https://github.com/righettod/poc-error-handling).

### Appendix HTTP Errors

A reference for HTTP errors can be found here [RFC 2616](https://www.ietf.org/rfc/rfc2616.txt). Using error messages that do not provide implementation details is important to avoid information leakage. In general, consider using 4xx error codes for requests that are due to an error on the part of the HTTP client (e.g. unauthorized access, request body too large) and use 5xx to indicate errors that are triggered on server side, due to an unforeseen bug. Ensure that applications are monitored for 5xx errors which are a good indication of the application failing for some sets of inputs.

## Virtual Patching

> **Source:** [Virtual Patching](https://cheatsheetseries.owasp.org/cheatsheets/Virtual_Patching_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

The goal with this cheat Sheet is to present a concise virtual patching framework that organizations can follow to maximize the timely implementation of mitigation protections.

### Definition: Virtual Patching

**A security policy enforcement layer that detects and blocks matching exploitation attempts against a known vulnerability without changing the vulnerable code.**

A virtual patch reduces exposure only for traffic the enforcement layer inspects and attack variants its rules recognize. It does not remove the underlying vulnerability. Test for bypasses and continue the code or vendor fix; [rule matching and transformations can miss attacks](https://coreruleset.org/docs/3-about-rules/creating/#advanced-transformation-usage).

### Why Not Just Fix the Code

From a purely technical perspective, the number one remediation strategy would be for an organization to correct the identified vulnerability within the source code of the web application. This concept is universally agreed upon by both web application security experts and system owners. Unfortunately, in real world business situations, there arise many scenarios where updating the source code of a web application is not easy such as:

- **Lack of resources** - Devs are already allocated to other projects.
- **Third-party Software** - Code can not be modified by the user.
- **Outsourced App Dev** - Changes would require a new project.

The important point is this - **Code level fixes and Virtual Patching are NOT mutually exclusive**. They are processes that are executed by different team (OWASP Builders/Devs vs. OWASP Defenders/OpSec) and can be run in tandem.

### Value of Virtual Patching

The two main goals of Virtual Patching are:

- **Minimize Time-to-Fix** - Fixing application source code takes time. The main purpose of a virtual patch is to implement a mitigation for the identified vulnerability as soon as possible. The urgency of this response may be different: for example if the vulnerability was identified in-house through code reviews or penetration testing vs. finding a vulnerability as part of live incident response.
- **Attack Surface Reduction** - Block the known exploitation path while a permanent fix is prepared. Test alternate encodings, affected endpoints, and paths that bypass the enforcement layer before claiming coverage. A passing test for one payload does not establish complete protection; [Core Rule Set (CRS) rule-writing guidance](https://coreruleset.org/docs/3-about-rules/creating/#advanced-transformation-usage) illustrates how small payload changes can evade a rule.

### Virtual Patching Tools

Notice that the definition above did not list any specific tool as there are a number of different options that may be used for virtual patching efforts such as:

- Intermediary devices such as a WAF or IPS appliance
- Web server plugin such as ModSecurity
- Application layer filter such as ESAPI WAF

For example purposes, we will show virtual patching examples using the open source [ModSecurity WAF tool](http://www.modsecurity.org).

### A Virtual Patching Methodology

Virtual Patching, like most other security processes, is not something that should be approached haphazardly. Instead, a consistent, repeatable process should be followed that will provide the best chances of success. The following virtual patching workflow mimics the industry accepted practice for conducting IT Incident Response and consists of the following phases:

1. Preparation.
2. Identification.
3. Analysis.
4. Virtual Patch Creation.
5. Implementation/Testing.
6. Recovery/Follow Up.

### Example Public Vulnerability

Let's take the following [SQL Injection vulnerability](https://packetstormsecurity.com/files/119217/WordPress-Shopping-Cart-8.1.14-Shell-Upload-SQL-Injection.html) as our example for the remainder of this article:

```text
WordPress Shopping Cart Plugin for WordPress
/wp-content/plugins/levelfourstorefront/scripts/administration/exportsubscribers.php
reqID Parameter prone to SQL Injection.
```

**Description**:

WordPress Shopping Cart Plugin for WordPress contains a flaw that may allow an attacker to carry out an SQL injection attack.

The issue is due to the `/wp-content/plugins/levelfourstorefront/scripts/administration/exportsubscribers.php` script not properly sanitizing user-supplied input to the `reqID` parameter.

This may allow an attacker to inject or manipulate SQL queries in the back-end database, allowing for the manipulation or disclosure of arbitrary data.

### Preparation Phase

The importance of properly utilizing the preparation phase with regards to virtual patching cannot be overstated. You need to do a number of things to setup the virtual patching processes and framework **prior** to actually having to deal with an identified vulnerability, or worse yet, react to a live web application intrusion. The point is that during a live compromise is not the ideal time to be proposing installation of a web application firewall and the concept of a virtual patch. Tension is high during real incidents and time is of the essence, so lay the foundation of virtual patching when the waters are calm and get everything in place and ready to go when an incident does occur.

Here are a few critical items that should be addressed during the preparation phase:

- **Public/Vendor Vulnerability Monitoring** - Ensure that you are signed up for all vendor alert mail-lists for commercial software that you are using. This will ensure that you will be notified in the event that the vendor releases vulnerability information and patching data.
<!-- textlint-disable -->
- **Virtual Patching Pre-Authorization** – Establish an expedited review and rollout process before an incident. Test both exploit attempts and legitimate application workflows: [false positives can block valid transactions](https://coreruleset.org/docs/2-how-crs-works/2-3-false-positives-and-tuning/#poor-user-experience) even though application code is unchanged. Define monitoring and rollback criteria before enabling blocking.
<!-- textlint-enable -->
- **Deploy Virtual Patching Tool In Advance** - As time is critical during incident response, it would be a poor time to have to get approvals to install new software. For instance, you can install ModSecurity WAF in embedded mode on your Apache servers, or an Apache reverse proxy server. The advantage with this deployment is that you can create fixes for non-Apache back-end servers. Even if you do not use ModSecurity under normal circumstances, it is best to have it "on deck" ready to be enabled if need be.
- **Configure HTTP Audit Logging** – Record the rule ID, timestamp, affected endpoint, enforcement outcome, and a correlation identifier for investigation. Avoid indiscriminate capture of query strings, headers, cookies, and request or response bodies: [WAF alerts can expose passwords and payment data](https://coreruleset.org/docs/2-how-crs-works/2-3-false-positives-and-tuning/#sensitive-information-and-regulatory-compliance). Exclude or redact sensitive fields before logging, following the [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude).

### Identification Phase

The Identification Phase occurs when an organization becomes aware of a vulnerability within their web application. There are generally two different methods of identifying vulnerabilities: `Proactive` and `Reactive`.

#### Proactive Identification

This occurs when an organization takes it upon themselves to assess their web security posture and conducts the following tasks:

- **Dynamic Application Assessments** - Ethical attackers conduct penetration tests or automated web assessment tools are run against the live web application to identify flaws.
- **Source code reviews** - Ethical attackers use manual/automated means to analyze the source code of the web application to identify flaws.

Due to the fact that custom coded web applications are unique, these proactive identification tasks are extremely important as you are not able to rely upon third-party vulnerability notifications.

#### Reactive Identification

There are three main reactive methods for identifying vulnerabilities:

- **Vendor contact (e.g. pre-warning)** - Occurs when a vendor discloses a vulnerability for commercial web application software that you are using. Example is Microsoft's [Active Protections Program (MAPP)](https://www.microsoft.com/en-us/msrc/mapp)
- **Public disclosure** - Public vulnerability disclosure for commercial/open source web application software that you are using. The threat level for public disclosure is increased as more people know about the vulnerability.
- **Security incident** – This is the most urgent situation as the attack is active. In these situations, remediation must be immediate.

### Analysis Phase

Here are the recommended steps to start the analysis phase:

1. **Determine Virtual Patching Applicability** - Virtual patching is ideally suited for injection-type flaws but may not provide an adequate level of attack surface reduction for other attack types or categories. Thorough analysis of the underlying flaw should be conducted to determine if the virtual patching tool has adequate detection logic capabilities.
2. **Utilize Bug Tracking/Ticketing System** - Enter the vulnerability information into a bug tracking system for tracking purposes and metrics. Recommend you use ticketing systems you already use such as Jira or you may use a specialized tool such as [ThreadFix](https://threadfix.it/).
3. **Verify the name of the vulnerability** - This means that you need to have the proper public vulnerability identifier (such as CVE name/number) specified by the vulnerability announcement, vulnerability scan, etc. If the vulnerability is identified proactively rather than through public announcements, then you should assign your own unique identifier to each vulnerability.
4. **Designate the impact level** - It is always important to understand the level of criticality involved with a web vulnerability. Information leakages may not be treated in the same manner as an SQL Injection issue.
5. **Specify which versions of software are impacted** - You need to identify what versions of software are listed so that you can determine if the version(s) you have installed are affected.
6. **List what configuration is required to trigger the problem** - Some vulnerabilities may only manifest themselves under certain configuration settings.
7. **List Proof of Concept (PoC) exploit code or payloads used during attacks/testing** - Many vulnerability announcements have accompanying exploit code that shows how to demonstrate the vulnerability. If this data is available, make sure to download it for analysis. This will be useful later on when both developing and testing the virtual patch.

### Virtual Patch Creation Phase

The process of creating an accurate virtual patch is bound by two main tenants:

1. **No false positives** - Do not ever block legitimate traffic under any circumstances.
2. **No false negatives** - Do not ever miss attacks, even when the attacker intentionally tries to evade detection.

Care should be taken to attempt to minimize either of these two rules. It may not be possible to adhere 100% to each of these goals but remember that virtual patching is about **Risk Reduction**. It should be understood by business owners that while you are gaining the advantage of shortening the Time-to-Fix metric, you may not be implementing a complete fix for the flaw.

#### Manual Virtual Patch Creation

##### Positive Security (Allow List) Virtual Patches (**Recommended Solution**)

Positive security model (allowlist) is a comprehensive security mechanism that provides an independent input validation envelope to an application. The model specifies the characteristics of valid input (character set, length, etc…) and denies anything that does not conform. By defining rules for every parameter in every page in the application the application is protected by an additional security envelop independent from its code.

###### Example Allow List ModSecurity Virtual Patch

In order to create an allow-list virtual patch, you must be able to verify what the normal, expected input values are. If you have implemented proper audit logging as part of the Preparation Phase, then you should be able to review audit logs to identify the format of expected input types. In this case, the `reqID` parameter is supposed to only hold integer characters so we can use this virtual patch:

```text
##
## Verify we only receive 1 parameter called "reqID"
##
SecRule REQUEST_URI "@contains /wp-content/plugins/levelfourstorefront/scripts/administration/exportsubscribers.php" "chain,id:1,phase:2,t:none,t:Utf8toUnicode,t:urlDecodeUni,t:normalizePathWin,t:lowercase,block,msg:'Input Validation Error for \'reqID\' parameter - Duplicate Parameters Names Seen.',logdata:'%{matched_var}'"
  SecRule &ARGS:/reqID/ "!@eq 1"

##
## Verify reqID's payload only contains integers
##
SecRule REQUEST_URI "@contains /wp-content/plugins/levelfourstorefront/scripts/administration/exportsubscribers.php" "chain,id:2,phase:2,t:none,t:Utf8toUnicode,t:urlDecodeUni,t:normalizePathWin,t:lowercase,block,msg:'Input Validation Error for \'reqID\' parameter.',logdata:'%{args.reqid}'"
  SecRule ARGS:/reqID/ "!@rx ^[0-9]+$"
```

This virtual patch will inspect the `reqID` parameter value on the specified page and prevent any characters other than integers as input.

- **Note** - You should make sure to assign rule IDs properly and track them in the bug tracking system.
- **Caution**: There are numerous evasion vectors when creating virtual patches. Please consult the [OWASP Best Practices: Virtual Patching document](https://owasp.org/www-community/Virtual_Patching_Best_Practices) for a more thorough discussion on countering evasion methods.

##### Negative Security (Block List) Virtual Patches

A negative security model (denylist) is based on a set of rules that detect specific known attacks rather than allow only valid traffic.

###### Example Block List ModSecurity Virtual Patch

Here is the example [PoC code](https://packetstormsecurity.com/files/119217/WordPress-Shopping-Cart-8.1.14-Shell-Upload-SQL-Injection.html) that was supplied by the public advisory:

```text
http://localhost/wordpress/wp-content/plugins/levelfourstorefront/scripts/administration/exportsubscribers.php?reqID=1' or 1='1
```

Looking at the payload, we can see that the attacker is inserting a single quote character and then adding additional SQL query logic to the end. Based on this data, we could disallow the single quote character like this:

```text
SecRule REQUEST_URI "@contains /wp-content/plugins/levelfourstorefront/scripts/administration/exportsubscribers.php" "chain,id:1,phase:2,t:none,t:Utf8toUnicode,t:urlDecodeUni,t:normalizePathWin,t:lowercase,block,msg:'Input Validation Error for \'reqID\' parameter.',logdata:'%{args.reqid}'"
  SecRule ARGS:/reqID/ "@pm '"
```

##### Which Method is Better for Virtual Patching – Positive or Negative Security

A virtual patch may employ either a positive or negative security model. Which one you decide to use depends on the situation and a few different considerations. For example, negative security rules can usually be implemented more quickly, however the possible evasions are more likely.

Positive security rules, only the other hand, provides better protection however it is often a manual process and thus is not scalable and difficult to maintain for large/dynamic sites. While manual positive security rules for an entire site may not be feasible, a positive security model can be selectively employed when a vulnerability alert identifies a specific location with a problem.

##### Beware of Exploit-Specific Virtual Patches

You want to resist the urge to take the easy road and quickly create an **exploit-specific virtual patch**.

For instance, if an authorized penetration test identified an XSS vulnerability on a page and used the following attack payload in the report:

```html
<script>
  alert('XSS Test')
</script>
```

It would not be wise to implement a virtual patch that simply blocks that exact payload. While it may provide some immediate protection, its long term value is significantly decreased.

#### Automated Virtual Patch Creation

Manual patch creation may become unfeasible as the number of vulnerabilities grow and automated means may become necessary. If the vulnerabilities were identified using automated tools and an XML report is available, it is possible to leverage automated processes to auto-convert this vulnerability data into virtual patches for protection systems.

Three examples include:

- **OWASP ModSecurity Core Rule Set (CRS) Scripts** - The OWASP CRS includes scripts to auto-convert XML output from tools such as [ZAP into ModSecurity Virtual Patches]. Reference [here](https://www.trustwave.com/en-us/resources/blogs/spiderlabs-blog/modsecurity-advanced-topic-of-the-week-automated-virtual-patching-using-owasp-zed-attack-proxy).
- **ThreadFix Virtual Patching** - ThreadFix also includes automated processes of converting imported vulnerability XML data into virtual patches for security tools such as ModSecurity. Reference [here](https://github.com/denimgroup/threadfix/wiki/Waf-Types#mod_security).
- **Direct Importing to WAF Device** - Many commercial WAF products have the capability to import DAST tool XML report data and automatically adjust their protection profiles.

### Implementation/Testing Phase

In order to accurately test out the newly created virtual patches, it may be necessary to use an application other than a web browser. Some useful tools are:

- Web browser.
- Command-line web clients such as Curl and Wget.
- Local Proxy Servers such as [ZAP](https://www.zaproxy.org/).
- [ModSecurity AuditViewer](https://web.archive.org/web/20181011065823/http://www.jwall.org/web/audit/viewer.jsp) – which allows you to load a ModSecurity audit log file, manipulate it and then re-inject the data back into any web server.

#### Testing Steps

- Implement virtual patches initially in a "Log Only" configuration to ensure that you do not block any normal user traffic (false positives).
- If the vulnerability was identified by a specific tool or assessment team - request a retest.
- If retesting fails due to evasions, then you must go back to the Analysis phase to identify how to better fix the issue.

### Recovery/Follow-Up Phase

- **Update Data in Ticket System** - Although you may need to expedite the implementation of virtual patches, you should still track them in your normal Patch Management processes. This means that you should create proper change request tickets, etc… so that their existence and functionality is documented. Updating the ticket system also helps to identify "time-to-fix" metrics for different vulnerability types. Make sure to properly log the virtual patch rule ID values.
- **Periodic Re-assessments** - You should also have periodic re-assessments to verify if/when you can remove previous virtual patches if the web application code has been updated with the real source code fix. I have found that many people opt to keep virtual patches in place due to better identification/logging vs. application or db capabilities.
- **Running Virtual Patch Alert Reports** - Run reports to identify if/when any of your virtual patches have triggered. This will show value for virtual patching in relation to windows of exposure for source code time-to-fix.

## Vulnerability Disclosure

> **Source:** [Vulnerability Disclosure](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet is intended to provide guidance on the vulnerability disclosure process for both security researchers and organizations. This is an area where collaboration is extremely important, but that can often result in conflict between the two parties.

**[Researchers](#reporting-vulnerabilities) should:**

- Ensure that any testing is legal and authorized.
- Respect the privacy of others.
- Make reasonable efforts to contact the security team of the organization.
- Provide sufficient details to allow the vulnerabilities to be verified and reproduced.
- Not demand payment or rewards for reporting vulnerabilities outside of an established bug bounty program.

**[Organizations](#receiving-vulnerability-reports) should:**

- Provide a clear method for researchers to securely report vulnerabilities.
- Clearly establish the scope and terms of any bug bounty programs.
- Respond to reports in a reasonable timeline.
- Communicate openly with researchers.
- Not threaten legal action against researchers.
- Request CVEs where appropriate.
- Publish clear security advisories and changelogs.
- Offer rewards and credit.

### Methods of Disclosure

There are a number of different models that can be followed when disclosing vulnerabilities, which are listed in the sections below.

#### Private Disclosure

In the private disclosure model, the vulnerability is reported privately to the organization. The organization may choose to publish the details of the vulnerabilities, but this is done at the discretion of the organization, not the researcher, meaning that many vulnerabilities may never be made public. The majority of bug bounty programs require that the researcher follows this model.

The main problem with this model is that if the vendor is unresponsive, or decides not to fix the vulnerability, then the details may never be made public. Historically this has lead to researchers getting fed up with companies ignoring and trying to hide vulnerabilities, leading them to the full disclosure approach.

#### Full Disclosure

With the full disclosure approach, the full details of the vulnerability are made public as soon as they are identified. This means that the full details (sometimes including exploit code) are available to attackers, often before a patch is available. The full disclosure approach is primarily used in response or organizations ignoring reported vulnerabilities, in order to put pressure on them to develop and publish a fix.

This makes the full disclosure approach very controversial, and it is seen as irresponsible by many people. Generally it should only be considered as a last resort, when all other methods have failed, or when exploit code is already publicly available.

#### Responsible or Coordinated Disclosure

Responsible disclosure attempts to find a reasonable middle ground between these two approaches. With responsible disclosure, the initial report is made privately, but with the full details being published once a patch has been made available (sometimes with a delay to allow more time for the patches to be installed).

In many cases, the researcher also provides a deadline for the organization to respond to the report, or to provide a patch. If this deadline is not met, then the researcher may adopt the full disclosure approach, and publish the full details.

Google's [Project Zero disclosure policy](https://projectzero.google/vulnerability-disclosure-policy.html) generally gives vendors 90 days to make a patch available, then publishes technical details 30 days after that patch. If no patch is available by the deadline, details are normally published at 90 days. The policy provides grace periods and a shorter deadline for vulnerabilities exploited in the wild; consult the policy for those exceptions.

### Reporting Vulnerabilities

This section is intended to provide guidance for security researchers on how to report vulnerabilities to organizations.

#### Warnings and Legality

Before carrying out any security research or reporting vulnerabilities, **ensure that you know and understand the laws in your jurisdiction**. This cheat sheet **does not constitute legal advice, and should not be taken as such.**.

The following points highlight a number of areas that should be considered:

- If you are carrying out testing under a bug bounty or similar program, the organization may have established [safe harbor](https://disclose.io) policies, that allow you to legally carry out testing, **as long as you stay within the scope and rules of their program**. Make sure that you read the scope carefully - stepping outside of the scope and rules may be a criminal offense.
- Some countries have laws restricting reverse engineering, so testing against locally installed software may not be permitted.
- Do not demand payment or other rewards as a condition of providing information on security vulnerabilities, or in exchange for not publishing the details or reporting them to industry regulators, as this may constitute extortion.
- If you receive bug bounty payments, these are generally considered as income, meaning that they may be taxable. Reporting this income and ensuring that you pay the appropriate tax on it is **your** responsibility.
- If you find vulnerabilities as part of your work, or on equipment owned by your employer, your employer may prevent you from reporting these or claiming a bug bounty. Read your contract carefully and consider taking legal advice before doing so.

#### Finding Contact Details

The first step in reporting a vulnerability is finding the appropriate person to report it to. Although some organizations have clearly published disclosure policies, many do not, so it can be difficult to find the correct place to report the issue.

Where there is no clear disclosure policy, the following areas may provide contact details:

- Bug bounty programs such as [BugCrowd](https://bugcrowd.com/programs), [HackerOne](https://hackerone.com/directory/programs), [huntr.dev](https://huntr.dev/bounties), [Open Bug Bounty](https://www.openbugbounty.org) or [Standoff](https://bugbounty.standoff365.com).
- A [security.txt](https://securitytxt.org) file on the website at `/.well-known/security.txt` as per [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.html#name-location-of-the-securitytxt). At minimum include the required Contact and Expires fields; optional fields such as Preferred-Languages, Canonical, Policy, and Hiring improve routing for ethical researchers.
- An existing issue tracking system.
- Generic email addresses such as `security@` or `abuse@`.
- The generic "Contact Us" page on the website.
- Social media platforms.
- Phoning the organization.
- Reaching out to the community.

When reaching out to people who are not dedicated security contacts, request the details for a relevant member of staff, rather than disclosing the vulnerability details to whoever accepts the initial contact (especially over social media).

If it is not possible to contact the organization directly, a national or sector-based  [CERT](https://en.wikipedia.org/wiki/Computer_emergency_response_team) may be able to assist.

#### Initial Report

Once a security contact has been identified, an initial report should be made of the details of the vulnerability. Ideally this should be done over an encrypted channel (such as the use of PGP keys), although many organizations do not support this.

The initial report should include:

- Sufficient details of the vulnerability to allow it to be understood and reproduced.
- HTTP requests and responses, HTML snippets, screenshots or any other supporting evidence.
    - Redact any personal data before reporting.
    - Some organizations may try and claim vulnerabilities never existed, so ensure you have sufficient evidence to prove that they did.
- Proof of concept code (if available).
- The impact of the vulnerability.
- Any references or further reading that may be appropriate.

In many cases, especially in smaller organizations, the security reports may be handled by developers or IT staff who do not have a security background. This means that they may not be familiar with many security concepts or terminology, so reports should be written in clear and simple terms.

It may also be beneficial to provide a recommendation on how the issue could be mitigated or resolved. However, unless the details of the system or application are known, or you are very confident in the recommendation then it may be better to point the developers to some more general guidance (such as an OWASP cheat sheet).

If you are planning to publish the details of the vulnerability after a period of time (as per some [responsible disclosure](#responsible-or-coordinated-disclosure) policies), then this should be clearly communicated in the initial email - but try to do so in a tone that doesn't sound threatening to the recipient.

If the organization does not have an established bug bounty program, then avoid asking about payments or rewards in the initial contact - leave it until the issue has been acknowledged (or ideally fixed). In particular, **do not demand payment before revealing the details of the vulnerability**. At best this will look like an attempt to scam the company, at worst it may constitute extortion.

#### Ongoing Communication

While simpler vulnerabilities might be resolved solely from the initial report, in many cases there will be a number of emails back and forth between the researcher and the organization. Especially for more complex vulnerabilities, the developers or administrators may ask for additional information or recommendations on how to resolve the issue. They may also ask for assistance in retesting the issue once a fix has been implemented. Although there is no obligation to carry out this retesting, as long as the request is reasonable then and providing feedback on the fixes is very beneficial.

It may also be necessary to chase up the organization if they become unresponsive, or if the established deadline for publicly disclosing the vulnerability is approaching. Ensure that this communication stays professional and positive - if the disclosure process becomes hostile then neither party will benefit.

Be patient if it's taking a while for the issue to be resolved. The developers may be under significant pressure from different people within the organization, and may not be able to be fully open in their communication. Triaging, developing, reviewing, testing and deploying a fix within in an enterprise environment takes **significantly** more time than most researchers expect, and being constantly hassled for updates just adds another level of pressure on the developers.

#### When to Give Up

Despite every effort that you make, some organizations are not interested in security, are impossible to contact, or may be actively hostile to researchers disclosing vulnerabilities. In some cases they may even threaten to take legal action against researchers. When this happens it is very disheartening for the researcher - it is important not to take this personally. When this happens, there are a number of options that can be taken.

- Publicly disclose the vulnerability, and deal with any negative reaction and potentially even a lawsuit. Whether or not they have a strong legal case is irrelevant - they have expensive lawyers and fighting any kind of legal action is expensive and time consuming. Before going down this route, ask yourself _is it really worth it?_
- Anonymously disclose the vulnerability. However, if you've already made contact with the organization and tried to report the vulnerability to them, it may be pretty obvious who's responsible behind the disclosure. If you are going to take this approach, ensure that you have taken sufficient operational security measures to protect yourself.
- Report the vulnerability to a third party, such as an industry regulator or data protection authority.
- Move on.

There are many organizations who have a genuine interest in security, and are very open and co-operative with security researchers. Unless the vulnerability is extremely serious, **it is not worth burning yourself out, or risking your career and livelihood over an organization who doesn't care**.

#### Publishing

Once a vulnerability has been patched (or not), then a decision needs to be made about publishing the details. This should ideally be done through discussion with the vendor, and at a minimum the vendor should be notified that you intend to publish, and provided with a link to the published details. The disclosure would typically include:

- A high level summary of the vulnerability and its impact.
- Details of which version(s) are vulnerable, and which are fixed.
- Technical details or potentially proof of concept code.
- Mitigations or workarounds.
- Links to the vendor's published advisory.
- The timeline for the discovery, vendor communication and release.

Some organizations may request that you do not publish the details at all, or that you delay publication to allow more time to their users to install security patches. In the interest of maintaining a positive relationship with the organization, it is worth trying to find a compromise position on this.

Whether to publish working proof of concept (or functional exploit code) is a subject of debate. Some people will view this as an unethical move, and will argue that by doing so you are directly helping criminals compromise their users. On the other hand, the code can be used to both system administrators and penetration testers to test their systems, and attackers will be able to develop or reverse engineering working exploit code if the vulnerability is sufficiently valuable.

If you are publishing the details in hostile circumstances (such as an unresponsive organization, or after a stated period of time has elapsed) then you may face threats and even legal action. Whether there is any legal basis for this will depend on your jurisdiction, and whether you signed any form of non-disclosure agreement with the organization. Make sure you understand your legal position before doing so.

Note that many bug bounty programs forbid researchers from publishing the details without the agreement of the organization. If you choose to do so, you may forfeit the bounty or be banned from the platform - so read the rules of the program before publishing.

### Receiving Vulnerability Reports

This section is intended to provide guidance for organizations on how to accept and receive vulnerability reports.

#### Bug Bounty Programs

Bug bounty programs incentivize researchers to identify and report vulnerabilities to organizations by offering rewards. These are usually monetary, but can also be physical items (swag). The process is often managed through a third party such as [BugCrowd](https://bugcrowd.com/programs) or [HackerOne](https://hackerone.com/directory/programs), who provide mediation between researchers and organizations.

When implementing a bug bounty program, the following areas need to be clearly defined:

- Which systems and applications are in scope.
    - Live systems or a staging/UAT environment?
    - Excluding systems managed or owned by third parties.
- Which types of vulnerabilities are eligible for bounties (SSL/TLS issues? Missing HTTP security headers? Version disclosure?)
- Legal provisions such as safe harbor policies.
    - The [disclose.io](https://disclose.io) project provides some example policies.
    - Take legal advice from lawyers, **not from this cheat sheet**.
- How much to offer for bounties, and how is the decision made.
    - The program could get very expensive if a large number of vulnerabilities are identified.
    - Too little and researchers may not bother with the program.
- The timeline for the initial response, confirmation, payout and issue resolution.

##### When to Implement a Bug Bounty Program

Bug bounty have been adopted by many large organizations such as Microsoft, and are starting to be used outside of the commercial sector, including the  US Department of Defense. However, for smaller organizations they can bring significant challenges, and require a substantial investment of time and resources. These challenges can include:

- Having sufficient time and resources to respond to reports.
- Having sufficiently skilled staff to effectively triage reports.
    - Reports may include a large number of junk or false positives.
    - Managed bug bounty programs may help by performing initial triage (at a cost).
- Dealing with large numbers of false positives and junk reports.
- The impact of individuals testing live systems (including unskilled attackers running automated tools they don't understand).
- Being unable to differentiate between legitimate testing traffic and malicious attacks.
- Researchers going out of scope and testing systems that they shouldn't.
- The financial cost of running the program (some companies pay out hundreds of thousands of dollars a year in bounties).
- Dealing with researchers who are unhappy with how the program is run (such as disputing bounty amounts, or being angry when reported issues are duplicates or out of scope).

Despite these potential issues, bug bounty programs are a great way to identify vulnerabilities in applications and systems. However, they should only be used by organizations that already have a mature vulnerability disclosure process, supported by strong internal processes to resolve vulnerabilities.

#### Publishing Contact Details

The most important step in the process is providing a way for security researchers to contact your organization. The easier it is for them to do so, the more likely it is that you'll receive security reports. The following list includes some of the common mechanisms that are used for this - the more of these that you can implement the better:

- A dedicated security contact on the "Contact Us" page.
- Dedicated instructions for reporting security issues on a bug tracker.
- The common `security@` email address.
- A [security.txt](https://securitytxt.org) file on the website at `/.well-known/security.txt` as per [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.html#name-location-of-the-securitytxt). At minimum include the required Contact and Expires fields; optional fields such as Preferred-Languages, Canonical, Policy, and Hiring improve routing for ethical researchers.
- Using third party [bug bounty](#bug-bounty-programs) program.

It is also important to ensure that frontline staff (such as those who monitor the main contact address, web chat and phone lines) are aware of how to handle reports of security issues, and who to escalate these reports to within the organization.

##### Providing Reporting Guidelines

Alongside the contact details, it is also good to provide some guidelines for researchers to follow when reporting vulnerabilities. These could include:

- Requesting specific information that may help in confirming and resolving the issue.
- Using specific categories or marking the issue as confidential on a bug tracker.
- Providing PGP keys for encrypted communication.
- Establishing a timeline for an initial response and triage.
- Establishing safe harbor provisions.

#### Communicating With Researchers

Communication between researchers and organizations is often one of the hardest points of the vulnerability disclosure process, and can easily leave both sides frustrated and unhappy with the process.

The outline below provides an example of the ideal communication process:

- Respond to the initial request for contact details with a clear mechanism for the researcher to provide additional information.
- Acknowledge the vulnerability details and provide a timeline to carry out triage.
- Request additional clarification or details if required.
- Confirm the vulnerability and provide a timeline for implementing a fix.
    - Confirm the details of any reward or bounty offered.
- If required, request the researcher to retest the vulnerability.
- Confirm that the vulnerability has been resolved.

Throughout the process, provide regular updates of the current status, and the expected timeline to triage and fix the vulnerability. Even if there is no firm timeline for these, the ongoing communication provides some reassurance that the vulnerability hasn't been forgotten about.

##### Researchers Demanding Payment

Some individuals may approach an organization claiming to have found a vulnerability, and demanding payment before sharing the details. Although these requests _may_ be legitimate, in many cases they are simply scams.

One option is to request that they carry out the disclosure through a mediated bug bounty platform, which can provide a level of protection for both sides, as scammers are unlikely to be willing to use these platforms.

#### Disclosure

##### Commercial and Open Source Software

Once the vulnerability has been resolved (and retested), the details should be published in a security advisory for the software. It is important to remember that publishing the details of security issues **does not make the vendor look bad**. All software has security vulnerabilities, and demonstrating a clear and established process for handling and disclosing them gives far more confidence in the security of the software than trying to hide the issues.

At a minimum, the security advisory must contain:

- A high level summary of the vulnerability, including the impact.
- A clear list of vulnerable versions.
- A clear list of patch versions.
- Any caveats on when the software is vulnerable (for example, if only certain configurations are affected).
- Any workarounds or mitigation that can be implemented as a temporary fix.
- A Common Vulnerabilities and Exposures (CVE) ID, if one has been assigned. Request an ID through the [appropriate CVE Numbering Authority (CNA)](https://www.cve.org/ReportRequest/ReportRequestForNonCNAs#RequestCVEID), subject to the [CVE assignment rules](https://www.cve.org/ResourcesSupport/AllResources/CNARules/#section_4-2_CVE_ID_Assignment).

Where possible it is also good to include:

- The timeline of the vulnerability disclosure process.
- Credit for the researcher who identified the vulnerability.
- Technical details of the vulnerability.
- IDS/IPS signatures or other indicators of compromise.

Security advisories should be easy for developers and system administrators to find. Common ways to publish them include:

- A dedicated "security" or "security advisories" page on the website.
- A security mailing list or forum.
- Linked from the main changelogs and release notes.

Some researchers may publish their own technical write ups of the vulnerability, which will usually include the full details required to exploit it (and sometimes even working exploit code). For more serious vulnerabilities, it may be sensible to ask the researcher to delay publishing the full details for a period of time (such as a week), in order to give system administrators more time to install the patches before exploit code is available. However, once the patch has been releases, attackers will be able to reverse engineer the vulnerability and develop their own exploit code, so there is limited value to delaying the full release.

##### Private Systems

For vulnerabilities in private systems, a decision needs to be made about whether the details should be published once the vulnerability has been resolved. Most bug bounty programs give organizations the option about whether to disclose the details once the issue has been resolved, although it is not typically required.

Publishing these details helps to demonstrate that the organization is taking proactive and transparent approach to security, but can also result in potentially embarrassing omissions and misconfigurations being made public. In the event of a future compromise or data breach, they could also potentially be used as evidence of a weak security culture within the organization. Additionally, they may expose technical details about internal, and could help attackers identify other similar issues. As such, this decision should be carefully evaluated, and it may be wise to take legal advice.

#### Rewarding Researchers

Where researchers have identified and reported vulnerabilities outside of a bug bounty program (essentially providing free security testing), and have acted professionally and helpfully throughout the vulnerability disclosure process, it is good to offer them some kind of reward to encourage this kind of positive interaction in future. If monetary rewards are not possible then a number of other options should be considered, such as:

- Discounts or credit for services or products offered by the organization.
- Virtual rewards (such as special in-game items, custom avatars, etc).
- T-shirts, stickers and other branded items (swag).
- Credit in a "hall of fame", or other similar acknowledgement.
