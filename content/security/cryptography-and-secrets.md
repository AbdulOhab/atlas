---
title: "Cryptography and Secrets"
order: 7
summary: "Protecting data at rest and in transit: cryptographic storage, key management, secrets, TLS, pinning and post-quantum cryptography."
category: "Security"
level: Intermediate
---

# Cryptography and Secrets

Protecting data at rest and in transit: cryptographic storage, key management, secrets, TLS, pinning and post-quantum cryptography.

## Cryptographic Storage

> **Source:** [Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This article provides a simple model to follow when implementing solutions to protect data at rest.

Passwords should not be stored using reversible encryption - secure password hashing algorithms should be used instead. The [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) contains further guidance on storing passwords.

### Architectural Design

The first step in designing any application is to consider the overall architecture of the system, as this will have a huge impact on the technical implementation.

This process should begin with considering the [threat model](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) of the application (i.e, who you are trying to protect that data against).

The use of dedicated secret or key management systems can provide an additional layer of security protection, as well as making the management of secrets significantly easier - however it comes at the cost of additional complexity and administrative overhead - so may not be feasible for all applications. Note that many cloud environments provide these services, so these should be taken advantage of where possible. The [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) contains further guidance on this topic.

#### Where to Perform Encryption

Encryption can be performed on a number of levels in the application stack, such as:

- At the application level.
- At the database level (e.g, [SQL Server TDE](https://docs.microsoft.com/en-us/sql/relational-databases/security/encryption/transparent-data-encryption?view=sql-server-ver15))
- At the filesystem level (e.g, BitLocker or LUKS)
- At the hardware level (e.g, encrypted RAID cards or SSDs)

Which layer(s) are most appropriate will depend on the threat model. For example, hardware level encryption is effective at protecting against the physical theft of the server, but will provide no protection if an attacker is able to compromise the server remotely.

#### Minimize the Storage of Sensitive Information

The best way to protect sensitive information is to not store it in the first place. Although this applies to all kinds of information, it is most often applicable to credit card details, as they are highly desirable for attackers, and PCI DSS has such stringent requirements for how they must be stored. Wherever possible, the storage of sensitive information should be avoided.

### Algorithms

For symmetric encryption **AES** with a key that's at least **128 bits** (ideally **256 bits**) and a secure [mode](#cipher-modes) should be used as the preferred algorithm.

For public-key encryption, use a maintained library implementing an established hybrid encryption scheme, such as [Hybrid Public Key Encryption (HPKE)](https://www.rfc-editor.org/rfc/rfc9180.html#section-4), which combines key establishment, key derivation, and authenticated symmetric encryption. **[X25519 on Curve25519](https://www.rfc-editor.org/rfc/rfc7748.html#section-6.1)** is a key-agreement primitive; it does not encrypt stored data by itself. Select an appropriate [HPKE authentication mode](https://www.rfc-editor.org/rfc/rfc9180.html#section-5) if sender authentication is required; the base mode does not authenticate the sender.

If **RSA** must be used, ensure that the key is at least **2048 bits**.

#### Post-Quantum Consideration

RSA and ECC-based public-key cryptography (including Curve25519) are not post-quantum secure. A future cryptographically relevant quantum computer could break them, which matters for data that must remain confidential over long periods.

Where post-quantum key establishment is required, use a supported protocol or library integration of a standardized mechanism such as **[ML-KEM (NIST FIPS 203)](https://csrc.nist.gov/pubs/fips/203/final)**, typically in a hybrid construction alongside a classical algorithm during migration. ML-KEM establishes a shared secret for symmetric encryption; it does not replace AES for encrypting stored data. Include the public-key protection of stored encryption keys in the migration plan.

For migration guidance, see the [Post-Quantum Cryptography Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Post_Quantum_Cryptography_Cheat_Sheet.html).

When selecting cryptographic algorithms for a specific use case, consider:

- Key size.
- Known attacks and weaknesses of the algorithm.
- Maturity of the algorithm.
- Approval by third parties such as [NIST's algorithmic validation program](https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program).
- Performance (both for encryption and decryption).
- Quality of the libraries available.
- Portability of the algorithm (i.e, how widely supported is it).

In some cases there may be regulatory requirements that limit the algorithms that can be used, such as [FIPS 140-3](https://csrc.nist.gov/pubs/fips/140-3/final) or [PCI DSS](https://www.pcisecuritystandards.org/pci_security/glossary#Strong%20Cryptography).

#### Custom Algorithms

Don't do this.

#### Cipher Modes

There are various [modes](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation) that can be used to allow block ciphers (such as AES) to encrypt arbitrary amounts of data, in the same way that a stream cipher would. These modes have different security and performance characteristics, and a full discussion of them is outside the scope of this cheat sheet. Some of the modes have requirements to generate secure initialization vectors (IVs) and other attributes, but these should be handled automatically by the library.

Where available, authenticated modes should always be used. These provide guarantees of the integrity and authenticity of the data, as well as confidentiality. The most commonly used authenticated modes are **[GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode)** and **[CCM](https://en.wikipedia.org/wiki/CCM_mode)**, which should be used as a first preference.

If GCM or CCM are not available, then [CTR](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Counter_%28CTR%29) mode or [CBC](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_%28CBC%29) mode should be used. As these do not provide any guarantees about the authenticity of the data, separate authentication should be implemented, such as using the [Encrypt-then-MAC](https://en.wikipedia.org/wiki/Authenticated_encryption#Encrypt-then-MAC_%28EtM%29) technique. Care needs to be taken when using this method with [variable length messages](https://en.wikipedia.org/wiki/CBC-MAC#Security_with_fixed_and_variable-length_messages)

[ECB](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#ECB) should not be used outside of very specific circumstances.

#### Random Padding

For RSA encryption, use a maintained library's RSAES-OAEP (Optimal Asymmetric Encryption Padding) implementation, as specified in [RFC 8017, Section 7.1](https://www.rfc-editor.org/rfc/rfc8017.html#section-7.1). OAEP uses randomized encoding and mask generation functions; simply prepending random bytes to the message is not a substitute. Do not use RSA without an encryption padding scheme.

#### Secure Random Number Generation

Random numbers (or strings) are needed for various security critical functionality, such as generating encryption keys, IVs, session IDs, CSRF tokens or password reset tokens. As such, it is important that these are generated securely, and that it is not possible for an attacker to guess and predict them.

It is generally not possible for computers to generate truly random numbers (without special hardware), so most systems and languages provide two different types of randomness.

Pseudo-Random Number Generators (PRNG) provide low-quality randomness that are much faster, and can be used for non-security related functionality (such as ordering results on a page, or randomizing UI elements). However, they **must not** be used for anything security critical, as it is often possible for attackers to guess or predict the output.

Cryptographically Secure Pseudo-Random Number Generators (CSPRNG) are designed to produce a much higher quality of randomness (more strictly, a greater amount of entropy), making them safe to use for security-sensitive functionality. However, they are slower and more CPU intensive, can end up blocking in some circumstances when large amounts of random data are requested. As such, if large amounts of non-security related randomness are needed, they may not be appropriate.

The table below shows the recommended algorithms for each language, as well as insecure functions that should not be used.

| Language    | Unsafe Functions                                                                                                                   | Cryptographically Secure Functions                                                                                                                                                                                                                                                                                                                                         |
|-------------|------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| C           | `random()`, `rand()`                                                                                                               | [getrandom(2)](http://man7.org/linux/man-pages/man2/getrandom.2.html) |
| Java        | `Math.random()`, `StrictMath.random()`, `java.util.Random`, `java.util.SplittableRandom`, `java.util.concurrent.ThreadLocalRandom` | [java.security.SecureRandom](https://docs.oracle.com/javase/8/docs/api/java/security/SecureRandom.html), [java.util.UUID.randomUUID()](https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html#randomUUID--) |
| PHP         | `array_rand()`, `lcg_value()`, `mt_rand()`, `rand()`, `uniqid()`                                                                   | [Random\Engine\Secure](https://www.php.net/manual/en/class.random-engine-secure.php) in PHP 8.2, [random_bytes()](https://www.php.net/manual/en/function.random-bytes.php), [random_int()](https://www.php.net/manual/en/function.random-int.php) in PHP 7, [openssl_random_pseudo_bytes()](https://www.php.net/manual/en/function.openssl-random-pseudo-bytes.php) in PHP 5 |
| .NET/C#     | `Random()`                                                                                                                         | [RandomNumberGenerator](https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.randomnumbergenerator?view=net-6.0) |
| Objective-C | Subclasses of `GKRandomSource`, `rand()`, `random()` | [SecRandomCopyBytes](https://developer.apple.com/documentation/security/1399291-secrandomcopybytes?language=objc), [the `arc4random` family on current Apple platforms](https://github.com/apple-oss-distributions/Libc/blob/71bbe350ab79eef58113991d817ccc6165061a64/gen/FreeBSD/arc4random.3) |
| Python      | `random()`                                                                                                                         | [secrets()](https://docs.python.org/3/library/secrets.html#module-secrets) |
| Ruby        | `rand()`, `Random`                                                                                                                 | [SecureRandom](https://ruby-doc.org/stdlib-2.5.1/libdoc/securerandom/rdoc/SecureRandom.html) |
| Go          | `rand` using `math/rand` package                                                                                                   | [crypto.rand](https://golang.org/pkg/crypto/rand/) package |
| Rust        | `rand::prng::XorShiftRng`                                                                                                          | [rand::prng::chacha::ChaChaRng](https://docs.rs/rand/0.5.0/rand/prng/chacha/struct.ChaChaRng.html) and the rest of the Rust library [CSPRNGs.](https://docs.rs/rand/0.5.0/rand/prng/index.html#cryptographically-secure-pseudo-random-number-generators-csprngs) |
| Node.js     | `Math.random()`                                                                                                                    | [crypto.randomBytes()](https://nodejs.org/api/crypto.html#cryptorandombytessize-callback), [crypto.randomInt()](https://nodejs.org/api/crypto.html#cryptorandomintmin-max-callback), [crypto.randomUUID()](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions) |

##### UUIDs and GUIDs

Universally unique identifiers (UUIDs or GUIDs) are sometimes used as a quick way to generate random strings. Although they can provide a reasonable source of randomness, this will depend on the [type or version](https://en.wikipedia.org/wiki/Universally_unique_identifier#Versions) of the UUID that is created.

Specifically, version 1 UUIDs are comprised of a high precision timestamp and the MAC address of the system that generated them, so are **not random** (although they may be hard to guess, given the timestamp is to the nearest 100ns). Type 4 UUIDs are randomly generated, although whether this is done using a CSPRNG will depend on the implementation. Unless this is known to be secure in the specific language or framework, the randomness of UUIDs should not be relied upon.

#### Defense in Depth

Applications should be designed to still be secure even if cryptographic controls fail. Any information that is stored in an encrypted form should also be protected by additional layers of security. Application should also not rely on the security of encrypted URL parameters, and should enforce strong access control to prevent unauthorized access to information.

### Key Management

#### Processes

Formal processes should be implemented (and tested) to cover all aspects of key management, including:

- Generating and storing new keys.
- Distributing keys to the required parties.
- Deploying keys to application servers.
- Rotating and decommissioning old keys

#### Key Generation

Keys should be randomly generated using a cryptographically secure function, such as those discussed in the [Secure Random Number Generation](#secure-random-number-generation) section. Keys **should not** be based on common words or phrases, or on "random" characters generated by mashing the keyboard.

Where multiple keys are used (such as data separate data-encrypting and key-encrypting keys), they should be fully independent from each other.

#### Key Lifetimes and Rotation

Encryption keys should be changed (or rotated) based on a number of different criteria:

- If the previous key is known (or suspected) to have been compromised.
    - This could also be caused by a someone who had access to the key leaving the organization.
- After a specified period of time has elapsed (known as the cryptoperiod).
    - There are many factors that could affect what an appropriate cryptoperiod is, including the size of the key, the sensitivity of the data, and the threat model of the system. See section 5.3 of [NIST SP 800-57 Part 1 Rev. 5](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final) for further guidance.
- Before reaching the usage limits of the selected encryption mode.
    - Enforce the mode's limits on message size, encryption operations, and initialization vector (IV) uniqueness across all instances sharing the key. Block size alone does not determine a safe data-volume limit. For example, AES-GCM has separate requirements for input lengths and IV construction in [NIST SP 800-38D, Sections 5.2.1.1 and 8](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf). See [Key Management: Cryptoperiods and Rotation](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html#cryptoperiods-and-rotation) for usage-based rotation guidance.
- If there is a significant change to the security provided by the algorithm (such as a new attack being announced).

Once one of these criteria have been met, a new key should be generated and used for encrypting any new data. There are two main approaches for how existing data that was encrypted with the old key(s) should be handled:

1. Decrypting it and re-encrypting it with the new key.
2. Marking each item with the ID of the key that was used to encrypt it, and storing multiple keys to allow the old data to be decrypted.

The first option should generally be preferred, as it greatly simplifies both the application code and key management processes; however, it may not always be feasible. Note that old keys should generally be stored for a certain period after they have been retired, in case old backups of copies of the data need to be decrypted.

It is important that the code and processes required to rotate a key are in place **before** they are required, so that keys can be quickly rotated in the event of a compromise. Additionally, processes should also be implemented to allow the encryption algorithm or library to be changed, in case a new vulnerability is found in the algorithm or implementation.

### Key Storage

Securely storing cryptographic keys is one of the hardest problems to solve, as the application always needs to have some level of access to the keys in order to decrypt the data. While it may not be possible to fully protect the keys from an attacker who has fully compromised the application, a number of steps can be taken to make it harder for them to obtain the keys.

Where available, the secure storage mechanisms provided by the operating system, framework or cloud service provider should be used. These include:

- A physical Hardware Security Module (HSM).
- A virtual HSM.
- Key vaults such as [Amazon KMS](https://aws.amazon.com/kms/) or [Azure Key Vault](https://azure.microsoft.com/en-gb/services/key-vault/).
- An external secrets management service such as [Conjur](https://github.com/cyberark/conjur) or [HashiCorp Vault](https://github.com/hashicorp/vault).
- Secure storage APIs provided by the [ProtectedData](https://docs.microsoft.com/en-us/dotnet/api/system.security.cryptography.protecteddata?redirectedfrom=MSDN&view=netframework-4.8) class in the .NET framework.

There are many advantages to using these types of secure storage over simply putting keys in configuration files. The specifics of these will vary depending on the solution used, but they include:

- Central management of keys, especially in containerised environments.
- Easy key rotation and replacement.
- Secure key generation.
- Simplifying compliance with regulatory standards such as FIPS 140 or PCI DSS.
- Making it harder for an attacker to export or steal keys.

In some cases none of these will be available, such as in a shared hosting environment, meaning that it is not possible to obtain a high degree of protection for any encryption keys. However, the following basic rules can still be followed:

- Do not hard-code keys into the application source code.
- Do not check keys into version control systems.
- Protect the configuration files containing the keys with restrictive permissions.
- Avoid storing keys in environment variables, as these can be accidentally exposed through functions such as [phpinfo()](https://www.php.net/manual/en/function.phpinfo.php) or through the `/proc/self/environ` file.

The [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) provides more details on securely storing secrets.

#### Separation of Keys and Data

Where possible, encryption keys should be stored in a separate location from encrypted data. For example, if the data is stored in a database, the keys should be stored in the filesystem. This means that if an attacker only has access to one of these (for example through directory traversal or SQL injection), they cannot access both the keys and the data.

Depending on the architecture of the environment, it may be possible to store the keys and data on separate systems, which would provide a greater degree of isolation.

#### Encrypting Stored Keys

Where possible, encryption keys should themselves be stored in an encrypted form. At least two separate keys are required for this:

- The Data Encryption Key (DEK) is used to encrypt the data.
- The Key Encryption Key (KEK) is used to encrypt the DEK.

For this to be effective, the KEK must be stored separately from the DEK. The encrypted DEK can be stored with the data, but will only be usable if an attacker is able to also obtain the KEK, which is stored on another system.

The KEK should also be at least as strong as the DEK. The [envelope encryption](https://cloud.google.com/kms/docs/envelope-encryption) guidance from Google contains further details on how to manage DEKs and KEKs.

In simpler application architectures (such as shared hosting environments) where the KEK and DEK cannot be stored separately, there is limited value to this approach, as an attacker is likely to be able to obtain both of the keys at the same time. However, it can provide an additional barrier to unskilled attackers.

A key derivation function (KDF) could be used to generate a KEK from user-supplied input (such a passphrase), which would then be used to encrypt a randomly generated DEK. This allows the KEK to be easily changed (when the user changes their passphrase), without needing to re-encrypt the data (as the DEK remains the same).

## Key Management

> **Source:** [Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This Key Management Cheat Sheet provides developers with guidance for implementation of cryptographic key management within an application in a secure manner. It is important to document and harmonize rules and practices for:

1. Key life cycle management (generation, distribution, destruction)
2. Key compromise, recovery and zeroization
3. Key storage
4. Key agreement

### General Guidelines and Considerations

Formulate a plan for the overall organization's cryptographic strategy to guide developers working on different applications and ensure that each application's cryptographic capability meets minimum requirements and best practices.

Identify the cryptographic and key management requirements for your application and map all components that process or store cryptographic key material.

### Key Selection

Selection of the cryptographic and key management algorithms to use within a given application should begin with an understanding of the objectives of the application.

For example, if the application is required to store data securely, then the developer should select an algorithm suite that supports the objective of data at rest protection security. Applications that are required to transmit and receive data would select an algorithm suite that supports the objective of data in transit protection.

We have provided recommendations on the selection of crypto suites within an application based on application and security objectives. Application developers oftentimes begin the development of crypto and key management capabilities by examining what is available in a library.

However, an analysis of the real needs of the application should be conducted to determine the optimal key management approach. Begin by understanding the security objectives of the application which will then drive the selection of cryptographic protocols that are best suited. For example, the application may require:

1. Confidentiality of data at rest and confidentiality of data in transit.
2. Authenticity of the end device.
3. Authenticity of data origin.
4. Integrity of data in transit.
5. Keys to create the data encryption keys.

Once the understanding of the security needs of the application is achieved, developers can determine what protocols and algorithms are required. Once the protocols and algorithms are understood, you can begin to define the different types of keys that will support the application's objectives.

There are a diverse set of key types and certificates to consider, for example:

1. **Encryption:** [Symmetric](https://en.wikipedia.org/wiki/Symmetric-key_algorithm) encryption keys, [Asymmetric](https://en.wikipedia.org/wiki/Public-key_cryptography) encryption keys (public and private).
2. **Authentication of End Devices:** Pre-shared symmetric keys, Trusted certificates, Trust Anchors.
3. **Data Origin Authentication:** [HMAC](https://en.wikipedia.org/wiki/HMAC).
4. **Integrity Protection:** [Message Authentication Codes](https://en.wikipedia.org/wiki/Message_authentication_code) (MACs).
5. **Key Encryption Keys**.

#### Algorithms and Protocols

According to `NIST SP 800-57 Part 1`, many algorithms and schemes that provide a security service use a [hash function](https://en.wikipedia.org/wiki/Hash_function) as a component of the algorithm.

Hash functions can be found in digital signature algorithms (`FIPS186`), Keyed-Hash Message Authentication Codes (HMAC) (`FIPS198`), key-derivation functions/methods (`NIST Special Publications (SP) 800-56A, 800-56B, 800-56C and 800-108`), and random number generators (`NIST SP 800-90A`). Approved hash functions are defined in `FIPS180`.

`NIST SP 800-57 Part 1` recognizes three basic classes of approved cryptographic algorithms: hash functions, symmetric- key algorithms and asymmetric-key algorithms. The classes are defined by the number of cryptographic keys that are used in conjunction with the algorithm.

The NSA released a report, [Commercial National Security Algorithm Suite 2.0](https://media.defense.gov/2025/May/30/2003728741/-1/-1/0/CSA_CNSA_2.0_ALGORITHMS.PDF) which lists the cryptographic algorithms that are expected to remain strong even with advances in quantum computing.

##### Cryptographic hash functions

Cryptographic hash functions do not require keys. Hash functions generate a relatively small digest (hash value) from a (possibly) large input in a way that is fundamentally difficult to reverse (i.e., it is hard to find an input that will produce a given output). Hash functions are used as building blocks for key management, for example,

1. To provide data authentication and integrity services (Section 4.2.3) – the hash function is used with a key to generate a message authentication code.
2. To compress messages for digital signature generation and verification (Section 4.2.4).
3. To derive keys in key-establishment algorithms (Section 4.2.5).
4. To generate deterministic random numbers (Section 4.2.7).

##### Symmetric-key algorithms

Symmetric-key algorithms (sometimes known as secret-key algorithms) transform data in a way that is fundamentally difficult to undo without knowledge of a secret key. The key is "symmetric" because the same key is used for a cryptographic operation and its inverse (e.g., encryption and decryption).

Symmetric keys are often known by more than one entity; however, the key shall not be disclosed to entities that are not authorized access to the data protected by that algorithm and key. Symmetric key algorithms are used, for example,

1. To provide data confidentiality (Section 4.2.2); the same key is used to encrypt and decrypt data.
2. To provide authentication and integrity services (Section 4.2.3) in the form of Message Authentication Codes (MACs); the same key is used to generate the MAC and to validate it. MACs normally employ either a symmetric key-encryption algorithm or a cryptographic hash function as their cryptographic primitive.
3. As part of the key-establishment process (Section 4.2.5).
4. To generate deterministic random numbers (Section 4.2.7).

##### Asymmetric-key algorithms

Asymmetric-key algorithms, commonly known as public-key algorithms, use two related keys (i.e., a key pair) to perform their functions: a public key and a private key. The public key may be known by anyone; the private key should be under the sole control of the entity that "owns" the key pair. Even though the public and private keys of a key pair are related, knowledge of the public key does not reveal the private key. Asymmetric algorithms are used, for example,

1. To compute digital signatures (Section 4.2.4).
2. To establish cryptographic keying material (Section 4.2.5).
3. To generate random numbers (Section 4.2.7).

##### Message Authentication Codes (MACs)

Message Authentication Codes (MACs) provide data authentication and integrity. A MAC is a cryptographic checksum on the data that is used in order to provide assurance that the data has not changed and that the MAC was computed by the expected entity.

Although message integrity is often provided using non-cryptographic techniques known as error detection codes, these codes can be altered by an adversary to effect an action to the adversary's benefit. The use of an approved cryptographic mechanism, such as a MAC, can alleviate this problem.

In addition, the MAC can provide a recipient with assurance that the originator of the data is a key holder (i.e., an entity authorized to have the key). MACs are often used to authenticate the originator to the recipient when only those two parties share the MAC key.

##### Digital Signatures

[Digital signatures](https://en.wikipedia.org/wiki/Digital_signature) are used to provide authentication, integrity and [non-repudiation](https://en.wikipedia.org/wiki/Non-repudiation). Digital signatures are used in conjunction with hash functions and are computed on data of any length (up to a limit that is determined by the hash function).

`FIPS186` specifies algorithms that are approved for the computation of digital signatures.

##### Key Encryption Keys

Symmetric key-wrapping keys are used to encrypt other keys using symmetric-key algorithms. Key-wrapping keys are also known as key encrypting keys.

#### Key Strength

Review `NIST SP 800-57` (Recommendation for Key Management) for recommended guidelines on key strength for specific algorithm implementations. Also, consider these best practices:

1. Establish what the application's minimum computational resistance to attack should be. Understanding the minimum computational resistance to attack should take into consideration the sophistication of your adversaries, how long data needs to be protected, where data is stored and if it is exposed. Identifying the computational resistance to attack will inform engineers as to the minimum length of the cryptographic key required to protect data over the life of that data. Consult `NIST SP 800-131a` for additional guidance on determining the appropriate key lengths for the algorithm of choice.
2. When encrypting keys for storage or distribution, always encrypt a cryptographic key with another key of equal or greater cryptographic strength.
3. When moving to [Elliptic Curve-based algorithms](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography), choose a key length that meets or exceeds the comparative strength of other algorithms in use within your system. Refer to `NIST SP 800-57 Table 2`.
4. Formulate a strategy for the overall organization's cryptographic strategy to guide developers working on different applications and ensure that each application's cryptographic capability meets minimum requirements and best practices.

#### Memory Management Considerations

Keys stored in memory for a long time can become "burned in". This can be mitigated by splitting the key into components that are frequently updated. `NIST SP 800-57`).

Loss or corruption of the memory media on which keys and/or certificates are stored, and recovery planning, according to `NIST SP 800-57`.

Plan for the recovery from possible corruption of the memory media necessary for key or certificate generation, registration, and/or distribution systems, subsystems, or components as recommended in `NIST SP 800-57`.

#### Perfect Forward Secrecy

[Ephemeral keys](https://en.wikipedia.org/wiki/Ephemeral_key) can provide perfect forward secrecy protection, which means a compromise of the server's long term signing key does not compromise the confidentiality of past sessions. Refer to [TLS cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html).

#### Key Usage

According to NIST, in general, a single key should be used for only one purpose (e.g., encryption, authentication, key wrapping, random number generation, or digital signatures).

There are several reasons for this:

1. The use of the same key for two different cryptographic processes may weaken the security provided by one or both of the processes.
2. Limiting the use of a key limits the damage that could be done if the key is compromised.
3. Some uses of keys interfere with each other. For example, the length of time the key may be required for each use and purpose. Retention requirements of the data may differ for different data types.

#### Cryptographic Module Topics

According to `NIST SP 800-133`, cryptographic modules are the set of hardware, software, and/or firmware that implements security functions (including cryptographic algorithms and key generation) and is contained within a cryptographic module boundary to provide protection of the keys.

All cryptographic operations (such as key generation, encryption, decryption, and digital signing) should be performed inside the isolated cryptographic security module boundary so that plaintext key material is never exposed outside the module ([OWASP Application Security Verification Standard (ASVS) 5.0 §13.3.3](https://github.com/OWASP/ASVS/blob/v5.0.0_release/5.0/en/0x22-V13-Configuration.md#v133-secret-management)). For higher-assurance deployments (such as OWASP ASVS 5.0 Level 3), applications should use hardware-backed modules, such as a [Hardware Security Module](https://en.wikipedia.org/wiki/Hardware_security_module) (HSM) or Trusted Platform Module (TPM), to significantly reduce the risk of key extraction or compromise in software memory.

### Key Management Lifecycle Best Practices

#### Generation

Cryptographic keys shall be generated within cryptographic module with at least a `FIPS 140-2 or 140-3` compliance. For explanatory purposes, consider the cryptographic module in which a key is generated to be the key-generating module.

Any random value required by the key-generating module shall be generated within that module; that is, the Random Bit Generator that generates the random value shall be implemented within cryptographic module with at least a `FIPS 140-2 or 140-3` compliance that generates the key.

Hardware cryptographic modules are preferred over software cryptographic modules for protection.

#### Distribution

The generated keys shall be transported (when necessary) using secure channels and shall be used by their associated cryptographic algorithm within at least a `FIPS 140-2 or 140-3` compliant cryptographic modules. For additional detail for the recommendations in this section refer to `NIST Special Paper 800-133`.

#### Storage

1. Cryptographic keys, secrets, and API keys should **never** be committed to source code repositories or embedded in build artifacts (such as binaries, container images, or configuration files). Secrets and keys should be stored in a dedicated secrets-management solution or key vault ([OWASP ASVS 5.0 §13.3.1](https://github.com/OWASP/ASVS/blob/v5.0.0_release/5.0/en/0x22-V13-Configuration.md#v133-secret-management)).
2. Developers must understand where cryptographic keys are stored within the application. Understand what memory devices the keys are stored on.
3. Keys must be protected on both volatile and persistent memory, ideally processed within secure cryptographic modules.
4. Keys should never be stored in plaintext format.
5. Ensure all keys are stored in a cryptographic vault, such as a [hardware security module](https://en.wikipedia.org/wiki/Hardware_security_module) (HSM) or isolated cryptographic service.
6. If you are planning on storing keys in offline devices/databases, then encrypt the keys using Key Encryption Keys (KEKs) prior to the export of the key material. KEK length (and algorithm) should be equivalent to or greater in strength than the keys being protected.
7. Ensure that keys have integrity protections applied while in storage (consider dual purpose algorithms that support encryption and Message Code Authentication (MAC)).
8. Ensure that standard application level code never reads or uses raw cryptographic keys in any way and use key management libraries.
9. Ensure that keys and cryptographic operations are done inside the sealed vault.
10. All work should be done in the vault (such as key access, encryption, decryption, signing, etc).

For a more complete guide to storing sensitive information such as keys, see the [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

#### Cryptoperiods and Rotation

A cryptoperiod is the time span during which a specific cryptographic key is authorized for use. Limiting cryptoperiods restricts the amount of data protected by a single key and reduces the window of exposure if a key is compromised ([NIST SP 800-57 Part 1 Rev. 5](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final) Section 5.3). For storage-level rotation fundamentals and criteria, see the [Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#key-lifetimes-and-rotation).

Representative cryptoperiods vary depending on the algorithm, key strength, operational environment, threat model, and sensitivity of the protected data. Organizations should define cryptoperiods through risk assessment in accordance with NIST SP 800-57 Part 1 Rev. 5.

- **Rotation Schedule**: Establish and document a key rotation schedule based on the system's threat model and risk assessment ([OWASP ASVS 5.0 §13.1.4](https://github.com/OWASP/ASVS/blob/v5.0.0_release/5.0/en/0x22-V13-Configuration.md#v131-configuration-documentation), [§13.3.4](https://github.com/OWASP/ASVS/blob/v5.0.0_release/5.0/en/0x22-V13-Configuration.md#v133-secret-management)).
- **Representative Cryptoperiod Examples**:
    - **Symmetric Data Encryption Keys**: Originator usage (encrypting new data) should be capped at up to 2 years for general low-volume applications, or on the order of a day or a week for high-volume or link-encryption systems ([NIST SP 800-57 Part 1 Rev. 5](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final) §5.3.6, item 6(b)). Recipient usage (decryption) should typically be limited to no more than 3 years beyond the originator usage period.
    - **TLS/HTTPS Server Keys and Certificates**: Plan certificate renewal around the validity limits in the [CA/Browser Forum Baseline Requirements §6.3.2](https://cabforum.org/working-groups/server/baseline-requirements/documents/CA-Browser-Forum-TLS-BR-2.3.0.pdf). Set key-replacement schedules separately; renewing a certificate does not necessarily replace its key pair.
    - **Asymmetric Key Pairs**: Operational cryptoperiods depend on key usage ([NIST SP 800-57 Part 1 Rev. 5](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final) Table 1 & §5.3.6):
        - **Digital Signature Keys**: Private signing keys typically have an originator cryptoperiod of 1 to 3 years; public signature verification keys may be retained longer to verify archived signed data.
        - **Key Establishment Keys**: Static key-agreement pairs typically have an originator cryptoperiod of up to 1 to 2 years; ephemeral pairs are used for a single key-agreement transaction.
- **Usage-Based Rotation Limits**: Key rotation must account for usage volume in addition to calendar time. For example, when using Advanced Encryption Standard in Galois/Counter Mode (AES-GCM) with random 96-bit initialization vectors (IVs), limit each key to at most `2^32` (4,294,967,296) encryption operations across all devices sharing that key to limit IV-collision risk ([NIST SP 800-38D §8.3](https://csrc.nist.gov/pubs/sp/800/38/d/final)).
- **Handling Existing Encrypted Data (Envelope Encryption)**: To retire a Key Encryption Key (KEK), re-wrap stored Data Encryption Keys (DEKs) under the replacement KEK before destroying the old one. Rewrapping leaves the DEKs unchanged and does not reset their cryptoperiods or usage limits. Replacing a DEK for existing ciphertext requires re-encrypting that data. Managed services may retain old wrapping-key versions automatically; check the provider's [rotation behavior](https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html). For key IDs and data-migration choices, see the [Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#key-lifetimes-and-rotation).
- **Automated Rotation**: Prefer automated key rotation using Key Management Services (KMS) or automated certificate management protocols (such as Automated Certificate Management Environment (ACME)) to reduce operational error and ensure timely updates.
- **Manual Rotation Logging**: When manual key rotation is required, rotation events should be logged with the timestamp, operator identity, and management authorization reference.

#### Escrow and Backup

Data that has been encrypted with lost cryptographic keys will never be recovered. Therefore, it is essential that the application incorporate a secure key backup capability, especially for applications that support data at rest encryption for long-term data stores.

When backing up keys, ensure that the database that is used to store the keys is encrypted using at least a `FIPS 140-2 or 140-3` validated module. It is sometimes useful to escrow key material for use in investigations and for re-provisioning of key material to users in the event that the key is lost or corrupted.

Never escrow keys used for performing digital signatures, but consider the need to escrow keys that support encryption. Oftentimes, escrow can be performed by the [Certificate Authority](https://en.wikipedia.org/wiki/Certificate_authority) (CA) or key management system that provisions certificates and keys, however in some instances separate APIs must be implemented to allow the system to perform the escrow for the application.

#### Accountability and Audit

Accountability involves the identification of those that have access to, or control of, cryptographic keys throughout their lifecycles. Accountability can be an effective tool to help prevent key compromises and to reduce the impact of compromises once they are detected.

Enforce the principle of least privilege for all key and secret assets ([OWASP ASVS 5.0 §13.3.2](https://github.com/OWASP/ASVS/blob/v5.0.0_release/5.0/en/0x22-V13-Configuration.md#v133-secret-management)). Access to cryptographic keys, key management interfaces, and secret material should be restricted strictly to authorized roles, services, and workloads with a verified operational need.

Although it is preferred that no humans are able to view keys, as a minimum, the key management system should account for all individuals who are able to view plaintext cryptographic keys.

In addition, more sophisticated key-management systems may account for all individuals authorized to access or control any cryptographic keys, whether in plaintext or ciphertext form.

Accountability provides three significant advantages:

1. It aids in the determination of when the compromise could have occurred and what individuals could have been involved.
2. It tends to protect against compromise, because individuals with access to the key know that their access to the key is known.
3. It is very useful in recovering from a detected key compromise to know where the key was used and what data or other keys were protected by the compromised key.

Certain principles have been found to be useful in enforcing the accountability of cryptographic keys. These principles might not apply to all systems or all types of keys.

Some of the principles that apply to long-term keys controlled by humans include:

1. Uniquely identifying keys.
2. Identifying the key user.
3. Identifying the dates and times of key use, along with the data that is protected.
4. Identifying other keys that are protected by a symmetric or private key.

Two types of audit should be performed on key management systems:

1. The security plan and the procedures that are developed to support the plan should be periodically audited to ensure that they continue to support the Key Management Policy (`NIST SP 800-57 Part 2`).
2. The protective mechanisms employed should be periodically reassessed with respect to the level of security that they provide and are expected to provide in the future, and that the mechanisms correctly and effectively support the appropriate policies.

New technology developments and attacks should be taken into consideration. On a more frequent basis, the actions of the humans that use, operate and maintain the system should be reviewed to verify that the humans continue to follow established security procedures.

Strong cryptographic systems can be compromised by lax and inappropriate human actions. Highly unusual events should be noted and reviewed as possible indicators of attempted attacks on the system.

#### Key Compromise and Recovery

The compromise of a key has the following implications:

1. In general, the unauthorized disclosure of a key used to provide confidentiality protection (i.e., via encryption) means that all information encrypted by that key could be exposed or known by unauthorized entities. The disclosure of a Certificate of Authorities's private signature key means that an adversary can create fraudulent certificates and Certificate Revocation Lists (CRLs).
2. A compromise of the integrity of a key means that the key is incorrect - either that the key has been modified (either deliberately or accidentally), or that another key has been substituted; this includes a deletion (non-availability) of the key. The substitution or modification of a key used to provide integrity calls into question the integrity of all information protected by the key. This information could have been provided by, or changed by, an unauthorized entity that knows the key. The substitution of a public or secret key that will be used (at a later time) to encrypt data could allow an unauthorized entity (who knows the decryption key) to decrypt data that was encrypted using the encryption key.
3. A compromise of a key's usage or application association means that the key could be used for the wrong purpose (e.g., for key establishment instead of digital signatures) or for the wrong application, and could result in the compromise of information protected by the key.
4. A compromise of a key's association with the owner or other entity means that the identity of the other entity cannot be assured (i.e., one does not know who the other entity really is) or that information cannot be processed correctly (e.g., decrypted with the correct key).
5. A compromise of a key's association with other information means that there is no association at all, or the association is with the wrong "information". This could cause the cryptographic services to fail, information to be lost, or the security of the information to be compromised. Certain protective measures may be taken in order to minimize the likelihood or consequences of a key compromise. Similar effect as ransomware, except that you can't pay the ransom and get the key back.

The following procedures are usually involved:

1. Limiting the amount of time a symmetric or private key is in plaintext form.
2. Preventing humans from viewing plaintext symmetric and private keys.
3. Restricting plaintext symmetric and private keys to physically protected containers. This includes key generators, key-transport devices, key loaders, cryptographic modules, and key-storage devices.
4. Using integrity checks to ensure that the integrity of a key or its association with other data has not been compromised. For example, keys may be wrapped (i.e., encrypted) in such a manner that unauthorized modifications to the wrapping or to the associations will be detected.
5. Employing key confirmation (see NIST SP 800-57 Part 1 Section 4.2.5.5) to help ensure that the proper key was, in fact, established.
6. Establishing an accountability system that keeps track of each access to symmetric and private keys in plaintext form.
7. Providing a cryptographic integrity check on the key (e.g., using a MAC or a digital signature).
8. The use of trusted timestamps for signed data. i. Destroying keys as soon as they are no longer needed.
9. Creating a compromise-recovery plan, especially in the case of a CA compromise.

A compromise-recovery plan is essential for restoring cryptographic security services in the event of a key compromise. A compromise-recovery plan shall be documented and easily accessible.

The compromise-recovery plan should contain:

1. The identification and contact info of the personnel to notify.
2. The identification and contact info of the personnel to perform the recovery actions.
3. The re-key method.
4. An inventory of all cryptographic keys and their use (e.g., the location of all certificates in a system).
5. The education of all appropriate personnel on the recovery procedures.
6. An identification and contact info of all personnel needed to support the recovery procedures.
7. Policies that key-revocation checking be enforced (to minimize the effect of a compromise).
8. The monitoring of the re-keying operations (to ensure that all required operations are performed for all affected keys).
9. Any other recovery procedures, which may include:
    1. Physical inspection of the equipment.
    2. Identification of all information that may be compromised as a result of the incident.
    3. Identification of all signatures that may be invalid, due to the compromise of a signing key.
    4. Distribution of new keying material, if required.

#### Zeroization and Destruction

Destruction is the final state in the cryptographic key lifecycle. Key management policies should account for the lifecycle key states described in [NIST SP 800-57 Part 1 Rev. 5](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final) Section 7 (such as pre-activation, active, suspended, deactivated, compromised, and destroyed).

Revoke compromised keys promptly and stop using them to protect new data. Retain only tightly controlled access needed for recovery or migration of previously protected data. Destroy all copies of secret and private keys, including backup, archived, escrowed, and memory copies, as soon as they are no longer needed for decryption or recovery and retention requirements are satisfied. Public verification keys may be retained to verify archived signatures ([NIST SP 800-57 Part 1 Rev. 5](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final) Sections 7.5 and 8.3.4–8.3.5).

- **Cryptographic Erasure**: For encrypted key material at rest, consider cryptographic erasure only when all copies of the protecting keys can be destroyed and no recoverable plaintext copies of the target material remain ([NIST SP 800-88 Rev. 2](https://csrc.nist.gov/pubs/sp/800/88/r2/final) Section 3.2). Destroying a wrapping key does not erase plaintext copies of the keys it protected.
- **Software Memory**: Overwriting key material is best-effort in managed runtimes, where copies can survive in garbage-collected memory, immutable strings, or swapped-out pages. Use platform secure-memory or zeroization APIs where available; see [Protecting Secrets in Memory](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html#25-handling-secrets-in-memory).
- **Hardware Security Modules (HSMs)**: Use vendor-supplied zeroize or destroy commands to zeroize key material stored in volatile memory and non-volatile HSM storage.
- **Physical Media**: Physically destroy obsolete storage media or cryptographic tokens containing key material in accordance with organizational sanitization standards.

### Trust Stores

1. Design controls to secure the trust store against injection of third-party root certificates. The access controls are managed and enforced on an entity and application basis.
2. Implement integrity controls on objects stored in the trust store.
3. Do not allow for export of keys held within the trust store without authentication and authorization.
4. Setup strict policies and procedures for exporting key material from applications to network applications and other components.
5. Implement a secure process for updating the trust store.

### Cryptographic Key Management Libraries

Use only reputable crypto libraries that are well maintained and updated, as well as tested and validated by third-party organizations (e.g., `NIST`/`FIPS`).

## Secrets Management

> **Source:** [Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### 1 Introduction

Secrets are being used everywhere nowadays, especially with the popularity of the DevOps movement. Application Programming Interface (API) keys, database credentials, Identity and Access Management (IAM) permissions, Secure Shell (SSH) keys, certificates, etc. Many organizations have them hardcoded within the source code in plaintext, littered throughout configuration files and configuration management tools.

There is a growing need for organizations to centralize the storage, provisioning, auditing, rotation and management of secrets to control access to secrets and prevent them from leaking and compromising the organization. Often, services share the same secrets, which makes identifying the source of compromise or leak challenging.

This cheat sheet offers best practices and guidelines to help properly implement secrets management.

### 2 General Secrets Management

The following sections address the main concepts relating to secrets management.

#### 2.1 High Availability

It is vital to select a technology that is robust enough to service traffic reliably:

- Users (e.g., SSH keys, root account passwords). In an incident response scenario, users expect to be provisioned with credentials rapidly, so they can recover services that have gone offline. Having to wait for credentials could impact the responsiveness of the operations team.
- Applications (e.g., database credentials and API keys). If the service is not performant, it could degrade the availability of dependent applications or increase application startup times.

Such a service could receive a considerable volume of requests within a large organization.

#### 2.2 Centralize and Standardize

Secrets used by your DevOps teams for your applications might be consumed differently than secrets stored by your marketeers or your SRE team. You often find poorly maintained secrets where the needs of secret consumers or producers mismatch. Therefore, you must standardize and centralize the secrets management solution with care. Standardizing and centralizing can mean that you use multiple secret management solutions. For instance: your cloud-native development teams choose to use the solution provided by the cloud provider, while your private cloud uses a third-party solution, and everybody has an account for a selected password manager.
By making sure that the teams standardize the interaction with these different solutions, they remain maintainable and usable in the event of an incident.
Even when a company centralizes its secrets management to just one solution, you will often have to secure the primary secret of that secrets management solution in a secondary secrets management solution. For instance, you can use a cloud provider's facilities to store secrets, but that cloud provider's root/management credentials need to be stored somewhere else.

Standardization should include Secrets life cycle management, Authentication, Authorization, and Accounting of the secrets management solution, and life cycle management. Note that it should be immediately apparent to an organization what a secret is used for and where to find it. The more Secrets management solutions you use, the more documentation you need.

#### 2.3 Access Control

When users can read and/or update the secret in a secret management system, it means that the secret can now leak through that user and the system they used to touch the secret.
Therefore, engineers should not have access to all secrets in the secrets management system, and the Least Privilege principle should be applied. The secret management system needs to provide the ability to configure fine-grained access controls on each object and component to accomplish the Least Privilege principle.

#### 2.4 Automate Secrets Management

Manual maintenance not only increases the risk of leakage; it also introduces the risk of human errors while maintaining the secret. Furthermore, it can become wasteful.
Therefore, it is better to limit or remove the human interaction with the actual secrets. You can restrict human interaction in multiple ways:

- **Secrets pipeline:** Having a secrets pipeline that does large parts of the secret management (e.g., creation, rotation, etc.)
- **Using dynamic secrets:** When an application starts, it could request its database credentials, which, when dynamically generated, will be provided with new credentials for that session. Dynamic secrets should be used where possible to reduce the surface area of credential reuse. Configure a short [lease duration](https://developer.hashicorp.com/vault/docs/concepts/lease) and revoke credentials when they are no longer needed. Restarting the application does not itself revoke stolen credentials; they remain usable until the backing service expires or revokes them.
- **Automated rotation of static secrets:** Key rotation is a challenging process when implemented manually, and can lead to mistakes. It is therefore better to automate the rotation of keys or at least ensure that the process is sufficiently supported by IT.

Rotating certain keys, such as encryption keys, might trigger full or partial data re-encryption. Different strategies for rotating keys exist:

- Gradual rotation
- Introducing new keys for Write operations
- Leaving old keys for Read operations
- Rapid rotation
- Scheduled rotation
- and more...

##### 2.4.1 Architectural Patterns for Automated Rotation

To illustrate how to design systems that support automated secret rotation, here are a few architectural patterns:

###### Example 1: Kubernetes with a Sidecar Container

In a Kubernetes environment, a common pattern is to use a sidecar container that is responsible for retrieving secrets from a secrets manager and making them available to the main application container. This decouples the application from the specifics of the secrets management solution.

- **Architecture:**
    - A Pod contains two containers: the main application container and a sidecar container (e.g., HashiCorp Vault Agent, CyberArk Conjur Secrets Provider).
    - The sidecar container authenticates with the secrets manager (e.g., using a Kubernetes Service Account).
    - It retrieves the secret and writes it to a shared in-memory volume.
    - The application container reads the secret from the shared volume.
    - The sidecar container can periodically refresh the secret, ensuring the application always has a valid, short-lived credential.
- **Kubernetes Manifest Snippet:**

    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: my-app
    spec:
      serviceAccountName: my-app-sa
      containers:
      - name: my-app-container
        image: my-app-image
        volumeMounts:
        - name: secrets-volume
          mountPath: "/mnt/secrets"
          readOnly: true
      - name: vault-agent-sidecar
        image: vault:latest
        args: ["agent", "-config=/etc/vault/vault-agent-config.hcl"]
        volumeMounts:
        - name: secrets-volume
          mountPath: "/mnt/secrets"
      volumes:
      - name: secrets-volume
        emptyDir:
          medium: "Memory"
    ```

###### Example 2: Serverless Function for Database Credential Rotation

Cloud-native secret managers often provide built-in support for automated rotation using serverless functions (e.g., AWS Lambda, Azure Functions).

- **Architecture:**
    - A secret is stored in a cloud secrets manager (e.g., AWS Secrets Manager).
    - The secrets manager is configured to trigger a rotation Lambda function on a schedule.
    - The Lambda function has the necessary permissions to update the database password and the secret value in the secrets manager.
    - The rotation process typically involves multiple steps (create new secret, set new secret, test new secret, finish rotation) to ensure a safe transition.

For AWS, start from the [rotation function templates](https://docs.aws.amazon.com/secretsmanager/latest/userguide/reference_available-rotation-templates.html). Secrets Manager invokes the function [separately for each rotation step](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda.html); retrieve the pending credential from the secret version identified by `ClientRequestToken`, rather than relying on a local variable from an earlier invocation.

Follow the [rotation function security checks](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda-functions.html) and [template validation](https://github.com/aws-samples/aws-secrets-manager-rotation-lambdas/blob/master/SecretsManagerRotationTemplate/lambda_function.py): ensure rotation is enabled and the request token identifies a known secret version. Safely return if that version is already `AWSCURRENT`; otherwise, require `AWSPENDING`. Before changing credentials, validate the current credential and confirm that the pending version targets the intended database and user under the chosen rotation strategy. These checks prevent the privileged function from being redirected to another resource. Test the pending credential before promoting its version to `AWSCURRENT`.

These examples demonstrate how you can create architectures that not only manage secrets securely but also automate the rotation process, significantly reducing the risk of compromised credentials.

#### 2.5 Handling Secrets in Memory

An additional level of security can be achieved by minimizing the time window
where a secret is in memory and limiting the access to its memory space.

Depending on your application's particular circumstances, this can be difficult
to implement in a manner that ensures memory security. Because of this potential
implementation complexity, you are first encouraged to develop a threat model in order to clearly
surface your implicit assumptions about both your application's deployment environment as well
as understand the capabilities of your adversaries.

Often attempting to protect secrets in memory will be considered overkill
because as you evaluate a threat model, the potential threat
actors that you consider either do not have the capabilities to carry out such attacks
or the cost of defense far exceeds the likely impact of a compromise arising from
exposing secrets in memory. Also, it should be kept in mind while developing an
appropriate threat model, that if an attacker already has access to the memory of
the process handling the secret, by that time a security breach may have already
occurred. Furthermore, it should be recognized that with the advent of attacks like
[Rowhammer](https://arxiv.org/pdf/2211.07613.pdf), or
[Meltdown and Spectre](https://meltdownattack.com/), it is important
to understand that the operating system alone is not sufficient to protect your process
memory from these types of attacks. This becomes especially important when your
application is deployed to the cloud. The only foolproof approach to protecting memory
against these and similar attacks is to fully physically isolate your process memory from all other
untrusted processes.

Despite the implementation difficulties, in highly sensitive
environments, protecting secrets in memory can
be a valuable additional layer of security. For example, in scenarios where an
advanced attacker can cause a system to crash and gain access to a memory dump,
they may be able to extract secrets from it. Therefore, carefully safeguarding
secrets in memory is recommended for untrusted environments or situations where
tight security is of utmost importance.

Furthermore, in lower-level languages like C/C++, it is relatively easy to protect
secrets in memory. Thus, it may be worthwhile to implement this practice even if
the risk of an attacker gaining access to the memory is low. On the other hand, for
programming languages that rely on garbage collection, securing secrets in memory
generally is much more difficult.

- **Structures and Classes:** In .NET and Java, do not use immutable structures
    such as Strings to store secrets, since it is impossible to force them to
    be garbage collected. Instead, use primitive types such as byte arrays or
    char arrays, where the memory can be directly overwritten.

- **Zeroing Memory:** After a secret has been used, the memory it occupied
  should be zeroed out to prevent it from lingering in memory where it could
  potentially be accessed.

- **Memory Encryption:** In some cases, it may be possible to use hardware or
  operating system features to encrypt the entire memory space of the process
  handling the secret. This can provide an additional layer of security.

Remember, the goal is to minimize the time window where the secret is in
plaintext in memory as much as possible.

For more detailed information, see
[Testing Memory for Sensitive Data](https://mas.owasp.org/MASTG/tests/android/MASVS-STORAGE/MASTG-TEST-0011)
from the OWASP MAS project.

#### 2.6 Auditing

Auditing is an essential part of secrets management due to the nature of the application. You must implement auditing securely to be resilient against attempts to tamper with or delete the audit logs. At a minimum, you should audit the following:

- Who requested a secret and for what system and role.
- Whether the secret request was approved or rejected.
- When the secret was used and by whom/what.
- When the secret has expired.
- Whether there were any attempts to reuse expired secrets.
- If there have been any authentication or authorization errors.
- When the secret was updated and by whom/what.
- Any administrative actions and possible user activity on the underlying supporting infrastructure stack.

It is essential that all auditing has correct timestamps. Therefore, the secret management solution should have proper time sync protocols set up at its supporting infrastructure. You should monitor the stack on which the solution runs for possible clock-skew and manual time adjustments.

#### 2.7 Secret Lifecycle

Secrets follow a lifecycle. The stages of the lifecycle are as follows:

- Creation
- Rotation
- Revocation
- Expiration

##### 2.7.1 Creation

New secrets must be securely generated and cryptographically robust enough for their purpose. Secrets must have the minimum privileges assigned to them to enable their required use/role.

You should transmit credentials securely, such that ideally, you don't send the password along with the username when requesting user accounts. Instead, you should send the password via a secure channel (e.g., mutually authenticated connection) or a side-channel such as push notification, SMS, email. Refer to the [Multi-Factor Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet) to learn about the pros and cons of each channel.

Applications may not benefit from having multiple communication channels, so you must provision credentials securely.

See [the Open CRE project on secrets lookup](https://www.opencre.org/cre/223-780) for more technical recommendations on secret creation.

##### 2.7.2 Rotation

You should regularly rotate secrets so that any stolen credentials will only work for a short time. Regular rotation will also reduce the tendency for users to fall back to bad habits such as reusing credentials.

Depending on a secret's function and what it protects, the lifetime could be from minutes (think end-to-end encrypted chats with perfect forward secrecy) to years (consider hardware secrets).

User credentials are excluded from regular rotation. These should only be rotated if there is suspicion or evidence that they have been compromised, according to [NIST recommendations](https://pages.nist.gov/800-63-FAQ/#q-b05).

##### 2.7.3 Revocation

When secrets are no longer required or potentially compromised, you must securely revoke them to restrict access. With (TLS) certificates, this also involves certificate revocation.

##### 2.7.4 Expiration

You should create secrets to expire after a defined time where possible. This expiration can either be active expiration by the secret consuming system, or an expiration date set at the secrets management system forcing supporting processes to be triggered, resulting in a secret rotation.
You should apply policies through the secrets management solution to ensure credentials are only made available for a limited time appropriate for the type of credentials. Applications should verify that the secret is still active before trusting it.

#### 2.8 Transport Layer Security (TLS) Everywhere

Never transmit secrets via plaintext. In this day and age, there is no excuse given the ubiquitous adoption of TLS.

Furthermore, you can effectively use secrets management solutions to provision TLS certificates.

#### 2.9 Downtime, Break-glass, Backup and Restore

Consider the possibility that a secrets management service becomes unavailable for various reasons, such as scheduled downtime for maintenance. It could be impossible to retrieve the credentials required to restore the service if you did not previously acquire them. Thus, choose maintenance windows carefully based on earlier metrics and audit logs.

Next, the backup and restore procedures of the system should be regularly tested and audited for their security. A few requirements regarding backup & restore. Ensure that:

- An automated backup procedure is in place and executed periodically; base the frequency of the backups and snapshots on the number of secrets and their lifecycle.
- Frequently test restore procedures to guarantee that the backups are intact.
- Encrypt backups and put them on secure storage with reduced access rights. Monitor the backup location for (unauthorized) access and administrative actions.

Lastly, you should implement emergency ("break-glass") processes to restore the service if the system becomes unavailable for reasons other than regular maintenance. Therefore, emergency break-glass credentials should be regularly backed up securely in a secondary secrets management system and tested routinely to verify they work.

#### 2.10 Policies

Consistently enforce policies defining the minimum complexity requirements of passwords and approved encryption algorithms at an organization-wide level. Using a centralized secrets management solution can help companies implement these policies.

Next, having an organization-wide secrets management policy can help enforce applying the best practices defined in this cheat sheet.

#### 2.11 Metadata: prepare to move the secret

A secret management solution should provide the capability to store at least the following metadata about a secret:

- When it was created/consumed/archived/rotated/deleted
- Who created/consumed/archived/rotated/deleted it (e.g., both the actual producer and the engineer using the production method)
- What created/consumed/archived/rotated/deleted it
- Who to contact when having trouble with the secret or having questions about it
- For what the secret is used (e.g., designated intended consumers and purpose of the secret)
- What type of secret it is (e.g., AES Key, HMAC key, RSA private key)
- When you need to rotate it, if done manually

Note: if you don't store metadata about the secret nor prepare to move, you will increase the probability of vendor lock-in.

#### 2.12 Passwordless Authentication and Token Security

OpenID Connect (OIDC) lets an application delegate user authentication to an identity provider (IdP), instead of storing and verifying the user's password itself. It does not require passwordless authentication: [OpenID Connect Core Section 3.1.2.3](https://openid.net/specs/openid-connect-core-1_0.html#Authenticates) leaves the IdP's authentication method, including passwords, outside the protocol's scope.

OIDC alone does not eliminate phishing, credential stuffing, or weak passwords at the IdP. Choose an IdP that enforces appropriate authentication controls; for phishing resistance, require [phishing-resistant authentication](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/#verifimpers), such as WebAuthn. See the [Multifactor Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html).

Federation still requires protecting issued tokens and any client credentials. Follow the [OAuth2 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html) for token transmission, storage, validation, expiration, and refresh-token protection. OIDC does not replace other application secrets, such as database credentials or API keys.

### 3 Continuous Integration (CI) and Continuous Deployment (CD)

Building, testing and deploying changes generally requires access to many systems. Continuous Integration (CI) and Continuous Deployment (CD) tools typically store secrets to provide configuration to the application or during deployment. Alternatively, they interact heavily with the secrets management system. Various best practices can help smooth out secret management in CI/CD; we will deal with some of them in this section.

#### 3.1 Hardening your CI/CD pipeline

CI/CD tooling consumes (high-privilege) credentials regularly. Ensure that the pipeline cannot be easily hacked or misused by employees. Here are a few guidelines which can help you:

- Treat your CI/CD tooling as a production environment: harden it, patch it and harden the underlying infrastructure and services.
- Have Security Event Monitoring in place.
- Implement least-privilege access: developers do not need to be able to administer projects. Instead, they only need to be able to execute required functions, such as setting up pipelines, running them, and working with code. Administrative tasks can quickly be done using configuration-as-code in a separate repository used by the CI/CD system to update its configuration. There is no need for privileged roles that might have access to secrets.
- Make sure that pipeline output does not leak secrets, and you can't listen in on production pipelines with debugging tools.
- Make sure you cannot exec into any runners and workers for a CI/CD system.
- Have proper authentication, authorization and accounting in place.
- Ensure only an approved process can create pipelines, including MR/PR steps to ensure that a created pipeline is security-reviewed.

#### 3.2 Where should a secret be?

There are various places where you can store a secret to execute CI/CD actions:

- As part of your CI/CD tooling: you can store a secret in [GitLab](https://docs.gitlab.com/charts/installation/secrets.html)/[GitHub](https://docs.github.com/en/actions/security-guides/encrypted-secrets)/[Jenkins](https://www.jenkins.io/doc/developer/security/secrets/). This is not the same as committing it to code.
- As part of your secrets-management system: you can store a secret in a secrets management system, such as facilities provided by a cloud provider ([AWS Secrets Manager](https://aws.amazon.com/secrets-manager/), [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/general/basic-concepts), [Google Secret Manager](https://cloud.google.com/secret-manager)), or other third-party facilities ([Hashicorp Vault](https://www.vaultproject.io/), [Conjur](https://www.conjur.org/), [Keeper](https://www.keepersecurity.com/)). In this case, the CI/CD pipeline tooling requires credentials to connect to these secret management systems to have secrets in place. See [Cloud Providers](#4-cloud-providers) for more details on using a cloud provider's secret management system.

Another alternative here is using the CI/CD pipeline to leverage the Encryption as a Service from the secrets management systems to do the encryption of a secret. The CI/CD tooling can then commit the encrypted secret to git, which can be fetched by the consuming service on deployment and decrypted again. See section 3.6 for more details.

Note: not all secrets must be in the CI/CD pipeline to get to the actual deployment. Instead, make sure that the deployed services take care of part of their secrets management at their own lifecycle (e.g., deployment, runtime and destruction).

##### 3.2.1 As part of your CI/CD tooling

When secrets are part of your CI/CD tooling, it means that these secrets are exposed to your CI/CD jobs. CI/CD tooling can comprise, e.g., GitHub secrets, GitLab repository secrets, ENV Vars/Var Groups in Microsoft Azure DevOps, Kubernetes Secrets, etc.
These secrets are often configurable/viewable by people who have the authorization to do so (e.g., a maintainer in GitHub, a project owner in GitLab, an admin in Jenkins, etc.), which together line up for the following best practices:

- No "big secret": ensure that secrets in your CI/CD tooling that are not long-term, don't have a wide blast radius, and don't have a high value. Also, limit shared secrets (e.g., never have one password for all administrative users).
- As is / To be: have a clear overview of which users can view or alter the secrets. Often, maintainers of a GitLab/GitHub project can see or otherwise extract its secrets.
- Reduce the number of people that can perform administrative tasks on the project to limit exposure.
- Log & Alert: Assemble all the logs from the CI/CD tooling and have rules in place to detect secret extraction or misuse, whether through accessing them through a web interface or dumping them while double Base64 encoding or encrypting them with OpenSSL.
- Rotation: Regularly rotate secrets.
- Forking should not leak: Validate that a fork of the repository or copy of the job definition does not copy the secret.
- Document: Make sure you document which secrets you store as part of your CI/CD tooling and why so that you can migrate these easily when required.

##### 3.2.2 Storing it in a secrets management system

Naturally, you can store secrets in a designated secrets management solution. For example, you can use a solution offered by your (cloud) infrastructure provider, such as [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/), [Google Secrets Manager](https://cloud.google.com/secret-manager), or [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/general/basic-concepts). You can find more information about these in [section 4](#4-cloud-providers) of this cheat sheet. Another option is a dedicated secrets management system, such as [Hashicorp Vault](https://www.vaultproject.io/), [Keeper](https://www.keepersecurity.com/), [Conjur](https://www.conjur.org/).
Here are a few do's and don'ts for the CI/CD interaction with these systems. Make sure that the following is taken care of:

- Rotation/Temporality: credentials used by the CI/CD tooling to authenticate against the secret management system are rotated frequently and expire after a job completes.
- Scope of authorization: scope credentials used by the CI/CD tooling (e.g., roles, users, etc.), only authorize those secrets and services of the secret management system required for the CI/CD tooling to execute its job.
- Attribution of the caller: credentials used by the CI/CD tooling still hold attribution of the one calling the secrets management solution. Ensure you can attribute any calls made by the CI/CD tooling to a person or service that requested the actions of the CI/CD tooling. If this is not possible through the default configuration of the secrets manager, make sure that you have a correlation setup in terms of request parameters.
- All of the above: Still follow those do's and don'ts listed in section 3.2.1: log & alert, take care of forking, etc.
- Backup: back up secrets to product-critical operations in separate storage (e.g., cold storage), especially encryption keys.

##### 3.2.3 Not touched by CI/CD at all

Secrets do not necessarily need to be brought to a consumer of the secret by a CI/CD pipeline. It is even better when the consumer of the secret retrieves the secret. In that case, the CI/CD pipeline still needs to instruct the orchestrating system (e.g., [Kubernetes](https://kubernetes.io/)) that it needs to schedule a specific service with a given service account with which the consumer can then retrieve the required secret. The CI/CD tooling then still has credentials for the orchestrating platform but no longer has access to the secrets themselves. The do's and don'ts regarding these credentials types are similar to those described in section 3.2.2.

#### 3.3 Authentication and Authorization of CI/CD tooling

CI/CD tooling should have designated service accounts, which can only operate in the scope of the required secrets or orchestration of the consumers of a secret. Additionally, a CI/CD pipeline run should be easily attributable to the one who has defined the job or triggered it to detect who has tried to exfiltrate secrets or manipulate them. When you use certificate-based auth, the caller of the pipeline identity should be part of the certificate. If you use a token to authenticate towards the mentioned systems, make sure you set the principal requesting these actions (e.g., the user or the job creator).

Verify on a periodic basis whether this is (still) the case for your system so that you can do logging, attribution, and security alerting on suspicious actions effectively.

#### 3.4 Logging and Accounting

Attackers can use CI/CD tooling to extract secrets. They could, for example, use administrative interfaces or job creation that exfiltrates the secret using encryption or double Base64 encoding. Therefore, you should log every action in a CI/CD tool. You should define security alerting rules at every non-standard manipulation of the pipeline tool and its administrative interface to monitor secret usage.
Logs should be queryable for at least 90 days and stored for a more extended period in cold storage. It might take security teams time to understand how attackers can exfiltrate or manipulate a secret using CI/CD tooling.

#### 3.5 Rotation vs Dynamic Creation

You can leverage CI/CD tooling to rotate secrets or instruct other components to do the rotation of the secret. For instance, the CI/CD tool can request a secrets management system or another application to rotate the secret. Alternatively, the CI/CD tool or another component could set up a dynamic secret: a secret required for a consumer to use for as long as it lives. Tie invalidation to the provider's [lease expiry or explicit revocation](https://developer.hashicorp.com/vault/docs/concepts/lease); stopping the consumer alone does not revoke the secret. This procedure reduces possible leakage of a secret and allows for easy detection of misuse. If an attacker uses a secret from anywhere other than the consumer's IP, you can easily detect it.

#### 3.6 Pipeline Created Secrets

You can use pipeline tooling to generate secrets and either offer them directly to the service deployed by the tooling or provide the secret to a secrets management solution. Alternatively, the secret can be stored encrypted in git so that the secret and its metadata is as close to the developer's daily place of work as possible. A git-stored secret does require that developers cannot decrypt the secrets themselves and that every consumer of a secret has its encrypted variant of the secret. For instance: the secret should then be different per DTAP environment and be encrypted with another key. For each environment, only the designated consumer in that environment should be able to decrypt the specific secret. A secret does not leak cross-environment and can still be easily stored next to the code.
Consumers of a secret could now decrypt the secret using a sidecar, as described in section 5.2. Instead of retrieving the secrets, the consumer would leverage the sidecar to decrypt the secret.

When a pipeline creates a secret by itself, ensure that the scripts or binaries involved adhere to best practices for secret generation. Best practices include secure randomness, proper length of secret creation, etc. and that the secret is created based on well-defined metadata stored somewhere in git or somewhere else.

### 4 Cloud Providers

For cloud providers, there are at least four essential topics to touch upon:

- Designated secret storage/management solutions. Which service(s) do you use?
- Envelope & client-side encryption
- Identity and access management: decreasing the blast radius
- API quotas or service limits

#### 4.1 Services to Use

It is best to use a designated secret management solution in any environment. Most cloud providers have at least one service that offers secret management. Of course, it's also possible to run a different secret management solution (e.g., HashiCorp Vault or Conjur) on compute resources within the cloud. We'll consider cloud provider service offerings in this section.

Sometimes it's possible to automatically rotate your secret, either via a service provided by your cloud provider or a (custom-built) function. Generally, you should prefer the cloud provider's solution since the barrier of entry and risk of misconfiguration are lower. If you use a custom solution, ensure the function's role to do its rotation can only be assumed by said function.

##### 4.1.1 AWS

For AWS, the recommended solution is [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html).

Permissions are granted at the secret level. Check out the [Secrets Manager best practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html).

It is also possible to use the [Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html), which is cheaper, but that has a few downsides:

- you'll need to make sure you've specified encryption yourself (secrets manager does that by default)
- it offers fewer auto-rotation capabilities (you will likely need to build a custom function)
- cross-account sharing is limited to [advanced parameters](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-shared-parameters.html); sharing encrypted `SecureString` values also requires a customer managed AWS KMS key and separately granting access to that key
- it doesn't support cross-region replication
- there are fewer [Security Hub Controls](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html) available

###### 4.1.1.1 AWS Nitro Enclaves

With [AWS Nitro Enclaves](https://aws.amazon.com/ec2/nitro/nitro-enclaves/), you can create isolated compute environments to further protect and securely process highly sensitive data such as secrets. Enclaves are hardened, and restrict operator access, providing a trusted execution environment. A key feature is cryptographic attestation, which allows you to verify the enclave's identity and ensure only authorized code is running before provisioning secrets to it. This makes it a strong choice for scenarios requiring high assurance in secret handling.

###### 4.1.1.2 AWS CloudHSM

For secrets being used in highly confidential applications, it may be needed to have more control over the encryption and storage of these keys. AWS offers [CloudHSM](https://aws.amazon.com/cloudhsm/), which lets you bring your own key (BYOK) for AWS services. Thus, you will have more control over keys' creation, lifecycle, and durability. Scale a CloudHSM cluster by [adding or removing HSMs](https://docs.aws.amazon.com/cloudhsm/latest/userguide/add-remove-hsm.html); the service makes [periodic encrypted backups of cluster users, keys, and configuration](https://docs.aws.amazon.com/cloudhsm/latest/userguide/manage-backups.html). The cloud service provider, Amazon, will not have any access to the key material stored in **AWS CloudHSM**.

##### 4.1.2 GCP

For GCP, the recommended service is [Secret Manager](https://cloud.google.com/secret-manager/docs).

Permissions are granted at the secret level.

Check out the [Secret Manager best practices](https://cloud.google.com/secret-manager/docs/best-practices).

###### 4.1.2.1 Google Cloud Confidential Computing

[GCP Confidential Computing](https://cloud.google.com/confidential-computing) is a technology that encrypts data in-use, while it is being processed. This is achieved through services like **Confidential VMs** and **Confidential GKE Nodes**, which leverage AMD Secure Encrypted Virtualization (SEV). This ensures that even Google personnel cannot view the contents of the memory of your virtual machines, providing a high degree of protection for secrets that must be held in memory.

##### 4.1.3 Azure

For Azure, the recommended service is [Key Vault](https://docs.microsoft.com/en-us/azure/key-vault/).

Azure's [role-based access control (RBAC)](https://learn.microsoft.com/en-us/azure/key-vault/general/rbac-guide) supports role assignments for individual secrets, keys, and certificates. Follow the [Identity and Access Management guidance](#43-identity-and-access-management-iam) for access scopes and vault boundaries.

Check out the [Key Vault best practices](https://docs.microsoft.com/en-us/azure/key-vault/general/best-practices).

###### 4.1.3.1 Azure Confidential Computing

With [Azure Confidential Computing](https://azure.microsoft.com/en-us/solutions/confidential-compute/#overview), you can create trusted execution environments. This technology isolates sensitive data within a protected container, ensuring that it is encrypted both at rest, in transit, and in use. Services like **Azure Confidential Virtual Machines** and **Confidential Containers on ACI** utilize technologies like Intel SGX and AMD SEV-SNP to create these secure enclaves. This prevents unauthorized access from cloud administrators, malware, or other tenants, making it a robust solution for secret management.

###### 4.1.3.2 Azure Dedicated HSM

For secrets being used in Azure environments and requiring special security considerations, Azure offers [Azure Dedicated HSM](https://azure.microsoft.com/en-us/services/azure-dedicated-hsm/). This allows you more control over the secrets stored on it, including enhanced administrative and cryptographic control. The cloud service provider, Microsoft, will not have any access to the key material stored in Azure Dedicated HSM.

##### 4.1.4 Other clouds, Multi-cloud, and Cloud agnostic

If you're using multiple cloud providers, you should consider using a cloud-agnostic secret management solution. This will allow you to use the same secret management solution across all your cloud providers (and possibly also on-premises). Another advantage is that this avoids vendor lock-in with a specific cloud provider, as the solution can be used on any cloud provider.

There are open-source and commercial solutions available. Some examples are:

- [CyberArk Conjur](https://www.conjur.org/)
- [HashiCorp Vault](https://www.vaultproject.io/)
- [Pulumi ESC](https://www.pulumi.com/esc/)

#### 4.2 Envelope & client-side encryption

This section will describe how a secret is encrypted and how you can manage the keys for that encryption in the cloud.

##### 4.2.1 Client-side encryption versus server-side encryption

Server-side encryption of secrets ensures that the cloud provider takes care of the encryption of the secret in storage. The secret is then safeguarded against compromise while at rest. Encryption at rest often does not require additional work other than selecting the key to encrypt it with (See section 4.2.2). However, when you submit the secret to another service, it will no longer be encrypted. It is decrypted before sharing with the intended service or human user.

Client-side encryption of secrets ensures that the secret remains encrypted until you actively decrypt it. This means it is only decrypted when it arrives at the consumer. You need to have a proper crypto system to cater for this. Think about mechanisms such as PGP using a safe configuration and other more scalable and relatively easy to use systems. Client-side encryption can provide an end-to-end encryption of the secret: from producer to consumer.

##### 4.2.2 Bring Your Own Key versus Cloud Provider Key

When you encrypt a secret at rest, the question is: which key do you want to use? The less trust you have in the cloud provider, the more you will want to manage yourself.

Often, you can either encrypt a secret with a key managed at the secrets management service or use a key management solution from the cloud provider to encrypt the secret. The key offered through the key management solution of the cloud provider can be either managed by the cloud provider or by yourself. Industry standards call the latter "bring your own key" (BYOK). You can either directly import or generate this key at the key management solution or using cloud HSM supported by the cloud provider.
You can then either use your key or the customer main key from the provider to encrypt the data key of the secrets management solution. The data key, in turn, encrypts the secret. By managing the CMK, you have control over the data key at the secrets management solution.

While importing your own key material can generally be done with all providers ([AWS](https://docs.aws.amazon.com/kms/latest/developerguide/importing-keys.html), [Azure](https://docs.microsoft.com/en-us/azure/key-vault/keys/byok-specification), [GCP](https://cloud.google.com/kms/docs/key-import)), unless you know what you are doing and your threat model and policy require this, this is not a recommended solution due to its complexity and difficulty of use.

#### 4.3 Identity and Access Management (IAM)

IAM applies to both on-premises and cloud setups: to effectively manage secrets, you need to set up suitable access policies and roles. Setting this up goes beyond policies regarding secrets; it should include hardening the full IAM setup, as it could otherwise allow for privilege escalation attacks. Ensure you never allow open "pass role" privileges or unrestricted IAM creation privileges, as these can use or create credentials that have access to the secrets. Next, make sure you tightly control what can impersonate a service account: are your machines' roles accessible by an attacker exploiting your server? Can service roles from the data-pipeline tooling access the secrets easily? Ensure you include IAM for every cloud component in your threat model (e.g., ask yourself: how can you do elevation of privileges with this component?). See [this blog entry](https://xebia.com/ten-pitfalls-you-should-look-out-for-in-aws-iam/) for multiple do's and don'ts with examples.

Leverage the temporality of the IAM principals effectively: e.g., ensure that only specific roles and service accounts that require it can access the secrets. Monitor these accounts so that you can tell who or what used them to access the secrets.

Next, make sure that you scope access to your secrets: one should not be simply allowed to access all secrets. In GCP and AWS, you can create fine-grained access policies to ensure that a principal cannot access all secrets at once. For Azure Key Vault, use the recommended [Azure RBAC permission model](https://learn.microsoft.com/en-us/azure/key-vault/general/rbac-guide) with least-privilege roles. Azure RBAC supports role assignments at the scope of individual keys, secrets, and certificates for limited sharing scenarios, but Microsoft recommends [separate vaults per application and environment](https://learn.microsoft.com/en-us/azure/key-vault/general/secure-key-vault) as the primary security boundary.

#### 4.4 API limits

Cloud services can generally provide a limited amount of API calls over a given period. You could potentially (D)DoS yourself when you run into these limits. Most of these limits apply per account, project, or subscription, so spread workloads to limit your blast radius accordingly. Additionally, some services may support data key caching, preventing load on the key management service API (see, for example, [AWS data key caching](https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/data-key-caching.html)). Some services can leverage built-in data key caching. [S3 is one such example](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-key.html).

### 5 Containers & Orchestrators

You can enrich containers with secrets in multiple ways: build time (not recommended) and during orchestration/deployment.

#### 5.1 Injection of Secrets (file, in-memory)

There are three ways to get secrets to an app inside a Docker container.

- Mounted volumes (file): With this method, we keep our secrets within a particular config/secret file and mount that file to our instance as a mounted volume. Ensure that these mounts are mounted in by the orchestrator and never built-in, as this will leak the secret with the container definition. Instead, make sure that the orchestrator mounts in the volume when required.
- Fetch from the secret store (in-memory): A sidecar app/container fetches the secrets it needs directly from a secret manager service without dealing with docker config. This solution allows you to use dynamically constructed secrets without worrying about the secrets being viewable from the file system or from checking the Docker container's environment variables.
- Environment variables: We can provide secrets directly as part of the Docker container configuration. Note: secrets themselves should never be hardcoded using docker ENV or docker ARG commands, as these can easily leak with the container definitions. See the Docker challenges at [WrongSecrets](https://github.com/OWASP/wrongsecrets) as well. Instead, let an orchestrator overwrite the environment variable with the actual secret and ensure that this is not hardcoded. Additionally, environment variables are generally accessible to all processes and may be included in logs or system dumps. Using environment variables is therefore not recommended unless the other methods are not possible.

#### 5.2 Short-Lived Sidecar Containers

To inject secrets, you could create short-lived sidecar containers that fetch secrets from some remote endpoint and then store them on a shared volume mounted to the original container. The original container can now use the secrets from the mounted volume. The benefit of using this approach is that we don't need to integrate any third-party tool or code to get secrets. Once the sidecar has fetched the secrets, it terminates. Examples of this include [Vault Agent Sidecar Injector](https://developer.hashicorp.com/vault/docs/platform/k8s/injector) and [Conjur Secrets Provider](https://github.com/cyberark/secrets-provider-for-k8s). By mounting secrets to a volume shared with the pod, containers within the pod can consume secrets without being aware of the secrets manager.

#### 5.3 Internal vs External Access

You should only expose secrets to communication mechanisms between the container and the deployment representation (e.g., a Kubernetes Pod). Never expose secrets through external access mechanisms shared among deployments or orchestrators (e.g., a shared volume).

When the orchestrator stores secrets (e.g., Kubernetes Secrets), make sure that the storage backend of the orchestrator is encrypted and you manage the keys well. See the [Kubernetes Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html) for more information.

### 6 Implementation Guidance

In this section, we will discuss implementation. Note that it is always best to refer to the official documentation of the secrets management system of choice for the actual implementation as it will be more up to date than any secondary document such as this cheat sheet.

#### 6.1 Key Material Management Policies

Key material management is discussed in the [Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)

#### 6.2 Dynamic vs Static Use Cases

We see the following use cases for dynamic secrets, among others:

- short-lived secrets (e.g., credentials or API keys) for a secondary service that expresses the intent for connecting the primary service (e.g., consumer) to the service.
- short-lived integrity and encryption controls for guarding and securing in-memory and runtime communication processes. Think of encryption keys that only need to live for a single session or a single deployment lifetime.
- short-lived credentials for building a stack during the deployment of a service for interacting with the deployers and supporting infrastructure.

Note that these dynamic secrets often need to be created with the service we need to connect to. To create these types of dynamic secrets, we usually require long-term static secrets to create the dynamic secrets themselves. Other static use cases:

- key material that needs to live longer than a single deployment due to the nature of its usage in the interaction with other instances of the same service (e.g., storage encryption keys, TLS PKI keys)
- key material or credentials to connect to services that do not support creating temporal roles or credentials.

#### 6.3 Ensure limitations are in place

Secrets should never be retrievable by everyone and everything. Always make sure that you put guardrails in place:

- Do you have the opportunity to create access policies? Ensure that there are policies in place to limit the number of entities that can read or write the secret. At the same time, write the policies so that you can easily extend them, and they are not too complicated to understand.
- Is there no way to reduce access to certain secrets within a secrets management solution? Consider separating the production and development secrets by having separate secret management solutions. Then, reduce access to the production secrets management solution.

#### 6.4 Security Event Monitoring is Key

Continually monitor who/what, from which IP, and what methodology accesses the secret. There are various patterns to look out for, such as, but not limited to:

- Monitor who accesses the secret at the secret management system: is this normal behavior? If the CI/CD credentials are used to access the secret management solution from a different IP than where the CI/CD system is running, provide a security alert and assume the secret is compromised.
- Monitor the service requiring the secret (if possible), e.g., whether the user of the secret is coming from an expected IP, with an expected user agent. If not, alert and assume the secret is compromised.

#### 6.5 Usability and Ease of Onboarding

For a secrets management solution to be effective, it must be easy for developers to adopt and use. If the process is too complex, developers may resort to insecure practices. A focus on usability and a smooth onboarding experience is critical.

- **Clear and Comprehensive Documentation:**
    - Provide clear, concise, and easy-to-find documentation. This should include tutorials for common use cases, detailed API references, and practical examples.
    - Maintain a "getting started" guide that walks new users through the process of obtaining their first secret.
- **Developer-Friendly Tooling and SDKs:**
    - Offer well-maintained SDKs for various programming languages to simplify integration.
    - Provide a command-line interface (CLI) that allows developers to manage secrets from their local development environment.
    - Develop plugins for common IDEs, CI/CD systems, and infrastructure-as-code (IaC) tools like Terraform and Pulumi.
- **Streamlined Workflows:**
    - Implement self-service workflows that enable developers to request and receive secrets with minimal manual intervention.
    - Use GitOps principles to manage secrets as code, allowing developers to define secret needs in a declarative manner alongside their application code.
    - Automate the approval process for low-risk secrets while maintaining appropriate controls for more sensitive ones.
- **Actionable Feedback and Support:**
    - Provide clear error messages that help developers troubleshoot issues independently.
    - Establish dedicated support channels (e.g., a Slack channel, a ticketing system) where developers can get help from the security or platform team.
- **Easy Integration:**
    - Ensure the secrets management solution can be easily integrated with existing applications. Sidecar containers, such as the [Vault Agent Sidecar Injector](https://developer.hashicorp.com/vault/docs/platform/k8s/injector) or the [Conjur Secrets Provider](https://github.com/cyberark/secrets-provider-for-k8s), can help decouple applications from the secrets management system.

### 7 Encryption

Secrets Management goes hand in hand with encryption. After all, secrets must be stored encrypted somewhere to protect their confidentiality and integrity.

#### 7.1 Encryption Types to Use

You can use various encryption types to secure a secret as long as they provide sufficient security, including adequate resistance against quantum computing-based attacks. Given that this is a moving field, it is best to take a look at sources like [keylength.com](https://www.keylength.com/en/4/), which enumerate up-to-date recommendations on the usage of encryption types and key lengths for existing standards, as well as the NSA's [Commercial National Security Algorithm Suite 2.0](https://media.defense.gov/2022/Sep/07/2003071834/-1/-1/0/CSA_CNSA_2.0_ALGORITHMS_.PDF) which enumerates quantum resistant algorithms.

Please note that in all cases, we need to preferably select an algorithm that provides encryption and confidentiality at the same time, such as AES-256 using GCM [(Galois Counter Mode)](https://en.wikipedia.org/wiki/Galois/Counter_Mode), or a mixture of ChaCha20 and Poly1305 according to the best practices in the field.

#### 7.2 Convergent Encryption

[Convergent Encryption](https://en.wikipedia.org/wiki/Convergent_encryption) ensures that a given plaintext and its key results in the same ciphertext. This can help detect possible reuse of secrets, resulting in the same ciphertext.
The challenge with enabling convergent encryption is that it allows attackers to use the system to generate a set of cryptographic strings that might end up in the same secret, allowing the attacker to derive the plaintext secret. Given the algorithm and key, you can mitigate this risk if the convergent crypto system you use has sufficient resource challenges during encryption. Another factor that can help reduce the risk is ensuring that a secret is of adequate length, further hampering the possible guess-iteration time required.

#### 7.3 Where to store the Encryption Keys?

You should not store keys next to the secrets they encrypt, except if those keys are encrypted themselves (see envelope encryption). Start by consulting the [Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html) on where and how to store the encryption and possible HMAC keys.

#### 7.4 Encryption as a Service (EaaS)

EaaS is a model in which users subscribe to a cloud-based encryption service without having to install encryption on their own systems. Using EaaS, you can get the following benefits:

- Encryption at rest
- Encryption in transit (TLS)
- Key handling and cryptographic implementations are taken care of by Encryption Service, not by developers
- The provider could add more services to interact with the sensitive data

### 8 Detection

There are many approaches to secrets detection and some very useful open-source projects to help with this. The [Yelp Detect Secrets](https://github.com/Yelp/detect-secrets) project is mature and has signature matching for around 20 secrets. For more information on other tools to help you in the detection space, check out the [Secrets Detection](https://github.com/topics/secrets-detection) topic on GitHub.

#### 8.1 General detection approaches

Shift-left and DevSecOps principles apply to secrets detection as well. These general approaches below aim to consider secrets earlier and evolve the practice over time.

- Create standard test secrets and use them universally across the organization. This allows for reducing false positives by only needing to track a single test secret for each secret type.
- Consider enabling secrets detection at the developer level to avoid checking secrets into code before commit/PR either in the IDE, as part of test-driven development, or via pre-commit hook.
- Make secrets detection part of the threat model. Consider secrets as part of the attack surface during threat modeling exercises.
- Evaluate detection utilities and related signatures often to ensure they meet expectations.
- Consider having more than one detection utility and correlating/de-duping results to identify potential areas of detection weakness.
- Explore a balance between entropy and ease of detection. Secrets with consistent formats are easier to detect with lower false-positive rates, but you also don't want to miss a human-created password simply because it doesn't match your detection rules.

#### 8.2 Types of secrets to be detected

Many types of secrets exist, and you should consider signatures for each to ensure accurate detection for all. Among the more common types are:

- High availability secrets (Tokens that are difficult to rotate)
- Application configuration files
- Connection strings
- API keys
- Credentials
- Passwords
- 2FA keys
- Private keys (e.g., SSH keys)
- Session tokens
- Platform-specific secret types (e.g., Amazon Web Services, Google Cloud)

For more fun learning about secrets and practice rooting them out, check out the [Wrong Secrets](https://owasp.org/www-project-wrongsecrets/) project.

#### 8.3 Detection lifecycle

Secrets are like any other authorization token. They should:

- Exist only for as long as necessary (rotate often)
- Have a method for automatic rotation
- Only be visible to those who need them (least privilege)
- Be revocable (including the logging of attempt to use a revoked secret)
- Never be logged (must implement either an encryption or masking approach in place to avoid logging plaintext secrets)

Create detection rules for each of the stages of the secret lifecycle.

#### 8.4 Documentation for how to detect secrets

Create documentation and update it regularly to inform the developer community on procedures and systems available at your organization and what types of secrets management you expect, how to test for secrets, and what to do in the event of detected secrets.

Documentation should:

- Exist and be updated often, especially in response to an incident
- Include the following information:
    - Who has access to the secret
    - How it gets rotated
    - Any upstream or downstream dependencies that could potentially be broken during secret rotation
    - Who is the point of contact during an incident
    - Security impact of exposure

- Identify when secrets may be handled differently depending on the threat risk, data classification, etc.

### 9 Incident Response

Quick response in the event of a secret exposure is perhaps one of the most critical considerations for secrets management.

#### 9.1 Documentation

Incident response in the event of secret exposure should ensure that everyone in the chain of custody is aware and understands how to respond. This includes application creators (every member of a development team), information security, and technology leadership.

Documentation must include:

- How to test for secrets and secrets handling, especially during business continuity reviews.
- Whom to alert when a secret is detected.
- Steps to take for containment
- Information to log during the event

#### 9.2 Remediation

The primary goal of incident response is rapid response and containment.

Containment should follow these procedures:

1. Revocation: Keys that were exposed should undergo immediate revocation. The secret must be able to be de-authorized quickly, and systems must be in place to identify the revocation status.
2. Rotation: A new secret must be able to be quickly created and implemented, preferably via an automated process to ensure repeatability, low rate of implementation error, and least-privilege (not directly human-readable).
3. Deletion: Secrets revoked/rotated must be removed from the exposed system immediately, including secrets discovered in code or logs. Secrets in code could have commit history for the exposure squashed to before the introduction of the secret, however, this may introduce other problems as it rewrites git history and will break any other links to a given commit. If you decide to do this be aware of the consequences and plan accordingly. Secrets in logs must have a process for removing the secret while maintaining log integrity.
4. Logging: Incident response teams must have access to information about the lifecycle of a secret to aid in containment and remediation, including:
    - Who had access?
    - When did they use it?
    - When was it previously rotated?

#### 9.3 Logging

Additional considerations for logging of secrets usage should include:

- Logging for incident response should be to a single location accessible by incident response (IR) teams
- Ensure fidelity of logging information during purple team exercises such as:
    - What should have been logged?
    - What was actually logged?
    - Do we have adequate alerts in place to ensure this?

Consider using a standardized logging format and vocabulary such as the [Logging Vocabulary Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Vocabulary_Cheat_Sheet.html) to ensure that all necessary information is logged.

### 10 Secrets Management in a Multi-Cloud Environment

#### 10.1 Introduction

Managing secrets in a multi-cloud environment presents unique challenges due to the diversity of cloud providers and their respective services. This section discusses the challenges and best practices for managing secrets across multiple cloud providers.

#### 10.2 Challenges

1. **Diverse APIs and Interfaces**: Each cloud provider has its own API and interface for managing secrets, which can lead to complexity in integrating and managing secrets across multiple providers.
2. **Inconsistent Security Policies**: Different cloud providers may have varying security policies and practices, making it challenging to enforce consistent security standards across all environments.
3. **Key Rotation**: Ensuring that keys are rotated consistently and securely across multiple cloud providers can be difficult, especially if each provider has different mechanisms for key rotation.
4. **Access Control**: Managing access control for secrets across multiple cloud providers can be complex, as each provider may have different access control mechanisms and policies.
5. **Auditing and Monitoring**: Ensuring comprehensive auditing and monitoring of secret access and usage across multiple cloud providers can be challenging due to the differences in logging and monitoring capabilities.

#### 10.3 Best Practices

1. **Use a Centralized Secrets Management Solution**: Implement a centralized secrets management solution that can integrate with multiple cloud providers. This can help standardize the management of secrets and enforce consistent security policies across all environments. Examples include HashiCorp Vault and CyberArk Conjur.
2. **Standardize Security Policies**: Define and enforce standardized security policies for managing secrets across all cloud providers. This includes policies for key rotation, access control, and auditing.
3. **Automate Key Rotation**: Implement automated key rotation processes to ensure that keys are rotated consistently and securely across all cloud providers. Use tools and scripts to automate the rotation process and reduce the risk of human error.
4. **Implement Fine-Grained Access Control**: Use fine-grained access control mechanisms to restrict access to secrets based on the principle of least privilege. Ensure that access control policies are consistently enforced across all cloud providers.
5. **Enable Comprehensive Auditing and Monitoring**: Implement comprehensive auditing and monitoring of secret access and usage across all cloud providers. Use centralized logging and monitoring solutions to aggregate and analyze logs from multiple providers.

#### 10.4 References

- [HashiCorp Vault](https://www.vaultproject.io/)
- [CyberArk Conjur](https://www.conjur.org/)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/general/basic-concepts)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager)

### 11 Related Cheat Sheets & further reading

- [Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP WrongSecrets project](https://github.com/OWASP/wrongsecrets/)

## Transport Layer Security

> **Source:** [Transport Layer Security](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet provides guidance on implementing transport layer protection for applications using Transport Layer Security (TLS). It primarily focuses on how to use TLS to protect clients connecting to a web application over HTTPS, though much of this guidance is also applicable to other uses of TLS. When correctly implemented, TLS can provide several security benefits:

- **Confidentiality**: Provides protection against attackers reading the contents of the traffic.
- **Integrity**: Provides protection against traffic modification, such as an attacker replaying requests against the server.
- **[Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)**: Enables the client to confirm they are connected to the legitimate server. Note that the identity of the client is not verified unless [client certificates](#client-certificates-and-mutual-tls) are employed.

#### SSL vs TLS

Secure Socket Layer (SSL) was the original protocol that was used to provide encryption for HTTP traffic, in the form of HTTPS. There were two publicly released versions of SSL - versions 2 and 3. Both of these have serious cryptographic weaknesses and should no longer be used.

For [various reasons](https://tim.dierks.org/2014/05/security-standards-and-name-changes-in.html) the next version of the protocol (effectively SSL 3.1) was named Transport Layer Security (TLS) version 1.0. Subsequently TLS versions 1.1, 1.2 and 1.3 have been released.

The terms "SSL", "SSL/TLS" and "TLS" are frequently used interchangeably, and in many cases "SSL" is used when referring to the more modern TLS protocol. This cheat sheet will use the term "TLS" except where referring to the legacy protocols.

### Server Configuration

#### Only Support Strong Protocols

Web applications must default to **TLS 1.3** and may support TLS 1.2 for compatibility. **TLS 1.0 and TLS 1.1 are formally deprecated by [RFC 8996](https://datatracker.ietf.org/doc/html/rfc8996) (March 2021) and must be disabled.** They are also forbidden by [PCI DSS](https://www.pcisecuritystandards.org/documents/Migrating-from-SSL-Early-TLS-Info-Supp-v1_1.pdf), disallowed by NIST SP 800-52 Rev. 2, and removed from all mainstream browsers. SSLv2 and SSLv3 must always be disabled.

If interoperability with end-of-life clients is a hard business requirement, isolate them on a dedicated endpoint with no access to sensitive data — do not weaken the primary endpoint. The ["TLS_FALLBACK_SCSV" extension](https://tools.ietf.org/html/rfc7507) should be enabled to prevent protocol downgrade attacks.

#### Only Support Strong Ciphers

There are a large number of different ciphers (or cipher suites) that are supported by TLS, that provide varying levels of security.

For TLS 1.3, use the standard AEAD cipher suites (AES‑GCM or ChaCha20‑Poly1305).

If TLS 1.2 is still required, prefer AEAD‑based suites there as well and avoid CBC‑mode ciphers. At a minimum, the following types of [ciphersuites](https://ciphersuite.info/) should always be disabled:

- Null ciphers;
- Anonymous ciphers (`TLS_*_anon_*`);
- EXPORT ciphers (`TLS_*_EXPORT_*`);
- RSA key transport (`TLS_RSA_*`) and static Diffie-Hellman key agreement (`TLS_DH_*`, `TLS_ECDH_*`), which [do not provide forward secrecy](https://www.rfc-editor.org/rfc/rfc9325.html#section-4.1).

For TLS 1.2, prefer [ECDHE cipher suites with authenticated encryption](https://www.rfc-editor.org/rfc/rfc9325.html#section-4.2). Ephemeral Diffie-Hellman provides forward secrecy; finite-field DHE suites (`TLS_DHE_*`) are nevertheless discouraged in TLS 1.2 because of construction and parameter-negotiation weaknesses, as explained in [RFC 9325 Section 4.1](https://www.rfc-editor.org/rfc/rfc9325.html#section-4.1).

The Mozilla Foundation provides an [easy-to-use secure configuration generator](https://ssl-config.mozilla.org/) for web, database and mail servers. This tool allows site administrators to select the software they are using and receive a configuration file that is optimized to balance security and compatibility for a wide variety of browser versions and server software.

#### Set the appropriate Diffie-Hellman groups

The practice of earlier than TLS 1.3 protocol versions of Diffie-Hellman parameter generation for use by the ephemeral Diffie-Hellman key exchange (signified by the "DHE" or "EDH" strings in the cipher suite name) had practical issues. For example, the client had no say in the selection of server parameters, meaning it could only unconditionally accept or drop, and the random parameter generation often resulted to denial of service attacks (CVE-2022-40735, CVE-2002-20001).

The `supported_groups` extension is used to negotiate which Diffie-Hellman group are supported:

- the available Finite Field Diffie-Hellman groups are `ffdhe2048`, `ffdhe3072`, `ffdhe4096`, `ffdhe6144`, `ffdhe8192` as specified in [RFC7919](https://www.rfc-editor.org/rfc/rfc7919);
- Elliptic Curve Diffie-Hellman groups include `x25519`, `prime256v1`, `x448`, `secp384r1`;
- for post-quantum cryptography, `X25519MLKEM768` it currently used (though it is not a group, proper).

For OpenSSL, the list of enabled groups can be configured ins in `openssl.cnf`. For example

```text
openssl_conf = openssl_init
[openssl_init]
ssl_conf = ssl_module
[ssl_module]
system_default = tls_system_default
[tls_system_default]
Groups = X25519MLKEM768:x25519:prime256v1:x448:ffdhe2048:ffdhe3072
```

An Apache configuration would look like

```text
SSLOpenSSLConfCmd Curves X25519MLKEM768:X25519:prime256v1:secp384r1
```

The same group on NGINX would look like the following

```text
ssl_ecdh_curve X25519MLKEM768:X25519:prime256v1:secp384r1;
```

For TLS 1.2 or earlier versions it is recommended not to set Diffie-Hellman parameters.

#### Disable Compression

TLS compression should be disabled in order to protect against a vulnerability (nicknamed [CRIME](https://threatpost.com/crime-attack-uses-compression-ratio-tls-requests-side-channel-hijack-secure-sessions-091312/77006/)) which could potentially allow sensitive information such as session cookies to be recovered by an attacker.

#### Patch Cryptographic Libraries

As well as the vulnerabilities in the SSL and TLS protocols, there have also been a large number of historic vulnerability in SSL and TLS libraries, with [Heartbleed](https://heartbleed.com) being the most well known. As such, it is important to ensure that these libraries are kept up to date with the latest security patches.

#### Test the Server Configuration

Once the server has been hardened, the configuration should be tested. The [OWASP Testing Guide chapter on SSL/TLS Testing](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/09-Testing_for_Weak_Cryptography/01-Testing_for_Weak_Transport_Layer_Security) contains further information on testing.

There are a number of online tools that can be used to quickly validate the configuration of a server, including:

- [SSL Labs Server Test](https://www.ssllabs.com/ssltest)
- [CryptCheck](https://cryptcheck.fr/)
- [Hardenize](https://www.hardenize.com/)
- [ImmuniWeb](https://www.immuniweb.com/ssl/)
- [Observatory by Mozilla](https://observatory.mozilla.org)
- [Scanigma](https://scanigma.com)
- [Stellastra](https://stellastra.com/tls-cipher-suite-check)
- [OWASP PurpleTeam](https://purpleteam-labs.com/) `cloud`

Additionally, there are a number of offline tools that can be used:

- [O-Saft - OWASP SSL advanced forensic tool](https://wiki.owasp.org/index.php/O-Saft)
- [CipherScan](https://github.com/mozilla/cipherscan)
- [CryptoLyzer](https://gitlab.com/coroner/cryptolyzer)
- [SSLScan - Fast SSL Scanner](https://github.com/rbsec/sslscan)
- [SSLyze](https://github.com/nabla-c0d3/sslyze)
- [testssl.sh - Testing any TLS/SSL encryption](https://testssl.sh)
- [tls-scan](https://github.com/prbinu/tls-scan)
- [OWASP PurpleTeam](https://purpleteam-labs.com/) `local`

### Certificates

#### Use Strong Keys and Protect Them

The private key used to generate the cipher key must be sufficiently strong for the anticipated lifetime of the private key and corresponding certificate. The current best practice is to select a key size of at least 2048 bits when using RSA keys. Additional information on key lifetimes and comparable key strengths can be found [here](http://www.keylength.com/en/compare/) and in [NIST SP 800-57](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf).

The private key should also be protected from unauthorized access using filesystem permissions and other technical and administrative controls.

#### Use Strong Cryptographic Hashing Algorithms

Certificates should use SHA-256 for the hashing algorithm, rather than the older MD5 and SHA-1 algorithms. These have a number of cryptographic weaknesses, and are not trusted by modern browsers.

#### Use Correct Domain Names

The domain name (or subject) of the certificate must match the fully qualified name of the server that presents the certificate. Historically this was stored in the `commonName` (CN) attribute of the certificate. However, modern versions of Chrome ignore the CN attribute, and require that the FQDN is in the `subjectAlternativeName` (SAN) attribute. For compatibility reasons, certificates should have the primary FQDN in the CN, and the full list of FQDNs in the SAN.

Additionally, when creating the certificate, the following should be taken into account:

- Consider whether the "www" subdomain should also be included.
- Do not include non-qualified hostnames.
- Do not include IP addresses.
- Do not include internal domain names on externally facing certificates.
    - If a server is accessible using both internal and external FQDNs, configure it with multiple certificates.

#### Carefully Consider the use of Wildcard Certificates

Wildcard certificates can be convenient, however they violate [the principle of least privilege](https://wiki.owasp.org/index.php/Least_privilege), as a single certificate is valid for all subdomains of a domain (such as *.example.org). Where multiple systems are sharing a wildcard certificate, the likelihood that the private key for the certificate is compromised increases, as the key may be present on multiple systems. Additionally, the value of this key is significantly increased, making it a more attractive target for attackers.

The issues around the use of wildcard certificates are complicated, and there are [various](https://blog.sean-wright.com/wildcard-certs-not-quite-the-star/) other [discussions](https://gist.github.com/joepie91/7e5cad8c0726fd6a5e90360a754fc568) of them online.

When risk assessing the use of wildcard certificates, the following areas should be considered:

- Only use wildcard certificates where there is a genuine need, rather than for convenience.
    - Consider the use of the [ACME](https://en.wikipedia.org/wiki/Automated_Certificate_Management_Environment) to allow systems to automatically request and update their own certificates instead.
- Never use a wildcard certificates for systems at different trust levels.
    - Two VPN gateways could use a shared wildcard certificate.
    - Multiple instances of a web application could share a certificate.
    - A VPN gateway and a public web server **should not** share a wildcard certificate.
    - A public web server and an internal server **should not** share a wildcard certificate.
- Consider the use of a reverse proxy server which performs TLS termination, so that the wildcard private key is only present on one system.
- A list of all systems sharing a certificate should be maintained to allow them all to be updated if the certificate expires or is compromised.
- Limit the scope of a wildcard certificate by issuing it for a subdomain (such as `*.foo.example.org`), or a for a separate domain.

#### Use an Appropriate Certification Authority for the Application's User Base

In order to be trusted by users, certificates must be signed by a trusted certificate authority (CA). For Internet facing applications, this should be one of the CAs which are well-known and automatically trusted by operating systems and browsers.

The [LetsEncrypt](https://letsencrypt.org) CA provides free domain validated SSL certificates, which are trusted by all major browsers. As such, consider whether there are any benefits to purchasing a certificate from a CA.

For internal applications, an internal CA can be used. This means that the FQDN of the certificate will not be exposed (either to an external CA, or publicly in certificate transparency lists). However, the certificate will only be trusted by users who have imported and trusted the internal CA certificate that was used to sign them.

#### Use CAA Records to Restrict Which CAs can Issue Certificates

Certification Authority Authorization (CAA) DNS records can be used to define which CAs are permitted to issue certificates for a domain. The records contains a list of CAs, and any CA who is not included in that list should refuse to issue a certificate for the domain. This can help to prevent an attacker from obtaining unauthorized certificates for a domain through a less-reputable CA. Where it is applied to all subdomains, it can also be useful from an administrative perspective by limiting which CAs administrators or developers are able to use, and by preventing them from obtaining unauthorized wildcard certificates.

#### Consider the Certificate’s Validation Type

Certificates come in different types of validation. Validation is the process the Certificate Authority (CA) uses to make sure you are allowed to have the certificate. This is authorization. The [CA/Browser Forum](https://cabforum.org/working-groups/server/baseline-requirements/documents/) is an organization made of CA and browser vendors, as well as others with an interest in web security. They set the rules which CAs must follow based on the validation type. The base validation is called Domain Validated (DV). All publicly issued certificates must be domain validated. This process involves practical proof of control of the name or endpoint requested in the certificate. This usually involves a challenge and response in DNS, to an official email address, or to the endpoint that will get the certificate.

Organization Validated (OV) certificates include the requestor’s organization information in the certificates subject. E.g. C = GB, ST = Manchester, **O = Sectigo Limited**, CN = sectigo.com. The process to acquire an OV certificate requires official contact with the requesting company via a method that proves to the CA that they are truly talking to the right company.

Extended validation (EV) certificates provide an even higher level of verification as well as all the DV and OV verifications. This can effectively be viewed as the difference between "This site is really run by Example Company Inc." vs "This domain is really example.org". [Latest Extended Validation Guidelines](https://cabforum.org/working-groups/server/extended-validation/guidelines/)

Historically these displayed differently in the browser, often showing the company name or a green icon or background in the address bar. However, as of 2019 no major browser shows EV status like this as they do not believe that EV certificates provide any additional protection. ([Chromium](https://groups.google.com/a/chromium.org/forum/m/#!msg/security-dev/h1bTcoTpfeI/jUTk1z7VAAAJ) Covering Chrome, Edge, Brave, and Opera. [Firefox](https://groups.google.com/forum/m/?fromgroups&hl=en#!topic/firefox-dev/6wAg_PpnlY4) [Safari](https://cabforum.org/2018/06/06/minutes-of-the-f2f-44-meeting-in-london-england-6-7-june-2018/#apple-root-program-update))

As all browsers and TLS stacks are unaware of the difference between DV, OV, and EV certificates, they are effectively the same in terms of security. An attacker only needs to reach the level of practical control of the domain to get a rogue certificate.  The extra work for an attacker to get an OV or EV certificate in no way increases the scope of an incident. In fact, those actions would likely mean detection. The additional pain in getting OV and EV certificates may create an availability risk and their use should be reviewed with this in mind.

### Application

#### Use TLS For All Pages

TLS should be used for all pages, not just those that are considered sensitive such as the login page. If there are any pages that do not enforce the use of TLS, these could give an attacker an opportunity to sniff sensitive information such as session tokens, or to inject malicious JavaScript into the responses to carry out other attacks against the user.

For public facing applications, it may be appropriate to have the web server listening for unencrypted HTTP connections on port 80, and then immediately redirecting them with a permanent redirect (HTTP 301) in order to provide a better experience to users who manually type in the domain name. This should then be supported with the [HTTP Strict Transport Security (HSTS)](#use-http-strict-transport-security) header to prevent them accessing the site over HTTP in the future.

API-only endpoints should disable HTTP altogether and only support encrypted connections. When that is not possible, API endpoints should fail requests made over unencrypted HTTP connections instead of redirecting them.

#### Do Not Mix TLS and Non-TLS Content

A page that is available over TLS should not include any resources (such as JavaScript or CSS) files which are loaded over unencrypted HTTP. These unencrypted resources could allow an attacker to sniff session cookies or inject malicious code into the page. Modern browsers will also block attempts to load active content over unencrypted HTTP into secure pages.

#### Use the "Secure" Cookie Flag

All cookies should be marked with the "[Secure](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Secure_and_HttpOnly_cookies)" attribute, which instructs the browser to only send them over encrypted HTTPS connections, in order to prevent them from being sniffed from an unencrypted HTTP connection. This is important even if the website does not listen on HTTP (port 80), as an attacker performing an active man in the middle attack could present a spoofed web server on port 80 to the user in order to steal their cookie.

#### Prevent Caching of Sensitive Data

Although TLS provides protection of data while it is in transit, it does not provide any protection for data once it has reached the requesting system. As such, this information may be stored in the cache of the user's browser, or by any intercepting proxies which are configured to perform TLS decryption.

Where sensitive data is returned in responses, HTTP headers should be used to instruct the browser and any proxy server not to cache the information, in order to prevent it being stored or returned to other users. For modern HTTP/1.1+ clients and intermediaries, a single header is sufficient:

```text
Cache-Control: no-store
```

`no-store` is the strongest cache directive: it forbids both shared and private caches from storing any part of the response. The legacy combination `Cache-Control: no-cache, no-store, must-revalidate` plus `Pragma: no-cache` and `Expires: 0` is only required if you must support pre-HTTP/1.1 caches (effectively obsolete in 2024+) and adds no protection beyond `no-store` on a modern stack. Note that `Cache-Control` governs the HTTP cache; it does not control whether the browser stores cookies in its cookie jar — that is controlled by the cookie attributes (`Max-Age`, `Expires`, `Session`).

If you also need to clear data already cached on the client at sign-out, additionally send [`Clear-Site-Data`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Clear-Site-Data) (e.g. `Clear-Site-Data: "cache", "cookies", "storage"`).

#### Use HTTP Strict Transport Security

HTTP Strict Transport Security (HSTS) instructs the user's browser to always request the site over HTTPS, and also prevents the user from bypassing certificate warnings. See the [HTTP Strict Transport Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html) for further information on implementing HSTS.

#### Client Certificates and Mutual TLS

A typical TLS connection authenticates the server, while mutual TLS (mTLS) also authenticates the client using a client certificate and proof of its private key. In TLS 1.3, this proof is bound to the handshake transcript by [CertificateVerify](https://www.rfc-editor.org/rfc/rfc8446.html#section-4.4.3). This [channel binding](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/#verifimpers) prevents an intermediary from relaying the client's authentication onto a separate TLS connection to the legitimate server.

TLS provides [confidentiality between its endpoints](https://www.rfc-editor.org/rfc/rfc8446.html#section-1); mTLS does not make data confidential from a TLS endpoint whose server certificate the client accepts. If the client accepts an attacker's certificate for the target domain, the attacker can read application data sent to that endpoint, even when the client uses a certificate. Validate the server's identity and trust configuration independently; see [Public Key Pinning](#public-key-pinning) for applications that need to restrict server trust further.

Challenges and Considerations

Client certificates are rarely used in public systems due to several challenges:

- Issuing and managing client certificates involves significant administrative overhead.
- Non-technical users may find installing client certificates difficult.
- Organizations' TLS decryption practices can cause client certificate authentication, a key component of mTLS, to fail.

Despite these challenges, client certificates and mTLS should be considered for high-value applications or APIs, particularly where users are technically sophisticated or part of the same organization.

#### Public Key Pinning

Public key pinning can be used to provides assurance that the server's certificate is not only valid and trusted, but also that it matches the certificate expected for the server. This provides protection against an attacker who is able to obtain a valid certificate, either by exploiting a weakness in the validation process, compromising a trusted certificate authority, or having administrative access to the client.

Public key pinning was added to browsers in the HTTP Public Key Pinning (HPKP) standard. However, due to a number of issues, it has subsequently been deprecated and is no longer recommended or [supported by modern browsers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Public-Key-Pins).

However, public key pinning can still provide security benefits for mobile applications, thick clients and server-to-server communication. This is discussed in further detail in the [Pinning Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Pinning_Cheat_Sheet.html).

## Pinning

> **Source:** [Pinning](https://cheatsheetseries.owasp.org/cheatsheets/Pinning_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

The Pinning Cheat Sheet is a technical guide to implementing certificate and public key pinning as discussed by Jeffrey Walton at the Virginia chapter's presentation [Securing Wireless Channels in the Mobile Space](https://wiki.owasp.org/images/8/8f/Securing-Wireless-Channels-in-the-Mobile-Space.ppt). This guide is focused on providing clear, simple, actionable guidance for securing the channel in a hostile environment where actors could be malicious and the conference of trust a liability.

### What's the problem

For baseline TLS configuration, see the [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html).

Users, developers, and applications expect security on their communication channels, but some channels may not meet this expectation. Channels built using well known protocols like SSL, and TLS can be vulnerable to Man-in-the-Middle (MITM) attacks if certificate-based trusts are misused. Malicious attacks come in two forms:

1. An attacker is able to acquire a rogue digital certificate from a trusted certificate authority (CA) in the name of the victim site;
2. The attacker is able to inject a dangerous CA into the client’s trust store.

In the case of the latter issue, an attacker with the access to update a trust store will have the access to change the workings of the mobile application, potentially defeating pinning.

As [Certificate and Public Key Pinning](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning) makes clear, this problem is very small due to years of security advancements by the certificate authority and browser communities.

### What Is Pinning

Pinning is the process of associating a host with their *expected* X509 certificate or public key. Once a certificate or public key is known or seen for a host, the certificate or public key is associated or 'pinned' to the host. If more than one certificate or public key is acceptable, then the program holds a *pinset* (taken from [Jon Larimer and Kenny Root Google I/O talk](https://www.youtube.com/watch?v=RPJENzweI-A)). In this case, the advertised credential must match one of the elements in the pinset.

#### When to Add a Pin

A host or service's certificate or public key can be added to an application at development time, it can be added upon first encountering the certificate or public key (an approach commonly known as “Trust On First Use”, or TOFU), or it can be added and updated in real time via an unpinned channel. The former - adding at development time - is preferred since *preloading* the certificate or public key *out-of-band* usually means the attacker cannot taint the pin.

Keep in mind that this "when" is about at what point in time you pin. The first question should be, “Should I Pin?”. The answer to this is probably never.

#### When Do You Perform Pinning

There is almost no situation where you should consider pinning. The risk of outages almost always outweighs any security risks given advances in security. If you consider pinning, you should read [Certificate and Public Key Pinning](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning) and fully understand the threat model.

#### When Do You Not Pin?

- If you don’t control the client and server side of the connection, don’t pin.
- If you can’t update the pinset securely, don’t pin.
- If updating the pinset is disruptive, such as requiring application redeployment, probably don’t pin. (A possible exception is when you control the redeployment of the application, such as in forced updates within the confines of a corporation.)
- If the certificate key pair cannot be predicted in advance before it is put into service, don’t pin.
- If it is not a native mobile application, do not pin.

#### When to Apply Exceptions

If you are working for an organization which practices "egress filtering" as part of a Data Loss Prevention (DLP) strategy, you will likely encounter *Interception Proxies*. We like to refer to these things as **"good" bad actors** (as opposed to **"bad" bad actors**) since both break end-to-end security and we can't tell them apart. In this case, **do not** offer to allow-list the interception proxy since it defeats your security goals. Add the interception proxy's public key to your pinset after being **instructed** to do so by the folks in Risk Acceptance.

#### How Do You Pin

The idea is to reuse the existing protocols and infrastructure, but use them in a hardened manner. For reuse, a program would keep doing the things it used to do when establishing a secure connection.

To harden the channel, the program would take advantage of the `OnConnect` callback offered by a library, framework or platform. In the callback, the program would verify the remote host's identity by validating its certificate or public key. See [some examples](#examples-of-pinning) below.

#### What Should Be Pinned

In order to decide what should be pinned you can follow the following steps.

1. Decide if you want to pin the root CA, intermediate CA or leaf certificate:

- Pinning the **root CA** is generally not recommended since it highly increases the risk because it implies also trusting all its intermediate CAs.
- Pinning a specific **issuing or intermediate CA** reduces the risk but the application will be also trusting any other certificates issued by that CA or sub-CAs, not only the ones meant for your application.
- Pinning a **leaf certificate** is recommended but must include backup (e.g. intermediate CA or a pinset containing alternates). This provides 100% certainty that the app exclusively trusts the remote hosts it was designed to connect to while adding resiliency for failover or certificate rotation.

For example, the application pins the remote endpoint leaf certificate but includes a backup pin for the intermediate CA. This increases the risk by trusting more certificate authorities but decreases the chances of bricking your app. If there's any issue with the leaf certificate, the app can always fall back to the intermediate CA until you release an app update.

2. Choose if you want to pin the **whole certificate** or just its **public key**.

3. If you chose the public key, you have two additional choices:

- Pin the `subjectPublicKeyInfo`.
- Pin one of the concrete types such as `RSAPublicKey` or `DSAPublicKey`.

The three choices are explained below in more detail. You are encouraged to pin the `subjectPublicKeyInfo` because it has the public parameters (such as `{e,n}` for an RSA public key) **and** contextual information such as an algorithm and OID. The context will help you keep your bearings at times, and the figure to the right shows the additional information available.

##### Certificate

The certificate is easiest to pin. You can fetch the certificate out of band for the website, have the IT folks email your company certificate to you, use `openssl s_client` to retrieve the certificate, etc. At runtime, you can retrieve the website or server's certificate in a callback. Within the callback, you compare the retrieved certificate with the certificate embedded within the program. If the comparison fails, then fail the method or function, log it on the client-side and alert the end user. If your threat model warrants pinning, understand that users will click past any warnings, so do not give the user an option to proceed and bypass the pin.

**Benefits:**

- It might be easier to implement than the other methods, especially in languages such as Cocoa/CocoaTouch and OpenSSL.

**Downsides:**

- If the site rotates its certificate on a regular basis, then your application would need to be updated regularly. If you do not control when this certificate is put into service, then pinning will lead to an outage.

##### Public Key

Public key pinning is more flexible but a little trickier due to the extra steps necessary to extract the public key from a certificate. As with a certificate, the program checks the extracted public key with its embedded copy of the public key. Given that most certificates today are only good for 90 days, using public key pinning can also make the timeline for updating pinsets longer, as you can pin a key where the certificate has not even been issued yet.

**Benefits:**

- It allows access to public key parameters (such as `{e,n}` for an RSA public key) and contextual information such as an algorithm and OID.
- It's more flexible than certificate pinning. The pin can be calculated long before the certificate is issued and if policy allows, the certificate can be renewed with the same key to avoid breaking pinning. The latter is a bad key management practice and should only be used in an emergency.

**Downsides:**

- It can be harder to work with keys (versus certificates) since you must extract the key from the certificate. Extraction is a minor inconvenience in Java and .Net, but it's uncomfortable in the iOS Cocoa/CocoaTouch framework and OpenSSL.
- Some service providers generate new keys upon renewal making pre-caching impossible.

##### Hash

While the three choices above used DER encoding, it's also acceptable to use a hash of the information. In fact, the original sample programs were written using digested certificates and public keys. The samples were changed to allow a programmer to inspect the objects with tools like `dumpasn1` and other ASN.1 decoders.

**Benefits:**

- It's convenient to use. A digested certificate fingerprint is often available as a native API for many libraries.
- The hash is small and a fixed length.

**Downsides:**

- No access to public key parameters nor contextual information such as an algorithm and OID which might be needed in certain use cases.
- If the site rotates its certificate on a regular basis, then your application would need to be updated regularly. If you do not control when this certificate is put into service, then pinning would lead to an outage.

### Examples of Pinning

This section discusses certificate and public key pinning in Android Java, iOS, .Net, and OpenSSL. Code has been omitted for brevity, but the key points for the platform are highlighted.

#### Android

Since Android N, the preferred way for implementing pinning is by leveraging Android's [Network Security Configuration](https://developer.android.com/training/articles/security-config.html) feature, which lets apps customize their network security settings in a safe, declarative configuration file without modifying app code.

To enable pinning, [the `<pin-set>` configuration setting](https://developer.android.com/training/articles/security-config.html#CertificatePinning) can be used.

Alternatively you can use methods such as the pinning from OkHTTP in order to set specific pins programmatically, as explained in the [OWASP Mobile Security Testing Guide (MSTG)](https://github.com/OWASP/owasp-mstg/blob/master/Document/0x05g-Testing-Network-Communication.md#network-libraries-and-webviews) and [the OKHttp documentation](https://square.github.io/okhttp/3.x/okhttp/okhttp3/CertificatePinner.html).

The Android documentation provides an example of how SSL validation can be customized within the app's code (in order to implement pinning) in the [Unknown CA implementation document](https://developer.android.com/training/articles/security-ssl.html#UnknownCa). However, implementing pinning validation from scratch should be avoided, as implementation mistakes are extremely likely and usually lead to severe vulnerabilities.

Lastly, if you want to validate whether the pinning is successful, please follow instructions from the [introduction into testing network communication](https://github.com/OWASP/owasp-mstg/blob/master/Document/0x04f-Testing-Network-Communication.md#testing-network-communication) and the [Android specific network testing](https://github.com/OWASP/owasp-mstg/blob/master/Document/0x05g-Testing-Network-Communication.md) chapters of the OWASP Mobile Security Testing Guide (MSTG).

#### iOS

Apple suggests pinning a CA public key by specifying it in `Info.plist` file under [App Transport Security Settings](https://developer.apple.com/documentation/security/preventing_insecure_network_connections). More details in the article ["Identity Pinning: How to configure server certificates for your app"](https://developer.apple.com/news/?id=g9ejcf8y).

[TrustKit](https://github.com/datatheorem/TrustKit), an open-source SSL pinning library for iOS and macOS is available. It provides an easy-to-use API for implementing pinning, and has been deployed in many apps.

Otherwise, more details regarding how SSL validation can be customized on iOS (in order to implement pinning) are available in the [HTTPS Server Trust Evaluation](https://developer.apple.com/library/content/technotes/tn2232/_index.html) technical note. However, implementing pinning validation from scratch should be avoided, as implementation mistakes are extremely likely and usually lead to severe vulnerabilities.

Lastly, if you want to validate whether the pinning is successful, please follow instructions from the [introduction into testing network communication](https://github.com/OWASP/owasp-mstg/blob/master/Document/0x04f-Testing-Network-Communication.md#testing-network-communication) and the [iOS specific network testing](https://github.com/OWASP/owasp-mstg/blob/master/Document/0x06g-Testing-Network-Communication.md) chapters of the OWASP Mobile Security Testing Guide (MSTG).

#### .Net

.Net pinning can be achieved by using [`ServicePointManager`](https://docs.microsoft.com/en-us/dotnet/api/system.net.servicepointmanager?view=netframework-4.7.2). An example can be found at the [OWASP MSTG](https://github.com/OWASP/owasp-mstg/blob/master/Document/0x05g-Testing-Network-Communication.md#xamarin-applications).

Download the [.Net sample program](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Pinning_Cheat_Sheet_Certificate_DotNetSample.zip).

#### OpenSSL

Pinning can occur at one of two places with OpenSSL. First is the user supplied `verify_callback`. Second is after the connection is established via `SSL_get_peer_certificate`. Either method will allow you to access the peer's certificate.

Though OpenSSL performs the X509 checks, you must fail the connection and tear down the socket on error. By design, a server that does not supply a certificate will result in `X509_V_OK` with a **NULL** certificate. To check the result of the customary verification:

1. You must call `SSL_get_verify_result` and verify the return code is `X509_V_OK`;
2. You must call `SSL_get_peer_certificate` and verify the certificate is **non-NULL**.

Download: [OpenSSL sample program](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Pinning_Cheat_Sheet_Certificate_OpenSSLSample.zip).

#### Electron

[electron-ssl-pinning](https://github.com/dialogs/electron-ssl-pinning), an open-source SSL pinning library for [Electron](https://electronjs.org) based applications. It provides an easy-to-use API for implementing pinning and also provides a tool for fetching configuration based on needed hosts.

Otherwise, you can validate certificates by yourself using [ses.setCertificateVerifyProc(proc)](https://electronjs.org/docs/api/session#sessetcertificateverifyprocproc).

## Post-Quantum Cryptography

> **Source:** [Post-Quantum Cryptography](https://cheatsheetseries.owasp.org/cheatsheets/Post_Quantum_Cryptography_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Post-quantum cryptography (PQC) uses algorithms designed to resist attacks from both classical and quantum computers. A sufficiently powerful quantum computer could break [RSA, Diffie-Hellman, and elliptic curve cryptography](https://www.rfc-editor.org/rfc/rfc9794.html#section-1), affecting public-key encryption, key exchange, and digital signatures. This cheat sheet turns [PQC migration planning](https://www.ncsc.gov.uk/guidance/pqc-migration-timelines) into stages for application developers: inventory dependencies, prioritize work, adopt supported implementations, test, and roll out. Start the preparation stages even when a dependency cannot yet migrate.

### Stage 1: Inventory cryptographic dependencies

Create a [cryptographic inventory](https://pages.nist.gov/nccoe-migration-post-quantum-cryptography/FAQ/index.html#what-is-a-cryptographic-inventory) with one entry per use of cryptography. Include dependencies managed by your platform or service provider, not just direct calls in application code.

| Record | Include |
| --- | --- |
| Purpose and lifetime | Transport, stored data, key protection, or signatures; how long confidentiality or trust must last. |
| Implementation | Protocol, algorithms and parameters, library or service version, key and certificate identifiers. Store metadata, never secret key material. |
| Dependencies | Clients, servers, proxies, signing and verification services, key management services, hardware security modules, and backups. |
| Ownership | Responsible team or supplier, supported upgrade path, and components that cannot be updated. |

Map each transport connection separately, including connections from a gateway to the application. Trace how stored data's encryption keys are protected and recovered. Inventory signature verifiers as well as signers.

**Complete when:** each dependency has an owner and an identified migration path or a recorded blocker.

### Stage 2: Prioritize migration work

Prioritize data that must stay confidential for years and systems that will be difficult to update later, following the [NCSC migration planning guidance](https://www.ncsc.gov.uk/guidance/pqc-migration-timelines). Assign an owner and target date to each migration item.

- **Long-lived confidentiality:** prioritize exposed connections and stored data whose keys depend on RSA or elliptic curve cryptography. Updating encryption later cannot protect copies an adversary has already collected.
- **Long-lived trust:** plan early for software and firmware verification, trust anchors, and signed records that must remain trustworthy for years. Include the time needed to update every verifier.
- **Blocked dependencies:** request a supported release and migration plan from the supplier. Record the remaining exposure, a review date, and whether replacement is necessary.

Prefer AES-256 for additional quantum security margin, consistent with the [Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#algorithms). Use a secure encryption mode. AES-128 remains permitted: [NIST's PQC FAQ](https://csrc.nist.gov/Projects/post-quantum-cryptography/faqs) allows continued use of AES-128, AES-192, and AES-256. Check the public-key protection of encryption keys even when the data itself uses AES.

**Complete when:** the backlog separates confidentiality and signature work, with explicit decisions for dependencies that cannot yet migrate.

### Stage 3: Adopt supported implementations

Upgrade maintained libraries and platform services to implementations of standardized algorithms. Select parameters through the supported protocol and your security requirements. Algorithm support alone does not establish protocol interoperability.

| Use case | Developer action |
| --- | --- |
| Key establishment | Use a supported integration of the Module-Lattice-Based Key-Encapsulation Mechanism, [ML-KEM (FIPS 203)](https://csrc.nist.gov/pubs/fips/203/final). It establishes a shared secret for symmetric cryptography; it does not directly encrypt application data or authenticate the peer. |
| Transport | Pilot a supported classical + PQC hybrid exchange, such as [X25519MLKEM768](https://www.rfc-editor.org/rfc/rfc10024.html), following the [Transport Layer Security (TLS) Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html#set-the-appropriate-diffie-hellman-groups). Keep certificate and hostname validation enabled. |
| Signatures | Plan a separate migration using a supported signature format and verifier, such as an integration of the Module-Lattice-Based Digital Signature Algorithm, [ML-DSA (FIPS 204)](https://csrc.nist.gov/pubs/fips/204/final). Coordinate signer and verifier upgrades; follow the [JSON Web Token (JWT) guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html#public-key-signatures) for tokens. |
| Stored data | Use your provider's supported migration process for public-key protection of data keys, including existing wrapped keys. Follow the [key rotation and existing-data guidance](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html#cryptoperiods-and-rotation) and retain recovery access during migration. |

A hybrid construction combines classical and post-quantum algorithms. Use the protocol's implementation rather than constructing your own combination. [RFC 9794, Section 5](https://www.rfc-editor.org/rfc/rfc9794.html#section-5) distinguishes hybrid confidentiality from authentication: a hybrid TLS key exchange does not make classical certificate signatures quantum-resistant.

Where a supported dual-signature scheme requires both signatures, enforce both verifications. Accepting either one permits classical-only acceptance; [NIST describes dual-signature verification](https://csrc.nist.gov/Projects/post-quantum-cryptography/faqs) as requiring all component signatures to succeed. Do not append a custom signature field to an existing token or certificate format.

For signed records needing long-term proof, validate them and preserve evidence through a supported [archive timestamp and renewal process](https://www.rfc-editor.org/rfc/rfc4998.html#section-1.1) before the protecting algorithms become weak. Retaining an old verifier alone does not preserve that proof.

**Complete when:** a supported migration works in a test environment, and the team has documented which security properties it provides.

### Stage 4: Test the full application path

Test with the actual algorithms and parameter sets you will deploy. [NIST's crypto agility guidance, Sections 3.2 and 6.2](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.39-upd1.pdf) calls out larger cryptographic objects and protecting algorithm negotiation.

- Exercise real clients, proxies, gateways, and backend connections. Verify the negotiated key exchange for new connections. For [resumed TLS sessions](https://datatracker.ietf.org/doc/html/rfc9846#section-4.3.9), check the resumption mode and how the original connection and resumption secrets were protected.
- Measure handshake and verification costs under expected load. Check certificate, signature, message, and database field limits. Keep size limits explicit when increasing them.
- Test rejection of invalid signatures, untrusted certificates, and disallowed algorithms. If both signatures are required, either missing or invalid signature must cause rejection.
- Decide where classical fallback is temporarily allowed. For paths requiring PQC, verify that failures cannot silently trigger a classical-only retry.
- Test existing data, older signed artifacts, backup restoration, and key recovery before retiring old keys or formats.

**Complete when:** compatibility, rejection behavior, recovery, and rollback tests pass for the intended deployment policy.

### Stage 5: Roll out and retire temporary exceptions

Deploy to a small group of services or clients, then expand using the tests and monitoring results. Keep an approved rollback plan and explicit criteria for ending classical-only support, as recommended by the [NCSC migration guidance](https://www.ncsc.gov.uk/guidance/pqc-migration-timelines).

- Record negotiated algorithms and verification outcomes without logging secrets. Alert on unexpected classical-only use and verification failures.
- Treat a rollback to classical-only protection as a security exception with an owner and expiry date. Where PQC is required, pause the affected operation instead of silently weakening the policy.
- Track library security updates and applicable standards. Remove temporary fallback only after required peers and recovery workflows have migrated. Preserve required access to older data and signed records under an explicit legacy policy. Once PQC verification is required, restrict classical-only exceptions to identified legacy artifacts; do not use them to accept new artifacts.

**Complete when:** required paths demonstrably use the intended protection, and remaining exceptions have owners and retirement dates. Keep the inventory current as dependencies change.
