---
title: "Authorization and Access Control"
order: 5
summary: "Deciding what a user may do: authorization models and patterns, decisions and policy distribution, identity propagation, access control, IDOR, mass assignment, multi-tenancy, business logic and testing authorization."
category: "Security"
level: Intermediate
---

# Authorization and Access Control

Deciding what a user may do: authorization models and patterns, decisions and policy distribution, identity propagation, access control, IDOR, mass assignment, multi-tenancy, business logic and testing authorization.

## Authorization

> **Source:** [Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Authorization may be defined as "the process of verifying that a requested action or service is approved for a specific entity" ([NIST](https://csrc.nist.gov/glossary/term/authorization)). Authorization is distinct from authentication which is the process of verifying an entity's identity. When designing and developing a software solution, it is important to keep these distinctions in mind. A user who has been authenticated (perhaps by providing a username and password) is often not authorized to access every resource and perform every action that is technically possible through a system. For example, a web app may have both regular users and admins, with the admins being able to perform actions the average user is not privileged to perform, even though they have been authenticated. Additionally, authentication is not always required for accessing resources; an unauthenticated user may be authorized to access certain public resources, such as an image or login page, or even an entire web app.

The objective of this cheat sheet is to assist developers in implementing authorization logic that is robust, appropriate to the app's business context, maintainable, and scalable. The guidance provided in this cheat sheet should be applicable to all phases of the development lifecycle and flexible enough to meet the needs of diverse development environments.

Flaws related to authorization logic are a notable concern for web apps. Broken Access Control was ranked as the most concerning web security vulnerability in [OWASP's 2021 Top 10](https://owasp.org/Top10/A01_2021-Broken_Access_Control/) and asserted to have a "High" likelihood of exploit by [MITRE's CWE program](https://cwe.mitre.org/data/definitions/285.html). Furthermore, according to [Veracode's State of Software Vol. 10](https://www.veracode.com/sites/default/files/pdf/resources/sossreports/state-of-software-security-volume-10-veracode-report.pdf), Access Control was among the more common of OWASP's Top 10 risks to be involved in exploits and security incidents despite being among the least prevalent of those examined.

The potential impact resulting from exploitation of authorization flaws is highly variable, both in form and severity. Attackers may be able to read, create, modify, or delete resources that were meant to be protected (thus jeopardizing their confidentiality, integrity, and/or availability); however, the actual impact of such actions is necessarily linked to the criticality and sensitivity of the compromised resources. Thus, the business cost of a successfully exploited authorization flaw can range from very low to extremely high.

Both entirely unauthenticated outsiders and authenticated (but not necessarily authorized) users can take advantage of authorization weaknesses.  Although honest mistakes or carelessness on the part of non-malicious entities may enable authorization bypasses, malicious intent is typically required for access control threats to be fully realized.  Horizontal privilege elevation (i.e. being able to access another user's resources) is an especially common weakness that an authenticated user may be able to take advantage of. Faults related to authorization control can allow malicious insiders and outsiders alike to view, modify, or delete sensitive resources of all forms (databases records, static files, personally identifiable information (PII), etc.) or perform actions, such as creating a new account or initiating a costly order, that they should not be privileged to do. Furthermore, if logging related to access control is not properly set-up, such authorization violations may go undetected or at least remain unattributable to a particular individual or group.

### Recommendations

#### Enforce Least Privileges

As a security concept, Least Privileges refers to the principle of assigning users only the minimum privileges necessary to complete their job. Although perhaps most commonly applied in system administration, this principle has relevance to the software developer as well. Least Privileges must be applied both horizontally and vertically. For example, even though both an accountant and sales representative may occupy the same level in an organization's hierarchy, both require access to different resources to perform their jobs. The accountant should likely not be granted access to a customer database and the sales representative should not be able to access payroll data. Similarly, the head of the sales department is likely to need more privileged access than their subordinates.

Failure to enforce least privileges in an application can jeopardize the confidentiality of sensitive resources. Mitigation strategies are applied primarily during the Architecture and Design phase (see [CWE-272](https://cwe.mitre.org/data/definitions/272.html)); however, the principle must be addressed throughout the SDLC.

Consider the following points and best practices:

- During the design phase, ensure trust boundaries are defined. Enumerate the types of users that will be accessing the system, the resources exposed and the operations (such as read, write, update, etc) that might be performed on those resources. For every combination of user type and resource, determine what operations, if any, the user (based on role and/or other attributes) must be able to perform on that resource. For an ABAC system ensure all categories of attributes are considered. For example, a Sales Representative may need to access a customer database from the internal network during working hours, but not from home at midnight.
- Create tests that validate that the permissions mapped out in the design phase are being correctly enforced.
- After the app has been deployed, periodically review permissions in the system for "privilege creep"; that is, ensure the privileges of users in the current environment do not exceed those defined during the design phase (plus or minus any formally approved changes).
- Remember, it is easier to grant users additional permissions rather than to take away some they previously enjoyed. Careful planning and implementation of Least Privileges early in the SDLC can help reduce the risk of needing to revoke permissions that are later deemed overly broad.

#### Deny by Default

Even when no access control rules are explicitly matched, the application cannot remain neutral when an entity is requesting access to a particular resource. The application must always make a decision, whether implicitly or explicitly, to either deny or permit the requested access. Logic errors and other mistakes relating to access control may happen, especially when access requirements are complex; consequently, one should not rely entirely on explicitly defined rules for matching all possible requests. For security purposes an application should be configured to deny access by default.

Consider the following points and best practices:

- Adopt a "deny-by-default" mentality both during initial development and whenever new functionality or resources are exposed by the app. One should be able to explicitly justify why a specific permission was granted to a particular user or group rather than assuming access to be the default position.
- Although some frameworks or libraries may themselves adopt a deny-by-default strategy, explicit configuration should be preferred over relying on framework or library defaults. The logic and defaults of third-party code may evolve over time, without the developer's full knowledge or understanding of the change's implications for a particular project.

#### Validate the Permissions on Every Request

Permission should be validated correctly on every request, regardless of whether the request was initiated by an AJAX script, server-side, or any other source. The technology used to perform such checks should allow for global, application-wide configuration rather than needing to be applied individually to every method or class. Remember an attacker only needs to find one way in. Even if just a single access control check is "missed", the confidentiality and/or integrity of a resource can be jeopardized. Validating permissions correctly on just the majority of requests is insufficient. Specific technologies that can help developers in performing such consistent permission checks include the following:

- [Java/Jakarta EE Filters](https://jakarta.ee/specifications/platform/8/apidocs/javax/servlet/Filter.html) including implementations in [Spring Security](https://docs.spring.io/spring-security/site/docs/5.4.0/reference/html5/#servlet-security-filters)
- [Middleware in the Django Framework](https://docs.djangoproject.com/en/4.0/ref/middleware/)
- [.NET Core Filters](https://docs.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-3.1#authorization-filters)
- [Middleware in the Laravel PHP Framework](https://laravel.com/docs/8.x/middleware)

#### Thoroughly Review the Authorization Logic of Chosen Tools and Technologies, Implementing Custom Logic if Necessary

Today's developers have access to vast amounts of libraries, platforms, and frameworks that allow them to incorporate robust, complex logic into their apps with minimal effort. However, these frameworks and libraries must not be viewed as a quick panacea for all development problems; developers have a duty to use such frameworks responsibly and wisely. Two general concerns relevant to framework/library selection as relevant to proper access control are misconfiguration/lack of configuration on the part of the developer and vulnerabilities within the components themselves (see [A6](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A6-Security_Misconfiguration) and [A9](https://owasp.org/www-project-top-ten/2017/A9_2017-Using_Components_with_Known_Vulnerabilities.html) for general guidance on these topics).

Even in an otherwise securely developed application, vulnerabilities in third-party components can allow an attacker to bypass normal authorization controls. Such concerns need not be restricted to unproven or poorly maintained projects, but affect even the most robust and popular libraries and frameworks. Writing complex, secure software is hard. Even the most competent developers, working on high-quality libraries and frameworks, will make mistakes. Assume any third-party component you incorporate into an application *could* be or become subject to an authorization vulnerability. Important considerations include:

- Create, maintain, and follow processes for detecting and responding to vulnerable components.
- Incorporate tools such as [Dependency Check](https://owasp.org/www-project-dependency-check/) into the SDLC and consider subscribing to data feeds from vendors, [the NVD](https://nvd.nist.gov/vuln/data-feeds), or other relevant sources.
- Implement defense in depth. Do not depend on any single framework, library, technology, or control to be the sole thing enforcing proper access control.

Misconfiguration (or complete lack of configuration) is another major area in which the components developers build upon can lead to broken authorization.  These components are typically intended to be relatively general purpose tools made to appeal to a wide audience. For all but the simplest use cases, these frameworks and libraries must be customized or supplemented with additional logic in order to meet the unique requirements of a particular app or environment. This consideration is especially important when security requirements, including authorization, are concerned. Notable configuration considerations for authorization include the following:

- Take time to thoroughly understand any technology you build authorization logic upon. Analyze the technology's capabilities with an understanding that *the authorization logic provided by the component may be insufficient for your application's specific security requirements*. Relying on prebuilt logic may be convenient, but this does not mean it is sufficient. Understand that custom authorization logic may well be necessary to meet an app's security requirements.
- Do not let the capabilities of any library, platform, or framework guide your authorization requirements. Rather, authorization requirements should be decided first and then the third-party components may be analyzed in light of these requirements.
- Do not rely on default configurations.
- Test configuration. Do not just assume any configuration performed on a third-party component will work exactly as intended in your particular environment. Documentation can be misunderstood, vague, outdated, or simply inaccurate.

#### Prefer Attribute and Relationship Based Access Control over RBAC

In software engineering, two basic forms of access control are widely utilized: Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC). There is a third, more recent, model which has gained popularity: Relationship-Based Access Control (ReBAC). The decision between the models has significant implications for the entire SDLC and should be made as early as possible.

- RBAC is a model of access control in which access is granted or denied based upon the roles assigned to a user. Permissions are not directly assigned to an entity; rather, permissions are associated with a role and the entity inherits the permissions of any roles assigned to it. Generally, the relationship between roles and users can be many-to-many, and roles may be hierarchical in nature.

- ABAC may be defined as an access control model where "subject requests to perform operations on objects are granted or denied based on assigned attributes of the subject, assigned attributes of the object, environment conditions, and a set of policies that are specified in terms of those attributes and conditions" ([NIST SP 800-162](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-162.pdf), pg. 7). As defined in NIST SP 800-162, attributes are simply characteristics that can be represented as name-value pairs and assigned to a subject, object, or the environment. Job role, time of day, project name, MAC address, and creation date are but a very small sampling of possible attributes that highlight the flexibility of ABAC implementations.

- ReBAC is an access control model that grants access based on the relationships between resources. For instance, allowing only the user who created a post to edit it. This is especially necessary in social network applications, like Twitter or Facebook, where users want to limit access to their data (tweets or posts) to people they choose (friends, family, followers).

Although RBAC has a long history and remains popular among software developers today, ABAC and ReBAC should typically be preferred for application development. Their advantages over RBAC include:

- **Support fine-grained, complex Boolean logic**. In RBAC, access decisions are made on the presence or absence of roles; that is, the main characteristic of a requesting entity considered is the role(s) assigned to it. Such simplistic logic does a poor job of supporting object-level or horizontal access control decisions and those that require multiple factors.

    - ABAC greatly expands both the number and type of characteristics that can be considered. In ABAC, a "role" or job function can certainly be one attribute assigned to a subject, but it need not be considered in isolation (or at all if this characteristic is not relevant to the particular access requested). Furthermore, ABAC can incorporate environmental and other dynamic attributes, such as time of day, type of device used, and geographic location. Denying access to a sensitive resource outside of normal business hours or if a user has not recently completed mandatory training are just a couple of examples where ABAC could meet access control requirements that RBAC would struggle to fulfill. Thus, ABAC is more effective than RBAC in addressing the principle of least privileges.
    - ReBAC, since it supports assigning relationships between direct objects and direct users (and not just a role), allows for fine-grained permissions. Some systems also support algebraic operators like AND and NOT to express policies like "if this user has relationship X but not relationship Y with the object, then grant access".

- **Robustness**. In large projects or when numerous roles are present, it is easy to miss or improperly perform role checks ([OWASP C7: Enforce Access Controls](https://owasp.org/www-project-proactive-controls/v3/en/c7-enforce-access-controls)). This can result in both too much and too little access. This is especially true in RBAC implementations where a role hierarchy is not present and multiple role checks must be chained to have the desired impact (i.e., `if(user.hasAnyRole("SUPERUSER", "ADMIN", "ACCT_MANAGER"))` ).
- **Speed**. In RBAC, "role explosion" can occur when a system defines too many roles. If users send their credential and roles through means like HTTP headers, which have size limits, there may not be enough space to include all of the user's roles. A viable workaround to this problem is to only send the user ID, and then the application retrieves the user's roles, but this will increase the latency of every request.
- **Supports Multi-Tenancy and Cross-Organizational Requests**. RBAC is poorly suited for use cases where distinct organizations or customers will need access to the same set of protected resources. Meeting such requirements with RBAC would require highly cumbersome methods such as configuring rule sets for each customer in a multi-tenant environment or requiring pre-provisioning of identities for cross-organizational requests ([OWASP C7](https://owasp.org/www-project-proactive-controls/v3/en/c7-enforce-access-controls); [NIST SP 800-162](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-162.pdf)). By contrast, as long as attributes are consistently defined, ABAC implementations allow access control decisions to be "executed and administered in the same or separate infrastructures, while maintaining appropriate levels of security" ([NIST SP 800-162](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-162.pdf), pg. 6).
- **Ease of Management**. Although the initial setup for RBAC is often simpler than ABAC, this short-term benefit quickly vanishes as the scale and complexity of a system grows. In the beginning, a couple of simple roles, such as User and Admin, may suffice for some apps, but this is very unlikely to hold true for any length of time in production applications. As roles become more numerous, both testing and auditing, critical processes for establishing trust in one's codebase and logic, become more difficult ([OWASP C7](https://owasp.org/www-project-proactive-controls/v3/en/c7-enforce-access-controls)). By contrast, ABAC and ReBAC are far more expressive, incorporate attributes and Boolean logic that better reflects real-world concerns, are easier to update when access-control needs change, and encourages the separation of policy management from  enforcement and provisioning of identities ([NIST SP 800-162](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-162.pdf); see also [XACML-V3.0](https://docs.oasis-open.org/xacml/3.0/xacml-3.0-core-spec-os-en.html) for a standard that highlights these benefits)

#### Ensure Lookup IDs are Not Accessible Even When Guessed or Cannot Be Tampered With

Applications often expose the internal object identifiers (such as an account number or Primary Key in a database) that are used to locate and reference an object. This ID may be exposed as a query parameter, path variable, "hidden" form field or elsewhere. For example:

```https://mybank.com/accountTransactions?acct_id=901```

Based on this URL, one could reasonably assume that the application will return a listing of transactions and that the transactions returned will be restricted to a particular account - the account indicated in the `acct_id` param. But what would happen if the user changed the value of the `acct_id` param to another value such as `523`. Will the user be able to view transactions associated with another account even if it does not belong to him? If not, will the failure simply be the result of the account "523" not existing/not being found or will it be due to a failed access control check? Although this example may be an oversimplification, it illustrates a very common security flaw in application development - [CWE 639: Authorization Bypass Through User-Controlled Key](https://cwe.mitre.org/data/definitions/639.html).  When exploited, this weakness can result in authorization bypasses, horizontal privilege escalation and, less commonly, vertical privilege escalation (see [CWE-639](https://cwe.mitre.org/data/definitions/639.html)). This type of vulnerability also represents a form of Insecure Direct Object Reference (IDOR). The following paragraphs will describe the weakness and possible mitigations.

 In the example above, the lookup ID was not only exposed to the user and readily tampered with, but also appears to have been a fairly predictable, perhaps sequential, value.  While one can use various techniques to mask or randomize these IDs and make them hard to guess, such an approach is generally not sufficient by itself. A user should not be able to access a resource they do not have permissions simply because they are able to guess and manipulate that object's identifier in a query param or elsewhere. Rather than relying on some form of security through obscurity, the focus should be on controlling access to the underlying objects and/or the identifiers themselves. Recommended mitigations for this weakness include the following:

- Avoid exposing identifiers to the user when possible. For example it should be possible to retrieve some objects, such as account details,  based solely on currently authenticated user's identity and attributes (e.g. through information contained in a securely implemented JSON Web Token (JWT) or server-side session).
- Implement user/session specific indirect references using a tool such as [OWASP ESAPI](https://owasp.org/www-project-enterprise-security-api/) (see [OWASP Top 10:2025 A01 Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/) and the [Insecure Direct Object Reference Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html))
- Perform access control checks on *every* request for the *specific* object or functionality being accessed. Just because a user has access to an object of a particular type does not mean they should have access to every object of that particular type.

### Enforce Authorization Checks on Static Resources

The importance of securing static resources is often overlooked or at least overshadowed by other security concerns. Although securing databases and similar data stores often justly receive significant attention from security conscious teams, static resources must also be appropriately secured. Although unprotected static resources are certainly a problem for websites and web applications of all forms, in recent years, poorly secured resources in cloud storage offerings (such as Amazon S3 Buckets) have risen to prominence. When securing static resources, consider the following:

- Ensure that static resources are incorporated into access control policies. The type of protection required for static resources will necessarily be highly contextual. It may be perfectly acceptable for some static resources to be publicly accessible, while others should only be accessible when a highly restrictive set of user and environmental attributes are present. Understanding the type of data exposed in the specific resources under consideration is thus critical. Consider whether a formal Data Classification scheme should be established and incorporated into the application's access control logic (see [here](https://resources.infosecinstitute.com/information-and-asset-classification/) for an overview of data classification).
- Ensure any cloud based services used to store static resources are secured using the configuration options and tools provided by the vendor. Review the cloud provider's documentation (see guidance from [AWS](https://aws.amazon.com/premiumsupport/knowledge-center/secure-s3-resources/), [Google Cloud](https://cloud.google.com/storage/docs/best-practices#security) and [Azure](https://docs.microsoft.com/en-us/azure/storage/blobs/security-recommendations) for specific implementations details).
- When possible, protect static resources using the same access control logic and mechanisms that are used to secure other application resources and functionality.

### Verify that Authorization Checks are Performed in the Right Location

Developers must never rely on client-side access control checks. While such checks may be permissible for improving the user experience, they should never be the decisive factor in granting or denying access to a resource; client-side logic is often easy to bypass. Access control checks must be performed server-side, at the gateway, or using serverless function (see [OWASP ASVS 4.0.3, V1.4.1 and V4.1.1](https://raw.githubusercontent.com/OWASP/ASVS/v4.0.3/4.0/OWASP%20Application%20Security%20Verification%20Standard%204.0.3-en.pdf))

### Exit Safely when Authorization Checks Fail

Failed access control checks are a normal occurrence in a secured application; consequently, developers must plan for such failures and handle them securely. Improper handling of such failures can lead to the application being left in an unpredictable state ([CWE-280: Improper Handling of Insufficient Permissions or Privileges](https://cwe.mitre.org/data/definitions/280.html)). Specific recommendations include the following:

- Ensure all exception and failed access control checks are handled no matter how unlikely they seem ([OWASP Top Ten Proactive Controls C10: Handle all errors and exceptions](https://owasp.org/www-project-proactive-controls/v3/en/c10-errors-exceptions)). This does not mean that an application should always try to "correct" for a failed check; oftentimes a simple message or HTTP status code is all that is required.
- Centralize the logic for handling failed access control checks.
- Verify the handling of exception and authorization failures. Ensure that such failures, no matter how unlikely, do not put the software into an unstable state that could lead to authorization bypass.
- Ensure sensitive information, such as system logs or debugging output, is not exposed in error messages. Misconfigured error messages can increase the attack surface of your application. ([CWE-209: Generation of Error Message Containing Sensitive Information](https://cwe.mitre.org/data/definitions/209.html))

### Implement Appropriate Logging

Logging is one of the most important detective controls in application security; insufficient logging and monitoring is recognized as among  the most critical security risks in [OWASP's Top Ten 2021](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/). Appropriate logs can not only detect malicious activity, but are also invaluable resources in post-incident investigations, can be used to troubleshoot access control and other security related problems, and are useful in security auditing. Though easy to overlook during the initial design and requirements phase, logging is an important component of holistic application security and must be incorporated into all phases of the SDLC. Recommendations for logging include the following:

- Log using consistent, well-defined formats that can be readily parsed for analysis. According to [OWASP Top Ten Proactive Controls C9](https://owasp.org/www-project-proactive-controls/v3/en/c9-security-logging), [Apache Logging Services](https://logging.apache.org/) is one example of a project that provides support for numerous languages and platforms
- Carefully determine the amount of information to log. This should be determined according to the specific application environment and requirements. Both too much and too little logging may be considered security weaknesses (see [CWE-778](https://cwe.mitre.org/data/definitions/778.html) and [CWE-779](https://cwe.mitre.org/data/definitions/779.html)). Too little logging can result in malicious activity going undetected and greatly reduce the effectiveness of post-incident analysis. Too much logging not only can strain resources and lead to excessive false positives, but may also result in sensitive data being needlessly logged.
- Ensure clocks and timezones are synchronized across systems. Accuracy is crucial in piecing together the sequence of an attack during and after incident response.
- Consider incorporating application logs into a centralized log server or SIEM.

### Create Unit and Integration Test Cases for Authorization Logic

Unit and integration testing are essential for verifying that an application performs as expected and consistently across changes. Flaws in access control logic can be subtle, particularly when requirements are complex; however, even a small logical or configuration error in access control can result in severe consequences. Although not a substitution for a dedicated security test or penetration test (see [OWASP WSTG 4.5](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/05-Authorization_Testing/README) for an excellent guide on this topic as it relates to access control), automated unit and integration testing of access control logic can help reduce the number of security flaws that make it into production. These tests are good at catching the "low-hanging fruit" of security issues but not more sophisticated attack vectors ([OWASP SAMM: Security Testing](https://owaspsamm.org/model/verification/security-testing/)).

Unit and integration testing should aim to incorporate many of the concepts explored in this document. For example, is access being denied by default? Does the application terminate safely when an access control check fails, even under abnormal conditions? Are ABAC policies being properly enforced? While simple unit and integration tests can never replace manual testing performed by a skilled hacker, they are an important tool for detecting and correcting security issues quickly and with far less resources than manual testing.

## References

- [NIST SP 800-162: Guide to Attribute Based Access Control (ABAC) Definition and Considerations](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-162.pdf)
- [OWASP Proactive Controls 2018: Enforce Access Controls](https://top10proactive.owasp.org/archive/2018/c7-enforce-access-controls/)
- [Ferraiolo and Kuhn: Role-Based Access Controls (1992)](https://csrc.nist.gov/files/pubs/conference/1992/10/13/rolebased-access-controls/final/docs/ferraiolo-kuhn-92.pdf)

```

## Authorization Patterns

> **Source:** [Authorization Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Patterns_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Authorization patterns determine where an application decides and enforces access. A **Policy Enforcement Point (PEP)** protects an operation; a **Policy Decision Point (PDP)** evaluates the applicable policy. [OpenID AuthZEN](https://openid.net/specs/authorization-api-1_0.html) defines an interface between these components. Use the [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) for baseline controls and [Identity Propagation Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Identity_Propagation_Patterns_Cheat_Sheet.html) for trustworthy caller context.

In the diagrams, a **Policy Administration Point (PAP)** manages rules and a **Policy Information Point (PIP)** supplies attributes used to evaluate them.

### Service-Level Authorization

Keep enforcement close to the protected resource so it can check the requested action, object, and tenant. Deny by default and [validate permissions on every request](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#validate-the-permissions-on-every-request). Separating policy evaluation from enforcement does not transfer the PEP's responsibility to enforce the result; the [AuthZEN trust model](https://openid.net/specs/authorization-api-1_0.html#section-11.4) explicitly relies on that responsibility.

#### Policies in Application Code

The service implements both decision and enforcement logic, using a framework's authorization facilities where possible.

![Decentralized service-level authorization](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Decentralized_Service_Level_Authorization.png)

This can suit a small application with a limited policy surface. Centralize checks within the application's authorization layer and test every protected entry point. Scattered conditional checks make omissions and inconsistent policies harder to detect; changing these rules requires deploying application code. Code-based policies are not inherently fail-open.

#### Separately Managed Policies

The service remains the PEP but asks a PDP to evaluate policies managed independently of business code. The PDP may be embedded, local, or remote; central policy ownership does not require a single central runtime.

![Centralized service-level authorization](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Centralized_Service_Level_Authorization.png)

Use this separation when several services need consistent rules and a shared review process. Supply authenticated subject context and authoritative resource attributes, enforce the returned decision before accessing the resource, and deny the operation if no valid decision is available. See [Policy and Data Distribution](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Policy_And_Data_Distribution_Cheat_Sheet.html) for keeping inputs current and [Decisions and Output Handling](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Decisions_And_Output_Handling_Cheat_Sheet.html) for enforcing results.

### Gateway and Proxy Enforcement

A gateway can enforce coarse access rules before forwarding a request. A service-local proxy can perform similar checks on calls to one service. [Envoy's external authorization filter](https://www.envoyproxy.io/docs/envoy/v1.36.9/configuration/http/http_filters/ext_authz_filter) illustrates delegation to a PDP and documents how routing changes after authorization can invalidate an earlier check.

![Edge-level authorization](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Edge_Level_Authorization_Classic.png)

Treat complete traffic coverage as a deployment requirement, not an automatic property of a gateway. Authenticate permitted callers, restrict direct access to services, and cover internal calls and alternate endpoints. Keep object-level and business-specific checks in the service when the proxy lacks the necessary context. Reevaluate authorization if the effective resource or action changes after a check.

#### Propagating an Authorization Context

A gateway may attach signed context describing an authenticated subject or an authorization decision for downstream use.

![Gateway authorization with propagated context](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Edge_Level_Authorization_Modern.png)

Downstream services must validate the trusted issuer, integrity, audience, expiry, and the context's applicability to the actual request. Reject direct calls that lack the required context. Strip client-supplied copies of trusted headers before populating them. A signature alone neither prevents bypass nor authorizes a different resource, tenant, or action; follow the [JWT validation guidance](https://www.rfc-editor.org/rfc/rfc8725#section-3) and retain service-level enforcement.

### PDP Deployment and Failure Behavior

Choose deployment independently of the access control model. For example, [OPA supports HTTP, library, and WebAssembly integration](https://www.openpolicyagent.org/docs/integration); a product name does not imply one deployment mode or a particular access control standard.

| Deployment | Security benefit | Required control |
|------------|------------------|------------------|
| Embedded library | Evaluation can continue without a remote PDP connection | Keep policy and data current; verify enforcement on every entry point |
| Local sidecar or daemon | Shared decision implementation near the service | Restrict its API and handle process failure; locality alone does not establish trust |
| Remote service | Shared evaluation and centralized policy administration | Authenticate and authorize PEPs, protect responses, and deny when a valid decision is unavailable |

All modes depend on the policy and data they use. A local PDP with stale revocation data can still permit access incorrectly. Log the decision and its enforcement, with enough policy/version context to investigate discrepancies and without exposing sensitive attributes.

Configure PDP errors and timeouts to deny protected operations. [Envoy's failure-mode setting](https://www.envoyproxy.io/docs/envoy/v1.39.0/api-v3/extensions/filters/http/ext_authz/v3/ext_authz.proto) makes this choice explicit: allowing requests when authorization fails bypasses the control. A previously loaded policy may continue to be evaluated only within the freshness requirements described in [Policy and Data Distribution](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Policy_And_Data_Distribution_Cheat_Sheet.html#freshness-and-outages).

Prefer service-level enforcement with shared, separately reviewed policies as the system grows. Add gateway checks for early rejection and traffic control; verify that protected operations remain covered when a gateway, policy source, or PDP is unavailable.

## Authorization Decisions and Output Handling

> **Source:** [Authorization Decisions and Output Handling](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Decisions_And_Output_Handling_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

A **Policy Decision Point (PDP)** evaluates access; a **Policy Enforcement Point (PEP)** applies the result before releasing data or performing an action. [OpenID AuthZEN Authorization API 1.0](https://openid.net/specs/authorization-api-1_0.html) defines single and multiple evaluations, as well as search interfaces. This sheet covers enforcing individual decisions, authorized resource lists, and query filters. See [Authorization Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Patterns_Cheat_Sheet.html) for placement and [Policy and Data Distribution](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Policy_And_Data_Distribution_Cheat_Sheet.html) for trustworthy inputs.

### Single and Batch Decisions

Bind each decision to the authenticated subject, action, resource, tenant, and relevant context. [AuthZEN's evaluation interfaces](https://openid.net/specs/authorization-api-1_0.html#section-6) carry the information used to evaluate access. Supplying verified role or relationship attributes is legitimate when the policy requires them; accepting a client's assertion of its own privileges is not.

A batch groups separate access checks. Match each response to its corresponding request using the ordering or identifiers defined by the API, and deny an item whose result is missing, invalid, or an error. Do not apply one item's permit to the entire batch. UI checks can determine which buttons to display, but the operation itself still requires [server-side authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#validate-the-permissions-on-every-request).

### Enforcing Access to Collections

Choose by the PDP's documented output semantics and the data store's supported integration, not by labels such as relationship-based access control (ReBAC). [OpenFGA's ListObjects documentation](https://openfga.dev/docs/interacting/relationship-queries#listobjects) and [Cerbos's query-plan API](https://docs.cerbos.dev/cerbos/latest/api/#resources-query-plan) illustrate different contracts.

#### Check Each Candidate

The PEP retrieves a bounded candidate set and evaluates each item, individually or in a batch.

![PDP as a filter](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/PDP_as_filter.png)

Use this for small sets when a list or filter interface is unavailable. Keep candidate data inside the trusted service until checks complete; exclude denied and unresolved items. Apply the same restriction to counts, exports, and other outputs that could reveal protected data.

#### Retrieve Authorized Resource Identifiers

The PDP returns identifiers that the subject may access for a particular action. The application restricts its data retrieval to those identifiers and its own tenant and business predicates.

![Authorized data set](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Authorized_data_set.png)

Treat the result as complete only when the API guarantees completion. OpenFGA documents deadline and result-count limits for ListObjects; do not assume every implementation provides a pagination cursor or unlimited streaming. A truncated authorized subset can be displayed as partial when the API guarantees each returned item is permitted, but cannot establish the complete authorized set. Never interpret an empty or incomplete list as permission to remove the restriction. Recheck authorization for subsequent operations or when the relevant state changes.

#### Apply an Authorization Filter

The PDP returns a predicate or query plan that the data layer enforces while retrieving resources.

![Authorization filter](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Authorization_filter.png)

Use a maintained adapter for the exact PDP and data store. [Cerbos PlanResources](https://docs.cerbos.dev/cerbos/latest/api/#resources-query-plan) distinguishes always-allowed, always-denied, and conditional plans; [OPA's Compile API](https://www.openpolicyagent.org/docs/rest-api#compile-api) supports partial evaluation. Capabilities depend on the implementation and policy language, not a universal restriction on ReBAC or other model families.

### Security Considerations

An output is useful only if the PEP enforces its full meaning. [AuthZEN's response-integrity and trust requirements](https://openid.net/specs/authorization-api-1_0.html#section-11) apply to the channel and components carrying decisions.

- **Cover every data path.** Enforce the restriction on list, search, export, count, aggregate, and direct-object reads. An authorized list does not authorize a later update or delete.
- **Intersect predicates.** Combine authorization restrictions with application and tenant predicates using logical AND. An always-allowed authorization result does not remove those other restrictions; always-denied must return no protected data.
- **Preserve query semantics.** Reject unsupported operators or incomplete translations. Check adapter behavior for nulls, missing attributes, joins, and collection membership against the policy's meaning. Do not silently omit an expression that cannot be translated.
- **Keep values separate from syntax.** Bind filter values as parameters and allow-list structural choices such as field names and operators. Do not execute a returned debug string as a query. See [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html#defense-option-1-prepared-statements-with-parameterized-queries).
- **Fail closed.** Deny protected operations on PDP errors, timeouts, or unusable output. Apply [Deny by Default](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#deny-by-default), including when a filter is absent; a missing filter is not an unrestricted result.
- **Bound reuse.** Cache only for the same subject, action, resource scope, tenant, and relevant policy/input state, within the approved freshness limit. Account for changes between evaluation and use; a cached permit must not outlive a required revocation deadline.

Verify integrations with permitted and denied resources, tenant boundaries, each explicit filter result kind, incomplete batches or lists, and PDP failure. Compare a filter's selected resources with individual decisions for representative policy cases. These checks validate the adapter and enforcement paths, not just successful communication with the PDP.

Batching and filtering can reduce work, but do not trade away enforcement or freshness to meet a latency target. Prefer a documented query-filter integration for large queryable collections; use bounded per-item checks when that integration is unavailable or cannot preserve the policy's meaning.

## Authorization Policy and Data Distribution

> **Source:** [Authorization Policy and Data Distribution](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Policy_And_Data_Distribution_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

An authorization decision is only as reliable as its policy and input data. A **Policy Decision Point (PDP)** evaluates rules using attributes supplied by a **Policy Enforcement Point (PEP)** or an authoritative **Policy Information Point (PIP)**. [OPA's external data guidance](https://www.openpolicyagent.org/docs/external-data) describes common ways to deliver those inputs. See [Authorization Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Patterns_Cheat_Sheet.html) for component placement.

### Define Ownership and Freshness Requirements

Record who may change each policy and attribute, which service is authoritative for it, and the maximum delay before a change must affect decisions. Distinguish policy changes, such as a new restriction, from data changes, such as revoking a user's membership. Neither organizational ownership nor update frequency determines acceptable delay: a central policy can require an emergency update, while another can have a scheduled effective date.

Choose delivery against those requirements. [OPA bundles](https://www.openpolicyagent.org/docs/management-bundles) can carry both policies and data, but distribution is eventually consistent. A successful publication is not proof that every PDP has activated the update.

| Requirement | Suitable starting point | Security condition |
|-------------|------------------------|--------------------|
| Emergency restriction or revocation | Dynamic updates or authoritative lookup | Measure the propagation bound and deny affected operations when it cannot be met |
| Scheduled, stable rules | Versioned deployment or dynamic distribution | Activate the required revision before its effective deadline |
| Frequently changing resource or relationship data | Synchronization or lookup from its authoritative source | Account for replication lag and cached decisions |
| Request-specific attributes | Validated context passed by the PEP | Authenticate the PEP and establish where each security-relevant value came from |

### Deliver Policies and Data

A **Policy Administration Point (PAP)** manages policy changes. Distribute approved policies independently of application releases when restrictions must take effect sooner than a deployment can reliably complete. Delivery may use push or pull; [OPA bundle downloads](https://www.openpolicyagent.org/docs/management-bundles) are an example of pull-based updates outside the decision request. Embedding policies in a release is suitable only when its deployment process meets the required update deadline.

For input data, select among these approaches using the source's consistency guarantees and the PDP's actual capabilities. Model names alone do not establish which mechanisms a product supports.

#### Lookup During Evaluation

The PDP retrieves required attributes from an authoritative PIP.

![On-demand data lookup](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/On_demand_data_pull.png)

Use this when the source can satisfy the decision's availability and freshness requirements. A lookup does not guarantee current data if the source, replica, or intermediate cache is stale. Deny affected operations when a required attribute cannot be obtained reliably.

#### Replicated Data

Updates reach a PDP's local data store before evaluation.

![Out-of-band data delivery](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Out_of_band_data_push.png)

This removes the PIP from the immediate request path but creates a revocation delay. Monitor synchronization progress and handle missed, repeated, and reordered updates. Do not describe local availability as a freshness guarantee.

#### Request-Time Data

The PEP collects attributes and includes them in its decision request.

![Request-time data injection](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Request_time_data_injection.png)

The [AuthZEN security considerations](https://openid.net/specs/authorization-api-1_0.html#section-11) address PEP authentication and trust. An authenticated PEP must still derive user identity, roles, ownership, and tenant membership from trusted sources; copying values from an end user request does not make them authoritative. Validate resource identifiers against the actual target and distinguish user-supplied context from verified attributes.

#### Embedded Data

Stable data is packaged with the PDP or policy release.

![Embedded data](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Embedded_data.png)

Use this only when changing the data through a deployment meets its freshness requirement. Avoid embedding mutable account status or revocation data in releases that cannot update promptly.

### Protect Distribution and Administration

Protect network-exposed decision APIs and the APIs that read or modify policy and data. Authenticate PEPs and administrators, restrict each to the tenants and operations they need, and prevent service teams from replacing organization-wide restrictions. [OPA's API security documentation](https://www.openpolicyagent.org/docs/security) describes authentication and authorization for these interfaces. An in-process PDP shares the application's trust boundary; it does not require a separate network authentication exchange.

Verify policy artifacts before activation. For bundles, require a signature from a configured trusted publisher and verify all covered files; [OPA documents the verification and activation rules](https://www.openpolicyagent.org/docs/management-bundles#signature-verification). Protect transport and signing keys as well. A valid signature proves origin and integrity, not that a policy is correct or current.

Pin deployments to reviewed policy and schema versions, and record which revision each PDP actually activates. Reject unexpected or obsolete revisions; allow a rollback only through the reviewed release process. Test that service-owned rules cannot override mandatory restrictions. These controls are needed for embedded releases as well as dynamic delivery.

### Freshness and Outages

Distinguish loss of the policy distribution service from loss of a usable authorization decision. [OPA retains its existing bundle when a new bundle fails verification](https://www.openpolicyagent.org/docs/management-bundles#signature-verification); this preserves availability but does not establish that the old bundle is still fresh enough.

- Continue evaluating a previously verified policy only while its policy, data, and any decision-cache freshness requirements remain satisfied.
- At startup, do not serve protected operations until the required policy and data are available and valid.
- Deny affected operations when required inputs are missing, invalid, or older than the allowed bound. Do not turn a timeout or undefined result into a permit; follow [Deny by Default](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#deny-by-default).
- Exercise revocation, delayed updates, invalid artifacts, unavailable sources, and recovery. Verify the effective decision at the PEP, not just delivery to the PDP.

Prefer reviewed, versioned policies and an explicit freshness budget for each security-relevant input. Select the simplest delivery mechanism that meets those limits and stop granting affected access when it cannot.

## Identity Propagation Patterns

> **Source:** [Identity Propagation Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Identity_Propagation_Patterns_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Identity propagation carries authenticated user context between services. Choose a representation that each recipient can validate and that limits where credentials can be used; [OAuth security guidance](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.3) recommends restricting access tokens to their intended resources and actions. See [Authentication Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Patterns_Cheat_Sheet.html) for authenticating the original request and [Authorization Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Patterns_Cheat_Sheet.html) for enforcing access decisions.

### Validation at Each Boundary

Separate the identity of the calling service from the user on whose behalf it acts. Authenticate service connections using the controls in [Microservices Security](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html#service-to-service-authentication); possession of user context alone does not establish the caller's service identity.

- Accept identity assertions only from configured issuers authorized to make those assertions. For JSON Web Tokens (JWTs), validate the signature, allowed algorithm, issuer, audience, token type, and validity period according to the applicable token profile. [RFC 8725](https://www.rfc-editor.org/rfc/rfc8725#section-3) explains why signature verification alone is insufficient.
- For opaque access tokens, use the issuer's supported validation mechanism. A token's representation does not determine whether it grants access to a particular operation.
- Do not treat an [OpenID Connect ID token](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation) as an API access token. Forwarding a certificate also does not preserve [proof of private-key possession on a TLS connection](https://www.rfc-editor.org/info/rfc8705/). Preserve each protocol's validation and proof requirements.
- Reject missing or invalid context. Each receiving service must still authorize the requested action and resource. A valid signature establishes the issuer and integrity of an assertion, not permission for every request.

The diagrams below illustrate the flow of identity data. Their verification steps include these checks; a component labeled "Verifier" need not be a separate online service.

### Propagation Patterns

#### External Identity Propagation

The edge passes an external access token to a service that is an intended recipient. Each recipient validates it before use.

![External identity propagation](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/External_Identity_Propagation.png)

This is reasonable when services share the token's validation profile and the token is intended for those services. Do not widen token audiences merely to make forwarding work. [Audience restriction](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.10.2) limits the impact of a leaked token; forwarding a bearer token to more services increases the places from which it can leak. Forwarding is not inherently incompatible with Zero Trust, but it does not provide isolation between recipients that accept the same credential.

#### Simple Service-Level Identity Forwarding

A service extracts user attributes and forwards a JSON object, header, or assertion that it signs itself.

![Simple service-level identity forwarding](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Simple_Service_Level_Identity_Forwarding.png)

Avoid making arbitrary application services identity issuers. An authenticated channel, or a signature made by the forwarding service, can identify the sender and protect transit integrity; neither proves that the sender is entitled to assert a user's identity or privileges. Every service trusted to supply these attributes can misrepresent them. If using a trusted proxy header, remove client-supplied copies, authenticate the proxy, and prevent requests from bypassing it. Prefer an assertion from a designated issuer when context crosses multiple service boundaries.

#### Token Exchange

A service presents an incoming token to a Security Token Service (STS) and requests a token for a downstream recipient. [RFC 8693](https://www.rfc-editor.org/rfc/rfc8693#section-2) defines this exchange, including subject and actor tokens, requested audiences, and scopes. Authenticate the requesting service to the STS. The STS must authorize the exchange and constrain the issued privileges; requesting a narrower token is not a substitute for issuer-side enforcement.

![Token exchange](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Token_Exchange_Based_Identity_Issuance.png)

Use exchange when a downstream call needs a different audience or explicit delegation. Preserve the distinction between the user and the acting service where the policy depends on it. Exchange adds an issuance dependency; plan for STS outages without accepting invalid credentials. RFC 8693 does not require all input credentials to be OAuth access tokens or all issued tokens to be signed JWTs.

#### Protocol-Agnostic Identity Propagation

The edge validates the external credential and obtains a normalized internal assertion from a trusted issuer. Internal services validate that assertion instead of implementing each external authentication protocol.

![Protocol-agnostic identity propagation](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Protocol_Agnostic_Identity_Propagation.png)

Prefer this approach when several external authentication mechanisms must feed the same internal services. Keep issuance privileges separate from verification privileges, and limit the assertion's recipients and lifetime. Signing protects integrity; it does not hide claims, prevent bearer-token replay, or compensate for a compromised issuer.

The [Transaction Tokens draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-transaction-tokens-11#section-12.2) is one developing example: an ingress or initiating workload obtains a transaction token and workloads normally propagate it unmodified within a trust domain. Recipients validate its signature, trust-domain audience, and expiry, then authorize their own operation. The draft also permits [constrained replacement by the token service](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-transaction-tokens-11#section-13.15). Its tokens are not replay resistant; this is not a fresh audience-specific exchange at every service hop.

### Privacy and Recommendation

Send only the identity attributes a recipient needs. Use pseudonymous identifiers where appropriate and protect tokens in transit; [RFC 8693's privacy considerations](https://www.rfc-editor.org/rfc/rfc8693#section-6) describe these controls. Mapping an external identifier to an internal one does not by itself prevent correlation, and signing does not provide confidentiality. Keep internal assertions out of client responses and follow the [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude) when recording identity events.

Start with a token that each intended recipient can validate. Use exchange for recipient-specific delegation, or a trusted internal issuer to normalize external credentials. In every pattern, validate context at each receiving service and enforce least privilege there.

## DEPRECATED: Access Control Cheatsheet

> **Source:** [DEPRECATED: Access Control Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

The Access Control cheatsheet has been deprecated.

Please visit the [Authorization Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) instead.

## Insecure Direct Object Reference Prevention

> **Source:** [Insecure Direct Object Reference Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Insecure Direct Object Reference (IDOR) is a vulnerability that arises when attackers can access or modify objects by manipulating identifiers used in a web application's URLs or parameters. It occurs due to missing access control checks, which fail to verify whether a user should be allowed to access specific data.

There are three ingredients to an IDOR:

1. An **object** such as an account, document, support ticket, transaction or partner profile.
2. A **reference** to that object in the form of an ID, UUID, account number, token or slug.
3. A **missing object-level authorization check** that allows a user to access or manipulate an object they should not be able to access.

### Examples

For instance, when a user accesses their profile, the application might generate a URL like this:

```text
https://example.org/users/123
```

The 123 in the URL is a direct reference to the user's record in the database, often represented by the primary key. If an attacker changes this number to 124 and gains access to another user's information, the application is vulnerable to Insecure Direct Object Reference. This happens because the app didn't properly check if the user had permission to view data for user 124 before displaying it.

In some cases, the identifier may not be in the URL, but rather in the POST body, as shown in the following example:

```html
<form action="/update_profile" method="post">
  <!-- Other fields for updating name, email, etc. -->
  <input type="hidden" name="user_id" value="12345">
  <button type="submit">Update Profile</button>
</form>
```

In this example, the application allows users to update their profiles by submitting a form with the user ID in a hidden field. If the app doesn't perform proper access control on the server-side, attackers can manipulate the "user_id" field to modify profiles of other users without authorization.

IDORs however are not limited to user profiles and sequential IDs. For instance:

```http
GET /documents/annual-report.pdf
```

In this example, the filename acts as the object reference. If an attacker modifies the filename to another valid document, such as:

```http
GET /documents/financial-statement.pdf
```

and gains access to a document belonging to another user, the application is vulnerable to IDOR. Object references are not limited to numeric identifiers and may include filenames, account numbers, tokens, or other values.

### Identifier complexity

In some cases, using more complex identifiers like GUIDs can make it practically impossible for attackers to guess valid values. However, even with complex identifiers, access control checks are essential. If attackers obtain URLs for unauthorized objects, the application should still block their access attempts.

### Verifying access controls

When testing for IDOR vulnerabilities, it is useful to create multiple user accounts with different authorization scopes. This allows developers and testers to verify that object-level authorization checks are consistently enforced.

For example:

1. Create User A and User B.
2. Create objects owned by each user (documents, support tickets, invoices, etc.).
3. Authenticate as User A and attempt to access User B's objects by modifying object references in requests.
4. Verify that the application denies unauthorized access regardless of whether the object identifier is predictable or unguessable.

This verification should be performed for all operations involving object references, including read, create, update, delete, export, and administrative actions.

### Mitigation

To mitigate IDOR, implement access control checks for each object that users try to access. Web frameworks often provide ways to facilitate this. Additionally, use complex identifiers as a defense-in-depth measure, but remember that access control is crucial even with these identifiers.

Avoid exposing identifiers in URLs and POST bodies if possible. Instead, determine the currently authenticated user from session information. When using multi-step flows, pass identifiers in the session to prevent tampering.

When looking up objects based on primary keys, use datasets that users have access to. For example, in Ruby on Rails:

```ruby
# vulnerable, searches all projects
@project = Project.find(params[:id])

# secure, searches projects related to the current user
@project = @current_user.projects.find(params[:id])
```

Verify the user's permission every time an access attempt is made. Implement this structurally using the recommended approach for your web framework.

As an additional defense-in-depth measure, replace enumerable numeric identifiers with more complex, random identifiers. You can achieve this by adding a column with random strings in the database table and using those strings in the URLs instead of numeric primary keys. Another option is to use UUIDs or other long random values as primary keys. Avoid encrypting identifiers as it can be challenging to do so securely.

### Java and Spring Boot example

These illustrative examples assume authenticated requests and a policy that only owners can read documents. `currentUser()` represents an application helper that obtains the user from the trusted authentication context. Consider a Spring Boot endpoint that returns a document by its identifier:

```java
@GetMapping("/documents/{id}")
public Document getDocument(@PathVariable Long id) {
    return documentRepository.findById(id).orElseThrow();
}
```

The `{id}` path variable is controlled by the requester and flows directly into `findById()`. Nothing verifies that the returned document belongs to the currently authenticated user, so any user who can guess or obtain a valid identifier can read another user's document.

#### Fixing the code

Prefer a lookup limited to documents owned by the current user. This mirrors the scoped-query approach shown for Ruby on Rails above:

```java
@GetMapping("/documents/{id}")
public Document getDocument(@PathVariable Long id) {
    return documentRepository.findByIdAndOwnerId(id, currentUser().getId())
        .orElseThrow();
}
```

Alternatively, verify ownership explicitly after fetching the object:

```java
@GetMapping("/documents/{id}")
public Document getDocument(@PathVariable Long id) {
    Document document = documentRepository.findById(id).orElseThrow();
    if (!document.getOwnerId().equals(currentUser().getId())) {
        throw new AccessDeniedException("Not allowed");
    }
    return document;
}
```

The post-fetch check can distinguish a missing object from one the caller cannot access. If the resource's existence is sensitive, use the scoped lookup and map both cases to the same public response, such as a [404 (Not Found) response](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.4). For example, `GET /user/john@example.com` should not reveal whether an account exists to a caller who is not allowed to know.

To use Spring Security's [@PreAuthorize](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html) alternative, first enable method security with `@EnableMethodSecurity` on a Spring `@Configuration` class; Spring Boot's security starter does not enable it by default. The following example applies to a Spring-managed component and assumes an application-provided `documentAuthorizationService` that checks ownership:

```java
@PreAuthorize("@documentAuthorizationService.isOwner(#id, authentication.name)")
@GetMapping("/documents/{id}")
public Document getDocument(@PathVariable Long id) {
    return documentRepository.findById(id).orElseThrow();
}
```

## Mass Assignment

> **Source:** [Mass Assignment](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

#### Definition

Software frameworks sometimes allow developers to automatically bind HTTP request parameters into program code variables or objects to make using that framework easier on developers. This can sometimes cause harm.

Attackers can sometimes use this methodology to create new parameters that the developer never intended which in turn creates or overwrites new variable or objects in program code that was not intended.

This is called a **Mass Assignment** vulnerability.

#### Alternative Names

Depending on the language/framework in question, this vulnerability can have several [alternative names](https://cwe.mitre.org/data/definitions/915.html):

- **Mass Assignment:** Ruby on Rails, NodeJS.
- **Autobinding:** Spring MVC, ASP NET MVC.
- **Object injection:** PHP.

#### Example

Suppose there is a form for editing a user's account information:

```html
<form>
     <input name="userid" type="text">
     <input name="password" type="text">
     <input name="email" text="text">
     <input type="submit">
</form>  
```

Here is the object that the form is binding to:

```java
public class User {
   private String userid;
   private String password;
   private String email;
   private boolean isAdmin;

   //Getters & Setters
}
```

Here is the controller handling the request:

```java
@RequestMapping(value = "/addUser", method = RequestMethod.POST)
public String submit(User user) {
   userService.add(user);
   return "successPage";
}
```

Here is the typical request:

```text
POST /addUser
...
userid=bobbytables&password=hashedpass&email=bobby@tables.com
```

And here is the exploit in which we set the value of the attribute `isAdmin` of the instance of the class `User`:

```text
POST /addUser
...
userid=bobbytables&password=hashedpass&email=bobby@tables.com&isAdmin=true
```

#### Exploitability

Mass assignment is exploitable when attacker-controlled input can initialize or update fields that the caller is not authorized to change, such as a role or account owner. Field names may be guessed or discovered; source-code access is not required. [CWE-915](https://cwe.mitre.org/data/definitions/915.html) defines the weakness in terms of insufficient control over writable attributes.

An empty constructor is not a general prerequisite. For example, [Spring supports both constructor and setter binding](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-data-binding.html). Review which inputs the binding mechanism exposes, including nested objects.

#### GitHub case study

In 2012, GitHub was hacked using mass assignment. A user was able to upload his public key to any organization and thus make any subsequent changes in their repositories. [GitHub's Blog Post](https://blog.github.com/2012-03-04-public-key-security-vulnerability-and-mitigation/).

#### Solutions

- Prefer dedicated input objects, such as Data Transfer Objects (DTOs), containing only fields the caller may edit; see [Spring's model design guidance](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-data-binding.html).
- Explicitly allow-list fields when binding to an object with additional properties.
- Do not rely on a block-list as the sole protection: a new or overlooked sensitive field remains bindable. [CWE-915 recommends allowlists over denylists](https://cwe.mitre.org/data/definitions/915.html). The block-list examples below illustrate mechanisms encountered in existing applications, not the recommended design.

DTOs and field allowlists restrict writable properties; they do not replace [authorization for the requested object and operation](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#validate-the-permissions-on-every-request).

### General Solutions

An architectural approach is to create Data Transfer Objects and avoid binding input directly to domain objects. Only the fields that are meant to be editable by the user are included in the DTO.

```java
public class UserRegistrationFormDTO {
 private String userid;
 private String password;
 private String email;

 //NOTE: isAdmin field is not present

 //Getters & Setters
}
```

### Language & Framework specific solutions

#### Spring MVC

##### Allow-listing

```java
@Controller
public class UserController
{
    @InitBinder
    public void initBinder(WebDataBinder binder, WebRequest request)
    {
        binder.setAllowedFields("userid", "password", "email");
    }
...
}
```

See [Spring's model design guidance](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-data-binding.html) for dedicated input objects and allowed fields.

##### Block-listing

Spring describes `disallowedFields` as fragile because fields can be missed or added later. Prefer the allow-list above; this example only excludes the named property.

```java
@Controller
public class UserController
{
   @InitBinder
   public void initBinder(WebDataBinder binder, WebRequest request)
   {
      binder.setDisallowedFields("isAdmin");
   }
...
}
```

See the [Spring data binding limitations](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-data-binding.html).

#### NodeJS + Mongoose

##### Allow-listing

```javascript
var UserSchema = new mongoose.Schema({
    userid: String,
    password: String,
    email : String,
    isAdmin : Boolean,
});

UserSchema.statics = {
    User.userCreateSafeFields: ['userid', 'password', 'email']
};

var User = mongoose.model('User', UserSchema);

_ = require('underscore');
var user = new User(_.pick(req.body, User.userCreateSafeFields));
```

Take a look [here](http://underscorejs.org/#pick) for the documentation.

##### Block-listing

```javascript
var massAssign = require('mongoose-mass-assign');

var UserSchema = new mongoose.Schema({
    userid: String,
    password: String,
    email : String,
    isAdmin : { type: Boolean, protect: true, default: false }
});

UserSchema.plugin(massAssign);

var User = mongoose.model('User', UserSchema);

/** Static method, useful for creation **/
var user = User.massAssign(req.body);

/** Instance method, useful for updating**/
var user = new User;
user.massAssign(req.body);

/** Static massUpdate method **/
var input = { userid: 'bhelx', isAdmin: 'true' };
User.update({ '_id': someId }, { $set: User.massUpdate(input) }, console.log);
```

Take a look [here](https://www.npmjs.com/package/mongoose-mass-assign) for the documentation.

#### Ruby On Rails

Take a look [here](https://guides.rubyonrails.org/v3.2.9/security.html#mass-assignment) for the documentation.

#### Django

Take a look [here](https://coffeeonthekeyboard.com/mass-assignment-security-part-10-855/) for the documentation.

#### ASP NET

Take a look [here](https://odetocode.com/Blogs/scott/archive/2012/03/11/complete-guide-to-mass-assignment-in-asp-net-mvc.aspx) for the documentation.

#### PHP Laravel + Eloquent

##### Allow-listing

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    private $userid;
    private $password;
    private $email;
    private $isAdmin;

    protected $fillable = array('userid','password','email');
}
```

Take a look [here](https://laravel.com/docs/5.2/eloquent#mass-assignment) for the documentation.

##### Block-listing

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    private $userid;
    private $password;
    private $email;
    private $isAdmin;

    protected $guarded = array('isAdmin');
}
```

Take a look [here](https://laravel.com/docs/5.2/eloquent#mass-assignment) for the documentation.

#### Grails

Take a look [here](http://spring.io/blog/2012/03/28/secure-data-binding-with-grails/) for the documentation.

#### Play

Take a look [here](https://www.playframework.com/documentation/1.4.x/controllers#nobinding) for the documentation.

#### Jackson (JSON Object Mapper)

Take a look [here](https://www.baeldung.com/jackson-field-serializable-deserializable-or-not) and [here](http://lifelongprogrammer.blogspot.com/2015/09/using-jackson-view-to-protect-mass-assignment.html) for the documentation.

#### GSON (JSON Object Mapper)

Take a look [here](https://sites.google.com/site/gson/gson-user-guide#TOC-Excluding-Fields-From-Serialization-and-Deserialization) and [here](https://stackoverflow.com/a/27986860) for the document.

#### JSON-Lib (JSON Object Mapper)

Take a look [here](http://json-lib.sourceforge.net/advanced.html) for the documentation.

#### Flexjson (JSON Object Mapper)

Take a look [here](http://flexjson.sourceforge.net/#Serialization) for the documentation.

## Transaction Authorization

> **Source:** [Transaction Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Purpose and audience

This cheat sheet discusses how developers can secure transaction authorizations and prevent them from being bypassed. These guidelines are for:

- **Banks** - who must create functional and non-functional requirements for transaction authorization.
- **Developers** – who need to eliminate vulnerabilities in transaction authorizations.
- **Pentesters** – who must determine if transaction authorizations are secure.

### Introduction

Generally, mobile and online applications will require users to submit a second factor so the system can check whether they are authorized to perform a sensitive operation (such as wire transfer authorization). In this document, we say that these actions are *transaction authorizations*.

Transaction authorizations are often used in financial systems, but the need for secure transactions has driven the adoption of authorizations across the internet.  For example, an email that allows users to unlock a user account by providing them with a secret code or a link that has a token contains a transaction authorization. A transaction authorization can be implemented with methods such as:

- A card that has a transaction authorization number
- A time-based one-time password (OTP) token, such as an [OATH TOTP (Time-based One-Time Password)](https://en.wikipedia.org/wiki/Time-based_One-time_Password_Algorithm)
- A OTP sent by SMS or provided by phone
- A digital signature provided by a smart card or a smartphone
- A challenge-response token, including unconnected card readers or solutions which scan transaction data from the user's computer screen

Some of these forms of transaction authorizations can be implemented with a physical device or in a mobile application.

### 1. Functional Guidelines

#### 1.1 Transaction authorization method has to allow a user to identify and acknowledge significant transaction data

Since developers cannot assume that a user's computer is secure, an external authorization component would be have to check data for a typical transaction.

When the developer builds components for transaction authorizations, they should use the *What You See Is What You Sign* principle. An authorization method must permit a user to identify and acknowledge the data that is significant to a given transaction. For example, in the case of a wire transfer, the user should be able to identify the target account and amount.

As developers determine what transaction data is significant, their decisions should be based on:

- The real risk
- The technical capabilities and constraints of the chosen authorization method
- The users having a positive experience

For example, if an SMS message confirms significant transaction data, the developer could respond by returning the target account, amount and type of transfer to the user. However, it is inconvenient for an unconnected [CAP reader](https://en.wikipedia.org/wiki/Chip_Authentication_Program) to require users to enter that data. In such cases, the developer should probably return the minimum amount of significant transaction data (e.g. partial target account number and amount) for confirmation.

In general, the user must verify all significant transaction data as a part of the transaction authorization process. If a transaction process requires a user to enter transaction data into an external device, the user should be prompted to confirm a specific value in the transaction (e.g. a target account number). The absence of a meaningful prompt could be easily abused by social engineering techniques and malware as described below in Section 1.4. Also, for more detailed discussion of input overloading problems, see [here](https://www.cl.cam.ac.uk/~sjm217/papers/fc09optimised.pdf).

#### 1.2 Change of authorization token should be authorized using the current authorization token

If a user can use the application interface to change the authorization token, they should be able to authorize the operation with their current authorization credentials (as is the case with [password change procedure](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/04-Authentication_Testing/09-Testing_for_Weak_Password_Change_or_Reset_Functionalities.html)). For example: when a user changes a phone number for SMS codes, an authorization SMS code should be sent to the current phone number.

#### 1.3 Change of authorization method should be authorized using the current authorization method

Some applications allow a user to chose how their transactions will be authorized. In such cases, the developer should make sure that the application can confirm the user's method of authorization to prevent any malware from changing the user's authorization method to the most vulnerable method. Additionally, the application should inform the user about any potential dangers associated with their authorization method.

#### 1.4 Users should be able to easily distinguish the authentication process from the transaction authorization process

Since developers need to prevent users from authorizing fraudulent operations, their applications should not require a user to perform the same actions for authentication and transaction authorization. Consider the following example:

1. An application is using the same method for user authentication and for transaction authorization {i.e. with an OTP token).
2. Malware could use a man-in-the-middle attack to present a user with a false error message when they submit credentials to the application, which could trick the user into repeating the authentication procedure. The first credential will be used by the malware for authentication and the second credential would be used to authorize a fraudulent transaction. Even challenge-response schemes could be abused using this scenario, since malware can present a challenge taken from a fraudulent transaction and trick the user to provide a response. Such an attack scenario is used widely in [malware attacks against electronic banking](http://securityintelligence.com/back-basics-malware-authors-downgrade-tactics-stay-radar/#.VX_qI_krLDc).

To stop such attacks, developers can make sure that authentication actions are different than transaction authorizations by:

- Using different methods to authenticate and to authorize
- Employing different actions in an external security component (i.e using a different mode of operation in a CAP reader)
- Presenting the user with a clear message about what they are "signing" (What You See Is What You Sign Principle)

Social engineering methods [can be used despite authentication and operation authorization methods](http://securityintelligence.com/tatanga-attack-exposes-chiptan-weaknesses/#.VZAy9PkrLDc) but the application shouldn't make it easier for such attack scenarios.

#### 1.5 Each transaction should be authorized using unique authorization credentials

If applications only ask for transaction authorization credentials once (such as a static password, code sent through SMS, or a token response), the user could authorize any transaction during the entire session or reuse the same credentials when they need to authorize a transaction. In this scenario, attackers can employ malware to sniff credentials and use them to authorize any transaction without the user's knowledge.

### 2. Non-functional guidelines

#### 2.1 Authorization should be performed and enforced server-side

Like [all other security controls](https://cwe.mitre.org/data/definitions/602.html), transaction authorizations should be enforced on the server side. It should **never** be possible to influence an authorization's result by altering the data that flows from a client to a server by:

- Tampering with parameters that contain transaction data
- Adding/removing parameters which will disable authorization check
- Causing an error

To ensure that data is only managed on the server side, security programming best practices should be applied, such as:

- [Default deny](https://wiki.owasp.org/index.php/Positive_security_model)
- Avoiding debugging functionality in production code

Other safeguards should be considered to prevent tampering, such as encrypting the data for confidentiality and integrity, then decrypting and verifying the data on the server side.

#### 2.2 Authorization method should be enforced server-side

If multiple transaction authorization methods are made available to the user, the server side must make sure that the transaction occurs with the user's chosen authorization method or the authorization method enforced by application policies. Otherwise, malware could downgrade an authorization method to even the least secure authorization method. Developers must make it impossible for attackers to change a chosen authorization method by manipulating the parameters provided from the client.

Developers should be especially careful if they are asked to add a new authorization method that enhances security. Unfortunately, developers often decide to build a new authorization method on top of an old codebase. This case is insecure and an attacker could manipulate a client to successfully authorize a transaction by sending parameters using the old method, despite the fact that the application has already switched to a new method.

#### 2.3 Transaction verification data should be generated server-side

If developers decide to transmit significant transaction data programmatically to an authorization component, they should take extra care to prevent any client modifications to the transaction data at authorization. **All significant transaction data must be verified by the user, generated and stored on a server, then passed to an authorization component without any possibility of tampering by the client.**

And when developers collect significant transaction data on the client side and pass it on to the server, malware could manipulate the data and show faked transaction data in an authorization component.

#### 2.4 Application should prevent authorization credentials brute-forcing

**Developers must make sure that their application can't allow attackers to brute-force a transaction at the point where transaction authorization credentials are submitted to the server for verification. After a set number of failed authorization attempts, the entire transaction authorization process should be restarted.** Also, there are other methods to prevent brute-forcing and stop other automation-related techniques, see [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#protect-against-automated-attacks).

#### 2.5 Application should control which transaction state transitions are allowed

Transaction authorization is usually performed in multiple steps, e.g.:

1. The user enters the transaction data.
2. The user requests authorization from the application.
3. The application initializes an authorization mechanism.
4. The user verifies/confirms the transaction data.
5. The user responds with the authorization credentials.
6. The application validates authorization and executes a transaction.

**The developers must ensure that the business logic flow for a transaction authorization occurs in sequential order so users (or attackers) cannot perform the steps out of order or even skip any of the steps.** This should protect against attack techniques such as:

- Overwriting transaction data before user will enter the authorization credentials
- Skipping transaction authorization

 See [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) requirement **15.1**).

#### 2.6 Transaction data should be protected against modification

Developers must not allow attackers to modify transaction data when the user enters the data for the first time. Poor implementations may allow malware to:

1. Replay the first step in Section 2.5 (sending transaction data) in the background before the user enters authorization credentials and then overwrite transaction details with a fraudulent transaction.
2. Create and add new transaction data parameters to a HTTP request that is authorizing the transaction. In such a case, a transaction authorization process that is poorly implemented might authorize the initial transaction and then execute a fraudulent transaction (specific example of [Time of Check to Time of Use vulnerability](https://cwe.mitre.org/data/definitions/367.html)).

There are multiple methods that can prevent transaction data from being modified during authorization:

1. If transaction data is modified, the code could invalidate any previously entered authorization data (e.g. Generated OTP) and the challenge.
2. Modifications to transaction data could trigger a reset of the authorization process.
3. Any attempt to modify transaction data after user entry is an attack on the system and it should be logged, monitored, and carefully investigated.

#### 2.7 Confidentiality of transaction data should be protected during all client-server communications

The transaction authorization process should protect the privacy of transaction data that the user will be authorizing (i.e. at Section 2.5, steps 2 and 4).

#### 2.8 System should check each transaction execution and make sure it has been properly authorized

The final result of the transaction entry and authorization process (as described in Section 2.5) is also called the *transaction execution*. There should be a final control gate before transaction execution which verifies whether the transaction was properly authorized by the user. This control should be tied to execution and prevent attacks such as:

- Time of Check to Time of Use (TOCTOU) – example in Section 2.6
- Skipping authorization check in the transaction entry process (see. Section 2.5)

#### 2.9 Authorization credentials should only be valid during a limited time period

In some attacks, a user's authorization credentials are passed by malware to a command-and-control server and then are used from an attacker-controlled machine. Often, this process is often performed manually by an attacker. To make sure that these are attacks are difficult, the server should only allow transaction authorization to occur in a limited time window which should occur between the generation of a challenge (or OTP) and the completion of an authorization. Additionally, such safeguards will also help stop resource exhaustion attacks. This time period should be carefully selected so it will not disrupt normal user behavior.

#### 2.10 Authorization credentials should be unique for every operation

To prevent multiple replay attacks, each set of authorization credentials should be unique for every operation. These credentials can be generated with different methods depending on the mechanism. For example: developers can use a timestamp, a sequence number, or a random value in signed transaction data or as a part of a challenge.

### Remarks

For the original implementation recommendations, see [Wojciech Dworakowski's AppSec EU 2015 presentation](https://www.slideshare.net/slideshow/ebanking-transaction-authorization-appsec-eu-2015-amsterdam/48703604). For banking threat-modeling context, see [Morana and Ucedavelez's AppSec EU 2011 presentation](https://www.slideshare.net/slideshow/owasp-app-seceu2011version1/8333111).

Here are some other issues that should be considered while implementing transaction authorizations, but are beyond the scope of this cheat sheet:

- Which transactions should be authorized? All transactions or only some of them? Each application is different and an application owner should decide if all transactions should be authorized or only some of them. The developers should consider risk analysis, risk exposition of given application, and other safeguards implemented in an application.
- **We recommend the use of cryptographic operations to protect transactions and to ensure integrity, confidentiality and non-repudiation.**
- **It is critically important to provision & protect the device signing keys during device "pairing" is as is the actual signing protocol itself. Malware may attempt to inject/replace or steal the signing keys.**
- User awareness: For example in transaction authorization methods, when a user types in significant transaction data to an authorization component (e.g. an external dedicated device or a mobile application), users should be trained to rewrite transaction data from a trusted source and not from a computer screen.
- **There are some anti-malware solutions that protect against such threats but these solutions [cannot be 100% effective](http://www.securing.pl/en/script-based-malware-detection-in-online-banking-security-overview/index.html) and should be used only as an additional layer of protection.**
- Protecting your signing keys with a second factor such as passwords, biometrics, etc. or leveraging secure elements (TEE, TPM, Smart card).

## Multi-Tenant Application Security

> **Source:** [Multi-Tenant Application Security](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Multi-tenant applications serve multiple customers (tenants) from a shared infrastructure, codebase, and often shared databases. This architecture is the foundation of modern SaaS platforms, offering cost efficiency and simplified operations.

However, multi-tenancy introduces critical security challenges: a single vulnerability can expose all tenants' data, misconfigurations can leak data across tenant boundaries, and resource contention can impact availability.

This cheat sheet provides best practices to secure multi-tenant applications, ensure tenant isolation, and prevent cross-tenant attacks.

### Key Risks

Use the [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) for baseline access controls.

- **Cross-Tenant Data Leakage**: Bugs or misconfigurations exposing one tenant's data to another.
- **Tenant Impersonation**: Attackers gaining access to another tenant's context or resources.
- **Broken Tenant Isolation**: Insufficient separation at database, cache, storage, or compute layers.
- **Insecure Direct Object References (IDOR)**: Accessing resources by manipulating tenant/resource IDs.
- **Noisy Neighbor Attacks**: One tenant exhausting shared resources, impacting others (DoS).
- **Privilege Escalation Across Tenants**: Exploiting admin functions to access other tenants.
- **Tenant Context Injection**: Manipulating tenant identifiers in requests, tokens, or headers.
- **Shared Resource Poisoning**: Cache poisoning, queue injection, or storage pollution affecting other tenants.
- **Insecure Tenant Onboarding/Offboarding**: Incomplete provisioning, unauthorized residual access, or retention beyond policy.
- **Audit & Compliance Gaps**: Insufficient tenant-specific logging for regulatory requirements.

### Best Practices

#### 1. Tenant Identification & Context Management

- For tenant-scoped operations, establish tenant context early in the request lifecycle (middleware/interceptor).
- Choose identifiers appropriate to their exposure risk. Opaque, random identifiers can reduce enumeration, but they are not authorization controls.
- Treat client-supplied tenant identifiers as selectors only. Verify that the authenticated principal is authorized to act in the selected tenant.
- Bind tenant context to a server-verified identity and current tenant membership or service authorization.
- Propagate server-verified tenant context to components that need it for tenant-sensitive decisions or observability; do not let downstream components replace it with unverified input.

<details>
<summary>Bad example: Trusting client-supplied tenant ID</summary>

```python
# Dangerous: The header selects a tenant without checking the caller's membership.
# Query parameterization prevents injection, not cross-tenant access.
def get_tenant_data(request):
    tenant_id = request.headers.get("X-Tenant-ID")  # Attacker can modify!
    return db.execute("SELECT * FROM data WHERE tenant_id = :tid", {"tid": tenant_id})
```

</details>

<details>
<summary>Good example: Verifying tenant context against authenticated identity</summary>

```python
from functools import wraps
from contextvars import ContextVar
from typing import Optional

class TenantContext:
    def __init__(self, tenant_id: str, user_id: str, roles: list):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.roles = roles
        self.is_validated = True

# Request-local tenant context
current_tenant: ContextVar[Optional[TenantContext]] = ContextVar(
    'current_tenant', default=None
)

class TenantMiddleware:
    """Verify tenant context against authenticated identity and membership."""

    async def __call__(self, request, call_next):
        # A verified claim may select the tenant, but authorization still
        # depends on the issuer's guarantees or a current membership check.
        token_claims = request.state.verified_claims  # Set by auth middleware

        if not token_claims or "tenant_id" not in token_claims:
            return JSONResponse(status_code=401, content={"error": "Missing tenant context"})

        tenant_id = token_claims["tenant_id"]

        principal_id = token_claims["sub"]
        membership = await self.tenant_service.get_active_membership(
            principal_id, tenant_id
        )
        if not membership:
            return JSONResponse(status_code=403, content={"error": "Tenant access denied"})

        # Set tenant context for this request
        ctx = TenantContext(
            tenant_id=tenant_id,
            user_id=principal_id,
            roles=membership.roles
        )
        token = current_tenant.set(ctx)

        try:
            response = await call_next(request)
            return response
        finally:
            current_tenant.reset(token)

def require_tenant(func):
    """Decorator ensuring tenant context is present."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        ctx = current_tenant.get()
        if not ctx or not ctx.is_validated:
            raise SecurityException("Tenant context required")
        return await func(*args, **kwargs)
    return wrapper
```

</details>

#### 2. Database Isolation Strategies

Choose an isolation strategy based on security requirements, compliance needs, and operational complexity:

| Strategy | Potential Boundary | Conditions and Trade-Offs |
|----------|--------------------|---------------------------|
| Separate Databases | Database and credential boundary | Strong when credentials, network access, administrative paths, and backups are isolated; higher operational cost |
| Separate Schemas | Namespace and database-role boundary | Requires disciplined grants, role separation, `search_path` handling, and migrations |
| Shared Tables (Row-Level) | Policy and row boundary | Requires enforceable tenant ownership, policy coverage for classified tenant-owned tables, constrained request roles, and negative-path tests |
| Hybrid | Varies by workload or tier | Document and test the boundary used for each data class |

<details>
<summary>Row-Level Security Implementation (PostgreSQL)</summary>

```sql
-- Enable RLS on tenant tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy that restricts access to current tenant
CREATE POLICY tenant_isolation_policy ON orders
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_policy ON customers
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Force RLS for table owners (not superusers or BYPASSRLS roles)
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
```

</details>

##### Do Not Use an RLS-Bypassing Role for Tenant-Scoped Request Paths

`FORCE ROW LEVEL SECURITY` applies policies to a table owner. It does not constrain a superuser or a role with the `BYPASSRLS` attribute; PostgreSQL documents that [both always bypass row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

- Connect the normal application request path with a least-privileged role that is neither a superuser nor a `BYPASSRLS` role.
- Reserve privileged connections for migrations and explicitly authorized administrative jobs.
- Do not serve ordinary tenant-scoped requests through a privileged connection. A privileged job must explicitly authorize and constrain its tenant set or cross-tenant operation because RLS will not do so.
- Check the deployed request role, not only the role declared in source-controlled configuration. PostgreSQL exposes `rolsuper` and `rolbypassrls` in [`pg_roles`](https://www.postgresql.org/docs/current/view-pg-roles.html).

##### Scope Tenant Context to the Transaction

The example policy depends on `current_setting('app.current_tenant')`. Because it omits the optional `missing_ok => true` argument, PostgreSQL raises an error if the setting does not exist instead of returning `NULL`; that is a deliberate fail-closed choice. The [`current_setting` documentation](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SET) describes both behaviors.

A normal `SET` persists until the session ends after its transaction commits, while [`SET LOCAL` lasts only for the current transaction](https://www.postgresql.org/docs/current/sql-set.html). When an application or connection pool reuses a database session without resetting it, session-scoped tenant state can therefore be inherited by the next request.

- Begin a transaction, set the tenant context with `SET LOCAL`, or call `set_config('app.current_tenant', tenant_id, true)`, then execute queries that depend on that setting in the same transaction. The `true` argument makes [`set_config` transaction-local](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SET).
- Re-establish the tenant context for every transaction. Never assume a newly borrowed connection has the correct setting.
- Fail closed if the tenant context is missing or invalid; do not fall back to an unscoped query.
- Commit or roll back before returning the connection to the pool.

SQLAlchemy [deprecated `QueryEvents.before_compile`](https://docs.sqlalchemy.org/en/20/orm/events.html#sqlalchemy.orm.QueryEvents.before_compile) because it does not cover ORM-level attribute and relationship loads. The current [recommended pattern](https://docs.sqlalchemy.org/en/20/orm/queryguide/api.html#sqlalchemy.orm.with_loader_criteria) combines `SessionEvents.do_orm_execute` with `with_loader_criteria` so criteria propagate to occurrences of the mapped entity, including eager and lazy relationship loads.

<details>
<summary>Application-Level Enforcement (Python/SQLAlchemy)</summary>

```python
from sqlalchemy import event, Column, String, text
from sqlalchemy.orm import Session, declared_attr, with_loader_criteria
from contextlib import contextmanager

class TenantMixin:
    """Mixin that adds tenant_id to models that inherit it."""

    @declared_attr
    def tenant_id(cls):
        return Column(String(36), nullable=False, index=True)

class TenantAwareSession(Session):
    """Session carrying tenant context for participating ORM operations."""

    def __init__(self, *args, tenant_id: str | None = None, **kwargs):
        super().__init__(*args, **kwargs)
        self._tenant_id = tenant_id

    @property
    def tenant_id(self):
        if not self._tenant_id:
            raise SecurityException("Tenant ID not set on session")
        return self._tenant_id

# Add tenant criteria to ORM SELECTs issued through TenantAwareSession.
# with_loader_criteria propagates this rule to eager and lazy relationship loads.
@event.listens_for(TenantAwareSession, "do_orm_execute")
def add_tenant_filter(execute_state):
    if (
        execute_state.is_select
        and not execute_state.is_column_load
        and not execute_state.is_relationship_load
    ):
        tenant_id = execute_state.session.tenant_id
        execute_state.statement = execute_state.statement.options(
            with_loader_criteria(
                TenantMixin,
                lambda model: model.tenant_id == tenant_id,
                include_aliases=True,
            )
        )

# Set and validate tenant_id for new mapped objects in this session.
@event.listens_for(TenantAwareSession, "before_flush")
def set_tenant_on_insert(session, flush_context, instances):
    tenant_id = session.tenant_id
    for target in session.new:
        if isinstance(target, TenantMixin):
            if target.tenant_id not in (None, tenant_id):
                raise SecurityException("Object tenant does not match session")
            target.tenant_id = tenant_id

# Secure session factory
@contextmanager
def tenant_session(tenant_id: str):
    """Create a tenant-scoped database session."""
    ctx = current_tenant.get()
    if not ctx or ctx.tenant_id != tenant_id:
        raise SecurityException("Tenant session requires verified context")

    session = TenantAwareSession(bind=engine, tenant_id=tenant_id)

    try:
        # The final true makes the tenant context transaction-local
        session.execute(
            text("SELECT set_config('app.current_tenant', :tenant_id, true)"),
            {"tenant_id": tenant_id}
        )
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
```

</details>

This ORM helper is defense in depth, not complete enforcement. It applies tenant criteria to ORM SELECTs issued through `TenantAwareSession`, with the criteria propagated to relationship loaders. Raw SQL, Core connections, bulk operations, and code using another session type require separate controls; use database policies or constrained roles as the final boundary where possible.

##### Verify Tenant Isolation

Test isolation through the same role, connection path, and pooling mode used by the application. A privileged test connection can make a correct policy appear broken, while a test that never exercises the deployed request role can miss a bypass.

- **Test the authorization matrix.** For each RLS-protected table, prove that expected cross-tenant operations are denied and expected same-tenant operations succeed. Where sharing or platform administration is intentional, test the exact permitted path and prove that it grants no broader access.
- **Discover coverage.** Derive the expected tenant-scoped table inventory from the schema or an explicit classification, then compare it with PostgreSQL's [`pg_class.relrowsecurity` and `relforcerowsecurity`](https://www.postgresql.org/docs/current/catalog-pg-class.html) and the [`pg_policies`](https://www.postgresql.org/docs/current/view-pg-policies.html) view. Fail when a new table has no classification, RLS is disabled, or the expected policy is absent.
- **Assert the request role.** In the deployed environment, fail a configuration test if the request-path role has `rolsuper` or `rolbypassrls` set.
- **Exercise connection reuse.** Run requests for two tenants over reused connections and prove the second request cannot observe the first request's tenant context.

A hand-maintained table list can drift: the same omission that leaves RLS off a new table can also leave that table out of the test. Prefer schema-derived discovery, or gate schema changes so each new table must be classified as tenant-scoped, intentionally shared, or otherwise isolated.

#### 3. Preventing Cross-Tenant Data Access (IDOR Prevention)

- For each tenant-scoped resource, verify that the authenticated principal can act in the resource's tenant.
- Include tenant scope in the lookup or authorization policy when ownership is tenant-specific. A composite key (`tenant_id` + `resource_id`) is one option, not a universal requirement.
- Enforce authorization at a boundary traversed by every tenant-owned access path. Add data-layer checks as defense in depth where the architecture supports them.
- Treat opaque or random identifiers as defense in depth against enumeration, not as a substitute for authorization.

<details>
<summary>Bad example: Direct object reference without tenant validation</summary>

```python
# Dangerous: Only checks resource_id, not tenant ownership
@app.get("/api/documents/{document_id}")
async def get_document(document_id: str):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404)
    return doc  # Could return another tenant's document!
```

</details>

<details>
<summary>Good example: Tenant-scoped resource access</summary>

```python
from uuid import UUID
from typing import TypeVar, Generic, Type

T = TypeVar('T')

class TenantScopedRepository(Generic[T]):
    """Repository that scopes the operations provided below to one tenant."""

    def __init__(self, model: Type[T], session: Session):
        self.model = model
        self.session = session

    @property
    def tenant_id(self) -> str:
        ctx = current_tenant.get()
        if not ctx:
            raise SecurityException("Tenant context required")
        return ctx.tenant_id

    def get_by_id(self, resource_id: UUID) -> Optional[T]:
        """Get resource only if it belongs to current tenant."""
        return self.session.query(self.model).filter(
            self.model.id == resource_id,
            self.model.tenant_id == self.tenant_id  # Tenant-owned resource
        ).first()

    def list_all(self, limit: int = 100, offset: int = 0) -> list[T]:
        """List resources for current tenant only."""
        return self.session.query(self.model).filter(
            self.model.tenant_id == self.tenant_id
        ).limit(limit).offset(offset).all()

    def create(self, **kwargs) -> T:
        """Create resource with tenant_id automatically set."""
        if 'tenant_id' in kwargs and kwargs['tenant_id'] != self.tenant_id:
            raise SecurityException("Cannot create resource for different tenant")

        kwargs['tenant_id'] = self.tenant_id
        instance = self.model(**kwargs)
        self.session.add(instance)
        return instance

    def delete(self, resource_id: UUID) -> bool:
        """Delete resource only if it belongs to current tenant."""
        result = self.session.query(self.model).filter(
            self.model.id == resource_id,
            self.model.tenant_id == self.tenant_id
        ).delete()
        return result > 0

# Usage
@app.get("/api/documents/{document_id}")
@require_tenant
async def get_document(document_id: UUID, db: Session = Depends(get_db)):
    repo = TenantScopedRepository(Document, db)
    doc = repo.get_by_id(document_id)
    if not doc:
        raise HTTPException(404, "Document not found")  # Don't reveal if it exists for other tenant
    return doc
```

</details>

#### 4. Cache & Session Isolation

- Classify each cached value as global, tenant-scoped, or user-scoped.
- Include the tenant identifier in every cache key whose value or authorization varies by tenant.
- Give intentionally shared entries an explicit global namespace and document why they are safe to share.
- Include every other attribute that changes the result, such as user, locale, feature set, or permission version.
- Authorize the request before reading a protected cached value; cache-key separation does not replace authorization.
- Use separate cache instances for tenants that require stronger physical isolation.
- Choose TTL and invalidation behavior from freshness and authorization risk. Immutable, versioned global entries may not require expiry.

<details>
<summary>Bad example: Tenant-scoped data stored under a shared key</summary>

```python
# Dangerous: user IDs are not guaranteed to be unique across tenants,
# and the key incorrectly places tenant-scoped data in a global namespace.
def get_user_preferences(user_id: str):
    cache_key = f"global:user-preferences:{user_id}"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    # ...
```

</details>

<details>
<summary>Good example: Explicit tenant and global cache scopes</summary>

```python
import json

def tenant_cache_key(tenant_id: str, resource: str, item_id: str) -> str:
    return f"tenant:{tenant_id}:{resource}:{item_id}"

def global_cache_key(resource: str, version: str) -> str:
    return f"global:{resource}:{version}"

async def get_user_preferences(user_id: str):
    # These application-specific helpers derive tenant context from the
    # verified session and enforce access before the cache lookup.
    tenant_id = require_authenticated_tenant()
    await authorize_user_access(tenant_id, user_id)

    # Preferences vary by tenant, so tenant_id is part of the key.
    key = tenant_cache_key(tenant_id, "user-preferences", user_id)
    if cached := redis.get(key):
        return json.loads(cached)

    preferences = await db.fetch_preferences(tenant_id, user_id)
    redis.setex(key, 1800, json.dumps(preferences))
    return preferences

async def get_country_codes():
    # This versioned reference data is identical and authorized for all tenants.
    key = global_cache_key("country-codes", "v1")
    if cached := redis.get(key):
        return json.loads(cached)

    country_codes = await db.fetch_public_country_codes()
    redis.setex(key, 86400, json.dumps(country_codes))
    return country_codes
```

</details>

#### 5. API, Asynchronous Work & Resource Controls

##### API Security & Rate Limiting

- When tenants share capacity or quotas, include tenant identity as one rate-limit dimension alongside any required global, endpoint, user, or IP limits.
- Rate limits at the HTTP boundary do not constrain every shared resource. Where tenant load can affect other tenants, apply tenant-aware limits or scheduling to the relevant bottlenecks, such as concurrent work, queued messages, database connections, fan-out, CPU, or memory. Retain global safety limits, and isolate a worker or resource pool when the risk or service commitment justifies the operational cost. The [AWS SaaS Lens](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/pe-selection.html) describes scaling, throttling, and selective resource isolation as complementary noisy-neighbor controls.
- Validate server-verified tenant context on every tenant-scoped API request. Public or global endpoints need no artificial tenant context.
- Bind API credentials to explicit tenant sets, environments, and permission scopes. An intentionally cross-tenant service identity must be separately authorized and least privileged.
- When B2B request signing is required, bind the signature to the security-relevant request context, such as tenant selection, target audience, method, path, body digest, and expiration, as applicable.

The limits below are illustrative. Choose production limits from capacity, abuse risk, and contractual quotas, and mount tenant-aware middleware only on routes where tenant context is required.

<details>
<summary>Tenant-Aware Rate Limiting</summary>

```python
import time
from dataclasses import dataclass
from enum import Enum

class TenantTier(Enum):
    FREE = "free"
    STARTER = "starter"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"

@dataclass
class RateLimitConfig:
    requests_per_minute: int
    requests_per_day: int
    burst_size: int

TIER_LIMITS = {
    TenantTier.FREE: RateLimitConfig(60, 1000, 10),
    TenantTier.STARTER: RateLimitConfig(300, 10000, 50),
    TenantTier.BUSINESS: RateLimitConfig(1000, 100000, 100),
    TenantTier.ENTERPRISE: RateLimitConfig(5000, 1000000, 500),
}

class TenantRateLimiter:
    """One tenant dimension in a broader rate-limiting strategy."""

    def __init__(self, redis_client):
        self.redis = redis_client

    async def check_rate_limit(self, tenant_id: str, tenant_tier: TenantTier) -> dict:
        """Check and update rate limit for tenant."""
        config = TIER_LIMITS[tenant_tier]
        now = time.time()
        minute_key = f"rl:{tenant_id}:min:{int(now // 60)}"
        day_key = f"rl:{tenant_id}:day:{int(now // 86400)}"

        pipe = self.redis.pipeline()

        # Increment counters
        pipe.incr(minute_key)
        pipe.expire(minute_key, 60)
        pipe.incr(day_key)
        pipe.expire(day_key, 86400)

        results = pipe.execute()
        minute_count = results[0]
        day_count = results[2]

        # Check limits
        if minute_count > config.requests_per_minute:
            return {
                "allowed": False,
                "reason": "minute_limit_exceeded",
                "retry_after": 60 - (now % 60),
                "limit": config.requests_per_minute
            }

        if day_count > config.requests_per_day:
            return {
                "allowed": False,
                "reason": "daily_limit_exceeded",
                "retry_after": 86400 - (now % 86400),
                "limit": config.requests_per_day
            }

        return {
            "allowed": True,
            "remaining_minute": config.requests_per_minute - minute_count,
            "remaining_day": config.requests_per_day - day_count
        }

class RateLimitMiddleware:
    """Middleware for routes that require tenant-scoped rate limits."""

    async def __call__(self, request, call_next):
        ctx = current_tenant.get()
        if not ctx:
            return JSONResponse(
                status_code=401,
                content={"error": "Tenant context required"}
            )

        tenant = await self.tenant_service.get_tenant(ctx.tenant_id)
        result = await self.rate_limiter.check_rate_limit(
            ctx.tenant_id,
            tenant.tier
        )

        if not result["allowed"]:
            return JSONResponse(
                status_code=429,
                content={"error": "Rate limit exceeded", "details": result},
                headers={
                    "Retry-After": str(int(result["retry_after"])),
                    "X-RateLimit-Limit": str(result["limit"]),
                    "X-RateLimit-Remaining": "0"
                }
            )

        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Remaining-Minute"] = str(result["remaining_minute"])
        response.headers["X-RateLimit-Remaining-Day"] = str(result["remaining_day"])

        return response
```

</details>

##### Tenant-Aware Asynchronous Work

Classify asynchronous work as global, tenant-scoped, or explicitly cross-tenant. A shared queue or topic is not itself a tenant-isolation boundary. [Microsoft's multitenant messaging guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/messaging) describes the trade-off between shared and dedicated messaging infrastructure and the need for application-enforced isolation when infrastructure is shared.

- For tenant-scoped work, derive tenant context from the authenticated producer and bind it to the message through trusted broker routing, authenticated metadata, or an integrity-protected payload. Do not let an unverified message field replace the producer's authorized scope.
- At the consumer, authenticate the producer or broker path, re-establish tenant context, and authorize the operation and target resource. Re-check time-sensitive membership or permission when delayed execution could make the original decision stale.
- Scope idempotency and deduplication keys, retry state, dead-letter access, and per-tenant ordering when their data or effects vary by tenant. Global jobs and authorized cross-tenant jobs should use explicit identities and scopes rather than a fabricated tenant.
- Apply tenant-aware queue depth, concurrency, and throughput controls when a shared worker fleet or broker is susceptible to noisy-neighbor load; retain service-wide limits for aggregate exhaustion.

#### 6. File Storage & Blob Isolation

- Classify stored objects as global, tenant-scoped, or user-scoped. Keep intentionally shared assets in an explicit global namespace.
- Partition tenant-scoped objects with a tenant-aware key, bucket, account, or enforceable storage policy.
- Authorize access to the exact object and operation before serving it or generating a signed URL.
- Limit signed URLs to the required object and method, with a lifetime appropriate to the operation and revocation model. The tenant identifier does not need to appear in the URL when authorization happened before signing.
- Use tenant-specific encryption keys when the risk or compliance model requires cryptographic isolation. A shared managed key with enforced access context can also be appropriate.

<details>
<summary>Illustrative Tenant-Scoped File Storage</summary>

```python
import boto3
from botocore.config import Config
from datetime import datetime
from pathlib import PurePosixPath
from typing import Optional
import re

class TenantFileStorage:
    """Illustrative S3 helper for tenant-scoped objects."""

    def __init__(self, bucket_name: str, kms_key_id: str = None):
        self.bucket = bucket_name
        self.s3 = boto3.client('s3', config=Config(signature_version='s3v4'))
        self.kms_key_id = kms_key_id

    def _get_tenant_prefix(self, tenant_id: str) -> str:
        """Generate tenant-specific path prefix."""
        # Naming is not authorization. Accept only the application's canonical
        # tenant identifier format so it cannot alter the object-key structure.
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", tenant_id):
            raise ValueError("Invalid tenant identifier")
        return f"tenants/{tenant_id}"

    def _build_key(self, tenant_id: str, file_path: str) -> str:
        """Build full S3 key with tenant isolation."""
        path = PurePosixPath(file_path)
        if not path.parts or path.is_absolute() or ".." in path.parts or "\\" in file_path:
            raise ValueError("Invalid object path")
        return f"{self._get_tenant_prefix(tenant_id)}/{path.as_posix()}"

    async def upload_file(self, tenant_id: str, file_path: str,
                         content: bytes, content_type: str) -> dict:
        """Upload file for tenant."""
        await authorize_file_access(tenant_id, file_path, "put_object")
        key = self._build_key(tenant_id, file_path)

        extra_args = {
            'ContentType': content_type,
            'Metadata': {
                'tenant-id': tenant_id,
                'uploaded-at': datetime.utcnow().isoformat()
            }
        }

        # Use tenant-specific KMS key if available
        if self.kms_key_id:
            extra_args['ServerSideEncryption'] = 'aws:kms'
            extra_args['SSEKMSKeyId'] = self.kms_key_id

        self.s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=content,
            **extra_args
        )

        return {"key": key, "size": len(content)}

    async def get_file(self, tenant_id: str, file_path: str) -> Optional[bytes]:
        """Get file only if it belongs to tenant."""
        await authorize_file_access(tenant_id, file_path, "get_object")
        key = self._build_key(tenant_id, file_path)

        try:
            response = self.s3.get_object(Bucket=self.bucket, Key=key)

            # Verify tenant ownership from metadata
            metadata_tenant = response.get('Metadata', {}).get('tenant-id')
            if metadata_tenant != tenant_id:
                raise SecurityException("Tenant mismatch in file metadata")

            return response['Body'].read()
        except self.s3.exceptions.NoSuchKey:
            return None

    async def generate_presigned_url(self, tenant_id: str, file_path: str,
                                     expiration: int = 3600,
                                     operation: str = 'get_object') -> str:
        """Authorize and sign one object operation for a verified tenant."""
        await authorize_file_access(tenant_id, file_path, operation)
        key = self._build_key(tenant_id, file_path)

        url = self.s3.generate_presigned_url(
            ClientMethod=operation,
            Params={
                'Bucket': self.bucket,
                'Key': key,
            },
            ExpiresIn=expiration
        )

        return url

    async def delete_tenant_data(self, tenant_id: str):
        """Delete current objects; versions and backups follow retention policy."""
        # The delimiter prevents a tenant such as "acme" from matching
        # another tenant's "acme-west" prefix.
        prefix = f"{self._get_tenant_prefix(tenant_id)}/"

        paginator = self.s3.get_paginator('list_objects_v2')
        for page in paginator.paginate(Bucket=self.bucket, Prefix=prefix):
            objects = page.get('Contents', [])
            if objects:
                self.s3.delete_objects(
                    Bucket=self.bucket,
                    Delete={'Objects': [{'Key': obj['Key']} for obj in objects]}
                )
```

</details>

#### 7. Tenant Onboarding & Offboarding Security

- Implement secure tenant provisioning with isolated resources.
- Generate unique encryption keys per tenant where required.
- Apply a documented retention and deletion policy across active stores, caches, object versions, replicas, exports, and backups. Restrict any legally required retained records.
- Maintain audit trail of provisioning/deprovisioning.
- Provide tenant data export when contract, regulation, or product policy requires it.

##### Tenant Backup Restore

A shared backup can contain data from several tenants. For a single-tenant recovery from a shared database, restore into a separate resource and selectively recover the target tenant's data, as described in [Azure's multitenant storage guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/storage-data).

- Authorize the operator for the target tenant and record the source backup, target, reason, and outcome.
- Check tenant ownership before copying records or objects into the live tenant scope. Do not give a tenant operator access to a shared backup.
- Reapply current access and retention rules; a backup can contain old memberships or data that should no longer be accessible.
- Test a backup with two tenants: recover one tenant, verify the other tenant's records and objects are absent, and reject a restore request by an unauthorized actor.

<details>
<summary>Illustrative Tenant Lifecycle Management</summary>

```python
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
import hashlib
import secrets

class TenantStatus(Enum):
    PROVISIONING = "provisioning"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    OFFBOARDING = "offboarding"
    DELETED = "deleted"

@dataclass
class TenantProvisioningResult:
    tenant_id: str
    status: TenantStatus
    api_key: str
    database_schema: str
    storage_prefix: str

class TenantLifecycleManager:
    """Manages secure tenant onboarding and offboarding."""

    def __init__(self, db, cache, storage, audit_log):
        self.db = db
        self.cache = cache
        self.storage = storage
        self.audit = audit_log

    async def provision_tenant(self, tenant_name: str, admin_email: str,
                               tier: TenantTier) -> TenantProvisioningResult:
        """Securely provision a new tenant."""
        tenant_id = secrets.token_urlsafe(16)

        await self.audit.log("tenant_provisioning_started", {
            "tenant_id": tenant_id,
            "tenant_name": tenant_name,
            "tier": tier.value
        })

        try:
            # 1. Create tenant record
            tenant = await self.db.create_tenant(
                id=tenant_id,
                name=tenant_name,
                status=TenantStatus.PROVISIONING,
                tier=tier
            )

            # 2. Create isolated database schema (if using schema isolation)
            schema_name = f"tenant_{tenant_id.replace('-', '_')}"
            await self.db.execute(f"CREATE SCHEMA {schema_name}")
            await self._apply_schema_migrations(schema_name)

            # 3. Generate a high-entropy random API credential.
            # SHA-256 is used for this random key, not for a user password.
            api_key = secrets.token_urlsafe(32)
            api_key_hash = hashlib.sha256(api_key.encode()).hexdigest()
            await self.db.store_api_key(tenant_id, api_key_hash)

            # 4. Create storage prefix
            storage_prefix = self.storage._get_tenant_prefix(tenant_id)

            # 5. Initialize tenant-specific encryption key (if required)
            if tier in [TenantTier.BUSINESS, TenantTier.ENTERPRISE]:
                await self._provision_tenant_kms_key(tenant_id)

            # 6. Activate tenant
            await self.db.update_tenant_status(tenant_id, TenantStatus.ACTIVE)

            await self.audit.log("tenant_provisioning_completed", {
                "tenant_id": tenant_id,
                "schema": schema_name
            })

            return TenantProvisioningResult(
                tenant_id=tenant_id,
                status=TenantStatus.ACTIVE,
                api_key=api_key,  # Return only once, never stored in plain text
                database_schema=schema_name,
                storage_prefix=storage_prefix
            )

        except Exception as e:
            await self.audit.log("tenant_provisioning_failed", {
                "tenant_id": tenant_id,
                "error": str(e)
            })
            await self._cleanup_failed_provisioning(tenant_id)
            raise

    async def offboard_tenant(self, tenant_id: str, retain_days: int,
                              export_required: bool = False) -> dict:
        """Securely offboard a tenant with data retention."""
        await self.audit.log("tenant_offboarding_started", {"tenant_id": tenant_id})

        # 1. Mark tenant as offboarding (prevents new operations)
        await self.db.update_tenant_status(tenant_id, TenantStatus.OFFBOARDING)

        # 2. Revoke all active sessions and API keys
        await self._revoke_all_access(tenant_id)

        # 3. Export data only when the applicable policy requires it
        export_location = None
        if export_required:
            export_location = await self._export_tenant_data(tenant_id)

        # 4. Schedule data deletion after retention period
        deletion_date = datetime.utcnow() + timedelta(days=retain_days)
        await self.db.schedule_tenant_deletion(tenant_id, deletion_date)

        await self.audit.log("tenant_offboarding_completed", {
            "tenant_id": tenant_id,
            "export_location": export_location,
            "scheduled_deletion": deletion_date.isoformat()
        })

        return {
            "status": "offboarding_complete",
            "data_export": export_location,
            "scheduled_active_store_deletion": deletion_date.isoformat()
        }

    async def execute_tenant_deletion(self, tenant_id: str):
        """Apply the active-store deletion stage of the retention policy."""
        await self.audit.log("tenant_deletion_started", {"tenant_id": tenant_id})

        # 1. Delete database schema/data
        schema_name = f"tenant_{tenant_id.replace('-', '_')}"
        await self.db.execute(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE")

        # For shared table model, delete rows
        await self.db.execute(
            "DELETE FROM shared_table WHERE tenant_id = :tid",
            {"tid": tenant_id}
        )

        # 2. Delete cached data
        await self.cache.invalidate_tenant(tenant_id)

        # 3. Delete stored files
        await self.storage.delete_tenant_data(tenant_id)

        # 4. Delete encryption keys
        await self._delete_tenant_kms_key(tenant_id)

        # 5. Mark as deleted (keep minimal audit record)
        await self.db.update_tenant_status(tenant_id, TenantStatus.DELETED)

        # Verify replicas, exports, object versions, backups, and legal holds
        # through their own retention-policy controls.

        await self.audit.log("tenant_deletion_completed", {"tenant_id": tenant_id})
```

</details>

The SHA-256 example applies only to the high-entropy random credential created by [`secrets.token_urlsafe(32)`](https://docs.python.org/3/library/secrets.html#secrets.token_urlsafe). A fast digest does not make a low-entropy or user-chosen secret safe against offline guessing. Store passwords according to the [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), using a suitable password-hashing function rather than this API-key pattern.

#### 8. Logging, Monitoring & Audit

- Include server-verified tenant context in tenant-scoped security and audit events; global infrastructure events may have no tenant.
- A centralized audit store is acceptable when read access enforces tenant scope and cross-tenant access requires an explicit platform permission.
- Monitor denied or unexpected cross-tenant access attempts without treating explicitly authorized platform operations as violations.
- Alert on tenant-isolation control failures and suspicious denial patterns.
- Apply the documented access and retention policy for each audit-data class.

<details>
<summary>Tenant-Aware Logging & Monitoring</summary>

```python
import structlog
from typing import Any, Dict
from datetime import datetime
import secrets

class TenantAwareLogger:
    """Logger that includes verified tenant context when one is active."""

    def __init__(self):
        self.logger = structlog.get_logger()

    def _enrich_with_tenant(self, event_data: dict) -> dict:
        """Add tenant context to log entry."""
        ctx = current_tenant.get()
        if ctx:
            event_data["tenant_id"] = ctx.tenant_id
            event_data["user_id"] = ctx.user_id
        return event_data

    def info(self, message: str, **kwargs):
        self.logger.info(message, **self._enrich_with_tenant(kwargs))

    def warning(self, message: str, **kwargs):
        self.logger.warning(message, **self._enrich_with_tenant(kwargs))

    def error(self, message: str, **kwargs):
        self.logger.error(message, **self._enrich_with_tenant(kwargs))

    def security_event(self, event_type: str, severity: str, **kwargs):
        """Log security-relevant events."""
        self.logger.warning(
            "security_event",
            event_type=event_type,
            severity=severity,
            **self._enrich_with_tenant(kwargs)
        )

class TenantAuditLog:
    """Audit API with tenant-aware reads and append-only writes."""

    def __init__(self, db):
        self.db = db

    async def log(self, action: str, details: Dict[str, Any],
                  tenant_id: str = None):
        """Record audit entry."""
        ctx = current_tenant.get()
        if (
            ctx
            and tenant_id
            and tenant_id != ctx.tenant_id
            and not has_permission(ctx, "platform:audit:write")
        ):
            raise SecurityException("Cannot write another tenant's audit log")

        effective_tenant_id = tenant_id or (ctx.tenant_id if ctx else "system")

        entry = {
            "id": secrets.token_urlsafe(16),
            "tenant_id": effective_tenant_id,
            "user_id": ctx.user_id if ctx else None,
            "action": action,
            "details": details,
            "timestamp": datetime.utcnow(),
            "ip_address": get_client_ip(),
            "user_agent": get_user_agent()
        }

        # This API only appends. Database permissions, tamper-evident storage,
        # or WORM controls must enforce the required immutability properties.
        await self.db.execute("""
            INSERT INTO audit_log
            (id, tenant_id, user_id, action, details, timestamp, ip_address, user_agent)
            VALUES (:id, :tenant_id, :user_id, :action, :details, :timestamp, :ip_address, :user_agent)
        """, entry)

    async def get_tenant_audit_trail(self, tenant_id: str,
                                     start_date: datetime,
                                     end_date: datetime) -> list:
        """Retrieve audit trail for a specific tenant."""
        ctx = current_tenant.get()

        # Tenant audit readers and platform auditors are distinct permissions;
        # a tenant-local admin is not implicitly a platform auditor.
        can_read_tenant = (
            ctx
            and ctx.tenant_id == tenant_id
            and has_permission(ctx, "tenant:audit:read")
        )
        can_read_platform = ctx and has_permission(ctx, "platform:audit:read")
        if not (can_read_tenant or can_read_platform):
            raise SecurityException("Audit access denied")

        return await self.db.fetch_all("""
            SELECT * FROM audit_log
            WHERE tenant_id = :tenant_id
            AND timestamp BETWEEN :start AND :end
            ORDER BY timestamp DESC
        """, {"tenant_id": tenant_id, "start": start_date, "end": end_date})

class CrossTenantAccessMonitor:
    """Monitor and alert on potential cross-tenant access attempts."""

    def __init__(self, alert_service):
        self.alerts = alert_service
        self.violation_counts = {}

    async def check_access(self, requested_tenant: str,
                          resource_type: str, resource_id: str):
        """Check for cross-tenant access attempts."""
        ctx = current_tenant.get()

        if not ctx or not await authorize_tenant_access(
            ctx, requested_tenant, resource_type, resource_id
        ):
            # Log a denied attempt, not an explicitly authorized platform action
            logger.security_event(
                "cross_tenant_access_attempt",
                severity="HIGH",
                requested_tenant=requested_tenant,
                resource_type=resource_type,
                resource_id=resource_id
            )

            # Track violations per user
            principal_id = ctx.user_id if ctx else "anonymous"
            source_tenant = ctx.tenant_id if ctx else "none"
            key = f"{principal_id}:{source_tenant}"
            self.violation_counts[key] = self.violation_counts.get(key, 0) + 1

            # Alert on repeated attempts
            if self.violation_counts[key] >= 3:
                await self.alerts.send(
                    severity="CRITICAL",
                    message="Repeated cross-tenant access attempts detected",
                    details={
                        "user_id": principal_id,
                        "tenant_id": source_tenant,
                        "attempts": self.violation_counts[key]
                    }
                )

            raise SecurityException("Access denied")
```

</details>

### Do's and Don'ts

**Do:**

- Derive tenant context from a server-verified identity and current membership or service authorization.
- Use an enforceable isolation boundary appropriate to the data and threat model; database controls such as RLS or schema and credential separation can provide defense in depth.
- Include tenant scope in queries, cache keys, and storage boundaries when the resource or result varies by tenant.
- Include tenant identity in rate limits and quotas when tenants share capacity or have tenant-level entitlements; retain any needed global, endpoint, user, or IP limits.
- Bound tenant consumption of other shared bottlenecks, such as queued work, concurrency, database connections, and compute, when those resources can create cross-tenant availability impact.
- Carry verified tenant context through tenant-scoped asynchronous work and re-establish authorization at the consumer.
- Log verified tenant context for tenant-scoped security and audit events.
- Enforce tenant ownership at a boundary traversed by every tenant-owned access path.
- Use separate encryption keys when the risk or compliance model requires cryptographic isolation.
- Apply and verify the documented retention and deletion policy during offboarding.
- Authorize and test tenant-scoped restores, especially when the source backup contains other tenants.
- Monitor and alert on denied or unexpected cross-tenant access attempts.
- For shared-table PostgreSQL RLS that uses a tenant setting, prefer transaction-local context and re-establish it for each transaction.
- For shared-table PostgreSQL RLS, inventory classified tenant-owned tables and test cross-tenant denial for each one.
- Verify that the ordinary tenant-request database role cannot bypass row security when RLS is the isolation boundary.

**Don't:**

- Treat tenant IDs from client headers or request parameters as authorization proof; they are selectors that require server-side verification.
- Use a shared cache key for data or authorization that varies by tenant.
- Rely on identifier complexity to prevent cross-tenant access.
- Allow an ordinary tenant-owned request path to perform an unscoped query; make any cross-tenant administrative path explicit, separately authorized, and auditable.
- Store tenant-owned data without an enforceable tenant association or isolation boundary; a literal `tenant_id` column is not required by every architecture.
- Give a tenant-scoped credential access to other tenants. Explicitly cross-tenant service credentials require their own least-privileged scope and controls.
- Skip authorization merely because a service is internal.
- Treat a tenant identifier in a queued message as authorization proof without authenticating the producer path and authorizing the consumer operation.
- Allow one tenant unbounded consumption of a shared queue, worker pool, connection pool, or other resource that can degrade other tenants.
- Retain tenant data beyond the documented retention policy without a contractual or legal basis and appropriate access restrictions.
- Restore a shared snapshot over live data to recover only one tenant.
- Log sensitive tenant data in plain text.
- Serve ordinary tenant-scoped PostgreSQL RLS request paths with a superuser or `BYPASSRLS` role.
- Use a session-scoped database tenant setting across pooled requests without reliable reset-on-checkout or equivalent isolation and connection-reuse tests; prefer transaction-local settings.

## Business Logic Security

> **Source:** [Business Logic Security](https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Business logic vulnerabilities are flaws in the way an application implements its intended workflow. They aren't missing input sanitization or unescaped output. The code does what the developer told it to do, but what the developer told it to do doesn't match what the business actually needs. A user skips a required step, submits a request out of order, pays a negative price, stacks coupons in a way nobody planned for, or wins a race against the server's own bookkeeping.

Generic scanners often miss business logic flaws because they lack the application's business rules. Automated analysis can still detect some patterns, including [workflow enforcement weaknesses](https://cwe.mitre.org/data/definitions/841.html). Combine tools with review and testing that checks the intended business process.

This cheat sheet covers practical patterns for preventing business logic abuse. It's aimed at developers building features, not at penetration testers looking for them. For testing guidance, see the [OWASP Web Security Testing Guide, Business Logic Testing section](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/10-Business_Logic_Testing/).

Key takeaways:

- Always re-derive security-relevant values (prices, permissions, ownership) on the server. Client state is input, not truth.
- Enforce workflows as explicit state machines. Don't rely on the UI to gate the order of steps.
- Treat concurrency as a real threat. If two requests can race, assume they will.
- Rate-limit and monitor at the feature level, not just at authentication. Abuse-friendly features (referrals, coupons, password reset) need their own controls.
- Threat model from the business process, not just the technical architecture. Ask what happens if a user acts dishonestly, not just what happens if an attacker sends a malicious payload.

### Why Business Logic Flaws Are Different

Most well-known web vulnerabilities (SQL injection, XSS, CSRF, path traversal) have a clear technical signature. A security scanner can fuzz parameters, look for reflected payloads, and produce a reasonable report. Business logic flaws often require additional knowledge of the intended workflow.

Consider an e-commerce checkout. The server accepts a request containing a product ID, quantity, and coupon code. Every input is validated: the product ID exists, the quantity is a positive integer, the coupon code matches a known pattern. No technical rule is broken. But the application recalculates the total from the client-submitted price instead of looking it up server-side, so a user can pay one cent for a television. That's a business logic bug, and no amount of input validation helps, because the input is syntactically perfect.

The patterns repeat across industries:

- A user-facing application assumes the client will respect the order of steps in a multi-step workflow, and exposes the endpoints for each step without checking whether the previous steps were completed.
- A system takes user-controlled data (price, account balance, user role) from the request body and trusts it, because the UI never shows the user how to change it.
- An endpoint performs two operations (check balance, then debit) without a lock, so two concurrent requests both pass the balance check and both debit.
- A feature intended to reward legitimate use (referrals, points, promo credits) has no controls against one user creating many accounts.

Review these patterns against the application's business rules; a clean scanner report does not show that those rules are enforced.

### Always Re-derive Security-relevant Values Server-side

The single most effective defensive habit is this: if a value in the request influences price, access, ownership, or state, assume the client made it up and recompute it from trusted data.

#### Prices and Totals

Never accept a price, subtotal, tax, or total from the client. Accept product identifiers and quantities only, and compute the rest on the server from your own database. The same applies to discounts: accept a coupon code, validate the code server-side, and apply the discount server-side. Don't accept a "discount amount" field from the request.

| Client sends | Server should | Server should not |
|---|---|---|
| Product ID and quantity | Look up the price, compute line total | Accept a price field and trust it |
| Coupon code | Validate and apply the discount itself | Accept a "discounted total" field |
| Shipping selection | Compute cost from its own rate table | Accept a shipping cost field |
| Tax-exempt flag | Determine from account state | Accept a client-supplied exemption |

This pattern extends beyond commerce. A social app shouldn't accept a "post visibility" value from the client if the value is supposed to be derived from the user's privacy settings. A banking app shouldn't accept a "source account balance" that the client calculated.

#### Permissions and Ownership

Re-check ownership on every request that acts on a resource. Don't rely on the URL, the referrer, or a flag in the request body. The backend should ask: "Is the authenticated user actually allowed to perform this action on this object, right now?"

A common mistake is checking ownership once when a resource is loaded and then trusting subsequent requests that reference it. Each request is independent. Each request must be authorized on its own.

#### Identity and Role

Never accept a user ID, tenant ID, or role from the request body unless the request is explicitly an administrative action by a privileged caller, and even then the value has to be validated against what the caller is allowed to manage. The identity of the acting user always comes from the server-side session or token, never from a field the user can edit.

### Enforce Workflows as Explicit State Machines

Multi-step processes (signup flows, checkouts, approvals, KYC verification, password reset) are prime targets because developers often implement them as a sequence of pages that the UI walks the user through. If the UI is the only thing enforcing the sequence, an attacker who sends requests directly to each endpoint can skip steps, repeat steps, or reach terminal steps without the prerequisites.

#### Model State on the Server

Every multi-step workflow should have an explicit state representation stored on the server, keyed to the user or session. Each transition should be validated against the current state.

A minimal pattern:

1. When the workflow starts, create a record with the initial state (e.g., `awaiting_email_verification`).
2. Each step endpoint checks the current state, performs the action, and updates the state to the next valid value.
3. If a request arrives for a step that doesn't match the current state, reject it.
4. Terminal actions (submit order, approve, transfer funds) only run if the state is exactly what's required for that action.

#### Don't Use Hidden Form Fields as State

A pattern that shows up repeatedly in real applications is storing the "current step" as a hidden field in the form, or in a cookie the client can read. This is not enforcement. The client can set it to whatever value it wants. State lives on the server, in storage the client can't write to.

#### Reject Replays of Completed Steps

Once a step has been completed, later attempts to re-run it should fail. This matters especially for one-time operations like applying a signup bonus, redeeming a coupon, claiming a voucher, or accepting a referral reward. The cleanest pattern is to mark each such operation complete in persistent storage and treat attempts to re-run it as errors.

#### Expire Partial States

Workflows that pause for user input (email verification, bank transfer confirmation, multi-step KYC) should have a deadline. If the user hasn't progressed in some bounded time, invalidate the partial state and require them to start over. Long-lived half-completed workflows accumulate and are a frequent source of exploitable inconsistencies.

### Prevent Race Conditions on Sensitive Operations

Any operation that reads a value, makes a decision, and then writes a value is a potential race condition. If two requests can run at the same time, they can both read the old value, both decide the same thing, and both write. This is how loyalty points get drained, balances go negative, single-use coupons get redeemed many times, and one-per-account bonuses become many-per-account.

#### Identify the Critical Sections

Ask which operations have the shape "check a condition, then act on it". Typical examples:

- Check balance, then debit.
- Check that a coupon hasn't been used, then record its use.
- Check that a user has fewer than N items, then add one.
- Check that a slot is available, then book it.
- Check that a referral code hasn't been applied to this account, then apply it.
- Check whether a registration request is unique, then insert the new user record.

Each of these is a race condition waiting to happen unless the check and the act are inside a single atomic operation.

#### Use Database Transactions and Locks

The most broadly available fix is a database transaction with the right isolation level. At the default isolation level of most databases, the check and the update run separately and another transaction can slip between them. For operations that must be atomic, use one of:

- A `SERIALIZABLE` transaction isolation level. The database will detect conflicts and roll back one of the competing transactions.
- An explicit row lock (`SELECT ... FOR UPDATE` in PostgreSQL, MySQL InnoDB, and similar). The second caller blocks until the first one commits.
- A conditional update (`UPDATE ... WHERE balance >= amount`) that succeeds only if the predicate still holds at write time. Check the number of affected rows. If zero, the check failed and the caller should see an error.

#### Use Idempotency Keys for External Actions

For external actions such as charging a card, use the provider's idempotency mechanism and reuse the same key when retrying the same operation. Follow its key-generation, parameter-matching, and retention rules; for example, [Stripe rejects changed parameters and can treat a key as new after its stored record expires](https://docs.stripe.com/api/idempotent_requests).

For your own API, scope stored keys to the authenticated caller and operation, bind them to the original request parameters, and reject reuse with different parameters. Authorize the request before returning a cached result; possession of a key is not authorization. Coordinate concurrent requests atomically so only one starts the action, and record its state and result durably. [AWS describes caller-scoped identifiers, atomic processing, and parameter-mismatch checks](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/).

Define the retry and retention window, including recovery when the [external result is unknown](https://docs.stripe.com/error-low-level.md). A local database transaction alone cannot make an external side effect atomic with saving its result. After the retry window expires, reconcile the external outcome before resubmitting.

#### Don't Assume "Fast Enough"

A common rationalization is "the window between the check and the update is microseconds, no attacker can exploit it". Concurrent request tools can trivially send dozens of requests to arrive within a millisecond of each other. Modern bug bounty tooling sends them as a single multiplexed HTTP/2 request so they land at the server effectively simultaneously. If the window exists at all, assume it's exploitable.

#### Pattern Reference

| Operation shape | Safe pattern |
|---|---|
| Read-modify-write on a single row | `SELECT ... FOR UPDATE` then `UPDATE`, inside a transaction |
| Conditional decrement on a counter | `UPDATE ... SET value = value - 1 WHERE value > 0`, check affected rows |
| One-per-user bonus | Unique constraint on (user_id, bonus_type) and let the database reject duplicates |
| External non-idempotent call | Provider-supported idempotency, with durable state for retries and recovery |
| Cross-row consistency | Serializable transaction with explicit retry logic |

### Protect Abuse-friendly Features

Some features are inherently abuse magnets because they dispense value in response to user actions. Referral bonuses, promo codes, signup credits, free trials, email reminders, password reset flows, account recovery paths, and anything that sends messages or makes outbound requests. These need their own controls beyond the authentication controls on the rest of the app.

#### Abuse Patterns to Design Against

- **Multi-accounting.** One human creates many accounts to claim one-per-account rewards multiple times. Ask whether your signup flow makes this trivially cheap and consider what signals you have to detect it.
- **Self-referral.** A user refers themselves using a second account. Referral flows should check that referrer and referee are distinguishable humans, not just distinguishable accounts.
- **Coupon stacking.** Multiple promos that were each meant to be used alone get combined to push a price below cost. If your coupon engine allows stacking by default, it's probably a bug.
- **Free trial resets.** A user cancels and re-signs up repeatedly to stay on the free tier forever. Track trial eligibility by something more stable than an email address.
- **Resource exhaustion.** Features that send email, make outbound HTTP calls, trigger webhooks, or run expensive computations on demand are DoS vectors and spam vectors unless rate-limited.
- **Enumeration through behavior.** A password reset endpoint that returns different messages for valid and invalid emails leaks account existence.

#### Controls to Apply

- **Per-feature rate limits.** A global rate limit at the edge is not enough. The signup-bonus endpoint, the referral endpoint, the promo-redemption endpoint each need their own limits.
- **Identity signals beyond email.** Device fingerprints, payment-method fingerprints, phone number verification, and KYC verification all carry more signal than email addresses, which are cheap to create in bulk.
- **Audit trails on value-dispensing operations.** Every issued credit, applied promo, or granted bonus should be logged with the triggering user, target user, IP, and timestamp. When abuse is suspected, the log is how you untangle it.
- **Maximums at every layer.** A per-action cap (e.g., one bonus per account) plus a per-account cap (e.g., total lifetime promo value) plus a per-source cap (e.g., per payment method or per device) gives defense in depth.
- **Asymmetric consequences.** Actions that give value should be harder than actions that don't. Making someone wait 30 seconds, or complete a CAPTCHA, to claim a reward is fine. The legitimate user clicks once and moves on; the automated abuser suffers a per-request cost.

### Threat Model from the Business Process

See the [Abuse Case Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Abuse_Case_Cheat_Sheet.html) for identifying misuse scenarios.

Most threat modeling is done from a technical angle: data flow diagrams, trust boundaries, STRIDE categories. That's useful, but it misses the bugs where the code is technically correct and the process is the problem. Business logic threat modeling asks different questions.

#### Questions to Ask Early

- What does a legitimate user do in this feature, step by step?
- What does the system do at each step, and what assumption is it making about the user's intent?
- Which of those assumptions would benefit the user if they were false? (That's where the bugs live.)
- Can the user do things out of order? Skip a step? Repeat a step?
- Can two users act on the same object at the same time?
- Can one user act from two directions at once (e.g., two tabs, two devices)?
- What does this feature produce that has value? (Credits, access, trust, messages, outbound requests.)
- If an adversary tried to exploit this feature for gain, how would they go about it?
- What invariant must always hold (e.g., "a coupon can only be used once", "an account balance can never be negative")? What enforces it, and is that enforcement atomic?

#### The "Dishonest User" Exercise

Sit with the feature specification and imagine a user whose only goal is to extract maximum value while staying within the letter of the system's rules. What would they do? What combination of legitimate actions would produce an illegitimate outcome? This is different from thinking about a technical attacker. The dishonest user isn't sending malicious payloads. They're using the app exactly as designed, just in an order or volume the designer didn't anticipate.

#### Write Down the Invariants

For any feature that handles value, ownership, or state, write down the invariants in plain English:

- A user cannot approve their own request.
- A coupon code is valid for one redemption per user, and never more than N total.
- A transfer cannot complete if it would leave the source account below zero.
- A workflow reaches the "approved" state only after both reviewer A and reviewer B have approved.

Then for each invariant, identify exactly what code enforces it. If the answer is "the UI" or "the user won't try that", the invariant isn't actually enforced.

### Authorization at the Business-logic Layer

Technical authorization (is this user authenticated, do they have this role) is necessary but not sufficient. Many business logic bugs are authorization bugs in disguise: the user has the general permission to use a feature, but the specific action they're taking violates a rule the system didn't think to check.

#### Contextual Authorization

Check not just "can this user do X" but "can this user do X on this object, in this state, right now".

Examples:

- A manager can approve expense reports, but not their own.
- A reviewer can approve a pull request, but not if they authored it.
- A user can cancel an order, but not after it has shipped.
- A user can change their email, but not to an address already in use, and not without verifying the new address.

These checks are part of the business logic, not the authentication layer. They typically require knowledge the auth middleware doesn't have. Keep them close to the operation they guard.

#### Avoid "Implicit" Permissions

If two features logically grant the same permission, make sure both are guarded. An internal admin endpoint that's checked carefully is no help if the same operation is reachable through a less-guarded public endpoint.

Map every sensitive operation to every entry point that can trigger it, and verify each entry point enforces the rules. When adding a new entry point (a new API version, an internal tool, a webhook handler), explicitly audit which business rules it needs to apply.

#### Reference Related Guidance

For general access control guidance, see the [Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html) and the [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). For the higher-sensitivity case of financial or state-changing transactions, see the [Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html).

### Validate Inputs for Business Meaning, Not Just Format

See the [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) for validation controls.

Input validation typically focuses on format: is this a well-formed integer, is this within length limits, does it match a whitelist of characters. That catches injection attacks but not business logic abuse. The input can be perfectly formatted and still semantically invalid.

#### Validate Ranges

A quantity can be a positive integer and still be wrong. A discount can be numeric and still absurd. Validate against the meaningful range for the business:

- Quantity must be at least 1 and no more than the stock available.
- Date must be in the future, not more than a year out, not on a blocked day.
- Amount must be positive, not more than the account allows, not above a regulatory limit.
- Text length must match what the downstream system can accept, which may be shorter than a generic limit.

#### Validate Combinations

Fields that are individually valid can be collectively invalid. A booking for a valid room with a valid check-in date and a valid check-out date might still be invalid if the check-out precedes the check-in. A transfer between two valid accounts might still be invalid if the accounts belong to different customers and the user lacks permission to act on both.

Write the validation rules that describe legal combinations and enforce them server-side. Unit-test the cases where each individual field is valid but the combination is not.

#### Don't Trust Derived or Hidden Fields

Fields that are "not editable in the UI" are fully editable at the HTTP layer. Every field in a request is an input, including the ones in hidden form controls, disabled form controls, fields set by JavaScript, and fields you set in a previous response and expect to receive unchanged. If a field matters, validate it as if it came from an attacker, because it did.

### Observability and Anomaly Detection

Even a well-designed feature will eventually face a creative abuse attempt. Logging and monitoring are what let you notice it and respond.

#### What to Log

For any operation that dispenses value, changes permissions, or moves money:

- The authenticated user
- The target resource
- The action taken
- The outcome
- Enough request context to reconstruct what happened (IP, user agent, correlation ID)
- Enough business context to audit (the price computed, the coupon applied, the new state)

These logs should be tamper-evident and separate from general application logs.

#### What to Alert On

Rates of the following often precede or accompany abuse:

- Signups from the same IP, device fingerprint, or payment instrument
- Repeated failed password-reset requests from the same source
- Unusually high rates of promo redemptions, referral completions, or credit issuances
- Bursts of requests to a single endpoint from a single user
- Workflows that complete in substantially less time than a human would need

You don't need sophisticated machine learning for this. Simple thresholds on per-user, per-IP, and per-device rates catch most automated abuse.

#### Close the Loop

When monitoring surfaces a potential abuse, two things should happen: the specific incident gets investigated and resolved, and the control that should have prevented it gets added or tightened. A detection that doesn't lead to a prevention is a detection you'll be making again next month.

### Testing Business Logic

Automated tests are how business rules stay enforced as the code evolves. Focus test effort on the rules, not the happy path.

#### Test the Rules, Not the Implementation

For each invariant you identified during threat modeling, write a test that would fail if the invariant were violated. A test that says "a user cannot approve their own request" should attempt exactly that and assert the request is rejected. These tests document the rules as much as they verify them.

#### Test Concurrency

If two requests can race, write a test that races them. Most test frameworks have ways to fire concurrent requests and assert the end state is consistent (e.g., balance is never negative, coupon is redeemed exactly once, bonus is granted exactly once across all winners).

#### Test Ordering

For multi-step workflows, test attempts to skip, repeat, and reorder steps. The expected outcome for each is a rejection, not progress.

#### Test with an Adversarial Mindset

Unit tests written by the developer who wrote the feature tend to cover cases the developer was already thinking about. A useful complement is adversarial testing: take the feature specification and write tests for the ways a motivated user would try to misuse it. Often the bug reproduces on the first attempt, because the feature wasn't designed with that misuse in mind.

### Common Examples of Business Logic Flaws

Concrete examples help developers recognize the pattern in their own code. The list below is not exhaustive.

#### Price and Quantity

- Negative quantity in a cart to get a refund against another item's cost.
- Client-supplied price that the server trusts.
- Zero-price items that are actually valuable because a "free" flag was intended for a different product.
- Currency switching mid-transaction where the amount is kept but the currency changes (e.g., from USD to a much weaker unit).
- Coupon codes applied multiple times, or applied to products they were not meant for.

#### Workflow

- Skipping identity verification by calling the post-verification endpoint directly.
- Advancing a job application, approval, or KYC workflow past a stage that was supposed to be gated on a reviewer.
- Triggering "checkout complete" without having actually paid.
- Claiming a reward for a task that was never completed.

#### Concurrency

- Withdrawing the same balance from two concurrent sessions.
- Redeeming a single-use voucher from two parallel requests.
- Transferring the same item to two recipients at once.
- Concurrently updating a counter so that one update is lost.

#### Authorization-in-disguise

- Approving your own request because the "not the author" check was forgotten.
- Canceling an order after it was supposed to be locked in.
- Modifying a shared resource because the "only the owner can modify" rule was never enforced on a specific endpoint.

#### Value-dispensing Abuse

- Claiming a signup bonus multiple times by re-signing up.
- Earning referral rewards by referring yourself.
- Stacking promos that were meant to be mutually exclusive.
- Abusing "refer a friend" mechanics to send spam that looks like it comes from your platform.

### Summary Checklist

Before shipping any feature that handles money, permissions, or state, walkthrough this list:

- Are all security-relevant values (prices, permissions, identity, ownership) derived server-side, not accepted from the client?
- Is every multi-step workflow represented as an explicit state machine in server-side storage, with each transition validated?
- Is every check-then-act operation atomic (transaction, row lock, or conditional update)?
- Do retries of external actions reuse the same idempotency key within the provider's documented retry window?
- Does every value-dispensing feature have a per-action cap, a per-account cap, and a rate limit?
- Are all invariants written down and tested?
- Is every entry point for a sensitive operation subject to the same business rules?
- Does logging capture enough context to reconstruct abuse after the fact, and do alerts fire on anomalous rates?
- Have you considered the dishonest-user perspective, not just the attacker-with-exploit perspective?

## Authorization Regression Testing

> **Source:** [Authorization Regression Testing](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Regression_Testing_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Authorization implementation is rarely static. As applications evolve, new API endpoints are added, data layers are refactored, and microservices are decoupled. While initial security testing might validate access controls at launch, the "Day 2" problem emerges quickly: **How do engineering teams ensure that new features or structural changes do not break existing authorization logic?**

[Broken Access Control (BAC)](https://owasp.org/Top10/A01_2021-Broken_Access_Control/) was ranked the number-one risk in the OWASP Top Ten 2021, and [Insecure Direct Object Reference (IDOR)](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References) is one of its most frequently exploited sub-categories. This cheat sheet provides actionable, architectural guidance on implementing automated authorization regression testing within the Software Development Life Cycle (SDLC). By shifting from manual, point-in-time penetration testing to continuous, developer-centric regression suites, engineering teams can catch BAC, IDOR, and tenant isolation failures before they reach production.

For baseline controls, see the [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

Key topics covered in this cheat sheet include:

- Designing an automated authorization test matrix.
- Common regression testing patterns for horizontal, vertical, and tenant isolation tests.
- Validating authorization schemas using API contracts.
- Integrating authorization tests into CI/CD pipelines.

### Authorization Test Matrix Design

> **Relationship to the Authorization Testing Automation Cheat Sheet**
>
> The [Authorization Testing Automation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html) provides a foundational, XML-driven approach to building and executing an authorization matrix against REST services — including a full Java/JUnit integration test harness. **This cheat sheet extends that foundation** by focusing on the *continuous regression* dimension: how to design matrices in formats (YAML/JSON) suited to modern test runners, which specific failure patterns to prioritize in a regression suite (IDOR, vertical escalation, tenant boundary), how to couple tests to OpenAPI contracts, and how to gate pull requests automatically in CI/CD. If you are new to authorization test matrices, start with the [Authorization Testing Automation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html) first, then return here for SDLC-integration guidance.

The foundation of continuous authorization testing is a structured mapping of rules that can be consumed by automated frameworks. Rather than writing scattered, one-off test cases, design a central matrix.

#### Define the Access Policy Model

Before writing tests, explicitly define the application's access model using the **Actor-Resource-Action** pattern described in [OWASP WSTG - Testing for Authorization](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/05-Authorization_Testing/):

- **Actor (Who):** The logical role or specific user attempting the operation (e.g., `Tenant_Admin`, `Standard_User`, `Anonymous_User`).
- **Resource (What):** The object or data being accessed (e.g., `Invoice_123`, `/api/v2/users`, `System_Settings`).
- **Action (How):** The operation being performed (e.g., `READ`, `CREATE`, `DELETE`, `EXECUTE`).

#### Machine-Readable Rules

Store this matrix in a machine-readable format (e.g., JSON, YAML, or structured test fixtures) rather than a spreadsheet. This allows testing frameworks to dynamically generate test cases, reducing manual maintenance as the authorization policy evolves.

```yaml
# Example Test Fixture Definition
policies:
  - resource: "/api/invoices/{id}"
    method: "GET"
    owner_role: "tenant_user"
    allowed_roles: ["tenant_admin", "system_auditor"]
    denied_roles: ["anonymous", "different_tenant_user"]
    expected_denial_code: 403
```

### Regression Testing Patterns

Automated tests should specifically target the ways authorization usually degrades over time. Implement the following test patterns in your regression suite.

#### Horizontal Escalation (IDOR) Validation

[Horizontal privilege escalation](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References) occurs when a user accesses a resource belonging to another user with the same privilege level. The [OWASP IDOR Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) describes the root cause: missing server-side ownership checks on object identifiers.

- **Pattern:** The "Multi-User Replay."
- **Implementation:** Authenticate as User A and create Resource X. Capture the resource identifier. Authenticate as User B (same role, different account) and attempt to read, update, and delete Resource X.
- **Assertion:** The system must return a [`403 Forbidden`](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.4) or `404 Not Found` (to avoid information leakage about resource existence), never a `200 OK`.

#### Vertical Escalation Validation

Vertical escalation occurs when a lower-privileged user accesses functions reserved for higher-privileged roles. This maps directly to [CWE-269: Improper Privilege Management](https://cwe.mitre.org/data/definitions/269.html).

- **Pattern:** The "Role Demotion Check."
- **Implementation:** Build a suite of tests that target administrative endpoints (e.g., `/api/admin/users/delete`). Iterate through all non-administrative roles (including unauthenticated users) and attempt to execute the endpoints.
- **Assertion:** Ensure the endpoints explicitly reject the requests. Relying on UI hiding is insufficient; [the API layer must enforce the check](https://owasp.org/www-project-proactive-controls/v3/en/c7-enforce-access-controls) — client-side controls are trivially bypassed.

#### Tenant Isolation Breakage

In multi-tenant SaaS applications, logic changes (like caching or query modifications) can inadvertently leak data across tenant boundaries, a scenario covered by the [Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html).

- **Pattern:** The "Cross-Tenant Boundary Test."
- **Implementation:** Provision two distinct tenants (Tenant Alpha and Tenant Beta) in the test environment. Seed data into Tenant Alpha. Execute broad read queries (e.g., `GET /api/all-records`) as a user from Tenant Beta.
- **Assertion:** Assert that the response payload contains absolutely no records belonging to Tenant Alpha. Even a single leaked record identifier constitutes a critical failure.

### Contract-Driven Authorization Validation

When building APIs, the authorization schema should be explicitly defined in the API contract. The [OpenAPI Specification](https://spec.openapis.org/oas/v3.1.0#security-scheme-object) provides `securitySchemes` and `security` fields to formally declare authorization requirements at both the global and per-operation level.

- **Schema-Aware Testing:** Use the OpenAPI definition to identify declared authentication schemes and required scopes, then test them against the application's access policy. [Schemathesis's `ignored_auth` check](https://schemathesis.readthedocs.io/en/stable/reference/checks/#ignored_auth) probes missing and invalid credentials. Add explicit tests using otherwise-valid tokens that lack required scopes; rejecting missing credentials does not establish that scope enforcement works.
- **Middleware Enforcement:** Configure API gateways or web frameworks to automatically enforce the security definitions present in the OpenAPI contract. Regression tests should validate that this middleware has not been bypassed or disabled following a refactor.

### Automated Testing Framework Integration

Authorization tests must live alongside functional tests in the developer's standard toolkit, following the guidance in [OWASP SAMM: Security Testing](https://owaspsamm.org/model/verification/security-testing/).

- **Test Frameworks:** Use standard test runners (e.g., [`pytest`](https://docs.pytest.org/) for Python, [`Jest`](https://jestjs.io/) for JavaScript, [`JUnit`](https://junit.org/junit5/) for Java) to build authorization suites. This keeps the barrier to entry low and ensures the tests run in the same CI pipeline as functional tests.
- **Generated and Custom Tests:** Use schema-driven testing to supplement the authorization matrix. Create explicit expired-token and missing-scope fixtures with expected denial responses instead of assuming the OpenAPI contract generates these credentials. If using Dredd, its [hooks](https://dredd.org/en/latest/hooks/) let you modify requests and set custom expectations for these cases.
- **Session Switching:** Design the test suite to quickly and cheaply swap authentication context (e.g., swapping JWTs in the `Authorization` header as defined in [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750)) without requiring a full login flow for every test.

### CI/CD Gating and SDLC Integration

The value of an authorization regression suite is only realized if it prevents vulnerable code from merging. The [OWASP CI/CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html) describes broader pipeline hardening; the recommendations below focus specifically on authorization gates.

- **Blocking PR Builds:** The authorization test suite must be a required check in the CI/CD pipeline (e.g., [GitHub Actions](https://docs.github.com/en/actions), GitLab CI). If an authorization test fails, the Pull Request cannot be merged.
- **Dedicated Test Suites:** Tag or group authorization tests distinctly (e.g., `@pytest.mark.authz` or a dedicated `authz-tests` npm script). This allows developers to run them quickly and independently during local development.
- **Monitoring in Lower Environments:** Configure CI environments to flag unusual volumes of [`401 Unauthorized`](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.2) or [`403 Forbidden`](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.4) responses during integration testing, which may indicate that a developer's functional changes are colliding with existing security controls.

## Authorization Testing Automation

> **Source:** [Authorization Testing Automation](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

**When you are implementing protection measures for an application, one of the most important parts of the process is defining and implementing the application's authorizations.** Despite all of the checks and security audits conducted during the creation phase, most of the problems with authorizations occur because features are added/modified in updated releases without determining their effect on the application's authorizations (usually because of cost or time issue reasons).

To deal with this problem, we recommend that developers automate the evaluation of the authorizations and perform a test when a new release is created. This ensures that the team knows if changes to the application will conflict with an authorization's definition and/or implementation.

### Context

An authorization usually contains two elements (also named dimensions): The **Feature** and the **Logical Role** that accesses it. Sometimes a third dimension named **Data** is added in order to define access that includes a filtering at business data level.

Generally, the two dimensions of each authorization should be listed in a spreadsheet that is called an **authorization matrix**. When authorizations are tested, the logical roles are sometimes called a **Point Of View**.

### Objective

This cheat sheet is designed to help you generate your own approaches to automating authorization tests in an authorization matrix. Since developers will need to design their own approach to automating authorization tests, **this cheat sheet will show a possible approach to automating authorization tests for one possible implementation of an application that exposes REST Services.**

### Proposition

#### Preparing to automate the authorization matrix

Before we start to automate a test of the authorization matrix, we will need to do the following:

1. **Formalize the authorization matrix in a pivot format file, which will allow you to:**
    1. Easily process the matrix by a program.
    2. Allow a human to read and update when you need to follow up on the authorization combinations.
    3. Set up a hierarchy of the authorizations, which will allow you to easily create different combinations.
    4. Create the maximum possible of independence from the technology and design used to implement the applications.

2. **Create a set of integration tests that fully use the authorization matrix pivot file as an input source, which will allow you to evaluate the different combinations with the following advantages:**
    1. The minimum possible of maintenance when the authorization matrix pivot file is updated.
    2. A clear indication, in case of failed test, of the source authorization combination that does not respect the authorization matrix.

#### Create the authorization matrix pivot file

**In this example, we use an XML format to formalize the authorization matrix.**

This XML structure has three main sections (or nodes):

- Node **roles**: Describes the possible logical roles used in the system, provides a list of the roles, and explains the different roles (authorization level).
- Node **services**: Provides a list of the available services exposed by the system, provides a description of those services, and defines the associated logical role(s) that can call them.
- Node **services-testing**: Provides a test payload for each service if the service uses input data other than the one coming from URL or path.

**This sample demonstrates how an authorization could be defined with XML**:

> Placeholders (values between {}) are used to mark location where test value must be placed by the integration tests if needed

``` xml
  <?xml version="1.0" encoding="UTF-8"?>
  <!--
      This file materializes the authorization matrix for the different
      services exposed by the system:

      The tests will use this as a input source for the different test cases by:
      1) Defining legitimate access and the correct implementation
      2) Identifying illegitimate access (authorization definition issue
      on service implementation)

      The "name" attribute is used to uniquely identify a SERVICE or a ROLE.
  -->
  <authorization-matrix>

      <!-- Describe the possible logical roles used in the system, is used here to
      provide a list+explanation
      of the different roles (authorization level) -->
      <roles>
          <role name="ANONYMOUS"
          description="Indicate that no authorization is needed"/>
          <role name="BASIC"
          description="Role affecting a standard user (lowest access right just above anonymous)"/>
          <role name="ADMIN"
          description="Role affecting an administrator user (highest access right)"/>
      </roles>

      <!-- List and describe the available services exposed by the system and the associated
      logical role(s) that can call them -->
      <services>
          <service name="ReadSingleMessage" uri="/{messageId}" http-method="GET"
          http-response-code-for-access-allowed="200" http-response-code-for-access-denied="403">
              <role name="ANONYMOUS"/>
              <role name="BASIC"/>
              <role name="ADMIN"/>
          </service>
          <service name="ReadAllMessages" uri="/" http-method="GET"
          http-response-code-for-access-allowed="200" http-response-code-for-access-denied="403">
              <role name="ANONYMOUS"/>
              <role name="BASIC"/>
              <role name="ADMIN"/>
          </service>
          <service name="CreateMessage" uri="/" http-method="PUT"
          http-response-code-for-access-allowed="200" http-response-code-for-access-denied="403">
              <role name="BASIC"/>
              <role name="ADMIN"/>
          </service>
          <service name="DeleteMessage" uri="/{messageId}" http-method="DELETE"
          http-response-code-for-access-allowed="200" http-response-code-for-access-denied="403">
              <role name="ADMIN"/>
          </service>
      </services>

      <!-- Provide a test payload for each service if needed -->
      <services-testing>
          <service name="ReadSingleMessage">
              <payload/>
          </service>
          <service name="ReadAllMessages">
              <payload/>
          </service>
          <service name="CreateMessage">
              <payload content-type="application/json">
                  {"content":"test"}
              </payload>
          </service>
          <service name="DeleteMessage">
              <payload/>
          </service>
      </services-testing>

  </authorization-matrix>
```

#### Implementing an integration test

**To create an integration test, you should use a maximum of factorized code and one test case by Point Of View (POV) so the verifications can be profiled by access level (logical role). This will facilitate the rendering/identification of the errors.**

In this integration test, we have implemented parsing, object mapping and access to the authorization matrix by marshalling XML into a Java object and unmarshalling the object back into XML These features are used to implement the tests (JAXB here) and limit the code to the developer in charge of performing the tests.

**Here is a sample implementation of an integration test case class:**

``` java
  import org.owasp.pocauthztesting.enumeration.SecurityRole;
  import org.owasp.pocauthztesting.service.AuthService;
  import org.owasp.pocauthztesting.vo.AuthorizationMatrix;
  import org.apache.http.client.methods.CloseableHttpResponse;
  import org.apache.http.client.methods.HttpDelete;
  import org.apache.http.client.methods.HttpGet;
  import org.apache.http.client.methods.HttpPut;
  import org.apache.http.client.methods.HttpRequestBase;
  import org.apache.http.entity.StringEntity;
  import org.apache.http.impl.client.CloseableHttpClient;
  import org.apache.http.impl.client.HttpClients;
  import org.junit.Assert;
  import org.junit.BeforeClass;
  import org.junit.Test;
  import org.xml.sax.InputSource;
  import javax.xml.bind.JAXBContext;
  import javax.xml.parsers.SAXParserFactory;
  import javax.xml.transform.Source;
  import javax.xml.transform.sax.SAXSource;
  import java.io.File;
  import java.io.FileInputStream;
  import java.util.ArrayList;
  import java.util.List;
  import java.util.Optional;

  /**
   * Integration test cases validate the correct implementation of the authorization matrix.
   * They create a test case by logical role that will test access on all services exposed by the system.
   * This implementation focuses on readability
   */
  public class AuthorizationMatrixIT {

      /**
       * Object representation of the authorization matrix
       */
      private static AuthorizationMatrix AUTHZ_MATRIX;

      private static final String BASE_URL = "http://localhost:8080";

      /**
       * Load the authorization matrix in objects tree
       *
       * @throws Exception If any error occurs
       */
      @BeforeClass
      public static void globalInit() throws Exception {
          try (FileInputStream fis = new FileInputStream(new File("authorization-matrix.xml"))) {
              SAXParserFactory spf = SAXParserFactory.newInstance();
              spf.setFeature("http://xml.org/sax/features/external-general-entities", false);
              spf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
              spf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
              Source xmlSource = new SAXSource(spf.newSAXParser().getXMLReader(), new InputSource(fis));
              JAXBContext jc = JAXBContext.newInstance(AuthorizationMatrix.class);
              AUTHZ_MATRIX = (AuthorizationMatrix) jc.createUnmarshaller().unmarshal(xmlSource);
          }
      }

      /**
       * Test access to the services from a anonymous user.
       *
       * @throws Exception
       */
      @Test
      public void testAccessUsingAnonymousUserPointOfView() throws Exception {
          //Run the tests - No access token here
          List<String> errors = executeTestWithPointOfView(SecurityRole.ANONYMOUS, null);
          //Verify the test results
          Assert.assertEquals("Access issues detected using the ANONYMOUS USER point of view:\n" + formatErrorsList(errors), 0, errors.size());
      }

      /**
       * Test access to the services from a basic user.
       *
       * @throws Exception
       */
      @Test
      public void testAccessUsingBasicUserPointOfView() throws Exception {
          //Get access token representing the authorization for the associated point of view
          String accessToken = generateTestCaseAccessToken("basic", SecurityRole.BASIC);
          //Run the tests
          List<String> errors = executeTestWithPointOfView(SecurityRole.BASIC, accessToken);
          //Verify the test results
          Assert.assertEquals("Access issues detected using the BASIC USER point of view:\n " + formatErrorsList(errors), 0, errors.size());
      }

      /**
       * Test access to the services from a user with administrator access.
       *
       * @throws Exception
       */
      @Test
      public void testAccessUsingAdministratorUserPointOfView() throws Exception {
          //Get access token representing the authorization for the associated point of view
          String accessToken = generateTestCaseAccessToken("admin", SecurityRole.ADMIN);
          //Run the tests
          List<String> errors = executeTestWithPointOfView(SecurityRole.ADMIN, accessToken);
          //Verify the test results
          Assert.assertEquals("Access issues detected using the ADMIN USER point of view:\n" + formatErrorsList(errors), 0, errors.size());
      }

      /**
       * Evaluate the access to all service using the specified point of view (POV).
       *
       * @param pointOfView Point of view to use
       * @param accessToken Access token that is linked to the point of view in terms of authorization.
       * @return List of errors detected
       * @throws Exception If any error occurs
       */
      private List<String> executeTestWithPointOfView(SecurityRole pointOfView, String accessToken) throws Exception {
          List<String> errors = new ArrayList<>();
          String errorMessageTplForUnexpectedReturnCode = "The service '%s' when called with POV '%s' return a response code %s that is not the expected one in allowed or denied case.";
          String errorMessageTplForIncorrectReturnCode = "The service '%s' when called with POV '%s' return a response code %s that is not the expected one (%s expected).";
          String fatalErrorMessageTpl = "The service '%s' when called with POV %s meet the error: %s";

          //Get the list of services to call
          List<AuthorizationMatrix.Services.Service> services = AUTHZ_MATRIX.getServices().getService();

          //Get the list of services test payload to use
          List<AuthorizationMatrix.ServicesTesting.Service> servicesTestPayload = AUTHZ_MATRIX.getServicesTesting().getService();

          //Call all services sequentially (no special focus on performance here)
          services.forEach(service -> {
              //Get the service test payload for the current service
              String payload = null;
              String payloadContentType = null;
              Optional<AuthorizationMatrix.ServicesTesting.Service> serviceTesting = servicesTestPayload.stream().filter(srvPld -> srvPld.getName().equals(service.getName())).findFirst();
              if (serviceTesting.isPresent()) {
                  payload = serviceTesting.get().getPayload().getValue();
                  payloadContentType = serviceTesting.get().getPayload().getContentType();
              }
              //Call the service and verify if the response is consistent
              try {
                  //Call the service
                  int serviceResponseCode = callService(service.getUri(), payload, payloadContentType, service.getHttpMethod(), accessToken);
                  //Check if the role represented by the specified point of view is defined for the current service
                  Optional<AuthorizationMatrix.Services.Service.Role> role = service.getRole().stream().filter(r -> r.getName().equals(pointOfView.name())).findFirst();
                  boolean accessIsGrantedInAuthorizationMatrix = role.isPresent();
                  //Verify behavior consistency according to the response code returned and the authorization configured in the matrix
                  if (serviceResponseCode == service.getHttpResponseCodeForAccessAllowed()) {
                      //Roles is not in the list of role allowed to access to the service so it's an error
                      if (!accessIsGrantedInAuthorizationMatrix) {
                          errors.add(String.format(errorMessageTplForIncorrectReturnCode, service.getName(), pointOfView.name(), serviceResponseCode,
                           service.getHttpResponseCodeForAccessDenied()));
                      }
                  } else if (serviceResponseCode == service.getHttpResponseCodeForAccessDenied()) {
                      //Roles is in the list of role allowed to access to the service so it's an error
                      if (accessIsGrantedInAuthorizationMatrix) {
                          errors.add(String.format(errorMessageTplForIncorrectReturnCode, service.getName(), pointOfView.name(), serviceResponseCode,
                           service.getHttpResponseCodeForAccessAllowed()));
                      }
                  } else {
                      errors.add(String.format(errorMessageTplForUnexpectedReturnCode, service.getName(), pointOfView.name(), serviceResponseCode));
                  }
              } catch (Exception e) {
                  errors.add(String.format(fatalErrorMessageTpl, service.getName(), pointOfView.name(), e.getMessage()));
              }

          });

          return errors;
      }

      /**
       * Call a service with a specific payload and return the HTTP response code that was received.
       * This step was delegated in order to made the test cases more easy to maintain.
       *
       * @param uri                URI of the target service
       * @param payloadContentType Content type of the payload to send
       * @param payload            Payload to send
       * @param httpMethod         HTTP method to use
       * @param accessToken        Access token to specify to represent the identity of the caller
       * @return The HTTP response code received
       * @throws Exception If any error occurs
       */
      private int callService(String uri, String payload, String payloadContentType, String httpMethod, String accessToken) throws Exception {
          int rc;

          //Build the request - Use Apache HTTP Client in order to be more flexible in the combination.
          HttpRequestBase request;
          String url = (BASE_URL + uri).replaceAll("\\{messageId\\}", "1");
          switch (httpMethod) {
              case "GET":
                  request = new HttpGet(url);
                  break;
              case "DELETE":
                  request = new HttpDelete(url);
                  break;
              case "PUT":
                  request = new HttpPut(url);
                  if (payload != null) {
                      request.setHeader("Content-Type", payloadContentType);
                      ((HttpPut) request).setEntity(new StringEntity(payload.trim()));
                  }
                  break;
              default:
                  throw new UnsupportedOperationException(httpMethod + " not supported !");
          }
          request.setHeader("Authorization", (accessToken != null) ? accessToken : "");

          //Send the request and get the HTTP response code.
          try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
              try (CloseableHttpResponse httpResponse = httpClient.execute(request)) {
                  //Don't care here about the response content...
                  rc = httpResponse.getStatusLine().getStatusCode();
              }
          }

          return rc;
      }

      /**
       * Generate a JWT token for the specified user and role.
       *
       * @param login User login
       * @param role  Authorization logical role
       * @return The JWT token
       * @throws Exception If any error occurs during the creation
       */
      private String generateTestCaseAccessToken(String login, SecurityRole role) throws Exception {
          return new AuthService().issueAccessToken(login, role);
      }

      /**
       * Format a list of errors to a printable string.
       *
       * @param errors Error list
       * @return Printable string
       */
      private String formatErrorsList(List<String> errors) {
          StringBuilder buffer = new StringBuilder();
          errors.forEach(e -> buffer.append(e).append("\n"));
          return buffer.toString();
      }
  }
```

If an authorization issue is detected (or issues are detected), the output is the following:

```java
testAccessUsingAnonymousUserPointOfView(org.owasp.pocauthztesting.AuthorizationMatrixIT)
Time elapsed: 1.009 s  ### FAILURE
java.lang.AssertionError:
Access issues detected using the ANONYMOUS USER point of view:
    The service 'DeleteMessage' when called with POV 'ANONYMOUS' return
    a response code 200 that is not the expected one (403 expected).

    The service 'CreateMessage' when called with POV 'ANONYMOUS' return
    a response code 200 that is not the expected one (403 expected).

testAccessUsingBasicUserPointOfView(org.owasp.pocauthztesting.AuthorizationMatrixIT)
Time elapsed: 0.05 s  ### FAILURE!
java.lang.AssertionError:
Access issues detected using the BASIC USER point of view:
    The service 'DeleteMessage' when called with POV 'BASIC' return
    a response code 200 that is not the expected one (403 expected).
```

### Rendering the authorization matrix for an audit / review

Even if the authorization matrix is stored in a human-readable format (XML), you might want to show an on-the-fly rendered representation of the XML file to spot potential inconsistencies and facilitate the review, audit and discussion about the authorization matrix.

<!-- textlint-disable -->
To achieve this task, you could use the following XSL stylesheet:
<!-- textlint-enable -->

``` xslt
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/">
    <html>
      <head>
        <title>Authorization Matrix</title>
        <link rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css"
        integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ"
        crossorigin="anonymous" />
      </head>
      <body>
        <h3>Roles</h3>
        <ul>
          <xsl:for-each select="authorization-matrix/roles/role">
            <xsl:choose>
              <xsl:when test="@name = 'ADMIN'">
                <div class="alert alert-warning" role="alert">
                  <strong>
                    <xsl:value-of select="@name" />
                  </strong>
                  :
                  <xsl:value-of select="@description" />
                </div>
              </xsl:when>
              <xsl:when test="@name = 'BASIC'">
                <div class="alert alert-info" role="alert">
                  <strong>
                    <xsl:value-of select="@name" />
                  </strong>
                  :
                  <xsl:value-of select="@description" />
                </div>
              </xsl:when>
              <xsl:otherwise>
                <div class="alert alert-danger" role="alert">
                  <strong>
                    <xsl:value-of select="@name" />
                  </strong>
                  :
                  <xsl:value-of select="@description" />
                </div>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:for-each>
        </ul>
        <h3>Authorizations</h3>
        <table class="table table-hover table-sm">
          <thead class="thead-inverse">
            <tr>
              <th>Service</th>
              <th>URI</th>
              <th>Method</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="authorization-matrix/services/service">
              <xsl:variable name="service-name" select="@name" />
              <xsl:variable name="service-uri" select="@uri" />
              <xsl:variable name="service-method" select="@http-method" />
              <xsl:for-each select="role">
                <tr>
                  <td scope="row">
                    <xsl:value-of select="$service-name" />
                  </td>
                  <td>
                    <xsl:value-of select="$service-uri" />
                  </td>
                  <td>
                    <xsl:value-of select="$service-method" />
                  </td>
                  <td>
                    <xsl:variable name="service-role-name" select="@name" />
                    <xsl:choose>
                      <xsl:when test="@name = 'ADMIN'">
                        <div class="alert alert-warning" role="alert">
                          <xsl:value-of select="@name" />
                        </div>
                      </xsl:when>
                      <xsl:when test="@name = 'BASIC'">
                        <div class="alert alert-info" role="alert">
                          <xsl:value-of select="@name" />
                        </div>
                      </xsl:when>
                      <xsl:otherwise>
                        <div class="alert alert-danger" role="alert">
                          <xsl:value-of select="@name" />
                        </div>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                </tr>
              </xsl:for-each>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
```

Example of the rendering:

![RenderingExample](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Authorization_Testing_Automation_AutomationRendering.png)

### Sources of the prototype

[GitHub repository](https://github.com/righettod/poc-authz-testing)
