---
title: "Security Foundations"
order: 1
summary: "The vocabulary and the habits: threat modeling, attack surface, abuse cases, secure design and code review."
category: "Security"
level: Intermediate
---

# Security Foundations

The vocabulary and the habits: threat modeling, attack surface, abuse cases, secure design and code review.

## Security Terminology

> **Source:** [Security Terminology](https://cheatsheetseries.owasp.org/cheatsheets/Security_Terminology_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet provides clear definitions and distinctions for security terminology that is often confused, even by experienced developers. Understanding these terms is critical for correctly implementing security controls and following standards like the [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/).

### Table of Contents

- [Data Handling: Encoding, Escaping, Sanitization, and Serialization](#data-handling-encoding-escaping-sanitization-and-serialization)
- [Cryptography: Encryption, Hashing, and Signatures](#cryptography-encryption-hashing-and-signatures)
- [Identity: Authentication and Authorization](#identity-authentication-and-authorization)
- [Federated Identity Terms](#federated-identity-terms)
- [References](#references)

### Data Handling: Encoding, Escaping, Sanitization, and Serialization

These terms relate to how data is transformed for transport, storage, or display. See the [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) for validation guidance.

#### Encoding

**Definition:** Transforming data into a different format using a publicly available scheme, so that it can be safely consumed by a different system.

- **Purpose:** Represent data for a particular transport, storage, or output context.
- **Reversibility:** Always reversible.
- **Examples:** Base64, URL Encoding, HTML Entity Encoding.
- **Security Context:** Base64 does not provide confidentiality. Context-appropriate [output encoding is an XSS defense](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS#output_encoding); using the wrong encoding for the destination context can leave an injection vulnerability.

#### Escaping

**Definition:** Representing characters with parser-specific escape sequences so they are interpreted literally in a particular context.

- **Purpose:** To ensure the interpreter treats the data as text rather than code/commands.
- **Examples:** `\"` inside a JSON string, `&lt;` in HTML text.
- **Security Context:** Escaping rules depend on the parser and context. For SQL values, use [parameterized queries](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html#primary-defenses) instead of constructing SQL with escaped strings.

#### Sanitization

**Definition:** The process of cleaning or filtering input by removing, replacing, or modifying potentially dangerous characters or content.

- **Purpose:** To make "dirty" input "clean" according to a security policy.
- **Examples:** Using a maintained HTML sanitizer to allow approved elements and attributes in user-authored HTML.
- **Security Context:** Use [HTML sanitization](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#html-sanitization) when untrusted input must be rendered as HTML. Removing `<script>` tags alone is insufficient; other elements and attributes can execute scripts. Use output encoding when the value should be displayed as text.

#### Serialization

**Definition:** Converting an object or data structure into a format that can be stored or transmitted (e.g., a byte stream) and later reconstructed.

- **Purpose:** Data persistence and communication.
- **Security Context:** **Insecure Deserialization** occurs when untrusted data is used to reconstruct an object, potentially leading to Remote Code Execution (RCE).

---

### Cryptography: Encryption, Hashing, and Signatures

These terms relate to protecting the confidentiality, integrity, and authenticity of data. See the [Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html) and [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) for implementation guidance.

#### Encryption

**Definition:** Transforming data (plaintext) into an unreadable format (ciphertext) using a secret key.

- **Purpose:** **Confidentiality**. Only authorized parties with the key can read the data.
- **Reversibility:** Reversible (Decryption) with the correct key.
- **Types:** Symmetric (same key) and Asymmetric (public/private keys).

#### Hashing

**Definition:** Transforming data into a fixed-size string (a "hash" or "digest") using a mathematical function.

- **Purpose:** **Integrity**. A small change in the input results in a completely different hash.
- **Reversibility:** One-way (non-reversible).
- **Security Context:** Used for password storage (with salt) and verifying file integrity.
- **Examples:** SHA-256, Argon2, bcrypt.

#### Signatures (Digital Signatures)

**Definition:** Using asymmetric cryptography to provide proof of the origin and integrity of a message.

- **Purpose:** **Authenticity** and **Non-repudiation**. Proves who sent the message and that it wasn't altered.
- **Mechanism:** The signing algorithm uses the signer's private key; verification uses a trusted public key bound to that signer. Follow the algorithm's [message-processing rules](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf#page=18); do not add a separate prehash unless the chosen algorithm and API require it.
- **Examples:** Asymmetrically signed JWTs and GPG signatures. [JWTs can also use shared-key message authentication codes or encryption](https://www.rfc-editor.org/info/rfc7519/); the JWT format does not imply a digital signature.

---

### Identity: Authentication and Authorization

#### Authentication (AuthN)

**Definition:** The process of verifying who a user is.

- **Question:** "Who are you?"
- **Factors:** Something you know (password), something you have (token), something you are (biometrics).

#### Authorization (AuthZ)

**Definition:** The process of verifying what a user has permission to do.

- **Question:** "Are you allowed to do this?"
- **Security Context:** Occurs *after* successful authentication.
- **Examples:** Role-Based Access Control (RBAC), Attribute-Based Access Control (ABAC).

---

### Federated Identity Terms

When working with OAuth2, SAML, or OIDC, these terms are frequently used:

| Term | Definition | Context |
| :--- | :--- | :--- |
| **Identity Provider (IdP)** | The system that creates, maintains, and manages identity information and provides authentication services. | Google, Okta, Azure AD |
| **Relying Party (RP)** | An application or service that relies on an IdP to authenticate users. | Your web app using "Login with Google" |
| **Service Provider (SP)** | In SAML, the equivalent of a Relying Party. | Your enterprise app using SAML |
| **Principal** | The entity (user, service, or device) being authenticated. | The user logging in |

---

## Threat Modeling

> **Source:** [Threat Modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Threat modeling is an important concept for modern application developers to understand. The goal of this cheatsheet is to provide a concise, but actionable, reference for both those new to threat modeling and those seeking a refresher.
The OWASP [Threat Modeling project](https://owasp.org/projects/threat-modeling-project?tab=application-threat-modeling) provides further information on various aspects of threat modeling.

### Overview

In the context of application security, threat modeling is a structured, repeatable process used to gain actionable insights into the security characteristics of a particular system. It involves modeling a system from a security perspective, identifying applicable threats based on this model, and determining responses to these threats. Threat modeling analyzes a system from an adversarial perspective, focusing on ways in which an attacker can exploit a system.

Threat modeling is ideally performed early in the SDLC, such as during the design phase. Moreover, it is not something that is performed once and never again. A threat model is something that should be maintained, updated and refined alongside the system. Ideally, threat modeling should be integrated seamlessly into a team's normal SDLC process; it should be treated as standard and necessary step in the process, not an add-on.

According to the [Threat Modeling Manifesto](https://www.threatmodelingmanifesto.org/), the threat modeling process should answer the following four questions:

1. What are we working on?
2. What can go wrong?
3. What are we going to do about it?
4. Did we do a good enough job?

These four questions will act as the foundation for the four major phases described below.

### Advantages

Before turning to an overview of the process, it may be worth addressing the question: why threat model? Why bother adding more work to the development process? What are the benefits? The following section will briefly outline some answers to these questions.

#### Identify Risks Early On

Threat modeling seeks to identify potential security issues during the design phase. This allows security to be "built-into" a system rather than "bolted-on". This is far more efficient than having to identify and resolve security flaws after a system is in production.

#### Increased Security Awareness

Proper threat modeling requires participants to think creatively and critically about the security and threat landscape of a specific application. It challenges individuals to "think like an attacker" and apply general security knowledge to a specific context. Threat modeling is also typically a team effort with members being encouraged to share ideas and provide feedback on others. Overall, threat modeling can prove to be a highly educational activity that benefits participants.

#### Improved Visibility of Target of Evaluation (TOE)

Threat modeling requires a deep understanding of the system being evaluated. To properly threat model, one must understand data flows, trust boundaries, and other characteristics of the system. Thus improved visibility into a system and its interactions is one advantage of threat modeling.

### Addressing Each Question

There is no universally accepted industry standard for the threat modeling process, no "right" answer for every use case. However, despite this diversity, most approaches do include the processes of system modeling, threat identification, and risk response in some form. Inspired by these commonalities and guided by the four key questions of threat modeling discussed above, this cheatsheet will break the threat modeling down into four basic steps: application decomposition, threat identification and ranking, mitigations, and review and validation. There are processes that are less aligned to this, including the Process for Attack Simulation and Threat Analysis (PASTA) and Operationally Critical Threat, Asset, and Vulnerability Evaluation (OCTAVE), each of which has passionate advocates.

#### System Modeling

The step of system modeling seeks to answer the question "what are we building"? Without understanding a system, one cannot truly understand what threats are most applicable to it; thus, this step provides a critical foundation for subsequent activities. Although different techniques may be used in this first step of threat modeling, data flow diagrams (DFDs) are arguably the most common approach.

DFDs visually model a system, its data flows, and interactions with external entities. Create them using a diagramming tool or a whiteboard, and save them in a form the team can update. For complex systems, use a high-level overview alongside more detailed diagrams of individual components.

Regardless of how a DFD or comparable model is generated, it is important that the solution provides a clear view of trust boundaries, data flows, data stores, processes, and the external entities which may interact with the system. These often represent possible attack points and provide crucial input for the subsequent steps.

Another approach to Data Flow Diagrams (DFD) could be the brainstorming technique, which is an effective method for generating ideas and discovering the project's domain. Applying brainstorming in this context can bring numerous benefits, such as increased team engagement, unification of knowledge and terminology, a shared understanding of the domain, and quick identification of key processes and dependencies. One of the main arguments for using brainstorming is its flexibility and adaptability to almost any scenario, including business logic. Additionally, this technique is particularly useful when less technical individuals participate in the session, as it eliminates barriers related to understanding and applying the components of DFD models and their correctness.

Brainstorming engages all participants, fostering better communication and mutual understanding of issues. Every team member has the opportunity to contribute, which increases the sense of responsibility and involvement. During a brainstorming session, participants can collaboratively define and agree on key terms and concepts, leading to a unified language used in the project. This is especially important in complex projects where different teams might have different approaches to terminology. Due to the dynamic nature of brainstorming, the team can quickly identify key business processes and their interrelations.

Integrating the results of brainstorming with formal modeling techniques can lead to a better understanding of the domain and more effective system design.

#### Cloud Threat Modeling

Most modern systems are cloud-native or hybrid. Traditional threat modeling techniques (like STRIDE or DFDs) often need adaptation for cloud architectures, which introduce:

- Shared responsibility models
- Managed services and APIs
- Multi-tenant and identity federation considerations
- Dynamic infrastructure (IaC, serverless, containers)

Cloud-native systems introduce unique considerations for threat modeling due to their distributed, service-oriented nature and shared responsibility model. In this context, the threat modeling process should account for:

- **Cloud architecture components:** virtual networks, IAM roles, managed services, and storage buckets.
- **Shared responsibility:** understanding which security controls are managed by the provider vs. the customer.
- **Dynamic environments:** container orchestration, serverless functions, and ephemeral infrastructure.
- **Compliance and data residency:** ensuring that workloads meet jurisdictional and privacy requirements.

#### Threat Identification

After the system has been modeled, it is now time to address the question of "what can go wrong?". This question must be explored with the inputs from the first step in mind; that is, it should focus on identifying and ranking threats within the context of the specific system being evaluated. In attempting to answer this question, threat modelers have a wealth of data sources and techniques at their disposal. For illustration purposes, this cheatsheet will leverage STRIDE; however, in practice, other approaches may be used alongside or instead of STRIDE.

STRIDE is a mature and popular threat modeling technique and mnemonic originally developed by Microsoft employees. To facilitate threat identification, STRIDE groups threats into one of six general prompts and engineers are encouraged to systematically consider how these general threats may materialize within the context of the specific system being evaluated. Each STRIDE threat may be considered a violation of a desirable security attribute; the categories and associated desirable attributes are as follows:

| Threat Category             | Violates          | Examples                                                                                                    |
| --------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **S**poofing                | Authentication    | An attacker steals the authentication token of a legitimate user and uses it to impersonate the user.       |
| **T**ampering               | Integrity         | An attacker abuses the application to perform unintended updates to a database.                             |
| **R**epudiation             | Accounting        | An attacker manipulates logs to cover their actions.                                                        |
| **I**nformation Disclosure  | Confidentiality   | An attacker extracts data from a database containing user account info.                                     |
| **D**enial of Service       | Availability      | An attacker locks a legitimate user out of their account by performing many failed authentication attempts. |
| **E**levation of Privileges | Authorization     | An attacker tampers with a JWT to change their role.                                                        |

Use STRIDE's six categories as prompts while reviewing the system model. Brainstorm threats with the team and record which components, data flows, or trust boundaries they affect.

After possible threats have been identified, people will frequently rank them. In theory, ranking should be based on the mathematical product of an identified threat's likelihood and its impact. A threat that is likely to occur and result in serious damage would be prioritized much higher than one that is unlikely to occur and would only have a moderate impact. However, these both can be challenging to calculate, and they ignore the work to fix a problem. Some advocate for including that in a single prioritization.

##### Choosing a Threat Modeling Technique

Start with STRIDE for a technical design, and select another technique when the scope requires a different view. The [Software Engineering Institute comparison of threat modeling methods](https://www.sei.cmu.edu/library/threat-modeling-a-summary-of-available-methods/) explains that methods focus on different concerns and may be combined.

| When the team needs to analyze | Consider | How to use it |
| ------------------------------ | -------- | ------------- |
| Security threats in a technical design | STRIDE | Apply the six threat categories above to components, data flows, and trust boundaries. |
| A high-value attacker goal or multi-step attack | Attack trees | Start with the attacker's goal and decompose the alternative or required paths to reach it. |
| Abuse of a valid workflow or business rule | Misuse or abuse cases | Explore actions performed out of order, repeatedly, concurrently, or for an unintended outcome. |
| Privacy properties and harms | [LINDDUN](https://linddun.org/threat-types/) (Linking, Identifying, Non-repudiation, Detecting, Data disclosure, Unawareness and Unintervenability, Non-compliance) | Apply privacy-specific prompts that are not fully represented by STRIDE's security properties. |
| Application threats with business impact | PASTA | Connect business objectives and technical requirements to application threats. |
| Organization-wide risk to critical assets | OCTAVE | Assess organizational risk and plan a security strategy for critical assets. |
| Application and operational threats across many teams | VAST (Visual, Agile, and Simple Threat Modeling) | Maintain separate application and operational threat models within development workflows. |

Do not add techniques only to make the model appear comprehensive. State why each technique fits the scope and record any concerns it does not address.

#### Response and Mitigations

Equipped with an understanding of both the system and applicable threats, it is now time to answer "what are we going to do about it"?. Each threat identified earlier must have a response. Threat responses are similar, but not identical, to risk responses. Adam Shostack lists the following responses:

- **Mitigate:** Take action to reduce the likelihood that the threat will materialize.
- **Eliminate:** Simply remove the feature or component that is causing the threat.
- **Transfer:** Allocate contractual or financial responsibility to another party. [Risk transfer does not itself reduce the likelihood or harmful consequences of an event](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=908030#page=52); document who owns the remaining controls and residual risk.
- **Accept:** Do not mitigate, eliminate, or transfer the risk because none of the above options are acceptable given business requirements or constraints.

Document each threat's response and turn agreed mitigations into actionable security requirements. Record how the team will implement each mitigation and why it accepts any remaining risk. Keep these decisions current as the system changes, as recommended by [NIST SP 800-218, practice PW.1.2](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-218.pdf#page=20).

#### Review and Validation

Finally, it is time to answer the question "did we do a good enough job"? The threat model must be reviewed by all stakeholders, not just the development or security teams. Areas to focus on include:

- Does the DFD (or comparable) accurately reflect the system?
- Have all threats been identified?
- For each identified threat, has a response strategy been agreed upon?
- For identified threats for which mitigation is the desired response, have mitigation strategies been developed which reduce risk to an acceptable level?
- Has the threat model been formally documented? Are artifacts from the threat model process stored in such a way that it can be accessed by those with "need to know"?
- Can the agreed upon mitigations be tested? Can success or failure of the requirements and recommendations from the threat model be measured?

### Threat Modeling and the Development Team

#### Challenges

Threat modeling can be challenging for development teams for several key reasons. Firstly, many developers lack sufficient knowledge and experience in the field of security, which hinders their ability to effectively use methodologies and frameworks, identify, and model threats. Without proper training and understanding of basic security principles, developers may overlook potential threats or incorrectly assess their risks.

Additionally, the threat modeling process can be complex and time-consuming. It requires a systematic approach and in-depth analysis, which is often difficult to reconcile with tight schedules and the pressure to deliver new functionalities. Development teams may feel a lack of tools and resources to support them in this task, leading to frustration and discouragement.

Another challenge is the communication and collaboration between different departments within the organization. Without effective communication between development teams, security teams, and other stakeholders, threat modeling can be incomplete or misdirected.

#### Addressing the Challenges

In many cases, the solution lies in inviting members of the security teams to threat modeling sessions, which can significantly improve the process. Security specialists bring essential knowledge about potential threats that is crucial for effective identification, risk analysis, and mitigation. Their experience and understanding of the latest trends and techniques used by cybercriminals can provide key insights for learning and developing the competencies of development teams. Such joint sessions not only enhance developers' knowledge but also build a culture of collaboration and mutual support within the organization, leading to a more comprehensive approach to security.

To change the current situation, organizations should invest in regular IT security training for their development teams. These training sessions should be conducted by experts and tailored to the specific needs of the team. Additionally, it is beneficial to implement processes and tools that simplify and automate threat modeling. These tools can help in identifying and assessing threats, making the process more accessible and less time-consuming.

It is also important to promote a culture of security throughout the organization, where threat modeling is seen as an integral part of the Software Development Life Cycle (SDLC), rather than an additional burden. Regular review sessions and cross-team workshops can improve collaboration and communication, leading to a more effective and comprehensive approach to security. Through these actions, organizations can make threat modeling a less burdensome and more efficient process, bringing real benefits to the security of their systems.

## Attack Surface Analysis

> **Source:** [Attack Surface Analysis](https://cheatsheetseries.owasp.org/cheatsheets/Attack_Surface_Analysis_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### What is Attack Surface Analysis and Why is it Important

This article describes a simple and pragmatic way of doing Attack Surface Analysis and managing an application's Attack Surface. It is targeted to be used by developers to understand and manage application security risks as they design and change an application, as well as by application security specialists doing a security risk assessment. The focus here is on protecting an application from external attack - it does not take into account attacks on the users or operators of the system (e.g. malware injection, social engineering attacks), and there is less focus on insider threats, although the principles remain the same. The internal attack surface is likely to be different from the external attack surface and some users may have a lot of access.

Attack Surface Analysis is about mapping out what parts of a system need to be reviewed and tested for security vulnerabilities. The point of Attack Surface Analysis is to understand the risk areas in an application, to make developers and security specialists aware of what parts of the application are open to attack, to find ways of minimizing this, and to notice when and how the Attack Surface changes and what this means from a risk perspective.

While Attack Surface Analysis is usually done by security architects and pen testers, developers should understand and monitor the Attack Surface as they design and build and change a system.

Attack Surface Analysis helps you to:

1. identify what functions and what parts of the system you need to review/test for security vulnerabilities
2. identify high risk areas of code that require defense-in-depth protection - what parts of the system that you need to defend
3. identify when you have changed the attack surface and need to do some kind of threat assessment

### Defining the Attack Surface of an Application

The Attack Surface describes all of the different points where an attacker could get into a system, and where they could get data out.

The Attack Surface of an application is:

1. the sum of all paths for data/commands into and out of the application, and
2. the code that protects these paths (including resource connection and authentication, authorization, activity logging, data validation and encoding)
3. all valuable data used in the application, including secrets and keys, intellectual property, critical business data, personal data and PII, and
4. the code that protects these data (including encryption and checksums, access auditing, and data integrity and operational security controls).

You overlay this model with the different types of users - roles, privilege levels - that can access the system (whether authorized or not). Complexity increases with the number of different types of users. It is important to focus on the two extremes: unauthenticated, anonymous users and highly privileged admin users (e.g. database administrators, system administrators).

Group each type of attack point into buckets based on risk (external-facing or internal-facing), purpose, implementation, design and technology. Then, count the number of attack points of each type. Next, choose some cases for each type. Finally, focus your review/assessment on those cases.

With this approach, you don't need to understand every endpoint in order to understand the Attack Surface and the potential risk profile of a system. Instead, you can count the different general type of endpoints and the number of points of each type. This enables you to budget what it will take to assess risk at scale, and you can tell when the risk profile of an application has significantly changed.

#### Microservice and Cloud Native Applications

Microservice and Cloud Native applications are comprised of multiple smaller components, loosely coupled using APIs and independently scalable. When assessing the attack surface for applications of this architectural style, you should prioritize the components that are reachable from an attack source (e.g. external traffic from the Internet). Such components may be located behind tiers of proxies, load balancers and ingress controllers, and may auto-scale without warning.

Open source tooling such as [Cilium Hubble](https://github.com/cilium/hubble) and [kubeshark](https://github.com/kubeshark/kubeshark) assist in visualizing the attack surface for Kubernetes and service-mesh deployments.

### Identifying and Mapping the Attack Surface

You can start building a baseline description of the Attack Surface in a picture and notes. Spend a few hours reviewing design and architecture documents from an attacker's perspective. Read through the source code and identify different points of entry/exit:

- User interface (UI) forms and fields
- HTTP headers and cookies
- APIs
- Files
- Databases
- Other local storage
- Email or other kinds of messages
- Runtime arguments
- ...Your points of entry/exit

The total number of different attack points can easily add up into the thousands or more. To make this manageable, break the model into different types based on function, design and technology:

- Login/authentication entry points
- Admin interfaces
- Inquiries and search functions
- Data entry (CRUD) forms
- Business workflows
- Transactional interfaces/APIs
- Operational command and monitoring interfaces/APIs
- Interfaces with other applications/systems
- ...Your types

You also need to identify the valuable data (e.g. confidential, sensitive, regulated) in the application, by interviewing developers and users of the system, and again by reviewing the source code.

You can also build up a picture of the Attack Surface by scanning the application. For web apps you can use a tool like [ZAP](https://www.zaproxy.org/getting-started/#running-an-automated-scan) or another maintained dynamic testing tool to crawl your app and map the parts of the application that are accessible over the web. Some web application firewalls (WAFs) may also be able to export a model of the application's entry points.

Validate and fill in your understanding of the Attack Surface by walking through some of the main use cases in the system: signing up and creating a user profile, logging in, searching for an item, placing an order, changing an order, and so on. Follow the flow of control and data through the system, see how information is validated and where it is stored, what resources are touched and what other systems are involved. There is a recursive relationship between Attack Surface Analysis and [Application Threat Modeling](https://owasp.org/www-community/Application_Threat_Modeling): changes to the Attack Surface should trigger threat modeling, and threat modeling helps you to understand the Attack Surface of the application.

The Attack Surface model may be rough and incomplete to start, especially if you haven't done any security work on the application before. Fill in the holes as you dig deeper in a security analysis, or as you work more with the application and realize that your understanding of the Attack Surface has improved.

### Measuring and Assessing the Attack Surface

Once you have a map of the Attack Surface, identify the high risk areas. Focus on remote entry points – interfaces with outside systems and to the Internet – and especially where the system allows anonymous, public access.

- Network-facing, especially internet-facing code
- Web forms
- Files from outside of the network
- Backward compatible interfaces with other systems – old protocols, sometimes old code and libraries, hard to maintain and test multiple versions
- Custom APIs – protocols etc – likely to have mistakes in design and implementation
- Security code: anything to do with cryptography, authentication, authorization (access control) and session management

These are often where you are most exposed to attack. Then understand what compensating controls you have in place, operational controls like network firewalls and application firewalls, and intrusion detection or prevention systems to help protect your application.

Michael Howard at Microsoft and other researchers have developed a method for measuring the Attack Surface of an application, and to track changes to the Attack Surface over time, called the [Relative Attack Surface Quotient (RSQ)](https://www.cs.cmu.edu/~wing/publications/Howard-Wing03.pdf). Using this method you calculate an overall attack surface score for the system, and measure this score as changes are made to the system and to how it is deployed. Researchers at Carnegie Mellon built on this work to develop a formal way to calculate an [Attack Surface Metric](https://www.cs.cmu.edu/~wing/publications/Howard-Wing03.pdf) for large systems like SAP. They calculate the Attack Surface as the sum of all entry and exit points, channels (the different ways that clients or external systems connect to the system, including TCP/UDP ports, RPC endpoints, named pipes...) and untrusted data elements. Then they apply a damage potential/effort ratio to these Attack Surface elements to identify high-risk areas.

Note that deploying multiple versions of an application, leaving features in that are no longer used just in case they may be needed in the future, or leaving old backup copies and unused code increases the Attack Surface. Source code control and robust change management/configurations practices should be used to ensure the actual deployed Attack Surface matches the theoretical one as closely as possible.

Backups of code and data - online, and on offline media - are an important but often ignored part of a system's Attack Surface. Protecting your data and IP by writing secure software and hardening the infrastructure will all be wasted if you hand everything over to bad actors by not protecting your backups.

### Managing the Attack Surface

Once you have a baseline understanding of the Attack Surface, you can use it to incrementally identify and manage risks going forward as you make changes to the application. Ask yourself:

- What has changed?
- What are you doing different? (technology, new approach, ….)
- What holes could you have opened?

The first web page that you create opens up the system's Attack Surface significantly and introduces all kinds of new risks. If you add another field to that page, or another web page like it, while technically you have made the Attack Surface bigger, you haven't increased the risk profile of the application in a meaningful way. Each of these incremental changes is more of the same, unless you follow a new design or use a new framework.

If you add another web page that follows the same design and using the same technology as existing web pages, it's easy to understand how much security testing and review it needs. If you add a new web services API or file that can be uploaded from the Internet, each of these changes have a different risk profile again - see if the change fits in an existing bucket, see if the existing controls and protections apply. If you're adding something that doesn't fall into an existing bucket, this means that you have to go through a more thorough risk assessment to understand what kind of security holes you may open and what protections you need to put in place.

Changes to session management, authentication and password management directly affect the Attack Surface and need to be reviewed. So do changes to authorization and access control logic, especially adding or changing role definitions, adding admin users or admin functions with high privileges. Similarly for changes to the code that handles encryption and secrets. Fundamental changes to how data validation is done. And major architectural changes to layering and trust relationships, or fundamental changes in technical architecture – swapping out your web server or database platform, or changing the runtime operating system.

As you add new user types or roles or privilege levels, you do the same kind of analysis and risk assessment. Overlay the type of access across the data and functions and look for problems and inconsistencies. It's important to understand the access model for the application, whether it is positive (access is deny by default) or negative (access is allow by default). In a positive access model, any mistakes in defining what data or functions are permitted to a new user type or role are easy to see. In a negative access model, you have to be much more careful to ensure that a user does not get access to data/functions that they should not be permitted to.

This kind of threat or risk assessment can be done periodically, or as a part of design work in serial / phased / spiral / waterfall development projects, or continuously and incrementally in Agile / iterative development.

Normally, an application's Attack Surface will increase over time as you add more interfaces and user types and integrate with other systems. You also want to look for ways to reduce the size of the Attack Surface when you can by simplifying the model (reducing the number of user levels for example or not storing confidential data that you don't absolutely have to), turning off features and interfaces that aren't being used, by introducing operational controls such as a Web Application Firewall (WAF) and real-time application-specific attack detection.

## Abuse Case Cheat Sheet (Historical)

> **Source:** [Abuse Case Cheat Sheet (Historical)](https://cheatsheetseries.owasp.org/cheatsheets/Abuse_Case_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Archive Statement

Reviewers have identified that abuse cases are rarely used in practice. Additionally, the material is presented as a "getting started tutorial" which isn't appropriate for the cheat sheet series.

### Introduction

Often when the security level of an application is mentioned in requirements, the following _expressions_ are met:

- _The application must be secure_.
- _The application must defend against all attacks targeting this category of application_.
- _The application must defend against attacks from the OWASP TOP 10_
- ...

These security requirements are too generic, and thus useless for a development team...

In order to build a secure application, from a pragmatic point of view, it is important to identify the attacks which the application must defend against, according to its business and technical context. Abuse cases were a frequently recommended _threat modeling_ technique, and reviewing the [threat modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) cheat sheet may be helpful. In practice, the abuse case framework seems heavyweight and there are few published examples or success stories.

#### Objective

The objective of this cheat sheet is to provide an explanation of what an **Abuse Case** is, how abuse cases can be important when considering the security of an application, and finally to provide a proposal for a pragmatic approach to building a list of abuse cases and tracking them for every feature planned for implementation as part of an application. The cheat sheet may be used for this purpose regardless of the project methodology used (waterfall or agile).

**Important note about this Cheat Sheet:**

```text
The main objective is to provide a pragmatic approach in order to allow a company or a project team
to start building and handling the list of abuse cases and then customize the elements
proposed to its context/culture in order to, finally, build its own method.

This cheat sheet can be seen as a getting-started tutorial.
```

#### Context & approach

##### Why clearly identify the attacks

Clearly identifying the attacks against which the application must defend is essential in order to enable the following steps in a project or sprint:

- Evaluate the business risk for each of the identified attacks in order to perform a selection according to the business risk and the project/sprint budget.
- Derive security requirements and add them into the project specification or sprint's user stories and acceptance criteria.
- Estimate the overhead of provision in the initial project/sprint charge that will be necessary to implement the countermeasures.
- About countermeasures: Allow the project team to define them, and to determine in which location (network, infrastructure, code...) they should be located.

##### Notion of Abuse Cases

You can think of **Abuse cases** in two ways. The first is to discover attacks (answer the question "what can go wrong"), and the second is to help record those attacks (informally, this includes threats, issues, risks) in a form that may be less intimidating to developers.

An **Abuse Case** can be defined as:

```text
A way to use a feature that was not expected by the implementer,
allowing an attacker to influence the feature or outcome of use of
the feature based on the attacker action (or input).
```

Synopsis defines an **Abuse Case** like this:

```text
Misuse and abuse cases describe how users misuse or exploit the weaknesses
of controls in software features to attack an application.

This can lead to tangible business impact when a direct attack against
business functionalities, which may bring in revenue or provide
positive user experience, are attacked.

Abuse cases can also be an effective way to drive security requirements
that lead to proper protection of these critical business use cases.
```

[Synopsis source](https://www.synopsys.com/blogs/software-security/abuse-cases-can-drive-security-requirements.html)

##### How to define the list of Abuse Cases

There are many different ways to define the list of abuse cases for a feature (that can be mapped to a user story in agile projects).

[Threat Modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) is a set of techniques for anticipating what can go wrong, and ensuring we do something about each identified possible scenario. Taking each item on the list of "what are we going to do about it" and writing an abuse case may help your engineering teams process the output.

The project [OWASP Open SAMM](https://owasp.org/www-project-samm/) proposes the following approach in the _Stream B_ of the Security Practice _Requirements Driven Testing_ for the Maturity level 2:

```text
Misuse and abuse cases describe unintended and malicious use scenarios of the application, describing how an attacker could do this. Create misuse and abuse cases to misuse or exploit the weaknesses of controls in software features to attack an application. Use abuse-case models for an application to serve as fuel for identification of concrete security tests that directly or indirectly exploit the abuse scenarios.

Abuse of functionality, sometimes referred to as a “business logic attack”, depends on the design and implementation of application functions and features. An example is using a password reset flow to enumerate accounts. As part of business logic testing, identify the business rules that are important for the application and turn them into experiments to verify whether the application properly enforces the business rule. For example, on a stock trading application, is the attacker allowed to start a trade at the beginning of the day and lock in a price, hold the transaction open until the end of the day, then complete the sale if the stock price has risen or cancel if the price dropped?
```

Open SAMM source: [Verification Requirement Driven Testing Stream B](https://owaspsamm.org/model/verification/requirements-driven-testing/stream-b/)

Another way to achieve the building of the list can be the following (more bottom-up and collaboratively oriented):

Make a workshop that includes people with the following profiles:

- **Business analyst**: Will be the business key people that will describe each feature from a business point of view.
- **Risk analyst**: Will be the company's risk personnel that will evaluate the business risk from a proposed attack (sometimes it is the **Business analyst** depending on the company).
- **Penetration tester**: Will be the _attacker_ that will propose attacks that they can perform on the business feature(s) in question. If the company does not have a person with this profile then it is possible to request the service of an external specialist. If possible, include 2 penetration testers with different backgrounds in order to increase the number of possible attacks that will be identified and considered.
- **Technical leaders of the projects**: Will be the project technical people and will allow technical exchange about attacks and countermeasures identified during the workshop.
- **Quality assurance analyst or functional tester**: Personnel that may have a good sense of how the application/functionality is intended to work (positive testing), not work (negative testing), and what things cause it to fail (failure cases).

During this workshop (duration will depend on the size of the feature list, but 4 hours is a good start) all business features that will be part of the project or the sprint will be processed. The output of the workshop will be a list of attacks (abuse cases) for all business features. All abuse cases will have a risk rating that allows for filtering and prioritization.

It is important to take into account **Technical** and **Business** kind of abuse cases and mark them accordingly.

_Example:_

- Technical flagged abuse case: Add Cross Site Scripting injection into a comment input field.
- Business flagged abuse case: Ability to arbitrarily modify the price of an article in an online shop prior to passing an order causing the user to pay a lower amount for the wanted article.

##### When to define the list of Abuse Cases

In agile projects, the definition workshop must be made after the meeting in which User Stories are included in a Sprint.

In waterfall projects, the definition workshop must be made when the business features to implement are identified and known by the business.

Whatever the mode of the project used (agile or waterfall), the abuse cases selected to be addressed must become security requirements in each feature specification section (waterfall) or User Story acceptance criteria (agile) in order to allow additional cost/effort evaluation, identification and implementation of the countermeasures.

Each abuse case must have a unique identifier in order to allow tracking throughout the whole project/sprint (details about this point will be given in the proposal section).

An example of unique ID format can be **ABUSE_CASE_001**.

The following figure provides an overview of the chaining of the different steps involved (from left to right):

![Overview Schema](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Abuse_Case_Cheat_Sheet_Overview.png)

#### Proposal

The proposal will focus on the output of the workshop explained in the previous section.

##### Step 1: Preparation of the workshop

First, even if it seems obvious, the key business people must be sure to know, understand and be able to explain the business features that will be processed during the workshop.

Secondly, create a new Microsoft Excel file (you can also use Google Sheets or any other similar software) with the following sheets (or tabs):

- **FEATURES**
    - Will contain a table with the list of business features planned for the workshop.
- **ABUSE CASES**
    - Will contain a table with all abuse cases identified during the workshop.
- **COUNTERMEASURES**
    - Will contain a table with the list of possible countermeasures (light description) imagined for the abuse cases identified.
    - This sheet is not mandatory, but it can be useful (for an abuse case to know), if a fix is easy to implement and then can impact the risk rating.
    - Countermeasures can be identified by the AppSec profile during the workshop, because an AppSec person must be able to perform attacks but also to build or identify defenses (it is not always the case for the Pentester profile because this person's focus is generally on the attack side only, so, the combination Pentester + AppSec is very efficient to have a 360 degree view).

This is the representation of each sheet along with an example of content that will be filled during the workshop:

_FEATURES_ sheet:

| Feature unique ID |     Feature name      |           Feature short description           |
| :---------------: | :-------------------: | :-------------------------------------------: |
|    FEATURE_001    | DocumentUploadFeature | Allow user to upload document along a message |

_COUNTERMEASURES_ sheet:

| Countermeasure unique ID | Countermeasure short description                       | Countermeasure help/hint                                |
| ------------------------ | ------------------------------------------------------ | ------------------------------------------------------- |
| DEFENSE_001              | Validate the uploaded file by loading it into a parser | Use advice from the OWASP Cheat Sheet about file upload |

_ABUSE CASES_ sheet:

| Abuse case unique ID | Feature ID impacted | Abuse case's attack description | Attack referential ID (if applicable) | Business risk rating | CVSS severity and vector (if applicable) | Kind of abuse case | Countermeasure ID applicable | Handling decision (To Address or Risk Accepted) |
| ------------------- | ------------------- | ------------------------------ | ------------------------------------ | -------------------- | --------------------------------------- | ------------------ | ---------------------------- | ---------------------------------------------- |
| ABUSE_CASE_001 | FEATURE_001 | Upload Office file with malicious macro in charge of dropping a malware | CAPEC-17 | To be assessed | Not assigned | Technical | DEFENSE_001 | To Address |

##### Step 2: During the workshop

Use the spreadsheet to review all the features.

For each feature, follow this flow:

1. Key business people explain the current feature from a business point of view.
2. Penetration testers propose and explain a set of attacks that they can perform against the feature.
3. For each attack proposed:
   1. Appsec proposes a countermeasure and a preferred set up location (infrastructure, network, code, design...).
   2. Technical people give feedback about the feasibility of the proposed countermeasure.
   3. If an abuse case involves a specific vulnerability, penetration testers may record its Common Vulnerability Scoring System (CVSS) severity score and vector. [FIRST explains that CVSS measures severity and should not be used alone to assess risk](https://www.first.org/cvss/v3.1/user-guide#2-1-CVSS-Measures-Severity-not-Risk).
   4. Risk leaders assess the abuse case's likelihood and business impact using the organization's risk assessment method. Record this business risk rating and its rationale separately from any CVSS score; do not modify a CVSS score to represent business risk.

4. Business, Risk, and Technical leaders should find a consensus and filter the list of abuses for the current feature to keep the ones that must be addressed, and then flag them accordingly in the _ABUSE CASES_ sheet (**if risk is accepted then add a comment to explain why**).
5. Pass to next feature...

If the presence of penetration testers is not possible then you can use the following references to identify the applicable attacks on your features:

- [OWASP Automated Threats to Web Applications](https://owasp.org/www-project-automated-threats-to-web-applications/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/stable/)
- [OWASP Mobile Testing Guide](https://github.com/OWASP/owasp-mstg)
- [Common Attack Pattern Enumeration and Classification (CAPEC)](https://capec.mitre.org/)

Important note on attacks and countermeasure knowledge base(s):

```text
With time and experience across projects, you will obtain your own dictionary of attacks and countermeasures
that are applicable to the kind of application in your business domain.

This dictionary will speed up the future workshops in a significant way.

To promote the creation of this dictionary, you can, at the end of the project/sprint, gather the list
of attacks and countermeasures identified in a central location (wiki, database, file...) that will be
used during the next workshop in combination with input from penetration testers.
```

##### Step 3: After the workshop

The spreadsheet contains (at this stage) the list of all abuse cases that must be handled and, potentially (depending on the capacity) corresponding countermeasures.

Now, there are two remaining task:

1. Key business people must update the specification of each feature (waterfall) or the User Story of each feature (agile) to include the associated abuse cases as Security Requirements (waterfall) or Acceptance Criteria (agile).
2. Key technical people must evaluate the overhead in terms of expense/effort to take into account the countermeasure.

##### Step 4: During implementation - Abuse cases handling tracking

In order to track the handling of all the abuse cases, the following approach can be used:

If one or several abuse cases are handled at:

- **Design, Infrastructure or Network level**
    - Make a note in the documentation or schema to indicate that _This design/network/infrastructure takes into account the abuse cases ABUSE_CASE_001, ABUSE_CASE_002, ABUSE_CASE_xxx_.
- **Code level**
    - Put a special comment in the classes/scripts/modules to indicate that _This class/module/script takes into account the abuse cases ABUSE_CASE_001, ABUSE_CASE_002, ABUSE_CASE_xxx_.
    - Dedicated annotation like `@AbuseCase(ids={"ABUSE_CASE_001","ABUSE_CASE_002"})` can be used to facilitate tracking and allow identification into integrated development environment.

Using this way, it becomes possible (via some minor scripting) to identify where abuse cases are addressed.

##### Step 5: During implementation - Abuse cases handling validation

As abuse cases are defined, it is possible to put in place automated or manual validations to ensure that:

- All the selected abuse cases are handled.
- An abuse case is correctly/completely handled.

Validations can be of the following varieties:

- Automated (run regularly at commit, daily or weekly in the Continuous Integration Jobs of the project):
    - Custom audit rules in Static Application Security Testing (SAST) or Dynamic Application Security Testing (DAST) tools.
    - Dedicated unit, integration or functional security oriented tests.
    - ...
- Manual:
    - Security code review between project's peers during the design or implementation.
    - Provide the list of all abuse cases addressed to pentesters so that they may validate the protection efficiency for each abuse case during an intrusion test against the application (the pentester will validate that the attacks identified are no longer effective and will also try to find other possible attacks).
    - ...

Adding automated tests also allow teams to track the effectiveness of countermeasures against abuse cases and determine if the countermeasures are still in place during a maintenance or bug fixing phase of a project (to prevent accidental removal/disabling). It is also useful when a [Continuous Delivery](https://continuousdelivery.com/) approach is used, to ensure that all abuse cases protections are in place before opening access to the application.

#### Example of derivation of Abuse Cases as User Stories

The following section shows an example of derivation of Abuse Cases as User Stories, here using the [OWASP TOP 10](https://owasp.org/www-project-top-ten/) as input source.

Threat Oriented Personas:

- Malicious User
- Abusive User
- Unknowing User

##### A1:2017-Injection

_Epic:_

Almost any source of data can be an injection vector, environment variables, parameters, external and internal web services, and all types of users. [Injection](https://owasp.org/www-community/Injection_Flaws) flaws occur when an attacker can send hostile data to an interpreter.

_Abuse Case:_

As an attacker, I will perform an injection attack (SQL, LDAP, XPath, or NoSQL queries, OS commands, XML parsers, SMTP headers, expression languages, and ORM queries) against input fields of the User or API interfaces

##### A2:2017-Broken Authentication

_Epic:_

Attackers have access to hundreds of millions of valid username and password combinations for credential stuffing, default administrative account lists, automated brute force, and dictionary attack tools. Session management attacks are well understood, particularly in relation to unexpired session tokens.

_Abuse Case:_

As an attacker, I have access to hundreds of millions of valid username and password combinations for credential stuffing.

_Abuse Case:_

As an attacker, I have default administrative account lists, automated brute force, and dictionary attack tools I use against login areas of the application and support systems.

_Abuse Case:_

As an attacker, I manipulate session tokens using expired and fake tokens to gain access.

##### A3:2017-Sensitive Data Exposure

_Epic:_

Rather than directly attacking crypto, attackers steal keys, execute man-in-the-middle attacks, or steal clear text data off the server, while in transit, or from the user's client, e.g. browser. A manual attack is generally required. Previously retrieved password databases could be brute forced by Graphics Processing Units (GPUs).

_Abuse Case:_

As an attacker, I steal keys that were exposed in the application to get unauthorized access to the application or system.

_Abuse Case:_

As an attacker, I execute man-in-the-middle attacks to get access to traffic and leverage it to obtain sensitive data and possibly get unauthorized access to the application.

_Abuse Case:_

As an attacker, I steal clear text data off the server, while in transit, or from the user's client, e.g. browser to get unauthorized access to the application or system.

_Abuse Case:_

As an attacker, I find and target old or weak cryptographic algorithms by capturing traffic and breaking the encryption.

##### A4:2017-XML External Entities (XXE)

_Epic:_

Attackers can exploit vulnerable XML processors if they can upload XML or include hostile content in an XML document, exploiting vulnerable code, dependencies or integrations.

_Abuse Case:_

As an attacker, I exploit vulnerable areas of the application where the user or system can upload XML to extract data, execute a remote request from the server, scan internal systems, perform a denial-of-service attack, as well as execute other attacks.

_Abuse Case:_

As an attacker, I include hostile content in an XML document which is uploaded to the application or system to extract data, execute a remote request from the server, scan internal systems, perform a denial-of-service attack, as well as execute other attacks.

_Abuse Case:_

As an attacker, I include malicious XML code to exploit vulnerable code, dependencies or integrations to extract data, execute a remote request from the server, scan internal systems, perform a denial-of-service attack (e.g. Billion Laughs attack), as well as execute other attacks.

##### A5:2017-Broken Access Control

_Epic:_

Exploitation of access control is a core skill of attackers. Access control is detectable using manual means, or possibly through automation for the absence of access controls in certain frameworks.

_Abuse Case:_

As an attacker, I bypass access control checks by modifying the URL, internal application state, or the HTML page, or simply using a custom API attack tool.

_Abuse Case:_

As an attacker, I manipulate the primary key and change it to access another's users record, allowing viewing or editing someone else's account.

_Abuse Case:_

As an attacker, I manipulate sessions, access tokens, or other access controls in the application to act as a user without being logged in, or acting as an admin/privileged user when logged in as a user.

_Abuse Case:_

As an attacker, I leverage metadata manipulation, such as replaying or tampering with a JSON Web Token (JWT) access control token or a cookie or hidden field manipulated to elevate privileges or abusing JWT invalidation.

_Abuse Case:_

As an attacker, I exploit Cross-Origin Resource Sharing CORS misconfiguration allowing unauthorized API access.

_Abuse Case:_

As an attacker, I force browsing to authenticated pages as an unauthenticated user or to privileged pages as a standard user.

_Abuse Case:_

As an attacker, I access APIs with missing access controls for POST, PUT and DELETE.

_Abuse Case:_

As an attacker, I target default crypto keys in use, weak crypto keys generated or re-used, or keys where rotation is missing.

_Abuse Case:_

As an attacker, I find areas where the user agent (e.g. app, mail client) does not verify if the received server certificate is valid and perform attacks where I get unauthorized access to data.

##### A6:2017-Security Misconfiguration

_Epic:_

Attackers will often attempt to exploit unpatched flaws or access default accounts, unused pages, unprotected files and directories, etc to gain unauthorized access or knowledge of the system.

_Abuse Case:_

As an attacker, I find and exploit missing appropriate security hardening configurations on any part of the application stack, or improperly configured permissions on cloud services.

_Abuse Case:_

As an attacker, I find unnecessary features which are enabled or installed (e.g. unnecessary ports, services, pages, accounts, or privileges) and attack or exploit the weakness.

_Abuse Case:_

As an attacker, I use default accounts and their passwords to access systems, interfaces, or perform actions on components which I should not be able to.

_Abuse Case:_

As an attacker, I find areas of the application where error handling reveals stack traces or other overly informative error messages I can use for further exploitation.

_Abuse Case:_

As an attacker, I find areas where upgraded systems, latest security features are disabled or not configured securely.

_Abuse Case:_

As an attacker, I find security settings in the application servers, application frameworks (e.g. Struts, Spring, ASP.NET), libraries, databases, etc. not set to secure values.

_Abuse Case:_

As an attacker, I find the server does not send security headers or directives or are set to insecure values.

##### A7:2017-Cross-Site Scripting (XSS)

_Epic:_

XSS is the second most prevalent issue in the OWASP Top 10, and is found in around two-thirds of all applications.

_Abuse Case:_

As an attacker, I perform reflected XSS where the application or API includes unvalidated and unescaped user input as part of HTML output. My successful attack can allow the attacker to execute arbitrary HTML and JavaScript in my victim's browser. Typically the victim will need to interact with some malicious link that points to an attacker-controlled page, such as malicious watering hole websites, advertisements, or similar.

_Abuse Case:_

As an attacker, I perform stored XSS where the application or API stores unsanitized user input that is viewed at a later time by another user or an administrator.

_Abuse Case:_

As an attacker, I perform DOM XSS where JavaScript frameworks, single-page applications, and APIs that dynamically include attacker-controllable data to a page is vulnerable to DOM XSS.

##### A8:2017-Insecure Deserialization

_Epic:_

Exploitation of deserialization is somewhat difficult, as off-the-shelf exploits rarely work without changes or tweaks to the underlying exploit code.

_Abuse Case:_

As an attacker, I find areas of the application and APIs where deserialization of hostile or tampered objects can be supplied. As a result, I can focus on an object and data structure related attacks where the attacker modifies application logic or achieves arbitrary remote code execution if there are classes available to the application that can change behavior during or after deserialization. Or I focus on data tampering attacks such as access-control-related attacks where existing data structures are used but the content is changed.

##### A9:2017-Using Components with Known Vulnerabilities

_Epic:_

While it is easy to find already-written exploits for many known vulnerabilities, other vulnerabilities require concentrated effort to develop a custom exploit.

_Abuse Case:_

As an attacker, I find common open source or closed source packages with weaknesses and perform attacks against vulnerabilities and exploits which are disclosed

##### A10:2017-Insufficient Logging & Monitoring

_Epic:_

Exploitation of insufficient logging and monitoring is the bedrock of nearly every major incident. Attackers rely on the lack of monitoring and timely response to achieve their goals without being detected. In 2016, identifying a breach took an [average of 191 days](https://www-01.ibm.com/common/ssi/cgi-bin/ssialias?htmlfid=SEL03130WWEN) allowing substantial chance for damage to be inflicted.

_Abuse Case:_

As an attacker, I attack an organization and the logs, monitoring systems, and teams do not see or respond to my attacks.

### Sources of the schemas

All figures were created using <https://www.draw.io/> site and exported (as PNG image) for integration into this article.

All XML descriptor files for each schema are available below (using XML description, modification of the schema is possible using DRAW.IO site):

[Schemas descriptors archive](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Abuse_Case_Cheat_Sheet_SchemaBundle.zip)

## Secure Product Design

> **Source:** [Secure Product Design](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Product_Design_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

The purpose of Secure Product Design is to ensure that all products meet or exceed the security requirements laid down by the organization as part of the development lifecycle and to ensure that all security decisions made about the product being developed are explicit choices and result in the correct level of security for the product being developed.

### Methodology

As a basic start, establish secure defaults, minimize the attack surface area, and fail securely to those well-defined and understood defaults.

Secure Product Design comes about through two processes:

1. **_Product Inception_**; and
2. **_Product Design_**

The first process happens when a product is conceived, or when an existing product is being re-invented. The latter is continuous, evolutionary, and done in an agile way, close to where the code is being written.

### Security Principles

#### 1. The principle of Least Privilege and Separation of Duties

Least Privilege is a security principle that states that users should only be given the minimum amount of access necessary to perform their job. This means that users should only be given access to the resources they need to do their job, and no more. This helps to reduce the risk of unauthorized access to sensitive data or systems, as users are only able to access the resources they need. Least Privilege is an important security principle that should be followed in order to ensure the security of an organization's data and systems.

Separation of duties is a fundamental principle of internal control in business and organizations. It is a system of checks and balances that ensures that no single individual has control over all aspects of a transaction. This is done by assigning different tasks to different people, so that no one person has control over the entire process. This helps to reduce the risk of fraud and errors, as well as ensuring that all tasks are completed in a timely manner. Separation of duties is an important part of any organization's internal control system, and is essential for maintaining the integrity of the organization's financial records.

#### 2. The principle of Defense-in-Depth

The principle of Defense-in-Depth is a security strategy that involves multiple layers of security controls to protect an organization’s assets. It is based on the idea that if one layer of security fails, the other layers will still be able to protect the asset. The layers of security can include physical security, network security, application security, and data security. The goal of Defense-in-Depth is to create a secure environment that is resilient to attack and can quickly detect and respond to any security incidents. By implementing multiple layers of security, organizations can reduce the risk of a successful attack and minimize the damage caused by any successful attack.

#### 3. The principle of Zero Trust

Zero Trust is a security model that assumes that all users, devices, and networks are untrusted and must be verified before access is granted. It is based on the idea that organizations should not trust any user, device, or network, even if they are inside the organization’s network. Instead, all requests for access must be authenticated and authorized before access is granted. Zero Trust also requires organizations to continuously monitor and audit user activity to ensure that access is only granted to those who need it. This model is designed to reduce the risk of data breaches and other security incidents by ensuring that only authorized users have access to sensitive data.

#### 4. The principle of Security-in-the-Open

Security-in-the-Open is a concept that emphasizes the importance of security in open source software development. It focuses on the need for developers to be aware of the security implications of their code and to take steps to ensure that their code is secure. This includes using secure coding practices, testing for vulnerabilities, and using secure development tools. Security-in-the-Open also encourages developers to collaborate with security experts to ensure that their code is secure.

### Security Focus Areas

#### 1. Context

Where does this application under consideration fit into the ecosystem of the organization, which departments use it and for what reason? What kinds of data might it contain, and what is the risk profile as a result?

The processes employed to build the security context for an application include [Threat Modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) - which results in security related stories being added during **_Product Design_** at every iteration of _product delivery_ - and when performing a Business Impact Assessment - which results in setting the correct Product Security Levels for a given product during **_Product Inception_**.

Context is all important because over-engineering for security can have even greater cost implications than over-engineering for scale or performance, but under-engineering can have devastating consequences too.

#### 2. Components

From libraries in use by the application (selected during any **_Product Design_** stage) through to external services it might make use of (changing of which happen during **_Product Inception_**), what makes up this application and how are those parts kept secure? In order to do this we leverage a library of secure design patterns and ready to use components defined in your Golden Path / Paved Road documentation and by analyzing those choices through [Threat Modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html).

A part of this component review must also include the more commercial aspects of selecting the right components (licensing and maintenance) as well as the limits on usage that might be required.

#### 3. Connections

How do you interact with this application and how does it connect to those components and services mentioned before? Where is the data stored and how is it accessed? Connections can also describe any intentional lack of connections. Think about the segregation of tiers that might be required depending on the Product Security Levels required and the potential segregation of data or whole environments if required for different tenants.

Adding (or removing) connections is probably a sign that **_Product Inception_** is happening.

#### 4. Code

Code is the ultimate expression of the intention for a product and as such it must be functional first and foremost. But there is a quality to how that functionality is provided that must meet or exceed the expectations of it.

Some basics of secure coding include:

   1. Input validation: Check input types, formats, lengths, and business constraints before processing. For SQL data values, use [parameterized queries](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html#primary-defenses); input validation does not replace parameterization. Enforce buffer bounds separately when using memory-unsafe components.
   2. Error handling: Handle errors and exceptions in a secure manner, such as by logging them in a secure way and not disclosing sensitive information to an attacker.
   3. Authentication and Authorization: Implement strong authentication and authorization mechanisms to ensure that only authorized users can access sensitive data and resources.
   4. Cryptography: Use cryptographic functions and protocols to protect data in transit and at rest, such as HTTPS and encryption - the expected levels for a given Product Security Level can often be found by reviewing your Golden Path / Paved Road documentation.
   5. Least privilege: Use the principle of the least privilege when writing code, such that the code and the system it runs on are given the minimum access rights necessary to perform their functions.
   6. Secure memory management: Use high-level languages recommended in your Golden Path / Paved Road documentation or properly manage memory to prevent memory-related vulnerabilities such as buffer overflows and use-after-free.
   7. Avoiding hardcoded secrets: Hardcoded secrets such as passwords and encryption keys should be avoided in the code and should be stored in a secure storage.
   8. Security testing: Test the software for security vulnerabilities during development and just prior to deployment.
   9. Auditing and reviewing the code: Regularly audit and review the code for security vulnerabilities, such as by using automated tools or having a third party review the code.
   10. Keeping up-to-date: Keep the code up-to-date with the latest security best practices and vulnerability fixes to ensure that the software is as secure as possible.

Ensure that you integrate plausibility checks at each tier of your application (e.g., from frontend to backend) and ensure that you write unit and integration tests to validate that all threats discovered during [Threat Modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) have been mitigated to a level of risk acceptable to the organization. Use that to compile use-cases and [abuse-cases](https://cheatsheetseries.owasp.org/cheatsheets/Abuse_Case_Cheat_Sheet.html) for each tier of your application.

#### 5. Configuration

Building an application securely can all too easily be undone if it's not securely configured. At a minimum we should ensure the following:

1. Bearing in mind the principle of Least Privilege: Limit the access and permissions of system components and users to the minimum required to perform their tasks.
2. Remembering Defense-in-Depth: Implement multiple layers of security controls to protect against a wide range of threats.
3. Ensuring Secure by Default: Configure systems and software to be secure by default, with minimal manual setup or configuration required.
4. Secure Data: Protect sensitive data, such as personal information and financial data, by encrypting it in transit and at rest. Protecting that data also means ensuring it's correctly backed up and that the data retention is set correctly for the desired Product Security Level.
5. Plan to have the configuration Fail Securely: Design systems to fail in a secure state, rather than exposing vulnerabilities when they malfunction.
6. Always use Secure Communications: Use secure protocols for communication, such as HTTPS, to protect against eavesdropping and tampering.
7. Perform regular updates - or leverage [maintained images](https://www.cisecurity.org/cis-hardened-images): Keeping software, docker images and base operating systems up-to-date with the [latest security patches](https://csrc.nist.gov/publications/detail/sp/800-40/rev-4/final) is an essential part of maintaining a secure system.
8. Have a practiced Security Incident response plan: Having a plan in place for how to respond to a security incident is essential for minimizing the damage caused by any successful attack and a crucial part of the Product Support Model.

Details of how to precisely ensure secure configuration can be found in [Infrastructure as Code Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Infrastructure_as_Code_Security_Cheat_Sheet.html)

## Secure Code Review

> **Source:** [Secure Code Review](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Code_Review_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

**Secure Code Review** is the process of manually examining source code to identify security vulnerabilities that automated tools often miss. It involves analyzing application logic, data flow, and implementation details to detect security flaws that require human expertise and contextual understanding.

**Manual Code Review** complements automated security testing tools (SAST/DAST) by focusing on areas where human analysis provides the most value, including business logic validation, complex security implementations, and context-specific vulnerabilities. While automated tools can assist by highlighting potential areas of concern, the core analysis relies on human judgment and domain expertise.

**Security-Focused Review** differs from functional code review by specifically targeting security concerns such as input validation, authentication mechanisms, authorization controls, cryptographic implementations, and potential attack vectors.

#### Review Types

**Baseline Reviews** examine the entire codebase comprehensively. Use for:

- New applications or major releases
- Legacy system onboarding
- Compliance requirements
- Post-incident analysis

**Diff-Based Reviews** focus on code changes only. Use for:

- Pull requests and commits
- Daily development workflow
- Feature completion
- Continuous security validation

This cheat sheet provides practical guidance for conducting effective manual security code reviews, with emphasis on both baseline and incremental review methodologies.

### Review Methodology

#### Preparation

**For All Reviews:**

- Understand application architecture and business requirements
- Gather [threat models](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) and previous security findings
- Identify critical assets and high-risk functions
- Review security requirements and documentation

**Additional for Baseline Reviews:**

- Map complete [application boundaries and dependencies](https://cheatsheetseries.owasp.org/cheatsheets/Attack_Surface_Analysis_Cheat_Sheet.html)
- Analyze overall security architecture
- Review security incident history
- Audit all third-party libraries

**Additional for Diff-Based Reviews:**

- Identify modified files and affected components
- Assess impact on existing security controls
- Understand purpose of changes
- Prioritize high-risk modifications

#### Review Process

**Baseline Review Steps:**

1. Architecture review for security anti-patterns
2. Entry point analysis and input validation
3. Authentication and authorization verification
4. Data flow tracing
5. Business logic analysis
6. Cryptographic implementation review
7. Error handling verification
8. Configuration and deployment review

**Diff-Based Review Steps:**

1. Analyze impact on existing security controls
2. Identify new attack vectors
3. Verify security at modified trust boundaries
4. Check new integrations
5. Ensure no security regression
6. Apply relevant security patterns

### Common Vulnerability Patterns

For request forgery and redirect checks, also consult the [CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html), and [Unvalidated Redirects and Forwards](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) cheat sheets.

#### Input Validation Vulnerabilities

Check for missing server-side validation, improper sanitization, and weak input filtering. For more information, see [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) and [Mass Assignment Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html).

#### Injection Vulnerabilities

**SQL Injection:**

Look for string concatenation in database queries and unsafe query construction. For more information, see [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).

**Cross-Site Scripting (XSS):**

Review output encoding, DOM manipulation, and user input rendering. For more information, see [Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

**Path Traversal:**

Check for unsafe file path construction and directory traversal vulnerabilities. For more information, see [File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

**Command Injection:**

Identify direct command execution with user input and unsafe system calls. For more information, see [OS Command Injection Defense Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html).

**NoSQL Injection:**

Examine NoSQL query construction and parameter binding. For more information, see [NoSQL Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html).

#### Authentication & Session Management Vulnerabilities

Review authentication mechanisms, session token generation, and user credential handling. For more information, refer to [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) and [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

#### Access Control Vulnerabilities

Examine authorization checks, role-based access controls, and privilege escalation prevention. For more information, see [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

#### Deserialization Vulnerabilities

**Insecure Deserialization:**

Check for unsafe deserialization of untrusted data and object injection vulnerabilities. For more information, see [Deserialization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html).

**XML External Entity (XXE):**

Review XML parsing configurations and external entity processing. For more information, see [XML External Entity Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html).

#### Cryptographic Implementation Flaws

Examine encryption algorithms, key management, and cryptographic implementations. For more information, refer to [Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).

### Review Techniques

#### Code Pattern Analysis

Focus on high-risk code patterns:

- Input processing and validation functions
- Database query construction and ORM usage
- File operations and path handling
- Authentication and session management logic
- Authorization and access control checks
- Cryptographic operations and key management
- Error handling and logging mechanisms
- Configuration loading and environment variables

#### Data Flow Analysis

Trace data through the application:

1. **Identify Sources**: User inputs, file uploads, API calls, database reads, environment variables
2. **Follow Processing**: Validation, transformation, business logic, caching
3. **Check Sinks**: Database queries, file writes, output rendering, logging, external APIs
4. **Validate Boundaries**: Input validation and output encoding at trust boundaries
5. **Trust Zones**: Verify security controls at each trust boundary crossing
6. **Data Classification**: Ensure sensitive data receives appropriate protection

#### Threat-Based Review

Align review with common attack patterns:

- **OWASP Top 10**: Focus on prevalent web application risks
- **STRIDE Model**: Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation
- **Attack Trees**: Map potential attack paths through the application
- **Abuse Cases**: Consider how features could be misused by attackers
- **Security Controls**: Verify defense-in-depth implementation

#### Business Logic Review

Use the [Abuse Case Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Abuse_Case_Cheat_Sheet.html) to identify misuse scenarios.

Analyze application workflows for:

- State management and transition validation
- Race conditions and concurrency issues
- Transaction integrity and rollback mechanisms
- Resource limits and quota enforcement
- Authorization at each workflow step
- Workflow bypass opportunities

### Review Checklists

#### Input Validation

- [ ] **Server-side validation**: All inputs validated on server regardless of client-side checks
- [ ] **Allowlist validation**: Uses allowlists rather than blocklists for input validation
- [ ] **Output encoding**: Context-appropriate encoding (HTML, JavaScript, CSS, URL)
- [ ] **File upload security**: Content-based validation, size limits, safe storage
- [ ] **SQL injection prevention**: [Parameterized queries or safely implemented stored procedures](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html#primary-defenses) used, with user-controlled data values passed as parameters instead of concatenated into SQL
- [ ] **Length limits**: Input length restrictions enforced
- [ ] **Character handling**: Special characters and Unicode properly processed
- [ ] **Error messages**: No sensitive information disclosed in error responses

#### Authentication & Session Management

- [ ] **Password security**: Strong hashing algorithms and salt usage (for more information, see [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html))
- [ ] **Account protection**: Lockout mechanisms with appropriate thresholds
- [ ] **Session management**: Secure token generation (≥128 bits entropy)
- [ ] **Session lifecycle**: Proper invalidation on logout/timeout
- [ ] **Re-authentication**: Required for sensitive operations
- [ ] **Multi-factor authentication**: Implementation for high-risk accounts (for more information, see [Multifactor Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html))
- [ ] **Password reset**: Secure, time-limited reset mechanisms (for more information, see [Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html))
- [ ] **Session security**: HttpOnly, Secure, SameSite cookie attributes
- [ ] **Concurrent sessions**: Appropriate limits and monitoring

#### Authorization

- [ ] **Server-side enforcement**: All access controls enforced server-side
- [ ] **Fail-safe defaults**: Default deny access policy
- [ ] **IDOR prevention**: Proper authorization for resource access (see [Insecure Direct Object Reference Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html))
- [ ] **Function-level controls**: Administrative functions properly protected
- [ ] **Role validation**: Role assignments cannot be manipulated
- [ ] **Privilege escalation**: Horizontal and vertical escalation prevented
- [ ] **Centralized decisions**: Access control logic centralized
- [ ] **Post-authentication checks**: Authorization verified after authentication

#### Cryptography

- [ ] **Strong algorithms**: Modern algorithms (AES-256, RSA-2048+, ECDSA P-256+)
- [ ] **Key management**: Proper key generation, storage, and rotation (for more information, see [Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html))
- [ ] **Certificate validation**: Proper validation including hostname verification
- [ ] **Random generation**: Cryptographically secure random number generation
- [ ] **Data protection**: Encryption at rest and in transit
- [ ] **IV/Nonce handling**: Follow the selected mode's requirements for initialization vectors (IVs) and nonces. For example, [cipher block chaining (CBC) requires unpredictable IVs](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf#page=27), while [Galois/Counter Mode (GCM) requires IV uniqueness under each key](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf#page=26) and permits deterministic generation
- [ ] **Library maintenance**: Up-to-date cryptographic libraries
- [ ] **Side-channel protection**: Consideration of timing and other side-channel attacks

#### Business Logic

- [ ] **Workflow integrity**: Proper state validation in multi-step processes
- [ ] **Race condition prevention**: Synchronization in concurrent operations
- [ ] **Transaction atomicity**: Proper rollback and consistency mechanisms
- [ ] **Resource limits**: Rate limiting and resource quotas implemented (see [Denial of Service Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html))
- [ ] **Business rule enforcement**: Cannot bypass rules through direct API access

#### Configuration & Deployment

- [ ] **Secure defaults**: Security-focused default configurations
- [ ] **Environment separation**: Proper isolation between environments
- [ ] **Secrets management**: No hardcoded secrets, proper secret storage and rotation (for more information, see [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html))
- [ ] **Error handling**: Graceful error handling without information disclosure (for more information, see [Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html))
- [ ] **Logging security**: Sensitive data not logged, proper log protection (for more information, see [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html))
- [ ] **Security headers**: Appropriate HTTP security headers configured (for more information, see [HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html))
- [ ] **TLS configuration**: Strong cipher suites and protocol versions (for more information, see [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html))
- [ ] **Dependency management**: Up-to-date libraries without known vulnerabilities (for more information, see [Vulnerable Dependency Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html))

#### Security Monitoring

- [ ] **Security events**: Authentication failures, authorization violations logged
- [ ] **Anomaly detection**: Unusual patterns and behaviors monitored
- [ ] **Audit trails**: Complete audit logs for sensitive operations
- [ ] **Real-time alerts**: Critical security events trigger immediate notifications
- [ ] **Log integrity**: Logs protected from tampering and unauthorized access
- [ ] **Incident response**: Clear procedures for security incident handling

### Tools and Techniques

#### Code Editors

Use editors with security extensions:

- Visual Studio Code with ESLint, SonarLint
- IntelliJ IDEA with SpotBugs, SonarLint
- Eclipse with security plugins
- Vim/Neovim with security linters

#### Command-Line Pattern Detection

```bash
# Find hardcoded secrets
grep -ri "password\s*=\|api_key\s*=\|secret\s*=" source/

# Find unsafe functions
grep -r "eval(\|exec(\|innerHTML\|document\.write" source/

# Find potential injections
grep -r "SELECT.*+\|executeQuery.*+" source/
```

#### Manual Review Focus Areas

**Human Expertise Advantages:**

- **Business Logic Flaws**: Complex workflows and state management issues that require domain understanding
- **Context-Specific Vulnerabilities**: Security issues that depend on application-specific business rules
- **Authorization Logic**: Complex permission models and access control implementations
- **Race Conditions**: Timing-based vulnerabilities in concurrent operations
- **Cryptographic Misuse**: Proper implementation of cryptographic primitives and protocols
- **Architecture Security**: High-level design flaws and security anti-patterns

**Manual Analysis Techniques:**

- **Code Path Tracing**: Following execution paths through complex business logic
- **State Analysis**: Understanding application state transitions and validation
- **Trust Boundary Mapping**: Identifying and analyzing security control points
- **Threat Modeling Integration**: Applying threat models to specific code implementations
- **Attack Scenario Simulation**: Mentally simulating attack paths through the code

#### Automated Tool Integration

**Supporting Manual Reviews:**

- **SAST Tool Triage**: Use automated findings to prioritize manual review areas
- **Dependency Scanning**: Identify vulnerable libraries requiring manual assessment
- **Code Quality Metrics**: Focus manual effort on complex or frequently changed code
- **Pattern Detection**: Use tools to highlight potential security anti-patterns for human analysis

**Tool Integration Strategy:**

- **Pre-Review Scanning**: Run automated tools before manual review to identify obvious issues
- **Complementary Analysis**: Use tool findings to guide deeper manual investigation
- **False Positive Filtering**: Apply human judgment to validate automated findings
- **Coverage Gaps**: Focus manual review on areas automated tools cannot effectively analyze

**Security Metrics:**

- **Manual Review Coverage**: Percentage of critical code paths reviewed by humans
- **Finding Quality**: Ratio of valid security issues to total findings
- **Review Efficiency**: Time spent on manual review vs. security value delivered
- **Trend Analysis**: Security posture improvement over time

#### Documentation Templates

**Finding Report Template:**

```text
Title: [Vulnerability Type] in [Component]
Severity: [Critical/High/Medium/Low]
CWE: [CWE Number and Name]
Location: [File:Line or Function]
Description: [Detailed explanation of the vulnerability]
Impact: [Security implications and potential attack scenarios]
Reproduction: [Steps to reproduce or proof of concept]
Recommendation: [Specific fix guidance with code examples]
References: [CWE links, OWASP references, vendor documentation]
Status: [Open/In Progress/Fixed/Accepted Risk]
Assignee: [Developer responsible for fix]
Due Date: [Target fix date]
```

**Review Summary Template:**

```text
Review Summary
==============
Application: [Application Name]
Version: [Version/Commit Hash]
Reviewer(s): [Names]
Review Date: [Date]
Scope: [Files/Components Reviewed]

Findings Summary:
- Critical: [Count]
- High: [Count]
- Medium: [Count]
- Low: [Count]
- Informational: [Count]

Key Recommendations:
1. [Priority recommendation]
2. [Priority recommendation]
3. [Priority recommendation]

Overall Risk Assessment: [Low/Medium/High/Critical]
```

### Integration with SDLC

#### Review Timing

##### Baseline Review Integration

- **Project Initiation**: Comprehensive security assessment of existing codebase
- **Major Releases**: Full security review before significant version releases
- **Architecture Changes**: Complete review when fundamental design changes occur
- **Compliance Cycles**: Periodic comprehensive reviews for regulatory requirements
- **Security Incidents**: Thorough review following security breaches or major vulnerabilities
- **Onboarding Legacy Systems**: Initial security assessment when bringing existing applications under secure development practices

##### Diff-Based Review Integration

- **Pull Requests**: Security-focused review of code changes as part of standard PR process
- **Pre-commit Hooks**: Lightweight security checks on developer commits
- **Feature Completion**: Security review of completed user stories or features
- **Sprint Reviews**: Regular assessment of security implications of sprint deliverables
- **Hotfix Reviews**: Rapid security assessment of emergency fixes
- **Continuous Integration**: Automated triggering of security reviews based on code changes

##### Hybrid Approach

- **Risk-Based Scheduling**: Combine baseline reviews for high-risk components with diff-based reviews for routine changes
- **Incremental Baseline Updates**: Gradually expand baseline review coverage over multiple development cycles
- **Trigger-Based Reviews**: Escalate from diff-based to baseline review when significant security concerns are identified

For CI/CD integration and automated security testing, for more information see [CI CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html).

#### Team Collaboration

**Roles:**

- **Security reviewers**: Conduct analysis and provide guidance
- **Developers**: Implement fixes and follow secure coding practices
- **Security champions**: Bridge security and development teams

**Best Practices:**

- Use standardized checklists and templates
- Maintain a knowledge base of common issues
- Track metrics on review effectiveness
- Provide regular security training
- Integrate with existing development workflows

### Advanced Techniques

#### Race Condition Analysis

Focus on Time-of-Check vs Time-of-Use (TOCTOU) vulnerabilities and ensure atomic operations.

#### Business Logic Analysis

Analyze workflows for:

- State transitions and validation
- Opportunities to bypass steps or validation
- Proper validation at each workflow step
- Rollback mechanisms and cleanup on failures
- Behavior under concurrent access
- Boundary conditions and error scenarios

#### Security Architecture Review

Review architecture patterns for consistent security enforcement and proper API security controls; see the [Secure Product Design Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Product_Design_Cheat_Sheet.html).

#### Memory Safety

Review buffer management, integer overflow protection, and resource limits.
