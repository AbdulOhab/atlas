---
title: "Authentication and JWT"
order: 9
summary: "Verifying who a user is: login flows, storing passwords safely with hashing, and JSON Web Tokens for stateless auth."
category: "Auth & Security"
level: Intermediate
---

# Authentication and JWT

Authentication proves who a user is; the backend then has to remember it. This module covers login done safely, password hashing, and JWTs as the stateless alternative to sessions.

**Course outline modules:** 12 (JWT - JSON Web Token)

## Authentication

> **Source:** [Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

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

### References

- [NIST SP 800-63B-4: Password Verifiers](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver)
- [OWASP Application Security Verification Standard (ASVS): V6 Authentication](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x15-V6-Authentication.md#v6-authentication)
- [OpenID Connect Core 1.0: ID Token Validation](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation)

## Password storage

> **Source:** [Password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

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

### References

- [NIST SP 800-63B-4: Password Verifiers](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver)
- [RFC 9106: Argon2 Inputs and Outputs](https://datatracker.ietf.org/doc/html/rfc9106#section-3.1)
- [RFC 7914: scrypt Parameters](https://www.rfc-editor.org/rfc/rfc7914.html#section-2)

## JSON Web Tokens

> **Source:** [JSON Web Tokens](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

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

### References

- [RFC 7519: JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519)
- [RFC 8725: JSON Web Token Best Current Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [RFC 7516: JSON Web Encryption](https://datatracker.ietf.org/doc/html/rfc7516)
- [RFC 7517: JSON Web Key](https://datatracker.ietf.org/doc/html/rfc7517)
