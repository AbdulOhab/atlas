---
title: "How the Web Works"
order: 1
summary: "What happens between typing a URL and getting a page back: the internet, IP addresses, domain names, web servers and HTTP."
category: "Foundations"
level: Beginner
---

# How the Web Works

Every backend sits on the same plumbing: packets over the internet, names resolved to IP addresses, a server listening on a port, and HTTP messages going back and forth. This module covers that path end to end.

**Course outline modules:** 2 (Introduction to Webservers)

## How the internet works

> **Source:** [How the internet works](https://developer.mozilla.org/en-US/docs/Learn_web_development/howto/web_mechanics/how_does_the_internet_work) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5

This article discusses what the Internet is and how it works.

<table>
  <tbody>
    <tr>
      <th scope="row">Prerequisites:</th>
      <td>
        None, but we encourage you to read the
        <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Design_and_accessibility/Thinking_before_coding"
          >Article on setting project goals</a
        >
        first
      </td>
    </tr>
    <tr>
      <th scope="row">Objective:</th>
      <td>
        You will learn the basics of the technical infrastructure of the Web and
        the difference between Internet and the Web.
      </td>
    </tr>
  </tbody>
</table>

### Summary

The **Internet** is the backbone of the Web, the technical infrastructure that makes the Web possible. At its most basic, the Internet is a large network of computers which communicate all together.

[The history of the Internet is somewhat obscure](https://en.wikipedia.org/wiki/Internet#History). It began in the 1960s as a US-army-funded research project, then evolved into a public infrastructure in the 1980s with the support of many public universities and private companies. The various technologies that support the Internet have evolved over time, but the way it works hasn't changed that much: Internet is a way to connect computers all together and ensure that, whatever happens, they find a way to stay connected.

### Videos about the Internet

- [How the internet Works in 5 minutes](https://www.youtube.com/watch?v=7_LPdttKXPc): A 5-minute video to understand the very basics of Internet by Aaron Titus.
- [How does the Internet work?](https://www.youtube.com/watch?v=x3c1ih2NJEg) Detailed well visualized 9-minute video.

### Deeper dive

#### A simple network

When two computers need to communicate, you have to link them, either physically (usually with an [Ethernet cable](https://en.wikipedia.org/wiki/Ethernet_crossover_cable)) or wirelessly (for example with [Wi-Fi](https://en.wikipedia.org/wiki/Wi-Fi) or [Bluetooth](https://en.wikipedia.org/wiki/Bluetooth) systems). All modern computers can sustain any of those connections.

> **Note:**
> For the rest of this article, we will only talk about physical cables, but wireless networks work the same.

![Two computers linked together](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/how_does_the_internet_work/internet-schema-1.png)

Such a network is not limited to two computers. You can connect as many computers as you wish. But it gets complicated quickly. If you're trying to connect, say, ten computers, you need 45 cables, with nine plugs per computer!

![Ten computers all together](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/how_does_the_internet_work/internet-schema-2.png)

To solve this problem, each computer on a network is connected to a special tiny computer called a _network switch_ (or _switch_ for short). This switch has only one job: like a signaler at a railway station, it forwards messages toward their intended recipients. To send a message to computer B, computer A sends the message to the switch, which in turn forwards the message to computer B.

Once we add a switch to the system, our network of 10 computers only requires 10 cables: a single plug for each computer and a switch with 10 plugs.

![Ten computers with a switch](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/how_does_the_internet_work/internet-schema-3.png)

To tell computers apart, the switch uses _MAC addresses_, which identify network interfaces for delivery within the local network. MAC addresses are like fingerprints; they are typically assigned by the manufacturer, but software can also assign or change them (common today for privacy reasons). Each message carries the sender's and recipient's MAC addresses. The switch reads the sender's address and remembers which connection the message arrived from, so it knows where to forward future messages addressed to that sender. If it hasn't yet learned where a recipient is, it forwards the message through all its other connections. When the recipient sends a message back, the switch learns its location too.

#### A network of networks

So far so good. But what about connecting hundreds, thousands, billions of computers? Of course a single switch can't scale that far, but, if you read carefully, we said that a switch is a computer like any other, so what keeps us from connecting two switches together? Nothing, so let's do that.

![Two switches linked together](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/how_does_the_internet_work/internet-schema-4.png)

You may imagine that we can connect switches together infinitely, to form a network like this:

![Switches linked to switches](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/how_does_the_internet_work/internet-schema-5.png)

Connecting switches this way extends a single local network. Each switch has an extensive map of which connection to use for each MAC address in its local network. If you connected ten billion computers in this network, each switch would need to remember up to ten billion MAC addresses. Whenever the recipient's address is unknown (or it has been deleted due to inactivity), switches must broadcast the message to all computers on the local network. As the network grows, it becomes increasingly costly to keep track of individual devices and find unknown recipients.

The key problem is that our addresses have no hierarchy and don't correspond to the network structure—it's like trying to figure out who to deliver mail to by comparing each person's fingerprint. To fix this problem, we divide computers into separate local networks and connect these networks using a device called a _router_. It uses a different kind of address, an _IP address_, which is a 4-number sequence like `142.250.190.78`. Unlike MAC addresses, which are "fingerprints", IP addresses are "street addresses" and are assigned when a computer connects to a network, identified in the IP address by a shared _prefix_. A router can therefore store forwarding instructions for a whole group of addresses (e.g., "forward to this router whenever the IP address starts with `142.250`") without learning the location of every individual computer in that group.

> **Note:**
> You may wonder why we need MAC addresses and switches, if IP addresses and routers can also do end-to-end networking. Switches have many practical benefits. One is that a switched local network lets a device keep the same IP address as it moves between connections within that network (like between two Wi-Fi access points): the switch relearns which connection your MAC address is on, so your IP address — and any connections already using it — keep working. Another is that routers need MAC addresses themselves: to pass a packet to the next router along the way, a router must still identify which device on the shared network should receive it.

Such a network comes very close to what we call the Internet. We just need the physical medium (cables) to connect all these routers. Luckily, such an infrastructure already existed prior to the Internet, and that's the telephone network. To connect our network to the telephone infrastructure, we need a special piece of equipment called a _modem_. This _modem_ turns the information from our network into information manageable by the telephone infrastructure and vice versa.

![A router linked to a modem](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/how_does_the_internet_work/internet-schema-6.png)

Note that the commercial router in your home is likely a combination of a switch, a router, and a modem, all in one device.

So we are connected to the telephone infrastructure. The next step is to send the messages from our network to the network we want to reach. To do that, we will connect our network to an Internet Service Provider (ISP). An ISP is a company that manages some special _routers_ that are all linked together and can also access other ISPs' routers. So the message from our network is carried through the network of ISP networks to the destination network. The Internet consists of this whole infrastructure of networks.

![Full Internet stack](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/how_does_the_internet_work/internet-schema-7.png)

#### Domain names

IP addresses are perfectly fine for computers, but we human beings have a hard time remembering that sort of address. To make things easier, we can alias an IP address with a human-readable name called a _domain name_. For example (at the time of writing; IP addresses can change) `google.com` is the domain name used on top of the IP address `142.250.190.78`. So using the domain name is the easiest way for us to reach a computer over the Internet.

![Show how a domain name can alias an IP address](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/how_does_the_internet_work/dns-ip.png)

#### Internet and the web

As you might notice, when we browse the Web with a Web browser, we usually use the domain name to reach a website. Does that mean the Internet and the Web are the same thing? It's not that simple. As we saw, the Internet is a technical infrastructure which allows billions of computers to be connected all together. Among those computers, some computers (called _Web servers_) can send messages intelligible to web browsers. The _Internet_ is an infrastructure, whereas the _Web_ is a service built on top of the infrastructure. It is worth noting there are several other services built on top of the Internet, such as email and IRC.

#### Intranets and Extranets

Intranets are _private_ networks that are restricted to members of a particular organization.
They are commonly used to provide a portal for members to securely access shared resources, collaborate and communicate.
For example, an organization's intranet might host web pages for sharing department or team information, shared drives for managing key documents and files,
portals for performing business administration tasks, and collaboration tools like wikis, discussion boards, and messaging systems.

Extranets are very similar to Intranets, except they open all or part of a private network to allow sharing and collaboration with other organizations.
They are typically used to safely and securely share information with clients and stakeholders who work closely with a business.
Often their functions are similar to those provided by an intranet: information and file sharing, collaboration tools, discussion boards, etc.

Both intranets and extranets run on the same kind of infrastructure as the Internet, and use the same protocols.
They can therefore be accessed by authorized members from different physical locations.

![Graphical Representation of how Extranet and Intranet work](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/how_does_the_internet_work/internet-schema-8.png)

### Next steps

- [How the Web works](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works)
- [Understanding the difference between a web page, a website, a web server and a search engine](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Browsing_the_web)
- [Understanding domain names](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name)

## Domain names

> **Source:** [Domain names](https://developer.mozilla.org/en-US/docs/Learn_web_development/howto/web_mechanics/what_is_a_domain_name) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5

<table>
  <tbody>
    <tr>
      <th scope="row">Prerequisites:</th>
      <td>
        First you need to know
        <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work"
          >how the Internet works</a
        >
        and understand
        <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL"
          >what URLs are</a
        >.
      </td>
    </tr>
    <tr>
      <th scope="row">Objective:</th>
      <td>
        Learn what domain names are, how they work, and why they are important.
      </td>
    </tr>
  </tbody>
</table>

### Summary

Domain names are a key part of the Internet infrastructure. They provide a human-readable address for any web server available on the Internet.

Any Internet-connected computer can be reached through a public IP Address, either an IPv4 address (e.g., `192.0.2.172`) or an IPv6 address (e.g., `2001:db8:8b73:0000:0000:8a2e:0370:1337`).

Computers can handle such addresses easily, but people have a hard time finding out who is running the server or what service the website offers. IP addresses are hard to remember and might change over time.

To solve all those problems we use human-readable addresses called domain names.

### Deeper dive

#### Structure of domain names

A domain name has a simple structure made of several parts (it might be one part only, two, three…), separated by dots and **read from right to left**:

![Anatomy of the MDN domain name](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/what_is_a_domain_name/structure.png)

Each of those parts provides specific information about the whole domain name.

- TLD (Top-Level Domain).
  - : TLDs tell users the general purpose of the service behind the domain name. The most generic TLDs (`.com`, `.org`, `.net`) don't require web services to meet any particular criteria, but some TLDs enforce stricter policies so it is clearer what their purpose is. For example:
    - Local TLDs such as `.us`, `.fr`, or `.se` can require the service to be provided in a given language or hosted in a certain country — they are supposed to indicate a resource in a particular language or country.
    - TLDs containing `.gov` are only allowed to be used by government departments.
    - The `.edu` TLD is only for use by educational and academic institutions.

    TLDs can contain special as well as latin characters. A TLD's maximum length is 63 characters, although most are around 2–3.

    The full list of TLDs is [maintained by ICANN](https://www.icann.org/en/contracted-parties/registry-operators/resources/list-of-top-level-domains).

- Label (or component)
  - : The labels are what follow the TLD. A label is a case-insensitive character sequence anywhere from one to sixty-three characters in length, containing only the letters `A` through `Z`, digits `0` through `9`, and the '-' character (which may not be the first or last character in the label). `a`, `97`, and `hello-strange-person-16-how-are-you` are all examples of valid labels.

    The label located right before the TLD is also called a _Secondary Level Domain_ (SLD).

    A domain name can have many labels (or components). It is not mandatory nor necessary to have 3 labels to form a domain name. For instance, [informatics.ed.ac.uk](https://informatics.ed.ac.uk/) is a valid domain name. For any domain you control (e.g., [mozilla.org](https://www.mozilla.org/en-US/)), you can create "subdomains" with different content located at each, like [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/), [support.mozilla.org](https://support.mozilla.org/), or [bugzilla.mozilla.org](https://bugzilla.mozilla.org/).

#### Buying a domain name

##### Who owns a domain name?

You cannot "buy a domain name". This is so that unused domain names eventually become available to be used again by someone else. If every domain name was bought, the web would quickly fill up with unused domain names that were locked and couldn't be used by anyone.

Instead, you pay for the right to use a domain name for one or more years. You can renew your right, and your renewal has priority over other people's applications. But you never own the domain name.

Companies called registrars use domain name registries to keep track of technical and administrative information connecting you to your domain name.

> **Note:**
> For some domain name, it might not be a registrar which is in charge of keeping track. For instance, every domain name under `.fire` is managed by Amazon.

##### Finding an available domain name

To find out whether a given domain name is available,

- Go to a domain name registrar's website. Most of them provide a "whois" service that tells you whether a domain name is available.
- Alternatively, if you use a system with a built-in shell, type a `whois` command into it, as shown here for `mozilla.org`:

  ```bash
  whois mozilla.org
  ```

  This will output the following:

  ```plain
  Domain Name:MOZILLA.ORG
  Domain ID: D1409563-LROR
  Creation Date: 1998-01-24T05:00:00Z
  Updated Date: 2013-12-08T01:16:57Z
  Registry Expiry Date: 2015-01-23T05:00:00Z
  Sponsoring Registrar:MarkMonitor Inc. (R37-LROR)
  Sponsoring Registrar IANA ID: 292
  WHOIS Server:
  Referral URL:
  Domain Status: clientDeleteProhibited
  Domain Status: clientTransferProhibited
  Domain Status: clientUpdateProhibited
  Registrant ID:mmr-33684
  Registrant Name:DNS Admin
  Registrant Organization:Mozilla Foundation
  Registrant Street: 650 Castro St Ste 300
  Registrant City:Mountain View
  Registrant State/Province:CA
  Registrant Postal Code:94041
  Registrant Country:US
  Registrant Phone:+1.6509030800
  ```

As you can see, I can't register `mozilla.org` because the Mozilla Foundation has already registered it.

On the other hand, let's see if I could register `afunkydomainname.org`:

```bash
whois afunkydomainname.org
```

This will output the following (at the time of writing):

```plain
NOT FOUND
```

As you can see, the domain does not exist in the `whois` database, so we could ask to register it. Good to know!

##### Getting a domain name

The process is quite straightforward:

1. Go to a registrar's website.
2. Usually there is a prominent "Get a domain name" call to action. Click on it.
3. Fill out the form with all required details. Make sure, especially, that you have not misspelled your desired domain name. Once it's paid for, it's too late!
4. The registrar will let you know when the domain name is properly registered. Within a few hours, all DNS servers will have received your DNS information.

> **Note:**
> In this process the registrar asks you for your real-world address. Make sure you fill it properly, since in some countries registrars may be forced to close the domain if they cannot provide a valid address.

##### DNS refreshing

DNS databases are stored on every DNS server worldwide, and all these servers refer to a few special servers called "authoritative name servers" or "top-level DNS servers" — these are like the boss servers that manage the system.

Whenever your registrar creates or updates any information for a given domain, the information must be refreshed in every DNS database. Each DNS server that knows about a given domain stores the information for some time before it is automatically invalidated and then refreshed (the DNS server queries an authoritative server and fetches the updated information from it). Thus, it takes some time for DNS servers that know about this domain name to get the up-to-date information.

#### How does a DNS request work?

As we already saw, when you want to display a webpage in your browser it's easier to type a domain name than an IP address. Let's take a look at the process:

1. Type `mozilla.org` in your browser's location bar.
2. Your browser asks your computer if it already recognizes the IP address identified by this domain name (using a local DNS cache). If it does, the name is translated to the IP address and the browser negotiates contents with the web server. End of story.
3. If your computer does not know which IP is behind the `mozilla.org` name, it goes on to ask a DNS server, whose job is precisely to tell your computer which IP address matches each registered domain name.
4. Now that the computer knows the requested IP address, your browser can negotiate contents with the web server.

![Explanation of the steps needed to obtain the result to a DNS request](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/what_is_a_domain_name/2014-10-dns-request2.png)

### Next steps

Okay, we talked a lot about processes and architecture. Time to move on.

- If you want to get hands-on, it's a good time to start digging into design and explore [the anatomy of a web page](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Design_and_accessibility/Common_web_layouts).
- It's also worth noting that some aspects of building a website cost money. Please refer to [how much it costs to build a website](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/How_much_does_it_cost).
- Or read more about [Domain Names](https://en.wikipedia.org/wiki/Domain_name) on Wikipedia.
- The [How DNS works](https://howdns.works/) tutorial has a fun and colorful explanation.

## What is a web server

> **Source:** [What is a web server](https://developer.mozilla.org/en-US/docs/Learn_web_development/howto/web_mechanics/what_is_a_web_server) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5

In this article, we explain what web servers are, how web servers work, and why they are important.

<table>
  <tbody>
    <tr>
      <th scope="row">Prerequisites:</th>
      <td>
        You should already know
        <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work"
          >how the Internet works</a
        >, and
        <a
          href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Browsing_the_web"
          >understand the difference between a web page, a website, a web
          server, and a search engine</a
        >.
      </td>
    </tr>
    <tr>
      <th scope="row">Objective:</th>
      <td>
        You will learn what a web server is and gain a general understanding of
        how it works.
      </td>
    </tr>
  </tbody>
</table>

### Summary

The term _web server_ can refer to hardware or software, or both of them working together.

1. On the hardware side, a web server is a computer that stores web server software and a website's component files (for example, HTML documents, images, CSS stylesheets, and JavaScript files). A web server connects to the Internet and supports physical data interchange with other devices connected to the web.
2. On the software side, a web server includes several parts that control how web users access hosted files. At a minimum, this is an _HTTP server_. An HTTP server is software that understands URLs (web addresses) and HTTP (the protocol your browser uses to view webpages). An HTTP server can be accessed through the domain names of the websites it stores, and it delivers the content of these hosted websites to the end user's device.

At the most basic level, whenever a browser needs a file that is hosted on a web server, the browser requests the file via HTTP. When the request reaches the correct (hardware) web server, the (software) _HTTP server_ accepts the request, finds the requested document, and sends it back to the browser, also through HTTP. (If the server doesn't find the requested document, it returns a [404](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404) response instead.)

![Basic representation of a client/server connection through HTTP](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/what_is_a_web_server/web-server.svg)

To publish a website, you need either a static or a dynamic web server.

A **static web server**, or stack, consists of a computer (hardware) with an HTTP server (software). We call it "static" because the server sends its hosted files as-is to your browser.

A **dynamic web server** consists of a static web server plus extra software, most commonly an _application server_ and a _database_. We call it "dynamic" because the application server updates the hosted files before sending content to your browser via the HTTP server.

For example, to produce the final webpages you see in the browser, the application server might fill an HTML template with content from a database. Sites like MDN or Wikipedia have thousands of webpages. Typically, these kinds of sites are composed of only a few HTML templates and a giant database, rather than thousands of static HTML documents. This setup makes it easier to maintain and deliver the content.

### Deeper dive

To review: to fetch a webpage, your browser sends a request to the web server, which searches for the requested file in its own storage space. Upon finding the file, the server reads it, processes it as needed, and sends it to the browser. Let's look at those steps in more detail.

#### Hosting files

First, a web server has to store the website's files, namely all HTML documents and their related assets, including images, CSS stylesheets, JavaScript files, fonts, and video.

Technically, you could host all those files on your own computer, but it's far more convenient to store files all on a dedicated web server because:

- A dedicated web server is typically more available (up and running).
- Excluding downtime and system troubles, a dedicated web server is always connected to the Internet.
- A dedicated web server can have the same IP address all the time. This is known as a _dedicated IP address_. (Not all ISPs provide a fixed IP address for home lines.)
- A dedicated web server is typically maintained by a third party.

For all these reasons, finding a good hosting provider is a key part of building your website. Examine the various services companies offer. Choose one that fits your needs and budget. (Services range from free to thousands of dollars per month.) You can find more details [in this article](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/How_much_does_it_cost#hosting).

Once you have web hosting service, you must [upload your files to your web server](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/Upload_files_to_a_web_server).

#### Communicating through HTTP

Second, a web server provides support for HTTP (Hypertext Transfer Protocol). As its name implies, HTTP specifies how to transfer hypertext (linked web documents) between two computers.

A Protocol is a set of rules for communication between two computers. HTTP is a textual, stateless protocol.

- Textual
  - : All commands are plain-text and human-readable.
- Stateless
  - : Neither the server nor the client remember previous communications. For example, relying on HTTP alone, a server can't remember a password you typed or remember your progress on an incomplete transaction. You need an application server for tasks like that. (We'll cover that sort of technology in other articles.)

HTTP provides clear rules for how a client and server communicate.
If you want to learn more, you can read the [HTTP documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP).
For now, there are a few things to keep in mind:

- _Clients_ make HTTP requests to _servers_. Servers _respond_ to a _client_'s HTTP request.
- When requesting a file via HTTP, clients must provide the file's URL.
- The web server _must answer_ every HTTP request, at least with an error message.

On a web server, the HTTP server is responsible for processing and answering incoming requests.

1. Upon receiving a request, an HTTP server checks if the requested URL matches an existing file.
2. If so, the web server sends the file content back to the browser. If not, the server will check if it should generate a file dynamically for the request (see [Static vs. dynamic content](#static_vs._dynamic_content)).
3. If neither of these options are possible, the web server returns an error message to the browser, most commonly `404`.
   The 404 error is so common that some web designers devote considerable time and effort to designing 404 error pages.
   ![The MDN 404 page as an example of such error page](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/howto/web_mechanics/what_is_a_web_server/mdn-404.jpg)

#### Static vs. dynamic content

Roughly speaking, a server can serve either static or dynamic content. Remember that the term _static_ means "served as-is". Static websites are the easiest to set up, so we suggest you make your first site a static site.

The term _dynamic_ means that the server processes the content or even generates it on the fly from a database. This approach provides more flexibility, but the technical stack is more complex, making it dramatically more challenging to build a website.

It is impossible to suggest a single off-the-shelf application server that will be the right solution for every possible use case. Some application servers are designed to host and manage blogs, wikis, or e-commerce solutions, while others are more generic. If you're building a dynamic website, take the time to research your requirements and find the technology that best fits your needs.

Most website developers won't need to create an application server from scratch, because there are so many off-the-shelf solutions, many of which are highly configurable.
But if you do need to create your own server, then you will probably want to use a server framework, leveraging its existing code and libraries, and extending just the parts that you need in order to meet your use case.
Only a relatively small number of developers should need to develop a server completely from scratch: for example, in order to meet tight resource constraints on an embedded system.
If you'd like to experiment with building a server, take a look through the resources in the [Server-side website programming](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side) learning pathway.

### Next steps

Now that you are familiar with web servers, you could:

- read up on [how much it costs to do something on the web](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/How_much_does_it_cost)
- learn more about [various software you need to create a website](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/What_software_do_I_need)
- move on to something practical like [how to upload files on a web server](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/Upload_files_to_a_web_server).

## An overview of HTTP

> **Source:** [An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/http/guides/overview) · [MDN Web Docs](https://github.com/mdn/content), CC BY-SA 2.5

**HTTP** is a protocol for fetching resources such as HTML documents.
It is the foundation of any data exchange on the Web and it is a client-server protocol, which means requests are initiated by the recipient, usually the Web browser.
A complete document is typically constructed from resources such as text content, layout instructions, images, videos, scripts, and more.

![A single Web document composed from multiple resources from different servers.](https://mdn.github.io/shared-assets/images/diagrams/http/overview/fetching-a-page.svg)

Clients and servers communicate by exchanging individual messages (as opposed to a stream of data).
The messages sent by the client are called _requests_ and the messages sent by the server as an answer are called _responses_.

![HTTP as an application layer protocol, on top of TCP (transport layer) and IP (network layer) and below the presentation layer.](https://mdn.github.io/shared-assets/images/diagrams/http/overview/http-layers.svg)

Designed in the early 1990s, HTTP is an extensible protocol which has evolved over time.
It is an application layer protocol that is sent over TCP, or over a TLS-encrypted TCP connection, though any reliable transport protocol could theoretically be used.
Due to its extensibility, it is used to not only fetch hypertext documents, but also images and videos or to post content to servers, like with HTML form results.
HTTP can also be used to fetch parts of documents to update Web pages on demand.

### Components of HTTP-based systems

HTTP is a client-server protocol: requests are sent by one entity, the user-agent (or a proxy on behalf of it).
Most of the time the user-agent is a Web browser, but it can be anything, for example, a robot that crawls the Web to populate and maintain a search engine index.

Each individual request is sent to a server, which handles it and provides an answer called the _response_.
Between the client and the server there are numerous entities, collectively called proxies, which perform different operations and act as gateways or caches, for example.

![An HTTP request from a client forwarded by several proxies to a server and a response taking the same route back to the client.](https://mdn.github.io/shared-assets/images/diagrams/http/overview/client-server-chain.svg)

In reality, there are more computers between a browser and the server handling the request: there are routers, modems, and more.
Thanks to the layered design of the Web, these are hidden in the network and transport layers.
HTTP is on top, at the application layer.
Although important for diagnosing network problems, the underlying layers are mostly irrelevant to the description of HTTP.

#### Client: the user-agent

The _user-agent_ is any tool that acts on behalf of the user.
This role is primarily performed by the Web browser, but it may also be performed by programs used by engineers and Web developers to debug their applications.

The browser is **always** the entity initiating the request.
It is never the server (though some mechanisms have been added over the years to simulate server-initiated messages).

To display a Web page, the browser sends an original request to fetch the HTML document that represents the page.
It then parses this file, making additional requests corresponding to execution scripts, layout information (CSS) to display, and sub-resources contained within the page (usually images and videos).
The Web browser then combines these resources to present the complete document, the Web page.
Scripts executed by the browser can fetch more resources in later phases and the browser updates the Web page accordingly.

A Web page is a hypertext document.
This means some parts of the displayed content are links, which can be activated (usually by a click of the mouse) to fetch a new Web page, allowing the user to direct their user-agent and navigate through the Web.
The browser translates these directions into HTTP requests, and further interprets the HTTP responses to present the user with a clear response.

#### The Web server

On the opposite side of the communication channel is the server, which _serves_ the document as requested by the client.
A server appears as only a single machine virtually; but it may actually be a collection of servers sharing the load (load balancing), or other software (such as caches, a database server, or e-commerce servers), totally or partially generating the document on demand.

A server is not necessarily a single machine, but several server software instances can be hosted on the same machine.
With HTTP/1.1 and the `Host` header, they may even share the same IP address.

#### Proxies

Between the Web browser and the server, numerous computers and machines relay the HTTP messages.
Due to the layered structure of the Web stack, most of these operate at the transport, network or physical levels, becoming transparent at the HTTP layer and potentially having a significant impact on performance.
Those operating at the application layers are generally called **proxies**.
These can be transparent, forwarding on the requests they receive without altering them in any way, or non-transparent, in which case they will change the request in some way before passing it along to the server.
Proxies may perform numerous functions:

- caching (the cache can be public or private, like the browser cache)
- filtering (like an antivirus scan or parental controls)
- load balancing (to allow multiple servers to serve different requests)
- authentication (to control access to different resources)
- logging (allowing the storage of historical information)

### Basic aspects of HTTP

#### HTTP is simple

HTTP is generally designed to be human-readable, even with the added complexity introduced in HTTP/2 by encapsulating HTTP messages into frames.
HTTP messages can be read and understood by humans, providing easier testing for developers, and reduced complexity for newcomers.

#### HTTP is extensible

Introduced in HTTP/1.0, [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers) make this protocol easy to extend and experiment with.
New functionality can even be introduced by an agreement between a client and a server about a new header's semantics.

#### HTTP is stateless, but not sessionless

HTTP is stateless: there is no link between two requests being successively carried out on the same connection.
This immediately has the prospect of being problematic for users attempting to interact with certain pages coherently, for example, using e-commerce shopping baskets.
But while the core of HTTP itself is stateless, HTTP cookies allow the use of stateful sessions.
Using header extensibility, HTTP Cookies are added to the workflow, allowing session creation on each HTTP request to share the same context, or the same state.

#### HTTP and connections

A connection is controlled at the transport layer, and therefore fundamentally out of scope for HTTP.
HTTP doesn't require the underlying transport protocol to be connection-based; it only requires it to be _reliable_, or not lose messages (at minimum, presenting an error in such cases).
Among the two most common transport protocols on the Internet, TCP is reliable and UDP isn't.
HTTP therefore relies on the TCP standard, which is connection-based.

Before a client and server can exchange an HTTP request/response pair, they must establish a TCP connection, a process which requires several round-trips.
The default behavior of HTTP/1.0 is to open a separate TCP connection for each HTTP request/response pair.
This is less efficient than sharing a single TCP connection when multiple requests are sent in close succession.

In order to mitigate this flaw, HTTP/1.1 introduced _pipelining_ (which proved difficult to implement) and _persistent connections_: the underlying TCP connection can be partially controlled using the `Connection` header.
HTTP/2 went a step further by multiplexing messages over a single connection, helping keep the connection warm and more efficient.

Experiments are in progress to design a better transport protocol more suited to HTTP.
For example, Google is experimenting with [QUIC](https://en.wikipedia.org/wiki/QUIC) which builds on UDP to provide a more reliable and efficient transport protocol.

### What can be controlled by HTTP

This extensible nature of HTTP has, over time, allowed for more control and functionality of the Web.
Cache and authentication methods were functions handled early in HTTP history.
The ability to relax the _origin constraint_, by contrast, was only added in the 2010s.

Here is a list of common features controllable with HTTP:

- _[Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)_:
  How documents are cached can be controlled by HTTP.
  The server can instruct proxies and clients about what to cache and for how long.
  The client can instruct intermediate cache proxies to ignore the stored document.
- _Relaxing the origin constraint_:
  To prevent snooping and other privacy invasions, Web browsers enforce strict separation between websites.
  Only pages from the **same origin** can access all the information of a Web page.
  Though such a constraint is a burden to the server, HTTP headers can relax this strict separation on the server side, allowing a document to become a patchwork of information sourced from different domains; there could even be security-related reasons to do so.
- _Authentication_:
  Some pages may be protected so that only specific users can access them.
  Basic authentication may be provided by HTTP, either using the `WWW-Authenticate` and similar headers, or by setting a specific session using [HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies).
- _[Proxy and tunneling](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Proxy_servers_and_tunneling)_:
  Servers or clients are often located on intranets and hide their true IP address from other computers.
  HTTP requests then go through proxies to cross this network barrier.
  Not all proxies are HTTP proxies.
  The SOCKS protocol, for example, operates at a lower level.
  Other protocols, like FTP, can be handled by these proxies.
- _Sessions_:
  Using HTTP cookies allows you to link requests with the state of the server.
  This creates sessions, despite basic HTTP being a state-less protocol.
  This is useful not only for e-commerce shopping baskets, but also for any site allowing user configuration of the output.

### HTTP flow

When a client wants to communicate with a server, either the final server or an intermediate proxy, it performs the following steps:

1. Open a TCP connection: The TCP connection is used to send a request, or several, and receive an answer.
   The client may open a new connection, reuse an existing connection, or open several TCP connections to the servers.

2. Send an HTTP message: HTTP messages (before HTTP/2) are human-readable.
   With HTTP/2, these messages are encapsulated in frames, making them impossible to read directly, but the principle remains the same.
   For example:

   ```http
   GET / HTTP/1.1
   Host: developer.mozilla.org
   Accept-Language: fr
   ```

3. Read the response sent by the server, such as:

   ```http
   HTTP/1.1 200 OK
   Date: Sat, 09 Oct 2010 14:28:02 GMT
   Server: Apache
   Last-Modified: Tue, 01 Dec 2009 20:18:22 GMT
   ETag: "51142bc1-7449-479b075b2891b"
   Accept-Ranges: bytes
   Content-Length: 29769
   Content-Type: text/html

   <!doctype html>… (here come the 29769 bytes of the requested web page)
   ```

4. Close or reuse the connection for further requests.

If HTTP pipelining is activated, several requests can be sent without waiting for the first response to be fully received.
HTTP pipelining has proven difficult to implement in existing networks, where old pieces of software coexist with modern versions.
HTTP pipelining has been superseded in HTTP/2 with more robust multiplexing requests within a frame.

### HTTP Messages

HTTP messages, as defined in HTTP/1.1 and earlier, are human-readable.
In HTTP/2, these messages are embedded into a binary structure, a _frame_, allowing optimizations like compression of headers and multiplexing.
Even if only part of the original HTTP message is sent in this version of HTTP, the semantics of each message is unchanged and the client reconstitutes (virtually) the original HTTP/1.1 request.
It is therefore useful to comprehend HTTP/2 messages in the HTTP/1.1 format.

There are two types of HTTP messages, requests and responses, each with its own format.

#### Requests

An example HTTP request:

![Overview of an HTTP GET request with headers](https://mdn.github.io/shared-assets/images/diagrams/http/overview/http-request.svg)

Requests consist of the following elements:

- An HTTP [method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods), usually a verb like `GET`, `POST`, or a noun like `OPTIONS` or `HEAD` that defines the operation the client wants to perform.
  Typically, a client wants to fetch a resource (using `GET`) or post the value of an [HTML form](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms) (using `POST`), though more operations may be needed in other cases.
- The path of the resource to fetch; the URL of the resource stripped from elements that are obvious from the context, for example without the protocol (`http://`), the domain (here, `developer.mozilla.org`), or the TCP port (here, `80`).
- The version of the HTTP protocol.
- Optional [headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers) that convey additional information for the servers.
- A body, for some methods like `POST`, similar to those in responses, which contain the resource sent.

#### Responses

An example response:

![Overview of a '200 OK' HTTP response to a GET request including response headers.](https://mdn.github.io/shared-assets/images/diagrams/http/overview/http-response.svg)

Responses consist of the following elements:

- The version of the HTTP protocol they follow.
- A [status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status), indicating if the request was successful or not, and why.
- A status message, a non-authoritative short description of the status code.
- HTTP [headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers), like those for requests.
- Optionally, a body containing the fetched resource.

### APIs based on HTTP

The most commonly used API based on HTTP is the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), which can be used to make HTTP requests from JavaScript. The Fetch API replaces the `XMLHttpRequest` API.

Another API, [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events), is a one-way service that allows a server to send events to the client, using HTTP as a transport mechanism.
Using the `EventSource` interface, the client opens a connection and establishes event handlers.
The client browser automatically converts the messages that arrive on the HTTP stream into appropriate `Event` objects. Then it delivers them to the event handlers that have been registered for the events' `Event.type` if known, or to the `EventSource.message_event` event handler if no type-specific event handler was established.

### Conclusion

HTTP is an extensible protocol that is easy to use.
The client-server structure, combined with the ability to add headers, allows HTTP to advance along with the extended capabilities of the Web.

Though HTTP/2 adds some complexity by embedding HTTP messages in frames to improve performance, the basic structure of messages has stayed the same since HTTP/1.0.
Session flow remains basic, allowing it to be investigated and debugged with a [HTTP network monitor](https://firefox-source-docs.mozilla.org/devtools-user/network_monitor/index.html).

### See also

- [Evolution of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP)
- Glossary terms:
  - HTTP
  - HTTP/2
  - QUIC
