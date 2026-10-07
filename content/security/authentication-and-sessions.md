---
title: "Authentication and Sessions"
order: 4
summary: "Proving who a user is and remembering it: login and its patterns, password storage, MFA, passkeys, password reset and security questions, credential stuffing, sessions, cookies, JWT, OAuth 2.0 and SAML."
category: "Security"
level: Intermediate
---

# Authentication and Sessions

Proving who a user is and remembering it: login and its patterns, password storage, MFA, passkeys, password reset and security questions, credential stuffing, sessions, cookies, JWT, OAuth 2.0 and SAML.

## Authentication

> **Source:** [Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

**Authentication** (**AuthN**) is the process of verifying that an individual, entity, or website is who or what it claims to be by determining the validity of one or more authenticators (like passwords, fingerprints, or security tokens) that are used to back up this claim.

**Digital Identity** is the unique representation of a subject engaged in an online transaction. A digital identity is always unique in the context of a digital service but does not necessarily need to be traceable back to a specific real-life subject.

**Identity Proofing** establishes that a subject is actually who they claim to be. This concept is related to KYC concepts and it aims to bind a digital identity with a real person.

**Session Management** is a process by which a server maintains the state of an entity interacting with it. This is required for a server to remember how to react to subsequent requests throughout a transaction. Sessions are maintained on the server by a session identifier which can be passed back and forth between the client and server when transmitting and receiving requests. Sessions should be unique per user and computationally very difficult to predict. The [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) contains further guidance on the best practices in this area.

### Authentication General Guidelines

#### User IDs

The primary function of a User ID is to uniquely identify a user within a system. Ideally, User IDs should be randomly generated to prevent the creation of predictable or sequential IDs, which could pose a security risk, especially in systems where User IDs might be exposed or inferred from external sources.

#### Usernames

Usernames are easy-to-remember identifiers chosen by the user and used for identifying themselves when logging into a system or service. The terms User ID and username might be used interchangeably if the username chosen by the user also serves as their unique identifier within the system.

Users should be permitted to use their email address as a username, provided the email is verified during sign-up. Additionally, they should have the option to choose a username other than an email address. For information on validating email addresses, please visit the [input validation cheat sheet email discussion](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#email-address-validation).

#### Authentication Solution and Sensitive Accounts

- Do **NOT** allow login with sensitive accounts (i.e. accounts that can be used internally within the solution such as to a backend / middleware / database) to any front-end user interface
- Do **NOT** use the same authentication solution (e.g. IDP / AD) used internally for unsecured access (e.g., public access / DMZ)

#### Implement Proper Password Strength Controls

A key concern when using passwords for authentication is password strength. A "strong" password policy makes it difficult or even improbable for one to guess the password through either manual or automated means. The following characteristics define a strong password:

- Password Length
    - **Minimum** length for passwords should be enforced by the application.
        - If MFA is enabled passwords **shorter than 8 characters** are considered to be weak ([NIST SP800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver)).
        - If MFA is not enabled passwords **shorter than 15 characters** are considered to be weak ([NIST SP800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver)).
    - **Maximum** password length should be **at least 64 characters** to allow passphrases ([NIST SP800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordlength)). Note that certain implementations of hashing algorithms may cause [long password denial of service](https://www.acunetix.com/vulnerabilities/web/long-password-denial-of-service/).
    - Longer passphrases are effective because they raise the number of guesses an attacker's dictionary or wordlist has to cover, not because of a precise entropy value: NIST notes that "estimating entropy for user-chosen passwords is challenging" and recommends length and blocklist checks (see below) over composition or entropy math ([NIST SP800-63B, Strength of Passwords](https://pages.nist.gov/800-63-4/sp800-63b/passwords/#appA)). Entropy estimates rely on assumptions about the search space and should be treated as illustrative rather than as absolute measures of password strength.
    - Attackers commonly use password guessing techniques that leverage common-password dictionaries and password lists, and may use previously compromised credentials in credential stuffing attacks. These behaviors are reflected in [MITRE ATT&CK T1110 – Brute Force](https://attack.mitre.org/techniques/T1110/), including Password Guessing, Password Spraying, and Credential Stuffing. Screening passwords against blocklists helps prevent users from selecting passwords that are commonly used or already known to attackers, as recommended by [NIST SP 800-63B – Passwords](https://pages.nist.gov/800-63-4/sp800-63b/passwords/).
- Do not silently truncate passwords. The [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#input-limits-of-bcrypt) provides further guidance on how to handle passwords that are longer than the maximum length.
- Allow usage of **all** characters including unicode and whitespace. There should be no password composition rules limiting the type of characters permitted. There should be no requirement for upper or lower case or numbers or special characters.
- Ensure credential rotation when a password leak occurs, at the time of compromise identification or when authenticator technology changes. Avoid requiring periodic password changes; instead, encourage users to pick strong passwords and enable [Multifactor Authentication Cheat Sheet (MFA)](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html). According to NIST guidelines, verifiers should not mandate arbitrary password changes (e.g., periodically).
- Include a password strength meter to help users create a more complex password
    - [zxcvbn-ts library](https://github.com/zxcvbn-ts/zxcvbn) can be used for this purpose.
    - Other language implementations of zxcvbn [listed here](https://github.com/dropbox/zxcvbn?tab=readme-ov-file); however check the age and maturity of each example before use.
- Block common and previously breached passwords
    - [Pwned Passwords](https://haveibeenpwned.com/Passwords) is a service where passwords can be checked against previously breached passwords. Details on the API [are here](https://haveibeenpwned.com/API/v3#PwnedPasswords).
    - Alternatively, you can download the [Pwned Passwords](https://haveibeenpwned.com/Passwords) database [using this mechanism](https://github.com/HaveIBeenPwned/PwnedPasswordsDownloader?tab=readme-ov-file#what-is-haveibeenpwned-downloader) to host it yourself.
    - Other top password lists are available but there is no guarantee as to how updated they are:
        - [Various password lists](https://github.com/danielmiessler/SecLists/tree/master/Passwords) hosted by SecLists from Daniel Miessler.

##### For more detailed information check

- [ASVS v5.0 Password Security Requirements](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x15-V6-Authentication.md#v62-password-security)
- [Passwords Evolved: Authentication Guidance for the Modern Era](https://www.troyhunt.com/passwords-evolved-authentication-guidance-for-the-modern-era/)

#### Implement Secure Password Recovery Mechanism

It is common for an application to have a mechanism that provides a means for a user to gain access to their account in the event they forget their password. Please see [Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) for details on this feature.

#### Store Passwords in a Secure Fashion

It is critical for an application to store a password using the right cryptographic technique. Please see [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) for details on this feature.

#### Compare Password Hashes Using Safe Functions

Where possible, the user-supplied password should be compared to the stored password hash using a secure password comparison function provided by the language or framework, such as the [password_verify()](https://www.php.net/manual/en/function.password-verify.php) function in PHP. Where this is not possible, ensure that the comparison function:

- Has a maximum input length, to protect against denial of service attacks with very long inputs.
- Explicitly sets the type of both variables, to protect against type confusion attacks such as Magic Hashes in PHP.
- Returns in constant time, to protect against timing attacks.

#### Change Password Feature

When developing a change password feature, ensure to have:

- The user is authenticated with an active session.
- Current password verification. This is to ensure that it's the legitimate user who is changing the password. Consider this abuse case: a user logs in on a public computer and forgets to log out. Another person could then use that active session. If we don't verify the current password, this other person may be able to change the password.

#### Transmit Passwords Only Over TLS or Other Strong Transport

See: [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html)

The login page and all subsequent authenticated pages must be exclusively accessed over TLS or other strong transport. Failure to utilize TLS or other strong transport for the login page allows an attacker to modify the login form action, causing the user's credentials to be posted to an arbitrary location. Failure to utilize TLS or other strong transport for authenticated pages after login enables an attacker to view the unencrypted session ID and compromise the user's authenticated session.

#### Require Re-authentication for Sensitive Features

In order to mitigate CSRF and session hijacking, it's important to require the current credentials for an account before updating sensitive account information such as the user's password or email address -- or before sensitive transactions, such as shipping a purchase to a new address. Without this countermeasure, an attacker may be able to execute sensitive transactions through a CSRF or XSS attack without needing to know the user's current credentials. Additionally, an attacker may get temporary physical access to a user's browser or steal their session ID to take over the user's session.

#### Re-authentication After Risk Events

**Overview:**
Re-authentication is critical when an account has experienced high-risk activity such as account recovery, password resets, or suspicious behavior patterns. This section outlines when and how to trigger re-authentication to protect users and prevent unauthorized access. For further details, see the [Require Re-authentication for Sensitive Features](#require-re-authentication-for-sensitive-features) section.

##### When to Trigger Re-authentication

- **Suspicious Account Activity**
  When unusual login patterns, IP address changes, or device enrollments occur
- **Account Recovery**
  After users reset their passwords or change sensitive account details
- **Critical Actions**
  For high-risk actions like changing payment details or adding new trusted devices

##### Re-authentication Mechanisms

- **Adaptive Authentication**
  Use risk-based authentication models that adapt to the user's behavior and context
- **Multi-Factor Authentication (MFA)**
  Require an additional layer of verification for sensitive actions or events
- **Bound Authenticators**
  Require an authenticator already bound to the account, such as the current password or a passkey. Do not substitute security questions, which are excluded by [ASVS 6.4.2](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x15-V6-Authentication.md#v64-authentication-factor-lifecycle-and-recovery).

##### Implementation Recommendations

- **Minimize User Friction**
  Ensure that re-authentication does not disrupt the user experience unnecessarily
- **Context-Aware Decisions**
  Make re-authentication decisions based on context (e.g., geolocation, device type, prior patterns)
- **Secure Session Management**
  Invalidate sessions after re-authentication and rotate tokens—see the [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

#### Consider Strong Transaction Authentication

Some applications should use a second factor to check whether a user may perform sensitive operations. For more information, see the [Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html).

##### TLS Client Authentication

TLS Client Authentication, also known as two-way TLS authentication, consists of both browser and server sending their respective TLS certificates during the TLS handshake process. Just as you can validate the authenticity of a server by using the certificate and asking a verifiably-valid Certificate Authority (CA) if the certificate is valid, the server can authenticate the user by receiving a certificate from the client and validating against a third-party CA or its own CA. To do this, the server must provide the user with a certificate generated specifically for him, assigning values to the subject so that these can be used to determine what user the certificate should validate. The user installs the certificate on a browser and now uses it for the website.

This approach is appropriate when:

- It is acceptable (or even preferred) that the user has access to the website only from a single computer/browser.
- The user is not easily scared by the process of installing TLS certificates on their browser, or there will be someone, probably from IT support, who will do this for the user.
- The website requires an extra step of security.
- It is also a good thing to use when the website is for an intranet of a company or organization.

It is generally not a good idea to use this method for widely and publicly available websites that will have an average user. For example, it wouldn't be a good idea to implement this for a website like Facebook. While this technique can prevent the user from having to type a password (thus protecting against an average keylogger from stealing it), it is still considered a good idea to consider using both a password and TLS client authentication combined.

Additionally, if the client is behind an enterprise proxy that performs SSL/TLS decryption, this will break certificate authentication unless the site is allowed on the proxy.

For more information, see: [Client-authenticated TLS handshake](https://en.wikipedia.org/wiki/Transport_Layer_Security#Client-authenticated_TLS_handshake)

#### Authentication and Error Messages

Incorrectly implemented error messages in the case of authentication functionality can be used for the purposes of user ID and password enumeration. An application should respond (both HTTP and HTML) in a generic manner.

##### Authentication Responses

Using any of the authentication mechanisms (login, password reset, or password recovery), an application must respond with a generic error message regardless of whether:

- The user ID or password was incorrect.
- The account does not exist.
- The account is locked or disabled.

The account registration feature should also be taken into consideration, and the same approach of a generic error message can be applied regarding the case in which the user exists.

The objective is to prevent the creation of a [discrepancy factor](https://cwe.mitre.org/data/definitions/204.html), allowing an attacker to mount a user enumeration action against the application.

It is interesting to note that the business logic itself can bring a discrepancy factor related to the processing time taken. Indeed, depending on the implementation, the processing time can be significantly different according to the case (success vs failure) allowing an attacker to mount a [time-based attack](https://en.wikipedia.org/wiki/Timing_attack) (delta of some seconds for example).

Example using pseudo-code for a login feature:

- First implementation using the "quick exit" approach

```text
IF USER_EXISTS(username) THEN
    password_hash=HASH(password)
    IS_VALID=LOOKUP_CREDENTIALS_IN_STORE(username, password_hash)
    IF NOT IS_VALID THEN
        RETURN Error("Invalid Username or Password!")
    ENDIF
ELSE
   RETURN Error("Invalid Username or Password!")
ENDIF
```

It can be clearly seen that if the user doesn't exist, the application will directly throw an error. Otherwise, when the user exists and the password doesn't, it is apparent that there will be more processing before the application errors out. In return, the response time will be different for the same error, allowing the attacker to differentiate between a wrong username and a wrong password.

- Second implementation without relying on the "quick exit" approach:

```text
password_hash=HASH(password)
IS_VALID=LOOKUP_CREDENTIALS_IN_STORE(username, password_hash)
IF NOT IS_VALID THEN
   RETURN Error("Invalid Username or Password!")
ENDIF
```

This code will go through the same process no matter what the user or the password is, allowing the application to return in approximately the same response time.

The problem with returning a generic error message for the user is a User Experience (UX) matter. A legitimate user might feel confused with the generic messages, thus making it hard for them to use the application, and might after several retries, leave the application because of its complexity. The decision to return a *generic error message* can be determined based on the criticality of the application and its data. For example, for critical applications, the team can decide that under the failure scenario, a user will always be redirected to the support page and a *generic error message* will be returned.

Regarding the user enumeration itself, protection against [brute-force attacks](#protect-against-automated-attacks) is also effective because it prevents an attacker from applying the enumeration at scale. Usage of [CAPTCHA](https://en.wikipedia.org/wiki/CAPTCHA) can be applied to a feature for which a *generic error message* cannot be returned because the *user experience* must be preserved.

###### Incorrect and correct response examples

###### Login

Incorrect response examples:

- "Login for User foo: invalid password."
- "Login failed, invalid user ID."
- "Login failed; account disabled."
- "Login failed; this user is not active."

Correct response example:

- "Login failed; Invalid user ID or password."

###### Password recovery

Incorrect response examples:

- "We just sent you a password reset link."
- "This email address doesn't exist in our database."

Correct response example:

- "If that email address is in our database, we will send you an email to reset your password."

###### Account creation

Incorrect response examples:

- "This user ID is already in use."
- "Welcome! You have signed up successfully."

Correct response example:

- "A link to activate your account has been emailed to the address provided."

###### Error Codes and URLs

The application may return a different [HTTP Error code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) depending on the authentication attempt response. It may respond with a 200 for a positive result and a 403 for a negative result. Even though a generic error page is shown to a user, the HTTP response code may differ which can leak information about whether the account is valid or not.

Error disclosure can also be used as a discrepancy factor, consult the [error handling cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html) regarding the global handling of different errors in an application.

#### Protect Against Automated Attacks

There are a number of different types of automated attacks that attackers can use to try and compromise user accounts. The most common types are listed below:

| Attack Type         | Description                                                                                      |
|---------------------|--------------------------------------------------------------------------------------------------|
| Brute Force         | Testing multiple passwords from a dictionary or other source against a single account.           |
| Credential Stuffing | Testing username/password pairs obtained from the breach of another site.                        |
| Password Spraying   | Testing a single weak password against a large number of different accounts.                     |

Different protection mechanisms can be implemented to protect against these attacks. In many cases, these defenses do not provide complete protection, but when a number of them are implemented in a defense-in-depth approach, a reasonable level of protection can be achieved.

The following sections will focus primarily on preventing brute-force attacks, although these controls can also be effective against other types of attacks. For further guidance on defending against credential stuffing and password spraying, see the [Credential Stuffing Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html).

##### Multi-Factor Authentication

Multi-factor authentication (MFA) is by far the best defense against the majority of password-related attacks, including brute-force attacks, with analysis by Microsoft suggesting that it would have stopped [99.9% of account compromises](https://techcommunity.microsoft.com/t5/Azure-Active-Directory-Identity/Your-Pa-word-doesn-t-matter/ba-p/731984). As such, it should be implemented wherever possible; however, depending on the audience of the application, it may not be practical or feasible to enforce the use of MFA.

The [Multifactor Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) contains further guidance on implementing MFA.

##### Login Throttling

Login Throttling is a security mechanism used to prevent an attacker from making too many attempts at guessing a password through normal interactive means, it includes the following controls:

- Maximum number of attempts.

###### Account Lockout

The most common protection against these attacks is to implement account lockout, which prevents any more login attempts for a period after a certain number of failed logins.

The counter of failed logins should be associated with the account itself, rather than the source IP address, in order to prevent an attacker from making login attempts from a large number of different IP addresses. There are a number of different factors that should be considered when implementing an account lockout policy in order to find a balance between security and usability:

- The number of failed attempts before the account is locked out (lockout threshold).
- The time period that these attempts must occur within (observation window).
- How long the account is locked out for (lockout duration).

Rather than implementing a fixed lockout duration (e.g., ten minutes), some applications use an exponential lockout, where the lockout duration starts as a very short period (e.g., one second), but doubles after each failed login attempt.

- Amount of time to delay after each account lockout (max 2-3, after that permanent account lockout).

When designing an account lockout system, care must be taken to prevent it from being used to cause a denial of service by locking out other users' accounts. One way this could be performed is to allow the use of the forgotten password functionality to log in, even if the account is locked out.

##### CAPTCHA

The use of an effective CAPTCHA can help to prevent automated login attempts against accounts. However, many CAPTCHA implementations have weaknesses that allow them to be solved using automated techniques or can be outsourced to services that can solve them. As such, the use of CAPTCHA should be viewed as a defense-in-depth control to make brute-force attacks more time-consuming and expensive, rather than as a preventative.

It may be more user-friendly to only require a CAPTCHA be solved after a small number of failed login attempts, rather than requiring it from the very first login.

##### Security Questions and Memorable Words

Do not use security questions for authentication or re-authentication; [ASVS 6.4.2](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x15-V6-Authentication.md#v64-authentication-factor-lifecycle-and-recovery) excludes knowledge-based authentication. When verifying a password or memorable word, request and verify the full secret rather than selected characters, as required by [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver). See the [Choosing and Using Security Questions Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Choosing_and_Using_Security_Questions_Cheat_Sheet.html) for guidance limited to legacy systems.

### Logging and Monitoring

Enable logging and monitoring of authentication functions to detect attacks/failures on a real-time basis

- Ensure that all failures are logged and reviewed
- Ensure that all password failures are logged and reviewed
- Ensure that all account lockouts are logged and reviewed

### Use of authentication protocols that require no password

While authentication through a combination of username, password, and multi-factor authentication is considered generally secure, there are use cases where it isn't considered the best option or even safe. Examples of this are third-party applications that desire to connect to the web application, either from a mobile device, another website, desktop, or other situations. When this happens, it is NOT considered safe to allow the third-party application to store the user/password combo, since then it extends the attack surface into their hands, where it isn't in your control. For this and other use cases, there are several authentication protocols that can protect you from exposing your users' data to attackers.

#### OAuth 2.0 and 2.1

OAuth is an **authorization** framework for delegated access to APIs. See also: [OAuth 2.0 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html).

> **Note:** OAuth 2.1 is an active IETF Working Group draft that consolidates OAuth 2.0 and widely adopted best practices and is intended to replace RFC 6749/6750; guidance in this cheat sheet applies to both OAuth 2.0 and OAuth 2.1. Because Internet-Drafts are revisioned, use the [unversioned OAuth 2.1 Datatracker page](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/) for the current draft. See also [oauth.net/2.1](https://oauth.net/2.1/).

#### OpenID Connect (OIDC)

**OpenID Connect 1.0 (OIDC)** is an identity layer **on top of OAuth**. It defines how a client (**relying party**) verifies the **end user's** identity using an **ID Token** (a signed JWT) and how to obtain user claims in an interoperable way. Use **OIDC for authentication/SSO**; use **OAuth for authorization** to APIs.

##### OIDC implementation guidance

- **Validate ID Tokens** on the relying party: issuer (`iss`), audience (`aud`), signature (per provider JWKs), expiration (`exp`).
- Prefer **well-maintained libraries/SDKs** and provider discovery/JWKS endpoints.
- Use the **UserInfo** endpoint when additional claims beyond the ID Token are required.

> **Avoid confusion:** **OpenID 2.0 ("OpenID")** was a separate, legacy authentication protocol that has been **superseded by OpenID Connect** and is considered obsolete. New systems should not implement OpenID 2.0. References: [OpenID Foundation — obsolete OpenID 2.0 libraries](https://openid.net/developers/libraries-for-obsolete-specifications/), [OpenID 2.0 → OIDC migration](https://openid.net/specs/openid-connect-migration-1_0.html)

##### Secure Federated Account Linking

When linking an OIDC identity to an existing application account:

- Identify the federated identity using the combination of `iss` (issuer) and `sub` (subject), not `sub` alone. See [OIDC claim stability and uniqueness](https://openid.net/specs/openid-connect-core-1_0.html#ClaimStability).
- Do not automatically link accounts solely because their `email`, `preferred_username`, or other profile attributes match. These claims are not guaranteed to be unique or stable, as explained in [OIDC Core Section 5.7](https://openid.net/specs/openid-connect-core-1_0.html#ClaimStability).
- Require an authenticated session with the existing application account before adding or removing linked identities, as described in [NIST SP 800-63C-4, Section 3.8.1](https://pages.nist.gov/800-63-4/sp800-63c/Federation/). Apply the guidance in [Require Re-authentication for Sensitive Features](#require-re-authentication-for-sensitive-features) before changing account links.
- Authenticate the identity being added and [validate the resulting ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation) before saving the link. Bind the authentication response to the user's linking session using the protections described in the [OAuth 2.0 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html).
- After unlinking, disallow access to the application account through the removed identity. See [NIST SP 800-63C-4, Section 3.8.1](https://pages.nist.gov/800-63-4/sp800-63c/Federation/).
- Notify the user when an identity is added, or when an identity is removed without terminating the application account, as described in [NIST SP 800-63C-4, Section 3.8](https://pages.nist.gov/800-63-4/sp800-63c/Federation/).

#### SAML

Security Assertion Markup Language (SAML) is often considered to compete with OpenId. The most recommended version is 2.0 since it is very feature-complete and provides strong security. Like OpenId, SAML uses identity providers, but unlike OpenId, it is XML-based and provides more flexibility. SAML is based on browser redirects which send XML data. Furthermore, SAML isn't only initiated by a service provider; it can also be initiated from the identity provider. This allows the user to navigate through different portals while still being authenticated without having to do anything, making the process transparent.

While OpenId has taken most of the consumer market, SAML is often the choice for enterprise applications because there are few OpenId identity providers which are considered enterprise-class (meaning that the way they validate the user identity doesn't have high standards required for enterprise identity). It is more common to see SAML being used inside of intranet websites, sometimes even using a server from the intranet as the identity provider.

In the past few years, applications like SAP ERP and SharePoint (SharePoint by using Active Directory Federation Services 2.0) have decided to use SAML 2.0 authentication as an often preferred method for single sign-on implementations whenever enterprise federation is required for web services and web applications.

**See also: [SAML Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html)**

#### FIDO

The Fast Identity Online (FIDO) Alliance has created two protocols to facilitate online authentication: the Universal Authentication Framework (UAF) protocol and the Universal Second Factor (U2F) protocol. While UAF focuses on passwordless authentication, U2F allows the addition of a second factor to existing password-based authentication. Both protocols are based on a public key cryptography challenge-response model.

UAF takes advantage of existing security technologies present on devices for authentication including fingerprint sensors, cameras (face biometrics), microphones (voice biometrics), Trusted Execution Environments (TEEs), Secure Elements (SEs), and others. The protocol is designed to plug these device capabilities into a common authentication framework. UAF works with both native applications and web applications.

U2F augments password-based authentication using a hardware token (typically USB) that stores cryptographic authentication keys and uses them for signing. The user can use the same token as a second factor for multiple applications. U2F works with web applications. It provides **protection against phishing** by using the URL of the website to look up the stored authentication key.

**FIDO2**: [FIDO2 combines WebAuthn with the Client-to-Authenticator Protocols (CTAP)](https://fidoalliance.org/specifications/). U2F is now named CTAP1; UAF is a separate protocol. WebAuthn credentials form the foundation of modern **Passkeys** technology. Passkeys enable users to securely log in using local user verification (such as biometrics or device PINs), often with credential synchronization across devices.

##### Hardware-backed Key Storage

For many authenticators, including common platform passkeys, the private key is generated and stored by the operating system's secure key manager. Depending on the platform and authenticator, keys may be protected using hardware-backed components such as the Trusted Platform Module (TPM) on Windows, Secure Enclave on Apple devices, or the Android Keystore/StrongBox on Android, or by other software-based mechanisms.

In typical implementations, the private key is intended to be non-exportable and bound to the authenticator, and the platform security module signs a server challenge using this key. However, some authenticators support credential synchronization or backup that may involve export or server-side storage, and not all implementations are hardware-backed. Relying parties should not assume that keys are hardware-backed and non-exportable unless this is verified (for example, via authenticator properties or attestation).

### Password Managers

Password managers are programs, browser plugins, or web services that automate the management of a large quantity of different credentials. Most password managers have functionality to allow users to easily use them on websites, either:
(a) by pasting the passwords into the login form
-- or --
(b) by simulating the user typing them in.

Web applications should not make the job of password managers more difficult than necessary by observing the following recommendations:

- Use standard HTML forms for username and password input with appropriate `type` attributes.
- Avoid plugin-based login pages (such as Flash or Silverlight).
- Implement a reasonable maximum password length, at least 64 characters, as discussed in the [Implement Proper Password Strength Controls section](#implement-proper-password-strength-controls).
- Allow any printable characters to be used in passwords.
- Allow users to paste into the username, password, and MFA fields.
- Allow users to navigate between the username and password field with a single press of the `Tab` key.

### Changing A User's Registered Email Address

User email addresses often change. The following process is recommended to handle such situations in a system:

*Note: The process is less stringent with [Multifactor Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html), as proof-of-identity is stronger than relying solely on a password.*

#### Recommended Process If the User HAS [Multifactor Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) Enabled

1. Confirm the validity of the user's authentication cookie/token. If not valid, display a login screen.
2. Describe the process for changing the registered email address to the user.
3. Ask the user to submit a proposed new email address, ensuring it complies with system rules.
4. Request the use of [Multifactor Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) for identity verification.
5. Store the proposed new email address as a pending change.
6. Create and store **two** time-limited nonces for (a) system administrators' notification, and (b) user confirmation.
7. Send two email messages with links that include those nonces:

    - A **notification-only email message** to the current address, alerting the user to the impending change and providing a link to report unexpected activity.

    - A **confirmation-required email message** to the proposed new address, instructing the user to confirm the change and providing a link for unexpected situations.

8. Handle responses from the links accordingly.

#### Recommended Process If the User DOES NOT HAVE Multifactor Authentication Enabled

1. Confirm the validity of the user's authentication cookie/token. If not valid, display a login screen.
2. Describe the process for changing the registered email address to the user.
3. Ask the user to submit a proposed new email address, ensuring it complies with system rules.
4. Request the user's current password for identity verification.
5. Store the proposed new email address as a pending change.
6. Create and store three time-limited nonces for system administrators' notification, user confirmation, and an additional step for password reliance.
7. Send two email messages with links to those nonces:

    - A **confirmation-required email message** to the current address, instructing the user to confirm the change and providing a link for an unexpected situation.

    - A **separate confirmation-required email message** to the proposed new address, instructing the user to confirm the change and providing a link for unexpected situations.

8. Handle responses from the links accordingly.

#### Notes on the Above Processes

- It's worth noting that Google adopts a different approach with accounts secured only by a password -- [where the current email address receives a notification-only email](https://support.google.com/accounts/answer/55393?hl=en). This method carries risks and requires user vigilance.

- Regular social engineering training is crucial. System administrators and help desk staff should be trained to follow the prescribed process and recognize and respond to social engineering attacks. Refer to [CISA's "Avoiding Social Engineering and Phishing Attacks"](https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks) for guidance.

### Adaptive or Risk Based Authentication

A feature of more advanced applications is the ability to require different authentication stages depending on various environmental and contextual attributes (including but not limited to, the sensitivity of the data for which access is being requested, time of day, user location, IP address, or device fingerprint).

For example, an application may require MFA for the first login from a particular device but not for subsequent logins from that device. Alternatively, a single sign-on solution may authenticate the user and allow them to remain logged in for a day but require a reauthentication if they try to access their profile page.

Use device fingerprints, IP addresses, and remembered-device cookies as risk signals, not as substitutes for authentication. [NIST session guidance](https://pages.nist.gov/800-63-4/sp800-63b/session/) distinguishes an authenticated session secret from device and browser characteristics used for monitoring. Require authentication or a valid authenticated session before exposing private account data. For example, a banking application may allow balance viewing within an authenticated session and require stronger or fresher authentication for transaction details or money movement.

Questions that should be considered when implementing a mechanism like this include:

- Are the policies being put in place in line with any corporate policies and especially any regulatory policy?
- Which user‑ or device‑attributes (IP, geolocation, device fingerprint, time‑of‑day, behavioral biometrics, etc.) will we monitor at session start?
- Which of those signals need to be refreshed during an active session, and at what cadence?
- How will we ensure each signal’s accuracy and handle missing or low‑confidence data?
- What scoring model (weights, thresholds, ML, rule‑based, hybrid) will convert raw signals into a risk tier?
- Where will the model run (edge, API gateway, central service), and what is our latency budget?
- What action maps to each risk tier (allow, CAPTCHA, step‑up MFA, block, revoke session)?
- What user‑facing messages and error codes will accompany each action?
- At which exact code or platform layers will we invoke the risk engine (login controller, middleware, API gateway, service mesh)?
- How do we propagate decisions consistently across web, mobile, and API clients?
- How do we mutate, extend, or revoke tokens/cookies when a mid‑session risk check escalates?
- How do we synchronize state across multiple concurrent devices or browser tabs?
- What monitoring and alerting will be in place for potentially suspicious activity, including how the user is notified.

## Authentication Patterns

> **Source:** [Authentication Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Patterns_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Authentication can be enforced at different layers of a system's architecture. This cheat sheet compares the main patterns, where verification happens in each, and what that means for trust boundaries:

- **Service-Level:** each service verifies identity itself, or delegates it to a proxy tightly coupled to it.
- **Edge-Level:** authentication is centralized in a shared component at the system boundary.
- **Network-Layer (Node-Level):** peers are authenticated cryptographically at the network layer, transparently to applications.

The patterns apply to **external** actors (end users and client applications outside the system) and to **internal** actors (services, other workloads, and the nodes they run on), although the mechanisms and trust assumptions differ. Most systems authenticate in two phases:

- **Primary authentication** verifies a credential and links it to a known identity: a password, a signed challenge such as a [WebAuthn assertion](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API), or, for internal actors, a machine certificate or a workload identity such as a [SPIFFE ID](https://spiffe.io/docs/latest/spiffe-about/overview/).
- **Authentication proof verification** checks the reusable artifact issued after primary authentication (a session cookie, token, or assertion at the application layer; a TLS session key or IPsec Security Association at lower layers) so that primary authentication is not repeated on every request. [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html#sessmgmt) describes this as session management based on a session secret.

Where the distinction does not matter, this cheat sheet uses **authentication data** for both. The patterns differ in **what** is verified (credentials or proofs), **where** verification happens, and **which** implications this has for system design and trust boundaries.

For authorization and for propagating an authenticated identity between services, see the [Microservices Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html), in particular its [edge-level](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html#edge-level-authorization), [identity propagation](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html#external-entity-identity-propagation), and [service-to-service authentication](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html#service-to-service-authentication) sections.

### Service-Level Embedded Authentication

In this pattern, each service handles primary authentication itself: it manages identities and credentials, verifies them, and implements the authentication workflows, typically with username/password or API keys. All authentication logic and subject data storage live inside the service, in custom code or built-in libraries. If you have to maintain such a service, the credential handling must follow the [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) and the [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

![Service-Level Embedded Authentication](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Service_Level_Embedded_Authentication.png)

#### Pros

- **Simplicity:** Each service is self-contained and needs no external authentication infrastructure.
- **Customization freedom:** Authentication behavior can be adapted to service-specific requirements without external constraints.
- **Support for external and internal actors:** Because the service controls all authentication functionality, it can orchestrate different authentication contexts (internal services and external users), at the price of significant complexity (see the authentication orchestration con below).

#### Cons

- **Inconsistency:** Authentication behavior, credential storage, and flows differ across services, which fragments the system, degrades the user experience, and rules out Single Sign-On (SSO).
- **Security risk:** Authentication code is duplicated across services, increasing the risk of vulnerabilities and complicating audits.
- **Maintenance burden:** Changing authentication methods (for example, introducing multi-factor authentication (MFA)) requires updates across all affected services.
- **Limited scalability:** Each service manages its own identities, which does not scale to service-to-service authentication across a large system.
- **Limited observability and governance:** Without centralized monitoring, credential reuse, account compromise, or brute-force attacks against one service remain invisible to the others, hindering coordinated detection and response.
- **Authentication orchestration:** Supporting multi-principal subjects (multiple authentication configurations, protocol chaining, and subject-specific variations for contexts such as first- and third-party access, or external clients next to service-to-service calls) adds significant complexity.
- **Coupling of external authentication data with internal trust assumptions:** Using the same authentication data for external clients and internal services increases the risk of leakage and unauthorized access. If an internal service is exposed through a misconfiguration, or an attacker gains internal access, the leaked authentication data grants access to sensitive resources.

### Service-Level Code-Mediated Authentication

This pattern addresses key limitations of [Service-Level Embedded Authentication](#service-level-embedded-authentication): fragmented identity management, duplicated credential stores, and lack of SSO. The service no longer verifies credentials directly. Instead, an external Identity Provider (IdP) authenticates the subject and issues authentication proofs; the service verifies these itself and extracts identity attributes for request processing.

![Service-Level Code-Mediated Authentication](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Service_Level_Code_Mediated_Authentication.png)

#### Pros

- **SSO support:** Identity and credential lifecycle is consolidated in the IdP, enabling SSO and reducing duplication.
- **Lower security risks:** Centralized authentication reduces the attack surface related to credential handling.
- **Improved user experience:** Consistent authentication flows and session handling across services.
- **Interoperability:** Widely adopted protocols like [OpenID Connect (OIDC)](https://openid.net/specs/openid-connect-core-1_0.html) and [SAML](https://www.oasis-open.org/standard/saml/) provide flexibility and broad integration possibilities with various IdPs.
- **Customization freedom:** Services can still tailor authentication behavior to specific needs, for example where standards like OIDC are not applicable.
- **Support for external and internal actors:** As in the [embedded pattern](#service-level-embedded-authentication), with the same orchestration complexity.

#### Cons

- **Protocol handling overhead:** Each service must implement and maintain logic for authentication proof verification and protocol-specific behavior.
- **Misconfiguration risks:** Incorrect verification logic, such as missing expiration checks or improper use of cryptography, can introduce severe security vulnerabilities.
- **Authentication orchestration:** Same complexity as in the [embedded pattern](#service-level-embedded-authentication).
- **Coupling of external authentication data with internal trust assumptions:** Same risk as in the [embedded pattern](#service-level-embedded-authentication).

### Service-Level Proxy-Mediated Authentication

This pattern builds on the [previous pattern](#service-level-code-mediated-authentication) but moves authentication logic out of the service into a dedicated proxy deployed as a sidecar alongside it. The proxy sits in front of the application, verifies authentication proofs with the Identity Provider (IdP), injects identity context into the request (typically as headers), and forwards it locally to the service.

![Service-Level Proxy-Mediated Authentication](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Service_Level_Proxy_Mediated_Authentication.png)

#### Pros

- **All benefits of the code-mediated pattern:** SSO, centralized credential handling, a consistent user experience, and standards-based interoperability (see [above](#service-level-code-mediated-authentication)).
- **Separation of concerns:** Removes authentication logic from application code, simplifying service development and reducing maintenance effort.
- **Consistent behavior:** Identity verification and protocol handling in the proxy ensure uniform behavior across services.
- **Improved security posture:** Consolidating authentication logic into a dedicated, hardened component reduces the risk of implementation flaws.
- **Authentication orchestration:** Some proxies support multiple authentication configurations, including protocol chaining and subject-specific variations, which covers first- and third-party access or a mix of external clients and internal services.
- **Strong foundation for service-to-service trust:** Enables [Zero Trust](https://csrc.nist.gov/pubs/sp/800/207/final) networking with workload identity, typically realized with [SPIFFE/SPIRE](https://spiffe.io/), which issues workload identities as [X.509 certificates](https://www.rfc-editor.org/rfc/rfc5280) used for mutual TLS ([mTLS](https://www.rfc-editor.org/rfc/rfc8446)) between services.

#### Cons

- **Operational complexity:** Requires deploying and maintaining an additional component per microservice, with higher resource usage and cost.
- **Header spoofing risk:** The application trusts identity headers set by the sidecar, so any path that lets a caller set those headers yields a forged identity: a client reaching the application port directly, or the proxy forwarding identity headers it received from the caller. Countermeasures: the sidecar must strip or overwrite every inbound identity header before injecting its own (Envoy, for example, [sanitizes `x-forwarded-client-cert` by default](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers#x-forwarded-client-cert)); the application must accept traffic only from its sidecar (bind to loopback, or enforce a network policy that only allows the sidecar to reach the application port); or, where that isolation cannot be guaranteed, the sidecar must sign the injected headers with [HTTP Message Signatures](https://www.rfc-editor.org/rfc/rfc9421) so the application can verify their origin. Define a signature profile that binds the identity to the intended service and relevant request components. The application must verify the trusted signer's signature and enforce freshness and replay checks. [NIST SP 800-204](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-204.pdf) (MS-SS-13) recommends layer 3 network segmentation for sensitive applications precisely to counter callers bypassing the sidecar proxy.
- **Configuration consistency:** All proxies across the service landscape must be configured uniformly; inconsistencies lead to confusing user flows or security vulnerabilities.
- **Coupling of external authentication data with internal trust assumptions:** Same risk as in the [embedded pattern](#service-level-embedded-authentication), because the external authentication data still travels to every service's sidecar for verification.

### Edge-Level Authentication

In this pattern, authentication is handled at the system boundary by a shared component such as an API gateway or ingress proxy. This component authenticates incoming requests from external clients before they reach internal services. It uses [OIDC](https://openid.net/specs/openid-connect-core-1_0.html) or [SAML](https://www.oasis-open.org/standard/saml/) with an identity provider for user authentication, validates [OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749) access tokens for API access, or uses [mTLS](https://www.rfc-editor.org/rfc/rfc8446) for certificate-based client authentication. It propagates verified identity information, typically via headers, to downstream services.

![Edge-Level Authentication](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Edge_Level_Authentication.png)

This consolidates authentication into a single enforcement point and removes per-service authentication handling. It corresponds to the gateway or portal placement of the policy enforcement point described in [NIST SP 800-207 (Zero Trust Architecture)](https://csrc.nist.gov/pubs/sp/800/207/final).

#### Pros

- **Improved consistency:** Authentication is performed uniformly at a single entry point, reducing fragmentation and configuration drift and improving auditability.
- **Simplified service logic:** Internal services are relieved from implementing authentication and focus on authorization and business functionality.
- **Faster service onboarding:** New services rely on the existing infrastructure for authentication and need minimal additional setup.
- **Protocol-agnostic identity propagation:** The edge verifies the external authentication data once and propagates identity to internal services in a trusted, implementation-independent format: a newly issued [JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519), headers protected with [HTTP Message Signatures](https://www.rfc-editor.org/rfc/rfc9421), or a signed proprietary structure. Unlike the service-level patterns, where every service or its sidecar must receive and verify the external authentication data, internal services only ever see the internal representation.

#### Cons

- **Limited granularity:** Fine-grained or per-endpoint authentication policies (for example, step-up authentication) are harder to implement and may require coordination with downstream services, depending on the capabilities of the edge proxy.
- **Identity propagation challenges:** Secure and reliable propagation of identity context (for example, via headers) requires strict validation and an explicit trust model between the edge and internal services. Use one of the protected formats above, and make internal services verify the signature and reject requests whose identity context is missing or unsigned.
- **Single point of failure:** The ingress proxy or gateway is already a central component in most architectures, but authenticating at the edge makes it a critical part of the security infrastructure. Misconfiguration or compromise affects the integrity of authentication decisions system-wide.
- **Not suitable for service-to-service authentication:** Edge-level authentication only covers incoming external requests. Internal service-to-service calls need their own mechanism, and any component that can reach a service directly bypasses the gateway entirely; [NIST SP 800-204](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-204.pdf) (MS-SS-2) recommends mutual authentication to prevent such direct, anonymous connections. Routing internal traffic through the edge is technically possible but introduces severe performance bottlenecks.

### Network-Layer (Node-Level) Authentication

This pattern authenticates peers at the [network layer](https://en.wikipedia.org/wiki/Network_layer) (layer 3), inside the operating system kernel, using cryptographic identities attached to a node or host rather than to an application. Implementations are built on [IPsec](https://www.rfc-editor.org/rfc/rfc6071) or [WireGuard](https://www.wireguard.com/): the identity of a peer is bound to keys configured on each node, and every packet is cryptographically authenticated. Enforcement is transparent to applications, which makes it a good complement for securing traffic between workloads, but not a replacement for application-layer authentication.

![Network-Layer (Node-Level) Authentication](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Network_Layer_Authentication.png)

#### Pros

- **Transparent to applications:** Services need no authentication logic; the kernel enforces peer identity for all traffic.
- **Protocol-agnostic:** Applies to all traffic types, not just HTTP.
- **Low overhead:** Kernel implementation and lightweight handshakes keep latency low while providing strong isolation between nodes.
- **Provides node (host) identity:** Each node holds its own key material and every packet is authenticated, which resists spoofing and replay at the network layer and supports [Zero Trust](https://csrc.nist.gov/pubs/sp/800/207/final) segmentation between nodes.

#### Cons

- **Not suitable for application-level (layer 7) authentication:** Identities belong to nodes or hosts, not to individual users, external clients, or, usually, individual workloads. Every workload on a node shares the node's identity, and user-specific attributes cannot be conveyed.
- **Limited observability:** Monitoring is confined to connection-level data (source and destination nodes), with no insight into user-driven actions inside the application.
- **Infrastructure complexity:** Requires robust automation for key and identity management and OS- or kernel-level policy enforcement (for example, via [eBPF](https://ebpf.io/)).

### Operational and Security Considerations

The patterns differ primarily in *where* and *how* authentication is performed, but they also have significant implications for operations and authorization. Choosing a pattern comes down to balancing development flexibility, operational effort, and risk tolerance.

#### Operational Considerations

| Pattern                          | Configuration & Implementation Burden | Operational Overhead    | Observability Scope        |
| -------------------------------- | ------------------------------------- | ----------------------- | -------------------------- |
| **Service-Level Embedded**       | High                                  | High                    | Application-specific       |
| **Service-Level Code-Mediated**  | Medium                                | Medium                  | IdP + Application-specific |
| **Service-Level Proxy-Mediated** | Medium                                | High (infra cost)       | Proxy + Application        |
| **Edge-Level**                   | Low                                   | Low                     | Centralized (Proxy)        |
| **Network-Layer (Node-Level)**   | Low-Medium                            | High (infra complexity) | Network-level only         |

Patterns with decentralized authentication (like [Service-Level Embedded Authentication](#service-level-embedded-authentication)) typically incur more operational overhead due to inconsistencies, duplicated configuration, and monitoring complexity. Centralized patterns reduce duplication but introduce infrastructure dependencies and require resilient design.

#### Security Considerations

Security risks increase significantly when authentication logic and credentials are handled directly within application code. Centralized enforcement, whether at the IdP, at the edge, or in the kernel, limits exposure, enforces stronger boundaries, and reduces the risk of misconfiguration. However, trust leakage must be prevented, because it directly undermines the principle of least privilege. This depends not only on where authentication occurs, but also on how identity information is propagated and verified downstream. Without trustworthy, tamper-resistant propagation, even strong initial authentication can be undermined, weakening trust boundaries and the system's ability to make reliable authorization decisions. The [Identity Propagation Patterns Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Identity_Propagation_Patterns_Cheat_Sheet.html) compares forwarding, token exchange, and trusted internal assertions, including their validation requirements and limitations.

**Note:** Token theft, replay protection, session lifecycle, and reauthentication are critical when implementing any of these patterns. They are covered in the [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) and the [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

### Recommendations

- **Authenticate external actors at the edge.** Centralize external authentication in a gateway or ingress proxy, as described in [NIST SP 800-207](https://csrc.nist.gov/pubs/sp/800/207/final) and [NIST SP 800-204](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-204.pdf) (MS-SS-2). Normalize different authentication mechanisms into a signed internal assertion when needed. Forward an external access token only to its [intended recipients](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.3), with the required validation and proof at each receiving service; otherwise exchange it or issue a suitable internal assertion. See [Identity Propagation Patterns](https://cheatsheetseries.owasp.org/cheatsheets/Identity_Propagation_Patterns_Cheat_Sheet.html) for these requirements.
- **Authenticate internal service calls with proxy-mediated mTLS and workload identity.** Give every workload its own cryptographic identity, for example an X.509 SVID issued through [SPIFFE](https://spiffe.io/docs/latest/spiffe-about/overview/), and have the sidecar enforce mutual authentication with [TLS](https://www.rfc-editor.org/rfc/rfc8446) client certificates on every service-to-service connection, as NIST SP 800-204 (MS-SS-4) recommends. See also [Client Certificates and Mutual TLS](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html#client-certificates-and-mutual-tls).
- **Do not embed authentication in new systems.** Service-level embedded authentication fragments identity, duplicates credential stores, and rules out SSO. Reserve it for legacy code you cannot change, and even then follow the [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).
- **Treat network-layer (node-level) authentication as a transport complement, never as the sole control.** It authenticates nodes, not users or workloads, and [NIST SP 800-207](https://csrc.nist.gov/pubs/sp/800/207/final) is explicit that network location alone does not imply trust. Combine it with edge-level or proxy-mediated authentication; NIST SP 800-204 (MS-SS-13) likewise positions layer 3 segmentation as a complement to service mesh controls.

## Password Storage

> **Source:** [Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet advises you on the proper methods for storing passwords for authentication. When passwords are stored, they must be protected from an attacker even if the application or database is compromised. Fortunately, a majority of modern languages and frameworks provide built-in functionality to help store passwords safely.

Passwords should never be stored in plain text. Instead, they must be protected using strong, slow hashing algorithms such as Argon2id, bcrypt, or PBKDF2. A unique salt must be added to each password to prevent attackers from using precomputed lookup tables like rainbow tables. Fast hashing algorithms such as SHA‑256 are not suitable for password storage because they allow attackers to perform large numbers of guesses quickly. Using slow, memory‑hard algorithms makes brute‑force attacks significantly more difficult, expensive, and time‑consuming.

To sum up our recommendations:

- **Use [Argon2id](#argon2id) with a minimum configuration of 19 MiB of memory, an iteration count of 2, and 1 degree of parallelism.**
- **If [Argon2id](#argon2id) is not available, use [scrypt](#scrypt) with a minimum CPU/memory cost parameter of (2^17), a minimum block size of 8 (1024 bytes), and a parallelization parameter of 1.**
- **For legacy systems using [bcrypt](#bcrypt), use a work factor of 10 or more and with a password limit of 72 bytes.**
- **If FIPS-140 compliance is required, use [PBKDF2](#pbkdf2) with a work factor of 600,000 or more and set with an internal hash function of HMAC-SHA-256.**
- **Consider using a [pepper](#peppering) to provide additional defense in depth (though alone, it provides no additional secure characteristics).**

### Background

#### Hashing vs Encryption

Hashing and encryption can keep sensitive data safe, but in almost all circumstances, **Passwords should be securely hashed using modern, adaptive hashing algorithms (e.g., Argon2id, bcrypt, or PBKDF2), rather than encrypted or stored in plaintext.**

Because **hashing is a one-way function** (i.e., it is impossible to "decrypt" a hash and obtain the original plaintext value), it is the most appropriate approach for password validation. Even if an attacker obtains the hashed password, they cannot use it to log in as the victim.

Since **encryption is a two-way function**, attackers can retrieve the original plaintext from the encrypted data. It can be used to store data such as a user's address since this data is displayed in plaintext on the user's profile. Hashing their address would result in a garbled mess.

The only time encryption should be used in passwords is in edge cases where it is necessary to obtain the original plaintext password. This might be necessary if the application needs to use the password to authenticate with another system that does not support a modern way to programmatically grant access, such as OpenID Connect (OIDC). Wherever possible, an alternative architecture should be used to avoid the need to store passwords in an encrypted form.

For further guidance on encryption, see the [Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).

#### When Password Hashes Can Be Cracked

**Strong passwords stored with modern hashing algorithms and using hashing best practices should be effectively impossible for an attacker to crack.** It is your responsibility as an application owner to select a modern hashing algorithm.

However, there are some situations where an attacker can "crack" the hashes in some circumstances by doing the following:

- Selecting a password you think the victim has chosen (e.g.`password1!`)
- Calculating the hash
- Comparing the hash you calculated to the hash of the victim. If they match, you have correctly "cracked" the hash and now know the plaintext value of their password.

Usually, the attacker will repeat this process with a list of large number of potential candidate passwords, such as:

- Lists of passwords obtained from other compromised sites
- Brute force (trying every possible candidate)
- Dictionaries or wordlists of common passwords

While the number of permutations can be enormous, with high speed hardware (such as GPUs) and cloud services with many servers for rent, the cost to an attacker is relatively small to do successful password cracking, especially when best practices for hashing are not followed.

### Methods for Enhancing Password Storage

#### Salting

A salt is a unique, randomly generated string that is added to each password as part of the hashing process. As the salt is unique for every user, an attacker has to crack hashes one at a time using the respective salt rather than calculating a hash once and comparing it against every stored hash. This makes cracking large numbers of hashes significantly harder, as the time required grows in direct proportion to the number of hashes.

Salting also protects against an attacker's pre-computing hashes using rainbow tables or database-based lookups. Finally, salting means that it is impossible to determine whether two users have the same password without cracking the hashes, as the different salts will result in different hashes even if the passwords are the same.

At the algorithm and specification level, modern password hashing functions such as [Argon2id](#argon2id), [bcrypt](#bcrypt), and [PBKDF2](#pbkdf2) require the caller to provide a salt.
However, most widely used implementations and libraries automatically generate and manage salts internally, so application developers typically do not need to handle salt generation manually when using these libraries correctly.

#### Peppering

[Peppering](https://datatracker.ietf.org/doc/html/draft-ietf-kitten-password-storage-07#section-4.2) is a class of strategies that can be used in addition to salting to provide an additional layer of protection. It prevents an attacker from being able to crack any of the hashes if they only have access to the database, for example, if they have exploited a SQL injection vulnerability or obtained a backup of the database.

##### Common requirements for peppering strategies

- A pepper is **shared between stored passwords**, rather than being *unique* to an individual password like a password salt.
- Unlike a password salt, the pepper should not be public and **should not be stored along with the generated hash**. The pepper should be stored separately from the password database.
- Peppers are secrets and should be stored in "secrets vaults" or HSMs (Hardware Security Modules). See the [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) for more information on securely storing secrets.
- In the event of a pepper's compromise, the pepper will have to be changed. Peppers cannot be changed without knowledge of a user's password. Therefore changing a pepper will require forcing all users whose passwords were protected by the previous pepper to reset their passwords.

##### Pre-hashing peppers

In this strategy, a pepper is added to a password before being hashed by a password hashing algorithm. The computed hash is then stored in the database. In this case the pepper should be a random value generated securely. See the [Cryptographic_Storage_Cheat_Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#secure-random-number-generation) for more information on securely generating random values.

##### Post-hashing peppers

In this strategy, a password is hashed as usual using a password hashing algorithm. The resulting password hash is then hashed again using an HMAC (e.g., HMAC-SHA256, HMAC-SHA512, depending on the desired output length) before storing the resulting hash in the database. In this case the pepper is acting as the HMAC key and should be generated as per requirements of the HMAC algorithm.

#### Using Work Factors

 The work factor is the number of iterations of the hashing algorithm that are performed for each password (usually, it's actually `2^work` iterations). The work factor is typically stored in the hash output. It makes calculating the hash more computationally expensive, which in turn reduces the speed and/or increases the cost for which an attacker can attempt to crack the password hash.

When you choose a work factor, strike a balance between security and performance. Though higher work factors make hashes more difficult for an attacker to crack, they will slow down the process of verifying a login attempt. If the work factor is too high, the performance of the application may be degraded, which could be used by an attacker to carry out a denial of service attack by exhausting the server's CPU with a large number of login attempts.

There is no golden rule for the ideal work factor - it will depend on the performance of the server and the number of users on the application. Determining the optimal work factor will require experimentation on the specific server(s) used by the application. As a general rule, calculating a hash should take less than one second.

##### Upgrading the Work Factor

One key advantage of having a work factor is that it can be increased over time as hardware becomes more powerful and cheaper.

The most common approach to upgrading the work factor is to wait until the user next authenticates, then re-hash their password with the new work factor. The different hashes will have different work factors and hashes may never be upgraded if the user doesn't log back into the application. Depending on the application, it may be appropriate to remove the older password hashes and require users to reset their passwords next time they need to login in order to avoid storing older and less secure hashes.

### Password Hashing Algorithms

Some modern hashing algorithms have been specifically designed to securely store passwords. This means that they should be slow (unlike algorithms such as MD5 and SHA-1, which were designed to be fast), and you can change how slow they are by changing the work factor.

You do not need to hide which password hashing algorithm is used by an application. If you utilize a modern password hashing algorithm with proper configuration parameters, it should be safe to state in public which password hashing algorithms are in use and be listed [here](https://pulse.michalspacek.cz/passwords/storages).

When selecting a password hashing algorithm, developers should prefer modern algorithms that are designed to resist both GPU-based and memory-based attacks.
Where available, newer algorithms should be chosen for new applications, while older algorithms may still be acceptable for legacy systems with appropriate configuration.

Three hashing algorithms that should be considered.

#### Argon2id

[Argon2](https://en.wikipedia.org/wiki/Argon2) was the winner of the 2015 [Password Hashing Competition](https://en.wikipedia.org/wiki/Password_Hashing_Competition). Out of the three Argon2 versions, use the  Argon2id variant since it provides a balanced approach to resisting both side-channel and GPU-based attacks.

Argon2id has three main cost parameters: total memory in KiB (m), the number of passes (t), and the degree of parallelism (p). Parallelism controls the number of lanes over which the memory is divided; increasing p does not multiply the total memory or act as an iteration count. See [RFC 9106 Section 3.1](https://www.rfc-editor.org/rfc/rfc9106.html#section-3.1) for the parameter definitions.

Tune memory and iteration costs to make password cracking expensive while keeping authentication practical under expected load. [Benchmark the chosen parameters on the target system](https://www.rfc-editor.org/rfc/rfc9106.html#section-4); increasing parallelism is not a guarantee of slower password guessing. Use one of the following minimum configurations:

- m=47104 (46 MiB), t=1, p=1 (Do not use with Argon2i)
- m=19456 (19 MiB), t=2, p=1 (Do not use with Argon2i)
- m=12288 (12 MiB), t=3, p=1
- m=9216 (9 MiB), t=4, p=1
- m=7168 (7 MiB), t=5, p=1

These configuration settings provide an equal level of defense, and the only difference is a trade off between CPU and RAM usage.

#### scrypt

[scrypt](http://www.tarsnap.com/scrypt/scrypt.pdf) is a password-based key derivation function created by [Colin Percival](https://twitter.com/cperciva). While [Argon2id](#argon2id) should be the best choice for password hashing, [scrypt](#scrypt) should be used when the former is not available.

Like [Argon2id](#argon2id), scrypt has three parameters that can be configured: the minimum memory cost parameter (N), the blocksize (r), and the degree of parallelism (p). Use one of the following settings:

- N=2^17 (128 MiB), r=8 (1024 bytes), p=1
- N=2^16 (64 MiB), r=8 (1024 bytes), p=2
- N=2^15 (32 MiB), r=8 (1024 bytes), p=3
- N=2^14 (16 MiB), r=8 (1024 bytes), p=5
- N=2^13 (8 MiB), r=8 (1024 bytes), p=10

These configuration settings provide a similar minimal level of defense, with the main trade-off between parallelism and RAM usage.

#### bcrypt

The [bcrypt](https://en.wikipedia.org/wiki/bcrypt) password hashing function **should only** be used for password storage in legacy systems where Argon2 and scrypt are not available.

The work factor should be as large as verification server performance will allow, with a minimum of 10.

##### Input Limits of bcrypt

bcrypt has a maximum length input length of 72 bytes [for most implementations](https://security.stackexchange.com/questions/39849/does-bcrypt-have-a-maximum-password-length), so you should enforce a maximum password length of 72 bytes (or less if the bcrypt implementation in use has smaller limits).

##### Pre-Hashing Passwords with bcrypt

An alternative approach is to pre-hash the user-supplied password with a fast algorithm such as SHA-2, HMAC, or BLAKE3 and then to hash the resulting hash value with bcrypt (i.e., `bcrypt(H($password)), $salt, $cost)`)..
This can be **dangerous** because of null bytes in the hash output value and because of [password shucking](https://www.youtube.com/watch?v=OQD3qDYMyYQ).

The original bcrypt expects a null terminated password string, this means that the hash value will only be used to the first null byte in the hash value. (`bcrypt(H($password)), $salt, $cost) == bcrypt("", $salt, $cost)` if `H($password)[0] == 0`)
This increases the chance of finding a collision when [combining bcrypt with other hash functions](https://blog.ircmaxell.com/2015/03/security-issue-combining-bcrypt-with.html) and can be avoided by encoding the hash value to printable string with something like base64.
base64 can increases the length of the hash value above 72 characters and so there is a bit of truncation for large hash values from hashes like SHA-512, this is [negligible](https://soatok.blog/2024/11/27/beyond-bcrypt/).

Password shucking uses the fact, that it is easy to check if  `bcrypt(base64(H($password))), $salt, $cost) == bcrypt(base64($leaked_hash), $salt, $cost)`.
If the inner hash function `H` is used with the same password somewhere else and known to an attacker cracking the password can be reduced to breaking the hash function `H`.
Just using pure SHA-512, ( i.e. `bcrypt(base64(sha512($password))), $salt, $cost)`) is a **dangerous practice** and is as secure as just using pure SHA-512.
Password shucking only works if a leaked hash is known to the attacker, either through a breach database or rainbow tables.
To mitigate password shucking a [pepper](#peppering) can be used.

To summarize if bcrypt has to be used and the password should to be pre-hashed you should do `bcrypt(base64(hmac-sha384(data:$password, key:$pepper)), $salt, $cost)` and store the pepper not in the database.

#### PBKDF2

Since [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) is permitted by [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver) and has FIPS-140 validated implementations, it should be the preferred algorithm when these are required.

The PBKDF2 algorithm requires that you select an internal hashing algorithm such as an HMAC or a variety of other hashing algorithms. HMAC-SHA-256 is widely supported and is recommended by NIST.

The work factor for PBKDF2 is implemented through an iteration count, which should be set differently based on the internal hashing algorithm used.

- PBKDF2-HMAC-SHA256: 600,000 iterations (recommended)
- PBKDF2-HMAC-SHA512: 220,000 iterations
- PBKDF2-HMAC-SHA1: 1,400,000 iterations — **legacy only**, do not select for new systems.

#### Parallel PBKDF2

- PPBKDF2-SHA512: cost 2
- PPBKDF2-SHA256: cost 5
- PPBKDF2-SHA1: cost 10

These configuration settings are equivalent in the defense they provide. ([Number as of december 2022, based on testing of RTX 4000 GPUs](https://tobtu.com/minimum-password-settings/))

##### PBKDF2 Pre-Hashing

When PBKDF2 is used with an HMAC, and the password is longer than the hash function's block size (64 bytes for SHA-256), the password will be automatically pre-hashed. For example, the password "This is a password longer than 512 bits which is the block size of SHA-256" is converted to the hash value (in hex): `fa91498c139805af73f7ba275cca071e78d78675027000c99a9925e2ec92eedd`.

Good implementations of PBKDF2 perform pre-hashing before the expensive iterated hashing phase. However, some implementations perform the conversion on each iteration, which can make hashing long passwords significantly more expensive than hashing short passwords. When users supply very long passwords, a potential denial of service vulnerability could occur, such as the one published in [Django](https://www.djangoproject.com/weblog/2013/sep/15/security/) during 2013. Manual pre-hashing can reduce this risk but requires adding a [salt](#salting) to the pre-hash step.

### Upgrading Legacy Hashes

Older applications that use less secure hashing algorithms, such as MD5 or SHA-1, can be upgraded to modern password hashing algorithms as described above. When the users enter their password (usually by authenticating on the application), that input should be re-hashed using the new algorithm. Defenders should expire the users' current password and require them to enter a new one, so that any older (less secure) hashes of their password are no longer useful to an attacker.

However, this means that old (less secure) password hashes will be stored in the database until the user logs in. You can take one of two approaches to avoid this dilemma.

Upgrade Method One: Expire and delete the password hashes of users who have been inactive for an extended period and require them to reset their passwords to login again. Although secure, this approach is not particularly user-friendly. Expiring the passwords of many users may cause issues for support staff or may be interpreted by users as an indication of a breach.

Upgrade Method Two: Use the existing password hashes as inputs for a more secure algorithm. For example, if the application originally stored passwords as `md5($password)`, this could be easily upgraded to `bcrypt(md5($password))`. Layering the hashes avoids the need to know the original password; however, it can make the hashes easier to crack. These hashes should be replaced with direct hashes of the users' passwords next time the user logs in.

Remember that once your password hashing method is selected, it will have to be upgraded in the future, so ensure that upgrading your hashing algorithm is as easy as possible. During the transition period, allow for a mix of old and new hashing algorithms. Using a mix of hashing algorithms is easier if the password hashing algorithm and work factor are stored with the password using a standard format, for example, the [modular PHC string format](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md).

#### International Characters

Your hashing library must be able to accept a wide range of characters and should be compatible with all Unicode codepoints, so users can use the full range of characters available on modern devices - especially mobile keyboards. They should be able to select passwords from various languages and include pictograms. Prior to hashing the entropy of the user's entry should not be reduced, and password hashing libraries need to be able to use input that may contain a NULL byte.

## Multifactor Authentication

> **Source:** [Multifactor Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Multifactor Authentication (MFA) requires evidence from at least two distinct authentication factors: something you know, something you have, and something you are. Location and other risk signals can inform authentication decisions, but do not substitute for an authentication factor, as explained in [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b/aal/).

| Factor | Examples |
|--------|----------|
| [Something You Know](#something-you-know) | [Passwords and PINs](#passwords-and-pins) |
| [Something You Have](#something-you-have) | [OTP Tokens](#one-time-password-tokens), [U2F Tokens](#universal-second-factor), [Certificates](#certificates), [Smart Cards](#smart-cards), [SMS and Phone Calls (restricted)](#sms-messages-and-phone-calls) |
| [Something You Are](#something-you-are) | [Fingerprints, Facial Recognition, Iris Scans](#biometrics), [Behavioral Biometrics](#something-you-do) |

It should be noted that requiring multiple instances of the same authentication factor (such as needing both a password and a PIN) **does not constitute MFA** and offers minimal additional security. The factors used should be independent of each other and should not be able to be compromised by the same attack. While the following sections discuss the disadvantage and weaknesses of various different types of MFA, in many cases these are only relevant against targeted attacks. **Any MFA is better than no MFA**.

### Advantages

The most common way that user accounts get compromised on applications is through weak, re-used or stolen passwords. Despite any technical security controls implemented on the application, users are liable to choose weak passwords, or to use the same password on different applications. As developers or system administrators, it should be assumed that users' passwords will be compromised at some point, and the system should be designed in order to defend against this.

MFA is by far the best defense against the majority of password-related attacks, including brute-force, [credential stuffing](https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html) and password spraying, with analysis by Microsoft suggesting that it would have stopped [99.9% of account compromises](https://techcommunity.microsoft.com/t5/Azure-Active-Directory-Identity/Your-Pa-word-doesn-t-matter/ba-p/731984).

### Disadvantages

The biggest disadvantage of MFA is the increase in management complexity for both administrators and end users. Many less technical users may find it difficult to configure and use MFA. Additionally, there are a number of other common issues encountered:

- Types of MFA that require users to have specific hardware can introduce significant costs and administrative overheads.
- Users may become locked out of their accounts if they lose or are unable to use their other factors.
- MFA introduces additional complexity into the application.
- Many MFA solutions add external dependencies to systems, which can introduce security vulnerabilities or single points of failure.
- Processes implemented to allow users to bypass or reset MFA may be exploitable by attackers.
- Requiring MFA may prevent some users from accessing the application.

### Quick Recommendations

Exactly when and how MFA is implemented in an application will vary on a number of different factors, including the threat model of the application, the technical level of the users, and the level of administrative control over the users. These need to be considered on a per-application basis.

However, the following recommendations are generally appropriate for most applications, and provide an initial starting point to consider.

- Require some form of MFA for all users.
- Provide the option for users to enable MFA on their accounts using [TOTP](#software-otp-tokens).
- Require MFA for administrative or other high privileged users.
- Implement a secure procedure to allow users to reset their MFA.
- Consider [MFA as a service](#consider-using-a-third-party-service).

### Implementing MFA

MFA is a critical security control, and is recommended for all applications. The following sections provide guidance on how to implement MFA, and the considerations that should be taken into account.

#### Regulatory and Compliance Requirements

Many industries and countries have regulations that require the use of MFA. This is particularly common in the finance and healthcare sectors, and is often required in order to comply with the General Data Protection Regulation (GDPR) in the European Union. It is important to consider these requirements when implementing MFA.

#### When to Require MFA

The most important place to require MFA on an application is when the user logs in. However, depending on the functionality available, it may also be appropriate to require MFA for performing sensitive actions, such as:

- Changing passwords or security questions.
- Changing the email address associated with the account.
- Disabling MFA.
- Elevating a user session to an administrative session.

If the application provides multiple ways for a user to authenticate these should all require MFA, or have other protections implemented. A common area that is missed is if the application provides a separate API that can be used to login, or has an associated mobile application.

#### One-Time Password (OTP) Handling and Storage

OTPs are authentication secrets and should be handled with password-like hygiene. While their security traits differ from long-lived passwords, improper handling can still lead to user account compromise.

At a minimum, OTP implementations SHOULD:

- Enforce a short time-to-live (TTL)
- Ensure OTPs are single use
- Apply strict attempt limits
- Invalidate the OTP on successful verification

OTP implementations SHOULD NOT:

- Log OTP values
- Store OTPs in long-term plaintext form

To further reduce risk and limit exposure, it is RECOMMENDED to:

- Generate OTPs using a cryptographically secure random number generator
- Consider 8-digit or longer codes where usability allows
- On "resend", generate a new OTP and overwrite the old record

##### Hashing OTPs

Hashing OTPs is still recommended, but for different reasons than password hashing. OTPs typically have a very small keyspace (for example, ~1 million possibilities for a 6-digit code), which means a database attacker can brute-force any OTP hash quickly.

As a result, hashing OTPs does not provide strong offline attack resistance in the way password hashing does.

However, hashing remains useful to:

- Prevent accidental disclosure via logs, metrics, or debugging tools
- Reduce blast radius if the database is briefly exposed during the OTP’s validity window
- Enforce good secret-handling discipline and avoid plaintext storage by default

The goal is short-term exposure protection, not long-term cryptographic secrecy.

#### Improving User Experience

##### Risk Based Authentication

Having to frequently login with MFA creates an additional burden for users, and may cause them to disable MFA on the application. Risk based authentication can be used to reduce the frequency of MFA prompts, by only requiring MFA when the user is performing an action that is considered to be high risk. Some examples of this include:

- Requiring MFA when the user logs in from a new device or location.
- Requiring MFA when the user logs in from a location that is considered to be high risk.
- Using corporate IP ranges or [geolocation](#geolocation) as risk signals when deciding whether to require additional authentication.

##### Passkeys

Passkeys can provide phishing-resistant MFA by combining possession of the credential private key with local [PIN](#passwords-and-pins) or [biometric](#biometrics) verification. When using passkeys as MFA, require user verification and [validate the returned user-verification flag on the server](https://www.w3.org/TR/webauthn-3/#sctn-verifying-assertion); a touch confirming user presence alone is not a second factor. The credential key pair is created during [registration](https://www.w3.org/TR/webauthn-3/#sctn-registering-a-new-credential); authentication uses the existing private key to sign a challenge. For registration, verification, and recovery guidance, see the [Passkey Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Passkey_Security_Cheat_Sheet.html).

#### Failed Login Attempts

When a user enters their password, but fails to authenticate using a second factor, this could mean one of two things:

- The user has lost their second factor, or doesn't have it available (for example, they don't have their mobile phone, or have no signal).
- The user's password has been compromised.

There are a number of steps that should be taken when this occurs:

- Prompt the user to try another form of MFA.
- Allow the user to attempt to [reset their MFA](#resetting-mfa).
- Notify the user of the failed login attempt, and encourage them to change their password if they don't recognize it.
    - The notification should include the time, browser and geographic location of the login attempt.
    - This should be displayed next time they login, and optionally emailed to them as well.

#### Resetting MFA

One of the biggest challenges with implementing MFA is handling users who forget or lose their additional factors. There are many ways this could happen, such as:

- Re-installing a workstation without backing up digital certificates.
- Wiping or losing a phone without backing up OTP codes.
- Changing mobile numbers.

In order to prevent users from being locked out of the application, there needs to be a mechanism for them to regain access to their account if they can't use their existing MFA; however it is also crucial that this doesn't provide an attacker with a way to bypass MFA and hijack their account.

There is no definitive "best way" to do this, and what is appropriate will vary hugely based on the security of the application, and also the level of control over the users. Solutions that work for a corporate application where all the staff know each other are unlikely to be feasible for a publicly available application with thousands of users all over the world. Every recovery method has its own advantages and disadvantages, and these need to be evaluated in the context of the application.

Some suggestions of possible methods include:

- Providing the user with a number of single-use recovery codes when they first setup MFA.
- Requiring the user to setup multiple types of MFA (such as a digital certificate, OTP core and phone number for SMS), so that they are unlikely to lose access to all of them at once.
- Mailing a one-use recovery code (or new hardware token) to the user's registered address.
- Requiring the user contact the support team and having a rigorous process in place to verify their identity.
- Requiring another trusted user to vouch for them.

#### Changing MFA Factors

Users may need to update their authentication factors, such as changing a phone number, migrating to a new authenticator app, or replacing a lost hardware token. Because attackers can exploit this process to take over accounts, it must be strictly secured.

Best practices include:

- Require reauthentication with an existing enrolled factor before allowing changes.
- Do not rely solely on the active session, as it may be hijacked.
- Treat factor replacement as a high-risk action and apply risk-based checks (e.g., new device, unusual location).
- Notify the user through out-of-band channels (such as email or push notification) whenever an MFA factor is changed.
- Consider applying delays or step-up verification for high-value accounts.

This ensures that even if a session is compromised, attackers cannot silently replace the user’s MFA factors and lock the legitimate user out.

#### Consider Using a Third Party Service

There are a number of third party services that provide MFA as a service. These can be a good option for applications that don't have the resources to implement MFA themselves, or for applications that require a high level of assurance in their MFA. However, it is important to consider the security of the third party service, and the implications of using it. For example, if the third party service is compromised, it could allow an attacker to bypass MFA on all of the applications that use it.

### Something You Know

Knowledge-based, the most common type of authentication is based on something the users knows - typically a password. The biggest advantage of this factor is that it has very low requirements for both the developers and the end user, as it does not require any special hardware, or integration with other services.

#### Passwords and PINs

Passwords and PINs are the most common form of authentication due to the simplicity of implementing them. The [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls) has guidance on how to implement a strong password policy, and the [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) has guidance on how to securely store passwords. Most multifactor authentication systems make use of a password, as well as at least one other factor.

##### Pros

- Simple and well understood.
- Native support in every authentication framework.
- Easy to implement.

##### Cons

- Users are prone to choosing weak passwords.
- Passwords are commonly re-used between systems.
- Susceptible to phishing.

#### Security Questions

**Security questions are no longer recognized as an acceptable authentication factor** per [NIST SP 800-63](https://pages.nist.gov/800-63-3/sp800-63b.html). Account recovery is just an alternate way to authenticate so it should be no weaker than regular authentication.

##### Pros

- None that are not also present in passwords.

##### Cons

- No longer recognized as an acceptable authentication factor.
- Questions often have easily guessable answers.
- Answers to questions can often be obtained from social media or other sources.
- Questions must be carefully chosen so that users will remember answers years later.
- Susceptible to phishing.

### Something You Have

Possession-based authentication is based on the user having a physical or digital item that is required to authenticate. This is the most common form of MFA, and is often used in conjunction with passwords. The most common types of possession-based authentication are hardware and software tokens, and digital certificates. If properly implemented then this can be significantly more difficult for a remote attacker to compromise; however it also creates an additional administrative burden on the user, as they must keep the authentication factor with them whenever they wish to use it.

#### One-Time Password Tokens

One-Time Password (OTP) tokens are a form of possession-based authentication, where the user is required to submit a constantly changing numeric code in order to authenticate. The most common of which is Time-based One-Time Password (TOTP) tokens, which can be both hardware and software based.

##### Hardware OTP Tokens

Hardware OTP Tokens generate a constantly changing numeric codes, which must be submitted when authenticating. Most well-known of these is the [RSA SecureID](https://en.wikipedia.org/wiki/RSA_SecurID), which generates a six digit number that changes every 60 seconds.

###### Pros

- As the tokens are separate physical devices, they are almost impossible for an attacker to compromise remotely.
- Tokens can be used without requiring the user to have a mobile phone or other device.

###### Cons

- Deploying physical tokens to users is expensive and complicated.
- If a user loses their token it could take a significant amount of time to purchase and ship them a new one.
- Some implementations require a backend server, which can introduce new vulnerabilities as well as a single point of failure.
- Stolen tokens can be used without a PIN or device unlock code.
- Susceptible to phishing (although short-lived).

##### Software OTP Tokens

A cheaper and easier alternative to hardware tokens is using software to generate Time-based One-Time Password (TOTP) codes. This would typically involve the user installing a TOTP application on their mobile phone, and then scanning a QR code provided by the web application which provides the initial seed. The authenticator app generates a numeric code using a configured time step; [RFC 6238 recommends a default of 30 seconds](https://www.rfc-editor.org/rfc/rfc6238.html#section-5.2). The app and server must use the same time-step value.

Most websites use standardized TOTP tokens, allowing the user to install any authenticator app that supports TOTP. However, a small number of applications use their own variants of this (such as Symantec), which requires the users to install a specific app in order to use the service. This should be avoided in favor of a standards-based approach.

###### Pros

- The absence of physical tokens greatly reduces the cost and administrative overhead of implementing the system.
- When users lose access to their TOTP app, a new one can be configured without needing to ship a physical token to them.
- TOTP is widely used, and many users will already have at least one TOTP app installed.
- A screen lock reduces theft risk but does not guarantee protection if the phone is stolen while unlocked. Enable authenticator-app access protection where available; for example, [Google Authenticator’s Privacy Screen](https://support.google.com/accounts/answer/1066447?hl=en-rd) requires device verification before app use.

###### Cons

- TOTP apps are usually installed on mobile devices, which are vulnerable to compromise.
- The TOTP app may be installed on the same mobile device (or workstation) that is used to authenticate.
- Users may store the backup seeds insecurely.
- Not all users have mobile devices to use with TOTP.
- If the user's mobile device is lost, stolen or out of battery, they will be unable to authenticate.
- Susceptible to phishing (although short-lived).

#### Universal Second Factor

Hardware U2F tokens

Universal Second Factor (U2F) is a standard for USB/NFC hardware tokens that  implement challenge-response based authentication, rather than requiring the user to manually enter the code. This would typically be done by the user pressing a button on the token, or tapping it against their NFC reader. The most common U2F token is the [YubiKey](https://www.yubico.com/products/yubikey-hardware/).

##### Pros

- U2F tokens are resistant to phishing since the private key never leaves the token.
- Users can simply press a button rather than typing in a code.
- As the tokens are separate physical devices, they are almost impossible for an attacker to compromise remotely.
- U2F is natively supported by a number of major web browsers.
- U2F tokens can be used without requiring the user to have a mobile phone or other device.

##### Cons

- As with hardware OTP tokens, the use of physical tokens introduces significant costs and administrative overheads.
- Stolen tokens can be used without a PIN or device unlock code.
- As the tokens are usually connected to the workstation via USB, users are more likely to forget them.

#### Certificates

Digital certificates are files that are stored on the user's device which are automatically provided alongside the user's password when authenticating. The most common type is X.509 certificates more commonly known as [client certificates](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html#client-certificates-and-mutual-tls). Certificates are supported by all major web browsers, and once installed require no further interaction from the user. The certificates should be linked to an individual's user account in order to prevent users from trying to authenticate against other accounts.

##### Pros

- There is no need to purchase and manage hardware tokens.
- Once installed, certificates are very simple for users.
- Certificates can be centrally managed and revoked.
- Resistant to phishing.

##### Cons

- Using digital certificates requires a backend Private Key Infrastructure (PKI).
- Installing certificates can be difficult for users, particularly in a highly restricted environment.
- Enterprise proxy servers which perform SSL decryption will prevent the use of certificates.
- The certificates are stored on the user's workstation, and as such can be stolen if their system is compromised.

#### Smart Cards

Smartcards are credit-card size cards with a chip containing a digital certificate for the user, which is unlocked with a PIN. They are commonly used for operating system authentication, but are rarely used in web applications.

##### Pros

- Stolen smartcards cannot be used without the PIN.
- Smartcards can be used across multiple applications and systems.
- Resistant to phishing.

##### Cons

- Managing and distributing smartcards has the same costs and overheads as hardware tokens.
- Smartcards are not natively supported by modern browsers, so require third party software.
- Although most business-class laptops have smartcard readers built-in, home systems often do not.
- The use of smartcards requires backend PKIs.

#### SMS Messages and Phone Calls

> **Warning:**
> NIST SP 800-63B-4 designates SMS and PSTN-delivered codes as a *restricted* authenticator because of SS7 interception, SIM-swap, and number-porting attacks. Do not use SMS for high-value or PII-handling applications. Where it is the only available factor, document the risk acceptance, enforce per-account rate limits, monitor for SIM-swap signals, and plan migration to TOTP, push notifications, or WebAuthn/FIDO2.

SMS messages or phone calls can be used to provide users with a single-use code that they must submit as an additional factor. Due to the risks posed by these methods, they should not be used to protect applications that hold Personally Identifiable Information (PII) or where there is financial risk. e.g. healthcare and banking. [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html) classifies these as restricted authenticators and discourages their use for applications containing PII.

##### Pros

- Relatively simple to implement.
- Requires user to link their account to a mobile number.

##### Cons

- Requires the user to have a mobile device or landline.
- Require user to have signal or internet access to receive the call or message.
- Calls and SMS messages may cost money to send need to protect against attackers requesting a large number of messages to exhaust funds.
- Susceptible to SIM swapping attacks.
- SMS messages may be received on the same device the user is authenticating from.
- Susceptible to phishing.
- SMS may be previewed when the device is locked.
- SMS may be read by malicious or insecure applications.

#### Email

Email verification requires that the user enters a code or clicks a link sent to their email address. There is some debate as to whether email constitutes a form of MFA, because if the user does not have MFA configured on their email account, it simply requires knowledge of the user's email password (which is often the same as their application password). However, it is included here for completeness.

##### Pros

- Very easy to implement.
- No requirements for separate hardware or a mobile device.

##### Cons

- Relies entirely on the security of the email account, which often lacks MFA.
- Email passwords are commonly the same as application passwords.
- Provides no protection if the user's email is compromised first.
- Email may be received by the same device the user is authenticating from.
- Susceptible to phishing.

### Something You Are

Inherence-based authentication is based on the physical attributes of the user. This is less common for web applications as it requires the user to have specific hardware, and is often considered to be the most invasive in terms of privacy. However, it is commonly used for operating system authentication, and is also used in some mobile applications.

#### Biometrics

The are a number of common types of biometrics that are used, including:

- Fingerprint scans
- Facial recognition
- Iris scans
- Voice recognition

##### Pros

- Well-implemented biometrics are hard to spoof, and require a targeted attack.
- Fast and convenient for users.

##### Cons

- Manual enrollment is required for the user.
- Custom (sometimes expensive) hardware is often required to read biometrics.
- Privacy concerns: Sensitive physical information must be stored about users.
- If compromised, biometric data can be difficult to change.
- Hardware may be vulnerable to additional attack vectors.

### Somewhere You Are

Location can inform access restrictions and risk-based authentication decisions. It is not an independent authentication factor: a password combined with a trusted IP address or location does not constitute MFA. [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b/aal/) explicitly distinguishes these risk signals from authentication factors.

#### Source IP Address

The source IP address the user is connecting from can be used as a risk signal or access restriction, typically in an allow-list based approach. This could either be based on a static list (such as corporate office ranges) or a dynamic list (such as previous IP addresses the user has authenticated from).

##### Pros

- Very easy for users.
- Requires minimal configuration and management from administrative staff.

##### Cons

- Doesn't provide any protection if the user's system is compromised.
- Doesn't provide any protection against rogue insiders.
- Trusted IP addresses must be carefully restricted (for example, if the open guest Wi-Fi uses the main corporate IP range).

#### Geolocation

Rather than using the exact IP address of the user, the geographic location that the IP address is registered to can be used. This is less precise, but may be more feasible to implement in environments where IP addresses are not static. A common usage would be to require additional authentication factors when an authentication attempt is made from outside of the user's normal country.

##### Pros

- Very easy for users.

##### Cons

- Doesn't provide any protection if the user's system is compromised.
- Doesn't provide any protection against rogue insiders.
- Easy for an attacker to bypass by obtaining IP addresses in the trusted country or location.
- Privacy features such as Apple's [iCloud Private Relay](https://support.apple.com/en-us/102602) and VPNs can make this less accurate.

#### Geofencing

Geofencing is a more precise version of geolocation, which allows the user to define a specific area in which they are allowed to authenticate. This is often used in mobile applications, where the user's location can be determined with a high degree of accuracy using geopositioning hardware like GPS.

##### Pros

- Very easy for users.
- Provides a high level of protection against remote attackers.

##### Cons

- Doesn't provide any protection if the user's system is compromised.
- Doesn't provide any protection against rogue insiders.
- Doesn't provide any protection against attackers who are physically close to the trusted location.

### Something You Do

Behavioral biometrics, such as keystroke patterns or gait, are a form of "something you are," not a separate authentication factor. Under [NIST's biometric requirements](https://pages.nist.gov/800-63-4/sp800-63b.html#biometric_use), biometric comparison must be combined with an authenticated physical authenticator. General activity signals, such as login times or navigation patterns, can inform risk decisions but do not by themselves constitute MFA.

#### Behavioral Profiling

Behavioral profiling is based on the way the user interacts with the application, such as the time of day they log in, the devices they use, and the way they navigate the application. This is rapidly becoming more common in web applications when combined with [Risk Based Authentication](#risk-based-authentication) and [User and Entity Behavior Analytics](https://learn.microsoft.com/en-us/azure/sentinel/identify-threats-with-entity-behavior-analytics) (UEBA) systems.

##### Pros

- Doesn't require user interaction.
- Can be used to continuously authenticate the user.
- Combines well with other factors to increase the level of assurance in the user's identity.

##### Cons

- Early implementations of behavioral profiling were often inaccurate and caused a significant number of false positives.
- Requires large amounts of data and processing power to analyze the user's behavior.
- May be difficult to implement in environments where the user's behavior is likely to change frequently.

#### Keystroke & Mouse Dynamics

Keystroke and mouse dynamics are based on the way the user types and moves their mouse. For example, the time between key presses, the time between key presses and releases, and the speed and acceleration of the mouse. Largely theoretical, and not widely used in practice.

##### Pros

- Can be used without requiring any additional hardware.
- Can be used without requiring any additional interaction from the user.
- Can be used to continuously authenticate the user.
- Can be used to detect when the user is not the one using the system.
- Can be used to detect when the user is under duress.
- Can be used to detect when the user is not in a fit state to use the system.

##### Cons

- Unlikely to be accurate enough to be used as a standalone factor.
- May be spoofed by AI or other advanced attacks.

#### Gait Analysis

Gait analysis is based on the way the user walks using cameras and sensors. They are often used in physical security systems, but are not widely used in web applications. Mobile device applications may be able to use the accelerometer to detect the user's gait and use this as an additional factor, however this is still largely theoretical.

##### Pros

- Very difficult to spoof.
- May be used without requiring any additional interaction from the user.

##### Cons

- Requires specific hardware to implement.
- Use outside of physical security systems is not widely tested.

### Adaptive or Risk-Based Authentication

Adaptive (or Risk-Based) Authentication adjusts authentication requirements dynamically based on the context of the login attempt. This technique helps improve user experience while strengthening security by applying additional verification steps only when risk is elevated.

Common signals used to determine risk include:

- Geolocation and IP reputation
- Device fingerprinting
- Time of access (e.g., 3 AM login)
- Behavioral biometrics (e.g., typing speed or mouse movements)
- Known compromised credentials

If risk is detected, the system may:

- Prompt for an additional factor (e.g., OTP)
- Enforce re-authentication
- Deny access and trigger alerting or account protection flows

For more details on when to trigger reauthentication after high-risk events—such as account recovery or suspicious activity—see the [Reauthentication After Risk Events](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#re-authentication-after-risk-events) section in the Authentication Cheat Sheet

This method is widely used in modern authentication systems to balance usability and security. However, developers must ensure that risk signals cannot be spoofed and that fallback mechanisms are not weaker than the primary MFA methods.

**Example Use Case**: A user logs in from a trusted device in a usual location — no additional prompt is needed. But if they log in from a new country using a Tor exit node, the system requires SMS verification or triggers an account lock until further verification.

### MFA Attack Patterns and Mitigations

Attackers increasingly target weaknesses in MFA deployments and authentication workflows rather than attempting to defeat MFA itself. The following sections describe common attack patterns and recommended mitigations based on guidance from [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html), [CISA's Implementing Phishing-Resistant MFA](https://www.cisa.gov/sites/default/files/publications/fact-sheet-implementing-phishing-resistant-mfa-508c.pdf), the [FIDO Alliance Specifications](https://fidoalliance.org/specifications/), and [OAuth 2.0 Security Best Current Practice (RFC 9700)](https://datatracker.ietf.org/doc/rfc9700/).

#### General Mitigation: Primary Phishing-Resistant Control

Prefer phishing-resistant authenticators (FIDO2/WebAuthn), which bind authentication to the legitimate origin and resist credential theft, MFA fatigue, and reverse-proxy phishing. See the Passkeys section for additional guidance.

#### MFA Fatigue (Push Notification Bombing)

Attackers repeatedly send MFA push notifications, often combined with social engineering, hoping the user eventually approves one.

##### Mitigations

- Require challenge-response push authentication (for example, number matching) to prevent blind approval of authentication requests.
- Rate-limit or cap push notifications to prevent repeated prompt abuse.
- Monitor for anomalous authentication activity, such as multiple push prompts in a short period or new-device token reuse.

#### Real-Time Phishing Using Reverse Proxies

Attackers use reverse-proxy phishing frameworks (such as Evilginx, Modlishka, and Muraena) to present convincing copies of legitimate login pages. These frameworks relay authentication traffic between the user and the legitimate service, allowing attackers to capture credentials and session tokens in real-time.

##### Mitigations

- Monitor for anomalous authentication and session activity that may indicate credential or session compromise (for example, impossible travel, new ASN, or sudden MFA method changes).
- Use phishing-resistant authenticators (see Passkeys section), which bind authentication to the legitimate origin and are resistant to real-time phishing attacks.

#### SIM Swap and Phone Number Takeover

Attackers convince a telecommunications provider to transfer a victim's phone number, allowing interception of SMS or voice-based one-time passwords.

##### Mitigations

- Encourage carrier account PINs or port-out protection where available to reduce unauthorized number transfers.
- Monitor for unexpected phone-number changes or SIM replacement events.
- Prefer phishing-resistant authenticators or TOTP instead of SMS/voice OTP.
- See also: [SMS Messages and Phone Calls](#sms-messages-and-phone-calls).

#### Device Binding Bypass

Attackers attempt to bypass device-based authentication by extracting exportable cryptographic keys or replaying cloned device attributes when authenticators are not hardware-protected.

##### Mitigations

- Prefer hardware-backed, non-exportable cryptographic keys (for example, platform authenticators backed by TPM, Secure Enclave, or Android StrongBox).
- Validate authenticator attestation where required by organizational policy.

#### MFA Downgrade Attacks

Attackers attempt to force authentication through legacy protocols or authentication flows that do not enforce the same MFA requirements as modern authentication methods. Weak fallback mechanisms or legacy authentication endpoints can allow users to authenticate with lower-assurance factors than intended.

##### Mitigations

- Disable legacy authentication protocols and endpoints that cannot enforce MFA consistently.
- Prevent fallback from phishing-resistant authenticators to lower-assurance authentication methods unless required by a documented security policy.
- Follow OAuth 2.0 Security Best Current Practice (RFC 9700) to prevent OAuth protocol-level downgrade and mix-up attacks.

## Passkey Security

> **Source:** [Passkey Security](https://cheatsheetseries.owasp.org/cheatsheets/Passkey_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Passkeys are [discoverable WebAuthn public key credentials](https://www.w3.org/TR/webauthn-3/#client-side-discoverable-public-key-credential-source) used for passwordless authentication without sending a shared secret to the application. Web applications exercise passkeys through WebAuthn. The authenticator keeps the private key and the relying party stores a public key. A passkey is scoped to a relying party identifier (RP ID), which provides phishing resistance when the ceremony and server-side verification are implemented correctly.

This cheat sheet is for developers who build the WebAuthn relying-party side of passkey registration, authentication, credential management, and account recovery. Its scope includes passkeys used with [platform and roaming authenticators](https://www.w3.org/TR/webauthn-3/#sctn-authenticator-taxonomy), including security keys that support discoverable credentials, and both synced and device-bound passkeys. [Legacy FIDO U2F/CTAP1 second-factor credentials](https://www.w3.org/TR/webauthn-3/#sctn-backwards-compatibility-with-fido-u2f) are outside this passkey scope. The main recommendations are:

- Use a maintained WebAuthn server library and validate every required ceremony field on the server.
- Bind registration to the intended account and require recent authentication before changing passkeys.
- Treat user presence (UP) and user verification (UV) as different security properties.
- Design credential management and recovery with the same care as authentication.
- Support more than one authenticator so that the loss of one device does not force a weak recovery path.

### Understand the Security Model

#### Components and Terms

- The **relying party (RP)** is the application that registers and authenticates users.
- The **client** is the browser or other software that calls the WebAuthn API.
- The **authenticator** creates credentials and signs authentication assertions. It can be built into a device or be a separate roaming authenticator.
- The [**WebAuthn/FIDO2 protocol**](https://www.w3.org/TR/webauthn-3/#sctn-intro) spans the RP, client, and authenticator. WebAuthn is the web-facing API used by RPs, while CTAP handles communication between clients and roaming authenticators.
- A **passkey** is a discoverable WebAuthn credential used for passwordless authentication. It may be held by a platform or roaming authenticator, and it may be device-bound or synced between devices by a credential provider.
- The **credential ID** identifies a credential to the RP. The corresponding private key remains under authenticator control.
- The **user handle** is an opaque RP-generated identifier for an account. It is not a username or email address.
- **User presence (UP)** shows that a person interacted with the authenticator.
- **User verification (UV)** shows that the authenticator locally verified the user, for example with a PIN or biometric.

Do not treat UP and UV as equivalent. Require UV when the passkey is expected to satisfy a multi-factor or other high-assurance authentication policy. A passkey is not automatically multi-factor merely because an authenticator supports UV; the RP must [request UV and verify the returned UV flag](https://www.w3.org/TR/webauthn-3/#user-verification).

#### Security Properties and Limits

[WebAuthn credentials are scoped to an RP](https://www.w3.org/TR/webauthn-3/#sctn-rp-benefits), and the signed response includes a hash of that RP ID. The client data also binds the response to the web origin and ceremony challenge. Correct verification therefore gives the RP phishing resistance, verifier-name binding, and replay resistance.

These properties do not protect every part of the account lifecycle. Passkeys do not by themselves prevent:

- A compromised authenticated session from adding an attacker-controlled passkey.
- An insecure recovery process from bypassing passkey authentication.
- Server-side credential records from being associated with the wrong account.
- Application code, authorization, or session-management vulnerabilities.
- Compromise of a device, authenticator, or account used to synchronize passkeys.

Apply the controls in the [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), and [Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html) to the surrounding application.

#### Choose the RP ID Carefully

An RP ID determines where a credential can be used. Use the narrowest stable domain that covers the intended application. Do not use a registrable parent domain merely to share credentials with unrelated subdomains. The WebAuthn specification discusses the [security implications of the RP ID and origin relationship](https://www.w3.org/TR/webauthn-3/#sctn-validating-origin); compromise of an origin within the RP ID scope may affect the security of that RP deployment.

The server must use the same expected RP ID during registration and authentication. Maintain an explicit allowlist of permitted origins, including scheme, host, and port where applicable. Do not construct an expected origin from an untrusted request header.

Native app origins differ by platform. [Apple's native passkey API reports an HTTPS origin](https://developer.apple.com/forums/thread/719003) formed from `https://` and the RP ID, validated against the app's Associated Domains. The origin an Android app reports is a string such as `android:apk-key-hash:<hash>`, derived from the app signing certificate, and both platforms decide whether an app may use your RP ID from an association file that you host: [`/.well-known/assetlinks.json`](https://developer.android.com/identity/credential-manager/prerequisites) on Android and the `webcredentials` entries in [`/.well-known/apple-app-site-association`](https://developer.apple.com/documentation/xcode/supporting-associated-domains) on Apple platforms (see the [RP ID and app origins overview](https://web.dev/articles/webauthn-rp-id)). The server must [match each expected origin against its allowlist](https://developer.android.com/identity/passkeys/create-passkeys) as an explicit entry, never a pattern. Treat both association files as part of the RP attack surface with the same change control as the origin allowlist. An overly broad association can authorize unintended apps to use RP-scoped credentials. A permissive server origin allowlist weakens response verification; it does not by itself bypass the platform's app-association checks or give an app access to a user's passkey.

[WebAuthn is restricted to secure contexts](https://www.w3.org/TR/webauthn-3/#sctn-api). Serve registration, authentication, and credential-management pages over HTTPS and protect them against script injection. Avoid cross-origin WebAuthn in embedded frames unless it is an intentional, reviewed design using the [required Permissions Policy and origin validation](https://www.w3.org/TR/webauthn-3/#sctn-iframe-guidance).

#### Use a Maintained Library

Do not implement CBOR parsing, COSE key handling, attestation validation, or assertion verification yourself. Use a maintained server-side WebAuthn library that implements the W3C relying-party verification steps. Keep it updated and include successful and failing registration and authentication ceremonies in automated tests.

The library does not make account workflows safe automatically. The application remains responsible for issuing and consuming challenges, choosing the expected RP ID and origins, binding ceremonies to the correct session and account, enforcing UV policy, and managing credential lifecycle events.

### Secure Passkey Registration

#### Establish an Authorized Account Context

Registration attaches a new authenticator to an account and must be treated as a sensitive account change.

- For an existing account, require a recently authenticated session and reauthenticate the user before adding a passkey. Do not rely only on possession of a long-lived session cookie.
- For a new account, bind the ceremony to the verified account-creation transaction. Do not allow a client-supplied account identifier to select a different account.
- Protect the registration initiation and completion endpoints against cross-site request forgery as described in the [Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
- Apply rate limits and log failed and successful enrollment attempts.

#### Generate and Bind Registration Options

Generate the registration challenge with a cryptographically secure random number generator. The WebAuthn security considerations require [at least 16 random bytes](https://www.w3.org/TR/webauthn-3/#sctn-cryptographic-challenges); expire it promptly and accept it only once. Store server-side state that binds the challenge to:

- The registration ceremony type.
- The authenticated session and intended account.
- The expected RP ID and origin policy.
- The intended user-verification and attestation policy.
- An expiration time.

Do not accept a challenge issued for authentication as a registration challenge, or a challenge issued for one account in a ceremony for another account. Invalidate the challenge whether the ceremony succeeds or fails in a terminal way.

Generate a stable, opaque user handle that contains no username, email address, or other personally identifying information, following the WebAuthn [user-handle privacy guidance](https://www.w3.org/TR/webauthn-3/#sctn-user-handle-privacy). A user handle must identify one account within the RP and must not be reassigned to another account.

Include the account's existing credential IDs in `excludeCredentials` when possible. This improves the user experience by discouraging duplicate registration, but the server must still enforce credential uniqueness.

#### Verify the Registration Response

The following diagram summarizes the key checks and which party performs them.

![Registration ceremony sequence diagram](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Passkey_Security_Cheat_Sheet_Registration_Ceremony.png)

Follow the WebAuthn [registration verification procedure](https://www.w3.org/TR/webauthn-3/#sctn-registering-a-new-credential) through the selected library. At minimum, ensure that the server verifies:

- The client data type is `webauthn.create`.
- The returned challenge exactly matches the issued challenge.
- The origin is an exact member of the RP's allowlist.
- The RP ID hash matches the expected RP ID.
- The UP flag is set and the UV flag is set when UV was required.
- The public-key algorithm is one the RP offered and permits.
- The credential public key and credential ID are structurally valid.
- Any requested extensions are processed according to RP policy.
- Attestation is verified when the RP's policy requires it.

Store the credential only after all checks succeed. Associate it with the account from the server-side ceremony state, never an account identifier returned by the client. Enforce credential ID uniqueness across the RP and make the account association change auditable.

Store the credential ID, public key, user handle association, algorithm, relevant transports, creation time, a user-visible name, and the authenticator data needed by the library. Store backup eligibility and backup state when returned, but do not expose those values as proof that a particular provider or device is trustworthy.

#### Minimize Attestation

Most public-facing applications should use no attestation and should not restrict users to a list of authenticator models. WebAuthn documents both [attestation limitations](https://www.w3.org/TR/webauthn-3/#sctn-attestation-limitations) and [attestation privacy considerations](https://www.w3.org/TR/webauthn-3/#sctn-attestation-privacy); attestation does not prove that an authenticator will remain uncompromised.

Use attestation only when a documented enterprise or regulatory requirement justifies enforcing authenticator provenance or properties. If attestation is required:

- Define acceptable formats, trust anchors, metadata, and failure behavior.
- Validate the complete attestation chain and relevant status information.
- Plan for metadata and trust-anchor updates.
- Provide a reviewed exception or recovery process that does not silently remove the policy.

### Secure Passkey Authentication

#### Generate and Bind Authentication Options

Generate a fresh, unpredictable challenge for every authentication ceremony. Bind it to the ceremony type, expected RP ID, origin policy, UV requirement, session or transaction context, and expiration time. Consume it once.

For account-first authentication, send only the credential IDs registered to the selected account in `allowCredentials`. Use generic responses and consistent behavior so that the account selection step does not disclose whether an account exists.

For username-less authentication, omit `allowCredentials` and use discoverable credentials. After verification, use the returned user handle and credential ID to locate the server-side credential record. Require both values to resolve to the same account; do not trust a display name or other client-provided identity claim.

Conditional mediation can improve passkey discovery and coexist with password fields. Treat it as another way to start the same authentication ceremony, not as a different verification policy.

#### Verify the Authentication Response

The following diagram summarizes the key checks and which party performs them.

![Authentication ceremony sequence diagram](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Passkey_Security_Cheat_Sheet_Authentication_Ceremony.png)

Follow the WebAuthn [assertion verification procedure](https://www.w3.org/TR/webauthn-3/#sctn-verifying-assertion) through the selected library. At minimum, ensure that the server verifies:

- The client data type is `webauthn.get`.
- The challenge exactly matches an unexpired, unused authentication challenge.
- The origin is an exact member of the RP's allowlist.
- The RP ID hash matches the expected RP ID.
- The credential ID exists and belongs to the account selected by the verified ceremony context.
- The assertion signature is valid under the stored public key.
- The UP flag is set and the UV flag is set when required by policy.
- The returned user handle, when present, matches the credential's account.
- Extension outputs and cross-origin indicators comply with RP policy.

Create an authenticated application session only after every required check succeeds. Rotate the session identifier at authentication and apply the controls in the [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

#### Handle Signature Counters Conservatively

A non-increasing signature counter can signal that an authenticator may be cloned, malfunctioning, or affected by out-of-order assertion processing. The WebAuthn [signature counter considerations](https://www.w3.org/TR/webauthn-3/#sctn-sign-counter) explain why it is not a universal clone-detection mechanism. Some authenticators do not implement a counter, and a synced credential may be used from multiple authenticator instances whose counter behavior is not strictly monotonic.

When a nonzero counter does not increase as expected, record the event and evaluate it with other account-risk signals. Do not automatically lock out every user solely because of a counter anomaly. Follow the selected library's guidance and document the RP's response policy.

#### Use Safe Failure Behavior

Return generic authentication errors that do not distinguish an unknown account, unknown credential, failed signature, or policy rejection. Keep externally visible response timing as consistent as practical. Rate-limit attempts by account and relevant network or device signals without creating a trivial account-lockout denial of service.

A failed passkey ceremony must not silently fall back to a weaker method. Adversary-in-the-middle phishing does not defeat a correctly verified passkey ceremony; it steers the user to whatever fallback is still enabled, and [NIST SP 800-63B-4 Section 3.2.5](https://pages.nist.gov/800-63-4/sp800-63b.html) states that authenticators involving manual entry of an authenticator output, such as OTP and out-of-band codes, are not phishing-resistant. If a fallback exists, make it a deliberate, logged, policy-documented path rather than the default error handling, and follow the [MFA Downgrade Attacks](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#mfa-downgrade-attacks) guidance.

Log enough structured information to investigate failures, but never log challenges, full credential responses, session identifiers, or unnecessary user-identifying data. The [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) provides general logging guidance.

### Protect the Credential Lifecycle and Recovery

#### Credential Management

Provide an authenticated credential-management page where users can view and manage their passkeys. Show a user-chosen name, creation date, and last-used date rather than exposing raw credential IDs.

- Require recent reauthentication before adding or removing a passkey, changing recovery methods, or disabling the last strong authenticator.
- Allow users to register more than one authenticator.
- Notify the user through an existing trusted channel when a passkey is added or removed.
- Record enrollment, use, renaming, and revocation as security events.
- Revoke a credential immediately on the server when the user removes it or reports compromise.
- Confirm that at least one usable authentication or recovery method remains before removing the final passkey.

Do not silently reassign a credential record to a different account. Database migrations and administrative changes to credential-to-account mappings require integrity controls, authorization checks, and audit logs. Treat an unexpected duplicate credential ID as an error requiring investigation.

Where supported, WebAuthn signal methods can help a credential provider reconcile its local state after an RP deletes credentials or updates user details. These signals improve consistency but do not replace server-side revocation.

#### Account Recovery and Bootstrap

The effective security of a passkey account is limited by its weakest recovery route. Prefer recovery based on another already-registered passkey, a separately secured recovery code, or a high-assurance identity process appropriate to the application's risk.

- Encourage users to register multiple authenticators before one is lost.
- Protect recovery codes as authentication secrets, store them securely, make them single-use, and let users regenerate them.
- Apply rate limits, risk checks, notifications, and additional review to recovery attempts.
- Do not let email or SMS recovery silently bypass a stronger authentication policy for high-risk accounts.
- After recovery, rotate sessions, review or revoke existing credentials as appropriate, and notify the user.
- Apply a delay or additional verification before high-impact actions when recovery indicates elevated takeover risk.

For more detail, see the [Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) and the recovery guidance in the [Multifactor Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html).

#### Synced and Device-Bound Credentials

[Synced passkeys](https://pages.nist.gov/800-63-4/sp800-63b/syncable/) improve availability by making a credential usable on more than one device. Their security also depends on the credential provider's account protection, device enrollment, synchronization, and recovery controls. Device-bound credentials can support policies that require the key to remain on a particular authenticator, but require an availability and replacement plan.

Choose policy according to the application's threat model:

- Public-facing applications should generally support synced passkeys and provide users with secure options for additional authenticators and recovery.
- Enterprise or high-assurance applications may require managed, device-bound authenticators and attestation when the operational controls justify the reduced interoperability.
- Use backup eligibility and backup state as risk and policy inputs where appropriate. Do not treat them as user-verification results or as proof of a specific sync provider.
- Do not assume a synced passkey can meet every assurance level. For example, NIST does not allow syncable authenticators at Authentication Assurance Level 3 (AAL3).

### Deployment and Review Checklist

Use this checklist together with the W3C [registration](https://www.w3.org/TR/webauthn-3/#sctn-registering-a-new-credential) and [authentication](https://www.w3.org/TR/webauthn-3/#sctn-verifying-assertion) verification procedures.

#### Server and Protocol

- Use a maintained WebAuthn server library and keep it updated.
- Generate cryptographically random, single-use, expiring challenges of at least 16 bytes.
- Bind each challenge to its ceremony, account or session context, RP ID, origin, and policy.
- Maintain an exact origin allowlist and a documented RP ID.
- List native app origins explicitly and change-control the `assetlinks.json` and `apple-app-site-association` files together with the allowlist.
- Verify type, challenge, origin, RP ID hash, UP, required UV, credential ownership, and signature.
- Store public keys and credential metadata safely and enforce credential ID uniqueness.
- Treat counters as risk signals rather than universal clone detection.
- Test registration and authentication with supported browsers and authenticators.

#### Account Workflows

- Require recent authentication for passkey enrollment, removal, and recovery changes.
- Bind new credentials to the server-selected account.
- Support multiple authenticators and immediate server-side revocation.
- Notify users of credential lifecycle changes and retain useful audit events.
- Make recovery commensurate with the security of passkey authentication.
- Use generic error messages and protect account-first flows from enumeration.
- Never let a failed passkey ceremony silently fall back to a non-phishing-resistant method.

#### Privacy and Operations

- Keep user handles opaque and free of personally identifying information.
- Avoid attestation unless a documented requirement justifies it.
- Do not expose raw credential IDs in user interfaces, URLs, or logs.
- Minimize stored authenticator metadata and restrict access to it.
- Monitor registration, authentication, recovery, and administrative mapping changes.
- Document incident procedures for a compromised authenticator, sync account, RP origin, or WebAuthn library.

## Forgot Password

> **Source:** [Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

In order to implement a proper user management system, systems integrate a **Forgot Password** service that allows the user to request a password reset.

Even though this functionality looks straightforward and easy to implement, it is a common source of vulnerabilities, such as the renowned [user enumeration attack](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration_and_Guessable_User_Account.html).

The following short guidelines can be used as a quick reference to protect the forgot password service:

- **Return a consistent message for both existent and non-existent accounts.**
- **Ensure that the time taken for the user response message is uniform.**
- **Use a side-channel to communicate the method to reset their password.**
- **Use [URL tokens](#url-tokens) for the simplest and fastest implementation.**
- **Ensure that generated tokens or codes are:**
    - **Randomly generated using a cryptographically safe algorithm.**
    - **Sufficiently long to protect against brute-force attacks.**
    - **Stored securely.**
    - **Single use and expire after an appropriate period.**
- **Do not make a change to the account until a valid token is presented, such as locking out the account.**

This cheat sheet is focused on resetting users passwords. For guidance on resetting multifactor authentication (MFA), see the relevant section in the [Multifactor Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#resetting-mfa).

### Forgot Password Service

The password reset process can be broken into two main steps, detailed in the following sections.

#### Forgot Password Request

When a user uses the forgot password service and inputs their username or email, the below should be followed to implement a secure process:

- Return a consistent message for both existent and non-existent accounts.
- Ensure that responses return in a consistent amount of time to prevent an attacker enumerating which accounts exist. This could be achieved by using asynchronous calls or by making sure that the same logic is followed, instead of using a quick exit method.
- Implement protections against excessive automated submissions such as rate-limiting on a per-account basis, requiring a CAPTCHA, or other controls. Otherwise an attacker could make thousands of password reset requests per hour for a given account, flooding the user's intake system (e.g., email inbox or SMS) with useless requests.
- Employ normal security measures, such as [SQL Injection Prevention methods](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) and [Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

#### User Resets Password

Once the user has proved their identity by providing the token (sent via an email) or code (sent via SMS or other mechanisms), they should reset their password to a new secure one. In order to secure this step, the measures that should be taken are:

- The user should confirm the password they set by writing it twice.
- Ensure that a secure password policy is in place, and is consistent with the rest of the application.
- Update and store the password following [secure practices](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- Send the user an email informing them that their password has been reset (do not send the password in the email!).
- Once they have set their new password, the user should then login through the usual mechanism. Don't automatically log the user in, as this introduces additional complexity to the authentication and session handling code, and increases the likelihood of introducing vulnerabilities.
- Ask the user if they want to invalidate all of their existing sessions, or invalidate the sessions automatically.

#### Account Recovery After Suspected Compromise

A password reset alone may not restore control of a compromised account. An attacker may still have an active session or may have changed recovery information or MFA methods.

When recovering a potentially compromised account:

- Do not rely solely on recently added or changed recovery information. Use independent, previously established recovery evidence, such as saved recovery codes, in a combination that meets the account's assurance requirements. See [NIST account recovery guidance](https://pages.nist.gov/800-63-4/sp800-63b/events/#recovery).
- Do not automatically restore superseded recovery addresses or phone numbers; they may have been replaced because they were lost or compromised.
- Promptly suspend or invalidate authenticators identified as compromised, following [NIST guidance for compromised authenticators](https://pages.nist.gov/800-63-4/sp800-63b/events/#loss-theft-damage-and-compromise).
- Review recovery addresses, phone numbers, and MFA methods with the verified account owner, and remove unauthorized changes. [Google's compromised-account guidance](https://support.google.com/accounts/answer/6294825) identifies these settings for review and correction.
- After successful recovery, invalidate existing sessions and outstanding password reset and recovery links or codes so they cannot restore an attacker's access. See [session invalidation guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-expiration).
- Notify the user through all applicable registered notification addresses, including established channels that remain safe to use. Include instructions and contact information for reporting unauthorized recovery, as described in [NIST account notification guidance](https://pages.nist.gov/800-63-4/sp800-63b/events/#notification).

See [reauthentication after risk events](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#re-authentication-after-risk-events) and [MFA recovery](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#resetting-mfa) for related controls.

### Methods

In order to allow a user to request a password reset, you will need to have some way to identify the user, or a means to reach out to them through a side-channel.

This can be done through any of the following methods:

- [URL tokens](#url-tokens).
- [PINs](#pins)
- [Offline methods](#offline-methods)
- [Security questions](#security-questions).

These methods can be used together to provide a greater degree of assurance that the user is who they claim to be. No matter what, you must ensure that a user always has a way to recover their account, even if that involves contacting the support team and proving their identity to staff.

#### General Security Practices

It is essential to employ good security practices for the reset identifiers (tokens, codes, PINs, etc.). Some points don't apply to the [offline methods](#offline-methods), such as the lifetime restriction. All tokens and codes should be:

- Generated using a [cryptographically secure random number generator](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#secure-random-number-generation).
    - It is also possible to use JSON Web Tokens (JWTs) in place of random tokens, although this can introduce additional vulnerability, such as those discussed in the [JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html).
- Long enough to protect against brute-force attacks.
- Linked to an individual user in the database.
- Invalidated after they have been used.
- Stored in a secure manner, as discussed in the [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

#### URL Tokens

URL tokens are passed in the query string of the URL, and are typically sent to the user via email. The basic overview of the process is as follows:

1. Generate a token for the user and attach it in the URL query string.
2. Send this token to the user via email.
   - Don't rely on the [Host](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host) header while creating the reset URLs to avoid [Host Header Injection](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/07-Input_Validation_Testing/17-Testing_for_Host_Header_Injection) attacks. The URL should either be hard-coded, or validated against a list of trusted domains.
   - Ensure that the URL is using HTTPS.
3. The user receives the email, and browses to the URL with the attached token.
   - Ensure that the reset password page adds the [Referrer Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy) tag with the `no-referrer` value in order to avoid [referrer leakage](https://portswigger.net/kb/issues/00500400_cross-domain-referer-leakage).
   - Implement appropriate protection to prevent users from brute-forcing tokens in the URL, such as rate limiting.
4. If required, perform any additional validation steps such as requiring the user to answer [security questions](#security-questions).
5. Let the user create a new password and confirm it. Ensure that the same password policy used elsewhere in the application is applied.

*Note:* URL tokens can follow on the same behavior of the [PINs](#pins) by creating a restricted session from the token. Decision should be made based on the needs and the expertise of the developer.

#### PINs

PINs are numbers (between 6 and 12 digits) that are sent to the user through a side-channel such as SMS.

1. Generate a PIN.
2. Send it to the user via SMS or another mechanism.
   - Breaking the PIN up with spaces makes it easier for the user to read and enter.
3. The user then enters the PIN along with their username on the password reset page.
4. Create a limited session from that PIN that only permits the user to reset their password.
5. Let the user create a new password and confirm it. Ensure that the same password policy used elsewhere in the application is applied.

#### Offline Methods

Offline methods differ from other methods by allowing the user to reset their password without requesting a special identifier (such as a token or PIN) from the backend. However, authentication still needs to be conducted by the backend to ensure that the request is legitimate. Offline methods provide a certain identifier either on registration, or when the user wishes to configure it.

These identifiers should be stored offline and in a secure fashion (*e.g.* password managers), and the backend should properly follow the [general security practices](#general-security-practices). Some implementations are built on [hardware OTP tokens](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#hardware-otp-tokens), [certificates](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#certificates), or any other implementation that could be used inside of an enterprise. These are out of scope for this cheat sheet.

If account has MFA enabled, and you are looking for MFA recovery, different methods can be found in the corresponding [Multifactor Authentication cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#resetting-mfa).

#### Security Questions

Security questions should not be used as the sole mechanism for resetting passwords due to their answers frequently being easily guessable or obtainable by attackers. However, they can provide an additional layer of security when combined with the other methods discussed in this cheat sheet. If they are used, then ensure that secure questions are chosen as discussed in the [Security Questions cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Choosing_and_Using_Security_Questions_Cheat_Sheet.html).

### Account Lockout

Accounts should not be locked out in response to a forgotten password attack, as this can be used to deny access to users with known usernames. For more details on account lockouts, see the [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).

## Choosing and Using Security Questions

> **Source:** [Choosing and Using Security Questions](https://cheatsheetseries.owasp.org/cheatsheets/Choosing_and_Using_Security_Questions_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

**WARNING: Security questions are no longer recognized as an acceptable authentication factor per [NIST SP 800-63](https://pages.nist.gov/800-63-3/sp800-63b.html). Account recovery is just an alternate way to authenticate so it should be no weaker than regular authentication. See [SP 800-63B sec 5.1.1.2 paragraph 4](https://pages.nist.gov/800-63-3/sp800-63b.html#sec5): *Verifiers SHALL NOT prompt subscribers to use specific types of information (e.g., “What was the name of your first pet?”) when choosing memorized secrets*.**

If you are curious, please have a look at this [study](https://www.microsoft.com/en-us/research/publication/its-no-secret-measuring-the-security-and-reliability-of-authentication-via-secret-questions/) by Microsoft Research in 2009 and this [study](https://research.google/pubs/pub43783/) performed at Google in 2015. The accompanying [Security blog](https://security.googleblog.com/2015/05/new-research-some-tough-questions-for.html) update includes an infographic on the issues identified with security questions.

**Please Note:** While there are no acceptable uses of security questions in secure software, this cheat sheet provides guidance on how to choose strong security questions for legacy purposes.

### Choosing Security Questions

#### Desired Characteristics

Any security questions presented to users to reset forgotten passwords must meet the following characteristics:

| Characteristic | Explanation |
|----------------|-------------|
| Memorable | The user must be able to recall the answer to the question, potentially years after creating their account. |
| Consistent | The answer to the question must not change over time. |
| Applicable | The user must be able to answer the question. |
| Confidential | The answer to the question must be hard for an attacker to obtain. |
| Specific | The answer should be clear to the user. |

#### Types of Security Questions

<!-- textlint-disable terminology -->
Security questions fall into two main types. With *user defined* security questions, the user must choose a question from a list, and provide an answer to the question. Common examples are "What is your favourite colour?" or "What was your first car?"
<!-- textlint-enable terminology -->

These are easy for applications to implement, as the additional information required is provided by the user when they first create their account. However, users will often choose weak or easily discovered answers to these questions.

*System defined* security questions are based on information that is already known about the user. This approach avoids having to ask the user to provide specific security questions and answers, and also prevents them from being able to choose weak details. However it relies on sufficient information already being stored about the user, and on this information being hard for an attacker to obtain.

#### User Defined Security Questions

##### Bad Questions

Any questions that do not have all of the characteristics discussed above should be avoided. The table below gives some examples of bad security questions:

| Question | Problem |
|----------|---------|
| When is your date of birth? | Easy for an attacker to discover. |
| What is your memorable date? | Most users will just enter their birthday. |
| What is your favourite movie? | Likely to change over time. |
| What is your favourite cricket team? | Not applicable to most users. |
| What is the make and model of your first car? | Fairly small range of likely answers. |
| What is your nickname? | This could be guessed by glancing through social media posts. |

Additionally, the context of the application must be considered when deciding whether questions are good or bad. For example, a question such as "What was your maths teacher's surname in your 8th year of school?" would be very easy to guess if it was using in a virtual learning environment for your school (as other students probably know this information), but would be much stronger for an online gaming website.

##### Good Questions

Many good security questions are not applicable to all users, so the best approach is to give the user a list of security questions that they can choose from. This allows you to have more specific questions (with more secure answers), while still providing every user with questions that they can answer.

The following list provides some examples of good questions:

- What is the name of a college you applied to but didn’t attend?
- What was the name of the first school you remember attending?
- Where was the destination of your most memorable school field trip?
- What was your maths teacher's surname in your 8th year of school?
- What was the name of your first stuffed toy?
- What was your driving instructor's first name?

Much like passwords, there is a risk that users will re-use recovery questions between different sites, which could expose the users if the other site is compromised. As such, there are benefits to having unique security questions that are unlikely to be shared between sites. An easy way to achieve this is to create more targeted questions based on the type of application. For example, on a share dealing platform, financial related questions such as "What is the first company you owned shares in?" could be used.

##### Allowing Users to Write Their Own Questions

Allowing users to write their own security questions can result in them choosing very strong and unique questions that would be very hard for an attacker to guess. However, there is also a significant risk that users will choose weak questions. In some cases, users might even set a recovery question to a reminder of what their password is - allowing anyone guessing their email address to compromise their account.

As such, it is generally best not to allow users to write their own questions.

##### Restricting Answers

Enforcing a minimum length for answers can prevent users from entering strings such as "a" or "123" for their answers. However, depending on the questions asked, it could also prevent users from being able to correctly answer the question. For example, asking for a first name or surname could result in a two letter answer such as "Li", and a color-based question could be four letters such as "blue".

Answers should also be checked against a denylist, including:

- The username or email address.
- The user's current password.
- Common strings such as "123" or "password".

##### Renewing Security Questions

If the security questions are not used as part of the main authentication process, then consider periodically (such as when they are changing their passwords after expiration) prompting the user to review their security questions and verify that they still know the answers. This should give them a chance to update any answers that may have changed (although ideally this shouldn't happen with good questions), and increases the likelihood that they will remember them if they ever need to recover their account.

#### System Defined Security Questions

System defined security questions are based on information that is already known about the user. The users' personal details are often used, including the full name, address and date of birth. However these can easily be obtained by an attacker from social media, and as such provide a very weak level of authentication.

The questions that can be used will vary hugely depending on the application, and how much information is already held about the user. When deciding which bits of information may be usable for security questions, the following areas should be considered:

- Will the user be able to remember the answer to the question?
- Could an attacker easily obtain this information from social media or other sources?
- Is the answer likely to be the same for a large number of users, or easily guessable?

### Using Security Questions

#### When to Use Security Questions

Applications should generally use a password along with a second authentication factor (such as an OTP code) to authenticate users. The combination of a password and security questions **does not constitute MFA**, as both factors as the same (i.e. something you know)..

**Security questions should never be relied upon as the sole mechanism to authenticate a user**. However, they can provide a useful additional layer of security when other stronger factors are not available. Common cases where they would be used include:

- Logging in.
- Resetting a forgotten password.
- Resetting a lost MFA token.

##### Authentication Flow

Security questions may be used as part of the main authentication flow to supplement passwords where MFA is not available. A typical authentication flow would be:

- The user enters their username and password.
- If the username and password are correct, the user is presented with the security question(s).
- If the answers are correct, the user is logged in.

If the answers to the security questions are incorrect, then this should be counted as a failed login attempt, and the account lockout counter should be incremented for the user.

##### Forgotten Password or Lost MFA Token Flow

Forgotten password functionality often provides a mechanism for attackers to enumerate user accounts if it is not correctly implemented. The following flow avoids this issue by only displaying the security questions once the user has proved ownership of the email address:

- The user enters email address (and solves a CAPTCHA).
- The application displays a generic message such as "If the email address was correct, an email will be sent to it".
- An email with a randomly generated, single-use link is sent to the user.
- The user clicks the link.
- The user is presented with the security question(s).
- If the answer is correct, the user can enter a new password.

#### How to Use Security Questions

##### Storing Answers

The answers to security questions may contain personal information about the user, and may also be re-used by the user between different applications. As such, they should be treated in the same way as passwords, and stored using a secure hashing algorithm such as Bcrypt. The [password storage cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) contains further guidance on this.

##### Comparing Answers

Comparing the answers provided by the user with the stored answer in a case insensitive manner makes it much easier for the user. The simplest way to do this is to convert the answer to lowercase before hashing the answer to store it, and then lowercase the user-provided answer before comparing them.

It is also beneficial to give the user some indication of the format that they should use to enter answers. This could be done through input validation, or simply by recommending that the user enters their details in a specific format. For example, when asking for a date, indicating that the format should be "DD/MM/YYYY" will mean that the user doesn't have to try and guess what format they entered when registering.

##### Updating Answers

When the user updates the answers to their security questions, this should be treated as a sensitive operation within the application. As such, the user should be required to re-authenticate themselves by entering their password (or ideally using MFA), in order to prevent an attacker updating the questions if they gain temporary access to the user's account.

##### Multiple Security Questions

When security questions are used, the user can either be asked a single question, or can be asked multiple questions at the same time. This provides a greater level of assurance, especially if the questions are diverse, as an attacker would need to obtain more information about the target user. A mixture of user-defined and system-defined questions can be very effective for this.

If the user is asked a single question out of a bank of possible questions, then this question **should not** be changed until the user has answered it correctly. If the attacker is allowed to try answering all of the different security questions, this greatly increases the chance that they will be able to guess or obtain the answer to one of them.

## Credential Stuffing Prevention

> **Source:** [Credential Stuffing Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheatsheet covers defenses against two common types of authentication-related attacks: credential stuffing and password spraying. Although these are separate, distinct attacks, in many cases the defenses that would be implemented to protect against them are the same, and they would also be effective at protecting against brute-force attacks.  A summary of these different attacks is listed below:

| Attack Type | Description |
|-------------|-------------|
| Brute Force | Testing multiple passwords from dictionary or other source against a single account. |
| Credential Stuffing | Testing username/password pairs obtained from the breach of another site. |
| Password Spraying | Testing a single weak password against a large number of different accounts.|

### Multi-Factor Authentication

[Multi-factor authentication (MFA)](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) is by far the best defense against the majority of password-related attacks, including credential stuffing and password spraying, with analysis by Microsoft suggesting that it would have stopped [99.9% of account compromises](https://techcommunity.microsoft.com/t5/Azure-Active-Directory-Identity/Your-Pa-word-doesn-t-matter/ba-p/731984). As such, it should be implemented wherever possible. Historically, depending on the audience of the application, it may not have been practical or feasible to enforce the use of MFA, however with modern browsers and mobile devices now supporting FIDO2 Passkeys and other forms of MFA, it is attainable for most use cases.

In order to balance security and usability, multi-factor authentication can be combined with other techniques to require the 2nd factor only in specific circumstances where there is reason to suspect that the login attempt may not be legitimate, such as a login from:

- A new browser/device or IP address.
- An unusual country or location.
- Specific countries that are considered untrusted or typically do not contain users of a service.
- An IP address that appears on known denylists or is associated with anonymization services, such as proxy or VPN services.
- An IP address that has tried to login to multiple accounts.
- A login attempt that appears to be scripted or from a bot rather than a human (i.e. large login volume sourced from a single IP or subnet).

Or an organization may choose to require MFA in the form of a "step-up" authentication for the above scenarios during a session combined with a request for a high risk activity such as:

- Large currency transactions
- Privileged or Administrative configuration changes

Additionally, for enterprise applications, known trusted IP ranges could be added to an allowlist so that MFA is not required when users connect from these ranges.

### Alternative Defenses

Where it is not possible to implement MFA, there are many alternative defenses that can be used to protect against credential stuffing and password spraying. In isolation none of these are as effective as MFA, however multiple, layered defenses can provide a reasonable degree of protection. In many cases, these mechanisms will also protect against brute-force or password spraying attacks.

Where an application has multiple user roles, it may be appropriate to implement different defenses for different roles. For example, it may not be feasible to enforce MFA for all users, but it should be possible to require that all administrators use it.

### Defense in Depth & Metrics

While not a specific technique, it is important to implement defenses that consider the impact of individual defenses being defeated or otherwise failing.  As an example, client-side defenses, such as device fingerprinting or JavaScript challenges, may be spoofed or bypassed and other layers of defense should be implemented to account for this.

Additionally, each defense should generate volume metrics for use as a detective mechanism. Ideally the metrics will include both detected and mitigated attack volume and allow for filtering on fields such as IP address. Monitoring and reporting on these metrics may identify defense failures or the presence of unidentified attacks, as well as the impact of new or improved defenses.

Finally, when administration of different defenses is performed by multiple teams, care should be taken to ensure there is communication and coordination when separate teams are performing maintenance, deployment or otherwise modifying individual defenses.

#### Secondary Passwords, PINs and Security Questions

Do not use security questions as an additional authentication challenge. [OWASP ASVS 5.0 requirement 6.4.2](https://github.com/OWASP/ASVS/blob/v5.0.0_release/5.0/en/0x15-V6-Authentication.md#v64-authentication-factor-lifecycle-and-recovery) excludes knowledge-based security questions. The [Security Questions Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Choosing_and_Using_Security_Questions_Cheat_Sheet.html) discusses limitations in legacy systems.

If a secondary password, PIN, or memorable word is used, request and verify the entire secret rather than selected characters, as required by [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver). Adding another knowledge factor does not constitute [MFA](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html); prefer an independent factor instead.

#### CAPTCHA

Requiring a user to solve a "Completely Automated Public Turing test to tell Computers and Humans Apart" (CAPTCHA) or similar puzzle for each login attempt can help to identify automated/bot attacks and help prevent automated login attempts, and may slow down credential stuffing or password spraying attacks.  However, CAPTCHAs are not perfect, and in many cases tools or services exist that can be used to break them with a reasonably high success rate.  Monitoring CAPTCHA solve rates may help identify impact to good users, as well as automated CAPTCHA breaking technology, possibly indicated by abnormally high solve rates.

To improve usability, it may be desirable to only require the user solve a CAPTCHA when the login request is considered suspicious or high risk, using the same criteria discussed in the MFA section.

#### IP Mitigation and Intelligence

Blocking IP addresses may be sufficient to stop less sophisticated attacks, but should not be used as the sole or primary defense due to the ease in circumvention.  It is more effective to have a graduated response to abuse that leverages multiple defensive measures depending on different factors of the attack.

Any process or decision to mitigate (including blocking and CAPTCHA) credential stuffing traffic from an IP address should consider a multitude of abuse scenarios, and not rely on a single predictable volume limit.  Short (i.e. burst) and long time periods should be considered, as well as high request volume and instances where one IP address, likely in concert with _many_ other IP addresses, generates low but consistent volumes of traffic.  Additionally, mitigation decisions should consider factors such as IP address classification (ex: residential vs hosting) and geolocation.  These factors may be leveraged to raise or lower mitigation thresholds in order to reduce potential impact on legitimate users or more aggressively mitigate abuse originating from abnormal sources.  Mitigations, especially blocking an IP address, should be temporary and processes should be in place to remove an IP address from a mitigated state as abuse declines or stops.

Many credential stuffing toolkits, such as [Sentry MBA](https://federalnewsnetwork.com/wp-content/uploads/2020/06/Shape-Threat-Research-Automating-Cybercrime-with-SentryMBA.pdf), offer built-in use of proxy networks to distribute requests across a large volume of unique IP addresses.  This may defeat both IP block-lists and rate limiting, as per IP request volume may remain relatively low, even on high volume attacks.  Correlating authentication traffic with proxy and similar IP address intelligence, as well as hosting provider IP address ranges can help identify highly distributed credential stuffing attacks, as well as serve as a mitigation trigger.  For example, every request originating from a hosting provider could be required to solve CAPTCHA.

There are both public and commercial sources of IP address intelligence and classification that may be leveraged as data sources for this purpose.  Additionally, some hosting providers publish their own IP address space, such as [AWS](https://docs.aws.amazon.com/vpc/latest/userguide/aws-ip-ranges.html).

Separate from blocking network connections, consider storing an account's IP address authentication history.  In case a recent IP address is added to a block or mitigation list, it may be appropriate to lock the account and notify the user.

#### Device Fingerprinting

Aside from the IP address, there are a number of different factors that can be used to attempt to fingerprint a device. Some of these can be obtained passively by the server from the HTTP headers (particularly the "User-Agent" header), including:

- Operating system & version
- Browser & version
- Language

Using JavaScript it is possible to access far more information, such as:

- Screen resolution
- Installed fonts
- Installed browser plugins

Using these various attributes, it is possible to create a fingerprint of the device. This fingerprint can then be matched against any browser attempting to login to the account, and if it doesn't match then the user can be prompted for additional authentication. Many users will have multiple devices or browsers that they use, so it is not practical to simply block attempts that do not match the existing fingerprints, however it is common to define a process for users or customers to view their device history and manage their remembered devices.  Also these attributes can be used to detect anomalous activity such as a device appearing to be running an older version of OS or Browser.

The [fingerprintjs2](https://github.com/Valve/fingerprintjs2) JavaScript library can be used to carry out client-side fingerprinting.

It should be noted that as all this information is provided by the client, it can potentially be spoofed by an attacker. In some cases spoofing these attributes is trivial (such as the "User-Agent") header, but in other cases it may be more difficult to modify these attributes.

#### Connection Fingerprinting

Similar to device fingerprinting, there are numerous fingerprinting techniques available for network connections.  Some examples include [JA3](https://github.com/salesforce/ja3), HTTP/2 fingerprinting and HTTP header order.  As these techniques typically focus on how a connection is made, connection fingerprinting may provide more accurate results than other defenses that rely on an indicator, such as an IP address, or request data, such as user agent string.

Connection fingerprinting may also be used in conjunction with other defenses to ascertain the truthfulness of an authentication request.  For example, if the user agent header and device fingerprint indicates a mobile device, but the connection fingerprint indicates a Python script, the request is likely suspect.

#### Require Unpredictable Usernames

Credential stuffing attacks rely on not just the re-use of passwords between multiple sites, but also the re-use of usernames. A significant number of websites use the email address as the username, and as most users will have a single email address they use for all their accounts, this makes the combination of an email address and password very effective for credential stuffing attacks.

Requiring users to create their own username when registering on the website makes it harder for an attacker to obtain valid username and password pairs for credential stuffing, as many of the available credential lists only include email addresses. Providing the user with a generated username can provide a higher degree of protection (as users are likely to choose the same username on most websites), but is user unfriendly. Additionally, care needs to be taken to ensure that the generated username is not predictable (such as being based on the user's full name, or sequential numeric IDs), as this could make enumerating valid usernames for a password spraying attack easier.

#### Multi-Step Login Processes

The majority of off-the-shelf tools are designed for a single step login process, where the credentials are POSTed to the server, and the response indicates whether or not the login attempt was successful. By adding additional steps to this process, such as requiring the username and password to be entered sequentially, or requiring that the user first obtains a random [CSRF Token](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) before they can login, this makes the attack slightly more difficult to perform, and doubles the number of requests that the attacker must make.

Multi-step login processes, however, should be mindful that they do not facilitate [user enumeration](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).  Enumerating users prior to a credential stuffing attack may result in a harder to identify, lower request volume attack.

#### Require JavaScript and Block Headless Browsers

Most tools used for these types of attacks will make direct POST requests to the server and read the responses, but will not download or execute JavaScript that was contained in them. By requiring the attacker to evaluate JavaScript in the response (for example to generate a valid token that must be submitted with the request), this forces the attacker to either use a real browser with an automation framework like Selenium or Headless Chrome, or to implement JavaScript parsing with another tool such as PhantomJS. Additionally, there are a number of techniques that can be used to identify [Headless Chrome](https://antoinevastel.com/bot%20detection/2018/01/17/detect-chrome-headless-v2.html) or [PhantomJS](https://blog.shapesecurity.com/2015/01/22/detecting-phantomjs-based-visitors/).

Please note that blocking visitors who have JavaScript disabled will reduce the accessibility of the website, especially to visitors who use screen readers. In certain jurisdictions this may be in breach of equalities legislation.

#### Degradation

A more aggressive defense against credential stuffing is to implement measures that increase the amount of time the attack takes to complete. This may include incrementally increasing the complexity of the JavaScript that must be evaluated, requiring users to solve a cryptographic or Proof-of-Work computational puzzle, introducing long wait periods before responding to requests, returning overly large HTML assets or returning randomized error messages.

These techniques provide some level of security without resorting to user tracking or profiling. They typically do not require a human in the loop, but rather constrain the minimum latency and/or the maximum request rate of a particular client implementation and the attacker's budget and sophistication, and requires a context-dependent risk assessment to gauge their efficacy, resistance to countermeasures and user experience impact.

#### Identifying Leaked Passwords

[ASVS v4.0 Password Security Requirements](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x11-V2-Authentication.md#v21-password-security-requirements) provision (2.1.7) on verifying new passwords presence in breached password datasets should be implemented.

There are both commercial and free services that may be of use for validating passwords presence in prior breaches.  A well known free service for this is [Pwned Passwords](https://haveibeenpwned.com/Passwords). You can host a copy of the application yourself, or use the [API](https://haveibeenpwned.com/API/v3#PwnedPasswords).

#### Notify users about unusual security events

When suspicious or unusual activity is detected, it may be appropriate to notify or warn the user. However, care should be taken that the user does not get overwhelmed with a large number of notifications that are not important to them, or they will just start to ignore or delete them.  Additionally, due to frequent reuse of passwords across multiple sites, the possibility that the users email account has also been compromised should be considered.

For example, it would generally not be appropriate to notify a user that there had been an attempt to login to their account with an incorrect password. However, if there had been a login with the correct password, but which had then failed the subsequent MFA check, the user should be notified so that they can change their password.  Subsequently, should the user request multiple password resets from different devices or IP addresses, it may be appropriate to prevent further access to the account pending further user verification processes.

Details related to current or recent logins should also be made visible to the user. For example, when they login to the application, the date, time and location of their previous login attempt could be displayed to them. Additionally, if the application supports concurrent sessions, the user should be able to view a list of all active sessions, and to terminate any other sessions that are not legitimate.

## Session Management

> **Source:** [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

**Web Authentication, Session Management, and Access Control**:

A web session is a sequence of network HTTP request and response transactions associated with the same user. Modern and complex web applications require the retaining of information or status about each user for the duration of multiple requests. Therefore, sessions provide the ability to establish variables – such as access rights and localization settings – which will apply to each and every interaction a user has with the web application for the duration of the session.

Web applications can create sessions to keep track of anonymous users after the very first user request. An example would be maintaining the user language preference. Additionally, web applications will make use of sessions once the user has authenticated. This ensures the ability to identify the user on any subsequent requests as well as being able to apply security access controls, authorized access to the user private data, and to increase the usability of the application. Therefore, current web applications can provide session capabilities both pre and post authentication.

Once an authenticated session has been established, the session ID (or token) is temporarily equivalent to the strongest authentication method used by the application, such as username and password, passphrases, one-time passwords (OTP), client-based digital certificates, smartcards, or biometrics (such as fingerprint or eye retina). See the OWASP [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).

HTTP is a stateless protocol ([RFC2616](https://www.ietf.org/rfc/rfc2616.txt) section 5), where each request and response pair is independent of other web interactions. Therefore, in order to introduce the concept of a session, it is required to implement session management capabilities that link both the authentication and access control (or authorization) modules commonly available in web applications:

![SessionDiagram](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Session_Management_Cheat_Sheet_Diagram.png)

The session ID or token binds the user authentication credentials (in the form of a user session) to the user HTTP traffic and the appropriate access controls enforced by the web application. The complexity of these three components (authentication, session management, and access control) in modern web applications, plus the fact that its implementation and binding resides on the web developer's hands (as web development frameworks do not provide strict relationships between these modules), makes the implementation of a secure session management module very challenging.

The disclosure, capture, prediction, brute force, or fixation of the session ID will lead to session hijacking (or sidejacking) attacks, where an attacker is able to fully impersonate a victim user in the web application. Attackers can perform two types of session hijacking attacks, targeted or generic. In a targeted attack, the attacker's goal is to impersonate a specific (or privileged) web application victim user. For generic attacks, the attacker's goal is to impersonate (or get access as) any valid or legitimate user in the web application.

### Session ID Properties

In order to keep the authenticated state and track the users progress within the web application, applications provide users with a **session identifier** (session ID or token) that is assigned at session creation time, and is shared and exchanged by the user and the web application for the duration of the session (it is sent on every HTTP request). The session ID is a `name=value` pair.

With the goal of implementing secure session IDs, the generation of identifiers (IDs or tokens) must meet the following properties.

#### Session ID Name Fingerprinting

The name used by the session ID should not be extremely descriptive nor offer unnecessary details about the purpose and meaning of the ID.

The session ID names used by the most common web application development frameworks [can be easily fingerprinted](https://wiki.owasp.org/index.php/Category:OWASP_Cookies_Database), such as `PHPSESSID` (PHP), `JSESSIONID` (J2EE), `CFID` & `CFTOKEN` (ColdFusion), `ASP.NET_SessionId` (ASP .NET), etc. Therefore, the session ID name can disclose the technologies and programming languages used by the web application.

It is recommended to change the default session ID name of the web development framework to a generic name, such as `id`.

#### Session ID Entropy

Session identifiers must have at least `64 bits` of entropy to prevent brute-force session guessing attacks. Entropy refers to the amount of randomness or unpredictability in a value. Each “bit” of entropy doubles the number of possible outcomes, meaning a session ID with 64 bits of entropy can have `2^64` possible values.

A strong [CSPRNG](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator) (Cryptographically Secure Pseudorandom Number Generator) must be used to generate session IDs. This ensures the generated values are evenly distributed among all possible values. Otherwise, attackers may be able to use statistical analysis techniques to identify patterns in how the session IDs are created, effectively reducing the entropy and allowing the attacker to guess or predict valid session IDs more easily.

**NOTE**:

- The expected time for an attacker to brute-force a valid session ID depends on factors such as the number of bits of entropy, the number of active sessions, session expiration times, and the attacker's guessing rate.
- If a web application generates session IDs with 64 bits of entropy, an attacker can expect to spend approximately 585 years to successfully guess a valid session ID, assuming the attacker can try 10,000 guesses per second with 100,000 valid simultaneous sessions available in the application.
- Further analysis of the expected time for an attacker to brute-force session identifiers is available [here](https://owasp.org/www-community/vulnerabilities/Insufficient_Session-ID_Length#estimating-attack-time).

#### Session ID Length

As mentioned in the previous *Session ID Entropy* section, a primary security requirement for session IDs is that they contain at least `64 bits` of entropy to prevent brute-force guessing attacks. Although session ID length matters, it's the entropy that ensures security. The session ID must be long enough to encode sufficient entropy, preventing brute force attacks where an attacker guesses valid session IDs.

Different encoding methods can result in different lengths for the same amount of entropy. Session IDs are often represented using hexadecimal encoding. When using hexadecimal encoding, a session ID must be at least 16 hexadecimal characters long to achieve the required 64 bits of entropy.  When using different encodings (e.g. Base64 or [Microsoft's encoding for ASP.NET session IDs](https://docs.microsoft.com/en-us/dotnet/api/system.web.sessionstate.sessionidmanager?redirectedfrom=MSDN&view=netframework-4.7.2)) a different number of characters may be required to represent the minimum 64 bits of entropy.

It’s important to note that if any part of the session ID is fixed or predictable, the effective entropy is reduced, and the length may need to be increased to compensate. For example, if half of a 16-character hexadecimal session ID is fixed, only the remaining 8 characters are random, providing just 32 bits of entropy — which is insufficient for strong security. To maintain security, ensure that the entire session ID is randomly generated and unpredictable, or increase the overall length if parts of the ID are not random.

**NOTE**:

- More information about the relationship between Session ID Length and Session ID Entropy is available [here](https://owasp.org/www-community/vulnerabilities/Insufficient_Session-ID_Length#session-id-length-and-entropy-relationship).

#### Session ID Content (or Value)

The session ID content (or value) must be meaningless to prevent information disclosure attacks, where an attacker is able to decode the contents of the ID and extract details of the user, the session, or the inner workings of the web application.

The session ID must simply be an identifier on the client side, and its value must never include sensitive information or Personally Identifiable Information (PII). To read more about PII, refer to [Wikipedia](https://en.wikipedia.org/wiki/Personally_identifiable_information) or this [post](https://www.idshield.com/blog/identity-theft/what-pii-and-why-should-i-care/).

The meaning and business or application logic associated with the session ID must be stored on the server side, and specifically, in session objects or in a session management database or repository.

The stored information can include the client IP address, User-Agent, email, username, user ID, role, privilege level, access rights, language preferences, account ID, current state, last login, session timeouts, and other internal session details. If the session objects and properties contain sensitive information, such as credit card numbers, it is required to duly encrypt and protect the session management repository.

It is recommended to use the session ID created by your language or framework. If you need to create your own sessionID, use a cryptographically secure pseudorandom number generator (CSPRNG) with a size of at least 128 bits and ensure that each sessionID is unique.

### Session Management Implementation

The session management implementation defines the exchange mechanism that will be used between the user and the web application to share and continuously exchange the session ID. There are multiple mechanisms available in HTTP to maintain session state within web applications, such as cookies (standard HTTP header), URL parameters (URL rewriting – [RFC2396](https://www.ietf.org/rfc/rfc2396.txt)), URL arguments on GET requests, body arguments on POST requests, such as hidden form fields (HTML forms), or proprietary HTTP headers.

The preferred session ID exchange mechanism should allow defining advanced token properties, such as the token expiration date and time, or granular usage constraints. This is one of the reasons why cookies (RFCs [2109](https://www.ietf.org/rfc/rfc2109.txt) & [2965](https://www.ietf.org/rfc/rfc2965.txt) & [6265](https://www.ietf.org/rfc/rfc6265.txt)) are one of the most extensively used session ID exchange mechanisms, offering advanced capabilities not available in other methods.

The usage of specific session ID exchange mechanisms, such as those where the ID is included in the URL, might disclose the session ID (in web links and logs, web browser history and bookmarks, the Referer header or search engines), as well as facilitate other attacks, such as the manipulation of the ID or [session fixation attacks](https://www.acrossecurity.com/papers/session_fixation.pdf).

#### Built-in Session Management Implementations

Web development frameworks, such as J2EE, ASP .NET, PHP, and others, provide their own session management features and associated implementation. It is recommended to use these built-in frameworks versus building a home made one from scratch, as they are used worldwide on multiple web environments and have been tested by the web application security and development communities over time.

However, be advised that these frameworks have also presented vulnerabilities and weaknesses in the past, so it is always recommended to use the latest version available, that potentially fixes all the well-known vulnerabilities, as well as review and change the default configuration to enhance its security by following the recommendations described along this document.

The storage capabilities or repository used by the session management mechanism to temporarily save the session IDs must be secure, protecting the session IDs against local or remote accidental disclosure or unauthorized access.

#### Server-Side Session Token Storage

Storing random session tokens verbatim can be acceptable in a tightly controlled session store, but anyone who can read it can reuse unexpired tokens. High entropy protects against guessing; it does not protect exposed tokens. If read-only disclosure of the store is in your threat model, store a one-way verifier instead. [RFC 6819 recommends token hashes](https://www.rfc-editor.org/rfc/rfc6819.html#section-4.3.2) for the corresponding OAuth access-token database threat.

One approach is an [identifier and secret verifier split](https://auth.pilcrowonpaper.com/sessions). The cookie carries both values; the server stores the public lookup identifier and the full SHA-256 hash of the verifier. On every request, look up the session by identifier, hash the supplied verifier, and compare it with the stored hash using a constant-time comparison. Never accept the identifier alone as proof of authentication. Use a consistent verifier representation when creating and validating the session. A fast hash is sufficient for these random verifiers; password hashing algorithms are unnecessary.

Generate the token, or the secret verifier in the split design, using a CSPRNG with at least 128 bits of entropy; prefer 160 bits or more, following [OAuth's guidance for generated credentials](https://www.rfc-editor.org/rfc/rfc6749.html#section-10.10). Generate the verifier independently of the identifier; the public identifier does not count toward the verifier's entropy.

One-way storage protects against read-only disclosure of session records and backups that contain only verifier hashes. It does not protect against stolen cookies, modification of session records, or compromise of the application. Do not persist the raw verifier alongside its hash.

In either design, restrict access to the session store and encrypt backups and replicas at rest. Follow the [session logging protections](#logging-sessions-life-cycle-monitoring-creation-usage-and-destruction-of-session-ids) and [session renewal guidance](#renew-the-session-id-after-any-privilege-level-change).

#### Used vs. Accepted Session ID Exchange Mechanisms

A web application should make use of cookies for session ID exchange management. If a user submits a session ID through a different exchange mechanism, such as a URL parameter, the web application should avoid accepting it as part of a defensive strategy to stop session fixation.

**NOTE**:

- Even if a web application makes use of cookies as its default session ID exchange mechanism, it might accept other exchange mechanisms too.
- It is therefore required to confirm via thorough testing all the different mechanisms currently accepted by the web application when processing and managing session IDs, and limit the accepted session ID tracking mechanisms to just cookies.
- In the past, some web applications used URL parameters, or even switched from cookies to URL parameters (via automatic URL rewriting), if certain conditions are met (for example, the identification of web clients without support for cookies or not accepting cookies due to user privacy concerns).

#### Transport Layer Security

In order to protect the session ID exchange from active eavesdropping and passive disclosure in the network traffic, it is essential to use an encrypted HTTPS (TLS) connection for the entire web session, not only for the authentication process where the user credentials are exchanged. This may be mitigated by [HTTP Strict Transport Security (HSTS)](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html) for a client that supports it.

Additionally, the `Secure` [cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Secure_and_HttpOnly_cookies) must be used to ensure the session ID is only exchanged through an encrypted channel. The usage of an encrypted communication channel also protects the session against some session fixation attacks where the attacker is able to intercept and manipulate the web traffic to inject (or fix) the session ID on the victim's web browser.

The following set of best practices are focused on protecting the session ID (specifically when cookies are used) and helping with the integration of HTTPS within the web application:

- Do not switch a given session from HTTP to HTTPS, or vice-versa, as this will disclose the session ID in the clear through the network.
    - When redirecting to HTTPS, ensure that the cookie is set or regenerated **after** the redirect has occurred.
- Do not mix encrypted and unencrypted contents (HTML pages, images, CSS, JavaScript files, etc) in the same page, or from the same domain.
- Where possible, avoid offering public unencrypted contents and private encrypted contents from the same host. Where insecure content is required, consider hosting this on a separate insecure domain.
- Implement [HTTP Strict Transport Security (HSTS)](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html) to enforce HTTPS connections.

See the OWASP [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html) for more general guidance on implementing TLS securely.

It is important to emphasize that TLS does not protect against session ID prediction, brute force, client-side tampering or fixation; however, it does provide effective protection against an attacker intercepting or stealing session IDs through a man in the middle attack.

### Cookies

The session ID exchange mechanism based on cookies provides multiple security features in the form of cookie attributes that can be used to protect the exchange of the session ID:

#### Secure Attribute

The `Secure` cookie attribute instructs web browsers to only send the cookie through an encrypted HTTPS (SSL/TLS) connection. This session protection mechanism is mandatory to prevent the disclosure of the session ID through MitM (Man-in-the-Middle) attacks. It ensures that an attacker cannot simply capture the session ID from web browser traffic.

Forcing the web application to only use HTTPS for its communication (even when port TCP/80, HTTP, is closed in the web application host) does not protect against session ID disclosure if the `Secure` cookie has not been set - the web browser can be deceived to disclose the session ID over an unencrypted HTTP connection. The attacker can intercept and manipulate the victim user traffic and inject an HTTP unencrypted reference to the web application that will force the web browser to submit the session ID in the clear.

See also: [SecureFlag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Secure_and_HttpOnly_cookies)

#### HttpOnly Attribute

The `HttpOnly` cookie attribute instructs web browsers not to allow scripts (e.g. JavaScript or VBscript) an ability to access the cookies via the DOM document.cookie object. This session ID protection is mandatory to prevent session ID stealing through XSS attacks. However, if an XSS attack is combined with a CSRF attack, the requests sent to the web application will include the session cookie, as the browser always includes the cookies when sending requests. The `HttpOnly` cookie only protects the confidentiality of the cookie; the attacker cannot use it offline, outside of the context of an XSS attack.

See the OWASP [XSS (Cross Site Scripting) Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

See also: [HttpOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Secure_and_HttpOnly_cookies)

#### SameSite Attribute

The `SameSite` attribute controls whether browsers send a cookie with cross-site requests. `SameSite=Strict` excludes cross-site requests, while `SameSite=Lax` permits top-level cross-site navigations that use safe HTTP methods. Treat `SameSite` as [defense in depth against CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#samesite-cookie-attribute), not as a replacement for a CSRF token. Session cookies must explicitly set `SameSite=Strict` (preferred) or `SameSite=Lax`. Never use `SameSite=None` without `Secure`, and do not rely on the browser-default value, which varies across browsers and versions.

See also: [SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value)

#### Cookie Name Prefixes

Use cookie name prefixes to bind cookies to security properties at the browser level ([RFC 6265bis §4.1.3](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis)):

- `__Host-` — the cookie must be set with `Secure`, must not have a `Domain` attribute, and must use `Path=/`. Prevents subdomain forgery and HTTPS downgrade attacks. **Recommended for session IDs.**
- `__Secure-` — the cookie must be set with `Secure`. Use only when subdomain sharing is required.

Example:

```http
Set-Cookie: __Host-SessionID=<value>; Secure; HttpOnly; SameSite=Strict; Path=/
```

#### Domain and Path Attributes

The [`Domain` cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives) instructs web browsers to only send the cookie to the specified domain and all subdomains. If the attribute is not set, by default the cookie will only be sent to the origin server. The [`Path` cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives) instructs web browsers to only send the cookie to the specified directory or subdirectories (or paths or resources) within the web application. If the attribute is not set, by default the cookie will only be sent for the directory (or path) of the resource requested and setting the cookie.

It is recommended to use a narrow or restricted scope for these two attributes. In this way, the `Domain` attribute should not be set (restricting the cookie just to the origin server) and the `Path` attribute should be set as restrictive as possible to the web application path that makes use of the session ID.

Setting the `Domain` attribute to a too permissive value, such as `example.com` allows an attacker to launch attacks on the session IDs between different hosts and web applications belonging to the same domain, known as cross-subdomain cookies. For example, vulnerabilities in `www.example.com` might allow an attacker to get access to the session IDs from `secure.example.com`.

Additionally, it is recommended not to mix web applications of different security levels on the same domain. Vulnerabilities in one of the web applications would allow an attacker to set the session ID for a different web application on the same domain by using a permissive `Domain` attribute (such as `example.com`) which is a technique that can be used in [session fixation attacks](https://www.acrossecurity.com/papers/session_fixation.pdf).

Although the `Path` attribute allows the isolation of session IDs between different web applications using different paths on the same host, it is highly recommended not to run different web applications (especially from different security levels or scopes) on the same host. Other methods can be used by these applications to access the session IDs, such as the `document.cookie` object. Also, any web application can set cookies for any path on that host.

Cookies are vulnerable to DNS spoofing/hijacking/poisoning attacks, where an attacker can manipulate the DNS resolution to force the web browser to disclose the session ID for a given host or domain.

#### Expire and Max-Age Attributes

Session management mechanisms based on cookies can make use of two types of cookies, non-persistent (or session) cookies, and persistent cookies. If a cookie presents the [`Max-Age`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives) (that has preference over `Expires`) or [`Expires`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives) attributes, it will be considered a persistent cookie and will be stored on disk by the web browser based until the expiration time.

Use non-persistent cookies when authentication does not need to persist across browser sessions, but do not rely on browser closure to end an authenticated session. Browsers with [session restore can retain session cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) after they close. Enforce [session expiration](#session-expiration) on the server and invalidate the session when the user logs out; deleting a cookie alone does not invalidate a stolen copy of the session ID.

- Ensure that sensitive information is not compromised by ensuring that it is not persistent, encrypting it, and storing it only for the duration of the need
- Ensure that unauthorized activities cannot take place via cookie manipulation
- Ensure secure flag is set to prevent accidental transmission over the wire in a non-secure manner
- Determine if all state transitions in the application code properly check for the cookies and enforce their use
- Ensure entire cookie should be encrypted if sensitive data is persisted in the cookie
- Define all cookies being used by the application, their name and why they are needed

### HTML5 Web Storage API

The Web Hypertext Application Technology Working Group (WHATWG) describes the HTML5 Web Storage APIs, `localStorage` and `sessionStorage`, as mechanisms for storing name-value pairs client-side.
Unlike HTTP cookies, the contents of `localStorage` and `sessionStorage` are not automatically shared within requests or responses by the browser and are used for storing data client-side.

#### The localStorage API

> **Warning:**
> Do not store authentication tokens, session IDs, JWTs, refresh tokens, or any credential in `localStorage` or `sessionStorage`. These APIs are accessible to any JavaScript executing in the origin, so a single XSS vulnerability discloses every token. Use `HttpOnly; Secure; SameSite=Strict` cookies (preferred) or a Backend-for-Frontend (BFF) pattern. See [OAuth 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps).

##### Scope

Data stored using the `localStorage` API is accessible by pages which are loaded from the same origin, which is defined as the scheme (`https://`), host (`example.com`), port (`443`) and domain/realm (`example.com`).
This provides similar access to this data as would be achieved by using the `secure` flag on a cookie, meaning that data stored from `https` could not be retrieved via `http`. Due to potential concurrent access from separate windows/threads, data stored using `localStorage` may be susceptible to shared access issues (such as race-conditions) and should be considered non-locking ([Web Storage API Spec](https://html.spec.whatwg.org/multipage/webstorage.html#the-localstorage-attribute)).

##### Duration

Data stored using the `localStorage` API is persisted across browsing sessions, extending the timeframe in which it may be accessible to other system users.

##### Offline Access

The standards do not require `localStorage` data to be encrypted-at-rest, meaning it may be possible to directly access this data from disk.

##### Use Case

WHATWG suggests the use of `localStorage` for data that needs to be accessed across windows or tabs, across multiple sessions, and where large (multi-megabyte) volumes of data may need to be stored for performance reasons.

#### The sessionStorage API

##### Scope

The `sessionStorage` API stores data within the window context from which it was called, meaning that Tab 1 cannot access data which was stored from Tab 2.
Also, like the `localStorage` API, data stored using the `sessionStorage` API is accessible by pages which are loaded from the same origin, which is defined as the scheme (`https://`), host (`example.com`), port (`443`) and domain/realm (`example.com`).
This provides similar access to this data as would be achieved by using the `secure` flag on a cookie, meaning that data stored from `https` could not be retrieved via `http`.

##### Duration

The `sessionStorage` API only stores data for the duration of the current browsing session. Once the tab is closed, that data is no longer retrievable. This does not necessarily prevent access, should a browser tab be reused or left open. Data may also persist in memory until a garbage collection event.

##### Offline Access

The standards do not require `sessionStorage` data to be encrypted-at-rest, meaning it may be possible to directly access this data from disk.

##### Use Case

WHATWG suggests the use of `sessionStorage` for data that is relevant for one-instance of a workflow, such as details for a ticket booking, but where multiple workflows could be performed in other tabs concurrently. The window/tab bound nature will keep the data from leaking between workflows in separate tabs.

### Web Workers

Web Workers run JavaScript in a separate global context. The main window and worker communicate through messages using [`postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#sending_messages_to_and_from_a_dedicated_worker).

#### Use Case

A worker can keep a secret in memory when persistence across page refresh is not required. To isolate the secret from the main window, obtain it within the worker, keep secret-dependent operations there, and never return the secret to the main window.

This isolation can reduce direct access to an existing secret, but it does not make the application safe against XSS. Malicious page code can still request secret-dependent operations and read their results. The [OAuth browser-apps guidance](https://www.rfc-editor.org/rfc/rfc10017.html#section-8.3) also explains that isolating an existing refresh token does not prevent malicious code from obtaining new tokens through another authorization flow.

Use a worker only when browser-side code needs secret-dependent operations. Expose a narrow message interface and enforce authorization on the server. Worker isolation does not replace XSS prevention or server-side session controls; prefer an HttpOnly cookie or a backend that holds tokens when the browser does not need to handle them.

### Session ID Life Cycle

#### Session ID Generation and Verification: Permissive and Strict Session Management

There are two types of session management mechanisms for web applications, permissive and strict, related to session fixation vulnerabilities. The permissive mechanism allows the web application to initially accept any session ID value set by the user as valid, creating a new session for it, while the strict mechanism enforces that the web application will only accept session ID values that have been previously generated by the web application.

The session tokens should be handled by the web server if possible or generated via a cryptographically secure random number generator.

Although the most common mechanism in use today is the strict one (more secure), [PHP defaults to permissive](https://wiki.php.net/rfc/session-use-strict-mode). Developers must ensure that the web application does not use a permissive mechanism under certain circumstances. Web applications should never accept a session ID they have never generated, and in case of receiving one, they should generate and offer the user a new valid session ID. Additionally, this scenario should be detected as a suspicious activity and an alert should be generated.

#### Manage Session ID as Any Other User Input

Session IDs must be considered untrusted, as any other user input processed by the web application, and they must be thoroughly validated and verified. Depending on the session management mechanism used, the session ID will be received in a GET or POST parameter, in the URL or in an HTTP header (e.g. cookies). If web applications do not validate and filter out invalid session ID values before processing them, they can potentially be used to exploit other web vulnerabilities, such as SQL injection if the session IDs are stored on a relational database, or persistent XSS if the session IDs are stored and reflected back afterwards by the web application.

#### Renew the Session ID After Any Privilege Level Change

The session ID must be renewed or regenerated by the web application after any privilege level change within the associated user session. The most common scenario where the session ID regeneration is mandatory is during the authentication process, as the privilege level of the user changes from the unauthenticated (or anonymous) state to the authenticated state though in some cases still not yet the authorized state. Common scenarios to consider include; password changes, permission changes, or switching from a regular user role to an administrator role within the web application. For all sensitive pages of the web application, any previous session IDs must be ignored, only the current session ID must be assigned to every new request received for the protected resource, and the old or previous session ID must be destroyed.

The most common web development frameworks provide session functions and methods to renew the session ID, such as `request.getSession(true)` & `HttpSession.invalidate()` (J2EE), `Session.Abandon()` & `Response.Cookies.Add(new...)` (ASP .NET), or `session_start()` & `session_regenerate_id(true)` (PHP).

The session ID regeneration is mandatory to prevent [session fixation attacks](https://www.acrossecurity.com/papers/session_fixation.pdf), where an attacker sets the session ID on the victim user's web browser instead of gathering the victim's session ID, as in most of the other session-based attacks, and independently of using HTTP or HTTPS. This protection mitigates the impact of other web-based vulnerabilities that can also be used to launch session fixation attacks, such as HTTP response splitting or XSS (see [here](https://media.blackhat.com/bh-eu-11/Raul_Siles/BlackHat_EU_2011_Siles_SAP_Session-Slides.pdf) and [here](https://media.blackhat.com/bh-eu-11/Raul_Siles/BlackHat_EU_2011_Siles_SAP_Session-WP.pdf)).

A complementary recommendation is to use a different session ID or token name (or set of session IDs) pre and post authentication, so that the web application can keep track of anonymous users and authenticated users without the risk of exposing or binding the user session between both states.

#### Reauthentication After Risk Events

Web applications should require reauthentication after high-risk events such as:

- Changes to critical user information (e.g., password, email address)
- Login attempts from new or suspicious IP addresses or devices
- Account recovery flows (e.g., password reset or compromised-account detection)

For best practices on implementing reauthentication after these events, see the [Reauthentication After Risk Events](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#re-authentication-after-risk-events) section in the Authentication Cheat Sheet

#### Additional Resources

- [Why Frequent Reauthentication Can Be a UX Pitfall](https://tailscale.com/blog/frequent-reauth-security?lid=5wso20mx4knj) by Tailscale

#### Considerations When Using Multiple Cookies

If the web application uses cookies as the session ID exchange mechanism, and multiple cookies are set for a given session, the web application must verify all cookies (and enforce relationships between them) before allowing access to the user session.

It is very common for web applications to set a user cookie pre-authentication over HTTP to keep track of unauthenticated (or anonymous) users. Once the user authenticates in the web application, a new post-authentication secure cookie is set over HTTPS, and a binding between both cookies and the user session is established. If the web application does not verify both cookies for authenticated sessions, an attacker can make use of the pre-authentication unprotected cookie to get access to the authenticated user session (see [here](https://media.blackhat.com/bh-eu-11/Raul_Siles/BlackHat_EU_2011_Siles_SAP_Session-Slides.pdf) and [here](https://media.blackhat.com/bh-eu-11/Raul_Siles/BlackHat_EU_2011_Siles_SAP_Session-WP.pdf)).

Web applications should try to avoid the same cookie name for different paths or domain scopes within the same web application, as this increases the complexity of the solution and potentially introduces scoping issues.

### Session Expiration

In order to minimize the time period an attacker can launch attacks over active sessions and hijack them, it is mandatory to set expiration timeouts for every session, establishing the amount of time a session will remain active. Insufficient session expiration by the web application increases the exposure of other session-based attacks, as for the attacker to be able to reuse a valid session ID and hijack the associated session, it must still be active.

The shorter the session interval is, the lesser the time an attacker has to use the valid session ID. The session expiration timeout values must be set accordingly with the purpose and nature of the web application, and balance security and usability, so that the user can comfortably complete the operations within the web application without the session frequently expiring.

Both the idle and absolute timeout values are highly dependent on how critical the web application and its data are. Common idle timeouts ranges are 2-5 minutes for high-value applications and 15-30 minutes for low risk applications. Absolute timeouts depend on how long a user usually uses the application. If the application is intended to be used by an office worker for a full day, an appropriate absolute timeout range could be between 4 and 8 hours.

When a session expires, the web application must take active actions to invalidate the session on both sides, client and server. The latter is the most relevant and mandatory from a security perspective.

For most session exchange mechanisms, client side actions to invalidate the session ID are based on clearing out the token value. For example, to invalidate a cookie it is recommended to provide an empty (or invalid) value for the session ID, and set the `Expires` (or `Max-Age`) attribute to a date from the past (in case a persistent cookie is being used): `Set-Cookie: id=; Expires=Friday, 17-May-03 18:45:00 GMT`

In order to close and invalidate the session on the server side, it is mandatory for the web application to take active actions when the session expires, or the user actively logs out, by using the functions and methods offered by the session management mechanisms, such as `HttpSession.invalidate()` (J2EE), `Session.Abandon()` (ASP .NET) or `session_destroy()/unset()` (PHP).

#### Automatic Session Expiration

##### Idle Timeout

All sessions should implement an idle or inactivity timeout. This timeout defines the amount of time a session will remain active in case there is no activity in the session, closing and invalidating the session upon the defined idle period since the last HTTP request received by the web application for a given session ID.

The idle timeout limits the chances an attacker has to guess and use a valid session ID from another user. However, if the attacker is able to hijack a given session, the idle timeout does not limit the attacker's actions, as they can generate activity on the session periodically to keep the session active for longer periods of time.

Session timeout management and expiration must be enforced server-side. If the client is used to enforce the session timeout, for example using the session token or other client parameters to track time references (e.g. number of minutes since login time), an attacker could manipulate these to extend the session duration.

##### Absolute Timeout

All sessions should implement an absolute timeout, regardless of session activity. This timeout defines the maximum amount of time a session can be active, closing and invalidating the session upon the defined absolute period since the given session was initially created by the web application. After invalidating the session, the user is forced to (re)authenticate again in the web application and establish a new session.

The absolute session limits the amount of time an attacker can use a hijacked session and impersonate the victim user.

##### Renewal Timeout

Alternatively, the web application can implement an additional renewal timeout after which the session ID is automatically renewed, in the middle of the user session, and independently of the session activity and, therefore, of the idle timeout.

After a specific amount of time since the session was initially created, the web application can regenerate a new ID for the user session and try to set it, or renew it, on the client. The previous session ID value would still be valid for some time, accommodating a safety interval, before the client is aware of the new ID and starts using it. At that time, when the client switches to the new ID inside the current session, the application invalidates the previous ID.

This scenario minimizes the amount of time a given session ID value, potentially obtained by an attacker, can be reused to hijack the user session, even when the victim user session is still active. The user session remains alive and open on the legitimate client, although its associated session ID value is transparently renewed periodically during the session duration, every time the renewal timeout expires. Therefore, the renewal timeout complements the idle and absolute timeouts, specially when the absolute timeout value extends significantly over time (e.g. it is an application requirement to keep the user sessions open for long periods of time).

Depending on the implementation, potentially there could be a race condition where the attacker with a still valid previous session ID sends a request before the victim user, right after the renewal timeout has just expired, and obtains first the value for the renewed session ID. At least in this scenario, the victim user might be aware of the attack as the session will be suddenly terminated because the associated session ID is not valid anymore.

#### Manual Session Expiration

Web applications should provide mechanisms that allow security aware users to actively close their session once they have finished using the web application.

##### Logout Button

Web applications must provide a visible and easily accessible logout (logoff, exit, or close session) button that is available on the web application header or menu and reachable from every web application resource and page, so that the user can manually close the session at any time. As described in *Session_Expiration* section, the web application must invalidate the session at least on server side.

**NOTE**: Unfortunately, not all web applications facilitate users to close their current session. Thus, client-side enhancements allow conscientious users to protect their sessions by helping to close them diligently.

#### Web Content Caching and Clear-Site-Data

Even after the session has ended, private or sensitive data exchanged during the session may still be accessible through the web browser's cache. Set the cache policy in HTTP response headers on sensitive pages. Do not treat HTML `<meta http-equiv>` tags as an equivalent cache-control mechanism: [browsers support only specific processing instructions](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/http-equiv#value), and unsupported values can be ignored.

Use `Cache-Control: no-store` on responses containing session identifiers or sensitive session data. Unlike `no-cache`, which allows storage but requires revalidation before reuse, [`no-store` directs private and shared HTTP caches not to store the request or response](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.5). It is not a privacy guarantee: malicious or compromised caches might ignore the directive.

In addition to preventing future caching, applications should ensure that previously stored sensitive data is removed when a session ends. This can be achieved by returning the Clear-Site-Data response header (for example, `Clear-Site-Data: "cache", "cookies", "storage"`) during logout or session termination. This instructs the browser to delete cached resources, cookies, and other client-side storage associated with the origin, helping ensure a complete session cleanup.

> **Note:** The directive `Cache-Control: no-cache="Set-Cookie, Set-Cookie2"` is sometimes suggested to prevent session ID caching. However, this syntax is not widely supported and may lead to unintended behavior. Instead, use `Cache-Control: no-store` for stronger protection. `Clear-Site-Data: "cache"` can be used to clear every stored response for a site in the browser cache, so use this with care. Note that this will not affect shared or intermediate caches.
> **Reference:** [MDN - Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) and [MDN - Clear-Site-Data header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Clear-Site-Data)

### Reauthentication After Risk Events

To ensure session integrity and account protection, applications should require reauthentication when specific high-risk events are detected. These may include:

- Attempted or completed password changes
- Login from a new or suspicious IP address or device
- Completion of account recovery or challenge flows (e.g., hacked-lock scenarios)

Requiring reauthentication helps mitigate session hijacking and unauthorized access—especially when long-lived sessions or external identity providers are in use.

**Recommended Practices:**

- Prompt users for primary credentials (e.g., password) or enforce MFA
- Provide clear messaging explaining the need to reauthenticate

### Additional Client-Side Defenses for Session Management

Web applications can complement the previously described session management defenses with additional countermeasures on the client side. Client-side protections, typically in the form of JavaScript checks and verifications, are not bullet proof and can easily be defeated by a skilled attacker, but can introduce another layer of defense that has to be bypassed by intruders.

#### Initial Login Timeout

Web applications can use JavaScript code in the login page to evaluate and measure the amount of time since the page was loaded and a session ID was granted. If a login attempt is tried after a specific amount of time, the client code can notify the user that the maximum amount of time to log in has passed and reload the login page, hence retrieving a new session ID.

This extra protection mechanism tries to force the renewal of the session ID pre-authentication, avoiding scenarios where a previously used (or manually set) session ID is reused by the next victim using the same computer, for example, in session fixation attacks.

#### Limits of Logout on Browser Close

Browser close events cannot reliably enforce logout. For example, [`beforeunload` may not fire when a mobile browser is closed from the app manager](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event). Use [server-side idle and absolute timeouts](#automatic-session-expiration) and an explicit [logout action](#logout-button) to invalidate sessions. Client-side close handlers can supplement these controls but must not replace them.

#### Disable Web Browser Cross-Tab Sessions

Web applications can use JavaScript code once the user has logged in and a session has been established to force the user to re-authenticate if a new web browser tab or window is opened against the same web application. The web application does not want to allow multiple web browser tabs or windows to share the same session. Therefore, the application tries to force the web browser to not share the same session ID simultaneously between them.

**NOTE**: This mechanism cannot be implemented if the session ID is exchanged through cookies, as cookies are shared by all web browser tabs/windows.

#### Automatic Client Logout

JavaScript code can be used by the web application in all (or critical) pages to automatically logout client sessions after the idle timeout expires, for example, by redirecting the user to the logout page (the same resource used by the logout button mentioned previously).

The benefit of enhancing the server-side idle timeout functionality with client-side code is that the user can see that the session has finished due to inactivity, or even can be notified in advance that the session is about to expire through a count down timer and warning messages. This user-friendly approach helps to avoid loss of work in web pages that require extensive input data due to server-side silently expired sessions.

### Session Attacks Detection

#### Session ID Guessing and Brute Force Detection

If an attacker tries to guess or brute force a valid session ID, they need to launch multiple sequential requests against the target web application using different session IDs from a single (or set of) IP address(es). Additionally, if an attacker tries to analyze the predictability of the session ID (e.g. using statistical analysis), they need to launch multiple sequential requests from a single (or set of) IP address(es) against the target web application to gather new valid session IDs.

Web applications must be able to detect both scenarios based on the number of attempts to gather (or use) different session IDs and alert and/or block the offending IP address(es).

#### Detecting Session ID Anomalies

Web applications should focus on detecting anomalies associated to the session ID, such as its manipulation. The OWASP [AppSensor Project](https://owasp.org/www-project-appsensor/) provides a framework and methodology to implement built-in intrusion detection capabilities within web applications focused on the detection of anomalies and unexpected behaviors, in the form of detection points and response actions. Instead of using external protection layers, sometimes the business logic details and advanced intelligence are only available from inside the web application, where it is possible to establish multiple session related detection points, such as when an existing cookie is modified or deleted, a new cookie is added, the session ID from another user is reused, or when the user location or User-Agent changes in the middle of a session.

#### Binding the Session ID to Other User Properties

With the goal of detecting (and, in some scenarios, protecting against) user misbehaviors and session hijacking, it is highly recommended to bind the session ID to other user or client properties, such as the client IP address, User-Agent, or client-based digital certificate. If the web application detects any change or anomaly between these different properties in the middle of an established session, this is a very good indicator of session manipulation and hijacking attempts, and this simple fact can be used to alert and/or terminate the suspicious session.

Although these properties cannot be used by web applications to trustingly defend against session attacks, they significantly increase the web application detection (and protection) capabilities. However, a skilled attacker can bypass these controls by reusing the same IP address assigned to the victim user by sharing the same network (very common in NAT environments, like Wi-Fi hotspots) or by using the same outbound web proxy (very common in corporate environments), or by manually modifying the User-Agent to look exactly like the victim user's.

#### Logging Sessions Life Cycle: Monitoring Creation, Usage, and Destruction of Session IDs

Web applications should increase their logging capabilities by including information regarding the full life cycle of sessions. In particular, it is recommended to record session related events, such as the creation, renewal, and destruction of session IDs, as well as details about its usage within login and logout operations, privilege level changes within the session, timeout expiration, invalid session activities (when detected), and critical business operations during the session.

Log the timestamp, source IP address, requested resource, event type, result or error code, and user ID when needed for session monitoring. Record only selected header and parameter fields after excluding credentials and sensitive values, following the [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude). Do not log raw session IDs; use the session correlation approach described below.

Sensitive data like the session ID should not be included in the logs in order to protect the session logs against session ID local or remote disclosure or unauthorized access. However, some kind of session-specific information must be logged in order to correlate log entries to specific sessions. It is recommended to log a salted-hash of the session ID instead of the session ID itself in order to allow for session-specific log correlation without exposing the session ID.

In particular, web applications must thoroughly protect administrative interfaces that allow to manage all the current active sessions. Frequently these are used by support personnel to solve session related issues, or even general issues, by impersonating the user and looking at the web application as the user does.

The session logs become one of the main web application intrusion detection data sources, and can also be used by intrusion protection systems to automatically terminate sessions and/or disable user accounts when (one or many) attacks are detected. If active protections are implemented, these defensive actions must be logged too.

#### Simultaneous Session Logons

It is the web application design decision to determine if multiple simultaneous logons from the same user are allowed from the same or from different client IP addresses. If the web application does not want to allow simultaneous session logons, it must take effective actions after each new authentication event, implicitly terminating the previously available session, or asking the user (through the old, new or both sessions) about the session that must remain active.

It is recommended for web applications to add user capabilities that allow checking the details of active sessions at any time, monitor and alert the user about concurrent logons, provide user features to remotely terminate sessions manually, and track account activity history (logbook) by recording multiple client details such as IP address, User-Agent, login date and time, idle time, etc.

### Session Management WAF Protections

There are situations where the web application source code is not available or cannot be modified, or when the changes required to implement the multiple security recommendations and best practices detailed above imply a full redesign of the web application architecture, and therefore, cannot be easily implemented in the short term.

In these scenarios, or to complement the web application defenses, and with the goal of keeping the web application as secure as possible, it is recommended to use external protections such as Web Application Firewalls (WAFs) that can mitigate the session management threats already described.

Web Application Firewalls offer detection and protection capabilities against session based attacks. On the one hand, it is trivial for WAFs to enforce the usage of security attributes on cookies, such as the `Secure` and `HttpOnly` flags, applying basic rewriting rules on the `Set-Cookie` header for all the web application responses that set a new cookie.

On the other hand, more advanced capabilities can be implemented to allow the WAF to keep track of sessions, and the corresponding session IDs, and apply all kind of protections against session fixation (by renewing the session ID on the client-side when privilege changes are detected), enforcing sticky sessions (by verifying the relationship between the session ID and other client properties, like the IP address or User-Agent), or managing session expiration (by forcing both the client and the web application to finalize the session).

The open-source ModSecurity WAF, plus the OWASP [Core Rule Set](https://owasp.org/www-project-modsecurity-core-rule-set/), provide capabilities to detect and apply security cookie attributes, countermeasures against session fixation attacks, and session tracking features to enforce sticky sessions.

## Cookie Theft Mitigation

> **Source:** [Cookie Theft Mitigation](https://cheatsheetseries.owasp.org/cheatsheets/Cookie_Theft_Mitigation_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

With the spread of 2FA and Passkey, the login process has become more robust, and even if an attacker steals only the password, it has become difficult to do a spoofing attack.

However, if attacker can steal a valid session cookie instead, it is possible to hijack the user session for the duration of the session lifetime period. In other words, stealing a session cookie has the same impact as stealing authentication credentials until it expires. No matter how robust your authentication process is, it will not be a sufficient countermeasure for Cookie Theft.

Cookie theft can occur through malware, phishing, or application vulnerabilities. Apply the preventive controls in the [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), and monitor for misuse of stolen cookies. Detection complements these controls; it does not replace them.

### Cookie Theft Mitigation

Session Cookies are given to users when they log in. If these are stolen by an attacker and used to hijack the session from the attacker's device, certain environment information used in the connection for session will change.

For example, if stolen cookies are used by an attacker from another country, you can detect this by detecting a significant change in the IP address.

In this way, there are multiple vectors that can be used to detect that the user environments has changed.

- Access from different region (IP Address)
- Access from different device (User-Agent)
- Access from different language setting (Accept-Language)
- Access at different time of day (Date)

If you save this information when establishing a session and compare it in each request, you can detect if the user environment has changed.

Of course, it is difficult to make a judgment based on simple comparison alone. For example, if the user changes the Wi-Fi network they are connected to, their IP address will change. If the user updates their browser, User-Agent will change. So it is necessary not only to compare the values, but also to check whether the meaning of the values has not changed significantly.

#### False negatives/positives

Suppose that a session cookie that has been granted access in a certain country is used from another country. This could be an attack, or it could simply be that the user has traveled.

In other words, it is not possible to say with certainty that it is an attack just because the IP-Geo has changed. This means that there are **False Positives** (it seems to be an attack, but it is not) in this detection method.

At the same time, even if the IP-Geo does not change, there is also the possibility that the attacker is attacking from within the same country. This means that this detection method has **False Negatives** (it seems not to be an attack, but it is).

#### Cookie Theft Detection

For an implementation case study, see [Slack's compromised-cookie detection design](https://slack.engineering/catching-compromised-cookies/).

By storing session information on the server side when a session is established, it is possible to detect session hijacking when that information is significantly changed.

The following are the core information that should be saved.

- IP Address
- User-Agent
- Accept-Language
- Date

In addition, the following headers, which can be change depending on the Device and OS, are also effective as monitoring targets.

- Accept
- Accept-Encoding

The following [`Sec-CH-*` Client Hint headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Client_hints#hint_types) provide information about the browser, device, or user preferences. These differ from [`Sec-Fetch-*` Fetch Metadata headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site), which describe request context. Client Hints may be omitted depending on browser support, server requests, and client permissions, so treat them as optional signals.

- sec-ch-prefers-color-scheme
- sec-ch-ua
- sec-ch-ua-arch
- sec-ch-ua-bitness
- sec-ch-ua-form-factors
- sec-ch-ua-full-version
- sec-ch-ua-full-version-list
- sec-ch-ua-mobile
- sec-ch-ua-model
- sec-ch-ua-platform
- sec-ch-ua-platform-version
- sec-ch-ua-wow64

The following illustrative Express sketch assumes a server-side session store and trusted middleware that populates `req.clientIP` and `req.session`. Read request headers with [Express's `req.get()`](https://expressjs.com/en/5x/api/request/#reqget), and use a server timestamp when establishing the session:

```js
const session = SessionStorage.create()
session.save({
  ip: req.clientIP,
  user_agent: req.get("User-Agent"),
  date: Date.now(),
  accept_language: req.get("Accept-Language"),
  // ...
})
```

If a large change is detected when comparing this information each time a request is received, it is possible that the session has been hijacked.

#### Session Validation

If there is a possibility that a session has been hijacked, the most reliable verification method is to re-authenticate. If you temporarily invalidate the user's session, ask them to authenticate again, and then give them a new session cookie, the attacker will no longer be able to do anything with the stolen cookie.

However, as mentioned earlier, monitoring sessions has the potential for false positives, so if you have to re-authenticate too often, it will be a poor experience for the user.

A CAPTCHA may help limit automated abuse, but it does not establish that the requester controls an authenticator bound to the account, which is the basis of [authentication](https://pages.nist.gov/800-63-4/sp800-63b/introduction/). Do not treat a solved CAPTCHA as validation of a suspected stolen session. Use [reauthentication with an account-bound authenticator](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#re-authentication-after-risk-events) before restoring access that depends on trusting the session.

In this sketch, comparison helpers return `false` when a signal requires reauthentication. They must account for missing headers and legitimate changes. [Express middleware must end the response or call `next()`](https://expressjs.com/en/guide/using-middleware/). The error response below blocks this request; the application must also restrict or invalidate the suspect session and complete account-bound reauthentication before restoring access. This sketch does not implement session storage, authorization, or CSRF protection.

```js
function cookieTheftDetectionMiddleware(req, res, next) {
  const currentIP = req.clientIP
  const expectedIP = req.session.ip
  if (checkGeoIPRange(currentIP, expectedIP) === false) {
    return res.status(403).send("Reauthentication required")
  }
  const currentUA = req.get("User-Agent")
  const expectedUA = req.session.user_agent
  if (checkUserAgent(currentUA, expectedUA) === false) {
    return res.status(403).send("Reauthentication required")
  }

  next()
}

app.post("/users/delete", cookieTheftDetectionMiddleware, (req, res) => {
 // ...
})
```

Usually, such functions are provided as middleware, or they are provided by WAF (Web Application Firewall) installed in front of the web server.

If this comparison has a significant impact on performance, it may be possible to tune it so that the priority is set for each path and only the endpoints that view or modify important information are checked intensively.

### Device Bound Session Credentials

Ordinary session cookies are bearer credentials: anyone possessing a valid cookie can use it until it expires or the server invalidates it.

Device Bound Session Credentials (DBSC) uses a device-bound signing key to prove possession when refreshing short-lived cookies, as described in the [DBSC refresh design](https://github.com/w3c/webappsec-dbsc/blob/main/README.md#browser-initiated-refreshes). Ordinary application requests still use those cookies as bearer credentials; DBSC does not bind every request to the key.

An attacker can replay a stolen cookie during its remaining lifetime. Protecting the key limits the attacker's ability to refresh the session from another device; it does not make a stolen cookie immediately unusable.

DBSC also does not prevent abuse while an attacker retains access to the compromised browser or device. Such an attacker may obtain fresh cookies or use the protected key through the compromised environment. Account for these [documented threat-model limits](https://github.com/w3c/webappsec-dbsc/blob/main/README.md#non-goals) when choosing session lifetimes and incident-response controls.

## JSON Web Token

> **Source:** [JSON Web Token](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet provides tips to prevent common security issues when using JSON Web Tokens (JWT).

[**JSON Web Tokens**](https://datatracker.ietf.org/doc/html/rfc7519) (JWT) are security tokens for carrying information (**claims**), often about a user, an application, etc. (**subject**). JWTs can provide authenticity of the claims (**signed JWT**) and/or confidentiality of the claims (**encrypted JWT**). In addition, JWT defines [standard claims](https://www.iana.org/assignments/jwt/jwt.xhtml).

JWTs are used in a wide range of applications such as:

- In [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html), the [ID token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken) is a JWT used to represent the identity and attributes of the connected user.
- In [OAuth 2](https://datatracker.ietf.org/doc/html/rfc6749), the access token used to obtain access to a protected resource [can be a JWT](https://datatracker.ietf.org/doc/html/rfc9068).
- A JWT is often suggested for “stateless” user sessions. However, this usage is [frowned upon](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/).
- A [DPoP Proof JWT](https://datatracker.ietf.org/doc/html/rfc9449#name-dpop-proof-jwts) can be used to prove possession of a private key.
- In [SPIFFE](https://spiffe.io/), a [JWT-SVID](https://github.com/spiffe/spiffe/blob/main/standards/JWT-SVID.md) can be used to authenticate a workload.

In its most common form (signed JWT), this information is protected by the generating application (**issuer**) using a signature to ensure it has not been tampered with. This signature prevents attackers, such as a malicious client or user, from forging a token or modifying the claims in an existing token, for example changing the user role from a simple user to an admin or altering the client's login. The JWT can be seen as a protected identity card or certificate about a user, an application, etc. An application (**presenter**) presents the token to a consuming application (**audience**) which can verify the token's authenticity and validity and take decisions or actions based on these claims.

JWT can also provide confidentiality of the claims (encrypted JWT). Encryption itself is only introduced briefly in [Token Confidentiality and JWE](#token-confidentiality-and-jwe), but many aspects of this cheat sheet also apply to encrypted JWTs.

### Token Structure

Signed JWTs have the following structure:

```
{base64url(json(header))}.{base64url(json(claims))}.{base64url(signature)}
```

The following elements are present in signed JWTs:

- **Protected Header:** the JWT header contains some information about the token such as the type of token (IANA media type) and the cryptographic algorithms used to protect the token.
- **Claims:** the content JWT is a list of claims (usually about the subject). See the [JWT IANA Registry](https://www.iana.org/assignments/jwt/jwt.xhtml) for a list of standard claims.
- **Signature:** a signature in JWT is either a public-key digital signature (using a public/private key pair) or a MAC (using a shared secret). The signature protects both the protected headers and the claims.

#### Example

For example, the following example ([taken from JWT.IO](https://jwt.io/#token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30)):

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
```

The first part ([**protected header**](https://datatracker.ietf.org/doc/html/rfc7515#section-4)) can be decoded into:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

The second part ([**claims**](https://datatracker.ietf.org/doc/html/rfc7519#section-4)) can be decoded into:

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true,
  "iat": 1516239022
}
```

The last part (**signature**) guarantees the authenticity of both the header and the claims, either using a public/private key pair (digital signature) or a shared secret (MAC), depending on the `alg` header value. For our example, it is computed as:

```javascript
base64url(
    HMACSHA256(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
        + "."
        + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0",
        key
    )
)
```

### Considerations about using JWTs

#### Not using JWTs

Before using JWTs to solve your problems, you should consider if they are really necessary for your use case.

JWTs are often suggested for “stateless” user sessions. However, if you use JWTs for user sessions, you will need a solution for managing session invalidation. This can be achieved using a deny list of revoked sessions/tokens. If your application implements such a deny list, user sessions won't be completely stateless anymore which might defeat the benefits of stateless sessions. You might want to consider using a plain session system and follow the advices from the dedicated [session management cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

#### Public-key Signatures vs. MAC

A signed JWT can be authenticated using either a digital signature or a MAC:

- **When using a digital signature,** the issuer of the token uses its private key to generate a signature. The audience of the token can use the associated public key to verify the authenticity of the token. Whereas the private key must only be known by the issuer, the public key can be public.
- **When using a MAC,** a shared secret is shared between the issuer and the audience. The *same* shared secret is used by the issuer to generate the token and by the audience to verify the authenticity of the token.

The two approaches differ on how credentials are managed.

When using a digital signature:

- The issuer can reuse the same public key for many different audiences.
- The audience of the token only need public information to validate the token authenticity which removes the risk of secret leakage by the audience.
- Because the public key does not need to be secret, it can easily be distributed (eg. by publishing it at a public HTTPS URI).
- This makes key rotation simpler as well.
- Traditional digital signature schemes might be [broken by post quantum computers](https://datatracker.ietf.org/doc/html/rfc9958#name-asymmetric-cryptography) in the future. They would need to be replaced with post-quantum digital signature schemes which [heavier](https://datatracker.ietf.org/doc/html/rfc9958#name-impact-on-constrained-devic) are traditional signature schemes.

When using a MAC:

- A different secret must be used for each (issuer, audience) pair. If, for example, the same secret is reused for difference audiences, one audience can forge a token (impersonating the issuer).
- Secret keys must obviously not be published at a public HTTPS URI. Some solution for secret distribution and rotation must be found.
- MAC are much faster than digital signatures (but this is usually negligible in practice).

Using a MAC may be interesting in the following cases:

- The issuer of the token is the sole audience of the token. Even in this case, it might be easier to use digital signature for secret rotation/distribution.
- The issuer of the token is the audience. In this case, there is no problem of secret rotation/distribution.

#### Public-key Signatures

| Signature scheme      | Identifier                      | Type         | Status
|-----------------------|---------------------------------|--------------|---------
| EdDSA                 | EdDSA, Ed448, Ed25519           | Traditional  | Recommended, limited support
| ECDSA                 | ES256, ES384, ES512             | Traditional  | Recommended
| RSASSA-PSS            | PS256, PS384, PS512             | Traditional  | Recommended
| RSASSA-PKCS1-v1_5     | RS256, RS384, RS512             | Traditional  | Not recommended
| Hybrid ML-DSA / EdDSA | ML-DSA-44-Ed25519, etc.         | PQ/T hybrid  | [Draft](https://ietf-wg-jose.github.io/draft-ietf-jose-pq-composite-sigs/draft-ietf-jose-pq-composite-sigs.html)
| Hybrid ML-DSA / ECDSA | ML-DSA-44-ES256, etc.           | PQ/T hybrid  | [Draft](https://ietf-wg-jose.github.io/draft-ietf-jose-pq-composite-sigs/draft-ietf-jose-pq-composite-sigs.html)
| ML-DSA                | ML-DSA-44, ML-DSA-65, ML-DSA-87 | Post-quantum | Very limited support at best

Explanations:

- Support for EdDSA in JWT implementations is currently limited.
- Generating ECDSA signatures may be dangerous on embedded systems where the quality of the randomness may be problematic. In this case, you the implementation must use deterministic ECDA as defined in [RFC 6979](https://datatracker.ietf.org/doc/html/rfc6979).
- Post-quantum signatures ([ML-DSA](https://datatracker.ietf.org/doc/html/rfc9964)) or [hybrid post quantum signatures](https://ietf-wg-jose.github.io/draft-ietf-jose-pq-composite-sigs/draft-ietf-jose-pq-composite-sigs.html) are designed to be resistant against quantum computers. However, they produce very large signatures, resulting in very large JWTs. Their usage is probably not justified at the moment unless you need signatures with a long validity.

Key management:

- Do not reuse the key pair for another purpose (eg. for encryption).
- Using the same key for authenticating different types of JWTs is fine as long as this does not introduce a risk of token type confusion.
- Do not publish your private key!

##### MAC

| Signature scheme      | Identifier                      | Status
|-----------------------|---------------------------------|---------------
| HMAC with SHA-2       | HS256, HS384, HS512             | Recommended

Secret management:

- Do not reuse the same secret for another purpose (eg. for encryption).
- Using the same key for authenticating different types of JWTs is fine as long as this does not introduce a risk of token type confusion.
- Do not reuse the same secret with another audience.
- Do not reuse the same secret with another issuer.
- Do not use a password as MAC secret.
- The secret must be generated using a local, cryptographically secure secret generator.
- The secret must have at least the same size as the output (eg. 256, 384 and 512 bits respectively for HS256, HS384 and HS512).
- Do not publish your secret key!
- The secret must have at least 160 bits of entropy.
- For HMAC, the secret [should be at least as long as the output size](https://datatracker.ietf.org/doc/html/rfc2104#section-3).

Valid HMAC secret generation example:

```python
import secrets
secret_for_hs256 = secrets.token_bytes(256//8)
secret_for_hs512 = secrets.token_bytes(512//8)
```

Invalid HMAC secret generation:

```python
import random
import secrets

# Using a password/passphrase is not OK:
bad_secret = b"MyProject2026"

# Using a hardcoded secret is not OK:
bad_secret = urlsafe_b64decode(b'KYkbbclxtjJMiHzoPvuahOfarej0VV-nQZPFxK0hyro=')

# Not a secure randomness source:
bad_secret = random.randbytes(256//8)

# Not enough entropy:
bad_secret = secrets.token_bytes(128//8)

# Not enough entropy for HS512
meh_secret_for_hs512 = secrets.token_bytes(256//8)
```

#### Header fields

The following table lists some important JWT (JOSE) header parameters for security purpose.

| Parameter       | Semantic                               | Security impact
|-----------------|----------------------------------------|----------------
| `alg`           | Signature algorithm                    | Signature algorithm used, risk of key type confusion
| `typ`           | Media type                             | Protection against token type confusion
| `jku`           | Verification key (URL to the JWK)      | Risk of untrusted key usage, risk or SSRF
| `x5u`           | Verification key (URL to certificate)  | Risk of untrusted key usage, risk or SSRF
| `jwk`           | Verification key (JWK)                 | Risk of untrusted key usage
| `kid`           | Verification key (key ID)              | Risk of untrusted key usage
| `x5c`           | Verification key (certificate chain)   | Risk of untrusted key usage
| `x5t`           | Verification key (certificate hash)    | Risk of untrusted key usage
| `x5t#S256`      | Verification key (certificate hash)    | Risk of untrusted key usage

See the [header parameters subregistry](https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-header-parameters) for a list of standard JWT (JOSE) header parameters.

#### Claims

The following table lists some important JWT claims for security purpose.

| Parameter       | Semantic                               | Security impact
|-----------------|----------------------------------------|----------------
| `exp`           | Expiration                             | Token validity
| `nbf`           | Not valid before                       | Token validity
| `status`        | Reference to token status list         | Token revocation, risk of SSRF
| `iss`           | Issuer                                 | Scoping of claims (eg. `iss`), risk of untrusted issuer, risk of SSRF
| `aud`           | Audience                               | Protection against audience confusion
| `sub`, `sub_id` | Subject identifier                     | Subject/user identification, risk of cross-issuer user impersonation
| `jti`           | Token identifier                       | Audit (logs)
| `iat`           | Issuance timestamp                     | Audit (logs)
| `azp`           | Authorized Party (OIDC)                | Audit (logs), authorization
| `client_id`     | Client (OAuth 2)                       | Audit (logs), authorization
| `auth_time`     | Authentication timestamp (OIDC)        | Enforcing authentication freshness
| `acr`           | Authentication class                   | Enforcing authentication strength (eg. MFA)
| `amr`           | Authentication method reference        | Enforcing authentication strength (eg. MFA)
| `cnf`           | Token holder (public) key              | Sender constrained token
| `may_act`       | Authorized Actor (impersonation/delegation) | Risk of cross-issuer user impersonation
| `act`           | Actor (delegation, “on behalf of”)     | Audit (logs), risk of invalid actor imputation
| `scope`         | Token restriction (OAuth 2)            | Authorization
| `roles`         | User roles                             | Authorization, risk of spoofed cross-issuer authorization
| `groups`        | User groups                            | Authorization, risk of spoofed cross-issuer authorization
| `entitlements`  | User entitlements                      | Authorization, risk of spoofed cross-issuer authorization
| `authorization_details` | Fine grained authorizations    | Authorization, risk of spoofed cross-issuer authorization

See the [JSON Web Token Claims subregistry](https://www.iana.org/assignments/jwt/jwt.xhtml) for a list of standard JWT claims.

Many implementation have built-in support for validating core JWT claims such as `nbf`, `exp`, `iss` and `aud`.

### Threats on JWTs

See [RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725#name-threats-and-vulnerabilities) for a discussion on threats and vulnerabilities related to JWT.

#### Unsecured JWTs

Some JWT libraries, [used to accept unsecured JWTs by default](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/) (`"alg":"none"`). In this case, an attacker would be able to forge their own JWTs: depending on the application, they might be able to impersonate arbitrary users, obtains arbitrary authorizations, etc.

This issue should now be fixed in JWT libraries.

Mitigation:

- Make sure that `"alg":"none"` is not accepted by your JWT parser. It should be disabled by default by recent implementations.

#### Key type confusion

Some JWT implementations would accept to use a public key intended for public-key digital signature as if it was a secret key used for MAC verification. In this context, an attacker could forge a MAC-based JWT by using the public key of the real issuer as if it was a secret key.

This threat is also called “key confusion” or “algorithm confusion”.

Example of legitimate token issuance:

```python
token = jwt.encode(claims, private_key_bytes, algorithm="ES256")
```

Example of attacker forging a token based on key type confusion:

```python
token = jwt.encode(claims, public_key_bytes, algorithm="HS256")
```

Example of validation potentially vulnerable to key type confusion:

```python
# If the token is using a MAC, the library might interpret the public key bytes as a MAC secret:
decoded = jwt.decode(token, public_key_bytes, algorithms=jwt.algorithms.get_default_algorithms())
```

Note: this issue is [mitigated](https://github.com/jpadilla/pyjwt/commit/9c528670c455b8d948aff95ed50e22940d1ad3fc) in recent versions of the PyJWT library by detecting whether a MAC key appears to be a public key (in PEM of SSH format).

Mitigations (at validation):

- use a library which is not vulnerable to the issue (eg. strong-typing of the type of key);
- chose the key depending on the requested signature algorithm or validate that the key used for validation is consistent with the signature algorithm;
- if possible, hardcode the accepted algorithms and do not mix public-key digital signatures algorithms and MAC algorithms.

Example of validation not vulnerable because MAC algorithms are not accepted:

```python
decoded = jwt.decode(token, public_key_bytes, algorithms=["ES256"])
```

Illustrative signature verification using [joserfc's typed key import](https://jose.authlib.org/en/guide/jwk/#import-keys) and a trusted EC public key. [Claim validation](https://jose.authlib.org/en/guide/jwt/#validate-claims) is still required before accepting the token. Replace the example key with your issuer's trusted public key; `encoded` is the received token string.

```python
from joserfc import jwt, jwk

public_jwk = {
    "kty": "EC",
    "crv": "P-256",
    "x": "f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
    "y": "x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0",
}
public_key = jwk.import_key(public_jwk)
decoded = jwt.decode(encoded, public_key, algorithms=["ES256"])
```

References:

- [Algorithm confusion attacks](https://portswigger.net/web-security/jwt/algorithm-confusion);
- [CVE-2022-29217](https://nvd.nist.gov/vuln/detail/cve-2022-29217), Key confusion through non-blocklisted public key formats (PyJWT);
- [CVE-2023-48223](https://nvd.nist.gov/vuln/detail/CVE-2023-48223), JWT Algorithm Confusion in fast-jwt.

#### Trusting key material named in the token header

A JWS header can carry the verification key itself or a pointer to it: `jwk` (an embedded key), `jku` (a URL to a JWK Set), `x5u` (a URL to an X.509 certificate) and `x5c` (an embedded certificate chain), alongside the key selection hints `kid`, `x5t` and `x5t#S256`. An application that resolves or selects its verification key from these header parameters, without tying the result back to something it already trusts, can be steered into trusting a key the attacker controls, because the header is unauthenticated attacker input.

An attacker can forge their own token, include their own public key in `jwk`, or point `jku` or `x5u` at a JWK Set or certificate they host, and sign the token with the matching private key. A verifier that trusts the key it has just read from the token accepts the forgery. An attacker can also try to smuggle a symmetric key through the same parameters, in the hope that the implementation will use it for MAC verification.

These parameters have legitimate uses, so the distinction is anchoring rather than avoidance. `x5c` and `x5u` are usable where the certificate chain validates up to an anchor already trusted for that issuer, and `kid`, `x5t` and `x5t#S256` are the normal way to choose which key from an already configured JWKS should verify a given token. What must not happen is treating any of them as the source of trust rather than as a pointer within it.

Mitigations:

- Do not take the verification key from the token unless that key can be tied, through a chain of trust, to a root trust anchor associated with the issuer.
- Prefer trust material established out of band, such as a pinned key or the `jwks_uri` published in the issuer's metadata.
- Validate or sanitize `kid` before using it in a lookup, since it also reaches databases and directories as an injection vector.
- Where keys are fetched by URL, see the [Server Side Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

References:

- [RFC 8725, Do Not Trust Received Claims](https://datatracker.ietf.org/doc/html/rfc8725#name-do-not-trust-received-claim);
- [CVE-2018-0114](https://nvd.nist.gov/vuln/detail/CVE-2018-0114), a key embedded in the JWS header trusted for verification.

#### Issuer and audience confusion

A JWT typically carries the `iss` (issuer) claim to say who created it and the `aud` (audience) claim to say which party is expected to consume and validate it. Neither claim is mandatory, and some designs omit one deliberately: a token an application issues and consumes itself, under a key used for nothing else, or an SD-JWT whose audience is established by the accompanying key binding JWT rather than by an `aud` claim. Where a key does speak for more than one issuer or more than one recipient, however, a verifier that checks only the signature and the expiration accepts any token that key has signed, whatever `iss` and `aud` it carries. An attacker holding such a token, whether legitimately issued to them or obtained from a service they control, may then be able to replay it against a different recipient. RFC 8725 calls this a substitution attack.

Two variants are worth separating, because different checks defeat them.

**Audience confusion.** An attacker presents a token issued for one service to a second service that trusts the same issuer. If the second service does not require its own identifier in `aud`, the token is accepted. For example, a token minted for a low-privilege service is replayed against an internal API, and the attacker gains access that was never granted. On a different axis, a third-party application that legitimately receives tokens for its own use can replay one against another application, first-party or third-party, reaching data or operations it was never granted.

**Issuer confusion.** An attacker presents a token from a different issuer that the verifier also trusts, such as a partner tenant or a self-service account at a public identity provider. Comparing the `iss` string alone does not stop this if the verifier resolves its verification key independently of `iss`. A verifier that looks up the key by `kid` across the union of several trusted issuers' JWK Sets will accept a token whose `iss` names one issuer and whose `kid` names a key belonging to another: the signature verifies against the key that `kid` selected, and the `iss` and `aud` comparisons pass because the attacker set both to what the verifier expects. No key needs to be stolen, and the deployment need not be multi-tenant.

Mitigations:

- Validate `iss` against what the deployment trusts, as a case-sensitive comparison of the whole string including scheme and path. Where a single issuer is expected this is an equality check. Where issuers are provisioned dynamically, through a discovery protocol for example, it becomes membership of an explicit allowlist of issuer identifiers, rather than acceptance of whatever `iss` the token presents.
- Select the verification key from the set bound to the validated `iss`, for example that issuer's `jwks_uri`; never verify against a union of keys from several issuers. In multi-tenant deployments this means resolving the key set from an allowlist keyed by issuer rather than searching every tenant's keys.
- Validate that the recipient's own identifier is present in `aud`, whether `aud` is a single string or an array of strings.
- Where the deployment relies on these claims, reject tokens in which `iss` or `aud` is missing. RFC 7519 makes both optional, so this is a deployment decision rather than a specification requirement: a verifier with no `iss` has nothing to bind the key to, and one with no `aud` cannot tell whether the token was meant for it, but a profile that establishes either by other means does not need the claim itself.

The related case, where the key material itself is taken from the token rather than merely selected by it, is covered in [Trusting key material named in the token header](#trusting-key-material-named-in-the-token-header). Where verification uses a MAC, see also the secret reuse points under [MAC](#mac).

Example of strict validation in Python with PyJWT, resolving the key from the expected issuer's JWK Set rather than accepting one supplied independently:

```python
import jwt

ISSUER = "https://auth.example.com/"
AUDIENCE = "https://api.example.com/v1/payments"

# Keys come from this issuer's JWK Set only (its published jwks_uri),
# so a `kid` naming a key of some other trusted issuer cannot verify
# this token.
jwks_client = jwt.PyJWKClient("https://auth.example.com/.well-known/jwks.json")
signing_key = jwks_client.get_signing_key_from_jwt(token)

decoded_payload = jwt.decode(
    token,
    signing_key,
    algorithms=["ES256"],
    issuer=ISSUER,
    audience=AUDIENCE,
    options={"require": ["exp", "iss", "aud"]},
)
```

Note: in PyJWT the `issuer` and `audience` arguments perform the validation. The `verify_iss` and `verify_aud` options are enabled by default and gate checks that do nothing on their own, so a token is only checked against an expected issuer and audience when those arguments are passed.

References:

- [RFC 8725, Substitution Attacks](https://datatracker.ietf.org/doc/html/rfc8725#name-substitution-attacks);
- [RFC 8725, Validate Issuer and Subject](https://datatracker.ietf.org/doc/html/rfc8725#name-validate-issuer-and-subject);
- [RFC 8725, Use and Validate Audience](https://datatracker.ietf.org/doc/html/rfc8725#name-use-and-validate-audience);
- [RFC 7519, "iss" (Issuer) Claim](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.1);
- [RFC 7519, "aud" (Audience) Claim](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3).

#### Cross-JWT and token type confusion

Cross-JWT (or token type) confusion occurs when validation rules fail to distinguish token kinds, allowing a token issued for one purpose (such as an ID or password-reset token) to be accepted as another (such as an access token). Overlapping claims or shared signing keys are common enabling conditions (see [RFC 8725 §2.8](https://datatracker.ietf.org/doc/html/rfc8725#name-cross-jwt-confusion)).

Mitigations:

- **Use explicit typing (`typ`):** Set the `typ` header parameter to a specific media type distinguishing the token's purpose, such as `"at+jwt"` for OAuth 2.0 access tokens ([RFC 9068](https://datatracker.ietf.org/doc/html/rfc9068)), `"logout+jwt"` for logout tokens ([OpenID Connect Back-Channel Logout 1.0 §2.4](https://openid.net/specs/openid-connect-backchannel-1_0.html#LogoutToken)), or custom types (e.g., `example-reset+jwt`) for internal tokens.
- **Validate `typ` at the verifier:** For token profiles that require or reliably provide explicit typing, reject tokens with missing or unexpected `typ` values at that endpoint. Note that `typ` is case-insensitive and the `application/` prefix may be omitted ([RFC 7515 §4.1.9](https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.9)).
- **Use mutually exclusive validation rules:** Where explicit typing cannot be enforced interoperably (e.g., standard OIDC ID tokens omitting `typ`), distinguish token kinds using separate signing keys, required claims, or strict **`iss` and `aud` isolation** ([RFC 8725 §3.12](https://datatracker.ietf.org/doc/html/rfc8725#name-use-mutually-exclusive-vali)).

Example of validation enforcing explicit token type:

```python
import jwt

# Verify signature and standard claims first
decoded = jwt.decode_complete(
    token,
    public_key,
    algorithms=["ES256"],
    audience="https://api.example.com",
    issuer="https://auth.example.com",
    options={"require": ["exp", "iss", "aud"]},
)

# Enforce explicit token type from the verified header
typ = str(decoded["header"].get("typ", "")).lower()
if typ not in ["at+jwt", "application/at+jwt"]:
    raise jwt.InvalidTokenError("Invalid token type: expected at+jwt")
```

References:

- [RFC 8725 §3.11, Use Explicit Typing](https://datatracker.ietf.org/doc/html/rfc8725#name-use-explicit-typing);
- [RFC 8725 §3.12, Use Mutually Exclusive Validation Rules for Different Kinds of JWTs](https://datatracker.ietf.org/doc/html/rfc8725#name-use-mutually-exclusive-vali);
- [RFC 9068, JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens](https://datatracker.ietf.org/doc/html/rfc9068).

### JWT revocation

#### Token Status List

If revocation of the JWTs by the issuer is needed, the [Token Status Lists](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-status-list) (TSL) can be used:

- the JWT contains the URI of a TSL;
- the TSL aggregates the revocation status of several tokens in compressed form;
- the consumer of the token can fetch the TSL to obtain the revocation status of the JWT.

The issuer includes a `status` claim in the JWT. This claims contains the URI of the associated TSL and the index of the status of the JWT within this list:

```json
{
    "iss": "https://issuer.example/",
    "sub": "NsxuACbpJ9N7Ix96aWrYxHX-EZ4",
    "iat": 1783635268,
    "nbf": 1783635268,
    "exp": 1783653268,
    "status": {
        "status_list": {
            "idx": 6,
            "uri": "https://issuer.example/tsl/JAffke55FR5gtJQ_rtktWkSaTlI"
        }
    }
}
```

### Replay protection

#### JWT denylist

In some cases, the consumer of the token might want to maintain a JWT denylist. This might be for example used a simple form of JWT replay protection or as a workaround for the “stateless session” invalidation problem.

A JWT deny list can typically be implemented based on the  `jti` and `iss` claims:

```python
def revoke_token(claims):
    jti = claims.get("jti")
    iss = claims.get("iss")
    exp = claims.get("exp")
    deny_list.insert((jti, iss), exp)

def is_token_revoked(claims) -> bool:
    jti = claims.get("jti")
    iss = claims.get("iss")
    return deny_list.contains((jti, iss))
```

Depending on the application and the type of JWT, other claims might be more suitable.

**Warning:** Using the raw JWT or a secure hash of the JWT (`SHA-256(token)`) as the denylist key is *not safe* and might expose the application to **denylist bypass through [JWT malleability](https://www.gabriel.urdhr.fr/2026/06/27/ecdsa-jwt-malleability/)**. An attacker in possession of a revoked JWT might be able to modify an alternative representation of the JWT that still passes signature verification:

- because of non-strict JWT parsing of the JWT implementation;
- for ECDSA JWTs, because of the malleability of ECDSA signatures.

```python
# Not secure. Might be vulnerable to JWT malleability:
def unsafe_revoke_token(claims):
    exp = claims.get("exp")
    token_hash = hashlib.sha256(token.encode("utf-8")).digest()
    deny_list.insert(token_hash, exp)
```

Before implementing such a JWT denylist, you should consider whether there is a better solution for your problem:

- Token Status List is a scalable solution for revocation of the JWT by the issuer.
- Freshness and replay protection can often by implementing by using a `nonce` bound to the session in the JWT claims. This approach is [used in OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes).
- Token reuse can be mitigated by using short expiration time in the JWT.
- Sender-constrained access tokens, such as [DPoP-bound tokens](https://datatracker.ietf.org/doc/html/rfc9449#section-2) or [mutual-TLS certificate-bound tokens](https://www.rfc-editor.org/rfc/rfc8705.html#section-3), limit an attacker's ability to use a stolen token without its associated private key. They do not prevent token disclosure. Protect tokens and keys, use HTTPS, and prevent [untrusted code from using the client's signing key](https://datatracker.ietf.org/doc/html/rfc9449#section-11.4).

### Token Confidentiality and JWE

#### Signed JWTs are not confidential

A signed JWT ([JSON Web Signature](https://datatracker.ietf.org/doc/html/rfc7515), JWS) provides integrity and authenticity, but not confidentiality. The payload is only base64url encoded, not encrypted, so anyone who obtains the token can read every claim. With a MAC (`HS*`), a valid signature also only proves that the token was produced by some holder of the shared secret, see [Public-key Signatures vs. MAC](#public-key-signatures-vs-mac).

TLS prevents the token from being read in transit, but the claims remain exposed elsewhere: in application logs, in browser storage, in referrer headers, and to any intermediary that terminates TLS.

[Omitting privacy-sensitive information from a JWT is the simplest way of minimizing privacy issues](https://datatracker.ietf.org/doc/html/rfc7519#section-12). Prefer keeping sensitive data server-side behind an opaque reference token. Use JWE only when the claims must travel with the token to a party that cannot resolve them with the issuer.

#### Using JWE

When claims must be kept confidential, use [JSON Web Encryption (JWE)](https://datatracker.ietf.org/doc/html/rfc7516). JWE uses two algorithms:

- **`alg`:** the key management algorithm, which [encrypts or agrees upon](https://datatracker.ietf.org/doc/html/rfc7518#section-4.1) the Content Encryption Key (CEK) for the intended recipient (for example `RSA-OAEP-256` or `ECDH-ES+A256KW`).
- **`enc`:** the content encryption algorithm, which encrypts the payload using authenticated encryption (for example `A256GCM`).

JWE provides confidentiality and ciphertext integrity, **not** issuer authentication. With a public-key `alg`, anyone holding the recipient's public key can produce a token that decrypts successfully, so never make authorization decisions on claims from an unsigned JWE.

When both authenticity and confidentiality are needed, use a **nested JWT**: sign the claims first (JWS), then encrypt the result (JWE). This [prevents attacks in which the signature is stripped, leaving just an encrypted message, as well as providing privacy for the signer](https://datatracker.ietf.org/doc/html/rfc7519#section-11.2). In the outer JWE, the `cty` header [MUST be set to `JWT`](https://datatracker.ietf.org/doc/html/rfc7519#section-5.2) to signal the nesting.

When consuming a nested JWT, decrypt the outer JWE **and** verify the inner JWS signature, rejecting the token if either step fails. [Both the outer and the inner operations MUST be validated](https://datatracker.ietf.org/doc/html/rfc8725#section-3.3): successful decryption on its own proves nothing about who issued the claims.

Two further requirements apply to JWE:

- Accept only an allowlisted `alg`/`enc` pair and bind each key to a single algorithm. Never let the token header select the algorithm, because this [enables a downgrade attack that can recover the CEK](https://datatracker.ietf.org/doc/html/rfc7516#section-11.4).
- Do not compress the claims before encryption (the `zip` header), because [compressed data often reveals information about the plaintext](https://datatracker.ietf.org/doc/html/rfc8725#section-3.6).

**Note:**

Full JWE implementation guidance is out of scope for this cheat sheet and will be addressed in a dedicated JWE cheat sheet.

## OAuth 2.0 Protocol Cheatsheet

> **Source:** [OAuth 2.0 Protocol Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

This cheatsheet describes the best current security practices for [OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749.html) as derived from its RFC. OAuth became the standard for API protection and the basis for federated login using OpenID Connect. OpenID Connect 1.0 is a simple identity layer on top of the OAuth 2.0 protocol. It enables clients to verify the identity of the end user based on the authentication performed by an authorization server, as well as to obtain basic profile information about the end user in an interoperable and REST-like manner.

**Note:** OAuth 2.0 supports different token types to address various security and implementation requirements. **Bearer tokens** ([RFC 6750](https://www.rfc-editor.org/rfc/rfc6750.html)) provide simplicity and broad adoption. **Proof of Possession (PoP) tokens** offer advanced security through cryptographic binding between tokens and clients. The appropriate token type depends on your application's security requirements, threat model, and implementation constraints.

### Terminology

- **Client**: Generally refers to an application making protected resource requests on behalf of the resource owner and with its authorization. The term "client" does not imply any particular implementation characteristics (e.g., whether the application executes on a server, a desktop, or other devices).
- **Authorization Server (AS)**: Refers to the server issuing access tokens to the client after successfully authenticating the resource owner and obtaining consent from the resource owner.
- **Resource Owner (RO)**: Refers to an entity capable of granting access to a protected resource. When the resource owner is a person, it is referred to as an end user. It can also be an organization or system.
- **Resource Server (RS)**: Refers to the server hosting the protected resources, capable of accepting and responding to protected resource requests using access tokens.

- **Access Tokens**: Provide an abstraction, replacing different authorization constructs (e.g., username and password, assertion) by a single token understood by the resource server. This abstraction enables issuing access tokens valid for a short period, as well as removing the resource server's need to understand a wide range of authentication schemes. The most common type is the **bearer token** (RFC 6750), which is straightforward to implement and integrate, requiring only the token value for API access. Since anyone possessing a bearer token can use it, bearer tokens should be audience-restricted, preferably to a single Resource Server, to limit the impact of token leakage.
- **Refresh Tokens** are credentials used to obtain access tokens. These are issued to the client by the authorization server and are used to obtain a new access token when the current access token becomes invalid or expires or to obtain additional access tokens with identical or narrower scope (access tokens may have a shorter lifetime and fewer permissions than authorized by the resource owner). Refresh tokens should be protected using sender-constraining mechanisms (DPoP or mTLS) or refresh token rotation.

- **Proof of Possession (PoP) tokens**: Access tokens or refresh tokens that are cryptographically bound to clients through mechanisms like DPoP (RFC 9449) or mTLS-bound access tokens (RFC 8705). These tokens are bound to a private key owned by the client and the client must demonstrate possession of this private key in order to use the token. This approach provides additional protection in scenarios where token interception is a concern, with additional implementation requirements for key management and proof generation.

### OAuth 2.0 Essential Basics

1. Clients and Authorization Server must not expose URLs that forward the user's browser to arbitrary URIs obtained from a query parameter ("open redirectors") which can enable exfiltration of authorization codes and access tokens.
2. Clients have ensured that the Authorization Server supports PKCE may rely on the CSRF protection provided by PKCE. In OpenID Connect flows, the "nonce" parameter provides CSRF protection. Otherwise, one-time user CSRF tokens carried in the "state" parameter that are securely bound to the user agent must be used for CSRF protection.
3. When an OAuth Client can interact with more than one Authorization Server, Clients should use the issuer "iss" parameter as a countermeasure, or based on an "iss" value in the authorization response (such as the "iss" Claim in the ID Token in OpenID)
4. When the other [mix-up countermeasure options](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.4.2) for OAuth clients interacting with more than one Authorization Servers are absent, Clients may instead use distinct redirect URIs to identify authorization endpoints and token endpoints.
5. An Authorization Server avoids forwarding or redirecting a request potentially containing user credentials accidentally.

### PKCE - Proof Key for Code Exchange Mechanism

OAuth 2.0 public clients utilizing the Authorization Code Grant are susceptible to the authorization code interception attack. Proof Key for Code Exchange (PKCE, pronounced "pixy") is the technique used to mitigate against the threat of authorization code interception attack.

Originally, PKCE is intended to be used solely focused on securing native apps, but then it became a deployed OAuth feature. It does not only protect against authorization code injection attacks but also protects authorization codes created for public clients as PKCE ensures that the attacker cannot redeem a stolen authorization code at the token endpoint of the authorization server without knowledge of the code_verifier.

6. Clients are preventing injection (replay) of authorization codes into the authorization response by using PKCE flow. Additionally, clients may use the OpenID Connect "nonce" parameter and the respective Claim in the ID Token instead. The PKCE challenge or OpenID Connect "nonce" must be transaction-specific and securely bound to the client and the user agent in which the transaction was started. **Note:** PKCE protects authorization codes; use sender-constrained tokens to protect access and refresh tokens.
7. When using PKCE, Clients should use PKCE code challenge methods that do not expose the PKCE verifier in the authorization request. Otherwise, attackers who can read the authorization request can break the security provided by the PKCE. Authorization servers must support PKCE.
8. If a Client sends a valid PKCE "code_challenge" parameter in the authorization request, the authorization server enforces the correct usage of "code_verifier" at the token endpoint.
9. Authorization Servers are mitigating PKCE Downgrade Attacks by ensuring a token request containing a "code_verifier" parameter is accepted only if a "code_challenge" parameter is present in the authorization request.

### Implicit Grant (DEPRECATED — DO NOT USE)

The Implicit Grant (`response_type=token`) is **deprecated** by [RFC 9700 §2.1.2](https://datatracker.ietf.org/doc/html/rfc9700#section-2.1.2) and removed from OAuth 2.1. It exposes access tokens in the URL fragment, which can be retained in [browser history](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.3.2) and is accessible to [scripts running on the response page](https://www.rfc-editor.org/rfc/rfc9110.html#section-17.11); these tokens cannot be sender-constrained. Major identity providers have either disabled it or marked it for removal.

10. Clients **must** use the Authorization Code Grant with PKCE (`response_type=code`) for all client types, including SPAs and native applications. Existing applications using the Implicit Grant must migrate. The hybrid `code id_token` response type may be used only when an OpenID Connect ID Token is required at the authorization endpoint; access tokens must still be obtained via the token endpoint and never via the front channel.

### Token Replay Prevention

Token security is a critical aspect of OAuth 2.0 implementations. Sender-constrained tokens establish a binding between the token and the client. Proof of Possession (PoP) tokens are a specific type of sender-constrained token that use cryptographic binding through a private key owned by the client. This binding requires the client to demonstrate possession of the private key when using the token, adding a layer of security through client authentication at the token usage level.

#### PoP Mechanisms Comparison

**DPoP (Demonstration of Proof of Possession - RFC 9449):**

- The client generates a public-private key pair. The Authorization Server binds each DPoP access token to this public key. For JWT access tokens, the Authorization Server represents the binding using the `cnf` (confirmation) claim with a JWK thumbprint (`jkt`), as specified in [RFC 9449 Section 6.1](https://www.rfc-editor.org/rfc/rfc9449.html#section-6.1). For opaque tokens, the Resource Server can obtain the same binding through [token introspection](https://www.rfc-editor.org/rfc/rfc9449.html#section-6.2). For each API request, the client includes a proof-of-possession of its private key taking the form of a JWT signed with this private key that includes a hash of the access token. The Resource Server validates both the access token and the DPoP proof (including the token hash) to ensure the request originates from the legitimate token holder.
- It does not require mutual TLS authentication; proof is provided via the DPoP HTTP headers; suitable for various client types including browsers and mobile applications; requires additional cryptographic operations per request.

**Mutual TLS Certificate-Bound Access Tokens (RFC 8705):**

- The client authenticates using a TLS client certificate during the TLS handshake (mutual TLS authentication, mTLS). The Authorization Server binds the access token to the client certificate's thumbprint via the `cnf` claim. The Resource Server validates that the certificate presented during the TLS handshake matches the certificate bound to the access token.
- It operates at the transport layer; leverages existing TLS infrastructure; can use PKI or self-signed certificates for certificate management; authentication occurs during connection establishment; no per-request proof generation needed.

#### When to Use PoP Tokens

Proof of Possession tokens are particularly valuable in scenarios requiring enhanced token security properties. Consider PoP tokens for:

- APIs where sender-constraining can limit replay of a leaked access token. Both bearer and PoP tokens should be [audience-restricted](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.3), preferably to a single Resource Server
- APIs handling sensitive data (financial, healthcare, personal information, etc.) where additional security layers are beneficial
- High-value transactions (payments, critical operations, etc.) where cryptographic client binding adds assurance
- Long-lived tokens where extended validity periods warrant additional protection mechanisms
- Cross-organizational access (B2B integrations) involving multiple security domains
- Mobile and native applications where the client environment may present additional security considerations
- Distributed architectures where tokens traverse multiple network boundaries

The selection of token security approach should consider the application's security requirements, existing infrastructure, client capabilities, and operational resources.

11. For advanced protection against token replay scenarios, Authorization and Resource Servers may implement mechanisms for sender-constraining access tokens, such as Mutual TLS for OAuth 2.0 (mTLS - RFC 8705) or Demonstration of Proof of Possession (DPoP - RFC 9449). These mechanisms cryptographically bind tokens to specific clients through proof-of-possession of the private key.
12. Refresh tokens are sender-constrained (using DPoP or mTLS) or use refresh token rotation (issuing new refresh tokens and invalidating old ones immediately to detect replay attempts). **Note:** Combining PoP-constrained refresh tokens with rotation provides defense-in-depth.

### Access Token Privilege Restriction

13. The privileges associated with an access token should be restricted to the minimum required for the particular application or use case. This prevents clients from exceeding the privileges authorized by the Resource Owner. It also prevents users from exceeding their privileges authorized by the respective security policy. Privilege restrictions also help to reduce the impact of access token leakage. **Combine with sender-constrained tokens for defense-in-depth.**
14. Access tokens are restricted to certain Resource Servers (audience restriction), preferably to a single Resource Server. The Authorization Server should associate the access token with certain Resource Servers and every Resource Server is obliged to verify, for every request, whether the access token sent with that request was meant to be used for that particular Resource Server. If not, the Resource Server must refuse to serve the respective request. Clients and Authorization Servers may utilize the parameters "scope" and "resource", respectively to determine the Resource Server they want to access.
15. Access tokens are restricted to certain resources and actions on Resource Servers or resources. The Authorization Server should associate the access token with the respective resource and actions and every Resource Server is obliged to verify, for every request, whether the access token sent with that request was meant to be used for that particular action on the particular resource. If not, the Resource Server must refuse to serve the respective request. Clients and Authorization Servers may utilize the parameters "scope" and "authorization_details" to determine those resources and/or actions.

### Resource Owner Password Credentials Grant

16. The Resource Owner password credentials grant is not used. This grant type insecurely exposes the credentials of the Resource Owner to the client, increasing the attack surface of the application.

### Client Authentication

17. Authorization Servers are using client authentication if possible. It is recommended to use asymmetric (public-key based) methods for client authentication such as mTLS or "private_key_jwt" (OpenID Connect). When asymmetric methods for client authentication are used, Authorization Servers do not need to store sensitive symmetric keys, making these methods more robust against several attacks.

### Other Recommendations

18. Authorization Servers do not allow clients to influence their "client_id" or "sub" value or any other Claim that can be confused with a genuine Resource Owner. It is recommended to use end-to-end TLS.
19. Authorization responses are not transmitted over unencrypted network connections. Authorization Servers must not allow redirect URIs that use the "http" scheme except for native clients that use Loopback Interface Redirection.

## SAML Security

> **Source:** [SAML Security](https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

The **S**ecurity **A**ssertion **M**arkup **L**anguage ([SAML](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language)) is an open standard for exchanging authorization and authentication information. The *Web Browser SAML/SSO Profile with Redirect/POST bindings* is one of the most common SSO implementation. This cheatsheet will focus primarily on that profile.

### Validate Message Confidentiality and Integrity

[TLS 1.2](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html) is the most common solution to guarantee message confidentiality and integrity at the transport layer. Refer to [SAML Security (section 4.2.1)](https://docs.oasis-open.org/security/saml/v2.0/saml-sec-consider-2.0-os.pdf) for additional information. This step will help counter the following attacks:

- Eavesdropping 7.1.1.1
- Theft of User Authentication Information 7.1.1.2
- Theft of the Bearer Token 7.1.1.3
- Message Deletion 7.1.1.6
- Message Modification 7.1.1.7
- Man-in-the-middle 7.1.1.8

A digitally signed message with a certified key is the most common solution to guarantee message integrity and authentication. Refer to [SAML Security (section 4.3)](https://docs.oasis-open.org/security/saml/v2.0/saml-sec-consider-2.0-os.pdf) for additional information. This step will help counter the following attacks:

- Man-in-the-middle 6.4.2
- Forged Assertion 6.4.3
- Message Modification 7.1.1.7

Assertions may be encrypted via XMLEnc to prevent disclosure of sensitive attributes post transportation. Refer to [SAML Security (section 4.2.2)](https://docs.oasis-open.org/security/saml/v2.0/saml-sec-consider-2.0-os.pdf) for additional information. This step will help counter the following attacks:

- Theft of User Authentication Information 7.1.1.2

### Validate Protocol Usage

This is a common area for security gaps - see [Google SSO vulnerability](https://www.kb.cert.org/vuls/id/612636/) for a real life example. Their SSO profile was vulnerable to a Man-in-the-middle attack from a malicious SP (Service Provider).

The SSO Web Browser Profile is most susceptible to attacks from trusted partners. This particular security flaw was exposed because the SAML Response did not contain all of the required data elements necessary for a secure message exchange. Following the [SAML Profile](https://docs.oasis-open.org/security/saml/v2.0/saml-profiles-2.0-os.pdf) usage requirements for AuthnRequest (4.1.4.1) and Response (4.1.4.2) will help counter this attack.

The *AVANTSSAR* team suggested the following data elements should be required:

- **AuthnRequest(ID, SP):** An `AuthnRequest` must contain and `ID` and `SP`. Where `ID` is a string uniquely identifying the request and an `SP` identifies the `Service Provider` that initiated the request. Furthermore, the request `ID` attribute must be returned in the response (`InResponseTo="<requestId>"`). `InResponseTo` helps guarantee authenticity of the response from the trusted IdP. This was one of the missing attributes that left Google's SSO vulnerable.
- **Response(ID, SP, IdP, {AA} K -1/IdP):** A Response must contain all these elements. Where `ID` is a string uniquely identifying the response. `SP` identifies the recipient of the response. `IdP` identifies the identity provider authorizing the response. `{AA} K -1/IdP` is the assertion digitally signed with the private key of the `IdP`.
- **AuthAssert(ID, C, IdP, SP):** An authentication assertion must exist within the Response. It must contain an `ID`, a client `(C)`, an identity provider `(IdP)`, and a service provider `(SP)` identifier.

#### Validate Signatures

Vulnerabilities in SAML implementations due to XML Signature Wrapping attacks were described in 2012, [On Breaking SAML: Be Whoever You Want to Be](https://www.usenix.org/system/files/conference/usenixsecurity12/sec12-final91-8-23-12.pdf).

The following recommendations were proposed in response ([Secure SAML validation to prevent XML signature wrapping attacks](https://arxiv.org/pdf/1401.7483v1.pdf)):

- Without exception, always perform schema validation on the XML document prior to using it for any security-related purposes::
    - Always use local, trusted copies of schemas for validation.
    - Never allow automatic download of schemas from third party locations.
    - If possible, inspect schemas and perform schema hardening, to disable possible wildcard type or relaxed processing statements.
- Securely validate the digital signature:
    - If you expect only one signing key, use `StaticKeySelector`. Obtain the key directly from the identity provider, store it in a local file and ignore any `KeyInfo` elements in the document.
    - If you expect more than one signing key, use `X509KeySelector` (the JKS variant). Obtain these keys directly from the identity providers, store them in local JKS and ignore any `KeyInfo` elements in the document.
- Avoid signature-wrapping attacks.
    - Never use `getElementsByTagName` to select security related elements in an XML document without prior validation.
    - Always use absolute XPath expressions to select elements, unless a hardened schema is used for validation.

### Validate Protocol Processing Rules

This is another common area for security gaps simply because of the vast number of steps to assert.

Processing a SAML response is an expensive operation but all steps must be validated:

- Validate AuthnRequest processing rules. Refer to [SAML Core](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf) (3.4.1.4) for all AuthnRequest processing rules. This step will help counter the following attacks:
    - Man-in-the-middle (6.4.2)
- Validate Response processing rules. Refer to [SAML Profiles](https://docs.oasis-open.org/security/saml/v2.0/saml-profiles-2.0-os.pdf) (4.1.4.3) for all Response processing rules. This step will help counter the following attacks:
    - Stolen Assertion (6.4.1)
    - Man-in-the-middle (6.4.2)
    - Forged Assertion (6.4.3)
    - Browser State Exposure (6.4.4)

### Validate Binding Implementation

- For an HTTP Redirect Binding refer to [SAML Binding](https://docs.oasis-open.org/security/saml/v2.0/saml-bindings-2.0-os.pdf) (3.4). To view an encoding example, you may want to reference RequestUtil.java found within [Google's reference implementation](https://developers.google.com/google-apps/sso/saml_reference_implementation_web).
- For an HTTP POST Binding refer to [SAML Binding](https://docs.oasis-open.org/security/saml/v2.0/saml-bindings-2.0-os.pdf) (3.5). The caching considerations are also very important. If a SAML protocol message gets cached, it can subsequently be used as a Stolen Assertion (6.4.1) or Replay (6.4.5) attack.

### Validate Security Countermeasures

Revisit each security threat that exists within the [SAML Security](https://docs.oasis-open.org/security/saml/v2.0/saml-sec-consider-2.0-os.pdf) document and assert you have applied the appropriate countermeasures for threats that may exist for your particular implementation.

Additional countermeasures considered should include:

- Prefer IP Filtering when appropriate. For example, this countermeasure could have prevented Google's initial security flaw if Google provided each trusted partner with a separate endpoint and setup an IP filter for each endpoint. This step will help counter the following attacks:
    - Stolen Assertion (6.4.1)
    - Man-in-the-middle (6.4.2)
- Prefer short lifetimes on the SAML Response. This step will help counter the following attacks:
    - Stolen Assertion (6.4.1)
    - Browser State Exposure (6.4.4)
- Prefer OneTimeUse on the SAML Response. This step will help counter the following attacks:
    - Browser State Exposure (6.4.4)
    - Replay (6.4.5)

Need an architectural diagram? The [SAML technical overview](https://www.oasis-open.org/committees/download.php/11511/sstc-saml-tech-overview-2.0-draft-03.pdf) contains the most complete diagrams. For the Web Browser SSO Profile with Redirect/POST bindings refer to the section 4.1.3. In fact, of all the SAML documentation, the technical overview is the most valuable from a high-level perspective.

### Unsolicited Response (ie. IdP Initiated SSO) Considerations for Service Providers

Unsolicited Response is inherently less secure by design due to the lack of **login [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#possible-csrf-vulnerabilities-in-login-forms)** protection. This limitation arises because the Service Provider (SP) has no opportunity to create a pre-login session or verify that the authentication request was intentionally initiated by the user.

While this design does not make IdP-initiated SSO uniquely vulnerable to Man-in-the-Middle (MITM) attacks—those risks apply equally to SP-initiated flows if transport security is compromised—it does remove an important layer of login intent validation.

Despite these concerns, IdP-initiated SSO remains supported for backward compatibility (notably with SAML 1.1). If it must be enabled, the following steps (in addition to those mentioned above) should help secure this flow:

- Follow the validation process mentioned in [SAML Profiles (section 4.1.5)](https://docs.oasis-open.org/security/saml/v2.0/saml-profiles-2.0-os.pdf). This step will help counter the following attacks:
    - Replay (6.1.2)
    - Message Insertion (6.1.3)
- If the contract of the `RelayState` parameter is a URL, make sure the URL is validated and explicitly on an allowlist. This step will help counter the following attack:
    - [Open Redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
- Implement proper replay detection either at the response or assertion level. This will help counter the following attack:
    - Replay (6.1.2)

### Identity Provider and Service Provider Considerations

The SAML protocol is rarely the attack vector of choice, though it's important to have cheatsheets to make sure that this is robust. The various endpoints are more targeted, so how the SAML token is generated and how it is consumed are both important in practice.

#### X.509 Certificate Considerations

Typically the security association between the Identity Provider (IdP) and Service Provider (SP) is created when the SP explicitly chooses to trust the IdP's X.509 signing certificate. Exactly how this occurs can have a strong bearing on overall security posture. How the certificate is generated, what the contents of the certificate are, and how the certificate's corresponding private key is protected all have strong bearing on security posture. e.g., if an attacker has access to use the IdP’s signing key, they can mint SAML responses containing any assertion they wish.

In many cases, the method of manually setting the association is akin to [Certificate Pinning](https://cheatsheetseries.owasp.org/cheatsheets/Pinning_Cheat_Sheet.html), which is not ideal. Depending on the IdP and SP software, or various design considerations, this may be unavoidable.

Keep in mind that the certificate's signature type can be different from that of the XML document signing type. The certificate's corresponding private key is the only key that can be used to sign the XML document, but the signing algorithm is chosen at the IdP's discretion. The most commonly supported signing algorithm is rsa-sha256.

##### SAML Parties vs Organizations

The most common SAML use cases are those of business-to-business (B2B). This means that the two parties have different security polices, practices, and risk tolerances. This guidance focuses mainly on the B2B use case. However SAML based federation or SSO is commonly used inside of an organization. In this case the term third-party CA does not apply. It is likely that the CA has been built and run to company standards and it poses no more or less risk to the SAML systems. The term third-party CA is meant to indicate a private CA run by a third-party.

##### Certificate Use Cases

There are actually 5 separate use cases for certificates in a SAML system. While this document mainly talks about the IdP’s SAML signing certificate, the security considerations apply to all four SAML related certificates. The fifth certificate, the IdP’s TLS server certificate is no more or less special than any other server certificate.

###### IdP SAML Signing

This is the certificate that an SP uses to validate an IdD’s SAML response. The IdP signs that response with the certificate’s corresponding private key. This is often the most important certificate and private key, as this protects the identity assertions being sent to the SP.

###### IdP SAML Encryption

This is less commonly used, as this is used when the SP wants to protect the SAML request sent to the IdP, not just from tampering, but from information disclosure. There should be no sensitive information in the SAML request, so it is less commonly used. If used, the certificate and private key must be different from that of the SAML signing certificate.

###### SP Signing

It is a best practice, though not required, that SPs and IdPs not allow IdP Initiated SSO. This means that the caller starts their SAML flow at the SP, which produces a signed SAML request intended for the IdP.

###### SP Encryption

It is a best practice to avoid placing sensitive data in the IdP’s SAML response, but sometimes it is unavoidable. This could be usernames or other PII. When information disclosure is a consideration, an SP will have a SAML encryption certificate. The IdP will use this and the embedded public key, in order to encrypt the SAML response. The SP must use a separate certificate and key pair for SAML signing and encryption.

##### Certificate Contents

In the context of SAML signing and encryption, X.509 certificates are most often treated simply as a wrapper to hold a public key that is used to verify a signature, or to wrap a symmetric key for SAML encryption. Nonetheless, a certificate can contain attributes that can be used to further enhance security.

OWASP recommends that IdPs and SPs move to adopt the EKU, KU, and key lifetimes mentioned below. These legitimately enhance security and allow the verifying party to further protect themselves. They also help show compliance with PKI norms.

###### Keys and Signing Algorithms

The key pair size and type and signing algorithm choice has strong bearing on security and interoperability.  Not all IdP and SP software packages or libraries support all combinations of options. As one IdP often has many SPs associated with it, the only option is to pick the least secure option that is still considered secure. The most supported and currently secure combination is using RSA 2048 bit keys and SHA-256 hashing/signing. This is referring to the certificate’s signing algorithm and not the SAML XML signing.

As post-quantum algorithms become more prevalent, and ultimately required, this becomes even more complex. Those writing SAML SP and IdP software should begin looking at options to support more key and signing algorithms.

###### Keys

ECC Keys can be much smaller while providing more security than RSA keys and the math involved is faster to perform. These are preferred when all parties can use them. ECC keys can be as low as 256 bit and still be secure. RSA keys are more interoperable. The minimum RSA key size should be 2048 bit.
At least one major vendor [Microsoft Entra](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-fed-saml-idp) doesn’t support ECC keys.

###### Signing Algorithms

When public key cryptography is used for signing data, the data is first hashed with an chosen algorithm and then the hash is signed using the private key.

No IdP should use SHA-1 as the certificate signing hash. SHA-256 is the minimum bar. That said, if possible moving to larger hash algorithms like SHA-384 or SHA-512 means you are better future-proofing your service. In this context we are talking about the certificate’s signing algorithm and not the one used to sign the SAML response XML.

###### Certificate Lifetime

X.509 certificates contain [`notBefore` and `notAfter` validity dates](https://www.rfc-editor.org/rfc/rfc5280.html#section-4.1.2.5). Plan certificate replacement before expiry rather than ignoring the validity period. Choose the signing key's usage period based on its protection, use, and threat model; see [Cryptoperiods and Rotation](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html#cryptoperiods-and-rotation). [NIST SP 800-57 Part 1 Rev. 5, Section 5.3.4](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf#page=50) distinguishes certificate validity from key usage periods: renewing a certificate with the same public key does not rotate the private key or restart its usage period.

###### Extended Key Usage (EKU) and Key Usage (KU)

[EKU](https://www.rfc-editor.org/rfc/rfc5280#section-4.2.1.12) describes a specific use case that the certificate is intended for. These are use cases like server authentication, client authentication, and code signing, which are not appropriate for SAML signing. There is no widely accepted EKU for SAML signing, but [RFC 9336](https://www.rfc-editor.org/rfc/rfc9336.txt) defines one that is ideal, id-kp-documentSigning (1.3.6.1.5.5.7.3.36). IdPs and SPs may consider standardizing on this EKU.

[KU](https://www.rfc-editor.org/rfc/rfc5280#section-4.2.1.3) describes the underlying cryptographic operations that the private key is meant for. There are things like digitalSignature, nonRepudiation, keyEncipherment, etc. IdPs and SPs may consider requiring digitalSignature and further, disallowing certificates that have other KUs, as certificates should only be used for one use case. e.g. the IdP's TLS server certificate must never be the SAML signing certificate.

###### CRL Distribution Point (CDP)

[Certificate Revocation List (CRL) Distribution Point](https://www.rfc-editor.org/rfc/rfc5280#section-4.2.1.13) are a list of certificates that the CA says should no longer be trusted. They are most often delivered over HTTP and the CRL URLs are generally embedded in each CA issued certificate. The [CRL](https://www.rfc-editor.org/rfc/rfc5280#appendix-C.4) is signed by the CA, so a man-in-the-middle attack against the HTTP cannot harm the integrity of the list, other than to tamper with, and thus invalidate, it. That is, it can't be altered by an attacker. Only CA signed certificates can have a CRL. If the SAML certificate has a CRL listed, it should be reachable by the validating party and the party should [validate](https://www.rfc-editor.org/rfc/rfc5280#section-6.3) it.

Considering the level of risk, if a private key is compromised, and the smaller scale of IdP to SP relationships, parties in a SAML system should establish a plan with contact lists to notify and rotate certificates rapidly in case of an incident. Many SAML products and libraries don’t support revocation checking, and simply revoking the certificate, without coordinated replacement, means there is an outage.

###### Online Certificate Status Protocol (OCSP)

[OCSP](https://datatracker.ietf.org/doc/html/rfc6960) is another way of checking to see if a certificate  is revoked. The OCSP URL is embedded in the certificate , like a CRL, and should be reachable  over HTTP. The response is signed, so MITM attacks are not an integrity concern. OCSP is becoming less favored, as the exchange creates privacy concerns. The caller's IP address can be seen and the certificate that is being used is disclosed. This is less of a concern for SAML, as this does not disclose a destination website, use overall has declined. If an OCSP URL is present on any certificate in the chain, it should be used to check if the certificate is revoked.

##### Certificate Hierarchy

The SAML signing certificate can be signed by one of three things. The certificate can be self-signed, public CA signed, or private CA signed. Each has pros and cons, however, given the current state of WebPKI (public) and private PKI, using self-signed SAML certificates are the clear winner when proper precautions are taken for exchanging the certificates.

###### Certificate Issuer

All X.509 certificates are signed, using a private key, by an authority known as an [Issuer](https://www.rfc-editor.org/rfc/rfc5280#section-4.1.2.4). This may be a CA or in the case of a self-signed certificate the certificate's corresponding private key. In the case of a CA signed certificate, the signer may also have a certificate that has an Issuer, and so on. This is called chain, or path, and should terminate in a Root CA (which is self-signed by definition). The issuer should be inspected. If the issuer is a CA, its attributes, such as EKU, KU, and CRLs, may also be validated. This should happen for each certificate in the [path](https://datatracker.ietf.org/doc/html/rfc5280#section-3.2) all the way to the root.

###### Public Certificate Authority (CA) Signed

With this certificate type, a Public CA issues the certificate, in accordance with their rules and the rules of the [CA Browser Forum](https://cabforum.org/) (CABF). These public root CAs get bundled into trust stores maintained by major browser vendors. Most things on the web trust these, because someone makes sure the trust stores are where they need to be.

When an IdP rotates its SAML Signing certificate, each SP must simultaneously update its explicit trust of that certificate. This can be challenging with only a few SPs. With many, it is nearly impossible. This pain has led to the use of SAML signing certificates with the longest possible lifetimes. This used to be two years with public CAs, then 398 days. The focus of WebPKI standards and the CABF is on server certificates for TLS. Recent and ongoing changes in certificate lifetimes make Public CA issued certificates less appealing. This is because the CABF has a path to making public CA issued certificates last only [47 days](https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/). As the IdP must get the certificate, announce the change for a reasonable amount of time, and then execute the change, this would mean IdPs and SPs would be in a perpetual state of certificate updates.

It is worth noting that the CABF does not have governance around the use or acquisition of SAML certificates, certificates from their member CAs are what are widely considered Public CAs. That is, they are widely trusted by browsers, operating systems, and various development frameworks.

Using Public CA signed certificates allows for revocation checking, which can increase security, but if the certificate exchange is not secured, this could lead to a false sense of security.

###### Private CA Signed

As most IdPs and SPs treat the X.509 certificates as an explicit trust, private CAs and PKI could be used. How private CAs are designed, built, and run varies wildly and ultimately running CAs well is very costly. In order to trust a third-party's CAs, one would need to clearly understand the lifecycle of the CA. There are two audit types that would cover this, both of which are very costly, on top of building and running the CAs. If you rely on third-party CAs, they should be [WebTrust](http://www.webtrust.org/), [ETSI](http://www.etsi.org/technologies-clusters/technologies/security/certification-authorities-and-other-certification-service-providers), or [SOC 2 Type II](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2) audited.

Trusting third-party CAs, if done improperly, could result in unintended over-trust, for things such as TLS and code signing. If you choose to trust third-party CAs, make sure they are only trusted for the process of IdP signature validation.

Private CA-issued signing certificates must not extend beyond the signing key's approved usage period. Apply the [same lifetime and rotation policy](#certificate-lifetime) to CA-issued and self-signed signing certificates.

###### Self-Signed

Due to the explicit nature of most SAML security associations, self-signed certificates are ideal for the use case. The contents of the certificate and lifetime are not constrained by the policy or process of the issuing CA, be it public or private. As rotating SAML certificates can be painful and labor intensive, setting the certificate lifetime as long as safely possible is key. Few CAs allow long enough lifetimes, due to their focus on the TLS threat model.

###### Creating a Self-Signed SAML Certificate

If you are using a Hardware Security Module (HSM), follow the vendor's instructions. This process uses openssl. The example uses an overly generic distinguished name. Your Common Name (CN) should be meaningful and specific.

1. Generate a Private Key:
openssl genrsa -out private.key 2048
or
openssl ecparam -genkey -name prime256v1 -out private.pem

2. Create a Configuration File (e.g., cert.cnf):

\[req\]
distinguished_name = req_distinguished_name
x509_extensions = v3_ca
prompt = no

\[req_distinguished_name\]
C = US
ST = California
L = San Francisco
O = MyOrganization
OU = MyUnit
CN = SAML Signing

\[v3_ca\]
basicConstraints = CA:FALSE
keyUsage = digitalSignature
extendedKeyUsage = 1.3.6.1.5.5.7.3.36

3. Generate the Self-Signed Certificate:
openssl req -x509 -new -nodes -key private.key -sha256 -days 365 -out certificate.crt -config cert.cnf -extensions v3_ca

##### Certificate Metadata URLs

Many IdPs publish a metadata URL that contains basic configuration information including the SAML signing certificate. Many SPs can consume the data from the IdP, updating the Signing certificate information in near real-time. Using these options is ideal. This model matches exactly the intent of the [Certificate and Public Key Pinning](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning) when pinning must be used.

The metadata URL should be protected using TLS where the server certificate comes from a WebPKI CA that is widely trusted and matches the guidance in the [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html#certificates).

The ideal state of the IdP to SP relationship is that of using the metadata URLs, regardless of what type of certificate is used. If metadata URLs are not used, great care must be taken to assure that an attacker does not convince an SP to trust the wrong certificate. Avoid emailing certificates. Instead, like the metadata URL, present them over properly configured TLS.

##### Signing Key Protection

SAML Signing keys are a top security asset and [target of attackers](https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/). Great care should be taken when creating the keys and as needed, copying them to nodes of an IdP cluster. File based keys are trivial for an attacker with access to exfiltrate. IdP operators should strongly consider protecting the private keys using a Hardware Security Module (HSM). [HSMs](https://en.wikipedia.org/wiki/Hardware_security_module) allow an application to use a key without it being exportable or copyable. They have mechanisms to safely replicate the keys into a failover HSM, without ever exposing the keys outside of the HSMs. Quality HSMs would be rated [FIPS 140-2](https://csrc.nist.gov/pubs/fips/140-2/upd2/final) or [FIPS 140-3](https://csrc.nist.gov/pubs/fips/140-3/final).

#### Identity Provider (IdP) Considerations

- Validate X.509 Certificate for algorithm compatibility, strength of encryption, export restrictions, and content above
- Validate Strong Authentication options for generating the SAML token
- IDP validation (which IDP mints the token)
- Synchronize to a common Internet timesource
- Define levels of assurance for identity verification
- Prefer asymmetric identifiers for identity assertions over personally identifiable information (e.g. SSNs, etc)
- Sign each individual Assertion or the entire Response element

#### Service Provider (SP) Considerations

- Validating session state for user
- Level of granularity in setting authorization context when consuming SAML token (do you use groups, roles, attributes)
- Ensure each Assertion or the entire Response element is signed
- [Validate Signatures](#validate-signatures)
- Validate if signed by an authorized IdP
- Validate IDP certificates for revocation against CRL/OCSP if they are present
- Validate the `Destination` attribute on `<samlp:Response>` exactly matches the SP's expected Assertion Consumer Service (ACS) URL ([SAML Core 2.0 §3.2.2.1](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf)). Reject responses that are missing `Destination` or where it does not match — this prevents cross-SP assertion replay.
- Validate `<saml:Audience>` matches the SP's EntityID
- Validate NotBefore and NotOnorAfter
- Validate Recipient attribute, `InResponseTo`, and `<saml:SubjectConfirmationData>` (`Recipient`, `NotOnOrAfter`, `InResponseTo`)
- Explicitly verify the signature algorithm is at least RSA-SHA-256 (or stronger). Reject SHA-1-based algorithms (`http://www.w3.org/2000/09/xmldsig#rsa-sha1`, `...#hmac-sha1`) and `<ds:DigestMethod Algorithm="...sha1">`. NIST SP 800-131A Rev. 2 disallows SHA-1 in digital signatures.
- Verify that the XML signature's `<ds:Reference URI>` resolves to the signed Assertion or Response, and that the exact assertion used for authentication is protected by that validated signature. [SAML Core sections 5.3 and 5.4](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf) define signature inheritance and references; [approved errata E93](https://docs.oasis-open.org/security/saml/v2.0/errata05/os/saml-v2.0-errata05-os.html#__RefHeading__10669_188893729) permits Response signatures in the browser SSO profile. Reject assertions outside the validated signed content and follow the [signature-wrapping defenses](#validate-signatures).
- Define criteria for SAML logout
- Exchange assertions only over secure transports like TLS
- Define criteria for session management
- Verify user identities obtained from SAML ticket assertions whenever possible.

### Input Validation

Just because SAML is a security protocol does not mean that input validation goes away.

- Ensure that all SAML providers/consumers do proper [input validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

### Cryptography

Solutions relying cryptographic algorithms need to follow the latest developments in cryptoanalysis.

- Ensure all SAML elements in the chain use [strong encryption](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#algorithms)
- Consider deprecating support for [insecure XMLEnc algorithms](https://www.w3.org/TR/xmlenc-core1/#sec-RSA-1_5)
