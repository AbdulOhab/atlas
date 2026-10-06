---
title: "DevOps Tools A–Z"
order: 19
split: topics
summary: "A reference page per tool: what it is, how to install it, where to start and the commands you'll use first, for 40+ tools from Ansible to Vault."
category: "Mastery"
level: Beginner
---

# DevOps Tools A–Z

A quick reference for the tools the modules mention: one page each with what the tool is, how to install it, where to start and, for many, a cheat sheet of first commands. Use it alongside the modules, not instead of them.

## Agile

> **Source:** [Agile](https://github.com/tungbq/devops-basics/tree/main/topics/agile) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Agile?

- The Agile methodology is a project management approach that involves breaking the project into phases and emphasizes continuous collaboration and improvement. Teams follow a cycle of planning, executing, and evaluating.
- See: https://www.atlassian.com/agile
- Wiki: https://en.wikipedia.org/wiki/Agile_software_development

### 2. Agile learning resource

- Concept: https://www.simplilearn.com/tutorials/agile-scrum-tutorial/what-is-agile
- Scrum: https://www.atlassian.com/agile/scrum
- Kanban: https://www.atlassian.com/agile/kanban

### 3. Scrum

- Concept: https://www.atlassian.com/agile/scrum
- Sprints: https://www.atlassian.com/agile/scrum/sprints
- Sprint planning: https://www.atlassian.com/agile/scrum/sprint-planning
- Sprint reviews: https://www.atlassian.com/agile/scrum/sprint-reviews
- Backlog: https://www.atlassian.com/agile/scrum/backlogs
- Standup: https://www.atlassian.com/agile/scrum/standups
- Scrum master: https://www.atlassian.com/agile/scrum/scrum-master
- Retrospectives: https://www.atlassian.com/agile/scrum/retrospectives
- ...More at: https://www.atlassian.com/agile/scrum

### 4. How do Agile and DevOps interrelate?

- https://www.atlassian.com/agile/devops

Coming soon...

## Akamai

> **Source:** [Akamai](https://github.com/tungbq/devops-basics/tree/main/topics/akamai) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### Akamai

##### 1. What is Akamai?

**Overview**
Akamai is one of the world’s largest content delivery networks (CDNs), providing secure and high-performance services to accelerate and protect applications, APIs, and websites.
It acts as an edge platform to deliver content closer to users, reduce latency, and mitigate traffic spikes and DDoS attacks.

> See: [https://www.akamai.com/products](https://www.akamai.com/products)

**Akamai Diagram**
Akamai edge delivery architecture: TBD

**Official Website of Akamai**
[https://www.akamai.com/](https://www.akamai.com/)

**Official Documentation**
[https://techdocs.akamai.com/](https://techdocs.akamai.com/)

##### 2. Prerequisites

To start working with Akamai services:

- A registered Akamai account (with access to Control Center)
- Basic knowledge of HTTP, DNS, and CDN concepts
- (Optional) Familiarity with your web server or cloud platform
- For automation: Akamai API client or CLI installed

##### 3. Akamai Basics

**Getting Started with Akamai**
Start here: [https://techdocs.akamai.com/home](https://techdocs.akamai.com/home)

**Key Concepts:**

- **Edge Servers**: Akamai's distributed servers that cache content closer to users
- **Property**: A configuration to control how your site behaves on the Akamai edge
  - Property Manager: https://techdocs.akamai.com/property-mgr/docs/welcome-prop-manager
- **EdgeWorkers**: Akamai’s serverless compute at the edge
- **Content Purging**: Clearing stale content from edge cache

##### 4. Common Use Cases & Hands-On

**Simple CDN Configuration**
Use Akamai Control Center to create a property and set up edge delivery for your static site or web app.

**Use Case: Route by Path**
Route requests like `/app1`, `/app2` to different origins (e.g., Azure Front Door, HTTPD server).

**EdgeWorkers Hello World ⭐**
Run a basic JavaScript function at the edge with EdgeWorkers.
See: `akamai/edgeworkers/helloworld` (TBD)

##### 5. Advanced Topics

**Integrate with Azure / Multi-CDN Setup**

- Use Akamai in front of Azure Front Door
- Geo-routing and failover between multiple origins
  See examples: `akamai/azure-integration` (TBD)

**Security Features**

- Web Application Firewall (WAF)
- Bot Manager
- DDoS Protection (Kona Site Defender)

##### 6. More...

**Akamai Developer Resources**

- https://community.akamai.com/customers/s/?language=en_US

**Free Akamai Trial**
TBD

**Recommended Books**
N/A

### Coming soon

## Ansible

> **Source:** [Ansible](https://github.com/tungbq/devops-basics/tree/main/topics/ansible) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is Ansible

##### Overview

- See: https://opensource.com/resources/what-ansible

##### Ansible Diagram

![ansible-diagram](https://www.interviewbit.com/blog/wp-content/uploads/2022/06/Why-use-Ansible-768x449.png)

(Image source provided by https://www.interviewbit.com/blog/ansible-architecture/)

##### Official website documentation of Ansible

- Visit https://www.ansible.com/

#### 2. Installation

##### How to install Ansible?

- Follow this guide: https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#installing-ansible

#### 3. Basics of Ansible

##### Getting started with Ansible

- https://docs.ansible.com/ansible/latest/network/getting_started/basic_concepts.html#basic-concepts

##### Ansible Helloworld ⭐

- Visit [ansible/basics/helloworld](https://github.com/tungbq/devops-basics/blob/main/topics/ansible/basics/helloworld)

#### 4. Beyond the Basics

##### Exploring Advanced Examples

- Checkout [advanced](https://github.com/tungbq/devops-basics/blob/main/topics/ansible/advanced)

#### 5. More

##### Ansible playbook cheatsheet

- https://docs.ansible.com/ansible/latest/cli/ansible-playbook.html#ansible-playbook

##### Recommended Books

- N/A

### Initialize Ansible learning place
#### Install ansible: https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html

## Apache HTTP Server

> **Source:** [Apache HTTP Server](https://github.com/tungbq/devops-basics/tree/main/topics/apache-httpd) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### Apache HTTP Server (httpd)

#### 1. What is Apache HTTP Server?

##### Overview

The Apache HTTP Server, commonly referred to as **Apache httpd**, is a free and open-source web server software developed and maintained by the Apache Software Foundation. It is one of the most widely used web servers in the world and plays a key role in the growth of the internet by supporting websites of all sizes and types.

Apache httpd supports a wide range of features including dynamic loading of modules, powerful URL rewriting, authentication mechanisms, and support for various programming languages through integration (e.g., PHP, Python, Perl). It can serve both static and dynamic content and is highly configurable and extensible.

Source: https://en.wikipedia.org/wiki/Apache_HTTP_Server

##### Official Website of Apache HTTP Server

- https://httpd.apache.org/

##### Official Documentation of Apache HTTP Server

- https://httpd.apache.org/docs/

##### What you can do with Apache HTTP Server

- Host static websites and serve files over HTTP/S.
- Reverse proxy or load balance to backend services.
- Use it as a secure frontend to application servers.
- Integrate with scripting languages like PHP, Python, or Perl.
- Configure URL routing, authentication, access control, logging, and more.

---

#### 2. Prerequisites

- Basic knowledge of web server technologies.
- A Unix/Linux, Windows, or macOS system.
- Command-line access with root/administrator privileges.

---

#### 3. Installation

##### How to Install Apache HTTP Server?

###### On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install apache2
```

###### On RHEL/CentOS/Rocky:

```bash
sudo dnf install httpd
```

###### On macOS (using Homebrew):

```bash
brew install httpd
```

##### Start and Enable Apache:

```bash
# Start the service
sudo systemctl start apache2     # Ubuntu/Debian
sudo systemctl start httpd       # RHEL/CentOS

# Enable on boot
sudo systemctl enable apache2    # Ubuntu/Debian
sudo systemctl enable httpd      # RHEL/CentOS
```

##### Verify Installation

- Open a web browser and navigate to: `http://localhost`
- You should see the **Apache2 Default Page** or **"It works!"** page.

---

#### 4. Basics of Apache HTTP Server

##### Get started with Apache httpd

- https://httpd.apache.org/docs/2.4/getting-started.html

##### Apache HTTP Server Quick Start Guide

- Learn to configure the server using `httpd.conf`.
- Set up Virtual Hosts for multiple websites.
- Enable modules (e.g., `mod_rewrite`, `mod_ssl`, `mod_proxy`).
- Create a custom index page in `/var/www/html/`.

##### Apache HTTP Server Hands-On

- See: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/apache-httpd/basics)

---

#### 5. More...

##### Apache httpd Cheatsheet

- https://runcloud.io/docs/cheat-sheet-apache

##### Recommended Books

- **Apache: The Definitive Guide** by Ben Laurie and Peter Laurie.
- **Pro Apache** by Peter Wainwright.
- **Apache Cookbook** by Rich Bowen and Ken Coar.

#### Apache HTTP Server Hands-On

Hands-on guide for Apache HTTP Server using Docker

##### Run Apache HTTP Server in Docker

You can quickly get Apache up and running using the official Docker image.

---

##### 4.1 Run a Simple Apache Container

```bash
docker run -d --name apache-server -p 8080:80 httpd:latest
# Note: Replace 8080 with the PORT works on your own machine.
```

- Access it at: [http://localhost:8080](http://localhost:8080)
- This will show the default Apache welcome page.

---

##### 4.2 Serve Custom Content

1. **Create your own `index.html`:**

```bash
mkdir apache-content
echo "<h1>Hello from Apache in Docker!</h1>" > apache-content/index.html
```

2. **Run Apache with your custom HTML:**

```bash
docker run -d \
  --name apache-custom \
  -p 8081:80 \
  -v $(pwd)/apache-content:/usr/local/apache2/htdocs/ \
  httpd:latest
```

- Visit: [http://localhost:8081](http://localhost:8081)
- You'll see your custom message.

---

##### 4.3 Use a Custom Apache Configuration (Optional)

1. **Create your custom Apache config file (e.g., `my-httpd.conf`)**:

```apache
ServerName localhost

LoadModule mpm_event_module modules/mod_mpm_event.so
LoadModule dir_module modules/mod_dir.so

Listen 80
DocumentRoot "/usr/local/apache2/htdocs"
<Directory "/usr/local/apache2/htdocs">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

DirectoryIndex index.html
```

2. **Mount the custom config file into the container**:

```bash
docker run -d \
  --name apache-with-conf \
  -p 8082:80 \
  -v $(pwd)/apache-content:/usr/local/apache2/htdocs/ \
  -v $(pwd)/my-httpd.conf:/usr/local/apache2/conf/httpd.conf \
  httpd:latest
```

- Check at [http://localhost:8082](http://localhost:8082)

---

##### 4.4 Clean Up

```bash
docker rm -f apache-server apache-custom apache-with-conf
```

---

##### 4.5 Source & Reference

- [Official Docker Hub Image for httpd](https://hub.docker.com/_/httpd)
- [Apache Documentation](https://httpd.apache.org/docs/)

## Apache Tomcat

> **Source:** [Apache Tomcat](https://github.com/tungbq/devops-basics/tree/main/topics/apachetomcat) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### Apache Tomcat

#### 1. What is Apache Tomcat?

##### Overview

Apache Tomcat (called "Tomcat" for short) is a free and open-source implementation of the Jakarta Servlet, Jakarta Expression Language, and WebSocket technologies. It provides a "pure Java" HTTP web server environment in which Java code can also run. Thus it is a Java web application server, although not a full JEE application server.
Tomcat is developed and maintained by an open community of developers under the auspices of the Apache Software Foundation, released under the Apache License 2.0 license.

Source: https://en.wikipedia.org/wiki/Apache_Tomcat

##### Official Website of Apache Tomcat

- https://tomcat.apache.org/

##### Official Documentation of Apache Tomcat

- https://tomcat.apache.org/tomcat-10.1-doc/

##### What you can do with Apache Tomcat

- Host Java-based web applications.
- Implement and run Java Servlet and JSP technologies.
- Lightweight and highly customizable deployment platform.
- See details at: https://tomcat.apache.org/tomcat-10.1-doc/introduction.html

---

#### 2. Prerequisites

- Basic knowledge of Java and web server technologies.
- Java Development Kit (JDK) installed on your system.

---

#### 3. Installation

##### How to Install Apache Tomcat?

1. **Download Apache Tomcat**:

   - Visit the official [Apache Tomcat Downloads](https://tomcat.apache.org/download-10.cgi) page.
   - Choose the version that matches your needs (e.g., Tomcat 10.1).

2. **Install Java**:

   - Ensure JDK is installed on your system. Apache Tomcat requires Java to run.
   - [Install JDK Guide](https://docs.oracle.com/en/java/javase/17/install/overview-jdk-installation.html)

3. **Extract and Configure Tomcat**:

   - Extract the downloaded archive to a desired directory.
   - Set the `CATALINA_HOME` environment variable to the Tomcat installation path.

4. **Start Tomcat**:

   - Navigate to the `bin` directory of your Tomcat installation.
   - Run `startup.bat` (Windows) or `./startup.sh` (Linux/Mac).

5. **Verify Installation**:
   - Open a browser and go to `http://localhost:8080`. You should see the Tomcat welcome page.

---

#### 4. Basics of Apache Tomcat

##### Get started with Apache Tomcat

- https://tomcat.apache.org/tomcat-10.1-doc/setup.html

##### Apache Tomcat quick start guide

- Set up and deploy your first servlet or JSP application:
  - [Getting Started Guide](https://tomcat.apache.org/tomcat-10.1-doc/appdev/index.html)

##### Apache Tomcat Hands-On

- See: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/apachetomcat/basics)

---

#### 5. More...

##### Apache Tomcat Cheatsheet

- https://www.javacodegeeks.com/starting-with-apache-tomcat-cheatsheet.html

##### Recommended Books

- **Tomcat: The Definitive Guide** by Jason Brittain.
- **Professional Apache Tomcat 8** by Vivek Chopra, et al.

### Apache Tomcat Basics

This section covers the fundamental concepts and steps to get started with Apache Tomcat. Learn how to set up, configure, and deploy web applications.

---

#### 1. Getting Started with Apache Tomcat

##### Starting the Server

1. Open the terminal and navigate to the `bin` directory of your Tomcat installation.
2. Run the startup script:
   - **Windows**: `startup.bat`
   - **Linux/Mac**: `./startup.sh`

##### Stopping the Server

1. Navigate to the `bin` directory.
2. Run the shutdown script:
   - **Windows**: `shutdown.bat`
   - **Linux/Mac**: `./shutdown.sh`

---

#### 2. Configuring Apache Tomcat

##### Change the Default Port

1. Open the `server.xml` file located in the `conf` directory.
2. Locate the `<Connector>` element and change the `port` attribute:

```xml
  <Connector port="8080" protocol="HTTP/1.1"
             connectionTimeout="20000"
             redirectPort="8443" />
```

---

#### 3. Deploying a Sample Application

- Deploy a Pre-Built `.war` File
- Download a sample `.war` file
  - Download the sample application Sample Web Application at https://tomcat.apache.org/tomcat-10.1-doc/appdev/sample/
- Deploy to Tomcat
  - Copy the `.war` file into the webapps directory of your Tomcat installation.
  - Access the Application: Open a browser and navigate to http://localhost:8080/sample.

## Architecture

> **Source:** [Architecture](https://github.com/tungbq/devops-basics/tree/main/topics/architecture) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### Architecture Center

#### 1. AWS Architecture Center

- Architecture Center: https://aws.amazon.com/architecture
- AWS official youtube channel: [This is my architecture series](https://youtube.com/playlist?list=PLhr1KZpdzukdeX8mQ2qO73bg6UKQHYsHb&si=ztggdByRdqW9tKvl)

#### 2. Azure Architecture Center

- Architecture Center: https://learn.microsoft.com/en-us/azure/architecture/
- Browse Architecture Center: https://learn.microsoft.com/en-us/azure/architecture/browse/

#### 3. Trunk Based Development

A source-control branching model, where developers collaborate on code in a single branch called ‘trunk’ \*, resist any pressure to create other long-lived development branches by employing documented techniques. They therefore avoid merge hell, do not break the build, and live happily ever after.

- https://trunkbaseddevelopment.com/

#### 4. Deployment

- Deployment Choice: Code Promotion vs Artifact Promotion: https://hackernoon.com/deployment-choice-code-promotion-vs-artifact-promotion

#### 5. Versioning

- Kubernetes Release Versioning: https://github.com/kubernetes/sig-release/blob/master/release-engineering/versioning.md#kubernetes-release-versioning
- Semantic Versioning 2.0.0: https://semver.org/

## Argo CD

> **Source:** [Argo CD](https://github.com/tungbq/devops-basics/tree/main/topics/argocd) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is ArgoCD?

- https://argo-cd.readthedocs.io/en/stable/#what-is-argo-cd

##### Overview

Argo CD is a declarative, GitOps continuous delivery tool for Kubernetes.

##### ArgoCD Architecture

![argocd_architecture](https://argo-cd.readthedocs.io/en/stable/assets/argocd_architecture.png)

##### Official website documentation of docker

- Access the complete [official ArgoCD repo](https://github.com/argoproj/argo-cd) for detailed information and references.

#### 2. Prerequisites

- Familiarity with containerization concepts and basic Linux command-line usage would be beneficial for understanding ArgoCD.

#### 3. Installation

##### How to install ArgoCD?

- Follow the steps outlined in the [ArgoCD installation documentation](https://argo-cd.readthedocs.io/en/stable/operator-manual/installation/) for both local development and production environments.

#### 4. Basics of ArgoCD

##### Getting started with ArgoCD

- Refer to the [official ArgoCD getting started documentation](https://argo-cd.readthedocs.io/en/stable/getting_started/) for a comprehensive introduction.

##### ArgoCD Hello World

- Run the [basic/](https://github.com/tungbq/devops-basics/blob/main/topics/argocd/basics/install_argocd.sh) script to execute a simple ArgoCD "Hello World" demonstration.

#### 5. Beyond the Basics

##### Hands-On Example

- Explore a practical hands-on example in the [argocd-example-apps repo](https://github.com/argoproj/argocd-example-apps) to quickly start using ArgoCD.

#### 6. More

##### ArgoCD Cheatsheet

- [commands/argocd](https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd/)

##### Recommended Books

- N/A

### Welcome to Argo CD

#### Install Argo CD and the CLI

- Run `./install_argocd.sh`

#### Access the Web UI

##### Initial password

- Run `argocd admin initial-password -n argocd` to get the initial password
- Login with admin and the above password

#### Deloy your first application Via UI

##### Create An Application From A Git Repository

###### Check service

`kubectl get services`

###### Port forwarding to check the app

- Syntax: (kubectl port-forward service/<service-name> <local-port>:<service-port>)
- Run cmd: `kubectl port-forward service/guestbook-ui 8082:80`
- NOTE: You can replace 8082 by your own port depends on your enviroment

###### Verify the result

- Visit http://localhost:8082
- Or via cmd: `curl localhost:8082`
- Once the app is deployed successfully and service up and running with port-forwarding, we should see something like
  ![guestbook-ui-demo](https://github.com/tungbq/devops-basics/blob/main/assets/images/argocd/guestbook-ui-demo.png)

#### Working with the ArgoCD CLI

- Check out: https://argo-cd.readthedocs.io/en/stable/getting_started/#creating-apps-via-cli

## AWS

> **Source:** [AWS](https://github.com/tungbq/devops-basics/tree/main/topics/aws) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is AWS?

- https://aws.amazon.com/what-is-aws/

##### Overview

Amazon Web Services (AWS) is the world’s most comprehensive and broadly adopted cloud, offering over 200 fully featured services from data centers globally. Millions of customers—including the fastest-growing startups, largest enterprises, and leading government agencies—are using AWS to lower costs, become more agile, and innovate faster.

##### AWS Architecture

- N/A

##### Official website documentation of AWS

- https://docs.aws.amazon.com/

#### 2. Prerequisites

- Familiarity with cloud concepts and basic Linux command-line usage would be beneficial for understanding AWS.

#### 3. Installation

##### How to install AWS?

- No need to install AWS, it's cloud environment

#### 4. Basics of AWS

##### 1. Getting started with AWS

- Refer to the [official AWS getting started documentation](https://aws.amazon.com/getting-started/) for a comprehensive introduction.

##### 2. AWS Hello World

- Check the [basic/](https://github.com/tungbq/devops-basics/blob/main/topics/aws/basics) directory to create a simple AWS EC2.

#### 5. Beyond the Basics

##### Hands-On Example

- Explore a practical hands-on example in the [AWS hands-on](https://aws.amazon.com/getting-started/hands-on) to quickly start using AWS.

#### 6. More

##### AWS learning resource

- https://github.com/tungbq/AWS-LearningResource

##### Recommended Books

- N/A

### AWS Basic

#### Get started with Amazon EC2 Linux instances

- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

## Azure

> **Source:** [Azure](https://github.com/tungbq/devops-basics/tree/main/topics/azure) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is Azure?

- https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-azure/

##### Overview

The Azure cloud platform is more than 200 products and cloud services designed to help you bring new solutions to life—to solve today’s challenges and create the future. Build, run, and manage applications across multiple clouds, on-premises, and at the edge, with the tools and frameworks of your choice.

##### Official website documentation of Azure

- https://learn.microsoft.com/en-us/azure/?product=popular

#### 2. Prerequisites

- Familiarity with cloud concepts and basic Linux command-line usage would be beneficial for understanding Azure.

#### 3. Installation

##### How to install Azure?

- No need to install Azure, it's cloud environment

#### 4. Basics of Azure

##### 1. Getting started with Azure

- https://portal.azure.com/?quickstart=true#view/Microsoft_Azure_Resources/QuickstartCenterBlade

##### 2. Azure Hello World

- Check the [**basic/**](https://github.com/tungbq/devops-basics/blob/main/topics/azure/basics) directory to create some Azure resources

#### 5. Beyond the Basics

##### Azure Architecture Center

- https://learn.microsoft.com/en-us/azure/architecture/

#### 6. More

##### Azure learning resource

- https://github.com/TheDevOpsHub/AzureHub

##### Recommended Books

- N/A

### Getting started with Azure
- Portal: https://portal.azure.com/
- Create VM: https://learn.microsoft.com/en-us/azure/virtual-machines/windows/quick-create-portal
- Create blob storage: https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-portal

## Azure DevOps

> **Source:** [Azure DevOps](https://github.com/tungbq/devops-basics/tree/main/topics/azuredevops) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Azure DevOps?

#### Overview

Azure DevOps supports a collaborative culture and set of processes that bring together developers, project managers, and contributors to develop software.
It allows organizations to create and improve products at a faster pace than they can with traditional software development approaches.

#### Azure DevOps workflow

N/A

#### Official website documentation of Azure DevOps

- https://learn.microsoft.com/en-us/azure/devops

### 2. Prerequisites

- Understanding the basic CICD concept would be helpful

### 3. Installation

#### How to install Azure DevOps?

- No need to install, just use: https://dev.azure.com/

### 4. Basics of Azure DevOps

#### Azure DevOps quick start

- See [Create first pipeline](https://learn.microsoft.com/en-us/azure/devops/pipelines/create-first-pipeline)

#### Azure DevOps Hello World

- Check the [basic/](https://github.com/tungbq/devops-basics/blob/main/topics/azuredevops/basics) directory to create a simple Azure DevOps pipeline.

### 5. Beyond the Basics

#### Hands-On Example

- Check the [advanced/](https://github.com/tungbq/devops-basics/blob/main/topics/azuredevops/advanced) directory for more Azure DevOps examples.

### 6. More...

#### Recommended Books

- TODO

## Backstage

> **Source:** [Backstage](https://github.com/tungbq/devops-basics/tree/main/topics/backstage) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### Backstage

#### 1. What is Backstage?

- https://backstage.io/

##### Overview

Backstage is an open-source framework for building developer portals. It provides a central place for developers to discover software, understand ownership, use software templates, browse technical documentation, and integrate engineering tools through plugins.

One of its core features is the Software Catalog, which keeps metadata about services, websites, libraries, APIs, systems, resources, users, and groups in a consistent format.

##### Official documentation

- https://backstage.io/docs/

#### 2. Prerequisites

For a local standalone installation, review the official Backstage prerequisites before starting:

- A Unix-based environment such as Linux, macOS, or Windows Subsystem for Linux (WSL)
- Node.js Active LTS. Backstage currently recommends Node.js 22 or 24
- Yarn and Corepack
- Git
- Docker
- At least 6 GB of memory and 20 GB of free disk space for the standalone demo environment

See the official installation guide for the complete and most up-to-date requirements:

- https://backstage.io/docs/getting-started/

#### 3. Installation

Create a local Backstage application with the official scaffolding command:

```bash
npx @backstage/create-app@latest
```

Enter a name for the application when prompted, for example:

```text
my-backstage-app
```

Then start the application:

```bash
cd my-backstage-app
yarn start
```

When the application is ready, open:

```text
http://localhost:3000
```

#### 4. Basics of Backstage

Backstage organizes software metadata through its Software Catalog. Catalog entities are usually defined in YAML files, and the recommended filename for an entity descriptor is `catalog-info.yaml`.

A basic component contains fields such as:

- `apiVersion`
- `kind`
- `metadata`
- `spec`
- component type
- lifecycle
- owner

Try the runnable example in [`basics/`](https://github.com/tungbq/devops-basics/blob/main/topics/backstage/basics/README.md) to create a local Backstage application and register a sample service in the Software Catalog.

Useful documentation:

- https://backstage.io/docs/features/software-catalog/
- https://backstage.io/docs/features/software-catalog/descriptor-format/

#### 5. Beyond the Basics

After becoming familiar with the Software Catalog, explore other Backstage capabilities:

- Software Templates for creating components from reusable templates
- TechDocs for documentation-as-code
- Plugins for integrating engineering tools into the developer portal
- Authentication and authorization
- Deployment with Docker or Kubernetes

Useful documentation:

- https://backstage.io/docs/features/software-templates/
- https://backstage.io/docs/features/techdocs/
- https://backstage.io/plugins/
- https://backstage.io/docs/deployment/

#### 6. More

##### Practice

- Continue with the exercises in [`practice/`](https://github.com/tungbq/devops-basics/blob/main/topics/backstage/practice/README.md).

##### Learning resources

- Backstage documentation: https://backstage.io/docs/
- Backstage GitHub repository: https://github.com/backstage/backstage
- Backstage plugin directory: https://backstage.io/plugins/

### Backstage Hello World

This example creates a local Backstage application and registers a sample service in the Software Catalog.

#### Prerequisites

Make sure the prerequisites from the [Backstage topic README](https://github.com/tungbq/devops-basics/blob/main/topics/backstage/README.md) are installed.

#### 1. Create a Backstage application

Run:

```bash
npx @backstage/create-app@latest
```

When prompted for an application name, use:

```text
my-backstage-app
```

The command creates a new `my-backstage-app` directory and installs the required dependencies.

#### 2. Add the sample catalog entity

Copy the [`catalog-info.yaml`](https://github.com/tungbq/devops-basics/blob/main/topics/backstage/basics/catalog-info.yaml) file from this directory into the root of the generated Backstage application and rename the copy to:

```text
sample-service.yaml
```

The generated application should now contain:

```text
my-backstage-app/
├── app-config.yaml
├── sample-service.yaml
├── package.json
└── packages/
```

#### 3. Register the sample service

Open `my-backstage-app/app-config.yaml`.

Find the existing `catalog.locations` section and append the following location:

```yaml
catalog:
  locations:
    - type: file
      target: ../../examples/entities.yaml

    # Keep the other generated locations and add this one.
    - type: file
      target: ../../sample-service.yaml
      rules:
        - allow: [Component]
```

Do not create a second `catalog:` key if one already exists. Add the new `file` entry to the existing `catalog.locations` list.

Backstage resolves local file locations relative to the backend process, which normally runs from `packages/backend`. Therefore `../../sample-service.yaml` points to the file in the application root.

#### 4. Start Backstage

From the generated application directory, run:

```bash
cd my-backstage-app
yarn start
```

When the frontend finishes starting, open:

```text
http://localhost:3000
```

#### 5. Verify the service

Open the Software Catalog and search for:

```text
devops-basics-sample-service
```

The component should appear with:

- Type: `service`
- Lifecycle: `experimental`
- Owner: `guests`

You have now registered a custom service in the Backstage Software Catalog.

#### Cleanup

Stop the local Backstage process with `Ctrl+C`.

If the application was created only for this example, you can remove the generated `my-backstage-app` directory afterward.

## Cloudflare

> **Source:** [Cloudflare](https://github.com/tungbq/devops-basics/tree/main/topics/cloudflare) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Cloudflare?

#### Overview

- Cloudflare is one of the biggest networks operating on the Internet. People use Cloudflare services for the purposes of increasing the security and performance of their web sites and services.

#### Official website of Cloudflare

- https://www.cloudflare.com/

#### Official documentation website of Cloudflare

- https://developers.cloudflare.com/

### 2. Prerequisites

- Basic networking, DNS, webserver knowledge are helpful.

### 3. Installation

#### How to use Cloudflare?

- Start using Cloudflare service at: https://dash.cloudflare.com/

### 4. Basics of Cloudflare

#### Cloudflare getting started

- Begginner's Guide: https://developers.cloudflare.com/learning-paths/get-started/

#### Cloudflare Hands on

- See: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/cloudflare/basics)

### 5. More...

#### Cloudflare cheatsheet

- N/A

#### Reference Architecture

- https://developers.cloudflare.com/reference-architecture/

#### Recommended Books

- N/A

### Cloudflare basics practice

- https://developers.cloudflare.com/learning-paths/get-started/

## Coding

> **Source:** [Coding](https://github.com/tungbq/devops-basics/tree/main/topics/coding) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### Coding

Coding resources for DevOps

#### 1. Some resource to level-up your coding skill and mindset

##### Design Pattern

- https://refactoring.guru/design-patterns/catalog

##### The Twelve-Factor App

- https://12factor.net/

##### OOP Concepts

- https://docs.oracle.com/javase/tutorial/java/concepts/

## Docker

> **Source:** [Docker](https://github.com/tungbq/devops-basics/tree/main/topics/docker) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Docker?

#### Overview

Docker is a platform designed to make it easier to create, deploy, and run applications using containers. It allows for packaging applications and their dependencies into containers.

#### Docker Architecture

For a deeper understanding, refer to the [Docker Architecture documentation](https://docs.docker.com/get-started/overview/#docker-architecture).

#### Official website documentation of docker

- Access the complete [official Docker documentation](https://docs.docker.com) for detailed information and references.

### 2. Prerequisites

- Familiarity with containerization concepts and basic Linux command-line usage would be beneficial for understanding Docker.

### 3. Installation

#### How to install Docker?

- Follow the steps outlined in the [Docker installation documentation](https://docs.docker.com/engine/install/) for both local development and production environments.

### 4. Basics of Docker

#### Getting started with Docker

- Refer to the [official Docker getting started documentation](https://docs.docker.com/get-started/) for a comprehensive introduction.

#### Docker Hello World

- Run the [basic/docker-helloworld.sh](https://github.com/tungbq/devops-basics/blob/main/topics/docker/basics/docker-helloworld.sh) script to execute a simple Docker "Hello World" demonstration.

#### Top Docker commands

- Checkout [basic/top-docker-cmd.md](https://github.com/tungbq/devops-basics/blob/main/topics/docker/basics/top-docker-cmd.md)

### 5. Beyond the Basics

#### Hands-On Example

- Explore a practical hands-on example in the [advanced directory](https://github.com/tungbq/devops-basics/blob/main/topics/docker/advanced) to quickly start using Docker.

### 6. More

#### Docker Cheatsheet

- Use the [Docker cheatsheet](https://docs.docker.com/get-started/docker_cheatsheet.pdf) as a quick reference guide for Docker commands and functionalities.

#### Recommended Books

- _Docker in Action, Second Edition_ by Jeff Nickoloff (Author), Stephen Kuenzli (Author). Link [Docker in Action](https://www.amazon.com/Docker-Action-Jeff-Nickoloff/dp/1617294764)

### Introduction 👋

- Docker has rapidly become the de facto standard for containerizing applications. As a developer or DevOps Engineer/SysAdmin, getting familiar with Docker is crucial for deploying modern, portable applications efficiently.
- While Docker boasts numerous advanced features and commands, there are certain essential ones you'll find yourself using **consistently on a daily basis.**
- In this post, we will go through the top **20+ essential Docker commands** and their use cases everyone should know.

### Installation 🔨

- To install Docker on your machine, follow this [**document**](https://docs.docker.com/engine/install/) (Supported various platforms)
- To get hands-on experience and understand Docker better, you could visit this [**repository**](https://github.com/tungbq/devops-basics/tree/main/topics/docker)

### Table of Contents 🔖

- [Docker General](#docker-general-commands) ➡️ info • --help
- [Docker Registry](#docker-registry) ➡️ login • logout
- [Docker Images](#docker-images) ➡️ build • tag • images • pull • push • save • load • rmi
- [Docker Containers](#docker-container) ➡️ run • ps • stop/start/restart • logs • exec • cp • rm
- [Docker Cleanup](#docker-cleanup) ➡️ system prune
- [What's next?](#whats-next)

### Docker General Commands

#### 1. docker info

- `docker info` displays system-wide information
- Syntax: `docker info`

#### 2. docker --help

- `docker --help` gets help with Docker. Can also use --help on all subcommands
- Syntax: `docker <subcommands> --help`

### Docker Registry

#### 3. docker login

- `docker login` is used to log in to a Docker registry. If no server is specified, the default is defined by the daemon.
- Syntax: `docker login <options> <registry>`
- Use cases:

| ID  | Command                               | Description                                                |
| --- | ------------------------------------- | ---------------------------------------------------------- |
| 1   | `docker login`                        | Log in to the default Docker registry                      |
| 2   | `docker login myRegistry -u username` | Log in to a specified registry with the specified username |

#### 4. docker logout

- To log out from a Docker registry, use `docker logout`. This command is used when you want to remove the credentials used to authenticate with a registry.
- Syntax: `docker logout <registry_url>`
- Use cases:

| ID  | Command                    | Description                              |
| --- | -------------------------- | ---------------------------------------- |
| 1   | `docker logout`               | Log out from the default Docker registry |
| 2   | `docker logout myRegistry` | Logout from a specified registry         |

### Docker Images

#### 5. docker build

- `docker build` is used to build custom Docker images from a Dockerfile.
- Syntax:`docker build -t <your_image_name> <options> <dockerfile_path>`
- Use cases:

| ID  | Command                                      | Description                                                |
| --- | -------------------------------------------- | ---------------------------------------------------------- |
| 1   | `docker build -t myImage .`                  | Build an image using a Dockerfile in the current directory |
| 2   | `docker build -t myImage:v0.1.0 .`           | Build a Docker image from a Dockerfile with specified tag  |
| 3   | `docker build -t myImage -f demo/Dockerfile` | Build an image using a Dockerfile in the demo directory    |

#### 6. docker tag

- `docker tag` allows you to create a new tag for an existing Docker image.
- Syntax: `docker tag <source_image> <target_image>`
- Use cases:

| ID  | Command                                              | Description                                                                     |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `docker tag myImage:latest myImage:v2`               | Create a new tag "v2" for the Docker image "myImage" with tag "latest"          |
| 2   | `docker tag myImage:latest myRegistry/myImage`       | Tag the Docker image "myImage" with tag "latest" to a registry image tag latest |
| 3   | `docker tag myImage:latest myRegistry/myImage:1.0.0` | Tag the Docker image "myImage" with tag "latest" to a registry image tag 1.0.0  |

#### 7. docker images

- The `docker images` command lists all Docker images pulled and built on your system. You'll use this frequently to view images before running containers or cleaning up.
- Syntax: `docker images <options>`
- Use cases:

| ID  | Command            | Description                                         |
| --- | ------------------ | --------------------------------------------------- |
| 1   | `docker images`    | List all Docker images on the system                |
| 2   | `docker images -a` | List all Docker images, including intermediate ones |

#### 8. docker pull

- To download an image from a registry like Docker Hub, use `docker pull`. For example, `docker pull nginx` fetches the latest nginx image.
- Syntax: `docker pull <image_name>`
- Use cases:

| ID  | Command                              | Description                                            |
| --- | ------------------------------------ | ------------------------------------------------------ |
| 1   | `docker pull nginx`                  | Pull the latest nginx image from Docker Hub            |
| 2   | `docker pull nginx:latest`           | Pull the latest nginx image from Docker Hub explicitly |
| 3   | `docker pull myRegistry/myImage:tag` | Pull a specific image from a private registry          |

#### 9. docker push

- `docker push` is used to upload Docker images to a registry.
- Syntax: `docker push <image_name>`
- Use cases:

| ID  | Command                              | Description                                                                 |
| --- | ------------------------------------ | --------------------------------------------------------------------------- |
| 1   | `docker push myImage`                | Push the "myImage" image to the default registry                            |
| 2   | `docker push myRegistry/myImage:tag` | Push a specific tagged version of the "myImage" image to a private registry |

#### 10. docker save

- To save a Docker image to a .tar file, use `docker save`. This command allows you to export an image from your local Docker environment into a portable format.
- Syntax: `docker save -o <output_file> <image_name>`
- Use cases:

| ID  | Command                                      | Description                                         |
| --- | -------------------------------------------- | --------------------------------------------------- |
| 1   | `docker save -o myImage.tar myImage`         | Save a Docker image to a local .tar file            |
| 2   | `docker save -o /path/to/output.tar myImage` | Save an image to a specific location on your system |

#### 11. docker load

- To load an image from a saved archive, use `docker load`. This command is handy when you have an image saved as a .tar file and want to import it into your local Docker environment.
- Syntax: `docker load -i <path_to_image_archive>`
- Use cases:

| ID  | Command                                     | Description                                           |
| --- | ------------------------------------------- | ----------------------------------------------------- |
| 1   | `docker load -i myImage.tar`                | Load a Docker image from a local .tar file            |
| 2   | `docker load -i /path/to/image_archive.tar` | Load an image from a specific location on your system |

#### 12. docker rmi

- `docker rmi` removes one or more Docker images. Make sure there are no stopped containers based on an image before removing it.
- Syntax: `docker rmi <image_name>`
- Use cases:

| ID  | Command                  | Description                                             |
| --- | ------------------------ | ------------------------------------------------------- |
| 1   | `docker rmi myImage`     | Remove the Docker image named "myImage"                 |
| 2   | `docker rmi myImage:tag` | Remove a specific tagged version of the "myImage" image |

### Docker Container

#### 13. docker run

- `docker run` creates and starts a new container from an image. You can pass various options to configure the container's networking, set environment variables, map volumes, and more.
- Syntax: `docker run <options> <image>`
- Use cases:

| ID  | Command                                                                      | Description                                                               |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | `docker run -d --name mycontainer nginx`                                     | Run nginx image in detached mode with container name "mycontainer"        |
| 2   | `docker run -p 8080:80 --name mycontainer nginx`                             | Run nginx image with port mapping from host 8080 to container 80          |
| 3   | `docker run -e MYSQL_ROOT_PASSWORD=password -v /mydata:/var/lib/mysql mysql` | Run MySQL image with setting root password                                |
| 4   | `docker run -v /mydata:/var/lib/mysql mysql`                                 | Run MySQL image and mounting a host directory to container                |
| 5   | `docker run --network=host myImage`                                          | Run a container using the host network                                    |
| 6   | `docker run --privileged myImage`                                            | Run a container with extended privileges using the Docker image "myImage" |
| 7   | `docker run -it myImage /bin/bash`                                           | Run an image and open a bash shell inside a container                     |

#### 14. docker ps

- Once you have containers running, you'll need `docker ps` to list them. The basic `docker ps` shows just running containers. Use `docker ps -a` to include stopped containers as well.
- Syntax: `docker ps <options>`
- Use cases:

| ID  | Command        | Description                                 |
| --- | -------------- | ------------------------------------------- |
| 1   | `docker ps`    | List running containers                     |
| 2   | `docker ps -a` | List all containers, including stopped ones |

#### 15. docker stop/start/restart

- These commands allow you to stop, start, or restart one or more running containers. You reference containers by name or ID.
- Syntax: `docker stop/start/restart <container_name>`
- Use cases:

| ID  | Command                      | Description                                   |
| --- | ---------------------------- | --------------------------------------------- |
| 1   | `docker stop mycontainer`    | Stop a running container named "mycontainer"  |
| 2   | `docker restart mycontainer` | Restart a container named "mycontainer"       |
| 3   | `docker start mycontainer`   | Start a stopped container named "mycontainer" |

#### 16. docker rm

- Once you've stopped a container, `docker rm` removes it entirely from your system. Use `docker rm -f` to force-remove running containers.
- Syntax: `docker rm <options> <container>`
- Use cases:

| ID  | Command                    | Description                                          |
| --- | -------------------------- | ---------------------------------------------------- |
| 1   | `docker rm mycontainer`    | Remove a stopped container named "mycontainer"       |
| 2   | `docker rm -f mycontainer` | Force-remove a running container named "mycontainer" |

#### 17. docker logs

- When a containerized application is not behaving correctly, `docker logs` retrieves the logs from a specified container to help troubleshoot.
- Syntax: `docker logs <options> <container>`
- Use cases:

| ID  | Command                              | Description                                        |
| --- | ------------------------------------ | -------------------------------------------------- |
| 1   | `docker logs mycontainer`            | Retrieve logs from a container named "mycontainer" |
| 2   | `docker logs --tail 100 mycontainer` | Retrieve last 100 lines of logs from "mycontainer" |

#### 18. docker exec

- `docker exec` allows you to run a new command inside an already-running container. For example, starting a Bash shell with `docker exec -it <container> /bin/bash`.
- Syntax: `docker exec <options> <container> <command>`
- Use cases:

| ID  | Command                                 | Description                                      |
| --- | --------------------------------------- | ------------------------------------------------ |
| 1   | `docker exec -it mycontainer /bin/bash` | Start an interactive Bash shell in "mycontainer" |
| 2   | `docker exec mycontainer ls -l /app`    | List files in directory "/app" in "mycontainer"  |

#### 19. docker cp

- `docker cp` allows you to copy files and directories between a container and the local filesystem.
- Syntax: `docker cp <container_id_or_name>:<source_path> <destination_path>`
- Use cases:

| ID  | Command                                                | Description                                                                             |
| --- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | `docker cp mycontainer:/app/logs/log.txt ./local_dir/` | Copy the file "log.txt" from the container "mycontainer" to a local directory           |
| 2   | `docker cp ./local_file.txt mycontainer:/app/data/`    | Copy the file "local_file.txt" from the local filesystem to the container "mycontainer" |

### Docker cleanup

#### 20. docker system prune

- `docker system prune` allows you to clean up unused data in your Docker environment.
- Syntax: `docker system prune <options>`
- Use cases:

| ID  | Command                  | Description                                                               |
| --- | ------------------------ | ------------------------------------------------------------------------- |
| 1   | `docker system prune`    | Remove all stopped containers, dangling images, and unused networks       |
| 2   | `docker system prune -a` | Remove all stopped containers, all unused images, and all unused networks |

### What's next?

- For the full list of docker commands, visit: https://docs.docker.com/reference/cli/docker/
- You could the most comprehensive and up-to-date content on this topic, please visit this [**repo**] (https://github.com/tungbq/devops-basics/blob/main/topics/docker/basics/top-docker-cmd.md) ⭐️.

Which Docker command do you find yourself using the most? Let us know in the comments below. Your feedback and suggestions are highly appreciated. Thank you, and happy coding! 💖

## Dynatrace

> **Source:** [Dynatrace](https://github.com/tungbq/devops-basics/tree/main/topics/dynatrace) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Dynatrace?

#### Overview

- Dynatrace is a revolutionary platform that delivers analytics and automation for unified observability and security.

- Source: https://docs.dynatrace.com/docs/get-started/what-is-dynatrace

#### Official Website of Dynatrace

- https://www.dynatrace.com/

#### Official Documentation of Dynatrace

- https://docs.dynatrace.com/docs

#### What you can do with Dynatrace

- See details at: https://docs.dynatrace.com/docs/shortlink/intro#get-started-with-the-platform

### 2. Prerequisites

- Basic knowledge of application and infrastructure monitoring.

### 3. Installation

#### How to Install Dynatrace?

1. **Sign up for Dynatrace** if you don't already have an account, sign up for a free trial

   - https://www.dynatrace.com/trial

2. **Install OneAgent** by following the official steps to enable monitoring for hosts, applications, and containers:
   - [Dynatrace OneAgent Installation Guide](https://docs.dynatrace.com/docs/setup-and-configuration/dynatrace-oneagent/installation-and-operation)

### 4. Basics of Dynatrace

#### Get started with Dynatrace

- https://docs.dynatrace.com/docs/get-started

#### Dynatrace quick start guide

To start using Dynatrace, just create a free trial account, install OneAgent on a host, and see how Dynatrace immediately shows you the health and performance of that host.

- Follow this useful guide: https://docs.dynatrace.com/docs/get-started/get-started

#### Dynatrace Hands-On

- See: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/dynatrace/basics)

### 5. More...

#### Dynatrace Cheatsheet

- N/A

#### Recommended Books

- N/A

### Dynatrace Basics
You can get started and hands on with Dynatrace via following guide:
- Dynatrace quick start guide: https://docs.dynatrace.com/docs/discover-dynatrace/get-started/get-started
- Create an alerting profile: https://docs.dynatrace.com/docs/analyze-explore-automate/notifications-and-alerting/alerting-profiles#create-an-alerting-profile
- Send Dynatrace notifications via email: https://docs.dynatrace.com/docs/analyze-explore-automate/notifications-and-alerting/problem-notifications/email-integration
- Identity and access management: https://docs.dynatrace.com/docs/manage/identity-access-management

## ELK Stack

> **Source:** [ELK Stack](https://github.com/tungbq/devops-basics/tree/main/topics/elk) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is ELK?

- https://www.elastic.co/what-is/elk-stack

#### Overview

- Elasticsearch is the heart of the free and open Elastic Stack
- Discover, iterate, and resolve with ES|QL on Kibana

#### ELK Architecture

![elk_architecture](https://github.com/tungbq/devops-basics/blob/main/assets/images/elk/elk_architecture.png)

#### Official website documentation of ELK

- https://www.elastic.co/guide/index.html

### 2. Prerequisites

- N/A

### 3. Installation

#### How to install ELK?

- Installing the Elastic Stack: https://www.elastic.co/guide/en/elastic-stack/current/installing-elastic-stack.html

### 4. Basics of ELK

#### Getting started with ELK

- Refer to the [Official ELK getting started documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html) for a comprehensive introduction.

#### ELK Hello World

- Check the [helloworld/](https://github.com/tungbq/devops-basics/blob/main/topics/elk/basics/helloworld) directory to create a simple ELK demo.

### 5. Beyond the Basics

#### Hands-On Example

- Explore a practical hands-on example in the [ELK hands-on](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) for more ELK concepts

### 6. More

#### ELK learning resource

- N/A

#### Recommended Books

- N/A

## Flux CD

> **Source:** [Flux CD](https://github.com/tungbq/devops-basics/tree/main/topics/fluxcd) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is FluxCD?

- https://fluxcd.io/docs/

##### Overview

Flux is a CNCF-graduated, GitOps continuous delivery tool for Kubernetes. It keeps a cluster's state in sync with a source of truth stored in Git (or an OCI artifact / Helm repository) — you declare what you want deployed, Flux reconciles the cluster to match, on a schedule and automatically, with no `kubectl apply` in your deploy pipeline.

Flux is built as a set of specialized Kubernetes controllers, each with its own CRDs:

- **source-controller** — fetches artifacts (Git repos, Helm repos, OCI repos, S3 buckets) and makes them available as revisions
- **kustomize-controller** — applies Kustomize overlays from a source to the cluster, and prunes resources removed from Git
- **helm-controller** — reconciles `HelmRelease` resources by installing/upgrading Helm charts from a source
- **notification-controller** — sends events to Slack, Discord, webhooks, etc. and receives inbound webhooks to trigger reconciliation

This is the same category as ArgoCD (see the [`argocd`](https://github.com/tungbq/devops-basics/blob/main/topics/argocd) topic) — both are GitOps engines for Kubernetes — but Flux is CLI/CRD-first (no bundled UI by default) and composes independent controllers you can install individually, rather than one monolithic application.

##### FluxCD Architecture

```
 Git repo / Helm repo / OCI repo / S3 bucket
             │
             │ polls on --interval
             ▼
     ┌───────────────────┐
     │  source-controller │  fetches + verifies, exposes as a
     │                    │  versioned "Artifact"
     └─────────┬──────────┘
               │ Artifact (revision)
     ┌─────────┴──────────┐        ┌──────────────────────┐
     │ kustomize-controller│        │   helm-controller     │
     │  applies Kustomize   │       │  installs/upgrades    │
     │  overlays, prunes    │       │  HelmReleases         │
     │  removed resources   │       │                       │
     └─────────┬────────────┘       └───────────┬───────────┘
               │                                 │
               └───────────────┬─────────────────┘
                                ▼
                        Kubernetes cluster
                                │
                                ▼
                  ┌──────────────────────────┐
                  │  notification-controller  │  events out (Slack/
                  │                           │  webhook), triggers in
                  └──────────────────────────┘
```

##### Official Documentation

- https://fluxcd.io/docs/
- GitHub: https://github.com/fluxcd/flux2

#### 2. Prerequisites

- A Kubernetes cluster (this topic uses a local [`kind`](https://github.com/tungbq/devops-basics/blob/main/topics/k8s) cluster — no cloud account needed)
- `kubectl` configured against that cluster
- Familiarity with the [`git`](https://github.com/tungbq/devops-basics/blob/main/topics/git) and [`k8s`](https://github.com/tungbq/devops-basics/blob/main/topics/k8s) topics helps, but isn't required

#### 3. Installation

##### How to install the Flux CLI?

```bash
# macOS / Linux
curl -s https://fluxcd.io/install.sh | sudo bash

# macOS via Homebrew
brew install fluxcd/tap/flux

# Verify
flux version --client
```

- Official install guide: https://fluxcd.io/flux/installation/

##### Check your cluster is ready for Flux

```bash
flux check --pre
```

#### 4. Basics of FluxCD

##### Getting started with FluxCD

- To get started visit [`basics/`](https://github.com/tungbq/devops-basics/blob/main/topics/fluxcd/basics) — a runnable script that installs Flux's controllers on a local `kind` cluster and syncs a real public repo ([stefanprodan/podinfo](https://github.com/stefanprodan/podinfo)) without needing a GitHub token or full `flux bootstrap`.

##### FluxCD Hello World

```bash
# Install Flux's controllers (source, kustomize, helm, notification)
flux install

# Point Flux at a Git repo — no PAT needed for a public repo
flux create source git podinfo \
  --url=https://github.com/stefanprodan/podinfo \
  --branch=master \
  --interval=1m

# Tell Flux to apply a path from that repo, and keep the cluster in sync
flux create kustomization podinfo \
  --target-namespace=default \
  --source=podinfo \
  --path="./kustomize" \
  --prune=true \
  --interval=10m

# Watch it reconcile
flux get sources git
flux get kustomizations
kubectl get deployments -n default
```

#### 5. Beyond the Basics

##### `flux bootstrap` — the production pattern

The commands above (`flux create source git` + `flux create kustomization`) are the fastest way to see Flux work, but production setups almost always use `flux bootstrap`, which additionally:

- commits Flux's own manifests into your Git repo (so Flux manages itself via GitOps too)
- sets up a deploy key / GitHub App so Flux can push status commits back
- is idempotent — safe to re-run against an existing cluster

```bash
export GITHUB_TOKEN=<your-pat>
flux bootstrap github \
  --owner=<your-github-username> \
  --repository=<your-fleet-repo> \
  --branch=main \
  --path=clusters/my-cluster \
  --personal
```

##### Multi-tenancy and multiple environments

Flux's `Kustomization` and `GitRepository` are namespaced CRDs, so a common pattern is one `flux-system` per cluster with per-team or per-environment `Kustomization`s pointing at different paths (`clusters/staging`, `clusters/production`) of the same monorepo — see the [official multi-tenancy guide](https://fluxcd.io/flux/installation/configuration/multitenancy/).

##### Automating image updates

Flux's [image automation controllers](https://fluxcd.io/flux/components/image/) can watch a container registry and open a commit against your Git repo whenever a new image tag matching a policy is pushed — closing the loop from CI (build+push image) to CD (Flux picks it up) without a separate deploy step.

##### Hands-On Examples

- See: [practice/](https://github.com/tungbq/devops-basics/blob/main/topics/fluxcd/practice)

#### 6. More

##### FluxCD Cheatsheet

```bash
# Sources
flux get sources git                    # list Git sources and their sync status
flux reconcile source git podinfo       # force an immediate re-sync

# Kustomizations
flux get kustomizations                 # list Kustomizations and their apply status
flux reconcile kustomization podinfo    # force an immediate re-apply
flux suspend kustomization podinfo      # pause reconciliation
flux resume kustomization podinfo       # resume reconciliation

# Everything at once
flux get all -A

# Logs (useful when a Kustomization is stuck)
flux logs --follow --tail=50

# Tear down
flux delete kustomization podinfo
flux delete source git podinfo
flux uninstall --namespace=flux-system
```

##### Recommended Resources

- [Flux Documentation](https://fluxcd.io/docs/)
- [Flux GitHub](https://github.com/fluxcd/flux2)
- [Flux vs ArgoCD comparison (official FAQ)](https://fluxcd.io/docs/faq/#flux-vs-argo-cd)

### Basics of FluxCD

#### Demo

Run `./fluxcd_sync_demo.sh` to spin up (or reuse) a local `kind` cluster, install Flux's controllers, and point Flux at a real public Git repo ([stefanprodan/podinfo](https://github.com/stefanprodan/podinfo)) — no GitHub token and no full `flux bootstrap` needed for this demo. You'll see Flux fetch the repo, apply its Kubernetes manifests, and bring up a running deployment, purely from a Git source it polls on an interval.

##### Requirements

- `docker`
- `kind` (the script creates a `fluxcd-demo` cluster if one doesn't already exist — https://kind.sigs.k8s.io/docs/user/quick-start/#installation)
- `kubectl`
- `flux` CLI (see the [installation section](https://github.com/tungbq/devops-basics/blob/main/topics/fluxcd/README.md) in the parent topic)

##### Cleanup

The script prints the teardown commands at the end rather than running them automatically, so you can poke around the live cluster first:

```bash
flux delete kustomization podinfo --silent
flux delete source git podinfo --silent
kind delete cluster --name fluxcd-demo
```

## Google Cloud

> **Source:** [Google Cloud](https://github.com/tungbq/devops-basics/tree/main/topics/gcp) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is Google Cloud Platform (GCP)?

- https://cloud.google.com/docs/overview

##### Overview

Google Cloud Platform (GCP) is Google's suite of cloud computing services that runs on the same infrastructure that Google uses internally for its end-user products. GCP offers over 300 products across compute, storage, databases, networking, AI/ML, DevOps, and security.

##### Key GCP Services for DevOps

| Category | Service | Description |
|----------|---------|-------------|
| **Compute** | Compute Engine (GCE) | Virtual machines |
| **Compute** | Google Kubernetes Engine (GKE) | Managed Kubernetes |
| **Compute** | Cloud Run | Serverless containers |
| **Compute** | App Engine | PaaS platform |
| **Storage** | Cloud Storage (GCS) | Object storage |
| **Storage** | Persistent Disk | Block storage for VMs |
| **Database** | Cloud SQL | Managed relational DB |
| **Database** | Firestore / Bigtable | NoSQL databases |
| **Database** | BigQuery | Data warehouse / analytics |
| **Networking** | VPC | Virtual Private Cloud |
| **Networking** | Cloud Load Balancing | Global load balancer |
| **Networking** | Cloud DNS | Managed DNS |
| **CI/CD** | Cloud Build | Serverless CI/CD |
| **CI/CD** | Artifact Registry | Container/package registry |
| **Monitoring** | Cloud Monitoring | Metrics and alerting |
| **Monitoring** | Cloud Logging | Log management |
| **Monitoring** | Cloud Trace | Distributed tracing |
| **Security** | IAM | Identity and access management |
| **Security** | Secret Manager | Secrets storage |
| **IaC** | Deployment Manager | GCP-native IaC |

##### GCP Global Infrastructure

- **Regions**: 40+ geographic regions worldwide
- **Zones**: 3+ availability zones per region
- **Points of Presence**: 200+ edge locations (Cloud CDN)
- **Network**: Google's private global fiber network

##### Official Documentation

- https://cloud.google.com/docs

#### 2. Prerequisites

- Basic Linux command-line skills
- Understanding of cloud computing concepts
- Google account to access GCP Free Tier ($300 credit for new users)

#### 3. Installation

##### Install Google Cloud CLI (gcloud)

- Official guide: https://cloud.google.com/sdk/docs/install

```bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize and authenticate
gcloud init
gcloud auth login

# Set default project
gcloud config set project YOUR_PROJECT_ID

# Verify
gcloud version
gcloud config list
```

#### 4. Basics of GCP

##### GCP Hello World

- See: [basics/](https://github.com/tungbq/devops-basics/blob/main/topics/gcp/basics)

##### Essential gcloud Commands

```bash
# Authentication
gcloud auth login                        # Authenticate with browser
gcloud auth application-default login   # Set application credentials
gcloud auth list                         # List active accounts

# Project management
gcloud projects list                     # List all projects
gcloud config set project PROJECT_ID    # Set active project
gcloud config get-value project         # Show active project

# Compute Engine (VMs)
gcloud compute instances list           # List VM instances
gcloud compute instances create my-vm \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=debian-12 \
  --image-project=debian-cloud

# GKE
gcloud container clusters list          # List GKE clusters
gcloud container clusters create my-cluster \
  --zone=us-central1-a \
  --num-nodes=3
gcloud container clusters get-credentials my-cluster --zone=us-central1-a

# Cloud Storage
gsutil ls                               # List buckets
gsutil mb gs://my-bucket               # Create bucket
gsutil cp file.txt gs://my-bucket/     # Upload file
gsutil cat gs://my-bucket/file.txt     # Read file

# IAM
gcloud iam service-accounts list        # List service accounts
gcloud projects get-iam-policy PROJECT_ID  # View IAM policy
```

#### 5. Beyond the Basics

##### GKE (Google Kubernetes Engine) — Best-in-class Managed Kubernetes

```bash
# Create an Autopilot cluster (Google manages nodes)
gcloud container clusters create-auto my-autopilot-cluster \
  --region=us-central1

# Deploy an application
kubectl create deployment hello --image=us-docker.pkg.dev/google-samples/containers/gke/hello-app:1.0
kubectl expose deployment hello --type=LoadBalancer --port=80 --target-port=8080

# Get the external IP
kubectl get service hello
```

##### Cloud Run — Serverless Containers

```bash
# Deploy a container to Cloud Run
gcloud run deploy my-service \
  --image=gcr.io/cloudrun/hello \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated

# List services
gcloud run services list
```

##### Cloud Build — CI/CD

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/my-app', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/my-app']
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - run
      - --filename=kubernetes/
      - --image=gcr.io/$PROJECT_ID/my-app
      - --location=us-central1-a
      - --cluster=my-cluster
```

##### Terraform with GCP

```hcl
provider "google" {
  project = var.project_id
  region  = "us-central1"
}

resource "google_compute_instance" "vm" {
  name         = "my-vm"
  machine_type = "e2-micro"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }
}
```

##### Hands-On Examples

- See: [practice/](https://github.com/tungbq/devops-basics/blob/main/topics/gcp/practice)

#### 6. More

##### GCP Cheatsheet

- https://cloud.google.com/sdk/docs/cheatsheet

##### GCP Free Tier

- https://cloud.google.com/free — Always-free tier + $300 trial credit

##### Recommended Learning Paths

- [Google Cloud Skills Boost](https://www.cloudskillsboost.google/)
- [GCP Associate Cloud Engineer](https://cloud.google.com/certification/cloud-engineer)
- [GCP Professional DevOps Engineer](https://cloud.google.com/certification/cloud-devops-engineer)

##### Recommended Books

- [Google Cloud Platform in Action](https://www.manning.com/books/google-cloud-platform-in-action)

### Basics of GCP

#### Demo

Run `./gcp_helloworld.sh` to list projects, create a GCS bucket, upload a file, and clean up.

> **Prerequisite**: Run `gcloud auth login` and `gcloud config set project YOUR_PROJECT_ID` before running the demo.

## Git

> **Source:** [Git](https://github.com/tungbq/devops-basics/tree/main/topics/git) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Git?

- https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F

#### Overview

Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.

#### Git workflow

- ![Git workflow](https://github.com/kubernetes/community/blob/master/contributors/guide/git_workflow.png)

#### Official website documentation of Git

- https://git-scm.com/
- https://github.com/git-guides

### 2. Prerequisites

- Basic linux command line skill

### 3. Installation

#### How to install Git?

- https://github.com/git-guides/install-git

### 4. Basics of Git

#### Getting started with Git

- Visit https://git-scm.com/video/get-going for a comprehensive introduction.

#### Git Hello World

- Check the [helloworld/](https://github.com/tungbq/devops-basics/blob/main/topics/git/basics/hello-world) directory to create a simple Git demo.

### 5. Beyond the Basics

#### Hands-On Example

- Explore a practical hands-on example in the [Git hands-on](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) for more Git concepts

### 6. More

#### Git guides page

- https://github.com/git-guides

#### Git cheatsheet

- https://about.gitlab.com/images/press/git-cheat-sheet.pdf
- https://education.github.com/git-cheat-sheet-education.pdf

#### Recommended Books

- N/A

### Git basics

- Git basics: https://docs.github.com/en/get-started/git-basics
- Git Guide: https://github.com/git-guides

## GitHub Actions

> **Source:** [GitHub Actions](https://github.com/tungbq/devops-basics/tree/main/topics/github-action) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is GitHub Action?

- https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions

#### Overview

GitHub Actions is a continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline. You can create workflows that build and test every pull request to your repository, or deploy merged pull requests to production.

#### GitHub Action workflow

- N/A

#### Official website documentation of GitHub Action

- https://docs.github.com/en/enterprise-cloud@latest/actions

### 2. Prerequisites

- Basic linux command line skill, CICD, YAML

### 3. Installation

#### How to install GitHub Action?

- No need to install, it's built along with GitHub server

### 4. Basics of GitHub Action

#### Getting started with GitHub Action

- Visit https://docs.github.com/en/enterprise-cloud@latest/actions/quickstart for a comprehensive introduction.

#### GitHub Action Hello World

- Check the [basic/](https://github.com/tungbq/devops-basics/blob/main/topics/github-action/basics) directory to create a simple GitHub Action demo.

### 5. Beyond the Basics

#### Hands-On Example

- Explore a practical hands-on example in the [learn-github-actions](https://docs.github.com/en/enterprise-cloud@latest/actions/learn-github-actions) for more GitHub Action concepts

### 6. More...

#### Awesome GitHub workflow

- Visit [awesome-workflow](https://github.com/tungbq/awesome-workflow)

#### Recommended Books

- N/A

### Basics of GitHub Actrion

### Github Action - Helloworld

- Create new workflow

```
name: GitHub Actions Helloworld
on: [push]
jobs:
  Welcome-GitHub-Actions:
    runs-on: ubuntu-latest
    steps:
      - run: echo " Hello world! 🎉 The job was automatically triggered by a ${{ Github.event_name }} event."
```

## GitLab CI

> **Source:** [GitLab CI](https://github.com/tungbq/devops-basics/tree/main/topics/gitlabci) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Gitlab CI?

#### Overview

GitLab CI/CD is a software development tool that allows organizations to implement “continuous” methodologies, including continuous integration (CI), continuous delivery (CD), and continuous deployment (also abbreviated to CD).

#### Gitlab CI workflow

- N/A

#### Official website documentation of Gitlab CI

- https://docs.gitlab.com/ (CI/CD page)

### 2. Prerequisites

- Basic linux command line skill, CICD, YAML

### 3. Installation

#### How to install Gitlab CI?

##### Gitlab public

- Use https://gitlab.com/ (No need to install)

##### Gitlab self deployment

- https://docs.gitlab.com/ee/install/install_methods.html

### 4. Basics of Gitlab CI

#### Getting started with Gitlab CI

- Visit https://docs.gitlab.com/ee/ci/quick_start/ for a comprehensive introduction.

#### Gitlab CI Hello World

- Check the [basic/](https://github.com/tungbq/devops-basics/blob/main/topics/gitlabci/basics) directory to create a simple Gitlab CI demo.

### 5. Beyond the Basics

#### Hands-On Example

- Explore a practical hands-on example in the [Gitlab CI examples](https://docs.gitlab.com/ee/ci/examples/) for more Gitlab CI concepts
- Check the [advanced/](https://github.com/tungbq/devops-basics/blob/main/topics/gitlabci/advanced) for more Gitlab CI concepts

### 6. More...

#### Gitlab CI YAML syntax reference

- https://docs.gitlab.com/ee/ci/yaml/

#### Recommended Books

- N/A

## Grafana

> **Source:** [Grafana](https://github.com/tungbq/devops-basics/tree/main/topics/grafana) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Grafana?

- https://grafana.com/

#### Overview

- Grafana is an open-source platform for monitoring and observability that visualizes metrics, logs, and traces from various data sources.

#### Official website documentation of Grafana

- https://grafana.com/docs/

### 2. Prerequisites

- N/A

### 3. Installation

#### How to install Grafana?

- Installing Grafana: https://grafana.com/docs/grafana/latest/installation/

### 4. Basics of Grafana

#### Getting started with Grafana

- Refer to the [Official Grafana getting started documentation](https://grafana.com/docs/grafana/latest/getting-started/) for a comprehensive introduction.

#### Grafana Hello World

- Check the [helloworld/](https://github.com/tungbq/devops-basics/blob/main/topics/grafana/basics/helloworld) directory to create a simple Grafana demo (with Prometheus as data source).

### 5. Beyond the Basics

#### Hands-On Example

- Explore a practical hands-on example in the [Grafana hands-on](https://grafana.com/tutorials/) for more Grafana concepts

### 6. More

#### Grafana learning resource

- N/A

#### Recommended Books

- N/A

## Groovy

> **Source:** [Groovy](https://github.com/tungbq/devops-basics/tree/main/topics/groovy) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is Groovy?

##### Overview

- Groovy is a powerful, optionally typed and dynamic language, with static-typing and static compilation capabilities, for the Java platform aimed at improving developer productivity thanks to a concise, familiar and easy to learn .
- Groovy is being used for developing the Jenkins pipeline, so it better if we have the knowledge about this language

##### Groovy workflow

- N/A

##### Official website documentation of Groovy

- https://groovy-lang.org/documentation.html

#### 2. Prerequisites

- N/A

#### 3. Installation

##### How to install Groovy?

- See https://groovy-lang.org/install.html (I prefer using SDK man)
- Facing missing java issue while installing: Visit: [groovy-with-sdk-missing-java.md](https://github.com/tungbq/devops-basics/blob/main/troubleshooting/installation/groovy-with-sdk-missing-java.md)

#### 4. Basics of Groovy

##### Groovy Hello World

- Check the [basic/](https://github.com/tungbq/devops-basics/blob/main/topics/groovy/basics) directory to create a simple Groovy demo.

#### 5. Beyond the Basics

##### Hands-On Example

- TODO

#### 6. More...

##### Groovy extra resources

- TODO

##### Recommended Books

- TODO

### Install groovy
- See: [groovy guide](https://github.com/tungbq/devops-basics/blob/main/topics/groovy/README.md)

### Run the example
- E.g: `groovy basic-concept.groovy`

## HAProxy

> **Source:** [HAProxy](https://github.com/tungbq/devops-basics/tree/main/topics/haproxy) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is HAProxy?

##### Overview

HAProxy is a free and open source software that provides a high availability load balancer and Proxy for TCP and HTTP-based applications that spreads requests across multiple servers. It is written in C and has a reputation for being fast and efficient.

##### Official website documentation of HAProxy

- https://HAProxy.org/

#### 2. Prerequisites

- Basic networking, HTTP, Linux

#### 3. Installation

##### How to install HAProxy?

- https://github.com/haproxy/haproxy/tree/master?tab=readme-ov-file#installation

##### Install HAProxy with Docker

- https://hub.docker.com/_/haproxy

#### 4. Basics of HAProxy

##### HAProxy lab

- See: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/haproxy/basics)

#### 5. Beyond the Basics

##### Hands-On Example

- Check the [advanced/](https://github.com/tungbq/devops-basics/blob/main/topics/haproxy/advanced) directory for more HAProxy examples.

#### 6. More...

##### Admin guide

- https://docs.haproxy.org/dev/management.html

##### HAProxy cheatsheet

- https://docs.haproxy.org/dev/configuration.html

##### Recommended Books

- N/A

### HA proxy basics demo

#### 1. Labs stack

- [nginx-webserver1](https://nginx.org/): An Ubuntu VM running in nginx webserver.
- [nginx-webserver2](https://nginx.org/): An Ubuntu VM running in nginx webserver.
- [haproxy](https://www.haproxy.org/): HA proxy points to 2 these web servers.

#### 2. Setup

##### Prerequisites

- Docker + Docker Compose

##### Build and run the containers

- Option-1: Build and run in background (Recommend)

```bash
cd devops-basics/topics/haproxy/basics/
docker-compose up --build -d

# To stop and remove contaienr, run:
docker compose down
```

- Option-2: Run and verbose the logs

```bash
cd devops-basics/topics/haproxy/basics/
docker-compose up --build

# To stop, press 'Ctrl + C'
```

#### 3. Explore the HA proxy

- Access the HA Proxy at http://localhost:6081 (You can replace 6081 by the port work on your machine!)
- Refresh the page multiple time and you would see that the HA Proxy route to `nginx-webserver1` and `nginx-webserver2` in Round Robin mode.

  ![nginx-webserver1](https://github.com/tungbq/devops-basics/blob/main/topics/haproxy/basics/assets/server1.png)
  ![nginx-webserver2](https://github.com/tungbq/devops-basics/blob/main/topics/haproxy/basics/assets/server2.png)

- Now try to stop the `nginx-webserver1` and refresh the page http://localhost:6081, it will check and only route to `nginx-webserver2`

  ```bash
  docker stop nginx-webserver1
  ```

  ![nginx-webserver1](https://github.com/tungbq/devops-basics/blob/main/topics/haproxy/basics/assets/server2.png)
  ![nginx-webserver2](https://github.com/tungbq/devops-basics/blob/main/topics/haproxy/basics/assets/server2.png)

## Helm

> **Source:** [Helm](https://github.com/tungbq/devops-basics/tree/main/topics/helm) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Helm?

#### Overview

- Helm is the package manager for Kubernetes

#### Helm workflow

![helm_workflow](https://v2.helm.sh/img/chart-illustration.png)

#### Official website documentation of Helm

- https://helm.sh/docs/

### 2. Prerequisites

- K8s, docker, linux

### 3. Installation

#### How to install Helm?

- https://helm.sh/docs/intro/install/

### 4. Basics of Helm

#### Helm quick start

- https://helm.sh/docs/intro/quickstart/

#### Helm Hello World

- Check the [basic/](https://github.com/tungbq/devops-basics/blob/main/topics/helm/basics) directory to create a simple Helm demo.

### 5. Beyond the Basics

#### Hands-On Example

- Check the [advanced/](https://github.com/tungbq/devops-basics/blob/main/topics/helm/advanced) directory for more Helm examples.

### 6. More...

#### Helm cheatsheet

- https://helm.sh/docs/intro/cheatsheet/

#### Recommended Books

- TODO

### Helm basics

- Use some helm basics commands: [helm-helloworld.sh](https://github.com/tungbq/devops-basics/blob/main/topics/helm/basics/helm-helloworld.sh)

## IIS

> **Source:** [IIS](https://github.com/tungbq/devops-basics/tree/main/topics/iis) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is IIS Webserver?

##### Overview

- IIS (Internet Information Services) is a flexible, secure, and manageable web server for hosting anything on the web. It is developed by Microsoft and runs on Windows operating systems.

- Source: https://learn.microsoft.com/en-us/iis/

##### Official Website of IIS

- https://www.iis.net/

##### Official Documentation of IIS

- https://learn.microsoft.com/en-us/iis/

##### What you can do with IIS Webserver

- IIS allows you to host websites, web applications, and services in a secure and efficient manner.
- It supports HTTP, HTTPS, FTP, SMTP, and more.
- See details at: https://learn.microsoft.com/en-us/iis/get-started/introduction-to-iis/

#### 2. Prerequisites

- Basic knowledge of web servers and hosting.
- A Windows operating system capable of running IIS.

#### 3. Installation

##### How to Install IIS?

1. **Enable IIS on Windows** by following these steps:

   - Open the Control Panel and go to **Programs** > **Programs and Features** > **Turn Windows features on or off**.
   - Check the box for **Internet Information Services**.
   - Click **OK** to install IIS.

   - [Detailed Guide](https://learn.microsoft.com/en-us/iis/install/installing-iis-7/)

2. **Verify Installation** by opening your browser and navigating to `http://localhost`. If IIS is installed correctly, you will see the default IIS welcome page.

#### 4. Basics of IIS Webserver

##### Get started with IIS

- https://learn.microsoft.com/en-us/iis/get-started/

##### IIS quick start guide

- Learn the basics of configuring IIS, adding websites, and managing them:
   - [IIS Quick Start](https://learn.microsoft.com/en-us/iis/get-started/getting-started-with-iis/getting-started-with-the-iis-manager-in-iis-7-and-iis-8)

##### IIS Hands-On

- See: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/iis/basics)

#### 5. More...

##### IIS Cheatsheet

- N/A

##### Recommended Books

- **Professional IIS 8** by Ken Schaefer.
- **Internet Information Services (IIS) 7.0 Resource Kit** by Microsoft Corporation.

### IIS Webserver Basics

This section covers the fundamental concepts and steps to get started with IIS Webserver. Whether you're new to IIS or looking for a refresher, you'll find the basics here.

---

#### 1. Getting Started with IIS

##### Launch the IIS Manager

1. Open the **Run** dialog by pressing `Win + R` and type `inetmgr`.
2. Press **Enter** to open the IIS Manager.

##### Add a Website in IIS

1. In IIS Manager:
   - Right-click on **Sites** in the left-hand navigation pane.
   - Select **Add Website**.
2. Fill in the required details:
   - **Site Name**: Choose a unique name for your site.
   - **Physical Path**: Set the directory where your website files are stored.
   - **Binding**: Specify the protocol, IP address, and port (e.g., HTTP on port 80).
3. Click **OK** to add the website.

##### Test the Website

1. Open a browser and navigate to the hostname or IP address you configured (e.g., `http://localhost`).
2. Verify that your website is loading successfully.

---

#### 2. Configuring IIS

##### Enable Directory Browsing

1. Select your site in IIS Manager.
2. Double-click **Directory Browsing** under the IIS section.
3. Click **Enable** in the Actions pane.

##### Configure Application Pools

- **What is an Application Pool?**
  An application pool isolates one or more applications from others running on the same server.

1. In IIS Manager, click **Application Pools** in the left-hand navigation pane.
2. Right-click on an application pool and select **Add Application Pool**.
3. Provide a name and select the appropriate .NET Framework version (if applicable).
4. Click **OK**.

---

#### 3. Deploying a Simple HTML Website

1. Create an HTML file named `index.html` with the following content:

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Welcome to IIS</title>
   </head>
   <body>
       <h1>Hello, IIS is running your site!</h1>
   </body>
   </html>
```

## Istio

> **Source:** [Istio](https://github.com/tungbq/devops-basics/tree/main/topics/istio) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Istio?

#### What is a Service Mesh?

- A service mesh is a dedicated infrastructure layer that you can add to your applications. It allows you to transparently add capabilities like observability, traffic management, and security, without adding them to your own code
- Source: [what-is-a-service-mesh](https://istio.io/latest/about/service-mesh/#what-is-a-service-mesh)

#### Overview

- Istio is a service mesh
- Istio extends Kubernetes to establish a programmable, application-aware network using the powerful Envoy service proxy.
- Working with both Kubernetes and traditional workloads, Istio brings standard, universal traffic management, telemetry, and security to complex deployments.

#### Istio Architecture

![istio-architecture](https://istio.io/latest/docs/ops/deployment/architecture/arch.svg)
(Source image: https://istio.io/latest/docs/ops/deployment/architecture/)

#### Official website documentation of Istio

- Visit https://istio.io/latest/

### 2. Installation

#### How to install Istio?

- https://istio.io/latest/docs/setup/install/

### 3. Basics of Istio

#### Getting started with Istio

- https://istio.io/latest/docs/setup/getting-started/

### 4. Beyond the Basics

#### Exploring Advanced Examples

- TODO

### 5. More...

#### Istio cheatsheet

- https://istio.io/latest/docs/reference/commands/

#### Istio with Azure

- https://github.com/Azure-Samples/aks-istio-addon-bicep
- https://learn.microsoft.com/en-us/azure/aks/istio-about

#### Google Cloud Platform Istio Demo

- [service-mesh-istio](https://github.com/GoogleCloudPlatform/microservices-demo/blob/main/kustomize/components/service-mesh-istio/README.md)

#### Recommended Books

- N/A

### Istio basics

- Sidecar mode getting started: https://istio.io/latest/docs/setup/getting-started/

## Jenkins

> **Source:** [Jenkins](https://github.com/tungbq/devops-basics/tree/main/topics/jenkins) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is Jenkins?

##### Overview

- The leading open source automation server, Jenkins provides hundreds of plugins to support building, deploying and automating any project.

##### Jenkins workflow

- N/A

##### Official website documentation of Jenkins

- https://www.jenkins.io/doc/

#### 2. Prerequisites

- K8s, docker, linux

#### 3. Installation

##### How to install Jenkins?

- https://www.jenkins.io/doc/book/installing/

##### Install Jenkins with Docker

- See [deploy-jenkins/README.md](https://github.com/tungbq/devops-basics/blob/main/topics/helm/advanced/hands-on/deploy-jenkins/README.md)

#### 4. Basics of Jenkins

##### Jenkins getting started

- https://www.jenkins.io/doc/book/pipeline/getting-started/

##### Jenkins Hello World

- See: [Jenkins Hello world](https://github.com/tungbq/devops-basics/blob/main/topics/jenkins/basics/README.md)

#### 5. Beyond the Basics

##### Hands-On Example

- Check the [advanced/](https://github.com/tungbq/devops-basics/blob/main/topics/jenkins/advanced) directory for more Jenkins examples.

#### 6. More...

##### Jenkins cheatsheet

- N/A

##### Recommended Books

- N/A

### Hello world Jenkins

#### Install Jenkins

- https://www.jenkins.io/doc/book/installing/
- Or install Jenkins via Helm hands on example of this DevOps repo, see [helm/hands-on/deploy-jenkins](https://github.com/tungbq/devops-basics/blob/main/topics/helm/advanced/hands-on/deploy-jenkins)

#### Create and run your first pipeline

- Follow [Official Getting Started](https://www.jenkins.io/doc/book/pipeline/getting-started/) section to create your first pipeline
- The pipeline content look like: [MyFirstPipeline.groovy](https://github.com/tungbq/devops-basics/blob/main/topics/jenkins/basics/MyFirstPipeline.groovy)

## Kubernetes

> **Source:** [Kubernetes](https://github.com/tungbq/devops-basics/tree/main/topics/k8s) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Kubernetes

#### Overview

- Kubernetes, also known as K8s, is an open-source system for automating deployment, scaling, and management of containerized applications.

#### Kubernetes Architecture

![k8s-architecture](https://d33wubrfki0l68.cloudfront.net/2475489eaf20163ec0f54ddc1d92aa8d4c87c96b/e7c81/images/docs/components-of-kubernetes.svg)
(Source provided by https://kubernetes.io/docs/concepts/overview/components/)

#### Official website documentation of Kubernetes

- Visit https://kubernetes.io/

### 2. Installation

#### How to install Kubernetes?

- Dev/Local environment: https://kubernetes.io/docs/tasks/tools/#kubectl
- Production environment: https://kubernetes.io/docs/setup/production-environment
- Create your own cluster on AWS: https://github.com/tungbq/devops-project/tree/main/projects/create-k8s-cluster-aws-ec2
- Deploy a Production Ready Kubernetes Cluster: https://github.com/kubernetes-sigs/kubespray

#### K8s cluster setup tool

- [kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/)
- [kOps](https://kops.sigs.k8s.io/)

### 3. Basics of Kubernetes

#### Getting started with Kubernetes

- https://kubernetes.io/docs/tutorials/kubernetes-basics/
- https://spacelift.io/blog/kubernetes-tutorial

#### K8s Helloword ⭐

- Run [k8s-helloworld.sh](https://github.com/tungbq/devops-basics/blob/main/topics/k8s/basics/helloworld/k8s-helloworld.sh)
- Cleanup [k8s-helloworld-cleanup.sh](https://github.com/tungbq/devops-basics/blob/main/topics/k8s/basics/helloworld/k8s-helloworld-cleanup.sh) after demo comple

### 4. Beyond the Basics

#### Exploring Advanced Examples

- Checkout [advanced](https://github.com/tungbq/devops-basics/blob/main/topics/k8s/advanced)

#### kube101 labs

- Visit: https://ibm.github.io/kube101/

#### K8sHub

- Visit: https://github.com/tungbq/K8sHub

### 5. More

#### Kubernetes cheatsheet

- https://kubernetes.io/docs/reference/kubectl/cheatsheet/

#### Kubernetes Learning Path

- https://github.com/techiescamp/kubernetes-learning-path

#### Azure Kubernetes Service (AKS)

- [azure/aks](https://learn.microsoft.com/en-us/azure/aks/)
- [aks-cicd-azure-pipelines](https://learn.microsoft.com/en-us/azure/architecture/guide/aks/aks-cicd-azure-pipelines)

#### Recommended Books

- N/A

## Kafka

> **Source:** [Kafka](https://github.com/tungbq/devops-basics/tree/main/topics/kafka) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Apache Kafka?

- [Introduction to Apache Kafka](https://kafka.apache.org/documentation/)
- [Youtube - What is Apache Kafka?](https://youtu.be/vHbvbwSEYGo?si=SbouSV-0NZzigsXV)

#### Overview

- Apache Kafka is a distributed event streaming platform capable of handling trillions of events a day. It is used for building real-time data pipelines and streaming applications. Kafka is horizontally scalable, fault-tolerant, and fast.

- Kafka allows you to publish, subscribe to, store, and process streams of records in real-time. It is often used in scenarios where data needs to be processed or moved between systems efficiently, such as log aggregation, real-time analytics, or as a backbone for microservices.

#### Kafka Architecture

- [Understanding Kafka Architecture](https://kafka.apache.org/10/documentation/streams/architecture)

#### Official Website Documentation for Apache Kafka

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)

### 2. Prerequisites

- Basic Linux command line skills
- Understanding of distributed systems and event streaming concepts

### 3. Installation

#### How to install Apache Kafka?

- [Kafka Quickstart Guide](https://kafka.apache.org/quickstart)

### 4. Basics of Apache Kafka

#### Getting Started with Kafka

- [Kafka 101: Getting Started with Kafka](https://kafka.apache.org/quickstart)

#### Kafka Basics 👋

- See: [**basic**](https://github.com/tungbq/devops-basics/blob/main/topics/kafka/basics)

### 5. Beyond the Basics

- TODO

### 6. More...

#### Kafka cheatsheet

- https://www.redpanda.com/guides/kafka-tutorial-kafka-cheat-sheet

#### Recommended Books

- N/A

### Kafka Basics

Here's a basic "Hello World" example for Apache Kafka using Docker and Docker Compose. This will set up a Kafka broker and a Zookeeper instance, allowing you to produce and consume messages.

#### 1. Create a `docker-compose.yml` File

Create a [docker-compose.yml](https://github.com/tungbq/devops-basics/blob/main/topics/kafka/basics/docker-compose.yml) file that defines the services for Zookeeper and Kafka.

#### 2. Start Kafka and Zookeeper

Run the following command to start the Kafka and Zookeeper containers:

```bash
cd devops-basics/topics/kafka/basic
docker-compose up -d
```

This command will start Zookeeper and Kafka in the background.

#### 3. Create a Kafka Topic

Once the containers are running, create a Kafka topic named `helloworld`.

```bash
docker exec kafka kafka-topics.sh --create --topic helloworld --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

#### 4. Produce Messages to the Kafka Topic

To send a message to the `helloworld` topic:

```bash
docker exec -it kafka kafka-console-producer.sh --topic helloworld --bootstrap-server localhost:9092
```

Type a message (e.g., `Hello, Kafka!`) and press Enter. This sends the message to the Kafka topic.

#### 5. Consume Messages from the Kafka Topic

To read the message from the `helloworld` topic:

```bash
docker exec -it kafka kafka-console-consumer.sh --topic helloworld --bootstrap-server localhost:9092 --from-beginning
```

You should see the message you produced earlier.

#### 6. Cleanup

To stop and remove the Kafka and Zookeeper containers, run:

```bash
cd devops-basics/topics/kafka/basic
docker-compose down
```

This basic setup allows you to get hands-on experience with Kafka using Docker and Docker Compose. You can extend this setup to explore more advanced Kafka features.

## Microservices

> **Source:** [Microservices](https://github.com/tungbq/devops-basics/tree/main/topics/microservices) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### Docs

- https://www.nginx.com/blog/deploying-microservices/

#### 1. Microservices Demo

- Check out [GoogleCloudPlatform/microservices-demo](https://github.com/GoogleCloudPlatform/microservices-demo)
- Also check out [Azure-Samples/aks-store-demo](https://github.com/Azure-Samples/aks-store-demo/tree/main)

#### 2. Microservices architecture design (by Azure)

- Microservices architecture design: https://learn.microsoft.com/en-us/azure/architecture/microservices/
- aks-microservices: [aks-microservices](https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks-microservices/aks-microservices)
- https://dotnet.microsoft.com/en-us/learn/aspnet/microservices-architecture

#### 3. Hands-on

##### Basics

- Checkout [basics](https://github.com/tungbq/devops-basics/blob/main/topics/microservices/basics) content

### Demo microservices

- Using GCP demo: https://github.com/GoogleCloudPlatform/microservices-demo
- Manifest: https://github.com/GoogleCloudPlatform/microservices-demo/blob/main/release/kubernetes-manifests.yaml

#### 1. Provision K8s cluster

- Find the installation via [k8s](https://github.com/tungbq/devops-basics/blob/main/topics/k8s) content

#### 2. Run hello microservices script

Prerequisite:

- A k8s cluster up and running (step 1)

Run:

```bash
./hello-microservices.sh
```

This will deploy the application then forward the service to port `8080` (or you could adjust to another port works with you machine)

#### 3. Check the result

Visit localhost:8080, you should get the similar result like this:

![first-demo-microservices-result](https://github.com/tungbq/devops-basics/blob/main/topics/microservices/assets/first-demo-microservices-result.png)

#### 4. Cleanup

Run:

```bash
./cleanup-hello-microservices.sh
```

## Nginx

> **Source:** [Nginx](https://github.com/tungbq/devops-basics/tree/main/topics/nginx) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is Nginx?

##### Overview

- The leading open source automation server, Nginx provides hundreds of plugins to support building, deploying and automating any project.

##### Nginx workflow

- N/A

##### Official website documentation of Nginx

- https://nginx.org/

#### 2. Prerequisites

- Basic networking, HTTP, Linux

#### 3. Installation

##### How to install Nginx?

- https://nginx.org/en/docs/install.html

##### Install Nginx with Docker

- TODO

#### 4. Basics of Nginx

##### Nginx getting started

- Begginner's Guide: https://nginx.org/en/docs/beginners_guide.html

##### Nginx Hello World

- See: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/nginx/basics)

#### 5. Beyond the Basics

##### Hands-On Example

- Check the [advanced/](https://github.com/tungbq/devops-basics/blob/main/topics/nginx/advanced) directory for more Nginx examples.

#### 6. More...

##### Admin guide

- https://docs.nginx.com/nginx/admin-guide/

##### Nginx cheatsheet

- N/A

##### Recommended Books

- N/A

### Nginx demo with docker compose

- Prerequisites:
  - Docker + Docker compose installed
- This setup will include two services: one for NGINX and another for a simple web server (e.g., an HTTP server running in a Python container).
- Main files:

  - [nginx.conf](https://github.com/tungbq/devops-basics/blob/main/topics/nginx/basics/nginx.conf): Contains basic NGINX configuration
  - [html](https://github.com/tungbq/devops-basics/blob/main/topics/nginx/basics/html): Contains HTML file for web server running with python
  - [docker-compose.yaml](https://github.com/tungbq/devops-basics/blob/main/topics/nginx/basics/docker-compose.yaml): To deploy 2 separated containers for this demo (Nginx + HTTP web server)

- Run the hands on:

  ```bash
  cd devops-basics/topics/nginx/basic
  docker-compose up -d
  ```

- Now you'll have an NGINX server acting as a reverse proxy to another web server running in a separate Docker container.
- Visit: http://localhost:7080/ you could see:

  ![demo_nginx_basic_ok](https://github.com/tungbq/devops-basics/blob/main/topics/nginx/basics/assets/demo_nginx_basic_ok.png)

  _NOTE_: You can change the localhost port from `7080` to any port works on your machine, and update the port definition in `docker-compose.yaml` as well.

- To cleanup resouce, run:

  ```bash
  cd devops-basics/topics/nginx/basic
  docker-compose down
  ```

## OpenStack

> **Source:** [OpenStack](https://github.com/tungbq/devops-basics/tree/main/topics/openstack) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is Openstack?

##### Overview

OpenStack is a cloud operating system that controls large pools of compute, storage, and networking resources throughout a datacenter, all managed through a dashboard that gives administrators control while empowering their users to provision resources through a web interface.

##### Openstack Architecture

For a deeper understanding, refer to the [Openstack Architecture documentation](https://www.openstack.org/openstack-map).

##### Official website documentation of Openstack

- Access the complete [Official Openstack documentation](https://docs.openstack.org/2023.2/) for detailed information and references.

#### 2. Prerequisites

- OS/Linux and Cloud concepts

#### 3. Installation

##### How to install Openstack?

- Follow the steps outlined in the [Openstack installation documentation](https://docs.openstack.org/2023.2/install/) for both local development and production environments.
- Or use the installation script in [basics](https://github.com/tungbq/devops-basics/blob/main/topics/openstack/basics)

#### 4. Basics of Openstack

##### Getting started with Openstack

- Refer to the [official Openstack getting started documentation](https://docs.openstack.org/install-guide/get-started-with-openstack.html) for a comprehensive introduction.

##### Openstack Hello World

- Run the [basic/openstack-helm.sh](https://github.com/tungbq/devops-basics/blob/main/topics/openstack/basics/openstack-helm.sh) script to execute a simple Openstack "Hello World" demonstration.

#### 5. Beyond the Basics

##### Hands-On Example

- TODO

#### 6. More

##### Openstack Cheatsheet

- Use the [Openstack cheatsheet](https://ubuntu.com/openstack/openstack-cheat-sheet) as a quick reference guide for Openstack commands and functionalities.

##### Recommended Books

- [OpenStack Cloud Computing Cookbook - Fourth Edition](https://a.co/d/34FukGa)

### Getting started with Openstack

Deploy openstack on Kubernetes.
Documentation: https://docs.openstack.org/openstack-helm/latest/install/index.html

#### Deploy on k8s cluster (with Helm)

- Run command:

```
cd ./basic
chmod +x cleanup.sh
./cleanup.sh

chmod +x openstack-helm.sh
./openstack-helm.sh
```

## OpenTofu

> **Source:** [OpenTofu](https://github.com/tungbq/devops-basics/tree/main/topics/opentofu) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is OpenTofu?

- https://opentofu.org/docs/intro/

##### Overview

OpenTofu is an open-source Infrastructure as Code (IaC) tool that is a fork of Terraform, maintained by the Linux Foundation. It was created in response to HashiCorp's license change from MPL to the Business Source License (BSL) in August 2023.

OpenTofu is:
- **Drop-in replacement for Terraform**: Fully compatible with existing Terraform configurations (HCL syntax, providers, modules, state files)
- **Open source**: Licensed under MPL 2.0, governed by the Linux Foundation
- **Community-driven**: Backed by major companies including AWS, Google, IBM, Red Hat, and many others
- **Feature-rich**: Includes all Terraform features plus new additions like state encryption and enhanced test framework

##### OpenTofu vs Terraform

| Feature | OpenTofu | Terraform |
|---------|----------|-----------|
| License | MPL 2.0 (open source) | BSL 1.1 (source available) |
| Governance | Linux Foundation | HashiCorp / IBM |
| State encryption | ✅ Built-in | ❌ Not available |
| Provider compatibility | ✅ Same as Terraform | ✅ Native |
| Module registry | registry.opentofu.org | registry.terraform.io |
| Community | Open contributors | HashiCorp-controlled |

##### Official Documentation

- https://opentofu.org/docs/

#### 2. Prerequisites

- Basic Linux command-line skills
- Understanding of Infrastructure as Code concepts
- Cloud provider account (AWS, Azure, or GCP) for cloud examples

#### 3. Installation

##### Install OpenTofu

- Official guide: https://opentofu.org/docs/intro/install/

```bash
# macOS
brew install opentofu

# Linux (official installer)
curl --proto '=https' --tlsv1.2 -fsSL https://get.opentofu.org/install-opentofu.sh | sh

# Verify installation
tofu version
```

##### Migrate from Terraform

```bash
# OpenTofu is CLI-compatible with Terraform
# Simply replace 'terraform' with 'tofu' in your commands
terraform init    →  tofu init
terraform plan    →  tofu plan
terraform apply   →  tofu apply
terraform destroy →  tofu destroy
```

#### 4. Basics of OpenTofu

##### OpenTofu Hello World

- See: [basics/](https://github.com/tungbq/devops-basics/blob/main/topics/opentofu/basics)

##### Core Workflow

```bash
# Initialize working directory (downloads providers)
tofu init

# Preview infrastructure changes
tofu plan

# Apply the changes
tofu apply

# Show current state
tofu show

# Destroy all managed infrastructure
tofu destroy
```

##### Basic Configuration Example

```hcl
# main.tf
terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

resource "local_file" "hello" {
  content  = "Hello from OpenTofu!"
  filename = "${path.module}/hello.txt"
}

output "file_content" {
  value = local_file.hello.content
}
```

#### 5. Beyond the Basics

##### State Encryption (OpenTofu-exclusive feature)

```hcl
# Encrypt state with a passphrase (OpenTofu only)
terraform {
  encryption {
    key_provider "pbkdf2" "my_passphrase" {
      passphrase = var.state_passphrase
    }
    method "aes_gcm" "my_method" {
      keys = key_provider.pbkdf2.my_passphrase
    }
    state {
      method = method.aes_gcm.my_method
    }
  }
}
```

##### Testing with OpenTofu

```hcl
# tests/basic.tftest.hcl
run "verify_file_created" {
  command = apply

  assert {
    condition     = local_file.hello.content == "Hello from OpenTofu!"
    error_message = "File content does not match expected value"
  }
}
```

##### Hands-On Examples

- See: [practice/](https://github.com/tungbq/devops-basics/blob/main/topics/opentofu/practice)

#### 6. More

##### OpenTofu Cheatsheet

```bash
tofu init          # Initialize directory
tofu validate      # Validate configuration
tofu plan          # Show execution plan
tofu apply         # Apply changes
tofu apply -auto-approve  # Apply without confirmation
tofu destroy       # Destroy infrastructure
tofu state list    # List resources in state
tofu state show <resource>  # Show resource details
tofu output        # Show output values
tofu fmt           # Format configuration files
```

##### Recommended Resources

- [OpenTofu Official Docs](https://opentofu.org/docs/)
- [OpenTofu GitHub](https://github.com/opentofu/opentofu)
- [OpenTofu Registry](https://registry.opentofu.org/)
- [Migration Guide from Terraform](https://opentofu.org/docs/intro/migration/)

### Basics of OpenTofu

#### Demo

Run `./opentofu_helloworld.sh` to create a simple local file resource with OpenTofu.

## Packer

> **Source:** [Packer](https://github.com/tungbq/devops-basics/tree/main/topics/packer) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is Packer?

##### Overview

- Packer is a tool that lets you create identical machine images for multiple platforms from a single source template.
- Packer can create golden images to use in image pipelines.

##### Official website documentation of Packer

- https://www.packer.io/

#### 2. Prerequisites

- N/A

#### 3. Installation

##### How to install Packer?

- https://developer.hashicorp.com/packer/install

#### 4. Basics of Packer

##### Packer getting started

- Begginner's Guide: https://developer.hashicorp.com/packer/tutorials

##### Packer Hands on

- See: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/packer/basics)

#### 5. More...

##### Packer cheatsheet

- N/A

##### Recommended Books

- N/A

### Build an Ubuntu machine image on AWS with Packer

#### Prerequisites

- AWS account
- Packer installed
- Authenticate to AWS
  ```bash
  export AWS_ACCESS_KEY_ID="<YOUR_AWS_ACCESS_KEY_ID>"
  export AWS_SECRET_ACCESS_KEY="<YOUR_AWS_SECRET_ACCESS_KEY>"
  ```
- Doc: https://developer.hashicorp.com/packer/integrations/hashicorp/amazon#iam-task-or-instance-role

#### Init

```bash
packer init .
```

#### Build

```bash
packer build aws-ubuntu.pkr.hcl

# ...
# ==> Wait completed after 5 minutes 15 seconds
# ==> Builds finished. The artifacts of successful builds are:
# --> learn-packer.amazon-ebs.ubuntu: AMIs were created:
# us-west-2: ami-xxxxyyyyzzzztttt
```

#### Verify

- Go to AWS Console `us-west-2` (The region we build packer AMI): https://us-west-2.console.aws.amazon.com/ec2/home?region=us-west-2#Images:visibility=owned-by-me
- You now can see your AMI with name: `learn-packer-linux-aws-redis-<timestamp>`
  ![](https://github.com/tungbq/devops-basics/blob/main/topics/packer/basics/assets/ami-on-aws.png)

#### Cleanup

- Once you dont want to use the AMI anymore, follow https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/deregister-ami.html to delete it.

## Prometheus

> **Source:** [Prometheus](https://github.com/tungbq/devops-basics/tree/main/topics/prometheus) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Prometheus?

- https://prometheus.io/docs/introduction/overview/#what-is-prometheus

#### Overview

- Prometheus is an open-source systems monitoring and alerting toolkit originally built at SoundCloud.

#### Prometheus architecture

- (Image source provided by https://prometheus.io/docs/introduction/overview/#architecture)

#### Official website documentation of Prometheus

- https://prometheus.io/docs/introduction/overview/

### 2. Prerequisites

- Linux, Helm, k8s

### 3. Installation

#### How to install Prometheus?

- https://prometheus.io/docs/prometheus/latest/installation/

### 4. Basics of Prometheus

#### Prometheus getting started

- https://prometheus.io/docs/prometheus/latest/getting_started/

#### Prometheus Hello World

- Required knowledge in [helm](https://github.com/tungbq/devops-basics/blob/main/topics/helm) | [k8s](https://github.com/tungbq/devops-basics/blob/main/topics/k8s) first for better understanding. Because we will deploy our own Prometheus to K8s using Helm
- Run the demo scipt: `cd basic; ./prometheus-helloworld.sh`
- (Optional) Run the demo scipt and cleanup right after the demo: `cd basic; ./prometheus-helloworld.sh true`

### 5. Beyond the Basics

#### Hands-On Example

- Check the [advanced/](https://github.com/tungbq/devops-basics/blob/main/topics/prometheus/advanced) directory for more Prometheus examples.

### 6. More...

#### Prometheus cheatsheet

- https://promlabs.com/promql-cheat-sheet/

#### Recommended Books

- N/A

## Python

> **Source:** [Python](https://github.com/tungbq/devops-basics/tree/main/topics/python) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Python?

#### Overview

- Python's combination of simplicity, power, extensive libraries, community support, and adaptability to various DevOps tasks makes it a go-to language for many professionals in this field.
- Its effectiveness in automating workflows, managing infrastructure, and integrating with a plethora of tools solidifies its role as a key player in the DevOps landscape.

#### Python workflow

- N/A

#### Official website documentation of Python

- https://www.python.org/doc/

### 2. Prerequisites

- N/A

### 3. Installation

#### How to install Python?

- Visit the Python Downloads Page to access the latest version of Python suitable for your operating system.
- https://www.python.org/downloads/

### 4. Basics of Python

#### Python getting started

- If you're new to Python, the Python Official Getting Started Guide provides comprehensive insights into setting up and beginning your Python journey.
- https://www.python.org/about/gettingstarted/

#### Python Hello World

- Explore the [helloworld.py](https://github.com/tungbq/devops-basics/blob/main/topics/python/basics/helloworld.py) file in the helloworld directory to get a basic introduction to running a Python script.
- Run `cd helloworld; python3 helloworld.py`

### 5. Beyond the Basics

#### Hands-On Example

- Find more examples at [advanced](https://github.com/tungbq/devops-basics/blob/main/topics/python/advanced)

### 6. More...

#### Python cheatsheet

- https://www.pythoncheatsheet.org/

#### Recommended Books

- N/A

## Shell

> **Source:** [Shell](https://github.com/tungbq/devops-basics/tree/main/topics/shell) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Shell?

#### Overview

- A shell script is a computer program designed to be run by a Unix shell, a command-line interpreter. The various dialects of shell scripts are considered to be scripting languages.
- Typical operations performed by shell scripts include file manipulation, program execution, and printing text. A script which sets up the environment, runs the program, and does any necessary cleanup or logging, is called a wrapper.

#### Shell workflow

- N/A

#### Official website documentation of Shell

- https://en.wikipedia.org/wiki/Shell_script

### 2. Prerequisites

- K8s, docker, linux

### 3. Installation

#### How to install Shell?

- Just install Linux then you would have shell enviroment as well

### 4. Basics of Shell

#### Shell getting started

- https://www.shellscript.sh/

#### Shell Hello World

- See: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/shell/basics)

### 5. Beyond the Basics

#### Hands-On Example

- Do more practice execises at [advanced](https://github.com/tungbq/devops-basics/blob/main/topics/shell/advanced)

### 6. More...

#### Shell cheatsheet

- N/A

#### Recommended Books

- N/A

## Snyk

> **Source:** [Snyk](https://github.com/tungbq/devops-basics/tree/main/topics/snyk) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### Snyk

#### 1. What is Snyk?

##### Overview

The **Snyk** platform quickly finds and fixes security issues in proprietary code, open source dependencies, container images, and cloud infrastructure so businesses can build security directly into their continuous development process.
Source: https://snyk.io/about/

##### Official Website of Snyk

- https://snyk.io/

##### Official Documentation of Snyk

- https://docs.snyk.io/

##### What You Can Do with Snyk

- Scan and fix vulnerabilities in application code, dependencies, Docker images, and IaC (Terraform, Kubernetes, etc.).
- Integrate security into your CI/CD pipelines.
- Monitor projects for newly disclosed vulnerabilities.
- Collaborate across Dev, Sec, and Ops teams.

Learn more: https://snyk.io/product/

---

#### 2. Prerequisites

- Basic understanding of software development, dependencies, and build tools (npm, Maven, Docker, etc.).
- Node.js installed (required for Snyk CLI).
- Git (for scanning Git-based repositories).
- A free Snyk account (sign up at https://snyk.io/login).

---

#### 3. Installation

##### How to Install Snyk CLI?

1. **Install Node.js** (if not already installed):

   - https://nodejs.org/

2. **Install Snyk CLI**:

   ```bash
   npm install -g snyk
   ```

3. **Authenticate with Snyk**:
   ```bash
   snyk auth
   ```
   - This will open a browser for you to log in.

See more: https://snyk.io/platform/snyk-cli/

---

#### 4. Basics of Snyk

##### Getting started

- Getting started with https://docs.snyk.io/getting-started

##### Scanning Your Project

1. Navigate to your project directory:

   ```bash
   cd /path/to/your/project
   ```

2. Run a test:

   ```bash
   snyk test
   ```

3. To monitor the project continuously:
   ```bash
   snyk monitor
   ```

##### Fixing Vulnerabilities

- Use:
  ```bash
  snyk fix
  ```
  - Automatically applies safe upgrades and patches where possible.

##### Docker Image Scanning

```bash
snyk container test your-image:tag
```

##### IaC Scanning (Terraform, Kubernetes YAML, etc.)

```bash
snyk iac test
```

---

#### 5. Snyk Hands-On

- See: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/snyk/basics) for hands-on examples and test cases.

---

#### 6. More...

##### Recommended Resources

- [Snyk Open Source Guide](https://snyk.io/product/open-source-security-management/)

Coming soon

## Snyk DAST

> **Source:** [Snyk DAST](https://github.com/tungbq/devops-basics/tree/main/topics/snykdast) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is Snyk DAST?

- [Snyk Web Application Scanning Documentation](https://help.probely.com/en/)
- [Snyk Overview](https://snyk.io/product/dast-api-web/)

#### Overview

- Snyk DAST (Dynamic Application Security Testing) is a solution that enables developers and security teams to continuously scan, test, and monitor web applications and APIs for security vulnerabilities in running environments.
- The solution was previously known as **Probely** and is now integrated into the **Snyk platform**.

#### Key Features

- Covers both **web applications** and **APIs**
- Supports **authenticated** and **unauthenticated** scans
- Easy integration with CI/CD tools
- Provides **actionable recommendations** for vulnerabilities
- Supports **OpenAPI and Swagger** definitions for API scanning

#### Core Concepts Overview

- https://developers.probely.com/concepts/core-concepts-overview/

#### Official documentation

- [https://help.probely.com/en/](https://help.probely.com/en/)
- [https://snyk.io/product/dast-api-web/](https://snyk.io/product/dast-api-web/)

### 2. Getting Started

- https://help.probely.com/en/articles/9385585-getting-started-with-snyk-api-web

### 3. How to configure and scan an API

- https://help.probely.com/en/articles/4647855-how-to-configure-and-scan-an-api

## SonarQube

> **Source:** [SonarQube](https://github.com/tungbq/devops-basics/tree/main/topics/sonarqube) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### SonarQube

#### 1. What is SonarQube?

**Overview**
SonarQube is an open-source platform for **continuous inspection of code quality**. It performs **static code analysis** to detect bugs, vulnerabilities, code smells, and duplicated code across multiple languages.
It integrates with CI/CD pipelines to automatically scan your codebase, enforce quality gates, and monitor metrics such as code coverage over time.

> See: [https://www.sonarsource.com/products/sonarqube/](https://www.sonarsource.com/products/sonarqube/)

**SonarQube Diagram**

- Typical flow:
  Developer → Commit & Push → CI/CD runs build/tests → SonarScanner sends analysis to SonarQube → SonarQube evaluates against Quality Gate → Results in dashboard & PR comments.

**Official Website of SonarQube**
[https://www.sonarsource.com/products/sonarqube/](https://www.sonarsource.com/products/sonarqube/)

**Official Documentation**
[https://docs.sonarsource.com/sonarqube/](https://docs.sonarsource.com/sonarqube/)

#### 2. Prerequisites

To start working with SonarQube:

- A running SonarQube instance (local via Docker or remote server)
- SonarQube project key and token
- Basic knowledge of your project’s build tool (e.g., `dotnet`, Maven, Gradle, npm)
- Installed scanner for your tech stack:

  - **.NET**: `dotnet-sonarscanner`
  - **Generic**: `sonar-scanner` CLI

#### 3. SonarQube Basics

**Getting Started with SonarQube**
Start here: [https://docs.sonarsource.com/sonarqube-server/10.6/try-out-sonarqube/](https://docs.sonarsource.com/sonarqube-server/10.6/try-out-sonarqube/)

**Key Concepts:**

- **Project**: A codebase being analyzed.
- **Quality Profile**: Set of rules applied to a project’s language.
- **Quality Gate**: Pass/fail criteria for new code (e.g., coverage ≥ 80%).
- **Issues**: Findings categorized as Bugs, Vulnerabilities, or Code Smells.
- **New Code**: Recently added or changed code, usually compared to the main branch.

**Basics**

- Get hands-on with Sonarqube basics here: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/sonarqube/basics)

#### 4. Advanced Topics

**Custom Quality Gates**
Set rules like:

- No new critical issues
- New code coverage ≥ 80%
- New code duplication ≤ 3%

**Multi-Language Scans**
Analyze projects with multiple tech stacks in a single run (e.g., backend + frontend).

**SonarCloud**
Cloud-hosted alternative with built-in GitHub/Bitbucket/GitLab integration.
[https://sonarcloud.io/](https://sonarcloud.io/)

#### 5. More...

**SonarQube Developer Resources**

- [https://community.sonarsource.com/](https://community.sonarsource.com/)

**SonarQube practice**
- [https://github.com/SonarSource/sonar-scanning-examples](https://github.com/SonarSource/sonar-scanning-examples)

**Recommended Books**
N/A

### SonarQube Basics

Follow this lab: https://github.com/TheDevOpsHub/container-labs/tree/main/labs/sonar/sonar-basic to:

- Bring up the SonarQube + Postgres DB instances (docker containers)
- Build and scan sample DotNet project
- View the result on SonarQube dashboard
- And more...

## SQL

> **Source:** [SQL](https://github.com/tungbq/devops-basics/tree/main/topics/sql) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is MySQL

##### Overview

- MySQL, also known as K8s, is an open-source system for automating deployment, scaling, and management of containerized applications.

##### Official website documentation of MySQL

- Visit https://dev.mysql.com/doc/

#### 2. Installation

##### How to install MySQL?

- https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/

#### 3. Basics of MySQL

##### Getting started with MySQL

- https://dev.mysql.com/doc/mysql-getting-started/en/

##### MySQL Helloword ⭐

- Visit [mysql-basics](https://github.com/tungbq/devops-basics/blob/main/topics/sql/basics/README.md)

#### 4. Beyond the Basics

##### Exploring Advanced Examples

- Checkout [mysql-advanced](https://github.com/tungbq/devops-basics/blob/main/topics/sql/mysql-advanced.md)

#### 5. More

##### CS50x SQL

- [CS50x 2023 - Lecture 7 - SQL](https://www.youtube.com/live/zrCLRC3Ci1c?si=yCsB6cSRY5FqyOXd)

##### Recommended Books

- N/A

### MySQL basics

This hands-on will:

- Provisions a mysql instance with docker
- Creates a database named `sqldemodb`, a table named `users` with the specified columns, and shows how to verify the database and table creation.

#### Run and explore sql in docker container

```bash
docker run --name demo-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest

docker exec -it demo-mysql bash
# You now in the `bash-5.1#` container terminal

# Connect to SQL
mysql -uroot -p

# Creating new DB
CREATE DATABASE sqldemodb;

# Using the Database
USE sqldemodb;

# Creating a New Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL
);

# Verifying the Creation
SHOW DATABASES;
SHOW TABLES;
DESCRIBE users;
```

## SSH

> **Source:** [SSH](https://github.com/tungbq/devops-basics/tree/main/topics/ssh) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### SSH

#### 1. What is SSH?

##### Overview

- SSH (Secure Shell) is a network protocol that allows secure, encrypted communication between two systems over an unsecured network.
- It is most commonly used to remotely log into servers, execute commands, and transfer files (via SCP/SFTP), replacing older insecure protocols like Telnet and rlogin.
- SSH uses public-key cryptography to authenticate the remote computer and, optionally, to authenticate the user.

##### Official website documentation of SSH

- https://www.openssh.com/
- https://www.ssh.com/academy/ssh/protocol

#### 2. Prerequisites

- Basic Linux command line usage
- Basic understanding of networking (client-server model, ports)

#### 3. Installation

##### How to install SSH?

On most Linux distributions, the SSH client is installed by default. To install the SSH server:

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install openssh-server -y
sudo systemctl enable ssh
sudo systemctl start ssh

# RHEL/CentOS
sudo yum install openssh-server -y
sudo systemctl enable sshd
sudo systemctl start sshd
```

Verify it's running:
```bash
sudo systemctl status ssh
```

#### 4. Basics of SSH

##### Getting started with SSH

- To get started visit **topics/ssh/basics**

#### 5. Beyond the Basics

##### Exploring Advanced Examples

- To get more advanced examples/hands on visit **topics/ssh/advanced**

#### 6. More...

##### Cheatsheet

- `ssh user@host` — connect to a remote host
- `ssh -p 2222 user@host` — connect on a custom port
- `ssh-keygen -t ed25519` — generate a new key pair
- `ssh-copy-id user@host` — copy your public key to a remote host
- `scp file.txt user@host:/path/` — copy a file to a remote host
- `ssh -L 8080:localhost:80 user@host` — local port forwarding

##### Recommended Books

- "SSH Mastery" by Michael W Lucas

### SSH Basics

#### Generate an SSH key pair

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
This creates two files by default:
- `~/.ssh/id_ed25519` (private key — never share this)
- `~/.ssh/id_ed25519.pub` (public key — safe to share)

#### Copy your public key to a remote server

```bash
ssh-copy-id user@remote-host
```
This appends your public key to `~/.ssh/authorized_keys` on the remote host, enabling passwordless login.

#### Connect to a remote server

```bash
ssh user@remote-host
```

#### Connect using a specific key and port

```bash
ssh -i ~/.ssh/id_ed25519 -p 2222 user@remote-host
```

#### View known hosts

Every server you connect to gets fingerprinted in:
```bash
cat ~/.ssh/known_hosts
```

#### Copy files with SCP

```bash
scp localfile.txt user@remote-host:/home/user/
```

## Terraform

> **Source:** [Terraform](https://github.com/tungbq/devops-basics/tree/main/topics/terraform) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is Terraform?

- https://developer.hashicorp.com/terraform/intro

##### Overview

- HashiCorp Terraform is an infrastructure as code tool that lets you define both cloud and on-prem resources in human-readable configuration files that you can version, reuse, and share.
- You can then use a consistent workflow to provision and manage all of your infrastructure throughout its lifecycle. Terraform can manage low-level components like compute, storage, and networking resources, as well as high-level components like DNS entries and SaaS features.

##### Terraform workflow

- https://developer.hashicorp.com/terraform/intro#how-does-terraform-work

##### Official website documentation of Terraform

- https://developer.hashicorp.com/terraform/docs

#### 2. Prerequisites

- Basic linux command line skill and IaC concepts
- Cloud (if working with cloud provider)

#### 3. Installation

##### How to install Terraform?

- https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli

#### 4. Basics of Terraform

##### Terraform getting started

- https://developer.hashicorp.com/terraform/tutorials/aws-get-started

##### Terraform Hello World

- See: [basics](https://github.com/tungbq/devops-basics/blob/main/topics/terraform/basics)

#### 5. Beyond the Basics

##### Hands-On Example

- For more hands-on examples, visit [aws-lab-with-terraform projects](https://github.com/tungbq/aws-lab-with-terraform)

#### 6. More...

##### Looking for a Terraform sample project with best practice?

- Check out: [terraform-sample-project](https://github.com/tungbq/terraform-sample-project)

##### Terraform cheatsheet

- N/A

##### Recommended Books

- N/A

### Basics of Terraform

#### Demo

Run `./terraform-helloworld.sh`

## Trivy

> **Source:** [Trivy](https://github.com/tungbq/devops-basics/tree/main/topics/trivy) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is Trivy?

- https://trivy.dev/latest/docs/

##### Overview

Trivy is the world's most popular open-source vulnerability and misconfiguration scanner. Built by Aqua Security, it detects security issues across the entire software supply chain — container images, filesystems, Git repositories, Kubernetes clusters, and Infrastructure as Code.

Trivy scans for:
- **OS packages**: Alpine, Debian, Ubuntu, RHEL, CentOS, Amazon Linux, and more
- **Language-specific packages**: npm, pip, gem, cargo, go modules, Maven, NuGet
- **Infrastructure as Code**: Terraform, CloudFormation, Kubernetes, Helm, Dockerfile
- **Kubernetes misconfigurations**: NSA/CISA hardening guidelines, CIS benchmarks
- **Secrets**: Embedded credentials, API keys, tokens in code and images
- **Licenses**: Open source license compliance

##### Trivy Architecture

```
                ┌─────────────────────────────────────────┐
                │                Trivy CLI                 │
                │  ┌──────────┐  ┌───────────────────────┐│
Input ─────────►│  │  Scanner │  │      Detectors        ││
(image/fs/repo) │  │          │  │  - Vulnerabilities    ││
                │  │  ┌───────┤  │  - Misconfigurations  ││
                │  │  │Parser │  │  - Secrets            ││
                │  │  │ SBOM  │  │  - Licenses           ││
                │  └──┴───────┘  └───────────────────────┘│
                │         │                                │
                │  ┌──────▼──────────────────────────────┐ │
                │  │  Vulnerability DB (auto-updated)    │ │
                │  │  NVD, GitHub Advisory, OSV, RedHat  │ │
                │  └─────────────────────────────────────┘ │
                └─────────────────────────────────────────┘
```

##### Official Documentation

- https://trivy.dev/latest/docs/
- GitHub: https://github.com/aquasecurity/trivy

#### 2. Prerequisites

- Docker (to scan container images)
- Basic understanding of vulnerabilities and CVEs

#### 3. Installation

##### Install Trivy

```bash
# macOS
brew install trivy

# Linux (Ubuntu/Debian)
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update && sudo apt-get install trivy

# Docker
docker run aquasec/trivy

# Verify
trivy --version
```

- Official install guide: https://trivy.dev/latest/docs/getting-started/installation/

#### 4. Basics of Trivy

##### Trivy Hello World

- See: [basics/](https://github.com/tungbq/devops-basics/blob/main/topics/trivy/basics)

##### Scan a Container Image

```bash
# Scan an image for vulnerabilities
trivy image nginx:latest

# Scan only HIGH and CRITICAL
trivy image --severity HIGH,CRITICAL nginx:latest

# Output as JSON
trivy image --format json --output result.json nginx:latest

# Scan a local image
trivy image myapp:local
```

##### Scan a Filesystem or Repository

```bash
# Scan current directory
trivy fs .

# Scan a Git repository
trivy repo https://github.com/knqyf263/trivy-ci-test

# Scan for secrets
trivy fs --scanners secret .

# Scan IaC (Terraform, K8s manifests)
trivy config ./terraform/
```

##### Scan Kubernetes Cluster

```bash
# Scan entire cluster
trivy k8s --report summary cluster

# Scan a specific namespace
trivy k8s --namespace production --report all cluster

# Scan a specific workload
trivy k8s deployment/myapp
```

#### 5. Beyond the Basics

##### Integrate with GitHub Actions

```yaml
- name: Scan Docker image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:${{ github.sha }}'
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'CRITICAL,HIGH'

- name: Upload results to GitHub Security
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'trivy-results.sarif'
```

##### Generate SBOM (Software Bill of Materials)

```bash
# Generate SBOM in CycloneDX format
trivy image --format cyclonedx --output sbom.json nginx:latest

# Generate SBOM in SPDX format
trivy image --format spdx-json --output sbom.spdx.json nginx:latest
```

##### Policy as Code with Rego

```bash
# Use custom Rego policies for IaC scanning
trivy config --policy ./policies/ ./kubernetes/
```

##### Hands-On Examples

- See: [practice/](https://github.com/tungbq/devops-basics/blob/main/topics/trivy/practice)

#### 6. More

##### Trivy Cheatsheet

```bash
# Image scanning
trivy image <image>                           # Scan image
trivy image --severity HIGH,CRITICAL <image>  # Filter by severity
trivy image --ignore-unfixed <image>          # Skip unfixed CVEs
trivy image --format json <image>             # JSON output

# Filesystem scanning
trivy fs .                                    # Scan directory
trivy fs --scanners vuln,secret,config .     # All scanners

# Config/IaC scanning
trivy config ./                               # Scan IaC files

# Kubernetes
trivy k8s cluster --report summary           # Cluster summary
```

##### Recommended Resources

- [Trivy Documentation](https://trivy.dev/latest/docs/)
- [Trivy GitHub](https://github.com/aquasecurity/trivy)
- [Aqua Security Blog](https://www.aquasec.com/blog/)

### Basics of Trivy

#### Demo

Run `./trivy_scan_demo.sh` to scan a sample container image and filesystem for vulnerabilities.

## Vault

> **Source:** [Vault](https://github.com/tungbq/devops-basics/tree/main/topics/vault) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

#### 1. What is HashiCorp Vault?

- https://developer.hashicorp.com/vault/docs/what-is-vault

##### Overview

HashiCorp Vault is an identity-based secrets and encryption management system. It provides a secure, automated way to manage secrets, credentials, and sensitive data across dynamic cloud environments.

Key capabilities:
- **Secrets management**: Store and tightly control access to tokens, passwords, certificates, API keys, and other secrets
- **Dynamic secrets**: Generate secrets on-demand for AWS, databases, SSH, and more — they expire automatically
- **Data encryption**: Encrypt application data without storing it in Vault
- **Leasing and renewal**: All secrets in Vault have a lease; clients must renew before expiry
- **Revocation**: Revoke secrets individually or by tree, enabling rolling credential rotation

##### Vault Architecture

```
                ┌──────────────────────────────────────┐
                │              Vault Server             │
                │  ┌────────────┐  ┌─────────────────┐ │
Client ────────►│  │  Auth      │  │  Secret Engines │ │
                │  │  Methods   │  │  - KV, PKI      │ │
                │  │  - Token   │  │  - AWS, DB      │ │
                │  │  - AppRole │  │  - SSH, Transit │ │
                │  │  - K8s     │  └─────────────────┘ │
                │  └────────────┘                       │
                │  ┌─────────────────────────────────┐  │
                │  │        Storage Backend          │  │
                │  │  (Consul, Raft, S3, etcd...)    │  │
                │  └─────────────────────────────────┘  │
                └──────────────────────────────────────┘
```

##### Official Documentation

- https://developer.hashicorp.com/vault/docs

#### 2. Prerequisites

- Basic Linux command-line skills
- Understanding of secrets and credential management concepts
- Docker (for running Vault in dev mode)

#### 3. Installation

##### Install Vault CLI

- Official guide: https://developer.hashicorp.com/vault/install

```bash
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/vault

# Linux (Ubuntu/Debian)
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install vault
```

##### Run Vault in Dev Mode (Docker)

```bash
docker run --rm -p 8200:8200 \
  -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' \
  hashicorp/vault
```

#### 4. Basics of Vault

##### Vault Hello World

- See: [basics/](https://github.com/tungbq/devops-basics/blob/main/topics/vault/basics)

##### Common Vault Commands

```bash
# Set Vault address and token
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='myroot'

# Check status
vault status

# Write a secret
vault kv put secret/myapp username="admin" password="s3cr3t"

# Read a secret
vault kv get secret/myapp

# Read only a specific field
vault kv get -field=password secret/myapp

# List secrets
vault kv list secret/

# Delete a secret
vault kv delete secret/myapp
```

#### 5. Beyond the Basics

##### Dynamic Secrets (AWS)

Vault can generate short-lived AWS credentials on demand:

```bash
# Enable the AWS secrets engine
vault secrets enable -path=aws aws

# Configure AWS credentials
vault write aws/config/root access_key=$AWS_ACCESS_KEY secret_key=$AWS_SECRET_KEY

# Create a role
vault write aws/roles/my-role credential_type=iam_user policy_arns=arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess

# Generate credentials
vault read aws/creds/my-role
```

##### Vault with Kubernetes

- Official guide: https://developer.hashicorp.com/vault/docs/platform/k8s
- Use the Vault Agent Sidecar Injector or the Vault Secrets Operator to inject secrets into Pods

##### Vault with Terraform

```hcl
provider "vault" {
  address = "https://vault.example.com"
}

data "vault_kv_secret_v2" "example" {
  mount = "secret"
  name  = "myapp"
}
```

##### Hands-On Examples

- See: [practice/](https://github.com/tungbq/devops-basics/blob/main/topics/vault/practice)

#### 6. More

##### Vault Cheatsheet

- https://developer.hashicorp.com/vault/docs/commands

##### Recommended Books

- [HashiCorp Vault: Securing Secrets at Scale](https://www.oreilly.com/library/view/hashicorp-vault-securing/9781098116644/)

### Basics of Vault

#### Demo

Run `./vault_helloworld.sh` to start Vault in dev mode and write/read a secret.

## VirtualBox

> **Source:** [VirtualBox](https://github.com/tungbq/devops-basics/tree/main/topics/virtualbox) · [DevOps Basics](https://github.com/tungbq/devops-basics), Apache 2.0

### 1. What is VirtualBox?

#### Overview

- VirtualBox is an open-source virtualization software developed by Oracle. It allows users to run multiple operating systems simultaneously on a single machine by creating virtual machines (VMs). It's widely used for testing, development, and learning purposes.

#### Official Website of VirtualBox

- https://www.virtualbox.org/

#### Official Documentation of VirtualBox

- https://www.virtualbox.org/wiki/Documentation

---

### 2. Prerequisites

- Familiarity with operating systems (Linux/Windows/macOS).
- Understanding of virtualization concepts and networking basics.

---

### 3. Installation

#### How to Install VirtualBox?

1. **Download** VirtualBox from the official website:
   https://www.virtualbox.org/wiki/Downloads

2. **Select OS Package** (Windows, macOS, Linux distributions).

3. **Install** the downloaded package by following the installer steps for your operating system.

4. **Optional**: Install the VirtualBox Extension Pack for additional features like USB 3.0 support and RDP access:
   - https://www.virtualbox.org/wiki/Downloads

---

### 4. Basics of VirtualBox

#### VirtualBox Getting Started

- Official Beginner’s Guide:
  https://www.virtualbox.org/manual/ch01.html

#### VirtualBox Hands-On

- See: [basic setup and usage](https://github.com/tungbq/devops-basics/blob/main/topics/virtualbox/basics)

---

### 5. More...

#### VirtualBox Cheatsheet

- N/A

#### Recommended Books

- N/A

### VirtualBox Basics
You can get start and hands on with Virtual Box via following guide:
- Create Virtual Machine: https://www.virtualbox.org/manual/ch01.html#create-vm-wizard
- Create Ubuntu Virtual Machine:
  - https://ubuntu.com/tutorials/how-to-run-ubuntu-desktop-on-a-virtual-machine-using-virtualbox#1-overview
  - https://devopscube.com/virtual-box-tutorial/
